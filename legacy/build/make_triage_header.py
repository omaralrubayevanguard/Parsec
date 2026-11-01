# Triage — Header: facts as quick filters, late badge on the rail icon, search that answers "where's my truck?".
# Builds on make_triage_yard.py → xfer → contact → needs → inbox → make_triage.py.
import os, sys, json
B = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
src = open(f"{B}/make_triage_yard.py").read().split("\nrep = {")[0]
argv = sys.argv; sys.argv = [argv[0], "/dev/null"]
ns = {"__file__": f"{B}/make_triage_yard.py", "__name__": "tyd"}
exec(src, ns)
sys.argv = argv
P, tok, bun, DATA, ICO, SI = ns["P"], ns["tok"], ns["bun"], ns["DATA"], ns["ICO"], ns["SI"]
BASE = ns["JS"].rstrip()
assert BASE.endswith("render();"); BASE = BASE[: -len("render();")]

CSS = ns["CSS"] + r'''
/* ---------- facts as filters ---------- */
.tg-facts.hf{gap:2px;align-items:center}
.hf-f{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 8px;border-radius:8px;font-size:13px;color:var(--ink-3);white-space:nowrap;transition:background-color .12s,color .12s}
.hf-f b{font-weight:500;color:var(--ink-2);font-variant-numeric:tabular-nums}
.hf-f:hover{background:var(--fill);color:var(--ink-2)}
.hf-f.w,.hf-f.w b{color:var(--warn)}
.hf-f.on{background:var(--selected);color:var(--ink);box-shadow:inset 0 0 0 1px var(--border)}
.hf-f.on b{color:var(--ink)}
.hf-f.w.on,.hf-f.w.on b{color:var(--warn)}
.hf-f .x{width:12px;height:12px;margin-left:1px;color:var(--ink-3);display:none}
.hf-f.on .x{display:inline-block}
.hf-sep{color:var(--ink-4)}
.nx-filt{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 8px;border-radius:7px;background:var(--selected);box-shadow:inset 0 0 0 1px var(--border);font-size:12px;font-weight:500;color:var(--ink)}
.nx-filt .px-ico{width:11px;height:11px;color:var(--ink-3)}
.nx-filt.w{color:var(--warn)}
.yd.filtering .i2-s.occ:not(.match),.yd.filtering .i2-s.rsv:not(.match){opacity:.3}
.nx-away{display:flex;align-items:center;gap:8px;margin:0 14px 4px;padding:8px 10px;border-radius:10px;background:var(--warn-tint);font-size:12px;color:var(--ink-2)}
.nx-away > span:nth-child(2){flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nx-away .px-link{font-size:12px;flex:none}
.yd .i2-s.flash{animation:yd-ping 1s ease-out 3}
@keyframes yd-ping{0%{outline:3px solid var(--accent);outline-offset:0}100%{outline:3px solid transparent;outline-offset:9px}}
.nx-new{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:6px;background:var(--warn-tint);color:var(--warn);font-size:11px;font-weight:600;flex:none}
/* ---------- rail badge ---------- */
.tg-app{position:relative}
.tg-rail a{position:relative;cursor:pointer}
.tg-rail a:hover{color:var(--ink)}
.rl-badge{position:absolute;top:2px;right:0;min-width:16px;height:16px;padding:0 4px;box-sizing:border-box;border-radius:8px;background:var(--warn);color:var(--panel);font:700 10px/16px var(--font-sans);text-align:center;box-shadow:0 0 0 2px var(--canvas);font-variant-numeric:tabular-nums}
.rl-badge.bump{animation:rl-bump .6s cubic-bezier(.2,.8,.2,1) 2}
@keyframes rl-bump{40%{transform:scale(1.35)}}
.rl-fly{position:absolute;left:58px;z-index:40;width:280px;padding:10px 12px;border-radius:12px;background:var(--raised);box-shadow:0 0 0 1px var(--border),var(--shadow-raised);font-size:12.5px;color:var(--ink-2);display:flex;flex-direction:column;gap:6px;animation:px-up .2s cubic-bezier(.2,.8,.2,1) both}
.rl-fly::before{content:"";position:absolute;left:-5px;top:14px;width:10px;height:10px;background:var(--raised);transform:rotate(45deg);box-shadow:-1px 1px 0 var(--border)}
.rl-fly b{color:var(--ink);font-weight:600}
.rl-fly .r{display:flex;align-items:center;gap:8px}
.rl-fly .r .tg-late{flex:none}
.rl-fly .px-link{align-self:flex-start}
/* placeholder page */
.pg-ph{flex:1;padding:24px 28px;display:flex;flex-direction:column;gap:10px;overflow:hidden}
.pg-note{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:14px;background:var(--canvas);margin-bottom:10px}
.pg-note > .px-ico{width:22px;height:22px;color:var(--ink-3);flex:none}
.pg-note b{font-weight:600;font-size:14px}
.pg-note p{margin:2px 0 0;font-size:13px;color:var(--ink-3)}
.pg-note .px-btn{margin-left:auto;flex:none}
.pg-sk{height:44px;border-radius:10px;background:linear-gradient(90deg,var(--fill),transparent 70%);opacity:.7}
.pg-sk:nth-child(odd){opacity:.45}
/* ---------- search: where is it ---------- */
.sr-pop{width:520px;right:120px}
.sr-pop .it.sr-r{display:grid;grid-template-columns:10px auto minmax(0,1fr) auto auto;grid-template-rows:auto auto;column-gap:10px;row-gap:1px;height:auto;padding:7px 8px 7px 10px}
.sr-pop .sr-r .sq{grid-row:1 / span 2}
.sr-pop .sr-r .tg-ro{grid-row:1}
.sr-pop .sr-r b{grid-row:1}
.sr-pop .sr-r small{grid-column:2 / 4;font-size:11.5px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sr-pop .sr-r small mark{background:var(--accent-tint);color:inherit;border-radius:3px;padding:0 1px}
.sr-where{grid-column:4;grid-row:1 / span 2;display:flex;flex-direction:column;align-items:flex-end;gap:2px;font-size:12.5px;color:var(--ink);white-space:nowrap}
.sr-where .w1{display:inline-flex;align-items:center;gap:5px;font-weight:500}
.sr-where .w1 .px-ico{width:13px;height:13px;color:var(--ink-3)}
.sr-where .w2{font-size:11.5px;color:var(--ink-3)}
.sr-where.arr .w1{color:var(--ink-2)}
.sr-yard{grid-column:5;grid-row:1 / span 2;opacity:0}
.sr-r:hover .sr-yard,.sr-r.k .sr-yard{opacity:1}
.sr-pop .it.rel{display:flex;gap:10px;height:auto;padding:7px 10px;color:var(--ink-3);cursor:default}
.sr-pop .it.rel:hover{background:transparent}
.sr-pop .it.rel b{color:var(--ink-2)}
.sr-pop .ft{flex-wrap:wrap}
.sr-pop .ft .px-kbd{height:16px;font-size:10.5px}
.sr-pop .nores{padding:14px 10px;font-size:13px;color:var(--ink-3)}
'''

