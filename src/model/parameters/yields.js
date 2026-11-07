// Parameters of the "yields" group. Labels, units and hints: locales/pl.json → parameters.<id>.

defineParameterGroup('yields', [
  { id: 'grazingDays', min: 150, max: 230, step: 5, defaultValue: 200 },
  { id: 'mixedGrazingBonus', min: 0, max: 15, step: 1, defaultValue: 10 },
  { id: 'pastureYield', min: 3, max: 8, step: 0.25, defaultValue: 5 },
  { id: 'meadowYield', min: 2.5, max: 7, step: 0.25, defaultValue: 4 },
  { id: 'cloverYield', min: 4, max: 9, step: 0.25, defaultValue: 6 },
  { id: 'cerealYield', min: 1.5, max: 5, step: 0.1, defaultValue: 3 },
  { id: 'strawYield', min: 1.5, max: 4.5, step: 0.1, defaultValue: 3 },
  { id: 'rootCropYield', min: 3, max: 10, step: 0.25, defaultValue: 6, advanced: true },
  { id: 'grazingMoveIntervalDays', min: 0.5, max: 7, step: 0.5, defaultValue: 1 },
  { id: 'pastureRestDays', min: 20, max: 60, step: 5, defaultValue: 35 },
]);
