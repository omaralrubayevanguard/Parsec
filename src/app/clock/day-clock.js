/* Parsec · clock · day-clock.js
   The day clock (shifts): clock in when the day starts, out when it ends; lunch off the clock; shiftsForDate, openShift.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   shiftList lunchOffClock shiftsForDate openShift shiftMs lastShiftOut shiftClockIn ensureOnClock shiftClockOut0 dayTimeIso shiftSetTime shiftSuggest … (14 functions)
   state      punches shifts
   uses       automations/ data/ kit/ ro/ shell/ state/
*/
/* ============================== DAY CLOCK (shifts) ==============================
   Clock in when the day starts, out when it ends. A day may hold more than one shift
   (clocked out mid-day); the gap between them is off the clock and counts for nothing. */
function shiftList(){ if(!Array.isArray(STATE.shifts)) STATE.shifts = []; return STATE.shifts; }
/* lunch is never on the clock. A punch stopped for Lunch inside a running day clock ends
   that clock at the stop (reason Lunch); if work picks up later that day, the clock starts
   again with the next punch. Runs on every save, so the stop dialog, the Time Log, the
   reasons picker and edits all land the same way. */
function lunchOffClock(){
  return;   /* Parsec 15: a stop never clocks you out — the reminders ask instead (b9/v150b.js) */
  var now = Date.now(), msg = null;
  STATE.punches.forEach(function(p){
    if((p.stopReason !== "Lunch" && p.stopReason !== "End of day") || !p.stop) return;   /* End of day too */
    var st = new Date(p.stop).getTime();
    var sh = shiftList().filter(function(x){ var a = new Date(x.in).getTime(), b = x.out ? new Date(x.out).getTime() - 1000 : Infinity; return a <= st && st < b && sameOwner(shiftOwner(x), punchOwner(p)); })[0];
    if(!sh) return;
    var day = localDay(p.stop);
    var next = STATE.punches.filter(function(x){ return x.id !== p.id && localDay(x.start) === day && new Date(x.start).getTime() >= st && sameOwner(punchOwner(x), punchOwner(p)); })
      .sort(function(a, b){ return new Date(a.start) - new Date(b.start); })[0] || null;
    var origOut = sh.out, origWhy = sh.outReason || null;
    if(next && new Date(next.start).getTime() - st < 60000) return;      /* straight onto the next operation: no break was taken */
    sh.out = p.stop; sh.outReason = p.stopReason; delete sh.backBy;
    if(next && (!origOut || new Date(next.start) < new Date(origOut))) shiftList().push({ id: uid("sh"), in: next.start, out: origOut || null, outReason: origOut ? origWhy : null, by: sh.by || shiftOwner(sh) });
    else if(!origOut && sameOwner(punchOwner(p), pcMe())) msg = p.stopReason + " \u2014 clocked out of the day at " + fmtTime(p.stop);
  });
  if(msg) setTimeout(function(){ pushToast(msg, true); }, 0);
}
function shiftsForDate(d){ return shiftList().filter(function(s){ return localDay(s.in) === d; }).sort(function(a,b){ return new Date(a.in) - new Date(b.in); }); }
function openShift(){ return openShiftOf(pcMe()); }   /* Parsec 12.7: your own day clock */
function shiftMs(s){ return Math.max((s.out ? new Date(s.out) : new Date()) - new Date(s.in), 0); }
/* the last clock-out today, if you are off the clock right now (lunch, an appointment…) */
function lastShiftOut(){
  if(openShift()) return null;
  var t = shiftsOfPerson(todayStr(), pcMe()); var s = t[t.length - 1];
  return s && s.out ? s : null;
}
function shiftClockIn(silent){
  if(openShift()) return;
  if(!silent) pushUndo("clock in");
  var prev = lastShiftOut();
  shiftList().push({ id: uid("sh"), in: nowIso(), out: null, by: pxMeName() });
  scheduleSave(true);
  if(prev && prev.outReason === "Lunch") pushToast("Back from lunch \u00b7 " + fmtHM(Date.now() - new Date(prev.out)) + " away", true);
  else pushToast("Clocked in at " + fmtTime(nowIso()), true);
  if(!silent) render();
}
/* starting a job while off the day clock puts you on it */
function ensureOnClock(){ if(!openShift()) shiftClockIn(true); }
function shiftClockOut0(reason, mins, notes, stand){
  var s = openShift(); if(!s) return;
  reason = reason || "End of day";
  commitNoteDrafts();
  pushUndo("clock out");
  var rp = runningPunch(), stopped = null;
  if(rp){
    rp.stop = nowIso(); rp.stopReason = (stand && STOP_REASONS_EXPLICIT.indexOf(stand) > -1) ? stand : reason;
    if(notes && String(notes).trim()) rp.notes = (String(rp.notes || "").trim() ? String(rp.notes).replace(/\s+$/, "") + "\n" : "") + String(notes).trim();
    creditBurnt(rp); stopped = rp;
  }
  s.out = nowIso(); s.outReason = reason;
  if(mins) s.backBy = new Date(Date.now() + mins * 60000).toISOString(); else delete s.backBy;
  UI.modal = null;
  scheduleSave(true);
  var sro = stopped ? getRO(stopped.roId) : null;
  pushToast((reason === "Lunch" ? "Lunch" + (mins ? " \u2014 back by " + fmtTime(s.backBy) : "") : reason + " \u2014 clocked out at " + fmtTime(s.out))
    + (stopped ? " \u00b7 " + roTag(sro) + " stopped" + (stopped.stopReason !== reason ? " as " + stopped.stopReason : "") : ""), true);
  render();
  pxEndOfDay(reason);
}
/* "HH:MM" on a given day, as an ISO time */
function dayTimeIso(day, hhmm){ if(!/^\d{1,2}:\d{2}$/.test(hhmm||"")) return null; var d = new Date(day + "T" + (hhmm.length === 4 ? "0" + hhmm : hhmm) + ":00"); return isNaN(d) ? null : d.toISOString(); }
function shiftSetTime(id, edge, hhmm){
  var s = shiftList().filter(function(x){ return x.id === id; })[0]; if(!s) return false;
  var day = localDay(s.in), iso = dayTimeIso(day, hhmm);
  if(!iso){ pushToast("That isn’t a time."); return false; }
  var inT = edge === "in" ? iso : s.in, outT = edge === "out" ? iso : s.out;
  if(outT && new Date(outT) <= new Date(inT)){ pushToast("Clock out has to come after clock in."); return false; }
  if(edge === "in" && !s.out && new Date(iso) > new Date()){ pushToast("Clock in can’t be in the future."); return false; }
  pushUndo("edit " + (edge === "in" ? "clock in" : "clock out"));
  s[edge] = iso; s.edited = true; s.editedAt = nowIso();
  scheduleSave(true);
  return true;
}
/* A clock in / out segment typed by hand. Same record as a live clock in, so it draws on the
   day bar, edits from its popover or the Clock row, and undoes like any other change. */
