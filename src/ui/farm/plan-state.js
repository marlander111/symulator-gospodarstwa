// View state shared by the farm plan, the rotation table and the calendar.

const planView = {
  /** Selected month, 0–11; starts at the current month. */
  month: new Date().getMonth(),
  /** Selected year of the rotation, 1-based. */
  rotationYear: 1,
  /** Clicked area of the plan: "farmyard", "pasture", "meadow", "garden" or "plot<number>". */
  selectedArea: null,
  /** Results of the last render, used when only the view changes. */
  results: null,
};

/** True when the animals graze for most of the month (0–11) at the chosen location. */
function isGrazingMonth(month) {
  const location = locationById(params.location);
  const middleOfMonth = dayOfYear([month + 1, 15]);
  return middleOfMonth >= dayOfYear(location.grazingStart) && middleOfMonth <= dayOfYear(location.grazingEnd);
}
