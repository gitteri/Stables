#!/usr/bin/env tsx

// Manual script to update stablecoin data
// Run with: npm run update-data

import { updateStablecoinData } from "../src/lib/update-data";

console.log("=".repeat(60));
console.log("Stablecoin Data Update Script");
console.log("=".repeat(60));

updateStablecoinData()
  .then(() => {
    console.log("\n✅ Data update completed successfully!");
    console.log("=".repeat(60));
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Data update failed:");
    console.error(error);
    console.log("=".repeat(60));
    process.exit(1);
  });
