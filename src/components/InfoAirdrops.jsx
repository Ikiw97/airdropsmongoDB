import React from "react";
import { Send, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const channels = [
  { name: "@airdropfind", url: "https://t.me/airdropfind", description: "Daily latest airdrop updates", img: "/images/airdropfind.png" },
  { name: "@tomketairdrop", url: "https://t.me/tomketairdrop", description: "Trusted airdrop tips and info", img: "/images/tomketairdrop.png" },
  { name: "@bangpateng_airdrop", url: "https://t.me/bangpateng_airdrop", description: "Indonesia & global airdrops", img: "/images/bangpateng_airdrop.png" },
  { name: "@AirdropRangerPink", url: "https://t.me/AirdropRangerPink", description: "Airdrop & crypto updates", img: "/images/airdroprangerpink.png" },
  { name: "@valuble", url: "https://t.me/valuble", description: "Exclusive airdrops & crypto updates", img: "/images/valuble.png" },
  { name: "@AirdropFamilyIDN", url: "https://t.me/AirdropFamilyIDN", description: "Trusted airdrops from Indonesia", img: "/images/airdropfamilyidn.png" },
  { name: "@PegazusEcosystem", url: "https://t.me/PegazusEcosystem", description: "Airdrops & new crypto projects", img: "/images/pegazusecosystem.png" },
  { name: "@BeritaCryptoo", url: "https://t.me/BeritaCryptoo", description: "Crypto news + airdrops", img: "/images/beritacryptoo.png" },
  { name: "@airdropdaydua", url: "https://t.me/airdropdaydua", description: "Daily airdrop updates & tips", img: "/images/airdropdaydua.png" },
  { name: "@GoedangDuitReborn", url: "https://t.me/GoedangDuitReborn", description: "Reliable airdrops & giveaways", img: "/images/goedangduitreborn.png" },
];

function InfoAirdrops() {
  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 rounded-lg transition-all duration-300"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
      >
        <Send size={20} className="text-neon-cyan" />
        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Airdrop Channels</h2>
        <span className="text-xs text-gray-500">({channels.length} channels)</span>
      </div>

      {/* List with Logos */}
      <div
        className="rounded-lg overflow-hidden transition-all duration-300"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
      >
        {channels.map((ch, i) => (
          <motion.a
            key={ch.name}
            href={ch.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 border-b last:border-b-0"
            style={{ borderBottomColor: "var(--border-primary)" }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm w-6 font-mono">#{i + 1}</span>

              {/* Channel Logo */}
              <div className="relative w-10 h-10 rounded-full overflow-hidden border transition-all duration-300" style={{ background: "var(--bg-tertiary)", borderColor: "var(--border-primary)" }}>
                <img
                  src={ch.img}
                  alt={ch.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback Initial if image fails */}
                <div
                  className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-cyan-500 to-teal-600 text-white font-bold text-sm"
                  style={{ display: 'none' }}
                >
                  {ch.name.charAt(1).toUpperCase()}
                </div>
              </div>

              <div>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{ch.name}</p>
                <p className="text-gray-500 text-sm">{ch.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-neon-cyan opacity-80 group-hover:opacity-100">
              <span className="text-xs hidden sm:inline font-medium">Open</span>
              <ExternalLink size={14} />
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}

export default InfoAirdrops;
