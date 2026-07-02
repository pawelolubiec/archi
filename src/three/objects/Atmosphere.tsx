import { useMemo } from 'react';
import { BackSide, Color, ShaderMaterial } from 'three';
import { BRAND, GLOBE_RADIUS } from '../../data/brand';

/** Subtle atmospheric glow (fresnel) around the globe — a premium effect, not sci-fi. */
export function Atmosphere() {
  const material = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uColor: { value: new Color(BRAND.sea) },
        uPower: { value: 3.2 },
        uIntensity: { value: 1.1 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uPower;
        uniform float uIntensity;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          float fres = pow(1.0 - abs(dot(vNormal, vView)), uPower);
          gl_FragColor = vec4(uColor, fres * uIntensity);
        }
      `,
      transparent: true,
      side: BackSide,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh scale={1.18}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
