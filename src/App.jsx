import React, { useState, useEffect } from "react";
import AuthPage from "./AuthPage";
import TrackerPageFullScreen from "./TrackerPageFullScreen";
import AdminPanel from "./AdminPanel";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

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
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;