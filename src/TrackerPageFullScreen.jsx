import React, { useEffect, useState, useMemo } from "react";
import {
  Twitter,
  MessageCircle,
  Send,
  Wallet,
  Mail,
  Globe,
  Github,
  Eye,
  EyeOff,
  LogOut,
  ArrowUpDown,
  CheckSquare,
  Square,
  ExternalLink,
  Tag,
  StickyNote,
  Filter,
  X,
  Menu,
  ChevronLeft,
  Activity,
  Fuel,
  Calculator,
  Newspaper,
  LayoutDashboard,
  Trash2,
  Zap,
  Shield,
  CheckCircle,
  Repeat,
  Radio,
  Gift,
  Search,
  User,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUpVariants, cardVariants, containerVariants, listItemVariants, buttonHoverVariants, scaleInVariants } from "./utils/animationVariants";
import { useTheme } from "./contexts/ThemeContext";

// Components
import TopUtilityBar from "./components/TopUtilityBar";
import MetricCards from "./components/MetricCards";
import NavigationTabs from "./components/NavigationTabs";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import GasTracker from "./components/GasTracker";
import ROICalculator from "./components/ROICalculator";
import NewsAggregator from "./components/NewsAggregator";
import NewsTicker from "./components/NewsTicker";
import MultisendTool from "./components/MultisendTool";
import TradingPlatform from "./components/TradingPlatform";
import BalanceChecker from "./components/BalanceChecker";
import DexList from "./components/DexList";
import InfoAirdrops from "./components/InfoAirdrops";
import PrivateKeyGeneratorSecure from "./components/PrivateKeyGeneratorSecure";
import MarketOverview from "./components/MarketOverview";
import BubbleMap from "./components/BubbleMap/BubbleMap";
import apiService from "./api/apiService";
import { secureLogger } from "./utils/dataSecurityUtils";

const AVAILABLE_TAGS = [
  { id: "defi", label: "DeFi", color: "bg-gradient-to-r from-cyan-500 to-teal-400" },
  { id: "gamefi", label: "GameFi", color: "bg-gradient-to-r from-purple-500 to-pink-400" },
  { id: "layer2", label: "Layer2", color: "bg-gradient-to-r from-green-500 to-emerald-400" },
  { id: "nft", label: "NFT", color: "bg-gradient-to-r from-pink-500 to-rose-400" },
  { id: "meme", label: "Meme", color: "bg-gradient-to-r from-yellow-500 to-orange-400" },
  { id: "infra", label: "Infrastructure", color: "bg-gradient-to-r from-cyan-500 to-teal-400" },
  { id: "social", label: "SocialFi", color: "bg-gradient-to-r from-orange-500 to-amber-400" },
  { id: "bridge", label: "Bridge", color: "bg-gradient-to-r from-indigo-500 to-violet-400" },
  { id: "dex", label: "DEX", color: "bg-gradient-to-r from-red-500 to-rose-400" },
  { id: "lending", label: "Lending", color: "bg-gradient-to-r from-teal-500 to-cyan-400" },
];

// Success Popup with Coinglass style
function SuccessPopup({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative max-w-md w-full p-5 rounded-lg transition-all duration-300 shadow-2xl"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(0, 255, 136, 0.15)' }}>
            <CheckCircle size={24} className="text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-400">Success</h3>
            <p className="text-gray-300 text-sm">{message}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X size={18} />
          </button>
        </div>
        <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0, 255, 136, 0.1)' }}>
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 3, ease: 'linear' }}
            className="h-full bg-green-400"
          />
        </div>
      </motion.div>
    </div>
  );
}

