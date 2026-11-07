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

```
src/
  index.html            szkielet strony (panele, przyciski); znaczniki @@STYLES@@ i @@SCRIPTS@@
  styles/app.css        wygląd: kolory jasne i ciemne, układ, tabele, suwaki
  model/                obliczenia, bez dostępu do strony (działa też w Node)
    params/_groups.js   nazwy grup i podsekcji suwaków
    params/<grupa>.js   parametry jednej grupy: zakres, wartość domyślna, podpowiedź
    presets.js          gotowe warianty i zestawy założeń
    rates.js            stawki dopłat, miesięczne profile pracy
    scenarios.js        wariant pesymistyczny, budżet domu, klasy gleby, płodozmian
    cashflow.js         rozkład przychodów i kosztów na miesiące
    compute.js          główne obliczenie: z parametrów do wyniku
    format.js           formatowanie liczb
    exports.js          eksport dla Node
  ui/                   interfejs; pliki składane w jedną funkcję w kolejności z build.py
    core.js             stan aplikacji i funkcje pomocnicze
    controls.js         suwaki
    presets.js          gotowe i własne warianty
    render.js           odświeżanie wszystkich paneli
    tint.js, charts.js  kolorowanie liczb i pomocnicze funkcje wykresów
    panels/*.js         po jednym pliku na panel (pieniądze, praca, pasze, przepływy…)
    farm-plan.js        plan rozmieszczenia, płodozmian, poplony
    calendar.js         kalendarz prac
    export.js, pdf.js   zapis ustawień i raport PDF
    theme.js            motyw jasny i ciemny
    main.js             start aplikacji
tests/model.test.js     szybki test modelu
build.py                składa wszystko w index.html
```

## Praca z kodem

```
python3 build.py              # składa index.html, build/artifact.html i build/model.js
node tests/model.test.js      # sprawdza wszystkie gotowe warianty
npx prettier --write src tests
```

Nowy parametr dodaje się w `src/model/params/<grupa>.js`, a jego użycie w `src/model/compute.js` (pole `p.<id>`). Suwak pojawi się sam. Nowy panel to nowy plik w `src/ui/panels/`, jego wpis w `UI` w `build.py` i wywołanie w `render()` w `src/ui/render.js`.

## Zastrzeżenie

Wyliczenia są orientacyjne i opierają się na założeniach opisanych przy suwakach oraz w sekcji „Założenia i źródła”. Ceny, plony, normy pracy, dopłaty i przepisy warto sprawdzić lokalnie i aktualizować co roku.
