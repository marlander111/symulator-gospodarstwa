// Panel "Crop rotation": rotation length, catch and stubble crops, the field × year table,
// eco-scheme points and advice on where each cover crop fits.

function renderRotation(results) {
  if (!results) return;
  const rotation = currentRotation();
  const fieldHa = results.usableArableHa / rotation.fieldCount;
  byId('rotation-controls').innerHTML = rotationControlsHtml(rotation);
  byId('rotation-table').innerHTML = rotationTableHtml(rotation, fieldHa);
  byId('rotation-note').innerHTML = rotationNoteHtml(rotation, fieldHa);
  byId('catch-crop-summary').innerHTML = ecoSchemeSummaryHtml(results);
  byId('catch-crop-fields').innerHTML = coverCropAdviceHtml(rotation);
  byId('crops-table').innerHTML = cropsTableHtml(rotation);
  byId('seed-table').innerHTML = seedTableHtml(rotation, fieldHa);
}

/**
 * Seed to buy for the fields in the rotation year shown: each field's crop at its seed rate,
 * clover undersown in the oats, and the cover crops sown after harvest.
 */
function seedTableHtml(rotation, fieldHa) {
  const year = planView.rotationYear;
  const rows = [];
  const seedRow = (field, cropText, seed, kgPerHa) =>
    tableRow([
      cell(t('rotation.field', { field })),
      cell(escapeHtml(cropText)),
      cell(escapeHtml(t(`seeds.${seed}`))),
      numberCell(t('units.kilograms', { value: formatNumber(kgPerHa, 0) })),
      numberCell(t('units.kilograms', { value: formatNumber(kgPerHa * fieldHa, 0) })),
    ]);
  const totals = {};
  const addSeed = (field, cropText, seed, kgPerHa) => {
    rows.push(seedRow(field, cropText, seed, kgPerHa));
    totals[seed] = (totals[seed] || 0) + kgPerHa * fieldHa;
  };
  for (let field = 1; field <= rotation.fieldCount; field++) {
    const crop = fieldCrop(rotation, field, year);
    const next = fieldCrop(rotation, field, year + 1);
    // clover sown the year before under the oats needs no seed in its own years
    if (crop.id !== 'clover')
      for (const { seed, kgPerHa } of CROP_SEED_RATES[crop.id])
        addSeed(field, cropName(crop.id), seed, kgPerHa);
    if (crop.id === 'oats')
      for (const { seed, kgPerHa } of UNDERSOWN_CLOVER_SEED)
        addSeed(field, t('rotation.undersownClover'), seed, kgPerHa);
    if (params.catchCrops && isCerealBeforeCatchCrop(crop.id, next.id)) {
      const mix = currentCatchMix();
      addSeed(field, t(`catchCropMixes.${mix.id}`), 'coverMix', mix.seedKgPerHa);
    }
    if (params.stubbleCrop && isCerealBeforeWinterCereal(crop.id, next.id)) {
      const mix = STUBBLE_CROP_MIXES[params.stubbleCropMix || 0];
      addSeed(field, t(`stubbleCropMixes.${mix.id}`), 'coverMix', mix.seedKgPerHa);
    }
  }
  if (!rows.length) return '';
  const totalText = Object.entries(totals)
    .map(([seed, kg]) => `${t(`seeds.${seed}`)} ${t('units.kilograms', { value: formatNumber(kg, 0) })}`)
    .join(' · ');
  rows.push(
    tableRow(
      [
        cell(element('b', {}, t('rotation.seedTotal', { year }))),
        cell(escapeHtml(totalText), { colspan: 4 }),
      ],
      { class: 'tot' }
    )
  );
  const columns = ['field', 'crop', 'seed', 'perHa', 'perField'];
  const header = tableHeader(
    columns.map(column => t(`rotation.seedColumns.${column}`)),
    index => index >= 3
  );
  return header + tableBody(rows);
}

const ROTATION_FIELD_OPTIONS = [3, 4, 5, 6, 7, 8];

const toggleButton = (isOn, attribute, value, text) =>
  `<button class="btn${isOn ? ' on' : ''}" type="button" ${attribute}="${value}">${text}</button>`;

