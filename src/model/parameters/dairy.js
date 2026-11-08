// Parameters of the "dairy" group. Labels, units and hints: locales → parameters.<id>.

defineParameterGroup('dairy', [
  {
    id: 'dairyBreed',
    type: 'choice',
    options: DAIRY_BREED_IDS,
    defaultValue: 'extensive',
    sets: DAIRY_BREEDS,
  },
  { id: 'dairyCows', min: 0, max: 20, step: 1, defaultValue: 4 },
  { id: 'milkPerCow', min: 2500, max: 8500, step: 100, defaultValue: 3700 },
  { id: 'onceADayMilking', type: 'boolean', defaultValue: false },
  { id: 'milkUsedShare', min: 60, max: 98, step: 1, defaultValue: 88 },
  { id: 'milkPrice', min: 2, max: 10, step: 0.25, defaultValue: 5 },
  // dairy products: aged cheese, curd cheese with the cream skimmed off, butter, by-products
  { id: 'cheeseShare', min: 0, max: 80, step: 5, defaultValue: 20 },
  { id: 'cheesePrice', min: 40, max: 160, step: 5, defaultValue: 80 },
  { id: 'cheeseYield', min: 8, max: 13, step: 0.5, defaultValue: 11, advanced: true },
  { id: 'curdShare', min: 0, max: 80, step: 5, defaultValue: 0 },
  { id: 'curdPrice', min: 15, max: 60, step: 1, defaultValue: 30 },
  { id: 'curdYield', min: 10, max: 20, step: 0.5, defaultValue: 15, advanced: true },
  { id: 'creamYield', min: 3, max: 14, step: 0.5, defaultValue: 10, advanced: true },
  { id: 'creamPrice', min: 15, max: 60, step: 1, defaultValue: 30 },
  { id: 'butterShare', min: 0, max: 100, step: 5, defaultValue: 50 },
  { id: 'butterPrice', min: 40, max: 160, step: 5, defaultValue: 80 },
  { id: 'byproductsSoldShare', min: 0, max: 100, step: 5, defaultValue: 0 },
  { id: 'buttermilkPrice', min: 2, max: 15, step: 0.5, defaultValue: 6, advanced: true },
  { id: 'wheyPrice', min: 0.5, max: 6, step: 0.5, defaultValue: 2, advanced: true },
  // breeding and culling
  { id: 'lactationsPerCow', min: 3, max: 10, step: 1, defaultValue: 6 },
  { id: 'ownBull', type: 'boolean', defaultValue: false },
  { id: 'oatsPerCow', min: 0, max: 1500, step: 10, defaultValue: 90 },
  { id: 'calfPrice', min: 100, max: 2500, step: 50, defaultValue: 500 },
  { id: 'cullCowPrice', min: 1500, max: 8000, step: 100, defaultValue: 3500 },
  // grain every day of the lactation on top of the usual ration: more milk for more grain
  { id: 'dairyGrainAllLactation', type: 'boolean', defaultValue: false },
  { id: 'dairyGrainKgPerDay', min: 1, max: 8, step: 0.5, defaultValue: 3 },
  { id: 'milkPerKgGrain', min: 0.4, max: 1.5, step: 0.1, defaultValue: 1 },
]);
