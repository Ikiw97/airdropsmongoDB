import React, { useState, useEffect } from "react";
import { Shield, UserCheck, UserX, ChevronLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

const AdminPanel = ({ onBack, onLogout, user }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPendingUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/admin/pending-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch pending users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/admin/approve-user`,
        { user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to approve user");
    }
  };

  const handleReject = async (userId) => {
    if (!confirm("Are you sure you want to reject this user?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/admin/reject-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPendingUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to reject user");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
            >
              <ChevronLeft size={20} />
              Back
            </button>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-cyan-400">
              <Shield size={28} />
              Admin Panel
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            Logged in as: <span className="text-cyan-400 font-semibold">{user?.username}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-gray-900/60 p-6 rounded-2xl shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-cyan-300 flex items-center gap-2">
              <UserCheck size={24} />
              Pending User Approvals
            </h2>
            <button
              onClick={fetchPendingUsers}
              disabled={loading}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <RefreshCw size={32} className="animate-spin mx-auto mb-3" />
              Loading...
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <UserCheck size={48} className="mx-auto mb-3 opacity-30" />
              <p>No pending user approvals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((pendingUser) => (
                <motion.div
                  key={pendingUser._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-cyan-400/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-white">
                          {pendingUser.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{pendingUser.username}</h3>
                          <p className="text-sm text-gray-400">{pendingUser.email}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 ml-13">
                        Registered: {new Date(pendingUser.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(pendingUser._id)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
                        data-testid={`approve-${pendingUser.username}`}
                      >
                        <UserCheck size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(pendingUser._id)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                        data-testid={`reject-${pendingUser.username}`}
                      >
                        <UserX size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;