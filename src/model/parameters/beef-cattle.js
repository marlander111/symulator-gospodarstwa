// Parameters of the "beefCattle" group. Labels, units and hints: locales/pl.json → parameters.<id>.

defineParameterGroup('beefCattle', [
  { id: 'sucklerCows', min: 0, max: 30, step: 1, defaultValue: 0 },
  { id: 'weanersSoldShare', min: 0, max: 100, step: 10, defaultValue: 100 },
  { id: 'weanerWeightKg', min: 150, max: 350, step: 10, defaultValue: 240 },
  { id: 'weanerPricePerKg', min: 10, max: 30, step: 0.5, defaultValue: 17 },
  { id: 'finisherWeightKg', min: 400, max: 750, step: 10, defaultValue: 560 },
  { id: 'finishersSoldAsMeatShare', min: 0, max: 100, step: 10, defaultValue: 50 },
  { id: 'beefBoxPricePerKg', min: 25, max: 90, step: 1, defaultValue: 45 },
  { id: 'finisherLivePricePerKg', min: 8, max: 25, step: 0.5, defaultValue: 14 },
  { id: 'finisherKillingOut', min: 48, max: 62, step: 1, defaultValue: 55, advanced: true },
  { id: 'beefCattleCostPerHead', min: 200, max: 1500, step: 50, defaultValue: 600, advanced: true },
  { id: 'finisherSlaughterCost', min: 300, max: 1500, step: 50, defaultValue: 700, advanced: true },
  { id: 'hoursPerSucklerCow', min: 5, max: 30, step: 1, defaultValue: 12, advanced: true },
  { id: 'hoursPerFinisher', min: 3, max: 20, step: 1, defaultValue: 8, advanced: true },
]);
