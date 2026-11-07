// Plan rozmieszczenia (interaktywny), płodozmian, międzyplony i poplony.

// ---------- Miesiąc i rok płodozmianu (wspólne dla planu i kalendarza) ----------
const MN = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];
const MS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
let month = new Date().getMonth(),
  rotYear = 1,
  planSel = null,
  lastR = null;

const CROPS = {
  konicz: {
    l: 'Koniczyna czerwona z trawami',
    c: 'var(--konicz)',
    siew: 'Wsiewka w owies z grochem rok wcześniej',
    zbior: '2–3 pokosy: koniec V, VII, IX',
    naCo: 'Siano i sianokiszonka dla krów i owiec; azot dla następnych zbóż',
    m: [
      'spoczynek',
      'spoczynek',
      'rusza wegetacja',
      'rośnie',
      'I pokos pod koniec miesiąca',
      'odrasta',
      'II pokos',
      'odrasta',
      'III pokos lub wypas odrostów',
      'wypas odrostów; w ostatnim roku podorywka',
      'spoczynek',
      'spoczynek',
    ],
  },
  pszen: {
    l: 'Pszenżyto ozime',
    c: 'var(--zboze)',
    siew: 'Wrzesień, po obornik',
    zbior: 'Koniec lipca',
    naCo: 'Ziarno dla kur, gęsi i świń; słoma na ściółkę',
    m: [
      'zimuje',
      'zimuje',
      'rusza wegetacja',
      'krzewienie',
      'strzelanie w źdźbło',
      'kłoszenie',
      'żniwa pod koniec miesiąca',
      'ściernisko: gęsi, podorywka',
      'siew międzyplonu lub orka',
      '—',
      '—',
      '—',
    ],
  },
  zyto: {
    l: 'Żyto ozime',
    c: 'var(--zboze)',
    siew: 'Wrzesień',
    zbior: 'Lipiec',
    naCo: 'Ziarno i dużo słomy; dobre na słabszą glebę',
    m: [
      'zimuje',
      'zimuje',
      'rusza wegetacja',
      'krzewienie',
      'kłoszenie',
      'kwitnienie',
      'żniwa',
      'ściernisko, podorywka',
      'orka pod następną uprawę',
      '—',
      '—',
      '—',
    ],
  },
  miesz: {
    l: 'Mieszanka zbożowo-strączkowa',
    c: 'var(--zboze)',
    siew: 'Koniec marca – kwiecień',
    zbior: 'Sierpień',
    naCo: 'Białko dla kur (zamiast soi)',
    m: [
      '—',
      '—',
      'siew pod koniec miesiąca',
      'wschody',
      'rośnie',
      'kwitnie groch',
      'dojrzewa',
      'żniwa',
      'orka, siew oziminy',
      '—',
      '—',
      '—',
    ],
  },
  owies: {
    l: 'Owies z grochem i wsiewką koniczyny',
    c: 'var(--zboze)',
    siew: 'Koniec marca – kwiecień, z wsiewką',
    zbior: 'Sierpień',
    naCo: 'Białko dla kur, owies dla krów po porodzie; wsiewka staje się koniczyną',
    m: [
      '—',
      '—',
      'siew pod koniec miesiąca',
      'wschody, wsiewka koniczyny',
      'rośnie',
      'kwitnie groch',
      'dojrzewa',
      'żniwa; wsiewka zostaje',
      'koniczyna rośnie pod ścierniskiem',
      'koniczyna rośnie',
      'spoczynek',
      'spoczynek',
    ],
  },
};
function rotSeq() {
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
  for (let i = 0; i < k; i++) seq.push({ id: 'konicz', n: k > 1 ? `rok ${i + 1}` : '' });
  cer.forEach(id => seq.push({ id, n: '' }));
  return { L, k, c, seq };
}
const fieldCrop = (f, y, rs) => rs.seq[(f - 1 + (y - 1)) % rs.L];
const OZIME = ['pszen', 'zyto'];
const MIX = [
  { l: 'Żyto z wyką kosmatą', k: 400, pasza: 1.0 },
  { l: 'Mieszanka landsberska', k: 550, pasza: 2.5, pozno: true },
  { l: 'Facelia, gryka z żytem', k: 350, pasza: 0.5 },
  { l: 'Rzepik ozimy z żytem', k: 300, pasza: 2.0 },
  { l: 'Mieszanka wielogatunkowa z żytem', k: 600, pasza: 1.0 },
  { l: 'Pszenżyto z peluszką ozimą', k: 450, pasza: 2.5, pozno: true },
];
const SCMIX = [
  { l: 'Gorczyca biała', k: 150, pasza: 0.3 },
  { l: 'Facelia z gryką', k: 250, pasza: 0.2 },
  { l: 'Owies z wyką jarą i grochem', k: 350, pasza: 1.5 },
];
const scL = () => SCMIX[p.scMix || 0].l.toLowerCase();
const mixL = () => MIX[p.mpMix || 0].l.toLowerCase();
function fieldStatus(f, y, m, rs) {
  const cr = fieldCrop(f, y, rs),
    nx = fieldCrop(f, y + 1, rs),
    pv = fieldCrop(f, y - 1 + rs.L, rs);
  const mpPrev = pv.id !== 'konicz' && pv.id !== 'owies' && (cr.id === 'owies' || cr.id === 'miesz');
  if (mpPrev && m <= 2)
    return p.miedzyplony
      ? [
          'międzyplon zimuje (nie ruszać do 15 II)',
          'od 15 II wypas owiec lub mulcz',
          'przyoranie międzyplonu, siew pod koniec miesiąca',
        ][m]
      : CROPS[cr.id].m[m];
  if (m >= 7 && cr.id !== 'konicz' && cr.id !== 'owies' && (nx.id === 'owies' || nx.id === 'miesz'))
    return p.miedzyplony
      ? [
          `żniwa, potem siew międzyplonu (${mixL()})`,
          'siew międzyplonu do 1 października',
          'międzyplon rośnie, wypas owiec',
          'międzyplon zimuje',
          'międzyplon zimuje',
        ][m - 7]
      : ['po żniwach', 'ściernisko lub międzyplon', 'orka zimowa', 'spoczynek', 'spoczynek'][m - 7];
  if (m >= 7 && m <= 8 && p.poplonScier && cr.id !== 'konicz' && cr.id !== 'owies' && OZIME.includes(nx.id))
    return [
      `żniwa, od razu poplon ścierniskowy (${scL()})`,
      `${(p.scMix || 0) === 2 ? 'pokos lub wypas poplonu, potem przyoranie' : 'przyoranie poplonu'}, siew: ${CROPS[nx.id].l.toLowerCase()}`,
    ][m - 7];
  if (m >= 7 && cr.id !== 'konicz' && cr.id !== 'owies' && OZIME.includes(nx.id))
    return [
      'po żniwach: obornik, orka',
      `siew: ${CROPS[nx.id].l.toLowerCase()}`,
      `${CROPS[nx.id].l.toLowerCase()}: wschody`,
      `${CROPS[nx.id].l.toLowerCase()} zimuje`,
      `${CROPS[nx.id].l.toLowerCase()} zimuje`,
    ][m - 7];
  if (m >= 8 && cr.id === 'konicz' && OZIME.includes(nx.id))
    return [
      'podorywka, obornik',
      `siew: ${CROPS[nx.id].l.toLowerCase()}`,
      `${CROPS[nx.id].l.toLowerCase()}: wschody`,
      `${CROPS[nx.id].l.toLowerCase()} zimuje`,
    ][m - 8];
  if (m >= 8 && cr.id !== 'konicz' && cr.id !== 'owies' && !OZIME.includes(nx.id))
    return ['ściernisko, międzyplon', 'orka zimowa', 'orka zimowa, spoczynek', 'spoczynek'][m - 8];
  return CROPS[cr.id].m[m];
}

