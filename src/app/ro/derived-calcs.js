/* Parsec · ro · derived-calcs.js
   Numbers derived from an operation: opCalc (quoted, burnt, left, efficiency), part locks (a repair that waits on a part), what is missing to complete (opCompleteGaps), the operation's status from its fields (opStatus / opStatusRaw).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   opCalc opPartLock opRealParts opCompleteGaps opCompleteGaps0 opNoteGaps opStatusX opStatus opStatusRaw partsBlocking partsSubtext partsFraction … (18 functions, 3 constants)
   state      punches
   uses       kit/ state/
*/
/* ============================== DERIVED CALCS ============================== */
function opCalc(op){
  var ps = opPunches(op.id);
  var burntMs = 0;
  if(typeof op.burnt === "number"){
    // Burnt is the number typed on the job card (the RO Job Console's rule); a running
    // clock adds its time so far on top, and is added for good when it stops.
    burntMs = op.burnt * 3600000;
    ps.forEach(function(p){ if(!p.stop) burntMs += Date.now() - new Date(p.start); });
  } else {
    // A running punch counts its time so far, the same way the daily bar does.
    ps.forEach(function(p){
      burntMs += (p.stop ? new Date(p.stop) : Date.now()) - new Date(p.start);
    });
  }
  var totalQuoted = (op.quoted||0);
  var burntHrs = decHours(burntMs);
  var remaining = Math.round((totalQuoted - burntHrs)*100)/100;
  var efficiency = burntHrs>0 ? (totalQuoted/burntHrs) : null;
  return { burntMs:burntMs, burntHrs:burntHrs, totalQuoted:totalQuoted, remaining:remaining, efficiency:efficiency, punches:ps };
}

/* a job waiting on a part that is not in yet can't be clocked — returns that part */
function opPartLock(op, reason){
  if(!op || op.declined) return null;
  var out = (op.parts || []).filter(function(p){ return (p.description || p.partNumber) && !pxPartIn(p); });
  if(!out.length) return null;
  /* repairing needs every part in hand; diagnosing and inspecting can go ahead */
  var jt = opJobType(op), why = reason || (jt === "DIAG" ? "Diagnosing" : jt === "PM" ? "Inspecting" : "Repairing");
  if(why === "Repairing") return out[0];
  var onOrder = out.filter(function(p){ return p.status === "Ordered" || p.status === "Backordered"; })[0];
  if(onOrder) return onOrder;
  if(STATE.punches.some(function(x){ return x.opId === op.id && !x.stop; })) return null;
  var st = opStatus(op); st = typeof st === "string" ? st : st.status;
  return st === "Waiting – Parts" ? out[0] : null;
}
/* the operation's status, with two rules on top of the raw one:
   Complete only holds once every part is installed and the tech notes are written;
   Waiting – Parts clears itself the moment the last part is in hand. */
