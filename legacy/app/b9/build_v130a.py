# Parsec 13 (A) — the login page, the PIN pad, the quick switcher, stepping away, the end of the shop day.
# The pieces: b9/v130a.js (global) + b9/v130a.css. Runs inside build12.py after build_v130.py: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.
js = rep(js, "function pxSignInHtml(){", b9("v130a.js") + "\nfunction pxSignInHtml(){ return lgLoginHtml(); }   /* Parsec 13: the login page (b9/v130a.js) */\nfunction pxSignInHtmlOld(){")
EXTRA_CSS.append(b9("v130a.css"))

# after every redraw: the lock screen, if this computer is locked
js = rep(js, "  try{ lfDecorate(app); }catch(e){ console.error(e); }   /* Parsec 12.7: the lists fold (b9/v127f.js) */\n}",
             "  try{ lfDecorate(app); }catch(e){ console.error(e); }   /* Parsec 12.7: the lists fold (b9/v127f.js) */\n  try{ lgSync(); }catch(e){ console.error(e); }   /* Parsec 13: stepped away — the lock screen */\n}")

# the name tiles and the Admin link open the PIN pad — signing in, or switching from the page you're on
OLD_VIEWAS = r'''case "viewas-reset": { var apn = (STATE.shop && STATE.shop.adminPin) || ""; if(apn && (pxOut() || viewAsStaff())){ UI.modal = { type: "pin", id: "__admin" }; UI.profileOpen = false; render(); setTimeout(function(){ var pi = document.getElementById("pin-in"); if(pi) pi.focus(); }, 30); break; }
      try{ localStorage.removeItem("tec_viewas"); }catch(x){} pxSignedIn(); UI.profileOpen = false; UI.selectedRo = null; render(); break; }
    case "viewas-set": {
      var vsf = staffList().filter(function(x){ return x.id === t.dataset.id; })[0];
      if(vsf && vsf.pin && !(UI.modal && UI.modal.type === "pin-ok-" + vsf.id)){ UI.modal = { type: "pin", id: vsf.id }; UI.profileOpen = false; render(); setTimeout(function(){ var pi = document.getElementById("pin-in"); if(pi) pi.focus(); }, 30); break; }
      if(vsf){ try{ localStorage.setItem("tec_viewas", vsf.id); }catch(x){} pxSignedIn(); audit("signin", vsf.name + " signed in (" + vsf.role + ")"); UI.roShowAll = false; UI.selectedRo = null; UI.profileOpen = false; persistUI(); render(); pushToast("Signed in as " + vsf.name + " \u00b7 " + vsf.role); }
      break;
    }
'''
NEW_VIEWAS = '''case "viewas-reset": { if(!pxOut() && !viewAsStaff()) break; lgOpen("__admin", pxOut() ? "login" : "switch"); break; }   /* Parsec 13: the Admin PIN, on the pad */
    case "viewas-set": { lgOpen(t.dataset.id, pxOut() ? "login" : "switch"); break; }   /* Parsec 13: every sign-in asks for the PIN */
'''
js = rep(js, OLD_VIEWAS, NEW_VIEWAS)

# the quick switcher and Step away, off your name
js = rep(js, '''  if(staffN) h += '<div class="px-sep"></div>'
    + '<button class="px-mi" data-action="px-switch">' + pxI("swap", 15) + 'Switch user</button>'
    + '<button class="px-mi" data-action="px-logout">' + pxI("exit", 15) + 'Log out<span class="meta">' + (st !== "out" ? 'the clock keeps running' : '') + '</span></button>';''',
             '''  if(staffN) h += lgMeMenu(st);   /* Parsec 13: switch to someone, step away, log out */''')

# signing out and switching user end any lock
js = rep(js, 'pxLS("tec_out", "1"); pxLS("tec_viewas", null); pxLS("tec_signin_at", null);\n  UI.pxPop = null;',
             'pxLS("tec_out", "1"); pxLS("tec_viewas", null); pxLS("tec_signin_at", null); lockOff(); pxLS("tec_locked_at", null);   /* Parsec 13 */\n  UI.pxPop = null;')
js = rep(js, '    case "px-switch": { var rp = runningPunch(), os0 = openShift(); UI.pxPop = null;',
             '    case "px-switch": { var rp = runningPunch(), os0 = openShift(); UI.pxPop = null; lockOff(); pxLS("tec_locked_at", null); try{ var swh = viewAsStaff(); audit("signout", (swh ? swh.name : "Admin") + " — switch user"); }catch(e){}')

# your profile: the PIN as it is now
js = rep(js, 'pxKv("PIN", me.pin ? "set" : "none")', 'pxKv("PIN", pinIs(me) ? (me.pinTemp ? "temporary — you’ll pick your own at the next sign-in" : "set") : "none yet — you’ll pick one at the next sign-in")')
js = rep(js, "h += pxNote('Signing in picks whose pages you see — it isn’t a password. ' + (me ? (me.pin ? 'Your PIN is set.' : 'You don’t have a PIN.') + ' A manager sets PINs under Manager → Staff.' : 'Set PINs under Manager → Staff.'), \"lock\");",
             "h += pxNote('Everyone signs in with their own 4-digit PIN — kept scrambled, never as typed. ' + (me ? (pinIs(me) ? 'Your PIN is set.' : 'You’ll pick one at your next sign-in.') + ' Forgot it? The admin gives you a temporary one on the Admin page.' : 'PINs are reset on the Admin page.') + ' Step away with Ctrl L — your PIN brings you back.', \"lock\");")

HOOK_NAMES += ["lgOpen", "lgClose", "lgKey", "lgLockNow", "lgSync", "lgEodCheck", "lgIdleCheck", "lgSignIn", "lgLoginHtml", "lgState", "lgMeMenu", "fmCfg"]
LOG.append("Parsec 13 (A): the login page, the PIN pad, the quick switcher, stepping away, the end of the shop day")
