// This file should be imported in the main app to start cron jobs
// In Next.js, we'll add this to the layout or use middleware

import { startCronJobs } from "./cron";

let initialized = false;

export function initializeApp() {
  if (initialized) return;

  // Only run cron jobs in server-side environment
  if (typeof window === "undefined") {
    console.log("[Startup] Initializing application...");
    startCronJobs();
    initialized = true;
  }
}
