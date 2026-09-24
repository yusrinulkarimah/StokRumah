








const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],KEY='stokrumah-v20-data';
const cats=['Dapur','Toilet','Laundry','Obat','Baby','Beauty'],units=['pcs','pack','box','botol','pouch','tube','strip','tablet','kapsul','sachet','gram','kg','ml','L','kaleng'],paoCats=['Beauty','Baby','Obat'],icons={
Dapur:`<svg viewBox='0 0 24 24'><path d='M5 10h14v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z'/><path d='M8 10V7m4 3V5m4 5V7'/></svg>`,
Toilet:`<svg viewBox='0 0 24 24'><path d='M9 4h6v4H9z'/><path d='M7 8h10v12H7z'/><path d='M10 12h4'/></svg>`,
Laundry:`<svg viewBox='0 0 24 24'><path d='M5 7h14l-1 13H6z'/><path d='M8 7V4h8v3'/><path d='M8 12h8'/></svg>`,
Obat:`<svg viewBox='0 0 24 24'><path d='M8 12h8'/><path d='M12 8v8'/><rect x='5' y='5' width='14' height='14' rx='4'/></svg>`,
Baby:`<svg viewBox='0 0 24 24'><circle cx='12' cy='11' r='5'/><path d='M9 16v3m6-3v3M9 9c1-2 5-2 6 0'/></svg>`,
Beauty:`<svg viewBox='0 0 24 24'><path d='M9 4h6v5H9z'/><path d='M8 9h8v11H8z'/><path d='M10 13h4'/></svg>`};
const demo={items:[{id:1,name:'Beras',category:'Dapur',qty:1.5,min:2,unit:'kg',expiry:'2026-10-20',location:'Dapur',note:'',opened:'',pao:''},{id:2,name:'Minyak Goreng',category:'Dapur',qty:600,min:1000,unit:'ml',expiry:'2027-02-01',location:'Dapur',note:'',opened:'',pao:''},{id:3,name:'Gula Pasir',category:'Dapur',qty:0,min:1,unit:'kg',expiry:'2027-01-15',location:'Dapur',note:'',opened:'',pao:''},{id:4,name:'Popok M',category:'Baby',qty:18,min:20,unit:'pcs',expiry:'2027-06-01',location:'Lemari Baby',note:'Untuk pemakaian malam',opened:'',pao:''},{id:5,name:'Detergen Bubuk',category:'Laundry',qty:1,min:2,unit:'pouch',expiry:'',location:'Laundry',note:'',opened:'',pao:''},{id:6,name:'Sampo',category:'Beauty',qty:1,min:2,unit:'botol',expiry:'2027-08-01',location:'Kamar mandi',note:'',opened:'2026-08-01',pao:'12M'},{id:7,name:'Paracetamol',category:'Obat',qty:5,min:10,unit:'tablet',expiry:'2026-09-20',location:'Kotak obat',note:'',opened:'',pao:''},{id:8,name:'Pasta Gigi',category:'Toilet',qty:1,min:2,unit:'tube',expiry:'2027-05-01',location:'Kamar mandi',note:'',opened:'',pao:''}],shopping:[],shopHistory:[{id:101,name:'Susu Formula',category:'Baby',qty:1,unit:'kaleng',price:0,date:'2026-08-28T19:45:00'}],stockHistory:[{id:201,name:'Popok M',type:'out',qty:2,unit:'pcs',date:'2026-08-29T08:30:00'}],dismissedShopping:[]};
function cloneDemo(){return JSON.parse(JSON.stringify(demo))}
let data;
try{const raw=localStorage.getItem(KEY);data=raw?JSON.parse(raw):cloneDemo()}catch(e){data=cloneDemo()}
if(!data||typeof data!=='object')data=cloneDemo();
data.items=Array.isArray(data.items)?data.items:[];data.shopping=Array.isArray(data.shopping)?data.shopping:[];data.shopHistory=Array.isArray(data.shopHistory)?data.shopHistory:[];data.stockHistory=Array.isArray(data.stockHistory)?data.stockHistory:[];data.dismissedShopping=Array.isArray(data.dismissedShopping)?data.dismissedShopping:[];
data.items.forEach(x=>{if(x.category==='Baby Kids')x.category='Baby'});
data.shopping.forEach(x=>{if(x.category==='Baby Kids')x.category='Baby';if(typeof x.checked!=='boolean')x.checked=false;if(!Number.isFinite(Number(x.qty)))x.qty=1;if(!Number.isFinite(Number(x.price)))x.price=0});
let stockFilter='all',stockStatusFilter='all',histMode='shop',expiryOnly=false,searchTerm='';
function pruneHistory(){
  const cutoff=new Date();
  cutoff.setMonth(cutoff.getMonth()-6);
  const limit=cutoff.getTime();
  data.shopHistory=(data.shopHistory||[]).filter(h=>!h.date||new Date(h.date).getTime()>=limit);
  data.stockHistory=(data.stockHistory||[]).filter(h=>!h.date||new Date(h.date).getTime()>=limit);
}

const SUPABASE_URL="https://uduxugyvvqmxbzznqdmu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_9kz1C-zW9Eefsfj1ZsZn5Q_djk9TdPs";
const SR_SESSION_KEY='stokrumah_supabase_session';
const SR_DIRTY_KEY='stokrumah_cloud_dirty';

let srCurrentUser=null,srBaseline=null,srApplyingRemote=false,srDirty=localStorage.getItem(SR_DIRTY_KEY)==='1';
let srSyncTimer=null,srSyncBusy=false,srSyncAgain=false,srLastError='';