function opRealParts(op){ return (op.parts || []).filter(function(p){ return (p.description || "").trim() || (p.partNumber || "").trim(); }); }
function opCompleteGaps(op){ return opCompleteGaps0(op); }   /* Parsec 14.3: what holds an op back (parts not installed …); the soft ones — no story, 0:00 — are asked at Done (v141GapsAsk) */
function opCompleteGaps0(op){                      /* Parsec 12.5: Complete needs the parts installed — notes are a final check now (opNoteGaps) */
  var g = [];
  var notIn = opRealParts(op).filter(function(p){ return p.status !== "Installed"; });
  if(notIn.length) g.push({ k: "parts", t: notIn.length + " part" + (notIn.length === 1 ? "" : "s") + " not installed" });
  return g;
}
/* the notes an operation still owes — shown in Ready to close, the release and the truck checks; they don't stop Complete */
function opNoteGaps(op){
  var g = [], ps = STATE.punches.filter(function(x){ return x.opId === op.id && x.stop; });
  var noNote = ps.filter(function(x){ return !String(x.notes || "").trim(); });
  var anyNote = ps.some(function(x){ return String(x.notes || "").trim(); }) || fcHasCause(op) || fcHasFix(op) || String(op.work || "").replace(/<[^>]*>/g, "").trim();
  if(noNote.length && !opNotesTxt(op)) g.push({ k: "notes", t: noNote.length + " punch" + (noNote.length === 1 ? "" : "es") + " without a note" });
  else if(!anyNote) g.push({ k: "notes", t: "no tech notes yet" });
  return g;
}
function opStatusX(op){ return opStatus(op); }
function opStatus(op){
  var s = opStatusRaw(op), n = typeof s === "string" ? s : s.status;
  if(op.jobStatus && op.jobStatus.hand && n === op.jobStatus.status) return s;     /* set by hand — it stands */
  if(/^Complete/.test(n)){
    var g = opCompleteGaps(op);
    if(g.length) return { status: "Hold Tech", sub: "Finish: " + g.map(function(x){ return x.t; }).join(" \u00b7 "), gated: true };
  } else if(n === "Waiting \u2013 Parts"){
    var rp = opRealParts(op);
    if(rp.length && rp.every(pxPartIn)) return { status: "Hold Tech", sub: "Ready \u2013 parts in" };
  }
  return s;
}
function opStatusRaw(op){
  if(op.declined) return "Declined";
  var running = STATE.punches.find(function(p){return p.opId===op.id && !p.stop;});
  if(running) return {status:"Working", sub:running.startReason};
  var ps = opPunches(op.id).filter(function(p){return p.stop;});
  var last = ps.length ? ps[ps.length-1] : null;
  /* a status picked on the job card holds until the job is clocked again */
  if(op.jobStatus && op.jobStatus.status && (!last || new Date(last.stop) <= new Date(op.jobStatus.setAt)))
    return {status: op.jobStatus.status, sub: op.jobStatus.status === "Waiting – Parts" ? partsSubtext(op) : null};
  if(last && STOP_REASONS_EXPLICIT.indexOf(last.stopReason)!==-1){
    var st = last.stopReason;
    if(st==="Waiting – Parts"){
      var sub = partsSubtext(op);
      return {status:st, sub:sub};
    }
    return {status:st, sub:null};
  }
  // neutral stop or never punched
  var blocking = partsBlocking(op);
  if(last){ // neutral stop reason
    return blocking ? {status:"Waiting – Parts", sub:partsSubtext(op)} : {status:"Hold Tech", sub:null};
  }
  return blocking ? {status:"Waiting – Parts", sub:partsSubtext(op)} : {status:"Hold Tech", sub:null};
}
function partsBlocking(op){ return (op.parts||[]).some(function(p){return p.status==="Not Ordered"||p.status==="Ordered"||p.status==="Backordered";}); }
function partsSubtext(op){
  var bo = (op.parts||[]).filter(function(p){return p.status==="Backordered";}).length;
  if(bo>0) return "Backordered ("+bo+")";
  var ord = (op.parts||[]).filter(function(p){return p.status==="Ordered";}).length;
  if(ord>0) return "Ordered ("+ord+")";
  return null;
}
function partsFraction(op){
  var parts = op.parts||[];
  if(!parts.length) return null;
  var installed = parts.filter(function(p){return p.status==="Installed";}).length;
  return installed/parts.length;
}
/* Part statuses speak the same colour language as the status pills. */

/* Old notes carried "[8/24/26 7:34 AM]" stamps written by the retired + Continue button.
   Split on those so an existing note becomes several entries rather than one wall of text. */
