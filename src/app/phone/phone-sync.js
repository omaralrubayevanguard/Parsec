/* Parsec · phone · phone-sync.js
   Phone sync by QR codes, no network: send the open ROs to the phone (mobBundle), read its codes back (mobApply), the sync window.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   mobStages mobChecks mobFiles mobNotes mobBundle mobApply psyClose openPhoneSync psyMode v128StaffPages navCurrent notifBtnHtml … (13 functions, 2 constants)
   state      mobTickIds pages128 punches ros
   uses       access/ automations/ clock/ data/ kit/ pages/fixes/ pages/rolist/ pages/triage/ ro/ ro-page/ shell/ state/ trucks/
   at load    wraps mobApply
*/
/* ============================== PHONE SYNC (QR codes, no network) ==============================
   Send to phone: the open ROs, packed small, shown as a loop of QR codes for Parsec Mobile to read.
   Get from phone: the webcam reads the phone's codes; new operations land on their ROs and pick
   up quoted time and parts from Fixes. */
function mobStages(ro, f){
  var g = {}; ((f && f.stages) || []).forEach(function(s){ g[s.stage] = s; });
  var hasDiag = (ro.operations || []).some(function(o){ return !o.declined && ["DIAG","COMEBACK"].indexOf(opJobType(o)) > -1; });
  var one = function(k){ var s = g[k]; if(!s || !(s.min > 0)) return ["skip", 0]; var p = Math.round(s.earned / s.min * 100); return [p >= 100 ? "done" : p > 0 ? "cur" : "todo", Math.min(100, p)]; };
  var d = hasDiag ? one("diag") : ["skip", 0], a = one("approval"), r = one("repair");
  if(r[0] !== "done" && f && (f.waits || []).some(function(w){ return w.kind === "parts"; })) r[0] = "park";
  if(f && f.ready){ d = d[0] === "skip" ? d : ["done", 100]; a = a[0] === "skip" ? a : ["done", 100]; r = ["done", 100]; }
  return [d, a, r];
}
/* the stage checklists for the phone - one letter per step: a = ticked by the app, m = ticked by hand, 0 = open */
function mobChecks(f){
  var out = {}, any = false;
  if(!f || !f.steps) return out;
  Object.keys(STAGE_STEPS).forEach(function(g){
    var l = f.steps[g]; if(!l || !l.length) return;
    out[g] = l.map(function(x){ return x.on ? (x.auto ? "a" : "m") : "0"; }).join(""); any = true;
  });
  return out;
}
/* the RO's files on the computer, and the operation each belongs to (if any) */
function mobFiles(ro){
  var out = [];
  (ro.attachments || []).forEach(function(a){ out.push({ n: a.name || "file", z: a.size || 0, at: a.addedAt || "", op: null }); });
  (ro.bulletins || []).forEach(function(b){ (b.files || []).forEach(function(f){ out.push({ n: f.name || f.fname || "file", z: f.size || 0, at: f.ts || "", op: f.op || null }); }); });
  return out.slice(0, 60);
}
function mobNotes(op){
  var out = [];
  (Array.isArray(op.offNotes) ? op.offNotes : []).forEach(function(n){ if(n && n.text) out.push({ a: n.at, x: String(n.text) }); });
  STATE.punches.forEach(function(p){ if(p.opId !== op.id) return; noteEntries(p.notes).forEach(function(n){ if(n.text.trim()) out.push({ a: p.stop || p.start, x: n.text.trim() }); }); });
  out.sort(function(a, b){ return new Date(a.a) - new Date(b.a); });
  return out.slice(-4).map(function(n){ return { a: n.a, x: n.x.slice(0, 160) }; });
}
function mobBundle(){
  var run = runningPunch();
  var ros = STATE.ros.filter(function(ro){ return ro.id !== SHOP_RO_ID && !roIsDone(ro); }).map(function(ro){
    var f = null; try{ f = roForecast(ro); }catch(e){}
    var tm = truckYM(ro), st = roStatus(ro);
    return {
      id: ro.id, no: ro.roNumber || "", cust: ro.customerName || "", tag: ro.keyTag || "", vin: ro.vin || "", ymm: tm.line, unit: ro.unitNumber || "",
      st: st.status + (st.sub ? " · " + st.sub : ""),
      pct: f ? Math.floor(f.pct) : 0, eta: f ? (f.ready ? "ready" : f.likely.toISOString()) : "",
      sg: mobStages(ro, f),
      cl: mobChecks(f),
      ops: (ro.operations || []).map(function(op, i){
        var s = opStatus(op), nm = typeof s === "string" ? s : s.status, sub = typeof s === "string" ? "" : (s.sub || "");
        var k = /^Working|^Complete/.test(nm) ? "good" : /^Waiting/.test(nm) ? "warn" : nm === "Declined" ? "bad" : "hold";
        return { id: op.id, n: i + 1, t: opJobType(op), c: op.complaint || "", s: nm.replace(/^Waiting – /, "Waiting · ").replace(/^Complete – /, "Complete · "),
          k: k, live: !!(run && run.opId === op.id), b: Math.round((+op.burnt || 0) * 100) / 100, q: +op.quoted || 0, d: !!op.declined, m: Math.round(opMoney(op).total * 100) / 100,
          /* what the phone shows when an operation is opened */
          rs: (op.jobStatus && op.jobStatus.status) || "", ca: String(op.cause || "").slice(0, 400), fx: String(op.correction || "").slice(0, 400),
          tl: STATE.punches.filter(function(pp){ return pp.opId === op.id; }).sort(function(a, c){ return new Date(c.start) - new Date(a.start); }).slice(0, 10)
            .map(function(pp){ return [pp.start, pp.stop || null, pp.startReason || "", pp.stopReason || "", pp.by || ""]; }),
          ml: Math.round(opMoney(op).labor * 100) / 100, mp: Math.round(opMoney(op).parts * 100) / 100, mo: Math.round(opMoney(op).other * 100) / 100, ec: +op.estCost || 0,
          nt: mobNotes(op), pt: opRealParts(op).slice(0, 15).map(function(pp){ return [String(pp.description || "").slice(0, 60), String(pp.partNumber || "").slice(0, 30), String(pp.qty || "1"), pp.status || "Not Ordered", priceOf(pp.price) || 0]; }) };
      }),
      att: mobFiles(ro).map(function(f){ var i = (ro.operations || []).map(function(o){ return o.id; }).indexOf(f.op); return { n: f.n, z: f.z, at: f.at, op: i > -1 ? i + 1 : 0 }; })
    };
  });
  /* ids of the phone's operations that are already here, on any RO (open or closed), so the phone can clear them */
  var ack = [];
  STATE.ros.forEach(function(ro){ (ro.operations || []).forEach(function(o){ if(o.fromPhone) ack.push(o.id); }); });
  return { t: "pc", v: 1, at: nowIso(), rate: laborRate(), ros: ros, ack: ack.slice(-400).concat((STATE.mobTickIds || []).slice(-300)) };
}
function mobApply(b){
  if(!b || b.t !== "ph" || !(Array.isArray(b.ops) || Array.isArray(b.tk) || Array.isArray(b.ch))) return { ok: false, msg: "Those codes did not come from Parsec Mobile." };
  if(!Array.isArray(b.ops)) b.ops = [];
  /* stage steps ticked or unticked on the phone */
  var ticks = 0;
  if(Array.isArray(b.tk)){
    if(!Array.isArray(STATE.mobTickIds)) STATE.mobTickIds = [];
    var done = {}; STATE.mobTickIds.forEach(function(id){ done[id] = 1; });
    var tks = b.tk.filter(function(x){
      if(!x || typeof x.id !== "string" || done[x.id] || typeof x.key !== "string") return false;
      var pr = x.key.split(":"), g = pr[0], k = +pr[1];
      if(!STAGE_STEPS[g] || !STAGE_STEPS[g].some(function(sp){ return sp[0] === k; }) || pr.length !== 2) return false;
      var ro = getRO(x.roId); return !!(ro && ro.id !== SHOP_RO_ID && !roIsDone(ro));
    }).sort(function(a, c){ return String(a.at || "").localeCompare(String(c.at || "")); });
    if(tks.length) pushUndo("stage steps from the phone");
    tks.forEach(function(x){
      var ro = getRO(x.roId); ro.stageTicks = ro.stageTicks || {};
      if(x.v) ro.stageTicks[x.key] = 1; else delete ro.stageTicks[x.key];
      STATE.mobTickIds.push(x.id); done[x.id] = 1; ticks++;
    });
    if(STATE.mobTickIds.length > 600) STATE.mobTickIds = STATE.mobTickIds.slice(-400);
    if(ticks){ scheduleSave(true); if(typeof JC !== "undefined" && JC && JC.rerender) JC.rerender(); }
  }
  var added = 0, skipped = 0, missing = 0, closed = 0;
  var seen = {};
  STATE.ros.forEach(function(r0){ (r0.operations || []).forEach(function(o){ seen[o.id] = 1; }); });
  var fresh = b.ops.filter(function(x){
    if(!x || typeof x.id !== "string" || !x.id) return false;
    var ro = getRO(x.roId);
    if(seen[x.id]){ skipped++; return false; }
    if(!ro || ro.id === SHOP_RO_ID){ missing++; return false; }
    if(roIsDone(ro)){ closed++; return false; }
    seen[x.id] = 1; return true;
  });
  if(fresh.length) pushUndo("operations from the phone");
  fresh.forEach(function(x){
    var ro = getRO(x.roId);
    ro.operations.push({ id: x.id, complaint: String(x.c || "").trim().slice(0, 200) || "Operation", jobType: JOB_TYPES.indexOf(x.t) > -1 ? x.t : "OP", quoted: 0, burnt: 0, parts: [], log: [],
      work: "", declined: false, isStandard: false, standardName: null, fromPhone: true, addedAt: x.at || nowIso() });
    added++;
  });
  /* notes, parts and operation changes made on the phone */
  var chg = 0;
  if(Array.isArray(b.ch)){
    if(!Array.isArray(STATE.mobTickIds)) STATE.mobTickIds = [];
    var dn = {}; STATE.mobTickIds.forEach(function(id){ dn[id] = 1; });
    var MST = ["Hold Tech","Waiting \u2013 Parts","Waiting \u2013 Sublet","Waiting \u2013 Foreman","Waiting \u2013 Tech Support","Waiting \u2013 Customer","Waiting \u2013 Approval","Complete"];
    var cs = b.ch.filter(function(x){ return x && typeof x.id === "string" && !dn[x.id] && typeof x.opId === "string"; })
      .sort(function(a, c){ return String(a.at || "").localeCompare(String(c.at || "")); });
    var undone = true;
    cs.forEach(function(x){
      var ro = getRO(x.roId); if(!ro || ro.id === SHOP_RO_ID || roIsDone(ro)) return;
      var op = (ro.operations || []).filter(function(o){ return o.id === x.opId; })[0]; if(!op) return;
      if(undone){ pushUndo("changes from the phone"); undone = false; }
      var at = typeof x.at === "string" && !isNaN(new Date(x.at)) ? x.at : nowIso();
      if(x.k === "note" && String(x.x || "").trim()){
        if(!Array.isArray(op.offNotes)) op.offNotes = [];
        op.offNotes.push({ id: "on" + x.id.slice(-10), at: at, text: autoPunct(String(x.x).slice(0, 600)), by: "phone" });
      } else if(x.k === "part" && (String(x.d || "").trim() || String(x.pn || "").trim())){
        var d0 = String(x.d || "").trim().slice(0, 120), pn0 = String(x.pn || "").trim().slice(0, 40), ip = 0;
        try{ ip = invPriceOf(pn0, d0); }catch(e){}
        op.parts = op.parts || [];
        var pr = priceOf(x.pr);
        op.parts.push({ id: "pt_" + uid(), description: d0, partNumber: pn0, eta: "", qty: String(parseFloat(x.q) > 0 ? parseFloat(x.q) : 1), status: "Not Ordered", statusChangedAt: at, price: pr ? String(pr) : ip ? String(ip) : "", fromPhone: true });
      } else if(x.k === "edit" && x.f && typeof x.f === "object"){
        var f = x.f;
        if(typeof f.c === "string" && f.c.trim()) op.complaint = f.c.trim().slice(0, 200);
        if(JOB_TYPES.indexOf(f.t) > -1) op.jobType = f.t;
        if(MST.indexOf(f.s) > -1 && (!op.jobStatus || op.jobStatus.status !== f.s)) op.jobStatus = { status: f.s, setAt: at };
        if(typeof f.ca === "string") op.cause = autoPunct(f.ca.slice(0, 1000));
        if(typeof f.fx === "string") op.correction = autoPunct(f.fx.slice(0, 1000));
      } else return;
      STATE.mobTickIds.push(x.id); dn[x.id] = 1; chg++;
    });
    if(STATE.mobTickIds.length > 600) STATE.mobTickIds = STATE.mobTickIds.slice(-400);
  }
  if(added || ticks || chg){ scheduleSave(true); render(); if(typeof JC !== "undefined" && JC && JC.rerender) JC.rerender(); }
  return { ok: true, added: added, ticks: ticks, chg: chg, skipped: skipped, missing: missing, closed: closed };
}
/* phone sync — clock time and part statuses from the phone */
(function () {
  if (typeof mobApply !== 'function' || typeof STATE === 'undefined') return;
  var base = mobApply;
  var PST = ['Not Ordered', 'Ordered', 'Backordered', 'Received', 'Installed'];
  mobApply = function (b) {
    var r = base(b);                                   /* operations, notes, parts, edits, stage steps */
    if (!r || !r.ok || !b || !Array.isArray(b.ch)) return r;
    if (!Array.isArray(STATE.mobTickIds)) STATE.mobTickIds = [];
    var dn = {}; STATE.mobTickIds.forEach(function (id) { dn[id] = 1; });
    var have = {}; STATE.punches.forEach(function (p) { have[p.id] = 1; });
    var todo = b.ch.filter(function (x) { return x && typeof x.id === 'string' && !dn[x.id] && (x.k === 'time' || x.k === 'pstat'); })
      .sort(function (a, c) { return String(a.at || '').localeCompare(String(c.at || '')); });
    if (!todo.length) return r;
    if (typeof syncAllBurnt === 'function') syncAllBurnt();   /* settle typed burnt first so new time adds on top */
    var extra = 0, clash = 0, undone = true;
    todo.forEach(function (x) {
      var ro = getRO(x.roId); if (!ro || ro.id === SHOP_RO_ID || roIsDone(ro)) return;
      var op = (ro.operations || []).filter(function (o) { return o.id === x.opId; })[0]; if (!op) return;
      if (x.k === 'time') {
        var s = new Date(x.s), e = new Date(x.e);
        if (isNaN(s) || isNaN(e) || e <= s || e - s > 16 * 3600000) return;
        if (!have[x.id]) {
          if (typeof punchClash === 'function' && punchClash(null, s.getTime(), e.getTime())) { clash++; return; }
          if (undone) { pushUndo('changes from the phone'); undone = false; }
          STATE.punches.push({ id: x.id, roId: ro.id, opId: op.id, start: s.toISOString(), stop: e.toISOString(),
            startReason: (typeof START_REASONS !== 'undefined' && START_REASONS.indexOf(x.r) > -1) ? x.r : 'Repairing',
            stopReason: x.sr || null, notes: '', manual: true, fromPhone: true, burntCredited: true,
            by: x.by || (typeof punchByName === 'function' ? punchByName() : '') });
          have[x.id] = 1;
        }
      } else {
        if (PST.indexOf(x.st) < 0) return;
        var list = typeof opRealParts === 'function' ? opRealParts(op) : (op.parts || []);
        var d = String(x.d || '').trim().slice(0, 60), pn = String(x.pn || '').trim();
        var p = list.filter(function (q) { return String(q.partNumber || '').trim() === pn && String(q.description || '').trim().slice(0, 60) === d; })[0] || null;
        if (!p && !x.pid && typeof x.i === 'number' && x.i > -1) p = list[x.i] || null;
        if (!p) return;
        if (undone) { pushUndo('changes from the phone'); undone = false; }
        p.status = x.st; p.statusChangedAt = typeof x.at === 'string' ? x.at : nowIso();
      }
      STATE.mobTickIds.push(x.id); dn[x.id] = 1; extra++;
    });
    if (extra) {
      if (typeof syncAllBurnt === 'function') syncAllBurnt();
      if (STATE.mobTickIds.length > 600) STATE.mobTickIds = STATE.mobTickIds.slice(-400);
      r.chg = (r.chg || 0) + extra;
      scheduleSave(true); try { render(); } catch (e) {}
      if (typeof JC !== 'undefined' && JC && JC.rerender) { try { JC.rerender(); } catch (e) {} }
    }
    if (clash && typeof pushToast === 'function') pushToast(clash + ' clock entr' + (clash === 1 ? 'y' : 'ies') + ' from the phone overlap time already here — fix ' + (clash === 1 ? 'it' : 'them') + ' on the phone and sync again.');
    return r;
  };
})();
var PSY = null;
function psyClose(){
  if(!PSY) return;
  if(PSY.stop) PSY.stop();
  if(PSY.el && PSY.el.parentNode) PSY.el.parentNode.removeChild(PSY.el);
  document.removeEventListener("keydown", PSY.key, true);
  PSY = null;
}
function openPhoneSync(mode){
  psyClose();
  UI.appMenu = false; render();
  var el = document.createElement("div");
  el.className = "psy-ov";
  el.innerHTML = '<div class="psy" role="dialog" aria-label="Phone sync">'
    + '<div class="psy-hd"><b>Phone sync</b><span class="psy-sub">QR codes between this computer and Parsec Mobile. No network, nothing stored anywhere else.</span><button class="psy-x" data-psy="close" aria-label="Close">✕</button></div>'
    + '<div class="psy-seg" role="tablist"><button data-psy="send">Send to phone</button><button data-psy="get">Get from phone</button></div>'
    + '<div class="psy-body"></div></div>';
  document.body.appendChild(el);
  PSY = { el: el, stop: null, key: function(e){ if(e.key === "Escape"){ e.stopPropagation(); psyClose(); } } };
  document.addEventListener("keydown", PSY.key, true);
  el.addEventListener("click", function(e){
    var b = e.target.closest("[data-psy]");
    if(e.target === el){ psyClose(); return; }
    if(!b) return;
    var a = b.getAttribute("data-psy");
    if(a === "close") psyClose();
    else if(a === "send" || a === "get" || a === "again") psyMode(a === "again" ? PSY.mode : a);
  });
  psyMode(mode || "send");
}
function psyMode(mode){
  if(!PSY) return;
  if(PSY.stop){ PSY.stop(); PSY.stop = null; }
  PSY.mode = mode;
  var el = PSY.el, body = el.querySelector(".psy-body");
  el.querySelectorAll(".psy-seg button").forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-psy") === mode); });
  if(mode === "send"){
    var bun = mobBundle();
    body.innerHTML = '<div class="psy-send"><canvas class="psy-qr" aria-label="QR codes for the phone"></canvas>'
      + '<div class="psy-info"><div class="psy-big"><span class="psy-n">Code 1 of 1</span></div>'
      + '<div class="psy-bar"><i style="width:0%"></i></div>'
      + '<p><b>' + bun.ros.length + ' open RO' + (bun.ros.length === 1 ? '' : 's') + '</b> ready for the phone.</p>'
      + '<ol><li>On the phone open Parsec Mobile and tap <b>Sync</b>.</li><li>Pick <b>Get from computer</b>.</li><li>Hold the phone 20–40 cm from this screen until it says Done.</li></ol>'
      + '<p class="psy-hint">The codes loop, so the phone can start at any code. Photos stay where they are.</p></div></div>';
    TQ.pack(bun).then(function(pk){
      if(!PSY || PSY.mode !== "send") return;
      var cnv = body.querySelector(".psy-qr"), n = body.querySelector(".psy-n"), bar = body.querySelector(".psy-bar i");
      body.querySelector(".psy-info p").insertAdjacentHTML("beforeend", ' <span class="psy-hint">' + pk.frames.length + ' code' + (pk.frames.length === 1 ? '' : 's') + ' · ' + (pk.bytes / 1024).toFixed(1) + ' KB</span>');
      PSY.stop = TQ.player(cnv, pk.frames, function(i, t){ n.textContent = "Code " + i + " of " + t; bar.style.width = (i / t * 100) + "%"; }, 340);
    });
  } else {
    body.innerHTML = '<div class="psy-send"><div class="psy-cam"><video class="psy-vid" playsinline muted></video><i class="psy-frame"></i></div>'
      + '<div class="psy-info"><div class="psy-big"><span class="psy-n">Waiting for the phone…</span></div>'
      + '<div class="psy-bar"><i style="width:0%"></i></div>'
      + '<ol><li>On the phone tap <b>Sync</b> → <b>Send to computer</b>.</li><li>Hold the phone screen up to the webcam, about 20 cm away.</li><li>Keep it there until this says Done.</li></ol>'
      + '<p class="psy-msg" role="status"></p></div></div>';
    var vid = body.querySelector(".psy-vid"), n2 = body.querySelector(".psy-n"), bar2 = body.querySelector(".psy-bar i"), msg = body.querySelector(".psy-msg");
    PSY.stop = TQ.scanner(vid, function(got, tot){ n2.textContent = "Read " + got + " of " + tot + " codes"; bar2.style.width = (got / tot * 100) + "%"; }, function(data){
      if(!PSY) return;
      var r = mobApply(data);
      n2.textContent = r.ok ? "Done" : "Not Parsec Mobile codes";
      bar2.style.width = "100%";
      msg.innerHTML = r.ok
        ? (r.added ? '<b>' + r.added + ' operation' + (r.added === 1 ? '' : 's') + '</b> added from the phone. Quoted time and parts fill in from Fixes where they match.' : (r.ticks || r.chg ? '' : 'Nothing new from the phone — everything was already here.'))
          + (r.chg ? ' <b>' + r.chg + ' change' + (r.chg === 1 ? '' : 's') + '</b> (notes, parts, operation details) from the phone.' : '')
          + (r.ticks ? ' <b>' + r.ticks + ' stage step' + (r.ticks === 1 ? '' : 's') + '</b> updated from the phone.' : '')
          + (r.missing ? ' ' + r.missing + ' belonged to an RO that is not on this computer.' : '')
          + (r.closed ? ' ' + r.closed + ' belonged to a closed RO and was left out.' : '')
          + '<br><button class="btn btn-primary btn-sm" data-psy="send">Now send to phone</button> <span class="psy-hint">so the phone clears what it sent</span>'
        : esc(r.msg) + ' <button class="btn btn-sm" data-psy="again">Try again</button>';
      PSY.stop = null;
    }, function(err){
      if(!PSY) return;
      n2.textContent = "Camera not available";
      msg.innerHTML = esc((err && err.name === "NotAllowedError") ? "The browser blocked the webcam. Allow the camera for this page (the icon in the address bar), then try again." : (err && err.message) || "The webcam could not start.")
        + ' <button class="btn btn-sm" data-psy="again">Try again</button>';
    });
  }
}

