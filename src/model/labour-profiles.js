// How each activity's yearly hours spread over the months, and how activities are grouped
// on the labour chart (group names: locales/pl.json → labourGroups).

/** Relative workload per month (January–December), normalised below to an average of 1. */
const LABOUR_PROFILES = normaliseToAverageOne({
  dairyCows: [0.6, 0.6, 1, 1.1, 1.1, 1.1, 1.1, 1.05, 1, 1, 0.9, 0.7],
  cheese: [0.2, 0.2, 0.6, 1, 1.4, 1.6, 1.6, 1.5, 1.2, 0.8, 0.4, 0.2],
  layingHens: [0.85, 0.9, 1, 1.05, 1.05, 1.05, 1.05, 1.05, 1, 1, 0.95, 0.85],
  hatching: [0, 0.5, 2, 2.5, 2, 1.5, 1.2, 1, 0.8, 0.3, 0, 0],
  beefCattle: [1.2, 1.2, 1.3, 1, 0.8, 0.8, 0.8, 0.8, 0.9, 1.3, 1, 1.1],
  catchCrops: [0, 0.3, 0.2, 0, 0, 0, 0, 1.5, 1.5, 0, 0, 0],
  broilers: [0, 0, 0, 0.5, 1.5, 1.5, 1.5, 1.5, 1, 0.5, 0, 0],
  geese: [0, 0, 0, 0.5, 1, 1, 1, 1, 1, 1.5, 2, 0.5],
  ducks: [0, 0, 0, 0.3, 1.2, 1.5, 1.5, 1.5, 1.3, 0.8, 0.3, 0],
  turkeys: [0, 0, 0, 0, 0.6, 1, 1, 1, 1.2, 1.5, 2, 1.5],
  guineaFowl: [0, 0, 0, 0, 0.8, 1.2, 1.2, 1.2, 1.2, 1.4, 1.2, 0.3],
  processedGoods: [0.4, 0.3, 0.3, 0.3, 0.3, 0.4, 0.5, 0.7, 1, 1.6, 3, 3],
  fruit: [0, 0, 0, 0, 0, 0.3, 0.8, 1.8, 3.5, 3.5, 1.2, 0.3],
  mushrooms: [0.3, 0.3, 0.8, 1.3, 1.4, 1, 0.7, 0.9, 1.5, 1.6, 1, 0.3],
  rabbits: [0.7, 0.7, 0.9, 1.1, 1.2, 1.2, 1.2, 1.2, 1.1, 1, 0.9, 0.8],
  sheep: [0.8, 1, 1.8, 1.6, 1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
  goats: [0.8, 0.9, 1.3, 1.2, 1, 1, 1, 1, 1, 1, 0.9, 0.9],
  horses: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  pigs: [0.5, 0.5, 0.8, 1.2, 1.3, 1.3, 1.3, 1.3, 1.2, 1.2, 1, 0.5],
  hay: [0, 0, 0, 0, 2, 4, 2, 2, 1, 0, 0, 0],
  cereals: [0, 0, 1, 2, 1, 0, 1, 3, 2, 2, 0, 0],
  rootCrops: [0, 0, 0.5, 2, 2, 2.5, 1.5, 0.5, 2, 2.5, 0.5, 0],
  sales: [0.75, 0.75, 0.9, 1, 1.1, 1.15, 1.15, 1.15, 1.1, 1.05, 0.95, 0.85],
  general: [0.8, 0.8, 1.3, 1.5, 1.2, 1, 1, 1, 1, 1, 0.8, 0.6],
  garden: [0.2, 0.3, 0.8, 1.5, 2, 2, 2, 1.8, 1.5, 1, 0.5, 0.2],
  vegetables: [0.1, 0.2, 0.7, 1.3, 1.8, 2, 2, 1.9, 1.6, 1.1, 0.5, 0.2],
  beehives: [0.1, 0.2, 0.8, 1.4, 1.8, 1.8, 1.6, 1.3, 0.9, 0.4, 0.2, 0.1],
});

/** Groups of activities shown as stacked bars on the labour chart; `color` is a CSS variable. */
const LABOUR_GROUPS = [
  { id: 'cattle', color: 'var(--color-cattle)', activities: ['beefCattle', 'dairyCows', 'cheese'] },
  {
    id: 'poultry',
    color: 'var(--color-poultry)',
    activities: ['layingHens', 'hatching', 'broilers', 'geese', 'ducks', 'turkeys', 'guineaFowl', 'rabbits'],
  },
  { id: 'smallLivestock', color: 'var(--color-sheep)', activities: ['sheep', 'goats', 'pigs', 'horses'] },
  { id: 'fields', color: 'var(--color-fields)', activities: ['hay', 'cereals', 'rootCrops', 'catchCrops'] },
  {
    id: 'produce',
    color: 'var(--color-produce)',
    activities: ['vegetables', 'fruit', 'mushrooms', 'beehives'],
  },
  { id: 'processing', color: 'var(--color-processing)', activities: ['processedGoods'] },
  { id: 'other', color: 'var(--color-other)', activities: ['sales', 'general', 'garden'] },
];

function normaliseToAverageOne(profiles) {
  const normalised = {};
  for (const [activity, months] of Object.entries(profiles)) {
    const average = months.reduce((sum, weight) => sum + weight, 0) / months.length;
    normalised[activity] = months.map(weight => weight / average);
  }
  return normalised;
}
