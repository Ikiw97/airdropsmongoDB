import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Send, AlertCircle, CheckCircle, Loader, ExternalLink, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  requestWalletConnection,
  safeAddWalletListener,
  safeRemoveWalletListener,
  waitForWallet,
} from "../utils/walletUtils";

// Supported EVM Networks (keeping logic same)
const EVM_NETWORKS = {
  1: { name: "Ethereum", symbol: "ETH", rpc: "https://eth.llamarpc.com", explorer: "https://etherscan.io" },
  56: { name: "BSC", symbol: "BNB", rpc: "https://bsc-dataseed.binance.org", explorer: "https://bscscan.com" },
  137: { name: "Polygon", symbol: "MATIC", rpc: "https://polygon-rpc.com", explorer: "https://polygonscan.com" },
  42161: { name: "Arbitrum", symbol: "ETH", rpc: "https://arb1.arbitrum.io/rpc", explorer: "https://arbiscan.io" },
  10: { name: "Optimism", symbol: "ETH", rpc: "https://mainnet.optimism.io", explorer: "https://optimistic.etherscan.io" },
  8453: { name: "Base", symbol: "ETH", rpc: "https://mainnet.base.org", explorer: "https://basescan.org" },
  43114: { name: "Avalanche", symbol: "AVAX", rpc: "https://api.avax.network/ext/bc/C/rpc", explorer: "https://snowtrace.io" },
  250: { name: "Fantom", symbol: "FTM", rpc: "https://rpc.ftm.tools", explorer: "https://ftmscan.com" },
};

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

