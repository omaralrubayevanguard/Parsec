/* Parsec · ro · warnings.js
   Warnings and reminders computed from the data (computeWarningsAll / computeRemindersAll) and the dismissals remembered against what each notice is about.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   computeWarningsAll computeRemindersAll noteKey dismissedMap undismissed pruneDismissals dismissNote computeWarnings computeReminders noteX (10 functions)
   state      dismissed lastBackupAt punches ros
   uses       clock/ data/ kit/ pages/triage/ shell/ state/
*/
/* ============================== WARNINGS ============================== */
function computeWarningsAll(){
  var out = [];
  STATE.ros.forEach(function(ro){
    ro.operations.forEach(function(op){
      var st = opStatus(op); var s = typeof st==="string"?st:st.status;
      var parts = op.parts||[];
      if(s==="Waiting – Parts" && parts.length && parts.every(pxPartIn)){
        out.push({code:"W1", ro:ro, op:op, text:"“"+op.complaint+"” on RO "+tgNum(ro)+" reads Waiting – Parts but every part is in hand — go work it."});
      }
      if(isCompleteName(s) && parts.length){
        var frac = partsFraction(op);
        if(frac!==null && frac<1) out.push({code:"W2", ro:ro, op:op, text:"“"+op.complaint+"” on RO "+tgNum(ro)+" is Complete with parts still not installed."});
      }
      var c = opCalc(op);
      if(c.remaining<0) out.push({code:"W6", ro:ro, op:op, text:"“"+op.complaint+"” on RO "+tgNum(ro)+" is over quote by "+fmtDec(-c.remaining)+"h."});
      parts.forEach(function(p){
        var a = partAging(p);
        if(!a) return;
        if(a.state==="late") out.push({code:"W4", ro:ro, op:op, part:p, days:a.days,
          text:"RO "+tgNum(ro)+" \u2014 "+p.description+" is "+a.days+" day"+(a.days===1?"":"s")+" past ETA ("+p.eta+")."});
        else if(a.state==="noeta") out.push({code:"W5", ro:ro, op:op, part:p, days:a.days,
          text:"RO "+tgNum(ro)+" \u2014 "+p.description+" "+p.status.toLowerCase()+" "+a.days+" days with no ETA set."});
      });
    });
    var rst = roStatus(ro);
    if(roLooksFinished(ro) && !roWorkDone(ro)){
      out.push({code:"W7", ro:ro, text:"RO "+tgNum(ro)+" — every operation reads complete, but the RO is still "+rst.status+"."});
    }
    if(rst.status!=="Complete – Road test" && rst.status!=="Complete – Released" && rst.status!=="Declined"){
      var lastPunch = null;
      STATE.punches.forEach(function(p){ if(ro.operations.some(function(o){return o.id===p.opId;})){ var t=new Date(p.start); if(!lastPunch||t>lastPunch) lastPunch=t; } });
      var ref = lastPunch || (ro.dateOpened ? new Date(ro.dateOpened) : null);
      if(ref){ var days=(Date.now()-ref)/86400000; if(days>=5) out.push({code:"W3", ro:ro, text:"RO "+tgNum(ro)+" has had no punch in "+Math.floor(days)+" days."}); }
    }
  });
  allDates().forEach(function(d){
    var dc = dailyCalc(d);
    if(dc.punches.length && dc.punches.every(function(p){ return !p.stop; })) out.push({code:"W8", day:d, text:"Day "+fmtDateLong(d+"T12:00:00")+" has a punch still running with no completed work."});
  });
  return out;
}

