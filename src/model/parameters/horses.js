// Parameters of the "horses" group. Labels, units and hints: locales → parameters.<id>.

defineParameterGroup('horses', [
  { id: 'horses', min: 0, max: 6, step: 1, defaultValue: 0 },
  { id: 'ridesPerYear', min: 0, max: 1500, step: 10, defaultValue: 0 },
  { id: 'ridePricePerHour', min: 40, max: 200, step: 5, defaultValue: 80 },
  // costs and work
  { id: 'horseCost', min: 300, max: 4000, step: 50, defaultValue: 1100 },
  { id: 'hoursPerHorse', min: 20, max: 300, step: 10, defaultValue: 80 },
  { id: 'hoursPerRide', min: 0.5, max: 3, step: 0.1, defaultValue: 1.4 },
]);