JS = BASE + r'''
/* =================== header layer =================== */
let AWAY='', FILTER=null, PAGE='triage', LASTSEEN=null, NEWLATE=new Set(), FLY=null, BUMP=false, SRI=0, FLASHT=null;
const PAGES={inbox:'Inbox',console:'Console',triage:'Triage',ros:'Repair orders',foreman:'Foreman',warranty:'Warranty',manager:'Manager',parts:'Parts',timelog:'Time log',fixes:'Fixes',career:'Career'};
function dueBack(r){const lx=lastX(r);return !!(lx&&lx.back!=null&&lx.to===r.hold[0]&&NOW>lx.back+1e-6);}
const LATE=r=>!!(r.late||(r.cat==='arr'&&etaOf(r)<NOW)||dueBack(r));
const lateSet=()=>new Set(ROS.filter(LATE).map(r=>r.no));
const FILT={apr:['awaiting approval',r=>r.cat!=='arr'&&openOps(r).length>0],rdy:['ready to release',r=>r.cat==='rdy'],late:['late',LATE]};
const match=r=>!FILTER||FILT[FILTER][1](r);

/* 1 · facts filter the list (and dim the yard) */
needsNow=(orig=>function(){const L=orig();return FILTER?L.filter(x=>match(x[0])):L;})(needsNow);
function patchHeader(){const f=$('.tg-facts');if(!f)return;const n=k=>ROS.filter(FILT[k][1]).length;
  const b=(k,txt,cnt,w)=>`<button class="hf-f${w?' w':''}${FILTER===k?' on':''}" data-filt="${k}" title="${FILTER===k?'Clear filter':'Show only these in Needs action'}"><b>${cnt}</b>${txt}${I.x.replace('px-ico','px-ico x')}</button>`;
  f.className='tg-facts hf';f.innerHTML=`<button class="hf-f" data-filt="all" title="Show everything"><b>${ROS.length}</b>on the yard</button><span class="hf-sep">·</span>${b('apr','awaiting approval',n('apr'))}<span class="hf-sep">·</span>${b('rdy','ready to release',n('rdy'))}<span class="hf-sep">·</span>${b('late','late',n('late'),true)}`;
  const inp=$('.tg-srch input');if(inp)inp.placeholder='RO, unit, customer, VIN or spot';}
function patchList(){const lh=$('.i3-lh');if(lh&&FILTER){const n=lh.querySelector('.n');const c=document.createElement('button');c.className='nx-filt'+(FILTER==='late'?' w':'');c.dataset.filtX='1';c.innerHTML=`${{apr:'Approval',rdy:'Ready',late:'Late'}[FILTER]}${I.x}`;n.after(c);}
  if(lh&&NEWLATE.size&&!FILTER){const names=[...NEWLATE].map(get).filter(Boolean).map(r=>r.cust);lh.insertAdjacentHTML('afterend',`<div class="nx-away"><span class="tg-late">${NEWLATE.size} new</span><span>${esc(names.join(', '))} turned late while you were on ${esc(AWAY)}</span><button class="px-link" data-filt="late">Show late</button></div>`);}
  const em=$('.nx-empty');if(em&&FILTER){em.innerHTML=`<div class="ring" style="background:var(--fill);color:var(--ink-3)">${I.check}</div><h3>Nothing ${FILT[FILTER][0]}</h3><p>No RO on the yard is ${FILT[FILTER][0]} right now.</p><button class="px-btn px-btn--sm" data-filt-x>Clear filter</button>`;}
  NEWLATE.forEach(no=>{const t=$(`.i3-it[data-sel="${no}"] .t`);if(t&&!t.querySelector('.nx-new'))t.querySelector('b').insertAdjacentHTML('afterend','<span class="nx-new" title="Turned late while you were on another page">New</span>');});}
function patchYard(){const yd=$('.yd');if(!yd)return;if(FILTER){yd.classList.add('filtering');$$('.yd [data-sel]').forEach(el=>{const r=get(el.dataset.sel);if(r&&match(r))el.classList.add('match');});}
  if(FLASHT){const t=$(`.yd [data-at="${FLASHT}"]`);if(t){t.classList.add('flash');}FLASHT=null;}}

/* 2 · late badge on the rail */
function patchRail(){const as=$$('.tg-rail a'),keys=['sidebar','search',...RAIL.filter(k=>k!=='|'),'gear'];as.forEach((a,i)=>{const k=keys[i];if(PAGES[k]){a.dataset.page=k;a.title=PAGES[k];a.classList.toggle('is-on',k===PAGE);}});
  const tri=$('.tg-rail a[data-page="triage"]');if(!tri)return;const n=lateSet().size;
  if(PAGE!=='triage'&&n){tri.insertAdjacentHTML('beforeend',`<span class="rl-badge${BUMP?' bump':''}">${n}</span>`);tri.title=`Triage · ${n} late`;}
  if(FLY&&PAGE!=='triage'){const app=$('.tg-app');const nw=FLY.nos.map(get).filter(Boolean);app.insertAdjacentHTML('beforeend',`<div class="rl-fly" style="top:${tri.offsetTop-4}px">${nw.map(r=>`<div class="r"><span class="tg-late">Late</span><span><b>${esc(r.cust)}</b> · ${r.cat==='arr'?'arrival past its ETA':dueBack(r)?'past its back-by time':'over its stage goal'}</span></div>`).join('')}<button class="px-link" data-page="triage">Open Triage →</button></div>`);}}
function patchPage(){const p=$('.tg-panel');if(!p||PAGE==='triage')return;const n=lateSet().size;
  p.innerHTML=`<header class="tg-head"><h1>${PAGES[PAGE]}</h1><span class="tg-facts" style="color:var(--ink-4)">Another page — a stand-in for this mock-up</span></header><div class="pg-ph"><div class="pg-note">${I.triage}<div><b>Triage keeps watch while you’re here.</b><p>The badge on its icon counts late ROs (${n} now). Press +30 min on the shop clock to see a new one turn late.</p></div><button class="px-btn px-btn--sm" data-page="triage">Back to Triage</button></div>${'<div class="pg-sk"></div>'.repeat(12)}</div>`;}
function goPage(k){if(k===PAGE)return;if(PAGE==='triage'&&k!=='triage'){LASTSEEN=lateSet();NEWLATE=new Set();}if(k==='triage')AWAY=PAGES[PAGE];if(k==='triage'&&LASTSEEN){NEWLATE=new Set([...lateSet()].filter(n=>!LASTSEEN.has(n)));LASTSEEN=null;}PAGE=k;FLY=null;POP=null;SRCH=false;render();}
tick=(orig=>function(h){const before=lateSet();orig(h);const nw=[...lateSet()].filter(n=>!before.has(n));if(nw.length&&PAGE!=='triage'){BUMP=true;FLY={nos:nw};render();BUMP=false;clearTimeout(window.__fly);window.__fly=setTimeout(()=>{FLY=null;render();},7000);}})(tick);

/* 3 · search answers “where is it?” */
const VIN=r=>'4V4NC9EH'+String((+r.no*7919)%1000000).padStart(6,'0');
function srFind(q){q=q.trim().toLowerCase().replace(/^(where('?s| is)?|unit|ro|truck|vin)\s+/,'').trim();if(!q)return {q,L:[],R:[]};
  const sc=r=>{const sp=r.spot.toLowerCase();if(sp===q)return 100;if(r.unit.toLowerCase()===q)return 90;if(r.no.startsWith(q))return 80;if(VIN(r).toLowerCase().endsWith(q)&&q.length>=4)return 75;if(r.cust.toLowerCase().split(' ').some(w=>w.startsWith(q)))return 60;if(r.cust.toLowerCase().includes(q))return 40;if(r.unit.toLowerCase().includes(q))return 30;return 0;};
  const L=ROS.map(r=>[r,sc(r)]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>x[0]);
  const R=D.rel.filter(x=>x.no.startsWith(q)||x.cust.toLowerCase().includes(q));return {q,L,R};}
function srRow(r,i,q){const arr=r.cat==='arr',vm=q.length>=4&&VIN(r).toLowerCase().endsWith(q),um=r.unit.toLowerCase()===q;
  const wh=arr?`<span class="sr-where arr"><span class="w1">${I.inArrow}Arriving ~${fmt(etaOf(r))}</span><span class="w2">held ${ZONE(r.spot)} ${r.spot}</span></span>`:`<span class="sr-where"><span class="w1">${I.pin}${ZONE(r.spot)} <span class="px-id">${r.spot}</span></span><span class="w2">Key tag <span class="px-id">1${r.no.slice(-2)}</span></span></span>`;
  return `<div class="it sr-r${i===SRI?' k':''}" data-sel="${r.no}" data-pick>${sq(r.cat)}<span class="tg-ro">${r.no}</span><b>${esc(r.cust)}</b><small>${um?`<mark>Unit ${esc(r.unit)}</mark>`:`Unit ${esc(r.unit)}`} · ${vm?`VIN …<mark>${VIN(r).slice(-6)}</mark>`:`${CAT[r.cat][0]}`}</small>${wh}<button class="px-btn px-btn--icon px-btn--ghost px-btn--sm sr-yard" data-yard="${r.no}" title="Show on the yard  ⇧↵">${I.pin}</button></div>`;}
function srPop(){const raw=($('.tg-srch input')||{}).value||'';const {q,L,R}=srFind(raw);
  const ft=`<div class="ft"><span><span class="px-kbd">↑</span><span class="px-kbd">↓</span> move</span><span><span class="px-kbd">↵</span> open</span><span><span class="px-kbd">⇧</span><span class="px-kbd">↵</span> show on the yard</span><span><span class="px-kbd">Esc</span> close</span></div>`;
  if(!q){const nx=ROS.filter(r=>r.cat==='arr').sort((a,b)=>etaOf(a)-etaOf(b)).slice(0,2),rc=flat().slice(0,4).map(get);let i=0;return `<div class="h">Recent</div>${rc.map(r=>srRow(r,i++,'')).join('')}${nx.length?`<div class="h">Arriving next</div>${nx.map(r=>srRow(r,i++,'')).join('')}`:''}${ft}`;}
  if(!L.length&&!R.length)return `<div class="nores">No RO, unit, customer, VIN or spot matches “${esc(raw)}”.</div>${ft}`;
  return `${L.length?`<div class="h">${L.length} on the yard</div>`:''}${L.map((r,i)=>srRow(r,i,q)).join('')}${R.length?`<div class="h">Released today</div>${R.map(x=>`<div class="it rel"><span class="tg-ro">${x.no}</span><b>${esc(x.cust)}</b><span style="margin-left:auto">Released ${esc(x.at)}</span></div>`).join('')}`:''}${ft}`;}
function showOnYard(no){const r=get(no);if(!r)return;SEL=no;SRCH=false;QV='';TAB='yard';MOVE=false;FLASHT=r.spot;render();}

/* ---------- wiring ---------- */
render=(orig=>function(){orig();patchHeader();patchRail();patchList();patchYard();patchPage();})(render);
reset=(orig=>function(){FILTER=null;PAGE='triage';LASTSEEN=null;NEWLATE=new Set();AWAY='';FLY=null;SRI=0;SRCH=false;QV='';orig();})(reset);
$('[data-reset]').onclick=()=>reset();
demo=function(k){reset();DEMO=k;KB=false;
  if(k==='flate'){FILTER='late';TAB='inbox';SEL='37590';}
  if(k==='fapr'){FILTER='apr';TAB='yard';SEL='37590';}
  if(k==='badge'){TAB='inbox';render();goPage('ros');return;}
  if(k==='search'){TAB='inbox';SRCH=true;QV='1204';SRI=0;}
  render();if(k==='search'){$('.sr-pop').innerHTML=srPop();}};
$$('[data-demo]').forEach(b=>b.onclick=()=>demo(b.dataset.demo));
mock.addEventListener('click',e=>{const t=e.target,q=s=>t.closest(s),stop=()=>{e.stopPropagation();e.preventDefault();};
  const pg=q('[data-page]');if(pg&&(q('.tg-rail')||q('.pg-note')||q('.rl-fly'))){goPage(pg.dataset.page);return stop();}
  if(PAGE!=='triage'){e.stopPropagation();return;}
  const f=q('[data-filt]');if(f){const k=f.dataset.filt;FILTER=k==='all'||FILTER===k?null:k;POP=null;const L=flat();if(L.length&&!L.includes(SEL))SEL=L[0];render();return stop();}
  if(q('[data-filt-x]')){FILTER=null;render();return stop();}
  const y=q('[data-yard]');if(y){showOnYard(y.dataset.yard);return stop();}
  const it=q('.i3-it[data-sel]');if(it&&NEWLATE.has(it.dataset.sel)){NEWLATE.delete(it.dataset.sel);}
},true);
mock.addEventListener('input',e=>{if(e.target.matches('.tg-srch input')){SRI=0;$('.sr-pop').innerHTML=srPop();}});
addEventListener('keydown',e=>{const k=e.key;
  if(PAGE!=='triage'){if(k==='Escape'||k==='/'||k.length===1||k==='Enter'||k.startsWith('Arrow'))e.stopPropagation();return;}
  if(SRCH){const rows=$$('.sr-pop .sr-r');
    if(k==='ArrowDown'||k==='ArrowUp'){e.preventDefault();if(rows.length){SRI=(SRI+(k==='ArrowDown'?1:-1)+rows.length)%rows.length;rows.forEach((el,i)=>el.classList.toggle('k',i===SRI));}e.stopPropagation();return;}
    if(k==='Enter'){e.preventDefault();const el=rows[SRI]||rows[0];if(el){const no=el.dataset.sel;if(e.shiftKey)showOnYard(no);else{SEL=no;SRCH=false;QV='';render();}}e.stopPropagation();return;}
    return;}
  if(k==='Escape'&&FILTER&&!POP&&!MOVE&&!CLASH&&!HELP){FILTER=null;render();e.stopPropagation();}
},true);
render();
'''
rep = {"__DATA__": DATA, "__ICO__": ICO, "__SI__": SI, "__LOGO__": P.LOGO}
for k, v in rep.items(): JS = JS.replace(k, json.dumps(v))
NOTES = [
 ("1 · Facts are filters", "Click “4 late”, “4 awaiting approval” or “3 ready to release” to narrow Needs action — and dim everything else on the Yard. Click it again, the chip in the list, or Esc to clear. “17 on the yard” shows everything. No tabs."),
 ("2 · Late badge on the rail", "On any other page, the Triage icon shows how many ROs are late. When one turns late while you’re away, the badge pulses and a note says which. Back on Triage, those ROs carry a New tag until you open them."),
 ("3 · Search is “where’s my truck?”", "Search by RO, unit, customer, the last digits of the VIN, or a spot (“B2”). Each result shows where it is: zone, spot and key tag — or the ETA for an arrival. ⇧↵ or the pin jumps to the Yard with that spot lit. Released trucks show when they left."),
 ("In Parsec", "Late uses the app’s own late rules (tyLate) plus overdue arrivals and missed back-by times. The badge is the same count as the late fact. Search reads the same RO, unit, VIN and location fields the old “Where’s my truck?” used."),
]
about = '<h2>Header<small>Use the buttons above the frame. For the badge, open another page, then press +30 min twice.</small></h2><ul>' + "".join(f"<li><b>{a}</b>{b}</li>" for a, b in NOTES) + "</ul>"
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("flate", "1 · Filter: late"), ("fapr", "1 · Filter on the Yard"), ("badge", "2 · Rail badge"), ("search", "3 · Search “1204”")])
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Triage header</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Triage — Header</h1><div class="wt-ideas wt-demo">{demos}</div>
<div class="wt-clock">Shop clock <b data-clock>10:15</b><button class="px-btn px-btn--sm" data-tt="0.5">+30 min</button><button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button></div><button data-caught hidden></button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about">{about}</div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
