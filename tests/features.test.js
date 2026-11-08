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
    pigs: 0,
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

const withChoice = (parameterId, option) => ({
  [parameterId]: option,
  ...model.valuesSetByChoice(
    model.PARAMETERS.find(parameter => parameter.id === parameterId),
    option
  ),
});

test('the reference location leaves the yields as set; drier or colder places lower them', () => {
  const reference = model.computeClimateFactors(model.defaultParams());
  assert.deepEqual(
    [reference.arable, reference.pasture, reference.meadow].map(value => +value.toFixed(6)),
    [1, 1, 1]
  );
  const dry = model.computeClimateFactors({ ...model.defaultParams(), location: 'wielkopolska' });
  assert.ok(dry.pasture < 1 && dry.arable < 1);
  const lightSoil = model.computeClimateFactors({
    ...model.defaultParams(),
    location: 'wielkopolska',
    pastureSoilVIShare: 100,
  });
  assert.ok(lightSoil.pasture < dry.pasture, 'light soils suffer more from little rain');
  const mountains = model.computeClimateFactors({ ...model.defaultParams(), location: 'mountains' });
  assert.ok(mountains.seasonDays < reference.seasonDays);
});

test('choosing a location sets the local grazing season', () => {
  for (const location of model.LOCATIONS) {
    const values = withChoice('location', location.id);
    assert.ok(values.grazingDays >= 120 && values.grazingDays <= 240, location.id);
  }
});

test('soil classes are set separately for arable land, pasture and meadow', () => {
  const factors = model.computeSoilFactors({ ...model.defaultParams(), pastureSoilVShare: 100 });
  assert.equal(factors.arable, 1);
  assert.equal(factors.meadow, 1);
  assert.ok(factors.pasture < 1);
});

test('dairy breeds: Holsteins give more milk but need more grain and forage than Jerseys', () => {
  const jersey = simulate(withChoice('dairyBreed', 'extensive'));
  const holstein = simulate(withChoice('dairyBreed', 'intensive'));
  assert.ok(holstein.milkTotal > jersey.milkTotal * 1.5);
  assert.ok(holstein.grainNeedByAnimal.dairyCows > jersey.grainNeedByAnimal.dairyCows * 5);
  assert.ok(holstein.forageNeedByAnimal.dairyCows > jersey.forageNeedByAnimal.dairyCows);
});

test('curd making skims the cream; butter and buttermilk come from the cream', () => {
  const results = simulate({ curdShare: 40, butterShare: 50, cheeseShare: 20 });
  assert.ok(results.curdKg > 0 && results.creamKg > 0 && results.butterKg > 0);
  assert.ok(Math.abs(results.butterKg - results.creamKg * 0.5 * 0.45) < 1e-9);
  assert.ok(results.milkForCheese + results.milkForCurd <= results.milkUsed + 1e-9);
  const capped = simulate({ cheeseShare: 80, curdShare: 80 });
  assert.ok(capped.milkForCheese + capped.milkForCurd <= capped.milkUsed + 1e-9, 'at most all the milk');
});

test('beef systems: housed finishing needs grain, outdoors all year needs little straw and shed', () => {
  const base = { dairyCows: 0, sucklerCows: 8, weanersSoldShare: 0 };
  const housed = simulate({ ...base, beefSystem: 'housedFinishing' });
  const outdoor = simulate({ ...base, beefSystem: 'outdoorYearRound' });
  assert.ok(housed.grainNeedByAnimal.beefCattle > 0);
  assert.equal(outdoor.grainNeedByAnimal.beefCattle, 0);
  assert.ok(outdoor.strawNeedByAnimal.beefCattle < housed.strawNeedByAnimal.beefCattle / 3);
  assert.ok(outdoor.cattleShedPlaces < housed.cattleShedPlaces);
});

test('the household takes its food first, more with more children, nothing when switched off', () => {
  const none = simulate({ homeUseFromFarm: false });
  const three = simulate({ householdChildren: 3 });
  const ten = simulate({ householdChildren: 10 });
  assert.equal(none.homeUseTotal, 0);
  assert.ok(ten.homeUseTotal > three.homeUseTotal);
  assert.ok(none.eggsSold > three.eggsSold && three.eggsSold > ten.eggsSold);
  assert.ok(none.revenue > three.revenue);
});

