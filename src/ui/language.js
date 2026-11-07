// Interface language switch (Polish or English); remembered in this browser.
//
// Texts are read once when the page starts, so switching reloads the page. When the browser
// cannot remember the choice, the language is passed in the address instead (?lang=en).

function markCurrentLanguage() {
  document
    .querySelectorAll('[data-language-option]')
    .forEach(button => button.classList.toggle('on', button.dataset.languageOption === currentLanguage()));
}

function rememberLanguage(language) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) === language;
  } catch (error) {
    return false;
  }
}

function switchLanguage(language) {
  if (language === currentLanguage() || !LANGUAGES.includes(language)) return;
  const address = new URL(location.href);
  const hasLanguageInAddress = address.searchParams.has(LANGUAGE_URL_PARAMETER);
  if (rememberLanguage(language) && !hasLanguageInAddress) {
    location.reload();
    return;
  }
  address.searchParams.set(LANGUAGE_URL_PARAMETER, language);
  location.assign(address.href);
}

function initLanguageSwitch() {
  document.title = t('app.title');
  markCurrentLanguage();
  byId('language-switch').addEventListener('click', event => {
    const button = event.target.closest('[data-language-option]');
    if (button) switchLanguage(button.dataset.languageOption);
  });
}
