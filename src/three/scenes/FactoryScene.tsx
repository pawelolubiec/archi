import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, CubicBezierCurve3, Group, Vector3 } from 'three';
import { Html, Line, Edges } from '@react-three/drei';
import { BRAND, ACCENT_HEX } from '../../data/brand';
import { ZONE_COORDS } from '../../data/factoryLayout';
import { systemById } from '../../data/systems';
import { useStore } from '../../store/useStore';
import { PulsingDataDot } from '../objects/PulsingDataDot';
import { damp, easeOutCubic } from '../../lib/easing';

/* ── hall configuration ────────────────────────────────────────────── */

interface Building {
  id: string;
  label: string;
  pos: [number, number]; // x, z
  size: [number, number, number]; // w, h, d
  accent?: string;
}

const BUILDINGS: Building[] = [
  { id: 'office', label: 'Office / Lab', pos: ZONE_COORDS.office, size: [2.4, 0.75, 0.9], accent: BRAND.gold },
  { id: 'receiving', label: 'Receiving', pos: ZONE_COORDS.receiving, size: [4.4, 0.55, 0.9] },
  { id: 'filleting', label: 'Filleting', pos: ZONE_COORDS.filleting, size: [4.4, 1.2, 2.2], accent: BRAND.green },
  { id: 'slicing_d', label: 'Slicing D', pos: ZONE_COORDS.slicing_d, size: [1.6, 0.85, 1.8], accent: BRAND.sea },
  { id: 'map', label: 'MAP', pos: ZONE_COORDS.map, size: [1.9, 0.85, 2.0], accent: BRAND.sea },
  { id: 'freezing', label: 'Freezing', pos: ZONE_COORDS.freezing, size: [2.6, 1.0, 1.4], accent: BRAND.sea },
  { id: 'slicing_s', label: 'Slicing S', pos: ZONE_COORDS.slicing_s, size: [1.7, 0.85, 1.6] },
  { id: 'output', label: 'Output', pos: ZONE_COORDS.output, size: [1.4, 0.6, 1.0] },
];

/** Rise-in order along the production line. */
const REVEAL_ORDER = [
  'receiving',
  'filleting',
  'slicing_d',
  'map',
  'freezing',
  'slicing_s',
  'output',
  'office',
];

const buildingById = Object.fromEntries(BUILDINGS.map((b) => [b.id, b]));

const STAGGER = 0.12;
const RISE_LAMBDA = 6;
const CHIP_MIN_DIST = 1.9;
const CHIP_RING_RADIUS = 3.8;
const CHIP_BASE_Y = 2.0;

interface ChipLayout {
  systemId: string;
  x: number;
  y: number;
  z: number;
}

function zonesForSystem(
  systemId: string,
  factoryMapping: Record<string, string[]>,
): Building[] {
  return (factoryMapping[systemId] ?? [])
    .map((id) => buildingById[id])
    .filter((z): z is Building => Boolean(z));
}

/** Spread chip anchors on a ring with repulsion so labels never overlap. */
function computeChipLayouts(
  activeSystems: string[],
  factoryMapping: Record<string, string[]>,
): ChipLayout[] {
  const items = activeSystems.map((systemId) => {
    const zones = zonesForSystem(systemId, factoryMapping);
    const centroidX =
      zones.reduce((sum, z) => sum + z.pos[0], 0) / (zones.length || 1);
    const centroidZ =
      zones.reduce((sum, z) => sum + z.pos[1], 0) / (zones.length || 1);
    const angle = Math.atan2(centroidZ, centroidX);
    return { systemId, angle, centroidX, centroidZ };
  });

  items.sort((a, b) => a.angle - b.angle);

  const MIN_ANGLE = 0.58;
  let cursor = -Math.PI;
  const placed = items.map((item, i) => {
    const angle = Math.max(item.angle, cursor + MIN_ANGLE);
    cursor = angle;
    return {
      systemId: item.systemId,
      x: Math.cos(angle) * CHIP_RING_RADIUS,
      z: Math.sin(angle) * CHIP_RING_RADIUS,
      y: CHIP_BASE_Y + (i % 3) * 0.38,
    };
  });

  for (let iter = 0; iter < 28; iter++) {
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i];
        const b = placed[j];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < CHIP_MIN_DIST && dist > 0.001) {
          const push = (CHIP_MIN_DIST - dist) * 0.55;
          const nx = dx / dist;
          const nz = dz / dist;
          a.x -= nx * push;
          a.z -= nz * push;
          b.x += nx * push;
          b.z += nz * push;
        }
      }
    }
  }

  return placed;
}

