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

  if (loading) return <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12"><DashboardSkeleton /></div>;
  if (error || !data) return <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12"><ErrorState message={error || "No data available"} onRetry={refresh} /></div>;

  return (
    <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">Stablecoins</h1>
        <p className="text-sm text-[#64748B] mt-1">Browse and explore every stablecoin in the Solana ecosystem</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {data.stablecoins.map((coin) => {
          const issuer = STABLECOIN_ISSUERS[coin.symbol];
          return (
            <Link key={coin.symbol} href={`/stablecoins/${slugify(coin.symbol)}`} className="glass-card p-5 group text-center">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[13px] font-bold mx-auto mb-3"
                style={{ backgroundColor: getStablecoinColor(coin.symbol) }}>{coin.symbol.slice(0, 2)}</div>
              <div className="text-sm font-semibold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors mb-0.5">{coin.symbol}</div>
              <div className="text-xs text-[#64748B] mb-2">{issuer?.issuer || coin.name}</div>
              <div className="text-sm font-semibold text-[#0F172A]">{formatCurrency(coin.current_supply)}</div>
              <div className="text-xs text-[#64748B] mt-0.5">{formatNumber(coin.daily_active_wallets)} wallets</div>
            </Link>
          );
        })}
      </div>
      <StablecoinTable data={data} />
    </div>
  );
}
