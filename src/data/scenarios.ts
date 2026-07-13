import type { Scenario, RoadmapTrack } from './types';

export const scenarios: Scenario[] = [
  {
    id: 'workday',
    name: 'ERP implementation (financial core)',
    summary:
      'Replacing the financial core. Stabilizing the ledger, closings, and inventory valuation — without moving operations into the ERP.',
    horizon: '2026–2027',
    capexK: 1800,
    opexAnnualK: 350,
    ebitdaAnnualK: 400,
    paybackMonths: 54,
    risks: ['Scope creep', 'Finance adoption', 'Integration with PTS/WMS'],
    dependencies: ['data_platform'],
    sequence: ['Data Platform', 'ERP Financial Core', 'WMS/PTS integrations'],
    kpiDeltas: { ebitda: 3, inventory_days: -2 },
    activatesSystems: ['workday_erp'],
  },
  {
    id: 'wms',
    name: 'WMS implementation',
    summary:
      'Digitizing the warehouse: locations, FEFO/FIFO, and integration with production. Freeing up working capital.',
    horizon: '2027',
    capexK: 450,
    opexAnnualK: 60,
    ebitdaAnnualK: 520,
    paybackMonths: 14,
    risks: ['Location mapping', 'Operator training'],
    dependencies: ['workday_erp', 'pts'],
    sequence: ['WMS core', 'PTS integration', 'ERP integration'],
    kpiDeltas: { inventory_days: -6, lead_time: -8, service_level: 2 },
    activatesSystems: ['wms'],
  },
  {
    id: 'pts',
    name: 'PTS enhancement',
    summary:
      'Deepening production tracking, traceability, and OEE — a direct lever for yield and cost/kg.',
    horizon: '2026–2027',
    capexK: 350,
    opexAnnualK: 40,
    ebitdaAnnualK: 700,
    paybackMonths: 8,
    risks: ['Line coverage', 'Operator data quality'],
    dependencies: ['pid'],
    sequence: ['PTS scope+', 'PID sync', 'MiFo feed'],
    kpiDeltas: { yield: 2, oee: 5, cost_per_kg: -3 },
    activatesSystems: ['pts'],
  },
  {
    id: 'pid',
    name: 'PID enhancement',
    summary:
      'Consistent product data: recipes, BOM, allergens, and versioning as the foundation for quality and yield.',
    horizon: '2026–2028',
    capexK: 300,
    opexAnnualK: 35,
    ebitdaAnnualK: 310,
    paybackMonths: 16,
    risks: ['Recipe data cleanliness', 'Data-ownership governance'],
    dependencies: ['pts'],
    sequence: ['PID model', 'PTS/QMS sync', 'Customer specifications'],
    kpiDeltas: { quality: 6, yield: 1 },
    activatesSystems: ['pid', 'qms_lims'],
  },
  {
    id: 'mifo_ai',
    name: 'MiFo + AI',
    summary:
      'MiFo with AI analytics: demand and margin prediction, throughput optimization, and cost/kg reduction.',
    horizon: '2028–2029',
    capexK: 900,
    opexAnnualK: 150,
    ebitdaAnnualK: 950,
    paybackMonths: 18,
    risks: ['Data maturity', 'Trust in models', 'Team capabilities'],
    dependencies: ['pts', 'data_platform'],
    sequence: ['Data Platform', 'MiFo', 'AI Agents'],
    kpiDeltas: { yield: 2, cost_per_kg: -4, co2_per_kg: -6, oee: 3 },
    activatesSystems: ['mifo', 'data_platform', 'gone_ai'],
  },
  {
    id: 'transformacja_2030',
    name: 'Full transformation 2030',
    summary:
      'A complete hybrid architecture: ERP as the financial core + a specialized ecosystem + AI/Digital Twin.',
    horizon: '2026–2030',
    capexK: 4200,
    opexAnnualK: 650,
    ebitdaAnnualK: 2800,
    paybackMonths: 30,
    risks: ['Pace of change', 'Organizational capacity', 'Sequencing'],
    dependencies: [],
    sequence: [
      'Data foundations',
      'MiFo/WMS/PTS/PID',
      'MiFo/APS/QMS',
      'AI Agents',
      'Digital Twin',
    ],
    kpiDeltas: {
      ebitda: 18,
      cost_per_kg: -8,
      yield: 5,
      oee: 11,
      inventory_days: -9,
      lead_time: -22,
      forecast_accuracy: 18,
      service_level: 4,
      quality: 12,
      co2_per_kg: -12,
    },
    activatesSystems: [
      'workday_erp',
      'wms',
      'pts',
      'pid',
      'mifo',
      'aps',
      'qms_lims',
      'data_platform',
      'gone_ai',
    ],
  },
];

export const scenarioById = Object.fromEntries(
  scenarios.map((s) => [s.id, s]),
) as Record<string, Scenario>;

/**
 * Roadmap as parallel tracks. Spans are fractional years on a 2026–2031 axis.
 * `standard` is the sequential 2026–2030 pace; `accelerated` overlaps tracks
 * and lands the 2030 scope by end-2028.
 */
export const ROADMAP_TRACKS: RoadmapTrack[] = [
  {
    theme: 'Foundations',
    items: ['Data foundations', 'Integrations', 'ERP scope & selection'],
    standard: { start: 2026.0, end: 2027.0 },
    accelerated: { start: 2026.0, end: 2026.7 },
  },
  {
    theme: 'Operational core',
    items: ['MiFo', 'WMS', 'PTS', 'PID'],
    standard: { start: 2026.8, end: 2028.0 },
    accelerated: { start: 2026.3, end: 2027.5 },
  },
  {
    theme: 'Intelligence',
    items: ['MiFo', 'APS', 'QMS / LIMS'],
    standard: { start: 2028.0, end: 2029.0 },
    accelerated: { start: 2027.0, end: 2028.1 },
  },
  {
    theme: 'Automation',
    items: ['AI Agents', 'Automation', 'Predictive analytics'],
    standard: { start: 2029.0, end: 2030.0 },
    accelerated: { start: 2027.6, end: 2028.7 },
  },
  {
    theme: 'Autonomy',
    items: ['Digital Twin', 'Autonomous decision support'],
    standard: { start: 2030.0, end: 2030.9 },
    accelerated: { start: 2028.2, end: 2029.0 },
  },
];

/** Why the accelerated pace is credible — shown under the track chart. */
export const ROADMAP_ENABLERS = [
  'PTS · PID · MiFo already live — half the operational core exists',
  'Data platform first — later phases start on clean data',
  'AI-assisted delivery & integration',
  'Fixed-scope ERP (finance only)',
  'Parallel tracks with stage-gate governance',
];
