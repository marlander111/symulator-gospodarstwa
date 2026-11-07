// ===== Model gospodarstwa: dane wejściowe, warianty, obliczenia =====
// g: grupa, a: parametr zaawansowany (schowany), t: 'bool' dla przełączników
const DEF = [
  // --- Ludzie ---
  {g:'ludzie', id:'etaty', l:'Osoby na pełny etat', min:0, max:6, s:1, v:2, u:'os.'},
  {g:'ludzie', id:'polEtaty', l:'Osoby na pół etatu', min:0, max:6, s:1, v:2, u:'os.'},
  {g:'ludzie', id:'cwiercEtaty', l:'Osoby na ćwierć etatu', min:0, max:8, s:1, v:3, u:'os.'},
  {g:'ludzie', id:'limitTydz', l:'Górny limit pracy w najcięższym miesiącu', min:40, max:160, s:5, v:80, u:'h/tydz.', h:'Dla całego gospodarstwa razem. Sprawdzam go w wariancie pesymistycznym (ustawienia na dole listy).'},
  {g:'ludzie', id:'celNetto', l:'Minimum na czysto w wariancie pesymistycznym', min:0, max:250000, s:5000, v:120000, u:'zł/rok'},
  {g:'gorzej', id:'gCeny', l:'Ceny sprzedaży niższe o', min:0, max:40, s:1, v:15, u:'%', h:'Dotyczy wszystkich cen: mleka, sera, jaj, mięsa, warzyw, owoców, grzybów, miodu i wędlin.'},
  {g:'gorzej', id:'gPlony', l:'Plony niższe o', min:0, max:50, s:1, v:17, u:'%', h:'Zboża, słoma, łąka, pastwisko, koniczyna, sad, miód, grzyby. Susza lub mokry rok.'},
  {g:'gorzej', id:'gWyd', l:'Wydajność zwierząt niższa o', min:0, max:30, s:1, v:10, u:'%', h:'Mleko od krowy, nieśność, odchów jagniąt i królików.'},
  {g:'gorzej', id:'gGodz', l:'Praca zajmuje więcej o', min:0, max:60, s:1, v:10, u:'%', h:'Wszystkie normy czasu pracy. Choroby, awarie, uczenie się.'},
  {g:'gorzej', id:'gKoszty', l:'Koszty bieżące wyższe o', min:0, max:60, s:1, v:10, u:'%', h:'Też ceny dokupowanego ziarna, siana i słomy. Czynszu nie zmieniam.'},
  {g:'dom', id:'celZBudzetu', t:'bool', l:'Licz minimum na czysto z budżetu domu', v:false, h:'Gdy włączone, próg wariantu pesymistycznego liczy się sam z wydatków, zapasu i oszczędzania poniżej, pomniejszonych o 800+. Gdy wyłączone, obowiązuje suwak minimum w grupie „Ludzie”.'},
  {g:'dom', id:'wydDom', l:'Wydatki domu', min:2000, max:15000, s:100, v:5100, u:'zł/mies.', h:'Szacunek dla 5 osób, oszczędnie, ponad połowa jedzenia własna, własny opał i woda. Bez KRUS i podatku rolnego, które są w kosztach gospodarstwa.'},
  {g:'dom', id:'zapasDom', l:'Zapas ponad wydatki', min:0, max:50, s:5, v:20, u:'%'},
  {g:'dom', id:'odkladDom', l:'Oszczędzanie: emerytura, fundusz awaryjny', min:0, max:40000, s:1000, v:10000, u:'zł/rok', h:'Emerytura z KRUS będzie niska, więc warto odkładać np. na IKZE.'},
  {g:'dom', id:'gotowkaStart', l:'Gotówka na koncie 1 stycznia', min:0, max:200000, s:1000, v:20000, u:'zł', h:'Od tej kwoty liczę saldo w tabeli przepływów gotówki.'},
  {g:'dom', id:'dzieci800', l:'Dzieci z 800+', min:0, max:8, s:1, v:3, u:'os.', h:'800 zł miesięcznie na dziecko do 18 lat.'},
  {g:'ludzie', id:'hEtat', l:'Godziny pełnego etatu w roku', min:1600, max:2800, s:50, v:2000, u:'h', h:'Ok. 40 h tygodniowo z urlopem. W gospodarstwie zwykle wychodzi więcej.'},
  // --- Warzywa i pszczoły ---
  {g:'warzywa', id:'warzywaSprz', l:'Warzywa na sprzedaż (RWS, targ)', min:0, max:1.5, s:0.05, v:0, u:'ha', h:'Ziemia z gruntów ornych. RWS Dobrzyńskie Warzywa: ok. 5 ha i ponad 530 udziałowców po 1480–1740 zł za sezon.'},
  {g:'warzywa', id:'cenaWarzywHa', l:'Sprzedaż warzyw z hektara', min:40000, max:250000, s:5000, v:120000, u:'zł/ha', h:'Założenie. RWS w Dobrzyniu to ok. 170 tys. zł z ha w udziałach. Najlepsze małe gospodarstwa warzywne w USA i Kanadzie sprzedają za 100 tys. USD z akra, typowe RWS tam poniżej 40 tys. USD.'},
  {g:'warzywa', id:'kWarzywaProc', l:'Koszty warzyw (nasiona, kompost, woda, opakowania)', min:10, max:60, s:1, v:30, u:'% sprzedaży', a:1},
  {g:'warzywa', id:'hWarzywaHa', l:'Praca przy warzywach', min:1000, max:6000, s:100, v:3000, u:'h/ha', h:'Szacunek dla uprawy ręcznej z tunelem.'},
  {g:'warzywa', id:'owoceSprz', l:'Owoce z sadu na sprzedaż', min:0, max:90, s:5, v:0, u:'% zbioru', h:'Świeże albo jako sok z tłoczni usługowej. Reszta dla domu. Sad ustawiasz w „Ziemi”.'},
  {g:'warzywa', id:'plonSad', l:'Plon sadu', min:1, max:15, s:0.5, v:6, u:'t/ha', h:'Założenie dla ekstensywnego sadu w pełni owocowania. Nowy sad zaczyna owocować po ok. 4–6 latach, a potem plonuje co drugi rok mocniej.'},
  {g:'warzywa', id:'cenaOwocow', l:'Przychód z kg owoców', min:1, max:12, s:0.25, v:4, u:'zł/kg', h:'Średnio dla świeżych owoców i soku. Z 1 kg jabłek wychodzi ok. 0,6–0,7 l soku. Założenie.'},
  {g:'warzywa', id:'kOwocProc', l:'Koszty owoców (tłocznia, opakowania, opryski eko)', min:5, max:50, s:1, v:25, u:'% sprzedaży', a:1},
  {g:'warzywa', id:'hOwocT', l:'Zbiór, tłoczenie i sprzedaż owoców', min:20, max:200, s:5, v:60, u:'h/t', a:1},
  {g:'warzywa', id:'klody', l:'Kłody na boczniaki', min:0, max:400, s:10, v:0, u:'szt.', h:'Odcinki 30–40 cm o średnicy 20–50 cm, prawie każde drewno liściaste. Leżą w cieniu pod drzewami, nie zajmują pola. Zbiór ok. 20% masy drewna w ciągu 2–5 lat (dr M. Siwulski, AR Poznań).'},
  {g:'warzywa', id:'plonKloda', l:'Grzyby z kłody', min:0.3, max:3, s:0.1, v:1.2, u:'kg/rok', h:'Kłoda ok. 20 kg × 20% przez ok. 3 lata daje ok. 1,3 kg rocznie. Shiitake na dębie lub buku plonuje słabiej, ale jest droższe.'},
  {g:'warzywa', id:'cenaGrzybow', l:'Cena grzybów', min:15, max:90, s:1, v:35, u:'zł/kg', h:'Założenie dla boczniaków z kłód w sprzedaży bezpośredniej.'},
  {g:'warzywa', id:'kKloda', l:'Kłoda: grzybnia i drewno (na rok)', min:0, max:20, s:0.5, v:6, u:'zł/rok', a:1},
  {g:'warzywa', id:'hKloda', l:'Kłoda: szczepienie, moczenie, zbiór, sprzedaż', min:0.2, max:2, s:0.05, v:0.7, u:'h/rok', a:1},
  {g:'warzywa', id:'ule', l:'Ule (rodziny pszczele)', min:0, max:40, s:1, v:0, u:'szt.', h:'Nie zajmują ziemi; zapylają sad i koniczynę.'},
  {g:'warzywa', id:'miodUl', l:'Miód z ula', min:5, max:35, s:1, v:15, u:'kg/rok', h:'Średnio w Polsce ok. 15–20 kg z ula; w słabe lata dużo mniej.'},
  {g:'warzywa', id:'cenaMiodu', l:'Cena miodu w sprzedaży bezpośredniej', min:25, max:90, s:1, v:45, u:'zł/kg', h:'Średnie ceny detaliczne w 2025 r.: wielokwiatowy ok. 35,5 zł/kg, spadziowy ok. 64 zł, wrzosowy ok. 91 zł (INHORT).'},
  {g:'warzywa', id:'kUl', l:'Koszt gotówkowy ula (pokarm, leki, słoiki)', min:100, max:500, s:10, v:250, u:'zł/rok', a:1},
  {g:'warzywa', id:'hUl', l:'Praca przy ulu', min:3, max:30, s:1, v:12, u:'h/rok', a:1},
  // --- Ziemia ---
  {g:'ziemia', id:'areaTotal', l:'Powierzchnia własna', min:10, max:16, s:0.5, v:14, u:'ha'},
  {g:'ziemia', id:'dzierzawa', l:'Dzierżawa (dodatkowo)', min:0, max:15, s:0.5, v:0, u:'ha', h:'Dochodzi do łąki i pól. Czynsz poniżej.'},
  {g:'ziemia', id:'czynsz', l:'Czynsz dzierżawny', min:0, max:2000, s:50, v:800, u:'zł/ha/rok', h:'Grunty KOWR w 2024 r.: średnio ok. 12 dt pszenicy z ha (ok. 1100 zł). Prywatne łąki bywają tańsze.'},
  {g:'ziemia', id:'obejscie', l:'Obejście, sad, warzywnik, zadrzewienia', min:1, max:4, s:0.1, v:2, u:'ha'},
  {g:'ziemia', id:'sad', l:'w tym sad (wliczany do dopłat)', min:0, max:1.5, s:0.1, v:0.5, u:'ha'},
  {g:'ziemia', id:'warzywnik', l:'w tym warzywnik', min:0, max:0.5, s:0.05, v:0.15, u:'ha'},
  {g:'ziemia', id:'pastwisko', l:'Pastwisko rotacyjne', min:1, max:10, s:0.1, v:5.5, u:'ha'},
  {g:'ziemia', id:'laka', l:'Łąka kośna', min:0, max:8, s:0.1, v:1.5, u:'ha'},
  {g:'ziemia', id:'udzialIII', l:'Gleby klasy III', min:0, max:100, s:5, v:0, u:'%', h:'Plony w grupie „Plony” to plony na glebie klasy IV. Klasa III daje więcej: zboża ok. +20%, łąki ok. +10%.'},
  {g:'ziemia', id:'udzialV', l:'Gleby klasy V', min:0, max:100, s:5, v:20, u:'%', h:'Klasa V: zboża i koniczyna ok. −25%, łąki i pastwiska ok. −15% (trawy znoszą słabszą glebę lepiej niż zboża). Reszta to klasa IV. Szacunek.'},
  {g:'ziemia', id:'udzialVI', l:'Gleby klasy VI', min:0, max:100, s:5, v:0, u:'%', h:'Klasa VI: zboża ok. −45%, trawy ok. −30%. Lepiej pod pastwisko, zadrzewienia lub owce niż pod zboża.'},
  {g:'ziemia', id:'plodLat', l:'Płodozmian: liczba pól (lat)', min:3, max:6, s:1, v:3, u:'pól', h:'Zboża i koniczyna przesuwają się co roku o jedno pole. Szczegóły w sekcji „Płodozmian”.'},
  {g:'ziemia', id:'zbozaUdzial', l:'Zboża i strączkowe w płodozmianie', min:33, max:100, s:1, v:72, u:'%', h:'Reszta gruntów ornych to koniczyna z trawami na siano. W rolnictwie ekologicznym to źródło azotu, więc 100% zbóż na dłuższą metę nie działa.'},
  // --- Krowy ---
  {g:'krowy', id:'krowy', l:'Krowy mleczne (jersey)', min:0, max:8, s:1, v:4, u:'szt.'},
  {g:'krowy', id:'mleko', l:'Mleko na krowę', min:2500, max:5500, s:100, v:3700, u:'l/rok', h:'Jersey bez zboża: 3500–4000 l. Farmy 100% grass-fed w USA: średnio ok. 3800 kg.'},
  {g:'krowy', id:'mlekoUzyt', l:'Mleko do sprzedaży i przerobu', min:60, max:95, s:1, v:85, u:'%', h:'Reszta: cielęta, dom, straty.'},
  {g:'krowy', id:'ser', l:'Część tego mleka na sery', min:0, max:80, s:5, v:20, u:'%'},
  {g:'krowy', id:'cenaMleka', l:'Cena mleka surowego od rolnika', min:2, max:10, s:0.25, v:5, u:'zł/l', h:'Mleczarnie płaciły w 2026 r. ok. 1,5–2,6 zł/l. Mleko surowe od rolnika zwykle 3–6 zł/l; za A2A2 od jersejek w mieście da się więcej. Sprzedaż mleka surowego to sprzedaż bezpośrednia (zgłoszenie w PIW), nie RHD.'},
  {g:'krowy', id:'cenaSera', l:'Cena sera twardego', min:40, max:160, s:5, v:80, u:'zł/kg', h:'Założenie. Sery zagrodowe dojrzewające sprzedaje się zwykle po ok. 60–150 zł/kg zależnie od sera, wieku i kanału; bieżących cen nie udało się potwierdzić. Wpisz swoją cenę.'},
  {g:'krowy', id:'wydSera', l:'Wydajność sera', min:8, max:13, s:0.5, v:11, u:'kg/100 l', h:'Cheddar z mleka jersey: ok. 12,5 kg, z HF ok. 10,1 kg. Po dojrzewaniu trochę mniej.'},
  {g:'krowy', id:'laktacje', l:'Średnia liczba laktacji krowy', min:3, max:10, s:1, v:6},
  {g:'krowy', id:'byk', t:'bool', l:'Własny buhaj (inaczej inseminacja lub pożyczony)', v:false},
  {g:'krowy', id:'owiesKrowa', l:'Owies dla krowy (po porodzie)', min:0, max:600, s:10, v:90, u:'kg/rok'},
  {g:'krowy', id:'cenaCielaka', l:'Cena sprzedanego cielaka', min:100, max:1500, s:50, v:500, u:'zł', a:1},
  {g:'krowy', id:'cenaKrowyBrak', l:'Krowa wybrakowana na rzeź', min:1500, max:7000, s:100, v:3500, u:'zł', a:1, h:'Bydło rzeźne w skupie: 12,55 zł/kg żywca (VII 2026, ZSRIR); krowy taniej. Jersey ok. 400 kg.'},
  // --- Kury nieśne ---
  {g:'kury', id:'kury', l:'Kury nieśne', min:0, max:500, s:10, v:200, u:'szt.'},
  {g:'kury', id:'niesnosc', l:'Nieśność', min:150, max:300, s:5, v:200, u:'jaj/rok', h:'Zielononóżka kuropatwiana: ok. 180–200 jaj rocznie (rasa zachowawcza); inne rasy rodzime 190–230; mieszańce towarowe na wybiegu 250–280.'},
  {g:'kury', id:'cenaJaja', l:'Cena jajka', min:0.8, max:2.5, s:0.05, v:1.45, u:'zł/szt.', h:'Mediana 49 ogłoszeń jaj wiejskich na OLX (XI 2026): 1,20 zł/szt.; ŚODR (V 2026): średnio 1,22 zł (0,60–2,00). Jaja zielononóżek z wybiegu stałym klientom zwykle drożej: 1,4–2 zł.'},
  {g:'kury', id:'jajaSprz', l:'Jaja sprzedane', min:70, max:98, s:1, v:90, u:'%'},
  {g:'kury', id:'paszaKura', l:'Pasza na kurę', min:100, max:140, s:5, v:115, u:'g/dzień', h:'Zielononóżka (ok. 1,6–2 kg) zjada ok. 100–120 g dziennie, kury towarowe 120–130 g; dobry wybieg obniża zużycie.'},
  {g:'kury', id:'oszczPast', l:'Oszczędność paszy z wybiegu', min:0, max:25, s:1, v:10, u:'%'},
  {g:'kury', id:'wymianaKur', l:'Wymiana stada co', min:1, max:3, s:0.5, v:1.5, u:'lat', a:1},
  {g:'kury', id:'wylegWlasny', t:'bool', l:'Własny wylęg (koguty w stadzie, inkubator)', v:false, h:'Kurki do wymiany stada z własnych jaj; kogutki odchowane i sprzedane jako rosołowe. Pisklęta szczep przeciw chorobie Mareka (ustal z weterynarzem).'},
  {g:'kury', id:'cenaKoguta', l:'Kogutek rosołowy', min:15, max:90, s:1, v:40, u:'zł/szt.', h:'Założenie; sprawdź lokalnie. Zielononóżka: ok. 16–20 tygodni do ok. 1,5 kg tuszki.'},
  {g:'kury', id:'paszaKogut', l:'Kogutek: ziarno do uboju', min:4, max:14, s:0.5, v:9, u:'kg', a:1},
  {g:'kury', id:'paszaKurka', l:'Kurka: ziarno do nieśności', min:4, max:12, s:0.5, v:8, u:'kg', a:1},
  {g:'kury', id:'kWylegSzt', l:'Wylęg: szczepienie, prąd, straty (na pisklę)', min:0, max:10, s:0.5, v:3, u:'zł', a:1},
  {g:'kury', id:'hWylegSzt', l:'Wylęg i odchów: praca na pisklę', min:0.1, max:1.5, s:0.05, v:0.35, u:'h', a:1, h:'Liczę ok. 2 pisklęta na każdą kurkę do stada (połowa to koguty).'},
  {g:'kury', id:'tunelZima', t:'bool', l:'Zimą drób w tunelu foliowym (głęboka ściółka)', v:false, h:'Tunel po warzywach od listopada do marca: miejsce na czas nakazu zamknięcia drobiu, kompost na wiosnę. Otwory zasłonięte siatką, poidło z grzałką, siatka wkopana przy brzegach.'},
  {g:'kury', id:'kSciolkaTunel', l:'Trociny lub zrębki do tunelu', min:0, max:15, s:0.5, v:4, u:'zł/kurę/rok', a:1},
  {g:'kury', id:'cenaKurki', l:'Cena kurki (odchowanej)', min:15, max:45, s:1, v:28, u:'zł', a:1},
  // --- Drób mięsny i króliki ---
  {g:'drob', id:'brojlery', l:'Kurczaki pastwiskowe', min:0, max:600, s:10, v:0, u:'szt./rok'},
  {g:'drob', id:'wagaTuszki', l:'Waga tuszki', min:1.5, max:3.5, s:0.1, v:2.3, u:'kg'},
  {g:'drob', id:'cenaTuszki', l:'Cena tuszki', min:20, max:60, s:1, v:32, u:'zł/kg', h:'Tuszki kurcząt w hurcie: 9,06 zł/kg (VII 2026, ZSRIR). Kurczak z wybiegu bezpośrednio od rolnika: zwykle ok. 25–40 zł/kg.'},
  {g:'drob', id:'paszaBrojler', l:'Pasza na kurczaka', min:5, max:10, s:0.5, v:7, u:'kg', a:1},
  {g:'drob', id:'gesi', l:'Gęsi (na św. Marcina)', min:0, max:50, s:1, v:10, u:'szt.'},
  {g:'drob', id:'cenaGesi', l:'Cena gęsi', min:100, max:400, s:10, v:220, u:'zł/szt.', h:'Gęsi tuczone w skupie: 16,09 zł/kg żywca (VII 2026, ZSRIR). Gęś owsiana z gospodarstwa ma ok. 4–4,5 kg tuszki.'},
  {g:'drob', id:'kaczki', l:'Kaczki', min:0, max:300, s:5, v:0, u:'szt./rok', h:'Potrzebują wody do kąpieli (brodzik) i mocno brudzą poidła. Dobrze wyjadają ślimaki.'},
  {g:'drob', id:'wagaKaczki', l:'Kaczka: waga tuszki', min:1.8, max:4, s:0.1, v:2.8, u:'kg', a:1},
  {g:'drob', id:'cenaKaczki', l:'Kaczka: cena tuszki', min:25, max:90, s:1, v:45, u:'zł/kg', h:'Eko w sklepach internetowych ok. 68 zł/kg (tuszka 3,2 kg, Wolny Wypas 2026). Od rolnika zwykle taniej.'},
  {g:'drob', id:'paszaKaczka', l:'Kaczka: ziarno', min:6, max:20, s:0.5, v:12, u:'kg/szt.', a:1},
  {g:'drob', id:'indyki', l:'Indyki', min:0, max:100, s:1, v:0, u:'szt./rok', h:'Trzymaj osobno od kur i na innej ziemi: histomonoza (czarna główka), którą przenoszą kury, zabija u indyków nawet do 100% stada. Leków na nią praktycznie nie ma.'},
  {g:'drob', id:'wagaIndyka', l:'Indyk: waga tuszki', min:4, max:12, s:0.5, v:7, u:'kg', a:1},
  {g:'drob', id:'cenaIndyka', l:'Indyk: cena tuszki', min:25, max:90, s:1, v:40, u:'zł/kg', h:'Eko w sklepach ok. 82 zł/kg (tuszka ok. 8 kg). Na Boże Narodzenie i Święto Dziękczynienia popyt rośnie.'},
  {g:'drob', id:'paszaIndyk', l:'Indyk: ziarno', min:15, max:45, s:1, v:30, u:'kg/szt.', a:1},
  {g:'drob', id:'perliczki', l:'Perliczki', min:0, max:300, s:5, v:0, u:'szt./rok', h:'Głośne, za to płoszą jastrzębie i wyjadają owady. Rosną wolno: min. ok. 5 miesięcy.'},
  {g:'drob', id:'wagaPerliczki', l:'Perliczka: waga tuszki', min:1, max:2, s:0.05, v:1.4, u:'kg', a:1},
  {g:'drob', id:'cenaPerliczki', l:'Perliczka: cena tuszki', min:30, max:100, s:1, v:55, u:'zł/kg', h:'Eko ok. 65 zł/kg (Wolny Wypas, gospodarstwo opisane przez topagrar w 2024 r.).'},
  {g:'drob', id:'paszaPerliczka', l:'Perliczka: ziarno', min:4, max:12, s:0.5, v:7, u:'kg/szt.', a:1},
  {g:'drob', id:'kroliki', l:'Króliki: samice', min:0, max:10, s:1, v:0, u:'szt.'},
  {g:'drob', id:'odchowKrol', l:'Odchowane młode na samicę', min:10, max:40, s:1, v:24, u:'szt./rok'},
  {g:'drob', id:'cenaKrol', l:'Cena tuszki królika', min:20, max:120, s:5, v:65, u:'zł/szt.', h:'Tuszka ok. 1,5–2 kg. Króliki w Świętokrzyskiem (V 2026): średnio ok. 30 zł/kg, od 6,5 do 55 zł (ŚODR).'},
  // --- Owce i kozy ---
  {g:'owce', id:'owce', l:'Owce mięsne (matki)', min:0, max:50, s:1, v:12, u:'szt.'},
  {g:'owce', id:'wykoty', l:'Wykoty na owcę w roku', min:1, max:1.5, s:0.05, v:1, h:'Dorper może się kocić 3 razy w 2 lata (1,5 rocznie). Dwa wykoty rocznie się nie da: ciąża trwa ok. 146–150 dni. Przy częstszych wykotach plenność bywa ok. 25% niższa, a zimą potrzeba więcej siana i pracy.'},
  {g:'owce', id:'odchowJag', l:'Odchowane jagnięta z jednego wykotu', min:0.8, max:2, s:0.05, v:1.5},
  {g:'owce', id:'cenaJag', l:'Cena jagnięcia sprzedanego żywcem', min:300, max:1000, s:25, v:550, u:'zł/szt.', h:'Założenie (ok. 40 kg żywca po ok. 13–14 zł/kg). Ceny mięsa owczego na świecie były w 2026 r. rekordowo wysokie.'},
  {g:'owce', id:'jagMieso', l:'Jagnięta sprzedane jako mięso (RHD)', min:0, max:100, s:5, v:50, u:'%', h:'Reszta idzie żywcem. Mięso: ubój w rzeźni, tusza lub paczki dla klientów.'},
  {g:'owce', id:'wagaJag', l:'Waga jagnięcia przy sprzedaży lub uboju', min:25, max:55, s:1, v:40, u:'kg żywca'},
  {g:'owce', id:'cenaMiesaJag', l:'Cena jagnięciny dla klienta', min:25, max:90, s:1, v:45, u:'zł/kg tuszy', h:'Ogłoszenia rolników: zwykle 30–60 zł/kg (mediana ok. 40 zł). Sklepy gospodarstw: 43–52 zł/kg za całą tuszę.'},
  {g:'owce', id:'wydRzeznaJag', l:'Wydajność rzeźna (tusza z żywca)', min:36, max:55, s:1, v:47, u:'%', h:'Mieszańce mięsne ok. 46%, dorper ok. 50%, owce rodzime w chowie ekstensywnym nawet ok. 36%.', a:1},
  {g:'owce', id:'kUbojJag', l:'Ubój usługowy w rzeźni', min:40, max:300, s:10, v:120, u:'zł/szt.', h:'Założenie. Cennik rzeźni sprawdź telefonicznie.'},
  {g:'owce', id:'kRozbior', l:'Rozbiór i pakowanie próżniowe', min:0, max:15, s:0.5, v:4, u:'zł/kg'},
  {g:'owce', id:'odlRzeznia', l:'Odległość do rzeźni (np. Siedlęcin)', min:5, max:100, s:1, v:30, u:'km w jedną stronę'},
  {g:'owce', id:'jagNaKurs', l:'Jagnięta w jednej partii do uboju', min:1, max:15, s:1, v:6, u:'szt.', h:'Każda partia to 2 kursy: dowóz żywych i odbiór schłodzonych tusz.'},
  {g:'owce', id:'kKm', l:'Koszt przejazdu z przyczepką', min:0.5, max:3, s:0.1, v:1.2, u:'zł/km', a:1},
  {g:'owce', id:'remontOwiec', l:'Wymiana matek rocznie', min:10, max:30, s:1, v:20, u:'%', a:1},
  {g:'owce', id:'kozy', l:'Kozy (krzaki, mięso dla psa)', min:0, max:10, s:1, v:3, u:'szt.'},
  {g:'owce', id:'kozySprz', l:'Koźlęta sprzedane na mięso', min:0, max:100, s:10, v:0, u:'%', h:'Reszta koźląt idzie na mięso dla psów. Kozy muszą być ubite w rzeźni, sprzedaż w RHD. Koźlęcina ma popyt głównie na Wielkanoc i wśród klientów z Bałkanów i Bliskiego Wschodu.'},
  {g:'owce', id:'wagaKozla', l:'Koźlę: tuszka', min:5, max:20, s:0.5, v:10, u:'kg', a:1, h:'Ok. 4–5 miesięcy.'},
  {g:'owce', id:'cenaKoziny', l:'Koźlęcina', min:20, max:90, s:1, v:45, u:'zł/kg tuszy', h:'Założenie dla sprzedaży bezpośredniej; sprawdź lokalnie.'},
  {g:'owce', id:'swinie', l:'Świnie dla siebie', min:0, max:4, s:1, v:2, u:'szt./rok'},
  {g:'owce', id:'swinieSprz', l:'Tuczniki na sprzedaż', min:0, max:20, s:1, v:0, u:'szt./rok', h:'Półtusze lub paczki w RHD; ubój tylko w rzeźni. Na Dolnym Śląsku jest ASF: sprawdź u powiatowego lekarza weterynarii, czy w Twoim powiecie wolno trzymać świnie na wybiegu i jakie są wymogi bioasekuracji (np. podwójne ogrodzenie).'},
  {g:'owce', id:'wagaTuszySw', l:'Tucznik: tuszka', min:60, max:130, s:5, v:90, u:'kg', a:1, h:'Na wybiegu ok. 8–10 miesięcy.'},
  {g:'owce', id:'cenaWieprzowiny', l:'Wieprzowina w paczkach', min:12, max:60, s:1, v:22, u:'zł/kg tuszy', h:'Półtusze w hurcie tylko 6,96 zł/kg, żywiec 4,83 zł/kg (VII 2026, ZSRIR). Wieprzowina z wybiegu w paczkach dla stałych klientów: ok. 15–35 zł/kg. Założenie.'},
  {g:'owce', id:'kUbojSw', l:'Tucznik: ubój, rozbiór, transport', min:100, max:800, s:25, v:350, u:'zł/szt.', a:1},
  {g:'owce', id:'kUbojKoz', l:'Koźlę: ubój i transport', min:50, max:300, s:10, v:120, u:'zł/szt.', a:1},
  {g:'owce', id:'konie', l:'Konie (na wszelki wypadek)', min:0, max:4, s:1, v:0, u:'szt.', h:'Koń zjada ok. 3 t s.m. siana i trawy rocznie i ok. 200 kg owsa przy lekkiej pracy.'},
  {g:'owce', id:'kKon', l:'Koń: kowal, weterynarz, minerały', min:300, max:4000, s:50, v:1100, u:'zł/rok', a:1, h:'Struganie kopyt od ok. 50 zł, szczepienie 70–90 zł, odrobaczanie 40–50 zł, przegląd 200–300 zł (kb.pl, 2026).'},
  {g:'owce', id:'hKon', l:'Koń: praca', min:20, max:300, s:10, v:80, u:'h/rok', a:1},
  // --- Przetwórstwo i wysyłka ---
  {g:'przetw', id:'przetwGesi', l:'Gęsi przerobione (półgęsek, wędzonki, smalec)', min:0, max:100, s:5, v:0, u:'%'},
  {g:'przetw', id:'wartPrzetGes', l:'Przetwory z jednej gęsi', min:150, max:700, s:10, v:330, u:'zł', h:'Np. ok. 0,8 kg półgęska po 180–200 zł plus wędzone udka, smalec i pasztet. EKO półgęsek z gęsi pastwiskowej: 200 zł/kg (Manufaktura Dobra, 2026).'},
  {g:'przetw', id:'przetwKaczki', l:'Kaczki przerobione (wędzone piersi, konfitowane udka)', min:0, max:100, s:5, v:0, u:'%'},
  {g:'przetw', id:'wartPrzetKaczka', l:'Przetwory z jednej kaczki', min:80, max:400, s:10, v:190, u:'zł'},
  {g:'przetw', id:'przetwJag', l:'Jagnięcina przerobiona (kiełbasy, kabanosy, szynka)', min:0, max:100, s:5, v:0, u:'% mięsa', h:'Z tej części jagniąt, które idą do rzeźni. Mięso kopytnych musi być z rzeźni.'},
  {g:'przetw', id:'wartPrzetJag', l:'Przetwory z kg tuszy jagnięcej', min:40, max:160, s:5, v:80, u:'zł/kg tuszy', h:'Wartość wyrobów z kg tuszy z kośćmi, po ubytkach przy rozbiorze i wędzeniu. Założenie.'},
  {g:'przetw', id:'kPrzetwProc', l:'Materiały: przyprawy, osłonki, słoiki, próżnia, etykiety', min:5, max:30, s:1, v:12, u:'% wartości', a:1},
  {g:'przetw', id:'hPrzetwGes', l:'Praca: przetwory z gęsi', min:1, max:8, s:0.5, v:3, u:'h/szt.', a:1},
  {g:'przetw', id:'hPrzetwKaczka', l:'Praca: przetwory z kaczki', min:0.5, max:5, s:0.25, v:1.5, u:'h/szt.', a:1},
  {g:'przetw', id:'hPrzetwJagKg', l:'Praca: wyroby z jagnięciny', min:0.2, max:2, s:0.05, v:0.5, u:'h/kg tuszy', a:1},
  {g:'przetw', id:'hPrzetwStale', l:'Praca stała: mycie, dokumentacja, badania', min:0, max:200, s:10, v:60, u:'h/rok', a:1},
  {g:'przetw', id:'wysylka', l:'Przetwory wysyłane kurierem', min:0, max:100, s:5, v:50, u:'%', h:'RHD pozwala sprzedawać na odległość konsumentom, jeśli w transporcie trzymasz właściwą temperaturę. Reszta idzie odbiorem osobistym lub na targu.'},
  {g:'przetw', id:'kPaczki', l:'Paczka: karton termiczny, wkłady, kurier', min:15, max:90, s:1, v:40, u:'zł', h:'Założenie. Zapytaj kurierów o paczki z żywnością chłodzoną.'},
  {g:'przetw', id:'oplataKlienta', l:'Wysyłka doliczana klientowi', min:0, max:60, s:1, v:20, u:'zł/paczkę'},
  {g:'przetw', id:'paczkaKg', l:'Średnia paczka', min:1, max:10, s:0.5, v:3, u:'kg', a:1},
  {g:'przetw', id:'hPaczka', l:'Pakowanie i obsługa zamówienia', min:0.1, max:1, s:0.05, v:0.3, u:'h/paczkę', a:1},
  // --- Plony i sezon ---
  {g:'plony', id:'dniWypasu', l:'Dni wypasu w roku', min:150, max:230, s:5, v:200, u:'dni', h:'Pod Lwówkiem zwykle od ok. 20 kwietnia do końca października.'},
  {g:'plony', id:'wspolWypas', l:'Owce za krowami: lepsze wykorzystanie pastwiska', min:0, max:15, s:1, v:10, u:'%', h:'Wspólny lub następczy wypas bydła i owiec: ok. 10% większa pojemność pastwiska (Nolan i Connolly 1989). Pełny efekt od ok. 1,5 owcy na sztukę bydła.'},
  {g:'plony', id:'plonPast', l:'Plon pastwiska (zjedzony)', min:3, max:8, s:0.25, v:5, u:'t s.m./ha', h:'Średnio w Polsce pastwiska ok. 3,4 t siana/ha (ok. 2,9 t s.m.; ITP), ale to średnia z zaniedbanych. Wypas rotacyjny z koniczyną w runi: ok. 4–6 t s.m. zjedzone; potencjał 2,5–8 t siana/ha.'},
  {g:'plony', id:'plonLaki', l:'Plon łąki (2 pokosy)', min:2.5, max:7, s:0.25, v:4, u:'t s.m./ha', h:'Średnio w Polsce łąki dają ok. 4,6 t siana/ha (ok. 3,9 t s.m.; ITP, 2005–2009); ekstensywne z 1 pokosem ok. 2,5 t siana. Dobra łąka nawożona obornikiem: 4–6 t s.m.'},
  {g:'plony', id:'plonKoniczyny', l:'Plon koniczyny z trawami', min:4, max:9, s:0.25, v:6, u:'t s.m./ha', h:'Koniczyna czerwona z trawami, 2–3 pokosy: zwykle 6–9 t s.m./ha, w gospodarstwach eko i na słabszych glebach ok. 5–7.'},
  {g:'plony', id:'plonZboz', l:'Plon zbóż i mieszanek (eko)', min:1.5, max:5, s:0.1, v:3, u:'t/ha', h:'Gospodarstwa ekologiczne: zboża ok. 1,5–3 t/ha (IUNG). Na glebie IV po koniczynie i oborniku ok. 2,5–3,5; mieszanki zbożowo-strączkowe w doświadczeniach IUNG 2,6–4,9 t/ha. Plon dla klasy IV; klasy gleby ustawiasz w „Ziemi”.'},
  {g:'plony', id:'plonSlomy', l:'Plon słomy', min:1.5, max:4.5, s:0.1, v:3, u:'t/ha', h:'Zwykle ok. 1–1,2 t słomy na 1 t ziarna; żyto i pszenżyto więcej, owies z grochem mniej.'},
  // --- Koszty ---
  // --- Bydło mięsne ---
  {g:'bydlo', id:'mamki', l:'Krowy mamki (angus)', min:0, max:30, s:1, v:0, u:'szt.', h:'Ciekawostka do porównań: w tym modelu najmniej zyskowne z hektara, za to mało pracy i dobre na słabsze łąki. Potrzebny spokojny byk lub inseminacja.'},
  {g:'bydlo', id:'sprzOdsadki', l:'Cielęta sprzedane jako odsadki', min:0, max:100, s:10, v:100, u:'%', h:'Odsadki ok. 7–8 miesięcy, jesienią. Reszta zostaje na opasy do ok. 2 lat.'},
  {g:'bydlo', id:'wagaOdsadka', l:'Odsadek: waga', min:150, max:350, s:10, v:240, u:'kg żywca'},
  {g:'bydlo', id:'cenaOdsadka', l:'Odsadek: cena', min:10, max:30, s:0.5, v:17, u:'zł/kg żywca', h:'Średnia cena skupu bydła rzeźnego w kwietniu 2026 r.: 14,13 zł/kg żywca (KOWR). Odsadki ras mięsnych zwykle drożej za kg. Założenie.'},
  {g:'bydlo', id:'wagaOpas', l:'Opas: waga przy uboju', min:400, max:750, s:10, v:560, u:'kg żywca', h:'Na samej trawie ok. 20–24 miesięcy.'},
  {g:'bydlo', id:'opasyMieso', l:'Opasy sprzedane jako mięso w paczkach', min:0, max:100, s:10, v:50, u:'%', h:'Ubój w rzeźni, sprzedaż w RHD. Reszta na żywiec.'},
  {g:'bydlo', id:'cenaWolowiny', l:'Wołowina w paczkach', min:25, max:90, s:1, v:45, u:'zł/kg tuszy', h:'Średnio za kg tuszy (mieszane elementy). Ćwierćtusze z buhajków w skupie: 27,54 zł/kg (KOWR, kwiecień 2026).'},
  {g:'bydlo', id:'cenaZywcaOpas', l:'Opas na żywiec', min:8, max:25, s:0.5, v:14, u:'zł/kg'},
  {g:'bydlo', id:'wydRzOpas', l:'Wydajność rzeźna opasa', min:48, max:62, s:1, v:55, u:'%', a:1},
  {g:'bydlo', id:'kBydloMies', l:'Weterynarz, kolczyki, minerały, racice', min:200, max:1500, s:50, v:600, u:'zł/szt./rok', a:1},
  {g:'bydlo', id:'kUbojOpas', l:'Ubój, rozbiór, transport opasa', min:300, max:1500, s:50, v:700, u:'zł/szt.', a:1},
  {g:'bydlo', id:'hMamka', l:'Praca: mamka z cielęciem', min:5, max:30, s:1, v:12, u:'h/rok', a:1},
  {g:'bydlo', id:'hOpas', l:'Praca: opas', min:3, max:20, s:1, v:8, u:'h/szt.', a:1},
  {g:'koszty', id:'kOrne', l:'Grunty orne: nasiona, paliwo, kombajn', min:800, max:2500, s:50, v:1600, u:'zł/ha'},
  {g:'koszty', id:'kLaka', l:'Łąka: paliwo, prasowanie usługowo', min:300, max:1500, s:50, v:900, u:'zł/ha'},
  {g:'koszty', id:'kPast', l:'Pastwisko: utrzymanie, koszenie niedojadów', min:0, max:600, s:25, v:200, u:'zł/ha'},
  {g:'koszty', id:'kKrowa', l:'Krowa: weterynarz, minerały, higiena', min:300, max:2000, s:50, v:900, u:'zł/rok'},
  {g:'koszty', id:'kInsem', l:'Inseminacja (bez buhaja)', min:0, max:400, s:10, v:150, u:'zł/krowę'},
  {g:'koszty', id:'kByk', l:'Buhaj: zakup rozłożony, weterynarz', min:0, max:2500, s:50, v:900, u:'zł/rok'},
  {g:'koszty', id:'kMlekoOpak', l:'Butelki, badania mleka', min:0, max:1, s:0.05, v:0.3, u:'zł/l'},
  {g:'koszty', id:'kSer', l:'Kultury, podpuszczka, sól, wosk, prąd', min:0, max:10, s:0.5, v:4, u:'zł/kg sera'},
  {g:'koszty', id:'kKuraDod', l:'Kura: minerały, muszle, dodatki', min:0, max:30, s:1, v:14, u:'zł/rok'},
  {g:'koszty', id:'kOpakJaj', l:'Wytłaczanki', min:0, max:0.2, s:0.01, v:0.08, u:'zł/jajko'},
  {g:'koszty', id:'kBrojler', l:'Kurczak: pisklę, dodatki, ubój', min:5, max:25, s:1, v:10, u:'zł/szt.'},
  {g:'koszty', id:'kGes', l:'Gęś: gąsię, weterynarz', min:15, max:60, s:1, v:35, u:'zł/szt.'},
  {g:'koszty', id:'kKaczka', l:'Kaczka: kaczę, weterynarz, ubój', min:5, max:40, s:1, v:15, u:'zł/szt.'},
  {g:'koszty', id:'kIndyk', l:'Indyk: indyczę, weterynarz, ubój', min:15, max:90, s:1, v:45, u:'zł/szt.'},
  {g:'koszty', id:'kPerliczka', l:'Perliczka: pisklę, weterynarz, ubój', min:5, max:30, s:1, v:12, u:'zł/szt.'},
  {g:'koszty', id:'kKrolik', l:'Królik: szczepienia, wymiana stada', min:50, max:300, s:10, v:120, u:'zł/samicę'},
  {g:'koszty', id:'kOwca', l:'Owca: weterynarz, kolczyki, tryk, racice', min:50, max:300, s:10, v:120, u:'zł/rok'},
  {g:'koszty', id:'kKoza', l:'Koza: weterynarz, minerały', min:30, max:300, s:10, v:100, u:'zł/rok'},
  {g:'koszty', id:'kSwinia', l:'Świnia: prosię, weterynarz', min:200, max:800, s:25, v:400, u:'zł/szt.'},
  {g:'koszty', id:'kStale', l:'KRUS, podatek rolny, ubezpieczenia, certyfikat eko', min:3000, max:25000, s:500, v:11000, u:'zł/rok', h:'KRUS w 2026 r.: ok. 256 zł miesięcznie na osobę (178 zł emerytalno-rentowa i 78 zł wypadkowa), dla 2 osób ok. 6,2 tys. zł rocznie. Podatek rolny 2026: 166 zł z ha przeliczeniowego. Do tego certyfikat eko, OC i ubezpieczenie budynków.'},
  {g:'koszty', id:'kSprzedaz', l:'Sprzedaż: paliwo na dowozy, opłaty targowe', min:0, max:15000, s:250, v:4000, u:'zł/rok'},
  {g:'koszty', id:'kEnergia', l:'Prąd i woda (chłodzenie, mycie, ogólnie)', min:1000, max:8000, s:250, v:2500, u:'zł/rok'},
  {g:'koszty', id:'cenaZiarnaKup', l:'Ziarno eko kupowane (gdy brakuje)', min:900, max:2500, s:50, v:1600, u:'zł/t'},
  {g:'koszty', id:'cenaSianaKup', l:'Siano kupowane (gdy brakuje)', min:300, max:1200, s:50, v:600, u:'zł/t s.m.'},
  {g:'koszty', id:'trociny', t:'bool', l:'Brakującą słomę zastąp trocinami lub zrębkami', v:false, h:'Zamiast kupować słomę, uzupełniasz ściółkę trocinami z tartaku. W gospodarstwie eko tylko z drewna niezaimpregnowanego. Obornik z trocinami rozkłada się wolniej: kompostuj go dłużej przed wywiezieniem.'},
  {g:'koszty', id:'cenaTrocin', l:'Trociny lub zrębki', min:0, max:600, s:10, v:200, u:'zł/t', h:'Ok. 40–80 zł/m³ z tartaku; 1 m³ trocin waży ok. 0,2–0,25 t. Czasem za darmo za odbiór.'},
  {g:'koszty', id:'trocinyNaSlome', l:'Trociny zamiast 1 t słomy', min:0.5, max:1.5, s:0.05, v:1, u:'t', a:1, h:'Trociny chłoną mniej więcej tyle co słoma na kilogram. Założenie.'},
  {g:'koszty', id:'cenaSlomyKup', l:'Słoma kupowana (gdy brakuje)', min:150, max:600, s:25, v:300, u:'zł/t'},
  // --- Inwestycje ---
  {g:'inwest', id:'iWiata', l:'Wiata dla bydła z głęboką ściółką', min:0, max:15000, s:250, v:4500, u:'zł/stanowisko'},
  {g:'inwest', id:'iOwczarnia', l:'Wiata dla owiec i kóz', min:0, max:1500, s:25, v:400, u:'zł/szt.'},
  {g:'inwest', id:'iKurnik', l:'Kurnik mobilny (zimą przy obejściu)', min:0, max:500, s:10, v:160, u:'zł/kurę'},
  {g:'inwest', id:'iBrojl', l:'Przenośne zagrody dla kurczaków', min:0, max:40, s:1, v:20, u:'zł/miejsce'},
  {g:'inwest', id:'iDrobInny', l:'Przenośne wiaty: kaczki, indyki, perliczki', min:0, max:80, s:1, v:25, u:'zł/miejsce', h:'Indyk liczy się za 3 miejsca. Kaczki zwykle w 2 rzutach na sezon.'},
  {g:'inwest', id:'iKrolik', l:'Przenośne klatki dla królików', min:0, max:1000, s:50, v:400, u:'zł/samicę'},
  {g:'inwest', id:'iOgrodz', l:'Ogrodzenie elektryczne', min:0, max:6000, s:100, v:1200, u:'zł/ha', h:'Przy owcach i kozach liczę o 30% więcej (więcej drutów, siatki).'},
  {g:'inwest', id:'iWoda', l:'Woda na pastwiska (rury, poidła)', min:0, max:30000, s:500, v:4000, u:'zł'},
  {g:'inwest', id:'iMleczarnia', l:'Dojarka, schładzalnik, mleczarnia', min:0, max:120000, s:1000, v:30000, u:'zł', h:'Mniej, jeśli przerobisz starą oborę.'},
  {g:'inwest', id:'iSerownia', l:'Serownia i dojrzewalnia', min:0, max:120000, s:1000, v:25000, u:'zł'},
  {g:'inwest', id:'iMaszyny', l:'Używane maszyny do C-360', min:0, max:120000, s:1000, v:20000, u:'zł', h:'Kosiarka, przetrząsacz, zgrabiarka, siewnik, brona. Mniej, jeśli część masz.'},
  {g:'inwest', id:'iWarzywa', l:'Tunel, nawadnianie, chłodnia, narzędzia', min:0, max:150000, s:5000, v:60000, u:'zł/ha'},
  {g:'inwest', id:'iUl', l:'Ul z wyposażeniem i rodziną', min:0, max:2000, s:50, v:900, u:'zł/szt.'},
  {g:'inwest', id:'iWyleg', l:'Inkubator, ogrzewacz, odchowalnia', min:0, max:15000, s:250, v:4000, u:'zł'},
  {g:'inwest', id:'iTunelDrob', l:'Tunel: siatki, poidła z grzałką, lampy', min:0, max:30000, s:500, v:5000, u:'zł', h:'Przy istniejącym tunelu. Nowy tunel 6 × 20 m to dużo więcej.'},
  {g:'inwest', id:'iKon', l:'Wiata lub boks dla konia', min:0, max:20000, s:500, v:6000, u:'zł/szt.'},
  {g:'inwest', id:'iPrzetw', l:'Wędzarnia, chłodnia, pakowarka, pomieszczenie', min:0, max:150000, s:5000, v:45000, u:'zł', h:'Założenie. Pomieszczenie musi spełniać wymagania higieniczne i być zgłoszone do powiatowego lekarza weterynarii.'},
  // --- Dopłaty ---
  {g:'doplaty', id:'eko', t:'bool', l:'Płatność ekologiczna (po wejściu w system eko)', v:true},
  {g:'doplaty', id:'premiaObsada', t:'bool', l:'Premia za produkcję roślinno-zwierzęcą (0,5–1,5 DJP/ha)', v:true},
  {g:'doplaty', id:'miedzyplony', t:'bool', l:'Międzyplony ozime i wsiewki (ekoschemat „Rolnictwo węglowe”, 5 pkt/ha)', v:false, h:'Mieszanka min. 2 gatunków wysiana do 1 X i utrzymana do 15 II; wsiewka bobowatych w owies utrzymana min. 8 tygodni po zbiorze. Bez środków ochrony roślin. Gdzie wypadają w płodozmianie, zobaczysz w sekcji „Płodozmian”.'},
  {g:'doplaty', id:'wegObornik', t:'bool', l:'Wymieszanie obornika z glebą w 12 h (2 pkt/ha)', v:false, h:'Zdjęcia geotagowane w aplikacji Mobilna ARiMR albo oświadczenie z datami w ciągu 14 dni.'},
  {g:'doplaty', id:'wegStruktura', t:'bool', l:'Zróżnicowana struktura upraw (3 pkt/ha gruntów ornych)', v:false, h:'Min. 3 uprawy, zboża najwyżej 65%, uprawy poprawiające materię organiczną (np. koniczyna) min. 20%. Sprawdzam to w Twoim płodozmianie.'},
  {g:'doplaty', id:'wartPkt', l:'Wartość punktu ekoschematu', min:50, max:150, s:1, v:100, u:'zł/pkt', h:'Ok. 100 zł za punkt; stawka zmienia się co roku (ARiMR). Próg: punkty co najmniej 25% UR × 5 pkt.', a:1},
  {g:'doplaty', id:'kMiedzyplon', l:'Międzyplon: nasiona eko i siew', min:100, max:900, s:25, v:400, u:'zł/ha', a:1},
  {g:'doplaty', id:'hMiedzyplon', l:'Międzyplon: praca', min:0.5, max:6, s:0.5, v:2, u:'h/ha', a:1},
  {g:'doplaty', id:'paszaMiedzyplon', l:'Międzyplon: wypas jesienią i wczesną wiosną', min:0, max:3, s:0.1, v:1, u:'t s.m./ha', h:'Owce lub jałówki na międzyplonie (żyto z wyką) jesienią i w marcu. Ostrożnie z wypasem przed 15 II.', a:1},
  {g:'doplaty', id:'mpMix', l:'Mieszanka międzyplonu (wybór przy płodozmianie)', min:0, max:5, s:1, v:0, u:'', a:1},
  {g:'doplaty', id:'poplonScier', t:'bool', l:'Poplon ścierniskowy na zielony nawóz przed oziminą (bez dopłaty)', v:false, h:'Po wczesnych żniwach, gdy następne jest zboże ozime: gorczyca, facelia lub gryka na 6–7 tygodni, potem przyoranie we wrześniu. Nie spełnia wymogów ekoschematu (okrywa nie trwa do 15 II), ale poprawia glebę i daje paszę gęsiom.'},
  {g:'doplaty', id:'scMix', l:'Mieszanka poplonu ścierniskowego (wybór przy płodozmianie)', min:0, max:2, s:1, v:0, u:'', a:1},
  {g:'doplaty', id:'paszaPoplon', l:'Poplon ścierniskowy: pasza z wypasu lub pokosu', min:0, max:3, s:0.1, v:0.3, u:'t s.m./ha', a:1},
  {g:'doplaty', id:'kPoplon', l:'Poplon ścierniskowy: nasiona i siew', min:50, max:600, s:25, v:250, u:'zł/ha', a:1},
  {g:'doplaty', id:'ekstTUZ', t:'bool', l:'Ekoschemat: ekstensywne użytki zielone z obsadą', v:false, h:'Sprawdź w ODR, czy da się go łączyć z płatnością ekologiczną.'},
  {g:'doplaty', id:'mlodyRolnik', t:'bool', l:'Płatność dla młodego rolnika', v:false},
  {g:'doplaty', id:'onw', l:'ONW (jeśli działki są w strefie)', min:0, max:850, s:1, v:0, u:'zł/ha', h:'Gmina Lwówek Śląski: tylko część obrębów. Stawki 2026: specyficzne strefa I 179 zł, strefa II 264 zł, strefa II podgórska z obsadą min. 0,3 DJP/ha 676 zł (np. Nagórze).'},
  {g:'doplaty', id:'dbKrowy', t:'bool', l:'Dobrostan: krowy – wypas i ściółka (ok. 380 zł/szt.)', v:true},
  {g:'doplaty', id:'dbKrowyPow', t:'bool', l:'Dobrostan: krowy – powierzchnia w wiacie większa o 20% (ok. 640 zł/szt.)', v:false, h:'Wymaga odpowiednio dużej wiaty; policz metry przed budową.'},
  {g:'doplaty', id:'dbOwceKozy', t:'bool', l:'Dobrostan: owce i kozy (ok. 143 i 138 zł/szt.)', v:true},
  {g:'doplaty', id:'dbKury', t:'bool', l:'Dobrostan: kury nieśne (ok. 13 zł/szt.)', v:true},
  {g:'doplaty', id:'dobrostan', l:'Inne praktyki dobrostanowe (kwota)', min:0, max:10000, s:100, v:0, u:'zł/rok'},
  // --- Normy pracy ---
  {g:'praca', id:'hKrowyStale', l:'Krowy: dojarnia, mycie (stałe)', min:0, max:800, s:10, v:400, u:'h/rok'},
  {g:'praca', id:'hKrowa', l:'Krowy: na każdą krowę', min:30, max:200, s:5, v:90, u:'h/rok', h:'Na krowę: wypas, przepędy, ściółka, cielęta, leczenie (do tego czas stały dojarni). Razem przy 5 krowach wychodzi ok. 170 h na krowę rocznie. Same dojenie w dużych oborach to ok. 20 h na krowę (ITP), w małym stadzie dojarką bańkową dużo więcej.'},
  {g:'praca', id:'hSer', l:'Serowarstwo', min:1, max:6, s:0.5, v:3, u:'h/100 l', h:'Ser twardy: ok. 3–4 h na partię z 100 l razem z myciem; potem pielęgnacja w dojrzewalni. Wpisz swój czas po kilku partiach.'},
  {g:'praca', id:'hSprzMleko', l:'Sprzedaż mleka (butelki, klienci)', min:0, max:3, s:0.1, v:1, u:'h/100 l'},
  {g:'praca', id:'hSprzJaja', l:'Pakowanie i sprzedaż jaj', min:0, max:1, s:0.05, v:0.4, u:'h/100 jaj'},
  {g:'praca', id:'hSprzStale', l:'Sprzedaż: targ, dowozy, telefon (stałe)', min:0, max:400, s:10, v:100, u:'h/rok'},
  {g:'praca', id:'hKuryStale', l:'Kury: stałe (przestawianie kurnika)', min:0, max:200, s:10, v:60, u:'h/rok'},
  {g:'praca', id:'hKura', l:'Kury: na każdą kurę', min:0.3, max:3, s:0.1, v:1, u:'h/rok', h:'Karmienie, woda, zbieranie jaj, przestawianie kurnika. Przy ok. 100–300 kurach zwykle 1–2 h na kurę rocznie razem ze stałym czasem i sprzedażą jaj.'},
  {g:'praca', id:'hBrojler', l:'Kurczak: odchów, ubój, patroszenie', min:0.2, max:1.2, s:0.05, v:0.6, u:'h/szt.', h:'Missouri Extension (chów pastwiskowy): ok. 0,3 h na kurczaka przy 100 szt. w partii, z ubojem; przy 700 szt. ok. 0,1 h. Tu 0,6 h razem ze sprzedażą i nauką na początku.'},
  {g:'praca', id:'hGes', l:'Gęś', min:0.5, max:4, s:0.5, v:1.5, u:'h/szt.'},
  {g:'praca', id:'hKaczka', l:'Kaczka: odchów, ubój, skubanie', min:0.3, max:2, s:0.05, v:0.8, u:'h/szt.'},
  {g:'praca', id:'hIndyk', l:'Indyk: odchów, ubój', min:0.5, max:5, s:0.25, v:2, u:'h/szt.'},
  {g:'praca', id:'hPerliczka', l:'Perliczka: odchów, ubój', min:0.3, max:2, s:0.05, v:0.7, u:'h/szt.'},
  {g:'praca', id:'hKrolik', l:'Królik: na samicę z młodymi', min:5, max:50, s:1, v:20, u:'h/rok'},
  {g:'praca', id:'hOwca', l:'Owca', min:2, max:15, s:0.5, v:6, u:'h/rok', h:'Owce mięsne ekstensywnie: zwykle 5–10 h na matkę rocznie (wykoty, racice, odrobaczanie, strzyża).'},
  {g:'praca', id:'hKursRzeznia', l:'Kurs do rzeźni (tam i z powrotem)', min:0.5, max:5, s:0.25, v:1.5, u:'h'},
  {g:'praca', id:'hSprzMieso', l:'Sprzedaż jagnięciny: telefony, wydawanie paczek', min:0, max:3, s:0.1, v:0.75, u:'h/jagnię'},
  {g:'praca', id:'hKoza', l:'Koza', min:2, max:15, s:0.5, v:6, u:'h/rok'},
  {g:'praca', id:'hSwinia', l:'Świnia', min:10, max:50, s:1, v:25, u:'h/szt.'},
  {g:'praca', id:'hSiano', l:'Siano (z usługowym prasowaniem)', min:4, max:25, s:1, v:10, u:'h/ha'},
  {g:'praca', id:'hZboza', l:'Zboża (z usługowym kombajnem)', min:8, max:30, s:1, v:15, u:'h/ha'},
  {g:'praca', id:'hOgolne', l:'Ogrodzenia, naprawy, papiery', min:50, max:400, s:10, v:150, u:'h/rok'},
  {g:'praca', id:'hOgrod', l:'Sad i warzywnik', min:50, max:600, s:10, v:240, u:'h/ha'},
];

