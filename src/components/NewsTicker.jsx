import React from 'react';
import { Activity } from 'lucide-react';
import apiService from '../api/apiService';

const NewsTicker = () => {
    const [trending, setTrending] = React.useState([
        { symbol: "BTC", price: "$96,432.12", change: "+1.24%", isUp: true, logo: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
        { symbol: "ETH", price: "$2,642.55", change: "+0.85%", isUp: true, logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
        { symbol: "BNB", price: "$612.40", change: "-0.45%", isUp: false, logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
        { symbol: "SOL", price: "$142.18", change: "+4.12%", isUp: true, logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
        { symbol: "XRP", price: "$1.12", change: "-2.31%", isUp: false, logo: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png" },
        { symbol: "ADA", price: "$0.45", change: "+1.15%", isUp: true, logo: "https://assets.coingecko.com/coins/images/975/small/cardano.png" },
        { symbol: "DOGE", price: "$0.14", change: "+12.4%", isUp: true, logo: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png" },
    ]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchPrices = async () => {
            try {
                const data = await apiService.getMarketPrices();
                if (!data || !Array.isArray(data) || data.length === 0) {
                    throw new Error("Invalid or empty data");
                }
                // Sort by 24h change to match Gainer/Loser list
                const sorted = [...data].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
                
                // Get Top 5 Gainers and Top 5 Losers
                const topGainers = sorted.slice(0, 5);
                const topLosers = sorted.slice(-5).reverse();
                
                // Combine for ticker
                const tickerData = [...topGainers, ...topLosers];

                // Map CoinGecko data to our ticker format
                const mappedData = tickerData.map(coin => ({
                    symbol: coin.symbol.toUpperCase(),
                    price: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(coin.current_price),
                    change: (coin.price_change_percentage_24h > 0 ? "+" : "") + coin.price_change_percentage_24h.toFixed(2) + "%",
                    isUp: coin.price_change_percentage_24h > 0,
                    logo: coin.image
                }));
                setTrending(mappedData);
            } catch (err) {
                console.error("Failed to fetch ticker prices, using fallback data", err);
                // Keep existing fallback data
            } finally {
                setLoading(false);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const news = [
        "decentralized stablecoins still have deep flaws",
        "Ethereum's future hinges on zero-knowledge proofs, EF director says",
        "Robinhood explains building an Ethereum layer-2: 'We wanted the security from Ethereum'",
        "Bitcoin dominance increasing as altcoins face regulatory pressure",
        "New Layer 2 solution promises 100k TPS with near-zero fees",
        "Major institutional investors are accumulating BTC steadily",
    ];

    return (
        <div className="w-full transition-all duration-300" style={{ background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)' }}>
            {/* Top Row: News */}
            <div className="relative overflow-hidden py-1.5 flex items-center group" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <div className="flex-shrink-0 px-4 py-0.5 z-20" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)' }}>
                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest animate-pulse">
                        BREAKING
                    </span>
                </div>

                <div className="relative overflow-hidden flex-1 flex h-5">
                    <div
                        className="flex whitespace-nowrap items-center animate-marquee-slow pause-on-hover"
                    >
                        {[...news, ...news].map((item, index) => (
                            <div key={index} className="flex items-center mx-8">
                                <span className="text-[10px] text-gray-400 font-medium">
                                    <span style={{ color: 'var(--border-primary)' }} className="mr-2">•</span>
                                    {item}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Visual Fades */}
                <div className="absolute top-0 right-0 w-20 h-full pointer-events-none z-10" style={{ background: 'linear-gradient(to left, var(--bg-tertiary), transparent)' }} />
            </div>

            {/* Bottom Row: Trending Coins */}
            <div className="relative overflow-hidden py-2 flex items-center group">
                <div className="flex-shrink-0 px-4 py-0.5 z-20 flex items-center gap-2" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)' }}>
                    <Activity size={10} className="text-teal-400" />
                    <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest">
                        TRENDING
                    </span>
                </div>

                <div className="relative overflow-hidden flex-1 flex h-6">
                    <div
                        className="flex whitespace-nowrap items-center animate-marquee-fast pause-on-hover"
                    >
                        {[...trending, ...trending].map((coin, index) => (
                            <div key={index} className="flex items-center mx-6 gap-2">
                                <img src={coin.logo} alt={coin.symbol} className="w-4 h-4 object-contain" />
                                <span className="text-[10px] font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>{coin.symbol}:</span>
                                <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{coin.price}</span>
                                <span className={`text-[9px] font-bold flex items-center gap-0.5 ${coin.isUp ? 'text-green-400' : 'text-red-400'}`}>
                                    ({coin.change})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Visual Fades */}
                <div className="absolute top-0 right-0 w-20 h-full pointer-events-none z-10" style={{ background: 'linear-gradient(to left, var(--bg-tertiary), transparent)' }} />
            </div>
        </div>
    );
};

export default NewsTicker;
