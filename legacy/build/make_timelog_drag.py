# Time Log idea 1 — drag a block's edge on the timeline to change a punch's time. Built on the 7-recommendations mock-up.
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(B, "make_timelog7.py")
OUT = sys.argv[1]
src7 = open(SRC, encoding="utf-8").read()
g = {"__name__": "tldrag", "__file__": SRC}
exec(src7.split("\nused = set(")[0], g)
CSS, JS, IC, P, tok, bun, tg = g["CSS"], g["JS"], g["IC"], g["P"], g["tok"], g["bun"], g["tg"]

def rep(a, b, n=1):
    global JS
    c = JS.count(a); assert c == n, (a[:90], c); JS = JS.replace(a, b)

# ---------- state ----------
rep("fixed:{},role:'tech',note:null};", "fixed:{},role:'tech',note:null,hov:null,drag:null,snap:1,kh:false,ab:null};")

# ---------- the axis holds still while you drag ----------
rep("  const a=Math.min(390,Math.floor((c.first-20)/60)*60), b=Math.max(1020,",
    "  let a=Math.min(390,Math.floor((c.first-20)/60)*60), b=Math.max(1020,")
rep("  const pct=c.clocked?Math.round(c.job/c.clocked*100):0;",
    "  if(U.drag&&U.ab){ a=U.ab[0]; b=U.ab[1]; } else U.ab=[a,b];\n  const pct=c.clocked?Math.round(c.job/c.clocked*100):0;")

# ---------- handles on every punch; the dragged one, its ghost, the time bubble, the guide ----------
rep("${sel?' sel':''}${over.has(p.id)&&opts.live?' prob':''}\"",
    "${sel?' sel':''}${opts.live&&U.hov===p.id?' hov':''}${opts.live&&U.drag&&U.drag.pid===p.id?' drg':''}${over.has(p.id)&&opts.live?' prob':''}\"")
rep("${lbl}${sel&&p.e!=null?'<i class=\"h l\"></i><i class=\"h r\"></i>':''}</span>`; });",
    "${lbl}${opts.live?`<i class=\"h l${U.drag&&U.drag.pid===p.id&&U.drag.edge==='s'?' on':''}\" data-h=\"s\" data-p=\"${p.id}\" title=\"Drag to change the start\"></i>${p.e!=null?`<i class=\"h r${U.drag&&U.drag.pid===p.id&&U.drag.edge==='e'?' on':''}\" data-h=\"e\" data-p=\"${p.id}\" title=\"Drag to change the stop\"></i>`:''}`:''}</span>`; });\n"
    "  if(opts.live) h+=dragLayer(c,a,b);")
