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

  if (loading) return <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12"><DashboardSkeleton /></div>;
  if (error || !data) return <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12"><ErrorState message={error || "No data available"} onRetry={refresh} /></div>;

  const regionMap = new Map<string, typeof data.stablecoins>();
  for (const coin of data.stablecoins) {
    const issuer = STABLECOIN_ISSUERS[coin.symbol];
    const region = issuer?.region || "Other";
    if (!regionMap.has(region)) regionMap.set(region, []);
    regionMap.get(region)!.push(coin);
  }

  return (
    <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">Issuer Map</h1>
        <p className="text-sm text-[#64748B] mt-1">Geographic distribution of stablecoin issuers on Solana</p>
      </div>
      <div className="mb-8"><WorldMap stablecoins={data.stablecoins} /></div>
      <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Regional Breakdown</h2>
      <div className="space-y-4">
        {[...regionMap.entries()]
          .sort((a, b) => b[1].reduce((s, c) => s + c.current_supply, 0) - a[1].reduce((s, c) => s + c.current_supply, 0))
          .map(([region, coins]) => (
            <div key={region} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#0F172A]">{region}</h3>
                <span className="text-xs text-[#64748B]">
                  Total: <span className="font-semibold text-[#0F172A]">{formatCurrency(coins.reduce((s, c) => s + c.current_supply, 0))}</span>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {coins.map((coin) => {
                  const issuer = STABLECOIN_ISSUERS[coin.symbol];
                  return (
                    <Link key={coin.symbol} href={`/stablecoins/${slugify(coin.symbol)}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: getStablecoinColor(coin.symbol) }}>{coin.symbol.slice(0, 2)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#0F172A]">{coin.symbol}</div>
                        <div className="text-xs text-[#64748B] truncate">{issuer?.issuer || coin.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-[#0F172A]">{formatCurrency(coin.current_supply)}</div>
                        <div className="text-xs text-[#64748B]">{formatNumber(coin.daily_transactions)} txns</div>
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
