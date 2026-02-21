"use client";

import { useMemo, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { StablecoinSummary } from "@/lib/types";
import { formatCurrency, formatNumber, formatShortDate } from "@/lib/format";

interface AggregateChartsProps {
  coins: StablecoinSummary[];
  allDates: string[];
}

type TimeRange = "7d" | "30d" | "90d" | "all";

const TOOLTIP_STYLE = {
  background: "rgba(17,17,40,0.95)",
  border: "1px solid #1E1E3F",
  borderRadius: "8px",
  padding: "10px 14px",
};

const AXIS = { tick: { fill: "#8888AA", fontSize: 11 }, stroke: "#1E1E3F" };

export default function AggregateCharts({ coins, allDates }: AggregateChartsProps) {
  const [range, setRange] = useState<TimeRange>("30d");

  const chartData = useMemo(() => {
    const rangeMap: Record<TimeRange, number> = {
      "7d": 7, "30d": 30, "90d": 90, all: allDates.length,
    };
    const dates = allDates.slice(-rangeMap[range]);

    return dates.map((date) => {
      let supply = 0, volume = 0, transactions = 0, wallets = 0;
      for (const coin of coins) {
        const row = coin.history.find((r) => r.date === date);
        if (row) {
          supply += row.daily_supply || 0;
          volume += row.daily_transfer_volume || 0;
          transactions += row.daily_transactions || 0;
          wallets += row.daily_active_wallets || 0;
        }
      }
      return { date, supply, volume, transactions, wallets };
    });
  }, [coins, allDates, range]);

  const labelFmt = (v: unknown) => formatShortDate(String(v));

  return (
    <div className="glass-card p-5 mb-8">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[15px] font-semibold text-sol-text">Metrics Over Time</h3>
        <div className="flex gap-1 bg-sol-dark rounded-lg p-1">
          {(["7d", "30d", "90d", "all"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                range === r ? "bg-sol-purple text-white" : "text-sol-text-muted hover:text-sol-text"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-[11px] font-medium text-sol-text-muted uppercase tracking-wider mb-3">Total Supply</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="agg-supply" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9945FF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#9945FF" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E3F" />
              <XAxis dataKey="date" {...AXIS} tickFormatter={formatShortDate} interval="preserveStartEnd" />
              <YAxis {...AXIS} tickFormatter={(v) => formatCurrency(v, 0)} width={72} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#E1E1FF", fontWeight: 600, marginBottom: 4 }} labelFormatter={labelFmt} formatter={(v: unknown) => [formatCurrency(Number(v)), "Supply"]} />
              <Area type="monotone" dataKey="supply" stroke="#9945FF" fill="url(#agg-supply)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-[11px] font-medium text-sol-text-muted uppercase tracking-wider mb-3">Daily Volume</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E3F" />
              <XAxis dataKey="date" {...AXIS} tickFormatter={formatShortDate} interval="preserveStartEnd" />
              <YAxis {...AXIS} tickFormatter={(v) => formatCurrency(v, 0)} width={72} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#E1E1FF", fontWeight: 600, marginBottom: 4 }} labelFormatter={labelFmt} formatter={(v: unknown) => [formatCurrency(Number(v)), "Volume"]} />
              <Bar dataKey="volume" fill="#00D1FF" radius={[2, 2, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-[11px] font-medium text-sol-text-muted uppercase tracking-wider mb-3">Daily Transactions</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E3F" />
              <XAxis dataKey="date" {...AXIS} tickFormatter={formatShortDate} interval="preserveStartEnd" />
              <YAxis {...AXIS} tickFormatter={(v) => formatNumber(v)} width={72} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#E1E1FF", fontWeight: 600, marginBottom: 4 }} labelFormatter={labelFmt} formatter={(v: unknown) => [formatNumber(Number(v)), "Transactions"]} />
              <Line type="monotone" dataKey="transactions" stroke="#14F195" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-[11px] font-medium text-sol-text-muted uppercase tracking-wider mb-3">Active Wallets</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E3F" />
              <XAxis dataKey="date" {...AXIS} tickFormatter={formatShortDate} interval="preserveStartEnd" />
              <YAxis {...AXIS} tickFormatter={(v) => formatNumber(v)} width={72} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#E1E1FF", fontWeight: 600, marginBottom: 4 }} labelFormatter={labelFmt} formatter={(v: unknown) => [formatNumber(Number(v)), "Wallets"]} />
              <Line type="monotone" dataKey="wallets" stroke="#F59E0B" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
