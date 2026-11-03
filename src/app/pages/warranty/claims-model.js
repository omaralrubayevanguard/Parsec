/* Parsec · pages/warranty · claims-model.js
   Claims basics: the warranty claim statuses (WC_ST), the operations that are claims, opStory, when an operation was done or reopened.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   truckYM0 opStory opWasDone opReopenMark opReoTake opReopenedLast opDoneNow opFaultCodes milesTxt openRoAt wcIsOp wcOps … (20 functions, 7 constants)
   state      ros
   uses       access/ data/ library/ pages/ ro/ shell/ state/
*/
/* ============================== WARRANTY ADMIN + COMMON FIXES ==============================
   Two pages beside Repair Orders, built like it: the list down the right, the selected item
   in a light header card with a tracker, cards underneath.
   Warranty: every RO with a warranty or recall operation. Only those operations come over —
   customer-pay operations on the same RO stay on the RO.
   Fixes: every finished operation, grouped by complaint — cause, correction, the truck, the
   VIN, the date. Add one by hand for work done before Parsec. */
var TRUCK_MAKERS = { '4V4':'Volvo','4V5':'Volvo','4VG':'Volvo','4VM':'Volvo','4V1':'Volvo','4V2':'Volvo','4VZ':'Volvo','1M1':'Mack','1M2':'Mack',
  '1XK':'Kenworth','2XK':'Kenworth','1NK':'Kenworth','1XP':'Peterbilt','2XP':'Peterbilt','1NP':'Peterbilt','1FU':'Freightliner','1FV':'Freightliner',
  '3AK':'Freightliner','3AL':'Freightliner','1HT':'International','1HS':'International','3HS':'International','3HA':'International','5KJ':'Western Star','5KK':'Western Star' };
var TRUCK_MODELS = ["VNL 300","VNL 400","VNL 640","VNL 660","VNL 670","VNL 740","VNL 760","VNL 780","VNL 860","VNR 300","VNR 400","VNR 640","VNR Electric",
  "VHD 300","VHD 400","VAH","VNX","Mack Anthem","Mack Pinnacle","Mack Granite","Mack LR","Mack MD"];
function truckYM0(ro){
  var v = String((ro && ro.vin) || '').toUpperCase().replace(/[^A-Z0-9]/g, ''), y = null, mk = null;
  if(v.length >= 10){
    var c = v.charAt(9), i = 'ABCDEFGHJKLMNPRSTVWXY'.indexOf(c), now = new Date().getFullYear();
    if(i > -1){ y = 2010 + i; if(y > now + 1) y -= 30; } else if(/[1-9]/.test(c)){ y = 2030 + (+c); if(y > now + 1) y -= 30; }
    mk = TRUCK_MAKERS[v.slice(0, 3)] || null;
  }
  var model = String((ro && ro.model) || '').trim();
  if(model && mk && model.toLowerCase().indexOf(mk.toLowerCase()) === 0) mk = null;
  return { year: y, make: mk, model: model, line: [y, mk, model].filter(Boolean).join(' ') };
}
/* cause / correction as written on the RO: the typed field, then every log line of that kind */
function opStory(op, kind){
  try{ if(typeof ccSync === 'function') ccSync(op); }catch(e){}   /* 17.3: Cause and Correction fill from the tech notes */
  var cc = (op.log || []).filter(function(l){ return l && l.cc && l.kind === kind && String(l.text || '').trim(); })[0];
  if(cc) return String(cc.text).trim();   /* 17.3: the line the notes filled (or the tech wrote) is the whole story */
  var out = [], f = String(op[kind === 'fix' ? 'correction' : 'cause'] || '').trim();
  if(f) out.push(f);
  (op.log || []).forEach(function(l){ if(l.kind === kind && String(l.text || '').trim()) out.push(String(l.text).trim()); });
  return out.join(' ');
}
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

