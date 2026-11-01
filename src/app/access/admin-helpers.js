/* Parsec · access · admin-helpers.js
   Admin's shared actions (also used by Manager → Team): add a person, reset a PIN, turn sign-in off, show a temporary PIN once.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   admAddPerson admResetPin admSetOff admLastIn admFirst admPinShow (6 functions)
   uses       data/
*/
/* ============================== Admin (Parsec 13) ==============================
   People and what each of them can do. Roles with changes per person: a person gets their role's pages and actions, and any of
   them can be changed for that person alone (a dot marks it; “Back to the role” clears it). A 4-digit PIN for everyone, kept
   scrambled: someone new, or a reset, gets a temporary PIN shown once — they pick their own at their next sign-in. When someone
   leaves, their sign-in is turned off and their history stays. Plus the role table, the sign-in rules and the sign-in log.
   Opens for anyone given “Manage people and PINs” — and the Admin. The model is b9/v130.js. */
/* ---------- shared with Manager → Team: add a person, reset a PIN, turn sign-in off, show a temporary PIN once ---------- */
function admAddPerson(name, role){
  var sf = { id: uid("st"), name: name, role: role, pages: {}, ov: { pages: {}, acts: {} }, p11: 1, p125: 1 };
  var pin = pinTempNew(); pinSet(sf, pin, true); permSyncPages(sf);
  staffList().push(sf);
  try{ audit("staff", name + " added as " + role + " — with a temporary PIN"); }catch(e){}
  return { sf: sf, pin: pin };
}
function admResetPin(sf){ var pin = pinTempNew(); pinSet(sf, pin, true); pinFailClear(sf.id); try{ audit("pin", "Reset " + sf.name + "’s PIN — a temporary one"); }catch(e){} return pin; }
function admSetOff(sf, off){
  if(!sf) return;
  if(off){ sf.off = true; sf.offAt = nowIso(); try{ audit("staff", sf.name + " — sign-in turned off (history kept)"); }catch(e){} }
  else { delete sf.off; delete sf.offAt; try{ audit("staff", sf.name + " — sign-in turned back on"); }catch(e){} }
}
function admLastIn(sf){
  var L = auditLog(); for(var i = L.length - 1; i >= 0; i--){ var a = L[i]; if((a.type === "signin" || a.type === "switch" || a.type === "unlock") && sf && sf.name && String(a.text || "").indexOf(sf.name) === 0) return a.at; }
  return null;
}
function admFirst(n){ return String(n || "").trim().split(/\s+/)[0] || ""; }
/* the temporary PIN, shown once — it isn't kept anywhere as typed */
function admPinShow(sf, pin, isNew){
  var old = document.querySelector(".admpin"); if(old) old.remove();
  var f = admFirst(sf.name), E = function(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var w = document.createElement("div"); w.className = "admpin"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-label", "Temporary PIN for " + sf.name);
  w.innerHTML = '<div class="admpin-c"><b class="admpin-h">' + (isNew ? E(sf.name) + " is on the team" : "A new PIN for " + E(f)) + '</b><p>Tell ' + E(f) + ' this temporary PIN. ' + E(f) + ' picks their own at their first sign-in.</p>'
    + '<div class="admpin-d" aria-label="Temporary PIN ' + E(pin.split("").join(" ")) + '">' + pin.split("").map(function(d){ return "<span>" + d + "</span>"; }).join("") + '</div>'
    + '<small>Parsec shows it this once — it’s kept scrambled, never as typed.</small><div class="admpin-a"><button type="button" class="admpin-b" data-admpin="copy">Copy</button><button type="button" class="admpin-b pri" data-admpin="ok">Done</button></div></div>';
  var close = function(){ w.remove(); document.removeEventListener("keydown", key, true); };
  var key = function(e){ if(e.key === "Escape" || e.key === "Enter"){ e.preventDefault(); e.stopPropagation(); close(); } };
  w.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest("[data-admpin]");
    if(!b){ if(e.target === w) close(); return; }
    if(b.getAttribute("data-admpin") === "copy"){ var tx = sf.name + " — temporary PIN " + pin; try{ navigator.clipboard.writeText(tx).then(function(){ b.textContent = "Copied"; }, function(){}); }catch(er){} return; }
    close(); });
  document.body.appendChild(w); document.addEventListener("keydown", key, true);
  var ok = w.querySelector(".admpin-b.pri"); if(ok) try{ ok.focus({ preventScroll: true }); }catch(e){}
}
