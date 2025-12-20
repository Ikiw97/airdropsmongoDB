import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["*"],
  allowedHeaders: ["*"],
}));

// ==================== SECURITY HEADERS ====================
app.use((req, res, next) => {
  // Prevent clickjacking - must be set via headers, not meta tags
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Content Security Policy with frame-ancestors - must be set via headers
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://api.coingecko.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https: wss:; " +
    "frame-src 'self' https://trade.dedoo.xyz; " +
    "frame-ancestors 'self'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "upgrade-insecure-requests;"
  );

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Prevent DNS prefetching
  res.setHeader('X-DNS-Prefetch-Control', 'off');

  // Permissions Policy (modern alternative to Feature-Policy)
  res.setHeader('Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  next();
});

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "airdrop_tracker";
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_ALGORITHM = process.env.JWT_ALGORITHM || "HS256";
const JWT_ACCESS_TOKEN_EXPIRE_MINUTES = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRE_MINUTES || "10080");

let db;
let usersCollection;
let projectsCollection;

// Initialize MongoDB Connection
async function initDB() {
  if (db) return;
  
  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    db = client.db(MONGO_DB_NAME);
    usersCollection = db.collection("users");
    projectsCollection = db.collection("projects");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// Helper Functions
async function verifyPassword(plainPassword, hashedPassword) {
  try {
    // Try Argon2 first (for existing passwords from Python backend)
    if (hashedPassword.startsWith('$argon2')) {
      return await argon2.verify(hashedPassword, plainPassword);
    }
  } catch (error) {
    console.error("Argon2 verification error:", error);
  }

  // Fallback to bcryptjs
  try {
    return bcryptjs.compareSync(plainPassword, hashedPassword);
  } catch (error) {
    console.error("Bcryptjs verification error:", error);
    return false;
  }
}

async function getPasswordHash(password) {
  try {
    return await argon2.hash(password);
  } catch (error) {
    console.error("Password hashing error:", error);
    // Fallback to bcryptjs if argon2 fails
    return bcryptjs.hashSync(password, 10);
  }
}

function createAccessToken(data) {
  const toEncode = { ...data };
  const expire = Math.floor(Date.now() / 1000) + (JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60);
  toEncode.exp = expire;
  return jwt.sign(toEncode, JWT_SECRET_KEY, { algorithm: JWT_ALGORITHM });
}

async function getCurrentUser(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET_KEY, { algorithms: [JWT_ALGORITHM] });
    const userId = payload.sub;
    
    if (!userId) {
      return null;
    }
    
    const user = await usersCollection.findOne({ "_id": userId });
    
    if (!user || !user.is_approved) {
      return null;
    }
    
    return user;
  } catch (error) {
    return null;
  }
}

async function getCurrentAdmin(token) {
  const user = await getCurrentUser(token);
  
  if (!user || !user.is_admin) {
    return null;
  }
  
  return user;
}

