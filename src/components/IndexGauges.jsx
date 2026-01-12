import React from 'react';
import { motion } from 'framer-motion';

const IndexGauges = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fear & Greed Index */}
            <div className="p-5 rounded-xl transition-all duration-300 shadow-xl relative overflow-hidden group" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-sm">😨</span>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fear & Greed Index</h3>
                </div>

                <div className="flex flex-col items-center justify-center py-4">
                    <div className="relative w-32 h-32">
                        {/* Circular Progress (Dotted or thin line as per image) */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                style={{ color: 'var(--border-primary)' }}
                            />
                            <motion.circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={364}
                                initial={{ strokeDashoffset: 364 }}
                                animate={{ strokeDashoffset: 364 - (364 * 29) / 100 }}
                                className="text-orange-500"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl">😨</span>
                            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>29</span>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <h4 className="text-lg font-bold text-orange-400">Fear</h4>
                        <p className="text-[8px] text-gray-600 mt-1 uppercase tracking-tighter">Updated: 11/01/2026, 07:00:00</p>
                    </div>

                    {/* Scale bar */}
                    <div className="w-full mt-6">
                        <div className="flex justify-between text-[8px] text-gray-500 mb-1 uppercase px-1">
                            <span>Extreme Fear</span>
                            <span>Neutral</span>
                            <span>Extreme Greed</span>
                        </div>
                        <div className="relative h-1.5 w-full rounded-full overflow-hidden flex transition-all duration-300" style={{ background: 'var(--bg-tertiary)' }}>
                            <div className="h-full w-1/4 bg-red-500"></div>
                            <div className="h-full w-1/4 bg-orange-500"></div>
                            <div className="h-full w-1/4 bg-yellow-500"></div>
                            <div className="h-full w-1/4 bg-green-500"></div>
                            {/* Marker */}
                            <motion.div
                                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                                initial={{ left: 0 }}
                                animate={{ left: '29%' }}
                                transition={{ duration: 1, type: 'spring' }}
                            />
                        </div>
                        <div className="flex justify-between text-[8px] text-gray-600 mt-1">
                            <span>0</span>
                            <span>25</span>
                            <span>50</span>
                            <span>75</span>
                            <span>100</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Season Index */}
            <div className="p-5 rounded-xl transition-all duration-300 shadow-xl relative overflow-hidden flex flex-col justify-between" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-blue-400">🌊</span>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Season Index</h3>
                    </div>

                    <div className="text-center py-2">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-orange-500 text-lg">₿</span>
                            <h4 className="text-lg font-bold text-orange-400">Bitcoin Season</h4>
                        </div>
                        <p className="text-[8px] text-gray-500 uppercase">BTC Dominance: 56.86%</p>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex justify-between text-[8px] text-gray-500 mb-1 uppercase px-1">
                        <span>Alt Season</span>
                        <span>Neutral</span>
                        <span>BTC Season</span>
                    </div>
                    <div className="relative h-1.5 w-full rounded-full overflow-hidden flex transition-all duration-300" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="h-full w-[45%] bg-green-500"></div>
                        <div className="h-full w-[10%] bg-blue-500/50"></div>
                        <div className="h-full w-[45%] bg-orange-500"></div>
                        {/* Marker */}
                        <motion.div
                            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                            initial={{ left: '50%' }}
                            animate={{ left: '85%' }}
                            transition={{ duration: 1, type: 'spring' }}
                        />
                    </div>
                    <div className="flex justify-between text-[8px] text-gray-600 mt-1">
                        <span>0%</span>
                        <span>45%</span>
                        <span>55%</span>
                        <span>100%</span>
                    </div>
                </div>

                <div className="mt-6 p-3 rounded-lg transition-all duration-300" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                        <span className="text-blue-400 font-bold">Analysis:</span><br />
                        Bitcoin dominance increasing. Focus on BTC accumulation and reduced alt exposure.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IndexGauges;
