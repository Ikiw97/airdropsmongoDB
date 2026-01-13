import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, RefreshCw } from 'lucide-react';
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
            {/* Draggable Floating Button */}
            {/* Draggable Floating Button */}
            {/* Draggable Floating Button */}
            <motion.div
                drag
                dragMomentum={false}
                className="fixed bottom-10 right-10 z-[9999]"
                style={{ touchAction: 'none' }} // Prevent scrolling on mobile while dragging
            >
                <motion.div
                    animate={{
                        y: [0, -10, 0], // Floating animation
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="cursor-pointer"
                >
                    <div className="relative w-14 h-14 rounded-full flex flex-col items-center justify-center group">
                        {/* Realistic Bubble Shell */}
                        <div className="absolute inset-0 rounded-full border border-white/40 shadow-[0_0_10px_rgba(6,182,212,0.3),inset_0_0_10px_rgba(255,255,255,0.2)] bg-gradient-to-br from-cyan-400/10 to-blue-600/10 backdrop-blur-[1px]" />
                        
                        {/* Strong Top-Left Shine (The "Window" reflection) */}
                        <div className="absolute top-[15%] left-[15%] w-[30%] h-[15%] bg-white/70 rounded-[100%] blur-[0.5px] transform -rotate-45" />
                        
                        {/* Secondary Bottom-Right Shine (Subtle) */}
                        <div className="absolute bottom-[15%] right-[15%] w-[15%] h-[8%] bg-cyan-300/40 rounded-[100%] blur-[1px] transform -rotate-45" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center justify-center text-center">
                            <span className="text-[8px] font-black text-white uppercase tracking-wider leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                                Bubble<br />Map
                            </span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

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
                            className="w-full max-w-[1200px] h-[85vh] bg-[#0a0b0d] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col"
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
                                    <BubbleMap data={data} width={1150} height={700} />
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
