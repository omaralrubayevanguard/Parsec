/* Parsec · import/new-ro · parts-list.js
   Parts pasted on their own into an RO (17.5): a Parts list of its own — ticks, cells to change, a menu on each row for the operation, Add that keeps the window open and marks each row Added.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   plOn plOps plNo plOp plKey plDup plM plExt plNum plSync plHtml plFoot … (14 functions)
   uses       access/ data/ kit/ pages/ pages/inventory/ pages/triage/ ro/ shell/ state/
*/
  /* ---------- Parsec 17.5: parts pasted on their own into an RO — a Parts list of its own ----------
     Each row: a tick, Part #, Part, Qty, Cost (click a cell to change it), Ext, and the operation it goes on (a menu
     on each row, the RO's own operations). A part already on that operation starts unticked; ticked, it's added again
     as its own line. Add puts the ticked parts on, and the window stays: each row then says Added. */
  function plOn(){ return !!(D && D.ro && !D.new && D.target === "ro" && D.pieces.some(function(p){ return !p.off && p.P && p.P.parts.length; }) && D.pieces.every(function(p){ return p.off || !p.P || !p.P.ops.length; })); }
  function plOps(){ return (D.ro.operations || []).filter(function(o){ return !o.declined; }); }
  function plNo(o){ return (D.ro.operations || []).indexOf(o) + 1; }
  function plOp(id){ return (D.ro.operations || []).filter(function(o){ return o.id === id; })[0] || null; }
  function plKey(s){ return String(s || "").replace(/[\s-]/g, "").toUpperCase(); }
  function plDup(r){ var o = plOp(r.to); return !!(o && r.pn && (o.parts || []).some(function(p){ return plKey(p.partNumber) === plKey(r.pn); })); }
  function plM(n){ return n == null || isNaN(n) ? "—" : (n < 0 ? "−" : "") + "$" + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function plExt(r){ return r.cost == null && !r.core ? null : (plNum(r.qty) || 0) * ((r.cost || 0) + (r.core || 0)); }   /* ASIST's Ext: qty × (unit + core) */
  function plNum(v){ var n = parseFloat(String(v == null ? "" : v).replace(/[$,\s]/g, "")); return isNaN(n) ? null : n; }
  function plSync(){
    var L = []; D.pieces.forEach(function(pc, pi){ if(pc.off || !pc.P) return; pc.P.parts.forEach(function(p, i){ L.push({ k: pi + ":" + i, p: p }); }); });
    var old = {}; (D.pl || []).forEach(function(r){ old[r.k] = r; });
    var to0 = (D.opId && plOp(D.opId) && !D.opAuto ? D.opId : null) || (plOps()[0] || (D.ro.operations || [])[0] || {}).id;
    D.pl = L.map(function(x){ var r = old[x.k]; if(r) return r; var p = x.p;
      r = { k: x.k, pn: p.pn || "", desc: p.desc || "", qty: String(p.qty || "1"), cost: p.price != null ? +p.price : p.unit != null ? +p.unit : null, core: p.core != null ? +p.core : null, sales: p.salesman || "", to: to0, added: false, touched: false };
      r.on = !plDup(r); return r; });
  }
  function plHtml(){
    plSync(); var R = D.pl, ops = plOps(), tot = R.filter(function(r){ return r.on && !r.added; }).reduce(function(a, r){ return a + (plExt(r) || 0); }, 0);
    var cell = function(r, i, f, cls){ var v = f === "cost" || f === "core" ? (r[f] == null || (f === "core" && !r[f]) ? "" : r[f].toFixed(2)) : r[f]; return '<input class="ix-plc' + (cls || '') + '" data-ixpl="' + f + '" data-i="' + i + '" value="' + esc(v) + '"' + (r.added ? ' disabled' : '') + ' aria-label="' + ({ pn: "Part number", desc: "Part", qty: "Qty", cost: "Cost", core: "Core", sales: "Salesman" })[f] + '">'; };
    return '<section class="ix-sec" id="ix-s-parts" data-for="ro"><div class="ix-sh"><h4>Parts</h4><span>' + R.length + '</span><em>→ on the operation picked on each row</em></div>'
      + '<table class="ix-pl"><thead><tr><th></th><th>Part #</th><th>Part</th><th class="r">Qty</th><th class="r">Cost</th><th class="r">Core</th><th class="r">Ext</th><th>Salesman</th><th>Goes on</th><th></th></tr></thead><tbody>'
      + R.map(function(r, i){ var o = plOp(r.to), dup = !r.added && plDup(r);
          return '<tr class="' + (r.added ? 'ad' : r.on ? '' : 'off') + '"><td><input type="checkbox" data-ixpl="on" data-i="' + i + '"' + (r.on && !r.added ? ' checked' : '') + (r.added ? ' disabled' : '') + ' aria-label="Add this part"></td>'
            + '<td class="pn">' + cell(r, i, "pn") + '</td><td class="ds">' + cell(r, i, "desc") + (dup ? '<small class="ix-pldup">on Op ' + plNo(o) + ' already' + (r.on ? ' — adds it again' : '') + '</small>' : '') + '</td>'
            + '<td class="r q">' + cell(r, i, "qty", " r") + '</td><td class="r c">' + cell(r, i, "cost", " r") + '</td><td class="r c">' + cell(r, i, "core", " r") + '</td><td class="r x" data-plx="' + i + '">' + plM(plExt(r)) + '</td><td class="sm">' + cell(r, i, "sales") + '</td>'
            + '<td class="to"><select class="ix-in ix-plto" data-ixpl="to" data-i="' + i + '"' + (r.added ? ' disabled' : '') + ' aria-label="The operation it goes on">' + ops.map(function(op){ return '<option value="' + esc(op.id) + '"' + (op.id === r.to ? ' selected' : '') + '>Op ' + plNo(op) + ' · ' + esc(String(op.complaint || "Operation").slice(0, 46)) + '</option>'; }).join("") + '</select></td>'
            + '<td class="st">' + (r.added ? '<span class="ix-pla">' + ic("check", 12) + 'Added</span>' : '') + '</td></tr>'; }).join("")
      + '</tbody></table><div class="ix-pltot"><span>' + R.filter(function(r){ return r.on && !r.added; }).length + ' of ' + R.filter(function(r){ return !r.added; }).length + ' ticked' + (R.some(function(r){ return r.added; }) ? ' · ' + R.filter(function(r){ return r.added; }).length + ' added' : '') + '</span><b data-pltot>' + plM(tot) + '</b></div></section>';
  }
  function plFoot(){
    var n = (D.pl || []).filter(function(r){ return r.on && !r.added; }).length, a = (D.pl || []).filter(function(r){ return r.added; }).length;
    return '<div class="ix-df"><span class="ix-mu ix-dest">' + (a ? a + ' added · ' : '') + 'Goes to: <b>RO ' + esc(tgNum(D.ro)) + '</b> ' + n + ' part' + (n === 1 ? '' : 's') + '</span><button class="ix-btn" data-ix="close">' + (a ? 'Done' : 'Cancel') + '</button><button class="ix-btn pri" data-ix="pladd"' + (n ? '' : ' disabled') + '>' + (n ? 'Add ' + n + ' part' + (n === 1 ? '' : 's') : a ? 'All added' : 'Nothing ticked') + '</button></div>';
  }
  /* a cell, a tick or a menu changed; full = redraw (change), else just the row's Ext and the total (typing) */
  function plSet(t, full){
    var r = (D.pl || [])[+t.getAttribute("data-i")], f = t.getAttribute("data-ixpl"); if(!r || r.added) return;
    if(f === "on"){ r.on = t.checked; r.touched = true; }
    else if(f === "to"){ r.to = t.value; if(!r.touched) r.on = !plDup(r); }
    else if(f === "cost" || f === "core"){ r[f] = plNum(t.value); }
    else r[f] = t.value;
    if(full){ draw(); return; }
    var w = document.getElementById("imp-dlg"); if(!w) return; var x = w.querySelector('[data-plx="' + t.getAttribute("data-i") + '"]'); if(x) x.textContent = plM(plExt(r));
    var tt = w.querySelector("[data-pltot]"); if(tt) tt.textContent = plM(D.pl.filter(function(q){ return q.on && !q.added; }).reduce(function(a, q){ return a + (plExt(q) || 0); }, 0));
  }
  function plAdd(){
    var L = (D.pl || []).filter(function(r){ return r.on && !r.added && plOp(r.to); }); if(!L.length) return;
    pushUndo("add parts"); var by = {};
    L.forEach(function(r){ var op = plOp(r.to), part = { id: uid("pt"), description: String(r.desc || r.pn).trim(), partNumber: String(r.pn || "").trim(), qty: String(plNum(r.qty) == null ? 1 : plNum(r.qty)), status: "Not Ordered", eta: "", statusChangedAt: nowIso() };
      if(r.cost != null && r.cost >= 0) part.price = String(r.cost); if(r.core) part.core = String(r.core); if(String(r.sales || "").trim()) part.salesman = String(r.sales).trim(); else if(typeof partsMe === "function" && partsMe()) part.salesman = partsMe();
      if(!Array.isArray(op.parts)) op.parts = []; op.parts.push(part); r.added = true; r.on = false; by[plNo(op)] = (by[plNo(op)] || 0) + 1;
      if(+part.qty >= 0) try{ invAddFromPart(part, D.ro.roNumber); }catch(e){} });   /* a core return isn't a part to stock */
    try{ audit("parts", roLabel(D.ro) + " · " + L.length + " part" + (L.length > 1 ? "s" : "") + " pasted from ASIST", D.ro); }catch(e){}
    scheduleSave(true); try{ render(); }catch(e){}
    pushToast(L.length + " part" + (L.length > 1 ? "s" : "") + " added to " + Object.keys(by).map(function(k){ return "Op " + k; }).join(", "), true);
    draw();
  }
