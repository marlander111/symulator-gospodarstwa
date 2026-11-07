// Summary bar at the top: net income, working hours, revenue, pessimistic result,
// investments, feed balance and stocking density.

/** Below this yearly feed need (tonnes) the feed surplus is not shown as a percentage. */
const MIN_FEED_NEED_FOR_PERCENT = 1;

function renderKpis(results, pessimistic) {
  const target = computeIncomeTarget(params);

  byId('kpi-net').textContent = formatPln(results.netIncome);
  byId('kpi-net').classList.toggle('neg', results.netIncome < 0);
  byId('kpi-net-detail').textContent = t('kpi.netPerMonth', { amount: formatPln(results.netIncome / 12) });

  byId('kpi-hours').textContent = t('units.hours', { value: formatNumber(results.totalHours, 0) });
  byId('kpi-hours-detail').textContent = t('kpi.hoursDetail', {
    weekly: formatNumber(results.totalHours / 52, 0),
    daily: formatNumber(results.totalHours / 365, 1),
    peak: formatNumber(pessimistic.weeklyHoursPeak, 0),
    limit: formatNumber(params.weeklyHoursLimit, 0),
  });
  const overworked = results.labourUtilisation > 1 || pessimistic.weeklyHoursPeak > params.weeklyHoursLimit;
  byId('kpi-hours-detail').style.color = overworked ? 'var(--bad)' : '';

  byId('kpi-revenue').textContent = formatPln(results.revenue + results.subsidies);
  byId('kpi-revenue-detail').title = t('kpi.revenueExplanation');
  byId('kpi-revenue-detail').textContent = t('kpi.revenueDetail', {
    subsidies: formatPln(results.subsidies),
    costs: formatPln(results.costs + results.depreciation),
  });

  const meetsTarget = pessimistic.netIncome >= target;
  byId('kpi-pessimistic').textContent = formatPln(pessimistic.netIncome);
  byId('kpi-pessimistic').style.color = meetsTarget ? 'var(--ok)' : 'var(--bad)';
  byId('kpi-pessimistic-detail').textContent = t(meetsTarget ? 'kpi.aboveTarget' : 'kpi.belowTarget', {
    thousands: formatNumber(target / 1000, 0),
  });

  byId('kpi-investment').textContent = formatPln(results.capex);
  byId('kpi-investment-detail').textContent = t('kpi.perYear', { amount: formatPln(results.depreciation) });

  renderFeedKpi(results);
  byId('kpi-stocking').textContent = formatNumber(results.livestockUnitsPerHa, 2);
}

function renderFeedKpi(results) {
  const tolerance = -0.05;
  const feedOk =
    results.grainBalance >= tolerance && results.hayBalance >= tolerance && results.strawBalance >= tolerance;
  const balances = [
    ['hay', results.hayBalance],
    ['grain', results.grainBalance],
    ['straw', results.strawBalance],
  ];
  if (results.grazingSurplus < tolerance) balances.push(['pasture', results.grazingSurplus]);
  const describe = (items, amount) =>
    items
      .map(([feed, balance]) =>
        t('kpi.feedItem', { feed: t(`feeds.${feed}`), tonnes: formatNumber(amount(balance), 1) })
      )
      .join(', ');
  const sawdust =
    results.sawdustTonnes > 0.05 ? t('kpi.sawdust', { tonnes: formatNumber(results.sawdustTonnes, 1) }) : '';

  if (feedOk) {
    const need = results.hayNeed + results.grainNeed + results.strawNeed;
    const supply = results.haySupply + results.grainSupply + results.strawSupply;
    // without animals there is nothing to feed, so a percentage would mean nothing
    const surplusPercent = Math.max(0, ((supply - need) / Math.max(0.1, need)) * 100);
    byId('kpi-feed').textContent =
      need < MIN_FEED_NEED_FOR_PERCENT
        ? t('kpi.feedNoAnimals')
        : t('kpi.feedSurplus', { percent: formatNumber(surplusPercent, 0) });
    byId('kpi-feed-detail').textContent =
      t('kpi.feedReserve', { items: describe(balances, balance => Math.max(0, balance)) }) + sawdust;
  } else {
    const shortages = balances.filter(([, balance]) => balance < tolerance);
    const missing = shortages.reduce((sum, [, balance]) => sum - balance, 0);
    byId('kpi-feed').textContent = t('kpi.feedShortage', { tonnes: formatNumber(missing, 1) });
    byId('kpi-feed-detail').textContent =
      t('kpi.feedMissing', { items: describe(shortages, balance => -balance) }) + sawdust;
  }
  byId('kpi-feed').style.color = feedOk ? 'var(--ok)' : 'var(--bad)';
  byId('kpi-feed-detail').title = t('kpi.feedExplanation');
}
