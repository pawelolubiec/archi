import { useMemo, useState } from 'react';
import { CatmullRomCurve3, Vector3 } from 'three';
import { Html, Line, Edges } from '@react-three/drei';
import { BRAND, ACCENT_HEX } from '../../data/brand';
import { systemById } from '../../data/systems';
import { useStore } from '../../store/useStore';
import { PulsingDataDot } from '../objects/PulsingDataDot';

/* ── hall configuration ────────────────────────────────────────────── */

interface Building {
  id: string;
  label: string;
  pos: [number, number]; // x, z
  size: [number, number, number]; // w, h, d
  accent?: string;
}

const BUILDINGS: Building[] = [
  // standalone admin building — also houses the QC laboratory
  { id: 'office', label: 'Office / Lab', pos: [-1.3, -3.4], size: [2.4, 0.75, 0.9], accent: BRAND.gold },
  // main processing hall, entered through receiving at the back
  { id: 'receiving', label: 'Receiving', pos: [-0.1, -2.1], size: [4.4, 0.55, 0.9] },
  { id: 'filleting', label: 'Filleting', pos: [-0.1, -0.2], size: [4.4, 1.2, 2.2], accent: BRAND.green },
  { id: 'slicing_d', label: 'Slicing D', pos: [-2.9, -0.2], size: [1.6, 0.85, 1.8], accent: BRAND.sea },
  { id: 'map', label: 'MAP', pos: [3.0, -0.2], size: [1.9, 0.85, 2.0], accent: BRAND.sea },
  { id: 'freezing', label: 'Freezing', pos: [0.5, 2.0], size: [2.6, 1.0, 1.4], accent: BRAND.sea },
  { id: 'slicing_s', label: 'Slicing S', pos: [-2.1, 2.0], size: [1.7, 0.85, 1.6] },
  { id: 'output', label: 'Output', pos: [-3.2, 3.4], size: [1.4, 0.6, 1.0] },
];

const buildingById = Object.fromEntries(BUILDINGS.map((b) => [b.id, b]));

/** system → building */
const SYSTEM_ZONE: Record<string, string> = {
  pts: 'filleting',
  mifo: 'filleting',
  pid: 'map',
  workday_erp: 'office',
  wms: 'freezing',
  qms_lims: 'office',
};

/* ── single building ───────────────────────────────────────────── */

function BuildingMesh({ b, highlight }: { b: Building; highlight: boolean }) {
  const [w, h, d] = b.size;
  const accent = b.accent ?? BRAND.sea;

  return (
    <group position={[b.pos[0], 0, b.pos[1]]}>
      {/* volume */}
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

      {/* roof skylight for large halls */}
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

      {/* light strip at the base */}
      <mesh position={[0, 0.025, d / 2 + 0.03]}>
        <boxGeometry args={[w * 0.92, 0.05, 0.05]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>

      {/* zone label */}
      <Html position={[0, h + 0.42, 0]} center distanceFactor={11}>
        <span className="pointer-events-none whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.24em] text-mist">
          {b.label}
        </span>
      </Html>
    </group>
  );
}

/* ── system chip above the building ──────────────────────────────────── */

function SystemChip({ systemId, index }: { systemId: string; index: number }) {
  const sys = systemById[systemId];
  const zone = buildingById[SYSTEM_ZONE[systemId]];
  const openApp = useStore((s) => s.openApp);
  const [hover, setHover] = useState(false);
  if (!zone) return null;

  const accent = ACCENT_HEX[sys.accent];
  const baseY = zone.size[1];
  // systems above the same building — spread them out
  const sameZone = Object.entries(SYSTEM_ZONE).filter(([, z]) => z === SYSTEM_ZONE[systemId]);
  const slot = sameZone.findIndex(([id]) => id === systemId);
  const offsetX = sameZone.length > 1 ? (slot - 0.5) * 1.4 : 0;

  const top = new Vector3(zone.pos[0] + offsetX, baseY + 1.15 + (index % 2) * 0.22, zone.pos[1]);
  const anchor = new Vector3(zone.pos[0] + offsetX * 0.4, baseY + 0.05, zone.pos[1]);

  return (
    <group>
      <Line
        points={[top, anchor]}
        color={accent}
        lineWidth={1}
        transparent
        opacity={hover ? 0.85 : 0.4}
        dashed
        dashSize={0.09}
        gapSize={0.06}
      />
      <Html position={[top.x, top.y, top.z]} center distanceFactor={9}>
        <button
          onClick={() => openApp(systemId)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="group rounded-xl border bg-ink/85 px-3.5 py-2 text-left shadow-panel backdrop-blur-sm transition-transform hover:scale-105"
          style={{
            borderColor: hover ? accent : `${accent}55`,
            boxShadow: hover ? `0 0 24px -6px ${accent}` : undefined,
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

export function FactoryScene() {
  const chapter = useStore((s) => s.current());

  const activeSystems = useMemo(
    () => Object.keys(SYSTEM_ZONE).filter((id) => chapter.activeSystems.includes(id)),
    [chapter.activeSystems],
  );

  const highlightZones = useMemo(
    () => new Set(activeSystems.map((id) => SYSTEM_ZONE[id])),
    [activeSystems],
  );

  // main process line: receiving → filleting → MAP → freezing → output
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
  const flowPoints = useMemo(() => flowCurve.getPoints(120), [flowCurve]);

  // the two slicing lines feeding into the main hall
  const slicingCurve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-2.1, 0.14, 1.1),
        new Vector3(-2.5, 0.14, 0.4),
        new Vector3(-2.0, 0.14, 0.1),
      ]),
    [],
  );
  const slicingPoints = useMemo(() => slicingCurve.getPoints(50), [slicingCurve]);

  return (
    <group>
      {/* factory yard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[16, 11]} />
        <meshStandardMaterial
          color={BRAND.navyDeep}
          emissive={BRAND.navy}
          emissiveIntensity={0.12}
          roughness={1}
        />
      </mesh>
      <gridHelper args={[16, 32, BRAND.navy, BRAND.navy]} position={[0, 0, 0]} />

      {/* buildings */}
      {BUILDINGS.map((b) => (
        <BuildingMesh key={b.id} b={b} highlight={highlightZones.has(b.id)} />
      ))}

      {/* material flow */}
      <Line points={flowPoints} color={BRAND.green} lineWidth={1.8} transparent opacity={0.5} />
      <PulsingDataDot curve={flowCurve} color={BRAND.green} speed={0.1} offset={0} size={0.05} />
      <PulsingDataDot curve={flowCurve} color={BRAND.green} speed={0.1} offset={0.33} size={0.05} />
      <PulsingDataDot curve={flowCurve} color={BRAND.green} speed={0.1} offset={0.66} size={0.05} />

      <Line points={slicingPoints} color={BRAND.sea} lineWidth={1.2} transparent opacity={0.4} />
      <PulsingDataDot curve={slicingCurve} color={BRAND.sea} speed={0.14} offset={0.2} size={0.04} />

      {/* system chips */}
      {activeSystems.map((id, i) => (
        <SystemChip key={id} systemId={id} index={i} />
      ))}
    </group>
  );
}