function MultisendTool() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [sendType, setSendType] = useState("native"); // 'native' or 'token'
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenInfo, setTokenInfo] = useState(null);
  const [recipients, setRecipients] = useState("");
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [txResults, setTxResults] = useState([]);
  const [error, setError] = useState("");
  const [walletHandlers, setWalletHandlers] = useState({ accountsChanged: null, chainChanged: null, provider: null });

  // Connect Wallet Logic
  const connectWallet = async () => {
    try {
      setError("");
      const ethereumProvider = await waitForWallet(3000);
      if (!ethereumProvider) {
        alert("Please install MetaMask!");
        return;
      }
      const tempProvider = new ethers.BrowserProvider(ethereumProvider);
      const accounts = await requestWalletConnection();
      const tempSigner = await tempProvider.getSigner();
      const network = await tempProvider.getNetwork();

      setProvider(tempProvider);
      setSigner(tempSigner);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));

      const handleAccountsChanged = (newAccounts) => {
        if (newAccounts.length === 0) disconnectWallet();
        else setAccount(newAccounts[0]);
      };
      const handleChainChanged = () => window.location.reload();

      safeAddWalletListener(ethereumProvider, "accountsChanged", handleAccountsChanged);
      safeAddWalletListener(ethereumProvider, "chainChanged", handleChainChanged);

      setWalletHandlers({ provider: ethereumProvider, accountsChanged: handleAccountsChanged, chainChanged: handleChainChanged });
    } catch (err) {
      setError("Failed to connect: " + err.message);
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance("0");
    setTokenInfo(null);
  };

  useEffect(() => {
    return () => {
      if (walletHandlers.provider) {
        if (walletHandlers.accountsChanged) safeRemoveWalletListener(walletHandlers.provider, "accountsChanged", walletHandlers.accountsChanged);
        if (walletHandlers.chainChanged) safeRemoveWalletListener(walletHandlers.provider, "chainChanged", walletHandlers.chainChanged);
      }
    };
  }, [walletHandlers]);

  // Balance & Token Logic
  useEffect(() => {
    const fetchBalance = async () => {
      if (!account || !provider) return;
      try {
        if (sendType === "native") {
          const bal = await provider.getBalance(account);
          setBalance(ethers.formatEther(bal));
        } else if (sendType === "token" && tokenAddress && ethers.isAddress(tokenAddress)) {
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const decimals = await contract.decimals();
          const bal = await contract.balanceOf(account);
          setBalance(ethers.formatUnits(bal, decimals));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBalance();
  }, [account, provider, sendType, tokenAddress]);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (sendType !== "token" || !tokenAddress || !provider || !ethers.isAddress(tokenAddress)) {
        setTokenInfo(null);
        return;
      }
      try {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        setTokenInfo({ symbol, decimals });
      } catch (err) {
        setTokenInfo(null);
      }
    };
    fetchTokenInfo();
  }, [tokenAddress, provider, sendType]);

  const parseRecipients = () => {
    return recipients.split("\n").filter(line => line.trim()).reduce((acc, line) => {
      const [addr, amt] = line.split(",").map(p => p.trim());
      if (ethers.isAddress(addr) && !isNaN(parseFloat(amt)) && parseFloat(amt) > 0) {
        acc.push({ address: addr, amount: parseFloat(amt) });
      }
      return acc;
    }, []);
  };

  const executeMultisend = async () => {
    if (!signer) return alert("Connect wallet first");
    const parsed = parseRecipients();
    if (parsed.length === 0) return alert("No valid recipients");

    setLoading(true);
    setTxResults([]);
    setError("");
    const results = [];

    try {
      if (sendType === "native") {
        for (let i = 0; i < parsed.length; i++) {
          const { address, amount } = parsed[i];
          try {
            const tx = await signer.sendTransaction({ to: address, value: ethers.parseEther(amount.toString()) });
            results.push({ address, amount, status: "pending", hash: tx.hash });
            setTxResults([...results]);
            await tx.wait();
            results[i].status = "success";
            setTxResults([...results]);
          } catch (err) {
            results.push({ address, amount, status: "failed", error: err.message });
            setTxResults([...results]);
          }
        }
      } else {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const decimals = await contract.decimals();
        for (let i = 0; i < parsed.length; i++) {
          const { address, amount } = parsed[i];
          try {
            const tx = await contract.transfer(address, ethers.parseUnits(amount.toString(), decimals));
            results.push({ address, amount, status: "pending", hash: tx.hash });
            setTxResults([...results]);
            await tx.wait();
            results[i].status = "success";
            setTxResults([...results]);
          } catch (err) {
            results.push({ address, amount, status: "failed", error: err.message });
            setTxResults([...results]);
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentNetwork = chainId ? EVM_NETWORKS[chainId] : null;
  const networkSymbol = currentNetwork?.symbol || "TOKEN";
  const validCount = parseRecipients().length;

  return (
    <div className="w-full mb-6">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 rounded-lg mb-6 transition-all duration-300"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Send size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Multisend</h2>
            <p className="text-xs text-gray-500">Bulk Transaction Tool</p>
          </div>
        </div>
        {!account ? (
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-sm flex items-center gap-2"
          >
            <Wallet size={16} /> Connect Wallet
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-400">Connected</p>
              <p className="text-sm font-bold font-mono" style={{ color: "var(--text-primary)" }}>{account.slice(0, 6)}...{account.slice(-4)}</p>
            </div>
            <button
              onClick={disconnectWallet}
              className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {account && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-7 space-y-4">
            <div
              className="p-5 rounded-lg transition-all duration-300"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
            >
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-2 uppercase font-semibold">Asset Type</label>
                <div className="flex gap-2 p-1 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                  <button
                    onClick={() => setSendType("native")}
                    className={`flex-1 py-2 rounded text-sm font-semibold transition ${sendType === "native" ? "bg-cyan-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700 dark:hover:text-white"}`}
                  >
                    Native ({networkSymbol})
                  </button>
                  <button
                    onClick={() => setSendType("token")}
                    className={`flex-1 py-2 rounded text-sm font-semibold transition ${sendType === "token" ? "bg-purple-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700 dark:hover:text-white"}`}
                  >
                    ERC20 Token
                  </button>
                </div>
              </div>

              {sendType === "token" && (
                <div className="mb-4">
                  <label className="block text-xs text-gray-500 mb-2 uppercase font-semibold">Token Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full transition-all duration-300 rounded p-3 text-sm outline-none font-mono"
                      style={{
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--text-primary)"
                      }}
                    />
                    {tokenInfo && (
                      <div className="absolute right-3 top-3 text-xs text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">
                        {tokenInfo.symbol}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <label className="block text-xs text-gray-500 uppercase font-semibold">Recipients & Amounts</label>
                  <span className="text-xs text-cyan-400 font-mono">Balance: {parseFloat(balance).toFixed(4)}</span>
                </div>
                <textarea
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder={`0x123...abc, 0.5\n0x456...def, 1.2`}
                  className="w-full h-40 transition-all duration-300 rounded p-3 text-sm outline-none font-mono resize-none"
                  style={{
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-primary)",
                    color: "var(--text-primary)"
                  }}
                ></textarea>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Total Recipients: {validCount}</span>
                  <span>Format: address, amount</span>
                </div>
              </div>

              <button
                onClick={executeMultisend}
                disabled={loading || validCount === 0}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader className="animate-spin" size={18} /> : <Send size={18} />}
                {loading ? "Processing..." : `Send to ${validCount} Recipients`}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Status Log */}
          <div className="lg:col-span-5 h-full">
            <div
              className="p-5 rounded-lg h-full transition-all duration-300"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
            >
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <CheckCircle size={16} className="text-green-500" /> Transaction Log
              </h3>

              {txResults.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-600 text-sm border border-dashed rounded transition-all duration-300" style={{ borderColor: 'var(--border-primary)' }}>
                  <Loader size={24} className="mb-2 opacity-20" />
                  waiting for transactions...
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                  {txResults.map((tx, i) => (
                    <div key={i} className="p-3 rounded border text-xs" style={{ background: "var(--bg-tertiary)", borderColor: "var(--border-primary)" }}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono text-gray-400 break-all">{tx.address}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${tx.status === 'success' ? 'bg-green-500/20 text-green-400' :
                          tx.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-500">
                        <span>Amount: <span className="transition-all duration-300" style={{ color: 'var(--text-primary)' }}>{tx.amount}</span></span>
                        {tx.hash && (
                          <a href={`${currentNetwork?.explorer || "#"}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
                            View <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      {tx.error && <div className="text-red-500 mt-1">{tx.error}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MultisendTool;
