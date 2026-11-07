// Event handlers of the farm plan, rotation and calendar: month and year buttons, rotation
// length, catch and stubble crops, and clicks on plan areas.

function buildPlanControls() {
  const monthNames = messages('months.names');
  byId('plan-months').innerHTML =
    `<span class="lab">${t('plan.month')}</span>` +
    messages('months.numerals')
      .map(
        (numeral, index) =>
          `<button class="btn" type="button" data-month="${index}" aria-label="${monthNames[index]}">${numeral}</button>`
      )
      .join('');

  const selectMonth = month => {
    planView.month = month;
    renderFarmPlan(planView.results);
    renderCalendar(planView.results);
  };
  const selectYear = year => {
    planView.rotationYear = year;
    renderFarmPlan(planView.results);
    renderRotation(planView.results);
  };
  const setParams = values => {
    Object.assign(params, values);
    syncInputs();
    onParamsChanged();
  };
  const onClick = (elementId, selector, handler) =>
    byId(elementId).addEventListener('click', event => {
      const target = event.target.closest(selector);
      if (target) handler(target.dataset);
    });

  onClick('plan-months', '[data-month]', data => selectMonth(+data.month));
  onClick('calendar-table', '[data-calendar-month]', data => selectMonth(+data.calendarMonth));
  onClick('plan-years', '[data-year]', data => selectYear(+data.year));
  onClick('rotation-table', '[data-year]', data => selectYear(+data.year));
  onClick('plan-svg', '[data-area]', data => {
    planView.selectedArea = data.area;
    renderFarmPlan(planView.results);
  });
  onClick('rotation-note', '[data-cereal-share]', data => setParams({ cerealShare: +data.cerealShare }));
  onClick('rotation-controls', '[data-rotation-fields]', data =>
    setParams({ rotationFields: +data.rotationFields })
  );
  onClick('rotation-controls', '[data-catch-crops]', data =>
    setParams({ catchCrops: data.catchCrops === '1' })
  );
  onClick('rotation-controls', '[data-stubble-crop]', data =>
    setParams({ stubbleCrop: data.stubbleCrop === '1' })
  );
  onClick('rotation-controls', '[data-catch-mix]', data => {
    const mix = CATCH_CROP_MIXES[+data.catchMix];
    setParams({
      catchCropMix: +data.catchMix,
      catchCropCostPerHa: mix.costPerHa,
      catchCropForageYield: mix.forageYield,
    });
  });
  onClick('rotation-controls', '[data-stubble-mix]', data => {
    const mix = STUBBLE_CROP_MIXES[+data.stubbleMix];
    setParams({
      stubbleCropMix: +data.stubbleMix,
      stubbleCropCostPerHa: mix.costPerHa,
      stubbleCropForageYield: mix.forageYield,
    });
  });
}
