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
    <div className="glass-card p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#0F172A]">
            Total Supply Over Time
          </h3>
          <p className="text-[12px] text-[#64748B] mt-1">
            Stacked supply of all stablecoins on Solana
          </p>
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
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={getStablecoinColor(coin.symbol)}
                  stopOpacity={0.03}
                />
              </linearGradient>
            ))}
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
            tickFormatter={(v) => formatCurrency(v, 0)}
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
            labelStyle={{ color: "#0F172A", fontWeight: 600, marginBottom: 8 }}
            labelFormatter={(v: unknown) => formatShortDate(String(v))}
            formatter={(value: unknown, name: unknown) => [
              formatCurrency(Number(value)),
              String(name),
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
            formatter={(value: string) => (
              <span style={{ color: "#64748B" }}>{value}</span>
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
