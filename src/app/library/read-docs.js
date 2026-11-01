/* Parsec · library · read-docs.js
   Reading a document: its kind from its number (CBR, TSB, FSB, Recall, Procedure), number, release, date, title, function group, model, model years, the codes it mentions, a DTC bulletin’s code table with FTBs, and an Impact procedure’s steps, warnings, tools and torques; Volvo’s function groups.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   libFgName libKind libKindOf libPrefixOf libFlat libDespace libOverlap libDespaceText libUnhyph libDate libSpaced libDocRead … (18 functions, 7 constants)
   state      libRules
   uses       state/
*/
/* ============================== reading a document (Parsec 17.1) ==============================
   libDocRead(text, fileName) turns the text of a Volvo PDF (or a screenshot of one) into the Library's fields:
   kind, number, release, date, title, function group, model, and the codes it mentions. A DTC bulletin also
   gives its table of codes (libDocCodeTable): each code's title, page and FTBs.
   Nothing is filed from here — the person sees the result and says File it (library/intake.js). */

/* the kinds, and the numbers that say which kind a document is (the shop's own rules; more are learned in STATE.libRules) */
var LIB_KINDS = [
  { k: "codes",  tab: "Fault codes", one: "Fault codes", dir: "Fault codes", page: true, file: true },   /* 17.1: a page of codes, and a kind you file (a DTC list) — the codes are read only for this kind */
  { k: "cbr",    tab: "CBRs",        one: "CBR",        dir: "CBR" },
  { k: "tsb",    tab: "TSBs",        one: "TSB",        dir: "TSB" },
  { k: "fsb",    tab: "FSBs",        one: "FSB",        dir: "FSB" },
  { k: "recall", tab: "Recalls",     one: "Recall",     dir: "Recalls" },
  { k: "models", tab: "Models",      one: "Model",      dir: "", page: true },   /* the truck pictures (trucks/), not documents */
  { k: "proc",   tab: "Procedures",  one: "Procedure",  dir: "Procedures" },
  { k: "diag",   tab: "Diagnostics", one: "Diagnostic", dir: "Diagnostics" }   /* 17.1: Impact's fault tracing and diagnostic steps, read like a procedure */
];
var LIB_NUM_RULES = [
  [/^(RVXX\d{4}|S\d{4}|C\d{4})$/, "recall"],               /* recalls: RVXX2601, S1234, C1234 */
  [/^(CBR-?\d{2,}|\d{3,4})$/, "cbr"],                        /* CBR-12, 123, 1234 */
  [/^(V-\d{3}-\d{3}[A-Z]?|\d{3}-\d{2})$/, "tsb"],            /* Impact's TSBs (V-412-002) and Service Bulletins by group (430-13) */
  [/^(S[A-Z]{2}\d{2}-\d{3}|PSM\d{2}-[A-Z0-9-]+)$/, "fsb"],   /* SNV23-002, SNM23-002, SBN25-119, SLV26-009, PSM26-M-NA-60 */
  [/^\d{4}-\d{2}-\d{2}-\d{2}$/, "proc"]                      /* Impact's ID/Operation: 4134-03-02-05 */
];
/* Volvo's function groups, the first two levels (as Impact shows them) */
var LIB_FG = { "0": "General", "1": "Service and maintenance", "2": "Engine", "3": "Electric system and instruments", "4": "Transmission", "5": "Brakes",
  "6": "Axles, suspensions and steering", "7": "Frame, springs, shocks and wheels", "8": "Body, cab and interior", "9": "Miscellaneous",
  "20": "General", "21": "Engine", "22": "Lubricating system", "23": "Fuel system", "24": "Fuel systems, gas operation", "25": "Intake and exhaust, turbo",
  "26": "Cooling system", "27": "Engine controls", "28": "Ignition and control systems", "29": "Miscellaneous",
  "30": "General", "31": "Battery and mountings", "32": "Alternator and regulator", "33": "Starter motor and relay", "35": "Lighting",
  "36": "Other electrical equipment", "37": "Cables and fuses", "38": "Instruments", "39": "Miscellaneous",
  "40": "General", "41": "Clutch", "42": "Special gearbox", "43": "Transmission", "45": "Drive shaft", "46": "Rear axle, drive shaft",
  "47": "Transmission and differentials combined", "48": "Power take-off", "49": "Miscellaneous",
  "50": "General", "51": "Wheel brakes", "52": "Hydraulic brake system", "55": "Parking brake", "56": "Compressed-air brakes",
  "57": "Trailer brake control and connections", "59": "Miscellaneous",
  "60": "General", "61": "Front wheel suspension", "64": "Steering", "65": "Rear wheel and rear axle suspension", "69": "Miscellaneous",
  "70": "General", "71": "Frame", "72": "Springs", "76": "Shock absorbers, anti-sway bars", "77": "Wheels, tires and hubs", "79": "Miscellaneous",
  "80": "General", "81": "Body and cab framework", "82": "Hood, front section, mudguards, footsteps", "83": "Doors and hatches",
  "84": "Exterior trim, glass and weatherstrips", "85": "Interior", "86": "Protective equipment", "87": "Temperature control system",
  "88": "Interior equipment", "89": "Miscellaneous",
  "90": "General", "91": "Hydraulic and servo systems", "92": "Mechanical equipment", "93": "Electrical equipment",
  "94": "Load handling, passenger lift", "95": "Load carriers, superstructure", "99": "Miscellaneous" };
