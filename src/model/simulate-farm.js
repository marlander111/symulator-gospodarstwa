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
  const grazingPlan = computeGrazingPlan(inputParams);
  const params = adjustForMilkingRoutine(
    adjustPastureForGrazingPlan(adjustYieldsForSoil(inputParams, soilFactors), grazingPlan)
  );
  const results = { soilFactors, grazingPlan };

  const stages = [
    computeLandUse,
    computeHerdStructure,
    computeForageBalance,
    computeMilkAndCheese,
    computeFlockRenewal,
    computeGrainBalance,
    computeStrawBalance,
    computeLivestockUnits,
    computeNitrogenBalance,
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

function adjustYieldsForSoil(params, soilFactors) {
  return {
    ...params,
    cerealYield: params.cerealYield * soilFactors.arable,
    strawYield: params.strawYield * soilFactors.arable,
    cloverYield: params.cloverYield * soilFactors.arable,
    rootCropYield: params.rootCropYield * soilFactors.arable,
    pastureYield: params.pastureYield * soilFactors.grassland,
    meadowYield: params.meadowYield * soilFactors.grassland,
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

/** Result before paying the family for its work, without loans and taxes. */
function computeNetIncome(params, results) {
  return { netIncome: results.revenue + results.subsidies - results.costs - results.depreciation };
}
