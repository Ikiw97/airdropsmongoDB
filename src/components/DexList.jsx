import React, { useState, useMemo } from 'react';
import { ExternalLink, Search, Filter, Repeat } from 'lucide-react';

/**
 * DEX & Chain data (original)
 */
const DEX_DATA = {
  "evm": {
    "amm_spot": [
      { "chain": "Ethereum", "dex": "Uniswap", "url": "https://uniswap.org" },
      { "chain": "Ethereum", "dex": "SushiSwap", "url": "https://sushi.com" },
      { "chain": "Ethereum", "dex": "Balancer", "url": "https://balancer.fi" },
      { "chain": "Ethereum", "dex": "Curve", "url": "https://curve.fi" },
      { "chain": "Ethereum", "dex": "KyberSwap", "url": "https://kyberswap.com" },
      { "chain": "Ethereum", "dex": "DODO", "url": "https://dodoex.io" },
      { "chain": "Ethereum", "dex": "Bancor", "url": "https://bancor.network" },
      { "chain": "BNB Chain", "dex": "PancakeSwap", "url": "https://pancakeswap.finance" },
      { "chain": "BNB Chain", "dex": "ApeSwap", "url": "https://apeswap.finance" },
      { "chain": "BNB Chain", "dex": "BiSwap", "url": "https://biswap.org" },
      { "chain": "Polygon", "dex": "QuickSwap", "url": "https://quickswap.exchange" },
      { "chain": "Polygon", "dex": "Uniswap v3", "url": "https://app.uniswap.org" },
      { "chain": "Arbitrum", "dex": "Camelot", "url": "https://camelot.exchange" },
      { "chain": "Avalanche", "dex": "Trader Joe", "url": "https://traderjoexyz.com" },
      { "chain": "Avalanche", "dex": "Pangolin", "url": "https://pangolin.exchange" },
      { "chain": "Fantom", "dex": "SpookySwap", "url": "https://spooky.fi" },
      { "chain": "Fantom", "dex": "SpiritSwap", "url": "https://spiritswap.finance" }
    ],
    "orderbook": [
      { "chain": "Ethereum", "dex": "0x Protocol", "url": "https://0x.org" },
      { "chain": "Ethereum", "dex": "Matcha", "url": "https://matcha.xyz" },
      { "chain": "Ethereum", "dex": "dYdX v3", "url": "https://dydx.exchange" },
      { "chain": "Polygon", "dex": "DexGuru", "url": "https://dex.guru" }
    ],
    "perpetual": [
      { "chain": "Arbitrum", "dex": "GMX", "url": "https://gmx.io" },
      { "chain": "Arbitrum", "dex": "Gains Network", "url": "https://gains.network" },
      { "chain": "Optimism", "dex": "Kwenta", "url": "https://kwenta.io" },
      { "chain": "Ethereum", "dex": "Perpetual Protocol", "url": "https://perp.com" },
      { "chain": "Polygon", "dex": "Gains Network", "url": "https://gains.network" },
      { "chain": "Avalanche", "dex": "Hubble Exchange", "url": "https://hubble.exchange" }
    ]
  },
  "solana": {
    "amm_spot": [
      { "dex": "Raydium", "url": "https://raydium.io" },
      { "dex": "Orca", "url": "https://orca.so" },
      { "dex": "Saros", "url": "https://saros.finance" },
      { "dex": "Meteora", "url": "https://meteora.ag" },
      { "dex": "Aldrin", "url": "https://aldrin.com" },
      { "dex": "Step Finance Swap", "url": "https://step.finance" }
    ],
    "orderbook": [
      { "dex": "Serum (legacy)", "url": "https://projectserum.com" },
      { "dex": "OpenBook", "url": "https://openbookdex.org" },
      { "dex": "Phoenix", "url": "https://phoenix.trade" }
    ],
    "perpetual": [
      { "dex": "Drift Protocol", "url": "https://app.drift.trade" },
      { "dex": "Zeta Markets", "url": "https://zeta.markets" },
      { "dex": "Mango Markets", "url": "https://mango.markets" },
      { "dex": "Cypher", "url": "https://cypher.trade" },
      { "dex": "GooseFX", "url": "https://goosefx.io" }
    ]
  },
  "sui": {
    "amm_spot": [
      { "dex": "Cetus", "url": "https://www.cetus.zone" },
      { "dex": "Aftermath Finance", "url": "https://aftermath.finance" },
      { "dex": "Kriya", "url": "https://www.kriya.finance" }
    ]
  },
  "aptos": {
    "amm_spot": [
      { "dex": "PancakeSwap Aptos", "url": "https://pancakeswap.finance/aptos" },
      { "dex": "AnimeSwap", "url": "https://animeswap.org" },
      { "dex": "LiquidSwap", "url": "https://liquidswap.com" }
    ],
    "perpetual": [
      { "dex": "Econia", "url": "https://econia.dev" }
    ]
  },
  "ton": {
    "amm_spot": [
      { "dex": "STON.fi", "url": "https://ston.fi" },
      { "dex": "Megaton Finance", "url": "https://megaton.fi" }
    ],
    "orderbook": [
      { "dex": "TonStarter Swap", "url": "https://tonstarter.com" }
    ]
  },
  "tron": {
    "amm_spot": [
      { "dex": "SunSwap", "url": "https://sunswap.com" }
    ]
  },
  "near": {
    "amm_spot": [
      { "dex": "Ref Finance", "url": "https://app.ref.finance" },
      { "dex": "Burrow Swap", "url": "https://burrow.cash" }
    ]
  },
  "cosmos": {
    "amm_spot": [
      { "dex": "Osmosis", "url": "https://osmosis.zone" }
    ],
    "orderbook": [
      { "dex": "dYdX v4", "url": "https://dydx.exchange" }
    ]
  },
  "algorand": {
    "amm_spot": [
      { "dex": "Tinyman", "url": "https://tinyman.org" },
      { "dex": "Pact", "url": "https://pact.fi" }
    ]
  }
};

