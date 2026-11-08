// Warnings and hints about the current plan. Each warning has a level ("bad", "warn", "info"),
// a key of its text in locales → warnings, and the values for the text's placeholders.

/**
 * @param {object} params - params after soil adjustment
 * @param {object} inputParams - params as set by the user
 * @param {object} results - results computed so far
 * @returns {{level: string, key: string, values?: object}[]}
 */
function collectWarnings(params, inputParams, results) {
  const warnings = [];
  const add = (level, key, values) => warnings.push({ level, key, values });

  addLandAndFeedWarnings(params, results, add);
  addStockingWarnings(params, results, add);
  addLabourWarnings(params, results, add);
  addSalesWarnings(params, results, add);
  addEcoSchemeWarnings(params, results, add);
  addGrazingAndRotationWarnings(params, results, add);
  addOtherWarnings(params, inputParams, results, add);
  return warnings;
}

/** Land allocated beyond the farm, feed shortages and surpluses. */
function addLandAndFeedWarnings(params, results, add) {
  const number = formatNumber;
  const { grainBalance, hayBalance, strawBalance } = results;
  const grainPerHen = (params.henFeedGramsPerDay / 1e6) * 365 * 0.9 * (1 - params.rangeFeedSaving / 100);

  if (results.arableHa < -0.001) add('bad', 'landOverAllocated', { hectares: number(-results.arableHa, 1) });
  if (params.orchardHa + params.kitchenGardenHa > params.farmyardHa + 0.001)
    add('bad', 'gardenExceedsFarmyard');
  if (grainBalance < -0.05)
    add('bad', 'grainShortage', {
      tonnes: number(-grainBalance, 1),
      cerealHa: number(-grainBalance / params.cerealYield, 1),
      arableHa: number(-grainBalance / params.cerealYield / (params.cerealShare / 100), 1),
      hens: number(-grainBalance / grainPerHen, 0),
    });
  if (hayBalance < -0.05)
    add('bad', 'hayShortage', {
      tonnes: number(-hayBalance, 1),
      meadowHa: number(-hayBalance / (params.meadowYield * 0.75), 1),
    });
  if (strawBalance < -0.05) add('warn', 'strawShortage', { tonnes: number(-strawBalance, 1) });
  if (results.sawdustTonnes > 0.05)
    add('info', 'sawdustReplacesStraw', {
      tonnes: number(results.sawdustTonnes, 1),
      cubicMetres: number(results.sawdustTonnes / 0.22, 0),
      cost: number(results.sawdustTonnes * params.sawdustPrice, 0),
    });
  if (results.grainSoldTonnes > 0.05)
    add('info', results.grainNeed < 0.05 ? 'grainSoldAll' : 'grainSold', {
      tonnes: number(results.grainSoldTonnes, 1),
      price: number(params.grainSalePrice, 0),
      revenue: number(results.revenueItems.grainSales, 0),
      reserve: number(params.feedReserveShare, 0),
    });
  // grain kept as the reserve after a sale is not a surplus to use up
  else if (grainBalance > 2)
    add('info', 'grainSurplus', {
      tonnes: number(grainBalance, 1),
      hens: number(grainBalance / grainPerHen, 0),
    });
  if (hayBalance > 8) add('info', 'haySurplus', { tonnes: number(hayBalance, 1) });
}

/** Livestock units per hectare outside the subsidy range or too many on grassland. */
function addStockingWarnings(params, results, add) {
  const number = formatNumber;
  const density = results.livestockUnitsPerHa;
  if (params.organicPayment && params.livestockDensityBonus && (density < 0.5 || density > 1.5))
    add('warn', 'stockingOutsideBonusRange', { density: number(density, 2) });
  if (results.grasslandStocking > 2) add('warn', 'grasslandOverstocked');
}

/** Too few or too many hours for the family, peak months and the weekly limit. */
function addLabourWarnings(params, results, add) {
  const number = formatNumber;
  const { labourUtilisation, totalHours, availableHours } = results;

  if (labourUtilisation > 1)
    add('bad', 'notEnoughHours', {
      needed: number(totalHours, 0),
      available: number(availableHours, 0),
      missing: number(totalHours - availableHours, 0),
    });
  else if (labourUtilisation > 0.85)
    add('warn', 'littleSpareTime', { percent: number(labourUtilisation * 100, 0) });
  else if (labourUtilisation < 0.5)
    add('info', 'muchSpareTime', {
      percent: number(labourUtilisation * 100, 0),
      needed: number(totalHours, 0),
      available: number(availableHours, 0),
    });
  if (availableHours > 0 && results.peakMonthHours > (availableHours / 12) * 1.3)
    add('warn', 'peakMonthOverload', {
      peak: number(results.peakMonthHours, 0),
      monthly: number(availableHours / 12, 0),
    });
  if (results.weeklyHoursPeak > params.weeklyHoursLimit)
    add('warn', 'weeklyLimitExceeded', {
      peak: number(results.weeklyHoursPeak, 0),
      limit: number(params.weeklyHoursLimit, 0),
    });
}