function opDoneNow(op){ var s = opStatus(op); return /^Complete/.test(typeof s === 'string' ? s : (s && s.status) || ''); }
function opFaultCodes(op){ return (op.faults || []).map(function(f){ return libCodeLabel(f).replace(/ \u00b7 /g, ' '); }); }   /* P1050 FTB 17 · SPN 3226 FMI 2 · MID 128 PID 110 FMI 0 */
function milesTxt(v){ var n = String(v || '').replace(/\D/g, ''); return n ? Number(n).toLocaleString('en-US') + ' mi' : ''; }
/* jump to an operation on the Repair Orders page */
function openRoAt(roId, opId){
  if(!getRO(roId)) return;
  UI.view = 'ros'; UI.selectedRo = roId; UI.modal = null;
  if(opId){
    if(!UI.roOp || typeof UI.roOp !== 'object') UI.roOp = {};
    if(!UI.roOpen || typeof UI.roOpen !== 'object') UI.roOpen = {};
    UI.roOp[roId] = opId; UI.roOpen[roId] = [opId];
  }
  persistUI(); render(); window.scrollTo(0, 0);
}

/* ---------------- Warranty ---------------- */
var WC_ST = {
  repair:    { l: 'In repair',     i: 0, c: 'repair' },
  ready:     { l: 'Ready to file', i: 1, c: 'ready' },
  submitted: { l: 'Submitted',     i: 2, c: 'subm' },
  returned:  { l: 'Returned',      i: 2, c: 'back' },
  approved:  { l: 'Approved',      i: 3, c: 'ok' },
  paid:      { l: 'Paid',          i: 4, c: 'paid' },
  denied:    { l: 'Denied',        i: 4, c: 'den' }
};
var WC_MANUAL = ['submitted','returned','approved','paid','denied'];
var WC_RANK = { returned: 0, ready: 1, repair: 2, submitted: 3, approved: 4, denied: 5, paid: 6 };
function wcIsOp(ro, op){
  if(!ro || !op || op.declined || ro.id === SHOP_RO_ID) return false;
  var p = fcPay(ro, op); return p === 'warranty' || p === 'recall';
}
function wcOps(ro){ return (ro.operations || []).filter(function(op){ return wcIsOp(ro, op); }); }
function wcRos(){ return STATE.ros.filter(function(ro){ return wcOps(ro).length > 0; }); }
function wcStatus(ro, op){ var c = op.claim; if(c && WC_MANUAL.indexOf(c.status) >= 0) return c.status; return opDoneNow(op) ? 'ready' : 'repair'; }
function wcNeedCount(){ try{ return UI.view === 'warranty' ? 0 : waBadgeN(); }catch(e){ return 0; } }
function wcFind(opId){
  for(var i = 0; i < STATE.ros.length; i++){ var ro = STATE.ros[i], op = (ro.operations || []).filter(function(o){ return o.id === opId; })[0]; if(op) return { ro: ro, op: op }; }
  return null;
}
function wcClaim(op){ if(!op.claim || typeof op.claim !== 'object') op.claim = { status: '', history: [] }; if(!Array.isArray(op.claim.history)) op.claim.history = []; return op.claim; }
function wcCausal(op){ var c = op.claim || {}, ps = opRealParts(op); return ps.filter(function(p){ return p.id === c.causal; })[0] || ps[0] || null; }
function wcFail(op){
  var c = op.claim || {}; if(String(c.failCode || '').trim()) return String(c.failCode).trim();
  var fc = opFaultCodes(op); if(fc.length) return fc[0];
  var m = /\b(SPN\s*\d+(?:\s*FMI\s*\d+)?|[PCBU][0-9][0-9A-F]{3})\b/i.exec(op.complaint || ''); return m ? m[1].toUpperCase() : '';
}
var WC_FIELDS = { claimNo: 1, failCode: 1, laborHrs: 1, amount: 1, paid: 1, notes: 1, returnReason: 1, causal: 1 };
function wcSet(opId, k, v){ if(!WC_FIELDS[k]) return; var f = wcFind(opId); if(!f) return; wcClaim(f.op)[k] = k === "amount" || k === "paid" ? cdMoney(v) : v; scheduleSave(); }
