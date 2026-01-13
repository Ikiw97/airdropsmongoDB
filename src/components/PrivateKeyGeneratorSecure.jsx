import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  AlertTriangle,
  Eye,
  EyeOff,
  Shield,
  Clock,
  Lock,
  Download,
  Trash2,
} from "lucide-react";
import {
  downloadEncryptedFile,
  requestSecurityConfirmation,
  preventScreenCapture,
  secureSensitiveFields,
} from "../utils/securityUtils";
import { useSecurityContext } from "../contexts/SecurityContext";

const PrivateKeyGeneratorSecure = () => {
  const [generatedKeys, setGeneratedKeys] = useState([]);
  const [hideKeys, setHideKeys] = useState(true);
  const [quantityToGenerate, setQuantityToGenerate] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [exportPassword, setExportPassword] = useState("");
  const [autoClearCountdown, setAutoClearCountdown] = useState(null);

  const { logActivity, getSessionStatus } = useSecurityContext();
  const [sessionStatus, setSessionStatus] = useState(null);
  const autoClearTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // DevTools detection and blocking
  useEffect(() => {
    const blockDevTools = (e) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        alert('🔒 DevTools is blocked for security reasons in Key Generator');
        return false;
      }
    };

    const detectDevTools = () => {
      const threshold = 160;
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        // DevTools detected - clear all keys immediately
        if (generatedKeys.length > 0) {
          setGeneratedKeys([]);
          logActivity('KEYS_CLEARED_DEVTOOLS', { reason: 'DevTools detected' }, 'critical');
          alert('🚨 Security Alert: Keys cleared due to DevTools detection');
        }
      }
    };

    document.addEventListener('keydown', blockDevTools, true);
    const devToolsInterval = setInterval(detectDevTools, 500);

    return () => {
      document.removeEventListener('keydown', blockDevTools, true);
      clearInterval(devToolsInterval);
    };
  }, [generatedKeys, logActivity]);

  // Auto-clear keys after 5 minutes
  useEffect(() => {
    if (generatedKeys.length > 0) {
      // Start 5 minute countdown
      setAutoClearCountdown(300); // 300 seconds = 5 minutes

      countdownIntervalRef.current = setInterval(() => {
        setAutoClearCountdown(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      autoClearTimerRef.current = setTimeout(() => {
        setGeneratedKeys([]);
        setAutoClearCountdown(null);
        logActivity('KEYS_AUTO_CLEARED', { reason: '5 minute timeout' }, 'critical');
        alert('🔒 Security: Keys have been automatically cleared after 5 minutes');
      }, 5 * 60 * 1000); // 5 minutes

      return () => {
        if (autoClearTimerRef.current) clearTimeout(autoClearTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      };
    } else {
      setAutoClearCountdown(null);
    }
  }, [generatedKeys.length, logActivity]);

  useEffect(() => {
    preventScreenCapture();
    secureSensitiveFields();
    return () => setGeneratedKeys([]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionStatus(getSessionStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, [getSessionStatus]);

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
      return null;
    }
  };

  const handleGenerateKeys = async () => {
    const confirmed = await requestSecurityConfirmation(
      "CONFIRM GENERATION",
      `Generate ${quantityToGenerate} keys locally?`
    );
    if (!confirmed) return;

    setIsGenerating(true);
    setTimeout(() => {
      const newKeys = [];
      for (let i = 0; i < quantityToGenerate; i++) {
        const key = generatePrivateKey();
        if (key) newKeys.push(key);
      }
      setGeneratedKeys(newKeys);
      setIsGenerating(false);
      logActivity("KEYS_GENERATED", { count: newKeys.length }, "info");
    }, 500);
  };

  const downloadEncrypted = async () => {
    if (!exportPassword) return alert("Password required");
    await downloadEncryptedFile(generatedKeys, "keys-encrypted.json", exportPassword);
  };

  return (
    <div className="w-full mb-6">
      {/* Security Header */}
      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg mb-6 flex items-start gap-3">
        <AlertTriangle className="text-red-500 shrink-0" />
        <div>
          <h3 className="text-red-500 font-bold text-sm tracking-wider uppercase">Maximum Security Environment</h3>
          <p className="text-red-400 text-xs mt-1">
            Offline generation. Keys never leave this browser. Session auto-wipes in {sessionStatus ? Math.floor(sessionStatus.timeRemaining / 60000) : "30"}m.
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div
        className="p-6 rounded-lg mb-6 transition-all duration-300"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
      >
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs text-gray-500 mb-2 font-semibold uppercase">Quantity</label>
            <input
              type="number"
              min="1" max="50"
              value={quantityToGenerate}
              onChange={(e) => setQuantityToGenerate(e.target.value)}
              className="w-full transition-all duration-300 rounded p-3 outline-none bg-slate-100 dark:bg-[#010409] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800"
            />
          </div>
          <button
            onClick={handleGenerateKeys}
            disabled={isGenerating}
            className="w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? <Lock className="animate-pulse" /> : <Shield />}
            GENERATE KEYS
          </button>
        </div>
      </div>

      {/* Results - Terminal Style */}
      <AnimatePresence>
        {generatedKeys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg overflow-hidden border transition-all duration-300 bg-slate-100 dark:bg-[#010409] border-gray-200 dark:border-gray-800"
          >
            <div className="px-4 py-2 flex justify-between items-center" style={{ background: "var(--bg-secondary)" }}>
              <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>SECURE_OUTPUT_LOG</span>
              <div className="flex gap-2">
                <button onClick={() => setHideKeys(!hideKeys)} className="text-gray-400 hover:text-white">
                  {hideKeys ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => setGeneratedKeys([])} className="text-red-400 hover:text-red-300">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              {generatedKeys.map((k, i) => (
                <div key={k.id} className="font-mono text-sm pb-4 last:border-0 border-b" style={{ borderBottomColor: "var(--border-primary)" }}>
                  <div className="text-gray-500 text-xs mb-1">KEY_INDEX_0{i + 1}</div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    <div className="md:col-span-2 text-gray-400">Address:</div>
                    <div className="md:col-span-10 text-green-400 break-all">{k.address}</div>

                    <div className="md:col-span-2 text-gray-400">Private Key:</div>
                    <div className="md:col-span-10 text-red-400 break-all select-all">
                      {hideKeys ? "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••" : k.privateKey}
                    </div>

                    <div className="md:col-span-2 text-gray-400">Mnemonic:</div>
                    <div className="md:col-span-10 text-yellow-400 break-all select-all">
                      {hideKeys ? "•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••" : k.mnemonic}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 p-4 border-t border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                {showExportPassword ? (
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Encryption Password"
                      className="transition-all duration-300 rounded px-3 py-2 text-sm flex-1 outline-none bg-slate-100 dark:bg-[#010409] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800"
                      value={exportPassword}
                      onChange={(e) => setExportPassword(e.target.value)}
                    />
                    <button onClick={downloadEncrypted} className="px-4 py-2 bg-green-600 text-white rounded text-sm font-bold">Download</button>
                  </div>
                ) : (
                  <button onClick={() => setShowExportPassword(true)} className="text-sm text-green-400 hover:underline flex items-center gap-2">
                    <Lock size={14} /> Encrypt & Download JSON
                  </button>
                )}
              </div>
              {autoClearCountdown !== null && (
                <div className="flex items-center gap-2 text-xs text-red-400 animate-pulse">
                  <Clock size={12} />
                  <span>Auto-clear in {Math.floor(autoClearCountdown / 60)}:{String(autoClearCountdown % 60).padStart(2, '0')}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrivateKeyGeneratorSecure;
