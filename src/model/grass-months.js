// Monthly grass balance: how the herd's pasture grows through the year against what the grazing
// animals eat. The yearly grass total is the one of the feed balance; this spreads it over the
// months and gives the feed balance the hay made from the pasture and the hay the herd needs in
// the gaps.
//
// Grass grown before turnout is the cover the herd starts on. In the spring flush the surplus
// beyond about two weeks of grazing is cut for hay (May–July). From August the surplus is left
// standing for the autumn (stockpiling), and what is still standing at the end of the season is
// grazed for a few weeks more instead of hay. When the pasture grows less than the herd eats,
// standing grass, meadow aftermath and cover crops are used first, then hay.
//
// Rest and paddock size follow rational grazing (Voisin, and Salatin, Judy and other adaptive
// grazers after him): a paddock rests until its grass has grown back, so the rest is short in the
// spring flush and long in summer and autumn, while the area grazed a day stays about the same.

/**
 * Daily growth of the grass by month (January first) relative to the season average, typical of
 * permanent pasture in the lowlands and foothills of Poland and central Europe: a flush in May and
 * June, a slow-down in July and August and hardly any growth from November. Pasture growth
 * measurements in the region give about 60–90 kg DM/ha a day in May, 35–50 in July and 10–20 in
 * October (total growth; the grass eaten is about 70% of it).
 */
const GRASS_GROWTH_INDEX = [0, 0, 0.15, 0.75, 1.9, 1.55, 1, 0.85, 0.7, 0.35, 0.1, 0];

/** July and August grow less where the summers are dry: index × (0.4 + 0.6 × rainfall / reference). */
const SUMMER_MONTHS = [6, 7];
const REFERENCE_RAINFALL_MM = 680; // Sudeten Foothills, the reference location
const SUMMER_GROWTH_LIMITS = [0.8, 1.2];

/** Months in which a surplus paddock is cut for hay (May–July); later surplus is stockpiled. */
const HAY_CUTTING_MONTHS = new Set([4, 5, 6]);
/** Standing grass kept as a reserve when the surplus is cut: about two weeks of grazing. */
const STANDING_RESERVE_MONTHS = 0.5;
/** Standing grass lost a month to ageing, trampling and decay. */
const STANDING_LOSS_PER_MONTH = 0.1;
/** Hay made from the grass cut on the pasture (field and storage losses, uneven paddocks). */
const HAY_FROM_PASTURE_SHARE = 0.7;
/** Grass still standing when the season ends: grazed for up to a month more, 70% of it eaten. */
const LATE_GRAZING_MONTHS = 1;
const LATE_GRAZING_SHARE = 0.7;
/** Rest of a paddock in rational grazing: never shorter than this, and no longer worth more than this. */
const REST_DAYS_LIMITS = [20, 90];

// DAYS_IN_MONTH comes from labour-profiles.js
const MONTH_START_DAY = DAYS_IN_MONTH.map((_, month) => sumBy(DAYS_IN_MONTH.slice(0, month), days => days));

/** Grazing days in each month: from the local start of the season for params.grazingDays days. */
function grazingDaysByMonth(params) {
  const start = dayOfYear(locationById(params.location).grazingStart) - 1;
  const end = Math.min(365, start + params.grazingDays);
  return DAYS_IN_MONTH.map((days, month) => {
    const monthStart = MONTH_START_DAY[month];
    return Math.max(0, Math.min(end, monthStart + days) - Math.max(start, monthStart));
  });
}

/** Share of the year's grass growing in each month (sums to 1). */
function grassGrowthShares(params) {
  const summerFactor = clamp(
    0.4 + (0.6 * locationById(params.location).rainfallMm) / REFERENCE_RAINFALL_MM,
    ...SUMMER_GROWTH_LIMITS
  );
  const weights = DAYS_IN_MONTH.map(
    (days, month) => days * GRASS_GROWTH_INDEX[month] * (SUMMER_MONTHS.includes(month) ? summerFactor : 1)
  );
  const total = sumBy(weights, weight => weight);
  return weights.map(weight => weight / total);
}

/** Spreads a total over the given months in proportion to their grazing days (else the last month). */
function spreadOverGrazingMonths(total, months, daysByMonth) {
  const days = sumBy(months, month => daysByMonth[month]);
  const lastGrazingMonth = daysByMonth.reduce((last, monthDays, month) => (monthDays > 0 ? month : last), 0);
  return daysByMonth.map((_, month) => {
    if (days > 0) return months.includes(month) ? (total * daysByMonth[month]) / days : 0;
    return month === lastGrazingMonth ? total : 0;
  });
}

/**
 * @param {object} params
 * @param {object} feed - pastureProduction, meadowGrazing, coverCropForage and grazingNeed (t DM a
 *   year), herdHa and the grazing plan
 * @returns {{months: object[], turnoutCover: number, cutTonnes: number, hayMade: number,
 *   hayFed: number, lateGrazing: number, leftStanding: number}}
 */
