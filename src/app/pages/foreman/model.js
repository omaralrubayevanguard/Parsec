/* Parsec · pages/foreman · model.js
   The Foreman's model: shop settings (bays, skills), the shop day, techs (skills, shift, time off, hours), what a job needs and which bay fits, the floor, back-again trucks, clocks, Needs action, cleared today, findings, QC.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   fmIcons fmCfg fmBayOn fmSkillsOn fmNowH fmH fmDayMs fmHM fmHh fmR1 fmOvl fmAddWork … (81 functions, 17 constants)
   state      fmCfg fmCleared punches ros
   uses       access/ data/ kit/ pages/ pages/triage/ pages/warranty/ ro/ state/
*/
/* ============================== FOREMAN — the floor, the techs and what needs you ==============================
   Needs action on the left, like Triage: stuck clocks, free techs, what techs send you, back-again
   trucks, road tests, QC before release, trucks that need a tech or a bay, and what to watch.
   The header switch shows the floor four ways — Floor (bays, when each frees up, Day view),
   Techs (an order, skills, real hours, today's numbers), Yard (the Triage yard) and Tomorrow
   (the plan and the handoff note). Findings land on the op; bay types; plan several trucks at
   once; hold for parts; a badge on the nav. Prefix fm-. */
var FM_IC = {"bay": "<path d=\"M3.75 20.25V9L12 4l8.25 5v11.25\"/><path d=\"M7.5 20.25v-7.5h9v7.5M7.5 15.75h9\"/>", "check": "<path d=\"M5 12.5l4.5 4.5L19 7.5\"/>", "chevD": "<path d=\"M6.5 9.5L12 15l5.5-5.5\"/>", "chevR": "<path d=\"M9.5 6.5L15 12l-5.5 5.5\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/>", "decide": "<path d=\"M12 3.75v4.5M12 15.75v4.5M5.5 12H3.75M20.25 12H18.5\"/><circle cx=\"12\" cy=\"12\" r=\"3.75\"/>", "flag": "<path d=\"M6 20.5V4.5M6 5h10.5l-2 3.75 2 3.75H6\"/>", "gauge": "<path d=\"M4.5 16.5a7.5 7.5 0 1 1 15 0\"/><path d=\"M12 16.5l3.5-4.5\"/>", "gear": "<path d=\"M4 8h8.5M17 8h3M4 16h3M11.5 16H20\"/><circle cx=\"14.75\" cy=\"8\" r=\"2.25\"/><circle cx=\"9.25\" cy=\"16\" r=\"2.25\"/>", "history": "<path d=\"M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.75h3.75\"/><path d=\"M12 8.5V12l2.5 1.5\"/>", "inArrow": "<path d=\"M19.5 12h-11M12.5 7.5L8 12l4.5 4.5M4.5 5v14\"/>", "note": "<path d=\"M6 3.75h12A1.25 1.25 0 0 1 19.25 5v9.5l-4.75 5.75H6A1.25 1.25 0 0 1 4.75 19V5A1.25 1.25 0 0 1 6 3.75z\"/><path d=\"M14.5 20.25v-4.5a1.25 1.25 0 0 1 1.25-1.25h3.5M8 8.5h8M8 12h5\"/>", "parts": "<path d=\"M12 3.5l7.5 4v9l-7.5 4-7.5-4v-9z\"/><path d=\"M4.5 7.5l7.5 4 7.5-4M12 11.5v9\"/>", "pencil": "<path d=\"M4.75 19.25l1-4L15.6 5.4a1.9 1.9 0 0 1 2.7 0l.3.3a1.9 1.9 0 0 1 0 2.7L8.75 18.25z\"/><path d=\"M14 7l3 3\"/>", "pin": "<path d=\"M12 20.5s-6-5.6-6-10.25a6 6 0 0 1 12 0C18 14.9 12 20.5 12 20.5z\"/><circle cx=\"12\" cy=\"10.25\" r=\"2.25\"/>", "plus": "<path d=\"M12 5v14M5 12h14\"/>", "road": "<path d=\"M8 20.5 10 3.5M16 20.5 14 3.5M12 6v2M12 11v2M12 16v2\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"M16 16l4.5 4.5\"/>", "swap": "<path d=\"M7 7.5h12.5L16 4M17 16.5H4.5L8 20\"/>", "trash": "<path d=\"M4.5 6.5h15M9.5 6.5V4.75h5V6.5M6.5 6.5l.9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3l.9-12.2M10 10.5v5.5M14 10.5v5.5\"/>", "user": "<circle cx=\"12\" cy=\"8\" r=\"3.75\"/><path d=\"M4.75 20c.6-3.6 3.6-5.75 7.25-5.75s6.65 2.15 7.25 5.75\"/>", "userPlus": "<circle cx=\"10\" cy=\"8\" r=\"3.5\"/><path d=\"M3.75 19.5c.6-3.4 3.2-5.25 6.25-5.25s5.65 1.85 6.25 5.25M18.5 7.5v5M16 10h5\"/>", "x": "<path d=\"M6 6l12 12M18 6L6 18\"/>"};
function fmIcons(){ if(fmIcons.done || typeof TG_IC === "undefined" || !TG_IC) return; for(var k in FM_IC) if(!TG_IC[k]) TG_IC[k] = FM_IC[k]; fmIcons.done = true; }
var FM_GROUPS = [["clock", "Clocks"], ["free", "Free techs"], ["sent", "Sent to you"], ["you", "Waiting on you"], ["back", "Back again"], ["road", "Road test"], ["qc", "QC before release"], ["tech", "Needs a tech"], ["in", "Bring in"], ["watch", "Watch"]];
var FM_SKILLS = ["Electrical", "Aftertreatment", "Engine", "Drivetrain", "Brakes", "Hydraulics", "HVAC", "PM", "Warranty cert."];
var FM_SKA = { "Electrical": "ELEC", "Aftertreatment": "AFT", "Engine": "ENG", "Drivetrain": "DRV", "Brakes": "BRK", "Hydraulics": "HYD", "HVAC": "HVAC", "PM": "PM", "Warranty cert.": "WAR" };
var FM_SKW = [["Aftertreatment", /\b(def|nox|dpf|scr|egr|aftertreatment|regen|doser|urea|soot|dosing)\b/i], ["Brakes", /\b(brakes?|slack|chambers?|drums?|rotors?|pads|shoes)\b/i],
  ["Drivetrain", /\b(clutch|trans|transmission|axle|driveline|u-?joint|wheel seal|differential|diff|hub|bearing|i-?shift|driveshaft)\b/i], ["Hydraulics", /\b(hydraulic|pto|liftgate|lift gate)\b/i],
  ["HVAC", /\b(a\/c|hvac|blower|heater|air condition)/i], ["PM", /\b(pm|service [ab]|inspection|dot|oil change|lube)\b/i],
  ["Electrical", /\b(electrical|alternator|battery|batteries|starter|wiring|harness|lights?|lamps?|sensor|abs|no-?start|u0\d+|module|charging|gauges?|dash)\b/i],
  ["Engine", /\b(engine|turbo|vgt|injectors?|head|gasket|coolant|water pump|oil leak|derate|overheat|low power|fan|air dryer|compressor)\b/i]];
