/* Parsec · ro · truck-card-words.js
   The truck card's words that change in place (Parsec 14.2): year / make / model / unit, the key tag beside the spot (14.9 D), quoted hours edited inline (qtEdit).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   v142E v142Op v142N v142Ok v149KeyTxt v149KeySeg rifHtml rifVeh rifEdit qtHtml qtRoHtml qtSet … (15 functions, 1 constant)
   uses       access/ data/ pages/ state/
   at load    on document click · on document keydown
*/
/* ============================== Parsec 14.2 ==============================
   · The truck card's customer, year, make, model and unit change in place (rifHtml / rifVeh) — the Technician page,
     the RO list pane and the RO page — through the same field table and setter as the RO details (ROFLD, roFldSet).
   · Quoted hours change in place wherever an operation's quote shows (qtHtml): click, type, Enter.
   (14.3: the Technician page's Parts tab is the RO page's own now — its three add-a-part pops went.) */
function v142E(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function v142Op(ro, id){ return ro ? (ro.operations || []).filter(function(o){ return o && o.id === id; })[0] || null : null; }
function v142N(ro, op){ return ro ? (ro.operations || []).indexOf(op) + 1 : 0; }
function v142Ok(ro){ try{ return typeof roFldCanEdit === "function" ? roFldCanEdit(ro) : !!ro; }catch(e){ return false; } }
/* ---------- the truck card's words ---------- */
var RIF_PH = { customerName: "Add customer", year: "Year", make: "Make", model: "Model", unitNumber: "Add unit", location: "Add spot", keyTag: "Add key" };
/* ============================== Parsec 14.9 (D) ==============================
   · The key tag beside the spot: the RO page's truck card line, the RO list pane and its Spot column, the Technician page's
     list rows. On the truck card it changes in place like the spot (rifHtml → rifEdit → roFldSet: Undo, the Activity line).
   (Air never counts toward efficiency and no clock stops at the end of the shift: wording and ockAuto, patched in
    b9/build_v9zz149d.py.) */
function v149KeyTxt(ro){ var k = ro ? String(ro.keyTag == null ? "" : ro.keyTag).trim() : ""; return k ? "Key " + k : ""; }
/* " · Key 42" — on the truck card it's a click-to-change word (and "Add key" when there's none and you may change it) */
function v149KeySeg(ro){
  if(!ro) return "";
  var k = v149KeyTxt(ro), ed = false;
  try{ ed = typeof v142Ok === "function" && v142Ok(ro); }catch(e){}
  if(ed && typeof rifHtml === "function") return " · " + rifHtml(ro, "keyTag", k, "Add key");
  return k ? " · " + String(k).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }) : "";
}