/* "413" → "41 Clutch"; "4" → "4 Transmission" */
function libFgName(g){
  g = String(g || ""); if(!g) return "";
  var two = g.slice(0, 2), one = g.charAt(0);
  if(g.length >= 2 && LIB_FG[two]) return two + " " + LIB_FG[two];
  return LIB_FG[one] ? one + " " + LIB_FG[one] : g;
}
function libKind(k){ for(var i = 0; i < LIB_KINDS.length; i++) if(LIB_KINDS[i].k === k) return LIB_KINDS[i]; return null; }

/* which kind a number is: the shop's learned prefixes first, then the built-in rules */
function libKindOf(num){
  var n = String(num || "").toUpperCase().trim(); if(!n) return "";
  var R = STATE.libRules || [];
  for(var i = 0; i < R.length; i++) if(R[i] && R[i].pre && n.indexOf(String(R[i].pre).toUpperCase()) === 0) return R[i].kind;
  for(var j = 0; j < LIB_NUM_RULES.length; j++) if(LIB_NUM_RULES[j][0].test(n)) return LIB_NUM_RULES[j][1];
  return "";
}
/* the letters a number starts with — what a learned rule remembers (EC0033 → "EC") */
function libPrefixOf(num){ var m = /^[A-Z]+-?/.exec(String(num || "").toUpperCase()); return m ? m[0] : ""; }

