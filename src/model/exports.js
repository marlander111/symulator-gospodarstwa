// Eksport dla Node (testy). W przeglądarce `module` nie istnieje i ten plik nic nie robi.

if (typeof module !== 'undefined')
  module.exports = {
    SEPS,
    rotacja,
    gleba,
    DEF,
    GROUPS,
    PRESETS,
    ASSUME,
    RATES,
    PROF,
    LAB_GROUPS,
    CF,
    compute,
    cashflow,
    gorzej,
    budzet,
    celEff,
    defaults,
    fmt,
  };
