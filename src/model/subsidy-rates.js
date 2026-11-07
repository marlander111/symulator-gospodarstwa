// Subsidy rates in PLN (2025 direct payments; organic payments estimated from 2023).

const SUBSIDY_RATES = {
  // area payments, per hectare of farmed land
  basicPayment: 488.55,
  redistributive: 176.84, // first 30 ha only
  youngFarmer: 248.16,

  // coupled support, per animal
  dairyCows: 412.63,
  beefCattle: 322.49,
  sheep: 110.16, // from 10 ewes
  goats: 48.12, // from 5 goats

  // organic farming, per hectare
  organicGrassland: 1043,
  organicArable: 1504,
  organicOrchard: 1961,
  organicVegetables: 2391,
  livestockBonus: 573, // organic crop and livestock farm at 0.5–1.5 LU/ha

  // eco-schemes, per hectare
  extensiveGrasslandScheme: 435.1,

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
