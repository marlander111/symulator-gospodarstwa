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

- `src/model.js` – model obliczeń (parametry, warianty, wyliczenia). Działa też w Node: `require('./src/model.js')`.
- `src/page.html` – interfejs; w miejscu `/*MODEL*/` wstawiany jest model.
- `build.py` – składa `index.html`: `python3 build.py`.

## Zastrzeżenie

Wyliczenia są orientacyjne i opierają się na założeniach opisanych przy suwakach oraz w sekcji „Założenia i źródła”. Ceny, plony, normy pracy, dopłaty i przepisy warto sprawdzić lokalnie i aktualizować co roku.
