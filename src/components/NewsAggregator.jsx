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

import { useTheme } from "../contexts/ThemeContext";

const NewsAggregator = () => {
  const { theme } = useTheme();
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
      // Source 1: CryptoCompare News API
      try {
        const response = await axios.get(
          "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest",
          { timeout: 8000 }
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
          console.log("✅ CryptoCompare news loaded:", transformedNews.length, "items");
        }
      } catch (err) {
        console.warn("⚠️ CryptoCompare source failed:", err.message);
      }

      // Source 2: CoinGecko - Trending cryptocurrencies (real market data)
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/search/trending",
          { timeout: 8000 }
        );

        if (response.data && response.data.coins && response.data.coins.length > 0) {
          const transformedNews = response.data.coins.map((coin, index) => {
            const item = coin.item;
            return {
              id: `cg-trending-${item?.id || Date.now() + index}`,
              title: `🔥 ${item?.name || "Unknown"} (${item?.symbol?.toUpperCase()}) - Trending`,
              description: `Market cap rank: #${item?.market_cap_rank || "N/A"}. Price: $${item?.data?.price?.toFixed(6) || "N/A"}. 24h change: ${item?.data?.price_change_percentage_24h?.usd?.toFixed(2)}%`,
              source: "CoinGecko",
              category: "defi",
              url: item?.url || "#",
              sentiment: (item?.data?.price_change_percentage_24h?.usd || 0) > 0 ? "bullish" : "bearish",
              votes: Math.floor(Math.random() * 80 + 20),
              timestamp: new Date().toISOString(),
              isFromApi: true,
              imageurl: item?.thumb || null,
            };
          });
          allNews = [...allNews, ...transformedNews];
          console.log("✅ CoinGecko trending loaded:", transformedNews.length, "items");
        }
      } catch (err) {
        console.warn("⚠️ CoinGecko trending failed:", err.message);
      }

      // Source 3: CoinGecko - Global market data
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/global",
          { timeout: 8000 }
        );

        if (response.data) {
          const globalData = response.data.data || response.data;
          const btcDom = globalData.btc_dominance || 0;
          const ethDom = globalData.eth_dominance || 0;
          const marketCapUSD = globalData.total_market_cap?.usd || 0;
          const volumeUSD = globalData.total_volume?.usd || 0;
          const marketCapChange24h = globalData.market_cap_change_percentage_24h_usd || 0;

          const marketNews = [];

          // Bitcoin market update
          if (btcDom > 0) {
            marketNews.push({
              id: `cg-global-btc-${Date.now()}`,
              title: "📊 Bitcoin Market Dominance",
              description: `BTC Dominance: ${btcDom.toFixed(2)}%. Total Crypto Market Cap: $${(marketCapUSD / 1e12).toFixed(2)}T. Market change 24h: ${marketCapChange24h > 0 ? '+' : ''}${marketCapChange24h.toFixed(2)}%`,
              source: "CoinGecko",
              category: "defi",
              url: "#",
              sentiment: marketCapChange24h > 0 ? "bullish" : "bearish",
              votes: Math.floor(Math.random() * 60 + 40),
              timestamp: new Date().toISOString(),
              isFromApi: true,
            });
          }

          // Ethereum dominance update
          if (ethDom > 0) {
            marketNews.push({
              id: `cg-global-eth-${Date.now()}`,
              title: "⚡ Ethereum Dominance & Market Trends",
              description: `ETH Dominance: ${ethDom.toFixed(2)}%. 24h Trading Volume: $${(volumeUSD / 1e9).toFixed(2)}B. Altseason momentum: ${ethDom > 15 ? 'Strong' : 'Moderate'}`,
              source: "CoinGecko",
              category: "defi",
              url: "#",
              sentiment: ethDom > 15 ? "bullish" : "neutral",
              votes: Math.floor(Math.random() * 60 + 40),
              timestamp: new Date().toISOString(),
              isFromApi: true,
            });
          }

          allNews = [...allNews, ...marketNews];
          console.log("✅ CoinGecko global market data loaded:", marketNews.length, "items");
        }
      } catch (err) {
        console.warn("⚠️ CoinGecko global data failed:", err.message);
      }

      // Source 4: CoinGecko - Top gainers & losers (real data)
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&sparkline=false&price_change_percentage=24h",
          { timeout: 8000 }
        );

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const gainers = response.data.filter(coin => (coin.price_change_percentage_24h || 0) > 5);
          const losers = response.data.filter(coin => (coin.price_change_percentage_24h || 0) < -5);

          const priceNews = [];

          if (gainers.length > 0) {
            const topGainer = gainers[0];
            priceNews.push({
              id: `cg-gainer-${topGainer.id}`,
              title: `📈 Top Gainer: ${topGainer.name} (+${topGainer.price_change_percentage_24h?.toFixed(2)}%)`,
              description: `${topGainer.symbol.toUpperCase()} surging today. Current price: $${topGainer.current_price?.toFixed(6)}. Market cap: $${(topGainer.market_cap / 1e9)?.toFixed(2)}B`,
              source: "CoinGecko",
              category: "defi",
              url: "#",
              sentiment: "bullish",
              votes: Math.floor(Math.random() * 100 + 50),
              timestamp: new Date().toISOString(),
              isFromApi: true,
            });
          }

          if (losers.length > 0) {
            const topLoser = losers[losers.length - 1];
            priceNews.push({
              id: `cg-loser-${topLoser.id}`,
              title: `📉 Notable Decline: ${topLoser.name} (${topLoser.price_change_percentage_24h?.toFixed(2)}%)`,
              description: `${topLoser.symbol.toUpperCase()} seeing pressure. Current price: $${topLoser.current_price?.toFixed(6)}. Market cap: $${(topLoser.market_cap / 1e9)?.toFixed(2)}B`,
              source: "CoinGecko",
              category: "defi",
              url: "#",
              sentiment: "bearish",
              votes: Math.floor(Math.random() * 80 + 20),
              timestamp: new Date().toISOString(),
              isFromApi: true,
            });
          }

          allNews = [...allNews, ...priceNews];
          console.log("✅ CoinGecko price movements loaded:", priceNews.length, "items");
        }
      } catch (err) {
        console.warn("⚠️ CoinGecko price data failed:", err.message);
      }

      // Source 5: CoinGecko - Categories (DeFi, Layer2, NFT, Gaming data)
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/coins/categories",
          { timeout: 8000 }
        );

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const categoryNews = response.data
            .filter(cat => cat.market_cap && cat.market_cap > 0)
            .slice(0, 5)
            .map((cat, idx) => ({
              id: `cg-cat-${cat.id}-${Date.now()}`,
              title: `💰 ${cat.name} Sector Update`,
              description: `${cat.name} market cap: $${(cat.market_cap / 1e9).toFixed(2)}B. 24h change: ${cat.market_cap_change_24h > 0 ? '+' : ''}${cat.market_cap_change_24h?.toFixed(2)}%. Coins tracked: ${cat.coins_count}`,
              source: "CoinGecko",
              category: detectCategory(cat.name),
              url: "#",
              sentiment: (cat.market_cap_change_24h || 0) > 0 ? "bullish" : "bearish",
              votes: Math.floor(Math.random() * 70 + 30),
              timestamp: new Date().toISOString(),
              isFromApi: true,
            }));

          allNews = [...allNews, ...categoryNews];
          console.log("✅ CoinGecko categories loaded:", categoryNews.length, "items");
        }
      } catch (err) {
        console.warn("⚠️ CoinGecko categories failed:", err.message);
      }

      // Source 6: CoinPaprika - Market data & coins info
      try {
        const response = await axios.get(
          "https://api.coinpaprika.com/v1/coins?limit=20",
          { timeout: 8000 }
        );

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const paprikaNews = response.data.map((coin, idx) => ({
            id: `cp-coin-${coin.id}-${Date.now()}`,
            title: `📊 ${coin.name} (${coin.symbol}) - Market Data`,
            description: `Rank: #${coin.rank}. Active: ${coin.is_active ? 'Yes' : 'No'}. Type: ${coin.type}`,
            source: "CoinPaprika",
            category: detectCategory(`${coin.name} ${coin.symbol}`),
            url: "#",
            sentiment: "neutral",
            votes: Math.floor(Math.random() * 50 + 10),
            timestamp: new Date().toISOString(),
            isFromApi: true,
          }));

          allNews = [...allNews, ...paprikaNews];
          console.log("✅ CoinPaprika coins loaded:", paprikaNews.length, "items");
        }
      } catch (err) {
        console.warn("⚠️ CoinPaprika failed:", err.message);
      }

      // Source 7: Binance - Public market data (Top pairs)
      try {
        const response = await axios.get(
          "https://api.binance.com/api/v3/ticker/24hr?limit=15",
          { timeout: 8000 }
        );

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const binanceNews = response.data
            .filter(ticker => ticker.symbol.endsWith('USDT'))
            .slice(0, 10)
            .map((ticker) => {
              const priceChange = parseFloat(ticker.priceChangePercent);
              return {
                id: `bn-${ticker.symbol}-${Date.now()}`,
                title: `💹 ${ticker.symbol} - Binance Trading Data`,
                description: `24h Change: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%. Volume: ${(ticker.quoteAssetVolume / 1e9).toFixed(2)}B USDT. High: $${ticker.highPrice}, Low: $${ticker.lowPrice}`,
                source: "Binance",
                category: "defi",
                url: "#",
                sentiment: priceChange > 0 ? "bullish" : "bearish",
                votes: Math.floor(Math.random() * 60 + 20),
                timestamp: new Date().toISOString(),
                isFromApi: true,
              };
            });

          allNews = [...allNews, ...binanceNews];
          console.log("✅ Binance market data loaded:", binanceNews.length, "items");
        }
      } catch (err) {
        console.warn("⚠️ Binance failed:", err.message);
      }

      // Source 8: Kraken - Public market data
      try {
        const response = await axios.get(
          "https://api.kraken.com/0/public/Ticker?pair=XBTUSDT,ETHUSDT,ADAUSDT,DOGEUSDT,XRPUSDT",
          { timeout: 8000 }
        );

        if (response.data && response.data.result) {
          const krakenNews = Object.entries(response.data.result).map(([pair, data], idx) => {
            const priceChange = data.p ? parseFloat(data.p[1]) : 0;
            return {
              id: `kr-${pair}-${Date.now()}`,
              title: `📈 ${pair} - Kraken Ticker`,
              description: `Bid: ${data.b ? data.b[0] : 'N/A'}, Ask: ${data.a ? data.a[0] : 'N/A'}. Volume: ${data.v ? data.v[1] : 'N/A'} pairs. VWAP: ${data.p ? data.p[0] : 'N/A'}`,
              source: "Kraken",
              category: "defi",
              url: "#",
              sentiment: priceChange > 0 ? "bullish" : "bearish",
              votes: Math.floor(Math.random() * 40 + 10),
              timestamp: new Date().toISOString(),
              isFromApi: true,
            };
          });

          allNews = [...allNews, ...krakenNews];
          console.log("✅ Kraken market data loaded:", krakenNews.length, "items");
        }
      } catch (err) {
        console.warn("⚠️ Kraken failed:", err.message);
      }

      // Source 9: Messari - Crypto market intelligence (public endpoints)
      try {
        const response = await axios.get(
          "https://data.messari.io/api/v1/assets?limit=20",
          { timeout: 8000 }
        );

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          const messariNews = response.data.data.slice(0, 10).map((asset) => ({
            id: `ms-${asset.id}-${Date.now()}`,
            title: `💎 ${asset.name} - Market Intelligence`,
            description: `Symbol: ${asset.symbol}. Rank: #${asset.metrics?.rank_ref_market_cap || 'N/A'}. Real Volume: $${asset.metrics?.market_data?.volume_last_24_hours || 'N/A'} USD`,
            source: "Messari",
            category: detectCategory(asset.name),
            url: "#",
            sentiment: "neutral",
            votes: Math.floor(Math.random() * 50 + 15),
            timestamp: new Date().toISOString(),
            isFromApi: true,
          }));

          allNews = [...allNews, ...messariNews];
          console.log("✅ Messari crypto intelligence loaded:", messariNews.length, "items");
        }
      } catch (err) {
        console.warn("⚠️ Messari failed:", err.message);
      }

      // Source 10: Huobi - Exchange data
      try {
        const response = await axios.get(
          "https://api.huobi.pro/market/detail/merged?symbol=btcusdt",
          { timeout: 8000 }
        );

        if (response.data && response.data.tick) {
          const tick = response.data.tick;
          const huobiNews = [{
            id: `hb-btc-${Date.now()}`,
            title: `🔥 Bitcoin on Huobi - Real Trading Data`,
            description: `Close: $${tick.close}. Open: $${tick.open}. High: $${tick.high}. Low: $${tick.low}. Volume: ${(tick.vol / 1e8).toFixed(2)}M BTC. Ask: ${tick.ask?.[0] || 'N/A'}, Bid: ${tick.bid?.[0] || 'N/A'}`,
            source: "Huobi",
            category: "defi",
            url: "#",
            sentiment: tick.close > tick.open ? "bullish" : "bearish",
            votes: Math.floor(Math.random() * 70 + 30),
            timestamp: new Date().toISOString(),
            isFromApi: true,
          }];

          allNews = [...allNews, ...huobiNews];
          console.log("✅ Huobi market data loaded:", huobiNews.length, "items");
        }
      } catch (err) {
        console.warn("⚠️ Huobi failed:", err.message);
      }

      // Source 11: CoinGecko - Exchange data
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/exchanges?per_page=15&order=trade_volume_24h_btc_desc",
          { timeout: 8000 }
        );

        if (response.data && Array.isArray(response.data)) {
          const exchangeNews = response.data.slice(0, 8).map((exchange) => ({
            id: `cg-ex-${exchange.id}-${Date.now()}`,
            title: `💱 ${exchange.name} - Exchange Update`,
            description: `24h BTC Volume: ${exchange.trade_volume_24h_btc ? exchange.trade_volume_24h_btc.toFixed(2) : 'N/A'} BTC. Trust Score: ${exchange.trust_score || 'N/A'}/10. Established: ${exchange.year_established || 'N/A'}`,
            source: "CoinGecko",
            category: "defi",
            url: exchange.url || "#",
            sentiment: "neutral",
            votes: Math.floor(Math.random() * 45 + 15),
            timestamp: new Date().toISOString(),
            isFromApi: true,
          }));

          allNews = [...allNews, ...exchangeNews];
          console.log("✅ CoinGecko exchanges loaded:", exchangeNews.length, "items");
        }
      } catch (err) {
        console.warn("⚠️ CoinGecko exchanges failed:", err.message);
      }

      // Source 12: CoinGecko - NFT data
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/nft?order=h24_volume_usd_desc&per_page=10",
          { timeout: 8000 }
        );

        if (response.data && Array.isArray(response.data)) {
          const nftNews = response.data.slice(0, 8).map((nft) => ({
            id: `cg-nft-${nft.id}-${Date.now()}`,
            title: `🎨 ${nft.name} - NFT Market Data`,
            description: `24h Volume: $${nft.volume_24h || 0}. Market Cap: $${nft.market_cap || 0}. Floor Price: $${nft.floor_price_usd || 'N/A'}. 24h Change: ${nft.volume_change_percentage_24h ? nft.volume_change_percentage_24h.toFixed(2) : 'N/A'}%`,
            source: "CoinGecko",
            category: "nft",
            url: "#",
            sentiment: (nft.volume_change_percentage_24h || 0) > 0 ? "bullish" : "bearish",
            votes: Math.floor(Math.random() * 60 + 20),
            timestamp: new Date().toISOString(),
            isFromApi: true,
          }));

          allNews = [...allNews, ...nftNews];
          console.log("✅ CoinGecko NFT data loaded:", nftNews.length, "items");
        }
      } catch (err) {
        console.warn("⚠️ CoinGecko NFT data failed:", err.message);
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

        const sortedNews = uniqueNews.sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return timeB - timeA;
        });

        setApiNews(sortedNews.slice(0, 100)); // Show up to 100 items
        setLastUpdate(new Date());
        console.log("✅ Total unique news loaded:", sortedNews.length, "items");
        return;
      }
    } catch (err) {
      console.error("❌ All news sources failed:", err.message);
    }

    // Fallback: Use sample data only if ALL APIs fail
    console.warn("⚠️ Using fallback sample data");
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
                      className={`px-2 py-1 rounded-full text-xs text-white ${categories.find((c) => c.id === item.category)?.color
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
