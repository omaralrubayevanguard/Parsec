/* Parsec · trucks · notes-on-truck.js
   Notes on the truck (Parsec 9.9): put a note where the issue is on the RO's truck picture; TI holds the open inspector.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   trkNotesOf trkPicKey trkWhen trkInspOpen trkInspClose trkInspDraw trkInspPlace trkInspSave trkInspDel trkBannerNotes TRK_KINDS TI (10 functions, 2 constants)
   state      ros
   uses       access/ data/ kit/ ro/ ro-page/ state/
   at load    on document click · on window keydown
*/
/* ============================== Notes on the truck (Parsec 9.9) ==============================
   Put a note where the issue is: on the RO's truck picture, a numbered mark per observation —
   its type and what you see. Kept on the RO (ro.trkNotes); undo works. The marks show where on the
   truck, not a diagnosis; on a model picture they point at the area, not this exact unit. */
var TRK_KINDS = ["Inspection", "Damage", "Leak", "Wear", "Missing part", "Customer concern"];
var TI = null;   /* the open notes window: { ro, sel, draft, placing, moving, ros } */
function trkNotesOf(ro){ return ro && Array.isArray(ro.trkNotes) ? ro.trkNotes : []; }
function trkPicKey(P){ return P.kind === "model" ? "m:" + P.entry.id : P.kind === "photo" ? "p:" + P.file.id : "none"; }
function trkWhen(iso){ try{ var d = new Date(iso); return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }catch(e){ return ""; } }
function trkInspOpen(ro, id){ if(!ro) return; TI = { ro: ro.id, sel: id || null, draft: null, placing: false, moving: null, ros: STATE.ros }; trkInspDraw(); }
function trkInspClose(){ var el = document.getElementById("trk-insp"); if(el) el.remove(); TI = null; document.documentElement.classList.remove("ti-open"); try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(e){} }
function trkInspDraw(focusText){
  var ro = TI && getRO(TI.ro); if(!ro){ trkInspClose(); return; }
  var P = trkPick(ro), key = trkPicKey(P), N = trkNotesOf(ro), I = trkInfo(ro);
  var cur = TI.draft || N.filter(function(n){ return n.id === TI.sel; })[0] || null, num = cur ? (TI.draft ? N.length + 1 : N.indexOf(cur) + 1) : 0;
  var pic = P.kind === "model" ? '<img src="' + esc(P.src) + '" alt="' + esc(trkLabel(ro)) + '" draggable="false">'
    : P.kind === "photo" ? '<img' + (P.src ? ' src="' + esc(P.src) + '"' : '') + ' data-ti-ph="1" alt="Check-in photo" draggable="false">' : '<span class="ti-sil">' + TRK_SIL + '</span>';
  var marks = N.map(function(n, i){ return '<button type="button" class="ti-m' + (n.pic && n.pic !== key ? ' other' : '') + (cur === n ? ' sel' : '') + '" style="left:' + (n.x * 100).toFixed(2) + '%;top:' + (n.y * 100).toFixed(2) + '%" data-ti="sel" data-id="' + esc(n.id) + '" title="' + esc(n.kind + (n.text ? ' — ' + n.text : '') + (n.pic && n.pic !== key ? ' (placed on another picture)' : '')) + '">' + (i + 1) + '</button>'; }).join('')
    + (TI.draft ? '<span class="ti-m sel draft" style="left:' + (TI.draft.x * 100).toFixed(2) + '%;top:' + (TI.draft.y * 100).toFixed(2) + '%">' + num + '</span>' : '');
  var ed = cur ? '<div class="ti-ed"><div class="ti-eh"><span class="ti-n">' + num + '</span><b>' + (TI.draft ? 'New note' : 'Note ' + num) + '</b>' + (TI.draft ? '' : '<small>' + esc((cur.by ? cur.by + ' · ' : '') + trkWhen(cur.at)) + '</small>') + '</div>'
      + '<label class="ti-l">Type<select data-ti-f="kind">' + TRK_KINDS.map(function(k){ return '<option' + (k === cur.kind ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select></label>'
      + '<label class="ti-l">What you see<textarea data-ti-f="text" rows="4" placeholder="Like: front bumper cracked on the passenger side">' + esc(cur.text || '') + '</textarea></label>'
      + '<div class="ti-eb"><button type="button" class="px-btn sm pri" data-ti="save">Save note</button>' + (TI.draft ? '<button type="button" class="px-btn sm ghost" data-ti="cancel">Cancel</button>' : '<button type="button" class="px-btn sm" data-ti="move">Move</button><button type="button" class="px-btn sm ghost ti-del" data-ti="del">Remove</button>') + '</div></div>' : '';
  var list = N.length ? '<div class="ti-list">' + N.map(function(n, i){ return '<button type="button" class="ti-li' + (cur === n ? ' sel' : '') + '" data-ti="sel" data-id="' + esc(n.id) + '"><span class="ti-n">' + (i + 1) + '</span><span class="ti-lt"><b>' + esc(n.kind) + '</b><small>' + esc(n.text || '') + '</small></span></button>'; }).join('') + '</div>'
    : '<p class="ti-empty">No notes yet. Press <b>Add note</b>, then click the truck where the issue is.</p>';
  var bar = TI.placing ? '<span class="ti-hint">Click the truck where it is — Enter puts it in the middle, Esc cancels</span>' : '<span class="ti-hint">' + (N.length ? N.length + ' note' + (N.length === 1 ? '' : 's') + ' · click a mark to open it' : 'Notes on this truck') + '</span><button type="button" class="px-btn sm" data-ti="add">+ Add note</button>';
  var h = '<div class="ti" role="dialog" aria-modal="true" aria-label="Notes on the truck" tabindex="-1">'
    + '<div class="ti-h"><div class="ti-ht"><div class="ti-eb0"><span class="mono">' + esc(ro.roNumber || '') + '</span> · Notes on the truck</div><h2>' + esc(ro.customerName || 'Customer') + '</h2><div class="ti-sub">' + esc(trkLabel(ro) + (ro.unitNumber ? ' · Unit ' + ro.unitNumber : '')) + '</div></div>'
    + '<button type="button" class="ti-x" data-ti="close" aria-label="Close"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'
    + '<div class="ti-b"><div class="ti-st"><div class="ti-bar">' + bar + '</div><div class="ti-stage' + (TI.placing ? ' placing' : '') + '"><div class="ti-pic" data-ti="pic">' + pic + marks + '</div></div>'
    + '<p class="ti-fine">' + (P.kind === "model" ? 'The marks show where on the truck — this is the model picture, not this exact unit.' : P.kind === "photo" ? 'On this truck’s check-in photo.' : 'No picture for this model yet — the marks go on the outline.') + '</p></div>'
    + '<div class="ti-side">' + ed + list + '</div></div></div>';
  var w = document.getElementById("trk-insp");
  if(!w){ w = document.createElement("div"); w.id = "trk-insp"; w.className = "ti-wrap"; document.body.appendChild(w); }
  w.innerHTML = h; document.documentElement.classList.add("ti-open");
  if(P.kind === "photo" && !P.src) trkLoadPhoto(P.file, ro.id, function(u){ var im = w.querySelector("img[data-ti-ph]"); if(im && u) im.src = u; });
  if(focusText){ var ta = w.querySelector('[data-ti-f="text"]'); if(ta) try{ ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }catch(e){} }
  else if(TI.placing){ var st = w.querySelector(".ti-pic"); if(st){ st.tabIndex = -1; try{ st.focus({ preventScroll: true }); }catch(e){} } }
  else { var dl = w.querySelector(".ti"); if(dl && !w.contains(document.activeElement)) try{ dl.focus({ preventScroll: true }); }catch(e){} }
}
function trkInspPlace(x, y){
  var ro = getRO(TI.ro); if(!ro) return; x = Math.max(0.02, Math.min(0.98, x)); y = Math.max(0.03, Math.min(0.97, y));
  if(TI.moving){ var n = trkNotesOf(ro).filter(function(q){ return q.id === TI.moving; })[0]; if(n){ pushUndo("truck note"); n.x = x; n.y = y; n.pic = trkPicKey(trkPick(ro)); scheduleSave(true); TI.ros = STATE.ros; } TI.sel = TI.moving; TI.moving = null; TI.placing = false; trkInspDraw(); return; }
  TI.draft = { x: x, y: y, kind: "Inspection", text: "" }; TI.sel = null; TI.placing = false; trkInspDraw(true);
}
function trkInspSave(){
  var ro = getRO(TI.ro), w = document.getElementById("trk-insp"); if(!ro || !w) return;
  var kind = (w.querySelector('[data-ti-f="kind"]') || {}).value || "Inspection", text = String((w.querySelector('[data-ti-f="text"]') || {}).value || "").trim().slice(0, 600);
  if(!text){ pushToast("Write what you see first."); var ta = w.querySelector('[data-ti-f="text"]'); if(ta) ta.focus(); return; }
  pushUndo("truck note");
  if(!Array.isArray(ro.trkNotes)) ro.trkNotes = [];
  if(TI.draft){ var n = { id: uid("tn"), x: +TI.draft.x.toFixed(4), y: +TI.draft.y.toFixed(4), kind: kind, text: text, at: nowIso(), by: (typeof punchByName === "function" && punchByName()) || "", pic: trkPicKey(trkPick(ro)) }; ro.trkNotes.push(n); TI.draft = null; TI.sel = n.id; }
  else { var e = ro.trkNotes.filter(function(q){ return q.id === TI.sel; })[0]; if(e){ e.kind = kind; e.text = text; e.edited = nowIso(); } }
  scheduleSave(true); TI.ros = STATE.ros; trkInspDraw(); pushToast("Note saved on the truck.");
}
function trkInspDel(){
  var ro = getRO(TI.ro); if(!ro) return; pushUndo("truck note");
  ro.trkNotes = trkNotesOf(ro).filter(function(q){ return q.id !== TI.sel; }); TI.sel = null; scheduleSave(true); TI.ros = STATE.ros; trkInspDraw(); pushToast("Note removed.", true);
}
(function(){
  document.addEventListener("click", function(ev){
    if(!TI) return; var w = document.getElementById("trk-insp"); if(!w || !w.contains(ev.target)) return;
    var t = ev.target.closest("[data-ti]"); if(ev.target === w){ trkInspClose(); return; }
    if(!t) return; var k = t.getAttribute("data-ti");
    if(k === "pic"){ if(!TI.placing) return; var r = t.getBoundingClientRect(); if(!r.width) return; trkInspPlace((ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height); return; }
    if(k === "close") trkInspClose();
    else if(k === "add"){ TI.placing = true; TI.moving = null; TI.draft = null; TI.sel = null; trkInspDraw(); }
    else if(k === "move"){ TI.placing = true; TI.moving = TI.sel; trkInspDraw(); }
    else if(k === "sel"){ if(TI.placing && !TI.moving) return; TI.draft = null; TI.placing = false; TI.moving = null; TI.sel = t.getAttribute("data-id"); trkInspDraw(); }
    else if(k === "save") trkInspSave();
    else if(k === "cancel"){ TI.draft = null; trkInspDraw(); }
    else if(k === "del") trkInspDel();
  });
  window.addEventListener("keydown", function(ev){
    if(!TI) return; var w = document.getElementById("trk-insp"); if(!w) return;
    var inField = ev.target && ev.target.closest && ev.target.closest("#trk-insp input, #trk-insp textarea, #trk-insp select");
    if(ev.key === "Escape"){ ev.preventDefault(); ev.stopPropagation(); if(TI.placing){ TI.placing = false; TI.moving = null; trkInspDraw(); } else if(TI.draft){ TI.draft = null; trkInspDraw(); } else trkInspClose(); return; }
    if(TI.placing && ev.key === "Enter"){ ev.preventDefault(); ev.stopPropagation(); trkInspPlace(0.5, 0.5); return; }
    if(inField && ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)){ ev.preventDefault(); ev.stopPropagation(); trkInspSave(); return; }
    if(ev.key === "Tab"){ var f = w.querySelectorAll("button, select, textarea, [tabindex]"); if(f.length){ var a = f[0], z = f[f.length - 1]; if(ev.shiftKey && document.activeElement === a){ ev.preventDefault(); z.focus(); } else if(!ev.shiftKey && document.activeElement === z){ ev.preventDefault(); a.focus(); } } }
    if(!inField && ev.key === " " && !(ev.target && ev.target.closest && ev.target.closest("#trk-insp button"))) ev.preventDefault();
    ev.stopPropagation();   /* the page's own shortcuts (Space for the clock, S, T …) stay quiet while the notes are open */
  }, true);
})();
/* the banner's own marks and the way in */
function trkBannerNotes(pic, ro, P){
  var N = trkNotesOf(ro), key = trkPicKey(P), mine = N.filter(function(n){ return n.pic === key; });
  if(P.kind === "model") mine.forEach(function(n){ var d = document.createElement("span"); d.className = "px-trk__mk"; d.style.left = (n.x * 100) + "%"; d.style.top = (n.y * 100) + "%"; d.textContent = N.indexOf(n) + 1; d.title = n.kind + " — " + (n.text || ""); pic.appendChild(d); });
  if(N.length){ var b = document.createElement("button"); b.type = "button"; b.className = "px-trk__nb"; b.textContent = N.length + " note" + (N.length === 1 ? "" : "s") + " on the truck"; b.addEventListener("click", function(ev){ ev.stopPropagation(); trkInspOpen(ro); }); pic.appendChild(b); }
  var img = pic.querySelector("img, svg"); if(img){ img.style.cursor = "pointer"; img.addEventListener("click", function(){ trkInspOpen(ro); }); }
}
