/* Parsec · boot · dev-tools.js
   Developer readouts (off by default, localStorage tec_devtools) and v161Clean, which removes the localStorage keys of the work tools Parsec 16.1 retired, once.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   v161Clean devToolsOn setDevTools initDevReadout initDevHoverTag (5 functions)
   state      ros
   uses       data/ shell/ state/
*/
/* Parsec 16.1: the chat panel and the work-log stamps are gone. What they left behind goes on load:
   the chat panel's three browser keys, and any work-log stamp still waiting on a card for Accept.
   Notes and Work performed are never touched. */
function v161Clean(){
  try{ ["tec_asst_key", "tec_asst_model", "tec_asst_hist_v1"].forEach(function(k){ localStorage.removeItem(k); }); }catch(e){}
  var n = 0;
  try{ (STATE.ros || []).forEach(function(ro){ if(!Array.isArray(ro.suggest)) return; var k = ro.suggest.length;
    ro.suggest = ro.suggest.filter(function(s){ return !(s && /^b\.stamp\|/.test(String(s.key || ""))); }); n += k - ro.suggest.length; }); }catch(e){}
  if(n){ scheduleSave(true); render(); }
}
/* Dev readout: live page width (px) and cursor coordinates, parked in the bottom-right
   corner. Plain DOM text updates outside the render() cycle — resize and
   mousemove can fire far more often than a re-render should. */
function devToolsOn(){ try{ return localStorage.getItem("tec_devtools") === "1"; }catch(e){ return false; } }
function setDevTools(on){
  try{ localStorage.setItem("tec_devtools", on ? "1" : "0"); }catch(e){}
  if(on){ initDevReadout(); initDevHoverTag(); }
  ["dev-readout","dev-hover-tag"].forEach(function(id){ var el = document.getElementById(id); if(el) el.style.display = on ? "" : "none"; });
}
function initDevReadout(){
  if(document.getElementById("dev-readout")) return;
  var wrap = document.createElement("div");
  wrap.id = "dev-readout";
  wrap.innerHTML = '<span class="dev-pill" id="dev-cursor-pill">x 0, y 0</span>'
    + '<span class="dev-pill" id="dev-width-pill">0px</span>';
  document.body.appendChild(wrap);
  var widthPill = document.getElementById("dev-width-pill");
  var cursorPill = document.getElementById("dev-cursor-pill");
  function updateWidth(){ widthPill.textContent = document.documentElement.clientWidth + "px"; }
  updateWidth();
  window.addEventListener("resize", updateWidth);
  document.addEventListener("mousemove", function(e){
    cursorPill.textContent = "x " + e.clientX + ", y " + e.clientY;
  }, { passive: true });
}

/* Dev hover tag: names whatever is under the cursor the way the code itself names it —
   a data-key, a data-action, or its first CSS class — so a section can be identified
   without opening devtools. Climbs through the JC module's shadow DOM via
   composedPath()/getRootNode().host, since plain elementFromPoint stops at the host. */
function initDevHoverTag(){
  if(document.getElementById("dev-hover-tag")) return;
  var tag = document.createElement("div");
  tag.id = "dev-hover-tag";
  document.body.appendChild(tag);
  function labelFor(el){
    while(el){
      if(el.nodeType === 1){
        var dk = el.getAttribute && el.getAttribute("data-key");
        var da = el.getAttribute && el.getAttribute("data-action");
        var cls = el.classList && el.classList.length ? el.classList[0] : null;
        if(dk) return 'data-key="' + dk + '"';
        if(da) return 'data-action="' + da + '"';
        if(cls) return "." + cls;
      }
      var next = el.parentNode;
      if(!next){
        var root = el.getRootNode && el.getRootNode();
        next = (root && root.host) ? root.host : null;
      }
      el = next;
    }
    return null;
  }
  document.addEventListener("mousemove", function(e){
    var path = e.composedPath ? e.composedPath() : [e.target];
    var el = path[0];
    if(!(el instanceof Element)){
      for(var i = 0; i < path.length; i++){ if(path[i] instanceof Element){ el = path[i]; break; } }
    }
    var label = el ? labelFor(el) : null;
    if(!label){ tag.classList.remove("show"); return; }
    tag.textContent = label;
    tag.style.left = Math.min(e.clientX + 14, window.innerWidth - 20) + "px";
    tag.style.top = (e.clientY + 18) + "px";
    tag.classList.add("show");
  }, { passive: true, capture: true });
  document.addEventListener("mouseleave", function(){ tag.classList.remove("show"); });
}
