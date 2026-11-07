// Panel "What changes the result most": each assumption moved by ±20%, as a tornado chart.
// Factor names: locales/pl.json → sensitivity.factors.

const SENSITIVITY_FACTORS = [
  'cheesePrice',
  'milkPrice',
  'milkPerCow',
  'cheeseYield',
  'eggPrice',
  'eggsPerHen',
  'broilerPricePerKg',
  'goosePrice',
  'lambMeatPricePerKg',
  'duckPricePerKg',
  'porkBoxPricePerKg',
  'honeyPrice',
  'pastureYield',
  'meadowYield',
  'cerealYield',
  'cloverYield',
  'fixedCosts',
  'henFeedGramsPerDay',
  'pulletPrice',
  'leaseRentPerHa',
];

const SENSITIVITY_STEP = 0.2;
const SENSITIVITY_MIN_EFFECT_PLN = 200;
const SENSITIVITY_MAX_ROWS = 12;

/** Change of net income when each factor is 20% lower and 20% higher, largest effect first. */
function sensitivityRows() {
  const baseNet = simulateFarm(params).netIncome;
  const netChangeWith = (id, factor) =>
    simulateFarm({ ...params, [id]: params[id] * factor }).netIncome - baseNet;

  const rows = [];
  for (const id of SENSITIVITY_FACTORS) {
    if (!params[id]) continue;

    const lower = netChangeWith(id, 1 - SENSITIVITY_STEP);
    const higher = netChangeWith(id, 1 + SENSITIVITY_STEP);
    if (Math.abs(higher) + Math.abs(lower) < SENSITIVITY_MIN_EFFECT_PLN) continue;

    rows.push({
      label: t(`sensitivity.factors.${id}`),
      lower,
      higher,
      span: Math.abs(higher - lower),
    });
  }

  rows.sort((a, b) => b.span - a.span);
  return { baseNet, rows: rows.slice(0, SENSITIVITY_MAX_ROWS) };
}

function renderSensitivity() {
  const { baseNet, rows } = sensitivityRows();
  const chart = { width: 640, rowHeight: 24, padLeft: 150, padRight: 70, top: 22 };
  const height = chart.top + rows.length * chart.rowHeight + 26;
  const plotWidth = chart.width - chart.padLeft - chart.padRight;
  const largestEffect = row => Math.max(Math.abs(row.lower), Math.abs(row.higher));
  const maxEffect = Math.max(1, ...rows.map(largestEffect));
  const centre = chart.padLeft + plotWidth / 2;
  const scale = plotWidth / 2 / maxEffect;

  let svg = element(
    'text',
    { x: centre, y: 14, 'text-anchor': 'middle', class: 'ax' },
    t('sensitivity.title', { net: formatPln(baseNet) })
  );

  rows.forEach((row, index) => {
    const y = chart.top + index * chart.rowHeight;
    const label = escapeHtml(row.label);
    svg += element(
      'text',
      { x: chart.padLeft - 8, y: y + 16, 'text-anchor': 'end', 'font-size': 12.5 },
      label
    );
    svg += sensitivityBar({ chart, centre, scale, y, label, effect: row.lower, isHigher: false });
    svg += sensitivityBar({ chart, centre, scale, y, label, effect: row.higher, isHigher: true });

    const thousands = formatNumber(Math.round(largestEffect(row) / 100) / 10, 1);
    svg += axisText(
      chart.width - chart.padRight + 6,
      y + 16,
      '±' + t('units.thousandsPln', { value: thousands })
    );
  });

  svg += element('line', {
    x1: centre,
    x2: centre,
    y1: chart.top,
    y2: chart.top + rows.length * chart.rowHeight,
    stroke: 'var(--muted)',
  });

  const chartElement = byId('sensitivity-chart');
  chartElement.setAttribute('viewBox', `0 0 ${chart.width} ${height}`);
  chartElement.innerHTML = svg;
  byId('sensitivity-note').textContent = sensitivityNote(rows);
}

/** One bar of the tornado chart: green to the right when the result improves, red to the left. */
function sensitivityBar({ chart, centre, scale, y, label, effect, isHigher }) {
  const width = Math.abs(effect) * scale;
  const direction = isHigher ? '+20%' : '−20%';
  const sign = effect >= 0 ? '+' : '';
  const tooltip = `${label} ${direction}: ${sign}${formatPln(effect)}`;

  return withTooltip(
    'rect',
    {
      x: effect >= 0 ? centre : centre - width,
      y: y + 4,
      width: Math.max(1, width),
      height: chart.rowHeight - 8,
      rx: 2,
      fill: effect >= 0 ? 'var(--ok)' : 'var(--bad)',
      opacity: isHigher ? 0.75 : 0.5,
    },
    tooltip
  );
}

function sensitivityNote(rows) {
  if (!rows.length) return '';

  const topFactors = rows
    .slice(0, 3)
    .map(row => row.label.toLowerCase())
    .join(', ');
  return t('sensitivity.note', { factors: topFactors });
}