function parseLegacyNote(raw){
  var re = /\[(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(\d{1,2}:\d{2}(?::\d{2})?\s*[AP]M)\]/gi;
  var out = [], m, marks = [];
  while((m = re.exec(raw)) !== null) marks.push({ idx:m.index, len:m[0].length, when:m[1]+" "+m[2] });
  if(!marks.length) return [{ at:null, text:raw.trim() }];
  if(marks[0].idx > 0){
    var head = raw.slice(0, marks[0].idx).trim();
    if(head) out.push({ at:null, text:head });
  }
  marks.forEach(function(mk, i){
    var end = (i+1 < marks.length) ? marks[i+1].idx : raw.length;
    var body = raw.slice(mk.idx + mk.len, end).trim();
    if(!body) return;
    var d = new Date(mk.when);
    out.push({ at: isNaN(d) ? null : d.toISOString(), text: body });
  });
  return out.length ? out : [{ at:null, text:raw.trim() }];
}

/* How overdue a part is. Only Ordered / Backordered age — anything in hand does not.
   Days are whole calendar days, so "today" is neither late nor due. */
var AGE_DUE_DAYS = 3;    // ETA this close counts as due soon
var AGE_NOETA_DAYS = 5;  // ordered this long with no ETA at all is its own problem
function partAging(pt){
  if(!pt || (pt.status!=="Ordered" && pt.status!=="Backordered")) return null;
  var today = new Date(); today.setHours(0,0,0,0);
  if(pt.eta){
    var eta = new Date(pt.eta + "T00:00:00");
    if(isNaN(eta)) return null;
    var days = Math.round((eta - today) / 86400000);
    if(days < 0)  return { state:"late", days:-days };
    if(days <= AGE_DUE_DAYS) return { state:"due", days:days };
    return { state:"ok", days:days };
  }
  if(!pt.statusChangedAt) return null;
  var since = Math.floor((today - new Date(pt.statusChangedAt)) / 86400000);
  if(since >= AGE_NOETA_DAYS) return { state:"noeta", days:since };
  return null;
}
function agingBadge(pt){
  var a = partAging(pt);
  if(!a || a.state==="ok") return "";
  var txt = a.state==="late"  ? a.days+"d late"
          : a.state==="due"   ? (a.days===0 ? "due today" : "in "+a.days+"d")
          : "no ETA · "+a.days+"d";
  return '<span class="age '+a.state+'">'+txt+'</span>';
}

function statusPillClass(status){
  /* green working / done · amber waiting · grey hold, not started and declined (red is for late or backordered, see statusTone) */
  if(status==="Working") return "pill-working";
  if(status==="Waiting – Tech Support") return "pill-tech";
  if(status==="Waiting – Approval" || status==="Waiting – Customer") return "pill-teal";
  if(/^Waiting/.test(status||"")) return "pill-waiting";
  if(status==="Complete" || status==="Complete – Road test") return "pill-complete";
  if(status==="Complete – Released") return "pill-released";
  if(status==="Declined") return "pill-declined";
  return "pill-hold";
}
/* RO status is set by hand and stands on its own — it is no longer derived from
   the operations. Operations keep their own status; the two are separate answers. */
var RO_STATUS_OPTIONS = [
  { status:"Hold Tech",             subs:[] },
  { status:"Working",               subs:["Diagnosing","Repairing","Inspecting","Testing"] },
  { status:"Waiting – Parts",       subs:["Not Ordered","Ordered","Backordered","Received"] },
  { status:"Waiting – Sublet",      subs:["Sent out","Due back"] },
  { status:"Waiting – Foreman",     subs:[] },
  { status:"Waiting – Tech Support",subs:["Case opened","Awaiting reply","Escalated"] },
  { status:"Waiting – Customer",    subs:["Estimate sent","Approval pending","Declined work"] },
  { status:"Complete – Road test",  subs:[] },
  { status:"Complete – Released",   subs:[] },
  { status:"Declined",              subs:[] }
];
/* Only used once, to seed ro.status on data written before statuses were manual. */

function roStatusOption(name){
  return RO_STATUS_OPTIONS.filter(function(o){ return o.status===name; })[0] || null;
}
function roStatus(ro){
  var st = ro.status;
  if(st && typeof st === "object" && st.status) return { status: st.status, sub: st.sub || null };
  return { status:"Hold Tech", sub:null };
}
