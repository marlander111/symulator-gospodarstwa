// Milk and cheese volumes and the renewal of the laying flock.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Milk, cheese, eggs ----------

function computeMilkAndCheese(params) {
  const milkTotal = params.dairyCows * params.milkPerCow;
  const milkUsed = (milkTotal * params.milkUsedShare) / 100;
  const milkForCheese = params.dairyCows > 0 ? (milkUsed * params.cheeseShare) / 100 : 0;
  const freshMilkSold = milkUsed - milkForCheese;
  const cheeseKg = (milkForCheese / 100) * params.cheeseYield;
  const cheeseSold = cheeseKg * 0.9;
  const wheyLitres = milkForCheese * 0.85;
  return { milkTotal, milkUsed, milkForCheese, freshMilkSold, cheeseKg, cheeseSold, wheyLitres };
}

function computeFlockRenewal(params) {
  const henReplacements = params.layingHens / params.flockReplacementYears;
  const cockerels = params.ownHatching ? henReplacements * 0.9 : 0;
  const chicks = params.ownHatching ? henReplacements * 2 : 0;
  return { henReplacements, cockerels, chicks };
}
