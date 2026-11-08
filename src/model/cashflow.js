// Monthly cash flow: yearly revenue, costs and subsidies spread over the months they are
// actually paid or received, and the bank balance month by month.

/** Relative weight of each month (January–December) per revenue line, cost line and subsidy. */
const CASHFLOW_PROFILES = {
  revenue: {
    milk: [0, 0, 0.6, 1.1, 1.4, 1.3, 1.2, 1.1, 1, 0.9, 0.8, 0.6],
    goatMilk: [0, 0.3, 1, 1.4, 1.4, 1.3, 1.2, 1.1, 1, 0.8, 0.5, 0],
    curd: [0, 0, 0.6, 1.1, 1.4, 1.3, 1.2, 1.1, 1, 0.9, 0.8, 0.6],
    cream: [0, 0, 0.6, 1.1, 1.4, 1.3, 1.2, 1.1, 1, 0.9, 0.8, 0.8],
    butter: [0, 0, 0.6, 1.1, 1.4, 1.3, 1.2, 1.1, 1, 0.9, 0.9, 1],
    dairyByproducts: [0, 0, 0.6, 1.1, 1.4, 1.3, 1.2, 1.1, 1, 0.9, 0.8, 0.6],
    goatCheese: [0.5, 0.5, 0.6, 0.8, 1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.3, 1.8],
    horseRiding: [0.4, 0.4, 0.7, 1, 1.3, 1.6, 1.8, 1.8, 1.3, 0.9, 0.5, 0.3],
    cheese: [0.8, 0.6, 0.5, 0.5, 0.7, 0.8, 0.9, 0.9, 1, 1.1, 1.6, 2.6],
    calves: [0, 0, 0.2, 1, 1, 0.3, 0, 0, 0.2, 1, 0.5, 0],
    eggs: [0.5, 0.6, 0.9, 1.2, 1.3, 1.3, 1.2, 1.1, 1, 0.9, 0.6, 0.5],
    cockerels: [0, 0, 0, 0, 0, 0.5, 1, 1, 0.5, 0, 0, 0],
    broilers: [0, 0, 0, 0, 0, 0.8, 1, 1, 1, 1, 0.2, 0],
    geese: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0.3, 3, 0.7],
    ducks: [0, 0, 0, 0, 0, 0, 0.5, 1, 1, 1, 0.8, 0.2],
    turkeys: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0.2, 0.8, 3],
    guineaFowl: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1.2, 0.8, 0.3],
    rabbits: [0.3, 0.3, 0.5, 0.8, 1, 1, 1, 1, 1, 1.2, 1.2, 1],
    sheep: [0, 0, 0, 0, 0, 0.5, 1, 1.5, 1.2, 0.8, 0.3, 0],
    lambMeat: [0, 0, 0.6, 0.6, 0.2, 0.2, 0.4, 0.8, 1, 1, 0.8, 1],
    processedGoods: [0.3, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.3, 0.5, 1, 2.5, 3],
    fruit: [0, 0, 0, 0, 0, 0, 0.3, 1, 2, 1.5, 0.6, 0.4],
    mushrooms: [0, 0, 0.2, 1, 1.2, 0.6, 0.3, 0.5, 1.2, 1.4, 0.8, 0.2],
    vegetables: [0.2, 0.2, 0.5, 0.3, 0.6, 1, 1.4, 1.5, 1.3, 1, 0.4, 0.2],
    goats: [0, 0, 0.6, 1.2, 0.8, 0.5, 0.4, 0.4, 0.6, 0.8, 0.5, 0.2],
    pigs: [0, 0, 0, 0, 0, 0, 0, 0, 0.5, 1.5, 2, 1],
    honey: [0, 0, 0, 0, 0, 0.6, 1.2, 1.2, 0.6, 0.3, 0.3, 0.6],
    grainSales: [0.3, 0.3, 0.2, 0, 0, 0, 0, 1.5, 1.5, 1, 0.7, 0.5],
    beefCattle: [0, 0, 0, 0, 0, 0, 0, 0, 0.6, 2, 0.6, 0.2],
  },
  costs: {
    arable: [0, 0, 1.6, 1.4, 0.4, 0.3, 1.2, 1.4, 1.2, 0.6, 0, 0],
    meadow: [0, 0, 0, 0, 0, 1.5, 0.5, 1, 0, 0, 0, 0],
    pasture: [0, 0, 0.8, 1, 0.4, 0, 0, 0, 0, 0, 0, 0],
    dairyCows: [1, 1, 1.4, 1, 1, 1, 1, 1, 1, 1, 1, 0.6],
    milkPackaging: [0, 0, 0.6, 1.1, 1.4, 1.3, 1.2, 1.1, 1, 0.9, 0.8, 0.6],
    cheese: [0, 0, 0.5, 1.2, 1.5, 1.4, 1.3, 1.2, 1.1, 1, 0.5, 0.3],
    layingHens: [0.6, 0.6, 2, 1.5, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.7, 0.6],
    broilers: [0, 0, 0, 0.8, 1.2, 1.3, 1.3, 1.3, 1.1, 0.8, 0.2, 0],
    geese: [0, 0, 0, 0.5, 1.5, 1, 1, 1, 1, 1.5, 1.5, 0],
    ducks: [0, 0, 0, 0.5, 1.5, 1.5, 1.5, 1.5, 1.2, 0.8, 0.5, 0],
    turkeys: [0, 0, 0, 0, 1, 1, 1, 1, 1.2, 1.5, 2, 1.3],
    guineaFowl: [0, 0, 0, 0, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 0.8, 0],
    processedGoods: [0.3, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.3, 0.5, 1, 2.5, 3],
    fruit: [0, 0, 0, 0, 0, 0, 0.3, 1, 2, 1.5, 0.6, 0.4],
    mushrooms: [0, 0, 2, 2, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0, 0],
    vegetables: [0.3, 0.5, 2, 1.8, 1.4, 1, 0.8, 0.8, 0.8, 0.8, 0.5, 0.3],
    beehives: [0, 0, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5, 0],
    slaughter: [0, 0, 0.6, 0.6, 0.2, 0.2, 0.4, 0.8, 1, 1, 0.8, 1],
    landLease: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    fixed: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    energy: [1.3, 1.2, 1.1, 1, 0.9, 0.8, 0.8, 0.8, 0.9, 1, 1.1, 1.3],
    purchases: [0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0],
    catchCrops: [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    beefCattle: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6, 1.2, 1],
    pigs: [0, 0, 0, 1.5, 1, 1, 1, 1, 1, 1.2, 1.3, 0.5],
    goats: [1, 1, 1.4, 1.2, 1, 1, 1, 1, 1, 1, 0.8, 0.6],
  },
  // advance payments from mid-October, the rest by the end of June
  subsidies: [0.08, 0.08, 0.06, 0, 0, 0, 0, 0, 0, 0.5, 0.18, 0.1],
  animalWelfare: [0, 0, 0.3, 0.3, 0.2, 0.2, 0, 0, 0, 0, 0, 0],
};

