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
    // the "already owned" switches of the infrastructure are labelled with the item's name
    const labelKey =
      parameter.group === 'infrastructure'
        ? `investments.${parameter.id.replace(/^owns(.)/, (prefix, first) => first.toLowerCase())}`
        : `parameters.${parameter.id}.label`;
    assert.notEqual(model.t(labelKey), labelKey);
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

test('a farm without animals sells its grain and does not run at a loss', () => {
  const animals = ['dairyCows', 'layingHens', 'sheep', 'goats', 'geese', 'pigs'];
  const params = { ...model.defaultParams(), pastureHa: 0, meadowHa: 0, cerealShare: 100 };
  for (const id of animals) params[id] = 0;
  const results = model.simulateFarm(params);
  assert.ok(results.grainSoldTonnes > 0, 'grain should be sold');
  assert.ok(results.netIncome > 0, `net income ${results.netIncome}`);
});

test('every preset keeps every feed without a shortage', () => {
  for (const preset of model.PRESETS) {
    const results = model.simulateFarm({ ...model.defaultParams(), ...preset.params });
    for (const balance of ['grainBalance', 'hayBalance', 'strawBalance'])
      assert.ok(results[balance] >= -0.05, `${preset.id}: ${balance} ${results[balance].toFixed(2)}`);
    assert.ok(results.grazingSupply >= results.grazingNeed, `${preset.id}: pasture shortage`);
  }
});

test('the realistic assumption set equals the default values', () => {
  const defaults = model.defaultParams();
  const realistic = model.ASSUMPTION_SETS.find(set => set.id === 'realistic');
  for (const [id, value] of Object.entries(realistic.params)) assert.equal(value, defaults[id], id);
});
