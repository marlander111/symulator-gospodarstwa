// Area, organic, animal, welfare, ONW and eco-scheme payments.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Subsidies ----------

function computeSubsidies(params, results) {
  const { farmedHa, grasslandHa, usableArableHa, orchardHa, livestockUnitsPerHa, sucklerCows } = results;
  const rates = SUBSIDY_RATES;
  const subsidyItems = {
    basicPayment: rates.basicPayment * farmedHa,
    redistributive: rates.redistributive * Math.min(farmedHa, 30),
    dairyCows: rates.dairyCows * (params.dairyCows + sucklerCows),
    beefCattle:
      rates.beefCattle * Math.floor(results.replacementHeifers + results.finishers + results.beefHeifers),
    sheep: params.sheep >= 10 ? rates.sheep * params.sheep : 0,
    goats: params.goats >= 5 ? rates.goats * params.goats : 0,
    organic: params.organicPayment
      ? rates.organicGrassland * grasslandHa +
        rates.organicArable * usableArableHa +
        rates.organicOrchard * orchardHa +
        rates.organicVegetables * params.marketGardenHa
      : 0,
    livestockBonus:
      params.organicPayment &&
      params.livestockDensityBonus &&
      livestockUnitsPerHa >= 0.5 &&
      livestockUnitsPerHa <= 1.5
        ? rates.livestockBonus * farmedHa
        : 0,
    extensiveGrassland: params.extensiveGrasslandScheme ? rates.extensiveGrasslandScheme * grasslandHa : 0,
    carbonFarming: 0,
    youngFarmer: params.youngFarmerEligible ? rates.youngFarmer * farmedHa : 0,
    lessFavouredArea: params.lessFavouredAreaRate * farmedHa,
    animalWelfare:
      params.otherWelfarePayments +
      (params.welfareCowsGrazing
        ? params.dairyCows * (rates.welfareCowGrazing + rates.welfareCowBedding)
        : 0) +
      (params.welfareCowsSpace ? params.dairyCows * rates.welfareCowSpace : 0) +
      (params.welfareSheepGoats ? params.sheep * rates.welfareEwe + params.goats * rates.welfareGoat : 0) +
      (params.welfareHens ? params.layingHens * rates.welfareHen : 0),
  };

  const carbonFarming = computeCarbonFarmingPoints(params, results);
  if (carbonFarming.qualifies)
    subsidyItems.carbonFarming =
      (carbonFarming.catchCropPoints + carbonFarming.manurePoints + carbonFarming.diversityPoints) *
      params.ecoSchemePointValue;
  // extensive grassland is paid only together with the carbon farming scheme
  else if (params.extensiveGrasslandScheme) subsidyItems.extensiveGrassland = 0;

  return { subsidyItems, carbonFarming, subsidies: sumValues(subsidyItems) };
}

/** Eco-scheme "carbon farming": points earned against the minimum (25% of farmed land × 5). */
function computeCarbonFarmingPoints(params, results) {
  const { catchCropHa, undersownHa, rotation, fieldHa } = results;
  const rules = CARBON_FARMING;
  const catchCropPoints = (catchCropHa + undersownHa) * rules.catchCropPointsPerHa;
  const manurePoints = params.carbonManure ? rotation.manuredFields * fieldHa * rules.manurePointsPerHa : 0;
  const diversityPoints =
    params.carbonCropDiversity && rotation.diversityOk
      ? results.usableArableHa * rules.cropDiversityPointsPerHa
      : 0;
  const extensivePoints = params.extensiveGrasslandScheme
    ? results.grasslandHa * rules.extensiveGrasslandPointsPerHa
    : 0;
  const requiredPoints = rules.minimumShareOfFarmedArea * results.farmedHa * rules.catchCropPointsPerHa;
  const totalPoints = catchCropPoints + manurePoints + diversityPoints + extensivePoints;
  return {
    catchCropPoints,
    manurePoints,
    diversityPoints,
    extensivePoints,
    requiredPoints,
    totalPoints,
    qualifies: totalPoints >= requiredPoints,
  };
}
