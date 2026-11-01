# Manager page — the ten ideas, layered on mock-up v2 (mg/), with spotlight notes.
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(B), "app"); M = os.path.join(B, "mg"); I = os.path.join(B, "mgi")
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
tok = open(f"{B}/ds/tokens.local.css").read()
bun = open(f"{B}/ds/project/components/bundle.css").read().split("\n", 1)[1]
shell = open(f"{B}/_shell.css").read()
tg = open(f"{A}/tg.css").read()
tg = tg.replace(':root:is([data-theme="ivd"],[data-theme="mist"],[data-theme="atd"]) .tg{', ':root[data-theme="dark"] .tg{')
wcss = open(f"{B}/make_warranty.py").read()
wcss = re.search(r'CSS = shell \+ r"""(.*?)"""', wcss, re.S).group(1)
frame = "\n".join(l for l in wcss.split("\n") if l.strip().startswith((".tg-panel", ".tg-rail", ".rl-badge", ".tg .btn", ".tg :focus-visible", ".toast-fm")))
src = open(f"{B}/make_fixes.py").read().split('\nCSS = shell + r"""\n')[0]
g = {"__file__": f"{B}/make_fixes.py"}; argv = sys.argv; sys.argv = ["x", "/dev/null"]; exec(src, g); sys.argv = argv
IC = g["IC"]
IC.update({
 "grid": '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
 "users": '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M15.5 5.8a3 3 0 0 1 0 5.4M17.5 14.3c1.8.6 3 2.3 3 4.7"/>',
 "download": '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14"/>',
 "lock": '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
})
V1 = open(f"{M}/views.js").read(); V2 = open(f"{M}/views2.js").read()
def rep(s, a, b, n=1):
    assert s.count(a) == n, (a[:90], s.count(a)); return s.replace(a, b)
# ---------- views.js ----------
V1 = rep(V1, "const isSum=k=>['sold','clk','lost','unap','sales','lab','prt','dec','wo','opn','cls','wcl','wpd'].includes(k.id);", "const isSum=k=>['sold','clk','lost','unap','sales','lab','prt','dec','wo','opn','cls','wcl','wpd','leak','gp'].includes(k.id);")
V1 = rep(V1, "function kv(k,F){ const [a,b]=W(),", "function kv(k,F){ if(k.lock&&!U.unl) return {v:null,pv:null,t:null,dl:{s:'needs fields',cl:'flat'},ok:null,X:ctx(...W())}; const [a,b]=W(),")
V1 = rep(V1, "const v=U.view, body=v==='kpi'?vKpi():v==='flow'?vFlow():", "const v=U.view, body=v==='kpi'?vKpi():v==='fleet'?vFleet():v==='flow'?vFlow():")
V1 = rep(V1, "${v==='kpi'?kList():v==='team'?pList():''}<div class=\"tg-main\">${body}</div>${pop()}</div><div class=\"tk-tip\" hidden></div></div>",
              "${v==='kpi'?kList():v==='team'?pList():v==='fleet'?fList():''}<div class=\"tg-main\">${body}</div>${pop()}${U.rep?repSheet():''}</div><div class=\"tk-tip\" hidden></div><div class=\"tk-ring\" hidden></div><div class=\"tk-note\" hidden></div></div>")
V1 = rep(V1, "const nOpen=openAt(TODAY).length, nd=U.needs.length,", "const nOpen=openAt(TODAY).length, nd=U.needs.length+alerts().length,")
V1 = rep(V1, "['kpi','chart','KPIs'],['flow','swap','Flow']", "['kpi','chart','KPIs'],['fleet','unit','Fleets'],['flow','swap','Flow']")
V1 = rep(V1, "<i>·</i><button class=\"tg-hf\" data-a=\"sel\" data-k=\"eff\" data-go=\"1\"><b>${fmt('pct',e.v)}</b>efficiency</button></span>",
              "${nChk()?`<i>·</i><button class=\"tg-hf w\" data-a=\"pop\" data-p=\"chk\"><b>${nChk()}</b>data checks</button>`:`<i>·</i><button class=\"tg-hf\" data-a=\"sel\" data-k=\"eff\" data-go=\"1\"><b>${fmt('pct',e.v)}</b>efficiency</button>`}</span>")
