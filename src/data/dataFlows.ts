import type { DataFlow } from './types';

export const dataFlows: DataFlow[] = [
  {
    id: 'de_to_factory',
    from: 'office_germany',
    to: 'factory_poland',
    type: 'orders',
    description:
      'Orders, forecast, prices, complaints, and customer requirements feed planning and production.',
    frequency: 'daily',
    systems: ['mifo', 'aps', 'workday_erp'],
    kpisAffected: ['forecast_accuracy', 'inventory_days', 'yield'],
    lift: 0.28,
  },
  {
    id: 'fr_to_factory',
    from: 'office_france',
    to: 'factory_poland',
    type: 'orders',
    description: 'Sales data from France into the operational core.',
    frequency: 'daily',
    systems: ['mifo', 'aps'],
    kpisAffected: ['forecast_accuracy'],
    lift: 0.26,
  },
  {
    id: 'it_to_factory',
    from: 'office_italy',
    to: 'factory_poland',
    type: 'orders',
    description: 'Sales data from Italy into the operational core.',
    frequency: 'daily',
    systems: ['mifo', 'aps'],
    kpisAffected: ['forecast_accuracy'],
    lift: 0.24,
  },
  {
    id: 'us_to_factory',
    from: 'office_usa',
    to: 'factory_poland',
    type: 'orders',
    description: 'Sales data from the USA into the operational core.',
    frequency: 'daily',
    systems: ['mifo', 'aps'],
    kpisAffected: ['forecast_accuracy'],
    lift: 0.5,
  },
  {
    id: 'jp_to_factory',
    from: 'office_japan',
    to: 'factory_poland',
    type: 'orders',
    description: 'Sales data from Japan into the operational core.',
    frequency: 'daily',
    systems: ['mifo', 'aps'],
    kpisAffected: ['forecast_accuracy'],
    lift: 0.5,
  },
  {
    id: 'au_to_factory',
    from: 'office_australia',
    to: 'factory_poland',
    type: 'orders',
    description: 'Sales data from Australia into the operational core.',
    frequency: 'daily',
    systems: ['mifo', 'aps'],
    kpisAffected: ['forecast_accuracy'],
    lift: 0.5,
  },
];

/* ── acquisition docking: the three contracts of a new office ──────── */

dataFlows.push(
  {
    id: 'es_mifo',
    from: 'office_spain',
    to: 'factory_poland',
    type: 'orders',
    description:
      'Commercial docking — MiFo accounts over the existing local sales tool; quotes and orders reach the group same-day.',
    frequency: 'daily',
    systems: ['mifo'],
    kpisAffected: ['forecast_accuracy', 'service_level'],
    lift: 0.3,
  },
  {
    id: 'es_data',
    from: 'office_spain',
    to: 'factory_poland',
    type: 'data',
    description:
      'Data docking — one canonical connector into the lakehouse; group BI and forecasting see the entity.',
    frequency: 'daily',
    systems: ['data_platform'],
    kpisAffected: ['forecast_accuracy'],
    lift: 0.38,
  },
  {
    id: 'es_finance',
    from: 'office_spain',
    to: 'factory_poland',
    type: 'finance',
    description:
      'Finance docking — trial-balance consolidation feed to the lean group ERP; the local ERP stays.',
    frequency: 'monthly',
    systems: ['workday_erp'],
    kpisAffected: ['ebitda'],
    lift: 0.46,
  },
);

/* ── outbound product logistics from the factory ─────────────────── */

const truckFlow = (id: string, to: string, market: string): DataFlow => ({
  id,
  from: 'factory_poland',
  to,
  type: 'truck',
  description: `Finished product to the ${market} market by truck.`,
  frequency: 'daily',
  systems: ['wms', 'workday_erp'],
  kpisAffected: ['lead_time', 'service_level'],
  lift: 0.08,
});

const oceanFlow = (id: string, to: string, market: string): DataFlow => ({
  id,
  from: 'factory_poland',
  to,
  type: 'ocean',
  description: `Finished product to the ${market} market by ocean freight.`,
  frequency: 'weekly',
  systems: ['wms', 'workday_erp'],
  kpisAffected: ['lead_time', 'inventory_days'],
  lift: 0.12,
});

dataFlows.push(
  truckFlow('factory_to_de', 'office_germany', 'German'),
  truckFlow('factory_to_fr', 'office_france', 'French'),
  truckFlow('factory_to_it', 'office_italy', 'Italian'),
  oceanFlow('factory_to_us', 'office_usa', 'US'),
  oceanFlow('factory_to_jp', 'office_japan', 'Japanese'),
  oceanFlow('factory_to_au', 'office_australia', 'Australian'),
);

export const dataFlowById = Object.fromEntries(
  dataFlows.map((f) => [f.id, f]),
) as Record<string, DataFlow>;
