import type { Chapter } from './types';

/**
 * Chapters = the single source of truth for the narrative. Each one drives the
 * camera, point visibility, active flows, modals, and the KPI panel.
 */
export const chapters: Chapter[] = [
  {
    id: 'cosmos',
    index: 0,
    scene: 'globe',
    eyebrow: 'Ecosystem',
    title: 'A connected digital ecosystem',
    description:
      'Milarex as a single model: factory, sales offices, customers, and data tied together in one coherent architecture.',
    businessMessage:
      'One group, one data model — not a collection of disconnected systems.',
    cameraPosition: [6.4, 7.7, -0.9],
    cameraTarget: [0, 0, 0],
    visibleLocations: [
      'factory_poland',
      'office_germany',
      'office_italy',
      'office_france',
      'office_usa',
      'office_japan',
      'office_australia',
    ],
    activeFlows: [
      'de_to_factory',
      'fr_to_factory',
      'it_to_factory',
      'us_to_factory',
      'jp_to_factory',
      'au_to_factory',
    ],
    activeSystems: [],
    kpiPanel: false,
    hideLocationLabels: true,
  },
  {
    id: 'pain',
    index: 1,
    scene: 'pain',
    eyebrow: 'Current state',
    title: 'Why now',
    description:
      "Today the group's data lives in silos: reports assembled by hand, numbers reconciled between systems, decisions made with delay.",
    businessMessage:
      'The cost of inaction grows every quarter — in margin, working capital, and compliance risk.',
    cameraPosition: [3.7, 4.6, -1.0],
    cameraTarget: [1.24, 1.53, -0.33],
    visibleLocations: [],
    activeFlows: [],
    activeSystems: [],
    kpiPanel: false,
  },
  {
    id: 'germany',
    index: 2,
    scene: 'globe',
    eyebrow: 'Sales',
    title: 'Sales offices · MiFo',
    description:
      'Zooming into the sales offices. MiFo — Milarex Forecasting, Ordering & Profitability — manages customers, demand forecast, orders, quotes, and margin visibility.',
    businessMessage:
      'Sales starts the data chain — from the very first customer contact.',
    cameraPosition: [3.03, 3.96, -0.43],
    cameraTarget: [1.21, 1.58, -0.17],
    visibleLocations: [
      'factory_poland',
      'office_germany',
      'office_italy',
      'office_france',
      'office_usa',
      'office_japan',
      'office_australia',
    ],
    activeFlows: [
      'de_to_factory',
      'fr_to_factory',
      'it_to_factory',
      'us_to_factory',
      'jp_to_factory',
      'au_to_factory',
    ],
    labeledLocations: [],
    activeSystems: ['mifo'],
    modal: 'mifo',
    kpiPanel: false,
  },
  {
    id: 'germany-factory',
    index: 3,
    scene: 'globe',
    eyebrow: 'Integration',
    title: 'Sales feeds production',
    description:
      'Orders, forecast, prices, complaints, and customer requirements flow from MiFo into the operational core in Poland.',
    businessMessage:
      "Sales isn't a silo — its data drives planning and operational decisions.",
    cameraPosition: [2.72, 3.99, -0.84],
    cameraTarget: [1.11, 1.63, -0.34],
    visibleLocations: ['office_germany', 'factory_poland'],
    activeFlows: ['de_to_factory'],
    activeSystems: ['mifo', 'aps', 'workday_erp'],
    modal: 'mifo',
    kpiPanel: false,
  },
  {
    id: 'poland',
    index: 4,
    scene: 'factory',
    eyebrow: 'Operations',
    title: 'The factory in Poland',
    description:
      'Descending from orbit into the operational core. Zones: Receiving, Filleting, Slicing D/S, MAP, Freezing, Output, and the Office / Lab.',
    businessMessage:
      'This is where value is created — and where every operational system meets.',
    cameraPosition: [6.5, 7, 9],
    cameraTarget: [0, 0.4, 0],
    visibleLocations: ['factory_poland'],
    activeFlows: [],
    activeSystems: ['pts', 'wms', 'qms_lims'],
    kpiPanel: false,
  },
  {
    id: 'factory-systems',
    index: 5,
    scene: 'factory',
    eyebrow: 'Systems',
    title: "The factory's internal systems",
    description:
      'ERP, PTS, PID, MiFo, WMS, and QMS/LIMS as the digital blueprint of operations. Click a system to see details.',
    businessMessage:
      'Every area has a specialized system — not one monolith for everything.',
    cameraPosition: [4.5, 8.5, 6.5],
    cameraTarget: [0, 0.4, 0],
    visibleLocations: ['factory_poland'],
    activeFlows: [],
    activeSystems: ['workday_erp', 'pts', 'pid', 'mifo', 'wms', 'qms_lims'],
    kpiPanel: false,
  },
  {
    id: 'architecture',
    index: 6,
    scene: 'architecture',
    eyebrow: 'Architecture',
    title: 'Hybrid architecture',
    description:
      'ERP remains a stable financial core. Operational advantage is built in specialized systems and the AI layer.',
    businessMessage:
      "We're not buying a single ERP monolith. We're building a flexible ecosystem around a financial core.",
    cameraPosition: [0, 1, 9],
    cameraTarget: [0, 0, 0],
    visibleLocations: [],
    activeFlows: [],
    activeSystems: [
      'mifo',
      'workday_erp',
      'pts',
      'pid',
      'wms',
      'qms_lims',
      'aps',
      'data_platform',
      'gone_ai',
    ],
    kpiPanel: false,
  },
  {
    id: 'business-impact',
    index: 7,
    scene: 'kpi',
    eyebrow: 'Impact',
    title: 'Business impact',
    description:
      'Every KPI has an owner and is driven by specific systems. Technology meets the financial result.',
    businessMessage:
      'Yield = PTS + MiFo + PID + Data. Forecast = MiFo + APS + Data + AI. Working capital = WMS + ERP + APS.',
    cameraPosition: [0, 1, 9.5],
    cameraTarget: [0, 0, 0],
    visibleLocations: [],
    activeFlows: [],
    activeSystems: [],
    kpiPanel: true,
  },
  {
    id: 'governance',
    index: 8,
    scene: 'scenario',
    eyebrow: 'Governance',
    title: 'One accountability model',
    description:
      'One methodology for evaluating initiatives, one portfolio, one KPI owner, one business case, one stage-gate, one board dashboard.',
    businessMessage:
      'Every initiative is evaluated the same way — cost, ROI, KPI, risk, board decision.',
    cameraPosition: [0, 1, 9.5],
    cameraTarget: [0, 0, 0],
    visibleLocations: [],
    activeFlows: [],
    activeSystems: [],
    kpiPanel: false,
  },
  {
    id: 'simulation',
    index: 9,
    scene: 'scenario',
    eyebrow: 'Simulation',
    title: 'Decision simulation',
    description:
      'Choose an investment scenario and see the impact on architecture, KPIs, cost, ROI, risks, and implementation sequence.',
    businessMessage:
      'A board decision based on data — not on gut feeling.',
    cameraPosition: [0, 1, 9.5],
    cameraTarget: [0, 0, 0],
    visibleLocations: [],
    activeFlows: [],
    activeSystems: [],
    kpiPanel: true,
  },
  {
    id: 'roadmap',
    index: 10,
    scene: 'roadmap',
    eyebrow: 'Roadmap',
    title: 'Roadmap 2026–2030',
    description:
      'From data foundations to autonomous decision support. Business value accumulates with every phase.',
    businessMessage:
      'A sequence, not a big bang. Value accumulates year after year.',
    cameraPosition: [0, 1, 9.5],
    cameraTarget: [0, 0, 0],
    visibleLocations: [],
    activeFlows: [],
    activeSystems: [],
    kpiPanel: false,
  },
  {
    id: 'decisions',
    index: 11,
    scene: 'decisions',
    eyebrow: 'Decisions',
    title: 'What we need from the board',
    description:
      'Three decisions that open the transformation program. Each with a clear scope, consequence, and deadline.',
    businessMessage:
      'Approval today = foundations start in Q3 2026 and compliance deadlines are met.',
    cameraPosition: [0, 1, 9.5],
    cameraTarget: [0, 0, 0],
    visibleLocations: [],
    activeFlows: [],
    activeSystems: [],
    kpiPanel: false,
  },
];

export const TOTAL_CHAPTERS = chapters.length;
