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
};

export default apiService;
