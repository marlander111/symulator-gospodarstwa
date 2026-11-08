// Milk and dairy products, goat milk, and the renewal of the laying flock.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Cow's milk and dairy products ----------

/** Part of the cheese and curd lost to trimming, tasting and unsold pieces. */
const DAIRY_PRODUCT_LOSS = 0.1;
/** Butter churned from one kilogram of cream (35–40% fat cream, 82% fat butter). */
const BUTTER_PER_KG_OF_CREAM = 0.45;
/** Whey left from one litre of milk made into cheese, and from one litre of skimmed milk made into curd. */
const WHEY_PER_LITRE_FOR_CHEESE = 0.85;
const WHEY_PER_LITRE_FOR_CURD = 0.8;

/**
 * Milk left after the calves and losses (`milkUsedShare`) is sold raw or made into aged cheese
 * and curd cheese. The cream is skimmed off before making curd: it is sold as cream or churned
 * into butter. Whey and buttermilk are sold (`byproductsSoldShare`) or fed to pigs and hens.
 */
function computeMilkAndDairyProducts(params) {
  const milkTotal = params.dairyCows * params.milkPerCow;
  const milkUsed = (milkTotal * params.milkUsedShare) / 100;
  const hasCows = params.dairyCows > 0;
  const cheeseShare = hasCows ? params.cheeseShare / 100 : 0;
  const curdShare = hasCows ? Math.min(params.curdShare / 100, 1 - cheeseShare) : 0;
  const milkForCheese = milkUsed * cheeseShare;
  const milkForCurd = milkUsed * curdShare;
  const freshMilkAvailable = milkUsed - milkForCheese - milkForCurd;

  const cheeseKg = (milkForCheese / 100) * params.cheeseYield;
  const curdKg = (milkForCurd / 100) * params.curdYield;
  const creamKg = (milkForCurd / 100) * params.creamYield;
  const creamForButterKg = (creamKg * params.butterShare) / 100;
  const butterKg = creamForButterKg * BUTTER_PER_KG_OF_CREAM;
  const buttermilkLitres = creamForButterKg - butterKg;
  const wheyLitres = milkForCheese * WHEY_PER_LITRE_FOR_CHEESE + milkForCurd * WHEY_PER_LITRE_FOR_CURD;
  const soldShare = params.byproductsSoldShare / 100;

  return {
    milkTotal,
    milkUsed,
    milkForCheese,
    milkForCurd,
    freshMilkAvailable,
    cheeseKg,
    cheeseAvailable: cheeseKg * (1 - DAIRY_PRODUCT_LOSS),
    curdKg,
    curdAvailable: curdKg * (1 - DAIRY_PRODUCT_LOSS),
    creamKg,
    creamAvailable: creamKg - creamForButterKg,
    butterKg,
    buttermilkLitres,
    wheyLitres,
    buttermilkSoldLitres: buttermilkLitres * soldShare,
    wheySoldLitres: wheyLitres * soldShare,
    // whey and buttermilk that are not sold go to the pigs and hens
    byproductsFedLitres: (wheyLitres + buttermilkLitres) * (1 - soldShare),
    dairyProductsKg: cheeseKg + curdKg + butterKg,
  };
}

// ---------- Goat milk ----------

/** Share of the goat milk drunk by the kids before weaning or lost. */
const GOAT_MILK_FOR_KIDS_AND_LOSSES = 0.15;

function computeGoatMilk(params) {
  const milking = params.goatMilking && params.goats > 0;
  const goatMilkUsed = milking ? params.goats * params.milkPerGoat * (1 - GOAT_MILK_FOR_KIDS_AND_LOSSES) : 0;
  const goatMilkForCheese = (goatMilkUsed * params.goatCheeseShare) / 100;
  const goatCheeseKg = (goatMilkForCheese / 100) * params.goatCheeseYield;
  return {
    goatMilkUsed,
    goatMilkSold: goatMilkUsed - goatMilkForCheese,
    goatMilkForCheese,
    goatCheeseKg,
    goatCheeseSold: goatCheeseKg * (1 - DAIRY_PRODUCT_LOSS),
    goatWheyLitres: goatMilkForCheese * WHEY_PER_LITRE_FOR_CHEESE,
  };
}

// ---------- Laying flock ----------

/** With own hatching: chicks hatched per pullet needed (half are cockerels), cockerels reared per pullet. */
const CHICKS_PER_PULLET = 2;
const COCKERELS_PER_PULLET = 0.9;

function computeFlockRenewal(params) {
  const henReplacements = params.layingHens / params.flockReplacementYears;
  const cockerels = params.ownHatching ? henReplacements * COCKERELS_PER_PULLET : 0;
  const chicks = params.ownHatching ? henReplacements * CHICKS_PER_PULLET : 0;
  return { henReplacements, cockerels, chicks };
}
