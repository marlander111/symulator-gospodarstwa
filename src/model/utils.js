// Small numeric helpers shared by the model and the interface.

/** Sum of all values of an object. */
function sumValues(object) {
  return Object.values(object).reduce((sum, value) => sum + value, 0);
}

/** Sum of `select(item)` over a list. */
function sumBy(items, select) {
  return items.reduce((sum, item) => sum + select(item), 0);
}

/** Formats a number for the interface language (Polish: "12 300,5", English: "12,300.5"). */
function formatNumber(value, decimals = 0) {
  if (!isFinite(value)) return '–';
  const roundsToZero = Math.abs(value) < 0.5 / 10 ** decimals;
  return (roundsToZero ? 0 : value).toLocaleString(t('format.numberLocale'), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Average number of weeks in a month, used to turn monthly hours into hours per week. */
const WEEKS_PER_MONTH = 4.33;
