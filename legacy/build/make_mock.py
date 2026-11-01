import os, sys, json, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import parts as P
from parts import ic, si, STATUSES
B = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
tok = open(f"{B}/ds/tokens.local.css").read()
bun = open(f"{B}/ds/project/components/bundle.css").read().split("\n", 1)[1]  # drop @import; fonts linked in head
before = base64.b64encode(open("/root/.claude/uploads/febe01e4-e12e-554d-9dc2-ccfd769708e9/ca272739-image.png", "rb").read()).decode()

# ---- per-operation bodies ----
TIME = {1: [("Mon, Oct 19","7:32 – 11:05","Repairing","3:33"),("Mon, Oct 19","12:10 – 13:41","Repairing","1:31"),("Tue, Oct 20","7:30 – 8:42","Repairing","1:12")], 2: [], 3: []}
PARTS = {1: [("Clutch kit, 15.5 in","85136213","1","released","Received"),("Clutch release bearing","21515427","1","released","Installed")],
         2: [("Inner wheel seal, right rear","21422645","1","parts","Not ordered")],
         3: [("Oil filter","21707134","2","released","Received"),("Fuel filter kit","23658092","1","parts","Ordered")]}
NOTES = {1: "Removed transmission. Clutch disc worn to the rivets, flywheel scored — resurfaced. Installing new clutch kit. (Oct 20 · 8:40)",
         2: "Right rear inner wheel seal weeping onto the shoes. Needs approval before I pull the hub. (Oct 20 · 9:10)", 3: ""}
FILES = {1: [("flywheel-scoring.jpg","Picture","Oct 19"),("clutch-disc.jpg","Picture","Oct 19")], 2: [("rr-seal-leak.jpg","Picture","Oct 20")], 3: []}

def body(o, show):
    num = o[0]; h = "" if show else " hidden"
    t = TIME[num]; pr = PARTS[num]; fl = FILES[num]
    nin = sum(1 for p in pr if p[3] == "released")
    tabs = [("time","Time",str(len(t)) if t else ""),("parts","Parts",f"{nin}/{len(pr)}" if pr else ""),("notes","Notes",""),("files","Files",str(len(fl)) if fl else "")]
    tabh = '<div class="px-tabs" role="tablist">' + "".join(f'<button class="px-tab{" is-on" if k=="time" else ""}" data-tab="{k}">{l}{f"<span class=px-tab__n>{c}</span>" if c else ""}</button>' for k,l,c in tabs) + '</div>'
    tl = "".join(f'<div class="px-li px-li--time"><span>{d}</span><span class="px-num px-muted">{tt}</span><small>{r}</small><span class="r">{du}</span><span class="px-av">MR</span></div>' for d,tt,r,du in t) or '<div class="px-li"><small>No time on this operation yet — start the clock above.</small></div>'
    pl = "".join(f'<div class="px-li px-li--part"><span>{d}</span><span class="px-id px-muted">{pn}</span><span class="r">{q}</span><span class="px-status">{si(s)}{st}</span></div>' for d,pn,q,s,st in pr)
    fh = "".join(f'<div class="px-li px-li--part"><span style="display:flex;gap:10px;align-items:center">{ic("clip")}{f}</span><span class="px-muted">{k}</span><span></span><small>{w}</small></div>' for f,k,w in fl) or '<div class="px-li"><small>No files yet.</small></div>'
    return f'''<div class="px-op" data-body="{num}"{h}>
  {P.timecard(False, num == 1, num)}
  <div>{tabh}<div style="margin-top:4px">
    <div class="px-list" data-pane="time">{tl}<button class="px-add">{ic("plus")}Add time entry</button></div>
    <div class="px-list" data-pane="parts" hidden>{pl}<button class="px-add">{ic("plus")}Add part</button></div>
    <div data-pane="notes" hidden><textarea class="px-input" style="width:100%;margin-top:12px" placeholder="Work performed — Enter stamps the date and time">{NOTES[num]}</textarea></div>
    <div class="px-list" data-pane="files" hidden>{fh}</div>
  </div></div>
</div>'''

