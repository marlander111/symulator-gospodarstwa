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

const isGrazingMonth = month => month >= 3 && month <= 9;