function buildPlanCtl() {
  $('plan-mon').innerHTML =
    `<span class="lab">Miesiąc:</span>` +
    MS.map(
      (m, i) => `<button class="btn" type="button" data-mon="${i}" aria-label="${MN[i]}">${m}</button>`
    ).join('');
  $('plan-mon').addEventListener('click', e => {
    const b = e.target.closest('[data-mon]');
    if (b) {
      month = +b.dataset.mon;
      renderPlan(lastR);
      renderCal(lastR);
    }
  });
  $('plan-year').addEventListener('click', e => {
    const b = e.target.closest('[data-yr]');
    if (b) {
      rotYear = +b.dataset.yr;
      renderPlan(lastR);
      renderRot(lastR);
    }
  });
  $('rot-note').addEventListener('click', e => {
    const f = e.target.closest('[data-fit]');
    if (f) {
      p.zbozaUdzial = +f.dataset.fit;
      syncInputs();
      changed();
    }
  });
  $('rot-ctl').addEventListener('click', e => {
    const b = e.target.closest('[data-len]');
    if (b) {
      p.plodLat = +b.dataset.len;
      syncInputs();
      changed();
      return;
    }
    const mp = e.target.closest('[data-mp]');
    if (mp) {
      p.miedzyplony = mp.dataset.mp === '1';
      syncInputs();
      changed();
      return;
    }
    const mx = e.target.closest('[data-mix]');
    if (mx) {
      const i = +mx.dataset.mix;
      p.mpMix = i;
      p.kMiedzyplon = MIX[i].k;
      p.paszaMiedzyplon = MIX[i].pasza;
      syncInputs();
      changed();
      return;
    }
    const sm = e.target.closest('[data-scmix]');
    if (sm) {
      const i = +sm.dataset.scmix;
      p.scMix = i;
      p.kPoplon = SCMIX[i].k;
      p.paszaPoplon = SCMIX[i].pasza;
      syncInputs();
      changed();
      return;
    }
    const sc = e.target.closest('[data-sc]');
    if (sc) {
      p.poplonScier = sc.dataset.sc === '1';
      syncInputs();
      changed();
      return;
    }
    const f = e.target.closest('[data-fit]');
    if (f) {
      p.zbozaUdzial = +f.dataset.fit;
      syncInputs();
      changed();
    }
  });
  $('t-rot').addEventListener('click', e => {
    const b = e.target.closest('[data-yr]');
    if (b) {
      rotYear = +b.dataset.yr;
      renderPlan(lastR);
      renderRot(lastR);
    }
  });
  $('plansvg').addEventListener('click', e => {
    const g = e.target.closest('[data-a]');
    if (g) {
      planSel = g.dataset.a;
      renderPlan(lastR);
    }
  });
  $('t-cal').addEventListener('click', e => {
    const tr = e.target.closest('[data-m]');
    if (tr) {
      month = +tr.dataset.m;
      renderPlan(lastR);
      renderCal(lastR);
    }
  });
}