ops_html = "".join(P.op_row(o, on=(o[0]==1)) + body(o, o[0]==1) for o in P.OPS)
ops_sec = f'''<div class="px-sec"><h3>Operations</h3><span class="n">3</span><button class="px-btn px-btn--ghost px-btn--sm">{ic("plus")}Add operation</button></div>
<div class="px-ops" data-n="6">{ops_html}</div>'''

app = f'''<div class="px-app">
{P.sidebar(wt=True)}
<section class="px-panel">
{P.header(True)}
<div class="px-ro">
  <main class="px-ro__main"><div class="px-ro__col">
    {P.title_block("hold", "", True)}
    {P.stage(True)}
    {P.nextstep(True)}
    {ops_sec}
    {P.feed(True)}
  </div></main>
  <aside class="px-ro__rail">{P.props(True)}</aside>
</div>
</section>
</div>'''

SI = {k: si(k) for k, *_ in STATUSES}
ST = [{"k": k, "name": nm, "desc": d, "subs": s, "key": key} for k, nm, d, s, key in STATUSES]
STAGEPOP = {
 "checkin": ("Check-in", "Done when the unit is connected, the dash photo is in and the location is set.", [("Unit connected / DTC read",1),("Dash photo",1),("Location set",1)]),
 "diag": ("Diag", "Not needed — this RO has no DIAG operation.", []),
 "approval": ("Approval", "Done when every customer-pay operation is approved or declined.", [("Estimate reviewed",1),("Estimate sent",0),("Customer approved",0)]),
 "parts": ("Parts", "Done when every part is received.", [("Parts looked up",1),("Parts in hand",1),("Parts delivered / installed",1)]),
 "repair": ("Repair", "Done when every operation is complete.", [("Operation 1 complete",0),("Operation 2 complete",0),("Operation 3 complete",0)]),
 "roadtest": ("Road test", "Done when the road test is logged as Pass.", [("Road test passed",0)]),
 "closeout": ("Close-out", "Cause and fix on every operation, pictures, RO released.", [("Cause and fix on all operations",0),("Pictures uploaded",1),("DTC uploaded",1),("RO released",0),("Parts installed",0)]),
}
NOTES_WT = [
 ("Sidebar replaces the ten top tabs", "Grouped by job (top · Shop · You), filtered by role, collapsible. Search, clock-in and the inbox move in with it."),
 ("A header that knows where you are", "Breadcrumb, previous / next RO (K / J) and “4 of 12”. Print, link and ⋯ stay quiet."),
 ("The customer is the headline", "Serif name, RO number and age above, vehicle · unit · bay below. Status and who has it sit right under."),
 ("Stages with names", "Seven labelled steps, one summary line and the forecast. Click a step for its checklist."),
 ("One next step, one bronze button", "The only tinted block on the page — the reason, then the action."),
 ("Operations as rows", "Status icon, type, hours, efficiency and owner on one line. The selected one opens in place."),
 ("A calm clock", "Big tabular timer, thin bar with a quoted tick, four numbers, one round play / stop."),
 ("Every field, always visible", "Schedule · People · Vehicle · Paperwork · Money in the rail. No “Show all 17”. Click a value to edit."),
 ("History on the page", "Activity and notes in one timeline with a composer — no count chip to open."),
 ("A status menu you can type into", "Nine statuses with 1–9 shortcuts; reasons in a second level. Press S, or click the status."),
]
notes_html = "".join(f'<li><span class="wt-n">{i+1}</span><div><b>{t}</b><p>{d}</p></div></li>' for i, (t, d) in enumerate(NOTES_WT))

