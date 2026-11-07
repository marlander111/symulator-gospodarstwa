// Szybki test modelu w Node: najpierw `python3 build.py`, potem `node tests/model.test.js`.
// Sprawdza, że każdy gotowy wariant liczy się bez błędów i daje sensowne liczby.
const assert = require('assert');
const M = require('../build/model.js');

const ids = new Set();
for (const d of M.DEF) {
  assert(!ids.has(d.id), `powtórzony parametr: ${d.id}`);
  ids.add(d.id);
  assert(M.GROUPS[d.g], `parametr ${d.id} ma nieznaną grupę ${d.g}`);
}

for (const pr of M.PRESETS) {
  const p = Object.assign(M.defaults(), pr.set);
  const r = M.compute(p);
  const nums = JSON.stringify(r).match(/NaN|Infinity/);
  assert(!nums, `wariant „${pr.l}”: w wyniku jest ${nums}`);
  const cf = M.cashflow(r, p);
  assert(Array.isArray(cf) || typeof cf === 'object', 'cashflow powinien zwrócić dane miesięczne');
}
console.log(`OK: ${M.DEF.length} parametrów, ${M.PRESETS.length} wariantów`);
