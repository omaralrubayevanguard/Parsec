/* Parsec · kit · tooltip-texts.js
   What a status pill, an avatar or a main action says when you point at it (Parsec 14.9 E): who set a status and when (V149E stamps saved on the record), what a part is waiting on, the Technician lane's words.
   Flow: pgStTip / v149eAvTip build the text; v149eStamp records who changed a status at save time (automations/watcher.js calls it).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   v149eP2 v149eTs v149eDayKey v149eWhen v149eAgo v149eDay v149eCut v149eCap v149eIsAuto v149eWhoName v149eWho v149eStamp … (21 functions, 7 constants)
   state      punches ros
   uses       access/ automations/ data/ ro/ state/
*/
/* ============================== Parsec 14.9 (E) — what the tooltips say: status pills, initials, the main actions ==============================
   The words go on the controls as data-tip="Title|detail|detail" (Fork A's one tooltip reads them; data-tip-keep shows them even in Fewer).
   · Status pills: the status · since when, then why, then who set it ("Set by Frank · 2 h ago", "Set by Parsec" for automations)
   · Initials: "Luis Martinez · Technician"
   · Disabled main actions: why they can't be pressed (written where they're built — see build_v9zz149e.py)
   Who set a status: stored on the status itself from now on — ro.status.by, op.jobStatus.by, part.stBy (+ part.statusChangedAt) —
   stamped when the change is saved (scheduleSave), so every path that sets one is covered without changing what it does. */
var V149E_WHY = {
  "Hold Tech": "Ready for a tech to pick up", "Working": "A clock is running on it", "Waiting – Parts": "Waiting for parts",
  "Waiting – Sublet": "Out at the sublet", "Waiting – Foreman": "Waiting for the foreman", "Waiting – New Job": "Waiting for a new job on the RO",
  "Waiting – Tech Support": "Waiting on tech support", "Waiting – Customer": "Waiting on the customer", "Waiting – Approval": "Customer approval pending",
  "Complete": "The work is done", "Complete – Road test": "Work done · the road test is next", "Complete – Released": "Released to the customer", "Declined": "The customer declined it"
};
var V149E_PWHY = { "Not Ordered": "Not ordered yet", "Ordered": "On order", "Backordered": "Backordered at the supplier", "Received": "In hand",
  "Staged": "Staged for the tech", "Picked up": "With the tech", "Installed": "On the truck", "Returned": "Sent back to the supplier" };
var V149E_CWHY = { "Ready to file": "Ready to file with Volvo", "Filed": "Filed — waiting on Volvo", "Submitted": "Submitted — waiting on Volvo", "Returned": "Volvo sent it back",
  "Denied": "Volvo denied it", "Approved": "Volvo approved it", "Paid": "Volvo paid it" };
function v149eP2(n){ return String(n).padStart(2, "0"); }
function v149eTs(x){ if(x == null || x === "") return null; if(typeof x === "number") return x; var s = String(x);
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); if(m) return new Date(+m[1], +m[2] - 1, +m[3], 12).getTime();
  m = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/.exec(s); if(m) return new Date(+m[3], +m[1] - 1, +m[2], 12).getTime();
  var t = new Date(s).getTime(); return isNaN(t) ? null : t; }
function v149eDayKey(t){ var d = new Date(t); return d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate(); }
/* since when: today → 10:42 · yesterday → yesterday 15:10 · this week → Tue 10/27 · older → 10/12 */
function v149eWhen(x){ var t = v149eTs(x); if(t == null) return ""; var d = new Date(t), now = new Date(), DN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var hm = v149eP2(d.getHours()) + ":" + v149eP2(d.getMinutes()), k = v149eDayKey(t), k0 = v149eDayKey(now.getTime()), y = new Date(now); y.setDate(y.getDate() - 1);
  if(k === k0) return hm; if(k === v149eDayKey(y.getTime())) return "yesterday " + hm;
  var days = (now.getTime() - t) / 864e5; if(days > 0 && days < 6.5) return DN[d.getDay()] + " " + (d.getMonth() + 1) + "/" + d.getDate();
  return (d.getMonth() + 1) + "/" + d.getDate(); }
function v149eAgo(x){ var t = v149eTs(x); if(t == null) return ""; var m = Math.round((Date.now() - t) / 60000); if(m < 1) return "just now"; if(m < 60) return m + " min ago";
  var h = Math.floor(m / 60); if(h < 24) return h + " h" + (h < 3 && m % 60 >= 5 ? " " + (m % 60) + " min" : "") + " ago"; return Math.round(h / 24) + " d ago"; }
