/* Parsec · import · case-import.js
   The older case import (paste text / PDF): sentence case, VIN check, dates, the case fields and job rows (cj*) — the New RO import builds on these.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   sentenceCase vinValid cleanVal toIsoDate toMdyDate cjLetters cjCells cjHours cjCost cjClean cjRegion cjNamePart … (22 functions, 10 constants)
   uses       access/ pages/inventory/ ro/ state/
*/
/* ============================== CASE IMPORT (paste text / PDF) ============================== */
var ACRONYMS = ["DTC","DTCS","EGR","DPF","DEF","SCR","ABS","VIN","PM","DOT","ECM","ECU","VGT","AC","A/C","NOX","SPN","FMI","HVAC","CEL","PTO","APU","TPMS","ASIST","OEM","R&R","RR","MIL","PDI","CVSA","ATS","EATS","ACM","CPC","MCM","TCM","VECU","CAN","J1939","LED"];
function sentenceCase(s){
  s = String(s||"").replace(/\s+/g," ").trim();
  var letters = s.replace(/[^A-Za-z]/g,""), caps = s.replace(/[^A-Z]/g,"");
  if(!letters || caps.length / letters.length < 0.8) return s;               /* already mixed case: leave it */
  var out = s.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, function(m,a,b){ return a + b.toUpperCase(); });
  return out.replace(/[A-Za-z&\/0-9]+/g, function(w){ return ACRONYMS.indexOf(w.toUpperCase()) > -1 ? w.toUpperCase() : w; });
}
/* VIN check digit (position 9) — North American VINs */
function vinValid(v){
  v = String(v||"").toUpperCase();
  if(!/^[A-HJ-NPR-Z0-9]{17}$/.test(v)) return false;
  var map = {A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9};
  var w = [8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2], sum = 0;
  for(var i = 0; i < 17; i++){ var c = v[i]; sum += (/\d/.test(c) ? +c : map[c]) * w[i]; }
  var chk = sum % 11; return v[8] === (chk === 10 ? "X" : String(chk));
}
function cleanVal(s){
  return String(s||"").replace(/\[\s*(edit|external)\s*\]/gi,"").replace(/^none\.*$/i,"").replace(/^[:\s•*]+/,"").replace(/\s+/g," ").trim();
}
function toIsoDate(s){
  var m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s||""); if(!m) return "";
  return m[3]+"-"+String(m[1]).padStart(2,"0")+"-"+String(m[2]).padStart(2,"0");
}
/* buildDate/warrantyStart are a date only: YYYY-MM-DD (Parsec 16; MM-DD-YYYY before) — extraction writes that shape. */
function toMdyDate(s){
  var m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s||""); if(!m) return "";
  return m[3]+"-"+String(m[1]).padStart(2,"0")+"-"+String(m[2]).padStart(2,"0");
}

/* ---- Case operations. A copied case page comes in different shapes: one row per line with tab-separated
   cells, or one cell per line; with or without the op number. Two readers run and the one that finds more
   jobs wins. ---- */
