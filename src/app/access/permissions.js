/* Parsec · access · permissions.js
   Who can do what: roles, each person's pages and actions, can(action) / canPage(page), the Admin's changes per person (permSet) and the sync of pages when a role changes.
   Flow: every page asks can() before showing a button; access/guards.js refuses the function itself. Server seam: these are the rules a server would enforce.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   permHas permChanged permChangedN can canPage permSet permBack permRoleSet permSetRole permSyncPages permAdmins permAsk … (15 functions)
   state      staff
   uses       pages/rolist/ ro/ state/
*/
/* ---------- who can do what ---------- */
function permHas(sf, kind, k){
  if(!sf) return true;                                                   /* the Admin: everything */
  var o = sf.ov && sf.ov[kind] && Object.prototype.hasOwnProperty.call(sf.ov[kind], k) ? sf.ov[kind][k] : null;
  if(o !== null && o !== undefined) return !!o;
  var t = permRole(sf.role); return !!(t[kind] && t[kind][k]);
}
function permChanged(sf, kind, k){ return !!(sf && sf.ov && sf.ov[kind] && Object.prototype.hasOwnProperty.call(sf.ov[kind], k)); }
function permChangedN(sf){ return sf && sf.ov ? Object.keys(sf.ov.pages || {}).length + Object.keys(sf.ov.acts || {}).length : 0; }
function can(act){ var me = viewAsStaff(); if(!me) return true; if(me.off) return false; return permHas(me, "acts", act); }
function canPage(page){ var me = viewAsStaff(); if(!me) return true; if(page === "admin") return can("a.people"); return permHas(me, "pages", page); }
/* set one thing for one person — the same as the role clears the change */
function permSet(sf, kind, k, v){
  if(!sf) return;
  sf.ov = sf.ov || { pages: {}, acts: {} }; sf.ov[kind] = sf.ov[kind] || {};
  var t = permRole(sf.role); if(!!v === !!(t[kind] && t[kind][k])) delete sf.ov[kind][k]; else sf.ov[kind][k] = !!v;
  permSyncPages(sf);
  try{ audit("perm", sf.name + ": " + (kind === "pages" ? permPageLabel(k) + " page" : permActLabel(k)) + (v ? " — on" : " — off")); }catch(e){}
}
function permBack(sf){ if(!sf) return; sf.ov = { pages: {}, acts: {} }; permSyncPages(sf); try{ audit("perm", sf.name + " — back to the " + sf.role + " role"); }catch(e){} }
function permRoleSet(role, kind, k, v){
  var t = permRole(role); t[kind] = t[kind] || {}; t[kind][k] = !!v;
  /* a person whose change now matches the role has no change any more */
  (STATE.staff || []).forEach(function(sf){ if(sf.role === role && sf.ov && sf.ov[kind] && sf.ov[kind][k] === !!v) delete sf.ov[kind][k]; permSyncPages(sf); });
  try{ audit("perm", role + " role: " + (kind === "pages" ? permPageLabel(k) + " page" : permActLabel(k)) + (v ? " — on" : " — off")); }catch(e){}
}
function permSetRole(sf, role){ if(!sf || !role || sf.role === role) return; var was = sf.role; sf.role = role; permSyncPages(sf); try{ audit("staff", sf.name + " is now " + role + " (was " + was + ")"); }catch(e){} }
/* sf.pages stays the person's pages as they are now, for whatever still reads it */
function permSyncPages(sf){ if(!sf) return; sf.pages = sf.pages || {}; PERM_PAGES.forEach(function(p){ sf.pages[p[0]] = permHas(sf, "pages", p[0]); }); }
/* who to ask */
function permAdmins(){ return staffList().filter(function(sf){ return !sf.off && permHas(sf, "acts", "a.people"); }); }
function permAsk(){ var L = permAdmins().map(function(sf){ return String(sf.name || "").split(" ")[0]; }).filter(Boolean); return L.length ? (L.length > 2 ? L.slice(0, 2).join(", ") + " or the Admin" : L.join(" or ") + " or the Admin") : "the Admin"; }
function permDenyMsg(act){ return "You can’t " + (PERM_VERB[act] || permActLabel(act).toLowerCase()) + " — " + permAsk() + " can change that on the Admin page."; }
function permDeny(act){ try{ pushToast(permDenyMsg(act)); }catch(e){} return false; }
/* the guard: true when allowed; otherwise says why and returns false */
function permOk(act){ return can(act) ? true : permDeny(act); }
