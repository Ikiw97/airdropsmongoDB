import React from 'react';
import { TrendingUp, Activity, Wallet, CheckCircle, BarChart2, Download } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const TopUtilityBar = ({ stats = {} }) => {
    const quickStats = [
        { label: 'Total Projects', value: stats.total || 0, icon: BarChart2, color: 'text-neon-blue' },
        { label: 'Daily Checked', value: stats.dailyTasks || 0, icon: CheckCircle, color: 'text-neon-green' },
        { label: 'Wallets', value: stats.uniqueWallets || 0, icon: Wallet, color: 'text-yellow-400' },
        { label: 'Completion', value: `${stats.completionRate || 0}%`, icon: Activity, color: 'text-neon-purple' },
    ];

    return (
        <div
            className="w-full px-4 py-2 flex items-center justify-between text-xs"
            style={{
                background: 'var(--bg-tertiary)',
                borderBottom: '1px solid var(--border-primary)',
            }}
        >
            {/* Left - Quick Stats */}
            <div className="flex items-center gap-4 overflow-x-auto">
                {quickStats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-1.5 whitespace-nowrap">
                        <stat.icon size={12} className={stat.color} />
                        <span className="text-gray-500">{stat.label}:</span>
                        <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
                <a
                    href="#"
                    className="flex items-center gap-1 text-gray-400 hover:text-neon-green transition text-xs"
                >
                    <Download size={12} />
                    <span className="hidden sm:inline">Download</span>
                </a>
                <ThemeToggle />
            </div>
        </div>
    );
};

export default TopUtilityBar;
