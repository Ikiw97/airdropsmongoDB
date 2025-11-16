from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "airdrop_tracker")
client = MongoClient(MONGO_URL)
db = client[MONGO_DB_NAME]

# Collections
users_collection = db["users"]
projects_collection = db["projects"]

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 10080))

# Password Hashing (UPGRADED TO ARGON2)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Pydantic Models
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class ProjectCreate(BaseModel):
    name: str
    twitter: Optional[str] = ""
    discord: Optional[str] = ""
    telegram: Optional[str] = ""
    wallet: Optional[str] = ""
    email: Optional[str] = ""
    github: Optional[str] = ""
    website: Optional[str] = ""
    notes: Optional[str] = ""
    tags: Optional[List[str]] = []

class DailyUpdate(BaseModel):
    name: str
    value: str

class UserApproval(BaseModel):
    user_id: str

# Helper Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"_id": user_id})
    if user is None:
        raise credentials_exception
    
    if not user.get("is_approved", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending admin approval"
        )
    
    return user

async def get_current_admin(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# API Routes
@app.get("/")
async def root():
    return {"message": "Airdrop Tracker API", "status": "running"}

@app.post("/api/auth/register")
async def register(user_data: UserRegister):
    # Check if username exists
    if users_collection.find_one({"username": user_data.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email exists
    if users_collection.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if this is the first user (will be admin)
    is_first_user = users_collection.count_documents({}) == 0
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    user = {
        "_id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": hashed_password,
        "is_approved": is_first_user,  # First user auto-approved as admin
        "is_admin": is_first_user,
        "created_at": datetime.utcnow().isoformat()
    }
    
    users_collection.insert_one(user)
    
    if is_first_user:
        return {
            "message": "Admin account created successfully",
            "username": user_data.username,
            "is_admin": True
        }
    else:
        return {
            "message": "Registration successful. Please wait for admin approval.",
            "username": user_data.username,
            "is_admin": False
        }

@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = users_collection.find_one({"username": user_data.username})
    
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if not user.get("is_approved", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending admin approval. Please wait for approval."
        )
    
    access_token = create_access_token(data={"sub": user["_id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "username": user["username"],
            "email": user["email"],
                       "is_admin": user.get("is_admin", False)
        }
    }

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["_id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "is_admin": current_user.get("is_admin", False)
    }

# NEW: Get all users (pending and approved)
@app.get("/api/admin/users")
async def get_all_users(current_admin: dict = Depends(get_current_admin)):
    all_users = list(users_collection.find(
        {},
        {"password_hash": 0}
    ))
    return all_users

@app.get("/api/admin/pending-users")
async def get_pending_users(current_admin: dict = Depends(get_current_admin)):
    pending_users = list(users_collection.find(
        {"is_approved": False},
        {"password_hash": 0}
    ))
    return pending_users

@app.post("/api/admin/approve-user")
async def approve_user(approval: UserApproval, current_admin: dict = Depends(get_current_admin)):
    result = users_collection.update_one(
        {"_id": approval.user_id},
        {"$set": {"is_approved": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User approved successfully"}

@app.delete("/api/admin/reject-user/{user_id}")
async def reject_user(user_id: str, current_admin: dict = Depends(get_current_admin)):
    # Don't allow deleting admin users
    user = users_collection.find_one({"_id": user_id})
    if user and user.get("is_admin"):
        raise HTTPException(status_code=400, detail="Cannot delete admin user")
    
    result = users_collection.delete_one({"_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User rejected and deleted"}

# NEW: Delete approved user
@app.delete("/api/admin/delete-user/{user_id}")
async def delete_user(user_id: str, current_admin: dict = Depends(get_current_admin)):
    # Don't allow deleting admin users
    user = users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.get("is_admin"):
        raise HTTPException(status_code=400, detail="Cannot delete admin user")
    
    # Delete user's projects first
    projects_collection.delete_many({"user_id": user_id})
    
    # Delete user
    result = users_collection.delete_one({"_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User and their projects deleted successfully"}

@app.get("/api/projects")
async def get_projects(current_user: dict = Depends(get_current_user)):
    projects = list(projects_collection.find(
        {"user_id": current_user["_id"]},
        {"_id": 0}
    ))
    return projects

@app.post("/api/projects")
async def create_project(project: ProjectCreate, current_user: dict = Depends(get_current_user)):
    # Check if project name already exists for this user
    existing = projects_collection.find_one({
        "user_id": current_user["_id"],
        "name": project.name
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Project name already exists")
    
    project_data = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user["_id"],
        "name": project.name,
        "twitter": project.twitter,
        "discord": project.discord,
        "telegram": project.telegram,
        "wallet": project.wallet,
        "email": project.email,
        "github": project.github,
        "website": project.website,
        "notes": project.notes,
        "tags": project.tags,
        "daily": "UNCHECKED",
        "lastupdate": datetime.utcnow().isoformat()
    }
    
    projects_collection.insert_one(project_data)
    return {"message": "Project created successfully"}

@app.post("/api/projects/update-daily")
async def update_daily(update: DailyUpdate, current_user: dict = Depends(get_current_user)):
    result = projects_collection.update_one(
        {
            "user_id": current_user["_id"],
            "name": update.name
        },
        {
            "$set": {
                "daily": update.value,
                "lastupdate": datetime.utcnow().isoformat()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": "Daily status updated"}

@app.delete("/api/projects/{project_name}")
async def delete_project(project_name: str, current_user: dict = Depends(get_current_user)):
    result = projects_collection.delete_one({
        "user_id": current_user["_id"],
        "name": project_name
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": "Project deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
