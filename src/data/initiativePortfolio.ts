/** Board-readable summary of the company-strategy mapping supplied for slide 04. */
export interface InitiativeRow {
  id: string;
  initiative: string;
  area: string;
  priority: 'High' | 'Medium-high' | 'Medium';
  status: string;
  current: string;
  target: string;
  businessValue: string;
}

export interface InitiativeCluster {
  id: string;
  label: string;
  summary: string;
  initiativeIds: string[];
}

export const INITIATIVE_CLUSTERS: InitiativeCluster[] = [
  {
    id: 'core',
    label: 'Build the core',
    summary: 'High-priority foundations for operational control and trusted group data.',
    initiativeIds: ['pts', 'erp', 'master-data'],
  },
  {
    id: 'intelligence',
    label: 'Improve decisions',
    summary: 'Planning and product data that turn the core into better commercial decisions.',
    initiativeIds: ['mifo', 'pid'],
  },
  {
    id: 'readiness',
    label: 'Protect adoption',
    summary: 'People and cyber capabilities required to sustain the transformation.',
    initiativeIds: ['people', 'cybersecurity'],
  },
];

export const INITIATIVE_ROWS: InitiativeRow[] = [
  {
    id: 'pts',
    initiative: 'PTS',
    area: 'Production tracking',
    priority: 'High',
    status: 'In use, developing',
    current: 'Tracks production orders, recipes and raw-material intake.',
    target: 'Add mobile capture, technical KPIs and live performance analytics.',
    businessValue: 'Less manual work, lower loss and faster product rollout.',
  },
  {
    id: 'erp',
    initiative: 'ERP, new core',
    area: 'Core systems and supply chain',
    priority: 'High',
    status: 'Scope and vendor selection',
    current: 'The current company ERP is due for replacement.',
    target: 'Create the core for finance, purchasing, sales and selected supply-chain flows.',
    businessValue: 'Cost control, product margin visibility and faster launches.',
  },
  {
    id: 'master-data',
    initiative: 'Master data governance',
    area: 'Group-wide data foundation',
    priority: 'High',
    status: 'Preparation',
    current: 'Master data differs across systems and sites.',
    target: 'Set group-wide rules, owners and quality controls for core data.',
    businessValue: 'Fewer errors, comparable margins and one group catalogue.',
  },
  {
    id: 'mifo',
    initiative: 'MiFo forecast',
    area: 'Supply chain planning',
    priority: 'Medium-high',
    status: 'In use, developing',
    current: 'Forecasting feeds production, budgets and reporting.',
    target: 'Extend to demand planning, S&OP, scenarios and predictive forecasting.',
    businessValue: 'Lower tied-up capital, less overproduction and better portfolio planning.',
  },
  {
    id: 'pid',
    initiative: 'PID',
    area: 'Product information',
    priority: 'Medium',
    status: 'In use, developing',
    current: 'Finished-goods specifications are managed centrally.',
    target: 'Move toward PLM and one source for product and packaging data.',
    businessValue: 'Less product-data work, accurate costing and faster SKU rollout.',
  },
  {
    id: 'people',
    initiative: 'People and change',
    area: 'Organisation and culture',
    priority: 'Medium',
    status: 'Gap',
    current: 'There is no formal adoption programme.',
    target: 'Build training, change support and digital skills.',
    businessValue: 'Adoption, reliable data and organisational readiness for change.',
  },
  {
    id: 'cybersecurity',
    initiative: 'Cybersecurity',
    area: 'Business resilience',
    priority: 'Medium',
    status: 'Continuous development',
    current: 'IT security is maintained continuously.',
    target: 'Complete NIS2 and strengthen business continuity.',
    businessValue: 'Continuity, protected data and secure expansion into new markets.',
  },
];

export const INITIATIVE_HEADLINE =
  'Seven initiatives, organised around three transformation priorities.';

export const INITIATIVE_SUBLINE =
  'Read each row from today to target, then see the business outcome it enables.';
