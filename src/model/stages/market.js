// How much of each product has to be sold, and to how many customers.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Market: how much has to be sold ----------

function computeMarket(params, results) {
  const { revenueItems: revenue } = results;
  const { beefBoxRevenue } = results;
  const householdSales = salesToHouseholds(revenue, beefBoxRevenue);
  return {
    market: {
      milkPerDay: results.freshMilkSold / 365,
      eggsPerWeek: results.eggsSold / 52,
      csaShares: revenue.vegetables / 1600,
      honeyKg: params.beehives * params.honeyPerHive * 0.95,
      cheesePerWeek: results.cheeseSold / 52,
      // farm retail sales (RHD): cheese, red meat in boxes, smoked goods
      directSalesRevenue: results.retailSalesRevenue,
      householdSales,
      loyalFamilies: householdSales / (params.loyalCustomerSpendPerMonth * MONTHS_PER_YEAR),
      occasionalCustomers: householdSales / (params.occasionalCustomerSpendPerMonth * MONTHS_PER_YEAR),
    },
  };
}

const MONTHS_PER_YEAR = 12;

/** Revenue lines bought by households (not by traders, abattoirs or grain buyers). */
const HOUSEHOLD_REVENUE_ITEMS = [
  'milk',
  'cheese',
  'eggs',
  'cockerels',
  'broilers',
  'geese',
  'ducks',
  'turkeys',
  'guineaFowl',
  'rabbits',
  'lambMeat',
  'processedGoods',
  'goats',
  'pigs',
  'honey',
  'vegetables',
  'mushrooms',
  'fruit',
];

/**
 * Yearly sales straight to households: the household revenue lines plus the beef sold in boxes
 * (live weaners, finishers, calves and lambs go to traders).
 */
function salesToHouseholds(revenue, beefBoxRevenue) {
  return sumBy(HOUSEHOLD_REVENUE_ITEMS, item => revenue[item] || 0) + beefBoxRevenue;
}
