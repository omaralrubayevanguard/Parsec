/* Parsec · trucks · banner-and-menu.js
   The truck banner on the RO page (the title on the left, the truck on the right), the camera menu (add, change, remove a picture), the list thumbnail (trkThumb) and the Your data › Truck pictures settings.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   trkBanner trkMenu v147Fit trkPickFile trkShrink trkAdd trkSave trkRemove trkChanged trkThumb trkHydrate trkSettingsHtml … (12 functions, 1 constant)
   state      ros truckPics
   uses       access/ data/ kit/ pages/assets/ phone/ ro/ ro-page/ settings/ shell/ state/
   at load    wraps trkMenu · on document click · on document input · on document change
*/
/* ---------- the RO's header: the title on the left, the truck on the right ---------- */
function trkBanner(tb, ro){
  if(!ro || ro.id === (typeof SHOP_RO_ID !== "undefined" ? SHOP_RO_ID : "") || ro.shop) return tb;
  var P = trkPick(ro), I = trkInfo(ro);
  var band = document.createElement("div"); band.className = "px-trk" + (P.kind === "none" ? " is-none" : "");
  var pic = document.createElement("div"); pic.className = "px-trk__pic is-" + P.kind + (P.kind === "model" && !P.entry.cut ? " is-framed" : "");
  if(P.kind === "model"){ var im = document.createElement("img"); im.src = P.src; im.alt = trkLabel(ro); pic.appendChild(im); pic.title = P.own ? "This RO’s own photo" : (P.entry.make ? P.entry.make + " " : "") + P.entry.model + " — the model picture"; }
  else if(P.kind === "photo"){ var ip = document.createElement("img"); ip.alt = "Check-in photo"; if(P.src) ip.src = P.src; else trkLoadPhoto(P.file, ro.id, function(u){ if(u){ ip.src = u; return; } var P2 = trkPick(ro); if(P2.kind === "photo") trkLoadPhoto(P2.file, ro.id, function(u2){ if(u2) ip.src = u2; else trkNone(pic, I); }); else if(P2.kind === "none") trkNone(pic, I); });
    pic.appendChild(ip); var cap = document.createElement("span"); cap.className = "px-trk__cap"; cap.textContent = "Check-in photo"; pic.appendChild(cap); pic.title = "The first picture in this RO's Pictures"; }
  else { pic.innerHTML = TRK_SIL + '<span class="px-trk__none">No picture for ' + esc(I.model || "this model") + ' yet</span>'; }
  var act = document.createElement("button"); act.type = "button"; act.className = "px-trk__act"; act.title = "More"; act.setAttribute("aria-label", "More about the truck picture");
  act.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/></svg>';
  act.addEventListener("click", function(ev){ ev.stopPropagation(); trkMenu(band, act, ro, P); });
  pic.appendChild(act);
  /* Parsec 10: the camera badge opens Truck & photos */
  var cam = document.createElement("button"); cam.type = "button"; cam.className = "px-trk__cam"; cam.title = "Truck & photos"; cam.setAttribute("aria-label", "Truck and photos"); cam.innerHTML = TRK_CAM;
  cam.addEventListener("click", function(ev){ ev.stopPropagation(); trkDlgOpen(ro, cam); });
  pic.appendChild(cam);
  try{ trkBannerNotes(pic, ro, P); }catch(e){ console.error(e); }
  band.appendChild(tb); band.appendChild(pic);
  return band;
}
function trkMenu(band, anchor, ro, P){
  var old = band.querySelector(".px-trk__menu"); if(old){ old.remove(); band.classList.remove("has-menu"); return; }
  var I = trkInfo(ro), mdl = I.model || "this model", m = P.model || (P.kind === "model" && !P.own ? P.entry : trkModelFor(ro)), photo = trkPhotoOf(ro);
  var menu = document.createElement("div"); menu.className = "px-trk__menu";
  var item = function(t, s, fn, cls){ var b = document.createElement("button"); b.type = "button"; if(cls) b.className = cls; b.innerHTML = "<b>" + esc(t) + "</b>" + (s ? "<small>" + esc(s) + "</small>" : ""); b.addEventListener("click", function(ev){ ev.stopPropagation(); shut(); fn(); }); menu.appendChild(b); };
  var shut = function(){ menu.remove(); band.classList.remove("has-menu"); };
  item("Truck & photos…", "Year, body, trim — or this RO’s own photos", function(){ trkDlgOpen(ro, anchor); });
  if(P.own) item("Use the body picture again", "This RO’s own photo goes", function(){ pushUndo("truck photo"); delete ro.trkOwn; trkChanged("This RO shows the body picture again."); });
  if(m && photo && !P.own){ if(ro.trkUse === "photo") item("Use the model picture here", "", function(){ pushUndo("truck picture"); delete ro.trkUse; trkChanged(); });
    else item("Use the check-in photo on this RO", "The first picture in Pictures", function(){ pushUndo("truck picture"); ro.trkUse = "photo"; trkChanged(); }); }
  item("Notes on the truck…", trkNotesOf(ro).length ? trkNotesOf(ro).length + " so far — put a note where the issue is" : "Put a note where the issue is", function(){ trkInspOpen(ro); });
  if(m && !m.own) item("Replace the picture for every " + mdl, (m.make ? m.make + " " : "") + m.model + (m.years ? " · " + m.years : ""), function(){ trkPickFile(function(src, cut){ trkSave(m.id, { src: src, cut: cut }); }); });
  else if(!m) item("Add a picture for every " + mdl, "Shows on every RO for this model — a side view looks best", function(){ trkPickFile(function(src, cut){ trkAdd(ro, src, cut); }); });
  if(typeof asOpenFor === "function" && (typeof navAllowed !== "function" || navAllowed("assets"))) item("Truck history in Assets…", "Every visit, repeat repairs, miles and hours", function(){ asOpenFor(ro); });   /* Parsec 15: Truck history left the RO page */
  item("The 52-truck catalog…", "Every Volvo body from 1997 to today", function(){ trkCatOpen(null); });
  item("All truck pictures…", "Your data › Truck pictures", function(){ UI.pxPrev = UI.view; UI.view = "profile"; UI.pxSec = "data"; try{ if(typeof pmOn === "function" && pmOn()) PM.pend = true; }catch(e){} render(); setTimeout(function(){ var c = document.querySelector('[data-trk-card]'); if(c) c.scrollIntoView({ block: "center" }); }, 60); }, "is-sep");
  band.appendChild(menu); band.classList.add("has-menu");
  var first = menu.querySelector("button"); if(first) try{ first.focus({ preventScroll: true }); }catch(e){}
  menu.addEventListener("keydown", function(e){ if(e.key === "Escape"){ e.stopPropagation(); shut(); anchor.focus(); } });
  setTimeout(function(){ var off = function(e){ var p = e.composedPath ? e.composedPath() : [e.target]; if(p.indexOf(menu) < 0 && p.indexOf(anchor) < 0){ shut(); document.removeEventListener("click", off, true); } else if(!menu.isConnected) document.removeEventListener("click", off, true); }; document.addEventListener("click", off, true); }, 0);
}
/* ===== Parsec 14.7 (B) — the truck picture's ⋯ menu stays on screen =====
   It used to sit inside the truck card (position: absolute, right: 14px, 300 px wide), so in the RO page's right rail (324 px,
   scrolling) its left side was cut off — and in a narrower pane even more. Now it is lifted out of the card to the page's top
   level and placed next to its button like the other menus: right edges lined up, inside the window with 8 px to spare,
   above the button when there's no room below, scrolling when it's taller than the window. It closes when the page scrolls. */