test('feed bought on purpose is a cost and leaves no shortage on the fields', () => {
  const grown = simulate({});
  const bought = simulate({ boughtForageShare: 50, boughtConcentrateShare: 50 });
  assert.ok(bought.boughtForageTonnes > 0 && bought.boughtGrainTonnes > 0);
  assert.ok(bought.hayBalance > grown.hayBalance);
  assert.ok(bought.costItems.purchases > grown.costItems.purchases);
});

test('infrastructure the farm already has costs nothing; other investments stay at the end', () => {
  const tractor = model.ownedParameterId('tractor');
  const without = simulate({});
  const owned = simulate({ [tractor]: true });
  assert.ok(without.infrastructure.some(item => item.id === 'tractor' && !item.owned));
  assert.ok(owned.capex < without.capex);
  assert.ok(!owned.investmentItems.some(item => item.id === 'tractor'));
  assert.equal(owned.investmentItems.at(-1).id, 'other');
  const gardenOnly = simulate({
    dairyCows: 0,
    layingHens: 40,
    geese: 0,
    pastureHa: 0,
    meadowHa: 0,
    ownedHa: 4,
    farmyardHa: 4,
  });
  assert.ok(!gardenOnly.infrastructure.some(item => item.id === 'tractor'), 'a garden needs no tractor');
});

test('guardian dogs eat the unsold kids first and the rest is bought', () => {
  const results = simulate({ goats: 6, kidsSoldShare: 50, guardDogs: 1, dogMeatKgPerMonth: 20 });
  assert.ok(results.dogs.ownMeatKg > 0);
  assert.ok(Math.abs(results.dogs.ownMeatKg + results.dogs.boughtKg - 240) < 1e-9);
  const bought = simulate({ goats: 6, guardDogs: 1, dogsFedOwnMeat: false });
  assert.equal(bought.dogs.ownMeatKg, 0);
  assert.ok(bought.costItems.guardDogs > results.costItems.guardDogs);
});

test('pigs, goat milk and riding bring revenue of their own', () => {
  const results = simulate({ pigs: 6, goats: 8, goatMilking: true, horses: 2, ridesPerYear: 100 });
  assert.ok(results.revenueItems.pigs > 0);
  assert.ok(results.revenueItems.goatMilk + results.revenueItems.goatCheese > 0);
  assert.equal(results.revenueItems.horseRiding, 100 * model.defaultParams().ridePricePerHour);
  assert.ok(results.slaughter.trips.pigs > 0);
});

test('the start-up years grow towards full operation in year 4', () => {
  const years = model.simulateStartupYears(model.defaultParams());
  assert.equal(years.length, 4);
  const incomes = years.map(year => year.results.netIncome);
  assert.ok(incomes[0] < incomes[1] && incomes[1] < incomes[2] && incomes[2] < incomes[3]);
  assert.ok(Math.abs(incomes[3] - model.simulateFarm(model.defaultParams()).netIncome) < 1e-6);
});

test('an average day splits the month’s hours into morning, day and evening', () => {
  const params = model.defaultParams();
  const results = model.simulateFarm(params);
  const june = model.dailyHoursByTimeOfDay(results.hoursByActivity, 5, params);
  const juneHours = results.monthlyHours[5].total;
  assert.ok(Math.abs(june.total * 30 - juneHours) < 1e-6);
  assert.ok(june.byTime.morning > 0 && june.byTime.evening > 0);
  const onceADay = model.dailyHoursByTimeOfDay(results.hoursByActivity, 5, {
    ...params,
    onceADayMilking: true,
  });
  assert.ok(onceADay.activities.evening.dairyCows === undefined);
});

test('the finance export lists both scenarios, the cash flow and the start-up years', () => {
  const data = model.buildFinanceExport(model.defaultParams(), 'test');
  assert.equal(data.format, 'farm-simulator-finance');
  assert.equal(data.monthlyCashflow.length, 12);
  assert.equal(data.startupYears.length, 4);
  assert.ok(data.scenarios.pessimistic.netIncome < data.scenarios.realistic.netIncome);
  const sumLines = lines => lines.reduce((sum, line) => sum + line.amount, 0);
  assert.ok(
    Math.abs(sumLines(data.scenarios.realistic.revenueLines) - data.scenarios.realistic.revenue) <= 30
  );
  assert.doesNotThrow(() => JSON.stringify(data));
});

