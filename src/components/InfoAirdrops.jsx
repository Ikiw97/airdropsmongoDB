import React from "react";
import { Send, ExternalLink } from "lucide-react";

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
  const openInTelegram = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 mb-6">
        📦 Recommended 10 Airdrop Channels
      </h2>

      {/* Channel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((ch, index) => {
          // Jika card terakhir, letakkan di tengah di grid desktop
          const isLast = index === channels.length - 1;
          return (
            <div
              key={ch.name}
              className={`p-4 rounded-2xl flex flex-col justify-between ${isLast ? "mx-auto" : ""}`}
              style={{
                background: "#e0e5ec",
                boxShadow: "8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)",
                width: isLast ? "100%" : "auto",
                maxWidth: isLast ? "320px" : "auto",
              }}
            >
              {/* Icon & Info */}
              <div className="mb-3 text-center">
                <img
                  src={ch.img}
                  alt={ch.name}
                  className="mx-auto mb-2"
                  style={{ width: "50px", height: "50px", objectFit: "contain" }}
                />
                <h3 className="font-bold text-gray-800 text-lg mb-1">{ch.name}</h3>
                <p className="text-gray-600 text-sm">{ch.description}</p>
              </div>

              {/* Telegram Button */}
              <button
                onClick={() => openInTelegram(ch.url)}
                className="mt-auto px-4 py-2 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "linear-gradient(145deg, #0088cc, #0099dd)",
                  boxShadow: "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
                }}
              >
                <Send size={16} />
                Open in Telegram
                <ExternalLink size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Text */}
      <div
        className="p-8 rounded-2xl text-center mt-8"
        style={{
          background: "linear-gradient(145deg, #667eea, #764ba2)",
          boxShadow: "10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)",
        }}
      >
        <h3 className="text-2xl font-bold text-white mb-3">
          🚀 Don't Miss the Latest Airdrops!
        </h3>
        <p className="text-white/90">
          Stay updated with the latest airdrops from trusted channels.
        </p>
      </div>
    </div>
  );
}

export default InfoAirdrops;