/* a part's date: today · Fri (this week ahead) · 10/31 */
function v149eDay(x){ var t = v149eTs(x); if(t == null) return String(x || ""); var d = new Date(t), now = new Date(), DN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if(v149eDayKey(t) === v149eDayKey(now.getTime())) return "today"; var days = (t - now.getTime()) / 864e5;
  if(days > 0 && days < 6) return DN[d.getDay()]; return (d.getMonth() + 1) + "/" + d.getDate() + (days < -0.5 ? " (late)" : ""); }
function v149eCut(s, n){ s = String(s || "").replace(/\s+/g, " ").trim(); n = n || 60; return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s; }
function v149eCap(s){ s = String(s || ""); return s.charAt(0).toUpperCase() + s.slice(1); }
function v149eIsAuto(by){ return !by || by === "Parsec" || /^Automation/i.test(by); }
function v149eWhoName(by){ if(v149eIsAuto(by)) return "Parsec"; var s = String(by).trim(); if(/^admin$/i.test(s)) return "Admin"; return s.split(/\s+/)[0]; }
/* who is changing things right now — an automation is Parsec */
function v149eWho(){ if(typeof AUTO_BY !== "undefined" && AUTO_BY) return "Parsec";
  var n = ""; try{ n = punchByName(); }catch(e){} return String(n || "").trim() || "Admin"; }
/* ---------- who set it: stamped at save — only on statuses that changed since the last look (a load, an Undo or a new RO is just looked at) ---------- */
var V149E_SEEN = typeof WeakSet === "function" ? new WeakSet() : null, V149E_RO = typeof WeakSet === "function" ? new WeakSet() : null,
    V149E_PST = typeof WeakMap === "function" ? new WeakMap() : null, V149E_STATE = null;
