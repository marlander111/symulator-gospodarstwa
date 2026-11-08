// Checks that the English texts match the Polish ones: the same keys, the same kinds of values
// and the same {placeholders}. The Polish locale is the reference.

const assert = require('node:assert/strict');
const { test } = require('node:test');
const polish = require('../src/locales/pl.json');
const english = require('../src/locales/en.json');

const PLACEHOLDER = /\{(\w+)\}/g;
const HTML_TAG = /<\/?([a-z0-9]+)/gi;

/** Flattens nested texts into { "a.b.0": "text" }. */
function flatten(node, prefix = '', into = {}) {
  if (node !== null && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) flatten(value, prefix ? `${prefix}.${key}` : key, into);
  } else {
    into[prefix] = node;
  }
  return into;
}

const sortedMatches = (text, pattern) => [...String(text).matchAll(pattern)].map(match => match[1]).sort();

const polishTexts = flatten(polish);
const englishTexts = flatten(english);

test('both locales have the same keys', () => {
  const missing = Object.keys(polishTexts).filter(key => !(key in englishTexts));
  const extra = Object.keys(englishTexts).filter(key => !(key in polishTexts));
  assert.deepEqual(missing, [], 'missing in en.json');
  assert.deepEqual(extra, [], 'only in en.json');
});

test('every text keeps its placeholders, HTML tags and type', () => {
  for (const [key, polishText] of Object.entries(polishTexts)) {
    const englishText = englishTexts[key];
    assert.equal(typeof englishText, typeof polishText, `type of ${key}`);
    assert.deepEqual(sortedMatches(englishText, PLACEHOLDER), sortedMatches(polishText, PLACEHOLDER), key);
    assert.deepEqual(sortedMatches(englishText, HTML_TAG), sortedMatches(polishText, HTML_TAG), key);
  }
});

// Polish place and source names that stay as they are in the English texts.
const PROPER_NAMES =
  /Lwówek|Śląski|ŚODR|Świętokrzyskie|Siedlęcin|Dobrzyńskie|Dobrzyń|Poznań|Nagórze|Kraków|Wieści|Przedsiębiorcy|Polski|Bolesławiec|Góra|Wrocław|Złotnicka|Puławska/g;
const LINK_ADDRESS = /href="[^"]*"/g;
const POLISH_LETTER = /[ąćęłńóśźż]/i;

test('the English texts are translated, apart from names and links', () => {
  const untranslated = Object.entries(englishTexts)
    .filter(([, text]) => typeof text === 'string')
    .filter(([, text]) => POLISH_LETTER.test(text.replace(LINK_ADDRESS, '').replace(PROPER_NAMES, '')))
    .map(([key]) => key);
  assert.deepEqual(untranslated, []);
});

test('plural forms exist for both languages', () => {
  for (const category of ['one', 'other']) assert.ok(english.plurals.years[category]);
  for (const category of ['one', 'few', 'many', 'other']) assert.ok(polish.plurals.years[category]);
  assert.equal(english.format.numberLocale, 'en-GB');
  assert.equal(polish.format.numberLocale, 'pl-PL');
});
