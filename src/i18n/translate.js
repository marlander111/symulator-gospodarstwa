// User-facing texts. All Polish content lives in locales/pl.json; the code refers to it by key.
//
// The build embeds the JSON file in the page as <script type="application/json" id="locale-pl">
// (and as LOCALE_MESSAGES for Node), so the app also works when opened straight from disk.

const MESSAGES = loadMessages();

function loadMessages() {
  if (typeof LOCALE_MESSAGES !== 'undefined') return LOCALE_MESSAGES;
  const element = typeof document !== 'undefined' && document.getElementById('locale-pl');
  if (!element) throw new Error('Locale data is missing: build the page with build.py');
  return JSON.parse(element.textContent);
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
 * Returns the plural form matching `count` (Polish: one, few, many, other), e.g. 1 rok, 2 lata, 5 lat.
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
