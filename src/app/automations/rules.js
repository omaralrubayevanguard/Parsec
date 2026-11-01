/* Parsec · automations · rules.js
   The rules: a rule's context (autoCtx), conditions (autoCondOk), evaluating and applying actions (autoEvaluate / autoApplyActs), AUTO_BUILTINS (the built-in automations with their switches).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   autoCtx jobCalcLite autoCondOk autoFill workingSub autoEvaluate autoActText autoNoop autoApplyActs autoAccept autoDismiss autoPrune … (15 functions, 2 constants)
   state      punches ros
   uses       access/ data/ import/ kit/ pages/inventory/ ro/ ro-page/ shell/ state/
   at load    on document focusout
*/
/* ---------- rules ---------- */
function autoCtx(ev){
  var ro = ev.ro, op = ev.op, p = ev.punch;
  var c = op ? jobCalcLite(op) : null;
  var d = new Date();
  return {
    startReason: p ? p.startReason || "" : "", stopReason: p ? p.stopReason || "" : "",
    jobType: op ? op.jobType || opJobType(op) : "", jobStatus: op ? autoStatusName(opStatus(op)) : "",
    roStatus: ro ? roStatus(ro).status : "", partStatus: ev.part ? ev.part.status || "" : (ev.value && ev.type === "part.status" ? ev.value : ""),
    customer: ro ? ro.customerName || "" : "", overQuoted: c ? (c.over ? "yes" : "no") : "",
    hour: String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0")
  };
}
function jobCalcLite(op){ var c = opCalc(op); return { over: c.totalQuoted > 0 && c.burntHrs > c.totalQuoted }; }
function autoCondOk(cd, ctx){
  var v = String(ctx[cd.f] == null ? "" : ctx[cd.f]), w = String(cd.v == null ? "" : cd.v);
  if(cd.op === "is") return v === w;
  if(cd.op === "not") return v !== w;
  if(cd.op === "contains") return v.toLowerCase().indexOf(w.toLowerCase()) >= 0;
  if(cd.op === "before") return v !== "" && v < w;
  if(cd.op === "after") return v !== "" && v >= w;
  return false;
}
function autoFill(tpl, ev){
  var p = ev.punch || {}, op = ev.op || {};
  var ms = p.start && p.stop ? new Date(p.stop) - new Date(p.start) : 0;
  var vals = { start: p.start ? fmtTime(p.start) : "", stop: p.stop ? fmtTime(p.stop) : "", reason: p.startReason || "", stopReason: p.stopReason || "",
    note: p.notes || "", job: op.complaint || "", date: fmtDate(p.start || nowIso()), hours: ms ? fmtHM(ms) : "", ro: ev.ro ? ev.ro.roNumber : "" };
  return String(tpl || "").replace(/\{(\w+)\}/g, function(m, k){ return Object.prototype.hasOwnProperty.call(vals, k) ? vals[k] : m; }).trim();
}
var WORKING_SUB = { "Diagnosing":"Diagnosing", "Repairing":"Repairing", "Testing":"Testing", "Bench Testing":"Testing" };
function workingSub(r){ return WORKING_SUB[r] || (/^Inspecting/.test(r || "") ? "Inspecting" : null); }

