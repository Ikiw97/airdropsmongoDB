import React, { useState, useMemo } from 'react';
import { useTheme } from "../contexts/ThemeContext";
import { ExternalLink, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fadeInUpVariants,
  containerVariants,
  itemVariants,
  buttonHoverVariants,
} from '../utils/animationVariants';

/** ===========================
 *  DATA DEX
 *  ===========================
 */
const DEX_DATA = {
  evm: {
    amm_spot: [
      { chain: "Ethereum", dex: "Uniswap", url: "https://uniswap.org" },
      { chain: "Ethereum", dex: "SushiSwap", url: "https://sushi.com" },
      { chain: "Ethereum", dex: "Balancer", url: "https://balancer.fi" },
      { chain: "Ethereum", dex: "Curve", url: "https://curve.fi" },
      { chain: "Ethereum", dex: "KyberSwap", url: "https://kyberswap.com" },
      { chain: "Ethereum", dex: "DODO", url: "https://dodoex.io" },
      { chain: "Ethereum", dex: "Bancor", url: "https://bancor.network" },
      { chain: "BNB Chain", dex: "PancakeSwap", url: "https://pancakeswap.finance" },
      { chain: "BNB Chain", dex: "ApeSwap", url: "https://apeswap.finance" },
      { chain: "BNB Chain", dex: "BiSwap", url: "https://biswap.org" },
      { chain: "Polygon", dex: "QuickSwap", url: "https://quickswap.exchange" },
      { chain: "Polygon", dex: "Uniswap v3", url: "https://app.uniswap.org" },
      { chain: "Arbitrum", dex: "Camelot", url: "https://camelot.exchange" },
      { chain: "Avalanche", dex: "Trader Joe", url: "https://traderjoexyz.com" },
      { chain: "Avalanche", dex: "Pangolin", url: "https://pangolin.exchange" },
      { chain: "Fantom", dex: "SpookySwap", url: "https://spooky.fi" },
      { chain: "Fantom", dex: "SpiritSwap", url: "https://spiritswap.finance" }
    ],
    orderbook: [
      { chain: "Ethereum", dex: "0x Protocol", url: "https://0x.org" },
      { chain: "Ethereum", dex: "Matcha", url: "https://matcha.xyz" },
      { chain: "Ethereum", dex: "dYdX v3", url: "https://dydx.exchange" },
      { chain: "Polygon", dex: "DexGuru", url: "https://dex.guru" }
    ],
    perpetual: [
      { chain: "Arbitrum", dex: "GMX", url: "https://gmx.io" },
      { chain: "Arbitrum", dex: "Gains Network", url: "https://gains.network" },
      { chain: "Optimism", dex: "Kwenta", url: "https://kwenta.io" },
      { chain: "Ethereum", dex: "Perpetual Protocol", url: "https://perp.com" },
      { chain: "Polygon", dex: "Gains Network", url: "https://gains.network" },
      { chain: "Avalanche", dex: "Hubble Exchange", url: "https://hubble.exchange" }
    ]
  },

  solana: {
    amm_spot: [
      { dex: "Raydium", url: "https://raydium.io" },
      { dex: "Orca", url: "https://orca.so" },
      { dex: "Saros", url: "https://saros.finance" },
      { dex: "Meteora", url: "https://meteora.ag" },
      { dex: "Jupiter", url: "https://jup.ag" },
      { dex: "Aldrin", url: "https://aldrin.com" },
      { dex: "Step Finance Swap", url: "https://step.finance" }
    ],
    orderbook: [
      { dex: "Serum (legacy)", url: "https://projectserum.com" },
      { dex: "OpenBook", url: "https://openbookdex.org" },
      { dex: "Phoenix", url: "https://phoenix.trade" }
    ],
    perpetual: [
      { dex: "Drift Protocol", url: "https://app.drift.trade" },
      { dex: "Zeta Markets", url: "https://zeta.markets" },
      { dex: "Mango Markets", url: "https://mango.markets" },
      { dex: "Cypher", url: "https://cypher.trade" },
      { dex: "GooseFX", url: "https://goosefx.io" }
    ]
  },

  sui: {
    amm_spot: [
      { dex: "Cetus", url: "https://www.cetus.zone" },
      { dex: "Aftermath Finance", url: "https://aftermath.finance" },
      { dex: "Kriya", url: "https://www.kriya.finance" }
    ]
  },

  aptos: {
    amm_spot: [
      { dex: "PancakeSwap Aptos", url: "https://pancakeswap.finance/aptos" },
      { dex: "AnimeSwap", url: "https://animeswap.org" },
      { dex: "LiquidSwap", url: "https://liquidswap.com" }
    ],
    perpetual: [
      { dex: "Econia", url: "https://econia.dev" }
    ]
  },

  ton: {
    amm_spot: [
      { dex: "STON.fi", url: "https://ston.fi" },
      { dex: "Megaton Finance", url: "https://megaton.fi" }
    ],
    orderbook: [
      { dex: "TonStarter Swap", url: "https://tonstarter.com" }
    ]
  },

  tron: {
    amm_spot: [
      { dex: "SunSwap", url: "https://sunswap.com" }
    ]
  },

  near: {
    amm_spot: [
      { dex: "Ref Finance", url: "https://app.ref.finance" },
      { dex: "Burrow Swap", url: "https://burrow.cash" }
    ]
  },

  cosmos: {
    amm_spot: [
      { dex: "Osmosis", url: "https://osmosis.zone" }
    ],
    orderbook: [
      { dex: "dYdX v4", url: "https://dydx.exchange" }
    ]
  },

  algorand: {
    amm_spot: [
      { dex: "Tinyman", url: "https://tinyman.org" },
      { dex: "Pact", url: "https://pact.fi" }
    ]
  }
};

