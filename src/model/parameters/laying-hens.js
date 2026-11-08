// Parameters of the "layingHens" group. Labels, units and hints: locales → parameters.<id>.

defineParameterGroup('layingHens', [
  { id: 'layingHens', min: 0, max: 500, step: 10, defaultValue: 50 },
  { id: 'eggsPerHen', min: 150, max: 300, step: 5, defaultValue: 200 },
  { id: 'eggPrice', min: 0.8, max: 2.5, step: 0.05, defaultValue: 1.45 },
  { id: 'eggsSoldShare', min: 70, max: 100, step: 1, defaultValue: 96 },
  { id: 'henFeedGramsPerDay', min: 100, max: 140, step: 5, defaultValue: 115 },
  { id: 'rangeFeedSaving', min: 0, max: 25, step: 1, defaultValue: 10 },
  // flock renewal, own hatching, cockerels and the winter tunnel
  { id: 'flockReplacementYears', min: 1, max: 3, step: 0.5, defaultValue: 1.5 },
  { id: 'pulletPrice', min: 15, max: 45, step: 1, defaultValue: 28 },
  { id: 'ownHatching', type: 'boolean', defaultValue: false },
  { id: 'cockerelPrice', min: 15, max: 90, step: 1, defaultValue: 40 },
  { id: 'cockerelGrainKg', min: 4, max: 14, step: 0.5, defaultValue: 9, advanced: true },
  { id: 'pulletGrainKg', min: 4, max: 12, step: 0.5, defaultValue: 8, advanced: true },
  { id: 'hatchingCostPerChick', min: 0, max: 10, step: 0.5, defaultValue: 3, advanced: true },
  { id: 'hatchingHoursPerChick', min: 0.1, max: 1.5, step: 0.05, defaultValue: 0.35, advanced: true },
  { id: 'winterPolytunnel', type: 'boolean', defaultValue: false },
  { id: 'tunnelBeddingCostPerHen', min: 0, max: 15, step: 0.5, defaultValue: 4, advanced: true },
]);
