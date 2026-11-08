// Colour theme switch: automatic (follows the system), light, dark or eco (soft greens);
// remembered in this browser.

const THEME_STORAGE_KEY = 'gosp-motyw';

/** Themes set explicitly; any other value follows the system setting. */
const EXPLICIT_THEMES = ['light', 'dark', 'eco'];

function setTheme(theme) {
  if (EXPLICIT_THEMES.includes(theme)) document.documentElement.setAttribute('data-theme', theme);
  else document.documentElement.removeAttribute('data-theme');
  document
    .querySelectorAll('[data-theme-option]')
    .forEach(button => button.classList.toggle('on', button.dataset.themeOption === (theme || 'auto')));
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme || 'auto');
  } catch (error) {
    // not remembered
  }
}

function initTheme() {
  let savedTheme = 'auto';
  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'auto';
  } catch (error) {
    // use the automatic theme
  }
  setTheme(savedTheme);
  byId('theme-switch').addEventListener('click', event => {
    const button = event.target.closest('[data-theme-option]');
    if (!button) return;
    setTheme(button.dataset.themeOption);
    render(); // chart colours are read from the theme
  });
}
