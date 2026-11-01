/* ============================== Parsec 14.1 — the RO flow: soft gates, comebacks, one release list, RO details everywhere ==============================
   · pgAsk: one small question dialog (the 12.9 "reopen" look) — Finish anyway / Write the story, Start anyway / Wait, Reopen as a comeback…
   · Done with no story, 0:00 clocked, or parts not installed asks instead of refusing (opCompleteGaps is wrapped)
   · Start on an ASIST-Pending operation warns once (doStartPunch is wrapped)
   · A new RO whose truck was released in the last 90 days: reopen the old RO as a comeback, or open a new one tagged "comeback of"
   · ROFLD: the RO's editable details, one table — the RO page, the RO list pane and the Technician pane all edit through it */
var V141 = { ok: {}, oks: {}, q: [], t: null, el: null, cb: null };
function v141E(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function v141Render(){ try{ render(); }catch(e){} try{ if(typeof JC !== "undefined" && JC && JC.rerender) JC.rerender(); }catch(e){} }
/* ---------- the question ---------- */
function pgAskClose(){ if(V141.el){ V141.el.remove(); V141.el = null; } V141.cb = null; document.removeEventListener("keydown", pgAskKey, true); }
function pgAskKey(e){
  if(!V141.el) return;
  if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); var c = V141.cb; pgAskClose(); if(c) c(null); return; }
  if(e.key === "Enter"){ var b = document.activeElement; if(b && V141.el.contains(b) && b.tagName === "BUTTON") return; e.preventDefault(); e.stopPropagation(); var p = V141.el.querySelector(".roreo-b.pri"); if(p) p.click(); return; }
  if(!/^(Tab|Shift)$/.test(e.key)) e.stopPropagation();
}
/* o = { head, sub, list: [[b, small]…], icon: svg paths, buttons: [{ k, l, pri }] }, cb(k) — null when it's closed */
function pgAsk(o, cb){
  pgAskClose();
  var w = document.createElement("div"); w.className = "roreo pgask"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-label", o.head);
  var list = (o.list || []).slice(0, 6).map(function(x){ return "<li><b>" + v141E(x[0]) + "</b><span>" + v141E(x[1] || "") + "</span></li>"; }).join("");
  w.innerHTML = '<div class="roreo-c"><div class="roreo-h"><span class="roreo-i" aria-hidden="true"><svg viewBox="0 0 24 24">' + (o.icon || '<path d="M12 8v5"/><circle cx="12" cy="16.5" r=".6"/><circle cx="12" cy="12" r="9"/>') + '</svg></span><div><b>' + v141E(o.head) + '</b><p>' + v141E(o.sub || "") + '</p></div></div>'
    + (list ? '<ul class="roreo-l">' + list + '</ul>' : '') + '<div class="roreo-a">' + o.buttons.map(function(b){ return '<button type="button" class="roreo-b' + (b.pri ? " pri" : "") + '" data-ask="' + v141E(b.k) + '">' + v141E(b.l) + '</button>'; }).join("") + '</div></div>';
  w.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-ask]");
    if(!b){ if(e.target === w){ var c0 = V141.cb; pgAskClose(); if(c0) c0(null); } return; }
    var k = b.getAttribute("data-ask"), c = V141.cb; pgAskClose(); if(c) c(k);
  });
  document.body.appendChild(w); V141.el = w; V141.cb = cb;
  document.addEventListener("keydown", pgAskKey, true);
  var pri = w.querySelector(".roreo-b.pri"); if(pri) try{ pri.focus({ preventScroll: true }); }catch(e){}
  return w;
}
/* ---------- 1 + 2: Done asks instead of refusing ---------- */
function v141RoOf(op){ return (STATE.ros || []).filter(function(r){ return (r.operations || []).indexOf(op) > -1; })[0] || null; }
function v141OpN(ro, op){ return ro ? (ro.operations || []).indexOf(op) + 1 : 0; }
function v141Gaps(op){
  var g = []; try{ g = opCompleteGaps0(op); }catch(e){ g = []; }
  var now = Date.now(); if(V141.ok[op.id] && V141.ok[op.id] > now) return g;   /* "Finish anyway" answers the story and the clock — not a part that isn't in (Parsec 14.3) */
  var run = false; try{ run = (STATE.punches || []).some(function(p){ return p.opId === op.id && !p.stop; }); }catch(e){}
  var b = 0; try{ b = opCalc(op).burntHrs || 0; }catch(e){}
  var story = false; try{ story = !!(fcHasCause(op) || fcHasFix(op) || String(op.work || "").replace(/<[^>]*>/g, "").trim()); }catch(e){}
  if(!story && !g.some(function(x){ return x.k === "notes"; })) g.push({ k: "notes", t: "no story" });
  if(!b && !run && !g.some(function(x){ return x.k === "time"; })) g.push({ k: "time", t: "0:00 clocked" });
  return g;
}
/* the question, only when someone presses Done / stops as Complete — never while drawing a page */
function v141GapsAsk(op){ var g = v141Gaps(op); if(g.length) v141AskDone(op, g); return g; }
function v141AskDone(op, g){
  if(V141.q.some(function(x){ return x.op === op; })) return;
  V141.q.push({ op: op, g: g }); clearTimeout(V141.t); V141.t = setTimeout(v141ShowDone, 60);
}
function v141ShowDone(){
  var Q = V141.q.splice(0).filter(function(y){ return !!v141RoOf(y.op) && !(y.op.jobStatus && /^Complete/.test(y.op.jobStatus.status || "")); });   /* Parsec 14.3: not for an op an Undo replaced, or one already finished */
  if(!Q.length || V141.el) return;
  var x = Q[0], op = x.op, ro = v141RoOf(op), n = v141OpN(ro, op), parts = x.g.filter(function(y){ return y.k === "parts"; })[0];
  var story = x.g.filter(function(y){ return y.k === "notes"; }).length, tm = x.g.filter(function(y){ return y.k === "time"; }).length;
  var bits = []; if(story) bits.push("No story on Op " + n); if(tm) bits.push("0:00 clocked"); if(parts) bits.push(parts.t);
  var head = "Op " + n + " isn’t finished — finish it anyway?", sub = bits.join(" · ") + (Q.length > 1 ? " · " + (Q.length - 1) + " more operation" + (Q.length > 2 ? "s" : "") + " waiting" : "");
  var B = parts ? [{ k: "story", l: story ? "Write the story" : "Not yet" }, { k: "parts", l: "Mark " + (parts.t.replace(/ not installed$/, "").replace(/^(\d+) parts?$/, "them") === "them" ? "them" : "it") + " installed and finish", pri: true }]
                : [{ k: "story", l: story ? "Write the story" : "Not yet" }, { k: "go", l: "Finish anyway", pri: true }];
  pgAsk({ head: head, sub: sub, list: [[(ro ? roLabel(ro) + " · " : "") + "Op " + n, op.complaint || "Operation"]], buttons: B,
    icon: '<path d="M6 12.5l4 4 8-9"/>' }, function(k){
    if(k === "parts" || k === "go") v141Finish(op, ro, k === "parts");
    else if(k === "story" && story && ro){ UI.view = "ros"; UI.selectedRo = ro.id; UI.roOp = UI.roOp || {}; UI.roOp[ro.id] = op.id; UI.modal = null; v141Render(); }
    if(Q.length > 1){ V141.q = Q.slice(1); V141.t = setTimeout(v141ShowDone, 120); }
  });
}
function v141Finish(op, ro, installParts){
  pushUndo("finish operation");
  var n = v141OpN(ro, op), done = [];
  if(installParts){ try{ opRealParts(op).forEach(function(p){ if(p.status !== "Installed"){ p.status = "Installed"; p.statusChangedAt = nowIso(); done.push(p); } }); }catch(e){} }
  V141.ok[op.id] = Date.now() + 8000;
  var rp = null; try{ rp = runningPunch(); }catch(e){}
  if(rp && rp.opId === op.id){ try{ doStopPunch("Complete"); }catch(e){} }
  else {
    var last = (STATE.punches || []).filter(function(p){ return p.opId === op.id && p.stop; }).sort(function(a, b){ return new Date(b.stop) - new Date(a.stop); })[0];
    if(last && Date.now() - new Date(last.stop) < 90000 && last.stopReason === "Hold Tech") last.stopReason = "Complete";   /* the clock just stopped on the gate — it stops as Complete */
    op.jobStatus = { status: "Complete", sub: null, setAt: nowIso(), hand: true };
  }
  try{ markStatusFlip(ro); }catch(e){}
  try{ audit("status", (ro ? roLabel(ro) : "") + " Op " + n + " finished" + (installParts ? " — " + done.length + " part" + (done.length === 1 ? "" : "s") + " marked installed" : " without a story"), ro); }catch(e){}
  scheduleSave(true); v141Render();
  pushToast("Op " + n + " finished" + (installParts && done.length ? " · " + done.length + " part" + (done.length === 1 ? "" : "s") + " installed" : "") + ".", true);
}
/* ---------- 3: starting an operation ASIST hasn't approved ---------- */
function v141Pending(op){ return !!op && !op.appr && /^(pend|await|not\s*appr|approval\s*pend)/i.test(String(op.asistApproval || "")); }
function v141StartGate(roId, opId, reason){
  var op = null; try{ op = getOp(roId, opId); }catch(e){} if(!op || !v141Pending(op) || V141.oks[op.id]) return false;
  var ro = getRO(roId), n = v141OpN(ro, op);
  pgAsk({ head: "Op " + n + " isn’t approved yet", sub: "ASIST still says " + (op.asistApproval || "Pending") + " and nobody has approved it in Parsec. Start the clock anyway?",
    list: [[(ro ? roLabel(ro) + " · " : "") + "Op " + n, op.complaint || "Operation"]], buttons: [{ k: "wait", l: "Wait" }, { k: "go", l: "Start anyway", pri: true }],
    icon: '<path d="M12 8v5"/><circle cx="12" cy="16.5" r=".6"/><circle cx="12" cy="12" r="9"/>' }, function(k){
    if(k !== "go") return;
    V141.oks[op.id] = 1;
    try{ doStartPunch0(roId, opId, reason); }catch(e){ console.error(e); return; }
    try{ audit("start", (ro ? roLabel(ro) : "") + " Op " + n + " started before its approval (ASIST: " + (op.asistApproval || "Pending") + ")", ro); }catch(e){}
    v141Render(); pushToast("Started Op " + n + " before its approval — ASIST still says " + (op.asistApproval || "Pending") + ".", true);
  });
  return true;
}
/* ---------- 4: the truck was just here — a comeback? ---------- */
function v141PriorRo(ro){
  if(!ro || ro.shop || ro.id === SHOP_RO_ID) return null;
  var vin = String(ro.vin || "").toUpperCase(), unit = String(ro.unitNumber || "").toUpperCase(), cust = String(ro.customerName || "").toLowerCase(), lim = Date.now() - 90 * 864e5;
  var L = (STATE.ros || []).filter(function(r){
    if(r === ro || r.shop || r.id === SHOP_RO_ID || !r.dateClosed) return false;
    var st = roStatus(r).status; if(st !== "Complete – Released") return false;
    if(new Date(r.dateClosed) < lim) return false;
    if(vin && String(r.vin || "").toUpperCase() === vin) return true;
    return !vin && unit && cust && String(r.unitNumber || "").toUpperCase() === unit && String(r.customerName || "").toLowerCase() === cust;
  }).sort(function(a, b){ return new Date(b.dateClosed) - new Date(a.dateClosed); });
  return L[0] || null;
}
function v141Comeback(ro){
  var old = v141PriorRo(ro); if(!old || ro.comebackOf || ro.comebackAsked) return false;
  ro.comebackAsked = 1;
  var days = Math.max(0, Math.round((Date.now() - new Date(old.dateClosed)) / 864e5)), when = new Date(old.dateClosed).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  var ops = (old.operations || []).filter(function(o){ return !o.declined; }).map(function(o){ return o.complaint || "Operation"; });
  pgAsk({ head: "This truck was here " + (days === 0 ? "today" : days + " day" + (days === 1 ? "" : "s") + " ago"),
    sub: roLabel(old) + " was released " + when + (old.customerName ? " · " + old.customerName : "") + ". Your rule: a comeback reopens the same RO.",
    list: [[roLabel(old), ops.slice(0, 3).join(" · ") + (ops.length > 3 ? " · +" + (ops.length - 3) : "")], [roLabel(ro) + " (new)", ((ro.operations || []).map(function(o){ return o.complaint; }).filter(Boolean).slice(0, 3).join(" · ")) || "no operations yet"]],
    buttons: [{ k: "new", l: "Open a new RO anyway" }, { k: "reopen", l: "Reopen " + roLabel(old) + " as a comeback", pri: true }],
    icon: '<path d="M8.5 7.5L4.5 11.5l4 4"/><path d="M4.5 11.5h10a5 5 0 0 1 0 10h-3"/>' }, function(k){
    if(k === "reopen") v141Reopen(old, ro);
    else if(k === "new"){ pushUndo("comeback tag"); ro.comebackOf = old.id; ro.comeback = { at: nowIso(), of: old.roNumber }; try{ audit("ro", roLabel(ro) + " opened as a comeback of " + roLabel(old), ro); }catch(e){} scheduleSave(true); v141Render(); pushToast(roLabel(ro) + " is tagged comeback of " + roLabel(old) + ".", true); }
  });
  return true;
}
function v141Reopen(old, ro){
  pushUndo("reopen as comeback");
  var moved = 0;
  (ro.operations || []).forEach(function(o){ o.jobType = "COMEBACK"; o.comebackAt = nowIso(); old.operations.push(o); moved++; });
  if(!moved) old.operations.push({ id: uid("op"), complaint: "Comeback — " + ((old.operations[0] || {}).complaint || "see the last visit"), cause: "", correction: "", quoted: 0, isStandard: false, standardName: null, declined: false, parts: [], burnt: 0, work: "", jobType: "COMEBACK", comebackAt: nowIso() });
  ["mileage", "engineHours", "keyTag", "location", "caseNumber", "poNumber"].forEach(function(k){ if(ro[k]) old[k] = ro[k]; });
  old.comeback = { at: nowIso(), ofRo: ro.roNumber || "", n: (old.comeback && old.comeback.n || 0) + 1 };
  old.dateClosed = null; delete old.dateClosedAuto; delete old.releaseRec; delete old.roadTest; delete old.truckChecks;
  old.status = { status: "Hold Tech", sub: null, setAt: nowIso(), hand: true, base: (typeof roOpsKey === "function" ? roOpsKey(old) : null) };
  old.dateReopened = nowIso();
  (STATE.punches || []).forEach(function(p){ if(p.roId === ro.id) p.roId = old.id; });
  STATE.ros = STATE.ros.filter(function(r){ return r !== ro; });
  try{ audit("ro", roLabel(old) + " reopened as a comeback" + (ro.roNumber ? " (ASIST " + roLabel(ro) + ")" : "") + " — " + moved + " operation" + (moved === 1 ? "" : "s") + " added", old); }catch(e){}
  if(UI.selectedRo === ro.id) UI.selectedRo = old.id;
  scheduleSave(true); v141Render();
  pushToast(roLabel(old) + " is open again as a comeback — " + (moved || 1) + " operation" + ((moved || 1) === 1 ? "" : "s") + " marked COMEBACK.", true);
}
/* ---------- 5: the RO waits on parts only when every open operation does ---------- */
function v141Workable(live){
  return live.filter(function(o){ var s = autoStatusName(opStatus(o)); return (s === "Hold Tech" || s === "Working") && !v141Pending(o); });   /* an op ASIST still shows as Pending isn't work you can do yet */
}
/* ---------- 6 + 7: one release list ---------- */
function v141Hand(ro){
  var W = []; try{ W = trxWalk(); }catch(e){}
  var hasKeys = W.some(function(w){ return /\bkey/i.test(w); }), hasClean = W.some(function(w){ return /clean|tools out/i.test(w); }), rt = true; try{ rt = rtNeeded(ro); }catch(e){}
  return RELEASE_CHECK.filter(function(x){ if(x[0] === "road") return false; if(!rt) return true; if(x[0] === "keys" && hasKeys) return false; if(x[0] === "clean" && hasClean) return false; return true; });
}
function v141WalkH(ro){
  var rt = true; try{ rt = rtNeeded(ro); }catch(e){} if(!rt) return "";
  var C = trxQc(ro), W = trxWalk(); if(!W.length) return "";
  return '<span class="tg-lbl top">Walk-around <small>' + C.n + ' of ' + C.of + '</small></span><div class="tg-r v141-walk">' + W.map(function(w, i){ var on = C.ticks.indexOf(w) > -1;
    return '<button class="tg-chip tick' + (on ? ' on' : '') + '" data-action="tg-qc" data-f="tick" data-v="' + i + '" title="' + v141E(w) + '">' + (on ? tgI("check", 12) : '') + v141E(w) + '</button>'; }).join('') + '</div>';
}
function v141WalkSync(ro){ /* ticking the walk-around counts for the handover's keys and clean */
  var rs = releaseState(ro), W = trxWalk(), C = trxQc(ro);
  W.forEach(function(w){ var on = C.ticks.indexOf(w) > -1; if(on && /\bkey/i.test(w)) rs.keys = true; if(on && /clean|tools out/i.test(w)) rs.clean = true; });
}
function v141Hours(ro){
  var live = raLive(ro), sold = 0, clk = 0;
  live.forEach(function(o){ sold += +o.quoted || 0; try{ clk += opCalc(o).burntHrs || 0; }catch(e){} });
  return { sold: sold, clk: clk, bad: sold > 0 && clk < 0.005 };
}
function v141Story(ro){
  var live = raLive(ro), no = live.filter(function(o){ return !(fcHasCause(o) || fcHasFix(o) || String(o.work || "").replace(/<[^>]*>/g, "").trim()); });
  return { n: no.length, of: live.length, op: no[0] };
}
function v141RelLines(ro, L){
  var s = v141Story(ro), h = v141Hours(ro);
  L.push({ k: "story", ok: !s.n, t: "Story on every operation", d: s.n ? s.n + " of " + s.of + " without a story" : "every operation has one", fix: s.n ? "Open RO" : null, op: s.op });
  L.push({ k: "hours", ok: !h.bad, t: "Hours", d: h.clk.toFixed(1) + " h clocked of " + h.sold.toFixed(1) + " h sold" + (h.bad ? " — a note is needed to release" : ""), fix: null });
  return L;
}
/* ---------- 8: the RO's details, one table ---------- */
function roFldTrim(v){ return String(v == null ? "" : v).trim(); }
function roFldDT(k){ return { dt: 1, get: function(ro){ if(!ro[k]) return ""; var d = new Date(ro[k]); if(isNaN(d)) return ""; d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); },
  set: function(ro, v){ v = roFldTrim(v); if(!v){ delete ro[k]; return; } var d = new Date(v); if(!isNaN(d)) ro[k] = d.toISOString(); },
  show: function(ro){ return ro[k] ? fcWhen(new Date(ro[k])) : ""; } }; }