function v147Fit(pop, anchor, o){
  o = o || {}; var r = anchor.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
  var s = pop.style; s.position = "fixed"; s.right = "auto"; s.bottom = "auto"; s.margin = "0"; s.maxHeight = ""; s.overflowY = ""; s.zIndex = "70";
  if(pop.offsetWidth > vw - 16) s.width = (vw - 16) + "px";
  var w = pop.offsetWidth, h = pop.offsetHeight;
  if(h > vh - 16){ s.maxHeight = (vh - 16) + "px"; s.overflowY = "auto"; h = vh - 16; }
  var left = o.alignRight ? r.right - w : r.left;
  if(o.alignRight && left < 8) left = r.left; else if(!o.alignRight && left + w > vw - 8) left = r.right - w;
  left = Math.max(8, Math.min(left, vw - w - 8));
  var top = r.bottom + 6; if(top + h > vh - 8) top = r.top - h - 6 >= 8 ? r.top - h - 6 : Math.max(8, vh - 8 - h);
  s.left = left + "px"; s.top = top + "px";
  /* a transformed or contained parent makes "fixed" mean that parent, not the window — measure and correct */
  var q = pop.getBoundingClientRect(); if(Math.abs(q.left - left) > 0.5 || Math.abs(q.top - top) > 0.5){ s.left = (2 * left - q.left) + "px"; s.top = (2 * top - q.top) + "px"; }
}
(function(o){
  trkMenu = function(band, anchor, ro, P){
    var root = band.getRootNode ? band.getRootNode() : document, top = root && root.host ? root : document.body;
    var old = top.querySelector ? top.querySelector(".px-trk__menu.is-lifted") : null;
    if(old){ var was = old.__anchor; old.remove(); band.classList.remove("has-menu"); if(was === anchor) return; }
    o.apply(this, arguments);
    var m = band.querySelector(".px-trk__menu"); if(!m) return;
    m.classList.add("is-lifted"); m.__anchor = anchor; top.appendChild(m);
    if(root && root.host && root.host.getAttribute && root.host.getAttribute("data-device") === "phone") m.style.width = Math.max(220, window.innerWidth - 24) + "px";
    var ar = anchor.getBoundingClientRect(); v147Fit(m, anchor, { alignRight: ar.left > window.innerWidth / 2 });   /* 17.1: the picture can sit on the left now (one RO panel) — open toward the room */
    var first = m.querySelector("button"); if(first) try{ first.focus({ preventScroll: true }); }catch(e){}
    var off = function(e){ if(e && e.target && m.contains && m.contains(e.target)) return; if(m.isConnected){ m.remove(); band.classList.remove("has-menu"); } window.removeEventListener("scroll", off, true); window.removeEventListener("resize", off); if(root && root.removeEventListener) root.removeEventListener("scroll", off, true); };
    setTimeout(function(){ window.addEventListener("scroll", off, true); window.addEventListener("resize", off); if(root && root.host) root.addEventListener("scroll", off, true); }, 0);
  };
})(trkMenu);

