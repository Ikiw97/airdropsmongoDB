import React, { useEffect, useState } from "react";
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
import NeonParticles from "./NeonParticles";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import GasTracker from "./components/GasTracker";
import ROICalculator from "./components/ROICalculator";
import NewsAggregator from "./components/NewsAggregator";
import MultisendTool from "./components/MultisendTool";
import TradingPlatform from "./components/TradingPlatform";
import BalanceChecker from "./components/BalanceChecker";
import DexList from "./components/DexList";
import InfoAirdrops from "./components/InfoAirdrops";
import PrivateKeyGeneratorSecure from "./components/PrivateKeyGeneratorSecure";
import apiService from "./api/apiService";
import { secureLogger } from "./utils/dataSecurityUtils";

const DEX_LIST = [
  { name: "Uniswap", logo: "/dex/uniswap.png", link: "https://app.uniswap.org" },
  { name: "PancakeSwap", logo: "/dex/pancakeswap.png", link: "https://pancakeswap.finance" },
  { name: "Raydium", logo: "/dex/raydium.png", link: "https://raydium.io" },
  { name: "SushiSwap", logo: "/dex/sushiswap.png", link: "https://www.sushi.com" },
  { name: "QuickSwap", logo: "/dex/quickswap.png", link: "https://quickswap.exchange" },
];

const AVAILABLE_TAGS = [
  { id: "defi", label: "DeFi", color: "bg-blue-300" },
  { id: "gamefi", label: "GameFi", color: "bg-purple-300" },
  { id: "layer2", label: "Layer2", color: "bg-green-300" },
  { id: "nft", label: "NFT", color: "bg-pink-300" },
  { id: "meme", label: "Meme", color: "bg-yellow-300" },
  { id: "infra", label: "Infrastructure", color: "bg-cyan-300" },
  { id: "social", label: "SocialFi", color: "bg-orange-300" },
  { id: "bridge", label: "Bridge", color: "bg-indigo-300" },
  { id: "dex", label: "DEX", color: "bg-red-300" },
  { id: "lending", label: "Lending", color: "bg-teal-300" },
];

function TypingTextFixed({ icon, text, speed = 120, pause = 1500 }) {
  const [displayed, setDisplayed] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showCursor, setShowCursor] = React.useState(true);

  React.useEffect(() => {
    setDisplayed("");
    setIndex(0);
    setIsDeleting(false);
  }, [text]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting && index < text.length) {
        setDisplayed(text.slice(0, index + 1));
        setIndex((prev) => prev + 1);
      } else if (isDeleting && index > 0) {
        setDisplayed(text.slice(0, index - 1));
        setIndex((prev) => prev - 1);
      } else if (!isDeleting && index === text.length) {
        setTimeout(() => setIsDeleting(true), pause);
      } else if (isDeleting && index === 0) {
        setIsDeleting(false);
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [index, isDeleting, text, speed, pause]);

  React.useEffect(() => {
    const blink = setInterval(() => setShowCursor((prev) => !prev), 500);
    return () => clearInterval(blink);
  }, []);

  return (
    <span className="inline-flex items-center whitespace-pre">
      <span className="mr-1">{icon}</span>
      {displayed}
      <span
        className="ml-0.5 bg-gray-700"
        style={{
          width: "6px",
          height: "1em",
          opacity: showCursor ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
        }}
      />
    </span>
  );
}

