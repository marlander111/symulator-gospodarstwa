#!/usr/bin/env python3
"""Build the single-file app from the sources in src/.

Outputs:
    index.html            standalone page (open in a browser or serve with GitHub Pages)
    build/artifact.html   the same page without <!doctype>/<head>, for publishing on claude.ai
    build/model.js        the model alone for Node: `node --test tests/*.test.js`
    build/app.js          model and interface as one script, for the linter: `npm run lint`

Usage:
    python3 build.py
"""
from __future__ import annotations

import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE_DIR = ROOT / 'src'
BUILD_DIR = ROOT / 'build'

# Interface languages; the first one is the default and the one the Node model uses.
LOCALE_FILES = {
    'pl': 'locales/pl.json',
    'en': 'locales/en.json',
}
DEFAULT_LANGUAGE = next(iter(LOCALE_FILES))
STYLES_FILE = 'styles/app.css'
TEMPLATE_FILE = 'index.html'

# Plain scripts sharing one global scope, in dependency order.
MODEL_FILES = [
    'i18n/translate.js',
    'model/utils.js',
    'model/data/locations.js',
    'model/data/breeds.js',
    'model/data/cover-crops.js',
    'model/data/infrastructure.js',
    'model/data/home-consumption.js',
    'model/soil.js',
    'model/parameters/registry.js',
    'model/parameters/people.js',
    'model/parameters/land.js',
    'model/parameters/dairy.js',
    'model/parameters/laying-hens.js',
    'model/parameters/poultry.js',
    'model/parameters/beef-cattle.js',
    'model/parameters/sheep.js',
    'model/parameters/goats.js',
    'model/parameters/pigs.js',
    'model/parameters/horses.js',
    'model/parameters/slaughter-and-dogs.js',
    'model/parameters/produce.js',
    'model/parameters/processing.js',
    'model/parameters/yields.js',
    'model/parameters/costs.js',
    'model/parameters/investments.js',
    'model/parameters/subsidies.js',
    'model/parameters/labour.js',
    'model/parameters/household.js',
    'model/parameters/pessimistic.js',
    'model/parameters/legacy-ids.js',
    'model/presets.js',
    'model/subsidy-rates.js',
    'model/labour-profiles.js',
    'model/rotation.js',
    'model/grazing.js',
    'model/pessimistic-scenario.js',
    'model/household-budget.js',
    'model/cashflow.js',
    'model/warnings.js',
    'model/stages/land-and-animals.js',
    'model/stages/feed-balance.js',
    'model/stages/nitrogen.js',
    'model/stages/products.js',
    'model/stages/revenue.js',
    'model/stages/costs.js',
    'model/stages/investments.js',
    'model/stages/subsidies.js',
    'model/stages/labour.js',
    'model/stages/enterprises.js',
    'model/stages/market.js',
    'model/simulate-farm.js',
    'model/risk.js',
    'model/startup.js',
    'model/finance-export.js',
]
NODE_EXPORTS_FILE = 'model/node-exports.js'

# Interface scripts, wrapped together in one function so they share private names.
UI_FILES = [
    'ui/last-choice.js',  # first: core.js reads the saved settings through it
    'ui/core.js',
    'ui/markup.js',
    'ui/controls.js',
    'ui/presets.js',
    'ui/history.js',
    'ui/tint.js',
    'ui/charts.js',
    'ui/kpi-bar.js',
    'ui/group-summaries.js',
    'ui/render.js',
    'ui/location.js',
    'ui/panels/land-feed.js',
    'ui/panels/money.js',
    'ui/panels/household.js',
    'ui/panels/enterprises.js',
    'ui/panels/labour.js',
    'ui/panels/market.js',
    'ui/panels/infrastructure.js',
    'ui/panels/investments.js',
    'ui/panels/comparison.js',
    'ui/panels/cashflow.js',
    'ui/panels/next-steps.js',
    'ui/panels/sensitivity.js',
    'ui/panels/nitrogen.js',
    'ui/panels/risk.js',
    'ui/panels/startup.js',
    'ui/farm/plan-state.js',
    'ui/farm/crops.js',
    'ui/farm/plan-map.js',
    'ui/farm/plan-details.js',
    'ui/farm/rotation-panel.js',
    'ui/farm/grazing-controls.js',
    'ui/farm/plan-controls.js',
    'ui/cover-crop-guide.js',
    'ui/calendar.js',
    'ui/pdf/pdf-document.js',
    'ui/pdf/report.js',
    'ui/export.js',
    'ui/theme.js',
    'ui/language.js',
    'ui/main.js',  # last: starts the app
]

