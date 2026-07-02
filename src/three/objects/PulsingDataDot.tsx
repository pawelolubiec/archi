import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, type Curve, type Vector3 } from 'three';

interface Props {
  curve: Curve<Vector3>;
  color: string;
  speed?: number;
  offset?: number;
  size?: number;
}

export function PulsingDataDot({
  curve,
  color,
  speed = 0.25,
  offset = 0,
  size = 0.022,
}: Props) {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime * speed + offset) % 1;
    const p = curve.getPointAt(t);
    ref.current.position.copy(p);
    // fade at the ends of the arc
    const fade = Math.sin(t * Math.PI);
    ref.current.scale.setScalar(0.4 + fade * 0.9);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}
