# Fixes mock-up v2 — by system or flat, Use fix only by button, reviewers (foreman, lead tech, Triage, manager), View as.
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(B, "make_fixes.py")
OUT = sys.argv[1]
src1 = open(SRC, encoding="utf-8").read()
g = {"__name__": "fx2", "__file__": SRC}
exec(src1.split("\nused = set(")[0], g)
CSS, JS, IC, P, tok, bun, tg = g["CSS"], g["JS"], g["IC"], g["P"], g["tok"], g["bun"], g["tg"]

def rep(a, b, n=1):
    global JS
    c = JS.count(a); assert c == n, (a[:90], c); JS = JS.replace(a, b)

# ---------- who is looking ----------
rep("const F=k=>PPL[k].split(' ')[0];", """PPL.RH='Ray Holloway';
const F=k=>PPL[k].split(' ')[0];
const ROLES={tech:['AW','Technician'],lt:['MR','Lead tech'],fm:['FD','Foreman'],tr:['AM','Triage'],mg:['RH','Manager']};
const me=()=>ROLES[U.role][0], myRole=()=>ROLES[U.role][1], isRev=()=>U.role!=='tech';
function setRole(r){ U.role=r; U.pop=null; if(r==='tech'&&U.view==='rev') U.view='lib'; $$('[data-role]').forEach(x=>x.classList.toggle('is-on',x.dataset.role===r)); }""")
rep("U={view:'lib',sel:'nox',pop:null,kb:false,sort:'count',flt:false,open:{},q:''};", "U={view:'lib',sel:'nox',pop:null,kb:false,sort:'count',grp:'sys',flt:false,open:{},q:'',role:'fm'}; $$('[data-role]').forEach(x=>x.classList.toggle('is-on',x.dataset.role==='fm'));")
rep("function render(){\n  const v=U.view,", "function render(){\n  if(U.role==='tech'&&U.view==='rev') U.view='lib';\n  const v=U.view,")

# ---------- 1 · by system, or one flat list ----------
rep("""<div class="tg-lh">Complaints<span class="n">${G0.length}</span></div><div class="fx-lh2"><span class="tg-seg3">${[['count','Most fixed'],['recent','Recent'],['az','A–Z']].map(x=>`<button class="${U.sort===x[0]?'on':''}" data-a="sort" data-v="${x[0]}">${x[1]}</button>`).join('')}</span><span class="sp"></span><button class="fx-flt${U.flt?' on':''}" data-a="flt">${ic('ros',12)}On open ROs · ${nOpen}</button></div>""",
    """<div class="tg-lh">Complaints<span class="n">${G0.length}</span><button class="fx-flt${U.flt?' on':''}" data-a="flt" style="margin-left:auto">${ic('ros',12)}On open ROs · ${nOpen}</button></div><div class="fx-lh2"><span class="tg-seg3">${[['sys','By system'],['flat','Flat']].map(x=>`<button class="${U.grp===x[0]?'on':''}" data-a="grp" data-v="${x[0]}">${x[1]}</button>`).join('')}</span><span class="sp"></span><span class="tg-seg3">${[['count','Most fixed'],['recent','Recent'],['az','A–Z']].map(x=>`<button class="${U.sort===x[0]?'on':''}" data-a="sort" data-v="${x[0]}">${x[1]}</button>`).join('')}</span></div>""")
rep("if(U.sort==='count') body=Object.keys(SYS).map(", "if(U.grp==='sys') body=Object.keys(SYS).map(")
rep("if(U.sort!=='count') return L.map(g=>g.k);", "if(U.grp!=='sys') return L.map(g=>g.k);")
rep("  else if(a==='sort'){ U.sort=t.dataset.v; render(); }", "  else if(a==='sort'){ U.sort=t.dataset.v; render(); }\n  else if(a==='grp'){ U.grp=t.dataset.v; render(); }")

