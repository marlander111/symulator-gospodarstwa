// Panel "What has to be sold": quantities the farm must find buyers for, how often (a day, a
// week, a year) and in which months. Texts: locales → market.

const MARKET_COLUMNS = ['product', 'amount', 'per', 'when'];

function renderMarket(results) {
  const { market } = results;
  const rows = [];
  const n = formatNumber;
  const add = (condition, id, amount, unit, per, values = {}) => {
    if (!condition) return;
    rows.push(
      tableRow([
        cell(escapeHtml(t(`market.products.${id}`, values))),
        numberCell(t(`market.units.${unit}`, { value: amount })),
        cell(t(`market.per.${per}`), { class: 'small' }),
        cell(t(`market.seasons.${id}`), { class: 'small muted' }),
      ])
    );
  };
  const trips = results.slaughter.trips;

  add(results.freshMilkSold > 0, 'milk', n(market.milkPerDay, 0), 'litres', 'day');
  add(results.goatMilkSold > 0, 'goatMilk', n(market.goatMilkPerDay, 1), 'litres', 'day');
  add(results.cheeseSold > 0, 'cheese', n(market.cheesePerWeek, 1), 'kg', 'week');
  add(results.goatCheeseSold > 0, 'goatCheese', n(results.goatCheeseSold / 52, 1), 'kg', 'week');
  add(results.curdSold > 0, 'curd', n(market.curdPerWeek, 1), 'kg', 'week');
  add(results.creamSold > 0, 'cream', n(market.creamPerWeek, 1), 'kg', 'week');
  add(results.butterSold > 0, 'butter', n(market.butterPerWeek, 1), 'kg', 'week');
  add(results.eggsSold > 0, 'eggs', n(market.eggsPerWeek / 10, 0), 'boxes', 'week');
  add(results.lambsSoldLive > 0.05, 'lambsLive', n(results.lambsSoldLive, 0), 'pieces', 'year');
  add(results.lambMeatSoldKg > 0, 'lambMeat', n(results.lambMeatSoldKg, 0), 'kg', 'year', {
    lambs: n(results.lambsSoldAsMeat, 0),
    trips: trips.sheep,
  });
  add(results.cockerels > 0, 'cockerels', n(results.cockerels, 0), 'pieces', 'year');
  add(params.layingHens > 0, 'oldHens', n(results.henReplacements, 0), 'pieces', 'year');
  add(results.calvesSold > 0, 'calves', n(results.calvesSold, 0), 'pieces', 'year');
  add(
    params.broilers > 0,
    'broilers',
    n(results.revenueItems.broilers / (params.broilerCarcassKg * params.broilerPricePerKg), 0),
    'pieces',
    'year'
  );
  add(params.geese > 0, 'geese', n(results.geeseRaised, 0), 'pieces', 'year');
  add(params.ducks > 0, 'ducks', n(results.ducksRaised, 0), 'pieces', 'year');
  add(
    params.turkeys > 0,
    'turkeys',
    n(results.revenueItems.turkeys / (params.turkeyCarcassKg * params.turkeyPricePerKg), 0),
    'pieces',
    'year'
  );
  add(
    params.guineaFowl > 0,
    'guineaFowl',
    n(results.revenueItems.guineaFowl / (params.guineaFowlCarcassKg * params.guineaFowlPricePerKg), 0),
    'pieces',
    'year'
  );
  add(
    params.rabbits > 0,
    'rabbits',
    n(results.revenueItems.rabbits / params.rabbitPrice, 0),
    'pieces',
    'year'
  );
  add(results.porkSoldKg > 0, 'pork', n(results.porkSoldKg, 0), 'kg', 'year', {
    pigs: params.pigs,
    trips: trips.pigs,
  });
  add(results.kidsSold > 0, 'kids', n(results.kidsSold, 0), 'pieces', 'year');
  add(results.weanersSold > 0.05, 'weaners', n(results.weanersSold, 0), 'pieces', 'year');
  add(results.beefBoxKg > 0, 'beefBoxes', n(results.beefBoxKg, 0), 'kg', 'year', { trips: trips.beefCattle });
  add(results.processedValue > 0, 'processedGoods', n(results.processedKg, 0), 'kg', 'year', {
    parcels: n(results.parcels, 0),
  });
  add(results.revenueItems.fruit > 0, 'fruit', n(results.fruitSoldTonnes, 1), 'tonnes', 'year');
  add(
    results.revenueItems.mushrooms > 0,
    'mushrooms',
    n(results.revenueItems.mushrooms / params.mushroomPrice, 0),
    'kg',
    'year'
  );
  add(results.revenueItems.vegetables > 0, 'vegetables', n(market.csaShares, 0), 'families', 'season');
  add(results.revenueItems.honey > 0, 'honey', n(market.honeyKg, 0), 'kg', 'year');
  add(results.revenueItems.horseRiding > 0, 'horseRiding', n(params.ridesPerYear, 0), 'hours', 'year');
  add(results.revenueItems.grainSales > 0, 'grain', n(results.grainSoldTonnes, 1), 'tonnes', 'year');
  rows.push(
    tableRow(
      [
        cell(t('market.products.directSales')),
        numberCell(formatPln(market.directSalesRevenue)),
        cell(t('market.per.year'), { class: 'small' }),
        cell(''),
      ],
      { class: 'tot' }
    )
  );

  const header = tableHeader(
    MARKET_COLUMNS.map(column => t(`market.columns.${column}`)),
    index => index === 1
  );
  byId('market').innerHTML = header + tableBody(rows);
  renderCustomers(market);
}

/** How many customer families the household sales need: loyal full baskets versus single products. */
function renderCustomers(market) {
  const container = byId('customers');
  if (market.householdSales < 1) {
    container.innerHTML = '';
    return;
  }

  const card = (value, text, className) =>
    element(
      'div',
      { class: className },
      element('div', { class: 'v' }, value) + element('div', { class: 'k' }, text)
    );
  const loyal = Math.ceil(market.loyalFamilies);
  const occasional = Math.ceil(market.occasionalCustomers / 10) * 10;
  const cards = element(
    'div',
    { class: 'cards' },
    card(
      t('customers.familiesValue', { count: formatNumber(loyal, 0) }),
      t('customers.loyal', { amount: formatNumber(params.loyalCustomerSpendPerMonth, 0) }),
      'card good'
    ) +
      card(
        t('customers.customersValue', { count: formatNumber(occasional, 0) }),
        t('customers.occasional', { amount: formatNumber(params.occasionalCustomerSpendPerMonth, 0) }),
        'card'
      )
  );
  container.innerHTML =
    element('h3', { class: 'sub-h' }, t('customers.title')) +
    cards +
    element('p', { class: 'small muted' }, t('customers.note', { perWeek: formatNumber(loyal / 4, 0) }));
}