/* every rule, built-in or yours, comes out as: on an event, propose these actions */
function autoEvaluate(events){
  if(!events.length) return 0;
  var cfg = autoCfg(), raised = 0, autoApply = [];
  function propose(ev, rule, ruleName, mode, text, acts, opId, ref, guard){
    var ro = ev.ro; if(!ro) return;
    acts = acts.filter(function(a){ return !autoNoop(ro, a); });
    if(!acts.length) return;
    var key = rule + "|" + (opId || "") + "|" + ref + "|" + acts.map(function(a){ return a.a + ":" + a.v + ":" + (a.op || ""); }).join(",");
    if(!Array.isArray(ro.suggest)) ro.suggest = [];
    if(!ro.sgSeen || typeof ro.sgSeen !== "object") ro.sgSeen = {};
    if(ro.sgSeen[key] || ro.suggest.some(function(s){ return s.key === key; })) return;
    var sg = { id: uid("sg"), key: key, at: nowIso(), op: opId || "", rule: ruleName, text: text, acts: acts };
    if(guard) sg.guard = guard;
    if(mode === "auto") autoApply.push([ro, sg]);
    else { ro.suggest.push(sg); raised++; }
  }
  events.forEach(function(ev){
    var ro = ev.ro, op = ev.op, p = ev.punch, st = ro ? roStatus(ro) : null, b = cfg.builtin, m = cfg.mode;
    /* --- status sync --- */
    if(b.status && false){                                   /* replaced by the automatic RO status below */
      if(ev.type === "punch.start" && p && st.status !== "Working")
        propose(ev, "b.start", "Status sync", m, "Clock started — set RO to Working" + (workingSub(p.startReason) ? " · " + workingSub(p.startReason) : "") + "?",
          [{ a:"roStatus", v:"Working", sub: workingSub(p.startReason) }], "", p.id, { k:"running", punch: p.id });
      if(ev.type === "punch.stop" && p && AUTO_WAITS.indexOf(p.stopReason) >= 0 && !STATE.punches.some(function(x){ return x.roId === ro.id && !x.stop; }))
        propose(ev, "b.wait", "Status sync", m, "Stopped for " + p.stopReason.replace("Waiting – ", "").toLowerCase() + " — set RO to " + p.stopReason + "?",
          [{ a:"roStatus", v: p.stopReason }], "", p.id, { k:"idle" });
      if(ev.type === "jobs.allComplete"){
        var live = ro.operations.filter(function(o){ return !o.declined; });
        var rel = live.every(function(o){ return autoStatusName(opStatus(o)) === "Complete – Released"; });
        var tgt = rel ? "Complete – Released" : "Complete – Road test";
        propose(ev, "b.done", "Status sync", m, "Every operation reads complete — set RO to " + tgt + "?", [{ a:"roStatus", v: tgt }], "",
          STATE.punches.filter(function(x){ return x.roId === ro.id; }).length + ":" + live.length);
      }
    }
    /* --- parts -> status --- */
    if(b.parts && ev.type === "part.status" && op && (ev.value === "Ordered" || ev.value === "Backordered")){
      var pref = (ev.part ? ev.part.id : "") + ":" + ev.value;
      var pg = ev.part ? { k:"part", op: op.id, part: ev.part.id, st: ["Ordered","Backordered"] } : null;
      propose(ev, "b.pjob", "Parts → status", m, "Part " + ev.value.toLowerCase() + " — set this operation to Waiting – Parts?", [{ a:"jobStatus", v:"Waiting – Parts", op: op.id }], op.id, pref, pg);
      if(false && st.status !== "Working")                   /* the RO follows its operations on its own */
        propose(ev, "b.pro", "Parts → status", m, "Part " + ev.value.toLowerCase() + " — set RO to Waiting – Parts · " + ev.value + "?", [{ a:"roStatus", v:"Waiting – Parts", sub: ev.value }], "", pref, pg);
    }
    if(b.parts && ev.type === "parts.allReceived" && op && false){   /* Waiting – Parts clears itself */
      var gen = (op.parts || []).length;
      if(autoStatusName(opStatus(op)) === "Waiting – Parts")
        propose(ev, "b.pin", "Parts → status", m, "All parts are in — set this operation back to Hold Tech?", [{ a:"jobStatus", v:"Hold Tech", op: op.id }], op.id, gen);
      if(st.status === "Waiting – Parts")
        propose(ev, "b.proin", "Parts → status", m, "All parts are in on " + (op.complaint || "this operation") + " — set RO to Hold Tech?", [{ a:"roStatus", v:"Hold Tech" }], "", op.id + ":" + gen);
    }
    /* --- your rules --- */
    cfg.rules.forEach(function(r){
      if(!r.on || r.when !== ev.type) return;
      var ctx = autoCtx(ev);
      if(!(r.conds || []).every(function(cd){ return autoCondOk(cd, ctx); })) return;
      var acts = (r.acts || []).map(function(a){
        var x = { a: a.a, v: a.v };
        if(a.a === "jobStatus" || a.a === "stamp"){ if(!op) return null; x.op = op.id; }
        if(a.a === "stamp") x.v = autoFill(a.v || AUTO_STAMP_DEFAULT, ev);
        if(a.a === "note" || a.a === "remind") x.v = autoFill(a.v, ev);
        return x;
      }).filter(Boolean);
      if(!acts.length) return;
      var jobLevel = acts.some(function(a){ return a.op; }) && op;
      var ref = p ? p.id : (ev.part ? ev.part.id + ":" + ev.value : (ev.task || "") + ":" + (ev.value || "") + ":" + STATE.punches.length);
      var nA = autoApply.length, nR = raised;
      propose(ev, "r." + r.id, r.name || "Custom rule", r.mode === "auto" ? "auto" : "suggest",
        (r.name ? r.name + ": " : "") + acts.map(autoActText).join(" · ") + "?", acts, jobLevel ? op.id : "", ref);
      if(autoApply.length > nA) v162bRan(r, ev, autoApply[autoApply.length - 1][1], "auto");
      else if(raised > nR) v162bRan(r, ev, ro.suggest[ro.suggest.length - 1], "suggest");
    });
  });
  /* the RO status follows its operations (Status sync). A status you pick by hand
     holds until the next thing happens on that RO; Released and Declined stay yours. */
  if(cfg.builtin.status){
    var roSeen = {};
    events.forEach(function(ev){
      var ro = ev.ro; if(!ro || roSeen[ro.id] || ev.type === "ro.status") return; roSeen[ro.id] = 1;
      if(roHandHolds(ro)) return;   /* Parsec 12.9: you picked it — nothing on the operations has changed since */
      var t = roAutoTarget(ro); if(!t || !roStatusOption(t.status)) return;
      var cs = roStatus(ro); if(cs.status === t.status && (cs.sub || null) === (t.sub || null)) return;
      if(!ro.sgSeen || typeof ro.sgSeen !== "object") ro.sgSeen = {};
      autoApply.push([ro, { id: uid("sg"), key: "ro.auto|" + t.status + "|" + Date.now(), at: nowIso(), op: "", rule: "RO status", text: "", acts: [{ a: "roStatus", v: t.status, sub: t.sub || null }] }]);
    });
  }
  /* a finished repair, warranty, recall or comeback job becomes a kit for next time */
  events.forEach(function(ev){ if(ev.type === "job.status" && ev.op && /^Complete/.test(ev.value || "")) try{ kitFromOp(ev.ro, ev.op); }catch(e){} });
  /* rules set to Auto: apply now, each with its own undo step and a toast */
  autoApply.forEach(function(x){
    x[0].sgSeen[x[1].key] = Date.now();
    autoApplyActs(x[0], x[1], true);
    v14AutoToast(x[0], x[1]);   /* Parsec 14 */
  });
  return raised + autoApply.length;
}
function autoActText(a){
  if(a.a === "roStatus") return "RO → " + a.v + (a.sub ? " · " + a.sub : "");
  if(a.a === "jobStatus") return "operation → " + a.v;
  if(a.a === "stamp") return "stamp work log";
  if(a.a === "task") return "tick " + taskName(a.v);
  if(a.a === "note") return "note: " + a.v;
  if(a.a === "remind") return "remind: " + a.v;
  return a.a;
}
/* An action that would change nothing is never offered — that is also what stops rules
   from chasing each other in circles. */