var FM_BAYF = ["Pit", "Lift", "Crane", "Exhaust", "Align", "Long"];
var FM_NEEDTXT = { Pit: "a pit or lift", Lift: "a lift or pit", Crane: "a crane", Exhaust: "an exhaust hose", Align: "the alignment rack", Long: "a long bay" };
var FM_NEEDNO = { Pit: "pit or lift", Lift: "lift or pit", Crane: "crane", Exhaust: "exhaust hose", Align: "alignment rack", Long: "long bay" };
var FM_QCM = ["Walk-around — tools out, covers on, no leaks", "Cab clean · keys and paperwork with the truck"];
var FM_QWHY = ["Story missing", "Parts to return", "Recheck the repair", "Clean up"];
var FM_BADGE0 = ["clock", "sent", "you", "back", "road", "qc"];
var FM_TITLE0 = null;
var FM_KEYS = [["J  K   or  \u2191 \u2193", "Move through Needs action"], ["\u21b5", "Do the item\u2019s action \u2014 Accept, Decide, Assign, QC\u2026"], ["S", "Snooze the item"], ["A", "Assign a tech and a bay"],
  ["T", "Transfer to another desk, with a reason"], ["X", "Tick the item to plan several together"], ["P", "Plan together"], ["1  2  3  4", "Floor \u00b7 Techs \u00b7 Yard \u00b7 Tomorrow"], ["/", "Search \u2014 RO, unit, customer, VIN or spot"],
  ["1 \u2013 6", "In a popover: pick the option, the tech or the reason"], ["Esc", "Close the popover, or clear the filter"], ["Ctrl+Z", "Undo"], ["?", "This list"]];

/* ---------- shop settings ---------- */
function fmCfg(){
  var c = STATE.fmCfg; if(!c || typeof c !== "object") c = STATE.fmCfg = {};
  if(!(c.start >= 0)){ var sc = typeof SHOP_CAL !== "undefined" && SHOP_CAL ? SHOP_CAL : null, b = sc && sc.breaks && sc.breaks[0];
    c.start = sc ? sc.dayStart / 60 : 7; c.end = sc ? sc.dayEnd / 60 : 16; c.lunch = b ? [b[0] / 60, b[1] / 60] : [11.5, 12.5]; }
  if(!Array.isArray(c.lunch) || c.lunch.length !== 2) c.lunch = [11.5, 12.5];
  if(!c.bays || typeof c.bays !== "object") c.bays = {};
  if(!Array.isArray(c.badge)) c.badge = FM_BADGE0.slice();
  if(!c.qc) c.qc = "all";
  return c;
}
function fmBayOn(){ var b = fmCfg().bays; for(var k in b) if(b[k] && b[k].length) return true; return false; }
function fmSkillsOn(){ return fmTechs().some(function(n){ return fmSkillsOf(n).length > 0; }); }

/* ---------- time ---------- */
function fmNowH(){ var d = new Date(); return d.getHours() + d.getMinutes() / 60; }
function fmH(ms){ var d = new Date(ms); return d.getHours() + d.getMinutes() / 60; }
function fmDayMs(h, off){ var d = new Date(); d.setHours(0, 0, 0, 0); if(off) d.setDate(d.getDate() + off); return d.getTime() + h * 3600000; }
function fmHM(h){ var m = Math.round(h * 60); return String(Math.floor(m / 60) % 24).padStart(2, "0") + ":" + String(((m % 60) + 60) % 60).padStart(2, "0"); }
function fmHh(h){ return (Math.round(h * 10) / 10).toFixed(1) + " h"; }
function fmR1(x){ return Math.round(x * 10) / 10; }
function fmOvl(a, b, c, d){ return Math.max(0, Math.min(b, d) - Math.max(a, c)); }
function fmAddWork(st, h){ var L = fmCfg().lunch, e = st + h; if(st < L[0] && e > L[0]) e += L[1] - L[0]; else if(st >= L[0] && st < L[1]) e += L[1] - st; return Math.ceil(e * 12 - 1e-6) / 12; }
function fmTmrDay(){ var d = new Date(); d.setDate(d.getDate() + 1); while(d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1); return todayStr(d); }
function fmDayName(ds){ var p = String(ds).split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2]); return d.toLocaleDateString(undefined, { weekday: "short" }); }
function fmDayRel(ds){ if(!ds) return ""; if(ds === todayStr()) return "today"; var t = new Date(); t.setDate(t.getDate() + 1); if(ds === todayStr(t)) return "tomorrow"; return fmDayName(ds); }

