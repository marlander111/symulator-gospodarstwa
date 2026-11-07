// Section "Compare variants": every preset and saved variant under realistic assumptions and in the
// pessimistic scenario, with a button that loads it.

function renderComparison() {
  const realistic = ASSUMPTION_SETS.find(set => set.id === 'realistic').params;
  const target = computeIncomeTarget(params);
  const columns = [
    'variant',
    'netRealistic',
    'netPessimistic',
    'hours',
    'peakPessimistic',
    'investments',
    'feed',
    'load',
  ];
  let html = tableHeader(
    columns.map(column => (column === 'load' ? '' : t(`comparison.columns.${column}`))),
    index => index > 0 && index < 6
  );
  html += '<tbody>';

  for (const preset of PRESETS) {
    const variantParams = { ...params, ...preset.params, ...realistic };
    html += comparisonRowHtml({
      title: t(`presets.${preset.id}.label`),
      subtitle: t(`presets.${preset.id}.note`),
      variantParams,
      target,
      showShortageDetails: true,
      loadButtonData: { 'data-load-preset': preset.id },
    });
  }
  savedVariants.forEach((variant, index) => {
    html += comparisonRowHtml({
      title: variant.name,
      subtitle: t('comparison.savedVariant'),
      variantParams: { ...defaultParams(), ...variant.params },
      target,
      showShortageDetails: false,
      loadButtonData: { 'data-load-saved': index },
    });
  });
  byId('comparison-table').innerHTML = html + `</tbody>`;

  const loadAndScroll = values => {
    applyParams(values);
    byId('controls').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  document.querySelectorAll('[data-load-saved]').forEach(button =>
    button.addEventListener('click', () => {
      endHistoryStep();
      params = { ...defaultParams(), ...savedVariants[+button.dataset.loadSaved].params };
      loadAndScroll({});
    })
  );
  document
    .querySelectorAll('[data-load-preset]')
    .forEach(button =>
      button.addEventListener('click', () => loadAndScroll(presetById(button.dataset.loadPreset).params))
    );
}

function comparisonRowHtml({ title, subtitle, variantParams, target, showShortageDetails, loadButtonData }) {
  const realistic = simulateFarm(variantParams);
  const pessimistic = simulateFarm(applyPessimisticScenario(variantParams));
  const feedCell = showShortageDetails
    ? feedStatusHtml(realistic, 'bad', 'comparison.missing') +
      ' ' +
      (feedIsSufficient(pessimistic)
        ? ''
        : feedStatusHtml(pessimistic, 'warn', 'comparison.missingPessimistic'))
    : feedIsSufficient(realistic)
      ? element('span', { class: 'pill ok' }, t('comparison.enough'))
      : element('span', { class: 'pill bad' }, t('comparison.missingShort'));
  const titleHtml =
    element('b', {}, escapeHtml(title)) +
    '<br>' +
    element('span', { class: 'small muted' }, escapeHtml(subtitle));
  const loadButton = element(
    'button',
    { class: 'btn', type: 'button', ...loadButtonData },
    t('comparison.load')
  );

  return tableRow([
    cell(titleHtml),
    numberCell(formatPln(realistic.netIncome)),
    numberCell(formatPln(pessimistic.netIncome), pessimistic.netIncome < target),
    numberCell(formatNumber(realistic.totalHours, 0)),
    numberCell(
      formatNumber(pessimistic.weeklyHoursPeak, 0),
      pessimistic.weeklyHoursPeak > params.weeklyHoursLimit
    ),
    numberCell(formatPln(realistic.capex)),
    cell(feedCell),
    cell(loadButton),
  ]);
}

const feedIsSufficient = results =>
  results.grainBalance >= -0.05 && results.hayBalance >= -0.05 && results.strawBalance >= -0.05;

/** "enough" pill, or a pill listing the missing grain, hay and straw. */
function feedStatusHtml(results, level, missingKey) {
  if (feedIsSufficient(results))
    return level === 'bad' ? `<span class="pill ok">${t('comparison.enough')}</span>` : '';
  const shortages = [
    ['grain', results.grainBalance],
    ['hay', results.hayBalance],
    ['straw', results.strawBalance],
  ]
    .filter(([, balance]) => balance < -0.05)
    .map(([feed, balance]) => t(`comparison.shortage.${feed}`, { tonnes: formatNumber(-balance, 1) }))
    .join(', ');
  return `<span class="pill ${level}">${t(missingKey, { items: shortages })}</span>`;
}
