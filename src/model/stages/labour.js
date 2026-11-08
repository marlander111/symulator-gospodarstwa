// Working hours per year and per month.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Labour (hours per year) ----------

function computeLabour(params, results) {
  const hoursByActivity = hoursPerActivity(params, results);
  addPaddockMoveHours(hoursByActivity, params, results.grazingPlan);
  subtractBaleGrazingManureHours(hoursByActivity, params, results.nitrogen);

  // the pessimistic scenario makes every job take longer
  const hoursMultiplier = params.hoursMultiplier || 1;
  for (const activity in hoursByActivity) hoursByActivity[activity] *= hoursMultiplier;

  const totalHours = sumValues(hoursByActivity);
  const monthlyHours = monthlyHoursByGroup(hoursByActivity);
  const peakMonthHours = Math.max(...monthlyHours.map(month => month.total));
  const availableHours = familyHoursPerYear(params);

  return {
    hoursByActivity,
    totalHours,
    monthlyHours,
    peakMonthHours,
    availableHours,
    labourUtilisation: availableHours > 0 ? totalHours / availableHours : 9,
    weeklyHoursAverage: totalHours / 52,
    weeklyHoursPeak: peakMonthHours / WEEKS_PER_MONTH,
    netPerHour: totalHours > 0 ? results.netIncome / totalHours : 0,
  };
}

/** Hours of fixed work a year for keeping a species at all (feeders, checks, records). */
const FIXED_HOURS = {
  broilers: 30,
  ducks: 15,
  turkeys: 15,
  guineaFowl: 15,
  sheep: 30,
  beefCattle: 20,
  pigs: 15,
};
/** Hours a year per replacement heifer and per bull, on top of the cows. */
const HOURS_PER_HEIFER = 15;
const HOURS_PER_BULL = 20;
/** Hours of making curd with skimming per 100 litres, and of churning per kg of butter. */
const CURD_HOURS_PER_100_LITRES = 1.5;
const BUTTER_HOURS_PER_KG = 0.15;
/** Selling meat boxes: hours per animal sold as meat (calls, handing out), beyond lambs. */
const BOX_SALE_HOURS = { finisher: 6, pig: 3, kid: 1 };

/** Hours per year of every activity, from the herd sizes, areas and hour norms in the params. */
function hoursPerActivity(params, results) {
  const { replacementHeifers, bulls, sucklerCows, finishers, kidsSold, slaughter, beefSystem } = results;
  const tripHours = species => slaughter.trips[species] * 2 * params.abattoirTripHours;
  const finishersAsMeat = (finishers * params.finishersSoldAsMeatShare) / 100;
  return {
    dairyCows:
      params.dairyCows > 0
        ? params.dairyFixedHours +
          params.dairyCows * params.hoursPerCow +
          replacementHeifers * HOURS_PER_HEIFER +
          bulls * HOURS_PER_BULL
        : 0,
    cheese:
      ((results.milkForCheese + results.goatMilkForCheese) / 100) * params.cheeseHoursPer100Litres +
      (results.milkForCurd / 100) * CURD_HOURS_PER_100_LITRES +
      results.butterKg * BUTTER_HOURS_PER_KG,
    layingHens: params.layingHens > 0 ? params.hensFixedHours + params.layingHens * params.hoursPerHen : 0,
    hatching: results.chicks * params.hatchingHoursPerChick,
    broilers: params.broilers > 0 ? FIXED_HOURS.broilers + params.broilers * params.hoursPerBroiler : 0,
    geese: params.geese * params.hoursPerGoose,
    ducks: params.ducks > 0 ? FIXED_HOURS.ducks + params.ducks * params.hoursPerDuck : 0,
    catchCrops: (results.catchCropHa + results.stubbleCropHa) * params.catchCropHoursPerHa,
    beefCattle:
      sucklerCows > 0
        ? FIXED_HOURS.beefCattle +
          sucklerCows * params.hoursPerSucklerCow +
          finishers * Math.max(1, params.hoursPerFinisher + beefSystem.extraHoursPerFinisher) +
          finishersAsMeat * BOX_SALE_HOURS.finisher +
          tripHours('beefCattle')
        : 0,
    turkeys: params.turkeys > 0 ? FIXED_HOURS.turkeys + params.turkeys * params.hoursPerTurkey : 0,
    guineaFowl:
      params.guineaFowl > 0 ? FIXED_HOURS.guineaFowl + params.guineaFowl * params.hoursPerGuineaFowl : 0,
    processedGoods:
      results.processedValue > 0
        ? params.processingFixedHours +
          results.geeseProcessed * params.processingHoursPerGoose +
          results.ducksProcessed * params.processingHoursPerDuck +
          results.lambMeatProcessedKg * params.processingHoursPerLambKg +
          results.porkProcessedKg * params.processingHoursPerPorkKg +
          results.beefProcessedKg * params.processingHoursPerBeefKg +
          (results.processedValueBySpecies.preserves / 1000) * params.preservesHoursPer1000Pln +
          results.parcels * params.hoursPerParcel
        : 0,
    fruit: results.fruitSoldTonnes * params.fruitHoursPerTonne,
    mushrooms: params.mushroomLogs * params.mushroomLogHours,
    rabbits: params.rabbits * params.hoursPerRabbitDoe,
    sheep:
      params.sheep > 0
        ? FIXED_HOURS.sheep +
          params.sheep * params.hoursPerEwe * (0.6 + 0.4 * params.lambingsPerEwe) +
          tripHours('sheep') +
          results.lambsSoldAsMeat * params.lambSalesHoursPerLamb
        : 0,
    horses:
      params.horses * params.hoursPerHorse +
      (params.horses > 0 ? params.ridesPerYear * params.hoursPerRide : 0),
    goats:
      params.goats * params.hoursPerGoat +
      (params.goatMilking ? params.goats * params.hoursPerMilkingGoat : 0) +
      kidsSold * BOX_SALE_HOURS.kid +
      tripHours('goats'),
    pigs:
      params.pigs > 0
        ? FIXED_HOURS.pigs + params.pigs * (params.hoursPerPig + BOX_SALE_HOURS.pig) + tripHours('pigs')
        : 0,
    guardDogs: params.guardDogs * params.hoursPerDog,
    hay:
      (params.meadowHa + results.cloverHa + results.hayFromPasture / Math.max(1, params.meadowYield)) *
      params.hayHoursPerHa,
    cereals: results.cerealHa * params.cerealHoursPerHa,
    rootCrops: results.rootCropHa * params.rootCropHoursPerHa,
    sales:
      ((results.freshMilkSold + results.goatMilkSold) / 100) * params.milkSalesHoursPer100Litres +
      (results.eggsSold / 100) * params.eggSalesHoursPer100 +
      params.salesFixedHours,
    general: params.generalHours,
    garden: (results.orchardHa + params.kitchenGardenHa) * params.gardenHoursPerHa,
    vegetables: params.marketGardenHa * params.vegetableHoursPerHa,
    beehives: params.beehives * params.hiveHours,
  };
}

