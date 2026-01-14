import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, RefreshCw, CircleDollarSign } from 'lucide-react';
import BubbleMap from './BubbleMap';
import apiService from '../../api/apiService';

const BubbleMapFeature = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Constraints for drag to keep it on screen content-wise
    const constraintsRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await apiService.getMarketPrices();
            if (Array.isArray(result)) {
                setData(result);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch bubble map data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && data.length === 0) {
            fetchData();
        }
        // Optional: auto-refresh every minute if open
        let interval;
        if (isOpen) {
            interval = setInterval(fetchData, 60000);
        }
        return () => clearInterval(interval);
    }, [isOpen]);

    return (
        <>
            {/* Draggable Floating Button - Manual drag for instant response */}
            <div
                ref={constraintsRef}
                className="fixed z-[9999] cursor-grab active:cursor-grabbing"
                style={{
                    touchAction: 'none',
                    bottom: '40px',
                    right: '40px',
                    transition: 'none'
                }}
                onMouseDown={(e) => {
                    e.preventDefault();
                    const el = constraintsRef.current;
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const rect = el.getBoundingClientRect();
                    const offsetX = startX - rect.left;
                    const offsetY = startY - rect.top;

                    el.style.cursor = 'grabbing';

                    const onMouseMove = (moveEvent) => {
                        const x = moveEvent.clientX - offsetX;
                        const y = moveEvent.clientY - offsetY;
                        el.style.left = `${x}px`;
                        el.style.top = `${y}px`;
                        el.style.right = 'auto';
                        el.style.bottom = 'auto';
                    };

                    const onMouseUp = () => {
                        el.style.cursor = 'grab';
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                }}
                onClick={() => setIsOpen(true)}
            >
                <div
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 via-gray-900 to-black shadow-[0_0_25px_rgba(0,0,0,0.5),0_0_10px_rgba(100,200,255,0.15)] flex flex-col items-center justify-center border border-gray-600/50 group relative overflow-hidden hover:scale-110 active:scale-90"
                    style={{
                        animation: 'bubbleFloat 4s ease-in-out infinite',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <style>{`
                        @keyframes bubbleFloat {
                            0%, 100% { transform: translateY(0) translateX(0); }
                            25% { transform: translateY(-8px) translateX(2px); }
                            50% { transform: translateY(0) translateX(0); }
                            75% { transform: translateY(-4px) translateX(-2px); }
                        }
                    `}</style>
                    {/* 3D light reflection effect - top left */}
                    <div className="absolute top-2 left-2 w-8 h-8 bg-gradient-to-br from-white/40 via-white/10 to-transparent rounded-full blur-[2px]" />
                    <div className="absolute top-3 left-3 w-4 h-4 bg-white/30 rounded-full blur-[1px]" />
                    {/* Subtle rim light */}
                    <div className="absolute inset-0 rounded-full border border-white/10" />
                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider text-center leading-tight z-10">
                        Bubble<br />Map
                    </span>
                </div>
            </div>

            {/* Fullscreen Popup Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-[950px] h-[85vh] bg-[#0a0b0d] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#0f1114]">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        Crypto Bubble Map
                                    </h2>
                                    <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">
                                        TOP 100
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {lastUpdated && (
                                        <span className="text-xs text-gray-400 mr-2">
                                            Updated: {lastUpdated.toLocaleTimeString()}
                                        </span>
                                    )}
                                    <button
                                        onClick={fetchData}
                                        disabled={loading}
                                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="Refresh"
                                    >
                                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-gray-400 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 relative overflow-hidden bg-black/50">
                                {loading && data.length === 0 ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <BubbleMap data={data} width={1100} height={700} />
                                )}
                            </div>

                            {/* Footer Legend */}
                            <div className="px-6 py-3 border-t border-gray-800 bg-[#0f1114] flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-[#16c784]" />
                                        <span>Gaining</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-[#ea3943]" />
                                        <span>Losing</span>
                                    </div>
                                    <span>Size = Market Cap</span>
                                </div>
                                <div>
                                    Data sources: CoinGecko
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default BubbleMapFeature;
