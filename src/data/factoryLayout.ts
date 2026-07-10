/** Factory zone ids — must match BUILDINGS ids in FactoryScene. */
export const FACTORY_ZONES = [
  { id: 'office', label: 'Office / Lab' },
  { id: 'receiving', label: 'Receiving' },
  { id: 'filleting', label: 'Filleting' },
  { id: 'slicing_d', label: 'Slicing D' },
  { id: 'map', label: 'MAP' },
  { id: 'freezing', label: 'Freezing' },
  { id: 'slicing_s', label: 'Slicing S' },
  { id: 'output', label: 'Output' },
] as const;

export type FactoryZoneId = (typeof FACTORY_ZONES)[number]['id'];

/** Zone floor coordinates [x, z] — shared by the 3D hall and the tour camera. */
export const ZONE_COORDS: Record<FactoryZoneId, [number, number]> = {
  office: [-1.3, -3.4],
  receiving: [-0.1, -2.1],
  filleting: [-0.1, -0.2],
  slicing_d: [-2.9, -0.2],
  map: [3.0, -0.2],
  freezing: [0.5, 2.0],
  slicing_s: [-2.1, 2.0],
  output: [-3.2, 3.4],
};

export type FactoryMapping = Record<string, FactoryZoneId[]>;

/** Default system → zone mapping (one system can map to many zones). */
export const DEFAULT_SYSTEM_ZONES: FactoryMapping = {
  pts: ['filleting'],
  mifo: ['filleting'],
  pid: ['map'],
  workday_erp: ['office'],
  wms: ['freezing'],
  qms_lims: ['office'],
};

export const FACTORY_MAPPABLE_SYSTEMS = Object.keys(
  DEFAULT_SYSTEM_ZONES,
) as (keyof typeof DEFAULT_SYSTEM_ZONES)[];


export function cloneDefaultMapping(): FactoryMapping {
  return Object.fromEntries(
    Object.entries(DEFAULT_SYSTEM_ZONES).map(([id, zones]) => [id, [...zones]]),
  );
}
