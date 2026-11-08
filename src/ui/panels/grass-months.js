// Panel "Monthly grass balance": how the herd's pasture grows month by month against what the
// grazing animals eat (chart), and how the rest of the paddocks, the paddock per move and the
// paddocks in rotation change with the growth (table), with what to do in each month.

const GRASS_CHART = { width: 640, height: 250, padLeft: 40, padRight: 10, padTop: 18, padBottom: 30 };

/** Parts of a month's bar, bottom up (colours: CSS variables). */
const GRASS_BAR_PARTS = [
  { id: 'pasture', color: 'var(--color-pasture)' },
  { id: 'extra', color: 'var(--color-meadow)' },
  { id: 'standingIn', color: 'var(--color-fields)', opacity: 0.45 },
  { id: 'deficit', color: 'var(--warn)', opacity: 0.75 },
];

/** A month covering less than this share of the herd's need on its own is a weak month. */
const WEAK_MONTH_COVERAGE = 1.1;

function renderGrassMonths(results) {
  const grass = results.grassMonths;
  const hasHerd = results.paddocks.herdHa > 0 && results.grazingNeed > 0.05 && grass.months.length > 0;
  byId('grass-months-summary').innerHTML = hasHerd
    ? grassSummaryHtml(results)
    : element('p', {}, t('grassMonths.noHerd'));
  byId('grass-months-chart').innerHTML = hasHerd ? grassChartSvg(grass) : '';
  byId('grass-months-legend').innerHTML = hasHerd
    ? GRASS_BAR_PARTS.map(
        part =>
          `<span><i style="background:${part.color};opacity:${part.opacity || 1}"></i>${t(`grassMonths.legend.${part.id}`)}</span>`
      ).join('') +
      `<span><i class="line"></i>${t('grassMonths.legend.demand')}</span>` +
      (results.grassMonths.cutTonnes > 0.05
        ? `<span class="muted">${t('grassMonths.legend.cut')}</span>`
        : '')
    : '';
  byId('grass-months-table').innerHTML = hasHerd ? grassTableHtml(results) : '';
}

function grassSummaryHtml(results) {
  const grass = results.grassMonths;
  const tonnes = value => formatNumber(value, 1);
  const weakest = grass.months.reduce((low, month) => (month.coverage < low.coverage ? month : low));
  const monthName = month => messages('months.inText')[month];
  const parts = [
    t('grassMonths.summary.growth', {
      hectares: formatNumber(results.paddocks.herdHa, 1),
      grown: tonnes(sumBy(grass.months, month => month.pasture) + grass.turnoutCover),
      turnout: tonnes(grass.turnoutCover),
      need: tonnes(results.grazingNeed),
    }),
    grass.cutTonnes > 0.05
      ? t('grassMonths.summary.cut', { cut: tonnes(grass.cutTonnes), hay: tonnes(grass.hayMade) })
      : '',
    grass.hayFed > 0.05 ? t('grassMonths.summary.fed', { tonnes: tonnes(grass.hayFed) }) : '',
    grass.lateGrazing > 0.05
      ? t('grassMonths.summary.late', { left: tonnes(grass.leftStanding), late: tonnes(grass.lateGrazing) })
      : '',
  ];
  const weak =
    weakest.coverage < WEAK_MONTH_COVERAGE
      ? t('grassMonths.summary.weakest', {
          month: monthName(weakest.month),
          percent: formatNumber(Math.min(weakest.coverage, 1) * 100, 0),
        })
      : t('grassMonths.summary.noWeakMonth');
  return element('p', {}, parts.filter(Boolean).join(' ')) + element('p', { class: 'small muted' }, weak);
}

