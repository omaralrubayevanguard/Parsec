/* Parsec · ro · ordering.js
   How ROs sort: last touched, finished, days open; sortedROs(); pillHtml for the fast-punch pill.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   roLastTouched roLooksFinished roIsDone roDoneAt sortedROs daysOpen fmtElapsedShort pillHtml (8 functions)
   state      punches ros
   uses       kit/ state/
*/
/* ============================== RO ORDERING ============================== */
/* Most recently touched first, with finished work sinking to the bottom.
   Creation order is meaningless once you have twenty ROs open. */
function roLastTouched(ro){
  var t = 0;
  STATE.punches.forEach(function(p){
    if(p.roId === ro.id || ro.operations.some(function(o){ return o.id===p.opId; })){
      var v = p.stop ? new Date(p.stop).getTime() : Date.now();
      if(v > t) t = v;
    }
  });
  return t;
}
/* Every operation finished (or declined), but the RO status has not caught up.
   The RO status is yours to set, so this nudges rather than changing anything. */
function roLooksFinished(ro){
  if(!ro.operations.length) return false;
  return ro.operations.every(function(op){
    if(op.declined) return true;
    var st = opStatus(op); var s = typeof st==="string" ? st : st.status;
    return isCompleteName(s);
  });
}
function roIsDone(ro){
  var s = roStatus(ro); s = typeof s==="string" ? s : s.status;
  return s==="Complete – Released" || s==="Declined";   /* Parsec 14: closed at release — the work done is roWorkDone */
}
function roDoneAt(ro){
  var st = ro.status && ro.status.setAt ? new Date(ro.status.setAt).getTime() : 0;
  if(st) return st;
  return ro.dateClosed ? new Date(ro.dateClosed).getTime() : (ro.dateOpened ? new Date(ro.dateOpened).getTime() : 0);
}
function sortedROs(){
  return STATE.ros.slice().sort(function(a,b){
    var da = roIsDone(a)?1:0, db = roIsDone(b)?1:0;
    if(da !== db) return da - db;                      // open work first
    if(da){                                            // finished: newest first (when it was finished, else opened)
      var fa = roDoneAt(a), fb = roDoneAt(b);
      if(fa !== fb) return fb - fa;
    }
    var ta = roLastTouched(a), tb = roLastTouched(b);
    if(ta !== tb) return tb - ta;                      // then most recently worked
    var oa = a.dateOpened ? new Date(a.dateOpened).getTime() : 0;
    var ob = b.dateOpened ? new Date(b.dateOpened).getTime() : 0;
    return ob - oa;                                    // then newest RO
  });
}

/* Same idea as touchedLabel, trimmed for the rail where space is tight. */
/* Days the truck has been in the shop — the number the foreman actually asks for. */
function daysOpen(ro){
  if(!ro.dateOpened) return null;
  var a = new Date(ro.dateOpened).getTime(); if(!isFinite(a)) return null;
  return Math.max(0, Math.floor((Date.now() - a) / 86400000));   /* Parsec 14: whole days since it opened — the RO page and the Technician page count the same */
}
function fmtElapsedShort(ms){
  var m = Math.floor(Math.max(ms,0) / 60000);
  return Math.floor(m/60) + ":" + String(m%60).padStart(2,"0");
}

/* ============================== FAST PUNCH ============================== */

/* ============================== DAY REPORT ============================== */

/* ============================== RENDER HELPERS ============================== */
function pillHtml(st){   /* Parsec 14: one status look (b9/st14.js) */
  var s = typeof st==="string"?st:st.status, sub = typeof st==="string"?null:st.sub;
  return pgSt('ro', s, { cls: 'sm', sub: sub ? '· ' + sub : '' });
}
