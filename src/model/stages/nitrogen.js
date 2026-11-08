// Nitrogen and carbon: how much nitrogen the animals produce, how much they spread themselves on
// the pasture and runs, how much ends up as manure to haul out, the nitrogen cycle of the whole
// farm (what comes in, what leaves with the products, what is lost), and a rough estimate of the
// carbon the soil stores against the methane the ruminants breathe out.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.
//
// Amounts are approximate, per head and year, after the tables of the Polish nitrates programme;
// the carbon figures are orientation values for planning, not a certified carbon account.

/** Nitrogen in excreta per head and year (kg N); meat poultry per bird raised. */
const NITROGEN_PER_HEAD = {
  dairyCows: 70,
  replacementHeifers: 40,
  bull: 55,
  sucklerCows: 65,
  finishers: 40,
  beefHeifers: 35,
  sheep: 11,
  goats: 9,
  horses: 45,
  pigs: 5,
  layingHens: 0.5,
  broilers: 0.04,
  geese: 0.35,
  ducks: 0.12,
  turkeys: 0.4,
  guineaFowl: 0.04,
  rabbits: 3,
};

/** Upper limit of nitrogen from farm manures per hectare and year (organic rules, nitrates programme). */
const MANURE_NITROGEN_LIMIT_PER_HA = 170;
/** Nitrogen in one tonne of farmyard manure (kg). */
const NITROGEN_PER_TONNE_OF_MANURE = 5;
/** Nitrogen fixed by a clover-grass ley and by grazed grass with white clover per hectare and year (kg). */
const CLOVER_NITROGEN_FIXATION_PER_HA = 150;
const PASTURE_CLOVER_FIXATION_PER_HA = 30;
/** Nitrogen falling with rain and dust per hectare and year in Poland (kg). */
const ATMOSPHERIC_NITROGEN_PER_HA = 12;
/** Nitrogen in one tonne of grain, one tonne of hay (dry matter) and one hectare of root crops (kg). */
const NITROGEN_PER_TONNE_OF_GRAIN = 18;
const NITROGEN_PER_TONNE_OF_HAY = 25;
const NITROGEN_PER_HA_OF_ROOT_CROPS = 80;
/** Nitrogen leaving the farm in products: per 1000 l of milk, per kg of carcass, per egg (kg). */
const NITROGEN_PER_1000_LITRES_OF_MILK = 5.3;
const NITROGEN_PER_KG_OF_CARCASS = 0.03;
const NITROGEN_PER_EGG = 0.0011;
/** Share of nitrogen lost as ammonia from housed manure, and from dung and urine on the pasture. */
const AMMONIA_LOSS_FROM_MANURE = 0.25;
const AMMONIA_LOSS_ON_PASTURE = 0.08;
/** Dung on the bale-grazing field loses ammonia about half as fast as manure in a heap. */
const BALE_GRAZING_AMMONIA_FACTOR = 0.5;
/** Carcass share of a live weaner, to count the nitrogen leaving with animals sold live. */
const WEANER_CARCASS_SHARE = 0.55;
/** Smallest bale-grazing field (ha) counted for soil carbon. */
const MIN_BALE_GRAZING_HA = 0.5;

/** Animals that spend the grazing season on the pasture. */
const GRAZING_ANIMALS = [
  'dairyCows',
  'replacementHeifers',
  'bull',
  'sucklerCows',
  'finishers',
  'beefHeifers',
  'sheep',
  'goats',
  'horses',
  'pigs',
];
/** Animals that can winter outside on bale grazing. */
const BALE_GRAZING_ANIMALS = [
  'dairyCows',
  'replacementHeifers',
  'bull',
  'sucklerCows',
  'finishers',
  'beefHeifers',
  'sheep',
  'goats',
];
/** Beef animals that winter outside when the herd lives outside all year. */
const OUTWINTERED_BEEF_ANIMALS = ['sucklerCows', 'finishers', 'beefHeifers'];
/** Poultry kept outside in mobile houses and pens through the season. */
const RANGE_POULTRY = ['broilers', 'geese', 'ducks', 'turkeys', 'guineaFowl'];