function createConnectionCurve(from: Vector3, to: Vector3): CubicBezierCurve3 {
  const mid = new Vector3().addVectors(from, to).multiplyScalar(0.5);
  const dist = from.distanceTo(to);
  const lift = Math.min(2.4, 0.55 + dist * 0.42);

  const dir = new Vector3().subVectors(to, from);
  const horiz = new Vector3(dir.x, 0, dir.z);
  const perp =
    horiz.lengthSq() > 0.0001
      ? new Vector3(-horiz.z, 0, horiz.x).normalize()
      : new Vector3(1, 0, 0);
  const side = from.x * to.z - from.z * to.x >= 0 ? 1 : -1;
  const spread = perp.clone().multiplyScalar(side * Math.min(0.55, dist * 0.12));

  const c1 = new Vector3(
    from.x + spread.x * 0.35,
    from.y + lift * 0.4,
    from.z + spread.z * 0.35,
  );
  const c2 = new Vector3(
    mid.x + spread.x * 0.65,
    mid.y + lift * 0.9,
    mid.z + spread.z * 0.65,
  );

  return new CubicBezierCurve3(from.clone(), c1, c2, to.clone());
}

interface SceneProps {
  opacity?: number;
  reveal?: boolean;
}

/* ── single building ───────────────────────────────────────────── */

