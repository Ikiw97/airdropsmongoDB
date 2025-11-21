import React, { useEffect, useRef } from "react";
import { Send, ExternalLink, RefreshCw } from "lucide-react";

function InfoAirdrops() {
  const telegramWidgetRef = useRef(null);

  useEffect(() => {
    // Load Telegram Widget script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-post", "airdropfind/1");
    script.setAttribute("data-width", "100%");
    script.async = true;

    if (telegramWidgetRef.current) {
      telegramWidgetRef.current.innerHTML = "";
      telegramWidgetRef.current.appendChild(script);
    }

    return () => {
      if (telegramWidgetRef.current) {
        telegramWidgetRef.current.innerHTML = "";
      }
    };
  }, []);

  const openInTelegram = () => {
    window.open("https://t.me/airdropfind", "_blank", "noopener,noreferrer");
  };

  const refreshChannel = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: "#e0e5ec",
          boxShadow:
            "10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)",
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 mb-2">
              📢 Info Airdrops Channel
            </h2>
            <p className="text-gray-600 text-sm">
              Update terbaru tentang airdrop dari channel Telegram @airdropfind
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={refreshChannel}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all"
              style={{
                boxShadow:
                  "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
              }}
              data-testid="refresh-channel-btn"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            
            <button
              onClick={openInTelegram}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                background: "linear-gradient(145deg, #0088cc, #0099dd)",
                boxShadow:
                  "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
              }}
              data-testid="open-telegram-btn"
            >
              <Send size={16} />
              Buka di Telegram
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-xl text-center"
          style={{
            background: "linear-gradient(145deg, #d1d6dd, #ecf0f3)",
            boxShadow:
              "8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)",
          }}
        >
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="font-bold text-gray-800 mb-1">Airdrop Terbaru</h3>
          <p className="text-sm text-gray-600">Update setiap hari</p>
        </div>

        <div
          className="p-4 rounded-xl text-center"
          style={{
            background: "linear-gradient(145deg, #d1d6dd, #ecf0f3)",
            boxShadow:
              "8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)",
          }}
        >
          <div className="text-3xl mb-2">💎</div>
          <h3 className="font-bold text-gray-800 mb-1">Verified Projects</h3>
          <p className="text-sm text-gray-600">Project terverifikasi</p>
        </div>

        <div
          className="p-4 rounded-xl text-center"
          style={{
            background: "linear-gradient(145deg, #d1d6dd, #ecf0f3)",
            boxShadow:
              "8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)",
          }}
        >
          <div className="text-3xl mb-2">⚡</div>
          <h3 className="font-bold text-gray-800 mb-1">Fast Updates</h3>
          <p className="text-sm text-gray-600">Notifikasi real-time</p>
        </div>
      </div>

      {/* Telegram Channel Embed */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: "#e0e5ec",
          boxShadow:
            "10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-3 rounded-xl"
            style={{
              background: "linear-gradient(145deg, #0088cc, #0099dd)",
              boxShadow:
                "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
            }}
          >
            <Send size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              Channel @airdropfind
            </h3>
            <p className="text-sm text-gray-600">
              Ikuti untuk mendapatkan update terbaru
            </p>
          </div>
        </div>

        {/* Telegram Widget Container */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "#ffffff",
            boxShadow:
              "inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5)",
            minHeight: "500px",
          }}
        >
          <iframe
            src="https://t.me/s/airdropfind?embed=1"
            width="100%"
            height="600"
            frameBorder="0"
            scrolling="auto"
            style={{
              border: "none",
              overflow: "hidden",
              borderRadius: "12px",
            }}
            data-testid="telegram-iframe"
          ></iframe>
        </div>

        {/* Alternative Widget Reference (backup) */}
        <div ref={telegramWidgetRef} className="hidden"></div>

        {/* Footer Info */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50">
          <p className="text-sm text-gray-700 text-center">
            💡 <strong>Tips:</strong> Untuk pengalaman terbaik, buka channel
            langsung di aplikasi Telegram dengan klik tombol "Buka di Telegram"
            di atas
          </p>
        </div>
      </div>

      {/* Additional Features */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: "#e0e5ec",
          boxShadow:
            "10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)",
        }}
      >
        <h3 className="font-bold text-gray-800 text-lg mb-4">
          🎁 Keuntungan Join Channel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{
                background: "linear-gradient(145deg, #d1d6dd, #ecf0f3)",
                boxShadow: "4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)",
              }}
            >
              ⏰
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Early Access</h4>
              <p className="text-sm text-gray-600">
                Dapatkan info airdrop lebih cepat dari yang lain
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{
                background: "linear-gradient(145deg, #d1d6dd, #ecf0f3)",
                boxShadow: "4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)",
              }}
            >
              ✅
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Verified Info</h4>
              <p className="text-sm text-gray-600">
                Semua airdrop sudah diverifikasi dan aman
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{
                background: "linear-gradient(145deg, #d1d6dd, #ecf0f3)",
                boxShadow: "4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)",
              }}
            >
              📊
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Complete Guide</h4>
              <p className="text-sm text-gray-600">
                Tutorial lengkap cara join setiap airdrop
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{
                background: "linear-gradient(145deg, #d1d6dd, #ecf0f3)",
                boxShadow: "4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)",
              }}
            >
              💰
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">High Potential</h4>
              <p className="text-sm text-gray-600">
                Focus pada airdrop dengan reward tinggi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div
        className="p-8 rounded-2xl text-center"
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
          onClick={openInTelegram}
          className="px-8 py-3 rounded-xl font-bold text-purple-700 transition-all inline-flex items-center gap-2"
          style={{
            background: "#ffffff",
            boxShadow:
              "6px 6px 12px rgba(0,0,0,0.2), -6px -6px 12px rgba(255,255,255,0.3)",
          }}
          data-testid="cta-telegram-btn"
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
