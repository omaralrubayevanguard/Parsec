# Parsec · the site map — every page and view, its sections and components called out (reads data.json from app/_map144.py)
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__))
OUT = "/mnt/user-data/outputs/Parsec site map.html"
S = json.load(open(os.path.join(H, "data.json")))

DESC = {
 "sidebar": "Every page in one list, in the shop’s order. Badges count what needs you; your name, the clock and the theme sit at the bottom.",
 "page header": "The page’s name, its facts and its views. The same bar on every page.",
 "facts": "Live counts for the page — click one to filter the list by it.",
 "view tabs": "The page’s own views. The ROs tab (last) is the RO list itself, with your columns.",
 "search": "Opens the search window for this page’s list (or press /). Ctrl K searches everything.",
 "needs action list": "What needs this page’s people, in groups. J/K move, Enter does the next step.",
 "list heading": "The list’s name, its count, Cleared today and the fold-away button.",
 "a group": "A group of the list — click to fold it.",
 "the picked item": "The RO or person picked; its detail opens in the pane.",
 "folded groups": "Groups kept folded — Cleared today, On the way, With the tech…",
 "keys bar": "The keys that work on this page.",
 "pane": "The picked RO’s (or person’s) detail and its actions.",
 "pane header": "RO number, stage, customer, truck, status, and the page’s buttons (Road test, Truck checks, Transfer, Open RO).",
 "next card": "The one next step for this RO and who has it, with its button.",
 "top bar": "Where you came from, the RO number, ⌃ ⌄ to step through the list, time / parts / notes / files counts, and ⋯ (print, copy, link).",
 "operations": "Every operation as a row — status, number, complaint, job type, time, who, status menu. The open one unfolds below its row.",
 "an operation row": "Click to open it; double-click the complaint to rename; the quoted hours change in place.",
 "clock card": "Start / stop the clock, time on the operation, quoted vs burnt, pace and efficiency. Quoted changes in place.",
 "time · parts · files": "The open operation’s punches and notes, its parts (Add part, From inventory, Extract), and its files.",
 "messages about this ro": "Notes to and from people about this RO — pick who it’s to, Enter sends.",
 "fault codes": "The RO’s fault codes per operation — add one like 3226/2 or P0401.",
 "photos & codes": "Dash picture, photos and DTC files — upload, take a photo, or paste a screenshot.",
 "parts on this ro": "Every part on every operation with its status menu; Ask Parts for a part.",
 "truck history": "This truck’s other visits — Open in Assets for the whole history.",
 "warranty claim": "The claim’s stage for the warranty operations — Open in Warranty.",
 "customer": "Who the customer is, how many ROs they have, the last contact.",
 "estimate & approval": "Each operation’s price and whether it’s approved; the total.",
 "ready to close": "What release needs: operations, parts, notes, files, road test, truck checks, hours.",
 "truck card": "The truck’s picture, RO number, days open, the customer and truck (they change in place), status, who has it, Start, Transfer, Road test, Truck checks, the road test switch.",
 "status": "The RO’s status — a pill with ▾ where you may change it, the words where you may not.",
 "road test switch": "Off: no road test and no truck checks for this RO.",
 "stage": "Where the RO is in its seven stages, and when it’ll be ready.",
 "who has it": "Who the RO is with now and for how long; Nudge them.",
 "schedule": "Ready about, opened, promised, follow-up, days open.",
 "people": "Technician, advisor, foreman — click to change.",
 "vehicle": "Year, make, model, VIN, unit, mileage, engine hours, engine and serial, key tag, spot.",
 "money": "Labor, parts, core, shop supplies, the estimate and ASIST’s total.",
 "fold button": "Every section folds from here; a folded section opens while you point at its heading.",
 "tabs": "Open, Mine, Working, Waiting, Hold, Done.",
 "display": "List or board, group by, sort, your columns (drag to order), add a field or your own column.",
 "column headers": "Click to sort the whole list; drag one to move the column.",
 "shop time row": "Clock time that isn’t on an RO — cleaning, training, shop trucks.",
 "a row": "Click for the side pane, double-click for the RO page.",
 "next step": "What the RO waits on and who’s up.",
 "new ro": "A new RO by hand or from an ASIST case (paste, screenshots or the PDF).",
 "side pane": "The RO beside the list — its status, next step, totals, operations and editable details.",
 "truck words": "The customer, year, make, model and unit — click to change.",
 "totals": "Time, parts and files at a glance.",
 "ro details": "Vehicle, Customer, People, Schedule and Case — click any field to change it.",
 "display menu": "How the list looks — for you only.",
 "columns": "Your columns, in your order — drag, or × to take one off.",
 "add a column": "Any RO field as a column.",
 "your own columns": "Columns you name and type into, for the whole shop.",
 "the ro page, here": "The RO page itself, for the RO picked on the left — the same page as from the RO list.",
 "sent to you": "Notes, road test asks, go-aheads and parts-in sent to you — tick Done.",
 "search window": "Typing filters the page’s list behind it; Enter keeps the filter.",
 "approvals": "Each operation’s approval — Approve, Partly, Decline — and the record to copy.",
 "bays": "The floor’s bays: who’s in each, free ones to fill.",
 "lifetime": "Visits, days down, labor and parts spent on this truck.",
 "repeat repairs": "The same system or part back within 90 days.",
 "miles": "Miles at each visit, and a monthly rate.",
 "engine hours": "Engine hours at each visit, and a monthly rate.",
 "every visit": "Each RO on this truck, newest first — click to open it.",
 "pinned": "Your 12 pinned KPI tiles for the period — click one for its detail.",
 "the shop": "Hours and open work, today and the last two weeks.",
 "needs you": "What’s off target and needs the manager.",
 "truck header": "The truck: picture, year, make, model, VIN, unit, customer, engine, serial, miles, last seen.",
}
def clean(t):
    t = re.sub(r"\s+", " ", t or "").strip()
    m = re.match(r"^(.*?[A-Za-z&)’'.].*?)\s*[\d$▲▼·•%—–-]+[\d.,%$ kh]*(\s.*)?$", t)
    if m and len(re.sub(r"[^A-Za-z]", "", m.group(1))) >= 3 and not re.search(r"\d", m.group(1)[-1:]): t = m.group(1)
    return t.rstrip(" ·•—–-")[:44]
