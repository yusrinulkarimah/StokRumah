

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
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){console.error(e)}},uid=()=>Date.now()+Math.floor(Math.random()*100000);
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
  $('#pageTitle').textContent={home:'Beranda',stock:'Stok',shop:'Belanja',history:'Riwayat',more:'Lainnya'}[id]||'Beranda';
  $('#searchBtn').style.display=['stock','shop'].includes(id)?'grid':'none';
  $('#plusBtn').style.display=['stock','shop'].includes(id)?'grid':'none';
  $('#filterBtn').style.display=id==='stock'?'grid':'none';
  render();
}
function render(){syncShopping();renderHome();renderStockTabs();renderStock();renderShop();renderHistory()}
function renderHome(){
  let low=data.items.filter(x=>status(x)==='low').length,out=data.items.filter(x=>status(x)==='out').length,exp=data.items.filter(x=>{let d=dayDiff(effExp(x));return d>=0&&d<=30}).length;
  $('#lowText').textContent=`${low+out} barang hampir habis / habis`;$('#expiryText').textContent=`${exp} barang hampir kedaluwarsa`;
  $('#catGrid').innerHTML=cats.map(c=>`<div class="cat" data-cat="${c}"><div class="ico">${icons[c]}</div><b>${c}</b></div>`).join('');
  $$('[data-cat]').forEach(b=>b.onclick=()=>{stockFilter=b.dataset.cat;stockStatusFilter='all';expiryOnly=false;go('stock')});
}
function renderStockTabs(){
  $('#stockTabs').innerHTML=['all',...cats].map(c=>`<button class="tab ${stockFilter===c?'on':''}" data-sf="${c}">${c==='all'?'Semua':c}</button>`).join('');
  $$('[data-sf]').forEach(b=>b.onclick=()=>{stockFilter=b.dataset.sf;expiryOnly=false;renderStockTabs();renderStock()});
}
function renderStock(){
  let a=[...data.items];
  if(stockFilter!=='all')a=a.filter(x=>x.category===stockFilter);if(stockStatusFilter!=='all')a=a.filter(x=>status(x)===stockStatusFilter);if(expiryOnly)a=a.filter(x=>{let d=dayDiff(effExp(x));return d>=0&&d<=30});if(searchTerm)a=a.filter(x=>x.name.toLowerCase().includes(searchTerm.toLowerCase()));
  let so=$('#stockSort').value;a.sort((x,y)=>so==='name'?x.name.localeCompare(y.name):so==='low'?(x.qty-x.min)-(y.qty-y.min):so==='expiry'?effExp(x).localeCompare(effExp(y)):x.category.localeCompare(y.category));
  $('#stockCount').textContent=`${a.length} barang`;let low=data.items.filter(x=>status(x)==='low').length,out=data.items.filter(x=>status(x)==='out').length,safe=data.items.filter(x=>status(x)==='safe').length;$('#ssLow').textContent=low;$('#ssThin').textContent=out;$('#ssSafe').textContent=safe;
  $('#stockList').innerHTML=a.length?a.map(x=>{const st=status(x)==='safe'?'<span class="badge safe">Aman</span>':status(x)==='low'?'<span class="badge warn-b">Hampir Habis</span>':'<span class="badge danger-b">Habis</span>';return `<div class="stock-tr"><div class="name" data-stock="${x.id}">${esc(x.name)}</div><div class="cell">${x.qty}</div><div class="cell">${x.min}</div><div class="cell">${esc(x.unit)}</div><div class="cell">${x.expiry?fmt(x.expiry):'–'}</div><div class="cell">${paoCats.includes(x.category)&&x.pao?esc(x.pao):'–'}</div><div class="cell">${st}</div><div class="stock-actions"><button class="mini-edit cart-btn ${data.shopping.some(s=>s.stockId===x.id)?'in-cart':''}" data-cartstock="${x.id}" title="Tambah ke belanja" aria-label="Tambah ${esc(x.name)} ke belanja">🛒</button><button class="mini-trash" data-delstock="${x.id}" title="Hapus">🗑</button></div></div>`}).join(''):'<div class="empty">Belum ada barang.</div>';
  $$('[data-stock]').forEach(e=>e.onclick=()=>openStockDetail(Number(e.dataset.stock)));
  $$('[data-cartstock]').forEach(e=>e.onclick=ev=>{ev.preventDefault();ev.stopPropagation();addStockToShopping(Number(e.dataset.cartstock))});
  $$('[data-delstock]').forEach(e=>e.onclick=ev=>{ev.preventDefault();ev.stopPropagation();deleteStock(Number(e.dataset.delstock))});
}
function renderShop(){
  let a=[...data.shopping];
  if(searchTerm)a=a.filter(x=>x.name.toLowerCase().includes(searchTerm.toLowerCase()));
  let so=$('#shopSort').value,p={Tinggi:0,Sedang:1,Rendah:2};
  a.sort((x,y)=>so==='name'?x.name.localeCompare(y.name):so==='category'?x.category.localeCompare(y.category):(p[x.priority]??9)-(p[y.priority]??9));
  $('#shopPending').textContent=`${a.length} item`;
  const total=a.filter(x=>x.checked).reduce((t,x)=>t+(Number(x.price)||0)*(Number(x.qty)||0),0);
  $('#shopTotal').textContent='Rp '+total.toLocaleString('id-ID');

  $('#shopList').innerHTML=a.length?a.map(x=>{
    const st=data.items.find(i=>i.id===x.stockId);
    return `<div class="row shop-row ${x.checked?'checked':''}">
      <input class="shop-check" type="checkbox" data-checkshop="${x.id}" ${x.checked?'checked':''} aria-label="Sudah dibeli">
      <div class="shop-product" data-shop="${x.id}">
        <div class="shop-product-name">${esc(x.name)}</div>
        <div class="shop-tools">
          <div class="qty-stepper">
            <button type="button" data-decshop="${x.id}" aria-label="Kurangi jumlah">−</button>
            <span>${Number(x.qty)||0}</span>
            <button type="button" data-incshop="${x.id}" aria-label="Tambah jumlah">+</button>
          </div>
          <span class="shop-unit">${esc(x.unit)}</span>
          <label class="price-edit" title="Harga per ${esc(x.unit)}"><span>Rp</span><input type="number" min="0" step="100" data-priceshop="${x.id}" value="${Number(x.price)||''}" placeholder="0"></label>
        </div>
        <div class="current-stock">${st?`Stok terkini ${st.qty} ${esc(st.unit)} · Minimum ${st.min} ${esc(st.unit)}`:'Belum ada di stok'}</div>
      </div>
      <div class="row-actions"><span>›</span><button class="trash" data-delshop="${x.id}" aria-label="Hapus">🗑️</button></div>
    </div>`;
  }).join(''):'<div class="empty">Daftar belanja kosong.</div>';

  $$('[data-shop]').forEach(e=>e.onclick=()=>openShopEdit(Number(e.dataset.shop)));
  $$('[data-checkshop]').forEach(e=>e.onchange=()=>{const x=data.shopping.find(i=>i.id===Number(e.dataset.checkshop));if(x){x.checked=e.checked;save();renderShop()}});
  $$('[data-incshop]').forEach(e=>e.onclick=ev=>{ev.preventDefault();ev.stopPropagation();const x=data.shopping.find(i=>i.id===Number(e.dataset.incshop));if(x){x.qty=Number((Number(x.qty||0)+1).toFixed(3));save();renderShop()}});
  $$('[data-decshop]').forEach(e=>e.onclick=ev=>{ev.preventDefault();ev.stopPropagation();const x=data.shopping.find(i=>i.id===Number(e.dataset.decshop));if(x){x.qty=Math.max(0,Number((Number(x.qty||0)-1).toFixed(3)));save();renderShop()}});
  $$('[data-priceshop]').forEach(e=>{
    e.onclick=ev=>ev.stopPropagation();
    e.oninput=()=>{const x=data.shopping.find(i=>i.id===Number(e.dataset.priceshop));if(x){x.price=Number(e.value)||0;save();const total=data.shopping.filter(i=>i.checked).reduce((t,i)=>t+(Number(i.price)||0)*(Number(i.qty)||0),0);$('#shopTotal').textContent='Rp '+total.toLocaleString('id-ID')}};
  });
  $$('[data-delshop]').forEach(e=>e.onclick=ev=>{ev.preventDefault();ev.stopPropagation();deleteShop(Number(e.dataset.delshop))});
}
function renderHistory(){
  if(histMode==='shop'){
    const a=[...data.shopHistory];
    if(!a.length){$('#historyContent').innerHTML='<div class="empty">Belum ada riwayat belanja.</div>';return}
    const groups=new Map();
    a.forEach(h=>{
      const dt=new Date(h.date);
      const fallback=`legacy-${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}-${dt.getHours()}-${dt.getMinutes()}`;
      const key=h.batchId||fallback;
      if(!groups.has(key))groups.set(key,{date:h.date,items:[]});
      groups.get(key).items.push(h);
      if(new Date(h.date)>new Date(groups.get(key).date))groups.get(key).date=h.date;
    });
    const ordered=[...groups.values()].sort((x,y)=>new Date(y.date)-new Date(x.date));
    $('#historyContent').innerHTML=ordered.map((g,idx)=>{
      const total=g.items.reduce((t,h)=>t+(Number(h.price)||0)*(Number(h.qty)||0),0);
      const dt=new Date(g.date);
      return `<div class="history-purchase">
        <div class="purchase-head">
          <div class="purchase-icon"><svg viewBox="0 0 24 24"><path d="M3 5h2l2 10h10l2-7H7"/><circle cx="9" cy="19" r="1"/><circle cx="17" cy="19" r="1"/></svg></div>
          <div class="purchase-meta"><b>Belanja ${dt.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'})}</b><small>${dt.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})} · ${g.items.length} item</small></div>
          <div class="purchase-total"><b>${total?'Rp '+total.toLocaleString('id-ID'):'Selesai'}</b><small>Total pembelian</small></div>
        </div>
        ${g.items.map(h=>`<div class="purchase-item"><div class="item-left"><span class="item-dot"></span><b>${esc(h.name)}</b></div><span>${h.qty} ${esc(h.unit)}</span></div>`).join('')}
      </div>`;
    }).join('');
    return;
  }
  const a=data.stockHistory;
  $('#historyContent').innerHTML=a.length?a.slice().reverse().map(h=>`<div class="hist-row"><div><b>${esc(h.name)}</b><small class="${h.type==='in'?'in':'out'}">${h.type==='in'?'Stok Masuk':'Stok Keluar'} ${h.type==='in'?'+':'-'}${h.qty} ${esc(h.unit)}</small></div><small>${new Date(h.date).toLocaleString('id-ID')}</small></div>`).join(''):'<div class="empty">Belum ada riwayat stok.</div>';
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
  if(!confirm(`Simpan ${bought.length} barang yang sudah dibeli?`))return;
  const done=[];
  const purchaseTime=new Date().toISOString();
  const batchId='purchase-'+Date.now();
  for(const x of bought){
    let st=data.items.find(i=>i.id===x.stockId)||data.items.find(i=>i.name.toLowerCase()===x.name.toLowerCase());
    if(st){
      let add=Number(x.qty)||0;
      if(st.unit!==x.unit){
        const c=Number(prompt(`1 ${x.unit} ${x.name} berisi berapa ${st.unit}?`));
        if(!c||c<=0)continue;
        add*=c;
      }
      st.qty=Number((Number(st.qty)+add).toFixed(3));
      if(x.expiry)st.expiry=x.expiry;
      data.stockHistory.push({id:uid(),name:st.name,type:'in',qty:add,unit:st.unit,date:purchaseTime});
    }else{
      st={id:uid(),name:x.name,category:x.category,qty:Number(x.qty)||0,min:0,unit:x.unit,expiry:x.expiry||'',location:'',note:x.note||'',opened:'',pao:''};
      data.items.push(st);
      if(st.qty)data.stockHistory.push({id:uid(),name:st.name,type:'in',qty:st.qty,unit:st.unit,date:purchaseTime});
    }
    data.shopHistory.push({id:uid(),batchId,name:x.name,category:x.category,qty:x.qty,unit:x.unit,price:x.price||0,date:purchaseTime});
    if(x.stockId)data.dismissedShopping=data.dismissedShopping.filter(i=>i!==x.stockId);
    done.push(x.id);
  }
  data.shopping=data.shopping.filter(x=>!done.includes(x.id));
  save();render();
  toast('Belanja tersimpan dan stok diperbarui');
}
$$('.nav').forEach(b=>b.onclick=()=>go(b.dataset.screen));
$('#stockSort').onchange=renderStock;$('#shopSort').onchange=renderShop;
$('#histShopBtn').onclick=()=>{histMode='shop';$('#histShopBtn').classList.add('on');$('#histStockBtn').classList.remove('on');renderHistory()};$('#histStockBtn').onclick=()=>{histMode='stock';$('#histStockBtn').classList.add('on');$('#histShopBtn').classList.remove('on');renderHistory()};
$('#goLow').onclick=()=>{stockStatusFilter='low';expiryOnly=false;go('stock')};$('#goExpiry').onclick=()=>{expiryOnly=true;stockFilter='all';stockStatusFilter='all';go('stock')};
$('#overlay').onclick=e=>{if(e.target.id==='overlay')closeOverlay()};$('#searchBtn').onclick=()=>{let v=prompt('Cari barang:',searchTerm);if(v!==null){searchTerm=v;render()}};$('#filterBtn').onclick=()=>alert('Gunakan kategori, status, dan Urutkan untuk memfilter stok.');
$('#resetDemo').onclick=()=>{if(confirm('Reset ke data contoh?')){data=cloneDemo();save();render()}};
$$('[data-stockstatus]').forEach(b=>b.onclick=()=>{stockStatusFilter=stockStatusFilter===b.dataset.stockstatus?'all':b.dataset.stockstatus;expiryOnly=false;renderStock()});
$('#plusBtn').onclick=()=>{const active=document.querySelector('.screen.active')?.id;if(active==='stock')openStockForm();else if(active==='shop')addShop()};$('#saveShoppingBtn').onclick=saveAllShopping;
$('#todayText').textContent=new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
stockFilter='all';stockStatusFilter='all';expiryOnly=false;searchTerm='';go('home');
if('serviceWorker'in navigator)addEventListener('load',async()=>{try{const r=await navigator.serviceWorker.register('./service-worker.js?v=fixed');r.update()}catch(e){console.warn('Service worker:',e)}});


