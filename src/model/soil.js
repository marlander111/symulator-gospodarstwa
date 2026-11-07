// Soil classes: yield multipliers relative to class IV soil (the rest of the land).

/**
 * @param {object} params
 * @returns {{arable: number, grassland: number}} yield multipliers for arable land and grassland
 */
function computeSoilFactors(params) {
  const classIII = params.soilClassIIIShare / 100;
  const classV = params.soilClassVShare / 100;
  const classVI = params.soilClassVIShare / 100;
  const classIV = Math.max(0, 1 - classIII - classV - classVI);
  const total = classIII + classIV + classV + classVI || 1;

  return {
    arable: (classIII * 1.2 + classIV + classV * 0.75 + classVI * 0.55) / total,
    grassland: (classIII * 1.1 + classIV + classV * 0.85 + classVI * 0.7) / total,
  };
}
