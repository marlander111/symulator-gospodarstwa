# Symulator gospodarstwa rodzinnego

Interaktywny planer finansów, pracy i pasz dla rodzinnego gospodarstwa ekologicznego (4–25 ha ziemi własnej i do 25 ha dzierżawy): krowy mleczne z nabiałem, bydło mięsne, kury i drób pastwiskowy, owce, kozy, świnie pastwiskowe, konie, warzywa, sad, pszczoły i przetwórstwo w RHD. Lokalizację wybiera się z listy regionów Polski, a klimat zmienia sezon wypasu i plony.

Aplikacja działa pod adresem **https://symgospodarstwa.netlify.app/**. Można też otworzyć plik `index.html` bezpośrednio w przeglądarce: działa bez serwera i bez instalacji.

Język: polski (domyślnie) albo angielski, przełącznik na górze strony. Wybór zapamiętuje przeglądarka; można też podać go w adresie: `?lang=en`.

## Co liczy

- Dochód na czysto, przychód, koszty, amortyzację i dopłaty (eko, ekoschematy, dobrostan, ONW).
- Wariant pesymistyczny z własnymi ustawieniami (ceny, plony, wydajność, praca, koszty).
- Lokalizacja (14 regionów Polski, od Pogórza Sudeckiego po Pomorze i Karpaty): sezon wypasu, opady, temperatura, wysokość; plony zależą od klimatu i klas gleby osobno dla gruntów ornych, pastwisk i łąk.
- Rasy krów mlecznych i mięsnych, systemy chowu bydła (alkierz, mieszany, cały rok na zewnątrz), nabiał (sery, twaróg, śmietana, masło), mleko kozie, świnie pastwiskowe i kozy na osobnych, wydzielonych częściach pastwiska (widocznych na planie), jazdy konne, psy stróżujące, wędliny i przetwory.
- Żywność dla domu odejmowana od sprzedaży według liczby osób, pasza kupowana zamiast własnej.
- Bilans pasz z własnych pól: siano, ziarno, słoma, pastwisko; klasy gleby, płodozmian, międzyplony i poplony.
- Czas pracy rodziny w miesiącach na tle limitu tygodniowego.
- Przepływy gotówki miesiąc po miesiącu i budżet domu.
- Co się opłaca z hektara i z godziny, co dołożyć dalej i które założenia najbardziej zmieniają wynik.
- Ryzyko: 500 losowych lat (plony, ceny, wydajność zwierząt, koszty, rzadki zły rok) i szansa, że dochód nie spadnie poniżej minimum.
- Azot i węgiel: ile azotu zwierzęta zostawiają same na pastwisku, ile trzeba wywieźć, limit 170 kg N/ha, obieg azotu w gospodarstwie, orientacyjny bilans węgla w glebie i metanu, opcja wypasu na belach zimą.
- Wymagana infrastruktura z zaznaczaniem, co gospodarstwo już ma (wpływa na inwestycje).
- Jak zacząć: rozkręcanie przez lata 1–3 do pełnego działania w roku 4 z wynikiem każdego roku.
- Przeciętny dzień pracy w wybranym miesiącu: rano, w ciągu dnia, wieczorem.
- Normy wysiewu na pola i mieszanki międzyplonów (w tym koktajle w stylu Gabe’a Browna).
- Ilu klientów potrzeba: stałe rodziny z pełnym koszykiem albo klienci jednego produktu (zasada Joela Salatina).
- Gotowe warianty i filozofie gospodarstw (m.in. Salatin, Perkins, Brown, Judy, Voisin), własne warianty, zapis i wczytanie ustawień z pliku, raport PDF, dane finansowe w JSON (np. dla aplikacji do budżetu).
- Motywy: automatyczny, jasny, ciemny i eko (zielony).

## Struktura

Kod jest po angielsku. Wszystkie teksty (etykiety, podpowiedzi, ostrzeżenia, nazwy w tabelach, raport PDF) są w plikach `src/locales/pl.json` i `src/locales/en.json` o tej samej budowie, a kod odwołuje się do nich kluczem: `t('money.revenueTotal')`.

