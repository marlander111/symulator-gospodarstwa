// Yearly sales by product: what is left after the family has taken its own food, including red
// meat from the abattoir and processed goods (farm retail, RHD).
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Products available, food for the household, sales ----------

/** Share of the birds and rabbits that reach slaughter weight. */
const BROILERS_REARED = 0.95;
const TURKEYS_AND_GUINEA_FOWL_REARED = 0.9;
const RABBITS_REARED = 0.9;
const GEESE_REARED = 0.9;
const DUCKS_REARED = 0.93;
/** Carcass of a goose and of a cockerel from own hatching (kg). */
const GOOSE_CARCASS_KG = 5;
const COCKEREL_CARCASS_KG = 1.5;
/** A spent hen is sold for this much when the flock is replaced (PLN). */
const SPENT_HEN_PRICE = 10;
/** A cull ewe brings this much (PLN); a cull suckler cow is worth more than a dairy cow. */
const CULL_EWE_PRICE = 250;
const CULL_SUCKLER_COW_PRICE_FACTOR = 1.3;
/** Share of the honey and mushrooms fit for sale. */
const HONEY_SOLD_SHARE = 0.95;
const MUSHROOMS_SOLD_SHARE = 0.9;
/** Calves born per dairy cow and year. */
const CALVES_PER_COW = 0.95;

