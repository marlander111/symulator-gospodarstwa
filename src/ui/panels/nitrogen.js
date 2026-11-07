// Panel "Nitrogen and manure": nitrogen from the animals against the 170 kg/ha limit, how much the
// animals spread themselves, the manure left to haul out, and the balance of the manured fields.
// The winter can be spent in the sheds (manure) or on bale grazing.

/** Field balance (kg N/ha) above which nitrogen is likely to be lost, and below which soils run down. */
const FIELD_NITROGEN_SURPLUS_WARNING = 60;
const FIELD_NITROGEN_DEFICIT_WARNING = -30;

function renderNitrogen(results) {
  const { nitrogen } = results;
  byId('nitrogen-controls').innerHTML = winteringButtonsHtml();
  byId('nitrogen-table').innerHTML = nitrogenTableHtml(nitrogen);
  byId('nitrogen-fields').innerHTML = fieldNitrogenHtml(nitrogen);
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
