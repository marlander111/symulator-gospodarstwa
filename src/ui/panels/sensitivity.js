// Panel „Co najbardziej zmienia wynik”: każde założenie ±20%.

// ---------- Co najbardziej zmienia wynik (±20%) ----------
const SENS = [
  ['cenaSera', 'Cena sera'],
  ['cenaMleka', 'Cena mleka'],
  ['mleko', 'Mleko od krowy'],
  ['wydSera', 'Wydajność sera'],
  ['cenaJaja', 'Cena jajka'],
  ['niesnosc', 'Nieśność'],
  ['cenaTuszki', 'Cena kurczaka'],
  ['cenaGesi', 'Cena gęsi'],
  ['cenaMiesaJag', 'Cena jagnięciny'],
  ['cenaKaczki', 'Cena kaczki'],
  ['cenaWieprzowiny', 'Cena wieprzowiny'],
  ['cenaMiodu', 'Cena miodu'],
  ['plonPast', 'Plon pastwiska'],
  ['plonLaki', 'Plon łąki'],
  ['plonZboz', 'Plon zbóż'],
  ['plonKoniczyny', 'Plon koniczyny'],
  ['kStale', 'Koszty stałe'],
  ['paszaKura', 'Pasza na kurę'],
  ['cenaKurki', 'Cena kurki'],
  ['czynsz', 'Czynsz dzierżawny'],
];
function renderSens() {
  const base = compute(p).netto,
    rows = [];
  for (const [id, l] of SENS) {
    if (p[id] === undefined || !p[id]) continue;
    const lo = compute(Object.assign({}, p, { [id]: p[id] * 0.8 })).netto - base;
    const hi = compute(Object.assign({}, p, { [id]: p[id] * 1.2 })).netto - base;
    if (Math.abs(hi) + Math.abs(lo) < 200) continue;
    rows.push({ l, lo, hi, span: Math.abs(hi - lo) });
  }
  rows.sort((a, b) => b.span - a.span);
  const R = rows.slice(0, 12),
    W = 640,
    rh = 24,
    pl = 150,
    pr = 70,
    top = 22,
    H = top + R.length * rh + 26;
  const mx = Math.max(1, ...R.map(x => Math.max(Math.abs(x.lo), Math.abs(x.hi))));
  const cx = pl + (W - pl - pr) / 2,
    sc = (W - pl - pr) / 2 / mx;
  let s = `<text x="${cx}" y="14" text-anchor="middle" class="ax">wynik ${zl(base)}: zmiana przy −20% (lewo) i +20% (prawo)</text>`;
  R.forEach((x, i) => {
    const y = top + i * rh;
    s += `<text x="${pl - 8}" y="${y + 16}" text-anchor="end" font-size="12.5">${esc(x.l)}</text>`;
    for (const [v, side] of [
      [x.lo, 'lo'],
      [x.hi, 'hi'],
    ]) {
      const w = Math.abs(v) * sc,
        x0 = v >= 0 ? cx : cx - w;
      s += `<rect x="${x0}" y="${y + 4}" width="${Math.max(1, w)}" height="${rh - 8}" rx="2" fill="${v >= 0 ? 'var(--ok)' : 'var(--bad)'}" opacity="${side === 'hi' ? 0.75 : 0.5}"><title>${esc(x.l)} ${side === 'hi' ? '+20%' : '−20%'}: ${v >= 0 ? '+' : ''}${zl(v)}</title></rect>`;
    }
    const big = x.hi >= x.lo ? x.hi : x.lo;
    s += `<text x="${W - pr + 6}" y="${y + 16}" class="ax">±${fmt(Math.round(Math.max(Math.abs(x.lo), Math.abs(x.hi)) / 100) / 10, 1)} tys.</text>`;
  });
  s += `<line x1="${cx}" x2="${cx}" y1="${top}" y2="${top + R.length * rh}" stroke="var(--muted)"></line>`;
  $('sens').setAttribute('viewBox', `0 0 ${W} ${H}`);
  $('sens').innerHTML = s;
  $('sens-note').textContent = R.length
    ? `Najbardziej liczą się: ${R.slice(0, 3)
        .map(x => x.l.toLowerCase())
        .join(', ')}. Te liczby sprawdź u siebie w pierwszej kolejności.`
    : '';
}
