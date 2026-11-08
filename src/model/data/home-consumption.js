// Food the family takes from its own farm before anything is sold. Names: locales → homeUse.<product>.

/** Yearly consumption of one adult (a child counts as CHILD_CONSUMPTION_SHARE of an adult). */
const HOME_CONSUMPTION_PER_ADULT = {
  eggs: 200, // pieces
  milk: 100, // litres
  cheese: 6, // kg
  curd: 5, // kg
  butter: 3, // kg
  cream: 3, // kg
  poultry: 12, // kg of carcass
  pork: 25, // kg of carcass
  beef: 8, // kg of carcass
  lamb: 3, // kg of carcass
  rabbits: 3, // pieces
  fruit: 50, // kg
  mushrooms: 3, // kg
  honey: 2, // kg
};

/** Parents counted in the household on top of the children. */
const HOUSEHOLD_ADULTS = 2;
/** How much a child eats compared with an adult (averaged over ages). */
const CHILD_CONSUMPTION_SHARE = 0.7;

/** Adult equivalents eating at home. */
function householdEaters(params) {
  return HOUSEHOLD_ADULTS + CHILD_CONSUMPTION_SHARE * params.householdChildren;
}
