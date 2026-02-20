"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
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

interface SupplyChartProps {
  data: DashboardData;
}

type TimeRange = "7d" | "30d" | "90d" | "all";

export default function SupplyChart({ data }: SupplyChartProps) {
  const [range, setRange] = useState<TimeRange>("30d");

  const chartData = useMemo(() => {
    const rangeMap: Record<TimeRange, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "all": data.dates.length,
    };
    const numDays = rangeMap[range];
    const dates = data.dates.slice(-numDays);

    return dates.map((date) => {
      const point: Record<string, string | number> = { date };
      for (const coin of data.stablecoins) {
        const row = coin.history.find((r) => r.date === date);
        point[coin.symbol] = row?.daily_supply || 0;
      }
      return point;
    });
  }, [data, range]);

  const topCoins = data.stablecoins.slice(0, 8);

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-sol-text">
            Supply Over Time
          </h3>
          <p className="text-sm text-sol-text-muted mt-1">
            On-chain supply of stablecoins on Solana
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
        <AreaChart data={chartData}>
          <defs>
            {topCoins.map((coin) => (
              <linearGradient
                key={coin.symbol}
                id={`gradient-${coin.symbol}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={getStablecoinColor(coin.symbol)}
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor={getStablecoinColor(coin.symbol)}
                  stopOpacity={0.05}
                />
              </linearGradient>
            ))}
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
            <Area
              key={coin.symbol}
              type="monotone"
              dataKey={coin.symbol}
              stackId="supply"
              stroke={getStablecoinColor(coin.symbol)}
              fill={`url(#gradient-${coin.symbol})`}
              strokeWidth={1.5}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
