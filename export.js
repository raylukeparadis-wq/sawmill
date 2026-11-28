// Export of the track and its attachment points, for other apps that build on
// the same mill (for example a planer gantry that runs on these rails).
//
// Coordinates, all in inches:
//   x  along the track, from the start end (where the saw gantry parks)
//   y  across the track, from the track centerline; + is to the right looking down the track from x = 0
//   z  up from the ground

const EXPORT_SCHEMA='bandmill-track/1';

// Rail profiles as installed: height and top width in inches, and the wheel that rides on it.
const RAIL_PROFILES=[
  {name:'Rect tube 4×2×3/16 on edge',h:4,w:2,top:'flat',wheel:'flat-tread, double flange'},
  {name:'Angle 3×3×1/4, point up',h:2.12,w:4.24,top:'90° ridge',wheel:'90° V-groove'},
  {name:'Channel C4×5.4, web up',h:1.58,w:4,top:'flat',wheel:'flat-tread, single flange'},
  {name:'Square tube 2×2×1/4',h:2,w:2,top:'flat',wheel:'flat-tread, double flange'}
];

// Running track bolted on top of the rail (index matches SECTIONS.wear); 0 is none.
const WEAR_PROFILES=[null,
  {name:'Flat bar 3/8×1½',h:0.375,w:1.5,top:'flat',wheel:'flat-tread, double flange'},
  {name:'Flat bar 1/4×1½',h:0.25,w:1.5,top:'flat',wheel:'flat-tread, double flange'},
  {name:'Angle 1½×1½×3/16, point up',h:1.06,w:2.12,top:'90° ridge',wheel:'90° V-groove'}
];

const BUNK_ABOVE_RAIL=40;      // mm, bunk tops sit this far above the rail tops
const MEMBER=75;               // mm, mast, tie and bunk width (3″ tube)
const TRACK_WHEEL_DIA=4;       // in, flanged track wheels on the saw gantry

const inch=mm=>Math.round(mm/25.4*100)/100;

function trackExport(v,r){
  const rail=RAIL_PROFILES[S.rail]||RAIL_PROFILES[0];
  const wear=WEAR_PROFILES[S.wear]||null;
  const railTop=v.bedH-BUNK_ABOVE_RAIL;                    // running surface, mm
  const beamTop=railTop-(wear?wear.h*25.4:0);              // top of the structural rail, mm
  const ride=wear||rail;                                   // what the wheels touch
  const half=r.gauge/2;

  const ties=[];
  for(let i=0;i<r.ties;i++){
    const x=Math.min(i*v.tieSp,r.trackLen-MEMBER)+MEMBER/2;
    ties.push({x:inch(x),leg:i%2===0});
  }
  const logStart=v.gantryD+300;
  const bunks=[];
  for(let i=0;i<r.bunks;i++)bunks.push(inch(logStart+Math.min(i*v.bunkSp,v.logLen-MEMBER)+MEMBER/2));

  const park=v.gantryD+300;
  const frame=SECTIONS.frame[S.frame][0];

  return{
    schema:EXPORT_SCHEMA,
    exported:new Date().toISOString(),
    source:'https://sawmill.paradiserl.com',
    units:'in',
    axes:{x:'along track from start end',y:'across track from centerline, + to the right looking down the track',z:'up from ground'},
    track:{
      gauge:inch(r.gauge),
      length:inch(r.trackLen),
      railTopZ:inch(railTop),
      rails:[
        {y:inch(-half),x0:0,x1:inch(r.trackLen)},
        {y:inch(half),x0:0,x1:inch(r.trackLen)}
      ],
      railProfile:{name:rail.name,height:rail.h,topWidth:rail.w,topZ:inch(beamTop)},
      runningTrack:wear?{name:wear.name,height:wear.h,topWidth:wear.w,top:wear.top,
        joints:'cut 45° in plan; at least 24 in from any splice in the rail below',
        fastening:'countersunk bolts or welded studs every 12–18 in, shimmed level'}:null,
      wheelSurface:{top:ride.top,wheel:ride.wheel},
      level:'rail tops level and parallel; set with the leveling feet'
    },
    crossties:{
      section:frame,
      length:inch(r.gauge+150),
      overhangPastRailCenter:inch(75),
      topZ:inch(beamTop-rail.h*25.4),
      spacing:inch(v.tieSp),
      positions:ties
    },
    bunks:{
      section:frame,
      topZ:inch(v.bedH),
      length:inch(r.gauge-200),
      spacing:inch(v.bunkSp),
      positions:bunks
    },
    workZone:{
      x0:inch(logStart),x1:inch(logStart+v.logLen),
      maxWidth:inch(r.throat),
      maxHeightAboveBunk:inch(r.maxCut),
      clearWidthBetweenRails:inch(r.gauge-MEMBER)
    },
    parking:[
      {end:'start',x0:0,x1:inch(park),use:'saw gantry'},
      {end:'far',x0:inch(r.trackLen-park),x1:inch(r.trackLen),use:'second gantry',maxDepth:inch(park)}
    ],
    sawGantry:{
      outsideWidth:inch(r.gauge+MEMBER),
      depth:inch(v.gantryD),
      heightAboveRail:inch(v.bedH+r.mastH+MEMBER-railTop),
      clearHeightAboveBunk:inch(r.mastH),
      wheels:{count:4,diameter:TRACK_WHEEL_DIA,type:ride.wheel,track:inch(r.gauge),wheelbase:inch(v.gantryD-MEMBER)}
    },
    feedChain:S.feed==='chain'?{
      size:'#50',pitch:0.625,
      length:inch(r.trackLen+610),
      side:'left',
      anchors:[{x:0,y:inch(-half)},{x:inch(r.trackLen),y:inch(-half)}],
      drive:'gantry-mounted sprocket wraps the fixed chain'
    }:null
  };
}