/* ---------- techs: skills, shift, time off, hours ---------- */
function fmTechs(){ return rtTechs(); }
function fmSf(n){ return staffForTech(n); }
function fmSkillsOf(n){ var sf = fmSf(n); return sf && Array.isArray(sf.fmSkills) ? sf.fmSkills : []; }
function fmShift(n){ var sf = fmSf(n), c = fmCfg(), s = sf && sf.fmShift; return [s && s.s >= 0 ? +s.s : c.start, s && s.e > 0 ? +s.e : c.end]; }
function fmOffs(n, day){ var sf = fmSf(n); return (sf && Array.isArray(sf.fmOff) ? sf.fmOff : []).filter(function(o){ return o.d === day; }); }
function fmOffAll(n, day){ return fmOffs(n, day).some(function(o){ return o.from == null; }); }
function fmOffPart(n, day){ return fmOffs(n, day).filter(function(o){ return o.from != null; })[0] || null; }
function fmHoursLeft(n){
  var day = todayStr(); if(fmOffAll(n, day)) return 0;
  var sh = fmShift(n), st = Math.max(fmNowH(), sh[0]), e = sh[1], L = fmCfg().lunch, h = Math.max(0, e - st) - fmOvl(st, e, L[0], L[1]), o = fmOffPart(n, day);
  if(o) h -= fmOvl(st, e, o.from, o.to) - fmOvl(Math.max(st, o.from), Math.min(e, o.to), L[0], L[1]);
  return Math.max(0, h);
}
function fmDayCap(n, day){ if(fmOffAll(n, day)) return 0; var sh = fmShift(n), L = fmCfg().lunch, h = sh[1] - sh[0] - fmOvl(sh[0], sh[1], L[0], L[1]), o = fmOffPart(n, day);
  if(o) h -= fmOvl(sh[0], sh[1], o.from, o.to) - fmOvl(Math.max(sh[0], o.from), Math.min(sh[1], o.to), L[0], L[1]); return Math.max(0, h); }
function fmHe(n){ var sf = fmSf(n); return sf && sf.av && sf.av.f ? "she" : "he"; }
function fmHis(n){ var sf = fmSf(n); return sf && sf.av && sf.av.f ? "her" : "his"; }
function fmHim(n){ var sf = fmSf(n); return sf && sf.av && sf.av.f ? "her" : "him"; }

/* ---------- what a job needs ---------- */
function fmJobText(ro){ return raLive(ro).map(function(op){ return op.complaint || ""; }).join(" ") + " " + (ro.caseComplaint || ""); }
function fmNeed(ro){ if(!ro || ro.isTech) return null; if(ro.fmNeed !== undefined) return ro.fmNeed || null; var t = fmJobText(ro);
  for(var i = 0; i < FM_SKW.length; i++) if(FM_SKW[i][1].test(t)) return FM_SKW[i][0]; return null; }
function fmFits(n, ro){ var need = fmNeed(ro); if(!need || !n) return true; var S = fmSkillsOf(n); return !S.length || S.indexOf(need) > -1; }
function fmBayNeed(ro){ if(!ro || ro.isTech) return null; if(Array.isArray(ro.fmBayNeed)) return ro.fmBayNeed.length ? ro.fmBayNeed : null;
  var n = fmNeed(ro), t = fmJobText(ro);
  if(/\b(align|alignment|steer tires?)\b/i.test(t)) return ["Align"];
  if(n === "Drivetrain" || n === "Brakes") return ["Lift", "Pit"];
  if(n === "Aftertreatment") return ["Exhaust"];
  if(/\b(head gasket|turbo|cylinder head|in-?frame|engine (out|swap|rebuild))\b/i.test(t)) return ["Crane"];
  return null; }
function fmBayT(spot){ return fmCfg().bays[spot] || []; }
function fmBayTxt(spot){ return fmBayT(spot).join(" · "); }
function fmBayFits(spot, ro){ if(!fmBayOn()) return true; var n = fmBayNeed(ro); if(!n) return true; return fmBayT(spot).some(function(f){ return n.indexOf(f) > -1; }); }
function fmBayScore(spot, ro){ var n = fmBayOn() ? fmBayNeed(ro) : null; return !n ? 1 : fmBayFits(spot, ro) ? 2 : 0; }
function fmSpc(spot){ return fmBayT(spot).filter(function(f){ return FM_BAYF.indexOf(f) > -1; }).length; }