const grazing = m => m >= 3 && m <= 9;
function planInfo(r, a) {
  const rs = rotSeq(),
    m = month,
    out = [];
  if (a === 'past') {
    out.push(`<h3>Pastwisko · ${fmt(p.pastwisko, 1)} ha</h3>`);
    if (grazing(m)) {
      out.push(
        `<p>${MN[m]}: wypas rotacyjny. ${p.krowy ? `Krowy (${p.krowy}) zmieniają kwaterę co 1–2 dni. ` : ''}${p.mamki ? `Mamki z cielętami (${p.mamki}) idą osobną grupą. ` : ''}${p.owce ? `Owce dzień po krowach. ` : ''}${p.kury ? `Mobilny kurnik 3–4 dni po krowach. ` : ''}${p.brojlery && m >= 4 && m <= 9 ? `Zagrody z kurczakami przesuwane codziennie. ` : ''}</p>`
      );
      out.push(`<p class="small muted">Każda kwatera odpoczywa 30–40 dni, w suszy dłużej.</p>`);
    } else
      out.push(
        `<p>${MN[m]}: zwierzęta w wiatach i przy obejściu, pastwisko odpoczywa. ${m === 2 ? 'Pod koniec miesiąca wapnowanie lub nawożenie według badania gleby.' : ''}</p>`
      );
  } else if (a === 'laka') {
    const t = [
      'spoczynek',
      'spoczynek',
      'wałowanie, bronowanie',
      'rośnie',
      'rośnie, kwitnienie traw',
      'I pokos na siano',
      'odrasta',
      'II pokos',
      'wypas odrostów',
      'wypas odrostów',
      'spoczynek',
      'spoczynek',
    ][m];
    out.push(
      `<h3>Łąka kośna · ${fmt(p.laka, 1)} ha</h3><p>${MN[m]}: ${t}.</p><p class="small muted">Siano z łąki ok. ${fmt(r.lakaHay, 1)} t s.m. rocznie.</p>`
    );
  } else if (a && a.startsWith('pole')) {
    const f = +a.slice(4),
      cr = fieldCrop(f, rotYear, rs),
      C = CROPS[cr.id];
    out.push(
      `<h3>Pole ${f} · ${fmt(r.orneEff / rs.L, 2)} ha</h3><p><b>Rok ${rotYear}: ${C.l}${cr.n ? ` (${cr.n})` : ''}</b></p><p>${MN[m]}: ${fieldStatus(f, rotYear, m, rs)}.</p><p class="small">Siew: ${C.siew}. Zbiór: ${C.zbior}. ${C.naCo}.</p>`
    );
    const nxt = fieldCrop(f, rotYear + 1, rs);
    out.push(`<p class="small muted">W następnym roku: ${CROPS[nxt.id].l}${nxt.n ? ` (${nxt.n})` : ''}.</p>`);
  } else if (a === 'warz') {
    out.push(
      `<h3>Warzywa na sprzedaż · ${fmt(p.warzywaSprz, 2)} ha</h3><p>${MN[m]}: ${['plan upraw, zamówienie nasion', 'rozsada w tunelu', 'rozsada, pierwsze siewy', 'sadzenie, siewy', 'pierwsze zbiory, koszyki RWS', 'zbiory, pielenie', 'pełnia zbiorów', 'pełnia zbiorów', 'zbiory, przechowalnia', 'ostatnie zbiory, ściółkowanie', 'tunel: zimowe sałaty', 'odpoczynek, rozliczenie'][m]}.</p>`
    );
  } else {
    out.push(
      `<h3>Obejście · ${fmt(p.obejscie, 1)} ha</h3><p>${MN[m]}: ${grazing(m) ? 'krowy przychodzą do dojenia, młode zwierzęta przy zagrodach.' : 'zwierzęta w wiatach na głębokiej ściółce' + (p.tunelZima ? ', kury w tunelu foliowym' : ', kury w kurnikach przy obejściu') + '.'} ${p.owce ? 'Owce na noc w zagrodzie (wilki).' : ''}</p><p class="small muted">Sad ${fmt(r.sad, 1)} ha${p.gesi ? ' z gęsiami' : ''}, warzywnik ${fmt(p.warzywnik, 2)} ha.</p>`
    );
  }
  return out.join('');
}

