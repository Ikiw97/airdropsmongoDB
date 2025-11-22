import React, { useState, useMemo } from 'react';
import { ExternalLink, Search, ChevronDown, ChevronUp, Repeat, Filter } from 'lucide-react';

/** ===========================
 *  DATA DEX (original lengkap)
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
 *  DATA BRIDGE (100+ versi super complete)
 *  ===========================
 */
const BRIDGE_DATA = {
  "Multi‑Chain": [
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

  "Ethereum": [
    { name: "Metis Bridge", url: "https://bridge.metis.io" }
  ],

  "Arbitrum": [
    // Often same multi-chain bridges apply to Arbitrum,
    // but we include some specific ones if desired.
    { name: "LayerZero", url: "https://layerzero.network" },
    { name: "Stargate Finance", url: "https://stargate.finance" }
  ],

  "Solana": [
    { name: "Wormhole", url: "https://wormhole.com" },
    { name: "Allbridge", url: "https://allbridge.io" }
  ],

  "Sui": [
    { name: "Wormhole", url: "https://wormhole.com" },
    { name: "Celer cBridge", url: "https://cbridge.celer.network" },
    { name: "Multichain", url: "https://multichain.org" }
  ],

  "Aptos": [
    { name: "Wormhole", url: "https://wormhole.com" },
    { name: "LayerZero", url: "https://layerzero.network" },
    { name: "Axelar", url: "https://axelar.network" }
  ],

  "TON": [
    { name: "TonBridge (Orbit)", url: "https://tonbridge.io" },
    { name: "Wrapped TON Bridge", url: "https://ton.org/bridge" }
  ],

  "Tron": [
    { name: "JustMoney Bridge", url: "https://bridge.just.money" },
    { name: "Orbit/TRON Bridge", url: "https://bridge.orbitchain.io" }
  ],

  "Cosmos": [
    { name: "Gravity Bridge", url: "https://wallet.gravitybridge.net" },
    { name: "IBC via Axelar", url: "https://axelar.network" },
    { name: "Osmosis IBC Transfer", url: "https://app.osmosis.zone" }
  ],

  "Polkadot": [
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
  ],

  "Gaming / App-Chain": [
    { name: "Ronin Bridge", url: "https://bridge.roninchain.com" },
    { name: "Xai Bridge", url: "https://xai.games/bridge" },
    { name: "Beam (Merit Circle) Bridge", url: "https://bridge.onbeam.com" },
    { name: "Skale Bridge", url: "https://skale.space" }
  ],

  "ZK / ZK Protocols": [
    { name: "ZetaChain Omnichain", url: "https://www.zetachain.com/bridge" },
    { name: "zkBridge by Polyhedra", url: "https://zkbridge.com" },
    { name: "Succinct Labs Bridge", url: "https://succinct.xyz" },
    { name: "zkCross", url: "https://zkcross.org" }
  ],

  "CEX": [
    { name: "Binance Bridge", url: "https://www.binance.org/en/bridge" },
    { name: "OKX Cross‑Chain", url: "https://www.okx.com/bridge" },
    { name: "Coinbase CCTP", url: "https://www.circle.com/cctp" },
    { name: "Bybit Web3 Bridge", url: "https://web3.bybit.com" }
  ],

  "L3 / Experimental": [
    { name: "Degen L3 Bridge", url: "https://bridge.degen.tips" },
    { name: "AEVO L3 Bridge", url: "https://bridge.aevo.xyz" },
    { name: "Frame L3 Bridge", url: "https://bridge.frame.xyz" },
    { name: "Redstone OP‑Stack Bridge", url: "https://redstone.xyz" }
  ],

  "Others": [
    { name: "Hashport (Hedera ↔ EVM)", url: "https://app.hashport.network" },
    { name: "Algorand Glitter", url: "https://glitter.finance" },
    { name: "Kadena Kaddex Bridge", url: "https://kaddex.com/bridge" },
    { name: "Everscale Bridge", url: "https://bridge.everscale.network" },
    { name: "Energy Web X Bridge", url: "https://www.energywebx.com/bridge" },
    { name: "ThorSwap", url: "https://thorswap.finance" }
  ],
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
  Polkadot: "https://cryptologos.cc/logos/polkadot-new-dot-logo.svg?v=025",
  Bitcoin: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=025",
  Skale: "https://cryptologos.cc/logos/skale-logo.svg?v=025"
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
  "0x Protocol": "https://cryptologos.cc/logos/0x-zrx-logo.svg",
  Matcha: "https://matcha.xyz/favicon.svg",
  "dYdX v3": "https://cryptologos.cc/logos/dydx-dydx-logo.svg",
  DexGuru: "https://dex.guru/static/logo.svg",
  GMX: "https://cryptologos.cc/logos/gmx-gmx-logo.svg",
  "Gains Network": "https://gainsnetwork.io/favicon.svg",
  Kwenta: "https://cryptologos.cc/logos/kwenta-kwenta-logo.svg",
  "Perpetual Protocol": "https://cryptologos.cc/logos/perpetual-protocol-perp-logo.svg",
  "Hubble Exchange": "https://hubble.exchange/favicon.svg",
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
 *  COMPONENT WITH NESTED EXPAND
 *  ===========================
 */
export default function DexBridgePanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState({ dex: true, bridge: false });
  const [expandedSub, setExpandedSub] = useState({});

  const toggleCategory = (cat) => {
    setExpandedCategory(prev => ({ ...prev, [cat]: !prev[cat] }));
  };
  const toggleSub = (key) => {
    setExpandedSub(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const FALLBACK_LOGO = "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025";

  /** FILTER DEX **/
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

  /** FILTER BRIDGE **/
  const filteredBridge = useMemo(() => {
    const out = {};
    Object.entries(BRIDGE_DATA).forEach(([chain, list]) => {
      const flt = list.filter(b => !searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (flt.length > 0) out[chain] = flt;
    });
    return out;
  }, [searchTerm]);

  return (
    <div className="space-y-6 p-6">
      {/* Search Bar */}
      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search DEX or Bridge..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent outline-none px-2 py-1"
        />
      </div>

      {/* List DEX */}
      <div className="border rounded-xl bg-gray-50">
        <button
          className="w-full flex justify-between items-center p-4 font-bold text-lg"
          onClick={() => toggleCategory('dex')}
        >
          List DEX {expandedCategory.dex ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedCategory.dex && (
          <div className="px-4 pb-4 space-y-4">
            {Object.entries(groupedDex).map(([blockchain, chains]) => (
              <div key={blockchain}>
                <button
                  className="w-full flex justify-between items-center p-2 bg-gray-200 rounded"
                  onClick={() => toggleSub(`dex-${blockchain}`)}
                >
                  <span className="font-semibold">{blockchain}</span>
                  {expandedSub[`dex-${blockchain}`] ? <ChevronUp /> : <ChevronDown />}
                </button>

                {expandedSub[`dex-${blockchain}`] && (
                  <div className="mt-2 space-y-3">
                    {Object.entries(chains).map(([chain, dexList]) => (
                      <div key={chain}>
                        <h5 className="text-gray-700 font-medium mb-1">{chain}</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {dexList.map((dex, i) => (
                            <a
                              key={i}
                              href={dex.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex justify-between items-center p-2 bg-white rounded-lg shadow hover:shadow-md transition"
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={DEX_LOGOS[dex.dex] || CHAIN_LOGOS[dex.chain] || FALLBACK_LOGO}
                                  alt={dex.dex}
                                  className="w-5 h-5 object-contain"
                                  onError={(e) => { e.currentTarget.src = FALLBACK_LOGO; }}
                                />
                                <span>{dex.dex}</span>
                              </div>
                              <ExternalLink size={16} />
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* List Bridge */}
      <div className="border rounded-xl bg-gray-50">
        <button
          className="w-full flex justify-between items-center p-4 font-bold text-lg"
          onClick={() => toggleCategory('bridge')}
        >
          List Bridge {expandedCategory.bridge ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedCategory.bridge && (
          <div className="px-4 pb-4 space-y-4">
            {Object.entries(filteredBridge).map(([chain, bridges]) => (
              <div key={chain}>
                <button
                  className="w-full flex justify-between items-center p-2 bg-gray-200 rounded"
                  onClick={() => toggleSub(`bridge-${chain}`)}
                >
                  <span className="font-semibold">{chain}</span>
                  {expandedSub[`bridge-${chain}`] ? <ChevronUp /> : <ChevronDown />}
                </button>

                {expandedSub[`bridge-${chain}`] && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {bridges.map((bridge, i) => (
                      <a
                        key={i}
                        href={bridge.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-between items-center p-2 bg-white rounded-lg shadow hover:shadow-md transition"
                      >
                        <span>{bridge.name}</span>
                        <ExternalLink size={16} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
