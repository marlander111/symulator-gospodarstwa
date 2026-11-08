// Feed balance: forage, grain and straw produced on the farm against what the animals need.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Forage (tonnes of dry matter per year) ----------

/** Dry matter per head and year (t) of the animals whose need does not depend on the breed. */
const FORAGE_PER_HEAD = {
  replacementHeifer: 3.3,
  bull: 5.0,
  eweBase: 0.55, // plus EWE_FORAGE_PER_LAMB for every lamb reared
  goat: 0.6,
  milkingGoatExtra: 0.15,
  rabbitDoe: 0.3,
  goose: 0.05,
  horse: 3.2,
  beefHeifer: 2.5,
  duck: 0.01,
  turkey: 0.04,
  guineaFowl: 0.005,
  pig: 0.15, // grass and roots eaten by pastured pigs
};
const EWE_FORAGE_PER_LAMB = 0.15;

function computeForageBalance(params, results) {
  const { replacementHeifers, bulls, sucklerCows, finishers, beefHeifers, lambsPerEwe, beefSystem } = results;
  const dairyBreed = DAIRY_BREEDS[params.dairyBreed] || DAIRY_BREEDS.extensive;
  const beefBreed = BEEF_BREEDS[params.beefBreed] || BEEF_BREEDS.extensive;
  const finisherForage = finishers * beefSystem.foragePerFinisherTonnes * beefBreed.youngStockDryMatterFactor;
  const forageNeedByAnimal = {
    dairyCows: params.dairyCows * dairyBreed.dryMatterPerCowTonnes,
    replacementHeifers: replacementHeifers * FORAGE_PER_HEAD.replacementHeifer,
    bull: bulls * FORAGE_PER_HEAD.bull,
    sheep: params.sheep * (FORAGE_PER_HEAD.eweBase + EWE_FORAGE_PER_LAMB * lambsPerEwe),
    goats:
      params.goats * (FORAGE_PER_HEAD.goat + (params.goatMilking ? FORAGE_PER_HEAD.milkingGoatExtra : 0)),
    rabbits: params.rabbits * FORAGE_PER_HEAD.rabbitDoe,
    geese: params.geese * FORAGE_PER_HEAD.goose,
    horses: params.horses * FORAGE_PER_HEAD.horse,
    beefCattle:
      sucklerCows * beefBreed.sucklerCowDryMatterTonnes +
      finisherForage +
      beefHeifers * FORAGE_PER_HEAD.beefHeifer * beefBreed.youngStockDryMatterFactor,
    ducks: params.ducks * FORAGE_PER_HEAD.duck,
    turkeys: params.turkeys * FORAGE_PER_HEAD.turkey,
    guineaFowl: params.guineaFowl * FORAGE_PER_HEAD.guineaFowl,
    pigs: params.pigs * FORAGE_PER_HEAD.pig,
  };
  const forageNeed = sumValues(forageNeedByAnimal);
  // finishers kept in the shed all year eat conserved forage only
  const housedForage = beefSystem.finishersGraze ? 0 : finisherForage;
  const grazingShare = params.grazingDays / 365;
  const ownPaddocks = ownPaddockForage(params, results.paddocks, forageNeedByAnimal, grazingShare);
  const grazingNeed = (forageNeed - housedForage) * grazingShare - ownPaddocks.grazingNeedOutside;
  const winterNeed =
    forageNeed -
    (forageNeed - housedForage) * grazingShare -
    ownPaddocks.pigNeedOutsideWinter +
    outwinteringHayWaste(params, forageNeedByAnimal, beefSystem);

  // sheep grazing after cattle use the pasture better
  const dairyHerd = params.dairyCows + replacementHeifers + bulls;
  const mixedGrazingFactor =
    params.sheep > 0 && dairyHerd > 0 ? Math.min(1, params.sheep / (1.5 * dairyHerd)) : 0;
  const herdPastureHa = results.paddocks.herdHa;
  const pastureProduction =
    herdPastureHa * params.pastureYield * (1 + (params.mixedGrazingBonus / 100) * mixedGrazingFactor);
  const mixedGrazingGain =
    ((herdPastureHa * params.pastureYield * params.mixedGrazingBonus) / 100) * mixedGrazingFactor;

  const meadowHay = params.meadowHa * params.meadowYield * 0.75;
  const meadowGrazing = params.meadowHa * params.meadowYield * 0.25;
  const cloverHay = results.cloverHa * params.cloverYield;

  const rotation = computeRotation(params);
  const fieldHa = results.usableArableHa / rotation.fieldCount;
  const catchCropHa = params.catchCrops ? rotation.catchCropFields * fieldHa : 0;
  const undersownHa = params.catchCrops ? rotation.undersownFields * fieldHa : 0;
  const stubbleCropHa = params.stubbleCrop ? rotation.stubbleCropFields * fieldHa : 0;
  const coverCropForage =
    catchCropHa * params.catchCropForageYield + stubbleCropHa * params.stubbleCropForageYield;

  const grazingSupply = pastureProduction + meadowGrazing + coverCropForage;
  const grazingSurplus = grazingSupply - grazingNeed;
  const hayFromPasture = Math.max(0, grazingSurplus) * 0.7;
  const haySupply = meadowHay + cloverHay + hayFromPasture;
  const grazingDeficit = Math.max(0, -grazingSurplus);
  // a paddock of their own that grows too little for the pigs or goats is made up with hay
  const hayNeedTotal = winterNeed + grazingDeficit + ownPaddocks.deficit;
  // roughage bought on purpose covers this part of the need, the rest has to come from the fields
  const boughtForageTonnes = (hayNeedTotal * params.boughtForageShare) / 100;
  const hayNeed = hayNeedTotal - boughtForageTonnes;

  return {
    forageNeedByAnimal,
    forageNeed,
    grazingNeed,
    winterNeed,
    mixedGrazingGain,
    grazingSupply,
    grazingSurplus,
    hayFromPasture,
    haySupply,
    hayNeedTotal,
    ownPaddocks,
    boughtForageTonnes,
    hayNeed,
    hayBalance: haySupply - hayNeed,
    meadowHay,
    cloverHay,
    rotation,
    fieldHa,
    catchCropHa,
    undersownHa,
    stubbleCropHa,
    coverCropForage,
  };
}

