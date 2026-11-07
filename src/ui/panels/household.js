// Panel "Household budget": family spending, child benefit, safety margin and how the farm's
// result compares with what the family needs.

function renderHouseholdBudget(results, pessimistic) {
  const budget = results.householdBudget;
  const perMonth = amount => t('household.perMonth', { amount: formatPlnExact(amount) });
  const rows = [
    [
      t('household.spending'),
      budget.spending,
      t('household.spendingDetail', { amount: formatNumber(params.householdMonthlySpending, 0) }),
    ],
    [t('household.margin', { percent: params.householdSafetyMargin }), budget.margin, ''],
    [t('household.savings'), budget.savings, ''],
    [
      t('household.childBenefit'),
      -budget.childBenefit,
      t('household.childBenefitDetail', {
        children: params.childBenefitChildren,
        amount: CHILD_BENEFIT_PER_MONTH,
      }),
    ],
  ];

  const amountCell = (amount, isNegative = amount < 0) => numberCell(formatPlnExact(amount), isNegative);
  const noteCell = note => cell(note, { class: 'small muted' });
  const summaryRow = (label, amount, attributes = {}) =>
    tableRow([cell(label), amountCell(amount, false), noteCell(perMonth(amount / 12))], attributes);

  const header = tableHeader([t('household.item'), t('money.perYear'), ''], index => index === 1);
  const body = [
    ...rows.map(([label, amount, note]) => tableRow([cell(label), amountCell(amount), noteCell(note)])),
    summaryRow(t('household.required'), budget.required, { class: 'tot' }),
    summaryRow(t('household.withoutChildBenefit'), budget.withoutChildBenefit),
    summaryRow(t('household.realisticResult'), results.netIncome),
    tableRow([
      cell(t('household.pessimisticResult')),
      amountCell(pessimistic.netIncome, pessimistic.netIncome < budget.required),
      noteCell(perMonth(pessimistic.netIncome / 12)),
    ]),
  ];
  byId('household-table').innerHTML = header + tableBody(body);

  byId('household-note').textContent = householdNote(results, pessimistic);
}

/** Whether the pessimistic result covers the family's needs, and how the target is set. */
function householdNote(results, pessimistic) {
  const budget = results.householdBudget;
  const surplus = pessimistic.netIncome - budget.required;
  const coverage =
    surplus >= 0
      ? t('household.surplus', { amount: formatPln(surplus) })
      : t('household.shortfall', { amount: formatPln(-surplus) });
  const yearsOfSpending =
    budget.spending > 0
      ? formatNumber((pessimistic.netIncome + budget.childBenefit) / budget.spending, 1)
      : '–';
  const summary = t('household.summary', {
    ratio: yearsOfSpending,
    depreciation: formatPln(results.depreciation),
  });
  const target = t(
    params.targetFromHouseholdBudget ? 'household.targetFromBudget' : 'household.targetSetDirectly'
  );
  return [coverage, summary, target].join(' ');
}
