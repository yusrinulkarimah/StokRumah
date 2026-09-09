const CACHE='stok-rumah-v2.5-stable';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())await caches.delete(k);await self.clients.claim();})()));
self.addEventListener('fetch',e=>{
 if(e.request.mode==='navigate'){
   e.respondWith(fetch(e.request,{cache:'reload'}).catch(()=>caches.match('./index.html')));
 }
});
