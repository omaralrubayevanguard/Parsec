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
