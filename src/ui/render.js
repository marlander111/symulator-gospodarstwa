// Główna pętla odświeżania: liczy model i rysuje wszystkie panele.

// ---------- Render ----------
let raf = 0;
let viewG = false;
function changed() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    render();
    try {
      localStorage.setItem(LS, JSON.stringify(p));
    } catch (e) {}
  });
}

function render() {
  const r = compute(viewG ? gorzej(p) : p);
  markPresets();
  // pasek
  $('k-net').textContent = zl(r.netto);
  const ro = compute(gorzej(p));
  $('k-net').classList.toggle('neg', r.netto < 0);
  $('k-nets').textContent = `na rękę średnio ${zl(r.netto / 12)} miesięcznie`;
  $('k-h').textContent = fmt(r.godziny, 0) + ' h';
  $('k-hs').textContent =
    `śr. ${fmt(r.godziny / 52, 0)} h/tydz., ${fmt(r.godziny / 365, 1)} h/dzień; szczyt ${fmt(ro.tydzSzczyt, 0)} z ${fmt(p.limitTydz, 0)} h/tydz.`;
  $('k-rev').textContent = zl(r.przychod + r.doplaty);
  $('k-revs').title = 'Koszty razem z amortyzacją. Dochód = przychód (ze sprzedaży i dopłat) minus koszty.';
  $('k-revs').textContent = `dopłaty ${zl(r.doplaty)} · koszty ${zl(r.koszty + r.amort)}`;
  $('k-hs').style.color = r.util > 1 || ro.tydzSzczyt > p.limitTydz ? 'var(--bad)' : '';
  $('k-ost').textContent = zl(ro.netto);
  $('k-ost').style.color = ro.netto >= celEff(p) ? 'var(--ok)' : 'var(--bad)';
  $('k-osts').textContent =
    ro.netto >= celEff(p)
      ? `powyżej celu ${fmt(celEff(p) / 1000, 0)} tys.`
      : `poniżej celu ${fmt(celEff(p) / 1000, 0)} tys.`;
  $('k-cap').textContent = zl(r.capex);
  $('k-caps').textContent = `${zl(r.amort)} rocznie`;
  const feedOk = r.grainBal >= -0.05 && r.hayBal >= -0.05 && r.strawBal >= -0.05;
  const fb = [
    ['siano', r.hayBal],
    ['ziarno', r.grainBal],
    ['słoma', r.strawBal],
  ];
  if (r.grazeSurplus < -0.05) fb.push(['pastwisko', r.grazeSurplus]);
  const sg = v => (v >= 0 ? '+' : '−') + fmt(Math.abs(v), 1);
  if (feedOk) {
    const need = r.hayNeed + r.grainNeed + r.strawNeed,
      sup = r.haySupply + r.grainSupply + r.strawSupply;
    $('k-feed').textContent = `nadwyżka ${fmt(Math.max(0, ((sup - need) / Math.max(0.1, need)) * 100), 0)}%`;
    $('k-feeds').textContent =
      'zapas: ' +
      fb.map(([l, v]) => `${l} ${fmt(Math.max(0, v), 1)}`).join(', ') +
      ' t' +
      (r.trocinyT > 0.05 ? `; trociny ${fmt(r.trocinyT, 1)} t` : '');
  } else {
    const def = fb.filter(([, v]) => v < -0.05);
    $('k-feed').textContent = `brakuje ${fmt(
      def.reduce((a, [, v]) => a - v, 0),
      1
    )} t`;
    $('k-feeds').textContent =
      'brak: ' +
      def.map(([l, v]) => `${l} ${fmt(-v, 1)}`).join(', ') +
      ' t' +
      (r.trocinyT > 0.05 ? `; trociny ${fmt(r.trocinyT, 1)} t` : '');
  }
  $('k-feed').style.color = feedOk ? 'var(--ok)' : 'var(--bad)';
  $('k-feeds').title = 'Bilans na rok: plus to nadwyżka, minus to brak (siano i pastwisko w t suchej masy).';
  $('k-djp').textContent = fmt(r.djpHa, 2);

  // podsumowania grup
  $('sum-ziemia').textContent =
    `${fmt(r.UR, 1)} ha UR${p.dzierzawa > 0 ? `, w tym ${fmt(p.dzierzawa, 1)} dzierż.` : ''}`;
  $('sum-krowy').textContent = p.krowy ? `${p.krowy} szt.` : '–';
  $('sum-kury').textContent = p.kury ? `${p.kury} szt.` : '–';
  $('sum-drob').textContent =
    [
      p.brojlery ? `${p.brojlery} kurcz.` : '',
      p.gesi ? `${p.gesi} gęsi` : '',
      p.kaczki ? `${p.kaczki} kaczek` : '',
      p.indyki ? `${p.indyki} ind.` : '',
      p.perliczki ? `${p.perliczki} perl.` : '',
      p.kroliki ? `${p.kroliki} królic` : '',
    ]
      .filter(Boolean)
      .join(', ') || '–';
  $('sum-ludzie').textContent = `${fmt(r.dostepne / p.hEtat, 2)} etatu, limit ${fmt(p.limitTydz, 0)} h/tydz.`;
  $('sum-warzywa').textContent =
    [
      p.warzywaSprz ? `${fmt(p.warzywaSprz, 2)} ha warzyw` : '',
      p.owoceSprz ? `owoce ${p.owoceSprz}%` : '',
      p.klody ? `${p.klody} kłód` : '',
      p.ule ? `${p.ule} uli` : '',
    ]
      .filter(Boolean)
      .join(', ') || '–';
  $('sum-bydlo').textContent = p.mamki
    ? `${p.mamki} mamek, ${fmt(r.odsadkiN, 0)} odsadków, ${fmt(r.opasyN, 0)} opasów`
    : '–';
  $('sum-dom').textContent = p.celZBudzetu ? `minimum ${zl(r.dom.potrzeba)}` : `${fmt(p.wydDom, 0)} zł/mies.`;
  $('sum-gorzej').textContent = `ceny −${p.gCeny}%, plony −${p.gPlony}%, praca +${p.gGodz}%`;
  $('sum-przetw').textContent = r.przetwVal > 0 ? `${zl(r.przetwVal)}, ${fmt(r.paczki, 0)} paczek` : '–';
  $('sum-owce').textContent =
    [
      p.owce ? `${p.owce} owiec` : '',
      p.kozy ? `${p.kozy} kóz` : '',
      p.swinie + p.swinieSprz ? `${p.swinie + p.swinieSprz} świń` : '',
      p.konie ? `${p.konie} konie` : '',
    ]
      .filter(Boolean)
      .join(', ') || '–';
  $('derived-orne').innerHTML =
    r.orne >= 0
      ? `Grunty orne (reszta): <b>${fmt(r.orne, 1)} ha</b><br>zboża i strączkowe <b>${fmt(r.zbozeHa, 1)} ha</b>, koniczyna z trawami <b>${fmt(r.koniczynaHa, 1)} ha</b>`
      : `<span style="color:var(--bad)">Za mało ziemi: brakuje <b>${fmt(-r.orne, 1)} ha</b></span>`;
  if (p.warzywaSprz > 0 && r.orne >= 0)
    $('derived-orne').innerHTML += `<br>warzywa na sprzedaż <b>${fmt(p.warzywaSprz, 2)} ha</b> (poza tym)`;

  // ostrzeżenia
  const W = r.W.slice();
  if (viewG)
    W.unshift({
      lvl: 'info',
      t: 'Widzisz wszystkie liczby w wariancie pesymistycznym. Przełącz przyciskiem przy założeniach.',
    });
  if (ro.netto < celEff(p))
    W.unshift({
      lvl: 'warn',
      t: `W wariancie pesymistycznym wychodzi ${zl(ro.netto)}, czyli ${zl(celEff(p) - ro.netto)} poniżej Twojego minimum ${zl(celEff(p))}.`,
    });
  else
    W.push({
      lvl: 'ok',
      t: `Nawet w wariancie pesymistycznym wychodzi ${zl(ro.netto)}, powyżej Twojego minimum ${zl(celEff(p))}.`,
    });
  if (ro.tydzSzczyt > p.limitTydz && r.tydzSzczyt <= p.limitTydz)
    W.unshift({
      lvl: 'warn',
      t: `W wariancie pesymistycznym najcięższy miesiąc to ok. ${fmt(ro.tydzSzczyt, 0)} h tygodniowo dla całego gospodarstwa, powyżej limitu ${fmt(p.limitTydz, 0)} h.`,
    });
  if (!W.some(w => w.lvl === 'bad'))
    W.unshift({
      lvl: 'ok',
      t: `Pasze, siano i słoma mieszczą się w ${fmt(p.areaTotal + p.dzierzawa, 1)} ha. Na czysto ok. ${zl(r.netto)} rocznie przy ok. ${fmt(r.godziny, 0)} h pracy (${fmt(r.util * 100, 0)}% czasu rodziny), plus jedzenie dla domu warte ok. ${zl(r.homeTotal)}.`,
    });
  $('warns').innerHTML = W.map(w => `<div class="w ${w.lvl}"><span>${esc(w.t)}</span></div>`).join('');

  renderLand(r);
  renderFeed(r);
  renderMoney(r);
  renderDom(r, ro);
  renderCF(r);
  renderKier(r);
  clearTimeout(window.__heavy);
  window.__heavy = setTimeout(() => {
    renderNext();
    renderSens();
    tintAll();
  }, 220);
  renderLab(r);
  renderMarket(r);
  renderInv(r);
  renderCmp();
  renderPlan(r);
  renderRot(r);
  renderCal(r);
  tintAll();
}
