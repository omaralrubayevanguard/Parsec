# Parsec 16.2 (C) — one Settings page for everything (b9/v162c.js + v162c.css): a registry of every setting from the nine
# places they lived, grouped by who it's for, a menu down the side, search with a jump and a 2 s highlight, who + where on
# every row, changed dots with Reset (one or a whole group), Recently changed with Undo (STATE.setLog), read-only rows for
# anyone without the permission. The old places become a short link into the matching group.
# Runs inside build12.py after the 16.2 A and B patches: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.
def _between(js, a, b, new, from_=0):   # replace js[a .. b+len(b)) — both found once, in order
    i = js.index(a, from_); j = js.index(b, i) + len(b)
    assert js.count(a) == 1, (a[:80], js.count(a))
    return js[:i] + new + js[j:]
def _soft(js, a, b, what):              # a line another 16.2 fork may also have touched: change it only when it is as it was
    if js.count(a) == 1: return js.replace(a, b)
    LOG.append("Parsec 16.2 (C): left as the other fork has it — " + what); return js

# ---- the page: the registry and the new page take the old page's place (the old one is cut by the clean-out)
js = rep(js, "function pxProfileView(){", b9("v162c.js") + "\nfunction pxProfileView0(){")
js = rep(js, "function pxAct(a, t, e){\n  switch(a){", "function pxAct(a, t, e){\n  if(a.indexOf(\"px-sg-\") === 0) return sgAct(a, t, e);\n  switch(a){")
js = rep(js, 'UI.pxSec = t.dataset.s || "you"; UI.pxPop = null;', 'UI.pxSec = sgSec(t.dataset.s || "me"); UI.sgQ = ""; UI.sgArm = null; if(t.dataset.person) UI.sgPerson = t.dataset.person; UI.pxPop = null;')

# ---- the person pop-over keeps Size, Tooltips, Theme + All settings…
js = rep(js, """'<div class="pxp-set"><span>Size</span>' + pxSeg([["normal", "Normal"], ["large", "Large"], ["floor", "Shop floor"]], sizeMode(), "set-size", "data-size") + '</div>' + ptipMenuRow()""",
             """sgSizeRow() + ptipMenuRow() + sgThemeRow()""")
js = _between(js, """    + '<button class="px-mi" data-action="px-profile" data-s="look">' + pxI("gear", 15) + 'Settings<span class="meta">all of them</span></button>'""",
              """'Keyboard shortcuts<span class="meta">' + pxKbd("?") + '</span></button>';""",
              """    + '<button class="px-mi" data-action="px-profile" data-s="me">' + pxI("gear", 15) + 'All settings…<span class="meta' + (warn ? ' wt' : '') + '">' + (warn ? '<i></i>' + esc(pxBkShort()) : 'everything, in one place') + '</span></button>';""")

# ---- the app menu (the old header): a way into Settings, no settings of its own
js = rep(js, "function settingsHtml(){", """function settingsHtml(){   /* Parsec 16.2: the settings that were here are in Settings */
  return '<div class="pnav-set'+(UI.appMenu?' open':'')+'" data-key="app-menu">'
    + '<button class="pnav-set-btn" data-action="toggle-app-menu" aria-haspopup="menu" aria-expanded="'+(UI.appMenu?'true':'false')+'" title="Settings" aria-label="Settings">' + sfIcon(SF.gear, 19)
    +   (function(){ var L = storageLabel(); return '<span class="sync-dot gear-dot '+L.dot+'" id="gear-sync" title="'+esc(L.head)+'"></span>'; })() + '</button>'
    + '<div class="pnav-set-pop" role="menu" aria-label="Settings">'
    +   '<button class="app-menu-item" role="menuitem" data-action="px-profile" data-s="me"><span class="ami-ico">' + pxI("settings", 17) + '</span>All settings…<span class="ami-end">size, theme, data</span></button>'
    +   (navAllowed("ros") ? '<button class="app-menu-item ami-new" role="menuitem" data-action="open-add-ro"><span class="ami-ico">' + sfIcon(SF.plus, 17) + '</span>New repair order<span class="ami-end">N</span></button>' : '')
    +   sgLinkHtml("me", "me.size", "Size, theme, the day ribbon, view as, automations and shortcuts")
    + '</div></div>';
}
function settingsHtml0(){""")

