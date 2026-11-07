// Interactive farm plan: farmyard, pasture paddocks, meadow and rotation fields drawn side by
// side in proportion to their area, showing what happens in the selected month.

const PLAN_SIZE = { width: 1000, height: 540, pad: 14, top: 40, gap: 8, minAreaWidth: 130 };

function renderFarmPlan(results) {
  if (!results) return;
  planView.results = results;

  const rotation = currentRotation();
  if (planView.rotationYear > rotation.fieldCount) planView.rotationYear = 1;

  renderPlanMonthButtons();
  renderPlanYearButtons(rotation);

  const { width, height, pad, top, gap } = PLAN_SIZE;
  const areas = [
    { id: 'farmyard', hectares: params.farmyardHa, draw: drawFarmyard },
    { id: 'pasture', hectares: params.pastureHa, draw: drawPasture },
    { id: 'meadow', hectares: params.meadowHa, draw: drawMeadow },
    { id: 'arable', hectares: results.usableArableHa + params.marketGardenHa, draw: drawArable },
  ].filter(area => area.hectares > 0.01);
  const widths = planAreaWidths(areas);

  let svg = element('rect', { x: 0, y: 0, width, height, fill: 'var(--surface)' });
  svg += drawAccessRoad();

  let x = pad;
  areas.forEach((area, index) => {
    const box = { x, y: top, width: widths[index], height: height - top - pad };
    svg += area.draw(box, results, rotation);
    x += box.width + gap;
  });

  byId('plan-svg').innerHTML = svg;
  byId('plan-info').innerHTML = describePlanSelection(results, planView.selectedArea || 'pasture');
}

function renderPlanMonthButtons() {
  document
    .querySelectorAll('[data-month]')
    .forEach(button => button.classList.toggle('on', +button.dataset.month === planView.month));
}

function renderPlanYearButtons(rotation) {
  const buttons = Array.from({ length: rotation.fieldCount }, (_, index) => {
    const year = index + 1;
    const className = year === planView.rotationYear ? 'btn on' : 'btn';
    return element('button', { class: className, type: 'button', 'data-year': year }, year);
  });
  byId('plan-years').innerHTML = `<span class="lab">${t('plan.rotationYear')}</span>` + buttons.join('');
}

function drawAccessRoad() {
  const { width, pad } = PLAN_SIZE;
  const month = messages('months.names')[planView.month].toLowerCase();
  const road = element('line', {
    x1: pad,
    x2: width - pad,
    y1: 22,
    y2: 22,
    stroke: 'var(--muted)',
    'stroke-width': 2,
    'stroke-dasharray': '10 6',
  });
  return road + element('text', { x: pad, y: 15, class: 'ax' }, t('plan.road', { month }));
}

/** Widths proportional to area, at least `minAreaWidth`, shrinking the wide ones to fit. */
function planAreaWidths(areas) {
  const { width, pad, gap, minAreaWidth } = PLAN_SIZE;
  const available = width - 2 * pad - (areas.length - 1) * gap;
  const totalHa = sumBy(areas, area => area.hectares) || 1;
  let widths = areas.map(area => Math.max(minAreaWidth, (area.hectares / totalHa) * available));

  const overflow = sumBy(widths, w => w) - available;
  if (overflow > 0) {
    const spare = widths.map(w => Math.max(0, w - minAreaWidth));
    const spareTotal = sumBy(spare, w => w) || 1;
    widths = widths.map((w, index) => w - (overflow * spare[index]) / spareTotal);
  }
  return widths;
}

/** Thicker outline of the clicked area. */
const selectionStroke = area => (planView.selectedArea === area ? { 'stroke-width': 3 } : {});

/** Background of a whole plan area, the clickable target of `data-area`. */
const areaBackground = (box, area, color, opacity) =>
  element('rect', {
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    fill: color,
    opacity,
    stroke: color,
    ...selectionStroke(area),
  });

/** Centred label; clicks go through to the area under it. */
const planLabel = (x, y, text, size = 12, bold = false) =>
  element(
    'text',
    {
      x,
      y,
      'text-anchor': 'middle',
      'font-size': size,
      'font-weight': bold ? 700 : null,
      'pointer-events': 'none',
    },
    escapeHtml(text)
  );

const areaCaption = (box, text) =>
  element('text', { x: box.x + box.width / 2, y: box.y - 6, 'text-anchor': 'middle', class: 'ax' }, text);

/** White box behind a label in the middle of an area. */
const labelBackground = (x, y, width, height, opacity) =>
  element('rect', { x, y, width, height, rx: 6, fill: 'var(--surface)', opacity });