/* ---------- adding and changing pictures ---------- */
var TRK_IN = null;
function trkPickFile(cb){
  if(!TRK_IN){ TRK_IN = document.createElement("input"); TRK_IN.type = "file"; TRK_IN.accept = "image/*"; TRK_IN.style.display = "none"; document.body.appendChild(TRK_IN); }
  TRK_IN.value = ""; TRK_IN.onchange = function(){ var f = TRK_IN.files && TRK_IN.files[0]; if(f) trkShrink(f, cb); }; TRK_IN.click();
}
/* made small (560 px wide) and kept with the shop's data; a picture with a see-through background shows without a frame */
function trkShrink(file, cb, max){
  var url = URL.createObjectURL(file), img = new Image();
  img.onload = function(){
    var sc = Math.min(1, (max || 560) / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.max(1, Math.round(img.naturalWidth * sc)), h = Math.max(1, Math.round(img.naturalHeight * sc));
    var c = document.createElement("canvas"); c.width = w; c.height = h; var x = c.getContext("2d"); x.drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
    var cut = 0; try{ var d = x.getImageData(0, 0, w, h).data, a = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + w - 1) * 4]; cut = a.every(function(i){ return d[i + 3] < 16; }) ? 1 : 0; }catch(e){}
    var out = c.toDataURL("image/webp", .82); if(!/^data:image\/webp/.test(out)) out = cut ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", .82);
    cb(out, cut);
  };
  img.onerror = function(){ URL.revokeObjectURL(url); pushToast("That file isn't a picture this browser can read."); };
  img.src = url;
}
function trkAdd(ro, src, cut){
  var I = trkInfo(ro); if(!I.model){ pushToast("Add the truck's model on the RO first — the picture goes with the model."); return; }
  pushUndo("truck picture");
  trkLib().push({ id: uid("trk"), make: I.make || "", model: I.model, years: "", color: "", src: src, cut: cut, at: nowIso(), by: (typeof punchByName === "function" && punchByName()) || "" });
  trkChanged("Picture added — it shows on every " + I.model + ".");
}
function trkSave(id, f){ var e = trkLib().filter(function(x){ return x.id === id; })[0]; if(!e) return; pushUndo("truck picture"); Object.assign(e, f, { at: nowIso() }); if(f.top) delete e.up; trkChanged("Saved."); }
function trkRemove(id){ var L = trkLib(), e = L.filter(function(x){ return x.id === id; })[0]; if(!e) return; pushUndo("truck picture"); STATE.truckPics = L.filter(function(x){ return x.id !== id; }); trkChanged("Removed — ROs for " + e.model + " show the check-in photo now."); }
function trkChanged(msg, undo){ scheduleSave(true); try{ render(); }catch(e){} try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(e){} if(msg) pushToast(msg, !!undo); }
/* ---------- the small picture in lists ---------- */
function trkThumb(ro){
  var P = trkPick(ro);
  if(P.kind === "model"){ var sw = P.color && P.src !== P.base && TRK_SWEEP.ro === ro.id && Date.now() - TRK_SWEEP.at < 1600;   /* 17.3: a new colour sweeps across, once */
    return '<span class="trk-th' + (P.entry.cut ? '' : ' fr') + (sw ? ' trk-swp' : '') + '">' + (sw ? '<img class="trk-swp0" src="' + esc(P.base) + '" alt="">' : '') + '<img src="' + esc(P.src) + '" alt=""></span>'; }
  if(P.kind === "photo") return '<span class="trk-th ph"><img' + (P.src ? ' src="' + esc(P.src) + '"' : '') + ' data-trk-f="' + esc(P.file.id) + '" data-trk-ro="' + esc(ro.id) + '" alt=""></span>';
  return '<span class="trk-th no">' + TRK_SIL + '</span>';
}
function trkHydrate(){
  if(TI && TI.ros !== STATE.ros){ TI.ros = STATE.ros; TI.draft = null; trkInspDraw(); }   /* Ctrl Z while the notes are open */
  document.querySelectorAll("#app img[data-trk-f]:not([src])").forEach(function(im){
    var ro = getRO(im.getAttribute("data-trk-ro")), f = ro && trkPhotoOf(ro);
    var swap = function(){ var th = im.closest(".trk-th"); if(ro && th && th.isConnected) th.outerHTML = trkThumb(ro); };
    if(!f || f.id !== im.getAttribute("data-trk-f")){ swap(); return; }
    trkLoadPhoto(f, ro.id, function(u){ if(u) document.querySelectorAll('#app img[data-trk-f="' + f.id + '"]').forEach(function(x){ x.src = u; }); else { swap(); trkHydrate(); } });
  });
}
/* ---------- Your data › Truck pictures ---------- */
function trkSettingsHtml(){
  var L = trkLib(), used = {};
  STATE.ros.forEach(function(ro){ if(ro.id === SHOP_RO_ID || ro.shop || (typeof roIsDone === "function" && roIsDone(ro))) return; var m = trkModelFor(ro); if(m) used[m.id] = (used[m.id] || 0) + 1; });
  var row = function(e){ var p = e.vt && VT_BY[e.vt]; return '<div class="px-trkr" data-trk-k="' + esc(((e.make || '') + ' ' + (e.model || '') + ' ' + (p ? p.label + ' ' + p.cab + ' ' : '') + (e.years || '')).toLowerCase()) + '"><span class="px-trkr__pic' + (e.cut ? '' : ' fr') + '"><img src="' + esc(trkSrc(e)) + '" alt="" loading="lazy"></span>'
    + '<button class="px-trkr__top' + (e.top ? '' : ' no') + (e.up ? ' up' : '') + '" data-trk-do="top" data-id="' + esc(e.id) + '" title="' + (e.top ? 'The view from above, for the bays and the yard — click to replace' : 'Add a view from above, for the bays and the yard') + '">' + (e.top ? '<img src="' + esc(trkSrc(e, "top")) + '" alt="" loading="lazy">' : '<span>+ From above</span>') + '</button>'
    + '<span class="px-trkr__f"><input class="px-in" data-trk-ed="' + esc(e.id) + '" data-f="make" value="' + esc(e.make || '') + '" placeholder="Make" aria-label="Make">'
    + '<input class="px-in" data-trk-ed="' + esc(e.id) + '" data-f="model" value="' + esc(e.model || '') + '" placeholder="Model" aria-label="Model">'
    + '<input class="px-in" data-trk-ed="' + esc(e.id) + '" data-f="years" value="' + esc(e.years || '') + '" placeholder="Years (any)" aria-label="Years, like 2018-2024">'
    + '<small class="px-trkr__n">' + (p ? esc(p.label) + ' · ' : '') + (used[e.id] ? 'On ' + used[e.id] + ' open RO' + (used[e.id] === 1 ? '' : 's') : 'No open ROs right now') + '</small></span>'
    + '<span class="px-trkr__b"><button class="px-btn sm" data-trk-do="replace" data-id="' + esc(e.id) + '">Replace</button><button class="px-btn sm ghost" data-trk-do="remove" data-id="' + esc(e.id) + '">Remove</button></span></div>'; };
  var miss = VT_SEED.filter(function(x){ return !L.some(function(e){ return e.id === x.id; }); }).length;
  return pxCard(pxCh("Truck pictures", "matched to each RO by model and year — without one, the check-in photo shows")
    + '<div class="px-row"><button class="px-btn sm" data-trk-do="catalog">Browse the 52-truck catalog</button>' + (miss ? '<button class="px-btn sm ghost" data-trk-do="restore">Put back ' + miss + ' catalog picture' + (miss === 1 ? '' : 's') + '</button>' : '') + '<span class="px-hint">ChatGPT’s 52 Volvo bodies, 1997 to today — each from the side and from above.</span></div>'
    + (L.length > 8 ? '<div class="px-row"><input class="px-trkq" data-trk-q placeholder="Find a model — VNL 760, VHD, 2019…" aria-label="Find a model picture"><span class="px-hint">' + L.length + ' pictures</span></div>' : '')
    + '<div class="px-trkl' + (L.length > 8 ? ' is-long' : '') + '" data-trk-card>' + (L.length ? L.map(row).join('') : '<p class="px-hint">No model pictures yet — open an RO and use the ⋯ on its picture to add one.</p>') + '</div>'
    + '<div class="px-row"><button class="px-btn sm" data-trk-do="add">Add a picture…</button><span class="px-hint">Years like 2018-2024 or 2025-, blank for any. A side view with a see-through background looks best; the view from above shows the truck in its bay and on the yard. Use pictures the dealership may use.</span></div>');
}
(function(){
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-trk-do]"); if(!b) return;
    ev.preventDefault(); ev.stopPropagation();
    var k = b.getAttribute("data-trk-do"), id = b.getAttribute("data-id");
    if(k === "remove") trkRemove(id);
    else if(k === "replace") trkPickFile(function(src, cut){ trkSave(id, { src: src, cut: cut }); });
    else if(k === "top") trkPickFile(function(src){ trkSave(id, { top: src }); });
    else if(k === "add") trkPickFile(function(src, cut){ pushUndo("truck picture"); trkLib().push({ id: uid("trk"), make: "Volvo", model: "", years: "", color: "", src: src, cut: cut, at: nowIso() }); trkChanged("Added — type its model so it finds its ROs."); });
    else if(k === "catalog") trkCatOpen(null, b);
    else if(k === "restore"){ pushUndo("truck pictures"); var L = trkLib(), n = 0; VT_SEED.forEach(function(x){ if(!L.some(function(e){ return e.id === x.id; })){ L.push(trkClone(x)); n++; } }); trkChanged(n + " catalog picture" + (n === 1 ? "" : "s") + " back."); }
  }, true);
  document.addEventListener("input", function(ev){
    var t = ev.target; if(!t || !t.hasAttribute || !t.hasAttribute("data-trk-q")) return;
    var q = String(t.value || "").toLowerCase().trim(), yr = /^\d{4}$/.test(q) ? +q : 0;
    document.querySelectorAll(".px-trkr[data-trk-k]").forEach(function(r){ var k = r.getAttribute("data-trk-k"), ok = !q || k.indexOf(q) > -1 || k.replace(/\s+/g, "").indexOf(q.replace(/\s+/g, "")) > -1;
      if(yr){ var y = trkYears((k.match(/(\d{4}-?\d{0,4})$/) || [])[1]); ok = !y || (yr >= y[0] && yr <= y[1]); }
      r.hidden = !ok; });
  }, true);
  document.addEventListener("change", function(ev){
    var t = ev.target; if(!t || !t.getAttribute || !t.getAttribute("data-trk-ed")) return;
    var e = trkLib().filter(function(x){ return x.id === t.getAttribute("data-trk-ed"); })[0]; if(!e) return;
    var f = t.getAttribute("data-f"), v = String(t.value || "").trim().slice(0, 40);
    if(f === "years" && v && !trkYears(v)){ pushToast("Years like 2018-2024, 2025- or 2019 — or leave it blank."); return; }
    if(e[f] === v) return; pushUndo("truck picture"); e[f] = v; trkChanged();
  }, true);
})();