# ---- Automations: Settings › Automations is where the panel lives now
js = _soft(js, 'case "open-automations": UI.appMenu = false; UI.modal = { type:"automations", edit: null }; render(); break;',
               'case "open-automations": UI.appMenu = false; sgOpen("auto"); break;   /* Parsec 16.2: Settings › Automations */', "open-automations")

# ---- Manager → Shop settings, and its Stage rules card
js = rep(js, "if(p.type==='set'){ const S=PG.shop(), PP=S.payPer,",
             "if(p.type==='set') return `<div class=\"tg-pop xf mq-pop-w\">${hd('Shop settings','')}${sgLinkHtml('shop','shop.rate','The labor rate, the pay period and the overhead')}${sgLinkHtml('people','people.adminPin','The Admin PIN')}${sgLinkHtml('data','data.folder','The data folder')}</div>`;   /* Parsec 16.2 */\n  if(p.type==='set0'){ const S=PG.shop(), PP=S.payPer,")
js = rep(js, "<button class=\"btn btn-sm\" data-a=\"pop\" data-p=\"set\">${ic('gear',14)}Overhead in Settings</button>",
             "<button class=\"btn btn-sm\" data-action=\"px-sg-go\" data-id=\"shop.ovh\">${ic('gear',14)}Overhead in Settings</button>")
js = _between(js, '<div class="mq-card"><div class="mq-ch"><b>Stage rules</b>', 'within 15 min</label></div>',
              '<div class="mq-card"><div class="mq-ch"><b>Stage rules</b><small>when a stage is done, where the RO goes</small></div><div class="mq-cb">${sgLinkHtml(\'shop\',\'shop.rules\',\'Stage rules, hold goals and accepting hand-offs\')}</div>')

# ---- Parts setup
js = rep(js, "  function vSetup(){\n", "  function vSetup(){\n    return `<div class=\"pq-full pg-scroll\"><div class=\"pq-fh\"><h2>Parts setup</h2><span class=\"sp\"></span><button class=\"btn btn-sm\" data-a=\"view\" data-v=\"desk\">Done</button></div>${sgLinkHtml('shop','shop.pt.sup_pdc','Suppliers, deliveries, bins and shelves, returns and the hand-off rules')}</div>`;   /* Parsec 16.2 */\n")

# ---- Foreman settings
js = rep(js, 'else if(P.type === "cfg"){ var c = fmCfg(), hrs3 = [];',
             'else if(P.type === "cfg"){ h = pop("xf fm-cfg", fmPh("Foreman settings", null, "") + sgLinkHtml("shop", "shop.dayStart", "The shop day, QC before release, the badge and bay types") + \'<div class="tg-acts"><span class="hint"></span><button class="btn btn-sm btn-primary" data-action="fm-pop-x">Done</button></div>\'); }   /* Parsec 16.2 */\n  else if(P.type === "cfg0"){ var c = fmCfg(), hrs3 = [];')
js = rep(js, "' · change it in Foreman settings'", "' · change it in Settings › The shop'")

# ---- Warranty settings and coverage terms
js = rep(js, 'if(P.type === "cfg"){ var Cg = waCfg(),',
             'if(P.type === "cfg") return pop("xf wa-cfgp", waPh("Warranty settings", null, "") + sgLinkHtml("shop", "shop.wa.file", "Deadlines, the packet, coverage terms, shelves and chase-after times") + \'<div class="tg-acts"><span class="hint"></span><button class="btn btn-sm btn-primary" data-action="wa-pop-x">Done</button></div>\');   /* Parsec 16.2 */\n  if(P.type === "cfg0"){ var Cg = waCfg(),')
