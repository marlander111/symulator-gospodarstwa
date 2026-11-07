// Rotational grazing: how often the cows move to a fresh paddock and after how many days a
// paddock is grazed again. Together they set the number of paddocks, and they change how much
// of the grass the animals actually eat and how many hours moving the fences takes.
//
// The pasture yield and the work norms assume a move once a day and a 30–45 day rest.

/** Share of the grass eaten, relative to one move a day, by days spent in one paddock. */
const UTILISATION_BY_MOVE_INTERVAL = [
  [0.5, 1.04],
  [1, 1],
  [2, 0.96],
  [3, 0.93],
  [4, 0.9],
  [7, 0.84],
];

/** Regrowth relative to a 30–45 day rest: shorter rests weaken the grass, longer ones age it. */
const REGROWTH_BY_REST_DAYS = [
  [20, 0.9],
  [25, 0.95],
  [30, 0.99],
  [35, 1],
  [45, 1],
  [60, 0.97],
];

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
  const hasGrazingHerd = params.dairyCows + params.sucklerCows + params.sheep > 0;

  return {
    moveIntervalDays,
    restDays,
    paddockCount,
    paddockHa: params.pastureHa / paddockCount,
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
