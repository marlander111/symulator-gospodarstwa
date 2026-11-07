// Panel "What has to be sold": quantities the farm must find buyers for.

function renderMarket(results) {
  const { market } = results;
  const cards = [];
  const add = (condition, amount, unitKey, textKey, values) => {
    if (condition)
      cards.push([t(`market.units.${unitKey}`, { value: amount }), t(`market.items.${textKey}`, values)]);
  };
  const n = formatNumber;

  add(results.freshMilkSold > 0, n(market.milkPerDay, 0), 'litres', 'milk');
  add(results.cheeseSold > 0, n(market.cheesePerWeek, 1), 'kg', 'cheese');
  add(results.eggsSold > 0, n(market.eggsPerWeek / 10, 0), 'boxes', 'eggs');
  add(results.lambsSoldLive > 0.05, n(results.lambsSoldLive, 0), 'pieces', 'lambsLive');
  add(
    results.lambMeatKg > 0,
    n(results.lambMeatKg, 0),
    'kg',
    results.abattoirTrips === 1 ? 'lambMeatOneTrip' : 'lambMeat',
    {
      lambs: n(results.lambsSoldAsMeat, 0),
      trips: results.abattoirTrips,
    }
  );
  add(results.cockerels > 0, n(results.cockerels, 0), 'pieces', 'cockerels');
  add(params.layingHens > 0, n(results.henReplacements, 0), 'pieces', 'oldHens');
  add(results.calvesSold > 0, n(results.calvesSold, 0), 'pieces', 'calves');
  add(params.broilers > 0, n(params.broilers * 0.95, 0), 'pieces', 'broilers');
  add(params.geese > 0, n(params.geese * 0.9, 0), 'pieces', 'geese');
  add(params.rabbits > 0, n(params.rabbits * params.rabbitsRearedPerDoe * 0.9, 0), 'pieces', 'rabbits');
  add(params.pigsForSale > 0, n(params.pigsForSale * params.pigCarcassKg, 0), 'kg', 'pork', {
    pigs: params.pigsForSale,
  });
  add(params.kidsSoldShare > 0, n(results.kidsSold, 0), 'pieces', 'kids');
  add(params.sucklerCows > 0, n(results.weanersSold + results.finishers, 0), 'pieces', 'beefCattle');
  add(params.ducks > 0, n(params.ducks * 0.93, 0), 'pieces', 'ducks');
  add(params.turkeys > 0, n(params.turkeys * 0.9, 0), 'pieces', 'turkeys');
  add(params.guineaFowl > 0, n(params.guineaFowl * 0.9, 0), 'pieces', 'guineaFowl');
  add(results.processedValue > 0, n(results.processedKg, 0), 'kg', 'processedGoods', {
    parcels: n(results.parcels, 0),
  });
  add(results.revenueItems.fruit > 0, n(results.fruitSoldTonnes, 1), 'tonnes', 'fruit');
  add(params.mushroomLogs > 0, n(results.mushroomsKg * 0.9, 0), 'kg', 'mushrooms');
  add(results.revenueItems.vegetables > 0, n(market.csaShares, 0), 'families', 'vegetables');
  add(results.revenueItems.honey > 0, n(market.honeyKg, 0), 'kg', 'honey');
  cards.push([formatPln(market.directSalesRevenue), t('market.items.directSales')]);

  byId('market').innerHTML = cards
    .map(
      ([amount, text]) => `<div class="card"><div class="v">${amount}</div><div class="k">${text}</div></div>`
    )
    .join('');
}
