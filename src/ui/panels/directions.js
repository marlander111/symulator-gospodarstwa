// Panel „Który kierunek się opłaca”: wynik, zł/ha i zł/h dla każdego kierunku.

function renderKier(r) {
  let t = `<thead><tr><th>Kierunek</th><th class="n">zł/ha</th><th class="n">zł/h</th><th class="n">Na czysto</th><th class="n">Ziemia</th><th class="n">Godziny</th><th class="n">Sprzedaż</th><th class="n">Koszty z paszą</th><th class="n">Amort.</th><th class="n">Dopłaty</th></tr></thead><tbody>`;
  const on = r.K.filter(k => k.on);
  for (const k of on) {
    t += `<tr><td>${esc(k.l)}</td><td class="n${(k.zlHa || 0) < 0 ? ' neg' : ''}">${k.rev > 0 && k.zlHa !== null ? fmt(k.zlHa, 0) : '–'}</td><td class="n${k.zlH < 0 ? ' neg' : ''}">${k.rev > 0 ? fmt(k.zlH, 0) : '–'}</td><td class="n${k.net < 0 ? ' neg' : ''}">${zl0(k.net)}</td><td class="n">${k.ha > 0.005 ? fmt(k.ha, 2) + ' ha' : '–'}</td><td class="n">${fmt(k.h, 0)}</td><td class="n">${zl0(k.rev)}</td><td class="n">${zl0(k.cost)}</td><td class="n">${zl0(k.amort)}</td><td class="n">${zl0(k.dop)}</td></tr>`;
  }
  t += `<tr class="sub"><td>Wspólne: dopłaty obszarowe, koszty stałe, ogród</td><td class="n"></td><td class="n"></td><td class="n">${zl0(r.wspolne.net)}</td><td class="n"></td><td class="n">${fmt(r.wspolne.h, 0)}</td><td class="n"></td><td class="n"></td><td class="n"></td><td class="n"></td></tr>`;
  t += `<tr class="tot"><td>Gospodarstwo</td><td class="n">${fmt(r.netto / r.UR, 0)}</td><td class="n">${fmt(r.zlH, 0)}</td><td class="n">${zl0(r.netto)}</td><td class="n">${fmt(r.UR, 1)} ha</td><td class="n">${fmt(r.godziny, 0)}</td><td class="n">${zl0(r.przychod)}</td><td class="n"></td><td class="n">${zl0(r.amort)}</td><td class="n">${zl0(r.doplaty)}</td></tr></tbody>`;
  $('t-kier').innerHTML = t;
  const dopHa =
    (r.Dp.pwd + r.Dp.redys + r.Dp.eko + r.Dp.premia + r.Dp.onw + r.Dp.ekst + r.Dp.mlody) /
    Math.max(0.01, r.UR);
  $('kier-note').textContent =
    `Ziemia to hektary potrzebne na paszę danego kierunku (pastwisko, siano i zboża według zużycia). Dopłaty obszarowe są w wierszu „Wspólne”: to ok. ${fmt(dopHa, 0)} zł na każdy hektar, niezależnie od kierunku.`;
}