/* ---------- the floor ---------- */
function fmFloor(){ return yardSpots().filter(function(s){ return s.zone === "bay" || s.zone === "uptime" || s.zone === "awning"; }); }
function fmIsBay(spot){ return !!spot && (spot === "UpTime" || /^(Bay|Awning) \d+$/.test(spot)); }
function fmInBay(ro){ return fmIsBay(tgSpotOf(ro)); }
function fmFreeBays(forRo){ var ym = yardMap(), F = fmFloor().filter(function(s){ return !ym.map[s.id]; }).map(function(s){ return s.id; });
  if(forRo) F.sort(function(a, b){ return fmBayScore(b, forRo) - fmBayScore(a, forRo) || fmSpc(a) - fmSpc(b); }); return F; }
function fmFreeLot(){ var ym = yardMap(); return yardSpots().filter(function(s){ return s.zone === "lot" && !ym.map[s.id]; }).map(function(s){ return s.id; }); }
function fmMine(n){ return tgYard().filter(function(ro){ return techSame(ro.assignedTech, n); }); }
function fmRunP(n){ return STATE.punches.filter(function(p){ return !p.stop && techSame(punchWho(p), n); })[0] || null; }
function fmRunOf(n){ var p = fmRunP(n); return p && !isShopPunch(p) ? getRO(p.roId) : null; }
function fmRoRun(ro){ return STATE.punches.filter(function(p){ return p.roId === ro.id && !p.stop; })[0] || null; }
function fmStuckP(p){ return !!p && !p.stop && !isShopPunch(p) && (localDay(p.start) !== todayStr() || (Date.now() - new Date(p.start).getTime()) / 3600000 >= LONG_CLOCK_H); }
function fmWorkable(ro){ var s = roStatus(ro).status; return s === "Hold Tech" || s === "Working"; }
function fmOpsDone(ro){ var L = raLive(ro); return L.length > 0 && L.every(opDoneNow); }
function fmLeft(ro){ var I = roInfo(ro), l = Math.max(0, I.q - I.b); if(I.q > 0 && I.b >= I.q) l = 1; if(!I.q) l = 2; if(ro.fmHelper) l = l / 2; return l; }
function fmUpNext(n){ return fmMine(n).filter(function(ro){ return (fmWorkable(ro) || fmHoldReady(ro)) && !fmRoRun(ro) && !fmOpsDone(ro); })
  .sort(function(a, b){ return (fmHoldReady(b) ? 1 : 0) - (fmHoldReady(a) ? 1 : 0) || (a.fmQ != null ? a.fmQ : 99) - (b.fmQ != null ? b.fmQ : 99) || (fmInBay(b) ? 1 : 0) - (fmInBay(a) ? 1 : 0); }); }
function fmWorkOf(n){ var run = fmRunOf(n), p = fmRunP(n), w = run && !fmStuckP(p) ? fmLeft(run) : 0;
  fmUpNext(n).forEach(function(ro){ w += fmLeft(ro); });
  tgYard().forEach(function(ro){ if(ro.fmHelper && techSame(ro.fmHelper, n)) w += fmLeft(ro); });
  return w; }
function fmWaitOf(n){ return fmMine(n).filter(function(ro){ return /^Waiting/.test(roStatus(ro).status); }).reduce(function(a, ro){ return a + fmLeft(ro); }, 0); }
function fmRoomOf(n){ return fmR1(fmHoursLeft(n)) - fmR1(fmWorkOf(n)); }
function fmPartsEta(ro){ var e = null; raLive(ro).forEach(function(op){ opRealParts(op).forEach(function(p){ if(!fcPartIn(p) && p.eta && (!e || p.eta < e)) e = p.eta; }); });
  if(ro.fmHold && ro.fmHold.d && (!e || ro.fmHold.d < e)) e = ro.fmHold.d; return e; }
function fmPartsAllIn(ro){ var any = false, all = true; raLive(ro).forEach(function(op){ opRealParts(op).forEach(function(p){ any = true; if(!fcPartIn(p)) all = false; }); }); return { any: any, all: all }; }
function fmFreeAt(ro, depth){
  var p = fmRoRun(ro), now = fmNowH(), st = roStatus(ro).status;
  if(p && fmStuckP(p)) return { t: null, k: "stuck", txt: "fix the clock first" };
  if(p) return { t: fmAddWork(now, fmLeft(ro)), k: "on" };
  if(st === "Complete – Road test") return { t: now + 0.5, k: "done", txt: !rtNeeded(ro) ? "release next" : ro.roadTest ? "QC, then release" : "road test next" };
  if(st === "Waiting – Parts"){ var e = fmPartsEta(ro); return { t: null, k: "wait", txt: "parts" + (e ? " due " + fmDayRel(e) : "") }; }
  if(/^Waiting/.test(st)) return { t: null, k: "wait", txt: "waiting on " + st.replace(/^Waiting – /, "").toLowerCase() };
  if(st === "Declined") return { t: now + 0.25, k: "done", txt: "declined · release" };
  if(ro.assignedTech){ var o = fmRunOf(ro.assignedTech), op = fmRunP(ro.assignedTech), s0 = o && o !== ro && !fmStuckP(op) && !depth ? (fmFreeAt(o, 1).t || now) : now;
    return { t: fmAddWork(Math.max(s0, now), fmLeft(ro)), k: "next", start: s0 }; }
  return { t: null, k: "none", txt: "no tech" };
}
function fmRisk(ro){ if(!ro.promisedAt || ro.fmRiskOk === ro.promisedAt) return null; var pm = new Date(ro.promisedAt).getTime(); if(isNaN(pm)) return null;
  var st = roStatus(ro).status; if(st === "Complete – Road test" || st === "Declined") return null;
  if(localDay(ro.promisedAt) > todayStr()) return null;
  var f = fmFreeAt(ro), ph = localDay(ro.promisedAt) < todayStr() ? -1 : fmH(pm);
  if(f.t == null) return { risk: true, ready: null, ph: ph, txt: f.txt };
  return f.t > ph + 0.04 ? { risk: true, ready: f.t, ph: ph } : null; }