js = rep(js, 'if(P.type === "terms"){ var Ct = waCfg().cov;',
             'if(P.type === "terms") return pop("xf wa-cfgp", waPh("Coverage terms", null, "") + sgLinkHtml("shop", "shop.waCov", "Coverage terms") + \'<div class="tg-acts"><span class="hint"></span><button class="btn btn-sm btn-primary" data-action="wa-pop-x">Done</button></div>\');   /* Parsec 16.2 */\n  if(P.type === "terms0"){ var Ct = waCfg().cov;')
js = rep(js, '<button class="tg-link" data-action="wa-terms">Edit coverage terms</button>', '<button class="tg-link" data-action="px-sg-go" data-id="shop.waCov">Coverage terms are in Settings</button>')

# ---- Triage: Edit templates
js = rep(js, '<button class="tg-link" data-action="tg-tpled">Edit…</button>', '<button class="tg-link" data-action="px-sg-go" data-id="shop.tpl">Edit in Settings…</button>')
js = rep(js, 'title="Set it in Edit templates"', 'title="Set it in Settings › The shop"')

# ---- Admin: roles, sign-in rules, the Admin PIN, and each person's role, pages and actions are in Settings › People & access
js = rep(js, "  function vRoles(){\n", "  function vRoles(){\n    return `<div class=\"adm-full\">${sgLinkHtml('people', 'people.roles', 'What each role can do')}</div>`;   /* Parsec 16.2 */\n")
js = rep(js, "  function vRules(){\n", "  function vRules(){\n    return `<div class=\"adm-full\">${sgLinkHtml('people', 'people.idle', 'The sign-in rules — locking when nobody’s touched it, signing everyone out at the end of the day')}</div>`;   /* Parsec 16.2 */\n")
js = _between(js, "    h += `<div class=\"adm-card\"><h5>${ic('lock')}Admin PIN</h5>", "<p class=\"adm-mu\" style=\"margin:8px 0 0\">Only the Admin changes the Admin PIN.</p>`) + `</div>`;\n",
              "    h += `<div class=\"adm-card\"><h5>${ic('lock')}Admin PIN</h5>${sgLinkHtml('people', 'people.adminPin', 'The Admin PIN')}</div>`;   /* Parsec 16.2 */\n")
_ap = js.index("function personPane(sf){")
js = _between(js, '<span>Role</span><span><select class="adm-sel" data-ch="role"', "</select></span>",
              '<span>Role</span><span>${esc(sf.role)}</span>', _ap)
js = _between(js, "    /* pages */\n", "    h += `<div class=\"adm-foot\">",
              "    h += `<div class=\"adm-card\">${sgLinkHtml('people', 'people.each', 'Role, pages and what ' + f + ' can do', sf.id)}</div>`;   /* Parsec 16.2 */\n    h += `<div class=\"adm-foot\">", _ap)
js = _between(js, "${n && !lock ? `<button class=\"btn btn-sm\" data-a=\"back\"", "role</button>` : ''}", "", _ap)

EXTRA_CSS.append(b9("v162c.css"))
HOOK_NAMES += ["SG_REG", "SG_BY", "SG_GROUPS", "sgReg", "sgChange", "sgSet", "sgOp", "sgReset", "sgResetGroup", "sgUndo", "sgFind", "sgOpen", "sgGo", "sgCan", "sgWho", "sgOnly",
               "sgChanged", "sgText", "sgVal", "sgDef", "sgLog", "sgShown", "sgAutoPage", "sgLinkHtml", "sgQSet", "laborRate", "ptipMode", "ptipSetMode", "permHas", "permSet", "permRole",
               "permRoleDefault", "permState", "fmCfg", "waCfg", "rtCfg", "autoCfg", "tgTpls", "tgShop", "adminPinIs", "sizeMode", "dayRibbonOn", "pxMePop"]
import re as _re
LOG.append("Parsec 16.2 (C): one Settings page — %d rows in the registry, the old places link in" % len(_re.findall(r'\{ id: "[\w.]+",|sgWaNum\("|sgPtRow\("', b9("v162c.js"))))