function rotationControlsHtml(rotation) {
  const yesNo = (attribute, enabled) =>
    toggleButton(!enabled, attribute, 0, t('rotation.no')) +
    toggleButton(enabled, attribute, 1, t('rotation.yes'));
  const mixButtons = (mixes, attribute, selected, textKey) =>
    `<span class="lab" style="margin-left:10px">${t('rotation.mix')}</span>` +
    mixes
      .map((mix, index) =>
        toggleButton((selected || 0) === index, attribute, index, t(`${textKey}.${mix.id}`))
      )
      .join('');
  const lineBreak = `<span style="flex-basis:100%"></span>`;
  const length = t('rotation.length', {
    cloverYears: rotation.cloverYears,
    cloverUnit: tPlural('plurals.years', rotation.cloverYears),
    cerealYears: rotation.cerealYears,
    cerealUnit: tPlural('plurals.years', rotation.cerealYears),
  });

  return (
    `<span class="lab">${t('rotation.fieldCount')}</span>` +
    ROTATION_FIELD_OPTIONS.map(count =>
      toggleButton(count === rotation.fieldCount, 'data-rotation-fields', count, count)
    ).join('') +
    `<span class="lab" style="margin-left:10px">${length}</span>` +
    lineBreak +
    `<span class="lab">${t('rotation.rootCrops')}</span>` +
    yesNo('data-root-crops', params.rootCrops) +
    (params.rootCrops && !rotation.rootCropsFit
      ? element('span', { class: 'lab', style: 'margin-left:10px' }, t('rotation.rootCropsNoRoom'))
      : '') +
    lineBreak +
    `<span class="lab">${t('rotation.catchCrops')}</span>` +
    yesNo('data-catch-crops', params.catchCrops) +
    (params.catchCrops
      ? mixButtons(CATCH_CROP_MIXES, 'data-catch-mix', params.catchCropMix, 'catchCropMixes')
      : '') +
    lineBreak +
    `<span class="lab">${t('rotation.stubbleCrop')}</span>` +
    yesNo('data-stubble-crop', params.stubbleCrop) +
    (params.stubbleCrop
      ? mixButtons(STUBBLE_CROP_MIXES, 'data-stubble-mix', params.stubbleCropMix, 'stubbleCropMixes')
      : '')
  );
}

function rotationTableHtml(rotation, fieldHa) {
  const years = Array.from({ length: rotation.fieldCount }, (_, index) => index + 1);
  const isSelected = year => year === planView.rotationYear;

  const yearHeader = year =>
    element(
      'th',
      { class: isSelected(year) ? 'sel' : '' },
      element('button', { type: 'button', 'data-year': year }, t('rotation.year', { year }))
    );
  const header = element(
    'thead',
    {},
    element(
      'tr',
      {},
      element('th', {}, t('rotation.fieldHeader', { hectares: formatNumber(fieldHa, 2) })) +
        years.map(yearHeader).join('')
    )
  );

  const cropCell = (field, year) => {
    const crop = fieldCrop(rotation, field, year);
    const next = fieldCrop(rotation, field, year + 1);
    const note = crop.note ? ' ' + element('span', { class: 'muted' }, `(${crop.note})`) : '';
    return cell(escapeHtml(cropName(crop.id)) + note + coverCropTag(crop.id, next.id), {
      class: isSelected(year) ? 'crop sel' : 'crop',
      style: `border-left-color:${CROP_COLORS[crop.id]}`,
    });
  };
  const fieldRow = field =>
    tableRow([
      cell(element('b', {}, t('rotation.field', { field }))),
      ...years.map(year => cropCell(field, year)),
    ]);

  const fields = Array.from({ length: rotation.fieldCount }, (_, index) => index + 1);
  return header + tableBody(fields.map(fieldRow));
}

/** Tag under a crop: room for a catch crop or stubble crop after it, or clover undersown in oats. */
function coverCropTag(crop, nextCrop) {
  const tag = (isOn, text) => element('span', { class: isOn ? 'mp on' : 'mp' }, text);
  if (crop === 'oats')
    return tag(
      params.catchCrops,
      t('rotation.undersownClover') + (params.catchCrops ? t('rotation.undersownPoints') : '')
    );
  if (isCerealBeforeWinterCereal(crop, nextCrop))
    return tag(
      params.stubbleCrop,
      t(params.stubbleCrop ? 'rotation.stubbleCropSown' : 'rotation.stubbleCropRoom')
    );
  if (isCerealBeforeCatchCrop(crop, nextCrop))
    return tag(
      params.catchCrops,
      params.catchCrops ? t('rotation.catchCropSown', { mix: catchMixLabel() }) : t('rotation.catchCropRoom')
    );
  return '';
}