for s in S:
    for c in s["callouts"]:
        c["label"] = clean(c["label"]); k = c["label"].lower()
        c["desc"] = DESC.get(k) or next((v for kk, v in DESC.items() if k.startswith(kk) and len(kk) > 4), "")
ORDER = ["Sign in", "Career", "Time Log", "RO List", "RO page", "Technician", "Triage", "Foreman", "Parts", "Warranty", "Manager", "Fixes", "Assets", "Inventory", "Admin", "Search", "Phone"]
PAGE_JOB = {"Sign in": "Who’s signing in — name tiles by department, a 4-digit PIN.", "Career": "One tech’s own numbers: efficiency, work, growth.",
 "Time Log": "Your day and week of punches; timesheets; the whole shop for leads.", "RO List": "Every RO — your columns, sort, group, the side pane.",
 "RO page": "One RO, everything on it. The same page from the RO list, the Technician page and every ROs tab.", "Technician": "A tech’s ROs on the left, the RO page for the one picked.",
 "Triage": "Writers: customers, approvals, road tests, truck checks, release.", "Foreman": "Bays, techs, the yard and tomorrow — who works on what.",
 "Parts": "Order, check in, stage, hand over, returns, the catalog.", "Warranty": "Claims from repair to paid; the board, the money, the failed parts.",
 "Manager": "KPIs, fleets, flow, the team and the activity log.", "Fixes": "Past corrections to reuse on a matching operation.",
 "Assets": "Every truck, one per VIN, with its history.", "Inventory": "Stock on the shelves — counts, bins, reorder.",
 "Admin": "People, roles, permissions, PINs, sign-in rules and log.", "Search": "The page search window and Ctrl K.", "Phone": "The same pages, stacked for a phone."}
pages = []
for p in ORDER:
    L = [i for i, s in enumerate(S) if s["page"] == p]
    if L: pages.append({"p": p, "job": PAGE_JOB.get(p, ""), "screens": L})
DATA = json.dumps({"S": S, "P": pages}, separators=(",", ":"))

