"use client";

import { useMemo, useState } from "react";
import { STABLECOIN_ISSUERS, getStablecoinColor, StablecoinSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface WorldMapProps {
  stablecoins?: StablecoinSummary[];
}

// Simplified world map SVG paths (continents outlines)
function mercatorProjection(
  lon: number,
  lat: number,
  width: number,
  height: number
): [number, number] {
  const x = ((lon + 180) / 360) * width;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = height / 2 - (mercN / Math.PI) * (height / 2);
  return [x, Math.max(0, Math.min(height, y))];
}

// Simplified continent paths for the world map
const WORLD_PATHS = [
  // North America
  "M60,90 L120,60 L160,65 L170,80 L165,100 L140,110 L130,140 L120,145 L115,130 L100,130 L90,120 L75,125 L65,115 L60,100Z",
  // South America
  "M120,155 L140,150 L155,160 L158,180 L155,210 L148,230 L135,240 L125,235 L118,215 L115,190 L110,170Z",
  // Europe
  "M240,65 L270,55 L285,60 L290,70 L280,80 L275,85 L260,90 L248,88 L242,80Z",
  // Africa
  "M240,100 L260,95 L280,100 L290,110 L295,130 L290,155 L280,175 L265,185 L250,180 L240,165 L235,140 L238,120Z",
  // Asia
  "M290,50 L340,40 L370,50 L390,55 L395,70 L390,85 L380,90 L370,95 L350,100 L340,105 L320,100 L310,95 L300,90 L290,80 L285,65Z",
  // Australia
  "M365,175 L395,170 L405,180 L400,195 L385,200 L370,195 L365,185Z",
];

export default function WorldMap({ stablecoins }: WorldMapProps) {
  const [hoveredCoin, setHoveredCoin] = useState<string | null>(null);
  const width = 450;
  const height = 260;

  const coinMap = useMemo(() => {
    const map = new Map<string, StablecoinSummary>();
    if (stablecoins) {
      stablecoins.forEach((c) => map.set(c.symbol, c));
    }
    return map;
  }, [stablecoins]);

  const markers = useMemo(() => {
    return Object.entries(STABLECOIN_ISSUERS).map(([symbol, info]) => {
      const [x, y] = mercatorProjection(
        info.coordinates[0],
        info.coordinates[1],
        width,
        height
      );
      return { symbol, info, x, y, coin: coinMap.get(symbol) };
    });
  }, [coinMap]);

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-sol-text">
          Global Issuer Map
        </h3>
        <p className="text-sm text-sol-text-muted mt-1">
          Stablecoin issuers and their geographic headquarters
        </p>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-sol-dark/50 p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ maxHeight: "400px" }}
        >
          {/* Grid lines */}
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={`vline-${i}`}
              x1={i * (width / 8)}
              y1={0}
              x2={i * (width / 8)}
              y2={height}
              stroke="#1E1E3F"
              strokeWidth={0.5}
              opacity={0.3}
            />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line
              key={`hline-${i}`}
              x1={0}
              y1={i * (height / 6)}
              x2={width}
              y2={i * (height / 6)}
              stroke="#1E1E3F"
              strokeWidth={0.5}
              opacity={0.3}
            />
          ))}

          {/* Continent shapes */}
          {WORLD_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="#1A1A3E"
              stroke="#2A2A5E"
              strokeWidth={0.5}
              opacity={0.6}
            />
          ))}

          {/* Connection lines */}
          {markers.map((marker) => (
            <line
              key={`line-${marker.symbol}`}
              x1={width / 2}
              y1={height / 2}
              x2={marker.x}
              y2={marker.y}
              stroke={getStablecoinColor(marker.symbol)}
              strokeWidth={0.5}
              opacity={hoveredCoin === marker.symbol ? 0.6 : 0.15}
              strokeDasharray="4,4"
            />
          ))}

          {/* Markers */}
          {markers.map((marker) => {
            const color = getStablecoinColor(marker.symbol);
            const isHovered = hoveredCoin === marker.symbol;
            const supply = marker.coin?.current_supply || 0;
            const radius = Math.max(3, Math.min(12, Math.log10(supply + 1) - 4));
            return (
              <g
                key={marker.symbol}
                onMouseEnter={() => setHoveredCoin(marker.symbol)}
                onMouseLeave={() => setHoveredCoin(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Pulse ring */}
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r={radius + 3}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.5}
                  opacity={isHovered ? 0.6 : 0.2}
                >
                  <animate
                    attributeName="r"
                    from={radius + 2}
                    to={radius + 8}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from={0.4}
                    to={0}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Main dot */}
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r={isHovered ? radius + 1 : radius}
                  fill={color}
                  opacity={isHovered ? 1 : 0.8}
                />
                {/* Label */}
                <text
                  x={marker.x}
                  y={marker.y - radius - 4}
                  textAnchor="middle"
                  fill={isHovered ? "#E1E1FF" : "#8888AA"}
                  fontSize={isHovered ? 8 : 6}
                  fontWeight={isHovered ? 700 : 500}
                >
                  {marker.symbol}
                </text>
              </g>
            );
          })}

          {/* Solana center logo placeholder */}
          <circle
            cx={width / 2}
            cy={height / 2}
            r={4}
            fill="#9945FF"
            opacity={0.3}
          />
        </svg>

        {/* Hover tooltip */}
        {hoveredCoin && (() => {
          const marker = markers.find((m) => m.symbol === hoveredCoin);
          if (!marker) return null;
          return (
            <div className="absolute top-4 right-4 bg-sol-dark/95 backdrop-blur-md border border-sol-border rounded-xl p-4 min-w-[200px] shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getStablecoinColor(marker.symbol) }}
                />
                <span className="font-bold text-sol-text">{marker.symbol}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-sol-text-muted">Issuer</span>
                  <span className="text-sol-text">{marker.info.issuer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sol-text-muted">Region</span>
                  <span className="text-sol-text">{marker.info.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sol-text-muted">Type</span>
                  <span className="text-sol-text">{marker.info.type}</span>
                </div>
                {marker.coin && (
                  <div className="flex justify-between">
                    <span className="text-sol-text-muted">Supply</span>
                    <span className="text-sol-text font-semibold">
                      {formatCurrency(marker.coin.current_supply)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
