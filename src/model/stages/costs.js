// Running costs per year.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Running costs ----------

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
    params.broilers > 0 ||
    params.ducks > 0 ||
    params.guineaFowl > 0 ||
    params.turkeys > 0;

  const costItems = {
    arable: results.usableArableHa * params.arableCostPerHa,
    meadow: params.meadowHa * params.meadowCostPerHa,
    pasture: params.pastureHa * params.pastureCostPerHa,
    dairyCows:
      params.dairyCows > 0
        ? params.dairyCows * params.costPerCow +
          replacementHeifers * params.costPerCow * 0.3 +
          (bulls ? params.bullCost : params.dairyCows * params.inseminationCost)
        : 0,
    milkPackaging: results.freshMilkSold * params.milkPackagingCostPerLitre,
    cheese: results.cheeseKg * params.cheeseCostPerKg,
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
      ((finishers * params.finishersSoldAsMeatShare) / 100) * params.finisherSlaughterCost,
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
      results.abattoirKm * params.trailerCostPerKm,
    goats: params.goats * params.costPerGoat + kidsSold * params.kidSlaughterCost,
    horses: params.horses * params.horseCost,
    landLease: params.leasedHa * params.leaseRentPerHa,
    pigs:
      (params.pigsForHome + params.pigsForSale) * params.costPerPig +
      params.pigsForSale * params.pigSlaughterCost,
    fixed: params.fixedCosts,
    sales: sellsDirectly ? params.salesCosts : 0,
    energy: params.energyCosts,
  };

  // the pessimistic scenario raises every running cost except the lease
  const costMultiplier = params.costMultiplier || 1;
  for (const item in costItems) if (item !== 'landLease') costItems[item] *= costMultiplier;

  const purchases = {
    grain: Math.max(0, -results.grainBalance) * params.grainPurchasePrice,
    hay: Math.max(0, -results.hayBalance) * params.hayPurchasePrice,
    straw: Math.max(0, -results.strawBalance) * params.strawPurchasePrice,
    sawdust: results.sawdustTonnes * params.sawdustPrice,
  };
  costItems.purchases = sumValues(purchases);
  return { costItems, purchases, costs: sumValues(costItems) };
}
