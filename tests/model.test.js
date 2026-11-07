// Model tests in Node. Run `python3 build.py` first, then `node tests/model.test.js`.

const assert = require('node:assert/strict');
const { test } = require('node:test');
const model = require('../build/model.js');

const MONTHS_IN_YEAR = 12;

const containsInvalidNumber = value => /NaN|Infinity/.test(JSON.stringify(value));

test('every parameter has a unique id, a known group and texts', () => {
  const seenIds = new Set();
  for (const parameter of model.PARAMETERS) {
    assert.ok(!seenIds.has(parameter.id), `duplicate parameter id: ${parameter.id}`);
    seenIds.add(parameter.id);
    assert.ok(model.PARAMETER_GROUP_IDS.includes(parameter.group), `unknown group of ${parameter.id}`);
    assert.notEqual(model.t(`parameters.${parameter.id}.label`), `parameters.${parameter.id}.label`);
  }
});

test('every preset simulates to finite numbers, also in the pessimistic scenario', () => {
  for (const preset of model.PRESETS) {
    const params = { ...model.defaultParams(), ...preset.params };
    const results = model.simulateFarm(params);
    const pessimistic = model.simulateFarm(model.applyPessimisticScenario(params));

    assert.ok(!containsInvalidNumber(results), `preset ${preset.id}: invalid number in results`);
    assert.ok(!containsInvalidNumber(pessimistic), `preset ${preset.id}: invalid number (pessimistic)`);
    assert.ok(pessimistic.netIncome <= results.netIncome, `preset ${preset.id}: pessimistic is better`);
  }
});

test('the monthly cash flow has twelve months', () => {
  const params = model.defaultParams();
  const cashflow = model.computeMonthlyCashflow(model.simulateFarm(params), params);
  assert.equal(cashflow.months.length, MONTHS_IN_YEAR);
});

test('settings saved with the old Polish ids are migrated', () => {
  const migrated = model.migrateLegacyParameterIds({ etaty: 2, dzierzawa: 3, unknownKey: 1 });
  assert.deepEqual(migrated, { fullTimeWorkers: 2, leasedHa: 3, unknownKey: 1 });
});

test('settings files of version 1 (Polish field names) are read', () => {
  const file = { app: 'symulator-gospodarstwa', wersja: 1, nazwa: 'Mój wariant', ustawienia: { etaty: 2 } };
  assert.deepEqual(model.readSettingsFile(file), { name: 'Mój wariant', settings: { fullTimeWorkers: 2 } });
});
