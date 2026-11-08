// Parameters of the "sheep" group. Labels, units and hints: locales → parameters.<id>.

defineParameterGroup('sheep', [
  { id: 'sheep', min: 0, max: 80, step: 1, defaultValue: 0 },
  { id: 'lambingsPerEwe', min: 1, max: 1.5, step: 0.05, defaultValue: 1 },
  { id: 'lambsPerLambing', min: 0.8, max: 2, step: 0.05, defaultValue: 1.5 },
  { id: 'lambLivePrice', min: 300, max: 1000, step: 25, defaultValue: 550 },
  { id: 'lambsSoldAsMeatShare', min: 0, max: 100, step: 5, defaultValue: 50 },
  { id: 'lambMeatPricePerKg', min: 25, max: 90, step: 1, defaultValue: 45 },
  // weights, slaughter and flock renewal
  { id: 'lambLiveWeightKg', min: 25, max: 55, step: 1, defaultValue: 40 },
  { id: 'lambKillingOut', min: 36, max: 55, step: 1, defaultValue: 47 },
  { id: 'lambSlaughterCost', min: 40, max: 300, step: 10, defaultValue: 120 },
  { id: 'eweReplacementShare', min: 10, max: 30, step: 1, defaultValue: 20 },
]);
