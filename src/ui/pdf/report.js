// The PDF report: the chosen sections of the current variant, read from the model results
// and from the tables already shown on the page. Texts: locales/pl.json → pdf.

/** Sections the user can include; `draw` adds the section's content under its heading. */
const PDF_REPORT_SECTIONS = [
  { id: 'summary', draw: drawSummarySection },
  { id: 'money', draw: drawMoneySection },
  { id: 'cashflow', draw: drawCashflowSection },
  { id: 'enterprises', draw: doc => doc.table(readTable('enterprises-table'), { skipColumns: [7, 8, 9] }) },
  { id: 'nextSteps', draw: drawNextStepsSection },
  { id: 'labour', draw: drawLabourSection },
  { id: 'market', draw: drawMarketSection },
  { id: 'investments', draw: doc => doc.table(readTable('investments-table')) },
  { id: 'rotation', draw: drawRotationSection },
  { id: 'household', draw: drawHouseholdSection },
];

/** Animals listed in the report's introduction, with the number kept of each. */
const PDF_ANIMAL_COUNTS = [
  ['dairyCows', params => params.dairyCows],
  ['sucklerCows', params => params.sucklerCows],
  ['layingHens', params => params.layingHens],
  ['broilers', params => params.broilers],
  ['geese', params => params.geese],
  ['ducks', params => params.ducks],
  ['turkeys', params => params.turkeys],
  ['guineaFowl', params => params.guineaFowl],
  ['sheep', params => params.sheep],
  ['goats', params => params.goats],
  ['pigs', params => params.pigsForHome + params.pigsForSale],
  ['horses', params => params.horses],
  ['rabbits', params => params.rabbits],
  ['beehives', params => params.beehives],
];

const isPdfSectionSelected = id => {
  const checkbox = document.querySelector(`[data-pdf-section="${id}"]`);
  return !checkbox || checkbox.checked;
};

/** @returns {string} the PDF file as a binary string */
function buildPdfReport() {
  const results = simulateFarm(params);
  const pessimistic = simulateFarm(applyPessimisticScenario(params));
  const doc = new PdfDocument();
  doc.addPage();

  drawReportIntroduction(doc, results);
  for (const section of PDF_REPORT_SECTIONS) {
    if (!isPdfSectionSelected(section.id)) continue;
    doc.heading(t(`pdf.sections.${section.id}.title`));
    section.draw(doc, results, pessimistic);
  }
  doc.paragraph(t('pdf.disclaimer'), 7.5, PDF_COLORS.faint);

  const variant = currentVariantName();
  return doc.serialize((page, pages) => t('pdf.footer', { variant, page, pages }));
}

function drawReportIntroduction(doc, results) {
  doc.text(PDF_MARGIN, doc.y - 20, t('app.title'), 20, PDF_FONTS.bold, PDF_COLORS.title);
  doc.y -= 30;
  doc.text(PDF_MARGIN, doc.y - 12, t('pdf.variant', { name: currentVariantName() }), 12, PDF_FONTS.bold);
  doc.y -= 18;

  const subtitle = t('pdf.subtitle', {
    date: new Date().toLocaleDateString(t('format.numberLocale')),
    farmedHa: formatNumber(results.farmedHa, 1),
    ownedHa: formatNumber(params.ownedHa, 0),
    leased: params.leasedHa ? t('pdf.leased', { leasedHa: formatNumber(params.leasedHa, 1) }) : '',
  });
  doc.text(PDF_MARGIN, doc.y - 9, subtitle, 8.5, PDF_FONTS.regular, PDF_COLORS.muted);
  doc.y -= 18;

  const animals = PDF_ANIMAL_COUNTS.map(([id, countOf]) => [id, countOf(params)])
    .filter(([, count]) => count)
    .map(([id, count]) => t(`pdf.animals.${id}`, { count }))
    .join(', ');
  const introduction = t('pdf.animalsAndCrops', {
    animals,
    pastureHa: formatNumber(params.pastureHa, 1),
    meadowHa: formatNumber(params.meadowHa, 1),
    arableHa: formatNumber(results.usableArableHa, 1),
    cerealShare: params.cerealShare,
  });
  doc.paragraph(introduction, 8.5, PDF_COLORS.dark);
}

