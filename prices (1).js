// Build cost estimate. Three price lists (budget, typical, premium) in US dollars.
// Prices marked with a source were checked online in November 2026; the rest are
// rough estimates for planning. Quantities follow the current design.

const PRICE_LISTS={budget:'Budget (cheapest new or surplus)',typical:'Typical (mid-range new)',premium:'Premium (name-brand new)'};
const TIER_IX={budget:0,typical:1,premium:2};

// Steel by weight, $/lb. 3×3×1/8 tube, 24 ft, about $122 at Steel & Pipe Supply (≈ $1.18/lb).
const STEEL_PER_LB=[0.95,1.25,1.60];

const PRICE_SOURCES={
  s1:['DuroMax XP23HPE 23 HP V-twin, MSRP $999','https://www.duromaxpower.com/products/duromax-xp23hpe-713cc-23-hp-v-twin-electric-start-engine'],
  s2:['Briggs & Stratton Vanguard 23 HP, about $1,779 at Walmart','https://www.walmart.com/ip/23hp-Briggs-Vanguard-Engine-10-1-Tapered-Shaft-386447-0440-G1/982973993'],
  s3:['Kohler Command Pro 25 HP, about $2,795 on eBay','https://www.ebay.com/p/22019975496'],
  s4:['205″ NotchTip blades, $30.10 each in a 15-pack (Wood-Mizer)','https://woodmizer.com/us/205-notchtip-resaw-blades-bf265742059s'],
  s5:['205″ Munkfors blades, $204.99 for 6 (Sharp Tool)','https://sharptool.com/products/bandsaw-blades-for-sawmills-205-x-1-250-x-042-x-3-4-box-of-6-pcs'],
  s6:['205″ Munkfors DeckDuster blades, $239.10 for 6','https://www.sharptool.com/products/bandsaw-blades-for-sawmills-205-x-1-250-x-042-x-3-4-deck-duster-box-of-6-pcs'],
  s7:['Dual-pulley centrifugal clutch, 1″ bore, $112.99 (FridayParts)','https://www.fridayparts.com/1-bore-dual-centrifugal-belt-pulley-clutch-for-engine-8hp-16hp'],
  s8:['Comet 350 series centrifugal clutch, 1″ bore, $115.29','https://www.mfgsupply.com/200271a.html'],
  s9:['Hilliard extreme duty clutch, 1″ bore, list $140','https://www.mfgsupply.com/h1p37.html'],
  s10:['1″-5 Acme rod, 36″, $30.79 (Zoro)','https://www.zoro.com/zoro-select-threaded-rod-1-5-steel-plain-finish-36-in-length-24306/i/G0674441/'],
  s11:['1″-5 Acme rod, 36″, $48.29 (eBay)','https://www.ebay.com/itm/395264648006'],
  s12:['1″-5 precision Acme rod, 3 ft, $140.91 (Penn Tool)','https://www.penntoolco.com/01206416'],
  s13:['UCP207-20 pillow blocks, $21.33 for 2 (eBay)','https://www.ebay.com/p/830054623'],
  s14:['UCP207-20 pillow block, $35.59 (Zoro)','https://www.zoro.com/tritan-pillow-block-bearing-ball-1-14-bore-ucp207-20/i/G9447426/'],
  s15:['UCP207-20 pillow block, $51.48 (Motion)','https://www.motion.com/products/sku/03122291'],
  s16:['26″ urethane band wheel tires, $99.95 a pair (eBay)','https://www.ebay.com/itm/281262452209'],
  s17:['3×3×1/8 square tube, 24 ft, $122.16 (Steel & Pipe Supply)','https://core.steelandpipes.com/products/tube-blk-g-11-x-sq-3-x-24'],
  s18:['Buyers Products 12 V right-angle gearmotor, 1.2 HP, 60 rpm, $450.79','https://govets.com/buyers-products-724920098939-310-54486899.html'],
  s19:['Leeson 12 V gearmotor, 1/2 HP, 42 rpm, $1,421.99 (Zoro)','https://www.zoro.com/leeson-12-volt-motor-10873100/i/G3135469'],
  s25:['Raspberry Pi 5 1 GB, $45 (Raspberry Pi)','https://www.raspberrypi.com/news/1gb-raspberry-pi-5-now-available-at-45-and-memory-driven-price-rises/'],
  s26:['Raspberry Pi 5 4 GB, $110 (SparkFun)','https://www.sparkfun.com/raspberry-pi-5-4gb.html'],
  s27:['White-Rodgers 100 A 12 V contactor, $30.72 (Allied)','https://www.alliedelec.com/white-rodgers-120-105851/70989860/'],
  s28:['White-Rodgers 124-910 100 A contactor, $104.99 (Zoro)','https://www.zoro.com/white-rodgers-contactor-124-910/i/G4068945/'],
  s29:['INA226 voltage/current monitor module, $5.38 (eBay); shunt extra','https://www.ebay.com/itm/INA226-Bi-Directional-Voltage-Current-Power-Alert-Monitor-Module-I2C-IIC-36V/222703151862'],
  s30:['INA226 voltage/current monitor module, $31.20 (Newegg)','https://www.newegg.com/p/37B-007T-003T1'],
  s31:['Delco 10SI-type 63 A alternator, $89.95 (AlternatorParts)','https://alternatorparts.com/10si-12si-high-output-alternators.html'],
  s32:['DB Electrical 10SI one-wire 63 A alternator, $102.99 (Zoro)','https://zoro.com/db-electrical-new-alternator-for-10si-delco-1-wire-63-amp-with-tach-r-terminal-stud-on-rear-400-12393/i/G304238526'],
  s33:['10SI self-excited one-wire 63 A alternator, $176.15 (FabHeavyParts)','https://www.fabheavyparts.com/a/amp/products/12v-63a-alternator-10459509-90-01-3125n-13-4011s-10si-self-excited-1-wire-5-8-pulley'],
  s34:['Powermaster 7294 12SI 100 A alternator, $134.99 (Walmart)','https://www.walmart.com/ip/1501-Denim-Refurbished-Wide-GPS-Cut-Laptop-RKV25G0XIB-s-Laptop-Nail/49346307'],
  s35:['Powermaster 10SI 100 A alternator, $142.99 (Jegs)','https://Jegs.com/p/Powermaster/Powermaster-10si-Style-Alternators/1534947/10002/-1'],
  s36:['12SI 140 A self-exciting alternator, $169.95 (AlternatorParts)','https://alternatorparts.com/10si-12si-high-output-alternators.html'],
  s22:['#50 roller chain, 10 ft, $17.00 (Walmart)','https://www.walmart.com/ip/Speeco-Chain-Roller-No-50-10Ft-6501/21987855'],
  s23:['#50 roller chain, 50 ft, $246.99 (Zoro)','https://www.zoro.com/tritan-roller-chain-single-strand-riveted-50ft-50-1r-x-50ft/i/G2064721/'],
  s24:['#50 roller chain, $12.27/ft (Motion)','https://www.motion.com/products/sku/05658751']
};

