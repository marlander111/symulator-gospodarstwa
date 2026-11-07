// Panel „Pieniądze”: wykres od sprzedaży do wyniku, tabele przychodów, kosztów, dopłat i wartości dla domu.

function renderMoney(r) {
  // waterfall
  const S = r.przychod,
    D = r.doplaty,
    K = r.koszty,
    A = r.amort,
    N = r.netto;
  const top = Math.max(S + D, 1);
  const W = 640,
    H = 250,
    pl = 10,
    pr = 10,
    pt = 26,
    pb = 36;
  const ih = H - pt - pb;
  const minV = Math.min(0, N);
  const y = v => pt + ((top - v) / (top - minV)) * ih;
  const bars = [
    { l: 'Sprzedaż', a: 0, b: S, c: 'var(--accent)' },
    { l: 'Dopłaty', a: S, b: S + D, c: 'var(--c-pole)' },
    { l: 'Koszty', a: S + D, b: S + D - K, c: 'var(--bad)' },
    { l: 'Amortyzacja', a: S + D - K, b: N, c: 'var(--warn)' },
    { l: 'Na czysto', a: 0, b: N, c: N >= 0 ? 'var(--ok)' : 'var(--bad)' },
  ];
  const bw = (W - pl - pr) / bars.length;
  let s = `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(0)}" y2="${y(0)}"></line>`;
  bars.forEach((b, i) => {
    const x = pl + i * bw + bw * 0.18,
      w = bw * 0.64;
    const y1 = y(Math.max(b.a, b.b)),
      y2 = y(Math.min(b.a, b.b));
    const val = b.l === 'Koszty' ? -K : b.l === 'Amortyzacja' ? -A : b.b - b.a;
    s += `<rect x="${x}" y="${y1}" width="${w}" height="${Math.max(1, y2 - y1)}" fill="${b.c}" rx="2"><title>${b.l}: ${zl0(val)}</title></rect>`;
    if (i < bars.length - 1)
      s += `<line x1="${x + w}" x2="${x + bw}" y1="${y(b.b)}" y2="${y(b.b)}" stroke="var(--muted)" stroke-dasharray="3 3"></line>`;
    s += `<text x="${x + w / 2}" y="${y1 - 7}" text-anchor="middle" font-size="13" class="num">${val < 0 ? '−' : ''}${fmt(Math.abs(val) / 1000, 0)} tys.</text>`;
    s += `<text x="${x + w / 2}" y="${H - 12}" text-anchor="middle" class="ax">${b.l}</text>`;
  });
  $('wf').innerHTML = s;

  const RL = {
    mleko: 'Mleko surowe',
    ser: 'Sery',
    cieleta: 'Cielęta i krowy wybrakowane',
    jaja: 'Jaja (i stare kury)',
    brojlery: 'Kurczaki',
    gesi: 'Gęsi',
    kroliki: 'Króliki',
    owce: 'Jagnięta żywcem i owce wybrakowane',
    jagniecina: 'Jagnięcina (RHD)',
    warzywa: 'Warzywa (RWS, targ)',
    miod: 'Miód',
    kozy: 'Koźlęcina',
    swinie: 'Wieprzowina: tuczniki w paczkach',
    bydlo: 'Bydło mięsne: odsadki, opasy',
    kaczki: 'Kaczki',
    indyki: 'Indyki',
    perliczki: 'Perliczki',
    przetwory: 'Przetwory: półgęsek, wędliny (RHD)',
    koguty: 'Kogutki rosołowe (własny wylęg)',
    owoce: 'Owoce i sok',
    grzyby: 'Boczniaki z kłód',
  };
  const RD = {
    mleko: `${fmt(r.mlekoSwieze, 0)} l × ${fmt(p.cenaMleka, 2)} zł`,
    ser: `${fmt(r.serSprz, 0)} kg × ${fmt(p.cenaSera, 0)} zł`,
    cieleta: `${fmt(r.cieletaSprz, 1)} cieląt, ${fmt(r.remontKrow, 1)} krów`,
    jaja: `${fmt(r.jajaSprz, 0)} szt. × ${fmt(p.cenaJaja, 2)} zł`,
    brojlery: `${fmt(p.brojlery * 0.95, 0)} szt. × ${fmt(p.wagaTuszki, 1)} kg`,
    gesi: `${fmt(p.gesi * 0.9, 0)} szt.`,
    kroliki: `${fmt(p.kroliki * p.odchowKrol * 0.9, 0)} szt.`,
    owce: `${fmt(r.jagZyweN, 1)} jagniąt × ${fmt(p.cenaJag, 0)} zł`,
    jagniecina: `${fmt(r.jagMiesoN, 1)} jagniąt, ${fmt(r.miesoKg, 0)} kg tuszy × ${fmt(p.cenaMiesaJag, 0)} zł`,
    warzywa: `${fmt(p.warzywaSprz, 2)} ha × ${fmt(p.cenaWarzywHa, 0)} zł`,
    miod: `${fmt(r.rynek.miodKg, 0)} kg × ${fmt(p.cenaMiodu, 0)} zł`,
  };
  let t = `<thead><tr><th>Przychody</th><th class="n">zł/rok</th></tr></thead><tbody>`;
  for (const k in r.R)
    if (r.R[k] > 0.5)
      t += `<tr><td>${RL[k]}<br><span class="small muted">${RD[k]}</span></td><td class="n">${zl0(r.R[k])}</td></tr>`;
  t += `<tr class="tot"><td>Razem sprzedaż</td><td class="n">${zl0(r.przychod)}</td></tr></tbody>`;
  $('t-rev').innerHTML = t;

  const CL = {
    orne: 'Grunty orne',
    laka: 'Łąka',
    past: 'Pastwisko',
    krowy: 'Krowy i jałówki',
    mlekoOpak: 'Butelki, badania mleka',
    ser: 'Materiały do serów',
    kury: 'Kury: wymiana stada, minerały, wytłaczanki',
    brojlery: 'Kurczaki',
    gesi: 'Gęsi',
    kroliki: 'Króliki',
    owce: 'Owce',
    konie: 'Konie: kowal, weterynarz, minerały',
    dzierzawa: 'Czynsz dzierżawny',
    uboj: 'Ubój, rozbiór, dowóz do rzeźni',
    warzywa: 'Warzywa: nasiona, kompost, woda, opakowania',
    ule: 'Pszczoły: pokarm, leki, słoiki',
    kozy: 'Kozy',
    swinie: 'Świnie',
    stale: 'KRUS, ubezpieczenia, certyfikat',
    sprzedaz: 'Dowozy, targ',
    energia: 'Prąd i woda',
    dokup: 'Dokupione pasze i ściółka (trociny)',
    miedzyplony: 'Międzyplony: nasiona eko, siew',
    bydlo: 'Bydło mięsne: weterynarz, ubój',
    kaczki: 'Kaczki: pisklęta, ubój',
    indyki: 'Indyki: pisklęta, ubój',
    perliczki: 'Perliczki: pisklęta, ubój',
    przetwory: 'Przetwory: materiały i wysyłka',
    owoce: 'Owoce: tłocznia, opakowania',
    grzyby: 'Kłody: grzybnia, drewno',
  };
  t = `<thead><tr><th>Koszty</th><th class="n">zł/rok</th></tr></thead><tbody>`;
  for (const k in r.C)
    if (r.C[k] > 0.5)
      t += `<tr><td${k === 'dokup' ? ' class="neg"' : ''}>${CL[k]}</td><td class="n">${zl0(r.C[k])}</td></tr>`;
  t += `<tr><td>Amortyzacja inwestycji</td><td class="n">${zl0(r.amort)}</td></tr>`;
  t += `<tr class="tot"><td>Razem z amortyzacją</td><td class="n">${zl0(r.koszty + r.amort)}</td></tr></tbody>`;
  $('t-cost').innerHTML = t;

  const DL = {
    pwd: ['Podstawowe wsparcie dochodu', `${fmt(RATES.pwd, 2)} zł/ha`],
    redys: ['Płatność redystrybucyjna', `${fmt(RATES.redys, 2)} zł/ha`],
    krowy: ['Do krów', `${fmt(RATES.krowy, 2)} zł/szt.`],
    bydlo: ['Do młodego bydła', `${fmt(RATES.bydlo, 2)} zł/szt.`],
    owce: ['Do owiec', `${fmt(RATES.owce, 2)} zł/szt.`],
    kozy: ['Do kóz', `${fmt(RATES.kozy, 2)} zł/szt.`],
    eko: [
      'Rolnictwo ekologiczne',
      `TUZ ${fmt(RATES.ekoTUZ, 0)}, orne ${fmt(RATES.ekoOrne, 0)}, sad ${fmt(RATES.ekoSad, 0)}, warzywa ${fmt(RATES.ekoWarz, 0)} zł/ha`,
    ],
    premia: ['Premia za obsadę zwierząt', `${fmt(RATES.premia, 0)} zł/ha`],
    ekst: ['Ekstensywne TUZ', `${fmt(RATES.ekstTUZ, 2)} zł/ha`],
    mlody: ['Młody rolnik', `${fmt(RATES.mlody, 2)} zł/ha`],
    onw: ['ONW', `${fmt(p.onw, 0)} zł/ha`],
    dobrostan: ['Dobrostan zwierząt', 'stawki za 2024 r.: krowy, owce, kozy, kury'],
    wegiel: ['Rolnictwo węglowe: międzyplony, obornik, struktura upraw', `${fmt(p.wartPkt, 0)} zł/pkt`],
  };
  t = `<thead><tr><th>Dopłaty (${fmt(r.UR, 1)} ha)</th><th class="n">zł/rok</th></tr></thead><tbody>`;
  for (const k in r.Dp)
    if (r.Dp[k] > 0.5)
      t += `<tr><td>${DL[k][0]}<br><span class="small muted">${DL[k][1]}</span></td><td class="n">${zl0(r.Dp[k])}</td></tr>`;
  t += `<tr class="tot"><td>Razem dopłaty</td><td class="n">${zl0(r.doplaty)}</td></tr></tbody>`;
  $('t-dop').innerHTML = t;

  const HL = {
    swinie: `Wieprzowina (${fmt(p.swinie * 85, 0)} kg × 25 zł)`,
    barf: `Mięso dla psa z kóz (ok. ${fmt(r.barfKg, 0)} kg)`,
    jaja: 'Jaja dla domu',
    mleko: 'Mleko dla domu',
    ser: 'Ser dla domu',
    owoce: 'Owoce dla domu',
    grzyby: 'Grzyby dla domu',
  };
  t = `<thead><tr><th>Dla domu (nie gotówka)</th><th class="n">wartość</th></tr></thead><tbody>`;
  for (const k in r.home)
    if (r.home[k] > 0.5) t += `<tr><td>${HL[k]}</td><td class="n">${zl0(r.home[k])}</td></tr>`;
  t += `<tr class="tot"><td>Razem</td><td class="n">${zl0(r.homeTotal)}</td></tr></tbody>`;
  $('t-home').innerHTML = t;
}
