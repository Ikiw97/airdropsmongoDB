import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle, Clock, Wallet, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const MetricCards = ({ stats = {} }) => {
    const metrics = [
        {
            label: 'Total Projects',
            value: stats.total || 0,
            change: null,
            icon: Activity,
            color: '#00d4ff',
            bgGlow: 'rgba(0, 212, 255, 0.1)',
        },
        {
            label: 'Daily Checked',
            value: stats.dailyTasks || 0,
            change: stats.total > 0 ? ((stats.dailyTasks / stats.total) * 100).toFixed(0) + '%' : '0%',
            changePositive: true,
            icon: CheckCircle,
            color: '#00ff88',
            bgGlow: 'rgba(0, 255, 136, 0.1)',
        },
        {
            label: 'Ongoing',
            value: stats.ongoingProjects || 0,
            change: null,
            icon: Clock,
            color: '#fbbf24',
            bgGlow: 'rgba(251, 191, 36, 0.1)',
        },
        {
            label: 'Unique Wallets',
            value: stats.uniqueWallets || 0,
            change: null,
            icon: Wallet,
            color: '#a855f7',
            bgGlow: 'rgba(168, 85, 247, 0.1)',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
            {metrics.map((metric, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative p-4 rounded-lg cursor-pointer group transition-colors duration-300"
                    style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                    }}
                    whileHover={{
                        borderColor: metric.color,
                        boxShadow: `0 0 20px ${metric.bgGlow}`,
                    }}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
                            <p className="text-2xl font-bold" style={{ color: metric.color }}>
                                {metric.value}
                            </p>
                            {metric.change && (
                                <div className={`flex items-center gap-1 text-xs mt-1 ${metric.changePositive ? 'text-green-400' : 'text-red-400'}`}>
                                    {metric.changePositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    <span>{metric.change}</span>
                                </div>
                            )}
                        </div>
                        <div
                            className="p-2 rounded-lg"
                            style={{ background: metric.bgGlow }}
                        >
                            <metric.icon size={18} style={{ color: metric.color }} />
                        </div>
                    </div>

                    {/* Mini sparkline placeholder */}
                    <div className="mt-3 h-8 flex items-end gap-0.5">
                        {[...Array(12)].map((_, j) => (
                            <div
                                key={j}
                                className="flex-1 rounded-sm transition-all group-hover:opacity-100 opacity-60"
                                style={{
                                    height: `${Math.random() * 100}%`,
                                    background: `linear-gradient(to top, ${metric.color}40, ${metric.color})`,
                                    minHeight: '4px',
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default MetricCards;