/** ===========================
 *  DATA BRIDGE
 *  ===========================
 */
const BRIDGE_DATA = {
  "Multi-Chain": [
    { name: "Gas.zip", url: "https://www.gas.zip" },
    { name: "LayerZero", url: "https://layerzero.network" },
    { name: "Stargate Finance", url: "https://stargate.finance" },
    { name: "Squid Router", url: "https://squidrouter.com" },
    { name: "Axelar", url: "https://axelar.network" },
    { name: "Wormhole", url: "https://wormhole.com" },
    { name: "Synapse Protocol", url: "https://synapseprotocol.com" },
    { name: "Rango Exchange", url: "https://rango.exchange" },
    { name: "Bungee / Socket", url: "https://bungee.exchange" },
    { name: "Router Protocol", url: "https://routerprotocol.com" },
    { name: "XY Finance", url: "https://xy.finance" },
    { name: "Orbiter Finance", url: "https://orbiter.finance" },
    { name: "Hyperlane", url: "https://hyperlane.xyz" },
    { name: "deBridge", url: "https://debridge.finance" },
    { name: "Across Protocol", url: "https://across.to" },
    { name: "Multichain (AnySwap)", url: "https://multichain.org" },
    { name: "ChainPort", url: "https://www.chainport.io" },
    { name: "RhinoFi", url: "https://app.rhinofi.io/bridge" },
    { name: "Meson Finance", url: "https://meson.fi" },
    { name: "RelayChain", url: "https://relay.link" },
    { name: "Li.FI", url: "https://li.fi" },
    { name: "Wanchain Bridge", url: "https://bridge.wanchain.org" },
    { name: "Poloniex Bridge", url: "https://bridge.poloniex.org" },
    { name: "Biconomy Hyphen", url: "https://hyphen.biconomy.io" },
    { name: "Rubic", url: "https://rubic.exchange/bridge" },
    { name: "Interport Finance", url: "https://interport.finance" },
    { name: "PolyNetwork", url: "https://bridge.polynetwork.org" },
    { name: "Allbridge", url: "https://allbridge.io" },
    { name: "ChainHop", url: "https://chainhop.network" }
  ],
  Ethereum: [{ name: "Metis Bridge", url: "https://bridge.metis.io" }],
  Arbitrum: [
    { name: "LayerZero", url: "https://layerzero.network" },
    { name: "Stargate Finance", url: "https://stargate.finance" }
  ],
  Solana: [
    { name: "Wormhole", url: "https://wormhole.com" },
    { name: "Allbridge", url: "https://allbridge.io" }
  ],
  Sui: [
    { name: "Wormhole", url: "https://wormhole.com" },
    { name: "Celer cBridge", url: "https://cbridge.celer.network" },
    { name: "Multichain", url: "https://multichain.org" }
  ],
  Aptos: [
    { name: "Wormhole", url: "https://wormhole.com" },
    { name: "LayerZero", url: "https://layerzero.network" },
    { name: "Axelar", url: "https://axelar.network" }
  ],
  TON: [
    { name: "TonBridge (Orbit)", url: "https://tonbridge.io" },
    { name: "Wrapped TON Bridge", url: "https://ton.org/bridge" }
  ],
  Tron: [
    { name: "JustMoney Bridge", url: "https://bridge.just.money" },
    { name: "Orbit/TRON Bridge", url: "https://bridge.orbitchain.io" }
  ],
  Cosmos: [
    { name: "Gravity Bridge", url: "https://wallet.gravitybridge.net" },
    { name: "IBC via Axelar", url: "https://axelar.network" },
    { name: "Osmosis IBC Transfer", url: "https://app.osmosis.zone" }
  ],
  Polkadot: [
    { name: "Snowbridge (DOT ↔ EVM)", url: "https://snowbridge.network" },
    { name: "XCM Teleport", url: "https://polkadot.network" },
    { name: "Interlay BTC Bridge", url: "https://interlay.io" }
  ],
  "Bitcoin / BTC": [
    { name: "Thorchain", url: "https://thorchain.org" },
    { name: "Interlay iBTC", url: "https://interlay.io" },
    { name: "Lightning Loop", url: "https://lightning.engineering/loop" },
    { name: "Portal BTC Bridge", url: "https://portalbridge.com" },
    { name: "Multibit (BTC↔EVM)", url: "https://multibit.exchange" }
  ]
};