/* new pages reach the people whose role uses them, once */
function v128StaffPages(){
  if(STATE.pages128) return;
  staffList().forEach(function(sf){ sf.pages = sf.pages || {}; ["warranty","fixes"].forEach(function(pg){ if((STAFF_ROLES[sf.role] || []).indexOf(pg) > -1) sf.pages[pg] = true; }); });
  STATE.pages128 = true;
}

function navCurrent(){
  var v = UI.view === "report" ? "timelog" : UI.view;
  if((v === "timelog" || v === "career") && typeof dpHome === "function"){ var dh = dpHome(); if(dh) v = dh; }   /* 17.1: they're tabs of a department page */
  for (var i=0;i<NAV_PAGES.length;i++) if (NAV_PAGES[i][0] === v) return NAV_PAGES[i];
  return navPages()[0];
}


var NOTIF_BELL = sfIcon(SF.bell, 19);
/* Warnings live in the header now, not buried in the options menu. The bell
   carries the count and goes quiet — no badge, dimmed — when nothing is firing. */
function notifBtnHtml(count){
  var t = count ? count+" warning"+(count===1?"":"s") : "No warnings right now";
  return '<div class="notif'+(UI.notifOpen?' open':'')+'" data-key="notif">'
    + '<button class="icon-btn notif-btn'+(count?" has":"")+'" data-key="notif-btn" data-action="toggle-notif"'
    +   ' aria-haspopup="true" aria-expanded="'+(UI.notifOpen?'true':'false')+'" title="'+t+'" aria-label="'+t+'">'
    + NOTIF_BELL
    + (count?'<span class="badge-count">'+count+'</span>':'')
    + '</button>'
    + (UI.notifOpen ? notifPopHtml() : '')
    + '</div>';
}
/* The warnings list, in place. It used to be a modal, which covered the very RO you
   were being told to go fix; here each line can be dismissed or jumped to without
   losing the page behind it. */
