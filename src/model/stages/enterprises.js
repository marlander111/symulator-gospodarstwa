// Result of each enterprise: revenue, costs, own feed at production cost, shared buildings, hours and land.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Result per enterprise ----------

/** Share of the cattle shed taken by one finisher and one beef heifer, relative to a cow. */
const SHED_PLACES_PER_FINISHER = 0.7;
const SHED_PLACES_PER_BEEF_HEIFER = 0.6;

/** Share of the energy bill attributed to the dairy and to the laying hens. */
const DAIRY_ENERGY_SHARE = 0.6;
const LAYING_HENS_ENERGY_SHARE = 0.1;

function computeEnterprises(params, results) {
  const feed = ownFeedUnitCosts(params, results);
  const enterprises = listEnterprises(params, results, feed).map(withDefaults);

  const landHa = landUsedByEnterprise(params, results);
  for (const enterprise of enterprises) addPerUnitResults(enterprise, landHa[enterprise.id]);

  // what is not attributed to any enterprise: area payments, fixed costs, garden
  const attributedNet = sumBy(enterprises, enterprise => enterprise.net);
  const attributedHours = sumBy(enterprises, enterprise => enterprise.hours);
  return {
    grainCostPerTonne: feed.grainCostPerTonne,
    forageCostPerTonne: feed.forageCostPerTonne,
    enterprises,
    unallocated: { net: results.netIncome - attributedNet, hours: results.totalHours - attributedHours },
  };
}

/** Own grain and forage valued at their production cost per tonne (purchase price if none is grown). */
function ownFeedUnitCosts(params, results) {
  const grainLandCost =
    results.cerealHa * params.arableCostPerHa +
    results.rootCropHa * (params.arableCostPerHa + params.rootCropCostPerHa);
  const grainCostPerTonne =
    results.grainSupply > 0 ? grainLandCost / results.grainSupply : params.grainPurchasePrice;

  const forageTotal = results.haySupply + results.grazingSupply;
  const forageLandCost =
    params.meadowHa * params.meadowCostPerHa +
    results.cloverHa * params.arableCostPerHa +
    params.pastureHa * params.pastureCostPerHa;
  const forageCostPerTonne = forageTotal > 0 ? forageLandCost / forageTotal : params.hayPurchasePrice;

  return {
    grainCostPerTonne,
    forageCostPerTonne,
    costOf: (grainTonnes, forageTonnes) =>
      grainTonnes * grainCostPerTonne + forageTonnes * forageCostPerTonne,
  };
}

/** Yearly depreciation of one investment, 0 when the farm does not have it. */
function depreciationOf(results, investmentId) {
  const item = results.investmentItems.find(candidate => candidate.id === investmentId);
  return item ? item.yearlyDepreciation : 0;
}

/**
 * Part of the processing (RHD) revenue, costs, depreciation and hours belonging to one species,
 * split by the value of its products.
 */
function processingShare(results, species) {
  const { processedValue, processedValueBySpecies, costItems, hoursByActivity } = results;
  const share = processedValue > 0 ? processedValueBySpecies[species] / processedValue : 0;
  return {
    revenue: processedValueBySpecies[species] || 0,
    cost: costItems.processedGoods * share,
    depreciation: depreciationOf(results, 'processing') * share,
    hours: hoursByActivity.processedGoods * share,
  };
}

/** Places each species takes in the buildings it shares with others. */
function sharedBuildingPlaces(params, results) {
  const { replacementHeifers, bulls, sucklerCows, finishers, beefHeifers } = results;
  const beefShed =
    sucklerCows + finishers * SHED_PLACES_PER_FINISHER + beefHeifers * SHED_PLACES_PER_BEEF_HEIFER;
  return {
    ducks: params.ducks / 2,
    turkeys: params.turkeys * 3,
    guineaFowl: params.guineaFowl,
    otherPoultry: Math.max(1, params.ducks / 2 + params.turkeys * 3 + params.guineaFowl),
    beefShed,
    cattleShed: Math.max(
      1,
      params.dairyCows +
        replacementHeifers +
        bulls +
        sucklerCows +
        finishers * SHED_PLACES_PER_FINISHER +
        beefHeifers * SHED_PLACES_PER_BEEF_HEIFER
    ),
    sheepAndGoats: Math.max(1, params.sheep + params.goats),
  };
}

/** Fills in the fields most enterprises leave out. */
function withDefaults(enterprise) {
  return { labelKey: enterprise.id, depreciation: 0, subsidy: 0, ...enterprise };
}