// Separatory podsekcji w panelach suwaków (przed danym parametrem)
const SEPS = {
  krowy:'Stado i mleko', ser:'Sery i sprzedaż', byk:'Rozród i brakowanie',
  kury:'Stado nieśne', wylegWlasny:'Własny wylęg', tunelZima:'Zima w tunelu', cenaKurki:'Zakup kurek',
  brojlery:'Kurczaki pastwiskowe', gesi:'Gęsi', kaczki:'Kaczki', indyki:'Indyki', perliczki:'Perliczki', kroliki:'Króliki',
  owce:'Owce', kozy:'Kozy', swinie:'Świnie', konie:'Konie',
  warzywaSprz:'Warzywa', owoceSprz:'Owoce z sadu', klody:'Grzyby na kłodach', ule:'Pszczoły',
  przetwGesi:'Co przerabiasz', kPrzetwProc:'Koszty i praca', wysylka:'Wysyłka',
  eko:'Rolnictwo ekologiczne', miedzyplony:'Ekoschemat: rolnictwo węglowe', ekstTUZ:'Inne ekoschematy i płatności', dbKrowy:'Dobrostan',
  kOrne:'Pola i użytki zielone', kKrowa:'Zwierzęta', kStale:'Koszty stałe', cenaZiarnaKup:'Dokupowanie pasz i ściółki',
  hKrowyStale:'Krowy i sery', hKuryStale:'Drób', hOwca:'Owce, kozy, świnie', hSiano:'Pola i reszta',
  iWiata:'Budynki i wiaty', iOgrodz:'Pastwiska', iMleczarnia:'Mleczarnia i maszyny', iWarzywa:'Pozostałe',
  udzialIII:'Klasy gleby', plodLat:'Płodozmian',
};
const GROUPS = {
  ludzie:'Ludzie i czas pracy', ziemia:'Ziemia', krowy:'Krowy mleczne i sery', kury:'Kury nieśne', drob:'Drób mięsny i króliki',
  bydlo:'Bydło mięsne (angus)', owce:'Owce, kozy, świnie', warzywa:'Warzywa, owoce, grzyby, pszczoły', przetw:'Przetwórstwo i wysyłka (RHD)', plony:'Plony i sezon', koszty:'Koszty bieżące', inwest:'Inwestycje',
  doplaty:'Dopłaty', praca:'Normy czasu pracy'
, dom:'Budżet domu', gorzej:'Wariant pesymistyczny'};

