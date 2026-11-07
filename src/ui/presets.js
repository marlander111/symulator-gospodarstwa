// Gotowe warianty i „Moje warianty” zapisane w przeglądarce.

// ---------- Warianty ----------
function buildPresets() {
  $('row-var').insertAdjacentHTML(
    'beforeend',
    PRESETS.map(
      v =>
        `<button class="btn" type="button" data-var="${v.id}">${esc(v.l)} <small>${esc(v.note)}</small></button>`
    ).join('')
  );
  $('row-ass').insertAdjacentHTML(
    'beforeend',
    ASSUME.map(a => `<button class="btn" type="button" data-ass="${a.id}">${esc(a.l)}</button>`).join('') +
      `<button class="btn ghost" type="button" id="view-g" aria-pressed="false">Pokaż wszystko w wariancie pesymistycznym</button>`
  );
  $('view-g').addEventListener('click', () => {
    viewG = !viewG;
    $('view-g').setAttribute('aria-pressed', viewG);
    $('view-g').classList.toggle('on', viewG);
    render();
  });
  document.querySelectorAll('[data-var]').forEach(b =>
    b.addEventListener('click', () => {
      Object.assign(p, PRESETS.find(v => v.id === b.dataset.var).set);
      syncInputs();
      changed();
    })
  );
  document.querySelectorAll('[data-ass]').forEach(b =>
    b.addEventListener('click', () => {
      Object.assign(p, ASSUME.find(a => a.id === b.dataset.ass).set);
      syncInputs();
      changed();
    })
  );
}
// ---------- Moje warianty (localStorage) ----------
const LSV = 'gosp-lwowek-moje-v1';
let mine = [];
try {
  mine = JSON.parse(localStorage.getItem(LSV) || '[]') || [];
} catch (e) {
  mine = [];
}
function saveMine() {
  try {
    localStorage.setItem(LSV, JSON.stringify(mine));
    return true;
  } catch (e) {
    return false;
  }
}
function renderMine() {
  $('mine-list').innerHTML = mine
    .map(
      (m, i) =>
        `<button class="btn" type="button" data-mine="${i}">${esc(m.name)}<span class="x" data-del="${i}" role="button" aria-label="Usuń ${esc(m.name)}" title="Usuń">×</span></button>`
    )
    .join('');
  document.querySelectorAll('[data-mine]').forEach(b =>
    b.addEventListener('click', e => {
      const del = e.target.closest('[data-del]');
      const i = +b.dataset.mine;
      if (del) {
        mine.splice(i, 1);
        saveMine();
        renderMine();
        render();
        return;
      }
      p = Object.assign(defaults(), mine[i].p);
      syncInputs();
      changed();
    })
  );
}
function buildMine() {
  $('mine-save').addEventListener('click', () => {
    const name = ($('mine-name').value || '').trim() || `Wariant ${mine.length + 1}`;
    const ex = mine.findIndex(m => m.name === name);
    const item = { name, p: Object.assign({}, p) };
    if (ex >= 0) mine[ex] = item;
    else mine.push(item);
    const ok = saveMine();
    $('mine-name').value = '';
    $('mine-note').textContent = ok
      ? `Zapisano „${name}” w tej przeglądarce.`
      : 'Ta przeglądarka nie pozwala zapisać. Wariant działa do zamknięcia strony.';
    renderMine();
    render();
  });
  $('mine-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') $('mine-save').click();
  });
  renderMine();
}
function sameAs(q) {
  return DEF.every(d => q[d.id] === undefined || q[d.id] === p[d.id]);
}

function matches(set) {
  return Object.keys(set).every(k => Math.abs(+p[k] - set[k]) < 1e-9);
}
function markPresets() {
  document
    .querySelectorAll('[data-var]')
    .forEach(b => b.classList.toggle('on', matches(PRESETS.find(v => v.id === b.dataset.var).set)));
  document
    .querySelectorAll('[data-ass]')
    .forEach(b => b.classList.toggle('on', matches(ASSUME.find(a => a.id === b.dataset.ass).set)));
  document
    .querySelectorAll('[data-mine]')
    .forEach(b => b.classList.toggle('on', sameAs(mine[+b.dataset.mine].p)));
}
