/* ============================== Parsec 12 — the New RO import from ASIST ==============================
   Paste the case page or drop screenshots (or the PDF) into New RO, or into Import on an open RO. Every piece is read
   on this computer and merged into what was read so far; Parsec finds the RO (RO #, case #, VIN, unit), then shows what
   would change — New (was empty), Updated (ASIST changed it and nobody touched it here), Kept yours (changed here by hand;
   ASIST's value shows beside it), Same — and nothing changes until Create RO or Apply. The RO remembers what each import
   wrote (ro.imp), so the next import knows which values are ASIST's and which are yours. */
var IMPX = (function(){
  /* ---------------------------------------------------------------- reading the text */
  var MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
  function pad(n){ return ("0" + n).slice(-2); }
  /* "10/29/2026 3:00 PM", "10/29/26 15:00", "Oct 29, 2026 3:00 PM", "2026-10-29 15:00" → a local date-time, as ISO */
  function parseWhen(s){
    s = String(s || "").replace(/\s+/g, " ").trim(); if(!s) return "";
    var y, mo, d, h = 0, mi = 0, m, now = new Date();
    if((m = /(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s))){ y = +m[1]; mo = +m[2]; d = +m[3]; }
    else if((m = /(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/.exec(s))){ mo = +m[1]; d = +m[2]; y = +m[3]; if(y < 100) y += 2000; }
    else if((m = /\b(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?/i.exec(s))){ mo = MON[m[1].toLowerCase()]; d = +m[2]; y = m[3] ? +m[3] : now.getFullYear(); }
    else return "";
    if(!(mo >= 1 && mo <= 12 && d >= 1 && d <= 31 && y >= 1990 && y <= 2100)) return "";
    var t = /(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp])?\.?\s*[Mm]?\.?/.exec(s.slice(m.index + m[0].length));
    if(t){ h = +t[1]; mi = +t[2]; if(t[3]){ var pm = /p/i.test(t[3]); if(pm && h < 12) h += 12; if(!pm && h === 12) h = 0; } if(h > 23 || mi > 59){ h = 0; mi = 0; } }
    else h = 8;   /* a date with no time: the start of the day */
    return new Date(y, mo - 1, d, h, mi).toISOString();
  }
  function whenTxt(iso){ if(!iso) return ""; var d = new Date(iso); if(isNaN(d)) return String(iso);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase(); }
  function whenIn(iso){ if(!iso) return ""; var d = new Date(iso); if(isNaN(d)) return ""; return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function money(v){ var m = /\$?\s*(-?\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|-?\d+(?:\.\d{1,2})?)/.exec(String(v || "")); return m ? +m[1].replace(/,/g, "") : null; }
  function usd(n){ return "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  /* "CHO, JENNA" or "JENNA CHO" → "Jenna Cho" */
  function nameCase(n){
    n = String(n || "").replace(/\s*[\(\[#].*$/, "").replace(/\s+\d.*$/, "").replace(/[^A-Za-z .,'\-]/g, "").replace(/\s+/g, " ").replace(/^[\s.,'\-]+|[\s.,'\-]+$/g, "").trim();
    var lf = /^([A-Za-z'\-]+),\s*([A-Za-z'\-]+(?:\s+[A-Za-z]\.?)?)$/.exec(n); if(lf) n = lf[2] + " " + lf[1];
    n = n.replace(/,/g, "").trim();
    if(n === n.toUpperCase() || n === n.toLowerCase()) n = n.toLowerCase().replace(/(^|[\s'\-])([a-z])/g, function(_, a, b){ return a + b.toUpperCase(); });
    return /^[A-Za-z][A-Za-z .'\-]{1,40}$/.test(n) && n.split(" ").length <= 4 ? n : "";
  }
  /* the labels on ASIST's case page — a value follows on the same line (": value", the next cell) or on the next line */
  var LB = [
    ["caseNo", /^case\s*(?:#|no\.?|number)?(?=\s*[:#]|\s+\d|\s*$)/i],
    ["roNumber", /^(?:ro|r\.o\.|repair\s*order)\s*(?:#|no\.?|number)?(?=\s*[:#]|\s+[A-Z0-9]|\s*$)/i],
    ["customer", /^(?:customer(?:\s*name)?|company)(?=\s*:|\s*$)/i],
    ["status", /^(?:case\s*)?status(?=\s*:|\s*$|\s+[A-Z])/i],
    ["etr", /^(?:etr|est(?:imated)?\.?\s*time\s*(?:of|to)\s*repair|estimated\s*(?:completion|ready))(?=\s*:|\s*$|\s+\d)/i],
    ["followUp", /^follow[\s-]*up(?:\s*(?:date|time))?(?=\s*:|\s*$|\s+\d)/i],
    ["createdBy", /^(?:created|opened)\s*by(?=\s*:|\s*$|\s+[A-Z])/i],
    ["checkedIn", /^(?:asset\s*)?checked[\s-]*in(?:\s*(?:date|on|at))?(?=\s*:|\s*$|\s+\d)|^check[\s-]*in\s*(?:date|time)(?=\s*:|\s*$|\s+\d)/i],
    ["po", /^(?:po|p\.o\.|purchase\s*order)\s*(?:#|no\.?|number)?(?=\s*[:#]|\s+[A-Z0-9]|\s*$)/i],
    ["auth", /^auth(?:orization)?\.?\s*(?:#|no\.?|number|code)?(?=\s*[:#]|\s+[A-Z0-9]|\s*$)/i],
    ["ts", /^tech(?:nical)?\s*support\s*case\s*(?:#|no\.?|number)?(?=\s*[:#]|\s+\d|\s*$)/i],
    ["make", /^make(?=\s*:|\s*$|\s+[A-Z])/i],
    ["model", /^(?:truck\s*|vehicle\s*|unit\s*)?model(?!\s*year)(?=\s*:|\s*$|\s+[A-Z0-9])/i],
    ["year", /^(?:model\s*)?year(?=\s*:|\s*$|\s+\d)/i],
    ["vin", /^vin(?:\s*#)?(?=\s*:|\s*$|\s+[A-Z0-9])/i],
    ["unit", /^unit\s*(?:#|no\.?|number)?(?=\s*[:#]|\s+[A-Z0-9]|\s*$)/i],
    ["chassis", /^(?:chassis|serial)\s*(?:#|no\.?|number)?(?=\s*[:#]|\s+[A-Z0-9]|\s*$)/i],
    ["engineSerial", /^engine\s*(?:serial|s\/n|sn)\s*(?:#|no\.?|number)?(?=\s*[:#]|\s+[A-Z0-9]|\s*$)/i],
    ["engHours", /^engine\s*hours?(?=\s*:|\s*$|\s+\d)/i],
    ["engine", /^engine(?:\s*(?:model|make|type|description))?(?!\s*(?:serial|s\/n|sn|hours?))(?=\s*:|\s*$|\s+[A-Z0-9])/i],
    ["miles", /^(?:odometer|mileage|miles)(?=\s*:|\s*$|\s+\d)/i],
    ["tag", /^(?:key\s*)?tag\s*(?:#|no\.?)?(?=\s*[:#]|\s+[A-Z0-9]|\s*$)/i],
    ["location", /^(?:on[\s-]*site\s*)?(?:asset\s*)?location(?=\s*:|\s*$|\s+[A-Z0-9])/i],
    ["dept", /^dep(?:artmen)?t\.?(?=\s*:|\s*$|\s+[A-Z])/i],
    ["complaint", /^(?:case\s*level\s*)?complaint(?:\s*description)?(?=\s*:|\s*$)/i],
    ["cause", /^(?:case\s*level\s*)?cause(?:\s*description)?(?=\s*:|\s*$)/i],
    ["correction", /^(?:case\s*level\s*)?correction(?:\s*description)?(?=\s*:|\s*$)/i]
  ];
  var LONG = { complaint: 1, cause: 1, correction: 1 };
  /* section headings that end a long value or a region */
  var HEAD = /^(?:operations?|user\s*notes?|system\s*notes?|case\s*notes?|notes|comments|totals?(?:\s*summary)?|case\s*level\s*actions|print\/pdf\s*actions|customer\s*info|asset(?:\s*info(?:rmation)?)?|parts|technician\s*story|tech\s*story)\s*:?$/i;
  function splitCells(l){ return String(l).split(/\t+|\s{2,}|\s*[|¦]\s*/).map(function(c){ return c.trim(); }).filter(Boolean); }
  /* a cell can hold "Label: value Label2: value2" — cut it at each known label that's followed by a colon */
  var MID = /(?<!\b(?:Engine|Asset|Model|On-?site|Support|Key))\s(?=(?:RO|PO|Auth|Status|ETR|Follow[\s-]*up|Created by|Checked in|Make|Model|Year|VIN|Unit|Serial|Chassis|Engine(?:\s*(?:Serial|Hours))?|Odometer|Mileage|Tag|Location|Department|Dept|Cust(?:omer)?)\s*(?:#|No\.?)?\s*:)/i;
  function cellsOf(l){ var out = []; splitCells(l).forEach(function(c){ c.split(MID).forEach(function(x){ x = x.trim(); if(x) out.push(x); }); }); return out; }
  function labelOf(c){ for(var i = 0; i < LB.length; i++){ var m = LB[i][1].exec(c); if(m) return { k: LB[i][0], m: m }; } return null; }
  var STRONG = /^(?:ro|po|auth|etr|vin|make|model|year|unit|serial|chassis|engine|odometer|mileage|miles|tag|location|department|dept|customer|company|follow|created|case|tech)\b/i;
  function labelish(c){ return !!labelOf(c) && (/[:#]/.test(c) || STRONG.test(c)); }
  function isLabelCell(c){ var L = labelOf(c); return !!(L && !c.slice(L.m[0].length).replace(/^[\s:#.\-–]+/, "").trim()); }
  function clean(k, v){
    v = String(v || "").replace(/\[\s*(edit|external)\s*\]/gi, "").replace(/^[\s:#.\-–•*]+/, "").replace(/\s+/g, " ").trim();
    if(!v || /^(none|n\/a|na|--?|—|null|not set|tbd)\.?$/i.test(v)) return "";
    var m;
    switch(k){
      case "caseNo": m = /\b([A-Z]?-?\d{4,10})\b/i.exec(v); return m ? m[1] : "";
      case "roNumber": m = /\b(R[AO][\s-]?\d{4,12}|\d{5,12})\b/i.exec(v.replace(/[Oo](?=\d)/g, "0")); return m ? m[1].replace(/\s/g, "").toUpperCase() : "";
      case "customer": return v.replace(/\s*[-–]?\s*cust(?:omer)?\s*#.*$/i, "").replace(/…|\.\.\.$/, "").trim().slice(0, 60);
      case "status": return /[A-Za-z]{3}/.test(v) ? v.replace(/\s{2,}.*$/, "").slice(0, 40) : "";
      case "etr": case "followUp": case "checkedIn": return parseWhen(v);
      case "createdBy": return nameCase(v);
      case "po": case "auth": case "ts": case "unit": case "tag": case "chassis": case "engineSerial":
        m = /^([A-Z0-9][A-Z0-9\-\/.]*)/i.exec(v); return m && m[1].length <= 24 && (k !== "ts" || /\d/.test(m[1])) && !/^(#|no)$/i.test(m[1]) ? m[1].toUpperCase() : "";
      case "make": m = /^([A-Za-z][A-Za-z\-]{1,20})/.exec(v); return m ? m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase() : "";
      case "model": v = v.replace(/\s{2,}.*$/, "").replace(/\b(?:year|vin|unit|serial|engine)\b.*$/i, "").trim(); return v.length <= 28 && !/^\d{4}$/.test(v) && /[A-Za-z]/.test(v) ? v : "";
      case "year": m = /\b(19[89]\d|20\d{2})\b/.exec(v); return m ? m[1] : "";
      case "vin": return vinFrom(v);
      case "engine": v = v.replace(/\b(?:serial|s\/n|engine\s*hours)\b.*$/i, "").trim(); return v.length <= 40 && /[A-Za-z0-9]/.test(v) && !/^(volvo|mack|cummins|detroit)$/i.test(v) ? v : (/^(volvo|mack|cummins|detroit)$/i.test(v) ? v : "");
      case "miles": case "engHours": m = /^([\d,]{1,11})(?:\.\d+)?/.exec(v.replace(/\s/g, "")); if(!m) return ""; var n0 = m[1].replace(/,/g, ""); return n0 && +n0 <= (k === "miles" ? 9999999 : 999999) ? n0 : "";
      case "location": case "dept": return v.replace(/\s{2,}.*$/, "").slice(0, 30);
      default: return v;
    }
  }
  /* OCR reads 0 as O and 1 as I — a VIN has neither */
  function vinFrom(v){
    var t = String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    var c = t.match(/[A-Z0-9]{17}/g) || [];
    var fix = function(x){ return x.replace(/O/g, "0").replace(/[IL](?=\d|$)/g, "1").replace(/Q/g, "0"); };
    for(var i = 0; i < c.length; i++){ if(vinValid(c[i])) return c[i]; if(vinValid(fix(c[i]))) return fix(c[i]); }
    return c[0] ? fix(c[0]) : "";
  }
  /* the RO's own fields, by label */
  function readFields(L){
    var f = {};
    for(var i = 0; i < L.length; i++){
      if(isPartsHead(L[i]) || /\bop\s*#|\boperation\b.*\b(?:labor|approval)\b/i.test(L[i])) continue;   /* a table's header row isn't label: value */
      var C = cellsOf(L[i]);
      for(var ci = 0; ci < C.length; ci++){
        var lb = labelOf(C[ci]); if(!lb || f[lb.k]) continue;
        var k = lb.k, rest = C[ci].slice(lb.m[0].length).replace(/^[\s:#.\-–]+/, "").trim();
        if(LONG[k]){
          var txt = rest, j = i + 1;
          if(ci + 1 < C.length && !rest) txt = C.slice(ci + 1).join(" ");
          for(; j < L.length && j < i + 8; j++){ var lj = L[j].trim(); if(HEAD.test(lj) || labelOf(splitCells(lj)[0] || "") || /^\d{1,2}[.)]?\s/.test(lj)) break; txt += " " + lj; }
          var tv = sentenceCase(clean(k, txt)); if(tv) f[k] = tv;
          continue;
        }
        var val = rest;
        if(!val && ci + 1 < C.length && !labelish(C[ci + 1])) val = C[ci + 1];
        if(!val && ci === C.length - 1 && i + 1 < L.length){ var nx = cellsOf(L[i + 1]); if(nx[0] && !labelish(nx[0]) && !HEAD.test(nx[0])) val = nx[0]; }
        var cv = clean(k, val); if(cv) f[k] = cv;
      }
    }
    return f;
  }
  /* "Summit Freightways - Cust# 20417" lines, the case number on its own, the RO anywhere */
  function readLoose(text, L, f){
    var m;
    if(!f.custNo && (m = /cust(?:omer)?\s*#\s*:?\s*([A-Z0-9\-]{2,12})/i.exec(text))) f.custNo = m[1].toUpperCase();
    if(!f.customer) for(var i = 0; i < L.length; i++){ var cm = /^(.{3,60}?)\s*[-–]\s*cust(?:omer)?\s*#/i.exec(L[i].replace(/^case\s*\d+\s*[|·\t-]*\s*/i, "")); if(cm && /[A-Za-z]{3}/.test(cm[1])){ f.customer = cm[1].trim(); break; } }
    if(!f.caseNo && (m = /(?:^|\n)\s*case\s*#?\s*:?\s*(\d{6,10})\b/i.exec(text))) f.caseNo = m[1];
    if(!f.roNumber && (m = /\b(R[AO]\d{6,12})\b/.exec(text.replace(/\bR([AO])O(?=\d)/g, "R$10")))) f.roNumber = m[1];
    if(!f.vin){ var vv = vinFrom((text.toUpperCase().match(/\b[A-HJ-NPR-Z0-9OIQ]{17}\b/g) || []).join(" ")); if(vv && /^[A-HJ-NPR-Z0-9]{17}$/.test(vv) && vinValid(vv)) f.vin = vv; }
    if(!f.miles && (m = /Last Updated:\s*([\d,]+)\s*miles/i.exec(text))) f.miles = m[1].replace(/,/g, "");
    if(!f.engHours && (m = /Last Updated:\s*([\d,]+)\s*hours/i.exec(text))) f.engHours = m[1].replace(/,/g, "");
    return f;
  }
  /* ---- operations: a numbered line starts one; what follows (codes, the story, its parts) belongs to it ---- */
  var AP = /\b(Approved|Pending|Declined|Not Approved|Awaiting Approval|Approval Pending|Pre-?Approved)\b/i;
  var OPH = /^\s*(?:op(?:eration)?\.?\s*#?\s*)?(\d{1,2})\s*[.):\-–]?\s+(?=[A-Za-z])(.+)$/i;
  var OPLBL = { opCode: /\b(?:op(?:eration)?\s*code|job\s*code|labor\s*code)\s*[:#]?\s*([A-Z0-9][A-Z0-9\-\/.]{1,14})/i, vmrs: /\bvmrs(?:\s*code)?\s*[:#]?\s*(\d{3}[-\s]?\d{3}[-\s]?\d{3}|\d{3}-\d{3})/i,
    skill: /\bskill(?:\s*(?:level|code))?\s*[:#]?\s*([A-Z0-9]{1,6})\b/i, priceCode: /\bprice\s*code\s*[:#]?\s*([A-Z0-9]{1,8})\b/i, label: /\blabel(?:\s*status)?\s*[:#]?\s*((?:not\s+)?[A-Za-z][A-Za-z\-]{2,20}(?:\s+[A-Za-z]{3,12})?)/i };
  var PTH = /\b(part\s*(?:#|no\.?|number)|description|qty|quantity|unit(?:\s*price)?|price|core|ext(?:ended)?|salesman|sales\s*person)\b/gi;
  function isPartsHead(l){ var h = String(l).match(PTH) || []; return h.length >= 3; }
  function isPn(t){ return /\d/.test(t) && /^[A-Z0-9][A-Z0-9\-\/.]{3,}$/i.test(t) && !/^\$?[\d,]+\.\d{2}$/.test(t) && !/^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/.test(t) && !/^\d{1,3}$/.test(t) && !/^\d{3}-\d{3}-\d{3}$/.test(t); }
  /* one part line: Part # · Description · Qty · Unit · Core · Ext · Salesman (in the header's order when there is one) */
  function partLine(l, cols){
    var C = splitCells(l); if(C.length < 2) C = String(l).split(/\s+/);
    var pn = "", qty = "", desc = [], mon = [], who = "";
    C.forEach(function(c, i){
      var cc = c.replace(/^\$\s*/, "$");
      if(!pn && isPn(c) && !/\s/.test(c)) pn = c.toUpperCase();
      else if(/^\$?-?[\d,]+\.\d{2}$/.test(cc.replace(/\s/g, ""))) mon.push(money(cc));
      else if(!qty && /^(?:x?\d{1,3}(?:\.0+)?)$/i.test(c)) qty = String(parseFloat(c.replace(/x/i, "")));
      else if(/[A-Za-z]{2}/.test(c)){
        if(i === C.length - 1 && desc.length && /^[A-Z][a-z'\-]+(?:\s+[A-Z][a-z'\-]+){1,2}$|^[A-Z'\-]+,\s*[A-Z'\-]+$/.test(c)) who = nameCase(c);
        else desc.push(c);
      }
    });
    if(!pn || (!mon.length && !qty)) return null;
    var p = { pn: pn, desc: desc.join(" ").replace(/\s+/g, " ").trim(), qty: qty || "1", price: null, core: null, ext: null, salesman: who };
    var order = cols && cols.length ? cols : ["unit", "core", "ext"], q = parseFloat(p.qty) || 1;
    if(mon.length >= 3){ var o = order.filter(function(x){ return x === "unit" || x === "core" || x === "ext"; }); if(o.length < 3) o = ["unit", "core", "ext"]; o.forEach(function(x, i){ if(i < mon.length) p[x === "unit" ? "price" : x] = mon[i]; }); }
    else if(mon.length === 2){ if(Math.abs(mon[0] * q - mon[1]) <= Math.max(.02, mon[1] * .01) || order.indexOf("core") < 0 || order.indexOf("ext") < order.indexOf("core")){ p.price = mon[0]; p.ext = mon[1]; } else { p.price = mon[0]; p.core = mon[1]; } }
    else if(mon.length === 1) p.price = mon[0];
    if(p.ext != null && p.price != null && p.core == null){ var c0 = Math.round((p.ext - p.price * q) * 100) / 100; if(c0 > 0.004) p.core = c0; }
    if(p.core == null) p.core = 0;
    if(p.desc) p.desc = p.desc.charAt(0).toUpperCase() + p.desc.slice(1);
    return p;
  }
  function colsOf(l){ var o = []; String(l).replace(PTH, function(w){ w = w.toLowerCase(); o.push(/^unit|^price/.test(w) ? "unit" : /^core/.test(w) ? "core" : /^ext/.test(w) ? "ext" : /^sales/.test(w) ? "sales" : /^q/.test(w) ? "qty" : /^desc/.test(w) ? "desc" : "pn"); return w; }); return o; }
  function readOps(L){
    var ops = [], cur = null, cols = null, inOps = false, story = null, loose = [], endAt = -1, lblCol = false;
    var opsHead = function(l){ return /^\s*operations?\b/i.test(l) && (/approval|labor|status|hours/i.test(l) || l.trim().length < 14); };
    for(var i = 0; i < L.length; i++){
      var l = L[i], t = l.trim();
      if(opsHead(t)){ inOps = true; continue; }
      if(/^(?:user\s*notes?|system\s*notes?|case\s*notes?|notes|comments|totals?(?:\s*summary)?|case\s*level\s*actions|print\/pdf)\b/i.test(t)){ if(cur){ ops.push(cur); cur = null; } inOps = false; story = null; endAt = i; continue; }
      if(/\bop\s*#|operation\b.*\b(labor|approval|hours)/i.test(t) && !OPH.test(t)){ inOps = true; if(/label/i.test(t)) lblCol = true; continue; }   /* the table's own header */
      if(isPartsHead(t)){ cols = colsOf(t); story = null; continue; }
      var hm = OPH.exec(t);
      var looksOp = hm && (inOps || /^\s*op(?:eration)?\.?\s*#?\s*\d/i.test(t) || AP.test(t) || /\b\d{1,2}\.\d{1,2}\b/.test(t) || /\$\s?\d/.test(t)) && !partLine(t, cols) && !/^\d{1,2}[\/-]\d{1,2}/.test(t);
      if(looksOp){
        if(cur) ops.push(cur);
        var rest = hm[2], nm = cjNamePart(rest) || rest.replace(/\s{2,}.*$/, "");
        cur = { no: +hm[1], name: cjClean(nm), hours: null, price: null, approval: "", label: "", opCode: "", vmrs: "", skill: "", priceCode: "", story: "", storyBy: "", parts: [] };
        var after0 = rest.slice(rest.indexOf(nm) + nm.length);
        var ap = AP.exec(rest); if(ap) cur.approval = normAp(ap[1]);
        if(ap && lblCol){ var cl = splitCells(rest), ai = -1; cl.forEach(function(c, x){ if(AP.test(c)) ai = x; }); if(ai > -1 && cl[ai + 1] && /[A-Za-z]{3}/.test(cl[ai + 1]) && !/\$|\d/.test(cl[ai + 1])) cur.label = cl[ai + 1].replace(/\b\w/g, function(c){ return c.toUpperCase(); }); }
        cur.hours = cjHours(after0.replace(AP, " ")); cur.price = cjCost(after0.replace(AP, " "), cur.hours);
        grabCodes(cur, t); story = null; inOps = true; continue;
      }
      if(cur){
        /* a long name wraps onto the next line: letters only, no numbers, before anything else of the op */
        if(!cur.parts.length && !story && /^[a-z][a-z ,\-]{2,30}$/i.test(t) && t.split(/\s+/).length <= 4 && !labelOf(t) && !AP.test(t) && !/story|code|skill|vmrs|label/i.test(t) && i > 0 && OPH.test(L[i - 1].trim())){ cur.name = cjClean(cur.name + " " + t); continue; }
        var sm = /^(?:technician|tech)\s*story\b\s*(.*)$/i.exec(t);
        if(sm){ story = cur; var st0 = sm[1] || "", bm = /^(?:by\s+)?([A-Za-z][A-Za-z'\-]+(?:,?\s+[A-Za-z][A-Za-z'\-]+){1,2})\s*[:\-–]\s*(.*)$/.exec(st0);
          if(bm && /^by\s/i.test(st0) || bm && nameCase(bm[1]) && bm[1].split(/\s+/).length <= 3 && /^[A-Z]/.test(bm[1])){ cur.storyBy = nameCase(bm[1]) || cur.storyBy; st0 = bm[2]; } else st0 = st0.replace(/^[:\-–]\s*/, "");
          cur.story = st0.trim(); continue; }
        var pl = partLine(t, cols);
        if(pl){ addPart(cur.parts, pl); story = null; continue; }
        var gotCode = grabCodes(cur, t);
        if(story && !gotCode && !isPartsHead(t)){ cur.story = (cur.story ? cur.story + " " : "") + t; continue; }
        if(!gotCode){
          var ap2 = AP.exec(t); if(ap2 && !cur.approval) cur.approval = normAp(ap2[1]);
          var lh = /labor\s*hours?\s*[:#]?\s*(\d{1,3}(?:\.\d{1,2})?)/i.exec(t); if(lh) cur.hours = +lh[1]; else if(cur.hours == null && /^\s*[\d.]+\s*(h|hr|hrs|hours?)?\s*$/i.test(t)) cur.hours = cjHours(t);
          var lp = /labor(?:\s*(?:price|amount|total|\$))?\s*[:#]?\s*\$\s?([\d,]+\.\d{2})/i.exec(t); if(lp) cur.price = money(lp[1]);
          var by = /^(?:technician|tech|assigned(?:\s*tech)?)\s*[:#]\s*([A-Za-z ,.'\-]{3,40})$/i.exec(t); if(by) cur.storyBy = cur.storyBy || nameCase(by[1]);
        }
        continue;
      }
      var pl2 = partLine(t, cols); if(pl2) addPart(loose, pl2);
    }
    if(cur) ops.push(cur);
    /* nothing numbered: the reader every case import already uses (approval words anchor each job) */
    if(!ops.length){
      parseCaseJobs(L).forEach(function(j, i){ ops.push({ no: i + 1, name: j.name, hours: j.hours, price: j.cost, approval: normAp(j.approval), label: "", opCode: "", vmrs: "", skill: "", priceCode: "", story: "", storyBy: "", parts: [] }); });
    }
    ops.forEach(function(o){ o.story = o.story.replace(/\s+/g, " ").trim(); if(o.story) o.story = sentenceCase(o.story); });
    var seen = {}; ops = ops.filter(function(o){ var k = o.no + "|" + o.name.toLowerCase(); if(!o.name || seen[k]) return false; seen[k] = 1; return true; });
    return { ops: ops, parts: loose };
  }
  function normAp(a){ a = String(a || "").toLowerCase(); return !a ? "" : /declin|not approved/.test(a) ? "Declined" : /pending|awaiting/.test(a) ? "Pending" : "Approved"; }
  function grabCodes(o, t){
    var hit = false;
    Object.keys(OPLBL).forEach(function(k){ var m = OPLBL[k].exec(t); if(m && !o[k]){ var v = m[1].trim(); if(k === "vmrs") v = v.replace(/\s/g, "-"); if(k === "label") v = v.replace(/\b\w/g, function(c){ return c.toUpperCase(); }).replace(/\s+(?:Op|Vmrs|Skill|Price).*$/i, ""); o[k] = v; hit = true; } else if(m) hit = true; });
    return hit;
  }
  function pKey(p){ return p.pn ? "pn:" + invPnKey(p.pn) : "d:" + invDescKey(p.desc); }
  function addPart(list, p){ var k = pKey(p), had = list.filter(function(x){ return pKey(x) === k; })[0]; if(had){ Object.keys(p).forEach(function(f){ if(p[f] != null && p[f] !== "" && !(f === "core" && !p[f] && had.core)) had[f] = p[f]; }); } else list.push(p); }
  /* ---- notes: a line with a date and time starts one; who wrote it is the short name beside it ---- */
  var DT = /(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:[AaPp]\.?[Mm]\.?)?)?|\d{4}-\d{2}-\d{2}(?:[ T]\d{1,2}:\d{2})?|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s*\d{4}(?:\s+\d{1,2}:\d{2}\s*(?:[AaPp][Mm])?)?)/i;
  var SYSW = /^(system|asist|decisiv|auto(?:mated)?|parsec)$/i;
  function readNotes(L){
    var out = [], region = "", cur = null;
    for(var i = 0; i < L.length; i++){
      var t = L[i].trim(), h = /^(user\s*notes?|system\s*notes?|case\s*notes?|notes|comments|case\s*history)\s*:?$/i.exec(t);
      if(h){ region = /system/i.test(h[1]) ? "system" : "user"; if(cur){ out.push(cur); cur = null; } continue; }
      if(!region) continue;
      if(/^(?:totals?(?:\s*summary)?|operations?|case\s*level\s*actions|print\/pdf|asset|customer\s*info)\b/i.test(t)){ if(cur){ out.push(cur); cur = null; } region = ""; continue; }
      var dm = DT.exec(t);
      if(dm){
        if(cur) out.push(cur);
        var rest = (t.slice(0, dm.index) + "\t" + t.slice(dm.index + dm[0].length)).replace(/^[\s\-–·|:]+|[\s\-–·|:]+$/g, "");
        var C = splitCells(rest), by = "", text = "";
        if(C.length >= 2){ var ni = C.findIndex(function(c){ return SYSW.test(c) || !!nameCase(c) && c.split(/\s+/).length <= 3 && !/[.!?]$/.test(c); }); if(ni > -1){ by = SYSW.test(C[ni]) ? "" : nameCase(C[ni]); C.splice(ni, 1); } text = C.join(" "); }
        else { var m2 = /^(?:by\s+)?([A-Z][A-Za-z'\-]+(?:\s+[A-Z][A-Za-z'\-]+){0,2}|[A-Z'\-]+,\s*[A-Z'\-]+)\s*[:\-–]\s*(.+)$/.exec(rest); if(m2){ by = SYSW.test(m2[1]) ? "" : nameCase(m2[1]); text = m2[2]; } else text = rest; }
        var sysw = /^(system|asist)\b/i.test(rest); if(sysw && !by) text = text.replace(/^(?:system|asist)\b\s*[:\-–]?\s*/i, "");
        cur = { kind: region === "system" || sysw || !by ? "system" : "user", by: by, at: parseWhen(dm[0]), text: text.replace(/^[\s:\-–]+/, "").trim() };
        if(cur.kind === "system" && region === "user" && by) cur.kind = "user";
        continue;
      }
      if(cur){ cur.text = (cur.text ? cur.text + " " : "") + t; }
    }
    if(cur) out.push(cur);
    return out.filter(function(n){ return n.text && n.at; });
  }
  /* ---- totals ---- */
  function readTotals(L){
    var T = {}, on = false, got = 0;
    L.forEach(function(l){
      var t = l.trim();
      if(/^totals?(?:\s*summary)?\s*:?$/i.test(t) || /^totals?\s*summary\b/i.test(t)){ on = true; return; }
      if(!on) return;
      if(/^(?:user\s*notes?|system\s*notes?|notes|operations?|print\/pdf|case\s*level)\b/i.test(t)){ on = false; return; }
      var m = /^(labor|parts?|core(?:\s*charges?)?|shop\s*supplies|supplies|misc(?:ellaneous)?|sublet|environmental|fees?|tax(?:es)?|grand\s*total|total|sub\s*total)\b[^$\d\-]*(-?\$?\s?[\d,]+\.\d{2})/i.exec(t);
      if(!m) return; var k = m[1].toLowerCase(), v = money(m[2]); got++;
      if(/^labor/.test(k)) T.labor = v; else if(/^part/.test(k)) T.parts = v; else if(/^core/.test(k)) T.core = v;
      else if(/^(grand\s*)?total/.test(k)) T.total = v; else if(/^sub/.test(k)) T.sub = v; else T.misc = (T.misc || 0) + v;
    });
    return got ? T : null;
  }
  /* one piece of text → what it holds */
  function parse(raw){
    var text = cleanOcrText(String(raw || "")).replace(/\r/g, "").replace(/\u00a0/g, " ");
    var L = text.split("\n").map(function(l){ return l.replace(/[ \t]+$/, ""); }).filter(function(l){ return l.trim(); });
    var f = readLoose(text, L, readFields(L));
    var O = readOps(L), notes = readNotes(L), tot = readTotals(L);
    if(f.status && /^(approved|pending|declined)$/i.test(f.status)) delete f.status;
    var found = [];
    if(f.caseNo || f.roNumber || f.customer || f.status || f.etr) found.push("case");
    if(f.vin || f.model || f.unit || f.miles || f.engine) found.push("asset");
    if(f.complaint || f.cause || f.correction) found.push("complaint");
    return { f: f, ops: O.ops, parts: O.parts, notes: notes, totals: tot, found: found, vinOk: f.vin ? vinValid(f.vin) : null };
  }
  function describe(P){
    var b = [];
    if(P.found.indexOf("case") > -1) b.push(P.f.customer ? P.f.customer : "case header");
    if(P.found.indexOf("asset") > -1) b.push("the truck");
    if(P.ops.length) b.push(P.ops.length + " operation" + (P.ops.length === 1 ? "" : "s"));
    var np = P.parts.length + P.ops.reduce(function(a, o){ return a + o.parts.length; }, 0); if(np) b.push(np + " part" + (np === 1 ? "" : "s"));
    if(P.notes.length) b.push(P.notes.length + " note" + (P.notes.length === 1 ? "" : "s"));
    if(P.totals) b.push("totals");
    return b.join(" · ") || "nothing recognisable";
  }

  /* ---------------------------------------------------------------- what was read so far, in one dialog */
  function nn(s){ return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
  function sim(a, b){ var A = nn(a).split(" ").filter(function(w){ return w.length > 2; }), B = nn(b).split(" ").filter(function(w){ return w.length > 2; }); if(!A.length || !B.length) return 0;
    var n = A.filter(function(w){ return B.indexOf(w) > -1; }).length; return n / Math.max(A.length, B.length); }
  function blankAcc(){ return { f: {}, ops: [], parts: [], notes: [], totals: null }; }
  function noteKey(n){ var t = n.at ? new Date(n.at) : null; return nn(n.by) + "|" + (t && !isNaN(t) ? Math.floor(t.getTime() / 60000) : "") + "|" + nn(n.text).slice(0, 48); }
  function sameOp(a, b){ if(a.no && b.no && a.no === b.no && (sim(a.name, b.name) >= .34 || !a.name || !b.name || nn(a.name).indexOf(nn(b.name).slice(0, 10)) === 0 || nn(b.name).indexOf(nn(a.name).slice(0, 10)) === 0)) return true; return nn(a.name) === nn(b.name) && !!nn(a.name); }
  function mergeInto(acc, P){
    Object.keys(P.f).forEach(function(k){ if(P.f[k] !== "" && P.f[k] != null) acc.f[k] = P.f[k]; });
    P.ops.forEach(function(o){
      var a = acc.ops.filter(function(x){ return sameOp(x, o); })[0];
      if(!a){ a = JSON.parse(JSON.stringify(o)); a.parts = []; acc.ops.push(a); }
      else ["hours", "price", "approval", "label", "opCode", "vmrs", "skill", "priceCode", "storyBy"].forEach(function(k){ if(o[k] !== "" && o[k] != null) a[k] = o[k]; });
      if(o.name && o.name.length > (a.name || "").length && sim(o.name, a.name) >= .34) a.name = o.name;
      if(o.story && o.story.length >= (a.story || "").length * .6) a.story = o.story;
      o.parts.forEach(function(p){ addPart(a.parts, JSON.parse(JSON.stringify(p))); });
    });
    acc.ops.sort(function(x, y){ return (x.no || 99) - (y.no || 99); });
    P.parts.forEach(function(p){ if(acc.ops.some(function(o){ return o.parts.some(function(q){ return pKey(q) === pKey(p); }); })) return; addPart(acc.parts, JSON.parse(JSON.stringify(p))); });
    P.notes.forEach(function(n){ var k = noteKey(n); if(!acc.notes.some(function(x){ return noteKey(x) === k; })) acc.notes.push(JSON.parse(JSON.stringify(n))); });
    acc.notes.sort(function(a, b){ return new Date(a.at) - new Date(b.at); });
    if(P.totals){ acc.totals = acc.totals || {}; Object.keys(P.totals).forEach(function(k){ acc.totals[k] = P.totals[k]; }); }
    return acc;
  }
  /* ---------------------------------------------------------------- the RO it belongs to */
  function nzRo(s){ return String(s || "").toUpperCase().replace(/^R[AO][\s-]*/, "").replace(/\D/g, "").replace(/^0+/, ""); }
  function realRos(){ return STATE.ros.filter(function(r){ return !r.shop && r.id !== SHOP_RO_ID; }); }
  function findRo(f){
    var R = realRos(), k, hit;
    if(f.roNumber && (k = nzRo(f.roNumber))){ hit = R.filter(function(r){ return nzRo(r.roNumber) === k; })[0]; if(hit) return { ro: hit, by: "its RO #" }; }
    if(f.caseNo && (k = String(f.caseNo).replace(/\D/g, ""))){ hit = R.filter(function(r){ return String(r.caseNumber || "").replace(/\D/g, "") === k; })[0]; if(hit) return { ro: hit, by: "its case #" }; }
    var open = R.filter(function(r){ return !roIsDone(r); }).sort(function(a, b){ return new Date(b.dateOpened || 0) - new Date(a.dateOpened || 0); });
    if(f.vin){ hit = open.filter(function(r){ return String(r.vin || "").toUpperCase() === f.vin; })[0]; if(hit) return { ro: hit, by: "its VIN" }; }
    if(f.unit && f.customer){ hit = open.filter(function(r){ return String(r.unitNumber || "").toUpperCase() === String(f.unit).toUpperCase() && nn(r.customerName) === nn(f.customer); })[0]; if(hit) return { ro: hit, by: "its unit and customer" }; }
    return null;
  }
  /* ---------------------------------------------------------------- ASIST's words → Parsec's statuses */
  function mapStatus(s){
    s = String(s || "").toLowerCase(); if(!s) return "";
    if(/part/.test(s)) return "Waiting – Parts";
    if(/tech(nical)?\s*support|\btsc?\b|tech\s*case/.test(s)) return "Waiting – Tech Support";
    if(/declin/.test(s)) return "Declined";
    if(/approv|estimate|authori[sz]|customer|quote/.test(s)) return "Waiting – Customer";
    if(/foreman|supervis/.test(s)) return "Waiting – Foreman";
    if(/road\s*test|repair\s*complete|work\s*complete|completed?$|qc/.test(s)) return "Complete – Road test";
    if(/closed|released|picked\s*up|invoiced|ready\s*for\s*(pick|release)|delivered/.test(s)) return "Complete – Released";
    if(/diagnos|repair|in\s*(progress|service|shop|bay)|working|inspect|testing/.test(s)) return "Working";
    return "Hold Tech";
  }
  /* ---------------------------------------------------------------- the RO's fields, as rows */
  var G_CASE = "Case & customer", G_TRUCK = "Truck", G_CCC = "Complaint · cause · correction";
  function op1(ro){ return ro && (ro.operations || []).filter(function(o){ return !o.declined; })[0]; }
  var SPEC = [
    ["caseNumber", "Case #", G_CASE, "caseNo"], ["roNumber", "RO #", G_CASE, "roNumber"], ["customerName", "Customer", G_CASE, "customer"], ["custNo", "Cust #", G_CASE, "custNo"],
    ["status", "Status", G_CASE, "status", { sel: 1 }], ["promisedAt", "ETR → Promised", G_CASE, "etr", { dt: 1 }], ["followUpAt", "Follow-up", G_CASE, "followUp", { dt: 1 }],
    ["createdBy", "Created by", G_CASE, "createdBy"], ["dateOpened", "Checked in → Opened", G_CASE, "checkedIn", { dt: 1 }], ["poNumber", "PO #", G_CASE, "po"], ["authNumber", "Auth #", G_CASE, "auth"],
    ["techSupportCase", "Tech support case", G_CASE, "ts"],
    ["year", "Year", G_TRUCK, "year", { num: 1 }], ["make", "Make", G_TRUCK, "make"], ["model", "Model", G_TRUCK, "model"], ["vin", "VIN", G_TRUCK, "vin", { mono: 1 }], ["unitNumber", "Unit", G_TRUCK, "unit"],
    ["chassis", "Chassis / serial", G_TRUCK, "chassis"], ["engineType", "Engine", G_TRUCK, "engine"], ["engineSerial", "Engine serial", G_TRUCK, "engineSerial"], ["mileage", "Odometer → Miles", G_TRUCK, "miles", { num: 1 }],
    ["engineHours", "Engine hours", G_TRUCK, "engHours", { num: 1 }], ["keyTag", "Tag → Key tag", G_TRUCK, "tag"], ["location", "Location", G_TRUCK, "location"], ["department", "Department", G_TRUCK, "dept"],
    ["caseComplaint", "Complaint", G_CCC, "complaint", { long: 1 }], ["caseCause", "Cause", G_CCC, "cause", { long: 1 }], ["caseCorrection", "Correction", G_CCC, "correction", { long: 1 }]
  ];
  function getF(ro, k){
    if(!ro) return "";
    if(k === "status") return roStatus(ro).status;
    if(k === "caseComplaint") return ro.caseComplaint || "";
    if(k === "caseCause") return ro.caseCause || "";
    if(k === "caseCorrection") return ro.caseCorrection || "";
    var v = ro[k]; return v == null ? "" : String(v);
  }
  function srcF(acc, s){ var v = acc.f[s[3]]; if(s[0] === "status") return v ? mapStatus(v) : ""; return v == null ? "" : String(v); }
  function eq(s, a, b){ a = a == null ? "" : String(a); b = b == null ? "" : String(b);
    if((s[4] || {}).dt){ var x = new Date(a), y = new Date(b); return !isNaN(x) && !isNaN(y) ? Math.abs(x - y) < 60000 : a === b; }
    if((s[4] || {}).num) return (parseFloat(a.replace(/,/g, "")) || 0) === (parseFloat(b.replace(/,/g, "")) || 0) && (a === "") === (b === "");
    return nn(a) === nn(b); }
  function fmtF(s, v){ if(!v) return ""; if((s[4] || {}).dt) return whenTxt(v); if(s[0] === "mileage" || s[0] === "engineHours") return Number(v).toLocaleString("en-US"); return String(v); }
  /* one field: what Parsec has, what ASIST says, what the last import wrote → what happens */
  function rowOf(s){
    var ro = D.ro, cur = getF(ro, s[0]), src = srcF(D.acc, s), mem = ro && ro.imp && ro.imp.f ? ro.imp.f[s[0]] : undefined, ed = D.edits[s[0]];
    var r = { s: s, k: s[0], cur: cur, src: src, mem: mem, bd: "", fin: cur, was: "" };
    if(ed !== undefined && !eq(s, ed, D.new ? "" : cur)){ r.fin = ed; r.bd = "edit"; return r; }
    if(!src){ r.bd = D.new ? (cur ? "" : "") : (cur ? "same0" : ""); return r; }
    if(D.new || !cur){ r.fin = src; r.bd = "new"; return r; }
    if(eq(s, cur, src)){ r.bd = "same"; return r; }
    if(mem !== undefined && eq(s, cur, mem)){ r.fin = src; r.was = cur; r.bd = "upd"; return r; }
    if(mem !== undefined && eq(s, src, mem)){ r.bd = "yours"; return r; }
    r.bd = "kept"; return r;
  }
  /* ---------------------------------------------------------------- operations, parts and notes */
  function jobTypeOf(t){ t = String(t || "").toLowerCase(); return /inspection|\bpm\b|service\b|wash/.test(t) ? "PM" : /warrant/.test(t) ? "WARR" : /recall|campaign/.test(t) ? "RECALL" : /^(check|diagnos|advise)|diagnos|fault|code|no start|won'?t start|will not start/.test(t) ? "DIAG" : "OP"; }
  function opKey(o){ return (o.no ? "n" + o.no : "") + ":" + nn(o.name).slice(0, 24); }
  function memOp(ro, o){ var M = ro && ro.imp && ro.imp.ops || {}, k = opKey(o); if(M[k]) return M[k];
    var ks = Object.keys(M).filter(function(x){ var m = M[x]; return (o.no && m.no === o.no && sim(m.name, o.name) >= .34) || nn(m.name) === nn(o.name); }); return ks.length ? M[ks[0]] : null; }
  function txtOf(h){ return String(h || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim(); }
  var OPF = [["quoted", "hours", "num"], ["estCost", "price", "num"], ["asistApproval", "approval"], ["label", "label"], ["skill", "skill"]];
  var PTF = [["description", "desc"], ["qty", "qty", "num"], ["price", "price", "num"], ["core", "core", "num"], ["salesman", "salesman"]];
  function eqv(t, a, b){ if(t === "num"){ var x = parseFloat(String(a == null ? "" : a).replace(/[$,]/g, "")), y = parseFloat(String(b == null ? "" : b).replace(/[$,]/g, "")); return (isNaN(x) ? 0 : x) === (isNaN(y) ? 0 : y); } return nn(a) === nn(b); }
  /* merge one value by the rule: empty → new, untouched since the last import → updated, changed here → kept */
  function rule(t, cur, src, mem, isNew){
    var has = function(v){ return v !== "" && v != null && !(t === "num" && !parseFloat(v) && String(v) !== "0"); };
    if(!has(src)) return { bd: "", fin: cur };
    if(isNew || !has(cur)) return { bd: "new", fin: src };
    if(eqv(t, cur, src)) return { bd: "same", fin: cur };
    if(mem !== undefined && eqv(t, cur, mem)) return { bd: "upd", fin: src, was: cur };
    if(mem !== undefined && eqv(t, src, mem)) return { bd: "same", fin: cur };
    return { bd: "kept", fin: cur, asist: src };
  }
  function opPlan(o, i, taken){
    var ro = D.ro, M = D.new ? null : memOp(ro, o), ops = ro && !D.new ? ro.operations || [] : [], hit = null;
    if(M) hit = ops.filter(function(x){ return x.id === M.id; })[0] || null;
    if(!hit) hit = ops.filter(function(x){ return !taken[x.id] && nn(x.complaint) === nn(o.name); })[0] || null;
    if(!hit) hit = ops.filter(function(x){ return !taken[x.id] && sim(x.complaint, o.name) >= .5; })[0] || null;
    if(hit) taken[hit.id] = 1;
    var isNew = !hit, mf = M && M.f || {}, P = { o: o, i: i, op: hit, isNew: isNew, on: D.skip[opKey(o)] !== true, f: {}, parts: [], story: null, codes: "", bd: isNew ? "new" : "same" };
    OPF.forEach(function(x){ var cur = hit ? hit[x[0]] : "", r = rule(x[2], cur == null ? "" : cur, o[x[1]], mf[x[0]], isNew); P.f[x[0]] = r; if(!isNew && (r.bd === "upd" || r.bd === "new")) P.bd = "upd"; if(!isNew && r.bd === "kept" && P.bd === "same") P.bd = "kept"; });
    if(o.story){ var w = hit ? txtOf(hit.work) : "", r2 = rule("", w, o.story, M ? M.story : undefined, isNew); P.story = r2; if(!isNew && (r2.bd === "new" || r2.bd === "upd")) P.bd = "upd"; }
    P.codes = [o.opCode && "Op code " + o.opCode, o.vmrs && "VMRS " + o.vmrs, o.priceCode && "Price code " + o.priceCode].filter(Boolean).join(" · ");
    P.codesNew = !!P.codes && (!M || M.codes !== P.codes);
    var mp = M && M.parts || {}, have = hit ? hit.parts || [] : [];
    var L = o.parts.slice(); if(i === D.lpTo && !D.lpOff) D.acc.parts.forEach(function(p){ L.push(p); });
    L.forEach(function(p){
      var k = pKey(p), pm = mp[k], ph = null;
      if(pm) ph = have.filter(function(x){ return x.id === pm.id; })[0] || null;
      if(!ph) ph = have.filter(function(x){ return p.pn ? invPnKey(x.partNumber) === invPnKey(p.pn) : invDescKey(x.description) === invDescKey(p.desc); })[0] || null;
      var q = { p: p, k: k, part: ph, isNew: !ph, f: {}, bd: ph ? "same" : "new" };
      PTF.forEach(function(x){ var cur = ph ? ph[x[0]] : "", r = rule(x[2], cur == null ? "" : cur, p[x[1]], pm && pm.f ? pm.f[x[0]] : undefined, !ph); q.f[x[0]] = r; if(ph && (r.bd === "upd" || r.bd === "new")) q.bd = "upd"; if(ph && r.bd === "kept" && q.bd === "same") q.bd = "kept"; });
      P.parts.push(q); if(!isNew && (q.bd === "new" || q.bd === "upd")) P.bd = "upd";
    });
    return P;
  }
  function plan(){
    var taken = {}, ops = D.acc.ops.map(function(o, i){ return opPlan(o, i, taken); });
    if(D.acc.parts.length && !D.acc.ops.length) ops.push(opPlan({ no: 0, name: "Parts", hours: null, price: null, approval: "", label: "", opCode: "", vmrs: "", skill: "", priceCode: "", story: "", storyBy: "", parts: [] }, 0, taken));
    var seen = {}; ((D.ro && !D.new && D.ro.extNotes) || []).forEach(function(n){ seen[noteKey(n)] = 1; });
    var mn = D.ro && !D.new && D.ro.imp && D.ro.imp.notes || {};
    var notes = D.acc.notes.map(function(n){ var k = noteKey(n); return { n: n, k: k, bd: seen[k] || mn[k] ? "same" : "new" }; });
    var rows = SPEC.map(rowOf);
    return { rows: rows, ops: ops, notes: notes, people: peopleOf(rows, ops, notes) };
  }
  /* the people the import names, and whether they're on the Team */
  function onTeam(n){ return staffList().some(function(sf){ return sf.name && (techSame(sf.name, n) || nn(sf.name) === nn(n)); }); }
  function peopleOf(rows, ops, notes){
    var out = [], add = function(n, role, why){ n = String(n || "").trim(); if(!n || onTeam(n) || out.some(function(x){ return nn(x.n) === nn(n); })) return; out.push({ n: n, role: role, why: why }); };
    var cb = rows.filter(function(r){ return r.k === "createdBy"; })[0]; if(cb && cb.fin) add(cb.fin, "Service writer", "created the case");
    ops.forEach(function(P){ if(!P.on) return; if(P.o.storyBy) add(P.o.storyBy, "Technician", "wrote the story on Op " + (P.o.no || P.i + 1)); P.parts.forEach(function(q){ if(q.p.salesman) add(q.p.salesman, "Parts", "sold the parts"); }); });
    notes.forEach(function(x){ if(x.n.kind === "user" && x.n.by && x.bd === "new") add(x.n.by, "Other", "wrote a note in ASIST"); });
    return out;
  }
  function counts(Pl){
    var c = { new: 0, upd: 0, kept: 0, same: 0, edit: 0 };
    Pl.rows.forEach(function(r){ if(r.bd === "new") c.new++; else if(r.bd === "upd") c.upd++; else if(r.bd === "kept") c.kept++; else if(r.bd === "same" || r.bd === "yours") c.same++; else if(r.bd === "edit") c.edit++; });
    Pl.ops.forEach(function(P){ if(!P.on) return; if(P.isNew){ c.new += 1 + P.parts.length; return; }
      Object.keys(P.f).forEach(function(k){ var b = P.f[k].bd; if(b === "upd") c.upd++; else if(b === "new") c.new++; else if(b === "kept") c.kept++; });
      if(P.story){ if(P.story.bd === "upd") c.upd++; else if(P.story.bd === "new") c.new++; else if(P.story.bd === "kept") c.kept++; }
      P.parts.forEach(function(q){ if(q.isNew){ c.new++; return; } var u = 0, k = 0; Object.keys(q.f).forEach(function(x){ if(q.f[x].bd === "upd" || q.f[x].bd === "new") u = 1; else if(q.f[x].bd === "kept") k = 1; }); if(u) c.upd++; else if(k) c.kept++; else c.same++; });
      if(P.bd === "same") c.same++; });
    Pl.notes.forEach(function(x){ if(x.bd === "new") c.new++; else c.same++; });
    c.changes = c.new + c.upd + c.edit;
    return c;
  }

  /* ---------------------------------------------------------------- Create RO / Apply */
  var D = null, OCRF = null, NOW = null;   /* NOW: which screenshot of how many is being read */   /* OCRF: a stand-in reader for the tests */
  function setF(ro, s, v){
    var k = s[0];
    if(k === "status"){ var st = String(v || ""); if(!roStatusOption(st)) return; var prev = roStatus(ro).status; if(prev === st) return;
      ro.status = { status: st, sub: null, setAt: nowIso() }; ro._lastKnownStatus = st; try{ audit("status", roLabel(ro) + ": " + prev + " → " + st + " (from ASIST)", ro); }catch(e){} return; }
    if(k === "year"){ var y = +String(v).replace(/\D/g, ""); if(y >= 1980 && y <= new Date().getFullYear() + 2){ if(ro.year !== y){ ro.year = y; delete ro.trkBody; delete ro.trkTrim; } } return; }
    if(k === "model" || k === "make"){ if(String(ro[k] || "") !== String(v)){ ro[k] = String(v); delete ro.trkBody; delete ro.trkTrim; } return; }
    if((s[4] || {}).num){ ro[k] = String(v).replace(/[^\d.]/g, ""); return; }
    if(k === "vin"){ ro.vin = String(v).toUpperCase().replace(/\s/g, ""); return; }
    if(k === "caseCause" || k === "caseCorrection"){ ro[k] = String(v); var o1 = op1(ro), kind = k === "caseCause" ? "cause" : "fix";
      if(o1 && !opStory(o1, kind)){ if(!Array.isArray(o1.log)) o1.log = []; o1.log.push({ id: uid("lg"), at: nowIso(), kind: kind, text: String(v) }); } return; }
    ro[k] = String(v);
  }
  function apply(){
    if(!D) return;
    var Pl = plan(), C = counts(Pl), get = function(k){ return Pl.rows.filter(function(r){ return r.k === k; })[0]; };
    if(D.new){
      var rn = String(get("roNumber").fin || "").trim(), cn = String(get("customerName").fin || "").trim(), miss = [];
      if(!rn) miss.push("RO #"); if(!cn) miss.push("Customer");
      if(miss.length){ D.err = "Still needed: " + miss.join(", ") + "."; draw(); var q = document.querySelector('#imp-dlg [data-ixf="' + (rn ? "customerName" : "roNumber") + '"]'); if(q) q.focus(); return; }
      if(realRos().some(function(r){ return nzRo(r.roNumber) === nzRo(rn); })){ D.err = "RO " + rn + " already exists."; draw(); return; }
    } else if(!C.changes && !Pl.people.length){ close(); pushToast("Nothing to change — RO " + tgNum(D.ro) + " already has what ASIST shows."); return; }
    pushUndo(D.new ? "new RO from ASIST" : "import from ASIST");
    var ro = D.new ? addRO({ roNumber: get("roNumber").fin, customerName: get("customerName").fin, caseNumber: get("caseNumber").fin || "", dateOpened: get("dateOpened").fin || nowIso() }) : D.ro;
    var me = punchByName() || (typeof pxMeName === "function" ? pxMeName() : "") || "Admin";
    var mem = ro.imp || { f: {}, ops: {}, notes: {} }; mem.f = mem.f || {}; mem.ops = mem.ops || {}; mem.notes = mem.notes || {};
    /* the fields */
    Pl.rows.forEach(function(r){
      if(r.bd === "new" || r.bd === "upd" || r.bd === "edit"){ if(!(D.new && (r.k === "roNumber" || r.k === "customerName" || r.k === "caseNumber" || r.k === "dateOpened"))) setF(ro, r.s, r.fin); }
      if(r.src) mem.f[r.k] = r.src;
    });
    /* the operations and their parts */
    var rn2 = ro.roNumber;
    Pl.ops.forEach(function(P){
      if(!P.on) return;
      var o = P.o, op = P.op, mk = opKey(o);
      if(!op){ op = { id: uid("op"), complaint: o.name || "Operation", cause: "", correction: "", quoted: parseFloat(o.hours) || 0, isStandard: false, standardName: null, declined: false, parts: [], burnt: 0, work: "", log: [] };
        op.jobType = jobTypeOf(o.name); ro.operations.push(op); }
      Object.keys(P.f).forEach(function(k){ var r = P.f[k]; if(r.bd !== "new" && r.bd !== "upd") return; var v = r.fin;
        if(k === "quoted") op.quoted = parseFloat(v) || 0; else if(k === "estCost"){ if(+v > 0) op.estCost = +v; } else op[k] = String(v); });
      if(P.story && (P.story.bd === "new" || P.story.bd === "upd")) op.work = esc(P.story.fin);
      if(P.codes && P.codesNew){ op.offNotes = (Array.isArray(op.offNotes) ? op.offNotes : []).concat([{ id: "on" + uid("x"), at: nowIso(), text: "From ASIST — " + P.codes, by: "ASIST" }]); }
      var M = mem.ops[mk] = mem.ops[mk] || { parts: {} }; M.id = op.id; M.no = o.no; M.name = o.name; M.f = M.f || {}; M.parts = M.parts || {};
      OPF.forEach(function(x){ if(o[x[1]] !== "" && o[x[1]] != null) M.f[x[0]] = o[x[1]]; });
      if(o.story) M.story = o.story; if(P.codes) M.codes = P.codes;
      P.parts.forEach(function(q){
        var p = q.p, part = q.part;
        if(!part){ part = { id: uid("pt"), description: p.desc || p.pn, partNumber: p.pn || "", qty: String(p.qty || "1"), status: "Not Ordered", eta: "", statusChangedAt: nowIso() }; if(!Array.isArray(op.parts)) op.parts = []; op.parts.push(part); }
        Object.keys(q.f).forEach(function(k){ var r = q.f[k]; if(r.bd !== "new" && r.bd !== "upd") return; var v = r.fin;
          if(k === "price" || k === "core"){ if(+v >= 0) part[k] = String(+v); } else if(k === "qty") part.qty = String(parseFloat(v) || 1); else part[k] = String(v); });
        var PM = M.parts[q.k] = M.parts[q.k] || {}; PM.id = part.id; PM.f = PM.f || {}; PTF.forEach(function(x){ if(p[x[1]] !== "" && p[x[1]] != null) PM.f[x[0]] = p[x[1]]; });
        /* the Parts list learns the part, and ASIST's price */
        try{ invAddFromPart(part, rn2); var it = invHasPart(part.partNumber, part.description); if(it && priceOf(part.price) && priceOf(it.price) !== priceOf(part.price)){ it.price = String(priceOf(part.price)); it.editedAt = nowIso(); } }catch(e){}
      });
    });
    /* ASIST's notes */
    if(!Array.isArray(ro.extNotes)) ro.extNotes = [];
    Pl.notes.forEach(function(x){ if(x.bd !== "new") return; ro.extNotes.push({ id: uid("xn"), at: x.n.at, by: x.n.by || "", text: x.n.text, kind: x.n.kind, src: "ASIST" }); mem.notes[x.k] = 1; });
    Pl.notes.forEach(function(x){ mem.notes[x.k] = 1; });
    ro.extNotes.sort(function(a, b){ return new Date(a.at) - new Date(b.at); });
    /* people ASIST names who aren't on the Team: they join it — no pages, no sign-in */
    Pl.people.forEach(function(p){ staffList().push({ id: uid("st"), name: p.n, role: p.role, pages: {}, ext: "ASIST", noSignIn: true, addedAt: nowIso(), why: p.why }); try{ audit("staff", p.n + " added to the Team from ASIST (" + p.why + ")", ro); }catch(e){} });
    if(!ro.assignedTech){ var tb = Pl.ops.map(function(P){ return P.o.storyBy; }).filter(Boolean)[0]; if(tb) ro.assignedTech = tb; }
    mem.at = nowIso(); mem.n = (mem.n || 0) + 1; mem.by = me; ro.imp = mem;
    var sum = [C.new ? C.new + " new" : "", C.upd ? C.upd + " updated" : "", C.kept ? C.kept + " kept" : "", C.edit ? C.edit + " typed" : ""].filter(Boolean).join(", ") || "nothing new";
    try{ autoHist(ro, { at: Date.now(), k: "import", t: D.new ? "Created from ASIST" : "Imported from ASIST", o: "", n: sum, op: "", by: me }); }catch(e){}
    try{ audit("import", roLabel(ro) + ": " + (D.new ? "created from ASIST" : "imported from ASIST") + " — " + sum, ro); }catch(e){}
    scheduleSave(true);
    var wasNew = D.new, id = ro.id; close();
    if(wasNew){ UI.view = "ros"; UI.selectedRo = id; UI.roFilter = ""; UI.modal = null; }
    render(); try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(e){}
    pushToast((wasNew ? "Created RO " + tgNum(ro) + " from ASIST" : "Imported from ASIST — RO " + tgNum(ro)) + " · " + sum + (Pl.people.length ? " · " + Pl.people.length + " joined the Team" : "") + ".", true);
  }

  /* ---------------------------------------------------------------- the dialog */
  var ICX = { image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="M4 17l4.5-4 3.5 3 3-2.5 5 4"/>',
    doc: '<path d="M7 3.5h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z"/><path d="M14 3.5v4h4M9 12h6M9 15.5h6"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    clip: '<path d="M20 11.5l-7.8 7.8a5 5 0 0 1-7.1-7.1L13 4.3a3.3 3.3 0 0 1 4.7 4.7l-7.9 7.9a1.7 1.7 0 0 1-2.4-2.4l7.3-7.3"/>',
    check: '<path d="M5 12.5l4.2 4.2L19 7"/>', swap: '<path d="M7 7h11l-3-3M17 17H6l3 3"/>', plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    note: '<path d="M5 4.5h14v15H5z"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4"/>', user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5c.8-3.6 3.7-5.5 7-5.5s6.2 1.9 7 5.5"/>',
    parts: '<path d="M12 3.5l7.5 4.2v8.6L12 20.5l-7.5-4.2V7.7z"/><path d="M4.8 7.9L12 12l7.2-4.1M12 12v8.3"/>', history: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5V8h3.5M12 8v4.5l3 2"/>',
    warn: '<path d="M12 4l9 15.5H3z"/><path d="M12 10v4.5M12 17.2v.3"/>', pencil: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>' };
  function ic(k, s){ return '<svg class="ix-ic" viewBox="0 0 24 24" width="' + (s || 15) + '" height="' + (s || 15) + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICX[k] || "") + '</svg>'; }
  var BD = { new: ["new", "check", "New"], upd: ["upd", "swap", "Updated"], kept: ["kept", "lock", "Kept yours"], same: ["same", "", "Same"], yours: ["same", "", "Yours"], edit: ["edit", "pencil", "Typed"] };
  function bd(k){ var b = BD[k]; return b ? '<span class="ix-bd ' + b[0] + '">' + (b[1] ? ic(b[1], 11) : "") + b[2] + '</span>' : '<span></span>'; }
  function hideable(b){ return !b || b === "same" || b === "yours" || b === "same0"; }
  function fieldInput(r){
    var s = r.s, o = s[4] || {}, v = r.fin, at = ' class="ix-in' + (o.mono ? ' mono' : '') + '" data-ixf="' + s[0] + '" aria-label="' + esc(s[1]) + '"';
    if(o.sel) return '<select' + at + '>' + RO_STATUS_OPTIONS.map(function(x){ return '<option' + (x.status === (v || "Hold Tech") ? ' selected' : '') + '>' + esc(x.status) + '</option>'; }).join("") + '</select>';
    if(o.dt) return '<input type="datetime-local"' + at.replace('class="ix-in', 'class="ix-in' + (v ? '' : ' empty')) + ' value="' + esc(whenIn(v)) + '">';
    if(o.long) return '<textarea rows="2"' + at + ' placeholder="—">' + esc(v) + '</textarea>';
    return '<input type="text"' + at + ' value="' + esc(v) + '" placeholder="' + (D.new && (s[0] === "roNumber" || s[0] === "customerName") ? 'Needed' : '—') + '"' + (o.num ? ' inputmode="numeric"' : '') + ' autocomplete="off">';
  }
  function frow(r){
    var s = r.s, sm = "";
    if(r.bd === "upd") sm = 'was ' + esc(fmtF(s, r.was));
    else if(r.bd === "kept") sm = 'ASIST now says <b>' + esc(fmtF(s, r.src)) + '</b> <button class="ix-lk" data-ix="use" data-k="' + s[0] + '">Use ASIST’s</button>';
    else if(r.bd === "yours") sm = 'yours — ASIST didn’t change it';
    else if(r.bd === "edit" && r.src && !eq(s, r.fin, r.src)) sm = 'ASIST says ' + esc(fmtF(s, r.src));
    if(s[0] === "roNumber" && r.fin) sm = (sm ? sm + ' · ' : '') + 'shows as ' + esc(roShortNo(r.fin)) + ' everywhere but the open RO';
    if(s[0] === "status" && D.acc.f.status) sm = (sm ? sm + ' · ' : '') + 'ASIST: ' + esc(D.acc.f.status);
    if(s[0] === "vin" && r.fin) sm = (sm ? sm + ' · ' : '') + (vinValid(r.fin) ? 'check digit ✓' : '<span class="ix-bad">check digit doesn’t match — check it</span>');
    if(s[0] === "createdBy" && r.fin) sm = (sm ? sm + ' · ' : '') + (onTeam(r.fin) ? 'on the Team' : 'joins the Team');
    if(s[0] === "model" && r.fin){ try{ var M = trkMatch(Object.assign({}, D.ro || {}, { model: r.fin, year: +(D.edits.year || (D.acc.f.year) || (D.ro && D.ro.year) || 0) || undefined, trkBody: undefined })); if(M && M.entry) sm = (sm ? sm + ' · ' : '') + 'picture: ' + esc(M.entry.vt && VT_BY[M.entry.vt] ? VT_BY[M.entry.vt].label : M.entry.model); }catch(e){} }
    return '<div class="ix-fr ' + (r.bd || "none") + (D.only && hideable(r.bd) ? ' hide' : '') + '"><span class="ix-fl">' + esc(s[1]) + '</span><span class="ix-fv">' + fieldInput(r) + (sm ? '<small>' + sm + '</small>' : '') + '</span>' + bd(r.bd === "same0" ? "" : r.bd) + '</div>';
  }
  function vtxt(r, t){ if(!r) return ""; var v = r.fin; if(t === "money") return v === "" || v == null ? "—" : usd(v); return v == null || v === "" ? "—" : esc(String(v)); }
  function cellBd(r){ return r && (r.bd === "upd" || r.bd === "kept") ? ' class="' + r.bd + '" title="' + (r.bd === "upd" ? "was " + esc(String(r.was)) : "ASIST says " + esc(String(r.asist))) + '"' : ''; }
  function opCard(P){
    var o = P.o, f = P.f, ap = f.asistApproval && f.asistApproval.fin, chg = f.asistApproval && f.asistApproval.bd === "upd";
    var meta = [o.skill ? "Skill " + esc(o.skill) : "", o.label ? esc(o.label) : "", P.codes ? '<span title="Op code, VMRS and price code go into the operation’s notes">' + esc(P.codes) + ' → notes</span>' : ""].filter(Boolean).join(" · ");
    var hrs = f.quoted ? f.quoted.fin : o.hours, pr = f.estCost ? f.estCost.fin : o.price;
    var head = '<div class="ix-oh"><label class="ix-ck" title="Take this operation in"><input type="checkbox" data-ix="opon" data-k="' + esc(opKey(o)) + '"' + (P.on ? ' checked' : '') + '></label><span class="ix-no mono">' + (o.no || "—") + '</span><span class="ix-on"><b>' + esc(o.name || "Operation") + '</b>' + (meta ? '<small>' + meta + '</small>' : '') + (P.op && !P.isNew ? '<small>on this RO as Op ' + (((D.ro.operations || []).indexOf(P.op)) + 1) + '</small>' : '') + '</span>'
      + '<span class="ix-oh-n mono"' + cellBd(f.quoted) + '>' + (hrs != null && hrs !== "" ? (+hrs).toFixed(1) + ' h' : '—') + (pr ? ' · ' + usd(pr) : '') + '</span>'
      + (ap ? '<span class="ix-ap ' + (ap === "Approved" ? "a" : ap === "Declined" ? "d" : "p") + '" title="ASIST’s approval — shown only, the status stays">' + (chg ? esc(f.asistApproval.was) + ' → ' : '') + esc(ap) + '</span>' : '<span></span>') + bd(P.on ? P.bd : "") + '</div>';
    var rows = P.parts.map(function(q){ var p = q.p; return '<tr' + (q.bd === "new" && !P.isNew ? ' class="nwr"' : '') + '><td class="m">' + esc(p.pn || "—") + '</td><td>' + vtxt(q.f.description) + '</td><td class="r m"' + cellBd(q.f.qty) + '>' + vtxt(q.f.qty) + '</td><td class="r m"' + cellBd(q.f.price) + '>' + vtxt(q.f.price, "money") + '</td><td class="r m"' + cellBd(q.f.core) + '>' + (q.f.core && +q.f.core.fin ? usd(q.f.core.fin) : '—') + '</td><td class="r m">' + (p.ext != null ? usd(p.ext) : usd((+(q.f.qty.fin) || 1) * (+(q.f.price.fin) || 0) + (+(q.f.core.fin) || 0))) + '</td><td>' + vtxt(q.f.salesman) + '</td><td>' + (P.isNew ? '' : bd(q.bd)) + '</td></tr>'; }).join("");
    var parts = P.parts.length ? '<div class="ix-ptw"><table class="ix-pt"><thead><tr><th>Part #</th><th>Part</th><th class="r">Qty</th><th class="r">Unit</th><th class="r">Core</th><th class="r">Ext</th><th>Salesman</th><th></th></tr></thead><tbody>' + rows + '</tbody></table><div class="ix-mu">' + ic("parts", 12) + 'Prices also go to the Parts list</div></div>' : '';
    var st = P.story ? '<div class="ix-st"><b>Technician story</b>' + (o.storyBy ? ' · ' + esc(o.storyBy) : '') + ' ' + (P.isNew ? '' : bd(P.story.bd)) + '<p>' + esc(P.story.bd === "kept" ? P.story.asist : P.story.fin) + '</p>' + (P.story.bd === "kept" ? '<small>Work performed was changed here — it stays; ASIST’s story is above</small>' : '') + '</div>' : '';
    return '<div class="ix-op' + (P.on ? '' : ' off') + (D.only && P.bd === "same" ? ' hide' : '') + '">' + head + (P.on ? parts + st : '') + '</div>';
  }
  function totals(Pl){
    var T = D.acc.totals; if(!T) return '<div class="ix-mu" style="padding:4px 8px">No totals read yet — they’re checked when the Totals part of the case comes in.</div>';
    var lab = 0, pts = 0, core = 0;
    Pl.ops.forEach(function(P){ if(!P.on) return; var h = P.f.quoted ? +P.f.quoted.fin || 0 : 0, pr = P.f.estCost ? +P.f.estCost.fin || 0 : 0; lab += pr || h * laborRate();
      P.parts.forEach(function(q){ var qn = +q.f.qty.fin || 1; pts += qn * (+q.f.price.fin || 0); core += qn * (+q.f.core.fin || 0); }); });
    var misc = T.misc || 0, tot = lab + pts + core + misc;
    var c = function(k, mine, theirs){ var ok = theirs == null || Math.abs(mine - theirs) < .01; return '<div><span>' + k + '</span><b class="mono">' + usd(mine) + '</b><small class="' + (theirs == null ? '' : ok ? 'ok' : 'off') + '">' + (theirs == null ? 'not on the case' : ok ? ic("check", 11) + ' matches ASIST' : 'ASIST says ' + usd(theirs)) + '</small></div>'; };
    return '<div class="ix-tot">' + c("Labor", lab, T.labor) + c("Parts", pts, T.parts) + c("Core + shop supplies", core + misc, T.core != null || T.misc != null ? (T.core || 0) + (T.misc || 0) : null) + c("Total", tot, T.total) + '</div>';
  }
  function notesHtml(Pl){
    if(!Pl.notes.length) return '<div class="ix-mu" style="padding:4px 8px">No notes read yet.</div>';
    return Pl.notes.map(function(x){ var n = x.n, sys = n.kind === "system" || !n.by, newP = n.by && !onTeam(n.by);
      return '<div class="ix-note' + (D.only && x.bd === "same" ? ' hide' : '') + '"><span class="ix-av' + (sys ? ' sys' : '') + '">' + (sys ? ic("history", 12) : esc(tgIni(n.by))) + '</span><span><b>' + esc(sys ? "ASIST" : n.by) + '</b>' + (newP ? ' <span class="ix-bd nf">joins the Team</span>' : '') + '<q>' + esc(n.text) + '</q></span><time>' + esc(whenTxt(n.at)) + ' ' + bd(x.bd) + '</time></div>'; }).join("");
  }
  function pieceHtml(p, i){ return '<div class="ix-pc' + (p.nw ? ' nw' : '') + '"><span class="ix-th">' + ic(p.kind === "text" ? "doc" : p.kind === "pdf" ? "doc" : "image") + '</span><span><b>' + esc(p.name) + '</b><small>' + esc(p.what) + '</small></span><button class="ix-x0" data-ix="rmpc" data-i="' + i + '" title="Take this piece out" aria-label="Take out ' + esc(p.name) + '">' + ic("x", 12) + '</button></div>'; }
  function draw(){
    var w = document.getElementById("imp-dlg"); if(!w || !D) return;
    var Pl = plan(), C = counts(Pl), ro = D.ro, upd = !D.new, phone = document.documentElement.getAttribute("data-device") === "phone" || window.innerWidth < 760;
    var sc = w.querySelector(".ix-fs"), keep = sc ? sc.scrollTop : 0, sb = w.querySelector(".ix-b"), keepB = sb ? sb.scrollTop : 0;
    var title = upd ? 'Update RO ' + esc(tgNum(ro)) + (ro.customerName ? ' · ' + esc(ro.customerName) : '') : 'New repair order';
    var sub = upd ? (D.foundBy ? 'Found by ' + esc(D.foundBy) : 'Import from ASIST') + (ro.imp && ro.imp.at ? ' — imported ' + (ro.imp.n > 1 ? ro.imp.n + ' times, last ' : 'once already, ') + esc(whenTxt(ro.imp.at)) : ' — first import on this RO') : 'Paste or drop everything about the case — it fills in as it reads';
    var groups = {}; Pl.rows.forEach(function(r){ (groups[r.s[2]] = groups[r.s[2]] || []).push(r); });
    var lpSel = D.acc.parts.length && D.acc.ops.length ? '<div class="ix-lp">' + ic("parts", 13) + '<span>' + D.acc.parts.length + ' part' + (D.acc.parts.length === 1 ? '' : 's') + ' came in without their operation — they go on</span><select data-ix="lp" class="ix-in">' + D.acc.ops.map(function(o, i){ return '<option value="' + i + '"' + (i === D.lpTo && !D.lpOff ? ' selected' : '') + '>Op ' + (o.no || i + 1) + ' · ' + esc(o.name) + '</option>'; }).join("") + '<option value="-1"' + (D.lpOff ? ' selected' : '') + '>Leave them out</option></select></div>' : '';
    var ppl = Pl.people.length ? '<div class="ix-ppl">' + ic("user", 13) + '<span><b>' + Pl.people.length + (Pl.people.length === 1 ? ' person joins' : ' people join') + ' the Team</b> — no pages, no sign-in: ' + Pl.people.map(function(p){ return esc(p.n) + ' (' + esc(p.why) + ')'; }).join(", ") + '</span></div>' : '';
    var reading = D.busy ? '<div class="imp-status busy" id="imp-status" role="status">' + esc(D.busy) + '</div>' : '<div class="imp-status" id="imp-status" role="status" aria-live="polite">' + esc(D.msg || "") + '</div>';
    var chips = [["new", C.new, "new"], ["upd", C.upd, "updated"], ["kept", C.kept, "kept yours"], ["edit", C.edit, "typed"], ["same", C.same, "same"]].filter(function(x){ return x[1]; }).map(function(x){ return '<span class="' + x[0] + '"><b>' + x[1] + '</b>' + x[2] + '</span>'; }).join("");
    var prim = D.new ? 'Create RO' + (Pl.rows[1].fin ? ' ' + esc(roShortNo(Pl.rows[1].fin)) : '') : (C.changes || Pl.people.length ? 'Apply ' + C.changes + ' change' + (C.changes === 1 ? '' : 's') : 'Nothing to change');
    var foot = D.err ? '<span class="ix-err">' + ic("warn", 13) + esc(D.err) + '</span>' : '<span class="ix-mu">' + (D.new ? (D.pieces.length ? 'Check what came in — nothing is saved until Create RO' : 'Paste the case to fill this in, or type it') : 'Nothing changes until you press Apply') + '</span>';
    w.innerHTML = '<div class="ix" role="dialog" aria-modal="true" aria-label="' + (upd ? 'Update RO ' + esc(tgNum(ro)) : 'New repair order') + '">'
      + '<div class="ix-h"><div class="ix-ht"><h2>' + title + '</h2><div class="ix-sub">' + sub + '</div></div>' + (upd ? '<span class="ix-bd upd ix-tag">' + ic("swap", 12) + 'Existing RO</span>' + (D.fixed || D.foundBy === 'its RO #' ? '' : '<button class="ix-lk" data-ix="newinstead" title="Same truck, a new visit">Make a new RO instead</button>') : '<span class="ix-bd new ix-tag">' + ic("plus", 12) + 'New RO</span>') + '<button class="ix-x" data-ix="close" aria-label="Close (Esc)" title="Close (Esc)">' + ic("x", 18) + '</button></div>'
      + '<div class="ix-b"><div class="ix-imp">'
      +   '<div class="ix-drop" tabindex="0" data-ix="drop" aria-label="Paste or drop the case here">' + ic("clip", 22) + (phone ? '<b>Paste the case, or add screenshots</b><textarea class="ix-paste" data-ix-paste rows="2" placeholder="Long-press here and Paste the case text"></textarea>' : '<b>Paste (Ctrl V) or drop here</b>') + '<small>Case page text, screenshots, the PDF — as many as you like, any order</small><div class="ix-row"><button class="ix-btn" data-ix="shots">' + ic("image", 14) + 'Screenshots</button><button class="ix-btn" data-ix="pdf">' + ic("doc", 14) + 'PDF</button></div></div>'
      +   '<input type="file" id="ix-shots" accept="image/*" multiple hidden><input type="file" id="ix-pdf" accept=".pdf,application/pdf" hidden>'
      +   reading
      +   (D.pieces.length ? '<div class="ix-pcs"><span>READ SO FAR</span>' + D.pieces.map(pieceHtml).join("") + '</div>' : '<div class="ix-pcs"><span>READ SO FAR</span><div class="ix-mu">Nothing yet. Copy the case page in ASIST (Ctrl A, Ctrl C) and press Ctrl V here — or drop screenshots.</div></div>')
      +   '<div class="ix-prv">' + ic("lock", 13) + '<span>Read on this computer — screenshots by the reader inside Parsec. Nothing is sent anywhere.</span></div>'
      +   (chips ? '<div class="ix-sum">' + chips + '</div>' : '')
      + '</div><div class="ix-frm"><div class="ix-fbar"><div class="ix-seg" role="group" aria-label="Show"><button data-ix="only" data-v="0" aria-pressed="' + !D.only + '">Everything</button><button data-ix="only" data-v="1" aria-pressed="' + D.only + '">Changes only</button></div><span class="ix-mu">' + (upd ? (C.kept ? C.kept + ' changed here and in ASIST — yours stay' : C.changes ? 'What ASIST changed since the last import' : 'ASIST and this RO agree') : (D.pieces.length ? 'All of it is new — nothing on this RO yet' : 'Every field can be typed')) + '</span></div><div class="ix-fs">'
      +   [G_CASE, G_TRUCK, G_CCC].map(function(g){ return '<div class="ix-grp"><h4>' + g + '</h4>' + groups[g].map(frow).join("") + '</div>'; }).join("")
      +   '<div class="ix-grp"><h4>Operations <em>labor hours, price, ASIST’s approval (shown only) — parts under each</em></h4>' + lpSel + (Pl.ops.length ? '<div class="ix-ops">' + Pl.ops.map(opCard).join("") + '</div>' : '<div class="ix-mu" style="padding:4px 8px">No operations read yet.</div>') + '</div>'
      +   '<div class="ix-grp"><h4>Notes <em>user and system notes, with who and when — into Activity</em></h4>' + ppl + notesHtml(Pl) + '</div>'
      +   '<div class="ix-grp"><h4>Totals <em>checked against what Parsec adds up</em></h4>' + totals(Pl) + '</div>'
      + '</div><div class="ix-df">' + foot + '<button class="ix-btn" data-ix="close">Cancel</button><button class="ix-btn pri" data-ix="apply"' + (!D.new && !C.changes && !Pl.people.length ? ' disabled' : '') + '>' + prim + '</button></div></div></div></div>';
    var sc2 = w.querySelector(".ix-fs"); if(sc2) sc2.scrollTop = keep; var sb2 = w.querySelector(".ix-b"); if(sb2) sb2.scrollTop = keepB;
  }

  /* ---------------------------------------------------------------- reading pieces */
  function match(){
    if(!D || D.fixed) return;
    var m = D.forceNew ? null : findRo(D.acc.f);
    if(m){ D.ro = m.ro; D.new = false; D.foundBy = m.by; } else { D.ro = null; D.new = true; D.foundBy = ""; }
  }
  function rebuild(){ D.acc = blankAcc(); D.pieces.forEach(function(p){ mergeInto(D.acc, p.P); }); if(D.lpTo >= D.acc.ops.length) D.lpTo = 0; match(); D.err = ""; draw(); }
  var SECN = { case: "Case header", asset: "Truck", complaint: "Complaint" };
  function pieceName(kind, P, n){
    var main = P.ops.length ? "Operations" : (P.parts.length ? "Parts" : P.notes.length ? "Notes" : P.totals ? "Totals" : SECN[P.found[0]] || "Text");
    if(kind === "image") return "Screenshot" + (n > 1 ? " " + n : "") + " · " + main;
    if(kind === "pdf") return n;
    return P.found.indexOf("case") > -1 && P.ops.length ? "Case page · pasted text" : "Pasted text · " + main;
  }
  function addText(text, kind, name){
    if(!D || !String(text || "").trim()) return;
    var P = parse(text);
    D.pieces.forEach(function(p){ p.nw = 0; });
    var nImg = D.pieces.filter(function(p){ return p.kind === "image"; }).length + 1;
    D.pieces.push({ kind: kind || "text", name: kind === "pdf" ? name : pieceName(kind || "text", P, nImg), what: describe(P), P: P, nw: 1 });
    D.msg = describe(P) === "nothing recognisable" ? "Nothing in that looked like the case — is it the ASIST case page?" : "";
    rebuild();
  }
  function readFiles(list){
    var files = Array.prototype.slice.call(list || []), imgs = files.filter(function(f){ return /^image\//.test(f.type || "") || /\.(png|jpe?g|webp|bmp|gif)$/i.test(f.name || ""); }), pdfs = files.filter(function(f){ return /pdf/i.test(f.type || "") || /\.pdf$/i.test(f.name || ""); });
    var q = Promise.resolve();
    pdfs.forEach(function(f){ q = q.then(function(){ if(!D) return; D.busy = "Reading " + (f.name || "the PDF") + "…"; draw();
      return pdfToText(f).then(function(t){ if(!D) return; D.busy = ""; addText(t, "pdf", f.name || "PDF"); }, function(e){ if(!D) return; D.busy = ""; D.msg = e && e.message === "offline" ? "Couldn’t load the PDF reader — it needs the internet the first time. Paste the case text instead." : "Couldn’t read that PDF — paste the case text instead."; draw(); }); }); });
    imgs.forEach(function(f, i){ q = q.then(function(){ if(!D) return; NOW = [i + 1, imgs.length]; D.busy = "Reading screenshot " + (i + 1) + " of " + imgs.length + "…"; draw();
      return (OCRF || ocrImages)([f], 6).then(function(t){ if(!D) return; D.busy = ""; t = cleanOcrText(t).trim(); if(!t){ D.msg = "No text found in that screenshot."; draw(); return; } addText(t, "image"); },
        function(e){ if(!D) return; D.busy = ""; D.msg = e && e.message === "offline" ? "Couldn’t start the screenshot reader. Paste the case text instead." : "Couldn’t read that screenshot — try a sharper one, or paste the text."; draw(); }); }); });
    return q;
  }
  /* ---------------------------------------------------------------- open, close, events */
  function soft(){
    var w = document.getElementById("imp-dlg"); if(!w || !D) return;
    var Pl = plan(), C = counts(Pl), s = w.querySelector(".ix-sum"), b = w.querySelector('[data-ix="apply"]');
    var chips = [["new", C.new, "new"], ["upd", C.upd, "updated"], ["kept", C.kept, "kept yours"], ["edit", C.edit, "typed"], ["same", C.same, "same"]].filter(function(x){ return x[1]; }).map(function(x){ return '<span class="' + x[0] + '"><b>' + x[1] + '</b>' + x[2] + '</span>'; }).join("");
    if(s) s.innerHTML = chips;
    if(b){ b.textContent = D.new ? "Create RO" + (Pl.rows[1].fin ? " " + roShortNo(Pl.rows[1].fin) : "") : (C.changes || Pl.people.length ? "Apply " + C.changes + " change" + (C.changes === 1 ? "" : "s") : "Nothing to change"); b.disabled = !D.new && !C.changes && !Pl.people.length; }
    Pl.rows.forEach(function(r){ var inp = w.querySelector('[data-ixf="' + r.k + '"]'), row = inp && inp.closest(".ix-fr"); if(!row) return; row.className = "ix-fr " + (r.bd || "none"); var old = row.lastElementChild; if(old && old !== inp.parentNode){ var t = document.createElement("span"); t.innerHTML = bd(r.bd === "same0" ? "" : r.bd); row.replaceChild(t.firstChild || document.createElement("span"), old); } });
  }
  function onInput(t){
    var k = t.getAttribute("data-ixf"), s = SPEC.filter(function(x){ return x[0] === k; })[0]; if(!s || !D) return;
    var v = t.value; if((s[4] || {}).dt){ var d = v ? new Date(v) : null; v = d && !isNaN(d) ? d.toISOString() : ""; }
    D.edits[k] = v; D.err = ""; soft();
  }
  function close(){ var w = document.getElementById("imp-dlg"); if(w) w.remove(); document.documentElement.classList.remove("ix-open"); var b = D && D.back; D = null; try{ if(b && b.isConnected) b.focus({ preventScroll: true }); }catch(e){} }
  function bind(w){
    w.addEventListener("click", function(e){
      var t = e.target.closest && e.target.closest("[data-ix]"); if(!t || !w.contains(t)) return;
      var a = t.getAttribute("data-ix");
      if(a === "close") close();
      else if(a === "only"){ D.only = t.getAttribute("data-v") === "1"; draw(); }
      else if(a === "shots") document.getElementById("ix-shots").click();
      else if(a === "pdf") document.getElementById("ix-pdf").click();
      else if(a === "apply") apply();
      else if(a === "use"){ var k = t.getAttribute("data-k"), s = SPEC.filter(function(x){ return x[0] === k; })[0]; if(s){ D.edits[k] = srcF(D.acc, s); draw(); } }
      else if(a === "rmpc"){ D.pieces.splice(+t.getAttribute("data-i"), 1); rebuild(); }
      else if(a === "newinstead"){ D.forceNew = true; match(); draw(); }
      else if(a === "drop" && !(e.target.closest && e.target.closest("[data-ix-paste], button"))) t.focus();
    });
    w.addEventListener("input", function(e){ var t = e.target; if(t.getAttribute && t.getAttribute("data-ixf")) onInput(t); });
    w.addEventListener("change", function(e){
      var t = e.target;
      if(t.id === "ix-shots" || t.id === "ix-pdf"){ var fl = Array.prototype.slice.call(t.files || []); t.value = ""; readFiles(fl); return; }
      if(t.getAttribute("data-ix") === "opon"){ D.skip[t.getAttribute("data-k")] = !t.checked; draw(); return; }
      if(t.getAttribute("data-ix") === "lp"){ var v = +t.value; D.lpOff = v < 0; if(v >= 0) D.lpTo = v; draw(); return; }
      if(t.getAttribute("data-ixf")) onInput(t);
    });
    ["dragenter", "dragover"].forEach(function(ev){ w.addEventListener(ev, function(e){ e.preventDefault(); var z = w.querySelector(".ix-drop"); if(z) z.classList.add("drag"); }); });
    w.addEventListener("dragleave", function(e){ if(!w.contains(e.relatedTarget)){ var z = w.querySelector(".ix-drop"); if(z) z.classList.remove("drag"); } });
    w.addEventListener("drop", function(e){ e.preventDefault(); var z = w.querySelector(".ix-drop"); if(z) z.classList.remove("drag");
      var df = (e.dataTransfer && e.dataTransfer.files) || []; if(df.length){ readFiles(df); return; }
      var dt = e.dataTransfer && e.dataTransfer.getData("text"); if(dt) addText(dt); });
  }
  document.addEventListener("paste", function(e){
    if(!D) return;
    var w = document.getElementById("imp-dlg"); if(!w) return;
    var files = Array.prototype.filter.call((e.clipboardData && e.clipboardData.files) || [], function(f){ return /^image\//.test(f.type || "") || /pdf/i.test(f.type || ""); });
    var inField = e.target && w.contains(e.target) && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && !(e.target.hasAttribute && e.target.hasAttribute("data-ix-paste"));
    if(!files.length && inField) return;   /* a value pasted into one box */
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    if(files.length){ readFiles(files); return; }
    var tx = e.clipboardData ? e.clipboardData.getData("text") : ""; if(tx) addText(tx);
  }, true);
  document.addEventListener("keydown", function(e){
    if(!D) return;
    if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); close(); return; }
    if((e.ctrlKey || e.metaKey) && e.key === "Enter"){ e.preventDefault(); e.stopPropagation(); apply(); return; }
    var w = document.getElementById("imp-dlg");
    if(e.key === "Tab" && w && !w.contains(document.activeElement)){ e.preventDefault(); var z = w.querySelector(".ix-drop"); if(z) z.focus(); }
    if(!((e.ctrlKey || e.metaKey) && /^[vcxa]$/i.test(e.key))) e.stopPropagation();   /* the page behind doesn't take the keys */
  }, true);
  function open(o){
    o = o || {};
    if(D) close();
    var ro = o.ro ? (typeof o.ro === "string" ? getRO(o.ro) : getRO(o.ro.id) || o.ro) : null;
    D = { ro: ro, new: !ro, fixed: !!ro, acc: blankAcc(), pieces: [], edits: {}, skip: {}, only: false, lpTo: 0, lpOff: false, foundBy: "", busy: "", msg: "", err: "", back: document.activeElement };
    var tf = o.form || {}, mp = { "tr-ro": "roNumber", "tr-cust": "customerName", "tr-vin": "vin", "tr-unit": "unitNumber", "tr-key": "keyTag", "tr-miles": "mileage", "tr-spot": "location" };
    if(!ro) Object.keys(mp).forEach(function(k){ if(tf[k]) D.edits[mp[k]] = String(tf[k]); });
    var w = document.createElement("div"); w.id = "imp-dlg"; w.className = "ix-wrap"; document.body.appendChild(w); document.documentElement.classList.add("ix-open");
    bind(w); draw();
    setTimeout(function(){ var z = w.querySelector(".ix-drop"); if(z) z.focus({ preventScroll: true }); }, 30);
    if(o.text) addText(o.text);
    if(o.files && o.files.length) readFiles(o.files);
    return D;
  }
  return { open: open, close: close, parse: parse, mergeInto: mergeInto, blankAcc: blankAcc, findRo: findRo, mapStatus: mapStatus, describe: describe, parseWhen: parseWhen,
    addText: function(t){ addText(t); }, state: function(){ return D; }, plan: function(){ return D ? plan() : null; }, counts: function(){ return D ? counts(plan()) : null; }, apply: function(){ apply(); }, isOpen: function(){ return !!D; }, statusText: function(m){ return NOW ? String(m).replace(/screenshot \d+ of \d+/i, "screenshot " + NOW[0] + " of " + NOW[1]) : m; }, reader: function(f){ OCRF = f; }, read: function(fl){ return readFiles(fl); } };
})();
