// Zapis i wczytanie ustawień z pliku (.json), zapis raportu PDF.

// ---------- Zapis i wczytanie ustawień ----------
let dl = null;
// Poza claude.ai (np. GitHub Pages) zapis idzie zwykłym pobraniem pliku przez przeglądarkę
const nativeDl = {
  save: async ({ filename, data }) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([
        typeof data === 'string' && filename.endsWith('.pdf')
          ? Uint8Array.from(data, c => c.charCodeAt(0))
          : data,
      ])
    );
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
    return { status: 'saved' };
  },
};
async function initDownloads() {
  if (typeof claude === 'undefined') dl = nativeDl;
  else {
    try {
      dl = await claude.use('downloads');
    } catch (e) {
      dl = null;
    }
  }
  document.querySelectorAll('.needs-dl').forEach(b => {
    b.hidden = !dl;
  });
  $('exp-note').textContent = dl
    ? ''
    : 'Zapis plików nie jest dostępny w tym widoku (otwórz aplikację w claude.ai).';
}
function variantName() {
  const nm = ($('mine-name') && $('mine-name').value.trim()) || '';
  if (nm) return nm;
  const pr = PRESETS.find(x => matches(x.set));
  return pr ? pr.l : 'Własne ustawienia';
}
const slug = s =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'wariant';
async function saveFile(name, data, ext) {
  if (!dl) return;
  $('exp-note').textContent = '';
  try {
    await dl.save({ filename: `${name}.${ext}`, data });
    $('exp-note').textContent = 'Plik zapisany.';
  } catch (e) {
    $('exp-note').textContent =
      e && e.code === 'declined' ? 'Zapis anulowany.' : 'Nie udało się zapisać pliku.';
  }
}
function exportJson() {
  const nm = variantName();
  saveFile(
    `symulator-${slug(nm)}`,
    JSON.stringify(
      {
        app: 'symulator-gospodarstwa',
        wersja: 1,
        nazwa: nm,
        data: new Date().toISOString().slice(0, 10),
        ustawienia: p,
      },
      null,
      1
    ),
    'json'
  );
}
function importJson(file) {
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const o = JSON.parse(fr.result),
        s = o.ustawienia || o;
      let n = 0;
      for (const k in s)
        if (k in p && typeof s[k] === typeof p[k]) {
          p[k] = s[k];
          n++;
        }
      if (o.nazwa && $('mine-name')) $('mine-name').value = o.nazwa;
      syncInputs();
      changed();
      $('exp-note').textContent = `Wczytano ${n} ustawień${o.nazwa ? ` („${o.nazwa}”)` : ''}.`;
    } catch (e) {
      $('exp-note').textContent = 'To nie jest plik z ustawieniami symulatora.';
    }
  };
  fr.readAsText(file);
}

function exportPdf() {
  saveFile(`raport-${slug(variantName())}`, makePdf(), 'pdf');
}

function buildExport() {
  const SECT = [
    ['kpi', 'Podsumowanie'],
    ['money', 'Pieniądze'],
    ['cf', 'Przepływy gotówki'],
    ['kier', 'Kierunki'],
    ['next', 'Co dalej'],
    ['lab', 'Czas pracy'],
    ['rynek', 'Co sprzedać'],
    ['inv', 'Inwestycje'],
    ['rot', 'Płodozmian'],
    ['dom', 'Budżet domu'],
  ];
  $('row-exp').insertAdjacentHTML(
    'beforeend',
    `
    <button class="btn needs-dl" type="button" id="exp-json">Zapisz ustawienia do pliku</button>
    <label class="btn" for="imp-json">Wczytaj z pliku</label><input id="imp-json" type="file" accept=".json,application/json" hidden>
    <details class="pdf-box needs-dl"><summary class="btn">Raport PDF</summary><div class="pdf-pick">${SECT.map(([k, l]) => `<label class="sw"><input type="checkbox" data-pdf="${k}" checked><span>${l}</span></label>`).join('')}<button class="btn on" type="button" id="exp-pdf">Zapisz PDF</button></div></details>
    <span class="small muted" id="exp-note"></span>`
  );
  $('exp-json').addEventListener('click', exportJson);
  $('imp-json').addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) importJson(f);
    e.target.value = '';
  });
  $('exp-pdf').addEventListener('click', exportPdf);
  initDownloads();
}
