// Starts the app: fills static texts, builds the controls and renders all panels.

applyTranslations(document);
renderCoverCropGuide();
initTheme();
initLanguageSwitch();
buildControls();
buildLocationPicker();
buildPresets();
buildSavedVariants();
buildPlanControls();
buildExport();
bindDataTools();
bindLabourChart();
bindInfrastructure();
bindStartup();
syncInputs();
render();
