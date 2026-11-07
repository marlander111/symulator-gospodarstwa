// Panel „Budżet domu”: wydatki rodziny, 800+, zapas i porównanie z wynikiem gospodarstwa.

function renderDom(r, ro) {
  const d = r.dom,
    rows = [
      ['Wydatki domu', d.wyd, `${fmt(p.wydDom, 0)} zł miesięcznie`],
      [`Zapas ${p.zapasDom}%`, d.zapas, ''],
      ['Oszczędzanie: emerytura, rezerwa', d.odklad, ''],
      ['minus 800+', -d.z800, `${p.dzieci800} × 800 zł miesięcznie`],
    ];
  let t = `<thead><tr><th>Pozycja</th><th class="n">zł/rok</th><th></th></tr></thead><tbody>`;
  for (const [l, v, n] of rows)
    t += `<tr><td>${l}</td><td class="n${v < 0 ? ' neg' : ''}">${zl0(v)}</td><td class="small muted">${n}</td></tr>`;
  t += `<tr class="tot"><td>Potrzeba z gospodarstwa</td><td class="n">${zl0(d.potrzeba)}</td><td class="small muted">${zl0(d.potrzeba / 12)} miesięcznie</td></tr>`;
  t += `<tr><td>Bez 800+ (gdy dzieci dorosną)</td><td class="n">${zl0(d.bez800)}</td><td class="small muted">${zl0(d.bez800 / 12)} miesięcznie</td></tr>`;
  t += `<tr><td>Wynik realnie</td><td class="n">${zl0(r.netto)}</td><td class="small muted">${zl0(r.netto / 12)} miesięcznie</td></tr>`;
  t += `<tr><td>Wynik w wariancie pesymistycznym</td><td class="n${ro.netto < d.potrzeba ? ' neg' : ''}">${zl0(ro.netto)}</td><td class="small muted">${zl0(ro.netto / 12)} miesięcznie</td></tr></tbody>`;
  $('t-dom').innerHTML = t;
  const nad = ro.netto - d.potrzeba;
  $('dom-note').textContent =
    (nad >= 0
      ? `W wariancie pesymistycznym zostaje ok. ${zl(nad)} rocznie ponad potrzeby (z 800+). `
      : `W wariancie pesymistycznym brakuje ok. ${zl(-nad)} rocznie do potrzeb. `) +
    `Wynik pesymistyczny razem z 800+ to ok. ${d.wyd > 0 ? fmt((ro.netto + d.z800) / d.wyd, 1) : '–'} × roczne wydatki domu. Amortyzacja (${zl(r.amort)} rocznie) jest już odjęta: odkładaj ją osobno na naprawy i wymianę sprzętu. ${p.celZBudzetu ? 'Minimum na czysto liczy się teraz z tego budżetu.' : 'Włącz „Licz minimum z budżetu domu”, żeby próg w pasku liczył się stąd.'}`;
}
