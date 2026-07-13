import type { FactoryZoneId } from './factoryLayout';

/**
 * "Go inside the factory" demo — follow one batch of salmon through the hall
 * and see where the digital architecture creates impact. Entered via a button
 * on the factory slide; steps drive the camera, zone highlight, and chip focus.
 */
export interface FactoryDemoStep {
  id: string;
  kicker: string;
  title: string;
  narrative: string;
  /** zones to highlight & fly to; empty = overview */
  zoneIds: FactoryZoneId[];
  /** system chips kept bright during this step */
  systems: string[];
  /** KPI shown as baseline → target under the narrative */
  kpiId?: string;
}

export const FACTORY_DEMO_STEPS: FactoryDemoStep[] = [
  {
    id: 'receiving',
    kicker: 'Receiving',
    title: 'The batch arrives — and is known',
    narrative:
      '3.2 tonnes of salmon come through the gate. Batch, grade and weight are captured once in PTS — utilization starts with knowing exactly what came in.',
    zoneIds: ['receiving'],
    systems: ['pts', 'wms'],
  },
  {
    id: 'filleting',
    kicker: 'Filleting',
    title: 'Yield measured while it happens',
    narrative:
      'Every fillet weighed against the raw material, per line and per shift. Losses show up in minutes — while the line can still react, not at month-end.',
    zoneIds: ['filleting'],
    systems: ['pts', 'mifo'],
    kpiId: 'yield',
  },
  {
    id: 'slicing_map',
    kicker: 'Slicing & MAP',
    title: 'The right spec, zero guesswork',
    narrative:
      'PID feeds recipes, target weights and allergens straight to the lines. Giveaway shrinks and every pack matches the customer specification.',
    zoneIds: ['slicing_d', 'slicing_s', 'map'],
    systems: ['pid', 'qms_lims'],
    kpiId: 'quality',
  },
  {
    id: 'freezing_dispatch',
    kicker: 'Freezing & dispatch',
    title: 'Working capital leaves the freezer',
    narrative:
      'WMS assigns FEFO locations the moment product is packed; dispatch picks against the real plan. Fewer days in the freezer, fewer surprises at loading.',
    zoneIds: ['freezing', 'output'],
    systems: ['wms'],
    kpiId: 'inventory_days',
  },
  {
    id: 'office_lab',
    kicker: 'Office / Lab',
    title: 'One event stream, quality and money',
    narrative:
      'QMS releases the batch on live lab results; ERP values it from the same events. No re-keying between the hall and the ledger.',
    zoneIds: ['office'],
    systems: ['qms_lims', 'workday_erp'],
    kpiId: 'oee',
  },
  {
    id: 'impact',
    kicker: 'Impact',
    title: 'What the batch just proved',
    narrative:
      'One batch, five systems, zero manual handovers — this is the digital architecture at work on the factory floor.',
    zoneIds: [],
    systems: [],
  },
];

/** KPIs summarized on the final demo step. */
export const DEMO_IMPACT_KPI_IDS = ['yield', 'oee', 'cost_per_kg', 'inventory_days'];
