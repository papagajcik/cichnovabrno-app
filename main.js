const { app, BrowserWindow, Tray, Menu, Notification, globalShortcut, ipcMain, shell, dialog, nativeImage, net, protocol, session, screen } = require('electron');
const path = require('path'), fs = require('fs'), os = require('os');
const { autoUpdater } = require('electron-updater');

const LIVE = 'https://cichnovabrno.papousek.eu/';
const APP_URL = LIVE + 'app-pc.html';
const API = 'https://cichnovainfo.papousek.eu/api.php';
const SHORTCUT = 'CommandOrControl+Alt+C';

const ICON = path.join(__dirname, 'build', 'icon.png');
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }]);

let win, mini, tray, quitting = false, TT = null, manualCheck = false;
const SF = () => path.join(app.getPath('userData'), 'settings.json');
let S = { notif: true, autostart: false, ttHash: {}, hitSeen: null };
try { S = Object.assign(S, JSON.parse(fs.readFileSync(SF(), 'utf8'))); } catch (e) {}
const save = () => { try { fs.writeFileSync(SF(), JSON.stringify(S)); } catch (e) {} };

if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => showWin());

const showWin = () => { if (!win) return; if (win.isMinimized()) win.restore(); win.show(); win.focus(); };
function notify(title, body) {
  if (S.notif === false || !Notification.isSupported()) return;
  const n = new Notification({ title, body, icon: ICON }); n.on('click', showWin); n.show();
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };
function createWin(hidden) {
  win = new BrowserWindow(Object.assign({ width: 1280, height: 820 }, S.bounds || {}, {
    minWidth: 900, minHeight: 600, title: 'Čichnova Brno', backgroundColor: '#0a0a2a', icon: ICON, show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true }
  }));
  win.setMenuBarVisibility(false);
  win.once('ready-to-show', () => { if (!hidden) win.show(); });
  win.on('close', e => { if (!quitting) { e.preventDefault(); win.hide(); } });
  let t; const sb = () => { clearTimeout(t); t = setTimeout(() => { if (!win.isMaximized() && !win.isMinimized()) { S.bounds = win.getBounds(); save(); } }, 600); };
  win.on('resize', sb); win.on('move', sb);
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!/^(app:|https:\/\/cichnovabrno\.papousek\.eu)/.test(url)) { e.preventDefault(); shell.openExternal(url); } });
  win.webContents.on('did-fail-load', (e, code, d, url, isMain) => { if (isMain && code !== -3 && !url.startsWith('app:')) win.loadURL('app://app/app-pc.html'); });
  win.loadURL(APP_URL);
  setInterval(() => {
    if (win && win.webContents.getURL().startsWith('app:')) net.fetch(APP_URL, { method: 'HEAD' }).then(r => { if (r.ok) win.loadURL(APP_URL); }).catch(() => {});
  }, 60000);
}

const mins = t => { const m = /(\d+):(\d+)/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : null; };
const fmt = m => m >= 60 ? Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '') : m + ' min';
function describe() {
  if (!TT || !TT.d) return { top: 'Rozvrh', t: 'Vyber třídu v aplikaci', m: 'Pak se tu ukáže aktuální hodina.', label: 'Čichnova Brno' };
  const d = new Date(), wd = (d.getDay() + 6) % 7, n = d.getHours() * 60 + d.getMinutes();
  const L = (TT.d.lessons || []).filter(l => l.day === wd && !l.removed && mins(l.from) != null).sort((a, b) => a.hour - b.hour);
  const cur = L.find(l => mins(l.from) <= n && n < mins(l.to)), l = cur || L.find(l => mins(l.from) > n);
  if (!l) { const t = L.length ? 'Dnes už je po škole' : 'Dnes bez hodin'; return { top: 'Dnes', t, m: '', label: t }; }
  const a = mins(l.from), b = mins(l.to), rem = cur ? b - n : a - n, name = l.subject || l.short || '?';
  const m = `${l.from}–${l.to} · učebna ${l.room || '?'} · ${cur ? 'zbývá' : 'za'} ${fmt(rem)}`;
  return { top: `${cur ? 'Teď' : 'Další'} · ${l.hour}. hodina`, t: name, m, pct: cur ? Math.round((n - a) / (b - a) * 100) : null,
    label: `${cur ? 'Teď' : 'Další'}: ${name} · ${cur ? 'zbývá' : 'za'} ${fmt(rem)}`, short: fmt(rem) };
}
function tick() {
  const s = describe();
  if (tray) { tray.setToolTip(s.label); if (process.platform === 'darwin') tray.setTitle(s.short || ''); }
  if (mini && !mini.isDestroyed()) mini.webContents.send('state', s);
}
ipcMain.on('sel', (e, c) => { const ch = !TT || TT.id !== c.id || TT.ty !== c.ty; if (ch || !TT.d) { TT = { id: c.id, ty: c.ty, d: c.d }; refreshTT(); } tick(); });
ipcMain.on('mini-close', () => mini && mini.close());

