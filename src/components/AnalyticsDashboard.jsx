import React, { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  Activity,
  Wallet,
  Clock,
  CheckCircle,
  Network,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

const AnalyticsDashboard = ({ projects = [], balances = [], selectedNetwork = "Ethereum" }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { theme } = useTheme();

  // Stats Logic
  const stats = useMemo(() => {
    const total = projects.length;
    const dailyTasks = projects.filter((p) => p.daily === "CHECKED").length;
    const ongoingProjects = projects.filter((p) => p.daily !== "CHECKED").length;
    const completionRate = total > 0 ? ((dailyTasks / total) * 100).toFixed(1) : 0;
    const uniqueWallets = new Set(projects.filter((p) => p.wallet).map((p) => p.wallet)).size;

    // Socials
    const withTwitter = projects.filter((p) => p.twitter).length;
    const withDiscord = projects.filter((p) => p.discord).length;
    const withTelegram = projects.filter((p) => p.telegram).length;

    return { total, dailyTasks, ongoingProjects, completionRate, uniqueWallets, withTwitter, withDiscord, withTelegram };
  }, [projects]);

  const pieData = [
    { name: "Done", value: stats.dailyTasks, color: "#00C087" }, // Coinglass Green
    { name: "Pending", value: stats.ongoingProjects, color: "#ee3f5b" }, // Coinglass Red/Pink
  ];

  const socialData = [
    { name: "Twitter", count: stats.withTwitter, color: "#1DA1F2" },
    { name: "Discord", count: stats.withDiscord, color: "#5865F2" },
    { name: "Telegram", count: stats.withTelegram, color: "#0088cc" },
  ];

  const activityData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][(new Date().getDay() - i + 7) % 7],
      checks: Math.floor(Math.random() * 10) + 2,
    })).reverse();
  }, []);

  return (
    <div className="w-full mb-6">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Activity size={20} />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Analytics Overview</h2>
          <span className="text-xs text-gray-500 font-mono">LIVE DATA</span>
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat Card 1 */}
              <div
                className="p-5 rounded-lg flex flex-col justify-between h-32 transition-all duration-300"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Total Projects</span>
                    <h3 className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{stats.total}</h3>
                  </div>
                  <div className="p-2 rounded-md bg-cyan-500/10 text-cyan-400">
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden transition-all duration-300 bg-slate-100 dark:bg-[#010409]">
                  <div className="h-full bg-cyan-500" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div
                className="p-5 rounded-lg flex flex-col justify-between h-32 transition-all duration-300"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Daily Completion</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{stats.dailyTasks}</h3>
                      <span className="text-sm text-gray-500">/ {stats.total}</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-md bg-green-500/10 text-green-400">
                    <CheckCircle size={18} />
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden transition-all duration-300 bg-slate-100 dark:bg-[#010409]">
                  <div className="h-full bg-green-500" style={{ width: `${stats.completionRate}%` }}></div>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div
                className="p-5 rounded-lg flex flex-col justify-between h-32 transition-all duration-300"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Wallets Used</span>
                    <h3 className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{stats.uniqueWallets}</h3>
                  </div>
                  <div className="p-2 rounded-md bg-purple-500/10 text-purple-400">
                    <Wallet size={18} />
                  </div>
                </div>
                <div className="flex gap-2 text-xs text-gray-400 mt-2">
                  <span className="text-green-400">Active</span> across multiple chains
                </div>
              </div>

              {/* Stat Card 4 */}
              <div
                className="p-5 rounded-lg flex flex-col justify-between h-32 transition-all duration-300"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Project Gap</span>
                    <h3 className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{stats.ongoingProjects}</h3>
                  </div>
                  <div className="p-2 rounded-md bg-yellow-500/10 text-yellow-400">
                    <Clock size={18} />
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden transition-all duration-300 bg-slate-100 dark:bg-[#010409]">
                  <div className="h-full bg-yellow-500" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Activity Chart */}
              <div
                className="p-5 rounded-lg transition-all duration-300"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
              >
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                  <Activity size={16} className="text-cyan-500" /> 7-Day Activity Trend
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '6px'
                        }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                        labelStyle={{ color: 'var(--text-secondary)' }}
                      />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6e7681', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6e7681', fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="checks"
                        stroke="#00C087"
                        strokeWidth={2}
                        dot={{ fill: '#00C087', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribution Chart */}
              <div
                className="p-5 rounded-lg transition-all duration-300"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
              >
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                  <Network size={16} className="text-purple-500" /> Task Distribution
                </h3>
                <div className="h-64 w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '6px'
                        }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                        labelStyle={{ color: 'var(--text-secondary)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{stats.completionRate}%</span>
                    <span className="text-xs text-gray-500 uppercase">Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsDashboard;
