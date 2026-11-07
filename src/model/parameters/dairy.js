// Parameters of the "dairy" group. Labels, units and hints: locales/pl.json → parameters.<id>.

defineParameterGroup('dairy', [
  { id: 'dairyCows', min: 0, max: 8, step: 1, defaultValue: 4 },
  { id: 'milkPerCow', min: 2500, max: 5500, step: 100, defaultValue: 3700 },
  { id: 'onceADayMilking', type: 'boolean', defaultValue: false },
  { id: 'milkUsedShare', min: 60, max: 95, step: 1, defaultValue: 85 },
  { id: 'cheeseShare', min: 0, max: 80, step: 5, defaultValue: 20 },
  { id: 'milkPrice', min: 2, max: 10, step: 0.25, defaultValue: 5 },
  { id: 'cheesePrice', min: 40, max: 160, step: 5, defaultValue: 80 },
  { id: 'cheeseYield', min: 8, max: 13, step: 0.5, defaultValue: 11 },
  { id: 'lactationsPerCow', min: 3, max: 10, step: 1, defaultValue: 6 },
  { id: 'ownBull', type: 'boolean', defaultValue: false },
  { id: 'oatsPerCow', min: 0, max: 600, step: 10, defaultValue: 90 },
  { id: 'calfPrice', min: 100, max: 1500, step: 50, defaultValue: 500, advanced: true },
  { id: 'cullCowPrice', min: 1500, max: 7000, step: 100, defaultValue: 3500, advanced: true },
]);
