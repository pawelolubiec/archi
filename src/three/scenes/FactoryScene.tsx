import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, Group, Vector3 } from 'three';
import { Html, Line, Edges } from '@react-three/drei';
import { BRAND, ACCENT_HEX } from '../../data/brand';
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
  { id: 'office', label: 'Office / Lab', pos: [-1.3, -3.4], size: [2.4, 0.75, 0.9], accent: BRAND.gold },
  { id: 'receiving', label: 'Receiving', pos: [-0.1, -2.1], size: [4.4, 0.55, 0.9] },
  { id: 'filleting', label: 'Filleting', pos: [-0.1, -0.2], size: [4.4, 1.2, 2.2], accent: BRAND.green },
  { id: 'slicing_d', label: 'Slicing D', pos: [-2.9, -0.2], size: [1.6, 0.85, 1.8], accent: BRAND.sea },
  { id: 'map', label: 'MAP', pos: [3.0, -0.2], size: [1.9, 0.85, 2.0], accent: BRAND.sea },
  { id: 'freezing', label: 'Freezing', pos: [0.5, 2.0], size: [2.6, 1.0, 1.4], accent: BRAND.sea },
  { id: 'slicing_s', label: 'Slicing S', pos: [-2.1, 2.0], size: [1.7, 0.85, 1.6] },
  { id: 'output', label: 'Output', pos: [-3.2, 3.4], size: [1.4, 0.6, 1.0] },
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

      <Html position={[0, h + 0.42, 0]} center distanceFactor={11}>
        <span
          className="pointer-events-none whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.24em] text-mist transition-opacity"
          style={{ opacity: labelOpacity }}
        >
          {b.label}
        </span>
      </Html>
    </group>
  );
}

/* ── system chip above the building ──────────────────────────────────── */

function SystemChip({
  systemId,
  zoneIds,
  index,
  chipOpacity,
}: {
  systemId: string;
  zoneIds: string[];
  index: number;
  chipOpacity: number;
}) {
  const sys = systemById[systemId];
  const openApp = useStore((s) => s.openApp);
  const [hover, setHover] = useState(false);

  const zones = zoneIds
    .map((id) => buildingById[id])
    .filter((z): z is Building => Boolean(z));
  if (!zones.length) return null;

  const centroidX = zones.reduce((sum, z) => sum + z.pos[0], 0) / zones.length;
  const centroidZ = zones.reduce((sum, z) => sum + z.pos[1], 0) / zones.length;
  const avgHeight =
    zones.reduce((sum, z) => sum + z.size[1], 0) / zones.length;

  const accent = ACCENT_HEX[sys.accent];
  const offsetX = (index % 3 - 1) * 1.4;
  const offsetZ = Math.floor(index / 3) * 0.9;

  const top = new Vector3(
    centroidX + offsetX,
    avgHeight + 1.15 + (index % 2) * 0.22,
    centroidZ + offsetZ,
  );

  return (
    <group visible={chipOpacity > 0.01}>
      {zones.map((zone) => {
        const anchor = new Vector3(zone.pos[0], zone.size[1] + 0.05, zone.pos[1]);
        return (
          <Line
            key={zone.id}
            points={[top, anchor]}
            color={accent}
            lineWidth={1}
            transparent
            opacity={(hover ? 0.85 : 0.4) * chipOpacity}
            dashed
            dashSize={0.09}
            gapSize={0.06}
          />
        );
      })}
      <Html position={[top.x, top.y, top.z]} center distanceFactor={9}>
        <button
          onClick={() => openApp(systemId)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="group rounded-xl border bg-ink/85 px-3.5 py-2 text-left shadow-panel backdrop-blur-sm transition-transform hover:scale-105"
          style={{
            borderColor: hover ? accent : `${accent}55`,
            boxShadow: hover ? `0 0 24px -6px ${accent}` : undefined,
            opacity: chipOpacity,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: accent }}>
              {sys.short}
            </span>
            <span className="text-[9px] text-mist opacity-0 transition-opacity group-hover:opacity-100">
              open ↗
            </span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-mist">
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
        activeSystems.flatMap((id) => factoryMapping[id] ?? []),
      ),
    [activeSystems, factoryMapping],
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

      {activeSystems.map((id, i) => (
        <SystemChip
          key={id}
          systemId={id}
          zoneIds={factoryMapping[id] ?? []}
          index={i}
          chipOpacity={chipOpacity * opacity}
        />
      ))}
    </group>
  );
}