function srClone(v){return JSON.parse(JSON.stringify(v))}
function srState(){return srClone(data)}
function srNormalizeState(v){
  const x=(v&&typeof v==='object')?srClone(v):{};
  x.items=Array.isArray(x.items)?x.items:[];
  x.shopping=Array.isArray(x.shopping)?x.shopping:[];
  x.shopHistory=Array.isArray(x.shopHistory)?x.shopHistory:[];
  x.stockHistory=Array.isArray(x.stockHistory)?x.stockHistory:[];
  x.dismissedShopping=Array.isArray(x.dismissedShopping)?x.dismissedShopping:[];
  x.items.forEach(i=>{if(i.category==='Baby Kids')i.category='Baby'});
  x.shopping.forEach(i=>{if(i.category==='Baby Kids')i.category='Baby';if(typeof i.checked!=='boolean')i.checked=false});
  return x;
}
function srGetSession(){try{return JSON.parse(localStorage.getItem(SR_SESSION_KEY)||'null')}catch(e){return null}}
function srSaveSession(s){localStorage.setItem(SR_SESSION_KEY,JSON.stringify(s))}
function srClearSession(){localStorage.removeItem(SR_SESSION_KEY)}
async function srAuthRequest(path,body){
  const res=await fetch(SUPABASE_URL+'/auth/v1/'+path,{method:'POST',cache:'no-store',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify(body||{})});
  const text=await res.text();let d=null;try{d=text?JSON.parse(text):null}catch(e){d=text}
  if(!res.ok)throw new Error((d&&((d.msg)||(d.message)||(d.error_description)))||text||('HTTP '+res.status));
  return d;
}
async function srRefreshSession(){
  const old=srGetSession();if(!old?.refresh_token)throw new Error('Sesi login tidak ditemukan');
  const d=await srAuthRequest('token?grant_type=refresh_token',{refresh_token:old.refresh_token});
  const s={access_token:d.access_token,refresh_token:d.refresh_token,user:d.user,expires_at:Date.now()+Number(d.expires_in||3600)*1000};
  srSaveSession(s);srCurrentUser=s.user||null;srUpdateGreeting();go('home');return s;
}
async function srActiveSession(){
  let s=srGetSession();if(!s?.access_token)throw new Error('Sesi login tidak ditemukan');
  if(!s.expires_at||Date.now()>s.expires_at-60000)s=await srRefreshSession();
  srCurrentUser=s.user||null;return s;
}
async function srDb({method='GET',query='',body=null,prefer='return=representation'}={}){
  let s=await srActiveSession();
  const request=()=>fetch(SUPABASE_URL+'/rest/v1/stokrumah_entities'+query,{method,cache:'no-store',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+s.access_token,'Content-Type':'application/json',Prefer:prefer},body:body===null?undefined:JSON.stringify(body)});
  let res=await request();if(res.status===401){s=await srRefreshSession();res=await request()}
  const text=await res.text();let d=null;try{d=text?JSON.parse(text):null}catch(e){d=text}
  if(!res.ok)throw new Error((d&&d.message)||text||('Database '+res.status));return d;
}
function srStatus(text,type='busy',detail=''){
  const pill=document.getElementById('srAccountPill'),dot=document.getElementById('srAccountDot'),status=document.getElementById('srAccountStatus');
  const mdot=document.getElementById('srMenuDot'),mstatus=document.getElementById('srMenuStatus'),mdetail=document.getElementById('srMenuDetail');
  if(srCurrentUser&&pill)pill.style.display='flex';
  const color=type==='ok'?'#42b77a':type==='err'?'#df5968':'#e5a23c';
  [dot,mdot].forEach(x=>{if(x)x.style.background=color});
  if(status)status.textContent=text;if(mstatus)mstatus.textContent=text;if(mdetail)mdetail.textContent=detail||(type==='ok'?'Data keluarga sama di semua perangkat':srLastError||'Menghubungkan ke Supabase');
}
function srRows(state){
  const rows=[];
  const push=(type,arr)=>{(arr||[]).forEach(x=>rows.push({entity_type:type,entity_id:String(x.id),payload:x}))};
  push('item',state.items);push('shopping',state.shopping);push('shop_history',state.shopHistory);push('stock_history',state.stockHistory);
  rows.push({entity_type:'meta',entity_id:'dismissed',payload:{values:state.dismissedShopping||[]}});
  return rows;
}
function srRowsMap(state){
  const m=new Map();srRows(state).forEach(r=>m.set(r.entity_type+'|'+r.entity_id,r));return m;
}
function srRebuild(rows){
  const s={items:[],shopping:[],shopHistory:[],stockHistory:[],dismissedShopping:[]};
  (rows||[]).forEach(r=>{
    const p=r.payload||{};
    if(r.entity_type==='item')s.items.push(p);
    else if(r.entity_type==='shopping')s.shopping.push(p);
    else if(r.entity_type==='shop_history')s.shopHistory.push(p);
    else if(r.entity_type==='stock_history')s.stockHistory.push(p);
    else if(r.entity_type==='meta'&&r.entity_id==='dismissed')s.dismissedShopping=Array.isArray(p.values)?p.values:[];
  });
  return srNormalizeState(s);
}
function srDiff(oldState,newState){
  const oldM=srRowsMap(oldState||{items:[],shopping:[],shopHistory:[],stockHistory:[],dismissedShopping:[]}),newM=srRowsMap(newState);
  const up=[],del=[];
  newM.forEach((r,k)=>{const o=oldM.get(k);if(!o||JSON.stringify(o.payload)!==JSON.stringify(r.payload))up.push(r)});
  oldM.forEach((r,k)=>{if(!newM.has(k))del.push(r)});
  return {up,del};
}
async function srUpsert(rows){
  if(!rows.length)return;
  const now=new Date().toISOString();
  const body=rows.map(r=>({...r,updated_at:now,updated_by:srCurrentUser?.id||null}));
  await srDb({method:'POST',query:'?on_conflict=entity_type,entity_id',body,prefer:'resolution=merge-duplicates,return=minimal'});
}
async function srDelete(rows){
  for(const r of rows){
    await srDb({method:'DELETE',query:'?entity_type=eq.'+encodeURIComponent(r.entity_type)+'&entity_id=eq.'+encodeURIComponent(r.entity_id),prefer:'return=minimal'});
  }
}
function srMarkDirty(){
  if(srApplyingRemote||!srCurrentUser)return;
  srDirty=true;localStorage.setItem(SR_DIRTY_KEY,'1');srStatus('Menyimpan...','busy','Mengirim perubahan ke data keluarga');
  clearTimeout(srSyncTimer);srSyncTimer=setTimeout(srFlush,450);
}
async function srFlush(){
  if(!srCurrentUser||!srBaseline||srSyncBusy)return;
  srSyncBusy=true;const captured=srState();
  try{
    const d=srDiff(srBaseline,captured);await srUpsert(d.up);await srDelete(d.del);
    srBaseline=srClone(captured);srDirty=false;localStorage.removeItem(SR_DIRTY_KEY);srLastError='';srStatus('Tersinkron','ok');
  }catch(e){
    srLastError=e.message||String(e);srStatus('Gagal sinkron','err',srLastError);
  }finally{
    srSyncBusy=false;if(srSyncAgain){srSyncAgain=false;setTimeout(srFlush,250)}
  }
}
async function srLoadCloud(){
  const rows=await srDb({query:'?select=entity_type,entity_id,payload,updated_at&order=updated_at.asc'});
  if(!rows||!rows.length){
    srBaseline={items:[],shopping:[],shopHistory:[],stockHistory:[],dismissedShopping:[]};
    srDirty=true;await srFlush();return;
  }
  const remote=srRebuild(rows);
  srApplyingRemote=true;data=remote;pruneHistory();localStorage.setItem(KEY,JSON.stringify(data));render();srApplyingRemote=false;
  srBaseline=srClone(remote);srDirty=false;localStorage.removeItem(SR_DIRTY_KEY);
}
async function srPoll(){
  if(!srCurrentUser||srSyncBusy||srDirty)return;
  try{await srLoadCloud();srStatus('Tersinkron','ok')}catch(e){srLastError=e.message||String(e);srStatus('Koneksi terputus','err',srLastError)}
}
function srStartPolling(){
  if(window.__srPoll)clearInterval(window.__srPoll);
  window.__srPoll=setInterval(()=>{if(!document.hidden)srPoll()},3000);
}

