export interface BusinessProcess {
  id: string;
  label: string;
  color: string;
  order: number;
}

export type ArchLayerId = 'ai' | 'data' | 'apps';

/** Delivery status of an element — the strategy tick-off state. */
export type ElementStatus = 'todo' | 'in_dev' | 'live';

export const ELEMENT_STATUS_META: Record<
  ElementStatus,
  { label: string; color: string }
> = {
  live: { label: 'Running', color: '#34D399' },
  in_dev: { label: 'In development', color: '#2EC5C5' },
  todo: { label: 'To be done', color: '#D6BF91' },
};

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
  /** Per-view explicit links — override linkedElementIds when set for that view. */
  linkedElementIdsAsIs?: string[];
  linkedElementIdsToBe?: string[];
  systemId?: string;
  /** to be done / in development / running — absent = derived from the system */
  status?: ElementStatus;
}

/** How a cross-layer link behaves in each architecture state. */
export type ConnectionKind = 'retained' | 'manual' | 'removed' | 'new' | 'standard';

export interface ArchitectureConnection {
  fromId: string;
  toId: string;
  kind: ConnectionKind;
}

export interface ArchitectureConfig {
  elements: ArchitectureElement[];
  connectionsAsIs?: ArchitectureConnection[];
  connectionsToBe?: ArchitectureConnection[];
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
  view: 'asis' | 'tobe' = 'tobe',
): Set<string> {
  const out = new Set<string>();
  const shares = (a: ArchitectureElement, b: ArchitectureElement) =>
    a.linkedProcessIds.some((p) => b.linkedProcessIds.includes(p));

  const viewLinks =
    view === 'asis' ? el.linkedElementIdsAsIs : el.linkedElementIdsToBe;

  all.forEach((o) => {
    if (o.id === el.id) return;
    const elExplicit =
      viewLinks !== undefined
        ? true
        : Array.isArray(el.linkedElementIds);
    const oViewLinks =
      view === 'asis' ? o.linkedElementIdsAsIs : o.linkedElementIdsToBe;
    const oExplicit =
      oViewLinks !== undefined ? true : Array.isArray(o.linkedElementIds);

    const elList =
      viewLinks ??
      (Array.isArray(el.linkedElementIds) ? el.linkedElementIds : undefined);
    const oList =
      oViewLinks ??
      (Array.isArray(o.linkedElementIds) ? o.linkedElementIds : undefined);

    if (
      (elExplicit && elList?.includes(o.id)) ||
      (oExplicit && oList?.includes(el.id))
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

function connectionKey(fromId: string, toId: string): string {
  return [fromId, toId].sort().join('|');
}

/** Build standard cross-layer links from shared business processes. */
export function deriveStandardConnections(
  elements: ArchitectureElement[],
): ArchitectureConnection[] {
  const seen = new Set<string>();
  const out: ArchitectureConnection[] = [];
  elements.forEach((el) => {
    connectedElementIds(el, elements, 'tobe').forEach((otherId) => {
      const key = connectionKey(el.id, otherId);
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ fromId: el.id, toId: otherId, kind: 'standard' });
    });
  });
  return out;
}

/** As-is: fewer live links, manual handoffs, gaps where the platform is missing. */
export function deriveAsIsConnections(
  elements: ArchitectureElement[],
): ArchitectureConnection[] {
  const live = elements.filter((el) => elementStatus(el) === 'live');
  const liveIds = new Set(live.map((el) => el.id));
  const manualPairs: Array<[string, string]> = [
    ['app_mifo', 'data_bi'],
    ['app_pts', 'data_bi'],
    ['app_pid', 'data_bi'],
    ['app_erp', 'data_bi'],
    ['app_scada', 'data_bi'],
    ['app_helpdesk', 'data_bi'],
  ];
  const seen = new Set<string>();
  const out: ArchitectureConnection[] = [];

  manualPairs.forEach(([fromId, toId]) => {
    if (!liveIds.has(fromId) || !liveIds.has(toId)) return;
    const key = connectionKey(fromId, toId);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ fromId, toId, kind: 'manual' });
  });

  live.forEach((el) => {
    connectedElementIds(el, live, 'asis').forEach((otherId) => {
      const key = connectionKey(el.id, otherId);
      if (seen.has(key)) return;
      seen.add(key);
      const isManual = manualPairs.some(
        ([a, b]) =>
          (a === el.id && b === otherId) || (a === otherId && b === el.id),
      );
      out.push({
        fromId: el.id,
        toId: otherId,
        kind: isManual ? 'manual' : 'retained',
      });
    });
  });

  return out;
}

export function connectionsForView(
  config: ArchitectureConfig,
  view: 'asis' | 'tobe',
): ArchitectureConnection[] {
  const stored =
    view === 'asis' ? config.connectionsAsIs : config.connectionsToBe;
  if (stored !== undefined) return stored;
  return view === 'asis'
    ? deriveAsIsConnections(config.elements)
    : deriveStandardConnections(config.elements);
}

