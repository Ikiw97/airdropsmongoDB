// FULL CODE FINAL — React ROI Calculator Neumorphic
// Clean, Rapi, Konsisten Neumorphism (#e0e5ec)

import React, { useState } from "react";
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
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const neuBase = "bg-[#e0e5ec] text-[#555]";
const neuCard = `${neuBase} rounded-3xl shadow-[9px_9px_16px_rgba(163,177,198,0.6),_-9px_-9px_16px_rgba(255,255,255,0.5)]`;
const neuInset = `${neuBase} shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),_inset_-6px_-6px_12px_rgba(255,255,255,0.5)]`;
const neuButton = `${neuBase} rounded-2xl shadow-[6px_6px_12px_rgba(163,177,198,0.6),_-6px_-6px_12px_rgba(255,255,255,0.5)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),_inset_-4px_-4px_8px_rgba(255,255,255,0.5)]`;

export default function ROICalculator() {
  const [electricityCost, setElectricityCost] = useState(0.15);
  const [rigCost, setRigCost] = useState(1200);
  const [hashrate, setHashrate] = useState(120);
  const [watt, setWatt] = useState(1200);
  const [coinPrice, setCoinPrice] = useState(3000);
  const [reward, setReward] = useState(0.002);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const dailyRevenue = reward * coinPrice;
  const dailyCost = (watt / 1000) * 24 * electricityCost;
  const dailyProfit = dailyRevenue - dailyCost;
  const roiDays = dailyProfit > 0 ? rigCost / dailyProfit : 0;

  const chartData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    profit: dailyProfit * (i + 1),
  }));

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 items-center bg-[#e0e5ec]">
      {/* Header */}
      <div className={`${neuCard} w-full max-w-4xl p-6 flex items-center gap-3`}> 
        <Calculator size={32} className="text-[#666]" />
        <h1 className="text-2xl font-semibold">Mining ROI Calculator — Neumorphism</h1>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl">

        {/* Input Card */}
        <div className={`${neuCard} p-6 space-y-4`}>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <SettingsIcon />
            Input Parameters
          </h2>

          {/* Electricity */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Electricity Cost ($/kWh)</label>
            <input
              type="number"
              className={`${neuInset} w-full p-3 rounded-xl`}
              value={electricityCost}
              onChange={(e) => setElectricityCost(parseFloat(e.target.value))}
            />
          </div>

          {/* Rig Cost */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Rig Cost ($)</label>
            <input
              type="number"
              className={`${neuInset} w-full p-3 rounded-xl`}
              value={rigCost}
              onChange={(e) => setRigCost(parseFloat(e.target.value))}
            />
          </div>

          {/* Hashrate */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Hashrate (MH/s)</label>
            <input
              type="number"
              className={`${neuInset} w-full p-3 rounded-xl`}
              value={hashrate}
              onChange={(e) => setHashrate(parseFloat(e.target.value))}
            />
          </div>

          {/* Watt */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Power (Watt)</label>
            <input
              type="number"
              className={`${neuInset} w-full p-3 rounded-xl`}
              value={watt}
              onChange={(e) => setWatt(parseFloat(e.target.value))}
            />
          </div>

          {/* Coin Price */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Coin Price ($)</label>
            <input
              type="number"
              className={`${neuInset} w-full p-3 rounded-xl`}
              value={coinPrice}
              onChange={(e) => setCoinPrice(parseFloat(e.target.value))}
            />
          </div>

          {/* Reward */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Daily Reward (Coin)</label>
            <input
              type="number"
              className={`${neuInset} w-full p-3 rounded-xl`}
              value={reward}
              onChange={(e) => setReward(parseFloat(e.target.value))}
            />
          </div>

          {/* Advanced Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`${neuButton} mt-4 w-full py-3 font-semibold flex items-center justify-center gap-2`}
          >
            {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            Advanced Options
          </button>

          {showAdvanced && (
            <div className={`${neuInset} p-4 rounded-xl mt-3`}>
              <p className="text-sm">(Coming Soon) Custom difficulty, network hashrate, block time.</p>
            </div>
          )}
        </div>

        {/* Output Card */}
        <div className={`${neuCard} p-6 space-y-6`}>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp />
            Results
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <InfoBox icon={<DollarSign />} label="Daily Revenue" value={`$${dailyRevenue.toFixed(2)}`} />
            <InfoBox icon={<Zap />} label="Daily Cost" value={`$${dailyCost.toFixed(2)}`} />
            <InfoBox icon={<Calculator />} label="Daily Profit" value={`$${dailyProfit.toFixed(2)}`} />
            <InfoBox icon={<Clock />} label="ROI Days" value={`${roiDays.toFixed(0)} days`} />
          </div>

          {/* Chart */}
          <div className={`${neuInset} p-4 rounded-2xl w-full h-72`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="day" stroke="#777" />
                <YAxis stroke="#777" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="#777" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div className={`${neuInset} rounded-2xl p-4 flex flex-col items-start`}>
      <div className="flex items-center gap-2 text-[#666]">{icon} <span className="font-medium">{label}</span></div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}

function SettingsIcon() {
  return <Info className="text-[#666]" />;
}
