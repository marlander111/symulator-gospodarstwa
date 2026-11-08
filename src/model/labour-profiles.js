// How each activity's yearly hours spread over the months, and how activities are grouped
// on the labour chart (group names: locales → labourGroups), and the time of day of each job.

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
  horses: [0.8, 0.8, 0.9, 1, 1.2, 1.3, 1.4, 1.4, 1.2, 1, 0.8, 0.7],
  guardDogs: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
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
  {
    id: 'smallLivestock',
    color: 'var(--color-sheep)',
    activities: ['sheep', 'goats', 'pigs', 'horses', 'guardDogs'],
  },
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

/**
 * Share of each activity's daily work done in the morning, during the day and in the evening.
 * Milking and the animals' feeding and shutting in are tied to the morning and evening; field
 * work, processing and repairs are done during the day.
 */
const TIME_OF_DAY_SHARES = {
  dairyCows: { morning: 0.45, day: 0.1, evening: 0.45 },
  cheese: { morning: 0.3, day: 0.7, evening: 0 },
  layingHens: { morning: 0.5, day: 0.2, evening: 0.3 },
  hatching: { morning: 0.3, day: 0.5, evening: 0.2 },
  beefCattle: { morning: 0.5, day: 0.4, evening: 0.1 },
  catchCrops: { morning: 0, day: 1, evening: 0 },
  broilers: { morning: 0.5, day: 0.3, evening: 0.2 },
  geese: { morning: 0.4, day: 0.3, evening: 0.3 },
  ducks: { morning: 0.4, day: 0.3, evening: 0.3 },
  turkeys: { morning: 0.4, day: 0.3, evening: 0.3 },
  guineaFowl: { morning: 0.4, day: 0.3, evening: 0.3 },
  processedGoods: { morning: 0, day: 0.9, evening: 0.1 },
  fruit: { morning: 0.2, day: 0.8, evening: 0 },
  mushrooms: { morning: 0.4, day: 0.6, evening: 0 },
  rabbits: { morning: 0.5, day: 0, evening: 0.5 },
  sheep: { morning: 0.4, day: 0.5, evening: 0.1 },
  goats: { morning: 0.4, day: 0.2, evening: 0.4 },
  horses: { morning: 0.3, day: 0.5, evening: 0.2 },
  guardDogs: { morning: 0.5, day: 0, evening: 0.5 },
  pigs: { morning: 0.5, day: 0.3, evening: 0.2 },
  hay: { morning: 0, day: 1, evening: 0 },
  cereals: { morning: 0, day: 1, evening: 0 },
  rootCrops: { morning: 0.2, day: 0.8, evening: 0 },
  sales: { morning: 0, day: 0.6, evening: 0.4 },
  general: { morning: 0, day: 1, evening: 0 },
  garden: { morning: 0.2, day: 0.5, evening: 0.3 },
  vegetables: { morning: 0.3, day: 0.7, evening: 0 },
  beehives: { morning: 0, day: 1, evening: 0 },
};

/** Milking once a day moves the evening milking to the morning. */
const ONCE_A_DAY_MILKING_SHARES = { morning: 0.8, day: 0.2, evening: 0 };

const TIMES_OF_DAY = ['morning', 'day', 'evening'];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Average hours per day in one month, by time of day and activity.
 * @param {object} hoursByActivity - yearly hours of each activity (results.hoursByActivity)
 * @param {number} month - 0–11
 * @param {object} params
 * @returns {{total: number, byTime: {morning: number, day: number, evening: number},
 *   activities: {morning: object, day: object, evening: object}}}
 */
function dailyHoursByTimeOfDay(hoursByActivity, month, params) {
  const activities = { morning: {}, day: {}, evening: {} };
  for (const [activity, yearlyHours] of Object.entries(hoursByActivity)) {
    const perDay = ((yearlyHours / 12) * LABOUR_PROFILES[activity][month]) / DAYS_IN_MONTH[month];
    if (perDay <= 0) continue;
    const shares =
      activity === 'dairyCows' && params.onceADayMilking
        ? ONCE_A_DAY_MILKING_SHARES
        : TIME_OF_DAY_SHARES[activity];
    for (const time of TIMES_OF_DAY) if (shares[time] > 0) activities[time][activity] = perDay * shares[time];
  }
  const byTime = Object.fromEntries(TIMES_OF_DAY.map(time => [time, sumValues(activities[time])]));
  return { total: sumValues(byTime), byTime, activities };
}