JS = JS.replace("function axis(a,b,step){", r"""function dragLayer(c,a,b){
  let h='';
  const dg=U.drag; if(dg){ const p0=c.ps.find(x=>x.id===dg.pid); if(p0){ const oe=dg.orig.e==null?NOW:dg.orig.e;
    h+=`<span class="tk-gh" style="left:${pos(dg.orig.s,a,b)};width:${wid(dg.orig.s,Math.min(oe,b),a,b)}"></span>`;
    const t=dg.edge==='e'?p0.e2:p0.s, delta=t-(dg.edge==='e'?oe:dg.orig.s), hit=dg.hit;
    if(hit&&hit.k!=='min') h+=`<span class="tk-guide${hit.k==='meet'?' meet':' stop'}" style="left:${pos(t,a,b)}"></span>`;
    const why=!hit?'':hit.k==='meet'?`meets ${hit.p.ro==='SHOP'?'shop time':hit.p.ro}`:hit.k==='in'?`clocked in ${hm(hit.t)} — can’t start earlier`:hit.k==='out'?`${hit.why==='Lunch'?'out to lunch':'clocked out'} ${hm(hit.t)} — can’t run later`:hit.k==='now'?'that’s now':'5 min is the shortest punch';
    h+=`<span class="tk-bub${hit?(hit.k==='meet'?' meet':' stop'):''}" style="left:${pos(t,a,b)}"><b>${dg.edge==='e'?'Stop':'Start'} ${hm(t)}</b><small>${dur(p0.e2-p0.s)} long · ${delta===0?'no change':Math.abs(delta)+' min '+(delta>0?'later':'earlier')}</small>${why?`<em>${why}</em>`:''}</span>`; } }
  if(U.hov){ const ph=c.ps.find(x=>x.id===U.hov); if(ph) h+=`<span class="tk-bub hint" style="left:${pos(ph.e2,a,b)}"><b>⟷</b><small>Drag the edge to change the stop</small></span>`; }
  if(U.kh&&U.sel){ const pk=c.ps.find(x=>x.id===U.sel); if(pk) h+=`<span class="tk-bub kh" style="left:${pos((pk.s+pk.e2)/2,a,b)}"><small><span class="k">${kbd('Alt')}${kbd('←')}${kbd('→')}</span> moves the stop</small><small><span class="k">${kbd('Alt')}${kbd('⇧')}${kbd('←')}${kbd('→')}</span> moves the start</small></span>`; }
  return h; }
function limits(k,pid,edge){
  const c=calc(U.who,k), D=dayOf(U.who,k), p=D.p.find(x=>x.id===pid), ps=c.ps, i=ps.findIndex(x=>x.id===pid), today=k===TODAY, pe=p.e==null?NOW:p.e;
  const prev=ps.slice(0,i).filter(x=>x.e2<=p.s+1).pop()||null, next=ps.slice(i+1).find(x=>x.s>=pe-1)||null;
  const seg=c.segs.find(x=>p.s>=x[0]-1&&p.s<=x[1]+1)||c.segs[0];
  if(edge==='s'){ const lo1=seg[0], lo2=prev?prev.e2:-1e9, lo=Math.max(lo1,lo2); return {lo, hi:pe-5, loWhy:prev&&lo2>=lo1?{k:'meet',p:prev}:{k:'in',t:lo1}, hiWhy:{k:'min'}}; }
  const segEnd=seg[3]==null?(today?NOW:seg[1]):seg[3], hi2=next?next.s:1e9, hi=Math.min(segEnd,hi2);
  return {lo:p.s+5, hi, loWhy:{k:'min'}, hiWhy:next&&hi2<=segEnd?{k:'meet',p:next}:{k:seg[3]==null&&today?'now':'out',t:segEnd,why:seg[2]}};
}
function dragTo(m){ const d=U.drag, D=dayOf(U.who,U.day), p=D.p.find(x=>x.id===d.pid), L=limits(U.day,d.pid,d.edge);
  let v=Math.round(m/U.snap)*U.snap, hit=null;
  if(Math.abs(m-L.hi)<=3) v=L.hi; if(Math.abs(m-L.lo)<=3) v=L.lo;
  if(v>=L.hi){ v=L.hi; hit=L.hiWhy; } else if(v<=L.lo){ v=L.lo; hit=L.loWhy; }
  p[d.edge]=v; d.hit=hit; }
function finishDrag(){ const d=U.drag; U.drag=null; const D=dayOf(U.who,U.day), p=D&&D.p.find(x=>x.id===d.pid); if(!p){ render(); return; }
  if(p.s===d.orig.s&&p.e===d.orig.e){ UNDO.pop(); render(); return; }
  if(!p.ed) p.ed=hm(d.orig.s)+'–'+(d.orig.e==null?'now':hm(d.orig.e));
  const o=d.edge==='e'?d.orig.e:d.orig.s, n=p[d.edge];
  toast(`${p.ro==='SHOP'?'Shop time':p.ro} · ${d.edge==='e'?'stop':'start'} ${hm(o)} → ${hm(n)} · ${dur((p.e==null?NOW:p.e)-p.s)} long`); render(); }
function cancelDrag(){ const d=U.drag; if(!d) return; const D=dayOf(U.who,U.day), p=D&&D.p.find(x=>x.id===d.pid); if(p){ p.s=d.orig.s; p.e=d.orig.e; } U.drag=null; UNDO.pop(); }
let NT=0;
function nudge(edge,dv){ const D=dayOf(U.who,U.day), p=D&&D.p.find(x=>x.id===U.sel); if(!p||(edge==='e'&&p.e==null)) return; const L=limits(U.day,p.id,edge), cur=p[edge], v=Math.max(L.lo,Math.min(L.hi,cur+dv));
  if(v===cur){ toast(`The ${edge==='e'?'stop':'start'} can’t move further that way.`,false); render(); return; }
  if(Date.now()-NT>1500) snap(); NT=Date.now(); if(!p.ed) p.ed=hm(p.s)+'–'+(p.e==null?'now':hm(p.e)); p[edge]=v; U.kh=false;
  toast(`${p.ro==='SHOP'?'Shop time':p.ro} · ${edge==='e'?'stop':'start'} ${hm(v)} · ${dur((p.e==null?NOW:p.e)-p.s)} long`); render(); }
function axis(a,b,step){""", 1)