V1 = rep(V1, "const N=U.needs.map(id=>NEEDS0.find(n=>n.id===id)), [a,b]=W();", "const N=alertNeeds().concat(U.needs.map(id=>NEEDS0.find(n=>n.id===id))), [a,b]=W();")
V1 = rep(V1, "<div class=\"mg-nd\"><div class=\"h\">${ic(n.ic,14)}${n.h}</div><p>${n.p}</p><div class=\"a\">${n.a.map((x,i)=>`<button class=\"btn btn-sm${i===0?' btn-primary':''}\" data-a=\"nd\"",
              "<div class=\"mg-nd${n.al?' al':''}\"><div class=\"h\">${ic(n.ic,14)}${n.h}</div><p>${n.p}</p><div class=\"a\">${n.a.map((x,i)=>`<button class=\"btn btn-sm${i===0?' btn-primary':''}\" data-a=\"${n.al?'aln':'nd'}\"")
V1 = rep(V1, "  h+=`<div class=\"mg-sec\">Pinned<span>", "  h+=`<div class=\"mg-sec\">${mName(TODAY)} pace<span>where ${mName(TODAY)} lands if the rest of the month goes like it has so far</span></div>${paceCard()}`;\n  h+=`<div class=\"mg-sec\">Pinned<span>")
V1 = rep(V1, "<button class=\"btn btn-sm tg-gh\" data-a=\"ed\">${U.ed?ic('check',13)+'Done':ic('pencil',13)+'Edit tiles'}</button>", "<button class=\"btn btn-sm tg-gh\" data-a=\"rep\">${ic('file',13)}Monthly report</button><button class=\"btn btn-sm tg-gh\" data-a=\"ed\">${U.ed?ic('check',13)+'Done':ic('pencil',13)+'Edit tiles'}</button>")
V1 = rep(V1, "${openCard()}</div></div>`;\n  return h; }", "${openCard()}</div><div class=\"mg-two r2\">${leakCard()}${capCard()}</div></div>`;\n  return h; }")
V1 = rep(V1, "const item=k=>{ const o=kv(k), on=k.id===U.sel;\n    return `<div class=\"tg-it mg-it${on?' on':''}",
              "const item=k=>{ const o=kv(k), on=k.id===U.sel;\n    if(k.lock&&!U.unl) return `<div class=\"tg-it mg-it lk${on?' on':''}${on&&U.kb?' kb':''}\" data-a=\"sel\" data-k=\"${k.id}\"><span class=\"tg-t\"><b>${k.n}</b></span><span class=\"tg-w\">needs ${k.needs.map(n=>({cost:'part cost',pay:'tech pay',ovh:'overhead'})[n]).join(' + ')}</span><span></span><span class=\"v\">${ic('lock',14)}</span></div>`;\n    return `<div class=\"tg-it mg-it${on?' on':''}")
V1 = rep(V1, "${U.pins.includes(k.id)?`<span class=\"pin\" title=\"Pinned to Overview\">${ic('pin',12)}</span>`:''}</span><span class=\"tg-w\">",
              "${U.pins.includes(k.id)?`<span class=\"pin\" title=\"Pinned to Overview\">${ic('pin',12)}</span>`:''}${U.al[k.id]?`<span class=\"pin\" title=\"Alert on\">${ic('bell',12)}</span>`:''}</span><span class=\"tg-w\">")
