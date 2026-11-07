// Application state and small helpers shared by all panels.

/** Browser storage key of the current settings (kept from the first version of the app). */
const STORAGE_KEY = 'gosp-lwowek-v1';

/** Current values of all parameters; every change re-renders the page. */
let params = loadSavedParams();

function loadSavedParams() {
  let saved = null;
  let savedDefaultsVersion = 1;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (stored) saved = migrateLegacyParameterIds(stored);
    savedDefaultsVersion = +(localStorage.getItem(DEFAULTS_VERSION_STORAGE_KEY) || 1);
  } catch (error) {
    // storage unavailable (private window, preview): start like a first visit
  }

  const known = defaultParams();
  const loaded = startupParams(saved, savedDefaultsVersion);
  for (const id in loaded) if (!(id in known)) delete loaded[id];
  rememberDefaultsVersion();
  return loaded;
}

function saveParams() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch (error) {
    // nothing to do: settings simply are not remembered
  }
}

const byId = id => document.getElementById(id);

/** Amount in PLN rounded to hundreds, e.g. "12 300 zł". */
const formatPln = amount => t('format.pln', { amount: formatNumber(Math.round(amount / 100) * 100, 0) });

/** Amount in PLN rounded to whole złoty. */
const formatPlnExact = amount => t('format.pln', { amount: formatNumber(amount, 0) });

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escapeHtml = text => String(text).replace(/[&<>"]/g, character => HTML_ESCAPES[character]);

/** Number of decimals of a slider step, e.g. 0.25 → 2. */
function decimalPlaces(step) {
  const text = String(step);
  return text.includes('.') ? text.split('.')[1].length : 0;
}

const parameterText = (parameter, field) => {
  const key = `parameters.${parameter.id}.${field}`;
  return hasMessage(key) ? t(key) : '';
};
const parameterLabel = parameter => parameterText(parameter, 'label');
const parameterUnit = parameter => parameterText(parameter, 'unit');
const parameterHint = parameter => parameterText(parameter, 'hint');

/** Slider value with its unit, e.g. "3 700 l/rok"; empty for switches. */
function formatParameterValue(parameter, value) {
  if (parameter.type === 'boolean') return '';
  const unit = parameterUnit(parameter);
  return formatNumber(value, decimalPlaces(parameter.step)) + (unit ? ' ' + unit : '');
}
