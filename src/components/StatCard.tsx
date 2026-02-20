"use client";

import { formatPercent } from "@/lib/format";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  subtitle?: string;
  icon: React.ReactNode;
  delay?: number;
}

export default function StatCard({ title, value, change, subtitle, icon, delay = 0 }: StatCardProps) {
  return (
    <div className={`glass-card p-6 fade-in ${delay ? `fade-in-delay-${delay}` : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="metric-label">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
          {icon}
        </div>
      </div>
      <div className="metric-value">{value}</div>
      <div className="flex items-center gap-2 mt-2">
        {change !== undefined && (
          <span
            className={`text-[12px] font-semibold ${
              change >= 0 ? "text-[#059669]" : "text-[#DC2626]"
            }`}
          >
            {change >= 0 ? "\u2191" : "\u2193"} {formatPercent(change).replace("+", "")}
          </span>
        )}
        {subtitle && (
          <span className="text-[11px] text-[#94A3B8]">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
