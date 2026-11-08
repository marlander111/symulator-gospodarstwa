// Parameters of the "beefCattle" group. Labels, units and hints: locales → parameters.<id>.

defineParameterGroup('beefCattle', [
  { id: 'beefBreed', type: 'choice', options: BEEF_BREED_IDS, defaultValue: 'extensive', sets: BEEF_BREEDS },
  { id: 'beefSystem', type: 'choice', options: BEEF_SYSTEM_IDS, defaultValue: 'mixed' },
  { id: 'sucklerCows', min: 0, max: 40, step: 1, defaultValue: 0 },
  { id: 'weanersSoldShare', min: 0, max: 100, step: 10, defaultValue: 100 },
  { id: 'weanerPricePerKg', min: 10, max: 30, step: 0.5, defaultValue: 17 },
  { id: 'finishersSoldAsMeatShare', min: 0, max: 100, step: 10, defaultValue: 50 },
  { id: 'beefBoxPricePerKg', min: 25, max: 90, step: 1, defaultValue: 45 },
  { id: 'finisherLivePricePerKg', min: 8, max: 25, step: 0.5, defaultValue: 14 },
  // weights, slaughter and work
  { id: 'weanerWeightKg', min: 150, max: 380, step: 10, defaultValue: 240 },
  { id: 'finisherWeightKg', min: 400, max: 800, step: 10, defaultValue: 560 },
  { id: 'finisherKillingOut', min: 48, max: 64, step: 1, defaultValue: 55 },
  { id: 'finisherSlaughterCost', min: 300, max: 1500, step: 50, defaultValue: 700 },
  { id: 'beefCattleCostPerHead', min: 200, max: 1500, step: 50, defaultValue: 600 },
  { id: 'hoursPerSucklerCow', min: 5, max: 30, step: 1, defaultValue: 12 },
  { id: 'hoursPerFinisher', min: 3, max: 20, step: 1, defaultValue: 8 },
]);
