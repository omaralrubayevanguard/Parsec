/* Parsec · pages · shared-yard.js
   The yard shared by Foreman, Manager and Triage: spots, lines, the map, where each RO is (spotOf / onYard), auto-placing arrivals.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   yardCfg yardSpots spotOf onYard yardMap roInfo roLabel spotLabel spotById yardAutoPlace yardZoomApply yardZoomBy … (14 functions, 7 constants)
   state      punches ros yard
   uses       access/ data/ kit/ pages/foreman/ pages/triage/ ro/ shell/ state/
   at load    on document wheel · on document pointerdown · on document pointermove · on document pointerup · on document click · on document keydown
*/
/* ============================== FOREMAN · MANAGER · TRIAGE ==============================
   Three shop pages under Repair Orders. They all read the same repair orders: an RO's
   Location field places its truck on the yard (Bay 3, Lot B4, Ready 2, Triage 1), so a move
   made on one page shows on every page. The yard layout and the staff list are saved with
   the shop data. */
/* The lot is laid out the way the yard really is: pairs of rows back to back, a drive
   aisle between each pair, landscaped islands capping the ends. The shop floor is one
   UpTime bay on the left, odd bays along the top, even bays along the bottom. */
/* Each lot row is a stage line: where a truck sits says what is happening to it. */
var LOT_LINES = {
  A: { name: "Leasing", note: "Leasing department — extra usage trucks." },
  B: { name: "Completed", note: "Completed work after the road test. A truck here sometimes goes back to diagnosis." },
  C: { name: "Road Test & repairs done", note: "Road test and repairs done — finished repairs, customer pay or warranty (recall operations are warranty). Also diagnostics after a repair, or an operation declined with no repair needed." },
  D: { name: "Check In & Diagnostic", note: "Initial check-in and first diagnosis." },
  E: { name: "Overflow", note: "Overflow — anyone, anything." },
  F: { name: "Overflow", note: "Overflow — anyone, anything." }
};
var YARD_DEFAULT = { v: 3, bays: 16, uptime: true, awning: 2,
  rows: [{ id: "A", n: 11 }, { id: "B", n: 11 }, { id: "C", n: 11 }, { id: "D", n: 11 }, { id: "E", n: 11 }, { id: "F", n: 11 }],
  ready: 6, triage: 6 };
