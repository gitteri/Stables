"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import * as topojson from "topojson-client";
import { geoPath, geoEquirectangular } from "d3-geo";
import type { Topology, GeometryCollection } from "topojson-specification";
import { StablecoinSummary, STABLECOIN_CURRENCY } from "@/lib/types";

// ── Currency config ────────────────────────────────────────────────────────────

const CURRENCY_COLOR: Record<string, string> = {
  USD: "#9945FF", EUR: "#7C3AED", GBP: "#0891B2", CHF: "#DC2626",
  BRL: "#16A34A", ZAR: "#D97706", JPY: "#DB2777", MXN: "#059669",
  NGN: "#65A30D", TRY: "#EA580C",
};

const CURRENCY_LABEL: Record<string, string> = {
  USD: "US Dollar", EUR: "Euro", GBP: "British Pound", CHF: "Swiss Franc",
  BRL: "Brazilian Real", ZAR: "South African Rand", JPY: "Japanese Yen",
  MXN: "Mexican Peso", NGN: "Nigerian Naira", TRY: "Turkish Lira",
};

const CURRENCY_TARGET_LON: Record<string, number> = {
  USD: -95, EUR: 10, GBP: -2, CHF: 8, BRL: -51,
  ZAR: 22, JPY: 138, MXN: -102, NGN: 8, TRY: 35,
};

const COUNTRY_CURRENCY: Record<number, string> = {
  840: "USD", 218: "USD", 222: "USD", 591: "USD", 584: "USD",
  583: "USD", 585: "USD", 626: "USD", 716: "USD", 850: "USD",
  316: "USD", 580: "USD",
  276: "EUR", 250: "EUR", 380: "EUR", 724: "EUR", 620: "EUR",
  528: "EUR",  56: "EUR",  40: "EUR", 246: "EUR", 300: "EUR",
  703: "EUR", 705: "EUR", 233: "EUR", 428: "EUR", 440: "EUR",
  442: "EUR", 470: "EUR", 196: "EUR", 372: "EUR", 191: "EUR",
  499: "EUR",  20: "EUR", 492: "EUR", 674: "EUR",
  826: "GBP",
  756: "CHF", 438: "CHF",
   76: "BRL",
  710: "ZAR", 426: "ZAR", 516: "ZAR", 748: "ZAR",
  392: "JPY",
  484: "MXN",
  566: "NGN",
  792: "TRY",
};

// ── Types ──────────────────────────────────────────────────────────────────────

type WorldTopo = Topology<{ countries: GeometryCollection }>;

// ── Texture builder ────────────────────────────────────────────────────────────

