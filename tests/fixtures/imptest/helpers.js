var ACRONYMS = ["DTC","DTCS","EGR","DPF","DEF","SCR","ABS","VIN","PM","DOT","ECM","ECU","VGT","AC","A/C","NOX","SPN","FMI","HVAC","CEL","PTO","APU","TPMS","ASIST","OEM","R&R","RR","MIL","PDI","CVSA","ATS","EATS","ACM","CPC","MCM","TCM","VECU","CAN","J1939","LED"];

var CJ_AP = /\b(Approved|Pending|Declined|Not Approved|Awaiting Approval|Approval Pending)\b/i;

var CJ_JUNK = /^(view details|do inspection|edit|delete|remove|actions?|details|operations?|approval status|approval|labor hours?|labor|hours|parts|total|totals?|status|qty|quantity|op ?#|#|none|cause.*|correction.*|complaint.*|technician.*|tech notes?.*|\[.*\])$/i;

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
/* buildDate/warrantyStart are kept as typed (MM-DD-YYYY), unlike dateOpened which is
   normalized to ISO — so extraction has to produce that same MM-DD-YYYY shape. */
function toMdyDate(s){
  var m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s||""); if(!m) return "";
  return String(m[1]).padStart(2,"0")+"-"+String(m[2]).padStart(2,"0")+"-"+m[3];
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
function cleanOcrText(t){ return String(t || "").replace(/[ \t]*[|¦][ \t]*/g, "\t").replace(/[“”]/g, '"').replace(/‘|’/g, "'"); }
function priceOf(v){ var n = parseFloat(String(v == null ? "" : v).replace(/[$,\s]/g, "")); return isFinite(n) ? n : 0; }
function invPnKey(pn){ return String(pn || "").toUpperCase().replace(/[\s\-.\/]/g, ""); }
function invDescKey(d){ return String(d || "").toLowerCase().replace(/\s+/g, " ").trim(); }
module.exports={sentenceCase,vinValid,cleanVal,toIsoDate,toMdyDate,cjLetters,cjCells,cjHours,cjCost,cjClean,cjRegion,cjNamePart,cjNumbered,cjAnchored,parseCaseJobs,caseNumberVal,xMoneyVals,xUnitPrice,xDate,cleanOcrText,priceOf,invPnKey,invDescKey};
