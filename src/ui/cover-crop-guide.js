// Static reference tables of catch-crop and stubble-crop mixtures (seed rates, timing, purpose).
// Texts: locales/pl.json → page.coverCropGuide.

function renderCoverCropGuide() {
  renderMixGuideTable('catch-mix-table', messages('page.coverCropGuide.catchCrops'));
  renderMixGuideTable('stubble-mix-table', messages('page.coverCropGuide.stubbleCrops'));
}

function renderMixGuideTable(elementId, guide) {
  const header = guide.columns.map(column => `<th>${column}</th>`).join('');
  const rows = Object.values(guide.mixes).map(mix => {
    const name = `<b>${mix.name}</b>` + (mix.species ? `: ${mix.species}` : '');
    return `<tr><td>${name}</td><td>${mix.seeding}</td><td>${mix.timing}</td><td>${mix.purpose}</td></tr>`;
  });
  byId(elementId).innerHTML = `<thead><tr>${header}</tr></thead><tbody>${rows.join('')}</tbody>`;
}
