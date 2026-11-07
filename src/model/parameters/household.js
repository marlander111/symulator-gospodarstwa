// Parameters of the "household" group. Labels, units and hints: locales/pl.json → parameters.<id>.

defineParameterGroup('household', [
  { id: 'targetFromHouseholdBudget', type: 'boolean', defaultValue: false },
  { id: 'householdMonthlySpending', min: 2000, max: 15000, step: 100, defaultValue: 5100 },
  { id: 'householdSafetyMargin', min: 0, max: 50, step: 5, defaultValue: 20 },
  { id: 'householdSavings', min: 0, max: 40000, step: 1000, defaultValue: 10000 },
  { id: 'openingCash', min: 0, max: 200000, step: 1000, defaultValue: 20000 },
  { id: 'childBenefitChildren', min: 0, max: 8, step: 1, defaultValue: 3 },
]);
