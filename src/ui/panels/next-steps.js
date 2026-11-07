// Panel "What next": simulates small steps (one more cow, 30 more hens, ...) and shows what each
// adds and which limits it hits. Step labels: locales/pl.json → nextSteps.steps.

const NEXT_STEPS = [
  { key: 'addDairyCow', id: 'dairyCows', change: 1 },
  { key: 'moreCheese', id: 'cheeseShare', change: 10, max: 80 },
  { key: 'addHens', id: 'layingHens', change: 30 },
  { key: 'addBroilers', id: 'broilers', change: 50 },
  { key: 'addGeese', id: 'geese', change: 5 },
  { key: 'addDucks', id: 'ducks', change: 20 },
  { key: 'addGuineaFowl', id: 'guineaFowl', change: 20 },
  { key: 'addRabbitDoe', id: 'rabbits', change: 1 },
  { key: 'addEwes', id: 'sheep', change: 2 },
  { key: 'addPigsForSale', id: 'pigsForSale', change: 2 },
  { key: 'addSucklerCow', id: 'sucklerCows', change: 1 },
  { key: 'addBeehives', id: 'beehives', change: 2 },
  { key: 'addVegetables', id: 'marketGardenHa', change: 0.1 },
  { key: 'addMushroomLogs', id: 'mushroomLogs', change: 50 },
  { key: 'sellMoreFruit', id: 'fruitSoldShare', change: 20, max: 90 },
  { key: 'leaseMeadow', id: 'leasedHa', change: 1, also: { meadowHa: 1 } },
  { key: 'removeHorse', id: 'horses', change: -1, min: 0 },
  { key: 'removeRabbitDoe', id: 'rabbits', change: -1, min: 0 },
];

const roundTo2 = value => +value.toFixed(2);

const feedFromOwnLand = results =>
  results.grainBalance >= -0.05 &&
  results.hayBalance >= -0.05 &&
  results.strawBalance >= -0.05 &&
  results.grazingSurplus >= -0.05;

function describeFeedShortage(results) {
  const n = value => formatNumber(-value, 1);
  return [
    results.grainBalance < -0.05 ? t('comparison.shortage.grain', { tonnes: n(results.grainBalance) }) : '',
    results.hayBalance < -0.05 ? t('comparison.shortage.hay', { tonnes: n(results.hayBalance) }) : '',
    results.strawBalance < -0.05 ? t('comparison.shortage.straw', { tonnes: n(results.strawBalance) }) : '',
    results.grazingSurplus < -0.05 ? t('nextSteps.pastureShortage') : '',
  ]
    .filter(Boolean)
    .join(', ');
}

/** Simulates every step and sorts them: steps within the limits first, then by the pessimistic gain. */
function evaluateNextSteps() {
  const base = simulateFarm(params);
  const basePessimistic = simulateFarm(applyPessimisticScenario(params));
  const options = [];
  for (const step of NEXT_STEPS) {
    const current = params[step.id] || 0;
    const value = roundTo2(current + step.change);
    if (step.change < 0 && current <= (step.min ?? 0)) continue;
    if (step.max !== undefined && value > step.max) continue;

    const changedParams = { ...params, [step.id]: value };
    if (step.also) for (const id in step.also) changedParams[id] = roundTo2(params[id] + step.also[id]);
    const realistic = simulateFarm(changedParams);
    const pessimistic = simulateFarm(applyPessimisticScenario(changedParams));
    const feedOk = feedFromOwnLand(realistic);
    const peakHours = pessimistic.weeklyHoursPeak;
    options.push({
      step,
      changedParams,
      netChange: realistic.netIncome - base.netIncome,
      pessimisticChange: pessimistic.netIncome - basePessimistic.netIncome,
      hoursChange: realistic.totalHours - base.totalHours,
      capexChange: realistic.capex - base.capex,
      peakHours,
      feedOk,
      feedShortage: describeFeedShortage(realistic),
      fits: peakHours <= params.weeklyHoursLimit && feedOk,
    });
  }
  options.sort((a, b) => b.fits - a.fits || b.pessimisticChange - a.pessimisticChange);
  return options;
}

/** Pills naming what stops a step (peak hours, missing feed), or one "fits" pill. */
function nextStepLimitsHtml(option) {
  const limits = [
    option.peakHours > params.weeklyHoursLimit
      ? t('nextSteps.peak', { hours: formatNumber(option.peakHours, 0) })
      : '',
    option.feedOk ? '' : t('comparison.missing', { items: option.feedShortage }),
  ].filter(Boolean);

  if (!limits.length) return element('span', { class: 'pill ok' }, t('nextSteps.fits'));
  return limits.map(limit => element('span', { class: 'pill warn' }, escapeHtml(limit))).join(' ');
}

function nextStepRow(option, index, signed) {
  const perExtraHour = option.hoursChange > 1 ? formatNumber(option.netChange / option.hoursChange, 0) : '–';
  const hoursChange = (option.hoursChange >= 0 ? '+' : '') + formatNumber(option.hoursChange, 0);
  const capexChange = option.capexChange > 0 ? '+' + formatPln(option.capexChange) : '–';
  const applyButton = element(
    'button',
    { class: 'btn', type: 'button', 'data-next-step': index },
    t('nextSteps.apply')
  );

  return tableRow([
    cell(escapeHtml(t(`nextSteps.steps.${option.step.key}`))),
    numberCell(signed(option.netChange), option.netChange < 0),
    numberCell(signed(option.pessimisticChange), option.pessimisticChange < 0),
    numberCell(hoursChange),
    numberCell(perExtraHour),
    numberCell(capexChange),
    cell(nextStepLimitsHtml(option)),
    cell(applyButton),
  ]);
}

function renderNextSteps() {
  const options = evaluateNextSteps();
  const signed = amount => (amount >= 0 ? '+' : '') + formatPln(amount);
  const columns = [
    'change',
    'income',
    'pessimistic',
    'hours',
    'perExtraHour',
    'investments',
    'limits',
    'apply',
  ];
  const header = tableHeader(
    columns.map(column => (column === 'apply' ? '' : t(`nextSteps.columns.${column}`))),
    index => index > 0 && index < 6
  );
  const rows = options.map((option, index) => nextStepRow(option, index, signed));
  byId('next-steps-table').innerHTML = header + tableBody(rows);

  byId('next-steps-table')
    .querySelectorAll('[data-next-step]')
    .forEach(button =>
      button.addEventListener('click', () => {
        const option = options[+button.dataset.nextStep];
        if (!option) return;
        const { step, changedParams } = option;
        params[step.id] = changedParams[step.id];
        if (step.also) for (const id in step.also) params[id] = changedParams[id];
        syncInputs();
        onParamsChanged();
      })
    );

  const best = options.find(option => option.fits && option.pessimisticChange > 0);
  byId('next-steps-note').textContent = best
    ? t('nextSteps.best', {
        step: t(`nextSteps.steps.${best.step.key}`),
        amount: signed(best.pessimisticChange),
      })
    : t('nextSteps.nothingFits');
}
