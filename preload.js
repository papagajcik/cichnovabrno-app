// Hlavní okno: pošle do hlavního procesu vybranou třídu/učitele a jeho rozvrh (z localStorage aplikace).
const { ipcRenderer } = require('electron');
function push() {
  try {
    const c = JSON.parse(localStorage.getItem('ttc') || 'null');
    if (c && c.week === 'Actual' && c.id && c.d) ipcRenderer.send('sel', { id: c.id, ty: c.ty, d: { days: c.d.days, lessons: c.d.lessons } });
  } catch (e) {}
}
setInterval(push, 20000);
window.addEventListener('DOMContentLoaded', () => setTimeout(push, 3000));
