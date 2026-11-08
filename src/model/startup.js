// Starting the farm: years 1–3 of building up to the plan, year 4 in full operation.
//
// Each enterprise starts with part of the planned herd, flock or area and grows every year,
// while the customer base grows and the family learns the work. Each year is simulated with
// the scaled params, so its income, hours and investments can be compared with full operation.

/** Number of the year from which the farm runs as planned. */
const FULL_OPERATION_YEAR = 4;

/** Share of the planned size in years 1, 2 and 3 for each kind of enterprise (year 4: all of it). */
const STARTUP_SCALE = {
  dairy: [0.75, 1, 1],
  dairyProcessing: [0.3, 0.7, 1], // cheese, curd, butter and goat cheese
  layingHens: [0.5, 1, 1],
  meatPoultry: [0.3, 0.6, 1],
  beef: [0.5, 0.75, 1],
  smallRuminants: [0.5, 0.75, 1],
  pigs: [0, 0.5, 1],
  horses: [1, 1, 1],
  produce: [0.5, 0.75, 1],
  processing: [0, 0.5, 1], // smoked goods, cured meats, preserves
};

/** The parameters each kind of enterprise scales; counts are rounded to whole animals. */
const STARTUP_SCALED_PARAMS = {
  dairy: { counts: ['dairyCows'], shares: [] },
  dairyProcessing: { counts: [], shares: ['cheeseShare', 'curdShare', 'goatCheeseShare'] },
  layingHens: { counts: ['layingHens'], shares: [] },
  meatPoultry: { counts: ['broilers', 'geese', 'ducks', 'turkeys', 'guineaFowl', 'rabbits'], shares: [] },
  beef: { counts: ['sucklerCows'], shares: [] },
  smallRuminants: { counts: ['sheep', 'goats'], shares: [] },
  pigs: { counts: ['pigs'], shares: [] },
  horses: { counts: ['horses'], shares: ['ridesPerYear'] },
  produce: { counts: ['beehives', 'mushroomLogs'], shares: ['marketGardenHa'] },
  processing: {
    counts: [],
    shares: [
      'geeseProcessedShare',
      'ducksProcessedShare',
      'lambProcessedShare',
      'porkProcessedShare',
      'beefProcessedShare',
      'preservesFruitShare',
      'preservesVegetableShare',
    ],
  },
};

/** Share of the planned sales that find buyers while the customer base grows (years 1–3). */
const STARTUP_SALES_REALISED = [0.75, 0.88, 0.96];
/** Extra working time while learning the jobs (years 1–3). */
const STARTUP_EXTRA_HOURS = [0.15, 0.08, 0.03];

/**
 * The params of one start-up year: the plan scaled down, lower sales and longer hours.
 * @param {object} params - the plan in full operation
 * @param {number} year - 1 to FULL_OPERATION_YEAR
 */
function startupYearParams(params, year) {
  if (year >= FULL_OPERATION_YEAR) return params;
  const index = year - 1;
  const scaled = { ...params };
  for (const [kind, { counts, shares }] of Object.entries(STARTUP_SCALED_PARAMS)) {
    const factor = STARTUP_SCALE[kind][index];
    for (const id of counts) scaled[id] = Math.round(params[id] * factor);
    for (const id of shares) scaled[id] = params[id] * factor;
  }
  for (const id of PRICE_PARAMS) scaled[id] = params[id] * STARTUP_SALES_REALISED[index];
  scaled.hoursMultiplier = (params.hoursMultiplier || 1) * (1 + STARTUP_EXTRA_HOURS[index]);
  return scaled;
}

/**
 * Results of every start-up year and of full operation.
 * @param {object} params
 * @returns {{year: number, params: object, results: object}[]}
 */
function simulateStartupYears(params) {
  return Array.from({ length: FULL_OPERATION_YEAR }, (_, index) => {
    const yearParams = startupYearParams(params, index + 1);
    return { year: index + 1, params: yearParams, results: simulateFarm(yearParams) };
  });
}
