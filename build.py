#!/usr/bin/env python3
"""Składa src/page.html i src/model.js w samodzielny plik index.html."""
from pathlib import Path
root = Path(__file__).parent
page = (root / 'src/page.html').read_text(encoding='utf-8')
model = (root / 'src/model.js').read_text(encoding='utf-8')
body = page.replace('/*MODEL*/', model)
html = ('<!doctype html>\n<html lang="pl">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '</head>\n<body>\n' + body + '\n</body>\n</html>\n')
(root / 'index.html').write_text(html, encoding='utf-8')
print('index.html:', len(html), 'znaków')
