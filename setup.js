// Quick setup: pick a stock blade and a wheel goal, and the saw head fills itself in.
// Auto mode sets wheel size, wheel speed, blade width and thickness, and the
// largest log. Manual mode leaves every field editable.

const BLADE_PROFILES=[
  {id:'125-042',w:31.75,t:1.0668,label:'1¼″ wide × 0.042″'},
  {id:'125-045',w:31.75,t:1.143,label:'1¼″ wide × 0.045″'},
  {id:'150-042',w:38.1,t:1.0668,label:'1½″ wide × 0.042″'},
  {id:'150-045',w:38.1,t:1.143,label:'1½″ wide × 0.045″'},
  {id:'150-050',w:38.1,t:1.27,label:'1½″ wide × 0.050″'},
  {id:'150-055',w:38.1,t:1.397,label:'1½″ wide × 0.055″'}
];
// Wheel diameter as a multiple of blade thickness. 420 is the usual minimum for blade life.
const WHEEL_GOALS={
  max:{ratio:420,label:'Largest log (smallest safe wheels)'},
  balanced:{ratio:470,label:'Balanced'},
  life:{ratio:550,label:'Longest blade life (bigger wheels)'}
};
const AUTO_FIELDS=['wheelDia','wheelRpm','bladeW','bladeT','logDia'];
const TARGET_BLADE_FPM=5500;

function autoProfile(){return BLADE_PROFILES.find(p=>p.id===S.profile)||BLADE_PROFILES[5]}

// Smallest whole-inch wheel that meets the goal; also at least 10x blade width and 14".
function autoWheelIn(p,goal){
  const t=p.t/25.4,w=p.w/25.4;
  return Math.max(Math.ceil(t*WHEEL_GOALS[goal].ratio),Math.ceil(w*10),14);
}

function applyAuto(){
  if(S.mode!=='auto')return;
  if(!S.blade)S.blade=205;
  const p=autoProfile(),D=autoWheelIn(p,S.goal||'balanced');
  S.v.wheelDia=D*25.4;
  S.v.bladeW=p.w;
  S.v.bladeT=p.t;
  S.v.wheelRpm=Math.round(TARGET_BLADE_FPM*12/(Math.PI*D)/5)*5;
}

function renderSetup(c){
  const box=document.createElement('div');box.className='qs';
  const auto=S.mode==='auto';
  const sel=(id,label,opts,val)=>`<div class="field full"><label for="${id}">${label}</label><div class="in"><select id="${id}">${
    opts.map(([v,t])=>`<option value="${v}"${String(v)===String(val)?' selected':''}>${t}</option>`).join('')}</select></div></div>`;
  box.innerHTML=`<h2>Quick setup</h2>
    <div class="seg qsmode" role="group" aria-label="Setup mode">
      <button type="button" data-mode="auto" aria-pressed="${auto}">Auto from blade</button>
      <button type="button" data-mode="manual" aria-pressed="${!auto}">Manual</button></div>
    ${auto?sel('qs-len','Stock blade length',BLADES.map(b=>[b,`${b}″ (${Math.floor(b/12)}′ ${b%12}″)`]),S.blade||205)
      +sel('qs-prof','Blade size',BLADE_PROFILES.map(p=>[p.id,p.label]),autoProfile().id)
      +sel('qs-goal','Wheel size',Object.entries(WHEEL_GOALS).map(([k,g])=>[k,g.label]),S.goal||'balanced')
      +'<p class="qsum" id="qs-sum"></p><p class="note" style="margin:0">Then set your longest log below. Everything else has working defaults.</p>'
      :'<p class="note" style="margin:6px 0 0">Every field below is editable.</p>'}`;
  c.appendChild(box);
  box.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{S.mode=b.dataset.mode;buildControls();update()});
  if(!auto)return;
  box.querySelector('#qs-len').onchange=e=>{S.blade=+e.target.value;buildControls();update()};
  box.querySelector('#qs-prof').onchange=e=>{S.profile=e.target.value;buildControls();update()};
  box.querySelector('#qs-goal').onchange=e=>{S.goal=e.target.value;buildControls();update()};
}

// In auto mode, lock the fields the quick setup controls and mark them.
function decorateAuto(){
  if(S.mode!=='auto')return;
  AUTO_FIELDS.forEach(id=>{
    const inp=document.getElementById('f-'+id);if(!inp)return;
    inp.disabled=true;
    const lab=inp.closest('.field').querySelector('label');
    if(!lab.querySelector('.autotag'))lab.insertAdjacentHTML('beforeend',' <span class="autotag">auto</span>');
  });
  const bs=document.getElementById('sel-blade');if(bs)bs.disabled=true;
}

// Keep the locked fields and the summary showing current values.
function refreshAuto(v){
  const fld=id=>FIELDS.find(f=>f.id===id);
  AUTO_FIELDS.forEach(id=>{
    const inp=document.getElementById('f-'+id);
    if(inp&&inp.disabled)inp.value=toDisp(fld(id),id==='logDia'?v.logDia:S.v[id]);
  });
  const sum=document.getElementById('qs-sum');if(!sum)return;
  const tooShort=v.logDia<=50;
  sum.innerHTML=tooShort
    ?`<b>This blade is too short for ${Math.round(S.v.wheelDia/25.4)}″ wheels.</b> Pick a longer blade or "Largest log".`
    :`<b>${(v.logDia/25.4).toFixed(1)}″</b> largest log · ${Math.round(S.v.wheelDia/25.4)}″ wheels at ${S.v.wheelRpm} rpm · ${autoProfile().label} blade`;
}
