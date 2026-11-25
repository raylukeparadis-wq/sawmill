// Factory mills compared with the current design. A static site can't search the
// web live, so this uses prices and specs checked by hand. Update MILLS (and
// MILLS_CHECKED) to refresh. Lengths are in inches, prices in US dollars.

const MILLS_CHECKED='November 23, 2026';

// ext: track or bed extension needed for longer logs. max = most you can add (null = no limit).
// powerFeed / debarker: price of the factory option, 0 = included, null = not offered or not listed.
const MILLS=[
  {name:'Wood-Mizer LT15WIDE',engine:'25 HP gas',hp:25,price:12695,
   dia:36,width:35.5,len:212,blade:176,
   ext:{len:80,price:null,note:'6′ 8″ bed extension, price not listed'},
   powerFeed:1325,debarker:null,
   src:'https://woodmizer.com/store/Product/index?id=1130',
   optSrc:'https://woodmizer.com/us/sawmill-accessories'},
  {name:'Norwood HD36V2',engine:'23 HP Briggs & Stratton Vanguard',hp:23,price:11699,
   dia:36,width:null,len:156,blade:167,
   ext:{len:24,price:488,max:2,note:'2′ detachable bed extension, $488 each'},
   powerFeed:4321.55,powerFeedNote:'Power and computer setworks bundle',
   debarker:4470,debarkerNote:'2022 Norwood price list; may have changed',
   src:'https://www.woodcraft.com/products/norwood-sawmills-hd36v2-portable-sawmill-23-hp',
   optSrc:'https://norwoodsawmills.com/products/detachable-2-foot-bed-extension-hd36-hd36v2-hd38-lm34'},
  {name:'Frontier OS35',engine:'22 HP V-twin',hp:22,price:5987,
   dia:35,width:33,len:136,blade:null,
   ext:{len:84,price:349,note:'7′ track extension, $349 (listed for OS23–OS31; OS35 may differ)'},
   powerFeed:null,debarker:null,
   src:'https://www.woodcraft.com/products/norwood-sawmills-os35-portable-sawmill-22-hp',
   optSrc:'https://reach.dog/shop/frontier-sawmills/products/7-ft-2-1m-bed-extension'},
  {name:'Woodland Mills HM130MAX',engine:'14 HP Kohler gas',hp:14,price:5775,
   dia:30,width:null,len:125,blade:null,
   ext:{len:77,price:610,note:'6′ 5″ track extension, $610'},
   powerFeed:null,debarker:null,
   src:'https://woodlandmills.com/',
   optSrc:'https://woodlandmills.com/hm130max-track-extension/'}
];


function millMatch(m,d){
  const inch=x=>x*25.4;
  const needLen=d.len/25.4;
  let n=0,extCost=0,extUnknown=false,tooShort=false;
  if(needLen>m.len){
    n=Math.ceil((needLen-m.len)/m.ext.len);
    if(m.ext.max!=null&&n>m.ext.max){n=m.ext.max;tooShort=true}
    if(m.ext.price==null)extUnknown=true;else extCost=n*m.ext.price;
  }
  const adds=[],missing=[];
  if(d.feed){m.powerFeed==null?missing.push('power feed'):adds.push(['Power feed',m.powerFeed])}
  if(d.debarker){m.debarker==null?missing.push('debarker'):adds.push(['Debarker',m.debarker])}
  const total=m.price+extCost+adds.reduce((s,a)=>s+a[1],0);
  return{n,extCost,extUnknown,tooShort,adds,missing,total,
    diaOk:inch(m.dia)>=d.dia,lenOk:!tooShort,hpOk:m.hp>=d.hp-2};
}

