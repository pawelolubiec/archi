import { Vector3, Curve } from 'three';

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
 * A curve that follows the great circle between two points on a sphere,
 * lifted above the surface with a bump that peaks in the middle. Because it
 * interpolates along the sphere (slerp) rather than through a straight Bézier
 * control point, long arcs (e.g. near-antipodal) stay above the globe instead
 * of sinking into it.
 */
class GreatCircleArc extends Curve<Vector3> {
  private start: Vector3;
  private end: Vector3;
  private angle: number;
  private sinAngle: number;
  private radius: number;
  private peak: number;

  constructor(start: Vector3, end: Vector3, radius: number, lift: number) {
    super();
    this.start = start.clone().normalize();
    this.end = end.clone().normalize();
    this.radius = radius;
    this.angle = this.start.angleTo(this.end);
    this.sinAngle = Math.sin(this.angle);
    // higher, more visible bulge for longer arcs; endpoints stay on the surface
    this.peak = radius * (0.12 + lift * (this.angle / Math.PI));
  }

  getPoint(t: number, target = new Vector3()): Vector3 {
    const { start, end, angle, sinAngle } = this;
    if (sinAngle < 1e-4) {
      target.copy(start);
    } else {
      const a = Math.sin((1 - t) * angle) / sinAngle;
      const b = Math.sin(t * angle) / sinAngle;
      target.set(
        start.x * a + end.x * b,
        start.y * a + end.y * b,
        start.z * a + end.z * b,
      );
      target.normalize();
    }
    const altitude = this.radius + this.peak * Math.sin(Math.PI * t);
    return target.multiplyScalar(altitude);
  }
}

/**
 * Great-circle arc between two geographic points, riding above the sphere.
 */
export function greatCircleCurve(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  radius: number,
  lift = 0.3,
): Curve<Vector3> {
  const start = latLngToVector3(fromLat, fromLng, radius);
  const end = latLngToVector3(toLat, toLng, radius);
  return new GreatCircleArc(start, end, radius, lift);
}

/** Samples the curve into N points (for drei <Line>). */
export function sampleCurve(curve: Curve<Vector3>, segments = 64): Vector3[] {
  return curve.getPoints(segments);
}
