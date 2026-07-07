import type { Vector3Tuple } from 'three';
import { latLngToVector3 } from './geo';
import { GLOBE_RADIUS } from '../data/brand';
import { locationById } from '../data/locations';
import { easeInOutCubic } from './easing';

const factory = locationById.factory_poland;
const factorySurface = latLngToVector3(factory.lat, factory.lng, GLOBE_RADIUS);

/** Close-up on the Poland factory marker during globe→factory descent. */
export const POLAND_DIVE: { position: Vector3Tuple; target: Vector3Tuple } = {
  position: [
    factorySurface.x * 2.6,
    factorySurface.y * 2.6 + 0.4,
    factorySurface.z * 2.6,
  ],
  target: [factorySurface.x, factorySurface.y, factorySurface.z],
};

function lerpTuple(a: Vector3Tuple, b: Vector3Tuple, t: number): Vector3Tuple {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

/** Camera path for globe → factory transition (progress 0..1). */
export function cameraForToFactory(
  progress: number,
  from: { position: Vector3Tuple; target: Vector3Tuple },
  to: { position: Vector3Tuple; target: Vector3Tuple },
): { position: Vector3Tuple; target: Vector3Tuple } {
  const p = easeInOutCubic(progress);
  if (p < 0.35) {
    const t = p / 0.35;
    return {
      position: lerpTuple(from.position, POLAND_DIVE.position, t),
      target: lerpTuple(from.target, POLAND_DIVE.target, t),
    };
  }
  if (p < 0.55) {
    return { position: POLAND_DIVE.position, target: POLAND_DIVE.target };
  }
  const t = (p - 0.55) / 0.45;
  return {
    position: lerpTuple(POLAND_DIVE.position, to.position, easeInOutCubic(t)),
    target: lerpTuple(POLAND_DIVE.target, to.target, easeInOutCubic(t)),
  };
}

/** Camera path for factory → globe transition (progress 0..1). */
export function cameraForToGlobe(
  progress: number,
  from: { position: Vector3Tuple; target: Vector3Tuple },
  to: { position: Vector3Tuple; target: Vector3Tuple },
): { position: Vector3Tuple; target: Vector3Tuple } {
  const p = easeInOutCubic(progress);
  if (p < 0.45) {
    const t = p / 0.45;
    return {
      position: lerpTuple(from.position, POLAND_DIVE.position, t),
      target: lerpTuple(from.target, POLAND_DIVE.target, t),
    };
  }
  if (p < 0.65) {
    return { position: POLAND_DIVE.position, target: POLAND_DIVE.target };
  }
  const t = (p - 0.65) / 0.35;
  return {
    position: lerpTuple(POLAND_DIVE.position, to.position, easeInOutCubic(t)),
    target: lerpTuple(POLAND_DIVE.target, to.target, easeInOutCubic(t)),
  };
}

/** Globe/factory visual opacity during cross-fade. */
export function sceneOpacities(
  transition: 'none' | 'toFactory' | 'toGlobe',
  progress: number,
): { globe: number; factory: number } {
  if (transition === 'none') return { globe: 1, factory: 1 };
  const p = easeInOutCubic(progress);
  if (transition === 'toFactory') {
    const globe =
      p < 0.35 ? 1 : p < 0.55 ? 1 - (p - 0.35) / 0.2 : 0;
    const factory = p < 0.55 ? 0 : p < 0.75 ? (p - 0.55) / 0.2 : 1;
    return { globe, factory };
  }
  // toGlobe
  const factory = p < 0.45 ? 1 : p < 0.65 ? 1 - (p - 0.45) / 0.2 : 0;
  const globe = p < 0.45 ? 0 : p < 0.65 ? (p - 0.45) / 0.2 : 1;
  return { globe, factory };
}