function rifHtml(ro, k, shown, ph){
  var v = shown == null ? "" : String(shown);
  if(!ro || !v142Ok(ro)) return v142E(v || ph || "");
  return '<span class="rif' + (v ? "" : " rif-e") + '" role="button" tabindex="0" data-rif-ro="' + v142E(ro.id) + '" data-rif-k="' + k + '" title="Click to change">' + v142E(v || ph || RIF_PH[k] || "Add") + "</span>";
}
/* "2020 Volvo VNL 300 · 6x4 · Mid-roof · Unit T-876" — year, make, model and unit change; what the body catalog adds stays as it is */
function rifVeh(ro, line, o){
  o = o || {}; line = String(line || "").replace(/^\s*[—-]\s*$/, ""); var segs = line.split(" · ").filter(Boolean), first = segs.shift() || "", t = first.split(/\s+/).filter(Boolean), y = "", mk = "";
  if(/^(19|20)\d{2}$/.test(t[0] || "")) y = t.shift();
  if(t.length > 1 && /^(volvo|mack|freightliner|kenworth|peterbilt|international|western star|cummins|detroit)$/i.test(t[0])) mk = t.shift();
  var yr = ro.year ? String(ro.year) : y, make = ro.make || mk, model = ro.model || t.join(" ");
  segs = segs.filter(function(s){ return !/^Unit\s/i.test(s) && !(o.dropSpot && ro.location && s === ro.location); });
  var h = [rifHtml(ro, "year", yr), rifHtml(ro, "make", make), rifHtml(ro, "model", model)].join(" ");
  if(segs.length) h += " · " + segs.map(v142E).join(" · ");
  if(!o.noUnit) h += " · Unit " + rifHtml(ro, "unitNumber", ro.unitNumber || "", "—");
  if(o.spot) h += " · " + rifHtml(ro, "location", ro.location || "", "Add spot");
  return h;
}
function rifEdit(sp){
  if(!sp || sp.querySelector("input")) return;
  var ro = getRO(sp.getAttribute("data-rif-ro")), k = sp.getAttribute("data-rif-k"), f = ro && typeof roFld === "function" ? roFld(k) : null; if(!ro || !f) return;
  var cur = roFldGet(ro, f) || (sp.classList.contains("rif-e") ? "" : sp.textContent), inp = document.createElement("input");
  inp.className = "rif-in"; inp.value = cur; inp.setAttribute("data-no-draft", ""); inp.autocomplete = "off"; inp.setAttribute("aria-label", f.l);
  var fit = function(){ inp.style.width = Math.max(4, Math.min(48, (inp.value || "").length + 2)) + "ch"; }; fit();
  sp.textContent = ""; sp.appendChild(inp); sp.classList.add("on"); inp.focus(); try{ inp.select(); }catch(e){}
  var done = false;
  function commit(keep, next){
    if(done) return; done = true; var v = inp.value.trim();
    if(keep && v !== String(cur || "").trim()){ var w = f.o.warn ? f.o.warn(v) : ""; roFldSet(ro, k, v); if(w) pushToast(w + " — saved anyway.", false); else pushToast(f.l + (v ? " · " + v : " cleared"), true); }
    v141Render();
    if(next) setTimeout(function(){ var root = sp.getRootNode ? sp.getRootNode() : document, L = Array.prototype.slice.call(root.querySelectorAll('.rif[data-rif-ro="' + ro.id + '"]')), i = L.map(function(x){ return x.getAttribute("data-rif-k"); }).indexOf(k), nx = L[i + next]; if(nx) rifEdit(nx); }, 30);
  }
  inp.addEventListener("input", fit);
  inp.addEventListener("keydown", function(ev){ ev.stopPropagation(); if(ev.key === "Enter"){ ev.preventDefault(); commit(true); } else if(ev.key === "Escape"){ ev.preventDefault(); commit(false); } else if(ev.key === "Tab"){ ev.preventDefault(); commit(true, ev.shiftKey ? -1 : 1); } });
  inp.addEventListener("blur", function(){ setTimeout(function(){ commit(true); }, 0); });
}
/* ---------- quoted hours ---------- */
function qtHtml(ro, op, q, d){
  var v = (+q || 0).toFixed(d == null ? 2 : d);
  if(!ro || !op || op.declined || !v142Ok(ro)) return v;
  return '<span class="qte" role="button" tabindex="0" data-qt-ro="' + v142E(ro.id) + '" data-qt-op="' + v142E(op.id) + '" title="Quoted hours — click to change">' + v + "</span>";
}
/* an RO's total: it changes only when one operation carries the quote */
function qtRoHtml(ro, q, d){
  var L = (ro && ro.operations || []).filter(function(o){ return o && !o.declined && (o.complaint || +o.quoted); });
  return L.length === 1 ? qtHtml(ro, L[0], q, d) : (+q || 0).toFixed(d == null ? 2 : d);
}
function qtSet(ro, op, v){
  var was = +op.quoted || 0; if(Math.abs(was - v) < .001) return false;
  pushUndo("quoted hours"); op.quoted = v ? String(v) : "";
  try{ audit("ro", roLabel(ro) + ": Op " + v142N(ro, op) + " quoted " + was.toFixed(2) + " → " + v.toFixed(2) + " h", ro); }catch(e){}
  scheduleSave(true); pushToast("Op " + v142N(ro, op) + " quoted " + v.toFixed(2) + " h.", true); return true;
}
function qtEditIn(host, ro, op){
  if(!host || !ro || !op || host.querySelector("input")) return;
  var q = +op.quoted || 0, inp = document.createElement("input");
  inp.className = "qte-in"; inp.value = q > 0 ? q.toFixed(2) : ""; inp.inputMode = "decimal"; inp.setAttribute("aria-label", "Quoted hours"); inp.setAttribute("data-no-draft", ""); inp.autocomplete = "off";
  host.textContent = ""; host.appendChild(inp); host.classList.add("on"); inp.focus(); try{ inp.select(); }catch(e){}
  var done = false;
  function commit(keep){ if(done) return; done = true; var s = String(inp.value).replace(/[^\d.]/g, ""), v = s ? Math.round(parseFloat(s) * 100) / 100 : 0;
    if(keep && isFinite(v) && v >= 0 && v < 1000) qtSet(ro, op, v); v141Render(); }
  inp.addEventListener("keydown", function(ev){ ev.stopPropagation(); if(ev.key === "Enter" || ev.key === "Tab"){ ev.preventDefault(); commit(true); } else if(ev.key === "Escape"){ ev.preventDefault(); commit(false); } });
  inp.addEventListener("blur", function(){ setTimeout(function(){ commit(true); }, 0); });
}
function qtEdit(sp){ var ro = getRO(sp.getAttribute("data-qt-ro")); qtEditIn(sp, ro, v142Op(ro, sp.getAttribute("data-qt-op"))); }
/* one listener for both, in the page and inside the RO page (its own root) */
function v142Tgt(e){ var t = (e.composedPath && e.composedPath()[0]) || e.target; if(t && t.nodeType !== 1) t = t.parentElement; return t && t.closest ? t : null; }
document.addEventListener("click", function(e){
  var t = v142Tgt(e); if(!t) return;
  var q = t.closest(".qte"), r = q ? null : t.closest(".rif");
  if(!q && !r) return;
  e.stopPropagation(); if(t.closest("input")) return; e.preventDefault();
  if(q) qtEdit(q); else rifEdit(r);
}, true);
["mousedown", "dblclick"].forEach(function(ev){ document.addEventListener(ev, function(e){ var t = v142Tgt(e); if(t && (t.closest(".qte") || t.closest(".rif"))) e.stopPropagation(); }, true); });
document.addEventListener("keydown", function(e){
  if(e.key !== "Enter" && e.key !== " ") return; var t = v142Tgt(e); if(!t || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
  var q = t.closest(".qte"), r = q ? null : t.closest(".rif"); if(!q && !r) return;
  e.preventDefault(); e.stopPropagation(); if(q) qtEdit(q); else rifEdit(r);
}, true);
