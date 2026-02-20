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
      {/* Chart Card */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex flex-wrap gap-1">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  metric === m.key
                    ? "text-white"
                    : "bg-[#F1F5F9] text-[#64748B] hover:text-[#475569]"
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
          <div className="flex gap-1 bg-[#F1F5F9] rounded-lg p-1">
            {(["7d", "30d", "90d", "all"] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  range === r
                    ? "bg-[#4F46E5] text-white"
                    : "bg-[#F1F5F9] text-[#64748B] hover:text-[#475569]"
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
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748B", fontSize: 11 }}
                tickFormatter={formatShortDate}
                stroke="#F1F5F9"
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#64748B", fontSize: 11 }}
                tickFormatter={(v) => currentMetric.format(v)}
                stroke="#F1F5F9"
                width={70}
              />
              <Tooltip
                contentStyle={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06)",
                }}
                labelStyle={{ color: "#0F172A", fontWeight: 600, marginBottom: 4 }}
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
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748B", fontSize: 11 }}
                tickFormatter={formatShortDate}
                stroke="#F1F5F9"
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#64748B", fontSize: 11 }}
                tickFormatter={(v) => currentMetric.format(v)}
                stroke="#F1F5F9"
                width={70}
              />
              <Tooltip
                contentStyle={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06)",
                }}
                labelStyle={{ color: "#0F172A", fontWeight: 600, marginBottom: 4 }}
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
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748B", fontSize: 11 }}
                tickFormatter={formatShortDate}
                stroke="#F1F5F9"
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#64748B", fontSize: 11 }}
                tickFormatter={(v) => currentMetric.format(v)}
                stroke="#F1F5F9"
                width={70}
              />
              <Tooltip
                contentStyle={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06)",
                }}
                labelStyle={{ color: "#0F172A", fontWeight: 600, marginBottom: 4 }}
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
      <div className="glass-card p-5">
        <h3 className="text-[15px] font-semibold text-[#0F172A] mb-4">
          Historical Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] text-[#64748B] mb-1">
              Avg Daily Volume ({range})
            </div>
            <div className="text-sm font-semibold text-[#0F172A]">
              {formatCurrency(
                chartData.reduce((s, d) => s + d.volume, 0) / chartData.length
              )}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] mb-1">
              Avg Daily Txns ({range})
            </div>
            <div className="text-sm font-semibold text-[#0F172A]">
              {formatNumber(
                Math.round(
                  chartData.reduce((s, d) => s + d.transactions, 0) /
                    chartData.length
                )
              )}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] mb-1">
              Peak Supply ({range})
            </div>
            <div className="text-sm font-semibold text-[#0F172A]">
              {formatCurrency(Math.max(...chartData.map((d) => d.supply)))}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] mb-1">
              Peak Volume ({range})
            </div>
            <div className="text-sm font-semibold text-[#0F172A]">
              {formatCurrency(Math.max(...chartData.map((d) => d.volume)))}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] mb-1">
              Avg Wallets ({range})
            </div>
            <div className="text-sm font-semibold text-[#0F172A]">
              {formatNumber(
                Math.round(
                  chartData.reduce((s, d) => s + d.wallets, 0) /
                    chartData.length
                )
              )}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] mb-1">
              Data Points
            </div>
            <div className="text-sm font-semibold text-[#0F172A]">
              {chartData.length} days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
