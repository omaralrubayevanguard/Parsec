/* Parsec · library · read-more.js
   More from a document (17.3): its part numbers, labor operations and hours, chassis ranges, symptoms and the repair in one line; the two likeliest kinds when the number doesn't say; the fields worth checking; and using them on an operation.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   libReadLabels libPartsIn libLaborIn libChassisIn libSymptomsIn libStepsIn libFixLine libKindGuess libTitleRules libReadMore libFits libWords … (20 functions, 5 constants)
   state      libRules
   uses       data/ pages/inventory/ ro/ state/
*/
/* ============================== more from a document (Parsec 17.3) ==============================
   libReadMore(r, T, one) runs at the end of libDocRead and adds to what it read:
     parts   [{ pn, desc, qty }]      8-digit Volvo part numbers on a line with words (×2, Qty 2, 2 pcs)
     labor   [{ op, hrs, what }]      a labor operation (2511-03-02-01) and its hours, or "Labor time: 1.8 h"
     chassis [[lo, hi]]               "Chassis ID 123456–129999"
     symp    ["slow gear changes"]    from Symptom(s): / Condition: / Complaint: / Customer concern: lines
     fix     "…"                       Correction: / Repair: / Remedy: …, else the first numbered steps
     toss    ["tsb", "fsb"]           the two likeliest kinds when the number gives none (or the words disagree with it)
     doubt   { field: why }           the fields read from somewhere weak — the card marks them "check"
     lines   the page's lines, for the page beside the card
   A title rule the shop taught (STATE.libRules { drop: "Service Bulletin –" }) is applied to the title first.
   Nothing here is saved by itself: libAdd keeps parts, labor, chassis, symp and fix on the document. */
/* the labelled lines a CBR (and most other documents) carry: "Release: 02", "Revision 3", "Published: 08/23/2023",
   "Model(s): VNL, VNR", "Model year(s): 2019, 2020, 2021" or "MY 2019–2022". A labelled line wins over a loose mention. */
var LIB_DATE_ANY = "([A-Za-z]{3,9}\\.? \\d{1,2},? \\d{4}|\\d{1,2}[ -][A-Za-z]{3,9}\\.?[ -,]+\\d{4}|\\d{1,2}\\/\\d{1,2}\\/\\d{4}|\\d{4}-\\d{2}-\\d{2}|\\d{1,2}\\.\\d{4}|[A-Za-z]{3,9} \\d{4})";
/* A CBR printed from Volvo's portal ("Print Solution") is laid out as label · value:
     ID #  CBR-2408 · Version  19 · Title / <the title on the next line> · Published 8 January 2026 ·
     Valid For / Volvo Chassis - VN (4) / Mack Chassis - PR (4) / Model year - 2024 to curent
   The page's own header ("3/12/26, 1:49 PM  Print Solution") and footer (the link, "1/4") are when it was printed, not read. */
