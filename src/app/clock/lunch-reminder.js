/* Parsec · clock · lunch-reminder.js
   The lunch reminder (14.7 C): a corner card at lunch time; nothing is clocked out by itself.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   v147LunState v147HM v147LunHtml v147Host v147Tick v147Soon (6 functions)
   uses       access/ data/ pages/ pages/technician/ ro/
   at load    a timer
*/
/* ---------- the lunch reminder ---------- */
function v147LunState(){
  var t = null; try{ var m = PG.me(); t = m && m.tech ? m.tech : null; }catch(e){} if(!t) return null;
  var me = ""; try{ me = String(pcMe() || t); }catch(e){ me = t; }
  try{ if(openShiftOf(me)) return null; }catch(e){ return null; }
  var L = []; try{ L = shiftsOfPerson(todayStr(), me); }catch(e){} var s = L[L.length - 1];
  if(!s || !s.out || s.outReason !== "Lunch" || !s.backBy) return null;
  var now = Date.now(), back = +new Date(s.backBy); if(now < back || now < (V147C.snz[s.id] || 0)) return null;
  return { t: t, me: me, sh: s, out: +new Date(s.out), back: back };
}
function v147HM(ms){ var d = new Date(ms); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
function v147LunHtml(N){
  var nm = ""; try{ nm = PG.first(N.t); }catch(e){ nm = String(N.t).split(" ")[0]; }
  var e = function(x){ return String(x).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  return '<div class="v146-card v147-lun" role="status" aria-live="polite"><b>Lunch is over, ' + e(nm) + '</b><small>You clocked out at ' + v147HM(N.out) + ' · back by ' + v147HM(N.back) + '</small><div class="r">'
    + '<button type="button" class="v146-b pri" data-v147="in">Clock in now</button><button type="button" class="v146-b" data-v147="snz">5 more minutes</button></div></div>';
}
function v147Host(){
  if(V147C.el && document.body.contains(V147C.el)) return V147C.el;
  var w = document.createElement("div"); w.id = "v147"; w.className = "v146 v147"; w.hidden = true;
  w.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-v147]"); if(!b) return;
    var k = b.getAttribute("data-v147"), N = v147LunState();
    if(k === "in"){ try{ shiftClockIn(); }catch(e){} }
    else if(k === "snz" && N){ V147C.snz[N.sh.id] = Date.now() + 5 * 60000; try{ pushToast("OK — it reminds you again at " + v147HM(V147C.snz[N.sh.id]) + "."); }catch(e){} }
    v147Tick();
  });
  document.body.appendChild(w); V147C.el = w; return w;
}
function v147Tick(){
  var h = "";
  try{ var out = false; try{ out = typeof pxOut === "function" && pxOut(); }catch(e){} if(!out){ var N = v147LunState(); if(N) h = v147LunHtml(N); } }catch(e){ h = ""; }
  if(!h && !V147C.el) return;
  var w = v147Host();
  var o = typeof V146 !== "undefined" && V146.el && !V146.el.hidden && V146.el.offsetHeight ? V146.el.offsetHeight + 24 : 16;   /* above 14.6's cards if they show too */
  w.style.bottom = h && o > 16 ? o + "px" : "";
  if(w.getAttribute("data-h") === h) return;
  w.setAttribute("data-h", h); w.innerHTML = h; w.hidden = !h;
}
function v147Soon(){ clearTimeout(V147C.t); V147C.t = setTimeout(v147Tick, 0); }
setInterval(function(){ try{ v147Tick(); }catch(e){} }, 30000);
