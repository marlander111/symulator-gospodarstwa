// A minimal PDF writer: A4 pages with text, lines, rectangles, tables and bar charts in the
// standard PDF fonts, so the report needs no external library. Polish letters are mapped
// into the Windows-1250 positions of a custom WinAnsi encoding.

const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;
const PDF_MARGIN = 40;
const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - 2 * PDF_MARGIN;

/** Font resource names; see `serialize()` for the fonts behind them. */
const PDF_FONTS = { regular: 'F1', bold: 'F2', mono: 'F3', monoBold: 'F4' };

/** RGB fill and stroke colours used in the report. */
const PDF_COLORS = {
  text: '0 0 0',
  dark: '0.2 0.2 0.2',
  body: '0.25 0.25 0.25',
  paragraph: '0.3 0.3 0.3',
  muted: '0.35 0.35 0.35',
  faint: '0.45 0.45 0.45',
  footer: '0.5 0.5 0.5',
  title: '0.1 0.25 0.12',
  heading: '0.1 0.3 0.15',
  accent: '0.17 0.42 0.23',
  negative: '0.7 0.2 0.15',
  note: '0.45 0.3 0.1',
  rule: '0.8 0.8 0.8',
  lightRule: '0.88 0.88 0.88',
  faintRule: '0.9 0.9 0.9',
  axis: '0.5 0.5 0.5',
};

/** Byte codes of characters outside ASCII in the report's font encoding. */
// prettier-ignore
const PDF_CHARACTER_CODES = {
  ą: 200, ć: 201, ę: 202, ł: 203, ń: 204, ś: 205, ź: 206, ż: 207,
  Ą: 192, Ć: 193, Ę: 194, Ł: 195, Ń: 196, Ś: 197, Ź: 198, Ż: 199,
  ó: 243, Ó: 211, é: 233, ü: 252, ö: 246, ä: 228,
  '–': 150, '—': 151, '·': 183, '×': 215, '„': 132, '”': 148, '“': 147,
  '…': 133, '’': 146, '‘': 145, '²': 178, '±': 177,
};

/** Glyph names of codes 192–207, which are remapped to Polish letters. */
const PDF_ENCODING_DIFFERENCES =
  '/Aogonek /Cacute /Eogonek /Lslash /Nacute /Sacute /Zacute /Zdotaccent ' +
  '/aogonek /cacute /eogonek /lslash /nacute /sacute /zacute /zdotaccent';

const NO_BREAK_SPACE = ' ';
const MINUS_SIGN = '−';

/** Encodes text as the contents of a PDF string literal `( … )`. */
function encodePdfText(text) {
  let encoded = '';
  for (const character of String(text)) {
    let code;
    if (character === ' ' || character === NO_BREAK_SPACE) code = 32;
    else if (character === MINUS_SIGN) code = 45;
    else code = PDF_CHARACTER_CODES[character] ?? character.charCodeAt(0);
    if (code > 255) code = 63; // "?"

    const needsBackslash = code === 40 || code === 41 || code === 92; // ( ) \
    if (needsBackslash) encoded += '\\' + character;
    else if (code < 32 || code > 126) encoded += '\\' + code.toString(8).padStart(3, '0');
    else encoded += String.fromCharCode(code);
  }
  return encoded;
}

const pdfCoordinate = value => value.toFixed(1);

class PdfDocument {
  constructor() {
    /** Content-stream operators of each page. */
    this.pages = [];
    this.currentPage = null;
    /** Vertical position of the next element; PDF measures from the bottom of the page. */
    this.y = 0;
  }

  addPage() {
    this.currentPage = [];
    this.pages.push(this.currentPage);
    this.y = PDF_PAGE_HEIGHT - PDF_MARGIN;
  }

  /** Starts a new page unless `height` still fits above the bottom margin. */
  ensureSpace(height) {
    if (!this.currentPage || this.y - height < PDF_MARGIN + 16) this.addPage();
  }

  text(x, y, text, size = 9, font = PDF_FONTS.regular, color = PDF_COLORS.text) {
    const position = `${pdfCoordinate(x)} ${pdfCoordinate(y)}`;
    this.currentPage.push(`BT ${color} rg /${font} ${size} Tf ${position} Td (${encodePdfText(text)}) Tj ET`);
  }

  /** Text ending at `right`; widths are estimated for the monospaced font. */
  textRightAligned(right, y, text, size = 9, font = PDF_FONTS.mono, color = PDF_COLORS.text) {
    this.text(right - String(text).length * 0.6 * size, y, text, size, font, color);
  }

  rect(x, y, width, height, color) {
    const box = [x, y, width, height].map(pdfCoordinate).join(' ');
    this.currentPage.push(`${color} rg ${box} re f`);
  }

