// Stałe: stawki dopłat, profile miesięczne pracy i grupy na wykresie czasu pracy.

// Stawki dopłat (2025, eko: szacunek na 2023)
const RATES = {
  pwd: 488.55,
  redys: 176.84,
  mlody: 248.16,
  krowy: 412.63,
  bydlo: 322.49,
  owce: 110.16,
  kozy: 48.12,
  ekoTUZ: 1043,
  ekoOrne: 1504,
  ekoSad: 1961,
  premia: 573,
  ekstTUZ: 435.1,
  ekoWarz: 2391,
  dbKrowaWypas: 287.52,
  dbKrowaSciolka: 92.75,
  dbKrowaPow: 639.97,
  dbOwca: 143.3,
  dbKoza: 138.39,
  dbKura: 13.12,
};

// Profile miesięczne pracy (I–XII), normalizowane do średniej 1
const PROF = {
  krowy: [0.6, 0.6, 1, 1.1, 1.1, 1.1, 1.1, 1.05, 1, 1, 0.9, 0.7],
  ser: [0.2, 0.2, 0.6, 1, 1.4, 1.6, 1.6, 1.5, 1.2, 0.8, 0.4, 0.2],
  kury: [0.85, 0.9, 1, 1.05, 1.05, 1.05, 1.05, 1.05, 1, 1, 0.95, 0.85],
  wyleg: [0, 0.5, 2, 2.5, 2, 1.5, 1.2, 1, 0.8, 0.3, 0, 0],
  bydlo: [1.2, 1.2, 1.3, 1, 0.8, 0.8, 0.8, 0.8, 0.9, 1.3, 1, 1.1],
  miedzyplony: [0, 0.3, 0.2, 0, 0, 0, 0, 1.5, 1.5, 0, 0, 0],
  brojlery: [0, 0, 0, 0.5, 1.5, 1.5, 1.5, 1.5, 1, 0.5, 0, 0],
  gesi: [0, 0, 0, 0.5, 1, 1, 1, 1, 1, 1.5, 2, 0.5],
  kaczki: [0, 0, 0, 0.3, 1.2, 1.5, 1.5, 1.5, 1.3, 0.8, 0.3, 0],
  indyki: [0, 0, 0, 0, 0.6, 1, 1, 1, 1.2, 1.5, 2, 1.5],
  perliczki: [0, 0, 0, 0, 0.8, 1.2, 1.2, 1.2, 1.2, 1.4, 1.2, 0.3],
  przetwory: [0.4, 0.3, 0.3, 0.3, 0.3, 0.4, 0.5, 0.7, 1, 1.6, 3, 3],
  owoce: [0, 0, 0, 0, 0, 0.3, 0.8, 1.8, 3.5, 3.5, 1.2, 0.3],
  grzyby: [0.3, 0.3, 0.8, 1.3, 1.4, 1, 0.7, 0.9, 1.5, 1.6, 1, 0.3],
  kroliki: [0.7, 0.7, 0.9, 1.1, 1.2, 1.2, 1.2, 1.2, 1.1, 1, 0.9, 0.8],
  owce: [0.8, 1, 1.8, 1.6, 1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
  kozy: [0.8, 0.9, 1.3, 1.2, 1, 1, 1, 1, 1, 1, 0.9, 0.9],
  konie: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  swinie: [0.5, 0.5, 0.8, 1.2, 1.3, 1.3, 1.3, 1.3, 1.2, 1.2, 1, 0.5],
  siano: [0, 0, 0, 0, 2, 4, 2, 2, 1, 0, 0, 0],
  zboza: [0, 0, 1, 2, 1, 0, 1, 3, 2, 2, 0, 0],
  sprzedaz: [0.75, 0.75, 0.9, 1, 1.1, 1.15, 1.15, 1.15, 1.1, 1.05, 0.95, 0.85],
  ogolne: [0.8, 0.8, 1.3, 1.5, 1.2, 1, 1, 1, 1, 1, 0.8, 0.6],
  ogrod: [0.2, 0.3, 0.8, 1.5, 2, 2, 2, 1.8, 1.5, 1, 0.5, 0.2],
  warzywa: [0.1, 0.2, 0.7, 1.3, 1.8, 2, 2, 1.9, 1.6, 1.1, 0.5, 0.2],
  ule: [0.1, 0.2, 0.8, 1.4, 1.8, 1.8, 1.6, 1.3, 0.9, 0.4, 0.2, 0.1],
};
for (const k in PROF) {
  const m = PROF[k].reduce((a, b) => a + b, 0) / 12;
  PROF[k] = PROF[k].map(x => x / m);
}

const LAB_GROUPS = [
  { id: 'krowy', l: 'Krowy i sery', keys: ['bydlo', 'krowy', 'ser'] },
  {
    id: 'drob',
    l: 'Drób i króliki',
    keys: ['kury', 'wyleg', 'brojlery', 'gesi', 'kaczki', 'indyki', 'perliczki', 'kroliki'],
  },
  { id: 'owce', l: 'Owce, kozy, świnie, konie', keys: ['owce', 'kozy', 'swinie', 'konie'] },
  { id: 'pole', l: 'Siano i zboża', keys: ['siano', 'zboza', 'miedzyplony'] },
  { id: 'warz', l: 'Warzywa, owoce, grzyby, pszczoły', keys: ['warzywa', 'owoce', 'grzyby', 'ule'] },
  { id: 'przetw', l: 'Przetwórstwo i wysyłka', keys: ['przetwory'] },
  { id: 'reszta', l: 'Sprzedaż, naprawy, ogród', keys: ['sprzedaz', 'ogolne', 'ogrod'] },
];
