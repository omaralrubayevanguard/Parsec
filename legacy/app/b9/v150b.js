/* ============================== Parsec 15 (B) — the clock only reminds ==============================
   Nothing stops or clocks you out by itself any more:
   · lunchOffClock — a punch stopped as Lunch or End of day closed the day clock — does nothing now (build_v9zz150b.py)
   · the RO page clock card no longer pauses your job at the shop's lunch time, nor starts it again after (ockAuto)
   Reminders instead, in the corner with 14.6's cards (one host, #v146):
   · "Lunch time" after 4 hours on the clock with no lunch clock-out that day — Stop · lunch 30 min · 1 hour · Not now
   · "Clock out for the day?" right when a job stops as End of day ("Clock out for lunch?" when it stops as Lunch);
     14.6's "Still on the clock?" 20 minutes after the shift end stays as it is
   · Not now / Not yet asks again 15 minutes later — per reminder, per person, for the day. */
var V150 = { snz: {}, LUNCH_AFTER: 240, SNOOZE: 15 };
function v150Snoozed(k){ return Date.now() < (V150.snz[k] || 0); }
function v150Shifts(me, day){ try{ return shiftsOfPerson(day, me) || []; }catch(e){ return []; } }
function v150OnClockMin(me, day){ var m = 0, now = Date.now(); v150Shifts(me, day).forEach(function(s){ m += Math.max(0, (s.out ? +new Date(s.out) : now) - new Date(s.in)) / 60000; }); return m; }
function v150HadLunch(me, day){ return v150Shifts(me, day).some(function(s){ return s.out && s.outReason === "Lunch"; }); }
function v150LunchOk(t, day){ try{ return !!(STATE.tlOk && STATE.tlOk["lunch|" + t + "|" + day]); }catch(e){ return false; } }
function v150Who(){ var t = v146Tech(); if(!t) return null; var me = v146Me() || t, sh = null; try{ sh = openShiftOf(me); }catch(e){} return sh && localDay(sh.in) === todayStr() ? { t: t, me: me, sh: sh, day: todayStr() } : null; }
/* 4 hours on the clock today and no lunch clock-out yet */
function v150LunchState(){
  var W = v150Who(); if(!W) return null;
  if(v150HadLunch(W.me, W.day) || v150LunchOk(W.t, W.day)) return null;
  var on = v150OnClockMin(W.me, W.day); if(on < V150.LUNCH_AFTER) return null;
  var k = "lunch|" + W.me + "|" + W.day; if(v150Snoozed(k)) return null;
  return { k: k, t: W.t, me: W.me, on: on, rp: v146Run(W.me) };
}
/* the last job today stopped as End of day (or Lunch), nothing running, still on the day clock */
function v150StopState(){
  var W = v150Who(); if(!W || v146Run(W.me)) return null;
  var last = null; v146Mine(W.me, W.day).forEach(function(p){ if(p.stop && (!last || new Date(p.stop) > new Date(last.stop))) last = p; });
  if(!last || (last.stopReason !== "End of day" && last.stopReason !== "Lunch")) return null;
  if(+new Date(last.stop) < +new Date(W.sh.in) - 60000) return null;            /* stopped before this clock-in: not this one */
  var lunch = last.stopReason === "Lunch"; if(lunch && v150HadLunch(W.me, W.day)) return null;
  var k = "stop|" + last.id; if(v150Snoozed(k)) return null;
  return { k: k, t: W.t, me: W.me, p: last, lunch: lunch, sh: W.sh };
}
function v150Btn(k, label, pri, extra){ return '<button type="button" class="v146-b' + (pri ? " pri" : "") + '" data-v150="' + k + '"' + (extra || "") + ">" + v146E(label) + "</button>"; }
function v150LunchHtml(L){
  var sub = v146Dur(L.on) + " on the clock" + (L.rp ? " · on " + v146OpLbl(L.rp) + " for " + v146Dur((Date.now() - new Date(L.rp.start)) / 60000) + " — your clock is still running" : " — no lunch yet");
  return '<div class="v146-card v150-lun" role="status" aria-live="polite"><b>Lunch time, ' + v146E(v146First(L.t)) + "</b><small>" + v146E(sub) + '</small><div class="r">'
    + v150Btn("l30", L.rp ? "Stop · lunch 30 min" : "Lunch · 30 min", true) + v150Btn("l60", "1 hour") + v150Btn("snz", "Not now", false, ' data-k="' + v146E(L.k) + '"') + "</div></div>";
}
function v150StopHtml(S){
  var at = +new Date(S.p.stop), late = Date.now() - at >= 5 * 60000, what = v146OpLbl(S.p) + " stopped as " + S.p.stopReason + " at " + v146HM(at);
  if(S.lunch) return '<div class="v146-card v150-lun v150-stop" role="status" aria-live="polite"><b>Clock out for lunch?</b><small>' + v146E(what) + ' — you’re still on the clock</small><div class="r">'
    + v150Btn("l30", "Lunch · 30 min", true) + v150Btn("l60", "1 hour") + v150Btn("snz", "Not now", false, ' data-k="' + v146E(S.k) + '"') + "</div></div>";
  return '<div class="v146-card v150-eod v150-stop" role="status" aria-live="polite"><b>Clock out for the day?</b><small>' + v146E(what) + '</small><div class="r">'
    + (late ? v150Btn("outat", "Clock out at " + v146HM(at), true) : "") + v150Btn("out", "Clock out now", !late) + v150Btn("snz", "Not yet", false, ' data-k="' + v146E(S.k) + '"') + "</div></div>";
}
/* drawn inside 14.6's corner (v146Tick); N = its "Still on the clock?" state — that card covers the day's end once it shows */
function v150Html(N){
  var h = "", S = v150StopState(), L = v150LunchState();
  if(S && !S.lunch){
    var past = false; try{ past = v146Min(Date.now()) >= v146ShiftEnd(S.t); }catch(e){}
    if(!N && !(UI.view === "timelog" && past)) h += v150StopHtml(S);           /* the Time Log has its own reminder past the shift end */
  }
  if(S && S.lunch) h += v150StopHtml(S);
  else if(L) h += v150LunchHtml(L);
  return h;
}
function v150OutAt(ms){
  var me = v146Me(), sh = null; try{ sh = openShiftOf(me); }catch(e){} if(!sh || v146Run(me)) return;
  pushUndo("clock out"); try{ commitNoteDrafts(); }catch(e){}
  sh.out = new Date(ms).toISOString(); sh.outReason = "End of day"; delete sh.backBy;
  sh.fixed = { by: me, at: nowIso(), why: "Clocked out when the last job stopped" };
  UI.modal = null; scheduleSave(true);
  pushToast("Clocked out at " + v146HM(ms) + " — when your last job stopped as End of day.", true);
  render(); try{ pxEndOfDay("End of day"); }catch(e){}
}
document.addEventListener("click", function(e){
  var b = e.target.closest && e.target.closest("#v146 [data-v150]"); if(!b) return;
  var k = b.getAttribute("data-v150"), S = v150StopState();
  if(k === "l30" || k === "l60") shiftClockOut("Lunch", k === "l60" ? 60 : 30);   /* stops a running job as Lunch and clocks out; 14.7's "Lunch is over" card asks you back */
  else if(k === "out") shiftClockOut("End of day");                                  /* 14.6's clock-out check if something's open */
  else if(k === "outat" && S && !S.lunch) v150OutAt(+new Date(S.p.stop));
  else if(k === "snz"){ var key = b.getAttribute("data-k"); if(key){ V150.snz[key] = Date.now() + V150.SNOOZE * 60000; pushToast("OK — it asks again at " + v146HM(V150.snz[key]) + "."); } }
  try{ v146Tick(); }catch(x){}
});