function grassChartSvg(grass) {
  const chart = GRASS_CHART;
  const byMonth = new Map(grass.months.map(month => [month.month, month]));
  const barTop = month => month.pasture + month.extra + month.standingIn + month.deficit;
  const max = Math.max(...grass.months.map(month => Math.max(barTop(month), month.demand)), 0.1);
  const step = niceAxisStep(max);
  const top = Math.ceil(max / step) * step;
  const y = tonnes => chart.padTop + (1 - tonnes / top) * (chart.height - chart.padTop - chart.padBottom);
  const slot = (chart.width - chart.padLeft - chart.padRight) / 12;
  const monthLabels = messages('months.numerals');

  let svg = '';
  for (let tonnes = 0; tonnes <= top + 1e-9; tonnes += step) {
    svg += horizontalLine(chart, y(tonnes), { class: 'grid' });
    svg += axisText(chart.padLeft - 6, y(tonnes) + 4, formatNumber(tonnes, step < 1 ? 1 : 0), 'end');
  }
  svg += axisText(chart.padLeft - 6, chart.padTop - 6, t('grassMonths.axis'), 'end');

  for (let index = 0; index < 12; index++) {
    const x = chart.padLeft + index * slot;
    const month = byMonth.get(index);
    svg += axisText(x + slot / 2, chart.height - 10, monthLabels[index], 'middle');
    if (!month) {
      // winter: the herd is on hay and the pasture rests
      svg += element('rect', {
        x: x + slot * 0.12,
        y: chart.padTop,
        width: slot * 0.76,
        height: y(0) - chart.padTop,
        class: 'winter-slot',
      });
      continue;
    }
    let stacked = 0;
    for (const part of GRASS_BAR_PARTS) {
      const value = month[part.id];
      if (value <= 0.001) continue;
      svg += withTooltip(
        'rect',
        {
          x: x + slot * 0.18,
          y: y(stacked + value),
          width: slot * 0.64,
          height: Math.max(0.5, y(stacked) - y(stacked + value)),
          fill: part.color,
          opacity: part.opacity || 1,
        },
        grassMonthTooltip(month)
      );
      stacked += value;
    }
    svg += element('line', {
      x1: x + slot * 0.08,
      x2: x + slot * 0.92,
      y1: y(month.demand),
      y2: y(month.demand),
      class: 'demand-line',
    });
    if (month.cut > 0.05)
      svg += axisText(
        x + slot / 2,
        y(stacked) - 5,
        t('grassMonths.cutLabel', { tonnes: formatNumber(month.cut, 1) }),
        'middle'
      );
  }
  return svg;
}

function grassMonthTooltip(month) {
  const tonnes = value => formatNumber(value, 1);
  return t('grassMonths.tooltip', {
    month: messages('months.names')[month.month],
    pasture: tonnes(month.pasture),
    extra: tonnes(month.extra),
    standing: tonnes(month.standingIn),
    demand: tonnes(month.demand),
    cut: tonnes(month.cut),
    deficit: tonnes(month.deficit),
  });
}

function grassTableHtml(results) {
  const { grassMonths: grass, grazingPlan } = results;
  const squareMetres = value =>
    t('grassMonths.squareMetres', { value: formatNumber(Math.round(value / 10) * 10, 0) });
  const columns = [
    t('grassMonths.columns.month'),
    t('grassMonths.columns.growth'),
    t('grassMonths.columns.rest'),
    t('grassMonths.columns.paddocks', { count: grazingPlan.paddockCount }),
    t('grassMonths.columns.strip'),
    t('grassMonths.columns.balance'),
  ];
  // every month has a row of numbers and, under it, a row with what to do
  const rows = grass.months.flatMap((month, index) => {
    const balance =
      month.cut > 0.05
        ? t('grassMonths.balance.cut', { tonnes: formatNumber(month.cut, 1) })
        : month.deficit > 0.05
          ? t('grassMonths.balance.deficit', { tonnes: formatNumber(month.deficit, 1) })
          : month.standingOut > 0.05
            ? t('grassMonths.balance.standing', { tonnes: formatNumber(month.standingOut, 1) })
            : t('grassMonths.balance.even');
    const strip =
      squareMetres(month.stripM2) +
      element(
        'span',
        { class: 'fixed-rest' },
        t('grassMonths.fixedRest', {
          days: params.pastureRestDays,
          area: squareMetres(month.stripFixedRestM2),
        })
      );
    return [
      tableRow(
        [
          cell(
            messages('months.names')[month.month] +
              (month.days < 28 ? ` (${t('grassMonths.days', { days: month.days })})` : '')
          ),
          numberCell(formatNumber(month.growthPerHaDay, 0)),
          numberCell(t('grassMonths.restDays', { days: formatNumber(month.restDays, 0) })),
          numberCell(formatNumber(month.paddocksInUse, 0)),
          numberCell(strip),
          numberCell(balance, month.deficit > 0.05),
        ],
        { class: 'month' }
      ),
      tableRow(
        [
          cell(
            element('div', { class: 'action-text' }, grassMonthAction(month, index, grass.months.length)),
            {
              colspan: columns.length,
            }
          ),
        ],
        {
          class: 'action',
        }
      ),
    ];
  });
  return tableHeader(columns) + tableBody(rows);
}

/** What to do with the grazing in this month. */
function grassMonthAction(month, index, monthCount) {
  if (month.cut > 0.05) return t('grassMonths.actions.cut', { paddocks: month.paddocksCut });
  if (month.deficit > 0.05)
    return t(month.month >= 8 ? 'grassMonths.actions.autumnGap' : 'grassMonths.actions.summerGap');
  if (index === 0) return t('grassMonths.actions.firstRound');
  if (month.coverage < WEAK_MONTH_COVERAGE) return t('grassMonths.actions.tight');
  if (month.month === 7 || month.month === 8) return t('grassMonths.actions.stockpile');
  if (index === monthCount - 1) return t('grassMonths.actions.lastRound');
  return t('grassMonths.actions.onPlan');
}
