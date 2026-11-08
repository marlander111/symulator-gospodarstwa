// Location of the farm, chosen once from the list in the page header. It sets the grazing season
// slider to the local one and scales the yields by the local climate (model/soil.js); the
// header shows the climate facts of the chosen region.

function buildLocationPicker() {
  const select = byId('location-select');
  select.innerHTML = LOCATIONS.map(location =>
    element('option', { value: location.id }, escapeHtml(t(`locations.${location.id}`)))
  ).join('');
  select.addEventListener('change', () => chooseOption(parameterById('location'), select.value));
}

/** "20 IV" in Polish, "20 Apr" in English. */
const seasonDate = ([month, day]) =>
  t('location.date', { day, month: messages('months.numerals')[month - 1] });

/** Start and end of the local grazing season, e.g. { start: "20 IV", end: "31 X" }. */
function grazingSeasonDates() {
  const location = locationById(params.location);
  return { start: seasonDate(location.grazingStart), end: seasonDate(location.grazingEnd) };
}

function renderLocation(results) {
  const location = locationById(params.location);
  byId('location-select').value = location.id;
  const [latitude, latitudeMinutes] = location.latitude;
  const [longitude, longitudeMinutes] = location.longitude;
  const pad = minutes => String(minutes).padStart(2, '0');
  const facts = [
    t('location.coordinates', {
      latitude,
      latitudeMinutes: pad(latitudeMinutes),
      longitude,
      longitudeMinutes: pad(longitudeMinutes),
    }),
    t('location.altitude', { low: location.altitude[0], high: location.altitude[1] }),
    t('location.rainfall', { mm: formatNumber(location.rainfallMm, 0) }),
    t('location.temperature', {
      low: formatNumber(location.temperatureC[0], 1),
      high: formatNumber(location.temperatureC[1], 1),
    }),
    t('location.grazing', {
      start: seasonDate(location.grazingStart),
      end: seasonDate(location.grazingEnd),
      days: results.climate.seasonDays,
    }),
  ];
  if (location.id !== LOCATIONS[0].id)
    facts.push(
      t('location.yieldEffect', {
        grass: formatNumber(results.climate.pasture * 100, 0),
        crops: formatNumber(results.climate.arable * 100, 0),
      })
    );
  byId('location-facts').innerHTML = facts.map(fact => element('span', {}, escapeHtml(fact))).join('');
}
