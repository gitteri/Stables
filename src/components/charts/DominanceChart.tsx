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
    <div className="glass-card p-5">
      <h3 className="text-[15px] font-semibold text-[#0E1117] mb-2">
        Market Dominance
      </h3>
      <p className="text-[12px] text-[#8A919E] mb-6">
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
                  background: "#FFFFFF",
                  border: "1px solid #E8ECF1",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06)",
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
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F8F9FB] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getStablecoinColor(item.name) }}
                />
                <span className="text-sm font-medium text-[#0E1117]">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-[#0E1117]">
                  {item.share.toFixed(1)}%
                </span>
                <span className="text-xs text-[#8A919E] ml-2">
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
