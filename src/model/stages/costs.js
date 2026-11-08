// Running costs per year.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Running costs ----------

/** Cost lines that do not follow the general rise of costs in the pessimistic case. */
const FIXED_PRICE_COST_ITEMS = ['landLease', 'retailTax'];

/** Farm retail (RHD) sales are free of income tax up to this amount a year. */
const RETAIL_TAX_FREE_LIMIT = 100000;
/** Flat-rate tax on the retail sales above the limit. */
const RETAIL_FLAT_TAX_RATE = 0.02;

function retailFlatTax(retailSalesRevenue) {
  return Math.max(0, retailSalesRevenue - RETAIL_TAX_FREE_LIMIT) * RETAIL_FLAT_TAX_RATE;
}

/** Packaging and cultures per kg of curd, butter and cream, and per litre of goat milk (PLN). */
const DAIRY_PRODUCT_PACKAGING_PER_KG = 1.5;
const GOAT_MILK_COSTS_PER_LITRE = 0.4;
/** Share of the dairy cost of a cow that a replacement heifer costs. */
const HEIFER_COST_SHARE = 0.3;

function computeCosts(params, results) {
  const {
    replacementHeifers,
    bulls,
    sucklerCows,
    finishers,
    beefHeifers,
    kidsSold,
    chicks,
    henReplacements,
  } = results;
  const sellsDirectly =
    results.freshMilkSold > 0 ||
    results.eggsSold > 0 ||
    results.meatBoxKg > 0 ||
    params.broilers > 0 ||
    params.ducks > 0 ||
    params.guineaFowl > 0 ||
    params.turkeys > 0;
  const slaughterKm = results.slaughter.kmBySpecies;
  const finishersAsMeat = (finishers * params.finishersSoldAsMeatShare) / 100;

  const costItems = {
    arable: results.usableArableHa * params.arableCostPerHa,
    rootCrops: results.rootCropHa * params.rootCropCostPerHa,
    meadow: params.meadowHa * params.meadowCostPerHa,
    pasture: params.pastureHa * params.pastureCostPerHa,
    dairyCows:
      params.dairyCows > 0
        ? params.dairyCows * params.costPerCow +
          replacementHeifers * params.costPerCow * HEIFER_COST_SHARE +
          (bulls ? params.bullCost : params.dairyCows * params.inseminationCost)
        : 0,
    milkPackaging: results.freshMilkSold * params.milkPackagingCostPerLitre,
    cheese:
      (results.cheeseKg + results.goatCheeseKg) * params.cheeseCostPerKg +
      (results.curdKg + results.butterKg + results.creamKg) * DAIRY_PRODUCT_PACKAGING_PER_KG,
    layingHens:
      (params.ownHatching ? chicks * params.hatchingCostPerChick : henReplacements * params.pulletPrice) +
      params.layingHens * params.henExtrasCost +
      results.eggsSold * params.eggPackagingCost +
      (params.winterPolytunnel ? params.layingHens * params.tunnelBeddingCostPerHen : 0),
    broilers: params.broilers * params.costPerBroiler,
    geese: params.geese * params.costPerGoose,
    ducks: params.ducks * params.costPerDuck,
    catchCrops:
      results.catchCropHa * params.catchCropCostPerHa + results.stubbleCropHa * params.stubbleCropCostPerHa,
    beefCattle:
      (sucklerCows + finishers + beefHeifers) * params.beefCattleCostPerHead +
      finishersAsMeat * params.finisherSlaughterCost +
      results.beefBoxKg * params.butcheryCostPerKg +
      slaughterKm.beefCattle * params.trailerCostPerKm,
    turkeys: params.turkeys * params.costPerTurkey,
    guineaFowl: params.guineaFowl * params.costPerGuineaFowl,
    processedGoods:
      (results.processedValue * params.processingMaterialsShare) / 100 +
      results.parcels * Math.max(0, params.parcelCost - params.shippingFeeCharged),
    fruit: (results.fruitSoldTonnes * 1000 * params.fruitPricePerKg * params.fruitCostShare) / 100,
    mushrooms: params.mushroomLogs * params.mushroomLogCost,
    rabbits: params.rabbits * params.costPerRabbitDoe,
    vegetables: (params.marketGardenHa * params.vegetableSalesPerHa * params.vegetableCostShare) / 100,
    beehives: params.beehives * params.hiveCost,
    sheep: params.sheep * params.costPerEwe,
    slaughter:
      results.lambsSoldAsMeat * params.lambSlaughterCost +
      results.lambMeatKg * params.butcheryCostPerKg +
      slaughterKm.sheep * params.trailerCostPerKm,
    goats:
      params.goats * params.costPerGoat +
      kidsSold * params.kidSlaughterCost +
      slaughterKm.goats * params.trailerCostPerKm +
      results.goatMilkUsed * GOAT_MILK_COSTS_PER_LITRE,
    horses: params.horses * params.horseCost,
    guardDogs: params.guardDogs * params.costPerDog + results.dogs.boughtKg * params.dogFoodPricePerKg,
    landLease: params.leasedHa * params.leaseRentPerHa,
    pigs:
      params.pigs * (params.costPerPig + params.pigSlaughterCost) +
      results.porkSoldKg * params.butcheryCostPerKg +
      slaughterKm.pigs * params.trailerCostPerKm,
    fixed: params.fixedCosts,
    retailTax: retailFlatTax(results.retailSalesRevenue),
    sales: sellsDirectly ? params.salesCosts : 0,
    energy: params.energyCosts,
  };

  // the pessimistic scenario raises every running cost except the lease
  const costMultiplier = params.costMultiplier || 1;
  for (const item in costItems) if (!FIXED_PRICE_COST_ITEMS.includes(item)) costItems[item] *= costMultiplier;

  const purchases = {
    grain: (Math.max(0, -results.grainBalance) + results.boughtGrainTonnes) * params.grainPurchasePrice,
    hay: (Math.max(0, -results.hayBalance) + results.boughtForageTonnes) * params.hayPurchasePrice,
    straw: Math.max(0, -results.strawBalance) * params.strawPurchasePrice,
    sawdust: results.sawdustTonnes * params.sawdustPrice,
  };
  costItems.purchases = sumValues(purchases);
  return { costItems, purchases, costs: sumValues(costItems) };
}
