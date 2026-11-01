/* Parsec · import · contact-reading.js
   The contact on New RO (16.3 C): contact name, phone (normalized), email, driver and driver's phone read from labels; the last contact used for the same customer / unit as a suggestion.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   v163Phone v163Email v163Name v163Cells v163Lab v163LabCell v163ReadContact v163NN v163LastRo v163LastFill v163When v163SugHtml … (12 functions, 2 constants)
   state      ros shopBtns
   uses       kit/ ro/ shell/ state/
*/
/* ============================== Parsec 16.3 (C) — the contact on New RO, the last contact, shop buttons by department ==============================
   · New RO (pasted ASIST text and the screenshot reader's text — both go through IMPX's parse) reads the contact's name, phone and
     email and the driver's name and phone. Phones are written (336) 555-0142. The RO fields: contactName, contactPhone (as before),
     contactEmail, driverName, driverPhone — on the RO list / Technician panes (ROFLD) and the RO page's Customer section.
   · No contact read? New RO suggests the last one used for that customer (the same unit first): "Last used on RO-29880 · May 12 —
     Dave Miller · (336) 555-0142 [Use]". Use fills it in; it never fills itself.
   · Shop buttons by department (STATE.shopBtns — Settings › The shop, the manager): which of Start op, Road test, Truck checks,
     Transfer and Release each department's ROs show — on the truck card (under the department), in the Foreman and Parts headers,
     and in the ⋯ on RO cards (v163ShopOk). Everything is on until the manager turns something off; only the offs are stored. */

