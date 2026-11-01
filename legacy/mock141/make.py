# Parsec · ideas for 14.1+ — the mock-up (one HTML, Ivory / Graphite, cards with options, Your picks)
import json, os, html
H = os.path.dirname(os.path.abspath(__file__))
OUT = "/mnt/user-data/outputs/Parsec ideas mock-up.html"
e = html.escape

# ---------- tiny visual building blocks (HTML strings) ----------
def st(tone, words, sub="", menu=False):
    ic = {"hold": '<circle cx="7" cy="7" r="5.25"/>', "run": '<circle cx="7" cy="7" r="5.25"/><path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor"/>',
          "wait": '<circle cx="7" cy="7" r="5.25" stroke-dasharray="2.3 1.82"/><circle cx="7" cy="7" r="1.75" fill="currentColor"/>',
          "done": '<circle cx="7" cy="7" r="5.25"/><path d="M4.6 7.1l1.6 1.6 3.2-3.4"/>', "bad": '<circle cx="7" cy="7" r="5.25"/><path d="M7 4.2v3.4"/><circle cx="7" cy="9.75" r=".95" fill="currentColor"/>'}
    tone2 = {"hold": "hold", "run": "run", "wait": "wait", "done": "run", "bad": "bad", "cust": "cust"}[tone]
    k = "wait" if tone == "cust" else tone
    return ('<%s class="pst t-%s%s">' % ("button" if menu else "span", tone2, " m" if menu else "")) + '<svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + ic[k] + "</svg>" + e(words) + (('<em>' + e(sub) + "</em>") if sub else "") + ("<i>▾</i>" if menu else "") + ("</button>" if menu else "</span>")

TRUCK = '<svg class="trk" viewBox="0 0 64 30" aria-hidden="true"><path d="M2 22h8V9h12l6 7h8v6h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><rect x="11" y="10" width="9" height="6" rx="1" fill="currentColor" opacity=".18"/><path d="M40 22h22V12H40z" fill="currentColor" opacity=".14"/><circle cx="12" cy="23" r="3.2" fill="var(--panel)" stroke="currentColor" stroke-width="1.6"/><circle cx="30" cy="23" r="3.2" fill="var(--panel)" stroke="currentColor" stroke-width="1.6"/><circle cx="52" cy="23" r="3.2" fill="var(--panel)" stroke="currentColor" stroke-width="1.6"/></svg>'
def row(no, cust, right="", sub=""):
    return '<div class="r">' + TRUCK + '<span class="no">' + e(no) + '</span><span class="c"><b>' + e(cust) + '</b>' + (('<small>' + sub + '</small>') if sub else "") + '</span><span class="rt">' + right + '</span></div>'
def btn(t, pri=False, sm=True): return '<span class="b%s%s">' % (" pri" if pri else "", " sm" if sm else "") + t + '</span>'
def kbd(t): return '<kbd>' + e(t) + '</kbd>'
def chk(t, on=True, muted=False): return '<div class="ck%s%s"><i></i>%s</div>' % (" on" if on else "", " mu" if muted else "", t)
def bar(p, tone="acc"): return '<span class="bar"><i class="t-%s" style="width:%d%%"></i></span>' % (tone, p)
def tag(t, tone="hold"): return '<span class="tg t-%s">%s</span>' % (tone, e(t))

