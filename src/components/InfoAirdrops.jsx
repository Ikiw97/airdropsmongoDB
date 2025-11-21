import React, { useState, useRef, useEffect } from "react";
import { Send, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

const channels = [
  { name: "@airdropfind", url: "https://t.me/airdropfind", description: "Update terbaru airdrop harian", img: "/images/airdropfind.png" },
  { name: "@tomketairdrop", url: "https://t.me/tomketairdrop", description: "Tips dan info airdrop terpercaya", img: "/images/tomketairdrop.png" },
  { name: "@bangpateng_airdrop", url: "https://t.me/bangpateng_airdrop", description: "Airdrop Indonesia & global", img: "/images/bangpateng_airdrop.png" },
  { name: "@AirdropRangerPink", url: "https://t.me/AirdropRangerPink", description: "Info airdrop dan crypto updates", img: "/images/airdroprangerpink.png" },
  { name: "@valuble", url: "https://t.me/valuble", description: "Airdrop eksklusif & crypto updates", img: "/images/valuble.png" },
  { name: "@AirdropFamilyIDN", url: "https://t.me/AirdropFamilyIDN", description: "Kumpulan airdrop terpercaya Indonesia", img: "/images/airdropfamilyidn.png" },
  { name: "@PegazusEcosystem", url: "https://t.me/PegazusEcosystem", description: "Airdrop & project crypto baru", img: "/images/pegazusecosystem.png" },
  { name: "@BeritaCryptoo", url: "https://t.me/BeritaCryptoo", description: "Berita crypto + airdrop", img: "/images/beritacryptoo.png" },
  { name: "@airdropdaydua", url: "https://t.me/airdropdaydua", description: "Update harian airdrop & tips crypto", img: "/images/airdropdaydua.png" },
  { name: "@GoedangDuitReborn", url: "https://t.me/GoedangDuitReborn", description: "Info airdrop & giveaway terpercaya", img: "/images/goedangduitreborn.png" },
];

function InfoAirdrops() {
  const [expanded, setExpanded] = useState({});
  const iframeRefs = useRef({});

  const toggleExpand = (name) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const openInTelegram = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 mb-6">
        📦 10 Channel Airdrop Rekomendasi
      </h2>

      {/* Channel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((ch) => (
          <div
            key={ch.name}
            className="p-4 rounded-2xl flex flex-col justify-between"
            style={{
              background: "#e0e5ec",
              boxShadow: "8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)",
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

            {/* Expand/Collapse Button */}
            <button
              onClick={() => toggleExpand(ch.name)}
              className="mb-2 px-4 py-2 rounded-xl font-semibold text-gray-700 flex items-center justify-center gap-2 transition-all"
              style={{
                background: "linear-gradient(145deg, #d1d6dd, #ecf0f3)",
                boxShadow: "4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)",
              }}
            >
              {expanded[ch.name] ? "Sembunyikan Preview" : "Tampilkan Preview"}
              {expanded[ch.name] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Animated Iframe Container */}
            <div
              ref={(el) => (iframeRefs.current[ch.name] = el)}
              className="overflow-hidden transition-all duration-500"
              style={{
                maxHeight: expanded[ch.name] ? "350px" : "0px",
                background: "#ffffff",
                borderRadius: "12px",
                boxShadow: "inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5)",
              }}
            >
              <iframe
                src={`https://t.me/s/${ch.name.replace("@", "")}?embed=1`}
                width="100%"
                height="350"
                frameBorder="0"
                scrolling="auto"
                style={{ border: "none", borderRadius: "12px", overflow: "hidden" }}
                title={ch.name}
              ></iframe>
            </div>

            {/* Tombol Buka Telegram */}
            <button
              onClick={() => openInTelegram(ch.url)}
              className="mt-auto px-4 py-2 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: "linear-gradient(145deg, #0088cc, #0099dd)",
                boxShadow: "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
              }}
            >
              <Send size={16} />
              Buka di Telegram
              <ExternalLink size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div
        className="p-8 rounded-2xl text-center mt-8"
        style={{
          background: "linear-gradient(145deg, #667eea, #764ba2)",
          boxShadow: "10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)",
        }}
      >
        <h3 className="text-2xl font-bold text-white mb-3">
          🚀 Jangan Lewatkan Airdrop Terbaru!
        </h3>
        <p className="text-white/90 mb-6">
          Join channel sekarang dan dapatkan update airdrop setiap hari
        </p>
        <button
          onClick={() => openInTelegram("https://t.me/airdropfind")}
          className="px-8 py-3 rounded-xl font-bold text-purple-700 transition-all inline-flex items-center gap-2"
          style={{
            background: "#ffffff",
            boxShadow: "6px 6px 12px rgba(0,0,0,0.2), -6px -6px 12px rgba(255,255,255,0.3)",
          }}
        >
          <Send size={20} />
          Join Channel Telegram
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
}

export default InfoAirdrops;