/** Share of the grass eaten on a pig paddock (pigs root and trample) and on a goat paddock. */
const PIG_PADDOCK_UTILISATION = 0.5;
const GOAT_PADDOCK_UTILISATION = 0.7;

/**
 * Forage of the animals that do not graze with the herd: pigs (on their own paddock, or on the
 * orchard, stubble and fields when they are not on the pasture) and goats kept apart. Their
 * grazing comes off the herd's need; a paddock of their own that grows too little leaves a
 * deficit made up with hay.
 */
function ownPaddockForage(params, paddocks, forageNeedByAnimal, grazingShare) {
  // fattening pigs live outside from spring to autumn, so all their forage is grazing
  const pigNeed = forageNeedByAnimal.pigs;
  const goatGrazingNeed = params.goatGrazing === 'separate' ? forageNeedByAnimal.goats * grazingShare : 0;
  const pigSupply = paddocks.pigHa * params.pastureYield * PIG_PADDOCK_UTILISATION;
  const goatSupply = paddocks.goatHa * params.pastureYield * GOAT_PADDOCK_UTILISATION;
  const pigDeficit = params.pigsOnPasture ? Math.max(0, pigNeed - pigSupply) : 0;
  const goatDeficit = Math.max(0, goatGrazingNeed - goatSupply);
  return {
    grazingNeedOutside: pigNeed * grazingShare + goatGrazingNeed,
    pigNeedOutsideWinter: pigNeed * (1 - grazingShare),
    pigSupply,
    goatSupply,
    pigNeed,
    goatGrazingNeed,
    deficit: pigDeficit + goatDeficit,
  };
}

// ---------- Grain and straw (tonnes per year) ----------

/** Grain per head and year (t) of the animals whose grain is not set by a slider. */
const GRAIN_PER_HEAD = {
  goose: 0.012,
  ewePerLambing: 0.01,
  horse: 0.2,
  milkingGoat: 0.1,
};
/** Share of the feed of hens, broilers, ducks and other poultry that is the farm's own grain (the rest is minerals and grit). */
const HEN_GRAIN_SHARE = 0.9;
const BROILER_GRAIN_SHARE = 0.9;
const TURKEY_GRAIN_SHARE = 0.85;
/** Dry matter in a litre of whey or buttermilk, which replaces grain for pigs and hens. */
const BYPRODUCT_DRY_MATTER_PER_LITRE = 0.06;
/** Most of the grain that whey and buttermilk may replace: pigs and hens. */
const BYPRODUCT_MAX_SHARE_OF_PIG_GRAIN = 0.3;
const BYPRODUCT_MAX_SHARE_OF_HEN_GRAIN = 0.1;

