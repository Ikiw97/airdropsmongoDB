import express from 'express';
console.log("Loading api/index.js...");
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// ==================== CORS CONFIGURATION ====================
const allowedOrigins = [
  "https://airdropstracker.my.id",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// ==================== SECURITY HEADERS & RATE LIMITING ====================
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Apply Helmet for automatic security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://api.coingecko.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:", "wss:"],
      frameSrc: ["'self'", "https://trade.dedoo.xyz"],
      frameAncestors: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Rate Limiter for Auth Routes (Strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { detail: "Too many login attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate Limiter for General API (Moderate)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { detail: "Too many requests, please slow down" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/", authLimiter);
app.use("/api/", apiLimiter);

// Custom manually set headers (for double safety or specific needs)
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
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
let messagesCollection;
let connectionPromise;

// Initialize MongoDB Connection
async function initDB() {
  if (db) return;

  try {
    if (!connectionPromise) {
      const client = new MongoClient(MONGO_URL);
      connectionPromise = client.connect().then(c => {
        console.log("Connected to MongoDB");
        return c;
      });
    }

    const client = await connectionPromise;
    db = client.db(MONGO_DB_NAME);
    usersCollection = db.collection("users");
    projectsCollection = db.collection("projects");
    messagesCollection = db.collection("messages");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    connectionPromise = null; // Reset promise on failure so we can retry
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

app.post("/api/projects/update-distributed", async (req, res) => {
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

    if (!name || value === undefined) {
      return res.status(400).json({ detail: "Missing name or value" });
    }

    // Explicitly cast value to boolean if passed as string, though frontend sends boolean
    // But safely handle it.

    const result = await projectsCollection.updateOne(
      {
        user_id: user._id,
        name
      },
      {
        $set: {
          distributed: value,
          lastupdate: new Date().toISOString()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ detail: "Project not found" });
    }

    return res.json({ message: "Distributed status updated" });
  } catch (error) {
    console.error("Update distributed error:", error);
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

// ==================== COMMUNITY CHAT ====================

app.get("/api/community/messages", async (req, res) => {
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

    // Get last 100 messages
    const messages = await messagesCollection.find({})
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();

    return res.json(messages.reverse());
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.post("/api/community/messages", async (req, res) => {
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

    const { message, image_url, replyTo } = req.body;

    if (!message && !image_url) {
      return res.status(400).json({ detail: "Message or image is required" });
    }

    const newMessage = {
      "_id": uuidv4(),
      user_id: user._id,
      username: user.username,
      message: message || "",
      image_url: image_url || null,
      replyTo: replyTo || null, // Store reply context
      created_at: new Date().toISOString()
    };

    await messagesCollection.insertOne(newMessage);
    return res.json(newMessage);
  } catch (error) {
    console.error("Post message error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// ImgBB Upload Proxy
app.post("/api/upload/image", async (req, res) => {
  try {
    await initDB();

    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ detail: "Not authenticated" });
    }

    const { image } = req.body; // Base64 string
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

    if (!IMGBB_API_KEY) {
      return res.status(500).json({ detail: "Server ImgBB configuration missing" });
    }

    if (!image) {
      return res.status(400).json({ detail: "Image data required" });
    }

    // Remove data:image/xxx;base64, prefix if present
    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");

    // Log debug info (masked key)
    const keyStatus = IMGBB_API_KEY ? `Present (${IMGBB_API_KEY.substring(0, 4)}...)` : "Missing";
    console.log(`[Upload] Starting upload. Key: ${keyStatus}, Image Length: ${cleanBase64.length}`);

    const formData = new URLSearchParams();
    formData.append("image", cleanBase64);

    try {
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      if (response.data && response.data.data && response.data.data.url) {
        console.log("[Upload] Success:", response.data.data.url);
        return res.json({ url: response.data.data.url });
      } else {
        throw new Error("Invalid response structure from ImgBB");
      }
    } catch (axiosError) {
      // Menangkap error spesifik dari ImgBB response
      const imgbbError = axiosError.response?.data?.error?.message || axiosError.message;
      console.error("[Upload] ImgBB Fail:", axiosError.response?.data || axiosError.message);

      // Kembalikan pesan error spesifik ke frontend agar bisa dibaca di console
      return res.status(500).json({
        detail: `ImgBB Upload Failed: ${imgbbError}`,
        debug: { keyStatus, length: cleanBase64.length }
      });
    }

  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ detail: "Failed to upload image: " + error.message });
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

// ==================== GAS PRICE PROXY ====================
app.get("/api/gas-prices", async (req, res) => {
  try {
    const results = {
      ethereum: { average: 0, fast: 0, slow: 0 },
      bsc: { average: 0, fast: 0, slow: 0 },
      polygon: { average: 0, fast: 0, slow: 0 },
      timestamp: new Date().toISOString()
    };

    // Use Promise.allSettled to ensure one failure doesn't break everything
    await Promise.allSettled([
      // ETH Gas
      // ETH Gas - Use Alchemy for reliability
      axios.post(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`, {
        jsonrpc: "2.0", method: "eth_gasPrice", params: [], id: 1
      }, { timeout: 5000 }).then(r => {
        const gwei = parseInt(r.data.result, 16) / 1e9;
        results.ethereum = {
          slow: Math.max(0.01, (gwei * 0.9)).toFixed(2),
          average: gwei.toFixed(2),
          fast: (gwei * 1.1).toFixed(2)
        };
      }),

      // BSC Gas
      axios.post("https://bsc-dataseed.binance.org", {
        jsonrpc: "2.0", method: "eth_gasPrice", params: [], id: 1
      }, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }).then(r => {
        const gwei = parseInt(r.data.result, 16) / 1e9;
        results.bsc = {
          slow: Math.max(1, (gwei * 0.9).toFixed(1)),
          average: gwei.toFixed(1),
          fast: (gwei * 1.1).toFixed(1)
        };
      }),

      // Polygon Gas
      axios.get("https://gasstation.polygon.technology/v2", {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }).then(r => {
        results.polygon = {
          slow: r.data.safeLow.maxFee.toFixed(1),
          average: r.data.standard.maxFee.toFixed(1),
          fast: r.data.fast.maxFee.toFixed(1)
        };
      })
    ]);

    res.json(results);
  } catch (error) {
    console.error("Gas price proxy error:", error.message);
    res.status(500).json({ error: "Failed to fetch gas prices" });
  }
});

// ==================== MARKET DATA PROXY ====================
app.get("/api/market-prices", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 100,
          page: 1,
          sparkline: false,
          price_change_percentage: "24h"
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Market prices proxy error:", error.message);
    res.status(500).json({ error: "Failed to fetch market prices" });
  }
});

app.get("/api/market-global-stats", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/global",
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      }
    );
    res.json(response.data.data);
  } catch (error) {
    console.error("Global stats proxy error:", error.message);
    res.status(500).json({ error: "Failed to fetch global stats" });
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

// Start server if running locally
import { fileURLToPath } from 'url';
import path from 'path';

const currentFile = fileURLToPath(import.meta.url);
const executedFile = process.argv[1];

// Normalize paths for comparison (handle Windows backslashes and casing)
const normalize = (p) => p ? path.resolve(p).toLowerCase() : '';

if (normalize(currentFile) === normalize(executedFile)) {
  const PORT = process.env.PORT || 8001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Local environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export Express app directly for Vercel
export default app;