/* ---------- back again ---------- */
function fmUnitKey(ro){ var v = String(ro.vin || "").trim().toUpperCase(); if(v.length >= 11) return "v:" + v;
  var u = String(ro.unitNumber || "").trim().toLowerCase(), c = String(ro.customerName || "").trim().toLowerCase(); return u && c ? "u:" + c + "|" + u : null; }
var FM_STOP = { the: 1, and: 1, with: 1, from: 1, that: 1, this: 1, check: 1, replace: 1, repair: 1, inspect: 1, light: 1, truck: 1, unit: 1, customer: 1, states: 1, says: 1 };
function fmWords(ro){ var o = {}; fmJobText(ro).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).forEach(function(w){ if(w.length >= 4 && !FM_STOP[w]) o[w] = 1; }); return o; }
function fmRep(ro){
  if(ro.fmRep && ro.fmRep.ok) return null; if(!ro.dateOpened) return null;
  var opened = new Date(ro.dateOpened).getTime(); if(isNaN(opened) || Date.now() - opened > 5 * 86400000) return null;
  var key = fmUnitKey(ro); if(!key) return null; var A = fmWords(ro), na = Object.keys(A).length; if(!na) return null;
  var best = null;
  STATE.ros.forEach(function(r){ if(r === ro || r.id === SHOP_RO_ID || r.shop || fmUnitKey(r) !== key || onYard(r)) return;
    var at = new Date(r.dateClosed || (r.status && r.status.setAt) || 0).getTime(); if(!at || opened - at < 0 || opened - at > 30 * 86400000) return;
    var B = fmWords(r), nb = Object.keys(B).length, both = 0; Object.keys(A).forEach(function(w){ if(B[w]) both++; });
    var sim = nb ? both / (na + nb - both) : 0; if(sim >= 0.25 && (!best || at > best.at)) best = { r: r, at: at, sim: sim }; });
  if(!best) return null;
  var tech = best.r.assignedTech || "", fixOp = raLive(best.r).filter(function(op){ return opStory(op, "fix"); })[0];
  return { prev: best.r, days: Math.max(0, Math.round((opened - best.at) / 86400000)), tech: tech, fix: fixOp ? opStory(fixOp, "fix") : "", hrs: roInfo(best.r).b }; }

/* ---------- clocks ---------- */
function fmLunchPs(){ var L = fmCfg().lunch, out = [], days = {}; days[todayStr()] = 1; var y = new Date(); y.setDate(y.getDate() - 1); while(y.getDay() === 0 || y.getDay() === 6) y.setDate(y.getDate() - 1); days[todayStr(y)] = 1;
  STATE.punches.forEach(function(p){ if(!p.stop || isShopPunch(p) || p.fmLunchOk || !days[localDay(p.start)]) return; if(localDay(p.start) !== localDay(p.stop)) return;
    var s = fmH(new Date(p.start).getTime()), e = fmH(new Date(p.stop).getTime()); if(s < L[0] - 0.01 && e > L[1] + 0.01) out.push(p); });
  return out; }