/* ---------- reading the contact ---------- */
function v163Phone(v){
  var s = String(v == null ? "" : v);
  s = s.replace(/[\d(+][\dOoIl|()\s.\-]{8,}[\dOoIl|]/g, function(t){ return (t.match(/\d/g) || []).length >= 6 ? t.replace(/[Oo]/g, "0").replace(/[Il|]/g, "1") : t; });   /* the reader's O for 0, l for 1 */
  var m = /(?:\+?1[\s.\-]?)?\(?\s*([2-9]\d{2})\s*\)?[\s.\-]*(\d{3})[\s.\-]*(\d{4})(?!\d)(?:\s*(?:x|ext\.?|extension)\s*(\d{1,6}))?/i.exec(s);
  return m ? "(" + m[1] + ") " + m[2] + "-" + m[3] + (m[4] ? " x" + m[4] : "") : "";
}
function v163Email(v){ var m = /[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i.exec(String(v == null ? "" : v)); return m ? m[0].toLowerCase() : ""; }
function v163Name(v){   /* "MILLER, DAVE" or "DAVE MILLER 336-555-0142" → "Dave Miller" */
  var n = String(v == null ? "" : v).replace(/\S+@\S+/g, " ").replace(/\(?\+?\d[\d\s().\-]{6,}\d/g, " ").replace(/[^A-Za-z .,'\-]/g, " ").replace(/\s+/g, " ").replace(/^[\s.,'\-]+|[\s.,'\-]+$/g, "").trim();
  var lf = /^([A-Za-z'\-]+),\s*([A-Za-z'\-]+(?:\s+[A-Za-z]\.?)?)$/.exec(n); if(lf) n = lf[2] + " " + lf[1];
  n = n.replace(/,/g, "").trim();
  if(n === n.toUpperCase() || n === n.toLowerCase()) n = n.toLowerCase().replace(/(^|[\s'\-])([a-z])/g, function(_, a, b){ return a + b.toUpperCase(); });
  return /^[A-Za-z][A-Za-z .'\-]{1,40}$/.test(n) && n.split(" ").length <= 4 ? n : "";
}
var V163_LB = [
  ["dphone", /^driver(?:['’]?s)?\s*(?:phone|cell(?:\s*phone)?|mobile|tel(?:ephone)?)(?:\s*(?:#|no\.?|number))?/i],
  ["dname", /^driver(?:['’]?s)?(?:\s*name)?/i],
  ["cemail", /^(?:contact\s*|customer\s*)?e-?\s?mail(?:\s*address)?/i],
  ["cphone", /^(?:contact\s*|customer\s*)?(?:phone|cell(?:\s*phone)?|mobile|tel(?:ephone)?)(?:\s*(?:#|no\.?|number))?/i],
  ["cname", /^(?:contact(?:\s*(?:name|person))?|customer\s*contact|attn\.?)/i]
];
var V163_CUT = /(?<!\b(?:driver(?:['’]?s)?|contact|customer))\s(?=(?:contact(?:\s*(?:name|person|phone|e-?mail))?|customer\s*contact|driver(?:['’]?s)?(?:\s*(?:name|phone|cell|mobile))?|phone|cell(?:\s*phone)?|mobile|tel(?:ephone)?|e-?\s?mail)\s*[:#])/i;
function v163Cells(l){ var out = []; String(l == null ? "" : l).split(/\t+|\s{2,}|\s*[|¦]\s*/).forEach(function(c){ c.split(V163_CUT).forEach(function(x){ x = x.trim(); if(x) out.push(x); }); }); return out; }
function v163Lab(c){
  c = String(c || "");
  for(var i = 0; i < V163_LB.length; i++){
    var m = V163_LB[i][1].exec(c); if(!m) continue;
    var k = V163_LB[i][0], after = c.slice(m[0].length), colon = /^\s*[:#]/.test(after), rest = after.replace(/^\s*[:#.\-–]*\s*/, "").trim();
    if(!colon && rest && !((k === "cphone" || k === "dphone") && /^[\s(+\d]/.test(after) && v163Phone(rest)) && !(k === "cemail" && /^\s/.test(after) && v163Email(rest))) continue;   /* "Driver side mirror", "Telematics" — not labels */
    return { k: k, rest: rest, generic: k === "cphone" && /^(?:phone|cell|mobile|tel)/i.test(c) };
  }
  return null;
}
function v163LabCell(c){ return !!v163Lab(c) || /^[A-Za-z][A-Za-z #\/.'’\-]{0,30}[:#]\s*$/.test(String(c || "")); }
/* into f (IMPX's read): cname, cphone, cemail, dname, dphone — the first of each wins; a bare Phone / Cell right after a driver is the driver's */
function v163ReadContact(text, L, f){
  f = f || {}; L = L || String(text || "").split("\n");
  var ctx = null, ctxAt = -9, put = function(k, v){ if(!v || f[k]) return; f[k] = v; };
  for(var i = 0; i < L.length; i++){
    var C = v163Cells(L[i]);
    for(var ci = 0; ci < C.length; ci++){
      var lb = v163Lab(C[ci]); if(!lb) continue;
      var val = lb.rest;
      if(!val && ci + 1 < C.length && !v163LabCell(C[ci + 1])) val = C[ci + 1];
      if(!val && ci === C.length - 1 && i + 1 < L.length){ var nx = v163Cells(L[i + 1]); if(nx[0] && !v163LabCell(nx[0])) val = nx[0]; }
      if(!val) continue;
      var k = lb.k;
      if(lb.generic && ctx === "dname" && i - ctxAt <= 1) k = "dphone";
      if(k === "cname" || k === "dname"){
        var nm = v163Name(val); if(nm){ put(k, nm); ctx = k; ctxAt = i; }
        put(k === "cname" ? "cphone" : "dphone", v163Phone(val));   /* "Contact: Dave Miller 336-555-0142" */
        if(k === "cname") put("cemail", v163Email(val));
      } else if(k === "cphone" || k === "dphone") put(k, v163Phone(val));
      else if(k === "cemail") put(k, v163Email(val));
    }
  }
  if(f.customer) f.customer = String(f.customer).replace(/\s+(?:contact|customer\s*contact|phone|cell|mobile|tel|e-?mail|driver)\b[^:]{0,16}[:#].*$/i, "").trim();
  return f;
}

/* ---------- No contact read? The last one used for this customer ---------- */
function v163NN(s){ return String(s == null ? "" : s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function v163LastRo(cust, unit, except){
  var c = v163NN(cust); if(!c) return null;
  var u = String(unit == null ? "" : unit).trim().toUpperCase();
  var L = (STATE.ros || []).filter(function(r){ return r && !r.shop && r.id !== SHOP_RO_ID && r.id !== except && v163NN(r.customerName) === c && (String(r.contactName || "").trim() || String(r.contactPhone || "").trim()); });
  if(!L.length) return null;
  var t = function(r){ var d = Date.parse(r.dateOpened || r.createdAt || r.dateClosed || ""); return isNaN(d) ? 0 : d; };
  var same = function(r){ return u && String(r.unitNumber || "").trim().toUpperCase() === u ? 1 : 0; };
  L.sort(function(a, b){ return (same(b) - same(a)) || (t(b) - t(a)); });
  return L[0];
}
function v163LastFill(id){
  var r = typeof getRO === "function" ? getRO(id) : null; if(!r) return null;
  var o = {}; ["contactName", "contactPhone", "contactEmail", "driverName", "driverPhone"].forEach(function(k){ var v = String(r[k] || "").trim(); if(v) o[k] = v; });
  return Object.keys(o).length ? o : null;
}
function v163When(r){ var d = new Date(r.dateOpened || r.createdAt || r.dateClosed || ""); if(isNaN(d)) return ""; var o = { month: "short", day: "numeric" }; if(d.getFullYear() !== new Date().getFullYear()) o.year = "numeric"; return d.toLocaleDateString("en-US", o); }
/* New RO only, when the Contact and Phone rows are empty: F = each row's value as it stands */
function v163SugHtml(D){
  if(!D || !D.new) return "";
  var F = D.v163f || {}; if(String(F.contactName || "").trim() || String(F.contactPhone || "").trim()) return "";
  var r = v163LastRo(F.customerName, F.unitNumber); if(!r) return "";
  var who = [r.contactName, r.contactPhone].filter(function(x){ return String(x || "").trim(); }).join(" · "), w = v163When(r);
  return '<div class="ix-fr v163-sug"><span class="ix-fl"></span><span class="ix-fv"><span class="v163-sgt">Last used on <b class="mono">' + esc(r.roNumber || "an earlier RO") + '</b>' + (w ? ' · ' + esc(w) : '') + ' — <b>' + esc(who) + '</b></span>'
    + '<button class="ix-btn pri v163-use" data-ix="v163use" data-ro="' + esc(r.id) + '" title="Fill in the contact from ' + esc(r.roNumber || "that RO") + '">Use</button></span><span></span></div>';
}
