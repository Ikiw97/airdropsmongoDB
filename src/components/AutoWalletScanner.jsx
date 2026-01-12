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

  // 🎨 NEUMORPHIC THEME (sama persis GasTracker)
  const baseBg = "bg-[#e0e5ec]";
  const neuCard =
    "rounded-3xl p-6 shadow-[9px_9px_16px_#b8b9be,-9px_-9px_16px_#ffffff]";
  const neuInset =
    "shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]";
  const neuButton =
    "rounded-xl shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] transition text-gray-700 font-semibold";

  return (
    <motion.div
      className={`max-w-2xl mx-auto mt-10 space-y-6 ${baseBg}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        className={`${neuCard} ${baseBg} flex items-center justify-center gap-3`}
        variants={fadeInUpVariants}
      >
        <Wallet className="text-blue-500" size={26} />
        <h2 className="text-2xl font-bold text-gray-700">🪙 Auto Wallet Scanner</h2>
      </motion.div>

      {/* Chain Selector */}
      <motion.div
        className={`${neuCard} ${baseBg} flex flex-wrap justify-center gap-3 p-4`}
        variants={fadeInUpVariants}
      >
        {["eth-mainnet", "arbitrum", "polygon", "base"].map((c, i) => (
          <motion.button
            key={c}
            onClick={() => setChain(c)}
            className={`${neuButton} ${baseBg} px-6 py-2 ${
              chain === c
                ? "text-white bg-gradient-to-r from-orange-400 to-pink-400"
                : ""
            }`}
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
        className={`${neuCard} ${baseBg} space-y-4`}
        variants={fadeInUpVariants}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.input
            type="text"
            placeholder="Masukkan wallet address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={`flex-1 ${baseBg} text-gray-700 rounded-xl px-4 py-2 ${neuInset} focus:outline-none text-sm`}
            whileFocus={{ boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)" }}
          />
          <motion.button
            onClick={fetchTokens}
            disabled={loading}
            className={`${neuButton} px-5 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white active:from-blue-600 active:to-blue-700`}
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
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
          className={`${neuCard} ${baseBg} space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300`}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {tokens.map((t, i) => (
            <motion.div
              key={i}
              className={`${baseBg} flex items-center justify-between px-4 py-3 rounded-2xl ${neuInset}`}
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
                <span className="text-gray-700 font-medium text-sm">
                  {t.name} ({t.symbol})
                </span>
              </div>
              <span className="text-gray-600 text-sm font-semibold">
                {t.balance}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && tokens.length === 0 && !error && (
        <motion.div
          className={`${neuCard} ${baseBg} text-center text-gray-500 text-sm`}
          variants={fadeInUpVariants}
        >
          Masukkan wallet dan klik <b>Scan</b> untuk melihat token yang dimiliki.
        </motion.div>
      )}
    </motion.div>
  );
};

export default AutoWalletScanner;
