// shared/api-shim.js — nahrazuje Firebase (Auth + Firestore) voláním PHP API na cichnovainfo.
// Admin i přihlášení používají stejné rozhraní (auth.*, db.collection(...)), takže jejich kód zůstává beze změny.
(function () {
  const API = 'https://cichnovainfo.papousek.eu/api.php';
  const call = async (res, op, body, q) => {
    const r = await fetch(`${API}?resource=${res}&op=${op}${q || ''}`, {
      method: body ? 'POST' : 'GET', credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(d.error || ('HTTP ' + r.status)); e.status = r.status; if (r.status === 401) e.code = 'auth/wrong-password'; if (r.status === 422) e.code = 'auth/invalid-code'; throw e; }
    return d;
  };
  class TS { constructor(s) { this.s = s; } toDate() { return new Date(this.s * 1000); } }
  const SERVER_TS = { __serverTs: true };
  const TVS = ['vratnice', 'infocentrum', 'domovmladeze'];
  const roleOut = u => u.role === 'superadmin' ? 'superadmin'
    : (u.devices || []).length === 1 && u.devices[0] === 'hitparada' ? 'admin_hitparada'
    : (u.devices || []).length === 1 && TVS.includes(u.devices[0]) ? ({ vratnice: 'admin_vratnice', infocentrum: 'admin_infocentrum', domovmladeze: 'admin_dm' })[u.devices[0]] : 'editor';
  const snap = docs => ({ docs, empty: !docs.length, size: docs.length, forEach: f => docs.forEach(f) });
  const mkDoc = (id, data, col) => ({ id: String(id), exists: !!data, data: () => data, ref: { collection: col, id: String(id) } });
  const clean = o => { const r = {}; for (const k in o) if (o[k] !== SERVER_TS) r[k] = o[k]; return r; };

  const loaders = {
    tvs: async () => (await call('tvs', 'list')).map(t => mkDoc(t.id, { name: t.name, currentMode: t.current_mode, customUrl: t.custom_url, settings: t.settings || {} }, 'tvs')),
    news: async lim => (await call('news', 'list', null, lim ? '&limit=' + lim : '')).map(n => mkDoc(n.id, { title: n.title, body: n.body, image: n.image, type: n.type, timestamp: new TS(n.ts), tvIds: n.tv_ids ? String(n.tv_ids).split(',').filter(Boolean) : [] }, 'news')),
    photos: async () => (await call('photos', 'list')).map(p => mkDoc(p.id, { album: p.album, url: p.url, desc: p.desc, timestamp: new TS(p.ts) }, 'photos')),
    modes: async () => (await call('tv_modes', 'list')).map(m => mkDoc(m.id, { name: m.name, url: m.url, createdBy: m.created_by }, 'modes')),
    users: async () => { try { return (await call('users', 'list')).map(u => mkDoc(u.id, { email: u.email, role: roleOut(u), managedTvs: u.devices || [] }, 'users')); } catch (e) { if (e.status === 403) return []; throw e; } }
  };
  const writers = {
    tvs: { update: (id, d) => call('tvs', 'update', { id, ...('currentMode' in d ? { current_mode: d.currentMode } : {}), ...('customUrl' in d ? { custom_url: d.customUrl } : {}), ...('settings' in d ? { settings: d.settings } : {}) }) },
    news: { add: d => { const { tvIds, ...r } = clean(d); return call('news', 'create', { ...r, tv_ids: tvIds || [] }); },
      update: (id, d) => call('news', 'update', { id: +id, title: d.title, body: d.body, image: d.image || '', type: d.type || '', tv_ids: d.tvIds || [] }),
      delete: id => call('news', 'delete', { id: +id }) },
    photos: { add: d => d.desc === '__album_placeholder__' ? call('photos', 'album_create', { name: d.album }) : call('photos', 'create', clean(d)), delete: id => call('photos', 'delete', { id: +id }) },
    modes: { add: d => call('tv_modes', 'create', { name: d.name, url: d.url }), delete: id => call('tv_modes', 'delete', { id: +id }) },
    users: { delete: id => call('users', 'delete', { id: +id }),
      set: (id, d) => call('users', 'update_access', { id: +id, role: d.role === 'superadmin' ? 'superadmin' : 'admin', devices: d.managedTvs || [] }) }
  };

  function query(col, st) {
    st = st || { filters: [], lim: 0 };
    const q = {
      where: (f, op, v) => query(col, { ...st, filters: [...st.filters, [f, v]] }),
      orderBy: () => q, limit: n => query(col, { ...st, lim: n }),
      get: async () => {
        let docs = await loaders[col](col === 'news' ? st.lim : 0);
        st.filters.forEach(([f, v]) => { docs = docs.filter(d => d.data()[f] === v); });
        if (st.lim) docs = docs.slice(0, st.lim);
        return snap(docs);
      }
    };
    return q;
  }
  const db = {
    collection: col => ({
      ...query(col),
      add: d => writers[col].add(d),
      doc: id => ({
        id: String(id),
        get: async () => {
          if (col === 'users' && auth.currentUser && String(id) === auth.currentUser.uid) { const u = auth.currentUser; return mkDoc(u.uid, { email: u.email, role: roleOut(u), managedTvs: u.devices }, 'users'); }
          const f = (await loaders[col]()).find(d => d.id === String(id)); return f || mkDoc(id, null, col);
        },
        update: d => writers[col].update(id, d), set: d => writers[col].set(id, d), delete: () => writers[col].delete(id)
      })
    }),
    batch: () => { const ops = []; return { delete: ref => ops.push(writers[ref.collection].delete(ref.id)), commit: () => Promise.all(ops) }; }
  };

  const listeners = [];
  const toUser = me => me.logged_in ? { uid: String(me.id), email: me.email, role: me.role, devices: me.devices || [] } : null;
  const auth = {
    currentUser: null,
    setPersistence: async () => {},
    // Po úspěšném přihlášení (heslo, nebo heslo + kód z e-mailu) načte uživatele a upozorní posluchače.
    _finish: async () => { auth.currentUser = toUser(await call('auth', 'me')); listeners.forEach(f => f(auth.currentUser)); return { user: auth.currentUser }; },
    // Nové zařízení: server pošle kód e-mailem a vyhodí se chyba 'auth/tfa-required' (pokračuje se přes verifyTfa).
    signInWithEmailAndPassword: async (email, password) => {
      const r = await call('auth', 'login', { email, password });
      if (r.tfa) { const e = new Error('Je potřeba ověřovací kód z e-mailu.'); e.code = 'auth/tfa-required'; e.emailHint = r.email_hint; throw e; }
      return auth._finish();
    },
    verifyTfa: async (code, remember) => { await call('auth', 'verify_2fa', { code, remember: !!remember }); return auth._finish(); },
    resendTfa: () => call('auth', 'resend_2fa', {}),
    createUserWithEmailAndPassword: async (email, password) => ({ user: { uid: String((await call('users', 'create', { email, password, role: 'admin', devices: [] })).id) } }),
    signOut: async () => { await call('auth', 'logout', {}); auth.currentUser = null; listeners.forEach(f => f(null)); },
    onAuthStateChanged: f => { listeners.push(f); call('auth', 'me').then(me => { auth.currentUser = toUser(me); f(auth.currentUser); }).catch(() => f(null)); }
  };

  const firestore = () => db; firestore.FieldValue = { serverTimestamp: () => SERVER_TS };
  window.apiCall = call; // přímé volání API (kiosk: režimy, tlačítka, nastavení, PIN)
  window.firebase = { apps: [{}], initializeApp() {}, auth: () => auth, firestore };
  window.auth = auth; window.db = db;
  window.getCurrentUserWithRole = async () => auth.currentUser && { uid: auth.currentUser.uid, email: auth.currentUser.email, role: roleOut(auth.currentUser), managedTvs: auth.currentUser.devices };
})();