# ---------- the ideas: (page, [ (key, title, why, visual, [(optkey, label, note)], ) ]) ----------
IDEAS = [
("Everywhere", [
 ("today", "Today — a home page per role", "The first thing you see is what needs you, not a list to scan.",
  '<div class="cols3"><div><h5>Jenna · writer</h5>' + row("7616", "Prairie Line", tag("call back", "wait"), "approval pending · 2 d") + row("8877", "Summit Freight", tag("release", "run"), "road test passed") + '</div><div><h5>Mike · tech</h5>' + row("8690", "Summit Freight", tag("on it", "run"), "Op 1 · 3:59 on the clock") + row("9333", "Granite State", tag("next", "hold"), "PM service · parts in") + '</div><div><h5>Ben · parts</h5>' + row("2804", "Harbor Point", tag("chase", "bad"), "backordered · 3 d") + row("8690", "Summit Freight", tag("stage", "run"), "clutch kit arrived") + '</div></div>',
  [("one", "One Today page", "the same page for everyone, cards by role"), ("strip", "A “Needs you” strip", "on top of each role’s own page"), ("land", "Just the landing", "sign-in opens the right page, no new page")]),
 ("palette", "Ctrl K does things", "Type what you want: release 8877, order 2804, clock in — one place, no hunting.",
  '<div class="pal"><div class="in">⌘ release 88<span class="cur"></span></div><div class="it on">' + TRUCK + '<b>Release RO 8877</b><small>Summit Freightways · road test passed · checks done</small>' + kbd("↵") + '</div><div class="it">' + TRUCK + '<b>Release RO 8838</b><small>Rick’s Freight · 2 checks open</small></div><div class="it mu"><b>Open RO 8877</b><small>the RO page</small></div></div>',
  [("inkb", "Actions in Ctrl K", "mixed with the search results, verbs first"), ("prefix", "A “>” prefix", "“> release 8877” — search stays search"), ("skipit", "Skip", "")]),
 ("eod", "Day-end close-out, per role", "The things that slip at 5 pm: ETRs, stories, receipts, tomorrow’s lineup.",
  '<div class="card"><h5>Before you sign out · Jenna</h5>' + chk("3 callbacks logged today") + chk("ETR updated on 2 ROs past their date", False) + chk("1 estimate not sent — RO 7616", False) + chk("Keys stored — all 24") + '<div class="ft">' + btn("Sign out anyway") + btn("Do these first", True) + '</div></div>',
  [("signout", "At sign-out", "a list in the sign-out dialog"), ("banner", "A banner 30 min before close", "and at sign-out"), ("today", "On the Today page only", ""), ("skipit", "Skip", "")]),
 ("sync", "Shared folder: autosave and a conflict notice", "Two people on the same RO from two computers shouldn’t silently overwrite each other.",
  '<div class="card warn"><b>Jenna changed RO 8877 at 2:14 pm</b><small>You both edited Op 2’s story. Yours: “Replaced NOx sensor…” · Hers: “Replaced outlet NOx sensor, cleared codes…”</small><div class="ft">' + btn("Keep mine") + btn("Take hers") + btn("See both", True) + '</div></div><div class="note2">Saved 12 s ago · every 30 s and on each change</div>',
  [("last", "Last write wins + an Activity line", "simple; you can see what happened"), ("ask", "Ask when both changed the same RO", "the card above"), ("lock", "Lock an RO while someone edits it", "others see “Jenna has it open”"), ("skipit", "Skip", "")]),
 ("type", "One type scale and spacing grid", "Sizes drift page to page (11–15 px, five greys). One ramp, one 4-px grid, a dark-contrast pass.",
  '<div class="ramp"><span style="font:500 26px/1 var(--serif)">Repair orders</span><span style="font:500 20px/1 var(--serif)">Operations</span><span style="font:600 14px/1 var(--sans)">Section title</span><span style="font:400 14px/1 var(--sans)">Body text</span><span style="font:500 12.5px/1 var(--sans);color:var(--ink2)">Label</span><span style="font:400 12px/1 var(--mono);color:var(--ink3)">RO-32818 · mono</span><span style="font:600 11px/1 var(--sans);letter-spacing:.06em;color:var(--ink3)">OVERLINE</span></div>',
  [("do", "Do the pass in 14.1", "type, spacing, dark contrast, one button set"), ("dark", "Only the dark-contrast fixes now", ""), ("skipit", "Skip", "")]),
]),
("RO list", [
 ("views", "Saved views", "Your filters, columns and sort under a name — one click back to “My late warranty ROs”.",
  '<div class="tabs"><span>Open <em>24</em></span><span>Mine <em>9</em></span><span class="on">★ Late warranty <em>3</em></span><span>★ Ready to release <em>7</em></span><span class="add">+ Save this view</span></div>' + row("4358", "Blue Ridge Haulers", st("run", "Complete – Road test"), "WARR · 14 d") + row("2200", "Great Lakes Bulk", st("run", "Complete – Road test"), "WARR · 13 d"),
  [("tabs", "Pinned as tabs", "next to Open / Mine"), ("menu", "In the Display menu", "a Views list"), ("skipit", "Skip", "")]),
 ("bulk", "Bulk actions", "Pick rows, then Set status, Assign, Transfer, Print or Export for all of them.",
  '<div class="selbar"><b>3 selected</b>' + btn("Set status…") + btn("Assign…") + btn("Transfer…") + btn("Print") + '<span class="sp"></span><small>Esc clears</small></div>' + row("9333", "Granite State Expr.", st("hold", "Hold tech"), "☑ selected") + row("5906", "Pinecrest Logistics", st("hold", "Hold tech"), "☑ selected") + row("7156", "Atlas Flatbed Co.", st("hold", "Hold tech"), "☑ selected"),
  [("box", "A checkbox column", "shown by Display or on hover"), ("shift", "Shift-click to pick", "no column; a bar appears"), ("skipit", "Skip", "")]),
]),
("Triage", [
 ("cust", "Customer status text or email", "Templates with the next step and ETR, logged as a contact — nothing leaves Parsec on its own.",
  '<div class="msg"><div class="to">To <b>Dale · Summit Freightways</b> · about unit T-354</div><p>Hi Dale, it’s Jenna at Vanguard. Unit T-354 (RO 8690): clutch is in, road test this afternoon. Ready to go about <b>Fri 9:30 am</b>. Reply if you want it staged outside.</p><div class="ft">' + btn("Copy text") + btn("Open in Mail") + btn("Log it as sent", True) + '</div></div>',
  [("copy", "Copy to the clipboard", "you paste it in your texting app"), ("mailto", "Open the mail app", "a mailto with the text filled in"), ("both", "Both", ""), ("skipit", "Skip", "")]),
 ("comeback", "Catch a comeback at New RO", "Same VIN back soon after release — reopen the RO as a comeback instead of a quiet new one.",
  '<div class="card warn"><b>This truck was here 11 days ago</b><small>4V4NC9EH7LN758560 · RO 8877 released Oct 17 · Clutch slipping — replace clutch · Mike</small><div class="ft">' + btn("Reopen 8877 as a comeback", True) + btn("New RO anyway") + btn("Open 8877") + '</div></div>',
  [("d30", "Within 30 days", ""), ("d90", "Within 90 days", "matches Assets’ repeat-repair rule"), ("always", "Always say when the VIN is known", "“here 4× before · last Sep 30”"), ("skipit", "Skip", "")]),
 ("release", "One release list", "Truck checks and Release ask the same things twice. One list, in order, with Hours and Story on it.",
  '<div class="card"><h5>Release · RO 8877 · Summit Freightways</h5>' + chk("All operations complete · 2 of 2") + chk("Story on every operation") + chk("Parts installed · 3 of 3") + chk("Hours · 9.4 h clocked of 9.5 sold") + chk("Road test · Pass · 11 mi") + chk("Walk-around · lights, tires, leaks", False) + chk("Keys back · tag 68", False) + chk("Customer told · ETR Fri 9:30", False) + '<div class="ft">' + btn("Release anyway…") + btn("Release", True) + '</div></div>',
  [("one", "One list", "Truck checks button opens the same list"), ("two", "Keep two, no repeats", "walk-around first, then release"), ("skipit", "Skip", "")]),
]),
("Technician", [
 ("done", "Done asks before it finishes", "Done takes an op with no story and 0:00 clocked. A soft prompt, not a wall.",
  '<div class="card"><b>Finish Op 2 — Driver side mirror?</b><small>No story yet · 0:00 clocked · 1 part not marked installed</small>' + chk("Mark Mirror assembly installed", True) + '<div class="ft">' + btn("Write the story") + btn("Finish anyway") + btn("Mark installed and finish", True) + '</div></div>',
  [("soft", "Soft prompt", "finish anyway is one click"), ("hard", "Hard stop for the story", "parts and time stay soft"), ("skipit", "Skip", "")]),
 ("pending", "Warn when the work isn’t approved", "An ASIST-Pending op can be clocked today. Say so before the clock starts.",
  '<div class="card warn"><b>Op 2 isn’t approved yet</b><small>ASIST says Pending · estimate sent Tue · Jenna is waiting on the customer</small><div class="ft">' + btn("Start anyway") + btn("Ask Jenna", True) + '</div></div>',
  [("warn", "Warn, then allow", ""), ("block", "Block until approved", "foreman can override"), ("skipit", "Skip", "")]),
 ("checkin", "Phone check-in, step by step", "Dash pic, four corners, damage, DTCs, key tag, spot — each a tap, in order, done in a minute.",
  '<div class="steps"><span class="on">1 Dash</span><span class="on">2 Front</span><span class="on">3 Left</span><span class="cur">4 Right</span><span>5 Rear</span><span>6 DTCs</span><span>7 Key tag</span><span>8 Spot</span></div><div class="cam"><span>Right side · tap to shoot</span></div>',
  [("guided", "Guided 8 steps", "skip any; the RO shows what’s missing"), ("free", "Free camera + a checklist", ""), ("skipit", "Skip", "")]),
]),
("Foreman", [
 ("skills", "Skills in Assign", "Aftertreatment to Mike, electrical to Dana — the pop sorts by fit, not just by who’s free.",
  '<div class="asg"><div class="p"><b>Dana Kowalski</b><small>' + tag("aftertreatment", "run") + tag("electrical", "run") + ' · 7.4 h free</small><em>best fit</em></div><div class="p"><b>Mike Rodriguez</b><small>' + tag("driveline", "run") + tag("aftertreatment", "hold") + ' · 2.1 h free</small></div><div class="p"><b>Luis Martinez</b><small>' + tag("PM", "run") + ' · did this fix 3×</small></div></div>',
  [("typed", "Skills typed on Team", "a checklist per tech"), ("learned", "Learned from past fixes", "who fixed what, how fast"), ("both", "Both", ""), ("skipit", "Skip", "")]),
 ("tv", "A shop board for the TV", "Bays, who’s on what, trucks waiting and ready — read-only, no sign-in, refreshes itself.",
  '<div class="board"><div><h5>Bays</h5><div class="bay on">B1 · Mike · 8690</div><div class="bay on">B3 · Dana · 2488</div><div class="bay">B4 · free</div><div class="bay on">UP · Luis · 7616</div></div><div><h5>Waiting <em>5</em></h5>' + row("9333", "Granite State", "", "parts in · PM") + row("5906", "Pinecrest", "", "hold tech") + '</div><div><h5>Ready to go <em>7</em></h5>' + row("1298", "Midway Auto", "", "Lot F1") + row("7677", "Evergreen", "", "Lot E6") + '</div></div>',
  [("full", "Bays + waiting + ready", ""), ("where", "Just “where’s my truck”", "the yard map, big"), ("skipit", "Skip", "")]),
]),
("Parts", [
 ("kits", "Kits from Fixes", "The op matches a past fix — its parts come as a kit, one click to order or pull.",
  '<div class="card"><b>Clutch slipping — replace clutch</b><small>Fixed 18× before · the same 3 parts 15 times</small>' + chk("VOL-85013702 · Clutch kit 15.5″ · 1") + chk("VOL-20518417 · Pilot bearing · 1") + chk("VOL-21899123 · Release bearing · 2") + '<div class="ft">' + btn("Add the kit") + btn("Order the kit", True) + '</div></div>',
  [("suggest", "Suggest the kit", "on the op; nothing added until you say"), ("auto", "Add it, then ask", "parts land as Not ordered"), ("skipit", "Skip", "")]),
 ("qr", "QR labels for key tags and bins", "Print a label; scan it with the phone to open the RO or the bin.",
  '<div class="lbl"><span class="qr"></span><div><b>Key tag 68</b><small>RO 8690 · Summit Freightways · T-354</small><small>scan → the RO</small></div></div><div class="lbl"><span class="qr"></span><div><b>Bin W4</b><small>Staged · 3 parts · RO 8690</small><small>scan → the bin</small></div></div>',
  [("keys", "Key tags", ""), ("bins", "Bins", ""), ("both", "Both", ""), ("skipit", "Skip", "")]),
]),
("Assets", [
 ("cover", "Coverage, PM due and recalls on the truck", "Know at check-in whether it’s warranty, what PM is due, and whether a campaign is open.",
  '<div class="card"><div class="cv"><b>Base vehicle</b><small>16 of 24 months · 97,000 of 250,000 mi</small>' + bar(67, "run") + '</div><div class="cv"><b>Emissions</b><small>16 of 60 months · 97,000 of 100,000 mi</small>' + bar(97, "bad") + '</div><div class="cv"><b>PM B due</b><small>in 3,100 mi or 2 weeks</small>' + bar(88, "wait") + '</div><div class="cv"><b>Recalls</b><small>' + tag("24V-118 open", "bad") + tag("23V-406 done", "run") + '</small></div></div>',
  [("cp", "Coverage + PM", "typed once per truck or read from ASIST"), ("rec", "+ a recall list", "the warranty desk keeps the list by model/VIN range"), ("skipit", "Skip", "")]),
]),
("Manager and Career", [
 ("cbk", "Comeback report", "Comebacks by tech, system and month, and what the rework cost.",
  '<div class="tbl"><div class="h"><span>System</span><span>Comebacks</span><span>Rework</span><span>Trend</span></div><div><span>Air and brakes</span><span>4</span><span>$2,310</span><span>' + bar(70, "bad") + '</span></div><div><span>Aftertreatment</span><span>3</span><span>$1,880</span><span>' + bar(45, "wait") + '</span></div><div><span>Electrical</span><span>1</span><span>$315</span><span>' + bar(15, "run") + '</span></div></div>',
  [("tile", "A KPI tile with a drill", "on Manager"), ("report", "A report linked to Fixes", "each comeback points at the fix that didn’t hold"), ("both", "Both", ""), ("skipit", "Skip", "")]),
 ("coach", "A weekly coaching card", "One page per tech: efficiency, the ops that ran over, three wins, one thing to try — the foreman adds a line.",
  '<div class="card"><h5>Mike · week of Oct 20</h5><div class="kp"><span><b>118%</b><small>efficiency</small></span><span><b>2</b><small>ops over quote</small></span><span><b>0</b><small>comebacks</small></span></div>' + chk("Clutch on 8690 — 1.1 h under") + chk("Story written on every op") + chk("NOx sensor on 2488 — 0.8 h over · parts wait", False, True) + '<div class="ft"><small>Frank: “Call Ben before you start the DPF job.”</small>' + btn("Print") + '</div></div>',
  [("weekly", "Every Monday, on Career", ""), ("ask", "On request", "a button on Career and Team"), ("skipit", "Skip", "")]),
 ("jacket", "The job jacket, printed", "Cover, ops with stories, parts, photos, road test, checks — one print pack per RO.",
  '<div class="pages"><div><b>RO 8877</b><small>cover · truck · customer</small></div><div><b>Ops</b><small>stories · time</small></div><div><b>Parts</b><small>3 · $1,620</small></div><div><b>Photos</b><small>6</small></div><div><b>Release</b><small>road test · checks</small></div></div>',
  [("menu", "In the RO page’s print menu", ""), ("auto", "Offered at release", ""), ("both", "Both", ""), ("skipit", "Skip", "")]),
]),
]

