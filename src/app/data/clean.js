/* Parsec · data · clean.js
   Data that travels cleanly (Parsec 16 B): one form for every field — ISO dates, YYYY-MM-DD days, dollars as numbers (cents in the export), slim Completed records; v160CleanOnce converts an older folder once (STATE.dataV).
   Flow: adoptFolderState → v160CleanOnce; v160CleanAll is the one pass that knows every field.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   cdP2 cdIso cdMs cdDay cdDayShow cdTs cdTsIso cdMoney cdMoneyShow v160CleanAll v160DoneFat v160DoneSlim … (17 functions, 2 constants)
   state      dataClean dataV ros savedAt tcDone
   uses       pages/technician/ pages/triage/ ro/ shell/ state/
*/
/* ============================== Parsec 16 (B) — data that travels cleanly · save less of the same thing ==============================
   · One form for each kind of value, so the shop file reads the same everywhere (the server export, another device, a person):
       a date with a time  → ISO 8601 UTC ("2026-10-30T04:12:00.000Z")   — was epoch ms on bulletins, history, suggestions,
                                                                            reminders; "MM-DD HH:MM:SS" (no year) on attached files
       a date only         → "YYYY-MM-DD"                                 — buildDate and warrantyStart were MM-DD-YYYY
       a time of day       → "HH:MM" (unchanged)
       money               → a number of dollars                          — part / inventory prices, list, core, ext, cost,
                                                                            otherCost, shopSupplies, claim amount / paid
     Readers take both forms (cdMs, cdDayShow, cdTs, priceOf …); writers write the new form; what's already saved converts once
     in normalizeState (STATE.dataV < 16 → 16). A value that can't be read stays exactly as it was and is listed
     (STATE.dataClean.left, the console, and an "other" line in the shop's Activity log).
   · Kept as numbers on purpose (internal stamps compared as numbers, never shown): STATE.savedAt, ro.sgSeen[key].
   · STATE.tcDone (the Technician page's Completed) keeps { k, tech, roId, opId, opn, hrs, q, at } — the RO number, customer,
     truck, unit and complaint are read from the live RO. The full snapshot is written only when the RO is deleted (or is gone
     when a copy from another device comes in), so a deleted RO still shows as before.
   · Photos: a new image wider than 1600 px or bigger than 2 MB is saved as a 1600 px wide JPEG (quality 0.85). PDFs, small images
     and files already saved are left alone; a PNG under 2 MB stays a PNG. ---------- */
var V160B = { cmp: {}, left: [] };
var V160_FAT = ["no", "cust", "truck", "unit", "cmp"];
function cdP2(n){ return String(n).padStart(2, "0"); }
/* a date with a time → ISO (UTC). Epoch ms (number or digits), any Date-readable text with a time. Unreadable → as it was. */
function cdIso(v){
  if(v == null || v === "") return v;
  if(typeof v === "number"){ if(!isFinite(v) || v < 1e11 || v > 1e14) return v; return new Date(v).toISOString(); }
  if(v instanceof Date) return isNaN(v) ? v : v.toISOString();
  var s = String(v).trim();
  if(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(s)) return v;
  if(/^\d{12,14}$/.test(s)) return cdIso(+s);
  if(!/\d{1,2}:\d{2}/.test(s)) return v;            /* no time in it: not ours to turn into a moment */
  var d = new Date(s); return isNaN(d) ? v : d.toISOString();
}
/* any moment (ISO, epoch ms, Date) → ms; NaN when it can't be read */
function cdMs(v){ if(typeof v === "number") return v; if(v instanceof Date) return +v; if(v == null || v === "") return NaN; var s = String(v).trim(); if(/^\d{12,14}$/.test(s)) return +s; return Date.parse(s); }
/* a date only → "YYYY-MM-DD". Takes YYYY-MM-DD (or the date part of an ISO moment) and MM-DD-YYYY / MM/DD/YYYY / MM.DD.YYYY with a
   4-digit year. Anything else (a half-typed date, "07-01-25") → as it was. */
