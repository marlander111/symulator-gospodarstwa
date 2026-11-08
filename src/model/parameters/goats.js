// Parameters of the "goats" group. Labels, units and hints: locales → parameters.<id>.

defineParameterGroup('goats', [
  { id: 'goats', min: 0, max: 40, step: 1, defaultValue: 0 },
  { id: 'kidsSoldShare', min: 0, max: 100, step: 10, defaultValue: 80 },
  { id: 'kidMeatPricePerKg', min: 20, max: 90, step: 1, defaultValue: 45 },
  // kidding and slaughter
  { id: 'kidsPerDoe', min: 0.8, max: 2.5, step: 0.1, defaultValue: 1.5 },
  { id: 'kidCarcassKg', min: 5, max: 20, step: 0.5, defaultValue: 10 },
  { id: 'kidSlaughterCost', min: 50, max: 300, step: 10, defaultValue: 120 },
  // goat milk and cheese
  { id: 'goatMilking', type: 'boolean', defaultValue: false },
  { id: 'milkPerGoat', min: 200, max: 900, step: 25, defaultValue: 500 },
  { id: 'goatMilkPrice', min: 4, max: 16, step: 0.5, defaultValue: 8 },
  { id: 'goatCheeseShare', min: 0, max: 100, step: 5, defaultValue: 50 },
  { id: 'goatCheesePrice', min: 50, max: 200, step: 5, defaultValue: 110 },
  { id: 'goatCheeseYield', min: 8, max: 16, step: 0.5, defaultValue: 11, advanced: true },
  { id: 'hoursPerMilkingGoat', min: 5, max: 40, step: 1, defaultValue: 18, advanced: true },
]);