function computeRevenue(params, results) {
  const { cowReplacements, calvesSold } = calfSales(params);
  const eggs = params.layingHens * params.eggsPerHen;
  const lambs = computeLambSales(params, results);
  const finisherCarcassKg = (params.finisherWeightKg * params.finisherKillingOut) / 100;
  const finishersAsMeat = (results.finishers * params.finishersSoldAsMeatShare) / 100;
  const fruitTonnes = results.orchardHa * params.orchardYield;
  const fruitSoldShare = Math.min(1, params.fruitSoldShare / 100);
  const fruitPreservesShare = Math.min(1 - fruitSoldShare, params.preservesFruitShare / 100);

  // what the farm has for its own table or for sale, in the units of HOME_CONSUMPTION_PER_ADULT
  const available = {
    eggs: (eggs * params.eggsSoldShare) / 100,
    milk: results.freshMilkAvailable + results.goatMilkSold,
    cheese: results.cheeseAvailable + results.goatCheeseSold,
    curd: results.curdAvailable,
    butter: results.butterKg,
    cream: results.creamAvailable,
    pork: params.pigs * params.pigCarcassKg,
    beef: finishersAsMeat * finisherCarcassKg,
    lamb: lambs.lambMeatKg,
    rabbits: params.rabbits * params.rabbitsRearedPerDoe * RABBITS_REARED,
    fruit: fruitTonnes * 1000 * (1 - fruitSoldShare - fruitPreservesShare),
    mushrooms: params.mushroomLogs * params.mushroomYieldPerLog * MUSHROOMS_SOLD_SHARE,
    honey: params.beehives * params.honeyPerHive * HONEY_SOLD_SHARE,
  };
  const poultryBirds = {
    broilers: [params.broilers * BROILERS_REARED, params.broilerCarcassKg],
    cockerels: [results.cockerels, COCKEREL_CARCASS_KG],
    ducks: [params.ducks * DUCKS_REARED, params.duckCarcassKg],
    guineaFowl: [params.guineaFowl * TURKEYS_AND_GUINEA_FOWL_REARED, params.guineaFowlCarcassKg],
    turkeys: [params.turkeys * TURKEYS_AND_GUINEA_FOWL_REARED, params.turkeyCarcassKg],
    geese: [params.geese * GEESE_REARED, GOOSE_CARCASS_KG],
  };
  const home = takeHomeFood(params, available, poultryBirds);
  const sold = Object.fromEntries(
    Object.entries(available).map(([item, amount]) => [item, amount - home.taken[item]])
  );
  // fruit not eaten at home is not sold either (only fruitSoldShare is picked for sale)
  const fruitSoldKg = fruitTonnes * 1000 * fruitSoldShare;
  const birdsSold = id => poultryBirds[id][0] - home.birdsTaken[id];

  const dogs = feedGuardDogs(params, results, lambs);
  const lambMeatSoldKg = Math.max(0, sold.lamb - dogs.lambMeatKg);
  const processing = computeProcessing(params, {
    lambMeatKg: lambMeatSoldKg,
    porkKg: sold.pork,
    beefKg: sold.beef,
    fruitKg: fruitTonnes * 1000 * fruitPreservesShare,
    geeseRaised: birdsSold('geese'),
    ducksRaised: birdsSold('ducks'),
  });
  const kidMeatSoldKg = results.kidsSold * params.kidCarcassKg;
  const vegetableProduction = params.marketGardenHa * params.vegetableSalesPerHa;

  const revenueItems = {
    milk: Math.max(0, sold.milk - results.goatMilkSold) * params.milkPrice,
    goatMilk: Math.min(sold.milk, results.goatMilkSold) * params.goatMilkPrice,
    cheese: Math.max(0, sold.cheese - results.goatCheeseSold) * params.cheesePrice,
    goatCheese: Math.min(sold.cheese, results.goatCheeseSold) * params.goatCheesePrice,
    curd: sold.curd * params.curdPrice,
    cream: sold.cream * params.creamPrice,
    butter: sold.butter * params.butterPrice,
    dairyByproducts:
      results.buttermilkSoldLitres * params.buttermilkPrice + results.wheySoldLitres * params.wheyPrice,
    grainSales: results.grainSoldTonnes * params.grainSalePrice,
    calves: calvesSold * params.calfPrice + cowReplacements * params.cullCowPrice,
    eggs: sold.eggs * params.eggPrice + results.henReplacements * SPENT_HEN_PRICE,
    cockerels: birdsSold('cockerels') * params.cockerelPrice,
    goats: kidMeatSoldKg * params.kidMeatPricePerKg,
    pigs: (sold.pork - processing.porkProcessedKg) * params.porkBoxPricePerKg,
    beefCattle:
      results.weanersSold * params.weanerWeightKg * params.weanerPricePerKg +
      (sold.beef - processing.beefProcessedKg) * params.beefBoxPricePerKg +
      (results.finishers - finishersAsMeat) * params.finisherWeightKg * params.finisherLivePricePerKg +
      results.beefReplacements * params.cullCowPrice * CULL_SUCKLER_COW_PRICE_FACTOR,
    broilers: birdsSold('broilers') * params.broilerCarcassKg * params.broilerPricePerKg,
    geese: (processing.geeseRaised - processing.geeseProcessed) * params.goosePrice,
    ducks:
      (processing.ducksRaised - processing.ducksProcessed) * params.duckCarcassKg * params.duckPricePerKg,
    turkeys: birdsSold('turkeys') * params.turkeyCarcassKg * params.turkeyPricePerKg,
    guineaFowl: birdsSold('guineaFowl') * params.guineaFowlCarcassKg * params.guineaFowlPricePerKg,
    rabbits: sold.rabbits * params.rabbitPrice,
    sheep: lambs.lambsSoldLive * params.lambLivePrice + lambs.ewesReplaced * CULL_EWE_PRICE,
    lambMeat: (lambMeatSoldKg - processing.lambMeatProcessedKg) * params.lambMeatPricePerKg,
    processedGoods: processing.processedValue,
    fruit: fruitSoldKg * params.fruitPricePerKg,
    mushrooms: sold.mushrooms * params.mushroomPrice,
    vegetables: vegetableProduction * (1 - params.preservesVegetableShare / 100),
    honey: sold.honey * params.honeyPrice,
    horseRiding: params.horses > 0 ? params.ridesPerYear * params.ridePricePerHour : 0,
  };
  const preservesFromVegetables =
    vegetableProduction * (params.preservesVegetableShare / 100) * params.preservesValueFactor;
  revenueItems.processedGoods += preservesFromVegetables;
  processing.processedValueBySpecies.preserves += preservesFromVegetables;
  processing.processedValue += preservesFromVegetables;

  const homeUse = { ...homeFoodValue(params, home), dogFood: dogs.ownMeatKg * params.dogFoodPricePerKg };
  const meatBoxKg = lambMeatSoldKg + sold.beef + sold.pork + kidMeatSoldKg;
  return {
    calves: params.dairyCows * CALVES_PER_COW,
    calvesSold,
    cowReplacements,
    eggs,
    eggsSold: sold.eggs,
    freshMilkSold: Math.max(0, sold.milk - results.goatMilkSold),
    cheeseSold: Math.max(0, sold.cheese - results.goatCheeseSold),
    curdSold: sold.curd,
    butterSold: sold.butter,
    creamSold: sold.cream,
    porkSoldKg: sold.pork,
    beefBoxKg: sold.beef,
    ...lambs,
    lambMeatSoldKg,
    kidMeatSoldKg,
    ...processing,
    fruitTonnes,
    fruitSoldTonnes: fruitSoldKg / 1000,
    mushroomsKg: params.mushroomLogs * params.mushroomYieldPerLog,
    honeyKg: sold.honey,
    revenueItems,
    revenue: sumValues(revenueItems),
    beefBoxRevenue: (sold.beef - processing.beefProcessedKg) * params.beefBoxPricePerKg,
    retailSalesRevenue: retailSales(revenueItems, sold, params, processing),
    homeUse,
    homeUseTotal: sumValues(homeUse),
    homeFoodTaken: home.taken,
    dogs,
    meatBoxKg,
    slaughter: computeSlaughterTrips(params, results, lambs, finishersAsMeat),
  };
}