/** ===========================
 *  Logos
 *  ===========================
 */
const CHAIN_LOGOS = {
  Ethereum: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025",
  "BNB Chain": "https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=025",
  Polygon: "https://cryptologos.cc/logos/polygon-matic-logo.svg?v=025",
  Arbitrum: "https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=025",
  Avalanche: "https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=025",
  Fantom: "https://cryptologos.cc/logos/fantom-ftm-logo.svg?v=025",
  Solana: "https://cryptologos.cc/logos/solana-sol-logo.svg?v=025",
  Sui: "https://raw.githubusercontent.com/MystenLabs/sui/master/apps/wallet/src/ui/assets/sui.svg",
  Aptos: "https://cryptologos.cc/logos/aptos-apt-logo.svg?v=025",
  TON: "https://cryptologos.cc/logos/toncoin-ton-logo.svg?v=025",
  Tron: "https://cryptologos.cc/logos/tron-trx-logo.svg?v=025",
  NEAR: "https://cryptologos.cc/logos/near-protocol-near-logo.svg?v=025",
  Cosmos: "https://cryptologos.cc/logos/cosmos-atom-logo.svg?v=025",
  Polkadot: "https://cryptologos.cc/logos/polkadot-new-dot-logo.svg?v=025",
  Bitcoin: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=025"
};