CSS = '''
html,body{margin:0;background:var(--canvas)}
body{font-family:var(--font-sans);color:var(--ink)}
.wt-bar{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:12px 20px;background:var(--canvas);box-shadow:inset 0 -1px 0 var(--hairline)}
.wt-bar h1{margin:0;font:500 20px/26px var(--font-serif);letter-spacing:-.01em;margin-right:auto;display:flex;align-items:center;gap:10px}
.wt-bar h1 svg{width:20px;height:20px}.wt-bar h1 svg circle{fill:var(--ink)}.wt-bar h1 svg .o{fill:var(--ink-3)}.wt-bar h1 svg .c{fill:#22c55e}
.wt-bar label{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-2);cursor:pointer}
.wt-stage{padding:20px}
.wt-wrap{position:relative;width:100%;overflow:hidden;border-radius:18px;box-shadow:0 0 0 1px var(--hairline)}
.mock{position:absolute;left:0;top:0;width:1440px;height:900px;transform-origin:0 0}
.before{display:none;width:100%;border-radius:18px;box-shadow:0 0 0 1px var(--hairline)}
.is-before .wt-wrap{display:none}.is-before .before{display:block}
.wt-notes{list-style:none;margin:0;padding:8px 20px 48px;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px 32px}
.wt-notes li{display:flex;gap:12px;padding:12px 0;box-shadow:inset 0 -1px 0 var(--hairline)}
.wt-notes b{font-size:14px;font-weight:600}.wt-notes p{margin:2px 0 0;font-size:13px;line-height:19px;color:var(--ink-2)}
.wt-n,.wt [data-n]::after{width:22px;height:22px;border-radius:999px;display:grid;place-items:center;flex:none;background:var(--accent);color:var(--on-accent);font:600 12px/1 var(--font-sans)}
.wt [data-n]{position:relative}
.wt [data-n]::after{content:attr(data-n);position:absolute;top:-1px;left:-34px;z-index:5;box-shadow:0 0 0 3px var(--panel)}
.wt .px-side[data-n]::after{top:18px;left:auto;right:-11px}
.wt .px-head[data-n]::after{top:13px;left:auto;right:124px}
.wt .px-ro__rail [data-n]::after{left:auto;right:-4px;top:-3px}
.wt .px-smenu[data-n]::after{left:-30px;top:6px}
.layer{position:absolute;z-index:40}
.scrim{position:absolute;inset:0;background:var(--scrim);z-index:39;display:flex;justify-content:center;align-items:flex-start;padding-top:120px}
.toastwrap{position:absolute;left:0;right:0;bottom:24px;display:flex;justify-content:center;z-index:45;pointer-events:none}
.toastwrap .px-toast{pointer-events:auto;animation:px-up .18s cubic-bezier(.2,.8,.2,1) both}
.px-row .px-si{cursor:pointer}
'''

