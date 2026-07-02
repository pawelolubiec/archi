/** Central Milarex brand palette used in 3D (Three.js) and in the UI. */
export const BRAND = {
  ink: '#02060D',
  navy: '#00284D',
  navyDeep: '#021526',
  sea: '#2EC5C5',
  green: '#34D399',
  gold: '#D6BF91',
  mist: '#9DB4CC',
  paper: '#F2F7FC',
} as const;

/** Globe radius in scene units. */
export const GLOBE_RADIUS = 2;

export const ACCENT_HEX: Record<'sea' | 'green' | 'gold', string> = {
  sea: BRAND.sea,
  green: BRAND.green,
  gold: BRAND.gold,
};