let EXPORT_LAST=null;

function downloadExport(){
  if(!EXPORT_LAST)return;
  const blob=new Blob([JSON.stringify(EXPORT_LAST,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='bandmill-track.json';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

function copyExport(btn){
  if(!EXPORT_LAST)return;
  const text=JSON.stringify(EXPORT_LAST,null,2);
  const done=()=>{btn.textContent='Copied';setTimeout(()=>btn.textContent='Copy JSON',1500)};
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(done,()=>{});
}

function renderExport(v,r){
  const box=document.getElementById('export');if(!box)return;
  const e=EXPORT_LAST=trackExport(v,r);
  const t=e.track,row=(k,val)=>`<dt>${k}</dt><dd>${val}</dd>`;
  const ft=x=>L(x*25.4);
  box.innerHTML=`
  <h2>Export track data</h2>
  <div class="expbtns">
    <button type="button" id="expDl">Download JSON</button>
    <button type="button" id="expCp">Copy JSON</button>
  </div>
  <dl>
    ${row('Rail gauge, center to center',ft(t.gauge))}
    ${row('Track length',ft(t.length))}
    ${row('Running surface above ground',ft(t.railTopZ))}
    ${row('Rail',t.railProfile.name)}
    ${t.runningTrack?row('Running track',t.runningTrack.name):''}
    ${row('Wheel to suit',t.wheelSurface.wheel)}
    ${row('Crossties',`${e.crossties.positions.length} at ${ft(e.crossties.spacing)}`)}
    ${row('Bunks',`${e.bunks.positions.length}, top at ${ft(e.bunks.topZ)}`)}
    ${row('Work zone along track',`${ft(e.workZone.x0)} to ${ft(e.workZone.x1)}`)}
    ${row('Clear width between rails',ft(e.workZone.clearWidthBetweenRails))}
    ${row('Second gantry parking, far end',`up to ${ft(e.parking[1].maxDepth)} deep`)}
    ${row('Saw gantry wheelbase',ft(e.sawGantry.wheels.wheelbase))}
    ${e.feedChain?row('Feed chain','#50, anchored at both track ends, left rail'):''}
  </dl>`;
  box.querySelector('#expDl').onclick=downloadExport;
  box.querySelector('#expCp').onclick=ev=>copyExport(ev.target);
}
