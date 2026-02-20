"use client";

import { useMemo, useState } from "react";
import { STABLECOIN_ISSUERS, getStablecoinColor, StablecoinSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface WorldMapProps {
  stablecoins?: StablecoinSummary[];
}

function mercatorProjection(lon: number, lat: number, width: number, height: number): [number, number] {
  const x = ((lon + 180) / 360) * width;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = height / 2 - (mercN / Math.PI) * (height / 2);
  return [x, Math.max(0, Math.min(height, y))];
}

const WORLD_PATHS = [
  "M60,90 L120,60 L160,65 L170,80 L165,100 L140,110 L130,140 L120,145 L115,130 L100,130 L90,120 L75,125 L65,115 L60,100Z",
  "M120,155 L140,150 L155,160 L158,180 L155,210 L148,230 L135,240 L125,235 L118,215 L115,190 L110,170Z",
  "M240,65 L270,55 L285,60 L290,70 L280,80 L275,85 L260,90 L248,88 L242,80Z",
  "M240,100 L260,95 L280,100 L290,110 L295,130 L290,155 L280,175 L265,185 L250,180 L240,165 L235,140 L238,120Z",
  "M290,50 L340,40 L370,50 L390,55 L395,70 L390,85 L380,90 L370,95 L350,100 L340,105 L320,100 L310,95 L300,90 L290,80 L285,65Z",
  "M365,175 L395,170 L405,180 L400,195 L385,200 L370,195 L365,185Z",
];

export default function WorldMap({ stablecoins }: WorldMapProps) {
  const [hoveredCoin, setHoveredCoin] = useState<string | null>(null);
  const width = 450;
  const height = 260;

  const coinMap = useMemo(() => {
    const map = new Map<string, StablecoinSummary>();
    if (stablecoins) stablecoins.forEach((c) => map.set(c.symbol, c));
    return map;
  }, [stablecoins]);

  const markers = useMemo(() => {
    return Object.entries(STABLECOIN_ISSUERS).map(([symbol, info]) => {
      const [x, y] = mercatorProjection(info.coordinates[0], info.coordinates[1], width, height);
      return { symbol, info, x, y, coin: coinMap.get(symbol) };
    });
  }, [coinMap]);

  return (
    <div className="glass-card p-5">
      <div className="mb-4">
        <h3 className="text-[15px] font-semibold text-[var(--sol-text)]">Global Issuer Map</h3>
        <p className="text-[12px] text-[var(--sol-text-muted)] mt-0.5">Stablecoin issuers and their geographic headquarters</p>
      </div>
      <div className="relative overflow-hidden rounded-lg bg-[#F8F9FB] p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ maxHeight: "400px" }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * (width / 8)} y1={0} x2={i * (width / 8)} y2={height} stroke="#E8ECF1" strokeWidth={0.5} opacity={0.4} />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`h-${i}`} x1={0} y1={i * (height / 6)} x2={width} y2={i * (height / 6)} stroke="#E8ECF1" strokeWidth={0.5} opacity={0.4} />
          ))}
          {WORLD_PATHS.map((d, i) => (
            <path key={i} d={d} fill="#E8ECF1" stroke="#D1D5DB" strokeWidth={0.5} opacity={0.7} />
          ))}
          {markers.map((m) => (
            <line key={`ln-${m.symbol}`} x1={width / 2} y1={height / 2} x2={m.x} y2={m.y}
              stroke={getStablecoinColor(m.symbol)} strokeWidth={0.5}
              opacity={hoveredCoin === m.symbol ? 0.5 : 0.1} strokeDasharray="4,4" />
          ))}
          {markers.map((marker) => {
            const color = getStablecoinColor(marker.symbol);
            const isHovered = hoveredCoin === marker.symbol;
            const supply = marker.coin?.current_supply || 0;
            const radius = Math.max(3, Math.min(12, Math.log10(supply + 1) - 4));
            return (
              <g key={marker.symbol} onMouseEnter={() => setHoveredCoin(marker.symbol)} onMouseLeave={() => setHoveredCoin(null)} style={{ cursor: "pointer" }}>
                <circle cx={marker.x} cy={marker.y} r={radius + 3} fill="none" stroke={color} strokeWidth={0.5} opacity={isHovered ? 0.5 : 0.15}>
                  <animate attributeName="r" from={radius + 2} to={radius + 8} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from={0.3} to={0} dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={marker.x} cy={marker.y} r={isHovered ? radius + 1 : radius} fill={color} opacity={isHovered ? 1 : 0.75} />
                <text x={marker.x} y={marker.y - radius - 4} textAnchor="middle" fill={isHovered ? "#0E1117" : "#8A919E"} fontSize={isHovered ? 8 : 6} fontWeight={isHovered ? 700 : 500}>
                  {marker.symbol}
                </text>
              </g>
            );
          })}
        </svg>
        {hoveredCoin && (() => {
          const marker = markers.find((m) => m.symbol === hoveredCoin);
          if (!marker) return null;
          return (
            <div className="absolute top-3 right-3 bg-white border border-[#E8ECF1] rounded-lg p-3 min-w-[180px] shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getStablecoinColor(marker.symbol) }} />
                <span className="text-[13px] font-bold text-[#0E1117]">{marker.symbol}</span>
              </div>
              <div className="space-y-1 text-[12px]">
                <div className="flex justify-between"><span className="text-[#8A919E]">Issuer</span><span className="text-[#0E1117]">{marker.info.issuer}</span></div>
                <div className="flex justify-between"><span className="text-[#8A919E]">Region</span><span className="text-[#0E1117]">{marker.info.region}</span></div>
                <div className="flex justify-between"><span className="text-[#8A919E]">Type</span><span className="text-[#0E1117]">{marker.info.type}</span></div>
                {marker.coin && <div className="flex justify-between"><span className="text-[#8A919E]">Supply</span><span className="text-[#0E1117] font-semibold">{formatCurrency(marker.coin.current_supply)}</span></div>}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
