/* Parsec · library · models.js
   The Library’s Models tab: the truck pictures moved out of Settings, one row per model (Make, Model, Years, Body, Open ROs) with the view from above, Replace and Remove; the catalog and Add a picture.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   libModelsN libModelsHtml (2 functions)
   state      ros
   uses       kit/ ro/ state/ trucks/
*/
/* ============================== the Library's Models tab (Parsec 17.1) ==============================
   The truck pictures (trucks/), moved out of Settings: one row per model with its small picture — Make · Model ·
   Years · Body · Open ROs — the view from above, Replace and Remove; the 52-truck catalog and Add a picture on top.
   The clicks and edits are the trucks area's own (data-trk-do / data-trk-ed, trucks/banner-and-menu.js). */
function libModelsN(){ try{ return trkLib().length; }catch(e){ return 0; } }
function libModelsHtml(q){
  var L = [], used = {};
  try{ L = trkLib(); }catch(e){}
  (STATE.ros || []).forEach(function(ro){ if(ro.id === SHOP_RO_ID || ro.shop || (typeof roIsDone === "function" && roIsDone(ro))) return; try{ var m = trkModelFor(ro); if(m) used[m.id] = (used[m.id] || 0) + 1; }catch(e){} });
  var W = String(q || "").toLowerCase().split(/\s+/).filter(Boolean), yr = W.filter(function(w){ return /^\d{4}$/.test(w); }).map(Number)[0] || 0;
  var key = function(e){ var p = e.vt && VT_BY[e.vt]; return ((e.make || "") + " " + (e.model || "") + " " + (p ? p.label + " " + p.cab : "") + " " + (e.years || "")).toLowerCase(); };
  var hit = function(e){ var k = key(e); if(!W.every(function(w){ return /^\d{4}$/.test(w) || k.indexOf(w) > -1 || k.replace(/\s+/g, "").indexOf(w) > -1; })) return false;
    if(yr){ var y = trkYears(e.years); if(y && (yr < y[0] || yr > y[1])) return false; } return true; };
  var R = L.filter(hit).sort(function(a, b){ return String(a.model || "").localeCompare(String(b.model || ""), "en", { numeric: true }) || String(a.years || "").localeCompare(String(b.years || "")); });
  var miss = 0; try{ miss = VT_SEED.filter(function(x){ return !L.some(function(e){ return e.id === x.id; }); }).length; }catch(e){}
  var row = function(e){ var p = e.vt && VT_BY[e.vt], n = used[e.id] || 0;
    return '<div class="lib-row lib-mrow">'
      + '<span class="lib-mpic' + (e.cut ? '' : ' fr') + '"><img src="' + esc(trkSrc(e)) + '" alt="" loading="lazy"></span>'
      + '<input class="lib-min" data-trk-ed="' + esc(e.id) + '" data-f="make" value="' + esc(e.make || "") + '" placeholder="Make" aria-label="Make">'
      + '<input class="lib-min" data-trk-ed="' + esc(e.id) + '" data-f="model" value="' + esc(e.model || "") + '" placeholder="Model" aria-label="Model">'
      + '<input class="lib-min mono" data-trk-ed="' + esc(e.id) + '" data-f="years" value="' + esc(e.years || "") + '" placeholder="Any year" aria-label="Years, like 2018-2024">'
      + '<span class="lib-c-k">' + (p ? esc(p.label + (p.cab ? " · " + p.cab : "")) : "") + '</span>'
      + '<span class="lib-c-u">' + (n ? "on " + n + " open RO" + (n === 1 ? "" : "s") : "") + '</span>'
      + '<span class="lib-mact"><button class="lib-mtop' + (e.top ? '' : ' no') + '" data-trk-do="top" data-id="' + esc(e.id) + '" title="' + (e.top ? 'The view from above, for the bays and the yard — click to replace' : 'Add a view from above, for the bays and the yard') + '">' + (e.top ? '<img src="' + esc(trkSrc(e, "top")) + '" alt="" loading="lazy">' : '+ above') + '</button>'
      + '<button class="lib-mb" data-trk-do="replace" data-id="' + esc(e.id) + '">Replace</button><button class="lib-mb ghost" data-trk-do="remove" data-id="' + esc(e.id) + '">Remove</button></span></div>'; };
  return '<div class="lib-mtools"><button class="lib-mb" data-trk-do="catalog">Browse the 52-truck catalog</button>' + (miss ? '<button class="lib-mb ghost" data-trk-do="restore">Put back ' + miss + ' catalog picture' + (miss === 1 ? "" : "s") + '</button>' : '')
    + '<button class="lib-mb" data-trk-do="add">Add a picture…</button><span class="lib-mhint">Matched to each RO by model and year — without one, the check-in photo shows. Years like 2018-2024 or 2025-, blank for any.</span></div>'
    + '<div class="lib-cols lib-mcols"><span></span><span>Make</span><span>Model</span><span>Years</span><span>Body</span><span>Open ROs</span><span></span></div>'
    + (R.length ? R.map(row).join("") : '<div class="lib-none">' + (L.length ? 'No model matches.' : 'No model pictures yet — browse the catalog, or add one.') + '</div>');
}
