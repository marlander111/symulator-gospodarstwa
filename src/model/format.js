// Formatowanie liczb po polsku (spacja co trzy cyfry, przecinek dziesiętny).

function fmt(x, d = 0) {
  if (!isFinite(x)) return '–';
  return x.toLocaleString('pl-PL', { minimumFractionDigits: d, maximumFractionDigits: d });
}
