import React, { useState, useEffect } from "react";
import { Shield, UserCheck, UserX, ChevronLeft, RefreshCw, Search, Trash2, Users, UserCog } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

const AdminPanel = ({ onBack, onLogout, user }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, approved

  const fetchAllUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/admin/approve-user`,
        { user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to approve user");
    }
  };

  const handleReject = async (userId) => {
    if (!confirm("Are you sure you want to reject and delete this pending user?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/admin/reject-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to reject user");
    }
  };

  const handleDeleteApprovedUser = async (userId, username) => {
    if (!confirm(`Are you sure you want to delete approved user "${username}"? This will also delete all their projects.`)) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/admin/delete-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete user");
    }
  };

  // Filter users based on search and status
  const filteredUsers = allUsers.filter((u) => {
    // Search filter
    const matchesSearch = 
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    let matchesStatus = true;
    if (statusFilter === "pending") {
      matchesStatus = !u.is_approved;
    } else if (statusFilter === "approved") {
      matchesStatus = u.is_approved;
    }
    
    return matchesSearch && matchesStatus;
  });

  const pendingUsers = filteredUsers.filter(u => !u.is_approved);
  const approvedUsers = filteredUsers.filter(u => u.is_approved);

  const renderUserCard = (userData, isPending) => (
    <motion.div
      key={userData._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-cyan-400/50 transition"
      data-testid={`user-card-${userData.username}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full ${userData.is_admin ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-cyan-400 to-purple-500'} flex items-center justify-center font-bold text-white`}>
              {userData.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">{userData.username}</h3>
                {userData.is_admin && (
                  <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">
                    Admin
                  </span>
                )}
                {isPending && (
                  <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-500/30">
                    Pending
                  </span>
                )}
                {!isPending && !userData.is_admin && (
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30">
                    Approved
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">{userData.email}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 ml-13">
            Registered: {new Date(userData.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          {isPending ? (
            <>
              <button
                onClick={() => handleApprove(userData._id)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
                data-testid={`approve-btn-${userData.username}`}
              >
                <UserCheck size={16} />
                Approve
              </button>
              <button
                onClick={() => handleReject(userData._id)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                data-testid={`reject-btn-${userData.username}`}
              >
                <UserX size={16} />
                Reject
              </button>
            </>
          ) : (
            !userData.is_admin && (
              <button
                onClick={() => handleDeleteApprovedUser(userData._id, userData.username)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                data-testid={`delete-btn-${userData.username}`}
              >
                <Trash2 size={16} />
                Delete
              </button>
            )
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
              data-testid="back-btn"
            >
              <ChevronLeft size={20} />
              Back
            </button>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-cyan-400">
              <Shield size={28} />
              Admin Panel - User Management
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            Logged in as: <span className="text-cyan-400 font-semibold">{user?.username}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-gray-900/60 p-6 rounded-2xl shadow-lg border border-gray-700">
          {/* Search and Filter Section */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-cyan-300 flex items-center gap-2">
                <Users size={24} />
                All Users ({filteredUsers.length})
              </h2>
              <button
                onClick={fetchAllUsers}
                disabled={loading}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition"
                data-testid="refresh-btn"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by username or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-cyan-400 focus:outline-none transition"
                    data-testid="search-input"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-2 rounded-lg transition ${
                    statusFilter === "all"
                      ? "bg-cyan-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                  data-testid="filter-all"
                >
                  All ({allUsers.length})
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-4 py-2 rounded-lg transition ${
                    statusFilter === "pending"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                  data-testid="filter-pending"
                >
                  Pending ({allUsers.filter(u => !u.is_approved).length})
                </button>
                <button
                  onClick={() => setStatusFilter("approved")}
                  className={`px-4 py-2 rounded-lg transition ${
                    statusFilter === "approved"
                      ? "bg-green-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                  data-testid="filter-approved"
                >
                  Approved ({allUsers.filter(u => u.is_approved).length})
                </button>
              </div>
            </div>
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
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users size={48} className="mx-auto mb-3 opacity-30" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending Users Section */}
              {pendingUsers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
                    <UserCog size={20} />
                    Pending Approvals ({pendingUsers.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingUsers.map((u) => renderUserCard(u, true))}
                  </div>
                </div>
              )}

              {/* Approved Users Section */}
              {approvedUsers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <UserCheck size={20} />
                    Approved Users ({approvedUsers.length})
                  </h3>
                  <div className="space-y-3">
                    {approvedUsers.map((u) => renderUserCard(u, false))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
