/* Parsec · pages/inventory · model.js
   The parts inventory itself (STATE.inventory): parts and kits with quantities, matching an RO's part to stock (invFind), syncing from operations.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   invList invFind invBlank invChild invPnKey invDescKey invHasPart invAddFromPart kitKey kitFromOp invSyncAll invSet … (35 functions, 3 constants)
   state      inventory ros
   uses       automations/ data/ import/ kit/ pages/triage/ ro/ ro-page/ shell/ state/
*/
/* ============================== PARTS INVENTORY ==============================
   Parts and kits (a kit holds nested parts), each with the quantity a job needs and the
   engine model / year / model it fits. Paste a parts list, a screenshot or a PDF to fill it. */
function invList(){ if(!Array.isArray(STATE.inventory)) STATE.inventory = []; return STATE.inventory; }
function invFind(key){
  var ids = String(key).split(":"), it = invList().filter(function(x){ return x.id === ids[0]; })[0];
  if(!it || ids.length === 1) return it || null;
  return (it.children || []).filter(function(c){ return c.id === ids[1]; })[0] || null;
}
function invBlank(kit){ return { id: uid("inv"), kit: !!kit, desc: "", pn: "", qty: "1", engine: "", year: "", model: "", children: [], addedAt: nowIso() }; }
function invChild(){ return { id: uid("ic"), desc: "", pn: "", qty: "1", price: "" }; }
/* a part put on an operation is also listed on the Parts page, unless the inventory
   already has it (same part number, or the same description when there is no part number;
   kit lines count). The part keeps a link to the line it created, so correcting its part
   number or description later fixes that line instead of adding a second one. */
function invPnKey(pn){ return String(pn || "").toUpperCase().replace(/[\s\-.\/]/g, ""); }
function invDescKey(d){ return String(d || "").toLowerCase().replace(/\s+/g, " ").trim(); }
function invHasPart(pn, desc, skipId){
  var k = invPnKey(pn), dk = invDescKey(desc), hit = null;
  invList().some(function(it){
    var lines = [it].concat(it.children || []);
    return lines.some(function(x){
      if(x.id === skipId) return false;
      if(k ? invPnKey(x.pn) === k : (dk && !invPnKey(x.pn) && invDescKey(x.desc) === dk)){ hit = x; return true; }
      return false;
    });
  });
  return hit;
}
function invAddFromPart(p, roNumber){
  if(!p) return false;
  var pn = String(p.partNumber || "").trim(), desc = String(p.description || "").trim();
  if(!pn && !desc) return false;
  var own = p.invId ? invList().filter(function(x){ return x.id === p.invId; })[0] : null;
  /* a part with no price takes the Parts page's; a priced part teaches the Parts page its price */
  if(!priceOf(p.price)){ var ip = invPriceOf(pn, desc); if(ip) p.price = ip; }
  if(own && own.fromPart === p.id){            /* the line this part created: keep it in step */
    if(priceOf(p.price) && !priceOf(own.price)) own.price = priceOf(p.price);
    if(invHasPart(pn, desc, own.id)){ return false; }
    own.pn = pn; own.desc = desc || own.desc; own.editedAt = nowIso(); scheduleSave(); return false;
  }
  var had = invHasPart(pn, desc);
  if(had){ if(priceOf(p.price) && !priceOf(had.price)){ had.price = priceOf(p.price); scheduleSave(); } return false; }
  var it = invBlank(false); it.desc = desc; it.pn = pn; it.qty = String(p.qty || "1"); it.price = priceOf(p.price) ? priceOf(p.price) : "";
  it.fromPart = p.id; if(roNumber) it.fromRo = roNumber;
  invList().unshift(it); p.invId = it.id;
  scheduleSave();
  return true;
}
/* a completed repair / warranty / recall / comeback operation leaves a kit on the Parts
   page named after the job, with its parts and the truck's engine, ready for the next one. */
