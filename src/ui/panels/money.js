// Panel "Money": waterfall chart from sales to net income, and tables of revenue, costs,
// subsidies and the value of food produced for the household.

function renderMoney(results) {
  renderWaterfall(results);
  renderRevenueTable(results);
  renderCostsTable(results);
  renderSubsidiesTable(results);
  renderHomeUseTable(results);
}

/** Dashed line carrying the running total from one bar to the next. */
function waterfallConnector(fromX, toX, y) {
  return element('line', {
    x1: fromX,
    x2: toX,
    y1: y,
    y2: y,
    stroke: 'var(--muted)',
    'stroke-dasharray': '3 3',
  });
}

function renderWaterfall(results) {
  const { revenue: sales, subsidies, costs, depreciation, netIncome } = results;
  const chart = { width: 640, height: 250, padLeft: 10, padRight: 10, padTop: 26, padBottom: 36 };
  const top = Math.max(sales + subsidies, 1);
  const bottom = Math.min(0, netIncome);
  const plotHeight = chart.height - chart.padTop - chart.padBottom;
  const y = value => chart.padTop + ((top - value) / (top - bottom)) * plotHeight;

  // each bar runs from `from` to `to`; costs and depreciation show their amount as negative
  const bars = [
    { id: 'sales', from: 0, to: sales, color: 'var(--accent)' },
    { id: 'subsidies', from: sales, to: sales + subsidies, color: 'var(--color-fields)' },
    {
      id: 'costs',
      from: sales + subsidies,
      to: sales + subsidies - costs,
      value: -costs,
      color: 'var(--bad)',
    },
    {
      id: 'depreciation',
      from: sales + subsidies - costs,
      to: netIncome,
      value: -depreciation,
      color: 'var(--warn)',
    },
    { id: 'net', from: 0, to: netIncome, color: netIncome >= 0 ? 'var(--ok)' : 'var(--bad)' },
  ];
  const slot = (chart.width - chart.padLeft - chart.padRight) / bars.length;
  let svg = horizontalLine(chart, y(0), { class: 'grid' });
  bars.forEach((bar, index) => {
    if (bar.value === undefined) bar.value = bar.to - bar.from;
    const label = t(`money.waterfall.${bar.id}`);
    const x = chart.padLeft + index * slot + slot * 0.18;
    const width = slot * 0.64;
    const yTop = y(Math.max(bar.from, bar.to));
    const yBottom = y(Math.min(bar.from, bar.to));
    const thousands = t('units.thousandsPln', { value: formatNumber(Math.abs(bar.value) / 1000, 0) });
    const isLast = index === bars.length - 1;

    svg += withTooltip(
      'rect',
      { x, y: yTop, width, height: Math.max(1, yBottom - yTop), fill: bar.color, rx: 2 },
      `${label}: ${formatPlnExact(bar.value)}`
    );
    if (!isLast) svg += waterfallConnector(x + width, x + slot, y(bar.to));
    svg += element(
      'text',
      { x: x + width / 2, y: yTop - 7, 'text-anchor': 'middle', 'font-size': 13, class: 'num' },
      (bar.value < 0 ? '−' : '') + thousands
    );
    svg += axisText(x + width / 2, chart.height - 12, label, 'middle');
  });
  byId('waterfall').innerHTML = svg;
}

/**
 * Table with one row per item above 0.5 zł and a total row.
 * @param {object} table
 * @param {string} table.header - first column title
 * @param {string} table.valueHeader - amount column title
 * @param {object} table.items - amount per item id
 * @param {(item: string) => string} table.label
 * @param {(item: string) => string} [table.detail] - small text under the label
 * @param {(item: string) => ?string} [table.rowClass] - class of the label cell
 * @param {string} [table.extraRows] - rows added before the total
 * @param {string} table.totalLabel
 * @param {number} table.total
 */
function itemsTableHtml(table) {
  const header = tableHeader([table.header, table.valueHeader]);
  const rows = Object.entries(table.items)
    .filter(([, amount]) => amount > 0.5)
    .map(([item, amount]) => {
      const detail = table.detail && table.detail(item);
      const detailHtml = detail ? '<br>' + element('span', { class: 'small muted' }, detail) : '';
      const rowAttributes = table.rowClass ? { class: table.rowClass(item) } : {};
      return tableRow([
        cell(table.label(item) + detailHtml, rowAttributes),
        numberCell(formatPlnExact(amount)),
      ]);
    });
  const totalRow = tableRow([cell(table.totalLabel), numberCell(formatPlnExact(table.total))], {
    class: 'tot',
  });
  return header + tableBody([...rows, table.extraRows || '', totalRow]);
}

