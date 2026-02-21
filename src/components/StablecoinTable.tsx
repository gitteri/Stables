"use client";

import Link from "next/link";
import { DashboardData } from "@/lib/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { getStablecoinColor, STABLECOIN_ISSUERS } from "@/lib/types";
import { slugify } from "@/lib/format";

interface StablecoinTableProps {
  data: DashboardData;
  limit?: number;
  selectedCurrency?: string | null;
}

export default function StablecoinTable({ data, limit, selectedCurrency }: StablecoinTableProps) {
  const coins = limit ? data.stablecoins.slice(0, limit) : data.stablecoins;
  const showViewAll = limit && data.stablecoins.length > limit;
  const title = selectedCurrency ? `${selectedCurrency} Stablecoins` : "Stablecoin Overview";
  const subtitle = selectedCurrency
    ? `${coins.length} stablecoin${coins.length !== 1 ? "s" : ""} pegged to ${selectedCurrency}`
    : limit
    ? `Top ${limit} stablecoins by circulating supply`
    : "All stablecoins on Solana ranked by circulating supply";

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-sol-border">
        <h3 className="text-[15px] font-semibold text-sol-text">{title}</h3>
        <p className="text-[12px] text-sol-text-muted mt-0.5">{subtitle}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr className="text-[11px] text-sol-text-muted uppercase tracking-wider">
              <th className="text-left px-6 py-3 font-medium">#</th>
              <th className="text-left px-6 py-3 font-medium">Stablecoin</th>
              <th className="text-right px-6 py-3 font-medium">Supply</th>
              <th className="text-right px-6 py-3 font-medium">7d</th>
              <th className="text-right px-6 py-3 font-medium">30d</th>
              <th className="text-right px-6 py-3 font-medium">24h Volume</th>
              <th className="text-right px-6 py-3 font-medium">24h Txns</th>
              <th className="text-right px-6 py-3 font-medium">Wallets</th>
              <th className="text-center px-6 py-3 font-medium">Type</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin, index) => {
              const issuer = STABLECOIN_ISSUERS[coin.symbol];
              const slug = slugify(coin.symbol);
              return (
                <tr key={coin.symbol} className="group">
                  <td className="px-6 py-3.5 text-[12px] text-sol-text-muted">
                    {index + 1}
                  </td>
                  <td className="px-6 py-3.5">
                    <Link href={`/stablecoins/${slug}`} className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: getStablecoinColor(coin.symbol) }}
                      >
                        {coin.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-sol-text group-hover:text-sol-purple transition-colors">
                          {coin.symbol}
                        </div>
                        <div className="text-[11px] text-sol-text-muted">
                          {issuer?.issuer || coin.name}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-3.5 text-right text-[13px] font-semibold text-sol-text">
                    {formatCurrency(coin.current_supply)}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className={`text-[12px] font-medium ${coin.supply_change_7d >= 0 ? "text-sol-green" : "text-red-400"}`}>
                      {formatPercent(coin.supply_change_7d)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className={`text-[12px] font-medium ${coin.supply_change_30d >= 0 ? "text-sol-green" : "text-red-400"}`}>
                      {formatPercent(coin.supply_change_30d)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right text-[13px] text-sol-text-muted">
                    {formatCurrency(coin.daily_volume)}
                  </td>
                  <td className="px-6 py-3.5 text-right text-[13px] text-sol-text-muted">
                    {formatNumber(coin.daily_transactions)}
                  </td>
                  <td className="px-6 py-3.5 text-right text-[13px] text-sol-text-muted">
                    {formatNumber(coin.daily_active_wallets)}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className="text-[10px] font-medium text-sol-purple bg-sol-purple/10 rounded px-2 py-0.5">
                      {issuer?.type || "Stablecoin"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showViewAll && (
        <div className="px-6 py-3 border-t border-sol-border text-center">
          <Link href="/stablecoins" className="text-[12px] text-sol-purple hover:text-sol-green font-medium transition-colors">
            View all {data.stablecoins.length} stablecoins →
          </Link>
        </div>
      )}
    </div>
  );
}
