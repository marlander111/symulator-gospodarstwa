// Ready-made variants, assumption sets and the user's own variants saved in this browser.

function buildPresets() {
  const presetButton = preset =>
    element(
      'button',
      {
        class: 'btn',
        type: 'button',
        'data-preset': preset.id,
        title: hasMessage(`presets.${preset.id}.description`)
          ? escapeHtml(t(`presets.${preset.id}.description`))
          : null,
      },
      escapeHtml(t(`presets.${preset.id}.label`)) +
        ' ' +
        element('small', {}, escapeHtml(t(`presets.${preset.id}.note`)))
    );
  const assumptionButton = set =>
    element(
      'button',
      { class: 'btn', type: 'button', 'data-assumption': set.id },
      escapeHtml(t(`assumptionSets.${set.id}`))
    );
  const pessimisticToggle = element(
    'button',
    { class: 'btn ghost', type: 'button', id: 'view-pessimistic', 'aria-pressed': 'false' },
    t('presets.showPessimistic')
  );

  const farmPresets = PRESETS.filter(preset => !isPhilosophyPreset(preset));
  const philosophyPresets = PRESETS.filter(isPhilosophyPreset);
  byId('preset-buttons').insertAdjacentHTML('beforeend', farmPresets.map(presetButton).join(''));
  byId('philosophy-buttons').insertAdjacentHTML('beforeend', philosophyPresets.map(presetButton).join(''));
  byId('assumption-buttons').insertAdjacentHTML(
    'beforeend',
    ASSUMPTION_SETS.map(assumptionButton).join('') + pessimisticToggle
  );

  byId('view-pessimistic').addEventListener('click', () => {
    showPessimistic = !showPessimistic;
    byId('view-pessimistic').setAttribute('aria-pressed', showPessimistic);
    byId('view-pessimistic').classList.toggle('on', showPessimistic);
    render();
  });
  document
    .querySelectorAll('[data-preset]')
    .forEach(button => button.addEventListener('click', () => choosePreset(button.dataset.preset)));
  document
    .querySelectorAll('[data-assumption]')
    .forEach(button =>
      button.addEventListener('click', () => chooseAssumptionSet(button.dataset.assumption))
    );
}

/** Applies a ready-made variant and remembers it for the next visit. */
function choosePreset(id) {
  const preset = presetById(id);
  applyParams(preset.params);
  rememberChoice('preset', id, preset.params);
}

/** Applies an assumption set (prices, yields, work norms) and remembers it. */
function chooseAssumptionSet(id) {
  const set = assumptionSetById(id);
  applyParams(set.params);
  rememberChoice('assumption', id, set.params);
}

function applyParams(values) {
  endHistoryStep(); // a preset or a button is a step of its own
  Object.assign(params, values);
  syncInputs();
  onParamsChanged();
}

// ---------- Saved variants ----------

const SAVED_VARIANTS_STORAGE_KEY = 'gosp-lwowek-moje-v1';
const savedVariants = loadSavedVariants();

function loadSavedVariants() {
  try {
    const stored = JSON.parse(localStorage.getItem(SAVED_VARIANTS_STORAGE_KEY) || '[]') || [];
    // version 1 stored the settings under `p` with Polish parameter ids
    return stored.map(variant => ({
      name: variant.name,
      params: migrateLegacyParameterIds(variant.params || variant.p),
    }));
  } catch (error) {
    return [];
  }
}

/** @returns {boolean} false when the browser does not allow saving */
function storeSavedVariants() {
  try {
    localStorage.setItem(SAVED_VARIANTS_STORAGE_KEY, JSON.stringify(savedVariants));
    return true;
  } catch (error) {
    return false;
  }
}

function buildSavedVariants() {
  const nameInput = byId('saved-variant-name');
  byId('save-variant').addEventListener('click', () => {
    const name =
      (nameInput.value || '').trim() || t('savedVariants.defaultName', { number: savedVariants.length + 1 });
    const existing = savedVariants.findIndex(variant => variant.name === name);
    const variant = { name, params: { ...params } };
    if (existing >= 0) savedVariants[existing] = variant;
    else savedVariants.push(variant);

    const stored = storeSavedVariants();
    nameInput.value = '';
    byId('saved-variants-note').textContent = stored
      ? t('savedVariants.saved', { name })
      : t('savedVariants.storageUnavailable');
    renderSavedVariants();
    render();
  });
  nameInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') byId('save-variant').click();
  });
  renderSavedVariants();
}

function renderSavedVariants() {
  byId('saved-variants').innerHTML = savedVariants
    .map((variant, index) => {
      const name = escapeHtml(variant.name);
      const deleteLabel = t('savedVariants.delete', { name });
      return (
        `<button class="btn" type="button" data-saved-variant="${index}">${name}` +
        `<span class="x" data-delete-variant="${index}" role="button" aria-label="${deleteLabel}" ` +
        `title="${t('savedVariants.deleteTitle')}">×</span></button>`
      );
    })
    .join('');

  document.querySelectorAll('[data-saved-variant]').forEach(button =>
    button.addEventListener('click', event => {
      const index = +button.dataset.savedVariant;
      if (event.target.closest('[data-delete-variant]')) {
        savedVariants.splice(index, 1);
        storeSavedVariants();
        renderSavedVariants();
        render();
        return;
      }
      endHistoryStep();
      params = { ...defaultParams(), ...savedVariants[index].params };
      syncInputs();
      onParamsChanged();
    })
  );
}

// ---------- Which buttons match the current settings ----------

/** True when every value of the set equals the current one (numbers compared with a tolerance). */
function matchesCurrentParams(values) {
  return Object.entries(values).every(([id, value]) =>
    typeof value === 'number' ? Math.abs(params[id] - value) < 1e-9 : params[id] === value
  );
}

/** True when a saved variant has exactly the current settings. */
function equalsCurrentParams(values) {
  return PARAMETERS.every(
    parameter => values[parameter.id] === undefined || values[parameter.id] === params[parameter.id]
  );
}

function markActivePresets() {
  const highlight = (selector, isActive) =>
    document.querySelectorAll(selector).forEach(button => button.classList.toggle('on', isActive(button)));
  highlight('[data-preset]', button => matchesCurrentParams(presetById(button.dataset.preset).params));
  highlight('[data-assumption]', button =>
    matchesCurrentParams(assumptionSetById(button.dataset.assumption).params)
  );
  highlight('[data-saved-variant]', button =>
    equalsCurrentParams(savedVariants[+button.dataset.savedVariant].params)
  );
}
