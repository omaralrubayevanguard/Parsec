# Time Log mock-up — the overhaul with the 7 recommendations built in and spotlighted, one button each.
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(B, "make_timelog.py")
OUT = sys.argv[1]
base = open(SRC, encoding="utf-8").read()
g = {"__name__": "tl7", "__file__": SRC}
exec(base.split("\nused = set(")[0], g)
CSS, JS, IC, P, tok, bun, tg = g["CSS"], g["JS"], g["IC"], g["P"], g["tok"], g["bun"], g["tg"]

def rep(a, b, n=1):
    global JS
    c = JS.count(a); assert c == n, (a[:90], c); JS = JS.replace(a, b)

# ---------- state: who is looking (a tech, or the foreman), and which note is up ----------
rep("U={view:'day',who:'MR',day:TODAY,sel:null,pop:null,kb:false,open:{},fixed:{}}; UNDO=[]; TOAST=null; }",
    "U={view:'day',who:'MR',day:TODAY,sel:null,pop:null,kb:false,open:{},fixed:{},role:'tech',note:null}; UNDO=[]; TOAST=null; syncRole(); }\n"
    "function syncRole(){ $$('[data-role]').forEach(x=>x.classList.toggle('is-on',x.dataset.role===U.role)); }\n"
    "function setRole(r){ U.role=r; if(r==='tech'){ U.who='MR'; if(U.view==='shop') U.view='day'; } syncRole(); }\n"
    "const nfx=t=>DAYS.filter(k=>{ const c=calc(t,k); return c&&c.fixes.length&&!U.fixed[t+k]; }).length;")

# ---------- 1 · one log per person: a tech gets no picker and no Shop tab ----------
rep("  const vs=[['day','clock','Day'],['week','calendar','Week'],['sheet','sheet','Timesheet'],['shop','users','Shop']];",
    "  const vs=[['day','clock','Day'],['week','calendar','Week'],['sheet','sheet','Timesheet'],['shop','users','Shop']].filter(x=>U.role!=='tech'||x[0]!=='shop');")
rep("`<span class=\"tk-av\">${U.who}</span>${U.who==='MR'?'You · ':''}${esc(TECH[U.who])}`;",
    "`<span class=\"tk-av\">${U.who}</span>${U.who==='MR'&&U.role==='tech'?'You · ':''}${esc(TECH[U.who])}`;")
rep("<button class=\"tk-who\" data-a=\"pop\" data-p=\"who\">${who}${ic('chevD',14)}</button>",
    "${U.role==='tech'?`<span class=\"tk-who st\" title=\"Your own time — a technician sees only their own log\">${who}<span class=\"tk-mine\">only yours</span></span>`:`<button class=\"tk-who\" data-a=\"pop\" data-p=\"who\">${who}${ic('chevD',14)}</button>`}")
rep("${t==='MR'?'<span class=\"meta\">you</span>':''}", "")
rep("if(k>='1'&&k<='4'){ U.view=", "if(k>='1'&&k<='4'){ if(k==='4'&&U.role==='tech') return stop(); U.view=")

# ---------- 2 · a missed clock-out counts only to the last punch ----------
rep("  if(c.today&&NOW>a&&NOW<b) h+=`<span class=\"tk-now\"",
    "  if(opts.live&&c.open&&!c.today&&c.ps.length){ const ls=Math.max(...c.ps.map(p=>p.e2)); h+=`<span class=\"tk-ghost\" data-tip=\"Not counted · after ${hm(ls)}|The day counts to the last punch until the clock out is fixed\" style=\"left:${pos(ls,a,b)};width:${wid(ls,b,a,b)}\"><em>not counted</em></span>`; }\n"
    "  if(opts.live) c.fixes.forEach(f=>{ if(f.k==='over') h+=`<span class=\"tk-ovl\" data-tip=\"Counted twice · ${hm(f.from)}–${hm(f.to)}|${f.to-f.from} min on two punches at once\" style=\"left:${pos(f.from,a,b)};width:${wid(f.from,f.to,a,b)}\"><em>${f.to-f.from} min twice</em></span>`; });\n"
    "  if(c.today&&NOW>a&&NOW<b) h+=`<span class=\"tk-now\"")