// [group, item, qty(v,r), [budget, typical, premium] each, [sources per tier]]
const PRICE_ITEMS=[
  ['Saw head','Band wheels, 26″',()=>2,[120,350,900]],
  ['Saw head','Blade tires',()=>2,[20,50,50],[null,'s16','s16']],
  ['Saw head','Wheel shafts, 1-1/4″',()=>2,[20,35,60]],
  ['Saw head','Pillow block bearings, 1-1/4″',()=>4,[11,36,51],['s13','s14','s15']],
  ['Saw head','Blade tensioner',()=>1,[40,90,180]],
  ['Saw head','Roller blade guides',()=>2,[40,90,180]],
  ['Saw head','Blades',()=>5,[30,34,40],['s4','s5','s6']],
  ['Saw head','Blade lube tank and fittings',()=>1,[25,45,90]],
  ['Drive','Engine, 23–25 HP V-twin',()=>1,[999,1779,2795],['s1','s2','s3']],
  ['Drive','Centrifugal clutch, 1″ bore',()=>1,[113,115,140],['s7','s8','s9']],
  ['Drive','Wheel pulley, 13½″ B-section',()=>1,[45,75,120]],
  ['Drive','Drive belt',()=>1,[15,25,40]],
  ['Drive','Battery and cables',()=>1,[70,100,150]],
  ['Drive','Throttle cable and kill switch',()=>1,[20,35,60]],
  ['Lift','Lift screws, 1″-5 Acme, 36″',()=>2,[31,48,141],['s10','s11','s12']],
  ['Lift','Lift nuts, 1″-5 Acme',()=>2,[15,25,60]],
  ['Lift','Flange bearings, 1″',()=>4,[8,20,40]],
  ['Lift','#40 chain and 3 sprockets',()=>1,[45,70,120]],
  ['Lift','Crank or handwheel',()=>1,[15,30,60]],
  ['Lift','UHMW head slides',()=>8,[5,10,20]],
  ['Gantry travel','Track wheels, 4″ flanged',()=>4,[20,35,60]],
  ['Gantry travel','Axle bolts and push handle',()=>1,[25,40,70]],
  ['Log handling','Log dogs',()=>2,[30,60,120]],
  ['Log handling','Log stops',()=>4,[10,20,40]],
  ['Log handling','Leveling feet',(v,r)=>r.posts,[6,12,25]],
  ['Log handling','Cant hook',()=>1,[40,70,130]],
  ['Shop','Bolts, nuts and washers',()=>1,[60,100,160]],
  ['Shop','Welding wire or rod',()=>1,[40,60,90]],
  ['Shop','Paint and primer',()=>1,[40,70,120]],
  ['Shop','Grease and grease gun',()=>1,[20,30,50]],
  ['Shop','Ear and eye protection',()=>1,[20,40,80]],
  ['Debarker','Debarker blade, 7″ carbide',()=>S.debarker!=='none'?1:0,[40,65,120]],
  ['Debarker','Arbor shaft and 2 pillow blocks, ¾″',()=>S.debarker!=='none'?1:0,[35,70,110]],
  ['Debarker','Swing arm, pivot and spring',()=>S.debarker!=='none'?1:0,[20,35,60]],
  ['Debarker','Guard',()=>S.debarker!=='none'?1:0,[15,25,45]],
  ['Debarker','Pulleys and belt off the wheel shaft',()=>S.debarker==='belt'?1:0,[35,60,100]],
  ['Debarker','¾ HP 12 V motor, switch and wiring',()=>S.debarker==='electric'?1:0,[150,240,420]],
  ['Power feed','Gearmotor, 12 V, about 60 rpm',()=>S.feed==='chain'?1:0,[150,451,1422],[null,'s18','s19']],
  ['Power feed','#50 roller chain, per foot',(v,r)=>S.feed==='chain'?Math.ceil((r.trackLen+610)/304.8):0,[1.7,4.94,12.27],['s22','s23','s24']],
  ['Power feed','Sprockets: 15T drive and 2 ball-bearing idlers',()=>S.feed==='chain'?1:0,[45,90,245]],
  ['Power feed','Chain anchors and tensioning eye bolts',()=>S.feed==='chain'?2:0,[8,15,30]],
  ['Power feed','Deep-cycle battery upgrade and heavy cables',()=>S.feed==='chain'?1:0,[120,180,280]],
  ['Pi controller','Raspberry Pi 5 and microSD card',()=>S.feed==='chain'?1:0,[53,53,118],['s25','s25','s26']],
  ['Pi controller','Motor driver, Cytron MD30C (30 A)',()=>S.feed==='chain'?1:0,[40,45,60]],
  ['Pi controller','E-stop contactor, 12 V 100 A continuous',()=>S.feed==='chain'?1:0,[20,31,105],[null,'s27','s28']],
  ['Pi controller','E-stop switch, 2 limit switches, buttons, encoder',()=>S.feed==='chain'?1:0,[30,55,110]],
  ['Pi controller','5 V converter, optocoupler, enclosure, wiring',()=>S.feed==='chain'?1:0,[35,60,110]],
  ['Pi controller','Engine tach pickup (optional auto-slow)',()=>S.feed==='chain'?1:0,[10,20,40]],
  ['Power','Fuse block, main fuse and battery disconnect',()=>1,[25,45,90]],
  ['Power','Battery monitor: INA226 module and 100 A shunt',()=>S.feed==='chain'?1:0,[15,25,45],['s29',null,'s30']],
  ['Power','Belt-driven alternator, 63 A one-wire',(v,r,t)=>powerPlan(t).altA===63?1:0,[89.95,102.99,176.15],['s31','s32','s33']],
  ['Power','Belt-driven alternator, 100 A one-wire',(v,r,t)=>powerPlan(t).altA===100?1:0,[134.99,142.99,169.95],['s34','s35','s36']],
  ['Power','Alternator bracket, pulley and belt',(v,r,t)=>powerPlan(t).altA?1:0,[30,50,90]],
  ['Steel','Sheet 16 ga, 4×8 ft (housing)',()=>2,[70,95,130]],
  ['Steel','Plate 1/4″, 2×4 ft',()=>1,[60,85,120]],
  ['Steel','Angle 2×2×3/16, 20 ft (bracing)',()=>1,[40,55,75]]
];

