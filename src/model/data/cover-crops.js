// Seed rates of the rotation crops and the cover-crop mixtures available from Polish seed
// suppliers. Names and descriptions: locales → crops, catchCropMixes, stubbleCropMixes,
// page.coverCropGuide.
//
// The two "cocktails" follow Gabe Brown (Brown's Ranch): many species with different roots,
// grazed by the cattle, with legumes for nitrogen and flowers for insects.

/** Seed per hectare of each rotation crop (kg; potatoes as seed tubers). */
const CROP_SEED_RATES = {
  clover: [
    { seed: 'redClover', kgPerHa: 10 },
    { seed: 'grassSeed', kgPerHa: 6 },
  ],
  triticale: [{ seed: 'triticale', kgPerHa: 200 }],
  rye: [{ seed: 'rye', kgPerHa: 130 }],
  mixedGrain: [
    { seed: 'barleyOrTriticale', kgPerHa: 110 },
    { seed: 'fieldPea', kgPerHa: 80 },
  ],
  oats: [
    { seed: 'oats', kgPerHa: 100 },
    { seed: 'fieldPea', kgPerHa: 60 },
  ],
  roots: [{ seed: 'seedPotatoes', kgPerHa: 2500 }],
};

/** The rotation sows the clover ley under the oats, so the clover seed is bought for the oats field. */
const UNDERSOWN_CLOVER_SEED = CROP_SEED_RATES.clover;

/**
 * Winter catch crops sown after harvest (the `catchCropMix` parameter is an index into this list):
 * seed (kg/ha) and cost per hectare, forage left for grazing (t DM/ha), legume nitrogen (kg N/ha).
 * `lateSowing`: ready only in May, too late before oats.
 */
const CATCH_CROP_MIXES = [
  { id: 'ryeWithVetch', seedKgPerHa: 100, costPerHa: 400, forageYield: 1.0, legumeNitrogen: 40 },
  {
    id: 'landsberger',
    seedKgPerHa: 60,
    costPerHa: 550,
    forageYield: 2.5,
    legumeNitrogen: 50,
    lateSowing: true,
  },
  { id: 'phaceliaBuckwheatRye', seedKgPerHa: 80, costPerHa: 350, forageYield: 0.5, legumeNitrogen: 0 },
  { id: 'winterTurnipRapeRye', seedKgPerHa: 80, costPerHa: 300, forageYield: 2.0, legumeNitrogen: 0 },
  { id: 'multiSpeciesRye', seedKgPerHa: 70, costPerHa: 600, forageYield: 1.0, legumeNitrogen: 25 },
  {
    id: 'triticaleWinterPea',
    seedKgPerHa: 140,
    costPerHa: 450,
    forageYield: 2.5,
    legumeNitrogen: 45,
    lateSowing: true,
  },
  { id: 'brownWinterCocktail', seedKgPerHa: 95, costPerHa: 650, forageYield: 1.5, legumeNitrogen: 40 },
];

/** Short stubble crops before a winter cereal (the `stubbleCropMix` parameter is an index into this list). */
const STUBBLE_CROP_MIXES = [
  { id: 'whiteMustard', seedKgPerHa: 18, costPerHa: 150, forageYield: 0.3, legumeNitrogen: 0 },
  { id: 'phaceliaBuckwheat', seedKgPerHa: 45, costPerHa: 250, forageYield: 0.2, legumeNitrogen: 0 },
  { id: 'oatsVetchPea', seedKgPerHa: 150, costPerHa: 350, forageYield: 1.5, legumeNitrogen: 35 },
  { id: 'brownSummerCocktail', seedKgPerHa: 110, costPerHa: 450, forageYield: 2.0, legumeNitrogen: 35 },
];

/** Stubble mixtures that are cut or grazed before ploughing (the others are ploughed straight in). */
const GRAZED_STUBBLE_MIX_IDS = ['oatsVetchPea', 'brownSummerCocktail'];
