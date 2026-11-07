// Parametry grupy „Ludzie i czas pracy”.

DEF.push(
  { g: 'ludzie', id: 'etaty', l: 'Osoby na pełny etat', min: 0, max: 6, s: 1, v: 2, u: 'os.' },
  { g: 'ludzie', id: 'polEtaty', l: 'Osoby na pół etatu', min: 0, max: 6, s: 1, v: 2, u: 'os.' },
  { g: 'ludzie', id: 'cwiercEtaty', l: 'Osoby na ćwierć etatu', min: 0, max: 8, s: 1, v: 3, u: 'os.' },
  {
    g: 'ludzie',
    id: 'limitTydz',
    l: 'Górny limit pracy w najcięższym miesiącu',
    min: 40,
    max: 160,
    s: 5,
    v: 80,
    u: 'h/tydz.',
    h: 'Dla całego gospodarstwa razem. Sprawdzam go w wariancie pesymistycznym (ustawienia na dole listy).',
  },
  {
    g: 'ludzie',
    id: 'celNetto',
    l: 'Minimum na czysto w wariancie pesymistycznym',
    min: 0,
    max: 250000,
    s: 5000,
    v: 120000,
    u: 'zł/rok',
  },
  {
    g: 'ludzie',
    id: 'hEtat',
    l: 'Godziny pełnego etatu w roku',
    min: 1600,
    max: 2800,
    s: 50,
    v: 2000,
    u: 'h',
    h: 'Ok. 40 h tygodniowo z urlopem. W gospodarstwie zwykle wychodzi więcej.',
  }
);
