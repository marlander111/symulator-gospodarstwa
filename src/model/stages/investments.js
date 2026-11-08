// Investments: the infrastructure the chosen enterprises need (data/infrastructure.js), the
// one-off cost of what the farm does not have yet and its yearly depreciation.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Investments ----------

function computeInvestments(params, results) {
  const infrastructure = INFRASTRUCTURE_ITEMS.map(item => {
    const quantity = item.quantity(params, results);
    const owned = !!params[ownedParameterId(item.id)];
    const fullCost = quantity * params[item.priceParam];
    return {
      id: item.id,
      category: item.category,
      priceParam: item.priceParam,
      lifetimeYears: item.lifetimeYears,
      quantity,
      needed: quantity > 0,
      owned,
      fullCost,
    };
  }).filter(item => item.needed);

  // what the farm still has to buy, and anything else the user typed in
  const investmentItems = infrastructure
    .filter(item => !item.owned)
    .map(item => ({ ...item, cost: item.fullCost }));
  investmentItems.push({
    id: 'other',
    priceParam: 'investOther',
    quantity: 1,
    lifetimeYears: params.investOtherLifetimeYears,
    lifetimeParam: 'investOtherLifetimeYears',
    cost: params.investOther,
  });
  for (const item of investmentItems) item.yearlyDepreciation = item.cost / item.lifetimeYears;

  return {
    infrastructure,
    investmentItems,
    ownedInfrastructureValue: sumBy(
      infrastructure.filter(item => item.owned),
      item => item.fullCost
    ),
    capex: sumBy(investmentItems, item => item.cost),
    depreciation: sumBy(investmentItems, item => item.yearlyDepreciation),
  };
}
