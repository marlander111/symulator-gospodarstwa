// Subsidy rates in PLN: 2026 direct payments and eco-schemes as estimated for the advances
// (MRiRW regulation of 3 September 2026, EUR at 4.3135 PLN); organic payments as set in 2023 and
// unchanged in the 2026 estimates; animal welfare at the last published rates (the 2026 ones come
// only with the final payments).

const SUBSIDY_RATES = {
  // area payments, per hectare of farmed land
  basicPayment: 484.27, // basic income support 436.23 + complementary basic payment 48.04
  redistributive: 179.12, // first 30 ha only
  youngFarmer: 248.7,

  // coupled support, per animal
  dairyCows: 407.91,
  beefCattle: 318.83,
  sheep: 108.91, // from 10 ewes
  goats: 47.57, // from 5 goats

  // organic farming, per hectare
  organicGrassland: 1043,
  organicArable: 1504,
  organicOrchard: 1961,
  organicVegetables: 2391,
  livestockBonus: 573, // organic crop and livestock farm at 0.5–1.5 LU/ha

  // eco-schemes, per hectare
  extensiveGrasslandScheme: 463.8,

  // animal welfare, per animal
  welfareCowGrazing: 287.52,
  welfareCowBedding: 92.75,
  welfareCowSpace: 639.97,
  welfareEwe: 143.3,
  welfareGoat: 138.39,
  welfareHen: 13.12,
};

/** Eco-scheme "carbon farming": points per hectare and the share of farmed land needed to qualify. */
const CARBON_FARMING = {
  catchCropPointsPerHa: 5,
  manurePointsPerHa: 2,
  cropDiversityPointsPerHa: 3,
  extensiveGrasslandPointsPerHa: 5,
  minimumShareOfFarmedArea: 0.25,
};

/** Monthly child benefit ("800+") per child, PLN. */
const CHILD_BENEFIT_PER_MONTH = 800;
