"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useData } from "@/context/DataContext";
import { DashboardSkeleton, ErrorState } from "@/components/LoadingState";
import { formatCurrency, formatNumber, formatPercent, slugify } from "@/lib/format";
import { getStablecoinColor, STABLECOIN_ISSUERS, STABLECOIN_CURRENCY } from "@/lib/types";

const AggregateCharts = dynamic(() => import("@/components/charts/AggregateCharts"), {
  ssr: false,
  loading: () => <div className="glass-card p-5 mb-8"><div className="skeleton h-[460px]" /></div>,
});

type SortKey = "current_supply" | "supply_change_7d" | "supply_change_30d" | "daily_volume" | "daily_transactions" | "daily_active_wallets";
type Filter = "all" | "usd" | "non-usd";

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span className={`ml-1 inline-flex flex-col gap-px leading-none ${active ? "text-sol-purple" : "text-sol-border"}`}>
      <span style={{ opacity: active && dir === "asc" ? 1 : 0.4 }}>▲</span>
      <span style={{ opacity: active && dir === "desc" ? 1 : 0.4 }}>▼</span>
    </span>
  );
}

export default function StablecoinsPage() {
  const { data, loading, error, refresh } = useData();
  const [sortKey, setSortKey] = useState<SortKey>("current_supply");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<Filter>("all");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filteredCoins = useMemo(() => {
    if (!data) return [];
    let list = [...data.stablecoins];
    if (filter === "usd") {
      list = list.filter((c) => STABLECOIN_CURRENCY[c.symbol] === "USD");
    } else if (filter === "non-usd") {
      list = list.filter((c) => STABLECOIN_CURRENCY[c.symbol] !== "USD");
    }
    return list;
  }, [data, filter]);

  const coins = useMemo(() => {
    return [...filteredCoins].sort((a, b) => {
      const diff = (a[sortKey] as number) - (b[sortKey] as number);
      return sortDir === "desc" ? -diff : diff;
    });
  }, [filteredCoins, sortKey, sortDir]);

  if (loading) return <div className="px-6 py-8"><DashboardSkeleton /></div>;
  if (error || !data) return <div className="px-6 py-8"><ErrorState message={error || "No data available"} onRetry={refresh} /></div>;

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "usd", label: "USD" },
    { key: "non-usd", label: "Non-USD" },
  ];

  const cols: { key: SortKey; label: string }[] = [
    { key: "current_supply", label: "Supply" },
    { key: "supply_change_7d", label: "7d" },
    { key: "supply_change_30d", label: "30d" },
    { key: "daily_volume", label: "24h Volume" },
    { key: "daily_transactions", label: "24h Txns" },
    { key: "daily_active_wallets", label: "Wallets" },
  ];

  return (
    <div className="px-6 py-8 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-sol-text tracking-tight">Stablecoins</h1>
          <p className="text-sm text-sol-text-muted mt-1">{coins.length} stablecoins on Solana</p>
        </div>
        <div className="flex gap-1 bg-sol-dark rounded-lg p-1 self-start sm:self-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === f.key ? "bg-sol-purple text-white" : "text-sol-text-muted hover:text-sol-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <AggregateCharts coins={filteredCoins} allDates={data.dates} />

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="text-[11px] text-sol-text-muted uppercase tracking-wider border-b border-sol-border">
                <th className="text-left px-6 py-3 font-medium w-8">#</th>
                <th className="text-left px-6 py-3 font-medium">Stablecoin</th>
                <th className="text-xs px-4 py-3 font-medium text-sol-text-muted">Peg</th>
                {cols.map((col) => (
                  <th key={col.key} className="text-right px-6 py-3 font-medium">
                    <button
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-0.5 hover:text-sol-purple transition-colors whitespace-nowrap"
                    >
                      {col.label}
                      <SortIcon active={sortKey === col.key} dir={sortDir} />
                    </button>
                  </th>
                ))}
                <th className="text-center px-6 py-3 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin, i) => {
                const issuer = STABLECOIN_ISSUERS[coin.symbol];
                const currency = STABLECOIN_CURRENCY[coin.symbol];
                return (
                  <tr key={coin.symbol} className="group border-b border-sol-border/50 last:border-0">
                    <td className="px-6 py-3.5 text-[12px] text-sol-text-muted tabular-nums">{i + 1}</td>
                    <td className="px-6 py-3.5">
                      <Link href={`/stablecoins/${slugify(coin.symbol)}`} className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                          style={{ backgroundColor: getStablecoinColor(coin.symbol) }}
                        >
                          {coin.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-sol-text group-hover:text-sol-purple transition-colors leading-tight">
                            {coin.symbol}
                          </div>
                          <div className="text-[11px] text-sol-text-muted leading-tight">{issuer?.issuer || coin.name}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {currency && (
                        <span className="text-[11px] font-medium text-sol-text-muted bg-sol-dark rounded px-1.5 py-0.5">
                          {currency}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right text-[13px] font-semibold text-sol-text tabular-nums">
                      {formatCurrency(coin.current_supply)}
                    </td>
                    <td className="px-6 py-3.5 text-right tabular-nums">
                      <span className={`text-[12px] font-medium ${coin.supply_change_7d >= 0 ? "text-sol-green" : "text-red-400"}`}>
                        {formatPercent(coin.supply_change_7d)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right tabular-nums">
                      <span className={`text-[12px] font-medium ${coin.supply_change_30d >= 0 ? "text-sol-green" : "text-red-400"}`}>
                        {formatPercent(coin.supply_change_30d)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-[13px] text-sol-text-muted tabular-nums">
                      {formatCurrency(coin.daily_volume)}
                    </td>
                    <td className="px-6 py-3.5 text-right text-[13px] text-sol-text-muted tabular-nums">
                      {formatNumber(coin.daily_transactions)}
                    </td>
                    <td className="px-6 py-3.5 text-right text-[13px] text-sol-text-muted tabular-nums">
                      {formatNumber(coin.daily_active_wallets)}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="text-[10px] font-medium text-sol-purple bg-sol-purple/10 rounded px-2 py-0.5">
                        {issuer?.type || "Stablecoin"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