const PRESETS = [
  {id:'zalecany', l:'Mleko + jaja + owce', note:'Zalecany start', set:{scMix:0, paszaPoplon:0.3, trociny:false, mpMix:0, poplonScier:false, kozySprz:0, swinieSprz:0, mamki:0, areaTotal:14, obejscie:2, sad:0.5, warzywnik:0.15, pastwisko:5.5, laka:1.5, zbozaUdzial:72, krowy:4, ser:20, kury:200, owce:12, kozy:3, gesi:10, swinie:2, brojlery:0, kroliki:0, warzywaSprz:0, ule:0, dzierzawa:0, konie:0, wykoty:1, odchowJag:1.5, kaczki:0, indyki:0, perliczki:0, owoceSprz:0, klody:0, przetwGesi:0, przetwKaczki:0, przetwJag:0}},
  {id:'mleko', l:'Mleko + jaja', note:'Bez owiec', set:{scMix:0, paszaPoplon:0.3, trociny:false, mpMix:0, poplonScier:false, kozySprz:0, swinieSprz:0, mamki:0, areaTotal:14, obejscie:2, sad:0.5, warzywnik:0.15, pastwisko:4.0, laka:2.0, zbozaUdzial:67, krowy:5, ser:25, kury:200, owce:0, kozy:3, gesi:10, swinie:2, brojlery:0, kroliki:0, warzywaSprz:0, ule:0, dzierzawa:0, konie:0, wykoty:1, odchowJag:1.5, kaczki:0, indyki:0, perliczki:0, owoceSprz:0, klody:0, przetwGesi:0, przetwKaczki:0, przetwJag:0}},
  {id:'drob', l:'Drób na pierwszym planie', note:'Mało krów', set:{scMix:0, paszaPoplon:0.3, trociny:false, mpMix:0, poplonScier:false, kozySprz:0, swinieSprz:0, mamki:0, areaTotal:14, obejscie:2, sad:0.5, warzywnik:0.15, pastwisko:3.5, laka:1.5, zbozaUdzial:75, krowy:2, ser:10, kury:300, owce:10, kozy:3, gesi:20, swinie:2, brojlery:400, kroliki:0, warzywaSprz:0, ule:0, dzierzawa:0, konie:0, wykoty:1, odchowJag:1.5, kaczki:0, indyki:0, perliczki:0, owoceSprz:0, klody:0, przetwGesi:0, przetwKaczki:0, przetwJag:0}},
  {id:'rodzina', l:'Rodzina: cel 120 tys.', note:'Konie, owce, +3 ha', set:{scMix:0, paszaPoplon:0.3, trociny:true, mpMix:0, poplonScier:false, kozySprz:0, swinieSprz:0, mamki:0, areaTotal:14, obejscie:2, sad:0.5, warzywnik:0.15, dzierzawa:3, warzywaSprz:0, pastwisko:6.8, laka:1, zbozaUdzial:66, krowy:5, ser:60, kury:250, owce:10, wykoty:1.5, odchowJag:1.3, kozy:3, gesi:15, swinie:2, konie:2, brojlery:250, kroliki:3, ule:4, kaczki:0, indyki:0, perliczki:0, owoceSprz:0, klody:0, przetwGesi:0, przetwKaczki:0, przetwJag:0, jagMieso:50}},
  {id:'roznorodnie', l:'Rodzina: różnorodnie', note:'Kaczki, perliczki, owoce, grzyby', set:{scMix:0, paszaPoplon:0.3, trociny:true, mpMix:0, poplonScier:false, kozySprz:0, swinieSprz:0, mamki:0, areaTotal:14, obejscie:2, sad:0.5, warzywnik:0.15, dzierzawa:3, warzywaSprz:0, pastwisko:6.8, laka:1, zbozaUdzial:65, krowy:5, ser:60, kury:270, owce:10, wykoty:1.5, odchowJag:1.3, kozy:3, gesi:10, swinie:2, konie:2, brojlery:0, kroliki:3, ule:4, kaczki:40, indyki:0, perliczki:30, owoceSprz:50, klody:100, przetwGesi:0, przetwKaczki:0, przetwJag:0, jagMieso:100}},
  {id:'wedzarnia', l:'Rodzina + wędzarnia', note:'Półgęsek, wyroby, wysyłka', set:{scMix:0, paszaPoplon:0.3, trociny:true, mpMix:0, poplonScier:false, kozySprz:0, swinieSprz:0, mamki:0, areaTotal:14, obejscie:2, sad:0.5, warzywnik:0.15, dzierzawa:3, warzywaSprz:0, pastwisko:6.8, laka:1, zbozaUdzial:64, krowy:5, ser:70, kury:250, owce:10, wykoty:1.5, odchowJag:1.3, kozy:3, gesi:20, swinie:1, konie:2, brojlery:0, kroliki:3, ule:4, kaczki:50, indyki:0, perliczki:0, owoceSprz:0, klody:0, przetwGesi:100, przetwKaczki:100, przetwJag:100, jagMieso:100}},
  {id:'minimum', l:'Minimum: 12 ha, 3 krowy', note:'Mało pracy i inwestycji', set:{scMix:0, paszaPoplon:0.3, trociny:false, mpMix:0, poplonScier:false, kozySprz:0, swinieSprz:0, mamki:0, areaTotal:12, dzierzawa:0, obejscie:2, sad:0.5, warzywnik:0.15, warzywaSprz:0, konie:0, kozy:3, swinie:2, kroliki:0, ule:0, wykoty:1.5, odchowJag:1.3, jagMieso:50, indyki:0, perliczki:0, owoceSprz:0, klody:0, przetwGesi:0, przetwKaczki:0, przetwJag:0, krowy:3, ser:0, kury:60, brojlery:250, kaczki:100, gesi:40, owce:0, pastwisko:5.1, laka:0, zbozaUdzial:58}},
  {id:'minimumBez', l:'Minimum: 12 ha bez krów', note:'Drób i owce', set:{scMix:0, paszaPoplon:0.3, trociny:false, mpMix:0, poplonScier:false, kozySprz:0, swinieSprz:0, mamki:0, areaTotal:12, dzierzawa:0, obejscie:2, sad:0.5, warzywnik:0.15, warzywaSprz:0, konie:0, kozy:3, swinie:2, kroliki:0, ule:0, wykoty:1.5, odchowJag:1.3, jagMieso:50, indyki:0, perliczki:0, owoceSprz:0, klody:0, przetwGesi:0, przetwKaczki:0, przetwJag:0, krowy:0, ser:0, kury:100, brojlery:375, kaczki:90, gesi:30, owce:26, pastwisko:3, laka:0, zbozaUdzial:50}},
  {id:'maksimum', l:'Maksimum zysku', note:'Cały czas rodziny, bez limitu tygodnia', set:{scMix:0, paszaPoplon:0.3, trociny:true, mpMix:0, poplonScier:false, kozySprz:0, swinieSprz:0, mamki:0, areaTotal:14, dzierzawa:0, obejscie:2, sad:0.5, warzywnik:0.15, konie:0, kozy:3, swinie:2, wykoty:1.5, odchowJag:1.3, indyki:0, przetwJag:0, krowy:3, ser:70, kury:180, brojlery:600, kaczki:230, perliczki:300, gesi:20, owce:0, kroliki:0, ule:13, warzywaSprz:1.35, owoceSprz:90, klody:400, przetwGesi:0, przetwKaczki:0, jagMieso:0, pastwisko:3.2, laka:0, zbozaUdzial:72}},
  {id:'bezDojenia', l:'Bez dojenia', note:'Mniej pracy', set:{scMix:0, paszaPoplon:0.3, trociny:false, mpMix:0, poplonScier:false, kozySprz:0, swinieSprz:0, mamki:0, areaTotal:14, obejscie:2, sad:0.5, warzywnik:0.15, pastwisko:6, laka:1.5, zbozaUdzial:85, krowy:0, ser:0, kury:200, owce:30, kozy:4, gesi:20, swinie:2, brojlery:200, kroliki:0, warzywaSprz:0, ule:0, dzierzawa:0, konie:0, wykoty:1, odchowJag:1.5, kaczki:0, indyki:0, perliczki:0, owoceSprz:0, klody:0, przetwGesi:0, przetwKaczki:0, przetwJag:0}},
];

