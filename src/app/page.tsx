"use client";

import dynamic from "next/dynamic";
import { useData } from "@/context/DataContext";
import { DashboardSkeleton, ErrorState } from "@/components/LoadingState";
import StatCard from "@/components/StatCard";
import StablecoinTable from "@/components/StablecoinTable";
import { formatCurrency, formatNumber } from "@/lib/format";

const SupplyChart = dynamic(() => import("@/components/charts/SupplyChart"), {
  ssr: false,
  loading: () => <div className="glass-card p-6"><div className="skeleton h-[360px]" /></div>,
});
const VolumeChart = dynamic(() => import("@/components/charts/VolumeChart"), {
  ssr: false,
  loading: () => <div className="glass-card p-6"><div className="skeleton h-[360px]" /></div>,
});
const DominanceChart = dynamic(
  () => import("@/components/charts/DominanceChart"),
  {
    ssr: false,
    loading: () => <div className="glass-card p-6"><div className="skeleton h-[300px]" /></div>,
  }
);
const GlobeVisualization = dynamic(() => import("@/components/Globe"), {
  ssr: false,
  loading: () => <div className="skeleton h-[400px] rounded-xl" />,
});
const WorldMap = dynamic(() => import("@/components/WorldMap"), {
  ssr: false,
  loading: () => <div className="glass-card p-6"><div className="skeleton h-[300px]" /></div>,
});

export default function DashboardPage() {
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

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
          <span className="gradient-text">Solana Stablecoin</span>{" "}
          <span className="text-sol-text">Dashboard</span>
        </h1>
        <p className="text-sol-text-muted text-lg">
          Real-time analytics and insights for the Solana stablecoin ecosystem
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Daily Volume"
          value={formatCurrency(data.totalVolume)}
          change={data.supplyChange7d}
          subtitle="7d change"
          delay={1}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
        <StatCard
          title="Cumulative Volume"
          value={formatCurrency(data.totalSupply)}
          subtitle="total value flow"
          delay={2}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
        <StatCard
          title="Daily Transactions"
          value={formatNumber(data.totalTransactions)}
          subtitle="total txns"
          delay={3}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
        <StatCard
          title="Total Holders"
          value={formatNumber(data.totalActiveWallets)}
          subtitle="unique wallets"
          delay={4}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
      </div>

      {/* Globe + Market Dominance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card overflow-hidden">
          <div className="p-6 pb-0">
            <h3 className="text-lg font-semibold text-sol-text">
              Global Stablecoin Network
            </h3>
            <p className="text-sm text-sol-text-muted mt-1">
              Interactive view of stablecoin issuers worldwide
            </p>
          </div>
          <GlobeVisualization stablecoins={data.stablecoins} height="400px" />
        </div>
        <DominanceChart data={data} />
      </div>

      {/* Supply Chart */}
      <div className="mb-8">
        <SupplyChart data={data} />
      </div>

      {/* Volume + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <VolumeChart data={data} />
        <WorldMap stablecoins={data.stablecoins} />
      </div>

      {/* Stablecoin Table */}
      <div className="mb-8">
        <StablecoinTable data={data} />
      </div>

      {/* Ecosystem Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 text-center">
          <div className="text-3xl font-bold gradient-text mb-2">
            {data.stablecoins.length}
          </div>
          <div className="text-sm text-sol-text-muted">
            Stablecoins Tracked
          </div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-3xl font-bold gradient-text-blue mb-2">
            {data.dates.length}
          </div>
          <div className="text-sm text-sol-text-muted">
            Days of Historical Data
          </div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-3xl font-bold gradient-text mb-2">
            {formatNumber(data.raw.length)}
          </div>
          <div className="text-sm text-sol-text-muted">
            Data Points Analyzed
          </div>
        </div>
      </div>
    </div>
  );
}