V1 = rep(V1, "function vKpi(){ const k=KM[U.sel];", "function vKpi(){ const k=KM[U.sel]; if(k.lock&&!U.unl) return lockPane(k);")
V1 = rep(V1, "<span class=\"sp\"></span><button class=\"btn btn-sm\" data-a=\"pin\" data-k=\"${k.id}\" title=\"P\">", "<span class=\"sp\"></span><button class=\"btn btn-sm\" data-a=\"alt\" data-k=\"${k.id}\">${ic('bell',14)}${U.al[k.id]?'Alert on':'Alert me'}</button><button class=\"btn btn-sm\" data-a=\"pin\" data-k=\"${k.id}\" title=\"P\">")
V1 = rep(V1, "${o.t!=null?tgtTxt(k,o):`<span class=\"mg-tgt\">${ic('flag',12)}No target</span>`}</span>", "${o.t!=null?tgtTxt(k,o):`<span class=\"mg-tgt\">${ic('flag',12)}No target</span>`}${paceLine(k)}</span>")
V1 = rep(V1, "<div class=\"mg-how\">${ic('info',13)}<span>${k.how}</span><span class=\"src\">", "${k.lock?`<div class=\"mg-sample\">${ic('info',13)}Sample numbers — parts cost 58–70% of the price, tech pay $36 an hour, overhead $260k a month.<button data-a=\"unl0\">Hide them</button></div>`:''}<div class=\"mg-how\">${ic('info',13)}<span>${k.how}</span>${['eff','sold','lph','lost','qa','lab'].includes(k.id)&&U.chk.includes('c1')?`<button class=\"mg-dchip\" data-a=\"pop\" data-p=\"chk\">${ic('flag',11)}3 ROs left out — data checks</button>`:''}<span class=\"src\">")
V1 = rep(V1, "<div class=\"mg-pad\"><div class=\"mg-card\"><div class=\"mg-ch\"><b>Trend</b>", "<div class=\"mg-pad\">${whyCard(k)}<div class=\"mg-card\"><div class=\"mg-ch\"><b>Trend</b>")
V1 = rep(V1, "${B.prev?'<span><i class=\"ln\"></i>The period before</span>':''}", "${pace(k,U.p,U.bf)?'<span><i class=\"pc\"></i>On pace</span>':''}${B.prev?'<span><i class=\"ln\"></i>The period before</span>':''}")
V1 = rep(V1, "const all=V.concat(PV||[]).concat(TV).filter(v=>v!=null);", "const PC=bar?paceVals(k,C):null; const all=V.concat(PV||[]).concat(TV).concat(PC||[]).filter(v=>v!=null);")
V1 = rep(V1, "let s=`<svg class=\"mg-svg\" width=\"${w}\" height=\"${H}\">`;\n  for(let g=lo;", "let s=`<svg class=\"mg-svg\" width=\"${w}\" height=\"${H}\"><defs><pattern id=\"mgh\" width=\"6\" height=\"6\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(45)\"><rect width=\"6\" height=\"6\" style=\"fill:var(--tg-acc);opacity:.16\"/><rect width=\"2.4\" height=\"6\" style=\"fill:var(--tg-acc);opacity:.6\"/></pattern></defs>`;\n  for(let g=lo;")
V1 = rep(V1, "    TV.forEach((t,i)=>{ if(t==null||!V[i]&&V[i]!==0) return;", "    if(PC) PC.forEach((v,i)=>{ if(!v) return; s+=`<path class=\"bar pace\" d=\"${rtop(cx(i)-bw/2,y(v),bw,y(lo)-y(v))}\"/>`; });\n    TV.forEach((t,i)=>{ if(t==null||!V[i]&&V[i]!==0) return;")
V1 = rep(V1, "const t=tb==null?null:k.tw!=null?tb*XX.wd*(key==='tech'?1/6:1):tb;", "const pgv=key==='tech'&&U.pg[v]&&U.pg[v][k.id]!=null?U.pg[v][k.id]:null; const t=pgv!=null?(k.tw!=null?pgv*XX.wd:pgv):tb==null?null:k.tw!=null?tb*XX.wd*(key==='tech'?1/6:1):tb;")
V1 = rep(V1, "alf:'all',alw:'',nall:false};", "alf:'all',alw:'',nall:false,al:{prod:1,eff:1,cb:1,fill:1,fc:1,days:1},mute:{},pg:PG0(),unl:false,chk:CHK0.map(c=>c.id),rep:null,repn:'',fleet:'Piedmont Aggregates',note:null};")
V1 = rep(V1, "const snap=()=>{ UNDO.push(JSON.stringify({tg:U.tg,pins:U.pins,needs:U.needs,", "const snap=()=>{ UNDO.push(JSON.stringify({al:U.al,mute:U.mute,pg:U.pg,chk:U.chk,tg:U.tg,pins:U.pins,needs:U.needs,")
# ---------- views2.js ----------
V2 = rep(V2, "const o=kv(kk,FF); return `<button class=\"mg-tile\" data-a=\"psel\"", "const o=kvG(kk,FF,tech?k:null); return `<button class=\"mg-tile\" data-a=\"psel\"")
V2 = rep(V2, "${o.t!=null&&!(tech&&kk.tw!=null)?(o.ok?", "${o.t!=null?(o.ok?")
V2 = rep(V2, "<div class=\"mg-card\"><div class=\"mg-ch\"><b>Pages they can open</b>", "${tech?goalsCard(k):''}<div class=\"mg-card\"><div class=\"mg-ch\"><b>Pages they can open</b>")
V2 = rep(V2, "  if(p.type==='tgt'){", "  if(p.type==='chk') return chkPop();\n  if(p.type==='tgt'){")
V2 = rep(V2, "      <div class=\"tg-acts\">${base!=null?'<button class=\"btn btn-sm tg-gh\" data-a=\"tclr\">No target</button>':''}", "      <label class=\"mg-ck\"><input type=\"checkbox\" data-a=\"alt\" ${U.al[k.id]?'checked':''}>Tell me when it’s off target three workdays in a row</label>\n      <div class=\"tg-acts\">${base!=null?'<button class=\"btn btn-sm tg-gh\" data-a=\"tclr\">No target</button>':''}")
V2 = rep(V2, "if(U.pop&&!e.target.closest('.tg-pop,[data-a=\"pop\"]'))", "if(U.pop&&!e.target.closest('.tg-pop,[data-a=\"pop\"],.tk-note'))")
V2 = rep(V2, "function move(d){ if(U.view==='team'){", "function move(d){ if(U.view==='fleet'){ const L=fleetRows().map(x=>x.c), i=L.indexOf(U.fleet); U.fleet=L[Math.max(0,Math.min(L.length-1,i+d))]; U.kb=true; render(); return; } if(U.view==='team'){")
V2 = rep(V2, "if(k>='1'&&k<='5'){ U.view=['ov','kpi','flow','team','act'][+k-1];", "if(k>='1'&&k<='6'){ U.view=['ov','kpi','fleet','flow','team','act'][+k-1];")
V2 = rep(V2, "${kbd('1')}–${kbd('5')}views", "${kbd('1')}–${kbd('6')}views")
V2 = rep(V2, "if(U.pop&&!U.pop._f){ const f=$('.tg-pop #mg-pq')||$('.tg-pop #mg-tv'); if(f){ U.pop._f=1; f.focus(); if(f.select) f.select(); } }\n}", "if(U.pop&&!U.pop._f){ const f=$('.tg-pop #mg-pq')||$('.tg-pop #mg-tv'); if(f){ U.pop._f=1; f.focus(); if(f.select) f.select(); } }\n  note();\n}")
i = V2.index("const DEMO={"); j = V2.index("};", i) + 2
V2 = V2[:i] + """const DEMO={
  d1:()=>{reset();U.note=1;render();},
  d2:()=>{reset();U.note=2;goKpi('sales');},
  d3:()=>{reset();U.note=3;render();},
  d4:()=>{reset();U.note=4;render();scrollTo_('.mg-leak');},
  d5:()=>{reset();U.view='fleet';U.fleet='Piedmont Aggregates';U.note=5;render();},
  d6:()=>{reset();U.note=6;render();scrollTo_('.mg-cap');},
  d7:()=>{reset();U.view='team';U.person='AW';U.note=7;render();scrollTo_('.mg-goals');},
  d8:()=>{reset();render();openPop('chk',{},$('[data-p="chk"]'));U.note=8;render();},
  d9:()=>{reset();U.rep=addM(TODAY,-1);U.note=9;render();},
  d10:()=>{reset();U.note=10;goKpi('gp');},
  try:()=>{reset();render();}
};""" + V2[j:]
IDEAS = open(f"{I}/ideas.js").read()
V2 = rep(V2, "window.__mg={", IDEAS + "\nwindow.__mg={")
V3 = os.environ.get("MG_MODE") == "v3"
if V3:
    V2 = re.sub(r"U\.note=\d+;", "", V2)
    V2 = rep(V2, "  try:()=>{reset();render();}", "  try:()=>{reset();render();},\n  ov:()=>{reset();render();},\n  flow:()=>{reset();U.view='flow';render();},\n  team:()=>{reset();U.view='team';U.person='AW';render();}")
