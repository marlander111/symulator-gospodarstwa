// Investments: one-off cost of each item and its yearly depreciation.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Investments ----------

function computeInvestments(params, results) {
  const { replacementHeifers, bulls, sucklerCows, finishers, beefHeifers } = results;
  const hasGrazingAnimals = params.dairyCows + params.sheep + params.goats + params.sucklerCows > 0;
  // sheep and goats need more fence wires
  const fenceFactor = params.sheep + params.goats > 0 ? 1.3 : 1;
  const oneIf = condition => (condition ? 1 : 0);
  const cattleShedPlaces =
    params.dairyCows + replacementHeifers + bulls + sucklerCows + finishers * 0.7 + beefHeifers * 0.6;

  // quantity × unit price from the investment parameters, written off over the lifetime
  const investmentItems = [
    { id: 'cattleShed', priceParam: 'investCattleShed', quantity: cattleShedPlaces, lifetimeYears: 20 },
    {
      id: 'sheepShed',
      priceParam: 'investSheepShed',
      quantity: params.sheep + params.goats,
      lifetimeYears: 20,
    },
    { id: 'horses', priceParam: 'investHorseStable', quantity: params.horses, lifetimeYears: 20 },
    { id: 'henHouse', priceParam: 'investHenHouse', quantity: params.layingHens, lifetimeYears: 12 },
    {
      id: 'hatching',
      priceParam: 'investHatchery',
      quantity: oneIf(params.ownHatching && params.layingHens > 0),
      lifetimeYears: 8,
    },
    {
      id: 'poultryTunnel',
      priceParam: 'investPoultryTunnel',
      quantity: oneIf(params.winterPolytunnel && params.layingHens > 0),
      lifetimeYears: 10,
    },
    { id: 'broilerPens', priceParam: 'investBroilerPens', quantity: params.broilers / 4, lifetimeYears: 8 },
    {
      id: 'otherPoultryShelters',
      priceParam: 'investOtherPoultryShelters',
      quantity: params.ducks / 2 + params.turkeys * 3 + params.guineaFowl,
      lifetimeYears: 8,
    },
    {
      id: 'processing',
      priceParam: 'investProcessingRoom',
      quantity: oneIf(results.processedValue > 0),
      lifetimeYears: 12,
    },
    { id: 'rabbitHutches', priceParam: 'investRabbitHutches', quantity: params.rabbits, lifetimeYears: 10 },
    {
      id: 'fencing',
      priceParam: 'investElectricFencing',
      quantity: hasGrazingAnimals ? results.grasslandHa * fenceFactor : 0,
      lifetimeYears: 15,
    },
    { id: 'water', priceParam: 'investPastureWater', quantity: oneIf(hasGrazingAnimals), lifetimeYears: 15 },
    { id: 'dairy', priceParam: 'investDairy', quantity: oneIf(params.dairyCows > 0), lifetimeYears: 12 },
    {
      id: 'cheeseRoom',
      priceParam: 'investCheeseRoom',
      quantity: oneIf(params.dairyCows > 0 && params.cheeseShare > 0),
      lifetimeYears: 12,
    },
    { id: 'machinery', priceParam: 'investMachinery', quantity: 1, lifetimeYears: 15 },
    {
      id: 'vegetables',
      priceParam: 'investMarketGarden',
      quantity: params.marketGardenHa,
      lifetimeYears: 10,
    },
    { id: 'beehives', priceParam: 'investBeehive', quantity: params.beehives, lifetimeYears: 15 },
  ];
  for (const item of investmentItems) {
    item.cost = item.quantity * params[item.priceParam];
    item.yearlyDepreciation = item.cost / item.lifetimeYears;
  }
  return {
    investmentItems,
    capex: sumBy(investmentItems, item => item.cost),
    depreciation: sumBy(investmentItems, item => item.yearlyDepreciation),
  };
}
