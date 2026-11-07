// Parameters of the "produce" group. Labels, units and hints: locales/pl.json → parameters.<id>.

defineParameterGroup('produce', [
  { id: 'marketGardenHa', min: 0, max: 1.5, step: 0.05, defaultValue: 0 },
  { id: 'vegetableSalesPerHa', min: 40000, max: 250000, step: 5000, defaultValue: 120000 },
  { id: 'vegetableCostShare', min: 10, max: 60, step: 1, defaultValue: 30, advanced: true },
  { id: 'vegetableHoursPerHa', min: 1000, max: 6000, step: 100, defaultValue: 3000 },
  { id: 'fruitSoldShare', min: 0, max: 90, step: 5, defaultValue: 0 },
  { id: 'orchardYield', min: 1, max: 15, step: 0.5, defaultValue: 6 },
  { id: 'fruitPricePerKg', min: 1, max: 12, step: 0.25, defaultValue: 4 },
  { id: 'fruitCostShare', min: 5, max: 50, step: 1, defaultValue: 25, advanced: true },
  { id: 'fruitHoursPerTonne', min: 20, max: 200, step: 5, defaultValue: 60, advanced: true },
  { id: 'mushroomLogs', min: 0, max: 400, step: 10, defaultValue: 0 },
  { id: 'mushroomYieldPerLog', min: 0.3, max: 3, step: 0.1, defaultValue: 1.2 },
  { id: 'mushroomPrice', min: 15, max: 90, step: 1, defaultValue: 35 },
  { id: 'mushroomLogCost', min: 0, max: 20, step: 0.5, defaultValue: 6, advanced: true },
  { id: 'mushroomLogHours', min: 0.2, max: 2, step: 0.05, defaultValue: 0.7, advanced: true },
  { id: 'beehives', min: 0, max: 40, step: 1, defaultValue: 0 },
  { id: 'honeyPerHive', min: 5, max: 35, step: 1, defaultValue: 15 },
  { id: 'honeyPrice', min: 25, max: 90, step: 1, defaultValue: 45 },
  { id: 'hiveCost', min: 100, max: 500, step: 10, defaultValue: 250, advanced: true },
  { id: 'hiveHours', min: 3, max: 30, step: 1, defaultValue: 12, advanced: true },
]);
