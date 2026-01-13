import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Copy, ExternalLink, CheckCircle, Wallet } from 'lucide-react';
import { ethers } from 'ethers';

const DONATION_WALLET = "0x2e704AE7902eE51593b9BcEE2e7Ac1F015bf4107";
const BSC_RPC = "https://bsc-dataseed.binance.org";
const BSCSCAN_URL = `https://bscscan.com/address/${DONATION_WALLET}`;

const DonationModal = ({ isOpen, onClose }) => {
  const [balance, setBalance] = useState("0");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchBalance();
    }
  }, [isOpen]);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(BSC_RPC);
      const bal = await provider.getBalance(DONATION_WALLET);
      setBalance(ethers.formatEther(bal));
    } catch (err) {
      console.error("Error fetching balance:", err);
      setBalance("Error");
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(DONATION_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allocationData = [
    { label: "Project & Server", percentage: 40 },
    { label: "Social Donation", percentage: 30 },
    { label: "Developer Support", percentage: 30 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border shadow-2xl"
            style={{ background: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b" style={{ background: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
              <h2 className="text-2xl font-bold italic" style={{ color: "var(--text-primary)" }}>Donasi</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-500/20 transition">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Donasi diterima di BNB Smart Chain (BSC) melalui satu wallet publik.
              </p>

              {/* Main Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* QR Code Section */}
                <div className="p-4 rounded-lg border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>QR Donasi</h3>
                  <div className="bg-[#0c0c14] p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <img src="https://cryptologos.cc/logos/bnb-bnb-logo.png" alt="BNB" className="w-8 h-8" />
                      <div>
                        <p className="font-bold text-white text-sm">BNB <span className="text-gray-400 font-normal">BNB Smart Chain</span></p>
                        <p className="text-[10px] text-gray-500 font-mono break-all">{DONATION_WALLET}</p>
                      </div>
                    </div>
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <img src="/qr.png" alt="QR Donation" className="w-40 h-40 object-contain" />
                    </div>
                    <p className="text-xs text-center mt-4 text-gray-400">
                      Only send <span className="font-bold text-yellow-400">BNB Smart Chain</span> network assets to this address. Other assets will be lost forever.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <img src="https://cryptologos.cc/logos/binance-usd-busd-logo.png" alt="Binance" className="w-5 h-5" />
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Binance Wallet</span>
                  </div>
                </div>

                {/* Wallet Info Section */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                    <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Alamat Wallet (BSC)</h3>
                    <div
                      className="p-3 rounded-lg cursor-pointer hover:opacity-80 transition flex items-center justify-between"
                      style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)" }}
                      onClick={copyAddress}
                    >
                      <span className="font-mono text-xs break-all" style={{ color: "var(--text-primary)" }}>{DONATION_WALLET}</span>
                      {copied ? <CheckCircle size={16} className="text-green-500 shrink-0 ml-2" /> : <Copy size={16} className="text-gray-400 shrink-0 ml-2" />}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                    <span className="text-xs text-gray-500">Saldo saat ini (BNB)</span>
                    <p className="text-xl font-bold font-mono mt-1" style={{ color: "var(--text-primary)" }}>
                      {loading ? "Loading..." : `${parseFloat(balance).toFixed(16)} BNB`}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={BSCSCAN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded text-sm text-center transition flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={14} /> Buka di BscScan
                    </a>
                    <button
                      onClick={onClose}
                      className="py-2 px-4 rounded text-sm font-semibold border transition"
                      style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      Kembali
                    </button>
                  </div>

                  <p className="text-xs italic" style={{ color: "var(--text-secondary)" }}>
                    Catatan: demi keamanan dan privasi, transparansi dilakukan lewat tx hash + log kategori (bukan membuka detail finansial pribadi).
                  </p>
                </div>
              </div>

              {/* Allocation Section */}
              <div className="p-4 rounded-lg border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Alokasi Donasi</h3>
                <div className="grid grid-cols-3 gap-4">
                  {allocationData.map((item, i) => (
                    <div key={i} className="p-3 rounded-lg border" style={{ background: "var(--bg-tertiary)", borderColor: "var(--border-primary)" }}>
                      <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{item.percentage}%</p>
                      <p className="text-xs text-gray-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Log Section */}
              <div className="p-4 rounded-lg border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Donation & Spending Log</h3>
                    <p className="text-xs text-gray-500">Log disimpan di MongoDB dan dipublikasikan per periode.</p>
                  </div>
                  <button className="py-1.5 px-3 rounded text-xs font-semibold border transition" style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
                    Lihat log terbaru (JSON)
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DonationModal;
