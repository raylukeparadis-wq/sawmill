// Off-grid 12 V power. Everything runs from the engine: its charging system
// (plus a belt-driven alternator when that is not enough) keeps the battery up,
// and the battery feeds the feed motor, the Pi, the contactor and the engine.

// Engine charging output by price list: budget DuroMax XP23HPE (3 A),
// typical Vanguard 23 HP (16 A), premium Kohler CH740 (15-25 A by model; 20 A used).
const ENGINE_CHARGE_A=[3,16,20];
const ENGINE_NAMES=['DuroMax XP23HPE','Briggs & Stratton Vanguard 23 HP','Kohler Command Pro 25 HP'];

// [load, average amps while sawing, peak amps]
function powerLoads(){
  const L=[['Engine ignition and fuel solenoid',1,2]];
  if(S.feed==='chain'){
    L.push(['Raspberry Pi, Bluetooth and battery monitor',0.8,1.2]);
    L.push(['E-stop contactor coil',0.8,0.8]);
    L.push(['Feed gearmotor, averaged over cut and return',6,40]);
  }
  if(S.debarker==='electric')L.push(['Electric debarker, ¾ HP',55,90]);
  return L;
}

// Keep the average load under 80% of charging output so the battery stays charged.
function powerPlan(tier){
  const loads=powerLoads();
  const avg=loads.reduce((s,l)=>s+l[1],0), peak=loads.reduce((s,l)=>s+l[2],0);
  const engineA=ENGINE_CHARGE_A[TIER_IX[tier]];
  let altA=0;
  if(avg>engineA*0.8)altA=avg>40?100:63;
  const totalA=engineA+altA;
  return{loads,avg,peak,engineA,altA,totalA,
    spareA:totalA-avg,
    altHp:altA?avg*14.2/0.55/746:0,          // engine power the alternator takes at this load
    mainFuse:peak>60?150:peak>25?100:30};
}

function renderPower(){
  const box=document.getElementById('power');if(!box)return;
  const tier=S.priceList||'typical',p=powerPlan(tier),t=TIER_IX[tier];
  const amps=a=>(Math.round(a*10)/10).toLocaleString()+' A';
  const verdict=p.altA
    ?`The engine's ${p.engineA} A charging can't keep up with ${amps(p.avg)}, so the design adds a belt-driven ${p.altA} A alternator. At this load it takes about ${p.altHp.toFixed(1)} HP from the engine.`
    :`The engine's ${p.engineA} A charging system covers the ${amps(p.avg)} average load with ${amps(p.spareA)} to spare. No extra alternator needed.`;
  box.innerHTML=`
  <h2>Power, off grid</h2>
  <div class="big">
    <div><b>${amps(p.totalA)}</b><span>charging available</span></div>
    <div><b>${amps(p.avg)}</b><span>average load while sawing</span></div>
    <div><b>${amps(p.peak)}</b><span>peak load, from the battery</span></div>
  </div>
  <div class="${p.altA?'warn':'note'}" style="margin:8px 0">${verdict}</div>
  <dl>
    <dt>Engine (${tier} price list)</dt><dd>${ENGINE_NAMES[t]}, ${p.engineA} A charging</dd>
    ${p.altA?`<dt>Added alternator</dt><dd>${p.altA} A, one-wire, belt-driven off the engine</dd>`:''}
    <dt>Battery</dt><dd>${S.feed==='chain'||S.debarker==='electric'?'Group 31 deep-cycle, about 100 Ah':'Engine starting battery'}</dd>
    <dt>Main fuse at the battery</dt><dd>${p.mainFuse} A</dd>
    ${S.feed==='chain'?'<dt>Feed circuit fuse</dt><dd>40 A</dd><dt>Pi and controls fuse</dt><dd>5 A</dd>':''}
  </dl>
  <div class="tablebox" style="margin-top:10px"><table>
    <thead><tr><th>12 V load</th><th class="n">Average</th><th class="n">Peak</th></tr></thead>
    <tbody>${p.loads.map(l=>`<tr><td>${l[0]}</td><td class="n">${amps(l[1])}</td><td class="n">${amps(l[2])}</td></tr>`).join('')}</tbody>
  </table></div>
  <p class="note">No grid power needed: the engine charges the battery, and the battery covers short peaks such as the feed motor starting. Turn the main disconnect off when the mill is parked so the Pi doesn't drain the battery.${S.debarker==='electric'?' The belt-driven debarker uses engine power directly and avoids the big alternator.':''}</p>`;
}