const DEX_LOGOS = {
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
  Raydium: "https://raydium.io/logo.svg",
  Orca: "https://www.orca.so/logos/orca.svg",
  Saros: "https://saros.finance/logo.svg",
  Meteora: "https://meteora.ag/favicon.svg",
  Jupiter: "https://assets.jup.ag/logo.png",
  Aldrin: "https://aldrin.com/favicon.svg",
  "Step Finance Swap": "https://step.finance/logo.svg",
  Cetus: "https://www.cetus.zone/logo.svg",
  "Aftermath Finance": "https://aftermath.finance/logo.svg",
  Kriya: "https://www.kriya.finance/favicon.svg",
  "PancakeSwap Aptos": "https://cryptologos.cc/logos/pancakeswap-cake-logo.svg",
  AnimeSwap: "https://app.animeswap.org/favicon.svg",
  LiquidSwap: "https://liquidswap.com/favicon.svg",
  Econia: "https://econia.dev/favicon.svg",
  "STON.fi": "https://ston.fi/favicon.svg",
  "Megaton Finance": "https://megaton.fi/favicon.svg",
  "TonStarter Swap": "https://tonstarter.com/favicon.svg",
  SunSwap: "https://sunswap.com/favicon.svg",
  "Ref Finance": "https://app.ref.finance/ref-icon.svg",
  Pact: "https://pact.fi/favicon.svg",
  Tinyman: "https://tinyman.org/favicon.svg"
};

/** ===========================
 *  COMPONENT
 *  ===========================
 */
