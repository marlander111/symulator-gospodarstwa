// Kinds of dairy and beef breeds and the beef keeping systems. Choosing a kind in the controls
// moves the sliders listed under `sliders` to typical values (they can still be adjusted);
// the other values are used by the model directly. Names: locales → parameters.<id>.options.<kind>.

/** Dairy breeds: intensive (Holstein-Friesian), dual-purpose (Simmental, Polish Red-and-White), extensive (Jersey, Polish Red). */
const DAIRY_BREEDS = {
  intensive: {
    sliders: {
      milkPerCow: 6500,
      oatsPerCow: 900,
      cheeseYield: 9.5,
      creamYield: 7,
      lactationsPerCow: 4,
      calfPrice: 600,
      cullCowPrice: 4500,
    },
    dryMatterPerCowTonnes: 6.6,
  },
  mixed: {
    sliders: {
      milkPerCow: 5000,
      oatsPerCow: 400,
      cheeseYield: 10,
      creamYield: 8,
      lactationsPerCow: 6,
      calfPrice: 1400,
      cullCowPrice: 5500,
    },
    dryMatterPerCowTonnes: 6.0,
  },
  extensive: {
    sliders: {
      milkPerCow: 3700,
      oatsPerCow: 90,
      cheeseYield: 11,
      creamYield: 10,
      lactationsPerCow: 6,
      calfPrice: 500,
      cullCowPrice: 3500,
    },
    dryMatterPerCowTonnes: 5.5,
  },
};

/** Beef breeds: intensive (Limousin, Charolais), dual-purpose (Simmental), extensive (Angus, Hereford, Highland). */
const BEEF_BREEDS = {
  intensive: {
    sliders: { weanerWeightKg: 300, finisherWeightKg: 680, finisherKillingOut: 60 },
    // dry matter per year (t) of a suckler cow with her calf, and a factor for the young stock
    sucklerCowDryMatterTonnes: 5.3,
    youngStockDryMatterFactor: 1.15,
  },
  mixed: {
    sliders: { weanerWeightKg: 270, finisherWeightKg: 620, finisherKillingOut: 57 },
    sucklerCowDryMatterTonnes: 5.0,
    youngStockDryMatterFactor: 1.05,
  },
  extensive: {
    sliders: { weanerWeightKg: 240, finisherWeightKg: 560, finisherKillingOut: 55 },
    sucklerCowDryMatterTonnes: 4.6,
    youngStockDryMatterFactor: 1,
  },
};

/**
 * Beef keeping systems: finishing in the shed on grain and haylage, grazing in summer with the
 * shed in winter, or outside all year round (winter on bale grazing, a windbreak instead of a shed).
 */
const BEEF_SYSTEMS = {
  housedFinishing: {
    grainPerFinisherTonnes: 1.1,
    foragePerFinisherTonnes: 2.7,
    finishersGraze: false, // finishers stay in the shed and eat hay or haylage all year
    strawFactor: 1.8,
    shedPlacesFactor: 1,
    extraHoursPerFinisher: 5,
    outwintering: false,
  },
  mixed: {
    grainPerFinisherTonnes: 0.2,
    foragePerFinisherTonnes: 3.5,
    finishersGraze: true,
    strawFactor: 1,
    shedPlacesFactor: 1,
    extraHoursPerFinisher: 0,
    outwintering: false,
  },
  outdoorYearRound: {
    grainPerFinisherTonnes: 0,
    // finishing on grass alone takes longer (about 26–30 months), so more forage per animal
    foragePerFinisherTonnes: 4.0,
    finishersGraze: true,
    strawFactor: 0.3,
    shedPlacesFactor: 0.3,
    extraHoursPerFinisher: -2,
    outwintering: true,
  },
};

const DAIRY_BREED_IDS = Object.keys(DAIRY_BREEDS);
const BEEF_BREED_IDS = Object.keys(BEEF_BREEDS);
const BEEF_SYSTEM_IDS = Object.keys(BEEF_SYSTEMS);
