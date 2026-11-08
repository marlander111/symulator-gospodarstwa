// Parameters of the "slaughterAndDogs" group: the abattoir trips shared by sheep, goats, pigs and
// beef cattle, and the livestock guardian dogs. Labels, units and hints: locales → parameters.<id>.

defineParameterGroup('slaughterAndDogs', [
  { id: 'abattoirDistanceKm', min: 5, max: 100, step: 1, defaultValue: 30 },
  { id: 'lambsPerAbattoirTrip', min: 1, max: 15, step: 1, defaultValue: 6 },
  { id: 'trailerCostPerKm', min: 0.5, max: 3, step: 0.1, defaultValue: 1.2 },
  { id: 'abattoirTripHours', min: 0.5, max: 5, step: 0.25, defaultValue: 1.5 },
  { id: 'butcheryCostPerKg', min: 0, max: 15, step: 0.5, defaultValue: 4 },
  // livestock guardian dogs
  { id: 'guardDogs', min: 0, max: 4, step: 1, defaultValue: 0 },
  { id: 'dogMeatKgPerMonth', min: 5, max: 40, step: 1, defaultValue: 20 },
  { id: 'dogsFedOwnMeat', type: 'boolean', defaultValue: true },
  { id: 'dogFoodPricePerKg', min: 2, max: 20, step: 0.5, defaultValue: 7 },
  { id: 'costPerDog', min: 200, max: 2000, step: 50, defaultValue: 700 },
  { id: 'hoursPerDog', min: 5, max: 40, step: 1, defaultValue: 12 },
]);