function renderCompare(v,r){
  const box=document.getElementById('compare');if(!box)return;
  const tier=S.priceList||'typical';
  const build=costLines(v,r,tier).reduce((s,l)=>s+l.q*l.each,0);
  const d={dia:v.logDia,len:v.logLen,width:r.throat,hp:engineFor(tier).hp,blade:r.bladeLen,
    feed:S.feed==='chain',debarker:S.debarker!=='none'};
  const rows=MILLS.map(m=>({m,x:millMatch(m,d)}));
  const len=x=>x==null?'<span class="muted">not listed</span>':L(x*25.4);
  const ok=(b,t)=>`<span class="${b?'yes':'no'}">${b?'✓':'✗'}</span> ${t}`;
  const feats=()=>{const f=[];if(d.feed)f.push('power feed');if(d.debarker)f.push('debarker');return f};

  const max=Math.max(build,...rows.map(o=>o.x.total));
  const bar=(label,val,cls,note)=>`<div class="cbar"><div class="clab">${label}</div>
    <div class="ctrack"><div class="cfill ${cls}" style="width:${Math.max(2,val/max*100)}%"></div></div>
    <div class="cval">${usd(val)}${note?` <span class="muted">${note}</span>`:''}</div></div>`;

  const cols=[{h:'Your build',dia:d.dia,len:d.len,width:d.width,hp:d.hp,blade:d.blade,base:build,total:build,own:true},
    ...rows.map(({m,x})=>({h:m.name,m,x}))];
  const cell=(c,fn)=>c.own?fn.own():fn.mill(c.m,c.x);

  box.innerHTML=`
  <h2>Factory mills compared</h2>
  <p class="note" style="margin-top:0">Matched against your current design: ${L(d.dia)} logs × ${L(d.len)} long${feats().length?', with '+feats().join(' and '):''}. Each price includes the extensions and options a mill needs to match. Prices checked ${MILLS_CHECKED}; this page can't search the web live.</p>
  <div class="cbars">
    ${bar('Your build ('+tier+')',build,'own')}
    ${rows.map(({m,x})=>bar(m.name,x.total,x.missing.length||x.tooShort?'short':'mill',
      x.missing.length?'no '+x.missing.join(', '):(x.extUnknown?'+ extension, price not listed':''))).join('')}
  </div>
  <div class="tablebox" style="margin-top:10px"><table class="ctab">
    <thead><tr><th></th>${cols.map(c=>`<th>${c.h}</th>`).join('')}</tr></thead>
    <tbody>
      <tr><td>Largest log</td>${cols.map(c=>`<td>${cell(c,{own:()=>L(c.dia),mill:(m,x)=>ok(x.diaOk,len(m.dia))})}</td>`).join('')}</tr>
      <tr><td>Width of cut</td>${cols.map(c=>`<td>${cell(c,{own:()=>L(c.width),mill:m=>len(m.width)})}</td>`).join('')}</tr>
      <tr><td>Log length, standard</td>${cols.map(c=>`<td>${cell(c,{own:()=>L(c.len),mill:m=>len(m.len)})}</td>`).join('')}</tr>
      <tr><td>Extensions to reach ${L(d.len)}</td>${cols.map(c=>`<td>${cell(c,{own:()=>'—',
        mill:(m,x)=>x.n?ok(!x.tooShort,`${x.n} × ${x.extUnknown?'(price not listed)':usd(m.ext.price)}`)+`<div class="muted">${m.ext.note}</div>`:ok(true,'none needed')})}</td>`).join('')}</tr>
      <tr><td>Engine</td>${cols.map(c=>`<td>${cell(c,{own:()=>engineFor(tier).name,mill:(m,x)=>ok(x.hpOk,m.engine)})}</td>`).join('')}</tr>
      <tr><td>Blade length</td>${cols.map(c=>`<td>${cell(c,{own:()=>L(c.blade),mill:m=>len(m.blade)})}</td>`).join('')}</tr>
      ${d.feed?`<tr><td>Power feed</td>${cols.map(c=>`<td>${cell(c,{own:()=>'Chain drive, Arduino',
        mill:m=>m.powerFeed==null?ok(false,'not offered'):ok(true,usd(m.powerFeed)+(m.powerFeedNote?`<div class="muted">${m.powerFeedNote}</div>`:''))})}</td>`).join('')}</tr>`:''}
      ${d.debarker?`<tr><td>Debarker</td>${cols.map(c=>`<td>${cell(c,{own:()=>S.debarker==='belt'?'Belt drive':'Electric',
        mill:m=>m.debarker==null?ok(false,'not offered'):ok(true,usd(m.debarker)+(m.debarkerNote?`<div class="muted">${m.debarkerNote}</div>`:''))})}</td>`).join('')}</tr>`:''}
      <tr class="ctot"><td>Base price</td>${cols.map(c=>`<td>${c.own?'—':usd(c.m.price)}</td>`).join('')}</tr>
      <tr class="ctot"><td>Price to match your build</td>${cols.map(c=>`<td><b>${usd(c.own?c.total:c.x.total)}</b>${!c.own&&c.x.extUnknown?'<div class="muted">plus extension</div>':''}</td>`).join('')}</tr>
      <tr><td>Source</td>${cols.map(c=>`<td>${c.own?'Cost estimate below':`<a href="${c.m.src}" target="_blank" rel="noopener">price</a> · <a href="${c.m.optSrc}" target="_blank" rel="noopener">options</a>`}</td>`).join('')}</tr>
    </tbody>
  </table></div>
  <p class="note">Factory prices exclude shipping and tax; your build excludes labour and welding gear. ✗ means the mill can't match that part of your design as listed.</p>`;
}