var CJ_AP = /\b(Approved|Pending|Declined|Not Approved|Awaiting Approval|Approval Pending)\b/i;
var CJ_JUNK = /^(view details|do inspection|edit|delete|remove|actions?|details|operations?|approval status|approval|labor hours?|labor|hours|parts|total|totals?|status|qty|quantity|op ?#|#|none|cause.*|correction.*|complaint.*|technician.*|tech notes?.*|\[.*\])$/i;
function cjLetters(c){ return /[A-Za-z]{3}/.test(c) && !CJ_AP.test(c) && !CJ_JUNK.test(c.trim()) && c.indexOf("$") < 0; }
function cjCells(l){ return String(l).split("\t").map(function(c){ return c.trim(); }).filter(Boolean); }
function cjHours(s){
  var re = /(^|[^$\d.,])(\d{1,3}(?:\.\d{1,2})?)\s*(h|hr|hrs|hours?)?(?![\d,]|\.\d)/gi, m, plain = null;
  while((m = re.exec(String(s || "")))){
    var v = parseFloat(m[2]); if(!isFinite(v) || v > 99) continue;
    if(m[3]) return v;                                                   /* "2.0 hrs" — labelled, take it */
    if(plain === null && m[2].indexOf(".") > -1) plain = v;               /* the first decimal under 100 */
  }
  return plain;
}
/* an operation's dollar amount on a case or estimate line ($ sign, or thousands with a comma) */
function cjCost(s, hrs){
  var all = xMoneyVals(s), skipped = false;
  var v = all.filter(function(x){
    if(x.dollar) return true;
    if(!skipped && hrs != null && Math.abs(x.v - hrs) < 0.001){ skipped = true; return false; }   /* that one is the hours */
    return x.v >= 10;                                                    /* "525.00" with no $ is still a price */
  }).map(function(x){ return x.v; }).filter(function(x){ return x > 0; });
  if(!v.length) return all.some(function(x){ return x.dollar; }) ? 0 : null;
  var mx = Math.max.apply(null, v), rest = v.reduce(function(a, x){ return a + x; }, 0) - mx;
  if(v.length === 1 || Math.abs(rest - mx) <= Math.max(0.05, mx * 0.01)) return mx;   /* the line's own total */
  var t = /\b(?:total|amount|estimate)\b[^\d$]*\$?\s?([\d,]+(?:\.\d{2})?)/i.exec(s); if(t) return parseFloat(t[1].replace(/,/g, ""));
  return Math.round((rest + mx) * 100) / 100;                           /* labor + parts, no total printed */
}
function cjClean(n){
  n = String(n).replace(/\s{2,}.*$/, "");
  var ap = /\s*\b(Approved|Pending|Declined|Not Approved|Awaiting Approval)\b.*$/i.exec(n); if(ap) n = n.slice(0, ap.index);
  n = n.replace(/\s+\$?\d[\d,]*\.\d{2}\b.*$/, "");
  return sentenceCase(n.replace(/^[^A-Za-z0-9]+/, "").trim());
}
function cjRegion(lines){
  var start = -1, end = lines.length, k;
  for(k = 0; k < lines.length; k++){
    var l = lines[k].replace(/\t/g, " ");
    if(start < 0 && /^\s*OPERATIONS?\b/i.test(l) && /APPROVAL|LABOR|STATUS|HOURS/i.test(lines.slice(k, k + 8).join(" "))) start = k + 1;
    else if(start > -1 && /Case Level Actions|Totals Summary|PRINT\/PDF ACTIONS/i.test(l)){ end = k; break; }
  }
  if(start < 0) for(k = 0; k < lines.length; k++){ if(/^\s*Operations\s*$/i.test(lines[k])){ start = k + 1; break; } }
  if(start < 0) return null;
  for(k = start; k < end; k++){ if(/Case Level Actions|Totals Summary|PRINT\/PDF ACTIONS/i.test(lines[k])){ end = k; break; } }
  return lines.slice(start, end);
}
function cjNamePart(c){
  c = String(c || "");
  var ap = CJ_AP.exec(c); if(ap) c = c.slice(0, ap.index);
  c = c.replace(/\s+\$?\d[\d,]*\.\d{2}\b.*$/, "").replace(/\s{2,}.*$/, "");
  c = c.replace(/\s+\$\s?\d[\d,]*(?:\.\d{2})?.*$/, "").replace(/\s+\d{1,2}(?:\.\d{1,2})?\s*(?:h|hr|hrs|hours?)?\.?$/i, "");   /* hours and $ at the end are not part of the name */
  return /[A-Za-z]{3}/.test(c) ? c.trim() : "";
}
/* A: numbered rows — 1, 2, 3… in order, the number inline with the name or on its own line.
   Screenshot text: a long name can wrap, with its first line just above the row's number. */
function cjNumbered(L){
  var jobs = [], cur = null, orphans = [];
  function close(){ if(cur && cur.name) jobs.push(cur); cur = null; }
  for(var i = 0; i < L.length; i++){
    if(/\bOPERATION\b/i.test(L[i]) && /APPROVAL|LABOR|STATUS/i.test(L[i])){ orphans = []; continue; }
    var cells = cjCells(L[i]), joined = cells.join("  ");
    var want = jobs.length + (cur ? 1 : 0) + 1;
    var bare = /^(\d{1,2})[.)]?$/.exec(cells[0] || "");
    var inl = !bare && /^(\d{1,2})[.)]?\s+(.*[A-Za-z]{3}.*)$/.exec(joined);
    var num = bare ? +bare[1] : inl ? +inl[1] : null;
    if(num === want){
      var name = null, rest = "", inline = false;
      if(bare && cells.length > 1){
        var nc = cells.slice(1).filter(cjLetters)[0];
        if(nc){ name = nc; rest = cells.slice(cells.indexOf(nc) + 1).join("  "); }
        else { name = cjNamePart(cells[1]); rest = cells.slice(1).join("  "); }
        inline = true;
      } else if(bare){
        for(var j = i + 1; j < Math.min(L.length, i + 4); j++){
          if(cjLetters(L[j].trim())){ name = cjCells(L[j]).filter(cjLetters)[0] || L[j].trim(); rest = ""; i = j; break; }
          if(/^\d{1,2}[.)]?$/.test(L[j].trim())) break;
        }
      } else {
        name = cjNamePart(inl[2]); rest = inl[2]; inline = true;
      }
      if(name){
        if(inline && orphans.length){
          var pre = orphans.join(" ");
          name = pre.toUpperCase().indexOf(name.toUpperCase()) === 0 ? pre : pre + " " + name;
        }
        orphans = [];
        close();
        cur = { name: cjClean(name.replace(/\s+[a-z]$/, "")), hours: null, approval: "", cost: null };
        var a0 = CJ_AP.exec(rest); if(a0) cur.approval = a0[1];
        cur.hours = cjHours(rest.replace(name, " "));
        cur.cost = cjCost(rest.replace(name, " "), cur.hours);
        continue;
      }
    }
    if(cells.length && cells.every(cjLetters) && cjHours(joined) === null && !/^\d/.test(joined)){ orphans.push(joined.replace(/\s+[a-z]$/, "")); continue; }
    orphans = [];
    if(!cur) continue;
    var ap = CJ_AP.exec(joined); if(ap && !cur.approval) cur.approval = ap[1];
    if(cur.hours === null && !/^\d{1,2}[.)]?$/.test(joined)) cur.hours = cjHours(joined);
    if(cur.cost === null) cur.cost = cjCost(joined, cur.hours);
  }
  close();
  return jobs;
}
/* B: no numbers needed — every approval status is a job; its name is the text cell on that line or just above */
function cjAnchored(L){
  var jobs = [], used = {};
  for(var i = 0; i < L.length; i++){
    var cells = cjCells(L[i]), ap = CJ_AP.exec(L[i]);
    if(!ap || /approval status/i.test(L[i])) continue;
    var name = null, ni = -1;
    var own = cells.filter(cjLetters).filter(function(c){ return !/^\d{1,2}[.)]?$/.test(c); })[0];
    if(own){ name = own; ni = i; }
    else for(var j = i - 1; j >= Math.max(0, i - 5); j--){
      if(used[j]) break;
      if(CJ_AP.test(L[j]) && !/approval status/i.test(L[j])) break;
      var cs = cjCells(L[j]).filter(cjLetters);
      if(cs.length){ name = cs[0]; ni = j; break; }
    }
    if(!name) continue;
    used[ni] = 1;
    var hrs = cjHours(cells.slice(cells.indexOf(own) + 1).join("  ").replace(ap[0], " "));
    for(var k = i + 1; hrs === null && k < Math.min(L.length, i + 5); k++){
      if(CJ_AP.test(L[k]) || cjCells(L[k]).some(cjLetters)) break;
      hrs = cjHours(L[k]);
    }
    for(var k2 = i - 1; hrs === null && k2 > ni; k2--) hrs = cjHours(L[k2]);
    var cst = cjCost(cells.slice(cells.indexOf(own) + 1).join("  ").replace(ap[0], " "), hrs);
    for(var k3 = i + 1; cst === null && k3 < Math.min(L.length, i + 5); k3++){ if(CJ_AP.test(L[k3]) || cjCells(L[k3]).some(cjLetters)) break; cst = cjCost(L[k3]); }
    jobs.push({ name: cjClean(name), hours: hrs, approval: ap[1], cost: cst });
  }
  return jobs;
}
function parseCaseJobs(lines){
  var region = cjRegion(lines);
  var L = region || lines;
  var a = cjNumbered(L), b = cjAnchored(L);
  var best = a.length >= b.length ? a : b;
  var seen = {};
  return best.filter(function(j){ var key = j.name.toLowerCase(); if(!j.name || seen[key]) return false; seen[key] = 1; return true; });
}

