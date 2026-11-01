import os, sys, json, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import parts as P
from parts import ic, si, psi, pstat, part_row, STATUSES, PART_STATUSES
B = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
tok = open(f"{B}/ds/tokens.local.css").read()
bun = open(f"{B}/ds/project/components/bundle.css").read().split("\n", 1)[1]  # drop @import; fonts linked in head
before = base64.b64encode(open("/root/.claude/uploads/febe01e4-e12e-554d-9dc2-ccfd769708e9/ca272739-image.png", "rb").read()).decode()

# ---------------- data ----------------
TIME = {1: [("Mon, Oct 19","7:32 – 11:05","Repairing","3:33"),("Mon, Oct 19","12:10 – 13:41","Repairing","1:31"),("Tue, Oct 20","7:30 – 8:42","Repairing","1:12")], 2: [], 3: []}
PARTS = P.PARTS_D
NOTES = {1: "Removed transmission. Clutch disc worn to the rivets, flywheel scored — resurfaced. Installing new clutch kit. (Oct 20 · 8:40)",
         2: "Right rear inner wheel seal weeping onto the shoes. Needs approval before I pull the hub. (Oct 20 · 9:10)", 3: ""}
FILES = P.FILES_D
IN = ("received", "installed")

def body(num, show):
    h = "" if show else " hidden"
    t = TIME[num]; pr = PARTS[num]; fl = FILES[num]
    nin = sum(1 for p in pr if p[4] in IN)
    first = "parts" if num == 1 else "time"
    tabs = [("time","Time",str(len(t)) if t else ""),("parts","Parts",f"{nin}/{len(pr)}" if pr else ""),("notes","Notes",""),("files","Files",str(len(fl)) if fl else "")]
    tabh = '<div class="px-tabs" role="tablist">' + "".join(f'<button class="px-tab{" is-on" if k==first else ""}" data-tab="{k}">{l}<span class="px-tab__n">{c}</span></button>' for k, l, c in tabs) + '</div>'
    tl = "".join(f'<div class="px-li px-li--time"><span>{d}</span><span class="px-num px-muted">{tt}</span><small>{r}</small><span class="r">{du}</span><span class="px-av">MR</span></div>' for d, tt, r, du in t) or '<div class="px-li"><small>No time on this operation yet — start the clock above.</small></div>'
    pl = "".join(part_row(*p) for p in pr)
    fh = "".join(f'<div class="px-li px-li--part"><span style="display:flex;gap:10px;align-items:center">{ic("clip")}{f}</span><span class="px-muted">{k}</span><span></span><small>{w}</small></div>' for f, k, w in fl) or '<div class="px-li"><small>No files yet.</small></div>'
    hid = lambda k: "" if k == first else " hidden"
    n11 = ' data-n="11"' if num == 1 else ''
    return f'''<div class="px-op" data-body="{num}"{h}>
  {P.timecard(False, num == 1, num)}
  <div>{tabh}<div style="margin-top:4px">
    <div class="px-list" data-pane="time"{hid("time")}>{tl}<button class="px-add">{ic("plus")}Add time entry</button></div>
    <div class="px-list" data-pane="parts"{hid("parts")}{n11}><div data-plist>{pl}</div><button class="px-add">{ic("plus")}Add part</button></div>
    <div data-pane="notes"{hid("notes")}><textarea class="px-input" style="width:100%;margin-top:12px" placeholder="Work performed — Enter stamps the date and time">{NOTES[num]}</textarea></div>
    <div class="px-list" data-pane="files"{hid("files")}>{fh}</div>
  </div></div>
</div>'''

ops_html = "".join(P.op_row(o, on=(o[0] == 1)) + body(o[0], o[0] == 1) for o in P.OPS)
ops_sec = f'''<div class="px-sec"><h3>Operations</h3><span class="n" data-opcount>3</span><button class="px-btn px-btn--ghost px-btn--sm" data-addop>{ic("plus")}Add operation</button></div>
<div class="px-ops" data-n="6">{ops_html}</div>'''

def MONEY(h):
    h = h.replace('<b class="px-num">11.90 h · $2,499.00</b>', '<b class="px-num" data-labor>11.90 h · $2,499.00</b>')
    h = h.replace('<span class="px-num">$3,276.50</span>', '<span class="px-num" data-est>$3,276.50</span>')
    return h.replace('<span class="px-pg__sum">$3,276.50</span>', '<span class="px-pg__sum" data-est-sum>$3,276.50</span>')

app = f'''<div class="px-app">
{P.sidebar(wt=True)}
<section class="px-panel">
{P.header(True)}
<div class="px-ro">
  <main class="px-ro__main"><div class="px-ro__col">
    {P.title_block("hold", "", True).replace('<span class="px-with">', '<span class="px-with" data-with>')}
    {P.stage(True)}
    {ops_sec}
    {P.feed(True)}
  </div></main>
  {MONEY(P.details(True))}
</div>
</section>
</div>'''

