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
import { motion } from "framer-motion";
import { containerVariants, fadeInUpVariants, itemVariants, buttonHoverVariants } from "../utils/animationVariants";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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
    { name: "zkSync", avgReturn: 1500, probability: 60 },
    { name: "Blur", avgReturn: 4000, probability: 75 },
    { name: "Celestia", avgReturn: 3000, probability: 65 },
  ];

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("roi_calculations");
    if (saved) setSavedCalculations(JSON.parse(saved));
  }, []);

  // =============================
  //       CALCULATE ROI
  // =============================
  const calculateROI = () => {
    const gas = parseFloat(formData.gasSpent) || 0;
    const time = parseFloat(formData.timeInvested) || 0;
    const expected = parseFloat(formData.expectedValue) || 0;
    const prob = parseFloat(formData.probability) || 50;

    const timeValue = time * 20;
    const totalInvestment = gas + timeValue;
    const adjustedExpected = (expected * prob) / 100;
    const profit = adjustedExpected - totalInvestment;
    const roiPercentage =
      totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;

    let riskLevel = "Low";
    let riskColor = "text-green-500";

    if (roiPercentage < 0) {
      riskLevel = "High";
      riskColor = "text-red-500";
    } else if (roiPercentage < 100) {
      riskLevel = "Medium";
      riskColor = "text-yellow-500";
    }

    const scenarios = [
      { name: "Pessimistic", value: adjustedExpected * 0.3 },
      { name: "Realistic", value: adjustedExpected },
      { name: "Optimistic", value: adjustedExpected * 2 },
    ];

    const resultData = {
      totalInvestment: totalInvestment.toFixed(2),
      expectedReturn: adjustedExpected.toFixed(2),
      profit: profit.toFixed(2),
      roiPercentage: roiPercentage.toFixed(2),
      breakEvenValue: totalInvestment.toFixed(2),
      riskLevel,
      riskColor,
      scenarios,
      projectName: formData.projectName || "Unnamed Project",
      timestamp: new Date().toISOString(),
    };

    setResult(resultData);
  };

  // Save
  const saveCalculation = () => {
    if (!result) return;

    const newCalculations = [result, ...savedCalculations].slice(0, 10);
    setSavedCalculations(newCalculations);
    localStorage.setItem("roi_calculations", JSON.stringify(newCalculations));
  };

  // Delete
  const deleteCalculation = (index) => {
    const updated = savedCalculations.filter((_, i) => i !== index);
    setSavedCalculations(updated);
    localStorage.setItem("roi_calculations", JSON.stringify(updated));
  };

  return (
    <motion.div
      className="relative z-10 w-full mb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >

      {/* HEADER */}
      <motion.div
        className="bg-main-light dark:bg-main-dark rounded-3xl shadow-neu-flat dark:shadow-neu-flat-dark p-6 transition-all hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark flex justify-between items-center"
        variants={fadeInUpVariants}
      >
        <motion.h2
          className="text-2xl font-bold flex items-center gap-2 text-gray-700 dark:text-gray-200"
          variants={itemVariants}
        >
          <Calculator size={26} className="text-cyan-500" /> ROI Calculator
        </motion.h2>

        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-main-light dark:bg-main-dark rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark transition text-gray-700 dark:text-gray-300 font-semibold px-4 py-2 flex items-center gap-2"
          variants={buttonHoverVariants}
          whileHover="hover"
          whileTap="tap"
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {isExpanded ? "Collapse" : "Expand"}
        </motion.button>
      </motion.div>

      {/* BODY */}
      {isExpanded && (
        <motion.div
          className="bg-main-light dark:bg-main-dark rounded-3xl shadow-neu-flat dark:shadow-neu-flat-dark p-6 transition-all mt-4 space-y-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >

          {/* INFO BANNER */}
          <motion.div
            className="rounded-2xl p-4 flex items-start gap-3 text-gray-700 dark:text-gray-300 shadow-neu-pressed dark:shadow-neu-pressed-dark"
            variants={fadeInUpVariants}
          >
            <Info className="text-cyan-500 mt-0.5" size={20} />
            <p className="text-sm">
              💡 <b>How it works:</b> Enter your gas, time, and expected value.
              Time is valued at <b>$20/hour</b>.
            </p>
          </motion.div>

          {/* INPUT AREA */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            variants={containerVariants}
          >

            {/* LEFT INPUTS */}
            <motion.div
              className="space-y-4"
              variants={containerVariants}
            >
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Input Data</h3>

              <motion.div className="space-y-4">
                {[
                  { label: "Project Name", key: "projectName", placeholder: "zkSync, LayerZero" },
                  { label: "💰 Gas Spent (USD)", key: "gasSpent", placeholder: "150" },
                  { label: "⏱️ Time Invested (Hours)", key: "timeInvested", placeholder: "5" },
                  { label: "🎯 Expected Airdrop Value (USD)", key: "expectedValue", placeholder: "3000" },
                ].map((f, idx) => (
                  <motion.div key={f.key} variants={itemVariants}>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {f.label}
                    </label>
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      value={formData[f.key]}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.key]: e.target.value })
                      }
                      className="w-full bg-main-light dark:bg-main-dark rounded-xl px-4 py-3 shadow-neu-pressed dark:shadow-neu-pressed-dark text-gray-700 dark:text-gray-200 outline-none placeholder-gray-400 dark:placeholder-gray-600"
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* PROBABILITY */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                  📊 Success Probability: {formData.probability}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) =>
                    setFormData({ ...formData, probability: e.target.value })
                  }
                  className="w-full accent-cyan-500"
                />
              </motion.div>

              {/* BUTTONS */}
              <motion.div className="flex gap-3" variants={containerVariants}>
                <motion.button
                  onClick={calculateROI}
                  className="bg-main-light dark:bg-main-dark rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark transition text-gray-700 dark:text-gray-300 font-semibold flex-1 py-3 flex items-center justify-center gap-2 text-cyan-600"
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Calculator size={18} /> Calculate ROI
                </motion.button>

                <motion.button
                  onClick={() =>
                    setFormData({
                      projectName: "",
                      gasSpent: "",
                      timeInvested: "",
                      expectedValue: "",
                      probability: "50",
                    })
                  }
                  className="bg-main-light dark:bg-main-dark rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark transition text-gray-700 dark:text-gray-300 font-semibold px-6 py-3"
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Clear
                </motion.button>
              </motion.div>
            </motion.div>

            {/* RIGHT SIDE – HISTORICAL TABLE */}
            <motion.div
              className="rounded-3xl p-4 overflow-y-auto shadow-neu-pressed dark:shadow-neu-pressed-dark"
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
            >
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Historical Airdrops
              </h3>

              <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-500">
                    <th className="p-2 text-left">Project</th>
                    <th className="p-2 text-right">Avg Return</th>
                    <th className="p-2 text-right">Success %</th>
                  </tr>
                </thead>

                <tbody>
                  {historicalAirdrops.map((air, i) => (
                    <motion.tr
                      key={i}
                      className="hover:bg-[#d9dee5] cursor-pointer transition rounded-lg"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          projectName: air.name,
                          expectedValue: air.avgReturn.toString(),
                          probability: air.probability.toString(),
                        })
                      }
                      variants={itemVariants}
                      whileHover={{ x: 5 }}
                    >
                      <td className="p-2 font-medium">{air.name}</td>
                      <td className="p-2 text-right">${air.avgReturn}</td>
                      <td className="p-2 text-right text-cyan-600">
                        {air.probability}%
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.div>

          {/* RESULTS */}
          {result && (
            <motion.div
              className="space-y-6"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div className="flex justify-between items-center" variants={itemVariants}>
                <h3 className="text-xl font-bold text-gray-600 dark:text-gray-200">Results</h3>

                <motion.button
                  onClick={saveCalculation}
                  className="bg-main-light dark:bg-main-dark rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark transition text-gray-700 dark:text-gray-300 font-semibold px-5 py-2 flex items-center gap-2 text-cyan-600"
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Save size={16} /> Save
                </motion.button>
              </motion.div>

              {/* CARDS */}
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" variants={containerVariants}>
                {[
                  { label: "Investment", value: `$${result.totalInvestment}`, icon: DollarSign },
                  { label: "Expected", value: `$${result.expectedReturn}`, icon: TrendingUp },
                  {
                    label: "Profit",
                    value: `$${result.profit}`,
                    icon: Zap,
                    color: parseFloat(result.profit) >= 0 ? "text-green-500" : "text-red-500",
                  },
                  {
                    label: "ROI",
                    value: `${result.roiPercentage}%`,
                    icon: TrendingUp,
                    color: parseFloat(result.roiPercentage) >= 0 ? "text-purple-500" : "text-red-500",
                  },
                ].map((card, i) => (
                  <motion.div key={i} className="bg-main-light dark:bg-main-dark rounded-3xl shadow-neu-flat dark:shadow-neu-flat-dark p-6 transition-all hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark" variants={itemVariants}>
                    <div className="flex items-center gap-2">
                      <card.icon
                        size={26}
                        className={card.color || "text-cyan-500"}
                      />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{card.label}</p>
                    </div>

                    <p
                      className={`text-2xl font-bold ${card.color || "text-gray-700 dark:text-gray-200"
                        }`}
                    >
                      {card.value}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* RISK LEVEL */}
              <motion.div className="bg-main-light dark:bg-main-dark rounded-3xl shadow-neu-flat dark:shadow-neu-flat-dark p-6 transition-all hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark flex items-center gap-3 text-gray-700 dark:text-gray-200" variants={itemVariants}>
                <Info className={result.riskColor} size={24} />
                <div>
                  <p className="font-semibold">
                    Risk Level:{" "}
                    <span className={result.riskColor}>
                      {result.riskLevel}
                    </span>
                  </p>
                  <p className="text-sm">
                    Break-even: ${result.breakEvenValue} | $20/hr time value
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* SAVED LIST */}
          {savedCalculations.length > 0 && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-3">
                Saved Calculations
              </h3>

              <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={containerVariants}>
                {savedCalculations.map((calc, i) => (
                  <motion.div key={i} className="bg-main-light dark:bg-main-dark rounded-3xl shadow-neu-flat dark:shadow-neu-flat-dark p-6 transition-all hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark" variants={itemVariants}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-200">
                          {calc.projectName}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(calc.timestamp).toLocaleString()}
                        </p>
                      </div>

                      <motion.button
                        onClick={() => deleteCalculation(i)}
                        className="text-red-400 hover:text-red-500"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>

                    <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                      <p>
                        Investment:{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                          ${calc.totalInvestment}
                        </span>
                      </p>

                      <p>
                        ROI:{" "}
                        <span
                          className={`font-semibold ${parseFloat(calc.roiPercentage) >= 0
                            ? "text-green-500"
                            : "text-red-500"
                            }`}
                        >
                          {calc.roiPercentage}%
                        </span>
                      </p>

                      <p>
                        Profit:{" "}
                        <span
                          className={`font-semibold ${parseFloat(calc.profit) >= 0
                            ? "text-green-500"
                            : "text-red-500"
                            }`}
                        >
                          ${calc.profit}
                        </span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )
      }
    </motion.div >
  );
};

export default ROICalculator;