# ---------- 2 · Use fix is a button — nothing fills in by itself ----------
JS = JS.replace("{no:'37628',k:'turbo',", "{no:'37628',by:'JT',k:'turbo',", 1).replace("{no:'37750',k:'ac',", "{no:'37750',by:'AM',k:'ac',", 1).replace("{no:'37466',k:'inj',", "{no:'37466',by:'FD',k:'inj',", 1)
rep("<small>${o.from?'from RO '+o.from:'quoted'}</small>", "<small>${o.from?'Use fix · '+F(o.by||o.wr):'typed by '+F(o.wr)}</small>")
rep("<small>${o.from?'from the fix':'on the RO'}</small>", "<small>${o.from?'from RO '+o.from:'on the RO'}</small>")
rep("<span><b>${S.O.filter(o=>o.from).length}</b>filled from a past fix</span>", "<span><b>${S.O.filter(o=>o.from).length}</b>set with Use fix</span>")
rep("a past fix filled in the quote and parts — or the writer did", "someone pressed Use fix — or the writer typed it in")
rep("Operations in the shop now that have been fixed before</span>", "Operations in the shop now that have been fixed before. Nothing fills in by itself — Use fix shows what changes, and you say yes.</span>")
rep("Send the parts to Parts — it asks ${F(o.wr)} first", "${me()===o.wr?'Send the parts to Parts':'Send the parts to Parts — it asks '+F(o.wr)+' first'}")
rep("o.from=s.E[0].ro;", "o.from=s.E[0].ro; o.by=me();")
rep("' (Parts is asked)'", "` (${me()===o.wr?'sent to Parts':F(o.wr)+' is asked'})`")
rep("""<div class="tg-acts"><span class="hint">${qv?h1(qv)+' h · '+usd0(qv*RATE)+' labor':'pick a quote'}""", """<div class="fx-nb">${ic('info',12)}Nothing on ${o.no} changes until you press Use fix.</div><div class="tg-acts"><span class="hint">${qv?h1(qv)+' h · '+usd0(qv*RATE)+' labor':'pick a quote'}""")
# a technician asks instead
rep("""${pO.length?`<button class="btn btn-sm btn-primary" data-a="pop" data-p="use" data-no="${o.no}">Use on ${o.no}…${kbd('U')}</button>`""",
    """${pO.length?(U.role==='tech'?`<button class="btn btn-sm" data-a="askuse" data-no="${o.no}">Ask ${F(o.wr)} to use it</button>`:`<button class="btn btn-sm btn-primary" data-a="pop" data-p="use" data-no="${o.no}">Use on ${o.no}…${kbd('U')}</button>`)""")
rep("""${pend(o)?`<button class="btn btn-sm btn-primary" data-a="pop" data-p="use" data-no="${o.no}">Use fix…</button>`""",
    """${pend(o)?(U.role==='tech'?`<button class="btn btn-sm" data-a="askuse" data-no="${o.no}">Ask ${F(o.wr)}</button>`:`<button class="btn btn-sm btn-primary" data-a="pop" data-p="use" data-no="${o.no}">Use fix…</button>`)""")
rep("""<button class="btn btn-sm tg-gh" data-a="toast" data-t="Copied — cause, correction and parts, ready to paste on the RO.">${ic('copy',13)}Copy</button>""",
    """${U.role==='tech'?`<button class="btn btn-sm tg-gh" data-a="suggest">${ic('pencil',13)}Suggest an edit</button>`:''}<button class="btn btn-sm tg-gh" data-a="toast" data-t="Copied — cause, correction and parts, ready to paste on the RO.">${ic('copy',13)}Copy</button>""")

# ---------- 3 · who reviews ----------
rep("const vs=[['lib','book','Library'],['open','ros','Open ROs'],['rev','note','Review']];", "const vs=[['lib','book','Library'],['open','ros','Open ROs'],['rev','note','Review']].filter(x=>isRev()||x[0]!=='rev');")
rep("${rv?`<button", "${rv&&isRev()?`<button")
rep("""<div class="fx-sum"><span class="${L.length?'warn':''}"><b>${L.length}</b>to look at</span>""",
    """<div class="fx-revs"><b>Who reviews</b>${[['FD','Foreman'],['MR','Lead tech'],['AM','Triage'],['JT','Triage'],['RH','Manager']].map(x=>`<span class="${x[0]===me()?'me':''}"><span class="tg-av">${x[0]}</span>${F(x[0])} · ${x[1]}${x[0]===me()?' · you':''}</span>`).join('')}<em>any of them can clear an item — it shows who did</em></div><div class="fx-sum"><span class="${L.length?'warn':''}"><b>${L.length}</b>to look at</span>""")
