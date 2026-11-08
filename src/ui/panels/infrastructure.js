// Panel "Required infrastructure": the buildings, machinery and equipment the chosen enterprises
// need, grouped by kind. Ticking "the farm has it" takes the item out of the investments.

/** Order of the kinds of infrastructure (titles: locales → infrastructure.categories). */
const INFRASTRUCTURE_CATEGORIES = ['buildings', 'poultry', 'pasture', 'processing', 'machinery', 'produce'];

function renderInfrastructure(results) {
  const items = results.infrastructure;
  let html = '';
  for (const category of INFRASTRUCTURE_CATEGORIES) {
    const inCategory = items.filter(item => item.category === category);
    if (!inCategory.length) continue;
    html += element('h3', {}, t(`infrastructure.categories.${category}`));
    html += inCategory.map(infrastructureItemHtml).join('');
  }
  byId('infrastructure-list').innerHTML =
    html || element('p', { class: 'muted' }, t('infrastructure.nothing'));
  const owned = items.filter(item => item.owned);
  byId('infrastructure-note').textContent = t('infrastructure.note', {
    needed: items.length,
    owned: owned.length,
    value: formatPln(results.ownedInfrastructureValue),
  });
}

function infrastructureItemHtml(item) {
  const checkbox = voidElement('input', {
    type: 'checkbox',
    'data-owned': ownedParameterId(item.id),
    checked: item.owned ? 'checked' : null,
  });
  const quantity =
    item.quantity === 1
      ? t('infrastructure.cost', { cost: formatPln(item.fullCost) })
      : t('infrastructure.quantityCost', {
          quantity: formatNumber(item.quantity, item.quantity < 10 ? 1 : 0),
          cost: formatPln(item.fullCost),
        });
  const status = item.owned ? t('infrastructure.owned') : t('infrastructure.toBuy');
  return element(
    'label',
    { class: item.owned ? 'owned' : null },
    checkbox +
      element(
        'span',
        {},
        escapeHtml(t(`investments.${item.id}`)) +
          element('span', { class: 'q' }, `${escapeHtml(quantity)} · ${escapeHtml(status)}`)
      )
  );
}

function bindInfrastructure() {
  byId('infrastructure-list').addEventListener('change', event => {
    const checkbox = event.target.closest('[data-owned]');
    if (!checkbox) return;
    params[checkbox.dataset.owned] = checkbox.checked;
    onParamsChanged();
  });
}