function computeRemindersAll(){
  var soft=[], escalated=[];
  var todayD = todayStr();
  // A punch left running from an earlier day is the new "you forgot to close out".
  STATE.punches.forEach(function(p){
    if(p.stop) return;
    var d = localDay(p.start);
    if(d < todayD){
      var ro = getRO(p.roId), op = ro ? getOp(ro.id, p.opId) : null;
      escalated.push({ code:"M1", punch:p,
        text:"A punch on "+(ro?("RO "+tgNum(ro)):"a deleted RO")+(op?" — "+op.complaint:"")+" has been running since "+fmtDateLong(d+"T12:00:00")+"." });
    }
  });
  // A punch running a long time today is usually a forgotten stop.
  STATE.punches.forEach(function(p){
    if(p.stop) return;
    if(localDay(p.start) !== todayD) return;
    var hrs = (Date.now() - new Date(p.start)) / 3600000;
    var ro = getRO(p.roId), op = ro ? getOp(ro.id, p.opId) : null;
    var who = (ro?("RO "+tgNum(ro)):"an operation") + (op?" — "+op.complaint:"");
    if(hrs >= 8) escalated.push({ code:"M8", punch:p, text:"Still punched on "+who+" after "+Math.floor(hrs)+" hours." });
    else if(hrs >= 5) soft.push({ code:"M8", punch:p, text:Math.floor(hrs)+" hours punched on "+who+" — still on it?" });
  });
  // reminders left by automation rules
  STATE.ros.forEach(function(ro){ (ro.autoReminders || []).forEach(function(r){ soft.push({ code:"AR", ro: ro, day: r.id, text: "RO " + tgNum(ro) + ": " + r.text }); }); });
  /* everything lives in this browser unless a folder is connected — nudge for a backup once a week */
  if(FS.status !== "connected" && STATE.punches.length){
    var bk = STATE.lastBackupAt ? Math.floor((Date.now() - new Date(STATE.lastBackupAt)) / 86400000) : null;
    if(bk === null || bk >= 7) soft.push({ code:"BK", day: STATE.lastBackupAt || "never", text: bk === null ? "No backup saved yet \u2014 your data is only in this browser." : "Last backup was " + bk + " days ago \u2014 your data is only in this browser." });
  }
  return { soft:soft, escalated:escalated };
}

/* ---------- dismissing a notification ----------
   A dismissal is remembered against what the notice is about — the RO, job, part,
   punch or day — never against its wording. So the moment the thing it complained
   about is actually fixed the notice goes on its own, the dismissal is forgotten
   with it, and if the same problem comes back you are told again. Dismiss means
   "I've seen this", not "never mention it". */
function noteKey(n){
  return [n.code,
          n.ro ? n.ro.id : (n.punch ? n.punch.roId : ""),
          n.op ? n.op.id : "",
          n.part ? n.part.id : "",
          n.punch ? n.punch.id : "",
          n.day || ""].join("|");
}
function dismissedMap(){
  if(!STATE.dismissed || typeof STATE.dismissed !== "object") STATE.dismissed = {};
  return STATE.dismissed;
}
function undismissed(list){
  var d = dismissedMap();
  return list.filter(function(n){ return !d[noteKey(n)]; });
}
/* Forget dismissals whose notice has stopped firing. Called once per redraw with
   the unfiltered lists; returns true when something was actually forgotten. */
function pruneDismissals(all){
  var d = dismissedMap(), live = {}, changed = false;
  all.forEach(function(n){ live[noteKey(n)] = 1; });
  Object.keys(d).forEach(function(k){ if(!live[k]){ delete d[k]; changed = true; } });
  return changed;
}
function dismissNote(key){
  if(!key) return;
  dismissedMap()[key] = Date.now();
  scheduleSave(true);
  render();
}
/* What the rest of the app sees: the live list, minus anything dismissed. */
function computeWarnings(){ return undismissed(computeWarningsAll()); }
function computeReminders(){
  var r = computeRemindersAll();
  return { soft: undismissed(r.soft), escalated: undismissed(r.escalated) };
}
/* the little × that sits at the end of every notice */
function noteX(n){
  return '<button class="x" data-action="dismiss-note" data-key="'+esc(noteKey(n))
    + '" title="Dismiss — you’ll be told again if it comes back" aria-label="Dismiss this notification">×</button>';
}