/** Net result, result per hour and per hectare of land used. */
function addPerUnitResults(enterprise, landHa) {
  enterprise.net = enterprise.revenue + enterprise.subsidy - enterprise.cost - enterprise.depreciation;
  enterprise.netPerHour = enterprise.hours > 0 ? enterprise.net / enterprise.hours : 0;
  enterprise.landHa = landHa;
  enterprise.netPerHa = landHa > 0.005 ? enterprise.net / landHa : null;
}

/** Revenue, costs (including own feed), depreciation, subsidies and hours of every enterprise. */
function listEnterprises(params, results, feed) {
  const {
    revenueItems: revenue,
    costItems: cost,
    subsidyItems: subsidy,
    hoursByActivity: hours,
    forageNeedByAnimal: forage,
    grainNeedByAnimal: grain,
    homeUse,
    sucklerCows,
    finishers,
    beefHeifers,
  } = results;
  const feedCost = feed.costOf;
  const depreciation = id => depreciationOf(results, id);
  const places = sharedBuildingPlaces(params, results);
  const otherPoultryShelter = species =>
    (depreciation('otherPoultryShelters') * places[species]) / places.otherPoultry;

  const geeseProcessing = processingShare(results, 'geese');
  const duckProcessing = processingShare(results, 'ducks');
  const lambProcessing = processingShare(results, 'sheep');
  const milkSalesHours = (results.freshMilkSold / 100) * params.milkSalesHoursPer100Litres;
  const eggSalesHours = (results.eggsSold / 100) * params.eggSalesHoursPer100;

  return [
    {
      id: 'milk',
      active: params.dairyCows > 0,
      revenue: revenue.milk + revenue.cheese + revenue.calves,
      cost:
        cost.dairyCows +
        cost.milkPackaging +
        cost.cheese +
        params.energyCosts * DAIRY_ENERGY_SHARE +
        feedCost(grain.dairyCows, forage.dairyCows + forage.replacementHeifers + forage.bull),
      depreciation: depreciation('cattleShed') + depreciation('dairy') + depreciation('cheeseRoom'),
      subsidy: subsidy.dairyCows + subsidy.beefCattle,
      hours: hours.dairyCows + hours.cheese + milkSalesHours,
    },
    {
      id: 'eggs',
      active: params.layingHens > 0,
      revenue: revenue.eggs + revenue.cockerels,
      cost:
        cost.layingHens +
        params.energyCosts * LAYING_HENS_ENERGY_SHARE +
        feedCost(grain.layingHens + grain.hatching, 0),
      depreciation: depreciation('henHouse') + depreciation('hatching') + depreciation('poultryTunnel'),
      hours: hours.layingHens + hours.hatching + eggSalesHours,
    },
    {
      id: 'broilers',
      active: params.broilers > 0,
      revenue: revenue.broilers,
      cost: cost.broilers + feedCost(grain.broilers, 0),
      depreciation: depreciation('broilerPens'),
      hours: hours.broilers,
    },
    {
      id: 'geese',
      labelKey: params.geeseProcessedShare > 0 ? 'geeseWithProcessing' : 'geese',
      active: params.geese > 0,
      revenue: revenue.geese + geeseProcessing.revenue,
      cost: cost.geese + geeseProcessing.cost + feedCost(grain.geese, forage.geese),
      depreciation: geeseProcessing.depreciation,
      hours: hours.geese + geeseProcessing.hours,
    },
    {
      id: 'ducks',
      labelKey: params.ducksProcessedShare > 0 ? 'ducksWithProcessing' : 'ducks',
      active: params.ducks > 0,
      revenue: revenue.ducks + duckProcessing.revenue,
      cost: cost.ducks + duckProcessing.cost + feedCost(grain.ducks, forage.ducks),
      depreciation: otherPoultryShelter('ducks') + duckProcessing.depreciation,
      hours: hours.ducks + duckProcessing.hours,
    },
    {
      id: 'beefCattle',
      active: sucklerCows > 0,
      revenue: revenue.beefCattle,
      cost: cost.beefCattle + feedCost(0, forage.beefCattle),
      depreciation: (depreciation('cattleShed') * places.beefShed) / places.cattleShed,
      subsidy:
        SUBSIDY_RATES.dairyCows * sucklerCows +
        SUBSIDY_RATES.beefCattle * Math.floor(finishers + beefHeifers),
      hours: hours.beefCattle,
    },
    {
      id: 'turkeys',
      active: params.turkeys > 0,
      revenue: revenue.turkeys,
      cost: cost.turkeys + feedCost(grain.turkeys, forage.turkeys),
      depreciation: otherPoultryShelter('turkeys'),
      hours: hours.turkeys,
    },
    {
      id: 'guineaFowl',
      active: params.guineaFowl > 0,
      revenue: revenue.guineaFowl,
      cost: cost.guineaFowl + feedCost(grain.guineaFowl, forage.guineaFowl),
      depreciation: otherPoultryShelter('guineaFowl'),
      hours: hours.guineaFowl,
    },
    {
      id: 'rabbits',
      active: params.rabbits > 0,
      revenue: revenue.rabbits,
      cost: cost.rabbits + feedCost(grain.rabbits, forage.rabbits),
      depreciation: depreciation('rabbitHutches'),
      hours: hours.rabbits,
    },
    {
      id: 'sheep',
      labelKey: params.lambProcessedShare > 0 ? 'sheepWithProcessing' : 'sheep',
      active: params.sheep > 0,
      revenue: revenue.sheep + revenue.lambMeat + lambProcessing.revenue,
      cost: cost.sheep + cost.slaughter + lambProcessing.cost + feedCost(grain.sheep, forage.sheep),
      depreciation:
        depreciation('sheepShed') * (params.sheep / places.sheepAndGoats) + lambProcessing.depreciation,
      subsidy: subsidy.sheep,
      hours: hours.sheep + lambProcessing.hours,
    },
    {
      id: 'goats',
      labelKey: params.kidsSoldShare > 0 ? 'goatsWithMeat' : 'goats',
      active: params.goats > 0,
      revenue: revenue.goats,
      cost: cost.goats + feedCost(0, forage.goats),
      depreciation: depreciation('sheepShed') * (params.goats / places.sheepAndGoats),
      subsidy: subsidy.goats,
      hours: hours.goats,
      homeValue: homeUse.dogFood,
    },
    {
      id: 'pigs',
      labelKey: params.pigsForSale > 0 ? 'pigsForSale' : 'pigs',
      active: params.pigsForHome + params.pigsForSale > 0,
      revenue: revenue.pigs,
      cost: cost.pigs + feedCost(grain.pigs, 0),
      hours: hours.pigs,
      homeValue: homeUse.pigs,
    },
    {
      id: 'horses',
      active: params.horses > 0,
      revenue: 0,
      cost: cost.horses + feedCost(grain.horses, forage.horses),
      depreciation: depreciation('horses'),
      hours: hours.horses,
    },
    {
      id: 'vegetables',
      active: params.marketGardenHa > 0,
      revenue: revenue.vegetables,
      cost: cost.vegetables,
      depreciation: depreciation('vegetables'),
      hours: hours.vegetables,
    },
    {
      id: 'fruit',
      active: revenue.fruit > 0,
      revenue: revenue.fruit,
      cost: cost.fruit,
      hours: hours.fruit,
    },
    {
      id: 'mushrooms',
      active: params.mushroomLogs > 0,
      revenue: revenue.mushrooms,
      cost: cost.mushrooms,
      hours: hours.mushrooms,
    },
    {
      id: 'beehives',
      active: params.beehives > 0,
      revenue: revenue.honey,
      cost: cost.beehives,
      depreciation: depreciation('beehives'),
      hours: hours.beehives,
    },
  ];
}