  line(x1, y1, x2, y2, color = PDF_COLORS.rule, width = 0.5) {
    const from = `${pdfCoordinate(x1)} ${pdfCoordinate(y1)}`;
    const to = `${pdfCoordinate(x2)} ${pdfCoordinate(y2)}`;
    this.currentPage.push(`${color} RG ${width} w ${from} m ${to} l S`);
  }

  /** Splits text into lines that fit `width`, estimating half the font size per character. */
  static wrapText(text, size, width) {
    const lines = [];
    let line = '';
    for (const word of String(text).split(/\s+/)) {
      const candidate = (line + ' ' + word).trim();
      if (candidate.length * 0.5 * size > width && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  paragraph(text, size = 8.5, color = PDF_COLORS.paragraph) {
    for (const line of PdfDocument.wrapText(text, size, PDF_CONTENT_WIDTH)) {
      this.ensureSpace(size + 3);
      this.text(PDF_MARGIN, this.y - size, line, size, PDF_FONTS.regular, color);
      this.y -= size + 3;
    }
    this.y -= 4;
  }

  heading(text) {
    this.ensureSpace(40);
    this.y -= 10;
    this.text(PDF_MARGIN, this.y - 13, text, 13, PDF_FONTS.bold, PDF_COLORS.heading);
    this.y -= 20;
    this.line(PDF_MARGIN, this.y, PDF_PAGE_WIDTH - PDF_MARGIN, this.y, PDF_COLORS.accent, 1);
    this.y -= 6;
  }

  /** Rows of a label on the left and a value on the right. */
  keyValueRows(rows) {
    for (const [label, value] of rows) {
      this.ensureSpace(14);
      this.text(PDF_MARGIN, this.y - 10, label, 9.5, PDF_FONTS.regular, PDF_COLORS.body);
      this.textRightAligned(PDF_PAGE_WIDTH - PDF_MARGIN, this.y - 10, value, 9.5, PDF_FONTS.monoBold);
      this.y -= 14;
      this.line(PDF_MARGIN, this.y + 1, PDF_PAGE_WIDTH - PDF_MARGIN, this.y + 1, PDF_COLORS.faintRule, 0.4);
    }
    this.y -= 6;
  }

  /**
   * A bar per value with a label under it; negative values go below the axis in red.
   * @param {number[]} values
   * @param {string[]} labels
   * @param {string} title
   */
  barChart(values, labels, title, positiveColor = PDF_COLORS.accent) {
    const chartHeight = 90;
    this.ensureSpace(chartHeight + 30);
    this.text(PDF_MARGIN, this.y - 9, title, 8, PDF_FONTS.regular, PDF_COLORS.muted);
    this.y -= 14;

    const highest = Math.max(1, ...values.map(Math.abs));
    const lowest = Math.min(0, ...values);
    const span = highest - Math.min(0, lowest) || 1;
    const columnWidth = PDF_CONTENT_WIDTH / values.length;
    const axisY = this.y - chartHeight + (-lowest / span) * chartHeight;

    values.forEach((value, index) => {
      const barHeight = (Math.abs(value) / span) * chartHeight;
      const left = PDF_MARGIN + index * columnWidth;
      this.rect(
        left + columnWidth * 0.18,
        value >= 0 ? axisY : axisY - barHeight,
        columnWidth * 0.64,
        Math.max(0.5, barHeight),
        value >= 0 ? positiveColor : PDF_COLORS.negative
      );
      const labelX = left + columnWidth / 2 - labels[index].length * 2;
      this.text(labelX, this.y - chartHeight - 10, labels[index], 7, PDF_FONTS.regular, PDF_COLORS.muted);
    });

    this.line(PDF_MARGIN, axisY, PDF_PAGE_WIDTH - PDF_MARGIN, axisY, PDF_COLORS.axis, 0.5);
    this.y -= chartHeight + 20;
  }

  /**
   * A table: the first column left-aligned, the others right-aligned (or left-aligned notes).
   * @param {{header: string[], rows: {isTotal: boolean, cells: string[]}[]}} table
   * @param {{skipColumns?: number[], firstColumnWidth?: number, leftAlignedColumns?: number[]}} [options]
   */
  table({ header, rows }, options = {}) {
    const columnCount = Math.max(header.length, ...rows.map(row => row.cells.length));
    if (!columnCount) return;

    const skipColumns = options.skipColumns || [];
    const leftAligned = options.leftAlignedColumns || [];
    const columns = [...Array(columnCount).keys()].filter(index => !skipColumns.includes(index));
    const firstWidth =
      options.firstColumnWidth || (columns.length <= 2 ? 300 : columns.length <= 4 ? 200 : 140);
    const columnWidth = (PDF_CONTENT_WIDTH - firstWidth) / (columns.length - 1 || 1);
    const columnRight = index => PDF_MARGIN + firstWidth + columnWidth * columns.indexOf(index);
    const fontSize = columns.length > 7 ? 7.2 : 8.3;

    this.ensureSpace(30);
    columns.forEach((index, position) => {
      const title = (header[index] || '').toUpperCase();
      const y = this.y - 9;
      const style = [6.8, PDF_FONTS.bold, PDF_COLORS.muted];
      if (position === 0) this.text(PDF_MARGIN, y, title.slice(0, 40), ...style);
      else if (leftAligned.includes(index))
        this.text(
          columnRight(index) - columnWidth + 6,
          y,
          title.slice(0, Math.floor(columnWidth / 4.6)),
          ...style
        );
      else
        this.textRightAligned(
          columnRight(index),
          y,
          title.slice(0, Math.floor((columnWidth - 6) / 4.2)),
          ...style
        );
    });
    this.y -= 13;
    this.line(PDF_MARGIN, this.y, PDF_PAGE_WIDTH - PDF_MARGIN, this.y);

    for (const row of rows) {
      this.ensureSpace(fontSize + 6);
      const y = this.y - fontSize - 1.5;
      columns.forEach((index, position) => {
        const cell = row.cells[index] || '';
        if (position === 0) {
          const font = row.isTotal ? PDF_FONTS.bold : PDF_FONTS.regular;
          this.text(PDF_MARGIN, y, cell.slice(0, Math.floor(firstWidth / (0.5 * fontSize))), fontSize, font);
        } else if (leftAligned.includes(index)) {
          const text = cell.slice(0, Math.floor((columnWidth - 6) / (0.5 * fontSize)));
          this.text(
            columnRight(index) - columnWidth + 6,
            y,
            text,
            fontSize - 0.8,
            PDF_FONTS.regular,
            PDF_COLORS.note
          );
        } else {
          const font = row.isTotal ? PDF_FONTS.monoBold : PDF_FONTS.mono;
          const text = cell.slice(0, Math.floor((columnWidth - 4) / (0.6 * fontSize)));
          this.textRightAligned(columnRight(index), y, text, fontSize, font);
        }
      });
      this.y -= fontSize + 5;
      if (row.isTotal)
        this.line(PDF_MARGIN, this.y, PDF_PAGE_WIDTH - PDF_MARGIN, this.y, PDF_COLORS.dark, 0.8);
      else this.line(PDF_MARGIN, this.y, PDF_PAGE_WIDTH - PDF_MARGIN, this.y, PDF_COLORS.lightRule, 0.4);
    }
    this.y -= 8;
  }

  /**
   * Returns the finished file as a binary string (one character per byte).
   * @param {(pageNumber: number, pageCount: number) => string} footerText
   */
  serialize(footerText) {
    const objects = [];
    const addObject = body => {
      objects.push(body);
      return objects.length;
    };

    const encoding = addObject(
      `<< /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences [192 ${PDF_ENCODING_DIFFERENCES}] >>`
    );
    const fonts = ['Helvetica', 'Helvetica-Bold', 'Courier', 'Courier-Bold'].map(baseFont =>
      addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /${baseFont} /Encoding ${encoding} 0 R >>`)
    );
    const fontResources = Object.values(PDF_FONTS)
      .map((name, index) => `/${name} ${fonts[index]} 0 R`)
      .join(' ');

    const pagesObject = addObject(null); // filled in once the page objects exist
    const pageObjects = this.pages.map((operators, index) => {
      const footer = encodePdfText(footerText(index + 1, this.pages.length));
      const stream = [
        ...operators,
        `BT ${PDF_COLORS.footer} rg /F1 7 Tf ${PDF_MARGIN} 22 Td (${footer}) Tj ET`,
      ].join('\n');
      const contents = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
      return addObject(
        `<< /Type /Page /Parent ${pagesObject} 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] ` +
          `/Resources << /Font << ${fontResources} >> >> /Contents ${contents} 0 R >>`
      );
    });
    const kids = pageObjects.map(object => `${object} 0 R`).join(' ');
    objects[pagesObject - 1] = `<< /Type /Pages /Kids [${kids}] /Count ${pageObjects.length} >>`;
    const catalog = addObject(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`);

    let file = '%PDF-1.4\n';
    const offsets = objects.map((body, index) => {
      const offset = file.length;
      file += `${index + 1} 0 obj\n${body}\nendobj\n`;
      return offset;
    });
    const crossReferenceOffset = file.length;
    file += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    file += offsets.map(offset => String(offset).padStart(10, '0') + ' 00000 n \n').join('');
    file += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\n`;
    file += `startxref\n${crossReferenceOffset}\n%%EOF\n`;
    return file;
  }
}
