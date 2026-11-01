/* Parsec · access · portraits.js
   Portraits for the demo team: staffPhotoUrl picks a drawn or uploaded picture; PHOTO_MAP keeps what was chosen.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   staffPhotoUrl shopStartRowHtml PHOTO_FAIL DEMO_PHOTO PHOTO_MAP PHOTO_SIG KBD_NAV (2 functions, 5 constants)
   uses       clock/ kit/ ro/ shell/ state/
   at load    on document mouseover · on document keydown · on document mousedown · on document focusin · on document focusout
*/
/* ============================== CONSOLE ==============================
   A planning board, not a list of boxes: three headline cards, the week as a strip of days,
   the job on the clock, the team, and a side panel that follows the RO in focus. */

/* ============================== charts ============================== */

/* ============================== realistic portraits ==============================
   Demo staff wear a real stock portrait (randomuser.me), loaded by the browser. Offline, or
   if the shop network blocks it, the drawn portrait underneath simply stays. An uploaded
   photo always wins. */
var PHOTO_FAIL = false;
var DEMO_PHOTO = { "Mike Rodriguez":"men/32", "Dana Kowalski":"women/44", "Luis Martinez":"men/75", "Priya Shah":"women/65",
  "Frank Delaney":"men/86", "Tom Brandt":"men/52", "Jenna Cho":"women/90", "Derek Washington":"men/22", "Sofia Alvarez":"women/29", "Ben Okafor":"men/46" };
var PHOTO_MAP = null, PHOTO_SIG = "";
function staffPhotoUrl(sf){
  if(!sf || PHOTO_FAIL || !sf.av) return "";
  var list = staffList(), sig = list.map(function(x){ return x.id; }).join(",");
  if(!PHOTO_MAP || sig !== PHOTO_SIG){
    PHOTO_MAP = {}; PHOTO_SIG = sig; var used = {};
    list.forEach(function(x){ if(DEMO_PHOTO[x.name]){ PHOTO_MAP[x.id] = DEMO_PHOTO[x.name]; used[DEMO_PHOTO[x.name]] = 1; } });
    list.forEach(function(x){
      if(PHOTO_MAP[x.id] || !x.av) return;
      var g = x.av.f ? "women" : "men", n = 0, s = String(x.name || x.id);
      for(var i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 9973;
      var k = n % 99; while(used[g + "/" + k]) k = (k + 7) % 99;
      PHOTO_MAP[x.id] = g + "/" + k; used[g + "/" + k] = 1;
    });
  }
  var key = PHOTO_MAP[sf.id] || DEMO_PHOTO[sf.name];
  return key ? "https://randomuser.me/api/portraits/" + key + ".jpg" : "";
}
/* the island stays shut after you pick a page until the pointer leaves it */
document.addEventListener("mouseover", function(e){
  if(!UI.diShut || (e.target.closest && e.target.closest(".island"))) return;
  UI.diShut = false; var isl = document.querySelector(".island"); if(isl) isl.classList.remove("shut");
}, { passive: true });
/* keyboard users open the island by tabbing into it; a mouse pick never leaves it stuck open */
var KBD_NAV = false;
document.addEventListener("keydown", function(e){ if(e.key === "Tab") KBD_NAV = true; }, true);
document.addEventListener("mousedown", function(){ KBD_NAV = false; }, true);
document.addEventListener("focusin", function(e){
  if(KBD_NAV && e.target.closest && e.target.closest(".island") && !UI.navOpen){ UI.navOpen = true; UI.diShut = false; render(); }
});
document.addEventListener("focusout", function(e){
  if(!UI.navOpen || !(e.target.closest && e.target.closest(".island"))) return;
  var to = e.relatedTarget;
  if(to && to.closest && to.closest(".island")) return;
  setTimeout(function(){ if(UI.navOpen && !(document.activeElement && document.activeElement.closest && document.activeElement.closest(".island"))){ UI.navOpen = false; render(); } }, 0);
});
window.__tecPhotoFail = function(img){
  PHOTO_FAIL = true;
  document.documentElement.classList.add("no-photos");
  try{ img.remove(); }catch(e){}
};


/* shop time: three operations you clock on like any job */
function shopStartRowHtml(){
  var rp = runningPunch(), r = shopRo();
  return '<div class="shop-row"><span class="shop-row-t">'+sfIcon(SF.kit, 16)+'Shop time</span>' + r.operations.filter(function(o){ return !o.declined; }).map(function(o){
    var on = !!(rp && rp.opId === o.id);
    return '<button class="shop-chip'+(on ? ' on' : '')+'" data-action="'+(on ? 'open-stop-punch' : 'shop-start')+'" data-op="'+o.id+'" title="'+(on ? 'On the clock \u2014 click to stop' : 'Clock on: ' + esc(o.complaint))+'">'
      + (on ? '<i class="shop-live"></i>' : sfIcon(SF.play, 12)) + esc(o.complaint) + '</button>'; }).join('') + '</div>';
}
