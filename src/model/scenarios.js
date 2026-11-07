// Funkcje pomocnicze modelu: wartości domyślne, wariant pesymistyczny, budżet domu,
// klasy gleby i układ płodozmianu.

const sum = o => Object.values(o).reduce((a, b) => a + b, 0);

function defaults() {
  const p = {};
  DEF.forEach(d => (p[d.id] = d.v));
  return p;
}

const G_CENY = [
  'cenaMleka',
  'cenaSera',
  'cenaCielaka',
  'cenaKrowyBrak',
  'cenaJaja',
  'cenaTuszki',
  'cenaGesi',
  'cenaKrol',
  'cenaKaczki',
  'cenaIndyka',
  'cenaPerliczki',
  'cenaJag',
  'cenaMiesaJag',
  'cenaWarzywHa',
  'cenaMiodu',
  'cenaOwocow',
  'cenaGrzybow',
  'wartPrzetGes',
  'wartPrzetKaczka',
  'wartPrzetJag',
  'cenaOdsadka',
  'cenaWolowiny',
  'cenaZywcaOpas',
  'cenaKoziny',
  'cenaWieprzowiny',
];
const G_PLONY = [
  'plonZboz',
  'plonSlomy',
  'plonPast',
  'plonLaki',
  'plonKoniczyny',
  'plonSad',
  'miodUl',
  'plonKloda',
];
const G_WYD = ['mleko', 'niesnosc', 'odchowJag', 'odchowKrol'];
const G_KUP = ['cenaZiarnaKup', 'cenaSianaKup', 'cenaSlomyKup', 'cenaTrocin'];
// Wariant pesymistyczny: bieżące ustawienia pogorszone o suwaki z grupy gorzej
function gorzej(p) {
  const q = Object.assign({}, p);
  G_CENY.forEach(k => (q[k] = p[k] * (1 - p.gCeny / 100)));
  G_PLONY.forEach(k => (q[k] = p[k] * (1 - p.gPlony / 100)));
  G_WYD.forEach(k => (q[k] = p[k] * (1 - p.gWyd / 100)));
  G_KUP.forEach(k => (q[k] = p[k] * (1 + p.gKoszty / 100)));
  q._fH = 1 + p.gGodz / 100;
  q._fC = 1 + p.gKoszty / 100;
  return q;
}

// Budżet domu: ile gospodarstwo musi dać na czysto
function budzet(p) {
  const wyd = p.wydDom * 12,
    zapas = (wyd * p.zapasDom) / 100,
    z800 = p.dzieci800 * 800 * 12;
  const potrzeba = Math.max(0, wyd + zapas + p.odkladDom - z800);
  return { wyd, zapas, odklad: p.odkladDom, z800, potrzeba, bez800: wyd + zapas + p.odkladDom };
}
function celEff(p) {
  return p.celZBudzetu ? budzet(p).potrzeba : p.celNetto;
}

// Klasy gleby: mnożniki plonów względem klasy IV
function gleba(p) {
  const u3 = p.udzialIII / 100,
    u5 = p.udzialV / 100,
    u6 = p.udzialVI / 100,
    u4 = Math.max(0, 1 - u3 - u5 - u6);
  const sum = u3 + u4 + u5 + u6 || 1;
  return {
    orne: (u3 * 1.2 + u4 + u5 * 0.75 + u6 * 0.55) / sum,
    tuz: (u3 * 1.1 + u4 + u5 * 0.85 + u6 * 0.7) / sum,
  };
}

// Płodozmian w modelu (ten sam układ co w sekcji „Płodozmian”)
function rotacja(p) {
  const L = p.plodLat,
    share = p.zbozaUdzial / 100;
  const k = Math.min(L - 1, Math.max(1, Math.round((1 - share) * L))),
    c = L - k;
  const cer = {
    1: ['owies'],
    2: ['pszen', 'owies'],
    3: ['pszen', 'zyto', 'owies'],
    4: ['pszen', 'miesz', 'zyto', 'owies'],
    5: ['pszen', 'miesz', 'zyto', 'pszen', 'owies'],
  }[c];
  const seq = [];
  for (let i = 0; i < k; i++) seq.push('konicz');
  cer.forEach(x => seq.push(x));
  let mp = 0,
    ws = 0,
    obor = 0,
    sc = 0;
  seq.forEach((id, i) => {
    const nx = seq[(i + 1) % L];
    if (id !== 'konicz' && id !== 'owies' && (nx === 'owies' || nx === 'miesz')) mp++;
    if (id === 'owies') ws++;
    if (id !== 'konicz' && id !== 'owies' && (nx === 'pszen' || nx === 'zyto')) sc++;
    if (nx === 'pszen' || nx === 'owies') obor++;
  });
  const uniq = new Set(seq).size,
    maxShare = Math.max(...[...new Set(seq)].map(x => seq.filter(y => y === x).length)) / L;
  const strukturaOk = uniq >= 3 && c / L <= 0.65 && k / L >= 0.2 && maxShare <= 0.65;
  return { L, k, c, seq, mp, ws, obor, sc, uniq, strukturaOk, cerShare: c / L };
}