JS = r'''
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const root=document.documentElement, mock=$('.mock'), wrap=$('.wt-wrap');
const ST=__ST__, SI=__SI__, POP=__POP__;
let scale=1;
function fit(){scale=Math.min(1,wrap.clientWidth/1440);mock.style.transform=`scale(${scale})`;wrap.style.height=(900*scale)+'px';}
addEventListener('resize',fit); fit();
// toolbar
$$('[data-theme-set]').forEach(b=>b.onclick=()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));});
$$('[data-view]').forEach(b=>b.onclick=()=>{document.body.classList.toggle('is-before',b.dataset.view==='before');$$('[data-view]').forEach(x=>x.classList.toggle('is-on',x===b));fit();});
const wtT=$('#wtToggle'); wtT.onclick=()=>{wtT.classList.toggle('is-on');mock.classList.toggle('wt',wtT.classList.contains('is-on'));};
// layers
let layer=null;
function close(){if(layer){layer.remove();layer=null;}}
function place(el,anchor,dx=0,dy=6){const a=anchor.getBoundingClientRect(),m=mock.getBoundingClientRect();el.style.left=((a.left-m.left)/scale+dx)+'px';el.style.top=((a.bottom-m.top)/scale+dy)+'px';}
function open(html,anchor,dx,dy){close();const d=document.createElement('div');d.className='layer';d.innerHTML=html;mock.appendChild(d);place(d,anchor,dx,dy);layer=d;return d;}
mock.addEventListener('mousedown',e=>{if(layer&&!layer.contains(e.target)&&!e.target.closest('[data-status-btn],[data-stage],[data-opts],[data-cmd]'))close();});
addEventListener('keydown',e=>{if(e.key==='Escape')close();if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCmd();}});
// toast
let tt;function toast(msg,undo){$('.toastwrap')?.remove();const w=document.createElement('div');w.className='toastwrap';w.innerHTML=`<div class="px-toast">${msg}${undo?'<button class="px-toast__act">Undo</button>':''}</div>`;mock.appendChild(w);if(undo)w.querySelector('button').onclick=()=>{undo();w.remove();};clearTimeout(tt);tt=setTimeout(()=>w.remove(),5000);}
// status
let cur={k:'hold',sub:''};
function setStatus(k,sub,quiet){const prev={...cur};cur={k,sub:sub||''};const s=ST.find(x=>x.k===k);const btn=$('[data-status-btn]');
  btn.innerHTML=SI[k]+`<span data-status-name>${s.name}</span>`+(sub?`<span class="px-status__sub">· ${sub}</span>`:'')+'<svg class="px-ico px-chev" viewBox="0 0 24 24"><path d="M6.5 9.5L12 15l5.5-5.5"/></svg>';
  btn.parentElement.classList.toggle('px-live',k==='working');close();
  if(!quiet)toast(SI[k]+`Status set to ${s.name}${sub?' · '+sub:''}`,()=>setStatus(prev.k,prev.sub,true));}
function statusMenu(anchor){
  const rows=ST.map(s=>`<button class="px-menu__item${s.k===cur.k?' is-on':''}" data-k="${s.k}">${SI[s.k]}<span>${s.name}</span><span class="px-kbd">${s.key}</span>${s.subs.length?'<svg class="px-ico px-smenu__more" viewBox="0 0 24 24"><path d="M9.5 6.5L15 12l-5.5 5.5"/></svg>':'<span style="width:16px"></span>'}</button>`+(['hold','customer','released'].includes(s.k)?'<div class="px-menu__sep"></div>':'')).join('');
  const d=open(`<div class="px-smenu" data-n="10"><div class="px-pop"><div class="px-menu__search"><svg class="px-ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input placeholder="Set status…" style="all:unset;flex:1;min-width:0;color:var(--ink)"><span class="px-kbd">S</span></div>${rows}</div><div class="px-pop px-sub" hidden></div></div>`,anchor,0,6);
  const sub=d.querySelector('.px-sub'), inp=d.querySelector('input'); inp.focus();
  inp.oninput=()=>{const q=inp.value.toLowerCase();$$('.px-menu__item',d.querySelector('.px-pop')).forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(q));};
  inp.onkeydown=e=>{const s=ST.find(x=>x.key===e.key);if(s&&!inp.value){e.preventDefault();setStatus(s.k,'');}};
  $$('.px-menu__item[data-k]',d).forEach(b=>{const s=ST.find(x=>x.k===b.dataset.k);
    b.onmouseenter=()=>{$$('.px-menu__item',d).forEach(x=>x.classList.remove('is-hover'));b.classList.add('is-hover');
      if(s.subs.length){sub.hidden=false;sub.style.marginTop=(b.offsetTop-36)+'px';sub.innerHTML=`<div class="px-menu__group">${s.desc}</div>`+s.subs.map(r=>`<button class="px-menu__item" data-r="${r}">${r}</button>`).join('');
        $$('[data-r]',sub).forEach(r=>r.onclick=()=>setStatus(s.k,r.dataset.r));} else sub.hidden=true;};
    b.onclick=()=>setStatus(s.k,s.subs.length&&s.k!=='working'?'':(s.k==='working'?'Repairing':''));});
}
$('[data-status-btn]').onclick=e=>{layer&&layer.querySelector('.px-smenu')?close():statusMenu(e.currentTarget);};
addEventListener('keydown',e=>{if(e.key==='s'&&!e.target.closest('input,textarea')&&!layer){e.preventDefault();statusMenu($('[data-status-btn]'));}});
// stages
$$('[data-stage]').forEach(b=>b.onclick=()=>{const p=POP[b.dataset.stage];
  const d=open(`<div class="px-pop px-stagepop"><h4>${p[0]}</h4><p>${p[1]}</p>${p[2].map(c=>`<label class="px-check${c[1]?' is-on':''}"><i></i><span>${c[0]}</span></label>`).join('')}</div>`,b,0,4);
  $$('.px-check',d).forEach(c=>c.onclick=()=>c.classList.toggle('is-on'));});
// options + command
$('[data-opts]').onclick=e=>{const d=open(__OPTS__,e.currentTarget,-212,6);};
function openCmd(){close();const s=document.createElement('div');s.className='scrim';s.innerHTML=__CMD__;mock.appendChild(s);layer=s;s.onclick=ev=>{if(ev.target===s)close();};}
$('[data-cmd]').onclick=openCmd;
// operations
let sel=1;
$$('.px-row[data-op]').forEach(r=>r.onclick=e=>{const n=+r.dataset.op;
  sel=n;$$('.px-row[data-op]').forEach(x=>x.classList.toggle('is-on',x===r));$$('[data-body]').forEach(b=>b.hidden=+b.dataset.body!==n);});
// tabs
$$('[data-body]').forEach(body=>$$('[data-tab]',body).forEach(t=>t.onclick=()=>{$$('[data-tab]',body).forEach(x=>x.classList.toggle('is-on',x===t));$$('[data-pane]',body).forEach(p=>p.hidden=p.dataset.pane!==t.dataset.tab);}));
// clock
const Q={1:8,2:2.4,3:1.5}, BASE={1:22557,2:0,3:0}; let run=null, startedAt=0;
function fmt(s){const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h+':'+String(m).padStart(2,'0')+':'+String(x).padStart(2,'0');}
function paint(n,secs){const b=$(`[data-body="${n}"]`);$('[data-clock]',b).textContent=fmt(secs);const h=secs/3600,q=Q[n];
  $('[data-burnt]',b).textContent=h.toFixed(2);$('[data-left]',b).textContent=Math.max(0,q-h).toFixed(2);$('[data-eff]',b).textContent=h>0?Math.round(q/h*100):'—';
  $('[data-bar]',b).style.width=Math.min(100,h/q*100)+'%';const row=$(`.px-row[data-op="${n}"] .px-row__time`);row.innerHTML=`${h.toFixed(2)} <em>/ ${q.toFixed(2)} h</em>`;$(`.px-row[data-op="${n}"] .px-mini i`).style.width=Math.min(100,h/q*100)+'%';}
const PLAY='<svg class="px-ico" viewBox="0 0 24 24"><path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.2-6.4a.8.8 0 0 0 0-1.4L9.2 4.9A.8.8 0 0 0 8 5.6z"/></svg>', STOP='<svg class="px-ico" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2.75"/></svg>';
$$('[data-go]').forEach(g=>g.onclick=()=>{const body=g.closest('[data-body]'),n=+body.dataset.body,card=g.closest('.px-time'),row=$(`.px-row[data-op="${n}"]`);
  if(run&&run.n===n){clearInterval(run.t);BASE[n]+=Math.floor((Date.now()-startedAt)/1000);run=null;card.classList.remove('is-live');g.innerHTML=PLAY;$('[data-clock-cap]',body).textContent='On this operation · clock stopped';
    row.querySelector('.px-si').outerHTML=SI.hold;setStatus('hold','',true);toast(SI.hold+`Clock stopped · operation ${n}`);return;}
  if(run){$(`[data-body="${run.n}"] [data-go]`).click();}
  startedAt=Date.now();card.classList.add('is-live');g.innerHTML=STOP;$('[data-clock-cap]',body).textContent='Clock running · Repairing';
  row.querySelector('.px-si').outerHTML=SI.working;setStatus('working','Repairing',true);toast(SI.working+`Clock started · operation ${n}`);
  run={n,t:setInterval(()=>paint(n,BASE[n]+Math.floor((Date.now()-startedAt)/1000)),1000)};});
'''
JS = (JS.replace("__ST__", json.dumps(ST)).replace("__SI__", json.dumps(SI)).replace("__POP__", json.dumps(STAGEPOP))
        .replace("__OPTS__", json.dumps(P.options_menu())).replace("__CMD__", json.dumps(P.cmd_menu())))

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
<script>{JS}
const wl=document.getElementById('wtToggle');wl.addEventListener('click',()=>wl.querySelector('.px-toggle').classList.toggle('is-on',wl.classList.contains('is-on')));
</script>
</body>
</html>'''
open(OUT, "w").write(html)
print("wrote", OUT, len(html)//1024, "KB")
