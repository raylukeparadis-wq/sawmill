// Collapsible headings. Tap any section heading to fold or unfold what follows it,
// up to the next heading of the same or higher level. The open/closed state is
// remembered in this browser and re-applied after every redraw.

const COLLAPSE_KEY='bandmill-collapsed-v1';
let COLLAPSED=new Set();
try{COLLAPSED=new Set(JSON.parse(localStorage.getItem(COLLAPSE_KEY))||[])}catch(e){}

function saveCollapsed(){try{localStorage.setItem(COLLAPSE_KEY,JSON.stringify([...COLLAPSED]))}catch(e){}}

const headLevel=h=>+h.tagName[1];
const isHead=n=>/^H[23]$/.test(n.tagName);

// A stable key per heading: its section and its place among that section's headings.
function headKey(h,sections){
  const sec=h.closest('section');
  const si=sections.indexOf(sec);
  const hi=[...sec.querySelectorAll('h2,h3')].indexOf(h);
  return (sec.id||'s'+si)+':'+hi;
}

function applyCollapse(){
  const sections=[...document.querySelectorAll('.wrap section')];
  // Document order, so a folded h2 hides its h3s before they are looked at.
  document.querySelectorAll('.wrap section h2, .wrap section h3').forEach(h=>{
    const key=headKey(h,sections);
    h.dataset.ck=key;
    if(!h.dataset.cw){
      h.dataset.cw='1';
      h.classList.add('fold');
      h.tabIndex=0;h.setAttribute('role','button');
      const toggle=()=>{COLLAPSED.has(h.dataset.ck)?COLLAPSED.delete(h.dataset.ck):COLLAPSED.add(h.dataset.ck);saveCollapsed();applyCollapse()};
      h.addEventListener('click',toggle);
      h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});
    }
    const hiddenByParent=h.classList.contains('cl-hide');
    const shut=COLLAPSED.has(key);
    h.setAttribute('aria-expanded',String(!shut));
    if(hiddenByParent)return;
    for(let n=h.nextElementSibling;n&&!(isHead(n)&&headLevel(n)<=headLevel(h));n=n.nextElementSibling){
      n.classList.toggle('cl-hide',shut);
    }
  });
}
