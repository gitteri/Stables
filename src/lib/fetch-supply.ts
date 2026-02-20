import { Connection, PublicKey } from "@solana/web3.js";
import { getDb } from "./db";

// Use public RPC endpoint (consider using Helius/QuickNode for production)
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

export async function fetchSupplyForMint(
  connection: Connection,
  mintAddress: string
): Promise<number> {
  try {
    const mintPubkey = new PublicKey(mintAddress);
    const tokenSupply = await connection.getTokenSupply(mintPubkey);

    // Convert from raw amount to UI amount using decimals
    const supply = Number(tokenSupply.value.uiAmount) || 0;

    console.log(`  ${mintAddress.slice(0, 8)}... supply: ${supply.toLocaleString()}`);
    return supply;
  } catch (error) {
    console.error(`  Error fetching supply for ${mintAddress}:`, error instanceof Error ? error.message : error);
    return 0;
  }
}

export async function updateAllSupplyData() {
  console.log("[Supply] Fetching on-chain supply data from Solana...");
  console.log(`[Supply] RPC: ${RPC_URL}`);

  const connection = new Connection(RPC_URL, "confirmed");
  const db = getDb();

  // Get unique mint addresses from the database
  const mints = db.prepare(`
    SELECT DISTINCT mint_address, mint_name
    FROM stablecoin_data
    ORDER BY mint_name
  `).all() as Array<{ mint_address: string; mint_name: string }>;

  console.log(`[Supply] Found ${mints.length} unique tokens to update`);

  const supplyMap = new Map<string, number>();

  // Fetch supply for each mint with rate limiting
  for (let i = 0; i < mints.length; i++) {
    const { mint_address, mint_name } = mints[i];
    console.log(`[Supply] ${i + 1}/${mints.length} Fetching ${mint_name}...`);

    const supply = await fetchSupplyForMint(connection, mint_address);
    supplyMap.set(mint_address, supply);

    // Rate limit: wait 100ms between requests
    if (i < mints.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Update database with supply data
  console.log("[Supply] Updating database...");
  const updateStmt = db.prepare(`
    UPDATE stablecoin_data
    SET supply = ?
    WHERE mint_address = ?
  `);

  const updateMany = db.transaction(() => {
    for (const [mintAddress, supply] of supplyMap.entries()) {
      updateStmt.run(supply, mintAddress);
    }
  });

  updateMany();

  console.log(`[Supply] Successfully updated supply for ${supplyMap.size} tokens`);

  // Log summary
  const totalSupply = Array.from(supplyMap.values()).reduce((sum, val) => sum + val, 0);
  console.log(`[Supply] Total supply across all tokens: $${totalSupply.toLocaleString()}`);
}

// Run if called directly
if (require.main === module) {
  updateAllSupplyData()
    .then(() => {
      console.log("[Supply] Complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[Supply] Failed:", error);
      process.exit(1);
    });
}
