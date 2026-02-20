"use client";

import { useData } from "@/context/DataContext";
import { DashboardSkeleton, ErrorState } from "@/components/LoadingState";
import StablecoinTable from "@/components/StablecoinTable";
import { formatCurrency, formatNumber } from "@/lib/format";
import { getStablecoinColor, STABLECOIN_ISSUERS } from "@/lib/types";
import { slugify } from "@/lib/format";
import Link from "next/link";

export default function StablecoinsPage() {
  const { data, loading, error, refresh } = useData();

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState message={error || "No data available"} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
          <span className="gradient-text">All Stablecoins</span>{" "}
          <span className="text-sol-text">on Solana</span>
        </h1>
        <p className="text-sol-text-muted text-lg">
          Browse and explore every stablecoin in the Solana ecosystem
        </p>
      </div>

      {/* Quick Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {data.stablecoins.map((coin) => {
          const issuer = STABLECOIN_ISSUERS[coin.symbol];
          const slug = slugify(coin.symbol);
          return (
            <Link
              key={coin.symbol}
              href={`/stablecoins/${slug}`}
              className="glass-card p-4 group cursor-pointer text-center"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-3"
                style={{
                  backgroundColor: getStablecoinColor(coin.symbol),
                }}
              >
                {coin.symbol.slice(0, 2)}
              </div>
              <div className="font-semibold text-sol-text group-hover:text-sol-purple transition-colors mb-1">
                {coin.symbol}
              </div>
              <div className="text-xs text-sol-text-muted mb-2">
                {issuer?.issuer || coin.name}
              </div>
              <div className="text-sm font-semibold text-sol-text">
                {formatCurrency(coin.current_supply)}
              </div>
              <div className="text-xs text-sol-text-muted mt-1">
                {formatNumber(coin.daily_active_wallets)} wallets
              </div>
            </Link>
          );
        })}
      </div>

      {/* Full Table */}
      <StablecoinTable data={data} />
    </div>
  );
}