const ASSUME = [
  {id:'realnie', l:'Realnie', set:{mleko:3700, cenaMleka:5, cenaSera:80, niesnosc:200, cenaJaja:1.45, jajaSprz:90, cenaJag:550, cenaMiesaJag:45, cenaTuszki:32, plonZboz:3, plonSlomy:3, plonPast:5, plonLaki:4, plonKoniczyny:6, hKrowa:90, hKura:1, hBrojler:0.6, kStale:11000}},
  {id:'optymistycznie', l:'Optymistycznie', set:{mleko:4000, cenaMleka:6.5, cenaSera:100, niesnosc:220, cenaJaja:1.7, jajaSprz:93, cenaJag:650, cenaMiesaJag:52, cenaTuszki:38, plonZboz:3.5, plonSlomy:3.3, plonPast:6, plonLaki:5, plonKoniczyny:7, hKrowa:80, hKura:0.9, hBrojler:0.5, kStale:10000}},
];

// Stawki dopłat (2025, eko: szacunek na 2023)
const RATES = {pwd:488.55, redys:176.84, mlody:248.16, krowy:412.63, bydlo:322.49, owce:110.16, kozy:48.12,
  ekoTUZ:1043, ekoOrne:1504, ekoSad:1961, premia:573, ekstTUZ:435.10, ekoWarz:2391,
  dbKrowaWypas:287.52, dbKrowaSciolka:92.75, dbKrowaPow:639.97, dbOwca:143.30, dbKoza:138.39, dbKura:13.12};

