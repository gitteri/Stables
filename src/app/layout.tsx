import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { DataProvider } from "@/context/DataContext";

export const metadata: Metadata = {
  title: "Solana Stables | Stablecoin Analytics Dashboard",
  description:
    "Comprehensive analytics dashboard for stablecoins on Solana. Track supply, volume, transactions, and growth across the ecosystem.",
  keywords: [
    "Solana",
    "stablecoin",
    "USDC",
    "USDT",
    "analytics",
    "dashboard",
    "DeFi",
    "crypto",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <DataProvider>
          <Sidebar />
          <div className="ml-[240px] min-h-screen bg-[var(--sol-bg)]">
            <main>{children}</main>
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