/* ---------- small text helpers ---------- */
function libFlat(t){ return libDespaceText(String(t || "").replace(/\r/g, "")).replace(/[ \t\u00a0]+/g, " "); }
/* letter-spaced headings come out as single letters: "4 3 0" → "430", "S e r v i c e" → "Service" (three or more in a row, cell by cell) */
function libDespace(cell){
  var w = String(cell).split(" "), out = [], run = [];
  var flush = function(){ if(run.length >= 3) out.push(run.join("")); else out.push.apply(out, run); run = []; };
  w.forEach(function(x){ if(x.length === 1 && x !== "\u2022" && x !== "-") run.push(x); else { flush(); out.push(x); } });
  flush(); return out.join(" ");
}
/* bold text drawn twice comes out as overlapping pieces: "4 43 30 0" → "430"; a doubled word heading is page furniture and is dropped */
function libOverlap(cell){
  var w = String(cell).split(" ").filter(Boolean); if(w.length < 3) return null;
  var k = 0; for(var i = 1; i < w.length; i++) if(w[i].charAt(0) === w[i - 1].slice(-1)) k++;
  if(k / (w.length - 1) < 0.6) return null;
  var r = w[0]; for(var j = 1; j < w.length; j++) r += w[j].charAt(0) === r.slice(-1) ? w[j].slice(1) : " " + w[j];
  return /^[\d .()\/-]+$/.test(r) ? r : "";
}
function libDespaceText(t){ return String(t).split("\n").map(function(l){ return l.split("\t").map(function(c){ var o = libOverlap(c); return o != null ? o : libDespace(c); }).join("\t"); }).join("\n"); }
function libUnhyph(t){ return String(t || "").replace(/([a-z])-\s+([a-z])/g, "$1$2"); }
var LIB_MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
/* "August 23, 2023" · "2/17/2026" · "05.2026" · "9.2012" → "2023-08-23" / "2026-05" */
function libDate(s){
  s = String(s || "").trim(); var m, p2 = function(n){ return ("0" + n).slice(-2); };
  if((m = /^([A-Za-z]{3})[a-z]*\.? (\d{1,2}),? (\d{4})/.exec(s)) && LIB_MON[m[1].toLowerCase()]) return m[3] + "-" + p2(LIB_MON[m[1].toLowerCase()]) + "-" + p2(+m[2]);
  if((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s))) return m[3] + "-" + p2(+m[1]) + "-" + p2(+m[2]);
  if((m = /^(\d{1,2})\.(\d{4})$/.exec(s))) return m[2] + "-" + p2(+m[1]);
  if((m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(s))) return m[0];
  return "";
}
/* the lines that are the same on every Volvo page — never a title */
var LIB_BOILER = /^(volvo|trucks?\b|service bulletin|bulletin|date|group|no\.?|release|page|greensboro|north america|usa|contents|note:|copyright|impact \d|printed by|chassis id|model|publish date|path|identity|id\/operation|uptime|safety recall alert|safety recall|recall information|trucks dealer bulletin|to:|from:|subject:|region:|\d+ \/ \d+|\d+\(\d+\))/i;

