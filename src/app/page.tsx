"use client";

import dynamic from "next/dynamic";
import { useData } from "@/context/DataContext";
import { DashboardSkeleton, ErrorState } from "@/components/LoadingState";
import StatCard from "@/components/StatCard";
import StablecoinTable from "@/components/StablecoinTable";
import { formatCurrency, formatNumber } from "@/lib/format";

const SupplyChart = dynamic(() => import("@/components/charts/SupplyChart"), {
  ssr: false,
  loading: () => <div className="glass-card p-5"><div className="skeleton h-[320px]" /></div>,
});
const VolumeChart = dynamic(() => import("@/components/charts/VolumeChart"), {
  ssr: false,
  loading: () => <div className="glass-card p-5"><div className="skeleton h-[320px]" /></div>,
});
const DominanceChart = dynamic(() => import("@/components/charts/DominanceChart"), {
  ssr: false,
  loading: () => <div className="glass-card p-5"><div className="skeleton h-[280px]" /></div>,
});
const GlobeVisualization = dynamic(() => import("@/components/Globe"), {
  ssr: false,
  loading: () => <div className="skeleton h-[380px] rounded-xl" />,
});
const WorldMap = dynamic(() => import("@/components/WorldMap"), {
  ssr: false,
  loading: () => <div className="glass-card p-5"><div className="skeleton h-[280px]" /></div>,
});

export default function DashboardPage() {
  const { data, loading, error, refresh } = useData();

  if (loading) {
    return (
      <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12">
        <ErrorState message={error || "No data available"} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="px-4 md:pl-16 md:pr-24 py-8 md:pt-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Real-time analytics for the Solana stablecoin ecosystem
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-col md:flex-row gap-5 mb-8">
        <div className="flex-1">
          <StatCard
            title="Total Supply"
            value={formatCurrency(data.totalSupply)}
            change={data.supplyChange7d}
            subtitle="7d change"
            delay={1}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
        </div>
        <div className="flex-1">
          <StatCard
            title="24h Volume"
            value={formatCurrency(data.totalVolume)}
            subtitle="transfer volume"
            delay={2}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
        </div>
        <div className="flex-1">
          <StatCard
            title="24h Transactions"
            value={formatNumber(data.totalTransactions)}
            subtitle="daily txns"
            delay={3}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
        </div>
        <div className="flex-1">
          <StatCard
            title="Active Wallets"
            value={formatNumber(data.totalActiveWallets)}
            subtitle="daily unique"
            delay={4}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
        </div>
      </div>

      {/* Globe + Market Dominance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="glass-card overflow-hidden">
          <div className="px-6 pt-5 pb-2">
            <h3 className="text-base font-semibold text-[#0F172A]">Global Stablecoin Network</h3>
            <p className="text-xs text-[#64748B] mt-0.5">Interactive view of stablecoin issuers worldwide</p>
          </div>
          <GlobeVisualization stablecoins={data.stablecoins} height="380px" />
        </div>
        <DominanceChart data={data} />
      </div>

      {/* Supply Chart */}
      <div className="mb-8">
        <SupplyChart data={data} />
      </div>

      {/* Volume + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <VolumeChart data={data} />
        <WorldMap stablecoins={data.stablecoins} />
      </div>

      {/* Stablecoin Table */}
      <div className="mb-8">
        <StablecoinTable data={data} />
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-6 text-center">
          <div className="text-3xl font-semibold gradient-text mb-1">{data.stablecoins.length}</div>
          <div className="text-sm text-[#64748B]">Stablecoins Tracked</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-3xl font-semibold gradient-text-blue mb-1">{data.dates.length}</div>
          <div className="text-sm text-[#64748B]">Days of Historical Data</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-3xl font-semibold gradient-text mb-1">{formatNumber(data.raw.length)}</div>
          <div className="text-sm text-[#64748B]">Data Points Analyzed</div>
        </div>
      </div>
    </div>
  );
}