function srUpdateGreeting(){
  const el=document.getElementById('welcomeGreeting');
  if(!el)return;
  const email=(srCurrentUser?.email||'').trim().toLowerCase();
  el.textContent=email==='zuaimrusydi19@gmail.com'?'Halo, Ayah! 👋':'Halo, Ibu! 👋';
}

async function srLogin(){
  const email=document.getElementById('srLoginEmail').value.trim(),password=document.getElementById('srLoginPassword').value;
  const btn=document.getElementById('srLoginBtn'),msg=document.getElementById('srLoginMsg');msg.textContent='';
  if(!email||!password){msg.textContent='Masukkan email dan password.';return}
  btn.disabled=true;btn.textContent='Sedang masuk...';
  try{
    const d=await srAuthRequest('token?grant_type=password',{email,password});
    const s={access_token:d.access_token,refresh_token:d.refresh_token,user:d.user,expires_at:Date.now()+Number(d.expires_in||3600)*1000};
    srSaveSession(s);srCurrentUser=s.user||null;
    document.getElementById('authGate').classList.add('hidden');
    document.getElementById('srAccountEmail').textContent=srCurrentUser?.email||email;
    srStatus('Mengambil data...','busy','Memuat stok keluarga');
    await srLoadCloud();srStatus('Tersinkron','ok');srStartPolling();
  }catch(e){msg.textContent='Login gagal: '+(e.message||'coba lagi.')}finally{btn.disabled=false;btn.textContent='Masuk ke Stok Rumah'}
}
async function srLogout(){
  if(window.__srPoll)clearInterval(window.__srPoll);
  srClearSession();srCurrentUser=null;srUpdateGreeting();srBaseline=null;srDirty=false;localStorage.removeItem(SR_DIRTY_KEY);
  document.getElementById('srAccountMenu').classList.remove('show');
  document.getElementById('srAccountPill').style.display='none';
  document.getElementById('authGate').classList.remove('hidden');
  document.getElementById('srLoginPassword').value='';
}
async function srInitRealtime(){
  const gate=document.getElementById('authGate');
  try{
    let s=srGetSession();if(!s?.access_token){gate.classList.remove('hidden');return}
    if(!s.expires_at||Date.now()>s.expires_at-60000)s=await srRefreshSession();
    srCurrentUser=s.user||null;srUpdateGreeting();go('home');gate.classList.add('hidden');
    document.getElementById('srAccountEmail').textContent=srCurrentUser?.email||'';
    srStatus('Mengambil data...','busy','Memuat stok keluarga');
    if(srDirty){srBaseline=srClone(srState());await srFlush()}
    await srLoadCloud();srStatus('Tersinkron','ok');srStartPolling();
  }catch(e){
    srLastError=e.message||String(e);
    if(/sesi login|refresh token|invalid/i.test(srLastError)){srClearSession();srCurrentUser=null;gate.classList.remove('hidden')}
    else{gate.classList.add('hidden');srStatus('Koneksi bermasalah','err',srLastError);srStartPolling()}
  }
}

