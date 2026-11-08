// Rotational grazing: how often the cows move to a fresh paddock and after how many days a
// paddock is grazed again. Together they set the number of paddocks, and they change how much
// of the grass the animals actually eat and how many hours moving the fences takes.
//
// The pasture yield and the work norms assume a move once a day and a 35–50 day rest. The share of
// the grass eaten follows the usual figures: about 70% with a move once a day, about 60% with a
// move once a week and 30–40% with set stocking.

/** Share of the grass eaten, relative to one move a day, by days spent in one paddock. */
const UTILISATION_BY_MOVE_INTERVAL = [
  [0.5, 1.04],
  [1, 1],
  [2, 0.96],
  [3, 0.93],
  [4, 0.9],
  [7, 0.84],
];

/**
 * Regrowth relative to a 35–50 day rest: shorter rests weaken the roots, much longer ones leave old,
 * trampled grass. Over a whole season (fast spring, slow summer) 35–60 days is close to the optimum
 * of rational grazing (Voisin); the longest rests of adaptive grazing pay off in soil and drought
 * resilience more than in tonnes of grass in one year.
 */
const REGROWTH_BY_REST_DAYS = [
  [20, 0.88],
  [25, 0.94],
  [30, 0.98],
  [35, 1],
  [50, 1],
  [60, 0.99],
  [75, 0.96],
  [90, 0.92],
];

/**
 * Parts of the pasture fenced off for the pigs and for goats kept apart; the rest is grazed in
 * rotation by the cattle and sheep. When the paddocks would take more than the pasture, they
 * shrink to fit (the stocking per hectare is then higher than set).
 * @returns {{pigHa: number, goatHa: number, herdHa: number}}
 */
function separatePaddocks(params) {
  const pigWanted = params.pigsOnPasture ? params.pigs / params.pigsPerHaOfPaddock : 0;
  const goatWanted = params.goatGrazing === 'separate' ? params.goats / params.goatsPerHaOfPaddock : 0;
  const wanted = pigWanted + goatWanted;
  const fit = wanted > params.pastureHa && wanted > 0 ? params.pastureHa / wanted : 1;
  const pigHa = pigWanted * fit;
  const goatHa = goatWanted * fit;
  return { pigHa, goatHa, herdHa: Math.max(0, params.pastureHa - pigHa - goatHa), wantedHa: wanted };
}

/** Moves per day that the hour norms per cow already include. */
const BASELINE_MOVE_INTERVAL_DAYS = 1;

/**
 * @param {object} params
 * @returns {{moveIntervalDays: number, restDays: number, paddockCount: number, paddockHa: number,
 *   cycleDays: number, grazingsPerPaddock: number, yieldFactor: number, extraMoveHours: number}}
 */
function computeGrazingPlan(params) {
  const moveIntervalDays = params.grazingMoveIntervalDays;
  const restDays = params.pastureRestDays;
  const paddockCount = Math.ceil(restDays / moveIntervalDays) + 1;
  const cycleDays = paddockCount * moveIntervalDays;

  const movesPerSeason = params.grazingDays / moveIntervalDays;
  const baselineMoves = params.grazingDays / BASELINE_MOVE_INTERVAL_DAYS;
  const hasGrazingHerd = params.dairyCows + params.sucklerCows + params.sheep + params.goats > 0;

  return {
    moveIntervalDays,
    restDays,
    paddockCount,
    paddockHa: separatePaddocks(params).herdHa / paddockCount,
    cycleDays,
    grazingsPerPaddock: params.grazingDays / cycleDays,
    yieldFactor:
      interpolate(UTILISATION_BY_MOVE_INTERVAL, moveIntervalDays) *
      interpolate(REGROWTH_BY_REST_DAYS, restDays),
    extraMoveHours: hasGrazingHerd ? (movesPerSeason - baselineMoves) * params.paddockMoveHours : 0,
  };
}

/**
 * Linear interpolation in a table of [x, y] points sorted by x; outside the table the nearest
 * end value is used.
 */
function interpolate(points, x) {
  if (x <= points[0][0]) return points[0][1];
  for (let index = 1; index < points.length; index++) {
    const [x1, y1] = points[index];
    if (x <= x1) {
      const [x0, y0] = points[index - 1];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return points[points.length - 1][1];
}

// ---------- Parasites ----------
// Rotational grazing breaks the life cycle of the stomach and gut worms of ruminants: eggs in the
// dung become infective larvae (L3) in about 5–7 days in summer, so the herd leaves before then,
// and the larvae on the grass die off while the paddock rests. Orientation values for planning.

/** Half-life of infective larvae on pasture in the grazing season (warm weather; longer in the cold). */
const LARVAE_HALF_LIFE_DAYS = 20;
/** Days in a paddock before eggs passed there become infective larvae. */
const SAFE_GRAZING_DAYS = 4;
/** Cattle and sheep share few worm species and eat each other's larvae: share of the pressure left. */
const MIXED_GRAZING_LARVAE_FACTOR = 0.6;
/** Larvae passed and picked up again in the same paddock when the herd stays too long. */
const REINFECTION_FACTOR = 1.5;

/** How far the grazing breaks the worm cycle: share of larvae left after the rest, and why. */
function parasiteCycleBreak(params) {
  const cattle = params.dairyCows + params.sucklerCows > 0;
  const sheep = params.sheep > 0;
  const mixed = cattle && sheep;
  const reinfection = params.grazingMoveIntervalDays > SAFE_GRAZING_DAYS;
  const afterRest = 0.5 ** (params.pastureRestDays / LARVAE_HALF_LIFE_DAYS);
  const larvaeLeft = Math.min(
    1,
    afterRest * (mixed ? MIXED_GRAZING_LARVAE_FACTOR : 1) * (reinfection ? REINFECTION_FACTOR : 1)
  );
  return {
    ruminants: cattle || sheep || params.goats > 0,
    larvaeLeft,
    cycleBroken: 1 - larvaeLeft,
    mixed,
    reinfection,
    goatsWithSheep: params.goats > 0 && sheep && params.goatGrazing !== 'separate',
    poultry: params.layingHens + params.broilers > 0,
    poultryAfterCattle: params.layingHens > 0 && cattle,
  };
}
