// Crop rotation: clover with grass for one or more years, then cereals. Every year each crop
// moves one field further. The same layout is drawn in the "Crop rotation" panel.

/** Cereal order after clover for 1–5 cereal years. */
const CEREAL_SEQUENCES = {
  1: ['oats'],
  2: ['triticale', 'oats'],
  3: ['triticale', 'rye', 'oats'],
  4: ['triticale', 'mixedGrain', 'rye', 'oats'],
  5: ['triticale', 'mixedGrain', 'rye', 'triticale', 'oats'],
};

const WINTER_CEREALS = ['triticale', 'rye'];

/** Crops after which a catch crop can grow until the spring-sown crop that follows. */
const isCerealBeforeCatchCrop = (crop, nextCrop) =>
  crop !== 'clover' && crop !== 'oats' && (nextCrop === 'oats' || nextCrop === 'mixedGrain');

/** Crops after which a stubble crop can grow until a winter cereal is sown. */
const isCerealBeforeWinterCereal = (crop, nextCrop) =>
  crop !== 'clover' && crop !== 'oats' && WINTER_CEREALS.includes(nextCrop);

/**
 * @param {object} params
 * @returns {{fieldCount: number, cloverYears: number, cerealYears: number, crops: string[],
 *   catchCropFields: number, undersownFields: number, stubbleCropFields: number, manuredFields: number,
 *   distinctCrops: number, cerealShare: number, diversityOk: boolean}}
 */
function computeRotation(params) {
  const fieldCount = params.rotationFields;
  const cloverYears = Math.min(
    fieldCount - 1,
    Math.max(1, Math.round((1 - params.cerealShare / 100) * fieldCount))
  );
  const cerealYears = fieldCount - cloverYears;
  const crops = [...Array(cloverYears).fill('clover'), ...CEREAL_SEQUENCES[cerealYears]];

  let catchCropFields = 0;
  let undersownFields = 0;
  let stubbleCropFields = 0;
  let manuredFields = 0;
  crops.forEach((crop, index) => {
    const nextCrop = crops[(index + 1) % fieldCount];
    if (isCerealBeforeCatchCrop(crop, nextCrop)) catchCropFields++;
    if (crop === 'oats') undersownFields++; // clover is undersown in oats
    if (isCerealBeforeWinterCereal(crop, nextCrop)) stubbleCropFields++;
    if (nextCrop === 'triticale' || nextCrop === 'oats') manuredFields++;
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

/**
 * Position in `rotation.crops` of the crop growing on a field (1-based) in a rotation year
 * (1-based): every year each crop moves one field further.
 * @param {{fieldCount: number}} rotation
 */
function rotationPosition(rotation, field, year) {
  return (field - 1 + (year - 1)) % rotation.fieldCount;
}