/**
 * Logos from web CDNs (SVG/PNG). These are stable CDN links (cryptologos, project assets, raw github, etc.)
 * You can update/replace URLs if you prefer another CDN.
 */
const CHAIN_LOGOS = {
  Ethereum: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025",
  "BNB Chain": "https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=025",
  Polygon: "https://cryptologos.cc/logos/polygon-matic-logo.svg?v=025",
  Arbitrum: "https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=025",
  Optimism: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg?v=025",
  Avalanche: "https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=025",
  Fantom: "https://cryptologos.cc/logos/fantom-ftm-logo.svg?v=025",
  Solana: "https://cryptologos.cc/logos/solana-sol-logo.svg?v=025",
  Sui: "https://raw.githubusercontent.com/MystenLabs/sui/master/apps/wallet/src/ui/assets/sui.svg",
  Aptos: "https://cryptologos.cc/logos/aptos-apt-logo.svg?v=025",
  TON: "https://cryptologos.cc/logos/toncoin-ton-logo.svg?v=025",
  Tron: "https://cryptologos.cc/logos/tron-trx-logo.svg?v=025",
  NEAR: "https://cryptologos.cc/logos/near-protocol-near-logo.svg?v=025",
  Cosmos: "https://cryptologos.cc/logos/cosmos-atom-logo.svg?v=025",
  Algorand: "https://cryptologos.cc/logos/algorand-algo-logo.svg?v=025"
};

