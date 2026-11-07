// Sekcja „Porównanie wariantów”.

function renderCmp() {
  const rea = ASSUME.find(a => a.id === 'realnie').set;
  let t = `<thead><tr><th>Wariant</th><th class="n">Na czysto (realnie)</th><th class="n">Na czysto (wariant pesymistyczny)</th><th class="n">Godziny / rok</th><th class="n">Szczyt h/tydz. (wariant pesymistyczny)</th><th class="n">Inwestycje</th><th>Pasze z pól</th><th></th></tr></thead><tbody>`;
  for (const v of PRESETS) {
    const a = compute(Object.assign({}, p, v.set, rea));
    const b = compute(gorzej(Object.assign({}, p, v.set, rea)));
    const ok = x => x.grainBal >= -0.05 && x.hayBal >= -0.05 && x.strawBal >= -0.05;
    const lack = x =>
      [
        x.grainBal < -0.05 ? `ziarna ${fmt(-x.grainBal, 1)} t` : '',
        x.hayBal < -0.05 ? `siana ${fmt(-x.hayBal, 1)} t` : '',
        x.strawBal < -0.05 ? `słomy ${fmt(-x.strawBal, 1)} t` : '',
      ]
        .filter(Boolean)
        .join(', ');
    t += `<tr><td><b>${esc(v.l)}</b><br><span class="small muted">${esc(v.note)}</span></td><td class="n">${zl(a.netto)}</td><td class="n${b.netto < celEff(p) ? ' neg' : ''}">${zl(b.netto)}</td><td class="n">${fmt(a.godziny, 0)}</td><td class="n${b.tydzSzczyt > p.limitTydz ? ' neg' : ''}">${fmt(b.tydzSzczyt, 0)}</td><td class="n">${zl(a.capex)}</td><td>${ok(a) ? '<span class="pill ok">wystarcza</span>' : `<span class="pill bad">brakuje: ${lack(a)}</span>`} ${ok(b) ? '' : `<span class="pill warn">w wariancie pesymistycznym brakuje: ${lack(b)}</span>`}</td><td><button class="btn" type="button" data-load="${v.id}">Wczytaj</button></td></tr>`;
  }
  mine.forEach((m, i) => {
    const a = compute(Object.assign(defaults(), m.p));
    const b = compute(gorzej(Object.assign(defaults(), m.p)));
    const ok = x => x.grainBal >= -0.05 && x.hayBal >= -0.05 && x.strawBal >= -0.05;
    t += `<tr><td><b>${esc(m.name)}</b><br><span class="small muted">mój wariant, ceny jak zapisano</span></td><td class="n">${zl(a.netto)}</td><td class="n${b.netto < celEff(p) ? ' neg' : ''}">${zl(b.netto)}</td><td class="n">${fmt(a.godziny, 0)}</td><td class="n${b.tydzSzczyt > p.limitTydz ? ' neg' : ''}">${fmt(b.tydzSzczyt, 0)}</td><td class="n">${zl(a.capex)}</td><td>${ok(a) ? '<span class="pill ok">wystarcza</span>' : '<span class="pill bad">brakuje</span>'}</td><td><button class="btn" type="button" data-loadmine="${i}">Wczytaj</button></td></tr>`;
  });
  t += `</tbody>`;
  $('t-cmp').innerHTML = t;
  document.querySelectorAll('[data-loadmine]').forEach(b =>
    b.addEventListener('click', () => {
      p = Object.assign(defaults(), mine[+b.dataset.loadmine].p);
      syncInputs();
      changed();
      document.getElementById('ctrls').scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
  );
  document.querySelectorAll('[data-load]').forEach(b =>
    b.addEventListener('click', () => {
      Object.assign(p, PRESETS.find(v => v.id === b.dataset.load).set);
      syncInputs();
      changed();
      document.getElementById('ctrls').scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
  );
}