function renderRevenueTable(results) {
  const n = formatNumber;
  const details = {
    milk: { litres: n(results.freshMilkSold, 0), price: n(params.milkPrice, 2) },
    cheese: { kg: n(results.cheeseSold, 0), price: n(params.cheesePrice, 0) },
    calves: { calves: n(results.calvesSold, 1), cows: n(results.cowReplacements, 1) },
    eggs: { eggs: n(results.eggsSold, 0), price: n(params.eggPrice, 2) },
    broilers: { count: n(params.broilers * 0.95, 0), kg: n(params.broilerCarcassKg, 1) },
    geese: { count: n(params.geese * 0.9, 0) },
    rabbits: { count: n(params.rabbits * params.rabbitsRearedPerDoe * 0.9, 0) },
    sheep: { lambs: n(results.lambsSoldLive, 1), price: n(params.lambLivePrice, 0) },
    lambMeat: {
      lambs: n(results.lambsSoldAsMeat, 1),
      kg: n(results.lambMeatKg, 0),
      price: n(params.lambMeatPricePerKg, 0),
    },
    vegetables: { hectares: n(params.marketGardenHa, 2), price: n(params.vegetableSalesPerHa, 0) },
    honey: { kg: n(results.market.honeyKg, 0), price: n(params.honeyPrice, 0) },
  };
  byId('revenue-table').innerHTML = itemsTableHtml({
    header: t('money.revenueHeader'),
    valueHeader: t('money.perYear'),
    items: results.revenueItems,
    label: item => t(`revenueItems.${item}.label`),
    detail: item => (details[item] ? t(`revenueItems.${item}.detail`, details[item]) : ''),
    totalLabel: t('money.revenueTotal'),
    total: results.revenue,
  });
}

function renderCostsTable(results) {
  byId('costs-table').innerHTML = itemsTableHtml({
    header: t('money.costsHeader'),
    valueHeader: t('money.perYear'),
    items: results.costItems,
    label: item => t(`costItems.${item}`),
    rowClass: item => (item === 'purchases' ? 'neg' : null),
    extraRows: tableRow([cell(t('money.depreciation')), numberCell(formatPlnExact(results.depreciation))]),
    totalLabel: t('money.costsTotal'),
    total: results.costs + results.depreciation,
  });
}

function renderSubsidiesTable(results) {
  const rate = (value, decimals) => formatNumber(value, decimals);
  const rates = SUBSIDY_RATES;
  const perHa = (value, decimals = 2) => t('units.plnPerHa', { value: rate(value, decimals) });
  const perHead = value => t('money.plnPerHead', { value: rate(value, 2) });
  const details = {
    basicPayment: perHa(rates.basicPayment),
    redistributive: perHa(rates.redistributive),
    dairyCows: perHead(rates.dairyCows),
    beefCattle: perHead(rates.beefCattle),
    sheep: perHead(rates.sheep),
    goats: perHead(rates.goats),
    organic: t('subsidyItems.organic.detail', {
      grassland: rate(rates.organicGrassland, 0),
      arable: rate(rates.organicArable, 0),
      orchard: rate(rates.organicOrchard, 0),
      vegetables: rate(rates.organicVegetables, 0),
    }),
    livestockBonus: perHa(rates.livestockBonus, 0),
    extensiveGrassland: perHa(rates.extensiveGrasslandScheme),
    youngFarmer: perHa(rates.youngFarmer),
    lessFavouredArea: perHa(params.lessFavouredAreaRate, 0),
    animalWelfare: t('subsidyItems.animalWelfare.detail'),
    carbonFarming: t('subsidyItems.carbonFarming.detail', { value: rate(params.ecoSchemePointValue, 0) }),
  };
  byId('subsidies-table').innerHTML = itemsTableHtml({
    header: t('money.subsidiesHeader', { hectares: formatNumber(results.farmedHa, 1) }),
    valueHeader: t('money.perYear'),
    items: results.subsidyItems,
    label: item => t(`subsidyItems.${item}.label`),
    detail: item => details[item],
    totalLabel: t('money.subsidiesTotal'),
    total: results.subsidies,
  });
}

function renderHomeUseTable(results) {
  const values = {
    pigs: { kg: formatNumber(params.pigsForHome * 85, 0) },
    dogFood: { kg: formatNumber(results.dogFoodKg, 0) },
  };
  byId('home-use-table').innerHTML = itemsTableHtml({
    header: t('money.homeUseHeader'),
    valueHeader: t('money.value'),
    items: results.homeUse,
    label: item => t(`homeUse.${item}`, values[item]),
    totalLabel: t('money.total'),
    total: results.homeUseTotal,
  });
}