function buildTexture(
  world: WorldTopo,
  activeCurrencies: Set<string>,
  selected: string | null,
  hovered: string | null,
): THREE.CanvasTexture {
  const W = 2048, H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Ocean: dark
  ctx.fillStyle = "#06060F";
  ctx.fillRect(0, 0, W, H);

  const projection = geoEquirectangular().scale(H / Math.PI).translate([W / 2, H / 2]);
  const path = geoPath(projection, ctx);
  const countries = topojson.feature(world, world.objects.countries) as GeoJSON.FeatureCollection;

  for (const feature of countries.features) {
    const id = Number(feature.id);
    const currency = COUNTRY_CURRENCY[id];
    const active = currency && activeCurrencies.has(currency);

    ctx.beginPath();
    path(feature as Parameters<typeof path>[0]);

    let fill = "#1E1E3F";

    if (active && currency) {
      const hex = CURRENCY_COLOR[currency];
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      if (selected) {
        fill = currency === selected ? `rgba(${r},${g},${b},0.9)` : "#1E1E3F";
      } else if (hovered) {
        fill = currency === hovered ? `rgba(${r},${g},${b},0.9)` : `rgba(${r},${g},${b},0.2)`;
      } else {
        fill = `rgba(${r},${g},${b},0.7)`;
      }
    }

    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = "#0B0B1A";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ── Globe mesh ─────────────────────────────────────────────────────────────────

function GlobeMesh({
  world,
  activeCurrencies,
  selected,
  hovered,
}: {
  world: WorldTopo;
  activeCurrencies: Set<string>;
  selected: string | null;
  hovered: string | null;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRotRef = useRef<number | null>(null);

  const texture = useMemo(
    () => buildTexture(world, activeCurrencies, selected, hovered),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [world, [...activeCurrencies].sort().join(","), selected, hovered]
  );

  useEffect(() => () => { texture.dispose(); }, [texture]);

  useEffect(() => {
    if (selected && CURRENCY_TARGET_LON[selected] !== undefined && meshRef.current) {
      const lon = CURRENCY_TARGET_LON[selected];
      const base = (lon + 90) * (Math.PI / 180);
      const current = meshRef.current.rotation.y;
      const n = Math.round((current - base) / (2 * Math.PI));
      targetRotRef.current = base + n * 2 * Math.PI;
    } else {
      targetRotRef.current = null;
    }
  }, [selected]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (selected) {
      if (targetRotRef.current !== null) {
        const diff = targetRotRef.current - meshRef.current.rotation.y;
        if (Math.abs(diff) < 0.005) {
          meshRef.current.rotation.y = targetRotRef.current;
          targetRotRef.current = null;
        } else {
          meshRef.current.rotation.y += diff * Math.min(1, delta * 3);
        }
      }
    } else {
      meshRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial map={texture} shininess={8} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.08, 32, 32]} />
        <meshBasicMaterial color="#9945FF" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </>
  );
}

// ── Legend ─────────────────────────────────────────────────────────────────────

function Legend({
  activeCurrencies,
  selected,
  hovered,
  onSelect,
  onHover,
}: {
  activeCurrencies: Set<string>;
  selected: string | null;
  hovered: string | null;
  onSelect: (c: string | null) => void;
  onHover: (c: string | null) => void;
}) {
  const entries = Object.entries(CURRENCY_COLOR).filter(([c]) => activeCurrencies.has(c));
  return (
    <div
      className="absolute bottom-3 right-3 flex flex-col gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      {entries.map(([currency, color]) => {
        const isSelected = selected === currency;
        const isDimmed = (selected && !isSelected) || (hovered && hovered !== currency && !selected);
        return (
          <button
            key={currency}
            onMouseEnter={() => onHover(currency)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(isSelected ? null : currency)}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 shadow-sm text-left transition-all backdrop-blur-sm hover:opacity-100 ${
              isSelected
                ? "bg-sol-card/90 ring-1 ring-inset opacity-100"
                : isDimmed
                ? "bg-sol-card/50 opacity-40"
                : "bg-sol-card/80 opacity-100"
            }`}
            style={isSelected ? { ringColor: color } as React.CSSProperties : {}}
          >
            <div
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0 transition-transform"
              style={{
                backgroundColor: color,
                transform: isSelected ? "scale(1.2)" : "scale(1)",
              }}
            />
            <span className="text-[10px] font-medium text-sol-text">
              {CURRENCY_LABEL[currency]}
            </span>
            {isSelected && (
              <span className="ml-auto text-[9px] text-sol-text-muted">×</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Public component ───────────────────────────────────────────────────────────

export default function GlobeVisualization({
  stablecoins,
  height = "380px",
  selectedCurrency = null,
  onCurrencySelect,
}: {
  stablecoins?: StablecoinSummary[];
  height?: string;
  selectedCurrency?: string | null;
  onCurrencySelect?: (currency: string | null) => void;
}) {
  const [world, setWorld] = useState<WorldTopo | null>(null);
  const [hoveredCurrency, setHoveredCurrency] = useState<string | null>(null);

  useEffect(() => {
    fetch("/countries-110m.json").then((r) => r.json()).then(setWorld);
  }, []);

  const activeCurrencies = useMemo(() => {
    const set = new Set<string>();
    if (stablecoins?.length) {
      for (const coin of stablecoins) {
        const c = STABLECOIN_CURRENCY[coin.symbol];
        if (c && CURRENCY_COLOR[c]) set.add(c);
      }
    } else {
      Object.keys(CURRENCY_COLOR).forEach((c) => set.add(c));
    }
    return set;
  }, [stablecoins]);

  if (!world) {
    return (
      <div style={{ height, width: "100%" }} className="flex items-center justify-center bg-sol-dark rounded-b-xl">
        <div className="animate-pulse w-40 h-40 rounded-full bg-sol-card" />
      </div>
    );
  }

  return (
    <div
      style={{ height, width: "100%" }}
      className="relative bg-sol-dark rounded-b-xl overflow-hidden cursor-default"
      onClick={() => onCurrencySelect?.(null)}
    >
      <Canvas camera={{ position: [0, 0.5, 5.5], fov: 42 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[8, 6, 8]} intensity={0.6} color="#9945FF" />
        <GlobeMesh
          world={world}
          activeCurrencies={activeCurrencies}
          selected={selectedCurrency}
          hovered={hoveredCurrency}
        />
        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={3.5}
          maxDistance={8}
          autoRotate={!selectedCurrency}
          autoRotateSpeed={0.4}
        />
      </Canvas>
      <Legend
        activeCurrencies={activeCurrencies}
        selected={selectedCurrency}
        hovered={hoveredCurrency}
        onSelect={(c) => onCurrencySelect?.(c)}
        onHover={setHoveredCurrency}
      />
    </div>
  );
}
