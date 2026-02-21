"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DashboardData } from "@/lib/types";
import { formatCurrency, formatShortDate } from "@/lib/format";
import { getStablecoinColor } from "@/lib/types";

interface VolumeChartProps {
  data: DashboardData;
}

type TimeRange = "7d" | "30d" | "90d" | "all";

export default function VolumeChart({ data }: VolumeChartProps) {
  const [range, setRange] = useState<TimeRange>("30d");

  const chartData = useMemo(() => {
    const rangeMap: Record<TimeRange, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      all: data.dates.length,
    };
    const numDays = rangeMap[range];
    const dates = data.dates.slice(-numDays);

    return dates.map((date) => {
      const point: Record<string, string | number> = { date };
      for (const coin of data.stablecoins) {
        const row = coin.history.find((r) => r.date === date);
        point[coin.symbol] = row?.daily_transfer_volume || 0;
      }
      return point;
    });
  }, [data, range]);

  const topCoins = data.stablecoins;

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-sol-text">
            Daily Transfer Volume
          </h3>
          <p className="text-sm text-sol-text-muted mt-1">
            Daily volume across all stablecoins
          </p>
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
      <ResponsiveContainer width="100%" height={360}>
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
            tickFormatter={(v) => formatCurrency(v, 0)}
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
            labelStyle={{ color: "#E1E1FF", fontWeight: 600, marginBottom: 8 }}
            labelFormatter={(v: unknown) => formatShortDate(String(v))}
            formatter={(value: unknown, name: unknown) => [
              formatCurrency(Number(value)),
              String(name),
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
            formatter={(value: string) => (
              <span style={{ color: "#8888AA" }}>{value}</span>
            )}
          />
          {topCoins.map((coin) => (
            <Bar
              key={coin.symbol}
              dataKey={coin.symbol}
              stackId="volume"
              fill={getStablecoinColor(coin.symbol)}
              radius={[0, 0, 0, 0]}
              opacity={0.85}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
