// "Previous data": every change of the settings is remembered, so the user can step back.
// Changes that follow each other quickly (dragging a slider) count as one step.

const HISTORY_LIMIT = 30;
/** Pause after which the next change starts a new step. */
const HISTORY_STEP_PAUSE_MS = 800;

const paramsHistory = [];
/** Settings as they were before the change that is going on now. */
let settledParams = { ...params };
let stepTimer = 0;

/** Called on every change of the settings (from onParamsChanged). */
function recordParamsChange() {
  if (!stepTimer && !haveSameValues(settledParams, params)) {
    paramsHistory.push(settledParams);
    if (paramsHistory.length > HISTORY_LIMIT) paramsHistory.shift();
  }
  clearTimeout(stepTimer);
  stepTimer = setTimeout(endHistoryStep, HISTORY_STEP_PAUSE_MS);
  renderUndoButton();
}

/** Closes the current step, so that the next change can be undone on its own. */
function endHistoryStep() {
  clearTimeout(stepTimer);
  stepTimer = 0;
  settledParams = { ...params };
}

/** Restores the settings from before the last step. */
function restorePreviousParams() {
  const previous = paramsHistory.pop();
  if (!previous) return;

  clearTimeout(stepTimer);
  stepTimer = 0;
  params = { ...previous };
  settledParams = { ...previous };
  syncInputs();
  render();
  saveParams();
  renderUndoButton();
}

function renderUndoButton() {
  byId('undo-params').disabled = paramsHistory.length === 0;
}

const haveSameValues = (a, b) => Object.keys(a).every(id => a[id] === b[id]);

// ---------- Clear everything ----------

/** Animal numbers set to zero by "clear everything". */
const ANIMAL_PARAMETER_IDS = [
  'dairyCows',
  'sucklerCows',
  'layingHens',
  'broilers',
  'geese',
  'ducks',
  'turkeys',
  'guineaFowl',
  'rabbits',
  'sheep',
  'goats',
  'pigs',
  'guardDogs',
  'horses',
  'beehives',
];

/** No animals, and all land apart from the farmyard sown with cereals. */
function clearAllParams() {
  const cleared = Object.fromEntries(ANIMAL_PARAMETER_IDS.map(id => [id, 0]));
  applyParams({
    ...cleared,
    pastureHa: 0,
    meadowHa: 0,
    marketGardenHa: 0,
    orchardHa: 0,
    cerealShare: parameterById('cerealShare').max,
    rootCrops: false,
    fruitSoldShare: 0,
    mushroomLogs: 0,
  });
}

function bindDataTools() {
  byId('clear-all').addEventListener('click', clearAllParams);
  byId('undo-params').addEventListener('click', restorePreviousParams);
  renderUndoButton();
}
