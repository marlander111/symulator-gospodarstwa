// Saving the settings to a .json file, loading them back, saving the financial data as JSON
// (model/finance-export.js) and saving the PDF report.
// In claude.ai files are saved through the "downloads" capability; elsewhere (e.g. GitHub
// Pages) through an ordinary browser download.

const SETTINGS_FILE_FORMAT = { app: 'symulator-gospodarstwa', version: 2 };

/** PDF report sections offered as checkboxes; see PDF_REPORT_SECTIONS. */
const PDF_SECTION_CHOICES = [
  'summary',
  'money',
  'cashflow',
  'enterprises',
  'nextSteps',
  'labour',
  'market',
  'investments',
  'rotation',
  'household',
];

/** The active way of saving files, or null when this view cannot save files. */
let fileSaver = null;

const browserDownloadSaver = {
  async save({ filename, data }) {
    // the PDF is built as a binary string: one character per byte
    const bytes =
      typeof data === 'string' && filename.endsWith('.pdf')
        ? Uint8Array.from(data, c => c.charCodeAt(0))
        : data;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([bytes]));
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      link.remove();
    }, 1000);
    return { status: 'saved' };
  },
};

async function initFileSaver() {
  if (typeof claude === 'undefined') {
    fileSaver = browserDownloadSaver;
  } else {
    try {
      fileSaver = await claude.use('downloads');
    } catch (error) {
      fileSaver = null;
    }
  }
  document.querySelectorAll('.needs-dl').forEach(element => {
    element.hidden = !fileSaver;
  });
  showExportNote(fileSaver ? '' : t('export.unavailable'));
}

const showExportNote = text => {
  byId('export-note').textContent = text;
};

/** Name of the current settings: the typed name, a matching preset, or "custom settings". */
function currentVariantName() {
  const typedName = byId('saved-variant-name')?.value.trim();
  if (typedName) return typedName;
  const preset = PRESETS.find(candidate => matchesCurrentParams(candidate.params));
  return preset ? t(`presets.${preset.id}.label`) : t('export.customSettings');
}

/** File-name friendly version of a name, e.g. "Mleko + jaja" → "mleko-jaja". */
function slugify(name) {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return slug || t('export.fallbackFileName');
}

async function saveFile(name, data, extension) {
  if (!fileSaver) return;
  showExportNote('');
  try {
    await fileSaver.save({ filename: `${name}.${extension}`, data });
    showExportNote(t('export.saved'));
  } catch (error) {
    showExportNote(t(error?.code === 'declined' ? 'export.cancelled' : 'export.failed'));
  }
}

function exportSettings() {
  const name = currentVariantName();
  const file = {
    ...SETTINGS_FILE_FORMAT,
    name,
    date: new Date().toISOString().slice(0, 10),
    settings: params,
  };
  saveFile(`${t('export.settingsFilePrefix')}-${slugify(name)}`, JSON.stringify(file, null, 1), 'json');
}

/** Loads settings from a file saved by this app (any version); unknown keys are ignored. */
function importSettings(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const { name, settings } = readSettingsFile(JSON.parse(reader.result));
      endHistoryStep();
      let loadedCount = 0;
      for (const [id, value] of Object.entries(settings)) {
        if (id in params && typeof value === typeof params[id]) {
          params[id] = value;
          loadedCount++;
        }
      }
      if (name && byId('saved-variant-name')) byId('saved-variant-name').value = name;
      syncInputs();
      onParamsChanged();
      const nameNote = name ? t('export.loadedName', { name }) : '';
      showExportNote(t('export.loaded', { count: loadedCount, name: nameNote }));
    } catch (error) {
      showExportNote(t('export.notSettingsFile'));
    }
  };
  reader.readAsText(file);
}

/** Financial results (not the settings) as JSON for a budgeting or finance app. */
function exportFinance() {
  const name = currentVariantName();
  const data = buildFinanceExport(params, name);
  saveFile(`${t('export.financeFilePrefix')}-${slugify(name)}`, JSON.stringify(data, null, 1), 'json');
}

function exportPdf() {
  saveFile(`${t('export.reportFilePrefix')}-${slugify(currentVariantName())}`, buildPdfReport(), 'pdf');
}

function buildExport() {
  const sectionCheckboxes = PDF_SECTION_CHOICES.map(
    id =>
      `<label class="sw"><input type="checkbox" data-pdf-section="${id}" checked>` +
      `<span>${t(`pdf.sections.${id}.choice`)}</span></label>`
  ).join('');

  byId('export-row').insertAdjacentHTML(
    'beforeend',
    `<button class="btn needs-dl" type="button" id="export-json">${t('export.saveSettings')}</button>
    <label class="btn" for="import-json">${t('export.loadSettings')}</label>
    <input id="import-json" type="file" accept=".json,application/json" hidden>
    <button class="btn needs-dl" type="button" id="export-finance" title="${t('export.financeTitle')}">${t('export.financeData')}</button>
    <details class="pdf-box needs-dl">
      <summary class="btn">${t('export.pdfReport')}</summary>
      <div class="pdf-pick">
        ${sectionCheckboxes}
        <button class="btn on" type="button" id="export-pdf">${t('export.savePdf')}</button>
      </div>
    </details>
    <span class="small muted" id="export-note"></span>`
  );

  byId('export-json').addEventListener('click', exportSettings);
  byId('import-json').addEventListener('change', event => {
    const file = event.target.files[0];
    if (file) importSettings(file);
    event.target.value = ''; // allow loading the same file again
  });
  byId('export-pdf').addEventListener('click', exportPdf);
  byId('export-finance').addEventListener('click', exportFinance);
  initFileSaver();
}
