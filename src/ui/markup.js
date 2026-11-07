// Helpers that build HTML and SVG markup strings, so the panels describe elements as data
// instead of long template strings.

/**
 * Markup of one element; attributes that are null, undefined or false are left out.
 * @param {string} name - tag name, e.g. "rect"
 * @param {object} [attributes] - e.g. { x: 10, y: 20, fill: 'var(--ok)' }
 * @param {string} [content] - inner markup, already escaped
 * @returns {string}
 */
function element(name, attributes = {}, content = '') {
  return `<${name}${attributesText(attributes)}>${content}</${name}>`;
}

/** Markup of an element without content or closing tag, e.g. <input>. */
function voidElement(name, attributes = {}) {
  return `<${name}${attributesText(attributes)}>`;
}

function attributesText(attributes) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== null && value !== undefined && value !== false)
    .map(([attribute, value]) => ` ${attribute}="${value}"`)
    .join('');
}

/**
 * Header row of a table.
 * @param {string[]} labels
 * @param {(index: number) => boolean} [isNumeric] - right-aligned columns; by default all but the first
 */
function tableHeader(labels, isNumeric = index => index > 0) {
  const cells = labels.map((label, index) => element('th', { class: isNumeric(index) ? 'n' : null }, label));
  return `<thead><tr>${cells.join('')}</tr></thead>`;
}

/** A right-aligned number cell, red when `isNegative`. */
const numberCell = (content, isNegative = false) =>
  element('td', { class: isNegative ? 'n neg' : 'n' }, content);

/** A table cell; attributes are optional, e.g. { class: 'n' }. */
const cell = (content, attributes = {}) => element('td', attributes, content);

/** A table row built from cell markup. */
const tableRow = (cells, attributes = {}) => element('tr', attributes, cells.join(''));

/** A table body built from row markup. */
const tableBody = rows => element('tbody', {}, rows.join(''));
