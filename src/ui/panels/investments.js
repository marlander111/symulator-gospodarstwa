// Panel "Investments": what the farm still has to buy for the chosen enterprises (items ticked
// as owned in "Required infrastructure" are left out), and other investments at the end.
// Amounts are tied two-way to the unit-price sliders: typing a total sets the unit price so
// that quantity × price equals the typed amount.

const INVESTMENT_COLUMNS = ['investment', 'cost', 'unitPrice', 'years', 'perYear'];

function renderInvestments(results) {
  // do not rebuild the table while the user is typing in it
  if (document.activeElement && document.activeElement.classList.contains('inv-in')) return;

  const header = tableHeader(INVESTMENT_COLUMNS.map(column => t(`investmentsTable.columns.${column}`)));
  const rows = results.investmentItems.filter(item => item.quantity > 0).map(investmentRow);
  rows.push(
    tableRow(
      [
        cell(t('money.total')),
        cell(formatPlnExact(results.capex), { class: 'n' }),
        cell(''),
        cell('', { class: 'n' }),
        cell(formatPlnExact(results.depreciation), { class: 'n' }),
      ],
      { class: 'tot' }
    )
  );
  byId('investments-table').innerHTML = header + tableBody(rows);
  const owned = results.infrastructure.filter(item => item.owned).length;
  byId('investments-owned-note').textContent = owned
    ? t('investmentsTable.ownedNote', { count: owned, value: formatPln(results.ownedInfrastructureValue) })
    : '';

  document
    .querySelectorAll('[data-investment]')
    .forEach(input => input.addEventListener('change', () => setInvestmentTotal(results, input)));
  document
    .querySelectorAll('[data-investment-years]')
    .forEach(input =>
      input.addEventListener('change', () => setParamFromInput(input.dataset.investmentYears, input))
    );
}

function investmentRow(item) {
  const label = escapeHtml(t(`investments.${item.id}`));
  const costInput = voidElement('input', {
    class: 'inv-in',
    type: 'number',
    min: 0,
    step: 500,
    inputmode: 'numeric',
    'data-investment': item.id,
    value: Math.round(item.cost),
    'aria-label': t('investmentsTable.costLabel', { investment: label }),
  });

  return tableRow([
    cell(label),
    cell(costInput, { class: 'n' }),
    cell(unitPriceText(item), { class: 'n small muted' }),
    cell(item.lifetimeParam ? lifetimeInput(item, label) : item.lifetimeYears, { class: 'n' }),
    cell(formatPlnExact(item.yearlyDepreciation), { class: 'n' }),
  ]);
}

/** Editable lifetime of the "other investments" row. */
function lifetimeInput(item, label) {
  const parameter = parameterById(item.lifetimeParam);
  return voidElement('input', {
    class: 'inv-in inv-years',
    type: 'number',
    min: parameter.min,
    max: parameter.max,
    step: 1,
    inputmode: 'numeric',
    'data-investment-years': item.lifetimeParam,
    value: item.lifetimeYears,
    'aria-label': t('investmentsTable.yearsLabel', { investment: label }),
  });
}

/** "price × quantity" for investments bought in more than one unit. */
function unitPriceText(item) {
  if (item.quantity === 1) return '';

  const price = formatParameterValue(parameterById(item.priceParam), params[item.priceParam]);
  const quantity = formatNumber(item.quantity, item.quantity < 10 ? 1 : 0);
  return `${price} × ${quantity}`;
}

/** Sets a parameter from a typed number, kept within the parameter's range. */
function setParamFromInput(id, input) {
  const parameter = parameterById(id);
  const value = parseFloat(input.value);
  if (!isFinite(value)) return;

  params[id] = Math.min(parameter.max, Math.max(parameter.min, value));
  syncInputs();
  input.blur();
  onParamsChanged();
}

function setInvestmentTotal(results, input) {
  const item = results.investmentItems.find(candidate => candidate.id === input.dataset.investment);
  const total = parseFloat(input.value);
  if (!item || !isFinite(total) || total < 0 || item.quantity <= 0) return;

  const id = item.priceParam;
  params[id] = Math.round((total / item.quantity) * 100) / 100;

  const slider = byId('input-' + id);
  if (slider) {
    slider.value = params[id];
    byId('output-' + id).textContent = formatParameterValue(parameterById(id), params[id]);
  }
  input.blur();
  onParamsChanged();
}