rep("const G={short:['Correction just says “'+'replaced'+'”','note'],cause:['No cause written','note'],code:['No fault code','note'],dup:['Looks like an existing complaint','merge']};",
    "const G={short:['Correction just says “'+'replaced'+'”','note','lead tech or foreman'],cause:['No cause written','note','lead tech or foreman'],code:['No fault code','note','lead tech or foreman'],dup:['Looks like an existing complaint','merge','Triage'],hand:['Added by hand by a tech','note','lead tech or foreman']};")
rep("""<small>${r.gap==='dup'?`“${esc(g.t)}” · ${ents(g.k).length}×`:r.gap==='code'?'the usual code here is '+stats(r.k).codes[0][0]:r.note?'the tech’s note has more':'—'}</small>""",
    """<small>${r.gap==='dup'?`“${esc(g.t)}” · ${ents(g.k).length}×`:r.gap==='code'?'the usual code here is '+stats(r.k).codes[0][0]:r.gap==='hand'?'by '+F(r.tech)+' · check it before it counts':r.note?'the tech’s note has more':'—'} · usually ${gp[2]}</small>""")
rep("""${ic('check',11)}${r.done?'Written up':r.kept?'Kept as written':'Complete'}</span></span>""", """${ic('check',11)}${r.done?'Written up':r.kept?'Kept as written':'Complete'}</span>${r.by?`<small>by ${F(r.by)} · ${r.byRole} · ${r.at}</small>`:'<small>nothing to fix</small>'}</span>""")
rep("r.ok=1; r.kept=1; toast(`${r.ro} kept as written.`);", "r.ok=1; r.kept=1; Object.assign(r,{by:me(),byRole:myRole(),at:hm(NOW)}); toast(`${r.ro} kept as written — by ${F(me())}.`);")
rep("r.cause=c||r.cause; r.fix=x||r.fix; r.done=1;", "r.cause=c||r.cause; r.fix=x||r.fix; r.done=1; Object.assign(r,{by:me(),byRole:myRole(),at:hm(NOW)});")
rep("snap(); r.done=1; r.k=k;", "snap(); r.done=1; r.k=k; Object.assign(r,{by:me(),byRole:myRole(),at:hm(NOW)});")
rep("snap(); S.M.push({id:'mh'+Date.now(),", "snap(); if(U.role==='tech'){ S.R.push({id:'rh'+Date.now(),k:g.k,ro:'—',cust:'Added by hand',tech:me(),truck:'—',eng:(($('#fx-aeng')||{}).value||'—'),gap:'hand',cmp:g.t,cause:d.c||'',fix:d.x||''}); U.pop=null; toast(`Sent to Review — a foreman, lead tech, Triage or the manager checks it before it counts.`); render(); return; }\n    S.M.push({id:'mh'+Date.now(),")
rep("  else if(a==='undo'){", r"""  else if(a==='askuse'){ const o=S.O.find(x=>x.no===t.dataset.no); toast(`Asked ${F(o.wr)} to use this fix on ${o.no} — it shows on the Triage page.`,false); render(); }
  else if(a==='suggest'){ snap(); const gg=grp(U.sel); S.R.push({id:'rs'+Date.now(),k:gg.k,ro:'—',cust:'Suggested edit',tech:me(),truck:'—',eng:'—',gap:'hand',cmp:gg.t,cause:stats(gg.k).causes[0][0],fix:stats(gg.k).fixes[0][0]}); toast('Sent to Review — Frank, Mike, Alicia, Jordan or Ray looks at it.'); render(); }
  else if(a==='undo'){""")
