/* Parsec · trucks · truck-and-photos.js
   Truck & photos: one window per RO from the camera button — the model list, the body picked, photos and receipts (TD).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   trkModelList trkDraftRo trkDlgOpen trkDlgClose trkDlgDraw trkDlgFile trkSaveReceipt trkDlgSave TD TRK_MODELS_ALL (8 functions, 2 constants)
   uses       access/ data/ kit/ pages/ pages/warranty/ ro/ ro-page/ shell/ state/
   at load    on document click · on document input · on document change · on window keydown
*/
/* ============================== Truck & photos (Parsec 10) ==============================
   One window per RO, from the camera on the truck picture: the model year and model, how well that
   matches a body (ChatGPT's year-and-cab match), the body and trim, and this RO's own photos — from the side
   for the header and lists, from above for the bay and the yard. Nothing changes until Save truck. */
var TD = null;   /* { ro, d: draft, base, back: element to give focus back to, busy } */
var TRK_MODELS_ALL = null;
function trkModelList(){ if(TRK_MODELS_ALL) return TRK_MODELS_ALL; var s = {};
  VT_SEED.forEach(function(e){ s[e.model] = 1; String(e.alias || "").split(",").forEach(function(a){ if(a) s[a] = 1; }); });
  try{ (TRUCK_MODELS || []).forEach(function(m){ s[m] = 1; }); }catch(e){}
  return (TRK_MODELS_ALL = Object.keys(s).sort()); }
