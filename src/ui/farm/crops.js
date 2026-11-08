// Crops of the rotation, catch-crop and stubble-crop mixtures, and what happens on a field
// in a given month (the mixtures themselves: model/data/cover-crops.js). Texts: locales → crops,
// catchCropMixes, stubbleCropMixes, fieldStatus.

const CROP_COLORS = {
  clover: 'var(--color-clover)',
  triticale: 'var(--color-cereal)',
  rye: 'var(--color-cereal)',
  mixedGrain: 'var(--color-cereal)',
  oats: 'var(--color-cereal)',
  roots: 'var(--color-roots)',
};

const cropName = id => t(`crops.${id}.name`);
const currentCatchMix = () => CATCH_CROP_MIXES[params.catchCropMix || 0];
const catchMixLabel = () => t(`catchCropMixes.${currentCatchMix().id}`).toLowerCase();
const stubbleMixLabel = () =>
  t(`stubbleCropMixes.${STUBBLE_CROP_MIXES[params.stubbleCropMix || 0].id}`).toLowerCase();

/** The current rotation (see model/rotation.js). */
const currentRotation = () => computeRotation(params);

/**
 * Crop on a field (1-based) in a rotation year (1-based); `note` numbers the clover years
 * when clover stays for more than one year.
 */
function fieldCrop(rotation, field, year) {
  const position = rotationPosition(rotation, field, year);
  const id = rotation.crops[position];
  const note =
    id === 'clover' && rotation.cloverYears > 1 ? t('crops.cloverYear', { year: position + 1 }) : '';
  return { id, note };
}

/** Crop name with the clover year, e.g. "Koniczyna czerwona z trawami (rok 2)". */
const cropWithNote = crop => cropName(crop.id) + (crop.note ? ` (${crop.note})` : '');

/** What happens on a field in a month (0–11) of a rotation year, given the crops before and after. */
function fieldStatus(field, year, month, rotation) {
  const crop = fieldCrop(rotation, field, year).id;
  const next = fieldCrop(rotation, field, year + 1).id;
  const previous = fieldCrop(rotation, field, year - 1 + rotation.fieldCount).id;
  const nextName = cropName(next).toLowerCase();
  const status = (key, index, values) => t(`fieldStatus.${key}.${index}`, values);

  if (month <= 2 && isCerealBeforeCatchCrop(previous, crop))
    return params.catchCrops ? status('catchCropInSpring', month) : messages(`crops.${crop}.months`)[month];
  if (month >= 7 && isCerealBeforeCatchCrop(crop, next))
    return params.catchCrops
      ? status('catchCropAfterHarvest', month - 7, { mix: catchMixLabel() })
      : status('noCatchCropAfterHarvest', month - 7);
  if (month >= 7 && month <= 8 && params.stubbleCrop && isCerealBeforeWinterCereal(crop, next)) {
    const incorporation = t(
      GRAZED_STUBBLE_MIX_IDS.includes(STUBBLE_CROP_MIXES[params.stubbleCropMix || 0].id)
        ? 'fieldStatus.stubbleCutOrGrazed'
        : 'fieldStatus.stubblePloughed'
    );
    return status('stubbleCrop', month - 7, { mix: stubbleMixLabel(), incorporation, crop: nextName });
  }
  if (month >= 7 && isCerealBeforeWinterCereal(crop, next))
    return status('beforeWinterCereal', month - 7, { crop: nextName });
  if (month >= 8 && crop === 'clover' && WINTER_CEREALS.includes(next))
    return status('cloverBeforeWinterCereal', month - 8, { crop: nextName });
  if (month >= 8 && isWinterCatchCropSlot(crop) && !WINTER_CEREALS.includes(next))
    return status('stubbleBeforeSpringCrop', month - 8);
  return messages(`crops.${crop}.months`)[month];
}
