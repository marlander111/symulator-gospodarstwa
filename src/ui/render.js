// Re-rendering: every change of the params recomputes the model and redraws all panels.

/** When true, all panels show the pessimistic scenario instead of the current settings. */
let showPessimistic = false;
let pendingFrame = 0;
let slowPanelsTimer = 0;

/** Called after any change of `params`: re-renders once per animation frame and remembers the settings. */
function onParamsChanged() {
  recordParamsChange();
  if (pendingFrame) return;
  pendingFrame = requestAnimationFrame(() => {
    pendingFrame = 0;
    render();
    saveParams();
  });
}

function render() {
  const pessimistic = simulateFarm(applyPessimisticScenario(params));
  const results = showPessimistic ? pessimistic : simulateFarm(params);
  markActivePresets();

  renderKpis(results, pessimistic);
  renderLocation(results);
  renderGroupSummaries(results);
  syncDerivedFields();
  renderWarnings(results, pessimistic);
  renderLandUse(results);
  renderFeedBalance(results);
  renderMoney(results);
  renderHouseholdBudget(results, pessimistic);
  renderCashflow(results);
  renderEnterprises(results);

  // these panels run the model many times, so they wait until the sliders stop moving
  clearTimeout(slowPanelsTimer);
  slowPanelsTimer = setTimeout(() => {
    renderNextSteps();
    renderSensitivity();
    renderRisk();
    renderStartup();
    tintTables();
  }, 220);

  renderLabour(results);
  renderMarket(results);
  renderInfrastructure(results);
  renderInvestments(results);
  renderComparison();
  renderFarmPlan(results);
  renderGrassMonths(results);
  renderRotation(results);
  renderNitrogen(results);
  renderCalendar(results);
  tintTables();
}

function renderWarnings(results, pessimistic) {
  const target = computeIncomeTarget(params);
  const warnings = results.warnings.map(warning => ({
    level: warning.level,
    text: t(`warnings.${warning.key}`, warning.values),
  }));
  const add = (atStart, level, key, values) => {
    const warning = { level, text: t(`warnings.${key}`, values) };
    if (atStart) warnings.unshift(warning);
    else warnings.push(warning);
  };

  if (showPessimistic) add(true, 'info', 'viewingPessimistic');
  if (pessimistic.netIncome < target)
    add(true, 'warn', 'pessimisticBelowTarget', {
      result: formatPln(pessimistic.netIncome),
      gap: formatPln(target - pessimistic.netIncome),
      target: formatPln(target),
    });
  else
    add(false, 'ok', 'pessimisticAboveTarget', {
      result: formatPln(pessimistic.netIncome),
      target: formatPln(target),
    });
  if (
    pessimistic.weeklyHoursPeak > params.weeklyHoursLimit &&
    results.weeklyHoursPeak <= params.weeklyHoursLimit
  )
    add(true, 'warn', 'pessimisticPeakOverLimit', {
      peak: formatNumber(pessimistic.weeklyHoursPeak, 0),
      limit: formatNumber(params.weeklyHoursLimit, 0),
    });
  if (!warnings.some(warning => warning.level === 'bad'))
    add(true, 'ok', 'planFits', {
      area: formatNumber(params.ownedHa + params.leasedHa, 1),
      net: formatPln(results.netIncome),
      hours: formatNumber(results.totalHours, 0),
      percent: formatNumber(results.labourUtilisation * 100, 0),
      homeValue: formatPln(results.homeUseTotal),
    });

  byId('warnings').innerHTML = warnings
    .map(warning => `<div class="w ${warning.level}"><span>${escapeHtml(warning.text)}</span></div>`)
    .join('');
}
