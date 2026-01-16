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
  const [statusFilter, setStatusFilter] = useState("all");

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

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

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
      className="p-3 sm:p-5 rounded-2xl transition-all duration-300 bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark"
      data-testid={`user-card-${userData.username}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start sm:items-center gap-3 mb-2 sm:mb-3">
            <div
              className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-lg sm:text-2xl flex-shrink-0 shadow-neu-pressed dark:shadow-neu-pressed-dark ${userData.is_admin
                ? 'bg-gradient-to-br from-amber-300 to-orange-400 text-white'
                : 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
                }`}
            >
              {userData.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-100 truncate">{userData.username}</h3>
                {userData.is_admin && (
                  <span
                    className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold rounded-full text-white bg-gradient-to-br from-amber-400 to-amber-500 shadow-neu-icon dark:shadow-neu-icon-dark"
                  >
                    Admin
                  </span>
                )}
                {isPending && (
                  <span
                    className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold rounded-full text-white bg-gradient-to-br from-orange-400 to-orange-600 shadow-neu-icon dark:shadow-neu-icon-dark"
                  >
                    Pending
                  </span>
                )}
                {!isPending && !userData.is_admin && (
                  <span
                    className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold rounded-full text-white bg-gradient-to-br from-green-400 to-green-600 shadow-neu-icon dark:shadow-neu-icon-dark"
                  >
                    Approved
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium truncate">{userData.email}</p>
            </div>
          </div>
          Registered: {new Date(userData.created_at).toLocaleString()}
        </p>
        {userData.last_active_at && (
          <div className="text-xs ml-0 sm:ml-[3.5rem] mt-1 flex items-center gap-2">
            {new Date(userData.last_active_at) > new Date(Date.now() - 5 * 60 * 1000) ? (
              <span className="flex items-center gap-1 text-green-500 font-bold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Online
              </span>
            ) : (
              <span className="text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                Last seen: {new Date(userData.last_active_at).toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-2 sm:gap-3 justify-end sm:justify-start flex-shrink-0">
        {isPending ? (
          <>
            <button
              onClick={() => handleApprove(userData._id)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-white transition-all bg-gradient-to-br from-green-400 to-green-600 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark"
              data-testid={`approve-btn-${userData.username}`}
            >
              <UserCheck size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm">Approve</span>
            </button>
            <button
              onClick={() => handleReject(userData._id)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-white transition-all bg-gradient-to-br from-red-400 to-red-600 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark"
              data-testid={`reject-btn-${userData.username}`}
            >
              <UserX size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm">Reject</span>
            </button>
          </>
        ) : (
          !userData.is_admin && (
            <button
              onClick={() => handleDeleteApprovedUser(userData._id, userData.username)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-white transition-all bg-gradient-to-br from-red-400 to-red-600 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark"
              data-testid={`delete-btn-${userData.username}`}
            >
              <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm">Delete</span>
            </button>
          )
        )}
      </div>
    </div>
    </motion.div >
  );

return (
  <div className="min-h-screen bg-main-light dark:bg-main-dark transition-colors duration-300 text-text-light dark:text-text-dark">
    {/* Header */}
    <div className="p-3 sm:p-6 bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark z-10 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-200 bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark transition-all"
            data-testid="back-btn"
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-base">Back</span>
          </button>
          <h1 className="flex items-center gap-2 text-base sm:text-2xl font-bold text-gray-800 dark:text-white">
            <div className="p-1.5 sm:p-2 rounded-xl bg-main-light dark:bg-main-dark shadow-neu-icon dark:shadow-neu-icon-dark text-blue-600 dark:text-blue-400">
              <Shield size={20} className="sm:w-7 sm:h-7" />
            </div>
            <span className="hidden lg:inline">Admin Panel - User Management</span>
            <span className="lg:hidden">Admin Panel</span>
          </h1>
        </div>
        <div className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Logged in: </span>
          <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">{user?.username}</span>
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <div className="p-4 sm:p-8 rounded-3xl bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark">
        {/* Search and Filter Section */}
        <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-xl bg-main-light dark:bg-main-dark shadow-neu-icon dark:shadow-neu-icon-dark text-blue-600 dark:text-blue-400">
                <Users size={20} className="sm:w-7 sm:h-7" />
              </div>
              All Users ({filteredUsers.length})
            </h2>
            <button
              onClick={fetchAllUsers}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-white bg-gradient-to-br from-blue-400 to-blue-600 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark disabled:opacity-50 transition-all"
              data-testid="refresh-btn"
            >
              <RefreshCw size={16} className={`sm:w-[18px] sm:h-[18px] ${loading ? "animate-spin" : ""}`} />
              <span className="text-xs sm:text-sm">Refresh</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base text-gray-800 dark:text-gray-200 placeholder-gray-400 bg-main-light dark:bg-main-dark shadow-neu-pressed dark:shadow-neu-pressed-dark focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  data-testid="search-input"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-base transition-all ${statusFilter === "all"
                  ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-neu-pressed dark:shadow-neu-pressed-dark'
                  : 'bg-main-light dark:bg-main-dark text-gray-700 dark:text-gray-300 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark'
                  }`}
                data-testid="filter-all"
              >
                All ({allUsers.length})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-base transition-all ${statusFilter === "pending"
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-neu-pressed dark:shadow-neu-pressed-dark'
                  : 'bg-main-light dark:bg-main-dark text-gray-700 dark:text-gray-300 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark'
                  }`}
                data-testid="filter-pending"
              >
                Pending ({allUsers.filter(u => !u.is_approved).length})
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-base transition-all ${statusFilter === "approved"
                  ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-neu-pressed dark:shadow-neu-pressed-dark'
                  : 'bg-main-light dark:bg-main-dark text-gray-700 dark:text-gray-300 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark'
                  }`}
                data-testid="filter-approved"
              >
                Approved ({allUsers.filter(u => u.is_approved).length})
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl text-white font-medium text-sm sm:text-base bg-gradient-to-br from-red-400 to-red-600 shadow-neu-flat dark:shadow-neu-flat-dark">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 sm:py-16 text-gray-500 dark:text-gray-400">
            <div className="inline-block p-3 sm:p-4 rounded-2xl mb-3 sm:mb-4 bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark">
              <RefreshCw size={32} className="sm:w-10 sm:h-10 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-base sm:text-lg font-semibold">Loading...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 sm:py-16 text-gray-400 dark:text-gray-500">
            <div className="inline-block p-3 sm:p-4 rounded-2xl mb-3 sm:mb-4 bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark">
              <Users size={40} className="sm:w-[50px] sm:h-[50px] opacity-30" />
            </div>
            <p className="text-base sm:text-lg font-semibold">No users found</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Pending Users Section */}
            {pendingUsers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 rounded-xl bg-main-light dark:bg-main-dark shadow-neu-icon dark:shadow-neu-icon-dark text-orange-500">
                    <UserCog size={18} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">
                    Pending Approvals ({pendingUsers.length})
                  </h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {pendingUsers.map((u) => renderUserCard(u, true))}
                </div>
              </div>
            )}

            {/* Approved Users Section */}
            {approvedUsers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 rounded-xl bg-main-light dark:bg-main-dark shadow-neu-icon dark:shadow-neu-icon-dark text-green-600 dark:text-green-500">
                    <UserCheck size={18} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">
                    Approved Users ({approvedUsers.length})
                  </h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
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
