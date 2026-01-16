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

// Animated Trading Chart Background Component
const CryptoChartBackground = () => {
  // Generate candlestick data
  const candlesticks = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: 3 + i * 3.2,
    open: 20 + Math.random() * 60,
    close: 20 + Math.random() * 60,
    high: 10 + Math.random() * 20,
    low: 10 + Math.random() * 20,
  }));

  // Generate price line points
  const generatePriceLine = () => {
    let y = 50;
    return Array.from({ length: 100 }, (_, i) => {
      y += (Math.random() - 0.48) * 8;
      y = Math.max(10, Math.min(90, y));
      return `${i},${y}`;
    }).join(' ');
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Left Side Chart */}
      <svg className="absolute left-0 top-0 w-1/2 h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Candlesticks */}
        {candlesticks.slice(0, 15).map((c) => {
          const isGreen = c.close > c.open;
          const top = Math.min(c.open, c.close);
          const height = Math.abs(c.close - c.open);
          return (
            <g key={c.id}>
              {/* Wick */}
              <motion.line
                x1={c.x + 1}
                y1={top - c.high}
                x2={c.x + 1}
                y2={top + height + c.low}
                stroke={isGreen ? '#00ff88' : '#ff4757'}
                strokeWidth="0.3"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: c.id * 0.1 }}
              />
              {/* Body */}
              <motion.rect
                x={c.x}
                y={top}
                width="2"
                height={Math.max(height, 1)}
                fill={isGreen ? '#00ff88' : '#ff4757'}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: c.id * 0.1 }}
              />
            </g>
          );
        })}

        {/* Moving Average Line */}
        <motion.polyline
          fill="none"
          stroke="#00d4ff"
          strokeWidth="0.5"
          points={generatePriceLine()}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </svg>

      {/* Right Side Chart */}
      <svg className="absolute right-0 top-0 w-1/2 h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
        {candlesticks.slice(15).map((c) => {
          const isGreen = c.close > c.open;
          const top = Math.min(c.open, c.close);
          const height = Math.abs(c.close - c.open);
          return (
            <g key={c.id}>
              <motion.line
                x1={c.x - 45}
                y1={top - c.high}
                x2={c.x - 45}
                y2={top + height + c.low}
                stroke={isGreen ? '#00ff88' : '#ff4757'}
                strokeWidth="0.3"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: c.id * 0.1 }}
              />
              <motion.rect
                x={c.x - 46}
                y={top}
                width="2"
                height={Math.max(height, 1)}
                fill={isGreen ? '#00ff88' : '#ff4757'}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: c.id * 0.1 }}
              />
            </g>
          );
        })}

        <motion.polyline
          fill="none"
          stroke="#a855f7"
          strokeWidth="0.5"
          points={generatePriceLine()}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </svg>

      {/* Volume Bars at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-around opacity-10 px-10">
        {Array.from({ length: 50 }, (_, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-t"
            style={{
              background: i % 2 === 0 ? '#00ff88' : '#00d4ff',
              height: `${10 + Math.random() * 50}%`,
            }}
            animate={{
              height: [`${10 + Math.random() * 50}%`, `${20 + Math.random() * 60}%`, `${10 + Math.random() * 50}%`],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.05,
            }}
          />
        ))}
      </div>

      {/* Trading Indicator Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Resistance Line */}
        <motion.line
          x1="0" y1="20" x2="100" y2="20"
          stroke="#ff4757"
          strokeWidth="0.15"
          strokeDasharray="2,2"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        {/* Support Line */}
        <motion.line
          x1="0" y1="80" x2="100" y2="80"
          stroke="#00ff88"
          strokeWidth="0.15"
          strokeDasharray="2,2"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
        />
      </svg>
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
