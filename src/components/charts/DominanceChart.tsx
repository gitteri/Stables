"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardData } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getStablecoinColor } from "@/lib/types";

interface DominanceChartProps {
  data: DashboardData;
}

export default function DominanceChart({ data }: DominanceChartProps) {
  const pieData = useMemo(() => {
    const total = data.stablecoins.reduce((s, c) => s + c.current_supply, 0);
    return data.stablecoins
      .filter((c) => c.current_supply > 0)
      .map((c) => ({
        name: c.symbol,
        value: c.current_supply,
        share: (c.current_supply / total) * 100,
      }));
  }, [data]);

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-sol-text mb-2">
        Market Dominance
      </h3>
      <p className="text-sm text-sol-text-muted mb-6">
        Share of total stablecoin supply on Solana
      </p>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={getStablecoinColor(entry.name)}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "rgba(17, 17, 40, 0.95)",
                  border: "1px solid #1E1E3F",
                  borderRadius: "12px",
                  padding: "12px",
                }}
                formatter={(value: unknown, name: unknown) => [
                  formatCurrency(Number(value)),
                  String(name),
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full lg:w-1/2 space-y-2 max-h-[260px] overflow-y-auto pr-2">
          {pieData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-sol-card transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getStablecoinColor(item.name) }}
                />
                <span className="text-sm font-medium text-sol-text">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-sol-text">
                  {item.share.toFixed(1)}%
                </span>
                <span className="text-xs text-sol-text-muted ml-2">
                  {formatCurrency(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
