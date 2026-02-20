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
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <h3 className="text-[15px] font-semibold text-[#0F172A]">
          Stablecoin Overview
        </h3>
        <p className="text-[12px] text-[#64748B] mt-0.5">
          All stablecoins on Solana ranked by circulating supply
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr className="text-[11px] text-[#64748B] uppercase tracking-wider">
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
            {data.stablecoins.map((coin, index) => {
              const issuer = STABLECOIN_ISSUERS[coin.symbol];
              const slug = slugify(coin.symbol);
              return (
                <tr key={coin.symbol} className="group">
                  <td className="px-6 py-3.5 text-[12px] text-[#64748B]">
                    {index + 1}
                  </td>
                  <td className="px-6 py-3.5">
                    <Link
                      href={`/stablecoins/${slug}`}
                      className="flex items-center gap-2.5"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: getStablecoinColor(coin.symbol) }}
                      >
                        {coin.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors">
                          {coin.symbol}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          {issuer?.issuer || coin.name}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-3.5 text-right text-[13px] font-semibold text-[#0F172A]">
                    {formatCurrency(coin.current_supply)}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className={`text-[12px] font-medium ${coin.supply_change_7d >= 0 ? "text-[#059669]" : "text-[#DC2626]"}`}>
                      {formatPercent(coin.supply_change_7d)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className={`text-[12px] font-medium ${coin.supply_change_30d >= 0 ? "text-[#059669]" : "text-[#DC2626]"}`}>
                      {formatPercent(coin.supply_change_30d)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right text-[13px] text-[#475569]">
                    {formatCurrency(coin.daily_volume)}
                  </td>
                  <td className="px-6 py-3.5 text-right text-[13px] text-[#475569]">
                    {formatNumber(coin.daily_transactions)}
                  </td>
                  <td className="px-6 py-3.5 text-right text-[13px] text-[#475569]">
                    {formatNumber(coin.daily_active_wallets)}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className="badge badge-purple">
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