const save=()=>{pruneHistory();try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){console.error(e)}srMarkDirty()},uid=()=>Date.now()+Math.floor(Math.random()*100000);
const esc=(v='')=>String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function toast(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>t.classList.remove('show'),1700)}
function status(x){return +x.qty<=0?'out':+x.qty<=+x.min?'low':'safe'}
function fmt(v){return v?new Date(v+'T00:00:00').toLocaleDateString('id-ID'):'-'}
function dayDiff(v){if(!v)return 99999;let d=new Date(v+'T00:00:00'),n=new Date();n.setHours(0,0,0,0);return Math.ceil((d-n)/86400000)}
function paoLimit(x){if(!x.opened||!x.pao)return '';let d=new Date(x.opened+'T00:00:00');d.setMonth(d.getMonth()+parseInt(x.pao));return d.toISOString().slice(0,10)}
function effExp(x){return [x.expiry,paoLimit(x)].filter(Boolean).sort()[0]||''}
function syncShopping(){
  const safeIds=new Set(data.items.filter(x=>status(x)==='safe').map(x=>x.id));
  data.dismissedShopping=data.dismissedShopping.filter(id=>!safeIds.has(id));
  data.items.forEach(x=>{
    if(status(x)==='safe'||data.dismissedShopping.includes(x.id))return;
    let s=data.shopping.find(y=>y.stockId===x.id);
    if(!s)data.shopping.push({id:uid(),stockId:x.id,name:x.name,category:x.category,qty:1,unit:x.unit,priority:status(x)==='out'?'Tinggi':'Sedang',price:0,expiry:'',note:'',auto:true,checked:false});
    else{s.name=x.name;s.category=x.category}
  });
  save();
}
function go(id){
  $$('.screen').forEach(x=>x.classList.toggle('active',x.id===id));
  $$('.nav').forEach(x=>x.classList.toggle('on',x.dataset.screen===id));
  $('#pageTitle').textContent={home:'Beranda',stock:'Stok',shop:'Belanja',history:'Riwayat'}[id]||'Beranda';
  $('#searchBtn').style.display=['stock','shop'].includes(id)?'grid':'none';
  $('#plusBtn').style.display=['stock','shop'].includes(id)?'grid':'none';
  $('#filterBtn').style.display=id==='stock'?'grid':'none';
  render();
}
function render(){syncShopping();renderHome();renderStockTabs();renderStock();renderShop();renderHistory()}
function renderHome(){
  let low=data.items.filter(x=>status(x)==='low').length,out=data.items.filter(x=>status(x)==='out').length,exp=data.items.filter(x=>{let d=dayDiff(effExp(x));return d>=0&&d<=30}).length;
  $('#lowText').textContent=`${low+out} barang segera habis`;$('#expiryText').textContent=`${exp} barang hampir kedaluwarsa`;
  $('#catGrid').innerHTML=cats.map(c=>`<div class="cat" data-cat="${esc(c)}"><div class="ico">${({Dapur:'🍲',Toilet:'🧴',Laundry:'🧺',Obat:'💊',Baby:'👶',Beauty:'💄'}[c]||'◻︎')}</div><b>${esc(c)}</b></div>`).join('');
  $$('[data-cat]').forEach(b=>b.onclick=()=>{stockFilter=b.dataset.cat;stockStatusFilter='all';expiryOnly=false;go('stock')});
}
function renderStockTabs(){
  const tabIcons={all:'▦',Dapur:'🍲',Toilet:'🧴',Laundry:'🧺',Obat:'💊',Baby:'👶',Beauty:'💄'};
  $('#stockTabs').innerHTML=['all',...cats].map(c=>`<button class="tab ${stockFilter===c?'on':''}" data-sf="${c}"><div class="tab-ico">${tabIcons[c]}</div>${c==='all'?'Semua':c}</button>`).join('');
  $$('[data-sf]').forEach(b=>b.onclick=()=>{stockFilter=b.dataset.sf;expiryOnly=false;renderStockTabs();renderStock()});
}
function normSearch(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function openStockFilter(){
  openOverlay(`<div class="sheet-head"><div><h2>Filter Stok</h2><div class="muted">Pilih kondisi barang</div></div><button class="close" id="closeStockFilter">✕</button></div><div class="filter-list"><button class="filter-choice ${stockStatusFilter==='all'&&!expiryOnly?'on':''}" data-f="all"><span class="fi">◎</span>Semua Kondisi</button><button class="filter-choice ${stockStatusFilter==='safe'&&!expiryOnly?'on':''}" data-f="safe"><span class="fi">✓</span>Aman</button><button class="filter-choice ${stockStatusFilter==='low'&&!expiryOnly?'on':''}" data-f="low"><span class="fi">◔</span>Hampir Habis</button><button class="filter-choice ${stockStatusFilter==='out'&&!expiryOnly?'on':''}" data-f="out"><span class="fi">○</span>Habis</button><button class="filter-choice ${expiryOnly?'on':''}" data-f="expiry"><span class="fi">⌛</span>Hampir Expired</button></div>`);
  $('#closeStockFilter').onclick=closeOverlay;
  $$('[data-f]').forEach(b=>b.onclick=()=>{const v=b.dataset.f;if(v==='expiry'){expiryOnly=true;stockStatusFilter='all'}else{expiryOnly=false;stockStatusFilter=v}closeOverlay();renderStock()});
}
function renderStock(){
  let a=[...data.items];
  if(stockFilter!=='all')a=a.filter(x=>x.category===stockFilter);if(stockStatusFilter!=='all')a=a.filter(x=>status(x)===stockStatusFilter);if(expiryOnly)a=a.filter(x=>{let d=dayDiff(effExp(x));return d>=0&&d<=30});if(searchTerm){const q=normSearch(searchTerm);a=a.filter(x=>normSearch(x.name).includes(q)||normSearch(x.category).includes(q)||normSearch(x.location||'').includes(q)||normSearch(x.note||'').includes(q));}
  let so=$('#stockSort').value;a.sort((x,y)=>so==='name'?x.name.localeCompare(y.name):so==='low'?(x.qty-x.min)-(y.qty-y.min):so==='expiry'?effExp(x).localeCompare(effExp(y)):x.category.localeCompare(y.category));
  $('#stockCount').textContent=`${a.length} barang`;let low=data.items.filter(x=>status(x)==='low').length,out=data.items.filter(x=>status(x)==='out').length,safe=data.items.filter(x=>status(x)==='safe').length;$('#ssLow').textContent=low;$('#ssThin').textContent=out;$('#ssSafe').textContent=safe;
  $('#stockList').innerHTML=a.length?a.map(x=>{const st=status(x)==='safe'?'<span class="badge safe">Aman</span>':status(x)==='low'?'<span class="badge warn-b">Hampir Habis</span>':'<span class="badge danger-b">Habis</span>';return `<div class="stock-tr"><div class="name" data-stock="${x.id}">${esc(x.name)}</div><div class="cell">${x.qty}</div><div class="cell">${x.min}</div><div class="cell">${esc(x.unit)}</div><div class="cell">${x.expiry?fmt(x.expiry):'–'}</div><div class="cell">${paoCats.includes(x.category)&&x.pao?esc(x.pao):'–'}</div><div class="cell">${st}</div><div class="stock-actions"><button class="mini-edit cart-btn ${data.shopping.some(s=>s.stockId===x.id)?'in-cart':''}" data-cartstock="${x.id}" title="Tambah ke belanja" aria-label="Tambah ${esc(x.name)} ke belanja">🛒</button><button class="mini-trash" data-delstock="${x.id}" title="Hapus">🗑</button></div></div>`}).join(''):'<div class="empty">Belum ada barang.</div>';
  $$('[data-stock]').forEach(e=>e.onclick=()=>openStockDetail(Number(e.dataset.stock)));
  $$('[data-cartstock]').forEach(e=>e.onclick=ev=>{ev.preventDefault();ev.stopPropagation();addStockToShopping(Number(e.dataset.cartstock))});
  $$('[data-delstock]').forEach(e=>e.onclick=ev=>{ev.preventDefault();ev.stopPropagation();deleteStock(Number(e.dataset.delstock))});
}
function renderShop(){
  let a=[...data.shopping];
  if(searchTerm){const q=normSearch(searchTerm);a=a.filter(x=>normSearch(x.name).includes(q)||normSearch(x.category).includes(q)||normSearch(x.location||'').includes(q)||normSearch(x.note||'').includes(q));}
  let so=$('#shopSort').value,p={Tinggi:0,Sedang:1,Rendah:2};
  a.sort((x,y)=>so==='name'?x.name.localeCompare(y.name):so==='category'?x.category.localeCompare(y.category):(p[x.priority]??9)-(p[y.priority]??9));
  $('#shopPending').textContent=`${a.length} item`;
  const total=a.filter(x=>x.checked).reduce((t,x)=>t+(Number(x.price)||0)*(Number(x.qty)||0),0);
  $('#shopTotal').textContent='Rp '+total.toLocaleString('id-ID');

  $('#shopList').innerHTML=a.length?a.map(x=>{
    const st=data.items.find(i=>i.id===x.stockId);
    return `<div class="row shop-row compact-shop-row ${x.checked?'checked':''}">
      <input class="compact-check" type="checkbox" data-checkshop="${x.id}" ${x.checked?'checked':''} aria-label="Sudah dibeli">
      <div class="compact-shop-name" data-shop="${x.id}" title="${esc(x.name)}">${esc(x.name)}</div>
      <div class="compact-qty">
        <button type="button" data-incshop="${x.id}" aria-label="Tambah jumlah">+</button>
        <span>${Number(x.qty)||0}</span>
        <button type="button" data-decshop="${x.id}" aria-label="Kurangi jumlah">−</button>
      </div>
      <label class="compact-price" title="Harga per ${esc(x.unit)}"><span>Rp</span><input type="number" min="0" step="100" inputmode="numeric" data-priceshop="${x.id}" value="${Number(x.price)||''}" placeholder="0"></label>
      <button class="compact-trash" type="button" data-delshop="${x.id}" aria-label="Hapus dari daftar belanja">🗑️</button>
      <div class="compact-stock">${st?`Stok ${st.qty} ${esc(st.unit)} · Min. ${st.min} ${esc(st.unit)}`:'Belum ada di stok'} · ${esc(x.unit)}</div>
    </div>`;
  }).join(''):'<div class="empty">Daftar belanja kosong.</div>';

  $$('[data-shop]').forEach(e=>e.onclick=()=>openShopEdit(Number(e.dataset.shop)));
  $$('[data-checkshop]').forEach(e=>e.onchange=ev=>{
    ev.stopPropagation();
    const x=data.shopping.find(i=>i.id===Number(e.dataset.checkshop));
    if(x){x.checked=e.checked;save();renderShop()}
  });
  $$('[data-delshop]').forEach(e=>e.onclick=ev=>{
    ev.preventDefault();ev.stopPropagation();
    const id=Number(e.dataset.delshop);
    const x=data.shopping.find(i=>i.id===id);
    if(!x)return;
    if(!confirm(`Hapus ${x.name} dari daftar belanja?`))return;
    data.shopping=data.shopping.filter(i=>i.id!==id);
    if(Array.isArray(data.dismissedShopping)){
      const key=x.stockId||x.name;
      if(!data.dismissedShopping.includes(key))data.dismissedShopping.push(key);
    }
    save();renderShop();
  });
  $$('[data-incshop]').forEach(e=>e.onclick=ev=>{ev.preventDefault();ev.stopPropagation();const x=data.shopping.find(i=>i.id===Number(e.dataset.incshop));if(x){x.qty=Number((Number(x.qty||0)+1).toFixed(3));save();renderShop()}});
  $$('[data-decshop]').forEach(e=>e.onclick=ev=>{ev.preventDefault();ev.stopPropagation();const x=data.shopping.find(i=>i.id===Number(e.dataset.decshop));if(x){x.qty=Math.max(0,Number((Number(x.qty||0)-1).toFixed(3)));save();renderShop()}});
  $$('[data-priceshop]').forEach(e=>{
    e.onclick=ev=>ev.stopPropagation();
    e.oninput=()=>{const x=data.shopping.find(i=>i.id===Number(e.dataset.priceshop));if(x){x.price=Number(e.value)||0;save();const total=data.shopping.filter(i=>i.checked).reduce((t,i)=>t+(Number(i.price)||0)*(Number(i.qty)||0),0);$('#shopTotal').textContent='Rp '+total.toLocaleString('id-ID')}};
  });
}
function historyShopGroupKey(h){
  if(h.batchId)return 'batch:'+String(h.batchId);
  const dt=new Date(h.date);
  return `legacy:${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}-${dt.getHours()}-${dt.getMinutes()}`;
}
function deleteShopHistoryGroup(key){
  if(!confirm('Hapus riwayat belanja ini?'))return;
  data.shopHistory=(data.shopHistory||[]).filter(h=>historyShopGroupKey(h)!==key);
  save();renderHistory();
}
function deleteStockHistory(id){
  if(!confirm('Hapus riwayat stok ini?'))return;
  data.stockHistory=(data.stockHistory||[]).filter(h=>String(h.id)!==String(id));
  save();renderHistory();
}
function renderHistory(){
  pruneHistory();
  if(histMode==='shop'){
    const groups=new Map();
    (data.shopHistory||[]).forEach(h=>{
      const key=historyShopGroupKey(h);
      if(!groups.has(key))groups.set(key,{key,date:h.date,place:h.purchasePlace||'',items:[]});
      const g=groups.get(key);g.items.push(h);
      if(!g.place&&h.purchasePlace)g.place=h.purchasePlace;
    });
    const ordered=[...groups.values()].sort((a,b)=>new Date(b.date)-new Date(a.date));
    $('#historyContent').innerHTML=ordered.length?ordered.map(g=>{
      const d=new Date(g.date);
      const date=d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
      const total=g.items.reduce((t,h)=>t+(Number(h.price)||0)*(Number(h.qty)||0),0);
      const safeKey=esc(g.key);
      return `<div class="safe-receipt">
        <div class="safe-receipt-head">
          <div class="safe-receipt-title"><b>${date}</b><small>${esc(g.place||'Tempat tidak dicatat')}</small></div>
          <div class="safe-receipt-total"><small>Total Belanja</small><b>Rp ${total.toLocaleString('id-ID')}</b></div>
          <button class="history-delete" type="button" data-delhistshop="${safeKey}" aria-label="Hapus riwayat">×</button>
        </div>
        <div class="safe-receipt-items">
          ${g.items.map(h=>{
            const qty=Number(h.qty)||0,price=Number(h.price)||0,sub=qty*price;
            return `<div class="safe-receipt-row"><b>${esc(h.name)}</b><span>${qty} ${esc(h.unit)}</span><span>Rp ${price.toLocaleString('id-ID')}</span><span class="subtotal">Rp ${sub.toLocaleString('id-ID')}</span></div>`;
          }).join('')}
        </div>
      </div>`;
    }).join(''):'<div class="empty">Belum ada riwayat belanja.</div>';
    $$('[data-delhistshop]').forEach(b=>b.onclick=ev=>{ev.preventDefault();ev.stopPropagation();deleteShopHistoryGroup(b.dataset.delhistshop)});
    return;
  }
  const a=data.stockHistory||[];
  $('#historyContent').innerHTML=a.length?a.slice().reverse().map(h=>`<div class="hist-row history-with-delete"><div><b>${esc(h.name)}</b><small class="${h.type==='in'?'in':'out'}">${h.type==='in'?'Stok Masuk':'Stok Keluar'} ${h.type==='in'?'+':'-'}${h.qty} ${esc(h.unit)}</small></div><small>${new Date(h.date).toLocaleString('id-ID')}</small><button class="history-delete" type="button" data-delhiststock="${h.id}" aria-label="Hapus riwayat">×</button></div>`).join(''):'<div class="empty">Belum ada riwayat stok.</div>';
  $$('[data-delhiststock]').forEach(b=>b.onclick=ev=>{ev.preventDefault();ev.stopPropagation();deleteStockHistory(b.dataset.delhiststock)});
}
function openOverlay(v){$('#sheet').innerHTML=v;$('#overlay').classList.add('on')}function closeOverlay(){$('#overlay').classList.remove('on')}
function stockFields(x={}){let c=x.category||'Dapur';return `<div class="form-grid"><div class="field"><label>Nama Barang</label><input id="fName" value="${esc(x.name||'')}"></div><div class="field"><label>Kategori</label><select id="fCat">${cats.map(v=>`<option ${v===c?'selected':''}>${v}</option>`).join('')}</select></div><div class="two"><div class="field"><label>Jumlah Stok</label><input id="fQty" type="number" step="any" value="${x.qty??0}"></div><div class="field"><label>Jumlah Minimum</label><input id="fMin" type="number" step="any" value="${x.min??0}"></div></div><div class="field"><label>Satuan</label><select id="fUnit">${units.map(v=>`<option ${v===(x.unit||'pcs')?'selected':''}>${v}</option>`).join('')}</select></div><div class="field"><label>Lokasi</label><input id="fLoc" value="${esc(x.location||'')}"></div><div class="field"><label>Kedaluwarsa</label><input id="fExp" type="date" value="${x.expiry||''}"></div><div id="paoBox" class="${paoCats.includes(c)?'':'hidden'}"><div class="two"><div class="field"><label>Tanggal Dibuka</label><input id="fOpened" type="date" value="${x.opened||''}"></div><div class="field"><label>PAO</label><select id="fPao"><option value="">-</option>${['3M','6M','12M','18M','24M','36M'].map(v=>`<option ${v===x.pao?'selected':''}>${v}</option>`).join('')}</select></div></div></div><div class="field"><label>Keterangan</label><textarea id="fNote">${esc(x.note||'')}</textarea></div></div>`}
function openStockDetail(id){let x=data.items.find(i=>i.id===id);if(!x)return;openOverlay(`<div class="sheet-head"><h2>${esc(x.name)}</h2><button class="close" id="closeDetail">✕</button></div><div class="detail-grid"><div>Jumlah Stok</div><div>${x.qty} ${esc(x.unit)}</div><div>Jumlah Minimum</div><div>${x.min} ${esc(x.unit)}</div><div>Kategori</div><div>${esc(x.category)}</div><div>Lokasi</div><div>${esc(x.location||'-')}</div><div>Keterangan</div><div>${esc(x.note||'-')}</div><div>Kedaluwarsa</div><div>${fmt(x.expiry)}</div>${paoCats.includes(x.category)?`<div>Tanggal Dibuka</div><div>${fmt(x.opened)}</div><div>PAO</div><div>${esc(x.pao||'-')}</div><div>Batas Pakai Setelah Dibuka</div><div>${fmt(paoLimit(x))}</div>`:''}</div><div class="field" style="margin-top:14px"><label>Jumlah perubahan stok</label><input id="q" value="1" type="number" min="0" step="any"></div><div class="two" style="margin-top:10px"><button class="secondary" id="minus">− Stok Keluar</button><button class="primary" id="plus">＋ Stok Masuk</button></div><div class="actions"><button class="secondary" id="edit">Edit Detail</button><button class="danger" id="del">Hapus dari Stok</button></div>`);$('#closeDetail').onclick=closeOverlay;$('#minus').onclick=()=>adjustStock(id,-(+$('#q').value||1));$('#plus').onclick=()=>adjustStock(id,(+$('#q').value||1));$('#edit').onclick=()=>openStockForm(id);$('#del').onclick=()=>deleteStock(id)}
function adjustStock(id,d){let x=data.items.find(i=>i.id===id);if(!x)return;let old=x.qty;x.qty=Math.max(0,+(x.qty+d).toFixed(3));let a=x.qty-old;if(a)data.stockHistory.push({id:uid(),name:x.name,type:a>0?'in':'out',qty:Math.abs(a),unit:x.unit,date:new Date().toISOString()});save();closeOverlay();render()}
function openStockForm(id){let x=id?data.items.find(i=>i.id===id):null;openOverlay(`<div class="sheet-head"><h2>${x?'Edit Stok':'Tambah Barang'}</h2><button class="close" id="closeStockForm">✕</button></div>${stockFields(x||{})}<div class="actions"><button class="primary" id="saveStock">Simpan</button></div>`);$('#closeStockForm').onclick=closeOverlay;$('#fCat').onchange=()=>$('#paoBox').classList.toggle('hidden',!paoCats.includes($('#fCat').value));$('#saveStock').onclick=()=>{let o={id:x?.id||uid(),name:$('#fName').value.trim(),category:$('#fCat').value,qty:+$('#fQty').value||0,min:+$('#fMin').value||0,unit:$('#fUnit').value,location:$('#fLoc').value,expiry:$('#fExp').value,opened:$('#fOpened')?.value||'',pao:$('#fPao')?.value||'',note:$('#fNote').value};if(!o.name)return alert('Nama barang belum diisi');if(x){let old=x.qty;Object.assign(x,o);let d=x.qty-old;if(d)data.stockHistory.push({id:uid(),name:x.name,type:d>0?'in':'out',qty:Math.abs(d),unit:x.unit,date:new Date().toISOString()})}else{data.items.push(o);if(o.qty)data.stockHistory.push({id:uid(),name:o.name,type:'in',qty:o.qty,unit:o.unit,date:new Date().toISOString()})}save();closeOverlay();render()}}
function deleteStock(id){let x=data.items.find(i=>i.id===id);if(!x)return;if(confirm(`Hapus ${x.name} dari stok?`)){data.items=data.items.filter(i=>i.id!==id);data.shopping=data.shopping.filter(s=>s.stockId!==id);data.dismissedShopping=data.dismissedShopping.filter(i=>i!==id);save();closeOverlay();render()}}
function addStockToShopping(id){
  const x=data.items.find(i=>i.id===id);if(!x)return;
  data.dismissedShopping=data.dismissedShopping.filter(i=>i!==id);
  let ex=data.shopping.find(s=>s.stockId===id);
  if(!ex){
    data.shopping.push({id:uid(),stockId:id,name:x.name,category:x.category,qty:1,unit:x.unit,price:0,priority:status(x)==='out'?'Tinggi':'Sedang',expiry:'',note:'',auto:false,checked:false});
    save();render();
    toast(`${x.name} ditambahkan ke Belanja`);
  }else{
    toast(`${x.name} sudah ada di Belanja`);
  }
}
function openShopEdit(id){let x=data.shopping.find(i=>i.id===id);if(!x)return;openOverlay(`<div class="sheet-head"><h2>Edit Belanja</h2><button class="close" id="closeShopEdit">✕</button></div><div class="form-grid"><div class="field"><label>Nama Barang</label><input id="sName" value="${esc(x.name)}"></div><div class="field"><label>Kategori</label><select id="sCat">${cats.map(v=>`<option ${v===x.category?'selected':''}>${v}</option>`).join('')}</select></div><div class="two"><div class="field"><label>Jumlah</label><input id="sQty" type="number" step="any" value="${x.qty}"></div><div class="field"><label>Satuan</label><select id="sUnit">${units.map(v=>`<option ${v===x.unit?'selected':''}>${v}</option>`).join('')}</select></div></div><div class="field"><label>Harga (opsional)</label><input id="sPrice" type="number" min="0" step="100" value="${x.price||''}" placeholder="Contoh: 25000"></div><div class="field"><label>Kedaluwarsa</label><input id="sExp" type="date" value="${x.expiry||''}"></div><div class="field"><label>Catatan</label><textarea id="sNote">${esc(x.note||'')}</textarea></div></div><div class="actions"><button class="primary" id="saveShop">Simpan Perubahan</button><button class="danger" id="delShop">Hapus dari Daftar Belanja</button></div>`);$('#closeShopEdit').onclick=closeOverlay;$('#saveShop').onclick=()=>{Object.assign(x,{name:$('#sName').value.trim(),category:$('#sCat').value,qty:+$('#sQty').value||0,unit:$('#sUnit').value,price:+$('#sPrice').value||0,expiry:$('#sExp').value,note:$('#sNote').value,checked:!!x.checked});save();closeOverlay();render()};$('#delShop').onclick=()=>deleteShop(id)}
function addShop(){let x={id:uid(),stockId:null,name:'Item Baru',category:'Dapur',qty:1,unit:'pcs',price:0,priority:'Sedang',expiry:'',note:'',checked:false};data.shopping.push(x);save();render();openShopEdit(x.id)}
function deleteShop(id){let x=data.shopping.find(i=>i.id===id);if(!x)return;if(confirm(`Hapus ${x.name} dari daftar belanja?`)){if(x.stockId&&!data.dismissedShopping.includes(x.stockId))data.dismissedShopping.push(x.stockId);data.shopping=data.shopping.filter(i=>i.id!==id);save();closeOverlay();render()}}
function saveAllShopping(){
 const bought=data.shopping.filter(x=>x.checked);
 if(!bought.length)return alert('Centang barang yang sudah dibeli terlebih dahulu.');
 openOverlay(`<div class="sheet-head"><div><h2>Simpan Belanja</h2><div class="muted">Lengkapi informasi pembelian</div></div><button class="close" id="closePurchasePlace">✕</button></div>
 <div class="field"><label>Barang dibeli di mana?</label><input id="purchasePlaceInput" type="text" autocomplete="off" placeholder="Contoh: Superindo, Shopee, Pasar"></div>
 <div class="actions"><button class="primary" id="confirmPurchaseSave">Simpan Belanja</button><button class="secondary" id="cancelPurchaseSave">Batal</button></div>`);
 const input=$('#purchasePlaceInput');
 $('#closePurchasePlace').onclick=closeOverlay;
 $('#cancelPurchaseSave').onclick=closeOverlay;
 $('#confirmPurchaseSave').onclick=()=>{const place=(input?.value||'').trim();if(!place)return alert('Silakan isi tempat pembelian.');finalizeShopping(place)};
}
function finalizeShopping(purchasePlace){
 const bought=data.shopping.filter(x=>x.checked);if(!bought.length){closeOverlay();return}
 const done=[],purchaseTime=new Date().toISOString(),batchId='purchase-'+Date.now();
 for(const x of bought){
   let st=data.items.find(i=>i.id===x.stockId)||data.items.find(i=>i.name.toLowerCase()===x.name.toLowerCase());
   if(st){
     let add=Number(x.qty)||0;
     if(st.unit!==x.unit){const c=Number(prompt(`1 ${x.unit} ${x.name} berisi berapa ${st.unit}?`));if(!c||c<=0)continue;add*=c}
     st.qty=Number((Number(st.qty)+add).toFixed(3));
     if(x.expiry)st.expiry=x.expiry;
     data.stockHistory.push({id:uid(),name:st.name,type:'in',qty:add,unit:st.unit,date:purchaseTime});
   }else{
     st={id:uid(),name:x.name,category:x.category,qty:Number(x.qty)||0,min:0,unit:x.unit,expiry:x.expiry||'',location:'',note:x.note||'',opened:'',pao:''};
     data.items.push(st);
     if(st.qty)data.stockHistory.push({id:uid(),name:st.name,type:'in',qty:st.qty,unit:st.unit,date:purchaseTime});
   }
   data.shopHistory.push({id:uid(),batchId,name:x.name,category:x.category,qty:x.qty,unit:x.unit,price:x.price||0,purchasePlace,date:purchaseTime});
   done.push(x.id);
 }
 data.shopping=data.shopping.filter(x=>!done.includes(x.id));
 save();closeOverlay();render();
}
$$('.nav').forEach(b=>b.onclick=()=>go(b.dataset.screen));
$('#stockSort').onchange=renderStock;$('#shopSort').onchange=renderShop;
$('#histShopBtn').onclick=()=>{histMode='shop';$('#histShopBtn').classList.add('on');$('#histStockBtn').classList.remove('on');renderHistory()};$('#histStockBtn').onclick=()=>{histMode='stock';$('#histStockBtn').classList.add('on');$('#histShopBtn').classList.remove('on');renderHistory()};
$('#goLow').onclick=()=>{stockStatusFilter='low';expiryOnly=false;go('stock')};$('#goExpiry').onclick=()=>{expiryOnly=true;stockFilter='all';stockStatusFilter='all';go('stock')};
$('#overlay').onclick=e=>{if(e.target.id==='overlay')closeOverlay()};$('#searchBtn').onclick=()=>{let v=prompt('Cari barang:',searchTerm);if(v!==null){searchTerm=v;render()}};$('#filterBtn').onclick=openStockFilter;
$$('[data-stockstatus]').forEach(b=>b.onclick=()=>{stockStatusFilter=stockStatusFilter===b.dataset.stockstatus?'all':b.dataset.stockstatus;expiryOnly=false;renderStock()});
$('#plusBtn').onclick=()=>{const active=document.querySelector('.screen.active')?.id;if(active==='stock')openStockForm();else if(active==='shop')addShop()};$('#saveShoppingBtn').onclick=saveAllShopping;
$('#todayText').textContent=new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
stockFilter='all';stockStatusFilter='all';expiryOnly=false;searchTerm='';pruneHistory();go('home');


async function resetAllStokRumahData(){
  if(!confirm('Reset seluruh isi Stok Rumah? Semua stok, daftar belanja, dan riwayat akan dihapus untuk semua user yang tersinkron.'))return;
  data={items:[],shopping:[],shopHistory:[],stockHistory:[],dismissedShopping:[]};
  save();
  render();
  try{
    if(srCurrentUser){await srFlush();await srLoadCloud();srStatus('Tersinkron','ok','Seluruh data sudah direset')}
  }catch(e){
    srLastError=e.message||String(e);srStatus('Gagal reset','err',srLastError);
  }
}

document.getElementById('srLoginBtn').onclick=srLogin;
document.getElementById('srLoginPassword').addEventListener('keydown',e=>{if(e.key==='Enter')srLogin()});
document.getElementById('srAccountPill').onclick=()=>document.getElementById('srAccountMenu').classList.toggle('show');
document.getElementById('srSyncNow').onclick=async()=>{try{if(srDirty)await srFlush();await srLoadCloud();srStatus('Tersinkron','ok')}catch(e){srLastError=e.message||String(e);srStatus('Gagal sinkron','err',srLastError)}};
document.getElementById('srResetBtn').onclick=resetAllStokRumahData;
document.getElementById('srLogoutBtn').onclick=srLogout;
document.addEventListener('click',e=>{const m=document.getElementById('srAccountMenu'),p=document.getElementById('srAccountPill');if(m.classList.contains('show')&&!m.contains(e.target)&&!p.contains(e.target))m.classList.remove('show')});
document.addEventListener('DOMContentLoaded',srInitRealtime);

if('serviceWorker'in navigator)addEventListener('load',async()=>{try{const r=await navigator.serviceWorker.register('./service-worker.js?v=fixed');r.update()}catch(e){console.warn('Service worker:',e)}});









