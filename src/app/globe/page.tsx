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
  loading: () => <div className="skeleton h-[560px] rounded-xl" />,
});

export default function GlobePage() {
  const { data, loading, error, refresh } = useData();

  if (loading) return <div className="px-6 lg:px-8 py-6"><DashboardSkeleton /></div>;
  if (error || !data) return <div className="px-6 lg:px-8 py-6"><ErrorState message={error || "No data available"} onRetry={refresh} /></div>;

  return (
    <div className="px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--sol-text)] tracking-tight">Globe</h1>
        <p className="text-[13px] text-[var(--sol-text-muted)] mt-0.5">Explore the worldwide network of stablecoin issuers on Solana</p>
      </div>
      <div className="glass-card overflow-hidden mb-6">
        <GlobeVisualization stablecoins={data.stablecoins} height="560px" />
      </div>
      <h2 className="text-[16px] font-semibold text-[var(--sol-text)] mb-3">Stablecoin Issuers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.stablecoins.map((coin) => {
          const issuer = STABLECOIN_ISSUERS[coin.symbol];
          return (
            <Link key={coin.symbol} href={`/stablecoins/${slugify(coin.symbol)}`} className="glass-card p-4 group">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ backgroundColor: getStablecoinColor(coin.symbol) }}>
                  {coin.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[var(--sol-text)] group-hover:text-[#9945FF] transition-colors">{coin.symbol}</div>
                  <div className="text-[11px] text-[var(--sol-text-muted)]">{issuer?.issuer || coin.name}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div><div className="text-[11px] text-[var(--sol-text-muted)] mb-0.5">Supply</div><div className="text-[13px] font-semibold text-[var(--sol-text)]">{formatCurrency(coin.current_supply)}</div></div>
                <div><div className="text-[11px] text-[var(--sol-text-muted)] mb-0.5">Region</div><div className="text-[12px] text-[var(--sol-text-secondary)]">{issuer?.region || "Global"}</div></div>
                <div><div className="text-[11px] text-[var(--sol-text-muted)] mb-0.5">Type</div><div className="text-[12px] text-[var(--sol-text-secondary)]">{issuer?.type || "Stablecoin"}</div></div>
                <div><div className="text-[11px] text-[var(--sol-text-muted)] mb-0.5">Volume</div><div className="text-[13px] font-semibold text-[var(--sol-text)]">{formatCurrency(coin.daily_volume)}</div></div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