test('settings from version 2 move to the merged pig count and per-land-use soil classes', () => {
  const migrated = model.migrateLegacyParameterIds({ pigsForHome: 3, pigsForSale: 4, soilClassVShare: 40 });
  assert.equal(migrated.pigs, 7);
  assert.equal(migrated.pastureSoilVShare, 40);
  assert.equal(migrated.arableSoilVShare, 40);
  assert.ok(!('pigsForHome' in migrated) && !('soilClassVShare' in migrated));
  const untouched = model.migrateLegacyParameterIds({ pigsForHome: 2, pigsForSale: 0, soilClassVShare: 20 });
  assert.equal(untouched.pigs, 0, 'the old default of two household pigs is dropped');
  assert.equal(untouched.meadowSoilVShare, 0);
  assert.equal(model.migrateChangedDefaults({ ownedHa: 14, layingHens: 200 }, 2).layingHens, 50);
});

test('pigs and goats on paddocks of their own take a part of the pasture from the herd', () => {
  const base = {
    pastureHa: 6,
    sheep: 10,
    goats: 12,
    pigs: 6,
    goatsPerHaOfPaddock: 12,
    pigsPerHaOfPaddock: 12,
  };
  const together = simulate(base);
  assert.equal(together.paddocks.herdHa, 6, 'pigs off the pasture and goats with the sheep leave it whole');

  const apart = simulate({ ...base, goatGrazing: 'separate', pigsOnPasture: true });
  assert.ok(Math.abs(apart.paddocks.goatHa - 1) < 1e-9);
  assert.ok(Math.abs(apart.paddocks.pigHa - 0.5) < 1e-9);
  assert.ok(Math.abs(apart.paddocks.herdHa - 4.5) < 1e-9);
  assert.ok(apart.grazingPlan.paddockHa < together.grazingPlan.paddockHa, 'herd paddocks get smaller');
  assert.ok(apart.warnings.some(warning => warning.key === 'pigPaddocksOnPasture'));

  const crowded = simulate({
    ...base,
    goatGrazing: 'separate',
    pigsOnPasture: true,
    pastureHa: 3,
    goatsPerHaOfPaddock: 4,
    pigsPerHaOfPaddock: 4,
  });
  assert.ok(Math.abs(crowded.paddocks.pigHa + crowded.paddocks.goatHa - 3) < 1e-9, 'shrunk to the pasture');
  assert.equal(crowded.paddocks.herdHa, 0);
  assert.ok(crowded.warnings.some(warning => warning.key === 'ownPaddocksTooBig'));

  const smallPaddock = simulate({ ...base, goatGrazing: 'separate', goatsPerHaOfPaddock: 25 });
  const roomyPaddock = simulate({ ...base, goatGrazing: 'separate', goatsPerHaOfPaddock: 6 });
  assert.ok(
    smallPaddock.ownPaddocks.deficit > roomyPaddock.ownPaddocks.deficit,
    'a cramped paddock needs hay'
  );
});

test('the renamed reference location is carried over from saved settings', () => {
  assert.equal(
    model.migrateLegacyParameterIds({ location: 'boleslawiecJeleniaGora' }).location,
    'sudetenForeland'
  );
  assert.equal(model.migrateLegacyParameterIds({ location: 'mazovia' }).location, 'mazovia');
  assert.equal(model.LOCATIONS.length, 14);
});

test('grain through the whole lactation adds milk and grain and saves a little forage', () => {
  const base = { dairyCows: 4, dairyGrainKgPerDay: 3, milkPerKgGrain: 1 };
  const grass = simulate(base);
  const grain = simulate({ ...base, dairyGrainAllLactation: true });
  const lactationGrainKg = 3 * 305; // kg per cow: 3 kg a day for 305 days of milking
  assert.ok(Math.abs(grain.milkTotal - grass.milkTotal - 4 * lactationGrainKg) < 1e-6);
  assert.ok(
    Math.abs(
      grain.grainNeedByAnimal.dairyCows - grass.grainNeedByAnimal.dairyCows - (4 * lactationGrainKg) / 1000
    ) < 1e-9
  );
  assert.ok(
    grain.forageNeedByAnimal.dairyCows < grass.forageNeedByAnimal.dairyCows,
    'grain replaces some forage'
  );
  assert.ok(grain.warnings.some(warning => warning.key === 'lactationGrain'));
  assert.ok(!grass.warnings.some(warning => warning.key === 'lactationGrain'));
});
