"use client";

import dynamic from "next/dynamic";
import { useData } from "@/context/DataContext";
import { DashboardSkeleton, ErrorState } from "@/components/LoadingState";
import { formatCurrency, formatNumber } from "@/lib/format";
import { STABLECOIN_ISSUERS, getStablecoinColor } from "@/lib/types";
import Link from "next/link";
import { slugify } from "@/lib/format";

const WorldMap = dynamic(() => import("@/components/WorldMap"), {
  ssr: false,
  loading: () => <div className="glass-card p-6"><div className="skeleton h-[400px]" /></div>,
});

export default function MapPage() {
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

  // Group by region
  const regionMap = new Map<string, typeof data.stablecoins>();
  for (const coin of data.stablecoins) {
    const issuer = STABLECOIN_ISSUERS[coin.symbol];
    const region = issuer?.region || "Other";
    if (!regionMap.has(region)) regionMap.set(region, []);
    regionMap.get(region)!.push(coin);
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
          <span className="gradient-text">Global Issuer</span>{" "}
          <span className="text-sol-text">Map</span>
        </h1>
        <p className="text-sol-text-muted text-lg">
          Geographic distribution of stablecoin issuers on Solana
        </p>
      </div>

      {/* Map */}
      <div className="mb-8">
        <WorldMap stablecoins={data.stablecoins} />
      </div>

      {/* Regional Breakdown */}
      <h2 className="text-xl font-semibold text-sol-text mb-4">
        Regional Breakdown
      </h2>
      <div className="space-y-6">
        {[...regionMap.entries()]
          .sort((a, b) => {
            const totalA = a[1].reduce((s, c) => s + c.current_supply, 0);
            const totalB = b[1].reduce((s, c) => s + c.current_supply, 0);
            return totalB - totalA;
          })
          .map(([region, coins]) => {
            const totalSupply = coins.reduce(
              (s, c) => s + c.current_supply,
              0
            );
            return (
              <div key={region} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-sol-text">
                    {region}
                  </h3>
                  <span className="text-sm text-sol-text-muted">
                    Total Supply:{" "}
                    <span className="font-semibold text-sol-text">
                      {formatCurrency(totalSupply)}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {coins.map((coin) => {
                    const issuer = STABLECOIN_ISSUERS[coin.symbol];
                    return (
                      <Link
                        key={coin.symbol}
                        href={`/stablecoins/${slugify(coin.symbol)}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-sol-card-hover transition-colors border border-transparent hover:border-sol-border"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{
                            backgroundColor: getStablecoinColor(coin.symbol),
                          }}
                        >
                          {coin.symbol.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-sol-text">
                            {coin.symbol}
                          </div>
                          <div className="text-xs text-sol-text-muted truncate">
                            {issuer?.issuer || coin.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-sol-text">
                            {formatCurrency(coin.current_supply)}
                          </div>
                          <div className="text-xs text-sol-text-muted">
                            {formatNumber(coin.daily_transactions)} txns
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
