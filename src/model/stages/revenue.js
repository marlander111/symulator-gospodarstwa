// Yearly sales by product, including lambs and processed goods (RHD).
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Revenue ----------

function computeRevenue(params, results) {
  const { cowReplacements, calvesSold } = calfSales(params);
  const eggs = params.layingHens * params.eggsPerHen;
  const eggsSold = (eggs * params.eggsSoldShare) / 100;
  const lambs = computeLambSales(params, results);
  const processing = computeProcessing(params, lambs.lambMeatKg);

  const fruitTonnes = results.orchardHa * params.orchardYield;
  const fruitSoldTonnes = (fruitTonnes * params.fruitSoldShare) / 100;
  const mushroomsKg = params.mushroomLogs * params.mushroomYieldPerLog;
  const { finishers, weanersSold, beefReplacements, kidsSold, kids, cockerels, henReplacements } = results;
  const finisherMeatShare = params.finishersSoldAsMeatShare / 100;

  const revenueItems = {
    milk: results.freshMilkSold * params.milkPrice,
    grainSales: results.grainSoldTonnes * params.grainSalePrice,
    cheese: results.cheeseSold * params.cheesePrice,
    calves: calvesSold * params.calfPrice + cowReplacements * params.cullCowPrice,
    eggs: eggsSold * params.eggPrice + henReplacements * 10,
    cockerels: cockerels * params.cockerelPrice,
    goats: kidsSold * params.kidCarcassKg * params.kidMeatPricePerKg,
    pigs: params.pigsForSale * params.pigCarcassKg * params.porkBoxPricePerKg,
    beefCattle:
      weanersSold * params.weanerWeightKg * params.weanerPricePerKg +
      finishers *
        (((finisherMeatShare * params.finisherWeightKg * params.finisherKillingOut) / 100) *
          params.beefBoxPricePerKg +
          (1 - finisherMeatShare) * params.finisherWeightKg * params.finisherLivePricePerKg) +
      beefReplacements * params.cullCowPrice * 1.3,
    broilers: params.broilers * 0.95 * params.broilerCarcassKg * params.broilerPricePerKg,
    geese: (processing.geeseRaised - processing.geeseProcessed) * params.goosePrice,
    ducks:
      (processing.ducksRaised - processing.ducksProcessed) * params.duckCarcassKg * params.duckPricePerKg,
    turkeys: params.turkeys * 0.9 * params.turkeyCarcassKg * params.turkeyPricePerKg,
    guineaFowl: params.guineaFowl * 0.9 * params.guineaFowlCarcassKg * params.guineaFowlPricePerKg,
    rabbits: params.rabbits * params.rabbitsRearedPerDoe * 0.9 * params.rabbitPrice,
    sheep: lambs.lambsSoldLive * params.lambLivePrice + lambs.ewesReplaced * 250,
    lambMeat: (lambs.lambMeatKg - processing.lambMeatProcessedKg) * params.lambMeatPricePerKg,
    processedGoods: processing.processedValue,
    fruit: fruitSoldTonnes * 1000 * params.fruitPricePerKg,
    mushrooms: mushroomsKg * 0.9 * params.mushroomPrice,
    vegetables: params.marketGardenHa * params.vegetableSalesPerHa,
    honey: params.beehives * params.honeyPerHive * params.honeyPrice * 0.95,
  };

  // value of what the family eats itself (not cash)
  const dogFoodKg = (kids - kidsSold) * 10;
  const homeUse = {
    pigs: params.pigsForHome * 85 * 25,
    dogFood: dogFoodKg * 15,
    eggs: (eggs - eggsSold) * params.eggPrice,
    milk: (results.milkTotal - results.milkUsed) * 0.4 * params.milkPrice,
    cheese: (results.cheeseKg - results.cheeseSold) * params.cheesePrice,
    fruit: Math.min(fruitTonnes - fruitSoldTonnes, 1.5) * 1000 * 1.5,
    mushrooms: mushroomsKg * 0.1 * params.mushroomPrice,
  };

  const beefBoxRevenue = beefSoldInBoxes(params, finishers);
  return {
    calves: params.dairyCows * 0.95,
    calvesSold,
    cowReplacements,
    eggs,
    eggsSold,
    ...lambs,
    ...processing,
    fruitTonnes,
    fruitSoldTonnes,
    mushroomsKg,
    revenueItems,
    revenue: sumValues(revenueItems),
    beefBoxRevenue,
    retailSalesRevenue: retailSales(revenueItems, beefBoxRevenue),
    homeUse,
    homeUseTotal: sumValues(homeUse),
    dogFoodKg,
  };
}

