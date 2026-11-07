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
  const params = adjustYieldsForSoil(inputParams, soilFactors);
  const results = { soilFactors };

  const stages = [
    computeLandUse,
    computeHerdStructure,
    computeForageBalance,
    computeMilkAndCheese,
    computeFlockRenewal,
    computeGrainBalance,
    computeStrawBalance,
    computeLivestockUnits,
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
    pastureYield: params.pastureYield * soilFactors.grassland,
    meadowYield: params.meadowYield * soilFactors.grassland,
  };
}

/** Result before paying the family for its work, without loans and taxes. */
function computeNetIncome(params, results) {
  return { netIncome: results.revenue + results.subsidies - results.costs - results.depreciation };
}
