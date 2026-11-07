// Calendar of the year: tasks of the enterprises the farm actually runs, with the hours
// and cash of each month. Texts: locales/pl.json → calendar.

/**
 * Rows of the calendar; a row is shown when `isActive` returns true. Each row's texts live
 * under calendar.tasks.<id>: `label` and twelve `months` (an empty text means nothing to do).
 */
const CALENDAR_ROWS = [
  { id: 'dairyCows', isActive: () => params.dairyCows > 0 },
  { id: 'cheese', isActive: () => params.dairyCows > 0 && params.cheeseShare > 0 },
  { id: 'sucklerCows', isActive: () => params.sucklerCows > 0 },
  {
    id: 'layingHens',
    isActive: () => params.layingHens > 0,
    monthsKey: () => (params.winterPolytunnel ? 'monthsWithWinterTunnel' : 'months'),
  },
  { id: 'hatching', isActive: () => params.ownHatching && params.layingHens > 0 },
  { id: 'broilers', isActive: () => params.broilers > 0 },
  { id: 'geese', isActive: () => params.geese > 0 },
  { id: 'ducks', isActive: () => params.ducks > 0 },
  { id: 'turkeys', isActive: () => params.turkeys > 0 },
  { id: 'guineaFowl', isActive: () => params.guineaFowl > 0 },
  { id: 'rabbits', isActive: () => params.rabbits > 0 },
  { id: 'sheep', isActive: () => params.sheep > 0 },
  { id: 'goats', isActive: () => params.goats > 0 },
  { id: 'pigs', isActive: () => params.pigsForHome > 0 },
  { id: 'fieldsAndMeadows', isActive: () => true },
  { id: 'marketGarden', isActive: () => params.marketGardenHa > 0 },
  { id: 'orchard', isActive: () => params.fruitSoldShare > 0 },
  { id: 'mushrooms', isActive: () => params.mushroomLogs > 0 },
  { id: 'bees', isActive: () => params.beehives > 0 },
  { id: 'processing', isActive: results => results.processedValue > 0 },
  { id: 'catchCrops', isActive: () => params.catchCrops },
  { id: 'paperwork', isActive: () => true },
];

const CALENDAR_COLUMNS = ['month', 'tasks', 'hoursPerWeek', 'inflows', 'outflows', 'balance'];
const NUMERIC_CALENDAR_COLUMNS = ['hoursPerWeek', 'inflows', 'outflows', 'balance'];

function renderCalendar(results) {
  if (!results) return;

  const activeRows = CALENDAR_ROWS.filter(row => row.isActive(results)).map(row => ({
    label: t(`calendar.tasks.${row.id}.label`),
    months: messages(`calendar.tasks.${row.id}.${row.monthsKey ? row.monthsKey() : 'months'}`),
  }));
  const monthNames = messages('months.names');

  const header = CALENDAR_COLUMNS.map(column => {
    const className = NUMERIC_CALENDAR_COLUMNS.includes(column) ? ' class="n"' : '';
    return `<th${className}>${t(`calendar.columns.${column}`)}</th>`;
  }).join('');

  const bodyRows = results.cashflow.months.map((cash, month) => {
    const tasks = activeRows
      .filter(row => row.months[month])
      .map(row => `<span class="tk"><b>${row.label}:</b> ${escapeHtml(row.months[month])}</span>`)
      .join('');
    const hoursPerWeek = results.monthlyHours[month].total / WEEKS_PER_MONTH;
    const selected = month === planView.month ? 'sel' : '';

    return `<tr data-calendar-month="${month}" class="${selected}">
      <td>${monthNames[month]}</td>
      <td>${tasks}</td>
      <td class="n">${formatNumber(hoursPerWeek, 0)}</td>
      <td class="n">${formatPln(cash.inflows + cash.subsidy)}</td>
      <td class="n">${formatPln(cash.outflows + cash.household)}</td>
      <td class="n${cash.balance < 0 ? ' neg' : ''}">${formatPln(cash.balance)}</td>
    </tr>`;
  });

  byId('calendar-table').innerHTML = `<thead><tr>${header}</tr></thead><tbody>${bodyRows.join('')}</tbody>`;
}
