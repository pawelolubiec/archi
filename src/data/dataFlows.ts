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
    systems: ['salesforce_crm', 'aps', 'workday_erp'],
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
    systems: ['salesforce_crm', 'aps'],
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
    systems: ['salesforce_crm', 'aps'],
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
    systems: ['salesforce_crm', 'aps'],
    kpisAffected: ['forecast_accuracy'],
    lift: 0.5,
  },
];

export const dataFlowById = Object.fromEntries(
  dataFlows.map((f) => [f.id, f]),
) as Record<string, DataFlow>;
