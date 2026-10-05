// shared/tv-api.js — data pro televizní obrazovky z PHP API (nahrazuje Firebase / Firestore).
// Veřejné volání resource=tv_data (bez přihlášení); obrazovky si data každých pár sekund obnovují.
(function () {
  const API = 'https://cichnovainfo.papousek.eu/api.php';
  window.TvApi = {
    async fetch(tvId) {
      const r = await fetch(API + '?resource=tv_data&op=get&tv=' + encodeURIComponent(tvId), { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }
  };
})();