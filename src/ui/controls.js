// Controls panel: one collapsible group per parameter group, with collapsible subsections
// (advanced ones start closed), sliders, switches and choice buttons bound to `params`.
// Share sliders of soil classes get a field in hectares, the lease rent a field for the total.

const OPEN_GROUPS = [];

function buildControls() {
  let html = '';
  for (const group of PARAMETER_GROUP_IDS) {
    if (HIDDEN_PARAMETER_GROUPS.has(group)) continue;
    const parameters = PARAMETERS.filter(item => item.group === group && !item.hidden);
    const isOpen = OPEN_GROUPS.includes(group) ? 'open' : '';
    const title = element('span', {}, t(`parameterGroups.${group}`));
    const summary = element('span', { class: 'sumv', id: `summary-${group}` });
    html += `<details class="grp" id="group-${group}" ${isOpen}>
      <summary>${title}${summary}</summary>
      <div class="grp-body">${groupBodyHtml(parameters)}</div></details>`;
  }
  html += `<button class="btn ghost reset" id="reset" type="button">${t('controls.reset')}</button>`;
  byId('controls').innerHTML = html;

  for (const parameter of PARAMETERS) if (!parameter.hidden) bindControl(parameter);
  byId('reset').addEventListener('click', () => {
    endHistoryStep();
    params = defaultParams();
    syncInputs();
    onParamsChanged();
  });
}

/** Controls of one group; a subsection runs until the next one starts or the group ends. */
function groupBodyHtml(parameters) {
  let html = '';
  let inSubsection = false;
  for (const parameter of parameters) {
    const subsection = SUBSECTIONS.get(parameter.id);
    if (subsection) {
      if (inSubsection) html += '</div></details>';
      html += subsectionStartHtml(parameter.id, subsection);
      inSubsection = true;
    }
    html += controlHtml(parameter);
  }
  return inSubsection ? html + '</div></details>' : html;
}

function subsectionStartHtml(id, { advanced }) {
  const tag = advanced ? element('span', { class: 'tag' }, t('controls.advanced')) : '';
  const title = element('span', {}, escapeHtml(t(`subsections.${id}`)) + tag);
  return `<details class="sub${advanced ? ' adv' : ''}" ${advanced ? '' : 'open'}><summary>${title}</summary><div class="sub-body">`;
}

function controlHtml(parameter) {
  const { id } = parameter;
  const label = escapeHtml(parameterLabel(parameter));
  const hint = escapeHtml(parameterHint(parameter));
  let html = '';

  if (parameter.type === 'boolean') {
    const help = hint ? `<br><span class="help muted small">${hint}</span>` : '';
    html += `<label class="sw"><input type="checkbox" id="input-${id}"><span>${label}${help}</span></label>`;
  } else if (parameter.type === 'choice') {
    const buttons = parameter.options
      .map(option =>
        element(
          'button',
          { class: 'btn', type: 'button', 'data-choice': id, 'data-option': option },
          escapeHtml(t(`parameters.${id}.options.${option}`))
        )
      )
      .join('');
    const help = hint ? element('p', { class: 'help' }, hint) : '';
    html += `<div class="ctl ctl-choice">
      <div class="ctl-top"><span>${label}</span></div>
      <div class="seg" role="group" id="input-${id}" aria-label="${label}">${buttons}</div>${help}
    </div>`;
  } else {
    const help = hint ? element('p', { class: 'help' }, hint) : '';
    const slider = voidElement('input', {
      type: 'range',
      id: `input-${id}`,
      min: parameter.min,
      max: parameter.max,
      step: parameter.step,
    });
    html += `<div class="ctl${parameter.advanced ? ' adv' : ''}">
      <div class="ctl-top"><label for="input-${id}">${label}</label><output id="output-${id}"></output></div>
      ${slider}${extraFieldHtml(parameter)}${help}
    </div>`;
  }
  // arable land is what remains after the land uses above it
  if (id === 'meadowHa') html += `<div class="derived" id="derived-arable"></div>`;
  return html;
}

