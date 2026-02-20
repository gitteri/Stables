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

  if (loading) return <div className="px-6 lg:px-8 py-6"><DashboardSkeleton /></div>;
  if (error || !data) return <div className="px-6 lg:px-8 py-6"><ErrorState message={error || "No data available"} onRetry={refresh} /></div>;

  return (
    <div className="px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--sol-text)] tracking-tight">Stablecoins</h1>
        <p className="text-[13px] text-[var(--sol-text-muted)] mt-0.5">Browse and explore every stablecoin in the Solana ecosystem</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
        {data.stablecoins.map((coin) => {
          const issuer = STABLECOIN_ISSUERS[coin.symbol];
          return (
            <Link key={coin.symbol} href={`/stablecoins/${slugify(coin.symbol)}`} className="glass-card p-4 group text-center">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[13px] font-bold mx-auto mb-2.5"
                style={{ backgroundColor: getStablecoinColor(coin.symbol) }}>{coin.symbol.slice(0, 2)}</div>
              <div className="text-[13px] font-semibold text-[var(--sol-text)] group-hover:text-[#9945FF] transition-colors mb-0.5">{coin.symbol}</div>
              <div className="text-[11px] text-[var(--sol-text-muted)] mb-2">{issuer?.issuer || coin.name}</div>
              <div className="text-[13px] font-semibold text-[var(--sol-text)]">{formatCurrency(coin.current_supply)}</div>
              <div className="text-[11px] text-[var(--sol-text-muted)] mt-0.5">{formatNumber(coin.daily_active_wallets)} wallets</div>
            </Link>
          );
        })}
      </div>
      <StablecoinTable data={data} />
    </div>
  );
}
