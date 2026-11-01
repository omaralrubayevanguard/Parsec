/* Parsec · ro · route.js
   The RO's route between departments: who holds it now (writer, tech, parts, foreman…), the next step for a role (rtNext / rtStepFor).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   rtKeyOfRole rtMe rtTechs rtPerson rtWarrOps rtUnapproved rtPartsOut rtApplies rtStep rtNext rtStepFor rtWhoText … (15 functions, 8 constants)
   state      ros techName
   uses       access/ data/ kit/ pages/ pages/triage/ ro-page/ shell/ state/
*/
/* ============================== RO ROUTE (hand-offs between departments) ==============================
   An RO is "with" one place at a time: a technician, the service writer (approval), parts, the foreman,
   the manager or warranty. Send to… moves it, the route bar shows where it is and where it has been,
   and every page has a "Sent to you" list of the ROs waiting there. */
var RT_ROLE = { tech: "Technician", writer: "Service writer", parts: "Parts", foreman: "Foreman", manager: "Manager", warranty: "Warranty admin" };
var RT_LBL = { tech: "Technician", writer: "Approval", parts: "Parts", foreman: "Foreman", manager: "Manager", warranty: "Warranty" };
var RT_DEPT = { tech: "Technician", writer: "Service writer", parts: "Parts department", foreman: "Foreman", manager: "Manager", warranty: "Warranty" };
var RT_AB = { tech: "TE", writer: "AP", parts: "PT", foreman: "FM", manager: "MG", warranty: "WA" };
var RT_COL = { tech: "#151a22", writer: "#0f766e", parts: "#b45309", foreman: "#334155", manager: "#6d28d9", warranty: "#7a3b8f" };
var RT_PATH = ["tech", "writer", "parts", "foreman", "tech", "manager", "warranty"];
var RT_PAGE = { console: "tech", foreman: "foreman", manager: "manager", triage: "writer", warranty: "warranty", parts: "parts" };
var RT_ACT = { writer: ["appr", "Approved"], parts: ["ordered", "Parts ordered"], manager: ["signoff", "Signed off"], warranty: ["claim", "Claim filed"] };
function rtKeyOfRole(r){ for(var k in RT_ROLE) if(RT_ROLE[k] === r) return k; return r === "Triage" ? "writer" : "admin"; }
function rtMe(){ var me = viewAsStaff(); if(me) return { name: me.name, role: rtKeyOfRole(me.role) }; return { name: STATE.techName || "Admin", role: STATE.techName ? "tech" : "admin" }; }
function rtTechs(){
  var l = staffList().filter(function(sf){ return sf.role === "Technician"; }).map(function(sf){ return sf.name; });
  if(!l.length){ var seen = {}; STATE.ros.forEach(function(ro){ var n = String(ro.assignedTech || "").trim(); if(n && !seen[n.toLowerCase()]){ seen[n.toLowerCase()] = 1; l.push(n); } }); if(STATE.techName && !l.some(function(n){ return techSame(n, STATE.techName); })) l.unshift(STATE.techName); }
  return l;
}
function rtPerson(k){ var sf = staffList().filter(function(x){ return x.role === RT_ROLE[k]; })[0]; return sf ? sf.name : ""; }
function rtWarrOps(ro){ return raLive(ro).filter(function(op){ return ["WARR","RECALL"].indexOf(opJobType(op)) > -1; }); }
function rtUnapproved(ro){ return raLive(ro).filter(function(op){ return !op.appr && +op.quoted > 0 && ["WARR","RECALL"].indexOf(opJobType(op)) < 0; }); }
function rtPartsOut(ro){ var n = 0; raLive(ro).forEach(function(op){ opRealParts(op).forEach(function(p){ if(!fcPartIn(p)) n++; }); }); return n; }
function rtApplies(ro, k){
  if(k === "writer") return rtUnapproved(ro).length > 0;
  if(k === "parts") return rtPartsOut(ro) > 0;
  if(k === "warranty") return rtWarrOps(ro).length > 0;
  if(k === "manager") return false;                  /* only when someone sends it there */
  return true;
}
function rtStep(ro){ return ro.route && typeof ro.route.step === "number" ? ro.route.step : 0; }
function rtNext(ro){ for(var i = rtStep(ro) + 1; i < RT_PATH.length; i++) if(rtApplies(ro, RT_PATH[i])) return i; return null; }
function rtStepFor(ro, k){
  var cur = rtStep(ro), i;
  if(k === "tech") return cur >= 3 ? 4 : 0;          /* before the foreman it is the diag tech, after it the repair tech */
  for(i = cur + 1; i < RT_PATH.length; i++) if(RT_PATH[i] === k) return i;
  for(i = 0; i < RT_PATH.length; i++) if(RT_PATH[i] === k) return i;
  return cur;
}
function rtWhoText(ro){ var r = ro.route; if(!r) return ""; if(r.queue) return "anyone in " + (TRX_DN[r.to] || RT_DEPT[r.to]); return r.to === "tech" ? (r.who || ro.assignedTech || "a technician") : (r.who || rtPerson(r.to) || RT_DEPT[r.to]); }
function rtIsMine(ro){
  var r = ro.route; if(!r) return false;
  var me = viewAsStaff();
  if(r.to === "tech"){ var nm = me ? (me.role === "Technician" ? me.name : null) : STATE.techName; return !!(nm && techSame(r.who, nm)); }
  return !!(me && rtKeyOfRole(me.role) === r.to);
}
function rtAge(iso){ var ms = ageSince(iso); return ms != null && ms < 60000 ? "just now" : ageText(ms) + " ago"; }
function rtActV1(a, t){
  var m = UI.modal, ro;
  var keepNote = function(){ if(m && m.type === "route"){ var n = document.getElementById("rt-note"); if(n) m.note = n.value; } };
  if(a === "rt-open"){ ro = getRO(t.dataset.ro); if(!ro) return true; UI.modal = { type: "route", roId: ro.id, to: t.dataset.to || null, who: null, note: "" }; render(); return true; }
  if(a === "rt-pick" && m && m.type === "route"){ keepNote(); m.to = t.dataset.to; if(m.to !== "tech") m.who = null; render(); return true; }
  if(a === "rt-who" && m && m.type === "route"){ keepNote(); m.who = t.dataset.who; render(); return true; }
  if(a === "rt-send" && m && m.type === "route"){
    keepNote(); ro = getRO(m.roId); if(!ro || !m.to) return true;
    if(m.to === "tech" && !m.who){ pushToast("Pick a technician first."); return true; }
    pushUndo("send RO"); rtSend(ro, m.to, m.who, m.note);
    UI.modal = null; pushToast(roLabel(ro) + " sent to " + rtWhoText(ro) + ".", true);
    if(typeof JC !== "undefined" && JC && JC.rerender) JC.rerender();
    return true;
  }
  if(a === "rt-next"){
    ro = getRO(t.dataset.ro); if(!ro) return true;
    var nx = rtNext(ro); if(nx == null) return true;
    var k = RT_PATH[nx];
    if(k === "tech" && !ro.assignedTech){ UI.modal = { type: "route", roId: ro.id, to: "tech", who: null, note: "" }; render(); return true; }
    pushUndo("send RO"); rtSend(ro, k, k === "tech" ? ro.assignedTech : "", "", nx);
    pushToast(roLabel(ro) + " sent to " + rtWhoText(ro) + ".", true);
    if(typeof JC !== "undefined" && JC && JC.rerender) JC.rerender();
    return true;
  }
  if(a === "rt-assign"){
    ro = getRO(t.dataset.ro); if(!ro) return true;
    var ts = document.querySelector('[data-rt-tech="' + ro.id + '"]'), bs = document.querySelector('[data-rt-bay="' + ro.id + '"]');
    var tech = ts ? ts.value : "", bay = bs ? bs.value : "";
    if(!tech){ pushToast("Pick a technician first."); return true; }
    pushUndo("assign RO");
    if(bay){ var prev = yardMap().map[bay]; if(prev && prev !== ro){ pushToast(bay + " has " + roLabel(prev) + " in it — pick another bay."); return true; } ro.location = bay; }
    rtSend(ro, "tech", tech, "Assigned" + (bay ? " to " + bay : ""), 4);
    pushToast(roLabel(ro) + " → " + tech + (bay ? " · " + bay : "") + ".", true);
    return true;
  }
  if(a === "rt-act"){
    ro = getRO(t.dataset.ro); if(!ro || !ro.route) return true;
    var r = ro.route, kk = r.to, me = rtMe(), what = RT_ACT[kk] ? RT_ACT[kk][1] : "Done";
    pushUndo(what.toLowerCase());
    if(kk === "writer") raLive(ro).forEach(function(o){ if(!o.appr && ["WARR","RECALL"].indexOf(opJobType(o)) < 0) o.appr = { s: "ok", by: me.name, at: nowIso() }; });
    if(kk === "parts") raLive(ro).forEach(function(o){ opRealParts(o).forEach(function(pp){ if(!pp.status || pp.status === "Not Ordered"){ pp.status = "Ordered"; pp.statusChangedAt = nowIso(); } }); });
    var backK = RT_ROLE[r.byRole] ? r.byRole : "tech", backWho = backK === "tech" ? (r.byRole === "tech" ? r.by : ro.assignedTech) : "";
    rtSend(ro, backK, backWho, what);
    pushToast(what + " · " + roLabel(ro) + " back to " + rtWhoText(ro) + ".", true);
    return true;
  }
  return false;
}
