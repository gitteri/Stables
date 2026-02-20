"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useData } from "@/context/DataContext";
import { DashboardSkeleton, ErrorState } from "@/components/LoadingState";
import { STABLECOIN_ISSUERS, getStablecoinColor } from "@/lib/types";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatDate,
  shortenAddress,
} from "@/lib/format";

const HistoryCharts = dynamic(
  () => import("@/components/charts/HistoryCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="glass-card p-6"><div className="skeleton h-[300px]" /></div>
        <div className="glass-card p-6"><div className="skeleton h-[300px]" /></div>
      </div>
    ),
  }
);

export default function StablecoinDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
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

  const coin = data.stablecoins.find(
    (c) =>
      c.symbol.toLowerCase() === slug.toLowerCase() ||
      c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
  );

  if (!coin) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card p-12 text-center">
          <h2 className="text-xl font-semibold text-sol-text mb-2">
            Stablecoin Not Found
          </h2>
          <p className="text-sol-text-muted mb-6">
            Could not find a stablecoin matching &ldquo;{slug}&rdquo;
          </p>
          <Link
            href="/stablecoins"
            className="px-6 py-2.5 rounded-lg bg-sol-purple/20 text-sol-purple border border-sol-purple/30 hover:bg-sol-purple/30 transition-all font-medium"
          >
            View All Stablecoins
          </Link>
        </div>
      </div>
    );
  }

  const issuer = STABLECOIN_ISSUERS[coin.symbol];
  const color = getStablecoinColor(coin.symbol);
  const totalSupply = data.totalSupply;
  const dominance = totalSupply > 0 ? (coin.current_supply / totalSupply) * 100 : 0;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-sol-text-muted mb-6">
        <Link href="/" className="hover:text-sol-text transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <Link
          href="/stablecoins"
          className="hover:text-sol-text transition-colors"
        >
          Stablecoins
        </Link>
        <span>/</span>
        <span className="text-sol-text">{coin.symbol}</span>
      </div>

      {/* Header */}
      <div className="glass-card p-6 lg:p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {coin.symbol.slice(0, 3)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-sol-text">
                {issuer?.name || coin.name}
              </h1>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-sol-purple/10 text-sol-purple border border-sol-purple/20">
                {coin.symbol}
              </span>
              {issuer?.type && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-sol-green/10 text-sol-green border border-sol-green/20">
                  {issuer.type}
                </span>
              )}
            </div>
            <p className="text-sol-text-muted max-w-3xl">
              {issuer?.description || `${coin.name} is a stablecoin operating on the Solana blockchain.`}
            </p>
          </div>
          <div className="flex gap-3">
            {issuer?.website && issuer.website !== "#" && (
              <a
                href={issuer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-sol-card border border-sol-border text-sm text-sol-text hover:border-sol-purple/30 transition-all"
              >
                Website
              </a>
            )}
            {coin.mint_address && (
              <a
                href={`https://solscan.io/token/${coin.mint_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-sol-purple/20 text-sol-purple border border-sol-purple/30 text-sm font-medium hover:bg-sol-purple/30 transition-all"
              >
                Solscan
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5">
          <div className="text-xs text-sol-text-muted mb-1 uppercase tracking-wider">
            Circulating Supply
          </div>
          <div className="text-xl font-bold text-sol-text">
            {formatCurrency(coin.current_supply)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs font-medium ${
                coin.supply_change_7d >= 0 ? "text-sol-green" : "text-red-400"
              }`}
            >
              {formatPercent(coin.supply_change_7d)}
            </span>
            <span className="text-xs text-sol-text-muted">7d</span>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs text-sol-text-muted mb-1 uppercase tracking-wider">
            24h Volume
          </div>
          <div className="text-xl font-bold text-sol-text">
            {formatCurrency(coin.daily_volume)}
          </div>
          <div className="text-xs text-sol-text-muted mt-1">
            Transfer volume
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs text-sol-text-muted mb-1 uppercase tracking-wider">
            24h Transactions
          </div>
          <div className="text-xl font-bold text-sol-text">
            {formatNumber(coin.daily_transactions)}
          </div>
          <div className="text-xs text-sol-text-muted mt-1">
            Daily transfers
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs text-sol-text-muted mb-1 uppercase tracking-wider">
            Market Dominance
          </div>
          <div className="text-xl font-bold text-sol-text">
            {dominance.toFixed(2)}%
          </div>
          <div className="text-xs text-sol-text-muted mt-1">
            Of Solana stablecoins
          </div>
        </div>
      </div>

      {/* Token Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <HistoryCharts coin={coin} color={color} />
        </div>
        <div className="space-y-6">
          {/* Token Details */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-sol-text mb-4">
              Token Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-sol-border">
                <span className="text-sm text-sol-text-muted">Symbol</span>
                <span className="text-sm font-semibold text-sol-text">
                  {coin.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-sol-border">
                <span className="text-sm text-sol-text-muted">Chain</span>
                <span className="text-sm font-semibold text-sol-text flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-sol-purple to-sol-green" />
                  Solana
                </span>
              </div>
              {coin.mint_address && (
                <div className="flex justify-between items-center py-2 border-b border-sol-border">
                  <span className="text-sm text-sol-text-muted">
                    Mint Address
                  </span>
                  <span className="text-sm font-mono text-sol-blue">
                    {shortenAddress(coin.mint_address)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-sol-border">
                <span className="text-sm text-sol-text-muted">
                  Active Wallets
                </span>
                <span className="text-sm font-semibold text-sol-text">
                  {formatNumber(coin.daily_active_wallets)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-sol-border">
                <span className="text-sm text-sol-text-muted">
                  7d Supply Change
                </span>
                <span
                  className={`text-sm font-semibold ${
                    coin.supply_change_7d >= 0
                      ? "text-sol-green"
                      : "text-red-400"
                  }`}
                >
                  {formatPercent(coin.supply_change_7d)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-sol-border">
                <span className="text-sm text-sol-text-muted">
                  30d Supply Change
                </span>
                <span
                  className={`text-sm font-semibold ${
                    coin.supply_change_30d >= 0
                      ? "text-sol-green"
                      : "text-red-400"
                  }`}
                >
                  {formatPercent(coin.supply_change_30d)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-sol-text-muted">Last Updated</span>
                <span className="text-sm text-sol-text">
                  {formatDate(coin.latest_date)}
                </span>
              </div>
            </div>
          </div>

          {/* Issuer Info */}
          {issuer && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-sol-text mb-4">
                Issuer Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-sol-border">
                  <span className="text-sm text-sol-text-muted">Issuer</span>
                  <span className="text-sm font-semibold text-sol-text">
                    {issuer.issuer}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-sol-border">
                  <span className="text-sm text-sol-text-muted">Type</span>
                  <span className="text-sm text-sol-text">
                    {issuer.type}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-sol-border">
                  <span className="text-sm text-sol-text-muted">Region</span>
                  <span className="text-sm text-sol-text">
                    {issuer.region}
                  </span>
                </div>
                {issuer.website && issuer.website !== "#" && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-sol-text-muted">Website</span>
                    <a
                      href={issuer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sol-blue hover:underline"
                    >
                      {new URL(issuer.website).hostname}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back link */}
      <div className="flex justify-center">
        <Link
          href="/stablecoins"
          className="px-6 py-2.5 rounded-lg bg-sol-card border border-sol-border text-sm text-sol-text-muted hover:text-sol-text hover:border-sol-purple/30 transition-all"
        >
          View All Stablecoins
        </Link>
      </div>
    </div>
  );
}