function renderPlan(r) {
  if (!r) return;
  lastR = r;
  const rs = rotSeq();
  if (rotYear > rs.L) rotYear = 1;
  document.querySelectorAll('[data-mon]').forEach(b => b.classList.toggle('on', +b.dataset.mon === month));
  $('plan-year').innerHTML =
    `<span class="lab">Rok płodozmianu:</span>` +
    Array.from(
      { length: rs.L },
      (_, i) =>
        `<button class="btn${i + 1 === rotYear ? ' on' : ''}" type="button" data-yr="${i + 1}">${i + 1}</button>`
    ).join('');
  const W = 1000,
    H = 540,
    pad = 14;
  const parts = [
    { k: 'obejscie', v: p.obejscie },
    { k: 'past', v: p.pastwisko },
    { k: 'laka', v: p.laka },
    { k: 'orne', v: r.orneEff + p.warzywaSprz },
  ].filter(x => x.v > 0.01);
  const minW = 130,
    avail = W - 2 * pad - (parts.length - 1) * 8,
    tot = parts.reduce((a, x) => a + x.v, 0) || 1;
  let widths = parts.map(x => Math.max(minW, (x.v / tot) * avail));
  const over = widths.reduce((a, b) => a + b, 0) - avail;
  if (over > 0) {
    const big = widths.map(w => Math.max(0, w - minW));
    const bs = big.reduce((a, b) => a + b, 0) || 1;
    widths = widths.map((w, i) => w - (over * big[i]) / bs);
  }
  let x = pad;
  const top = 40,
    h = H - top - pad;
  const sel = k => (planSel === k ? 'stroke-width="3" stroke="var(--ink)"' : '');
  let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="var(--surface)"></rect>`;
  s += `<line x1="${pad}" x2="${W - pad}" y1="22" y2="22" stroke="var(--muted)" stroke-width="2" stroke-dasharray="10 6"></line><text x="${pad}" y="15" class="ax">droga dojazdowa · ${MN[month].toLowerCase()}</text>`;
  const txt = (cx, cy, t, size = 12, bold = false) =>
    `<text x="${cx}" y="${cy}" text-anchor="middle" font-size="${size}" ${bold ? 'font-weight="700"' : ''} pointer-events="none">${esc(t)}</text>`;
  parts.forEach((part, i) => {
    const w = widths[i];
    if (part.k === 'obejscie') {
      s += `<g data-a="obejscie"><rect x="${x}" y="${top}" width="${w}" height="${h}" fill="var(--obejscie)" opacity=".18" stroke="var(--obejscie)" ${sel('obejscie')}></rect>`;
      const bx = x + 8,
        bw = w - 16,
        zima = !grazing(month);
      const blocks = [
        { l: 'Dom, podwórze', hh: 0.12 },
        { l: 'Stara obora:|dojarnia, serownia', hh: 0.14, on: p.krowy > 0 },
        {
          l: zima ? 'Wiata: bydło|(teraz w środku)' : 'Wiata: bydło|(puste, na pastwisku)',
          hh: 0.14,
          on: p.krowy + p.mamki > 0,
          hi: zima,
        },
        {
          l: zima ? 'Wiata: owce, kozy|(teraz w środku)' : 'Wiata: owce, kozy',
          hh: 0.1,
          on: p.owce + p.kozy > 0,
          hi: zima,
        },
        {
          l: p.tunelZima
            ? zima
              ? 'Tunel: kury zimą|(teraz w środku)'
              : 'Tunel: warzywa'
            : zima
              ? 'Kurniki zimą|(teraz tutaj)'
              : 'Miejsce kurników zimą',
          hh: 0.09,
          on: p.kury > 0,
          hi: zima,
        },
        { l: `Sad${p.gesi ? ' z gęsiami' : ''}|${fmt(r.sad, 1)} ha`, hh: 0.18, c: 'var(--past)' },
        { l: `Warzywnik|${fmt(p.warzywnik, 2)} ha`, hh: 0.09, c: 'var(--zboze)' },
      ].filter(b => b.on !== false);
      const sumh = blocks.reduce((a, b) => a + b.hh, 0);
      let by = top + 8;
      blocks.forEach(b => {
        const bh = ((h - 16 - (blocks.length - 1) * 6) * b.hh) / sumh;
        s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="3" fill="${b.c || (b.hi ? 'var(--c-krowy)' : 'var(--surface)')}" opacity="${b.c ? 0.35 : b.hi ? 0.3 : 1}" stroke="var(--obejscie)"></rect>`;
        const ls = b.l.split('|');
        ls.forEach(
          (ln, li) => (s += txt(bx + bw / 2, by + bh / 2 + 4 + (li - (ls.length - 1) / 2) * 14, ln))
        );
        by += bh + 6;
      });
      s += `<text x="${x + w / 2}" y="${top - 6}" text-anchor="middle" class="ax">Obejście ${fmt(p.obejscie, 1)} ha</text></g>`;
    }
    if (part.k === 'past') {
      s += `<g data-a="past"><rect x="${x}" y="${top}" width="${w}" height="${h}" fill="var(--past)" opacity=".22" stroke="var(--past)" ${sel('past')}></rect>`;
      const lane = 16,
        rows = 10,
        cw = (w - lane) / 2,
        rh = h / rows,
        n = rows * 2;
      const g = grazing(month),
        pos = ((month - 3) * 3 + 2) % n;
      const st = {};
      if (g) {
        if (p.krowy) st[pos] = 'krowy';
        if (p.krowy) st[(pos + 1) % n] = 'jutro';
        if (p.owce) st[(pos - 1 + n) % n] = 'owce';
        if (p.kury) st[(pos - 3 + n) % n] = 'kury';
        if (p.mamki) st[(pos + 10) % n] = 'mamki';
        if (!p.krowy && p.owce) st[pos] = 'owce';
      }
      for (let side = 0; side < 2; side++)
        for (let rr = 0; rr < rows; rr++) {
          const idx = side ? n - 1 - rr : rr;
          const px = x + (side ? (w + lane) / 2 : 0),
            py = top + rr * rh,
            k = st[idx];
          const fill =
            {
              krowy: 'var(--c-krowy)',
              mamki: 'var(--c-krowy)',
              owce: 'var(--c-owce)',
              kury: 'var(--c-drob)',
              jutro: 'var(--past)',
            }[k] || 'none';
          s += `<rect x="${px + 2}" y="${py + 2}" width="${cw - 4}" height="${rh - 4}" fill="${fill}" opacity="${k === 'krowy' || k === 'mamki' ? 0.5 : k ? 0.32 : 1}" stroke="var(--past)" stroke-width="1"></rect>`;
          const t = {
            krowy: 'krowy dziś',
            jutro: 'krowy jutro',
            owce: p.krowy ? 'owce: dzień po krowach' : 'owce dziś',
            kury: 'kury: 3 dni po krowach',
            mamki: 'mamki z cielętami',
          }[k];
          if (t) s += txt(px + cw / 2, py + rh / 2 + 4, t, 11.5, k === 'krowy');
        }
      s += `<rect x="${x + (w - lane) / 2}" y="${top}" width="${lane}" height="${h}" fill="var(--surface)" stroke="var(--past)"></rect>`;
      s += `<line x1="${x + w / 2}" x2="${x + w / 2}" y1="${top + 4}" y2="${top + h - 4}" stroke="var(--info)" stroke-width="2.5" stroke-dasharray="2 5"></line>`;
      if (!g)
        s +=
          `<rect x="${x + 20}" y="${top + h / 2 - 24}" width="${w - 40}" height="48" rx="6" fill="var(--surface)" opacity=".92"></rect>` +
          txt(x + w / 2, top + h / 2 - 3, 'Zima: pastwisko odpoczywa', 13, true) +
          txt(x + w / 2, top + h / 2 + 15, 'wypas od ok. 20 IV do końca X', 11.5);
      s += `<text x="${x + w / 2}" y="${top - 6}" text-anchor="middle" class="ax">Pastwisko ${fmt(p.pastwisko, 1)} ha · ${n} kwater po ok. ${fmt(p.pastwisko / n, 2)} ha</text></g>`;
    }
    if (part.k === 'laka') {
      const st = [
        'spoczynek',
        'spoczynek',
        'wałowanie',
        'rośnie',
        'rośnie',
        'I pokos: siano',
        'odrasta',
        'II pokos',
        'wypas odrostów',
        'wypas odrostów',
        'spoczynek',
        'spoczynek',
      ][month];
      s += `<g data-a="laka"><rect x="${x}" y="${top}" width="${w}" height="${h}" fill="var(--laka)" opacity="${month === 5 || month === 7 ? 0.55 : 0.3}" stroke="var(--laka)" ${sel('laka')}></rect>`;
      for (let yy = top + 14; yy < top + h; yy += 14)
        s += `<line x1="${x + 6}" x2="${x + w - 6}" y1="${yy}" y2="${yy}" stroke="var(--laka)" stroke-width="1" opacity=".6"></line>`;
      s +=
        `<rect x="${x + 10}" y="${top + h / 2 - 26}" width="${w - 20}" height="44" rx="6" fill="var(--surface)" opacity=".9"></rect>` +
        txt(x + w / 2, top + h / 2 - 8, 'Łąka kośna', 14, true) +
        txt(x + w / 2, top + h / 2 + 9, st, 12);
      s += `<text x="${x + w / 2}" y="${top - 6}" text-anchor="middle" class="ax">Łąka ${fmt(p.laka, 1)} ha</text></g>`;
    }
    if (part.k === 'orne') {
      const fr = [];
      for (let f = 1; f <= rs.L; f++) {
        const cr = fieldCrop(f, rotYear, rs);
        fr.push({
          a: 'pole' + f,
          l: `Pole ${f}: ${CROPS[cr.id].l}${cr.n ? ` (${cr.n})` : ''}`,
          sub: `${fmt(r.orneEff / rs.L, 2)} ha · ${fieldStatus(f, rotYear, month, rs)}`,
          v: r.orneEff / rs.L,
          c: CROPS[cr.id].c,
        });
      }
      if (p.warzywaSprz > 0.01)
        fr.push({
          a: 'warz',
          l: 'Warzywa na sprzedaż i tunel',
          sub: `${fmt(p.warzywaSprz, 2)} ha`,
          v: p.warzywaSprz,
          c: 'var(--c-warz)',
        });
      const tt = fr.reduce((a, f) => a + f.v, 0) || 1;
      let yy = top;
      let hs = fr.map(f => Math.max(54, (h * f.v) / tt));
      const hsum = hs.reduce((a, b) => a + b, 0);
      hs = hs.map(v => (v * h) / hsum);
      fr.forEach((f, j) => {
        const hh2 = hs[j];
        s += `<g data-a="${f.a}"><rect x="${x}" y="${yy}" width="${w}" height="${hh2}" fill="${f.c}" opacity="${j % 2 ? 0.42 : 0.3}" stroke="${f.c}" ${sel(f.a)}></rect>`;
        s +=
          txt(x + w / 2, yy + hh2 / 2 - 4, f.l, 12.5, true) +
          txt(x + w / 2, yy + hh2 / 2 + 13, f.sub, 11.5) +
          `</g>`;
        yy += hh2;
      });
      s += `<text x="${x + w / 2}" y="${top - 6}" text-anchor="middle" class="ax">Grunty orne ${fmt(r.orneEff + p.warzywaSprz, 1)} ha · rok ${rotYear} płodozmianu</text>`;
    }
    x += w + 8;
  });
  $('plansvg').innerHTML = s;
  $('plan-info').innerHTML = planInfo(r, planSel || 'past');
}

