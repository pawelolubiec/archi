import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { greatCircleCurve, sampleCurve } from '../../lib/geo';
import { GLOBE_RADIUS, BRAND } from '../../data/brand';
import type { DataFlow } from '../../data/types';
import { locationById } from '../../data/locations';
import { PulsingDataDot } from './PulsingDataDot';

interface Props {
  flow: DataFlow;
  active: boolean;
}

export function DataFlowArc({ flow, active }: Props) {
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

  const points = useMemo(() => sampleCurve(curve, 80), [curve]);
  const color = flow.type === 'orders' ? BRAND.green : BRAND.sea;

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={active ? 1.6 : 0.8}
        transparent
        opacity={active ? 0.55 : 0.12}
      />
      {active && (
        <>
          <PulsingDataDot curve={curve} color={color} offset={0} speed={0.22} />
          <PulsingDataDot curve={curve} color={color} offset={0.4} speed={0.22} />
          <PulsingDataDot curve={curve} color={color} offset={0.75} speed={0.22} />
        </>
      )}
    </group>
  );
}
