// Panel suwaków: budowa grup, separatory podsekcji, synchronizacja z `p`.

// ---------- Suwaki ----------
const OPEN = [];
function buildControls() {
  const box = $('ctrls');
  let html = '';
  for (const g in GROUPS) {
    const items = DEF.filter(d => d.g === g);
    html += `<details class="grp" id="grp-${g}" ${OPEN.includes(g) ? 'open' : ''}><summary><span>${GROUPS[g]}</span><span class="sumv" id="sum-${g}"></span></summary><div class="grp-body">`;
    for (const d of items) {
      if (SEPS[d.id]) html += `<div class="ctl-sep" role="presentation">${esc(SEPS[d.id])}</div>`;
      if (d.t === 'bool') {
        html += `<label class="sw"><input type="checkbox" id="in-${d.id}"><span>${esc(d.l)}${d.h ? `<br><span class="help muted small">${esc(d.h)}</span>` : ''}</span></label>`;
      } else {
        html += `<div class="ctl${d.a ? ' adv' : ''}"><div class="ctl-top"><label for="in-${d.id}">${esc(d.l)}</label><output id="out-${d.id}"></output></div><input type="range" id="in-${d.id}" min="${d.min}" max="${d.max}" step="${d.s}">${d.h ? `<p class="help">${esc(d.h)}</p>` : ''}</div>`;
      }
      if (d.id === 'laka') html += `<div class="derived" id="derived-orne"></div>`;
    }
    html += `</div></details>`;
  }
  html += `<button class="btn ghost reset" id="reset" type="button">Przywróć ustawienia domyślne</button>`;
  box.innerHTML = html;
  for (const d of DEF) {
    const el = $('in-' + d.id);
    if (d.t === 'bool')
      el.addEventListener('change', () => {
        p[d.id] = el.checked;
        changed();
      });
    else
      el.addEventListener('input', () => {
        p[d.id] = parseFloat(el.value);
        $('out-' + d.id).textContent = fmtVal(d, p[d.id]);
        changed();
      });
  }
  $('reset').addEventListener('click', () => {
    p = defaults();
    syncInputs();
    changed();
  });
}
function syncInputs() {
  for (const d of DEF) {
    const el = $('in-' + d.id);
    if (d.t === 'bool') el.checked = !!p[d.id];
    else {
      el.value = p[d.id];
      $('out-' + d.id).textContent = fmtVal(d, p[d.id]);
    }
  }
}
