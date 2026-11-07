// Generator raportu PDF bez zewnętrznych bibliotek (czcionki standardowe z polskimi znakami).

// ---------- Raport PDF (bez zewnętrznych bibliotek) ----------
const PDFMAP = {
  ą: 200,
  ć: 201,
  ę: 202,
  ł: 203,
  ń: 204,
  ś: 205,
  ź: 206,
  ż: 207,
  Ą: 192,
  Ć: 193,
  Ę: 194,
  Ł: 195,
  Ń: 196,
  Ś: 197,
  Ź: 198,
  Ż: 199,
  ó: 243,
  Ó: 211,
  '–': 150,
  '—': 151,
  '·': 183,
  '×': 215,
  '„': 132,
  '”': 148,
  '“': 147,
  '…': 133,
  '’': 146,
  '‘': 145,
  '²': 178,
  '±': 177,
  é: 233,
  ü: 252,
  ö: 246,
  ä: 228,
};
function pdfStr(s) {
  let o = '';
  for (const ch of String(s)) {
    let c = ch === ' ' || ch === ' ' ? 32 : ch === '−' ? 45 : (PDFMAP[ch] ?? ch.charCodeAt(0));
    if (c > 255) c = 63;
    if (c === 40 || c === 41 || c === 92) o += '\\' + ch;
    else if (c < 32 || c > 126) o += '\\' + c.toString(8).padStart(3, '0');
    else o += String.fromCharCode(c);
  }
  return o;
}
function makePdf() {
  const PW = 595,
    PH = 842,
    M = 40;
  const pages = [];
  let cur = null,
    y = 0;
  const newPage = () => {
    cur = [];
    pages.push(cur);
    y = PH - M;
  };
  const need = h => {
    if (!cur || y - h < M + 16) newPage();
  };
  const txt = (x, yy, s, size = 9, font = 'F1', rgb = '0 0 0') =>
    cur.push(`BT ${rgb} rg /${font} ${size} Tf ${x.toFixed(1)} ${yy.toFixed(1)} Td (${pdfStr(s)}) Tj ET`);
  const rtxt = (xr, yy, s, size = 9, font = 'F3', rgb = '0 0 0') =>
    txt(xr - String(s).length * 0.6 * size, yy, s, size, font, rgb);
  const rect = (x, yy, w, h, rgb) =>
    cur.push(`${rgb} rg ${x.toFixed(1)} ${yy.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re f`);
  const line = (x1, y1, x2, y2, rgb = '0.8 0.8 0.8', w = 0.5) =>
    cur.push(`${rgb} RG ${w} w ${x1.toFixed(1)} ${y1.toFixed(1)} m ${x2.toFixed(1)} ${y2.toFixed(1)} l S`);
  const wrap = (s, size, width) => {
    const out = [];
    let l = '';
    for (const w of String(s).split(/\s+/)) {
      if ((l + ' ' + w).trim().length * 0.5 * size > width && l) {
        out.push(l);
        l = w;
      } else l = (l + ' ' + w).trim();
    }
    if (l) out.push(l);
    return out;
  };
  const para = (s, size = 8.5, rgb = '0.3 0.3 0.3') => {
    for (const ln of wrap(s, size, PW - 2 * M)) {
      need(size + 3);
      txt(M, y - size, ln, size, 'F1', rgb);
      y -= size + 3;
    }
    y -= 4;
  };
  const h2 = s => {
    need(40);
    y -= 10;
    txt(M, y - 13, s, 13, 'F2', '0.1 0.3 0.15');
    y -= 20;
    line(M, y, PW - M, y, '0.17 0.42 0.23', 1);
    y -= 6;
  };
  const table = (el, opts = {}) => {
    if (!el) return;
    const head = [...el.querySelectorAll('thead th')].map(c => c.textContent.trim());
    const body = [...el.querySelectorAll('tbody tr')].map(r => ({
      tot: r.classList.contains('tot'),
      cells: [...r.cells].map(c =>
        (c.querySelector('input') ? c.querySelector('input').value + ' zł' : c.innerText)
          .split('\n')[0]
          .trim()
      ),
    }));
    const n = Math.max(head.length, ...body.map(b => b.cells.length));
    if (!n) return;
    const skip = opts.skip || [];
    const cols = [...Array(n).keys()].filter(i => !skip.includes(i));
    const w0 = opts.w0 || (cols.length <= 2 ? 300 : cols.length <= 4 ? 200 : 140),
      rest = (PW - 2 * M - w0) / (cols.length - 1 || 1);
    const xr = i => M + w0 + rest * cols.indexOf(i);
    const fs = cols.length > 7 ? 7.2 : 8.3;
    need(30);
    cols.forEach((i, j) => {
      const s = (head[i] || '').toUpperCase();
      if (j === 0) txt(M, y - 9, s.slice(0, 40), 6.8, 'F2', '0.35 0.35 0.35');
      else if ((opts.left || []).includes(i))
        txt(xr(i) - rest + 6, y - 9, s.slice(0, Math.floor(rest / 4.6)), 6.8, 'F2', '0.35 0.35 0.35');
      else rtxt(xr(i), y - 9, s.slice(0, Math.floor((rest - 6) / 4.2)), 6.8, 'F2', '0.35 0.35 0.35');
    });
    y -= 13;
    line(M, y, PW - M, y);
    for (const b of body) {
      need(fs + 6);
      const font = b.tot ? 'F4' : 'F3',
        lfont = b.tot ? 'F2' : 'F1';
      cols.forEach((i, j) => {
        const s = b.cells[i] || '';
        if (j === 0) txt(M, y - fs - 1.5, s.slice(0, Math.floor(w0 / (0.5 * fs))), fs, lfont);
        else if ((opts.left || []).includes(i))
          txt(
            xr(i) - rest + 6,
            y - fs - 1.5,
            s.slice(0, Math.floor((rest - 6) / (0.5 * fs))),
            fs - 0.8,
            'F1',
            '0.45 0.3 0.1'
          );
        else rtxt(xr(i), y - fs - 1.5, s.slice(0, Math.floor((rest - 4) / (0.6 * fs))), fs, font);
      });
      y -= fs + 5;
      line(M, y, PW - M, y, b.tot ? '0.2 0.2 0.2' : '0.88 0.88 0.88', b.tot ? 0.8 : 0.4);
    }
    y -= 8;
  };
  const bars = (vals, labels, title, rgbPos = '0.17 0.42 0.23') => {
    const H = 90;
    need(H + 30);
    txt(M, y - 9, title, 8, 'F1', '0.35 0.35 0.35');
    y -= 14;
    const mx = Math.max(1, ...vals.map(Math.abs)),
      mn = Math.min(0, ...vals),
      span = mx - Math.min(0, mn) || 1;
    const cw = (PW - 2 * M) / vals.length,
      y0 = y - H + (-mn / span) * H;
    vals.forEach((v, i) => {
      const h = (Math.abs(v) / span) * H;
      rect(
        M + i * cw + cw * 0.18,
        v >= 0 ? y0 : y0 - h,
        cw * 0.64,
        Math.max(0.5, h),
        v >= 0 ? rgbPos : '0.7 0.2 0.15'
      );
      txt(M + i * cw + cw / 2 - labels[i].length * 2, y - H - 10, labels[i], 7, 'F1', '0.35 0.35 0.35');
    });
    line(M, y0, PW - M, y0, '0.5 0.5 0.5', 0.5);
    y -= H + 20;
  };
  const kv = rows => {
    for (const [k, v] of rows) {
      need(14);
      txt(M, y - 10, k, 9.5, 'F1', '0.25 0.25 0.25');
      rtxt(PW - M, y - 10, v, 9.5, 'F4');
      y -= 14;
      line(M, y + 1, PW - M, y + 1, '0.9 0.9 0.9', 0.4);
    }
    y -= 6;
  };

  const r = compute(p),
    ro = compute(gorzej(p));
  const sel = id => {
    const c = document.querySelector(`[data-pdf="${id}"]`);
    return !c || c.checked;
  };
  newPage();
  txt(M, y - 20, 'Symulator gospodarstwa rodzinnego', 20, 'F2', '0.1 0.25 0.12');
  y -= 30;
  txt(M, y - 12, `Wariant: ${variantName()}`, 12, 'F2');
  y -= 18;
  txt(
    M,
    y - 9,
    `${new Date().toLocaleDateString('pl-PL')} · ${fmt(r.UR, 1)} ha użytków · ${fmt(p.areaTotal, 0)} ha własnych${p.dzierzawa ? ` + ${fmt(p.dzierzawa, 1)} ha dzierżawy` : ''} · założenia: rok w pełnym działaniu`,
    8.5,
    'F1',
    '0.35 0.35 0.35'
  );
  y -= 18;
  const animals = [
    p.krowy ? `${p.krowy} krów` : '',
    p.mamki ? `${p.mamki} mamek` : '',
    p.kury ? `${p.kury} kur` : '',
    p.brojlery ? `${p.brojlery} kurczaków` : '',
    p.gesi ? `${p.gesi} gęsi` : '',
    p.kaczki ? `${p.kaczki} kaczek` : '',
    p.indyki ? `${p.indyki} indyków` : '',
    p.perliczki ? `${p.perliczki} perliczek` : '',
    p.owce ? `${p.owce} owiec` : '',
    p.kozy ? `${p.kozy} kóz` : '',
    p.swinie + p.swinieSprz ? `${p.swinie + p.swinieSprz} świń` : '',
    p.konie ? `${p.konie} konie` : '',
    p.kroliki ? `${p.kroliki} samic królików` : '',
    p.ule ? `${p.ule} uli` : '',
  ]
    .filter(Boolean)
    .join(', ');
  para(
    'Zwierzęta i uprawy: ' +
      animals +
      `. Pastwisko ${fmt(p.pastwisko, 1)} ha, łąka ${fmt(p.laka, 1)} ha, grunty orne ${fmt(r.orneEff, 1)} ha (zboża ${p.zbozaUdzial}%).`,
    8.5,
    '0.2 0.2 0.2'
  );
  if (sel('kpi')) {
    h2('Podsumowanie');
    kv([
      ['Dochód na czysto / rok', zl(r.netto)],
      ['Średnio miesięcznie', zl(r.netto / 12)],
      ['Przychód (sprzedaż + dopłaty)', zl(r.przychod + r.doplaty)],
      ['w tym dopłaty', zl(r.doplaty)],
      ['Koszty z amortyzacją', zl(r.koszty + r.amort)],
      ['Wariant pesymistyczny', zl(ro.netto)],
      ['Praca / rok', `${fmt(r.godziny, 0)} h (śr. ${fmt(r.godziny / 52, 0)} h/tydz.)`],
      ['Najcięższy miesiąc (pesym.)', `${fmt(ro.tydzSzczyt, 0)} h/tydz. (limit ${fmt(p.limitTydz, 0)})`],
      ['Inwestycje', `${zl(r.capex)} (${zl(r.amort)} rocznie)`],
      ['Pasze', `siano ${fmt(r.hayBal, 1)} t, ziarno ${fmt(r.grainBal, 1)} t, słoma ${fmt(r.strawBal, 1)} t`],
      ['Obsada', `${fmt(r.djpHa, 2)} DJP/ha`],
    ]);
  }
  if (sel('money')) {
    h2('Pieniądze');
    table($('t-rev'));
    table($('t-cost'));
    table($('t-dop'));
    table($('t-home'));
  }
  if (sel('cf')) {
    h2('Przepływy gotówki');
    bars(
      r.cf.M.map(m => m.netto - m.dom),
      MS,
      'Wynik miesiąca po wypłacie na dom (zł)'
    );
    table($('t-cf'));
    para($('cf-note').textContent);
  }
  if (sel('kier')) {
    h2('Który kierunek się opłaca');
    table($('t-kier'), { skip: [7, 8, 9] });
  }
  if (sel('next')) {
    h2('Co dalej: co dołożyć');
    table($('t-next'), { skip: [4, 7], w0: 120, left: [6] });
    para($('next-note').textContent);
  }
  if (sel('lab')) {
    h2('Czas pracy w roku');
    bars(
      r.mies.map(m => m.total),
      MS,
      'Godziny w miesiącu (cała rodzina)',
      '0.55 0.45 0.2'
    );
    table($('t-lab'));
  }
  if (sel('rynek')) {
    h2('Co trzeba sprzedać');
    kv(
      [...document.querySelectorAll('#market .card')].map(c => [
        c.querySelector('.k').textContent,
        c.querySelector('.v').textContent,
      ])
    );
  }
  if (sel('inv')) {
    h2('Inwestycje');
    table($('t-inv'));
  }
  if (sel('rot')) {
    h2('Płodozmian');
    table($('t-rot'), { w0: 70 });
    para($('rot-note').textContent);
  }
  if (sel('dom')) {
    h2('Budżet domu');
    table($('t-dom'), { skip: [2] });
    para($('dom-note').textContent);
  }
  para(
    'Wyliczenia orientacyjne na podstawie założeń z symulatora; ceny, plony i normy pracy warto sprawdzić lokalnie. Dopłaty i przepisy zmieniają się co roku.',
    7.5,
    '0.45 0.45 0.45'
  );

  // składanie pliku
  const objs = [];
  const add = s => {
    objs.push(s);
    return objs.length;
  };
  const enc = add(
    `<< /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences [192 /Aogonek /Cacute /Eogonek /Lslash /Nacute /Sacute /Zacute /Zdotaccent /aogonek /cacute /eogonek /lslash /nacute /sacute /zacute /zdotaccent] >>`
  );
  const fonts = ['Helvetica', 'Helvetica-Bold', 'Courier', 'Courier-Bold'].map(b =>
    add(`<< /Type /Font /Subtype /Type1 /BaseFont /${b} /Encoding ${enc} 0 R >>`)
  );
  const pagesId = objs.length + 1;
  objs.push(null);
  const kids = [];
  pages.forEach((c, i) => {
    c.push(
      `BT 0.5 0.5 0.5 rg /F1 7 Tf ${M} 22 Td (${pdfStr(`Symulator gospodarstwa rodzinnego · ${variantName()} · strona ${i + 1} z ${pages.length}`)}) Tj ET`
    );
    const stream = c.join('\n');
    const cs = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    kids.push(
      add(
        `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /Font << /F1 ${fonts[0]} 0 R /F2 ${fonts[1]} 0 R /F3 ${fonts[2]} 0 R /F4 ${fonts[3]} 0 R >> >> /Contents ${cs} 0 R >>`
      )
    );
  });
  objs[pagesId - 1] =
    `<< /Type /Pages /Kids [${kids.map(k => k + ' 0 R').join(' ')}] /Count ${kids.length} >>`;
  const cat = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  let out = '%PDF-1.4\n',
    offs = [];
  objs.forEach((o, i) => {
    offs.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out +=
    `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` +
    offs.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('');
  out += `trailer\n<< /Size ${objs.length + 1} /Root ${cat} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return out;
}
