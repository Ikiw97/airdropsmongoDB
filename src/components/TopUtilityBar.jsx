import React, { useState } from 'react';
import { TrendingUp, Activity, Wallet, CheckCircle, BarChart2, Heart } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import DonationModal from './DonationModal';

const TopUtilityBar = ({ stats = {} }) => {
    const [donationOpen, setDonationOpen] = useState(false);

    const quickStats = [
        { label: 'Total Projects', value: stats.total || 0, icon: BarChart2, color: 'text-neon-blue' },
        { label: 'Daily Checked', value: stats.dailyTasks || 0, icon: CheckCircle, color: 'text-neon-green' },
        { label: 'Wallets', value: stats.uniqueWallets || 0, icon: Wallet, color: 'text-yellow-400' },
        { label: 'Completion', value: `${stats.completionRate || 0}%`, icon: Activity, color: 'text-neon-purple' },
    ];

    return (
        <>
            <div
                className="w-full px-4 py-2 flex items-center justify-between text-xs"
                style={{
                    background: 'var(--bg-tertiary)',
                    borderBottom: '1px solid var(--border-primary)',
                    transition: 'none'
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
                    <button
                        onClick={() => setDonationOpen(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/10 hover:bg-pink-500/20 text-pink-500"
                        title="Donasi"
                    >
                        <Heart size={14} />
                        <span className="font-semibold hidden sm:inline">Donasi</span>
                    </button>
                    <ThemeToggle />
                </div>
            </div>

            <DonationModal isOpen={donationOpen} onClose={() => setDonationOpen(false)} />
        </>
    );
};

export default TopUtilityBar;

