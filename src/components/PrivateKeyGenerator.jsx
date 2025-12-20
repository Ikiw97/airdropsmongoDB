import React, { useState } from "react";
import { ethers } from "ethers";
import { Copy, AlertTriangle, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";

const PrivateKeyGenerator = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [generatedKeys, setGeneratedKeys] = useState([]);
  const [hideKeys, setHideKeys] = useState(true);
  const [quantityToGenerate, setQuantityToGenerate] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

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
      return null;
    }
  };

  const handleGenerateKeys = () => {
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
    try {
      const newKeys = [];
      for (let i = 0; i < qty; i++) {
        const key = generatePrivateKey();
        if (key) newKeys.push(key);
      }
      setGeneratedKeys(newKeys);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadAsCSV = () => {
    if (generatedKeys.length === 0) return alert("❌ No keys to download");

    const csv =
      "Private Key,Address,Mnemonic\n" +
      generatedKeys
        .map((k) => `"${k.privateKey}","${k.address}","${k.mnemonic}"`)
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evm-keys-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsJSON = () => {
    if (generatedKeys.length === 0) return alert("❌ No keys to download");

    const json = JSON.stringify(
      generatedKeys.map((k) => ({
        privateKey: k.privateKey,
        address: k.address,
        mnemonic: k.mnemonic,
      })),
      null,
      2
    );

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evm-keys-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllKeys = () => {
    const confirm = window.confirm(
      "⚠️ Are you sure you want to clear all keys? This cannot be undone."
    );
    if (confirm) {
      setGeneratedKeys([]);
    }
  };

  return (
    <div className="w-full mb-8">
      {/* Header */}
      <div
        className={`rounded-3xl p-6 flex justify-between items-center bg-gradient-to-r from-[#e0e5ec] to-[#f1f4f8] cursor-pointer mb-4`}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          boxShadow: "9px 9px 16px #b8b9be, -9px -9px 16px #ffffff",
        }}
      >
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-700">
          🔐 EVM Private Key Generator
        </h2>
        <button
          className={`rounded-xl px-4 py-2 flex items-center gap-2 text-gray-700 font-semibold transition`}
          style={{
            boxShadow: "3px 3px 6px #b8b9be, -3px -3px 6px #ffffff",
          }}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {isExpanded ? "Collapse" : "Expand"}
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
                ⚠️ Security Warning
              </h3>
              <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
                <li>
                  Never share your private keys with anyone or paste them online
                </li>
                <li>
                  Keep your private keys safe and secure - anyone with them can
                  access your funds
                </li>
                <li>
                  Save downloaded files securely and delete after importing to
                  wallet
                </li>
                <li>
                  This tool generates keys locally in your browser - no data is
                  sent to servers
                </li>
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
              {/* Quantity Input */}
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
                />
              </div>

              {/* Generate Button */}
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
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                    Generated Keys ({generatedKeys.length})
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    🔒 Keys are generated locally - never transmitted
                  </p>
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

              {/* Keys List */}
              <div
                className="rounded-lg p-4 space-y-3 max-h-[600px] overflow-y-auto"
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
                    style={{
                      boxShadow:
                        "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
                    }}
                  >
                    {/* Key Number */}
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-700">
                        Key #{index + 1}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleString()}
                      </span>
                    </div>

                    {/* Private Key */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-600">
                        Private Key:
                      </label>
                      <div className="flex items-center gap-2">
                        <code
                          className="flex-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto font-mono text-gray-800 break-all"
                          style={{
                            boxShadow:
                              "inset 2px 2px 4px rgba(163,177,198,0.4)",
                          }}
                        >
                          {hideKeys
                            ? key.privateKey
                                .substring(0, 10)
                                .padEnd(key.privateKey.length - 10, "*")
                            : key.privateKey}
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(key.privateKey, index)
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
                          title={
                            copiedIndex === index
                              ? "Copied!"
                              : "Copy to clipboard"
                          }
                        >
                          {copiedIndex === index ? (
                            "✅"
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-600">
                        Address:
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
                          onClick={() => copyToClipboard(key.address, index)}
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
                          {copiedIndex === index ? (
                            "✅"
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Mnemonic */}
                    {key.mnemonic !== "N/A" && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-600">
                          Mnemonic Seed (BIP39):
                        </label>
                        <div className="flex items-center gap-2">
                          <code
                            className="flex-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto font-mono text-gray-800 break-words"
                            style={{
                              boxShadow:
                                "inset 2px 2px 4px rgba(163,177,198,0.4)",
                            }}
                          >
                            {hideKeys
                              ? key.mnemonic
                                  .split(" ")
                                  .map((word, idx) =>
                                    idx === 0 ? word : word.replace(/./g, "*")
                                  )
                                  .join(" ")
                              : key.mnemonic}
                          </code>
                          <button
                            onClick={() =>
                              copyToClipboard(key.mnemonic, index)
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
                            {copiedIndex === index ? (
                              "✅"
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                <button
                  onClick={downloadAsJSON}
                  className="py-2 rounded-lg font-semibold text-blue-700 hover:text-blue-800 transition text-sm"
                  style={{
                    boxShadow:
                      "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
                  }}
                >
                  📥 Download JSON
                </button>
                <button
                  onClick={downloadAsCSV}
                  className="py-2 rounded-lg font-semibold text-green-700 hover:text-green-800 transition text-sm"
                  style={{
                    boxShadow:
                      "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
                  }}
                >
                  📥 Download CSV
                </button>
                <button
                  onClick={clearAllKeys}
                  className="py-2 rounded-lg font-semibold text-red-700 hover:text-red-800 transition text-sm"
                  style={{
                    boxShadow:
                      "6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)",
                  }}
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>
          )}

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
              ℹ️ How it works
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong>🔐 Private Key:</strong> A 256-bit random number used to
                sign transactions and prove ownership of the account.
              </p>
              <p>
                <strong>📍 Address:</strong> The public Ethereum address derived
                from your private key. Share this to receive funds.
              </p>
              <p>
                <strong>🌱 Mnemonic:</strong> A 12 or 24-word phrase that can
                recreate your private key. Keep it as secure as your private key.
              </p>
              <p>
                <strong>🛡️ Best Practices:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Use this tool only on a secure, offline computer</li>
                <li>Store keys in a hardware wallet when possible</li>
                <li>Never share keys with anyone, even support staff</li>
                <li>Back up your mnemonic in a secure location</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivateKeyGenerator;
