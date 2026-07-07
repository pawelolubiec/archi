import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Group, Mesh } from 'three';
import { latLngToVector3 } from '../../lib/geo';
import { BRAND, GLOBE_RADIUS } from '../../data/brand';
import type { Location } from '../../data/types';

const TYPE_COLOR: Record<Location['type'], string> = {
  factory: BRAND.gold,
  office: BRAND.sea,
  customers: BRAND.green,
};

interface Props {
  location: Location;
  active: boolean;
  showLabel?: boolean;
  opacity?: number;
}

export function LocationMarker({
  location,
  active,
  showLabel = true,
  opacity = 1,
}: Props) {
  const ringRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const pos = latLngToVector3(location.lat, location.lng, GLOBE_RADIUS * 1.01);
  const color = TYPE_COLOR[location.type];

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      const pulse = (Math.sin(t * 2 + location.lat) + 1) / 2; // 0..1
      const s = 1 + pulse * (active ? 1.6 : 0.8);
      ringRef.current.scale.setScalar(s);
      const mat = ringRef.current.material as { opacity: number };
      mat.opacity = (active ? 0.5 : 0.25) * (1 - pulse);
    }
    if (groupRef.current) {
      // marker orientation "outward" from the globe
      groupRef.current.lookAt(pos.clone().multiplyScalar(2));
    }
  });

  return (
    <group ref={groupRef} position={pos} visible={opacity > 0.01}>
      {/* core */}
      <mesh>
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={opacity} />
      </mesh>

      {/* pulsing ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.045, 0.06, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4 * opacity}
          toneMapped={false}
        />
      </mesh>

      {active && showLabel && (
        <Html
          distanceFactor={location.labelDistanceFactor ?? 8}
          position={[0, location.labelOffsetY ?? 0.12, 0]}
          center
          occlude
          style={{ pointerEvents: 'none' }}
        >
          <span
            className="whitespace-nowrap rounded-full border bg-ink/70 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-paper backdrop-blur-sm"
            style={{ borderColor: `${color}55` }}
          >
            {location.pinLabel ?? location.name}
          </span>
        </Html>
      )}
    </group>
  );
}