function drawSummarySection(doc, results, pessimistic) {
  const n = formatNumber;
  const row = (id, value) => [t(`pdf.summary.${id}`), value];
  doc.keyValueRows([
    row('netIncome', formatPln(results.netIncome)),
    row('monthlyAverage', formatPln(results.netIncome / 12)),
    row('revenue', formatPln(results.revenue + results.subsidies)),
    row('subsidies', formatPln(results.subsidies)),
    row('costs', formatPln(results.costs + results.depreciation)),
    row('pessimistic', formatPln(pessimistic.netIncome)),
    row(
      'hours',
      t('pdf.summary.hoursValue', { hours: n(results.totalHours, 0), perWeek: n(results.totalHours / 52, 0) })
    ),
    row(
      'peakMonth',
      t('pdf.summary.peakMonthValue', {
        peak: n(pessimistic.weeklyHoursPeak, 0),
        limit: n(params.weeklyHoursLimit, 0),
      })
    ),
    row(
      'investments',
      t('pdf.summary.investmentsValue', {
        capex: formatPln(results.capex),
        depreciation: formatPln(results.depreciation),
      })
    ),
    row(
      'feed',
      t('pdf.summary.feedValue', {
        hay: n(results.hayBalance, 1),
        grain: n(results.grainBalance, 1),
        straw: n(results.strawBalance, 1),
      })
    ),
    row('stocking', t('pdf.summary.stockingValue', { value: n(results.livestockUnitsPerHa, 2) })),
  ]);
}

function drawMoneySection(doc) {
  for (const id of ['revenue-table', 'costs-table', 'subsidies-table', 'home-use-table'])
    doc.table(readTable(id));
}

function drawCashflowSection(doc, results) {
  const monthResults = results.cashflow.months.map(month => month.netIncome - month.household);
  doc.barChart(monthResults, messages('months.numerals'), t('pdf.cashflowChart'));
  doc.table(readTable('cashflow-table'));
  doc.paragraph(byId('cashflow-note').textContent);
}

function drawNextStepsSection(doc) {
  doc.table(readTable('next-steps-table'), {
    skipColumns: [4, 7],
    firstColumnWidth: 120,
    leftAlignedColumns: [6],
  });
  doc.paragraph(byId('next-steps-note').textContent);
}

function drawLabourSection(doc, results) {
  const hours = results.monthlyHours.map(month => month.total);
  doc.barChart(hours, messages('months.numerals'), t('pdf.labourChart'), '0.55 0.45 0.2');
  doc.table(readTable('labour-table'));
}

function drawMarketSection(doc) {
  const cards = [...document.querySelectorAll('#market .card')];
  doc.keyValueRows(
    cards.map(card => [card.querySelector('.k').textContent, card.querySelector('.v').textContent])
  );
}

function drawRotationSection(doc) {
  doc.table(readTable('rotation-table'), { firstColumnWidth: 70 });
  doc.paragraph(byId('rotation-note').textContent);
}

function drawHouseholdSection(doc) {
  doc.table(readTable('household-table'), { skipColumns: [2] });
  doc.paragraph(byId('household-note').textContent);
}

/**
 * Reads a table of the page: header texts and, for each row, the first line of every cell
 * (an editable amount is read from its input).
 */
function readTable(elementId) {
  const table = byId(elementId);
  if (!table) return { header: [], rows: [] };
  const cellText = cell => {
    const input = cell.querySelector('input');
    const text = input ? t('format.pln', { amount: input.value }) : cell.innerText;
    return text.split('\n')[0].trim();
  };
  return {
    header: [...table.querySelectorAll('thead th')].map(cell => cell.textContent.trim()),
    rows: [...table.querySelectorAll('tbody tr')].map(row => ({
      isTotal: row.classList.contains('tot'),
      cells: [...row.cells].map(cellText),
    })),
  };
}
