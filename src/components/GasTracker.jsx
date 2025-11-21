import React, { useState, useEffect } from "react";
import {
  Fuel,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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

  // ========================
  // NEUMORPHIC STYLE CLASSES (SOFT WHITE SHADOW)
  // ========================

  const neuCard =
    "bg-[#e0e5ec] rounded-3xl p-5 shadow-[9px_9px_16px_#b8b9be,-9px_-9px_16px_rgba(255,255,255,0.55)] transition";

  const neuInset =
    "shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_rgba(255,255,255,0.45)]";

  const neuButton =
    "px-6 py-2 bg-[#e0e5ec] rounded-xl text-gray-700 font-semibold shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_rgba(255,255,255,0.5)] active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_rgba(255,255,255,0.45)] transition";

  const neuHeader =
    "bg-[#e0e5ec] rounded-3xl p-6 shadow-[9px_9px_16px_#b8b9be,-9px_-9px_16px_rgba(255,255,255,0.55)] cursor-pointer";

  const accentGradient =
    "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white";

  const softText = "text-gray-600";

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
    <div className="w-full mb-8">

      {/* HEADER CARD */}
      <div
        className={`${neuHeader} flex justify-between items-center`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
          <Fuel className="text-blue-400" size={26} />
          Real-time Gas Tracker
        </h2>

        <div className="flex items-center gap-3 text-gray-500">
          {loading ? "🔄 Updating..." : "✅ Live"}
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>

      {isExpanded && (
        <div className={`${neuCard} mt-4 space-y-6`}>

          {/* CHAIN BUTTONS */}
          <div className="flex flex-wrap justify-center gap-3">
            {chains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => setSelectedChain(chain.id)}
                className={`${neuButton} ${
                  selectedChain === chain.id ? `${accentGradient} shadow-none` : ""
                }`}
              >
                {chain.name}
              </button>
            ))}
          </div>

          {/* GAS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {["slow", "average", "fast"].map((speed) => (
              <div key={speed} className={`${neuCard}`}>
                <div className="text-sm text-gray-500 mb-1">
                  {speed === "slow"
                    ? "🐢 Lambat"
                    : speed === "average"
                    ? "⚡ Rata-rata"
                    : "🚀 Cepat"}
                </div>
                <div className="text-3xl font-bold text-gray-700">
                  {gasData[selectedChain][speed]} Gwei
                </div>
              </div>
            ))}
          </div>

          {/* RECOMMENDATION CARD */}
          {(() => {
            const rec = getRecommendation(selectedChain);
            const Icon = rec.icon;
            return (
              <div className={`${neuCard} flex items-center gap-3`}>
                <Icon className={rec.color} size={24} />
                <div>
                  <div className={`font-semibold ${rec.color}`}>{rec.text}</div>
                  <div className="text-sm text-gray-500">
                    Rata-rata: {gasData[selectedChain].average} Gwei
                  </div>
                </div>
              </div>
            );
          })()}

          {/* CHART */}
          {historicalData.length > 1 && (
            <div className={`${neuCard}`}>
              <h3 className="text-lg font-semibold text-gray-600 mb-4">
                📊 Tren Harga Gas
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={historicalData}>
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      background: "#e0e5ec",
                      border: "none",
                      boxShadow:
                        "inset 3px 3px 6px #b8b9be, inset -3px -3px 6px rgba(255,255,255,0.45)",
                    }}
                  />
                  <Legend />
                  <Line dataKey="ethereum" stroke="#6b79ff" strokeWidth={3} dot={false} />
                  <Line dataKey="bsc" stroke="#f2c94c" strokeWidth={3} dot={false} />
                  <Line dataKey="polygon" stroke="#b769ff" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="text-center text-xs text-gray-500">
            Auto update 15 detik
            {lastUpdate && ` • Terakhir: ${lastUpdate.toLocaleTimeString("id-ID")}`}
          </div>
        </div>
      )}
    </div>
  );
};

export default GasTracker;
