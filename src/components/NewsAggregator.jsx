// NewsAggregator.jsx - Coinglass-style News & Market Info
import React, { useState, useEffect, useCallback } from "react";
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const NewsAggregator = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [marketData, setMarketData] = useState([]);
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [globalData, setGlobalData] = useState(null);
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState("market");

  const tabs = [
    { id: "market", label: "Market Data" },
    { id: "trending", label: "Trending" },
    { id: "news", label: "News" },
  ];

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);

    // Fetch Global Market Data from CoinGecko
    try {
      const globalRes = await axios.get(
        "https://api.coingecko.com/api/v3/global",
        { timeout: 10000 }
      );
      if (globalRes.data?.data) {
        setGlobalData(globalRes.data.data);
      }
    } catch (err) {
      console.warn("Global data fetch failed:", err.message);
    }

    // Fetch Top Coins Market Data from CoinGecko
    try {
      const marketRes = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h,24h,7d",
        { timeout: 10000 }
      );
      if (marketRes.data && Array.isArray(marketRes.data)) {
        setMarketData(marketRes.data);
      }
    } catch (err) {
      console.warn("Market data fetch failed:", err.message);
    }

    // Fetch Trending Coins from CoinGecko
    try {
      const trendingRes = await axios.get(
        "https://api.coingecko.com/api/v3/search/trending",
        { timeout: 10000 }
      );
      if (trendingRes.data?.coins) {
        setTrendingCoins(trendingRes.data.coins);
      }
    } catch (err) {
      console.warn("Trending data fetch failed:", err.message);
    }

    // Fetch News from CryptoCompare
    try {
      const newsRes = await axios.get(
        "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest",
        { timeout: 10000 }
      );
      if (newsRes.data?.Data) {
        setNews(newsRes.data.Data.slice(0, 20));
      }
    } catch (err) {
      console.warn("News fetch failed:", err.message);
    }

    setLastUpdate(new Date());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const formatNumber = (num) => {
    if (!num) return "N/A";
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  const formatPercent = (num) => {
    if (!num && num !== 0) return "N/A";
    const formatted = num.toFixed(2);
    const isPositive = num >= 0;
    return (
      <span className={isPositive ? "text-green-400" : "text-red-400"}>
        {isPositive ? "+" : ""}{formatted}%
      </span>
    );
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Newspaper size={22} className="text-neon-blue" />
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Market News & Data</h2>
          {lastUpdate && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={12} />
              {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); fetchAllData(); }}
            className={`p-2 rounded-lg text-gray-400 hover:text-white hover:bg-blue-500 transition ${isLoading ? "animate-spin" : ""}`}
            style={{ background: "rgba(0, 212, 255, 0.1)" }}
          >
            <RefreshCw size={16} />
          </button>
          {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Global Stats Bar */}
            {globalData && (
              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-lg transition-all duration-300"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
              >
                <div>
                  <p className="text-xs text-gray-500">Total Market Cap</p>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{formatNumber(globalData.total_market_cap?.usd)}</p>
                  <p className="text-xs">{formatPercent(globalData.market_cap_change_percentage_24h_usd)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">24h Volume</p>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{formatNumber(globalData.total_volume?.usd)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">BTC Dominance</p>
                  <p className="text-lg font-bold text-neon-blue">{globalData.market_cap_percentage?.btc?.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">ETH Dominance</p>
                  <p className="text-lg font-bold text-neon-purple">{globalData.market_cap_percentage?.eth?.toFixed(1)}%</p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                    ? "text-[#00ff88] dark:text-white"
                    : "text-gray-500 hover:text-[#00ff88] dark:hover:text-gray-300"
                    }`}
                  style={{
                    background: activeTab === tab.id ? "rgba(0, 255, 136, 0.1)" : "transparent",
                    border: activeTab === tab.id ? "1px solid rgba(0, 255, 136, 0.3)" : "1px solid transparent",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Market Data Tab */}
            {activeTab === "market" && (
              <div
                className="rounded-lg overflow-hidden transition-all duration-300"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 text-xs border-b" style={{ borderBottomColor: "var(--border-primary)" }}>
                        <th className="text-left p-3">#</th>
                        <th className="text-left p-3">Coin</th>
                        <th className="text-right p-3">Price</th>
                        <th className="text-right p-3">1h</th>
                        <th className="text-right p-3">24h</th>
                        <th className="text-right p-3">7d</th>
                        <th className="text-right p-3">Market Cap</th>
                        <th className="text-right p-3">Volume (24h)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketData.slice(0, 25).map((coin, i) => (
                        <tr
                          key={coin.id}
                          className="hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 border-b"
                          style={{ borderBottomColor: "var(--border-primary)" }}
                        >
                          <td className="p-3 text-gray-500">{coin.market_cap_rank}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                              <div>
                                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{coin.name}</span>
                                <span className="text-gray-500 ml-2 text-xs">{coin.symbol?.toUpperCase()}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right font-medium" style={{ color: "var(--text-primary)" }}>
                            ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                          </td>
                          <td className="p-3 text-right">{formatPercent(coin.price_change_percentage_1h_in_currency)}</td>
                          <td className="p-3 text-right">{formatPercent(coin.price_change_percentage_24h_in_currency)}</td>
                          <td className="p-3 text-right">{formatPercent(coin.price_change_percentage_7d_in_currency)}</td>
                          <td className="p-3 text-right text-gray-300">{formatNumber(coin.market_cap)}</td>
                          <td className="p-3 text-right text-gray-300">{formatNumber(coin.total_volume)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Trending Tab */}
            {activeTab === "trending" && (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {trendingCoins.map((coin, i) => {
                  const item = coin.item;
                  const priceChange = item?.data?.price_change_percentage_24h?.usd || 0;
                  return (
                    <div
                      key={item?.id || i}
                      className="p-4 rounded-lg flex items-center gap-3 transition-all duration-300"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
                    >
                      <span className="text-gray-500 text-sm font-medium w-6">#{i + 1}</span>
                      <img src={item?.thumb} alt={item?.name} className="w-8 h-8 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{item?.name}</p>
                        <p className="text-xs text-gray-500">{item?.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>${item?.data?.price?.toFixed(6) || "N/A"}</p>
                        <p className={`text-xs ${priceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* News Tab */}
            {activeTab === "news" && (
              <div className="space-y-3">
                {news.map((item, i) => (
                  <a
                    key={item.id || i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg transition-all duration-300 hover:opacity-80"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
                  >
                    <div className="flex gap-4">
                      {item.imageurl && (
                        <img
                          src={item.imageurl}
                          alt=""
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-1 line-clamp-2" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-2">{item.body}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="text-neon-blue">{item.source}</span>
                          <span>{formatTime(item.published_on)}</span>
                          <ExternalLink size={12} />
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsAggregator;
