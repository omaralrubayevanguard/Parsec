/* Parsec · state · ro-page-file.js
   The readable Repair Order page written beside each RO's data (roPageHtml) and the shop page (shopPageHtml): HTML a person can open and print; Parsec also reads its data block back.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pdTone pdWhen roPageHtml shopPageHtml PD_CSS (4 functions, 1 constant)
   uses       automations/ kit/ pages/warranty/ ro/ trucks/
*/
/* ---------- the Repair Order page (readable on its own; Parsec reads its data back) ---------- */
var PD_CSS = "*{box-sizing:border-box}body{margin:0;background:#f2f4f7;color:#151a22;font:14px/1.45 'Segoe UI',system-ui,-apple-system,sans-serif}main{max-width:1080px;margin:0 auto;padding:24px 20px 40px}"
  + ".card{background:#fff;border-radius:16px;padding:16px 18px;margin-bottom:12px;box-shadow:0 1px 2px rgba(0,0,0,.04)}h1{margin:6px 0 2px;font-size:24px}h2{margin:0 0 8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#5b6575}"
  + ".row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.no{font:700 14px Consolas,monospace;background:#151a22;color:#fff;border-radius:8px;padding:5px 10px}.pill{border-radius:999px;padding:3px 10px;font-size:11.5px;font-weight:700;background:#eef1f5}"
  + ".g{background:#e6f5ee;color:#0e6a46}.w{background:#fdf1dc;color:#8a4f04}.t{background:#e3f4f2;color:#0f5f58}.v{background:#efe8fb;color:#5b21b6}.mut{color:#5b6575}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px 18px}"
  + ".grid b{display:block}.k{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#5b6575}table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:6px 6px;border-bottom:1px solid #eef0f3;vertical-align:top}th{color:#5b6575;font-weight:600;font-size:12px}"
  + ".op{border-top:1px solid #eef0f3;padding-top:12px;margin-top:12px}.op:first-of-type{border-top:0;margin-top:0;padding-top:0}.op h3{margin:0 0 6px;font-size:15px}.thumbs{display:flex;flex-wrap:wrap;gap:10px}.th{width:150px;font-size:12px;color:#5b6575;text-decoration:none}"
  + ".th img{width:150px;height:110px;object-fit:cover;border-radius:10px;display:block;background:#dde2e8}.doc{width:150px;height:110px;border-radius:10px;background:#f3e1e1;display:flex;align-items:center;justify-content:center;font-weight:700;color:#8a2a2a}"
  + ".num{font-family:Consolas,monospace;text-align:right}footer{color:#8a96a6;font-size:12px;text-align:center;margin-top:16px}@media print{body{background:#fff}.card{box-shadow:none;border:1px solid #e5e7eb}}";
