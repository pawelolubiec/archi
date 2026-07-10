import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import type CameraControlsImpl from 'camera-controls';
import { useStore } from '../store/useStore';
import { chapters } from '../data/chapters';
import { SceneTransitionController } from './SceneTransitionController';

const INTRO_DURATION = 2.5;
const IDLE_AZIMUTH_SPEED = 0.04; // radians per second

export function CameraRig() {
  const ref = useRef<CameraControlsImpl>(null);
  const chapter = useStore((s) => s.current());
  const sceneTransition = useStore((s) => s.sceneTransition);
  const index = useStore((s) => s.index);

  const introDone = useRef(false);
  const introElapsed = useRef(0);
  const lastChapterId = useRef(chapter.id);
  const userDragging = useRef(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.smoothTime = 0.9;
    c.draggingSmoothTime = 0.25;
    c.minDistance = 3;
    c.maxDistance = chapter.scene === 'factory' ? 20 : 16;
    c.dollyToCursor = false;

    const onStart = () => {
      userDragging.current = true;
    };
    const onEnd = () => {
      userDragging.current = false;
    };
    c.addEventListener('controlstart', onStart);
    c.addEventListener('controlend', onEnd);
    return () => {
      c.removeEventListener('controlstart', onStart);
      c.removeEventListener('controlend', onEnd);
    };
  }, [chapter.scene]);

  // intro flight on first load
  useFrame((_, delta) => {
    const c = ref.current;
    if (!c || introDone.current || sceneTransition !== 'none') return;

    if (introElapsed.current === 0) {
      const [px, py, pz] = chapter.cameraPosition;
      const [tx, ty, tz] = chapter.cameraTarget;
      // start ~2× farther from target
      c.setLookAt(px * 1.85, py * 1.85, pz * 1.85, tx, ty, tz, false);
    }

    introElapsed.current += delta;
    const t = Math.min(1, introElapsed.current / INTRO_DURATION);
    const eased = 1 - Math.pow(1 - t, 3);
    const [px, py, pz] = chapter.cameraPosition;
    const [tx, ty, tz] = chapter.cameraTarget;
    const fromScale = 1.85;
    const scale = fromScale + (1 - fromScale) * eased;
    c.setLookAt(px * scale, py * scale, pz * scale, tx, ty, tz, false);

    if (t >= 1) introDone.current = true;
  });

  // camera transition on chapter change (skip during scene cross-fade)
  useEffect(() => {
    const c = ref.current;
    if (!c || sceneTransition !== 'none') return;

    // skip if same chapter (e.g. re-render)
    if (lastChapterId.current === chapter.id && introDone.current) return;
    lastChapterId.current = chapter.id;

    // intro handles chapter 0 on load
    if (!introDone.current && index === 0) return;

    const [px, py, pz] = chapter.cameraPosition;
    const [tx, ty, tz] = chapter.cameraTarget;
    c.setLookAt(px, py, pz, tx, ty, tz, true);
  }, [chapter, sceneTransition, index]);

  // subtle idle orbital drift on 3D chapters
  useFrame((_, delta) => {
    const c = ref.current;
    if (
      !c ||
      !introDone.current ||
      sceneTransition !== 'none' ||
      userDragging.current
    )
      return;

    const is3D = chapter.scene === 'globe' || chapter.scene === 'factory';
    if (!is3D) return;

    c.rotate(IDLE_AZIMUTH_SPEED * delta, 0, false);
  });

  return (
    <>
      <CameraControls ref={ref} makeDefault />
      <SceneTransitionController controlsRef={ref} />
    </>
  );
}
