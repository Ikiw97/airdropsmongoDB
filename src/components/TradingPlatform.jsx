import React from "react";
import { Zap, Wallet, Activity, Globe, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { containerVariants, fadeInUpVariants, itemVariants, buttonHoverVariants, scaleInVariants } from "../utils/animationVariants";

export default function TradingPlatform() {
  const features = [
    {
      icon: <Zap className="text-green-600" size={20} />,
      title: "Lightning Fast",
      desc: "Execute trades instantly with our optimized engine",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: <Wallet className="text-blue-600" size={20} />,
      title: "Low Fees",
      desc: "Trade with minimal fees and maximize your profits",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: <Activity className="text-purple-600" size={20} />,
      title: "Real-time Data",
      desc: "Get live market data and advanced trading charts",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-8 px-4 md:px-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* HEADER */}
      <motion.div
        className="text-center py-6 md:py-8 rounded-2xl shadow-neu-pressed dark:shadow-neu-pressed-dark bg-main-light dark:bg-main-dark"
        variants={fadeInUpVariants}
      >
        <motion.div
          className="flex items-center justify-center gap-2 md:gap-3 mb-1"
          variants={itemVariants}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="text-green-600" size={26} />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600">
            DeDoo Trading Platform
          </h2>
        </motion.div>
        <motion.p
          className="text-gray-600 dark:text-gray-400 text-sm md:text-base"
          variants={fadeInUpVariants}
        >
          Trade crypto with lightning speed & zero fees
        </motion.p>
      </motion.div>

      {/* FEATURE CARDS */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
        variants={containerVariants}
      >
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="p-5 md:p-6 rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark"
            variants={itemVariants}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex justify-center items-center mx-auto mb-3 w-12 h-12 rounded-xl shadow-neu-pressed dark:shadow-neu-pressed-dark"
              style={{ background: 'transparent' }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              {f.icon}
            </motion.div>
            <motion.h3
              className={`font-semibold text-base md:text-lg bg-gradient-to-r ${f.color} text-transparent bg-clip-text mb-1`}
              variants={itemVariants}
            >
              {f.title}
            </motion.h3>
            <motion.p
              className="text-gray-700 dark:text-gray-300 text-sm leading-snug max-w-xs mx-auto"
              variants={itemVariants}
            >
              {f.desc}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>

      {/* IFRAME CONTAINER */}
      <motion.div
        className="rounded-2xl overflow-hidden bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark"
        variants={fadeInUpVariants}
      >
        <iframe
          src="https://trade.dedoo.xyz/"
          className="w-full"
          style={{ height: "75vh", minHeight: "480px" }}
          title="DeDoo Trading Platform"
          loading="lazy"
        />
      </motion.div>

      {/* OPEN IN NEW TAB BUTTON */}
      <motion.div
        className="flex justify-center"
        variants={itemVariants}
      >
        <motion.a
          href="https://trade.dedoo.xyz/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white text-sm md:text-base transition-transform hover:scale-105 shadow-neu-flat dark:shadow-neu-flat-dark"
          style={{
            background: "linear-gradient(145deg, #3b82f6, #8b5cf6)",
          }}
          variants={buttonHoverVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Globe size={18} />
          <span>Open in New Tab</span>
          <ExternalLink size={16} />
        </motion.a>
      </motion.div>
    </motion.div>
  );
}
