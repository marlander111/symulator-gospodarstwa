// Crop rotation: clover with grass for one or more years, then cereals, optionally with one year
// of root crops before the last spring cereal (as in the Norfolk four-course rotation). Every year
// each crop moves one field further. The same layout is drawn in the "Crop rotation" panel.

/** Cereal order after clover for 1–7 cereal years. */
const CEREAL_SEQUENCES = {
  1: ['oats'],
  2: ['triticale', 'oats'],
  3: ['triticale', 'rye', 'oats'],
  4: ['triticale', 'mixedGrain', 'rye', 'oats'],
  5: ['triticale', 'mixedGrain', 'rye', 'triticale', 'oats'],
  6: ['triticale', 'mixedGrain', 'rye', 'triticale', 'mixedGrain', 'oats'],
  7: ['triticale', 'mixedGrain', 'rye', 'triticale', 'mixedGrain', 'rye', 'oats'],
};

/** Root crops (potatoes, fodder beet) need at least this many non-clover years in the rotation. */
const MIN_CEREAL_YEARS_FOR_ROOTS = 2;

const SPRING_SOWN_CROPS = ['oats', 'mixedGrain', 'roots'];

const WINTER_CEREALS = ['triticale', 'rye'];

/** Crops after which a catch crop can grow until the spring-sown crop that follows. */
const isCerealBeforeCatchCrop = (crop, nextCrop) =>
  isWinterCatchCropSlot(crop) && SPRING_SOWN_CROPS.includes(nextCrop);

/** Crops harvested early enough to leave the field free for a cover crop. */
const isWinterCatchCropSlot = crop => crop !== 'clover' && crop !== 'oats' && crop !== 'roots';

/** Crops after which a stubble crop can grow until a winter cereal is sown. */
const isCerealBeforeWinterCereal = (crop, nextCrop) =>
  isWinterCatchCropSlot(crop) && WINTER_CEREALS.includes(nextCrop);

/**
 * @param {object} params
 * @returns {{fieldCount: number, cloverYears: number, cerealYears: number, rootFields: number,
 *   rootCropsFit: boolean, crops: string[],
 *   catchCropFields: number, undersownFields: number, stubbleCropFields: number, manuredFields: number,
 *   distinctCrops: number, cerealShare: number, diversityOk: boolean}}
 */
function computeRotation(params) {
  const fieldCount = Math.round(params.rotationFields);
  const cloverYears = Math.min(
    fieldCount - 1,
    Math.max(1, Math.round((1 - params.cerealShare / 100) * fieldCount))
  );
  const cerealYears = fieldCount - cloverYears;
  const rootCropsFit = cerealYears >= MIN_CEREAL_YEARS_FOR_ROOTS;
  const rootFields = params.rootCrops && rootCropsFit ? 1 : 0;
  const crops = [...Array(cloverYears).fill('clover'), ...cropsAfterClover(cerealYears, rootFields > 0)];

  let catchCropFields = 0;
  let undersownFields = 0;
  let stubbleCropFields = 0;
  let manuredFields = 0;
  crops.forEach((crop, index) => {
    const nextCrop = crops[(index + 1) % fieldCount];
    if (isCerealBeforeCatchCrop(crop, nextCrop)) catchCropFields++;
    if (crop === 'oats') undersownFields++; // clover is undersown in oats
    if (isCerealBeforeWinterCereal(crop, nextCrop)) stubbleCropFields++;
    if (nextCrop === 'triticale' || nextCrop === 'oats' || nextCrop === 'roots') manuredFields++;
  });

  const distinct = [...new Set(crops)];
  const largestShare = Math.max(...distinct.map(crop => crops.filter(c => c === crop).length)) / fieldCount;
  const diversityOk =
    distinct.length >= 3 &&
    cerealYears / fieldCount <= 0.65 &&
    cloverYears / fieldCount >= 0.2 &&
    largestShare <= 0.65;

  return {
    fieldCount,
    cloverYears,
    cerealYears,
    rootFields,
    rootCropsFit,
    crops,
    catchCropFields,
    undersownFields,
    stubbleCropFields,
    manuredFields,
    distinctCrops: distinct.length,
    cerealShare: cerealYears / fieldCount,
    diversityOk,
  };
}

/** Crops after the clover years; with root crops they replace the cereal before the last oats. */
function cropsAfterClover(cerealYears, withRootCrops) {
  const crops = [...CEREAL_SEQUENCES[cerealYears]];
  if (withRootCrops) crops[crops.length - 2] = 'roots';
  return crops;
}

/**
 * Position in `rotation.crops` of the crop growing on a field (1-based) in a rotation year
 * (1-based): every year each crop moves one field further.
 * @param {{fieldCount: number}} rotation
 */
function rotationPosition(rotation, field, year) {
  return (field - 1 + (year - 1)) % rotation.fieldCount;
}
