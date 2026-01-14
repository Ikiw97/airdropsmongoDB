import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, ZoomIn, ZoomOut, TrendingUp, TrendingDown } from 'lucide-react';
import BubbleMap from './BubbleMap';
import apiService from '../../api/apiService';

const BubbleMapFeature = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [timeframe, setTimeframe] = useState('24h');
    const [zoom, setZoom] = useState(1);
    const [selectedCoin, setSelectedCoin] = useState(null);

    const constraintsRef = useRef(null);
    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 2;

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
        let interval;
        if (isOpen) {
            interval = setInterval(fetchData, 60000);
        }
        return () => clearInterval(interval);
    }, [isOpen]);

    const handleZoom = (delta) => {
        setZoom(prev => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)));
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        handleZoom(delta);
    };

    const handleBubbleClick = (coin) => {
        setSelectedCoin(coin);
    };

    const formatPrice = (price) => {
        if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return `$${price.toPrecision(4)}`;
    };

    const formatMarketCap = (cap) => {
        if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
        if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
        if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
        return `$${cap.toLocaleString()}`;
    };

    return (
        <>
            {/* Draggable Floating Button */}
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
                    <div className="absolute top-2 left-2 w-8 h-8 bg-gradient-to-br from-white/40 via-white/10 to-transparent rounded-full blur-[2px]" />
                    <div className="absolute top-3 left-3 w-4 h-4 bg-white/30 rounded-full blur-[1px]" />
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
                            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between bg-[#0f1114]">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        Crypto Bubble Map
                                    </h2>
                                    <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">
                                        TOP 100
                                    </span>
                                </div>

                                {/* Timeframe Toggle */}
                                <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1">
                                    {['1h', '24h', '7d'].map((tf) => (
                                        <button
                                            key={tf}
                                            onClick={() => setTimeframe(tf)}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeframe === tf
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                                }`}
                                        >
                                            {tf}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Zoom Controls */}
                                    <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1">
                                        <button
                                            onClick={() => handleZoom(-0.2)}
                                            className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                                            title="Zoom Out"
                                        >
                                            <ZoomOut size={16} />
                                        </button>
                                        <span className="text-xs text-gray-400 w-12 text-center">
                                            {Math.round(zoom * 100)}%
                                        </span>
                                        <button
                                            onClick={() => handleZoom(0.2)}
                                            className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                                            title="Zoom In"
                                        >
                                            <ZoomIn size={16} />
                                        </button>
                                    </div>

                                    {lastUpdated && (
                                        <span className="text-xs text-gray-400">
                                            {lastUpdated.toLocaleTimeString()}
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
                            <div
                                className="flex-1 relative overflow-hidden bg-black/50"
                                onWheel={handleWheel}
                            >
                                {loading && data.length === 0 ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <BubbleMap
                                        data={data}
                                        width={1100}
                                        height={700}
                                        timeframe={timeframe}
                                        zoom={zoom}
                                        onBubbleClick={handleBubbleClick}
                                    />
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
                                    <span className="text-gray-600">|</span>
                                    <span>Scroll to zoom • Click bubble for details</span>
                                </div>
                                <div>
                                    Data: CoinGecko
                                </div>
                            </div>
                        </motion.div>

                        {/* Coin Detail Modal */}
                        <AnimatePresence>
                            {selectedCoin && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center z-[10001]"
                                    onClick={() => setSelectedCoin(null)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        className="bg-[#0f1114] border border-gray-700 rounded-xl p-5 min-w-[320px] shadow-2xl"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={selectedCoin.image}
                                                    alt={selectedCoin.name}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                                <div>
                                                    <h3 className="text-white font-bold text-lg">{selectedCoin.name}</h3>
                                                    <span className="text-gray-400 text-sm uppercase">{selectedCoin.symbol}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedCoin(null)}
                                                className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-4">
                                            <div className="text-2xl font-bold text-white">
                                                {formatPrice(selectedCoin.current_price)}
                                            </div>
                                            <div className={`flex items-center gap-1 text-sm ${selectedCoin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                                                }`}>
                                                {selectedCoin.price_change_percentage_24h >= 0 ? (
                                                    <TrendingUp size={14} />
                                                ) : (
                                                    <TrendingDown size={14} />
                                                )}
                                                {selectedCoin.price_change_percentage_24h >= 0 ? '+' : ''}
                                                {selectedCoin.price_change_percentage_24h?.toFixed(2)}% (24h)
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="bg-gray-900 rounded-lg p-3">
                                                <div className="text-gray-400 text-xs mb-1">Market Cap</div>
                                                <div className="text-white font-medium">{formatMarketCap(selectedCoin.market_cap)}</div>
                                            </div>
                                            <div className="bg-gray-900 rounded-lg p-3">
                                                <div className="text-gray-400 text-xs mb-1">Rank</div>
                                                <div className="text-white font-medium">#{selectedCoin.market_cap_rank}</div>
                                            </div>
                                            <div className="bg-gray-900 rounded-lg p-3">
                                                <div className="text-gray-400 text-xs mb-1">24h High</div>
                                                <div className="text-green-400 font-medium">{formatPrice(selectedCoin.high_24h || 0)}</div>
                                            </div>
                                            <div className="bg-gray-900 rounded-lg p-3">
                                                <div className="text-gray-400 text-xs mb-1">24h Low</div>
                                                <div className="text-red-400 font-medium">{formatPrice(selectedCoin.low_24h || 0)}</div>
                                            </div>
                                            <div className="bg-gray-900 rounded-lg p-3 col-span-2">
                                                <div className="text-gray-400 text-xs mb-1">24h Volume</div>
                                                <div className="text-white font-medium">{formatMarketCap(selectedCoin.total_volume || 0)}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default BubbleMapFeature;
