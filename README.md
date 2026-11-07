# Symulator gospodarstwa rodzinnego

Interaktywny planer finansów, pracy i pasz dla małego gospodarstwa ekologicznego (ok. 14 ha pod Lwówkiem Śląskim): krowy jersey na trawie z serami, kury i drób pastwiskowy, owce, kozy, świnie, warzywa, sad, pszczoły i przetwórstwo w RHD.

Otwórz `index.html` w przeglądarce. Działa bez serwera i bez instalacji (np. przez GitHub Pages).

## Co liczy

- Dochód na czysto, przychód, koszty, amortyzację i dopłaty (eko, ekoschematy, dobrostan, ONW).
- Wariant pesymistyczny z własnymi ustawieniami (ceny, plony, wydajność, praca, koszty).
- Bilans pasz z własnych pól: siano, ziarno, słoma, pastwisko; klasy gleby, płodozmian, międzyplony i poplony.
- Czas pracy rodziny w miesiącach na tle limitu tygodniowego.
- Przepływy gotówki miesiąc po miesiącu i budżet domu.
- Co się opłaca z hektara i z godziny, co dołożyć dalej i które założenia najbardziej zmieniają wynik.
- Gotowe warianty, własne warianty, zapis i wczytanie ustawień z pliku, raport PDF.

## Struktura

Kod jest po angielsku. Wszystkie polskie teksty (etykiety, podpowiedzi, ostrzeżenia, nazwy w tabelach, raport PDF) są w jednym pliku `src/locales/pl.json`, a kod odwołuje się do nich kluczem: `t('money.revenueTotal')`.

```
src/
  index.html                 szkielet strony; teksty przez atrybuty data-i18n
  locales/pl.json            wszystkie teksty po polsku
  i18n/translate.js          t(key, values), tPlural(), messages()
  styles/app.css             wygląd: motyw jasny i ciemny, układ, tabele, suwaki
  model/                     obliczenia bez dostępu do strony (działają też w Node)
    parameters/registry.js   lista parametrów, grupy, parameterById(), defaultParams()
    parameters/<grupa>.js    parametry jednej grupy: zakres, wartość domyślna
    parameters/legacy-ids.js stare (polskie) nazwy parametrów i odczyt plików z wersji 1
    presets.js               gotowe warianty i zestawy założeń
    simulate-farm.js         simulateFarm(params): kolejne etapy obliczeń
    stages/*.js              etapy: ziemia i zwierzęta, pasze, produkty, przychody, koszty,
                             inwestycje, dopłaty, praca, kierunki, rynek
    warnings.js              ostrzeżenia i podpowiedzi do planu
    cashflow.js              przepływy gotówki miesiąc po miesiącu
    pessimistic-scenario.js  wariant pesymistyczny
    household-budget.js      budżet domu
    soil.js, rotation.js     klasy gleby i płodozmian
    subsidy-rates.js         stawki dopłat
    labour-profiles.js       rozkład prac na miesiące
  ui/                        interfejs, pliki składane w jedną funkcję w kolejności z build.py
    core.js, markup.js       stan aplikacji, helpery HTML i SVG (element, cell, tableRow…)
    controls.js, presets.js  suwaki, gotowe i własne warianty
    render.js, kpi-bar.js    odświeżanie paneli, pasek wyników na górze
    panels/*.js              po jednym pliku na panel
    farm/*.js                plan rozmieszczenia i płodozmian
    calendar.js              kalendarz prac
    pdf/*.js, export.js      raport PDF, zapis i wczytanie ustawień
    theme.js, main.js        motyw, start aplikacji
tests/model.test.js          testy modelu
build.py                     składa wszystko w jedną stronę
eslint.config.js             reguły lintera
```

## Praca z kodem

```
npm run build     # python3 build.py: index.html, build/artifact.html, build/model.js, build/app.js
npm test          # testy modelu (Node)
npm run lint      # ESLint na złożonym skrypcie
npm run format    # Prettier
```

- **Nowy parametr:** dopisz go w `src/model/parameters/<grupa>.js`, jego etykietę, jednostkę i podpowiedź w `src/locales/pl.json` pod `parameters.<id>`, a użycie w odpowiednim etapie w `src/model/stages/`. Suwak pojawi się sam.
- **Nowy panel:** plik w `src/ui/panels/`, wpis na liście `UI_FILES` w `build.py` i wywołanie w `render()` w `src/ui/render.js`.
- **Zmiana tekstu:** tylko w `src/locales/pl.json`. Drugi język to kopia tego pliku z innymi tekstami.
- Ustawienia zapisane wcześniejszą wersją (w przeglądarce i w plikach `.json`) wczytują się automatycznie: stare nazwy parametrów są tłumaczone na nowe.

## Zastrzeżenie

Wyliczenia są orientacyjne i opierają się na założeniach opisanych przy suwakach oraz w sekcji „Założenia i źródła”. Ceny, plony, normy pracy, dopłaty i przepisy warto sprawdzić lokalnie i aktualizować co roku.