```
src/
  index.html                 szkielet strony; teksty przez atrybuty data-i18n
  locales/pl.json            wszystkie teksty po polsku
  locales/en.json            te same teksty po angielsku
  i18n/translate.js          wybór języka, t(key, values), tPlural(), messages()
  styles/app.css             wygląd: motyw jasny i ciemny, układ, tabele, suwaki
  model/                     obliczenia bez dostępu do strony (działają też w Node)
    parameters/registry.js   lista parametrów, grupy, parameterById(), defaultParams()
    parameters/<grupa>.js    parametry jednej grupy: zakres, wartość domyślna
    parameters/legacy-ids.js stare (polskie) nazwy parametrów i odczyt plików z wersji 1
    presets.js               gotowe warianty, filozofie gospodarstw, sweet spot, zestawy założeń
    simulate-farm.js         simulateFarm(params): kolejne etapy obliczeń
    stages/*.js              etapy: ziemia i zwierzęta, pasze (ze sprzedażą nadwyżki zboża), produkty, przychody, koszty,
                             nabiał, inwestycje, dopłaty, praca, kierunki, rynek i klienci, azot i węgiel
    risk.js                  ryzyko: losowe lata ze stałym ziarnem losowania
    warnings.js              ostrzeżenia i podpowiedzi do planu
    cashflow.js              przepływy gotówki miesiąc po miesiącu
    pessimistic-scenario.js  wariant pesymistyczny
    household-budget.js      budżet domu
    data/*.js                dane: lokalizacje, rasy i systemy chowu, mieszanki i normy wysiewu,
                             infrastruktura, żywność dla domu
    soil.js, rotation.js     klasy gleby i klimat, płodozmian (3–8 pól, opcjonalnie okopowe)
    startup.js               lata 1–4 rozkręcania gospodarstwa
    finance-export.js        dane finansowe do pliku JSON
    grazing.js               wypas rotacyjny: liczba kwater, wykorzystanie trawy, praca
    subsidy-rates.js         stawki dopłat
    labour-profiles.js       rozkład prac na miesiące
  ui/                        interfejs, pliki składane w jedną funkcję w kolejności z build.py
    core.js, markup.js       stan aplikacji, helpery HTML i SVG (element, cell, tableRow…)
    controls.js, presets.js  suwaki, gotowe i własne warianty
    history.js               „Poprzednie dane” (cofanie zmian) i „Wyczyść wszystko”
    render.js, kpi-bar.js    odświeżanie paneli, pasek wyników na górze
    panels/*.js              po jednym pliku na panel
    farm/*.js                plan rozmieszczenia, wypas rotacyjny i płodozmian
    calendar.js              kalendarz prac
    pdf/*.js, export.js      raport PDF, zapis i wczytanie ustawień
    location.js              wybór lokalizacji w nagłówku
    theme.js, language.js    motyw, przełącznik języka
    main.js                  start aplikacji
tests/
  model.test.js              testy modelu i gotowych wariantów
  features.test.js           klienci, azot, wypas na belach, ryzyko, ryczałt RHD, kwatery, lokalizacje, rasy,
                             nabiał, żywność dla domu, infrastruktura, psy, lata startu, eksport, migracja
  locales.test.js            zgodność tekstów angielskich z polskimi (klucze, {zmienne}, znaczniki HTML)
build.py                     składa wszystko w jedną stronę
eslint.config.js             reguły lintera
```

## Praca z kodem

```
npm run build     # python3 build.py: index.html, build/artifact.html, build/model.js, build/app.js
npm test          # testy modelu i tekstów (Node)
npm run lint      # ESLint na złożonym skrypcie
npm run format    # Prettier
```

- **Nowy parametr:** dopisz go w `src/model/parameters/<grupa>.js`, jego etykietę, jednostkę i podpowiedź w `src/locales/pl.json` i `src/locales/en.json` pod `parameters.<id>`, a użycie w odpowiednim etapie w `src/model/stages/`. Suwak pojawi się sam.
- **Nowy panel:** plik w `src/ui/panels/`, wpis na liście `UI_FILES` w `build.py` i wywołanie w `render()` w `src/ui/render.js`.
- **Zmiana tekstu:** tylko w plikach `src/locales/*.json`, w obu językach; `npm test` sprawdza, czy klucze i `{zmienne}` się zgadzają.
- **Kolejny język:** kopia `pl.json` z przetłumaczonymi tekstami, wpis w `LOCALE_FILES` w `build.py`, w `LANGUAGES` w `src/i18n/translate.js` i przycisk w `src/index.html`.
- Ustawienia zapisane wcześniejszą wersją (w przeglądarce i w plikach `.json`) wczytują się automatycznie: stare nazwy parametrów są tłumaczone na nowe.

## Zastrzeżenie

Wyliczenia są orientacyjne i opierają się na założeniach opisanych przy suwakach oraz w sekcji „Założenia i źródła”. Ceny, plony, normy pracy, dopłaty i przepisy warto sprawdzić lokalnie i aktualizować co roku.
