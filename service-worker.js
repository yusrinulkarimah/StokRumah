const CACHE='stok-rumah-v2.3.2';
const CORE=['./manifest.json','./icon.svg','./app.js?v=2.3.2'];
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req,{cache:'no-store'}).then(r=>{
      const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return r;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(fetch(req).then(r=>{
    const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));return r;
  }).catch(()=>caches.match(req)));
});
