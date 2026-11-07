// Panel „Czas pracy w roku”: godziny w miesiącach na tle limitu i czasu rodziny.

function renderLab(r) {
  const C = {
    krowy: 'var(--c-krowy)',
    drob: 'var(--c-drob)',
    owce: 'var(--c-owce)',
    pole: 'var(--c-pole)',
    warz: 'var(--c-warz)',
    przetw: 'var(--c-przetw)',
    reszta: 'var(--c-reszta)',
  };
  const W = 640,
    H = 270,
    pl = 44,
    pr = 10,
    pt = 14,
    pb = 30;
  const cap = r.dostepne / 12;
  const lim = p.limitTydz * 4.33;
  const max = Math.max(r.szczyt, cap, lim, 1);
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;
  const y = v => pt + (1 - v / top) * (H - pt - pb);
  let s = '';
  for (let v = 0; v <= top + 1e-9; v += step) {
    s += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"></line><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end" class="ax">${fmt(v, 0)}</text>`;
  }
  const mon = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const bw = (W - pl - pr) / 12;
  r.mies.forEach((m, i) => {
    let acc = 0;
    const x = pl + i * bw + bw * 0.16,
      w = bw * 0.68;
    LAB_GROUPS.forEach(g => {
      const v = m[g.id];
      if (v <= 0) return;
      s += `<rect x="${x}" y="${y(acc + v)}" width="${w}" height="${Math.max(0.5, y(acc) - y(acc + v))}" fill="${C[g.id]}"><title>${mon[i]}: ${g.l} ${fmt(v, 0)} h</title></rect>`;
      acc += v;
    });
    s += `<text x="${x + w / 2}" y="${H - 10}" text-anchor="middle" class="ax">${mon[i]}</text>`;
  });
  if (cap > 0)
    s += `<line x1="${pl}" x2="${W - pr}" y1="${y(cap)}" y2="${y(cap)}" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="6 4"></line><text x="${W - pr}" y="${y(cap) - 5}" text-anchor="end" font-size="12">czas rodziny: ${fmt(cap, 0)} h/mies.</text>`;
  else s += `<text x="${W - pr}" y="${pt + 12}" text-anchor="end" class="ax">godziny w miesiącu</text>`;
  s += `<line x1="${pl}" x2="${W - pr}" y1="${y(lim)}" y2="${y(lim)}" stroke="var(--bad)" stroke-width="1.5" stroke-dasharray="2 4"></line><text x="${pl + 6}" y="${y(lim) - 5}" font-size="12" fill="var(--bad)">Twój limit: ${fmt(p.limitTydz, 0)} h/tydz.</text>`;
  $('lab').innerHTML = s;
  $('lablegend').innerHTML = LAB_GROUPS.map(
    g => `<span><i style="background:${C[g.id]}"></i>${g.l}</span>`
  ).join('');
  $('lab-sub').textContent =
    `Średnio ${fmt(r.tydzSr, 0)} h tygodniowo, w najcięższym miesiącu ok. ${fmt(r.tydzSzczyt, 0)} h. Rodzina ma ok. ${fmt(r.dostepne / 52, 0)} h tygodniowo.`;
  const HL = {
    krowy: 'Krowy: dojenie, mycie, wypas',
    ser: 'Serowarstwo',
    kury: 'Kury nieśne',
    brojlery: 'Kurczaki',
    gesi: 'Gęsi',
    kroliki: 'Króliki',
    owce: 'Owce',
    kozy: 'Kozy',
    swinie: 'Świnie',
    siano: 'Siano',
    zboza: 'Zboża',
    sprzedaz: 'Sprzedaż i dowozy',
    ogolne: 'Ogrodzenia, naprawy, papiery',
    ogrod: 'Sad i warzywnik dla domu',
    warzywa: 'Warzywa na sprzedaż',
    ule: 'Pszczoły',
    konie: 'Konie',
    bydlo: 'Bydło mięsne',
    miedzyplony: 'Międzyplony',
    wyleg: 'Własny wylęg i kogutki',
    kaczki: 'Kaczki',
    indyki: 'Indyki',
    perliczki: 'Perliczki',
    przetwory: 'Przetwórstwo i wysyłka',
    owoce: 'Owoce: zbiór, tłoczenie, sprzedaż',
    grzyby: 'Boczniaki na kłodach',
  };
  const entries = Object.entries(r.H)
    .filter(([k, v]) => v > 0.5)
    .sort((a, b) => b[1] - a[1]);
  let t = `<thead><tr><th>Zajęcie</th><th class="n">h/rok</th><th class="n">h/tydz.</th><th class="n">udział</th></tr></thead><tbody>`;
  for (const [k, v] of entries)
    t += `<tr><td>${HL[k]}</td><td class="n">${fmt(v, 0)}</td><td class="n">${fmt(v / 52, 1)}</td><td class="n">${fmt((v / r.godziny) * 100, 0)}%</td></tr>`;
  t += `<tr class="tot"><td>Razem</td><td class="n">${fmt(r.godziny, 0)}</td><td class="n">${fmt(r.tydzSr, 1)}</td><td class="n">100%</td></tr></tbody>`;
  $('t-lab').innerHTML = t;
}