function renderRot(r) {
  if (!r) return;
  const rs = rotSeq(),
    ha = r.orneEff / rs.L;
  $('rot-ctl').innerHTML =
    `<span class="lab">Liczba pól:</span>` +
    [3, 4, 5, 6]
      .map(L => `<button class="btn${L === rs.L ? ' on' : ''}" type="button" data-len="${L}">${L}</button>`)
      .join('') +
    `<span class="lab" style="margin-left:10px">Koniczyna ${rs.k} ${rs.k === 1 ? 'rok' : 'lata'}, zboża ${rs.c} ${rs.c === 1 ? 'rok' : rs.c < 5 ? 'lata' : 'lat'}</span>` +
    `<span style="flex-basis:100%"></span><span class="lab">Międzyplony ozime (ekoschemat):</span><button class="btn${!p.miedzyplony ? ' on' : ''}" type="button" data-mp="0">nie</button><button class="btn${p.miedzyplony ? ' on' : ''}" type="button" data-mp="1">tak</button>` +
    (p.miedzyplony
      ? `<span class="lab" style="margin-left:10px">Mieszanka:</span>` +
        MIX.map(
          (x, i) =>
            `<button class="btn${(p.mpMix || 0) === i ? ' on' : ''}" type="button" data-mix="${i}">${x.l}</button>`
        ).join('')
      : '') +
    `<span style="flex-basis:100%"></span><span class="lab">Poplon ścierniskowy przed oziminą:</span><button class="btn${!p.poplonScier ? ' on' : ''}" type="button" data-sc="0">nie</button><button class="btn${p.poplonScier ? ' on' : ''}" type="button" data-sc="1">tak</button>` +
    (p.poplonScier
      ? `<span class="lab" style="margin-left:10px">Mieszanka:</span>` +
        SCMIX.map(
          (x, i) =>
            `<button class="btn${(p.scMix || 0) === i ? ' on' : ''}" type="button" data-scmix="${i}">${x.l}</button>`
        ).join('')
      : '');
  let t =
    `<thead><tr><th>Pole (${fmt(ha, 2)} ha)</th>` +
    Array.from(
      { length: rs.L },
      (_, y) =>
        `<th class="${y + 1 === rotYear ? 'sel' : ''}"><button type="button" data-yr="${y + 1}">Rok ${y + 1}</button></th>`
    ).join('') +
    `</tr></thead><tbody>`;
  for (let f = 1; f <= rs.L; f++) {
    t += `<tr><td><b>Pole ${f}</b></td>`;
    for (let y = 1; y <= rs.L; y++) {
      const cr = fieldCrop(f, y, rs),
        nx = fieldCrop(f, y + 1, rs);
      let mp = '';
      if (cr.id !== 'konicz' && cr.id !== 'owies' && (nx.id === 'owies' || nx.id === 'miesz'))
        mp = `<span class="mp${p.miedzyplony ? ' on' : ''}">${p.miedzyplony ? '+ międzyplon: ' + mixL() : 'miejsce na międzyplon'}</span>`;
      if (cr.id !== 'konicz' && cr.id !== 'owies' && OZIME.includes(nx.id))
        mp = `<span class="mp${p.poplonScier ? ' on' : ''}">${p.poplonScier ? '+ poplon ścierniskowy' : 'miejsce na poplon ścierniskowy'}</span>`;
      if (cr.id === 'owies')
        mp = `<span class="mp${p.miedzyplony ? ' on' : ''}">+ wsiewka koniczyny${p.miedzyplony ? ' (5 pkt)' : ''}</span>`;
      t += `<td class="crop${y === rotYear ? ' sel' : ''}" style="border-left-color:${CROPS[cr.id].c}">${esc(CROPS[cr.id].l)}${cr.n ? ` <span class="muted">(${cr.n})</span>` : ''}${mp}</td>`;
    }
    t += `</tr>`;
  }
  $('t-rot').innerHTML = t + `</tbody>`;
  const real = Math.round((rs.c / rs.L) * 100);
  $('rot-note').innerHTML =
    `Co roku: ${fmt(rs.k * ha, 2)} ha koniczyny i ${fmt(rs.c * ha, 2)} ha zbóż. Ten płodozmian to ${real}% zbóż, a suwak „Zboża na gruntach ornych” stoi na ${p.zbozaUdzial}%.` +
    (Math.abs(real - p.zbozaUdzial) >= 3
      ? ` <button class="btn" type="button" data-fit="${real}">Ustaw suwak na ${real}%</button>`
      : '');
  const w = r.wegiel;
  $('mp-sum').innerHTML = `<h3>Twój płodozmian a ekoschemat</h3><ul>
    <li>Międzyplon ozimy możliwy co roku na ${fmt(w.rot.mp * w.fieldHa, 2)} ha, wsiewka w owies na ${fmt(w.rot.ws * w.fieldHa, 2)} ha.</li>
    <li>Punkty: ${fmt(w.pktSum, 1)} (międzyplony ${fmt(w.pktMp, 1)}, obornik ${fmt(w.pktOb, 1)}, struktura ${fmt(w.pktSt, 1)}, ekstensywne TUZ ${fmt(w.pktEkst, 1)}). Próg: ${fmt(w.pktMin, 1)} pkt.</li>
    <li>Płatność za międzyplony, obornik i strukturę: <b>${zl(r.Dp.wegiel)}</b> rocznie${r.Dp.wegiel === 0 && (p.miedzyplony || p.wegObornik || p.wegStruktura) ? ' (poniżej progu)' : ''}${!p.miedzyplony ? '. Włącz międzyplony w grupie „Dopłaty”, żeby je policzyć' : ''}.</li>
    <li>Koszt międzyplonów${p.poplonScier ? ' i poplonów' : ''}: ${zl(r.C.miedzyplony || 0)} rocznie; pasza z wypasu: ok. ${fmt(w.mpPasza, 1)} t s.m.${w.scHa > 0 ? ` Poplon ścierniskowy: ${fmt(w.scHa, 2)} ha.` : ''}</li>
    <li>Zróżnicowana struktura upraw: ${w.rot.strukturaOk ? 'Twój płodozmian spełnia wymogi.' : `nie spełnia (zboża ${Math.round(w.rot.cerShare * 100)}%, a wymóg to najwyżej 65%; np. 5 pól i suwak zbóż na 60%, czyli 2 lata koniczyny).`}</li></ul>`;
  const nm = {
      konicz: 'koniczynie',
      pszen: 'pszenżycie',
      zyto: 'życie',
      miesz: 'mieszance',
      owies: 'owsie z grochem',
    },
    nn = {
      konicz: 'koniczyną',
      pszen: 'pszenżytem',
      zyto: 'żytem',
      miesz: 'mieszanką',
      owies: 'owsem z grochem',
    };
  const rows = rs.seq
    .map((x, i) => {
      const a = x.id,
        b = rs.seq[(i + 1) % rs.L].id;
      if (a === 'owies')
        return `<li>W owsie z grochem: <b>wsiewka koniczyny</b>, która zostaje jako pole koniczyny.</li>`;
      if (a === 'konicz')
        return b === 'konicz'
          ? ''
          : `<li>Po koniczynie przed ${nn[b]}: bez międzyplonu; koniczynę przyorz z obornikiem.</li>`;
      if (b === 'owies' || b === 'miesz')
        return `<li>Po ${nm[a]} przed ${nn[b]}: <b>międzyplon ozimy</b>, ${p.miedzyplony ? mixL() : 'najlepiej żyto z wyką kosmatą'}.${p.miedzyplony && MIX[p.mpMix || 0].pozno ? ` Uwaga: ${mixL()} daje pokos dopiero w maju, a owies sieje się w marcu–kwietniu. Przed owsem lepsze żyto z wyką albo rzepik z żytem.` : ''}</li>`;
      return p.poplonScier
        ? `<li>Po ${nm[a]} przed ${nn[b]}: <b>poplon ścierniskowy</b> (${scL()}) zaraz po żniwach, przyorany przed siewem oziminy. Bez dopłaty, ale poprawia glebę.</li>`
        : `<li>Po ${nm[a]} przed ${nn[b]}: na międzyplon ozimy nie ma miejsca. Możliwy krótki poplon ścierniskowy albo wymieszanie słomy z glebą.</li>`;
    })
    .filter(Boolean);
  $('mp-where').innerHTML = `<h3>Gdzie w płodozmianie</h3><ul>${rows.join('')}</ul>`;
  const used = [...new Set(rs.seq.map(x => x.id))];
  $('t-crops').innerHTML =
    `<thead><tr><th>Uprawa</th><th>Siew</th><th>Zbiór</th><th>Na co</th></tr></thead><tbody>` +
    used
      .map(
        id =>
          `<tr><td><b>${CROPS[id].l}</b></td><td>${CROPS[id].siew}</td><td>${CROPS[id].zbior}</td><td>${CROPS[id].naCo}</td></tr>`
      )
      .join('') +
    `</tbody>`;
}
