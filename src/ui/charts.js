// Helpers for the SVG charts.

/** Round axis step giving about four grid lines up to `max` (1, 2, 2.5, 5 or 10 × a power of ten). */
function niceAxisStep(max) {
  const rawStep = max / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalised = rawStep / magnitude;
  const niceNormalised =
    normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 2.5 ? 2.5 : normalised <= 5 ? 5 : 10;
  return niceNormalised * magnitude;
}

/**
 * Horizontal line across the plot area of a chart.
 * @param {{width: number, padLeft: number, padRight: number}} chart
 */
const horizontalLine = (chart, y, attributes = {}) =>
  element('line', { x1: chart.padLeft, x2: chart.width - chart.padRight, y1: y, y2: y, ...attributes });

/** Small grey text of an axis or a legend. */
const axisText = (x, y, text, anchor = null) =>
  element('text', { x, y, 'text-anchor': anchor, class: 'ax' }, text);

/** A shape with a hover tooltip. */
const withTooltip = (name, attributes, tooltip) => element(name, attributes, element('title', {}, tooltip));
