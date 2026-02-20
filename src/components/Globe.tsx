"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { STABLECOIN_ISSUERS, getStablecoinColor, StablecoinIssuerInfo } from "@/lib/types";
import { StablecoinSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

function latLonToVector3(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}

function GlobeWireframe() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  const gridLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      const points: [number, number, number][] = [];
      for (let lon = 0; lon <= 360; lon += 5) {
        points.push(latLonToVector3(lat, lon, 2));
      }
      lines.push(points);
    }
    // Longitude lines
    for (let lon = 0; lon < 360; lon += 30) {
      const points: [number, number, number][] = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        points.push(latLonToVector3(lat, lon, 2));
      }
      lines.push(points);
    }
    return lines;
  }, []);

  return (
    <group ref={meshRef}>
      {/* Sphere body */}
      <Sphere args={[1.98, 64, 64]}>
        <meshPhongMaterial
          color="#0B0B1A"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </Sphere>
      {/* Grid lines */}
      {gridLines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="#1E1E3F"
          lineWidth={0.5}
          transparent
          opacity={0.5}
        />
      ))}
      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.05, 0.005, 16, 100]} />
        <meshBasicMaterial color="#9945FF" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

interface IssuerMarkerProps {
  info: StablecoinIssuerInfo;
  coin?: StablecoinSummary;
  symbol: string;
}

function IssuerMarker({ info, coin, symbol }: IssuerMarkerProps) {
  const position = useMemo(
    () => latLonToVector3(info.coordinates[1], info.coordinates[0], 2.05),
    [info.coordinates]
  );

  const color = getStablecoinColor(symbol);

  return (
    <group position={position}>
      {/* Point */}
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Pulse ring */}
      <mesh>
        <ringGeometry args={[0.05, 0.07, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Label */}
      <Html distanceFactor={6} style={{ pointerEvents: "none" }}>
        <div className="bg-sol-dark/90 backdrop-blur-sm border border-sol-border rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs font-bold text-sol-text">{symbol}</span>
          </div>
          {coin && (
            <div className="text-[10px] text-sol-text-muted">
              Supply: {formatCurrency(coin.current_supply)}
            </div>
          )}
          <div className="text-[10px] text-sol-text-muted">{info.region}</div>
        </div>
      </Html>
    </group>
  );
}

interface GlobeVisualizationProps {
  stablecoins?: StablecoinSummary[];
  height?: string;
}

export default function GlobeVisualization({
  stablecoins,
  height = "500px",
}: GlobeVisualizationProps) {
  const coinMap = useMemo(() => {
    const map = new Map<string, StablecoinSummary>();
    if (stablecoins) {
      stablecoins.forEach((c) => map.set(c.symbol, c));
    }
    return map;
  }, [stablecoins]);

  return (
    <div style={{ height, width: "100%" }} className="relative">
      <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#9945FF" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#14F195" />
        <GlobeWireframe />
        {Object.entries(STABLECOIN_ISSUERS).map(([symbol, info]) => (
          <IssuerMarker
            key={symbol}
            symbol={symbol}
            info={info}
            coin={coinMap.get(symbol)}
          />
        ))}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3.5}
          maxDistance={8}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
      {/* Overlay gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-sol-darker to-transparent pointer-events-none" />
    </div>
  );
}