var KIT_TYPES = { OP: 1, WARR: 1, RECALL: 1, COMEBACK: 1 };
function kitKey(name, eng){ return invDescKey(name) + "|" + invDescKey(eng); }
function kitFromOp(ro, op){
  if(!ro || !op || op.declined || !KIT_TYPES[opJobType(op)]) return false;
  if(!/^Complete/.test(autoStatusName(opStatus(op)))) return false;
  var parts = opRealParts(op); if(!parts.length || !(op.complaint || "").trim()) return false;
  var sig = parts.map(function(p){ return invPnKey(p.partNumber) + ":" + invDescKey(p.description) + ":" + (p.qty || "1"); }).sort().join("|");
  if(op.kitSig === sig && op.kitId && invList().some(function(x){ return x.id === op.kitId; })) return false;
  var key = kitKey(op.complaint, ro.engineType || "");
  var kit = invList().filter(function(x){ return x.kit && x.autoKey === key; })[0];
  if(!kit){
    kit = invBlank(true); kit.desc = op.complaint.trim(); kit.engine = ro.engineType || "";
    var vn = String(ro.vin || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if(vn.length >= 10){ var yc = vn.charAt(9), yi = "ABCDEFGHJKLMNPRSTVWXY".indexOf(yc), yy = yi > -1 ? 2010 + yi : (/[1-9]/.test(yc) ? 2030 + (+yc) : 0); if(yy > new Date().getFullYear() + 1) yy -= 30; if(yy) kit.year = String(yy); }
    kit.autoKey = key; kit.autoFrom = { ro: ro.roNumber || "", type: opJobType(op), at: nowIso() };
    invList().unshift(kit);
  }
  kit.children = kit.children || [];
  parts.forEach(function(p){
    var pk = invPnKey(p.partNumber), dk = invDescKey(p.description);
    var hit = kit.children.filter(function(c){ return pk ? invPnKey(c.pn) === pk : invDescKey(c.desc) === dk; })[0];
    if(hit){ if((parseFloat(p.qty) || 1) > (parseFloat(hit.qty) || 1)) hit.qty = String(p.qty); if(!hit.desc) hit.desc = p.description || ""; if(!priceOf(hit.price) && priceOf(p.price)) hit.price = priceOf(p.price); }
    else { var c = invChild(); c.desc = p.description || ""; c.pn = p.partNumber || ""; c.qty = String(p.qty || "1"); c.price = priceOf(p.price) ? priceOf(p.price) : ""; kit.children.push(c); }
  });
  kit.editedAt = nowIso(); op.kitId = kit.id; op.kitSig = sig;
  scheduleSave();
  return true;
}
/* sweep every part on every RO into the inventory (parts added before v92, samples, imports) */
function invSyncAll(){
  var n = 0;
  (STATE.ros || []).forEach(function(r){ (r.operations || []).forEach(function(op){ (op.parts || []).forEach(function(pt){ try{ if(invAddFromPart(pt, r.roNumber)) n++; }catch(e){} }); try{ kitFromOp(r, op); }catch(e){} }); });
  return n;
}
function invSet(key, f, v){ var it = invFind(key); if(!it) return; it[f] = v; it.editedAt = nowIso(); scheduleSave(); }
var INV_ICON = {
  scan: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7V5.5A1.5 1.5 0 0 1 5.5 4H7M17 4h1.5A1.5 1.5 0 0 1 20 5.5V7M20 17v1.5a1.5 1.5 0 0 1-1.5 1.5H17M7 20H5.5A1.5 1.5 0 0 1 4 18.5V17"/><path d="M8 9.5h8M8 12.5h8M8 15.5h5"/></svg>',
  kit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5 12 4l8.5 4.5v7L12 20l-8.5-4.5z" fill="currentColor" fill-opacity=".1"/><path d="M3.5 8.5 12 13l8.5-4.5M12 13v7"/></svg>',
  caret: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M4.4 2.6 7.8 6l-3.4 3.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  box: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z" fill="currentColor" fill-opacity=".12"/><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9M7.7 5.5l8.6 4"/></svg>'
};
/* ---- Extract operations: read screenshots (OCR) and add the operations found to the RO ---- */
function opsGuessType(name){
  var t = String(name || "").toLowerCase();
  return /inspection|\bpm\b|service\b|wash/.test(t) ? "PM" : /warrant/.test(t) ? "WARR" : /^(check|diagnos|advise)|diagnos|fault|code|no start|won'?t start|will not start/.test(t) ? "DIAG" : "OP";
}
/* The case page's own job rules first; a plain list of lines is the fallback ("1. Replace water pump  2.5") */
function parseOpsText(raw){
  var rows = [];
  try{ rows = x132OpsRows(raw); }catch(e){ rows = []; }   /* Parsec 14: hours, rate, labor, parts, shop supplies, sublet, total — and the parts */
  if(!rows.length) try{ rows = (parseCaseText(raw).jobs || []).map(function(j){
    return { name: j.name, hours: +j.hours || 0, type: j.type || opsGuessType(j.name), approval: j.approval || "", cost: +j.cost || 0 };
  }); }catch(e){}
  var caseRows = rows; rows = [];
  var JUNK = /^(operations?|description|complaint|job|labor|hours?|hrs|qty|total|subtotal|status|approval|approved|pending|declined|line|item|page|case|repair order|customer|vin|unit|date|price|amount|tax|parts?|notes?|ro)\b[\s:#.\-]*$/i;
  var seen = {};
  String(raw || "").replace(/\r/g, "").split("\n").forEach(function(line){
    var l = line.replace(/\t+/g, "  ").replace(/[|¦]/g, " ").replace(/\s+/g, " ").trim();
    if(!l) return;
    var bare = l.replace(/^(?:[\u2022\u25cf\u25cb\u25aa*\-\u2013\u2014>]+|\(?\d{1,2}[.)]|\(?[A-Za-z][.)])\s+/, ""), listy = bare !== l; l = bare;
    var cost = cjCost(l) || 0;                                                     /* "$1,240.00" on the line */
    if(cost) l = l.replace(/\s*\$\s?\d[\d,]*(?:\.\d{2})?/g, " ").replace(/\s+\d{1,3}(?:,\d{3})+(?:\.\d{2})?(?=\s|$)/g, " ").replace(/\s+/g, " ").trim();
    var hrs = 0, hm = /\s+(\d{1,2}(?:\.\d{1,2})?)\s*(?:h|hr|hrs|hours?)?\.?$/i.exec(l);
    if(hm && /[A-Za-z]/.test(l.slice(0, hm.index)) && +hm[1] <= 40){ hrs = +hm[1]; l = l.slice(0, hm.index).trim(); }
    l = l.replace(/[\s.:;,\-–—]+$/, "");
    if(l.length < 4 || !/[A-Za-z]{3}/.test(l) || JUNK.test(l)) return;
    if((l.match(/[A-Za-z]/g) || []).length < l.length * 0.5) return;
    var k = l.toLowerCase(); if(seen[k]) return; seen[k] = 1;
    l = l.charAt(0).toUpperCase() + l.slice(1);
    rows.push({ name: l, hours: hrs, cost: cost, type: opsGuessType(l), approval: "", listy: listy || !!hrs || !!cost });
  });
  if(!caseRows.length) return rows;
  /* the case page's jobs, plus any plain list pasted alongside them (bulleted, numbered or with hours) */
  var names = caseRows.map(function(r){ return r.name.toLowerCase(); });
  return caseRows.concat(rows.filter(function(r){
    var k = r.name.toLowerCase();
    return r.listy && !x132NotAnOp(r.name) && !names.some(function(n){ return k.indexOf(n) > -1 || n.indexOf(k) > -1; });   /* Parsec 14 */
  }));
}
function opsXHtml(m){
  return '<div class="ops-x">'
    + '<div class="ops-x-drop" id="ops-x-drop">'
    +   '<textarea id="ops-x-text" rows="6" placeholder="Paste the case page or a list of operations here \u2014 one per line, hours at the end.\ne.g.  Replace EGR cooler   6.2\nOr paste / drop screenshots or a PDF.">'+esc(m.text||"")+'</textarea>'
    +   '<div class="ops-x-tools"><label class="btn btn-sm inv-x-file">'+IC.upload+'<span>Screenshots or PDF\u2026</span><input type="file" id="ops-x-file" accept="image/*,.pdf,application/pdf" multiple hidden></label>'
    +   '<button class="btn btn-sm" data-action="ops-x-clear" type="button">Clear</button>'
    +   '<span class="hint">Text is read as you paste; screenshots are read with OCR.</span></div></div>'
    + '<div id="ops-x-status" class="hint ops-x-status">'+esc(m.status||"")+'</div>'
    + '<div id="ops-x-list" class="inv-x-list ops-x-list"></div>'
    + '</div>';
}
function opsXPaint(){
  var m = UI.modal; if(!m || m.type !== "extract-ops") return;
  var box = document.getElementById("ops-x-list"); if(!box) return;
  var rows = m.rows || [];
  if(!rows.length){
    box.innerHTML = '<div class="hint inv-x-empty">'+(m.busy ? 'Reading\u2026' : String(m.text||"").trim() ? 'No operations found yet \u2014 edit the text above, or try a sharper screenshot.' : 'Operations show up here as you paste text or read a screenshot.')+'</div>';
  } else {
    box.innerHTML = rows.map(function(r, i){
      return '<div class="ops-x-row"><input type="checkbox" data-opsx="'+i+'"'+(r.on === false ? '' : ' checked')+' aria-label="Add this operation">'
        + '<select data-opst="'+i+'" aria-label="Operation type">'+JOB_TYPES.map(function(k){ return '<option value="'+k+'"'+(k===r.type?' selected':'')+'>'+jobTypeLabel(k)+'</option>'; }).join("")+'</select>'
        + '<input class="ops-x-n" data-opsn="'+i+'" value="'+esc(r.name)+'" aria-label="Operation">'
        + (r.approval ? '<span class="pill ops-x-ap">'+esc(r.approval)+'</span>' : '<span class="ops-x-ap"></span>')
        + '<input class="mono ops-x-h" data-opsh="'+i+'" value="'+(+r.hours||0).toFixed(2)+'" inputmode="decimal" aria-label="Quoted hours"><span class="imp-h">h</span>'
        + '<span class="imp-h">$</span><input class="mono ops-x-h ops-x-c" data-opsc="'+i+'" value="'+(+r.cost ? (+r.cost).toFixed(2) : '')+'" placeholder="0.00" inputmode="decimal" aria-label="Labor on the case" title="Labor on the case">'+x132OpsMore(r)+'</div>';
    }).join("");
  }
  var n = rows.filter(function(r){ return r.on !== false && String(r.name||"").trim(); }).length;
  var go = document.getElementById("ops-x-go");
  if(go){ go.disabled = !n; go.textContent = n ? "Add " + n + " operation" + (n===1?"":"s") : "Add operations"; }
  var st = document.getElementById("ops-x-status"); if(st) st.textContent = m.status || "";
}
function opsXParse(){
  var m = UI.modal; if(!m || m.type !== "extract-ops") return 0;
  var prev = {}; (m.rows || []).forEach(function(r){ prev[(r.src || r.name).toLowerCase()] = r; });
  var found = parseOpsText(m.text || "");
  m.rows = found.map(function(r){
    var k = r.name.toLowerCase(), p = prev[k];
    if(p) return p;
    r.src = r.name; if(/declin|not approved/i.test(r.approval)) r.on = false;
    return r;
  });
  return found.length;
}
function opsXSetText(t){
  var m = UI.modal; if(!m || m.type !== "extract-ops") return;
  m.text = t; var ta = document.getElementById("ops-x-text"); if(ta && ta.value !== t) ta.value = t;
  var n = opsXParse();
  m.status = !String(t).trim() ? "" : n ? n + " operation" + (n===1?"":"s") + " found \u2014 fix any name or hours, untick any you don\u2019t want." : "No operations found in that text yet.";
  opsXPaint();
}
function opsXRead(files){
  var m = UI.modal; if(!m || m.type !== "extract-ops") return;
  files = Array.prototype.slice.call(files || []);
  var pdf = files.filter(function(f){ return /pdf$/i.test(f.type || "") || /\.pdf$/i.test(f.name || ""); })[0];
  var imgs = files.filter(function(f){ return /^image\//.test(f.type || "") || /\.(png|jpe?g|webp|bmp|gif)$/i.test(f.name || ""); });
  if(!pdf && !imgs.length){ m.status = "Pick screenshots (PNG, JPG\u2026) or a PDF."; opsXPaint(); return; }
  m.busy = true; m.status = pdf ? "Reading " + (pdf.name || "the PDF") + "\u2026" : "Getting the screenshot reader ready\u2026 (the first time needs internet)"; opsXPaint();
  (pdf ? pdfToText(pdf) : ocrImages(imgs, 6).then(cleanOcrText)).then(function(text){
    if(UI.modal !== m) return;
    m.busy = false;
    text = String(text || "").trim();
    if(!text){ m.status = "No text found in that " + (pdf ? "PDF." : "screenshot."); opsXPaint(); return; }
    opsXSetText((String(m.text||"").trim() ? String(m.text).replace(/\s+$/, "") + "\n\n" : "") + text);
    if(!(m.rows || []).length){ m.status = "Read it, but found no operations. You can edit the text above."; opsXPaint(); }
  }, function(e){
    if(UI.modal !== m) return;
    m.busy = false;
    m.status = e && e.message === "offline" ? "Couldn\u2019t load the " + (pdf ? "PDF" : "screenshot") + " reader \u2014 it needs internet the first time. Paste the text instead." : "Couldn\u2019t read that file \u2014 paste the text instead.";
    opsXPaint();
  });
}
function opsXCommit(){
  var m = UI.modal; if(!m || m.type !== "extract-ops") return;
  var ro = getRO(m.roId); if(!ro) return;
  var rows = (m.rows || []).filter(function(r){ return r.on !== false && String(r.name||"").trim(); });
  if(!rows.length) return;
  pushUndo("extract operations");
  var first = null;
  rows.forEach(function(r){
    var op = { id: uid("op"), complaint: String(r.name).trim(), cause: "", correction: "", quoted: +r.hours || 0, isStandard: false, standardName: null,
      declined: false, parts: [], burnt: 0, work: "", jobType: JOB_TYPES.indexOf(r.type) >= 0 ? r.type : "OP" };
    if(+r.cost > 0) op.estCost = +r.cost;                                          /* the amount on the estimate */
    try{ x132OpsCommit(op, r, ro); }catch(e){ console.error(e); }   /* Parsec 14 */
    ro.operations.push(op); if(!first) first = op;
  });
  UI.modal = null;
  if(first){ UI.roOp[ro.id] = first.id; UI.roPane[ro.id] = first.id; UI.jcScrollTo = first.id; }
  scheduleSave(true);
  pushToast(rows.length + " operation" + (rows.length===1?"":"s") + " added to RO " + tgNum(ro), true);
}

/* ---- extraction dialog ---- */
function invXHtml(m){
  return '<div class="inv-x">'
    + '<textarea id="inv-x-text" rows="7" placeholder="Paste a parts list, quote or invoice — one part per line.\ne.g.  4988201   Brake chamber 30/30   2">'+esc(m.text||"")+'</textarea>'
    + '<div class="inv-x-tools"><label class="btn btn-sm inv-x-file">'+IC.upload+'<span>Screenshot or PDF…</span><input type="file" id="inv-x-file" accept="image/*,.pdf,application/pdf" multiple hidden></label>'
    +   '<span id="inv-x-status" class="hint">'+esc(m.status||"")+'</span></div>'
    + '<div class="inv-x-fit"><label>Engine model<input id="inv-x-engine" value="'+esc(m.engine||"")+'" placeholder="e.g. Cummins X15"></label>'
    +   '<label>Year<input id="inv-x-year" value="'+esc(m.year||"")+'" placeholder="2021"></label>'
    +   '<label>Model<input id="inv-x-model" value="'+esc(m.model||"")+'" placeholder="e.g. Cascadia"></label></div>'
    + '<label class="inv-x-kit"><input type="checkbox" id="inv-x-askit"'+(m.asKit?' checked':'')+'> Save them as one kit named <input id="inv-x-kitname" value="'+esc(m.kitName||"")+'" placeholder="e.g. EGR cooler kit"></label>'
    + '<div id="inv-x-list" class="inv-x-list"></div></div>';
}
function invXPaint(){
  var m = UI.modal; if(!m || m.type !== "inv-extract") return;
  var box = document.getElementById("inv-x-list"); if(!box) return;
  var found = parsePartsText(m.text || "");
  m.found = found; m.pick = m.pick || {};
  if(!found.length){ box.innerHTML = '<div class="hint inv-x-empty">'+(String(m.text||"").trim() ? 'No part lines found in that text yet.' : 'Parts show up here as you paste.')+'</div>'; }
  else box.innerHTML = found.map(function(p, i){
    var on = m.pick[i] !== false;
    return '<label class="inv-x-row"><input type="checkbox" data-invx="'+i+'"'+(on?' checked':'')+'><span class="inv-x-d">'+esc(p.desc||"—")+'</span><span class="mono inv-x-p">'+esc(p.pn||"no P/N")+'</span><span class="mono inv-x-q">×'+esc(p.qty)+'</span>'+(p.price ? '<span class="mono inv-x-q">'+esc(money(+p.price))+'</span>' : '<span></span>')+x132InvMore(p)+'</label>';
  }).join("");
  var n = found.filter(function(p, i){ return m.pick[i] !== false; }).length;
  var go = document.getElementById("inv-x-go");
  if(go){ go.disabled = !n; go.textContent = n ? (m.asKit ? "Add kit with " + n + " part" + (n===1?"":"s") : "Add " + n + " part" + (n===1?"":"s")) : "Add parts"; }
}
function invXCommit(){
  var m = UI.modal; if(!m || m.type !== "inv-extract") return;
  var rows = (m.found || parsePartsText(m.text || "")).filter(function(p, i){ return (m.pick || {})[i] !== false; });
  if(!rows.length) return;
  pushUndo("extract parts to inventory");
  var fit = { engine: (m.engine||"").trim(), year: (m.year||"").trim(), model: (m.model||"").trim() };
  if(m.asKit){
    var k = invBlank(true); k.desc = (m.kitName||"").trim() || "New kit"; k.engine = fit.engine; k.year = fit.year; k.model = fit.model;
    k.children = rows.map(function(p){ var c = invChild(); c.desc = p.desc; c.pn = p.pn; c.qty = p.qty; if(p.price) c.price = p.price; if(p.cost) c.cost = p.cost; if(p.core) c.core = p.core; return c; });
    invList().unshift(k);
  } else {
    rows.slice().reverse().forEach(function(p){ var it = invBlank(false); it.desc = p.desc; it.pn = p.pn; it.qty = p.qty; if(p.price) it.price = p.price; if(p.cost) it.cost = p.cost; if(p.core) it.core = p.core; if(p.list) it.list = p.list; it.engine = fit.engine; it.year = fit.year; it.model = fit.model; invList().unshift(it); });
  }
  UI.modal = null;
  scheduleSave(true);
  pushToast(m.asKit ? "Kit added with " + rows.length + " part" + (rows.length===1?"":"s") : rows.length + " part" + (rows.length===1?"":"s") + " added to the inventory", true);
}
function invXRead(files){
  var m = UI.modal; if(!m || m.type !== "inv-extract") return;
  files = Array.prototype.slice.call(files || []);
  if(!files.length) return;
  var pdf = files.filter(function(f){ return /pdf$/i.test(f.type) || /\.pdf$/i.test(f.name); })[0];
  var imgs = files.filter(function(f){ return /^image\//.test(f.type); });
  var st = document.getElementById("inv-x-status");
  m.status = pdf ? "Reading the PDF…" : "Reading the screenshot" + (imgs.length > 1 ? "s" : "") + "… (the first time needs internet)";
  if(st) st.textContent = m.status;
  (pdf ? pdfToText(pdf) : ocrImages(imgs, 6).then(cleanOcrText)).then(function(text){
    if(UI.modal !== m) return;
    m.text = (String(m.text||"").trim() ? String(m.text).trim() + "\n" : "") + String(text||"").trim();
    m.pick = {};
    var n = parsePartsText(m.text).length;
    m.status = n ? n + " part line" + (n===1?"":"s") + " found — untick any you don’t want." : "Read it, but found no part lines. You can edit the text above.";
    render();
  }, function(){ m.status = "Couldn’t read that file here — paste the text instead."; render(); });
}

/* Shared by the parts inventory and the RO job console: one parts-text parser, not two. */
/* "4988201 x2 brake chamber", "brake chamber 30/30 qty 2 K123-44" ... -> {pn, qty, desc} */
function parseQuickPart(txt) {
  var toks = String(txt || '').trim().split(/\s+/).filter(Boolean), qty = '1', pn = '';
  for (var i = 0; i < toks.length; i++) {
    var m = /^(?:x(\d{1,4})|(\d{1,4})x|qty:?(\d{1,4})?)$/i.exec(toks[i]);
    if (!m) continue;
    var q = m[1] || m[2] || m[3];
    if (!q && /^qty/i.test(toks[i]) && /^\d{1,4}$/.test(toks[i + 1] || '')) { q = toks[i + 1]; toks.splice(i + 1, 1); }
    if (q) { qty = q; toks.splice(i, 1); break; }
  }
  /* a price anywhere — "$45.99", "@12.50", "price 212.50", "1384.00", "$38 ea" */
  var price = '';
  for (var k = 0; k < toks.length; k++) {
    var pt = toks[k], lab = /^(?:price|cost|ea|each|@|\$)$/i.test(pt) && /^\$?\d[\d,]*(?:\.\d{1,2})?$/.test(toks[k + 1] || '');
    if (lab) { toks.splice(k, 1); pt = toks[k]; }
    var pm = /^(?:@|\$|price:?|cost:?)?\$?(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+\.\d{2}|\d+)(?:\/?(?:ea|each))?$/i.exec(pt);
    if (pm && (lab || /[$@]|^(price|cost)/i.test(pt) || /\.\d{2}$/.test(pt))) { price = pm[1].replace(/,/g, ''); toks.splice(k, 1); if (/^(ea|each)$/i.test(toks[k] || '')) toks.splice(k, 1); break; }
  }
  toks = toks.filter(function (t) { return !/^(ea|each)$/i.test(t); });
  var isPn = function (t) { return /\d/.test(t) && /^[A-Z0-9][A-Z0-9\-\/.]{3,}$/i.test(t) && !/^\d{1,3}\/\d{1,3}$/.test(t); };
  if (toks.length && isPn(toks[0])) pn = toks.shift();
  else if (toks.length > 2 && isPn(toks[toks.length - 1])) pn = toks.pop();
  var desc = toks.join(' ');
  if (desc) desc = desc.charAt(0).toUpperCase() + desc.slice(1);
  return { pn: pn, qty: qty, desc: desc, price: price };
}
function dpQty(s){ var n = parseFloat(String(s || "").replace(/,/g, "")); return isFinite(n) && n > 0 ? String(Math.round(n * 1000) / 1000) : ""; }
function dpPn(s){ return String(s || "").replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "").replace(/\s+/g, " ").toUpperCase(); }
function dpDesc(s){ return String(s || "").replace(/\bCatalog\b/gi, "").replace(/\s+/g, " ").trim().toUpperCase(); }
/* copied text: "PN<tab>\nQTY\n (q/bo)<tab>Get parts availability<tab>NAME Catalog<tab>..." */
function parseDealerPaste(raw){
  var t = String(raw || "").replace(/\r/g, "").replace(/ /g, " "), out = [];
  var re = /(?:^|\n)[ \t]*([A-Za-z0-9][A-Za-z0-9 .\-\/]{1,24}?)[ \t]*\n[ \t]*([\d,]+(?:\.\d+)?)[ \t]*\n[ \t]*\(\s*([\d.,]+)\s*\/\s*[\d.,]+\s*\)[^\t\n]*\t(?:[^\t\n]*availability[^\t\n]*\t)?([^\t\n]+)([^\n]*)/gi, m;
  while((m = re.exec(t))){
    var pn = dpPn(m[1]), desc = dpDesc(m[4]);
    if(!/\d/.test(pn) || !desc) continue;
    var q0 = dpQty(m[3]) || dpQty(m[2]) || "1", pr0 = xUnitPrice(xMoneyVals(m[5]), q0);
    out.push({ pn: pn, qty: q0, desc: desc, price: pr0 ? String(pr0) : "", eta: xDate(m[5]) });
  }
  return out;
}
/* screenshot, read row by row: "24628716 4.00 %§ CONNECTING BOLT AE 6.23 0.00 $24.92 ..."
   then "(4.000/0.000) [rest of a wrapped name] Catalog" on the line under it */
var DP_MONEY = /^\$?O?[\d,]*\d\.\d{2}$|^\$[\d,.]+$/;
function parseDealerOcr(raw){
  var lines = String(raw || "").replace(/\r/g, "").split("\n").map(function(l){ return l.replace(/[|¦]/g, " ").replace(/\s+/g, " ").trim(); });
  var out = [];
  for(var i = 0; i < lines.length; i++){
    var L = lines[i];
    if(!L || /^\(/.test(L) || /^part\s*no\b/i.test(L)) continue;
    var m = /^(.+?)\s+(\d{1,4}\.\d{2,3})\s+(.+)$/.exec(L) || /^(\S+(?:\s\d{3,})?)\s+(\d{3,5})\s+(.+)$/.exec(L);
    if(!m) continue;
    var pn = dpPn(m[1]);
    if(!/\d{3,}/.test(pn) || pn.length > 18) continue;
    var toks = m[3].split(" "), k = 0, words = [];
    while(k < toks.length && (toks[k].length <= 2 || /[^A-Za-z0-9,\-\/&.]/.test(toks[k]))) k++;      /* the parts-icon noise */
    for(; k < toks.length; k++){
      var w = toks[k], nx = toks[k + 1] || "";
      if(/^catalog$/i.test(w) || DP_MONEY.test(w) || /^\d+$/.test(w) && DP_MONEY.test(nx)) break;
      if(w.length <= 4 && (DP_MONEY.test(nx) || /^\(?\d/.test(nx)) && words.length) break;      /* the info icon, read as letters */
      words.push(w);
    }
    var qty = m[2].indexOf(".") > -1 ? dpQty(m[2]) : dpQty(m[2].length > 2 ? m[2].slice(0, -2) + "." + m[2].slice(-2) : m[2]);
    var nxt = lines[i + 1] || "", p = /^\{?\(?\s*([\d.,]+)\s*\/\s*[\d.,]+\s*\)\s*(.*)$/.exec(nxt);
    if(p){
      var pq = dpQty(p[1]); if(pq && /\d\.\d/.test(p[1])) qty = pq;
      var more = p[2].replace(/\bCatalog\b.*$/i, "").trim();
      if(more && !DP_MONEY.test(more)) words.push(more);
      i++;
    }
    var desc = dpDesc(words.join(" "));
    var pr1 = xUnitPrice(toks.slice(k).filter(function(w){ return DP_MONEY.test(w); }).map(function(w){ return { v: parseFloat(w.replace(/[$,]/g, "").replace(/^O/, "0")) }; }), qty || "1");
    if(desc) out.push({ pn: pn, qty: qty || "1", desc: desc, price: pr1 ? String(pr1) : "", eta: xDate(L) });
  }
  return out.length >= 2 || (out.length && /QTY\s*\(SHIPPED/i.test(raw)) ? out : [];
}
function parseDealerParts(raw){
  var a = parseDealerPaste(raw);
  return a.length ? a : parseDealerOcr(raw);
}

/* prices and dates read out of pasted or scanned text */
function xMoneyVals(str){
  var out = [], re = /(^|[^\w.\/-])(\$\s?)?(\d{1,3}(?:,\d{3})+(?:\.\d{2})?|\d+\.\d{2})(?![\d\/-])/g, m, S0 = String(str || "");
  while((m = re.exec(S0))){ var v = parseFloat(m[3].replace(/,/g, "")); if(isFinite(v)) out.push({ v: v, dollar: !!m[2], at: m.index + m[1].length }); }
  var re2 = /\$\s?(\d{1,6})(?![\d.,\/-])/g;                        /* "$450" — whole dollars after a $ sign */
  while((m = re2.exec(S0))){ var v2 = parseFloat(m[1]); if(isFinite(v2)) out.push({ v: v2, dollar: true, at: m.index }); }
  out.sort(function(a, b){ return a.at - b.at; });
  return out;
}
/* the price of one: when a line has a unit price and a line total, the one that times the qty gives the other */
function xUnitPrice(vals, qty){
  var v = vals.map(function(x){ return x.v; }).filter(function(x){ return x > 0; }), q = parseFloat(qty) || 1;
  if(!v.length) return 0;
  if(q > 1) for(var i = 0; i < v.length; i++) for(var j = 0; j < v.length; j++) if(i !== j && Math.abs(v[i] * q - v[j]) <= Math.max(.02, v[j] * .01)) return v[i];
  return v[0];
}
function xDate(str){
  var s0 = String(str || ""), m = /\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/.exec(s0);
  if(m) return m[1] + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[3]).slice(-2);
  m = /\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{2}|\d{4})\b/.exec(s0);
  if(!m || +m[1] > 12 || +m[2] > 31) return "";
  var y = m[3].length === 2 ? "20" + m[3] : m[3];
  return y + "-" + ("0" + m[1]).slice(-2) + "-" + ("0" + m[2]).slice(-2);
}
function parsePartsText0(raw) {
  var dp = parseDealerParts(raw); if (dp.length) return dp;   /* the parts portal's own layout, read by its rules */
  var out = [], seen = {};
  var isPn = function (t) { return /\d/.test(t) && /^[A-Z0-9][A-Z0-9\-\/.]{3,}$/i.test(t) && !/^\d{1,3}\/\d{1,3}$/.test(t) && !/^\$?\d+[.,]\d{2}$/.test(t) && !/^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/.test(t); };
  var isQty = function (t) { return /^(?:x?\d{1,3}|\d{1,3}x|\d{1,3}\.0+)$/i.test(t); };
  var isMoney = function (t) { return /^\$?\d{1,3}(,\d{3})*(\.\d{2})$|^\$\d+/.test(t); };
  var HEAD = /^(part|parts|description|desc|qty|quantity|price|total|amount|line|item|status|eta|each|ext|unit|no\.?|#)$/i;
  String(raw || '').replace(/\r/g, '').split('\n').forEach(function (line) {
    var L = line.replace(/ /g, ' ').trim();
    if (!L || L.length < 3) return;
    var cells = L.split(/\t+|\s{2,}|\s*\|\s*/).map(function (c) { return c.trim(); }).filter(Boolean);
    if (cells.every(function (c) { return HEAD.test(c.replace(/[:#]/g, '').trim()) || !c; })) return;       /* a header row */
    if (/^(sub\s*total|total|tax|shipping|freight|labor)\b/i.test(L)) return;
    var pn = '', qty = '', desc = '';
    if (cells.length >= 2) {
      var rest = [];
      cells.forEach(function (c) {
        var q = /^(?:qty:?\s*)?x?(\d{1,3})x?$/i.exec(c);
        if (!pn && isPn(c) && !/\s/.test(c)) pn = c;
        else if (!qty && q && isQty(c.replace(/^qty:?\s*/i, ''))) qty = q[1];
        else if (!isMoney(c) && /[A-Za-z]/.test(c) && !/^(eta|due|ship)\b/i.test(c) && !xDate(c)) rest.push(c);
      });
      desc = rest.sort(function (a, b) { return b.length - a.length; })[0] || '';
    } else {
      var q2 = parseQuickPart(L); pn = q2.pn; qty = q2.qty; desc = q2.desc.replace(/\s*\$?\d+[.,]\d{2}\b.*$/, ''); if (!desc && q2.price) desc = '';
    }
    desc = desc.replace(/^[-–•*\d.)\s]+(?=[A-Za-z])/, '').trim();
    if (!pn && !desc) return;
    var price = xUnitPrice(xMoneyVals(L.replace(pn, ' ')), qty || '1'), eta = xDate(L);
    if (!pn && desc.split(/\s+/).length > 9) return;                      /* a sentence, not a part */
    var key = (pn || desc).toLowerCase();
    if (seen[key]) return; seen[key] = 1;
    out.push({ pn: pn, qty: qty || '1', desc: desc ? desc.charAt(0).toUpperCase() + desc.slice(1) : '', price: price ? String(price) : '', eta: eta });
  });
  return out;
}
