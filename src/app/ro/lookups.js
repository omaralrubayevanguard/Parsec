/* Parsec · ro · lookups.js
   Finding things: getRO(id), the Shop RO (shop time), prices and money per part / operation / RO.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   getRO ensureShopRo shopRo isShopPunch roTag priceOf partLine$ opMoney roMoney money invPriceOf kitPrice … (16 functions, 2 constants)
   state      laborRate punches ros
   uses       pages/ pages/inventory/ state/
*/
/* ============================== LOOKUPS ============================== */
function getRO(id){ return STATE.ros.find(function(r){return r.id===id;}) || (id === SHOP_RO_ID ? shopRo() : undefined); }
/* shop time is a standing internal RO — it never shows up in RO counts, the yard or
   efficiency, but its three operations clock on like any job (no parts). */
var SHOP_RO_ID = "ro_shop";
var SHOP_OPS = [["op_shop_maint","Shop maintenance"],["op_shop_train","Training"],["op_shop_clean","Cleaning"]];
function ensureShopRo(st){
  st = st || STATE;
  var r = st.shopRo;
  if(!r || r.id !== SHOP_RO_ID){
    r = st.shopRo = { id: SHOP_RO_ID, shop: true, roNumber: "SHOP", customerName: "Shop time", caseNumber: "", dateOpened: "2026-01-01T12:00:00.000Z", dateClosed: null,
      vin: "", mileage: "", engineHours: "", unitNumber: "", keyTag: "", location: "", buildDate: "", warrantyStart: "", techSupportCase: "",
      checklist: {}, checklistPopupPending: false, _lastKnownStatus: "Working", status: { status: "Working", sub: null, setAt: "2026-01-01T12:00:00.000Z" },
      operations: [], bulletins: [] };
  }
  if(!Array.isArray(r.operations)) r.operations = [];
  SHOP_OPS.forEach(function(d){
    if(r.operations.some(function(o){ return o.id === d[0]; })) return;
    r.operations.push({ id: d[0], complaint: d[1], cause: "", correction: "", quoted: 0, isStandard: true, standardName: d[1], declined: false, parts: [], burnt: 0, work: "", jobType: "OP", shop: true });
  });
  return r;
}
function shopRo(){ return ensureShopRo(STATE); }
function isShopPunch(p){ return !!p && p.roId === SHOP_RO_ID; }
/* "RO 24158" for a job, "Shop" for shop time */
function roTag(ro){ return !ro ? "RO ?" : (ro.shop ? "Shop" : roLabel(ro)); }   /* no "RO RO-…" */
/* money everywhere — one set of helpers for every page */
function priceOf(v){ var n = parseFloat(String(v == null ? "" : v).replace(/[$,\s]/g, "")); return isFinite(n) ? n : 0; }
function partLine$(p){ var q = parseFloat(p && p.qty); if(!isFinite(q)) q = 1; return q * priceOf(p && p.price); }   /* a qty of 0 is 0, a blank qty is 1 */
function opMoney(op){ var lab = (+op.quoted || 0) * (+op.laborRate > 0 ? +op.laborRate : laborRate()), pts = (op.parts || []).reduce(function(a, p){ return a + partLine$(p); }, 0), core = (op.parts || []).reduce(function(a, p){ var q = parseFloat(p && p.qty); if(!isFinite(q)) q = 1; return a + q * priceOf(p && p.core); }, 0), oth = priceOf(op.otherCost); return { labor: lab, parts: pts, core: core, other: oth, total: lab + pts + core + oth }; }   /* Parsec 14: an operation's own labor rate (from the case), and core charges, count */
function roMoney(ro){ var t = { labor: 0, parts: 0, core: 0, other: 0, supplies: 0, total: 0 }; (ro && ro.operations || []).forEach(function(op){ if(op.declined) return; var m = opMoney(op); t.labor += m.labor; t.parts += m.parts; t.core += m.core || 0; t.other += m.other; t.total += m.total; }); var sup = priceOf(ro && ro.shopSupplies); if(sup){ t.supplies = sup; t.other += sup; t.total += sup; } return t; }   /* Parsec 14: the RO's shop supplies & fees from the case */
function money(n){ n = +n || 0; return (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
/* the price the Parts page has for a part number (or description), 0 if none */
function invPriceOf(pn, desc){
  var k = invPnKey(pn), dk = invDescKey(desc), hit = 0;
  invList().some(function(it){ return [it].concat(it.children || []).some(function(x){
    if(!priceOf(x.price) || (x === it && it.kit)) return false;
    if(k ? invPnKey(x.pn) === k : (dk && invDescKey(x.desc) === dk)){ hit = priceOf(x.price); return true; } return false; }); });
  return hit;
}
function kitPrice(it){ return (it.children || []).reduce(function(a, c){ return a + (parseFloat(c.qty) || 1) * priceOf(c.price); }, 0); }
function laborRate(){ var r = +((STATE && STATE.laborRate) || 0); return r > 0 ? r : 210; }   /* shop labor rate, set in Settings */
function getOp(roId, opId){ var ro=getRO(roId); if(!ro) return null; return ro.operations.find(function(o){return o.id===opId;}); }
function opPunches(opId){ return STATE.punches.filter(function(p){return p.opId===opId;}).sort(function(a,b){return new Date(a.start)-new Date(b.start);}); }
function punchesForDate(d){ return STATE.punches.filter(function(p){ return localDay(p.start)===d; }).sort(function(a,b){ return new Date(a.start)-new Date(b.start); }); }
