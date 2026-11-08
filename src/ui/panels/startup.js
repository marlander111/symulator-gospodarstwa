// Panel "How to start": the plan built up over three years to full operation in year 4. The
// chosen year shows its income, hours, revenue and investments against full operation, and
// every year lists what the farm keeps then (only the enterprises of the current plan).

/** Year selected in the panel (1–4). */
let startupYear = 1;

/** Enterprise sizes listed for each year: id of the count or share, and how it is written. */
const STARTUP_ITEMS = [
  { id: 'dairyCows', kind: 'count' },
  { id: 'cheeseShare', kind: 'percent' },
  { id: 'curdShare', kind: 'percent' },
  { id: 'layingHens', kind: 'count' },
  { id: 'broilers', kind: 'count' },
  { id: 'geese', kind: 'count' },
  { id: 'ducks', kind: 'count' },
  { id: 'turkeys', kind: 'count' },
  { id: 'guineaFowl', kind: 'count' },
  { id: 'rabbits', kind: 'count' },
  { id: 'sucklerCows', kind: 'count' },
  { id: 'sheep', kind: 'count' },
  { id: 'goats', kind: 'count' },
  { id: 'pigs', kind: 'count' },
  { id: 'horses', kind: 'count' },
  { id: 'ridesPerYear', kind: 'count' },
  { id: 'marketGardenHa', kind: 'hectares' },
  { id: 'beehives', kind: 'count' },
  { id: 'mushroomLogs', kind: 'count' },
  { id: 'geeseProcessedShare', kind: 'percent' },
  { id: 'porkProcessedShare', kind: 'percent' },
  { id: 'preservesFruitShare', kind: 'percent' },
];

function renderStartup() {
  const years = simulateStartupYears(params);
  const full = years[FULL_OPERATION_YEAR - 1].results;
  const selected = years[startupYear - 1];

  byId('startup-years').innerHTML =
    element('span', { class: 'lab' }, t('startup.chooseYear')) +
    years
      .map(({ year }) =>
        element(
          'button',
          { class: year === startupYear ? 'btn on' : 'btn', type: 'button', 'data-startup-year': year },
          t(year === FULL_OPERATION_YEAR ? 'startup.fullYear' : 'startup.year', { year })
        )
      )
      .join('');

  byId('startup-kpis').innerHTML = startupKpisHtml(selected.results, full);
  const shareOfFull = full.netIncome > 0 ? selected.results.netIncome / full.netIncome : 0;
  byId('startup-summary').textContent =
    startupYear === FULL_OPERATION_YEAR
      ? t('startup.fullSummary')
      : t('startup.summary', {
          year: startupYear,
          percent: formatNumber(shareOfFull * 100, 0),
          missing: formatPln(full.netIncome - selected.results.netIncome),
        });
  byId('startup-steps').innerHTML = years.map(year => startupYearCardHtml(year, params)).join('');
}

function startupKpisHtml(results, full) {
  const card = (key, value, detail) =>
    element(
      'div',
      { class: 'card' },
      element('div', { class: 'k' }, t(key)) +
        element('div', { class: 'v' }, value) +
        element('div', { class: 's' }, detail)
    );
  const percentOf = (value, fullValue) =>
    fullValue ? t('startup.ofFull', { percent: formatNumber((value / fullValue) * 100, 0) }) : '';
  return (
    card('page.kpi.netIncome', formatPln(results.netIncome), percentOf(results.netIncome, full.netIncome)) +
    card('startup.perMonth', formatPln(results.netIncome / 12), t('startup.afterCosts')) +
    card(
      'page.kpi.revenue',
      formatPln(results.revenue + results.subsidies),
      percentOf(results.revenue, full.revenue)
    ) +
    card(
      'page.kpi.hours',
      t('units.hours', { value: formatNumber(results.totalHours, 0) }),
      percentOf(results.totalHours, full.totalHours)
    ) +
    card('page.kpi.investment', formatPln(results.capex), percentOf(results.capex, full.capex))
  );
}

function startupYearCardHtml({ year, params: yearParams }, fullParams) {
  const amount = (item, value) => {
    if (item.kind === 'percent') return t('units.percent', { value: formatNumber(value, 0) });
    if (item.kind === 'hectares') return t('units.hectares', { value: formatNumber(value, 2) });
    return formatNumber(value, 0);
  };
  const lines = STARTUP_ITEMS.filter(item => fullParams[item.id] > 0).map(item => {
    const value = yearParams[item.id];
    const text = t(`startup.items.${item.id}`, {
      amount: amount(item, value),
      full: amount(item, fullParams[item.id]),
    });
    return element('li', { class: value > 0 ? null : 'muted' }, escapeHtml(text));
  });
  const tasks = messages(`startup.tasks.year${year}`).map(task => element('li', {}, escapeHtml(task)));
  const title = t(year === FULL_OPERATION_YEAR ? 'startup.fullYear' : 'startup.year', { year });
  return element(
    'div',
    { class: year === startupYear ? 'yr now' : 'yr' },
    element('div', { class: 'eyebrow' }, title) +
      element('ul', {}, lines.join('')) +
      element('h3', {}, t('startup.tasksTitle')) +
      element('ul', {}, tasks.join(''))
  );
}

function bindStartup() {
  byId('startup-years').addEventListener('click', event => {
    const button = event.target.closest('[data-startup-year]');
    if (!button) return;
    startupYear = +button.dataset.startupYear;
    renderStartup();
  });
}