/* Parsec 14.7: a day kept as typed (MM-DD-YYYY, like the import and the warranty pages read it) — a date box to edit it */
function roFldPD(x){ if(!x) return null; var s = String(x).trim(), m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s); if(m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = /^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})$/.exec(s); if(m){ var y = +m[3]; if(y < 100) y += 2000; return new Date(y, +m[1] - 1, +m[2]); } var d = new Date(s); return isNaN(d) ? null : d; }
function roFldP2(n){ return String(n).padStart(2, "0"); }
function roFldDay(k){ return { type: "date", empty: "Add date",
  get: function(ro){ var d = roFldPD(ro[k]); return d ? d.getFullYear() + "-" + roFldP2(d.getMonth() + 1) + "-" + roFldP2(d.getDate()) : ""; },
  set: function(ro, v){ v = roFldTrim(v); if(!v){ ro[k] = ""; return; } var d = roFldPD(v); ro[k] = d ? roFldP2(d.getMonth() + 1) + "-" + roFldP2(d.getDate()) + "-" + d.getFullYear() : v; },
  show: function(ro){ var d = roFldPD(ro[k]); return d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : (ro[k] ? String(ro[k]) : ""); } }; }
function roFldDay2(iso){ var d = iso ? new Date(iso) : null; return d && !isNaN(d) ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""; }
function roFldN(v, unit){ var n = Number(String(v).replace(/[^\d.]/g, "")); return isFinite(n) && String(v).trim() ? n.toLocaleString("en-US") + unit : ""; }
var ROFLD = [
  ["vehicle", "Vehicle", [
    ["year", "Model year", { num: 1, empty: "Add year", get: function(ro){ return ro.year ? String(ro.year) : ""; }, set: function(ro, v){ var y = +String(v || "").replace(/\D/g, ""); if(y >= 1980 && y <= new Date().getFullYear() + 2) ro.year = y; else delete ro.year; delete ro.trkBody; delete ro.trkTrim; } }],
    ["make", "Make", { empty: "Add make", set: function(ro, v){ v = roFldTrim(v); if(v) ro.make = v; else delete ro.make; delete ro.trkBody; } }],
    ["model", "Model", { empty: "Add model", set: function(ro, v){ ro.model = roFldTrim(v); delete ro.trkBody; delete ro.trkTrim; } }],
    ["buildDate", "Build date", roFldDay("buildDate")],
    ["warrantyStart", "Warranty start", roFldDay("warrantyStart")],
    ["vin", "VIN", { id: 1, copy: 1, empty: "Add VIN", set: function(ro, v){ ro.vin = roFldTrim(v).toUpperCase().replace(/[^A-Z0-9]/g, ""); }, warn: function(v){ v = roFldTrim(v); return v && v.length !== 17 ? "A VIN has 17 characters" : ""; } }],
    ["unitNumber", "Unit", { empty: "Add unit" }],
    ["mileage", "Mileage", { num: 1, empty: "Add mileage", show: function(ro){ return roFldN(ro.mileage, " mi"); }, set: function(ro, v){ ro.mileage = roFldTrim(v).replace(/[^\d.]/g, ""); } }],
    ["engineHours", "Engine hours", { num: 1, empty: "Add hours", show: function(ro){ return roFldN(ro.engineHours, " h"); }, set: function(ro, v){ ro.engineHours = roFldTrim(v).replace(/[^\d.]/g, ""); } }],
    ["engineType", "Engine", { empty: "Add engine" }],
    ["engineSerial", "Engine serial", { id: 1, empty: "Add serial", set: function(ro, v){ ro.engineSerial = roFldTrim(v).toUpperCase(); } }],
    ["chassis", "Chassis", { id: 1, empty: "Add chassis" }],
    ["keyTag", "Key tag", { id: 1, empty: "Add tag" }],
    ["location", "Spot", { empty: "Add spot" }],
    ["department", "Department", { empty: "Add department" }],
    ["dateOpened", "Opened", Object.assign(roFldDT("dateOpened"), { empty: "Add date", show: function(ro){ return roFldDay2(ro.dateOpened); } })],
    ["dateClosed", "Closed", Object.assign(roFldDT("dateClosed"), { lock: function(ro){ return !ro.dateClosed; }, show: function(ro){ return ro.dateClosed ? roFldDay2(ro.dateClosed) : "Open"; },
      set: function(ro, v){ v = roFldTrim(v); if(!v || !ro.dateClosed) return; var d = new Date(v); if(!isNaN(d)){ ro.dateClosed = d.toISOString(); ro.dateClosedAuto = false; } } })]]],   /* Parsec 14.7: opened and closed with the truck; Closed changes only on a closed RO */
  ["customer", "Customer", [
    ["customerName", "Customer", { empty: "Add customer" }],
    ["custNo", "Cust #", { id: 1, empty: "Add" }],
    ["poNumber", "PO #", { id: 1, empty: "Add PO" }],
    ["contactName", "Contact", { empty: "Add who to call" }],
    ["contactPhone", "Phone", { empty: "Add a number", type: "tel" }]]],
  ["people", "People", [
    ["assignedTech", "Technician", { empty: "Not assigned", list: "tech", av: 1 }],
    ["advisor", "Advisor", { empty: "Not set", list: "staff", av: 1, get: function(ro){ return ro.advisor || (function(){ try{ return rtPerson("writer"); }catch(e){ return ""; } })(); } }],
    ["foreman", "Foreman", { empty: "Not set", list: "staff", av: 1, get: function(ro){ return ro.foreman || (function(){ try{ return rtPerson("foreman"); }catch(e){ return ""; } })(); } }]]],
  ["schedule", "Schedule", [
    ["promisedAt", "Promised", roFldDT("promisedAt")],
    ["followUpAt", "Follow-up", roFldDT("followUpAt")]]],
  ["paperwork", "Case", [
    ["caseNumber", "Case #", { id: 1, copy: 1, empty: "Add case" }],
    ["authNumber", "Auth #", { id: 1, empty: "Add auth" }],
    ["techSupportCase", "Tech support", { id: 1, empty: "Add case" }]]]
];
function roFld(k){ for(var g = 0; g < ROFLD.length; g++){ var F = ROFLD[g][2]; for(var i = 0; i < F.length; i++) if(F[i][0] === k) return { k: k, l: F[i][1], o: F[i][2] || {}, g: ROFLD[g][0] }; } return null; }
function roFldGet(ro, f){ return f.o.get ? f.o.get(ro) : (ro[f.k] == null ? "" : String(ro[f.k])); }
function roFldShow(ro, f){ if(f.o.show) return f.o.show(ro); return roFldGet(ro, f); }
function roFldCanEdit(ro){ try{ if(typeof canPage === "function" && !canPage("ros")) return false; }catch(e){} return !!ro && !ro.shop && ro.id !== SHOP_RO_ID; }
/* the one setter: Undo, the value, the Activity line, save — everything edits through here */
function roFldSet(ro, k, v){
  var f = roFld(k); if(!f || !ro) return false;
  var was = roFldShow(ro, f);
  pushUndo(f.l.toLowerCase());
  if(f.o.set) f.o.set(ro, v); else { v = roFldTrim(v); if(v) ro[k] = v; else delete ro[k]; }
  var now = roFldShow(ro, f);
  try{ audit("ro", roLabel(ro) + ": " + f.l + " " + (was ? "“" + was + "” → " : "set to ") + (now ? "“" + now + "”" : "cleared"), ro); }catch(e){}
  if(k === "assignedTech" && ro.assignedTech){ try{ if(typeof rtSend === "function" && !(ro.route && ro.route.state === "pending")) rtSend(ro, "tech", ro.assignedTech, "Assigned", 4); }catch(e){} }
  scheduleSave(true);
  return true;
}
/* for the RO page's pxProp: { get, set, type } through the same table */
function roFldEdit(ro, k){ var f = roFld(k); if(!f) return null; return { type: f.o.dt ? "datetime-local" : f.o.type || "text", get: function(){ return roFldGet(ro, f); }, set: function(v){ if(f.o.set) f.o.set(ro, v); else { v = roFldTrim(v); if(v) ro[k] = v; else delete ro[k]; } try{ audit("ro", roLabel(ro) + ": " + f.l + " → " + (roFldShow(ro, f) || "cleared"), ro); }catch(e){} } }; }
/* the groups as HTML for the RO list pane and the Technician pane (light DOM; the click handler below edits) */
function roDetailsHtml(ro, o){
  o = o || {}; var fold = UI.rodFold || (UI.rodFold = { vehicle: false, customer: true, people: false, schedule: false, paperwork: true }), ed = o.readOnly ? false : roFldCanEdit(ro);
  var av = function(n){ var i = ""; try{ i = ivInit(n); }catch(e){ i = String(n || "").split(/\s+/).map(function(w){ return w[0] || ""; }).join("").slice(0, 2).toUpperCase(); } return '<span class="rod-av">' + v141E(i) + "</span>" + v141E(n); };
  return '<section class="rod' + (ed ? " ed" : "") + '" data-rod-ro="' + v141E(ro.id) + '">' + ROFLD.filter(function(G){ return !o.groups || o.groups.indexOf(G[0]) > -1; }).map(function(G){
    var shut = !!fold[G[0]], F = G[2].filter(function(fd){ return !(fd[2] && fd[2].hideEmpty && !roFldGet(ro, { k: fd[0], o: fd[2] })); });
    var sum = G[0] === "vehicle" ? [ro.year, ro.model].filter(Boolean).join(" ") : G[0] === "customer" ? ro.customerName || "" : G[0] === "people" ? (ro.assignedTech ? (function(){ try{ return ivInit(ro.assignedTech); }catch(e){ return ""; } })() : "") : G[0] === "schedule" ? (ro.promisedAt ? fcWhen(new Date(ro.promisedAt)) : "") : ro.caseNumber || "";
    return '<div class="rod-g' + (shut ? " shut" : "") + '"><button type="button" class="rod-gh" data-rod-g="' + G[0] + '" aria-expanded="' + (!shut) + '"><i></i><b>' + v141E(G[1]) + '</b><small>' + v141E(sum) + '</small></button>'
      + (shut ? "" : '<div class="rod-rows">' + F.map(function(fd){ var f = { k: fd[0], l: fd[1], o: fd[2] || {} }, v = roFldShow(ro, f), raw = roFldGet(ro, f);
        var edR = ed && !(f.o.lock && f.o.lock(ro));   /* Parsec 14.7 */
        return '<div class="rod-r' + (edR ? " ed" : "") + (v ? "" : " rod-empty") + (f.o.num ? " num" : "") + (f.o.id ? " id" : "") + '" data-rod-k="' + f.k + '" title="' + (edR ? "Click to change" : "") + '"><span>' + v141E(f.l) + '</span><b>' + (v ? (f.o.av ? av(v) : v141E(v)) : v141E(edR ? f.o.empty || "Add" : "—")) + "</b>"
          + (f.o.copy && raw ? '<button type="button" class="rod-cp" data-rod-copy="' + v141E(raw) + '" title="Copy">' + (typeof tgI === "function" ? tgI("copy", 12) : "⧉") + "</button>" : "") + "</div>"; }).join("") + "</div>") + "</div>"; }).join("") + "</section>";
}
function roDetailsEdit(row){
  var sec = row.closest(".rod"), ro = sec && getRO(sec.getAttribute("data-rod-ro")), f = ro && roFld(row.getAttribute("data-rod-k")); if(!ro || !f || row.querySelector("input")) return;
  var b = row.querySelector("b"), cur = roFldGet(ro, f), inp = document.createElement("input");
  inp.className = "rod-in"; inp.type = f.o.dt ? "datetime-local" : f.o.type || "text"; inp.value = cur || ""; inp.setAttribute("data-no-draft", ""); inp.autocomplete = "off";
  if(f.o.list){ var dl = document.createElement("datalist"), id = "rod-dl-" + f.k; dl.id = id; var names = []; try{ names = staffList().filter(function(s){ return f.o.list !== "tech" || s.role === "Technician"; }).map(function(s){ return s.name; }); }catch(e){}
    dl.innerHTML = names.map(function(n){ return '<option value="' + v141E(n) + '">'; }).join(""); inp.setAttribute("list", id); row.appendChild(dl); }
  b.innerHTML = ""; b.appendChild(inp); row.classList.add("editing"); inp.focus(); if(inp.select) try{ inp.select(); }catch(e){}
  var done = false;
  function commit(keep){ if(done) return; done = true; var v = inp.value.trim();
    if(keep && v !== String(cur || "")){ var w = f.o.warn ? f.o.warn(v) : ""; roFldSet(ro, f.k, v); if(w) pushToast(w + " — saved anyway.", false); }
    v141Render(); }
  inp.addEventListener("keydown", function(ev){ ev.stopPropagation(); if(ev.key === "Enter"){ ev.preventDefault(); commit(true); } else if(ev.key === "Escape"){ ev.preventDefault(); commit(false); } else if(ev.key === "Tab"){ ev.preventDefault(); var rows = Array.prototype.slice.call(sec.querySelectorAll(".rod-r.ed")), i = rows.indexOf(row), nx = rows[i + (ev.shiftKey ? -1 : 1)]; commit(true); if(nx) setTimeout(function(){ var s2 = document.querySelector('.rod[data-rod-ro="' + ro.id + '"] .rod-r[data-rod-k="' + nx.getAttribute("data-rod-k") + '"]'); if(s2) roDetailsEdit(s2); }, 60); } });
  inp.addEventListener("blur", function(){ setTimeout(function(){ commit(true); }, 0); });
}
document.addEventListener("click", function(e){
  var t = e.target && e.target.nodeType === 1 ? e.target : e.target && e.target.parentElement; if(!t || !t.closest) return;
  var cp = t.closest(".rod-cp"); if(cp){ e.preventDefault(); e.stopPropagation(); try{ navigator.clipboard.writeText(cp.getAttribute("data-rod-copy")); pushToast("Copied.", false); }catch(err){} return; }
  var gh = t.closest(".rod-gh"); if(gh){ e.preventDefault(); e.stopPropagation(); var F = UI.rodFold || (UI.rodFold = {}); F[gh.getAttribute("data-rod-g")] = !F[gh.getAttribute("data-rod-g")]; v141Render(); return; }
  var r = t.closest(".rod-r.ed"); if(r && !t.closest("input")){ e.preventDefault(); e.stopPropagation(); roDetailsEdit(r); }
}, true);