NEW14 = [("Assets", "every truck and its history — repeat repairs flagged, miles and hours over time"),
         ("Statuses", "one look everywhere: icon + word to read, an outlined pill only where it changes"),
         ("Road test switch", "off → no road test, no truck checks, Complete when the last op is done"),
         ("ASIST approvals", "Approved in ASIST now counts in Parsec — Parts and Triage pick the RO up"),
         ("Sent to you", "road test asks and notes land on the Technician page"),
         ("Costs read", "labor rate, parts, shop supplies, core, list/net and the engine serial from the import")]

CSS = open(os.path.join(H, "mock.css"), encoding="utf-8").read()

def card_html(page, k, title, why, vis, opts):
    o = "".join('<button class="opt" data-k="%s" data-v="%s" aria-pressed="false"><i></i><span><b>%s</b>%s</span></button>' % (k, ok, e(lab), ('<small>' + e(note) + '</small>') if note else "") for ok, lab, note in opts)
    return '<article class="idea" id="i-%s"><header><h3>%s</h3><p>%s</p></header><div class="vis">%s</div><div class="ol">%s</div></article>' % (k, e(title), e(why), vis, o)

secs = []
for page, items in IDEAS:
    secs.append('<section class="sec"><h2>%s <small>%d idea%s</small></h2><div class="grid">%s</div></section>' % (e(page), len(items), "" if len(items) == 1 else "s", "".join(card_html(page, *it) for it in items)))
