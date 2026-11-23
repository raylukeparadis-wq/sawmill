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
  s17:['3×3×1/8 square tube, 24 ft, $122.16 (Steel & Pipe Supply)','https://core.steelandpipes.com/products/tube-blk-g-11-x-sq-3-x-24']
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
    lines.push({g,n,q:qf(v,r),each:p[t],src:src?src[t]:null});
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
  <p class="note">Before tax, shipping and freight. Prices with a number were checked online in November 2026; the rest are planning estimates, so get local quotes for steel and the band wheels. Blade prices are for 1¼″ × 0.042″ stock; the 1½″ × 0.055″ blades cost more.</p>
  <ol class="note srcs">${used.map(s=>`<li><a href="${PRICE_SOURCES[s][1]}" target="_blank" rel="noopener">${PRICE_SOURCES[s][0]}</a></li>`).join('')}</ol>`;
  document.getElementById('priceSel').onchange=e=>{S.priceList=e.target.value;update()};
  const hdr=document.getElementById('hdrTotal');
  if(hdr)hdr.innerHTML=`<b>${usd(total)}</b><span>estimated build cost, ${tier} prices</span>`;
}
