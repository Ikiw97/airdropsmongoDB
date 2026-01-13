import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import apiService from '../api/apiService';

const GainerLoserList = () => {
    const [gainers, setGainers] = React.useState([
        { name: "DOGE", fullName: "Dogecoin", price: "$0.14", change: "+12.40%", logo: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png" },
        { name: "SOL", fullName: "Solana", price: "$142.18", change: "+4.12%", logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
        { name: "BTC", fullName: "Bitcoin", price: "$96,432.12", change: "+1.24%", logo: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
        { name: "ADA", fullName: "Cardano", price: "$0.45", change: "+1.15%", logo: "https://assets.coingecko.com/coins/images/975/small/cardano.png" },
        { name: "ETH", fullName: "Ethereum", price: "$2,642.55", change: "+0.85%", logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
    ]);
    const [losers, setLosers] = React.useState([
        { name: "XRP", fullName: "XRP", price: "$1.12", change: "-2.31%", logo: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png" },
        { name: "LINK", fullName: "Chainlink", price: "$18.44", change: "-1.05%", logo: "https://assets.coingecko.com/coins/images/4/small/chainlink.png" },
        { name: "BNB", fullName: "BNB", price: "$612.40", change: "-0.45%", logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
    ]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchVolatilityData = async () => {
            try {
                const data = await apiService.getMarketPrices();
                if (!Array.isArray(data)) throw new Error("Invalid format");

                // Sort by 24h change
                const sorted = [...data].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);

                const formatCoin = (coin) => ({
                    name: coin.symbol.toUpperCase(),
                    fullName: coin.name,
                    price: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(coin.current_price),
                    change: (coin.price_change_percentage_24h > 0 ? "+" : "") + coin.price_change_percentage_24h.toFixed(2) + "%",
                    logo: coin.image
                });

                setGainers(sorted.slice(0, 5).map(formatCoin));
                setLosers(sorted.slice(-5).reverse().map(formatCoin));
            } catch (err) {
                console.error("Failed to fetch volatility data, using mock fallback", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVolatilityData();
        const interval = setInterval(fetchVolatilityData, 300000); // 5 minutes
        return () => clearInterval(interval);
    }, []);

    const getLogoUrl = (coin) => {
        if (!coin) return "https://cryptologos.cc/logos/generic-logo.png";
        return coin.logo || `https://api.coinlore.net/www/coinicons/${(coin.name || 'generic').toLowerCase()}.png`;
    };

    const CoinRow = ({ coin, isGainer }) => (
        <div className="flex items-center justify-between group hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-800">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full transition-all duration-300 p-1.5 flex items-center justify-center overflow-hidden" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                    <img
                        src={getLogoUrl(coin)}
                        alt={coin?.name || 'Coin'}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://cryptologos.cc/logos/generic-logo.png";
                        }}
                    />
                </div>
                <div>
                    <h4 className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{coin.name}</h4>
                    <p className="text-[9px] text-gray-500">{coin.fullName}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{coin.price}</p>
                <p className={`text-[9px] font-medium flex items-center justify-end gap-0.5 ${isGainer ? 'text-green-400' : 'text-red-400'}`}>
                    {isGainer ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
                    {coin.change}
                </p>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Gainers */}
            <div className="p-5 rounded-xl transition-all duration-300 shadow-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-green-500/10 text-green-400">🚀</span>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top Gainers 24H</h3>
                    </div>
                    <span className="text-green-500/50 text-[10px] uppercase font-bold tracking-tighter cursor-pointer hover:text-green-500">+</span>
                </div>
                <div className="space-y-1">
                    {gainers.map((coin, idx) => (
                        <CoinRow key={idx} coin={coin} isGainer={true} />
                    ))}
                </div>
            </div>

            {/* Top Losers */}
            <div className="p-5 rounded-xl transition-all duration-300 shadow-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-red-500/10 text-red-400">📉</span>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top Losers 24H</h3>
                    </div>
                    <span className="text-red-500/50 text-[10px] uppercase font-bold tracking-tighter cursor-pointer hover:text-red-500">-</span>
                </div>
                <div className="space-y-1">
                    {losers.map((coin, idx) => (
                        <CoinRow key={idx} coin={coin} isGainer={false} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GainerLoserList;