function trkDraftRo(ro, d){ return Object.assign({}, ro, { year: d.year, model: d.model, trkBody: d.body, trkTrim: d.trim, trkOwn: (d.side || d.top) ? { side: d.side || "", top: d.top || "", cut: d.cut || 0 } : null }); }
function trkDlgOpen(ro, back){ if(!ro) return;
  var o = ro.trkOwn || {};
  var d = { year: ro.year ? String(ro.year) : "", model: ro.model || "", body: ro.trkBody || "", trim: ro.trkTrim || "", side: o.side || "", top: o.top || "", cut: o.cut || 0 };
  TD = { ro: ro.id, d: d, base: JSON.stringify(d), back: back || document.activeElement, busy: false, msg: "", err: false, ok: false };
  trkDlgDraw(true);
}
function trkDlgClose(){ var w = document.getElementById("trk-dlg"); if(w) w.remove(); var b = TD && TD.back; TD = null; document.documentElement.classList.remove("ti-open"); try{ if(b && b.isConnected) b.focus({ preventScroll: true }); }catch(e){} }
function trkDlgDraw(first){
  var ro = TD && getRO(TD.ro); if(!ro){ trkDlgClose(); return; }
  var d = TD.d, dr = trkDraftRo(ro, d), I = trkInfo(dr), M = trkMatch(dr), st = TRK_ST[M.st] || ["", ""];
  var fam = trkFamily(d.model), show = M.entry, p = show && show.vt ? VT_BY[show.vt] : null, trims = vtTrims(p);
  var opts = trkLib().filter(function(e){ if(e.off) return false; var f2 = e.vt ? vtFam(VT_BY[e.vt]) : trkFamily(e.model); return !fam || f2 === fam; })
    .sort(function(a, b){ var pa = a.vt ? VT_BY[a.vt] : null, pb = b.vt ? VT_BY[b.vt] : null; return (pb ? pb.from : 0) - (pa ? pa.from : 0) || String(a.model).localeCompare(String(b.model)); });
  var bodyLbl = function(e){ var q = e.vt ? VT_BY[e.vt] : null; return q ? q.label + " · " + vtYears(q) : (e.make ? e.make + " " : "") + e.model + (e.years ? " · " + e.years : "") + " · your picture"; };
  var sideSrc = d.side || (show ? trkSrc(show) : ""), topSrc = d.top || (show && show.top ? trkSrc(show, "top") : "");
  var dirty = JSON.stringify(d) !== TD.base;
  var h = '<div class="td" role="dialog" aria-modal="true" aria-labelledby="td-h" tabindex="-1">'
    + '<div class="ti-h"><div class="ti-ht"><div class="ti-eb0"><span class="mono">' + esc(ro.roNumber || "") + '</span> · ' + esc(trkLabel(dr)) + '</div><h2 id="td-h">Truck &amp; photos</h2><div class="ti-sub">' + esc(ro.customerName || "Customer") + ' · Match the body, or use your own photos.</div></div>'
    + '<button type="button" class="ti-x" data-td="close" aria-label="Close"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'
    + '<div class="td-b">'
    + '<div class="td-r"><label class="ti-l td-y">Model year<input data-td-f="year" inputmode="numeric" maxlength="4" value="' + esc(d.year) + '" placeholder="' + (I.yearFrom === "vin" && I.year ? esc(String(I.year)) + ' (VIN)' : 'e.g. 2021') + '"></label>'
    + '<label class="ti-l td-m">Volvo model &amp; cab<input data-td-f="model" list="td-models" autocomplete="off" value="' + esc(d.model) + '" placeholder="e.g. VNL 860"></label>'
    + '<datalist id="td-models">' + trkModelList().map(function(m){ return '<option value="' + esc(m) + '"></option>'; }).join('') + '</datalist></div>'
    + '<div class="td-match"><p class="td-st"><span class="td-pill ' + st[0] + '">' + esc(st[1]) + '</span><span>' + esc(M.msg) + '</span>'
    + ((M.st === "review" || M.st === "unsupported" || M.st === "year") && show && !show.own ? '<button type="button" class="px-btn sm" data-td="confirm">Yes, this is the body</button>' : '') + '</p>'
    + '<div class="td-r2"><label class="ti-l">Body generation<select data-td-f="body"><option value="">' + (show ? 'Automatic — ' + esc(bodyLbl(show)) : 'Automatic') + '</option>' + opts.map(function(e){ return '<option value="' + esc(e.id) + '"' + (d.body === e.id ? ' selected' : '') + '>' + esc(bodyLbl(e)) + '</option>'; }).join('') + '</select></label>'
    + '<label class="ti-l">Trim<select data-td-f="trim"' + (trims.length ? '' : ' disabled') + '>' + (trims.length ? '<option value="">Not set</option>' + trims.map(function(t){ return '<option' + (d.trim === t ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') : '<option>Not offered on this body</option>') + '</select></label></div>'
    + '<p class="td-fine">' + (p ? esc(p.body) + '. ' : '') + 'The picture shows the body; paint, trim, axles and accessories are representative. Your own photo comes first.</p>'
    + '<button type="button" class="td-lnk" data-td="cat">Explore the 52-truck catalog</button></div>'
    + '<div class="td-ph">'
    + '<div class="td-pc"><div class="td-pl"><b>Vehicle photo</b><span>from the side</span></div><div class="td-pv' + (d.side ? ' own' : '') + '" data-td-drop="side" tabindex="0" aria-label="Vehicle photo — drop a picture here">' + (sideSrc ? '<img src="' + esc(sideSrc) + '" alt="">' : '<span class="td-e">' + TRK_SIL + '</span>') + '<i class="td-tag">' + (d.side ? 'YOUR PHOTO' : show ? 'BODY' : 'NONE') + '</i></div>'
    + '<div class="td-pb"><button type="button" class="px-btn sm" data-td="pick" data-k="side">' + TRK_CAM + 'Choose photo</button>' + (d.side ? '<button type="button" class="px-btn sm ghost" data-td="clear" data-k="side">Remove</button>' : '') + '</div><p class="td-fine">In the RO’s header and every list. Drag a picture here or choose a file.</p></div>'
    + '<div class="td-pc"><div class="td-pl"><b>Location photo</b><span>from above · optional</span></div><div class="td-pv top' + (d.top ? ' own' : '') + '" data-td-drop="top" tabindex="0" aria-label="Location photo — drop a picture here">' + (topSrc ? '<img src="' + esc(topSrc) + '" alt="">' : '<span class="td-e">—</span>') + '<i class="td-tag">' + (d.top ? 'YOUR PHOTO' : topSrc ? 'BODY' : 'NONE') + '</i></div>'
    + '<div class="td-pb"><button type="button" class="px-btn sm" data-td="pick" data-k="top">' + TRK_CAM + 'Choose photo</button>' + (d.top ? '<button type="button" class="px-btn sm ghost" data-td="clear" data-k="top">Remove</button>' : '') + '</div><p class="td-fine">The truck in its bay and on the yard.</p></div>'
    + '</div></div>'
    + '<div class="td-f"><span class="td-msg' + (TD.err ? ' err' : TD.ok ? ' ok' : '') + '" role="status">' + esc(TD.msg || (dirty ? 'Not saved yet — nothing changes until you save.' : 'Nothing changed yet.')) + '</span>'
    + '<button type="button" class="px-btn sm ghost" data-td="close">Cancel</button>'
    + '<button type="button" class="px-btn sm pri td-save' + (TD.ok ? ' is-ok' : '') + '" data-td="save"' + (TD.busy ? ' aria-busy="true" disabled' : (!dirty && !TD.err && !TD.ok ? ' disabled' : '')) + '>' + (TD.busy ? '<i class="td-spin"></i>Saving…' : TD.ok ? '✓ Saved' : TD.err ? 'Retry save' : 'Save truck') + '</button></div></div>';
  var w = document.getElementById("trk-dlg");
  if(w && w.firstChild && !first && trkDlgDraw.part){ trkDlgDraw.part = false; var tmp = document.createElement("div"); tmp.innerHTML = h;
    [".ti-eb0", ".td-match", ".td-ph", ".td-f"].forEach(function(sel){ var a = w.querySelector(sel), b = tmp.querySelector(sel); if(a && b) a.replaceWith(b); });
    var yi = w.querySelector('[data-td-f="year"]'), yn = tmp.querySelector('[data-td-f="year"]'); if(yi && yn) yi.placeholder = yn.placeholder;
    return; }
  var keep = w && document.activeElement && w.contains(document.activeElement) ? document.activeElement.getAttribute("data-td-f") : null, pos = keep && document.activeElement.selectionStart;
  if(!w){ w = document.createElement("div"); w.id = "trk-dlg"; w.className = "ti-wrap"; document.body.appendChild(w); }
  w.innerHTML = h; document.documentElement.classList.add("ti-open");
  if(keep){ var f = w.querySelector('[data-td-f="' + keep + '"]'); if(f){ f.focus(); try{ if(pos != null) f.setSelectionRange(pos, pos); }catch(e){} } }
  else if(first){ var y = w.querySelector('[data-td-f="year"]'); if(y) try{ y.focus({ preventScroll: true }); }catch(e){} }
}
function trkDlgFile(k, file){ if(!file || !TD) return; trkShrink(file, function(src, cut){ if(!TD) return; TD.d[k] = src; if(k === "side") TD.d.cut = cut; TD.ok = false; TD.err = false; TD.msg = ""; trkDlgDraw(); }, k === "top" ? 320 : 560); }
/* save, then wait for the save to land: the folder, or this browser when there's no folder */
function trkSaveReceipt(){ return new Promise(function(res, rej){ var t0 = Date.now();
  (function look(){ var s = typeof syncStatus !== "undefined" ? syncStatus : "local";
    if(s === "error") return rej(new Error("Saved on this computer, but the shop folder didn’t take it. Retry when the folder is back."));
    if(s !== "pending") return res(s === "saved" ? "Saved to the shop folder." : "Saved on this computer.");
    if(Date.now() - t0 > 15000) return rej(new Error("The save is taking longer than it should — your changes are kept. Retry in a moment."));
    setTimeout(look, 80); })(); }); }
function trkDlgSave(){
  var ro = TD && getRO(TD.ro); if(!ro || TD.busy) return; var d = TD.d;
  var y = String(d.year || "").trim(); if(y && !(/^\d{4}$/.test(y) && +y >= 1980 && +y <= new Date().getFullYear() + 2)){ TD.err = true; TD.msg = "The model year is four digits, like 2021."; trkDlgDraw(); return; }
  TD.busy = true; TD.err = false; TD.ok = false; TD.msg = "Saving to RO " + (ro.roNumber || "") + "…"; trkDlgDraw();
  if(JSON.stringify(d) !== TD.base){ pushUndo("truck & photos");
    if(y) ro.year = +y; else delete ro.year;
    ro.model = String(d.model || "").trim();
    if(d.body) ro.trkBody = d.body; else delete ro.trkBody;
    if(d.trim) ro.trkTrim = d.trim; else delete ro.trkTrim;
    if(d.side || d.top){ ro.trkOwn = { side: d.side || "", top: d.top || "", cut: d.cut || 0, at: nowIso(), by: (typeof punchByName === "function" && punchByName()) || "" }; if(d.side) delete ro.trkUse; } else delete ro.trkOwn;
    try{ audit("truck", (typeof roLabel === "function" ? roLabel(ro) : ro.roNumber) + ": truck & photos — " + trkLabel(ro), ro); }catch(e){}
    scheduleSave(true); TD.base = JSON.stringify(d); }
  var t0 = Date.now();
  trkSaveReceipt().then(function(m){ setTimeout(function(){ if(!TD) return; TD.busy = false; TD.ok = true; TD.msg = m; trkDlgDraw();
      try{ render(); }catch(e){} try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(e){}
      setTimeout(function(){ if(TD && TD.ok){ trkDlgClose(); pushToast("Truck saved on " + (ro.roNumber || "the RO") + ".", true); } }, 900); }, Math.max(0, 420 - (Date.now() - t0))); },
    function(e){ if(!TD) return; TD.busy = false; TD.err = true; TD.msg = e.message; trkDlgDraw(); });
}
(function(){
  document.addEventListener("click", function(ev){
    if(!TD) return; var w = document.getElementById("trk-dlg"); if(!w || !w.contains(ev.target)) return;
    if(ev.target === w){ trkDlgClose(); return; }
    var t = ev.target.closest("[data-td]"); if(!t) return; var k = t.getAttribute("data-td");
    if(k === "close") trkDlgClose();
    else if(k === "save") trkDlgSave();
    else if(k === "confirm"){ var dr = trkDraftRo(getRO(TD.ro), TD.d), M = trkMatch(dr); if(M.entry) TD.d.body = M.entry.id; TD.ok = false; TD.msg = ""; trkDlgDraw(); }
    else if(k === "cat") trkCatOpen(function(e){ if(!TD) return; var p = VT_BY[e.vt]; TD.d.body = e.id; if(!trkFamily(TD.d.model) || trkFamily(TD.d.model) !== vtFam(p) || trkCode(TD.d.model) === trkFamily(TD.d.model)) TD.d.model = e.model; var yy = +TD.d.year; if(yy && (yy < p.from || yy > (p.to >= 2026 ? 9999 : p.to))) TD.d.year = ""; TD.ok = false; TD.msg = ""; trkDlgDraw(); }, t);
    else if(k === "pick"){ var kk = t.getAttribute("data-k"); if(!TRK_IN){ TRK_IN = document.createElement("input"); TRK_IN.type = "file"; TRK_IN.accept = "image/*"; TRK_IN.style.display = "none"; document.body.appendChild(TRK_IN); } TRK_IN.value = ""; TRK_IN.onchange = function(){ trkDlgFile(kk, TRK_IN.files && TRK_IN.files[0]); }; TRK_IN.click(); }
    else if(k === "clear"){ TD.d[t.getAttribute("data-k")] = ""; if(t.getAttribute("data-k") === "side") TD.d.cut = 0; TD.ok = false; TD.msg = ""; trkDlgDraw(); }
  });
  document.addEventListener("input", function(ev){ if(!TD) return; var t = ev.target, f = t && t.getAttribute && t.getAttribute("data-td-f"); if(!f || !t.closest("#trk-dlg")) return;
    if(f === "year"){ var v = String(t.value || "").replace(/\D/g, "").slice(0, 4); if(v !== t.value) t.value = v; TD.d.year = v; }
    else if(f === "model"){ TD.d.model = t.value; if(TD.d.body){ var e = trkEntry(TD.d.body), pf = e && (e.vt ? vtFam(VT_BY[e.vt]) : trkFamily(e.model)); if(pf && trkFamily(t.value) && pf !== trkFamily(t.value)) TD.d.body = ""; } TD.d.trim = ""; }
    else return; TD.ok = false; TD.err = false; TD.msg = ""; trkDlgDraw.part = true; trkDlgDraw(); });
  document.addEventListener("change", function(ev){ if(!TD) return; var t = ev.target, f = t && t.getAttribute && t.getAttribute("data-td-f"); if(!f || !t.closest("#trk-dlg")) return;
    if(f === "body"){ TD.d.body = t.value; TD.d.trim = ""; } else if(f === "trim") TD.d.trim = t.value; else return; TD.ok = false; TD.err = false; TD.msg = ""; trkDlgDraw(); });
  ["dragover", "dragleave", "drop"].forEach(function(n){ document.addEventListener(n, function(ev){ if(!TD) return; var z = ev.target.closest && ev.target.closest("[data-td-drop]"); if(!z) return; ev.preventDefault();
    if(n === "dragover") z.classList.add("drag"); else z.classList.remove("drag");
    if(n === "drop"){ var f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]; if(f && /^image\//.test(f.type)) trkDlgFile(z.getAttribute("data-td-drop"), f); else pushToast("Drop a picture file."); } }); });
  window.addEventListener("keydown", function(ev){
    if(!TD || TC) return; var w = document.getElementById("trk-dlg"); if(!w) return;
    if(ev.key === "Escape"){ ev.preventDefault(); ev.stopPropagation(); trkDlgClose(); return; }
    if(ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)){ ev.preventDefault(); ev.stopPropagation(); trkDlgSave(); return; }
    var z = ev.target && ev.target.closest && ev.target.closest("[data-td-drop]"); if(z && (ev.key === "Enter" || ev.key === " ")){ ev.preventDefault(); var b = w.querySelector('[data-td="pick"][data-k="' + z.getAttribute("data-td-drop") + '"]'); if(b) b.click(); }
    if(ev.key === "Tab"){ var f = w.querySelectorAll("button:not(:disabled), input, select:not(:disabled), [tabindex='0']"); if(f.length){ var a = f[0], zz = f[f.length - 1]; if(ev.shiftKey && document.activeElement === a){ ev.preventDefault(); zz.focus(); } else if(!ev.shiftKey && document.activeElement === zz){ ev.preventDefault(); a.focus(); } } }
    ev.stopPropagation();   /* the page's own shortcuts stay quiet */
  }, true);
})();
