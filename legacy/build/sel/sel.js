/* Mock-up: picking several operations, or several parts, and acting on them together — on the Technician page's RO */
(function(){
var D = document, $ = function(s, r){ return (r || D).querySelector(s); }, $$ = function(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
function ic(k, s){ return '<svg class="ic"' + (s ? ' style="width:' + s + 'px;height:' + s + 'px"' : '') + ' viewBox="0 0 24 24" aria-hidden="true">' + (IC[k] || "") + "</svg>"; }
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function h1(n){ return (Math.round(n * 10) / 10).toFixed(1); }
var PST = { no: ["wt", "Not ordered"], ord: ["wt", "Ordered · due Fri"], rec: ["in", "Received"], stg: ["st", "Staged at the counter"], pick: ["ok", "Picked up"], inst: ["ok", "Installed"], ret: ["in", "Returned to Parts"] };
var S0 = { ops: [
  { id: "o1", n: 1, t: "OP", c: "Clean DPF and replace DPF pressure sensor", q: 2.8, b: 0.9, st: "run", parts: [["p1", "DPF pressure sensor", "22303390", 1, "pick"], ["p2", "DPF gasket kit", "21982465", 1, "stg"], ["p3", "Exhaust clamp", "20545364", 2, "stg"], ["p4", "V-band clamp", "21316570", 1, "ord"]] },
  { id: "o2", n: 2, t: "DIAG", c: "Check exhaust leak at turbo flange", q: 1.0, b: 0, st: "next", parts: [] },
  { id: "o3", n: 3, t: "PM", c: "PM service — A", q: 1.5, b: 0, st: "next", parts: [["p5", "Oil filter", "21707134", 1, "stg"], ["p6", "Fuel filter", "23658092", 1, "stg"], ["p7", "Engine oil 15W-40", "VDS-4.5", 10, "rec"]] },
  { id: "o4", n: 4, t: "OP", c: "Replace wiper blades", q: 0.3, b: 0.25, st: "done", parts: [["p8", "Wiper blade 26 in", "20843710", 2, "inst"]] }
] };
var S = JSON.parse(JSON.stringify(S0)), UNDO = [];
var OPA = [["start", "Start", "play"], ["hold", "Hold", "clock"], ["askp", "Ask Parts", "parts"], ["askf", "Ask Frank", "chat"], ["note", "Note on all", "pencil"], ["code", "Add a code", "plus"], ["done", "Mark done", "check"], ["print", "Print job jacket", "print"], ["story", "Copy the story", "copy"]];
var PTA = [["pick", "Picked up", "check"], ["inst", "Installed", "wrench"], ["askp", "Ask Parts", "parts"], ["ret", "Return", "undo"], ["move", "Move to…", "swap"], ["pns", "Copy part numbers", "copy"], ["pick-list", "Print pick list", "print"]];
var V = { how: "box", bar: "bottom", reach: "op", keys: true, opA: { start: 1, hold: 1, askp: 1, askf: 1, note: 1, code: 0, done: 1, print: 1, story: 0 }, ptA: { pick: 1, inst: 1, askp: 1, ret: 1, move: 1, pns: 0, "pick-list": 0 },
  selO: {}, selP: {}, mode: false, open: "o1", tab: "parts", last: null, menu: null, picks: false, note: "", th: "ivory" };
function op(id){ return S.ops.filter(function(o){ return o.id === id; })[0]; }
function partOf(pid){ var r = null; S.ops.forEach(function(o){ o.parts.forEach(function(p){ if(p[0] === pid) r = { o: o, p: p }; }); }); return r; }
function nO(){ return Object.keys(V.selO).length; } function nP(){ return Object.keys(V.selP).length; }
function snap(l){ UNDO.push({ s: JSON.stringify(S), l: l }); }
function undo(){ var u = UNDO.pop(); if(!u) return; S = JSON.parse(u.s); draw(); toast("Undone: " + u.l); }
function showBoxes(){ return V.how === "box" || (V.how === "mode" && V.mode) || V.how === "hover"; }

/* ---------- drawing ---------- */
function cb(kind, id, on, label){ return '<button class="ck' + (on ? " on" : "") + '" role="checkbox" aria-checked="' + on + '" aria-label="' + esc(label) + '" data-ck="' + kind + '" data-id="' + id + '">' + (on ? ic("check", 11) : "") + "</button>"; }
function opRow(o){
  var on = !!V.selO[o.id], open = V.open === o.id, ring = o.st === "run" ? "run" : o.st === "done" ? "dn" : o.st === "wait" ? "wt" : "nx";
  var sub = o.st === "run" ? "Working · Repairing" : o.st === "done" ? "Done 9:40 am" : o.st === "wait" ? "Waiting – " + o.why : "Up next";
  var out = o.parts.filter(function(p){ return ["no", "ord"].indexOf(p[4]) > -1; }).length;
  return '<div class="o ' + o.st + (open ? " open" : "") + (on ? " sel" : "") + '"><div class="oh">' + (showBoxes() ? cb("o", o.id, on, "Select operation " + o.n) : "") + '<button class="ot" data-open="' + o.id + '"><span class="os ' + ring + '">' + (ring === "dn" ? ic("check", 9) : "") + '</span><span class="on mono">' + o.n + '</span><span class="oc"><b>' + esc(o.c) + "</b><small>" + esc(sub + (out ? " · " + out + " part" + (out === 1 ? "" : "s") + " coming" : "")) + '</small></span><span class="ty ' + o.t.toLowerCase() + '">' + o.t + '</span><span class="hb"><span class="mono">' + h1(o.b) + " / " + h1(o.q) + ' h</span><span class="bar"><i style="width:' + Math.min(100, o.b / o.q * 100).toFixed(0) + '%"></i></span></span></button>'
    + (o.st === "done" ? '<span class="ib0"></span>' : '<button class="ib' + (o.st === "run" ? " on" : "") + '" title="' + (o.st === "run" ? "Stop" : "Start") + '">' + ic(o.st === "run" ? "stop" : "play", 13) + "</button>") + "</div>"
    + (open ? opBody(o) : "") + "</div>"; }
function opBody(o){
  var tabs = [["time", "Time", o.b ? 2 : ""], ["parts", "Parts", o.parts.length ? o.parts.filter(function(p){ return ["pick", "inst", "rec", "stg"].indexOf(p[4]) > -1; }).length + "/" + o.parts.length : ""], ["files", "Files", ""]];
  var h = '<div class="ob"><div class="tm"><div><b class="mono">' + (o.st === "run" ? "0:54:12" : "0:00:00") + '</b><small>On this operation</small></div><div class="n"><span>Quoted<b>' + h1(o.q) + '</b></span><span>Burnt<b>' + h1(o.b) + '</b></span><span>Left<b>' + h1(o.q - o.b) + "</b></span></div></div>"
    + '<div class="tabs">' + tabs.map(function(t){ return '<button class="' + (V.tab === t[0] ? "on" : "") + '" data-tab="' + t[0] + '">' + t[1] + (t[2] !== "" ? "<i>" + t[2] + "</i>" : "") + "</button>"; }).join("") + "</div>";
  if(V.tab === "parts"){
    var all = o.parts.length && o.parts.every(function(p){ return V.selP[p[0]]; }), some = o.parts.some(function(p){ return V.selP[p[0]]; });
    h += o.parts.length ? '<div class="pth">' + (showBoxes() ? '<button class="ck' + (all ? " on" : some ? " mid" : "") + '" role="checkbox" aria-checked="' + (all ? "true" : some ? "mixed" : "false") + '" data-ckall="p" data-id="' + o.id + '" aria-label="Select every part on this operation">' + (all ? ic("check", 11) : some ? "<i></i>" : "") + "</button>" : "") + "<span>" + (some ? o.parts.filter(function(p){ return V.selP[p[0]]; }).length + " of " + o.parts.length + " picked" : o.parts.length + " part" + (o.parts.length === 1 ? "" : "s")) + "</span>" + (V.how === "mode" && !V.mode ? '<button class="lk" data-mode="1">Select</button>' : "") + "</div>" : "";
    h += o.parts.map(function(p){ var k = PST[p[4]], on = !!V.selP[p[0]]; return '<div class="pr' + (on ? " sel" : "") + '" data-prow="' + p[0] + '">' + (showBoxes() ? cb("p", p[0], on, "Select " + p[1]) : "") + '<span class="n"><b>' + esc(p[1]) + '</b><small class="mono">' + esc(p[2]) + " · qty " + p[3] + '</small></span><span class="ps ' + k[0] + '"><i></i>' + k[1] + "</span></div>"; }).join("") || '<p class="none">No parts on this one.</p>';
    if(o.st !== "done") h += '<button class="lk add">' + ic("plus", 13) + "Ask Parts for a part</button>";
  } else if(V.tab === "time") h += '<div class="tl"><div class="te"><i></i><b class="mono">9:13 am</b><span>Started · Repairing</span></div><div class="tn"><small class="mono">9:40</small><span>DPF out, on the cleaning machine.</span></div><div class="te e"><i></i><b class="mono">now</b><span>On the clock</span><em class="mono">0:54</em></div></div>';
  else h += '<p class="none">No files on this operation yet.</p>';
  return h + "</div>"; }
function bar(kind){
  var n = kind === "o" ? nO() : nP(); if(!n) return "";
  var A = (kind === "o" ? OPA : PTA).filter(function(a){ return (kind === "o" ? V.opA : V.ptA)[a[0]]; });
  var info = kind === "o" ? (function(){ var L = Object.keys(V.selO).map(op), q = L.reduce(function(s, o){ return s + o.q - o.b; }, 0); return "<b>" + n + " operation" + (n === 1 ? "" : "s") + "</b><small>" + h1(q) + " h left</small>"; })()
    : (function(){ var L = Object.keys(V.selP).map(partOf), st = L.filter(function(x){ return x.p[4] === "stg"; }).length, ops = {}; L.forEach(function(x){ ops[x.o.id] = 1; }); return "<b>" + n + " part" + (n === 1 ? "" : "s") + "</b><small>" + (st ? st + " staged" : "none staged") + (Object.keys(ops).length > 1 ? " · " + Object.keys(ops).length + " operations" : "") + "</small>"; })();
  var btn = function(a){ var dis = (kind === "o" && a[0] === "start" && n > 1) ? ' disabled title="Start works on one operation"' : ""; return '<button class="btn sm' + (a[0] === "pick" || a[0] === "done" ? " pri" : "") + '" data-act="' + kind + ":" + a[0] + '"' + dis + ">" + ic(a[2], 13) + a[1] + (a[0] === "hold" || a[0] === "move" ? ic("chevD", 11) : "") + "</button>"; };
  var inner = '<span class="bi">' + info + "</span>" + (V.bar === "menu" ? '<button class="btn sm" data-menu="' + kind + '">' + ic("more", 14) + "Actions" + ic("chevD", 11) + "</button>" : A.map(btn).join("")) + '<span class="sp"></span><button class="lk" data-clear="' + kind + '">Clear</button>';
  return '<div class="sb ' + V.bar + " k-" + kind + '" role="toolbar" aria-label="' + (kind === "o" ? "Selected operations" : "Selected parts") + '">' + inner + "</div>"; }
function menuHtml(){
  if(!V.menu) return "";
  var A, title;
  if(V.menu.k === "hold"){ title = "Put on hold"; A = [["Waiting – Parts", "Ben sees it"], ["Waiting – Approval", "Jenna sends the estimate"], ["Waiting – Tech Support", "A Volvo case"], ["Waiting – Foreman", "Frank gets it"]].map(function(x){ return '<button data-hold="' + x[0] + '"><b>' + x[0] + "</b><small>" + x[1] + "</small></button>"; }).join(""); }
  else if(V.menu.k === "move"){ title = "Move to operation"; A = S.ops.filter(function(o){ return o.st !== "done"; }).map(function(o){ return '<button data-moveto="' + o.id + '"><b>Op ' + o.n + "</b><small>" + esc(o.c) + "</small></button>"; }).join(""); }
  else { var kind = V.menu.k; title = kind === "o" ? "Selected operations" : "Selected parts"; A = (kind === "o" ? OPA : PTA).filter(function(a){ return (kind === "o" ? V.opA : V.ptA)[a[0]]; }).map(function(a){ return '<button data-act="' + kind + ":" + a[0] + '"' + (kind === "o" && a[0] === "start" && nO() > 1 ? " disabled" : "") + ">" + ic(a[2], 13) + "<b>" + a[1] + "</b></button>"; }).join(""); }
  return '<div class="mn" style="left:' + V.menu.x + "px;top:" + V.menu.y + 'px" role="menu"><div class="mn-h">' + title + "</div>" + A + "</div>"; }
function page(){
  var allO = S.ops.every(function(o){ return V.selO[o.id]; }), someO = nO() > 0;
  var opsHead = '<div class="sech">' + (showBoxes() ? '<button class="ck' + (allO ? " on" : someO ? " mid" : "") + '" role="checkbox" aria-checked="' + (allO ? "true" : someO ? "mixed" : "false") + '" data-ckall="o" aria-label="Select every operation">' + (allO ? ic("check", 11) : someO ? "<i></i>" : "") + "</button>" : "") + '<h3>Operations</h3><span class="n">4</span><small>1.2 of 5.6 h</small><span class="sp"></span>' + (V.how === "mode" ? '<button class="btn sm' + (V.mode ? " on" : "") + '" data-mode="' + (V.mode ? 0 : 1) + '">' + (V.mode ? "Done selecting" : ic("check", 13) + "Select") + "</button>" : "") + '<button class="btn sm gh">Fold all</button></div>';
  var opBar = V.bar === "head" || V.bar === "menu" ? bar("o") : "";
  var ptsAll = []; S.ops.forEach(function(o){ o.parts.forEach(function(p){ ptsAll.push({ o: o, p: p }); }); });
  var roParts = '<section class="cd"><div class="cd-h"><b>Parts on this RO</b><small>' + ptsAll.filter(function(x){ return ["pick", "inst", "rec", "stg"].indexOf(x.p[4]) > -1; }).length + " of " + ptsAll.length + ' in hand</small></div><div class="cd-b">' + ptsAll.map(function(x){ var k = PST[x.p[4]], on = !!V.selP[x.p[0]]; return '<div class="pr' + (on ? " sel" : "") + '">' + (V.reach === "ro" && showBoxes() ? cb("p", x.p[0], on, "Select " + x.p[1]) : "") + '<span class="n"><b>' + esc(x.p[1]) + '</b><small class="mono">' + esc(x.p[2]) + " · qty " + x.p[3] + " · Op " + x.o.n + '</small></span><span class="ps ' + k[0] + '"><i></i>' + k[1] + "</span></div>"; }).join("") + "</div></section>";
  var ptBarIn = V.bar !== "bottom" ? bar("p") : "";
  return '<div class="cols"><div class="cm">' + '<section class="ops' + (V.how === "hover" ? " hov" : "") + (someO || nP() ? " any" : "") + '">' + opsHead + opBar + '<div class="ol">' + S.ops.map(function(o){ var r = opRow(o); return V.open === o.id && ptBarIn && V.reach === "op" ? r.replace('<div class="tabs">', ptBarIn + '<div class="tabs">') : r; }).join("") + "</div></section>" + (V.reach === "ro" && ptBarIn ? ptBarIn : "") + roParts + "</div>"
    + '<aside class="cr"><section class="band"><img src="' + IMG.s + '" alt=""><div class="eb"><span class="mono">37590</span> · Bay 6 · 13 days open</div><h2>Silverline LTL</h2><div class="sub">2019 Volvo VNL 760 · Unit 212</div><div class="st"><span class="pill"><i></i>Working · Repairing</span><b class="mono g">0:54:12</b></div><div class="acts"><button class="btn pri wide">' + ic("check", 14) + 'Done</button><button class="btn sm">' + ic("stop", 13) + 'Stop</button><button class="btn sm">' + ic("clock", 13) + 'Hold</button><button class="btn sm">' + ic("chat", 13) + "Ask Frank</button></div></section>"
    + '<div class="stg">' + ["d", "d", "d", "d", "n", "", ""].map(function(c){ return '<i class="' + c + '"></i>'; }).join("") + '</div><small class="mu">Repair · stage 5 of 7 · Ready about 3:40 pm</small></aside></div>'
    + (V.bar === "bottom" ? bar(nO() ? "o" : "p").replace('class="sb', 'class="sb float') : "") + menuHtml(); }
function draw(){
  var y = $("#pg").scrollTop; $("#pg").innerHTML = '<header class="ph"><h1>Technician</h1><span class="me">' + "Mike Rodriguez · 6:47 on the clock</span></header>" + '<div class="split"><section class="ls">' + ["37590 Silverline LTL", "37750 Yadkin Valley Freight", "37755 Copperline Transport", "37628 Prairie Line Trucking"].map(function(t, i){ return '<div class="rw' + (i ? "" : " on") + '"><b class="mono">' + t.slice(0, 5) + "</b> " + t.slice(6) + "</div>"; }).join("") + '</section><section class="rp">' + page() + "</section></div>";
  $("#pg").scrollTop = y; sync(); if(V.picks) pkDraw();
  var mn = $(".mn"); if(mn && V.menu){ var r = mn.getBoundingClientRect(); if(r.bottom > innerHeight - 8) mn.style.top = Math.max(8, V.menu.top - r.height - 6) + "px"; if(r.right > innerWidth - 8) mn.style.left = Math.max(8, innerWidth - r.width - 8) + "px"; } }
function sync(){
  [["how", "data-how"], ["bar", "data-bar"], ["reach", "data-reach"]].forEach(function(x){ $$("[" + x[1] + "]").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute(x[1]) === V[x[0]]); }); });
  $$("[data-keys]").forEach(function(b){ b.setAttribute("aria-pressed", String(V.keys) === b.getAttribute("data-keys")); });
  var th = D.documentElement.getAttribute("data-th"); $$("button[data-th]").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-th") === th); }); }
function toast(m, u){ var t = $(".toast"); if(t) t.remove(); t = D.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.innerHTML = "<span>" + m + "</span>" + (u ? '<button data-undo="1">' + ic("undo", 13) + "Undo</button>" : ""); D.body.appendChild(t); clearTimeout(toast.t); toast.t = setTimeout(function(){ t.remove(); }, 4200); }

/* ---------- doing it on the selection ---------- */
function act(kind, a, el){
  var L, n;
  if(kind === "o"){ L = Object.keys(V.selO).map(op); n = L.length;
    if(a === "hold"){ var r = el.getBoundingClientRect(); V.menu = { k: "hold", x: r.left, y: r.bottom + 6, top: r.top }; draw(); return; }
    if(a === "start"){ snap("start"); S.ops.forEach(function(o){ if(o.st === "run") o.st = "next"; }); L[0].st = "run"; V.selO = {}; draw(); toast("Clock on Op " + L[0].n + " — the one you had stops.", true); return; }
    if(a === "done"){ snap("done"); var gap = L.filter(function(o){ return o.parts.some(function(p){ return ["pick", "inst"].indexOf(p[4]) < 0; }); }); L.forEach(function(o){ if(gap.indexOf(o) < 0) o.st = "done"; }); V.selO = {}; draw(); toast(gap.length ? (n - gap.length) + " done · " + gap.length + " not yet — parts not installed on Op " + gap.map(function(o){ return o.n; }).join(", ") : n + " operations done", true); return; }
    var msg = { askp: "Asked Ben (Parts) about Op " + L.map(function(o){ return o.n; }).join(", ") + " — one note, in his Inbox.", askf: "Asked Frank about Op " + L.map(function(o){ return o.n; }).join(", ") + " — one note, in his Inbox.", note: "A note box for all " + n + " — what you type goes on each one, with the time.", code: "A code box — the code goes on each of the " + n + ".", print: "Prints one job jacket with Op " + L.map(function(o){ return o.n; }).join(", ") + ".", story: "Copied the complaint, cause and correction for " + n + " operation" + (n === 1 ? "" : "s") + "." }[a];
    toast(msg); return; }
  L = Object.keys(V.selP).map(partOf); n = L.length;
  if(a === "move"){ var r2 = el.getBoundingClientRect(); V.menu = { k: "move", x: r2.left, y: r2.bottom + 6, top: r2.top }; draw(); return; }
  if(a === "pick" || a === "inst" || a === "ret"){ snap(a); var did = 0, skip = 0; L.forEach(function(x){ var s = x.p[4];
      if(a === "pick" && s === "stg"){ x.p[4] = "pick"; did++; } else if(a === "inst" && (s === "pick" || s === "rec" || s === "stg")){ x.p[4] = "inst"; did++; } else if(a === "ret" && s !== "inst"){ x.p[4] = "ret"; did++; } else skip++; });
    V.selP = {}; draw(); toast(did + " part" + (did === 1 ? "" : "s") + " " + { pick: "picked up", inst: "installed", ret: "going back to Parts" }[a] + (skip ? " · " + skip + " skipped (" + (a === "pick" ? "not staged" : a === "inst" ? "not in hand" : "already installed") + ")" : "") + ".", true); return; }
  toast({ askp: "Asked Ben (Parts) about " + n + " part" + (n === 1 ? "" : "s") + " — the list goes in his Inbox.", pns: "Copied " + n + " part number" + (n === 1 ? "" : "s") + ".", "pick-list": "Prints a pick list of the " + n + " for the counter." }[a]); }
function toggle(kind, id, ev){
  var M = kind === "o" ? V.selO : V.selP, ids = kind === "o" ? S.ops.map(function(o){ return o.id; }) : (V.reach === "ro" ? [].concat.apply([], S.ops.map(function(o){ return o.parts.map(function(p){ return p[0]; }); })) : (op(V.open) || { parts: [] }).parts.map(function(p){ return p[0]; }));
  if(kind === "p" && V.reach === "op"){ var x = partOf(id); if(x && x.o.id !== V.open) return; }
  if(ev && ev.shiftKey && V.last && V.last.k === kind){ var a = ids.indexOf(V.last.id), b = ids.indexOf(id); if(a > -1 && b > -1){ ids.slice(Math.min(a, b), Math.max(a, b) + 1).forEach(function(i){ M[i] = 1; }); V.last = { k: kind, id: id }; draw(); return; } }
  if(M[id]) delete M[id]; else M[id] = 1;
  if(kind === "o") V.selP = {}; else V.selO = {};
  V.last = { k: kind, id: id }; draw(); }
D.addEventListener("click", function(e){
  var t = e.target, b;
  if(V.menu && !t.closest(".mn") && !t.closest("[data-act]") && !t.closest("[data-menu]")){ V.menu = null; draw(); }
  if((b = t.closest("[data-how]"))){ V.how = b.getAttribute("data-how"); V.mode = false; draw(); return; }
  if((b = t.closest("[data-bar]"))){ V.bar = b.getAttribute("data-bar"); draw(); return; }
  if((b = t.closest("[data-reach]"))){ V.reach = b.getAttribute("data-reach"); V.selP = {}; draw(); return; }
  if((b = t.closest("[data-keys]"))){ V.keys = b.getAttribute("data-keys") === "true"; sync(); if(V.picks) pkDraw(); return; }
  if((b = t.closest("button[data-th]"))){ D.documentElement.setAttribute("data-th", b.getAttribute("data-th")); sync(); return; }
  if((b = t.closest("[data-mode]"))){ V.mode = b.getAttribute("data-mode") === "1"; if(!V.mode){ V.selO = {}; V.selP = {}; } draw(); return; }
  if((b = t.closest("[data-ck]"))){ toggle(b.getAttribute("data-ck"), b.getAttribute("data-id"), e); return; }
  if((b = t.closest("[data-ckall]"))){ var k = b.getAttribute("data-ckall");
    if(k === "o"){ var all = S.ops.every(function(o){ return V.selO[o.id]; }); V.selO = {}; if(!all) S.ops.forEach(function(o){ V.selO[o.id] = 1; }); V.selP = {}; }
    else { var o0 = op(b.getAttribute("data-id")), all2 = o0.parts.every(function(p){ return V.selP[p[0]]; }); o0.parts.forEach(function(p){ if(all2) delete V.selP[p[0]]; else V.selP[p[0]] = 1; }); V.selO = {}; }
    draw(); return; }
  if((b = t.closest("[data-open]"))){ var id = b.getAttribute("data-open");
    if(V.how === "hover" && (e.ctrlKey || e.metaKey || e.shiftKey)){ toggle("o", id, e); return; }
    if((V.how === "mode" && V.mode)){ toggle("o", id, e); return; }
    V.open = V.open === id ? null : id; if(V.reach === "op") V.selP = {}; draw(); return; }
  if((b = t.closest("[data-prow]")) && (V.how === "hover" && (e.ctrlKey || e.metaKey || e.shiftKey) || (V.how === "mode" && V.mode)) && !t.closest("[data-ck]")){ toggle("p", b.getAttribute("data-prow"), e); return; }
  if((b = t.closest("[data-tab]"))){ V.tab = b.getAttribute("data-tab"); draw(); return; }
  if((b = t.closest("[data-clear]"))){ if(b.getAttribute("data-clear") === "o") V.selO = {}; else V.selP = {}; V.menu = null; draw(); return; }
  if((b = t.closest("[data-menu]"))){ var r = b.getBoundingClientRect(); V.menu = V.menu ? null : { k: b.getAttribute("data-menu"), x: r.left, y: r.bottom + 6, top: r.top }; draw(); return; }
  if((b = t.closest("[data-act]"))){ if(b.disabled) return; var p = b.getAttribute("data-act").split(":"); if(V.menu && V.menu.k === p[0]) V.menu = null; act(p[0], p[1], b); return; }
  if((b = t.closest("[data-hold]"))){ var L = Object.keys(V.selO).map(op); snap("hold"); L.forEach(function(o){ if(o.st !== "done"){ o.st = "wait"; o.why = b.getAttribute("data-hold").replace("Waiting – ", ""); } }); V.selO = {}; V.menu = null; draw(); toast(L.length + " on hold — " + b.getAttribute("data-hold").toLowerCase() + ". One note goes to whoever has it.", true); return; }
  if((b = t.closest("[data-moveto]"))){ var to = op(b.getAttribute("data-moveto")), L2 = Object.keys(V.selP).map(partOf); snap("move parts"); L2.forEach(function(x){ if(x.o === to) return; x.o.parts = x.o.parts.filter(function(p){ return p !== x.p; }); to.parts.push(x.p); }); V.selP = {}; V.menu = null; draw(); toast(L2.length + " part" + (L2.length === 1 ? "" : "s") + " moved to Op " + to.n + ".", true); return; }
  if(t.closest("[data-undo]")){ undo(); return; }
  if((b = t.closest("#pk-open"))){ V.picks = !V.picks; pkDraw(); return; }
  if((b = t.closest("[data-pk]"))){ var k2 = b.getAttribute("data-pk"); if(k2 === "x"){ V.picks = false; pkDraw(); return; } if(k2 === "copy"){ var tx = pkText(); try{ navigator.clipboard.writeText(tx).then(function(){ toast("Copied — paste it in the chat."); }, function(){ toast("Select the text and copy it."); }); }catch(x2){ toast("Select the text and copy it."); } return; }
    var pa = k2.split(":"); (pa[0] === "o" ? V.opA : V.ptA)[pa[1]] = (pa[0] === "o" ? V.opA : V.ptA)[pa[1]] ? 0 : 1; draw(); return; }
});
D.addEventListener("keydown", function(e){
  if(/INPUT|TEXTAREA/.test(e.target.tagName)) return;
  if(e.key === "Escape"){ if(V.menu){ V.menu = null; draw(); return; } if(nO() || nP()){ V.selO = {}; V.selP = {}; draw(); return; } if(V.picks){ V.picks = false; pkDraw(); } return; }
  if(!V.keys) return;
  if((e.ctrlKey || e.metaKey) && e.key === "a"){ e.preventDefault(); if(V.tab === "parts" && op(V.open) && op(V.open).parts.length && nP()){ op(V.open).parts.forEach(function(p){ V.selP[p[0]] = 1; }); } else { S.ops.forEach(function(o){ V.selO[o.id] = 1; }); V.selP = {}; } draw(); return; }
  if((e.ctrlKey || e.metaKey) && e.key === "z"){ e.preventDefault(); undo(); return; }
  if(e.key === "x" && V.open){ toggle("o", V.open); }
});
D.addEventListener("input", function(e){ if(e.target.id === "pk-note"){ V.note = e.target.value; var p = $("#picks pre"); if(p) p.textContent = pkText(); } });
/* ---------- your picks ---------- */
var HOW = { box: "A box on every row, always there", mode: "A Select button turns the boxes on", hover: "A box when you point at a row, and Ctrl or Shift click" };
var BAR = { bottom: "A bar along the bottom", head: "In the header above the list", menu: "One Actions menu" };
var REACH = { op: "Parts on one operation at a time", ro: "Also across operations, in Parts on this RO" };
function on(M, L){ return L.filter(function(a){ return M[a[0]]; }).map(function(a){ return a[1]; }).join(", ") || "—"; }
function pkText(){ return "Parsec · Selecting operations and parts — my picks\n· How you pick: " + HOW[V.how] + "\n· Where the actions go: " + BAR[V.bar] + "\n· Parts: " + REACH[V.reach] + "\n· Operation actions: " + on(V.opA, OPA) + "\n· Part actions: " + on(V.ptA, PTA) + "\n· Keys (Shift click a range, Ctrl A all, X, Esc clears): " + (V.keys ? "yes" : "no") + (V.note.trim() ? "\n· Notes: " + V.note.trim() : ""); }
function pkDraw(){ var w = $("#picks"); w.hidden = !V.picks; if(!V.picks) return;
  w.innerHTML = '<div class="pk-h"><b>Your picks</b><button class="x" data-pk="x" aria-label="Close">' + ic("x", 15) + '</button></div><div class="pk-r"><span>Operation actions</span><div class="chips">' + OPA.map(function(a){ return '<button data-pk="o:' + a[0] + '" aria-pressed="' + !!V.opA[a[0]] + '">' + a[1] + "</button>"; }).join("") + '</div></div><div class="pk-r"><span>Part actions</span><div class="chips">' + PTA.map(function(a){ return '<button data-pk="p:' + a[0] + '" aria-pressed="' + !!V.ptA[a[0]] + '">' + a[1] + "</button>"; }).join("") + "</div></div><pre>" + esc(pkText()) + '</pre><textarea id="pk-note" placeholder="Anything to add or change?">' + esc(V.note) + '</textarea><button class="btn pri" data-pk="copy">' + ic("copy", 14) + "Copy — paste it in the chat</button>"; }
draw();
})();