TITLE_PLACEHOLDER = '@@APP_TITLE@@'
STYLES_PLACEHOLDER = '<style>\n/* @@STYLES@@ */\n</style>'
SCRIPTS_PLACEHOLDER = '<script>\n/* @@SCRIPTS@@ */\n</script>'
PAGE_HEAD = (
    '<!doctype html>\n<html lang="pl">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    '</head>\n<body>\n'
)
PAGE_TAIL = '</body>\n</html>\n'


def read_source(relative_path: str) -> str:
    """Return a source file's text ending with exactly one newline."""
    return (SOURCE_DIR / relative_path).read_text(encoding='utf-8').rstrip() + '\n'


def concatenate(relative_paths: list[str]) -> str:
    """Join source files, each preceded by a comment naming it."""
    return '\n'.join(f'// ===== {path} =====\n' + read_source(path) for path in relative_paths)


def load_locales() -> dict[str, dict]:
    """Return the texts of the app for every language."""
    return {language: json.loads(read_source(path)) for language, path in LOCALE_FILES.items()}


def locale_script_tag(language: str, messages: dict) -> str:
    """Embed one locale as JSON data; `</` is escaped so the text cannot close the tag."""
    data = json.dumps(messages, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    return f'<script type="application/json" id="locale-{language}">{data}</script>'


def build_model_script() -> str:
    """Return the model scripts joined in dependency order."""
    return concatenate(MODEL_FILES)


def build_interface_script() -> str:
    """Return the interface scripts wrapped in one function, so their names stay private."""
    return f'(function () {{\n{concatenate(UI_FILES)}}})();\n'


def build_page(locales: dict[str, dict]) -> str:
    """Return the page body: template with styles, locales and scripts filled in."""
    scripts = (
        '\n'.join(locale_script_tag(language, messages) for language, messages in locales.items())
        + f'\n<script>\n{build_model_script()}</script>\n'
        + f'<script>\n{build_interface_script()}</script>'
    )
    page = read_source(TEMPLATE_FILE)
    page = page.replace(STYLES_PLACEHOLDER, f'<style>\n{read_source(STYLES_FILE)}</style>')
    page = page.replace(SCRIPTS_PLACEHOLDER, scripts)
    page = page.replace(TITLE_PLACEHOLDER, html.escape(locales[DEFAULT_LANGUAGE]['app']['title']))
    if '@@' in page:
        raise ValueError(f'unreplaced placeholder in {TEMPLATE_FILE}')
    return page


def build_node_model() -> str:
    """Return the model as a Node module that loads the default locale with require()."""
    return (
        f"const LOCALE_MESSAGES = require('../{SOURCE_DIR.name}/{LOCALE_FILES[DEFAULT_LANGUAGE]}');\n\n"
        + build_model_script()
        + '\n'
        + read_source(NODE_EXPORTS_FILE)
    )


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf-8')


def main() -> None:
    page = build_page(load_locales())
    standalone = PAGE_HEAD + page + PAGE_TAIL

    write_text(ROOT / 'index.html', standalone)
    write_text(BUILD_DIR / 'artifact.html', page)
    write_text(BUILD_DIR / 'model.js', build_node_model())
    write_text(BUILD_DIR / 'app.js', build_model_script() + '\n' + build_interface_script())
    print(f'index.html: {len(standalone):,} characters; build/ updated')


if __name__ == '__main__':
    main()
