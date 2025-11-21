import React from "react";
import { Send, ExternalLink } from "lucide-react";

const channels = [
  {
    name: "@airdropfind",
    url: "https://t.me/airdropfind",
    description: "Update terbaru airdrop harian",
    emoji: "📢",
  },
  {
    name: "@tomketairdrop",
    url: "https://t.me/tomketairdrop",
    description: "Tips dan info airdrop terpercaya",
    emoji: "💎",
  },
  {
    name: "@bangpateng_airdrop",
    url: "https://t.me/bangpateng_airdrop",
    description: "Airdrop Indonesia & global",
    emoji: "🎯",
  },
  {
    name: "@AirdropRangerPink",
    url: "https://t.me/AirdropRangerPink",
    description: "Info airdrop dan crypto updates",
    emoji: "⚡",
  },
  {
    name: "@AirdropFamilyIDN",
    url: "https://t.me/AirdropFamilyIDN",
    description: "Kumpulan airdrop terpercaya Indonesia",
    emoji: "✅",
  },
  {
    name: "@PegazusEcosystem",
    url: "https://t.me/PegazusEcosystem",
    description: "Airdrop & project crypto baru",
    emoji: "🚀",
  },
  {
    name: "@BeritaCryptoo",
    url: "https://t.me/BeritaCryptoo",
    description: "Berita crypto + airdrop",
    emoji: "📊",
  },
];

function InfoAirdrops() {
  const openInTelegram = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 mb-6">
        📦 7 Channel Airdrop Rekomendasi
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((ch) => (
          <div
            key={ch.name}
            className="p-6 rounded-2xl flex flex-col justify-between"
            style={{
              background: "#e0e5ec",
              boxShadow:
                "8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)",
            }}
          >
            <div className="mb-4 text-center">
              <div className="text-4xl mb-2">{ch.emoji}</div>
              <h3 className="font-bold text-gray-800 text-xl mb-1">{ch.name}</h3>
              <p className="text-gray-600 text-sm">{ch.description}</p>
            </div>
            <button
              onClick={() => openInTelegram(ch.url)}
              className="mt-auto px-4 py-2 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: "linear-gradient(145deg, #0088cc, #0099dd)",
                boxShadow:
                  "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
              }}
            >
              <Send size={16} />
              Buka di Telegram
              <ExternalLink size={14} />
            </button>
          </div>
        ))}
      </div>

      <div
        className="p-8 rounded-2xl text-center mt-8"
        style={{
          background: "linear-gradient(145deg, #667eea, #764ba2)",
          boxShadow:
            "10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)",
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
            boxShadow:
              "6px 6px 12px rgba(0,0,0,0.2), -6px -6px 12px rgba(255,255,255,0.3)",
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
