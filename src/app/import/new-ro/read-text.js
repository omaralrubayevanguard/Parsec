/* Parsec · import/new-ro · read-text.js
   Reading the pasted text: labels and cells, dates, money, names, the case fields (RO #, customer, VIN, unit…), operations with complaint / cause / correction, parts and amounts.
   Flow: parse(text) → a fields object; everything else in new-ro works on that.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pad parseWhen whenTxt whenIn money usd nameCase splitCells cellsOf labelOf labelish clean … (44 functions, 21 constants)
   uses       import/ pages/inventory/ ro/ shell/
*/
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
    ["engineSerial", /^(?:eng(?:ine)?\.?\s*(?:serial|s\/n|sn|no\b\.?|number|#)(?:\s*(?:#|no\b\.?|number))?|esn)(?=\s*[:#]|\s+[A-Z0-9]|\s*$)/i],   /* Parsec 14: Engine Serial #, Engine S/N, Engine No., ESN */
    ["built", /^(?:date\s*built|build\s*date|built(?:\s*(?:on|date))?|mfg\.?\s*date|manufactur(?:e|ed|ing)\s*date|production\s*date)(?=\s*[:#]|\s+\d|\s+[A-Z][a-z]{2}|\s*$)/i],   /* Parsec 14.7 */
    ["warrStart", /^(?:warranty\s*(?:start|begin)s?(?:\s*date)?|in[\s-]*service(?:\s*date)?)(?=\s*[:#]|\s+\d|\s+[A-Z][a-z]{2}|\s*$)/i],
    ["engHours", /^engine\s*hours?(?=\s*:|\s*$|\s+\d)/i],
    ["engine", /^engine(?:\s*(?:model|make|type|description))?(?!\s*(?:serial|s\/n|sn|hours?|no\b|number|#))(?=\s*:|\s*$|\s+[A-Z0-9])/i],
    ["miles", /^(?:odometer|mileage|miles)(?=\s*:|\s*$|\s+\d)/i],
    ["tag", /^(?:key\s*(?:#|no\.?|number)|(?:key\s*)?tag\s*(?:#|no\.?|number)?)(?=\s*[:#]|\s+[A-Z0-9]|\s*$|\s*\d)/i],
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
  var MID = /(?<!\b(?:Engine|Eng\.?|Asset|Model|On-?site|Support|Key))\s(?=(?:RO|PO|Auth|Status|ETR|Follow[\s-]*up|Created by|Checked in|Make|Model|Year|VIN|Unit|Serial|Chassis|ESN|Eng\.?\s*(?:Serial|S\/N|SN)|Engine(?:\s*(?:Serial(?:\s*Number)?|S\/N|SN|No\.?|Number|Hours|#))?|Odometer|Mileage|Tag|Location|Department|Dept|Build\s*Date|Date\s*Built|Mfg\.?\s*Date|Warranty\s*Start(?:\s*Date)?|In[\s-]*Service(?:\s*Date)?|Cust(?:omer)?)\s*(?:#|No\.?)?\s*:)/i;
  function cellsOf(l){ var out = []; splitCells(l).forEach(function(c){ c.split(MID).forEach(function(x){ x = x.trim(); if(x) out.push(x); }); }); return out; }
  function labelOf(c){ for(var i = 0; i < LB.length; i++){ var m = LB[i][1].exec(c); if(m) return { k: LB[i][0], m: m }; } return null; }
  var STRONG = /^(?:ro|po|auth|etr|vin|make|model|year|unit|serial|chassis|engine|odometer|mileage|miles|tag|location|department|dept|customer|company|follow|created|case|tech|build|built|date\s*built|mfg|manufactur\w*|production|warranty|in[\s-]*service)\b/i;
  function labelish(c){ return !!labelOf(c) && (/[:#]/.test(c) || STRONG.test(c)); }
  
  function clean(k, v){
    v = String(v || "").replace(/\[\s*(edit|external)\s*\]/gi, "").replace(/^[\s:#.\-–•*]+/, "").replace(/\s+/g, " ").trim();
    if(!v || /^(none|n\/a|na|--?|—|null|not set|tbd)\.?$/i.test(v)) return "";
    var m;
    switch(k){
      case "caseNo": m = /\b([A-Z]?-?\d{4,10})\b/i.exec(v); return m ? m[1] : "";
      case "roNumber": v = v.replace(/[Oo](?=\d)/g, "0").replace(/\b(R[AO]\d{4,10}) (\d{1,6})\b/i, function(m, a, b){ return (a + b).length <= 14 ? a + b : m; });   /* the reader's "RA0001241 190" */
        m = /\b(R[AO][\s-]?\d{4,12}|\d{5,12})\b/i.exec(v); return m ? m[1].replace(/\s/g, "").toUpperCase() : "";
      case "customer": return v.replace(/\s*[-–]?\s*cust(?:omer)?\s*#.*$/i, "").replace(/…|\.\.\.$/, "").trim().slice(0, 60);
      case "status": return /[A-Za-z]{3}/.test(v) ? v.replace(/\s{2,}.*$/, "").slice(0, 40) : "";
      case "etr": case "followUp": case "checkedIn": return parseWhen(v);
      case "createdBy": return nameCase(v);
      case "po": case "auth": case "ts": case "unit": case "tag": case "chassis": case "engineSerial":
        m = /^([A-Z0-9][A-Z0-9\-\/.]*)/i.exec(v); return m && m[1].length <= 24 && (k !== "ts" || /\d/.test(m[1])) && !/^(#|no)$/i.test(m[1]) ? m[1].toUpperCase() : "";
      case "make": v = brandFix(v); m = /^([A-Za-z][A-Za-z\-]{1,20})/.exec(v); return m ? m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase() : "";
      case "model": v = v.replace(/\s{2,}.*$/, "").replace(/\b(?:year|vin|unit|serial|engine)\b.*$/i, "").trim(); return v.length <= 28 && !/^\d{4}$/.test(v) && /[A-Za-z]/.test(v) ? v : "";
      case "year": m = /\b(19[89]\d|20\d{2})\b/.exec(v); return m ? m[1] : "";
      case "vin": return vinFrom(v);
      case "engine": v = brandFix(v).replace(/\b(?:serial|s\/n|engine\s*hours)\b.*$/i, "").replace(/\bD[Il|](\d)(?=\b|[A-Z])/g, "D1$1").trim();   /* Parsec 14: the reader's "DI3" is the D13 */ return v.length <= 40 && /[A-Za-z0-9]/.test(v) && !/^(volvo|mack|cummins|detroit)$/i.test(v) ? v : (/^(volvo|mack|cummins|detroit)$/i.test(v) ? v : "");
      case "miles": case "engHours": m = /^([\d,]{1,11})(?:\.\d+)?/.exec(v.replace(/\s/g, "")); if(!m) return ""; var n0 = m[1].replace(/,/g, ""); return n0 && +n0 <= (k === "miles" ? 9999999 : 999999) ? n0 : "";
      case "location": case "dept": return v.replace(/\s{2,}.*$/, "").slice(0, 30);
      case "built": case "warrStart": return mdyOf(v);   /* Parsec 14.7: kept MM-DD-YYYY, like the RO keeps them */
      default: return v;
    }
  }
  /* Parsec 14.7: a day as the RO keeps it — MM-DD-YYYY — from 03/14/2020, 2020-03-14, Mar 14, 2020, 14 Mar 2020 or Mar 2020 */
  function mdyOf(v){ var s = String(v || "").trim(), m, M = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }, p2 = function(n){ return String(n).padStart(2, "0"); };
    var ok = function(y, mo, d){ y = +y; if(y < 100) y += 2000; mo = +mo; d = +d; return y >= 1980 && y <= new Date().getFullYear() + 2 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31 ? p2(mo) + "-" + p2(d) + "-" + y : ""; };
    if((m = /\b(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})\b/.exec(s))) return ok(m[1], m[2], m[3]);
    if((m = /\b(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4}|\d{2})\b/.exec(s))) return ok(m[3], m[1], m[2]);
    if((m = /\b([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})\b/.exec(s)) && M[m[1].toLowerCase()]) return ok(m[3], M[m[1].toLowerCase()], m[2]);
    if((m = /\b(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s+(\d{4})\b/.exec(s)) && M[m[2].toLowerCase()]) return ok(m[3], M[m[2].toLowerCase()], m[1]);
    if((m = /\b([A-Za-z]{3})[a-z]*\.?\s+(\d{4})\b/.exec(s)) && M[m[1].toLowerCase()]) return ok(m[2], M[m[1].toLowerCase()], 1);
    return ""; }
  /* OCR reads 0 as O and 1 as I — a VIN has neither */
  function vinFrom(v){
    var t = String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    var c = t.match(/[A-Z0-9]{17}/g) || [];
    var fix = function(x){ return x.replace(/O/g, "0").replace(/[IL](?=\d|$)/g, "1").replace(/Q/g, "0"); };
    for(var i = 0; i < c.length; i++){ if(vinValid(c[i])) return c[i]; if(vinValid(fix(c[i]))) return fix(c[i]); }
    for(i = 0; i < c.length; i++){ var r = vinRepair(c[i]); if(vinValid(r)) return r; }   /* 17.3: S for 5, B for 8 — the check digit decides */
    return c[0] ? fix(c[0]) : "";
  }
  /* the RO's own fields, by label */
  function readFields(L){
    var f = {};
    for(var i = 0; i < L.length; i++){
      if(isPartsHead(L[i]) || /\bop\s*#|\boperation\b.*\b(?:labor|approval)\b/i.test(L[i])) continue;   /* a table's header row isn't label: value */
      var C = cellsOf(L[i]);
      for(var ci = 0; ci < C.length; ci++){
        var lb = labelOf(C[ci]); if(!lb && /:/.test(C[ci])){ C[ci] = labelFix(C[ci]); lb = labelOf(C[ci]); }   /* 17.3: a garbled label */
        if(!lb || f[lb.k]) continue;
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
    if(!f.roNumber && (m = /\b(R[AO]\d{6,12})\b/.exec(text.replace(/\bR([AO])O(?=\d)/g, "R$10").replace(/\b(R[AO]\d{4,9}) (\d{1,6})\b/g, function(x, a, b){ return (a + b).length === 12 ? a + b : x; })))) f.roNumber = m[1];   /* Parsec 14: "RA0001241 190" */
    if(!f.vin){ var vv = vinFrom((text.toUpperCase().match(/\b[A-HJ-NPR-Z0-9OIQ]{17}\b/g) || []).join(" ")); if(vv && /^[A-HJ-NPR-Z0-9]{17}$/.test(vv) && vinValid(vv)) f.vin = vv; }
    if(!f.miles && (m = /Last Updated:\s*([\d,]+)\s*miles/i.exec(text))) f.miles = m[1].replace(/,/g, "");
    if(!f.engHours && (m = /Last Updated:\s*([\d,]+)\s*hours/i.exec(text))) f.engHours = m[1].replace(/,/g, "");
    if(!f.engineSerial && (m = /\b(?:ESN|Eng(?:ine)?\.?\s*(?:Serial|S\/N|SN)(?:\s*(?:#|No\.?|Number))?)\s*[:#]?\s*([A-Z0-9][A-Z0-9\-]{4,20})\b/i.exec(text)) && /\d/.test(m[1])) f.engineSerial = m[1].toUpperCase();   /* Parsec 14 */
    return f;
  }
  /* ---- operations: a numbered line starts one; what follows (codes, the story, its parts) belongs to it ---- */
  var AP = /\b(Approved|Pending|Declined|Not Approved|Awaiting Approval|Approval Pending|Pre-?Approved)\b/i;
  var OPH = /^\s*(?:op(?:eration)?\.?\s*#?\s*)?(\d{1,2})\s*[.):\-–]?\s+(?=[A-Za-z])(.+)$/i;
  var OPLBL = { opCode: /\b(?:op(?:eration)?\s*code|job\s*code|labor\s*code)\s*[:#]?\s*([A-Z0-9][A-Z0-9\-\/.]{1,14})/i, vmrs: /\bvmrs(?:\s*code)?\s*[:#]?\s*(\d{3}[-\s]?\d{3}[-\s]?\d{3}|\d{3}-\d{3})/i,
    skill: /\bskill(?:\s*(?:level|code))?\s*[:#]?\s*([A-Z0-9]{1,6})\b/i, priceCode: /\bprice\s*code\s*[:#]?\s*([A-Z0-9]{1,8})\b/i, label: /\blabel(?:\s*status)?\s*[:#]?\s*((?:not\s+)?[A-Za-z][A-Za-z\-]{2,20}(?:\s+[A-Za-z]{3,12})?)/i };
  /* Parsec 14 — the parts table's columns: Part # · Description · Qty · List · Disc · Net / Unit · Core · Ext · Salesman, in the header's order.
     A header cell the reader got a letter wrong in ("Coro", "6xt", "UnK") still counts. */
  var PTH = /(?<![A-Za-z])(op(?:eration)?\s*(?:#|no\.?)?|job\s*#?|part\s*(?:#|no\.?|number)|p\/n|description|qty|quantity|list(?:\s*price)?|net(?:\s*price)?|your\s*price|disc(?:ount)?(?:\s*%)?|unit(?:\s*price)?|sell(?:\s*price)?|price|each|core(?:\s*charge)?|ext(?:ended)?(?:\s*price)?|line\s*total|salesman|sales\s*person)(?![A-Za-z])/gi;
  var PFZ = { description: "desc", quantity: "qty", qty: "qty", unit: "unit", price: "unit", list: "list", net: "unit", discount: "disc", core: "core", ext: "ext", extended: "ext", salesman: "sales" };
  function fz(w, dict){
    w = String(w || "").toLowerCase().replace(/[^a-z0-9]/g, ""); if(w.length < 3 || (w.match(/\d/g) || []).length > 1) return "";
    w = w.replace(/0/g, "o").replace(/1/g, "l").replace(/5/g, "s").replace(/6/g, "e");
    var best = "", bd = 9;
    Object.keys(dict).forEach(function(k){ var d = lev(w, k), lim = k.length >= 5 ? 2 : 1; if((d <= lim || (d <= 2 && w.slice(0, 2) === k.slice(0, 2))) && d < bd){ bd = d; best = dict[k]; } });
    return best;
  }
  function pKeyOf(w){ w = String(w).toLowerCase(); return /^op|^job/.test(w) ? "op" : /^part|^p\/n/.test(w) ? "pn" : /^desc/.test(w) ? "desc" : /^q/.test(w) ? "qty" : /^list/.test(w) ? "list" : /^disc/.test(w) ? "disc" : /^core/.test(w) ? "core" : /^ext|^line/.test(w) ? "ext" : /^sales/.test(w) ? "sales" : "unit"; }
  function colsOf(l){
    var o = [];
    splitCells(l).forEach(function(c){
      var hit = false; String(c).replace(PTH, function(w){ o.push(pKeyOf(w)); hit = true; return w; });
      if(!hit) o.push(/\s/.test(c) ? "" : fz(c, PFZ));
    });
    return o;
  }
  function isPartsHead(l){ var k = colsOf(l).filter(Boolean); return k.length >= 3 && (k.indexOf("pn") > -1 || k.indexOf("qty") > -1) && !/labou?r/i.test(l); }
  function isPn(t){ return /\d/.test(t) && /^[A-Z0-9][A-Z0-9\-\/.]{3,}$/i.test(t) && !/^\$?[\d,]+\.\d{2}$/.test(t) && !/^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/.test(t) && !/^\d{1,3}$/.test(t) && !/^\d{3}-\d{3}-\d{3}$/.test(t); }
  /* one part line: the amounts go to the header's money columns in order when the count matches; otherwise to the arrangement
     where the sums work out — Ext = Qty × (Unit + Core), Net = List less the discount */
  var MKEYS = ["list", "disc", "unit", "core", "ext"];
  function cents(n){ return Math.round(n * 100) / 100; }
  function near(a, b){ return a != null && b != null && Math.abs(a - b) <= Math.max(.02, Math.abs(b) * .005); }
  function fitMoney(vals, keys, q, pct){
    var n = vals.length, best = null, bs = -1e9; if(!n) return {};
    (function rec(start, pick){
      if(pick.length === n){
        var m = {}, s = 0; pick.forEach(function(k, i){ m[k] = vals[i]; });
        if(m.unit != null) s += 2; if(m.ext != null) s += 1; if(m.list != null) s += .2; if(m.core != null) s += .1; if(m.disc != null) s -= .3;
        if(m.ext != null && m.unit != null){ if(near(q * (m.unit + (m.core || 0)), m.ext)) s += 4; else if(m.core == null && m.ext > q * m.unit) s += .5; else s -= 1; }
        if(m.unit != null && m.list != null){ if(pct != null && near(m.list * (1 - pct / 100), m.unit)) s += 3; else if(m.disc != null && near(m.list - m.disc, m.unit)) s += 3; else if(m.unit <= m.list + .005) s += .5; else s -= 2; }
        if(m.ext != null && m.unit == null && m.list != null && near(q * (m.list * (pct != null ? 1 - pct / 100 : 1) + (m.core || 0)), m.ext)) s += 2;
        if(s > bs){ bs = s; best = m; }
        return;
      }
      for(var i = start; i <= keys.length - (n - pick.length); i++) rec(i + 1, pick.concat([keys[i]]));
    })(0, []);
    return best || {};
  }
  function partLine(l, cols, noPn){
    var C = splitCells(l); if(C.length < 2) C = String(l).split(/\s+/);
    var pn = "", qty = "", desc = [], mon = [], who = "", pct = null, opn = null, oi = cols ? cols.indexOf("op") : -1, om;
    /* Parsec 14: the operation the part is for — an Op column, or "Op 1" in the line */
    if(oi > -1 && C.length === cols.length && /^\d{1,2}$/.test(C[oi])){ opn = +C[oi]; C = C.slice(0, oi).concat(C.slice(oi + 1)); }
    else if(oi === 0 && C.length > 3 && /^\d{1,2}$/.test(C[0])){ opn = +C[0]; C = C.slice(1); }
    if(opn == null && (om = /\bop(?:eration)?\.?\s*#?\s*(\d{1,2})\b/i.exec(l))){ opn = +om[1]; C = C.map(function(c){ return c.replace(om[0], "").trim(); }).filter(Boolean); }
    C.forEach(function(c, i){
      var cc = c.replace(/^\$\s*/, "$");
      var cj = !pn && /\s/.test(c) ? c.replace(/^([A-Z]{2,5}-?\d{2,})\s(\d{2,})$/i, "$1$2") : c;   /* a part # the reader split at a gap: VOL-850 13702 */
      if(!pn && cj !== c && isPn(cj)) pn = cj.toUpperCase();
      else if(!pn && isPn(c) && !/\s/.test(c)) pn = c.toUpperCase();
      else if(/^\$?-?[\d,]+\.\d{2}$/.test(cc.replace(/\s/g, ""))) mon.push(money(cc));
      else if(pct == null && /^-?\d{1,2}(?:\.\d{1,2})?\s*%$/.test(c)) pct = Math.abs(parseFloat(c));
      else if(!qty && /^(?:x?\d{1,3}(?:\.0+)?)$/i.test(c)) qty = String(parseFloat(c.replace(/x/i, "")));
      else if(/[A-Za-z]{2}/.test(c)){
        if(i === C.length - 1 && desc.length && /^[A-Z][a-z'\-]+(?:\s+[A-Z][a-z'\-]+){1,2}$|^[A-Z'\-]+,\s*[A-Z'\-]+$/.test(c)) who = nameCase(c);
        else desc.push(c);
      }
    });
    if((!pn && !(noPn && desc.length && mon.length)) || (!mon.length && !qty)) return null;   /* noPn: a line under a parts header can be a part with no number */
    var p = { pn: pn, desc: desc.join(" ").replace(/\s+/g, " ").trim(), qty: qty || "1", price: null, list: null, disc: "", core: null, ext: null, salesman: who }, q = parseFloat(p.qty) || 1;
    if(opn != null) p.op = opn;
    var keys = (cols || []).filter(function(k){ return MKEYS.indexOf(k) > -1; });
    if(pct != null) keys = keys.filter(function(k){ return k !== "disc"; });
    var byOrder = keys.length && keys.length === mon.length;
    if(!keys.length || keys.length < mon.length) keys = pct != null ? ["list", "unit", "core", "ext"] : ["list", "disc", "unit", "core", "ext"];
    var m = {}; if(byOrder) keys.forEach(function(k, i){ m[k] = mon[i]; }); else m = fitMoney(mon, keys, q, pct);
    if(m.unit != null) p.price = m.unit; if(m.list != null) p.list = m.list; if(m.core != null) p.core = m.core; if(m.ext != null) p.ext = m.ext;
    if(pct != null) p.disc = pct + "%"; else if(m.disc != null && m.disc > 0) p.disc = usd(m.disc);
    if(p.price == null && p.list != null) p.price = pct != null ? cents(p.list * (1 - pct / 100)) : m.disc != null ? cents(p.list - m.disc) : p.list;
    if(p.price == null && p.ext != null) p.price = cents(p.ext / q - (p.core || 0));
    if(p.list != null && p.price != null && near(p.list, p.price)) p.list = null;   /* the same number twice is just the price */
    if(p.ext != null && p.price != null && p.core == null){ var c0 = cents((p.ext - p.price * q) / q); if(c0 > 0.004) p.core = c0; }
    if(p.core == null) p.core = 0;
    /* the unit read one digit off (98.00 for 96.00): Ext is the check — qty × (unit + core) */
    if(p.price != null && p.ext != null && q > 0 && Math.abs((p.price + (p.core || 0)) * q - p.ext) > .02){ var u2 = cents(p.ext / q - (p.core || 0)), a1 = p.price.toFixed(2), a2 = u2.toFixed(2);
      if(u2 > 0 && a1.length === a2.length && a1.split("").filter(function(ch, i){ return ch !== a2[i]; }).length === 1) p.price = u2; }
    if(p.desc) p.desc = p.desc.charAt(0).toUpperCase() + p.desc.slice(1);
    return p;
  }
  /* Parsec 14 — every part table in a piece of text (a header row, then its lines): the Parts list import reads quotes with these too */
  function partsTable(raw){
    var L = fixMoney(fixDigits(cleanOcrText(String(raw || "")))).replace(/\r/g, "").split("\n"), cols = null, out = [];
    L.forEach(function(l){ var t = l.trim(); if(!t) return; if(isPartsHead(fixLabels(t))){ cols = colsOf(fixLabels(t)); return; } if(!cols) return; var p = partLine(t, cols, true); if(p) addPart(out, p); });
    return out;
  }
  /* ---- Parsec 14 — an operation's money: Labor hours · Labor rate · Labor · Parts · Misc / shop supplies · Sublet · Total, in the header's order ---- */
  var OPCOL = /(labou?r\s*(?:hours?|hrs?)(?![a-z])|(?<![a-z])(?:hours?|hrs?)(?![a-z]))|(labou?r\s*rate|(?<![a-z])rate(?![a-z]))|(labou?r(?:\s*(?:price|amount|amt|total|cost|sale|\$))?)|((?<![a-z])parts?(?:\s*(?:price|amount|amt|total|cost|sale|\$))?(?![a-z]))|(misc(?:ellaneous)?|shop\s*supplies|supplies|environmental(?:\s*fees?)?|(?<![a-z])fees?(?![a-z]))|(sublet)|((?:op(?:eration)?\s*|line\s*|job\s*|grand\s*)?total|(?<![a-z])amount(?![a-z])|(?<![a-z])ext(?:ended)?(?![a-z]))|((?<![a-z])tax(?:es)?(?![a-z]))/gi;
  var OPK = ["hours", "rate", "labor", "parts", "misc", "sublet", "total", "tax"];
  function opCols(t){
    if(OPH.test(t) || /part\s*(?:#|no\.?|number)|\bqty\b|quantity|salesman/i.test(t) || !/\bop\b|operation|description|\bjob\b|complaint|#/i.test(t)) return null;
    var o = [], m; OPCOL.lastIndex = 0;
    while((m = OPCOL.exec(t))){ for(var g = 1; g <= 8; g++) if(m[g]){ o.push(OPK[g - 1]); break; } }
    return o.length >= 2 && (o.indexOf("hours") > -1 || o.indexOf("labor") > -1) ? o : null;
  }
  /* the numbers after an operation's name, in order — "2.0 hrs", "$210.00/hr", "$1,302.00", "35.00" */
  function opVals(s){
    var out = [], re = /(\$\s?)?(-?\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|-?\d+(?:\.\d{1,2})?)(\s*(?:h|hr|hrs|hours?)(?![a-z]))?(\s*(?:\/\s*h(?:r|our)?|per\s*h(?:ou)?r)(?![a-z]))?(\s*%)?/gi, m;
    s = String(s || "").replace(new RegExp(AP.source, "gi"), " ");
    while((m = re.exec(s))){
      if(m[5]) continue; var v = parseFloat(m[2].replace(/,/g, "")); if(!isFinite(v)) continue;
      if(/[A-Za-z\-\/#]/.test(s.charAt(m.index - 1)) && !m[1]) continue;   /* part of a code (P0401, SPN-3226), not an amount */
      out.push({ v: v, $: !!m[1], d: !!m[1] || (/\.\d{2}$/.test(m[2]) && v >= 10) || /,/.test(m[2]), h: !!m[3], r: !!m[4] });
    }
    return out;
  }
  function opScore(m, X){
    var s = 0, comps = ["labor", "parts", "misc", "sublet"].filter(function(k){ return m[k] != null; });
    if(m.hours != null){ var xh = X.hours; s += 1; if(xh && xh.$) s -= 6; else if(xh && xh.d) s -= 2; if(m.hours > 99) s -= 6; }
    if(m.labor != null){ s += 1;
      if(m.hours > 0){ if(m.rate != null) s += near(m.hours * m.rate, m.labor) ? 4 : -1; else { var rr = m.labor / m.hours; s += rr >= 40 && rr <= 600 ? 2 : -2; } } }
    if(m.total != null){ if(comps.length >= 2) s += near(comps.reduce(function(a, k){ return a + m[k]; }, 0), m.total) ? 4 : -1.5; else s += comps.length && near(m[comps[0]], m.total) ? 1 : .5; }
    if(m.parts != null) s += .3; ["rate", "misc", "sublet", "tax"].forEach(function(k){ if(m[k] != null) s -= .3; });
    Object.keys(X).forEach(function(k){ if(k !== "hours" && X[k] && !X[k].d && m.hours == null) s -= 1; });
    return s;
  }
  /* which amount is which: the header's columns in order when the count matches; otherwise the arrangement where Labor = Hours × Rate and the Total adds up */
  function fitOp(vals, cols){
    var res = {}, X = {}, V = [];
    vals.forEach(function(x){ if(x.r && res.rate == null){ res.rate = x.v; X.rate = x; } else if(x.h && res.hours == null){ res.hours = x.v; X.hours = x; } else V.push(x); });
    var keys = (cols && cols.length ? cols : ["hours", "rate", "labor", "parts", "misc", "sublet", "total"]).filter(function(k){ return res[k] == null; });
    if(!V.length) return res;
    if(V.length > keys.length) V = V.slice(V.length - keys.length);
    if(cols && cols.length && V.length === keys.length){ keys.forEach(function(k, i){ res[k] = V[i].v; X[k] = V[i]; }); return res; }
    var best = null, bs = -1e9;
    (function rec(start, pick){
      if(pick.length === V.length){
        var m = Object.assign({}, res), XX = Object.assign({}, X); pick.forEach(function(k, i){ m[k] = V[i].v; XX[k] = V[i]; });
        var s = opScore(m, XX); if(s > bs){ bs = s; best = m; } return;
      }
      for(var i = start; i <= keys.length - (V.length - pick.length); i++) rec(i + 1, pick.concat([keys[i]]));
    })(0, []);
    delete (best || {}).tax;
    return best || res;
  }
  /* "Labor Rate: $210.00", "Parts: $1,145.00", "Shop Supplies: $18.00", "Sublet: $185.00", "Op Total: $1,898.00" on the lines under an operation */
  var CST = [["rate", /labou?r\s*rate\s*[:#]?\s*\$?\s?([\d,]+(?:\.\d{1,2})?)/i], ["rate", /\$\s?([\d,]+(?:\.\d{2})?)\s*(?:\/\s*h(?:r|our)?|per\s*h(?:ou)?r)(?![a-z])/i],
    ["partsAmt", /(?:^|\s)parts?(?:\s*(?:total|amount|amt|price|\$))?\s*[:#]\s*\$?\s?([\d,]+\.\d{2})/i], ["sublet", /sublet(?:\s*(?:total|amount|\$))?\s*[:#]?\s*\$?\s?([\d,]+\.\d{2})/i],
    ["total", /(?:op(?:eration)?|line|job)\s*total\s*[:#]?\s*\$?\s?([\d,]+\.\d{2})/i]];
  var MISCR = /(?:shop\s*supplies|supplies|misc(?:ellaneous)?|environmental(?:\s*fees?)?|(?<![a-z])fees?)\s*[:#]?\s*\$?\s?([\d,]+\.\d{2})/gi;
  function grabCosts(o, t){
    var got = {}, rest = t, m;
    CST.forEach(function(x){ var mm = x[1].exec(t); if(mm && got[x[0]] == null){ got[x[0]] = money(mm[1]); rest = rest.replace(mm[0], " "); } });
    var ms = null; MISCR.lastIndex = 0; while((m = MISCR.exec(t))){ ms = cents((ms || 0) + (money(m[1]) || 0)); rest = rest.replace(m[0], " "); } if(ms != null) got.misc = ms;
    if(!Object.keys(got).length) return false;
    var words = (rest.replace(/labou?r(?:\s*hours?)?\s*[:#]?\s*\$?[\d.,]+|approval\s*status\s*[:#]?\s*[A-Za-z]+/gi, " ").match(/[A-Za-z]/g) || []).length;
    if(words > 24) return false;   /* a sentence that mentions money, not a line of amounts */
    Object.keys(got).forEach(function(k){ if(o[k] == null) o[k] = got[k]; });
    return true;
  }
  function blankOp(no, name){ return { no: no, name: name, hours: null, price: null, rate: null, partsAmt: null, misc: null, sublet: null, total: null, approval: "", label: "", opCode: "", vmrs: "", skill: "", priceCode: "", story: "", storyBy: "", parts: [] }; }
  function readOps(L){
    var ops = [], cur = null, cols = null, inOps = false, story = null, loose = [], endAt = -1, lblCol = false, ocols = null;
    var opsHead = function(l){ return /^\s*operations?\b/i.test(l) && (/approval|labor|status|hours/i.test(l) || l.trim().length < 14); };
    for(var i = 0; i < L.length; i++){
      var l = L[i], t = l.trim();
      if(opsHead(t)){ inOps = true; continue; }
      if(/^(?:user\s*notes?|system\s*notes?|case\s*notes?|notes|comments|totals?(?:\s*summary)?|case\s*level\s*actions|print\/pdf)\b/i.test(t)){ if(cur){ ops.push(cur); cur = null; } inOps = false; story = null; endAt = i; cols = null; continue; }   /* 17.3: a parts header doesn't reach into the totals or the notes */
      var c0 = splitCells(t);   /* Parsec 14: a "Parts" heading (alone, or the first cell of a line) ends the operations */
      if(/^parts?\s*:?$/i.test(c0[0] || "") && !/\$|\d\.\d{2}/.test(t) && !isPartsHead(t)){ if(cur){ ops.push(cur); cur = null; } inOps = false; story = null; continue; }
      var oc = opCols(fixLabels(t)); if(oc){ ocols = oc; inOps = true; if(/label/i.test(t)) lblCol = true; continue; }   /* Parsec 14: the operations table's header — which amount is which */
      if(/\bop\s*#|operation\b.*\b(labor|approval|hours)/i.test(t) && !OPH.test(t)){ inOps = true; if(/label/i.test(t)) lblCol = true; continue; }   /* the table's own header */
      if(isPartsHead(t)){ cols = colsOf(t); story = null; continue; }
      var hm = OPH.exec(t);
      var looksOp = hm && (inOps || /^\s*op(?:eration)?\.?\s*#?\s*\d/i.test(t) || AP.test(t) || /\b\d{1,2}\.\d{1,2}\b/.test(t) || /\$\s?\d/.test(t)) && !partLine(t, cols) && !/^\d{1,2}[\/-]\d{1,2}/.test(t);
      if(looksOp){
        if(cur) ops.push(cur);
        var rest = hm[2], nm = cjNamePart(rest) || rest.replace(/\s{2,}.*$/, "");
        cur = blankOp(+hm[1], cjClean(nm));
        var after0 = rest.slice(rest.indexOf(nm) + nm.length);
        var ap = AP.exec(rest); if(ap) cur.approval = normAp(ap[1]);
        if(ap && lblCol){ var cl = splitCells(rest), ai = -1; cl.forEach(function(c, x){ if(AP.test(c)) ai = x; }); if(ai > -1 && cl[ai + 1] && /[A-Za-z]{3}/.test(cl[ai + 1]) && !/\$|\d/.test(cl[ai + 1])) cur.label = cl[ai + 1].replace(/\b\w/g, function(c){ return c.toUpperCase(); }); }
        var fv = fitOp(opVals(after0), ocols);   /* Parsec 14: hours, rate, labor, parts, misc, sublet, total */
        cur.hours = fv.hours != null ? fv.hours : cjHours(after0.replace(AP, " ")); cur.price = fv.labor != null ? fv.labor : null;
        ["rate", "parts", "misc", "sublet", "total"].forEach(function(k){ if(fv[k] != null) cur[k === "parts" ? "partsAmt" : k] = fv[k]; });
        if(cur.price == null && !ocols && fv.total != null && cur.partsAmt == null && cur.misc == null && cur.sublet == null){ cur.price = fv.total; delete cur.total; cur.total = null; }
        grabCodes(cur, t); story = null; inOps = true; continue;
      }
      if(cur){
        /* a long name wraps onto the next line: letters only, no numbers, before anything else of the op */
        if(!cur.parts.length && !story && /^[a-z][a-z ,\-]{2,30}$/i.test(t) && t.split(/\s+/).length <= 4 && !labelOf(t) && !HEAD.test(t) && !AP.test(t) && !/story|code|skill|vmrs|label/i.test(t) && i > 0 && OPH.test(L[i - 1].trim())){ cur.name = cjClean(cur.name + " " + t); continue; }
        var sm = /^(?:technician|tech)\s*story\b\s*(.*)$/i.exec(t);
        if(sm){ story = cur; var st0 = sm[1] || "", bm = /^(?:by\s+)?([A-Za-z][A-Za-z'\-]+(?:,?\s+[A-Za-z][A-Za-z'\-]+){1,2})\s*[:\-–]\s*(.*)$/.exec(st0);
          if(bm && /^by\s/i.test(st0) || bm && nameCase(bm[1]) && bm[1].split(/\s+/).length <= 3 && /^[A-Z]/.test(bm[1])){ cur.storyBy = nameCase(bm[1]) || cur.storyBy; st0 = bm[2]; } else st0 = st0.replace(/^[:\-–]\s*/, "");
          cur.story = st0.trim(); continue; }
        var pl = partLine(t, cols);
        if(pl){ addPart(cur.parts, pl); story = null; continue; }
        var gotCode = grabCodes(cur, t), gotCost = grabCosts(cur, t);   /* Parsec 14 */
        if(story && !gotCode && !gotCost && !isPartsHead(t)){ cur.story = (cur.story ? cur.story + " " : "") + t; continue; }
        if(!gotCode){
          var ap2 = AP.exec(t); if(ap2 && !cur.approval) cur.approval = normAp(ap2[1]);
          var lh = /labor\s*hours?\s*[:#]?\s*(\d{1,3}(?:\.\d{1,2})?)/i.exec(t); if(lh) cur.hours = +lh[1]; else if(cur.hours == null && /^\s*[\d.]+\s*(h|hr|hrs|hours?)?\s*$/i.test(t)) cur.hours = cjHours(t);
          var lp = /labor(?:\s*(?:price|amount|total|\$))?\s*[:#]?\s*\$\s?([\d,]+\.\d{2})/i.exec(t); if(lp) cur.price = money(lp[1]);
          var by = /^(?:technician|tech|assigned(?:\s*tech)?)\s*[:#]\s*([A-Za-z ,.'\-]{3,40})$/i.exec(t); if(by) cur.storyBy = cur.storyBy || nameCase(by[1]);
        }
        continue;
      }
      var pl2 = partLine(t, cols, !!cols); if(pl2 && (pl2.pn || !TOTP.test(pl2.desc))) addPart(loose, pl2);   /* 17.3: under a parts header, a line with no part number is still a part (shop rags) */
    }
    if(cur) ops.push(cur);
    /* nothing numbered: the reader every case import already uses (approval words anchor each job) */
    if(!ops.length){
      parseCaseJobs(L).forEach(function(j, i){ var o = blankOp(i + 1, j.name); o.hours = j.hours; o.price = j.cost; o.approval = normAp(j.approval); ops.push(o); });
    }
    ops.forEach(function(o){ o.story = o.story.replace(/\s+/g, " ").trim(); if(o.story) o.story = sentenceCase(o.story);
      var parts0 = ["price", "partsAmt", "misc", "sublet"].filter(function(k){ return o[k] != null; });
      if(o.total != null && parts0.length >= 2){ var sum = cents(parts0.reduce(function(a, k){ return a + o[k]; }, 0)), a1 = o.total.toFixed(2), a2 = sum.toFixed(2);
        if(a1 !== a2 && a1.length === a2.length && a1.split("").filter(function(ch, i){ return ch !== a2[i]; }).length === 1) o.total = sum; } });   /* Parsec 14: $782.50 read for $762.50 */
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
  var TOTP = /(labou?r|parts?|core(?:\s*charges?)?|shop\s*supplies|supplies|misc(?:ellaneous)?|sublet|environmental(?:\s*fees?)?|fees?|tax(?:es)?|grand\s*total|sub\s*-?\s*total|total)(?![a-z])[^$\d\-\n]{0,24}?(-?\$?\s?[\d,]+\.\d{2})/gi;
  function readTotals(L){
    var T = {}, on = false, got = 0;
    var take = function(s){ var m; TOTP.lastIndex = 0; while((m = TOTP.exec(s))){ var k = m[1].toLowerCase(), v = money(m[2]); if(v == null) continue; got++;
      if(/^labo/.test(k)) T.labor = v; else if(/^part/.test(k)) T.parts = v; else if(/^core/.test(k)) T.core = v; else if(/^tax/.test(k)) T.tax = v;
      else if(/^(grand\s*)?total/.test(k)) T.total = v; else if(/^sub/.test(k) && !/^sublet/.test(k)) T.sub = v; else { T.misc = cents((T.misc || 0) + v); if(/^sublet/.test(k)) T.sublet = v; } } };
    L.forEach(function(l){
      var t = l.trim();
      if(/^totals?(?:\s*summary)?\s*:?$/i.test(t) || /^totals?\s*summary\b/i.test(t)){ on = true; take(t.replace(/^totals?\s*(?:summary)?\s*:?/i, "")); return; }
      if(!on){ var im = /(?:^|\s)totals?\s*(?:summary)?\s*:\s*(.+)$/i.exec(t); if(im && !/(?:op(?:eration)?|line|job|parts?)\s*totals?\s*:/i.test(t)) take(im[1]); return; }   /* Parsec 14: "Totals: Labor $… Parts $… Total $…" on one line */
      if(/^(?:user\s*notes?|system\s*notes?|notes|operations?|print\/pdf|case\s*level)\b/i.test(t)){ on = false; return; }
      take(t);
    });
    return got ? T : null;
  }
  /* one piece of text → what it holds */
  /* screenshot text: a label read one letter off ("Customor", "Labcr", "Odomcter") is put back to the label, so the field is still found */
  var LBW = ["customer", "company", "status", "follow", "created", "checked", "odometer", "mileage", "location", "department", "engine", "serial", "chassis",
    "approval", "description", "salesman", "operation", "operations", "complaint", "correction", "technician", "story", "asset", "hours", "labor", "price",
    "totals", "total", "summary", "notes", "parts", "quantity", "number", "system", "extended", "supplies", "support"];
  /* real words that sit near a label — never "fixed" */
  var KEEPW = ["approved", "approve", "approves", "pending", "declined", "labeled", "labelled", "unlabeled", "service", "serviced", "stated", "states", "statuses", "totaled", "partial",
    "noted", "hour", "prices", "priced", "assets", "engines", "series", "serials", "storey", "stores", "systems", "checks", "checker", "created", "creates", "number", "numbers", "summit", "labors", "follows", "followed"];
  function lev(a, b){ var p = [], i, j; for(j = 0; j <= b.length; j++) p[j] = j; for(i = 1; i <= a.length; i++){ var c = [i]; for(j = 1; j <= b.length; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[b.length]; }
  function fixLabels(t){
    return String(t).replace(/[A-Za-z][A-Za-z0-9'’]{3,}/g, function(w){
      var lw = w.toLowerCase(); if(LBW.indexOf(lw) > -1 || KEEPW.indexOf(lw) > -1 || /^\d/.test(w)) return w;
      var n = lw.replace(/8/g, "ti").replace(/4/g, "t").replace(/0/g, "o").replace(/1/g, "l").replace(/['’]/g, ""); if(n.length < 5) return w;
      var best = null, bd = 9;
      LBW.forEach(function(k){ if(Math.abs(k.length - n.length) > 2 || k[0] !== n[0]) return; var d = lev(n, k); if(d < bd){ bd = d; best = k; } });
      if(!best || bd > (n.length >= 6 ? 2 : 1) || (bd === 2 && Math.abs(best.length - n.length) > 1)) return w;
      return w[0] === w[0].toUpperCase() ? best[0].toUpperCase() + best.slice(1) : best; }).replace(/\b(follow)\s*[+~=]\s*(up)\b/gi, "$1-$2").replace(/(^|\t|\s{2,})E\s?T\s?[I1l|]?\s?R(?=\s*[:\t]|\s{2,}|\s+\d)/g, "$1ETR").replace(/\b(Asset)\s+[A-Za-z]{5,9}\s+(In)\b/g, "$1 Checked $2").replace(/(^|\t|\s)E[5$]N(?=\s*[:#\t]|\s+\d)/g, "$1ESN").replace(/\b(Engine|Eng\.?)\s+([Ss5][A-Za-z0-9]{4,6})\b/g, function(m, a, w){ return w.toLowerCase() !== "serial" && lev(w.toLowerCase().replace(/[1l|]/g, "i").replace(/5/g, "s"), "serial") <= 3 ? a + " Serial" : m; });   /* "Engine Sorlel #" */
  }
  /* Parsec 14: "$ 165.00" → "$165.00", "$2 14.50" → "$214.50", "$1.62 1.50" → "$1,621.50", "1.302.00" → "1,302.00" */
  function fixMoney(t){
    return String(t).replace(/\$[ ]+(?=\d)/g, "$")
      .replace(/\$(\d{1,3})(?:([.,])(\d{1,3}))? (\d{1,3})((?:[.,]\d{3})*[.,]\d{2})(?![\d.,])/g, function(m, a, sep, af, bi, br){ if(af == null) return "$" + a + bi + br; if(af.length + bi.length === 3) return "$" + a + "," + af + bi + br; return m; })
      .replace(/(\d{1,3})\.(\d{3})(?=[.,]\d{2}(?!\d))/g, "$1,$2");
  }
  function parse(raw){
    var text = fixMoney(fixDigits(fixLabels(cleanOcrText(String(raw || "")).replace(/\r/g, "").replace(/\u00a0/g, " "))));   /* 17.3: letters read for digits (field-rules.js) */
    var L = text.split("\n").map(function(l){ return l.replace(/[ \t]+$/, ""); }).filter(function(l){ return l.trim(); });
    var f = readLoose(text, L, readFields(L));
    try{ if(typeof v163ReadContact === "function") v163ReadContact(text, L, f); }catch(e){ console.error(e); }   /* Parsec 16.3: the contact and the driver */
    var O = readOps(L), notes = readNotes(L), tot = readTotals(L);
    if(f.status && /^(approved|pending|declined)$/i.test(f.status)) delete f.status;
    var found = [];
    if(f.caseNo || f.roNumber || f.customer || f.status || f.etr || f.cname || f.cphone || f.cemail || f.dname || f.dphone) found.push("case");
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
