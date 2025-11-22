import React, { useState, useMemo } from 'react';
import { ExternalLink, Search, ChevronDown, ChevronUp } from 'lucide-react';

/** ===========================
 *  FALLBACK LOGO
 *  ===========================
 */
const FALLBACK_LOGO = "https://via.placeholder.com/32?text=?";

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
      { chain: "Solana", dex: "Raydium", url: "https://raydium.io" },
      { chain: "Solana", dex: "Orca", url: "https://orca.so" },
      { chain: "Solana", dex: "Saros", url: "https://saros.finance" },
      { chain: "Solana", dex: "Meteora", url: "https://meteora.ag" },
      { chain: "Solana", dex: "Jupiter", url: "https://jup.ag" },
      { chain: "Solana", dex: "Aldrin", url: "https://aldrin.com" },
      { chain: "Solana", dex: "Step Finance Swap", url: "https://step.finance" }
    ],
    orderbook: [
      { chain: "Solana", dex: "Serum (legacy)", url: "https://projectserum.com" },
      { chain: "Solana", dex: "OpenBook", url: "https://openbookdex.org" },
      { chain: "Solana", dex: "Phoenix", url: "https://phoenix.trade" }
    ],
    perpetual: [
      { chain: "Solana", dex: "Drift Protocol", url: "https://app.drift.trade" },
      { chain: "Solana", dex: "Zeta Markets", url: "https://zeta.markets" },
      { chain: "Solana", dex: "Mango Markets", url: "https://mango.markets" },
      { chain: "Solana", dex: "Cypher", url: "https://cypher.trade" },
      { chain: "Solana", dex: "GooseFX", url: "https://goosefx.io" }
    ]
  },
  cosmos: {
    amm_spot: [
      { chain: "Cosmos", dex: "Osmosis", url: "https://osmosis.zone" }
    ],
    orderbook: [
      { chain: "Cosmos", dex: "dYdX v4", url: "https://dydx.exchange" }
    ]
  },
  near: {
    amm_spot: [
      { chain: "NEAR", dex: "Ref Finance", url: "https://app.ref.finance" },
      { chain: "NEAR", dex: "Burrow Swap", url: "https://burrow.cash" }
    ]
  },
  sui: {
    amm_spot: [
      { chain: "Sui", dex: "Cetus", url: "https://www.cetus.zone" },
      { chain: "Sui", dex: "Aftermath Finance", url: "https://aftermath.finance" },
      { chain: "Sui", dex: "Kriya", url: "https://www.kriya.finance" }
    ]
  },
  aptos: {
    amm_spot: [
      { chain: "Aptos", dex: "PancakeSwap Aptos", url: "https://pancakeswap.finance/aptos" },
      { chain: "Aptos", dex: "AnimeSwap", url: "https://animeswap.org" },
      { chain: "Aptos", dex: "LiquidSwap", url: "https://liquidswap.com" }
    ],
    perpetual: [
      { chain: "Aptos", dex: "Econia", url: "https://econia.dev" }
    ]
  },
  ton: {
    amm_spot: [
      { chain: "TON", dex: "STON.fi", url: "https://ston.fi" },
      { chain: "TON", dex: "Megaton Finance", url: "https://megaton.fi" }
    ],
    orderbook: [
      { chain: "TON", dex: "TonStarter Swap", url: "https://tonstarter.com" }
    ]
  },
  tron: {
    amm_spot: [
      { chain: "Tron", dex: "SunSwap", url: "https://sunswap.com" }
    ]
  },
  algorand: {
    amm_spot: [
      { chain: "Algorand", dex: "Tinyman", url: "https://tinyman.org" },
      { chain: "Algorand", dex: "Pact", url: "https://pact.fi" }
    ]
  }
};

/** ===========================
 *  DATA BRIDGE
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
  Ethereum: [
    { name: "Metis Bridge", url: "https://bridge.metis.io" }
  ],
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
 *  Logo Maps
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
  Algorand: "https://cryptologos.cc/logos/algorand-algo-logo.svg?v=025"
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
  Tinyman: "https://tinyman.org/favicon.svg",
  Pact: "https://pact.fi/favicon.svg",
  "Serum (legacy)": "https://projectserum.com/favicon.svg",
  OpenBook: "https://openbookdex.org/favicon.svg",
  Phoenix: "https://phoenix.trade/favicon.svg",
  "Drift Protocol": "https://app.drift.trade/favicon.svg",
  "Zeta Markets": "https://zeta.markets/favicon.svg",
  "Mango Markets": "https://mango.markets/favicon.svg",
  Cypher: "https://cypher.trade/favicon.svg",
  "GooseFX": "https://goosefx.io/favicon.svg"
};

/** ===========================
 *  REACT COMPONENT
 *  ===========================
 */
const DexList = () => {
  const [search, setSearch] = useState('');
  const [expandedChains, setExpandedChains] = useState({});

  const handleToggleChain = (chain) => {
    setExpandedChains((prev) => ({ ...prev, [chain]: !prev[chain] }));
  };

  const filteredDex = useMemo(() => {
    if (!search) return DEX_DATA;
    const lower = search.toLowerCase();
    const result = {};
    Object.keys(DEX_DATA).forEach((chain) => {
      result[chain] = {};
      Object.keys(DEX_DATA[chain]).forEach((type) => {
        result[chain][type] = DEX_DATA[chain][type].filter(
          (dex) =>
            dex.dex.toLowerCase().includes(lower) ||
            dex.chain.toLowerCase().includes(lower)
        );
      });
    });
    return result;
  }, [search]);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: 20 }}>DEX & Bridges</h1>
      <div style={{
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 12,
        boxShadow: 'inset 4px 4px 8px #c8c8c8, inset -4px -4px 8px #ffffff',
        padding: '8px 12px'
      }}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Search DEX / Chain"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            marginLeft: 8,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            width: '100%'
          }}
        />
      </div>

      {Object.keys(filteredDex).map((chainKey) => {
        const chain = filteredDex[chainKey];
        const isExpanded = expandedChains[chainKey];
        const hasContent = Object.values(chain).some(arr => arr.length > 0);
        if (!hasContent) return null;

        return (
          <div key={chainKey} style={{ marginBottom: 24 }}>
            <div
              onClick={() => handleToggleChain(chainKey)}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: 12
              }}
            >
              <img
                src={CHAIN_LOGOS[chainKey] || FALLBACK_LOGO}
                alt={chainKey}
                style={{ width: 24, height: 24, marginRight: 8 }}
              />
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{chainKey}</h2>
              <span style={{ marginLeft: 6 }}>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </span>
            </div>

            {isExpanded &&
              Object.keys(chain).map((type) => {
                const list = chain[type];
                if (!list || list.length === 0) return null;
                return (
                  <div key={type} style={{ marginLeft: 32, marginBottom: 12 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 6 }}>{type}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      {list.map((dex) => (
                        <a
                          key={dex.dex + dex.url}
                          href={dex.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '6px 10px',
                            borderRadius: 12,
                            boxShadow: '4px 4px 8px #c8c8c8, -4px -4px 8px #ffffff',
                            textDecoration: 'none',
                            color: '#000',
                            minWidth: 140
                          }}
                        >
                          <img
                            src={DEX_LOGOS[dex.dex] || CHAIN_LOGOS[dex.chain] || FALLBACK_LOGO}
                            alt={dex.dex}
                            style={{ width: 20, height: 20, marginRight: 8 }}
                          />
                          <span>{dex.dex}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
};

export default DexList;
