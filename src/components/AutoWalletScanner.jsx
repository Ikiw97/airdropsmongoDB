import React, { useState } from "react";
import { Wallet } from "lucide-react";
import { motion } from "framer-motion";
import {
  fadeInUpVariants,
  containerVariants,
  listItemVariants,
  scaleInVariants,
  buttonHoverVariants,
} from "../utils/animationVariants";
import { alchemyProxyService } from "../utils/alchemyProxy";

const AutoWalletScanner = () => {
  const [address, setAddress] = useState("");
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chain, setChain] = useState("eth-mainnet");

  const fetchTokens = async () => {
    if (!address) {
      setError("Masukkan wallet address terlebih dahulu.");
      return;
    }
    setLoading(true);
    setError("");
    setTokens([]);

    try {
      const tokenBalances = await alchemyProxyService.getTokenBalances(address, chain);

      const nonZeroTokens = tokenBalances.filter(
        (t) => t.tokenBalance && t.tokenBalance !== "0"
      );

      if (nonZeroTokens.length === 0) {
        setTokens([]);
        setError("Tidak ada token ditemukan di address ini.");
        setLoading(false);
        return;
      }

      const metadataPromises = nonZeroTokens.map(async (token) => {
        try {
          const metadata = await alchemyProxyService.getTokenMetadata(token.contractAddress, chain);
          const decimals = parseInt(metadata.decimals || '18');
          const balance = Number(token.tokenBalance) / Math.pow(10, decimals);

          return {
            name: metadata.name || "Unknown",
            symbol: metadata.symbol || "???",
            logo: metadata.logo,
            balance: balance.toFixed(4),
          };
        } catch (err) {
          return {
            name: "Unknown",
            symbol: "???",
            logo: null,
            balance: "0.0000",
          };
        }
      });

      const results = await Promise.all(metadataPromises);
      setTokens(results);
    } catch (err) {
      setError(err.message || "Gagal memuat data token. Silahkan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // 🎨 THEME ADAPTATION
  const cardStyle = { background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" };
  const inputStyle = { background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" };
  const textPrimary = { color: "var(--text-primary)" };
  const textSecondary = { color: "var(--text-secondary)" };

  return (
    <motion.div
      className="max-w-2xl mx-auto mt-10 space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        className="p-6 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300"
        style={cardStyle}
        variants={fadeInUpVariants}
      >
        <Wallet className="text-blue-500" size={26} />
        <h2 className="text-2xl font-bold" style={textPrimary}>🪙 Auto Wallet Scanner</h2>
      </motion.div>

      {/* Chain Selector */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 p-4 rounded-2xl transition-all duration-300"
        style={cardStyle}
        variants={fadeInUpVariants}
      >
        {["eth-mainnet", "arbitrum", "polygon", "base"].map((c, i) => (
          <motion.button
            key={c}
            onClick={() => setChain(c)}
            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${chain === c
                ? "text-white bg-gradient-to-r from-orange-400 to-pink-400 shadow-lg"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 border"
              }`}
            style={{ borderColor: chain === c ? "transparent" : "var(--border-primary)" }}
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
            custom={i}
          >
            {c === "eth-mainnet"
              ? "Ethereum"
              : c.charAt(0).toUpperCase() + c.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      {/* Input Section */}
      <motion.div
        className="p-6 rounded-2xl space-y-4 transition-all duration-300"
        style={cardStyle}
        variants={fadeInUpVariants}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.input
            type="text"
            placeholder="Masukkan wallet address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 rounded-xl px-4 py-2 outline-none text-sm transition-all duration-300"
            style={inputStyle}
          />
          <motion.button
            onClick={fetchTokens}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
          >
            {loading ? "Scanning..." : "Scan"}
          </motion.button>
        </div>

        {error && (
          <motion.p
            className="text-red-500 text-sm text-center font-medium"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>

      {/* Token List */}
      {tokens.length > 0 && (
        <motion.div
          className="p-6 rounded-2xl space-y-3 max-h-96 overflow-y-auto custom-scrollbar transition-all duration-300 shadow-inner"
          style={cardStyle}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {tokens.map((t, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300"
              style={inputStyle}
              variants={listItemVariants}
              custom={i}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center gap-3">
                {t.logo ? (
                  <img
                    src={t.logo}
                    alt={t.symbol}
                    className="w-7 h-7 rounded-full shadow-md"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-300" />
                )}
                <span className="font-medium text-sm" style={textPrimary}>
                  {t.name} ({t.symbol})
                </span>
              </div>
              <span className="text-sm font-semibold" style={textSecondary}>
                {t.balance}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && tokens.length === 0 && !error && (
        <motion.div
          className="p-6 rounded-2xl text-center text-sm transition-all duration-300"
          style={{ ...cardStyle, color: "var(--text-secondary)" }}
          variants={fadeInUpVariants}
        >
          Masukkan wallet dan klik <b style={textPrimary}>Scan</b> untuk melihat token yang dimiliki.
        </motion.div>
      )}
    </motion.div>
  );
};

export default AutoWalletScanner;