function computeMonthlyGrass(params, feed) {
  const { herdHa, grazingPlan } = feed;
  const daysByMonth = grazingDaysByMonth(params);
  const firstMonth = daysByMonth.findIndex(days => days > 0);
  const grownByMonth = grassGrowthShares(params).map(share => share * feed.pastureProduction);
  // grass grows evenly within a month: the part grown before turnout is the starting cover
  const grownInSeason = grownByMonth.map(
    (grown, month) => (grown * daysByMonth[month]) / DAYS_IN_MONTH[month]
  );
  const turnoutCover =
    sumBy(grownByMonth.slice(0, Math.max(0, firstMonth + 1)), grown => grown) -
    (firstMonth >= 0 ? grownInSeason[firstMonth] : 0);
  // aftermath of the meadows after the second cut, and the stubble and catch crops in autumn
  const aftermath = spreadOverGrazingMonths(feed.meadowGrazing, [8, 9], daysByMonth);
  const coverCrops = spreadOverGrazingMonths(feed.coverCropForage, [8, 9, 10], daysByMonth);
  const demandPerDay = params.grazingDays > 0 ? Math.max(0, feed.grazingNeed) / params.grazingDays : 0;
  const seasonGrowth = sumBy(grownInSeason, grown => grown);
  const averageGrowth =
    herdHa > 0 && params.grazingDays > 0 ? (seasonGrowth * 1000) / herdHa / params.grazingDays : 0;
  const restTarget = params.pastureRestDays * averageGrowth; // kg DM/ha grown back between grazings

  let standing = turnoutCover;
  const months = [];
  daysByMonth.forEach((days, month) => {
    if (days === 0) return;
    const pasture = grownInSeason[month];
    const extra = aftermath[month] + coverCrops[month];
    const demand = demandPerDay * days;
    const standingIn = month === firstMonth ? standing : standing * (1 - STANDING_LOSS_PER_MONTH);
    const balance = pasture + extra + standingIn - demand;
    const reserve = HAY_CUTTING_MONTHS.has(month) ? demand * STANDING_RESERVE_MONTHS : Infinity;
    const cut = Math.max(0, balance - reserve);
    const deficit = Math.max(0, -balance);
    standing = Math.max(0, balance - cut);

    const growthPerHaDay = herdHa > 0 ? (pasture * 1000) / herdHa / days : 0;
    const restDays =
      growthPerHaDay > 0 ? clamp(restTarget / growthPerHaDay, ...REST_DAYS_LIMITS) : REST_DAYS_LIMITS[1];
    // pasture the herd needs this month: what the other forage leaves, at this month's growth
    const pastureNeedPerDay = (Math.max(0, demand - extra) / days) * 1000; // kg DM
    const areaNeededHa = growthPerHaDay > 0 ? pastureNeedPerDay / growthPerHaDay : herdHa;
    const stripM2 = rest =>
      growthPerHaDay > 0
        ? ((pastureNeedPerDay * grazingPlan.moveIntervalDays) / (growthPerHaDay * rest)) * 10000
        : 0;
    const paddocksInUse = Math.min(
      grazingPlan.paddockCount,
      grazingPlan.paddockHa > 0 ? Math.ceil(areaNeededHa / grazingPlan.paddockHa - 1e-9) : 0
    );
    months.push({
      month,
      days,
      growthPerHaDay,
      pasture,
      extra,
      demand,
      standingIn,
      cut,
      deficit,
      standingOut: standing,
      restDays,
      areaNeededHa,
      paddocksInUse,
      paddocksCut: cut > 0 ? grazingPlan.paddockCount - paddocksInUse : 0,
      stripM2: stripM2(restDays),
      stripFixedRestM2: stripM2(params.pastureRestDays),
      coverage: demand > 0 ? (pasture + extra + standingIn) / demand : 1,
    });
  });

  // grass grown after the season and what is still standing: a few more weeks of grazing
  const lastMonth = months.length ? months[months.length - 1].month : 11;
  const grownAfter =
    grownByMonth[lastMonth] -
    grownInSeason[lastMonth] +
    sumBy(grownByMonth.slice(lastMonth + 1), grown => grown);
  const leftStanding = standing + grownAfter;
  const lateGrazing = Math.min(leftStanding, demandPerDay * 30 * LATE_GRAZING_MONTHS) * LATE_GRAZING_SHARE;
  const cutTonnes = sumBy(months, item => item.cut);
  return {
    months,
    turnoutCover,
    cutTonnes,
    hayMade: cutTonnes * HAY_FROM_PASTURE_SHARE,
    hayFed: sumBy(months, item => item.deficit),
    lateGrazing,
    leftStanding,
  };
}