function TrackerPageFullScreen({ onLogout, user, onShowAdmin }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hideData, setHideData] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [coins, setCoins] = useState([]);
  const [timer, setTimer] = useState(60);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { theme } = useTheme();

  const [selectedTags, setSelectedTags] = useState([]);
  const [filterTag, setFilterTag] = useState("all");
  const [filterDaily, setFilterDaily] = useState("all");

  const [activeView, setActiveView] = useState("market-data");
  const [isMobile, setIsMobile] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Market Data (Coins)
  const fetchMarketCoin = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h"
      );
      const data = await res.json();
      setCoins(data);
    } catch (error) {
      console.error("Failed to fetch market data", error);
    }
  };

  useEffect(() => {
    fetchMarketCoin();
    const interval = setInterval(fetchMarketCoin, 60000);
    return () => clearInterval(interval);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    twitter: "",
    discord: "",
    telegram: "",
    farcaster: "",
    wallet: "",
    email: "",
    github: "",
    website: "",
    notes: "",
    tags: [],
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = projects.length;
    const dailyTasks = projects.filter((p) => p.daily === "CHECKED").length;
    const ongoingProjects = projects.filter((p) => p.daily !== "CHECKED").length;
    const completionRate = total > 0 ? ((dailyTasks / total) * 100).toFixed(1) : 0;
    const uniqueWallets = new Set(projects.filter((p) => p.wallet).map((p) => p.wallet)).size;
    return { total, dailyTasks, ongoingProjects, completionRate, uniqueWallets };
  }, [projects]);

  const fetchProjects = async () => {
    try {
      const data = await apiService.getProjects();
      secureLogger.log('FETCH_PROJECTS', { count: Array.isArray(data) ? data.length : 0 }, 'info');
      if (Array.isArray(data)) {
        const parsedData = data.map(project => ({
          ...project,
          tags: project.tags || [],
          notes: project.notes || ""
        }));
        setProjects(parsedData);
      }
    } catch (error) {
      secureLogger.logError('FETCH_PROJECTS_ERROR', error, {});
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const addProject = async () => {
    if (!formData.name) return alert("Nama project wajib diisi!");
    try {
      setLoading(true);
      await apiService.createProject(formData);
      setSuccessMessage(`Project "${formData.name}" berhasil ditambahkan!`);
      setShowSuccessPopup(true);
      fetchProjects();
      setFormData({ name: "", twitter: "", discord: "", telegram: "", farcaster: "", wallet: "", email: "", github: "", website: "", notes: "", tags: [] });
      setSelectedTags([]);
      setShowAddForm(false);
    } catch (error) {
      alert(error.response?.data?.detail || "❌ Gagal menambahkan project!");
    } finally {
      setLoading(false);
    }
  };

  const toggleDaily = async (name, current) => {
    const next = current === "CHECKED" ? "UNCHECKED" : "CHECKED";
    try {
      await apiService.updateDaily(name, next);
      if (next === "CHECKED") {
        setSuccessMessage(`Daily task "${name}" checked! ✓`);
        setShowSuccessPopup(true);
      }
      fetchProjects();
    } catch (err) {
      alert("❌ Gagal update daily status!");
    }
  };

  const toggleDistributed = async (name, current) => {
    try {
      await apiService.updateDistributed(name, !current);
      if (!current) {
        setSuccessMessage(`"${name}" marked as distributed! 🎁`);
        setShowSuccessPopup(true);
      }
      fetchProjects();
    } catch (err) {
      alert("❌ Gagal update status!");
    }
  };

  const deleteProject = async (name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      setLoading(true);
      await apiService.deleteProject(name);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.detail || "❌ Gagal menghapus!");
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId];
      setFormData((f) => ({ ...f, tags: newTags }));
      return newTags;
    });
  };

  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTags = filterTag === "all" || (p.tags?.includes(filterTag));
      const matchesDaily = filterDaily === "all" || (filterDaily === "checked" && p.daily === "CHECKED") || (filterDaily === "unchecked" && p.daily !== "CHECKED");
      return matchesSearch && matchesTags && matchesDaily;
    })
    .sort((a, b) => {
      const A = (a.name || "").toLowerCase();
      const B = (b.name || "").toLowerCase();
      return sortOrder === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    });

  const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 6);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <SuccessPopup message={successMessage} onClose={() => setShowSuccessPopup(false)} />
        )}
      </AnimatePresence>

      {/* News Ticker */}
      <NewsTicker />

      {/* Top Utility Bar */}
      <TopUtilityBar stats={stats} />

      {/* Main Header */}
      <header
        className="flex items-center justify-between px-4 py-3"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }}
      >
        {/* Left - Logo */}
        <div className="flex items-center gap-3">
          <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-black tracking-wider glitch-effect text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#0da5aa] to-[#ec4899] hover:brightness-125 transition-all duration-300 cursor-default select-none" style={{ fontFamily: '"Orbitron", sans-serif' }}>
            Airdrop Tracker
          </h1>
        </div>

        {/* Center - Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <Search size={16} style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-current appearance-none border-none placeholder-gray-500"
              style={{ color: 'var(--text-primary)', background: 'transparent' }}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {user?.is_admin && (
            <button
              onClick={onShowAdmin}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300"
              style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                color: 'var(--text-primary)'
              }}
            >
              <Shield size={16} className="text-cyan-500" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300"
            style={{
              background: 'rgba(246, 70, 93, 0.1)',
              border: '1px solid rgba(246, 70, 93, 0.2)',
              color: 'var(--text-primary)'
            }}
          >
            <LogOut size={16} className="text-red-500" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Metric Cards */}
      <MetricCards stats={stats} />

      {/* Navigation Tabs */}
      <NavigationTabs activeView={activeView} setActiveView={setActiveView} isMobile={isMobile} />

      {/* Main Content */}
      <main className="p-4">
        {activeView === "trading" && <TradingPlatform />}
        {activeView === "analytics" && <AnalyticsDashboard projects={projects} />}
        {activeView === "gas" && <GasTracker />}
        {activeView === "roi" && <ROICalculator />}
        {activeView === "news" && <NewsAggregator />}
        {activeView === "balance" && <BalanceChecker />}
        {activeView === "keygen" && <PrivateKeyGeneratorSecure />}
        {activeView === "dexlist" && <DexList />}
        {activeView === "multisend" && <MultisendTool />}
        {activeView === "infoairdrops" && <InfoAirdrops />}
        {activeView === "market-data" && <MarketOverview />}


        {activeView === "projects" && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
                style={{
                  background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                  color: '#0d1117',
                }}
              >
                ➕ Add Airdrop
              </button>

              {/* Mobile Search */}
              <div className="flex md:hidden flex-1">
                <div
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all duration-300"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
                >
                  <Search size={14} className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent outline-none placeholder-gray-500 text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Filters */}
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none transition-all duration-300"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              >
                <option value="all">All Tags</option>
                {AVAILABLE_TAGS.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.label}</option>
                ))}
              </select>

              <select
                value={filterDaily}
                onChange={(e) => setFilterDaily(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none transition-all duration-300"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              >
                <option value="all">All Status</option>
                <option value="checked">✅ Checked</option>
                <option value="unchecked">⬜ Ongoing</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-cyan-400 transition-all duration-300"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
              >
                <ArrowUpDown size={14} />
                {sortOrder === "asc" ? "A-Z" : "Z-A"}
              </button>

              <button
                onClick={() => setHideData(!hideData)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-cyan-400 transition-all duration-300"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
              >
                {hideData ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>

            {/* Add Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="p-5 rounded-lg transition-all duration-300"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Add New Airdrop</h3>
                      <button onClick={() => setShowAddForm(false)} className="transition-all duration-300 p-1 rounded-md" style={{ color: 'var(--text-secondary)' }}>
                        <X size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {["name", "twitter", "discord", "telegram", "farcaster", "wallet", "email", "github", "website"].map((field) => (
                        <input
                          key={field}
                          type="text"
                          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                          value={formData[field]}
                          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                          className="px-3 py-2 rounded-lg text-sm border outline-none focus:border-cyan-500 transition-all duration-300"
                          style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                        />
                      ))}
                    </div>

                    <textarea
                      placeholder="Notes..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full mt-3 px-3 py-2 rounded-lg text-sm border outline-none focus:border-cyan-500 transition-all duration-300 resize-none"
                      style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                      rows="2"
                    />

                    <div className="flex flex-wrap gap-2 mt-3">
                      {AVAILABLE_TAGS.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${selectedTags.includes(tag.id)
                            ? `${tag.color} text-white`
                            : 'hover:opacity-80'
                            }`}
                          style={{
                            background: selectedTags.includes(tag.id) ? '' : 'var(--bg-tertiary)',
                            color: selectedTags.includes(tag.id) ? 'white' : 'var(--text-secondary)',
                            border: selectedTags.includes(tag.id) ? 'none' : '1px solid var(--border-primary)'
                          }}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={addProject}
                      disabled={loading}
                      className="mt-4 px-6 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #00ff88, #00d4ff)', color: '#0d1117' }}
                    >
                      {loading ? "Adding..." : "Add Airdrop"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedProjects.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative p-4 rounded-lg transition-all duration-300 hover:border-cyan-500/50 ${p.distributed ? 'border-yellow-500/30' : ''}`}
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
                >
                  {p.distributed && (
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Gift size={10} /> DISTRIBUTED
                    </span>
                  )}

                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{p.name}</h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleDistributed(p.name, p.distributed)}
                        className={`p-1.5 rounded ${p.distributed ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
                      >
                        <Gift size={14} />
                      </button>
                      <button
                        onClick={() => toggleDaily(p.name, p.daily)}
                        className={`p-1.5 rounded ${p.daily === 'CHECKED' ? 'text-green-400' : 'text-gray-500 hover:text-green-400'}`}
                      >
                        {p.daily === 'CHECKED' ? <CheckSquare size={14} /> : <Square size={14} />}
                      </button>
                      <button
                        onClick={() => deleteProject(p.name)}
                        className="p-1.5 rounded text-gray-500 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {p.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {p.tags.map((tagId) => {
                        const tag = AVAILABLE_TAGS.find((t) => t.id === tagId);
                        return tag ? (
                          <span key={tagId} className={`${tag.color} text-white text-[10px] px-1.5 py-0.5 rounded-full`}>
                            {tag.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  {p.notes && (
                    <p className="text-xs text-gray-500 italic mb-2 line-clamp-2">{p.notes}</p>
                  )}

                  <div className="space-y-1 text-xs">
                    {p.twitter && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Twitter size={12} className="text-blue-400" />
                        <span className="truncate">{hideData ? '••••••' : p.twitter}</span>
                      </div>
                    )}
                    {p.discord && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <MessageCircle size={12} className="text-indigo-400" />
                        <span className="truncate">{hideData ? '••••••' : p.discord}</span>
                      </div>
                    )}
                    {p.wallet && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Wallet size={12} className="text-yellow-400" />
                        <span className="truncate font-mono text-[10px]">{hideData ? '••••••••••' : p.wallet}</span>
                      </div>
                    )}
                    {p.website && (
                      <div className="flex items-center gap-2">
                        <Globe size={12} className="text-blue-400" />
                        <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">
                          {p.website}
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Show More */}
            {filteredProjects.length > 6 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-cyan-400 transition-all duration-300"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
                >
                  {showAll ? "⬆️ Show Less" : `⬇️ Show All (${filteredProjects.length})`}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      

    </div>
  );
}

export default TrackerPageFullScreen;
