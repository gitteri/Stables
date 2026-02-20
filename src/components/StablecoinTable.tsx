"use client";

import Link from "next/link";
import { DashboardData } from "@/lib/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { getStablecoinColor, STABLECOIN_ISSUERS } from "@/lib/types";
import { slugify } from "@/lib/format";

interface StablecoinTableProps {
  data: DashboardData;
}

export default function StablecoinTable({ data }: StablecoinTableProps) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-sol-border">
        <h3 className="text-lg font-semibold text-sol-text">
          Stablecoin Overview
        </h3>
        <p className="text-sm text-sol-text-muted mt-1">
          All stablecoins on Solana ranked by circulating supply
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr className="text-xs text-sol-text-muted uppercase tracking-wider">
              <th className="text-left px-6 py-4 font-medium">#</th>
              <th className="text-left px-6 py-4 font-medium">Stablecoin</th>
              <th className="text-right px-6 py-4 font-medium">Supply</th>
              <th className="text-right px-6 py-4 font-medium">7d Change</th>
              <th className="text-right px-6 py-4 font-medium">30d Change</th>
              <th className="text-right px-6 py-4 font-medium">24h Volume</th>
              <th className="text-right px-6 py-4 font-medium">24h Txns</th>
              <th className="text-right px-6 py-4 font-medium">Active Wallets</th>
              <th className="text-center px-6 py-4 font-medium">Type</th>
            </tr>
          </thead>
          <tbody>
            {data.stablecoins.map((coin, index) => {
              const issuer = STABLECOIN_ISSUERS[coin.symbol];
              const slug = slugify(coin.symbol);
              return (
                <tr key={coin.symbol} className="group">
                  <td className="px-6 py-4 text-sm text-sol-text-muted">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/stablecoins/${slug}`}
                      className="flex items-center gap-3 group-hover:opacity-80 transition-opacity"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor: getStablecoinColor(coin.symbol),
                        }}
                      >
                        {coin.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-sol-text">
                          {coin.symbol}
                        </div>
                        <div className="text-xs text-sol-text-muted">
                          {issuer?.issuer || coin.name}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-sol-text">
                    {formatCurrency(coin.current_supply)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`text-sm font-medium ${
                        coin.supply_change_7d >= 0
                          ? "text-sol-green"
                          : "text-red-400"
                      }`}
                    >
                      {formatPercent(coin.supply_change_7d)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`text-sm font-medium ${
                        coin.supply_change_30d >= 0
                          ? "text-sol-green"
                          : "text-red-400"
                      }`}
                    >
                      {formatPercent(coin.supply_change_30d)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-sol-text">
                    {formatCurrency(coin.daily_volume)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-sol-text">
                    {formatNumber(coin.daily_transactions)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-sol-text">
                    {formatNumber(coin.daily_active_wallets)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-sol-purple/10 text-sol-purple border border-sol-purple/20">
                      {issuer?.type || "Stablecoin"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