// Profile miesięczne pracy (I–XII), normalizowane do średniej 1
const PROF = {
  krowy:[0.6,0.6,1,1.1,1.1,1.1,1.1,1.05,1,1,0.9,0.7],
  ser:[0.2,0.2,0.6,1,1.4,1.6,1.6,1.5,1.2,0.8,0.4,0.2],
  kury:[0.85,0.9,1,1.05,1.05,1.05,1.05,1.05,1,1,0.95,0.85],
  wyleg:[0,0.5,2,2.5,2,1.5,1.2,1,0.8,0.3,0,0],
  bydlo:[1.2,1.2,1.3,1,0.8,0.8,0.8,0.8,0.9,1.3,1,1.1],
  miedzyplony:[0,0.3,0.2,0,0,0,0,1.5,1.5,0,0,0],
  brojlery:[0,0,0,0.5,1.5,1.5,1.5,1.5,1,0.5,0,0],
  gesi:[0,0,0,0.5,1,1,1,1,1,1.5,2,0.5],
  kaczki:[0,0,0,0.3,1.2,1.5,1.5,1.5,1.3,0.8,0.3,0],
  indyki:[0,0,0,0,0.6,1,1,1,1.2,1.5,2,1.5],
  perliczki:[0,0,0,0,0.8,1.2,1.2,1.2,1.2,1.4,1.2,0.3],
  przetwory:[0.4,0.3,0.3,0.3,0.3,0.4,0.5,0.7,1,1.6,3,3],
  owoce:[0,0,0,0,0,0.3,0.8,1.8,3.5,3.5,1.2,0.3],
  grzyby:[0.3,0.3,0.8,1.3,1.4,1,0.7,0.9,1.5,1.6,1,0.3],
  kroliki:[0.7,0.7,0.9,1.1,1.2,1.2,1.2,1.2,1.1,1,0.9,0.8],
  owce:[0.8,1,1.8,1.6,1,0.8,0.8,0.8,0.8,0.8,0.8,0.8],
  kozy:[0.8,0.9,1.3,1.2,1,1,1,1,1,1,0.9,0.9],
  konie:[1,1,1,1,1,1,1,1,1,1,1,1],
  swinie:[0.5,0.5,0.8,1.2,1.3,1.3,1.3,1.3,1.2,1.2,1,0.5],
  siano:[0,0,0,0,2,4,2,2,1,0,0,0],
  zboza:[0,0,1,2,1,0,1,3,2,2,0,0],
  sprzedaz:[0.75,0.75,0.9,1,1.1,1.15,1.15,1.15,1.1,1.05,0.95,0.85],
  ogolne:[0.8,0.8,1.3,1.5,1.2,1,1,1,1,1,0.8,0.6],
  ogrod:[0.2,0.3,0.8,1.5,2,2,2,1.8,1.5,1,0.5,0.2],
  warzywa:[0.1,0.2,0.7,1.3,1.8,2,2,1.9,1.6,1.1,0.5,0.2],
  ule:[0.1,0.2,0.8,1.4,1.8,1.8,1.6,1.3,0.9,0.4,0.2,0.1],
};
for (const k in PROF){ const m = PROF[k].reduce((a,b)=>a+b,0)/12; PROF[k] = PROF[k].map(x=>x/m); }

const LAB_GROUPS = [
  {id:'krowy', l:'Krowy i sery', keys:['bydlo','krowy','ser']},
  {id:'drob', l:'Drób i króliki', keys:['kury','wyleg','brojlery','gesi','kaczki','indyki','perliczki','kroliki']},
  {id:'owce', l:'Owce, kozy, świnie, konie', keys:['owce','kozy','swinie','konie']},
  {id:'pole', l:'Siano i zboża', keys:['siano','zboza','miedzyplony']},
  {id:'warz', l:'Warzywa, owoce, grzyby, pszczoły', keys:['warzywa','owoce','grzyby','ule']},
  {id:'przetw', l:'Przetwórstwo i wysyłka', keys:['przetwory']},
  {id:'reszta', l:'Sprzedaż, naprawy, ogród', keys:['sprzedaz','ogolne','ogrod']},
];

const sum = o => Object.values(o).reduce((a,b)=>a+b,0);

function defaults(){ const p={}; DEF.forEach(d=>p[d.id]=d.v); return p; }

const G_CENY = ['cenaMleka','cenaSera','cenaCielaka','cenaKrowyBrak','cenaJaja','cenaTuszki','cenaGesi','cenaKrol','cenaKaczki','cenaIndyka','cenaPerliczki','cenaJag','cenaMiesaJag','cenaWarzywHa','cenaMiodu','cenaOwocow','cenaGrzybow','wartPrzetGes','wartPrzetKaczka','wartPrzetJag','cenaOdsadka','cenaWolowiny','cenaZywcaOpas','cenaKoziny','cenaWieprzowiny'];
const G_PLONY = ['plonZboz','plonSlomy','plonPast','plonLaki','plonKoniczyny','plonSad','miodUl','plonKloda'];
const G_WYD = ['mleko','niesnosc','odchowJag','odchowKrol'];
const G_KUP = ['cenaZiarnaKup','cenaSianaKup','cenaSlomyKup','cenaTrocin'];
// Wariant pesymistyczny: bieżące ustawienia pogorszone o suwaki z grupy gorzej
function gorzej(p){
  const q = Object.assign({}, p);
  G_CENY.forEach(k => q[k] = p[k]*(1 - p.gCeny/100));
  G_PLONY.forEach(k => q[k] = p[k]*(1 - p.gPlony/100));
  G_WYD.forEach(k => q[k] = p[k]*(1 - p.gWyd/100));
  G_KUP.forEach(k => q[k] = p[k]*(1 + p.gKoszty/100));
  q._fH = 1 + p.gGodz/100; q._fC = 1 + p.gKoszty/100;
  return q;
}

// Budżet domu: ile gospodarstwo musi dać na czysto
function budzet(p){
  const wyd = p.wydDom*12, zapas = wyd*p.zapasDom/100, z800 = p.dzieci800*800*12;
  const potrzeba = Math.max(0, wyd + zapas + p.odkladDom - z800);
  return {wyd, zapas, odklad:p.odkladDom, z800, potrzeba, bez800: wyd + zapas + p.odkladDom};
}
function celEff(p){ return p.celZBudzetu ? budzet(p).potrzeba : p.celNetto; }