rep("stat('Clocked',dur(c.clocked),c.open&&!c.today?'open':'')", "stat('Clocked',dur(c.clocked),c.open&&!c.today?'to the last punch':'')")

# ---------- 3 · fixed where it shows: both overlapping punches carry a Trim button ----------
rep("const over=new Set(); c.fixes.forEach(f=>{ if(f.k==='over'){ over.add(f.a); over.add(f.b); } });",
    "const over=new Set(), overO={}; c.fixes.forEach(f=>{ if(f.k==='over'){ over.add(f.a); over.add(f.b); overO[f.a]=0; overO[f.b]=1; } });", 2)
rep(":`<button class=\"btn btn-sm ib\" data-a=\"pop\" data-p=\"edit\" data-pid=\"${p.id}\" title=\"Edit (E)\">${ic('pencil',14)}</button>`}</span></div>`; };",
    ":(overO[p.id]!=null?`<button class=\"btn btn-sm\" data-a=\"pop\" data-p=\"fix\" data-f=\"over\" data-o=\"${overO[p.id]}\">${ic('split',13)}Trim…</button>`:'')+`<button class=\"btn btn-sm ib\" data-a=\"pop\" data-p=\"edit\" data-pid=\"${p.id}\" title=\"Edit (E)\">${ic('pencil',14)}</button>`}</span></div>`; };")
rep("if(t.dataset.f) ex.f=t.dataset.f;", "if(t.dataset.f) ex.f=t.dataset.f; if(t.dataset.o!=null) ex.o=+t.dataset.o;")

# ---------- 4 · air you can act on: the long gap is marked on the timeline too ----------
rep("h+=`<span class=\"tk-b air\" data-tip=", "h+=`<span class=\"tk-b air${opts.live&&x[1]-x[0]>=20?' long':''}\" data-tip=")

# ---------- 6 · the timesheet is the printout ----------
rep("${nfix?`<span class=\"tk-pill bad\">${ic('flag',11)}${nfix} day${nfix>1?'s':''} to fix first</span>`:''}", "")
rep("<button class=\"btn btn-sm btn-primary\" data-a=\"toast\" data-t=\"The timesheet prints — signature lines at the bottom.\">${ic('print',14)}Print</button></div>",
    "<button class=\"btn btn-sm btn-primary\" data-a=\"tsprint\">${ic('print',14)}Print</button></div>"
    "${nfix?`<div class=\"tk-tsfix\">${ic('flag',15)}<span><b>${nfix} day${nfix>1?'s':''} to fix</b> before this prints clean</span>${L.filter(k=>{ const c=calc(U.who,k); return c&&c.fixes.length&&!U.fixed[U.who+k]; }).map(k=>`<button class=\"btn btn-sm\" data-a=\"gofix\" data-k=\"${k}\">${short(k)} · ${esc(calc(U.who,k).fixes[0].t)}</button>`).join('')}</div>`:''}")
rep("<td class=\"fl\">${W.c>2400?'Overtime '+dur(W.c-2400):''}</td>", "<td class=\"fl${W.c>2400?' ot':''}\">${W.c>2400?'Overtime '+dur(W.c-2400):'No overtime'}</td>")

# ---------- 7 · the Shop view: who has days to fix ----------
rep("<span><b>${TECH[t]}</b>${now}</span></span><span class=\"tk-wt\">", "<span><b>${TECH[t]}${nfx(t)?` <span class=\"tk-pill bad\">${nfx(t)} to fix</span>`:''}</b>${now}</span></span><span class=\"tk-wt\">")