// Middleware to extract token
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Airdrop Tracker API", status: "running" });
});

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    await initDB();
    
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ detail: "Missing required fields" });
    }
    
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ detail: "Username already exists" });
    }
    
    const existingEmail = await usersCollection.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ detail: "Email already registered" });
    }
    
    const userCount = await usersCollection.countDocuments({});
    const isFirstUser = userCount === 0;
    
    const userId = uuidv4();
    const hashedPassword = await getPasswordHash(password);
    
    const user = {
      "_id": userId,
      username,
      email,
      password_hash: hashedPassword,
      is_approved: isFirstUser,
      is_admin: isFirstUser,
      created_at: new Date().toISOString()
    };
    
    await usersCollection.insertOne(user);
    
    if (isFirstUser) {
      return res.json({
        message: "Admin account created successfully",
        username,
        is_admin: true
      });
    } else {
      return res.json({
        message: "Registration successful. Please wait for admin approval.",
        username,
        is_admin: false
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    await initDB();
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ detail: "Missing username or password" });
    }
    
    const user = await usersCollection.findOne({ username });

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ detail: "Incorrect username or password" });
    }
    
    if (!user.is_approved) {
      return res.status(403).json({ detail: "Your account is pending admin approval. Please wait for approval." });
    }
    
    const accessToken = createAccessToken({ sub: user._id });
    
    return res.json({
      access_token: accessToken,
      token_type: "bearer",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin || false
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    await initDB();
    
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ detail: "Not authenticated" });
    }
    
    const user = await getCurrentUser(token);
    if (!user) {
      return res.status(401).json({ detail: "Could not validate credentials" });
    }
    
    return res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin || false
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Admin Routes
app.get("/api/admin/users", async (req, res) => {
  try {
    await initDB();
    
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ detail: "Not authenticated" });
    }
    
    const admin = await getCurrentAdmin(token);
    if (!admin) {
      return res.status(403).json({ detail: "Admin access required" });
    }
    
    const allUsers = await usersCollection.find(
      {},
      { projection: { password_hash: 0 } }
    ).toArray();
    
    return res.json(allUsers);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.get("/api/admin/pending-users", async (req, res) => {
  try {
    await initDB();
    
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ detail: "Not authenticated" });
    }
    
    const admin = await getCurrentAdmin(token);
    if (!admin) {
      return res.status(403).json({ detail: "Admin access required" });
    }
    
    const pendingUsers = await usersCollection.find(
      { is_approved: false },
      { projection: { password_hash: 0 } }
    ).toArray();
    
    return res.json(pendingUsers);
  } catch (error) {
    console.error("Get pending users error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.post("/api/admin/approve-user", async (req, res) => {
  try {
    await initDB();
    
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ detail: "Not authenticated" });
    }
    
    const admin = await getCurrentAdmin(token);
    if (!admin) {
      return res.status(403).json({ detail: "Admin access required" });
    }
    
    const { user_id } = req.body;
    
    const result = await usersCollection.updateOne(
      { "_id": user_id },
      { $set: { is_approved: true } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ detail: "User not found" });
    }
    
    return res.json({ message: "User approved successfully" });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.delete("/api/admin/reject-user/:user_id", async (req, res) => {
  try {
    await initDB();
    
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ detail: "Not authenticated" });
    }
    
    const admin = await getCurrentAdmin(token);
    if (!admin) {
      return res.status(403).json({ detail: "Admin access required" });
    }
    
    const { user_id } = req.params;
    
    const user = await usersCollection.findOne({ "_id": user_id });
    if (user && user.is_admin) {
      return res.status(400).json({ detail: "Cannot delete admin user" });
    }
    
    const result = await usersCollection.deleteOne({ "_id": user_id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "User not found" });
    }
    
    return res.json({ message: "User rejected and deleted" });
  } catch (error) {
    console.error("Reject user error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.delete("/api/admin/delete-user/:user_id", async (req, res) => {
  try {
    await initDB();
    
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ detail: "Not authenticated" });
    }
    
    const admin = await getCurrentAdmin(token);
    if (!admin) {
      return res.status(403).json({ detail: "Admin access required" });
    }
    
    const { user_id } = req.params;
    
    const user = await usersCollection.findOne({ "_id": user_id });
    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }
    
    if (user.is_admin) {
      return res.status(400).json({ detail: "Cannot delete admin user" });
    }
    
    await projectsCollection.deleteMany({ user_id });
    const result = await usersCollection.deleteOne({ "_id": user_id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "User not found" });
    }
    
    return res.json({ message: "User and their projects deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Projects Routes
app.get("/api/projects", async (req, res) => {
  try {
    await initDB();
    
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ detail: "Not authenticated" });
    }
    
    const user = await getCurrentUser(token);
    if (!user) {
      return res.status(401).json({ detail: "Could not validate credentials" });
    }
    
    const projects = await projectsCollection.find(
      { user_id: user._id },
      { projection: { "_id": 0 } }
    ).toArray();
    
    return res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
    await initDB();
    
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ detail: "Not authenticated" });
    }
    
    const user = await getCurrentUser(token);
    if (!user) {
      return res.status(401).json({ detail: "Could not validate credentials" });
    }
    
    const { name, twitter, discord, telegram, farcaster, wallet, email, github, website, notes, tags } = req.body;

    console.log("Creating project with data:", { name, twitter, discord, telegram, farcaster, wallet, email, github, website, notes, tags });

    if (!name) {
      return res.status(400).json({ detail: "Project name is required" });
    }
    
    const existing = await projectsCollection.findOne({
      user_id: user._id,
      name
    });
    
    if (existing) {
      return res.status(400).json({ detail: "Project name already exists" });
    }
    
    const projectData = {
      "_id": uuidv4(),
      user_id: user._id,
      name,
      twitter: twitter || "",
      discord: discord || "",
      telegram: telegram || "",
      farcaster: farcaster || "",
      wallet: wallet || "",
      email: email || "",
      github: github || "",
      website: website || "",
      notes: notes || "",
      tags: tags || [],
      daily: "UNCHECKED",
      lastupdate: new Date().toISOString()
    };
    
    await projectsCollection.insertOne(projectData);
    return res.json({ message: "Project created successfully" });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.post("/api/projects/update-daily", async (req, res) => {
  try {
    await initDB();
    
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ detail: "Not authenticated" });
    }
    
    const user = await getCurrentUser(token);
    if (!user) {
      return res.status(401).json({ detail: "Could not validate credentials" });
    }
    
    const { name, value } = req.body;
    
    if (!name || !value) {
      return res.status(400).json({ detail: "Missing name or value" });
    }
    
    const result = await projectsCollection.updateOne(
      {
        user_id: user._id,
        name
      },
      {
        $set: {
          daily: value,
          lastupdate: new Date().toISOString()
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ detail: "Project not found" });
    }
    
    return res.json({ message: "Daily status updated" });
  } catch (error) {
    console.error("Update daily error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.delete("/api/projects/:project_name", async (req, res) => {
  try {
    await initDB();
    
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ detail: "Not authenticated" });
    }
    
    const user = await getCurrentUser(token);
    if (!user) {
      return res.status(401).json({ detail: "Could not validate credentials" });
    }
    
    const { project_name } = req.params;
    const decodedName = decodeURIComponent(project_name);
    
    const result = await projectsCollection.deleteOne({
      user_id: user._id,
      name: decodedName
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "Project not found" });
    }
    
    return res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// ==================== ALCHEMY PROXY ====================
