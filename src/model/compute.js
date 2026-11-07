// Główne obliczenie: z parametrów `p` liczy bilans pasz, przychody, koszty, inwestycje,
// dopłaty, godziny pracy, wynik na kierunek, rynek, ostrzeżenia i przepływy gotówki.
// Zwraca obiekt `r` używany przez wszystkie panele interfejsu.

function compute(p0) {
  const gf = gleba(p0);
  const p = Object.assign({}, p0, {
    plonZboz: p0.plonZboz * gf.orne,
    plonSlomy: p0.plonSlomy * gf.orne,
    plonKoniczyny: p0.plonKoniczyny * gf.orne,
    plonPast: p0.plonPast * gf.tuz,
    plonLaki: p0.plonLaki * gf.tuz,
  });
  const r = {};
  // --- Ziemia ---
  const orne = p.areaTotal + p.dzierzawa - p.obejscie - p.pastwisko - p.laka - p.warzywaSprz;
  const orneEff = Math.max(0, orne);
  const zbozeHa = (orneEff * p.zbozaUdzial) / 100;
  const koniczynaHa = orneEff - zbozeHa;
  const sad = Math.min(p.sad, p.obejscie);
  const UR = p.pastwisko + p.laka + orneEff + sad + p.warzywaSprz;
  Object.assign(r, { orne, orneEff, zbozeHa, koniczynaHa, UR, sad });

  // --- Stado bydła ---
  const jalowki = p.krowy > 0 ? (2 * p.krowy) / p.laktacje : 0; // jałówki remontowe na stanie
  const byk = p.byk && p.krowy > 0 ? 1 : 0;
  const kozleta = p.kozy * 1.5,
    kozlSprz = (kozleta * p.kozySprz) / 100;
  const mamki = p.mamki,
    cielB = mamki * 0.9,
    remontB = mamki * 0.15;
  const odsadkiN = (Math.max(0, cielB - remontB) * p.sprzOdsadki) / 100;
  const opasyN = Math.max(0, cielB - remontB) - odsadkiN;
  const jalB = remontB * 2;
  r.jalowki = jalowki;
  const zimaF = (365 - p.dniWypasu) / 165; // skala słomy względem 165 dni zimy

  // --- Pasza objętościowa (t s.m./rok) ---
  const lambsPerEwe = p.odchowJag * p.wykoty;
  const F = {
    krowy: p.krowy * 5.5,
    jalowki: jalowki * 3.3,
    byk: byk * 5.0,
    owce: p.owce * (0.55 + 0.15 * lambsPerEwe),
    kozy: p.kozy * 0.6,
    kroliki: p.kroliki * 0.3,
    gesi: p.gesi * 0.05,
    konie: p.konie * 3.2,
    bydlo: mamki * 4.8 + opasyN * 3.5 + jalB * 2.5,
    kaczki: p.kaczki * 0.01,
    indyki: p.indyki * 0.04,
    perliczki: p.perliczki * 0.005,
  };
  const forageNeed = sum(F);
  const grazeNeed = (forageNeed * p.dniWypasu) / 365;
  const winterNeed = forageNeed - grazeNeed;
  const bydloSzt = p.krowy + jalowki + byk;
  const mixF = p.owce > 0 && bydloSzt > 0 ? Math.min(1, p.owce / (1.5 * bydloSzt)) : 0;
  const pastProd = p.pastwisko * p.plonPast * (1 + (p.wspolWypas / 100) * mixF);
  r.mixBonus = ((p.pastwisko * p.plonPast * p.wspolWypas) / 100) * mixF;
  const lakaHay = p.laka * p.plonLaki * 0.75;
  const lakaGraze = p.laka * p.plonLaki * 0.25;
  const koniczynaHay = koniczynaHa * p.plonKoniczyny;
  const rot = rotacja(p),
    fieldHa = orneEff / rot.L;
  const mpHa = p.miedzyplony ? rot.mp * fieldHa : 0,
    wsHa = p.miedzyplony ? rot.ws * fieldHa : 0;
  const scHa = p.poplonScier ? rot.sc * fieldHa : 0;
  const mpPasza = mpHa * p.paszaMiedzyplon + scHa * p.paszaPoplon;
  const grazeSupply = pastProd + lakaGraze + mpPasza;
  const grazeSurplus = grazeSupply - grazeNeed;
  const hayFromPast = Math.max(0, grazeSurplus) * 0.7;
  const haySupply = lakaHay + koniczynaHay + hayFromPast;
  const grazeDef = Math.max(0, -grazeSurplus);
  const hayNeed = winterNeed + grazeDef;
  const hayBal = haySupply - hayNeed;
  Object.assign(r, {
    F,
    forageNeed,
    grazeNeed,
    winterNeed,
    grazeSupply,
    grazeSurplus,
    hayFromPast,
    haySupply,
    hayNeed,
    hayBal,
    lakaHay,
    koniczynaHay,
  });

  // --- Mleko i ser ---
  const mlekoTotal = p.krowy * p.mleko;
  const mlekoUzyt = (mlekoTotal * p.mlekoUzyt) / 100;
  const mlekoSer = p.krowy > 0 ? (mlekoUzyt * p.ser) / 100 : 0;
  const mlekoSwieze = mlekoUzyt - mlekoSer;
  const serKg = (mlekoSer / 100) * p.wydSera;
  const serSprz = serKg * 0.9;
  const serwatkaL = mlekoSer * 0.85;
  Object.assign(r, { mlekoTotal, mlekoUzyt, mlekoSer, mlekoSwieze, serKg, serSprz, serwatkaL });

  // --- Wymiana stada kur, własny wylęg ---
  const kuryWymiana = p.kury / p.wymianaKur;
  const koguty = p.wylegWlasny ? kuryWymiana * 0.9 : 0;
  const piskleta = p.wylegWlasny ? kuryWymiana * 2 : 0;
  // --- Ziarno (t/rok) ---
  const G = {
    kury: ((p.kury * p.paszaKura) / 1e6) * 365 * (1 - p.oszczPast / 100) * 0.9,
    wyleg: p.wylegWlasny ? (kuryWymiana * p.paszaKurka + koguty * p.paszaKogut) / 1000 : 0,
    brojlery: ((p.brojlery * p.paszaBrojler) / 1000) * 0.9,
    gesi: p.gesi * 0.012,
    kaczki: ((p.kaczki * p.paszaKaczka) / 1000) * 0.9,
    indyki: ((p.indyki * p.paszaIndyk) / 1000) * 0.85,
    perliczki: ((p.perliczki * p.paszaPerliczka) / 1000) * 0.85,
    krowy: (p.krowy * p.owiesKrowa) / 1000,
    swinie: (p.swinie + p.swinieSprz) * 0.35,
    kroliki: (p.kroliki * (p.odchowKrol * 3 + 40)) / 1000,
    owce: p.owce * 0.01 * p.wykoty,
    konie: p.konie * 0.2,
  };
  const serwatkaSM = (serwatkaL * 0.06) / 1000; // t s.m. serwatki
  const swinieBez = G.swinie;
  G.swinie = Math.max(swinieBez * 0.7, swinieBez - serwatkaSM);
  r.serwatkaZast = swinieBez - G.swinie;
  const grainNeed = sum(G);
  const grainSupply = zbozeHa * p.plonZboz;
  const grainBal = grainSupply - grainNeed;
  Object.assign(r, { G, grainNeed, grainSupply, grainBal });

  // --- Słoma (t/rok) ---
  const S = {
    krowy: p.krowy * 1.2 * zimaF,
    jalowki: jalowki * 0.6 * zimaF,
    byk: byk * 0.8 * zimaF,
    owce: p.owce * 0.12 * zimaF * (0.7 + 0.3 * p.wykoty),
    kozy: p.kozy * 0.1 * zimaF,
    konie: p.konie * 1.2 * zimaF,
    bydlo: (mamki * 1.0 + opasyN * 0.8 + jalB * 0.6) * zimaF,
    kury: p.tunelZima ? 0 : p.kury * 0.006,
    brojlery: p.brojlery * 0.002,
    gesi: p.gesi * 0.01,
    kaczki: p.kaczki * 0.005,
    indyki: p.indyki * 0.015,
    perliczki: p.perliczki * 0.002,
    swinie: (p.swinie + p.swinieSprz) * 0.6,
    kroliki: p.kroliki * 0.05,
  };
  const strawNeed = sum(S);
  const strawSupply = zbozeHa * p.plonSlomy;
  const strawBalRaw = strawSupply - strawNeed;
  const trocinyT = p.trociny && strawBalRaw < 0 ? -strawBalRaw * p.trocinyNaSlome : 0;
  const strawBal = p.trociny ? Math.max(0, strawBalRaw) : strawBalRaw;
  Object.assign(r, { S, strawNeed, strawSupply, strawBal, strawBalRaw, trocinyT });

  // --- DJP (przeliczniki orientacyjne) ---
  const D = {
    krowy: p.krowy,
    jalowki: jalowki * 0.6,
    byk,
    owce: p.owce * 0.1,
    kozy: p.kozy * 0.1,
    konie: p.konie * 0.8,
    bydlo: mamki + opasyN * 0.9 + jalB * 0.6,
    kury: p.kury * 0.014,
    brojlery: (p.brojlery / 4) * 0.007,
    gesi: p.gesi * 0.02 * 0.5,
    kaczki: (p.kaczki / 2) * 0.004,
    indyki: p.indyki * 0.6 * 0.03,
    perliczki: p.perliczki * 0.5 * 0.004,
    swinie: (p.swinie + p.swinieSprz) * 0.3 * 0.6,
    kroliki: p.kroliki * 0.02,
  };
  const djp = sum(D);
  const djpHa = UR > 0 ? djp / UR : 0;
  const tuz = p.pastwisko + p.laka;
  const djpTUZ = tuz > 0 ? (D.krowy + D.jalowki + D.byk + D.owce + D.kozy + D.konie + D.bydlo) / tuz : 0;
  Object.assign(r, { D, djp, djpHa, djpTUZ });

  // --- Przychody ---
  const cieleta = p.krowy * 0.95;
  const remontKrow = p.krowy / p.laktacje;
  const cieletaSprz = Math.max(0, cieleta - remontKrow);
  const jaja = p.kury * p.niesnosc;
  const jajaSprz = (jaja * p.jajaSprz) / 100;
  const jagnieta = p.owce * lambsPerEwe;
  const owceRemont = (p.owce * p.remontOwiec) / 100;
  const jagSprz = Math.max(0, jagnieta - owceRemont);
  const jagMiesoN = (jagSprz * p.jagMieso) / 100;
  const jagZyweN = jagSprz - jagMiesoN;
  const tuszaKg = (p.wagaJag * p.wydRzeznaJag) / 100;
  const miesoKg = jagMiesoN * tuszaKg;
  const partieUboj = jagMiesoN > 0 ? Math.ceil(jagMiesoN / p.jagNaKurs - 1e-9) : 0;
  const kmRzeznia = partieUboj * 2 * 2 * p.odlRzeznia;
  // Przetwórstwo
  const gesiSzt = p.gesi * 0.9,
    gesiP = (gesiSzt * p.przetwGesi) / 100;
  const kaczkiSzt = p.kaczki * 0.93,
    kaczkiP = (kaczkiSzt * p.przetwKaczki) / 100;
  const miesoP = (miesoKg * p.przetwJag) / 100;
  const PV = {
    gesi: gesiP * p.wartPrzetGes,
    kaczki: kaczkiP * p.wartPrzetKaczka,
    owce: miesoP * p.wartPrzetJag,
  };
  const przetwVal = sum(PV);
  const przetwKg = gesiP * 2.5 + kaczkiP * 1.2 + miesoP * 0.6;
  const paczki = (przetwKg * p.wysylka) / 100 / p.paczkaKg;
  const owoceT = sad * p.plonSad;
  const owoceSprzT = (owoceT * p.owoceSprz) / 100;
  const grzybyKg = p.klody * p.plonKloda;
  const R = {
    mleko: mlekoSwieze * p.cenaMleka,
    ser: serSprz * p.cenaSera,
    cieleta: cieletaSprz * p.cenaCielaka + remontKrow * p.cenaKrowyBrak,
    jaja: jajaSprz * p.cenaJaja + kuryWymiana * 10,
    koguty: koguty * p.cenaKoguta,
    kozy: kozlSprz * p.wagaKozla * p.cenaKoziny,
    swinie: p.swinieSprz * p.wagaTuszySw * p.cenaWieprzowiny,
    bydlo:
      odsadkiN * p.wagaOdsadka * p.cenaOdsadka +
      opasyN *
        ((((p.opasyMieso / 100) * p.wagaOpas * p.wydRzOpas) / 100) * p.cenaWolowiny +
          (1 - p.opasyMieso / 100) * p.wagaOpas * p.cenaZywcaOpas) +
      remontB * p.cenaKrowyBrak * 1.3,
    brojlery: p.brojlery * 0.95 * p.wagaTuszki * p.cenaTuszki,
    gesi: (gesiSzt - gesiP) * p.cenaGesi,
    kaczki: (kaczkiSzt - kaczkiP) * p.wagaKaczki * p.cenaKaczki,
    indyki: p.indyki * 0.9 * p.wagaIndyka * p.cenaIndyka,
    perliczki: p.perliczki * 0.9 * p.wagaPerliczki * p.cenaPerliczki,
    kroliki: p.kroliki * p.odchowKrol * 0.9 * p.cenaKrol,
    owce: jagZyweN * p.cenaJag + owceRemont * 250,
    jagniecina: (miesoKg - miesoP) * p.cenaMiesaJag,
    przetwory: przetwVal,
    owoce: owoceSprzT * 1000 * p.cenaOwocow,
    grzyby: grzybyKg * 0.9 * p.cenaGrzybow,
    warzywa: p.warzywaSprz * p.cenaWarzywHa,
    miod: p.ule * p.miodUl * p.cenaMiodu * 0.95,
  };
  const przychod = sum(R);
  // Wartość dla domu (nie gotówka)
  const barfKg = (kozleta - kozlSprz) * 10;
  const home = {
    swinie: p.swinie * 85 * 25,
    barf: barfKg * 15,
    jaja: (jaja - jajaSprz) * p.cenaJaja,
    mleko: (mlekoTotal - mlekoUzyt) * 0.4 * p.cenaMleka,
    ser: (serKg - serSprz) * p.cenaSera,
    owoce: Math.min(owoceT - owoceSprzT, 1.5) * 1000 * 1.5,
    grzyby: grzybyKg * 0.1 * p.cenaGrzybow,
  };
  Object.assign(r, {
    cieleta,
    cieletaSprz,
    remontKrow,
    jaja,
    jajaSprz,
    kuryWymiana,
    koguty,
    piskleta,
    kozlSprz,
    mamki,
    odsadkiN,
    opasyN,
    jagnieta,
    jagSprz,
    jagMiesoN,
    jagZyweN,
    tuszaKg,
    miesoKg,
    partieUboj,
    kmRzeznia,
    gesiP,
    kaczkiP,
    miesoP,
    PV,
    przetwVal,
    przetwKg,
    paczki,
    owoceT,
    owoceSprzT,
    grzybyKg,
    R,
    przychod,
    home,
    homeTotal: sum(home),
    barfKg,
  });

  // --- Koszty bieżące ---
  const C = {
    orne: orneEff * p.kOrne,
    laka: p.laka * p.kLaka,
    past: p.pastwisko * p.kPast,
    krowy:
      p.krowy > 0 ? p.krowy * p.kKrowa + jalowki * p.kKrowa * 0.3 + (byk ? p.kByk : p.krowy * p.kInsem) : 0,
    mlekoOpak: mlekoSwieze * p.kMlekoOpak,
    ser: serKg * p.kSer,
    kury:
      (p.wylegWlasny ? piskleta * p.kWylegSzt : kuryWymiana * p.cenaKurki) +
      p.kury * p.kKuraDod +
      jajaSprz * p.kOpakJaj +
      (p.tunelZima ? p.kury * p.kSciolkaTunel : 0),
    brojlery: p.brojlery * p.kBrojler,
    gesi: p.gesi * p.kGes,
    kaczki: p.kaczki * p.kKaczka,
    miedzyplony: mpHa * p.kMiedzyplon + scHa * p.kPoplon,
    bydlo: (mamki + opasyN + jalB) * p.kBydloMies + ((opasyN * p.opasyMieso) / 100) * p.kUbojOpas,
    indyki: p.indyki * p.kIndyk,
    perliczki: p.perliczki * p.kPerliczka,
    przetwory: (przetwVal * p.kPrzetwProc) / 100 + paczki * Math.max(0, p.kPaczki - p.oplataKlienta),
    owoce: (owoceSprzT * 1000 * p.cenaOwocow * p.kOwocProc) / 100,
    grzyby: p.klody * p.kKloda,
    kroliki: p.kroliki * p.kKrolik,
    warzywa: (p.warzywaSprz * p.cenaWarzywHa * p.kWarzywaProc) / 100,
    ule: p.ule * p.kUl,
    owce: p.owce * p.kOwca,
    uboj: jagMiesoN * p.kUbojJag + miesoKg * p.kRozbior + kmRzeznia * p.kKm,
    kozy: p.kozy * p.kKoza + kozlSprz * p.kUbojKoz,
    konie: p.konie * p.kKon,
    dzierzawa: p.dzierzawa * p.czynsz,
    swinie: (p.swinie + p.swinieSprz) * p.kSwinia + p.swinieSprz * p.kUbojSw,
    stale: p.kStale,
    sprzedaz:
      mlekoSwieze > 0 || jajaSprz > 0 || p.brojlery > 0 || p.kaczki > 0 || p.perliczki > 0 || p.indyki > 0
        ? p.kSprzedaz
        : 0,
    energia: p.kEnergia,
  };
  const fC = p._fC || 1;
  for (const k in C) if (k !== 'dzierzawa') C[k] *= fC;
  const dokup = {
    ziarno: Math.max(0, -grainBal) * p.cenaZiarnaKup,
    siano: Math.max(0, -hayBal) * p.cenaSianaKup,
    sloma: Math.max(0, -strawBal) * p.cenaSlomyKup,
    trociny: trocinyT * p.cenaTrocin,
  };
  C.dokup = sum(dokup);
  const koszty = sum(C);
  Object.assign(r, { C, dokup, koszty });

  // --- Inwestycje ---
  const pasy = p.owce + p.kozy > 0 ? 1.3 : 1;
  const grazers = p.krowy + p.owce + p.kozy + p.mamki > 0;
  const qOn = b => (b ? 1 : 0);
  const I = [
    {
      k: 'wiata',
      l: 'Wiata dla bydła',
      pid: 'iWiata',
      q: p.krowy + jalowki + byk + mamki + opasyN * 0.7 + jalB * 0.6,
      life: 20,
    },
    { k: 'owczarnia', l: 'Wiata dla owiec i kóz', pid: 'iOwczarnia', q: p.owce + p.kozy, life: 20 },
    { k: 'konie', l: 'Wiata lub boksy dla koni', pid: 'iKon', q: p.konie, life: 20 },
    { k: 'kurnik', l: 'Kurniki mobilne', pid: 'iKurnik', q: p.kury, life: 12 },
    { k: 'wyleg', l: 'Inkubator i odchowalnia', pid: 'iWyleg', q: qOn(p.wylegWlasny && p.kury > 0), life: 8 },
    {
      k: 'tunel',
      l: 'Tunel zimowy dla drobiu (wyposażenie)',
      pid: 'iTunelDrob',
      q: qOn(p.tunelZima && p.kury > 0),
      life: 10,
    },
    { k: 'brojl', l: 'Zagrody dla kurczaków', pid: 'iBrojl', q: p.brojlery / 4, life: 8 },
    {
      k: 'drobInny',
      l: 'Wiaty: kaczki, indyki, perliczki',
      pid: 'iDrobInny',
      q: p.kaczki / 2 + p.indyki * 3 + p.perliczki,
      life: 8,
    },
    { k: 'przetw', l: 'Wędzarnia, chłodnia, pakowarka', pid: 'iPrzetw', q: qOn(przetwVal > 0), life: 12 },
    { k: 'krolik', l: 'Klatki dla królików', pid: 'iKrolik', q: p.kroliki, life: 10 },
    { k: 'ogrodz', l: 'Ogrodzenie elektryczne', pid: 'iOgrodz', q: grazers ? tuz * pasy : 0, life: 15 },
    { k: 'woda', l: 'Woda na pastwiska', pid: 'iWoda', q: qOn(grazers), life: 15 },
    {
      k: 'mleczarnia',
      l: 'Dojarka, schładzalnik, mleczarnia',
      pid: 'iMleczarnia',
      q: qOn(p.krowy > 0),
      life: 12,
    },
    {
      k: 'serownia',
      l: 'Serownia i dojrzewalnia',
      pid: 'iSerownia',
      q: qOn(p.krowy > 0 && p.ser > 0),
      life: 12,
    },
    { k: 'maszyny', l: 'Używane maszyny', pid: 'iMaszyny', q: 1, life: 15 },
    { k: 'warzywa', l: 'Warzywa: tunel, nawadnianie, chłodnia', pid: 'iWarzywa', q: p.warzywaSprz, life: 10 },
    { k: 'ule', l: 'Ule z wyposażeniem', pid: 'iUl', q: p.ule, life: 15 },
  ];
  I.forEach(i => {
    i.c = i.q * p[i.pid];
    i.a = i.c / i.life;
  });
  const capex = I.reduce((a, i) => a + i.c, 0);
  const amort = I.reduce((a, i) => a + i.a, 0);
  Object.assign(r, { I, capex, amort });

  // --- Dopłaty ---
  const Dp = {
    pwd: RATES.pwd * UR,
    redys: RATES.redys * Math.min(UR, 30),
    krowy: RATES.krowy * (p.krowy + mamki),
    bydlo: RATES.bydlo * Math.floor(jalowki + opasyN + jalB),
    owce: p.owce >= 10 ? RATES.owce * p.owce : 0,
    kozy: p.kozy >= 5 ? RATES.kozy * p.kozy : 0,
    eko: p.eko
      ? RATES.ekoTUZ * tuz + RATES.ekoOrne * orneEff + RATES.ekoSad * sad + RATES.ekoWarz * p.warzywaSprz
      : 0,
    premia: p.eko && p.premiaObsada && djpHa >= 0.5 && djpHa <= 1.5 ? RATES.premia * UR : 0,
    ekst: p.ekstTUZ ? RATES.ekstTUZ * tuz : 0,
    wegiel: 0,
    mlody: p.mlodyRolnik ? RATES.mlody * UR : 0,
    onw: p.onw * UR,
    dobrostan:
      p.dobrostan +
      (p.dbKrowy ? p.krowy * (RATES.dbKrowaWypas + RATES.dbKrowaSciolka) : 0) +
      (p.dbKrowyPow ? p.krowy * RATES.dbKrowaPow : 0) +
      (p.dbOwceKozy ? p.owce * RATES.dbOwca + p.kozy * RATES.dbKoza : 0) +
      (p.dbKury ? p.kury * RATES.dbKura : 0),
  };
  const pktMp = (mpHa + wsHa) * 5,
    pktOb = p.wegObornik ? rot.obor * fieldHa * 2 : 0,
    pktSt = p.wegStruktura && rot.strukturaOk ? orneEff * 3 : 0;
  const pktEkst = p.ekstTUZ ? tuz * 5 : 0,
    pktMin = 0.25 * UR * 5,
    pktSum = pktMp + pktOb + pktSt + pktEkst;
  const wegielOk = pktSum >= pktMin;
  Dp.wegiel = wegielOk ? (pktMp + pktOb + pktSt) * p.wartPkt : 0;
  if (!wegielOk && p.ekstTUZ) Dp.ekst = 0;
  r.wegiel = {
    mpHa,
    wsHa,
    scHa,
    fieldHa,
    mpPasza,
    pktMp,
    pktOb,
    pktSt,
    pktEkst,
    pktMin,
    pktSum,
    ok: wegielOk,
    rot,
  };
  const doplaty = sum(Dp);
  Object.assign(r, { Dp, doplaty });

  // --- Wynik ---
  r.netto = przychod + doplaty - koszty - amort;

  // --- Praca (h/rok) ---
  const H = {
    krowy: p.krowy > 0 ? p.hKrowyStale + p.krowy * p.hKrowa + jalowki * 15 + byk * 20 : 0,
    ser: (mlekoSer / 100) * p.hSer,
    kury: p.kury > 0 ? p.hKuryStale + p.kury * p.hKura : 0,
    wyleg: piskleta * p.hWylegSzt,
    brojlery: p.brojlery > 0 ? 30 + p.brojlery * p.hBrojler : 0,
    gesi: p.gesi * p.hGes,
    kaczki: p.kaczki > 0 ? 15 + p.kaczki * p.hKaczka : 0,
    miedzyplony: (mpHa + scHa) * p.hMiedzyplon,
    bydlo: mamki > 0 ? 20 + mamki * p.hMamka + opasyN * p.hOpas + ((opasyN * p.opasyMieso) / 100) * 6 : 0,
    indyki: p.indyki > 0 ? 15 + p.indyki * p.hIndyk : 0,
    perliczki: p.perliczki > 0 ? 15 + p.perliczki * p.hPerliczka : 0,
    przetwory:
      przetwVal > 0
        ? p.hPrzetwStale +
          gesiP * p.hPrzetwGes +
          kaczkiP * p.hPrzetwKaczka +
          miesoP * p.hPrzetwJagKg +
          paczki * p.hPaczka
        : 0,
    owoce: owoceSprzT * p.hOwocT,
    grzyby: p.klody * p.hKloda,
    kroliki: p.kroliki * p.hKrolik,
    owce:
      p.owce > 0
        ? 30 +
          p.owce * p.hOwca * (0.6 + 0.4 * p.wykoty) +
          partieUboj * 2 * p.hKursRzeznia +
          jagMiesoN * p.hSprzMieso
        : 0,
    konie: p.konie * p.hKon,
    kozy: p.kozy * p.hKoza + kozlSprz * 1,
    swinie: (p.swinie + p.swinieSprz) * p.hSwinia + p.swinieSprz * 3,
    siano: (p.laka + koniczynaHa + hayFromPast / Math.max(1, p.plonLaki)) * p.hSiano,
    zboza: zbozeHa * p.hZboza,
    sprzedaz: (mlekoSwieze / 100) * p.hSprzMleko + (jajaSprz / 100) * p.hSprzJaja + p.hSprzStale,
    ogolne: p.hOgolne,
    ogrod: (sad + p.warzywnik) * p.hOgrod,
    warzywa: p.warzywaSprz * p.hWarzywaHa,
    ule: p.ule * p.hUl,
  };
  const fH = p._fH || 1;
  for (const k in H) H[k] *= fH;
  const godziny = sum(H);
  const mies = Array.from({ length: 12 }, (_, m) => {
    const o = {};
    LAB_GROUPS.forEach(gr => {
      o[gr.id] = gr.keys.reduce((a, k) => a + (H[k] / 12) * PROF[k][m], 0);
    });
    o.total = sum(o);
    return o;
  });
  const szczyt = Math.max(...mies.map(x => x.total));
  const dostepne = (p.etaty + 0.5 * p.polEtaty + 0.25 * p.cwiercEtaty) * p.hEtat;
  r.dostepne = dostepne;
  r.util = dostepne > 0 ? godziny / dostepne : 9;
  Object.assign(r, {
    H,
    godziny,
    mies,
    szczyt,
    tydzSr: godziny / 52,
    tydzSzczyt: szczyt / 4.33,
    zlH: godziny > 0 ? r.netto / godziny : 0,
  });

  // --- Kierunki: rachunek na kierunek ---
  const grainCostT = grainSupply > 0 ? (zbozeHa * p.kOrne) / grainSupply : p.cenaZiarnaKup;
  const forageTot = haySupply + grazeSupply;
  const forageCostT =
    forageTot > 0
      ? (p.laka * p.kLaka + koniczynaHa * p.kOrne + p.pastwisko * p.kPast) / forageTot
      : p.cenaSianaKup;
  r.grainCostT = grainCostT;
  r.forageCostT = forageCostT;
  const feed = (g, f) => g * grainCostT + f * forageCostT;
  const am = k => (I.find(i => i.k === k) || { a: 0 }).a;
  const sprzM = (mlekoSwieze / 100) * p.hSprzMleko,
    sprzJ = (jajaSprz / 100) * p.hSprzJaja;
  const sh = k => (przetwVal > 0 ? PV[k] / przetwVal : 0);
  const pr = k => ({
    rev: PV[k] || 0,
    cost: C.przetwory * sh(k),
    amort: am('przetw') * sh(k),
    h: H.przetwory * sh(k),
  });
  const PG = pr('gesi'),
    PK = pr('kaczki'),
    PO = pr('owce');
  const K = [
    {
      id: 'mleko',
      l: 'Mleko i sery',
      on: p.krowy > 0,
      rev: R.mleko + R.ser + R.cieleta,
      cost: C.krowy + C.mlekoOpak + C.ser + p.kEnergia * 0.6 + feed(G.krowy, F.krowy + F.jalowki + F.byk),
      amort: am('wiata') + am('mleczarnia') + am('serownia'),
      dop: Dp.krowy + Dp.bydlo,
      h: H.krowy + H.ser + sprzM,
    },
    {
      id: 'jaja',
      l: 'Jaja',
      on: p.kury > 0,
      rev: R.jaja + R.koguty,
      cost: C.kury + p.kEnergia * 0.1 + feed(G.kury + G.wyleg, 0),
      amort: am('kurnik') + am('wyleg') + am('tunel'),
      dop: 0,
      h: H.kury + H.wyleg + sprzJ,
    },
    {
      id: 'brojlery',
      l: 'Kurczaki pastwiskowe',
      on: p.brojlery > 0,
      rev: R.brojlery,
      cost: C.brojlery + feed(G.brojlery, 0),
      amort: am('brojl'),
      dop: 0,
      h: H.brojlery,
    },
    {
      id: 'gesi',
      l: p.przetwGesi > 0 ? 'Gęsi (z przetworami)' : 'Gęsi',
      on: p.gesi > 0,
      rev: R.gesi + PG.rev,
      cost: C.gesi + PG.cost + feed(G.gesi, F.gesi),
      amort: PG.amort,
      dop: 0,
      h: H.gesi + PG.h,
    },
    {
      id: 'kaczki',
      l: p.przetwKaczki > 0 ? 'Kaczki (z przetworami)' : 'Kaczki',
      on: p.kaczki > 0,
      rev: R.kaczki + PK.rev,
      cost: C.kaczki + PK.cost + feed(G.kaczki, F.kaczki),
      amort:
        (am('drobInny') * (p.kaczki / 2)) / Math.max(1, p.kaczki / 2 + p.indyki * 3 + p.perliczki) + PK.amort,
      dop: 0,
      h: H.kaczki + PK.h,
    },
    {
      id: 'bydlo',
      l: 'Bydło mięsne',
      on: mamki > 0,
      rev: R.bydlo,
      cost: C.bydlo + feed(0, F.bydlo),
      amort:
        (am('wiata') * (mamki + opasyN * 0.7 + jalB * 0.6)) /
        Math.max(1, p.krowy + jalowki + byk + mamki + opasyN * 0.7 + jalB * 0.6),
      dop: RATES.krowy * mamki + RATES.bydlo * Math.floor(opasyN + jalB),
      h: H.bydlo,
    },
    {
      id: 'indyki',
      l: 'Indyki',
      on: p.indyki > 0,
      rev: R.indyki,
      cost: C.indyki + feed(G.indyki, F.indyki),
      amort: (am('drobInny') * (p.indyki * 3)) / Math.max(1, p.kaczki / 2 + p.indyki * 3 + p.perliczki),
      dop: 0,
      h: H.indyki,
    },
    {
      id: 'perliczki',
      l: 'Perliczki',
      on: p.perliczki > 0,
      rev: R.perliczki,
      cost: C.perliczki + feed(G.perliczki, F.perliczki),
      amort: (am('drobInny') * p.perliczki) / Math.max(1, p.kaczki / 2 + p.indyki * 3 + p.perliczki),
      dop: 0,
      h: H.perliczki,
    },
    {
      id: 'kroliki',
      l: 'Króliki',
      on: p.kroliki > 0,
      rev: R.kroliki,
      cost: C.kroliki + feed(G.kroliki, F.kroliki),
      amort: am('krolik'),
      dop: 0,
      h: H.kroliki,
    },
    {
      id: 'owce',
      l: p.przetwJag > 0 ? 'Owce (z wyrobami)' : 'Owce',
      on: p.owce > 0,
      rev: R.owce + R.jagniecina + PO.rev,
      cost: C.owce + C.uboj + PO.cost + feed(G.owce, F.owce),
      amort: am('owczarnia') * (p.owce / Math.max(1, p.owce + p.kozy)) + PO.amort,
      dop: Dp.owce,
      h: H.owce + PO.h,
    },
    {
      id: 'kozy',
      l: p.kozySprz > 0 ? 'Kozy (koźlęcina i dla psa)' : 'Kozy (dla psa i na krzaki)',
      on: p.kozy > 0,
      rev: R.kozy,
      cost: C.kozy + feed(0, F.kozy),
      amort: am('owczarnia') * (p.kozy / Math.max(1, p.owce + p.kozy)),
      dop: Dp.kozy,
      h: H.kozy,
      homeV: home.barf,
    },
    {
      id: 'swinie',
      l: p.swinieSprz > 0 ? 'Świnie (dom i sprzedaż)' : 'Świnie (dla domu)',
      on: p.swinie + p.swinieSprz > 0,
      rev: R.swinie,
      cost: C.swinie + feed(G.swinie, 0),
      amort: 0,
      dop: 0,
      h: H.swinie,
      homeV: home.swinie,
    },
    {
      id: 'konie',
      l: 'Konie (zapas, praca, dzieci)',
      on: p.konie > 0,
      rev: 0,
      cost: C.konie + feed(G.konie, F.konie),
      amort: am('konie'),
      dop: 0,
      h: H.konie,
    },
    {
      id: 'warzywa',
      l: 'Warzywa na sprzedaż',
      on: p.warzywaSprz > 0,
      rev: R.warzywa,
      cost: C.warzywa,
      amort: am('warzywa'),
      dop: 0,
      h: H.warzywa,
    },
    {
      id: 'owoce',
      l: 'Owoce z sadu',
      on: R.owoce > 0,
      rev: R.owoce,
      cost: C.owoce,
      amort: 0,
      dop: 0,
      h: H.owoce,
    },
    {
      id: 'grzyby',
      l: 'Boczniaki na kłodach',
      on: p.klody > 0,
      rev: R.grzyby,
      cost: C.grzyby,
      amort: 0,
      dop: 0,
      h: H.grzyby,
    },
    { id: 'ule', l: 'Pszczoły', on: p.ule > 0, rev: R.miod, cost: C.ule, amort: am('ule'), dop: 0, h: H.ule },
  ];
  const forLand = p.pastwisko + p.laka + koniczynaHa;
  const yF = forLand > 0 ? (grazeSupply + haySupply) / forLand : p.plonPast;
  const land = {
    mleko: (F.krowy + F.jalowki + F.byk) / yF + G.krowy / p.plonZboz,
    jaja: (G.kury + G.wyleg) / p.plonZboz,
    brojlery: G.brojlery / p.plonZboz,
    gesi: F.gesi / yF + G.gesi / p.plonZboz,
    kroliki: F.kroliki / yF + G.kroliki / p.plonZboz,
    owce: F.owce / yF + G.owce / p.plonZboz,
    kozy: F.kozy / yF,
    swinie: G.swinie / p.plonZboz,
    konie: F.konie / yF + G.konie / p.plonZboz,
    warzywa: p.warzywaSprz,
    ule: 0,
    bydlo: F.bydlo / yF,
    kaczki: F.kaczki / yF + G.kaczki / p.plonZboz,
    indyki: F.indyki / yF + G.indyki / p.plonZboz,
    perliczki: F.perliczki / yF + G.perliczki / p.plonZboz,
    owoce: (sad * p.owoceSprz) / 100,
    grzyby: 0,
  };
  K.forEach(k => {
    k.net = k.rev + k.dop - k.cost - k.amort;
    k.zlH = k.h > 0 ? k.net / k.h : 0;
    k.ha = land[k.id];
    k.zlHa = k.ha > 0.005 ? k.net / k.ha : null;
  });
  const kSum = K.reduce((a, k) => a + k.net, 0);
  const kH = K.reduce((a, k) => a + k.h, 0);
  r.K = K;
  r.wspolne = { net: r.netto - kSum, h: godziny - kH };

  // --- Rynek ---
  r.rynek = {
    mlekoDzien: mlekoSwieze / 365,
    jajaTydz: jajaSprz / 52,
    rwsUdzialy: R.warzywa / 1600,
    miodKg: p.ule * p.miodUl * 0.95,
    serTydz: serSprz / 52,
    rhdPrzetwory:
      R.ser +
      R.jagniecina +
      R.przetwory +
      R.kozy +
      R.swinie +
      ((((opasyN * p.opasyMieso) / 100) * p.wagaOpas * p.wydRzOpas) / 100) * p.cenaWolowiny,
  };

  // --- Ostrzeżenia ---
  const W = [];
  if (orne < -0.001)
    W.push({
      lvl: 'bad',
      t: `Pastwisko, łąka, obejście i warzywa zajmują o ${fmt(-orne, 1)} ha więcej, niż macie ziemi. Zmniejsz któryś z tych suwaków albo dodaj dzierżawę.`,
    });
  if (p.sad + p.warzywnik > p.obejscie + 0.001)
    W.push({ lvl: 'bad', t: 'Sad i warzywnik nie mieszczą się w obejściu. Zwiększ obejście.' });
  if (grainBal < -0.05)
    W.push({
      lvl: 'bad',
      t: `Brakuje ok. ${fmt(-grainBal, 1)} t ziarna. To ok. ${fmt(-grainBal / p.plonZboz, 1)} ha zbóż więcej (ok. ${fmt(-grainBal / p.plonZboz / (p.zbozaUdzial / 100), 1)} ha gruntów ornych w płodozmianie) albo ok. ${fmt(-grainBal / ((p.paszaKura / 1e6) * 365 * 0.9 * (1 - p.oszczPast / 100)), 0)} kur mniej.`,
    });
  if (hayBal < -0.05)
    W.push({
      lvl: 'bad',
      t: `Brakuje ok. ${fmt(-hayBal, 1)} t s.m. siana na zimę. To ok. ${fmt(-hayBal / (p.plonLaki * 0.75), 1)} ha łąki więcej albo mniej zwierząt.`,
    });
  if (strawBal < -0.05)
    W.push({
      lvl: 'warn',
      t: `Brakuje ok. ${fmt(-strawBal, 1)} t słomy na ściółkę. Pomoże więcej zbóż albo włącz trociny zamiast słomy (grupa „Koszty”).`,
    });
  if (trocinyT > 0.05)
    W.push({
      lvl: 'info',
      t: `Brakującą słomę zastępujesz trocinami: ok. ${fmt(trocinyT, 1)} t (ok. ${fmt(trocinyT / 0.22, 0)} m³) za ok. ${fmt(trocinyT * p.cenaTrocin, 0)} zł rocznie.`,
    });
  if (grainBal > 2)
    W.push({
      lvl: 'info',
      t: `Nadwyżka ziarna ok. ${fmt(grainBal, 1)} t. Możesz dołożyć ok. ${fmt(grainBal / ((p.paszaKura / 1e6) * 365 * 0.9 * (1 - p.oszczPast / 100)), 0)} kur albo zamienić część zbóż na koniczynę.`,
    });
  if (hayBal > 8)
    W.push({
      lvl: 'info',
      t: `Dużo nadwyżki siana (ok. ${fmt(hayBal, 1)} t s.m.). Jest miejsce na kolejne zwierzęta albo zapas na suszę.`,
    });
  if (p.eko && p.premiaObsada && (djpHa < 0.5 || djpHa > 1.5))
    W.push({
      lvl: 'warn',
      t: `Obsada ${fmt(djpHa, 2)} DJP/ha jest poza przedziałem 0,5–1,5, więc premia 573 zł/ha nie przysługuje.`,
    });
  if (djpTUZ > 2)
    W.push({
      lvl: 'warn',
      t: 'Na użytkach zielonych jest ponad 2 DJP/ha. To już nie jest wypas ekstensywny.',
    });
  if (r.util > 1)
    W.push({
      lvl: 'bad',
      t: `Potrzeba ${fmt(godziny, 0)} h rocznie, a rodzina ma ok. ${fmt(dostepne, 0)} h. Brakuje ok. ${fmt(godziny - dostepne, 0)} h.`,
    });
  else if (r.util > 0.85)
    W.push({
      lvl: 'warn',
      t: `Praca zajmuje ${fmt(r.util * 100, 0)}% czasu rodziny. Mało zapasu na choroby i urlopy.`,
    });
  else if (r.util < 0.5)
    W.push({
      lvl: 'info',
      t: `Praca zajmuje tylko ok. ${fmt(r.util * 100, 0)}% czasu rodziny (${fmt(godziny, 0)} z ${fmt(dostepne, 0)} h). Ograniczeniem jest ziemia i rynek, nie ręce: wolny czas najlepiej włożyć w sery, warzywa i sprzedaż bezpośrednią.`,
    });
  if (dostepne > 0 && szczyt > (dostepne / 12) * 1.3)
    W.push({
      lvl: 'warn',
      t: `W najcięższym miesiącu potrzeba ok. ${fmt(szczyt, 0)} h, a miesięcznie rodzina ma ok. ${fmt(dostepne / 12, 0)} h.`,
    });
  if (r.tydzSzczyt > p.limitTydz)
    W.push({
      lvl: 'warn',
      t: `W najcięższym miesiącu wychodzi ok. ${fmt(r.tydzSzczyt, 0)} h tygodniowo, powyżej Twojego limitu ${fmt(p.limitTydz, 0)} h.`,
    });
  if (r.rynek.jajaTydz > 500)
    W.push({
      lvl: 'info',
      t: `Musisz sprzedawać ok. ${fmt(r.rynek.jajaTydz / 10, 0)} opakowań po 10 jaj tygodniowo. Najpierw znajdź stałych odbiorców.`,
    });
  if (r.rynek.rhdPrzetwory > 100000)
    W.push({
      lvl: 'info',
      t: 'Przychód z RHD (sery, mięso czerwone w paczkach, wędliny) przekracza 100 tys. zł, więc nadwyżka podlega 2% ryczałtowi.',
    });
  if (p.indyki > 0 && p.kury + p.brojlery > 0)
    W.push({
      lvl: 'warn',
      t: 'Indyki i kury: trzymaj je osobno i najlepiej na innych kwaterach niż kury w ostatnich latach. Kury przenoszą histomonozę (czarną główkę), która u indyków zabija nawet całe stado.',
    });
  if (paczki > 0)
    W.push({
      lvl: 'info',
      t: `Ok. ${fmt(paczki, 0)} paczek z przetworami rocznie, głównie od października do grudnia. Wysyłkę chłodzoną sprawdź u kuriera przed sezonem.`,
    });
  if (jagMiesoN > 0) {
    const zMiesa =
      tuszaKg * p.cenaMiesaJag - p.kUbojJag - tuszaKg * p.kRozbior - (kmRzeznia * p.kKm) / jagMiesoN;
    if (zMiesa < p.cenaJag)
      W.push({
        lvl: 'info',
        t: `Jagnię sprzedane jako mięso daje ok. ${fmt(zMiesa, 0)} zł po kosztach uboju i dowozu, mniej niż żywcem (${fmt(p.cenaJag, 0)} zł). Przy tych cenach lepiej sprzedawać żywcem.`,
      });
  }
  if (p.owce > 0 && p.owce < 10) W.push({ lvl: 'info', t: 'Płatność do owiec liczę od 10 sztuk.' });
  if (p.kozy > 0 && p.kozy < 5)
    W.push({ lvl: 'info', t: 'Płatność do kóz liczę od 5 sztuk (przy mniejszej liczbie pomijam).' });
  if (p.wylegWlasny && koguty > 0)
    W.push({
      lvl: 'info',
      t: `Własny wylęg: ok. ${fmt(piskleta, 0)} piskląt wiosną, ok. ${fmt(koguty, 0)} kogutków rosołowych. Pamiętaj o szczepieniu przeciw chorobie Mareka.`,
    });
  if ((p.miedzyplony || p.wegObornik || p.wegStruktura) && !wegielOk)
    W.push({
      lvl: 'warn',
      t: `Ekoschemat „Rolnictwo węglowe”: ${fmt(pktSum, 1)} pkt, a próg to ${fmt(pktMin, 1)} pkt (25% UR × 5). Poniżej progu nie ma płatności. Dołóż praktyki, np. ekstensywne TUZ z obsadą.`,
    });
  if (p.wegStruktura && !rot.strukturaOk)
    W.push({
      lvl: 'info',
      t: `Zróżnicowana struktura upraw: Twój płodozmian ma ${Math.round(rot.cerShare * 100)}% zbóż i ${rot.uniq} uprawy. Wymóg: zboża najwyżej 65%, min. 3 uprawy, koniczyna min. 20%. Zmień liczbę pól w „Płodozmianie”.`,
    });
  if (p.swinieSprz > 0)
    W.push({
      lvl: 'info',
      t: 'Tuczniki na sprzedaż: na Dolnym Śląsku występuje ASF. Przed zakupem prosiąt sprawdź u powiatowego lekarza weterynarii strefę i wymogi bioasekuracji dla chowu na wybiegu.',
    });
  if (mamki > 0 && !p.byk)
    W.push({
      lvl: 'info',
      t: 'Mamki: potrzebny spokojny byk (np. angus) albo inseminacja. Włącz „Własny buhaj” w grupie krów, jeśli go trzymasz.',
    });
  if (p0.udzialIII + p0.udzialV + p0.udzialVI > 100)
    W.push({
      lvl: 'warn',
      t: 'Udziały klas gleby sumują się do ponad 100%. Popraw suwaki w grupie „Ziemia”.',
    });
  r.gleba = gf;
  r.dom = budzet(p);
  r.celEff = celEff(p);
  r.cf = cashflow(r, p);
  r.W = W;
  return r;
}