function v149eStamp(){
  if(!V149E_SEEN || typeof STATE === "undefined" || !STATE || !Array.isArray(STATE.ros)) return;
  var fresh0 = V149E_STATE !== STATE; V149E_STATE = STATE; var who = null, W = function(){ return who || (who = v149eWho()); };
  STATE.ros.forEach(function(ro){
    var fresh = fresh0 || !V149E_RO.has(ro); V149E_RO.add(ro);
    var st = ro.status; if(st && typeof st === "object" && !V149E_SEEN.has(st)){ V149E_SEEN.add(st); if(!fresh && !st.by) st.by = W(); }
    (ro.operations || []).forEach(function(op){
      var js = op.jobStatus; if(js && typeof js === "object" && !V149E_SEEN.has(js)){ V149E_SEEN.add(js); if(!fresh && !js.by) js.by = W(); }
      (op.parts || []).forEach(function(p){
        if(!p || typeof p !== "object") return; var was = V149E_PST.get(p), now = p.status || "Not Ordered";
        if(was === undefined || fresh){ V149E_PST.set(p, now); return; }
        if(was !== now){ V149E_PST.set(p, now); p.stBy = W(); if(!p.statusChangedAt || Date.now() - new Date(p.statusChangedAt).getTime() > 5000) p.statusChangedAt = nowIso(); }
      });
    });
  });
}
/* ---------- an operation's status: where it came from (the same order opStatusRaw reads it in) ---------- */
function v149eOpSrc(op){
  if(op.declined) return { at: op.declinedAt || null, by: op.declinedBy || "" };
  var run = (STATE.punches || []).filter(function(p){ return p.opId === op.id && !p.stop; })[0]; if(run) return { at: run.start, by: punchWho(run) };
  var ps = (STATE.punches || []).filter(function(p){ return p.opId === op.id && p.stop; }).sort(function(a, b){ return new Date(a.stop) - new Date(b.stop); }), last = ps[ps.length - 1] || null, js = op.jobStatus;
  if(js && js.status && (!last || new Date(last.stop) <= new Date(js.setAt))) return { at: js.setAt, by: js.by || "" };
  if(last) return { at: last.stop, by: punchWho(last) };
  return { at: null, by: "" };
}
function v149ePartsWhy(op){
  var P = (op.parts || []).filter(function(p){ return p && !/^(Received|Staged|Picked up|Installed|Returned)$/.test(p.status || ""); }); if(!P.length) return "";
  var no = P.filter(function(p){ return !p.status || p.status === "Not Ordered"; }).length, bo = P.filter(function(p){ return p.status === "Backordered"; }).length, on = P.length - no;
  var etas = P.map(function(p){ return v149eTs(p.eta); }).filter(function(t){ return t != null; }).sort(function(a, b){ return a - b; });
  var a = []; if(on) a.push(on + " part" + (on > 1 ? "s" : "") + (bo === on ? " backordered" : " on order")); if(no) a.push(no + " not ordered yet"); if(etas.length) a.push("ETA " + v149eDay(etas[etas.length - 1]));
  return a.join(" · ");
}
function v149ePartWhy(p){
  var st = p.status || "Not Ordered", a = [], q = parseFloat(p.qty) || 1;
  if(/^(Ordered|Backordered)$/.test(st)){ a.push(st === "Backordered" ? "Backordered" : "On order"); if(p.eta) a.push("ETA " + v149eDay(p.eta)); if(p.sup) a.push(p.sup); else if(p.po) a.push("PO " + p.po); }
  else if(/^(Received|Staged)$/.test(st)) a.push(p.bin ? "In hand · bin " + p.bin : "In hand");
  else a.push(V149E_PWHY[st] || "");
  if(q > 1) a.push("× " + (Math.round(q * 100) / 100));
  return a.filter(Boolean).join(" · ");
}
/* the tip for a status pill. o.of: the RO, operation or part it belongs to (o.ofKind 'ro' | 'op' | 'part'); without one — what the status means */
function pgStTip(kind, S, o){
  o = o || {}; var of = o.of, k = o.ofKind || (kind === "part" ? "part" : "ro"), lab = S.label, since = null, by = "", why = "";
  try{
    if(of && k === "ro"){ var rs = roStatus(of); why = (rs && rs.sub) || ""; if(of.status && typeof of.status === "object"){ since = of.status.setAt || null; by = of.status.by || ""; }
      if(!why && S.key === "Waiting – Parts") why = (of.operations || []).filter(function(x){ return !x.declined; }).map(v149ePartsWhy).filter(Boolean)[0] || ""; }
    else if(of && k === "op"){ var os = opStatus(of); why = os && typeof os === "object" ? os.sub || "" : ""; var src = v149eOpSrc(of); since = src.at; by = src.by;
      if(S.key === "Waiting – Parts") why = v149ePartsWhy(of) || why;
      if(S.key === "Declined") why = of.appr && of.appr.s === "no" ? "The customer declined it" : "Declined on the RO"; }
    else if(of && k === "part"){ since = of.statusChangedAt || null; by = of.stBy || ""; why = v149ePartWhy(of); }
  }catch(e){}
  if(/^Ordered \((\d+)\)$/.test(why)) why = why.replace(/^Ordered \((\d+)\)$/, function(_, n){ return n + " part" + (n > 1 ? "s" : "") + " on order"; });
  if(/^Backordered \((\d+)\)$/.test(why)) why = why.replace(/^Backordered \((\d+)\)$/, function(_, n){ return n + " part" + (n > 1 ? "s" : "") + " backordered"; });
  if(!why) why = (kind === "part" ? V149E_PWHY : kind === "claim" ? V149E_CWHY : V149E_WHY)[S.key] || "";
  var L = [v149eCut(lab + (since ? " · since " + v149eWhen(since) : ""))];
  if(why && why.toLowerCase() !== String(lab).toLowerCase()) L.push(v149eCut(v149eCap(why)));
  if(of && since && by) L.push("Set by " + v149eWhoName(by) + " · " + v149eAgo(since));
  return L.join("|");
}
/* ---------- initials: the name and the role ---------- */
function v149eAvTip(n){
  n = String(n == null ? "" : n).trim(); if(!n || n === "?" || n === "—") return "";
  if(n === "Parsec" || n === "P") return "Parsec · automations";
  var sf = null; try{ sf = typeof staffForTech === "function" ? staffForTech(n) : null; }catch(e){}
  if(!sf && typeof staffList === "function"){ try{ var lo = n.toLowerCase(); sf = staffList().filter(function(s){ return s && s.name && s.name.toLowerCase() === lo; })[0] || null; }catch(e){} }
  var nm = sf && sf.name ? sf.name : n, role = sf && sf.role ? sf.role : "";
  if(!role && typeof rtTechs === "function"){ try{ if(rtTechs().some(function(t){ return techSame(t, nm); })) role = "Technician"; }catch(e){} }
  return nm + (role ? " · " + role : "");
}
function v149eAvAttr(n){ var t = v149eAvTip(n); return t ? ' data-tip="' + String(t).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }) + '"' : ""; }
/* ---------- the Technician list: the waiting lane's words explain themselves ---------- */
function v149eTcTip(o){ try{ if(!o || !o.op) return ""; var st = opStatus(o.op), n = typeof st === "string" ? st : st && st.status; if(!n) return "";
  return pgStTip("ro", pgStOf("ro", n), { of: o.op, ofKind: "op" }); }catch(e){ return ""; } }
function v149eAttr(t){ return t ? ' data-tip="' + String(t).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }) + '" data-tip-keep' : ""; }

function pgStEl(kind, s, o){ var t = document.createElement("template"); t.innerHTML = pgSt(kind, s, o); var n = t.content.firstChild;
  if(o && o.onClick) n.addEventListener("click", o.onClick); return n; }