// Komponen Popup Success dengan Neumorphism
function SuccessPopup({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative max-w-md w-full p-6 rounded-2xl animate-bounce-in bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark"
        style={{
          animation: 'slideDown 0.5s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex-shrink-0 p-3 rounded-full"
            style={{
              background: 'linear-gradient(145deg, #4ade80, #22c55e)',
              boxShadow: '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)'
            }}
          >
            <CheckCircle size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-1">Sucess!</h3>
            <p className="text-gray-600 font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-lg text-gray-600 hover:text-gray-800 transition"
            style={{
              boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div
          className="mt-4 h-1 rounded-full overflow-hidden"
          style={{
            background: '#e0e5ec',
            boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.6)'
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600"
            style={{
              animation: 'progressBar 3s linear'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes progressBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
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
  const [progress, setProgress] = useState(100);
  const [showDexList, setShowDexList] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { theme } = useTheme();

  const [selectedTags, setSelectedTags] = useState([]);
  const [filterTag, setFilterTag] = useState("all");
  const [filterDaily, setFilterDaily] = useState("all");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("projects");
  const [isMobile, setIsMobile] = useState(false);

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
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await apiService.getProjects();
      if (import.meta.env.DEV) console.log("Fetched projects from API:", data);
      secureLogger.log('FETCH_PROJECTS', { count: Array.isArray(data) ? data.length : 0 }, 'info');

      if (Array.isArray(data)) {
        const parsedData = data.map(project => {
          let parsedTags = project.tags || [];

          return {
            ...project,
            tags: parsedTags,
            notes: project.notes || ""
          };
        });

        if (import.meta.env.DEV) console.log("Parsed projects:", parsedData);
        secureLogger.log('PARSE_PROJECTS', { count: parsedData.length }, 'info');
        setProjects(parsedData);
      }
    } catch (error) {
      secureLogger.logError('FETCH_PROJECTS_ERROR', error, {});
      alert("⚠️ Gagal memuat data dari Google Sheets");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const addProject = async () => {
    if (!formData.name) return alert("Nama project wajib diisi!");
    try {
      setLoading(true);
      if (import.meta.env.DEV) console.log("Sending project data:", formData);
      await apiService.createProject(formData);

      // Show success popup
      setSuccessMessage(`Project "${formData.name}" berhasil ditambahkan!`);
      setShowSuccessPopup(true);

      fetchProjects();
      setFormData({
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
      setSelectedTags([]);
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

      // Show success popup when marking as checked
      if (next === "CHECKED") {
        setSuccessMessage(`Daily task "${name}" berhasil di-check! ✓`);
        setShowSuccessPopup(true);
      }

      fetchProjects();
    } catch (err) {
      secureLogger.logError('UPDATE_DAILY_ERROR', err, { name });
      alert("❌ Gagal update daily status!");
    }
  };

  const deleteProject = async (name) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus project "${name}"?`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await apiService.deleteProject(name);
      alert("✅ Project berhasil dihapus!");
      fetchProjects();
    } catch (err) {
      secureLogger.logError('DELETE_PROJECT_ERROR', err, { name });
      alert(err.response?.data?.detail || "❌ Gagal menghapus project!");
    } finally {
      setLoading(false);
    }
  };

  const fetchMarket = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=true"
      );
      const data = await res.json();
      setCoins(data);
    } catch {
      setCoins([]);
    }
  };

  useEffect(() => {
    fetchMarket();
    const refreshInterval = setInterval(() => {
      fetchMarket();
      setTimer(60);
      setProgress(100);
    }, 60000);

    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 60));
      setProgress((prev) => (prev > 0 ? prev - 100 / 60 : 100));
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdown);
    };
  }, []);
  const progressColor =
    timer > 40 ? "#22c55e" : timer > 20 ? "#facc15" : "#ef4444";

  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch = (p.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const hasTags = p.tags && Array.isArray(p.tags);
      const matchesTags =
        filterTag === "all" ||
        (hasTags && p.tags.includes(filterTag));

      const matchesDaily =
        filterDaily === "all" ||
        (filterDaily === "checked" && p.daily === "CHECKED") ||
        (filterDaily === "unchecked" && p.daily !== "CHECKED");

      // Filtering logic - no need to log

      return matchesSearch && matchesTags && matchesDaily;
    })
    .sort((a, b) => {
      const A = (a.name || "").toLowerCase();
      const B = (b.name || "").toLowerCase();
      return sortOrder === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    });

  const displayedProjects = showAll
    ? filteredProjects
    : filteredProjects.slice(0, 3);

  const toggleTag = (tagId) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId];

      setFormData((prevForm) => ({
        ...prevForm,
        tags: newTags,
      }));

      return newTags;
    });
  };

  const sidebarMenuItems = [
    { id: "projects", label: "Projects", icon: LayoutDashboard, color: "text-blue-600" },
    { id: "infoairdrops", label: "Info Airdrops", icon: Radio, color: "text-cyan-500" },
    { id: "trading", label: "Trading", icon: Zap, color: "text-green-600" },
    { id: "analytics", label: "Analytics", icon: Activity, color: "text-purple-600" },
    { id: "gas", label: "Gas Tracker", icon: Fuel, color: "text-orange-600" },
    { id: "roi", label: "ROI Calculator", icon: Calculator, color: "text-teal-600" },
    { id: "news", label: "News Feed", icon: Newspaper, color: "text-yellow-700" },
    { id: "balance", label: "Balance Checker", icon: Wallet, color: "text-indigo-600" },
    { id: "keygen", label: "Key Generator", icon: Shield, color: "text-red-600" },
    { id: "dexlist", label: "List DEX & Bridge", icon: Repeat, color: "text-cyan-600" },
    { id: "multisend", label: "Multisend", icon: Send, color: "text-pink-600" },
  ];

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-100 relative overflow-hidden bg-main-light dark:bg-main-dark transition-colors duration-300">
      {/* Success Popup */}
      {showSuccessPopup && (
        <SuccessPopup
          message={successMessage}
          onClose={() => setShowSuccessPopup(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-main-light dark:bg-main-dark z-50 transition-all duration-300 ${sidebarOpen ? "w-64 shadow-2xl dark:shadow-black/50" : "w-0"
          } ${isMobile ? "shadow-2xl dark:shadow-black/50" : ""}`}
      >
        {sidebarOpen && (
          <div className="h-full flex flex-col">
            <div className="p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                🚀 Airdrop Tracker
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-600 hover:text-gray-800 transition lg:hidden rounded-lg p-2"
                style={{
                  boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                }}
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
              {sidebarMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out ${activeView === item.id
                      ? "text-gray-800 dark:text-gray-100 font-semibold bg-main-light dark:bg-main-dark shadow-neu-pressed dark:shadow-neu-pressed-dark"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark"
                      }`}
                  >
                    <Icon size={20} className={activeView === item.id ? item.color : ""} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 space-y-3">
              {user?.is_admin && (
                <button
                  onClick={onShowAdmin}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition text-cyan-700 hover:text-cyan-800"
                  style={{
                    boxShadow: '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)'
                  }}
                >
                  <Shield size={18} />
                  Admin Panel
                </button>
              )}
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition text-red-700 hover:text-red-800"
                style={{
                  boxShadow: '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)'
                }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-3 left-3 z-50 flex items-center justify-center w-10 h-10 rounded-full transition text-gray-700 hover:text-gray-900"
          style={{
            background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
            boxShadow: '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.6)'
          }}
        >
          <Menu size={22} />
        </button>
      )}



      <div
        className={`min-h-screen transition-all duration-300 ${sidebarOpen && !isMobile ? "ml-64" : "ml-0"
          }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-30 bg-main-light dark:bg-main-dark px-5 md:px-6 py-3 md:py-4 rounded-b-2xl shadow-neu-flat dark:shadow-neu-flat-dark"
        >
          <div className="flex flex-wrap justify-between items-center gap-3 md:gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 min-h-[1.5em] pl-12 sm:pl-0">
              {activeView === "projects" && (
                <TypingTextFixed key="projects" icon="📦" text="My Projects" />
              )}
              {activeView === "infoairdrops" && (
                <TypingTextFixed key="infoairdrops" icon="📢" text="Info Airdrops Channel" />
              )}
              {activeView === "trading" && (
                <TypingTextFixed key="trading" icon="⚡" text="DeDoo Trading Platform" />
              )}
              {activeView === "analytics" && (
                <TypingTextFixed key="analytics" icon="📊" text="Analytics Dashboard" />
              )}
              {activeView === "gas" && (
                <TypingTextFixed key="gas" icon="⛽" text="Gas Tracker" />
              )}
              {activeView === "roi" && (
                <TypingTextFixed key="roi" icon="💹" text="ROI Calculator" />
              )}
              {activeView === "news" && (
                <TypingTextFixed key="news" icon="📰" text="News Feed" />
              )}
              {activeView === "balance" && (
                <TypingTextFixed key="balance" icon="💰" text="Balance Checker" />
              )}
              {activeView === "keygen" && (
                <TypingTextFixed key="keygen" icon="🔐" text="EVM Private Key Generator" />
              )}
              {activeView === "multisend" && (
                <TypingTextFixed key="multisend" icon="🚀" text="Multisend Native & Tokens" />
              )}
              {activeView === "dexlist" && (
                <TypingTextFixed key="dexlist" icon="🔄" text="List DEX & Bridge - All Chains" />
              )}
            </h1>






            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              {activeView === "projects" && (
                <>
                  <div className="relative">
                    <button className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-xl transition text-xs md:text-sm text-gray-700 dark:text-gray-300 bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark"
                    >
                      <Tag size={14} />
                      <select
                        value={filterTag}
                        onChange={(e) => setFilterTag(e.target.value)}
                        className="bg-transparent text-gray-800 dark:text-gray-200 outline-none cursor-pointer border-none appearance-none pr-2 font-medium"
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                      >
                        <option value="all" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">All Tags</option>
                        {AVAILABLE_TAGS.map((tag) => (
                          <option key={tag.id} value={tag.id} className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                            {tag.label}
                          </option>
                        ))}
                      </select>
                    </button>
                  </div>

                  <div className="relative">
                    <button className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-xl transition text-xs md:text-sm text-gray-700 dark:text-gray-300 bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark"
                    >
                      <CheckSquare size={14} />
                      <select
                        value={filterDaily}
                        onChange={(e) => setFilterDaily(e.target.value)}
                        className="bg-transparent text-gray-800 dark:text-gray-200 outline-none cursor-pointer border-none appearance-none pr-2 font-medium"
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                      >
                        <option value="all" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">All Projects</option>
                        <option value="checked" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">✅ Daily Checked</option>
                        <option value="unchecked" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">⬜ Ongoing Projects</option>
                      </select>
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="🔍 Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-2 md:px-3 py-1.5 md:py-2 rounded-xl bg-main-light dark:bg-main-dark text-gray-800 dark:text-gray-200 w-28 md:w-48 text-xs md:text-sm shadow-neu-pressed dark:shadow-neu-pressed-dark"
                  />

                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm text-gray-700 dark:text-gray-300 bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark"
                  >
                    <ArrowUpDown size={14} />
                    <span className="hidden sm:inline">{sortOrder === "asc" ? "A-Z" : "Z-A"}</span>
                  </button>

                  <button
                    onClick={() => setHideData(!hideData)}
                    className="px-2 md:px-3 py-1.5 md:py-2 rounded-xl flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-700 dark:text-gray-300 bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark"
                  >
                    {hideData ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {activeView === "trading" && <TradingPlatform />}

          {activeView === "projects" && (
            <div className="space-y-8">
              <div className="p-4 md:p-6 rounded-2xl bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark"
              >
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-blue-700">
                  ➕ Add New Project
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {["name", "twitter", "discord", "telegram", "farcaster", "wallet", "email", "github", "website"].map(
                    (field) => (
                      <input
                        key={field}
                        type="text"
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                        className="p-2 md:p-3 text-sm md:text-base rounded-lg bg-main-light dark:bg-main-dark text-gray-800 dark:text-gray-200 w-full shadow-neu-pressed dark:shadow-neu-pressed-dark placeholder-gray-400 dark:placeholder-gray-600"
                      />
                    )
                  )}
                </div>

                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <StickyNote size={16} />
                    Notes
                  </label>
                  <textarea
                    placeholder="Add notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-2 rounded-lg bg-main-light dark:bg-main-dark text-gray-800 dark:text-gray-200 resize-none shadow-neu-pressed dark:shadow-neu-pressed-dark placeholder-gray-400 dark:placeholder-gray-600"
                    rows="2"
                  ></textarea>
                </div>

                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Tag size={16} />
                    Select Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${selectedTags.includes(tag.id) || (formData.tags && formData.tags.includes(tag.id))
                          ? `${tag.color} text-gray-800 shadow-neu-pressed dark:shadow-neu-pressed-dark`
                          : "text-gray-600 dark:text-gray-400 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark"
                          }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={addProject}
                  disabled={loading}
                  className={`mt-4 px-6 py-2 rounded-lg font-semibold transition-all ${loading
                    ? "text-gray-500 cursor-not-allowed shadow-neu-pressed dark:shadow-neu-pressed-dark"
                    : "text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark"
                    }`}
                >
                  {loading ? "Loading..." : "+ Add Project"}
                </button>
              </div>

              <motion.div
                className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {displayedProjects.map((p, i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      variants={cardVariants}
                      whileHover="hover"
                      className="group relative p-5 sm:p-6 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm rounded-2xl bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 pr-10">
                          {p.name}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleDaily(p.name, p.daily)}
                            className={`p-2 rounded-lg transition-all duration-200 ${p.daily === 'CHECKED'
                              ? 'text-blue-600 dark:text-blue-400 shadow-neu-pressed dark:shadow-neu-pressed-dark'
                              : 'text-gray-500 dark:text-gray-400 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark'
                              }`}
                          >
                            {p.daily === 'CHECKED' ? <CheckSquare size={16} /> : <Square size={16} />}
                          </button>
                          <button
                            onClick={() => deleteProject(p.name)}
                            className="p-2 rounded-lg text-red-600 hover:text-red-700 transition-all duration-200 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {p.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {p.tags.map((tagId) => {
                            const tag = AVAILABLE_TAGS.find((t) => t.id === tagId);
                            return (
                              <span
                                key={tagId}
                                className={`${tag?.color || ''} text-gray-800 text-xs px-2.5 py-0.5 rounded-full font-semibold shadow-neu-pressed dark:shadow-neu-pressed-dark`}
                              >
                                {tag?.label}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {p.notes && (
                        <div className="mb-3 p-3 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 shadow-inner">
                          <p className="flex items-start gap-2 text-sm text-gray-700">
                            <StickyNote size={14} className="mt-0.5 text-yellow-700 flex-shrink-0" />
                            <span className="italic leading-relaxed">{p.notes}</span>
                          </p>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        {p.twitter && (
                          <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/30 transition-colors duration-150">
                            <Twitter size={14} className="text-blue-600" />
                            <span className="text-sm text-gray-700 font-mono truncate">{hideData ? '••••••' : p.twitter}</span>
                          </div>
                        )}
                        {p.discord && (
                          <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/30 transition-colors duration-150">
                            <MessageCircle size={14} className="text-indigo-600" />
                            <span className="text-sm text-gray-700 font-mono truncate">{hideData ? '••••••' : p.discord}</span>
                          </div>
                        )}
                        {p.telegram && (
                          <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/30 transition-colors duration-150">
                            <Send size={14} className="text-sky-600" />
                            <span className="text-sm text-gray-700 font-mono truncate">{hideData ? '••••••' : p.telegram}</span>
                          </div>
                        )}
                        {p.farcaster && (
                          <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/30 transition-colors duration-150">
                            <Zap size={14} className="text-purple-600" />
                            <span className="text-sm text-gray-700 font-mono truncate">{hideData ? '••••••' : p.farcaster}</span>
                          </div>
                        )}
                        {p.wallet && (
                          <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/30 transition-colors duration-150">
                            <Wallet size={14} className="text-yellow-700" />
                            <span className="text-xs text-gray-700 font-mono break-all">{hideData ? '••••••••••••••' : p.wallet}</span>
                          </div>
                        )}
                        {p.email && (
                          <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/30 transition-colors duration-150">
                            <Mail size={14} className="text-pink-600" />
                            <span className="text-sm text-gray-700 font-mono truncate">{hideData ? '••••••' : p.email}</span>
                          </div>
                        )}
                        {p.website && (
                          <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/30 transition-colors duration-150">
                            <Globe size={14} className="text-blue-600" />
                            <a
                              href={p.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-700 underline truncate transition-colors"
                            >
                              {p.website}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Efek glowing lembut */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg pointer-events-none"
                        style={{ background: 'radial-gradient(circle at center, rgba(147,197,253,0.25), transparent 70%)' }}
                      ></motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {filteredProjects.length > 3 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="px-6 py-2 rounded-lg font-semibold transition text-blue-700 hover:text-blue-800"
                    style={{
                      boxShadow: '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)'
                    }}
                  >
                    {showAll ? "⬆️ Show Less" : "⬇️ Show More"}
                  </button>
                </div>
              )}

              <div className="p-6 rounded-2xl bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark"
              >
                <h2 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  📈 Live Crypto Market
                </h2>

                <div className="text-center mb-4">
                  <p className="text-gray-600 text-sm mb-2">
                    ⏱️ Auto-refresh in <span className="text-blue-700 font-semibold">{timer}s</span>
                  </p>
                  <div
                    className="w-64 mx-auto h-2 rounded-full overflow-hidden bg-main-light dark:bg-main-dark shadow-neu-pressed dark:shadow-neu-pressed-dark"
                  >
                    <div
                      className="h-full transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${progress}%`, backgroundColor: progressColor }}
                    ></div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {coins.map((coin) => (
                    <div key={coin.id} className="p-4 rounded-xl transition-all bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-icon dark:hover:shadow-neu-icon-dark"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                          <span className="font-semibold text-gray-800">{coin.name}</span>
                        </div>
                        <span
                          className={`text-sm font-bold ${coin.price_change_percentage_24h >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                        >
                          {coin.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2 text-sm font-semibold">
                        ${coin.current_price.toLocaleString()}
                      </p>
                      <ResponsiveContainer width="100%" height={60}>
                        <LineChart data={coin.sparkline_in_7d.price.map((p, i) => ({ i, p }))}>
                          <Line
                            type="monotone"
                            dataKey="p"
                            stroke={
                              coin.price_change_percentage_24h >= 0
                                ? "#16a34a"
                                : "#dc2626"
                            }
                            dot={false}
                            strokeWidth={2}
                          />
                          <XAxis hide />
                          <YAxis hide domain={["auto", "auto"]} />
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
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === "balance" && (
            <div className="max-w-7xl mx-auto">
              <BalanceChecker />
            </div>
          )}

          {activeView === "keygen" && (
            <div className="max-w-7xl mx-auto">
              <PrivateKeyGeneratorSecure />
            </div>
          )}

          {activeView === "analytics" && (
            <div className="max-w-7xl mx-auto">
              <AnalyticsDashboard
                projects={projects}
              />
            </div>
          )}

          {activeView === "gas" && (
            <div className="max-w-7xl mx-auto">
              <GasTracker />
            </div>
          )}

          {activeView === "roi" && (
            <div className="max-w-7xl mx-auto">
              <ROICalculator />
            </div>
          )}

          {activeView === "news" && (
            <div className="max-w-7xl mx-auto">
              <NewsAggregator />
            </div>
          )}

          {activeView === "multisend" && (
            <div className="max-w-7xl mx-auto">
              <MultisendTool />
            </div>
          )}

          {activeView === "dexlist" && (
            <div className="max-w-7xl mx-auto">
              <DexList />
            </div>
          )}

          {activeView === "infoairdrops" && (
            <div className="max-w-7xl mx-auto">
              <InfoAirdrops />
            </div>
          )}

        </div>
      </div>

      {
        isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )
      }
    </div >
  );
}

export default TrackerPageFullScreen;
