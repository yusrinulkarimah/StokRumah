
window.addEventListener('error',e=>console.error('StokRumah error:',e.error||e.message));

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],KEY='stokrumah-v20-data';
const cats=['Dapur','Toilet','Laundry','Obat','Baby','Beauty'],units=['pcs','pack','box','botol','pouch','tube','strip','tablet','kapsul','sachet','gram','kg','ml','L','kaleng'],paoCats=['Beauty','Baby','Obat'],icons={Dapur:'🍲',Toilet:'🧴',Laundry:'🧺',Obat:'🩹','Baby':'🧸',Beauty:'💄'};
const demo={items:[{id:1,name:'Beras',category:'Dapur',qty:1.5,min:2,unit:'kg',expiry:'2026-10-20',location:'Dapur',note:'',opened:'',pao:''},{id:2,name:'Minyak Goreng',category:'Dapur',qty:600,min:1000,unit:'ml',expiry:'2027-02-01',location:'Dapur',note:'',opened:'',pao:''},{id:3,name:'Gula Pasir',category:'Dapur',qty:0,min:1,unit:'kg',expiry:'2027-01-15',location:'Dapur',note:'',opened:'',pao:''},{id:4,name:'Popok M',category:'Baby',qty:18,min:20,unit:'pcs',expiry:'2027-06-01',location:'Lemari Baby',note:'Untuk pemakaian malam',opened:'',pao:''},{id:5,name:'Detergen Bubuk',category:'Laundry',qty:1,min:2,unit:'pouch',expiry:'',location:'Laundry',note:'',opened:'',pao:''},{id:6,name:'Sampo',category:'Beauty',qty:1,min:2,unit:'botol',expiry:'2027-08-01',location:'Kamar mandi',note:'',opened:'2026-08-01',pao:'12M'},{id:7,name:'Paracetamol',category:'Obat',qty:5,min:10,unit:'tablet',expiry:'2026-09-20',location:'Kotak obat',note:'',opened:'',pao:''},{id:8,name:'Pasta Gigi',category:'Toilet',qty:1,min:2,unit:'tube',expiry:'2027-05-01',location:'Kamar mandi',note:'',opened:'',pao:''}],shopping:[],shopHistory:[{id:101,name:'Susu Formula',category:'Baby',qty:1,unit:'kaleng',date:'2026-08-28T19:45:00'}],stockHistory:[{id:201,name:'Popok M',type:'out',qty:2,unit:'pcs',date:'2026-08-29T08:30:00'}]};
let data;
try{
  const raw=localStorage.getItem(KEY);
  data=raw?JSON.parse(raw):null;
}catch(e){ data=null; }
if(!data){
  data=JSON.parse(JSON.stringify(demo));
}
data.items=Array.isArray(data.items)?data.items:[];
data.shopping=Array.isArray(data.shopping)?data.shopping:[];
data.shopping.forEach(x=>{ if(typeof x.checked!=='boolean') x.checked=false; });
data.shopHistory=Array.isArray(data.shopHistory)?data.shopHistory:[];
data.stockHistory=Array.isArray(data.stockHistory)?data.stockHistory:[];
data.items.forEach(x=>{ if(x.category==='Baby Kids')x.category='Baby'; });
data.shopping.forEach(x=>{ if(x.category==='Baby Kids')x.category='Baby'; });
let stockFilter='all',stockStatusFilter='all',histMode='shop',expiryOnly=false,searchTerm='';
const save=()=>localStorage.setItem(KEY,JSON.stringify(data)),uid=()=>Date.now()+Math.floor(Math.random()*100000);
const esc=(v='')=>String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function status(x){return +x.qty<=0?'out':+x.qty<=+x.min?'low':'safe'} function badge(x){return status(x)==='safe'?'<span class="badge safe">Aman</span>':status(x)==='low'?'<span class="badge warn-b">Hampir Habis</span>':'<span class="badge danger-b">Habis</span>'}
function fmt(v){return v?new Date(v+'T00:00:00').toLocaleDateString('id-ID'):'-'} function dayDiff(v){if(!v)return 99999;let d=new Date(v+'T00:00:00'),n=new Date();n.setHours(0,0,0,0);return Math.ceil((d-n)/86400000)}
function paoLimit(x){if(!x.opened||!x.pao)return '';let d=new Date(x.opened+'T00:00:00');d.setMonth(d.getMonth()+parseInt(x.pao));return d.toISOString().slice(0,10)} function effExp(x){return [x.expiry,paoLimit(x)].filter(Boolean).sort()[0]||''}
function syncShopping(){data.items.forEach(x=>{if(status(x)!=='safe'){let s=data.shopping.find(y=>y.stockId===x.id);if(!s)data.shopping.push({id:uid(),stockId:x.id,name:x.name,category:x.category,qty:1,unit:x.unit,priority:status(x)==='out'?'Tinggi':'Sedang',price:0,expiry:'',note:'',auto:true,checked:false});else{s.name=x.name;s.category=x.category}}});save()}
function saveAllShopping(){
 const bought=data.shopping.filter(x=>x.checked);
 if(!bought.length)return alert('Centang barang yang sudah dibeli terlebih dahulu.');
 if(!confirm(`Simpan ${bought.length} barang yang sudah dibeli?`))return;
 const processedIds=[];
 for(const x of bought){
   let st=data.items.find(i=>i.id===x.stockId)||data.items.find(i=>i.name.toLowerCase()===x.name.toLowerCase());
   if(st){
     let add=x.qty;
     if(st.unit!==x.unit){
       const c=Number(prompt(`1 ${x.unit} ${x.name} berisi berapa ${st.unit}?`));
       if(!c||c<=0)continue;
       add*=c;
     }
     // Only current stock quantity changes. Minimum stock is intentionally untouched.
     st.qty=Number((st.qty+add).toFixed(3));
     if(x.expiry)st.expiry=x.expiry;
     data.stockHistory.push({id:uid(),name:st.name,type:'in',qty:add,unit:st.unit,date:new Date().toISOString()});
   }else{
     st={id:uid(),name:x.name,category:x.category,qty:x.qty,min:0,unit:x.unit,expiry:x.expiry||'',location:'',note:x.note||'',opened:'',pao:''};
     data.items.push(st);
     data.stockHistory.push({id:uid(),name:st.name,type:'in',qty:st.qty,unit:st.unit,date:new Date().toISOString()});
   }
   data.shopHistory.push({id:uid(),name:x.name,category:x.category,qty:x.qty,unit:x.unit,price:x.price||0,date:new Date().toISOString()});
   processedIds.push(x.id);
 }
 data.shopping=data.shopping.filter(x=>!processedIds.includes(x.id));
 save();render();alert('Belanja tersimpan. Stok dan riwayat belanja sudah diperbarui.');
}
function go(id){$$('.screen').forEach(x=>x.classList.toggle('active',x.id===id));$$('.nav').forEach(x=>x.classList.toggle('on',x.dataset.screen===id));$('#pageTitle').textContent={home:'Beranda',stock:'Stok',shop:'Belanja',history:'Riwayat',more:'Lainnya'}[id];$('#searchBtn').style.display=['stock','shop'].includes(id)?'grid':'none';$('#plusBtn').style.display=['stock','shop'].includes(id)?'grid':'none';$('#filterBtn').style.display=id==='stock'?'grid':'none';render()}
function render(){syncShopping();renderHome();renderStockTabs();renderStock();renderShop();renderHistory()}
function renderHome(){let low=data.items.filter(x=>status(x)==='low').length,out=data.items.filter(x=>status(x)==='out').length,exp=data.items.filter(x=>{let d=dayDiff(effExp(x));return d>=0&&d<=30}).length;$('#mTotal').textContent=data.items.length;$('#mLow').textContent=low;$('#mOut').textContent=out;$('#lowText').textContent=`${low+out} barang hampir habis / habis`;$('#expiryText').textContent=`${exp} barang hampir kedaluwarsa`;$('#catGrid').innerHTML=cats.map(c=>`<div class="cat" data-cat="${c}"><div class="ico">${icons[c]}</div><b>${c}</b></div>`).join('');$$('[data-cat]').forEach(b=>b.onclick=()=>{stockFilter=b.dataset.cat;stockStatusFilter='all';expiryOnly=false;go('stock')})}
function renderStockTabs(){$('#stockTabs').innerHTML=['all',...cats].map(c=>`<button class="tab ${stockFilter===c?'on':''}" data-sf="${c}">${c==='all'?'Semua':c}</button>`).join('');$$('[data-sf]').forEach(b=>b.onclick=()=>{stockFilter=b.dataset.sf;expiryOnly=false;renderStockTabs();renderStock()})}
function renderStock(){
 let a=[...data.items];
 if(stockFilter!=='all')a=a.filter(x=>x.category===stockFilter);
 if(stockStatusFilter!=='all')a=a.filter(x=>status(x)===stockStatusFilter);
 if(expiryOnly)a=a.filter(x=>{let d=dayDiff(effExp(x));return d>=0&&d<=30});
 if(searchTerm)a=a.filter(x=>x.name.toLowerCase().includes(searchTerm.toLowerCase()));
 let so=$('#stockSort').value;
 a.sort((x,y)=>so==='name'?x.name.localeCompare(y.name):so==='low'?(x.qty-x.min)-(y.qty-y.min):so==='expiry'?effExp(x).localeCompare(effExp(y)):x.category.localeCompare(y.category));
 $('#stockCount').textContent=`${a.length} barang`;
 let low=data.items.filter(x=>status(x)==='low').length,out=data.items.filter(x=>status(x)==='out').length,safe=data.items.filter(x=>status(x)==='safe').length;
 $('#ssLow').textContent=low;$('#ssThin').textContent=out;$('#ssSafe').textContent=safe;
 $('#stockList').innerHTML=a.length?a.map(x=>{
   const st=status(x)==='safe'?'<span class="badge safe">Aman</span>':status(x)==='low'?'<span class="badge warn-b">Hampir Habis</span>':'<span class="badge danger-b">Habis</span>';
   return `<div class="stock-tr">
    <div class="name" data-stock="${x.id}">${esc(x.name)}</div>
    <div class="cell">${x.qty}</div><div class="cell">${x.min}</div><div class="cell">${esc(x.unit)}</div>
    <div class="cell">${x.expiry?fmt(x.expiry):'–'}</div>
    <div class="cell">${paoCats.includes(x.category)&&x.pao?esc(x.pao):'–'}</div>
    <div class="cell">${st}</div>
    <div class="stock-actions">
      <button class="mini-edit" data-cartstock="${x.id}" title="Tambah ke belanja">🛒</button>
      <button class="mini-trash" data-delstock="${x.id}" title="Hapus">🗑</button>
    </div>
   </div>`;
 }).join(''):'<div class="empty">Belum ada barang.</div>';
 $$('[data-stock]').forEach(e=>e.onclick=()=>openStockDetail(+e.dataset.stock));
 $$('[data-cartstock]').forEach(e=>e.onclick=ev=>{ev.stopPropagation();addStockToShopping(+e.dataset.cartstock)});
 $$('[data-delstock]').forEach(e=>e.onclick=ev=>{ev.stopPropagation();deleteStock(+e.dataset.delstock)});
}
function renderShop(){
 let a=[...data.shopping];
 if(searchTerm)a=a.filter(x=>x.name.toLowerCase().includes(searchTerm.toLowerCase()));
 let so=$('#shopSort').value,p={Tinggi:0,Sedang:1,Rendah:2};
 a.sort((x,y)=>so==='name'?x.name.localeCompare(y.name):so==='category'?x.category.localeCompare(y.category):(p[x.priority]??9)-(p[y.priority]??9));
 $('#shopPending').textContent=`${a.length} item`;
 const checkedTotal=a.filter(x=>x.checked).reduce((t,x)=>t+(Number(x.price)||0)*(Number(x.qty)||0),0);
 $('#shopTotal').textContent='Rp '+checkedTotal.toLocaleString('id-ID');
 $('#shopList').innerHTML=a.length?a.map(x=>{let st=data.items.find(i=>i.id===x.stockId);return `<div class="row shop-row">
   <input class="shop-check" type="checkbox" data-checkshop="${x.id}" ${x.checked?'checked':''} aria-label="Tandai sudah dibeli">
   <div class="row-main" data-shop="${x.id}"><b>${esc(x.name)}</b><small>${x.qty} ${x.unit} | ${x.category}${x.price?` | Rp ${Number(x.price).toLocaleString('id-ID')}`:''}${st?` | Stok ${st.qty}/${st.min} ${st.unit}`:''}${x.expiry?` | Exp ${fmt(x.expiry)}`:''}</small></div>
   <div class="row-actions"><span>›</span><button class="trash" data-delshop="${x.id}">🗑️</button></div>
  </div>`}).join(''):'<div class="empty">Daftar belanja kosong.</div>';
 $$('[data-shop]').forEach(e=>e.onclick=()=>openShopEdit(+e.dataset.shop));
 $$('[data-checkshop]').forEach(e=>e.onchange=ev=>{let x=data.shopping.find(i=>i.id===+e.dataset.checkshop);if(x){x.checked=e.checked;save();renderShop()}});
 $$('[data-delshop]').forEach(e=>e.onclick=ev=>{ev.preventDefault();ev.stopPropagation();deleteShop(Number(e.dataset.delshop));});
}
function renderHistory(){let a=histMode==='shop'?data.shopHistory:data.stockHistory;$('#historyContent').innerHTML=a.length?a.slice().reverse().map(h=>histMode==='shop'?`<div class="hist-row"><div><b>${h.name}</b><small>${h.qty} ${h.unit} · ${h.category}${h.price?` · Rp ${Number(h.price).toLocaleString('id-ID')}`:''}</small></div><small>${new Date(h.date).toLocaleString('id-ID')}</small></div>`:`<div class="hist-row"><div><b>${h.name}</b><small class="${h.type==='in'?'in':'out'}">${h.type==='in'?'Stok Masuk':'Stok Keluar'} ${h.type==='in'?'+':'-'}${h.qty} ${h.unit}</small></div><small>${new Date(h.date).toLocaleString('id-ID')}</small></div>`).join(''):'<div class="empty">Belum ada riwayat.</div>'}
function openOverlay(h){$('#sheet').innerHTML=h;$('#overlay').classList.add('on')} function closeOverlay(){$('#overlay').classList.remove('on')}
function stockFields(x={}){let c=x.category||'Dapur';return `<div class="form-grid"><div class="field"><label>Nama Barang</label><input id="fName" value="${esc(x.name||'')}"></div><div class="field"><label>Kategori</label><select id="fCat">${cats.map(v=>`<option ${v===c?'selected':''}>${v}</option>`).join('')}</select></div><div class="two"><div class="field"><label>Jumlah Stok</label><input id="fQty" type="number" step="any" value="${x.qty??0}"></div><div class="field"><label>Jumlah Minimum</label><input id="fMin" type="number" step="any" value="${x.min??0}"></div></div><div class="field"><label>Satuan</label><select id="fUnit">${units.map(v=>`<option ${v===(x.unit||'pcs')?'selected':''}>${v}</option>`).join('')}</select></div><div class="field"><label>Lokasi</label><input id="fLoc" value="${esc(x.location||'')}"></div><div class="field"><label>Kedaluwarsa</label><input id="fExp" type="date" value="${x.expiry||''}"></div><div id="paoBox" class="${paoCats.includes(c)?'':'hidden'}"><div class="two"><div class="field"><label>Tanggal Dibuka</label><input id="fOpened" type="date" value="${x.opened||''}"></div><div class="field"><label>PAO</label><select id="fPao"><option value="">-</option>${['3M','6M','12M','18M','24M','36M'].map(v=>`<option ${v===x.pao?'selected':''}>${v}</option>`).join('')}</select></div></div></div><div class="field"><label>Keterangan</label><textarea id="fNote">${esc(x.note||'')}</textarea></div></div>`}
function openStockDetail(id){let x=data.items.find(i=>i.id===id);openOverlay(`<div class="sheet-head"><h2>${x.name}</h2><button class="close" onclick="closeOverlay()">✕</button></div><div class="detail-grid"><div>Jumlah Stok</div><div>${x.qty} ${x.unit}</div><div>Jumlah Minimum</div><div>${x.min} ${x.unit}</div><div>Kategori</div><div>${x.category}</div><div>Lokasi</div><div>${x.location||'-'}</div><div>Keterangan</div><div>${x.note||'-'}</div><div>Kedaluwarsa</div><div>${fmt(x.expiry)}</div>${paoCats.includes(x.category)?`<div>Tanggal Dibuka</div><div>${fmt(x.opened)}</div><div>PAO</div><div>${x.pao||'-'}</div><div>Batas Pakai Setelah Dibuka</div><div>${fmt(paoLimit(x))}</div>`:''}</div><div class="field" style="margin-top:14px"><label>Jumlah perubahan stok</label><input id="q" value="1" type="number" min="0" step="any"></div><div class="two" style="margin-top:10px"><button class="secondary" id="minus">− Stok Keluar</button><button class="primary" id="plus">＋ Stok Masuk</button></div><div class="actions"><button class="secondary" id="edit">Edit Detail</button><button class="danger" id="del">Hapus dari Stok</button></div>`);$('#minus').onclick=()=>adjustStock(id,-(+$('#q').value||1));$('#plus').onclick=()=>adjustStock(id,(+$('#q').value||1));$('#edit').onclick=()=>openStockForm(id);$('#del').onclick=()=>deleteStock(id)}
function adjustStock(id,d){let x=data.items.find(i=>i.id===id),old=x.qty;x.qty=Math.max(0,+(x.qty+d).toFixed(3));let a=x.qty-old;if(a)data.stockHistory.push({id:uid(),name:x.name,type:a>0?'in':'out',qty:Math.abs(a),unit:x.unit,date:new Date().toISOString()});save();closeOverlay();render()}
function openStockForm(id){let x=id?data.items.find(i=>i.id===id):null;openOverlay(`<div class="sheet-head"><h2>${x?'Edit Stok':'Tambah Barang'}</h2><button class="close" onclick="closeOverlay()">✕</button></div>${stockFields(x||{})}<div class="actions"><button class="primary" id="saveStock">Simpan</button></div>`);$('#fCat').onchange=()=>$('#paoBox').classList.toggle('hidden',!paoCats.includes($('#fCat').value));$('#saveStock').onclick=()=>{let o={id:x?.id||uid(),name:$('#fName').value.trim(),category:$('#fCat').value,qty:+$('#fQty').value||0,min:+$('#fMin').value||0,unit:$('#fUnit').value,location:$('#fLoc').value,expiry:$('#fExp').value,opened:$('#fOpened')?.value||'',pao:$('#fPao')?.value||'',note:$('#fNote').value};if(!o.name)return alert('Nama barang belum diisi');if(x){let old=x.qty;Object.assign(x,o);let d=x.qty-old;if(d)data.stockHistory.push({id:uid(),name:x.name,type:d>0?'in':'out',qty:Math.abs(d),unit:x.unit,date:new Date().toISOString()})}else{data.items.push(o);if(o.qty)data.stockHistory.push({id:uid(),name:o.name,type:'in',qty:o.qty,unit:o.unit,date:new Date().toISOString()})}save();closeOverlay();render()}}
function deleteStock(id){let x=data.items.find(i=>i.id===id);if(confirm(`Hapus ${x.name} dari stok?`)){data.items=data.items.filter(i=>i.id!==id);data.shopping=data.shopping.filter(s=>s.stockId!==id);save();closeOverlay();render()}}
function addStockToShopping(id){
 let x=data.items.find(i=>i.id===id);if(!x)return;
 let ex=data.shopping.find(s=>s.stockId===id);
 if(!ex){
   data.shopping.push({id:uid(),stockId:id,name:x.name,category:x.category,qty:1,unit:x.unit,price:0,priority:status(x)==='out'?'Tinggi':'Sedang',expiry:'',note:'',auto:false,checked:false});
   save();render();
   alert(`${x.name} ditambahkan ke daftar belanja.`);
 }else{
   alert(`${x.name} sudah ada di daftar belanja.`);
 }
}
function openShopEdit(id){let x=data.shopping.find(i=>i.id===id),st=data.items.find(i=>i.id===x.stockId);openOverlay(`<div class="sheet-head"><h2>Edit Belanja</h2><button class="close" onclick="closeOverlay()">✕</button></div><div class="form-grid"><div class="field"><label>Nama Barang</label><input id="sName" value="${x.name}"></div><div class="field"><label>Kategori</label><select id="sCat">${cats.map(v=>`<option ${v===x.category?'selected':''}>${v}</option>`).join('')}</select></div><div class="two"><div class="field"><label>Jumlah</label><input id="sQty" type="number" value="${x.qty}"></div><div class="field"><label>Satuan</label><select id="sUnit">${units.map(v=>`<option ${v===x.unit?'selected':''}>${v}</option>`).join('')}</select></div></div><div class="field"><label>Harga (opsional)</label><input id="sPrice" type="number" min="0" step="100" value="${x.price||''}" placeholder="Contoh: 25000"></div><div class="field"><label>Kedaluwarsa</label><input id="sExp" type="date" value="${x.expiry||''}"></div><div class="field"><label>Catatan</label><textarea id="sNote">${x.note||''}</textarea></div>${st&&st.unit!==x.unit?`<div class="field"><label>1 ${x.unit} = berapa ${st.unit}</label><input id="sConv" type="number" value="1"></div>`:''}</div><div class="actions"><button class="secondary" id="saveShop">Simpan Perubahan</button><button class="primary" id="bought">Tandai Sudah Dibeli</button><button class="danger" id="delShop">Hapus dari Daftar Belanja</button></div>`);$('#saveShop').onclick=()=>{Object.assign(x,{name:$('#sName').value,category:$('#sCat').value,qty:+$('#sQty').value||0,unit:$('#sUnit').value,price:+$('#sPrice').value||0,expiry:$('#sExp').value,note:$('#sNote').value,checked:!!x.checked});save();closeOverlay();render()};$('#bought').onclick=()=>markBought(id);$('#delShop').onclick=()=>deleteShop(id)}
function addShop(){data.shopping.push({id:uid(),stockId:null,name:'Item Baru',category:'Dapur',qty:1,unit:'pcs',price:0,priority:'Sedang',expiry:'',note:'',checked:false});save();render();openShopEdit(data.shopping.at(-1).id)}
function markBought(id){let x=data.shopping.find(i=>i.id===id),st=data.items.find(i=>i.id===x.stockId)||data.items.find(i=>i.name.toLowerCase()===x.name.toLowerCase());if(st){let add=x.qty;if(st.unit!==x.unit){let c=+($('#sConv')?.value||prompt(`1 ${x.unit} berisi berapa ${st.unit}?`));if(!c)return;add*=c}st.qty+=add;if(x.expiry)st.expiry=x.expiry;data.stockHistory.push({id:uid(),name:st.name,type:'in',qty:add,unit:st.unit,date:new Date().toISOString()})}else{st={id:uid(),name:x.name,category:x.category,qty:x.qty,min:0,unit:x.unit,expiry:x.expiry,location:'',note:x.note,opened:'',pao:''};data.items.push(st);data.stockHistory.push({id:uid(),name:st.name,type:'in',qty:st.qty,unit:st.unit,date:new Date().toISOString()})}data.shopHistory.push({id:uid(),name:x.name,category:x.category,qty:x.qty,unit:x.unit,price:x.price||0,date:new Date().toISOString()});data.shopping=data.shopping.filter(i=>i.id!==id);save();closeOverlay();render()}
function deleteShop(id){
 const x=data.shopping.find(i=>i.id===id);if(!x)return;
 data.shopping=data.shopping.filter(i=>i.id!==id);
 save();closeOverlay();render();
}
$$('.nav').forEach(b=>b.onclick=()=>go(b.dataset.screen));$('#stockSort').onchange=renderStock;$('#histShopBtn').onclick=()=>{histMode='shop';$('#histShopBtn').classList.add('on');$('#histStockBtn').classList.remove('on');renderHistory()};$('#histStockBtn').onclick=()=>{histMode='stock';$('#histStockBtn').classList.add('on');$('#histShopBtn').classList.remove('on');renderHistory()};$('#goLow').onclick=()=>{stockStatusFilter='low';go('stock')};$('#goExpiry').onclick=()=>{expiryOnly=true;stockFilter='all';stockStatusFilter='all';go('stock')};$('#overlay').onclick=e=>{if(e.target.id==='overlay')closeOverlay()};$('#searchBtn').onclick=()=>{let v=prompt('Cari barang:',searchTerm);if(v!==null){searchTerm=v;render()}};$('#filterBtn').onclick=()=>alert('Gunakan kategori, status, dan Urutkan untuk memfilter stok.');$('#resetDemo').onclick=()=>{data=JSON.parse(JSON.stringify(demo));save();render()};$$('[data-stockstatus]').forEach(b=>b.onclick=()=>{stockStatusFilter=stockStatusFilter===b.dataset.stockstatus?'all':b.dataset.stockstatus;expiryOnly=false;renderStock()});
$('#plusBtn').onclick=()=>{const active=document.querySelector('.screen.active')?.id;if(active==='stock')openStockForm();else if(active==='shop')addShop();};
$('#saveShoppingBtn').onclick=saveAllShopping;
$('#todayText').textContent=new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
go('home');
if('serviceWorker' in navigator){
  addEventListener('load',async()=>{
    try{
      const reg=await navigator.serviceWorker.register('./service-worker.js?v=232');
      await reg.update();
    }catch(e){ console.warn('SW register failed',e); }
  });
}