const DEX_LOGOS = {
  // EVM DEX
  Uniswap: "https://cryptologos.cc/logos/uniswap-uni-logo.svg",
  "Uniswap v3": "https://cryptologos.cc/logos/uniswap-uni-logo.svg",
  SushiSwap: "https://cryptologos.cc/logos/sushiswap-sushi-logo.svg",
  Balancer: "https://raw.githubusercontent.com/balancer-labs/brand-assets/master/Balancer%20Logos/SVG/Balancer%20Logo%20Mark.svg",
  Curve: "https://raw.githubusercontent.com/curvefi/curve-assets/main/logo.svg",
  KyberSwap: "https://kyberswap.com/favicon.svg",
  DODO: "https://assets.coingecko.com/coins/images/12651/large/dodo_logo.png",
  Bancor: "https://raw.githubusercontent.com/bancorprotocol/assets/master/logo.svg",
  PancakeSwap: "https://cryptologos.cc/logos/pancakeswap-cake-logo.svg",
  ApeSwap: "https://apeswap.finance/logo.svg",
  BiSwap: "https://biswap.org/logo.svg",
  QuickSwap: "https://cryptologos.cc/logos/quickswap-quick-logo.svg",
  Camelot: "https://raw.githubusercontent.com/CamelotInc/.github/main/assets/logo.svg",
  "Trader Joe": "https://traderjoexyz.com/favicon.svg",
  Pangolin: "https://raw.githubusercontent.com/pangolindex/pangolin-token-icons/main/assets/png/PngToken.png",
  SpookySwap: "https://spooky.fi/favicon.svg",
  SpiritSwap: "https://raw.githubusercontent.com/Layer3Org/spiritswap-tokens/main/logo.svg",
  "0x Protocol": "https://cryptologos.cc/logos/0x-zrx-logo.svg",
  Matcha: "https://matcha.xyz/favicon.svg",
  "dYdX v3": "https://cryptologos.cc/logos/dydx-dydx-logo.svg",
  DexGuru: "https://dex.guru/static/logo.svg",
  GMX: "https://cryptologos.cc/logos/gmx-gmx-logo.svg",
  "Gains Network": "https://gainsnetwork.io/favicon.svg",
  Kwenta: "https://cryptologos.cc/logos/kwenta-kwenta-logo.svg",
  "Perpetual Protocol": "https://cryptologos.cc/logos/perpetual-protocol-perp-logo.svg",
  "Hubble Exchange": "https://hubble.exchange/favicon.svg",

  // Solana
  Raydium: "https://raydium.io/logo.svg",
  Orca: "https://www.orca.so/logos/orca.svg",
  Saros: "https://saros.finance/logo.svg",
  Meteora: "https://meteora.ag/favicon.svg",
  Aldrin: "https://aldrin.com/favicon.svg",
  "Step Finance Swap": "https://step.finance/logo.svg",
  "Serum (legacy)": "https://cryptologos.cc/logos/serum-srm-logo.svg",
  OpenBook: "https://openbookdex.org/icon.svg",
  Phoenix: "https://phoenix.trade/favicon.svg",
  "Drift Protocol": "https://app.drift.trade/favicon.svg",
  "Zeta Markets": "https://zeta.markets/favicon.svg",
  "Mango Markets": "https://mango.markets/assets/icons/logo.svg",
  Cypher: "https://cypher.trade/favicon.svg",
  GooseFX: "https://goosefx.io/favicon.svg",

  // Sui
  Cetus: "https://www.cetus.zone/logo.svg",
  "Aftermath Finance": "https://aftermath.finance/logo.svg",
  Kriya: "https://www.kriya.finance/favicon.svg",

  // Aptos
  "PancakeSwap Aptos": "https://cryptologos.cc/logos/pancakeswap-cake-logo.svg",
  AnimeSwap: "https://app.animeswap.org/favicon.svg",
  LiquidSwap: "https://liquidswap.com/favicon.svg",
  Econia: "https://econia.dev/favicon.svg",

  // TON
  "STON.fi": "https://ston.fi/favicon.svg",
  "Megaton Finance": "https://megaton.fi/favicon.svg",
  "TonStarter Swap": "https://tonstarter.com/favicon.svg",

  // TRON
  SunSwap: "https://sunswap.com/favicon.svg",

  // NEAR
  "Ref Finance": "https://app.ref.finance/ref-icon.svg",
  "Burrow Swap": "https://burrow.cash/favicon.svg",

  // COSMOS
  Osmosis: "https://osmosis.zone/favicon.svg",

  // ALGORAND
  Tinyman: "https://tinyman.org/favicon.svg",
  Pact: "https://pact.fi/favicon.svg"
};

/**
 * UI constants
 */