// This endpoint proxies Alchemy requests to keep the API key secure
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

app.post("/api/alchemy/request", async (req, res) => {
  try {
    if (!ALCHEMY_API_KEY) {
      return res.status(500).json({ error: "Alchemy API key not configured" });
    }

    const { network = "polygon-mainnet", method, params = [] } = req.body;

    if (!method) {
      return res.status(400).json({ error: "Method is required" });
    }

    // Map network to Alchemy endpoint
    const networkMap = {
      "polygon-mainnet": "polygon-mainnet",
      "ethereum-mainnet": "eth-mainnet",
      "arbitrum-mainnet": "arb-mainnet",
      "optimism-mainnet": "opt-mainnet",
    };

    const alchemyNetwork = networkMap[network] || "polygon-mainnet";
    const alchemyUrl = `https://${alchemyNetwork}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

    // Make request to Alchemy with rate limiting protection
    const response = await axios.post(
      alchemyUrl,
      {
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      },
      {
        timeout: 10000,
      }
    );

    res.json(response.data);
  } catch (error) {
    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: "Rate limited. Please try again later.",
        retry_after: error.response?.headers?.["retry-after"] || 60
      });
    }

    console.error("Alchemy proxy error:", error.message);
    res.status(500).json({ error: "Failed to process Alchemy request" });
  }
});

// ==================== TOKEN BALANCE PROXY ====================
// Higher-level endpoint for getting token balances
app.post("/api/alchemy/token-balances", async (req, res) => {
  try {
    if (!ALCHEMY_API_KEY) {
      return res.status(500).json({ error: "Alchemy API key not configured" });
    }

    const { address, network = "polygon-mainnet" } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const networkMap = {
      "polygon-mainnet": "polygon-mainnet",
      "ethereum-mainnet": "eth-mainnet",
      "arbitrum-mainnet": "arb-mainnet",
      "optimism-mainnet": "opt-mainnet",
    };

    const alchemyNetwork = networkMap[network] || "polygon-mainnet";
    const alchemyUrl = `https://${alchemyNetwork}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

    const response = await axios.post(
      alchemyUrl,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getTokenBalances",
        params: [address],
      },
      {
        timeout: 10000,
      }
    );

    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: "Rate limited. Please try again later.",
        retry_after: error.response?.headers?.["retry-after"] || 60
      });
    }

    console.error("Token balances error:", error.message);
    res.status(500).json({ error: "Failed to fetch token balances" });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ detail: "Internal server error" });
});

// Initialize DB once on first request
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initDB();
      dbInitialized = true;
    } catch (error) {
      console.error("DB init error:", error);
      return res.status(500).json({ detail: "Database connection error" });
    }
  }
  next();
});

// Export Express app directly for Vercel
export default app;
