/* Parsec · import/new-ro · matching.js
   Matching what was read to what the shop already has: the same RO (number, unit + customer), the same operation; merging a second paste into the first.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   nn sim blankAcc noteKey sameOp mergeInto nzRo realRos findRo mapStatus (10 functions)
   state      ros
   uses       ro/ state/
*/
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
      else ["hours", "price", "rate", "partsAmt", "misc", "sublet", "total", "approval", "label", "opCode", "vmrs", "skill", "priceCode", "storyBy"].forEach(function(k){ if(o[k] !== "" && o[k] != null) a[k] = o[k]; });
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
    if(/sublet|sent\s*out|outside\s*vendor/.test(s)) return "Waiting – Sublet";   /* Parsec 14.6 */
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
