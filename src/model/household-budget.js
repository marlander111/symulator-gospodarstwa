// Household budget: how much the farm has to earn net to cover the family's needs.

/**
 * @param {object} params
 * @returns {{spending: number, margin: number, savings: number, childBenefit: number,
 *            required: number, withoutChildBenefit: number}} yearly amounts in PLN
 */
function computeHouseholdBudget(params) {
  const spending = params.householdMonthlySpending * 12;
  const margin = (spending * params.householdSafetyMargin) / 100;
  const savings = params.householdSavings;
  const childBenefit = params.childBenefitChildren * CHILD_BENEFIT_PER_MONTH * 12;
  const withoutChildBenefit = spending + margin + savings;

  return {
    spending,
    margin,
    savings,
    childBenefit,
    required: Math.max(0, withoutChildBenefit - childBenefit),
    withoutChildBenefit,
  };
}

/** Net income the pessimistic scenario has to reach: from the household budget or set directly. */
function computeIncomeTarget(params) {
  return params.targetFromHouseholdBudget ? computeHouseholdBudget(params).required : params.minimumNetIncome;
}