/** Hectares needed for each enterprise's feed (or its own crop) at this farm's yields. */
function landUsedByEnterprise(params, results) {
  const { forageNeedByAnimal: forage, grainNeedByAnimal: grain } = results;
  const forageLandHa = params.pastureHa + params.meadowHa + results.cloverHa;
  const forageYieldPerHa =
    forageLandHa > 0 ? (results.grazingSupply + results.haySupply) / forageLandHa : params.pastureYield;
  const grainHa = tonnes => tonnes / params.cerealYield;
  const forageHa = tonnes => tonnes / forageYieldPerHa;
  return {
    milk: forageHa(forage.dairyCows + forage.replacementHeifers + forage.bull) + grainHa(grain.dairyCows),
    eggs: grainHa(grain.layingHens + grain.hatching),
    broilers: grainHa(grain.broilers),
    geese: forageHa(forage.geese) + grainHa(grain.geese),
    rabbits: forageHa(forage.rabbits) + grainHa(grain.rabbits),
    sheep: forageHa(forage.sheep) + grainHa(grain.sheep),
    goats: forageHa(forage.goats),
    pigs: grainHa(grain.pigs),
    horses: forageHa(forage.horses) + grainHa(grain.horses),
    vegetables: params.marketGardenHa,
    beehives: 0,
    beefCattle: forageHa(forage.beefCattle),
    ducks: forageHa(forage.ducks) + grainHa(grain.ducks),
    turkeys: forageHa(forage.turkeys) + grainHa(grain.turkeys),
    guineaFowl: forageHa(forage.guineaFowl) + grainHa(grain.guineaFowl),
    fruit: (results.orchardHa * params.fruitSoldShare) / 100,
    mushrooms: 0,
  };
}
