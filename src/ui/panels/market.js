// Panel „Co trzeba sprzedać”: ilości produktów do sprzedania.

function renderMarket(r) {
  const c = [];
  if (r.mlekoSwieze > 0) c.push([fmt(r.rynek.mlekoDzien, 0) + ' l', 'mleka dziennie (średnio)']);
  if (r.serSprz > 0) c.push([fmt(r.rynek.serTydz, 1) + ' kg', 'sera tygodniowo (latem więcej)']);
  if (r.jajaSprz > 0) c.push([fmt(r.rynek.jajaTydz / 10, 0) + ' op.', 'jaj po 10 szt. tygodniowo']);
  if (r.jagZyweN > 0.05) c.push([fmt(r.jagZyweN, 0) + ' szt.', 'jagniąt żywcem rocznie (VIII–XII)']);
  if (r.miesoKg > 0)
    c.push([
      fmt(r.miesoKg, 0) + ' kg',
      `jagnięciny rocznie z ${fmt(r.jagMiesoN, 0)} jagniąt, ${r.partieUboj} ${r.partieUboj === 1 ? 'partia' : 'partie'} do rzeźni`,
    ]);
  if (r.koguty > 0) c.push([fmt(r.koguty, 0) + ' szt.', 'kogutków rosołowych z własnego wylęgu (VI–IX)']);
  if (p.kury > 0) c.push([fmt(r.kuryWymiana, 0) + ' szt.', 'starych kur rosołowych rocznie']);
  if (r.cieletaSprz > 0) c.push([fmt(r.cieletaSprz, 0) + ' szt.', 'cieląt do sprzedaży wiosną']);
  if (p.brojlery > 0) c.push([fmt(p.brojlery * 0.95, 0) + ' szt.', 'kurczaków rocznie (V–X)']);
  if (p.gesi > 0) c.push([fmt(p.gesi * 0.9, 0) + ' szt.', 'gęsi na św. Marcina i święta']);
  if (p.kroliki > 0) c.push([fmt(p.kroliki * p.odchowKrol * 0.9, 0) + ' szt.', 'królików rocznie']);
  if (p.swinieSprz > 0)
    c.push([
      fmt(p.swinieSprz * p.wagaTuszySw, 0) + ' kg',
      `wieprzowiny jesienią (${p.swinieSprz} tuczników)`,
    ]);
  if (p.kozySprz > 0) c.push([fmt(r.kozlSprz, 0) + ' szt.', 'koźląt na mięso, głównie na Wielkanoc']);
  if (p.mamki > 0) c.push([fmt(r.odsadkiN + r.opasyN, 0) + ' szt.', 'odsadków i opasów jesienią']);
  if (p.kaczki > 0) c.push([fmt(p.kaczki * 0.93, 0) + ' szt.', 'kaczek rocznie (VII–XI)']);
  if (p.indyki > 0) c.push([fmt(p.indyki * 0.9, 0) + ' szt.', 'indyków na święta']);
  if (p.perliczki > 0) c.push([fmt(p.perliczki * 0.9, 0) + ' szt.', 'perliczek rocznie (IX–XI)']);
  if (r.przetwVal > 0)
    c.push([fmt(r.przetwKg, 0) + ' kg', `przetworów i wędlin, ok. ${fmt(r.paczki, 0)} paczek kurierem`]);
  if (r.R.owoce > 0) c.push([fmt(r.owoceSprzT, 1) + ' t', 'owoców na sprzedaż lub do tłoczni']);
  if (p.klody > 0) c.push([fmt(r.grzybyKg * 0.9, 0) + ' kg', 'boczniaków rocznie (wiosna i jesień)']);
  if (r.R.warzywa > 0)
    c.push([
      fmt(r.rynek.rwsUdzialy, 0) + ' rodzin',
      'w RWS po ok. 1600 zł za sezon (V–XI), albo tyle samo na targu',
    ]);
  if (r.R.miod > 0) c.push([fmt(r.rynek.miodKg, 0) + ' kg', 'miodu rocznie']);
  c.push([
    zl(r.rynek.rhdPrzetwory),
    'przychodu w RHD: sery, mięso czerwone w paczkach, wędliny (zwolnione z podatku do 100 tys. zł)',
  ]);
  $('market').innerHTML = c
    .map(x => `<div class="card"><div class="v">${x[0]}</div><div class="k">${x[1]}</div></div>`)
    .join('');
}
