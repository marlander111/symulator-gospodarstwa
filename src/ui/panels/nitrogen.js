// Panel "Nitrogen and carbon": nitrogen from the animals against the 170 kg/ha limit, how much the
// animals spread themselves, the manure left to haul out, the balance of the manured fields and
// the nitrogen cycle of the whole farm; then the soil carbon stored against the ruminants'
// methane. The winter can be spent in the sheds (manure) or on bale grazing.

/** Field balance (kg N/ha) above which nitrogen is likely to be lost, and below which soils run down. */
const FIELD_NITROGEN_SURPLUS_WARNING = 60;
const FIELD_NITROGEN_DEFICIT_WARNING = -30;

function renderNitrogen(results) {
  const { nitrogen } = results;
  byId('nitrogen-controls').innerHTML = winteringButtonsHtml();
  byId('nitrogen-table').innerHTML = nitrogenTableHtml(nitrogen);
  byId('nitrogen-fields').innerHTML = fieldNitrogenHtml(nitrogen);
  byId('nitrogen-cycle-table').innerHTML = nitrogenCycleHtml(nitrogen.cycle);
  byId('carbon-summary').innerHTML = carbonSummaryHtml(results.carbon);
  byId('carbon-table').innerHTML = carbonTableHtml(results.carbon);
}

/** Farm-gate nitrogen: what comes in, what leaves with the products, ammonia and the rest. */
function nitrogenCycleHtml(cycle) {
  const kg = value => t('nitrogen.kg', { value: formatNumber(value, 0) });
  const lines = (group, values) =>
    Object.entries(values)
      .filter(([, value]) => value > 0.5)
      .map(([id, value]) => tableRow([cell(t(`nitrogen.cycle.${group}.${id}`)), numberCell(kg(value))]));
  const totalRow = (labelKey, value) =>
    tableRow([cell(element('b', {}, t(labelKey))), numberCell(element('b', {}, kg(value)))], {
      class: 'tot',
    });
  const rows = [
    ...lines('inputs', cycle.inputs),
    totalRow('nitrogen.cycle.totalInputs', cycle.totalInputs),
    ...lines('outputs', cycle.outputs),
    totalRow('nitrogen.cycle.totalOutputs', cycle.totalOutputs),
    tableRow([cell(t('nitrogen.cycle.ammonia')), numberCell(kg(cycle.ammonia))]),
    tableRow([
      cell(t('nitrogen.cycle.soilOrLeached')),
      numberCell(
        t('nitrogen.cycle.perHa', { value: formatNumber(cycle.soilOrLeachedPerHa, 0) }),
        cycle.soilOrLeachedPerHa < 0
      ),
    ]),
  ];
  const header = tableHeader([t('nitrogen.cycle.title'), t('nitrogen.columns.nitrogen')]);
  return header + tableBody(rows);
}

/** Soil carbon stored a year against the methane of the ruminants, in tonnes of CO2. */
function carbonSummaryHtml(carbon) {
  const tonnes = value => formatNumber(value, 1);
  const status = carbon.netCo2 >= 0 ? 'ok' : 'warn';
  return (
    element('h3', {}, t('carbon.title')) +
    element(
      'p',
      {},
      t('carbon.summary', {
        carbon: tonnes(carbon.soilCarbon),
        perHa: formatNumber(carbon.soilCarbonPerHa, 2),
        co2: tonnes(carbon.sequestrationCo2),
        methane: tonnes(carbon.methaneCo2),
      })
    ) +
    element(
      'p',
      {},
      element(
        'span',
        { class: `pill ${status}` },
        t('carbon.net', { value: (carbon.netCo2 >= 0 ? '+' : '−') + tonnes(Math.abs(carbon.netCo2)) })
      )
    ) +
    element('p', { class: 'small muted' }, t('carbon.hint'))
  );
}

