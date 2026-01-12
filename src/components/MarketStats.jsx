import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import apiService from '../api/apiService';

const MarketStats = () => {
    const [stats, setStats] = React.useState([
        { label: "Total Market Cap", value: "$3.19T", change: "0.38%", changeType: "up" },
        { label: "24h Volume", value: "$46.88B", subValue: "Trading Activity" },
        { label: "BTC Dominance", value: "56.86%", progress: 56.86, color: "from-orange-500 to-orange-400" },
        { label: "ETH Dominance", value: "11.76%", progress: 11.76, color: "from-blue-500 to-blue-400" },
        { label: "Active Cryptos", value: "12,450", subValue: "Market Scope", color: "text-green-400" },
    ]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchGlobalStats = async () => {
            try {
                const data = await apiService.getMarketGlobalStats();
                if (!data || !data.total_market_cap) {
                    throw new Error("Invalid global data");
                }

                const formattedStats = [
                    {
                        label: "Total Market Cap",
                        value: new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            notation: 'compact',
                            maximumFractionDigits: 2
                        }).format(data.total_market_cap.usd),
                        change: data.market_cap_change_percentage_24h_usd.toFixed(2) + "%",
                        changeType: data.market_cap_change_percentage_24h_usd >= 0 ? "up" : "down"
                    },
                    {
                        label: "24h Volume",
                        value: new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            notation: 'compact',
                            maximumFractionDigits: 2
                        }).format(data.total_volume.usd),
                        subValue: "Trading Activity"
                    },
                    {
                        label: "BTC Dominance",
                        value: data.market_cap_percentage.btc.toFixed(2) + "%",
                        progress: data.market_cap_percentage.btc,
                        color: "from-orange-500 to-orange-400"
                    },
                    {
                        label: "ETH Dominance",
                        value: data.market_cap_percentage.eth.toFixed(2) + "%",
                        progress: data.market_cap_percentage.eth,
                        color: "from-blue-500 to-blue-400"
                    },
                    {
                        label: "Active Cryptos",
                        value: data.active_cryptocurrencies.toLocaleString(),
                        subValue: "Market Scope",
                        color: "text-green-400"
                    },
                ];
                setStats(formattedStats);
            } catch (err) {
                console.error("Failed to fetch global stats, using fallback data", err);
                // Keep existing fallback data
            } finally {
                setLoading(false);
            }
        };

        fetchGlobalStats();
        const interval = setInterval(fetchGlobalStats, 300000); // 5 minutes
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6 rounded-xl transition-all duration-300 shadow-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
            <div className="md:col-span-5 mb-2">
                <h2 className="text-[10px] font-bold text-teal-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                    Global Market Overview
                </h2>
            </div>

            {stats.map((stat, idx) => (
                <div key={idx} className="space-y-2">
                    <p className="text-[10px] text-gray-500 font-medium uppercase">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className={`text-xl font-bold transition-all duration-300`} style={{ color: stat.color ? '' : 'var(--text-primary)' }}>{stat.value}</h3>
                        {stat.change && (
                            <span className={`text-[10px] flex items-center gap-0.5 ${stat.changeType === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                {stat.changeType === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                {stat.change}
                            </span>
                        )}
                    </div>
                    {stat.subValue && <p className="text-[10px] text-gray-600 italic">{stat.subValue}</p>}
                    {stat.progress !== undefined && (
                        <div className="w-full h-1 rounded-full overflow-hidden transition-all duration-300" style={{ background: 'var(--bg-tertiary)' }}>
                            <div
                                className={`h-full bg-gradient-to-r ${stat.color}`}
                                style={{ width: `${stat.progress}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MarketStats;