var YARD_V1_ROWS = "A:10,B:10,C:8";
function yardCfg(){
  var y = STATE.yard;
  if(!y || typeof y !== "object") y = STATE.yard = JSON.parse(JSON.stringify(YARD_DEFAULT));
  if(!(y.bays >= 0)) y.bays = YARD_DEFAULT.bays;
  if(!Array.isArray(y.rows)) y.rows = JSON.parse(JSON.stringify(YARD_DEFAULT.rows));
  if(!(y.ready >= 0)) y.ready = YARD_DEFAULT.ready;
  if(!(y.triage >= 0)) y.triage = YARD_DEFAULT.triage;
  if(y.uptime === undefined) y.uptime = true;
  if(!(y.awning >= 0)) y.awning = YARD_DEFAULT.awning;
  /* a yard still on the first stock layout moves up to the real one; anything the shop
     has set itself is left exactly as it is */
  if(!y.v && y.rows.map(function(r){ return r.id + ":" + r.n; }).join(",") === YARD_V1_ROWS){
    y.rows = JSON.parse(JSON.stringify(YARD_DEFAULT.rows));
  }
  /* v3: 11 spots a row and 16 bays. A yard still on the v2 stock layout moves up; a layout
     the shop set itself is left as it is. */
  if((y.v || 0) < 3){
    if(y.rows.map(function(r){ return r.id + ":" + r.n; }).join(",") === "A:18,B:18,C:16,D:16,E:12,F:12") y.rows = JSON.parse(JSON.stringify(YARD_DEFAULT.rows));
    if(y.bays === 12) y.bays = YARD_DEFAULT.bays;
    y.v = 3; setTimeout(function(){ scheduleSave(true); }, 0);
  }
  y.v = 3;
  return y;
}
function yardSpots(){
  var y = yardCfg(), out = [], i;
  for(i = 1; i <= y.awning; i++) out.push({ id: "Awning " + i, zone: "awning", n: i });
  if(y.uptime) out.push({ id: "UpTime", zone: "uptime", n: 0 });
  for(i = 1; i <= y.bays; i++) out.push({ id: "Bay " + i, zone: "bay", n: i });
  y.rows.forEach(function(r){ for(var k = 1; k <= r.n; k++) out.push({ id: "Lot " + r.id + k, zone: "lot", row: r.id, n: k }); });
  for(i = 1; i <= y.ready; i++) out.push({ id: "Ready " + i, zone: "ready", n: i });
  for(i = 1; i <= y.triage; i++) out.push({ id: "Triage " + i, zone: "triage", n: i });
  return out;
}
/* a typed location -> a yard spot id, or null when it names no spot (Offsite, Lot A, …) */
function spotOf(loc){
  var s = String(loc || "").trim(), m;
  if(!s) return null;
  if(/^up\s*-?\s*time(\s*bay)?$/i.test(s)) return "UpTime";
  if((m = /^awning\s*#?\s*(\d+)$/i.exec(s))) return "Awning " + (+m[1]);
  if(/^awning$/i.test(s)) return "Awning 1";
  if((m = /^bay\s*#?\s*(\d+)$/i.exec(s))) return "Bay " + (+m[1]);
  if((m = /^(?:lot\s*)?([A-Za-z])\s*-?\s*(\d+)$/i.exec(s))) return "Lot " + m[1].toUpperCase() + (+m[2]);
  if((m = /^ready\s*(?:line)?\s*#?\s*(\d+)$/i.exec(s))) return "Ready " + (+m[1]);
  if((m = /^(?:triage|check-?in)\s*(?:lane)?\s*#?\s*(\d+)$/i.exec(s))) return "Triage " + (+m[1]);
  return null;
}
/* a truck is on the yard until it is released (closed out) */
function onYard(ro){ return roStatus(ro).status !== "Complete – Released"; }
function yardMap(){
  var valid = {}, map = {}, unplaced = [], elsewhere = [];
  yardSpots().forEach(function(s){ valid[s.id] = s; });
  STATE.ros.forEach(function(ro){
    if(!onYard(ro)) return;
    var sp = spotOf(ro.location);
    if(sp && valid[sp] && !map[sp]) map[sp] = ro;
    else if(ro.location && !sp) elsewhere.push(ro);
    else unplaced.push(ro);
  });
  return { map: map, unplaced: unplaced, elsewhere: elsewhere, valid: valid };
}
function roInfo(ro){
  var st = roStatus(ro), q = 0, b = 0, pw = 0, pb = 0;
  (ro.operations || []).forEach(function(op){
    if(op.declined) return;
    q += +op.quoted || 0; b += +op.burnt || 0;
    (op.parts || []).forEach(function(pt){ if(pt.status === "Backordered") pb++; if(!pxPartIn(pt)) pw++; });
  });
  var opened = ro.dateOpened ? new Date(ro.dateOpened).getTime() : null;
  var days = opened ? Math.max(0, Math.floor((Date.now() - opened) / 86400000)) : null;
  var run = STATE.punches.some(function(p){ return p.roId === ro.id && !p.stop; });
  var first = (ro.operations || [])[0];
  return { st: st, q: q, b: b, eff: b > 0 ? q / b : null, pw: pw, pb: pb, days: days, run: run,
    complaint: (first && first.complaint) || ro.caseComplaint || "", stCls: statusPillClass(st.status).replace("pill-", "st-") };
}
function roLabel(ro){ return "RO " + roShortNo((ro && ro.roNumber) || "?"); }
function spotLabel(s){
  return s.zone === "lot" ? s.row + "-" + s.n : s.zone === "bay" ? "BAY " + s.n
    : s.zone === "uptime" ? "UPTIME" : s.zone === "awning" ? "AWNING " + s.n
    : s.zone === "ready" ? "WAIT " + s.n : "LANE " + s.n;
}
/* "3 of 10 taken" for a set of spots */
function spotById(id){ var all = yardSpots(), i; for(i = 0; i < all.length; i++) if(all[i].id === id) return all[i]; return null; }
/* Everything has a spot: a truck on the yard with nowhere written down is parked on the
   check-in line, then overflow, then whatever is open. Anything with a location of its
   own — a bay, a line, or free text like "Body shop" — is left where it is. */
function yardAutoPlace(){
  var ym = yardMap();
  var todo = ym.unplaced.filter(function(ro){ var s0 = spotOf(ro.location); return !(s0 && ym.valid[s0]); });   /* a spot clash is shown, not moved */
  if(!todo.length) return false;
  var taken = {}; Object.keys(ym.map).forEach(function(k){ taken[k] = 1; });
  var all = yardSpots(), open = [], seen = {};
  ["D", "E", "F", "C", "B", "A"].forEach(function(rid){
    all.forEach(function(s){ if(s.zone === "lot" && s.row === rid && !taken[s.id] && !seen[s.id]){ seen[s.id] = 1; open.push(s); } });
  });
  all.forEach(function(s){ if(s.zone === "lot" && !taken[s.id] && !seen[s.id]){ seen[s.id] = 1; open.push(s); } });
  all.forEach(function(s){ if(s.zone === "ready" && !taken[s.id] && !seen[s.id]){ seen[s.id] = 1; open.push(s); } });
  var n = 0;
  todo.forEach(function(ro){
    var sp = open[n]; if(!sp) return;
    n++; ro.location = sp.id;
  });
  if(!n) return false;
  scheduleSave(true);
  return true;
}
/* ---- free move: scroll to zoom, drag to pan, click the button again to go back ---- */
var YARD_ZMIN = 0.35, YARD_ZMAX = 3;
function yardZoomApply(){
  var st = document.querySelector('.yd-stage'); if(!st) return;
  st.style.transform = UI.yardZoom ? ('translate(' + Math.round(UI.yardX || 0) + 'px,' + Math.round(UI.yardY || 0) + 'px) scale(' + (UI.yardZ || 1) + ')') : '';
  var pc = document.getElementById('yd-zpct'); if(pc) pc.textContent = Math.round((UI.yardZ || 1) * 100) + '%';
}
function yardZoomBy(f, px, py){
  var c = document.querySelector('.yd-canvas.on'); if(!c) return;
  var r = c.getBoundingClientRect();
  if(px == null){ px = r.width / 2; py = r.height / 2; }
  var z0 = UI.yardZ || 1, z1 = Math.min(YARD_ZMAX, Math.max(YARD_ZMIN, z0 * f));
  if(z1 === z0) return;
  UI.yardX = px - (px - (UI.yardX || 0)) * (z1 / z0);
  UI.yardY = py - (py - (UI.yardY || 0)) * (z1 / z0);
  UI.yardZ = z1;
  yardZoomApply();
}
document.addEventListener('wheel', function(e){
  if(!UI.yardZoom) return;
  var c = e.target && e.target.closest ? e.target.closest('.yd-canvas.on') : null; if(!c) return;
  e.preventDefault();
  var r = c.getBoundingClientRect();
  yardZoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top);
}, { passive: false });
var YARD_PAN = null, YARD_SWALLOW = 0;
document.addEventListener('pointerdown', function(e){
  if(!UI.yardZoom || e.button) return;
  var c = e.target && e.target.closest ? e.target.closest('.yd-canvas.on') : null; if(!c) return;
  if(e.target.closest('.yd-freebar, .yd-banner, .yd-ro, input, select, textarea, label')) return;
  YARD_PAN = { x: e.clientX, y: e.clientY, ox: UI.yardX || 0, oy: UI.yardY || 0, moved: false, el: c };
  c.classList.add('panning');
});
document.addEventListener('pointermove', function(e){
  if(!YARD_PAN) return;
  var dx = e.clientX - YARD_PAN.x, dy = e.clientY - YARD_PAN.y;
  if(Math.abs(dx) > 3 || Math.abs(dy) > 3) YARD_PAN.moved = true;
  UI.yardX = YARD_PAN.ox + dx; UI.yardY = YARD_PAN.oy + dy;
  yardZoomApply();
});
document.addEventListener('pointerup', function(){
  if(!YARD_PAN) return;
  var moved = YARD_PAN.moved;
  YARD_PAN.el.classList.remove('panning'); YARD_PAN = null;
  if(moved) YARD_SWALLOW = Date.now();
  persistUI();
});
document.addEventListener('click', function(e){
  if(Date.now() - YARD_SWALLOW < 350 && e.target && e.target.closest && e.target.closest('.yd-canvas')){ e.stopPropagation(); e.preventDefault(); }
}, true);
function yardElsAdd(){
  var ri = document.getElementById("yd-els-ro"), li = document.getElementById("yd-els-loc"); if(!ri) return;
  var q = String(ri.value || "").trim().toLowerCase(), qd = q.replace(/\D/g, ""); if(!q) return;
  var ro = STATE.ros.filter(function(r){
    var n = String(r.roNumber || "").toLowerCase();
    return n === q || (qd && n.replace(/\D/g, "") === qd);
  })[0];
  if(!ro){ pushToast("No RO with that number."); return; }
  if(!onYard(ro)){ pushToast(roLabel(ro) + " is already released — it is not on the yard."); return; }
  var want = String(li && li.value || "").trim(), sp = spotOf(want);
  if(sp && spotById(sp)) yardMove(ro.id, sp);
  else { yardMove(ro.id, ""); ro.location = want || "Off yard"; scheduleSave(true); }
  ri.value = ""; if(li) li.value = ""; render();
}
document.addEventListener("keydown", function(e){
  if(e.key === "Enter" && e.target && (e.target.id === "yd-els-ro" || e.target.id === "yd-els-loc")){ e.preventDefault(); yardElsAdd(); }
});
function viewForeman(){
  yardAutoPlace();
  return fmView();
}
