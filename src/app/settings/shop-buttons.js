/* Parsec · settings · shop-buttons.js
   Shop buttons by department (16.3 C): the table in Settings → The shop (STATE.shopBtns), v163ShopOk(ro, act) that every shop button asks, the department label on the truck card.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   v163Btns v163DKey v163Title v163Depts v163DName v163Clean v163AnyOff v163ShopOk v163TableHtml v163DeptActs v163Hide v163Watch … (14 functions, 4 constants)
   state      ros shopBtns
   uses       automations/ kit/ ro/ state/
   at load    a delayed start · on document DOMContentLoaded
*/
/* ---------- Shop buttons by department ---------- */
var V163_ACTS = [["start", "Start op"], ["roadtest", "Road test"], ["checks", "Truck checks"], ["transfer", "Transfer"], ["release", "Release"]];
function v163Btns(){ var b = STATE.shopBtns; return b && typeof b === "object" && !Array.isArray(b) ? b : {}; }
function v163DKey(d){ d = String(d == null ? "" : d).trim().replace(/\s+/g, " ").toLowerCase(); return d || "_none"; }
function v163Title(k){ return k === "_none" ? "No department" : String(k).replace(/(^|\s)([a-z])/g, function(_, a, b){ return a + b.toUpperCase(); }); }
function v163Depts(){   /* every department on an RO, open or closed, any with a setting, and No department last */
  var by = {}, L = [];
  (STATE.ros || []).forEach(function(r){ if(!r || r.shop || r.id === SHOP_RO_ID) return; var nm = String(r.department || "").trim().replace(/\s+/g, " "); if(!nm) return; var k = v163DKey(nm); if(!by[k]){ by[k] = nm; L.push(k); } });
  Object.keys(v163Btns()).forEach(function(k){ if(k !== "_none" && !by[k]){ by[k] = v163Title(k); L.push(k); } });
  L.sort(function(a, b){ return by[a].localeCompare(by[b]); });
  return L.map(function(k){ return [k, by[k]]; }).concat([["_none", "No department"]]);
}
function v163DName(k){ var d = v163Depts().filter(function(x){ return x[0] === k; })[0]; return d ? d[1] : v163Title(k); }
function v163Clean(v){ var o = {}; if(!v || typeof v !== "object") return o;
  Object.keys(v).forEach(function(k){ var row = v[k], r = {}; if(!row || typeof row !== "object") return; V163_ACTS.forEach(function(a){ if(row[a[0]] === false) r[a[0]] = false; }); if(Object.keys(r).length) o[k] = r; });
  return o; }
function v163AnyOff(){ return Object.keys(v163Btns()).length > 0; }
/* false only when the RO's department has that button turned off — Fork A's ⋯ on RO cards asks this too */
function v163ShopOk(ro, act){
  try{ if(typeof ro === "string") ro = typeof getRO === "function" ? getRO(ro) : null; if(!ro) return true;
    var row = v163Btns()[v163DKey(ro.department)]; return !(row && row[act] === false); }catch(e){ return true; }
}
function v163TableHtml(ro){
  var B = v163Btns(), d = ro ? ' disabled' : '';
  return '<div class="v163-sb" role="table" aria-label="Shop buttons by department"><div class="v163-sbh" role="row"><span role="columnheader">Department</span>' + V163_ACTS.map(function(a){ return '<span role="columnheader">' + esc(a[1]) + '</span>'; }).join('') + '<span></span></div>'
    + v163Depts().map(function(D){ var row = B[D[0]] || {}, ch = V163_ACTS.some(function(a){ return row[a[0]] === false; }), kq = encodeURIComponent(D[0]);
      return '<div class="v163-sbr' + (ch ? ' chg' : '') + '" role="row" data-dept="' + esc(D[0]) + '"><span class="n" role="rowheader">' + (ch ? '<i class="sg-dot" aria-label="changed from the default"></i>' : '') + esc(D[1]) + '</span>'
        + V163_ACTS.map(function(a){ var on = row[a[0]] !== false;
          return '<span role="cell"><button class="v163-sbt' + (on ? ' on' : '') + '" role="switch" aria-checked="' + on + '" aria-label="' + esc(D[1] + ' — ' + a[1]) + '" title="' + esc(D[1] + ': ' + a[1] + (on ? ' shows' : ' is hidden')) + '" data-action="px-sg-op" data-id="shop.shopBtns" data-op="t|' + kq + '|' + a[0] + '"' + d + '><i></i></button></span>'; }).join('')
        + '<span class="r">' + (ch && !ro ? '<button class="px-btn sm ghost" data-action="px-sg-op" data-id="shop.shopBtns" data-op="r|' + kq + '" title="Every button back on for ' + esc(D[1]) + '">' + pxI("history", 12) + 'Reset</button>' : '') + '</span></div>'; }).join('')
    + '</div>';
}
var V163_SG = { id: "shop.shopBtns", g: "shop", sub: "Shop buttons", label: "Shop buttons by department", help: "which shop buttons each department’s ROs show — everything is on until you turn it off", who: "va",
  where: "The RO page truck card · the ⋯ on RO cards · Foreman and Parts", kind: "custom",
  def: function(){ return {}; }, get: function(){ return sgCopy(v163Btns()); },
  set: function(v){ var c = v163Clean(v); if(Object.keys(c).length) STATE.shopBtns = c; else delete STATE.shopBtns; },
  text: function(v){ var L = []; Object.keys(v || {}).forEach(function(k){ var off = V163_ACTS.filter(function(a){ return v[k] && v[k][a[0]] === false; }); if(off.length) L.push(v163DName(k) + ": " + off.map(function(a){ return a[1]; }).join(", ") + " off"); }); return L.length ? L.join(" · ") : "All on"; },
  words: function(){ return "department departments start op road test truck checks transfer release " + v163Depts().map(function(d){ return d[1]; }).join(" "); },
  render: function(ro){ return v163TableHtml(ro); },
  change: function(b, a){
    b = b || {}; a = a || {}; var ks = {}, D = []; Object.keys(b).concat(Object.keys(a)).forEach(function(k){ ks[k] = 1; });
    Object.keys(ks).forEach(function(k){ V163_ACTS.forEach(function(x){ var was = !(b[k] && b[k][x[0]] === false), now = !(a[k] && a[k][x[0]] === false); if(was !== now) D.push([k, x[1], was, now]); }); });
    if(!D.length) return null;
    if(D.length === 1) return [v163DName(D[0][0]) + ": " + D[0][1] + " " + (D[0][2] ? "on" : "off"), D[0][3] ? "on" : "off"];
    var k0 = D[0][0];
    if(D.every(function(x){ return x[0] === k0; })) return [v163DName(k0) + ": " + D.filter(function(x){ return !x[2]; }).map(function(x){ return x[1]; }).join(", ") + " off", D.every(function(x){ return x[3]; }) ? "all on" : "changed"];
    return [D.length + " shop buttons", D.every(function(x){ return x[3]; }) ? "all on" : "changed"];
  },
  op: function(op, val, cur){
    var p = String(op).split("|"), k = decodeURIComponent(p[1] || ""); if(!k) return cur; cur = cur || {};
    if(p[0] === "t"){ var act = p[2]; if(!V163_ACTS.some(function(a){ return a[0] === act; })) return cur; cur[k] = cur[k] || {}; if(cur[k][act] === false) delete cur[k][act]; else cur[k][act] = false; if(!Object.keys(cur[k]).length) delete cur[k]; return cur; }
    if(p[0] === "r"){ delete cur[k]; return cur; }
    return cur;
  } };