# ---------- the snap setting, where the hint was ----------
rep("<span class=\"sp\"></span><span>Drag a block’s edge to change a time</span>",
    "<span class=\"sp\"></span><span class=\"tk-snap\">Drag an edge to change a time · snap <span class=\"tg-seg3\"><button class=\"${U.snap===1?'on':''}\" data-a=\"snap\" data-v=\"1\">1 min</button><button class=\"${U.snap===5?'on':''}\" data-a=\"snap\" data-v=\"5\">5 min</button></span></span>")
rep("  else if(a==='notex'){", "  else if(a==='snap'){ U.snap=+t.dataset.v; render(); }\n  else if(a==='notex'){")

# ---------- the row says what it was ----------
rep("${p.ed?'<span class=\"tk-ed\">edited</span>':''}",
    "${p.ed?(p.ed==='added by hand'?'<span class=\"tk-ed\">added by hand</span>':`<span class=\"tk-ed\" title=\"Before the edit: ${esc(p.ed)}\">edited · was ${esc(p.ed)}</span>`):''}")

# ---------- pointer and keys ----------
rep("<div class=\"tg tk\">", "<div class=\"tg tk${U.drag&&!U.drag.frozen?' dragging':''}\">")
rep("const tip=$('.tk-tip'); if(!tip) return;", "const tip=$('.tk-tip'); if(!tip) return; if(U.drag){ tip.hidden=true; return; }")
rep("if(e.ctrlKey||e.metaKey||e.altKey) return; const stop",
    "if(U.drag&&!U.drag.frozen&&k==='Escape'){ cancelDrag(); render(); e.preventDefault(); return; }\n"
    "  if(e.altKey&&(k==='ArrowLeft'||k==='ArrowRight')&&U.sel&&U.view==='day'&&!inF){ nudge(e.shiftKey?'s':'e',k==='ArrowLeft'?-U.snap:U.snap); e.preventDefault(); return; }\n"
    "  if(e.ctrlKey||e.metaKey||e.altKey) return; const stop")
JS = JS.replace("function move(d){", r"""mock.addEventListener('pointerdown',e=>{ const h=e.target.closest('.h[data-h]');
  if(U.drag&&U.drag.frozen&&!(h&&h.dataset.p===U.drag.pid)){ cancelDrag(); if(!h){ render(); return; } }
  if(!h) return; e.preventDefault(); e.stopPropagation(); const D=dayOf(U.who,U.day), p=D&&D.p.find(x=>x.id===h.dataset.p); if(!p) return;
  if(!(U.drag&&U.drag.frozen)){ snap(); U.drag={pid:p.id,edge:h.dataset.h,orig:{s:p.s,e:p.e}}; } else U.drag.edge=h.dataset.h;
  U.drag.frozen=false; U.sel=p.id; U.hov=null; U.kh=false; U.note=null; U.pop=null; $$('[data-demo]').forEach(x=>x.classList.remove('is-on')); render(); },true);
document.addEventListener('pointermove',e=>{ if(!U.drag||U.drag.frozen) return; const tr=$('.tk-tl .tk-trk'); if(!tr||!U.ab) return; const r=tr.getBoundingClientRect();
  dragTo(U.ab[0]+(e.clientX-r.left)/r.width*(U.ab[1]-U.ab[0])); render(); });
document.addEventListener('pointerup',()=>{ if(U.drag&&!U.drag.frozen) finishDrag(); });
function move(d){""", 1)

