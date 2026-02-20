import cron from "node-cron";
import { updateStablecoinData } from "./update-data";

// Run every 6 hours: 0 */6 * * *
// For testing, use: */5 * * * * (every 5 minutes)
const CRON_SCHEDULE = "0 */6 * * *";

export function startCronJobs() {
  console.log("[Cron] Starting scheduled jobs...");
  console.log(`[Cron] Schedule: ${CRON_SCHEDULE} (every 6 hours)`);

  cron.schedule(CRON_SCHEDULE, async () => {
    console.log(`[Cron] Running scheduled update at ${new Date().toISOString()}`);
    try {
      await updateStablecoinData();
      console.log("[Cron] Update completed successfully");
    } catch (error) {
      console.error("[Cron] Update failed:", error);
    }
  });

  // Run immediately on startup
  console.log("[Cron] Running initial data update...");
  updateStablecoinData()
    .then(() => console.log("[Cron] Initial update complete"))
    .catch((error) => console.error("[Cron] Initial update failed:", error));
}