(function(){ if(typeof SG_REG === "undefined" || SG_BY[V163_SG.id]) return; var at = -1; SG_REG.forEach(function(e, j){ if(e.g === "shop") at = j; }); SG_REG.splice(at + 1, 0, V163_SG); SG_BY[V163_SG.id] = V163_SG; })();

/* the truck card on the RO page (inside the RO page's closure, ropBand): its shop buttons under the department, the ones turned off gone.
   A running clock's Stop always stays. */
function v163DeptActs(acts, ro){
  if(!acts || !ro || ro.shop || ro.id === SHOP_RO_ID) return acts;
  var off = function(act){ return !v163ShopOk(ro, act); }, shop = 0;
  Array.prototype.slice.call(acts.children).forEach(function(b){
    var t = b.getAttribute("title") || "", c = b.classList, act = /^Start the clock/.test(t) ? "start" : /^Transfer/.test(t) ? "transfer" : c.contains("rop-rtb") ? "roadtest" : c.contains("rop-qcb") ? "checks" : c.contains("rop-byb") ? "release" : /^Stop the clock/.test(t) ? "stop" : "";
    if(!act) return;
    if(act !== "stop" && off(act)){ b.remove(); return; }
    shop++;
  });
  var nm = String(ro.department || "").trim().replace(/\s+/g, " ");
  var wrap = document.createElement("div"); wrap.className = "rop-v163d";
  var lab = document.createElement("div"); lab.className = "rop-v163dl"; lab.textContent = nm ? nm + " · shop" : "Shop";
  lab.title = (nm ? "The " + nm + " department’s" : "The") + " shop buttons — the manager sets which show in Settings › The shop";
  wrap.appendChild(lab);
  if(!shop){ var no = document.createElement("div"); no.className = "rop-v163dn"; no.textContent = "No shop buttons for " + (nm || "ROs without a department"); wrap.appendChild(no); }
  wrap.appendChild(acts);
  return wrap;
}
/* the Foreman and Parts headers (and any Transfer / Road test / Truck checks button that names its RO): hidden while that department has it off */
var V163_SEL = [['[data-p="xfer"][data-ro],[data-p="send"][data-ro]', "transfer"], [".trx-rtb[data-ro]", "roadtest"], [".trx-qcb[data-ro]", "checks"]];
function v163Hide(root){
  root = root || document;
  if(!v163AnyOff() && !root.querySelector(".v163-off")) return 0;
  var n = 0;
  V163_SEL.forEach(function(s){ Array.prototype.forEach.call(root.querySelectorAll(s[0]), function(b){ var ok = v163ShopOk(b.getAttribute("data-ro"), s[1]); if(b.classList.contains("v163-off") === ok) b.classList.toggle("v163-off", !ok); if(!ok) n++; }); });
  return n;
}
var V163_MO = null;
function v163Watch(){
  if(V163_MO || typeof MutationObserver === "undefined" || !document.body) return;
  V163_MO = new MutationObserver(function(){ try{ v163Hide(document); }catch(e){} });
  V163_MO.observe(document.body, { childList: true, subtree: true });
  try{ v163Hide(document); }catch(e){}
}
if(document.body) setTimeout(v163Watch, 0); else document.addEventListener("DOMContentLoaded", v163Watch);


/* Fork A's Automations page, when the build has it: a string (autoPageHtml), a mount (autoPageMount), or null */
function sgAutoPage(){
  try{ if(typeof autoPageHtml === "function") return autoPageHtml(); }catch(e){ console.error(e); }
  try{ if(typeof autoPageMount === "function") return "mount"; }catch(e){}
  return null;
}
function sgShown(e){ if(e.fallback && sgAutoPage() !== null) return false; try{ return !e.show || !!e.show(); }catch(x){ return false; } }
