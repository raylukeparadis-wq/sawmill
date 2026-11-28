// Engine choice and cutting speed by wood.
// Pick an engine, or let the price list pick one. The choice sets the engine
// cost line, the charging amps in the power plan, the factory-mill comparison
// and the cutting speeds. Wood choices and sawyer's rules come from woods.js
// in three layers: group, then species, then condition.

const ENGINES={
  v18:{hp:18,name:'Briggs & Stratton Vanguard 18 HP, 570 cc',chargeA:16,price:1618.99,src:'s37'},
  d23:{hp:23,name:'DuroMax XP23HPE 23 HP, 713 cc',chargeA:3,price:999,src:'s1'},
  v23:{hp:23,name:'Briggs & Stratton Vanguard 23 HP, 627 cc',chargeA:16,price:1779,src:'s2'},
  k25:{hp:25,name:'Kohler Command Pro 25 HP, 747 cc',chargeA:20,price:2795,src:'s3'}
};
const LIST_ENGINE=['d23','v23','k25'];   // what each price list buys: budget, typical, premium

function engineKey(tier){return ENGINES[S.engine]?S.engine:LIST_ENGINE[TIER_IX[tier]]}
function engineFor(tier){return ENGINES[engineKey(tier)]}

const USABLE=0.65;      // share of rated gross HP that reaches the blade (rating, belts, friction, heat)
const FEED_CAP=30;      // ft/min, about as fast as anyone can push, and the blade can clear sawdust
const CUT_SHARE=0.4;    // share of the day actually cutting; the rest is loading, turning and offbearing

// Engine HP left for sawing after the add-on alternator, if the power plan needs one.
function sawHp(e,tier){
  const p=typeof powerPlan==='function'?powerPlan(tier):{altHp:0};
  return Math.max(0,e.hp*USABLE-p.altHp);
}

// Feed speed in ft/min. k is HP-minutes per cubic inch of kerf (see woods.js).
function feedFtMin(hp,k,kerfIn,widthIn){
  if(widthIn<=0||kerfIn<=0)return 0;
  return Math.min(FEED_CAP,hp/(k*kerfIn*widthIn)/12);
}

function renderSpeeds(v,r){
  const box=document.getElementById('speeds');if(!box)return;
  const tier=S.priceList||'typical',key=engineKey(tier),eng=ENGINES[key];
  const kerfIn=v.kerf/25.4,fullIn=r.throat/25.4,boardIn=v.boardT/25.4;
  const wSel=S.speedW||'full';
  const widthIn=wSel==='full'?fullIn:+wSel;
  const wp=woodPick(),hp=sawHp(eng,tier);
  const fmt=x=>x>=FEED_CAP?`${FEED_CAP}+`:x>=10?x.toFixed(0):x.toFixed(1);
  const bfHr=ft=>Math.round(ft*60*widthIn*boardIn/12*CUT_SHARE/10)*10;
  const secs=ft=>ft?Math.round(8/ft*60):0;
  const alt=typeof powerPlan==='function'?powerPlan(tier).altHp:0;

  const sel=(id,label,list,val)=>`<div class="field full"><label for="${id}">${label}</label><div class="in"><select id="${id}">${
    list.map(([k,t])=>`<option value="${k}"${k===val?' selected':''}>${t}</option>`).join('')}</select></div></div>`;
  const engOpts=[['list',`Match price list (${ENGINES[LIST_ENGINE[TIER_IX[tier]]].hp} HP)`],
    ...Object.entries(ENGINES).map(([k,e])=>[k,`${e.hp} HP — ${e.name.split(',')[0]}, ${usd(e.price)}`])];
  const wOpts=[['12','12″ wide cut'],['20','20″ wide cut'],['full',`Full width, ${fullIn.toFixed(1)}″`]];

  // Every species in the chosen group, at the chosen condition, with your engine.
  const spRows=wp.list.map(s=>{
    const f=feedFtMin(hp,speciesK(s,wp.cond),kerfIn,widthIn),on=s.id===wp.sp.id;
    return `<tr${on?' class="pick"':''}><td>${on?'▶ ':''}${s.name}</td><td class="n">${s.janka.toLocaleString()}</td><td class="n">${fmt(f)}</td><td class="n">${secs(f)} s</td><td class="n">${bfHr(f).toLocaleString()}</td></tr>`;
  }).join('');

  // Every engine on the chosen species and condition.
  const order=Object.keys(ENGINES).sort((a,b)=>ENGINES[a].hp-ENGINES[b].hp||ENGINES[a].price-ENGINES[b].price);
  const engRows=order.map(k=>{
    const e=ENGINES[k],f=feedFtMin(sawHp(e,tier),wp.k,kerfIn,widthIn),on=k===key;
    return `<tr${on?' class="pick"':''}><td>${on?'▶ ':''}${e.hp} HP<div class="muted">${e.name.split(',')[0]}</div></td><td class="n">${fmt(f)}</td><td class="n">${secs(f)} s</td><td class="n">${bfHr(f).toLocaleString()}</td></tr>`;
  }).join('');

  const f=feedFtMin(hp,wp.k,kerfIn,widthIn);
  box.innerHTML=`
  <h2>Engine and cutting speed</h2>
  ${sel('engSel','Engine',engOpts,ENGINES[S.engine]?S.engine:'list')}
  ${sel('woodG','1. Wood group',Object.entries(WOOD_GROUPS).map(([k,g])=>[k,`${g.name}, ${g.hook} hook`]),wp.g)}
  ${sel('woodS','2. Species',wp.list.map(s=>[s.id,`${s.name} (Janka ${s.janka.toLocaleString()})`]),wp.sp.id)}
  ${sel('woodC','3. Condition',Object.entries(WOOD_CONDITIONS).map(([k,c])=>[k,c.name]),wp.cond)}
  ${sel('widthSel','Width of cut',wOpts,wSel)}
  <div class="big">
    <div><b>${fmt(f)} ft/min</b><span>${wp.sp.name}, ${widthIn.toFixed(1)}″ wide</span></div>
    <div><b>${secs(f)} s</b><span>per 8′ cut</span></div>
    <div><b>${hp.toFixed(1)} HP</b><span>reaches the blade from ${eng.hp} HP${alt?`, after ${alt.toFixed(1)} HP for the alternator`:''}</span></div>
  </div>
  <h3>Sawyer's rules for this log</h3>
  <ul class="note rules">${wp.rules.map(x=>`<li>${x}</li>`).join('')}</ul>
  <h3>${WOOD_GROUPS[wp.g].name}, ${WOOD_CONDITIONS[wp.cond].name.toLowerCase()}, ${eng.hp} HP</h3>
  <div class="tablebox"><table>
    <thead><tr><th>Species</th><th class="n">Janka</th><th class="n">ft/min</th><th class="n">8′ cut</th><th class="n">Bd ft/hr</th></tr></thead>
    <tbody>${spRows}</tbody></table></div>
  <h3>${wp.sp.name} with each engine</h3>
  <div class="tablebox"><table>
    <thead><tr><th>Engine</th><th class="n">ft/min</th><th class="n">8′ cut</th><th class="n">Bd ft/hr</th></tr></thead>
    <tbody>${engRows}</tbody></table></div>`;
  const on=(id,fn)=>{box.querySelector('#'+id).onchange=e=>{fn(e.target.value);update()}};
  on('engSel',x=>S.engine=x);
  on('woodG',x=>{S.woodG=x;S.woodS=speciesIn(x)[0].id});
  on('woodS',x=>S.woodS=x);
  on('woodC',x=>S.woodC=x);
  on('widthSel',x=>S.speedW=x);
}
