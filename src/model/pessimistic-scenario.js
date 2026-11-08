// Pessimistic scenario: the current settings worsened by the sliders of the "pessimistic" group.

const PRICE_PARAMS = [
  'milkPrice',
  'cheesePrice',
  'calfPrice',
  'cullCowPrice',
  'eggPrice',
  'broilerPricePerKg',
  'goosePrice',
  'rabbitPrice',
  'duckPricePerKg',
  'turkeyPricePerKg',
  'guineaFowlPricePerKg',
  'lambLivePrice',
  'lambMeatPricePerKg',
  'vegetableSalesPerHa',
  'honeyPrice',
  'fruitPricePerKg',
  'mushroomPrice',
  'processedValuePerGoose',
  'processedValuePerDuck',
  'processedValuePerLambKg',
  'weanerPricePerKg',
  'beefBoxPricePerKg',
  'finisherLivePricePerKg',
  'kidMeatPricePerKg',
  'porkBoxPricePerKg',
  'curdPrice',
  'creamPrice',
  'butterPrice',
  'buttermilkPrice',
  'wheyPrice',
  'goatMilkPrice',
  'goatCheesePrice',
  'processedValuePerPorkKg',
  'processedValuePerBeefKg',
  'ridePricePerHour',
  'grainSalePrice',
];

const CROP_YIELD_PARAMS = [
  'cerealYield',
  'strawYield',
  'pastureYield',
  'meadowYield',
  'cloverYield',
  'rootCropYield',
  'orchardYield',
  'honeyPerHive',
  'mushroomYieldPerLog',
];

const ANIMAL_OUTPUT_PARAMS = [
  'milkPerCow',
  'eggsPerHen',
  'lambsPerLambing',
  'rabbitsRearedPerDoe',
  'milkPerGoat',
  'kidsPerDoe',
];

const PURCHASE_PRICE_PARAMS = [
  'grainPurchasePrice',
  'hayPurchasePrice',
  'strawPurchasePrice',
  'sawdustPrice',
];

/**
 * Returns a copy of the params with lower prices, yields and animal output, more working hours
 * and higher costs. `hoursMultiplier` and `costMultiplier` are read by simulateFarm.
 * @param {object} params
 * @returns {object}
 */
function applyPessimisticScenario(params) {
  const worse = { ...params };
  const scale = (ids, factor) => ids.forEach(id => (worse[id] = params[id] * factor));

  scale(PRICE_PARAMS, 1 - params.pessimisticPriceDrop / 100);
  scale(CROP_YIELD_PARAMS, 1 - params.pessimisticYieldDrop / 100);
  scale(ANIMAL_OUTPUT_PARAMS, 1 - params.pessimisticAnimalOutputDrop / 100);
  scale(PURCHASE_PRICE_PARAMS, 1 + params.pessimisticCostIncrease / 100);

  worse.hoursMultiplier = 1 + params.pessimisticExtraHours / 100;
  worse.costMultiplier = 1 + params.pessimisticCostIncrease / 100;
  return worse;
}