/** Hours of each labour group in each month, spread by the activities' monthly profiles. */
function monthlyHoursByGroup(hoursByActivity) {
  return Array.from({ length: 12 }, (_, month) => {
    const hoursByGroup = {};
    for (const group of LABOUR_GROUPS)
      hoursByGroup[group.id] = group.activities.reduce(
        (sum, activity) => sum + (hoursByActivity[activity] / 12) * LABOUR_PROFILES[activity][month],
        0
      );
    hoursByGroup.total = sumValues(hoursByGroup);
    return hoursByGroup;
  });
}

/** Working hours the family has in a year: full-time, half-time and quarter-time people. */
function familyHoursPerYear(params) {
  const fullTimeEquivalents =
    params.fullTimeWorkers + 0.5 * params.halfTimeWorkers + 0.25 * params.quarterTimeWorkers;
  return fullTimeEquivalents * params.fullTimeHoursPerYear;
}

/**
 * Moving the fences more or less often than once a day changes the hours of the herd that leads
 * the grazing (the hour norms per animal include one move a day).
 */
function addPaddockMoveHours(hoursByActivity, params, grazingPlan) {
  const herd = leadingHerd(params);
  hoursByActivity[herd] = Math.max(0, hoursByActivity[herd] + grazingPlan.extraMoveHours);
}

/** Daily bedding in the shed that bale grazing saves through the winter (hours a day). */
const BALE_GRAZING_BEDDING_HOURS_PER_DAY = 0.15;

/**
 * With bale grazing the winter dung stays on the field and the animals need little bedding, so
 * there is less manure to load and spread and less straw to put down every day.
 */
function subtractBaleGrazingManureHours(hoursByActivity, params, nitrogen) {
  if (!params.baleGrazing || nitrogen.baleGrazingManureSavedTonnes <= 0) return;
  const winterDays = 365 - params.grazingDays;
  const savedHours =
    nitrogen.baleGrazingManureSavedTonnes * params.manureHoursPerTonne +
    winterDays * BALE_GRAZING_BEDDING_HOURS_PER_DAY;
  const herd = leadingHerd(params);
  hoursByActivity[herd] = Math.max(0, hoursByActivity[herd] - savedHours);
}

/** The herd that leads the grazing and whose hour norms include moving the fences. */
function leadingHerd(params) {
  if (params.dairyCows > 0) return 'dairyCows';
  if (params.sucklerCows > 0) return 'beefCattle';
  if (params.sheep > 0) return 'sheep';
  return params.goats > 0 ? 'goats' : 'dairyCows';
}