const EVEN_MONTHS = Array(12).fill(1);

/** Splits a yearly amount into 12 monthly amounts proportional to the profile. */
function spreadOverMonths(total, profile = EVEN_MONTHS) {
  const weightSum = profile.reduce((sum, weight) => sum + weight, 0) || 1;
  return profile.map(weight => (total * weight) / weightSum);
}

/**
 * @param {object} results - output of simulateFarm (revenueItems, costItems, subsidyItems)
 * @param {object} params
 * @returns {{months: object[], minBalance: number, minBalanceMonth: number,
 *   householdDraw: number, closingBalance: number}}
 */
function computeMonthlyCashflow(results, params) {
  const months = Array.from({ length: 12 }, () => ({
    inflows: 0,
    subsidy: 0,
    outflows: 0,
    household: 0,
    netIncome: 0,
    balance: 0,
  }));
  const addToMonths = (field, items, profileOf) => {
    for (const [item, total] of Object.entries(items))
      spreadOverMonths(total, profileOf(item)).forEach((amount, month) => (months[month][field] += amount));
  };
  addToMonths('inflows', results.revenueItems, item => CASHFLOW_PROFILES.revenue[item]);
  addToMonths('outflows', results.costItems, item => CASHFLOW_PROFILES.costs[item]);
  addToMonths('subsidy', results.subsidyItems, item =>
    item === 'animalWelfare' ? CASHFLOW_PROFILES.animalWelfare : CASHFLOW_PROFILES.subsidies
  );

  const childBenefit = params.childBenefitChildren * CHILD_BENEFIT_PER_MONTH;
  const householdDraw = Math.max(0, params.householdMonthlySpending - childBenefit);
  let balance = params.openingCash;
  let minBalance = Infinity;
  let minBalanceMonth = 0;
  months.forEach((month, index) => {
    month.household = householdDraw;
    month.netIncome = month.inflows + month.subsidy - month.outflows;
    balance += month.netIncome - month.household;
    month.balance = balance;
    if (balance < minBalance) {
      minBalance = balance;
      minBalanceMonth = index;
    }
  });

  return { months, minBalance, minBalanceMonth, householdDraw, closingBalance: balance };
}
