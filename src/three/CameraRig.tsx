import { useEffect, useRef } from 'react';
import { CameraControls } from '@react-three/drei';
import type CameraControlsImpl from 'camera-controls';
import { useStore } from '../store/useStore';

export function CameraRig() {
  const ref = useRef<CameraControlsImpl>(null);
  const chapter = useStore((s) => s.current());

  // cinematic settings + light interaction constraints for the presentation
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.smoothTime = 0.9;
    c.draggingSmoothTime = 0.25;
    c.minDistance = 3;
    c.maxDistance = 16;
    c.dollyToCursor = false;
  }, []);

  // camera transition on chapter change
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const [px, py, pz] = chapter.cameraPosition;
    const [tx, ty, tz] = chapter.cameraTarget;
    c.setLookAt(px, py, pz, tx, ty, tz, true);
  }, [chapter]);

  return <CameraControls ref={ref} makeDefault />;
}
