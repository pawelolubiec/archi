import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, type Curve, type Vector3 } from 'three';

interface Props {
  curve: Curve<Vector3>;
  color: string;
  speed?: number;
  offset?: number;
  size?: number;
  opacity?: number;
}

const TRAIL_OFFSETS = [0.04, 0.08, 0.12];

export function PulsingDataDot({
  curve,
  color,
  speed = 0.25,
  offset = 0,
  size = 0.012,
  opacity = 1,
}: Props) {
  const headRef = useRef<Mesh>(null);
  const trailRefs = useRef<(Mesh | null)[]>([]);

  useFrame((state) => {
    const t = (state.clock.elapsedTime * speed + offset) % 1;
    const p = curve.getPointAt(t);
    const fade = Math.sin(t * Math.PI);

    if (headRef.current) {
      headRef.current.position.copy(p);
      headRef.current.scale.setScalar(0.4 + fade * 0.9);
    }

    TRAIL_OFFSETS.forEach((trailOffset, i) => {
      const mesh = trailRefs.current[i];
      if (!mesh) return;
      const tt = (t - trailOffset + 1) % 1;
      const trailFade = Math.sin(tt * Math.PI);
      mesh.position.copy(curve.getPointAt(tt));
      const trailScale = (0.25 + trailFade * 0.5) * (1 - i * 0.22);
      mesh.scale.setScalar(trailScale);
      const mat = mesh.material as { opacity: number };
      mat.opacity = trailFade * (0.5 - i * 0.12) * opacity;
    });
  });

  return (
    <group visible={opacity > 0.01}>
      <mesh ref={headRef}>
        <sphereGeometry args={[size, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={opacity} />
      </mesh>
      {TRAIL_OFFSETS.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[size * 0.7, 8, 8]} />
          <meshBasicMaterial
            color={color}
            toneMapped={false}
            transparent
            opacity={0.3 * opacity}
          />
        </mesh>
      ))}
    </group>
  );
}
