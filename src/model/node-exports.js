// Exports the model for Node (tests). In the browser `module` does not exist and nothing happens.

if (typeof module !== 'undefined')
  module.exports = {
    PARAMETERS,
    PARAMETER_GROUP_IDS,
    PRESETS,
    ASSUMPTION_SETS,
    LABOUR_GROUPS,
    defaultParams,
    simulateFarm,
    simulateRisk,
    computeGrazingPlan,
    applyPessimisticScenario,
    computeMonthlyCashflow,
    migrateLegacyParameterIds,
    readSettingsFile,
    migrateChangedDefaults,
    DEFAULTS_VERSION,
    formatNumber,
    t,
  };
