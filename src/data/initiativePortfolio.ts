/** Board-readable initiative clusters — replace with Excel import when available. */
export interface InitiativeRow {
  id: string;
  initiative: string;
  cluster: string;
  horizon: string;
  capexK: number;
  ebitdaK: number;
  decision?: string;
}

export interface InitiativeCluster {
  id: string;
  label: string;
  summary: string;
  highlight?: boolean;
}

export const INITIATIVE_CLUSTERS: InitiativeCluster[] = [
  {
    id: 'foundations',
    label: 'Foundations',
    summary: 'Data platform, integrations, ERP scope & selection',
    highlight: true,
  },
  {
    id: 'operations',
    label: 'Operational core',
    summary: 'MiFo, WMS, PTS, PID — where margin is created',
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    summary: 'APS, QMS/LIMS, demand & quality analytics',
  },
  {
    id: 'automation',
    label: 'Automation',
    summary: 'AI agents, predictive analytics, decision support',
  },
];

export const INITIATIVE_ROWS: InitiativeRow[] = [
  {
    id: 'data',
    initiative: 'Data platform & integrations',
    cluster: 'Foundations',
    horizon: '2026–2027',
    capexK: 600,
    ebitdaK: 400,
    decision: 'Approve foundations Q3 2026',
  },
  {
    id: 'erp',
    initiative: 'Group ERP (financial core)',
    cluster: 'Foundations',
    horizon: '2026–2028',
    capexK: 1800,
    ebitdaK: 400,
    decision: 'RFP Q3 2026 · go-live Dec 2028',
  },
  {
    id: 'pts',
    initiative: 'PTS enhancement',
    cluster: 'Operational core',
    horizon: '2026–2027',
    capexK: 350,
    ebitdaK: 700,
  },
  {
    id: 'pid',
    initiative: 'PID / product data',
    cluster: 'Operational core',
    horizon: '2026–2028',
    capexK: 300,
    ebitdaK: 310,
  },
  {
    id: 'wms',
    initiative: 'WMS implementation',
    cluster: 'Operational core',
    horizon: '2027–2028',
    capexK: 450,
    ebitdaK: 520,
  },
  {
    id: 'mifo_ai',
    initiative: 'MiFo + AI layer',
    cluster: 'Automation',
    horizon: '2028–2029',
    capexK: 900,
    ebitdaK: 950,
  },
];

export const INITIATIVE_HEADLINE =
  'One portfolio, sequenced for margin — not a single ERP big bang';

export const INITIATIVE_SUBLINE =
  'Each initiative has a business owner, a KPI link, and a board decision point. Foundations and ERP selection unlock everything else.';
