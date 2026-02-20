"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useData } from "@/context/DataContext";
import { DashboardSkeleton, ErrorState } from "@/components/LoadingState";
import { STABLECOIN_ISSUERS, getStablecoinColor } from "@/lib/types";
import { formatCurrency, formatNumber, formatPercent, formatDate, shortenAddress } from "@/lib/format";

const HistoryCharts = dynamic(() => import("@/components/charts/HistoryCharts"), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <div className="glass-card p-5"><div className="skeleton h-[280px]" /></div>
      <div className="glass-card p-5"><div className="skeleton h-[200px]" /></div>
    </div>
  ),
});

export default function StablecoinDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data, loading, error, refresh } = useData();

  if (loading) return <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12"><DashboardSkeleton /></div>;
  if (error || !data) return <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12"><ErrorState message={error || "No data available"} onRetry={refresh} /></div>;

  const coin = data.stablecoins.find(
    (c) => c.symbol.toLowerCase() === slug.toLowerCase() || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
  );

  if (!coin) {
    return (
      <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12">
        <div className="glass-card p-10 text-center">
          <h2 className="text-base font-semibold text-[#0F172A] mb-1">Stablecoin Not Found</h2>
          <p className="text-sm text-[#64748B] mb-4">Could not find a stablecoin matching &ldquo;{slug}&rdquo;</p>
          <Link href="/stablecoins" className="px-4 py-2 rounded-lg bg-[#4F46E5] text-white text-sm font-semibold hover:bg-[#4338CA] transition-colors">
            View All Stablecoins
          </Link>
        </div>
      </div>
    );
  }

  const issuer = STABLECOIN_ISSUERS[coin.symbol];
  const color = getStablecoinColor(coin.symbol);
  const dominance = data.totalSupply > 0 ? (coin.current_supply / data.totalSupply) * 100 : 0;

  return (
    <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-6">
        <Link href="/" className="hover:text-[#0F172A] transition-colors">Dashboard</Link>
        <span className="text-[#94A3B8]">/</span>
        <Link href="/stablecoins" className="hover:text-[#0F172A] transition-colors">Stablecoins</Link>
        <span className="text-[#94A3B8]">/</span>
        <span className="text-[#0F172A] font-medium">{coin.symbol}</span>
      </div>

      {/* Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
            style={{ backgroundColor: color }}>{coin.symbol.slice(0, 3)}</div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-xl font-semibold text-black">{issuer?.name || coin.name}</h1>
              <span className="badge badge-purple">{coin.symbol}</span>
              {issuer?.type && <span className="badge badge-green">{issuer.type}</span>}
            </div>
            <p className="text-sm text-[#64748B] max-w-3xl leading-relaxed">
              {issuer?.description || `${coin.name} is a stablecoin operating on the Solana blockchain.`}
            </p>
          </div>
          <div className="flex gap-2">
            {issuer?.website && issuer.website !== "#" && (
              <a href={issuer.website} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#475569] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-colors">
                Website
              </a>
            )}
            {coin.mint_address && (
              <a href={`https://solscan.io/token/${coin.mint_address}`} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-[#4F46E5] text-white text-sm font-semibold hover:bg-[#4338CA] transition-colors">
                Solscan
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex flex-col md:flex-row gap-5 mb-6">
        <div className="flex-1 glass-card p-6">
          <div className="text-sm font-medium text-[#64748B] mb-2">Circulating Supply</div>
          <div className="text-3xl font-semibold text-[#0F172A]">{formatCurrency(coin.current_supply)}</div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-xs font-semibold ${coin.supply_change_7d >= 0 ? "text-[#059669]" : "text-[#DC2626]"}`}>
              {coin.supply_change_7d >= 0 ? "\u2191" : "\u2193"} {formatPercent(coin.supply_change_7d).replace("+", "")}
            </span>
            <span className="text-xs text-[#94A3B8]">7d</span>
          </div>
        </div>
        <div className="flex-1 glass-card p-6">
          <div className="text-sm font-medium text-[#64748B] mb-2">24h Volume</div>
          <div className="text-3xl font-semibold text-[#0F172A]">{formatCurrency(coin.daily_volume)}</div>
          <div className="text-xs text-[#94A3B8] mt-2">Transfer volume</div>
        </div>
        <div className="flex-1 glass-card p-6">
          <div className="text-sm font-medium text-[#64748B] mb-2">24h Transactions</div>
          <div className="text-3xl font-semibold text-[#0F172A]">{formatNumber(coin.daily_transactions)}</div>
          <div className="text-xs text-[#94A3B8] mt-2">Daily transfers</div>
        </div>
        <div className="flex-1 glass-card p-6">
          <div className="text-sm font-medium text-[#64748B] mb-2">Market Dominance</div>
          <div className="text-3xl font-semibold text-[#0F172A]">{dominance.toFixed(2)}%</div>
          <div className="text-xs text-[#94A3B8] mt-2">Of Solana stablecoins</div>
        </div>
      </div>

      {/* Charts + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2">
          <HistoryCharts coin={coin} color={color} />
        </div>
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-[#0F172A] mb-4">Token Information</h3>
            <div className="space-y-0">
              {[
                ["Symbol", coin.symbol],
                ["Chain", "Solana"],
                ...(coin.mint_address ? [["Mint", shortenAddress(coin.mint_address)]] : []),
                ["Active Wallets", formatNumber(coin.daily_active_wallets)],
                ["7d Change", formatPercent(coin.supply_change_7d)],
                ["30d Change", formatPercent(coin.supply_change_30d)],
                ["Last Updated", formatDate(coin.latest_date)],
              ].map(([label, val], i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#F1F5F9] last:border-0">
                  <span className="text-xs text-[#64748B]">{label}</span>
                  <span className={`text-xs font-medium ${
                    (label === "7d Change" || label === "30d Change") && typeof val === "string" && val.startsWith("+") ? "text-[#059669]"
                    : (label === "7d Change" || label === "30d Change") && typeof val === "string" && val.startsWith("-") ? "text-[#DC2626]"
                    : label === "Mint" ? "text-[#4F46E5] font-mono"
                    : "text-[#0F172A]"
                  }`}>{val}</span>
                </div>
              ))}
            </div>
          </div>
          {issuer && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-[#0F172A] mb-4">Issuer Information</h3>
              <div className="space-y-0">
                {[
                  ["Issuer", issuer.issuer],
                  ["Type", issuer.type],
                  ["Region", issuer.region],
                ].map(([label, val], i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#F1F5F9] last:border-0">
                    <span className="text-xs text-[#64748B]">{label}</span>
                    <span className="text-xs font-medium text-[#0F172A]">{val}</span>
                  </div>
                ))}
                {issuer.website && issuer.website !== "#" && (
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-xs text-[#64748B]">Website</span>
                    <a href={issuer.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#4F46E5] hover:underline">
                      {new URL(issuer.website).hostname}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Link href="/stablecoins" className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] transition-colors">
          View All Stablecoins
        </Link>
      </div>
    </div>
  );
}
