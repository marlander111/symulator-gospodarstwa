// How much of each product has to be sold, and to how many customers.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Market: how much has to be sold ----------

/** Price of one CSA vegetable share for the season (PLN), used to count the shares. */
const CSA_SHARE_PRICE = 1600;

function computeMarket(params, results) {
  const { revenueItems: revenue } = results;
  const householdSales = salesToHouseholds(revenue, results.beefBoxRevenue);
  return {
    market: {
      milkPerDay: results.freshMilkSold / 365,
      goatMilkPerDay: results.goatMilkSold / 365,
      eggsPerWeek: results.eggsSold / 52,
      csaShares: revenue.vegetables / CSA_SHARE_PRICE,
      honeyKg: results.honeyKg,
      cheesePerWeek: results.cheeseSold / 52,
      curdPerWeek: results.curdSold / 52,
      butterPerWeek: results.butterSold / 52,
      creamPerWeek: results.creamSold / 52,
      // farm retail sales (RHD): dairy products, red meat in boxes, smoked goods, preserves
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
  'goatMilk',
  'cheese',
  'goatCheese',
  'curd',
  'cream',
  'butter',
  'dairyByproducts',
  'horseRiding',
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
