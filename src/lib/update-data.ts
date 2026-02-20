import { insertStablecoinData, type StablecoinRow } from "./db";
import { updateAllSupplyData } from "./fetch-supply";

const API_URL =
  "https://analytics.topledger.xyz/solana/api/queries/14117/results.json?api_key=TOPLEDGER_API_KEY_REDACTED";

export async function updateStablecoinData(includeSupply = true) {
  console.log("[Update] Fetching data from TopLedger API...");

  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`API request failed: ${res.status}`);
    }

    const json = await res.json();
    const rawRows: Array<{
      block_date: string;
      mint: string;
      mint_name: string;
      holders: number;
      volume: number;
      p2p_volume: number | null;
      fee_payer: number;
    }> = json.query_result?.data?.rows || [];

    if (!rawRows.length) {
      console.warn("[Update] No data received from API");
      return;
    }

    console.log(`[Update] Processing ${rawRows.length} rows...`);

    const rows: StablecoinRow[] = rawRows.map((row) => ({
      date: row.block_date.split("T")[0],
      mint_address: row.mint,
      mint_name: row.mint_name,
      holders: row.holders || 0,
      volume: row.volume || 0,
      p2p_volume: row.p2p_volume,
      transactions: row.fee_payer || 0,
      supply: 0, // Will be updated by supply fetch
    }));

    insertStablecoinData(rows);

    console.log(`[Update] Successfully updated ${rows.length} records`);
    console.log(`[Update] Date range: ${rows[rows.length - 1].date} to ${rows[0].date}`);
    console.log(`[Update] Unique tokens: ${new Set(rows.map(r => r.mint_name)).size}`);

    // Fetch on-chain supply data
    if (includeSupply) {
      console.log("\n");
      await updateAllSupplyData();
    }
  } catch (error) {
    console.error("[Update] Error updating data:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  updateStablecoinData()
    .then(() => {
      console.log("[Update] Complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[Update] Failed:", error);
      process.exit(1);
    });
}