function shiftSuggest(day){
  var me = pcMe(), ps = punchesForDate(day).filter(function(p){ return sameOwner(punchOwner(p), me); }), today = day === todayStr(), ss = shiftsOfPerson(day, me);
  var lastOut = ss.length && ss[ss.length-1].out ? new Date(ss[ss.length-1].out) : null;
  var inT = lastOut ? new Date(lastOut.getTime() + 30*60000) : (ps.length ? new Date(ps[0].start) : new Date(day + "T07:00:00"));
  var outT = null;
  if(!today || ps.some(function(p){ return p.stop; })){
    outT = ps.length ? ps.reduce(function(m, p){ var e = p.stop ? new Date(p.stop) : new Date(); return e > m ? e : m; }, new Date(0)) : new Date(day + "T15:30:00");
    if(outT <= inT) outT = new Date(inT.getTime() + 30*60000);
  }
  return { in: fmtClockHM(inT), out: outT && !(today && outT > new Date()) ? fmtClockHM(outT) : "" };
}
function shiftAddManual(day, tIn, tOut, who){
  if(who == null) who = pxMeName();   /* Parsec 12.7: whose day clock */
  if(!day || !tIn){ return { ok:false, msg:"Pick a day and a clock in time." }; }
  var inD = new Date(day + "T" + tIn), outD = tOut ? new Date(day + "T" + tOut) : null;
  if(isNaN(inD)){ return { ok:false, msg:"That clock in time isn\u2019t valid." }; }
  if(outD && isNaN(outD)){ return { ok:false, msg:"That clock out time isn\u2019t valid." }; }
  if(outD && outD <= inD){ return { ok:false, msg:"Clock out has to come after clock in." }; }
  if(!outD){
    if(openShiftOf(who)) return { ok:false, msg:"You\u2019re already on the clock \u2014 give this segment a clock out time." };
    if(inD > new Date()) return { ok:false, msg:"A segment that is still running can\u2019t start in the future." };
  } else if(outD > new Date()){ return { ok:false, msg:"Clock out can\u2019t be in the future." }; }
  var end = outD || new Date();
  var clash = shiftList().filter(function(x){ var xo = x.out ? new Date(x.out) : new Date(); return inD < xo && end > new Date(x.in) && sameOwner(shiftOwner(x), who); })[0];
  if(clash){ return { ok:false, msg:"That overlaps the clock segment " + fmtClockHM(new Date(clash.in)) + (clash.out ? " \u2013 " + fmtClockHM(new Date(clash.out)) : " \u2013 now") + " (" + fmtDate(clash.in) + ")." }; }
  pushUndo("add clock segment");
  shiftList().push({ id: uid("sh"), in: inD.toISOString(), out: outD ? outD.toISOString() : null, manual: true, by: who });
  scheduleSave(true);
  return { ok:true, in: inD, out: outD };
}
/* One button carries the whole clock story: off the clock it invites you in; on the
   clock it shows the running total and turns into "Clock out" under the cursor.
   Colours come from the theme tokens, so it follows the page instead of fighting it. */
function todayShiftMs(){ var t = todayStr(), me = pcMe(); return shiftList().reduce(function(a, x){ return localDay(x.in) === t && sameOwner(shiftOwner(x), me) ? a + shiftMs(x) : a; }, 0); }
