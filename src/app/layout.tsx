import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
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
      <body className="antialiased bg-sol-darker text-sol-text">
        <DataProvider>
          <Navbar />
          <main className="pt-16 min-h-screen">{children}</main>
          <footer className="border-t border-sol-border py-8 mt-12">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-sol-purple to-sol-green" />
                  <span className="text-sm font-semibold gradient-text">
                    Solana Stables
                  </span>
                </div>
                <p className="text-xs text-sol-text-muted text-center">
                  Data powered by TopLedger Analytics. Built on Solana.
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-sol-text-muted">
                    Real-time stablecoin analytics
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </DataProvider>
      </body>
    </html>
  );
}
