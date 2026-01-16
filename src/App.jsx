import React, { useState, useEffect } from "react";
import AuthPage from "./AuthPage";
import TrackerPageFullScreen from "./TrackerPageFullScreen";
import AdminPanel from "./AdminPanel";
import EditProfileModal from "./components/EditProfileModal";
import { SecurityProvider } from "./contexts/SecurityContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import "./styles/animations.css";
import BubbleMapFeature from "./components/BubbleMap/BubbleMapFeature";
import UserActivityTracker from "./components/UserActivityTracker";

// Static Trading Chart Background Component (Optimized)
const CryptoChartBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-main-light/30 dark:to-main-dark/30" />
      {/* Simple grid pattern */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(130,130,130,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(130,130,130,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      // Verify token is still valid
      axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setUser(response.data);
          setIsLoggedIn(true);
        })
        .catch(() => {
          // Token invalid, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        });
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setShowAdmin(false);
  };

  return (
    <SecurityProvider>
      <ThemeProvider>
        <UserActivityTracker isLoggedIn={isLoggedIn} />
        {/* Chart Background - only show when logged in */}
        {isLoggedIn && <CryptoChartBackground />}

        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <AuthPage onLogin={handleLogin} />
            </motion.div>
          ) : showAdmin && user?.is_admin ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <AdminPanel onBack={() => setShowAdmin(false)} onLogout={handleLogout} user={user} />
            </motion.div>
          ) : (
            <motion.div
              key="tracker"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <TrackerPageFullScreen
                onLogout={handleLogout}
                user={user}
                onShowAdmin={() => setShowAdmin(true)}
                onEditProfile={() => setIsProfileModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isProfileModalOpen && (
            <EditProfileModal
              user={user}
              onClose={() => setIsProfileModalOpen(false)}
              onUpdateUser={(updatedUser) => {
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
              }}
            />
          )}
        </AnimatePresence>
        <BubbleMapFeature />
      </ThemeProvider>
    </SecurityProvider>
  );
}

export default App;
