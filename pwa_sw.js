const CACHE = 'prop-immo-v2';
const ASSETS = [
  './',
  './proposition_commerciale.html',
  './pwa_manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(err => console.warn('Erreur mise en cache ASSETS:', err)))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // NE PAS intercepter les téléchargements locaux (Blob, data) ni les schémas de messagerie (mailto)
  if (e.request.url.startsWith('blob:') || e.request.url.startsWith('data:') || e.request.url.includes('mailto:')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
