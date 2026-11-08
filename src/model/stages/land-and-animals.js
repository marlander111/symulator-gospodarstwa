// Land use, herd and flock sizes, and livestock units.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Land ----------

function computeLandUse(params) {
  const arableHa =
    params.ownedHa +
    params.leasedHa -
    params.farmyardHa -
    params.pastureHa -
    params.meadowHa -
    params.marketGardenHa;
  const usableArableHa = Math.max(0, arableHa);
  // root crops take one field of the rotation out of the cereals
  const cerealAndRootHa = (usableArableHa * params.cerealShare) / 100;
  const rotation = computeRotation(params);
  const rootCropHa = Math.min(cerealAndRootHa, (usableArableHa * rotation.rootFields) / rotation.fieldCount);
  const cerealHa = cerealAndRootHa - rootCropHa;
  const cloverHa = usableArableHa - cerealAndRootHa;
  const orchardHa = Math.min(params.orchardHa, params.farmyardHa);
  const farmedHa = params.pastureHa + params.meadowHa + usableArableHa + orchardHa + params.marketGardenHa;
  const grasslandHa = params.pastureHa + params.meadowHa;
  return {
    arableHa,
    usableArableHa,
    cerealHa,
    rootCropHa,
    cloverHa,
    farmedHa,
    orchardHa,
    grasslandHa,
    paddocks: separatePaddocks(params),
  };
}

// ---------- Animals ----------

/** Share of suckler cows that rear a calf each year, and of the cows replaced each year. */
const SUCKLER_CALVING_RATE = 0.9;
const SUCKLER_REPLACEMENT_RATE = 0.15;
/** Beef heifers being reared at any time per replacement needed (they calve at about two years). */
const BEEF_HEIFERS_PER_REPLACEMENT = 2;
/** Shed places of one finisher and one beef heifer, relative to a cow. */
const SHED_PLACES_PER_FINISHER = 0.7;
const SHED_PLACES_PER_BEEF_HEIFER = 0.6;
/** Days of winter housing that the straw norms per head assume. */
const REFERENCE_WINTER_DAYS = 165;

function computeHerdStructure(params) {
  const replacementHeifers = params.dairyCows > 0 ? (2 * params.dairyCows) / params.lactationsPerCow : 0;
  const bulls = params.ownBull && params.dairyCows > 0 ? 1 : 0;
  const kids = params.goats * params.kidsPerDoe;
  const kidsSold = (kids * params.kidsSoldShare) / 100;
  const sucklerCows = params.sucklerCows;
  const beefCalves = sucklerCows * SUCKLER_CALVING_RATE;
  const beefReplacements = sucklerCows * SUCKLER_REPLACEMENT_RATE;
  const beefCalvesKept = Math.max(0, beefCalves - beefReplacements);
  const weanersSold = (beefCalvesKept * params.weanersSoldShare) / 100;
  const finishers = beefCalvesKept - weanersSold;
  const beefHeifers = beefReplacements * BEEF_HEIFERS_PER_REPLACEMENT;
  const lambsPerEwe = params.lambsPerLambing * params.lambingsPerEwe;
  // straw for bedding scales with the length of winter housing
  const winterFactor = (365 - params.grazingDays) / REFERENCE_WINTER_DAYS;
  const beefSystem = BEEF_SYSTEMS[params.beefSystem] || BEEF_SYSTEMS.mixed;
  const beefShedPlaces =
    (sucklerCows + finishers * SHED_PLACES_PER_FINISHER + beefHeifers * SHED_PLACES_PER_BEEF_HEIFER) *
    beefSystem.shedPlacesFactor;
  const dairyShedPlaces = params.dairyCows + replacementHeifers + bulls;
  return {
    replacementHeifers,
    bulls,
    kids,
    kidsSold,
    sucklerCows,
    beefReplacements,
    weanersSold,
    finishers,
    beefHeifers,
    lambsPerEwe,
    winterFactor,
    beefSystem,
    beefShedPlaces,
    dairyShedPlaces,
    cattleShedPlaces: dairyShedPlaces + beefShedPlaces,
  };
}

// ---------- Livestock units ----------

/**
 * Livestock units (DJP) per head as in the organic payment rules (Dz.U. 2023 poz. 481, annex 4),
 * which also set the 0.5–1.5 DJP/ha of the crop-and-livestock bonus. Animals kept for part of the
 * year count by their average presence: broilers in four batches, geese and turkeys about half a
 * year, fatteners about seven months. Rabbits are not in the table: an orientation value.
 */
const LIVESTOCK_UNITS_PER_HEAD = {
  dairyCows: 1,
  replacementHeifers: 0.6, // between 0.3 (6–12 months) and 0.8 (over a year)
  bull: 1.4,
  sheep: 0.1,
  goats: 0.15,
  horses: 1.2, // large breeds; small breeds such as Hucul 0.6
  sucklerCows: 1,
  finishers: 0.9,
  beefHeifers: 0.6,
  poultry: 0.004, // hens, ducks, broilers, guinea fowl
  geese: 0.008,
  turkeys: 0.032,
  pigs: 0.3,
  rabbits: 0.02,
};

function computeLivestockUnits(params, results) {
  const { replacementHeifers, bulls, sucklerCows, finishers, beefHeifers, farmedHa, grasslandHa } = results;
  const lu = LIVESTOCK_UNITS_PER_HEAD;
  const livestockUnitsByAnimal = {
    dairyCows: params.dairyCows * lu.dairyCows,
    replacementHeifers: replacementHeifers * lu.replacementHeifers,
    bull: bulls * lu.bull,
    sheep: params.sheep * lu.sheep,
    goats: params.goats * lu.goats,
    horses: params.horses * lu.horses,
    beefCattle: sucklerCows * lu.sucklerCows + finishers * lu.finishers + beefHeifers * lu.beefHeifers,
    layingHens: params.layingHens * lu.poultry,
    broilers: (params.broilers / 4) * lu.poultry,
    geese: params.geese * 0.5 * lu.geese,
    ducks: (params.ducks / 2) * lu.poultry,
    turkeys: params.turkeys * 0.5 * lu.turkeys,
    guineaFowl: params.guineaFowl * 0.5 * lu.poultry,
    pigs: params.pigs * (7 / 12) * lu.pigs,
    rabbits: params.rabbits * lu.rabbits,
  };
  const units = livestockUnitsByAnimal;
  const livestockUnits = sumValues(units);
  const grazingUnits = units.dairyCows + units.replacementHeifers + units.bull + units.sheep + units.goats;
  return {
    livestockUnitsByAnimal,
    livestockUnits,
    livestockUnitsPerHa: farmedHa > 0 ? livestockUnits / farmedHa : 0,
    grasslandStocking: grasslandHa > 0 ? (grazingUnits + units.horses + units.beefCattle) / grasslandHa : 0,
  };
}
