// Parameters of the "pessimistic" group. Labels, units and hints: locales → parameters.<id>.

defineParameterGroup('pessimistic', [
  { id: 'pessimisticPriceDrop', min: 0, max: 40, step: 1, defaultValue: 15 },
  { id: 'pessimisticYieldDrop', min: 0, max: 50, step: 1, defaultValue: 20 },
  { id: 'pessimisticAnimalOutputDrop', min: 0, max: 30, step: 1, defaultValue: 10 },
  { id: 'pessimisticExtraHours', min: 0, max: 60, step: 1, defaultValue: 10 },
  { id: 'pessimisticCostIncrease', min: 0, max: 60, step: 1, defaultValue: 10 },
  { id: 'riskYieldVolatility', min: 0, max: 30, step: 1, defaultValue: 15 },
  { id: 'riskPriceVolatility', min: 0, max: 25, step: 1, defaultValue: 10 },
  { id: 'riskAnimalVolatility', min: 0, max: 20, step: 1, defaultValue: 7, advanced: true },
  { id: 'riskCostVolatility', min: 0, max: 20, step: 1, defaultValue: 7, advanced: true },
  { id: 'riskBadYearChance', min: 0, max: 25, step: 1, defaultValue: 5 },
]);
