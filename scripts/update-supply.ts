#!/usr/bin/env tsx

// Script to fetch Solana on-chain supply data
// Run with: npm run update-supply

import { updateAllSupplyData } from "../src/lib/fetch-supply";

console.log("=".repeat(60));
console.log("Solana On-Chain Supply Update");
console.log("=".repeat(60));

updateAllSupplyData()
  .then(() => {
    console.log("\n✅ Supply data update completed!");
    console.log("=".repeat(60));
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Supply update failed:");
    console.error(error);
    console.log("=".repeat(60));
    process.exit(1);
  });
