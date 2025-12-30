import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Send, AlertCircle, CheckCircle, Loader, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { containerVariants, fadeInUpVariants, buttonHoverVariants, itemVariants } from "../utils/animationVariants";
import {
  getEthereumProvider,
  requestWalletConnection,
  safeAddWalletListener,
  safeRemoveWalletListener,
  waitForWallet,
} from "../utils/walletUtils";

import { useTheme } from "../contexts/ThemeContext";

// ERC20 ABI - only transfer function needed
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// Supported EVM Networks
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
  const { theme } = useTheme();

  // Connect Wallet
  const connectWallet = async () => {
    try {
      setError("");

      // Wait for wallet to be available (handles async wallet injection)
      const ethereumProvider = await waitForWallet(3000);
      if (!ethereumProvider) {
        alert("❌ Please install MetaMask or any EVM wallet!");
        return;
      }

      // Create provider and signer
      const tempProvider = new ethers.BrowserProvider(ethereumProvider);

      // Request accounts
      const accounts = await requestWalletConnection();
      const tempSigner = await tempProvider.getSigner();
      const network = await tempProvider.getNetwork();

      setProvider(tempProvider);
      setSigner(tempSigner);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));

      // Create handlers for wallet events
      const handleAccountsChanged = (newAccounts) => {
        if (newAccounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(newAccounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      // Add wallet event listeners
      safeAddWalletListener(ethereumProvider, "accountsChanged", handleAccountsChanged);
      safeAddWalletListener(ethereumProvider, "chainChanged", handleChainChanged);

      // Store handlers and provider for cleanup
      setWalletHandlers({
        provider: ethereumProvider,
        accountsChanged: handleAccountsChanged,
        chainChanged: handleChainChanged,
      });
    } catch (err) {
      console.error("Connection error:", err);
      setError("Failed to connect wallet: " + (err?.message || err));
    }
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    setAccount("");
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance("0");
    setTokenInfo(null);
  };

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      if (walletHandlers.provider) {
        if (walletHandlers.accountsChanged) {
          safeRemoveWalletListener(walletHandlers.provider, "accountsChanged", walletHandlers.accountsChanged);
        }
        if (walletHandlers.chainChanged) {
          safeRemoveWalletListener(walletHandlers.provider, "chainChanged", walletHandlers.chainChanged);
        }
      }
    };
  }, [walletHandlers]);

  // Fetch Balance
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
        console.error("Balance fetch error:", err);
        setBalance("Error");
      }
    };

    fetchBalance();
  }, [account, provider, sendType, tokenAddress]);

  // Fetch Token Info
  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (sendType !== "token" || !tokenAddress || !provider) {
        setTokenInfo(null);
        return;
      }

      try {
        if (!ethers.isAddress(tokenAddress)) {
          setTokenInfo(null);
          return;
        }

        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        setTokenInfo({ symbol, decimals });
      } catch (err) {
        console.error("Token info error:", err);
        setTokenInfo(null);
      }
    };

    fetchTokenInfo();
  }, [tokenAddress, provider, sendType]);

  // Parse Recipients
  const parseRecipients = () => {
    const lines = recipients.split("\n").filter((line) => line.trim());
    const parsed = [];

    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length === 2) {
        const [address, amount] = parts;
        if (ethers.isAddress(address) && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
          parsed.push({ address, amount: parseFloat(amount) });
        }
      }
    }

    return parsed;
  };

  // Calculate Total Amount
  const getTotalAmount = () => {
    const parsed = parseRecipients();
    return parsed.reduce((sum, item) => sum + item.amount, 0).toFixed(6);
  };

  // Execute Multisend
  const executeMultisend = async () => {
    if (!signer) {
      alert("❌ Please connect your wallet first!");
      return;
    }

    const parsed = parseRecipients();
    if (parsed.length === 0) {
      alert("❌ No valid recipients found! Format: 0xaddress,amount");
      return;
    }

    setLoading(true);
    setTxResults([]);
    setError("");

    const results = [];

    try {
      if (sendType === "native") {
        // Send Native Token
        for (let i = 0; i < parsed.length; i++) {
          const { address, amount } = parsed[i];
          try {
            const tx = await signer.sendTransaction({
              to: address,
              value: ethers.parseEther(amount.toString()),
            });

            results.push({
              address,
              amount,
              status: "pending",
              hash: tx.hash,
            });
            setTxResults([...results]);

            await tx.wait();
            results[i].status = "success";
            setTxResults([...results]);
          } catch (err) {
            console.error(`Error sending to ${address}:`, err);
            results[i] = {
              address,
              amount,
              status: "failed",
              error: err?.message || String(err),
            };
            setTxResults([...results]);
          }
        }
      } else {
        // Send ERC20 Token
        if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
          alert("❌ Invalid token contract address!");
          setLoading(false);
          return;
        }

        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const decimals = await contract.decimals();

        for (let i = 0; i < parsed.length; i++) {
          const { address, amount } = parsed[i];
          try {
            const tx = await contract.transfer(
              address,
              ethers.parseUnits(amount.toString(), decimals)
            );

            results.push({
              address,
              amount,
              status: "pending",
              hash: tx.hash,
            });
            setTxResults([...results]);

            await tx.wait();
            results[i].status = "success";
            setTxResults([...results]);
          } catch (err) {
            console.error(`Error sending to ${address}:`, err);
            results[i] = {
              address,
              amount,
              status: "failed",
              error: err?.message || String(err),
            };
            setTxResults([...results]);
          }
        }
      }

      // Refresh balance after all transactions
      const bal = sendType === "native"
        ? await provider.getBalance(account)
        : await new ethers.Contract(tokenAddress, ERC20_ABI, provider).balanceOf(account);

      const decimals = sendType === "native" ? 18 : await new ethers.Contract(tokenAddress, ERC20_ABI, provider).decimals();
      setBalance(ethers.formatUnits(bal, decimals));

    } catch (err) {
      console.error("Multisend error:", err);
      setError("Transaction failed: " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const currentNetwork = chainId ? EVM_NETWORKS[chainId] : null;
  const networkSymbol = currentNetwork?.symbol || "TOKEN";
  const explorer = currentNetwork?.explorer || "";

  // lightweight hint UI: count invalid lines (non-invasive, doesn't change algorithm)
  const totalLines = recipients.split("\n").filter((line) => line.trim()).length;
  const validCount = parseRecipients().length;
  const invalidCount = Math.max(0, totalLines - validCount);

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4 md:px-0 bg-gray-200 dark:bg-gray-900 transition-colors"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >

      <motion.div
        className="w-full max-w-5xl p-5 md:p-8 rounded-3xl bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark transition-all"
        variants={fadeInUpVariants}
      >
        {/* Header */}
        <motion.div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" variants={fadeInUpVariants}>
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl bg-main-light dark:bg-main-dark shadow-neu-pressed dark:shadow-neu-pressed-dark flex items-center justify-center"
            >
              {/* Solid wallet SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2 7C2 4.791 3.791 3 6 3H18C20.209 3 22 4.791 22 7V17C22 19.209 20.209 21 18 21H6C3.791 21 2 19.209 2 17V7Z"
                  fill="#60A5FA"
                />
                <path
                  d="M16 11H21V13H16C14.895 13 14 12.105 14 11C14 9.895 14.895 9 16 9Z"
                  fill="#3B82F6"
                />
                <circle cx="17.5" cy="12" r="1.2" fill="white" />
              </svg>
            </div>

            <div>
              <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Multisend Tool</h1>
              {/* header description removed as requested */}
            </div>
          </div>

          {/* quick status box */}
          <div className="text-right">
            <div style={{ fontSize: 12 }} className="text-gray-600 dark:text-gray-400">Network</div>
            <div className="font-semibold text-gray-800 dark:text-gray-200">{currentNetwork?.name || "Not connected"}</div>
          </div>
        </motion.div>

        {/* Wallet Connection */}
        <motion.div className="mb-6 text-center" variants={fadeInUpVariants}>
          {!account ? (
            <button
              onClick={connectWallet}
              className="w-full py-3 rounded-2xl text-gray-700 dark:text-gray-200 font-semibold bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark transition"
              data-testid="connect-wallet-btn"
            >
              <Wallet size={18} className="inline-block mr-2" />
              Connect Wallet
            </button>
          ) : (
            <div className="space-y-3">
              <div
                className="flex items-center justify-between p-3 rounded-2xl bg-main-light dark:bg-main-dark shadow-neu-pressed dark:shadow-neu-pressed-dark"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Connected</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-xs bg-red-500 text-white px-3 py-1 rounded-xl shadow-md transition hover:scale-105"
                >
                  Disconnect
                </button>
              </div>

              <div
                className="p-3 rounded-2xl text-left bg-main-light dark:bg-main-dark shadow-neu-pressed dark:shadow-neu-pressed-dark"
              >
                <p className="text-cyan-600 font-mono text-sm break-all" data-testid="connected-address">
                  {account}
                </p>
                {currentNetwork && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Network: <span className="text-gray-700 dark:text-gray-300 font-semibold">{currentNetwork.name}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Send Type Toggle */}
        {account && (
          <motion.div className="mb-6" variants={fadeInUpVariants}>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Send Type</label>
            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => setSendType("native")}
                className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition-all ${sendType === "native"
                    ? "bg-main-light dark:bg-main-dark text-gray-900 dark:text-gray-100 shadow-neu-pressed dark:shadow-neu-pressed-dark"
                    : "bg-main-light dark:bg-main-dark text-gray-600 dark:text-gray-400 shadow-neu-flat dark:shadow-neu-flat-dark"
                  }`}
                data-testid="send-native-btn"
              >
                Send Native ({networkSymbol})
              </button>
              <button
                onClick={() => setSendType("token")}
                className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition-all ${sendType === "token"
                    ? "bg-main-light dark:bg-main-dark text-gray-900 dark:text-gray-100 shadow-neu-pressed dark:shadow-neu-pressed-dark"
                    : "bg-main-light dark:bg-main-dark text-gray-600 dark:text-gray-400 shadow-neu-flat dark:shadow-neu-flat-dark"
                  }`}
                data-testid="send-token-btn"
              >
                Send Tokens (ERC20)
              </button>
            </div>
          </motion.div>
        )}

        {/* Token Address Input */}
        {account && sendType === "token" && (
          <motion.div className="mb-6" variants={fadeInUpVariants}>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Token Contract Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="w-full p-3 rounded-2xl text-gray-700 dark:text-gray-200 bg-main-light dark:bg-main-dark shadow-neu-pressed dark:shadow-neu-pressed-dark outline-none placeholder-gray-400 dark:placeholder-gray-600"
              data-testid="token-address-input"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tip: paste the ERC20 contract address. Decimals & symbol will be auto-detected if valid.
              </p>
              {tokenInfo && (
                <p className="text-xs text-green-600">
                  ✅ {tokenInfo.symbol} · {tokenInfo.decimals} decimals
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Balance Display */}
        {account && (
          <motion.div
            className="mb-6 rounded-2xl p-4 bg-main-light dark:bg-main-dark shadow-neu-pressed dark:shadow-neu-pressed-dark"
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Your Balance:</span>
              <span className="text-gray-800 dark:text-gray-200 font-semibold text-lg" data-testid="balance-display">
                {balance} {sendType === "token" && tokenInfo ? tokenInfo.symbol : networkSymbol}
              </span>
            </div>
          </motion.div>
        )}

        {/* Recipients Input */}
        {account && (
          <motion.div className="mb-6" variants={fadeInUpVariants}>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Recipients (Format: address,amount — one per line)
            </label>
            <textarea
              className="w-full p-3 md:p-4 rounded-2xl font-mono text-xs md:text-sm bg-main-light dark:bg-main-dark shadow-neu-pressed dark:shadow-neu-pressed-dark outline-none placeholder-gray-400 dark:placeholder-gray-600 text-gray-700 dark:text-gray-200 resize-none"
              placeholder={"0xaddress1,0.01\n0xaddress2,0.02\n0xaddress3,0.03"}
              rows="8"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              data-testid="recipients-input"
            ></textarea>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2 text-sm text-gray-600 dark:text-gray-400 gap-2">
              <div>
                Total Recipients: <span className="text-cyan-600 font-semibold">{validCount}</span>
                {invalidCount > 0 && <span className="text-xs text-red-500 ml-2">({invalidCount} invalid line{invalidCount > 1 ? "s" : ""})</span>}
              </div>
              <div>
                Total Amount:{" "}
                <span className="text-cyan-600 font-semibold">
                  {getTotalAmount()} {sendType === "token" && tokenInfo ? tokenInfo.symbol : networkSymbol}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Hint: addresses must be checksummed 0x... and amounts are decimals. Invalid lines are ignored.
            </p>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            className="mb-6 rounded-2xl p-3 flex items-start gap-2"
            style={{
              background: "rgba(255, 240, 240, 0.9)",
              border: "1px solid rgba(220, 30, 60, 0.12)",
              boxShadow: "inset 4px 4px 8px rgba(190,190,190,0.25), inset -4px -4px 8px rgba(255,255,255,0.9)"
            }}
          >
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Send Button */}
        {account && (
          <motion.button
            onClick={executeMultisend}
            disabled={loading || parseRecipients().length === 0}
            className={`w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${loading || parseRecipients().length === 0
                ? "bg-main-light dark:bg-main-dark text-gray-400 shadow-neu-pressed dark:shadow-neu-pressed-dark"
                : "bg-main-light dark:bg-main-dark text-green-700 dark:text-green-400 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark"
              }`}
            data-testid="send-multisend-btn"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Send size={18} />
                Execute Multisend ({parseRecipients().length})
              </>
            )}
          </motion.button>
        )}

        {/* Transaction Results */}
        {txResults.length > 0 && (
          <motion.div
            className="mt-6 rounded-2xl p-4 bg-main-light dark:bg-main-dark shadow-neu-pressed dark:shadow-neu-pressed-dark"
          >
            <h3 className="text-gray-700 dark:text-gray-200 font-semibold mb-3 flex items-center gap-2">
              <CheckCircle size={18} />
              Transaction Results
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {txResults.map((result, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl"
                  style={{
                    background:
                      result.status === "success"
                        ? "linear-gradient(180deg,#f2fff6,#e9fff0)"
                        : result.status === "failed"
                          ? "linear-gradient(180deg,#fff2f2,#ffecec)"
                          : "linear-gradient(180deg,#fff9eb,#fff6df)",
                    border:
                      result.status === "success"
                        ? "1px solid rgba(34,197,94,0.12)"
                        : result.status === "failed"
                          ? "1px solid rgba(220,38,38,0.12)"
                          : "1px solid rgba(234,179,8,0.12)"
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-gray-700 font-mono break-all">{result.address}</p>
                      <p className="text-sm mt-1 text-gray-700">
                        Amount: <span className="text-cyan-600 font-semibold">{result.amount}</span>
                      </p>
                      {result.hash && (
                        <a
                          href={`${explorer}/tx/${result.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-500 flex items-center gap-1 mt-1"
                        >
                          View TX <ExternalLink size={12} />
                        </a>
                      )}
                      {result.error && <p className="text-xs text-red-600 mt-1">{result.error}</p>}
                    </div>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded"
                      style={{
                        background:
                          result.status === "success"
                            ? "#10B981"
                            : result.status === "failed"
                              ? "#EF4444"
                              : "#F59E0B",
                        color: "#ffffff"
                      }}
                    >
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default MultisendTool;
