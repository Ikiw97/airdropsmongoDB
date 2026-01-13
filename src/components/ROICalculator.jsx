import React, { useState, useEffect } from "react";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
  Save,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ROICalculator = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [formData, setFormData] = useState({
    projectName: "",
    gasSpent: "",
    timeInvested: "",
    expectedValue: "",
    probability: "50",
  });
  const [result, setResult] = useState(null);
  const [savedCalculations, setSavedCalculations] = useState([]);

  // Historical Airdrops
  const historicalAirdrops = [
    { name: "Uniswap", avgReturn: 12000, probability: 100 },
    { name: "dYdX", avgReturn: 8000, probability: 85 },
    { name: "Optimism", avgReturn: 5000, probability: 90 },
    { name: "Arbitrum", avgReturn: 3500, probability: 95 },
    { name: "Aptos", avgReturn: 2000, probability: 70 },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("roi_calculations");
    if (saved) setSavedCalculations(JSON.parse(saved));
  }, []);

  const calculateROI = () => {
    const gas = parseFloat(formData.gasSpent) || 0;
    const time = parseFloat(formData.timeInvested) || 0;
    const expected = parseFloat(formData.expectedValue) || 0;
    const prob = parseFloat(formData.probability) || 50;
    const timeValue = time * 20;
    const totalInvestment = gas + timeValue;
    const adjustedExpected = (expected * prob) / 100;
    const profit = adjustedExpected - totalInvestment;
    const roiPercentage = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;

    let riskLevel = "Low";
    if (roiPercentage < 0) riskLevel = "High";
    else if (roiPercentage < 100) riskLevel = "Medium";

    const resultData = {
      totalInvestment: totalInvestment.toFixed(2),
      expectedReturn: adjustedExpected.toFixed(2),
      profit: profit.toFixed(2),
      roiPercentage: roiPercentage.toFixed(2),
      riskLevel,
      projectName: formData.projectName || "Unnamed Project",
      timestamp: new Date().toISOString(),
    };
    setResult(resultData);
  };

  const saveCalculation = () => {
    if (!result) return;
    const newCalculations = [result, ...savedCalculations].slice(0, 10);
    setSavedCalculations(newCalculations);
    localStorage.setItem("roi_calculations", JSON.stringify(newCalculations));
  };

  const deleteCalculation = (index) => {
    const updated = savedCalculations.filter((_, i) => i !== index);
    setSavedCalculations(updated);
    localStorage.setItem("roi_calculations", JSON.stringify(updated));
  };

  return (
    <div className="w-full mb-6">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-primary)",
          color: "var(--text-primary)"
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Calculator size={20} />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>ROI Calculator</h2>
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
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Column: Inputs */}
              <div className="lg:col-span-8 space-y-4">
                <div
                  className="p-5 rounded-lg transition-all duration-300"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
                >
                  <h3 className="text-sm font-semibold mb-4 border-b pb-2 transition-all duration-300" style={{ color: "var(--text-secondary)", borderBottomColor: "var(--border-primary)" }}>Investment Parameters</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={formData.projectName}
                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        className="w-full transition-all duration-300 rounded p-2 text-sm outline-none bg-slate-100 dark:bg-[#010409] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800"
                        placeholder="e.g. LayerZero"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Expected Value ($)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.expectedValue}
                          onChange={(e) => setFormData({ ...formData, expectedValue: e.target.value })}
                          className="w-full transition-all duration-300 rounded p-2 pl-6 text-sm outline-none bg-slate-100 dark:bg-[#010409] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Gas Spent ($)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.gasSpent}
                          onChange={(e) => setFormData({ ...formData, gasSpent: e.target.value })}
                          className="w-full transition-all duration-300 rounded p-2 pl-6 text-sm outline-none bg-slate-100 dark:bg-[#010409] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Time Invested (Hours)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500"><Clock size={14} /></span>
                        <input
                          type="number"
                          value={formData.timeInvested}
                          onChange={(e) => setFormData({ ...formData, timeInvested: e.target.value })}
                          className="w-full transition-all duration-300 rounded p-2 pl-8 text-sm outline-none bg-slate-100 dark:bg-[#010409] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between mb-1">
                      <label className="text-xs text-gray-500">Success Probability</label>
                      <span className="text-xs font-bold text-cyan-400">{formData.probability}%</span>
                    </div>
                    <input
                      type="range"
                      min="0" max="100"
                      value={formData.probability}
                      onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                      className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-cyan-500 transition-all duration-300 bg-slate-200 dark:bg-[#010409]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={calculateROI}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded font-semibold text-sm transition"
                    >
                      Calculate ROI
                    </button>
                    <button
                      onClick={() => setFormData({ projectName: "", gasSpent: "", timeInvested: "", expectedValue: "", probability: "50" })}
                      className="px-4 transition-all duration-300 py-2 rounded font-semibold text-sm hover:opacity-80 transition bg-slate-100 dark:bg-[#010409] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Results Section */}
                {result && (
                  <div
                    className="p-5 rounded-lg transition-all duration-300"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Analysis Results</h3>
                      <button onClick={saveCalculation} className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
                        <Save size={14} /> Save
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 rounded border bg-slate-100 dark:bg-[#010409] border-gray-200 dark:border-gray-800">
                        <span className="text-xs text-gray-500">Total Cost</span>
                        <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>${result.totalInvestment}</p>
                      </div>
                      <div className="p-3 rounded border bg-slate-100 dark:bg-[#010409] border-gray-200 dark:border-gray-800">
                        <span className="text-xs text-gray-500">Net Profit</span>
                        <p className={`text-lg font-bold ${parseFloat(result.profit) >= 0 ? "text-green-500" : "text-red-500"}`}>
                          ${result.profit}
                        </p>
                      </div>
                      <div className="p-3 rounded border bg-slate-100 dark:bg-[#010409] border-gray-200 dark:border-gray-800">
                        <span className="text-xs text-gray-500">ROI</span>
                        <p className={`text-lg font-bold ${parseFloat(result.roiPercentage) >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {result.roiPercentage}%
                        </p>
                      </div>
                      <div className="p-3 rounded border bg-slate-100 dark:bg-[#010409] border-gray-200 dark:border-gray-800">
                        <span className="text-xs text-gray-500">Risk</span>
                        <p className={`text-lg font-bold ${result.riskLevel === "Low" ? "text-green-500" :
                          result.riskLevel === "Medium" ? "text-yellow-500" : "text-red-500"
                          }`}>
                          {result.riskLevel}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Historical & Saved */}
              <div className="lg:col-span-4 space-y-4">
                {/* Historical Table */}
                <div
                  className="p-4 rounded-lg h-full transition-all duration-300"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
                >
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Historical Benchmarks</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-gray-500" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                          <th className="pb-2">Project</th>
                          <th className="pb-2 text-right">Avg $</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historicalAirdrops.map((item, i) => (
                          <tr
                            key={i}
                            className="last:border-0 cursor-pointer transition-colors duration-300 hover:opacity-70"
                            style={{ borderBottom: "1px solid var(--border-primary)" }}
                            onClick={() => setFormData({ ...formData, projectName: item.name, expectedValue: item.avgReturn, probability: item.probability })}
                          >
                            <td className="py-2 text-cyan-400 font-medium">{item.name}</td>
                            <td className="py-2 text-right" style={{ color: "var(--text-primary)" }}>${item.avgReturn}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Saved Calculations */}
                {savedCalculations.length > 0 && (
                  <div
                    className="p-4 rounded-lg transition-all duration-300"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
                  >
                    <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Saved</h3>
                    <div className="space-y-2">
                      {savedCalculations.map((calc, i) => (
                        <div key={i} className="flex justify-between items-center p-2 rounded border bg-slate-100 dark:bg-[#010409] border-gray-200 dark:border-gray-800">
                          <div>
                            <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{calc.projectName}</p>
                            <p className={`text-[10px] ${parseFloat(calc.profit) >= 0 ? "text-green-500" : "text-red-500"}`}>
                              ${calc.profit} ({calc.roiPercentage}%)
                            </p>
                          </div>
                          <button onClick={() => deleteCalculation(i)} className="transition-all duration-300 p-1 rounded-md" style={{ color: 'var(--text-secondary)' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ROICalculator;
