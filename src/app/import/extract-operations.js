/* Parsec · import · extract-operations.js
   Extract operations and the Parts list import read every amount (Parsec 14): rows for operations and parts out of free text (x132OpsRows / parsePartsText).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   x132R2 x132OpsRows x132OpsMore x132OpsCommit x132PartsRows parsePartsText x132InvMore x132NotAnOp x132Unglue (9 functions)
   uses       data/ import/new-ro/ kit/ pages/inventory/ ro/
*/
/* ============================== Parsec 14 — Extract operations and the Parts list import read every cost too ==============================
   Extract operations reads with the New RO import's reader (IMPX): hours, the labor rate, labor, parts, shop supplies, sublet and the
   operation's total, plus the parts under each operation. The Parts list import reads a quote or invoice by its header: List and
   Net (your price) become the price and the cost, Core is kept. */
function x132R2(n){ return Math.round(n * 100) / 100; }
function x132OpsRows(raw){
  if(typeof IMPX === "undefined" || !IMPX.parse) return [];
  var P = IMPX.parse(raw); if(!P || !P.ops || !P.ops.length) return [];
  return P.ops.filter(function(o){ return o.name && /[A-Za-z]{3}/.test(o.name); }).map(function(o){
    var labor = o.price != null ? +o.price : (o.rate > 0 && o.hours > 0 ? x132R2(o.rate * o.hours) : 0), rate = o.rate || (o.hours > 0 && labor > 0 ? x132R2(labor / o.hours) : null);
    return { name: o.name, hours: +o.hours || 0, type: opsGuessType(o.name), approval: o.approval || "", cost: labor || 0, rate: rate, partsAmt: o.partsAmt, misc: o.misc, sublet: o.sublet, total: o.total, parts: o.parts || [] };
  });
}
/* the rest of the operation's money, under its row */
function x132OpsMore(r){
  var b = [], P = r.parts || [];
  if(r.rate && Math.abs(r.rate - laborRate()) > .004) b.push("labor at " + money(r.rate) + "/h");
  var ext = P.reduce(function(a, p){ var q = parseFloat(p.qty); if(!isFinite(q)) q = 1; return a + q * ((+p.price || 0) + (+p.core || 0)); }, 0);
  if(r.partsAmt != null || P.length) b.push("parts " + money(r.partsAmt != null ? r.partsAmt : ext) + (P.length ? " (" + P.length + " part" + (P.length === 1 ? "" : "s") + " — they come in too)" : ""));
  if(r.misc) b.push("shop supplies " + money(r.misc)); if(r.sublet) b.push("sublet " + money(r.sublet));
  if(r.total != null) b.push("total " + money(r.total));
  return b.length ? '<small class="ops-x-more">' + esc(b.join(" · ")) + '</small>' : '';
}
/* Add: the operation keeps a labor rate that isn't the shop's, shop supplies + sublet as its Other, ASIST's numbers, and its parts */
function x132OpsCommit(op, r, ro){
  if(r.rate > 0 && Math.abs(r.rate - laborRate()) > .004) op.laborRate = +r.rate;
  if(r.misc != null || r.sublet != null){ var ot = x132R2((+r.misc || 0) + (+r.sublet || 0)); if(ot > 0) op.otherCost = ot; }
  var ac = {}; [["hours", r.hours], ["rate", r.rate], ["labor", r.cost], ["parts", r.partsAmt], ["misc", r.misc], ["sublet", r.sublet], ["total", r.total]].forEach(function(x){ if(x[1] != null && x[1] !== "" && !(x[0] === "labor" && !+x[1])) ac[x[0]] = +x[1]; });
  if(Object.keys(ac).length > 2){ ac.at = nowIso(); op.asist = ac; }
  (r.parts || []).forEach(function(p){
    var part = { id: uid("pt"), description: p.desc || p.pn, partNumber: p.pn || "", qty: String(p.qty || "1"), status: "Not Ordered", eta: "", statusChangedAt: nowIso() };
    if(p.price != null) part.price = +p.price; if(+p.core > 0) part.core = +p.core; if(p.list != null) part.list = +p.list; if(p.disc) part.disc = String(p.disc); if(p.salesman) part.salesman = p.salesman;
    if(!Array.isArray(op.parts)) op.parts = []; op.parts.push(part);
    try{ invAddFromPart(part, ro.roNumber); var it = invHasPart(part.partNumber, part.description); if(it && priceOf(part.price) && priceOf(it.price) !== priceOf(part.price)){ it.price = priceOf(part.price); it.editedAt = nowIso(); } }catch(e){}
  });
}
/* the Parts list import: a quote with a header row — List and Net → price and cost (one price column → the price), Core and Ext kept */
function x132PartsRows(raw){
  if(typeof IMPX === "undefined" || !IMPX.partsTable) return [];
  return (IMPX.partsTable(raw) || []).map(function(p){
    var two = p.list != null && p.price != null;
    return { pn: p.pn, qty: String(p.qty || "1"), desc: p.desc ? p.desc.charAt(0).toUpperCase() + p.desc.slice(1) : "", price: two ? String(p.list) : p.price != null ? String(p.price) : "", cost: two ? String(p.price) : "",
      list: p.list != null ? String(p.list) : "", core: +p.core > 0 ? String(+p.core) : "", ext: p.ext != null ? String(p.ext) : "", disc: p.disc || "", eta: "" };
  });
}
function parsePartsText(raw){
  var dp = parseDealerParts(raw); if(dp.length) return dp;   /* the parts portal's own layout, read by its rules */
  var hx = []; try{ hx = x132PartsRows(raw); }catch(e){}
  var base = parsePartsText0(raw); if(!hx.length) return base;
  var key = function(p){ return p.pn ? "p:" + String(p.pn).toUpperCase().replace(/[^A-Z0-9]/g, "") : "d:" + String(p.desc || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }, seen = {};
  hx.forEach(function(p){ seen[key(p)] = 1; if(p.desc) seen["d:" + p.desc.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()] = 1; });
  return hx.concat(base.filter(function(p){ return !seen[key(p)] && !(p.desc && seen["d:" + p.desc.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()]) && (p.pn || p.price) && !/^(part\s*(number|no|#)|description|qty|list|net|core|ext)\b/i.test(p.desc || ""); }));   /* beside a quote's table, a line with no part # and no price is a title */
}
function x132InvMore(p){
  var b = []; if(p.cost) b.push((p.list ? "list is the price · " : "") + "net " + money(+p.cost) + " → cost"); if(p.core) b.push("core " + money(+p.core)); if(p.ext) b.push("ext " + money(+p.ext));
  return b.length ? '<span class="inv-x-more mono">' + esc(b.join(" · ")) + '</span>' : '';
}
/* a line that came along with the case page but isn't an operation: "Odometer: 288,412 mi", "Totals: Labor … Parts …", a part's line */
function x132NotAnOp(name){ var n = String(name || "").trim(); return /:\s|:$/.test(n) || /^(?:totals?|sub\s*-?\s*totals?|grand\s*total|labou?r|parts?|core|tax(?:es)?|shop\s*supplies|supplies|sublet|misc(?:ellaneous)?|environmental|fees?|cores?)\b/i.test(n) || /^(?:[A-Z]{2,5}-?\d{4,}|\d{6,})\b/i.test(n); }
/* an operation imported by 13.x with the case's "Parts" heading glued onto its name ("PM service - level A Parts") gets its name back */
function x132Unglue(ro){
  try{ var M = ro && ro.imp && ro.imp.ops; if(!M) return;
    Object.keys(M).forEach(function(k){ var m = M[k]; if(!m || !/\s+parts$/i.test(m.name || "")) return; var op = (ro.operations || []).filter(function(o){ return o.id === m.id; })[0];
      if(op && String(op.complaint || "").toLowerCase() === String(m.name).toLowerCase()){ op.complaint = op.complaint.replace(/\s+parts$/i, ""); m.name = m.name.replace(/\s+parts$/i, ""); } }); }catch(e){}
}
