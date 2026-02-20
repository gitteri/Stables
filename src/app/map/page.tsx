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
  loading: () => <div className="glass-card p-5"><div className="skeleton h-[360px]" /></div>,
});

export default function MapPage() {
  const { data, loading, error, refresh } = useData();

  if (loading) return <div className="px-6 lg:px-8 py-6"><DashboardSkeleton /></div>;
  if (error || !data) return <div className="px-6 lg:px-8 py-6"><ErrorState message={error || "No data available"} onRetry={refresh} /></div>;

  const regionMap = new Map<string, typeof data.stablecoins>();
  for (const coin of data.stablecoins) {
    const issuer = STABLECOIN_ISSUERS[coin.symbol];
    const region = issuer?.region || "Other";
    if (!regionMap.has(region)) regionMap.set(region, []);
    regionMap.get(region)!.push(coin);
  }

  return (
    <div className="px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--sol-text)] tracking-tight">Issuer Map</h1>
        <p className="text-[13px] text-[var(--sol-text-muted)] mt-0.5">Geographic distribution of stablecoin issuers on Solana</p>
      </div>
      <div className="mb-6"><WorldMap stablecoins={data.stablecoins} /></div>
      <h2 className="text-[16px] font-semibold text-[var(--sol-text)] mb-3">Regional Breakdown</h2>
      <div className="space-y-4">
        {[...regionMap.entries()]
          .sort((a, b) => b[1].reduce((s, c) => s + c.current_supply, 0) - a[1].reduce((s, c) => s + c.current_supply, 0))
          .map(([region, coins]) => (
            <div key={region} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-semibold text-[var(--sol-text)]">{region}</h3>
                <span className="text-[12px] text-[var(--sol-text-muted)]">
                  Total: <span className="font-semibold text-[var(--sol-text)]">{formatCurrency(coins.reduce((s, c) => s + c.current_supply, 0))}</span>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {coins.map((coin) => {
                  const issuer = STABLECOIN_ISSUERS[coin.symbol];
                  return (
                    <Link key={coin.symbol} href={`/stablecoins/${slugify(coin.symbol)}`}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-[var(--sol-bg-secondary)] transition-colors">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: getStablecoinColor(coin.symbol) }}>{coin.symbol.slice(0, 2)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-[var(--sol-text)]">{coin.symbol}</div>
                        <div className="text-[11px] text-[var(--sol-text-muted)] truncate">{issuer?.issuer || coin.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[13px] font-semibold text-[var(--sol-text)]">{formatCurrency(coin.current_supply)}</div>
                        <div className="text-[11px] text-[var(--sol-text-muted)]">{formatNumber(coin.daily_transactions)} txns</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
