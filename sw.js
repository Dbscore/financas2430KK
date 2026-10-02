const VERSAO="financas-66b7e34f33";
const ARQUIVOS=["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSAO).then(c=>c.addAll(ARQUIVOS.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSAO).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// página: tenta a rede primeiro (pega atualizações) e cai no cache sem internet; o resto: cache primeiro
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  // SÓ o app e as bibliotecas da lista passam pelo cache. Todo o resto (Firebase/Firestore, OpenStreetMap…)
  // vai direto para a rede: antes, a leitura da nuvem também era guardada e o app lia SEMPRE a mesma
  // cópia velha dos dados (e chegava a enviar por cima da nuvem a partir dela).
  const u=new URL(e.request.url);
  if(u.origin!==self.location.origin&&!ARQUIVOS.includes(e.request.url))return;
  if(e.request.mode==="navigate"){
    // cache:"no-store": pula o cache HTTP do navegador (o GitHub Pages manda guardar por 10 min),
    // senão uma versão recém-publicada só aparecia depois desse tempo
    e.respondWith(fetch(e.request.url,{cache:"no-store",credentials:"same-origin"}).then(r=>{const c=r.clone();caches.open(VERSAO).then(x=>x.put("index.html",c));return r;}).catch(()=>caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(rr=>{const c=rr.clone();caches.open(VERSAO).then(x=>x.put(e.request,c));return rr;})));
});