function pdTone(st){ return /^Working|^Complete/.test(st) ? "g" : st === "Waiting – Tech Support" ? "v" : /Approval|Customer/.test(st) ? "t" : /^Waiting/.test(st) ? "w" : ""; }
function pdWhen(iso){ return iso ? fmtDate(iso) + " " + fmtTime(iso) : "—"; }
function roPageHtml(ro, punches, data){
  var e = esc, st = roStatus(ro), m = roMoney(ro), tm = { line: "" }; try{ tm = truckYM(ro); }catch(x){}
  var ops = (ro.operations || []).filter(function(o){ return o && o.id; });
  var h = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>' + e(roNumPart(ro)) + ' Repair Order</title><style>' + PD_CSS + '</style></head><body><main>';
  h += '<div class="card"><div class="row"><span class="no">' + e(ro.roNumber || "RO") + '</span><span class="pill ' + pdTone(st.status) + '">' + e(st.status + (st.sub ? " · " + st.sub : "")) + '</span>'
    + (ro.route ? '<span class="pill">With ' + e((RT_LBL && RT_LBL[ro.route.to]) || ro.route.to) + (ro.route.who ? " · " + e(ro.route.who) : "") + '</span>' : '')
    + '<span class="mut" style="margin-left:auto">Saved by Parsec · ' + e(pdWhen(new Date(data.savedAt || Date.now()).toISOString())) + '</span></div>'
    + '<h1>' + e(ro.customerName || "No customer") + '</h1>'
    + '<div class="grid" style="margin-top:10px">'
    + '<div><span class="k">Truck</span><b>' + e(tm.line || "—") + '</b>' + (ro.unitNumber ? 'Unit ' + e(ro.unitNumber) + ' · ' : '') + (ro.vin ? 'VIN ' + e(ro.vin) : '') + '</div>'
    + '<div><span class="k">Opened</span><b>' + e(pdWhen(ro.dateOpened)) + '</b>' + (ro.keyTag ? 'Tag ' + e(ro.keyTag) : '') + (ro.location ? ' · ' + e(ro.location) : '') + (ro.mileage ? ' · ' + e(ro.mileage) + ' mi' : '') + '</div>'
    + '<div><span class="k">Technician</span><b>' + e(ro.assignedTech || "—") + '</b>' + (ro.promisedAt ? 'Promised ' + e(pdWhen(ro.promisedAt)) : '') + (ro.dateClosed ? 'Closed ' + e(fmtDate(ro.dateClosed)) : '') + '</div>'
    + '<div><span class="k">Estimate</span><b>' + e(money(m.total)) + '</b>Labor ' + e(money(m.labor)) + ' · Parts ' + e(money(m.parts)) + (m.other ? ' · Other ' + e(money(m.other)) : '') + '</div>'
    + '</div></div>';
  /* operations */
  h += '<div class="card"><h2>Operations</h2>' + (ops.length ? '' : '<p class="mut">No operations.</p>');
  ops.forEach(function(op, i){
    var os = opStatus(op), osn = typeof os === "string" ? os : os.status, b = 0; try{ b = opCalc(op).burntHrs; }catch(x){ b = +op.burnt || 0; }
    var cause = opStory(op, "cause"), fix = opStory(op, "fix"), om = opMoney(op);
    h += '<div class="op"><h3>' + (i + 1) + '. ' + e(op.complaint || "Operation") + '</h3><div class="row" style="margin-bottom:6px"><span class="pill">' + e(opJobType(op) === "OP" ? "REPAIR" : opJobType(op)) + '</span><span class="pill ' + pdTone(osn) + '">' + e(op.declined ? "Declined" : osn) + '</span>'
      + '<span class="mut">Quoted ' + fmtDec(+op.quoted || 0) + ' h · Burnt ' + fmtDec(b) + ' h · ' + e(money(om.total)) + (op.appr ? ' · ' + e({ ok: "Approved", part: "Partly approved", no: "Declined" }[op.appr.s] || "") + ' by ' + e(op.appr.by || "") : '') + '</span></div>'
      + (cause ? '<div><b>Cause</b> ' + e(cause) + '</div>' : '') + (fix ? '<div><b>Correction</b> ' + e(fix) + '</div>' : '');
    var pts = opRealParts(op);
    if(pts.length) h += '<table style="margin-top:8px"><tr><th>Part</th><th>Part #</th><th class="num">Qty</th><th class="num">Price</th><th>Status</th></tr>' + pts.map(function(p){ return '<tr><td>' + e(p.description || "") + '</td><td>' + e(p.partNumber || "") + '</td><td class="num">' + e(p.qty || "1") + '</td><td class="num">' + (priceOf(p.price) ? e(money(partLine$(p))) : '—') + '</td><td>' + e(p.status || "Not Ordered") + (p.eta && !/Received|Installed/.test(p.status || "") ? ' · ETA ' + e(p.eta) : '') + '</td></tr>'; }).join("") + '</table>';
    var notes = [];
    (Array.isArray(op.offNotes) ? op.offNotes : []).forEach(function(n){ if(n && n.text) notes.push([n.at, n.text]); });
    (punches || []).forEach(function(p){ if(p.opId !== op.id) return; noteEntries(p.notes).forEach(function(n){ if(n.text.trim()) notes.push([p.start, n.text.trim()]); }); });
    if(notes.length) h += '<div style="margin-top:8px"><span class="k">Notes</span>' + notes.sort(function(a, c){ return new Date(a[0]) - new Date(c[0]); }).map(function(n){ return '<div><span class="mut">' + e(pdWhen(n[0])) + '</span> · ' + e(n[1]) + '</div>'; }).join("") + '</div>';
    h += '</div>';
  });
  h += '</div>';
  /* punches */
  var ps = (punches || []).slice().sort(function(a, c){ return new Date(a.start) - new Date(c.start); });
  var opN = {}; ops.forEach(function(o, i){ opN[o.id] = i + 1; });
  h += '<div class="card"><h2>Time punches</h2>' + (ps.length ? '<table><tr><th>Date</th><th>Start</th><th>Stop</th><th>Op</th><th>Start reason</th><th>Stop reason</th><th>Who</th><th class="num">Time</th></tr>' + ps.map(function(p){
      var ms = (p.stop ? new Date(p.stop) : new Date()) - new Date(p.start);
      return '<tr><td>' + e(fmtDate(p.start)) + '</td><td>' + e(fmtTime(p.start)) + '</td><td>' + (p.stop ? e(fmtTime(p.stop)) : 'running') + '</td><td>' + (opN[p.opId] || "—") + '</td><td>' + e(p.startReason || "") + '</td><td>' + e(p.stopReason || "") + '</td><td>' + e(p.by || "") + '</td><td class="num">' + e(fmtHM(ms)) + '</td></tr>';
    }).join("") + '</table>' : '<p class="mut">No time punched yet.</p>') + '</div>';
  /* hand-offs, contacts, log */
  var lg = [];
  (ro.handoffs || []).forEach(function(x){ lg.push([x.at, (x.by || "") + ' → ' + (x.to === "tech" ? (x.who || "Technician") : ((RT_DEPT && RT_DEPT[x.to]) || x.to)) + (x.note ? ' “' + x.note + '”' : '')]); });
  (ro.contacts || []).forEach(function(x){ lg.push([x.at, (x.kind || "Contact") + ' — ' + (x.out || "") + (x.note ? ': ' + x.note : '')]); });
  (ro.history || []).forEach(function(x){ lg.push([typeof x.at === "number" ? new Date(x.at).toISOString() : x.at, (x.t || "") + (x.o != null || x.n != null ? ': ' + (x.o != null && x.o !== "" ? x.o + ' → ' : '') + (x.n != null ? x.n : '') : '') + (x.by ? ' · ' + x.by : '')]); });
  lg.sort(function(a, c){ return new Date(c[0]) - new Date(a[0]); });
  h += '<div class="card"><h2>Log · hand-offs · contacts</h2>' + (lg.length ? lg.slice(0, 200).map(function(x){ return '<div><span class="mut">' + e(pdWhen(x[0])) + '</span> · ' + e(x[1]) + '</div>'; }).join("") : '<p class="mut">Nothing logged yet.</p>') + '</div>';
  /* attachments */
  var files = []; (ro.bulletins || []).forEach(function(b0){ (b0.files || []).forEach(function(f){ files.push(f); }); });
  h += '<div class="card"><h2>Attachments</h2>' + (files.length ? '<div class="thumbs">' + files.map(function(f){
      var nm = f.fname || f.name || "file", href = PD_ATT + '/' + encodeURIComponent(nm), img = /^image\//.test(f.type || "") || /\.(jpe?g|png|gif|webp|bmp)$/i.test(nm);
      return '<a class="th" href="' + e(href) + '" target="_blank">' + (img ? '<img src="' + e(href) + '" alt="" loading="lazy">' : '<span class="doc">' + e((/\.([a-z0-9]+)$/i.exec(nm) || ["", "FILE"])[1].toUpperCase()) + '</span>') + e(nm) + '</a>';
    }).join("") + '</div>' : '<p class="mut">No attachments. Files you put in the Attachments folder show up in Parsec.</p>') + '</div>';
  h += '<footer>This page is the record Parsec keeps for this RO. Edit the RO in Parsec — changes made to this file by hand are overwritten.</footer>';
  h += '</main><script type="application/json" id="parsec-data">' + pdEmbed(data) + '<\/script></body></html>';
  return h;
}
function shopPageHtml(shop){
  var e = esc, inv = shop.inventory || [], staff = shop.staff || [];
  var h = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Parsec Shop</title><style>' + PD_CSS + '</style></head><body><main>'
    + '<div class="card"><div class="row"><span class="no">Shop</span><span class="mut" style="margin-left:auto">Saved by Parsec · ' + e(pdWhen(new Date(shop.savedAt || Date.now()).toISOString())) + '</span></div><h1>Parsec shop data</h1>'
    + '<div class="mut">What belongs to no single RO: people, the Parts page list, the day clock and settings. Each RO has its own folder under ROs.</div>'
    + '<div class="grid" style="margin-top:10px"><div><span class="k">Labor rate</span><b>' + e(money(shop.laborRate || 210)) + ' / h</b></div><div><span class="k">People</span><b>' + staff.length + '</b></div><div><span class="k">Parts list</span><b>' + inv.length + ' items</b></div><div><span class="k">Day clock</span><b>' + (shop.shifts || []).length + ' shifts</b></div></div></div>';
  if(staff.length) h += '<div class="card"><h2>People</h2><table><tr><th>Name</th><th>Role</th></tr>' + staff.map(function(x){ return '<tr><td>' + e(x.name || "") + '</td><td>' + e(x.role || "") + '</td></tr>'; }).join("") + '</table></div>';
  if(inv.length) h += '<div class="card"><h2>Parts list</h2><table><tr><th>Description</th><th>Part #</th><th class="num">Qty</th><th class="num">Price</th></tr>' + inv.slice(0, 1000).map(function(x){ return '<tr><td>' + e(x.desc || "") + (x.kit ? ' <span class="pill">Kit</span>' : '') + '</td><td>' + e(x.pn || "") + '</td><td class="num">' + e(x.qty || "") + '</td><td class="num">' + (priceOf(x.price) ? e(money(priceOf(x.price))) : '—') + '</td></tr>'; }).join("") + '</table></div>';
  var sh = (shop.shifts || []).slice(-30).reverse();
  if(sh.length) h += '<div class="card"><h2>Day clock · last 30</h2><table><tr><th>In</th><th>Out</th><th>Reason</th></tr>' + sh.map(function(x){ return '<tr><td>' + e(pdWhen(x.in)) + '</td><td>' + (x.out ? e(pdWhen(x.out)) : 'on the clock') + '</td><td>' + e(x.outReason || "") + '</td></tr>'; }).join("") + '</table></div>';
  h += '<footer>Parsec reads its shop data back from this page. Edit it in Parsec — changes made here by hand are overwritten.</footer></main><script type="application/json" id="parsec-data">' + pdEmbed(shop) + '<\/script></body></html>';
  return h;
}
