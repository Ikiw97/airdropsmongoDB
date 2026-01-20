import axios from "axios";
import { secureLogger, validateApiResponse, sanitizeInput } from "../utils/dataSecurityUtils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Create axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// Add auth token to requests + Secure logging
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log request (non-sensitive data only)
  secureLogger.log('API_REQUEST', {
    method: config.method.toUpperCase(),
    url: config.url,
    // Don't log data at all
  }, 'info');

  return config;
});

// Handle responses with sanitization
api.interceptors.response.use(
  (response) => {
    // Validate response untuk sensitive data
    const sanitized = validateApiResponse(response.data);

    // Log successful response (sanitized)
    secureLogger.log('API_SUCCESS', {
      method: response.config.method.toUpperCase(),
      url: response.config.url,
      status: response.status
    }, 'info');

    return { ...response, data: sanitized };
  },
  (error) => {
    // Log error tanpa sensitive details
    secureLogger.logError('API_ERROR', error, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status
    });

    // Handle specific errors
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
    }

    // Return safe error message
    return Promise.reject({
      message: error.response?.data?.message || "An error occurred",
      status: error.response?.status,
      // Don't expose raw error
    });
  }
);

// API Methods
export const apiService = {
  // Auth
  async login(username, password) {
    const response = await api.post("/api/auth/login", { username, password });
    return response.data;
  },

  async register(username, email, password) {
    const response = await api.post("/api/auth/register", { username, email, password });
    return response.data;
  },

  async getMe() {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  // Projects
  async getProjects() {
    const response = await api.get("/api/projects");
    return response.data;
  },

  async createProject(projectData) {
    const response = await api.post("/api/projects", projectData);
    return response.data;
  },

  async updateDaily(name, value) {
    const response = await api.post("/api/projects/update-daily", { name, value });
    return response.data;
  },

  async updateDistributed(name, value) {
    const response = await api.post("/api/projects/update-distributed", { name, value });
    return response.data;
  },

  async deleteProject(projectName) {
    const response = await api.delete(`/api/projects/${encodeURIComponent(projectName)}`);
    return response.data;
  },

  // Admin
  async getPendingUsers() {
    const response = await api.get("/api/admin/pending-users");
    return response.data;
  },

  async approveUser(userId) {
    const response = await api.post("/api/admin/approve-user", { user_id: userId });
    return response.data;
  },

  async rejectUser(userId) {
    const response = await api.delete(`/api/admin/reject-user/${userId}`);
    return response.data;
  },

  // Gas Prices
  // Gas Prices
  async getGasPrices() {
    try {
      const response = await api.get("/api/gas-prices");
      // Basic validation to ensure we don't return zeroes if backend failed silently
      if (response.data?.ethereum?.average > 0) {
        return response.data;
      }
      throw new Error("Invalid gas data from backend");
    } catch (error) {
      console.warn("Backend gas fetch failed, switching to client-side fallback...", error);

      // Fallback: Fetch directly from Alchemy (Client Side) using VITE_ key
      const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY;
      if (alchemyKey) {
        try {
          const r = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", method: "eth_gasPrice", params: [], id: 1 })
          });
          const data = await r.json();
          const gwei = parseInt(data.result, 16) / 1e9;

          return {
            ethereum: {
              slow: Math.max(0.01, (gwei * 0.9)).toFixed(2),
              average: gwei.toFixed(2),
              fast: (gwei * 1.1).toFixed(2)
            },
            bsc: { slow: 3, average: 3, fast: 3 }, // Fallback defaults
            polygon: { slow: 30, average: 40, fast: 50 }
          };
        } catch (e) {
          console.error("Alchemy fallback failed:", e);
        }
      }

      throw error;
    }
  },

  // Market Data
  async getMarketPrices() {
    const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;

    try {
      // Try backend proxy first
      const response = await api.get("/api/market-prices");
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      throw new Error("Empty response from backend");
    } catch (backendError) {
      console.log("Backend proxy unavailable, fetching directly from CoinGecko...");
      // Fallback to direct CoinGecko API call
      // CoinGecko Demo/Basic uses x-cg-demo-api-key header
      const headers = apiKey ? { "x-cg-demo-api-key": apiKey } : {};

      const directResponse = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h,24h,7d",
        { headers }
      );
      if (!directResponse.ok) throw new Error("CoinGecko API failed");
      return directResponse.json();
    }
  },

  async getMarketGlobalStats() {
    const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;

    try {
      // Try backend proxy first
      const response = await api.get("/api/market-global-stats");
      if (response.data && response.data.total_market_cap) {
        return response.data;
      }
      throw new Error("Empty response from backend");
    } catch (backendError) {
      console.log("Backend proxy unavailable, fetching directly from CoinGecko...");
      // Fallback to direct CoinGecko API call
      // CoinGecko Demo/Basic uses x-cg-demo-api-key header
      const headers = apiKey ? { "x-cg-demo-api-key": apiKey } : {};

      const directResponse = await fetch("https://api.coingecko.com/api/v3/global", { headers });
      if (!directResponse.ok) throw new Error("CoinGecko API failed");
      const data = await directResponse.json();
      return data.data;
    }
  },

  // Bitcoin Data (Mempool.space)
  async getBitcoinFees() {
    const response = await fetch("https://mempool.space/api/v1/fees/recommended");
    if (!response.ok) throw new Error("Failed to fetch Bitcoin fees");
    return response.json();
  },

  async getBitcoinStats() {
    // Parallel fetch for height and price/stats
    const [heightRes, statsRes] = await Promise.all([
      fetch("https://mempool.space/api/blocks/tip/height"),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_vol=true&include_market_cap=true")
    ]);

    if (!heightRes.ok) throw new Error("Failed to fetch BTC height");

    const height = await heightRes.text();
    const stats = statsRes.ok ? await statsRes.json() : null;

    return {
      height: parseInt(height),
      price: stats?.bitcoin?.usd || 0,
      marketCap: stats?.bitcoin?.usd_market_cap || 0
    };
  },

  // DefiLlama
  async getChainsTVL() {
    const response = await fetch("https://api.llama.fi/v2/chains");
    if (!response.ok) throw new Error("Failed to fetch TVL data");
    return response.json();
  },
  // Fear & Greed Index
  async getFearAndGreedIndex() {
    try {
      const response = await fetch("https://api.alternative.me/fng/?limit=1");
      if (!response.ok) throw new Error("Failed to fetch Fear & Greed Index");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fear & Greed API Error:", error);
      // Fallback data if API fails
      return {
        data: [{
          value: "50",
          value_classification: "Neutral",
          timestamp: Math.floor(Date.now() / 1000).toString()
        }]
      };
    }
  },
};

export default apiService;