function drawFarmyard(box, results) {
  const winter = !isGrazingMonth(planView.month);
  const label = key => t(`plan.farmyard.${key}`);
  const henHousing = params.winterPolytunnel
    ? label(winter ? 'tunnelWinter' : 'tunnelSummer')
    : label(winter ? 'henHousesWinter' : 'henHousesSummer');

  const blocks = [
    { text: label('house'), share: 0.12 },
    { text: label('oldBarn'), share: 0.14, shown: params.dairyCows > 0 },
    {
      text: label(winter ? 'cattleShedWinter' : 'cattleShedSummer'),
      share: 0.14,
      shown: params.dairyCows + params.sucklerCows > 0,
      occupied: winter,
    },
    {
      text: label(winter ? 'sheepShedWinter' : 'sheepShedSummer'),
      share: 0.1,
      shown: params.sheep + params.goats > 0,
      occupied: winter,
    },
    { text: henHousing, share: 0.09, shown: params.layingHens > 0, occupied: winter },
    {
      text: t('plan.farmyard.orchard', {
        geese: params.geese ? t('planInfo.farmyard.withGeese') : '',
        hectares: formatNumber(results.orchardHa, 1),
      }),
      share: 0.18,
      color: 'var(--color-pasture)',
    },
    {
      text: t('plan.farmyard.kitchenGarden', { hectares: formatNumber(params.kitchenGardenHa, 2) }),
      share: 0.09,
      color: 'var(--color-cereal)',
    },
  ].filter(block => block.shown !== false);

  let svg = areaBackground(box, 'farmyard', 'var(--color-farmyard)', '.18');

  const blockX = box.x + 8;
  const blockWidth = box.width - 16;
  const shareTotal = sumBy(blocks, block => block.share);
  let blockY = box.y + 8;
  for (const block of blocks) {
    const blockHeight = ((box.height - 16 - (blocks.length - 1) * 6) * block.share) / shareTotal;
    svg += element('rect', {
      x: blockX,
      y: blockY,
      width: blockWidth,
      height: blockHeight,
      rx: 3,
      fill: block.color || (block.occupied ? 'var(--color-cattle)' : 'var(--surface)'),
      opacity: block.color ? 0.35 : block.occupied ? 0.3 : 1,
      stroke: 'var(--color-farmyard)',
    });

    // a "|" in the text starts a new line
    const lines = block.text.split('|');
    lines.forEach((line, index) => {
      const lineY = blockY + blockHeight / 2 + 4 + (index - (lines.length - 1) / 2) * 14;
      svg += planLabel(blockX + blockWidth / 2, lineY, line);
    });
    blockY += blockHeight + 6;
  }

  const caption = t('plan.farmyard.caption', { hectares: formatNumber(params.farmyardHa, 1) });
  return element('g', { 'data-area': 'farmyard' }, svg + areaCaption(box, caption));
}

const PADDOCK_FILLS = {
  dairyCows: 'var(--color-cattle)',
  sucklerCows: 'var(--color-cattle)',
  sheep: 'var(--color-sheep)',
  layingHens: 'var(--color-poultry)',
  nextPaddock: 'var(--color-pasture)',
};

/**
 * Which paddock holds which animals this month: cows move forward every few days, sheep
 * follow one paddock behind, the mobile hen house three behind, suckler cows graze apart.
 */
function paddockOccupants(paddockCount) {
  const occupants = {};
  if (!isGrazingMonth(planView.month)) return occupants;

  const position = ((planView.month - 3) * 3 + 2) % paddockCount;
  const paddockAt = offset => (position + offset + paddockCount) % paddockCount;
  if (params.dairyCows) occupants[position] = 'dairyCows';
  if (params.dairyCows) occupants[paddockAt(1)] = 'nextPaddock';
  if (params.sheep) occupants[paddockAt(-1)] = 'sheep';
  if (params.layingHens) occupants[paddockAt(-3)] = 'layingHens';
  if (params.sucklerCows) occupants[paddockAt(10)] = 'sucklerCows';
  if (!params.dairyCows && params.sheep) occupants[position] = 'sheep';
  return occupants;
}

function paddockLabel(occupant) {
  if (!occupant) return '';
  if (occupant === 'sheep')
    return t(params.dairyCows ? 'plan.pasture.sheepAfterCows' : 'plan.pasture.sheepToday');
  return t(`plan.pasture.${occupant}`);
}

