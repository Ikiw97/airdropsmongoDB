import React, { useState } from "react";
import { ethers } from "ethers";
import { Wallet, Search, Layers, ChevronDown, ChevronUp, RefreshCw, Settings, Globe, CircleDollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { secureLogger } from "../utils/dataSecurityUtils";
import { alchemyProxyService } from "../utils/alchemyProxy";

const NETWORKS = {
  Ethereum: { rpc: "https://eth.llamarpc.com", color: "#58a6ff" },
  BSC: { rpc: "https://bsc-dataseed.binance.org", color: "#f0b90b" },
  Polygon: { rpc: "https://polygon-rpc.com", color: "#a855f7" },
  Arbitrum: { rpc: "https://arb1.arbitrum.io/rpc", color: "#28a0f0" },
  Base: { rpc: "https://mainnet.base.org", color: "#0052ff" },
};

const BalanceChecker = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("native"); // native, tokens, custom

  // Native Check State
  const [selectedNetwork, setSelectedNetwork] = useState("Ethereum");
  const [quickAddresses, setQuickAddresses] = useState("");
  const [quickBalances, setQuickBalances] = useState([]);
  const [quickBalanceLoading, setQuickBalanceLoading] = useState(false);

  // Custom RPC State
  const [customRpcUrl, setCustomRpcUrl] = useState("");
  const [customCheckType, setCustomCheckType] = useState("native"); // 'native' or 'token'
  const [customTokenAddress, setCustomTokenAddress] = useState("");
  const [customAddresses, setCustomAddresses] = useState("");
  const [customBalances, setCustomBalances] = useState([]);
  const [customLoading, setCustomLoading] = useState(false);

  // Token Scan State
  const [scannerAddress, setScannerAddress] = useState("");
  const [tokens, setTokens] = useState([]);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [scannerChain, setScannerChain] = useState("eth-mainnet");

  // === Balance Logic ===
  const checkBalances = async (isCustom = false) => {
    const addresses = isCustom ? customAddresses : quickAddresses;
    const rpcUrl = isCustom ? customRpcUrl : NETWORKS[selectedNetwork].rpc;
    const setBalances = isCustom ? setCustomBalances : setQuickBalances;
    const setLoading = isCustom ? setCustomLoading : setQuickBalanceLoading;
    const isTokenCheck = isCustom && customCheckType === 'token';

    const list = addresses.split(/[\n,\s]+/).filter(Boolean);
    if (list.length === 0) return;
    if (isCustom && !rpcUrl) return alert("Please enter a valid RPC URL");
    if (isTokenCheck && !customTokenAddress) return alert("Please enter a Token Contract Address");

    setLoading(true);
    setBalances([]);
    const result = [];

    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      let tokenContract = null;
      let tokenDecimals = 18;
      let tokenSymbol = "TOKEN";

      // If Token Check, setup contract
      if (isTokenCheck) {
        try {
          tokenContract = new ethers.Contract(customTokenAddress, [
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)"
          ], provider);
          tokenDecimals = await tokenContract.decimals();
          tokenSymbol = await tokenContract.symbol();
        } catch (e) {
          console.error("Error fetching token info", e);
          // Fallback if decimals/symbol fail
        }
      }

      for (const addr of list) {
        try {
          if (!ethers.isAddress(addr)) {
            result.push({ address: addr, balance: "Invalid", status: "error" });
            continue;
          }
          const checksumAddr = ethers.getAddress(addr);
          let rawBalance;

          if (isTokenCheck && tokenContract) {
            rawBalance = await tokenContract.balanceOf(checksumAddr);
            // Format with correct decimals
            const formatted = ethers.formatUnits(rawBalance, tokenDecimals);
            result.push({
              address: checksumAddr,
              balance: `${parseFloat(formatted).toFixed(4)} ${tokenSymbol}`,
              status: "success"
            });
          } else {
            // Native Check
            rawBalance = await provider.getBalance(checksumAddr);
            const formatted = parseFloat(ethers.formatEther(rawBalance)).toFixed(4);
            result.push({ address: checksumAddr, balance: formatted, status: "success" });
          }

        } catch (err) {
          result.push({ address: addr, balance: "Error", status: "error" });
        }
      }
    } catch (err) {
      alert("Network Error: Invalid RPC or Network unreachable");
    } finally {
      setBalances(result);
      setLoading(false);
    }
  };

  // === Token Scan Logic ===
  const fetchTokens = async () => {
    if (!scannerAddress) return;
    setScannerLoading(true);
    setScannerError("");
    setTokens([]);

    try {
      const tokenBalances = await alchemyProxyService.getTokenBalances(scannerAddress, scannerChain);
      const nonZeroTokens = tokenBalances.filter(t => t.tokenBalance && t.tokenBalance !== "0");

      if (nonZeroTokens.length === 0) {
        setScannerError("No tokens found.");
        setScannerLoading(false);
        return;
      }

      const results = await Promise.all(nonZeroTokens.map(async (token) => {
        try {
          const metadata = await alchemyProxyService.getTokenMetadata(token.contractAddress, scannerChain);
          const decimals = parseInt(metadata.decimals || '18');
          const balance = Number(token.tokenBalance) / Math.pow(10, decimals);
          return {
            name: metadata.name || "Unknown",
            symbol: metadata.symbol || "???",
            logo: metadata.logo,
            balance: balance.toFixed(4),
          };
        } catch (err) {
          return { name: "Unknown", symbol: "???", logo: null, balance: "0.0000" };
        }
      }));
      setTokens(results);
    } catch (err) {
      setScannerError("Failed to fetch tokens. API might be limited.");
    } finally {
      setScannerLoading(false);
    }
  };

  return (
    <div className="w-full mb-6">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
            <Wallet size={20} />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Wallet Tracking</h2>
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4">
              {/* Tabs */}
              <div className="flex border-b mb-6 overflow-x-auto transition-all duration-300" style={{ borderBottomColor: "var(--border-primary)" }}>
                <button
                  onClick={() => setActiveTab("native")}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-300 ${activeTab === "native" ? "border-cyan-500 text-cyan-500" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"}`}
                >
                  Native Balance
                </button>
                <button
                  onClick={() => setActiveTab("custom")}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-300 ${activeTab === "custom" ? "border-cyan-500 text-cyan-500" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"}`}
                >
                  Custom RPC / Manual
                </button>
                <button
                  onClick={() => setActiveTab("tokens")}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-300 ${activeTab === "tokens" ? "border-cyan-500 text-cyan-500" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"}`}
                >
                  Token Scanner
                </button>
              </div>

              {/* Native Tab */}
              {activeTab === "native" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-4 space-y-4">
                    <div className="p-4 rounded-lg transition-all duration-300" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                      <label className="block text-xs text-gray-500 mb-2 font-semibold uppercase">Select Network</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(NETWORKS).map(net => (
                          <button
                            key={net}
                            onClick={() => setSelectedNetwork(net)}
                            className={`px-3 py-1 text-xs rounded border transition-all duration-300 ${selectedNetwork === net ? "bg-cyan-500/20 border-cyan-500 text-cyan-500 font-bold" : "text-gray-500 hover:border-gray-500"}`}
                            style={{ borderColor: selectedNetwork === net ? "transparent" : "var(--border-primary)" }}
                          >
                            {net}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-semibold uppercase">Wallet Addresses</label>
                      <textarea
                        className="w-full h-40 transition-all duration-300 rounded p-3 text-sm outline-none font-mono border"
                        style={{
                          background: "var(--bg-tertiary)",
                          color: "var(--text-primary)",
                          borderColor: "var(--border-primary)"
                        }}
                        placeholder="0x..."
                        value={quickAddresses}
                        onChange={(e) => setQuickAddresses(e.target.value)}
                      ></textarea>
                    </div>

                    <button
                      onClick={() => checkBalances(false)}
                      disabled={quickBalanceLoading}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 rounded transition flex items-center justify-center gap-2"
                    >
                      {quickBalanceLoading ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />} Check Balance
                    </button>
                  </div>

                  <div className="md:col-span-8">
                    <div className="overflow-x-auto rounded-lg border transition-all duration-300" style={{ borderColor: "var(--border-primary)" }}>
                      <table className="w-full text-sm text-left">
                        <thead className="text-gray-500" style={{ background: "var(--bg-secondary)" }}>
                          <tr>
                            <th className="p-3 border-b font-medium w-12" style={{ borderBottomColor: "var(--border-primary)" }}>#</th>
                            <th className="p-3 border-b font-medium" style={{ borderBottomColor: "var(--border-primary)" }}>Address</th>
                            <th className="p-3 border-b font-medium text-right" style={{ borderBottomColor: "var(--border-primary)" }}>Balance ({selectedNetwork === 'BSC' ? 'BNB' : selectedNetwork === 'Polygon' ? 'MATIC' : 'ETH'})</th>
                          </tr>
                        </thead>
                        <tbody className="transition-all duration-300" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
                          {quickBalances.length === 0 && (
                            <tr>
                              <td colSpan="3" className="p-8 text-center text-gray-500">
                                Enter addresses and click Check
                              </td>
                            </tr>
                          )}
                          {quickBalances.map((b, i) => (
                            <tr key={i} className="border-b transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5" style={{ borderBottomColor: "var(--border-primary)" }}>
                              <td className="p-3 text-gray-500">{i + 1}</td>
                              <td className="p-3 font-mono text-xs">{b.address}</td>
                              <td className={`p-3 text-right font-bold ${b.status === 'success' && parseFloat(b.balance) > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                                {b.balance}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom RPC Tab */}
              {activeTab === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-4 space-y-4">
                    <div className="p-4 rounded-lg transition-all duration-300" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                      <label className="block text-xs text-gray-500 mb-2 font-semibold uppercase flex items-center gap-2">
                        <Globe size={14} /> Custom RPC Settings
                      </label>
                      <input
                        type="text"
                        placeholder="RPC URL (e.g. https://...)"
                        value={customRpcUrl}
                        onChange={(e) => setCustomRpcUrl(e.target.value)}
                        className="w-full transition-all duration-300 border rounded p-2 text-sm outline-none mb-3"
                        style={{
                          background: "var(--bg-tertiary)",
                          color: "var(--text-primary)",
                          borderColor: "var(--border-primary)"
                        }}
                      />

                      {/* Native/Token Toggle */}
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => setCustomCheckType("native")}
                          className={`flex-1 py-1.5 text-xs rounded border transition-all duration-300 ${customCheckType === 'native' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-500' : 'text-gray-500'}`}
                          style={{ borderColor: customCheckType === 'native' ? "transparent" : "var(--border-primary)" }}
                        >
                          Native Coin
                        </button>
                        <button
                          onClick={() => setCustomCheckType("token")}
                          className={`flex-1 py-1.5 text-xs rounded border transition-all duration-300 ${customCheckType === 'token' ? 'bg-purple-500/20 border-purple-500 text-purple-500' : 'text-gray-500'}`}
                          style={{ borderColor: customCheckType === 'token' ? "transparent" : "var(--border-primary)" }}
                        >
                          ERC20 Token
                        </button>
                      </div>

                      {/* Token Address Input */}
                      {customCheckType === 'token' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <input
                            type="text"
                            placeholder="Token Contract Address (0x...)"
                            value={customTokenAddress}
                            onChange={(e) => setCustomTokenAddress(e.target.value)}
                            className="w-full transition-all duration-300 rounded p-2 text-sm outline-none mb-1 font-mono border"
                            style={{
                              background: "var(--bg-tertiary)",
                              color: "var(--text-primary)",
                              borderColor: "var(--border-primary)"
                            }}
                          />
                          <p className="text-[10px] text-gray-500">Address of the token on this network.</p>
                        </motion.div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-semibold uppercase">Wallet Addresses</label>
                      <textarea
                        className="w-full h-40 transition-all duration-300 rounded p-3 text-sm outline-none font-mono border"
                        style={{
                          background: "var(--bg-tertiary)",
                          color: "var(--text-primary)",
                          borderColor: "var(--border-primary)"
                        }}
                        placeholder="0x..."
                        value={customAddresses}
                        onChange={(e) => setCustomAddresses(e.target.value)}
                      ></textarea>
                    </div>

                    <button
                      onClick={() => checkBalances(true)}
                      disabled={customLoading}
                      className={`w-full text-white font-semibold py-2 rounded transition flex items-center justify-center gap-2 ${customCheckType === 'token' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                    >
                      {customLoading ? <RefreshCw className="animate-spin" size={16} /> : <Settings size={16} />}
                      {customCheckType === 'token' ? 'Scan Tokens' : 'Scan Native'}
                    </button>
                  </div>

                  <div className="md:col-span-8">
                    <div className="overflow-x-auto rounded-lg border transition-all duration-300" style={{ borderColor: "var(--border-primary)" }}>
                      <table className="w-full text-sm text-left">
                        <thead className="text-gray-500" style={{ background: "var(--bg-secondary)" }}>
                          <tr>
                            <th className="p-3 border-b font-medium w-12" style={{ borderBottomColor: "var(--border-primary)" }}>#</th>
                            <th className="p-3 border-b font-medium" style={{ borderBottomColor: "var(--border-primary)" }}>Address</th>
                            <th className="p-3 border-b font-medium text-right" style={{ borderBottomColor: "var(--border-primary)" }}>Balance</th>
                          </tr>
                        </thead>
                        <tbody className="transition-all duration-300" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
                          {customBalances.length === 0 && (
                            <tr>
                              <td colSpan="3" className="p-8 text-center text-gray-500">
                                Enter details and click Check
                              </td>
                            </tr>
                          )}
                          {customBalances.map((b, i) => (
                            <tr key={i} className="border-b transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5" style={{ borderBottomColor: "var(--border-primary)" }}>
                              <td className="p-3 text-gray-500">{i + 1}</td>
                              <td className="p-3 font-mono text-xs">{b.address}</td>
                              <td className={`p-3 text-right font-bold ${b.status === 'success' && parseFloat(b.balance) > 0 ? (customCheckType === 'token' ? 'text-purple-400' : 'text-green-400') : 'text-gray-500'}`}>
                                {b.balance}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tokens Tab */}
              {activeTab === "tokens" && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex gap-2">
                      <select
                        className="transition-all duration-300 rounded px-3 text-sm outline-none border"
                        style={{
                          background: "var(--bg-tertiary)",
                          color: "var(--text-primary)",
                          borderColor: "var(--border-primary)"
                        }}
                        onChange={(e) => setScannerChain(e.target.value)}
                      >
                        <option value="eth-mainnet">Ethereum</option>
                        <option value="arbitrum">Arbitrum</option>
                        <option value="polygon">Polygon</option>
                        <option value="base">Base</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Enter Wallet Address e.g. 0x..."
                        className="flex-1 transition-all duration-300 border rounded px-3 py-2 text-sm outline-none font-mono"
                        style={{
                          background: "var(--bg-tertiary)",
                          color: "var(--text-primary)",
                          borderColor: "var(--border-primary)"
                        }}
                        value={scannerAddress}
                        onChange={(e) => setScannerAddress(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={fetchTokens}
                      disabled={scannerLoading}
                      className="px-6 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 rounded transition flex items-center gap-2"
                    >
                      {scannerLoading ? <RefreshCw className="animate-spin" size={16} /> : <Layers size={16} />} Scan Tokens
                    </button>
                  </div>

                  {scannerError && <p className="text-red-400 text-sm">{scannerError}</p>}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tokens.map((token, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg flex items-center gap-4 transition-all duration-300 border hover:opacity-80 bg-slate-100 dark:bg-[#010409] border-gray-200 dark:border-gray-800"
                      >
                        {token.logo ? (
                          <img src={token.logo} alt={token.symbol} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }}>
                            {token.symbol ? token.symbol.slice(0, 2) : "??"}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold" style={{ color: "var(--text-primary)" }}>{token.name}</h4>
                          <p className="text-sm text-gray-400">{token.balance} <span className="text-xs px-1 rounded" style={{ background: "var(--bg-primary)" }}>{token.symbol}</span></p>
                        </div>
                      </div>
                    ))}
                    {tokens.length === 0 && !scannerLoading && !scannerError && (
                      <div className="col-span-full py-12 text-center text-gray-500 border border-dashed rounded-lg transition-all duration-300" style={{ borderColor: 'var(--border-primary)' }}>
                        Enter an address and scan to see detailed token breakdown.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BalanceChecker;