var LIB_TRUCK_TAG = /(?:\s+[-–]\s+(?:VNL|VNR|VNX|VHD|VAH|VN|PR|GR|LR|MD|AN|HR|MR|TE)\s*\(\d+\))+\s*$/;
function libReadLabels(r, T){
  var S = r.src = r.src || {}, L = String(T || "").split("\n").map(function(l){ return l.replace(/\s+/g, " ").trim(); }).filter(Boolean), m;
  var find = function(re){ for(var i = 0; i < L.length; i++){ var x = re.exec(L[i]); if(x) return { m: x, line: L[i], i: i }; } return null; };
  var f;
  /* ID # CBR-2408: the number, from the page */
  if((f = find(/^ID\s*#?\s*:?\s*([A-Z]{2,5}-?\d{2,}[A-Z0-9-]*)$/i)) && (!r.num || r.how === "file name" || r.how === "CBR")){ r.num = f.m[1].toUpperCase(); r.how = "ID #"; S.num = f.line; if(!r.kind || r.numKind) r.kind = libKindOf(r.num) || r.kind; }
  /* Title on its own line, the title under it (its "- VN (4) - PR (4)" tail is the trucks, not the title) */
  if((f = find(/^title\s*:?$/i)) && L[f.i + 1] && (!r.title || r.tHow === "line" || r.tHow === "file" || r.tHow === "")){
    r.title = libUnhyph(L[f.i + 1]).replace(LIB_TRUCK_TAG, "").trim(); r.tHow = "label"; S.title = L[f.i + 1];
  }
  /* Valid For: Volvo Chassis - VN (4) · Model year - 2024 to current */
  if((f = find(/^(?:volvo\s+)?chassis\s*[:\-–]\s*(.+)$/i))){
    var vm = f.m[1].match(/\b(VNL|VNR|VNX|VHD|VAH|VN)\b/g);
    if(vm){ var sn = {}; r.model = vm.filter(function(x){ if(sn[x]) return false; sn[x] = 1; return true; }).join(", "); S.model = f.line; r.modelLbl = 1; }
  }
  if(!r.rel && (f = find(/\b(?:release|revision|rev\.?|version)\s*(?:no\.?|number|#)?\s*[:#\-]?\s*(\d{1,3})\b(?![\/.\-]\d)/i))){ r.rel = ("0" + f.m[1]).slice(-2); S.rel = f.line; }
  if(!r.date && (f = find(new RegExp("\\b(?:release date|publish(?:ed)?(?: date)?|issue(?:d)?(?: date)?|date(?: issued| published| created)?|created|updated|last (?:updated|modified|revised)|revised|effective(?: date)?)\\s*(?:on)?\\s*[:\\-]?\\s*" + LIB_DATE_ANY, "i"))) && libDate(f.m[1])){ r.date = libDate(f.m[1]); S.date = f.line; }
  if((f = find(/^(?:(?:truck |vehicle )?models?|applies to|applicable (?:models?|vehicles?)|vehicles?(?: affected)?|product(?: line)?)\s*(?:\(s\))?\s*[:\-]\s*(.+)$/i))){
    var md = f.m[1].match(/\b(VNL|VNR|VNX|VHD|VAH|VN)\b/g);
    if(md){ var seen = {}; r.model = md.filter(function(x){ if(seen[x]) return false; seen[x] = 1; return true; }).join(", "); S.model = f.line; r.modelLbl = 1; }
  }
  if((f = find(/^(?:model years?|years?|my)\s*(?:\(s\))?\s*[:\-–]?\s*(.*(?:19|20)\d\d.*)$/i)) || (f = find(/\b(?:model years?|MY)\s*(?:\(s\))?\s*[:\-]?\s*((?:19|20)\d\d.*)$/i))){
    var v = f.m[1], y = "", to = /((?:19|20)\d\d)\s*(?:to|through|thru|[-–])\s*(?:(?:the\s+)?cur+ent|present|now|today|newer|later|onwards?)\b/i.exec(v), ft = /((?:19|20)\d\d)\s*(?:to|through|thru)\s*((?:19|20)\d\d)/i.exec(v);
    if(to) y = to[1] + "+"; else if(ft) y = ft[1] + "–" + ft[2]; else y = libYears(v);
    if(!y){ var ys = (v.match(/\b(?:19|20)\d\d\b/g) || []).map(Number).sort(); if(ys.length) y = ys.length > 1 ? ys[0] + "–" + ys[ys.length - 1] : String(ys[0]); }
    if(y){ r.years = y; S.years = f.line; r.yearsLbl = 1; }
  }
}
var LIB_PN = /(?:^|[^\d-])(\d{8})(?![\d-])/g;
function libPartsIn(lines, r){
  var out = [], seen = {}, own = String(r.num || "").replace(/\D/g, "");
  lines.forEach(function(L){
    if(/chassis|\bvin\b|serial|phone|fax|\btel\b|page \d|https?:/i.test(L)) return;
    var m; LIB_PN.lastIndex = 0;
    while((m = LIB_PN.exec(L))){
      var pn = m[1], at = m.index + m[0].length;
      if(seen[pn] || pn === own || /^(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/.test(pn)) continue;   /* a date written 20230823 */
      var after = L.slice(at), before = L.slice(0, m.index + m[0].length - pn.length);
      var q = /(?:×|\bx|\bqty\.?:?|\bquantity:?)\s*(\d{1,3})\b/i.exec(after) || /\b(\d{1,3})\s*(?:pcs?|pieces|ea)\b/i.exec(after);
      var desc = after.replace(/(?:×|\bx|\bqty\.?:?|\bquantity:?)\s*\d{1,3}\b.*$/i, "").replace(/\b\d{1,3}\s*(?:pcs?|pieces|ea)\b.*$/i, "").replace(/^[\s·:,–\-]+/, "").replace(/\s{2,}.*$/, "").trim();
      if(!/[a-z]/i.test(desc)) desc = before.replace(/(?:p\/n|part(?: no\.?| number)?)\s*:?\s*$/i, "").replace(/[\s·:,–\-]+$/, "").trim().split(/\s{2,}|\t/).pop() || "";
      desc = desc.replace(/\s+\d+(?:[.,]\d+)?\s*(?:h|hrs?)\b.*$/i, "").slice(0, 60);
      if(!/[a-z]{2}/i.test(desc) && !/part|p\/n/i.test(L)) continue;   /* a bare number with no words isn't a part */
      seen[pn] = 1; out.push({ pn: pn, desc: desc, qty: q ? +q[1] : 1 });
    }
  });
  return out.slice(0, 40);
}
function libLaborIn(one){
  var out = [], seen = {}, m, re = /\b(\d{4}-\d{2}-\d{2}-\d{2})\b(.{0,60}?)\b(\d{1,2}(?:[.,]\d{1,2})?)\s*(?:h|hr|hrs|hours?)\b/gi;
  while((m = re.exec(one))){ if(seen[m[1]]) continue; seen[m[1]] = 1; out.push({ op: m[1], hrs: +m[3].replace(",", "."), what: m[2].replace(/^[\s·:,–\-]+|[\s·:,–\-]+$/g, "").slice(0, 60) }); }
  if(!out.length && (m = /\b(?:labou?r(?: time)?|time allowance|allowed time|repair time)\s*:?\s*(\d{1,2}(?:[.,]\d{1,2})?)\s*(?:h|hr|hrs|hours?)\b/i.exec(one))) out.push({ op: "", hrs: +m[1].replace(",", "."), what: "" });
  return out.filter(function(x){ return x.hrs > 0 && x.hrs < 100; }).slice(0, 12);
}
function libChassisIn(one){
  var out = [], m, re = /chassis(?:\s*(?:id|no\.?|number|#|serial))?(?:\s*(?:from|range|numbers?))?\s*:?\s*(\d{5,7})\s*(?:[-–]|to|through|thru)\s*(\d{5,7})/gi;
  while((m = re.exec(one))) out.push([+m[1], +m[2]]);
  return out.slice(0, 8);
}
function libSymptomsIn(lines){
  var out = [], seen = {}, sec = -1;
  lines.forEach(function(L, i){
    if(/^symptoms?(?: description)?\s*:?$/i.test(L)){ sec = i; return; }
    var dm = sec > -1 && i - sec <= 6 && /^description\s*:\s*(.{4,120})$/i.exec(L);
    if(dm){ var t = dm[1].replace(/[“”"]/g, "").replace(/\s+[–-]\s+.*$/, "").trim(); if(t.split(/[\s\/]+/).length >= 2 && !seen[t.toLowerCase()]){ seen[t.toLowerCase()] = 1; out.push(t); } return; }
    var m = /^(?:symptoms?|conditions?|complaints?|customer concerns?|concerns?|problem)\s*[:\-–]\s*(.{4,160})$/i.exec(L); if(!m) return;
    m[1].split(/\s*[;•]\s*|,\s+(?=[a-z])/).forEach(function(s){
      s = s.replace(/[.\s]+$/, "").trim(); var k = s.toLowerCase();
      if(s.split(/\s+/).length >= 2 && s.length <= 80 && !seen[k]){ seen[k] = 1; out.push(s); }
    });
  });
  return out.slice(0, 8);
}
/* the numbered steps of the repair (a CBR's Corrective Action, a bulletin's procedure), each with the lines under it as notes */
function libStepsIn(lines){
  var out = [], st = -1, cur = null, gap = 0;
  for(var i = 0; i < lines.length && out.length < 30; i++){
    var L = lines[i], m = /^(\d{1,2})[.)]\s+(.{3,200})$/.exec(L);
    if(m && (+m[1] === (cur ? cur.n + 1 : 1))){ cur = { n: +m[1], t: m[2].replace(/\s+$/, ""), notes: [] }; out.push(cur); gap = 0; continue; }
    if(!cur) continue;
    if(/^(?:https?:|\d+\/\d+$|\d{1,2}\/\d{1,2}\/\d{2,4},)/i.test(L)) continue;   /* the page's footer and header */
    if(/^[A-Z][A-Za-z ]{2,40}$/.test(L) && !/[.:]$/.test(L) && L.split(" ").length <= 4){ if(out.length >= 2) break; else continue; }   /* the next heading */
    if(++gap > 4) break;
    cur.notes.push(L);
  }
  if(out.length < 2) return [];
  /* a note that runs on over two lines joins up */
  out.forEach(function(s){ var J = []; s.notes.forEach(function(x){ if(J.length && !/[.!?:]$/.test(J[J.length - 1]) && /^[a-z(]/.test(x)) J[J.length - 1] += " " + x; else J.push(x); }); s.notes = J.slice(0, 4); });
  return out;
}
function libFixLine(lines, r){
  var tidy = function(s){ s = String(s || "").replace(/\s+/g, " ").trim(); if(!s) return "";
    if(s.length > 220){ var cut = s.lastIndexOf("; ", 220); s = cut > 60 ? s.slice(0, cut) : s.slice(0, s.lastIndexOf(" ", 220)); }   /* whole steps, never a word cut in half */
    s = s.charAt(0).toUpperCase() + s.slice(1); return /[.!?]$/.test(s) ? s : s + "."; };
  for(var i = 0; i < lines.length; i++){
    var m = /^(?:correction|corrective action|repair|remedy|solution|service action)\s*[:\-–]\s*(.{6,220})$/i.exec(lines[i]); if(m) return tidy(m[1]);
    if(/^(?:correction|corrective action|repair|remedy|solution|service procedure|repair procedure)\s*:?$/i.test(lines[i]) && lines[i + 1]){
      var st0 = [], plain = "";
      for(var k = i + 1; k < Math.min(lines.length, i + 30) && st0.length < 4; k++){
        var nn = /^\d{1,2}[.)]\s+(.{4,120})$/.exec(lines[k]);
        if(nn) st0.push(nn[1].replace(/[.\s]+$/, ""));
        else if(!plain && !st0.length && lines[k].length > 20 && !/^(?:note\b|procedure$|.*following steps)/i.test(lines[k])) plain = lines[k];
      }
      if(st0.length >= 2) return tidy(st0.map(function(x, q){ return q ? x.charAt(0).toLowerCase() + x.slice(1) : x; }).join("; "));
      if(plain) return tidy(plain);
    }
  }
  var st = [];
  for(var j = 0; j < lines.length && st.length < 4; j++){ var n = /^\d{1,2}[.)]\s+(.{4,120})$/.exec(lines[j]); if(n) st.push(n[1].replace(/[.\s]+$/, "")); else if(st.length) break; }
  if(!st.length && r.proc && r.proc.steps && r.proc.steps.length) st = r.proc.steps.slice(0, 3).map(function(s){ return String(s.t || s.text || "").replace(/[.\s]+$/, ""); }).filter(Boolean);
  return st.length >= 2 ? tidy(st.map(function(s, k){ return k ? s.charAt(0).toLowerCase() + s.slice(1) : s; }).join("; ")).slice(0, 220) : "";
}
/* the words that point at a kind, for when the number doesn't say */
var LIB_KIND_WORDS = [["tsb", /\b(service bulletin|technical service bulletin|tsb)\b/gi], ["fsb", /\b(field service|dealer bulletin|fsb|campaign|service program)\b/gi],
  ["recall", /\b(recall|safety recall|nhtsa|transport canada)\b/gi], ["cbr", /\b(cbr|customer bulletin)\b/gi], ["codes", /\b(dtc|fault codes?|ftb)\b/gi],
  ["proc", /\b(impact|id\/operation|repair procedure)\b/gi], ["diag", /\b(diagnostics?|troubleshooting|fault tracing)\b/gi]];
function libKindGuess(one){
  return LIB_KIND_WORDS.map(function(w){ return { k: w[0], n: (one.match(w[1]) || []).length }; }).filter(function(x){ return x.n > 0; }).sort(function(a, b){ return b.n - a.n; });
}
function libTitleRules(t){
  (STATE.libRules || []).forEach(function(x){ if(x && x.drop){ var i = t.toLowerCase().indexOf(String(x.drop).toLowerCase()); if(i > -1) t = (t.slice(0, i) + t.slice(i + x.drop.length)).replace(/^[\s·:,–\-]+|[\s·:,–\-]+$/g, ""); } });
  return t.replace(/\s+/g, " ").trim();
}
function libReadMore(r, T, one){
  var lines = String(T || "").split("\n").map(function(l){ return l.trim(); }).filter(Boolean);
  r.lines = lines.slice(0, 400);
  if(r.title) r.title = libTitleRules(r.title);
  r.parts = libPartsIn(lines, r); r.labor = libLaborIn(one); r.chassis = libChassisIn(one); r.symp = libSymptomsIn(lines); r.fix = libFixLine(lines, r); r.steps = r.proc ? [] : libStepsIn(lines);
  /* the kind: a toss-up when the number gives none, or the words point firmly somewhere else */
  var G = libKindGuess(one), ruled = r.kind && r.kind !== "codes";
  r.toss = [];
  if(!r.kind && G.length) r.toss = G.slice(0, 2).map(function(x){ return x.k; });
  else if(ruled && r.how !== "Impact" && r.how !== "ID #" && G.length && G[0].k !== r.kind && G[0].n >= 2 && !G.some(function(x){ return x.k === r.kind; })){ r.toss = [r.kind, G[0].k]; r.kindRead = r.kind; r.kind = ""; }
  if(r.src && !r.src.model && r.model){ var ml = lines.filter(function(l){ return /\b(VNL|VNR|VNX|VHD|VAH|VN)\b/.test(l); })[0]; if(ml) r.src.model = ml; }
  if(r.src && !r.src.years && r.years){ var yl = lines.filter(function(l){ return /(?:19|20)\d\d\s*(?:[-–]|\+|and (?:newer|later))/i.test(l); })[0]; if(yl) r.src.years = yl; }
  /* the fields read from somewhere weak */
  var D = {};
  if(r.num && r.how === "file name") D.num = "Read from the file name, not the page";
  var flat = function(x){ return String(x || "").toLowerCase().replace(/[^a-z0-9]+/g, ""); };
  if(r.title && r.tHow === "line" && !(flat(r.title).length >= 8 && flat(r.fname).indexOf(flat(r.title)) > -1)) D.title = "Taken from the first line of the page — no Subject line";   /* the page and the file name agree: sure */
  if(r.title && r.tHow === "file") D.title = "Taken from the file name";
  if(r.model && !r.modelLbl && (!/(?:applies to|models?|vehicles?|trucks?)\s*:?[^.]{0,60}\b(VNL|VNR|VNX|VHD|VAH|VN)\b/i.test(one) || r.model.split(",").length > 2)) D.model = "Found in the text, not on an “Applies to” or “Model” line";
  if(r.years && !r.yearsLbl && !/(?:model years?|\bMY\b|years?|applies to)\s*:?[^.]{0,30}(?:19|20)\d\d/i.test(one)) D.years = "Found in the text, not on a “Model year” line";
  r.doubt = D;
}

/* ---------- on an operation: does it fit the truck, does it match the complaint, and using what it says ---------- */
/* { ok: true | false, why } or null when the RO says too little to tell */
function libFits(d, ro){
  if(!d || !ro) return null;
  var good = [], bad = [], ch = String(ro.chassis || "").replace(/\D/g, "");
  if(!ch){ var v = String(ro.vin || "").replace(/\s/g, ""); if(/\d{6}$/.test(v)) ch = v.slice(-6); }
  if((d.chassis || []).length && ch){
    var n = +ch, inR = d.chassis.some(function(x){ return n >= x[0] && n <= x[1]; });
    if(inR) good.push("chassis in range"); else bad.push("chassis " + ch + " is outside " + d.chassis.map(function(x){ return x[0] + "–" + x[1]; }).join(", "));
  }
  var rm = (/\b(VNL|VNR|VNX|VHD|VAH|VN)/i.exec(String(ro.model || "")) || [])[1];
  if(d.model && rm){
    rm = rm.toUpperCase(); var L = String(d.model).toUpperCase().split(/[,\s]+/).filter(Boolean);
    if(L.some(function(x){ return x === rm || (x === "VN" && /^VN/.test(rm)); })) good.push(rm); else bad.push(rm + " isn’t one of " + L.join(", "));
  }
  var yr = +ro.year, ym = /^((?:19|20)\d\d)(?:–((?:19|20)\d\d)|(\+))?$/.exec(String(d.years || ""));
  if(yr && ym){ var lo = +ym[1], hi = ym[2] ? +ym[2] : ym[3] ? 9999 : lo; if(yr >= lo && yr <= hi) good.push(String(yr)); else bad.push(yr + " is outside " + d.years); }
  if(!good.length && !bad.length) return null;
  return bad.length ? { ok: false, why: "Doesn’t fit this truck — " + bad.join(" · ") } : { ok: true, why: "Fits this truck — " + good.join(", ") };
}
var LIB_STOP = { with: 1, from: 1, when: 1, that: 1, this: 1, have: 1, into: 1, will: 1, after: 1, before: 1, there: 1, their: 1, during: 1, while: 1, also: 1, some: 1 };
function libWords(s){ return String(s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(function(w){ return w.length >= 4 && !LIB_STOP[w]; }); }
/* the document's symptom the complaint matches, or "" */
function libSympHit(d, text){
  var T = " " + libWords(text).join(" ") + " ", hit = "";
  (d && d.symp || []).some(function(s){ var W = libWords(s); if(W.length >= 2 && W.every(function(w){ return T.indexOf(" " + w.replace(/s$/, "")) > -1; })){ hit = s; return true; } return false; });
  return hit;
}
/* the newest release of a document the Library has */
function libLatest(d){
  if(!d) return d; var best = d;
  libDocs().forEach(function(x){ if(x && x !== d && x.kind === d.kind && x.num === d.num && (+x.rel || 0) > (+best.rel || 0)) best = x; });
  return best;
}
function libOlder(kind, num, rel){ return libDocs().filter(function(x){ return x && x.kind === kind && x.num === num && (+x.rel || 0) < (+rel || 0); }).sort(function(a, b){ return (+b.rel || 0) - (+a.rel || 0); })[0] || null; }
/* using it: parts onto the operation (once each), the hours as the quote, the repair as the Correction */
function libPartsNew(op, d){ var have = {}; (op.parts || []).forEach(function(p){ have[String(p.partNumber || "").replace(/\D/g, "")] = 1; }); return (d && d.parts || []).filter(function(x){ return !have[x.pn]; }); }
function libUseParts(ro, op, d){
  var L = libPartsNew(op, d); if(!L.length) return 0; op.parts = op.parts || [];
  L.forEach(function(x){ var np = { id: uid("pt"), description: x.desc || "", partNumber: x.pn, qty: String(x.qty || 1), status: "Not Ordered", eta: "", statusChangedAt: nowIso() }; op.parts.push(np); try{ invAddFromPart(np, ro && ro.roNumber); }catch(e){} });
  return L.length;
}
function libHoursOf(d){ var L = d && d.labor || []; return L.length ? L.reduce(function(a, x){ return a + x.hrs; }, 0) : 0; }
function libUseHours(op, d){ var h = Math.round(libHoursOf(d) * 10) / 10; if(h > 0) op.quoted = h; return h; }
function libUseFix(op, d){ if(!d || !d.fix) return false; try{ ccSetHand(op, "x", d.fix); }catch(e){ return false; } return true; }
