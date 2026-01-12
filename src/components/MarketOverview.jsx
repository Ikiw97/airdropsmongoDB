import React from 'react';
import MarketStats from './MarketStats';
import IndexGauges from './IndexGauges';
import GainerLoserList from './GainerLoserList';
import { motion } from 'framer-motion';

const MarketOverview = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mb-8"
        >
            {/* Top Banner Stats */}
            <MarketStats />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2/3: Gainer/Loser */}
                <div className="lg:col-span-2 space-y-6">
                    <GainerLoserList />
                </div>

                {/* Right 1/3: Indices */}
                <div className="space-y-6">
                    <IndexGauges />
                </div>
            </div>
        </motion.div>
    );
};

export default MarketOverview;
