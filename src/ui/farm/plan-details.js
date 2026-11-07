// Description of the clicked area of the farm plan in the selected month.

function describePlanSelection(results, area) {
  const month = planView.month;
  const monthName = messages('months.names')[month];
  const ha = (value, decimals = 1) => formatNumber(value, decimals);
  const paragraph = (text, className) => `<p${className ? ` class="${className}"` : ''}>${text}</p>`;

  if (area === 'pasture') {
    let html = `<h3>${t('planInfo.pasture.title', { hectares: ha(params.pastureHa) })}</h3>`;
    if (isGrazingMonth(month)) {
      const parts = [
        t('planInfo.pasture.grazing', { month: monthName }),
        params.dairyCows
          ? t('planInfo.pasture.cows', {
              count: params.dairyCows,
              interval: moveIntervalPhrase(params.grazingMoveIntervalDays),
            })
          : '',
        params.sucklerCows ? t('planInfo.pasture.sucklerCows', { count: params.sucklerCows }) : '',
        params.sheep ? t('planInfo.pasture.sheep') : '',
        params.layingHens ? t('planInfo.pasture.hens') : '',
        params.broilers && month >= 4 && month <= 9 ? t('planInfo.pasture.broilers') : '',
      ];
      html += paragraph(parts.filter(Boolean).join(' '));
      html += paragraph(t('planInfo.pasture.rest', { days: params.pastureRestDays }), 'small muted');
    } else {
      const liming = month === 2 ? ' ' + t('planInfo.pasture.liming') : '';
      html += paragraph(t('planInfo.pasture.winter', { month: monthName }) + liming);
    }
    return html;
  }

  if (area === 'meadow')
    return (
      `<h3>${t('planInfo.meadow.title', { hectares: ha(params.meadowHa) })}</h3>` +
      paragraph(
        t('planInfo.monthActivity', { month: monthName, activity: t(`planInfo.meadow.months.${month}`) })
      ) +
      paragraph(t('planInfo.meadow.hay', { tonnes: ha(results.meadowHay) }), 'small muted')
    );

  if (area && area.startsWith('plot')) {
    const field = +area.slice('plot'.length);
    const rotation = currentRotation();
    const crop = fieldCrop(rotation, field, planView.rotationYear);
    const nextCrop = fieldCrop(rotation, field, planView.rotationYear + 1);
    const status = fieldStatus(field, planView.rotationYear, month, rotation);
    return (
      `<h3>${t('planInfo.plot.title', { field, hectares: ha(results.usableArableHa / rotation.fieldCount, 2) })}</h3>` +
      paragraph(
        `<b>${t('planInfo.plot.year', { year: planView.rotationYear, crop: cropWithNote(crop) })}</b>`
      ) +
      paragraph(t('planInfo.monthActivity', { month: monthName, activity: status })) +
      paragraph(
        t('planInfo.plot.cropDetails', {
          sowing: t(`crops.${crop.id}.sowing`),
          harvest: t(`crops.${crop.id}.harvest`),
          usedFor: t(`crops.${crop.id}.usedFor`),
        }),
        'small'
      ) +
      paragraph(t('planInfo.plot.nextYear', { crop: cropWithNote(nextCrop) }), 'small muted')
    );
  }

  if (area === 'garden')
    return (
      `<h3>${t('planInfo.garden.title', { hectares: ha(params.marketGardenHa, 2) })}</h3>` +
      paragraph(
        t('planInfo.monthActivity', { month: monthName, activity: t(`planInfo.garden.months.${month}`) })
      )
    );

  const housing = isGrazingMonth(month)
    ? t('planInfo.farmyard.summer')
    : t('planInfo.farmyard.winter') +
      t(params.winterPolytunnel ? 'planInfo.farmyard.hensInTunnel' : 'planInfo.farmyard.hensAtFarmyard') +
      '.';
  const sheepAtNight = params.sheep ? ' ' + t('planInfo.farmyard.sheepAtNight') : '';
  return (
    `<h3>${t('planInfo.farmyard.title', { hectares: ha(params.farmyardHa) })}</h3>` +
    paragraph(`${monthName}: ${housing}${sheepAtNight}`) +
    paragraph(
      t('planInfo.farmyard.orchardAndGarden', {
        orchard: ha(results.orchardHa),
        geese: params.geese ? t('planInfo.farmyard.withGeese') : '',
        garden: ha(params.kitchenGardenHa, 2),
      }),
      'small muted'
    )
  );
}
