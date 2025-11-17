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
      style={{
        background: '#e0e5ec',
        boxShadow: '9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5)',
      }}
      className="p-3 sm:p-5 rounded-2xl transition-all duration-300 hover:shadow-[6px_6px_12px_rgba(163,177,198,0.4),-6px_-6px_12px_rgba(255,255,255,0.4)]"
      data-testid={`user-card-${userData.username}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start sm:items-center gap-3 mb-2 sm:mb-3">
            <div 
              style={{
                boxShadow: 'inset 4px 4px 8px rgba(163, 177, 198, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.5)',
              }}
              className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-lg sm:text-2xl flex-shrink-0 ${
                userData.is_admin 
                  ? 'bg-gradient-to-br from-amber-300 to-orange-400 text-white' 
                  : 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
              }`}
            >
              {userData.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">{userData.username}</h3>
                {userData.is_admin && (
                  <span 
                    style={{
                      background: 'linear-gradient(145deg, #fbbf24, #f59e0b)',
                      boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.5)',
                    }}
                    className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold rounded-full text-white"
                  >
                    Admin
                  </span>
                )}
                {isPending && (
                  <span 
                    style={{
                      background: 'linear-gradient(145deg, #fb923c, #f97316)',
                      boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.5)',
                    }}
                    className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold rounded-full text-white"
                  >
                    Pending
                  </span>
                )}
                {!isPending && !userData.is_admin && (
                  <span 
                    style={{
                      background: 'linear-gradient(145deg, #4ade80, #22c55e)',
                      boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.5)',
                    }}
                    className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold rounded-full text-white"
                  >
                    Approved
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">{userData.email}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 ml-0 sm:ml-[3.5rem]">
            Registered: {new Date(userData.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 justify-end sm:justify-start flex-shrink-0">
          {isPending ? (
            <>
              <button
                onClick={() => handleApprove(userData._id)}
                style={{
                  background: 'linear-gradient(145deg, #4ade80, #22c55e)',
                  boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.6), -6px -6px 12px rgba(255, 255, 255, 0.5)',
                }}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-white transition-all hover:shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]"
                data-testid={`approve-btn-${userData.username}`}
              >
                <UserCheck size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="text-xs sm:text-sm">Approve</span>
              </button>
              <button
                onClick={() => handleReject(userData._id)}
                style={{
                  background: 'linear-gradient(145deg, #f87171, #ef4444)',
                  boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.6), -6px -6px 12px rgba(255, 255, 255, 0.5)',
                }}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-white transition-all hover:shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]"
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
                style={{
                  background: 'linear-gradient(145deg, #f87171, #ef4444)',
                  boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.6), -6px -6px 12px rgba(255, 255, 255, 0.5)',
                }}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-white transition-all hover:shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]"
                data-testid={`delete-btn-${userData.username}`}
              >
                <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="text-xs sm:text-sm">Delete</span>
              </button>
            )
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#e0e5ec]">
      {/* Header */}
      <div 
        style={{
          boxShadow: '0 8px 16px rgba(163, 177, 198, 0.4)',
        }}
        className="p-3 sm:p-6 bg-[#e0e5ec]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onBack}
              style={{
                background: '#e0e5ec',
                boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.6), -6px -6px 12px rgba(255, 255, 255, 0.5)',
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-gray-700 transition-all hover:shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]"
              data-testid="back-btn"
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-base">Back</span>
            </button>
            <h1 className="flex items-center gap-2 text-base sm:text-2xl font-bold text-gray-800">
              <div 
                style={{
                  background: '#e0e5ec',
                  boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.5)',
                }}
                className="p-1.5 sm:p-2 rounded-xl"
              >
                <Shield size={20} className="sm:w-7 sm:h-7 text-blue-600" />
              </div>
              <span className="hidden lg:inline">Admin Panel - User Management</span>
              <span className="lg:hidden">Admin Panel</span>
            </h1>
          </div>
          <div 
            style={{
              background: '#e0e5ec',
              boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.6), -6px -6px 12px rgba(255, 255, 255, 0.5)',
            }}
            className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl"
          >
            <span className="text-xs sm:text-sm text-gray-600">Logged in: </span>
            <span className="text-xs sm:text-sm font-bold text-blue-600">{user?.username}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6 max-w-7xl mx-auto">
        <div 
          style={{
            background: '#e0e5ec',
            boxShadow: '12px 12px 24px rgba(163, 177, 198, 0.6), -12px -12px 24px rgba(255, 255, 255, 0.5)',
          }}
          className="p-4 sm:p-8 rounded-3xl"
        >
          {/* Search and Filter Section */}
          <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                <div 
                  style={{
                    background: '#e0e5ec',
                    boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.5)',
                  }}
                  className="p-1.5 sm:p-2 rounded-xl"
                >
                  <Users size={20} className="sm:w-7 sm:h-7 text-blue-600" />
                </div>
                All Users ({filteredUsers.length})
              </h2>
              <button
                onClick={fetchAllUsers}
                disabled={loading}
                style={{
                  background: 'linear-gradient(145deg, #60a5fa, #3b82f6)',
                  boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.6), -6px -6px 12px rgba(255, 255, 255, 0.5)',
                }}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-white transition-all hover:shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] disabled:opacity-50"
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
                    style={{
                      background: '#e0e5ec',
                      boxShadow: 'inset 6px 6px 12px rgba(163, 177, 198, 0.4), inset -6px -6px 12px rgba(255, 255, 255, 0.5)',
                    }}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.4)] transition-all"
                    data-testid="search-input"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setStatusFilter("all")}
                  style={{
                    background: statusFilter === "all" 
                      ? 'linear-gradient(145deg, #60a5fa, #3b82f6)' 
                      : '#e0e5ec',
                    boxShadow: statusFilter === "all"
                      ? 'inset 4px 4px 8px rgba(163, 177, 198, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.5)'
                      : '6px 6px 12px rgba(163, 177, 198, 0.6), -6px -6px 12px rgba(255, 255, 255, 0.5)',
                  }}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-base transition-all ${
                    statusFilter === "all" ? "text-white" : "text-gray-700 hover:shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)]"
                  }`}
                  data-testid="filter-all"
                >
                  All ({allUsers.length})
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  style={{
                    background: statusFilter === "pending" 
                      ? 'linear-gradient(145deg, #fb923c, #f97316)' 
                      : '#e0e5ec',
                    boxShadow: statusFilter === "pending"
                      ? 'inset 4px 4px 8px rgba(163, 177, 198, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.5)'
                      : '6px 6px 12px rgba(163, 177, 198, 0.6), -6px -6px 12px rgba(255, 255, 255, 0.5)',
                  }}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-base transition-all ${
                    statusFilter === "pending" ? "text-white" : "text-gray-700 hover:shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)]"
                  }`}
                  data-testid="filter-pending"
                >
                  Pending ({allUsers.filter(u => !u.is_approved).length})
                </button>
                <button
                  onClick={() => setStatusFilter("approved")}
                  style={{
                    background: statusFilter === "approved" 
                      ? 'linear-gradient(145deg, #4ade80, #22c55e)' 
                      : '#e0e5ec',
                    boxShadow: statusFilter === "approved"
                      ? 'inset 4px 4px 8px rgba(163, 177, 198, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.5)'
                      : '6px 6px 12px rgba(163, 177, 198, 0.6), -6px -6px 12px rgba(255, 255, 255, 0.5)',
                  }}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-base transition-all ${
                    statusFilter === "approved" ? "text-white" : "text-gray-700 hover:shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)]"
                  }`}
                  data-testid="filter-approved"
                >
                  Approved ({allUsers.filter(u => u.is_approved).length})
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div 
              style={{
                background: 'linear-gradient(145deg, #fca5a5, #f87171)',
                boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.3)',
              }}
              className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl text-white font-medium text-sm sm:text-base"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 sm:py-16 text-gray-500">
              <div 
                style={{
                  background: '#e0e5ec',
                  boxShadow: '8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.5)',
                }}
                className="inline-block p-3 sm:p-4 rounded-2xl mb-3 sm:mb-4"
              >
                <RefreshCw size={32} className="sm:w-10 sm:h-10 animate-spin text-blue-600" />
              </div>
              <p className="text-base sm:text-lg font-semibold">Loading...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 sm:py-16 text-gray-400">
              <div 
                style={{
                  background: '#e0e5ec',
                  boxShadow: '8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.5)',
                }}
                className="inline-block p-3 sm:p-4 rounded-2xl mb-3 sm:mb-4"
              >
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
                    <div 
                      style={{
                        background: '#e0e5ec',
                        boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.5)',
                      }}
                      className="p-1.5 sm:p-2 rounded-xl"
                    >
                      <UserCog size={18} className="sm:w-[22px] sm:h-[22px] text-orange-500" />
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-gray-800">
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
                    <div 
                      style={{
                        background: '#e0e5ec',
                        boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.5)',
                      }}
                      className="p-1.5 sm:p-2 rounded-xl"
                    >
                      <UserCheck size={18} className="sm:w-[22px] sm:h-[22px] text-green-600" />
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-gray-800">
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
