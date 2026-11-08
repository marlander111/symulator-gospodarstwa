// Parameters of the "pigs" group. Labels, units and hints: locales → parameters.<id>.

defineParameterGroup('pigs', [
  { id: 'pigs', min: 0, max: 40, step: 1, defaultValue: 0 },
  { id: 'porkBoxPricePerKg', min: 12, max: 60, step: 1, defaultValue: 26 },
  // feed, weights and slaughter
  { id: 'pigGrainKg', min: 150, max: 500, step: 10, defaultValue: 350 },
  { id: 'pigCarcassKg', min: 60, max: 130, step: 5, defaultValue: 90 },
  { id: 'pigSlaughterCost', min: 100, max: 800, step: 25, defaultValue: 350 },
]);
