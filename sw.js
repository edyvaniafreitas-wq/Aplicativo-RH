/**
 * Service Worker: Monte Sua Equipe
 * Cache de telas e assets estáticos para funcionamento offline
 * DIRETRIZ LGPD: NUNCA armazena em cache dados pessoais ou respostas do formulário
 */

const CACHE_NAME = 'mse-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/data/constants.js',
  './js/data/storage.js',
  './js/modules/cv-parser.js',
  './js/modules/cv-analyzer.js',
  './js/modules/disc-engine.js',
  './js/modules/matching-engine.js',
  './js/modules/talent-search.js',
  './js/modules/processes.js',
  './js/modules/admin.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Apenas intercepta requisições GET para assets estáticos
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      return caches.match('./index.html');
    })
  );
});
