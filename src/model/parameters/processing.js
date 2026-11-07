// Parameters of the "processing" group. Labels, units and hints: locales/pl.json → parameters.<id>.

defineParameterGroup('processing', [
  { id: 'geeseProcessedShare', min: 0, max: 100, step: 5, defaultValue: 0 },
  { id: 'processedValuePerGoose', min: 150, max: 700, step: 10, defaultValue: 330 },
  { id: 'ducksProcessedShare', min: 0, max: 100, step: 5, defaultValue: 0 },
  { id: 'processedValuePerDuck', min: 80, max: 400, step: 10, defaultValue: 190 },
  { id: 'lambProcessedShare', min: 0, max: 100, step: 5, defaultValue: 0 },
  { id: 'processedValuePerLambKg', min: 40, max: 160, step: 5, defaultValue: 80 },
  { id: 'processingMaterialsShare', min: 5, max: 30, step: 1, defaultValue: 12, advanced: true },
  { id: 'processingHoursPerGoose', min: 1, max: 8, step: 0.5, defaultValue: 3, advanced: true },
  { id: 'processingHoursPerDuck', min: 0.5, max: 5, step: 0.25, defaultValue: 1.5, advanced: true },
  { id: 'processingHoursPerLambKg', min: 0.2, max: 2, step: 0.05, defaultValue: 0.5, advanced: true },
  { id: 'processingFixedHours', min: 0, max: 200, step: 10, defaultValue: 60, advanced: true },
  { id: 'shippedShare', min: 0, max: 100, step: 5, defaultValue: 50 },
  { id: 'parcelCost', min: 15, max: 90, step: 1, defaultValue: 40 },
  { id: 'shippingFeeCharged', min: 0, max: 60, step: 1, defaultValue: 20 },
  { id: 'parcelWeightKg', min: 1, max: 10, step: 0.5, defaultValue: 3, advanced: true },
  { id: 'hoursPerParcel', min: 0.1, max: 1, step: 0.05, defaultValue: 0.3, advanced: true },
]);
