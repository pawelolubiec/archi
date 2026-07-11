export interface BusinessProcess {
  id: string;
  label: string;
  color: string;
  order: number;
}

export type ArchLayerId = 'ai' | 'data' | 'apps';

export interface ArchitectureElement {
  id: string;
  label: string;
  layer: ArchLayerId;
  linkedProcessIds: string[];
  /**
   * Explicit connections to other elements. `undefined` means "derive from
   * shared business processes"; an array (even empty) pins the exact set.
   */
  linkedElementIds?: string[];
  systemId?: string;
}

/** Vertical position of each layer — used to decide flow direction. */
export const LAYER_RANK: Record<ArchLayerId, number> = { apps: 0, data: 1, ai: 2 };

/**
 * Effective element-to-element connections. Explicit links (from either side)
 * always count; when neither side pins its links, cross-layer elements sharing
 * a business process are connected.
 */
export function connectedElementIds(
  el: ArchitectureElement,
  all: ArchitectureElement[],
): Set<string> {
  const out = new Set<string>();
  const shares = (a: ArchitectureElement, b: ArchitectureElement) =>
    a.linkedProcessIds.some((p) => b.linkedProcessIds.includes(p));

  all.forEach((o) => {
    if (o.id === el.id) return;
    const elExplicit = Array.isArray(el.linkedElementIds);
    const oExplicit = Array.isArray(o.linkedElementIds);
    if (
      (elExplicit && el.linkedElementIds!.includes(o.id)) ||
      (oExplicit && o.linkedElementIds!.includes(el.id))
    ) {
      out.add(o.id);
      return;
    }
    if (!elExplicit && !oExplicit && o.layer !== el.layer && shares(el, o)) {
      out.add(o.id);
    }
  });
  return out;
}

export interface ArchitectureConfig {
  elements: ArchitectureElement[];
}

export const BUSINESS_PROCESSES: BusinessProcess[] = [
  { id: 'market_demand', label: 'Market Demand', color: '#1B5E3B', order: 1 },
  { id: 'forecasting', label: 'Forecasting', color: '#2D8A4E', order: 2 },
  { id: 'sourcing', label: 'Sourcing & Procurement', color: '#5CB85C', order: 3 },
  { id: 'raw_material', label: 'Raw Material Intake', color: '#5BC0DE', order: 4 },
  { id: 'production_planning', label: 'Production Planning', color: '#337AB7', order: 5 },
  { id: 'processing', label: 'Processing & Packaging', color: '#286090', order: 6 },
  { id: 'quality', label: 'Quality & Compliance', color: '#E67E22', order: 7 },
  { id: 'warehousing', label: 'Warehousing', color: '#C4A574', order: 8 },
  { id: 'sales_logistics', label: 'Sales & Logistics', color: '#E8A87C', order: 9 },
  { id: 'finance', label: 'Finance & Controlling', color: '#F0C040', order: 10 },
  { id: 'performance', label: 'Performance & Improvement', color: '#F5E6A3', order: 11 },
];

export const processById = Object.fromEntries(
  BUSINESS_PROCESSES.map((p) => [p.id, p]),
) as Record<string, BusinessProcess>;

