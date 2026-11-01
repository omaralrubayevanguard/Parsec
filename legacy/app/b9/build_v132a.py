# Parsec 14 (fork A) — the Assets page: every truck anyone in the shop has worked on, one per VIN, with its history — every visit,
# repeat repairs (the same system or part back within 90 days), lifetime totals, miles and engine hours over time.
# The page: b9/as1.js (module ASPG, page key "assets", classes ast-*), its styles b9/as.css. Runs inside build12.py after the
# other patch files: uses js, rep, b9, IC, EXTRA_CSS, HOOK_NAMES, LOG.
import json as _json
def _rep_opt(js, a, b, why):
    if js.count(a) == 1: return js.replace(a, b)
    LOG.append("build_v132a: skipped (changed elsewhere): " + why)
    return js

_AS_IC = {k: IC[k] for k in ["truck", "flag", "gauge", "engine", "history", "chevL", "chevR"] if k in IC}
_as = b9("as1.js").replace("/*__AS_IC__*/{}", _json.dumps(_AS_IC, ensure_ascii=False), 1)
assert "__AS_IC__" not in _as
# ---- the page module, beside the Inventory and Admin pages
js = rep(js, "\nfunction viewStock(){ return INVPG.view(); }\n", "\nfunction viewStock(){ return INVPG.view(); }\n" + _as + "\n")
js = rep(js, '  else if(UI.view==="admin") viewHtml = viewAdmin();   /* Parsec 13 */',
             '  else if(UI.view==="admin") viewHtml = viewAdmin();   /* Parsec 13 */\n  else if(UI.view==="assets") viewHtml = viewAssets();   /* Parsec 14 */')
# ---- the page list, the sidebar and the phone's More sheet (after the RO List); its icon: a truck
js = rep(js, '["triage","Triage"],["rolist","RO List"],["timelog","Time Log"]', '["triage","Triage"],["rolist","RO List"],["assets","Assets"],["timelog","Time Log"]')
js = rep(js, '["career", "timelog", "rolist", "ros", "tech",', '["career", "timelog", "rolist", "assets", "ros", "tech",', 2)
js = rep(js, 'inventory: "Inventory", admin: "Admin",', 'inventory: "Inventory", assets: "Assets", admin: "Admin",')
js = rep(js, 'IV_NAV_IC.inventory = "inventory";', 'IV_NAV_IC.assets = "assets"; IVI.assets = ' + _json.dumps(IC["truck"]) + ';   /* Parsec 14: the Assets page */\nIV_NAV_IC.inventory = "inventory";')
# ---- a page in the permissions: on for every role (the Admin page lists it; anyone can be turned off)
js = rep(js, 'var PERM_PAGES = [["ros", "Repair Orders"], ["tech", "Technician"],', 'var PERM_PAGES = [["ros", "Repair Orders"], ["assets", "Assets"], ["tech", "Technician"],')
js = rep(js, "var pg = {}, ac = {}, L = STAFF_ROLES[role] || [],", "var pg = {}, ac = {}, L = (STAFF_ROLES[role] || []).concat([\"assets\"]),   /* Parsec 14: every role opens the Assets page */")
# a shop file from before Parsec 13 keeps its people's pages as they were — and gets the new page from the role
js = rep(js, 'if(sf.pages) PERM_PAGES.forEach(function(p){ var k = p[0], had = !!sf.pages[k];', 'if(sf.pages) PERM_PAGES.forEach(function(p){ var k = p[0], had = !!sf.pages[k]; if(k === "assets" && !(k in sf.pages)) return;')
# ---- the sample: some of each customer's earlier visits are the trucks the shop already knows
js = rep(js, "  STATE.ros = STATE.ros.concat(ros);\n  STATE.punches = STATE.punches.concat(punches);\n  STATE.shifts = shiftList().concat(shifts);",
             "  try{ asSampleFleet(ros); }catch(e){ console.error(e); }   /* Parsec 14 */\n  STATE.ros = STATE.ros.concat(ros);\n  STATE.punches = STATE.punches.concat(punches);\n  STATE.shifts = shiftList().concat(shifts);", 2)   # the old copy in the base file and hist.js — whichever runs
# ---- the RO page's Truck history opens the truck on the Assets page
js = _rep_opt(js, "  return ropSec('history', 'Truck history', L.length ? (unit ? 'Unit ' + unit + ' · ' : '') + L.length + ' visit' + (L.length === 1 ? '' : 's') : '', body);",
              "  var asGo = typeof navAllowed === 'function' && navAllowed('assets') ? el('button', { class: 'px-btn px-btn--ghost px-btn--sm rop-go', type: 'button', title: 'Every visit, repeat repairs, miles and hours — on the Assets page', html: pxI('history', 14) + 'Open in Assets', onClick: function (e) { e.stopPropagation(); asOpenFor(RO); } }) : null;   /* Parsec 14 */\n"
              "  return ropSec('history', 'Truck history', L.length ? (unit ? 'Unit ' + unit + ' · ' : '') + L.length + ' visit' + (L.length === 1 ? '' : 's') : '', body, asGo);", "RO page Truck history → Assets")

EXTRA_CSS.append(b9("as.css"))
HOOK_NAMES += ["ASPG", "viewAssets", "asTrucks", "asSampleFleet", "asOpenFor"]
LOG.append("Parsec 14 (A): the Assets page — every truck, one per VIN, with its history")
