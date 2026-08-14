/** Initiative cost + roadmap rows for the Q4 2026 – Q4 2030 board slide. */

export type CostValue = number | 'internal' | null;

export type RoadmapPhaseKind = 'build' | 'run' | 'continuous';

/** Fractional calendar years on the 2026–2031 axis (e.g. 2026.75 = Q4 2026). */
export interface RoadmapPhase {
  kind: RoadmapPhaseKind;
  start: number;
  end: number;
}

export interface RoadmapInitiative {
  id: string;
  name: string;
  current: CostValue;
  transformation: CostValue;
  futureMaint: CostValue;
  phases: RoadmapPhase[];
}

export const ROADMAP_YEARS = [2026, 2027, 2028, 2029, 2030] as const;
export const ROADMAP_AXIS_START = 2026;
export const ROADMAP_AXIS_END = 2031;

export const ROADMAP_INITIATIVES: RoadmapInitiative[] = [
  {
    id: 'mdm',
    name: 'MDM Office - master data management',
    current: null,
    transformation: 'internal',
    futureMaint: 'internal',
    phases: [
      { kind: 'build', start: 2026.75, end: 2028.0 },
      { kind: 'run', start: 2028.0, end: 2031.0 },
    ],
  },
  {
    id: 'pts',
    name: 'PTS - Production Tracking System',
    current: 120,
    transformation: 116,
    futureMaint: 98,
    phases: [
      { kind: 'build', start: 2026.75, end: 2028.5 },
      { kind: 'run', start: 2028.5, end: 2031.0 },
    ],
  },
  {
    id: 'pid',
    name: 'PID - Product Information Database',
    current: 'internal',
    transformation: 'internal',
    futureMaint: 'internal',
    phases: [
      { kind: 'build', start: 2027.0, end: 2029.0 },
      { kind: 'run', start: 2029.0, end: 2031.0 },
    ],
  },
  {
    id: 'mifo',
    name: 'MiFo - Milarex Forecast',
    current: 'internal',
    transformation: 'internal',
    futureMaint: 'internal',
    phases: [
      { kind: 'build', start: 2027.0, end: 2029.0 },
      { kind: 'run', start: 2029.0, end: 2031.0 },
    ],
  },
  {
    id: 'erp',
    name: 'ERP — accounting, sales, procurement, warehouse',
    current: 206,
    transformation: 1312,
    futureMaint: 271,
    phases: [
      { kind: 'build', start: 2027.0, end: 2029.0 },
      { kind: 'run', start: 2029.0, end: 2031.0 },
    ],
  },
  {
    id: 'mct',
    name: 'MCT - Milarex Control Tower',
    current: null,
    transformation: 'internal',
    futureMaint: 'internal',
    phases: [{ kind: 'continuous', start: 2027.0, end: 2031.0 }],
  },
  {
    id: 'digital-twin',
    name: 'Digital Twin',
    current: null,
    transformation: 'internal',
    futureMaint: 'internal',
    phases: [{ kind: 'continuous', start: 2027.0, end: 2031.0 }],
  },
];

export const ROADMAP_TOTALS = {
  current: 326,
  transformation: 1428,
  futureMaint: 369,
  /** transformation + 4 × future maintenance */
  indicative5Year: 2904,
} as const;

export const ROADMAP_FOOTNOTES = [
  '* ERP current cost covers Comarch Altum only; Ultco systems excluded. Future maintenance is based on IFS cloud (300 licences).',
  '** ERP transformation is an estimate — the average of four submitted offers (IFS 1,560 · InfoConsulting 1,357 · SAP 1,638 · Infor 693), approx. EUR 1,312k net. PLN converted at NBP 4.3010.',
  '"Internal" = delivered with internal labour;',
] as const;

export const ROADMAP_LEGEND: Array<{ kind: RoadmapPhaseKind; label: string }> = [
  { kind: 'build', label: 'Build / transformation phase' },
  { kind: 'run', label: 'Run / maintenance phase' },
  { kind: 'continuous', label: 'Continuous development' },
];

export const ROADMAP_PHASE_COLORS: Record<RoadmapPhaseKind, string> = {
  build: '#D6BF91',
  run: '#E8DFC8',
  continuous: '#8FA3B8',
};