const BLOCKCHAIN_INFO = {
  evm: { name: 'EVM Chains', icon: '', color: 'from-blue-500 to-blue-600' },
  solana: { name: 'Solana', icon: '', color: 'from-purple-500 to-purple-600' },
  sui: { name: 'Sui', icon: '', color: 'from-cyan-500 to-cyan-600' },
  aptos: { name: 'Aptos', icon: '', color: 'from-green-500 to-green-600' },
  ton: { name: 'TON', icon: '', color: 'from-indigo-500 to-indigo-600' },
  tron: { name: 'Tron', icon: '', color: 'from-red-500 to-red-600' },
  near: { name: 'NEAR', icon: '', color: 'from-teal-500 to-teal-600' },
  cosmos: { name: 'Cosmos', icon: '', color: 'from-pink-500 to-pink-600' },
  algorand: { name: 'Algorand', icon: '', color: 'from-orange-500 to-orange-600' }
};

const CATEGORY_NAMES = {
  amm_spot: 'AMM Spot',
  orderbook: 'Orderbook',
  perpetual: 'Perpetual'
};

const CATEGORY_COLORS = {
  amm_spot: 'from-green-400 to-green-500',
  orderbook: 'from-blue-400 to-blue-500',
  perpetual: 'from-purple-400 to-purple-500'
};

/**
 * Component
 */