/* ---------- what needs action ---------- */
function fmGet(id){ if(!id) return null; if(/^T:/.test(id)){ var n = id.slice(2); return fmTechs().some(function(x){ return x === n; }) ? { id: id, isTech: true, name: n, customerName: n } : null; } return tgRoById(id); }
function fmSnoozed(x){ var s = x.isTech ? (UI.fmTSnz || {})[x.name] : x.fmSnz; return !!(s && new Date(s.until).getTime() > Date.now()); }
function fmBack(x){ var s = x.isTech ? null : x.fmSnz; return !!(s && new Date(s.until).getTime() <= Date.now()); }
var FM_NC = null, FM_FC = null, FM_TC = null;
function fmNcClear(){ FM_NC = null; FM_FC = null; FM_TC = null; }
function fmNeedsAll(){ if(FM_NC && Date.now() - FM_NC.t < 2000) return FM_NC.L; var L = fmNeedsCalc(); FM_NC = { t: Date.now(), L: L }; return L; }
function fmNeedsCalc(){
  var L = [], now = Date.now(), have = {}, push = function(it){ if(have[it.ro.id]) return; have[it.ro.id] = 1; L.push(it); };
  /* clocks first: a clock still running from yesterday, a clock straight through lunch */
  STATE.punches.forEach(function(p){ if(!fmStuckP(p)) return; var ro = tgRoById(p.roId); if(!ro) return;
    push({ ro: ro, p: p, g: "clock", ic: "clock", late: true, why: tgFirst(punchWho(p) || "The tech") + "’s clock still running from " + (localDay(p.start) === todayStr() ? fmHM(fmH(new Date(p.start).getTime())) : fmDayName(localDay(p.start)) + " " + fmHM(fmH(new Date(p.start).getTime()))) + " · " + tgDur(now - new Date(p.start).getTime()), btn: "Stop it", act: "stopclk" }); });
  fmLunchPs().forEach(function(p){ var ro = tgRoById(p.roId); if(!ro) return; var L0 = fmCfg().lunch;
    push({ ro: ro, p: p, g: "clock", ic: "clock", why: tgFirst(punchWho(p) || "The tech") + "’s clock ran through lunch " + fmDayRel(localDay(p.start)) + " · " + fmHM(fmH(new Date(p.start).getTime())) + "–" + fmHM(fmH(new Date(p.stop).getTime())), btn: "Fix", act: "fixclk" }); });
  tgYard().forEach(function(ro){
    if(have[ro.id]) return;
    var c = tyCat(ro), r = ro.route, st = roStatus(ro).status, hd = tgHold(ro), it = null, run = fmRoRun(ro), rp;
    if(ro.fmSnz && fmBack(ro)) { /* comes back where it belongs, marked Back */ }
    if(r && r.to === "foreman" && (r.state === "pending" || r.state === "returned"))
      it = { g: "sent", ic: "swap", why: (r.state === "pending" ? "From " + (r.by || "someone") + " " + rtAge(r.at) : "Returned by " + (r.by || "someone")) + (r.reason ? " · " + r.reason : "") + (r.note ? " · " + r.note : ""), btn: r.state === "pending" ? "Accept" : "Got it", act: "accept" };
    else if(st === "Waiting – Foreman" || (r && r.to === "foreman" && r.state === "accepted")){
      var fo = fmFound(ro); it = { g: "you", ic: "decide", why: (ro.fmCb ? "Comeback · " : "") + (fo.length ? tgFirst(ro.assignedTech || "The tech") + " found " + (fo.length > 1 ? fo.length + " ops" : "op " + raN(ro, fo[0])) + " · to decide" : (r && r.note ? r.note : "Waiting on you") + " · " + tgDur(hd.held)), btn: "Decide", act: "decide" }; }
    else if((rp = fmRep(ro)) && c !== "arr") it = { g: "back", ic: "history", late: true, why: "Back " + rp.days + " day" + (rp.days === 1 ? "" : "s") + " after " + roLabel(rp.prev) + " · same complaint" + (rp.tech ? " · " + tgFirst(rp.tech) + " fixed it" : ""), btn: "Review", act: "repeat" };
    else if(ro.roadTest && ro.roadTest.result === "Fail" && ro.fmRtOk !== (ro.roadTest.at || "1")) it = { g: "road", ic: "road", late: true, why: "Road test failed" + (ro.roadTest.miles ? " · " + ro.roadTest.miles + " mi" : "") + (ro.roadTest.checked ? " · " + ro.roadTest.checked : ""), btn: "Decide", act: "rtfail" };
    else if(st === "Complete – Road test" && !ro.roadTest && rtNeeded(ro)) it = { g: "road", ic: "road", why: "All ops done · " + tgSpotLbl(tgSpotOf(ro)) + (ro.fmRt ? " · " + tgFirst(ro.fmRt.who) + " drives " + ro.fmRt.when : " · no road test yet"), btn: "Road test", act: "road" };
    else if(st === "Complete – Road test" && ro.roadTest && ro.roadTest.result !== "Fail" && !(ro.fmQc && ro.fmQc.s === "pass") && fmQcApplies(ro) && !TRX_QC_TRIAGE){
      var bad = fmQcAuto(ro).filter(function(x){ return !x.ok; }).length;
      it = { g: "qc", ic: "check", why: "Road test passed" + (ro.roadTest.at ? " " + fmHM(fmH(new Date(ro.roadTest.at).getTime())) : "") + (ro.assignedTech ? " · " + tgFirst(ro.assignedTech) : "") + " · " + (bad ? bad + " thing" + (bad > 1 ? "s" : "") + " to check" : "all checks pass"), btn: "QC", act: "qc" }; }
    else if(c === "arr" && !ro.assignedTech){ var e = tgEta(ro).eta, d = e ? e - now : null; if(d != null && d > 4 * 3600000) return;
      it = { g: "tech", ic: "inArrow", pr: 1, why: d == null ? "Waiting arrival · " + tgSpotLbl(tgSpotOf(ro)) + " · needs a tech and a bay" : d > 0 ? "Arriving ~" + tgWhen(e) + " · in " + tgDur(d) + " · needs a tech and a bay" : "Due " + tgWhen(e) + " · " + tgDur(-d) + " late", btn: "Plan", act: "assign" }; }
    else if(c === "chk" && !ro.assignedTech) it = { g: "tech", ic: "userPlus", pr: 0, why: "Checked in " + tgDur(ageSince(ro.dateOpened)) + " ago · " + tgSpotLbl(tgSpotOf(ro)) + " · no tech yet", btn: "Assign", act: "assign" };
    else if(fmInBay(ro) && ro.assignedTech && fmWorkable(ro) && !run && !fmOpsDone(ro) && (roIdleMs(ro) || 0) >= 15 * 60000)
      it = { g: "tech", ic: "clock", pr: 0, why: tgSpotLbl(tgSpotOf(ro)) + " · nobody on for " + tgDur(roIdleMs(ro)) + " · " + tgFirst(ro.assignedTech) + "’s", btn: "Nudge", act: "nudge" };
    else if(fmBringable(ro))
      it = { g: "in", ic: "bay", why: (ro.fmHold ? "Parts in · " + (ro.fmHold.op || "back") : fmPartsAllIn(ro).any ? "Approved · parts in hand" : "Approved · ready for a bay") + " · " + tgFirst(ro.assignedTech) + " next", btn: "Bring in", act: "bring" };
    if(!it){ var desk = hd.to !== "writer" && hd.to !== "foreman" && (hd.to !== "tech" || (r && r.state === "pending")), fk = fmRisk(ro), I = roInfo(ro);
      if(fk) it = { g: "watch", ic: "flag", risk: true, late: true, why: fk.ready != null ? "Promised " + fmHM(fk.ph) + " · ready ~" + fmHM(fk.ready) + " · " + tgDur((fk.ready - fk.ph) * 3600000) + " late" : fk.ph < 0 ? "Promised " + fmDayName(localDay(ro.promisedAt)) + " · still open" : "Promised " + fmHM(fk.ph) + " today · " + fk.txt, btn: "Review", act: "risk" };
      else if(st === "Waiting – Parts" && fmInBay(ro) && !ro.fmBayOk && fmPartsEta(ro) !== todayStr()){ var want = tgYard().filter(function(x){ return x !== ro && !fmInBay(x) && (tyCat(x) === "chk" || tyCat(x) === "arr" || x.assignedTech) && fmBayNeed(x) && fmBayFits(tgSpotOf(ro), x) && fmBayOn(); });
        it = { g: "watch", ic: "parts", late: want.length > 0, why: "In " + tgSpotLbl(tgSpotOf(ro)) + " · parts " + (fmPartsEta(ro) ? "due " + fmDayRel(fmPartsEta(ro)) : (roStatus(ro).sub || "on order").toLowerCase()) + " · " + (want.length ? want.slice(0, 2).map(tgNum).join(" and ") + " need" + (want.length > 1 ? "" : "s") + " " + FM_NEEDTXT[fmBayNeed(want[0])[0]] : "bay blocked"), btn: "Free bay", act: "hold" }; }
      else if(desk && hd.held >= 2 * hd.goal) it = { g: "watch", ic: "swap", why: "With " + RT_LBL[hd.to].toLowerCase() + " " + tgDur(hd.held) + " · " + (hd.held / hd.goal).toFixed(1) + "× the " + tgDur(hd.goal) + " goal", btn: "Nudge", act: "nudge" };
      else if(I.q > 0 && I.b > I.q * 1.25 && fmWorkable(ro)) it = { g: "watch", ic: "gauge", why: fmHh(I.b) + " on " + fmHh(I.q) + " quoted" + (ro.assignedTech ? " · " + tgFirst(ro.assignedTech) : ""), btn: "Review", act: "review" };
    }
    if(!it) return;
    it.ro = ro; it.late = it.late || tgLate(ro);
    if(ro.fmSnz && fmBack(ro)){ it.back = true; it.why = (ro.fmSnz.why ? ro.fmSnz.why + " · " : "") + "snoozed " + fmtTime(ro.fmSnz.at); }
    push(it);
  });
  fmFreeTechs().forEach(function(f){ var T = fmGet("T:" + f.n); if(!T) return;
    push({ ro: T, g: "free", ic: "user", late: Date.now() - f.since > 30 * 60000, why: (f.none ? "No job clocked yet today" : "Free " + tgDur(Date.now() - f.since)) + (f.lastRo ? " · last job " + tgNum(f.lastRo) + " done " + fmHM(fmH(f.since)) : "") + " · " + f.wait + " waiting on others", btn: "Give work", act: "give" }); });
  tgClashes().forEach(function(cl){ var pick = cl.ros.slice().reverse().filter(function(r){ return tyCat(r) !== "arr"; })[0] || cl.ros[cl.ros.length - 1], other = cl.ros.filter(function(r){ return r !== pick; })[0];
    L = L.filter(function(x){ return x.ro !== pick; }); L.push({ ro: pick, g: "watch", ic: "pin", why: "Shares " + tgSpotLbl(cl.spot) + " with " + tgNum(other) + " — which one is there?", btn: "Fix spot", act: "clash", spot: cl.spot, late: false }); });
  return L;
}
function fmFreeTechs(){ if(FM_FC && Date.now() - FM_FC.t < 2000) return FM_FC.L; var L = fmFreeCalc(); FM_FC = { t: Date.now(), L: L }; return L; }
function fmFreeCalc(){
  var today = todayStr(), now = Date.now(), nh = fmNowH();
  return fmTechs().map(function(n){
    if(fmRunP(n) || fmOffAll(n, today)) return null; var sh = fmShift(n); if(nh >= sh[1] || nh < sh[0]) return null;
    var mine = fmMine(n);
    if(mine.some(function(ro){ return fmWorkable(ro) && fmInBay(ro) && !fmOpsDone(ro); })) return null;
    if(tgYard().some(function(ro){ return ro.fmHelper && techSame(ro.fmHelper, n); })) return null;
    var last = null; STATE.punches.forEach(function(p){ if(p.stop && techSame(punchWho(p), n) && localDay(p.stop) === today && (!last || new Date(p.stop) > new Date(last.stop))) last = p; });
    var since = last ? new Date(last.stop).getTime() : fmDayMs(sh[0]); if(now - since < (last ? 15 : 30) * 60000) return null;
    return { n: n, last: last, none: !last, lastRo: last && !isShopPunch(last) ? getRO(last.roId) : null, since: since, wait: mine.filter(function(ro){ return /^Waiting/.test(roStatus(ro).status); }).length };
  }).filter(Boolean);
}
function fmMatch(x){ var f = UI.fmFilter; if(!f) return true; if(f === "you") return x.g === "sent" || x.g === "you"; if(f === "tech") return x.g === "tech"; if(f === "late") return !!x.late; if(f === "risk") return !!x.risk; return true; }
function fmNeeds(){ return fmNeedsAll().filter(function(x){ return !fmSnoozed(x.ro) && fmMatch(x); }); }
function fmGrouped(){ var G = {}; FM_GROUPS.forEach(function(g){ G[g[0]] = []; }); fmNeeds().forEach(function(x){ (G[x.g] || G.watch).push(x); });
  FM_GROUPS.forEach(function(g){ G[g[0]].sort(function(a, b){ return (b.back ? 1 : 0) - (a.back ? 1 : 0) || (b.late ? 1 : 0) - (a.late ? 1 : 0) || (a.pr || 0) - (b.pr || 0); }); }); return G; }
