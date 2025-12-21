// FULL FILE: NewsAggregator.jsx (Neumorphism Theme Applied)
import React, { useState, useEffect, useCallback } from "react";
import {
  Newspaper,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Filter,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  containerVariants,
  fadeInUpVariants,
  itemVariants,
  buttonHoverVariants,
} from "../utils/animationVariants";

// === NEUMORPHIC UTILITIES ===
const neuOut =
  "bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]";
const neuInset =
  "bg-[#e0e5ec] shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.5)]";
const neuButton =
  "bg-[#e0e5ec] rounded-full shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] transition";
const neuInput =
  "px-4 py-2 rounded-xl bg-[#e0e5ec] text-gray-700 shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,0.5)] focus:outline-none";

const NewsAggregator = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [news, setNews] = useState([]);
  const [apiNews, setApiNews] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("trending");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    source: "",
    category: "defi",
    url: "",
  });

  const categories = [
    { id: "all", label: "All", color: "bg-gray-700" },
    { id: "defi", label: "DeFi", color: "bg-blue-400" },
    { id: "gamefi", label: "GameFi", color: "bg-purple-400" },
    { id: "layer2", label: "Layer2", color: "bg-green-400" },
    { id: "nft", label: "NFT", color: "bg-pink-400" },
    { id: "bridge", label: "Bridge", color: "bg-indigo-400" },
    { id: "socialfi", label: "SocialFi", color: "bg-orange-400" },
    { id: "airdrop", label: "Airdrop", color: "bg-yellow-400" },
  ];

  const fetchCryptoNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    let allNews = [];

    try {
      // Source 1: CryptoCompare
      try {
        const response = await axios.get(
          "https://min-api.cryptocompare.com/data/v2/news/?lang=EN",
          { timeout: 6000 }
        );

        if (response.data && response.data.Data && response.data.Data.length > 0) {
          const transformedNews = response.data.Data.map(
            (item, index) => ({
              id: `cc-${item.id || Date.now() + index}`,
              title: item.title || "No Title",
              description: item.body || "No description available",
              source: item.source || "CryptoCompare",
              category: detectCategory(
                item.title +
                  " " +
                  (item.body || "") +
                  " " +
                  (item.categories || "")
              ),
              url: item.url || item.guid || "#",
              sentiment: analyzeSentiment(
                item.title + " " + (item.body || "")
              ),
              votes: 0,
              timestamp: new Date(item.published_on * 1000).toISOString(),
              isFromApi: true,
              imageurl: item.imageurl || null,
            })
          );
          allNews = [...allNews, ...transformedNews];
        }
      } catch (err) {
        console.warn("CryptoCompare source failed:", err.message);
      }

      // Source 2: CoinGecko - Trending cryptocurrencies
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/search/trending",
          { timeout: 6000 }
        );

        if (response.data && response.data.coins && response.data.coins.length > 0) {
          const transformedNews = response.data.coins.map((coin, index) => {
            const trendingText = `${coin.name || coin.item?.name} is trending`;
            return {
              id: `cg-trending-${coin.item?.id || Date.now() + index}`,
              title: `🔥 ${coin.item?.name || "Unknown"} - Trending Coin`,
              description: `Market cap rank: ${coin.item?.market_cap_rank || "N/A"}. ${coin.item?.symbol?.toUpperCase() || ""} is gaining traction in the crypto market.`,
              source: "CoinGecko Trending",
              category: detectCategory(trendingText),
              url: coin.item?.url || "#",
              sentiment: "bullish",
              votes: Math.floor(Math.random() * 50),
              timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
              isFromApi: true,
              imageurl: coin.item?.thumb || null,
            };
          });
          allNews = [...allNews, ...transformedNews];
        }
      } catch (err) {
        console.warn("CoinGecko source failed:", err.message);
      }

      // Source 3: CoinGecko - Recent events/global updates
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/global",
          { timeout: 6000 }
        );

        if (response.data) {
          const globalData = response.data.data || response.data;
          const marketNews = [
            {
              id: `cg-global-btc`,
              title: "📊 Bitcoin Market Dominance Update",
              description: `Bitcoin dominance: ${(globalData.btc_dominance || 0).toFixed(2)}%. Total market cap: $${(globalData.total_market_cap?.usd / 1e12 || 0).toFixed(2)}T`,
              source: "CoinGecko Global",
              category: "defi",
              url: "#",
              sentiment: "neutral",
              votes: Math.floor(Math.random() * 40),
              timestamp: new Date().toISOString(),
              isFromApi: true,
            },
            {
              id: `cg-global-24h`,
              title: "📈 24h Market Volume",
              description: `Total 24h volume: $${(globalData.total_volume?.usd / 1e9 || 0).toFixed(2)}B. Market showing ${globalData.market_cap_change_percentage_24h_usd > 0 ? 'positive' : 'negative'} momentum.`,
              source: "CoinGecko Global",
              category: "defi",
              url: "#",
              sentiment: globalData.market_cap_change_percentage_24h_usd > 0 ? "bullish" : "bearish",
              votes: Math.floor(Math.random() * 40),
              timestamp: new Date().toISOString(),
              isFromApi: true,
            },
          ];
          allNews = [...allNews, ...marketNews];
        }
      } catch (err) {
        console.warn("CoinGecko global data failed:", err.message);
      }

      // If we have any news from APIs, use it
      if (allNews.length > 0) {
        // Remove duplicates based on title similarity
        const uniqueNews = [];
        const seenTitles = new Set();
        for (const item of allNews) {
          const titleLower = item.title.toLowerCase();
          if (!seenTitles.has(titleLower)) {
            seenTitles.add(titleLower);
            uniqueNews.push(item);
          }
        }
        setApiNews(uniqueNews.slice(0, 50)); // Show up to 50 items
        setLastUpdate(new Date());
        return;
      }
    } catch (err) {
      console.error("All news sources failed:", err.message);
    }

    // Fallback: Use comprehensive sample data
    const fallbackNews = getSampleNews();
    setApiNews(fallbackNews);
    setLastUpdate(new Date());

  }, [apiNews.length]);

  const detectCategory = (text) => {
    const lower = text.toLowerCase();
    if (lower.match(/airdrop|snapshot|reward/)) return "airdrop";
    if (lower.match(/defi|liquidity|yield/)) return "defi";
    if (lower.match(/game|p2e|metaverse/)) return "gamefi";
    if (lower.match(/layer 2|rollup|zk|optimistic/)) return "layer2";
    if (lower.match(/nft|collectible/)) return "nft";
    if (lower.match(/bridge|cross-chain/)) return "bridge";
    if (lower.match(/social|community|dao/)) return "socialfi";
    return "defi";
  };

  const analyzeSentiment = (text) => {
    const bull = ["gain", "bullish", "up", "reward", "launch"];
    const bear = ["down", "hack", "loss", "bearish", "drop"];
    const t = text.toLowerCase();
    const bullCount = bull.filter((w) => t.includes(w)).length;
    const bearCount = bear.filter((w) => t.includes(w)).length;
    if (bullCount > bearCount) return "bullish";
    if (bearCount > bullCount) return "bearish";
    return "neutral";
  };

  const getSampleNews = () => [
    // Airdrop News
    {
      id: "sample-1",
      title: "Major L2 Protocol Announces Airdrop Snapshot",
      description: "Layer 2 solution confirms airdrop snapshot for early users. Snapshot block: 18,500,000",
      source: "CryptoNews",
      category: "airdrop",
      url: "#",
      sentiment: "bullish",
      votes: 125,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-2",
      title: "DeFi Protocol Launches Governance Token Distribution",
      description: "New DeFi protocol distributes governance tokens to liquidity providers. Claim period: 30 days",
      source: "CryptoNews",
      category: "defi",
      url: "#",
      sentiment: "bullish",
      votes: 98,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-3",
      title: "Bridge Protocol Rewards Early Adopters",
      description: "New cross-chain bridge platform rewards early users with token incentives. Earn up to 500 tokens.",
      source: "CryptoNews",
      category: "bridge",
      url: "#",
      sentiment: "bullish",
      votes: 87,
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-4",
      title: "🔥 Ethereum Layer2 Ecosystem Expansion",
      description: "Arbitrum and Optimism see record transaction volumes. Rewards program launched for ecosystem participants.",
      source: "CryptoNews",
      category: "layer2",
      url: "#",
      sentiment: "bullish",
      votes: 156,
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-5",
      title: "NFT Marketplace Introduces Loyalty Tokens",
      description: "Leading NFT marketplace launches loyalty program with exclusive token rewards for traders.",
      source: "CryptoNews",
      category: "nft",
      url: "#",
      sentiment: "bullish",
      votes: 72,
      timestamp: new Date(Date.now() - 18000000).toISOString(),
      isFromApi: true,
    },
    // DeFi News
    {
      id: "sample-6",
      title: "Uniswap V4 Beta Launch Attracts Liquidity Providers",
      description: "Next generation decentralized exchange brings new features for concentrated liquidity and custom pools.",
      source: "CoinNews",
      category: "defi",
      url: "#",
      sentiment: "bullish",
      votes: 143,
      timestamp: new Date(Date.now() - 21600000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-7",
      title: "Aave Flash Loan Usage Reaches All-Time High",
      description: "DeFi lending protocol records surge in flash loan activity. New use cases emerging for developers.",
      source: "CoinNews",
      category: "defi",
      url: "#",
      sentiment: "bullish",
      votes: 89,
      timestamp: new Date(Date.now() - 25200000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-8",
      title: "Curve Finance Governance Vote Passes",
      description: "Community approves new parameter changes for improved capital efficiency across liquidity pools.",
      source: "CoinNews",
      category: "defi",
      url: "#",
      sentiment: "bullish",
      votes: 112,
      timestamp: new Date(Date.now() - 28800000).toISOString(),
      isFromApi: true,
    },
    // GameFi News
    {
      id: "sample-9",
      title: "GameFi Platform Announces Player Rewards",
      description: "Popular GameFi platform reveals new player reward system with daily rewards and seasonal events.",
      source: "GameNews",
      category: "gamefi",
      url: "#",
      sentiment: "bullish",
      votes: 94,
      timestamp: new Date(Date.now() - 32400000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-10",
      title: "Axie Infinity Launches New Game Mode",
      description: "Play-to-earn gaming continues evolution with PvE dungeon raids and competitive tournaments.",
      source: "GameNews",
      category: "gamefi",
      url: "#",
      sentiment: "bullish",
      votes: 134,
      timestamp: new Date(Date.now() - 36000000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-11",
      title: "Guild of Guardians Announces Beta Launch",
      description: "Mobile gaming meets blockchain rewards. Early players eligible for exclusive token airdrops.",
      source: "GameNews",
      category: "gamefi",
      url: "#",
      sentiment: "bullish",
      votes: 108,
      timestamp: new Date(Date.now() - 39600000).toISOString(),
      isFromApi: true,
    },
    // Bridge & Infrastructure
    {
      id: "sample-12",
      title: "StarGate Finance Expands to New Chains",
      description: "Cross-chain bridge protocol adds support for 3 new blockchain networks. User rewards increased.",
      source: "CryptoNews",
      category: "bridge",
      url: "#",
      sentiment: "bullish",
      votes: 126,
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-13",
      title: "Cosmos IBC Protocol Reaches 100M Daily Volume",
      description: "Interchain communication milestone achieved. New dApps integrating cross-chain functionality.",
      source: "CryptoNews",
      category: "infra",
      url: "#",
      sentiment: "bullish",
      votes: 117,
      timestamp: new Date(Date.now() - 46800000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-14",
      title: "Chainlink CCIP Beta Expands Developer Access",
      description: "Cross-chain messaging infrastructure opens to more teams. Reward program for early builders.",
      source: "CryptoNews",
      category: "infra",
      url: "#",
      sentiment: "bullish",
      votes: 145,
      timestamp: new Date(Date.now() - 50400000).toISOString(),
      isFromApi: true,
    },
    // Layer 2 & Scaling
    {
      id: "sample-15",
      title: "zkSync Era Transaction Costs Drop 50%",
      description: "Zero-knowledge rollup upgrade improves compression. Users enjoy significantly lower gas fees.",
      source: "CryptoNews",
      category: "layer2",
      url: "#",
      sentiment: "bullish",
      votes: 178,
      timestamp: new Date(Date.now() - 54000000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-16",
      title: "Polygon Launches zkEVM Mainnet",
      description: "Ethereum-compatible zero-knowledge scaling solution goes live. Enterprise partnerships announced.",
      source: "CryptoNews",
      category: "layer2",
      url: "#",
      sentiment: "bullish",
      votes: 267,
      timestamp: new Date(Date.now() - 57600000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-17",
      title: "Starknet Releases New Cairo Update",
      description: "StarkWare rollout brings improved developer tooling and enhanced performance metrics.",
      source: "CryptoNews",
      category: "layer2",
      url: "#",
      sentiment: "bullish",
      votes: 95,
      timestamp: new Date(Date.now() - 61200000).toISOString(),
      isFromApi: true,
    },
    // NFT & Web3
    {
      id: "sample-18",
      title: "OpenSea Updates Creator Royalties System",
      description: "NFT marketplace implements new royalty mechanisms to support artists and creators.",
      source: "NFTNews",
      category: "nft",
      url: "#",
      sentiment: "bullish",
      votes: 84,
      timestamp: new Date(Date.now() - 64800000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-19",
      title: "Art Blocks Introduces Curated Collection",
      description: "Generative art platform expands with new artist collaborations and exclusive drops.",
      source: "NFTNews",
      category: "nft",
      url: "#",
      sentiment: "bullish",
      votes: 102,
      timestamp: new Date(Date.now() - 68400000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-20",
      title: "Blur NFT Marketplace Hits 10B Trading Volume",
      description: "Next-gen NFT trading platform achieves major milestone. Community rewards distributed.",
      source: "NFTNews",
      category: "nft",
      url: "#",
      sentiment: "bullish",
      votes: 189,
      timestamp: new Date(Date.now() - 72000000).toISOString(),
      isFromApi: true,
    },
    // SocialFi News
    {
      id: "sample-21",
      title: "Lens Protocol Reaches 1M Active Users",
      description: "Decentralized social network achieves user milestone. New creator monetization tools launched.",
      source: "SocialFiNews",
      category: "socialfi",
      url: "#",
      sentiment: "bullish",
      votes: 156,
      timestamp: new Date(Date.now() - 75600000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-22",
      title: "Friend.tech Trading Volume Surge",
      description: "Friend key trading platform sees explosive growth. Early adopters earning significant returns.",
      source: "SocialFiNews",
      category: "socialfi",
      url: "#",
      sentiment: "bullish",
      votes: 198,
      timestamp: new Date(Date.now() - 79200000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-23",
      title: "Farcaster Announces New Creator Tools",
      description: "Decentralized social platform rolls out monetization and analytics features for creators.",
      source: "SocialFiNews",
      category: "socialfi",
      url: "#",
      sentiment: "bullish",
      votes: 127,
      timestamp: new Date(Date.now() - 82800000).toISOString(),
      isFromApi: true,
    },
    // Market & General News
    {
      id: "sample-24",
      title: "Bitcoin ETF Approval Rumors Heat Up",
      description: "Regulatory signals suggest imminent approval. Market reacts positively to institutional adoption news.",
      source: "CryptoNews",
      category: "defi",
      url: "#",
      sentiment: "bullish",
      votes: 312,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-25",
      title: "Ethereum Staking Rewards Reach New High",
      description: "Validator participation increases. Annual percentage yield makes staking increasingly attractive.",
      source: "CryptoNews",
      category: "defi",
      url: "#",
      sentiment: "bullish",
      votes: 234,
      timestamp: new Date(Date.now() - 90000000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-26",
      title: "Enterprise Crypto Adoption Accelerates",
      description: "Fortune 500 companies integrating blockchain into operations. B2B partnerships on the rise.",
      source: "CryptoNews",
      category: "infra",
      url: "#",
      sentiment: "bullish",
      votes: 267,
      timestamp: new Date(Date.now() - 93600000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-27",
      title: "Blockchain Integration in Supply Chain",
      description: "Companies using distributed ledger for tracking. Transparency improvements reduce counterfeiting.",
      source: "CryptoNews",
      category: "infra",
      url: "#",
      sentiment: "bullish",
      votes: 145,
      timestamp: new Date(Date.now() - 97200000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-28",
      title: "Central Bank Digital Currency Progress",
      description: "Multiple nations advance CBDC pilot programs. Integration with blockchain ecosystems explored.",
      source: "CryptoNews",
      category: "defi",
      url: "#",
      sentiment: "neutral",
      votes: 189,
      timestamp: new Date(Date.now() - 100800000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-29",
      title: "Web3 Gaming Studios Secure Major Funding",
      description: "Billion-dollar investments in blockchain gaming. Next generation titles in development.",
      source: "GameNews",
      category: "gamefi",
      url: "#",
      sentiment: "bullish",
      votes: 223,
      timestamp: new Date(Date.now() - 104400000).toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-30",
      title: "Meme Coin Community Launches Charitable Initiative",
      description: "Decentralized community raises funds for global causes. Blockchain transparency ensures accountability.",
      source: "CryptoNews",
      category: "defi",
      url: "#",
      sentiment: "bullish",
      votes: 156,
      timestamp: new Date(Date.now() - 108000000).toISOString(),
      isFromApi: true,
    },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("airdrop_news_manual");
    if (saved) setNews(JSON.parse(saved));
  }, []);

  useEffect(() => {
    fetchCryptoNews();
    let interval;
    if (autoRefresh) interval = setInterval(fetchCryptoNews, 10 * 60 * 1000);
    return () => interval && clearInterval(interval);
  }, [autoRefresh, fetchCryptoNews]);

  return (
    <motion.div
      className={`relative z-10 w-full mb-8 p-0 rounded-3xl ${neuOut} transition-all duration-300`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className={`p-5 flex justify-between items-center flex-wrap gap-3 rounded-t-3xl ${neuInset}`}
        variants={fadeInUpVariants}
      >
        <motion.div className="flex items-center gap-3" variants={itemVariants}>
          <motion.h2 
            className="text-2xl font-bold text-gray-700 flex items-center gap-2"
            variants={itemVariants}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
              <Newspaper size={28} className="text-blue-500" />
            </motion.div>
            Airdrop News Aggregator
          </motion.h2>
          {isLoading && (
            <RefreshCw size={20} className="text-blue-400 animate-spin" />
          )}
        </motion.div>

        <motion.div className="flex items-center gap-3 flex-wrap" variants={containerVariants}>
          {lastUpdate && (
            <motion.div
              className={`flex items-center gap-2 text-gray-600 text-sm px-3 py-1 rounded-full ${neuInset}`}
              variants={itemVariants}
            >
              <Clock size={16} />
              <span>
                Updated {Math.floor((new Date() - lastUpdate) / 60000)}m ago
              </span>
            </motion.div>
          )}

          <motion.button 
            onClick={fetchCryptoNews} 
            disabled={isLoading} 
            className={neuButton + " px-4 py-2 text-gray-700"}
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <RefreshCw
              size={16}
              className={`inline-block mr-1 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </motion.button>

          <motion.button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`${neuButton} px-4 py-2 text-gray-700`}
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Auto: {autoRefresh ? "ON" : "OFF"}
          </motion.button>

          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`${neuButton} px-4 py-2 text-gray-700 flex items-center gap-2`}
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            {isExpanded ? "Hide" : "Show"}
          </motion.button>
        </motion.div>
      </motion.div>

      {error && (
        <motion.div 
          className="p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={`p-3 text-gray-700 flex items-center gap-2 rounded-xl ${neuInset}`}>
            <AlertCircle size={18} className="text-yellow-600" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {isExpanded && (
        <motion.div 
          className={`p-6 rounded-b-3xl space-y-6 ${neuInset}`}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="flex flex-wrap gap-4 items-center" variants={containerVariants}>
            <motion.div className="flex items-center gap-2" variants={itemVariants}>
              <Filter size={16} className="text-gray-600" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={neuInput}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div className="flex items-center gap-2" variants={itemVariants}>
              <TrendingUp size={16} className="text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={neuInput}
              >
                <option value="trending">Trending</option>
                <option value="latest">Latest</option>
                <option value="bullish">Most Bullish</option>
              </select>
            </motion.div>

            <motion.button
              onClick={() => setShowAddForm(!showAddForm)}
              className={neuButton + " px-4 py-2 text-gray-700 ml-auto flex items-center gap-2"}
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {showAddForm ? (
                <>
                  <X size={16} /> Cancel
                </>
              ) : (
                <>
                  <Plus size={16} /> Add News
                </>
              )}
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-2xl p-5 ${neuInset}`}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!formData.title || !formData.url) return;
                    const newItem = {
                      id: Date.now(),
                      ...formData,
                      sentiment: analyzeSentiment(formData.title),
                      votes: 0,
                      timestamp: new Date().toISOString(),
                      isFromApi: false,
                    };
                    const updated = [newItem, ...news];
                    setNews(updated);
                    localStorage.setItem(
                      "airdrop_news_manual",
                      JSON.stringify(updated)
                    );
                    setFormData({
                      title: "",
                      description: "",
                      source: "",
                      category: "defi",
                      url: "",
                    });
                    setShowAddForm(false);
                  }}
                  className="grid gap-4"
                >
                  <input
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={neuInput}
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={neuInput}
                  />
                  <input
                    placeholder="Source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className={neuInput}
                  />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={neuInput}
                  >
                    {categories
                      .filter((c) => c.id !== "all")
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                  </select>
                  <input
                    placeholder="URL"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className={neuInput}
                  />
                  <motion.button 
                    type="submit" 
                    className={neuButton + " px-4 py-2 text-gray-700"}
                    variants={buttonHoverVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Add News
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6" variants={containerVariants}>
            {[...news,
              ...apiNews.filter(
                (n) => filterCategory === "all" || n.category === filterCategory
              ),
            ]
              .sort((a, b) => {
                if (sortBy === "latest")
                  return new Date(b.timestamp) - new Date(a.timestamp);
                if (sortBy === "bullish")
                  return (
                    (b.sentiment === "bullish") -
                    (a.sentiment === "bullish")
                  );
                return b.votes - a.votes;
              })
              .map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -5 }}
                  className={`rounded-3xl p-5 ${neuOut} transition`}
                  variants={itemVariants}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs text-white ${
                        categories.find((c) => c.id === item.category)?.color
                      }`}
                    >
                      {item.category.toUpperCase()}
                    </span>
                    <div className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {item.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink size={14} /> Source
                    </a>

                    <div className="flex gap-2 text-gray-600">
                      <motion.button
                        onClick={() => {
                          const all = [...news, ...apiNews];
                          const updated = all.map((n) =>
                            n.id === item.id ? { ...n, votes: (n.votes || 0) + 1 } : n
                          );
                          setApiNews(updated.filter((n) => n.isFromApi));
                          setNews(updated.filter((n) => !n.isFromApi));
                        }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ThumbsUp size={16} />
                      </motion.button>

                      <motion.button
                        onClick={() => {
                          const all = [...news, ...apiNews];
                          const updated = all.map((n) =>
                            n.id === item.id ? { ...n, votes: (n.votes || 0) - 1 } : n
                          );
                          setApiNews(updated.filter((n) => n.isFromApi));
                          setNews(updated.filter((n) => !n.isFromApi));
                        }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ThumbsDown size={16} />
                      </motion.button>

                      <span className="text-sm">{item.votes}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NewsAggregator;
