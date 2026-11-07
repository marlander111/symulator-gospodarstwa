// Panel „Ziemia i pasze”: pasek użytkowania ziemi i bilans pasz.

function renderLand(r) {
  const T = p.areaTotal + p.dzierzawa;
  const segs = [
    { l: 'Obejście, sad, warzywnik', v: p.obejscie, c: 'var(--obejscie)' },
    { l: 'Pastwisko', v: p.pastwisko, c: 'var(--past)' },
    { l: 'Łąka kośna', v: p.laka, c: 'var(--laka)' },
    { l: 'Koniczyna z trawami', v: r.koniczynaHa, c: 'var(--konicz)' },
    { l: 'Zboża i strączkowe', v: r.zbozeHa, c: 'var(--zboze)' },
    { l: 'Warzywa na sprzedaż', v: p.warzywaSprz, c: 'var(--c-reszta)' },
  ].filter(x => x.v > 0.001);
  const tot = Math.max(
    T,
    segs.reduce((a, s) => a + s.v, 0)
  );
  $('landbar').innerHTML = segs
    .map(
      s =>
        `<div style="width:${(s.v / tot) * 100}%;background:${s.c}" title="${esc(s.l)}: ${fmt(s.v, 1)} ha"></div>`
    )
    .join('');
  $('landlegend').innerHTML = segs
    .map(s => `<span><i style="background:${s.c}"></i>${esc(s.l)} <b>${fmt(s.v, 1)} ha</b></span>`)
    .join('');
}

function renderFeed(r) {
  const rows = [
    {
      l: 'Pastwisko',
      s: 'w sezonie wypasu',
      need: r.grazeNeed,
      sup: r.grazeSupply,
      c: 'var(--past)',
      u: 't s.m.',
    },
    {
      l: 'Siano na zimę',
      s: `${365 - p.dniWypasu} dni w wiacie`,
      need: r.hayNeed,
      sup: r.haySupply,
      c: 'var(--laka)',
      u: 't s.m.',
    },
    {
      l: 'Ziarno',
      s: 'kury, drób, świnie, owies',
      need: r.grainNeed,
      sup: r.grainSupply,
      c: 'var(--zboze)',
      u: 't',
    },
    { l: 'Słoma', s: 'ściółka', need: r.strawNeed, sup: r.strawSupply, c: 'var(--c-owce)', u: 't' },
  ];
  $('feed').innerHTML = rows
    .map(x => {
      const m = Math.max(x.need, x.sup, 0.01);
      const bal = x.sup - x.need;
      const cls = bal < -0.05 ? 'bad' : bal < x.need * 0.05 ? 'warn' : 'ok';
      return `<div class="frow"><div class="fl">${x.l}<span>${x.s}</span></div>
      <div class="fbars"><div class="fb need" style="width:${(x.need / m) * 100}%"></div><div class="fb" style="width:${(x.sup / m) * 100}%;background:${x.c}"></div>
      <div class="fnums"><span>potrzeba ${fmt(x.need, 1)} ${x.u}</span><span>z pól ${fmt(x.sup, 1)} ${x.u}</span></div></div>
      <div class="pill ${cls}">${bal >= 0 ? '+' : '−'}${fmt(Math.abs(bal), 1)} t</div></div>`;
    })
    .join('');
  const notes = [];
  if (r.hayFromPast > 0.1)
    notes.push(`Z nadwyżki pastwiska koszonej na siano: ok. ${fmt(r.hayFromPast, 1)} t s.m.`);
  if (r.serwatkaZast > 0.005)
    notes.push(`Serwatka z serowarni zastępuje ok. ${fmt(r.serwatkaZast * 1000, 0)} kg ziarna dla świń.`);
  notes.push(
    `Koszt własny: ziarno ok. ${fmt(r.grainCostT, 0)} zł/t, pasza objętościowa ok. ${fmt(r.forageCostT, 0)} zł/t s.m.`
  );
  $('feednote').textContent = notes.join(' ');
}
