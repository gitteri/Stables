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
    <div className={`glass-card p-5 fade-in ${delay ? `fade-in-delay-${delay}` : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="metric-label">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-[#F3EAFF] flex items-center justify-center text-[#9945FF]">
          {icon}
        </div>
      </div>
      <div className="metric-value">{value}</div>
      <div className="flex items-center gap-2 mt-1.5">
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
          <span className="text-[11px] text-[var(--sol-text-light)]">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