JS = open(f"{M}/data.js").read() + "\n" + V1 + "\n" + V2
CSS = shell + "\n" + frame + "\n" + open(f"{M}/mg.css").read() + "\n" + open(f"{I}/ideas.css").read()
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"flag", "keyTag", "send", "trash", "eye", "pin", "pencil", "inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "grid", "chart", "swap", "users", "history", "dollar", "check", "user", "undo", "clock", "lock", "bell", "unit", "play", "spark", "file"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("d1", "1 · Month pace"), ("d2", "2 · Why it moved"), ("d3", "3 · Alerts"), ("d4", "4 · Money left"), ("d5", "5 · Fleets"), ("d6", "6 · Capacity"), ("d7", "7 · Goals"), ("d8", "8 · Data checks"), ("d9", "9 · Monthly report"), ("d10", "10 · Two more fields"), ("try", "Try it")])
about = [
 ("1 · Month pace", "Where the month lands if it keeps going like this — against the goal, and what it takes a workday."),
 ("2 · Why it moved", "The biggest slices behind a change, by pay, tech, customer or job type."),
 ("3 · Off-target alerts", "Three workdays in a row off target lands in Needs you; mute for a week."),
 ("4 · Money left on the table", "Hours over quote, unapplied hours, declined work and write-offs — one number."),
 ("5 · Fleet scorecards", "A page per customer, ready for the account review."),
 ("6 · Capacity", "Work in the shop plus appointments against tech hours — booked through when."),
 ("7 · Goals per person", "A tech’s own goals, on their Career page."),
 ("8 · Data checks", "The Time Log gaps that throw the numbers off, fixed in one place."),
 ("9 · Monthly report", "One page for the GM, print or PDF."),
 ("10 · Two more fields", "Part cost and tech pay open gross profit and margins; overhead opens absorption."),
]
if V3:
    demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("ov", "1 · Overview"), ("d2", "2 · A KPI"), ("d3", "3 · Alerts"), ("d4", "4 · Money left"), ("d5", "5 · Fleets"), ("d6", "6 · Capacity"), ("d7", "7 · Goals"), ("d8", "8 · Data checks"), ("d9", "9 · Monthly report"), ("d10", "10 · Gross profit"), ("flow", "11 · Flow")])
    about = [("Built in", "The ten ideas are part of the page now: pace and Needs-you alerts on the Overview, Why it moved on every KPI, money left on the table and capacity under The shop, a Fleets tab, goals in Team, data checks in the header, the monthly report, and gross profit waiting on two fields.")] + about[:0] + [
     ("Kept as they were", "Fleets is its own tab; alerts fire after three workdays off target; unapplied hours count at the $210 rate; gross profit stays locked until part cost and tech pay are in."),
     ("Still from before", "Calendar periods, manager only, 12 tiles, Flow, Team and Activity.")]
TITLE = "Parsec · Manager — mock-up v3" if V3 else "Parsec · Manager — ideas"
DOC = "Parsec Manager mock-up v3" if V3 else "Parsec Manager ideas"
SUB = "Try the buttons above, or the keys. Nothing here is saved; the numbers are made up but add up." if V3 else "Each button opens one idea with a note. Nothing here is saved; the numbers are made up but add up."
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{DOC}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}{TITLE}</h1><div class="wt-ideas wt-demo">{demos}</div>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Manager<small>{SUB}</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
