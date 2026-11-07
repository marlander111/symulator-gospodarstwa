// Panel "Risk in random years": histogram of the net income over many simulated years, with the
// income target, the chance of reaching it and the typical, poor and good year.

const RISK_CHART = { width: 640, height: 220, padLeft: 10, padRight: 10, padTop: 16, padBottom: 34 };
const RISK_BINS = 24;

function renderRisk() {
  const risk = simulateRisk(params);
  renderRiskChart(risk);
  byId('risk-summary').innerHTML = t('risk.summary', {
    chance: formatNumber(Math.round(risk.chanceOfTarget * 100), 0),
    target: formatPln(risk.target),
    typical: formatPln(risk.p50),
    poor: formatPln(risk.p10),
    good: formatPln(risk.p90),
    years: risk.incomes.length,
  });
}

function renderRiskChart(risk) {
  const chart = RISK_CHART;
  const { incomes, target } = risk;
  const low = Math.min(incomes[0], target);
  const high = Math.max(incomes[incomes.length - 1], target);
  const binWidth = Math.max(1, (high - low) / RISK_BINS);
  const counts = Array(RISK_BINS).fill(0);
  for (const income of incomes) counts[Math.min(RISK_BINS - 1, Math.floor((income - low) / binWidth))]++;

  const plotWidth = chart.width - chart.padLeft - chart.padRight;
  const plotHeight = chart.height - chart.padTop - chart.padBottom;
  const x = value => chart.padLeft + ((value - low) / (high - low || 1)) * plotWidth;
  const barWidth = plotWidth / RISK_BINS;
  const maxCount = Math.max(1, ...counts);

  let svg = horizontalLine(chart, chart.padTop + plotHeight, { class: 'grid' });
  counts.forEach((count, index) => {
    if (!count) return;
    const binStart = low + index * binWidth;
    const height = (count / maxCount) * plotHeight;
    const reachesTarget = binStart + binWidth / 2 >= target;
    svg += withTooltip(
      'rect',
      {
        x: chart.padLeft + index * barWidth + 1,
        y: chart.padTop + plotHeight - height,
        width: Math.max(1, barWidth - 2),
        height,
        rx: 2,
        fill: reachesTarget ? 'var(--ok)' : 'var(--bad)',
        opacity: 0.75,
      },
      t('risk.barTooltip', {
        from: formatPln(binStart),
        to: formatPln(binStart + binWidth),
        years: count,
      })
    );
  });

  const targetX = x(target);
  svg += element('line', {
    x1: targetX,
    x2: targetX,
    y1: chart.padTop - 6,
    y2: chart.padTop + plotHeight,
    stroke: 'var(--ink)',
    'stroke-dasharray': '4 3',
  });
  svg += element(
    'text',
    { x: targetX + 4, y: chart.padTop + 4, class: 'ax' },
    t('risk.targetLabel', { target: formatPln(target) })
  );
  for (const [value, anchor] of [
    [low, 'start'],
    [(low + high) / 2, 'middle'],
    [high, 'end'],
  ])
    svg += axisText(x(value), chart.height - 12, formatPln(value), anchor);

  byId('risk-chart').innerHTML = svg;
}
