"use client";

import { useMemo, useState, useEffect } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { STABLECOIN_ISSUERS, getStablecoinColor, StablecoinSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

type WorldTopo = Topology<{ countries: GeometryCollection }>;

const W = 960;
const H = 500;

const projection = geoNaturalEarth1()
  .scale(153)
  .translate([W / 2, H / 2]);

const pathGen = geoPath(projection);

interface WorldMapProps {
  stablecoins?: StablecoinSummary[];
}

export default function WorldMap({ stablecoins }: WorldMapProps) {
  const [world, setWorld] = useState<WorldTopo | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    fetch("/countries-110m.json")
      .then((r) => r.json())
      .then(setWorld);
  }, []);

  const coinMap = useMemo(() => {
    const map = new Map<string, StablecoinSummary>();
    stablecoins?.forEach((c) => map.set(c.symbol, c));
    return map;
  }, [stablecoins]);

  const countryPaths = useMemo(() => {
    if (!world) return [];
    const countries = topojson.feature(world, world.objects.countries) as GeoJSON.FeatureCollection;
    return countries.features.map((f) => ({
      id: f.id,
      d: pathGen(f as Parameters<typeof pathGen>[0]) || "",
    }));
  }, [world]);

  const markers = useMemo(() => {
    return Object.entries(STABLECOIN_ISSUERS).map(([symbol, info]) => {
      const [lon, lat] = info.coordinates;
      const projected = projection([lon, lat]);
      const supply = coinMap.get(symbol)?.current_supply || 0;
      const r = supply > 0 ? Math.max(4, Math.min(14, Math.log10(supply + 1) - 3)) : 4;
      return { symbol, info, x: projected?.[0] ?? 0, y: projected?.[1] ?? 0, supply, r, coin: coinMap.get(symbol) };
    });
  }, [coinMap]);

  const hoveredMarker = markers.find((m) => m.symbol === hovered);

  return (
    <div className="glass-card p-5">
      <div className="mb-4">
        <h3 className="text-[15px] font-semibold text-sol-text">Global Issuer Map</h3>
        <p className="text-[12px] text-sol-text-muted mt-0.5">Stablecoin issuers and their geographic headquarters</p>
      </div>
      <div className="relative rounded-lg overflow-hidden bg-sol-dark">
        {!world ? (
          <div className="h-[260px] flex items-center justify-center">
            <div className="animate-pulse w-full h-full bg-sol-card" />
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto block"
            style={{ maxHeight: 340 }}
          >
            {countryPaths.map((c) => (
              <path
                key={String(c.id)}
                d={c.d}
                fill="#1E1E3F"
                stroke="#0B0B1A"
                strokeWidth={0.4}
              />
            ))}

            {markers.map((m) => {
              const color = getStablecoinColor(m.symbol);
              const isHovered = hovered === m.symbol;
              return (
                <g
                  key={m.symbol}
                  onMouseEnter={() => setHovered(m.symbol)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                >
                  <circle cx={m.x} cy={m.y} r={m.r + 4} fill={color} opacity={0.15}>
                    <animate attributeName="r" values={`${m.r + 3};${m.r + 9};${m.r + 3}`} dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.25;0;0.25" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <circle
                    cx={m.x}
                    cy={m.y}
                    r={isHovered ? m.r + 1.5 : m.r}
                    fill={color}
                    stroke="#06060F"
                    strokeWidth={1.5}
                    opacity={isHovered ? 1 : 0.85}
                  />
                  <text
                    x={m.x}
                    y={m.y - m.r - 5}
                    textAnchor="middle"
                    fill={isHovered ? "#E1E1FF" : "#8888AA"}
                    fontSize={isHovered ? 10 : 8}
                    fontWeight={isHovered ? 700 : 600}
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {m.symbol}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {hoveredMarker && (
          <div className="absolute top-3 right-3 bg-sol-card border border-sol-border rounded-lg p-3 min-w-[180px] shadow-lg pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getStablecoinColor(hoveredMarker.symbol) }} />
              <span className="text-[13px] font-bold text-sol-text">{hoveredMarker.symbol}</span>
            </div>
            <div className="space-y-1 text-[12px]">
              <div className="flex justify-between gap-4">
                <span className="text-sol-text-muted">Issuer</span>
                <span className="text-sol-text text-right">{hoveredMarker.info.issuer}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-sol-text-muted">Region</span>
                <span className="text-sol-text">{hoveredMarker.info.region}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-sol-text-muted">Type</span>
                <span className="text-sol-text">{hoveredMarker.info.type}</span>
              </div>
              {hoveredMarker.coin && (
                <div className="flex justify-between gap-4">
                  <span className="text-sol-text-muted">Supply</span>
                  <span className="text-sol-text font-semibold">{formatCurrency(hoveredMarker.coin.current_supply)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
