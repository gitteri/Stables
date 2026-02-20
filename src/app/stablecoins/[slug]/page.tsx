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

  if (loading) return <div className="px-6 lg:px-8 py-6"><DashboardSkeleton /></div>;
  if (error || !data) return <div className="px-6 lg:px-8 py-6"><ErrorState message={error || "No data available"} onRetry={refresh} /></div>;

  const coin = data.stablecoins.find(
    (c) => c.symbol.toLowerCase() === slug.toLowerCase() || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
  );

  if (!coin) {
    return (
      <div className="px-6 lg:px-8 py-6">
        <div className="glass-card p-10 text-center">
          <h2 className="text-[16px] font-semibold text-[var(--sol-text)] mb-1">Stablecoin Not Found</h2>
          <p className="text-[13px] text-[var(--sol-text-muted)] mb-4">Could not find a stablecoin matching &ldquo;{slug}&rdquo;</p>
          <Link href="/stablecoins" className="px-4 py-2 rounded-lg bg-[#9945FF] text-white text-[13px] font-medium hover:bg-[#7C2FE6] transition-colors">
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
    <div className="px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-[var(--sol-text-muted)] mb-5">
        <Link href="/" className="hover:text-[var(--sol-text)] transition-colors">Dashboard</Link>
        <span className="text-[var(--sol-text-light)]">/</span>
        <Link href="/stablecoins" className="hover:text-[var(--sol-text)] transition-colors">Stablecoins</Link>
        <span className="text-[var(--sol-text-light)]">/</span>
        <span className="text-[var(--sol-text)] font-medium">{coin.symbol}</span>
      </div>

      {/* Header */}
      <div className="glass-card p-5 lg:p-6 mb-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0"
            style={{ backgroundColor: color }}>{coin.symbol.slice(0, 3)}</div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-[20px] font-bold text-[var(--sol-text)]">{issuer?.name || coin.name}</h1>
              <span className="badge badge-purple">{coin.symbol}</span>
              {issuer?.type && <span className="badge badge-green">{issuer.type}</span>}
            </div>
            <p className="text-[13px] text-[var(--sol-text-muted)] max-w-3xl leading-relaxed">
              {issuer?.description || `${coin.name} is a stablecoin operating on the Solana blockchain.`}
            </p>
          </div>
          <div className="flex gap-2">
            {issuer?.website && issuer.website !== "#" && (
              <a href={issuer.website} target="_blank" rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[var(--sol-bg-secondary)] border border-[var(--sol-border)] text-[13px] text-[var(--sol-text-secondary)] hover:border-[#D1D5DB] transition-colors">
                Website
              </a>
            )}
            {coin.mint_address && (
              <a href={`https://solscan.io/token/${coin.mint_address}`} target="_blank" rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[#9945FF] text-white text-[13px] font-medium hover:bg-[#7C2FE6] transition-colors">
                Solscan
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="glass-card p-4">
          <div className="text-[11px] text-[var(--sol-text-muted)] mb-1 uppercase tracking-wider font-medium">Circulating Supply</div>
          <div className="text-[18px] font-bold text-[var(--sol-text)]">{formatCurrency(coin.current_supply)}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-[11px] font-semibold ${coin.supply_change_7d >= 0 ? "text-[#059669]" : "text-[#DC2626]"}`}>
              {coin.supply_change_7d >= 0 ? "\u2191" : "\u2193"} {formatPercent(coin.supply_change_7d).replace("+", "")}
            </span>
            <span className="text-[10px] text-[var(--sol-text-light)]">7d</span>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="text-[11px] text-[var(--sol-text-muted)] mb-1 uppercase tracking-wider font-medium">24h Volume</div>
          <div className="text-[18px] font-bold text-[var(--sol-text)]">{formatCurrency(coin.daily_volume)}</div>
          <div className="text-[10px] text-[var(--sol-text-light)] mt-1">Transfer volume</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-[11px] text-[var(--sol-text-muted)] mb-1 uppercase tracking-wider font-medium">24h Transactions</div>
          <div className="text-[18px] font-bold text-[var(--sol-text)]">{formatNumber(coin.daily_transactions)}</div>
          <div className="text-[10px] text-[var(--sol-text-light)] mt-1">Daily transfers</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-[11px] text-[var(--sol-text-muted)] mb-1 uppercase tracking-wider font-medium">Market Dominance</div>
          <div className="text-[18px] font-bold text-[var(--sol-text)]">{dominance.toFixed(2)}%</div>
          <div className="text-[10px] text-[var(--sol-text-light)] mt-1">Of Solana stablecoins</div>
        </div>
      </div>

      {/* Charts + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2">
          <HistoryCharts coin={coin} color={color} />
        </div>
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-[14px] font-semibold text-[var(--sol-text)] mb-3">Token Information</h3>
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
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-[var(--sol-border-light)] last:border-0">
                  <span className="text-[12px] text-[var(--sol-text-muted)]">{label}</span>
                  <span className={`text-[12px] font-medium ${
                    (label === "7d Change" || label === "30d Change") && typeof val === "string" && val.startsWith("+") ? "text-[#059669]"
                    : (label === "7d Change" || label === "30d Change") && typeof val === "string" && val.startsWith("-") ? "text-[#DC2626]"
                    : label === "Mint" ? "text-[#9945FF] font-mono"
                    : "text-[var(--sol-text)]"
                  }`}>{val}</span>
                </div>
              ))}
            </div>
          </div>
          {issuer && (
            <div className="glass-card p-5">
              <h3 className="text-[14px] font-semibold text-[var(--sol-text)] mb-3">Issuer Information</h3>
              <div className="space-y-0">
                {[
                  ["Issuer", issuer.issuer],
                  ["Type", issuer.type],
                  ["Region", issuer.region],
                ].map(([label, val], i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-[var(--sol-border-light)] last:border-0">
                    <span className="text-[12px] text-[var(--sol-text-muted)]">{label}</span>
                    <span className="text-[12px] font-medium text-[var(--sol-text)]">{val}</span>
                  </div>
                ))}
                {issuer.website && issuer.website !== "#" && (
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[12px] text-[var(--sol-text-muted)]">Website</span>
                    <a href={issuer.website} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[#9945FF] hover:underline">
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
        <Link href="/stablecoins" className="px-4 py-2 rounded-lg bg-[var(--sol-bg-secondary)] border border-[var(--sol-border)] text-[13px] text-[var(--sol-text-muted)] hover:text-[var(--sol-text)] hover:border-[#D1D5DB] transition-colors">
          View All Stablecoins
        </Link>
      </div>
    </div>
  );
}