// ---------- Przepływy gotówki: rozkład w miesiącach ----------
const CF = {
  R: {mleko:[0,0,0.6,1.1,1.4,1.3,1.2,1.1,1,0.9,0.8,0.6], ser:[0.8,0.6,0.5,0.5,0.7,0.8,0.9,0.9,1,1.1,1.6,2.6], cieleta:[0,0,0.2,1,1,0.3,0,0,0.2,1,0.5,0],
      jaja:[0.5,0.6,0.9,1.2,1.3,1.3,1.2,1.1,1,0.9,0.6,0.5], koguty:[0,0,0,0,0,0.5,1,1,0.5,0,0,0], brojlery:[0,0,0,0,0,0.8,1,1,1,1,0.2,0],
      gesi:[0,0,0,0,0,0,0,0,0,0.3,3,0.7], kaczki:[0,0,0,0,0,0,0.5,1,1,1,0.8,0.2], indyki:[0,0,0,0,0,0,0,0,0,0.2,0.8,3], perliczki:[0,0,0,0,0,0,0,0,1,1.2,0.8,0.3],
      kroliki:[0.3,0.3,0.5,0.8,1,1,1,1,1,1.2,1.2,1], owce:[0,0,0,0,0,0.5,1,1.5,1.2,0.8,0.3,0], jagniecina:[0,0,0.6,0.6,0.2,0.2,0.4,0.8,1,1,0.8,1],
      przetwory:[0.3,0.2,0.2,0.4,0.2,0.2,0.2,0.3,0.5,1,2.5,3], owoce:[0,0,0,0,0,0,0.3,1,2,1.5,0.6,0.4], grzyby:[0,0,0.2,1,1.2,0.6,0.3,0.5,1.2,1.4,0.8,0.2],
      warzywa:[0.2,0.2,0.5,0.3,0.6,1,1.4,1.5,1.3,1,0.4,0.2], kozy:[0,0,0.6,1.2,0.8,0.5,0.4,0.4,0.6,0.8,0.5,0.2], swinie:[0,0,0,0,0,0,0,0,0.5,1.5,2,1], miod:[0,0,0,0,0,0.6,1.2,1.2,0.6,0.3,0.3,0.6], bydlo:[0,0,0,0,0,0,0,0,0.6,2,0.6,0.2]},
  C: {orne:[0,0,1.6,1.4,0.4,0.3,1.2,1.4,1.2,0.6,0,0], laka:[0,0,0,0,0,1.5,0.5,1,0,0,0,0], past:[0,0,0.8,1,0.4,0,0,0,0,0,0,0],
      krowy:[1,1,1.4,1,1,1,1,1,1,1,1,0.6], mlekoOpak:[0,0,0.6,1.1,1.4,1.3,1.2,1.1,1,0.9,0.8,0.6], ser:[0,0,0.5,1.2,1.5,1.4,1.3,1.2,1.1,1,0.5,0.3],
      kury:[0.6,0.6,2,1.5,0.8,0.8,0.8,0.8,0.8,0.8,0.7,0.6], brojlery:[0,0,0,0.8,1.2,1.3,1.3,1.3,1.1,0.8,0.2,0], gesi:[0,0,0,0.5,1.5,1,1,1,1,1.5,1.5,0],
      kaczki:[0,0,0,0.5,1.5,1.5,1.5,1.5,1.2,0.8,0.5,0], indyki:[0,0,0,0,1,1,1,1,1.2,1.5,2,1.3], perliczki:[0,0,0,0,1.2,1.2,1.2,1.2,1.2,1.2,0.8,0],
      przetwory:[0.3,0.2,0.2,0.4,0.2,0.2,0.2,0.3,0.5,1,2.5,3], owoce:[0,0,0,0,0,0,0.3,1,2,1.5,0.6,0.4], grzyby:[0,0,2,2,0.5,0.5,0.5,0.5,0.5,0.5,0,0],
      warzywa:[0.3,0.5,2,1.8,1.4,1,0.8,0.8,0.8,0.8,0.5,0.3], ule:[0,0,1,1,1,1,1,1,1,0.5,0.5,0], uboj:[0,0,0.6,0.6,0.2,0.2,0.4,0.8,1,1,0.8,1],
      dzierzawa:[0,0,0,0,0,0,0,0,0,0,1,0], stale:[0,0,1,0,0,1,0,0,1,0,0,1], energia:[1.3,1.2,1.1,1,0.9,0.8,0.8,0.8,0.9,1,1.1,1.3],
      dokup:[0,0,0,0,0,1,2,2,1,0,0,0], miedzyplony:[0,0,0,0,0,0,0,1,1,0,0,0], bydlo:[1,1,1,1,1,1,1,1,1,1.6,1.2,1]},
  dop: [0.08,0.08,0.06,0,0,0,0,0,0,0.5,0.18,0.1],
  dobrostan: [0,0,0.3,0.3,0.2,0.2,0,0,0,0,0,0],
};
const FLAT = [1,1,1,1,1,1,1,1,1,1,1,1];
function spread(total, prof){ const pr = prof || FLAT; const sm = pr.reduce((a,b)=>a+b,0) || 1; return pr.map(w => total*w/sm); }
function cashflow(r, p){
  const M = Array.from({length:12}, () => ({wplywy:0, dop:0, wydatki:0, dom:0, netto:0, saldo:0}));
  for (const k in r.R) spread(r.R[k], CF.R[k]).forEach((v,i) => { M[i].wplywy += v; });
  for (const k in r.C) spread(r.C[k], CF.C[k]).forEach((v,i) => { M[i].wydatki += v; });
  for (const k in r.Dp) spread(r.Dp[k], k==='dobrostan' ? CF.dobrostan : CF.dop).forEach((v,i) => { M[i].dop += v; });
  const naDom = Math.max(0, p.wydDom - p.dzieci800*800);
  let saldo = p.gotowkaStart, min = Infinity, minM = 0;
  M.forEach((m,i) => { m.dom = naDom; m.netto = m.wplywy + m.dop - m.wydatki; saldo += m.netto - m.dom; m.saldo = saldo; if (saldo < min){ min = saldo; minM = i; } });
  return {M, min, minM, naDom, koniec:saldo};
}

// Klasy gleby: mnożniki plonów względem klasy IV
function gleba(p){
  const u3 = p.udzialIII/100, u5 = p.udzialV/100, u6 = p.udzialVI/100, u4 = Math.max(0, 1 - u3 - u5 - u6);
  const sum = u3 + u4 + u5 + u6 || 1;
  return {orne:(u3*1.2 + u4 + u5*0.75 + u6*0.55)/sum, tuz:(u3*1.1 + u4 + u5*0.85 + u6*0.7)/sum};
}

// Płodozmian w modelu (ten sam układ co w sekcji „Płodozmian”)
function rotacja(p){
  const L = p.plodLat, share = p.zbozaUdzial/100;
  const k = Math.min(L-1, Math.max(1, Math.round((1-share)*L))), c = L - k;
  const cer = {1:['owies'], 2:['pszen','owies'], 3:['pszen','zyto','owies'], 4:['pszen','miesz','zyto','owies'], 5:['pszen','miesz','zyto','pszen','owies']}[c];
  const seq = []; for (let i = 0; i < k; i++) seq.push('konicz'); cer.forEach(x => seq.push(x));
  let mp = 0, ws = 0, obor = 0, sc = 0;
  seq.forEach((id, i) => {
    const nx = seq[(i+1) % L];
    if (id !== 'konicz' && id !== 'owies' && (nx === 'owies' || nx === 'miesz')) mp++;
    if (id === 'owies') ws++;
    if (id !== 'konicz' && id !== 'owies' && (nx === 'pszen' || nx === 'zyto')) sc++;
    if (nx === 'pszen' || nx === 'owies') obor++;
  });
  const uniq = new Set(seq).size, maxShare = Math.max(...[...new Set(seq)].map(x => seq.filter(y => y===x).length))/L;
  const strukturaOk = uniq >= 3 && c/L <= 0.65 && k/L >= 0.2 && maxShare <= 0.65;
  return {L, k, c, seq, mp, ws, obor, sc, uniq, strukturaOk, cerShare:c/L};
}

