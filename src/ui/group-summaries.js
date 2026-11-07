// One-line summaries next to the titles of the parameter groups, and the derived arable area.

function renderGroupSummaries(results) {
  for (const [group, text] of Object.entries(groupSummaryTexts(results)))
    byId(`summary-${group}`).textContent = text;
  renderDerivedArable(results);
}

/** Short text per parameter group, e.g. "4 head" for the dairy cows. */
function groupSummaryTexts(results) {
  const none = t('summaries.none');
  const list = items => items.filter(Boolean).join(', ') || none;
  const count = (value, key) => (value ? t(`summaries.${key}`, { count: value }) : '');

  return {
    people: t('summaries.people', {
      fullTime: formatNumber(results.availableHours / params.fullTimeHoursPerYear, 2),
      limit: formatNumber(params.weeklyHoursLimit, 0),
    }),
    land:
      t('summaries.land', { farmed: formatNumber(results.farmedHa, 1) }) +
      (params.leasedHa > 0 ? t('summaries.leased', { leased: formatNumber(params.leasedHa, 1) }) : ''),
    dairy: params.dairyCows ? t('summaries.head', { count: params.dairyCows }) : none,
    layingHens: params.layingHens ? t('summaries.head', { count: params.layingHens }) : none,
    poultry: list([
      count(params.broilers, 'broilers'),
      count(params.geese, 'geese'),
      count(params.ducks, 'ducks'),
      count(params.turkeys, 'turkeys'),
      count(params.guineaFowl, 'guineaFowl'),
      count(params.rabbits, 'rabbits'),
    ]),
    beefCattle: params.sucklerCows
      ? t('summaries.beefCattle', {
          cows: params.sucklerCows,
          weaners: formatNumber(results.weanersSold, 0),
          finishers: formatNumber(results.finishers, 0),
        })
      : none,
    smallLivestock: list([
      count(params.sheep, 'sheep'),
      count(params.goats, 'goats'),
      count(params.pigsForHome + params.pigsForSale, 'pigs'),
      count(params.horses, 'horses'),
    ]),
    produce: list([
      params.marketGardenHa
        ? t('summaries.vegetables', { hectares: formatNumber(params.marketGardenHa, 2) })
        : '',
      count(params.fruitSoldShare, 'fruit'),
      count(params.mushroomLogs, 'mushroomLogs'),
      count(params.beehives, 'beehives'),
    ]),
    processing:
      results.processedValue > 0
        ? t('summaries.processing', {
            value: formatPln(results.processedValue),
            parcels: formatNumber(results.parcels, 0),
          })
        : none,
    household: params.targetFromHouseholdBudget
      ? t('summaries.householdMinimum', { amount: formatPln(results.householdBudget.required) })
      : t('summaries.householdSpending', { amount: formatNumber(params.householdMonthlySpending, 0) }),
    pessimistic: t('summaries.pessimistic', {
      prices: params.pessimisticPriceDrop,
      yields: params.pessimisticYieldDrop,
      hours: params.pessimisticExtraHours,
    }),
  };
}

function renderDerivedArable(results) {
  const hectares = (value, decimals = 1) =>
    element('b', {}, t('units.hectares', { value: formatNumber(value, decimals) }));

  if (results.arableHa < 0) {
    byId('derived-arable').innerHTML = element(
      'span',
      { style: 'color:var(--bad)' },
      `${t('summaries.notEnoughLand')} ${hectares(-results.arableHa)}`
    );
    return;
  }

  let html =
    `${t('summaries.arableRest')} ${hectares(results.arableHa)}<br>` +
    `${t('summaries.cereals')} ${hectares(results.cerealHa)}, ` +
    `${t('summaries.clover')} ${hectares(results.cloverHa)}`;
  if (params.marketGardenHa > 0) {
    const marketGarden = hectares(params.marketGardenHa, 2);
    html += `<br>${t('summaries.marketGarden')} ${marketGarden} ${t('summaries.outsideArable')}`;
  }
  byId('derived-arable').innerHTML = html;
}