function computeNitrogenBalance(params, results) {
  const headCount = animalNumbers(params, results);
  const nitrogenByAnimal = Object.fromEntries(
    Object.entries(NITROGEN_PER_HEAD).map(([animal, perHead]) => [animal, headCount[animal] * perHead])
  );
  const totalNitrogen = sumValues(nitrogenByAnimal);

  const grazingShare = params.grazingDays / 365;
  const winterOutside = id =>
    (params.baleGrazing && BALE_GRAZING_ANIMALS.includes(id)) ||
    (results.beefSystem.outwintering && OUTWINTERED_BEEF_ANIMALS.includes(id));
  const housedAllYear = id => id === 'finishers' && !results.beefSystem.finishersGraze;
  let onPasture = 0;
  let onBaleGrazing = 0;
  let inManure = 0;
  for (const [animal, nitrogen] of Object.entries(nitrogenByAnimal)) {
    if (RANGE_POULTRY.includes(animal)) onPasture += nitrogen;
    else if (housedAllYear(animal)) inManure += nitrogen;
    else if (GRAZING_ANIMALS.includes(animal) || animal === 'layingHens') {
      onPasture += nitrogen * grazingShare;
      if (winterOutside(animal)) onBaleGrazing += nitrogen * (1 - grazingShare);
      else inManure += nitrogen * (1 - grazingShare);
    } else inManure += nitrogen;
  }

  const manureTonnes = inManure / NITROGEN_PER_TONNE_OF_MANURE;
  const baleGrazingManureSavedTonnes = onBaleGrazing / NITROGEN_PER_TONNE_OF_MANURE;
  const fields = arableNitrogenBalance(params, results, inManure + onBaleGrazing);
  const farmCycle = farmNitrogenCycle(params, results, { onPasture, inManure, onBaleGrazing, fields });

  return {
    nitrogen: {
      total: totalNitrogen,
      perFarmedHa: results.farmedHa > 0 ? totalNitrogen / results.farmedHa : 0,
      limitPerHa: MANURE_NITROGEN_LIMIT_PER_HA,
      onPasture,
      onBaleGrazing,
      inManure,
      manureTonnes,
      manureHours: manureTonnes * params.manureHoursPerTonne,
      pasturePerHa: params.pastureHa > 0 ? onPasture / params.pastureHa : 0,
      baleGrazingManureSavedTonnes,
      ...fields,
      cycle: farmCycle,
    },
  };
}

function animalNumbers(params, results) {
  return {
    dairyCows: params.dairyCows,
    replacementHeifers: results.replacementHeifers,
    bull: results.bulls,
    sucklerCows: results.sucklerCows,
    finishers: results.finishers,
    beefHeifers: results.beefHeifers,
    sheep: params.sheep,
    goats: params.goats,
    horses: params.horses,
    pigs: params.pigs,
    layingHens: params.layingHens,
    broilers: params.broilers,
    geese: params.geese,
    ducks: params.ducks,
    turkeys: params.turkeys,
    guineaFowl: params.guineaFowl,
    rabbits: params.rabbits,
  };
}

/**
 * Nitrogen balance of the land that gets the manure (arable fields and hay meadows): manure and
 * bale-grazing dung plus clover fixation, minus what the grain, the hay and the root crops take off.
 */
function arableNitrogenBalance(params, results, manureNitrogen) {
  const manuredHa = results.usableArableHa + params.meadowHa;
  const cloverFixation = results.cloverHa * CLOVER_NITROGEN_FIXATION_PER_HA;
  const grainHarvest = results.cerealHa * params.cerealYield;
  const removedWithCrops =
    grainHarvest * NITROGEN_PER_TONNE_OF_GRAIN +
    (results.cloverHay + results.meadowHay) * NITROGEN_PER_TONNE_OF_HAY +
    results.rootCropHa * NITROGEN_PER_HA_OF_ROOT_CROPS;
  const balance = manureNitrogen + cloverFixation - removedWithCrops;
  return {
    manuredHa,
    manureToFields: manureNitrogen,
    cloverFixation,
    removedWithCrops,
    fieldBalancePerHa: manuredHa > 0 ? balance / manuredHa : 0,
  };
}

/**
 * Farm-gate nitrogen cycle: inputs (legumes, rain, bought feed), what leaves with the products
 * (milk, meat, eggs, grain), ammonia losses, and the rest that stays in the soil or is leached.
 * Products are counted from the herd and flock sizes, so this stage can run before revenue.
 */
function farmNitrogenCycle(params, results, { onPasture, inManure, onBaleGrazing, fields }) {
  const catchCropMix = CATCH_CROP_MIXES[params.catchCropMix] || CATCH_CROP_MIXES[0];
  const stubbleMix = STUBBLE_CROP_MIXES[params.stubbleCropMix] || STUBBLE_CROP_MIXES[0];
  const inputs = {
    clover: fields.cloverFixation,
    pastureClover: params.pastureHa * PASTURE_CLOVER_FIXATION_PER_HA,
    coverCrops:
      results.catchCropHa * catchCropMix.legumeNitrogen + results.stubbleCropHa * stubbleMix.legumeNitrogen,
    atmosphere: results.farmedHa * ATMOSPHERIC_NITROGEN_PER_HA,
    boughtFeed:
      results.boughtForageTonnes * NITROGEN_PER_TONNE_OF_HAY +
      results.boughtGrainTonnes * NITROGEN_PER_TONNE_OF_GRAIN +
      Math.max(0, -results.grainBalance) * NITROGEN_PER_TONNE_OF_GRAIN +
      Math.max(0, -results.hayBalance) * NITROGEN_PER_TONNE_OF_HAY,
  };
  const carcassKg =
    params.broilers * params.broilerCarcassKg +
    results.finishers * ((params.finisherWeightKg * params.finisherKillingOut) / 100) +
    results.weanersSold * params.weanerWeightKg * WEANER_CARCASS_SHARE +
    params.sheep * results.lambsPerEwe * ((params.lambLiveWeightKg * params.lambKillingOut) / 100) +
    params.pigs * params.pigCarcassKg +
    params.geese * GOOSE_CARCASS_KG +
    params.ducks * params.duckCarcassKg +
    params.turkeys * params.turkeyCarcassKg;
  const outputs = {
    milk: ((results.milkTotal + results.goatMilkUsed) / 1000) * NITROGEN_PER_1000_LITRES_OF_MILK,
    meat: carcassKg * NITROGEN_PER_KG_OF_CARCASS,
    eggs: params.layingHens * params.eggsPerHen * NITROGEN_PER_EGG,
    grain: results.grainSoldTonnes * NITROGEN_PER_TONNE_OF_GRAIN,
  };
  const ammonia =
    (inManure + onBaleGrazing * BALE_GRAZING_AMMONIA_FACTOR) * AMMONIA_LOSS_FROM_MANURE +
    onPasture * AMMONIA_LOSS_ON_PASTURE;
  const totalInputs = sumValues(inputs);
  const totalOutputs = sumValues(outputs);
  const surplus = totalInputs - totalOutputs;
  return {
    inputs,
    outputs,
    totalInputs,
    totalOutputs,
    ammonia,
    surplus,
    surplusPerHa: results.farmedHa > 0 ? surplus / results.farmedHa : 0,
    // after ammonia, what stays in the soil (organic matter) or may be leached
    soilOrLeachedPerHa: results.farmedHa > 0 ? (surplus - ammonia) / results.farmedHa : 0,
    efficiency: totalInputs > 0 ? totalOutputs / totalInputs : 0,
  };
}

