const C='stok-rumah-realtime-ayah-icon';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==C)await caches.delete(k);await self.clients.claim()})()));
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put('./index.html',c));return r}).catch(()=>caches.match('./index.html')));return;}e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});

self.addEventListener('install',event=>{
  event.waitUntil(caches.open('stok-rumah-realtime-ayah-icon').then(c=>c.addAll(['icon-192.png','icon-512.png'])).catch(()=>{}));
});
