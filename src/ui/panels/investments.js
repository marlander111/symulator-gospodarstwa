// Panel „Inwestycje”: kwoty powiązane z suwakami cen jednostkowych.

function renderInv(r) {
  if (document.activeElement && document.activeElement.classList.contains('inv-in')) return;
  let t = `<thead><tr><th>Inwestycja</th><th class="n">Koszt (wpisz swój)</th><th class="n">Cena jednostkowa</th><th class="n">Lata</th><th class="n">Rocznie</th></tr></thead><tbody>`;
  for (const i of r.I) {
    if (i.q <= 0) continue;
    const d = DEF.find(x => x.id === i.pid);
    const unit =
      i.q === 1 ? '' : `${fmtVal(d, p[i.pid])}${i.q !== 1 ? ` × ${fmt(i.q, i.q < 10 ? 1 : 0)}` : ''}`;
    t += `<tr><td>${esc(i.l)}</td><td class="n"><input class="inv-in" type="number" min="0" step="500" inputmode="numeric" data-inv="${i.k}" value="${Math.round(i.c)}" aria-label="Koszt: ${esc(i.l)}"></td><td class="n small muted">${unit}</td><td class="n">${i.life}</td><td class="n">${zl0(i.a)}</td></tr>`;
  }
  t += `<tr class="tot"><td>Razem</td><td class="n">${zl0(r.capex)}</td><td></td><td class="n"></td><td class="n">${zl0(r.amort)}</td></tr></tbody>`;
  $('t-inv').innerHTML = t;
  document.querySelectorAll('[data-inv]').forEach(el =>
    el.addEventListener('change', () => {
      const it = r.I.find(x => x.k === el.dataset.inv);
      const v = parseFloat(el.value);
      if (!it || !isFinite(v) || v < 0 || it.q <= 0) return;
      p[it.pid] = Math.round((v / it.q) * 100) / 100;
      const inp = $('in-' + it.pid),
        d = DEF.find(x => x.id === it.pid);
      if (inp) {
        inp.value = p[it.pid];
        $('out-' + it.pid).textContent = fmtVal(d, p[it.pid]);
      }
      el.blur();
      changed();
    })
  );
}
