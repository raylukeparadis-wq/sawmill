// Collapsible headings. The page opens with every heading folded. Tap a heading
// to unfold what follows it, up to the next heading of the same or higher level.
// What you open stays open through redraws until the page is reloaded.

const OPENED=new Set();

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
      const toggle=()=>{OPENED.has(h.dataset.ck)?OPENED.delete(h.dataset.ck):OPENED.add(h.dataset.ck);applyCollapse()};
      h.addEventListener('click',toggle);
      h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});
    }
    const shut=!OPENED.has(key);
    h.setAttribute('aria-expanded',String(!shut));
    if(h.classList.contains('cl-hide'))return;   // inside a folded parent
    for(let n=h.nextElementSibling;n&&!(isHead(n)&&headLevel(n)<=headLevel(h));n=n.nextElementSibling){
      n.classList.toggle('cl-hide',shut);
    }
  });
}
