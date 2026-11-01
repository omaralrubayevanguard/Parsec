# Parsec 13 (fork B) — the Admin page: people and what each can do (roles with changes per person, pages and actions),
# temporary PINs for someone new or after a reset, sign-in turned off when someone leaves, the role table, the sign-in rules
# and the sign-in log. The page: b9/adm1.js (module ADMPG, page key "admin", classes adm-*), its styles b9/adm.css.
# Manager → Team (b9/mg1.js) goes through the same model. Runs inside build12.py after build_v130.py (and build_v130a.py):
# uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.
def rep_opt(js, a, b, why):
    # a spot another fork may have rewritten already: change it only if it's still there as it was
    if js.count(a) == 1: return js.replace(a, b)
    LOG.append("build_v130b: skipped (already changed elsewhere): " + why)
    return js

# ---- the page module, after the Inventory page's
js = rep(js, "\nfunction viewStock(){ return INVPG.view(); }\n", "\nfunction viewStock(){ return INVPG.view(); }\n" + b9("adm1.js") + "\n")
js = rep(js, '  else if(UI.view==="inventory") viewHtml = viewStock();   /* Parsec 12.5 */',
             '  else if(UI.view==="inventory") viewHtml = viewStock();   /* Parsec 12.5 */\n  else if(UI.view==="admin") viewHtml = viewAdmin();   /* Parsec 13 */')

# ---- the page list, the sidebar, the phone's More sheet; its icon: a shield
js = rep(js, '["parts","Parts"],["inventory","Inventory"],["career","Career"]];', '["parts","Parts"],["inventory","Inventory"],["career","Career"],["admin","Admin"]];')
js = rep(js, '"parts", "inventory", "warranty", "manager", "fixes"]]];', '"parts", "inventory", "warranty", "manager", "fixes", "admin"]]];')
js = rep(js, '"inventory", "warranty", "manager", "fixes", "report"]]];', '"inventory", "warranty", "manager", "fixes", "report", "admin"]]];')
js = rep(js, 'parts: "Parts", inventory: "Inventory", timelog: "Time Log",', 'parts: "Parts", inventory: "Inventory", admin: "Admin", timelog: "Time Log",')
js = rep(js, 'IV_NAV_IC.inventory = "inventory";',
         'IV_NAV_IC.admin = "admin"; IVI.admin = \'<path d="M12 3.5l7 2.75v5.25c0 4.5-3 7.75-7 9-4-1.25-7-4.5-7-9V6.25z"/><path d="M9 12l2.25 2.25L15.5 10"/>\';   /* Parsec 13: the Admin page */\nIV_NAV_IC.inventory = "inventory";')

# ---- the old staff editor and the "see Parsec as" picker go through the same model
js = rep(js, '      else if(ff === "role"){ sf.role = tx.value; sf.pages = {}; (STAFF_ROLES[sf.role] || []).forEach(function(pg){ sf.pages[pg] = true; }); }',
             '      else if(ff === "role"){ if(!permOk("a.people")) { UNDO.pop(); render(); return; } permSetRole(sf, tx.value); }   /* Parsec 13 */')
js = rep(js, '      else if(ff === "page"){ sf.pages = sf.pages || {}; sf.pages[tx.dataset.page] = !!tx.checked; }',
             '      else if(ff === "page"){ if(!permOk("a.people")) { UNDO.pop(); render(); return; } if(PERM_PAGES.some(function(p){ return p[0] === tx.dataset.page; })) permSet(sf, "pages", tx.dataset.page, !!tx.checked); }')
js = rep(js, '      else if(ff === "pin"){ sf.pin = String(tx.value || "").replace(/\\D/g, "").slice(0, 8); audit("staff", (sf.pin ? "Set" : "Cleared") + " the PIN for " + (sf.name || "an employee")); }',
             '      else if(ff === "pin"){ if(!permOk("a.people")) { UNDO.pop(); render(); return; } var npn = String(tx.value || "").replace(/\\D/g, ""); if(!pinValid(npn)){ UNDO.pop(); pushToast("A PIN is 4 digits."); render(); return; } pinSet(sf, npn, false); delete sf.pin; audit("pin", "Set the PIN for " + (sf.name || "an employee")); }')
js = rep(js, '      if(ff === "role") audit("staff", (sf.name || "An employee") + " is now " + sf.role);\n', '')
js = rep(js, '    if(vpin && vpin.pin){ UI.modal = { type: "pin", id: vpin.id }; render(); setTimeout(function(){ var pi = document.getElementById("pin-in"); if(pi) pi.focus(); }, 30); return; }',
             '    /* Parsec 13: the same way in as the login page — the PIN, and the person\'s pages */\n'
             '    { var vb = document.createElement("button"); vb.dataset.action = tx.value ? "viewas-set" : "viewas-reset"; if(tx.value) vb.dataset.id = tx.value; vb.hidden = true; document.body.appendChild(vb); vb.click(); vb.remove(); return; }')
# "PIN set" says what's there now (the sign-in pages may have rewritten these lines already)
js = rep_opt(js, 'pxKv("PIN", me.pin ? "set" : "none")', 'pxKv("PIN", pinIs(me) ? (me.pinTemp ? "temporary — you pick your own at your next sign-in" : "set") : "none yet")', "pxSecYou PIN")
js = rep_opt(js, "(me.pin ? 'Your PIN is set.' : 'You don’t have a PIN.') + ' A manager sets PINs under Manager → Staff.' : 'Set PINs under Manager → Staff.')",
                 "(pinIs(me) ? 'Your PIN is set.' : 'You don’t have a PIN yet.') + ' The Admin page resets PINs.' : 'Set people and PINs on the Admin page.')", "pxSecSign PIN note")

EXTRA_CSS.append(b9("adm.css"))
HOOK_NAMES += ["ADMPG", "viewAdmin", "admAddPerson", "admResetPin", "admSetOff", "admPinShow", "admLastIn"]
LOG.append("Parsec 13 (B): the Admin page — people, roles, sign-in rules, the sign-in log")