SI = {k: si(k) for k, *_ in STATUSES}
PSI = {k: psi(k) for k, *_ in PART_STATUSES}
PNAME = {k: nm for k, nm, *_ in PART_STATUSES}
ST = [{"k": k, "name": nm, "desc": d, "subs": s, "key": key} for k, nm, d, s, key in STATUSES]
ICO = {k: ic(k) for k in ("pencil","copy","swap","trash","check","play","stop","chevD","chevR","clip")}
STAGEPOP = {
 "checkin": ("Check-in", "Done when the unit is connected, the dash photo is in and the location is set.", [("Unit connected / DTC read",1),("Dash photo",1),("Location set",1)]),
 "diag": ("Diag", "Not needed — this RO has no DIAG operation.", []),
 "approval": ("Approval", "Done when every customer-pay operation is approved or declined.", [("Estimate reviewed",1),("Estimate sent",0),("Customer approved",0)]),
 "parts": ("Parts", "Done when every part is received.", [("Parts looked up",1),("Parts in hand",1),("Parts delivered / installed",1)]),
 "repair": ("Repair", "Done when every operation is complete.", [("Operation 1 complete",0),("Operation 2 complete",0),("Operation 3 complete",0)]),
 "roadtest": ("Road test", "Done when the road test is logged as Pass.", [("Road test passed",0)]),
 "closeout": ("Close-out", "Cause and fix on every operation, pictures, RO released.", [("Cause and fix on all operations",0),("Pictures uploaded",1),("DTC uploaded",1),("RO released",0),("Parts installed",0)]),
}
REASONS = ["Approval needed", "Parts needed", "Tech + bay", "Repair", "Sign-off", "Warranty claim", "Question"]
NOTES_WT = [
 ("Sidebar replaces the ten top tabs", "Grouped by job, filtered by role, collapsible. Search, clock-in and the inbox live here."),
 ("A header that knows where you are", "Breadcrumb, previous / next RO (K / J), “4 of 12”, quiet actions."),
 ("The customer is the headline", "Serif name; RO number and age above; vehicle · unit · bay below; status and owner under."),
 ("Stages with names", "Seven labelled steps and one summary line. Click a step for its checklist."),
 ("Next lives in the details pane", "Top of the pane, above Schedule. Press Estimate sent and watch it move on to the next step."),
 ("Operations as rows", "Status, type, hours, efficiency, owner. The selected one opens in place."),
 ("A calm clock", "Big timer, quoted tick, four numbers, one round play / stop."),
 ("Details pane fits — no scrolling", "Five collapsible groups; closed ones show a summary. Opening one closes the oldest if space runs out."),
 ("History on the page", "Activity and notes in one timeline."),
 ("A status menu you can type into", "Nine statuses, 1–9 shortcuts, reasons in a second level. Press S."),
 ("Parts dropdown", "Click a part's status: set Not ordered → Installed (1–5), edit, copy the number, move it to another operation, or remove it."),
 ("Modals", "Open from a link, a menu item or a key (T, O). Scrim fades in, the dialog rises 8 px; Esc, Cancel or a click outside closes; ⌘↵ confirms."),
 ("Totals in the header", "Time (burnt / quoted), parts (in hand / total) and files, top right. They update live; click one for its breakdown, then click a row to jump to that operation."),
 ("Running job in the sidebar", "Start a clock and the clock-in card shows the job and its time; tap it to jump there, or stop it from the card."),
]
OPEN = {11: '<div class="wt-open"><button class="px-btn px-btn--sm" data-open-modal="transfer">Transfer RO</button><button class="px-btn px-btn--sm" data-open-modal="addop">Add operation</button><button class="px-btn px-btn--sm" data-open-modal="delete">Delete RO</button></div>',
        12: '<div class="wt-open"><button class="px-btn px-btn--sm" data-open-modal="time">Time</button><button class="px-btn px-btn--sm" data-open-modal="parts">Parts</button><button class="px-btn px-btn--sm" data-open-modal="files">Files</button></div>'}
notes_html = "".join(f'<li><span class="wt-n">{i+1}</span><div><b>{t}</b><p>{d}</p>' + OPEN.get(i, '') + '</div></li>'
    for i, (t, d) in enumerate(NOTES_WT))
notes_html += '<li class="wt-micro"><span class="wt-n">·</span><div><b>Micro-interactions</b><p>Groups fold with an ease, tab underline slides, status and part icons pop in, a copied VIN ticks, a changed row glows bronze for a moment, the clock dot breathes. All of it switches off under “reduce motion”.</p></div></li>'

CSS = '''
html,body{margin:0;background:var(--canvas)}
body{font-family:var(--font-sans);color:var(--ink)}
.wt-bar{position:sticky;top:0;z-index:80;display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:12px 20px;background:var(--canvas);box-shadow:inset 0 -1px 0 var(--hairline)}
.wt-bar h1{margin:0;font:500 20px/26px var(--font-serif);letter-spacing:-.01em;margin-right:auto;display:flex;align-items:center;gap:10px}
.wt-bar h1 svg{width:20px;height:20px}.wt-bar h1 svg circle{fill:var(--ink)}.wt-bar h1 svg .o{fill:var(--ink-3)}.wt-bar h1 svg .c{fill:#22c55e}
.wt-bar label{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-2);cursor:pointer}
.wt-stage{padding:20px}
.wt-wrap{position:relative;width:100%;overflow:hidden;border-radius:18px;box-shadow:0 0 0 1px var(--hairline)}
.mock{position:absolute;left:0;top:0;width:1440px;height:900px;transform-origin:0 0;overflow:hidden}
.before{display:none;width:100%;border-radius:18px;box-shadow:0 0 0 1px var(--hairline)}
.is-before .wt-wrap{display:none}.is-before .before{display:block}
.wt-notes{list-style:none;margin:0;padding:8px 20px 48px;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px 32px}
.wt-notes li{display:flex;gap:12px;padding:12px 0;box-shadow:inset 0 -1px 0 var(--hairline)}
.wt-notes b{font-size:14px;font-weight:600}.wt-notes p{margin:2px 0 0;font-size:13px;line-height:19px;color:var(--ink-2)}
.wt-open{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.wt-n,.wt [data-n]::after{width:22px;height:22px;border-radius:999px;display:grid;place-items:center;flex:none;background:var(--accent);color:var(--on-accent);font:600 12px/1 var(--font-sans)}
.wt-micro .wt-n{background:var(--fill);color:var(--ink-3)}
.wt [data-n]{position:relative}
.wt [data-n]::after{content:attr(data-n);position:absolute;top:-1px;left:-34px;z-index:5;box-shadow:0 0 0 3px var(--panel)}
.wt .px-side[data-n]::after{top:18px;left:auto;right:-11px}
.wt .px-head[data-n]::after{top:13px;left:292px}
.wt .px-clockin[data-n]::after{left:auto;right:-6px;top:-10px}
.wt .px-totals[data-n]::after{left:-30px;top:3px;box-shadow:0 0 0 3px var(--panel)}
.wt .px-ro__rail [data-n]::after{left:-19px;top:-9px}.wt .px-props[data-n]::after{top:4px}
.wt .px-smenu[data-n]::after{left:-30px;top:6px}
.wt .px-modal[data-n]::after{left:-30px;top:18px;box-shadow:none}
.layer{position:absolute;z-index:40}
.layer.in-modal{z-index:90}
.mock .px-scrim{position:absolute;padding-top:110px;z-index:60}
.mock .scrim-cmd{position:absolute;inset:0;background:var(--scrim);z-index:60;display:flex;justify-content:center;align-items:flex-start;padding-top:120px;animation:px-fade .16s ease-out both}
.mock .scrim-cmd .px-cmd{animation:px-rise .2s cubic-bezier(.2,.8,.2,1) both}
.px-cmd__item{cursor:pointer}.px-cmd__item:hover{background:var(--fill)}
.toastwrap{position:absolute;left:0;right:0;bottom:24px;display:flex;justify-content:center;z-index:85;pointer-events:none}
.toastwrap .px-toast{pointer-events:auto;animation:px-rise .2s cubic-bezier(.2,.8,.2,1) both}
.px-li.is-gone{transition:opacity .18s ease-out,transform .18s ease-out;opacity:0;transform:translateX(8px)}
.px-ro.is-deleted{opacity:.25;filter:grayscale(1);pointer-events:none;transition:opacity .3s ease-out,filter .3s}
.px-queue{font-size:13px;color:var(--ink-2);padding:10px 12px;border-radius:var(--radius-md);background:var(--panel);box-shadow:inset 0 0 0 1px var(--hairline)}
'''

