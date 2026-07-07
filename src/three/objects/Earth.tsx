import { useMemo } from 'react';
import { Vector3 } from 'three';
import { Line } from '@react-three/drei';
import { BRAND, GLOBE_RADIUS } from '../../data/brand';
import { Atmosphere } from './Atmosphere';
import { LandDots } from './LandDots';

/** Generates latitude and longitude lines as line loops. */
function useGraticule(radius: number) {
  return useMemo(() => {
    const lines: Vector3[][] = [];
    const seg = 96;

    // latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (90 - lat) * (Math.PI / 180);
      const r = radius * Math.sin(phi);
      const y = radius * Math.cos(phi);
      const pts: Vector3[] = [];
      for (let i = 0; i <= seg; i++) {
        const t = (i / seg) * Math.PI * 2;
        pts.push(new Vector3(Math.cos(t) * r, y, Math.sin(t) * r));
      }
      lines.push(pts);
    }

    // longitude lines
    for (let lng = 0; lng < 360; lng += 30) {
      const theta = lng * (Math.PI / 180);
      const pts: Vector3[] = [];
      for (let i = 0; i <= seg; i++) {
        const phi = (i / seg) * Math.PI;
        const r = radius * Math.sin(phi);
        const y = radius * Math.cos(phi);
        pts.push(new Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
      }
      lines.push(pts);
    }
    return lines;
  }, [radius]);
}

export function Earth({ opacity = 1 }: { opacity?: number }) {
  // slightly larger than the core sphere to avoid z-fighting flicker
  const graticule = useGraticule(GLOBE_RADIUS * 1.004);

  return (
    <group>
      {/* globe core */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 96, 96]} />
        <meshStandardMaterial
          color={BRAND.navyDeep}
          emissive={BRAND.navy}
          emissiveIntensity={0.35 * opacity}
          roughness={0.85}
          metalness={0.1}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>

      {/* continents as dots */}
      <LandDots opacity={opacity} />

      {/* geographic grid */}
      {graticule.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color={BRAND.sea}
          lineWidth={0.6}
          transparent
          opacity={0.09 * opacity}
        />
      ))}

      <Atmosphere opacity={opacity} />
    </group>
  );
}
