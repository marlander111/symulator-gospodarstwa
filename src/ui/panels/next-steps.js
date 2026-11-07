// Panel „Co dalej”: przelicza kroki typu +1 krowa, +30 kur i pokazuje ograniczenia.

// ---------- Co dalej: co dołożyć ----------
const MOVES = [
  { id: 'krowy', d: 1, l: '+1 krowa mleczna' },
  { id: 'ser', d: 10, l: '+10% mleka na sery', max: 80 },
  { id: 'kury', d: 30, l: '+30 kur nieśnych' },
  { id: 'brojlery', d: 50, l: '+50 kurczaków' },
  { id: 'gesi', d: 5, l: '+5 gęsi' },
  { id: 'kaczki', d: 20, l: '+20 kaczek' },
  { id: 'perliczki', d: 20, l: '+20 perliczek' },
  { id: 'kroliki', d: 1, l: '+1 samica królika' },
  { id: 'owce', d: 2, l: '+2 owce matki' },
  { id: 'swinieSprz', d: 2, l: '+2 tuczniki na sprzedaż' },
  { id: 'mamki', d: 1, l: '+1 krowa mamka' },
  { id: 'ule', d: 2, l: '+2 ule' },
  { id: 'warzywaSprz', d: 0.1, l: '+0,1 ha warzyw' },
  { id: 'klody', d: 50, l: '+50 kłód boczniaka' },
  { id: 'owoceSprz', d: 20, l: '+20% owoców na sprzedaż', max: 90 },
  { id: 'dzierzawa', d: 1, l: '+1 ha dzierżawy (łąka)', also: { laka: 1 } },
  { id: 'konie', d: -1, l: '−1 koń', min: 0 },
  { id: 'kroliki', d: -1, l: '−1 samica królika', min: 0 },
];
const feedOk = x =>
  x.grainBal >= -0.05 && x.hayBal >= -0.05 && x.strawBal >= -0.05 && x.grazeSurplus >= -0.05;
function nextMoves() {
  const base = compute(p),
    baseG = compute(gorzej(p));
  const out = [];
  for (const m of MOVES) {
    const v = +((p[m.id] || 0) + m.d).toFixed(2);
    if (m.d < 0 && (p[m.id] || 0) <= (m.min ?? 0)) continue;
    if (m.max !== undefined && v > m.max) continue;
    const q = Object.assign({}, p, { [m.id]: v });
    if (m.also) for (const k in m.also) q[k] = +(p[k] + m.also[k]).toFixed(2);
    const a = compute(q),
      g = compute(gorzej(q));
    out.push({
      m,
      v,
      q,
      dN: a.netto - base.netto,
      dG: g.netto - baseG.netto,
      dH: a.godziny - base.godziny,
      dC: a.capex - base.capex,
      pk: g.tydzSzczyt,
      feed: feedOk(a),
      feedTxt: [
        a.grainBal < -0.05 ? `ziarna ${fmt(-a.grainBal, 1)} t` : '',
        a.hayBal < -0.05 ? `siana ${fmt(-a.hayBal, 1)} t` : '',
        a.strawBal < -0.05 ? `słomy ${fmt(-a.strawBal, 1)} t` : '',
        a.grazeSurplus < -0.05 ? 'pastwiska' : '',
      ]
        .filter(Boolean)
        .join(', '),
    });
  }
  out.forEach(o => (o.fit = o.pk <= p.limitTydz && o.feed));
  out.sort((x, y) => y.fit - x.fit || y.dG - x.dG);
  return { out, baseG };
}
function renderNext() {
  const { out } = nextMoves();
  let t = `<thead><tr><th>Zmiana</th><th class="n">Dochód</th><th class="n">Pesymistycznie</th><th class="n">Godziny</th><th class="n">zł/dodatkową h</th><th class="n">Inwestycje</th><th>Ograniczenia</th><th></th></tr></thead><tbody>`;
  out.forEach((o, i) => {
    const lim = o.pk > p.limitTydz,
      warn = [lim ? `szczyt ${fmt(o.pk, 0)} h/tydz.` : '', !o.feed ? `brakuje: ${o.feedTxt}` : ''].filter(
        Boolean
      );
    const perH = o.dH > 1 ? fmt(o.dN / o.dH, 0) : '–';
    t += `<tr><td>${esc(o.m.l)}</td><td class="n${o.dN < 0 ? ' neg' : ''}">${o.dN >= 0 ? '+' : ''}${zl(o.dN)}</td><td class="n${o.dG < 0 ? ' neg' : ''}">${o.dG >= 0 ? '+' : ''}${zl(o.dG)}</td><td class="n">${o.dH >= 0 ? '+' : ''}${fmt(o.dH, 0)}</td><td class="n">${perH}</td><td class="n">${o.dC > 0 ? '+' + zl(o.dC) : '–'}</td><td>${warn.length ? warn.map(w => `<span class="pill warn">${esc(w)}</span>`).join(' ') : '<span class="pill ok">mieści się</span>'}</td><td><button class="btn" type="button" data-next="${i}">Zastosuj</button></td></tr>`;
  });
  $('t-next').innerHTML = t + `</tbody>`;
  $('t-next')
    .querySelectorAll('[data-next]')
    .forEach(b =>
      b.addEventListener('click', () => {
        const o = out[+b.dataset.next];
        if (!o) return;
        p[o.m.id] = o.v;
        if (o.m.also) for (const k in o.m.also) p[k] = o.q[k];
        syncInputs();
        changed();
      })
    );
  const best = out.find(o => o.pk <= p.limitTydz && o.feed && o.dG > 0);
  $('next-note').textContent = best
    ? `Najwięcej w wariancie pesymistycznym, bez przekroczenia limitu pracy i z własnymi paszami: ${best.m.l} (${best.dG >= 0 ? '+' : ''}${zl(best.dG)} rocznie).`
    : 'Żaden krok nie mieści się teraz jednocześnie w limicie pracy i w paszach z własnych pól. Najpierw ziemia (dzierżawa) albo mniej zwierząt.';
}
