/* Parsec · ro · details-table.js
   The RO's details as one table (ROFLD): every field with its label, how it shows, how it is set, who may edit; roFldSet is the one setter (Undo, the value, an Activity line, save). The truck card, the RO list pane and the import all draw from it.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   roFldTrim roFldDT roFldPD roFldP2 roFldDay roFldDay2 roFldN roFld roFldGet roFldShow roFldCanEdit roFldSet … (15 functions, 1 constant)
   uses       access/ data/ import/ pages/ pages/triage/ state/
   at load    on document click
*/
/* ---------- 8: the RO's details, one table ---------- */
function roFldTrim(v){ return String(v == null ? "" : v).trim(); }
function roFldDT(k){ return { dt: 1, get: function(ro){ if(!ro[k]) return ""; var d = new Date(ro[k]); if(isNaN(d)) return ""; d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); },
  set: function(ro, v){ v = roFldTrim(v); if(!v){ delete ro[k]; return; } var d = new Date(v); if(!isNaN(d)) ro[k] = d.toISOString(); },
  show: function(ro){ return ro[k] ? fcWhen(new Date(ro[k])) : ""; } }; }
/* Parsec 14.7: a day kept as typed (MM-DD-YYYY, like the import and the warranty pages read it) — a date box to edit it */
function roFldPD(x){ if(!x) return null; var s = String(x).trim(), m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s); if(m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = /^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})$/.exec(s); if(m){ var y = +m[3]; if(y < 100) y += 2000; return new Date(y, +m[1] - 1, +m[2]); } var d = new Date(s); return isNaN(d) ? null : d; }
function roFldP2(n){ return String(n).padStart(2, "0"); }
function roFldDay(k){ return { type: "date", empty: "Add date",
  get: function(ro){ var d = roFldPD(ro[k]); return d ? d.getFullYear() + "-" + roFldP2(d.getMonth() + 1) + "-" + roFldP2(d.getDate()) : ""; },
  set: function(ro, v){ v = roFldTrim(v); if(!v){ ro[k] = ""; return; } var d = roFldPD(v); ro[k] = d ? d.getFullYear() + "-" + roFldP2(d.getMonth() + 1) + "-" + roFldP2(d.getDate()) : v; },   /* Parsec 16: YYYY-MM-DD */
  show: function(ro){ var d = roFldPD(ro[k]); return d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : (ro[k] ? String(ro[k]) : ""); } }; }