function fmFlat(){ var G = fmGrouped(); return FM_GROUPS.reduce(function(a, g){ return a.concat(G[g[0]].map(function(x){ return x.ro.id; })); }, []); }
function fmItemOf(id){ return fmNeeds().filter(function(x){ return x.ro.id === id; })[0] || null; }
function fmSel(){ var x = fmGet(UI.fmSel); if(x && (x.isTech || onYard(x))) return x; var f = fmFlat(); UI.fmSel = f[0] || (tgYard()[0] || {}).id || null; return fmGet(UI.fmSel); }

/* ---------- cleared today ---------- */
function fmClearedList(){ if(!Array.isArray(STATE.fmCleared)) STATE.fmCleared = []; var t = todayStr(); return STATE.fmCleared.filter(function(c){ return localDay(c.at) === t; }); }
function fmClear(ro, ic, what){ if(!Array.isArray(STATE.fmCleared)) STATE.fmCleared = [];
  STATE.fmCleared.push({ at: nowIso(), ic: ic, what: what, roId: ro.id, num: ro.isTech ? "" : tgNum(ro), cust: ro.isTech ? ro.name : (ro.customerName || "") });
  if(STATE.fmCleared.length > 300) STATE.fmCleared = STATE.fmCleared.slice(-300); }

/* ---------- findings: ops a tech added that nobody has decided yet ---------- */
function fmFound(ro){ var L = raLive(ro); if(L.length < 2) return [];
  return L.slice(1).filter(function(op){ return !op.appr && !op.fmDec && ["WARR", "RECALL"].indexOf(opJobType(op)) < 0 && !opDoneNow(op); }); }