# ---------- the notes and the demo states ----------
i = JS.index("const NOTE={"); j = JS.index("\n};\n", i) + 4
JS = JS[:i] + """const NOTE={
 1:{r:'.tk-b.hov',n:'.tk-bub.hint',at:'right',t:'Grab an edge',p:'Point at a punch and both edges show a handle — left is the start, right is the stop. A running punch only has a start.'},
 2:{r:'.tk-bub',at:'right',t:'Drag',p:'The time and length follow the pointer, a minute at a time (or 5 with Snap 5 min). The old spot stays as a dashed outline; the air and the day totals update as you go.'},
 3:{r:'.tk-bub',at:'right',t:'It meets the next job',p:'Near a neighbour the edge clicks to it — 37612 now stops at 09:20, where 37628 starts, and the air gap closes. It can’t go past, so punches never overlap.'},
 4:{r:'.tk-bub',at:'right',t:'It stays inside the clock',p:'A punch can’t start before you clocked in or run past clock out or now. The edge stops there and says why.'},
 5:{r:'.tk-r.sel .tk-ed',at:'right',t:'Let go',p:'It saves right away, with Undo in the toast. The punch is marked edited and keeps the old time — the day report shows both.'},
 6:{r:'.tk-bub.kh',at:'right',t:'Or the keyboard',p:'Select a punch, then Alt ← → moves the stop and Alt Shift ← → the start, a minute a press. Esc while dragging puts it back.'}
};
""" + JS[j:]
rep("  if(N.at==='left'&&A.l-nw-16>12){ x=A.l-nw-16; y=A.t; }", "  if(N.at==='right'&&A.r+nw+16<W-12){ x=A.r+16; y=A.t-6; } else if(N.at==='left'&&A.l-nw-16>12){ x=A.l-nw-16; y=A.t; }")
i = JS.index("const DEMO={"); j = JS.index("};", i) + 2
JS = JS[:i] + """const P1=()=>calc('MR',TODAY).ps[0].id, P3=()=>calc('MR',TODAY).ps[2].id;
function frozen(pid,edge,val){ const D=dayOf(U.who,U.day), p=D.p.find(x=>x.id===pid); render(); snap(); U.drag={pid,edge,orig:{s:p.s,e:p.e},frozen:true}; U.sel=pid; dragTo(val); }
const DEMO={
  d1:()=>{reset();U.hov=P1();U.note=1;render();},
  d2:()=>{reset();frozen(P1(),'e',520);U.note=2;render();},
  d3:()=>{reset();frozen(P1(),'e',557);U.note=3;render();},
  d4:()=>{reset();frozen(P3(),'s',709);U.note=4;render();},
  d5:()=>{reset();frozen(P1(),'e',520);finishDrag();U.sel=P1();U.note=5;render();},
  d6:()=>{reset();U.sel=calc('MR',TODAY).ps[1].id;U.kh=true;U.note=6;render();},
  try:()=>{reset();render();}
};""" + JS[j:]

