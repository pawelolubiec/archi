import { Vector3, QuadraticBezierCurve3 } from 'three';

/** Converts geographic coordinates to a point on the sphere. */
export function latLngToVector3(lat: number, lng: number, radius: number): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new Vector3(x, y, z);
}

/**
 * Great-circle arc between two geographic points.
 * The control point is pushed outward proportionally to the distance,
 * giving a natural, "flight path" bulge.
 */
export function greatCircleCurve(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  radius: number,
  lift = 0.3,
): QuadraticBezierCurve3 {
  const start = latLngToVector3(fromLat, fromLng, radius);
  const end = latLngToVector3(toLat, toLng, radius);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dist = start.distanceTo(end);
  mid.normalize().multiplyScalar(radius + dist * lift);
  return new QuadraticBezierCurve3(start, mid, end);
}

/** Samples the curve into N points (for drei <Line>). */
export function sampleCurve(curve: QuadraticBezierCurve3, segments = 64): Vector3[] {
  return curve.getPoints(segments);
}
