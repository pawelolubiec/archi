import { useMemo } from 'react';
import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute } from 'three';
import { latLngToVector3 } from '../../lib/geo';
import { BRAND, GLOBE_RADIUS } from '../../data/brand';
import landDots from '../../data/landDots.json';

/**
 * Continents as a grid of glowing dots (dotted landmass).
 * A single draw call (THREE.Points) — lightweight on mobile too.
 * Dots closer to the "front" are not artificially brightened — depth comes
 * from per-vertex color with slight variation + additive blending.
 */
export function LandDots() {
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    const base = new Color(BRAND.sea);
    const dim = new Color(BRAND.mist);

    for (let i = 0; i < landDots.length; i++) {
      const [lat, lng] = landDots[i] as [number, number];
      const v = latLngToVector3(lat, lng, GLOBE_RADIUS * 1.002);
      positions.push(v.x, v.y, v.z);

      // subtle brightness variation so the landmass isn't a flat blob
      const t = 0.55 + 0.45 * Math.abs(Math.sin(lat * 12.9898 + lng * 78.233));
      const c = dim.clone().lerp(base, t);
      colors.push(c.r, c.g, c.b);
    }

    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.022}
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
