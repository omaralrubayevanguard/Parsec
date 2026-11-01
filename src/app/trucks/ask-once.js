/* Parsec · trucks · ask-once.js
   When an RO's first check-in photo arrives: ask once, model picture or this photo (ro.trkUse); plus trkHead / trkGi, the picture in a page header or list row.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   v163bScan v163bAskable v163bAskFor v163bAskNext trkHead trkGi trkLoadPhoto trkNone trkLabel TRK_CAM (9 functions, 1 constant)
   state      ros
   uses       access/ data/ kit/ ro/ ro-page/ shell/ state/
   at load    a timer
*/
/* ---------- a new check-in photo asks once: the model picture or this photo ---------- */
function v163bScan(){
  if(!STATE || !Array.isArray(STATE.ros)) return;
  var first = !V163B.seen || V163B.seenOf !== STATE.ros; if(first){ V163B.seen = {}; V163B.seenOf = STATE.ros; }
  STATE.ros.forEach(function(ro){
    if(!ro || !ro.id || ro.shop || ro.id === SHOP_RO_ID) return;
    var f = null; try{ f = trkPhotoOf(ro); }catch(e){}
    var id = f ? f.id : "", had = V163B.seen[ro.id];
    V163B.seen[ro.id] = id;
    if(first || had === undefined || had || !id) return;   /* first sight, or it already had one: nothing to ask */
    v163bAskFor(ro);
  });
}
function v163bAskable(ro){
  if(!ro || ro.trkAsked || ro.trkUse || ro.shop || ro.id === SHOP_RO_ID) return false;
  try{ if(roIsDone(ro)) return false; if(typeof canPage === "function" && !canPage("ros")) return false; var o = trkOwnOf(ro); if(o && o.src) return false; return !!trkModelFor(ro) && !!trkPhotoOf(ro); }catch(e){ return false; }
}
function v163bAskFor(ro){ if(!v163bAskable(ro)) return; if(V163B.q.indexOf(ro.id) < 0) V163B.q.push(ro.id); if(!V163B.ask) v163bAskNext(); }
function v163bAskNext(){
  var ro = null; while(V163B.q.length && !ro){ ro = getRO(V163B.q.shift()); if(!v163bAskable(ro)) ro = null; }
  if(!ro){ V163B.ask = null; return; }
  var m = trkModelFor(ro), f = trkPhotoOf(ro), msrc = ""; try{ msrc = trkSrc(m); }catch(e){}
  var w = document.createElement("div"); w.className = "v163b-ask"; w.setAttribute("role", "dialog"); w.setAttribute("aria-label", "Which picture for " + (ro.roNumber || "this RO"));
  w.innerHTML = '<div class="v163b-ask-h"><b>' + v163bE(ro.roNumber || "This RO") + " has a check-in photo</b>" + '<button type="button" class="v163b-ask-x" data-v163b-use="later" aria-label="Not now" title="Not now — keep the model picture">×</button></div>'
    + "<p>Show the model picture or this photo — on every page?</p>"
    + '<div class="v163b-ask-c"><button type="button" data-v163b-use="model"><span class="v163b-ask-i' + (m && m.cut ? "" : " fr") + '">' + (msrc ? '<img src="' + v163bE(msrc) + '" alt="">' : "") + "</span><span>Model</span></button>"
    + '<button type="button" class="pri" data-v163b-use="photo"><span class="v163b-ask-i ph"><img alt=""></span><span>This photo</span></button></div>';
  w.setAttribute("data-ro", ro.id);
  var pim = w.querySelector(".ph img"); if(f) trkLoadPhoto(f, ro.id, function(u){ if(u && pim.isConnected) pim.src = u; });
  w.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-v163b-use]"); if(!b) return;
    var k = b.getAttribute("data-v163b-use");
    if(k === "later"){ ro.trkAsked = 1; }
    else { pushUndo("picture"); ro.trkUse = k; ro.trkAsked = 1; try{ pushToast(k === "photo" ? (ro.roNumber || "The RO") + " shows its check-in photo everywhere." : (ro.roNumber || "The RO") + " keeps the model picture.", false); }catch(er){} }
    try{ scheduleSave(true); }catch(er){}
    w.remove(); V163B.ask = null;
    try{ render(); }catch(er){} try{ if(typeof JC !== "undefined" && JC && JC.rerender) JC.rerender(); }catch(er){}
    setTimeout(v163bAskNext, 250);
  });
  document.body.appendChild(w); V163B.ask = w;
}
setInterval(function(){ try{ v163bScan(); }catch(e){} }, 1200);

function trkHead(ro){ try{ if(!ro || ro.isTech || ro.shop || ro.id === SHOP_RO_ID) return ''; var P = trkPick(ro); if(P.kind === "none") return '';
  var nN = trkNotesOf(ro).length;
  return '<span class="tg-hpic" title="' + esc(trkLabel(ro)) + (P.kind === "photo" ? ' — check-in photo' : '') + (nN ? ' · ' + nN + ' note' + (nN === 1 ? '' : 's') + ' on the truck' : '') + '">' + trkThumb(ro) + (nN ? '<em class="tg-hn">' + nN + '</em>' : '') + '</span>'; }catch(e){ return ''; } }
/* the small picture where a Needs action row had its icon (Foreman, Triage) */
function trkGi(ro, icon){ try{ return '<span class="tg-gi trk" title="' + esc(trkLabel(ro)) + '">' + trkThumb(ro) + '</span>'; }catch(e){ return '<span class="tg-gi">' + icon + '</span>'; } }
/* load a check-in photo once; everything that shows it redraws from the cache */
function trkLoadPhoto(f, roId, cb){
  if(!f || TRK_PH[f.id]){ if(cb && f) cb(TRK_PH[f.id]); return; }
  if(TRK_PEND[f.id]){ if(cb) TRK_PEND[f.id].push(cb); return; }
  TRK_PEND[f.id] = cb ? [cb] : [];
  var done = function(u){ var L = TRK_PEND[f.id] || []; delete TRK_PEND[f.id]; if(u) TRK_PH[f.id] = u; else TRK_BAD[f.id] = 1; L.forEach(function(fn){ try{ fn(u); }catch(e){} }); };
  try{ if(typeof JC === "undefined" || !JC || !JC.blobOf){ done(""); return; }
    var t = setTimeout(function(){ if(TRK_PEND[f.id]) done(""); }, 8000);   /* a folder that never answers */
    JC.blobOf(f, roId).then(function(b){ clearTimeout(t); if(TRK_PEND[f.id]) done(b ? URL.createObjectURL(b) : ""); }, function(){ clearTimeout(t); if(TRK_PEND[f.id]) done(""); });
  }catch(e){ done(""); }
}
function trkNone(pic, I){ var act = pic.querySelector(".px-trk__act"), cam = pic.querySelector(".px-trk__cam"); pic.className = "px-trk__pic is-none"; pic.innerHTML = TRK_SIL + '<span class="px-trk__none">No picture for ' + esc(I.model || "this model") + ' yet</span>'; if(act) pic.appendChild(act); if(cam) pic.appendChild(cam); if(pic.parentNode) pic.parentNode.classList.add("is-none"); }
function trkLabel(ro){ var I = trkInfo(ro); return [I.year || "", I.make, I.model, ro && ro.trkTrim ? ro.trkTrim : ""].filter(Boolean).join(" ") || "this truck"; }
var TRK_CAM = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3v10H4z"/><circle cx="12" cy="13.2" r="3.3"/></svg>';
