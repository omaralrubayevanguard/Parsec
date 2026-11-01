# Parsec 13 (core) — people and permissions: roles with changes per person, pages and actions, scrambled 4-digit PINs.
# The model and its helpers: b9/v130.js (global). The login page (build_v130a.py), the Admin page (build_v130b.py) and the
# guards across the pages (build_v130c.py) are built on it. Runs inside build12.py after build_v129.py: uses js, rep, b9, HOOK_NAMES, LOG.
js = rep(js, "function staffList(){ if(!Array.isArray(STATE.staff)) STATE.staff = [];", b9("v130.js") + "\nfunction staffList(){ if(!Array.isArray(STATE.staff)) STATE.staff = [];")
# every person gets their role's template and their own changes; old plain PINs are scrambled — once
js = rep(js, "  return STATE.staff; }\nfunction viewAsId(){",
             "  if(!STATE.perm || STATE.staff.some(function(s){ return s && (!s.ov || \"pin\" in s); }) || (STATE.shop && STATE.shop.adminPin)) permMigrate();   /* Parsec 13 */\n  return STATE.staff; }\nfunction viewAsId(){")
# the pages a person can open: their role's, with their own changes
js = rep(js, '  if(page === "tech"){ var s0 = viewAsStaff(); return s0 ? s0.role === "Technician" : true; }',
             '  if(page === "admin") return can("a.people");   /* Parsec 13: the Admin page — anyone given “Manage people and PINs” */\n'
             '  if(page === "tech"){ var s0 = viewAsStaff(); return s0 ? permHas(s0, "pages", "tech") : true; }')
js = rep(js, '  return !!(s.pages && s.pages[page]);\n}\nfunction navPages(){', '  return permHas(s, "pages", page);\n}\nfunction navPages(){')
HOOK_NAMES += ["can", "canPage", "permHas", "permSet", "permBack", "permRoleSet", "permRole", "permState", "permMigrate", "permChanged", "permChangedN", "permSetRole",
               "permOk", "permDeny", "permDenyMsg", "pinSet", "pinOk", "pinIs", "pinClear", "pinTempNew", "pinFail", "pinFailClear", "pinWaitMs", "pinTriesLeft",
               "adminPinSet", "adminPinOk", "adminPinIs", "recentList", "recentPush", "recentStaff", "lockIs", "lockOn", "lockOff", "permRules", "sha256hex",
               "staffList", "viewAsStaff", "navAllowed", "navPages", "pxLogout", "pxSignedIn", "audit", "auditLog"]
LOG.append("Parsec 13 (core): roles with changes per person, pages and actions, scrambled PINs")
