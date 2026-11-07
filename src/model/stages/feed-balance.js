// Feed balance: forage, grain and straw produced on the farm against what the animals need.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Forage (tonnes of dry matter per year) ----------

function computeForageBalance(params, results) {
  const { replacementHeifers, bulls, sucklerCows, finishers, beefHeifers, lambsPerEwe } = results;
  const forageNeedByAnimal = {
    dairyCows: params.dairyCows * 5.5,
    replacementHeifers: replacementHeifers * 3.3,
    bull: bulls * 5.0,
    sheep: params.sheep * (0.55 + 0.15 * lambsPerEwe),
    goats: params.goats * 0.6,
    rabbits: params.rabbits * 0.3,
    geese: params.geese * 0.05,
    horses: params.horses * 3.2,
    beefCattle: sucklerCows * 4.8 + finishers * 3.5 + beefHeifers * 2.5,
    ducks: params.ducks * 0.01,
    turkeys: params.turkeys * 0.04,
    guineaFowl: params.guineaFowl * 0.005,
  };
  const forageNeed = sumValues(forageNeedByAnimal);
  const grazingNeed = (forageNeed * params.grazingDays) / 365;
  const winterNeed = forageNeed - grazingNeed;

  // sheep grazing after cattle use the pasture better
  const dairyHerd = params.dairyCows + replacementHeifers + bulls;
  const mixedGrazingFactor =
    params.sheep > 0 && dairyHerd > 0 ? Math.min(1, params.sheep / (1.5 * dairyHerd)) : 0;
  const pastureProduction =
    params.pastureHa * params.pastureYield * (1 + (params.mixedGrazingBonus / 100) * mixedGrazingFactor);
  const mixedGrazingGain =
    ((params.pastureHa * params.pastureYield * params.mixedGrazingBonus) / 100) * mixedGrazingFactor;

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
  const hayNeed = winterNeed + grazingDeficit;

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

// ---------- Grain and straw (tonnes per year) ----------

function computeGrainBalance(params, results) {
  const { henReplacements, cockerels, wheyLitres } = results;
  const grainNeedByAnimal = {
    layingHens:
      ((params.layingHens * params.henFeedGramsPerDay) / 1e6) *
      365 *
      (1 - params.rangeFeedSaving / 100) *
      0.9,
    hatching: params.ownHatching
      ? (henReplacements * params.pulletGrainKg + cockerels * params.cockerelGrainKg) / 1000
      : 0,
    broilers: ((params.broilers * params.broilerFeedKg) / 1000) * 0.9,
    geese: params.geese * 0.012,
    ducks: ((params.ducks * params.duckGrainKg) / 1000) * 0.9,
    turkeys: ((params.turkeys * params.turkeyGrainKg) / 1000) * 0.85,
    guineaFowl: ((params.guineaFowl * params.guineaFowlGrainKg) / 1000) * 0.85,
    dairyCows: (params.dairyCows * params.oatsPerCow) / 1000,
    pigs: (params.pigsForHome + params.pigsForSale) * 0.35,
    rabbits: (params.rabbits * (params.rabbitsRearedPerDoe * 3 + 40)) / 1000,
    sheep: params.sheep * 0.01 * params.lambingsPerEwe,
    horses: params.horses * 0.2,
  };

  // whey from cheese replaces up to 30% of the pigs' grain
  const wheyDryMatter = (wheyLitres * 0.06) / 1000;
  const pigGrainWithoutWhey = grainNeedByAnimal.pigs;
  grainNeedByAnimal.pigs = Math.max(pigGrainWithoutWhey * 0.7, pigGrainWithoutWhey - wheyDryMatter);

  const grainNeed = sumValues(grainNeedByAnimal);
  // fodder beet and potatoes replace grain in the rations at about their dry-matter energy
  const grainSupply = results.cerealHa * params.cerealYield + results.rootCropHa * params.rootCropYield;
  return {
    grainNeedByAnimal,
    wheyGrainSaved: pigGrainWithoutWhey - grainNeedByAnimal.pigs,
    grainNeed,
    grainSupply,
    grainBalance: grainSupply - grainNeed,
  };
}

function computeStrawBalance(params, results) {
  const { replacementHeifers, bulls, sucklerCows, finishers, beefHeifers, winterFactor } = results;
  const strawNeedByAnimal = {
    dairyCows: params.dairyCows * 1.2 * winterFactor,
    replacementHeifers: replacementHeifers * 0.6 * winterFactor,
    bull: bulls * 0.8 * winterFactor,
    sheep: params.sheep * 0.12 * winterFactor * (0.7 + 0.3 * params.lambingsPerEwe),
    goats: params.goats * 0.1 * winterFactor,
    horses: params.horses * 1.2 * winterFactor,
    beefCattle: (sucklerCows * 1.0 + finishers * 0.8 + beefHeifers * 0.6) * winterFactor,
    layingHens: params.winterPolytunnel ? 0 : params.layingHens * 0.006,
    broilers: params.broilers * 0.002,
    geese: params.geese * 0.01,
    ducks: params.ducks * 0.005,
    turkeys: params.turkeys * 0.015,
    guineaFowl: params.guineaFowl * 0.002,
    pigs: (params.pigsForHome + params.pigsForSale) * 0.6,
    rabbits: params.rabbits * 0.05,
  };
  const strawNeed = sumValues(strawNeedByAnimal);
  const strawSupply = results.cerealHa * params.strawYield;
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
    strawSupply,
    strawBalance,
    strawBalanceBeforeSawdust,
    sawdustTonnes,
  };
}
