// Panel "Land and feed": land-use bar and the yearly balance of pasture, hay, grain and straw.

function renderLandUse(results) {
  const totalHa = params.ownedHa + params.leasedHa;
  const segments = [
    { id: 'farmyard', hectares: params.farmyardHa, color: 'var(--color-farmyard)' },
    { id: 'pasture', hectares: params.pastureHa, color: 'var(--color-pasture)' },
    { id: 'meadow', hectares: params.meadowHa, color: 'var(--color-meadow)' },
    { id: 'clover', hectares: results.cloverHa, color: 'var(--color-clover)' },
    { id: 'cereals', hectares: results.cerealHa, color: 'var(--color-cereal)' },
    { id: 'rootCrops', hectares: results.rootCropHa, color: 'var(--color-roots)' },
    { id: 'marketGarden', hectares: params.marketGardenHa, color: 'var(--color-other)' },
  ].filter(segment => segment.hectares > 0.001);
  const barTotal = Math.max(
    totalHa,
    sumBy(segments, segment => segment.hectares)
  );
  const label = segment => escapeHtml(t(`landUse.${segment.id}`));
  const hectares = segment => t('units.hectares', { value: formatNumber(segment.hectares, 1) });

  const barSegment = segment =>
    element('div', {
      style: `width:${(segment.hectares / barTotal) * 100}%;background:${segment.color}`,
      title: `${label(segment)}: ${hectares(segment)}`,
    });
  const legendItem = segment =>
    element(
      'span',
      {},
      element('i', { style: `background:${segment.color}` }) +
        `${label(segment)} ` +
        element('b', {}, hectares(segment))
    );
  byId('land-bar').innerHTML = segments.map(barSegment).join('');
  byId('land-legend').innerHTML = segments.map(legendItem).join('');
}

function renderFeedBalance(results) {
  const rows = [
    {
      id: 'pasture',
      need: results.grazingNeed,
      supply: results.grazingSupply,
      color: 'var(--color-pasture)',
      unit: 'dryMatterTonnes',
    },
    {
      id: 'hay',
      need: results.hayNeed,
      supply: results.haySupply,
      color: 'var(--color-meadow)',
      unit: 'dryMatterTonnes',
    },
    {
      id: 'grain',
      need: results.grainNeed,
      supply: results.grainSupply,
      color: 'var(--color-cereal)',
      unit: 'tonnes',
    },
    {
      id: 'straw',
      need: results.strawNeed,
      supply: results.strawSupply,
      color: 'var(--color-sheep)',
      unit: 'tonnes',
    },
  ];
  const housedDays = 365 - params.grazingDays;
  byId('feed-balance').innerHTML = rows.map(row => feedRowHtml(row, housedDays)).join('');

  const notes = [];
  if (results.hayFromPasture > 0.1)
    notes.push(t('feedBalance.hayFromPasture', { tonnes: formatNumber(results.hayFromPasture, 1) }));
  if (results.wheyGrainSaved > 0.005)
    notes.push(t('feedBalance.wheyForPigs', { kg: formatNumber(results.wheyGrainSaved * 1000, 0) }));
  notes.push(
    t('feedBalance.ownCost', {
      grain: formatNumber(results.grainCostPerTonne, 0),
      forage: formatNumber(results.forageCostPerTonne, 0),
    })
  );
  byId('feed-note').textContent = notes.join(' ');
}

function feedRowHtml(row, housedDays) {
  const scale = Math.max(row.need, row.supply, 0.01);
  const balance = row.supply - row.need;
  const status = balance < -0.05 ? 'bad' : balance < row.need * 0.05 ? 'warn' : 'ok';
  const unit = t(`feedBalance.units.${row.unit}`);
  const amount = value => `${formatNumber(value, 1)} ${unit}`;
  const sign = balance >= 0 ? '+' : '−';
  const bar = (className, widthShare, background) =>
    element('div', {
      class: className,
      style: `width:${widthShare * 100}%` + (background ? `;background:${background}` : ''),
    });
  const label = element(
    'div',
    { class: 'fl' },
    t(`feedBalance.${row.id}.label`) +
      element('span', {}, t(`feedBalance.${row.id}.detail`, { days: housedDays }))
  );
  const numbers = element(
    'div',
    { class: 'fnums' },
    element('span', {}, t('feedBalance.need', { amount: amount(row.need) })) +
      element('span', {}, t('feedBalance.supply', { amount: amount(row.supply) }))
  );
  const bars = element(
    'div',
    { class: 'fbars' },
    bar('fb need', row.need / scale) + bar('fb', row.supply / scale, row.color) + numbers
  );
  const pill = element(
    'div',
    { class: `pill ${status}` },
    sign + t('units.tonnes', { value: formatNumber(Math.abs(balance), 1) })
  );
  return element('div', { class: 'frow' }, label + bars + pill);
}
