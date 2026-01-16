import React, { useState, useMemo } from 'react';
import { ExternalLink, Search, ChevronDown, ChevronUp, Link as LinkIcon, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEX_DATA = {
  evm: {
    amm_spot: [
      { chain: "Ethereum", dex: "Uniswap", url: "https://uniswap.org", logo: "/dex/uniswap.png" },
      { chain: "Ethereum", dex: "SushiSwap", url: "https://sushi.com", logo: "/dex/sushiswap.png" },
      { chain: "BNB Chain", dex: "PancakeSwap", url: "https://pancakeswap.finance", logo: "/dex/pancakeswap.png" },
      { chain: "Polygon", dex: "QuickSwap", url: "https://quickswap.exchange", logo: "/dex/quickswap.png" },
      { chain: "Arbitrum", dex: "Camelot", url: "https://camelot.exchange", logo: "https://icons.llamao.fi/icons/protocols/camelot" },
      { chain: "Avalanche", dex: "Trader Joe", url: "https://traderjoexyz.com", logo: "https://icons.llamao.fi/icons/protocols/trader-joe" },
      { chain: "Fantom", dex: "SpookySwap", url: "https://spooky.fi", logo: "https://icons.llamao.fi/icons/protocols/spookyswap" }
    ],
    perpetual: [
      { chain: "Arbitrum", dex: "GMX", url: "https://gmx.io", logo: "https://icons.llamao.fi/icons/protocols/gmx" },
      { chain: "Arbitrum", dex: "Gains Network", url: "https://gains.network", logo: "https://icons.llamao.fi/icons/protocols/gains-network" },
      { chain: "Optimism", dex: "Kwenta", url: "https://kwenta.io", logo: "https://icons.llamao.fi/icons/protocols/kwenta" },
    ]
  },
  solana: {
    amm_spot: [
      { dex: "Raydium", url: "https://raydium.io", logo: "/dex/raydium.png" },
      { dex: "Jupiter", url: "https://jup.ag", logo: "https://icons.llamao.fi/icons/protocols/jupiter" },
      { dex: "Orca", url: "https://orca.so", logo: "https://icons.llamao.fi/icons/protocols/orca" }
    ]
  }
};

const BRIDGE_DATA = {
  "Multi-Chain": [
    { name: "LayerZero", url: "https://layerzero.network", logo: "https://icons.llamao.fi/icons/protocols/layerzero" },
    { name: "Stargate", url: "https://stargate.finance", logo: "https://icons.llamao.fi/icons/protocols/stargate" },
    { name: "Orbiter", url: "https://orbiter.finance", logo: "https://icons.llamao.fi/icons/protocols/orbiter" },
    { name: "Bungee", url: "https://bungee.exchange", logo: "https://icons.llamao.fi/icons/protocols/bungee" },
    { name: "Jumper", url: "https://jumper.exchange", logo: "https://icons.llamao.fi/icons/protocols/jumper-exchange" },
    { name: "Owlto", url: "https://owlto.finance", logo: "https://icons.llamao.fi/icons/protocols/owlto" }
  ]
};

const DexBridgePanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dex'); // dex, bridge

  const filterItems = (data) => {
    let results = [];
    Object.entries(data).forEach(([cat, items]) => {
      // Flatten for search
      if (Array.isArray(items)) {
        items.forEach(item => results.push({ ...item, category: cat }));
      } else {
        // Nested like EVM -> amm_spot
        Object.entries(items).forEach(([subcat, subitems]) => {
          subitems.forEach(item => results.push({ ...item, category: subcat, chain: item.chain || cat }));
        });
      }
    });

    if (!searchTerm) return results;
    return results.filter(item =>
      (item.dex || item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.chain || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const dexList = useMemo(() => filterItems(DEX_DATA), [searchTerm]);
  const bridgeList = useMemo(() => filterItems(BRIDGE_DATA), [searchTerm]);

  const displayList = activeTab === 'dex' ? dexList : bridgeList;

  return (
    <div className="w-full mb-6">
      {/* Search Header */}
      <div className="flex items-center gap-3 p-4 rounded-lg mb-6 transition-all duration-300 bg-white dark:bg-[#12121a] border border-gray-200 dark:border-gray-800">
        <Search size={20} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search DEX, Bridge, or Chain..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent outline-none placeholder-gray-500 text-gray-900 dark:text-gray-100"
        />
        <div className="flex p-1 rounded transition-all duration-300 bg-slate-100 dark:bg-[#010409]">
          <button
            onClick={() => setActiveTab('dex')}
            className={`px-4 py-1.5 text-xs font-bold rounded transition-all duration-300 ${activeTab === 'dex' ? "bg-cyan-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            DEXs
          </button>
          <button
            onClick={() => setActiveTab('bridge')}
            className={`px-4 py-1.5 text-xs font-bold rounded transition-all duration-300 ${activeTab === 'bridge' ? "bg-purple-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            Bridges
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayList.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 rounded-lg transition-all duration-300 hover:opacity-80 relative overflow-hidden"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 rounded-lg border transition-all duration-300 group-hover:border-gray-500 bg-slate-100 dark:bg-[#010409] border-gray-200 dark:border-gray-800">
                {item.logo ? (
                  <img src={item.logo} alt={item.dex || item.name} className="w-5 h-5 object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                ) : null}
                <Box size={20} className={`${item.logo ? 'hidden' : 'block'} ${activeTab === 'dex' ? "text-cyan-500" : "text-purple-500"}`} />
              </div>
              <ExternalLink size={14} className="text-gray-600 group-hover:text-current transition" />
            </div>

            <h3 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>{item.dex || item.name}</h3>

            <div className="flex flex-wrap gap-2 text-xs">
              {item.chain && (
                <span className="px-2 py-0.5 rounded border transition-all duration-300 bg-slate-100 dark:bg-[#010409] border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                  {item.chain}
                </span>
              )}
              {item.category && !["evm", "solana"].includes(item.category) && (
                <span className="px-2 py-0.5 rounded border transition-all duration-300 bg-slate-100 dark:bg-[#010409] border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                  {item.category.replace('_', ' ')}
                </span>
              )}
            </div>
          </a>
        ))}

        {displayList.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No results found for "{searchTerm}"
          </div>
        )}
      </div>
    </div >
  );
};

export default DexBridgePanel;
