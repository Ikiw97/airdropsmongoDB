Script to migrate data from Google Sheets to MongoDB
Run this script once to migrate existing data

Usage:
1. Update GOOGLE_SCRIPT_URL with your Google Sheets URL
2. Update ADMIN_USERNAME with your desired admin username
3. Run: python migrate_data.py
"""

import os
import json
import requests
from pymongo import MongoClient
from passlib.context import CryptContext
from datetime import datetime
import uuid

# Configuration
GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz8UzQNHn1c7MlKqiU-1ikYp9-az0wCmS7H1pbZ5k8k2uic6pNbTeluSvNuJlhzTHPyUw/exec"
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "airdrop_tracker")

# Admin user details (change these!)
ADMIN_USERNAME = "admin"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin123"  # Change this to a secure password!

# Setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
client = MongoClient(MONGO_URL)
db = client[MONGO_DB_NAME]
users_collection = db["users"]
projects_collection = db["projects"]

def create_admin_user():
    """Create admin user if doesn't exist"""
    existing_admin = users_collection.find_one({"username": ADMIN_USERNAME})
    
    if existing_admin:
        print(f"✅ Admin user '{ADMIN_USERNAME}' already exists")
        return existing_admin["_id"]
    
    admin_id = str(uuid.uuid4())
    hashed_password = pwd_context.hash(ADMIN_PASSWORD)
    
    admin_user = {
        "_id": admin_id,
        "username": ADMIN_USERNAME,
        "email": ADMIN_EMAIL,
        "password_hash": hashed_password,
        "is_approved": True,
        "is_admin": True,
        "created_at": datetime.utcnow().isoformat()
    }
    
    users_collection.insert_one(admin_user)
    print(f"✅ Created admin user: {ADMIN_USERNAME}")
    print(f"   Email: {ADMIN_EMAIL}")
    print(f"   Password: {ADMIN_PASSWORD}")
    print(f"   ⚠️  IMPORTANT: Change the password after first login!")
    
    return admin_id

def migrate_projects(admin_id):
    """Fetch projects from Google Sheets and migrate to MongoDB"""
    try:
        print("\n📥 Fetching data from Google Sheets...")
        response = requests.get(f"{GOOGLE_SCRIPT_URL}?action=read", timeout=10)
        projects = response.json()
        
        if not isinstance(projects, list):
            print("❌ Invalid response from Google Sheets")
            return
        
        print(f"📊 Found {len(projects)} projects to migrate")
        
        migrated = 0
        skipped = 0
        
        for project in projects:
            if not project.get("name"):
                print(f"⚠️  Skipping project without name")
                skipped += 1
                continue
            
            # Check if project already exists
            existing = projects_collection.find_one({
                "user_id": admin_id,
                "name": project["name"]
            })
            
            if existing:
                print(f"⏭️  Skipping '{project['name']}' - already exists")
                skipped += 1
                continue
            
            # Parse tags
            tags = []
            if project.get("tags"):
                if isinstance(project["tags"], str):
                    try:
                        tags = json.loads(project["tags"])
                        if not isinstance(tags, list):
                            tags = [tags]
                    except:
                        tags = []
                elif isinstance(project["tags"], list):
                    tags = project["tags"]
            
            # Create project document
            project_doc = {
                "_id": str(uuid.uuid4()),
                "user_id": admin_id,
                "name": project["name"],
                "twitter": project.get("twitter", ""),
                "discord": project.get("discord", ""),
                "telegram": project.get("telegram", ""),
                "wallet": project.get("wallet", ""),
                "email": project.get("email", ""),
                "github": project.get("github", ""),
                "website": project.get("website", ""),
                "notes": project.get("notes", ""),
                "tags": tags,
                "daily": project.get("daily", "UNCHECKED"),
                "lastupdate": project.get("lastupdate", datetime.utcnow().isoformat())
            }
            
            projects_collection.insert_one(project_doc)
            print(f"✅ Migrated: {project['name']}")
            migrated += 1
        
        print(f"\n📊 Migration Summary:")
        print(f"   ✅ Migrated: {migrated} projects")
        print(f"   ⏭️  Skipped: {skipped} projects")
        
    except requests.exceptions.Timeout:
        print("❌ Request to Google Sheets timed out")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching from Google Sheets: {e}")
    except Exception as e:
        print(f"❌ Migration error: {e}")

def main():
    print("🚀 Starting Data Migration from Google Sheets to MongoDB")
    print("=" * 60)
    
    # Create admin user
    admin_id = create_admin_user()
    
    # Migrate projects
    migrate_projects(admin_id)
    
    print("\n" + "=" * 60)
    print("✅ Migration completed!")
    print("\nNext steps:")
    print("1. Start the backend server: cd /app/backend && python server.py")
    print("2. Login with admin credentials")
    print("3. Change the admin password immediately!")
    print("\nMongoDB Connection: " + MONGO_URL)
    print("Database: " + MONGO_DB_NAME)

if __name__ == "__main__":
    main()