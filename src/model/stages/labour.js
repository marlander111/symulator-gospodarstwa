// Working hours per year and per month.
// A stage of simulateFarm() (simulate-farm.js): reads params and earlier results, returns new results.

// ---------- Labour (hours per year) ----------

function computeLabour(params, results) {
  const hoursByActivity = hoursPerActivity(params, results);

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

/** Hours per year of every activity, from the herd sizes, areas and hour norms in the params. */
function hoursPerActivity(params, results) {
  const { replacementHeifers, bulls, sucklerCows, finishers, kidsSold } = results;
  return {
    dairyCows:
      params.dairyCows > 0
        ? params.dairyFixedHours +
          params.dairyCows * params.hoursPerCow +
          replacementHeifers * 15 +
          bulls * 20
        : 0,
    cheese: (results.milkForCheese / 100) * params.cheeseHoursPer100Litres,
    layingHens: params.layingHens > 0 ? params.hensFixedHours + params.layingHens * params.hoursPerHen : 0,
    hatching: results.chicks * params.hatchingHoursPerChick,
    broilers: params.broilers > 0 ? 30 + params.broilers * params.hoursPerBroiler : 0,
    geese: params.geese * params.hoursPerGoose,
    ducks: params.ducks > 0 ? 15 + params.ducks * params.hoursPerDuck : 0,
    catchCrops: (results.catchCropHa + results.stubbleCropHa) * params.catchCropHoursPerHa,
    beefCattle:
      sucklerCows > 0
        ? 20 +
          sucklerCows * params.hoursPerSucklerCow +
          finishers * params.hoursPerFinisher +
          ((finishers * params.finishersSoldAsMeatShare) / 100) * 6
        : 0,
    turkeys: params.turkeys > 0 ? 15 + params.turkeys * params.hoursPerTurkey : 0,
    guineaFowl: params.guineaFowl > 0 ? 15 + params.guineaFowl * params.hoursPerGuineaFowl : 0,
    processedGoods:
      results.processedValue > 0
        ? params.processingFixedHours +
          results.geeseProcessed * params.processingHoursPerGoose +
          results.ducksProcessed * params.processingHoursPerDuck +
          results.lambMeatProcessedKg * params.processingHoursPerLambKg +
          results.parcels * params.hoursPerParcel
        : 0,
    fruit: results.fruitSoldTonnes * params.fruitHoursPerTonne,
    mushrooms: params.mushroomLogs * params.mushroomLogHours,
    rabbits: params.rabbits * params.hoursPerRabbitDoe,
    sheep:
      params.sheep > 0
        ? 30 +
          params.sheep * params.hoursPerEwe * (0.6 + 0.4 * params.lambingsPerEwe) +
          results.abattoirTrips * 2 * params.abattoirTripHours +
          results.lambsSoldAsMeat * params.lambSalesHoursPerLamb
        : 0,
    horses: params.horses * params.hoursPerHorse,
    goats: params.goats * params.hoursPerGoat + kidsSold * 1,
    pigs: (params.pigsForHome + params.pigsForSale) * params.hoursPerPig + params.pigsForSale * 3,
    hay:
      (params.meadowHa + results.cloverHa + results.hayFromPasture / Math.max(1, params.meadowYield)) *
      params.hayHoursPerHa,
    cereals: results.cerealHa * params.cerealHoursPerHa,
    sales:
      (results.freshMilkSold / 100) * params.milkSalesHoursPer100Litres +
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