JS = r'''
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const root=document.documentElement, mock=$('.mock'), wrap=$('.wt-wrap');
const ST=__ST__, SI=__SI__, PSI=__PSI__, PNAME=__PNAME__, POP=__POP__, ICO=__ICO__, REASONS=__REASONS__;
const MODALS={transfer:__M_TRANSFER__, addop:__M_ADDOP__, del:__M_DELETE__};
const MSHELL=__MSHELL__, ROFILES=__ROFILES__;
let scale=1;
function fit(){scale=Math.min(1,wrap.clientWidth/1440);mock.style.transform=`scale(${scale})`;wrap.style.height=(900*scale)+'px';}
addEventListener('resize',fit); fit();
const pop=(el)=>{el.classList.remove('is-new');void el.offsetWidth;el.classList.add('is-new');};
const flash=(el)=>{el.classList.remove('is-flash');void el.offsetWidth;el.classList.add('is-flash');};
const typing=e=>e.target.closest('input,textarea,[contenteditable]');

/* ---------- toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.onclick=()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));});
$$('[data-view]').forEach(b=>b.onclick=()=>{document.body.classList.toggle('is-before',b.dataset.view==='before');$$('[data-view]').forEach(x=>x.classList.toggle('is-on',x===b));fit();});
const wl=$('#wtToggle'); wl.onclick=()=>{const on=!wl.classList.contains('is-on');wl.classList.toggle('is-on',on);$('.px-toggle',wl).classList.toggle('is-on',on);mock.classList.toggle('wt',on);};

/* ---------- floating layers (menus, popovers) ---------- */
let layer=null, layerOwner=null;
function close(){if(layer){layer.remove();layer=null;}if(layerOwner){layerOwner.classList.remove('is-open');layerOwner=null;}}
function place(el,anchor,dx=0,dy=6){const a=anchor.getBoundingClientRect(),m=mock.getBoundingClientRect();let x=(a.left-m.left)/scale+dx,y=(a.bottom-m.top)/scale+dy;
  el.style.left=x+'px';el.style.top=y+'px';requestAnimationFrame(()=>{const r=el.getBoundingClientRect();const over=(r.right-m.left)/scale-1424;if(over>0)el.style.left=(x-over)+'px';const ob=(r.bottom-m.top)/scale-884;if(ob>0)el.style.top=((a.top-m.top)/scale-r.height/scale-6)+'px';});}
function open(html,anchor,dx,dy,owner){close();const d=document.createElement('div');d.className='layer'+(anchor.closest('.px-modal')?' in-modal':'');d.innerHTML=html;mock.appendChild(d);place(d,anchor,dx,dy);layer=d;if(owner){layerOwner=owner;owner.classList.add('is-open');}return d;}
mock.addEventListener('mousedown',e=>{if(layer&&!layer.contains(e.target)&&!e.target.closest('[data-status-btn],[data-stage],[data-opts],[data-pstat],[data-select]'))close();});

/* ---------- toast ---------- */
let tt;function toast(msg,undo){$('.toastwrap',mock)?.remove();const w=document.createElement('div');w.className='toastwrap';w.innerHTML=`<div class="px-toast">${msg}${undo?'<button class="px-toast__act">Undo</button>':''}</div>`;mock.appendChild(w);if(undo)w.querySelector('button').onclick=()=>{undo();w.remove();};clearTimeout(tt);tt=setTimeout(()=>w.remove(),5000);}

/* ---------- RO status ---------- */
let cur={k:'hold',sub:''};
function setStatus(k,sub,quiet){const prev={...cur};cur={k,sub:sub||''};const s=ST.find(x=>x.k===k);const btn=$('[data-status-btn]');
  btn.innerHTML=SI[k]+`<span data-status-name>${s.name}</span>`+(sub?`<span class="px-status__sub">· ${sub}</span>`:'')+ICO.chevD.replace('px-ico','px-ico px-chev');
  pop($('.px-si',btn));btn.parentElement.classList.toggle('px-live',k==='working');close();
  if(!quiet)toast(SI[k]+`Status set to ${s.name}${sub?' · '+sub:''}`,()=>setStatus(prev.k,prev.sub,true));}
function statusMenu(anchor){
  const rows=ST.map(s=>`<button class="px-menu__item${s.k===cur.k?' is-on':''}" data-k="${s.k}">${SI[s.k]}<span>${s.name}</span><span class="px-kbd">${s.key}</span>${s.subs.length?'<svg class="px-ico px-smenu__more" viewBox="0 0 24 24"><path d="M9.5 6.5L15 12l-5.5 5.5"/></svg>':'<span style="width:16px"></span>'}</button>`+(['hold','customer','released'].includes(s.k)?'<div class="px-menu__sep"></div>':'')).join('');
  const d=open(`<div class="px-smenu" data-n="10"><div class="px-pop"><div class="px-menu__search"><svg class="px-ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input placeholder="Set status…" style="all:unset;flex:1;min-width:0;color:var(--ink)"><span class="px-kbd">S</span></div>${rows}</div><div class="px-pop px-sub" hidden></div></div>`,anchor,0,6);
  const sub=d.querySelector('.px-sub'), inp=d.querySelector('input'); inp.focus();
  inp.oninput=()=>{const q=inp.value.toLowerCase();$$('.px-menu__item',d.querySelector('.px-pop')).forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(q));};
  inp.onkeydown=e=>{const s=ST.find(x=>x.key===e.key);if(s&&!inp.value){e.preventDefault();setStatus(s.k,s.k==='working'?'Repairing':'');}};
  $$('.px-menu__item[data-k]',d).forEach(b=>{const s=ST.find(x=>x.k===b.dataset.k);
    b.onmouseenter=()=>{$$('.px-menu__item',d).forEach(x=>x.classList.remove('is-hover'));b.classList.add('is-hover');
      if(s.subs.length){sub.hidden=false;sub.style.marginTop=(b.offsetTop-36)+'px';sub.innerHTML=`<div class="px-menu__group">${s.desc}</div>`+s.subs.map(r=>`<button class="px-menu__item" data-r="${r}">${r}</button>`).join('');
        $$('[data-r]',sub).forEach(r=>r.onclick=()=>setStatus(s.k,r.dataset.r));} else sub.hidden=true;};
    b.onclick=()=>setStatus(s.k,s.k==='working'?'Repairing':'');});
}
$('[data-status-btn]').onclick=e=>{layer&&layer.querySelector('.px-smenu')?close():statusMenu(e.currentTarget);};

/* ---------- stages ---------- */
$$('[data-stage]').forEach(b=>b.onclick=()=>{const p=POP[b.dataset.stage];
  const d=open(`<div class="px-pop px-stagepop"><h4>${p[0]}</h4><p>${p[1]}</p>${p[2].map(c=>`<label class="px-check${c[1]?' is-on':''}"><i></i><span>${c[0]}</span></label>`).join('')}</div>`,b,0,4);
  $$('.px-check',d).forEach(c=>c.onclick=()=>c.classList.toggle('is-on'));});
function stageState(k,state){const s=$(`[data-stage="${k}"]`);s.className='px-stage__seg'+(state?' is-'+state:'');if(k==='approval')POP.approval[2].forEach((c,i)=>{if(state==='done')c[1]=1;});}

/* ---------- details pane: collapsible groups that always fit ---------- */
const rail=$('[data-rail]'); let tick=1; const openedAt={};
$$('.px-pg').forEach((g,i)=>{if(g.classList.contains('is-open'))openedAt[g.dataset.pg]=i+1;});
function need(){const cs=getComputedStyle(rail);let h=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom)+$('[data-next]').offsetHeight+20;
  const gs=$$('.px-pg');gs.forEach((g,i)=>{h+=30+(g.classList.contains('is-open')?[...$('.px-pg__in',g).children].reduce((a,c)=>a+c.offsetHeight,0)+8:0)+(i?4:0);});return h;}
function fitRail(keep){let guard=6;while(need()>rail.clientHeight+2&&guard--){const open=$$('.px-pg.is-open').filter(g=>g.dataset.pg!==keep).sort((a,b)=>openedAt[a.dataset.pg]-openedAt[b.dataset.pg]);if(!open.length)break;open[0].classList.remove('is-open');}}
$$('[data-pg-toggle]').forEach(h=>h.onclick=e=>{if(e.target.closest('.px-pg__act'))return;const g=h.closest('.px-pg');const on=!g.classList.contains('is-open');g.classList.toggle('is-open',on);if(on){openedAt[g.dataset.pg]=++tick+10;fitRail(g.dataset.pg);}});
fitRail();
$$('.px-copy').forEach(c=>c.onclick=e=>{e.stopPropagation();try{navigator.clipboard.writeText(c.dataset.copy);}catch(_){}c.classList.add('is-done');setTimeout(()=>c.classList.remove('is-done'),1400);});
$$('[data-toggle]').forEach(t=>t.onclick=()=>{t.classList.toggle('is-on');if(t.closest('.px-prop'))toast(t.classList.contains('is-on')?'Marked as a warranty RO':'No longer a warranty RO');});

/* ---------- Next card: a small state machine ---------- */
const NEXT={
  send:{t:'Operation 2 isn’t approved yet — send the estimate.',a:[['pending','Approval pending',''],['sent','Estimate sent','accent']]},
  waiting:{t:'Estimate sent to Blue Ridge at 10:42 — waiting on approval for operation 2.',a:[['declined','Declined',''],['approved','Approved','accent']]},
  pending:{t:'Approval pending on operation 2 — follow up with Blue Ridge if nothing by 2 pm.',a:[['declined','Declined',''],['approved','Approved','accent']]},
  order:{t:'Operation 2 is approved — order the inner wheel seal.',a:[['order','Order part','accent']]},
  clear:{t:'Nothing waiting on anyone. Keep going on operation 1.',a:[],clear:1}};
let nextState='send';
function renderNext(k,quiet){const prevK=nextState;nextState=k;const n=NEXT[k],card=$('[data-next]'),b=$('[data-next-body]');
  b.innerHTML=`<p class="px-next__t">${n.t}</p>`+(n.a.length?`<div class="px-next__acts">${n.a.map(a=>`<button class="px-btn px-btn--sm${a[2]?' px-btn--accent':''}" data-next-act="${a[0]}">${a[1]}</button>`).join('')}</div>`:'');
  card.classList.toggle('is-clear',!!n.clear);$('.px-next__for',card).textContent=n.clear?'All operations':'Operation 2 · Wheel seal';
  b.classList.remove('is-swap');void b.offsetWidth;b.classList.add('is-swap');bindNext();fitRail();}
function opIcon(n,k,color){const r=$(`.px-row[data-op="${n}"]`);const old=$('.px-si',r);old.outerHTML=color?SI[k].replace(`data-s="${k}"`,`data-s="${color}"`):SI[k];pop($('.px-si',r));flash(r);}
function bindNext(){$$('[data-next-act]').forEach(b=>b.onclick=()=>{const a=b.dataset.nextAct,prev=nextState;
  const undo=()=>renderNext(prev);
  if(a==='sent'){opIcon(2,'customer');stageState('approval','wait');renderNext('waiting');toast(SI.customer+'Operation 2 · Waiting – Customer · Estimate sent',undo);}
  if(a==='pending'){opIcon(2,'customer');renderNext('pending');toast(SI.customer+'Operation 2 · Waiting – Customer · Approval pending',undo);}
  if(a==='approved'){opIcon(2,'hold');stageState('approval','done');$('.px-stage__top span:nth-child(3)').textContent='· all operations approved';renderNext('order');toast(SI.released+'Operation 2 approved',undo);}
  if(a==='declined'){opIcon(2,'declined');stageState('approval','done');renderNext('clear');toast(SI.declined+'Operation 2 declined by customer',undo);}
  if(a==='order'){setPart('2-1','ordered',true);renderNext('clear');toast(PSI.ordered+'Inner wheel seal ordered',undo);}
});}
bindNext();

/* ---------- parts dropdown ---------- */
function partCounts(n){const body=$(`[data-body="${n}"]`);const rows=$$('[data-part]',body);const inn=rows.filter(r=>['received','installed'].includes($('[data-pstat]',r).dataset.pstat)).length;
  $('[data-tab="parts"] .px-tab__n',body).textContent=rows.length?`${inn}/${rows.length}`:'';
  const out=rows.filter(r=>$('[data-pstat]',r).dataset.pstat==='notordered').length, row=$(`.px-row[data-op="${n}"]`);let m=$('.px-row__m',row);
  if(out){if(!m){m=document.createElement('span');m.className='px-row__m';$('.px-tag',row).before(m);}m.textContent=`${out} part${out>1?'s':''} not ordered`;}else if(m)m.remove();updateTotals();}
function setPart(id,k,quiet){const r=$(`[data-part="${id}"]`),b=$('[data-pstat]',r),prev=b.dataset.pstat;b.dataset.pstat=k;
  b.innerHTML=PSI[k]+`<span>${PNAME[k]}</span>`+ICO.chevD.replace('px-ico','px-ico px-chev');pop($('.px-si',b));flash(r);partCounts(+r.closest('[data-body]').dataset.body);close();
  if(!quiet)toast(PSI[k]+`${$('span',r).textContent} · ${PNAME[k]}`,()=>setPart(id,prev,true));}
function partMenu(btn){const r=btn.closest('[data-part]'),id=r.dataset.part,curk=btn.dataset.pstat,opn=+r.closest('[data-body]').dataset.body;
  const items=Object.keys(PSI).map((k,i)=>`<button class="px-menu__item${k===curk?' is-on':''}" data-set="${k}">${PSI[k]}<span>${PNAME[k]}</span>${k===curk?ICO.check.replace('px-ico','px-ico px-menu__tick'):`<span class="px-kbd">${i+1}</span>`}</button>`).join('');
  const d=open(`<div class="px-pop px-pmenu"><div class="px-menu__group">Part status</div>${items}<div class="px-menu__sep"></div>
    <button class="px-menu__item" data-pact="edit">${ICO.pencil}Edit part…<span class="px-kbd">E</span></button>
    <button class="px-menu__item" data-pact="copy">${ICO.copy}Copy part number</button>
    <button class="px-menu__item" data-pact="move">${ICO.swap}Move to operation…<svg class="px-ico px-smenu__more" viewBox="0 0 24 24" style="margin-left:auto"><path d="M9.5 6.5L15 12l-5.5 5.5"/></svg></button>
    <div class="px-menu__sep"></div><button class="px-menu__item px-menu__item--danger" data-pact="remove">${ICO.trash}Remove part</button></div>`,btn,-8,4,btn);
  $$('[data-set]',d).forEach(x=>x.onclick=()=>setPart(id,x.dataset.set));
  d.tabIndex=-1;d.focus();d.onkeydown=e=>{const k=Object.keys(PSI)[+e.key-1];if(k){e.preventDefault();setPart(id,k);}if(e.key==='Escape')close();};
  $('[data-pact="copy"]',d).onclick=()=>{try{navigator.clipboard.writeText($('.px-id',r).textContent);}catch(_){}close();toast(ICO.check+'Part number copied');};
  $('[data-pact="edit"]',d).onclick=()=>{close();toast(ICO.pencil+'Edit opens the part in place (description · number · qty · price)');};
  $('[data-pact="remove"]',d).onclick=()=>{close();const parent=r.parentElement,next=r.nextSibling;r.classList.add('is-gone');setTimeout(()=>{r.remove();partCounts(opn);},180);
    toast(ICO.trash+'Part removed',()=>{r.classList.remove('is-gone');parent.insertBefore(r,next);partCounts(opn);flash(r);});};
  $('[data-pact="move"]',d).onmouseenter=e=>{if($('.px-sub',d))return;const s=document.createElement('div');s.className='px-pop px-sub';s.style.cssText='position:absolute;left:240px;top:'+(e.currentTarget.offsetTop-6)+'px;width:220px';
    s.innerHTML='<div class="px-menu__group">Move to</div>'+$$('.px-row[data-op]').filter(x=>+x.dataset.op!==opn).map(x=>`<button class="px-menu__item" data-to="${x.dataset.op}">${x.dataset.op} · ${$('.px-row__t',x).textContent}</button>`).join('');
    d.style.position='absolute';d.appendChild(s);
    $$('[data-to]',s).forEach(t=>t.onclick=()=>{const to=+t.dataset.to;close();$(`[data-body="${to}"] [data-plist]`).appendChild(r);partCounts(opn);partCounts(to);flash(r);toast(ICO.swap+`Moved to operation ${to}`);});};
}
mock.addEventListener('click',e=>{const b=e.target.closest('[data-pstat]');if(!b)return;e.stopPropagation();if(layerOwner===b){close();return;}partMenu(b);});

/* ---------- modals ---------- */
let modal=null, modalFrom=null;
function closeModal(){if(!modal)return;const m=modal;modal=null;close();m.classList.add('is-closing');setTimeout(()=>m.remove(),120);modalFrom&&modalFrom.focus&&modalFrom.focus();}
function openModal(kind,from){close();if(modal)modal.remove();const w=document.createElement('div');const src=MODALS[kind];w.innerHTML=typeof src==='function'?src():src;const m=w.firstElementChild;mock.appendChild(m);modal=m;modalFrom=from||null;
  m.addEventListener('mousedown',e=>{if(e.target===m)closeModal();});$$('[data-close]',m).forEach(b=>b.onclick=closeModal);
  $$('[data-goto-op]',m).forEach(b=>b.onclick=()=>{const n=b.dataset.gotoOp,tab=b.dataset.gotoTab;closeModal();gotoOp(n,tab);});
  $$('[data-file]',m).forEach(b=>b.onclick=()=>toast(ICO.clip+`Opens ${b.dataset.file}`));
  $$('.px-seg button',m).forEach(b=>b.onclick=()=>{$$('button',b.parentElement).forEach(x=>x.classList.toggle('is-on',x===b));if(kind==='transfer')routeTo(b.textContent);});
  $$('[data-pick]',m).forEach(p=>p.onclick=()=>{if(p.classList.contains('is-dis'))return;$$('[data-pick]',m).forEach(x=>x.classList.toggle('is-on',x===p));const fn=$('b',p).textContent.split(' ')[0];const lab=$('.px-check-row',m);lab.lastChild.textContent=`Ask ${fn} to accept before it moves`;});
  $$('.px-tagpick .px-tag',m).forEach(t=>t.onclick=()=>$$('.px-tagpick .px-tag',m).forEach(x=>x.classList.toggle('is-on',x===t)));
  $$('[data-toggle]',m).forEach(t=>t.onclick=()=>t.classList.toggle('is-on'));
  const sel=$('[data-select]',m);if(sel)sel.onclick=()=>{if(layerOwner===sel){close();return;}const d=open(`<div class="px-pop" style="width:${sel.offsetWidth}px">${REASONS.map(r=>`<button class="px-menu__item${sel.firstChild.textContent===r?' is-on':''}">${r}</button>`).join('')}</div>`,sel,0,4,sel);
    $$('.px-menu__item',d).forEach(x=>x.onclick=()=>{sel.firstChild.textContent=x.textContent;close();});};
  $$('[data-submit]',m).forEach(b=>b.onclick=()=>submit(b.dataset.submit));
  setTimeout(()=>{const f=$('[data-autofocus]',m)||$('input,textarea,button.px-btn--primary,button.px-btn--solid',m);f&&f.focus();},40);
  function routeTo(target){const box=$('.px-picks',m).closest('.px-field');let q=$('.px-queue',m);
    if(target==='Technician'){box.hidden=false;q&&q.remove();}else{box.hidden=true;if(!q){q=document.createElement('div');q.className='px-queue';box.after(q);}q.textContent=`Goes to the ${target} queue — whoever is on picks it up.`;}}
}
function submit(kind){const m=modal;if(!m)return;
  if(kind==='transfer'){const seg=$('.px-seg .is-on',m).textContent;const who=seg==='Technician'?$('[data-pick].is-on b',m).textContent:seg;closeModal();
    const w=$('[data-with]');const was=w.innerHTML;w.innerHTML=`with <span class="px-av">MR</span> Mike Rodriguez · <span style="color:var(--accent-text)">sent to ${who}, waiting to accept</span>`;flash(w);
    toast(ICO.swap+`Sent to ${who} · waiting for them to accept`,()=>{w.innerHTML=was;});}
  if(kind==='addop'){const name=$('input',m).value.trim()||'Air leak at the front axle';const t=$('.px-tagpick .is-on',m).dataset.t;const q=(+$('.px-affix input',m).value||0).toFixed(2);closeModal();addOp(name,t,q);}
  if(kind==='delete'){closeModal();const ro=$('.px-ro');ro.classList.add('is-deleted');toast(ICO.trash+'RO-37538 deleted',()=>ro.classList.remove('is-deleted'));}
}
function addOp(name,t,q){const ops=$('.px-ops');const n=$$('.px-row[data-op]').length+1;const tpl=$('.px-row[data-op="3"]').cloneNode(true);
  tpl.dataset.op=n;tpl.classList.remove('is-on');$('.px-row__n',tpl).textContent=n;$('.px-row__t',tpl).textContent=name;const tag=$('.px-tag',tpl);tag.dataset.t=t;tag.textContent=t;$('.px-row__time',tpl).innerHTML=`0.00 <em>/ ${q} h</em>`;$('.px-row__m',tpl)?.remove();
  const body=$('[data-body="3"]').cloneNode(true);body.dataset.body=n;body.hidden=true;$('[data-plist]',body).innerHTML='';$('[data-tab="parts"] .px-tab__n',body).textContent='';$$('[data-tab="files"] .px-tab__n',body).forEach(x=>x.textContent='');
  $('[data-pane="files"]',body).innerHTML='<div class="px-li"><small>No files yet.</small></div>';$('textarea',body).value='';$$('.px-time__stats b',body)[0].innerHTML=`${q}<small>h</small>`;$('[data-left]',body).textContent=q;
  ops.appendChild(tpl);ops.appendChild(body);bindRow(tpl);bindBody(body);flash(tpl);updateTotals();$('[data-opcount]').textContent=n;toast(ICO.check+`Operation ${n} added · ${name}`);
  $('.px-ro__main').scrollTo({top:tpl.offsetTop-200,behavior:'smooth'});}
$('[data-transfer]').onclick=e=>{e.stopPropagation();openModal('transfer',e.currentTarget);};
$('[data-addop]').onclick=e=>openModal('addop',e.currentTarget);
$$('[data-open-modal]').forEach(b=>b.onclick=()=>{document.body.classList.remove('is-before');$$('[data-view]').forEach(x=>x.classList.toggle('is-on',x.dataset.view==='after'));fit();
  wrap.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>openModal(b.dataset.openModal==='delete'?'del':b.dataset.openModal),250);});

/* ---------- options menu + command menu ---------- */
$('[data-opts]').onclick=e=>{const d=open(__OPTS__,e.currentTarget,-212,6);
  $$('.px-menu__item',d).forEach(x=>x.onclick=()=>{const t=x.textContent.trim();close();
    if(t.startsWith('Delete'))openModal('del',e.currentTarget);else if(t.startsWith('Add operation'))openModal('addop');else toast(ICO.check+t.replace(/[A-Z]$/,'').trim());});};
function openCmd(){close();const s=document.createElement('div');s.className='scrim-cmd';s.innerHTML=__CMD__;mock.appendChild(s);layer=s;s.onmousedown=ev=>{if(ev.target===s)close();};
  $$('.px-cmd__item',s).forEach(it=>it.onclick=()=>{const t=it.textContent;close();if(t.includes('Transfer'))openModal('transfer');else if(t.includes('Add operation'))openModal('addop');else if(t.includes('Start clock'))$('[data-body="1"] [data-go]').click();else toast(ICO.check+'Opened RO');});}
$('[data-cmd]').onclick=openCmd;

/* ---------- keyboard ---------- */
addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(layer){close();return;}if(modal){closeModal();return;}}
  if((e.metaKey||e.ctrlKey)&&e.key==='Enter'&&modal){e.preventDefault();const sb=$('[data-submit]',modal);sb?sb.click():closeModal();return;}
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCmd();return;}
  if(typing(e)||modal||layer||e.metaKey||e.ctrlKey||e.altKey)return;
  if(e.key==='s'){e.preventDefault();statusMenu($('[data-status-btn]'));}
  if(e.key==='t'){e.preventDefault();openModal('transfer');}
  if(e.key==='o'){e.preventDefault();openModal('addop');}
});


/* ---------- header totals + their modals ---------- */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function opsData(){return $$('.px-row[data-op]').map(r=>{const n=+r.dataset.op,b=$(`[data-body="${n}"]`);
  return {n,title:$('.px-row__t',r).textContent,si:$('.px-si',r).outerHTML.replace('px-si is-new','px-si'),burnt:parseFloat($('[data-burnt]',b).textContent)||0,q:quoted(b),
    parts:$$('[data-part]',b).map(p=>({d:$('span',p).textContent,pn:$('.px-id',p).textContent,qty:$('.r',p).textContent,k:$('[data-pstat]',p).dataset.pstat})),
    files:$$('[data-pane="files"] .px-li--part',b).map(f=>({name:f.firstElementChild.textContent.trim(),kind:$('.px-muted',f).textContent,date:$('small',f).textContent}))};});}
function roTotals(){const o=opsData(),q=o.reduce((a,x)=>a+x.q,0),b=o.reduce((a,x)=>a+x.burnt,0),wq=o.filter(x=>x.burnt>0).reduce((a,x)=>a+x.q,0);
  const parts=o.flatMap(x=>x.parts);
  return {o,q,b,left:o.reduce((a,x)=>a+Math.max(0,x.q-x.burnt),0),eff:b>0?Math.round(wq/b*100):null,np:parts.length,
    inhand:parts.filter(p=>['received','installed'].includes(p.k)).length,nf:ROFILES.length+o.reduce((a,x)=>a+x.files.length,0),parts};}
const money=x=>x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
function updateTotals(quiet){const t=roTotals();
  const set=(k,v)=>{const el=$(`[data-tt="${k}"]`);v=String(v);if(el.textContent===v)return false;el.textContent=v;return true;};
  set('burnt',t.b.toFixed(2));set('quoted',t.q.toFixed(2));
  if((set('inhand',t.inhand)|set('nparts',t.np))&&!quiet)flash($('[data-total="parts"]'));
  if(set('nfiles',t.nf)&&!quiet)flash($('[data-total="files"]'));
  $('[data-total="time"]').classList.toggle('is-live',!!run);
  const labor=t.q*210;$('[data-labor]').textContent=`${t.q.toFixed(2)} h · $${money(labor)}`;$('[data-est]').textContent=$('[data-est-sum]').textContent='$'+money(labor+777.5);}
const mshell=(t,s,b)=>MSHELL.split('@@T').join(t).replace('@@S',()=>s).replace('@@B',()=>b);
const grp=(label,sub,go,tab)=>{const inner=`<b>${label}</b>`+(sub?`<span>${sub}</span>`:'');return go?`<button class="px-mgrp" data-goto-op="${go}"${tab?` data-goto-tab="${tab}"`:''}>${inner}${ICO.chevR}</button>`:`<div class="px-mgrp">${inner}</div>`;};
function mTime(){const t=roTotals(),effc=t.eff!=null&&t.eff>=100?'px-good':'px-warn',effv=t.eff!=null?`${t.eff}<small>%</small>`:'—';
  const stats=`<div class="px-tsum"><div><span>Quoted</span><b>${t.q.toFixed(2)}<small>h</small></b></div><div><span>Burnt</span><b>${t.b.toFixed(2)}<small>h</small></b></div><div><span>Left</span><b>${t.left.toFixed(2)}<small>h</small></b></div><div><span>Efficiency</span><b class="${effc}">${effv}</b></div></div>`;
  const rows=t.o.map(x=>`<button class="px-mrow px-mrow--time" data-goto-op="${x.n}">${x.si}<span class="px-mrow__t"><span class="px-mrow__n">${x.n}</span>${esc(x.title)}</span><span class="px-mini"><i${x.burnt>x.q?' class="over"':''} style="width:${Math.min(100,x.q?x.burnt/x.q*100:0)}%"></i></span><span class="px-mrow__v">${x.burnt.toFixed(2)} <em>/ ${x.q.toFixed(2)} h</em></span></button>`).join('');
  return mshell('Time on RO-37538',`Blue Ridge Haulage · ${t.o.length} operations`,`${stats}<div class="px-mlist">${grp('By operation')}${rows}</div>`);}
function mParts(){const t=roTotals();
  const cells=Object.keys(PSI).map(k=>`<div><span>${PSI[k]}${PNAME[k]}</span><b>${t.parts.filter(p=>p.k===k).length}</b></div>`).join('');
  const groups=t.o.filter(x=>x.parts.length).map(x=>`<div class="px-mlist">${grp('Operation '+x.n,' · '+esc(x.title),x.n,'parts')}${x.parts.map(p=>`<button class="px-mrow px-mrow--part" data-goto-op="${x.n}" data-goto-tab="parts"><span class="px-mrow__t">${esc(p.d)}</span><span class="px-id px-faint">${esc(p.pn)}</span><span class="r">${esc(p.qty)}</span><span class="px-pstat-ro">${PSI[p.k]}<span>${PNAME[p.k]}</span></span></button>`).join('')}</div>`).join('');
  return mshell('Parts on RO-37538',`Blue Ridge Haulage · ${t.inhand} of ${t.np} in hand`,`<div class="px-tsum px-tsum--5">${cells}</div>${groups||'<p class="px-modal__p">No parts on this RO yet.</p>'}`);}
const frow=f=>`<button class="px-mrow px-mrow--file" data-file="${esc(f.name)}">${ICO.clip}<span class="px-mrow__t">${esc(f.name)}</span><span class="px-faint">${esc(f.kind)}</span><small>${esc(f.date)}</small></button>`;
function mFiles(){const t=roTotals();
  const g=`<div class="px-mlist">${grp('Whole RO',` · ${ROFILES.length}`)}${ROFILES.map(frow).join('')}</div>`+t.o.filter(x=>x.files.length).map(x=>`<div class="px-mlist">${grp('Operation '+x.n,' · '+esc(x.title),x.n,'files')}${x.files.map(frow).join('')}</div>`).join('');
  return mshell('Files on RO-37538',`Blue Ridge Haulage · ${t.nf} files`,g);}
MODALS.time=mTime;MODALS.parts=mParts;MODALS.files=mFiles;
function gotoOp(n,tab){const row=$(`.px-row[data-op="${n}"]`);if(!row.classList.contains('is-on'))row.click();const b=$(`[data-body="${n}"]`);if(tab)$(`[data-tab="${tab}"]`,b).click();
  $('.px-ro__main').scrollTo({top:Math.max(0,row.offsetTop-200),behavior:'smooth'});flash(row);}
$$('[data-total]').forEach(b=>b.onclick=()=>openModal(b.dataset.total,b));

/* ---------- operations, tabs, clock ---------- */
function inkTo(tabs){const on=$('.px-tab.is-on',tabs),ink=$('.px-tabs__ink',tabs);if(!on||!ink||!tabs.offsetWidth)return;ink.style.left=on.offsetLeft+'px';ink.style.width=on.offsetWidth+'px';}
function bindBody(body){const tabs=$('.px-tabs',body);if(!$('.px-tabs__ink',tabs)){const i=document.createElement('i');i.className='px-tabs__ink';tabs.appendChild(i);tabs.classList.add('has-ink');}
  $$('[data-tab]',body).forEach(t=>t.onclick=()=>{$$('[data-tab]',body).forEach(x=>x.classList.toggle('is-on',x===t));$$('[data-pane]',body).forEach(p=>p.hidden=p.dataset.pane!==t.dataset.tab);inkTo(tabs);});
  $('[data-go]',body).onclick=()=>clock(body);requestAnimationFrame(()=>inkTo(tabs));}
function bindRow(r){r.onclick=()=>{const n=+r.dataset.op;$$('.px-row[data-op]').forEach(x=>x.classList.toggle('is-on',x===r));$$('[data-body]').forEach(b=>b.hidden=+b.dataset.body!==n);const b=$(`[data-body="${n}"]`);requestAnimationFrame(()=>inkTo($('.px-tabs',b)));};}
$$('.px-row[data-op]').forEach(bindRow);$$('[data-body]').forEach(bindBody);
const BASE={1:22557}; let run=null, startedAt=0;
function fmt(s){const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h+':'+String(m).padStart(2,'0')+':'+String(x).padStart(2,'0');}
function quoted(body){return parseFloat($$('.px-time__stats b',body)[0].textContent)||1;}
function paint(body,secs){const n=+body.dataset.body,h=secs/3600,q=quoted(body);$('[data-clock]',body).textContent=fmt(secs);const ct=$('[data-clockin-t]');if(ct)ct.textContent=fmt(secs);
  $('[data-burnt]',body).textContent=h.toFixed(2);$('[data-left]',body).textContent=Math.max(0,q-h).toFixed(2);$('[data-eff]',body).textContent=h>0?Math.round(q/h*100):'—';
  $('[data-bar]',body).style.width=Math.min(100,h/q*100)+'%';const row=$(`.px-row[data-op="${n}"]`);$('.px-row__time',row).innerHTML=`${h.toFixed(2)} <em>/ ${q.toFixed(2)} h</em>`;$('.px-mini i',row).style.width=Math.min(100,h/q*100)+'%';updateTotals();}
function sideJob(n){const j=$('[data-clockin-job]');if(!j)return;if(!n){j.hidden=true;return;}const row=$(`.px-row[data-op="${n}"]`);$('[data-clockin-what]',j).textContent=`RO-37538 · Op ${n}`;$('[data-clockin-name]',j).textContent=$('.px-row__t',row).textContent;j.hidden=false;j.onclick=e=>{if(e.target.closest('[data-clockin-stop]')){e.stopPropagation();run&&clock(run.body);return;}row.click();$('.px-ro__main').scrollTo({top:Math.max(0,row.offsetTop-200),behavior:'smooth'});};}
function clock(body){const n=+body.dataset.body,card=$('.px-time',body),g=$('[data-go]',body);
  if(run&&run.body===body){clearInterval(run.t);BASE[n]=(BASE[n]||0)+Math.floor((Date.now()-startedAt)/1000);run=null;card.classList.remove('is-live');g.innerHTML=ICO.play;$('[data-clock-cap]',body).textContent='On this operation · clock stopped';
    opIcon(n,'hold');setStatus('hold','',true);toast(SI.hold+`Clock stopped · operation ${n}`);updateTotals();sideJob(null);return;}
  if(run)clock(run.body);
  startedAt=Date.now();card.classList.add('is-live');g.innerHTML=ICO.stop;$('[data-clock-cap]',body).textContent='Clock running · Repairing';
  opIcon(n,'working');setStatus('working','Repairing',true);toast(SI.working+`Clock started · operation ${n}`);sideJob(n);
  run={body,t:setInterval(()=>paint(body,(BASE[n]||0)+Math.floor((Date.now()-startedAt)/1000)),1000)};updateTotals();}
updateTotals(true);
'''
rep = {"__ST__": ST, "__SI__": SI, "__PSI__": PSI, "__PNAME__": PNAME, "__POP__": STAGEPOP, "__ICO__": ICO, "__REASONS__": REASONS,
       "__M_TRANSFER__": P.modal_transfer(True), "__M_ADDOP__": P.modal_addop(True), "__M_DELETE__": P.modal_delete(True),
       "__OPTS__": P.options_menu(), "__CMD__": P.cmd_menu(),
       "__MSHELL__": P.modal(" px-modal--md", "@@T", "@@S", "@@B", P._info_foot(), ' data-n="13"'), "__ROFILES__": [{"name": a, "kind": b, "date": c} for a, b, c in P.ROFILES_D]}
for k, v in rep.items():
    JS = JS.replace(k, json.dumps(v))

html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec RO redesign</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{CSS}</style>
</head>
<body>
<div class="wt-bar">
  <h1>{P.LOGO}Parsec · RO page redesign</h1>
  <div class="px-seg"><button class="is-on" data-view="after">After</button><button data-view="before">Before</button></div>
  <div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div>
  <label id="wtToggle" class="is-on"><span class="px-toggle is-on"></span>Numbers</label>
</div>
<div class="wt-stage">
  <div class="wt-wrap"><div class="mock wt">{app}</div></div>
  <img class="before" alt="The RO page today" src="data:image/png;base64,{before}">
</div>
<ol class="wt-notes">{notes_html}</ol>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w").write(html)
print("wrote", OUT, len(html)//1024, "KB")
