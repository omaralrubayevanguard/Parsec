/* Parsec 12.8 — a completed operation opens back up: its status changes and its clock starts again.
   opReopenMark(op, roId, how) runs just before a clock starts on an operation, or a status is picked for it by hand.
   If the operation was complete it notes when and who (op.reopened), puts a line in the audit log, opens the RO
   again if it had been completed or closed, and hands back "RO 1234 Op 2" for the toast. Otherwise it does nothing. */
function opWasDone(op){ try{ return !!op && !op.declined && opDoneNow(op); }catch(e){ return false; } }
function opReopenMark(op, roId, how){
  if(!opWasDone(op)) return null;
  var ro = getRO(roId), n = ro ? (ro.operations || []).indexOf(op) + 1 : 0, lbl = (ro ? roLabel(ro) : "RO") + " Op " + (n || "?");
  if(!Array.isArray(op.reopened)) op.reopened = [];
  op.reopened.push({ at: nowIso(), by: punchByName() || "Admin", how: how || "start" });
  if(op.reopened.length > 20) op.reopened.splice(0, op.reopened.length - 20);
  try{ audit("reopen", lbl + " reopened" + (how && how !== "start" ? " — set to " + how : " — clock started"), ro); }catch(e){}
  if(ro){
    var rs = roStatus(ro);
    if(/^Complete/.test(rs.status || "")){ ro.status = { status: "Hold Tech", sub: null, setAt: nowIso() }; try{ audit("status", roLabel(ro) + ": " + rs.status + " → Hold Tech (an operation was reopened)", ro); }catch(e){} try{ markStatusFlip(ro); }catch(e){} }
    if(ro.dateClosed){ ro.dateClosed = null; delete ro.dateClosedAuto; }
  }
  OPREO_T = { t: lbl + " reopened", at: Date.now() };
  return lbl;
}
/* an automation that follows the reopening (the RO goes to Working…) says it too, in its own toast */
var OPREO_T = null;
function opReoTake(){ var x = OPREO_T; OPREO_T = null; return x && Date.now() - x.at < 4000 ? x.t + " \u00b7 " : ""; }
/* the last time it was reopened, for the clock card's chip */
function opReopenedLast(op){ var L = op && Array.isArray(op.reopened) ? op.reopened : []; return L.length ? L[L.length - 1] : null; }
