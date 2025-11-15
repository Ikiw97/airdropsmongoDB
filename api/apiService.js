import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

// Create axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
    }
    return Promise.reject(error);
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