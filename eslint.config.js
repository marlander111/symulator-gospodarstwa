// ESLint settings. The sources are plain scripts that share names across files, so the linter
// checks the joined bundle built by build.py (build/app.js) instead of each file alone.

const BROWSER_GLOBALS = [
  'window',
  'document',
  'localStorage',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'setTimeout',
  'clearTimeout',
  'console',
  'Blob',
  'URL',
  'FileReader',
  'getComputedStyle',
  'navigator',
  'matchMedia',
  'location',
  'Intl',
];

const readonly = names => Object.fromEntries(names.map(name => [name, 'readonly']));

module.exports = [
  {
    files: ['build/app.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...readonly(BROWSER_GLOBALS),
        claude: 'readonly', // runtime of claude.ai artifacts; absent elsewhere
        LOCALE_MESSAGES: 'readonly', // locale injected by build.py for Node
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
      'no-redeclare': 'error',
      'no-var': 'error',
      'prefer-const': 'warn',
      eqeqeq: ['warn', 'smart'],
    },
  },
];
