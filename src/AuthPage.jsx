import React, { useState, useEffect } from "react";
import { LogIn, UserPlus, User, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import axios from "axios";
import { useTheme } from "./contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

// Cyberpunk Particle Component
const CyberParticles = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0 ? '#00ff88' : p.id % 3 === 1 ? '#00d4ff' : '#a855f7',
            boxShadow: `0 0 ${p.size * 2}px currentColor`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};





// Animated Border Component
const AnimatedBorder = ({ children, focused }) => (
  <div className="relative group">
    {/* Animated gradient border */}
    <motion.div
      className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{
        background: 'linear-gradient(90deg, #00ff88, #00d4ff, #a855f7, #00ff88)',
        backgroundSize: '300% 100%',
      }}
      animate={focused ? {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        opacity: 1,
      } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
    <div className="relative">{children}</div>
  </div>
);





// Animated Trading Chart Background
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Left Side Chart */}
      <svg className="absolute left-0 top-0 w-1/2 h-full" style={{ opacity: 'var(--chart-opacity)' }} viewBox="0 0 100 100" preserveAspectRatio="none">
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
      <svg className="absolute right-0 top-0 w-1/2 h-full" style={{ opacity: 'var(--chart-opacity)' }} viewBox="0 0 100 100" preserveAspectRatio="none">
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

      {/* Floating Crypto Prices */}
      <div className="absolute top-10 left-10">
        <motion.div
          className="text-xs font-mono opacity-20"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="text-green-400">BTC $67,432.18</span>
          <span className="text-green-400 ml-2">↑ 2.34%</span>
        </motion.div>
      </div>

      <div className="absolute top-20 right-16">
        <motion.div
          className="text-xs font-mono opacity-20"
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        >
          <span className="text-cyan-400">ETH $3,521.87</span>
          <span className="text-red-400 ml-2">↓ 0.82%</span>
        </motion.div>
      </div>

      <div className="absolute bottom-32 left-20">
        <motion.div
          className="text-xs font-mono opacity-20"
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
        >
          <span className="text-purple-400">SOL $178.42</span>
          <span className="text-green-400 ml-2">↑ 5.67%</span>
        </motion.div>
      </div>

      <div className="absolute bottom-20 right-24">
        <motion.div
          className="text-xs font-mono opacity-20"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
        >
          <span className="text-yellow-400">BNB $612.33</span>
          <span className="text-green-400 ml-2">↑ 1.23%</span>
        </motion.div>
      </div>

      {/* Volume Bars at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 flex items-end justify-around opacity-10 px-20">
        {Array.from({ length: 40 }, (_, i) => (
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

      {/* Crypto Symbols Floating */}
      <motion.div
        className="absolute top-1/4 left-10 text-4xl opacity-5 font-bold"
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        ₿
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-14 text-3xl opacity-5 font-bold"
        animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, delay: 1 }}
      >
        Ξ
      </motion.div>
      <motion.div
        className="absolute bottom-1/3 left-1/4 text-2xl opacity-5 font-bold"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 2 }}
      >
        ◎
      </motion.div>

      {/* Trading Indicator Lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 'var(--chart-opacity)' }} viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Resistance Line */}
        <motion.line
          x1="0" y1="25" x2="100" y2="25"
          stroke="#ff4757"
          strokeWidth="0.2"
          strokeDasharray="2,2"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        {/* Support Line */}
        <motion.line
          x1="0" y1="75" x2="100" y2="75"
          stroke="#00ff88"
          strokeWidth="0.2"
          strokeDasharray="2,2"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
        />
      </svg>
    </div>
  );
};

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct * 200);
    y.set(yPct * 200);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        const response = await axios.post(`${API_URL}/api/auth/login`, {
          username: form.username,
          password: form.password,
        });

        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        onLogin(response.data.user);
      } else {
        const response = await axios.post(`${API_URL}/api/auth/register`, {
          username: form.username,
          email: form.email,
          password: form.password,
        });

        if (response.data.is_admin) {
          setSuccess("✅ Admin account created! Please login.");
        } else {
          setSuccess("✅ Registration successful! Please wait for admin approval.");
        }

        setForm({ username: "", email: "", password: "" });
        setTimeout(() => setIsLogin(true), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "❌ An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      {/* Base Background */}
      {/* Base Background */}
      <div className="absolute inset-0" style={{ background: 'var(--bg-primary)' }} />
      <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 50%, var(--neon-purple) 0%, transparent 50%)', opacity: 0.1 }} />
      


      {/* Crypto Chart Background */}
      <CryptoChartBackground />
      
      {/* Particles */}
      <CyberParticles />
      


      {/* Decorative Glow Orbs with Pulse Animation */}
      <motion.div 
        className="absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, #00ff88 0%, transparent 70%)' }}
        animate={{ 
          opacity: [0.15, 0.25, 0.15],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }}
        animate={{ 
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
        animate={{ 
          opacity: [0.08, 0.15, 0.08],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Main Card with Animated Border and 3D Tilt */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
            rotateX: rotateX,
            rotateY: rotateY,
            transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-30 w-[90%] max-w-md perspective-1000"
      >
        {/* Outer glow effect */}
        <div 
          className="absolute -inset-1 rounded-3xl opacity-50 blur-xl"
          style={{ 
            background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan), var(--neon-purple))',
            opacity: 0.2,
            transform: 'translateZ(-50px)' 
          }}
        />
        
        {/* Animated border */}
        <motion.div
          className="absolute -inset-[2px] rounded-3xl"
          style={{
            background: 'linear-gradient(90deg, var(--neon-green), var(--neon-cyan), var(--neon-purple), var(--neon-green))',
            backgroundSize: '300% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Card Content */}
        <div 
          className="relative p-10 rounded-3xl transition-colors duration-300"
          style={{
            background: 'var(--card-bg)', // Use theme card background
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-primary)', // Use theme border
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' // Add subtle shadow
          }}
        >
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500 rounded-tl-3xl opacity-50" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-pink-500 rounded-tr-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-500 rounded-bl-3xl opacity-50" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-500 rounded-br-3xl opacity-50" />

          {/* Logo with Pulse Effect */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-28 h-28 rounded-2xl flex items-center justify-center mb-8 overflow-hidden relative"
          >
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ border: '2px solid rgba(0, 255, 136, 0.5)' }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ border: '2px solid rgba(0, 212, 255, 0.5)' }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            
            {/* Logo background */}
            <div 
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
                border: '2px solid rgba(0, 255, 136, 0.3)',
              }}
            />
            
            <motion.img 
              src="/logo.png" 
              alt="Logo" 
              className="w-20 h-20 object-contain rounded-xl relative z-10"
              animate={{ 
                filter: ['drop-shadow(0 0 10px #00ff88)', 'drop-shadow(0 0 20px #00d4ff)', 'drop-shadow(0 0 10px #00ff88)'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          {/* Title - Static */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-2 text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 via-green-400 to-purple-500 bg-clip-text text-transparent"
          >
            {isLogin ? "Welcome Back" : "Create Account"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8 text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            {isLogin
              ? "Sign in to your Airdrop Tracker account"
              : "Register for Airdrop Tracker"}
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <AnimatedBorder focused={focusedInput === "username"}>
                <div
                  className="flex items-center gap-3 px-5 py-4 rounded-xl transition-all duration-300"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: focusedInput === "username"
                      ? '1px solid var(--neon-green)'
                      : '1px solid var(--border-primary)',
                    boxShadow: focusedInput === "username"
                      ? '0 0 20px rgba(0, 255, 136, 0.15)'
                      : 'none'
                  }}
                >
                  <User size={20} className={focusedInput === "username" ? "text-neon-green" : "text-gray-500"} style={{ color: focusedInput === "username" ? 'var(--neon-green)' : 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    onFocus={() => setFocusedInput("username")}
                    onBlur={() => setFocusedInput(null)}
                    className="flex-1 bg-transparent outline-none transition-all duration-300"
                    style={{ color: 'var(--text-primary)' }}
                    data-testid="username-input"
                    required
                  />
                </div>
              </AnimatedBorder>
            </motion.div>

            {/* Email Input (Register only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatedBorder focused={focusedInput === "email"}>
                    <div
                      className="flex items-center gap-3 px-5 py-4 rounded-xl transition-all duration-300"
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: focusedInput === "email"
                          ? '1px solid var(--neon-green)'
                          : '1px solid var(--border-primary)',
                        boxShadow: focusedInput === "email"
                          ? '0 0 20px rgba(0, 255, 136, 0.15)'
                          : 'none'
                      }}
                    >
                      <Mail size={20} className={focusedInput === "email" ? "text-neon-green" : "text-gray-500"} style={{ color: focusedInput === "email" ? 'var(--neon-green)' : 'var(--text-secondary)' }} />
                      <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        onFocus={() => setFocusedInput("email")}
                        onBlur={() => setFocusedInput(null)}
                        className="flex-1 bg-transparent outline-none transition-all duration-300"
                        style={{ color: 'var(--text-primary)' }}
                        data-testid="email-input"
                        required={!isLogin}
                      />
                    </div>
                  </AnimatedBorder>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <AnimatedBorder focused={focusedInput === "password"}>
                <div
                  className="flex items-center gap-3 px-5 py-4 rounded-xl transition-all duration-300"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: focusedInput === "password"
                      ? '1px solid var(--neon-green)'
                      : '1px solid var(--border-primary)',
                    boxShadow: focusedInput === "password"
                      ? '0 0 20px rgba(0, 255, 136, 0.15)'
                      : 'none'
                  }}
                >
                  <Lock size={20} className={focusedInput === "password" ? "text-neon-green" : "text-gray-500"} style={{ color: focusedInput === "password" ? 'var(--neon-green)' : 'var(--text-secondary)' }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                    className="flex-1 bg-transparent outline-none transition-all duration-300"
                    style={{ color: 'var(--text-primary)' }}
                    data-testid="password-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:opacity-80 transition-opacity"
                  >
                    {showPassword ? (
                      <EyeOff size={20} style={{ color: focusedInput === "password" ? 'var(--neon-green)' : 'var(--text-secondary)' }} />
                    ) : (
                      <Eye size={20} style={{ color: focusedInput === "password" ? 'var(--neon-green)' : 'var(--text-secondary)' }} />
                    )}
                  </button>
                </div>
              </AnimatedBorder>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="px-4 py-3 rounded-lg text-center"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)'
                  }}
                >
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="px-4 py-3 rounded-lg text-center"
                  style={{
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)'
                  }}
                >
                  <p className="text-green-400 text-sm font-medium">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button with Cyber Effect */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              type="submit"
              disabled={loading}
              className="relative w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
                color: '#0a0a0f',
              }}
              whileHover={{ 
                boxShadow: '0 0 40px rgba(0, 255, 136, 0.6), 0 0 80px rgba(0, 212, 255, 0.3)',
                scale: 1.02,
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                }}
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
              
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.div 
                    className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Loading...
                </span>
              ) : isLogin ? (
                <>
                  <LogIn size={20} />
                  <span>Sign In</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Register</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle Login/Register */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center"
          >
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
              }}
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--text-secondary)' }}
            >
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <span className="font-semibold transition-colors" style={{ color: 'var(--neon-green)' }}>
                {isLogin ? "Register" : "Login"}
              </span>
            </button>
          </motion.div>

          {/* Footer with Typing Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <Lock size={12} className="text-green-500" />
              <span className="font-mono">Secure access to your crypto tracking dashboard</span>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Custom CSS for additional effects */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
