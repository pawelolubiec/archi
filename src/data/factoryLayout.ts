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

export const FACTORY_MAPPING_STORAGE_KEY = 'milarex.factoryMapping';

export function cloneDefaultMapping(): FactoryMapping {
  return Object.fromEntries(
    Object.entries(DEFAULT_SYSTEM_ZONES).map(([id, zones]) => [id, [...zones]]),
  );
}
