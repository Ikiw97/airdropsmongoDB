import React, { useState, useEffect } from "react";
import {
  Fuel,
  TrendingUp,
  Activity,
  Zap,
  Clock,
  Box,
  Server,
  Hash,
  Layers,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import apiService from "../api/apiService";

const GasTracker = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    btcFees: { fastestFee: 0, halfHourFee: 0, hourFee: 0, economyFee: 0 },
    ethGas: { safe: 0, propose: 0, fast: 0 },
    btcStats: { height: 0, price: 0, marketCap: 0 },
    topChains: []
  });

  const fetchData = async () => {
    try {
      const [btcFees, ethGas, btcStats, tvlData] = await Promise.all([
        apiService.getBitcoinFees().catch(() => ({ fastestFee: 0, halfHourFee: 0, hourFee: 0, economyFee: 0 })),
        apiService.getGasPrices().catch(() => ({ ethereum: { safe: 15, propose: 20, fast: 25 } })),
        apiService.getBitcoinStats().catch(() => ({ height: 0, price: 0 })),
        apiService.getChainsTVL().catch(() => [])
      ]);

      // Process TVL Data (Top 5)
      const topChains = Array.isArray(tvlData)
        ? tvlData.sort((a, b) => b.tvl - a.tvl).slice(0, 5)
        : [];

      setData({
        btcFees,
        ethGas: ethGas.ethereum || ethGas, // Handle structure variations
        btcStats,
        topChains
      });
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val?.toLocaleString()}`;
  };

  return (
    <div className="w-full mb-6 space-y-4">
      {/* ROW 1: NETWORK STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* BITCOIN FEES */}
        <div className="p-4 rounded-xl border relative overflow-hidden group transition-all"
             style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <img src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png" alt="BTC" className="w-16 h-16 grayscale" />
          </div>
          <h3 className="text-orange-500 font-bold flex items-center gap-2 mb-4">
            <Fuel size={18} /> BITCOIN FEES
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Fastest</span>
              <span className="text-orange-500 font-mono font-bold">{data.btcFees.fastestFee} sat/vB</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>30 min</span>
              <span className="text-yellow-500 font-mono font-bold">{data.btcFees.halfHourFee} sat/vB</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>1 hour</span>
              <span className="text-blue-500 font-mono font-bold">{data.btcFees.hourFee} sat/vB</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Economy</span>
              <span className="text-green-500 font-mono font-bold">{data.btcFees.economyFee} sat/vB</span>
            </div>
          </div>
        </div>

        {/* ETHEREUM NETWORK */}
        <div className="p-4 rounded-xl border relative overflow-hidden group transition-all"
             style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <img src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" alt="ETH" className="w-16 h-16 grayscale" />
          </div>
          <h3 className="text-blue-500 font-bold flex items-center gap-2 mb-4">
            <Server size={18} /> ETHEREUM GAS
          </h3>
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.ethGas.average || data.ethGas.propose}</span>
              <span className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Gwei</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>Safe Low</span>
                <span className="text-green-500">{data.ethGas.slow || data.ethGas.safe}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <div className="flex justify-center items-center gap-2 text-xs text-green-500 mt-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                Network Active
              </div>
            </div>
          </div>
        </div>

        {/* BITCOIN STATS */}
        <div className="p-4 rounded-xl border relative overflow-hidden group transition-all"
             style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Hash size={64} className="text-yellow-500" />
          </div>
          <h3 className="text-yellow-500 font-bold flex items-center gap-2 mb-4">
            <Box size={18} /> BITCOIN STATS
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm border-b pb-2" style={{ borderColor: 'var(--border-primary)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Block Height</span>
              <span className="text-green-500 font-mono">#{data.btcStats.height?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b pb-2" style={{ borderColor: 'var(--border-primary)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Price</span>
              <span className="font-mono" style={{ color: 'var(--text-primary)' }}>${data.btcStats.price?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Market Cap</span>
              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(data.btcStats.marketCap)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: TOP CHAINS BY TVL */}
      <div className="p-5 rounded-xl border transition-all"
           style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)' }}>
        <h3 className="text-purple-500 font-bold flex items-center gap-2 mb-4 uppercase tracking-wider text-sm">
          <Layers size={18} /> Top Chains by TVL
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {data.topChains.map((chain, index) => (
            <div key={chain.name} 
                 className="flex flex-col items-center p-3 rounded-lg border transition-colors hover:border-purple-500/50"
                 style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
              <span className="text-2xl font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>#{index + 1}</span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{chain.name}</span>
              <span className="text-xs text-green-500 font-mono mt-1">{formatCurrency(chain.tvl)}</span>
            </div>
          ))}
          {loading && Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-20 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
          ))}
        </div>
      </div>

      {/* ROW 3: NETWORK HEALTH */}
      <div className="p-5 rounded-xl border transition-all"
           style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)' }}>
        <h3 className="text-green-500 font-bold flex items-center gap-2 mb-4 uppercase tracking-wider text-sm">
          <Globe size={18} /> Network Health
        </h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm w-20" style={{ color: 'var(--text-secondary)' }}>Bitcoin</span>
            <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded text-green-500 text-xs font-bold border border-green-500/20">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Healthy
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm w-20" style={{ color: 'var(--text-secondary)' }}>Ethereum</span>
            <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded text-green-500 text-xs font-bold border border-green-500/20">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Healthy
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm w-20" style={{ color: 'var(--text-secondary)' }}>DeFi</span>
            <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded text-blue-500 text-xs font-bold border border-blue-500/20">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GasTracker;