function notifPopHtml(){
  var ws = computeWarnings(), rem = computeReminders();
  var items = ws.map(function(w){ return { kind:"warn", n:w }; })
    .concat(rem.escalated.map(function(r){ return { kind:"esc", n:r }; }))
    .concat(rem.soft.map(function(r){ return { kind:"soft", n:r }; }));
  var h = '<div class="notif-pop" role="dialog" aria-label="Warnings and reminders">'
    + '<div class="notif-head"><b>Warnings</b>'
    + (items.length ? '<span class="notif-n mono">'+items.length+'</span>' : '')
    + '<button class="notif-x" data-action="toggle-notif" aria-label="Close">×</button></div>';
  if(!items.length){
    h += '<div class="notif-empty">Nothing needs attention right now.</div>';
  } else {
    h += '<div class="notif-list" data-scroll="notif">';
    items.forEach(function(it){
      var n = it.n;
      h += '<div class="notif-item '+it.kind+'">'
        + (n.code ? '<span class="notif-code mono">'+esc(n.code)+'</span>' : '<span class="notif-code mono dot">•</span>')
        + '<span class="notif-tx">'+esc(n.text)+'</span>'
        + '<span class="notif-acts">'
        +   (n.ro ? '<button class="link-btn" data-action="goto-ro" data-ro="'+n.ro.id+'" title="Open RO '+esc(tgNum(n.ro))+'">Open</button>' : '')
        +   '<button class="notif-dismiss" data-action="dismiss-note" data-key="'+esc(noteKey(n))
        +     '" title="Dismiss — you’ll be told again if it comes back" aria-label="Dismiss">×</button>'
        + '</span></div>';
    });
    h += '</div>';
  }
  return h + '</div>';
}
