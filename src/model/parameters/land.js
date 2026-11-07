// Parameters of the "land" group. Labels, units and hints: locales/pl.json → parameters.<id>.

defineParameterGroup('land', [
  { id: 'ownedHa', min: 10, max: 16, step: 0.5, defaultValue: 14 },
  { id: 'leasedHa', min: 0, max: 15, step: 0.5, defaultValue: 0 },
  { id: 'leaseRentPerHa', min: 0, max: 2000, step: 50, defaultValue: 800 },
  { id: 'farmyardHa', min: 1, max: 4, step: 0.1, defaultValue: 2 },
  { id: 'orchardHa', min: 0, max: 1.5, step: 0.1, defaultValue: 0.5 },
  { id: 'kitchenGardenHa', min: 0, max: 0.5, step: 0.05, defaultValue: 0.15 },
  { id: 'pastureHa', min: 0, max: 10, step: 0.1, defaultValue: 5.5 },
  { id: 'meadowHa', min: 0, max: 8, step: 0.1, defaultValue: 1.5 },
  { id: 'soilClassIIIShare', min: 0, max: 100, step: 5, defaultValue: 0 },
  { id: 'soilClassVShare', min: 0, max: 100, step: 5, defaultValue: 20 },
  { id: 'soilClassVIShare', min: 0, max: 100, step: 5, defaultValue: 0 },
  { id: 'rotationFields', min: 3, max: 8, step: 1, defaultValue: 3 },
  { id: 'cerealShare', min: 33, max: 100, step: 1, defaultValue: 72 },
  { id: 'rootCrops', type: 'boolean', defaultValue: false },
]);