new = "".join('<div><b>%s</b><span>%s</span></div>' % (e(a), e(b)) for a, b in NEW14)
DATA = json.dumps([[p, [[it[0], it[1], [[o[0], o[1]] for o in it[4]]] for it in items]] for p, items in IDEAS])

HTML = '''<!doctype html>
<html lang="en" data-th="ivory">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec · ideas for 14.1</title>
<style>''' + CSS + '''</style></head>
<body>
<div class="mk"><h1><svg class="lg" viewBox="-110 -110 220 220" aria-hidden="true"><circle class="c" r="14"/><circle cx="44" r="9.5"/><circle cx="-44" r="9.5"/><circle cx="22" cy="38" r="9.5"/><circle cx="-22" cy="38" r="9.5"/><circle cx="22" cy="-38" r="9.5"/><circle cx="-22" cy="-38" r="9.5"/><circle cy="-84" r="7" class="o"/><circle cy="84" r="7" class="o"/><circle cx="73" cy="42" r="7" class="o"/><circle cx="-73" cy="42" r="7" class="o"/><circle cx="73" cy="-42" r="7" class="o"/><circle cx="-73" cy="-42" r="7" class="o"/></svg>Parsec <small>ideas for 14.1 — mock-up</small></h1>
<nav class="jump">''' + "".join('<a href="#s-%d">%s</a>' % (i, e(p)) for i, (p, _) in enumerate(IDEAS)) + '''</nav>
<div class="seg" role="group" aria-label="Theme"><button data-th="ivory" aria-pressed="true">Ivory</button><button data-th="graphite" aria-pressed="false">Graphite</button></div>
<button class="btn sm pri" id="pk-open">Your picks <em id="pk-n"></em></button></div>
<main class="wrap">
<section class="new14"><h2>What’s new in 14 you may have missed</h2><div class="strip">''' + new + '''</div></section>
<p class="lead">21 ideas, by page. Pick an option on each — or Skip — then copy Your picks into the chat.</p>
''' + "".join(s.replace('<section class="sec">', '<section class="sec" id="s-%d">' % i, 1) for i, s in enumerate(secs)) + '''
</main>
<div id="picks" hidden></div>
<script>
var D=document,$=function(s,r){return (r||D).querySelector(s)},$$=function(s,r){return [].slice.call((r||D).querySelectorAll(s))};
var DATA=''' + DATA + ''';
var V={th:'ivory',picks:false,v:{},note:''};
try{ var sv=JSON.parse(localStorage.getItem('pk141')||'{}'); if(sv.v) V.v=sv.v; if(sv.note) V.note=sv.note; if(sv.th) V.th=sv.th; }catch(e){}
function save(){ try{ localStorage.setItem('pk141',JSON.stringify({v:V.v,note:V.note,th:V.th})); }catch(e){} }
function esc(t){ return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]}); }
function pkText(){ var L=['Parsec · ideas for 14.1 — my picks'], n=0;
  DATA.forEach(function(sec){ var rows=[]; sec[1].forEach(function(it){ var v=V.v[it[0]]; if(!v) return; var lab=(it[2].filter(function(o){return o[0]===v})[0]||[])[1]||v; if(v==='skipit'){ rows.push('· '+it[1]+': skip'); return; } n++; rows.push('· '+it[1]+': '+lab); });
    if(rows.length){ L.push(sec[0]+':'); L=L.concat(rows); } });
  var left=DATA.reduce(function(a,s){return a+s[1].filter(function(it){return !V.v[it[0]]}).length},0);
  if(left) L.push('(not picked yet: '+left+')');
  if(V.note.trim()) L.push('Notes: '+V.note.trim());
  return L.join('\\n'); }
function sync(){ $$('.mk button[data-th]').forEach(function(b){ b.setAttribute('aria-pressed',String(b.getAttribute('data-th')===V.th)); }); D.documentElement.setAttribute('data-th',V.th);
  $$('.opt').forEach(function(b){ b.setAttribute('aria-pressed',String(V.v[b.getAttribute('data-k')]===b.getAttribute('data-v'))); });
  $$('.idea').forEach(function(a){ a.classList.toggle('picked',!!V.v[a.id.slice(2)]); });
  var n=Object.keys(V.v).length, t=DATA.reduce(function(a,s){return a+s[1].length},0); $('#pk-n').textContent=n?n+'/'+t:''; }
function pkDraw(){ var w=$('#picks'); w.hidden=!V.picks; if(!V.picks) return; var ta=$('#pk-note'); if(ta&&D.activeElement===ta){ $('#picks pre').textContent=pkText(); return; }
  w.innerHTML='<div class="pk-h"><b>Your picks</b><button class="x" data-pk="x" aria-label="Close">✕</button></div><pre>'+esc(pkText())+'</pre><div class="pk-r"><span>Anything else</span><textarea id="pk-note" placeholder="e.g. the TV board goes in the parts room too">'+esc(V.note)+'</textarea></div><button class="btn pri" data-pk="copy">Copy for the chat</button>'; }
function toast(m){ var t=$('.toast'); if(t) t.remove(); t=D.createElement('div'); t.className='toast'; t.textContent=m; D.body.appendChild(t); clearTimeout(toast.h); toast.h=setTimeout(function(){t.remove()},2600); }
D.addEventListener('click',function(ev){ var t=ev.target,b;
  if((b=t.closest('.mk button[data-th]'))){ V.th=b.getAttribute('data-th'); save(); sync(); return; }
  if(t.closest('#pk-open')){ V.picks=!V.picks; pkDraw(); return; }
  if((b=t.closest('[data-pk]'))){ var a=b.getAttribute('data-pk'); if(a==='x'){ V.picks=false; pkDraw(); }
    if(a==='copy'){ var tx=pkText(); (navigator.clipboard?navigator.clipboard.writeText(tx):Promise.reject()).then(function(){toast('Copied — paste it in the chat.')},function(){ var ta=D.createElement('textarea'); ta.value=tx; D.body.appendChild(ta); ta.select(); try{ D.execCommand('copy'); toast('Copied — paste it in the chat.'); }catch(er){} ta.remove(); }); } return; }
  if((b=t.closest('.opt'))){ var k=b.getAttribute('data-k'), v=b.getAttribute('data-v'); if(V.v[k]===v) delete V.v[k]; else V.v[k]=v; save(); sync(); if(V.picks) pkDraw(); return; }
});
D.addEventListener('input',function(ev){ if(ev.target.id==='pk-note'){ V.note=ev.target.value; save(); var p=$('#picks pre'); if(p) p.textContent=pkText(); } });
D.addEventListener('keydown',function(ev){ if(ev.key==='Escape'&&V.picks){ V.picks=false; pkDraw(); } });
sync();
</script>
</body></html>'''
open(OUT, "w", encoding="utf-8").write(HTML)
open(os.path.join(H, "out.html"), "w", encoding="utf-8").write(HTML)
print("wrote", OUT, len(HTML) // 1024, "KB")
