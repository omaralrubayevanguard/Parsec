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
    var L = cleanOcrText(String(raw || "")).replace(/\r/g, "").split("\n"), cols = null, out = [];
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
