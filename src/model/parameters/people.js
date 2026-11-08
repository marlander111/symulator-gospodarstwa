// Parameters of the "people" group. Labels, units and hints: locales → parameters.<id>.

defineParameterGroup('people', [
  { id: 'fullTimeWorkers', min: 0, max: 6, step: 1, defaultValue: 1 },
  { id: 'halfTimeWorkers', min: 0, max: 6, step: 1, defaultValue: 1 },
  { id: 'quarterTimeWorkers', min: 0, max: 8, step: 1, defaultValue: 0 },
  { id: 'weeklyHoursLimit', min: 40, max: 160, step: 5, defaultValue: 80 },
  { id: 'minimumNetIncome', min: 0, max: 250000, step: 5000, defaultValue: 60000 },
  { id: 'fullTimeHoursPerYear', min: 1600, max: 2800, step: 50, defaultValue: 2000 },
]);
