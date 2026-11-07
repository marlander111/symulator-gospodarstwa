// Parameters of the "pessimistic" group. Labels, units and hints: locales/pl.json → parameters.<id>.

defineParameterGroup('pessimistic', [
  { id: 'pessimisticPriceDrop', min: 0, max: 40, step: 1, defaultValue: 15 },
  { id: 'pessimisticYieldDrop', min: 0, max: 50, step: 1, defaultValue: 17 },
  { id: 'pessimisticAnimalOutputDrop', min: 0, max: 30, step: 1, defaultValue: 10 },
  { id: 'pessimisticExtraHours', min: 0, max: 60, step: 1, defaultValue: 10 },
  { id: 'pessimisticCostIncrease', min: 0, max: 60, step: 1, defaultValue: 10 },
]);