function calfSales(params) {
  const calves = params.dairyCows * CALVES_PER_COW;
  const cowReplacements = params.dairyCows / params.lactationsPerCow;
  return { cowReplacements, calvesSold: Math.max(0, calves - cowReplacements) };
}

function computeLambSales(params, results) {
  const lambs = params.sheep * results.lambsPerEwe;
  const ewesReplaced = (params.sheep * params.eweReplacementShare) / 100;
  const lambsSold = Math.max(0, lambs - ewesReplaced);
  const lambsSoldAsMeat = (lambsSold * params.lambsSoldAsMeatShare) / 100;
  const lambCarcassKg = (params.lambLiveWeightKg * params.lambKillingOut) / 100;
  return {
    lambs,
    ewesReplaced,
    lambsSold,
    lambsSoldAsMeat,
    lambsSoldLive: lambsSold - lambsSoldAsMeat,
    lambCarcassKg,
    lambMeatKg: lambsSoldAsMeat * lambCarcassKg,
  };
}

// ---------- Food for the household ----------

/**
 * Takes the family's yearly food from what the farm produces, product by product, as far as the
 * farm has it. Poultry meat comes from the birds in the order of `poultryBirds`.
 */
function takeHomeFood(params, available, poultryBirds) {
  const eaters = params.homeUseFromFarm ? householdEaters(params) : 0;
  const taken = {};
  for (const item of Object.keys(available))
    taken[item] = Math.min(available[item], (HOME_CONSUMPTION_PER_ADULT[item] || 0) * eaters);

  let poultryKgNeeded = HOME_CONSUMPTION_PER_ADULT.poultry * eaters;
  const birdsTaken = {};
  for (const [id, [birds, carcassKg]] of Object.entries(poultryBirds)) {
    birdsTaken[id] = Math.min(birds, poultryKgNeeded / carcassKg);
    poultryKgNeeded -= birdsTaken[id] * carcassKg;
  }
  taken.poultryKg = sumBy(Object.entries(poultryBirds), ([id, [, carcassKg]]) => birdsTaken[id] * carcassKg);
  return { taken, birdsTaken, poultryBirds };
}

/** Value of the food the family takes, at the farm's own selling prices (not cash). */
function homeFoodValue(params, home) {
  const { taken, birdsTaken } = home;
  const poultryPrice = {
    broilers: params.broilerCarcassKg * params.broilerPricePerKg,
    cockerels: params.cockerelPrice,
    ducks: params.duckCarcassKg * params.duckPricePerKg,
    guineaFowl: params.guineaFowlCarcassKg * params.guineaFowlPricePerKg,
    turkeys: params.turkeyCarcassKg * params.turkeyPricePerKg,
    geese: params.goosePrice,
  };
  return {
    eggs: taken.eggs * params.eggPrice,
    milk: taken.milk * params.milkPrice,
    cheese: taken.cheese * params.cheesePrice,
    curd: taken.curd * params.curdPrice,
    butter: taken.butter * params.butterPrice,
    cream: taken.cream * params.creamPrice,
    poultry: sumBy(Object.keys(poultryPrice), id => birdsTaken[id] * poultryPrice[id]),
    pork: taken.pork * params.porkBoxPricePerKg,
    beef: taken.beef * params.beefBoxPricePerKg,
    lamb: taken.lamb * params.lambMeatPricePerKg,
    rabbits: taken.rabbits * params.rabbitPrice,
    fruit: taken.fruit * params.fruitPricePerKg,
    mushrooms: taken.mushrooms * params.mushroomPrice,
    honey: taken.honey * params.honeyPrice,
  };
}

// ---------- Livestock guardian dogs ----------

/**
 * Meat for the guardian dogs: from the farm's kids that are not sold, then from the lamb meat,
 * and the rest bought as dog food (or everything bought when `dogsFedOwnMeat` is off).
 */
function feedGuardDogs(params, results, lambs) {
  const meatNeededKg = params.guardDogs * params.dogMeatKgPerMonth * 12;
  const kidMeatKg = params.dogsFedOwnMeat ? (results.kids - results.kidsSold) * params.kidCarcassKg : 0;
  const fromKidsKg = Math.min(meatNeededKg, kidMeatKg);
  const lambMeatKg = params.dogsFedOwnMeat ? Math.min(meatNeededKg - fromKidsKg, lambs.lambMeatKg) : 0;
  const ownMeatKg = fromKidsKg + lambMeatKg;
  return { meatNeededKg, ownMeatKg, lambMeatKg, boughtKg: meatNeededKg - ownMeatKg };
}

