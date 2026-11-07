// Starts the app: fills static texts, builds the controls and renders all panels.

applyTranslations(document);
renderCoverCropGuide();
initTheme();
buildControls();
buildPresets();
buildSavedVariants();
buildPlanControls();
buildExport();
syncInputs();
render();
