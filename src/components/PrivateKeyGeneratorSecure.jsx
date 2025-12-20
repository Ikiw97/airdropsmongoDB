import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
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

const PrivateKeyGeneratorSecure = () => {
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
    <div className="w-full mb-8">
      {/* Session Status Bar */}
      {sessionStatus && (
        <div className={`p-3 rounded-lg mb-4 flex justify-between items-center text-sm font-semibold ${
          sessionStatus.isValid
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
        style={{
          boxShadow: "4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)"
        }}>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            Session Time: {formatTime(sessionStatus.timeRemaining)}
          </div>
          {sessionStatus.warning && (
            <span className="animate-pulse">⚠️ Session expiring soon</span>
          )}
        </div>
      )}

      {/* Header */}
      <div
        className={`rounded-3xl p-6 flex justify-between items-center bg-gradient-to-r from-[#e0e5ec] to-[#f1f4f8] cursor-pointer mb-4`}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          boxShadow: "9px 9px 16px #b8b9be, -9px -9px 16px #ffffff",
        }}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-700">
            🔐 EVM Private Key Generator
          </h2>
          <Shield size={24} className="text-red-600" />
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
            MAX SECURITY
          </span>
        </div>
        <button
          className={`rounded-xl px-4 py-2 flex items-center gap-2 text-gray-700 font-semibold transition`}
          style={{
            boxShadow: "3px 3px 6px #b8b9be, -3px -3px 6px #ffffff",
          }}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Security Warning */}
          <div
            className="p-6 rounded-2xl border-2 border-red-300 flex gap-4"
            style={{
              background: "rgba(254, 226, 226, 0.5)",
              boxShadow:
                "10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)",
            }}
          >
            <AlertTriangle
              size={24}
              className="text-red-600 flex-shrink-0 mt-1"
            />
            <div>
              <h3 className="font-bold text-red-700 mb-2">
                ⚠️ Maximum Security Mode - Critical Guidelines
              </h3>
              <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
                <li>✅ Keys are generated locally in your browser - NEVER sent to servers</li>
                <li>✅ This session is monitored - 30-minute auto-timeout for security</li>
                <li>✅ DevTools and screenshots are blocked to prevent key extraction</li>
                <li>🔐 All downloads are PASSWORD-ENCRYPTED - use strong passwords</li>
                <li>🚫 NEVER share private keys or seed phrases with anyone</li>
                <li>💾 Store encrypted files in secure locations (hardware drive, safe)</li>
                <li>🔒 Backup seed phrases OFFLINE in secure location</li>
                <li>📋 All your actions are logged for audit trail</li>
              </ul>
            </div>
          </div>

          {/* Generator Section */}
          <div
            className="p-6 rounded-2xl"
            style={{
              background: "#e0e5ec",
              boxShadow:
                "10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)",
            }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Generate New Keys
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2 font-medium">
                  Number of Keys to Generate (1-100)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantityToGenerate}
                  onChange={(e) =>
                    setQuantityToGenerate(
                      Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-full bg-[#e0e5ec] p-3 rounded-lg text-gray-800 font-semibold"
                  style={{
                    boxShadow:
                      "inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)",
                  }}
                  data-sensitive
                />
              </div>

              <button
                onClick={handleGenerateKeys}
                disabled={isGenerating}
                className={`w-full py-3 rounded-lg font-semibold text-lg transition ${
                  isGenerating
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-blue-700 hover:text-blue-800"
                }`}
                style={{
                  boxShadow: isGenerating
                    ? "inset 4px 4px 8px rgba(163,177,198,0.6)"
                    : "8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)",
                }}
              >
                {isGenerating ? "⏳ Generating..." : "🔐 Generate Keys"}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {generatedKeys.length > 0 && (
            <div
              className="p-6 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)",
              }}
            >
              <div
                className="flex justify-between items-center mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={20} className="text-yellow-700" />
                  <span className="font-semibold text-yellow-800">
                    ⚠️ WATERMARK: Screen Recording & Screenshots Are BLOCKED
                  </span>
                </div>
                <button
                  onClick={() => setHideKeys(!hideKeys)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 font-semibold transition"
                  style={{
                    boxShadow:
                      "4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)",
                  }}
                >
                  {hideKeys ? <Eye size={18} /> : <EyeOff size={18} />}
                  {hideKeys ? "Show" : "Hide"}
                </button>
              </div>

              <div
                className="rounded-lg p-4 space-y-3 max-h-[600px] overflow-y-auto"
                ref={keyDisplayRef}
                data-sensitive
                style={{
                  background: "linear-gradient(145deg, #d1d6dd, #ecf0f3)",
                  boxShadow:
                    "inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.5)",
                }}
              >
                {generatedKeys.map((key, index) => (
                  <div
                    key={key.id}
                    className="bg-[#e0e5ec] p-4 rounded-xl space-y-3"
                    data-sensitive
                    style={{
                      boxShadow:
                        "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-700">
                        Key #{index + 1}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-600">
                        🔑 Private Key:
                      </label>
                      <div className="flex items-center gap-2">
                        <code
                          className="flex-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto font-mono text-gray-800 break-all"
                          style={{
                            boxShadow:
                              "inset 2px 2px 4px rgba(163,177,198,0.4)",
                          }}
                          data-secure-paste="false"
                        >
                          {hideKeys
                            ? key.privateKey
                                .substring(0, 6)
                                .padEnd(key.privateKey.length - 6, "•")
                            : key.privateKey}
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(key.privateKey, index, "Private Key")
                          }
                          className={`flex-shrink-0 p-2 rounded-lg transition font-semibold ${
                            copiedIndex === index
                              ? "text-green-600"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                          style={{
                            boxShadow:
                              "4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)",
                          }}
                        >
                          {copiedIndex === index ? "✅" : <Copy size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-600">
                        📍 Address:
                      </label>
                      <div className="flex items-center gap-2">
                        <code
                          className="flex-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto font-mono text-gray-800 break-all"
                          style={{
                            boxShadow:
                              "inset 2px 2px 4px rgba(163,177,198,0.4)",
                          }}
                        >
                          {key.address}
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(key.address, index, "Address")
                          }
                          className={`flex-shrink-0 p-2 rounded-lg transition font-semibold ${
                            copiedIndex === index
                              ? "text-green-600"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                          style={{
                            boxShadow:
                              "4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)",
                          }}
                        >
                          {copiedIndex === index ? "✅" : <Copy size={16} />}
                        </button>
                      </div>
                    </div>

                    {key.mnemonic !== "N/A" && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-600">
                          🌱 Mnemonic (BIP39):
                        </label>
                        <div className="flex items-center gap-2">
                          <code
                            className="flex-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto font-mono text-gray-800 break-words"
                            style={{
                              boxShadow:
                                "inset 2px 2px 4px rgba(163,177,198,0.4)",
                            }}
                            data-sensitive
                          >
                            {hideKeys
                              ? key.mnemonic
                                  .split(" ")
                                  .map((word, idx) =>
                                    idx === 0 ? word : word.replace(/./g, "•")
                                  )
                                  .join(" ")
                              : key.mnemonic}
                          </code>
                          <button
                            onClick={() =>
                              copyToClipboard(key.mnemonic, index, "Mnemonic")
                            }
                            className={`flex-shrink-0 p-2 rounded-lg transition font-semibold ${
                              copiedIndex === index
                                ? "text-green-600"
                                : "text-gray-600 hover:text-gray-800"
                            }`}
                            style={{
                              boxShadow:
                                "4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)",
                            }}
                          >
                            {copiedIndex === index ? "✅" : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Export Section */}
              <div className="mt-6 space-y-3">
                {!showExportPassword ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowExportPassword(true)}
                      className="flex-1 py-2 rounded-lg font-semibold text-blue-700 hover:text-blue-800 transition text-sm"
                      style={{
                        boxShadow:
                          "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
                      }}
                    >
                      🔐 Download Encrypted (Recommended)
                    </button>
                    <button
                      onClick={downloadPlainCSV}
                      className="flex-1 py-2 rounded-lg font-semibold text-orange-700 hover:text-orange-800 transition text-sm"
                      style={{
                        boxShadow:
                          "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
                      }}
                    >
                      ⚠️ Download Plain CSV
                    </button>
                    <button
                      onClick={clearAllKeys}
                      className="flex-1 py-2 rounded-lg font-semibold text-red-700 hover:text-red-800 transition text-sm"
                      style={{
                        boxShadow:
                          "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
                      }}
                    >
                      🗑️ Clear All
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🔐 Enter Strong Password (min 8 chars):
                      </label>
                      <input
                        type="password"
                        placeholder="Create a strong password..."
                        value={exportPassword}
                        onChange={(e) => setExportPassword(e.target.value)}
                        className="w-full bg-white p-2 rounded border border-gray-300 text-gray-800"
                        data-sensitive
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        ✅ Password strength: {exportPassword.length < 8 ? "❌ Weak" : exportPassword.length < 16 ? "⚠️ Medium" : "✅ Strong"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={downloadEncryptedKeys}
                        disabled={isExporting || exportPassword.length < 8}
                        className={`flex-1 py-2 rounded-lg font-semibold transition text-sm ${
                          isExporting || exportPassword.length < 8
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-green-700 hover:text-green-800"
                        }`}
                        style={{
                          boxShadow: isExporting
                            ? "inset 4px 4px 8px rgba(163,177,198,0.6)"
                            : "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
                        }}
                      >
                        {isExporting ? "⏳ Encrypting..." : "✅ Confirm & Download"}
                      </button>
                      <button
                        onClick={() => {
                          setShowExportPassword(false);
                          setExportPassword("");
                        }}
                        className="px-4 py-2 rounded-lg font-semibold text-gray-700 hover:text-gray-800 transition"
                        style={{
                          boxShadow:
                            "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audit Log Section */}
          <div
            className="p-6 rounded-2xl cursor-pointer"
            onClick={() => setShowAuditLog(!showAuditLog)}
            style={{
              background: "#e0e5ec",
              boxShadow:
                "10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)",
            }}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                <Activity size={20} />
                Activity Log
              </h3>
              {showAuditLog ? <ChevronUp /> : <ChevronDown />}
            </div>

            {showAuditLog && (
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto text-xs">
                {getAuditLogs().length === 0 ? (
                  <p className="text-gray-500">No activities logged yet</p>
                ) : (
                  getAuditLogs().map((log, idx) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded text-gray-700 ${
                        log.severity === "critical"
                          ? "bg-red-100"
                          : log.severity === "warning"
                          ? "bg-yellow-100"
                          : "bg-blue-100"
                      }`}
                    >
                      <strong>{log.action}</strong> - {new Date(log.timestamp).toLocaleTimeString()}
                      {log.details?.count && ` (Count: ${log.details.count})`}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div
            className="p-6 rounded-2xl"
            style={{
              background: "#e0e5ec",
              boxShadow:
                "10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)",
            }}
          >
            <h3 className="text-xl font-bold mb-4 text-gray-700">
              ℹ️ Security Information
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong>🔒 AES-256 Encryption:</strong> Downloaded files are encrypted with AES-GCM
              </p>
              <p>
                <strong>🏠 Local Generation:</strong> All keys generated in your browser, never transmitted
              </p>
              <p>
                <strong>⏱️ Session Timeout:</strong> Automatic logout after 30 minutes for security
              </p>
              <p>
                <strong>📋 Audit Trail:</strong> All actions logged for security review
              </p>
              <p>
                <strong>🚫 Anti-Screenshot:</strong> Screenshots and DevTools are blocked
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivateKeyGeneratorSecure;
