const CORE = 'enade-core-v1';
const CORE_FILES = ['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png',
  'vendor/marked.min.js','vendor/tex-svg-full.js','vendor/fonts.css',
  'vendor/fonts/AtkinsonHyperlegible-400.woff2','vendor/fonts/AtkinsonHyperlegible-400i.woff2','vendor/fonts/AtkinsonHyperlegible-700.woff2',
  'vendor/fonts/BarlowCondensed-500.woff2','vendor/fonts/BarlowCondensed-600.woff2','vendor/fonts/BarlowCondensed-700.woff2',
  'vendor/fonts/JetBrainsMono-400.woff2','vendor/fonts/JetBrainsMono-600.woff2'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CORE).then(c => c.addAll(CORE_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('enade-core-') && k !== CORE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // rede primeiro para receber atualizações; sem internet, usa a cópia salva
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CORE).then(c => c.put('index.html', copy)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(req.url.includes('/img/') ? 'enade-img-v1' : CORE).then(c => c.put(req, copy)); }
    return r;
  })));
});
