// Starts the app: fills static texts, builds the controls and renders all panels.

applyTranslations(document);
renderCoverCropGuide();
initTheme();
initLanguageSwitch();
buildControls();
buildPresets();
buildSavedVariants();
buildPlanControls();
buildExport();
bindDataTools();
syncInputs();
render();
