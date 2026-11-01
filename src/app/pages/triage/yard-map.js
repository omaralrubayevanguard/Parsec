/* Parsec · pages/triage · yard-map.js
   Triage's yard map: TY_CAT (arrival → released, the categories), tyCat(ro), late, where a truck is.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   tyMe tyMine tyCat tyAgeMs tyLate tyReleasedToday tyOnYardAll tyWhereTarget tyFindRo tySearch viewTriage TY_CAT (11 functions, 1 constant)
   state      punches ros techName
   uses       access/ clock/ data/ pages/ ro/ shell/ state/
*/
/* ============================== TRIAGE — the yard map ==============================
   The yard drawn as it is (shop floor, waiting-arrival line, triage lanes, the lot rows),
   every truck a card in its spot. Three ways to look at it (Lot plan, Flow, Zones), three
   card styles, filters that fade what doesn't match, and Where's my truck. Below it: what
   needs action, and the New repair order card with the case extraction. */
var TY_CAT = { arr: ["Arriving", "var(--ka39b8e)"], chk: ["Checked in", "var(--k6b6459)"], apr: ["Awaiting approval", "var(--k8a7a62)"],
  wrk: ["In repair", "var(--kb8b0a3)"], rdy: ["Ready to release", "var(--k2a2723)"], rel: ["Released", "var(--k8a8378)"] };
TY_CAT.arr[1] = "#a1a1aa"; TY_CAT.chk[1] = "#0ea5e9"; TY_CAT.apr[1] = "#f59e0b"; TY_CAT.wrk[1] = "#8b5cf6"; TY_CAT.rdy[1] = "#22c55e"; TY_CAT.rel[1] = "#71717a";   /* one set for both themes */
function tyMe(){
  var sf = viewAsStaff(); if(sf && sf.name) return sf.name;
  if(STATE.techName) return STATE.techName;
  var rp = runningPunch(), ro = rp ? getRO(rp.roId) : null;
  if(ro && ro.assignedTech) return ro.assignedTech;
  var last = null; STATE.punches.forEach(function(p){ if(!last || new Date(p.start) > new Date(last.start)) last = p; });
  ro = last ? getRO(last.roId) : null;
  return ro && ro.assignedTech ? ro.assignedTech : "";
}
function tyMine(ro, me){ return !!me && String(ro.assignedTech || "").toLowerCase() === String(me).toLowerCase(); }
function tyCat(ro){
  if(!onYard(ro)) return "rel";
  var st = roStatus(ro).status, sp = spotOf(ro.location);
  if(sp && /^Ready /.test(sp)) return "arr";
  if(st === "Waiting – Customer") return "apr";
  if(st === "Complete – Road test" || st === "Declined") return "rdy";
  var burnt = (ro.operations || []).reduce(function(s, o){ return s + (+o.burnt || 0); }, 0);
  if((sp && /^Triage /.test(sp)) || (ro.dateOpened && localDay(ro.dateOpened) === todayStr() && !burnt)) return "chk";
  return "wrk";
}
function tyAgeMs(ro, c){ return c === "chk" ? ageSince(ro.dateOpened) : ageSince(ro.status && ro.status.setAt); }
function tyLate(ro, c){
  var a = tyAgeMs(ro, c); if(a == null) return false;
  return ((c === "apr" || c === "rdy") && a > 24 * 3600000) || (c === "chk" && !ro.assignedTech && a > 2 * 3600000);
}
function tyReleasedToday(){ var t = todayStr(); return STATE.ros.filter(function(ro){ return !onYard(ro) && ro.status && ro.status.setAt && localDay(ro.status.setAt) === t; }); }
function tyOnYardAll(){ return STATE.ros.filter(onYard).concat(tyReleasedToday()); }
function tyWhereTarget(){
  var rp = runningPunch(); if(rp && getRO(rp.roId) && !getRO(rp.roId).shop) return rp.roId;
  var last = null; STATE.punches.forEach(function(p){ var r = getRO(p.roId); if(r && !r.shop && onYard(r) && (!last || new Date(p.start) > new Date(last.start))) last = p; });
  if(last) return last.roId;
  var me = tyMe(), m = STATE.ros.filter(function(ro){ return onYard(ro) && tyMine(ro, me); })[0];
  return m ? m.id : null;
}
function tyFindRo(id){
  var ro = getRO(id); if(!ro) return false;
  UI.trFind = id; UI.trFindAt = Date.now(); UI.trFindN = (UI.trFindN || 0) + 1; UI.trSel = id; UI.trView = "lot"; UI.trMenu = false;
  if(UI.trFilt && UI.trFilt !== "all") UI.trFilt = "all";
  render();
  setTimeout(function(){ var el = document.querySelector('.ty-t.on[data-ro="'+id+'"]'); if(el && el.scrollIntoView) el.scrollIntoView({ block: "center", behavior: "smooth" }); }, 30);
  return true;
}
function tySearch(q){
  q = String(q || "").trim().toLowerCase(); UI.trQ = q; if(q.length < 2) return;
  var qd = q.replace(/\D/g, "");
  var hit = tyOnYardAll().filter(function(ro){
    var n = String(ro.roNumber || "").toLowerCase();
    return (qd.length >= 3 && n.replace(/\D/g, "").indexOf(qd) > -1) || n.indexOf(q) > -1
      || String(ro.customerName || "").toLowerCase().indexOf(q) > -1 || String(ro.unitNumber || "").toLowerCase() === q
      || (q.length >= 4 && String(ro.vin || "").toLowerCase().indexOf(q) > -1);
  })[0];
  if(hit && hit.id !== UI.trFind) tyFindRo(hit.id);
}
function viewTriage(){
  yardAutoPlace();
  return tgView();
}
