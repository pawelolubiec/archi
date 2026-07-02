import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { CameraRig } from './CameraRig';
import { GlobeScene } from './scenes/GlobeScene';
import { FactoryScene } from './scenes/FactoryScene';
import { BRAND } from '../data/brand';
import { useStore } from '../store/useStore';

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

function SceneSwitch() {
  const scene = useStore((s) => s.current().scene);
  // The factory has its own scene; the other chapters use the globe
  // (for 2D scenes the globe remains as a calm, dimmed background).
  if (scene === 'factory') return <FactoryScene />;
  return <GlobeScene />;
}

export function Experience() {
  const hasWebGL = useMemo(detectWebGL, []);

  if (!hasWebGL) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-ink p-12 text-center">
        <div className="max-w-md">
          <p className="font-display text-2xl text-paper">
            3D graphics unavailable
          </p>
          <p className="mt-3 text-sm text-mist">
            This browser or device does not support WebGL. Open the presentation
            in a current version of Chrome, Edge, or Safari with hardware
            acceleration enabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: false, preserveDrawingBuffer: true }}
      camera={{ position: [0.6, 2.6, 8.6], fov: 38, near: 0.1, far: 100 }}
      onCreated={({ gl }) => gl.setClearColor(BRAND.ink)}
    >
      <fog attach="fog" args={[BRAND.ink, 14, 30]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 4, 6]} intensity={1.1} color="#cfe6ff" />
      <directionalLight position={[-8, -2, -4]} intensity={0.25} color={BRAND.sea} />

      <Suspense fallback={null}>
        <Stars
          radius={60}
          depth={40}
          count={2600}
          factor={3}
          saturation={0}
          fade
          speed={0.4}
        />
        <SceneSwitch />
        <CameraRig />
      </Suspense>

      {false && (
        <EffectComposer multisampling={4}>
          <Bloom
            intensity={0.7}
            luminanceThreshold={0.35}
            luminanceSmoothing={0.4}
            mipmapBlur
            radius={0.5}
          />
          <Vignette eskil={false} offset={0.25} darkness={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
