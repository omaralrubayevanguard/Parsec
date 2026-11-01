/* ===== Parsec 16.3 (B) — the RO everywhere: a quick look at any RO link, the same truck from above, and which picture an RO uses =====
   · Peek: point at an RO link (.ro-lnk[data-rolnk]) for half a second — its picture, number, customer, truck, status, tech and
     contact. Leaving, scrolling, Esc or a click hides it; the click itself opens the RO. Works inside shadow roots too.
   · Shop view: a bay shows the top view of the very picture the RO shows, or that picture itself — never another truck's top.
   · A new check-in photo on an RO with a model picture asks once: the model picture or this photo (ro.trkUse, ro.trkAsked). */
var V163B = { t: 0, lnk: null, el: null, roId: "", seen: null, q: [], ask: null };
function v163bE(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function v163bPhone(p){ var s = String(p || "").trim(), d = s.replace(/\D/g, ""); if(d.length === 11 && d.charAt(0) === "1") d = d.slice(1); return d.length === 10 ? "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6) : s; }
/* ---------- the peek ---------- */
function v163bLinkIn(ev){ var p = ev && ev.composedPath ? ev.composedPath() : []; for(var i = 0; i < p.length; i++){ var n = p[i]; if(n && n.nodeType === 1 && n.classList && n.classList.contains("ro-lnk") && n.getAttribute("data-rolnk")) return n; if(n === document.body) break; } return null; }
function v163bInPeek(ev){ var p = ev && ev.composedPath ? ev.composedPath() : []; return !!V163B.el && p.indexOf(V163B.el) > -1; }
function v163bPeekHtml(ro){
  var day = function(x){ var d = x ? new Date(x) : null; return d && !isNaN(d) ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""; };
  var tl = ""; try{ tl = (typeof truckLine === "function" && truckLine(ro)) || trkLabel(ro); if(tl === "this truck") tl = ""; }catch(e){}
  var line = [tl, ro.unitNumber ? "Unit " + ro.unitNumber : "", ro.keyTag ? "Key " + ro.keyTag : ""].filter(Boolean).join(" · ");
  var done = false; try{ done = roIsDone(ro); }catch(e){}
  var when = done && ro.dateClosed ? "Closed " + day(ro.dateClosed) : ro.dateOpened ? "Opened " + day(ro.dateOpened) : "";
  var st = ""; try{ st = pgStRo(ro); }catch(e){ try{ st = v163bE(roStatus(ro).status); }catch(e2){} }
  var tech = ""; try{ tech = rtNoTech(ro) ? "" : rtHolderName(rtHolder(ro), ro); }catch(e){ tech = ro.assignedTech || ""; }
  var pic = ""; try{ pic = trkThumb(ro); }catch(e){}
  var nm = String(ro.contactName || "").trim(), ph = String(ro.contactPhone || "").trim();
  return '<div class="v163b-pk-pic">' + pic + '</div><div class="v163b-pk-b"><div class="v163b-pk-no"><b>' + v163bE(ro.roNumber || "RO") + "</b>" + (when ? "<span>· " + v163bE(when) + "</span>" : "") + "</div>"
    + '<div class="v163b-pk-cu">' + v163bE(ro.customerName || "No customer") + "</div>" + (line ? '<div class="v163b-pk-l">' + v163bE(line) + "</div>" : "")
    + '<div class="v163b-pk-st">' + st + (tech ? '<span class="v163b-pk-t">' + v163bE(tech) + "</span>" : "") + "</div>"
    + (nm || ph ? '<div class="v163b-pk-l v163b-pk-ct">' + v163bE([nm, v163bPhone(ph)].filter(Boolean).join(" · ")) + "</div>" : "") + "</div>";
}
function v163bPeekHide(){ clearTimeout(V163B.t); V163B.t = 0; V163B.lnk = null; if(V163B.el){ V163B.el.remove(); V163B.el = null; V163B.roId = ""; } }
function v163bPeekShow(lnk){
  var ro = null; try{ ro = getRO(lnk.getAttribute("data-rolnk")); }catch(e){}
  if(!ro || !lnk.isConnected){ v163bPeekHide(); return null; }
  if(V163B.el) V163B.el.remove();
  var w = document.createElement("div"); w.className = "v163b-pk"; w.setAttribute("role", "tooltip"); w.innerHTML = v163bPeekHtml(ro);
  w.style.visibility = "hidden"; document.body.appendChild(w); V163B.el = w; V163B.roId = ro.id; V163B.lnk = lnk;
  w.addEventListener("click", function(e){ e.stopPropagation(); var id = V163B.roId; v163bPeekHide(); try{ if(id) PG.openRo(id); }catch(er){ console.error(er); } });   /* a click on the card opens the RO too */
  var im = w.querySelector("img[data-trk-f]:not([src])"); if(im && typeof trkLoadPhoto === "function"){ var f = trkPhotoOf(ro); if(f) trkLoadPhoto(f, ro.id, function(u){ if(u && im.isConnected) im.src = u; }); }
  var r = lnk.getBoundingClientRect(), pw = w.offsetWidth, ph = w.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
  var left = Math.max(8, Math.min(r.left, vw - pw - 8)), top = r.bottom + 6;
  if(top + ph > vh - 8) top = r.top - ph - 6 >= 8 ? r.top - ph - 6 : Math.max(8, vh - 8 - ph);   /* no room below: above it, else as low as it fits */
  w.style.left = left + "px"; w.style.top = top + "px"; w.style.visibility = "";
  return w;
}
document.addEventListener("mouseover", function(ev){
  if(v163bInPeek(ev)) return;   /* onto the card itself: it stays */
  var l = v163bLinkIn(ev);
  if(l === V163B.lnk && (V163B.t || V163B.el)) return;
  v163bPeekHide();
  if(!l) return;
  V163B.lnk = l; V163B.t = setTimeout(function(){ V163B.t = 0; if(V163B.lnk === l) v163bPeekShow(l); }, 500);
}, true);
document.addEventListener("mouseout", function(ev){ if(!ev.relatedTarget && !v163bInPeek(ev)) v163bPeekHide(); }, true);   /* out of the window */
document.addEventListener("pointerdown", function(ev){ if(!v163bInPeek(ev)) v163bPeekHide(); }, true);
document.addEventListener("scroll", function(){ if(V163B.el || V163B.t) v163bPeekHide(); }, true);
document.addEventListener("keydown", function(ev){ if(ev.key === "Escape" && (V163B.el || V163B.t)) v163bPeekHide(); }, true);
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
