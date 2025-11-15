import React, { useState } from "react";
import { LogIn, UserPlus, User, Lock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await axios.post(`${API_URL}/api/auth/login`, {
          username: form.username,
          password: form.password,
        });
        
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        onLogin(response.data.user);
      } else {
        // Register
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
    <div
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #e3edf7 0%, #d4e4f7 50%, #dfe9f5 100%)",
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-30"
        style={{
          background: "linear-gradient(135deg, #a8d5f2, #7cb9e8)",
          boxShadow: "20px 20px 60px #b8c9d9, -20px -20px 60px #ffffff",
        }}
      ></div>
      <div
        className="absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-20"
        style={{
          background: "linear-gradient(135deg, #c4d7f2, #9dc4e8)",
          boxShadow: "20px 20px 60px #b8c9d9, -20px -20px 60px #ffffff",
        }}
      ></div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-[90%] max-w-md p-10 rounded-3xl"
        style={{
          background: "#e3edf7",
          boxShadow: "20px 20px 60px #becad6, -20px -20px 60px #ffffff",
        }}
      >
        {/* Logo/Icon Container */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-8"
          style={{
            background: "#e3edf7",
            boxShadow: "inset 8px 8px 16px #becad6, inset -8px -8px 16px #ffffff",
          }}
        >
          <User size={40} className="text-gray-600" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-2 text-center text-gray-700"
        >
          {isLogin ? "Welcome Back" : "Create Account"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-500 mb-8 text-sm"
        >
          {isLogin
            ? "Sign in to your Airdrop Tracker account"
            : "Register for Airdrop Tracker"}
        </motion.p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300"
              style={{
                background: "#e3edf7",
                boxShadow:
                  focusedInput === "username"
                    ? "inset 6px 6px 12px #becad6, inset -6px -6px 12px #ffffff"
                    : "6px 6px 12px #becad6, -6px -6px 12px #ffffff",
              }}
            >
              <User size={20} className="text-gray-500" />
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                onFocus={() => setFocusedInput("username")}
                onBlur={() => setFocusedInput(null)}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
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
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300"
                  style={{
                    background: "#e3edf7",
                    boxShadow:
                      focusedInput === "email"
                        ? "inset 6px 6px 12px #becad6, inset -6px -6px 12px #ffffff"
                        : "6px 6px 12px #becad6, -6px -6px 12px #ffffff",
                  }}
                >
                  <Mail size={20} className="text-gray-500" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput(null)}
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
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
              className="flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300"
              style={{
                background: "#e3edf7",
                boxShadow:
                  focusedInput === "password"
                    ? "inset 6px 6px 12px #becad6, inset -6px -6px 12px #ffffff"
                    : "6px 6px 12px #becad6, -6px -6px 12px #ffffff",
              }}
            >
              <Lock size={20} className="text-gray-500" />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                data-testid="password-input"
                required
              />
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-red-500 text-sm text-center font-medium"
            >
              {error}
            </motion.p>
          )}

          {/* Success Message */}
          {success && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-green-600 text-sm text-center font-medium"
            >
              {success}
            </motion.p>
          )}

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-semibold text-gray-700 flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "#e3edf7",
              boxShadow: "6px 6px 12px #becad6, -6px -6px 12px #ffffff",
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow =
                  "inset 4px 4px 8px #becad6, inset -4px -4px 8px #ffffff";
              }
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow =
                "6px 6px 12px #becad6, -6px -6px 12px #ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "6px 6px 12px #becad6, -6px -6px 12px #ffffff";
            }}
            data-testid="auth-button"
          >
            {loading ? (
              <span>Loading...</span>
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
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </motion.div>

        {/* Footer Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-500">
            Secure access to your crypto tracking dashboard
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthPage;