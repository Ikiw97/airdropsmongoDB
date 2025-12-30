import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  AlertTriangle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Lock,
  Shield,
  Clock,
  Activity,
} from "lucide-react";
import {
  encryptDisplay,
  decryptDisplay,
  downloadEncryptedFile,
  generateSecureFile,
  requestSecurityConfirmation,
  showSecurityWarning,
  preventScreenCapture,
  secureSensitiveFields,
} from "../utils/securityUtils";
import { useSecurityContext } from "../contexts/SecurityContext";
import {
  containerVariants,
  fadeInUpVariants,
  itemVariants,
  buttonHoverVariants
} from "../utils/animationVariants";
import { useTheme } from "../contexts/ThemeContext";

const PrivateKeyGeneratorSecure = () => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const [generatedKeys, setGeneratedKeys] = useState([]);
  const [hideKeys, setHideKeys] = useState(true);
  const [quantityToGenerate, setQuantityToGenerate] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [exportPassword, setExportPassword] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [showAuditLog, setShowAuditLog] = useState(false);

  const { logActivity, getSessionStatus, getAuditLogs } = useSecurityContext();
  const keyDisplayRef = useRef(null);

  // Initialize security features
  useEffect(() => {
    preventScreenCapture();
    secureSensitiveFields();

    return () => {
      // Cleanup
      setGeneratedKeys([]);
      setExportPassword("");
    };
  }, []);

  // Update session status
  useEffect(() => {
    const interval = setInterval(() => {
      const status = getSessionStatus();
      setSessionStatus(status);

      if (!status?.isValid) {
        setGeneratedKeys([]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [getSessionStatus]);

  // Prevent key access after session expires
  useEffect(() => {
    if (sessionStatus && !sessionStatus.isValid) {
      alert("⏱️ Session expired. Please refresh the page.");
      setGeneratedKeys([]);
    }
  }, [sessionStatus?.isValid]);

  const generatePrivateKey = () => {
    try {
      const wallet = ethers.Wallet.createRandom();
      return {
        privateKey: wallet.privateKey,
        address: wallet.address,
        mnemonic: wallet.mnemonic?.phrase || "N/A",
        id: Date.now() + Math.random(),
      };
    } catch (error) {
      console.error("Error generating private key:", error);
      logActivity("KEY_GENERATION_ERROR", { error: error.message }, "critical");
      return null;
    }
  };

  const handleGenerateKeys = async () => {
    const confirmed = await requestSecurityConfirmation(
      "Generate Private Keys",
      `You are about to generate ${quantityToGenerate} new private key(s). Store them safely!`
    );

    if (!confirmed) {
      logActivity("KEY_GENERATION_CANCELLED", {}, "info");
      return;
    }

    const qty = parseInt(quantityToGenerate) || 1;
    if (qty < 1) {
      alert("❌ Quantity must be at least 1");
      return;
    }
    if (qty > 100) {
      alert("❌ Maximum 100 keys at once");
      return;
    }

    setIsGenerating(true);
    logActivity("KEY_GENERATION_STARTED", { quantity: qty }, "info");

    try {
      const newKeys = [];
      for (let i = 0; i < qty; i++) {
        const key = generatePrivateKey();
        if (key) newKeys.push(key);
      }
      setGeneratedKeys(newKeys);
      logActivity("KEY_GENERATION_COMPLETED", { count: newKeys.length }, "info");
    } catch (error) {
      logActivity("KEY_GENERATION_FAILED", { error: error.message }, "critical");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text, index, type) => {
    const confirmed = await requestSecurityConfirmation(
      "Copy to Clipboard",
      `You are copying a ${type}. Ensure you are in a secure environment.`
    );

    if (!confirmed) return;

    try {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      logActivity("KEY_COPIED", { type, index }, "critical");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      alert("❌ Failed to copy to clipboard");
      logActivity("COPY_FAILED", { error: error.message }, "critical");
    }
  };

  const downloadEncryptedKeys = async () => {
    if (generatedKeys.length === 0) {
      alert("❌ No keys to download");
      return;
    }

    if (!exportPassword || exportPassword.length < 8) {
      alert("❌ Password must be at least 8 characters");
      return;
    }

    const confirmed = await requestSecurityConfirmation(
      "Download Encrypted File",
      "Your keys will be encrypted. Store the file and password securely!"
    );

    if (!confirmed) {
      logActivity("EXPORT_CANCELLED", {}, "info");
      return;
    }

    setIsExporting(true);
    try {
      await downloadEncryptedFile(
        generatedKeys.map((k) => ({
          privateKey: k.privateKey,
          address: k.address,
          mnemonic: k.mnemonic,
        })),
        `evm-keys-${Date.now()}`,
        exportPassword
      );
      logActivity("KEYS_EXPORTED_ENCRYPTED", { count: generatedKeys.length }, "critical");
      setExportPassword("");
      setShowExportPassword(false);
      alert("✅ Encrypted file downloaded successfully!");
    } catch (error) {
      alert("❌ Export failed: " + error.message);
      logActivity("EXPORT_FAILED", { error: error.message }, "critical");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPlainCSV = async () => {
    if (generatedKeys.length === 0) return alert("❌ No keys to download");

    const confirmed = await requestSecurityConfirmation(
      "Download Plain CSV",
      "⚠️ WARNING: Plain file is NOT encrypted. Store it VERY securely!"
    );

    if (!confirmed) {
      logActivity("PLAIN_EXPORT_CANCELLED", {}, "info");
      return;
    }

    try {
      generateSecureFile(
        generatedKeys,
        `evm-keys-${Date.now()}.csv`,
        "csv"
      );
      logActivity("KEYS_EXPORTED_PLAIN", { count: generatedKeys.length }, "critical");
    } catch (error) {
      alert("❌ Export failed: " + error.message);
      logActivity("EXPORT_FAILED", { error: error.message }, "critical");
    }
  };

  const clearAllKeys = async () => {
    if (generatedKeys.length === 0) return;

    const confirmed = await requestSecurityConfirmation(
      "Clear All Keys",
      "All generated keys will be permanently cleared from memory."
    );

    if (!confirmed) {
      logActivity("CLEAR_CANCELLED", {}, "info");
      return;
    }

    setGeneratedKeys([]);
    setExportPassword("");
    logActivity("KEYS_CLEARED", { count: 0 }, "info");
    alert("✅ All keys cleared from memory");
  };

  // Format time remaining
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      className="w-full mb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Session Status Bar */}
      <AnimatePresence>
        {sessionStatus && (
          <motion.div
            className={`p-3 rounded-lg mb-4 flex justify-between items-center text-sm font-semibold shadow-neu-pressed dark:shadow-neu-pressed-dark ${sessionStatus.isValid
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-2">
              <Clock size={16} />
              Session Time: {formatTime(sessionStatus.timeRemaining)}
            </div>
            {sessionStatus.warning && (
              <motion.span
                className="animate-pulse"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ⚠️ Session expiring soon
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        className="rounded-3xl p-6 flex justify-between items-center bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark cursor-pointer mb-4"
        onClick={() => setIsExpanded(!isExpanded)}
        variants={fadeInUpVariants}
        whileHover={{ y: -2 }}
      >
        <motion.div className="flex items-center gap-3" variants={itemVariants}>
          <motion.h2
            className="text-2xl font-bold flex items-center gap-2 text-gray-700 dark:text-gray-200"
            variants={itemVariants}
          >
            🔐 EVM Private Key Generator
          </motion.h2>
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Shield size={24} className="text-red-600" />
          </motion.div>
          <motion.span
            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            MAX SECURITY
          </motion.span>
        </motion.div>
        <motion.button
          className="rounded-xl px-4 py-2 flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold transition shadow-neu-flat dark:shadow-neu-flat-dark"
          variants={buttonHoverVariants}
          whileHover="hover"
          whileTap="tap"
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </motion.button>
      </motion.div>

      {isExpanded && (
        <motion.div
          className="max-w-7xl mx-auto space-y-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Security Warning */}
          <motion.div
            className="p-6 rounded-2xl border-2 border-red-300 dark:border-red-900 flex gap-4 bg-red-50 dark:bg-red-900/10 shadow-neu-flat dark:shadow-neu-flat-dark"
            variants={fadeInUpVariants}
          >
            <motion.div
              animate={{ rotate: [0, 10, 0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle
                size={24}
                className="text-red-600 flex-shrink-0 mt-1"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="font-bold text-red-700 mb-2">
                ⚠️ Maximum Security Mode - Critical Guidelines
              </h3>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="font-bold text-red-700 dark:text-red-400 mb-2">
                ⚠️ Maximum Security Mode - Critical Guidelines
              </h3>
              <ul className="text-sm text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
                <li>✅ Keys are generated locally in your browser - NEVER sent to servers</li>
                <li>✅ This session is monitored - 30-minute auto-timeout for security</li>
                <li>✅ DevTools and screenshots are blocked to prevent key extraction</li>
                <li>🔐 All downloads are PASSWORD-ENCRYPTED - use strong passwords</li>
                <li>🚫 NEVER share private keys or seed phrases with anyone</li>
                <li>💾 Store encrypted files in secure locations (hardware drive, safe)</li>
                <li>🔒 Backup seed phrases OFFLINE in secure location</li>
                <li>📋 All your actions are logged for audit trail</li>
              </ul>
            </motion.div>
          </motion.div>

          {/* Generator Section */}
          <motion.div
            className="p-6 rounded-2xl bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark"
            variants={fadeInUpVariants}
          >
            <motion.h2
              className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
              variants={itemVariants}
            >
              Generate New Keys
            </motion.h2>

            <motion.div className="space-y-4" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  Number of Keys to Generate (1-100)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantityToGenerate}
                  onChange={(e) => setQuantityToGenerate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 shadow-neu-pressed dark:shadow-neu-pressed-dark outline-none"
                />
              </motion.div>

              <motion.button
                onClick={handleGenerateKeys}
                disabled={isGenerating}
                className={`w-full px-6 py-3 rounded-xl font-semibold transition text-white shadow-neu-flat dark:shadow-neu-flat-dark ${isGenerating
                    ? "opacity-50 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600"
                  }`}
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      🔄
                    </motion.div>
                    Generating...
                  </span>
                ) : (
                  "🔐 Generate Keys"
                )}
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Generated Keys Display */}
          {generatedKeys.length > 0 && (
            <motion.div
              className="p-6 rounded-2xl bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div className="flex justify-between items-center mb-4" variants={itemVariants}>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">Generated Keys ({generatedKeys.length})</h3>
                <motion.button
                  onClick={() => setHideKeys(!hideKeys)}
                  className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 font-semibold shadow-neu-flat dark:shadow-neu-flat-dark bg-main-light dark:bg-main-dark"
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {hideKeys ? <Eye size={18} /> : <EyeOff size={18} />}
                </motion.button>
              </motion.div>

              <motion.div
                className="space-y-3 max-h-[400px] overflow-y-auto"
                variants={containerVariants}
              >
                {generatedKeys.map((key, index) => (
                  <motion.div
                    key={key.id}
                    className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-neu-pressed dark:shadow-neu-pressed-dark"
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                  >
                    <div className="text-sm font-mono text-gray-700 dark:text-gray-300 mb-2">
                      <p className="mb-1">
                        <strong>Address:</strong> {hideKeys ? "••••••" : key.address}
                        <motion.button
                          onClick={() => copyToClipboard(key.address, index, "address")}
                          className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Copy size={14} />
                        </motion.button>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Export Buttons */}
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6" variants={containerVariants}>
                <motion.button
                  onClick={() => setShowExportPassword(!showExportPassword)}
                  className="px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-neu-flat dark:shadow-neu-flat-dark"
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  🔒 Download Encrypted
                </motion.button>
                <motion.button
                  onClick={downloadPlainCSV}
                  className="px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-neu-flat dark:shadow-neu-flat-dark"
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  📥 Download CSV
                </motion.button>
              </motion.div>

              {/* Password Input */}
              <AnimatePresence>
                {showExportPassword && (
                  <motion.div
                    className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-neu-inset dark:shadow-neu-inset-dark"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                        Encryption Password (min 8 chars)
                      </label>
                      <input
                        type={showExportPassword ? "text" : "password"}
                        value={exportPassword}
                        onChange={(e) => setExportPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 mb-3 bg-main-light dark:bg-main-dark shadow-neu-pressed dark:shadow-neu-pressed-dark outline-none"
                        placeholder="Enter strong password"
                      />
                      <motion.button
                        onClick={downloadEncryptedKeys}
                        disabled={isExporting}
                        className="w-full px-4 py-2 rounded-lg font-semibold bg-green-600 text-white"
                        variants={buttonHoverVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        {isExporting ? "Downloading..." : "Download with Password"}
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Clear Button */}
              <motion.button
                onClick={clearAllKeys}
                className="w-full mt-4 px-4 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-neu-flat dark:shadow-neu-flat-dark"
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
              >
                🗑️ Clear All Keys
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PrivateKeyGeneratorSecure;