/** Pasture as two columns of paddocks with a lane between them. */
function drawPasture(box) {
  const laneWidth = 16;
  const rows = 10;
  const paddockCount = rows * 2;
  const paddockWidth = (box.width - laneWidth) / 2;
  const paddockHeight = box.height / rows;
  const occupants = paddockOccupants(paddockCount);

  let svg = areaBackground(box, 'pasture', 'var(--color-pasture)', '.22');

  for (let side = 0; side < 2; side++) {
    for (let row = 0; row < rows; row++) {
      // paddocks are numbered down the left column and back up the right one
      const occupant = occupants[side ? paddockCount - 1 - row : row];
      const x = box.x + (side ? (box.width + laneWidth) / 2 : 0);
      const y = box.y + row * paddockHeight;
      const isCattle = occupant === 'dairyCows' || occupant === 'sucklerCows';

      svg += element('rect', {
        x: x + 2,
        y: y + 2,
        width: paddockWidth - 4,
        height: paddockHeight - 4,
        fill: PADDOCK_FILLS[occupant] || 'none',
        opacity: isCattle ? 0.5 : occupant ? 0.32 : 1,
        stroke: 'var(--color-pasture)',
        'stroke-width': 1,
      });

      const label = paddockLabel(occupant);
      if (label) {
        svg += planLabel(
          x + paddockWidth / 2,
          y + paddockHeight / 2 + 4,
          label,
          11.5,
          occupant === 'dairyCows'
        );
      }
    }
  }

  const centreX = box.x + box.width / 2;
  svg += element('rect', {
    x: box.x + (box.width - laneWidth) / 2,
    y: box.y,
    width: laneWidth,
    height: box.height,
    fill: 'var(--surface)',
    stroke: 'var(--color-pasture)',
  });
  svg += element('line', {
    // water pipe along the lane
    x1: centreX,
    x2: centreX,
    y1: box.y + 4,
    y2: box.y + box.height - 4,
    stroke: 'var(--info)',
    'stroke-width': 2.5,
    'stroke-dasharray': '2 5',
  });

  if (!isGrazingMonth(planView.month)) {
    const centreY = box.y + box.height / 2;
    svg +=
      labelBackground(box.x + 20, centreY - 24, box.width - 40, 48, '.92') +
      planLabel(centreX, centreY - 3, t('plan.pasture.winterTitle'), 13, true) +
      planLabel(centreX, centreY + 15, t('plan.pasture.winterNote'), 11.5);
  }

  const caption = t('plan.pasture.caption', {
    hectares: formatNumber(params.pastureHa, 1),
    paddocks: paddockCount,
    paddockHa: formatNumber(params.pastureHa / paddockCount, 2),
  });
  return element('g', { 'data-area': 'pasture' }, svg + areaCaption(box, caption));
}

function drawMeadow(box) {
  const month = planView.month;
  const isCuttingMonth = month === 5 || month === 7;

  let svg = areaBackground(box, 'meadow', 'var(--color-meadow)', isCuttingMonth ? 0.55 : 0.3);
  for (let y = box.y + 14; y < box.y + box.height; y += 14) {
    svg += element('line', {
      x1: box.x + 6,
      x2: box.x + box.width - 6,
      y1: y,
      y2: y,
      stroke: 'var(--color-meadow)',
      'stroke-width': 1,
      opacity: '.6',
    });
  }

  const centreX = box.x + box.width / 2;
  const centreY = box.y + box.height / 2;
  svg +=
    labelBackground(box.x + 10, centreY - 26, box.width - 20, 44, '.9') +
    planLabel(centreX, centreY - 8, t('plan.meadow.title'), 14, true) +
    planLabel(centreX, centreY + 9, t(`plan.meadow.months.${month}`), 12);

  const caption = t('plan.meadow.caption', { hectares: formatNumber(params.meadowHa, 1) });
  return element('g', { 'data-area': 'meadow' }, svg + areaCaption(box, caption));
}

/** Rotation fields stacked by area, plus the market garden. */
function drawArable(box, results, rotation) {
  const fieldHa = results.usableArableHa / rotation.fieldCount;
  const strips = [];
  for (let field = 1; field <= rotation.fieldCount; field++) {
    const crop = fieldCrop(rotation, field, planView.rotationYear);
    strips.push({
      area: 'plot' + field,
      title: t('plan.arable.field', { field, crop: cropWithNote(crop) }),
      subtitle: t('plan.arable.fieldDetail', {
        hectares: formatNumber(fieldHa, 2),
        status: fieldStatus(field, planView.rotationYear, planView.month, rotation),
      }),
      hectares: fieldHa,
      color: CROP_COLORS[crop.id],
    });
  }
  if (params.marketGardenHa > 0.01) {
    strips.push({
      area: 'garden',
      title: t('plan.arable.marketGarden'),
      subtitle: t('units.hectares', { value: formatNumber(params.marketGardenHa, 2) }),
      hectares: params.marketGardenHa,
      color: 'var(--color-produce)',
    });
  }

  // every strip is at least 54 px high, then all are scaled to fill the box
  const totalHa = sumBy(strips, strip => strip.hectares) || 1;
  const minimumHeights = strips.map(strip => Math.max(54, (box.height * strip.hectares) / totalHa));
  const heightSum = sumBy(minimumHeights, h => h);
  const heights = minimumHeights.map(h => (h * box.height) / heightSum);

  let svg = '';
  let y = box.y;
  strips.forEach((strip, index) => {
    const stripHeight = heights[index];
    const centreX = box.x + box.width / 2;
    const background = element('rect', {
      x: box.x,
      y,
      width: box.width,
      height: stripHeight,
      fill: strip.color,
      opacity: index % 2 ? 0.42 : 0.3,
      stroke: strip.color,
      ...selectionStroke(strip.area),
    });
    const labels =
      planLabel(centreX, y + stripHeight / 2 - 4, strip.title, 12.5, true) +
      planLabel(centreX, y + stripHeight / 2 + 13, strip.subtitle, 11.5);
    svg += element('g', { 'data-area': strip.area }, background + labels);
    y += stripHeight;
  });

  const caption = t('plan.arable.caption', {
    hectares: formatNumber(results.usableArableHa + params.marketGardenHa, 1),
    year: planView.rotationYear,
  });
  return svg + areaCaption(box, caption);
}
