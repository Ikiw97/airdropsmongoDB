import React, { useState } from "react";
import { LogIn, UserPlus, User, Lock, Mail, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useTheme } from "./contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const { theme } = useTheme();

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
      {/* Animated Background */}
      <div className="absolute inset-0 transition-all duration-300" style={{ background: 'var(--bg-primary)' }} />
      <div className="absolute inset-0 transition-all duration-300 opacity-10" style={{ background: 'linear-gradient(135deg, var(--neon-green) 0%, var(--neon-blue) 100%)' }} />

      {/* Cyber Grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Decorative Glow Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-20 blur-3xl animate-float"
        style={{ background: 'radial-gradient(circle, #00ff88 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-15 blur-3xl animate-float-slow"
        style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }}
      />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-[90%] max-w-md p-10 rounded-3xl transition-all duration-300 shadow-2xl"
        style={{
          background: 'var(--bg-secondary)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-primary)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 60px rgba(0, 255, 136, 0.05)'
        }}
      >
        {/* Logo/Icon Container */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-8 animate-neon-glow"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
            border: '2px solid rgba(0, 255, 136, 0.3)',
          }}
        >
          <Zap size={40} className="text-neon-green" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-2 text-center gradient-text"
        >
          {isLogin ? "Welcome Back" : "Create Account"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-400 mb-8 text-sm"
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
              <User size={20} className={focusedInput === "username" ? "text-neon-green" : "text-gray-500"} />
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
                  <Mail size={20} className={focusedInput === "email" ? "text-neon-green" : "text-gray-500"} />
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
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
              <Lock size={20} className={focusedInput === "password" ? "text-neon-green" : "text-gray-500"} />
              <input
                type="password"
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
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-3 rounded-lg text-center"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-3 rounded-lg text-center"
              style={{
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)'
              }}
            >
              <p className="text-neon-green text-sm font-medium">{success}</p>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
              color: '#0a0a0f',
              boxShadow: '0 4px 25px rgba(0, 255, 136, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = '0 8px 40px rgba(0, 255, 136, 0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = '0 4px 25px rgba(0, 255, 136, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
            data-testid="auth-button"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-crypto-dark border-t-transparent rounded-full animate-spin" />
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
            className="text-sm text-gray-400 hover:text-neon-green transition-colors duration-300"
          >
            {isLogin
              ? "Don't have an account? "
              : "Already have an account? "}
            <span className="text-neon-green font-semibold">
              {isLogin ? "Register" : "Login"}
            </span>
          </button>
        </motion.div>

        {/* Footer Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <Lock size={12} />
            Secure access to your crypto tracking dashboard
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
