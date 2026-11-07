// Kolorowanie liczb w tabelach od czerwonego (najsłabiej) do zielonego (najlepiej).

// ---------- Delikatne kolorowanie liczb: od czerwonego (najsłabiej) do zielonego (najlepiej) ----------
const num = t => {
  const s = String(t)
    .replace(/\u2212/g, '-')
    .replace(/[^\d,.\-]/g, '')
    .replace(/\.(?=\d{3})/g, '')
    .replace(',', '.');
  const v = parseFloat(s);
  return isFinite(v) ? v : null;
};
const mixBg = (c, a) =>
  a > 0.005 ? `color-mix(in srgb, var(${c}) ${Math.round(a * 100)}%, transparent)` : '';
function tint(id, cols) {
  const t = $(id);
  if (!t) return;
  const rows = [...t.querySelectorAll('tbody tr')].filter(r => !r.classList.contains('tot'));
  for (const [ci, mode] of Object.entries(cols)) {
    const cells = rows.map(r => r.cells[+ci]).filter(Boolean);
    const vals = cells.map(c => num(c.textContent));
    const vs = vals.filter(v => v !== null);
    if (!vs.length) continue;
    const mn = Math.min(...vs),
      mx = Math.max(...vs),
      mxAbs = Math.max(...vs.map(Math.abs)) || 1;
    cells.forEach((c, i) => {
      const v = vals[i];
      c.style.background = '';
      if (v === null) return;
      let bg = '';
      if (mode === 'pos') bg = mixBg('--ok', (0.3 * Math.abs(v)) / mxAbs);
      else if (mode === 'neg') bg = mixBg('--bad', (0.22 * Math.abs(v)) / mxAbs);
      else {
        let tt = mx > mn ? (v - mn) / (mx - mn) : 0.5;
        if (mode === 'low') tt = 1 - tt;
        if (v < 0 && mode !== 'low') bg = mixBg('--bad', 0.12 + (0.18 * Math.abs(v)) / mxAbs);
        else
          bg = tt < 0.4 ? mixBg('--bad', (0.2 * (0.4 - tt)) / 0.4) : mixBg('--ok', (0.34 * (tt - 0.4)) / 0.6);
      }
      c.style.background = bg;
    });
  }
}
function tintAll() {
  tint('t-rev', { 1: 'pos' });
  tint('t-dop', { 1: 'pos' });
  tint('t-home', { 1: 'pos' });
  tint('t-cost', { 1: 'neg' });
  tint('t-cf', { 1: 'pos', 2: 'pos', 3: 'neg', 4: 'rank', 6: 'rank' });
  tint('t-kier', { 1: 'rank', 2: 'rank' });
  tint('t-next', { 2: 'rank' });
  tint('t-lab', { 1: 'neg', 2: 'neg' });
  tint('t-cal', { 2: 'low', 5: 'rank' });
}