function computeGrainBalance(params, results) {
  const { henReplacements, cockerels, finishers, beefSystem } = results;
  const kg = amount => amount / 1000;
  const grainNeedByAnimal = {
    layingHens:
      kg(params.layingHens * params.henFeedGramsPerDay) *
      0.365 *
      (1 - params.rangeFeedSaving / 100) *
      HEN_GRAIN_SHARE,
    hatching: params.ownHatching
      ? kg(henReplacements * params.pulletGrainKg + cockerels * params.cockerelGrainKg)
      : 0,
    broilers: kg(params.broilers * params.broilerFeedKg) * BROILER_GRAIN_SHARE,
    geese: params.geese * GRAIN_PER_HEAD.goose,
    ducks: kg(params.ducks * params.duckGrainKg) * BROILER_GRAIN_SHARE,
    turkeys: kg(params.turkeys * params.turkeyGrainKg) * TURKEY_GRAIN_SHARE,
    guineaFowl: kg(params.guineaFowl * params.guineaFowlGrainKg) * TURKEY_GRAIN_SHARE,
    dairyCows: kg(params.dairyCows * params.oatsPerCow),
    beefCattle: finishers * beefSystem.grainPerFinisherTonnes,
    pigs: kg(params.pigs * params.pigGrainKg),
    // a doe eats about 40 kg a year and each young rabbit about 3 kg until slaughter
    rabbits: kg(params.rabbits * (params.rabbitsRearedPerDoe * 3 + 40)),
    sheep: params.sheep * GRAIN_PER_HEAD.ewePerLambing * params.lambingsPerEwe,
    goats: params.goatMilking ? params.goats * GRAIN_PER_HEAD.milkingGoat : 0,
    horses: params.horses * GRAIN_PER_HEAD.horse,
  };

  // whey and buttermilk replace part of the pigs' grain, then a little of the hens'
  let byproductGrain =
    ((results.byproductsFedLitres + results.goatWheyLitres) * BYPRODUCT_DRY_MATTER_PER_LITRE) / 1000;
  const replaceGrain = (animal, maxShare) => {
    const replaced = Math.min(byproductGrain, grainNeedByAnimal[animal] * maxShare);
    grainNeedByAnimal[animal] -= replaced;
    byproductGrain -= replaced;
    return replaced;
  };
  const wheyGrainSaved =
    replaceGrain('pigs', BYPRODUCT_MAX_SHARE_OF_PIG_GRAIN) +
    replaceGrain('layingHens', BYPRODUCT_MAX_SHARE_OF_HEN_GRAIN);

  const grainNeedTotal = sumValues(grainNeedByAnimal);
  const boughtGrainTonnes = (grainNeedTotal * params.boughtConcentrateShare) / 100;
  const grainNeed = grainNeedTotal - boughtGrainTonnes;
  // fodder beet and potatoes replace grain in the rations at about their dry-matter energy
  const grainSupply = results.cerealHa * params.cerealYield + results.rootCropHa * params.rootCropYield;
  const grainSoldTonnes = surplusGrainForSale(params, grainSupply, grainNeed);
  return {
    grainNeedByAnimal,
    wheyGrainSaved,
    grainNeedTotal,
    boughtGrainTonnes,
    grainNeed,
    grainSupply,
    grainSoldTonnes,
    grainBalance: grainSupply - grainSoldTonnes - grainNeed,
  };
}

/**
 * Grain sold after harvest: everything above the animals' need plus a reserve for a poor year
 * (`feedReserveShare` percent of the need). Without animals all the grain is sold.
 */
function surplusGrainForSale(params, grainSupply, grainNeed) {
  if (!params.sellSurplusGrain) return 0;
  const kept = grainNeed * (1 + params.feedReserveShare / 100);
  return Math.max(0, grainSupply - kept);
}

/** Share of hay trampled and left when animals winter on bale grazing. */
const BALE_GRAZING_HAY_WASTE = 0.1;
/** Share of the winter bedding still needed with bale grazing (stormy days, calving, lambing). */
const BALE_GRAZING_BEDDING_SHARE = 0.3;
/** Forage-need keys of the cattle, sheep and goats that winter outside on bale grazing. */
const BALE_GRAZING_FORAGE_KEYS = ['dairyCows', 'replacementHeifers', 'bull', 'beefCattle', 'sheep', 'goats'];

