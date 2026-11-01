/* ===== ChatGPT's changes — review mock-up · core ===== */
var D = document;
function $(s, r){ return (r || D).querySelector(s); }
function $$(s, r){ return [].slice.call((r || D).querySelectorAll(s)); }
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function ic(k, cls){ return '<svg class="ic ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (VV[k] || "") + "</svg>"; }
function icOld(k){ return '<svg class="ic old" viewBox="0 0 24 24" aria-hidden="true">' + (IVI[k] || "") + "</svg>"; }
function pic(id, k){ var m = IMG[id]; return m ? '<img src="' + m[k || "s"] + '" alt="" draggable="false">' : ""; }
function src(id, k){ var m = IMG[id]; return m ? m[k || "s"] : ""; }
var P = {}; PROF.forEach(function(p){ P[p.id] = p; });
function yrs(p){ return p.from === p.to ? String(p.from) : p.from + "–" + p.to; }

/* sample repair orders, same as ChatGPT's studies */
var ROS = [
  { no: "10482", cust: "Northline Logistics", year: 2025, model: "VNL 860", p: "vnl-25-860", tech: "Mike Rodriguez", ini: "MR", stage: "In repair", st: "rep", unit: "VT-101", vin: "4V4NC9EH5SN104482", cx: "D13 low boost under load", next: "Inspect the charge-air pipe and verify the clamps.", hrs: 2.5 },
  { no: "10483", cust: "Atlantic Freight", year: 2016, model: "VNL 670", p: "vnl-03-670", tech: "Dana Kowalski", ini: "DK", stage: "Waiting for parts", st: "wait", unit: "AF-22", vin: "4V4NC9EH0GN104483", cx: "Leveling valve leak", next: "Confirm the leveling valve ETA with Parts.", hrs: 3 },
  { no: "10484", cust: "Blue Ridge Transport", year: 2021, model: "VNR 300", p: "vnr-18-300", tech: "Luis Martinez", ini: "LM", stage: "In repair", st: "rep", unit: "BR-7", vin: "4V4WC9EG2MN104484", cx: "ABS light on", next: "Finish the chassis inspection and record findings.", hrs: 1.5 },
  { no: "10485", cust: "Ironwood Construction", year: 2022, model: "VHD 300", p: "vhd-21-300", tech: "Priya Shah", ini: "PS", stage: "Waiting for approval", st: "wait", unit: "IW-14", vin: "4V5KC9EH8NN104485", cx: "Front axle noise", next: "Review the air line diagnosis with the foreman.", hrs: 2 },
  { no: "10486", cust: "Silverline Transport", year: 2019, model: "VNL 760", p: "vnl-18-760", tech: "", ini: "", stage: "Needs a technician", st: "new", unit: "SL-3", vin: "4V4NC9EH1KN104486", cx: "Coolant loss", next: "Assign a technician for the first diagnosis.", hrs: 0 },
  { no: "10487", cust: "Cedar Fleet Services", year: 2026, model: "VNR 660", p: "vnr-26-660", tech: "", ini: "", stage: "Checked in", st: "new", unit: "CF-40", vin: "4V4WC9EJ6TN104487", cx: "Annual inspection", next: "Road test before the inspection.", hrs: 0 }
];
var RO = {}; ROS.forEach(function(r){ RO[r.no] = r; });
var BAYS0 = { B1: "10482", B2: null, B3: "10484", B4: "10485", B5: "10483", B6: null };
function first(s){ return String(s || "").split(" ")[0]; }

/* ChatGPT's matching (vtIdentity / vtCandidates / vtMatch), ported as-is */
function vtYear(ro){ var raw = ro && ro.year, m; if(!raw && (m = /\b((?:19|20)\d{2})\b/.exec(String(ro && ro.model || "")))) raw = m[1]; var y = Number(raw); return Number.isInteger(y) && y >= 1980 && y <= 2027 ? y : null; }
function vtIdentity(ro){
  var s = String(ro && ro.model || "").toUpperCase().replace(/VOLVO\s*/g, "").replace(/\b(?:19|20)\d{2}\b/g, "").trim();
  var f = /\b(VNR\s*ELECTRIC|VNL|VNM|VNR|VHD|VNX|VAH|VT|VN)\b/.exec(s);
  if(!f) f = /^(VNL|VNM|VNR|VHD|VNX|VAH|VT|VN)(?=\d)/.exec(s);
  var family = f ? f[1].replace(/\s*ELECTRIC/, " Electric") : null, tail = f ? s.slice(f.index + f[0].length) : "", cab = "";
  var code = /(?:\b|T)([234678]\d{2})(?:\b|$)/.exec(tail); if(code) cab = code[1];
  if(family === "VN") cab = String(ro.cab || "").trim();
  if(family === "VNR Electric"){ var ax = /([46])[x×]([24])/i.exec(tail); cab = ro.cab || (ax ? ax[1] + "x" + ax[2] + " tractor" : ""); }
  return { family: family, cab: cab, year: vtYear(ro) };
}
function vtTrims(p){ if(!p) return []; if(p.family === "VNL" && p.from >= 2025) return ["Core", "Edge", "Edge Black", "Ultimate"]; if(p.family === "VNR" && p.from >= 2026) return ["Core", "Edge"]; return []; }
function vtCandidates(ro){ var x = vtIdentity(ro); return PROF.filter(function(p){ return p.family === x.family && (!x.cab || p.cab === x.cab) && x.year && x.year >= p.from && x.year <= p.to; }); }
function vtMatch(ro){
  var x = vtIdentity(ro), list = vtCandidates(ro), chosen = P[ro.prof];
  if(!x.year) return { profile: null, status: "year", message: "Add the model year to match this truck." };
  if(!x.family) return { profile: null, status: "family", message: "This model is outside the illustrated Volvo catalog. Add a vehicle photo." };
  if(!list.length) return { profile: null, status: "unsupported", message: "No verified illustration for this year and cab. Confirm the vehicle details or add a photo." };
  if(chosen && list.indexOf(chosen) >= 0) return { profile: chosen, status: "confirmed", message: "Body generation confirmed for this repair order." };
  if(list.length !== 1) return { profile: null, status: "cab", message: "Choose the cab configuration to finish the match." };
  var p = list[0];
  if(p.review || (p.reviewYears || []).indexOf(x.year) >= 0) return { profile: null, candidate: p, status: "review", message: "Confirm this body generation against the truck before using its illustration." };
  return { profile: p, status: "matched", message: "Matched by model year and cab configuration." };
}
var ST_PILL = { matched: ["good", "Matched"], confirmed: ["good", "Confirmed"], review: ["warn", "Check against truck"], cab: ["warn", "Choose the cab"], year: ["bad", "Needs the year"], family: ["bad", "Not in catalog"], unsupported: ["bad", "No picture"] };

/* global UI state */
var MOTION = true, SLOW = false, OFF = [];
function on(t, ev, fn, o){ t.addEventListener(ev, fn, o); OFF.push(function(){ t.removeEventListener(ev, fn, o); }); }
function cleanup(){ OFF.forEach(function(f){ f(); }); OFF = []; $$(".ghost,.toast").forEach(function(g){ g.remove(); }); }
function slowLoop(){ if(!SLOW) return; D.getAnimations().forEach(function(a){ if(a.playbackRate !== 0.4) a.playbackRate = 0.4; }); requestAnimationFrame(slowLoop); }
function later(fn, ms){ var t = setTimeout(fn, ms * (SLOW ? 2.5 : 1)); OFF.push(function(){ clearTimeout(t); }); return t; }

/* toast: Undo works only while it is still the latest action (ChatGPT's toastUndoRef) */
var toastN = 0, toastT;
function toast(msg, undo){
  var n = ++toastN, old = $(".toast"); if(old) old.remove(); clearTimeout(toastT);
  var t = D.createElement("div"); t.className = "toast"; t.setAttribute("role", "status");
  t.innerHTML = "<span>" + msg + "</span>" + (undo ? '<button type="button">' + ic("back") + "Undo</button>" : "");
  D.body.appendChild(t);
  if(undo) t.querySelector("button").onclick = function(){ if(n !== toastN) return; t.remove(); undo(); };
  toastT = setTimeout(function(){ t.remove(); }, 5200);
}
function fade(el){ if(!el) return; el.classList.remove("fadein"); void el.offsetWidth; el.classList.add("fadein"); }

/* a truck image flies from one box to another (ChatGPT's pm-truck-flight) */
function topRect(bay){ var r = bay.getBoundingClientRect(); return { left: r.right - 9 - 22, top: r.top + 26, width: 22, height: 44 }; }
function fly(a, b, img, dur, done){
  var g = D.createElement("div"); g.className = "ghost"; g.innerHTML = '<img src="' + img + '" alt="">';
  g.style.cssText = "left:" + a.left + "px;top:" + a.top + "px;width:" + a.width + "px;height:" + a.height + "px";
  D.body.appendChild(g);
  if(!MOTION){ g.remove(); done(); return; }
  var dx = b.left - a.left + (b.width - a.width) / 2, dy = b.top - a.top + (b.height - a.height) / 2;
  var an = g.animate([{ transform: "translate(0,0) scale(1)" }, { transform: "translate(" + dx / 2 + "px," + (dy / 2 - 14) + "px) scale(1.12)", offset: .5 }, { transform: "translate(" + dx + "px," + dy + "px) scale(1)" }], { duration: dur, easing: "cubic-bezier(.2,.75,.25,1)" });
  if(SLOW) an.playbackRate = 0.4;
  an.onfinish = function(){ g.remove(); done(); };
}

/* building blocks */
function frame(title, path, body, foot, cls){
  return '<div class="frame ' + (cls || "") + '"><div class="fh">' + ic("grid") + "<b>" + title + '</b><span class="live">PREVIEW</span><span class="sp"></span><span class="path">' + path + '</span></div><div class="fb">' + body + "</div>" + (foot ? '<div class="ff">' + ic("info") + "<span>" + foot + "</span></div>" : "") + "</div>";
}
function segH(id, opts, val, lbl){
  return '<div class="seg" id="' + id + '" role="group"' + (lbl ? ' aria-label="' + lbl + '"' : "") + ">" + opts.map(function(o){ return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (o[0] === val) + '">' + o[1] + "</button>"; }).join("") + "</div>";
}
function segOn(root, id, fn){
  var s = $("#" + id, root); if(!s) return;
  s.addEventListener("click", function(e){ var b = e.target.closest("button[data-v]"); if(!b) return; $$("button", s).forEach(function(x){ x.setAttribute("aria-pressed", x === b); }); fn(b.dataset.v); });
}
function bayHTML(b, ro, extra){
  if(!ro) return '<div class="bay free" data-bay="' + b + '"><div class="r1"><span class="l">' + b + '</span><span class="st nb">Available</span></div><div class="open">Free bay</div></div>';
  return '<div class="bay' + (extra || "") + '" tabindex="0" role="button" aria-pressed="false" aria-label="Bay ' + b + ", RO " + ro.no + ", " + ro.cust + '" data-bay="' + b + '" data-ro="' + ro.no + '"><div class="r1"><span class="l">' + b + '</span><span class="st ' + ro.st + '">' + ro.stage + '</span></div><div class="t"><span class="mono">' + ro.no + "</span><span>" + first(ro.cust) + '</span></div><div class="r3">' + (ro.ini ? '<span class="av">' + ro.ini + "</span>" + first(ro.tech) : '<span class="k">Unassigned</span>') + '<span class="h">' + (ro.hrs ? ro.hrs.toFixed(2) + " h" : "") + '</span></div><div class="top">' + pic(ro.p, "t") + "</div></div>";
}
function rohHTML(ro, opt){
  opt = opt || {};
  var im = "img" in opt ? opt.img : src(ro.p, "s");
  return '<div class="roh' + (opt.cls ? " " + opt.cls : "") + '"><div><div class="eb">RO ' + ro.no + ' · <span class="st ' + ro.st + '">● ' + ro.stage + "</span></div><h3>" + ro.cust + '</h3><div class="vh">' + ro.year + " Volvo " + ro.model + " · Unit " + ro.unit + (opt.vin ? ' · <span class="mono">' + ro.vin + "</span>" : "") + '</div><div class="rw">' + (ro.ini ? '<span class="av">' + ro.ini + "</span>" + ro.tech : '<span class="k">No technician yet</span>') + "</div></div>" +
    '<div class="pic">' + (im ? '<img src="' + im + '" alt="">' : '<span class="k">No picture</span>') + (opt.cam === false ? "" : '<button type="button" class="cam" title="Truck &amp; photos" aria-label="Truck and photos">' + ic("camera") + "</button>") + "</div></div>";
}
function thumb(ro){ return '<span class="th">' + pic(ro.p, "s") + "</span>"; }
