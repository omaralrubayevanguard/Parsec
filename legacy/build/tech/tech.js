/* ===== Parsec · Technician page — mock-up ===== */
(function(){
var D = document, $ = function(s, r){ return (r || D).querySelector(s); }, $$ = function(s, r){ return [].slice.call((r || D).querySelectorAll(s)); };
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function ic(k){ return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + (IC[k] || "") + "</svg>"; }
function img(id, k){ var m = IMG[id]; return m ? '<img src="' + m[k || "s"] + '" alt="" draggable="false">' : ""; }
function src(t){ return '<mark class="src">' + t + "</mark>"; }
function h1(n){ return (Math.round(n * 10) / 10).toFixed(1); }

/* ---------- the shop's data, as Mike's page would see it ---------- */
var S0 = {
  techs: ["Mike Rodriguez", "Dana Kowalski", "Luis Martinez", "Priya Shah"],
  ros: [
    { id: "37590", cust: "Silverline LTL", yr: 2019, model: "VNL 760", pic: "vnl-18-760", unit: "212", spot: "Bay 6", lane: "work", promised: "Today 5:00 pm", stage: 4, notes: 2,
      ops: [{ t: "OP", c: "Clean DPF and replace DPF pressure sensor", q: 2.8, b: 0.9, run: true }, { t: "DIAG", c: "Check exhaust leak at turbo flange", q: 1.0, b: 0 }],
      parts: [["DPF pressure sensor", "22303390", 1, "picked"], ["DPF gasket kit", "21982465", 1, "picked"], ["Exhaust clamp", "20545364", 2, "staged"]],
      log: [["1:26 pm", "Pulled the DPF and put it on the cleaning machine."]], fix: "DPF pressure sensor — fault code · held 9 of 9 · saves about 0:36" },
    { id: "37750", cust: "Yadkin Valley Freight", yr: 2021, model: "VNR 300", pic: "vnr-18-300", unit: "88", spot: "Yard C3", lane: "next", ord: 1, stage: 3, promised: "Tomorrow 10:00",
      ops: [{ t: "OP", c: "A/C not cooling — compressor clutch", q: 2.6, b: 0 }], parts: [["A/C compressor clutch", "22100245", 1, "staged"]], log: [], tag: "Parts staged" },
    { id: "37755", cust: "Copperline Transport", yr: 2025, model: "VNL 860", pic: "vnl-25-860", unit: "T-40", spot: "Bay 4", lane: "next", ord: 2, stage: 2,
      ops: [{ t: "PM", c: "PM service — B", q: 2.2, b: 0 }], parts: [["PM kit B", "85137594", 1, "picked"]], log: [] },
    { id: "37762", cust: "Keystone Carriers", yr: 2016, model: "VNL 670", pic: "vnl-03-670", unit: "1042", spot: "Yard A7", lane: "next", ord: 3, stage: 1,
      ops: [{ t: "DIAG", c: "Air leak — tractor protection valve", q: 1.0, b: 0 }], parts: [], log: [] },
    { id: "37628", cust: "Prairie Line Trucking", yr: 2022, model: "VHD 300", pic: "vhd-21-300", unit: "PL-9", spot: "Bay 9", lane: "wait", why: "Waiting – Parts", sub: "Turbo actuator · due Fri 10:00", who: "Parts", held: 28, goal: 8, stage: 3,
      ops: [{ t: "OP", c: "Turbo actuator fault — low boost", q: 3.1, b: 1.2 }], parts: [["Turbo actuator", "23274472", 1, "ordered"]], log: [["Yesterday", "Actuator fails the sweep test — ordered one."]] },
    { id: "37544", cust: "Copperline Transport", yr: 2020, model: "VNL 740", pic: "vnl-18-740", unit: "T-12", spot: "Yard D2", lane: "wait", why: "Waiting – Tech Support", sub: "Case 4471 · EGR valve", who: "Tech support", held: 23, goal: 24, stage: 1,
      ops: [{ t: "DIAG", c: "EGR valve stuck — derate", q: 1.5, b: 1.4 }], parts: [], log: [["Mon", "Sent the EGR test results to tech support."]] },
    { id: "37716", cust: "Dixie Fleet Services", yr: 2023, model: "VNR 640", pic: "vnr-18-640", unit: "DX-3", spot: "Bay 2", lane: "wait", why: "Waiting – Customer", sub: "Approval · $1,240", who: "Service writer", held: 2.9, goal: 4, stage: 2,
      ops: [{ t: "OP", c: "Wheel seal leaking — steer axle, right", q: 1.8, b: 0.4 }], parts: [["Wheel seal", "20398270", 1, "staged"]], log: [["10:40 am", "Seal leaking onto the brake — asked for approval."]] },
    { id: "37612", cust: "Midway Auto Transport", yr: 2018, model: "VNL 300", pic: "vnl-18-300", unit: "MW-5", spot: "Yard B4", lane: "done", doneAt: "Today 11:40 am", range: "today", st: "Complete – Road test", stage: 6,
      ops: [{ t: "OP", c: "Clutch slipping — replace clutch", q: 4.8, b: 3.6, done: true }], parts: [["Clutch kit", "85136213", 1, "installed"]], log: [] },
    { id: "37598", cust: "Blue Ridge Haulers", yr: 2026, model: "VNR 640", pic: "vnr-26-640", unit: "BR-1", spot: "—", lane: "done", doneAt: "Today 9:15 am", range: "today", st: "Complete – Released", stage: 7,
      ops: [{ t: "OP", c: "Alternator not charging", q: 1.4, b: 1.2, done: true }], parts: [["Alternator", "23336426", 1, "installed"]], log: [] },
    { id: "37571", cust: "Granite State Express", yr: 2017, model: "VNM 430", pic: "vnm-430", unit: "G-22", spot: "—", lane: "done", doneAt: "Yesterday 3:50 pm", range: "week", st: "Complete – Released", stage: 7,
      ops: [{ t: "OP", c: "Coolant leak — water pump", q: 3.0, b: 3.4, done: true }], parts: [], log: [] },
    { id: "37533", cust: "Harbor Point Drayage", yr: 2021, model: "VAH 300", pic: "vah-21-300", unit: "HP-7", spot: "—", lane: "done", doneAt: "Mon 2:10 pm", range: "week", st: "Complete – Released", stage: 7,
      ops: [{ t: "PM", c: "PM service — A", q: 1.6, b: 1.3, done: true }], parts: [], log: [] },
    { id: "37510", cust: "Iron Horse Logistics", yr: 2015, model: "VNL 780", pic: "vnl-03-780", unit: "IH-2", spot: "—", lane: "done", doneAt: "Oct 16", range: "pay", st: "Complete – Released", stage: 7,
      ops: [{ t: "OP", c: "Fifth wheel — rebuild", q: 2.5, b: 2.2, done: true }], parts: [], log: [] }
  ]
};
var S = JSON.parse(JSON.stringify(S0)), UNDO = [];
var V = { layout: "list", viewer: "tech", tech: "Mike Rodriguez", range: "today", q: "", sel: "37590", drawer: false, menu: null, tick: 3067, src: false, picks: {}, note: "" };
var STAGES = ["Check-in", "Diag", "Approval", "Parts", "Repair", "Road test", "Close-out"];
var LANES = [["work", "Working", "on the clock"], ["next", "Assigned", "Frank’s order"], ["wait", "Waiting", "on someone else"], ["done", "Done", ""]];
var PST = [["ordered", "Ordered"], ["staged", "Staged"], ["picked", "Picked up"], ["installed", "Installed"]];
var WAITS = [["Waiting – Parts", "Parts"], ["Waiting – Foreman", "Foreman"], ["Waiting – Tech Support", "Tech support"], ["Waiting – Customer", "Service writer"]];
var HAND = [["Foreman", "Frank Miller"], ["Parts", "Dana Kowalski · parts"], ["Service writer", "Jenna Cho"], ["Tech support", "Volvo TechTool case"]];

function ro(id){ return S.ros.filter(function(r){ return r.id === id; })[0]; }
function snap(label){ UNDO.push({ s: JSON.stringify(S), sel: V.sel, tick: V.tick, at: Date.now(), label: label }); if(UNDO.length > 30) UNDO.shift(); }
function undo(){ var u = UNDO.pop(); if(!u) return; S = JSON.parse(u.s); V.sel = u.sel; V.tick = u.tick + Math.round((Date.now() - u.at) / 1000); draw(); toast("Undone: " + u.label); }
function inRange(r){ if(r.lane !== "done") return true; return V.range === "pay" || (V.range === "week" ? r.range !== "pay" : r.range === "today"); }
function match(r){ if(!V.q) return true; var t = (r.id + " " + r.cust + " " + r.yr + " " + r.model + " " + r.unit + " " + r.spot + " " + r.ops.map(function(o){ return o.c; }).join(" ")).toLowerCase(); return V.q.toLowerCase().split(/\s+/).every(function(w){ return t.indexOf(w) > -1; }); }
function list(lane){ return S.ros.filter(function(r){ return r.lane === lane && inRange(r) && match(r); }).sort(function(a, b){ return lane === "next" ? (a.ord || 9) - (b.ord || 9) : 0; }); }
function qb(r){ var q = 0, b = 0; r.ops.forEach(function(o){ q += o.q; b += o.b; }); return { q: q, b: b }; }
function running(){ return S.ros.filter(function(r){ return r.ops.some(function(o){ return o.run; }); })[0]; }
function stTxt(r){ return r.lane === "work" ? "Working · Repairing" : r.lane === "next" ? (r.paused ? "Paused · your turn" : "Hold Tech · up next") : r.lane === "wait" ? r.why : r.st; }
function stCls(r){ return r.lane === "work" ? "work" : r.lane === "wait" ? "wait" : r.lane === "done" ? "done" : "hold"; }
function age(r){ if(r.lane !== "wait") return ""; var x = r.held / r.goal, d = r.held >= 24 ? Math.floor(r.held / 24) + "d " + Math.round(r.held % 24) + "h" : r.held >= 1 ? Math.floor(r.held) + "h " + Math.round((r.held % 1) * 60) + "m" : Math.round(r.held * 60) + "m";
  return '<span class="age' + (x >= 1 ? " b" : x >= .75 ? " w" : "") + '" title="With ' + esc(r.who) + " · follow up after " + r.goal + ' h">' + d + "</span>"; }
function clk(s){ var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h + ":" + String(m).padStart(2, "0") + ":" + String(x).padStart(2, "0"); }

/* ---------- pieces every layout shares ---------- */
function stPill(r){ return '<span class="stp ' + stCls(r) + '"><i></i>' + esc(stTxt(r)) + "</span>"; }
function hoursBar(r){ var x = qb(r), over = x.b > x.q; return '<span class="hb' + (over ? " over" : "") + '"><span class="bar"><i style="width:' + Math.min(100, x.q ? x.b / x.q * 100 : 0).toFixed(0) + '%"></i></span><span class="mono">' + h1(x.b) + " / " + h1(x.q) + " h</span></span>"; }
function act(r){ if(r.lane === "work") return '<button class="btn sm" data-do="stop" data-id="' + r.id + '">' + ic("stop") + "Stop</button>";
  if(r.lane === "next") return '<button class="btn sm pri" data-do="start" data-id="' + r.id + '">' + ic("play") + "Start</button>";
  if(r.lane === "wait") return '<button class="btn sm" data-do="nudge" data-id="' + r.id + '">Follow up</button>';
  return '<span class="dn mono">' + esc(r.doneAt) + "</span>"; }
function card(r){ var x = qb(r);
  return '<div class="cd' + (V.sel === r.id ? " on" : "") + '" data-sel="' + r.id + '" draggable="true" tabindex="0" role="button" aria-label="RO ' + r.id + " " + esc(r.cust) + '">'
    + '<div class="cd-h"><span class="cd-pic">' + img(r.pic) + '</span><div class="cd-t"><b><span class="mono">' + r.id + "</span> " + esc(r.cust) + '</b><small>' + r.yr + " " + esc(r.model) + " · " + esc(r.spot) + "</small></div></div>"
    + '<div class="cd-c">' + esc(r.ops[0].c) + (r.ops.length > 1 ? ' <span class="more">+' + (r.ops.length - 1) + "</span>" : "") + "</div>"
    + (r.lane === "wait" ? '<div class="cd-w">' + age(r) + esc(r.why.replace("Waiting – ", "")) + " · " + esc(r.sub) + "</div>" : r.tag ? '<div class="cd-w ok">' + esc(r.tag) + "</div>" : "")
    + '<div class="cd-f">' + (r.lane === "done" ? '<span class="eff mono">' + Math.round(x.q / Math.max(.1, x.b) * 100) + "%</span>" : hoursBar(r)) + '<span class="sp"></span>' + act(r) + "</div>" + (r.lane === "work" ? '<div class="cd-run"><i></i><span class="mono" data-tk>' + clk(V.tick) + "</span> on this job</div>" : "") + "</div>"; }
function row(r){
  return '<div class="rw' + (V.sel === r.id ? " on" : "") + '" data-sel="' + r.id + '" tabindex="0" role="button">' + (r.lane === "next" ? '<span class="ord">' + (r.paused ? "‖" : r.ord || "") + "</span>" : "") + '<span class="rw-pic">' + img(r.pic) + '</span><span class="rw-t"><b><span class="mono">' + r.id + "</span> " + esc(r.cust) + '</b><small>' + (r.lane === "wait" ? age(r) : "") + esc(r.lane === "wait" ? r.why.replace("Waiting – ", "") + " · " + r.sub : r.lane === "done" ? r.st.replace("Complete – ", "") + " · " + r.doneAt : r.ops[0].c) + '</small></span><span class="rw-m">' + (r.lane === "work" ? '<b class="mono run" data-tk>' + clk(V.tick) + "</b>" : r.lane === "done" ? '<span class="mono">' + Math.round(qb(r).q / Math.max(.1, qb(r).b) * 100) + "%</span>" : '<span class="mono">' + h1(qb(r).q - qb(r).b) + " h</span>") + "<small>" + esc(r.spot) + "</small></span></div>"; }
function head(){
  var n = function(l){ return S.ros.filter(function(r){ return r.lane === l && inRange(r); }).length; };
  var picker = V.viewer === "fore" ? '<div class="tp" role="group" aria-label="Technician">' + S.techs.map(function(t){ return '<button data-tech="' + esc(t) + '" aria-pressed="' + (V.tech === t) + '"><span class="av">' + t.split(" ").map(function(w){ return w[0]; }).join("") + "</span>" + esc(t.split(" ")[0]) + "</button>"; }).join("") + src("Manager · Team") + "</div>" : "";
  return '<header class="ph"><h1>Technician</h1>' + (V.viewer === "tech" ? '<span class="me"><span class="av">MR</span>Mike Rodriguez</span>' : picker)
    + '<span class="facts"><b>' + n("work") + "</b> working<i>·</i><b>" + n("next") + "</b> assigned<i>·</i><b>" + n("wait") + "</b> waiting<i>·</i><b>" + n("done") + "</b> done " + { today: "today", week: "this week", pay: "this pay period" }[V.range] + "</span>"
    + '<span class="clockp" title="On the clock today, and hours on ROs against clock time"><i></i><b class="mono">6:47</b><small>104%</small>' + src("Console") + "</span>"
    + '<span class="sp"></span><label class="find">' + ic("search") + '<input id="q" placeholder="RO, truck, year…" value="' + esc(V.q) + '" autocomplete="off">' + src("RO list") + "</label>"
    + '<div class="seg" id="rg" role="group" aria-label="Done">' + [["today", "Today"], ["week", "Week"], ["pay", "Pay period"]].map(function(x){ return '<button data-rg="' + x[0] + '" aria-pressed="' + (V.range === x[0]) + '">' + x[1] + "</button>"; }).join("") + "</div>"
    + "</header>"; }
function paneHtml(r){
  if(!r) return '<div class="pn empty"><span>Pick a repair order.</span></div>';
  var x = qb(r), run = r.lane === "work";
  var h = '<div class="pn" data-pane="' + r.id + '">'
    + '<div class="band"><div class="band-t"><div class="eb"><span class="mono">RO-' + r.id + "</span><i>·</i>" + esc(r.spot) + (r.promised ? "<i>·</i>promised " + esc(r.promised) : "") + "</div><h2>" + esc(r.cust) + '</h2><div class="sub">' + r.yr + " Volvo " + esc(r.model) + " · Unit " + esc(r.unit) + '</div><div class="srow"><button class="stbtn" data-do="status" data-id="' + r.id + '">' + stPill(r) + ic("chevD") + "</button>" + (r.lane === "wait" ? age(r) + '<span class="k">with ' + esc(r.who) + "</span>" : "") + src("RO page status") + '</div></div><div class="band-p">' + img(r.pic) + '<button class="cam" data-do="photos" title="Truck & photos">' + ic("camera") + "</button>" + (r.notes ? '<button class="nb" data-do="notes">' + r.notes + " notes on the truck</button>" : "") + src("Parsec 10") + "</div></div>"
    + '<div class="acts">' + (run ? '<button class="btn" data-do="stop" data-id="' + r.id + '">' + ic("stop") + "Stop</button>" : r.lane === "next" || r.lane === "wait" ? '<button class="btn pri" data-do="start" data-id="' + r.id + '">' + ic("play") + "Start</button>" : "")
    + (r.lane !== "done" ? '<button class="btn" data-do="hand" data-id="' + r.id + '">' + ic("swap") + "Hand off…</button><button class=\"btn\" data-do=\"askparts\" data-id=\"" + r.id + '">' + ic("parts") + "Ask Parts</button>" : "")
    + (r.lane === "work" ? '<button class="btn" data-do="done" data-id="' + r.id + '">' + ic("check") + "Done — road test</button>" : "")
    + '<span class="sp"></span><button class="btn gh" data-do="open" data-id="' + r.id + '">Open RO ' + ic("arrow") + "</button>" + src("Console · Triage · Foreman") + "</div>"
    + (r.lane === "wait" ? '<div class="wbox"><b>' + esc(r.why) + "</b><span>" + esc(r.sub) + " · waiting " + age(r).replace(/<[^>]+>/g, "") + " · follow up after " + r.goal + ' h</span><button class="btn sm" data-do="nudge" data-id="' + r.id + '">Follow up</button><button class="btn sm gh" data-do="back" data-id="' + r.id + '">It’s here — back to me</button>' + src("Parsec 10 blocker aging") + "</div>" : "")
    + '<div class="stg">' + STAGES.map(function(s, i){ return '<span class="' + (i < r.stage ? "d" : i === r.stage ? "n" : "") + '"><i></i>' + s + "</span>"; }).join("") + "</div>"
    + '<div class="sec"><div class="sh"><b>Operations</b><span>' + h1(x.b) + " of " + h1(x.q) + ' h</span>' + src("RO page") + "</div>" + r.ops.map(function(o, i){ var ov = o.b > o.q;
        return '<div class="op' + (o.run ? " run" : "") + (o.done ? " done" : "") + '"><span class="ty t-' + o.t.toLowerCase() + '">' + o.t + '</span><span class="oc">' + esc(o.c) + '</span><span class="hb' + (ov ? " over" : "") + '"><span class="bar"><i style="width:' + Math.min(100, o.q ? o.b / o.q * 100 : 0).toFixed(0) + '%"></i></span><span class="mono">' + h1(o.b) + " / " + h1(o.q) + "</span></span>"
          + (o.done ? '<span class="okc">' + ic("check") + "Done</span>" : r.lane === "done" ? "" : '<button class="ib' + (o.run ? " on" : "") + '" data-do="' + (o.run ? "stop" : "start") + '" data-id="' + r.id + '" data-op="' + i + '" title="' + (o.run ? "Stop the clock" : "Start the clock on this job") + '">' + ic(o.run ? "stop" : "play") + "</button>") + "</div>"; }).join("") + "</div>"
    + (r.fix && r.lane !== "done" ? '<div class="fix"><span class="fi">' + ic("wrench") + '</span><div><b>A past fix matches</b><small>' + esc(r.fix) + '</small></div><span class="sp"></span><button class="btn sm" data-do="fixview">View</button><button class="btn sm pri" data-do="usefix">Use fix</button>' + src("Fixes") + "</div>" : "")
    + '<div class="cols"><div class="sec"><div class="sh"><b>Parts</b><span>' + r.parts.length + "</span>" + src("Parts page statuses") + "</div>" + (r.parts.length ? r.parts.map(function(p, i){ var k = PST.map(function(z){ return z[0]; }).indexOf(p[3]);
        return '<div class="pt"><span><b>' + esc(p[0]) + '</b><small class="mono">' + esc(p[1]) + " · qty " + p[2] + '</small></span><button class="pp ' + p[3] + '" data-do="part" data-id="' + r.id + '" data-p="' + i + '" title="' + (k < 3 && r.lane !== "done" ? "Mark it " + PST[Math.min(3, k + 1)][1].toLowerCase() : "") + '"><i></i>' + PST[k][1] + "</button></div>"; }).join("") : '<p class="none">No parts on this RO.</p>') + (r.lane !== "done" ? '<button class="lnk" data-do="askparts" data-id="' + r.id + '">+ Ask Parts for a part</button>' : "") + "</div>"
    + '<div class="sec"><div class="sh"><b>Work performed</b><span>Enter adds the time</span>' + src("Console") + '</div>' + r.log.map(function(l){ return '<div class="lg"><span class="mono">' + esc(l[0]) + "</span>" + esc(l[1]) + "</div>"; }).join("") + (r.lane !== "done" ? '<input class="lgi" data-log="' + r.id + '" placeholder="What you found, what you did…">' : "") + "</div></div></div>";
  return h; }
/* ---------- the three layouts ---------- */
function lanes(){
  return '<div class="lanes">' + LANES.map(function(L){ var R = list(L[0]);
    return '<section class="ln" data-lane="' + L[0] + '"><div class="ln-h"><i class="dot ' + L[0] + '"></i><b>' + L[1] + '</b><span class="n">' + R.length + "</span>" + (L[2] ? "<small>" + (L[0] === "done" ? "" : esc(L[2])) + "</small>" : "") + "</div>"
      + '<div class="ln-b">' + (R.length ? R.map(card).join("") : '<p class="none">' + (L[0] === "work" ? "Nothing on the clock — Start one from Assigned." : L[0] === "wait" ? "Nothing waiting on anyone." : "None yet.") + "</p>") + "</div></section>"; }).join("") + src("Foreman drag · Triage lanes") + "</div>"; }
function split(){
  var grp = function(L){ var R = list(L[0]); if(!R.length && L[0] === "work") return '<div class="gh">' + L[1] + ' <span>0</span></div><p class="none">Nothing on the clock.</p>'; if(!R.length) return ""; return '<div class="gh">' + (L[0] === "next" ? "Assigned · Frank’s order" : L[1]) + " <span>" + R.length + "</span></div>" + R.map(row).join(""); };
  return '<div class="split"><section class="ls"><div class="ls-h"><b>My repair orders</b><span class="n">' + S.ros.filter(function(r){ return inRange(r) && match(r); }).length + "</span>" + src("Triage · Foreman list") + '</div><div class="ls-b">' + LANES.map(grp).join("") + '</div><div class="keys"><span><kbd>J</kbd><kbd>K</kbd> move</span><span><kbd>S</kbd> status</span><span><kbd>Space</kbd> start · stop</span><span><kbd>↵</kbd> open RO</span></div></section>'
    + '<section class="rp">' + paneHtml(ro(V.sel)) + "</section></div>"; }
function today(){
  var w = running(), tabs = [["next", "Assigned"], ["wait", "Waiting"], ["done", "Done"]]; V.tab = V.tab || "next";
  var hero = w ? (function(){ var o = w.ops.filter(function(z){ return z.run; })[0]; return '<div class="hero"><div class="hero-l"><span class="k">On it now</span><h2><span class="mono">' + w.id + "</span> " + esc(w.cust) + '</h2><div class="sub">' + w.yr + " " + esc(w.model) + " · " + esc(w.spot) + " · " + esc(o.c) + '</div><div class="big mono" data-tk>' + clk(V.tick) + '</div><div class="hb2">' + hoursBar(w) + '</div></div><div class="hero-p">' + img(w.pic) + '</div><div class="hero-a"><button class="btn" data-do="hand" data-id="' + w.id + '">' + ic("swap") + 'Hand off…</button><button class="btn" data-do="status" data-id="' + w.id + '">Hold…</button><button class="btn" data-do="stop" data-id="' + w.id + '">' + ic("stop") + 'Stop</button><button class="btn pri" data-do="done" data-id="' + w.id + '">' + ic("check") + "Done</button></div>" + src("Console") + "</div>"; })()
    : '<div class="hero none"><span class="k">On it now</span><p>Nothing on the clock. Start the next one — <b>' + esc((list("next")[0] || {}).cust || "—") + "</b>.</p>" + (list("next")[0] ? '<button class="btn pri" data-do="start" data-id="' + list("next")[0].id + '">' + ic("play") + "Start " + list("next")[0].id + "</button>" : "") + "</div>";
  var L = list(V.tab);
  return '<div class="today">' + hero + '<div class="tiles">' + tabs.map(function(t){ var n = list(t[0]).length; return '<button class="tile' + (V.tab === t[0] ? " on" : "") + '" data-tab="' + t[0] + '"><i class="dot ' + t[0] + '"></i><b>' + n + "</b><span>" + t[1] + (t[0] === "done" ? " " + { today: "today", week: "this week", pay: "this pay period" }[V.range] : "") + "</span></button>"; }).join("") + "</div>"
    + '<div class="tbl"><div class="tr th"><span>RO</span><span>Customer · truck</span><span>Complaint</span><span>' + (V.tab === "wait" ? "Waiting on" : V.tab === "done" ? "Finished" : "Spot") + "</span><span>Hours</span><span></span></div>"
    + (L.length ? L.map(function(r){ return '<div class="tr' + (V.sel === r.id && V.drawer ? " on" : "") + '" data-sel="' + r.id + '" tabindex="0" role="button"><span class="mono">' + (r.lane === "next" ? '<span class="ord">' + (r.paused ? "‖" : r.ord) + "</span>" : "") + r.id + '</span><span class="tc"><span class="rw-pic">' + img(r.pic) + "</span><span><b>" + esc(r.cust) + "</b><small>" + r.yr + " " + esc(r.model) + "</small></span></span><span>" + esc(r.ops[0].c) + "</span><span>" + (r.lane === "wait" ? age(r) + esc(r.who) : r.lane === "done" ? esc(r.doneAt) : esc(r.spot)) + "</span><span>" + hoursBar(r) + "</span><span>" + act(r) + "</span></div>"; }).join("") : '<p class="none">None.</p>') + "</div></div>"; }
/* ---------- the page ---------- */
function draw(){
  var pg = $("#pg"), keep = D.activeElement && D.activeElement.id === "q" ? D.activeElement.selectionStart : null;
  pg.innerHTML = head() + '<div class="body">' + (V.layout === "lanes" ? lanes() : V.layout === "list" ? split() : today()) + "</div>" + (V.drawer && V.layout !== "list" ? '<div class="dw-bg" data-do="xdw"></div><aside class="dw" role="dialog" aria-label="Repair order"><button class="dw-x" data-do="xdw" aria-label="Close">' + ic("x") + "</button>" + paneHtml(ro(V.sel)) + "</aside>" : "") + menuHtml();
  if(keep != null){ var q = $("#q"); q.focus(); try{ q.setSelectionRange(keep, keep); }catch(e){} }
  D.body.classList.toggle("show-src", V.src);
  placeMenu();
}
function fadePane(){ var p = $(".pn"); if(p && p.animate) p.animate([{ opacity: .45, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 180, easing: "cubic-bezier(.2,.75,.25,1)" }); }
/* menus: status, hand off */
function menuHtml(){
  var M = V.menu; if(!M) return ""; var r = ro(M.id); if(!r) return "";
  if(M.k === "status") return '<div class="mn" id="mn" role="menu"><div class="mn-h">Set status · <span class="mono">' + r.id + "</span></div>" + [["Working", "start"]].concat(WAITS.map(function(w){ return [w[0], "wait"]; })).concat([["Hold Tech", "hold"], ["Complete – Road test", "done"]]).map(function(o){ return '<button role="menuitem" data-st="' + esc(o[0]) + '" data-k="' + o[1] + '">' + '<i class="dot ' + (o[1] === "start" ? "work" : o[1] === "wait" ? "wait" : o[1] === "done" ? "done" : "next") + '"></i>' + esc(o[0]) + "</button>"; }).join("") + "</div>";
  if(M.k === "hand") return '<div class="mn" id="mn" role="menu"><div class="mn-h">Hand off · <span class="mono">' + r.id + "</span><small>they accept it in their Inbox</small></div>" + HAND.map(function(o){ return '<button role="menuitem" data-hand="' + esc(o[0]) + '"><b>' + esc(o[0]) + "</b><small>" + esc(o[1]) + "</small></button>"; }).join("") + "</div>";
  return ""; }
function placeMenu(){ var m = $("#mn"); if(!m || !V.menu || !V.menu.at) return; var a = V.menu.at, w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.min(window.innerWidth - w - 10, Math.max(10, a.left)) + "px"; m.style.top = (a.bottom + 6 + h > window.innerHeight ? Math.max(10, a.top - h - 6) : a.bottom + 6) + "px"; }
/* ---------- what the buttons do ---------- */
function toast(m, u){ var o = $(".toast"); if(o) o.remove(); var t = D.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.innerHTML = "<span>" + m + "</span>" + (u ? '<button type="button">' + ic("undo") + "Undo</button>" : ""); D.body.appendChild(t);
  if(u){ var n = UNDO.length; t.querySelector("button").onclick = function(){ if(UNDO.length !== n) return; t.remove(); undo(); }; } clearTimeout(toast.t); toast.t = setTimeout(function(){ t.remove(); }, 5200); }
function start(id, op){ var r = ro(id); if(!r) return; snap("start the clock"); var w = running(), msg = "";
  if(w && w !== r){ w.ops.forEach(function(o){ o.run = false; }); w.lane = "next"; w.paused = true; w.ord = 0; msg = " · " + w.id + " paused — stays on top"; }
  r.ops.forEach(function(o){ o.run = false; }); var i = op != null ? +op : Math.max(0, r.ops.findIndex(function(o){ return !o.done; })); if(r.ops[i]) r.ops[i].run = true;
  var was = r.lane; r.lane = "work"; delete r.paused; V.tick = 0; V.sel = id; draw(); fadePane(); toast("Clock on " + id + " — " + esc(r.ops[i].c) + (was === "wait" ? " (back from " + esc(r.why.replace("Waiting – ", "")) + ")" : "") + msg, true); }
function stop(id){ var r = ro(id); if(!r) return; snap("stop the clock"); r.ops.forEach(function(o){ if(o.run){ o.b += V.tick / 3600; o.run = false; } }); r.lane = "next"; r.paused = true; r.ord = 0; draw(); toast("Clock stopped on " + id + " — it stays at the top of Assigned.", true); }
function setWait(id, why){ var r = ro(id); if(!r) return; snap("status"); r.ops.forEach(function(o){ o.run = false; }); var w = WAITS.filter(function(x){ return x[0] === why; })[0]; r.lane = "wait"; r.why = why; r.who = w ? w[1] : why; r.sub = r.sub || "Set just now"; r.held = 0.05; r.goal = { "Parts": 8, "Foreman": 2, "Tech support": 24, "Service writer": 4 }[r.who] || 4; draw(); toast(id + " → " + esc(why) + ".", true); }
function finish(id){ var r = ro(id); if(!r) return; snap("done"); r.ops.forEach(function(o){ if(o.run) o.b += V.tick / 3600; o.run = false; o.done = true; }); r.parts.forEach(function(p){ if(p[3] === "picked") p[3] = "installed"; }); r.lane = "done"; r.st = "Complete – Road test"; r.doneAt = "Today " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); r.range = "today"; r.stage = 5; draw(); toast(id + " done — Complete – Road test. The foreman sees it in QC before release.", true); }
function hand(id, to){ var r = ro(id); if(!r) return; snap("hand off"); r.ops.forEach(function(o){ o.run = false; }); var w = { "Foreman": "Waiting – Foreman", "Parts": "Waiting – Parts", "Service writer": "Waiting – Customer", "Tech support": "Waiting – Tech Support" }[to];
  r.lane = "wait"; r.why = w; r.who = to; r.sub = "Handed off just now"; r.held = 0.02; r.goal = { "Parts": 8, "Foreman": 2, "Tech support": 24, "Service writer": 4 }[to]; draw(); toast(id + " sent to " + esc(to) + " — they accept it in their Inbox.", true); }
function move(d){ var ids = $$("[data-sel]").map(function(e){ return e.getAttribute("data-sel"); }); if(!ids.length) return; var i = ids.indexOf(V.sel); V.sel = ids[Math.max(0, Math.min(ids.length - 1, i < 0 ? 0 : i + d))]; draw(); fadePane(); var e = $('[data-sel="' + V.sel + '"]'); if(e) e.scrollIntoView({ block: "nearest" }); }
D.addEventListener("click", function(e){
  var t = e.target, b;
  if((b = t.closest("[data-lay]"))){ V.layout = b.getAttribute("data-lay"); V.drawer = false; V.menu = null; segSync(); draw(); return; }
  if((b = t.closest("[data-view]"))){ V.viewer = b.getAttribute("data-view"); segSync(); draw(); return; }
  if((b = t.closest("button[data-th]"))){ D.documentElement.setAttribute("data-th", b.getAttribute("data-th")); segSync(); return; }
  if((b = t.closest("#srct"))){ V.src = !V.src; b.setAttribute("aria-pressed", V.src); draw(); return; }
  if((b = t.closest("#pk-open"))){ $("#picks").hidden = !$("#picks").hidden; pkDraw(); return; }
  if((b = t.closest("[data-tech]"))){ var tn = b.getAttribute("data-tech"); if(tn !== "Mike Rodriguez"){ toast("In Parsec this shows " + esc(tn.split(" ")[0]) + "’s ROs — the mock-up has Mike’s."); } V.tech = "Mike Rodriguez"; draw(); return; }
  if((b = t.closest("[data-rg]"))){ V.range = b.getAttribute("data-rg"); draw(); return; }
  if((b = t.closest("[data-tab]"))){ V.tab = b.getAttribute("data-tab"); draw(); return; }
  if(V.menu && !t.closest("#mn") && !t.closest('[data-do="status"],[data-do="hand"]')){ V.menu = null; draw(); }
  if((b = t.closest("#mn [data-st]"))){ var M = V.menu, k = b.getAttribute("data-k"), st = b.getAttribute("data-st"); V.menu = null; if(k === "start") start(M.id); else if(k === "wait") setWait(M.id, st); else if(k === "done") finish(M.id); else { var rr = ro(M.id); snap("status"); rr.ops.forEach(function(o){ o.run = false; }); rr.lane = "next"; rr.ord = 9; draw(); toast(M.id + " → Hold Tech.", true); } return; }
  if((b = t.closest("#mn [data-hand]"))){ var M2 = V.menu; V.menu = null; hand(M2.id, b.getAttribute("data-hand")); return; }
  if((b = t.closest("[data-do]"))){ e.stopPropagation(); var k2 = b.getAttribute("data-do"), id = b.getAttribute("data-id");
    if(k2 === "start") start(id, b.getAttribute("data-op")); else if(k2 === "stop") stop(id); else if(k2 === "done") finish(id);
    else if(k2 === "status" || k2 === "hand"){ var r0 = b.getBoundingClientRect(); V.menu = V.menu && V.menu.k === k2 && V.menu.id === id ? null : { k: k2, id: id, at: { left: r0.left, top: r0.top, bottom: r0.bottom } }; draw(); var f = $("#mn button"); if(f) f.focus(); }
    else if(k2 === "nudge"){ var rn = ro(id); toast("Nudged " + esc(rn.who) + " about " + id + " — logged on the RO."); }
    else if(k2 === "back"){ start(id); }
    else if(k2 === "part"){ var rp = ro(id), p = rp.parts[+b.getAttribute("data-p")], k = PST.map(function(z){ return z[0]; }).indexOf(p[3]); if(rp.lane === "done" || k >= 3) return; snap("part"); p[3] = PST[k + 1][0]; draw(); toast(esc(p[0]) + " — " + PST[k + 1][1].toLowerCase() + ".", true); }
    else if(k2 === "askparts") toast("Asks Parts for a part on " + id + " — it lands in Parts’ Inbox.");
    else if(k2 === "open") toast("Opens RO " + id + " on the RO page.");
    else if(k2 === "photos") toast("Opens Truck & photos for this RO (Parsec 10).");
    else if(k2 === "notes") toast("Opens Notes on the truck (Parsec 9.9).");
    else if(k2 === "usefix"){ var rf = ro(V.sel); snap("use fix"); rf.log.push(["now", "Used the past fix: replaced the DPF pressure sensor and cleared the code."]); delete rf.fix; draw(); toast("Past fix added to the work log — cause, correction and parts.", true); }
    else if(k2 === "fixview") toast("Shows the past fix from the Fixes page.");
    else if(k2 === "xdw"){ V.drawer = false; draw(); }
    return; }
  if((b = t.closest("[data-sel]"))){ var nid = b.getAttribute("data-sel"); var ch = nid !== V.sel; V.sel = nid; if(V.layout !== "list") V.drawer = true; draw(); if(ch || V.layout !== "list") fadePane(); if(V.layout === "list" && innerWidth < 760){ var pe = $(".pn"); if(pe) pe.scrollIntoView({ behavior: "smooth", block: "start" }); } return; }
});
D.addEventListener("input", function(e){ if(e.target.id === "q"){ V.q = e.target.value; draw(); } if(e.target.hasAttribute && e.target.hasAttribute("data-pk-note")) V.note = e.target.value; });
D.addEventListener("keydown", function(e){
  var t = e.target;
  if(t.hasAttribute && t.hasAttribute("data-log") && e.key === "Enter" && t.value.trim()){ var r = ro(t.getAttribute("data-log")); snap("note"); r.log.push([new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), t.value.trim()]); draw(); toast("Added to the work log.", true); return; }
  if(/INPUT|TEXTAREA|SELECT/.test(t.tagName)) { if(e.key === "Escape") t.blur(); return; }
  if(e.key === "Escape"){ if(V.menu){ V.menu = null; draw(); } else if(V.drawer){ V.drawer = false; draw(); } return; }
  if(e.key === "j" || e.key === "ArrowDown"){ e.preventDefault(); move(1); } else if(e.key === "k" || e.key === "ArrowUp"){ e.preventDefault(); move(-1); }
  else if(e.key === "s" || e.key === "S"){ var b = $('.pn [data-do="status"]'); if(b) b.click(); }
  else if(e.key === " "){ e.preventDefault(); var r2 = ro(V.sel); if(r2 && r2.lane === "work") stop(r2.id); else if(r2 && r2.lane !== "done") start(r2.id); }
  else if(e.key === "Enter"){ var sel = t.closest && t.closest("[data-sel]"); if(sel){ sel.click(); return; } if(V.sel) toast("Opens RO " + V.sel + " on the RO page."); }
  else if((e.ctrlKey || e.metaKey) && e.key === "z"){ e.preventDefault(); undo(); }
});
/* lanes: drag a card to another lane — Working starts the clock, Waiting asks why, Done finishes it */
D.addEventListener("dragstart", function(e){ var c = e.target.closest && e.target.closest(".cd[data-sel]"); if(!c) return; e.dataTransfer.setData("text/plain", c.getAttribute("data-sel")); e.dataTransfer.effectAllowed = "move"; setTimeout(function(){ c.classList.add("lift"); D.body.classList.add("dragging"); }, 0); });
D.addEventListener("dragend", function(){ D.body.classList.remove("dragging"); $$(".ln.over,.cd.lift").forEach(function(n){ n.classList.remove("over", "lift"); }); });
D.addEventListener("dragover", function(e){ var l = e.target.closest && e.target.closest(".ln[data-lane]"); if(!l) return; e.preventDefault(); $$(".ln.over").forEach(function(n){ if(n !== l) n.classList.remove("over"); }); l.classList.add("over"); });
D.addEventListener("drop", function(e){ var l = e.target.closest && e.target.closest(".ln[data-lane]"); if(!l) return; e.preventDefault(); var id = e.dataTransfer.getData("text/plain"), r = ro(id), to = l.getAttribute("data-lane"); D.body.classList.remove("dragging"); if(!r || r.lane === to) { draw(); return; }
  if(to === "work") start(id); else if(to === "done") finish(id); else if(to === "next") stop(id); else { var a = l.getBoundingClientRect(); V.sel = id; V.menu = { k: "status", id: id, at: { left: a.left + 20, top: a.top + 60, bottom: a.top + 60 } }; draw(); } });
/* the clock ticks */
setInterval(function(){ V.tick++; $$("[data-tk]").forEach(function(n){ n.textContent = clk(V.tick); }); }, 1000);

/* ---------- the mock-up's own controls, and your picks ---------- */
var PICKS = [
  ["layout", "Layout", [["lanes", "Lanes"], ["list", "List + RO"], ["today", "Today first"]]],
  ["done", "Done shows", [["today", "Today"], ["week", "This week"], ["pay", "Pay period"]]],
  ["who", "Who opens it", [["tech", "Technicians only"], ["all", "+ Foreman & manager pick a tech"]]],
  ["console", "With Console", [["both", "Keep both pages"], ["replace", "Replaces Console for techs"]]]
];
function segSync(){ $$("[data-lay]").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-lay") === V.layout); }); $$("[data-view]").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-view") === V.viewer); }); var th = D.documentElement.getAttribute("data-th"); $$("button[data-th]").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-th") === th); }); }
function pkText(){ return "Parsec · Technician page — my picks\n" + PICKS.map(function(p){ var v = V.picks[p[0]], o = p[2].filter(function(x){ return x[0] === v; })[0]; return "· " + p[1] + ": " + (o ? o[1] : "—"); }).join("\n") + (V.note.trim() ? "\n· Notes: " + V.note.trim() : ""); }
function pkDraw(){ var w = $("#picks"); if(w.hidden) return;
  w.innerHTML = '<div class="pk-h"><b>Your picks</b><button class="x" id="pk-x" aria-label="Close">' + ic("x") + "</button></div>" + PICKS.map(function(p){ return '<div class="pk-r"><span>' + p[1] + '</span><div class="seg wrap">' + p[2].map(function(o){ return '<button data-pk="' + p[0] + '" data-v="' + o[0] + '" aria-pressed="' + (V.picks[p[0]] === o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div></div>"; }).join("")
    + '<textarea data-pk-note placeholder="Anything to add or change?">' + esc(V.note) + '</textarea><button class="btn pri" id="pk-copy">' + ic("copy") + "Copy — paste it in the chat</button>"; }
D.addEventListener("click", function(e){ var b = e.target.closest("[data-pk]"); if(b){ var k = b.getAttribute("data-pk"), v = b.getAttribute("data-v"); V.picks[k] = V.picks[k] === v ? null : v; if(k === "layout" && V.picks[k]){ V.layout = v; segSync(); draw(); } if(k === "done" && V.picks[k]){ V.range = v; draw(); } if(k === "who" && V.picks[k]){ V.viewer = v === "all" ? "fore" : "tech"; segSync(); draw(); } pkDraw(); return; }
  if(e.target.closest("#pk-x")){ $("#picks").hidden = true; return; }
  if(e.target.closest("#pk-copy")){ var t = pkText(); try{ navigator.clipboard.writeText(t).then(function(){ toast("Copied — paste it in the chat."); }, function(){ toast(esc(t).replace(/\n/g, "<br>")); }); }catch(x){ toast(esc(t).replace(/\n/g, "<br>")); } } }, true);
window.addEventListener("resize", placeMenu);
segSync(); draw();
})();
