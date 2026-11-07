// Controls panel: one collapsible group per parameter group, with subsection titles,
// sliders and switches bound to `params`.

const OPEN_GROUPS = [];

function buildControls() {
  let html = '';
  for (const group of PARAMETER_GROUP_IDS) {
    const isOpen = OPEN_GROUPS.includes(group) ? 'open' : '';
    const title = element('span', {}, t(`parameterGroups.${group}`));
    const summary = element('span', { class: 'sumv', id: `summary-${group}` });
    html += `<details class="grp" id="group-${group}" ${isOpen}>
      <summary>${title}${summary}</summary>
      <div class="grp-body">`;
    for (const parameter of PARAMETERS.filter(item => item.group === group)) html += controlHtml(parameter);
    html += `</div></details>`;
  }
  html += `<button class="btn ghost reset" id="reset" type="button">${t('controls.reset')}</button>`;
  byId('controls').innerHTML = html;

  for (const parameter of PARAMETERS) bindControl(parameter);
  byId('reset').addEventListener('click', () => {
    params = defaultParams();
    syncInputs();
    onParamsChanged();
  });
}

function controlHtml(parameter) {
  const { id } = parameter;
  const label = escapeHtml(parameterLabel(parameter));
  const hint = escapeHtml(parameterHint(parameter));
  let html = '';
  if (SUBSECTION_START_IDS.has(id))
    html += `<div class="ctl-sep" role="presentation">${escapeHtml(t(`subsections.${id}`))}</div>`;

  if (parameter.type === 'boolean') {
    const help = hint ? `<br><span class="help muted small">${hint}</span>` : '';
    html += `<label class="sw"><input type="checkbox" id="input-${id}"><span>${label}${help}</span></label>`;
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
      ${slider}${help}
    </div>`;
  }
  // arable land is what remains after the land uses above it
  if (id === 'meadowHa') html += `<div class="derived" id="derived-arable"></div>`;
  return html;
}

function bindControl(parameter) {
  const input = byId('input-' + parameter.id);
  if (parameter.type === 'boolean') {
    input.addEventListener('change', () => {
      params[parameter.id] = input.checked;
      onParamsChanged();
    });
  } else {
    input.addEventListener('input', () => {
      params[parameter.id] = parseFloat(input.value);
      byId('output-' + parameter.id).textContent = formatParameterValue(parameter, params[parameter.id]);
      onParamsChanged();
    });
  }
}

/** Moves every control to the current value in `params`. */
function syncInputs() {
  for (const parameter of PARAMETERS) {
    const input = byId('input-' + parameter.id);
    if (parameter.type === 'boolean') {
      input.checked = !!params[parameter.id];
    } else {
      input.value = params[parameter.id];
      byId('output-' + parameter.id).textContent = formatParameterValue(parameter, params[parameter.id]);
    }
  }
}
