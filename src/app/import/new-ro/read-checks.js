/* Parsec · import/new-ro · read-checks.js
   Checking what was read against itself (17.3): the VIN's model-year letter against the Year, dates in order, the RO number against the shop's others, hours against the labor price, a part's quantity and price against its line total.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   vinYearNear finOf roShape roShapeTxt shopRoShape chkField chkOpHours chkPart chkCount VIN_YR (9 functions, 1 constant)
   uses       import/ ro/
*/
  /* ============================== checking what was read (Parsec 17.3) ==============================
     A value can be read cleanly and still be wrong. These checks compare values that have to agree, and say in plain words
     what doesn't — the dialog shows the message under the value and counts them in "to check". Nothing is changed here. */
  var VIN_YR = "ABCDEFGHJKLMNPRSTVWXY123456789";   /* the 10th character: A = 1980 … Y = 2000, 1 = 2001 … 9 = 2009, then A = 2010 again */
  function vinYearNear(vin, yr){
    var i = VIN_YR.indexOf(String(vin || "").toUpperCase().charAt(9)); if(i < 0) return null;
    var ys = [1980 + i, 2010 + i, 2040 + i]; if(ys.indexOf(yr) > -1) return null;
    return ys.reduce(function(a, b){ return Math.abs(b - yr) < Math.abs(a - yr) ? b : a; });
  }
  function finOf(rows, k){ var r = (rows || []).filter(function(x){ return x.s[0] === k; })[0]; return r && r.fin != null ? r.fin : ""; }
  /* the shape of an RO number: RA0001238877 → RA + 10 digits */
  function roShape(n){ var m = /^([A-Z]*)(\d+)$/.exec(String(n || "").toUpperCase().replace(/[\s-]/g, "")); return m ? m[1] + "|" + m[2].length : "?"; }
  function roShapeTxt(s){ var p = s.split("|"); return (p[0] ? p[0] + " + " : "") + p[1] + " digits"; }
  function shopRoShape(){
    var n = {}, all = 0; realRos().forEach(function(r){ if(!r.roNumber) return; var s = roShape(r.roNumber); n[s] = (n[s] || 0) + 1; all++; });
    var top = Object.keys(n).sort(function(a, b){ return n[b] - n[a]; })[0];
    return all >= 5 && top !== "?" && n[top] / all >= .8 ? top : null;
  }
  function chkField(k, rows){
    var v = finOf(rows, k); if(v === "" || v == null) return "";
    if(k === "vin" || k === "year"){
      var vin = finOf(rows, "vin"), yr = +finOf(rows, "year");
      if(vin && yr && vinValid(vin)){ var near = vinYearNear(vin, yr);
        if(near) return k === "vin" ? "the VIN says a " + near + " truck, but the Year reads " + yr : "the VIN says " + near + " — check the year"; }
    }
    if(k === "promisedAt" || k === "followUpAt"){
      var inAt = finOf(rows, "dateOpened"), a = new Date(v), b = new Date(inAt);
      if(inAt && !isNaN(a) && !isNaN(b) && a < b) return (k === "promisedAt" ? "promised" : "follow-up") + " is before the truck was checked in — check the date";
    }
    if(k === "roNumber"){ var sh = shopRoShape(), mine = roShape(v);
      if(sh && mine !== sh && mine.split("|")[0] === sh.split("|")[0]) return "the shop’s other RO numbers are " + roShapeTxt(sh) + " — a digit may be missing or extra"; }   /* same letters, a different count of digits: a misread */
    return "";
  }
  /* hours against the labor price: 15 h for $315 is $21 an hour — at the shop's rate it's 1.5 h */
  function chkOpHours(hrs, price, rate){
    hrs = +hrs; price = +price; if(!(hrs > 0) || !(price > 0)) return "";
    var shop = rate > 0 ? rate : laborRate(), eff = price / hrs, r = eff / shop;
    if(r >= .5 && r <= 2) return "";
    var fit = Math.round(price / shop * 10) / 10;
    var slip = [10, 100, .1, .01].some(function(f){ return Math.abs(hrs / f - fit) < .051; });
    return hrs.toFixed(1) + " h for " + usd(price) + " is " + usd(eff) + " an hour — at " + usd(shop) + "/h it’s " + fit.toFixed(1) + " h" + (slip ? ", so the decimal point was likely missed" : " — check the hours or the price");
  }
  /* a part line: qty × (price + core) should make its line total */
  function chkPart(qty, price, core, ext){
    var q = parseFloat(qty); if(!isFinite(q) || q <= 0 || ext == null || price == null || price === "") return "";
    var want = q * ((+price || 0) + (+core || 0));
    return Math.abs(want - ext) > .02 ? "qty × price is " + usd(want) + ", the line says " + usd(ext) : "";
  }
  /* everything to check, for the count at the top */
  function chkCount(rows, ops){
    var n = 0;
    (rows || []).forEach(function(r){ if(chkField(r.s[0], rows) || (r.s[0] === "vin" && r.fin && !vinValid(r.fin)) || (r.s[0] === "customerName" && r.fin && mtCustomer(r.fin))) n++; });
    (ops || []).forEach(function(P){ if(!P.on) return; var o = P.o, f = P.f;
      if(chkOpHours(f.quoted ? f.quoted.fin : o.hours, f.estCost ? f.estCost.fin : o.price, o.rate)) n++;
      P.parts.forEach(function(q){ if(chkPart(q.f.qty.fin, q.f.price.fin, q.f.core && q.f.core.fin, q.p.ext) || mtPart(q.p.pn)) n++; }); });
    return n;
  }
