// Parameters of the "land" group. Labels, units and hints: locales → parameters.<id>.

/** Share sliders of class III, V and VI soil for each land use (class IV is the rest). */
const SOIL_SHARE_PARAMETERS = SOIL_LAND_USES.flatMap(landUse =>
  SOIL_CLASSES_WITH_SHARE.map(soilClass => ({
    id: soilShareId(landUse, soilClass),
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 0,
    hectaresOf: landUse,
  }))
);

defineParameterGroup('land', [
  // chosen from the list in the page header; it moves the grazing season to the local one
  {
    id: 'location',
    type: 'choice',
    options: LOCATION_IDS,
    defaultValue: LOCATION_IDS[0],
    hidden: true,
    sets: Object.fromEntries(
      LOCATIONS.map(location => [location.id, { grazingDays: grazingSeasonDays(location) }])
    ),
  },
  { id: 'ownedHa', min: 4, max: 25, step: 0.5, defaultValue: 12 },
  { id: 'leasedHa', min: 0, max: 25, step: 0.5, defaultValue: 0 },
  { id: 'leaseRentPerHa', min: 0, max: 2000, step: 50, defaultValue: 800, totalOf: 'leasedHa' },
  { id: 'farmyardHa', min: 0.5, max: 4, step: 0.1, defaultValue: 2 },
  { id: 'orchardHa', min: 0, max: 1.5, step: 0.1, defaultValue: 0.5 },
  { id: 'kitchenGardenHa', min: 0, max: 0.5, step: 0.05, defaultValue: 0.15 },
  { id: 'pastureHa', min: 0, max: 25, step: 0.1, defaultValue: 5.5 },
  { id: 'meadowHa', min: 0, max: 20, step: 0.1, defaultValue: 1.5 },
  { id: 'rotationFields', min: 3, max: 8, step: 1, defaultValue: 3 },
  { id: 'cerealShare', min: 33, max: 100, step: 1, defaultValue: 72 },
  { id: 'rootCrops', type: 'boolean', defaultValue: false },
  ...SOIL_SHARE_PARAMETERS,
]);
