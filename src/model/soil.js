// Soil classes and climate: yield multipliers for arable land, pasture and hay meadows.
//
// Each land use has its own shares of class III, V and VI soil (the rest is class IV). The
// climate of the chosen location scales the yields against the reference location, more on
// light soils, which hold less water.

/** Land uses with their own soil classes; parameter ids are e.g. `pastureSoilVShare`. */
const SOIL_LAND_USES = ['arable', 'pasture', 'meadow'];

/** Soil classes with their own share slider (class IV is the rest). */
const SOIL_CLASSES_WITH_SHARE = ['III', 'V', 'VI'];

/** Yield relative to class IV soil: arable crops, and grass (pasture and meadow). */
const SOIL_CLASS_YIELD = {
  arable: { III: 1.2, IV: 1, V: 0.75, VI: 0.55 },
  grass: { III: 1.1, IV: 1, V: 0.85, VI: 0.7 },
};

/** How strongly yields follow rainfall on each soil class (lighter soils hold less water). */
const RAINFALL_SENSITIVITY_BY_SOIL_CLASS = { III: 0.6, IV: 0.8, V: 1.1, VI: 1.4 };

/** Relative yield change per relative rainfall change on class IV soil, for grass and for crops. */
const GRASS_RAINFALL_RESPONSE = 0.75;
const CROP_RAINFALL_RESPONSE = 0.4;

/** Limits of the rainfall effect: above about 800 mm water rarely limits yields any more. */
const RAINFALL_FACTOR_RANGE = [0.65, 1.1];

/** Relative change of grass growth per relative change of the grazing season length. */
const GRASS_SEASON_RESPONSE = 0.7;

/** Arable yields fall by this share for every 100 m above 400 m (shorter, cooler summer). */
const CROP_LOSS_PER_100_M_ABOVE_400 = 0.05;
const ALTITUDE_WITHOUT_LOSS_M = 400;

const soilShareId = (landUse, soilClass) => `${landUse}Soil${soilClass}Share`;

/** Shares of class III, IV, V and VI soil (0–1) of one land use. */
function soilClassShares(params, landUse) {
  const shares = {};
  for (const soilClass of SOIL_CLASSES_WITH_SHARE)
    shares[soilClass] = (params[soilShareId(landUse, soilClass)] || 0) / 100;
  const others = sumValues(shares);
  if (others > 1) for (const soilClass in shares) shares[soilClass] /= others;
  shares.IV = Math.max(0, 1 - sumValues(shares));
  return shares;
}

/** Average of a value per soil class, weighted by the shares of the soil classes. */
const weightedBySoil = (shares, valueByClass) =>
  Object.entries(shares).reduce((sum, [soilClass, share]) => sum + share * valueByClass[soilClass], 0);

/**
 * @param {object} params
 * @returns {{arable: number, pasture: number, meadow: number}} yield multipliers from the soil classes
 */
function computeSoilFactors(params) {
  return {
    arable: weightedBySoil(soilClassShares(params, 'arable'), SOIL_CLASS_YIELD.arable),
    pasture: weightedBySoil(soilClassShares(params, 'pasture'), SOIL_CLASS_YIELD.grass),
    meadow: weightedBySoil(soilClassShares(params, 'meadow'), SOIL_CLASS_YIELD.grass),
  };
}

/**
 * Yield multipliers from the climate of the chosen location against the reference location.
 * @param {object} params
 * @returns {{arable: number, pasture: number, meadow: number, seasonDays: number}}
 */
function computeClimateFactors(params) {
  const location = locationById(params.location);
  const reference = LOCATIONS[0];
  const relativeRainfall = location.rainfallMm / reference.rainfallMm - 1;
  const seasonDays = grazingSeasonDays(location);
  const seasonFactor = 1 + GRASS_SEASON_RESPONSE * (seasonDays / grazingSeasonDays(reference) - 1);
  const altitude = (location.altitude[0] + location.altitude[1]) / 2;
  const altitudeFactor =
    1 - Math.max(0, altitude - ALTITUDE_WITHOUT_LOSS_M) * (CROP_LOSS_PER_100_M_ABOVE_400 / 100);

  const rainfallFactor = (landUse, response) => {
    const sensitivity = weightedBySoil(soilClassShares(params, landUse), RAINFALL_SENSITIVITY_BY_SOIL_CLASS);
    return clamp(1 + response * sensitivity * relativeRainfall, ...RAINFALL_FACTOR_RANGE);
  };
  return {
    arable: rainfallFactor('arable', CROP_RAINFALL_RESPONSE) * altitudeFactor,
    pasture: rainfallFactor('pasture', GRASS_RAINFALL_RESPONSE) * seasonFactor,
    meadow: rainfallFactor('meadow', GRASS_RAINFALL_RESPONSE) * seasonFactor,
    seasonDays,
  };
}