function carbonTableHtml(carbon) {
  const rows = Object.entries(carbon.soilCarbonByLand)
    .filter(([, value]) => Math.abs(value) > 0.005)
    .map(([land, value]) =>
      tableRow([
        cell(t(`carbon.land.${land}`)),
        numberCell(t('carbon.tonnesCarbon', { value: formatNumber(value, 2) }), value < 0),
        numberCell(t('carbon.tonnesCo2', { value: formatNumber(value * CO2_PER_CARBON, 1) }), value < 0),
      ])
    );
  if (!rows.length) return '';
  rows.push(
    tableRow(
      [
        cell(t('money.total')),
        numberCell(t('carbon.tonnesCarbon', { value: formatNumber(carbon.soilCarbon, 2) })),
        numberCell(t('carbon.tonnesCo2', { value: formatNumber(carbon.sequestrationCo2, 1) })),
      ],
      { class: 'tot' }
    )
  );
  rows.push(
    tableRow([
      cell(t('carbon.methane', { kg: formatNumber(carbon.methaneKg, 0) })),
      cell(''),
      numberCell(t('carbon.tonnesCo2', { value: '−' + formatNumber(carbon.methaneCo2, 1) }), true),
    ])
  );
  const header = tableHeader([t('carbon.columns.land'), t('carbon.columns.carbon'), t('carbon.columns.co2')]);
  return header + tableBody(rows);
}

function winteringButtonsHtml() {
  const option = (isOn, value, text) =>
    element('button', { class: isOn ? 'btn on' : 'btn', type: 'button', 'data-bale-grazing': value }, text);
  return (
    element('span', { class: 'lab' }, t('nitrogen.winterLabel')) +
    option(!params.baleGrazing, 0, t('nitrogen.winterInSheds')) +
    option(params.baleGrazing, 1, t('nitrogen.winterBaleGrazing'))
  );
}

function nitrogenTableHtml(nitrogen) {
  const kg = value => t('nitrogen.kg', { value: formatNumber(value, 0) });
  const share = value => (nitrogen.total > 0 ? formatNumber((value / nitrogen.total) * 100, 0) + '%' : '–');
  const limitStatus =
    nitrogen.perFarmedHa > nitrogen.limitPerHa
      ? 'bad'
      : nitrogen.perFarmedHa > nitrogen.limitPerHa * 0.8
        ? 'warn'
        : 'ok';
  const pill = element(
    'span',
    { class: `pill ${limitStatus}` },
    t('nitrogen.perHaOfLimit', { perHa: formatNumber(nitrogen.perFarmedHa, 0), limit: nitrogen.limitPerHa })
  );

  const rows = [
    tableRow([cell(element('b', {}, t('nitrogen.total'))), numberCell(kg(nitrogen.total)), cell(pill)]),
    tableRow([
      cell(t('nitrogen.onPasture', { perHa: formatNumber(nitrogen.pasturePerHa, 0) })),
      numberCell(kg(nitrogen.onPasture)),
      cell(share(nitrogen.onPasture), { class: 'small muted' }),
    ]),
  ];
  if (params.baleGrazing)
    rows.push(
      tableRow([
        cell(t('nitrogen.onBaleGrazing')),
        numberCell(kg(nitrogen.onBaleGrazing)),
        cell(share(nitrogen.onBaleGrazing), { class: 'small muted' }),
      ])
    );
  rows.push(
    tableRow([
      cell(
        t('nitrogen.inManure', {
          tonnes: formatNumber(nitrogen.manureTonnes, 0),
          hours: formatNumber(nitrogen.manureHours, 0),
        })
      ),
      numberCell(kg(nitrogen.inManure)),
      cell(share(nitrogen.inManure), { class: 'small muted' }),
    ])
  );

  const header = tableHeader(
    [t('nitrogen.columns.source'), t('nitrogen.columns.nitrogen'), ''],
    index => index === 1
  );
  return header + tableBody(rows);
}

function fieldNitrogenHtml(nitrogen) {
  const balance = nitrogen.fieldBalancePerHa;
  const status =
    balance > FIELD_NITROGEN_SURPLUS_WARNING
      ? 'surplus'
      : balance < FIELD_NITROGEN_DEFICIT_WARNING
        ? 'deficit'
        : 'balanced';
  const kg = value => formatNumber(value, 0);
  const sign = balance >= 0 ? '+' : '−';
  return (
    element('h3', {}, t('nitrogen.fieldsTitle', { hectares: formatNumber(nitrogen.manuredHa, 1) })) +
    element(
      'p',
      {},
      t('nitrogen.fieldsSummary', {
        manure: kg(nitrogen.manureToFields),
        clover: kg(nitrogen.cloverFixation),
        removed: kg(nitrogen.removedWithCrops),
        balance: sign + kg(Math.abs(balance)),
      })
    ) +
    element('p', { class: 'small muted' }, t(`nitrogen.fieldStatus.${status}`))
  );
}
