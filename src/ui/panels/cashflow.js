// Panel "Cash flow": table and chart month by month, with the bank balance.

const CASHFLOW_CHART = { width: 640, height: 230, padLeft: 56, padRight: 10, padTop: 14, padBottom: 40 };

function renderCashflow(results) {
  const cashflow = results.cashflow;
  renderOpeningCash(cashflow);
  renderCashflowTable(cashflow);
  renderCashflowChart(cashflow);

  const lowestBalance = t('cashflow.lowestBalance', {
    month: messages('months.inText')[cashflow.minBalanceMonth],
    amount: formatPln(cashflow.minBalance),
  });
  const warning = cashflow.minBalance < 0 ? t('cashflow.belowZero') + ' ' : '';
  const explanation = t('cashflow.explanation', { household: formatPln(cashflow.householdDraw) });
  byId('cashflow-note').textContent = `${lowestBalance} ${warning}${explanation}`;
}

function renderCashflowTable(cashflow) {
  const monthNames = messages('months.names');
  const columns = ['month', 'sales', 'subsidies', 'costs', 'result', 'household', 'balance'];
  const money = (amount, canBeNegative = false) => numberCell(formatPln(amount), canBeNegative && amount < 0);
  const totals = { inflows: 0, subsidy: 0, outflows: 0, household: 0 };

  const rows = cashflow.months.map((month, index) => {
    for (const field in totals) totals[field] += month[field];
    const selected = index === cashflow.minBalanceMonth ? 'sel' : '';
    return (
      `<tr class="${selected}"><td>${monthNames[index]}</td>` +
      money(month.inflows) +
      money(month.subsidy) +
      money(month.outflows) +
      money(month.netIncome, true) +
      money(month.household) +
      money(month.balance, true) +
      '</tr>'
    );
  });
  const totalRow =
    `<tr class="tot"><td>${t('cashflow.year')}</td>` +
    money(totals.inflows) +
    money(totals.subsidy) +
    money(totals.outflows) +
    money(totals.inflows + totals.subsidy - totals.outflows) +
    money(totals.household) +
    money(cashflow.closingBalance) +
    '</tr>';

  const header = tableHeader(columns.map(column => t(`cashflow.columns.${column}`)));
  byId('cashflow-table').innerHTML = `${header}<tbody>${rows.join('')}${totalRow}</tbody>`;
}

/** Bars: the month's result after the household draw; line: the bank balance. */
function renderCashflowChart(cashflow) {
  const chart = CASHFLOW_CHART;
  const monthNames = messages('months.names');
  const numerals = messages('months.numerals');
  const slot = (chart.width - chart.padLeft - chart.padRight) / 12;
  const afterHousehold = cashflow.months.map(month => month.netIncome - month.household);
  const balances = cashflow.months.map(month => month.balance);
  const low = Math.min(0, ...afterHousehold, ...balances, params.openingCash);
  const high = Math.max(1, ...afterHousehold, ...balances, params.openingCash);
  const y = value =>
    chart.padTop + ((high - value) / (high - low)) * (chart.height - chart.padTop - chart.padBottom);
  const slotCentre = index => chart.padLeft + index * slot + slot / 2;

  let svg = '';
  const step = niceAxisStep(high - low);
  for (let value = Math.ceil(low / step) * step; value <= high; value += step) {
    const label = t('units.thousandsPln', { value: formatNumber(value / 1000, 0) });
    svg += horizontalLine(chart, y(value), { stroke: 'var(--line)' });
    svg += axisText(chart.padLeft - 6, y(value) + 4, label, 'end');
  }
  svg += horizontalLine(chart, y(0), { stroke: 'var(--muted)' });

  afterHousehold.forEach((value, index) => {
    const tooltip = t('cashflow.barTooltip', { month: monthNames[index], amount: formatPln(value) });
    const bar = {
      x: chart.padLeft + index * slot + slot * 0.2,
      y: Math.min(y(value), y(0)),
      width: slot * 0.6,
      height: Math.max(1, Math.abs(y(value) - y(0))),
      fill: value < 0 ? 'var(--bad)' : 'var(--color-cattle)',
      opacity: '.75',
    };
    svg += withTooltip('rect', bar, tooltip);
    svg += axisText(slotCentre(index), chart.height - chart.padBottom + 16, numerals[index], 'middle');
  });

  const balancePoints = balances.map((value, index) => `${slotCentre(index)},${y(value)}`).join(' ');
  svg += element('polyline', {
    fill: 'none',
    stroke: 'var(--ink)',
    'stroke-width': 2,
    points: balancePoints,
  });
  balances.forEach((value, index) => {
    const tooltip = t('cashflow.balanceTooltip', { month: monthNames[index], amount: formatPln(value) });
    svg += withTooltip('circle', { cx: slotCentre(index), cy: y(value), r: 3, fill: 'var(--ink)' }, tooltip);
  });
  svg += axisText(chart.padLeft, chart.height - 4, t('cashflow.legend'));

  byId('cashflow-chart').innerHTML = svg;
}

/**
 * Field for the money on the farm account on 1 January, the starting point of the balance.
 * It is the same value as the "openingCash" slider in the household group.
 */
function renderOpeningCash(cashflow) {
  const container = byId('opening-cash');
  const input = container.querySelector('input');
  if (input && document.activeElement === input) return; // the user is typing

  const parameter = parameterById('openingCash');
  const field = voidElement('input', {
    id: 'opening-cash-input',
    type: 'number',
    min: parameter.min,
    max: parameter.max,
    step: 1000,
    inputmode: 'numeric',
    value: params.openingCash,
  });
  const closing = t('cashflow.openingCash.closing', {
    closing: formatPln(cashflow.closingBalance),
    change:
      (cashflow.closingBalance >= params.openingCash ? '+' : '−') +
      formatPln(Math.abs(cashflow.closingBalance - params.openingCash)),
  });

  container.innerHTML =
    element(
      'label',
      { class: 'opening-cash-field', for: 'opening-cash-input' },
      element('span', { class: 'opening-cash-title' }, t('cashflow.openingCash.title')) +
        element('span', { class: 'opening-cash-amount' }, field + ' ' + t('cashflow.openingCash.currency'))
    ) + element('p', { class: 'small muted' }, t('cashflow.openingCash.description') + ' ' + closing);

  byId('opening-cash-input').addEventListener('change', event =>
    setParamFromInput('openingCash', event.target)
  );
}
