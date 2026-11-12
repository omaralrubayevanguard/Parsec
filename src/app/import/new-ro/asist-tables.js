/* Parsec · import/new-ro · asist-tables.js
   ASIST's Operations and Parts tables copied from the browser (17.5): each row read as a stream of cells under the header's columns, so the boxes the copy puts on lines of their own land in the right column; ASIST's buttons and notes skipped.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   asxNum asxIsNum asxIsPn asxCells asxOnly asxCols asxPartsHead asxParts asxOpsHead asxOps asxJunk asxRead … (12 functions, 5 constants)
   uses       import/ ro/
*/
  /* ---------------------------------------------------------------- the cells */
  var ASX_NOISE = /^(?:get parts availability|catalog|update|delete|update delete|add row|submit parts|actions|info|need more info\??|\(none\)|view details|edit|remove|schedule|—|-|–|•)$/i;
  var ASX_END = /^(?:hit enter to add a row|submit parts|case level actions|totals summary|totals?\b|notes?\b|story\b|complaint\b)/i;
  function asxNum(c){ var s = String(c).replace(/[\s$,]/g, ""); return /^-?\d*\.?\d+$/.test(s) && /\d/.test(s) ? +s : null; }
  function asxIsNum(c){ return asxNum(c) != null && !/[A-Za-z]/.test(c); }
  /* a part number: one word, a digit in it, not a plain amount (1.00, $74.99) */
  function asxIsPn(c){ c = String(c); return c.length >= 3 && c.length <= 32 && /\d/.test(c) && /^[A-Za-z0-9][A-Za-z0-9\-\/._]*$/.test(c) && !/^-?\d+\.\d+$/.test(c); }
  /* the text after a header line as cells, each with the line it came from; ASIST's buttons and notes left out */
  function asxCells(L, from){
    var out = [];
    for(var i = from; i < L.length; i++){
      if(ASX_END.test(L[i].trim())) break;
      L[i].split("\t").forEach(function(c){
        c = c.replace(/ /g, " ").trim().replace(/\s+Catalog$/i, "").trim();
        if(!c || ASX_NOISE.test(c) || /^\(\s*-?[\d.]+\s*\/\s*-?[\d.]+\s*\)$/.test(c)) return;   /* the shipped / back-order note: not wanted */
        if(!/[A-Za-z0-9]/.test(c)) return;                                                       /* icons: ⠿ ↙ ⚙ */
        out.push({ c: c.replace(/^[^A-Za-z0-9$\-(]+/, "").trim(), l: i });
      });
    }
    return out;
  }
  /* this layout only: every header cell is one of ASIST's columns (the older case page's tables — Op #, Labor rate, List, Disc — are read as before) */
  function asxOnly(head, map, extra){ var c = head.split("\t").map(function(h){ return h.replace(/[•*]/g, "").trim(); }).filter(Boolean); return c.length >= 4 && c.every(function(h){ if(extra.test(h)) return true; for(var k in map) if(map[k].test(h)) return true; return false; }); }
  /* the header's columns, in order, by name */
  function asxCols(head, map){ var cols = []; head.split("\t").forEach(function(h){ h = h.trim(); for(var k in map) if(map[k].test(h)){ cols.push(k); break; } }); return cols; }

  /* ---------------------------------------------------------------- the Parts table */
  var ASX_PH = /\bpart\s*(?:no\.?|#|number)\b/i;
  var ASX_PCOL = { pn: /^part\s*(?:no\.?|#|number)$/i, qty: /^qty\b/i, desc: /^(?:part\s*name|description)$/i, unit: /^unit\s*price$|^price$|^net$/i, core: /^core(?:\s*price)?$/i, ext: /^ext\.?(?:\s*price)?$|^extended$/i, sales: /^salesman$|^sales\s*person$/i };
  function asxPartsHead(l){ return ASX_PH.test(l) && /\t/.test(l) && /unit\s*price|ext\.?\s*price|core\s*price/i.test(l) && asxOnly(l, ASX_PCOL, /^(?:parts|info|actions)$/i); }
  function asxParts(L, h){
    var cols = asxCols(L[h], ASX_PCOL), money = cols.filter(function(k){ return k === "unit" || k === "core" || k === "ext"; }); if(!money.length) money = ["unit", "core", "ext"];
    var C = asxCells(L, h + 1), parts = [], last = h, i = 0;
    while(i < C.length){
      if(!asxIsPn(C[i].c) || !C[i + 1] || !asxIsNum(C[i + 1].c)){ i++; continue; }
      var pn = C[i].c, qty = asxNum(C[i + 1].c), j = i + 2, name = [];
      while(j < C.length && !asxIsNum(C[j].c)) name.push(C[j++].c);
      var m = {}; money.forEach(function(k){ if(j < C.length && asxIsNum(C[j].c)) m[k] = asxNum(C[j++].c); });
      if(m.unit == null && m.ext == null){ i++; continue; }                       /* a part number and a quantity alone aren't a row */
      var who = "";
      if(cols.indexOf("sales") > -1 && C[j] && !asxIsNum(C[j].c) && !/\d/.test(C[j].c) && /[A-Za-z]{2}/.test(C[j].c)){ who = nameCase(C[j].c); j++; }
      var p = { pn: pn, desc: name.join(" ").replace(/\s+/g, " ").trim(), qty: String(qty), price: m.unit != null ? m.unit : null, list: null, disc: "", core: m.core || 0, ext: m.ext != null ? m.ext : null, salesman: who };
      if(p.price == null && p.ext != null && qty) p.price = cents(p.ext / qty - p.core);
      if(p.ext == null && p.price != null) p.ext = cents(qty * (p.price + p.core));
      /* a core return: ASIST shows quantity 0 and a minus line total; the count returned is the total over the core */
      if(!qty && p.ext < 0 && (p.price || 0) + p.core > 0) p.qty = String(Math.round(p.ext / ((p.price || 0) + p.core) * 100) / 100);
      parts.push(p); last = C[j - 1].l; i = j;
    }
    return { parts: parts, last: last };
  }

  /* ---------------------------------------------------------------- the Operations table */
  var ASX_OCOL = { name: /^operation$/i, ap: /^approval(?:\s*status)?$/i, label: /^label$/i, hours: /^labou?r\s*hours?$|^hours$/i, parts: /^parts$/i, total: /^total$/i };
  function asxOpsHead(l){ return /\toperation|^\s*operation/i.test(l) && /labou?r\s*hours/i.test(l) && /\btotal\b/i.test(l) && asxOnly(l, ASX_OCOL, /^$/); }
  function asxOps(L, h){
    var cols = asxCols(L[h], ASX_OCOL), nums = cols.filter(function(k){ return k === "hours" || k === "parts" || k === "total"; }); if(!nums.length) nums = ["hours", "parts", "total"];
    var C = asxCells(L, h + 1), ops = [], last = h, i = 0;
    var starts = function(k){ return C[k] && /^\d{1,2}$/.test(C[k].c) && C[k + 1] && /[A-Za-z]{3}/.test(C[k + 1].c) && !AP.test(C[k + 1].c); };
    while(i < C.length){
      if(!starts(i)){ i++; continue; }
      var o = blankOp(+C[i].c, cjClean(C[i + 1].c)), j = i + 2, n = {};
      while(j < C.length && !starts(j)){
        var c = C[j].c;
        if(AP.test(c) && !o.approval) o.approval = normAp(AP.exec(c)[1]);
        else if(asxIsNum(c)){ var k = nums.filter(function(x){ return n[x] == null; })[0]; if(!k) break; n[k] = asxNum(c); }
        else if(cols.indexOf("label") > -1 && !o.label && n.hours == null && /[A-Za-z]{2}/.test(c)) o.label = c;
        else break;
        j++;
      }
      if(n.hours == null && n.total == null){ i++; continue; }
      if(n.hours != null) o.hours = n.hours;
      if(n.parts != null) o.partsAmt = n.parts;
      if(n.total != null) o.total = n.total;
      if(n.total != null) o.price = cents(n.total - (n.parts || 0));   /* ASIST's Parts column is parts money: labor is the total less the parts */
      ops.push(o); last = C[j - 1].l; i = j;
    }
    return { ops: ops, last: last };
  }

  /* ---------------------------------------------------------------- both, out of the text */
  function asxJunk(l){ return !l.trim() || l.split("\t").every(function(c){ c = c.trim(); return !c || ASX_NOISE.test(c) || !/[A-Za-z0-9]/.test(c) || asxIsNum(c); }); }
  function asxRead(raw){
    var L = String(raw || "").replace(/\r/g, "").split("\n"), ops = [], parts = [], keep = L.map(function(){ return true; }), i = 0;
    while(i < L.length){
      var r = asxPartsHead(L[i]) ? asxParts(L, i) : asxOpsHead(L[i]) ? asxOps(L, i) : null;
      if(!r || !((r.parts || r.ops).length)){ i++; continue; }
      if(r.parts) parts = parts.concat(r.parts); else ops = ops.concat(r.ops);
      var end = r.last; while(end + 1 < L.length && asxJunk(L[end + 1])) end++;   /* blank lines, the empty add-row: 1.00 · (NONE) · ADD ROW */
      if(end + 1 < L.length && /^(?:hit enter to add a row|submit parts)/i.test(L[end + 1].trim())) end++;   /* the parts table's own footer */
      for(var k = i; k <= end; k++) keep[k] = false;
      i = end + 1;
    }
    return { ops: ops, parts: parts, rest: L.filter(function(l, k){ return keep[k]; }).join("\n") };
  }
