// Przełącznik motywu: automatyczny, jasny, ciemny.

const LST = 'gosp-motyw';
function setTheme(t) {
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  else document.documentElement.removeAttribute('data-theme');
  document
    .querySelectorAll('[data-th]')
    .forEach(b => b.classList.toggle('on', b.dataset.th === (t || 'auto')));
  try {
    localStorage.setItem(LST, t || 'auto');
  } catch (e) {}
}
let th0 = 'auto';
try {
  th0 = localStorage.getItem(LST) || 'auto';
} catch (e) {}
setTheme(th0);
$('theme-sw').addEventListener('click', e => {
  const b = e.target.closest('[data-th]');
  if (b) {
    setTheme(b.dataset.th);
    render();
  }
});