export default function DexBridgePanel() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState({ dex: true, bridge: false });
  const [expandedSub, setExpandedSub] = useState({});

  const toggleCategory = (cat) => setExpandedCategory(prev => ({ ...prev, [cat]: !prev[cat] }));
  const toggleSub = (key) => setExpandedSub(prev => ({ ...prev, [key]: !prev[key] }));

  const FALLBACK_LOGO = "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025";


  /* =======================
   * FILTERS
   * ======================= */
  const filteredDex = useMemo(() => {
    const res = [];
    Object.entries(DEX_DATA).forEach(([blockchain, categories]) => {
      Object.entries(categories).forEach(([cat, list]) => {
        list.forEach(item => {
          const name = (item.dex || "").toLowerCase();
          const chainName = ((item.chain || blockchain) + "").toLowerCase();
          if (!searchTerm || name.includes(searchTerm.toLowerCase()) || chainName.includes(searchTerm.toLowerCase())) {
            res.push({ ...item, blockchain, category: cat, chain: item.chain || blockchain });
          }
        });
      });
    });
    return res;
  }, [searchTerm]);

  const groupedDex = useMemo(() => {
    const g = {};
    filteredDex.forEach(d => {
      if (!g[d.blockchain]) g[d.blockchain] = {};
      if (!g[d.blockchain][d.chain]) g[d.blockchain][d.chain] = [];
      g[d.blockchain][d.chain].push(d);
    });
    return g;
  }, [filteredDex]);

  const filteredBridge = useMemo(() => {
    const out = {};
    Object.entries(BRIDGE_DATA).forEach(([chain, list]) => {
      const flt = list.filter(b => !searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (flt.length > 0) out[chain] = flt;
    });
    return out;
  }, [searchTerm]);


  /** ===========================
   *     STYLE PRESETS
   *  =========================== */
  // Styles moved to Tailwind classes



  return (
    <motion.div
      className="min-h-screen p-6 space-y-6 bg-gray-200 dark:bg-gray-900 transition-colors"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >

      {/* SEARCH BAR */}
      <motion.div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-main-light dark:bg-main-dark shadow-neu-pressed dark:shadow-neu-pressed-dark"
        variants={fadeInUpVariants}
      >
        <Search size={20} className="text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          placeholder="Search DEX or Bridge..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent outline-none text-gray-700 dark:text-gray-200"
        />
      </motion.div>


      {/* ======================= DEX LIST ====================== */}
      <motion.div className="rounded-3xl bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark transition-all" variants={fadeInUpVariants}>
        <button
          className="w-full flex justify-between items-center p-5 text-lg font-semibold text-gray-600 dark:text-gray-300"
          onClick={() => toggleCategory('dex')}
        >
          List DEX {expandedCategory.dex ? <ChevronUp /> : <ChevronDown />}
        </button>

        <AnimatePresence>
          {expandedCategory.dex && (
            <motion.div
              className="px-5 pb-5 space-y-5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >

              {Object.entries(groupedDex).map(([blockchain, chains]) => (
                <motion.div key={blockchain} variants={itemVariants}>

                  {/* BLOCKCHAIN */}
                  <button
                    className="w-full flex justify-between items-center px-4 py-3 rounded-xl bg-main-light dark:bg-main-dark text-gray-600 dark:text-gray-300 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark transition"
                    onClick={() => toggleSub(`dex-${blockchain}`)}
                  >
                    <span className="font-semibold">{blockchain}</span>
                    {expandedSub[`dex-${blockchain}`] ? <ChevronUp /> : <ChevronDown />}
                  </button>

                  {/* CHAINS INSIDE */}
                  <AnimatePresence>
                    {expandedSub[`dex-${blockchain}`] && (
                      <motion.div
                        className="mt-3 space-y-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {Object.entries(chains).map(([chain, dexList]) => (
                          <div key={chain}>

                            <h5 className="text-gray-500 dark:text-gray-400 font-medium mb-2">{chain}</h5>

                            <motion.div
                              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                              initial="hidden"
                              animate="visible"
                              variants={containerVariants}
                            >
                              {dexList.map((dex, i) => (
                                <motion.a
                                  key={i}
                                  href={dex.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex justify-between items-center px-3 py-2 rounded-xl ${neuButton}`}
                                  variants={itemVariants}
                                  custom={i}
                                  whileHover={{ y: -2 }}
                                >
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={DEX_LOGOS[dex.dex] || CHAIN_LOGOS[dex.chain] || FALLBACK_LOGO}
                                      alt={dex.dex}
                                      className="w-7 h-7 object-contain"
                                      onError={(e) => { e.currentTarget.src = FALLBACK_LOGO; }}
                                    />
                                    <span>{dex.dex}</span>
                                  </div>
                                  <ExternalLink size={18} className="text-gray-500 dark:text-gray-400" />
                                </motion.a>
                              ))}
                            </motion.div>

                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              ))}

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>



      {/* ======================= BRIDGE LIST ====================== */}
      <motion.div className="rounded-3xl bg-main-light dark:bg-main-dark shadow-neu-flat dark:shadow-neu-flat-dark transition-all" variants={fadeInUpVariants}>
        <button
          className="w-full flex justify-between items-center p-5 text-lg font-semibold text-gray-600 dark:text-gray-300"
          onClick={() => toggleCategory('bridge')}
        >
          List Bridge {expandedCategory.bridge ? <ChevronUp /> : <ChevronDown />}
        </button>

        <AnimatePresence>
          {expandedCategory.bridge && (
            <motion.div
              className="px-5 pb-5 space-y-5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >

              {Object.entries(filteredBridge).map(([chain, bridges]) => (
                <motion.div key={chain} variants={itemVariants}>

                  {/* CHAIN CATEGORY */}
                  <button
                    className="w-full flex justify-between items-center px-4 py-3 rounded-xl bg-main-light dark:bg-main-dark text-gray-600 dark:text-gray-300 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark transition"
                    onClick={() => toggleSub(`bridge-${chain}`)}
                  >
                    <span className="font-semibold">{chain}</span>
                    {expandedSub[`bridge-${chain}`] ? <ChevronUp /> : <ChevronDown />}
                  </button>

                  {/* BRIDGE ITEMS */}
                  <AnimatePresence>
                    {expandedSub[`bridge-${chain}`] && (
                      <motion.div
                        className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >

                        {bridges.map((bridge, i) => (
                          <motion.a
                            key={i}
                            href={bridge.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex justify-between items-center px-3 py-2 rounded-xl bg-main-light dark:bg-main-dark text-gray-600 dark:text-gray-300 shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark transition"
                            variants={itemVariants}
                            custom={i}
                            whileHover={{ y: -2 }}
                          >
                            <span>{bridge.name}</span>
                            <ExternalLink size={18} className="text-gray-500 dark:text-gray-400" />
                          </motion.a>
                        ))}

                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              ))}

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </motion.div>
  );
}
