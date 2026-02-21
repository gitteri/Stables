import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { DataProvider } from "@/context/DataContext";

export const metadata: Metadata = {
  title: "Solana Stables | Stablecoin Analytics Dashboard",
  description:
    "Comprehensive analytics dashboard for stablecoins on Solana. Track supply, volume, transactions, and growth across the ecosystem.",
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
          <Sidebar />
          <main className="pl-[60px] min-h-screen">{children}</main>
        </DataProvider>
      </body>
    </html>
  );
}
