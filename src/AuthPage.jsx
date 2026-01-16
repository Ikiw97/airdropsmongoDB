import React, { useState } from "react";
import { LogIn, UserPlus, User, Lock, Mail, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useTheme } from "./contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

// Static Background Component
const StaticBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0" style={{ background: 'var(--bg-primary)' }} />
    <div className="absolute inset-0 opacity-10"
      style={{
        background: 'linear-gradient(rgba(130,130,130,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(130,130,130,0.1) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}
    />
    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
  </div>
);

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      <StaticBackground />

      <div className="relative z-10 w-full max-w-md p-6">
        <div
          className="relative p-8 rounded-2xl border transition-colors duration-300"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--border-primary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-green-400/20 to-cyan-400/20 flex items-center justify-center border border-green-400/30">
              <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>

          <p className="text-center mb-6 text-sm opacity-70" style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Sign in to your account" : "Register for full access"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-500 group-focus-within:text-green-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-transparent border outline-none transition-colors"
                style={{
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
                required
              />
            </div>

            {!isLogin && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-500 group-focus-within:text-green-400 transition-colors" />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-transparent border outline-none transition-colors"
                  style={{
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                  required
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500 group-focus-within:text-green-400 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 rounded-lg bg-transparent border outline-none transition-colors"
                style={{
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-70"
              >
                {showPassword ? <EyeOff size={18} className="text-gray-500" /> : <Eye size={18} className="text-gray-500" />}
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                background: 'linear-gradient(to right, #00ff88, #00d4ff)',
              }}
            >
              {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
              }}
              className="text-sm hover:underline underline-offset-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="font-semibold text-green-400">
                {isLogin ? "Register" : "Login"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
