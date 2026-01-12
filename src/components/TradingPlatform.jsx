import React from "react";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { containerVariants, fadeInUpVariants } from "../utils/animationVariants";

export default function TradingPlatform() {
  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* IFRAME CONTAINER */}
      <motion.div
        className="rounded-lg overflow-hidden transition-all duration-300"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)'
        }}
        variants={fadeInUpVariants}
      >
        <iframe
          src="https://trade.dedoo.xyz/"
          className="w-full"
          style={{ height: "80vh", minHeight: "600px" }}
          title="Trading Platform"
          loading="lazy"
        />
      </motion.div>

      {/* OPEN IN NEW TAB BUTTON */}
      <motion.div className="flex justify-center" variants={fadeInUpVariants}>
        <a
          href="https://trade.dedoo.xyz/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transition"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-secondary)'
          }}
        >
          <ExternalLink size={14} />
          <span>Open in New Tab</span>
        </a>
      </motion.div>
    </motion.div>
  );
}