async function refreshTT() {
  if (!TT) return;
  try {
    const r = await net.fetch(`${LIVE}rozvrh.php?action=get&type=${TT.ty}&id=${encodeURIComponent(TT.id)}&week=Actual`), d = await r.json();
    if (!d || !d.ok || !d.lessons) return;
    TT.d = d; const key = TT.ty + ':' + TT.id, wk = ((d.days || [])[0] || {}).key || '';
    const h = JSON.stringify(d.lessons.map(l => [l.day, l.hour, l.from, l.to, l.subject || l.short, l.room, l.teacher, l.removed, l.group]));
    const old = S.ttHash[key];
    if (old && old.wk === wk && old.h !== h) notify('Rozvrh se změnil', 'V aktuálním týdnu došlo ke změně v rozvrhu.');
    S.ttHash[key] = { wk, h }; save(); tick();
  } catch (e) {}
}
async function pollHit() {
  try {
    const d = await (await net.fetch(API + '?resource=hitparada&op=list')).json(), week = d.week || [];
    if (S.hitSeen) { const nw = week.filter(s => !S.hitSeen.includes(s.id)); if (nw.length) notify('HitParáda – hraje tento týden', nw.map(s => s.title + (s.artist ? ' – ' + s.artist : '')).join('\n')); }
    S.hitSeen = week.map(s => s.id); save();
  } catch (e) {}
}

function exportIcs() {
  if (!TT || !TT.d || !TT.d.lessons) return dialog.showMessageBox({ message: 'Nejdřív v aplikaci vyber třídu a otevři rozvrh.' });
  const now = new Date(), p = n => String(n).padStart(2, '0'), esc = s => String(s || '').replace(/[\\;,]/g, '\\$&').replace(/\n/g, '\\n');
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cichnova Brno//CS', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Rozvrh'], stamp = now.toISOString().replace(/[-:]|\.\d+/g, '');
  TT.d.lessons.forEach((l, i) => {
    if (l.removed) return;
    const m = /(\d+)\.\s*(\d+)\./.exec(((TT.d.days || [])[l.day] || {}).key || ''), f = mins(l.from), t = mins(l.to); if (!m || f == null || t == null) return;
    let y = now.getFullYear(), best = 1e18;
    [y - 1, y, y + 1].forEach(c => { const dist = Math.abs(new Date(c, m[2] - 1, m[1]) - now); if (dist < best) { best = dist; y = c; } });
    const dt = mm => `${y}${p(m[2])}${p(m[1])}T${p(Math.floor(mm / 60))}${p(mm % 60)}00`;
    L.push('BEGIN:VEVENT', `UID:${y}${p(m[2])}${p(m[1])}-${l.hour}-${i}@cichnova`, `DTSTAMP:${stamp}`, `DTSTART:${dt(f)}`, `DTEND:${dt(t)}`,
      `SUMMARY:${esc(l.subject || l.short)}`, `LOCATION:${esc(l.room)}`, `DESCRIPTION:${esc(l.teacher || l.top || l.group)}`, 'END:VEVENT');
  });
  L.push('END:VCALENDAR');
  dialog.showSaveDialog({ defaultPath: 'rozvrh.ics', filters: [{ name: 'Kalendář', extensions: ['ics'] }] })
    .then(r => { if (!r.canceled) fs.writeFileSync(r.filePath, L.join('\r\n')); });
}

