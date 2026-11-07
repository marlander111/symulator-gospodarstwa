// Registry of input parameters (sliders and switches) shown in the controls panel.
//
// Every parameter has an `id` (the key in the params object), a `defaultValue` and either a numeric
// range (`min`, `max`, `step`) or `type: 'boolean'`. `advanced: true` hides it behind
// "show advanced settings". Texts live in locales/pl.json under `parameters.<id>`.

/** All parameters in display order, filled by the group files in this directory. */
const PARAMETERS = [];

/** Parameter group ids in display order (titles: locales/pl.json → parameterGroups). */
const PARAMETER_GROUP_IDS = [];

/** Parameters that start a titled subsection inside their group (titles: locales/pl.json → subsections). */
const SUBSECTION_START_IDS = new Set([
  'dairyCows',
  'cheeseShare',
  'ownBull',
  'layingHens',
  'ownHatching',
  'winterPolytunnel',
  'pulletPrice',
  'broilers',
  'geese',
  'ducks',
  'turkeys',
  'guineaFowl',
  'rabbits',
  'sheep',
  'goats',
  'pigsForHome',
  'horses',
  'marketGardenHa',
  'fruitSoldShare',
  'mushroomLogs',
  'beehives',
  'geeseProcessedShare',
  'processingMaterialsShare',
  'shippedShare',
  'organicPayment',
  'catchCrops',
  'extensiveGrasslandScheme',
  'welfareCowsGrazing',
  'arableCostPerHa',
  'costPerCow',
  'fixedCosts',
  'grainPurchasePrice',
  'dairyFixedHours',
  'hensFixedHours',
  'hoursPerEwe',
  'hayHoursPerHa',
  'investCattleShed',
  'investElectricFencing',
  'investDairy',
  'investMarketGarden',
  'soilClassIIIShare',
  'rotationFields',
  'grazingMoveIntervalDays',
  'investOther',
]);

/**
 * Registers the parameters of one group.
 * @param {string} group - group id
 * @param {object[]} parameters - parameter definitions in display order
 */
function defineParameterGroup(group, parameters) {
  PARAMETER_GROUP_IDS.push(group);
  for (const parameter of parameters) PARAMETERS.push({ group, ...parameter });
}

/** Returns a params object with every parameter at its default value. */
function defaultParams() {
  const params = {};
  for (const parameter of PARAMETERS) params[parameter.id] = parameter.defaultValue;
  return params;
}

/** Returns the definition of the parameter with this id. */
function parameterById(id) {
  return PARAMETERS.find(parameter => parameter.id === id);
}
