// Remembers the last ready-made variant and assumption set chosen in this browser.
//
// On the next visit the app starts from the saved settings. If the user has not changed the
// values a preset set, the current version of that preset is loaded again (presets may have been
// improved since), so it stays selected. On the first visit the app starts from the realistic
// assumptions and the recommended variant.

const LAST_CHOICE_STORAGE_KEY = 'gosp-ostatni-wybor';
const DEFAULTS_VERSION_STORAGE_KEY = 'gosp-wersja-domyslnych';
const FIRST_VISIT_PRESET_ID = 'recommended';
const FIRST_VISIT_ASSUMPTION_SET_ID = 'realistic';

/** {preset: {id, values}, assumption: {id, values}} — what was chosen and the values it set. */
function loadLastChoice() {
  try {
    return JSON.parse(localStorage.getItem(LAST_CHOICE_STORAGE_KEY) || '{}') || {};
  } catch (error) {
    return {};
  }
}

/** Remembers a preset or assumption set right after it was applied. */
function rememberChoice(kind, id, values) {
  const choice = { ...loadLastChoice(), [kind]: { id, values } };
  try {
    localStorage.setItem(LAST_CHOICE_STORAGE_KEY, JSON.stringify(choice));
  } catch (error) {
    // storage unavailable: the choice is simply not remembered
  }
}

const assumptionSetById = id => ASSUMPTION_SETS.find(set => set.id === id);

/** Settings to start with: saved ones (with the last choice refreshed) or the first-visit default. */
function startupParams(saved, savedDefaultsVersion) {
  if (!saved) {
    const assumption = assumptionSetById(FIRST_VISIT_ASSUMPTION_SET_ID);
    const preset = presetById(FIRST_VISIT_PRESET_ID);
    rememberChoice('assumption', assumption.id, assumption.params);
    rememberChoice('preset', preset.id, preset.params);
    return { ...defaultParams(), ...assumption.params, ...preset.params };
  }

  let params = { ...defaultParams(), ...migrateChangedDefaults(saved, savedDefaultsVersion) };
  const lastChoice = loadLastChoice();
  const refresh = (choice, current) => {
    if (!choice || !current || !choice.values) return;
    const untouched = Object.entries(choice.values).every(([id, value]) => params[id] === value);
    if (untouched) {
      params = { ...params, ...current.params };
      rememberChoice(choice === lastChoice.preset ? 'preset' : 'assumption', current.id, current.params);
    }
  };
  refresh(lastChoice.assumption, lastChoice.assumption && assumptionSetById(lastChoice.assumption.id));
  refresh(lastChoice.preset, lastChoice.preset && presetById(lastChoice.preset.id));
  return params;
}

function rememberDefaultsVersion() {
  try {
    localStorage.setItem(DEFAULTS_VERSION_STORAGE_KEY, String(DEFAULTS_VERSION));
  } catch (error) {
    // nothing to do
  }
}
