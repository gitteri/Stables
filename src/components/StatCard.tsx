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
    <div
      className={`glass-card p-6 fade-in ${delay ? `fade-in-delay-${delay}` : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-sol-text-muted font-medium">{title}</span>
        <div className="w-10 h-10 rounded-xl bg-sol-purple/10 flex items-center justify-center text-sol-purple">
          {icon}
        </div>
      </div>
      <div className="text-2xl lg:text-3xl font-bold text-sol-text mb-1">
        {value}
      </div>
      <div className="flex items-center gap-2">
        {change !== undefined && (
          <span
            className={`text-sm font-medium ${
              change >= 0 ? "text-sol-green" : "text-red-400"
            }`}
          >
            {formatPercent(change)}
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-sol-text-muted">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
