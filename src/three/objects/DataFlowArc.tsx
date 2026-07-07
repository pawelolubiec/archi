import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { greatCircleCurve, sampleCurve } from '../../lib/geo';
import { GLOBE_RADIUS, BRAND } from '../../data/brand';
import type { DataFlow } from '../../data/types';
import { locationById } from '../../data/locations';
import { PulsingDataDot } from './PulsingDataDot';
import { easeOutCubic } from '../../lib/easing';

interface Props {
  flow: DataFlow;
  active: boolean;
  drawDelay?: number;
  opacity?: number;
  subdued?: boolean;
}

const DRAW_DURATION = 0.8;

export function DataFlowArc({
  flow,
  active,
  drawDelay = 0,
  opacity = 1,
  subdued = false,
}: Props) {
  const from = locationById[flow.from];
  const to = locationById[flow.to];

  const curve = useMemo(
    () =>
      greatCircleCurve(
        from.lat,
        from.lng,
        to.lat,
        to.lng,
        GLOBE_RADIUS * 1.01,
        flow.lift ?? 0.3,
      ),
    [from, to, flow.lift],
  );

  const allPoints = useMemo(() => sampleCurve(curve, 80), [curve]);
  const color = flow.type === 'orders' ? BRAND.green : BRAND.sea;

  const wasActive = useRef(active);
  const drawStart = useRef<number | null>(null);
  const [drawProgress, setDrawProgress] = useState(active ? 1 : 0);

  useEffect(() => {
    if (active && !wasActive.current) {
      drawStart.current = null;
      setDrawProgress(0);
    }
    if (!active) {
      drawStart.current = null;
      setDrawProgress(0);
    }
    wasActive.current = active;
  }, [active]);

  useFrame((state) => {
    if (!active) return;
    const now = state.clock.elapsedTime;
    if (drawStart.current === null) {
      drawStart.current = now + drawDelay;
    }
    const elapsed = now - drawStart.current;
    if (elapsed < 0) return;
    const p = Math.min(1, elapsed / DRAW_DURATION);
    setDrawProgress(easeOutCubic(p));
  });

  const visibleCount = Math.max(2, Math.floor(drawProgress * allPoints.length));
  const points = allPoints.slice(0, visibleCount);
  const lineOpacity = (subdued ? 0.25 : active ? 0.55 : 0.12) * opacity * drawProgress;

  return (
    <group visible={opacity > 0.01}>
      <Line
        points={points}
        color={color}
        lineWidth={active ? 1.6 : 0.8}
        transparent
        opacity={lineOpacity}
      />
      {active && drawProgress >= 0.85 && (
        <>
          <PulsingDataDot
            curve={curve}
            color={color}
            offset={0}
            speed={subdued ? 0.14 : 0.22}
            opacity={opacity}
          />
          <PulsingDataDot
            curve={curve}
            color={color}
            offset={0.4}
            speed={subdued ? 0.14 : 0.22}
            opacity={opacity}
          />
          {!subdued && (
            <PulsingDataDot
              curve={curve}
              color={color}
              offset={0.75}
              speed={0.22}
              opacity={opacity}
            />
          )}
        </>
      )}
    </group>
  );
}