const DEFAULT_ELEMENTS: ArchitectureElement[] = [
  // AI / automation orchestration
  { id: 'ai_demand', label: 'Demand monitoring', layer: 'ai', linkedProcessIds: ['market_demand'] },
  { id: 'ai_forecast', label: 'Forecast variance', layer: 'ai', linkedProcessIds: ['forecasting'] },
  { id: 'ai_margin', label: 'Margin simulation', layer: 'ai', linkedProcessIds: ['forecasting'] },
  { id: 'ai_supplier', label: 'Supplier scoring', layer: 'ai', linkedProcessIds: ['sourcing', 'performance'] },
  { id: 'ai_yield', label: 'Yield anomaly detection', layer: 'ai', linkedProcessIds: ['processing'] },
  { id: 'ai_quality', label: 'Quality risk engine', layer: 'ai', linkedProcessIds: ['quality'] },
  { id: 'ai_customer', label: 'Customer profitability', layer: 'ai', linkedProcessIds: ['sales_logistics'] },
  { id: 'ai_ops', label: 'Operational intelligence', layer: 'ai', linkedProcessIds: ['performance'] },
    {
    id: 'ai_gone',
    label: 'Gone-AI agents',
    layer: 'ai',
    linkedProcessIds: ['forecasting', 'performance'],
    systemId: 'gone_ai',
  },

  // Data platform
  { id: 'data_lake', label: 'Lakehouse', layer: 'data', linkedProcessIds: ['performance'], systemId: 'data_platform' },
  { id: 'data_master', label: 'Master Data', layer: 'data', linkedProcessIds: ['sourcing', 'production_planning'] },
  { id: 'data_semantic', label: 'Semantic Layer', layer: 'data', linkedProcessIds: ['finance', 'performance'] },
  { id: 'data_kpi', label: 'KPI model', layer: 'data', linkedProcessIds: ['finance', 'performance'], systemId: 'data_platform' },
  { id: 'data_bi', label: 'BI / Superset', layer: 'data', linkedProcessIds: ['performance'] },
  { id: 'data_ai_feat', label: 'AI Features', layer: 'data', linkedProcessIds: ['forecasting', 'performance'] },

  // Applications (unified)
  { id: 'app_mifo', label: 'MiFo', layer: 'apps', linkedProcessIds: ['market_demand', 'forecasting', 'sales_logistics'], systemId: 'mifo' },
  { id: 'app_aps', label: 'APS', layer: 'apps', linkedProcessIds: ['production_planning', 'forecasting'], systemId: 'aps' },
  { id: 'app_pts', label: 'PTS', layer: 'apps', linkedProcessIds: ['raw_material', 'production_planning', 'processing'], systemId: 'pts' },
  { id: 'app_pid', label: 'PID', layer: 'apps', linkedProcessIds: ['forecasting', 'processing', 'quality'], systemId: 'pid' },
  { id: 'app_wms', label: 'WMS', layer: 'apps', linkedProcessIds: ['warehousing', 'sales_logistics'], systemId: 'wms' },
  { id: 'app_qms', label: 'QMS / LIMS', layer: 'apps', linkedProcessIds: ['quality'], systemId: 'qms_lims' },
  { id: 'app_erp', label: 'ERP (Workday / IFS)', layer: 'apps', linkedProcessIds: ['sourcing', 'finance', 'warehousing'], systemId: 'workday_erp' },
  { id: 'app_trace', label: 'Traceability Platform', layer: 'apps', linkedProcessIds: ['quality', 'processing'] },
  { id: 'app_helpdesk', label: 'Helpdesk', layer: 'apps', linkedProcessIds: ['performance'] },
  { id: 'app_scada', label: 'SCADA', layer: 'apps', linkedProcessIds: ['processing', 'performance'] },
];

export const DEFAULT_ARCHITECTURE_CONFIG: ArchitectureConfig = {
  elements: DEFAULT_ELEMENTS.map((el) => ({
    ...el,
    linkedProcessIds: [...el.linkedProcessIds],
  })),
};

export function cloneDefaultArchitectureConfig(): ArchitectureConfig {
  return {
    elements: DEFAULT_ARCHITECTURE_CONFIG.elements.map((el) => ({
      ...el,
      linkedProcessIds: [...el.linkedProcessIds],
    })),
  };
}

export function getProcessColor(processId: string): string {
  return processById[processId]?.color ?? '#9DB4CC';
}

export function formatProcessBadges(linkedProcessIds: string[]): string {
  if (!linkedProcessIds.length) return '';
  const orders = linkedProcessIds
    .map((id) => processById[id]?.order)
    .filter((n): n is number => n !== undefined)
    .sort((a, b) => a - b);
  return `(${orders.join(',')})`;
}

export function primaryProcessColor(linkedProcessIds: string[]): string {
  if (!linkedProcessIds.length) return '#9DB4CC';
  const sorted = [...linkedProcessIds].sort(
    (a, b) => (processById[a]?.order ?? 99) - (processById[b]?.order ?? 99),
  );
  return getProcessColor(sorted[0]);
}

export const ARCH_LAYER_LABELS: Record<ArchLayerId, string> = {
  ai: 'Decision, Automation & AI Orchestration',
  data: 'Data Platform',
  apps: 'Applications',
};