CSS = r"""
:root,[data-th=ivory]{--canvas:#F2F0EA;--panel:#FBFAF7;--raised:#fff;--fill:#F0EDE6;--sel:#E8E4DA;--hair:#E6E2D8;--border:#D6D0C3;--ink:#1D1C1A;--ink2:#57534B;--ink3:#67625A;--ink4:#A8A398;--acc:#86643A;--acct:#F4EDE1;--accl:#D9C5A3;--primary:#1D1C1A;--onprimary:#FBFAF7;--frame:#2F8795;--sec:#86643A;--comp:#6C69C8;--shadow:0 0 0 1px rgba(29,28,26,.06),0 1px 3px rgba(29,28,26,.04);--raise:0 0 0 1px rgba(29,28,26,.08),0 18px 44px -14px rgba(29,28,26,.28);color-scheme:light}
[data-th=graphite]{--canvas:#0E0E0D;--panel:#151514;--raised:#1D1D1B;--fill:#222220;--sel:#2A2A27;--hair:#262624;--border:#363532;--ink:#EDEBE6;--ink2:#B0ACA3;--ink3:#9A968D;--ink4:#5E5B55;--acc:#D1B184;--acct:#2A241B;--accl:#6B5A3E;--primary:#EDEBE6;--onprimary:#151514;--frame:#58B3C0;--sec:#D1B184;--comp:#9E9DF0;--shadow:0 0 0 1px rgba(255,255,255,.06);--raise:0 0 0 1px rgba(255,255,255,.08),0 18px 44px -14px rgba(0,0,0,.6);color-scheme:dark}
*{box-sizing:border-box} html,body{margin:0;height:100%;background:var(--canvas);color:var(--ink);font:400 13.5px/1.45 "Geist","Inter","Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
button,input{font:inherit;color:inherit}
.app{display:grid;grid-template-rows:52px 1fr;height:100vh}
.bar{display:flex;align-items:center;gap:12px;padding:0 16px;box-shadow:inset 0 -1px 0 var(--hair);background:var(--canvas)}
.bar h1{margin:0 auto 0 0;display:flex;align-items:center;gap:10px;font:500 19px/1 "Newsreader",Georgia,serif}
.bar h1 small{font:500 11px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}
.lg circle{fill:var(--ink)} .lg .c{fill:#22c55e}
.q{position:relative} .q input{width:280px;height:32px;padding:0 10px 0 30px;border:0;border-radius:9px;background:var(--fill);outline:none} .q input:focus{box-shadow:0 0 0 2px var(--accl)}
.q svg{position:absolute;left:9px;top:9px;color:var(--ink3)}
.qr{position:absolute;top:38px;left:0;width:420px;max-height:60vh;overflow:auto;padding:6px;border-radius:12px;background:var(--raised);box-shadow:var(--raise);z-index:50}
.qr button{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:1fr auto;gap:2px 10px;width:100%;padding:7px 10px;border-radius:8px} .qr button:hover,.qr button.on{background:var(--fill)}
.qr b{font-weight:500} .qr small{color:var(--ink3);font-size:11.5px;grid-column:1/-1}
.seg{display:inline-flex;gap:2px;padding:2px;border-radius:9px;background:var(--fill)} .seg button{all:unset;cursor:pointer;height:26px;padding:0 10px;border-radius:7px;font-size:12.5px;font-weight:500;color:var(--ink2);white-space:nowrap;display:inline-flex;align-items:center;gap:6px}
.seg button[aria-pressed=true]{background:var(--raised);color:var(--ink);box-shadow:var(--shadow)} .seg i{width:8px;height:8px;border-radius:2px}
.body{display:grid;grid-template-columns:250px minmax(0,1fr) 340px;min-height:0}
.nav{overflow:auto;padding:12px 8px;box-shadow:inset -1px 0 0 var(--hair)}
.nav button{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:8px;width:100%;padding:6px 10px;border-radius:8px;font-size:13px;color:var(--ink2)} .nav button:hover{background:var(--fill)} .nav button.on{background:var(--sel);color:var(--ink);font-weight:500}
.nav .pg{font-weight:500;color:var(--ink)} .nav .pg em{margin-left:auto;font-style:normal;font-size:11px;color:var(--ink3)} .nav .vw{padding-left:26px;font-size:12.5px} .nav .vw em{margin-left:auto;font-style:normal;font-size:11px;color:var(--ink4)}
.nav hr{border:0;border-top:1px solid var(--hair);margin:8px 6px}
.stage{overflow:auto;padding:16px 20px 40px;min-width:0}
.crumb{display:flex;align-items:baseline;gap:8px;margin:0 2px 4px} .crumb h2{margin:0;font:500 24px/1.2 "Newsreader",Georgia,serif} .crumb span{color:var(--ink3)}
.job{margin:0 2px 12px;color:var(--ink2)}
.vtabs{display:flex;gap:2px;flex-wrap:wrap;margin:0 0 12px}
.vtabs button{all:unset;cursor:pointer;height:28px;padding:0 11px;border-radius:8px;font-size:12.5px;color:var(--ink2);background:var(--panel);box-shadow:var(--shadow)} .vtabs button.on{background:var(--primary);color:var(--onprimary);box-shadow:none}
.shot{position:relative;border-radius:12px;overflow:hidden;box-shadow:var(--raise);background:#fff;margin:0 auto}
.shot img{display:block;width:100%;height:auto;user-select:none}
.co{position:absolute;border:1.5px solid var(--k);border-radius:6px;background:color-mix(in srgb,var(--k) 6%,transparent);cursor:pointer;transition:background-color .12s,box-shadow .12s,opacity .12s}
.co:hover,.co.on{background:color-mix(in srgb,var(--k) 16%,transparent);box-shadow:0 0 0 3px color-mix(in srgb,var(--k) 25%,transparent);z-index:5}
.co .pin{position:absolute;left:-9px;top:-9px;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:var(--k);color:#fff;font:600 11px/20px system-ui,sans-serif;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.25)}
.co.k-frame{--k:var(--frame)} .co.k-sec{--k:var(--sec)} .co.k-comp{--k:var(--comp)}
.shot.dim .co:not(.on):not(:hover){opacity:.35}
.tip{position:absolute;z-index:20;max-width:320px;padding:8px 10px;border-radius:9px;background:var(--primary);color:var(--onprimary);font-size:12.5px;line-height:1.4;pointer-events:none;box-shadow:var(--raise)} .tip b{display:block;font-weight:600;margin-bottom:2px}
.side{overflow:auto;padding:14px 12px 30px;box-shadow:inset 1px 0 0 var(--hair)}
.side h3{margin:2px 4px 8px;font:600 12px/1 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--ink3)}
.row{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:24px 1fr;gap:2px 8px;width:100%;padding:7px 8px;border-radius:9px} .row:hover,.row.on{background:var(--fill)}
.row .n{grid-row:span 2;display:grid;place-items:center;width:22px;height:22px;border-radius:999px;background:var(--k);color:#fff;font:600 11px/1 system-ui,sans-serif}
.row b{font-weight:500} .row b em{font-style:normal;font-size:10.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--k);margin-left:6px} .row small{color:var(--ink3);font-size:12px;line-height:1.35}
.row.k-frame{--k:var(--frame)} .row.k-sec{--k:var(--sec)} .row.k-comp{--k:var(--comp)}
.ov{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px}
.card{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;border-radius:14px;background:var(--panel);box-shadow:var(--shadow);overflow:hidden;transition:box-shadow .15s,transform .15s}
.card:hover{box-shadow:var(--raise);transform:translateY(-1px)} .card img{display:block;width:100%;aspect-ratio:1200/833;object-fit:cover;object-position:top;border-bottom:1px solid var(--hair);background:#fff}
.card .c{padding:10px 12px 12px;display:flex;flex-direction:column;gap:6px} .card b{font:500 17px/1.2 "Newsreader",Georgia,serif} .card small{color:var(--ink3);font-size:12px}
.chips{display:flex;flex-wrap:wrap;gap:4px} .chips span{height:20px;padding:0 7px;border-radius:999px;background:var(--fill);font-size:11px;color:var(--ink2);display:inline-flex;align-items:center}
.flow{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 16px;padding:12px 14px;border-radius:14px;background:var(--panel);box-shadow:var(--shadow);font-size:12.5px;color:var(--ink2)} .flow b{color:var(--ink);font-weight:600} .flow .ar{color:var(--ink4)}
.legend{display:flex;gap:14px;margin:0 2px 12px;font-size:12px;color:var(--ink3)} .legend span{display:inline-flex;align-items:center;gap:6px} .legend i{width:10px;height:10px;border-radius:3px;border:1.5px solid var(--k);background:color-mix(in srgb,var(--k) 12%,transparent)}
.phone .shot{max-width:390px}
@media (max-width:1100px){.body{grid-template-columns:200px minmax(0,1fr)} .side{grid-column:1/-1;box-shadow:inset 0 1px 0 var(--hair)}}
"""
JS = r"""
var D=document, M=DATA, V={i:-1, k:'all', sel:null, th:'ivory'}; try{ var sv=JSON.parse(localStorage.getItem('pmap')||'{}'); if(sv.th) V.th=sv.th; if(sv.k) V.k=sv.k; }catch(e){}
function $(s,r){return (r||D).querySelector(s)} function $$(s,r){return [].slice.call((r||D).querySelectorAll(s))}
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function save(){ try{ localStorage.setItem('pmap', JSON.stringify({th:V.th,k:V.k})); }catch(e){} }
var KN={frame:'page',sec:'section',comp:'component'};
function shown(s){ return s.callouts.filter(function(c){ return V.k==='all'||c.kind===V.k; }); }
function nav(){ var h='<button class="pg'+(V.i<0?' on':'')+'" data-i="-1">Overview<em>'+M.P.length+' pages</em></button><hr>';
  M.P.forEach(function(p){ h+='<button class="pg" data-i="'+p.screens[0]+'">'+esc(p.p)+'<em>'+p.screens.length+'</em></button>';
    if(V.i>=0 && M.S[V.i].page===p.p) p.screens.forEach(function(i){ h+='<button class="vw'+(i===V.i?' on':'')+'" data-i="'+i+'">'+esc(M.S[i].view)+'<em>'+shown(M.S[i]).length+'</em></button>'; }); });
  $('.nav').innerHTML=h; }
function overview(){ var flow='<div class="flow"><b>The RO page</b> opens from <span>RO List (double-click)</span><span class="ar">·</span><span>the Technician page (it’s there, beside the list)</span><span class="ar">·</span><span>every page’s <b>ROs</b> tab</span><span class="ar">·</span><span>Open RO on Triage, Foreman, Parts, Warranty</span><span class="ar">·</span><span>Ctrl K</span></div>';
  var h='<div class="crumb"><h2>Parsec — every page</h2><span>'+M.S.length+' screens · '+M.S.reduce(function(a,s){return a+s.callouts.length},0)+' callouts</span></div><p class="job">Pick a page to see its views with every section and component called out. Point at a box or a row for what it does.</p>'+flow+'<div class="ov">';
  M.P.forEach(function(p){ var s=M.S[p.screens[0]], n=p.screens.reduce(function(a,i){return a+M.S[i].callouts.length},0);
    h+='<button class="card" data-i="'+p.screens[0]+'"><img src="'+s.img+'" alt=""><span class="c"><b>'+esc(p.p)+'</b><small>'+esc(p.job)+'</small><span class="chips">'+p.screens.map(function(i){return '<span>'+esc(M.S[i].view)+'</span>'}).join('')+'</span><small>'+n+' callouts</small></span></button>'; });
  $('.stage').innerHTML=h+'</div>'; $('.side').innerHTML='<h3>Legend</h3><div class="row k-frame"><span class="n">■</span><b>Page structure</b><small>The frame: header, list, pane, bars.</small></div><div class="row k-sec"><span class="n">■</span><b>Section</b><small>A block with a heading — most fold on the RO page.</small></div><div class="row k-comp"><span class="n">■</span><b>Component</b><small>A control or piece inside a section.</small></div><h3 style="margin-top:18px">Keys</h3><div class="row"><span class="n" style="background:var(--ink3)">←</span><b>Previous / next view</b><small>← → or [ ]</small></div><div class="row"><span class="n" style="background:var(--ink3)">/</span><b>Search every callout</b><small>names and what they do</small></div>'; }
function screen(){ var s=M.S[V.i], p=M.P.filter(function(x){return x.p===s.page})[0], C=shown(s);
  var h='<div class="crumb"><h2>'+esc(s.page)+'</h2><span>› '+esc(s.view)+'</span></div><p class="job">'+esc(p?p.job:'')+'</p>';
  if(p && p.screens.length>1) h+='<div class="vtabs">'+p.screens.map(function(i){return '<button class="'+(i===V.i?'on':'')+'" data-i="'+i+'">'+esc(M.S[i].view)+'</button>'}).join('')+'</div>';
  h+='<div class="legend"><span style="--k:var(--frame)"><i></i>Page structure</span><span style="--k:var(--sec)"><i></i>Section</span><span style="--k:var(--comp)"><i></i>Component</span></div>';
  h+='<div class="'+(s.phone?'phone':'')+'"><div class="shot" style="max-width:'+s.w+'px"><img src="'+s.img+'" alt="'+esc(s.page+' · '+s.view)+'">'+C.map(function(c,j){ return '<div class="co k-'+c.kind+'" data-j="'+j+'" style="left:'+(c.x/s.w*100)+'%;top:'+(c.y/s.h*100)+'%;width:'+(c.w/s.w*100)+'%;height:'+(c.h/s.h*100)+'%"><span class="pin">'+(j+1)+'</span></div>'; }).join('')+'<div class="tip" hidden></div></div></div>';
  $('.stage').innerHTML=h;
  $('.side').innerHTML='<h3>'+C.length+' callouts</h3>'+C.map(function(c,j){ return '<button class="row k-'+c.kind+'" data-j="'+j+'"><span class="n">'+(j+1)+'</span><b>'+esc(c.label)+'<em>'+KN[c.kind]+'</em></b><small>'+esc(c.desc||'')+'</small></button>'; }).join('');
  hl(V.sel); }
function hl(j){ $$('.co').forEach(function(e){ e.classList.toggle('on', +e.dataset.j===j); }); $$('.row[data-j]').forEach(function(e){ e.classList.toggle('on', +e.dataset.j===j); });
  var sh=$('.shot'); if(sh) sh.classList.toggle('dim', j!=null); }
function tip(j, ev){ var t=$('.tip'), s=M.S[V.i]; if(!t) return; if(j==null){ t.hidden=true; return; } var c=shown(s)[j]; t.innerHTML='<b>'+(j+1)+' · '+esc(c.label)+'</b>'+esc(c.desc||KN[c.kind]); t.hidden=false;
  var sh=$('.shot').getBoundingClientRect(), x=ev.clientX-sh.left+14, y=ev.clientY-sh.top+14; if(x+330>sh.width) x=Math.max(4,x-344); t.style.left=x+'px'; t.style.top=y+'px'; }
function draw(){ D.documentElement.setAttribute('data-th',V.th); $$('[data-th-b]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.thB===V.th)); }); $$('[data-k-b]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.kB===V.k)); });
  nav(); if(V.i<0) overview(); else screen(); }
function go(i, sel){ V.i=i; V.sel=sel==null?null:sel; draw(); $('.stage').scrollTop=0; if(sel!=null){ var r=$('.row[data-j="'+sel+'"]'); if(r) r.scrollIntoView({block:'center'}); var b=$('.co[data-j="'+sel+'"]'); if(b) b.scrollIntoView({block:'center'}); } }
D.addEventListener('click', function(e){ var t=e.target, b;
  if((b=t.closest('[data-th-b]'))){ V.th=b.dataset.thB; save(); draw(); return; }
  if((b=t.closest('[data-k-b]'))){ V.k=b.dataset.kB; V.sel=null; save(); draw(); return; }
  if((b=t.closest('.qr button'))){ go(+b.dataset.i, +b.dataset.j); $('.qr').hidden=true; return; }
  if((b=t.closest('[data-i]'))){ go(+b.dataset.i); return; }
  if((b=t.closest('[data-j]'))){ var j=+b.dataset.j; V.sel=V.sel===j?null:j; hl(V.sel); if(b.classList.contains('co')){ var r=$('.row[data-j="'+j+'"]'); if(r) r.scrollIntoView({block:'nearest'}); } else { var c=$('.co[data-j="'+j+'"]'); if(c) c.scrollIntoView({block:'center',behavior:'smooth'}); } return; }
  if(!t.closest('.q')) $('.qr').hidden=true; });
D.addEventListener('mouseover', function(e){ var b=e.target.closest('[data-j]'); if(!b){ if(V.sel==null) hl(null); return; } hl(+b.dataset.j); });
D.addEventListener('mousemove', function(e){ var b=e.target.closest('.co'); tip(b?+b.dataset.j:null, e); });
D.addEventListener('mouseout', function(e){ if(!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('[data-j]')) { hl(V.sel); tip(null); } });
$('.q input').addEventListener('input', function(){ var q=this.value.trim().toLowerCase(), r=$('.qr'); if(q.length<2){ r.hidden=true; return; } var L=[];
  M.S.forEach(function(s,i){ s.callouts.forEach(function(c,j){ if((c.label+' '+(c.desc||'')).toLowerCase().indexOf(q)>-1 && (V.k==='all'||c.kind===V.k)) L.push([i, shown(s).indexOf(c), c, s]); }); });
  r.innerHTML=L.length?L.slice(0,60).map(function(x){ return '<button data-i="'+x[0]+'" data-j="'+x[1]+'"><b>'+esc(x[2].label)+'</b><span style="color:var(--ink3);font-size:12px">'+esc(x[3].page)+' › '+esc(x[3].view)+'</span>'+(x[2].desc?'<small>'+esc(x[2].desc)+'</small>':'')+'</button>'; }).join(''):'<div style="padding:10px;color:var(--ink3)">Nothing called that.</div>'; r.hidden=false; });
D.addEventListener('keydown', function(e){ if(/INPUT|TEXTAREA/.test(e.target.tagName)) { if(e.key==='Escape'){ e.target.blur(); $('.qr').hidden=true; } return; }
  if(e.key==='/'){ e.preventDefault(); $('.q input').focus(); return; }
  if(e.key==='ArrowRight'||e.key===']'){ e.preventDefault(); go(Math.min(M.S.length-1, V.i+1)); } else if(e.key==='ArrowLeft'||e.key==='['){ e.preventDefault(); go(Math.max(-1, V.i-1)); } else if(e.key==='Escape'){ V.sel=null; hl(null); } });
draw();
"""
LOGO = '<svg class="lg" width="20" height="20" viewBox="-110 -110 220 220" aria-hidden="true"><circle class="c" r="14"/><circle cx="44" r="9.5"/><circle cx="-44" r="9.5"/><circle cx="22" cy="38" r="9.5"/><circle cx="-22" cy="38" r="9.5"/><circle cx="22" cy="-38" r="9.5"/><circle cx="-22" cy="-38" r="9.5"/></svg>'
HTML = ('<!doctype html><html lang="en" data-th="ivory"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Parsec site map</title><style>' + CSS + '</style></head><body><div class="app">'
        '<div class="bar"><h1>' + LOGO + 'Parsec <small>site map · 14.4</small></h1>'
        '<div class="q"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input placeholder="Find a section or component — / " aria-label="Find a section or component"><div class="qr" hidden></div></div>'
        '<div class="seg" role="group" aria-label="Callouts"><button data-k-b="all">All</button><button data-k-b="frame"><i style="background:var(--frame)"></i>Page</button><button data-k-b="sec"><i style="background:var(--sec)"></i>Sections</button><button data-k-b="comp"><i style="background:var(--comp)"></i>Components</button></div>'
        '<div class="seg" role="group" aria-label="Theme"><button data-th-b="ivory">Ivory</button><button data-th-b="graphite">Graphite</button></div></div>'
        '<div class="body"><nav class="nav" aria-label="Pages"></nav><main class="stage"></main><aside class="side"></aside></div></div>'
        '<script>var DATA=' + DATA + ';' + JS + '</script></body></html>')
open(OUT, "w", encoding="utf-8").write(HTML); open(os.path.join(H, "out.html"), "w", encoding="utf-8").write(HTML)
print("wrote", OUT, round(len(HTML) / 1e6, 2), "MB,", len(S), "screens,", sum(len(s["callouts"]) for s in S), "callouts")