function calfSales(params) {
  const calves = params.dairyCows * 0.95;
  const cowReplacements = params.dairyCows / params.lactationsPerCow;
  return { cowReplacements, calvesSold: Math.max(0, calves - cowReplacements) };
}

function computeLambSales(params, results) {
  const lambs = params.sheep * results.lambsPerEwe;
  const ewesReplaced = (params.sheep * params.eweReplacementShare) / 100;
  const lambsSold = Math.max(0, lambs - ewesReplaced);
  const lambsSoldAsMeat = (lambsSold * params.lambsSoldAsMeatShare) / 100;
  const lambCarcassKg = (params.lambLiveWeightKg * params.lambKillingOut) / 100;
  const abattoirTrips =
    lambsSoldAsMeat > 0 ? Math.ceil(lambsSoldAsMeat / params.lambsPerAbattoirTrip - 1e-9) : 0;
  return {
    lambs,
    ewesReplaced,
    lambsSold,
    lambsSoldAsMeat,
    lambsSoldLive: lambsSold - lambsSoldAsMeat,
    lambCarcassKg,
    lambMeatKg: lambsSoldAsMeat * lambCarcassKg,
    abattoirTrips,
    // two trips per batch (delivery and pick-up), there and back
    abattoirKm: abattoirTrips * 2 * 2 * params.abattoirDistanceKm,
  };
}

function computeProcessing(params, lambMeatKg) {
  const geeseRaised = params.geese * 0.9;
  const geeseProcessed = (geeseRaised * params.geeseProcessedShare) / 100;
  const ducksRaised = params.ducks * 0.93;
  const ducksProcessed = (ducksRaised * params.ducksProcessedShare) / 100;
  const lambMeatProcessedKg = (lambMeatKg * params.lambProcessedShare) / 100;
  const processedValueBySpecies = {
    geese: geeseProcessed * params.processedValuePerGoose,
    ducks: ducksProcessed * params.processedValuePerDuck,
    sheep: lambMeatProcessedKg * params.processedValuePerLambKg,
  };
  const processedKg = geeseProcessed * 2.5 + ducksProcessed * 1.2 + lambMeatProcessedKg * 0.6;
  return {
    geeseRaised,
    geeseProcessed,
    ducksRaised,
    ducksProcessed,
    lambMeatProcessedKg,
    processedValueBySpecies,
    processedValue: sumValues(processedValueBySpecies),
    processedKg,
    parcels: (processedKg * params.shippedShare) / 100 / params.parcelWeightKg,
  };
}

/** Beef sold to households in boxes (the rest of the finishers goes live to traders). */
function beefSoldInBoxes(params, finishers) {
  const carcassKg = (params.finisherWeightKg * params.finisherKillingOut) / 100;
  return ((finishers * params.finishersSoldAsMeatShare) / 100) * carcassKg * params.beefBoxPricePerKg;
}

/**
 * Sales under farm retail rules (RHD): cheese, red meat in boxes and processed goods. Fresh eggs,
 * raw milk and poultry are direct sales of unprocessed produce and are not counted here.
 */
function retailSales(revenueItems, beefBoxRevenue) {
  const { cheese, lambMeat, processedGoods, goats, pigs } = revenueItems;
  return cheese + lambMeat + processedGoods + goats + pigs + beefBoxRevenue;
}