// ---------- Carbon ----------

/** Soil carbon stored per hectare and year (t C), orientation values for Polish conditions. */
const SOIL_CARBON_PER_HA = {
  pastureDailyMovesLongRest: 0.5, // adaptive grazing: moves at least every 3 days, rests of 40+ days
  pastureRotational: 0.3,
  pastureSetStocked: 0.1, // moved once a week or less
  meadow: 0.2,
  clover: 0.5,
  cereals: -0.2, // ploughed arable land without cover loses carbon
  catchCrop: 0.3, // added on the hectares with a cover crop
  manure: 0.25, // added on the manured hectares
  orchard: 0.3,
  baleGrazing: 0.3, // dung and trampled hay on the wintering field
};
/** Tonnes of CO2 per tonne of carbon. */
const CO2_PER_CARBON = 3.67;
/** Methane from digestion per head and year (kg CH4), and its global warming potential (100 years). */
const ENTERIC_METHANE_PER_HEAD = {
  dairyCows: 110,
  replacementHeifers: 50,
  bull: 70,
  sucklerCows: 85,
  finishers: 60,
  beefHeifers: 50,
  sheep: 8,
  goats: 5,
  horses: 18,
  pigs: 1.5,
};
const METHANE_WARMING_POTENTIAL = 27;

function computeCarbonBalance(params, results) {
  const plan = results.grazingPlan;
  const pastureRate =
    plan.moveIntervalDays <= 3 && plan.restDays >= 40
      ? SOIL_CARBON_PER_HA.pastureDailyMovesLongRest
      : plan.moveIntervalDays >= 7
        ? SOIL_CARBON_PER_HA.pastureSetStocked
        : SOIL_CARBON_PER_HA.pastureRotational;
  const manuredHa = results.rotation.manuredFields * results.fieldHa;
  const baleGrazingHa =
    results.nitrogen.onBaleGrazing > 0
      ? Math.max(MIN_BALE_GRAZING_HA, results.nitrogen.onBaleGrazing / MANURE_NITROGEN_LIMIT_PER_HA)
      : 0;
  const soilCarbonByLand = {
    pasture: params.pastureHa * pastureRate,
    meadow: params.meadowHa * SOIL_CARBON_PER_HA.meadow,
    clover: results.cloverHa * SOIL_CARBON_PER_HA.clover,
    cereals: (results.cerealHa + results.rootCropHa) * SOIL_CARBON_PER_HA.cereals,
    coverCrops:
      (results.catchCropHa + results.undersownHa + results.stubbleCropHa) * SOIL_CARBON_PER_HA.catchCrop,
    manure: manuredHa * SOIL_CARBON_PER_HA.manure,
    orchard: results.orchardHa * SOIL_CARBON_PER_HA.orchard,
    baleGrazing: baleGrazingHa * SOIL_CARBON_PER_HA.baleGrazing,
  };
  const soilCarbon = sumValues(soilCarbonByLand);
  const headCount = animalNumbers(params, results);
  const methaneKg = sumBy(
    Object.keys(ENTERIC_METHANE_PER_HEAD),
    id => headCount[id] * ENTERIC_METHANE_PER_HEAD[id]
  );
  const sequestrationCo2 = soilCarbon * CO2_PER_CARBON;
  const methaneCo2 = (methaneKg * METHANE_WARMING_POTENTIAL) / 1000;
  return {
    carbon: {
      soilCarbonByLand,
      soilCarbon,
      soilCarbonPerHa: results.farmedHa > 0 ? soilCarbon / results.farmedHa : 0,
      sequestrationCo2,
      methaneKg,
      methaneCo2,
      netCo2: sequestrationCo2 - methaneCo2,
      pastureRate,
    },
  };
}