function cdDay(v){
  if(v == null) return v; var s = String(v).trim(); if(!s) return v; var m, y, mo, d;
  if((m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:T[\d:.]+(?:Z|[+-]\d{2}:?\d{2})?)?$/.exec(s))){ y = +m[1]; mo = +m[2]; d = +m[3]; }
  else if((m = /^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/.exec(s))){ y = +m[3]; mo = +m[1]; d = +m[2]; }
  else return v;
  var t = new Date(y, mo - 1, d); if(t.getFullYear() !== y || t.getMonth() !== mo - 1 || t.getDate() !== d) return v;
  return y + "-" + cdP2(mo) + "-" + cdP2(d);
}
/* how a date-only shows where it was shown as typed: "MM-DD-YYYY" (an old value, or one that isn't a date, shows as it is) */
function cdDayShow(v){ var s = v == null ? "" : String(v), m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim()); return m ? m[2] + "-" + m[3] + "-" + m[1] : s; }
/* an attached file's time as it was always shown: "MM-DD HH:MM:SS", local */
function cdTs(v){ if(v == null || v === "") return ""; var s = String(v); if(!/^\d{4}-\d{2}-\d{2}T/.test(s)) return s; var d = new Date(s); if(isNaN(d)) return s;
  return cdP2(d.getMonth() + 1) + "-" + cdP2(d.getDate()) + " " + cdP2(d.getHours()) + ":" + cdP2(d.getMinutes()) + ":" + cdP2(d.getSeconds()); }
/* the old "MM-DD HH:MM:SS" (no year) → ISO: the year that puts it at or just after ref (the bulletin it's on), never in the future */
function cdTsIso(v, ref){
  var m = /^(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(v || "").trim()); if(!m) return cdIso(v);
  var now = Date.now(), r = cdMs(ref); if(!isFinite(r) || r > now) r = now;
  var mk = function(y){ return new Date(y, +m[1] - 1, +m[2], +m[3], +m[4], +(m[5] || 0)); }, y = new Date(r).getFullYear();
  var C = [mk(y), mk(y + 1)].filter(function(d){ return d.getMonth() === +m[1] - 1 && +d >= r - 864e5 && +d <= now + 864e5; });
  var d = C[0] || [mk(new Date(now).getFullYear()), mk(new Date(now).getFullYear() - 1)].filter(function(x){ return x.getMonth() === +m[1] - 1 && +x <= now + 864e5; })[0];
  return d && !isNaN(d) ? d.toISOString() : v;
}
/* money → a number of dollars. "189.5", "$1,250.00", " 3.25 " → 189.5, 1250, 3.25. Empty stays empty (no price ≠ $0). Unreadable → as it was. */
function cdMoney(v){
  if(v == null || v === "") return v;
  if(typeof v === "number") return isFinite(v) ? v : v;
  var s = String(v).replace(/[$,\s]/g, ""); if(!s) return "";
  if(!/^-?(\d+(\.\d*)?|\.\d+)$/.test(s)) return v;
  var n = +s; return isFinite(n) ? n : v;
}
/* money shown in a box as before: two decimals for a number, a text value as it is */
function cdMoneyShow(v){ return typeof v === "number" && isFinite(v) ? v.toFixed(2) : (v == null ? "" : String(v)); }

