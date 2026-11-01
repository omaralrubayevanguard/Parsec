/* ============================== Parsec 12.3 — shared: one color per clock reason, everywhere; job type colors; the truck line ==============================
   Colors are CSS vars (--rc-<reason key>, --jt-<type key>) in the main document and in the RO page's shadow root (b9/v123.css, b9/v123_jc.css).
   reasonVar(r) (core) gives "var(--rc-k)"; jtVar(k) gives "var(--jt-k)". truckLine(ro) is the line under the RO's name. */
var JT_KEY = { OP: "op", DIAG: "diag", PM: "pm", WARR: "warr", COMEBACK: "cb", SUBLET: "sub", RECALL: "rec" };
function jtVar(k){ return "var(--jt-" + (JT_KEY[k] || "op") + ")"; }
function truckCfg(ro){ return ro ? [ro.axles, ro.cab].filter(function(x){ return x && String(x).trim(); }).join(" · ") : ""; }
function truckLine(ro){
  if(!ro) return ""; var t = {}; try{ t = truckYM(ro) || {}; }catch(e){}
  var y = +(ro.year || t.year) || "", mk = ro.make || t.make || "", md = ro.model || t.model || "";
  return [[y, mk, md].filter(Boolean).join(" "), truckCfg(ro), ro.sleeper || ""].filter(function(x){ return x && String(x).trim(); }).join(" · ");
}

/* ---------- the sidebar's theme strip: four swatches above you; folded, one swatch that moves on to the next ---------- */
var PX_THS = [["ivl", "Ivory", "#F2F0EA", "#86643A"], ["ivd", "Graphite", "#151514", "#D1B184"], ["vvl", "White", "#FFFFFF", "#245cdb"], ["vvd", "Near black", "#0b0d10", "#8aafff"]];
function pxThemeStrip(mini){
  var sw = function(t){ return '<span class="pxr-sw" style="--a:' + t[2] + ';--b:' + t[3] + '"></span>'; }, i = 0;
  PX_THS.forEach(function(t, k){ if(t[0] === THEME) i = k; });
  if(mini){ var nx = PX_THS[(i + 1) % PX_THS.length];
    return '<div class="pxr-thm one"><button data-action="set-theme" data-theme="' + nx[0] + '" title="' + PX_THS[i][1] + ' — click for ' + nx[1] + '" aria-label="Theme ' + PX_THS[i][1] + ', switch to ' + nx[1] + '">' + sw(PX_THS[i]) + '</button></div>'; }
  return '<div class="pxr-thm" role="group" aria-label="Theme">' + PX_THS.map(function(t, k){ return '<button data-action="set-theme" data-theme="' + t[0] + '" aria-pressed="' + (k === i) + '" title="' + t[1] + '" aria-label="' + t[1] + ' theme">' + sw(t) + '</button>'; }).join('') + '</div>';
}

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
