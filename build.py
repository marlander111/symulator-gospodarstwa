#!/usr/bin/env python3
"""Składa pliki z src/ w jedną stronę.

Wynik:
  index.html          – samodzielna strona (otwórz w przeglądarce, GitHub Pages)
  build/artifact.html – fragment bez <!doctype> do publikacji jako artefakt claude.ai
  build/model.js      – sam model obliczeń dla Node (testy: node tests/model.test.js)

Użycie: python3 build.py
"""
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / 'src'

# Model: zwykłe skrypty o wspólnym zasięgu globalnym, w tej kolejności.
MODEL = [
    'model/params/_groups.js',  # DEF (pusta lista), SEPS, GROUPS
    'model/params/ludzie.js',
    'model/params/ziemia.js',
    'model/params/krowy.js',
    'model/params/kury.js',
    'model/params/drob.js',
    'model/params/bydlo.js',
    'model/params/owce.js',
    'model/params/warzywa.js',
    'model/params/przetw.js',
    'model/params/plony.js',
    'model/params/koszty.js',
    'model/params/inwest.js',
    'model/params/doplaty.js',
    'model/params/praca.js',
    'model/params/dom.js',
    'model/params/gorzej.js',
    'model/presets.js',     # PRESETS, ASSUME – gotowe warianty
    'model/rates.js',       # RATES, PROF, LAB_GROUPS – stawki i profile
    'model/scenarios.js',   # defaults, gorzej, budzet, celEff, gleba, rotacja
    'model/cashflow.js',    # CF, cashflow – przepływy miesięczne
    'model/compute.js',     # compute – główne obliczenie
    'model/format.js',      # fmt
]
MODEL_NODE_EXPORTS = 'model/exports.js'

# Interfejs: składany w jedną funkcję (IIFE), więc pliki widzą nawzajem swoje nazwy.
UI = [
    'ui/core.js',
    'ui/controls.js',
    'ui/presets.js',
    'ui/tint.js',
    'ui/charts.js',
    'ui/render.js',
    'ui/panels/land-feed.js',
    'ui/panels/money.js',
    'ui/panels/household.js',
    'ui/panels/directions.js',
    'ui/panels/labour.js',
    'ui/panels/market.js',
    'ui/panels/investments.js',
    'ui/panels/comparison.js',
    'ui/farm-plan.js',
    'ui/calendar.js',
    'ui/panels/cashflow.js',
    'ui/panels/next-steps.js',
    'ui/panels/sensitivity.js',
    'ui/pdf.js',
    'ui/export.js',
    'ui/theme.js',
    'ui/main.js',  # musi być ostatni – uruchamia aplikację
]


def read(rel):
    return (SRC / rel).read_text(encoding='utf-8').rstrip() + '\n'


def join(files):
    return '\n'.join(f'// ===== {f} =====\n' + read(f) for f in files)


def main():
    model = join(MODEL)
    ui = join(UI)
    scripts = f'<script>\n{model}</script>\n<script>\n(function () {{\n{ui}}})();\n</script>'
    page = read('index.html')
    page = page.replace('<style>\n/* @@STYLES@@ */\n</style>', '<style>\n' + read('styles/app.css') + '</style>')
    page = page.replace('<script>\n/* @@SCRIPTS@@ */\n</script>', scripts)
    assert '@@' not in page, 'nie podmieniono znacznika w src/index.html'

    out = ROOT / 'build'
    out.mkdir(exist_ok=True)
    (out / 'artifact.html').write_text(page, encoding='utf-8')
    (out / 'model.js').write_text(model + '\n' + read(MODEL_NODE_EXPORTS), encoding='utf-8')
    full = ('<!doctype html>\n<html lang="pl">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            '</head>\n<body>\n' + page + '</body>\n</html>\n')
    (ROOT / 'index.html').write_text(full, encoding='utf-8')
    print(f'index.html: {len(full):,} znaków; build/artifact.html, build/model.js gotowe')


if __name__ == '__main__':
    main()
