import { StablecoinDataRow, StablecoinSummary, DashboardData } from "./types";

const API_URL =
  "https://analytics.topledger.xyz/solana/api/queries/14117/results.json?api_key=zJqC6Yh0Nn3tkzLnZJCwBPRIA8tJToTSHi5jQX9I";

function normalizeRow(row: Record<string, unknown>): StablecoinDataRow {
  const keys = Object.keys(row);

  const findKey = (candidates: string[]): string | undefined =>
    keys.find((k) => candidates.includes(k.toLowerCase()));

  const dateKey = findKey(["date", "dt", "day", "block_date", "period"]);
  const mintKey = findKey(["mint_address", "mint", "token_mint", "token_address", "address"]);
  const nameKey = findKey(["name", "token_name", "stablecoin_name", "stablecoin"]);
  const symbolKey = findKey(["symbol", "token_symbol", "ticker"]);
  const decimalsKey = findKey(["decimals", "decimal"]);
  const supplyKey = findKey([
    "daily_supply", "supply", "total_supply", "circulating_supply", "market_cap",
    "daily_circulating_supply", "current_supply",
  ]);
  const volumeKey = findKey([
    "daily_transfer_volume", "transfer_volume", "volume", "daily_volume",
    "total_volume", "usd_volume",
  ]);
  const txKey = findKey([
    "daily_transactions", "transactions", "tx_count", "num_transactions",
    "daily_txns", "txns", "total_transactions", "num_txns",
  ]);
  const walletsKey = findKey([
    "daily_active_wallets", "active_wallets", "unique_wallets", "active_addresses",
    "daily_active_addresses", "wallets", "unique_addresses",
  ]);

  return {
    date: dateKey ? String(row[dateKey]).split("T")[0] : "",
    mint_address: mintKey ? String(row[mintKey]) : "",
    name: nameKey ? String(row[nameKey]) : "",
    symbol: symbolKey ? String(row[symbolKey]) : "",
    decimals: decimalsKey ? Number(row[decimalsKey]) : 6,
    daily_supply: supplyKey ? Number(row[supplyKey]) : 0,
    daily_transfer_volume: volumeKey ? Number(row[volumeKey]) : 0,
    daily_transactions: txKey ? Number(row[txKey]) : 0,
    daily_active_wallets: walletsKey ? Number(row[walletsKey]) : 0,
  };
}

function processData(rows: StablecoinDataRow[]): DashboardData {
  if (!rows.length) {
    return {
      raw: [],
      stablecoins: [],
      totalSupply: 0,
      totalVolume: 0,
      totalTransactions: 0,
      totalActiveWallets: 0,
      supplyChange7d: 0,
      supplyChange30d: 0,
      dates: [],
    };
  }

  const sortedRows = [...rows].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const dates = [...new Set(sortedRows.map((r) => r.date))].sort();
  const latestDate = dates[dates.length - 1];
  const date7dAgo = dates[Math.max(0, dates.length - 8)] || dates[0];
  const date30dAgo = dates[Math.max(0, dates.length - 31)] || dates[0];

  const coinMap = new Map<string, StablecoinDataRow[]>();
  for (const row of sortedRows) {
    const key = row.symbol || row.name || row.mint_address;
    if (!key) continue;
    if (!coinMap.has(key)) coinMap.set(key, []);
    coinMap.get(key)!.push(row);
  }

  const stablecoins: StablecoinSummary[] = [];

  for (const [, coinRows] of coinMap) {
    const latestRow = coinRows.findLast((r) => r.date === latestDate) || coinRows[coinRows.length - 1];
    const row7dAgo = coinRows.findLast((r) => r.date <= date7dAgo);
    const row30dAgo = coinRows.findLast((r) => r.date <= date30dAgo);

    const currentSupply = latestRow.daily_supply;
    const supply7d = row7dAgo?.daily_supply || currentSupply;
    const supply30d = row30dAgo?.daily_supply || currentSupply;

    stablecoins.push({
      name: latestRow.name || latestRow.symbol,
      symbol: latestRow.symbol || latestRow.name,
      mint_address: latestRow.mint_address,
      current_supply: currentSupply,
      supply_change_7d: supply7d > 0 ? ((currentSupply - supply7d) / supply7d) * 100 : 0,
      supply_change_30d: supply30d > 0 ? ((currentSupply - supply30d) / supply30d) * 100 : 0,
      daily_volume: latestRow.daily_transfer_volume,
      daily_transactions: latestRow.daily_transactions,
      daily_active_wallets: latestRow.daily_active_wallets,
      latest_date: latestRow.date,
      history: coinRows,
    });
  }

  stablecoins.sort((a, b) => b.current_supply - a.current_supply);

  const totalSupply = stablecoins.reduce((s, c) => s + c.current_supply, 0);
  const totalVolume = stablecoins.reduce((s, c) => s + c.daily_volume, 0);
  const totalTransactions = stablecoins.reduce((s, c) => s + c.daily_transactions, 0);
  const totalActiveWallets = stablecoins.reduce((s, c) => s + c.daily_active_wallets, 0);

  const latestRows = sortedRows.filter((r) => r.date === latestDate);
  const rows7d = sortedRows.filter((r) => r.date === date7dAgo);
  const rows30d = sortedRows.filter((r) => r.date === date30dAgo);

  const totalSupply7d = rows7d.reduce((s, r) => s + r.daily_supply, 0);
  const totalSupply30d = rows30d.reduce((s, r) => s + r.daily_supply, 0);
  const currentTotalFromLatest = latestRows.reduce((s, r) => s + r.daily_supply, 0);

  return {
    raw: sortedRows,
    stablecoins,
    totalSupply,
    totalVolume,
    totalTransactions,
    totalActiveWallets,
    supplyChange7d: totalSupply7d > 0 ? ((currentTotalFromLatest - totalSupply7d) / totalSupply7d) * 100 : 0,
    supplyChange30d: totalSupply30d > 0 ? ((currentTotalFromLatest - totalSupply30d) / totalSupply30d) * 100 : 0,
    dates,
  };
}

let cachedData: DashboardData | null = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchDashboardData(): Promise<DashboardData> {
  if (cachedData && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedData;
  }

  const res = await fetch(API_URL, { next: { revalidate: 300 } });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }

  const json = await res.json();

  let rawRows: Record<string, unknown>[];
  if (json.query_result?.data?.rows) {
    rawRows = json.query_result.data.rows;
  } else if (json.data?.rows) {
    rawRows = json.data.rows;
  } else if (Array.isArray(json)) {
    rawRows = json;
  } else if (json.rows) {
    rawRows = json.rows;
  } else {
    rawRows = [json];
  }

  const normalized = rawRows.map(normalizeRow);
  cachedData = processData(normalized);
  cacheTime = Date.now();
  return cachedData;
}

export async function fetchStablecoinData(symbol: string): Promise<StablecoinSummary | null> {
  const data = await fetchDashboardData();
  return (
    data.stablecoins.find(
      (c) =>
        c.symbol.toLowerCase() === symbol.toLowerCase() ||
        c.name.toLowerCase() === symbol.toLowerCase()
    ) || null
  );
}
