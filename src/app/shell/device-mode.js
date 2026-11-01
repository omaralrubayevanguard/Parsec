/* Parsec · shell · device-mode.js
   Computer or phone view: Automatic picks from the device, or the person sets it (DEVICE_SETTING); applyDevice sets data-device on <html>.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   deviceAuto deviceMode applyDevice setDevice DEVICE_MODES DEVICE_SETTING (4 functions, 2 constants)
   uses       ro/
   at load    builds DEVICE_SETTING (a closure)
*/
/* ============================== DEVICE MODE ==============================
   Desktop / Tablet / Phone, picked from the header switch, or Auto. Auto reads the
   device itself — touch screen and screen size — never the window width, so dragging
   a desktop window narrower still holds the desktop layout. Saved per device. */
var DEVICE_MODES = ["auto","desktop","tablet","phone"];
var DEVICE_SETTING = (function(){ var v = null; try{ v = localStorage.getItem("tec_device"); }catch(e){} return v === "tablet" ? "desktop" : DEVICE_MODES.indexOf(v) >= 0 ? v : "auto"; })();   /* Tablet is gone: the computer view */
function deviceAuto(){
  /* Automatic: a phone gets the phone view, everything else the computer view */
  var sw0 = Math.min(screen.width || 9999, screen.height || 9999); if(sw0 < 600 && ((window.matchMedia && window.matchMedia("(pointer: coarse)").matches) || window.innerWidth < 600)) return "phone"; return "desktop";
  var coarse = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  if(!coarse) return "desktop";
  var sw = Math.min(screen.width || 9999, screen.height || 9999);
  return sw < 600 ? "phone" : "tablet";
}
function deviceMode(){ return DEVICE_SETTING === "auto" ? deviceAuto() : DEVICE_SETTING; }
function applyDevice(){
  var m = deviceMode();
  if(document.documentElement.getAttribute("data-device") !== m) document.documentElement.setAttribute("data-device", m);
  var de = document.documentElement;
  document.querySelectorAll(".jc-host").forEach(function(h){
    if(h.getAttribute("data-device") !== m) h.setAttribute("data-device", m);
    /* Theme, feel and layout ride on the host too, so the console's shadow CSS can use
       :host([...]) — :host-context() only works in Chrome/Edge, not Safari or Firefox. */
    ["data-theme","data-feel","data-layout"].forEach(function(a){
      var v = de.getAttribute(a);
      if(v === null){ if(h.hasAttribute(a)) h.removeAttribute(a); }
      else if(h.getAttribute(a) !== v) h.setAttribute(a, v);
    });
  });
}
function setDevice(v){
  if(DEVICE_MODES.indexOf(v) < 0) return;
  DEVICE_SETTING = v;
  try{ localStorage.setItem("tec_device", v); }catch(e){}
  applyDevice(); render();
  pushToast(v === "auto" ? "Screen: Automatic — " + (deviceMode() === "phone" ? "phone view" : "computer view") + " on this device" : v === "phone" ? "Screen: phone view on this device" : "Screen: computer view on this device");
}