// ---------- Slaughter trips ----------

/** Places on the livestock trailer, counted in lambs, that one animal of each kind takes. */
const TRAILER_PLACES_PER_ANIMAL = { lamb: 1, kid: 1, pig: 2, finisher: 5 };

/**
 * Trips to the abattoir for the animals sold as meat. Every batch needs two trips (delivery and
 * collection of the carcasses), each there and back.
 */
function computeSlaughterTrips(params, results, lambs, finishersAsMeat) {
  const trailerPlaces = params.lambsPerAbattoirTrip;
  const tripsFor = (animals, places) =>
    animals > 0 ? Math.ceil((animals * places) / trailerPlaces - 1e-9) : 0;
  const trips = {
    sheep: tripsFor(lambs.lambsSoldAsMeat, TRAILER_PLACES_PER_ANIMAL.lamb),
    goats: tripsFor(results.kidsSold, TRAILER_PLACES_PER_ANIMAL.kid),
    pigs: tripsFor(params.pigs, TRAILER_PLACES_PER_ANIMAL.pig),
    beefCattle: tripsFor(finishersAsMeat, TRAILER_PLACES_PER_ANIMAL.finisher),
  };
  const kmBySpecies = Object.fromEntries(
    Object.entries(trips).map(([species, count]) => [species, count * 2 * 2 * params.abattoirDistanceKm])
  );
  return { trips, kmBySpecies, totalTrips: sumValues(trips), totalKm: sumValues(kmBySpecies) };
}

// ---------- Processing (farm retail) ----------

/** Weight of the finished product per bird or per kg of meat (for the parcels). */
const PROCESSED_KG_PER_GOOSE = 2.5;
const PROCESSED_KG_PER_DUCK = 1.2;
const PROCESSED_KG_PER_KG_OF_RED_MEAT = 0.6;
/** Value of one kilogram of preserves in jars, used to count the parcels (PLN). */
const PRESERVES_VALUE_PER_KG = 30;

function computeProcessing(params, inputs) {
  const { geeseRaised, ducksRaised } = inputs;
  const geeseProcessed = (geeseRaised * params.geeseProcessedShare) / 100;
  const ducksProcessed = (ducksRaised * params.ducksProcessedShare) / 100;
  const lambMeatProcessedKg = (inputs.lambMeatKg * params.lambProcessedShare) / 100;
  const porkProcessedKg = (inputs.porkKg * params.porkProcessedShare) / 100;
  const beefProcessedKg = (inputs.beefKg * params.beefProcessedShare) / 100;
  const processedValueBySpecies = {
    geese: geeseProcessed * params.processedValuePerGoose,
    ducks: ducksProcessed * params.processedValuePerDuck,
    sheep: lambMeatProcessedKg * params.processedValuePerLambKg,
    pigs: porkProcessedKg * params.processedValuePerPorkKg,
    beefCattle: beefProcessedKg * params.processedValuePerBeefKg,
    preserves: inputs.fruitKg * params.fruitPricePerKg * params.preservesValueFactor,
  };
  const redMeatProcessedKg = lambMeatProcessedKg + porkProcessedKg + beefProcessedKg;
  const processedKg =
    geeseProcessed * PROCESSED_KG_PER_GOOSE +
    ducksProcessed * PROCESSED_KG_PER_DUCK +
    redMeatProcessedKg * PROCESSED_KG_PER_KG_OF_RED_MEAT +
    processedValueBySpecies.preserves / PRESERVES_VALUE_PER_KG;
  const processedValue = sumValues(processedValueBySpecies);
  return {
    geeseRaised,
    geeseProcessed,
    ducksRaised,
    ducksProcessed,
    lambMeatProcessedKg,
    porkProcessedKg,
    beefProcessedKg,
    processedValueBySpecies,
    processedValue,
    processedMeatValue: processedValue - processedValueBySpecies.preserves,
    processedKg,
    parcels: (processedKg * params.shippedShare) / 100 / params.parcelWeightKg,
  };
}

/**
 * Sales under farm retail rules (RHD): dairy products, red meat from the abattoir and processed
 * goods. Fresh eggs, raw milk, fruit, honey and poultry slaughtered on the farm are direct sales
 * of unprocessed produce and are not counted here.
 */
function retailSales(revenueItems, sold, params, processing) {
  const { cheese, goatCheese, curd, cream, butter, lambMeat, processedGoods, goats, pigs } = revenueItems;
  const beefBoxes = (sold.beef - processing.beefProcessedKg) * params.beefBoxPricePerKg;
  return cheese + goatCheese + curd + cream + butter + lambMeat + processedGoods + goats + pigs + beefBoxes;
}
