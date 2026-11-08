// Yearly farm model: from the params it computes land use, feed balance, revenue, costs,
// investments, subsidies, working hours, results per enterprise and the monthly cash flow.
//
// The stages live in model/stages/. Each stage reads the params and what earlier stages
// produced, and adds its own values to one flat `results` object used by every panel.

/**
 * @param {object} inputParams - values of all parameters (see parameters/registry.js)
 * @returns {object} results
 */
function simulateFarm(inputParams) {
  const soilFactors = computeSoilFactors(inputParams);
  const climate = computeClimateFactors(inputParams);
  const grazingPlan = computeGrazingPlan(inputParams);
  const params = adjustForMilkingRoutine(
    adjustForLactationGrain(
      adjustPastureForGrazingPlan(
        adjustYieldsForSoilAndClimate(inputParams, soilFactors, climate),
        grazingPlan
      )
    )
  );
  const results = { soilFactors, climate, grazingPlan };

  const stages = [
    computeLandUse,
    computeHerdStructure,
    computeMilkAndDairyProducts,
    computeGoatMilk,
    computeFlockRenewal,
    computeForageBalance,
    computeGrainBalance,
    computeStrawBalance,
    computeLivestockUnits,
    computeNitrogenBalance,
    computeCarbonBalance,
    computeRevenue,
    computeCosts,
    computeInvestments,
    computeSubsidies,
    computeNetIncome,
    computeLabour,
    computeEnterprises,
    computeMarket,
  ];
  for (const stage of stages) Object.assign(results, stage(params, results));

  results.warnings = collectWarnings(params, inputParams, results);
  results.householdBudget = computeHouseholdBudget(params);
  results.incomeTarget = computeIncomeTarget(params);
  results.cashflow = computeMonthlyCashflow(results, params);
  return results;
}

function adjustYieldsForSoilAndClimate(params, soil, climate) {
  const arable = soil.arable * climate.arable;
  return {
    ...params,
    cerealYield: params.cerealYield * arable,
    strawYield: params.strawYield * arable,
    cloverYield: params.cloverYield * arable,
    rootCropYield: params.rootCropYield * arable,
    pastureYield: params.pastureYield * soil.pasture * climate.pasture,
    meadowYield: params.meadowYield * soil.meadow * climate.meadow,
  };
}

/** Grass eaten per hectare depends on how often the herd moves and how long paddocks rest. */
function adjustPastureForGrazingPlan(params, grazingPlan) {
  return { ...params, pastureYield: params.pastureYield * grazingPlan.yieldFactor };
}

/** Milking once a day (New Zealand style): less milk, much less time in the parlour. */
const ONCE_A_DAY_MILK_FACTOR = 0.8;
const ONCE_A_DAY_HOURS_PER_COW_FACTOR = 0.65;
const ONCE_A_DAY_DAIRY_FIXED_HOURS_FACTOR = 0.6;

function adjustForMilkingRoutine(params) {
  if (!params.onceADayMilking) return params;
  return {
    ...params,
    milkPerCow: params.milkPerCow * ONCE_A_DAY_MILK_FACTOR,
    hoursPerCow: params.hoursPerCow * ONCE_A_DAY_HOURS_PER_COW_FACTOR,
    dairyFixedHours: params.dairyFixedHours * ONCE_A_DAY_DAIRY_FIXED_HOURS_FACTOR,
  };
}

/** Days a cow is milked in a year: about 305; the other 60 or so she is dry before calving. */
const LACTATION_DAYS = 305;
// Grain replaces part of the forage a cow eats: about 0.4 kg of forage dry matter for each kg of
// grain dry matter (substitution rate on pasture and hay, reviews give 0.2–0.6); grain is 87% dry matter.
const GRAIN_FORAGE_SUBSTITUTION = 0.4;
const GRAIN_DRY_MATTER_SHARE = 0.87;

/** Grain fed every day of the lactation on top of the usual ration, t per cow and year. */
function lactationGrainPerCowTonnes(params) {
  return params.dairyGrainAllLactation ? (params.dairyGrainKgPerDay * LACTATION_DAYS) / 1000 : 0;
}

/** Forage dry matter the lactation grain replaces, t per cow and year. */
function forageReplacedByGrainPerCow(params) {
  return lactationGrainPerCowTonnes(params) * GRAIN_DRY_MATTER_SHARE * GRAIN_FORAGE_SUBSTITUTION;
}

/** Grain through the whole lactation: the extra grain joins the ration and adds milk per kg fed. */
function adjustForLactationGrain(params) {
  const grainKg = lactationGrainPerCowTonnes(params) * 1000;
  if (!grainKg) return params;
  return {
    ...params,
    oatsPerCow: params.oatsPerCow + grainKg,
    milkPerCow: params.milkPerCow + grainKg * params.milkPerKgGrain,
  };
}

/** Result before paying the family for its work, without loans and taxes. */
function computeNetIncome(params, results) {
  return { netIncome: results.revenue + results.subsidies - results.costs - results.depreciation };
}
