import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type CameraControlsImpl from 'camera-controls';
import { Vector3 } from 'three';
import { useStore } from '../store/useStore';
import { chapters } from '../data/chapters';
import {
  cameraForToFactory,
  cameraForToGlobe,
} from '../lib/cameraKeyframes';

const TRANSITION_DURATION = 2.4;

interface Props {
  controlsRef: React.RefObject<CameraControlsImpl | null>;
}

/**
 * Animates globe ↔ factory cross-fade progress and drives the camera
 * through dive keyframes during the transition.
 */
export function SceneTransitionController({ controlsRef }: Props) {
  const sceneTransition = useStore((s) => s.sceneTransition);
  const transitionFromCamera = useStore((s) => s.transitionFromCamera);
  const index = useStore((s) => s.index);
  const setTransitionProgress = useStore((s) => s.setTransitionProgress);
  const finishTransition = useStore((s) => s.finishTransition);
  const setTransitionFromCamera = useStore((s) => s.setTransitionFromCamera);

  const elapsed = useRef(0);
  const prevTransition = useRef(sceneTransition);
  const capturedFrom = useRef(false);

  // capture camera at transition start
  useEffect(() => {
    if (sceneTransition === 'none') {
      capturedFrom.current = false;
      elapsed.current = 0;
      prevTransition.current = 'none';
      return;
    }
    if (sceneTransition !== prevTransition.current) {
      elapsed.current = 0;
      prevTransition.current = sceneTransition;
      capturedFrom.current = false;
    }
  }, [sceneTransition]);

  useFrame((_, delta) => {
    if (sceneTransition === 'none') return;

    const controls = controlsRef.current;
    if (!controls) return;

    // snapshot starting camera once
    if (!capturedFrom.current && !transitionFromCamera) {
      const pos = new Vector3();
      const tgt = new Vector3();
      controls.getPosition(pos);
      controls.getTarget(tgt);
      setTransitionFromCamera({
        position: [pos.x, pos.y, pos.z],
        target: [tgt.x, tgt.y, tgt.z],
      });
      capturedFrom.current = true;
    }

    const fromCam = transitionFromCamera ?? {
      position: chapters[Math.max(0, index - 1)].cameraPosition,
      target: chapters[Math.max(0, index - 1)].cameraTarget,
    };
    const toChapter = chapters[index];
    const toCam = {
      position: toChapter.cameraPosition,
      target: toChapter.cameraTarget,
    };

    elapsed.current += delta;
    const progress = Math.min(1, elapsed.current / TRANSITION_DURATION);
    setTransitionProgress(progress);

    const cam =
      sceneTransition === 'toFactory'
        ? cameraForToFactory(progress, fromCam, toCam)
        : cameraForToGlobe(progress, fromCam, toCam);

    controls.setLookAt(
      cam.position[0],
      cam.position[1],
      cam.position[2],
      cam.target[0],
      cam.target[1],
      cam.target[2],
      false,
    );

    if (progress >= 1) {
      finishTransition();
    }
  });

  return null;
}
