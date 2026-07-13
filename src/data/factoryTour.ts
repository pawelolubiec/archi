import type { Vector3Tuple } from 'three';
import { ZONE_COORDS, type FactoryMapping, type FactoryZoneId } from './factoryLayout';

/**
 * Guided run-through of the factory systems on slide 05, ordered along the
 * value chain: demand in → production → product data → warehouse → quality →
 * financial core.
 */
export const FACTORY_TOUR_ORDER = [
  'mifo',
  'pts',
  'pid',
  'wms',
  'qms_lims',
  'workday_erp',
] as const;

/** One line per system: how it supports the organisation (not what it is). */
export const TOUR_NARRATIVE: Record<string, string> = {
  mifo: 'Demand, orders and margin intelligence arrive from the sales offices — the factory knows what to make and what it will earn.',
  pts: 'Every kilogram on the line is tracked live — yield, OEE and full traceability are recorded where they happen.',
  pid: 'One source of truth for recipes, specs and allergens — production never runs on an outdated specification.',
  wms: 'FEFO-managed locations connect the warehouse to production — this is where inventory days come down.',
  qms_lims: 'Quality checks and lab results are captured at the source — compliance becomes a by-product of the process, not paperwork.',
  workday_erp: 'The lean financial core closes the loop — ledger, valuation, closing. Deliberately not an operational monolith.',
};

export interface CameraFocus {
  position: Vector3Tuple;
  target: Vector3Tuple;
}

/** 3/4 fly-to view centred on a set of factory zones. */
export function zoneCameraFor(zoneIds: FactoryZoneId[]): CameraFocus | null {
  const coords = zoneIds.map((z) => ZONE_COORDS[z]).filter(Boolean);
  if (!coords.length) return null;

  const cx = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const cz = coords.reduce((s, c) => s + c[1], 0) / coords.length;

  return {
    position: [cx + 5.2, 5.0, cz + 6.0],
    target: [cx, 0.5, cz],
  };
}

/** 3/4 fly-to view centred on the system's mapped zones. */
export function tourCameraFor(
  systemId: string,
  mapping: FactoryMapping,
): CameraFocus | null {
  return zoneCameraFor((mapping[systemId] ?? []) as FactoryZoneId[]);
}