/* a reading like "12,408" or "12,408 hrs" — anything else (dates, labels, run-together digits) is not one */
function caseNumberVal(v, unitRe, max){
  v = String(v || "").trim();
  var m = new RegExp("^([\\d,]{1,9})(\\.\\d+)?\\s*(" + unitRe.source + ")?\\.?$", "i").exec(v);
  if(!m) return "";
  var n = m[1].replace(/,/g, "");
  return n && +n <= max ? n : "";
}
window.__px = { parseCaseText: function(t){ return parseCaseText(t); }, parseQuickPart: function(t){ return parseQuickPart(t); }, parsePartsText: function(t){ return parsePartsText(t); } };
function parseCaseText(raw){
  var text = String(raw||"").replace(/\r/g,"").replace(/ /g," ");
  var lines = text.split("\n").map(function(l){ return l.replace(/[ \t]+$/,""); }).filter(function(l){ return l.trim(); });
  var flat = lines.map(function(l){ return l.replace(/\t+/g,"  ").trim(); });
  function field(re, opts){                 /* value after a label on the same line, else on the next line */
    opts = opts || {};
    for(var i = 0; i < flat.length; i++){
      var m = re.exec(flat[i]);
      if(!m) continue;
      var rest = cleanVal(flat[i].slice(m.index + m[0].length));
      if(!rest && flat[i+1] && !opts.sameLineOnly) rest = cleanVal(flat[i+1]);
      if(rest) return rest;
      if(opts.first) return "";
    }
    return "";
  }
  var r = { found: {} };
  function set(k, v, how){ if(v){ r[k] = v; r.found[k] = how || true; } }

  /* RO # */
  var ro = field(/^RO Number\s*:?/i) || field(/^Repair Order\s*:?$/i) || "";
  var roM = /\b(R[AO]\d{6,12})\b/.exec(ro) || /\b(R[AO]\d{6,12})\b/.exec(text);
  set("ro", roM ? roM[1] : "");
  /* Case # — the case's own number, not "Tech Support Case #" */
  var cm = /(?:^|\n)\s*Case\s*#?\s*:?\s*(\d{6,10})\b/i.exec(text) || /\bCase\s+(\d{6,10})\b/.exec(text);
  set("caseNo", cm ? cm[1] : "");
  /* Customer: Customer Info → Company, minus the Cust# */
  var comp = field(/^Company\s*:?/i, { first: true });
  if(!comp){ var ci = flat.indexOf("Customer"); if(ci > -1 && flat[ci+1]) comp = flat[ci+1]; }
  comp = comp.replace(/\s*[-–]\s*Cust\s*#?:?.*$/i, "").replace(/…|\.\.\.$/,"").trim();
  set("cust", comp);
  /* VIN */
  var vin = field(/^VIN\s*:?/i).replace(/\s/g,"").toUpperCase();
  if(!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)){
    var all = text.toUpperCase().match(/\b[A-HJ-NPR-Z0-9]{17}\b/g) || [];
    vin = all.filter(vinValid)[0] || all[0] || "";
  }
  set("vin", vin);
  r.vinOk = vin ? vinValid(vin) : null;
  /* Miles (the box's value often doesn't copy; the "Last Updated: 564,997 miles" line does) */
  var mi = /Last Updated:\s*([\d,]+)\s*miles/i.exec(text);
  var od = caseNumberVal(field(/^Odometer\s*:?/i, { sameLineOnly: false }), /mi(les)?/, 9999999);
  set("miles", od || (mi ? mi[1].replace(/,/g,"") : ""));
  var eh = /Last Updated:\s*([\d,]+)\s*hours/i.exec(text);
  var ehf = caseNumberVal(field(/^Engine Hours\s*:?/i), /h(ou)?rs?/, 999999);
  var ehl = eh ? eh[1].replace(/,/g,"") : "";
  set("engHours", ehf || (ehl && +ehl <= 999999 ? ehl : ""));
  /* engine type — a labelled field first, else an engine code on a line that talks about the engine */
  /* the engine's model first (never its make), then type / family, then an engine code anywhere */
  var ENG_MAKE = /^(volvo|mack|cummins|detroit(?:\s+diesel)?|paccar|navistar|international|cat(?:erpillar)?|dd|ddc)\.?$/i;
  var engPick = function(v){ v = cleanVal(v).replace(/\s{2,}.*$/, ""); if(!v || ENG_MAKE.test(v)) return ""; return engineRaw(v) || (v.length <= 30 && /\d/.test(v) ? v : ""); };
  var engV = engPick(field(/^Engine\s*Model\s*(?:#|No\.?)?\s*:?/i)) || engPick(field(/^Engine\s*(?:Type|Family|Description|Make\s*\/\s*Model)\s*:?/i)) || engPick(field(/^Engine\s*:/i, { sameLineOnly: true }));
  if(!engV){ var em = /\bEngine\s*(?:Model|Type)?\s*[:#-]\s*([^\t|\n]{2,40})/i.exec(text); if(em) engV = engPick(em[1].replace(/\s+(?:Year|Make|Model|Serial|VIN|Engine|Trans\w*)\b.*$/i, "")); }
  if(!engV) flat.some(function(l){ if(!/engine|motor|cummins|volvo|mack|detroit|paccar/i.test(l)) return false; engV = engineRaw(l); return !!engV; });
  var engMk = field(/^Engine\s*(?:Make|Manufacturer|Mfr\.?|Brand)\s*:?/i);
  if(engV && engMk && ENG_MAKE.test(engMk.trim()) && !/[a-z]{4}/i.test(engV.replace(/\d+\s*HP/i, ""))) engV = engMk.trim().charAt(0).toUpperCase() + engMk.trim().slice(1).toLowerCase() + " " + engV;
  set("engType", engV);
  /* truck model — a "Model:" line (never Engine Model or Model Year) */
  var mdlV = field(/^(?:Truck\s+|Vehicle\s+|Unit\s+)?Model(?!\s*Year)\s*:?/i, { sameLineOnly: true });
  if(!mdlV){ var mm = /(?:^|[\s\t])(?:Truck\s+|Vehicle\s+|Unit\s+)?Model(?!\s*Year)\s*:\s*([A-Z0-9][A-Z0-9\- ]{1,20}?)(?=\s{2,}|\t|\s+[A-Z][a-z]+\s*:|$)/im.exec(text.replace(/Engine\s*Model\s*:?[^\n\t]*/gi, "")); if(mm) mdlV = mm[1].trim(); }
  if(mdlV.length > 28 || /^\d{4}$/.test(mdlV)) mdlV = "";
  set("model", mdlV);
  /* technician — "Assigned Tech", "Technician", "Tech Name"; never Tech Support */
  /* "Technician(s): RODRIGUEZ, MIKE", "Assigned To: …", "Mechanic", "Tech: …" — on its own line or inline */
  var TECH_LBL = "(?:Assigned\\s+(?:To|Tech(?:nician)?)|(?:Primary|Lead|Repair)\\s+Tech(?:nician)?|Tech(?:nician)?s?(?:\\s*\\(s\\))?(?:\\s*Name)?|Mechanic)(?!\\s*(?:Support|Notes?|Comments?|Story|Case|Instructions?))";
  var techV = field(new RegExp("^" + TECH_LBL + "\\s*:?", "i"));
  if(!/^[A-Za-z]/.test(techV)){ var tm = new RegExp("\\b" + TECH_LBL + "\\s*[:#]\\s*([A-Za-z][A-Za-z .,'\\-]{1,40})", "i").exec(text); techV = tm ? tm[1] : ""; }
  techV = techV.replace(/\s*[\(\[#].*$/, "").replace(/\s+[-–]\s*\d+.*$/, "").replace(/\s+\d{2,}.*$/, "").replace(/\s{2,}.*$/, "").replace(/\s+(?:Date|Status|Hours?|Labor|Shop|Bay|Phone|Email)\b.*$/i, "").trim();
  var lf = /^([A-Za-z'\-]+),\s*([A-Za-z'\-]+(?:\s+[A-Za-z]\.?)?)$/.exec(techV); if(lf) techV = lf[2] + " " + lf[1];     /* LAST, FIRST */
  techV = techV.replace(/,.*$/, "").trim();
  if(techV === techV.toUpperCase()) techV = techV.toLowerCase().replace(/(^|[\s'\-])([a-z])/g, function(_, a, b){ return a + b.toUpperCase(); });
  if(!/^[A-Za-z][A-Za-z .'\-]{1,40}$/.test(techV) || /^(none|unassigned|n\/a|tbd|support)$/i.test(techV)) techV = "";
  if(techV){ var stf = []; try{ stf = staffList().map(function(x){ return x.name; }).filter(Boolean); }catch(e){}
    var tl = techV.toLowerCase(), hit = stf.filter(function(n){ return n.toLowerCase() === tl; })[0]
      || stf.filter(function(n){ var a = n.toLowerCase().split(/\s+/), b = tl.split(/\s+/); return a[a.length-1] === b[b.length-1] && a[0].charAt(0) === b[0].charAt(0); })[0];
    if(hit) techV = hit; }
  set("tech", techV);
  /* Unit # (asset sidebar, or the "RO # … · Unit # …" strip) */
  var um = /Unit\s*#\s*:?\s*([A-Z0-9][A-Z0-9\-\/]*)/i.exec(text.replace(/\t/g," "));
  set("unit", um && !/^[-—]$/.test(um[1]) ? um[1] : "");
  /* Key tag, location, dates */
  var tg = /\bTag\s*#\s*:?\s*([A-Z0-9][A-Z0-9\-]*)/i.exec(text.replace(/\t/g," "));
  set("tag", tg && !/^none/i.test(tg[1]) ? tg[1] : "");
  set("loc", field(/^On-?site Asset Location\s*:?/i));
  var opened = toIsoDate(field(/^Asset Checked In\s*:?/i)) || toIsoDate(field(/^Created\s*:?/i)) || toIsoDate(field(/^Asset Arrived\s*:?/i));
  set("opened", opened);
  /* Build date and warranty start — printed on the asset / warranty panel of the case page */
  set("buildDate", toMdyDate(field(/^(?:Date Built|Build Date|Mfg\.?\s*Date|Manufacture Date)\s*:?/i)));
  set("warrantyStart", toMdyDate(field(/^(?:Warranty Start(?:\s*Date)?|Warranty Begin(?:\s*Date)?|In[- ]Service Date)\s*:?/i)));
  /* Case level complaint (can wrap onto more lines, until the next label) */
  var comp2 = "";
  for(var i = 0; i < flat.length; i++){
    var m = /^Case Level Complaint\s*:?/i.exec(flat[i]);
    if(!m) continue;
    comp2 = flat[i].slice(m[0].length);
    for(var j = i + 1; j < flat.length && !/^(Cause Description|Correction Description|\[\s*edit\s*\]$)/i.test(flat[j]) && !/:\s*$/.test(flat[j]); j++){
      if(/^\[\s*edit\s*\]$/i.test(flat[j])) break;
      comp2 += " " + flat[j];
    }
    break;
  }
  set("complaint", sentenceCase(cleanVal(comp2)));
  /* Operations: every job on the case, with its labor hours and approval */
  r.jobs = parseCaseJobs(lines);
  r.jobs.forEach(function(j){
    var t = j.name.toLowerCase();
    j.type = /inspection|\bpm\b|service\b|wash/.test(t) ? "PM" : /warrant/.test(t) ? "WARR" : /^(check|diagnos|advise)|diagnos|fault|code|no start|won'?t start|will not start/.test(t) ? "DIAG" : "OP";
    if(j.hours === null) j.hours = 0;
  });
  return r;
}

/* ---- PDF: read the text layer with pdf.js (downloaded once, then kept in your data folder) ---- */
var PDFJS_VER = "5.7.284";
var PDFJS_SRC = [
  { lib: "https://cdn.jsdelivr.net/npm/pdfjs-dist@" + PDFJS_VER + "/build/pdf.min.mjs", worker: "https://cdn.jsdelivr.net/npm/pdfjs-dist@" + PDFJS_VER + "/build/pdf.worker.min.mjs" },
  { lib: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs", worker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs" }
];
var pdfjsPromise = null;
function blobUrlOf(text){ return URL.createObjectURL(new Blob([text], { type: "text/javascript" })); }
function readToolFile(name){
  if(FS.status !== "connected" || !FS.dir) return Promise.resolve(null);
  return FS.dir.getDirectoryHandle("tools").then(function(d){ return d.getDirectoryHandle("pdfjs"); })
    .then(function(d){ return d.getFileHandle(name); }).then(function(fh){ return fh.getFile(); }).then(function(f){ return f.text(); })
    .catch(function(){ return null; });
}
function saveToolFile(name, text){
  if(FS.status !== "connected" || !FS.dir) return Promise.resolve();
  return FS.dir.getDirectoryHandle("tools", { create: true }).then(function(d){ return d.getDirectoryHandle("pdfjs", { create: true }); })
    .then(function(d){ return d.getFileHandle(name, { create: true }); }).then(function(fh){ return fh.createWritable(); })
    .then(function(w){ return w.write(text).then(function(){ return w.close(); }); }).catch(function(){});
}
function loadPdfJs(){
  if(pdfjsPromise) return pdfjsPromise;
  pdfjsPromise = Promise.all([readToolFile("pdf.min.mjs"), readToolFile("pdf.worker.min.mjs")]).then(function(local){
    if(local[0] && local[1]) return { lib: blobUrlOf(local[0]), worker: blobUrlOf(local[1]) };
    function tryAt(i){
      if(i >= PDFJS_SRC.length) throw new Error("offline");
      var s = PDFJS_SRC[i];
      return Promise.all([fetch(s.lib).then(function(r){ if(!r.ok) throw 0; return r.text(); }), fetch(s.worker).then(function(r){ if(!r.ok) throw 0; return r.text(); })])
        .then(function(t){
          saveToolFile("pdf.min.mjs", t[0]); saveToolFile("pdf.worker.min.mjs", t[1]);    /* next time: no internet needed */
          return { lib: blobUrlOf(t[0]), worker: blobUrlOf(t[1]) };
        }, function(){ return tryAt(i + 1); });
    }
    return tryAt(0);
  }).then(function(u){
    return import(u.lib).then(function(mod){ var lib = mod.GlobalWorkerOptions ? mod : (mod.default || mod); lib.GlobalWorkerOptions.workerSrc = u.worker; return lib; });
  });
  pdfjsPromise.catch(function(){ pdfjsPromise = null; });
  return pdfjsPromise;
}
/* PDF text, rebuilt into lines; cells on one line are separated by tabs (like a copied web page) */
function pdfToText(file){
  return Promise.all([loadPdfJs(), file.arrayBuffer()]).then(function(x){
    return x[0].getDocument({ data: new Uint8Array(x[1]) }).promise;
  }).then(function(pdf){
    var pages = [];
    for(var p = 1; p <= pdf.numPages; p++) pages.push(pdf.getPage(p).then(function(pg){ return pg.getTextContent(); }));
    return Promise.all(pages);
  }).then(function(contents){
    var out = [];
    contents.forEach(function(tc){
      var rows = [];
      tc.items.forEach(function(it){
        if(!it.str || !it.str.trim()) return;
        var y = it.transform[5], x = it.transform[4];
        var row = rows.filter(function(r){ return Math.abs(r.y - y) < 3; })[0];
        if(!row){ row = { y: y, items: [] }; rows.push(row); }
        row.items.push({ x: x, w: it.width || 0, s: it.str });
      });
      rows.sort(function(a, b){ return b.y - a.y; });
      rows.forEach(function(r){
        r.items.sort(function(a, b){ return a.x - b.x; });
        var line = "", lastEnd = null;
        r.items.forEach(function(it){
          if(lastEnd !== null) var gap = it.x - lastEnd; line += (gap > 14 ? "\t" : (gap > 1.5 || gap < -1 ? " " : ""));
          line += it.s; lastEnd = it.x + it.w;
        });
        out.push(line);
      });
    });
    return out.join("\n");
  });
}

/* ---- New RO dialog wiring ---- */
var IMPORT_FILL = [["ro","f-ro"],["cust","f-cust"],["vin","f-vin"],["miles","f-miles"],["unit","f-unit"],["loc","f-loc"],["tag","f-tag"],["caseNo","f-case"],["opened","f-opened"]];
/* Build date / warranty start have no field in the New RO dialog — the tech edits them
   later, in the RO's own details pane — so the extraction just stashes them here and
   submit-add-ro picks them up when the RO is created. */
var pendingImportBuilt = "", pendingImportWarrStart = "";
var importPdfFile = null;