export function mergeArchitectureConfig(
  remote: Partial<ArchitectureConfig> | null | undefined,
): ArchitectureConfig {
  const base = cloneDefaultArchitectureConfig();
  if (!remote?.elements?.length) return base;
  return {
    elements: remote.elements.map((el) => ({
      ...el,
      linkedProcessIds: [...el.linkedProcessIds],
    })),
    connectionsAsIs: remote.connectionsAsIs ?? base.connectionsAsIs,
    connectionsToBe: remote.connectionsToBe ?? base.connectionsToBe,
  };
}

/**
 * Effective status: explicit tag wins; otherwise derive from the linked
 * system's status (old saved configs have no `status` field).
 */
export function elementStatus(el: ArchitectureElement): ElementStatus {
  if (el.status) return el.status;
  const def = DEFAULT_ELEMENTS.find((d) => d.id === el.id);
  return def?.status ?? 'todo';
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
  { id: 'data_bi', label: 'BI / Superset', layer: 'data', linkedProcessIds: ['performance'], status: 'live' },
  { id: 'data_ai_feat', label: 'AI Features', layer: 'data', linkedProcessIds: ['forecasting', 'performance'] },

  // Applications (unified)
  { id: 'app_mifo', label: 'MiFo', layer: 'apps', linkedProcessIds: ['market_demand', 'forecasting', 'sales_logistics'], systemId: 'mifo', status: 'live' },
  { id: 'app_aps', label: 'APS', layer: 'apps', linkedProcessIds: ['production_planning', 'forecasting'], systemId: 'aps' },
  { id: 'app_pts', label: 'PTS', layer: 'apps', linkedProcessIds: ['raw_material', 'production_planning', 'processing'], systemId: 'pts', status: 'live' },
  { id: 'app_pid', label: 'PID', layer: 'apps', linkedProcessIds: ['forecasting', 'processing', 'quality'], systemId: 'pid', status: 'live' },
  { id: 'app_wms', label: 'WMS', layer: 'apps', linkedProcessIds: ['warehousing', 'sales_logistics'], systemId: 'wms' },
  { id: 'app_qms', label: 'QMS / LIMS', layer: 'apps', linkedProcessIds: ['quality'], systemId: 'qms_lims' },
  { id: 'app_erp', label: 'Group ERP', layer: 'apps', linkedProcessIds: ['sourcing', 'finance', 'warehousing'], systemId: 'workday_erp' },
  { id: 'app_trace', label: 'Traceability Platform', layer: 'apps', linkedProcessIds: ['quality', 'processing'] },
  { id: 'app_helpdesk', label: 'Helpdesk', layer: 'apps', linkedProcessIds: ['performance'], status: 'live' },
  { id: 'app_scada', label: 'SCADA', layer: 'apps', linkedProcessIds: ['processing', 'performance'], status: 'live' },
];

export const DEFAULT_ARCHITECTURE_CONFIG: ArchitectureConfig = {
  elements: DEFAULT_ELEMENTS.map((el) => ({
    ...el,
    linkedProcessIds: [...el.linkedProcessIds],
  })),
  connectionsAsIs: undefined,
  connectionsToBe: undefined,
};

export function cloneDefaultArchitectureConfig(): ArchitectureConfig {
  const elements = DEFAULT_ARCHITECTURE_CONFIG.elements.map((el) => ({
    ...el,
    linkedProcessIds: [...el.linkedProcessIds],
  }));
  return {
    elements,
    connectionsAsIs: deriveAsIsConnections(elements),
    connectionsToBe: deriveStandardConnections(elements),
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

export const CONNECTION_KIND_META: Record<
  ConnectionKind,
  { label: string; color: string; dash?: string }
> = {
  retained: { label: 'Retained', color: '#9DB4CC', dash: '4 4' },
  manual: { label: 'Manual / spreadsheet', color: '#F87171', dash: '2 6' },
  removed: { label: 'Removed', color: '#64748B', dash: '1 8' },
  new: { label: 'New link', color: '#34D399', dash: '6 4' },
  standard: { label: 'Standardized', color: '#D6BF91', dash: '6 6' },
};

export const ARCH_VIEW_COPY: Record<
  'asis' | 'tobe',
  { headline: string; detail: string }
> = {
  asis: {
    headline: 'As is — fragmented today',
    detail:
      'Live systems connect through manual exports and custom wiring. BI sits beside operations — not underneath them.',
  },
  tobe: {
    headline: 'To be — one data layer',
    detail:
      'Applications feed a shared platform; AI orchestration reaches every process through standardized links — not point-to-point patches.',
  },
};
export const ARCH_LAYER_LABELS: Record<ArchLayerId, string> = {
  ai: 'Decision, Automation & AI Orchestration',
  data: 'Data Platform',
  apps: 'Applications',
};