# ---------- the spotlight notes ----------
rep("<div class=\"tk-tip\" hidden></div></div>", "<div class=\"tk-tip\" hidden></div><div class=\"tk-ring\" hidden></div><div class=\"tk-note\" hidden></div></div>")
rep("if(U.pop&&!e.target.closest('.tg-pop,[data-a=\"pop\"]')){", "if(U.pop&&!e.target.closest('.tg-pop,[data-a=\"pop\"],.tk-note')){")
rep("  else if(a==='undo'){",
    "  else if(a==='notex'){ U.note=null; render(); $$('[data-demo]').forEach(x=>x.classList.remove('is-on')); }\n"
    "  else if(a==='gofix'){ U.view='day'; U.day=t.dataset.k; U.note=null; U.pop=null; render(); const b=$('.tk-fix [data-a=\"pop\"][data-p=\"fix\"]'); if(b) openPop('fix',{f:b.dataset.f},b); }\n"
    "  else if(a==='tsprint'){ const n=['2026-10-19','2026-10-21'].filter(k=>{ const c=calc(U.who,k); return c&&c.fixes.length; }).length; toast(n?`${n} day${n>1?'s':''} still need fixing — they print marked. Fix them first for a clean sheet.`:'The timesheet prints — signature lines at the bottom.',false); render(); }\n"
    "  else if(a==='undo'){")
rep("  const f=$('.tg-pop #tk-s'); if(f&&U.pop&&!U.pop._f){ U.pop._f=1; f.focus(); f.select(); }\n}",
    "  const f=$('.tg-pop #tk-s'); if(f&&U.pop&&!U.pop._f){ U.pop._f=1; f.focus(); f.select(); }\n  note();\n}\n"
    "const NOTE={\n"
    " 1:{r:'.tk-who',t:'One log per person',p:'A tech sees only their own time — no picker, no Shop tab. Today the page adds every tech together: one day showed 23 h on jobs in an 8-hour day. Switch View as to Foreman to pick anyone.'},\n"
    " 2:{r:'.tk-ghost',n:'.tk-fix',al:'right',t:'A missed clock-out',p:'Counts only to the last punch, 15:24, until it’s fixed — 8:24 for the day, not 17 hours. Fix… offers 15:24, 15:30 or a time you type.'},\n"
    " 3:{r:'.tk-ovl',n:'.tk-fix',al:'right',t:'Fixed where it shows',p:'The overlap is marked on the timeline and on both punches. Trim… picks which punch gives up the 7 minutes; both get marked edited.'},\n"
    " 4:{r:['.tg-pop','.tk-fix.warn'],at:'left',t:'Air you can act on',p:'A gap of 20 minutes or more asks: fill it with a job or shop time, or keep it. Short gaps stay quiet.'},\n"
    " 5:{u:['.tg-head [data-p=\"add\"]','.tg-head [data-p=\"exp\"]'],n:['.tg-pop','.tg-head [data-p=\"exp\"]'],at:'left',t:'Two buttons',p:'Add, and Print / export. Import CSV and Backup move to Settings → Data — they aren’t day-to-day.'},\n"
    " 6:{r:'.tk-tsfix',t:'The timesheet is the printout',p:'Pay period, overtime past 40 h a week, signature lines — and the days that need fixing are listed before it prints.'},\n"
    " 7:{r:'.tk-sh .tk-wg',t:'Shop view',p:'Replaces the end-of-day pop-up: who’s on a job, who’s idle, who’s out, live — and it still prints.'}\n"
    "};\n"
    "function box(sels){ const L=[].concat(sels).map(s=>$(s)).filter(Boolean); if(!L.length) return null; const tk=$('.tk').getBoundingClientRect(); let l=1e9,t=1e9,r=-1e9,b=-1e9;\n"
    "  L.forEach(e=>{ const x=e.getBoundingClientRect(); l=Math.min(l,x.left); t=Math.min(t,x.top); r=Math.max(r,x.right); b=Math.max(b,x.bottom); }); return {l:(l-tk.left)/scale,t:(t-tk.top)/scale,r:(r-tk.left)/scale,b:(b-tk.top)/scale}; }\n"
    "const pick=s=>Array.isArray(s)?s.find(x=>$(x)):s;\n"
    "function note(){ const nt=$('.tk-note'), rg=$('.tk-ring'), tk=$('.tk'); if(!nt||!rg||!tk) return; const N=U.note&&NOTE[U.note]; const R=N?(N.u?box(N.u):box(pick(N.r))):null;\n"
    "  if(!R){ nt.hidden=true; rg.hidden=true; return; }\n"
    "  rg.hidden=false; Object.assign(rg.style,{left:(R.l-5)+'px',top:(R.t-5)+'px',width:(R.r-R.l+10)+'px',height:(R.b-R.t+10)+'px'});\n"
    "  nt.innerHTML=`<div class=\"h\"><span class=\"n\">${U.note}</span><b>${esc(N.t)}</b><button data-a=\"notex\" title=\"Close\">${ic('x',13)}</button></div><p>${esc(N.p)}</p>`; nt.hidden=false;\n"
    "  const A=N.n?box(pick(N.n)):R, W=tk.offsetWidth, H=tk.offsetHeight, nw=nt.offsetWidth, nh=nt.offsetHeight; let x, y;\n"
    "  if(N.at==='left'&&A.l-nw-16>12){ x=A.l-nw-16; y=A.t; } else { x=N.al==='right'?A.r-nw:A.l; y=A.b+12; if(y+nh>H-12) y=A.t-nh-16; }\n"
    "  nt.style.left=Math.round(Math.max(12,Math.min(x,W-nw-12)))+'px'; nt.style.top=Math.round(Math.max(12,Math.min(y,H-nh-12)))+'px'; }")

