// Buildings, machinery and equipment the chosen enterprises need. Each item is an investment
// line (quantity × unit price, written off over its lifetime); the user can tick the ones the
// farm already has, which then cost nothing. Names: locales → investments.<id>.
//
// `quantity(params, results)` gives places, hectares or 1; 0 means the farm does not need it.

/** Sheep and goats need more fence wires than cattle. */
const SMALL_RUMINANT_FENCE_FACTOR = 1.3;
/** Manure (t a year) above which a spreader and a loader pay off instead of borrowing. */
const MANURE_TONNES_NEEDING_SPREADER = 10;
/** Hay cut from surplus pasture (t DM) above which the farm needs its own haymaking set. */
const PASTURE_HAY_NEEDING_MACHINES = 1;

const hasGrazingAnimals = params =>
  params.dairyCows + params.sheep + params.goats + params.sucklerCows + params.horses + params.pigs > 0;
const makesHay = (params, results) =>
  params.meadowHa > 0 || results.cloverHa > 0 || results.hayFromPasture > PASTURE_HAY_NEEDING_MACHINES;
const oneIf = condition => (condition ? 1 : 0);

const INFRASTRUCTURE_ITEMS = [
  {
    id: 'cattleShed',
    category: 'buildings',
    priceParam: 'investCattleShed',
    lifetimeYears: 20,
    quantity: (params, results) => results.cattleShedPlaces,
  },
  {
    id: 'sheepShed',
    category: 'buildings',
    priceParam: 'investSheepShed',
    lifetimeYears: 20,
    quantity: params => params.sheep + params.goats,
  },
  {
    id: 'pigShelters',
    category: 'buildings',
    priceParam: 'investPigShelter',
    lifetimeYears: 10,
    quantity: params => params.pigs,
  },
  {
    id: 'horses',
    category: 'buildings',
    priceParam: 'investHorseStable',
    lifetimeYears: 20,
    quantity: params => params.horses,
  },
  {
    id: 'ridingEquipment',
    category: 'buildings',
    priceParam: 'investRidingEquipment',
    lifetimeYears: 10,
    quantity: params => oneIf(params.horses > 0 && params.ridesPerYear > 0),
  },
  {
    id: 'henHouse',
    category: 'poultry',
    priceParam: 'investHenHouse',
    lifetimeYears: 12,
    quantity: params => params.layingHens,
  },
  {
    id: 'hatching',
    category: 'poultry',
    priceParam: 'investHatchery',
    lifetimeYears: 8,
    quantity: params => oneIf(params.ownHatching && params.layingHens > 0),
  },
  {
    id: 'poultryTunnel',
    category: 'poultry',
    priceParam: 'investPoultryTunnel',
    lifetimeYears: 10,
    quantity: params => oneIf(params.winterPolytunnel && params.layingHens > 0),
  },
  {
    id: 'broilerPens',
    category: 'poultry',
    priceParam: 'investBroilerPens',
    lifetimeYears: 8,
    quantity: params => params.broilers / 4, // about four batches a season share the pens
  },
  {
    id: 'otherPoultryShelters',
    category: 'poultry',
    priceParam: 'investOtherPoultryShelters',
    lifetimeYears: 8,
    // places: two duck batches share one, a turkey takes three
    quantity: params => params.ducks / 2 + params.turkeys * 3 + params.guineaFowl,
  },
  {
    id: 'rabbitHutches',
    category: 'poultry',
    priceParam: 'investRabbitHutches',
    lifetimeYears: 10,
    quantity: params => params.rabbits,
  },
  {
    id: 'fencing',
    category: 'pasture',
    priceParam: 'investElectricFencing',
    lifetimeYears: 15,
    quantity: (params, results) =>
      hasGrazingAnimals(params)
        ? results.grasslandHa * (params.sheep + params.goats > 0 ? SMALL_RUMINANT_FENCE_FACTOR : 1)
        : 0,
  },
  {
    id: 'water',
    category: 'pasture',
    priceParam: 'investPastureWater',
    lifetimeYears: 15,
    quantity: params => oneIf(hasGrazingAnimals(params)),
  },
  {
    id: 'dairy',
    category: 'processing',
    priceParam: 'investDairy',
    lifetimeYears: 12,
    quantity: params => oneIf(params.dairyCows > 0),
  },
  {
    id: 'goatDairy',
    category: 'processing',
    priceParam: 'investGoatDairy',
    lifetimeYears: 12,
    // goats milked on a farm with cows use the cows' dairy room
    quantity: params => oneIf(params.goatMilking && params.goats > 0 && params.dairyCows === 0),
  },
  {
    id: 'cheeseRoom',
    category: 'processing',
    priceParam: 'investCheeseRoom',
    lifetimeYears: 12,
    quantity: (params, results) => oneIf(results.dairyProductsKg + results.goatCheeseKg > 0),
  },
  {
    id: 'processing',
    category: 'processing',
    priceParam: 'investProcessingRoom',
    lifetimeYears: 12,
    quantity: (params, results) => oneIf(results.processedMeatValue > 0),
  },
  {
    id: 'preservesKitchen',
    category: 'processing',
    priceParam: 'investPreservesKitchen',
    lifetimeYears: 12,
    quantity: (params, results) => oneIf(results.processedValueBySpecies.preserves > 0),
  },
  {
    id: 'meatColdStore',
    category: 'processing',
    priceParam: 'investMeatColdStore',
    lifetimeYears: 10,
    quantity: (params, results) => oneIf(results.meatBoxKg > 0),
  },
  {
    id: 'tractor',
    category: 'machinery',
    priceParam: 'investTractor',
    lifetimeYears: 20,
    quantity: (params, results) =>
      oneIf(
        results.usableArableHa > 0 ||
          makesHay(params, results) ||
          results.nitrogen.manureTonnes > MANURE_TONNES_NEEDING_SPREADER
      ),
  },
  {
    id: 'haymakingSet',
    category: 'machinery',
    priceParam: 'investHaymakingSet',
    lifetimeYears: 15,
    quantity: (params, results) => oneIf(makesHay(params, results)),
  },
  {
    id: 'arableImplements',
    category: 'machinery',
    priceParam: 'investArableImplements',
    lifetimeYears: 15,
    quantity: (params, results) => oneIf(results.usableArableHa > 0),
  },
  {
    id: 'manureHandling',
    category: 'machinery',
    priceParam: 'investManureHandling',
    lifetimeYears: 15,
    quantity: (params, results) => oneIf(results.nitrogen.manureTonnes > MANURE_TONNES_NEEDING_SPREADER),
  },
  {
    id: 'livestockTrailer',
    category: 'machinery',
    priceParam: 'investLivestockTrailer',
    lifetimeYears: 15,
    quantity: (params, results) => oneIf(results.slaughter.totalTrips > 0 || results.weanersSold > 0),
  },
  {
    id: 'vegetables',
    category: 'produce',
    priceParam: 'investMarketGarden',
    lifetimeYears: 10,
    quantity: params => params.marketGardenHa,
  },
  {
    id: 'beehives',
    category: 'produce',
    priceParam: 'investBeehive',
    lifetimeYears: 15,
    quantity: params => params.beehives,
  },
];

/** Id of the switch "the farm already has it" of an infrastructure item, e.g. `ownsTractor`. */
const ownedParameterId = itemId => 'owns' + itemId.charAt(0).toUpperCase() + itemId.slice(1);
