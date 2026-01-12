import React, { useState, useEffect } from "react";
import {
  Fuel,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  fadeInUpVariants,
  containerVariants,
  cardVariants,
  buttonHoverVariants,
} from "../utils/animationVariants";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useTheme } from "../contexts/ThemeContext";

const GasTracker = () => {
  const [gasData, setGasData] = useState({
    ethereum: { slow: 0, average: 0, fast: 0 },
    bsc: { slow: 0, average: 0, fast: 0 },
    polygon: { slow: 0, average: 0, fast: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const { theme } = useTheme();

  // == Fetch Functions (no changes) ===
  const fetchGasPrices = async () => {
    try {
      setLoading(true);
      const etherscanKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
      const bscscanKey = import.meta.env.VITE_BSCSCAN_API_KEY;
      const polygonscanKey = import.meta.env.VITE_POLYGONSCAN_API_KEY;

      let ethGasData = { slow: 0, average: 0, fast: 0 };
      try {
        const ethResponse = await fetch(
          `https://api.etherscan.io/v2/api?chainid=1&module=gastracker&action=gasoracle&apikey=${etherscanKey}`
        );
        const ethResult = await ethResponse.json();
        if (ethResult.status === "1" && ethResult.result) {
          const baseFee = parseFloat(ethResult.result.suggestBaseFee);
          ethGasData = {
            slow: parseFloat((baseFee * 0.95).toFixed(2)),
            average: parseFloat((baseFee * 1.0).toFixed(2)),
            fast: parseFloat((baseFee * 1.15).toFixed(2)),
          };
        }
      } catch {
        ethGasData = await fetchGasFromRPC("ethereum");
      }

      let bscGasData = await fetchBSCGasEnhanced();
      let polygonGasData = { slow: 0, average: 0, fast: 0 };
      try {
        const polygonResponse = await fetch(
          "https://gasstation.polygon.technology/v2"
        );
        const polygonResult = await polygonResponse.json();
        if (polygonResult && polygonResult.safeLow) {
          polygonGasData = {
            slow: Math.round(parseFloat(polygonResult.safeLow.maxFee)),
            average: Math.round(parseFloat(polygonResult.standard.maxFee)),
            fast: Math.round(parseFloat(polygonResult.fast.maxFee)),
          };
        }
      } catch {
        polygonGasData = await fetchGasFromRPC("polygon");
      }

      setGasData({
        ethereum: ethGasData,
        bsc: bscGasData,
        polygon: polygonGasData,
      });

      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setHistoricalData((prev) => {
        const newData = [
          ...prev,
          {
            time: timestamp,
            ethereum: ethGasData.average,
            bsc: bscGasData.average,
            polygon: polygonGasData.average,
          },
        ];
        return newData.slice(-20);
      });

      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching gas:", err);
      setLoading(false);
    }
  };

  const fetchBSCGasEnhanced = async () => {
    try {
      const { JsonRpcProvider, formatUnits } = await import("ethers");
      const rpcUrls = [
        "https://bsc-dataseed1.binance.org",
        "https://bsc-dataseed2.binance.org",
        "https://bsc-dataseed3.binance.org",
        "https://rpc.ankr.com/bsc",
      ];
      const gasPrices = [];
      for (const rpc of rpcUrls) {
        try {
          const provider = new JsonRpcProvider(rpc);
          const feeData = await provider.getFeeData();
          if (feeData.gasPrice) {
            gasPrices.push(parseFloat(formatUnits(feeData.gasPrice, "gwei")));
          }
        } catch {
          continue;
        }
      }
      if (gasPrices.length > 0) {
        const avg = gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length;
        return {
          slow: parseFloat((avg * 0.8).toFixed(2)),
          average: parseFloat(avg.toFixed(2)),
          fast: parseFloat((avg * 1.25).toFixed(2)),
        };
      }
      return { slow: 3, average: 5, fast: 7 };
    } catch {
      return { slow: 3, average: 5, fast: 7 };
    }
  };

  const fetchGasFromRPC = async (chain) => {
    try {
      const { JsonRpcProvider, formatUnits } = await import("ethers");
      const rpcUrls = {
        ethereum: ["https://rpc.ankr.com/eth"],
        bsc: ["https://rpc.ankr.com/bsc"],
        polygon: ["https://rpc.ankr.com/polygon"],
      };
      for (const rpc of rpcUrls[chain]) {
        try {
          const provider = new JsonRpcProvider(rpc);
          const feeData = await provider.getFeeData();
          if (feeData.gasPrice) {
            const g = parseFloat(formatUnits(feeData.gasPrice, "gwei"));
            return {
              slow: Math.max(1, Math.round(g * 0.85)),
              average: Math.max(1, Math.round(g)),
              fast: Math.max(1, Math.round(g * 1.15)),
            };
          }
        } catch {
          continue;
        }
      }
      return { slow: 1, average: 1, fast: 1 };
    } catch {
      return { slow: 1, average: 1, fast: 1 };
    }
  };

  useEffect(() => {
    fetchGasPrices();
    const interval = setInterval(fetchGasPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  const getRecommendation = (chain) => {
    const avg = gasData[chain].average;
    let threshold = { low: 20, medium: 50 };
    if (chain === "bsc") threshold = { low: 3, medium: 5 };
    if (chain === "polygon") threshold = { low: 30, medium: 80 };
    if (avg <= threshold.low)
      return {
        color: "text-green-500",
        icon: TrendingDown,
        text: "Waktu terbaik untuk transaksi!",
      };
    if (avg <= threshold.medium)
      return {
        color: "text-yellow-500",
        icon: AlertCircle,
        text: "Biaya gas sedang",
      };
    return {
      color: "text-red-500",
      icon: TrendingUp,
      text: "Gas tinggi - tunggu jika memungkinkan",
    };
  };

  const chains = [
    { id: "ethereum", name: "Ethereum" },
    { id: "bsc", name: "BSC" },
    { id: "polygon", name: "Polygon" },
  ];

  return (
    <motion.div
      className="w-full mb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >

      {/* HEADER CARD */}
      <motion.div
        className="bg-main-light dark:bg-main-dark rounded-3xl p-6 shadow-neu-flat dark:shadow-neu-flat-dark cursor-pointer flex justify-between items-center transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
        variants={fadeInUpVariants}
        whileHover={{ scale: 1.01 }}
      >
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Fuel className="text-blue-400" size={26} />
          Real-time Gas Tracker
        </h2>

        <div className="flex items-center gap-3 text-gray-500">
          <span className="text-green-500 font-semibold">Live</span>
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </motion.div>

      {isExpanded && (
        <motion.div
          className="bg-main-light dark:bg-main-dark rounded-3xl p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-all mt-4 space-y-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >

          {/* CHAIN BUTTONS */}
          <motion.div className="flex flex-wrap justify-center gap-3" variants={containerVariants}>
            {chains.map((chain, i) => (
              <motion.button
                key={chain.id}
                onClick={() => setSelectedChain(chain.id)}
                className={`px-6 py-2 rounded-xl font-semibold transition-all ${selectedChain === chain.id
                  ? "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white shadow-none"
                  : "bg-main-light dark:bg-main-dark text-gray-700 dark:text-gray-300 shadow-neu-flat dark:shadow-neu-flat-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark"
                  }`}
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                custom={i}
              >
                {chain.name}
              </motion.button>
            ))}
          </motion.div>

          {/* GAS CARDS */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {["slow", "average", "fast"].map((speed, i) => (
              <motion.div
                key={speed}
                className="bg-main-light dark:bg-main-dark rounded-3xl p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-all"
                variants={cardVariants}
                custom={i}
                whileHover="hover"
              >
                <div className="text-sm text-gray-500 mb-1">
                  {speed === "slow"
                    ? "🐢 Lambat"
                    : speed === "average"
                      ? "⚡ Rata-rata"
                      : "🚀 Cepat"}
                </div>
                <motion.div
                  className="text-3xl font-bold text-gray-700 dark:text-gray-200"
                  key={`gas-${selectedChain}-${speed}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {gasData[selectedChain][speed]} Gwei
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* RECOMMENDATION CARD */}
          {(() => {
            const rec = getRecommendation(selectedChain);
            const Icon = rec.icon;
            return (
              <motion.div
                className="bg-main-light dark:bg-main-dark rounded-3xl p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-all flex items-center gap-3"
                variants={fadeInUpVariants}
                key={`rec-${selectedChain}`}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icon className={rec.color} size={24} />
                </motion.div>
                <div>
                  <div className={`font-semibold ${rec.color}`}>{rec.text}</div>
                  <div className="text-sm text-gray-500">
                    Rata-rata: {gasData[selectedChain].average} Gwei
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* CHART */}
          {historicalData.length > 1 && (
            <motion.div
              className="bg-main-light dark:bg-main-dark rounded-3xl p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-all"
              variants={fadeInUpVariants}
            >
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-4">
                📊 Tren Harga Gas
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={historicalData}>
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
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
                  <Legend />
                  <Line dataKey="ethereum" stroke="#6b79ff" strokeWidth={3} dot={false} />
                  <Line dataKey="bsc" stroke="#f2c94c" strokeWidth={3} dot={false} />
                  <Line dataKey="polygon" stroke="#b769ff" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          <motion.div
            className="text-center text-xs text-gray-500"
            variants={fadeInUpVariants}
          >
            Auto update 15 detik
            {lastUpdate && ` • Terakhir: ${lastUpdate.toLocaleTimeString("id-ID")}`}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GasTracker;
