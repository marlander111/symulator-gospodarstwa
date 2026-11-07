// Subtle background colours for numbers in tables: from red (weakest) to green (best).

const DECIMAL_SEPARATOR = (1.5).toLocaleString(t('format.numberLocale')).charAt(1);
const NOT_PART_OF_NUMBER = new RegExp(`[^\\d\\-${DECIMAL_SEPARATOR}]`, 'g');

/** Parses a number as displayed ("−12 300 zł", "1,5", "12,300 PLN", "1.5") or returns null. */
function parseDisplayedNumber(text) {
  const normalised = String(text)
    .replace(/−/g, '-')
    .replace(NOT_PART_OF_NUMBER, '')
    .replace(DECIMAL_SEPARATOR, '.');
  const value = parseFloat(normalised);
  return isFinite(value) ? value : null;
}

const mixBackground = (colorVariable, strength) =>
  strength > 0.005
    ? `color-mix(in srgb, var(${colorVariable}) ${Math.round(strength * 100)}%, transparent)`
    : '';

/**
 * Colours selected columns of a table.
 * Modes: "pos" – green by size, "neg" – red by size, "rank" – red to green by value,
 * "low" – like rank but lower is better.
 * @param {string} tableId
 * @param {Object<number, string>} modeByColumn
 */
function tintTable(tableId, modeByColumn) {
  const table = byId(tableId);
  if (!table) return;
  const rows = [...table.querySelectorAll('tbody tr')].filter(row => !row.classList.contains('tot'));
  for (const [column, mode] of Object.entries(modeByColumn)) {
    const cells = rows.map(row => row.cells[+column]).filter(Boolean);
    const values = cells.map(cell => parseDisplayedNumber(cell.textContent));
    const numbers = values.filter(value => value !== null);
    if (!numbers.length) continue;
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const maxAbs = Math.max(...numbers.map(Math.abs)) || 1;
    cells.forEach((cell, index) => {
      const value = values[index];
      cell.style.background = value === null ? '' : cellBackground(mode, value, min, max, maxAbs);
    });
  }
}

function cellBackground(mode, value, min, max, maxAbs) {
  if (mode === 'pos') return mixBackground('--ok', (0.3 * Math.abs(value)) / maxAbs);
  if (mode === 'neg') return mixBackground('--bad', (0.22 * Math.abs(value)) / maxAbs);
  let position = max > min ? (value - min) / (max - min) : 0.5;
  if (mode === 'low') position = 1 - position;
  if (value < 0 && mode !== 'low') return mixBackground('--bad', 0.12 + (0.18 * Math.abs(value)) / maxAbs);
  return position < 0.4
    ? mixBackground('--bad', (0.2 * (0.4 - position)) / 0.4)
    : mixBackground('--ok', (0.34 * (position - 0.4)) / 0.6);
}

function tintTables() {
  tintTable('revenue-table', { 1: 'pos' });
  tintTable('subsidies-table', { 1: 'pos' });
  tintTable('home-use-table', { 1: 'pos' });
  tintTable('costs-table', { 1: 'neg' });
  tintTable('cashflow-table', { 1: 'pos', 2: 'pos', 3: 'neg', 4: 'rank', 6: 'rank' });
  tintTable('enterprises-table', { 1: 'rank', 2: 'rank' });
  tintTable('next-steps-table', { 2: 'rank' });
  tintTable('labour-table', { 1: 'neg', 2: 'neg' });
  tintTable('calendar-table', { 2: 'low', 5: 'rank' });
}