function roFldDay2(iso){ var d = iso ? new Date(iso) : null; return d && !isNaN(d) ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""; }
function roFldN(v, unit){ var n = Number(String(v).replace(/[^\d.]/g, "")); return isFinite(n) && String(v).trim() ? n.toLocaleString("en-US") + unit : ""; }
var ROFLD = [
  ["vehicle", "Vehicle", [
    ["year", "Model year", { num: 1, empty: "Add year", get: function(ro){ return ro.year ? String(ro.year) : ""; }, set: function(ro, v){ var y = +String(v || "").replace(/\D/g, ""); if(y >= 1980 && y <= new Date().getFullYear() + 2) ro.year = y; else delete ro.year; delete ro.trkBody; delete ro.trkTrim; } }],
    ["make", "Make", { empty: "Add make", set: function(ro, v){ v = roFldTrim(v); if(v) ro.make = v; else delete ro.make; delete ro.trkBody; } }],
    ["model", "Model", { empty: "Add model", set: function(ro, v){ ro.model = roFldTrim(v); delete ro.trkBody; delete ro.trkTrim; } }],
    ["buildDate", "Build date", roFldDay("buildDate")],
    ["warrantyStart", "Warranty start", roFldDay("warrantyStart")],
    ["vin", "VIN", { id: 1, copy: 1, empty: "Add VIN", set: function(ro, v){ ro.vin = roFldTrim(v).toUpperCase().replace(/[^A-Z0-9]/g, ""); }, warn: function(v){ v = roFldTrim(v); return v && v.length !== 17 ? "A VIN has 17 characters" : ""; } }],
    ["unitNumber", "Unit", { empty: "Add unit" }],
    ["mileage", "Mileage", { num: 1, empty: "Add mileage", show: function(ro){ return roFldN(ro.mileage, " mi"); }, set: function(ro, v){ ro.mileage = roFldTrim(v).replace(/[^\d.]/g, ""); } }],
    ["engineHours", "Engine hours", { num: 1, empty: "Add hours", show: function(ro){ return roFldN(ro.engineHours, " h"); }, set: function(ro, v){ ro.engineHours = roFldTrim(v).replace(/[^\d.]/g, ""); } }],
    ["engineType", "Engine", { empty: "Add engine" }],
    ["engineSerial", "Engine serial", { id: 1, empty: "Add serial", set: function(ro, v){ ro.engineSerial = roFldTrim(v).toUpperCase(); } }],
    ["chassis", "Chassis", { id: 1, empty: "Add chassis" }],
    ["keyTag", "Key tag", { id: 1, empty: "Add tag" }],
    ["location", "Spot", { empty: "Add spot" }],
    ["department", "Department", { empty: "Add department" }],
    ["dateOpened", "Opened", Object.assign(roFldDT("dateOpened"), { empty: "Add date", show: function(ro){ return roFldDay2(ro.dateOpened); } })],
    ["dateClosed", "Closed", Object.assign(roFldDT("dateClosed"), { lock: function(ro){ return !ro.dateClosed; }, show: function(ro){ return ro.dateClosed ? roFldDay2(ro.dateClosed) : "Open"; },
      set: function(ro, v){ v = roFldTrim(v); if(!v || !ro.dateClosed) return; var d = new Date(v); if(!isNaN(d)){ ro.dateClosed = d.toISOString(); ro.dateClosedAuto = false; } } })]]],   /* Parsec 14.7: opened and closed with the truck; Closed changes only on a closed RO */
  ["customer", "Customer", [
    ["customerName", "Customer", { empty: "Add customer" }],
    ["custNo", "Cust #", { id: 1, empty: "Add" }],
    ["poNumber", "PO #", { id: 1, empty: "Add PO" }],
    ["contactName", "Contact", { empty: "Add who to call" }],
    ["contactPhone", "Phone", { empty: "Add a number", type: "tel", set: function(ro, v){ v = roFldTrim(v); var p = typeof v163Phone === "function" ? v163Phone(v) : ""; if(p || v) ro.contactPhone = p || v; else delete ro.contactPhone; } }],
    ["contactEmail", "Email", { empty: "Add an email", type: "email", set: function(ro, v){ v = roFldTrim(v); var e = typeof v163Email === "function" ? v163Email(v) : ""; if(e || v) ro.contactEmail = e || v; else delete ro.contactEmail; }, warn: function(v){ v = roFldTrim(v); return v && !/@/.test(v) ? "An email has an @" : ""; } }],
    ["driverName", "Driver", { empty: "Add the driver" }],
    ["driverPhone", "Driver’s phone", { empty: "Add a number", type: "tel", set: function(ro, v){ v = roFldTrim(v); var p = typeof v163Phone === "function" ? v163Phone(v) : ""; if(p || v) ro.driverPhone = p || v; else delete ro.driverPhone; } }]]],   /* Parsec 16.3 */
  ["people", "People", [
    ["assignedTech", "Technician", { empty: "Not assigned", list: "tech", av: 1 }],
    ["advisor", "Advisor", { empty: "Not set", list: "staff", av: 1, get: function(ro){ return ro.advisor || (function(){ try{ return rtPerson("writer"); }catch(e){ return ""; } })(); } }],
    ["foreman", "Foreman", { empty: "Not set", list: "staff", av: 1, get: function(ro){ return ro.foreman || (function(){ try{ return rtPerson("foreman"); }catch(e){ return ""; } })(); } }]]],
  ["schedule", "Schedule", [
    ["promisedAt", "Promised", roFldDT("promisedAt")],
    ["followUpAt", "Follow-up", roFldDT("followUpAt")]]],
  ["paperwork", "Case", [
    ["caseNumber", "Case #", { id: 1, copy: 1, empty: "Add case" }],
    ["authNumber", "Auth #", { id: 1, empty: "Add auth" }],
    ["techSupportCase", "Tech support", { id: 1, empty: "Add case" }]]]
];
function roFld(k){ for(var g = 0; g < ROFLD.length; g++){ var F = ROFLD[g][2]; for(var i = 0; i < F.length; i++) if(F[i][0] === k) return { k: k, l: F[i][1], o: F[i][2] || {}, g: ROFLD[g][0] }; } return null; }
function roFldGet(ro, f){ return f.o.get ? f.o.get(ro) : (ro[f.k] == null ? "" : String(ro[f.k])); }
function roFldShow(ro, f){ if(f.o.show) return f.o.show(ro); return roFldGet(ro, f); }
function roFldCanEdit(ro){ try{ if(typeof canPage === "function" && !canPage("ros")) return false; }catch(e){} return !!ro && !ro.shop && ro.id !== SHOP_RO_ID; }
/* the one setter: Undo, the value, the Activity line, save — everything edits through here */
function roFldSet(ro, k, v){
  var f = roFld(k); if(!f || !ro) return false;
  var was = roFldShow(ro, f);
  pushUndo(f.l.toLowerCase());
  if(f.o.set) f.o.set(ro, v); else { v = roFldTrim(v); if(v) ro[k] = v; else delete ro[k]; }
  var now = roFldShow(ro, f);
  try{ audit("ro", roLabel(ro) + ": " + f.l + " " + (was ? "“" + was + "” → " : "set to ") + (now ? "“" + now + "”" : "cleared"), ro); }catch(e){}
  if(k === "assignedTech" && ro.assignedTech){ try{ if(typeof rtSend === "function" && !(ro.route && ro.route.state === "pending")) rtSend(ro, "tech", ro.assignedTech, "Assigned", 4); }catch(e){} }
  scheduleSave(true);
  return true;
}
/* for the RO page's pxProp: { get, set, type } through the same table */
function roFldEdit(ro, k){ var f = roFld(k); if(!f) return null; return { type: f.o.dt ? "datetime-local" : f.o.type || "text", get: function(){ return roFldGet(ro, f); }, set: function(v){ if(f.o.set) f.o.set(ro, v); else { v = roFldTrim(v); if(v) ro[k] = v; else delete ro[k]; } try{ audit("ro", roLabel(ro) + ": " + f.l + " → " + (roFldShow(ro, f) || "cleared"), ro); }catch(e){} } }; }
/* the groups as HTML for the RO list pane and the Technician pane (light DOM; the click handler below edits) */
function roDetailsHtml(ro, o){
  o = o || {}; var fold = { get: function(k){ return rpFold(k); } }, ed = o.readOnly ? false : roFldCanEdit(ro);
  var av = function(n){ var i = ""; try{ i = ivInit(n); }catch(e){ i = String(n || "").split(/\s+/).map(function(w){ return w[0] || ""; }).join("").slice(0, 2).toUpperCase(); } return '<span class="rod-av">' + v141E(i) + "</span>" + v141E(n); };
  return '<section class="rod' + (ed ? " ed" : "") + '" data-rod-ro="' + v141E(ro.id) + '">' + ROFLD.filter(function(G){ return !o.groups || o.groups.indexOf(G[0]) > -1; }).map(function(G){
    var shut = fold.get(G[0]), F = G[2].filter(function(fd){ return !(fd[2] && fd[2].hideEmpty && !roFldGet(ro, { k: fd[0], o: fd[2] })); });
    var sum = G[0] === "vehicle" ? [ro.year, ro.model].filter(Boolean).join(" ") : G[0] === "customer" ? ro.customerName || "" : G[0] === "people" ? (ro.assignedTech ? (function(){ try{ return ivInit(ro.assignedTech); }catch(e){ return ""; } })() : "") : G[0] === "schedule" ? (ro.promisedAt ? fcWhen(new Date(ro.promisedAt)) : "") : ro.caseNumber || "";
    return '<div class="rod-g' + (shut ? " shut" : "") + '"><button type="button" class="rod-gh" data-rod-g="' + G[0] + '" aria-expanded="' + (!shut) + '"><i></i><b>' + v141E(G[1]) + '</b><small>' + v141E(sum) + '</small></button>'
      + (shut ? "" : '<div class="rod-rows">' + F.map(function(fd){ var f = { k: fd[0], l: fd[1], o: fd[2] || {} }, v = roFldShow(ro, f), raw = roFldGet(ro, f);
        var edR = ed && !(f.o.lock && f.o.lock(ro));   /* Parsec 14.7 */
        return '<div class="rod-r' + (edR ? " ed" : "") + (v ? "" : " rod-empty") + (f.o.num ? " num" : "") + (f.o.id ? " id" : "") + '" data-rod-k="' + f.k + '" title="' + (edR ? "Click to change" : "") + '"><span>' + v141E(f.l) + '</span><b>' + (v ? (f.o.av ? av(v) : v141E(v)) : v141E(edR ? f.o.empty || "Add" : "—")) + "</b>"
          + (f.o.copy && raw ? '<button type="button" class="rod-cp" data-rod-copy="' + v141E(raw) + '" title="Copy">' + (typeof tgI === "function" ? tgI("copy", 12) : "⧉") + "</button>" : "") + "</div>"; }).join("") + "</div>") + "</div>"; }).join("") + "</section>";
}
function roDetailsEdit(row){
  var sec = row.closest(".rod"), ro = sec && getRO(sec.getAttribute("data-rod-ro")), f = ro && roFld(row.getAttribute("data-rod-k")); if(!ro || !f || row.querySelector("input")) return;
  var b = row.querySelector("b"), cur = roFldGet(ro, f), inp = document.createElement("input");
  inp.className = "rod-in"; inp.type = f.o.dt ? "datetime-local" : f.o.type || "text"; inp.value = cur || ""; inp.setAttribute("data-no-draft", ""); inp.autocomplete = "off";
  if(f.o.list){ var dl = document.createElement("datalist"), id = "rod-dl-" + f.k; dl.id = id; var names = []; try{ names = staffList().filter(function(s){ return f.o.list !== "tech" || s.role === "Technician"; }).map(function(s){ return s.name; }); }catch(e){}
    dl.innerHTML = names.map(function(n){ return '<option value="' + v141E(n) + '">'; }).join(""); inp.setAttribute("list", id); row.appendChild(dl); }
  var was = b.innerHTML;
  b.innerHTML = ""; b.appendChild(inp); row.classList.add("editing"); inp.focus(); if(inp.select) try{ inp.select(); }catch(e){}
  var done = false;
  function commit(keep){ if(done) return; done = true; var v = inp.value.trim();
    if(keep && v !== String(cur || "")){ var w = f.o.warn ? f.o.warn(v) : ""; roFldSet(ro, f.k, v); if(w) pushToast(w + " — saved anyway.", false); }
    row.classList.remove("editing"); b.innerHTML = was;   /* the box closes first, so a panel kept between redraws (beside the RO page) draws the change */
    v141Render(); }
  inp.addEventListener("keydown", function(ev){ ev.stopPropagation(); if(ev.key === "Enter"){ ev.preventDefault(); commit(true); } else if(ev.key === "Escape"){ ev.preventDefault(); commit(false); } else if(ev.key === "Tab"){ ev.preventDefault(); var rows = Array.prototype.slice.call(sec.querySelectorAll(".rod-r.ed")), i = rows.indexOf(row), nx = rows[i + (ev.shiftKey ? -1 : 1)]; commit(true); if(nx) setTimeout(function(){ var s2 = document.querySelector('.rod[data-rod-ro="' + ro.id + '"] .rod-r[data-rod-k="' + nx.getAttribute("data-rod-k") + '"]'); if(s2) roDetailsEdit(s2); }, 60); } });
  inp.addEventListener("blur", function(){ setTimeout(function(){ commit(true); }, 0); });
}
document.addEventListener("click", function(e){
  var t = e.target && e.target.nodeType === 1 ? e.target : e.target && e.target.parentElement; if(!t || !t.closest) return;
  var cp = t.closest(".rod-cp"); if(cp){ e.preventDefault(); e.stopPropagation(); try{ navigator.clipboard.writeText(cp.getAttribute("data-rod-copy")); pushToast("Copied.", false); }catch(err){} return; }
  var gh = t.closest(".rod-gh"); if(gh){ e.preventDefault(); e.stopPropagation(); var gk = gh.getAttribute("data-rod-g"); rpFoldSet(gk, !rpFold(gk)); v141Render(); return; }   /* 17.1: stays folded for you, on every page */
  var r = t.closest(".rod-r.ed"); if(r && !t.closest("input")){ e.preventDefault(); e.stopPropagation(); roDetailsEdit(r); }
}, true);
