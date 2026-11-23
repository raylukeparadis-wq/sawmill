// Illustrated parts breakdown: schematic front, side and top views with
// numbered part callouts and weld points. Loaded before the main script;
// renderIPB(v, r) is called from update() with the current design.

const R=(x,y,w,h,c,x2='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${c}" ${x2}/>`;
const C=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" class="${c}"/>`;
const LN=(x1,y1,x2,y2,c,x='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${c}" ${x}/>`;
const THICK='style="stroke:var(--steel);stroke-width:3"';
const SCREW='style="stroke:var(--muted);stroke-width:2"';

const IPB_VIEWS={
  front:{name:'Front view, looking down the track',h:372,
    draw:()=>[
      R(58,40,264,10,'s-steel'),R(60,50,10,212,'s-steel'),R(310,50,10,212,'s-steel'),
      LN(70,85,100,50,'s-steel',THICK),LN(310,85,280,50,'s-steel',THICK),
      LN(80,55,80,106,'',SCREW),LN(300,55,300,106,'',SCREW),
      LN(80,58,300,58,'s-dim','stroke-dasharray="3 2"'),LN(300,58,324,58,'s-dim'),C(330,58,6,'s-part'),
      R(74,108,232,6,'s-steel'),R(166,102,52,6,'s-steel'),R(170,78,44,24,'s-part','rx="3"'),
      R(112,114,26,6,'s-steel2'),
      R(86,114,208,78,'s-housing','rx="10" style="fill-opacity:.12"'),
      LN(125,120,125,148,'s-steel',THICK),LN(255,114,255,148,'s-steel',THICK),
      C(125,153,30,'s-wheel'),C(255,153,30,'s-wheel'),C(125,153,5,'s-part'),C(255,153,5,'s-part'),
      LN(125,123,255,123,'s-blade'),LN(125,183,255,183,'s-blade'),
      LN(150,114,150,178,'s-steel',THICK),LN(230,114,230,178,'s-steel',THICK),
      R(146,178,10,10,'s-part'),R(225,178,10,10,'s-part'),
      `<path d="M98 200H140M98 200l5-3M98 200l5 3M140 200l-5-3M140 200l-5 3" class="s-dim"/>`,
      C(190,231,32,'s-wood'),R(244,252,12,10,'s-part'),
      R(80,266,220,7,'s-steel'),R(80,273,6,13,'s-steel'),R(294,273,6,13,'s-steel'),
      R(62,256,6,8,'s-steel'),R(312,256,6,8,'s-steel'),C(65,270,6,'s-part'),C(315,270,6,'s-part'),
      R(57,277,16,9,'s-steel'),R(307,277,16,9,'s-steel'),R(45,286,290,8,'s-steel2'),
      R(60,294,10,26,'s-steel'),R(310,294,10,26,'s-steel'),R(55,320,20,5,'s-part'),R(305,320,20,5,'s-part')
    ].join(''),
    parts:[[1,150,45],[2,65,160],[3,80,82],[4,95,153],[5,110,200],[6,65,270],[7,57,281],[8,45,290],
      [9,65,307],[10,65,323],[11,330,58],[12,250,58],[13,214,90],[14,294,140],[15,240,183],
      [16,235,183],[17,222,231],[18,256,257],[19,290,269],[26,306,111],[27,295,67]],
    welds:{1:[[65,50],[315,50]],2:[[70,85],[100,50],[310,85],[280,50]],3:[[80,108],[300,108]],
      4:[[125,114]],5:[[65,262],[315,262]],6:[[65,286],[315,286]],7:[[65,294],[315,294]],
      8:[[65,320],[315,320]],9:[[192,108]],10:[[255,114]],11:[[150,114],[230,114]],12:[[83,286],[297,286]]}},

  side:{name:'Side view, gantry partway down the track',h:215,
    draw:()=>{
      let s=R(45,163,285,8,'s-steel');
      for(let i=0;i<6;i++){const x=45+i*56;s+=R(x,171,5,17,'s-steel')+R(x-3,188,11,3,'s-part')}
      [90,141,192,243,288].forEach(x=>s+=R(x,155,6,8,'s-steel'));
      s+=R(90,127,203,28,'s-wood','rx="10"');
      s+=R(200,86,30,5,'s-steel')+R(200,91,5,68,'s-steel')+R(225,91,5,68,'s-steel');
      s+=C(202,159,4,'s-part')+C(228,159,4,'s-part');
      s+=R(196,95,38,30,'s-housing','rx="4" style="fill-opacity:.12"')+R(212,121,6,3,'s-part','style="fill:var(--blade);fill-opacity:1"');
      s+=R(205,103,3,9,'s-part')+R(222,103,3,9,'s-part');
      s+=R(234,80,22,16,'s-part','rx="2"')+LN(230,112,262,98,'s-steel',THICK);
      return s;
    },
    parts:[[20,215,88],[2,202,140],[6,202,160],[7,100,167],[9,101,180],[10,101,190],[19,141,159],
      [17,150,141],[13,256,88],[14,196,108],[15,218,122],[22,206,108],[28,262,98]],
    welds:{1:[[202,91],[227,91]],5:[[202,155],[227,155]],6:[[70,171]],7:[[47,171]],8:[[47,188]],12:[[93,163]]}},

  top:{name:'Top view, looking down on the mill',h:215,
    draw:()=>{
      let s='';
      for(let i=0;i<12;i++)s+=R(45+i*25.3,46,4,118,'s-steel2');
      s+=R(45,48,285,4,'s-steel')+R(45,158,285,4,'s-steel');
      [90,141,192,243,288].forEach(x=>s+=R(x,58,6,94,'s-steel')+R(x,85,6,5,'s-part'));
      s+=R(90,91,203,28,'s-wood','rx="6"')+R(160,120,8,8,'s-part');
      s+=R(200,44,5,122,'s-steel')+R(225,44,5,122,'s-steel')+R(200,44,30,5,'s-steel')+R(200,161,30,5,'s-steel');
      s+=R(196,56,38,98,'s-housing','rx="4" style="fill-opacity:.12"');
      s+=R(213,59,4,27,'s-part')+R(213,124,4,27,'s-part')+LN(215,73,215,137,'s-blade');
      s+=LN(205,73,240,73,'s-dim')+LN(205,137,240,137,'s-dim');
      s+=R(205,70,5,6,'s-part')+R(232,70,5,6,'s-part')+R(205,134,5,6,'s-part')+R(232,134,5,6,'s-part');
      s+=R(211,88,8,5,'s-part')+R(211,117,8,5,'s-part');
      s+=R(240,92,20,20,'s-part','rx="2"')+LN(250,112,238,137,'s-dim')+R(235,130,4,14,'s-part');
      s+=C(204,102,4,'s-part');
      [[202,46],[227,46],[202,164],[227,164]].forEach(([x,y])=>s+=C(x,y,3,'s-part'));
      return s;
    },
    parts:[[7,100,50],[8,72,140],[19,141,70],[17,150,105],[21,141,88],[18,164,124],[20,215,46],
      [1,227,152],[14,234,62],[4,215,150],[15,215,105],[16,219,90],[24,238,73],[13,260,100],
      [23,244,125],[25,204,102],[6,227,164]],
    welds:{1:[[202,46],[227,46],[202,164],[227,164]],6:[[72,50],[72,160]],12:[[144,58]],
      9:[[250,92]],10:[[215,124]],4:[[215,86]],11:[[215,93]]}}
};

function ipbParts(v,r){
  return{
    1:['Gantry top beam',L(r.gauge+75),2],2:['Gantry mast',L(r.mastH),4],
    3:['Lift screw, 1″-5 Acme, with nut',L(r.travel+150),2],4:['Band wheel with belt tire',L(v.wheelDia),2],
    5:['Blade tensioner','',1],6:['Track wheel, 4″ flanged','',4],7:['Track rail',L(r.trackLen),2],
    8:['Crosstie',L(r.gauge+150),r.ties],9:['Track leg',L(v.bedH),r.posts],10:['Leveling foot','',r.posts],
    11:['Lift crank or handwheel','',1],12:['Sync chain #40 and sprockets','','1 + 3'],
    13:['Engine and clutch','',1],14:['Head housing, 16 ga sheet','',1],
    15:['Blade',L(r.bladeLen),5],16:['Roller blade guide','',2],17:['Log (reference)','max '+L(v.logDia),'–'],
    18:['Log dog','',2],19:['Log bunk',L(r.gauge-200),r.bunks],20:['Gantry side beam',L(v.gantryD),2],
    21:['Log stop','',4],22:['Head slide','',8],23:['Pulleys and drive belt','','1 set'],
    24:['Wheel shaft and pillow blocks','','2 + 4'],25:['Blade lube tank','',1],
    26:['Head carriage rail',L(r.headW),2],27:['Corner brace','',4],28:['Push handle','',1]
  };
}

const IPB_WELDS={
  1:'Mast to top beam and side beams. Fillet all around, plus ¼″ gussets both faces',
  2:'Corner braces to mast and beam. Fillet all around',
  3:'Lift nut brackets to head carriage. Fillet all around; tack nuts only after alignment',
  4:'Tension slide guide to carriage. Stitch welds; keep the slide free',
  5:'Track wheel axle brackets to mast feet. Fillet all around',
  6:'Rail to each crosstie. 1–2″ stitch welds both sides',
  7:'Leg to crosstie. Fillet all around',
  8:'Foot plate to leg, with a nut welded on for the leveling jack',
  9:'Engine mount plate to carriage. Fillet all around',
  10:'Fixed wheel arm to carriage. Fillet all around plus gusset',
  11:'Blade guide arms to carriage. Tack, check alignment, then weld',
  12:'Bunk risers to crossties, bunks to risers. Fillet all around'
};

// Stack balloons in a margin column so they never overlap.
function ipbStack(items,H){
  items.sort((a,b)=>a.ty-b.ty);
  const gap=Math.min(18,(H-22)/Math.max(1,items.length-1));
  let prev=-1e9;
  items.forEach(it=>{it.y=Math.max(it.ty,prev+gap,11);prev=it.y});
  let next=H-11+gap;
  for(let i=items.length-1;i>=0;i--){items[i].y=Math.min(items[i].y,next-gap);next=items[i].y}
}

let ipbLast=null;
function renderIPB(v,r){
  ipbLast=[v,r];
  const svg=document.getElementById('ipb');if(!svg)return;
  const viewSel=document.getElementById('ipbViewSel'),showSel=document.getElementById('ipbShowSel');
  S.ipbView=S.ipbView||'front';S.ipbShow=S.ipbShow||'both';
  viewSel.value=S.ipbView;showSel.value=S.ipbShow;
  const V=IPB_VIEWS[S.ipbView],H=V.h,show=S.ipbShow;
  if(Z.view!==S.ipbView){Z={s:1,cx:190,cy:H/2,H,view:S.ipbView}}
  ipbApplyZoom();
  svg.setAttribute('aria-label',V.name+' with numbered parts and weld points');
  const items=[];
  if(show!=='welds')V.parts.forEach(([n,x,y])=>items.push({kind:'p',label:String(n),tx:x,ty:y}));
  if(show!=='parts')Object.entries(V.welds).forEach(([w,pts])=>items.push({kind:'w',label:'W'+w,tx:pts[0][0],ty:pts[0][1]}));
  const left=items.filter(i=>i.tx<190),right=items.filter(i=>i.tx>=190);
  ipbStack(left,H);ipbStack(right,H);left.forEach(i=>i.x=14);right.forEach(i=>i.x=366);
  let out=V.draw(),lead='',ball='';
  items.forEach(i=>{
    const ex=i.x<190?i.x+10:i.x-10;
    lead+=LN(ex,i.y,i.tx,i.ty,'s-lead');
    if(i.kind==='p')ball+=C(i.x,i.y,8,'s-ball')+`<text x="${i.x}" y="${i.y}" class="s-btxt" text-anchor="middle" dominant-baseline="central">${i.label}</text>`;
    else ball+=R(i.x-11,i.y-7,22,14,'s-wball','rx="7"')+`<text x="${i.x}" y="${i.y}" class="s-btxt s-wtxt" text-anchor="middle" dominant-baseline="central">${i.label}</text>`;
  });
  let dots='';
  if(show!=='parts')Object.values(V.welds).forEach(pts=>pts.forEach(([x,y])=>dots+=C(x,y,3.2,'s-weld')));
  svg.innerHTML=out+lead+dots+ball;

  const P=ipbParts(v,r);
  let key='';
  if(show!=='welds'){
    const nums=[...new Set(V.parts.map(p=>p[0]))].sort((a,b)=>a-b);
    key+=`<table class="ktab"><thead><tr><th>No.</th><th>Part</th><th class="n">Length</th><th class="n">Qty</th></tr></thead><tbody>${
      nums.map(n=>`<tr><td>${n}</td><td>${P[n][0]}</td><td class="n">${P[n][1]}</td><td class="n">${P[n][2]}</td></tr>`).join('')}</tbody></table>`;
  }
  if(show!=='parts'){
    const ws=Object.keys(V.welds).map(Number).sort((a,b)=>a-b);
    key+=`<table class="ktab"><thead><tr><th>Weld</th><th>Joint and weld type</th></tr></thead><tbody>${
      ws.map(w=>`<tr><td><span class="wtag">W${w}</span></td><td>${IPB_WELDS[w]}</td></tr>`).join('')}</tbody></table>`;
  }
  document.getElementById('ipbKey').innerHTML=key;
}

// Zoom and pan: buttons, ctrl+wheel or trackpad pinch, touch pinch, drag to pan, double-click to reset.
let Z={s:1,cx:190,cy:175,H:350,view:null};
const clamp=(x,a,b)=>Math.min(Math.max(x,a),b);
function ipbApplyZoom(){
  const svg=document.getElementById('ipb'),w=380/Z.s,h=Z.H/Z.s;
  Z.cx=clamp(Z.cx,w/2,380-w/2);Z.cy=clamp(Z.cy,h/2,Z.H-h/2);
  svg.setAttribute('viewBox',`${Z.cx-w/2} ${Z.cy-h/2} ${w} ${h}`);
  svg.style.touchAction=Z.s>1?'none':'pan-y';
  svg.style.cursor=Z.s>1?'grab':'';
  const lab=document.getElementById('ipbZoomPct');if(lab)lab.textContent=Math.round(Z.s*100)+'%';
}
function ipbZoom(f,px,py){
  const s2=clamp(Z.s*f,1,6);
  if(px!=null){Z.cx=px+(Z.cx-px)*Z.s/s2;Z.cy=py+(Z.cy-py)*Z.s/s2}
  Z.s=s2;ipbApplyZoom();
}
function ipbPoint(svg,x,y){
  const m=svg.getScreenCTM();if(!m)return{x:Z.cx,y:Z.cy};
  const p=new DOMPoint(x,y).matrixTransform(m.inverse());return{x:p.x,y:p.y};
}
function initZoom(){
  const svg=document.getElementById('ipb');
  const bar=document.createElement('div');bar.className='zoombar';
  bar.innerHTML=`<button type="button" data-z="out" aria-label="Zoom out">−</button><span id="ipbZoomPct" aria-live="polite">100%</span><button type="button" data-z="in" aria-label="Zoom in">+</button><button type="button" data-z="reset">Reset zoom</button><span class="zhint">Drag to move when zoomed</span>`;
  svg.parentNode.insertBefore(bar,svg);
  bar.onclick=e=>{const z=e.target.dataset.z;if(!z)return;
    if(z==='in')ipbZoom(1.5);else if(z==='out')ipbZoom(1/1.5);else{Z.s=1;ipbApplyZoom()}};
  svg.addEventListener('wheel',e=>{
    if(!e.ctrlKey&&Z.s===1)return;
    e.preventDefault();const p=ipbPoint(svg,e.clientX,e.clientY);
    ipbZoom(Math.exp(-e.deltaY*(e.ctrlKey?0.01:0.002)),p.x,p.y);
  },{passive:false});
  svg.addEventListener('dblclick',()=>{Z.s=1;ipbApplyZoom()});
  const pts=new Map();let pinch=null;
  svg.addEventListener('pointerdown',e=>{
    if(Z.s===1&&e.pointerType!=='touch')return;
    pts.set(e.pointerId,{x:e.clientX,y:e.clientY});svg.setPointerCapture(e.pointerId);
    if(pts.size===2){const [a,b]=[...pts.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y)}
  });
  svg.addEventListener('pointermove',e=>{
    const prev=pts.get(e.pointerId);if(!prev)return;
    const cur={x:e.clientX,y:e.clientY};pts.set(e.pointerId,cur);
    const m=svg.getScreenCTM();if(!m)return;
    if(pts.size===2){
      const [a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);
      if(pinch){const mid=ipbPoint(svg,(a.x+b.x)/2,(a.y+b.y)/2);ipbZoom(d/pinch,mid.x,mid.y)}
      pinch=d;
    }else if(Z.s>1){Z.cx-=(cur.x-prev.x)/m.a;Z.cy-=(cur.y-prev.y)/m.d;ipbApplyZoom()}
  });
  const end=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null};
  svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
}

function initIPB(){
  initZoom();
  const onChange=()=>{
    S.ipbView=document.getElementById('ipbViewSel').value;
    S.ipbShow=document.getElementById('ipbShowSel').value;
    save();if(ipbLast)renderIPB(...ipbLast);
  };
  document.getElementById('ipbViewSel').onchange=onChange;
  document.getElementById('ipbShowSel').onchange=onChange;
}
