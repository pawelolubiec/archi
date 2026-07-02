import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import { Earth } from '../objects/Earth';
import { LocationMarker } from '../objects/LocationMarker';
import { DataFlowArc } from '../objects/DataFlowArc';
import { locations } from '../../data/locations';
import { dataFlows } from '../../data/dataFlows';
import { useStore } from '../../store/useStore';

export function GlobeScene() {
  const groupRef = useRef<Group>(null);
  const chapter = useStore((s) => s.current());

  // globe stays static — keep it locked at the base orientation the
  // per-chapter camera framing assumes (y=0), no auto-rotation
  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    let y = g.rotation.y % (Math.PI * 2);
    if (y > Math.PI) y -= Math.PI * 2;
    if (y < -Math.PI) y += Math.PI * 2;
    g.rotation.y = MathUtils.damp(y, 0, 4, delta);
  });

  return (
    <group ref={groupRef}>
      <Earth />
      {locations.map((loc) => {
        if (!chapter.visibleLocations.includes(loc.id)) return null;
        return (
          <LocationMarker
            key={loc.id}
            location={loc}
            active={true}
            showLabel={!chapter.hideLocationLabels}
          />
        );
      })}
      {dataFlows.map((flow) => (
        <DataFlowArc
          key={flow.id}
          flow={flow}
          active={chapter.activeFlows.includes(flow.id)}
        />
      ))}
    </group>
  );
}
