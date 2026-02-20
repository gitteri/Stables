"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StablecoinSummary } from "@/lib/types";
import { formatCurrency, formatNumber, formatShortDate } from "@/lib/format";

interface HistoryChartsProps {
  coin: StablecoinSummary;
  color: string;
}

type TimeRange = "7d" | "30d" | "90d" | "all";
type ChartMetric = "supply" | "volume" | "transactions" | "wallets";

const METRICS: { key: ChartMetric; label: string; format: (v: number) => string }[] = [
  { key: "supply", label: "Supply", format: (v) => formatCurrency(v) },
  { key: "volume", label: "Volume", format: (v) => formatCurrency(v) },
  { key: "transactions", label: "Transactions", format: (v) => formatNumber(v) },
  { key: "wallets", label: "Active Wallets", format: (v) => formatNumber(v) },
];

export default function HistoryCharts({ coin, color }: HistoryChartsProps) {
  const [range, setRange] = useState<TimeRange>("30d");
  const [metric, setMetric] = useState<ChartMetric>("supply");

  const chartData = useMemo(() => {
    const rangeMap: Record<TimeRange, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      all: coin.history.length,
    };
    const numDays = rangeMap[range];
    return coin.history.slice(-numDays).map((row) => ({
      date: row.date,
      supply: row.daily_supply,
      volume: row.daily_transfer_volume,
      transactions: row.daily_transactions,
      wallets: row.daily_active_wallets,
    }));
  }, [coin, range]);

  const currentMetric = METRICS.find((m) => m.key === metric)!;

  return (
    <div className="space-y-6">
      {/* Supply Chart */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex flex-wrap gap-1">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  metric === m.key
                    ? "text-white"
                    : "bg-sol-dark text-sol-text-muted hover:text-sol-text"
                }`}
                style={
                  metric === m.key
                    ? { backgroundColor: color }
                    : undefined
                }
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-sol-dark rounded-lg p-1">
            {(["7d", "30d", "90d", "all"] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  range === r
                    ? "bg-sol-purple text-white"
                    : "text-sol-text-muted hover:text-sol-text"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {metric === "supply" ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E3F" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#8888AA", fontSize: 11 }}
                tickFormatter={formatShortDate}
                stroke="#1E1E3F"
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#8888AA", fontSize: 11 }}
                tickFormatter={(v) => currentMetric.format(v)}
                stroke="#1E1E3F"
                width={70}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(17, 17, 40, 0.95)",
                  border: "1px solid #1E1E3F",
                  borderRadius: "12px",
                  padding: "12px",
                }}
                labelStyle={{ color: "#E1E1FF", fontWeight: 600, marginBottom: 4 }}
                labelFormatter={(v: unknown) => formatShortDate(String(v))}
                formatter={(value: unknown) => [
                  currentMetric.format(Number(value)),
                  currentMetric.label,
                ]}
              />
              <Area
                type="monotone"
                dataKey="supply"
                stroke={color}
                fill="url(#supplyGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          ) : metric === "volume" ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E3F" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#8888AA", fontSize: 11 }}
                tickFormatter={formatShortDate}
                stroke="#1E1E3F"
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#8888AA", fontSize: 11 }}
                tickFormatter={(v) => currentMetric.format(v)}
                stroke="#1E1E3F"
                width={70}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(17, 17, 40, 0.95)",
                  border: "1px solid #1E1E3F",
                  borderRadius: "12px",
                  padding: "12px",
                }}
                labelStyle={{ color: "#E1E1FF", fontWeight: 600, marginBottom: 4 }}
                labelFormatter={(v: unknown) => formatShortDate(String(v))}
                formatter={(value: unknown) => [
                  currentMetric.format(Number(value)),
                  currentMetric.label,
                ]}
              />
              <Bar dataKey="volume" fill={color} radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E3F" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#8888AA", fontSize: 11 }}
                tickFormatter={formatShortDate}
                stroke="#1E1E3F"
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#8888AA", fontSize: 11 }}
                tickFormatter={(v) => currentMetric.format(v)}
                stroke="#1E1E3F"
                width={70}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(17, 17, 40, 0.95)",
                  border: "1px solid #1E1E3F",
                  borderRadius: "12px",
                  padding: "12px",
                }}
                labelStyle={{ color: "#E1E1FF", fontWeight: 600, marginBottom: 4 }}
                labelFormatter={(v: unknown) => formatShortDate(String(v))}
                formatter={(value: unknown) => [
                  currentMetric.format(Number(value)),
                  currentMetric.label,
                ]}
              />
              <Line
                type="monotone"
                dataKey={metric}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: color }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-sol-text mb-4">
          Historical Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-sol-text-muted mb-1">
              Avg Daily Volume ({range})
            </div>
            <div className="text-sm font-semibold text-sol-text">
              {formatCurrency(
                chartData.reduce((s, d) => s + d.volume, 0) / chartData.length
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-sol-text-muted mb-1">
              Avg Daily Txns ({range})
            </div>
            <div className="text-sm font-semibold text-sol-text">
              {formatNumber(
                Math.round(
                  chartData.reduce((s, d) => s + d.transactions, 0) /
                    chartData.length
                )
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-sol-text-muted mb-1">
              Peak Supply ({range})
            </div>
            <div className="text-sm font-semibold text-sol-text">
              {formatCurrency(Math.max(...chartData.map((d) => d.supply)))}
            </div>
          </div>
          <div>
            <div className="text-xs text-sol-text-muted mb-1">
              Peak Volume ({range})
            </div>
            <div className="text-sm font-semibold text-sol-text">
              {formatCurrency(Math.max(...chartData.map((d) => d.volume)))}
            </div>
          </div>
          <div>
            <div className="text-xs text-sol-text-muted mb-1">
              Avg Wallets ({range})
            </div>
            <div className="text-sm font-semibold text-sol-text">
              {formatNumber(
                Math.round(
                  chartData.reduce((s, d) => s + d.wallets, 0) /
                    chartData.length
                )
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-sol-text-muted mb-1">
              Data Points
            </div>
            <div className="text-sm font-semibold text-sol-text">
              {chartData.length} days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