rep("const hm=", "const hm=", 0) if "const hm=" not in JS else None
if "const hm=" not in JS:
    JS = JS.replace("const h1=n=>", "const hm=m=>p2(Math.floor(m/60))+':'+p2(m%60);\nconst h1=n=>", 1)

rep("<span>${kbd('U')}use on an RO</span>", "${isRev()?`<span>${kbd('U')}use on an RO</span>`:''}")
rep("<span>${kbd('1')}–${kbd('3')}views</span>", "<span>${kbd('1')}–${kbd(isRev()?'3':'2')}views</span>")
# ---------- demos and the View as switch ----------
i = JS.index("const DEMO={"); j = JS.index("};", i) + 2
JS = JS[:i] + """const DEMO={
  lib:()=>{reset();setRole('fm');render();},
  flat:()=>{reset();setRole('fm');U.grp='flat';U.sort='recent';render();},
  use:()=>{reset();setRole('tr');render();const b=$('.tg-next [data-p="use"]');openPop('use',{no:b.dataset.no,tell:true,o:0},b);},
  open:()=>{reset();setRole('fm');U.view='open';render();},
  revfm:()=>{reset();setRole('fm');U.view='rev';render();const b=$('[data-a="pop"][data-p="write"][data-id="r2"]');openPop('write',{id:'r2'},b);},
  revtr:()=>{reset();setRole('tr');U.view='rev';render();const b=$('[data-a="pop"][data-p="merge"]');openPop('merge',{id:'r3'},b);},
  tech:()=>{reset();setRole('tech');render();}
};
$$('[data-role]').forEach(b=>b.addEventListener('click',()=>{ setRole(b.dataset.role); render(); }));""" + JS[j:]

CSS += r"""
/* ===== v2 ===== */
.wt-role{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink-3);}
.fx-nb{display:flex;align-items:center;gap:6px;margin-top:10px;font-size:12px;color:var(--tg-ink3);}
.fx-revs{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin:-4px 0 14px;font-size:12.5px;color:var(--tg-ink2);}
.fx-revs > b{font-weight:600;color:var(--tg-ink);margin-right:2px;}
.fx-revs > span{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px 0 4px;border-radius:999px;box-shadow:inset 0 0 0 1px var(--tg-hair);}
.fx-revs > span.me{background:var(--tg-acct);color:var(--tg-acctx);box-shadow:inset 0 0 0 1px var(--tg-accl);}
.fx-revs em{font-style:normal;font-size:12px;color:var(--tg-ink3);margin-left:4px;}
"""

used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "filter", "engine", "drop", "bolt", "air", "snow", "gear2", "book", "note", "merge"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("lib", "1 · By system"), ("flat", "2 · Flat list"), ("use", "3 · Use fix (button)"), ("open", "4 · Open ROs"), ("revfm", "5 · Review · foreman"), ("revtr", "6 · Review · Triage"), ("tech", "7 · As a technician")])
about = [
 ("By system or flat", "The complaints list groups by system or runs as one flat list — either way, sort by most fixed, recent or A–Z."),
 ("Use fix is a button", "Nothing fills in by itself. Use fix shows the quote and parts it will put on the RO, and changes nothing until you press it. Open ROs shows who used it."),
 ("Who reviews", "Foreman, lead tech, Triage and the manager. Any of them can clear an item, and it shows who did. Technicians don’t see Review — what they add or suggest goes there."),
 ("Held", "Unchanged: a fix held when the truck didn’t come back for the same complaint within 30 days."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Fixes mock-up v2</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Fixes — v2</h1><div class="wt-ideas wt-demo">{demos}</div>
<span class="wt-role">View as<span class="px-seg">{"".join(f'<button data-role="{k}"{" class=\"is-on\"" if k=="fm" else ""}>{n}</button>' for k, n in [("tech","Technician"),("lt","Lead tech"),("fm","Foreman"),("tr","Triage"),("mg","Manager")])}</span></span>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Fixes · v2<small>Your four decisions. Everything from the first mock-up still works. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
