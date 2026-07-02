import type { Vector3Tuple } from 'three';

export type LocationType = 'factory' | 'office' | 'customers';

export interface Location {
  id: string;
  name: string;
  country: string;
  type: LocationType;
  lat: number;
  lng: number;
  description: string;
  connectedSystems: string[];
  /** short label for the on-globe pin (falls back to `name` if omitted) */
  pinLabel?: string;
  /** vertical offset for the pin label, to de-clutter tightly clustered markers */
  labelOffsetY?: number;
}

export type SystemCategory =
  | 'crm'
  | 'erp'
  | 'production'
  | 'product-data'
  | 'intelligence'
  | 'warehouse'
  | 'quality'
  | 'planning'
  | 'data'
  | 'ai';

export type SystemStatus = 'live' | 'planned' | 'candidate' | 'core';

export interface SystemDef {
  id: string;
  name: string;
  short: string;
  category: SystemCategory;
  owner: string;
  description: string;
  responsibilities: string[];
  connectedTo: string[];
  businessKPIs: string[];
  status: SystemStatus;
  accent: 'sea' | 'green' | 'gold';
}

export interface DataFlow {
  id: string;
  from: string; // location id
  to: string; // location id
  type: string;
  description: string;
  frequency: string;
  systems: string[];
  kpisAffected: string[];
  /** great-circle lift factor for the arc bulge */
  lift?: number;
}

export interface KPI {
  id: string;
  name: string;
  baseline: number;
  target: number;
  unit: string;
  /** true = higher is better, false = lower is better */
  higherBetter: boolean;
  affectedBy: string[]; // system ids
  businessMeaning: string;
}

export interface Scenario {
  id: string;
  name: string;
  summary: string;
  horizon: string;
  /** financial estimates (EUR thousands) — to be validated with Controlling */
  capexK: number;
  opexAnnualK: number;
  ebitdaAnnualK: number;
  paybackMonths: number;
  risks: string[];
  dependencies: string[];
  sequence: string[];
  /** delta applied to KPI (in KPI units, signed) keyed by kpi id */
  kpiDeltas: Record<string, number>;
  activatesSystems: string[];
}

export type SceneKey =
  | 'globe'
  | 'pain'
  | 'factory'
  | 'architecture'
  | 'kpi'
  | 'scenario'
  | 'roadmap'
  | 'decisions';

export interface Chapter {
  id: string;
  index: number;
  scene: SceneKey;
  eyebrow: string;
  title: string;
  description: string;
  businessMessage: string;
  /** camera for 3D scenes: [x,y,z] position and [x,y,z] target */
  cameraPosition: Vector3Tuple;
  cameraTarget: Vector3Tuple;
  visibleLocations: string[];
  activeFlows: string[];
  activeSystems: string[];
  modal?: string; // system id
  kpiPanel: boolean;
  /** hide the floating name pill on location markers (dots stay visible) */
  hideLocationLabels?: boolean;
}

export interface RoadmapPhase {
  year: string;
  theme: string;
  items: string[];
  valueIndex: number; // 0..1 cumulative business value
}