function costLines(v,r,tier){
  const t=TIER_IX[tier],lines=[];
  // Structural tube and rail from the cut list, plus 10% for offcuts.
  let kg=0;parts(v,r).forEach(([,k,q,len])=>kg+=q*len/1000*SECTIONS[k][S[k]][1]);
  const lb=kg*2.2046*1.1;
  lines.push({g:'Steel',n:`Tube and rail, about ${Math.round(lb).toLocaleString()} lb with offcuts`,q:1,each:lb*STEEL_PER_LB[t],src:t===1?'s17':null});
  PRICE_ITEMS.forEach(([g,n,qf,p,src])=>{
    const q=qf(v,r,tier);if(q>0)lines.push({g,n,q,each:p[t],src:src?src[t]:null});
  });
  return lines;
}

const usd=x=>'$'+Math.round(x).toLocaleString();

function renderCost(v,r){
  const box=document.getElementById('cost');if(!box)return;
  const tier=S.priceList||'typical';
  const lines=costLines(v,r,tier);
  const groups={};let total=0;
  lines.forEach(l=>{l.tot=l.q*l.each;total+=l.tot;(groups[l.g]=groups[l.g]||[]).push(l)});
  const all=['budget','typical','premium'].map(k=>costLines(v,r,k).reduce((s,l)=>s+l.q*l.each,0));
  const used=[...new Set(lines.map(l=>l.src).filter(Boolean))];
  const rows=Object.entries(groups).map(([g,ls])=>{
    const sub=ls.reduce((s,l)=>s+l.tot,0);
    return `<tr class="grp"><td colspan="3">${g}</td><td class="n">${usd(sub)}</td></tr>`+
      ls.map(l=>`<tr><td>${l.n}${l.src?` <sup>${used.indexOf(l.src)+1}</sup>`:''}</td><td class="n">${l.q}</td><td class="n">${usd(l.each)}</td><td class="n">${usd(l.tot)}</td></tr>`).join('');
  }).join('');
  box.innerHTML=`
  <h2>Cost estimate</h2>
  <div class="field full"><label for="priceSel">Price list</label><div class="in"><select id="priceSel">${
    Object.entries(PRICE_LISTS).map(([k,n])=>`<option value="${k}"${k===tier?' selected':''}>${n}</option>`).join('')}</select></div></div>
  <div class="big">
    <div><b>${usd(total)}</b><span>estimated build cost</span></div>
    <div><b>${usd(all[0])}–${usd(all[2])}</b><span>range across price lists</span></div>
  </div>
  <div class="tablebox"><table>
    <thead><tr><th>Item</th><th class="n">Qty</th><th class="n">Each</th><th class="n">Total</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td colspan="3">Estimated build cost</td><td class="n">${usd(total)}</td></tr></tfoot>
  </table></div>
  <p class="note">Before tax, shipping and freight. Prices with a number were checked online in November 2026; the rest are planning estimates, so get local quotes for steel and the band wheels. Blade prices are for 1¼″ × 0.042″ stock; the 1½″ × 0.055″ blades cost more. For comparison, a factory debarker for a Wood-Mizer LT35 is <a href="https://woodmizer.com/us/lt35-debarker" target="_blank" rel="noopener">$1,595</a>.</p>
  <ol class="note srcs">${used.map(s=>`<li><a href="${PRICE_SOURCES[s][1]}" target="_blank" rel="noopener">${PRICE_SOURCES[s][0]}</a></li>`).join('')}</ol>`;
  document.getElementById('priceSel').onchange=e=>{S.priceList=e.target.value;update()};
  const hdr=document.getElementById('hdrTotal');
  if(hdr)hdr.innerHTML=`<b>${usd(total)}</b><span>estimated build cost, ${tier} prices</span>`;
}