/** A field in hectares next to a share slider, or a field for the total next to a price per hectare. */
function extraFieldHtml(parameter) {
  if (parameter.hectaresOf) {
    const input = voidElement('input', { type: 'number', id: `ha-${parameter.id}`, min: 0, step: 0.05 });
    return element(
      'div',
      { class: 'ctl-extra ctl-ha' },
      `<label>${t('controls.hectaresField')} ${input} ha</label>` +
        element('span', { id: `ha-of-${parameter.id}` })
    );
  }
  if (parameter.totalOf) {
    const input = voidElement('input', { type: 'number', id: `total-${parameter.id}`, min: 0, step: 100 });
    return element(
      'div',
      { class: 'ctl-extra ctl-total' },
      `<label>${t('controls.totalField')} ${input} ${t('controls.totalUnit')}</label>`
    );
  }
  return '';
}

function bindControl(parameter) {
  if (parameter.type === 'choice') {
    byId('input-' + parameter.id).addEventListener('click', event => {
      const button = event.target.closest('[data-option]');
      if (button) chooseOption(parameter, button.dataset.option);
    });
    return;
  }
  const input = byId('input-' + parameter.id);
  if (parameter.type === 'boolean') {
    input.addEventListener('change', () => {
      params[parameter.id] = input.checked;
      onParamsChanged();
    });
    return;
  }
  input.addEventListener('input', () => {
    params[parameter.id] = parseFloat(input.value);
    byId('output-' + parameter.id).textContent = formatParameterValue(parameter, params[parameter.id]);
    onParamsChanged();
  });
  if (parameter.hectaresOf) bindHectaresField(parameter);
  if (parameter.totalOf) bindTotalField(parameter);
}

/** Picks an option of a choice and moves the sliders it sets to their typical values. */
function chooseOption(parameter, option) {
  endHistoryStep();
  params = { ...params, [parameter.id]: option, ...valuesSetByChoice(parameter, option) };
  syncInputs();
  onParamsChanged();
}

/** Hectares of the land use a soil-class share slider belongs to. */
function landUseArea(landUse) {
  if (landUse === 'pasture') return params.pastureHa;
  if (landUse === 'meadow') return params.meadowHa;
  return computeLandUse(params).usableArableHa;
}

function bindHectaresField(parameter) {
  const field = byId('ha-' + parameter.id);
  field.addEventListener('change', () => {
    const area = landUseArea(parameter.hectaresOf);
    const hectares = Math.max(0, parseFloat(field.value) || 0);
    params[parameter.id] = area > 0 ? Math.min(parameter.max, (hectares / area) * 100) : 0;
    syncInputs();
    onParamsChanged();
  });
}

function bindTotalField(parameter) {
  const field = byId('total-' + parameter.id);
  field.addEventListener('change', () => {
    const hectares = params[parameter.totalOf];
    if (hectares <= 0) return;
    const total = Math.max(0, parseFloat(field.value) || 0);
    params[parameter.id] = Math.min(parameter.max, total / hectares);
    syncInputs();
    onParamsChanged();
  });
}

/** Moves every control to the current value in `params`. */
function syncInputs() {
  for (const parameter of PARAMETERS) {
    if (parameter.hidden) continue;
    if (parameter.type === 'choice') {
      byId('input-' + parameter.id)
        .querySelectorAll('[data-option]')
        .forEach(button => button.classList.toggle('on', button.dataset.option === params[parameter.id]));
      continue;
    }
    const input = byId('input-' + parameter.id);
    if (parameter.type === 'boolean') {
      input.checked = !!params[parameter.id];
    } else {
      input.value = params[parameter.id];
      byId('output-' + parameter.id).textContent = formatParameterValue(parameter, params[parameter.id]);
    }
  }
  syncDerivedFields();
}

/**
 * Updates the hectare and total fields, which depend on other sliders too (the area of the land
 * use, the leased hectares). The field being typed in is left alone.
 */
function syncDerivedFields() {
  for (const parameter of PARAMETERS) {
    if (parameter.hectaresOf) {
      const field = byId('ha-' + parameter.id);
      const area = landUseArea(parameter.hectaresOf);
      if (field !== document.activeElement) field.value = ((params[parameter.id] / 100) * area).toFixed(2);
      byId('ha-of-' + parameter.id).textContent = t('controls.hectaresOf', { area: formatNumber(area, 2) });
    }
    if (parameter.totalOf) {
      const field = byId('total-' + parameter.id);
      const hectares = params[parameter.totalOf];
      field.disabled = hectares <= 0;
      if (field !== document.activeElement) field.value = Math.round(params[parameter.id] * hectares);
    }
  }
}
