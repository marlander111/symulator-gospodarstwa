// Panel „Przepływy gotówki”: tabela i wykres miesiąc po miesiącu.

// ---------- Przepływy gotówki ----------
function renderCF(r) {
  const cf = r.cf,
    M = cf.M;
  let t = `<thead><tr><th>Miesiąc</th><th class="n">Sprzedaż</th><th class="n">Dopłaty</th><th class="n">Koszty</th><th class="n">Wynik</th><th class="n">Na dom</th><th class="n">Saldo konta</th></tr></thead><tbody>`;
  let sw = 0,
    sd = 0,
    sk = 0,
    sdom = 0;
  M.forEach((m, i) => {
    sw += m.wplywy;
    sd += m.dop;
    sk += m.wydatki;
    sdom += m.dom;
    t += `<tr class="${i === cf.minM ? 'sel' : ''}"><td>${MN[i]}</td><td class="n">${zl(m.wplywy)}</td><td class="n">${zl(m.dop)}</td><td class="n">${zl(m.wydatki)}</td><td class="n${m.netto < 0 ? ' neg' : ''}">${zl(m.netto)}</td><td class="n">${zl(m.dom)}</td><td class="n${m.saldo < 0 ? ' neg' : ''}">${zl(m.saldo)}</td></tr>`;
  });
  t += `<tr class="tot"><td>Rok</td><td class="n">${zl(sw)}</td><td class="n">${zl(sd)}</td><td class="n">${zl(sk)}</td><td class="n">${zl(sw + sd - sk)}</td><td class="n">${zl(sdom)}</td><td class="n">${zl(cf.koniec)}</td></tr></tbody>`;
  $('t-cf').innerHTML = t;
  // wykres
  const Wd = 640,
    Hd = 230,
    pl = 56,
    pr = 10,
    pt = 14,
    pb = 40,
    cw = (Wd - pl - pr) / 12;
  const vals = M.map(m => m.netto - m.dom),
    sal = M.map(m => m.saldo);
  const lo = Math.min(0, ...vals, ...sal, p.gotowkaStart),
    hi = Math.max(1, ...vals, ...sal, p.gotowkaStart);
  const y = v => pt + ((hi - v) / (hi - lo)) * (Hd - pt - pb);
  let s = '';
  const st = niceStep(hi - lo);
  for (let v = Math.ceil(lo / st) * st; v <= hi; v += st)
    s += `<line x1="${pl}" x2="${Wd - pr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"></line><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end" class="ax">${fmt(v / 1000, 0)} tys.</text>`;
  s += `<line x1="${pl}" x2="${Wd - pr}" y1="${y(0)}" y2="${y(0)}" stroke="var(--muted)"></line>`;
  vals.forEach((v, i) => {
    const x0 = pl + i * cw + cw * 0.2,
      bw = cw * 0.6;
    s += `<rect x="${x0}" y="${Math.min(y(v), y(0))}" width="${bw}" height="${Math.max(1, Math.abs(y(v) - y(0)))}" fill="${v < 0 ? 'var(--bad)' : 'var(--c-krowy)'}" opacity=".75"><title>${MN[i]}: ${zl(v)} po wypłacie na dom</title></rect><text x="${pl + i * cw + cw / 2}" y="${Hd - pb + 16}" text-anchor="middle" class="ax">${MS[i]}</text>`;
  });
  s += `<polyline fill="none" stroke="var(--ink)" stroke-width="2" points="${sal.map((v, i) => `${pl + i * cw + cw / 2},${y(v)}`).join(' ')}"></polyline>`;
  sal.forEach(
    (v, i) =>
      (s += `<circle cx="${pl + i * cw + cw / 2}" cy="${y(v)}" r="3" fill="var(--ink)"><title>${MN[i]}: saldo ${zl(v)}</title></circle>`)
  );
  s += `<text x="${pl}" y="${Hd - 4}" class="ax">słupki: miesiąc po wypłacie na dom · linia: saldo konta</text>`;
  $('cfchart').innerHTML = s;
  $('cf-note').textContent =
    `Najniżej na koncie w miesiącu ${MN[cf.minM].toLowerCase()}: ${zl(cf.min)}. ${cf.min < 0 ? 'Saldo spada poniżej zera: zwiększ gotówkę na start albo przesuń wydatki. ' : ''}Na dom co miesiąc ${zl(cf.naDom)} (wydatki minus 800+). Dopłaty: zaliczki zwykle od 16 października, reszta do wiosny; dobrostan często dopiero wiosną następnego roku. Inwestycje i amortyzacja nie są tu liczone. To, co zostaje na koniec roku, to wynik na czysto plus amortyzacja minus wypłaty na dom: odłóż część na naprawy i wymianę sprzętu.`;
}