# ---------- the demo buttons and the View as switch ----------
i = JS.index("const DEMO={"); j = JS.index("};", i) + 2
JS = JS[:i] + """const DEMO={
  r1:()=>{reset();setRole('tech');U.note=1;render();},
  r2:()=>{reset();setRole('tech');U.day='2026-10-19';U.note=2;render();},
  r3:()=>{reset();setRole('tech');U.day='2026-10-21';U.note=3;render();},
  r4:()=>{reset();setRole('tech');U.note=4;render();const b=$('.tk-fix.warn [data-a="pop"]');openPop('air',{from:+b.dataset.from,to:+b.dataset.to,ro:'37612'},b);},
  r5:()=>{reset();setRole('tech');U.note=5;render();const b=$('[data-a="pop"][data-p="exp"]');openPop('exp',{},b);},
  r6:()=>{reset();setRole('tech');U.view='sheet';U.note=6;render();},
  r7:()=>{reset();setRole('foreman');U.view='shop';U.who='ALL';U.note=7;render();}
};
$$('[data-role]').forEach(b=>b.addEventListener('click',()=>{ setRole(b.dataset.role); U.pop=null; render(); }));""" + JS[j:]

CSS += r"""
/* ===== the 7 recommendations ===== */
.tk-who.st{cursor:default;padding-right:10px !important;} .tk-who.st:hover{background:none;}
.tk-mine{font-size:11.5px;font-weight:400;color:var(--tg-ink3);margin-left:1px;}
.tk-ghost{position:absolute;top:5px;bottom:5px;border-radius:4px;background:repeating-linear-gradient(135deg,color-mix(in srgb,var(--tg-bad) 18%,transparent) 0 6px,transparent 6px 11px);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--tg-bad) 50%,transparent);display:flex;align-items:center;padding:0 8px;overflow:hidden;}
.tk-ghost em{font:500 11px/1 var(--tg-sans);font-style:normal;color:var(--tg-bad);white-space:nowrap;}
.tk-ovl{position:absolute;top:-3px;bottom:-3px;z-index:3;border-radius:3px;background:repeating-linear-gradient(135deg,var(--tg-bad) 0 2px,transparent 2px 5px);box-shadow:0 0 0 1.5px var(--tg-bad);}
.tk-ovl em{position:absolute;top:calc(100% + 5px);left:50%;transform:translateX(-50%);font:600 10.5px/15px var(--tg-sans);font-style:normal;color:var(--tg-bad);white-space:nowrap;background:var(--tg-raised);padding:0 5px;border-radius:4px;box-shadow:0 0 0 1px color-mix(in srgb,var(--tg-bad) 40%,transparent);}
.tk-b.air.long{box-shadow:0 0 0 1px var(--tg-raised),0 0 0 3px var(--tg-warn);z-index:1;}
.tk-r.prob .ac{opacity:1;}
.tk-sr .nm span.tk-pill{display:inline-flex;flex-direction:row;margin-left:6px;vertical-align:1px;}
.tk-tsfix{max-width:860px;margin:0 auto 14px;display:flex;align-items:center;flex-wrap:wrap;gap:8px 10px;padding:10px 12px 10px 14px;border-radius:12px;background:var(--tg-bad-t);font-size:13px;color:var(--tg-ink);}
.tk-tsfix > .tg-ic{color:var(--tg-bad);flex:none;} .tk-tsfix > span{margin-right:auto;} .tk-tsfix b{font-weight:600;}
.tk-paper td.fl.ot{color:#8c5b0b;font-weight:600;}
.tk-ring{position:absolute;z-index:38;border-radius:12px;box-shadow:0 0 0 2px var(--tg-acc),0 0 0 7px color-mix(in srgb,var(--tg-acc) 22%,transparent);pointer-events:none;}
.tk-note{position:absolute;z-index:45;width:300px;padding:11px 13px 13px;border-radius:12px;background:var(--tg-ink);color:var(--tg-panel);box-shadow:0 16px 40px -10px rgba(0,0,0,.45);font-size:12.5px;line-height:18px;}
.tk-note .h{display:flex;align-items:center;gap:8px;margin-bottom:4px;}
.tk-note .n{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:var(--tg-acc);color:var(--tk-ontxt);font:600 11px/1 var(--tg-sans);flex:none;}
.tk-note b{font-size:13px;font-weight:600;}
.tk-note p{margin:0;color:color-mix(in srgb,var(--tg-panel) 80%,transparent);}
.tk-note button{all:unset;cursor:pointer;margin-left:auto;display:inline-grid;place-items:center;width:22px;height:22px;border-radius:6px;opacity:.7;} .tk-note button:hover{opacity:1;background:rgba(128,128,128,.25);}
.wt-role{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink-3);}
"""