CSS += r"""
/* ===== dragging an edge ===== */
.tk-b .h{top:0;bottom:0;height:auto;margin:0;width:12px;border-radius:0;background:none;opacity:0;transition:opacity .12s;z-index:2;cursor:ew-resize;}
.tk-b .h.l{left:0;} .tk-b .h.r{right:0;}
.tk-b .h::before{content:"";position:absolute;top:50%;left:4px;width:4px;height:20px;margin-top:-10px;border-radius:2px;background:var(--tk-ontxt);box-shadow:0 0 0 1px color-mix(in srgb,var(--tg-ink) 25%,transparent);transition:height .12s,margin .12s;}
.tk-b:hover .h,.tk-b.hov .h,.tk-b.sel .h,.tk-b.drg .h{opacity:1;}
.tk-b .h:hover::before,.tk-b .h.on::before{height:28px;margin-top:-14px;}
.tk-b.hov{box-shadow:0 0 0 1px var(--tg-raised),0 0 0 3px color-mix(in srgb,var(--tg-ink) 35%,transparent);z-index:2;}
.tk-b.drg{box-shadow:0 0 0 2px var(--tg-raised),0 0 0 4px var(--tg-ink);z-index:5;}
.tk.dragging,.tk.dragging *{cursor:ew-resize !important;user-select:none;}
.tk-gh{position:absolute;top:5px;bottom:5px;border-radius:4px;outline:1.5px dashed var(--tg-ink3);outline-offset:-1.5px;z-index:4;pointer-events:none;}
.tk-guide{position:absolute;top:-10px;bottom:-10px;width:0;margin-left:-1px;border-left:2px dashed var(--tg-acc);z-index:6;pointer-events:none;}
.tk-guide.stop{border-left-color:var(--tg-bad);}
.tk-bub{position:absolute;top:calc(100% + 30px);transform:translateX(-50%);z-index:8;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 10px 7px;border-radius:9px;background:var(--tg-ink);color:var(--tg-panel);white-space:nowrap;pointer-events:none;box-shadow:0 10px 24px -8px rgba(0,0,0,.4);}
.tk-bub::before{content:"";position:absolute;left:50%;bottom:100%;margin-left:-6px;border:6px solid transparent;border-bottom-color:var(--tg-ink);}
.tk-bub b{font:600 13px/16px var(--tg-mono);}
.tk-bub small{font:500 11.5px/15px var(--tg-sans);color:color-mix(in srgb,var(--tg-panel) 78%,transparent);display:flex;align-items:center;gap:6px;}
.tk-bub em{margin-top:2px;padding:1px 7px;border-radius:5px;font:600 11px/16px var(--tg-sans);font-style:normal;}
.tk-bub.meet em{background:var(--tg-acc);color:var(--tk-ontxt);}
.tk-bub.stop em{background:var(--tg-bad);color:#fff;}
.tk-bub.hint b{font-size:15px;}
.tk-bub.kh{gap:4px;align-items:flex-start;} .tk-bub.kh .k{display:inline-flex;gap:2px;min-width:92px;}
.tk-bub .tg-kbd{background:color-mix(in srgb,var(--tg-panel) 16%,transparent);color:var(--tg-panel);box-shadow:none;}
.tk-snap{display:inline-flex;align-items:center;gap:6px;}
.tk-snap .tg-seg3 button{padding:2px 8px !important;font-size:11.5px;}
.tk-ed{font-weight:500;}
"""

used = set(re.findall(r"ic\('([A-Za-z]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "clock", "exit", "coffee", "users", "calendar", "sheet"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("d1", "1 · Grab an edge"), ("d2", "2 · Drag"), ("d3", "3 · Meets the next job"), ("d4", "4 · Stops at the clock"), ("d5", "5 · Let go"), ("d6", "6 · Keyboard"), ("try", "Try it")])
about = [
 ("Grab", "Each punch shows a handle on both edges when you point at it. Left is the start, right is the stop."),
 ("Drag", "Time, length and the change follow the pointer, snapped to 1 or 5 minutes. Air and the day totals update live."),
 ("Limits", "Edges click to the next or previous punch and stop at clock in, clock out and now — with the reason shown."),
 ("Save", "Letting go saves it, with Undo. The punch is marked edited and keeps its old time."),
 ("Keys", "Alt ← → moves the stop, Alt Shift ← → the start. Esc while dragging cancels."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Time Log drag an edge</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Time Log — drag an edge to change a time</h1><div class="wt-ideas wt-demo">{demos}</div>
<span class="wt-role">View as<span class="px-seg"><button class="is-on" data-role="tech">Technician</button><button data-role="foreman">Foreman</button></span></span>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Drag an edge<small>Steps 1–6 show each moment. Try it lets you drag for real. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
