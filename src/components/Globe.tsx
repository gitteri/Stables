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
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
  });

  const gridLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    for (let lat = -60; lat <= 60; lat += 30) {
      const points: [number, number, number][] = [];
      for (let lon = 0; lon <= 360; lon += 5) points.push(latLonToVector3(lat, lon, 2));
      lines.push(points);
    }
    for (let lon = 0; lon < 360; lon += 30) {
      const points: [number, number, number][] = [];
      for (let lat = -90; lat <= 90; lat += 5) points.push(latLonToVector3(lat, lon, 2));
      lines.push(points);
    }
    return lines;
  }, []);

  return (
    <group ref={meshRef}>
      <Sphere args={[1.98, 64, 64]}>
        <meshPhongMaterial color="#F8FAFC" transparent opacity={0.85} side={THREE.DoubleSide} />
      </Sphere>
      {gridLines.map((points, i) => (
        <Line key={i} points={points} color="#CBD5E1" lineWidth={0.4} transparent opacity={0.5} />
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.05, 0.005, 16, 100]} />
        <meshBasicMaterial color="#4F46E5" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function IssuerMarker({ info, coin, symbol }: { info: StablecoinIssuerInfo; coin?: StablecoinSummary; symbol: string }) {
  const position = useMemo(() => latLonToVector3(info.coordinates[1], info.coordinates[0], 2.05), [info.coordinates]);
  const color = getStablecoinColor(symbol);
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.05, 0.07, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <Html distanceFactor={6} style={{ pointerEvents: "none" }}>
        <div className="bg-white/95 backdrop-blur-sm border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-md">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-bold text-[#0F172A]">{symbol}</span>
          </div>
          {coin && <div className="text-[9px] text-[#64748B]">{formatCurrency(coin.current_supply)}</div>}
        </div>
      </Html>
    </group>
  );
}

export default function GlobeVisualization({ stablecoins, height = "500px" }: { stablecoins?: StablecoinSummary[]; height?: string }) {
  const coinMap = useMemo(() => {
    const map = new Map<string, StablecoinSummary>();
    if (stablecoins) stablecoins.forEach((c) => map.set(c.symbol, c));
    return map;
  }, [stablecoins]);

  return (
    <div style={{ height, width: "100%" }} className="relative bg-[#F8FAFC] rounded-b-xl">
      <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.6} color="#4F46E5" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#14F195" />
        <GlobeWireframe />
        {Object.entries(STABLECOIN_ISSUERS).map(([symbol, info]) => (
          <IssuerMarker key={symbol} symbol={symbol} info={info} coin={coinMap.get(symbol)} />
        ))}
        <OrbitControls enableZoom enablePan={false} minDistance={3.5} maxDistance={8} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
    </div>
  );
}
