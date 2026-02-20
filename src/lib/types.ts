export interface StablecoinDataRow {
  date: string;
  mint_address: string;
  name: string;
  symbol: string;
  decimals: number;
  daily_supply: number;
  daily_transfer_volume: number;
  daily_transactions: number;
  daily_active_wallets: number;
  [key: string]: string | number;
}

export interface StablecoinSummary {
  name: string;
  symbol: string;
  mint_address: string;
  current_supply: number;
  supply_change_7d: number;
  supply_change_30d: number;
  daily_volume: number;
  daily_transactions: number;
  daily_active_wallets: number;
  latest_date: string;
  history: StablecoinDataRow[];
}

export interface DashboardData {
  raw: StablecoinDataRow[];
  stablecoins: StablecoinSummary[];
  totalSupply: number;
  totalVolume: number;
  totalTransactions: number;
  totalActiveWallets: number;
  supplyChange7d: number;
  supplyChange30d: number;
  dates: string[];
}

export interface StablecoinIssuerInfo {
  name: string;
  issuer: string;
  description: string;
  website: string;
  chain: string;
  type: string;
  region: string;
  coordinates: [number, number];
}

export const STABLECOIN_ISSUERS: Record<string, StablecoinIssuerInfo> = {
  USDC: {
    name: "USD Coin",
    issuer: "Circle",
    description: "USD Coin is a fully reserved stablecoin pegged 1:1 to the US dollar, issued by Circle. It is one of the most widely used stablecoins in DeFi and is backed by cash and short-dated US treasuries.",
    website: "https://www.circle.com/usdc",
    chain: "Solana",
    type: "Fiat-backed",
    region: "United States",
    coordinates: [-74.006, 40.7128],
  },
  USDT: {
    name: "Tether USD",
    issuer: "Tether Limited",
    description: "Tether is the largest stablecoin by market cap, pegged to the US dollar. It is backed by reserves including cash, cash equivalents, and other assets.",
    website: "https://tether.to",
    chain: "Solana",
    type: "Fiat-backed",
    region: "British Virgin Islands",
    coordinates: [-64.6208, 18.4207],
  },
  PYUSD: {
    name: "PayPal USD",
    issuer: "PayPal / Paxos",
    description: "PayPal USD is a stablecoin issued by Paxos Trust Company on behalf of PayPal. It is fully backed by US dollar deposits, US treasuries, and cash equivalents.",
    website: "https://www.paypal.com/pyusd",
    chain: "Solana",
    type: "Fiat-backed",
    region: "United States",
    coordinates: [-95.7129, 37.0902],
  },
  USDS: {
    name: "USDS",
    issuer: "Sky (formerly Maker)",
    description: "USDS is the stablecoin issued by Sky (formerly MakerDAO). It serves as the upgraded version of DAI, maintaining a soft peg to the US dollar through overcollateralization.",
    website: "https://sky.money",
    chain: "Solana",
    type: "Crypto-backed",
    region: "Global / Decentralized",
    coordinates: [2.3522, 48.8566],
  },
  FDUSD: {
    name: "First Digital USD",
    issuer: "First Digital Labs",
    description: "FDUSD is a stablecoin issued by First Digital Labs, a subsidiary of First Digital Group based in Hong Kong. It is backed by cash and cash equivalents held in segregated accounts.",
    website: "https://firstdigitallabs.com",
    chain: "Solana",
    type: "Fiat-backed",
    region: "Hong Kong",
    coordinates: [114.1694, 22.3193],
  },
  USDG: {
    name: "Global Dollar",
    issuer: "Paxos",
    description: "USDG is a regulated stablecoin issued by Paxos under the Monetary Authority of Singapore's stablecoin framework. It is fully backed by US dollar reserves.",
    website: "https://paxos.com",
    chain: "Solana",
    type: "Fiat-backed",
    region: "Singapore",
    coordinates: [103.8198, 1.3521],
  },
  ISC: {
    name: "International Stable Currency",
    issuer: "ISC Protocol",
    description: "ISC is a decentralized stablecoin on Solana designed for international payments and stable value transfer across borders.",
    website: "https://isc.money",
    chain: "Solana",
    type: "Algorithmic",
    region: "Global / Decentralized",
    coordinates: [-0.1276, 51.5074],
  },
  AUSD: {
    name: "Autumn USD",
    issuer: "Autumn Finance",
    description: "AUSD is a yield-bearing stablecoin on Solana that provides stable value while generating yields through DeFi strategies.",
    website: "https://autumn.finance",
    chain: "Solana",
    type: "Crypto-backed",
    region: "Global / Decentralized",
    coordinates: [13.405, 52.52],
  },
  USDY: {
    name: "Ondo US Dollar Yield",
    issuer: "Ondo Finance",
    description: "USDY is a tokenized note secured by short-term US Treasuries and bank demand deposits. It offers yield to holders while maintaining a stable value.",
    website: "https://ondo.finance",
    chain: "Solana",
    type: "RWA-backed",
    region: "United States",
    coordinates: [-122.4194, 37.7749],
  },
  UXD: {
    name: "UXD Stablecoin",
    issuer: "UXD Protocol",
    description: "UXD is a decentralized stablecoin backed by delta-neutral positions. It aims to be fully decentralized and capital efficient.",
    website: "https://uxd.fi",
    chain: "Solana",
    type: "Algorithmic",
    region: "Global / Decentralized",
    coordinates: [139.6917, 35.6895],
  },
  EURC: {
    name: "Euro Coin",
    issuer: "Circle",
    description: "EURC is a euro-backed stablecoin issued by Circle. It brings the stability and trust of USDC to the euro, fully backed by euro-denominated reserves.",
    website: "https://www.circle.com/eurc",
    chain: "Solana",
    type: "Fiat-backed",
    region: "Europe",
    coordinates: [2.3522, 48.8566],
  },
  YUSDT: {
    name: "Yielding USDT",
    issuer: "Yield Protocol",
    description: "YUSDT is a yield-bearing wrapper around USDT on Solana, providing holders with additional yield while maintaining USDT stability.",
    website: "#",
    chain: "Solana",
    type: "Wrapped",
    region: "Global / Decentralized",
    coordinates: [103.8198, 1.3521],
  },
  YUSDC: {
    name: "Yielding USDC",
    issuer: "Yield Protocol",
    description: "YUSDC is a yield-bearing wrapper around USDC on Solana, providing holders with additional yield while maintaining USDC stability.",
    website: "#",
    chain: "Solana",
    type: "Wrapped",
    region: "Global / Decentralized",
    coordinates: [-122.4194, 37.7749],
  },
  ZUSD: {
    name: "Z-USD",
    issuer: "ZUSD Protocol",
    description: "ZUSD is a stablecoin on Solana focused on providing stable value for DeFi applications and trading pairs.",
    website: "#",
    chain: "Solana",
    type: "Crypto-backed",
    region: "Global / Decentralized",
    coordinates: [8.5417, 47.3769],
  },
};

export const STABLECOIN_COLORS: Record<string, string> = {
  USDC: "#2775CA",
  USDT: "#50AF95",
  PYUSD: "#0070E0",
  USDS: "#1BAC6B",
  FDUSD: "#25B97A",
  USDG: "#6366F1",
  ISC: "#F59E0B",
  AUSD: "#EC4899",
  USDY: "#8B5CF6",
  UXD: "#EF4444",
  EURC: "#2775CA",
  YUSDT: "#50AF95",
  YUSDC: "#2775CA",
  ZUSD: "#06B6D4",
};

export function getStablecoinColor(symbol: string): string {
  return STABLECOIN_COLORS[symbol] || "#9945FF";
}