/* page furniture anywhere on the line, and letter-spaced headings (V o l v o) */
var LIB_FURN = /volvo trucks|greensboro|north america|confidential/i;
function libSpaced(L){ var w = String(L).split(" "); return w.length >= 3 && w.filter(function(x){ return x.length === 1; }).length / w.length >= 0.6; }
/* ---------- the reader ---------- */
function libDocRead(text, fileName, pages){
  var raw = String(text || ""), T = libFlat(raw), lines = T.split("\n").map(function(l){ return l.trim(); }).filter(Boolean);
  var one = T.replace(/\n/g, " "), name = String(fileName || "").replace(/\.[a-z0-9]+$/i, "");
  var r = { kind: "", num: "", rel: "", date: "", title: "", fgrp: "", model: "", opNo: "", codes: [], table: [], how: "" }, m;

  /* Impact printouts: Path 413/…, ID/Operation 4134-03-02-05, Publish date 5/14/2025, Model VN */
  if((m = /ID\/Operation[\s\S]{0,40}?\b(\d{4}-\d{2}-\d{2}-\d{2}|V-\d{3}-\d{3}[A-Z]?)/i.exec(one))){   /* the label and its value can sit on different lines */
    r.num = m[1]; r.how = "Impact";
    if(/^\d{4}-/.test(m[1])) r.opNo = m[1];
    var pth = /Path\s+(\d{2,4})\//i.exec(one); if(pth) r.fgrp = pth[1];
    var pd = /Publish date[\s\S]{0,40}?(\d{1,2}\/\d{1,2}\/\d{4})/i.exec(one); if(pd) r.date = libDate(pd[1]);
    var pt = /Path\s+\d{2,4}\/[^\/\s]+\/([^\/\s]+)\//i.exec(one); if(pt) r.info = pt[1];   /* 413/Parts/Repair/Service → Repair */
    var tre = new RegExp(m[1].replace(/[-]/g, "\\-") + "[ \\t]*([A-Z][^\\n]{3,90})", "g"), tl;
    while((tl = tre.exec(T))) if(!/^(Copyright|Path|Identity|Publish)/.test(tl[1])){ r.title = tl[1].trim(); break; }
  }
  /* a safety recall's header row: 05.2026 RVXX2601 02 1(31) */
  if(!r.num && (m = /(\d{1,2}\.\d{4})\s+(?:Number\s+)?([A-Z]{1,4}\d{3,6}|\d{3,4})\s+(?:Release\s+)?(\d{2})\s+(?:Page\s+)?\d+\(\d+\)/.exec(one))){
    r.date = libDate(m[1]); r.num = m[2]; r.rel = m[3]; r.how = "header";
  }
  /* a Service Bulletin's header row: 9.2012 430 13 01 1(50), with or without the words between */
  if(!r.num && (m = /(\d{1,2}\.\d{4})\s+(?:Group\s+)?(\d{3})\s+(\d{2})\s+(?:No\.\s+)?(?:Release\s+)?(\d{2})\s+(?:Page\s+)?\d+\(\d+\)/.exec(one))){
    r.date = libDate(m[1]); r.num = m[2] + "-" + m[3]; r.rel = m[4]; r.fgrp = m[2]; r.how = "header";
  }
  /* a dealer bulletin or a recall alert: Bulletin: SNM23-002 · Date: August 23, 2023 · Subject: EGR Cooler */
  if(!r.num && (m = /Bulletin\s*:\s*([A-Z0-9][A-Z0-9-]{2,20})/i.exec(one))){ r.num = m[1].toUpperCase(); r.how = "Bulletin:"; }
  if(!r.date && (m = /\bDate\s*:\s*([A-Za-z]{3,9}\.? \d{1,2},? \d{4}|\d{1,2}\/\d{1,2}\/\d{4})/.exec(one))) r.date = libDate(m[1]);
  if(!r.title && (m = /Subject\s*:\s*([^\n]{3,120})/i.exec(T))) r.title = m[1].trim();
  /* a CBR, when it says so */
  if(!r.num && (m = /\b(CBR-?\s?\d{2,})\b/i.exec(one))){ r.num = m[1].toUpperCase().replace(/\s/g, ""); r.how = "CBR"; }
  /* the file's own name: RVXX2601.pdf, SNM23-002 EGR Cooler.pdf */
  if(!r.num){
    var tok = name.toUpperCase().split(/[\s_,()]+/).filter(Boolean);
    for(var i = 0; i < tok.length; i++) if(libKindOf(tok[i])){ r.num = tok[i]; r.how = "file name"; break; }
    /* a number Parsec doesn't know the kind of yet (EC0033): taken anyway — the person picks its tab once */
    if(!r.num && tok[0] && /^[A-Z]{1,5}-?\d{3,}[A-Z0-9-]*$/.test(tok[0])){ r.num = tok[0]; r.how = "file name"; }
    if(r.num && r.how === "file name" && !r.title){ var rest = name.replace(new RegExp("^\\s*" + r.num.replace(/[-]/g, "\\-") + "[\\s_,-]*", "i"), "").trim(); if(rest.length >= 4) r.title = rest; }
  }
  if(!r.rel && (m = /\brel(?:ease)?\.?\s*:?\s*(\d{1,2})\b/i.exec(name + " " + one))) r.rel = ("0" + m[1]).slice(-2);
  r.kind = libKindOf(r.num);
  if(r.kind === "proc" && /diagnos|fault trac|troubleshoot/i.test(r.info || "")) r.kind = "diag";   /* 17.1: Impact's Info type says Diagnostics */
  if(r.kind === "tsb" && !r.fgrp && (m = /^V-(\d{3})/.exec(r.num))) r.fgrp = m[1];

  /* the title: Subject:, Impact's line, else the first line that isn't page furniture */
  if(r.title) r.title = r.title.replace(new RegExp("^" + r.num.replace(/[-]/g, "\\-") + "\\s*", "i"), "").trim();
  if(!r.title){
    for(var k = 0; k < Math.min(lines.length, 40); k++){
      var L = lines[k].replace(/[“”"]/g, "");
      if(L.length < 6 || LIB_BOILER.test(L) || LIB_FURN.test(L) || libSpaced(L) || /^[\d\s.()\/-]+$/.test(L) || L === r.num || /\bpage \d+$/i.test(L) || /\d+\(\d+\)\s*$/.test(L)) continue;
      if(L.split(" ").length < 2 && !/[A-Z]{3}/.test(L)) continue;
      r.title = L.replace(new RegExp("^" + (r.num || "@@").replace(/[-]/g, "\\-") + "[\\s,:-]*"), "").slice(0, 120); break;
    }
  }
  r.title = libUnhyph(r.title).replace(/\s+/g, " ").trim();
  /* the control unit a DTC bulletin is about: Transmission Control Module (TCM) */
  r.mod = ((/\(([A-Z]{2,6})\)/.exec(r.title) || /Control (?:Module|Unit) \(([A-Z]{2,6})\)/.exec(one) || [])[1]) || "";
  /* which trucks: VN, VHD, VAH, VNL, VNR, VNX */
  var md = one.match(/\b(VNL|VNR|VNX|VHD|VAH|VN)\b(?:\s?\(\d\))?/g);
  if(md){ var seen = {}; r.model = md.map(function(x){ return x.replace(/\s/g, ""); }).filter(function(x){ if(seen[x]) return false; seen[x] = 1; return true; }).slice(0, 4).join(", "); }

  r.years = libYears(one);
  if(r.kind === "proc" || r.kind === "diag") r.proc = libProcRead(raw);   /* an Impact procedure: steps, warnings, tools, torques */
  r.table = libDocCodeTable(T);
  /* with the page positions, the FTB wording comes straight from its column */
  if(pages && r.table.length){ var byPos = libFtbFromPages(pages);
    r.table.forEach(function(row){ var F = byPos[row.key]; if(F && Object.keys(F).length) row.ftb = F; }); }
  r.codes = libCodesIn(T, r.num);
  r.table.forEach(function(row){ if(r.codes.indexOf(row.key) < 0) r.codes.push(row.key); });
  if(r.table.length >= 2){ r.numKind = r.kind; r.kind = "codes"; }   /* 17.1: a DTC list files as Fault codes — the codes are read only for that kind */
  return r;
}

/* ---------- a DTC bulletin's table of codes ---------- */
/* The contents list names each code with its page: “P1050, Transmission Range, Position”, page 5.
   Each code's section then lists its FTBs: FTB 17 • Voltage above normal… • Slow gear changes… */
function libDocCodeTable(T){
  var t = libUnhyph(libFlat(T)), out = [], byKey = {}, m;
  var re = /[“"]\s*([PCBU][0-9][0-9A-F]{3}),?\s+([^”"\n]{3,90}?)\s*[”"]\s*,\s*page\s+(\d+)/g;
  while((m = re.exec(t))){
    var key = m[1], title = m[2].replace(/\s+/g, " ").trim();
    if(byKey[key]){ if(byKey[key].alt.indexOf(title) < 0 && byKey[key].title !== title) byKey[key].alt.push(title); continue; }
    byKey[key] = { key: key, title: title, page: +m[3], alt: [], ftb: {} }; out.push(byKey[key]);
  }
  if(!out.length) return out;
  /* the body: each section starts where the code's own heading line is (not the contents entry) */
  var body = t.replace(re, " "), starts = [];
  out.forEach(function(row){
    var h = new RegExp("(^|\\n)\\s*" + row.key + "[ ,]+" + row.title.slice(0, 12).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), mm, at = -1;
    while((mm = h.exec(body))){ at = mm.index; break; }
    if(at >= 0) starts.push({ row: row, at: at });
  });
  starts.sort(function(a, b){ return a.at - b.at; });
  /* A bulletin prints its FTB table in three columns, so one code's wording can come out cut or mixed with the next column.
     The same FTB reads the same for every code, so each FTB takes the cleanest wording the whole bulletin gives it. */
  var cand = {}, CUT = /\s*(?:Fault Condition|Possible|Type of fault|FTB Description|Status\b|The\s|Volvo Trucks|Service Bulletin|Page\s\d|[A-Z](?: [a-z]){2,}).*$/;
  var clean = function(x){ return String(x || "").replace(CUT, "").replace(/[,;:\s]+$/, "").trim(); };
  var symOk = function(x){ return /^[A-Z][a-z]+(?: [a-z\/()-]+){1,6}$/.test(x) && !/normal|circuit|voltage|current|calibrat|status|signal|sensor|checksum|between|detected|range|when/i.test(x); };
  starts.forEach(function(s, i){
    var sec = body.slice(s.at, i + 1 < starts.length ? starts[i + 1].at : body.length);
    var parts = sec.split(/FTB\s+(\d{1,3})\b/);
    for(var j = 1; j < parts.length; j += 2){
      var n = parts[j], chunk = (parts[j + 1] || "").replace(/\s+/g, " ");
      var bul = chunk.split("\u2022").map(function(x){ return x.trim(); }).filter(Boolean);
      if(!bul.length || s.row.ftb[n]) continue;
      var d = clean(bul[0]); if(d){ cand[n] = cand[n] || {}; cand[n][d] = (cand[n][d] || 0) + 1; }
      var seen = {}, sym = bul.slice(1).map(clean).filter(function(x){ if(!symOk(x) || seen[x]) return false; seen[x] = 1; return true; }).slice(0, 3);
      s.row.ftb[n] = { d: d, s: sym.join("; ") };
    }
  });
  var best = {};
  Object.keys(cand).forEach(function(n){
    var L = Object.keys(cand[n]).sort(function(a, b){ var wa = a.split(" ").length >= 3, wb = b.split(" ").length >= 3;
      var ha = /-$/.test(a), hb = /-$/.test(b);
      return (ha - hb) || (wb - wa) || (cand[n][b] - cand[n][a]) || (b.length - a.length); });
    best[n] = L[0];
  });
  out.forEach(function(row){ Object.keys(row.ftb).forEach(function(n){ if(best[n]) row.ftb[n].d = best[n]; }); });
  return out;
}

/* ---------- the FTB table, read by where things sit on the page ---------- */
/* pages: [[{ x, y, w, s }]] — y down the page (library/read-files.js). Words close together on a line are one phrase;
   each “FTB 17” starts a row, and the bullets beside it mark where each column (Description · Condition · Symptoms · Cause)
   begins; the bullets in the symptoms column split its items. */
function libPhrases(items){
  var it = (items || []).filter(function(i){ return i && String(i.s || "").trim(); }).slice().sort(function(a, b){ return (a.y - b.y) || (a.x - b.x); }), lines = [], out = [];
  it.forEach(function(i){ var L = lines[lines.length - 1]; if(L && Math.abs(L[0].y - i.y) < 3) L.push(i); else lines.push([i]); });
  lines.forEach(function(L){
    L.sort(function(a, b){ return a.x - b.x; }); var cur = null;
    L.forEach(function(i){ var s = String(i.s).trim();
      if(cur && i.x - (cur.x + cur.w) < 9 && s.charAt(0) !== "\u2022"){   /* a bullet always starts its own phrase */ cur.s += " " + s; cur.w = i.x + (i.w || 0) - cur.x; }
      else { cur = { x: i.x, y: i.y, w: i.w || 0, s: s }; out.push(cur); } });
  });
  out.forEach(function(p){ if(libSpaced(p.s)) p.s = p.s.replace(/ /g, ""); p.s = p.s.replace(/\s+/g, " "); });
  return out;
}
function libFtbFromPages(pages){
  var res = {}, xs = null, cur = null, row = null;
  var join = function(a, b){ if(!a) return b; return /[a-z]-$/.test(a) && /^[a-z]/.test(b) ? a.slice(0, -1) + b : a + " " + b; };
  (pages || []).forEach(function(items){
    var P = libPhrases(items);
    /* the running header at the top of every page (Date · Group · No. · Release · Page) is not part of any row */
    var top = -1; P.forEach(function(p){ if(p.y < 90 && (/^(Date|Group|No\.|Release|Page|\d{1,2}\.\d{4}|\d+\(\d+\)|[\d ]{1,8})$/.test(p.s) || /^(VolvoTrucks|ServiceBulletin)/.test(p.s.replace(/ /g, "")))) top = Math.max(top, p.y); });
    P.sort(function(a, b){ return (a.y - b.y) || (a.x - b.x); }).forEach(function(p){
      var h = /^([PCBU][0-9][0-9A-F]{3}),?\s+\S/.exec(p.s);
      if(h && (!xs || p.x < xs[1])){ cur = h[1]; row = null; return; }
      var f = /^FTB\s?(\d{1,3})$/.exec(p.s);
      /* each FTB row's bullets sit at the left edge of every column: they give the columns */
      if(f && cur && p.y > top + 4){ var bx = P.filter(function(q){ return /^\u2022/.test(q.s) && q.y - p.y > -2 && q.y - p.y < 14 && q.x > p.x + 20; }).map(function(q){ return q.x; }).sort(function(a, b){ return a - b; });
        if(bx.length >= 3) xs = [p.x].concat(bx); }
      if(p.y <= top + 4 || !xs || !cur) return;
      var col = 0; for(var i = 0; i < xs.length; i++) if(xs[i] <= p.x + 3) col = i;
      if(f && col === 0){ row = { n: f[1], c: ["", "", "", "", ""], sym: [] }; var R = res[cur] = res[cur] || {}; if(!R[row.n]) R[row.n] = row; else row = { n: f[1], c: ["", "", "", "", ""], sym: [] }; return; }
      if(!row) return;
      var bul = /^\u2022/.test(p.s), t = p.s.replace(/^\u2022\s*/, "");
      if(col === 3){ if(bul || !row.sym.length) row.sym.push(""); if(t) row.sym[row.sym.length - 1] = join(row.sym[row.sym.length - 1], t); }
      else if(col > 0) row.c[col] = join(row.c[col], t);
    });
  });
  var out = {};
  Object.keys(res).forEach(function(k){ out[k] = {}; Object.keys(res[k]).forEach(function(n){ var r = res[k][n];
    out[k][n] = { d: r.c[1].trim(), s: r.sym.map(function(x){ return x.trim(); }).filter(function(x){ return x && x !== "N/A"; }).join("; ") }; }); });
  return out;
}

/* ---------- an Impact procedure: its steps, warnings, tools and torques (Parsec 17.1) ---------- */
/* raw = the PDF's text with its tabs (library/read-files.js). Steps are "39<tab>Tighten the screws to torque."; a Note, a
   WARNING / CAUTION / DANGER block or a "Tightening torque" block after a step belongs to that step; the ones before step 1
   are the procedure's own. Torques keep both units, lbf·ft shown first. */
var LIB_PROC_FURN = /^(Impact \d|Printed by:|Copyright to this documentation|written consent by the Volvo|The information contained herein|uncontrolled\.|\d+ \/ \d+$|f$)/;
function libProcRead(raw){
  var L = String(raw || "").replace(/\r/g, "").split("\n").map(function(l){ return l.replace(/ /g, " ").trim(); }).filter(function(l){ return l && !LIB_PROC_FURN.test(l); });
  var p = { warn: [], tools: [], material: [], steps: [], notes: [] }, cur = null, mode = "", blk = null, tq = null;
  var start = 0; for(var i = 0; i < L.length; i++) if(/^(WARNING|CAUTION|DANGER|Special tools|1\t)/.test(L[i])){ start = i; break; }
  var flushTq = function(){ if(!tq) return; var s = tq.join(" ").replace(/\t/g, " ").replace(/\s+/g, " "), t = libTorque(s); if(t) (cur ? (cur.tq = cur.tq || []) : (p.tq = p.tq || [])).push(t); tq = null; };
  var flushBlk = function(){ if(blk){ (cur ? (cur.warn = cur.warn || []) : p.warn).push(blk); blk = null; } };
  for(var j = start; j < L.length; j++){
    var l = L[j], m;
    if((m = /^(\d{1,3})\t(.+)$/.exec(l)) && (!cur || +m[1] === cur.n + 1)){ flushTq(); flushBlk(); mode = ""; cur = { n: +m[1], t: m[2].replace(/\t/g, " ").replace(/\s+\./, ".").replace(/\s{2,}/g, " ").trim() }; p.steps.push(cur); continue; }
    if(/^(WARNING|CAUTION|DANGER)$/.test(l)){ flushTq(); flushBlk(); blk = { lv: l, t: [] }; mode = "blk"; continue; }
    if(l === "Note"){ flushTq(); flushBlk(); mode = "note"; continue; }
    if(l === "Tightening torque"){ flushTq(); flushBlk(); tq = []; mode = "tq"; continue; }
    if(l === "Special tools"){ flushTq(); flushBlk(); mode = "tools"; continue; }
    if(l === "Required material"){ flushTq(); flushBlk(); mode = "mat"; continue; }
    if(l === "Conditions"){ flushTq(); flushBlk(); mode = "note"; continue; }
    if(mode === "tq"){ tq.push(l); if(/lb\s*⋅?\s*ft\)?/i.test(l)){ flushTq(); mode = ""; } continue; }
    if(mode === "tools"){ l.split("\t").forEach(function(x){ x = x.trim(); if(/^\d{6,9}$/.test(x) && p.tools.indexOf(x) < 0) p.tools.push(x); }); continue; }
    if(mode === "mat"){ var c = l.split("\t").map(function(x){ return x.trim(); }).filter(Boolean); if(c.length >= 2 && /^\d{6,9}$/.test(c[c.length - 1])) p.material.push([c.slice(0, -1).join(" "), c[c.length - 1]]); else mode = ""; continue; }
    if(mode === "blk" && blk){ blk.t.push(l.replace(/^▶\s*/, "").replace(/\t/g, " ")); continue; }
    if(mode === "note"){ var tx = l.replace(/^[●▶]\s*/, "").replace(/\t/g, " "); if(cur) (cur.notes = cur.notes || []).push(tx); else p.notes.push(tx); continue; }
    /* a line that runs on from the step before */
    if(cur && !mode && cur.t.length < 200 && /^[a-z(]/.test(l)) cur.t += " " + l.replace(/\t/g, " ");
  }
  flushTq(); flushBlk();
  /* lines that wrapped inside a warning: join them back into sentences */
  var join = function(b){ var out = []; b.t.forEach(function(x){ if(out.length && /^[a-z"(]/.test(x)) out[out.length - 1] += " " + x; else out.push(x); }); b.t = out; return b; };
  p.warn.forEach(join); p.steps.forEach(function(s){ (s.warn || []).forEach(join); });
  return p;
}
/* "Clutch cylinder, screw 45 ±5 Nm (33 ±4 lb ⋅ ft)" → { what, nm: "45 ±5", lbf: "33 ±4" } */
function libTorque(s){
  var m = /^(.*?)\s*(?:Screws\s+)?(\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?)\s*(±\s*\d+(?:[.,]\d+)?)?\s*Nm\s*\(\s*(\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?)\s*(±\s*\d+(?:[.,]\d+)?)?\s*lb\s*⋅?\s*ft\s*\)/i.exec(s);
  if(!m) return null;
  var sp = function(a, b){ return (a + (b ? " " + b.replace(/\s+/g, "") : "")).replace(/\s*[–-]\s*/, "–"); };
  return { what: m[1].replace(/\s+Screws$/i, "").trim(), nm: sp(m[2], m[3]), lbf: sp(m[4], m[5]) };
}
/* the model years a document says it fits: "2017+", "MY2017-2024", "2017–2024 model years" */
function libYears(t){
  var m = /\b(?:MY\s?)?((?:19|20)\d\d)\s*(?:[-–]\s*((?:19|20)?\d\d)|(\+|\s+and (?:newer|later)))(?=\s|$|[.,)])/i.exec(String(t || ""));
  if(!m) return "";
  return m[2] ? m[1] + "–" + (m[2].length === 2 ? m[1].slice(0, 2) + m[2] : m[2]) : m[1] + "+";
}
