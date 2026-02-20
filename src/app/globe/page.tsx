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

  if (loading) return <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12"><DashboardSkeleton /></div>;
  if (error || !data) return <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12"><ErrorState message={error || "No data available"} onRetry={refresh} /></div>;

  return (
    <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">Globe</h1>
        <p className="text-sm text-[#64748B] mt-1">Explore the worldwide network of stablecoin issuers on Solana</p>
      </div>
      <div className="glass-card overflow-hidden mb-8">
        <GlobeVisualization stablecoins={data.stablecoins} height="560px" />
      </div>
      <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Stablecoin Issuers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.stablecoins.map((coin) => {
          const issuer = STABLECOIN_ISSUERS[coin.symbol];
          return (
            <Link key={coin.symbol} href={`/stablecoins/${slugify(coin.symbol)}`} className="glass-card p-5 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ backgroundColor: getStablecoinColor(coin.symbol) }}>
                  {coin.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors">{coin.symbol}</div>
                  <div className="text-xs text-[#64748B]">{issuer?.issuer || coin.name}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-xs text-[#64748B] mb-0.5">Supply</div><div className="text-sm font-semibold text-[#0F172A]">{formatCurrency(coin.current_supply)}</div></div>
                <div><div className="text-xs text-[#64748B] mb-0.5">Region</div><div className="text-xs text-[#475569]">{issuer?.region || "Global"}</div></div>
                <div><div className="text-xs text-[#64748B] mb-0.5">Type</div><div className="text-xs text-[#475569]">{issuer?.type || "Stablecoin"}</div></div>
                <div><div className="text-xs text-[#64748B] mb-0.5">Volume</div><div className="text-sm font-semibold text-[#0F172A]">{formatCurrency(coin.daily_volume)}</div></div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