function BuildingMesh({
  b,
  highlight,
  scaleY,
  labelOpacity,
}: {
  b: Building;
  highlight: boolean;
  scaleY: number;
  labelOpacity: number;
}) {
  const [w, h, d] = b.size;
  const accent = b.accent ?? BRAND.sea;

  return (
    <group position={[b.pos[0], 0, b.pos[1]]} scale={[1, scaleY, 1]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={BRAND.navy}
          emissive={accent}
          emissiveIntensity={highlight ? 0.12 : 0.04}
          roughness={0.65}
          metalness={0.25}
        />
        <Edges threshold={15}>
          <lineBasicMaterial color={accent} transparent opacity={highlight ? 0.9 : 0.35} />
        </Edges>
      </mesh>

      {w > 2.4 && (
        <mesh position={[0, h + 0.06, 0]}>
          <boxGeometry args={[w * 0.6, 0.12, d * 0.28]} />
          <meshStandardMaterial
            color={BRAND.navyDeep}
            emissive={accent}
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>
      )}

      <mesh position={[0, 0.025, d / 2 + 0.03]}>
        <boxGeometry args={[w * 0.92, 0.05, 0.05]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>

      <Html position={[0, h + 0.42, 0]} center distanceFactor={8}>
        <span
          className="pointer-events-none whitespace-nowrap text-xs font-medium uppercase tracking-[0.24em] text-mist transition-opacity"
          style={{ opacity: labelOpacity }}
        >
          {b.label}
        </span>
      </Html>
    </group>
  );
}

/* ── bezier link + animated data dot ─────────────────────────────── */

function SystemConnection({
  from,
  to,
  accent,
  opacity,
  hover,
  animate,
}: {
  from: Vector3;
  to: Vector3;
  accent: string;
  opacity: number;
  hover: boolean;
  animate: boolean;
}) {
  const curve = useMemo(() => createConnectionCurve(from, to), [from, to]);
  const points = useMemo(() => curve.getPoints(40), [curve]);
  const lineOpacity = (hover ? 0.9 : 0.45) * opacity;

  return (
    <group>
      <Line
        points={points}
        color={accent}
        lineWidth={hover ? 1.4 : 1}
        transparent
        opacity={lineOpacity}
        dashed
        dashSize={0.08}
        gapSize={0.05}
      />
      {animate && opacity > 0.35 && (
        <>
          <PulsingDataDot
            curve={curve}
            color={accent}
            speed={0.12}
            offset={0}
            size={0.038}
            opacity={opacity}
          />
          <PulsingDataDot
            curve={curve}
            color={accent}
            speed={0.12}
            offset={0.45}
            size={0.03}
            opacity={opacity * 0.85}
          />
        </>
      )}
    </group>
  );
}

/* ── system chip above the building ──────────────────────────────────── */

function SystemChip({
  systemId,
  zoneIds,
  position,
  chipOpacity,
  animateLinks,
  dimmed = false,
}: {
  systemId: string;
  zoneIds: string[];
  position: Vector3;
  chipOpacity: number;
  animateLinks: boolean;
  dimmed?: boolean;
}) {
  const sys = systemById[systemId];
  const openApp = useStore((s) => s.openApp);
  const [hover, setHover] = useState(false);

  const zones = zoneIds
    .map((id) => buildingById[id])
    .filter((z): z is Building => Boolean(z));
  if (!zones.length) return null;

  const accent = ACCENT_HEX[sys.accent];
  const top = position;

  return (
    <group visible={chipOpacity > 0.01}>
      {zones.map((zone) => {
        const anchor = new Vector3(zone.pos[0], zone.size[1] + 0.05, zone.pos[1]);
        return (
          <SystemConnection
            key={zone.id}
            from={top}
            to={anchor}
            accent={accent}
            opacity={chipOpacity}
            hover={hover}
            animate={animateLinks}
          />
        );
      })}
      <Html position={[top.x, top.y, top.z]} center distanceFactor={6} zIndexRange={[40, 0]}>
        <button
          onClick={() => openApp(systemId)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className={`group rounded-xl border bg-ink/85 px-4 py-2.5 text-left shadow-panel backdrop-blur-sm transition-transform hover:scale-105 ${
            dimmed ? 'pointer-events-none' : ''
          }`}
          style={{
            borderColor: hover ? accent : `${accent}55`,
            boxShadow: hover ? `0 0 24px -6px ${accent}` : undefined,
            opacity: chipOpacity,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold" style={{ color: accent }}>
              {sys.short}
            </span>
            <span className="text-slide-caption text-mist opacity-0 transition-opacity group-hover:opacity-100">
              open ↗
            </span>
          </div>
          <div className="text-slide-caption uppercase tracking-[0.14em] text-mist">
            {sys.owner}
          </div>
        </button>
      </Html>
    </group>
  );
}

/* ── scene ────────────────────────────────────────────────────────── */

export function FactoryScene({ opacity = 1, reveal = true }: SceneProps) {
  const chapter = useStore((s) => s.current());
  const factoryMapping = useStore((s) => s.factoryMapping);
  const tourSystem = useStore((s) => s.factoryTourSystem);
  const groupRef = useRef<Group>(null);

  const scales = useRef<Record<string, number>>(
    Object.fromEntries(REVEAL_ORDER.map((id) => [id, 0])),
  );
  const labelOpacities = useRef<Record<string, number>>(
    Object.fromEntries(REVEAL_ORDER.map((id) => [id, 0])),
  );
  const [flowDraw, setFlowDraw] = useState(0);
  const [chipOpacity, setChipOpacity] = useState(0);
  const revealStart = useRef<number | null>(null);
  const [, tick] = useState(0);

  useEffect(() => {
    if (reveal) {
      revealStart.current = null;
      REVEAL_ORDER.forEach((id) => {
        scales.current[id] = 0;
        labelOpacities.current[id] = 0;
      });
      setFlowDraw(0);
      setChipOpacity(0);
    }
  }, [reveal, chapter.id]);

  const activeSystems = useMemo(
    () =>
      chapter.activeSystems.filter(
        (id) => (factoryMapping[id]?.length ?? 0) > 0,
      ),
    [chapter.activeSystems, factoryMapping],
  );

  const highlightZones = useMemo(
    () =>
      new Set<string>(
        (tourSystem ? [tourSystem] : activeSystems).flatMap(
          (id) => factoryMapping[id] ?? [],
        ),
      ),
    [activeSystems, factoryMapping, tourSystem],
  );

  const chipLayouts = useMemo(
    () => computeChipLayouts(activeSystems, factoryMapping),
    [activeSystems, factoryMapping],
  );

  const chipPositions = useMemo(
    () =>
      Object.fromEntries(
        chipLayouts.map((l) => [
          l.systemId,
          new Vector3(l.x, l.y, l.z),
        ]),
      ),
    [chipLayouts],
  );

  const flowCurve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-0.1, 0.14, -2.1),
        new Vector3(-0.1, 0.14, -0.6),
        new Vector3(1.6, 0.14, -0.2),
        new Vector3(3.0, 0.14, 0.3),
        new Vector3(1.4, 0.14, 1.7),
        new Vector3(0.5, 0.14, 2.0),
        new Vector3(-3.2, 0.14, 3.2),
      ]),
    [],
  );
  const allFlowPoints = useMemo(() => flowCurve.getPoints(120), [flowCurve]);

  const slicingCurve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-2.1, 0.14, 1.1),
        new Vector3(-2.5, 0.14, 0.4),
        new Vector3(-2.0, 0.14, 0.1),
      ]),
    [],
  );
  const allSlicingPoints = useMemo(() => slicingCurve.getPoints(50), [slicingCurve]);

  useFrame((state, delta) => {
    if (!reveal) return;

    const now = state.clock.elapsedTime;
    if (revealStart.current === null) revealStart.current = now;
    const elapsed = now - revealStart.current;

    let allLanded = true;
    REVEAL_ORDER.forEach((id, i) => {
      const start = i * STAGGER;
      const target = elapsed > start ? 1 : 0;
      scales.current[id] = damp(scales.current[id], target, RISE_LAMBDA, delta);
      if (scales.current[id] < 0.98) allLanded = false;
      labelOpacities.current[id] = damp(
        labelOpacities.current[id],
        scales.current[id] > 0.85 ? 1 : 0,
        8,
        delta,
      );
    });

    const flowTarget = allLanded ? 1 : 0;
    setFlowDraw((prev) => damp(prev, flowTarget, 4, delta));
    setChipOpacity((prev) => damp(prev, allLanded ? 1 : 0, 5, delta));

    tick((n) => n + 1);
  });

  const flowCount = Math.max(2, Math.floor(flowDraw * allFlowPoints.length));
  const flowPoints = allFlowPoints.slice(0, flowCount);
  const slicingCount = Math.max(2, Math.floor(flowDraw * allSlicingPoints.length));
  const slicingPoints = allSlicingPoints.slice(0, slicingCount);

  return (
    <group ref={groupRef} visible={opacity > 0.01}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[16, 11]} />
        <meshStandardMaterial
          color={BRAND.navyDeep}
          emissive={BRAND.navy}
          emissiveIntensity={0.12 * opacity}
          roughness={1}
          transparent
          opacity={opacity}
        />
      </mesh>
      <gridHelper args={[16, 32, BRAND.navy, BRAND.navy]} position={[0, 0, 0]} />

      {BUILDINGS.map((b) => (
        <BuildingMesh
          key={b.id}
          b={b}
          highlight={highlightZones.has(b.id)}
          scaleY={reveal ? scales.current[b.id] ?? 0 : 1}
          labelOpacity={(labelOpacities.current[b.id] ?? 1) * opacity}
        />
      ))}

      {flowDraw > 0.02 && (
        <>
          <Line
            points={flowPoints}
            color={BRAND.green}
            lineWidth={1.8}
            transparent
            opacity={0.5 * opacity * easeOutCubic(flowDraw)}
          />
          {flowDraw > 0.5 && (
            <>
              <PulsingDataDot curve={flowCurve} color={BRAND.green} speed={0.1} offset={0} size={0.05} opacity={opacity} />
              <PulsingDataDot curve={flowCurve} color={BRAND.green} speed={0.1} offset={0.33} size={0.05} opacity={opacity} />
              <PulsingDataDot curve={flowCurve} color={BRAND.green} speed={0.1} offset={0.66} size={0.05} opacity={opacity} />
            </>
          )}
        </>
      )}

      {flowDraw > 0.02 && (
        <>
          <Line
            points={slicingPoints}
            color={BRAND.sea}
            lineWidth={1.2}
            transparent
            opacity={0.4 * opacity * easeOutCubic(flowDraw)}
          />
          {flowDraw > 0.5 && (
            <PulsingDataDot curve={slicingCurve} color={BRAND.sea} speed={0.14} offset={0.2} size={0.04} opacity={opacity} />
          )}
        </>
      )}

      {activeSystems.map((id) => {
        const position = chipPositions[id];
        if (!position) return null;
        const dimmed = tourSystem !== null && tourSystem !== id;
        return (
          <SystemChip
            key={id}
            systemId={id}
            zoneIds={factoryMapping[id] ?? []}
            position={position}
            chipOpacity={chipOpacity * opacity * (dimmed ? 0.12 : 1)}
            animateLinks={chipOpacity > 0.5 && !dimmed}
            dimmed={dimmed}
          />
        );
      })}
    </group>
  );
}
