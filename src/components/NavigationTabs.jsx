import React, { useRef, useEffect } from 'react';
import {
    LayoutDashboard,
    Radio,
    Zap,
    Activity,
    Fuel,
    Calculator,
    Newspaper,
    Wallet,
    Shield,
    Repeat,
    Send,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

const NavigationTabs = ({ activeView, setActiveView, isMobile = false, className = '', style = {} }) => {
    const scrollRef = useRef(null);

    const menuItems = [
        { id: 'market-data', label: 'Market Data', icon: Activity },
        { id: 'projects', label: 'Airdrop Track', icon: LayoutDashboard },
        { id: 'infoairdrops', label: 'Info Airdrops', icon: Radio },
        { id: 'trading', label: 'Trading', icon: Zap },
        { id: 'analytics', label: 'Analytics', icon: Activity },
        { id: 'gas', label: 'Gas Tracker', icon: Fuel },
        { id: 'roi', label: 'ROI Calculator', icon: Calculator },
        { id: 'news', label: 'News', icon: Newspaper },
        { id: 'balance', label: 'Onchain', icon: Wallet },
        { id: 'keygen', label: 'Key Gen', icon: Shield },
        { id: 'dexlist', label: 'DEX & Bridge', icon: Repeat },
        { id: 'multisend', label: 'Multisend', icon: Send },
    ];

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 200;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div
            className={`relative flex items-center transition-all duration-300 ${className}`}
            style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-primary)',
                ...style
            }}
        >
            {/* Left scroll button */}
            <button
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-0 z-10 h-full px-2 items-center"
                style={{ background: 'linear-gradient(to right, var(--bg-secondary), transparent)' }}
            >
                <ChevronLeft size={16} className="text-gray-500 hover:text-current transition" />
            </button>

            {/* Tabs container */}
            <div
                ref={scrollRef}
                className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide md:px-10"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${isActive
                                ? 'text-neon-cyan'
                                : 'text-gray-500 hover:text-neon-cyan hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Icon size={16} />
                            <span>{item.label}</span>

                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 rounded-lg -z-10"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 212, 255, 0.15) 100%)',
                                        border: '1px solid rgba(0, 255, 136, 0.3)',
                                    }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Right scroll button */}
            <button
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-0 z-10 h-full px-2 items-center"
                style={{ background: 'linear-gradient(to left, var(--bg-secondary), transparent)' }}
            >
                <ChevronRight size={16} className="text-gray-500 hover:text-current transition" />
            </button>
        </div>
    );
};

export default NavigationTabs;
