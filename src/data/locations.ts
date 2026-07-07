import type { Location } from './types';

export const locations: Location[] = [
  {
    id: 'factory_poland',
    name: 'Milarex Factory',
    country: 'Poland',
    type: 'factory',
    lat: 54.46,
    lng: 17.03, // Słupsk
    description:
      "The group's production center and operational core. This is where the ERP, PTS, PID, MiFo, WMS, and QMS systems meet.",
    connectedSystems: ['workday_erp', 'pts', 'pid', 'mifo', 'wms', 'qms_lims'],
    labelOffsetY: 0.2,
  },
  {
    id: 'office_germany',
    name: 'Milarex Arctic Seafood GmbH',
    country: 'Germany',
    type: 'office',
    lat: 52.356,
    lng: 8.007, // Wallenhorst
    description:
      'Milarex Arctic Seafood GmbH — D-49134 Wallenhorst, Germany. Sales and key-account management for the DACH market.',
    connectedSystems: ['mifo'],
    pinLabel: 'Sales offices',
    labelOffsetY: 0.14,
    labelDistanceFactor: 4,
  },
  {
    id: 'office_italy',
    name: 'Italy Office',
    country: 'Italy',
    type: 'office',
    lat: 45.821,
    lng: 8.825, // Varese
    description: 'Varese, Italy. Southern European market, retail and HoReCa.',
    connectedSystems: ['mifo'],
    pinLabel: 'Italy',
    labelOffsetY: 0.02,
  },
  {
    id: 'office_france',
    name: 'Milarex France',
    country: 'France',
    type: 'office',
    lat: 50.681,
    lng: 3.098, // Marcq-en-Barœul
    description:
      'Milarex France — 165 avenue de la Marne, 59700 Marcq-en-Barœul, France. Sales and customer-concentration analytics (HHI).',
    connectedSystems: ['mifo'],
    pinLabel: 'France',
    labelOffsetY: 0.08,
  },
  {
    id: 'office_usa',
    name: 'ULTCO LLC',
    country: 'USA',
    type: 'office',
    lat: 33.768,
    lng: -118.09, // Seal Beach, CA
    description:
      'ULTCO LLC — California Headquarters, 3030 Old Ranch Parkway, Suite 240, Seal Beach, CA 90740, US. Expansion into the North American market.',
    connectedSystems: ['mifo'],
    pinLabel: 'USA',
  },
  {
    id: 'office_japan',
    name: 'Milarex Japan',
    country: 'Japan',
    type: 'office',
    lat: 35.68,
    lng: 139.69, // Tokyo
    description: 'Sales and key-account management for the Japanese market.',
    connectedSystems: ['mifo'],
    pinLabel: 'Japan',
  },
  {
    id: 'office_australia',
    name: 'Milarex Australia',
    country: 'Australia',
    type: 'office',
    lat: -33.87,
    lng: 151.21, // Sydney
    description: 'Sales and key-account management for the Australian market.',
    connectedSystems: ['mifo'],
    pinLabel: 'Australia',
  },
  {
    id: 'market_japan',
    name: 'Japan market',
    country: 'Japan',
    type: 'customers',
    lat: 35.68,
    lng: 139.69, // Tokyo
    description: 'Retail and distributor demand in the Japanese market.',
    connectedSystems: ['mifo'],
    pinLabel: 'Japan',
  },
  {
    id: 'market_australia',
    name: 'Australia market',
    country: 'Australia',
    type: 'customers',
    lat: -33.87,
    lng: 151.21, // Sydney
    description: 'Retail and distributor demand in the Australian market.',
    connectedSystems: ['mifo'],
    pinLabel: 'Australia',
  },
];

export const locationById = Object.fromEntries(
  locations.map((l) => [l.id, l]),
) as Record<string, Location>;
