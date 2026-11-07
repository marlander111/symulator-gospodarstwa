// Year-to-year risk: the farm is simulated for many random years in which yields, prices, animal
// output and running costs vary around the set values, with an occasional bad year for the
// animals. The spread of the yearly net income shows how often the farm reaches the income
// target. The random numbers come from a fixed seed, so the same settings always give the same
// picture.

const RISK_YEARS = 500;
const RISK_SEED = 20261108;

/** Limits of the yearly factors, so that one draw cannot produce an impossible year. */
const RISK_FACTOR_LIMITS = {
  yield: [0.45, 1.35],
  price: [0.65, 1.35],
  animalOutput: [0.7, 1.2],
  cost: [0.8, 1.4],
};

/** In a poor harvest bought feed gets dearer: half of the yield shortfall is added to its price. */
const FEED_PRICE_RESPONSE_TO_YIELD = 0.5;

/** A bad year (disease, bird-flu housing order, lost customers) cuts animal output by this share. */
const BAD_YEAR_ANIMAL_OUTPUT_LOSS = 0.25;

/**
 * @param {object} params
 * @param {number} [years]
 * @returns {{incomes: number[], target: number, chanceOfTarget: number,
 *   p10: number, p50: number, p90: number}} incomes sorted from the lowest
 */
function simulateRisk(params, years = RISK_YEARS) {
  const random = seededRandom(RISK_SEED);
  const incomes = [];
  for (let year = 0; year < years; year++) incomes.push(simulateFarm(randomYear(params, random)).netIncome);
  incomes.sort((a, b) => a - b);

  const target = computeIncomeTarget(params);
  const quantile = share => incomes[Math.min(incomes.length - 1, Math.floor(share * incomes.length))];
  return {
    incomes,
    target,
    chanceOfTarget: incomes.filter(income => income >= target).length / incomes.length,
    p10: quantile(0.1),
    p50: quantile(0.5),
    p90: quantile(0.9),
  };
}

/** The params of one random year. */
function randomYear(params, random) {
  const factor = (volatilityPercent, [low, high]) =>
    Math.min(high, Math.max(low, 1 + (volatilityPercent / 100) * normalRandom(random)));
  const yieldFactor = factor(params.riskYieldVolatility, RISK_FACTOR_LIMITS.yield);
  const priceFactor = factor(params.riskPriceVolatility, RISK_FACTOR_LIMITS.price);
  const isBadYear = random() < params.riskBadYearChance / 100;
  const animalFactor =
    factor(params.riskAnimalVolatility, RISK_FACTOR_LIMITS.animalOutput) *
    (isBadYear ? 1 - BAD_YEAR_ANIMAL_OUTPUT_LOSS : 1);
  const costFactor = factor(params.riskCostVolatility, RISK_FACTOR_LIMITS.cost);
  const feedPriceFactor = 1 + Math.max(0, 1 - yieldFactor) * FEED_PRICE_RESPONSE_TO_YIELD;

  const year = { ...params, costMultiplier: costFactor };
  const scale = (ids, by) => ids.forEach(id => (year[id] = params[id] * by));
  scale(CROP_YIELD_PARAMS, yieldFactor);
  scale(PRICE_PARAMS, priceFactor);
  scale(ANIMAL_OUTPUT_PARAMS, animalFactor);
  scale(PURCHASE_PRICE_PARAMS, feedPriceFactor * costFactor);
  return year;
}

/** Deterministic random numbers in [0, 1) from a seed (mulberry32). */
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** A standard normal random number (Box–Muller). */
function normalRandom(random) {
  const u = Math.max(random(), Number.EPSILON);
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
