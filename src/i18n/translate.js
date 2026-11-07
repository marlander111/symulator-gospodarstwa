// User-facing texts. All content lives in locales/<language>.json; the code refers to it by key.
//
// The build embeds every locale in the page as <script type="application/json" id="locale-pl">
// (and the default one as LOCALE_MESSAGES for Node), so the app also works when opened from disk.
// The language comes from the address (?lang=en), then from this browser's memory, then the default.

const LANGUAGES = ['pl', 'en'];
const DEFAULT_LANGUAGE = LANGUAGES[0];
const LANGUAGE_STORAGE_KEY = 'gosp-jezyk';
const LANGUAGE_URL_PARAMETER = 'lang';

const CURRENT_LANGUAGE = chooseLanguage();
const MESSAGES = loadMessages(CURRENT_LANGUAGE);

function chooseLanguage() {
  if (typeof LOCALE_MESSAGES !== 'undefined' || typeof document === 'undefined') return DEFAULT_LANGUAGE;
  const fromAddress = new URLSearchParams(location.search).get(LANGUAGE_URL_PARAMETER);
  if (LANGUAGES.includes(fromAddress)) return fromAddress;
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (LANGUAGES.includes(saved)) return saved;
  } catch (error) {
    // storage unavailable: use the default language
  }
  return DEFAULT_LANGUAGE;
}

function loadMessages(language) {
  if (typeof LOCALE_MESSAGES !== 'undefined') return LOCALE_MESSAGES;
  const element =
    document.getElementById(`locale-${language}`) || document.getElementById(`locale-${DEFAULT_LANGUAGE}`);
  if (!element) throw new Error('Locale data is missing: build the page with build.py');
  document.documentElement.lang = language;
  return JSON.parse(element.textContent);
}

/** The language the interface is shown in, e.g. "pl". */
function currentLanguage() {
  return CURRENT_LANGUAGE;
}

function lookupMessage(key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), MESSAGES);
}

/** Returns true when the locale has a message (of any type) under the key. */
function hasMessage(key) {
  return lookupMessage(key) !== undefined;
}

/**
 * Returns the text for a key with `{name}` placeholders filled in.
 * @param {string} key - dot-separated path in the locale, e.g. "kpi.netIncome"
 * @param {object} [values] - placeholder values
 * @returns {string}
 */
function t(key, values) {
  const message = lookupMessage(key);
  if (typeof message !== 'string') {
    console.warn(`Missing text: ${key}`);
    return key;
  }
  if (!values) return message;
  return message.replace(/\{(\w+)\}/g, (placeholder, name) => (name in values ? values[name] : placeholder));
}

/**
 * Returns the plural form matching `count` (Polish: one, few, many, other; English: one, other).
 * @param {string} key - group of forms in the locale, e.g. "plurals.years"
 * @param {number} count
 */
function tPlural(key, count, values) {
  const category = new Intl.PluralRules(t('format.numberLocale')).select(count);
  return t(`${key}.${category}`, values);
}

/**
 * Returns a list or a group of texts (e.g. month names) as stored in the locale.
 * @param {string} key
 * @returns {Array|object}
 */
function messages(key) {
  const message = lookupMessage(key);
  if (message === undefined) throw new Error(`Missing texts: ${key}`);
  return message;
}

/**
 * Fills static markup from the locale:
 *   data-i18n="key"           → text content
 *   data-i18n-html="key"      → inner HTML (for texts with links or emphasis)
 *   data-i18n-attr="title:key; aria-label:key2" → attributes
 * @param {ParentNode} root
 */
function applyTranslations(root) {
  root.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-html]').forEach(element => {
    element.innerHTML = t(element.dataset.i18nHtml);
  });
  root.querySelectorAll('[data-i18n-attr]').forEach(element => {
    for (const pair of element.dataset.i18nAttr.split(';')) {
      const [attribute, key] = pair.split(':').map(part => part.trim());
      if (attribute && key) element.setAttribute(attribute, t(key));
    }
  });
}