/* ---------- one pass over a state: every field we know, into the new form. left: where unreadable values are listed (null = quiet) ---------- */
function v160CleanAll(st, left, typing){
  var n = 0;
  function note(path, val, why){ if(left) left.push({ path: path, value: typeof val === "string" ? val.slice(0, 60) : val, why: why }); }
  function fix(o, k, f, path, why){
    if(!o || o[k] == null || o[k] === "") return;
    var a = o[k], b = f(a);
    if(b !== a){ o[k] = b; n++; return; }
    /* not changed: fine when it's already in the new form */
    if(f === cdMoney){ if(typeof a !== "number") note(path + "." + k, a, why); }
    else if(f === cdDay){ if(!/^\d{4}-\d{2}-\d{2}$/.test(String(a))) note(path + "." + k, a, why); }
    else if(typeof a !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(a)) note(path + "." + k, a, why);
  }
  var M = ["price", "list", "core", "ext", "cost"];
  function money(o, path){ M.forEach(function(k){ fix(o, k, cdMoney, path, "money"); }); }
  function ro1(ro, path){
    if(!ro || typeof ro !== "object") return;
    path = path + (ro.roNumber ? " (RO " + ro.roNumber + ")" : "");
    if(!typing){ fix(ro, "buildDate", cdDay, path, "date"); fix(ro, "warrantyStart", cdDay, path, "date"); }
    fix(ro, "shopSupplies", cdMoney, path, "money");
    (Array.isArray(ro.bulletins) ? ro.bulletins : []).forEach(function(e, i){ if(!e) return; var p = path + ".bulletins[" + i + "]";
      fix(e, "at", cdIso, p, "moment"); fix(e, "tickedAt", cdIso, p, "moment");
      (Array.isArray(e.files) ? e.files : []).forEach(function(f, j){ if(!f || f.ts == null || f.ts === "") return; var a = f.ts, b = cdTsIso(a, e.at);
        if(b !== a){ f.ts = b; n++; } else if(!/^\d{4}-\d{2}-\d{2}T/.test(String(a))) note(p + ".files[" + j + "].ts", a, "moment"); }); });
    (Array.isArray(ro.history) ? ro.history : []).forEach(function(h, i){ fix(h, "at", cdIso, path + ".history[" + i + "]", "moment"); });
    (Array.isArray(ro.suggest) ? ro.suggest : []).forEach(function(s, i){ fix(s, "at", cdIso, path + ".suggest[" + i + "]", "moment"); });
    (Array.isArray(ro.autoReminders) ? ro.autoReminders : []).forEach(function(s, i){ fix(s, "at", cdIso, path + ".autoReminders[" + i + "]", "moment"); });
    (Array.isArray(ro.operations) ? ro.operations : []).forEach(function(op, i){ if(!op) return; var p = path + ".op" + (i + 1);
      fix(op, "otherCost", cdMoney, p, "money");
      if(op.claim && typeof op.claim === "object"){ fix(op.claim, "amount", cdMoney, p + ".claim", "money"); fix(op.claim, "paid", cdMoney, p + ".claim", "money");
        if(op.claim.short && typeof op.claim.short === "object"){ fix(op.claim.short, "amount", cdMoney, p + ".claim.short", "money"); fix(op.claim.short, "amt", cdMoney, p + ".claim.short", "money"); } }
      (Array.isArray(op.parts) ? op.parts : []).forEach(function(pt, j){ money(pt, p + ".parts[" + j + "]"); });
    });
  }
  (Array.isArray(st.ros) ? st.ros : []).forEach(function(ro, i){ ro1(ro, "ros[" + i + "]"); });
  if(st.shopRo) ro1(st.shopRo, "shopRo");
  (Array.isArray(st.inventory) ? st.inventory : []).forEach(function(it, i){ if(!it) return; var p = "inventory[" + i + "]" + (it.pn ? " (" + it.pn + ")" : "");
    money(it, p); (Array.isArray(it.children) ? it.children : []).forEach(function(c, j){ money(c, p + ".children[" + j + "]"); }); });
  return n;
}
/* ---------- the Completed record: slim lines for ROs that are here, the full snapshot for one that's gone ---------- */
function v160DoneFat(e, ro, op){
  var no = ""; try{ no = tgNum(ro); }catch(x){ no = "RO " + (ro.roNumber || ""); }
  e.no = no; e.cust = ro.customerName || ""; e.truck = v147Truck(ro); e.unit = ro.unitNumber || "";
  e.cmp = op ? (op.complaint || "Operation") : (e.cmp || V160B.cmp[e.opId] || "Operation");
}
function v160DoneSlim(st){
  var L = Array.isArray(st.tcDone) ? st.tcDone : [], R = {}; (st.ros || []).forEach(function(r){ if(r && r.id) R[r.id] = r; });
  var n = 0;
  L.forEach(function(e){ if(!e) return; var ro = R[e.roId]; if(!ro) return;
    var op = (ro.operations || []).filter(function(o){ return o && o.id === e.opId; })[0]; if(!op) return;   /* its operation is gone: the snapshot is all there is */
    V160_FAT.forEach(function(f){ if(f in e){ delete e[f]; n++; } }); });
  return n;
}
/* a copy coming in (another device, a backup) no longer has an RO this one still has: write its snapshot from the RO here */
function v160DoneFreeze(st, old){
  if(!old || old === st || !Array.isArray(old.ros) || !Array.isArray(st.tcDone)) return 0;
  var R = {}, O = {}, n = 0; (st.ros || []).forEach(function(r){ if(r) R[r.id] = 1; }); old.ros.forEach(function(r){ if(r) O[r.id] = r; });
  st.tcDone.forEach(function(e){ if(!e || R[e.roId] || e.cust != null || e.no != null) return; var ro = O[e.roId]; if(!ro) return;
    v160DoneFat(e, ro, (ro.operations || []).filter(function(o){ return o && o.id === e.opId; })[0]); n++; });
  return n;
}
/* every save (after v147Scan): an operation taken off a live RO keeps its complaint on its Completed line */
function v160DoneKeep(){
  var L = Array.isArray(STATE.tcDone) ? STATE.tcDone : [], R = {}, O = {};
  STATE.ros.forEach(function(r){ if(!r) return; R[r.id] = 1; (r.operations || []).forEach(function(o){ if(o) O[o.id] = 1; }); });
  L.forEach(function(e){ if(e && e.cmp == null && R[e.roId] && !O[e.opId] && V160B.cmp[e.opId]) e.cmp = V160B.cmp[e.opId]; });
}
/* the record's line as the Completed section shows it: from the live RO when it's here */
function v160DoneView(e, ro, op){
  if(!ro) return e;
  var v = Object.assign({}, e); v160DoneFat(v, ro, op); return v;
}
/* ---------- normalizeState: once per data version (and the Completed snapshot for an RO a newer copy deleted) ---------- */
function v160CleanOnce(pick, old){
  if(!pick || typeof pick !== "object") return pick;
  try{ v160DoneFreeze(pick, old); }catch(e){ console.warn("Parsec 16: Completed snapshot", e); }
  if((+pick.dataV || 0) >= 16) return pick;
  var left = [], n = 0, b0 = 0, b1 = 0;
  try{ b0 = JSON.stringify(pick.tcDone || []).length; }catch(e){}
  try{ n = v160CleanAll(pick, left); }catch(e){ console.warn("Parsec 16: clean-up", e); }
  try{ v160DoneSlim(pick); }catch(e){ console.warn("Parsec 16: Completed", e); }
  try{ b1 = JSON.stringify(pick.tcDone || []).length; }catch(e){}
  pick.dataV = 16;
  pick.dataClean = { v: 16, at: nowIso(), changed: n, completed: [b0, b1], left: left.slice(0, 200) };
  V160B.left = left;
  if(left.length){
    try{ console.warn("Parsec 16: " + left.length + " value" + (left.length === 1 ? "" : "s") + " kept as they were (couldn't be read):", left); }catch(e){}
    try{ if(!Array.isArray(pick.audit)) pick.audit = [];
      pick.audit.push({ at: nowIso(), by: "Parsec", type: "other", text: "Data clean-up (Parsec 16): " + left.length + " value" + (left.length === 1 ? "" : "s") + " kept as typed — "
        + left.slice(0, 6).map(function(x){ return x.path + " = " + JSON.stringify(x.value); }).join("; ") + (left.length > 6 ? "; …" : ""), ro: null, num: "" }); }catch(e){}
  }
  return pick;
}
/* every save: anything a writer still wrote the old way goes into the new form (dates only when no box has the cursor) */
function v160CleanSave(){
  if(typeof STATE === "undefined" || !STATE || !Array.isArray(STATE.ros)) return 0;
  var typing = false; try{ typing = !!deepActiveField(); }catch(e){}
  return v160CleanAll(STATE, null, typing);
}