function setAuto(on) {
  S.autostart = on; save();
  if (process.platform === 'linux') {
    const f = path.join(os.homedir(), '.config', 'autostart', 'cichnova-brno.desktop');
    if (on) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `[Desktop Entry]\nType=Application\nName=Čichnova Brno\nExec="${process.env.APPIMAGE || process.execPath}" --hidden\nX-GNOME-Autostart-enabled=true\n`); }
    else fs.rmSync(f, { force: true });
  } else app.setLoginItemSettings({ openAtLogin: on, args: ['--hidden'] });
}
function toggleMini() {
  if (mini && !mini.isDestroyed()) { mini.close(); return; }
  const w = screen.getPrimaryDisplay().workArea;
  mini = new BrowserWindow({ width: 280, height: 120, x: w.x + w.width - 300, y: w.y + w.height - 140, frame: false, alwaysOnTop: true, resizable: false, skipTaskbar: true,
    backgroundColor: '#0a0a2a', webPreferences: { preload: path.join(__dirname, 'mini-preload.js'), contextIsolation: true, sandbox: true } });
  mini.setAlwaysOnTop(true, 'floating'); mini.loadFile('mini.html');
  mini.webContents.on('did-finish-load', tick); mini.on('closed', () => { mini = null; buildMenu(); }); buildMenu();
}
function releasesUrl() {
  try { const y = fs.readFileSync(path.join(process.resourcesPath, 'app-update.yml'), 'utf8'); return `https://github.com/${/owner: (.+)/.exec(y)[1].trim()}/${/repo: (.+)/.exec(y)[1].trim()}/releases/latest`; } catch (e) { return null; }
}
function initUpdater() {
  autoUpdater.autoDownload = process.platform !== 'darwin';
  autoUpdater.on('update-available', i => {
    if (process.platform === 'darwin') dialog.showMessageBox({ message: `Je dostupná nová verze ${i.version}.`, buttons: ['Stáhnout', 'Později'] }).then(r => { const u = releasesUrl(); if (r.response === 0 && u) shell.openExternal(u); });
    else notify('Aktualizace', `Stahuji verzi ${i.version}…`);
  });
  autoUpdater.on('update-downloaded', i => dialog.showMessageBox({ message: `Verze ${i.version} je připravená k instalaci.`, buttons: ['Restartovat a nainstalovat', 'Později'] })
    .then(r => { if (r.response === 0) { quitting = true; autoUpdater.quitAndInstall(); } }));
  autoUpdater.on('update-not-available', () => { if (manualCheck) dialog.showMessageBox({ message: 'Máš nejnovější verzi.' }); manualCheck = false; });
  autoUpdater.on('error', e => { if (manualCheck) dialog.showMessageBox({ type: 'error', message: 'Aktualizaci se nepodařilo zkontrolovat.', detail: String(e && e.message || e) }); manualCheck = false; });
  autoUpdater.checkForUpdates().catch(() => {});
  setInterval(() => autoUpdater.checkForUpdates().catch(() => {}), 6 * 3600 * 1000);
}
function buildMenu() {
  if (!tray) return;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Otevřít Čichnova Brno', click: showWin },
    { label: mini && !mini.isDestroyed() ? 'Skrýt mini okno' : 'Mini okno „Teď / Další hodina“', click: toggleMini },
    { label: 'Exportovat rozvrh do kalendáře (.ics)', click: exportIcs },
    { type: 'separator' },
    { label: 'Notifikace', type: 'checkbox', checked: S.notif !== false, click: m => { S.notif = m.checked; save(); } },
    { label: 'Spouštět po startu systému', type: 'checkbox', checked: !!S.autostart, click: m => setAuto(m.checked) },
    { label: 'Zkontrolovat aktualizace', enabled: app.isPackaged, click: () => { manualCheck = true; autoUpdater.checkForUpdates().catch(() => {}); } },
    { type: 'separator' },
    { label: 'Ukončit', click: () => { quitting = true; app.quit(); } }
  ]));
}

app.whenReady().then(() => {
  protocol.handle('app', req => {
    const u = new URL(req.url), root = path.join(__dirname, 'app');
    if (u.pathname === '/rozvrh.php') return net.fetch(LIVE + 'rozvrh.php' + u.search);
    const f = path.join(root, path.normalize(decodeURIComponent(u.pathname === '/' ? '/app-pc.html' : u.pathname)));
    if (!f.startsWith(root)) return new Response('', { status: 403 });
    try { return new Response(fs.readFileSync(f), { headers: { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' } }); } catch (e) { return new Response('', { status: 404 }); }
  });
  session.defaultSession.webRequest.onHeadersReceived({ urls: ['https://cichnovainfo.papousek.eu/*'] }, (d, cb) => {
    const h = d.responseHeaders;
    if (win && win.webContents.getURL().startsWith('app:')) {
      Object.keys(h).forEach(k => { if (/^access-control-/i.test(k)) delete h[k]; });
      h['Access-Control-Allow-Origin'] = ['app://app']; h['Access-Control-Allow-Headers'] = ['Content-Type']; h['Access-Control-Allow-Methods'] = ['GET,POST,OPTIONS'];
    }
    cb({ responseHeaders: h });
  });
  tray = new Tray(nativeImage.createFromPath(ICON).resize({ width: 18, height: 18 }));
  tray.setToolTip('Čichnova Brno'); tray.on('click', showWin); buildMenu();
  createWin(process.argv.includes('--hidden') || app.getLoginItemSettings().wasOpenedAtLogin);
  globalShortcut.register(SHORTCUT, () => (win.isVisible() && win.isFocused()) ? win.hide() : showWin());
  setInterval(tick, 15000); setInterval(refreshTT, 15 * 60000); setInterval(pollHit, 5 * 60000); pollHit();
  if (app.isPackaged) initUpdater();
});
app.on('before-quit', () => { quitting = true; });
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('activate', showWin);
app.on('window-all-closed', () => {});
