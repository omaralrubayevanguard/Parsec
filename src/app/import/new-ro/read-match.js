/* Parsec · import/new-ro · read-match.js
   Matching what was read to what Parsec already knows (17.3): a customer spelled one letter off, the truck by its VIN or unit, a part number one character off a known one, what a fault code means.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   mtKey mtCustomer mtTruck mtPartKeys mtPart mtCodes mtNote MT_PN MT_PN_AT (7 functions, 2 constants)
   uses       kit/ library/ pages/inventory/
*/
  /* ============================== matching to what Parsec knows (Parsec 17.3) ==============================
     The shop's own records are the best spell-check. A customer read as "Summit Frieghtways" is the Summit Freightways
     already on file; a VIN the shop has seen brings its unit; a part number one character off a part the shop has used is
     probably that part; a fault code shows what it means, so a misread code stands out. Each is offered, never forced:
     the dialog shows it under the value with a button to use it. */
  function mtKey(s){ return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
  /* the customer: one or two letters off a customer on file */
  function mtCustomer(name){
    var k = mtKey(name); if(k.length < 4) return "";
    var seen = {}, best = "", bd = 99, exact = false;
    realRos().forEach(function(r){ var n = String(r.customerName || "").trim(), nk = mtKey(n); if(!nk || seen[nk]) return; seen[nk] = 1;
      if(nk === k){ exact = true; return; }
      if(Math.abs(nk.length - k.length) > 2 || nk[0] !== k[0]) return;
      var d = lev(k, nk); if(d < bd){ bd = d; best = n; } });
    return !exact && best && bd <= Math.max(1, Math.floor(k.length * .12)) ? best : "";
  }
  /* the truck: the newest RO with the same VIN — or, with no VIN read, the same unit for the same customer */
  function mtTruck(vin, unit, cust){
    var vk = mtKey(vin).toUpperCase(), uk = mtKey(unit), ck = mtKey(cust), hit = null, by = "";
    realRos().forEach(function(r){
      var same = vk.length >= 11 ? mtKey(r.vin).toUpperCase() === vk : (uk && ck && mtKey(r.unitNumber) === uk && mtKey(r.customerName) === ck && r.vin);
      if(!same) return;
      if(!hit || String(r.dateOpened || r.createdAt || "") > String(hit.dateOpened || hit.createdAt || "")){ hit = r; by = vk.length >= 11 ? "VIN" : "unit"; }
    });
    return hit ? { ro: hit, by: by } : null;
  }
  /* part numbers the shop has used: Inventory and every RO's parts */
  var MT_PN = null, MT_PN_AT = 0;
  function mtPartKeys(){
    if(MT_PN && Date.now() - MT_PN_AT < 5000) return MT_PN;
    var K = {};
    try{ invList().forEach(function(it){ [it].concat(it.children || []).forEach(function(x){ var k = invPnKey(x.pn); if(k) K[k] = x.pn; }); }); }catch(e){}
    realRos().forEach(function(r){ (r.operations || []).forEach(function(o){ (o.parts || []).forEach(function(p){ var k = invPnKey(p.partNumber); if(k && !K[k]) K[k] = p.partNumber; }); }); });
    MT_PN = K; MT_PN_AT = Date.now(); return K;
  }
  /* a part number the shop doesn't know, one character off one it does (VOL-85O13702 for VOL-85013702) */
  function mtPart(pn){
    var k = invPnKey(pn); if(k.length < 5) return "";
    var K = mtPartKeys(); if(K[k]) return "";
    var best = "", n = 0;
    Object.keys(K).forEach(function(x){ if(x.length !== k.length) return; var d = 0; for(var i = 0; i < x.length && d < 2; i++) if(x[i] !== k[i]) d++; if(d === 1){ best = K[x]; n++; } });
    return n === 1 ? best : "";
  }
  /* what the fault codes in an operation mean, so a misread code stands out */
  function mtCodes(o){
    if(typeof libCodesIn !== "function") return [];
    return libCodesIn([o.name, o.story].join(" ")).slice(0, 3).map(function(c){ var f = null, sp = /^SPN (\d+)$/.exec(c); try{ f = sp ? { spn: +sp[1], fmi: null } : libCodeParse(c); }catch(e){} var m = f ? libCodeMeaning(f) : "";
      return m && m !== c && !/not in the Library yet/.test(m) ? { code: c, meaning: m.split(" — ")[0] } : null; }).filter(Boolean);   /* "SPN 3226" alone has no FMI */
  }
  /* the note under a value in the dialog: the customer on file, the truck on file */
  function mtNote(k, r){
    var rows = D.rowsNow, b = function(key, v, t){ return ' <button class="ix-lk" data-ix="usev" data-k="' + key + '" data-v="' + esc(v) + '">' + t + '</button>'; };
    if(k === "customerName" && r.fin){ var c = mtCustomer(r.fin); return c ? '<span class="ix-bad">on file as <b>' + esc(c) + '</b></span>' + b("customerName", c, "Use it") : ""; }
    if(k === "vin"){
      var T = mtTruck(r.fin, finOf(rows, "unitNumber"), finOf(rows, "customerName")); if(!T) return "";
      var ro = T.ro, u = finOf(rows, "unitNumber");
      if(T.by === "unit" && !r.fin) return 'the shop has this truck’s VIN' + b("vin", ro.vin, "Use it");
      if(T.by !== "VIN") return "";
      var t = 'a truck the shop knows' + (ro.unitNumber ? ' — Unit ' + esc(ro.unitNumber) : '') + (ro.customerName ? ' · ' + esc(ro.customerName) : '');
      if(ro.unitNumber && mtKey(ro.unitNumber) !== mtKey(u)) t += b("unitNumber", ro.unitNumber, "Use unit " + esc(ro.unitNumber));
      return t;
    }
    return "";
  }