function rotationNoteHtml(rotation, fieldHa) {
  const rotationCerealPercent = Math.round((rotation.cerealYears / rotation.fieldCount) * 100);
  let html = t('rotation.note', {
    clover: formatNumber(rotation.cloverYears * fieldHa, 2),
    cereals: formatNumber(rotation.cerealYears * fieldHa, 2),
    rotationPercent: rotationCerealPercent,
    sliderPercent: params.cerealShare,
  });
  if (Math.abs(rotationCerealPercent - params.cerealShare) >= 3)
    html +=
      ' ' +
      element(
        'button',
        { class: 'btn', type: 'button', 'data-cereal-share': rotationCerealPercent },
        t('rotation.matchSlider', { percent: rotationCerealPercent })
      );
  return html;
}

function ecoSchemeSummaryHtml(results) {
  const points = results.carbonFarming;
  const n = (value, decimals = 1) => formatNumber(value, decimals);
  const payment = results.subsidyItems.carbonFarming;
  const practisesChosen = params.catchCrops || params.carbonManure || params.carbonCropDiversity;
  const items = [
    t('ecoScheme.possibleArea', {
      catchCropHa: n(results.rotation.catchCropFields * results.fieldHa, 2),
      undersownHa: n(results.rotation.undersownFields * results.fieldHa, 2),
    }),
    t('ecoScheme.points', {
      total: n(points.totalPoints),
      catchCrops: n(points.catchCropPoints),
      manure: n(points.manurePoints),
      diversity: n(points.diversityPoints),
      extensive: n(points.extensivePoints),
      required: n(points.requiredPoints),
    }),
    t('ecoScheme.payment', {
      amount: formatPln(payment),
      belowMinimum: payment === 0 && practisesChosen ? t('ecoScheme.belowMinimum') : '',
      enableHint: params.catchCrops ? '' : t('ecoScheme.enableCatchCrops'),
    }),
    t('ecoScheme.costAndForage', {
      andStubble: params.stubbleCrop ? t('ecoScheme.andStubbleCrops') : '',
      cost: formatPln(results.costItems.catchCrops || 0),
      forage: n(results.coverCropForage),
      stubbleArea:
        results.stubbleCropHa > 0
          ? t('ecoScheme.stubbleArea', { hectares: n(results.stubbleCropHa, 2) })
          : '',
    }),
    results.rotation.diversityOk
      ? t('ecoScheme.diversityMet')
      : t('ecoScheme.diversityNotMet', { percent: Math.round(results.rotation.cerealShare * 100) }),
  ];
  return `<h3>${t('ecoScheme.title')}</h3><ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
}

function coverCropAdviceHtml(rotation) {
  const advice = rotation.crops
    .map((crop, index) => {
      const next = rotation.crops[(index + 1) % rotation.fieldCount];
      const values = { crop: t(`crops.${crop}.locative`), next: t(`crops.${next}.instrumental`) };
      if (crop === 'oats') return t('coverCropAdvice.undersown');
      if (crop === 'clover') return next === 'clover' ? '' : t('coverCropAdvice.afterClover', values);
      if (next === 'oats' || next === 'mixedGrain') {
        const lateWarning =
          params.catchCrops && currentCatchMix().lateSowing
            ? ' ' + t('coverCropAdvice.lateMix', { mix: catchMixLabel() })
            : '';
        const mix = params.catchCrops ? catchMixLabel() : t('coverCropAdvice.recommendedMix');
        return t('coverCropAdvice.catchCrop', { ...values, mix }) + lateWarning;
      }
      return params.stubbleCrop
        ? t('coverCropAdvice.stubbleCrop', { ...values, mix: stubbleMixLabel() })
        : t('coverCropAdvice.noRoom', values);
    })
    .filter(Boolean);
  return `<h3>${t('coverCropAdvice.title')}</h3><ul>${advice.map(item => `<li>${item}</li>`).join('')}</ul>`;
}

function cropsTableHtml(rotation) {
  const columns = ['crop', 'sowing', 'harvest', 'usedFor'];
  const crops = [...new Set(rotation.crops)];
  const cropRow = crop =>
    tableRow([
      cell(element('b', {}, cropName(crop))),
      cell(t(`crops.${crop}.sowing`)),
      cell(t(`crops.${crop}.harvest`)),
      cell(t(`crops.${crop}.usedFor`)),
    ]);
  const header = tableHeader(
    columns.map(column => t(`cropsTable.${column}`)),
    () => false
  );
  return header + tableBody(crops.map(cropRow));
}
