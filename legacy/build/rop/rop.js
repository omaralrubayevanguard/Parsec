/* Mock-up: the RO page (opened from the RO list) — every block can move, go, or be added. */
(function(){
var D = document, $ = function(s, r){ return (r || D).querySelector(s); }, $$ = function(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
function ic(k, s){ return '<svg class="ic"' + (s ? ' style="width:' + s + 'px;height:' + s + 'px"' : '') + ' viewBox="0 0 24 24" aria-hidden="true">' + (IC[k] || "") + "</svg>"; }
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function av(n){ return '<span class="av">' + n.split(" ").map(function(w){ return w[0]; }).join("") + "</span>"; }
function grp(t, sum, rows, act, open){ return '<details class="grp"' + (open === false ? "" : " open") + '><summary>' + ic("chevD", 12) + "<b>" + t + "</b>" + (sum ? "<small>" + sum + "</small>" : "") + (act || "") + "</summary>" + rows.map(function(r){ return '<div class="pr"><span>' + r[0] + "</span><b" + (r[2] ? ' class="' + r[2] + '"' : "") + ">" + r[1] + "</b></div>"; }).join("") + "</details>"; }
function card(t, sub, body, act){ return '<section class="cd"><div class="cd-h"><b>' + t + "</b>" + (sub ? "<small>" + sub + "</small>" : "") + '<span class="sp"></span>' + (act || "") + '</div><div class="cd-b">' + body + "</div></section>"; }

/* ---------- the blocks: what's on the page today, and new ones carried over from other pages ---------- */
var B = {
  band: { n: "Truck & status", now: 1, d: "Customer, truck, status, who has it", r: function(){
    var pic = V.pic === "off" ? "" : '<div class="bd-p ' + V.pic + '"><img src="' + IMG.s + '" alt=""><button class="cam" title="Truck & photos">' + ic("camera", 14) + "</button></div>";
    return '<section class="bd' + (V.pic === "small" ? " sm" : V.pic === "off" ? " off" : "") + '"><div class="bd-t"><div class="eb"><span class="mono">RO-37218</span><i>·</i>Opened Oct 13<i>·</i>13 days open</div><h2>Prairie Line Trucking</h2><div class="sub">2022 Volvo VNR 400 · Unit T-283</div><div class="srow"><button class="st"><i class="dt wt"></i>Waiting – Customer<span>· Approval pending</span>' + ic("chevD", 12) + '</button><span class="who">with ' + av("Jenna Cho") + "Jenna Cho · 13d 8h</span></div></div>" + pic + "</section>"; } },
  stages: { n: "Stage bar", now: 1, d: "Check-in to Close-out, where it is now", r: function(){
    var S = [["Check-in", "d"], ["Diag", "d"], ["Approval", "n"], ["Parts", ""], ["Repair", ""], ["Road test", ""], ["Close-out", ""]];
    return '<section class="sg"><div class="sg-h"><b>Approval</b><span>· stage 3 of 7 · waiting on the customer · 13d</span><span class="sp"></span><small>Ready about Tomorrow 1:26 pm</small></div><div class="sg-b">' + S.map(function(s){ return '<span class="' + s[1] + '"><i></i>' + s[0] + "</span>"; }).join("") + "</div></section>"; } },
  ops: { n: "Operations", now: 1, d: "Each operation: its time, parts, notes and files", r: function(){
    var op1h = '<div class="op on"><span class="os wt"></span><span class="on1">1</span><b>Check engine light - NOx sensor fault SPN 3226</b><span class="ty dg">DIAG</span><span class="hb"><span class="mono">1.50 / 1.50 h</span><span class="bar"><i style="width:100%"></i></span></span>' + av("Luis Martinez") + "</div>";
    var tabs = '<div class="opx"><div class="opx-t"><span>Check engine light - NOx sensor fault SPN 3226</span><span class="chip">+ code</span><span class="chip ok">Fixed 19× before</span><button class="st sm"><i class="dt wt"></i>Waiting – Approval</button></div>'
      + '<div class="tm"><div class="tm-a"><b class="mono">1:30:00</b><small>On this operation · 1 entry</small></div><button class="play" title="Start">' + ic("play", 16) + '</button><div class="tm-bar"><i style="width:100%"></i></div><div class="tm-n"><span>Quoted<b>1.50<small> h</small></b></span><span>Burnt<b>1.50<small> h</small></b></span><span>Left<b class="w">0.00<small> h</small></b></span><span>Efficiency<b class="g">100<small> %</small></b></span></div></div>';
    if(V.opv === "tabs") tabs += '<div class="tb"><button>Time <i>1</i></button><button class="on">Parts</button><button>Notes <i>1</i></button><button>Files</button></div><div class="tb-b"><button class="lk">' + ic("plus", 13) + 'Add part</button><button class="lk">' + ic("parts", 13) + 'From inventory…</button><button class="lk">' + ic("note", 13) + "Extract from a quote…</button></div></div>";
    else tabs += '<div class="tg3"><div class="sec"><div class="sh"><b>Notes</b><small>Enter adds the time</small></div><div class="nl"><small class="mono">Oct 13 10:41</small><span>Code active, sensor reads erratic at idle. Wiring checks out.</span></div><div class="nl"><small class="mono">Cause</small><span>Outlet NOx sensor failed — internal fault.</span></div><input class="in" placeholder="What you found, what you did…"></div>'
      + '<div class="sec"><div class="sh"><b>Time</b><small>1 punch</small></div><div class="pu"><span><span class="dm">Oct 13</span>9:57 am – 11:27 am</span><b class="mono">1:30</b><small>Luis · Diagnosing → Waiting – Approval</small></div></div>'
      + '<div class="sec"><div class="sh"><b>Parts</b><small>none on this one</small></div><p class="none">Op 2 has the sensor.</p><button class="lk">' + ic("plus", 13) + "Add part</button></div></div></div>";
    var op2 = '<div class="op"><span class="os pt"></span><span class="on1">2</span><b>Replace outlet NOx sensor</b><span class="nt">1 part not ordered</span><span class="ty wa">WARR</span><span class="hb"><span class="mono">0.00 / 1.20 h</span><span class="bar"><i style="width:0"></i></span></span>' + av("Luis Martinez") + "</div>";
    return '<section class="ops"><div class="sec-h"><h3>Operations</h3><span class="n">2</span><span class="sp"></span><button class="lk">' + ic("plus", 13) + "Add operation</button></div>" + op1h + tabs + op2 + "</section>"; } },
  activity: { n: "Activity & notes", now: 1, d: "What happened on the RO, and a note box", r: function(){
    var E = [["Today 9:21", av("Jenna Cho"), "<b>Jenna</b> called the customer — no answer, trying again at 2."], ["Oct 13 11:27", av("Luis Martinez"), "<b>Luis</b> stopped Op 1 · Waiting – Approval"], ["Oct 13 11:30", '<span class="evd">' + ic("note", 13) + "</span>", "<b>Estimate</b> sent to Prairie Line — $1,115.00"], ["Oct 13 9:21", '<span class="evd">' + ic("ros", 13) + "</span>", "<b>You</b> created RO-37218"]];
    return '<section class="act"><div class="sec-h"><h3>Activity</h3></div>' + E.map(function(e){ return '<div class="ev">' + e[1] + "<span>" + e[2] + '</span><time>' + e[0] + "</time></div>"; }).join("") + '<label class="cmp">' + ic("chat", 14) + '<input placeholder="Leave a note…"><button class="lk">Send</button></label></section>'; } },
  next: { n: "Next step", now: 1, d: "The one thing to do next, and who does it", r: function(){
    return '<section class="nx"><small>Next</small><b>Order 1 part — NOx sensor - outlet.</b><span>Ready about Tue, Oct 27 1:26 pm</span><button class="btn pri">Parts</button></section>'; } },
  schedule: { n: "Schedule", now: 1, d: "Ready about, promised, days open", r: function(){ return grp("Schedule", "", [["Ready about", "Tomorrow 1:26 pm"], ["Promised", "Add date", "mu"], ["Days open", "13"]]); } },
  people: { n: "People", now: 1, d: "Technician, advisor, Transfer", r: function(){ return grp("People", "", [["Technician", av("Luis Martinez") + "Luis Martinez"], ["Advisor", av("Jenna Cho") + "Jenna Cho"]], '<span class="ga">Transfer…</span>'); } },
  vehicle: { n: "Vehicle", now: 1, d: "VIN, unit, model, year, miles, key tag, spot", r: function(){ return grp("Vehicle", "", [["VIN", '<span class="mono">4V4NC9EH5NN102571</span>'], ["Unit", "T-283"], ["Model", "VNR 400"], ["Model year", "2022 · VIN", "mu"], ["Mileage", "142,000 mi"], ["Engine hours", "21,450 h"], ["Key tag", "60"], ["Location", "Yard C3"]]); } },
  paperwork: { n: "Paperwork", now: 1, d: "Opened, case, PO, warranty", r: function(){ return grp("Paperwork", "Opened Oct 13 · case 31958221", [["Opened", "Oct 13, 9:21 am"], ["Case", '<span class="mono">31958221</span>'], ["PO", "Add PO", "mu"], ["Warranty RO", "Op 2 only"]], "", false); } },
  money: { n: "Money", now: 1, d: "Labor, parts, total", r: function(){ return grp("Money", "$1,115.00", [["Labor", "2.70 h × $210 · $567.00"], ["Parts", "$548.00"], ["Total", "$1,115.00"]], "", false); } },
  /* new — carried over from other pages */
  blocker: { n: "Who has it", src: "Parsec 10 blocker aging", d: "Who it's waiting on, for how long, Nudge", r: function(){
    return card("Who has it", "", '<div class="wh">' + av("Jenna Cho") + '<div><b>Waiting on the customer — approval</b><small>Jenna sent the estimate Oct 13 · follow up after 4 h</small></div></div><div class="row"><button class="btn sm">' + ic("chat", 13) + 'Nudge Jenna</button><button class="btn sm">It’s approved</button></div>', '<span class="age b" title="Follow up after 4 h — overdue">13d 8h</span>'); } },
  parts: { n: "Parts on this RO", src: "Parts page", d: "Every part on every operation, with its status", r: function(){
    var P = [["NOx sensor - outlet", "22303390", "Op 2", "wt", "Not ordered"], ["Sensor gasket", "20460853", "Op 2", "wt", "Not ordered"]];
    return card("Parts on this RO", "0 of 2 in hand", P.map(function(p){ return '<div class="ptr"><span><b>' + p[0] + '</b><small class="mono">' + p[1] + " · " + p[2] + '</small></span><span class="pp ' + p[3] + '"><i></i>' + p[4] + "</span></div>"; }).join("") + '<button class="lk">' + ic("plus", 13) + "Ask Parts to order</button>"); } },
  photos: { n: "Photos & codes", src: "Console · Technician", d: "Dash picture, pictures, DTC files, notes on the truck", r: function(){
    return card("Photos & codes", "on the RO", '<div class="ph"><span class="th">' + ic("camera", 16) + '<small>Dash</small></span><span class="th i1"></span><span class="th i2"></span><span class="th i3"></span><span class="th fl">' + ic("clip", 14) + '<small>DTCs</small></span></div><div class="row"><button class="btn sm">' + ic("camera", 13) + 'Add photos</button><button class="btn sm gh">2 notes on the truck</button></div>'); } },
  history: { n: "Truck history", src: "RO list · Fixes", d: "Past visits for this unit and VIN", r: function(){
    var H = [["RO-34410", "Jul 2", "DPF clean and filter", "2.4 h", ""], ["RO-31120", "Feb 18", "PM service — B", "2.0 h", ""], ["RO-29987", "Nov 2025", "NOx sensor inlet — SPN 3226", "1.6 h", "same code"]];
    return card("Truck history", "Unit T-283 · 3 visits", H.map(function(h){ return '<div class="hr"><span class="mono">' + h[0] + "</span><span><b>" + h[2] + "</b><small>" + h[1] + " · " + h[3] + "</small></span>" + (h[4] ? '<span class="tag w">' + h[4] + "</span>" : "") + "</div>"; }).join("")); } },
  estimate: { n: "Estimate & approval", src: "Triage · Money", d: "What was quoted, and whether it's approved", r: function(){
    return card("Estimate & approval", "sent Oct 13", '<div class="es"><span>Op 1 · Diagnosis</span><b>$315.00</b><span>Op 2 · NOx sensor, 1.2 h</span><b>$252.00</b><span>Parts</span><b>$548.00</b><span class="t">Total</span><b class="t">$1,115.00</b></div><div class="row"><span class="tag w">No answer · 13d</span><span class="sp"></span><button class="btn sm">Send again</button><button class="btn sm pri">Mark approved</button></div>'); } },
  timeline: { n: "Time on this RO", src: "Time Log", d: "Every punch, every tech, by day", r: function(){
    return card("Time on this RO", "1.50 of 2.70 h", '<div class="tl"><span class="d">Oct 13</span><span class="tr"><i style="left:22%;width:20%" title="Luis · 9:57–11:27"></i></span><b class="mono">1:30</b></div><div class="tl"><span class="d">Today</span><span class="tr"></span><b class="mono">0:00</b></div><div class="tlx"><span>6 am</span><span>12 pm</span><span>6 pm</span></div>'); } },
  readiness: { n: "Ready to close", src: "Parsec 10 readiness", d: "What's left before it can be released", r: function(){
    var C = [[1, "Unit connected · DTCs read"], [1, "Dash picture"], [0, "Cause and correction on every operation · 1 of 2"], [0, "Parts installed · 0 of 2"], [0, "Road test"], [0, "RO released"]];
    return card("Ready to close", "2 of 6", '<div class="rd"><span class="bar"><i style="width:33%"></i></span></div>' + C.map(function(c){ return '<div class="ck' + (c[0] ? " ok" : "") + '">' + (c[0] ? ic("check", 13) : "<i></i>") + "<span>" + c[1] + "</span></div>"; }).join("")); } },
  inbox: { n: "Messages about this RO", src: "Inbox", d: "Notes people sent each other about it", r: function(){
    return card("Messages about this RO", "3", '<div class="ms">' + av("Jenna Cho") + '<div><b>Jenna → Luis</b><small>Customer hasn’t answered — calling again at 2.</small></div><time>9:21</time></div><div class="ms">' + av("Luis Martinez") + '<div><b>Luis → Ben (Parts)</b><small>Need the outlet NOx sensor once it’s approved.</small></div><time>Oct 13</time></div><label class="cmp">' + ic("chat", 14) + '<input placeholder="Message about RO-37218…"></label>'); } },
  dtc: { n: "Fault codes", src: "Fixes", d: "Codes read off the truck, with the usual fix", r: function(){
    return card("Fault codes", "2 read Oct 13", '<div class="dc"><span class="mono">SPN 3226 · FMI 2</span><span><b>Outlet NOx sensor — erratic</b><small>Active · 14 times · usual fix: replace outlet sensor</small></span><span class="tag w">Active</span></div><div class="dc"><span class="mono">SPN 4364 · FMI 18</span><span><b>SCR conversion efficiency low</b><small>Inactive · follows 3226</small></span><span class="tag">Inactive</span></div>'); } },
  warranty: { n: "Warranty claim", src: "Warranty page", d: "The claim for warranty operations", r: function(){
    return card("Warranty claim", "Op 2 · WARR", '<div class="wa"><span class="tag w">Not filed</span><span>Needs: failed part photo · cause · correction</span></div><div class="row"><button class="btn sm">Start the claim</button></div>'); } },
  customer: { n: "Customer", src: "RO list", d: "Who to call, and their other open ROs", r: function(){
    return card("Customer", "", '<div class="cu"><b>Prairie Line Trucking</b><small>Dale Harmon · dispatch · (336) 555-0142</small></div><div class="hr"><span class="mono">RO-37301</span><span><b>Unit T-290 · Working</b><small>Coolant leak at water pump</small></span></div>'); } }
};
var ORDER = ["band", "stages", "ops", "activity", "next", "schedule", "people", "vehicle", "paperwork", "money", "blocker", "parts", "photos", "history", "estimate", "timeline", "readiness", "inbox", "dtc", "warranty", "customer"];
var PRE = {
  today: { n: "As today", L: [], M: ["band", "stages", "ops", "activity"], R: ["next", "schedule", "people", "vehicle", "paperwork", "money"] },
  work: { n: "Work first", L: [], M: ["stages", "ops", "parts", "activity"], R: ["band", "next", "blocker", "people", "schedule", "vehicle", "money"] },
  three: { n: "Three columns", L: ["band", "vehicle", "people", "schedule", "history"], M: ["stages", "ops", "activity"], R: ["next", "blocker", "parts", "photos", "money"] },
  desk: { n: "Writer’s desk", L: [], M: ["band", "blocker", "estimate", "ops", "inbox"], R: ["next", "customer", "people", "schedule", "money", "paperwork"] }
};
var COLS = [["L", "Left"], ["M", "Middle"], ["R", "Right"]];
var V = { pre: "today", C: null, opv: "tabs", pic: "big", edit: true, note: "", hist: [], drawer: false, picks: false };
function setPre(k){ V.pre = k; V.C = { L: PRE[k].L.slice(), M: PRE[k].M.slice(), R: PRE[k].R.slice() }; }
setPre("today");
function where(k){ for(var c in V.C) if(V.C[c].indexOf(k) > -1) return c; return null; }
function snap(){ V.hist.push(JSON.stringify({ C: V.C, pre: V.pre, opv: V.opv, pic: V.pic })); if(V.hist.length > 40) V.hist.shift(); }
function undo(){ var h = V.hist.pop(); if(!h) return; var x = JSON.parse(h); V.C = x.C; V.pre = x.pre; V.opv = x.opv; V.pic = x.pic; draw(); toast("Undone"); }
function place(k, col, i){ snap(); for(var c in V.C){ var j = V.C[c].indexOf(k); if(j > -1) V.C[c].splice(j, 1); } if(col){ var L = V.C[col]; L.splice(i == null || i > L.length ? L.length : i, 0, k); } V.pre = null; draw(); }

/* ---------- drawing ---------- */
function tools(k, c, i){
  var L = V.C[c], ci = "LMR".indexOf(c);
  return '<div class="bt" role="toolbar" aria-label="' + esc(B[k].n) + '"><span class="grip" draggable="true" data-drag="' + k + '" title="Drag to move">' + ic("grip", 14) + '</span><b>' + esc(B[k].n) + "</b>"
    + '<button data-mv="L" data-k="' + k + '" title="To the column on the left"' + (ci === 0 ? " disabled" : "") + '>' + ic("chevL", 13) + "</button>"
    + '<button data-mv="U" data-k="' + k + '" title="Up"' + (i === 0 ? " disabled" : "") + '>' + ic("chevU", 13) + "</button>"
    + '<button data-mv="D" data-k="' + k + '" title="Down"' + (i === L.length - 1 ? " disabled" : "") + '>' + ic("chevD", 13) + "</button>"
    + '<button data-mv="R" data-k="' + k + '" title="To the column on the right"' + (ci === 2 ? " disabled" : "") + '>' + ic("chevR", 13) + "</button>"
    + '<button data-mv="X" data-k="' + k + '" title="Take it off the page">' + ic("x", 13) + "</button></div>"; }
function col(c){
  var L = V.C[c], show = L.length || c === "M" || D.body.classList.contains("dragging");
  if(!show) return "";
  return '<div class="col c' + c + (L.length ? "" : " empty") + '" data-col="' + c + '">' + L.map(function(k, i){ return '<div class="blk' + (B[k].now ? "" : " new") + '" data-k="' + k + '">' + (V.edit ? tools(k, c, i) : "") + B[k].r() + "</div>"; }).join("") + (L.length ? "" : '<div class="drop-hint">Drop a block here</div>') + "</div>"; }
function topbar(){
  return '<div class="tb0"><span class="crumb">RO list<i>/</i><b class="mono">RO-37218</b></span><button class="ib0" title="Previous">' + ic("chevU", 14) + '</button><button class="ib0" title="Next">' + ic("chevD", 14) + '</button><small>10 of 20</small><span class="sp"></span><span class="q">' + ic("clock", 14) + '<b class="mono">1.50</b> / 2.70 h</span><span class="q">' + ic("parts", 14) + '<b class="mono">0</b> / 2</span><span class="q">' + ic("clip", 14) + '<b class="mono">0</b></span><i class="sep"></i><button class="ib0">' + ic("link", 14) + '</button><button class="ib0">' + ic("print", 14) + '</button><button class="ib0">' + ic("more", 14) + "</button></div>"; }
function page(){
  var n = (V.C.L.length ? 1 : 0) + 2, three = V.C.L.length || (V.drawer && false);
  return topbar() + '<div class="cols' + (V.C.L.length || D.body.classList.contains("dragging") ? " three" : "") + (V.edit ? " editing" : "") + '">' + col("L") + col("M") + col("R") + "</div>"; }
function drawerHtml(){
  if(!V.drawer) return "";
  var row = function(k){ var w = where(k); return '<div class="dr-r' + (B[k].now ? "" : " new") + '"><div class="dr-t"><b>' + esc(B[k].n) + "</b>" + (B[k].now ? "" : '<span class="nw">New</span>') + "<small>" + esc(B[k].d) + (B[k].src ? " · from " + esc(B[k].src) : "") + '</small></div><div class="seg sm">' + COLS.map(function(c){ return '<button data-put="' + c[0] + '" data-k="' + k + '" aria-pressed="' + (w === c[0]) + '">' + c[1] + "</button>"; }).join("") + '<button data-put="" data-k="' + k + '" aria-pressed="' + (!w) + '">Off</button></div></div>'; };
  return '<aside class="dr" aria-label="Blocks"><div class="dr-h"><b>Blocks</b><small>Put each one where you want it</small><button class="x" data-dr="x" aria-label="Close">' + ic("x", 15) + '</button></div><div class="dr-g">On the RO page today</div>' + ORDER.filter(function(k){ return B[k].now; }).map(row).join("") + '<div class="dr-g">New — carried over from other pages</div>' + ORDER.filter(function(k){ return !B[k].now; }).map(row).join("") + "</aside>"; }
function draw(){
  var y = $("#pg") ? $("#pg").scrollTop : 0;
  $("#pg").innerHTML = page();
  $("#drw").innerHTML = drawerHtml();
  $("#pg").scrollTop = y;
  sync(); if(V.picks) pkDraw();
}
function sync(){
  $$("[data-pre]").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-pre") === V.pre); });
  $$("[data-opv]").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-opv") === V.opv); });
  $$("[data-pic]").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-pic") === V.pic); });
  var th = D.documentElement.getAttribute("data-th"); $$("button[data-th]").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-th") === th); });
  $("#edt").setAttribute("aria-pressed", V.edit); $("#blk-open").setAttribute("aria-pressed", V.drawer);
  $("#und").disabled = !V.hist.length;
}
function toast(m){ var t = $(".toast"); if(t) t.remove(); t = D.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.innerHTML = "<span>" + m + "</span>"; D.body.appendChild(t); clearTimeout(toast.t); toast.t = setTimeout(function(){ t.remove(); }, 2600); }

/* ---------- your picks ---------- */
var OPV = { tabs: "Tabs — Time, Parts, Notes, Files (as today)", together: "Notes, time and parts together (like the Technician page)" };
var PIC = { big: "Big, in the band (as today)", small: "Small, beside the name", off: "No picture" };
function nm(L){ return L.length ? L.map(function(k){ return B[k].n; }).join(", ") : "—"; }
function pkText(){
  var on = [].concat(V.C.L, V.C.M, V.C.R), added = on.filter(function(k){ return !B[k].now; }), gone = ORDER.filter(function(k){ return B[k].now && on.indexOf(k) < 0; });
  return "Parsec · RO page — my picks\n· Started from: " + (V.pre ? PRE[V.pre].n : "my own layout") + "\n"
    + (V.C.L.length ? "· Left column: " + nm(V.C.L) + "\n" : "") + "· Middle: " + nm(V.C.M) + "\n· Right: " + nm(V.C.R) + "\n"
    + "· New blocks: " + (added.length ? added.map(function(k){ return B[k].n + " (" + { L: "left", M: "middle", R: "right" }[where(k)] + ")"; }).join(", ") : "none") + "\n"
    + "· Taken off: " + nm(gone) + "\n· An open operation shows: " + OPV[V.opv] + "\n· Truck picture: " + PIC[V.pic]
    + (V.note.trim() ? "\n· Notes: " + V.note.trim() : ""); }
function pkDraw(){ var w = $("#picks"); w.hidden = !V.picks; if(!V.picks) return;
  w.innerHTML = '<div class="pk-h"><b>Your picks</b><button class="x" data-pk="x" aria-label="Close">' + ic("x", 15) + "</button></div><pre>" + esc(pkText()) + '</pre><textarea id="pk-note" placeholder="Anything else to move, add or change?">' + esc(V.note) + '</textarea><button class="btn pri" data-pk="copy">' + ic("copy", 14) + "Copy — paste it in the chat</button>"; }

/* ---------- doing things ---------- */
D.addEventListener("click", function(e){
  var t = e.target, b;
  if((b = t.closest("[data-pre]"))){ snap(); setPre(b.getAttribute("data-pre")); draw(); return; }
  if((b = t.closest("[data-opv]"))){ snap(); V.opv = b.getAttribute("data-opv"); draw(); return; }
  if((b = t.closest("[data-pic]"))){ snap(); V.pic = b.getAttribute("data-pic"); draw(); return; }
  if((b = t.closest("button[data-th]"))){ D.documentElement.setAttribute("data-th", b.getAttribute("data-th")); sync(); return; }
  if((b = t.closest("#edt"))){ V.edit = !V.edit; draw(); return; }
  if((b = t.closest("#und"))){ undo(); return; }
  if((b = t.closest("#blk-open")) || t.closest("[data-dr]")){ V.drawer = !V.drawer && !t.closest("[data-dr]"); draw(); return; }
  if((b = t.closest("#pk-open"))){ V.picks = !V.picks; pkDraw(); return; }
  if((b = t.closest("[data-pk]"))){ var k0 = b.getAttribute("data-pk"); if(k0 === "x"){ V.picks = false; pkDraw(); } else { var tx = pkText(); try{ navigator.clipboard.writeText(tx).then(function(){ toast("Copied — paste it in the chat."); }, function(){ toast("Select the text and copy it."); }); }catch(x){ toast("Select the text and copy it."); } } return; }
  if((b = t.closest("[data-put]"))){ var k = b.getAttribute("data-k"), c = b.getAttribute("data-put"); if(where(k) === (c || null)) return; place(k, c || null); toast(c ? B[k].n + " → " + { L: "left", M: "middle", R: "right" }[c] : B[k].n + " is off the page"); return; }
  if((b = t.closest("[data-mv]"))){ if(b.disabled) return; var k2 = b.getAttribute("data-k"), m = b.getAttribute("data-mv"), c2 = where(k2), L = V.C[c2], i = L.indexOf(k2);
    if(m === "U") place(k2, c2, i - 1); else if(m === "D") place(k2, c2, i + 1);
    else if(m === "X"){ place(k2, null); toast(B[k2].n + " is off the page — Blocks brings it back."); }
    else { var ci = "LMR".indexOf(c2) + (m === "L" ? -1 : 1); if(ci < 0 || ci > 2) return; place(k2, "LMR"[ci], i); }
    var el = $('.blk[data-k="' + k2 + '"]'); if(el){ el.classList.add("moved"); setTimeout(function(){ el.classList.remove("moved"); }, 500); } return; }
});
D.addEventListener("input", function(e){ if(e.target.id === "pk-note"){ V.note = e.target.value; var p = $("#picks pre"); if(p) p.textContent = pkText(); } });
D.addEventListener("keydown", function(e){ if((e.ctrlKey || e.metaKey) && e.key === "z" && !/INPUT|TEXTAREA/.test(e.target.tagName)){ e.preventDefault(); undo(); } if(e.key === "Escape"){ if(V.picks){ V.picks = false; pkDraw(); } else if(V.drawer){ V.drawer = false; draw(); } } });
/* drag a block by its grip: between the blocks of any column */
var DRAG = null;
D.addEventListener("dragstart", function(e){ var g = e.target.closest && e.target.closest("[data-drag]"); if(!g) return; DRAG = g.getAttribute("data-drag"); e.dataTransfer.setData("text/plain", DRAG); e.dataTransfer.effectAllowed = "move";
  try{ var blk = g.closest(".blk"); e.dataTransfer.setDragImage(blk, 20, 16); }catch(x){}
  setTimeout(function(){ D.body.classList.add("dragging"); var b = $('.blk[data-k="' + DRAG + '"]'); if(b) b.classList.add("lift"); if(!V.C.L.length){ $("#pg .cols").classList.add("three"); if(!$('[data-col="L"]')) $("#pg .cols").insertAdjacentHTML("afterbegin", '<div class="col cL empty" data-col="L"><div class="drop-hint">Drop a block here for a left column</div></div>'); } }, 0); });
function dropAt(e){ var c = e.target.closest && e.target.closest("[data-col]"); if(!c) return null; var bl = $$(".blk", c).filter(function(x){ return x.getAttribute("data-k") !== DRAG; }), i = bl.length;
  for(var j = 0; j < bl.length; j++){ var r = bl[j].getBoundingClientRect(); if(e.clientY < r.top + r.height / 2){ i = j; break; } } return { c: c, col: c.getAttribute("data-col"), i: i, bl: bl }; }
D.addEventListener("dragover", function(e){ if(!DRAG) return; var d = dropAt(e); if(!d) return; e.preventDefault(); var m = $(".dmark"); if(!m){ m = D.createElement("div"); m.className = "dmark"; }
  if(d.i < d.bl.length) d.bl[d.i].parentNode.insertBefore(m, d.bl[d.i]); else d.c.appendChild(m); });
D.addEventListener("drop", function(e){ if(!DRAG) return; var d = dropAt(e); if(!d) return; e.preventDefault(); var k = DRAG; DRAG = null; D.body.classList.remove("dragging"); var m = $(".dmark"); if(m) m.remove();
  /* the index among the column's blocks without the one being moved */
  place(k, d.col, d.i); toast(B[k].n + " moved"); });
D.addEventListener("dragend", function(){ var was = DRAG; DRAG = null; D.body.classList.remove("dragging"); var m = $(".dmark"); if(m) m.remove(); if(was) draw(); });
draw();
})();
