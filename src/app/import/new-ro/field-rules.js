/* Parsec · import/new-ro · field-rules.js
   What each kind of value can hold (17.3): a number, a date, an amount or a part number can't hold letters, so the screenshot reader's O, l, I, S and B are put back as 0, 1, 5 and 8; a VIN is repaired with its check digit.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   dgMap dgToken fixDigits vinRepair lblKey labelFix brandFix DG_STRONG DG_WEAK DG_NUM VIN_SWAP LBL_KNOWN … (7 functions, 6 constants)
   uses       import/ ro/
*/
  /* ============================== what each kind of value can hold (Parsec 17.3) ==============================
     The screenshot reader confuses letters and digits that look alike: O and 0, l / I and 1, S and 5, B and 8, Z and 2.
     A value that can only be a number (miles, hours, an amount, a date, a time, a year) or a part number made of digits
     can't hold those letters, so they are turned back into the digits they stand for — but only where the result is a
     clean number or code, never in a word, a model (VNL64T760) or a VIN. A VIN is repaired separately: its last five
     characters are always digits, and its check digit says which reading is right. */
  var DG_STRONG = { O: "0", o: "0", l: "1", I: "1", "!": "1" };   /* look like 0 or 1 in any font */
  var DG_WEAK = { S: "5", s: "5", B: "8", Z: "2", z: "2", G: "6", g: "9" };                  /* only in an amount, an hour count or a long run of digits */
  var DG_NUM = /^\(?\$?-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?\)?$|^\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}$|^\d{1,2}:\d{2}(?::\d{2})?$/;
  function dgMap(s, weak){ var n = 0; var out = s.replace(/[A-Za-z!]/g, function(ch){ var d = DG_STRONG[ch] || (weak && DG_WEAK[ch]); if(d){ n++; return d; } return ch; }); return { s: out, n: n }; }
  function dgToken(tok, money){
    var m = /^(.*?)([,;:.)]?)$/.exec(tok), core = m[1], tail = m[2];
    if(!core || !/[A-Za-z!]/.test(core)) return tok;
    var digits = (core.match(/\d/g) || []).length;
    /* a number, a date, a time or an amount: at least one real digit, and the rest turns into a clean number */
    if(digits && core.length > 2){
      var weak = /[$.,]/.test(core) || money, r = dgMap(core, weak);
      if(r.n <= digits + 1 && DG_NUM.test(r.s) && !/^[A-Za-z]{2,}/.test(core)) return r.s + tail;
    }
    /* a part number or a code: letters, a dash, then a body that is mostly digits (VOL-2O518417, CL-21O) — or all one run (2l7O7134) */
    var pm = /^([A-Za-z]{1,5}-)?([A-Za-z0-9]+)$/.exec(core);
    if(pm){ var body = pm[2], bd = (body.match(/\d/g) || []).length, len = body.length;
      if(bd >= 2 && (pm[1] ? len >= 3 : len >= 6) && bd / len >= .6){
        var rb = dgMap(body, bd / len >= .75 && len >= 6);
        if(/^\d+$/.test(rb.s) || (pm[1] && /^\d+[A-Z]?$/.test(rb.s))) return (pm[1] || "") + rb.s + tail;
      }
    }
    return tok;
  }
  function fixDigits(t){
    return String(t).split("\n").map(function(line){
      var money = (line.match(/\$?\d[\d,]*\.\d{2}\b/g) || []).length >= 2;
      var out = line.replace(/[^\s]+/g, function(tok){ return dgToken(tok, money); });
      /* a quantity read as a letter, between amounts on a part line */
      if(money) out = out.replace(/(^|\t|\s{2,})[lI|](?=\t|\s{2,}|$)/g, function(x, a){ return a + "1"; });
      return out;
    }).join("\n");
  }
  /* a VIN: I, O and Q are never in one; positions 13–17 are always digits; the check digit (position 9) picks the reading */
  var VIN_SWAP = { S: "5", "5": "S", B: "8", "8": "B", Z: "2", "2": "Z", G: "6", "6": "G" };
  function vinRepair(v){
    v = String(v || "").toUpperCase().replace(/O|Q/g, "0").replace(/I/g, "1");
    if(v.length !== 17) return v;
    var a = v.split(""), i;
    for(i = 12; i < 17; i++) if(/[A-Z]/.test(a[i])) a[i] = { S: "5", B: "8", Z: "2", G: "6", L: "1", D: "0", T: "7" }[a[i]] || a[i];
    v = a.join(""); if(vinValid(v)) return v;
    /* try each look-alike swap, fewest changes first; use it only when one reading alone works */
    var pos = []; for(i = 0; i < 12; i++) if(VIN_SWAP[a[i]] && i !== 8) pos.push(i);
    if(pos.length > 10) return v;
    var best = null, bestN = 99, tie = false;
    for(var mask = 1; mask < (1 << pos.length); mask++){
      var b = a.slice(), n = 0; pos.forEach(function(p, k){ if(mask & (1 << k)){ b[p] = VIN_SWAP[b[p]]; n++; } });
      var s = b.join(""); if(!vinValid(s)) continue;
      if(n < bestN){ best = s; bestN = n; tie = false; } else if(n === bestN) tie = true;
    }
    return best && !tie ? best : v;
  }
  /* a label the reader garbled ("On-ske Asset Location:", "Un'4 #:") is matched to the nearest known label by its letters */
  var LBL_KNOWN = ["Case #", "RO Number", "Customer", "Status", "ETR", "Follow-up", "Created By", "Asset Checked In", "PO #", "Auth #", "Tech Support Case #",
    "Make", "Model", "Year", "VIN", "Unit #", "Serial #", "Engine Serial #", "Engine Hours", "Engine", "Odometer", "Mileage", "Tag #", "Key Tag",
    "On-site Asset Location", "Asset Location", "Location", "Department", "Build Date", "Warranty Start Date"];
  function lblKey(s){ return String(s).toLowerCase().replace(/4/g, "t").replace(/1/g, "l").replace(/0/g, "o").replace(/5/g, "s").replace(/[^a-z]/g, ""); }
  function labelFix(c){
    var m = /^([^:]{2,30}?)\s*:(.*)$/.exec(c); if(!m || labelOf(c)) return c;
    var k = lblKey(m[1]); if(k.length < 2) return c;
    var best = null, bd = 99;
    LBL_KNOWN.forEach(function(L){ var lk = lblKey(L); if(lk[0] !== k[0] || Math.abs(lk.length - k.length) > 2) return; var d = lev(k, lk); if(d < bd){ bd = d; best = L; } });
    return best && bd <= Math.max(1, Math.floor(k.length * .2)) ? best + ":" + m[2] : c;
  }
  /* a make or an engine brand the reader garbled ("VoMo D13") */
  var BRANDS = ["Volvo", "Mack", "Cummins", "Detroit", "Paccar", "Freightliner", "Kenworth", "Peterbilt", "International", "Navistar", "Western Star", "Allison", "Eaton"];
  function brandFix(v){
    return String(v || "").replace(/^[A-Za-z]{3,13}\b/, function(w){
      var lw = w.toLowerCase(), best = null, bd = 99;
      BRANDS.forEach(function(b){ var lb = b.toLowerCase(); if(lb[0] !== lw[0] || Math.abs(lb.length - lw.length) > 1) return; var d = lev(lw, lb); if(d < bd){ bd = d; best = b; } });
      return best && bd > 0 && bd <= (lw.length >= 6 ? 2 : lw.length >= 4 ? 2 : 1) ? best : w; });
  }
