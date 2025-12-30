import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  CheckCircle,
  Clock,
  Wallet,
  Network,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  fadeInUpVariants,
  containerVariants,
  itemVariants,
  cardVariants,
  buttonHoverVariants,
} from "../utils/animationVariants";

import { useTheme } from "../contexts/ThemeContext";

const AnalyticsDashboard = ({ projects = [], balances = [], selectedNetwork = "Ethereum" }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { theme } = useTheme();

  // ===== Pure Frontend Calculations =====
  const stats = useMemo(() => {
    const total = projects.length;
    // Daily Tasks = project yang sudah di-check hari ini
    const dailyTasks = projects.filter((p) => p.daily === "CHECKED").length;
    // Ongoing Projects = project yang masih aktif tapi belum di-check (bukan daily routine)
    const ongoingProjects = projects.filter((p) => p.daily !== "CHECKED").length;
    const completionRate = total > 0 ? ((dailyTasks / total) * 100).toFixed(1) : 0;
    const uniqueWallets = new Set(
      projects.filter((p) => p.wallet).map((p) => p.wallet)
    ).size;

    const networkCount = {};
    projects.forEach((p) => {
      if (p.wallet) {
        const net = p.network || "Ethereum";
        networkCount[net] = (networkCount[net] || 0) + 1;
      }
    });

    const withTwitter = projects.filter((p) => p.twitter).length;
    const withDiscord = projects.filter((p) => p.discord).length;
    const withTelegram = projects.filter((p) => p.telegram).length;

    // Dapatkan last update dari daily tasks yang terbaru
    const dailyProjects = projects.filter((p) => p.daily === "CHECKED");
    let lastDailyUpdate = null;
    if (dailyProjects.length > 0) {
      const sortedByDate = dailyProjects
        .filter(p => p.lastupdate)
        .sort((a, b) => new Date(b.lastupdate) - new Date(a.lastupdate));
      if (sortedByDate.length > 0) {
        lastDailyUpdate = sortedByDate[0].lastupdate;
      }
    }

    return {
      total,
      dailyTasks,
      ongoingProjects,
      completionRate,
      uniqueWallets,
      networkCount,
      withTwitter,
      withDiscord,
      withTelegram,
      lastDailyUpdate,
    };
  }, [projects]);

  const pieData = [
    { name: "Daily Tasks", value: stats.dailyTasks, color: "#22c55e" },
    { name: "Ongoing Projects", value: stats.ongoingProjects, color: "#facc15" },
  ];

  const socialData = [
    { name: "Twitter", count: stats.withTwitter, color: "#1DA1F2" },
    { name: "Discord", count: stats.withDiscord, color: "#5865F2" },
    { name: "Telegram", count: stats.withTelegram, color: "#0088cc" },
  ];

  const balanceSummary = useMemo(() => {
    if (balances.length === 0) return null;
    const validBalances = balances.filter(
      (b) => !b.balance.includes("Error") && !b.balance.includes("Invalid")
    );
    const total = validBalances.reduce(
      (sum, b) => sum + parseFloat(b.balance),
      0
    );
    const nonZero = validBalances.filter((b) => parseFloat(b.balance) > 0).length;

    return {
      total: total.toFixed(6),
      count: validBalances.length,
      nonZero,
    };
  }, [balances]);

  const activityData = useMemo(() => {
    const days = 7;
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      data.push({
        day: dayName,
        checks: Math.max(1, Math.floor(Math.random() * Math.max(1, stats.total))),
      });
    }
    return data;
  }, [stats.total]);

  // Render
  return (
    <motion.div
      className="relative z-10 w-full mb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        className="bg-main-light dark:bg-main-dark rounded-3xl shadow-neu-flat dark:shadow-neu-flat-dark p-6 transition-all flex justify-between items-center"
        variants={fadeInUpVariants}
        whileHover={{ scale: 1.01 }}
      >
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-600 dark:text-gray-200">
          <Activity size={28} className="text-cyan-500" />{" "}
          <span>Analytics Dashboard</span>
        </h2>

        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-main-light dark:bg-main-dark rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark transition p-2 md:px-4 md:py-2 flex items-center gap-2 text-gray-600 dark:text-gray-300 font-semibold"
          variants={buttonHoverVariants}
          whileHover="hover"
          whileTap="tap"
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {isExpanded ? "Collapse" : "Expand"}
        </motion.button>
      </motion.div>

      {/* Dashboard Content */}
      {isExpanded && (
        <motion.div
          className="bg-main-light dark:bg-main-dark rounded-3xl shadow-neu-flat dark:shadow-neu-flat-dark p-6 transition-all mt-4 space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Stats Row */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {[
              {
                label: "Total Projects",
                value: stats.total,
                color: "#06b6d4",
                icon: TrendingUp,
              },
              {
                label: "Daily Tasks ✓",
                value: stats.dailyTasks,
                color: "#22c55e",
                icon: CheckCircle,
                subtitle: stats.lastDailyUpdate ? `Last: ${new Date(stats.lastDailyUpdate).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}` : null
              },
              {
                label: "Ongoing Projects",
                value: stats.ongoingProjects,
                color: "#facc15",
                icon: Clock,
              },
              {
                label: "Completion Rate",
                value: `${stats.completionRate}%`,
                color: "#8b5cf6",
                icon: Activity,
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                className="bg-main-light dark:bg-main-dark rounded-3xl p-5 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark transition-all flex items-center justify-between"
                variants={cardVariants}
                custom={i}
                whileHover="hover"
              >
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
                  {card.subtitle && (
                    <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">{card.subtitle}</p>
                  )}
                </div>
                <card.icon size={32} style={{ color: card.color }} />
              </motion.div>
            ))}
          </motion.div>

          {/* Secondary Stats */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div className="bg-main-light dark:bg-main-dark rounded-3xl p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-all" variants={itemVariants}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Wallet size={24} className="text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unique Wallets</p>
                  <p className="text-xl font-bold text-gray-600 dark:text-gray-200">{stats.uniqueWallets}</p>
                </div>
              </div>
            </motion.div>

            <motion.div className="bg-main-light dark:bg-main-dark rounded-3xl p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-all" variants={itemVariants}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Network size={24} className="text-cyan-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Networks Used</p>
                  <p className="text-xl font-bold text-gray-600 dark:text-gray-200">
                    {Object.keys(stats.networkCount).length || 1}
                  </p>
                </div>
              </div>
            </motion.div>

            {balanceSummary && (
              <motion.div className="bg-main-light dark:bg-main-dark rounded-3xl p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-all" variants={itemVariants}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <CheckCircle size={24} className="text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Balance Checked</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {balanceSummary.total}{" "}
                      {selectedNetwork === "BSC"
                        ? "BNB"
                        : selectedNetwork === "Polygon"
                          ? "MATIC"
                          : "ETH"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {balanceSummary.nonZero} wallets with balance
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Charts */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div className="bg-main-light dark:bg-main-dark rounded-3xl p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-all" variants={fadeInUpVariants}>
              <h3 className="text-lg font-semibold mb-3 text-gray-600 dark:text-gray-300">
                Task Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: theme === 'dark' ? '#1e293b' : '#e0e5ec',
                      border: "none",
                      color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
                      borderRadius: "8px",
                      boxShadow: theme === 'dark'
                        ? '4px 4px 8px #0f172a, -4px -4px 8px #334155'
                        : '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div className="bg-main-light dark:bg-main-dark rounded-3xl p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-all" variants={fadeInUpVariants}>
              <h3 className="text-lg font-semibold mb-3 text-gray-600 dark:text-gray-300">
                Social Media Integration
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={socialData}>
                  <XAxis dataKey="name" stroke={theme === 'dark' ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={theme === 'dark' ? "#9ca3af" : "#6b7280"} />
                  <Tooltip
                    cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                    contentStyle={{
                      background: theme === 'dark' ? '#1e293b' : '#e0e5ec',
                      border: "none",
                      color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
                      borderRadius: "8px",
                      boxShadow: theme === 'dark'
                        ? '4px 4px 8px #0f172a, -4px -4px 8px #334155'
                        : '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {socialData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>

          {/* Activity Line Chart */}
          <motion.div className="bg-main-light dark:bg-main-dark rounded-3xl p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-all" variants={fadeInUpVariants}>
            <h3 className="text-lg font-semibold mb-3 text-gray-600 dark:text-gray-300">
              Daily Activity (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={activityData}>
                <XAxis dataKey="day" stroke={theme === 'dark' ? "#9ca3af" : "#6b7280"} />
                <YAxis stroke={theme === 'dark' ? "#9ca3af" : "#6b7280"} />
                <Tooltip
                  contentStyle={{
                    background: theme === 'dark' ? '#1e293b' : '#e0e5ec',
                    border: "none",
                    color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
                    borderRadius: "8px",
                    boxShadow: theme === 'dark'
                      ? '4px 4px 8px #0f172a, -4px -4px 8px #334155'
                      : '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="checks"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: "#06b6d4", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Progress Bar */}
          <motion.div className="bg-main-light dark:bg-main-dark rounded-3xl p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-all" variants={fadeInUpVariants}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                Overall Progress
              </h3>
              <span className="text-2xl font-bold" style={{ color: "#8b5cf6" }}>
                {stats.completionRate}%
              </span>
            </div>
            <div
              className="w-full rounded-full h-6 bg-main-light dark:bg-main-dark relative shadow-neu-pressed dark:shadow-neu-pressed-dark"
            >
              <motion.div
                className="absolute top-0 left-0 h-6 rounded-full flex items-center justify-end pr-3 text-xs font-semibold"
                style={{
                  background: "linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899)",
                  color: "#fff",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${stats.completionRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {stats.dailyTasks}/{stats.total}
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Insights */}
          <motion.div className="bg-main-light dark:bg-main-dark rounded-3xl p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-all" variants={fadeInUpVariants}>
            <h3 className="text-lg font-semibold mb-3 text-gray-600 dark:text-gray-300">
              📊 Quick Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600 dark:text-gray-400">
              <motion.div variants={itemVariants}>✓ Daily Tasks Checked: {stats.dailyTasks}</motion.div>
              <motion.div variants={itemVariants}>⏱ Ongoing Projects: {stats.ongoingProjects}</motion.div>
              <motion.div variants={itemVariants}>🌐 {stats.withTwitter} Twitter linked</motion.div>
              <motion.div variants={itemVariants}>💰 {stats.uniqueWallets} unique wallets</motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnalyticsDashboard;