used = set(re.findall(r"ic\('([A-Za-z]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "clock", "exit", "coffee", "users", "calendar", "sheet"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("r1", "1 · Your own log"), ("r2", "2 · Missed clock-out"), ("r3", "3 · Fix in place"), ("r4", "4 · Air"), ("r5", "5 · Two buttons"), ("r6", "6 · Timesheet"), ("r7", "7 · Shop view")])
about = [
 ("1 · One log per person", "A tech sees only their own time. The foreman and the manager pick anyone, or the whole shop."),
 ("2 · A missed clock-out", "Counts to the last punch until it’s fixed, and the day sits under To fix."),
 ("3 · Fixed where it shows", "Marked on the timeline and on the punches, fixed in one click, marked edited."),
 ("4 · Air you can act on", "20 minutes or more asks to be filled or kept."),
 ("5 · Two buttons", "Add, and Print / export. Import CSV and Backup go to Settings → Data."),
 ("6 · The timesheet is the printout", "Overtime per week, signature lines, problem days flagged first."),
 ("7 · Shop view", "The end-of-day pop-up becomes a live page that still prints."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Time Log recommendations</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Time Log — the 7 recommendations</h1><div class="wt-ideas wt-demo">{demos}</div>
<span class="wt-role">View as<span class="px-seg"><button class="is-on" data-role="tech">Technician</button><button data-role="foreman">Foreman</button></span></span>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Time Log<small>Each button above opens the page where that change shows. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
