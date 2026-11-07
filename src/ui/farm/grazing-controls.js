// Rotational grazing in the farm plan: how often the cows move, after how many days they come
// back to a paddock, the resulting paddocks (the fourth note under the plan), and the rotation
// year, which is chosen in the "Crop rotation" panel.

/** Move intervals offered as buttons (days in one paddock); 0.5 = twice a day. */
const MOVE_INTERVAL_OPTIONS = [0.5, 1, 2, 3, 4, 7];

/** Rest periods offered as buttons, up to Salatin's 60 days. */
const REST_DAYS_OPTIONS = [20, 25, 30, 35, 40, 45, 50, 60];

const SQUARE_METRES_PER_HECTARE = 10000;

/** Locale key of a named move interval; other intervals use the generic "every N days". */
const NAMED_MOVE_INTERVALS = { 0.5: 'twiceDaily', 1: 'daily', 7: 'weekly' };

/** Button text for a move interval, e.g. "co 2 dni". */
const moveIntervalLabel = days =>
  NAMED_MOVE_INTERVALS[days]
    ? t(`plan.grazing.intervalButtons.${NAMED_MOVE_INTERVALS[days]}`)
    : t('plan.grazing.everyDays', { days: formatNumber(days, Number.isInteger(days) ? 0 : 1) });

/** Move interval inside a sentence, e.g. "dwa razy dziennie". */
const moveIntervalPhrase = days =>
  NAMED_MOVE_INTERVALS[days]
    ? t(`plan.grazing.intervalPhrases.${NAMED_MOVE_INTERVALS[days]}`)
    : t('plan.grazing.everyDays', { days: formatNumber(days, Number.isInteger(days) ? 0 : 1) });

/** Paddock area as hectares, or square metres when under half a hectare. */
function paddockAreaText(hectares) {
  if (hectares >= 0.5) return t('units.hectares', { value: formatNumber(hectares, 2) });
  const squareMetres = Math.round((hectares * SQUARE_METRES_PER_HECTARE) / 10) * 10;
  return t('plan.grazing.squareMetres', { value: formatNumber(squareMetres, 0) });
}

function renderGrazingControls(rotation) {
  const option = (attribute, value, isOn, text) =>
    element('button', { class: isOn ? 'btn on' : 'btn', type: 'button', [attribute]: value }, text);
  const moveButtons = MOVE_INTERVAL_OPTIONS.map(days =>
    option('data-move-interval', days, days === params.grazingMoveIntervalDays, moveIntervalLabel(days))
  );
  const restButtons = REST_DAYS_OPTIONS.map(days =>
    option('data-rest-days', days, days === params.pastureRestDays, t('plan.grazing.days', { days }))
  );
  const lineBreak = element('span', { style: 'flex-basis:100%' });
  const rotationYear = t('plan.grazing.rotationYear', {
    year: planView.rotationYear,
    count: rotation.fieldCount,
  });

  byId('plan-grazing').innerHTML =
    element('span', { class: 'lab' }, t('plan.grazing.moveLabel')) +
    moveButtons.join('') +
    lineBreak +
    element('span', { class: 'lab' }, t('plan.grazing.restLabel')) +
    restButtons.join('') +
    lineBreak +
    element('span', { class: 'lab' }, rotationYear);
}

/** Fourth note under the plan: paddocks, their size, and what the choice changes. */
function renderGrazingNote(results) {
  const plan = results.grazingPlan;
  const title = element('h3', {}, t('plan.grazing.noteTitle'));
  if (params.pastureHa <= 0) {
    byId('grazing-note').innerHTML = title + element('p', {}, t('plan.grazing.noPasture'));
    return;
  }

  const squareSide = Math.sqrt(plan.paddockHa * SQUARE_METRES_PER_HECTARE);
  const yieldChange = Math.round((plan.yieldFactor - 1) * 100);
  const hoursChange = Math.round(plan.extraMoveHours);
  const signed = value => (value > 0 ? '+' : value < 0 ? '−' : '±') + formatNumber(Math.abs(value), 0);

  const summary = t('plan.grazing.noteSummary', {
    interval: moveIntervalPhrase(plan.moveIntervalDays),
    rest: plan.restDays,
    paddocks: plan.paddockCount,
    area: paddockAreaText(plan.paddockHa),
    side: formatNumber(squareSide, 0),
    grazings: formatNumber(plan.grazingsPerPaddock, 1),
  });
  const effects = [
    t('plan.grazing.noteYield', { change: signed(yieldChange) }),
    t('plan.grazing.noteHours', { change: signed(hoursChange) }),
    t('plan.grazing.noteSalatin'),
  ];
  byId('grazing-note').innerHTML =
    title +
    element('p', {}, summary) +
    element('ul', {}, effects.map(effect => element('li', {}, effect)).join(''));
}
