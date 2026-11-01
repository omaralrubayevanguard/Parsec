/* Parsec · pages/assets · sample-fleet.js
   The sample fleet for the Assets page (asSampleFleet).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   asHash asSampleFleet (2 functions)
   state      ros
   uses       ro/ state/
*/
/* ============================== Assets (Parsec 14) ==============================
   Every truck anyone in the shop has worked on — one row per truck (its VIN; the unit # and customer when there's no VIN),
   for checking a truck's history: every visit (the RO, its complaints, operations, parts, techs, cost, miles and engine hours
   that day), repeat repairs (the same system or part back within 90 days, or an operation marked as a comeback), lifetime
   totals and the miles and engine hours over time. Like Manager → Fleets, for single trucks. Reads STATE.ros — open and closed. */
/* the sample history: some of each customer's earlier visits are the trucks the shop already knows, so a truck has a history
   to show — miles and hours wound back by the days between (only the sample, never a shop's own data) */
function asHash(s){ var h = 2166136261; s = String(s || ""); for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function asSampleFleet(H){
  if(!Array.isArray(H) || !H.length) return 0;
  var DAY = 864e5, ms = function(t){ var n = t ? new Date(t).getTime() : NaN; return isFinite(n) ? n : null; };
  var F = ["vin", "unitNumber", "year", "make", "model", "engineType", "axles", "cab", "sleeper", "engineSerial"];
  var pool = {}, busy = {};
  (STATE.ros || []).forEach(function(r){ if(!r || r.shop || r.id === SHOP_RO_ID || !r.sample || r.hist || !r.vin) return;
    (pool[r.customerName] = pool[r.customerName] || []).push({ src: r, from: ms(r.dateOpened), mi: +String(r.mileage || "").replace(/\D/g, "") || 0, hr: +String(r.engineHours || "").replace(/\D/g, "") || 0, at: ms(r.dateOpened), cur: 1 });
    (busy[r.vin] = busy[r.vin] || []).push([ms(r.dateOpened), r.dateClosed ? ms(r.dateClosed) : Infinity]); });
  var n = 0;
  H.slice().sort(function(a, b){ return (ms(b.dateOpened) || 0) - (ms(a.dateOpened) || 0); }).forEach(function(r){   /* newest first: miles wind back from the truck we know */
    var P = pool[r.customerName], h = asHash(r.roNumber + "|fleet"), a = ms(r.dateOpened), b = ms(r.dateClosed) || a;
    if(P && P.length && h % 100 < 62){
      var t = P[(h >>> 8) % P.length];
      var free = !(busy[t.src.vin] || []).some(function(w){ return a <= w[1] + DAY / 2 && b >= w[0] - DAY / 2; });
      if(free && b < t.at){
        var days = (t.at - a) / DAY, mpd = 230 + asHash(t.src.vin) % 260;
        F.forEach(function(k){ if(t.src[k] != null && t.src[k] !== "") r[k] = t.src[k]; });
        r.mileage = String(Math.max(1200, Math.round((t.mi - days * mpd) / 10) * 10));
        r.engineHours = String(Math.max(150, Math.round(t.hr - days * mpd / 34)));
        (busy[t.src.vin] = busy[t.src.vin] || []).push([a, b]);
        P.push({ src: t.src, mi: +r.mileage, hr: +r.engineHours, at: a });   /* the next one back starts from here */
        n++; return;
      }
    }
    /* a truck seen only in the history — later visits can be this one too */
    (pool[r.customerName] = pool[r.customerName] || []).push({ src: r, mi: +String(r.mileage || "").replace(/\D/g, "") || 0, hr: +String(r.engineHours || "").replace(/\D/g, "") || 0, at: a });
    (busy[r.vin] = busy[r.vin] || []).push([a, b]);
  });
  return n;
}
