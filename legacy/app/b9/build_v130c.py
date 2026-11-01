# Parsec 13 (C) — the actions hold across the pages: each guarded thing checks can(act) where it happens.
# The guards on the shared functions, the refused clicks and the hidden buttons: b9/v130c.js + b9/v130c.css (global).
# The RO page's own code (inside JC) and a few base menus are patched here; the pages' modules (rop1, rl1, tl2, tl3, tc1, cx4,
# tx1, pt5, inv1, …) carry their own guards in their files. Runs inside build12.py after build_v130.py: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.
js = rep(js, "function setRoStatus(roId, status, sub, force){", b9("v130c.js") + "\nfunction setRoStatus(roId, status, sub, force){")
EXTRA_CSS.append(b9("v130c.css"))

# ---- the RO page (inside JC): starting the clock, deleting the RO, the part status, the money
js = rep(js, "  } else {\n    var lk = opPartLock(job);\n    if (lk) { toast('Can\\u2019t start repairing",
             "  } else {\n    if (!permOk('t.own') || !permReopenOk(RO)) return;   /* Parsec 13 */\n    var lk = opPartLock(job);\n    if (lk) { toast('Can\\u2019t start repairing")
js = rep(js, "function confirmDeleteRO() {\n  var ro = RO; if (!ro) return;", "function confirmDeleteRO() {\n  var ro = RO; if (!ro) return; if (!permOk('ro.del')) return;   /* Parsec 13 */")
js = rep(js, "function pxDelete() {\n  var ro = RO,", "function pxDelete() {\n  if (!permOk('ro.del')) return;   /* Parsec 13 */\n  var ro = RO,")
js = rep(js, "    '-',\n    { icon: MENU_ICONS.trash, label: 'Delete RO', danger: true, run: confirmDeleteRO }\n  ], key,",
             "  ].concat(can('ro.del') ? ['-', { icon: MENU_ICONS.trash, label: 'Delete RO', danger: true, run: confirmDeleteRO }] : []), key,")
js = rep(js, "          pxSep(),\n          pxMenuItem('trash', 'Delete RO', { danger: true, run: pxDelete })]), { alignRigh",
             "          ].concat(can('ro.del') ? [pxSep(), pxMenuItem('trash', 'Delete RO', { danger: true, run: pxDelete })] : [])), { alignRigh")
js = rep(js, "function usd(n) { n = num(n); return (n < 0 ? '-$' : '$')", "function usd(n) { if (!permCost()) return '\\u2014'; n = num(n); return (n < 0 ? '-$' : '$')")
js = rep(js, "function setPartStatus(job, p, st) {\n  if (p.status === st) return;",
             "function setPartStatus(job, p, st) {\n  if (p.status === st) return;\n  if ((st === 'Ordered' || st === 'Backordered') && !permOk('p.order')) return;   /* Parsec 13 */")
js = rep(js, "        e.stopPropagation(); closeMenus();\n        deletePunch(p.id); save(true); render(); tecRender();",
             "        e.stopPropagation(); closeMenus();\n        if (deletePunch(p.id) === false) return; save(true); render(); tecRender();")
# ---- the RO List's row menu: Delete RO only for those who may
js = rep(js, ', "-", ["delete", "Delete RO"]];', '].concat(typeof can !== "function" || can("ro.del") ? ["-", ["delete", "Delete RO"]] : []);')

HOOK_NAMES += ["deletePunch", "updatePunchReasons", "money", "permCost", "permPunchAct", "permReopenOk", "permRoStatusAct", "permRootSync", "permClickAct", "permRoDone"]
LOG.append("Parsec 13 (C): the actions hold across the pages")
