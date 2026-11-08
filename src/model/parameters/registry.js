// Registry of input parameters (sliders, switches and choices) shown in the controls panel.
//
// Every parameter has an `id` (the key in the params object), a `defaultValue` and one of:
// - a numeric range (`min`, `max`, `step`): a slider;
// - `type: 'boolean'`: a switch;
// - `type: 'choice'` with `options` (ids): a row of buttons; `sets` maps an option to the slider
//   values it moves (e.g. a breed sets typical milk yields).
// `advanced: true` marks a slider that is rarely changed; `hidden: true` keeps a parameter out of
// the controls panel (it is set elsewhere on the page). Texts: locales → parameters.<id>.
// Optional `hectaresOf` (a land use) adds a field in hectares next to a share slider, and
// `totalOf` (a parameter in hectares) adds a field for the total next to a price per hectare.

/** All parameters in display order, filled by the group files in this directory. */
const PARAMETERS = [];

/** Parameter group ids in display order (titles: locales → parameterGroups). */
const PARAMETER_GROUP_IDS = [];

/** Groups that are not shown in the controls panel (their parameters are set by other panels). */
const HIDDEN_PARAMETER_GROUPS = new Set(['infrastructure']);

/**
 * Parameters that start a titled, collapsible subsection inside their group (titles: locales →
 * subsections.<id>). Advanced subsections start collapsed.
 */
const SUBSECTIONS = new Map([
  ['cheeseShare', { advanced: true }],
  ['lactationsPerCow', { advanced: true }],
  ['flockReplacementYears', { advanced: true }],
  ['broilers', { advanced: false }],
  ['geese', { advanced: false }],
  ['ducks', { advanced: false }],
  ['turkeys', { advanced: false }],
  ['guineaFowl', { advanced: false }],
  ['rabbits', { advanced: false }],
  ['weanerWeightKg', { advanced: true }],
  ['lambLiveWeightKg', { advanced: true }],
  ['kidsPerDoe', { advanced: true }],
  ['goatMilking', { advanced: true }],
  ['pigGrainKg', { advanced: true }],
  ['horseCost', { advanced: true }],
  ['abattoirDistanceKm', { advanced: false }],
  ['guardDogs', { advanced: false }],
  ['costPerDog', { advanced: true }],
  ['marketGardenHa', { advanced: false }],
  ['fruitSoldShare', { advanced: false }],
  ['mushroomLogs', { advanced: false }],
  ['beehives', { advanced: false }],
  ['geeseProcessedShare', { advanced: false }],
  ['lambProcessedShare', { advanced: false }],
  ['preservesFruitShare', { advanced: false }],
  ['processingMaterialsShare', { advanced: true }],
  ['shippedShare', { advanced: true }],
  ['loyalCustomerSpendPerMonth', { advanced: true }],
  ['organicPayment', { advanced: false }],
  ['catchCrops', { advanced: false }],
  ['extensiveGrasslandScheme', { advanced: false }],
  ['welfareCowsGrazing', { advanced: true }],
  ['arableCostPerHa', { advanced: false }],
  ['costPerCow', { advanced: true }],
  ['fixedCosts', { advanced: false }],
  ['grainPurchasePrice', { advanced: true }],
  ['boughtForageShare', { advanced: true }],
  ['dairyFixedHours', { advanced: false }],
  ['hensFixedHours', { advanced: true }],
  ['hoursPerEwe', { advanced: true }],
  ['hayHoursPerHa', { advanced: true }],
  ['investCattleShed', { advanced: false }],
  ['investElectricFencing', { advanced: true }],
  ['investDairy', { advanced: true }],
  ['investTractor', { advanced: true }],
  ['investMarketGarden', { advanced: true }],
  ['investOther', { advanced: false }],
  ['rotationFields', { advanced: true }],
  ['arableSoilIIIShare', { advanced: true }],
  ['grazingMoveIntervalDays', { advanced: false }],
  ['householdChildren', { advanced: false }],
  ['riskYieldVolatility', { advanced: true }],
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

/** Slider values a choice moves when this option is picked (empty when it moves none). */
function valuesSetByChoice(parameter, option) {
  const set = parameter.sets && parameter.sets[option];
  return (set && (set.sliders || set)) || {};
}
