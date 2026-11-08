// Financial data of the current plan as plain JSON, for budgeting and finance apps: yearly
// results of the realistic and the pessimistic scenario, every revenue, cost and subsidy line,
// the enterprises, investments, the start-up years, the monthly cash flow and the risk spread.
// Keys are English and stable; `label` fields carry the texts in the interface language.

const FINANCE_EXPORT_FORMAT = { format: 'farm-simulator-finance', version: 1, currency: 'PLN' };

/** Years simulated for the risk figures of the export (fewer than the panel, to stay quick). */
const FINANCE_EXPORT_RISK_YEARS = 300;

const roundMoney = value => Math.round(value);

/** Lines of one kind ({id: amount}) as a list with labels, without empty lines. */
function financeLines(items, labelKey) {
  return Object.entries(items)
    .filter(([, amount]) => Math.abs(amount) >= 0.5)
    .map(([id, amount]) => ({ id, label: t(labelKey(id)), amount: roundMoney(amount) }));
}

function financeScenario(results) {
  return {
    netIncome: roundMoney(results.netIncome),
    netIncomePerMonth: roundMoney(results.netIncome / 12),
    revenue: roundMoney(results.revenue),
    subsidies: roundMoney(results.subsidies),
    costs: roundMoney(results.costs),
    depreciation: roundMoney(results.depreciation),
    totalHours: Math.round(results.totalHours),
    netIncomePerHour: Math.round(results.netPerHour * 10) / 10,
    homeFoodValue: roundMoney(results.homeUseTotal),
    revenueLines: financeLines(results.revenueItems, id => `revenueItems.${id}.label`),
    costLines: financeLines(results.costItems, id => `costItems.${id}`),
    subsidyLines: financeLines(results.subsidyItems, id => `subsidyItems.${id}.label`),
    enterprises: results.enterprises
      .filter(enterprise => enterprise.active)
      .map(enterprise => ({
        id: enterprise.id,
        label: t(`enterprises.${enterprise.labelKey}`),
        revenue: roundMoney(enterprise.revenue),
        costs: roundMoney(enterprise.cost),
        depreciation: roundMoney(enterprise.depreciation),
        subsidies: roundMoney(enterprise.subsidy),
        net: roundMoney(enterprise.net),
        hours: Math.round(enterprise.hours),
      })),
  };
}

/**
 * @param {object} params - current settings
 * @param {string} variantName - name shown to the user
 * @returns {object} the JSON document
 */
function buildFinanceExport(params, variantName) {
  const results = simulateFarm(params);
  const pessimistic = simulateFarm(applyPessimisticScenario(params));
  const risk = simulateRisk(params, FINANCE_EXPORT_RISK_YEARS);
  return {
    ...FINANCE_EXPORT_FORMAT,
    createdAt: new Date().toISOString(),
    variant: variantName,
    location: { id: params.location, label: t(`locations.${params.location}`) },
    farm: {
      ownedHa: params.ownedHa,
      leasedHa: params.leasedHa,
      farmedHa: Math.round(results.farmedHa * 100) / 100,
      familyHoursAvailable: Math.round(results.availableHours),
      weeklyHoursLimit: params.weeklyHoursLimit,
    },
    targets: {
      minimumNetIncome: roundMoney(results.incomeTarget),
      householdMonthlySpending: params.householdMonthlySpending,
      householdYearlyNeed: roundMoney(results.householdBudget.required),
      openingCash: params.openingCash,
    },
    scenarios: { realistic: financeScenario(results), pessimistic: financeScenario(pessimistic) },
    risk: {
      years: risk.incomes.length,
      chanceOfMinimum: Math.round(risk.chanceOfTarget * 1000) / 1000,
      poorYear: roundMoney(risk.p10),
      typicalYear: roundMoney(risk.p50),
      goodYear: roundMoney(risk.p90),
    },
    investments: results.investmentItems
      .filter(item => item.cost > 0)
      .map(item => ({
        id: item.id,
        label: t(`investments.${item.id}`),
        cost: roundMoney(item.cost),
        lifetimeYears: item.lifetimeYears,
        yearlyDepreciation: roundMoney(item.yearlyDepreciation),
      })),
    startupYears: simulateStartupYears(params).map(({ year, results: yearResults }) => ({
      year,
      netIncome: roundMoney(yearResults.netIncome),
      revenue: roundMoney(yearResults.revenue),
      subsidies: roundMoney(yearResults.subsidies),
      costs: roundMoney(yearResults.costs),
      investments: roundMoney(yearResults.capex),
      hours: Math.round(yearResults.totalHours),
    })),
    monthlyCashflow: results.cashflow.months.map((month, index) => ({
      month: index + 1,
      sales: roundMoney(month.inflows),
      subsidies: roundMoney(month.subsidy),
      costs: roundMoney(month.outflows),
      result: roundMoney(month.netIncome),
      household: roundMoney(month.household),
      balance: roundMoney(month.balance),
    })),
  };
}
