import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import { Earth } from '../objects/Earth';
import { LocationMarker } from '../objects/LocationMarker';
import { DataFlowArc } from '../objects/DataFlowArc';
import { locations } from '../../data/locations';
import { dataFlows } from '../../data/dataFlows';
import { useStore } from '../../store/useStore';

interface Props {
  opacity?: number;
  /** dimmed background mode for 2D chapters — slow rotation + ambient arcs */
  ambientMode?: boolean;
}

export function GlobeScene({ opacity = 1, ambientMode = false }: Props) {
  const groupRef = useRef<Group>(null);
  const chapter = useStore((s) => s.current());
  const isCosmos = chapter.id === 'cosmos';

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;

    if (isCosmos || ambientMode) {
      // slow auto-rotation in cosmos / 2D background chapters
      g.rotation.y += delta * (ambientMode ? 0.06 : 0.12);
      return;
    }

    // other globe chapters: damp back to base orientation
    let y = g.rotation.y % (Math.PI * 2);
    if (y > Math.PI) y -= Math.PI * 2;
    if (y < -Math.PI) y += Math.PI * 2;
    g.rotation.y = MathUtils.damp(y, 0, 4, delta);
  });

  const visibleLocations = ambientMode
    ? ['factory_poland', 'office_germany', 'office_france']
    : chapter.visibleLocations;

  const activeFlows = ambientMode
    ? ['de_to_factory', 'fr_to_factory']
    : chapter.activeFlows;

  return (
    <group ref={groupRef}>
      <group>
        <Earth opacity={opacity} />
        {locations.map((loc) => {
          if (!visibleLocations.includes(loc.id)) return null;
          const showLabel = ambientMode
            ? false
            : chapter.hideLocationLabels
              ? false
              : chapter.labeledLocations
                ? chapter.labeledLocations.includes(loc.id)
                : true;
          return (
            <LocationMarker
              key={loc.id}
              location={loc}
              active={true}
              showLabel={showLabel}
              opacity={opacity}
            />
          );
        })}
        {dataFlows.map((flow, i) => (
          <DataFlowArc
            key={flow.id}
            flow={flow}
            active={activeFlows.includes(flow.id)}
            drawDelay={ambientMode ? i * 0 : i * 0.12}
            opacity={opacity}
            subdued={ambientMode}
          />
        ))}
      </group>
    </group>
  );
}
