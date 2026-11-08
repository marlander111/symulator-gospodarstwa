// Panel "Working time": hours per month stacked by activity group against the family's time
// and the weekly limit; a click on a month shows an average day of that month split into the
// morning, the day and the evening; and a table of hours per activity.

const LABOUR_CHART = { width: 640, height: 270, padLeft: 44, padRight: 10, padTop: 14, padBottom: 30 };

/** Month shown as an average day (0–11), or null for the busiest month. */
let labourDayMonth = null;
/** Activities listed for each time of day. */
const DAY_PLAN_TOP_ACTIVITIES = 4;
/** Jobs shorter than this a day (h) are not listed. */
const MIN_LISTED_DAILY_HOURS = 0.05;

function renderLabour(results) {
  renderLabourChart(results);
  renderLabourDay(results);

  byId('labour-legend').innerHTML = LABOUR_GROUPS.map(
    group => `<span><i style="background:${group.color}"></i>${t(`labourGroups.${group.id}`)}</span>`
  ).join('');

  byId('labour-summary').textContent = t('labour.summary', {
    average: formatNumber(results.weeklyHoursAverage, 0),
    daily: formatNumber(results.totalHours / 365, 1),
    peak: formatNumber(results.weeklyHoursPeak, 0),
    available: formatNumber(results.availableHours / 52, 0),
  });

  renderLabourTable(results);
}

function renderLabourChart(results) {
  const chart = LABOUR_CHART;
  const familyHoursPerMonth = results.availableHours / 12;
  const limitPerMonth = params.weeklyHoursLimit * WEEKS_PER_MONTH;
  const max = Math.max(results.peakMonthHours, familyHoursPerMonth, limitPerMonth, 1);
  const step = niceAxisStep(max);
  const top = Math.ceil(max / step) * step;
  const y = hours => chart.padTop + (1 - hours / top) * (chart.height - chart.padTop - chart.padBottom);
  const right = chart.width - chart.padRight;
  const monthLabels = messages('months.numerals');

  let svg = '';
  for (let hours = 0; hours <= top + 1e-9; hours += step) {
    svg += horizontalLine(chart, y(hours), { class: 'grid' });
    svg += axisText(chart.padLeft - 6, y(hours) + 4, formatNumber(hours, 0), 'end');
  }

  const slot = (chart.width - chart.padLeft - chart.padRight) / 12;
  const selectedMonth = shownDayMonth(results);
  results.monthlyHours.forEach((month, index) => {
    const x = chart.padLeft + index * slot + slot * 0.16;
    const width = slot * 0.68;
    let stacked = 0;
    let bars = '';
    for (const group of LABOUR_GROUPS) {
      const hours = month[group.id];
      if (hours <= 0) continue;
      const tooltip = t('labour.barTooltip', {
        month: monthLabels[index],
        group: t(`labourGroups.${group.id}`),
        hours: formatNumber(hours, 0),
      });
      const bar = {
        x,
        y: y(stacked + hours),
        width,
        height: Math.max(0.5, y(stacked) - y(stacked + hours)),
        fill: group.color,
      };
      bars += withTooltip('rect', bar, tooltip);
      stacked += hours;
    }
    // the whole column is clickable, also above short bars
    const hitArea = {
      x: x - slot * 0.16,
      y: chart.padTop,
      width: slot,
      height: y(0) - chart.padTop,
      fill: 'transparent',
    };
    const label = element(
      'text',
      {
        x: x + width / 2,
        y: chart.height - 10,
        'text-anchor': 'middle',
        'font-size': 11,
        fill: index === selectedMonth ? 'var(--accent)' : 'var(--muted)',
        'font-weight': index === selectedMonth ? 700 : 400,
      },
      monthLabels[index]
    );
    svg += element('g', { 'data-month': index }, element('rect', hitArea) + bars + label);
  });

  if (familyHoursPerMonth > 0) {
    const familyY = y(familyHoursPerMonth);
    const label = t('labour.familyTime', { hours: formatNumber(familyHoursPerMonth, 0) });
    svg += horizontalLine(chart, familyY, {
      stroke: 'var(--ink)',
      'stroke-width': 1.5,
      'stroke-dasharray': '6 4',
    });
    svg += element('text', { x: right, y: familyY - 5, 'text-anchor': 'end', 'font-size': 12 }, label);
  } else {
    svg += axisText(right, chart.padTop + 12, t('labour.axisLabel'), 'end');
  }

  const limitY = y(limitPerMonth);
  const limitLabel = t('labour.yourLimit', { hours: formatNumber(params.weeklyHoursLimit, 0) });
  svg += horizontalLine(chart, limitY, {
    stroke: 'var(--bad)',
    'stroke-width': 1.5,
    'stroke-dasharray': '2 4',
  });
  svg += element(
    'text',
    { x: chart.padLeft + 6, y: limitY - 5, 'font-size': 12, fill: 'var(--bad)' },
    limitLabel
  );

  byId('labour-chart').innerHTML = svg;
}

