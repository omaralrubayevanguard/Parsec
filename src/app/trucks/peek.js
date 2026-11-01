/* Parsec · trucks · peek.js
   The peek card on an RO link (16.3 B): after half a second on an RO number, the picture, customer, truck, status, tech and contact; click opens the RO.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   v163bLinkIn v163bInPeek v163bPeekHtml v163bPeekHide v163bPeekShow (5 functions)
   uses       kit/ pages/ ro/
   at load    on document mouseover · on document mouseout · on document pointerdown · on document scroll · on document keydown
*/
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
