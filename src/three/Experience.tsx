import { Suspense, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { CameraRig } from './CameraRig';
import { GlobeScene } from './scenes/GlobeScene';
import { FactoryScene } from './scenes/FactoryScene';
import { BRAND } from '../data/brand';
import { useStore } from '../store/useStore';
import { sceneOpacities } from '../lib/cameraKeyframes';

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

/** Brief atmospheric cloud during globe ↔ factory cross-fade. */
function TransitionCloud() {
  const sceneTransition = useStore((s) => s.sceneTransition);
  const progress = useStore((s) => s.transitionProgress);

  if (sceneTransition === 'none') return null;

  const peak =
    sceneTransition === 'toFactory'
      ? progress > 0.18 && progress < 0.42
        ? Math.sin(((progress - 0.18) / 0.24) * Math.PI)
        : 0
      : progress > 0.38 && progress < 0.62
        ? Math.sin(((progress - 0.38) / 0.24) * Math.PI)
        : 0;

  if (peak < 0.01) return null;

  return (
    <mesh scale={1.2 + peak * 0.8}>
      <sphereGeometry args={[2.8, 32, 32]} />
      <meshBasicMaterial
        color={BRAND.paper}
        transparent
        opacity={peak * 0.18}
        depthWrite={false}
      />
    </mesh>
  );
}

function SceneSwitch() {
  const chapter = useStore((s) => s.current());
  const sceneTransition = useStore((s) => s.sceneTransition);
  const progress = useStore((s) => s.transitionProgress);

  const is2D =
    chapter.scene !== 'globe' && chapter.scene !== 'factory';

  const { globe: globeOpacity, factory: factoryOpacity } = sceneOpacities(
    sceneTransition,
    progress,
  );

  const showGlobe =
    (chapter.scene === 'globe' ||
      is2D ||
      sceneTransition === 'toFactory' ||
      sceneTransition === 'toGlobe') &&
    globeOpacity > 0.02;

  const showFactory =
    (chapter.scene === 'factory' ||
      sceneTransition === 'toFactory' ||
      sceneTransition === 'toGlobe') &&
    factoryOpacity > 0.02;

  const globeScale =
    sceneTransition === 'toFactory'
      ? Math.max(0.25, 1 - progress * 0.75)
      : sceneTransition === 'toGlobe'
        ? 0.25 + progress * 0.75
        : 1;

  return (
    <>
      {showGlobe && (
        <group scale={globeScale}>
          <GlobeScene
            opacity={is2D ? 0.55 : globeOpacity}
            ambientMode={is2D}
          />
        </group>
      )}
      {showFactory && (
        <FactoryScene
          opacity={factoryOpacity}
          reveal={factoryOpacity > 0.01}
        />
      )}
      <TransitionCloud />
    </>
  );
}

function PostEffects() {
  const chapter = useStore((s) => s.current());
  const isFactory = chapter.scene === 'factory';

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.7}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.4}
        mipmapBlur
        radius={0.5}
      />
      <Vignette eskil={false} offset={0.25} darkness={isFactory ? 0.45 : 0.7} />
    </EffectComposer>
  );
}

function CameraFovSync() {
  const chapter = useStore((s) => s.current());
  const { camera } = useThree();

  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    cam.fov = chapter.scene === 'factory' ? 44 : 38;
    cam.updateProjectionMatrix();
  }, [camera, chapter.scene]);

  return null;
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
      gl={{ antialias: false, alpha: false }}
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
        <CameraFovSync />
      </Suspense>

      <PostEffects />
    </Canvas>
  );
}