/** Sales volumes, tax thresholds and rules for particular species. */
function addSalesWarnings(params, results, add) {
  const number = formatNumber;
  if (results.market.eggsPerWeek > 500)
    add('info', 'manyEggsToSell', { boxes: number(results.market.eggsPerWeek / 10, 0) });
  if (results.costItems.retailTax > 0)
    add('info', 'directSalesTaxThreshold', { tax: number(results.costItems.retailTax, 0) });
  if (params.turkeys > 0 && params.layingHens + params.broilers > 0) add('warn', 'turkeysWithHens');
  if (results.parcels > 0) add('info', 'parcelsSeason', { parcels: number(results.parcels, 0) });
  if (results.lambsSoldAsMeat > 0) {
    const meatIncomePerLamb =
      results.lambCarcassKg * params.lambMeatPricePerKg -
      params.lambSlaughterCost -
      results.lambCarcassKg * params.butcheryCostPerKg -
      (results.slaughter.kmBySpecies.sheep * params.trailerCostPerKm) / results.lambsSoldAsMeat;
    if (meatIncomePerLamb < params.lambLivePrice)
      add('info', 'lambMeatLessThanLive', {
        meat: number(meatIncomePerLamb, 0),
        live: number(params.lambLivePrice, 0),
      });
  }
  if (params.sheep > 0 && params.sheep < 10) add('info', 'sheepPaymentMinimum');
  if (params.goats > 0 && params.goats < 5) add('info', 'goatPaymentMinimum');
  if (params.ownHatching && results.cockerels > 0)
    add('info', 'ownHatching', {
      chicks: number(results.chicks, 0),
      cockerels: number(results.cockerels, 0),
    });
}

/** Eco-scheme practices chosen but not meeting their conditions. */
function addEcoSchemeWarnings(params, results, add) {
  const number = formatNumber;
  const carbon = results.carbonFarming;
  if ((params.catchCrops || params.carbonManure || params.carbonCropDiversity) && !carbon.qualifies)
    add('warn', 'carbonFarmingBelowMinimum', {
      points: number(carbon.totalPoints, 1),
      required: number(carbon.requiredPoints, 1),
    });
  if (params.carbonCropDiversity && !results.rotation.diversityOk)
    add('info', 'cropDiversityNotMet', {
      cerealPercent: Math.round(results.rotation.cerealShare * 100),
      crops: results.rotation.distinctCrops,
    });
}

/** Paddocks resting too short, root crops that do not fit the rotation, too much manure nitrogen. */
function addGrazingAndRotationWarnings(params, results, add) {
  const { grazingPlan } = results;
  const grazesPasture =
    params.pastureHa > 0 && params.dairyCows + params.sucklerCows + params.sheep + params.goats > 0;
  if (grazesPasture && grazingPlan.restDays < 25)
    add('warn', 'shortPastureRest', { days: grazingPlan.restDays });
  if (params.rootCrops && !results.rotation.rootCropsFit) add('info', 'rootCropsNoRoom');
  const { nitrogen } = results;
  if (nitrogen.perFarmedHa > nitrogen.limitPerHa)
    add('bad', 'nitrogenOverLimit', {
      perHa: formatNumber(nitrogen.perFarmedHa, 0),
      limit: nitrogen.limitPerHa,
    });
}

/** Pig paddocks on or off the pasture, and paddocks of their own that do not fit on it. */
function addOwnPaddockWarnings(params, paddocks, add) {
  if (params.pigs > 0 && params.pigsOnPasture)
    add('info', 'pigPaddocksOnPasture', { hectares: formatNumber(paddocks.pigHa, 2) });
  else if (params.pigs > 0)
    add('info', 'pigPaddocks', { hectares: formatNumber(params.pigs / params.pigsPerHaOfPaddock, 1) });
  if (paddocks.wantedHa > params.pastureHa && paddocks.wantedHa > 0)
    add('warn', 'ownPaddocksTooBig', {
      wanted: formatNumber(paddocks.wantedHa, 1),
      pasture: formatNumber(params.pastureHa, 1),
    });
}

/** Disease rules, breeding, guardian dogs and soil class shares. */
function addOtherWarnings(params, inputParams, results, add) {
  if (params.pigs > 0) add('info', 'africanSwineFever');
  addOwnPaddockWarnings(params, results.paddocks, add);
  if (params.dairyCows > 0 && params.dairyGrainAllLactation) {
    const grainTonnes = params.dairyCows * lactationGrainPerCowTonnes(params);
    const milkFactor = params.onceADayMilking ? ONCE_A_DAY_MILK_FACTOR : 1;
    add('info', 'lactationGrain', {
      grain: formatNumber(grainTonnes, 1),
      milk: formatNumber(grainTonnes * 1000 * params.milkPerKgGrain * milkFactor, 0),
    });
  }
  if (results.sucklerCows > 0 && !params.ownBull) add('info', 'sucklerCowsNeedBull');
  if (params.ridesPerYear > 0 && params.horses > 0) add('info', 'ridingIsABusiness');
  if (params.guardDogs > 0 && results.dogs.boughtKg > 1)
    add('info', 'dogFoodBought', { kg: formatNumber(results.dogs.boughtKg, 0) });
  if (params.sheep + params.goats > 0 && params.guardDogs === 0) add('info', 'wolvesNoDogs');
  for (const landUse of SOIL_LAND_USES) {
    const total = sumBy(
      SOIL_CLASSES_WITH_SHARE,
      soilClass => inputParams[soilShareId(landUse, soilClass)] || 0
    );
    if (total > 100) add('warn', 'soilSharesOver100' + landUse.charAt(0).toUpperCase() + landUse.slice(1));
  }
}
