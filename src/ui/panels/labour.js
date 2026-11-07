// Panel "Working time": hours per month stacked by activity group against the family's time
// and the weekly limit, and a table of hours per activity.

const LABOUR_CHART = { width: 640, height: 270, padLeft: 44, padRight: 10, padTop: 14, padBottom: 30 };

function renderLabour(results) {
  renderLabourChart(results);

  byId('labour-legend').innerHTML = LABOUR_GROUPS.map(
    group => `<span><i style="background:${group.color}"></i>${t(`labourGroups.${group.id}`)}</span>`
  ).join('');

  byId('labour-summary').textContent = t('labour.summary', {
    average: formatNumber(results.weeklyHoursAverage, 0),
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
  results.monthlyHours.forEach((month, index) => {
    const x = chart.padLeft + index * slot + slot * 0.16;
    const width = slot * 0.68;
    let stacked = 0;
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
      svg += withTooltip('rect', bar, tooltip);
      stacked += hours;
    }
    svg += axisText(x + width / 2, chart.height - 10, monthLabels[index], 'middle');
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

function renderLabourTable(results) {
  const activities = Object.entries(results.hoursByActivity)
    .filter(([, hours]) => hours > 0.5)
    .sort((a, b) => b[1] - a[1]);
  const columns = ['activity', 'perYear', 'perWeek', 'share'];
  const percent = value => t('units.percent', { value });

  const rows = activities.map(
    ([activity, hours]) =>
      `<tr><td>${t(`labour.activities.${activity}`)}</td>` +
      numberCell(formatNumber(hours, 0)) +
      numberCell(formatNumber(hours / 52, 1)) +
      numberCell(percent(formatNumber((hours / results.totalHours) * 100, 0))) +
      '</tr>'
  );
  const totalRow =
    `<tr class="tot"><td>${t('money.total')}</td>` +
    numberCell(formatNumber(results.totalHours, 0)) +
    numberCell(formatNumber(results.weeklyHoursAverage, 1)) +
    numberCell(percent(100)) +
    '</tr>';

  const header = tableHeader(columns.map(column => t(`labour.columns.${column}`)));
  byId('labour-table').innerHTML = `${header}<tbody>${rows.join('')}${totalRow}</tbody>`;
}
