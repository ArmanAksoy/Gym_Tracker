/* Keeps the app itself on the phone so it opens instantly and works with no
   signal. Your data is never cached here: requests to the sheet always go to
   the network, and the app queues them if you are offline. */
var CACHE = 'training-v1';
var SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; })
                           .map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  if (/script\.google(usercontent)?\.com/.test(e.request.url)) return;
  // Serve what we have immediately, fetch a newer copy in the background.
  // A new version of the app therefore shows up on the next open.
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(e.request).then(function(hit){
      var net = fetch(e.request).then(function(res){
        if (res && (res.ok || res.type === 'opaque')) c.put(e.request, res.clone());
        return res;
      }).catch(function(){ return hit; });
      return hit || net;
    });
  }));
});