function fmOpSt(ro, op){ if(op.fmRec) return ["rec", "recommended"]; if(op.declined) return ["rec", "declined"]; if(opDoneNow(op)) return ["done", "done"];
  var run = STATE.punches.filter(function(p){ return p.opId === op.id && !p.stop; })[0]; if(run) return ["on", tgFirst(punchWho(run)) + " on it"];
  if(op.fmDec && op.fmDec.s === "quote" && !op.appr) return ["appr", "with Approval"]; if(op.fmDec && op.fmDec.s === "case") return ["case", "tech support"];
  var pa = opRealParts(op).filter(function(p){ return !fcPartIn(p); }); if(pa.length) return ["parts", "parts" + (pa[0].eta ? " · " + fmDayRel(pa[0].eta) : " · " + String(pa[0].status || "not ordered").toLowerCase())];
  if(!op.appr && ["WARR", "RECALL"].indexOf(opJobType(op)) < 0 && +op.quoted > 0) return ["appr", "not approved"];
  return ["todo", op.burnt > 0 ? "in progress" : "to do"]; }

/* ---------- QC ---------- */
function fmQcApplies(ro){ var q = fmCfg().qc; if(q === "none") return false; if(q === "some") return !!(ro.fmCb || warrIs(ro) || raLive(ro).some(function(op){ return opJobType(op) === "COMEBACK"; })); return true; }
function fmQcAuto(ro){
  var live = raLive(ro), open = live.filter(function(op){ return !opDoneNow(op); }), ns = live.filter(function(op){ return !fcHasCause(op) || !fcHasFix(op); }), I = roInfo(ro), toRet = 0, used = 0, all = 0, rt = ro.roadTest;
  live.forEach(function(op){ opRealParts(op).forEach(function(p){ all++; if(p.status === "Installed") used++; else if(pxPartIn(p)) toRet++; }); });
  return [{ k: "ops", ok: live.length > 0 && !open.length, t: open.length ? "Op " + raN(ro, open[0]) + " still open · " + (live.length - open.length) + " of " + live.length + " closed" : "All ops closed · " + live.length + " of " + live.length },
    { k: "story", ok: !ns.length, t: ns.length ? "No " + (!fcHasCause(ns[0]) ? "cause" : "correction") + " on op " + raN(ro, ns[0]) + (ns[0].complaint ? " · " + ns[0].complaint : "") : "Story on every op — complaint, cause, correction" },
    { k: "hrs", ok: !I.q || I.b <= I.q * 1.1, t: fmHh(I.b) + " of " + fmHh(I.q) + " quoted" + (I.q && I.b > I.q * 1.1 ? " · over" : "") },
    { k: "rt", ok: !!rt && rt.result !== "Fail", t: rt ? "Road test " + String(rt.result || "logged").toLowerCase() + (rt.miles ? " · " + rt.miles + " mi" : "") + (rt.at ? " · " + fmHM(fmH(new Date(rt.at).getTime())) : "") : "No road test logged" },
    { k: "parts", ok: !toRet && used + toRet === all, t: all ? "Parts · " + used + " of " + all + " installed" + (toRet ? " · " + toRet + " to return to Parts" : " · nothing to return") : "No parts on the RO" }]; }
