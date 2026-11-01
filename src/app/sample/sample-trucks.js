/* Parsec · sample · sample-trucks.js
   Sample trucks from the catalog: a real Volvo body built that year, per sample RO.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   s25Truck S25_MAIN (1 function, 1 constant)
   uses       trucks/
*/
/* ---------- sample trucks from the catalog: a real Volvo body built that year — model, configuration (axles and cab), sleeper ---------- */
var S25_MAIN = ["VNL", "VNR", "VHD", "VAH", "VNX"];
function s25Truck(rnd, yr){
  var cy = new Date().getFullYear(), to = function(p){ return p.to >= 2026 ? cy + 1 : p.to; }, fam = function(p){ return p.family === "VN" ? "VNL" : p.family; };
  var ok = function(p){ return S25_MAIN.indexOf(fam(p)) > -1 && /^\d{3}$/.test(p.cab); };
  var L = VT_P.filter(function(p){ return ok(p) && yr >= p.from && yr <= to(p); }); if(!L.length) L = VT_P.filter(ok);
  var W = []; L.forEach(function(p){ var w = fam(p) === "VNL" ? 4 : fam(p) === "VNR" ? 2 : 1; for(var k = 0; k < w; k++) W.push(p); });
  var p = W[Math.floor(rnd() * W.length)], y = yr >= p.from && yr <= to(p) ? yr : p.from + Math.floor(rnd() * (Math.max(p.from, Math.min(to(p), cy)) - p.from + 1));
  var b = String(p.body || ""), inch = /(\d{2})-inch/.exec(b), day = /no sleeper|without sleeper|day cab/i.test(b) || /^(200|300)$/.test(p.cab);
  var cab = day ? "Day cab" : /flat/i.test(b) ? "Flat-roof sleeper" : /mid-roof/i.test(b) ? "Mid-roof sleeper" : "High-roof sleeper";
  var axles = day && fam(p) !== "VHD" && fam(p) !== "VAH" && rnd() < 0.4 ? (rnd() < 0.5 ? "4x2" : "6x2") : "6x4";
  return { year: y, model: fam(p) + " " + p.cab, axles: axles, cab: cab, sleeper: !day && inch ? inch[1] + "-inch" : "", body: p.id };
}
