// Stan aplikacji `p` (wczytany z przeglądarki) i drobne funkcje pomocnicze.

const LS = 'gosp-lwowek-v1';
let p = defaults();
try {
  const s = JSON.parse(localStorage.getItem(LS) || 'null');
  if (s) for (const k in s) if (k in p) p[k] = s[k];
} catch (e) {}
const $ = id => document.getElementById(id);
const zl = x => fmt(Math.round(x / 100) * 100, 0) + ' zł';
const zl0 = x => fmt(x, 0) + ' zł';
const esc = s =>
  String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const decimals = s => {
  const t = String(s);
  return t.includes('.') ? t.split('.')[1].length : 0;
};
const fmtVal = (d, v) => (d.t === 'bool' ? '' : fmt(v, decimals(d.s)) + (d.u ? ' ' + d.u : ''));
