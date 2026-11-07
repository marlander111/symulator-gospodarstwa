// How much of each product has to be sold, and to how many customers.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Market: how much has to be sold ----------

function computeMarket(params, results) {
  const { revenueItems: revenue, finishers } = results;
  const beefBoxRevenue =
    ((((finishers * params.finishersSoldAsMeatShare) / 100) *
      params.finisherWeightKg *
      params.finisherKillingOut) /
      100) *
    params.beefBoxPricePerKg;
  return {
    market: {
      milkPerDay: results.freshMilkSold / 365,
      eggsPerWeek: results.eggsSold / 52,
      csaShares: revenue.vegetables / 1600,
      honeyKg: params.beehives * params.honeyPerHive * 0.95,
      cheesePerWeek: results.cheeseSold / 52,
      // farm retail sales (RHD): cheese, red meat in boxes, smoked goods
      directSalesRevenue:
        revenue.cheese +
        revenue.lambMeat +
        revenue.processedGoods +
        revenue.goats +
        revenue.pigs +
        beefBoxRevenue,
    },
  };
}