/**
 * Hay trampled in winter by animals kept outside: all cattle, sheep and goats on bale grazing,
 * or the beef herd when it lives outside all year.
 */
function outwinteringHayWaste(params, forageNeedByAnimal, beefSystem) {
  const winterShare = (365 - params.grazingDays) / 365;
  const outsideKeys = params.baleGrazing
    ? BALE_GRAZING_FORAGE_KEYS
    : beefSystem.outwintering
      ? ['beefCattle']
      : [];
  return sumBy(outsideKeys, key => forageNeedByAnimal[key]) * winterShare * BALE_GRAZING_HAY_WASTE;
}

/** Straw for bedding per head and year (t) at REFERENCE_WINTER_DAYS of housing; poultry per bird. */
const STRAW_PER_HEAD = {
  dairyCow: 1.2,
  replacementHeifer: 0.6,
  bull: 0.8,
  ewe: 0.12,
  goat: 0.1,
  horse: 1.2,
  sucklerCow: 1.0,
  finisher: 0.8,
  beefHeifer: 0.6,
  layingHen: 0.006,
  broiler: 0.002,
  goose: 0.01,
  duck: 0.005,
  turkey: 0.015,
  guineaFowl: 0.002,
  pig: 0.3, // pastured pigs need bedding only in their huts
  rabbitDoe: 0.05,
};

function computeStrawBalance(params, results) {
  const { replacementHeifers, bulls, sucklerCows, finishers, beefHeifers, winterFactor, beefSystem } =
    results;
  const straw = STRAW_PER_HEAD;
  const beefWinterFactor = winterFactor * beefSystem.strawFactor;
  const strawNeedByAnimal = {
    dairyCows: params.dairyCows * straw.dairyCow * winterFactor,
    replacementHeifers: replacementHeifers * straw.replacementHeifer * winterFactor,
    bull: bulls * straw.bull * winterFactor,
    sheep: params.sheep * straw.ewe * winterFactor * (0.7 + 0.3 * params.lambingsPerEwe),
    goats: params.goats * straw.goat * winterFactor,
    horses: params.horses * straw.horse * winterFactor,
    beefCattle:
      (sucklerCows * straw.sucklerCow + finishers * straw.finisher + beefHeifers * straw.beefHeifer) *
      beefWinterFactor,
    layingHens: params.winterPolytunnel ? 0 : params.layingHens * straw.layingHen,
    broilers: params.broilers * straw.broiler,
    geese: params.geese * straw.goose,
    ducks: params.ducks * straw.duck,
    turkeys: params.turkeys * straw.turkey,
    guineaFowl: params.guineaFowl * straw.guineaFowl,
    pigs: params.pigs * straw.pig,
    rabbits: params.rabbits * straw.rabbitDoe,
  };
  if (params.baleGrazing)
    for (const key of BALE_GRAZING_FORAGE_KEYS.concat(['replacementHeifers', 'bull']))
      if (key in strawNeedByAnimal) strawNeedByAnimal[key] *= BALE_GRAZING_BEDDING_SHARE;
  const strawNeed = sumValues(strawNeedByAnimal);
  // straw beyond the need and the reserve stays on the field and is ploughed in
  const strawHarvest = results.cerealHa * params.strawYield;
  const strawPloughedTonnes = Math.max(0, strawHarvest - strawNeed * (1 + params.feedReserveShare / 100));
  const strawSupply = strawHarvest - strawPloughedTonnes;
  const strawBalanceBeforeSawdust = strawSupply - strawNeed;
  const sawdustTonnes =
    params.sawdustForStraw && strawBalanceBeforeSawdust < 0
      ? -strawBalanceBeforeSawdust * params.sawdustPerStrawTonne
      : 0;
  const strawBalance = params.sawdustForStraw
    ? Math.max(0, strawBalanceBeforeSawdust)
    : strawBalanceBeforeSawdust;
  return {
    strawNeedByAnimal,
    strawNeed,
    strawHarvest,
    strawPloughedTonnes,
    strawSupply,
    strawBalance,
    strawBalanceBeforeSawdust,
    sawdustTonnes,
  };
}