function autoNoop(ro, a){
  if(a.a === "roStatus"){ var s = roStatus(ro); return s.status === a.v && (!a.sub || s.sub === a.sub); }
  var op = a.op ? getOp(ro.id, a.op) : null;
  if(a.a === "jobStatus") return !op || autoStatusName(opStatus(op)) === a.v;
  if(a.a === "stamp") return !op || String(op.work || "").indexOf(esc(a.v)) >= 0;
  if(a.a === "task") return true;   /* retired action (workflow steps are gone): never offered */
  if(a.a === "note") return !a.v || String(ro.techNote || "").indexOf(a.v) >= 0;
  if(a.a === "remind") return !a.v || (ro.autoReminders || []).some(function(r){ return r.text === a.v; });
  return false;
}
function autoApplyActs(ro, sg, viaAuto){
  autoFlush();                                  /* anything you did before this is yours, not the rule's */
  if(!viaAuto) pushUndo("accept suggestion");
  else pushUndo("automation");
  var gated = false;
  AUTO_BY = "Automation · " + sg.rule;
  sg.acts.forEach(function(a){
    if(a.a === "roStatus"){
      var depthU = UNDO.length;
      if(setRoStatus(ro.id, a.v, a.sub || null) === false) gated = true;
      else if(UNDO.length > depthU) UNDO.pop();          /* one accept = one undo step */
      return;
    }
    var op = a.op ? getOp(ro.id, a.op) : null;
    if(a.a === "jobStatus" && op) op.jobStatus = { status: a.v, setAt: nowIso() };
    if(a.a === "stamp" && op) op.work = String(op.work || "") + esc(a.v) + "<br>";
    if(a.a === "note"){ ro.techNote = (String(ro.techNote || "").trim() ? String(ro.techNote).replace(/\s+$/, "") + "\n" : "") + a.v; ro.techNoteAt = nowIso(); }
    if(a.a === "remind"){ if(!Array.isArray(ro.autoReminders)) ro.autoReminders = []; ro.autoReminders.push({ id: uid("rm"), text: a.v, at: nowIso() }); }
  });
  scheduleSave(true);
  autoFlush();
  return !gated;
}
function autoAccept(roId, sgId){
  var ro = getRO(roId); if(!ro || !Array.isArray(ro.suggest)) return;
  var sg = ro.suggest.filter(function(s){ return s.id === sgId; })[0]; if(!sg) return;
  ro.suggest = ro.suggest.filter(function(s){ return s.id !== sgId; });
  if(!ro.sgSeen || typeof ro.sgSeen !== "object") ro.sgSeen = {};
  ro.sgSeen[sg.key] = Date.now();
  autoApplyActs(ro, sg, false);
}
function autoDismiss(roId, sgId){
  var ro = getRO(roId); if(!ro || !Array.isArray(ro.suggest)) return;
  var sg = ro.suggest.filter(function(s){ return s.id === sgId; })[0]; if(!sg) return;
  ro.suggest = ro.suggest.filter(function(s){ return s.id !== sgId; });
  if(!ro.sgSeen || typeof ro.sgSeen !== "object") ro.sgSeen = {};
  ro.sgSeen[sg.key] = Date.now();
  autoHist(ro, { at: Date.now(), k: "auto", t: "Suggestion dismissed", o: "", n: sg.text, op: sg.op || "", by: "You" });
  scheduleSave(true);
}
/* suggestions that no longer make sense (already done by hand, job gone) leave quietly;
   remembered keys are capped so ro.json never grows from them */