/** The month whose average day is shown: the clicked one, else the busiest. */
function shownDayMonth(results) {
  if (labourDayMonth !== null) return labourDayMonth;
  const totals = results.monthlyHours.map(month => month.total);
  return totals.indexOf(Math.max(...totals));
}

/** An average day of the chosen month: a bar of morning, day and evening and the main jobs. */
function renderLabourDay(results) {
  const month = shownDayMonth(results);
  const day = dailyHoursByTimeOfDay(results.hoursByActivity, month, params);
  if (day.total <= 0.05) {
    byId('labour-day').innerHTML = '';
    return;
  }
  const monthName = messages('months.inText')[month];
  const segment = time => {
    const hours = day.byTime[time];
    const width = (hours / day.total) * 100;
    return width > 0.5
      ? element(
          'span',
          { class: time, style: `width:${width}%` },
          width > 9 ? t('units.hours', { value: formatNumber(hours, 1) }) : ''
        )
      : '';
  };
  const column = time => {
    const jobs = Object.entries(day.activities[time])
      .filter(([, hours]) => hours >= MIN_LISTED_DAILY_HOURS)
      .sort((a, b) => b[1] - a[1])
      .slice(0, DAY_PLAN_TOP_ACTIVITIES)
      .map(
        ([activity, hours]) =>
          `${t(`labour.activities.${activity}`)} ${t('units.hours', { value: formatNumber(hours, 1) })}`
      );
    return (
      '<div>' +
      `<i class="${time}" style="background:var(--day-${time})"></i>` +
      element(
        'b',
        {},
        `${t(`labour.timesOfDay.${time}`)}: ${t('units.hours', { value: formatNumber(day.byTime[time], 1) })}`
      ) +
      element('div', { class: 'muted' }, escapeHtml(jobs.join(' · ') || t('labour.nothing'))) +
      '</div>'
    );
  };
  byId('labour-day').innerHTML =
    element('b', {}, t('labour.dayTitle', { month: monthName, hours: formatNumber(day.total, 1) })) +
    element('div', { class: 'day-bar' }, TIMES_OF_DAY.map(segment).join('')) +
    element('div', { class: 'day-times' }, TIMES_OF_DAY.map(column).join('')) +
    element('p', { class: 'small muted' }, t('labour.dayNote'));
}

/** A click on a month of the labour chart shows an average day of that month. */
function bindLabourChart() {
  byId('labour-chart').addEventListener('click', event => {
    const column = event.target.closest('[data-month]');
    if (!column) return;
    labourDayMonth = +column.dataset.month;
    render();
  });
}

function renderLabourTable(results) {
  const activities = Object.entries(results.hoursByActivity)
    .filter(([, hours]) => hours > 0.5)
    .sort((a, b) => b[1] - a[1]);
  const columns = ['activity', 'perYear', 'perWeek', 'perDay', 'share'];
  const percent = value => t('units.percent', { value });

  const rows = activities.map(
    ([activity, hours]) =>
      `<tr><td>${t(`labour.activities.${activity}`)}</td>` +
      numberCell(formatNumber(hours, 0)) +
      numberCell(formatNumber(hours / 52, 1)) +
      numberCell(formatNumber(hours / 365, 1)) +
      numberCell(percent(formatNumber((hours / results.totalHours) * 100, 0))) +
      '</tr>'
  );
  const totalRow =
    `<tr class="tot"><td>${t('money.total')}</td>` +
    numberCell(formatNumber(results.totalHours, 0)) +
    numberCell(formatNumber(results.weeklyHoursAverage, 1)) +
    numberCell(formatNumber(results.totalHours / 365, 1)) +
    numberCell(percent(100)) +
    '</tr>';

  const header = tableHeader(columns.map(column => t(`labour.columns.${column}`)));
  byId('labour-table').innerHTML = `${header}<tbody>${rows.join('')}${totalRow}</tbody>`;
}
