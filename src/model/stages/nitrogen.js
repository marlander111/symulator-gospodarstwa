// Nitrogen and manure: how much nitrogen the animals produce, how much they spread themselves on
// the pasture and runs, how much ends up as manure to haul out, and the nitrogen balance of the
// fields and meadows that get the manure. Optionally the cattle and sheep winter outside on bale grazing.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.
//
// Amounts are approximate, per head and year, after the tables of the Polish nitrates programme.

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
/** Nitrogen fixed by a clover-grass ley per hectare and year (kg). */
const CLOVER_NITROGEN_FIXATION_PER_HA = 150;
/** Nitrogen taken off the field with one tonne of grain, one tonne of hay and one hectare of roots (kg). */
const NITROGEN_PER_TONNE_OF_GRAIN = 18;
const NITROGEN_PER_TONNE_OF_HAY = 25;
const NITROGEN_PER_HA_OF_ROOT_CROPS = 80;

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
/** Poultry kept outside in mobile houses and pens through the season. */
const RANGE_POULTRY = ['broilers', 'geese', 'ducks', 'turkeys', 'guineaFowl'];

function computeNitrogenBalance(params, results) {
  const headCount = animalNumbers(params, results);
  const nitrogenByAnimal = Object.fromEntries(
    Object.entries(NITROGEN_PER_HEAD).map(([animal, perHead]) => [animal, headCount[animal] * perHead])
  );
  const totalNitrogen = sumValues(nitrogenByAnimal);

  const grazingShare = params.grazingDays / 365;
  const isBaleGrazing = id => params.baleGrazing && BALE_GRAZING_ANIMALS.includes(id);
  let onPasture = 0;
  let onBaleGrazing = 0;
  let inManure = 0;
  for (const [animal, nitrogen] of Object.entries(nitrogenByAnimal)) {
    if (RANGE_POULTRY.includes(animal)) onPasture += nitrogen;
    else if (GRAZING_ANIMALS.includes(animal) || animal === 'layingHens') {
      onPasture += nitrogen * grazingShare;
      if (isBaleGrazing(animal)) onBaleGrazing += nitrogen * (1 - grazingShare);
      else inManure += nitrogen * (1 - grazingShare);
    } else inManure += nitrogen;
  }

  const manureTonnes = inManure / NITROGEN_PER_TONNE_OF_MANURE;
  const baleGrazingManureSavedTonnes = onBaleGrazing / NITROGEN_PER_TONNE_OF_MANURE;
  const fields = arableNitrogenBalance(params, results, inManure + onBaleGrazing);

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
    pigs: params.pigsForHome + params.pigsForSale,
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
