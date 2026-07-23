export type FactoryOrderView = 'asis' | 'tobe';

export interface FactorySystemLink {
  from: string;
  to: string;
  kind: 'manual' | 'standard' | 'broken';
}

export const FACTORY_ORDER_COPY: Record<
  FactoryOrderView,
  { headline: string; detail: string }
> = {
  asis: {
    headline: 'As is — local handoffs and gaps',
    detail:
      'Systems exist but data stops at spreadsheets and e-mail between shifts. Exceptions surface late — in meetings, not in a Control Tower.',
  },
  tobe: {
    headline: 'To be — order across the hall',
    detail:
      'One continuous chain from order to output. Signals rise to the Control Tower; approved decisions flow back — no re-typing.',
  },
};

/** Inter-system links shown on the factory-order slide. */
export const FACTORY_SYSTEM_LINKS: Record<FactoryOrderView, FactorySystemLink[]> = {
  asis: [
    { from: 'mifo', to: 'workday_erp', kind: 'manual' },
    { from: 'pts', to: 'workday_erp', kind: 'manual' },
    { from: 'pid', to: 'pts', kind: 'broken' },
    { from: 'qms_lims', to: 'pid', kind: 'manual' },
  ],
  tobe: [
    { from: 'mifo', to: 'pts', kind: 'standard' },
    { from: 'pts', to: 'pid', kind: 'standard' },
    { from: 'pid', to: 'wms', kind: 'standard' },
    { from: 'pts', to: 'qms_lims', kind: 'standard' },
    { from: 'wms', to: 'workday_erp', kind: 'standard' },
    { from: 'mifo', to: 'workday_erp', kind: 'standard' },
  ],
};

export const FACTORY_ACTIVE_SYSTEMS: Record<FactoryOrderView, string[]> = {
  asis: ['workday_erp', 'pts', 'pid', 'mifo', 'qms_lims'],
  tobe: ['workday_erp', 'pts', 'pid', 'mifo', 'wms', 'qms_lims'],
};

/** Material flow completeness: 0–1 along the production line. */
export const FACTORY_FLOW_PROGRESS: Record<FactoryOrderView, number> = {
  asis: 0.55,
  tobe: 1,
};

export const FACTORY_LINK_COLORS: Record<FactorySystemLink['kind'], string> = {
  manual: '#F87171',
  broken: '#64748B',
  standard: '#D6BF91',
};