function DexList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlockchain, setSelectedBlockchain] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Flatten and filter DEX data
  const filteredDexList = useMemo(() => {
    const results = [];

    Object.entries(DEX_DATA).forEach(([blockchain, categories]) => {
      // Filter blockchain
      if (selectedBlockchain !== 'all' && selectedBlockchain !== blockchain) {
        return;
      }

      Object.entries(categories).forEach(([category, dexList]) => {
        // Filter category
        if (selectedCategory !== 'all' && selectedCategory !== category) {
          return;
        }

        dexList.forEach(dex => {
          const dexName = dex.dex.toLowerCase();
          const chainName = (dex.chain || blockchain).toLowerCase();
          const search = searchTerm.toLowerCase();

          // Filter by search
          if (!searchTerm || dexName.includes(search) || chainName.includes(search)) {
            results.push({
              ...dex,
              blockchain,
              category,
              chain: dex.chain || blockchain
            });
          }
        });
      });
    });

    return results;
  }, [searchTerm, selectedBlockchain, selectedCategory]);

  // Group by blockchain and chain
  const groupedDex = useMemo(() => {
    const grouped = {};

    filteredDexList.forEach(dex => {
      if (!grouped[dex.blockchain]) {
        grouped[dex.blockchain] = {};
      }
      if (!grouped[dex.blockchain][dex.chain]) {
        grouped[dex.blockchain][dex.chain] = [];
      }
      grouped[dex.blockchain][dex.chain].push(dex);
    });

    return grouped;
  }, [filteredDexList]);

  // Fallback logo
  const FALLBACK_LOGO = "https://cryptologos.cc/logos/ethereum-eth-logo.svg";

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-xl"
          style={{
            background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
            boxShadow: '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Repeat size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{filteredDexList.length}</p>
              <p className="text-sm text-gray-600">Total DEX</p>
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-xl"
          style={{
            background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
            boxShadow: '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <Filter size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{Object.keys(groupedDex).length}</p>
              <p className="text-sm text-gray-600">Blockchains</p>
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-xl"
          style={{
            background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
            boxShadow: '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <ExternalLink size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">9</p>
              <p className="text-sm text-gray-600">Ecosystems</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="p-6 rounded-2xl space-y-4"
        style={{
          background: '#e0e5ec',
          boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
        }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search size={16} className="inline mr-2" />
              Search DEX
            </label>
            <input
              type="text"
              placeholder="Search by name or chain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#e0e5ec] text-gray-800"
              style={{
                boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.6), inset -4px -4px 8px rgba(255,255,255,0.5)'
              }}
            />
          </div>

          {/* Blockchain Filter */}
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blockchain
            </label>
            <select
              value={selectedBlockchain}
              onChange={(e) => setSelectedBlockchain(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#e0e5ec] text-gray-800 cursor-pointer"
              style={{
                boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.6), inset -4px -4px 8px rgba(255,255,255,0.5)'
              }}
            >
              <option value="all">All Blockchains</option>
              {Object.entries(BLOCKCHAIN_INFO).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#e0e5ec] text-gray-800 cursor-pointer"
              style={{
                boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.6), inset -4px -4px 8px rgba(255,255,255,0.5)'
              }}
            >
              <option value="all">All Categories</option>
              <option value="amm_spot">AMM Spot</option>
              <option value="orderbook">Orderbook</option>
              <option value="perpetual">Perpetual</option>
            </select>
          </div>
        </div>

        {/* Reset Button */}
        {(searchTerm || selectedBlockchain !== 'all' || selectedCategory !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedBlockchain('all');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            style={{
              boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* DEX List */}
      {Object.keys(groupedDex).length === 0 ? (
        <div
          className="p-8 rounded-2xl text-center"
          style={{
            background: '#e0e5ec',
            boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
          }}
        >
          <p className="text-gray-600 text-lg">No DEX found matching your filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDex).map(([blockchain, chains]) => {
            const blockchainInfo = BLOCKCHAIN_INFO[blockchain];

            return (
              <div
                key={blockchain}
                className="p-6 rounded-2xl"
                style={{
                  background: '#e0e5ec',
                  boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
                }}
              >
                {/* Blockchain Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`px-4 py-2 rounded-xl text-white font-bold text-lg bg-gradient-to-r ${blockchainInfo.color}`}
                    style={{
                      boxShadow: '4px 4px 8px rgba(163,177,198,0.4)'
                    }}
                  >
                    {/* show SVG logo for the blockchain if available (no emoji) */}
                    <span className="inline-flex items-center gap-2">
                      {CHAIN_LOGOS[blockchainInfo.name] ? (
                        <img
                          src={CHAIN_LOGOS[blockchainInfo.name]}
                          alt={blockchainInfo.name}
                          loading="lazy"
                          className="w-5 h-5 object-contain inline-block"
                          onError={(e) => { e.currentTarget.src = FALLBACK_LOGO; }}
                        />
                      ) : null}
                      {blockchainInfo.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {Object.values(chains).flat().length} DEX
                  </div>
                </div>

                {/* Chains */}
                <div className="space-y-4">
                  {Object.entries(chains).map(([chain, dexList]) => (
                    <div key={chain}>
                      {/* Chain Name (only for EVM) */}
                      {blockchain === 'evm' && (
                        <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          {/* show chain logo if available */}
                          {CHAIN_LOGOS[chain] ? (
                            <img
                              src={CHAIN_LOGOS[chain]}
                              alt={chain}
                              loading="lazy"
                              className="w-5 h-5 object-contain rounded-sm"
                              onError={(e) => { e.currentTarget.src = FALLBACK_LOGO; }}
                            />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          )}
                          {chain}
                        </h4>
                      )}

                      {/* DEX Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dexList.map((dex, idx) => (
                          <a
                            key={idx}
                            href={dex.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-4 rounded-xl transition-all duration-300 hover:-translate-y-1"
                            style={{
                              background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
                              boxShadow: '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)'
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                {/* DEX name with logo */}
                                <div className="flex items-center gap-2 mb-1">
                                  <img
                                    src={DEX_LOGOS[dex.dex] || CHAIN_LOGOS[dex.chain] || FALLBACK_LOGO}
                                    alt={dex.dex}
                                    loading="lazy"
                                    className="w-5 h-5 object-contain rounded-sm"
                                    onError={(e) => { e.currentTarget.src = FALLBACK_LOGO; }}
                                  />
                                  <span className="font-bold text-gray-800 group-hover:text-blue-600 transition">
                                    {dex.dex}
                                  </span>
                                </div>

                                {/* Category badge */}
                                <span
                                  className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r ${CATEGORY_COLORS[dex.category]}`}
                                  style={{
                                    boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)'
                                  }}
                                >
                                  {CATEGORY_NAMES[dex.category]}
                                </span>
                              </div>
                              <ExternalLink
                                size={16}
                                className="text-gray-400 group-hover:text-blue-600 transition flex-shrink-0"
                              />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DexList;