function compute(p0){
  const gf = gleba(p0);
  const p = Object.assign({}, p0, {plonZboz:p0.plonZboz*gf.orne, plonSlomy:p0.plonSlomy*gf.orne, plonKoniczyny:p0.plonKoniczyny*gf.orne, plonPast:p0.plonPast*gf.tuz, plonLaki:p0.plonLaki*gf.tuz});
  const r = {};
  // --- Ziemia ---
  const orne = p.areaTotal + p.dzierzawa - p.obejscie - p.pastwisko - p.laka - p.warzywaSprz;
  const orneEff = Math.max(0, orne);
  const zbozeHa = orneEff * p.zbozaUdzial/100;
  const koniczynaHa = orneEff - zbozeHa;
  const sad = Math.min(p.sad, p.obejscie);
  const UR = p.pastwisko + p.laka + orneEff + sad + p.warzywaSprz;
  Object.assign(r, {orne, orneEff, zbozeHa, koniczynaHa, UR, sad});

  // --- Stado bydła ---
  const jalowki = p.krowy>0 ? 2*p.krowy/p.laktacje : 0; // jałówki remontowe na stanie
  const byk = p.byk && p.krowy>0 ? 1 : 0;
  const kozleta = p.kozy*1.5, kozlSprz = kozleta*p.kozySprz/100;
  const mamki = p.mamki, cielB = mamki*0.9, remontB = mamki*0.15;
  const odsadkiN = Math.max(0, cielB - remontB)*p.sprzOdsadki/100;
  const opasyN = Math.max(0, cielB - remontB) - odsadkiN;
  const jalB = remontB*2;
  r.jalowki = jalowki;
  const zimaF = (365 - p.dniWypasu)/165; // skala słomy względem 165 dni zimy

  // --- Pasza objętościowa (t s.m./rok) ---
  const lambsPerEwe = p.odchowJag*p.wykoty;
  const F = {krowy:p.krowy*5.5, jalowki:jalowki*3.3, byk:byk*5.0, owce:p.owce*(0.55 + 0.15*lambsPerEwe), kozy:p.kozy*0.6, kroliki:p.kroliki*0.3, gesi:p.gesi*0.05, konie:p.konie*3.2, bydlo:mamki*4.8 + opasyN*3.5 + jalB*2.5, kaczki:p.kaczki*0.01, indyki:p.indyki*0.04, perliczki:p.perliczki*0.005};
  const forageNeed = sum(F);
  const grazeNeed = forageNeed*p.dniWypasu/365;
  const winterNeed = forageNeed - grazeNeed;
  const bydloSzt = p.krowy + jalowki + byk;
  const mixF = (p.owce>0 && bydloSzt>0) ? Math.min(1, p.owce/(1.5*bydloSzt)) : 0;
  const pastProd = p.pastwisko*p.plonPast*(1 + p.wspolWypas/100*mixF);
  r.mixBonus = p.pastwisko*p.plonPast*p.wspolWypas/100*mixF;
  const lakaHay = p.laka*p.plonLaki*0.75;
  const lakaGraze = p.laka*p.plonLaki*0.25;
  const koniczynaHay = koniczynaHa*p.plonKoniczyny;
  const rot = rotacja(p), fieldHa = orneEff/rot.L;
  const mpHa = p.miedzyplony ? rot.mp*fieldHa : 0, wsHa = p.miedzyplony ? rot.ws*fieldHa : 0;
  const scHa = p.poplonScier ? rot.sc*fieldHa : 0;
  const mpPasza = mpHa*p.paszaMiedzyplon + scHa*p.paszaPoplon;
  const grazeSupply = pastProd + lakaGraze + mpPasza;
  const grazeSurplus = grazeSupply - grazeNeed;
  const hayFromPast = Math.max(0, grazeSurplus)*0.7;
  const haySupply = lakaHay + koniczynaHay + hayFromPast;
  const grazeDef = Math.max(0, -grazeSurplus);
  const hayNeed = winterNeed + grazeDef;
  const hayBal = haySupply - hayNeed;
  Object.assign(r, {F, forageNeed, grazeNeed, winterNeed, grazeSupply, grazeSurplus, hayFromPast, haySupply, hayNeed, hayBal, lakaHay, koniczynaHay});

  // --- Mleko i ser ---
  const mlekoTotal = p.krowy*p.mleko;
  const mlekoUzyt = mlekoTotal*p.mlekoUzyt/100;
  const mlekoSer = p.krowy>0 ? mlekoUzyt*p.ser/100 : 0;
  const mlekoSwieze = mlekoUzyt - mlekoSer;
  const serKg = mlekoSer/100*p.wydSera;
  const serSprz = serKg*0.9;
  const serwatkaL = mlekoSer*0.85;
  Object.assign(r, {mlekoTotal, mlekoUzyt, mlekoSer, mlekoSwieze, serKg, serSprz, serwatkaL});

  // --- Wymiana stada kur, własny wylęg ---
  const kuryWymiana = p.kury/p.wymianaKur;
  const koguty = p.wylegWlasny ? kuryWymiana*0.9 : 0;
  const piskleta = p.wylegWlasny ? kuryWymiana*2 : 0;
  // --- Ziarno (t/rok) ---
  const G = {
    kury: p.kury*p.paszaKura/1e6*365*(1-p.oszczPast/100)*0.9,
    wyleg: p.wylegWlasny ? (kuryWymiana*p.paszaKurka + koguty*p.paszaKogut)/1000 : 0,
    brojlery: p.brojlery*p.paszaBrojler/1000*0.9,
    gesi: p.gesi*0.012,
    kaczki: p.kaczki*p.paszaKaczka/1000*0.9,
    indyki: p.indyki*p.paszaIndyk/1000*0.85,
    perliczki: p.perliczki*p.paszaPerliczka/1000*0.85,
    krowy: p.krowy*p.owiesKrowa/1000,
    swinie: (p.swinie + p.swinieSprz)*0.35,
    kroliki: p.kroliki*(p.odchowKrol*3+40)/1000,
    owce: p.owce*0.01*p.wykoty,
    konie: p.konie*0.2,
  };
  const serwatkaSM = serwatkaL*0.06/1000; // t s.m. serwatki
  const swinieBez = G.swinie;
  G.swinie = Math.max(swinieBez*0.7, swinieBez - serwatkaSM);
  r.serwatkaZast = swinieBez - G.swinie;
  const grainNeed = sum(G);
  const grainSupply = zbozeHa*p.plonZboz;
  const grainBal = grainSupply - grainNeed;
  Object.assign(r, {G, grainNeed, grainSupply, grainBal});

  // --- Słoma (t/rok) ---
  const S = {krowy:p.krowy*1.2*zimaF, jalowki:jalowki*0.6*zimaF, byk:byk*0.8*zimaF, owce:p.owce*0.12*zimaF*(0.7+0.3*p.wykoty), kozy:p.kozy*0.1*zimaF, konie:p.konie*1.2*zimaF, bydlo:(mamki*1.0 + opasyN*0.8 + jalB*0.6)*zimaF,
    kury:p.tunelZima ? 0 : p.kury*0.006, brojlery:p.brojlery*0.002, gesi:p.gesi*0.01, kaczki:p.kaczki*0.005, indyki:p.indyki*0.015, perliczki:p.perliczki*0.002, swinie:(p.swinie + p.swinieSprz)*0.6, kroliki:p.kroliki*0.05};
  const strawNeed = sum(S);
  const strawSupply = zbozeHa*p.plonSlomy;
  const strawBalRaw = strawSupply - strawNeed;
  const trocinyT = (p.trociny && strawBalRaw < 0) ? -strawBalRaw*p.trocinyNaSlome : 0;
  const strawBal = p.trociny ? Math.max(0, strawBalRaw) : strawBalRaw;
  Object.assign(r, {S, strawNeed, strawSupply, strawBal, strawBalRaw, trocinyT});

  // --- DJP (przeliczniki orientacyjne) ---
  const D = {krowy:p.krowy, jalowki:jalowki*0.6, byk, owce:p.owce*0.1, kozy:p.kozy*0.1, konie:p.konie*0.8, bydlo:mamki + opasyN*0.9 + jalB*0.6, kury:p.kury*0.014,
    brojlery:p.brojlery/4*0.007, gesi:p.gesi*0.02*0.5, kaczki:p.kaczki/2*0.004, indyki:p.indyki*0.6*0.03, perliczki:p.perliczki*0.5*0.004, swinie:(p.swinie + p.swinieSprz)*0.3*0.6, kroliki:p.kroliki*0.02};
  const djp = sum(D);
  const djpHa = UR>0 ? djp/UR : 0;
  const tuz = p.pastwisko + p.laka;
  const djpTUZ = tuz>0 ? (D.krowy+D.jalowki+D.byk+D.owce+D.kozy+D.konie+D.bydlo)/tuz : 0;
  Object.assign(r, {D, djp, djpHa, djpTUZ});

  // --- Przychody ---
  const cieleta = p.krowy*0.95;
  const remontKrow = p.krowy/p.laktacje;
  const cieletaSprz = Math.max(0, cieleta - remontKrow);
  const jaja = p.kury*p.niesnosc;
  const jajaSprz = jaja*p.jajaSprz/100;
  const jagnieta = p.owce*lambsPerEwe;
  const owceRemont = p.owce*p.remontOwiec/100;
  const jagSprz = Math.max(0, jagnieta - owceRemont);
  const jagMiesoN = jagSprz*p.jagMieso/100;
  const jagZyweN = jagSprz - jagMiesoN;
  const tuszaKg = p.wagaJag*p.wydRzeznaJag/100;
  const miesoKg = jagMiesoN*tuszaKg;
  const partieUboj = jagMiesoN>0 ? Math.ceil(jagMiesoN/p.jagNaKurs - 1e-9) : 0;
  const kmRzeznia = partieUboj*2*2*p.odlRzeznia;
  // Przetwórstwo
  const gesiSzt = p.gesi*0.9, gesiP = gesiSzt*p.przetwGesi/100;
  const kaczkiSzt = p.kaczki*0.93, kaczkiP = kaczkiSzt*p.przetwKaczki/100;
  const miesoP = miesoKg*p.przetwJag/100;
  const PV = {gesi: gesiP*p.wartPrzetGes, kaczki: kaczkiP*p.wartPrzetKaczka, owce: miesoP*p.wartPrzetJag};
  const przetwVal = sum(PV);
  const przetwKg = gesiP*2.5 + kaczkiP*1.2 + miesoP*0.6;
  const paczki = przetwKg*p.wysylka/100/p.paczkaKg;
  const owoceT = sad*p.plonSad;
  const owoceSprzT = owoceT*p.owoceSprz/100;
  const grzybyKg = p.klody*p.plonKloda;
  const R = {
    mleko: mlekoSwieze*p.cenaMleka,
    ser: serSprz*p.cenaSera,
    cieleta: cieletaSprz*p.cenaCielaka + remontKrow*p.cenaKrowyBrak,
    jaja: jajaSprz*p.cenaJaja + kuryWymiana*10,
    koguty: koguty*p.cenaKoguta,
    kozy: kozlSprz*p.wagaKozla*p.cenaKoziny,
    swinie: p.swinieSprz*p.wagaTuszySw*p.cenaWieprzowiny,
    bydlo: odsadkiN*p.wagaOdsadka*p.cenaOdsadka + opasyN*(p.opasyMieso/100*p.wagaOpas*p.wydRzOpas/100*p.cenaWolowiny + (1-p.opasyMieso/100)*p.wagaOpas*p.cenaZywcaOpas) + remontB*p.cenaKrowyBrak*1.3,
    brojlery: p.brojlery*0.95*p.wagaTuszki*p.cenaTuszki,
    gesi: (gesiSzt - gesiP)*p.cenaGesi,
    kaczki: (kaczkiSzt - kaczkiP)*p.wagaKaczki*p.cenaKaczki,
    indyki: p.indyki*0.9*p.wagaIndyka*p.cenaIndyka,
    perliczki: p.perliczki*0.9*p.wagaPerliczki*p.cenaPerliczki,
    kroliki: p.kroliki*p.odchowKrol*0.9*p.cenaKrol,
    owce: jagZyweN*p.cenaJag + owceRemont*250,
    jagniecina: (miesoKg - miesoP)*p.cenaMiesaJag,
    przetwory: przetwVal,
    owoce: owoceSprzT*1000*p.cenaOwocow,
    grzyby: grzybyKg*0.9*p.cenaGrzybow,
    warzywa: p.warzywaSprz*p.cenaWarzywHa,
    miod: p.ule*p.miodUl*p.cenaMiodu*0.95,
  };
  const przychod = sum(R);
  // Wartość dla domu (nie gotówka)
  const barfKg = (kozleta - kozlSprz)*10;
  const home = {
    swinie: p.swinie*85*25,
    barf: barfKg*15,
    jaja: (jaja - jajaSprz)*p.cenaJaja,
    mleko: (mlekoTotal - mlekoUzyt)*0.4*p.cenaMleka,
    ser: (serKg - serSprz)*p.cenaSera,
    owoce: Math.min(owoceT - owoceSprzT, 1.5)*1000*1.5,
    grzyby: grzybyKg*0.1*p.cenaGrzybow,
  };
  Object.assign(r, {cieleta, cieletaSprz, remontKrow, jaja, jajaSprz, kuryWymiana, koguty, piskleta, kozlSprz, mamki, odsadkiN, opasyN, jagnieta, jagSprz, jagMiesoN, jagZyweN, tuszaKg, miesoKg, partieUboj, kmRzeznia, gesiP, kaczkiP, miesoP, PV, przetwVal, przetwKg, paczki, owoceT, owoceSprzT, grzybyKg, R, przychod, home, homeTotal:sum(home), barfKg});

  // --- Koszty bieżące ---
  const C = {
    orne: orneEff*p.kOrne,
    laka: p.laka*p.kLaka,
    past: p.pastwisko*p.kPast,
    krowy: p.krowy>0 ? p.krowy*p.kKrowa + jalowki*p.kKrowa*0.3 + (byk ? p.kByk : p.krowy*p.kInsem) : 0,
    mlekoOpak: mlekoSwieze*p.kMlekoOpak,
    ser: serKg*p.kSer,
    kury: (p.wylegWlasny ? piskleta*p.kWylegSzt : kuryWymiana*p.cenaKurki) + p.kury*p.kKuraDod + jajaSprz*p.kOpakJaj + (p.tunelZima ? p.kury*p.kSciolkaTunel : 0),
    brojlery: p.brojlery*p.kBrojler,
    gesi: p.gesi*p.kGes,
    kaczki: p.kaczki*p.kKaczka,
    miedzyplony: mpHa*p.kMiedzyplon + scHa*p.kPoplon,
    bydlo: (mamki + opasyN + jalB)*p.kBydloMies + opasyN*p.opasyMieso/100*p.kUbojOpas,
    indyki: p.indyki*p.kIndyk,
    perliczki: p.perliczki*p.kPerliczka,
    przetwory: przetwVal*p.kPrzetwProc/100 + paczki*Math.max(0, p.kPaczki - p.oplataKlienta),
    owoce: owoceSprzT*1000*p.cenaOwocow*p.kOwocProc/100,
    grzyby: p.klody*p.kKloda,
    kroliki: p.kroliki*p.kKrolik,
    warzywa: p.warzywaSprz*p.cenaWarzywHa*p.kWarzywaProc/100,
    ule: p.ule*p.kUl,
    owce: p.owce*p.kOwca,
    uboj: jagMiesoN*p.kUbojJag + miesoKg*p.kRozbior + kmRzeznia*p.kKm,
    kozy: p.kozy*p.kKoza + kozlSprz*p.kUbojKoz,
    konie: p.konie*p.kKon,
    dzierzawa: p.dzierzawa*p.czynsz,
    swinie: (p.swinie + p.swinieSprz)*p.kSwinia + p.swinieSprz*p.kUbojSw,
    stale: p.kStale,
    sprzedaz: (mlekoSwieze>0 || jajaSprz>0 || p.brojlery>0 || p.kaczki>0 || p.perliczki>0 || p.indyki>0) ? p.kSprzedaz : 0,
    energia: p.kEnergia,
  };
  const fC = p._fC || 1;
  for (const k in C) if (k !== 'dzierzawa') C[k] *= fC;
  const dokup = {
    ziarno: Math.max(0,-grainBal)*p.cenaZiarnaKup,
    siano: Math.max(0,-hayBal)*p.cenaSianaKup,
    sloma: Math.max(0,-strawBal)*p.cenaSlomyKup,
    trociny: trocinyT*p.cenaTrocin,
  };
  C.dokup = sum(dokup);
  const koszty = sum(C);
  Object.assign(r, {C, dokup, koszty});

  // --- Inwestycje ---
  const pasy = (p.owce + p.kozy) > 0 ? 1.3 : 1;
  const grazers = p.krowy + p.owce + p.kozy + p.mamki > 0;
  const qOn = b => b ? 1 : 0;
  const I = [
    {k:'wiata', l:'Wiata dla bydła', pid:'iWiata', q:p.krowy+jalowki+byk + mamki + opasyN*0.7 + jalB*0.6, life:20},
    {k:'owczarnia', l:'Wiata dla owiec i kóz', pid:'iOwczarnia', q:p.owce+p.kozy, life:20},
    {k:'konie', l:'Wiata lub boksy dla koni', pid:'iKon', q:p.konie, life:20},
    {k:'kurnik', l:'Kurniki mobilne', pid:'iKurnik', q:p.kury, life:12},
    {k:'wyleg', l:'Inkubator i odchowalnia', pid:'iWyleg', q:qOn(p.wylegWlasny && p.kury>0), life:8},
    {k:'tunel', l:'Tunel zimowy dla drobiu (wyposażenie)', pid:'iTunelDrob', q:qOn(p.tunelZima && p.kury>0), life:10},
    {k:'brojl', l:'Zagrody dla kurczaków', pid:'iBrojl', q:p.brojlery/4, life:8},
    {k:'drobInny', l:'Wiaty: kaczki, indyki, perliczki', pid:'iDrobInny', q:p.kaczki/2 + p.indyki*3 + p.perliczki, life:8},
    {k:'przetw', l:'Wędzarnia, chłodnia, pakowarka', pid:'iPrzetw', q:qOn(przetwVal>0), life:12},
    {k:'krolik', l:'Klatki dla królików', pid:'iKrolik', q:p.kroliki, life:10},
    {k:'ogrodz', l:'Ogrodzenie elektryczne', pid:'iOgrodz', q:grazers ? tuz*pasy : 0, life:15},
    {k:'woda', l:'Woda na pastwiska', pid:'iWoda', q:qOn(grazers), life:15},
    {k:'mleczarnia', l:'Dojarka, schładzalnik, mleczarnia', pid:'iMleczarnia', q:qOn(p.krowy>0), life:12},
    {k:'serownia', l:'Serownia i dojrzewalnia', pid:'iSerownia', q:qOn(p.krowy>0 && p.ser>0), life:12},
    {k:'maszyny', l:'Używane maszyny', pid:'iMaszyny', q:1, life:15},
    {k:'warzywa', l:'Warzywa: tunel, nawadnianie, chłodnia', pid:'iWarzywa', q:p.warzywaSprz, life:10},
    {k:'ule', l:'Ule z wyposażeniem', pid:'iUl', q:p.ule, life:15},
  ];
  I.forEach(i=>{ i.c = i.q*p[i.pid]; i.a = i.c/i.life; });
  const capex = I.reduce((a,i)=>a+i.c,0);
  const amort = I.reduce((a,i)=>a+i.a,0);
  Object.assign(r, {I, capex, amort});

  // --- Dopłaty ---
  const Dp = {
    pwd: RATES.pwd*UR,
    redys: RATES.redys*Math.min(UR,30),
    krowy: RATES.krowy*(p.krowy + mamki),
    bydlo: RATES.bydlo*Math.floor(jalowki + opasyN + jalB),
    owce: p.owce>=10 ? RATES.owce*p.owce : 0,
    kozy: p.kozy>=5 ? RATES.kozy*p.kozy : 0,
    eko: p.eko ? RATES.ekoTUZ*tuz + RATES.ekoOrne*orneEff + RATES.ekoSad*sad + RATES.ekoWarz*p.warzywaSprz : 0,
    premia: (p.eko && p.premiaObsada && djpHa>=0.5 && djpHa<=1.5) ? RATES.premia*UR : 0,
    ekst: p.ekstTUZ ? RATES.ekstTUZ*tuz : 0,
    wegiel: 0,
    mlody: p.mlodyRolnik ? RATES.mlody*UR : 0,
    onw: p.onw*UR,
    dobrostan: p.dobrostan
      + (p.dbKrowy ? p.krowy*(RATES.dbKrowaWypas + RATES.dbKrowaSciolka) : 0)
      + (p.dbKrowyPow ? p.krowy*RATES.dbKrowaPow : 0)
      + (p.dbOwceKozy ? p.owce*RATES.dbOwca + p.kozy*RATES.dbKoza : 0)
      + (p.dbKury ? p.kury*RATES.dbKura : 0),
  };
  const pktMp = (mpHa + wsHa)*5, pktOb = p.wegObornik ? rot.obor*fieldHa*2 : 0, pktSt = (p.wegStruktura && rot.strukturaOk) ? orneEff*3 : 0;
  const pktEkst = p.ekstTUZ ? tuz*5 : 0, pktMin = 0.25*UR*5, pktSum = pktMp + pktOb + pktSt + pktEkst;
  const wegielOk = pktSum >= pktMin;
  Dp.wegiel = wegielOk ? (pktMp + pktOb + pktSt)*p.wartPkt : 0;
  if (!wegielOk && p.ekstTUZ) Dp.ekst = 0;
  r.wegiel = {mpHa, wsHa, scHa, fieldHa, mpPasza, pktMp, pktOb, pktSt, pktEkst, pktMin, pktSum, ok:wegielOk, rot};
  const doplaty = sum(Dp);
  Object.assign(r, {Dp, doplaty});

  // --- Wynik ---
  r.netto = przychod + doplaty - koszty - amort;

  // --- Praca (h/rok) ---
  const H = {
    krowy: p.krowy>0 ? p.hKrowyStale + p.krowy*p.hKrowa + jalowki*15 + byk*20 : 0,
    ser: mlekoSer/100*p.hSer,
    kury: p.kury>0 ? p.hKuryStale + p.kury*p.hKura : 0,
    wyleg: piskleta*p.hWylegSzt,
    brojlery: p.brojlery>0 ? 30 + p.brojlery*p.hBrojler : 0,
    gesi: p.gesi*p.hGes,
    kaczki: p.kaczki>0 ? 15 + p.kaczki*p.hKaczka : 0,
    miedzyplony: (mpHa + scHa)*p.hMiedzyplon,
    bydlo: mamki>0 ? 20 + mamki*p.hMamka + opasyN*p.hOpas + opasyN*p.opasyMieso/100*6 : 0,
    indyki: p.indyki>0 ? 15 + p.indyki*p.hIndyk : 0,
    perliczki: p.perliczki>0 ? 15 + p.perliczki*p.hPerliczka : 0,
    przetwory: przetwVal>0 ? p.hPrzetwStale + gesiP*p.hPrzetwGes + kaczkiP*p.hPrzetwKaczka + miesoP*p.hPrzetwJagKg + paczki*p.hPaczka : 0,
    owoce: owoceSprzT*p.hOwocT,
    grzyby: p.klody*p.hKloda,
    kroliki: p.kroliki*p.hKrolik,
    owce: p.owce>0 ? 30 + p.owce*p.hOwca*(0.6 + 0.4*p.wykoty) + partieUboj*2*p.hKursRzeznia + jagMiesoN*p.hSprzMieso : 0,
    konie: p.konie*p.hKon,
    kozy: p.kozy*p.hKoza + kozlSprz*1,
    swinie: (p.swinie + p.swinieSprz)*p.hSwinia + p.swinieSprz*3,
    siano: (p.laka + koniczynaHa + hayFromPast/Math.max(1,p.plonLaki))*p.hSiano,
    zboza: zbozeHa*p.hZboza,
    sprzedaz: mlekoSwieze/100*p.hSprzMleko + jajaSprz/100*p.hSprzJaja + p.hSprzStale,
    ogolne: p.hOgolne,
    ogrod: (sad + p.warzywnik)*p.hOgrod,
    warzywa: p.warzywaSprz*p.hWarzywaHa,
    ule: p.ule*p.hUl,
  };
  const fH = p._fH || 1;
  for (const k in H) H[k] *= fH;
  const godziny = sum(H);
  const mies = Array.from({length:12}, (_,m)=>{
    const o = {};
    LAB_GROUPS.forEach(gr=>{ o[gr.id] = gr.keys.reduce((a,k)=>a + H[k]/12*PROF[k][m], 0); });
    o.total = sum(o);
    return o;
  });
  const szczyt = Math.max(...mies.map(x=>x.total));
  const dostepne = (p.etaty + 0.5*p.polEtaty + 0.25*p.cwiercEtaty)*p.hEtat;
  r.dostepne = dostepne; r.util = dostepne>0 ? godziny/dostepne : 9;
  Object.assign(r, {H, godziny, mies, szczyt, tydzSr: godziny/52, tydzSzczyt: szczyt/4.33, zlH: godziny>0 ? r.netto/godziny : 0});

  // --- Kierunki: rachunek na kierunek ---
  const grainCostT = grainSupply>0 ? zbozeHa*p.kOrne/grainSupply : p.cenaZiarnaKup;
  const forageTot = haySupply + grazeSupply;
  const forageCostT = forageTot>0 ? (p.laka*p.kLaka + koniczynaHa*p.kOrne + p.pastwisko*p.kPast)/forageTot : p.cenaSianaKup;
  r.grainCostT = grainCostT; r.forageCostT = forageCostT;
  const feed = (g,f) => g*grainCostT + f*forageCostT;
  const am = k => (I.find(i=>i.k===k)||{a:0}).a;
  const sprzM = mlekoSwieze/100*p.hSprzMleko, sprzJ = jajaSprz/100*p.hSprzJaja;
  const sh = k => przetwVal>0 ? PV[k]/przetwVal : 0;
  const pr = k => ({rev:PV[k]||0, cost:C.przetwory*sh(k), amort:am('przetw')*sh(k), h:H.przetwory*sh(k)});
  const PG = pr('gesi'), PK = pr('kaczki'), PO = pr('owce');
  const K = [
    {id:'mleko', l:'Mleko i sery', on:p.krowy>0,
      rev:R.mleko+R.ser+R.cieleta, cost:C.krowy+C.mlekoOpak+C.ser+p.kEnergia*0.6+feed(G.krowy,F.krowy+F.jalowki+F.byk),
      amort:am('wiata')+am('mleczarnia')+am('serownia'), dop:Dp.krowy+Dp.bydlo, h:H.krowy+H.ser+sprzM},
    {id:'jaja', l:'Jaja', on:p.kury>0,
      rev:R.jaja+R.koguty, cost:C.kury+p.kEnergia*0.1+feed(G.kury+G.wyleg,0), amort:am('kurnik')+am('wyleg')+am('tunel'), dop:0, h:H.kury+H.wyleg+sprzJ},
    {id:'brojlery', l:'Kurczaki pastwiskowe', on:p.brojlery>0,
      rev:R.brojlery, cost:C.brojlery+feed(G.brojlery,0), amort:am('brojl'), dop:0, h:H.brojlery},
    {id:'gesi', l:p.przetwGesi>0?'Gęsi (z przetworami)':'Gęsi', on:p.gesi>0, rev:R.gesi+PG.rev, cost:C.gesi+PG.cost+feed(G.gesi,F.gesi), amort:PG.amort, dop:0, h:H.gesi+PG.h},
    {id:'kaczki', l:p.przetwKaczki>0?'Kaczki (z przetworami)':'Kaczki', on:p.kaczki>0, rev:R.kaczki+PK.rev, cost:C.kaczki+PK.cost+feed(G.kaczki,F.kaczki), amort:am('drobInny')*(p.kaczki/2)/Math.max(1,p.kaczki/2+p.indyki*3+p.perliczki)+PK.amort, dop:0, h:H.kaczki+PK.h},
    {id:'bydlo', l:'Bydło mięsne', on:mamki>0, rev:R.bydlo, cost:C.bydlo+feed(0,F.bydlo), amort:am('wiata')*(mamki+opasyN*0.7+jalB*0.6)/Math.max(1,p.krowy+jalowki+byk+mamki+opasyN*0.7+jalB*0.6), dop:RATES.krowy*mamki+RATES.bydlo*Math.floor(opasyN+jalB), h:H.bydlo},
    {id:'indyki', l:'Indyki', on:p.indyki>0, rev:R.indyki, cost:C.indyki+feed(G.indyki,F.indyki), amort:am('drobInny')*(p.indyki*3)/Math.max(1,p.kaczki/2+p.indyki*3+p.perliczki), dop:0, h:H.indyki},
    {id:'perliczki', l:'Perliczki', on:p.perliczki>0, rev:R.perliczki, cost:C.perliczki+feed(G.perliczki,F.perliczki), amort:am('drobInny')*p.perliczki/Math.max(1,p.kaczki/2+p.indyki*3+p.perliczki), dop:0, h:H.perliczki},
    {id:'kroliki', l:'Króliki', on:p.kroliki>0, rev:R.kroliki, cost:C.kroliki+feed(G.kroliki,F.kroliki), amort:am('krolik'), dop:0, h:H.kroliki},
    {id:'owce', l:p.przetwJag>0?'Owce (z wyrobami)':'Owce', on:p.owce>0, rev:R.owce+R.jagniecina+PO.rev, cost:C.owce+C.uboj+PO.cost+feed(G.owce,F.owce), amort:am('owczarnia')*(p.owce/Math.max(1,p.owce+p.kozy))+PO.amort, dop:Dp.owce, h:H.owce+PO.h},
    {id:'kozy', l:p.kozySprz>0?'Kozy (koźlęcina i dla psa)':'Kozy (dla psa i na krzaki)', on:p.kozy>0, rev:R.kozy, cost:C.kozy+feed(0,F.kozy), amort:am('owczarnia')*(p.kozy/Math.max(1,p.owce+p.kozy)), dop:Dp.kozy, h:H.kozy, homeV:home.barf},
    {id:'swinie', l:p.swinieSprz>0?'Świnie (dom i sprzedaż)':'Świnie (dla domu)', on:p.swinie + p.swinieSprz>0, rev:R.swinie, cost:C.swinie+feed(G.swinie,0), amort:0, dop:0, h:H.swinie, homeV:home.swinie},
    {id:'konie', l:'Konie (zapas, praca, dzieci)', on:p.konie>0, rev:0, cost:C.konie+feed(G.konie,F.konie), amort:am('konie'), dop:0, h:H.konie},
    {id:'warzywa', l:'Warzywa na sprzedaż', on:p.warzywaSprz>0, rev:R.warzywa, cost:C.warzywa, amort:am('warzywa'), dop:0, h:H.warzywa},
    {id:'owoce', l:'Owoce z sadu', on:R.owoce>0, rev:R.owoce, cost:C.owoce, amort:0, dop:0, h:H.owoce},
    {id:'grzyby', l:'Boczniaki na kłodach', on:p.klody>0, rev:R.grzyby, cost:C.grzyby, amort:0, dop:0, h:H.grzyby},
    {id:'ule', l:'Pszczoły', on:p.ule>0, rev:R.miod, cost:C.ule, amort:am('ule'), dop:0, h:H.ule},
  ];
  const forLand = p.pastwisko + p.laka + koniczynaHa;
  const yF = forLand>0 ? (grazeSupply + haySupply)/forLand : p.plonPast;
  const land = {mleko:(F.krowy+F.jalowki+F.byk)/yF + G.krowy/p.plonZboz, jaja:(G.kury+G.wyleg)/p.plonZboz, brojlery:G.brojlery/p.plonZboz,
    gesi:F.gesi/yF + G.gesi/p.plonZboz, kroliki:F.kroliki/yF + G.kroliki/p.plonZboz, owce:F.owce/yF + G.owce/p.plonZboz,
    kozy:F.kozy/yF, swinie:G.swinie/p.plonZboz, konie:F.konie/yF + G.konie/p.plonZboz, warzywa:p.warzywaSprz, ule:0,
    bydlo:F.bydlo/yF, kaczki:F.kaczki/yF + G.kaczki/p.plonZboz, indyki:F.indyki/yF + G.indyki/p.plonZboz, perliczki:F.perliczki/yF + G.perliczki/p.plonZboz,
    owoce:sad*p.owoceSprz/100, grzyby:0};
  K.forEach(k=>{ k.net = k.rev + k.dop - k.cost - k.amort; k.zlH = k.h>0 ? k.net/k.h : 0; k.ha = land[k.id]; k.zlHa = k.ha>0.005 ? k.net/k.ha : null; });
  const kSum = K.reduce((a,k)=>a+k.net,0);
  const kH = K.reduce((a,k)=>a+k.h,0);
  r.K = K;
  r.wspolne = {net: r.netto - kSum, h: godziny - kH};

  // --- Rynek ---
  r.rynek = {
    mlekoDzien: mlekoSwieze/365,
    jajaTydz: jajaSprz/52,
    rwsUdzialy: R.warzywa/1600,
    miodKg: p.ule*p.miodUl*0.95,
    serTydz: serSprz/52,
    rhdPrzetwory: R.ser + R.jagniecina + R.przetwory + R.kozy + R.swinie + opasyN*p.opasyMieso/100*p.wagaOpas*p.wydRzOpas/100*p.cenaWolowiny,
  };

  // --- Ostrzeżenia ---
  const W = [];
  if (orne < -0.001) W.push({lvl:'bad', t:`Pastwisko, łąka, obejście i warzywa zajmują o ${fmt(-orne,1)} ha więcej, niż macie ziemi. Zmniejsz któryś z tych suwaków albo dodaj dzierżawę.`});
  if (p.sad + p.warzywnik > p.obejscie + 0.001) W.push({lvl:'bad', t:'Sad i warzywnik nie mieszczą się w obejściu. Zwiększ obejście.'});
  if (grainBal < -0.05) W.push({lvl:'bad', t:`Brakuje ok. ${fmt(-grainBal,1)} t ziarna. To ok. ${fmt(-grainBal/p.plonZboz,1)} ha zbóż więcej (ok. ${fmt(-grainBal/p.plonZboz/(p.zbozaUdzial/100),1)} ha gruntów ornych w płodozmianie) albo ok. ${fmt(-grainBal/ (p.paszaKura/1e6*365*0.9*(1-p.oszczPast/100)) ,0)} kur mniej.`});
  if (hayBal < -0.05) W.push({lvl:'bad', t:`Brakuje ok. ${fmt(-hayBal,1)} t s.m. siana na zimę. To ok. ${fmt(-hayBal/(p.plonLaki*0.75),1)} ha łąki więcej albo mniej zwierząt.`});
  if (strawBal < -0.05) W.push({lvl:'warn', t:`Brakuje ok. ${fmt(-strawBal,1)} t słomy na ściółkę. Pomoże więcej zbóż albo włącz trociny zamiast słomy (grupa „Koszty”).`});
  if (trocinyT > 0.05) W.push({lvl:'info', t:`Brakującą słomę zastępujesz trocinami: ok. ${fmt(trocinyT,1)} t (ok. ${fmt(trocinyT/0.22,0)} m³) za ok. ${fmt(trocinyT*p.cenaTrocin,0)} zł rocznie.`});
  if (grainBal > 2) W.push({lvl:'info', t:`Nadwyżka ziarna ok. ${fmt(grainBal,1)} t. Możesz dołożyć ok. ${fmt(grainBal/(p.paszaKura/1e6*365*0.9*(1-p.oszczPast/100)),0)} kur albo zamienić część zbóż na koniczynę.`});
  if (hayBal > 8) W.push({lvl:'info', t:`Dużo nadwyżki siana (ok. ${fmt(hayBal,1)} t s.m.). Jest miejsce na kolejne zwierzęta albo zapas na suszę.`});
  if (p.eko && p.premiaObsada && (djpHa<0.5 || djpHa>1.5)) W.push({lvl:'warn', t:`Obsada ${fmt(djpHa,2)} DJP/ha jest poza przedziałem 0,5–1,5, więc premia 573 zł/ha nie przysługuje.`});
  if (djpTUZ > 2) W.push({lvl:'warn', t:'Na użytkach zielonych jest ponad 2 DJP/ha. To już nie jest wypas ekstensywny.'});
  if (r.util > 1) W.push({lvl:'bad', t:`Potrzeba ${fmt(godziny,0)} h rocznie, a rodzina ma ok. ${fmt(dostepne,0)} h. Brakuje ok. ${fmt(godziny-dostepne,0)} h.`});
  else if (r.util > 0.85) W.push({lvl:'warn', t:`Praca zajmuje ${fmt(r.util*100,0)}% czasu rodziny. Mało zapasu na choroby i urlopy.`});
  else if (r.util < 0.5) W.push({lvl:'info', t:`Praca zajmuje tylko ok. ${fmt(r.util*100,0)}% czasu rodziny (${fmt(godziny,0)} z ${fmt(dostepne,0)} h). Ograniczeniem jest ziemia i rynek, nie ręce: wolny czas najlepiej włożyć w sery, warzywa i sprzedaż bezpośrednią.`});
  if (dostepne>0 && szczyt > dostepne/12*1.3) W.push({lvl:'warn', t:`W najcięższym miesiącu potrzeba ok. ${fmt(szczyt,0)} h, a miesięcznie rodzina ma ok. ${fmt(dostepne/12,0)} h.`});
  if (r.tydzSzczyt > p.limitTydz) W.push({lvl:'warn', t:`W najcięższym miesiącu wychodzi ok. ${fmt(r.tydzSzczyt,0)} h tygodniowo, powyżej Twojego limitu ${fmt(p.limitTydz,0)} h.`});
  if (r.rynek.jajaTydz > 500) W.push({lvl:'info', t:`Musisz sprzedawać ok. ${fmt(r.rynek.jajaTydz/10,0)} opakowań po 10 jaj tygodniowo. Najpierw znajdź stałych odbiorców.`});
  if (r.rynek.rhdPrzetwory > 100000) W.push({lvl:'info', t:'Przychód z RHD (sery, mięso czerwone w paczkach, wędliny) przekracza 100 tys. zł, więc nadwyżka podlega 2% ryczałtowi.'});
  if (p.indyki>0 && p.kury+p.brojlery>0) W.push({lvl:'warn', t:'Indyki i kury: trzymaj je osobno i najlepiej na innych kwaterach niż kury w ostatnich latach. Kury przenoszą histomonozę (czarną główkę), która u indyków zabija nawet całe stado.'});
  if (paczki > 0) W.push({lvl:'info', t:`Ok. ${fmt(paczki,0)} paczek z przetworami rocznie, głównie od października do grudnia. Wysyłkę chłodzoną sprawdź u kuriera przed sezonem.`});
  if (jagMiesoN>0) { const zMiesa = (tuszaKg*p.cenaMiesaJag - p.kUbojJag - tuszaKg*p.kRozbior - (kmRzeznia*p.kKm)/jagMiesoN); if (zMiesa < p.cenaJag) W.push({lvl:'info', t:`Jagnię sprzedane jako mięso daje ok. ${fmt(zMiesa,0)} zł po kosztach uboju i dowozu, mniej niż żywcem (${fmt(p.cenaJag,0)} zł). Przy tych cenach lepiej sprzedawać żywcem.`}); }
  if (p.owce>0 && p.owce<10) W.push({lvl:'info', t:'Płatność do owiec liczę od 10 sztuk.'});
  if (p.kozy>0 && p.kozy<5) W.push({lvl:'info', t:'Płatność do kóz liczę od 5 sztuk (przy mniejszej liczbie pomijam).'});
  if (p.wylegWlasny && koguty>0) W.push({lvl:'info', t:`Własny wylęg: ok. ${fmt(piskleta,0)} piskląt wiosną, ok. ${fmt(koguty,0)} kogutków rosołowych. Pamiętaj o szczepieniu przeciw chorobie Mareka.`});
  if ((p.miedzyplony || p.wegObornik || p.wegStruktura) && !wegielOk) W.push({lvl:'warn', t:`Ekoschemat „Rolnictwo węglowe”: ${fmt(pktSum,1)} pkt, a próg to ${fmt(pktMin,1)} pkt (25% UR × 5). Poniżej progu nie ma płatności. Dołóż praktyki, np. ekstensywne TUZ z obsadą.`});
  if (p.wegStruktura && !rot.strukturaOk) W.push({lvl:'info', t:`Zróżnicowana struktura upraw: Twój płodozmian ma ${Math.round(rot.cerShare*100)}% zbóż i ${rot.uniq} uprawy. Wymóg: zboża najwyżej 65%, min. 3 uprawy, koniczyna min. 20%. Zmień liczbę pól w „Płodozmianie”.`});
  if (p.swinieSprz>0) W.push({lvl:'info', t:'Tuczniki na sprzedaż: na Dolnym Śląsku występuje ASF. Przed zakupem prosiąt sprawdź u powiatowego lekarza weterynarii strefę i wymogi bioasekuracji dla chowu na wybiegu.'});
  if (mamki>0 && !p.byk) W.push({lvl:'info', t:'Mamki: potrzebny spokojny byk (np. angus) albo inseminacja. Włącz „Własny buhaj” w grupie krów, jeśli go trzymasz.'});
  if (p0.udzialIII + p0.udzialV + p0.udzialVI > 100) W.push({lvl:'warn', t:'Udziały klas gleby sumują się do ponad 100%. Popraw suwaki w grupie „Ziemia”.'});
  r.gleba = gf;
  r.dom = budzet(p); r.celEff = celEff(p);
  r.cf = cashflow(r, p);
  r.W = W;
  return r;
}

function fmt(x, d=0){
  if (!isFinite(x)) return '–';
  return x.toLocaleString('pl-PL', {minimumFractionDigits:d, maximumFractionDigits:d});
}

if (typeof module !== 'undefined') module.exports = {SEPS, rotacja, gleba, DEF, GROUPS, PRESETS, ASSUME, RATES, PROF, LAB_GROUPS, CF, compute, cashflow, gorzej, budzet, celEff, defaults, fmt};
