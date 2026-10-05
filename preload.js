const { ipcRenderer, webFrame } = require('electron');

webFrame.executeJavaScript('(' + function () {
  const mm = window.matchMedia.bind(window);
  window.matchMedia = q => /display-mode:\s*standalone/.test(q)
    ? { matches: true, media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } }
    : mm(q);
} + ')()');

function push() {
  try {
    const c = JSON.parse(localStorage.getItem('ttc') || 'null');
    if (c && c.week === 'Actual' && c.id && c.d) ipcRenderer.send('sel', { id: c.id, ty: c.ty, d: { days: c.d.days, lessons: c.d.lessons } });
  } catch (e) {}
}

function decorate() {
  const css = document.createElement('style');
  css.textContent = '#inst{display:none!important}';
  document.head.appendChild(css);
  const pane = document.querySelector('[data-pane="more"]');
  if (!pane || document.getElementById('dkCard')) return;
  const card = document.createElement('div');
  card.className = 'g';
  card.id = 'dkCard';
  card.innerHTML = '<h3><i class="fas fa-desktop"></i> Aplikace pro počítač</h3><div class="mut" style="margin-bottom:10px">Mini okno, upozornění, spouštění po startu systému, export rozvrhu a klávesové zkratky.</div><button class="btn" style="width:100%">Funkce aplikace</button>';
  card.querySelector('button').onclick = () => ipcRenderer.send('welcome');
  pane.prepend(card);
}

setInterval(push, 20000);
window.addEventListener('DOMContentLoaded', () => { decorate(); setTimeout(push, 3000); });
