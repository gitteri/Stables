"use client";

import dynamic from "next/dynamic";
import { useData } from "@/context/DataContext";
import { DashboardSkeleton, ErrorState } from "@/components/LoadingState";
import { formatCurrency } from "@/lib/format";
import { STABLECOIN_ISSUERS, getStablecoinColor } from "@/lib/types";
import Link from "next/link";
import { slugify } from "@/lib/format";

const GlobeVisualization = dynamic(() => import("@/components/Globe"), {
  ssr: false,
  loading: () => <div className="skeleton h-[600px] rounded-xl" />,
});

export default function GlobePage() {
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
          <span className="gradient-text">Global</span>{" "}
          <span className="text-sol-text">Stablecoin Network</span>
        </h1>
        <p className="text-sol-text-muted text-lg">
          Explore the worldwide network of stablecoin issuers operating on Solana
        </p>
      </div>

      {/* Globe */}
      <div className="glass-card overflow-hidden mb-8">
        <GlobeVisualization stablecoins={data.stablecoins} height="600px" />
      </div>

      {/* Issuer Cards */}
      <h2 className="text-xl font-semibold text-sol-text mb-4">
        Stablecoin Issuers
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.stablecoins.map((coin) => {
          const issuer = STABLECOIN_ISSUERS[coin.symbol];
          return (
            <Link
              key={coin.symbol}
              href={`/stablecoins/${slugify(coin.symbol)}`}
              className="glass-card p-5 group cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: getStablecoinColor(coin.symbol) }}
                >
                  {coin.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-sol-text group-hover:text-sol-purple transition-colors">
                    {coin.symbol}
                  </div>
                  <div className="text-xs text-sol-text-muted">
                    {issuer?.issuer || coin.name}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-sol-text-muted mb-0.5">Supply</div>
                  <div className="text-sm font-semibold text-sol-text">
                    {formatCurrency(coin.current_supply)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-sol-text-muted mb-0.5">Region</div>
                  <div className="text-sm text-sol-text">
                    {issuer?.region || "Global"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-sol-text-muted mb-0.5">Type</div>
                  <div className="text-sm text-sol-text">
                    {issuer?.type || "Stablecoin"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-sol-text-muted mb-0.5">Volume</div>
                  <div className="text-sm font-semibold text-sol-text">
                    {formatCurrency(coin.daily_volume)}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
