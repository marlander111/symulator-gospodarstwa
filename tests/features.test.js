// Tests of the customer count, nitrogen balance, bale grazing, risk, farm retail tax, grazing plan
// and the migration of changed defaults. Run `python3 build.py` first.

const assert = require('node:assert/strict');
const { test } = require('node:test');
const model = require('../build/model.js');

const MONTHS_IN_YEAR = 12;
const RETAIL_TAX_FREE_LIMIT = 100000;
const RETAIL_FLAT_TAX_RATE = 0.02;

const simulate = changes => model.simulateFarm({ ...model.defaultParams(), ...changes });

test('customers are counted from household sales and the monthly spend of a family', () => {
  const params = model.defaultParams();
  const { market } = model.simulateFarm(params);
  assert.ok(market.householdSales > 0);
  const expectedFamilies = market.householdSales / (params.loyalCustomerSpendPerMonth * MONTHS_IN_YEAR);
  assert.ok(Math.abs(market.loyalFamilies - expectedFamilies) < 1e-9);
  assert.ok(
    market.occasionalCustomers > market.loyalFamilies * 5,
    'one-product customers need many more people'
  );

  const biggerBaskets = simulate({ loyalCustomerSpendPerMonth: params.loyalCustomerSpendPerMonth * 2 });
  assert.ok(Math.abs(biggerBaskets.market.loyalFamilies * 2 - market.loyalFamilies) < 1e-9);
});

test('household sales leave out grain sold to buyers', () => {
  const noAnimals = simulate({
    dairyCows: 0,
    layingHens: 0,
    sheep: 0,
    goats: 0,
    geese: 0,
    pigsForHome: 0,
    pastureHa: 0,
    meadowHa: 0,
    cerealShare: 100,
  });
  assert.ok(noAnimals.grainSoldTonnes > 0);
  assert.ok(noAnimals.market.householdSales < noAnimals.revenue - noAnimals.revenueItems.grainSales + 1);
});

test('the default farm stays below the manure nitrogen limit', () => {
  const { nitrogen } = model.simulateFarm(model.defaultParams());
  assert.ok(nitrogen.perFarmedHa > 0 && nitrogen.perFarmedHa < nitrogen.limitPerHa);
  const parts = nitrogen.onPasture + nitrogen.onBaleGrazing + nitrogen.inManure;
  assert.ok(Math.abs(parts - nitrogen.total) < 1e-6, 'nitrogen is split without loss');
});

test('too many animals on the land raise the nitrogen warning', () => {
  const crowded = simulate({
    ownedHa: 4,
    leasedHa: 0,
    pastureHa: 1.5,
    meadowHa: 0.5,
    layingHens: 2000,
    dairyCows: 6,
  });
  assert.ok(crowded.nitrogen.perFarmedHa > crowded.nitrogen.limitPerHa);
  assert.ok(crowded.warnings.some(warning => warning.key === 'nitrogenOverLimit'));
});

test('bale grazing leaves manure in the field: less to haul, fewer hours, a little more hay', () => {
  const inSheds = simulate({ baleGrazing: false });
  const onBales = simulate({ baleGrazing: true });
  assert.equal(inSheds.nitrogen.onBaleGrazing, 0);
  assert.ok(onBales.nitrogen.onBaleGrazing > 0);
  assert.ok(onBales.nitrogen.manureTonnes < inSheds.nitrogen.manureTonnes);
  assert.ok(onBales.totalHours < inSheds.totalHours);
  assert.ok(onBales.hayNeed > inSheds.hayNeed, 'trampled hay is part of the need');
  assert.ok(onBales.strawNeed < inSheds.strawNeed, 'less bedding');
});

test('the risk simulation is repeatable and its quantiles are ordered', () => {
  const params = model.defaultParams();
  const first = model.simulateRisk(params, 200);
  const second = model.simulateRisk(params, 200);
  assert.deepEqual(first, second);
  assert.equal(first.incomes.length, 200);
  assert.ok(first.p10 <= first.p50 && first.p50 <= first.p90);
  assert.ok(first.chanceOfTarget >= 0 && first.chanceOfTarget <= 1);
  assert.ok(first.incomes.every(Number.isFinite));
});

test('more variable years spread the income more widely', () => {
  const params = model.defaultParams();
  const calm = model.simulateRisk({ ...params, riskYieldVolatility: 5, riskPriceVolatility: 3 }, 200);
  const rough = model.simulateRisk({ ...params, riskYieldVolatility: 25, riskPriceVolatility: 15 }, 200);
  assert.ok(rough.p90 - rough.p10 > calm.p90 - calm.p10);
});

test('without volatility every random year equals the realistic result', () => {
  const params = {
    ...model.defaultParams(),
    riskYieldVolatility: 0,
    riskPriceVolatility: 0,
    riskAnimalVolatility: 0,
    riskCostVolatility: 0,
    riskBadYearChance: 0,
  };
  const realistic = model.simulateFarm(params).netIncome;
  const risk = model.simulateRisk(params, 20);
  for (const income of risk.incomes) assert.ok(Math.abs(income - realistic) < 1e-6);
});

test('farm retail is tax-free up to 100,000 PLN and taxed at 2% above', () => {
  const small = model.simulateFarm(model.defaultParams());
  assert.ok(small.retailSalesRevenue < RETAIL_TAX_FREE_LIMIT);
  assert.equal(small.costItems.retailTax, 0);

  const large = simulate({ dairyCows: 8, cheeseShare: 90, geese: 120, geeseProcessedShare: 80 });
  assert.ok(large.retailSalesRevenue > RETAIL_TAX_FREE_LIMIT, `retail ${large.retailSalesRevenue}`);
  const expectedTax = (large.retailSalesRevenue - RETAIL_TAX_FREE_LIMIT) * RETAIL_FLAT_TAX_RATE;
  assert.ok(Math.abs(large.costItems.retailTax - expectedTax) < 1e-6);
});

test('the grazing plan gives more paddocks for longer rests and less frequent moves for fewer', () => {
  const params = model.defaultParams();
  const plan = rest =>
    model.computeGrazingPlan({ ...params, grazingMoveIntervalDays: 1, pastureRestDays: rest });
  assert.ok(plan(60).paddockCount > plan(30).paddockCount);
  const weekly = model.computeGrazingPlan({ ...params, grazingMoveIntervalDays: 7, pastureRestDays: 35 });
  assert.equal(weekly.paddockCount, 6);
  assert.ok(weekly.yieldFactor < plan(35).yieldFactor, 'weekly moves waste more grass');
  assert.ok(weekly.extraMoveHours < 0, 'fewer moves than the daily baseline');
});

test('old defaults saved in the browser are replaced, values the user changed are kept', () => {
  const saved = { fullTimeWorkers: 2, householdMonthlySpending: 6200, energyCosts: 2500 };
  const migrated = model.migrateChangedDefaults(saved, 1);
  assert.equal(migrated.fullTimeWorkers, 1);
  assert.equal(migrated.householdMonthlySpending, 6200);
  assert.equal(migrated.energyCosts, 3500);
  assert.deepEqual(model.migrateChangedDefaults(saved, model.DEFAULTS_VERSION), saved);
});