function autoPrune(){
  var n = 0;
  STATE.ros.forEach(function(ro){
    if(Array.isArray(ro.suggest) && ro.suggest.length){
      var keep = ro.suggest.filter(function(sg){
        if(sg.op && !getOp(ro.id, sg.op)) return false;
        if(!autoGuardOk(ro, sg.guard)) return false;
        return sg.acts.some(function(a){ return !autoNoop(ro, a); });
      });
      if(keep.length !== ro.suggest.length){ n += ro.suggest.length - keep.length; ro.suggest = keep; }
    }
    if(ro.sgSeen && typeof ro.sgSeen === "object"){
      var ks = Object.keys(ro.sgSeen);
      if(ks.length > 300){ ks.sort(function(a, b){ return ro.sgSeen[a] - ro.sgSeen[b]; }).slice(0, ks.length - 300).forEach(function(k){ delete ro.sgSeen[k]; }); }
    }
  });
  return n;
}
/* A suggestion stays only while the reason for it still holds: "set RO to Working" goes
   when that clock stops, a parts suggestion goes once the part is in, and so on. */
function autoGuardOk(ro, g){
  if(!g) return true;
  if(g.k === "running") return STATE.punches.some(function(p){ return p.id === g.punch && !p.stop; });
  if(g.k === "idle") return !STATE.punches.some(function(p){ return p.roId === ro.id && !p.stop; });
  if(g.k === "part"){
    var op = getOp(ro.id, g.op), pt = op ? (op.parts || []).filter(function(x){ return x.id === g.part; })[0] : null;
    return !!pt && g.st.indexOf(pt.status) >= 0;
  }
  return true;
}
function autoSuggestionsFor(ro, opId){
  return ro && Array.isArray(ro.suggest) ? ro.suggest.filter(function(s){ return (s.op || "") === (opId || ""); }) : [];
}
/* Show new suggestions — but never yank a field out from under your cursor. */
function autoRepaint(force){
  if(deepActiveField()){ AUTO_RENDER_DUE = true; return; }
  AUTO_RENDER_DUE = false;
  if(UI.view === "ros" && typeof JC !== "undefined" && JC.rerender) JC.rerender();
  if(force && (UI.view === "console" || UI.modal)) render();
}
document.addEventListener("focusout", function(){ if(AUTO_RENDER_DUE) setTimeout(function(){ if(!deepActiveField()) autoRepaint(true); }, 0); });

/* ---------- Automations panel (Settings → Automations) ---------- */
var AUTO_BUILTINS = [
  ["status","Status sync","The RO status follows its operations on its own: a clock running → Working; the most urgent wait (approval, parts, tech support, foreman) → that wait; every operation complete with parts installed, notes, attachments, road test and check-in done → Complete \u2013 Road test. A status you pick by hand holds until the next change. Released stays manual."],
  ["parts","Parts → status","Part ordered or backordered → operation and RO Waiting – Parts. All parts in → back to Hold Tech."]
];
