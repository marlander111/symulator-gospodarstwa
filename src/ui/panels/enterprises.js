// Panel "Which enterprise pays": net result, PLN per hectare and PLN per hour for each enterprise.

function renderEnterprises(results) {
  const columns = [
    'enterprise',
    'perHa',
    'perHour',
    'net',
    'land',
    'hours',
    'sales',
    'costsWithFeed',
    'depreciation',
    'subsidies',
  ];
  const header = columns
    .map((column, index) => `<th${index ? ' class="n"' : ''}>${t(`enterprisesTable.columns.${column}`)}</th>`)
    .join('');
  const negativeClass = value => (value < 0 ? ' neg' : '');
  const cell = (value, extraClass = '') => `<td class="n${extraClass}">${value}</td>`;

  let html = `<thead><tr>${header}</tr></thead><tbody>`;
  for (const enterprise of results.enterprises.filter(item => item.active)) {
    const hasSales = enterprise.revenue > 0;
    html +=
      `<tr><td>${escapeHtml(t(`enterprises.${enterprise.labelKey}`))}</td>` +
      cell(
        hasSales && enterprise.netPerHa !== null ? formatNumber(enterprise.netPerHa, 0) : '–',
        negativeClass(enterprise.netPerHa || 0)
      ) +
      cell(hasSales ? formatNumber(enterprise.netPerHour, 0) : '–', negativeClass(enterprise.netPerHour)) +
      cell(formatPlnExact(enterprise.net), negativeClass(enterprise.net)) +
      cell(
        enterprise.landHa > 0.005 ? t('units.hectares', { value: formatNumber(enterprise.landHa, 2) }) : '–'
      ) +
      cell(formatNumber(enterprise.hours, 0)) +
      cell(formatPlnExact(enterprise.revenue)) +
      cell(formatPlnExact(enterprise.cost)) +
      cell(formatPlnExact(enterprise.depreciation)) +
      cell(formatPlnExact(enterprise.subsidy)) +
      `</tr>`;
  }
  html +=
    `<tr class="sub"><td>${t('enterprisesTable.unallocated')}</td>` +
    cell('') +
    cell('') +
    cell(formatPlnExact(results.unallocated.net)) +
    cell('') +
    cell(formatNumber(results.unallocated.hours, 0)) +
    cell('') +
    cell('') +
    cell('') +
    cell('') +
    `</tr>`;
  html +=
    `<tr class="tot"><td>${t('enterprisesTable.farm')}</td>` +
    cell(formatNumber(results.netIncome / results.farmedHa, 0)) +
    cell(formatNumber(results.netPerHour, 0)) +
    cell(formatPlnExact(results.netIncome)) +
    cell(t('units.hectares', { value: formatNumber(results.farmedHa, 1) })) +
    cell(formatNumber(results.totalHours, 0)) +
    cell(formatPlnExact(results.revenue)) +
    cell('') +
    cell(formatPlnExact(results.depreciation)) +
    cell(formatPlnExact(results.subsidies)) +
    `</tr></tbody>`;
  byId('enterprises-table').innerHTML = html;

  const items = results.subsidyItems;
  const areaPayments =
    items.basicPayment +
    items.redistributive +
    items.organic +
    items.livestockBonus +
    items.lessFavouredArea +
    items.extensiveGrassland +
    items.youngFarmer;
  byId('enterprises-note').textContent = t('enterprisesTable.note', {
    perHa: formatNumber(areaPayments / Math.max(0.01, results.farmedHa), 0),
  });
}
