# Parsec 16.3 (C) — New RO reads the contact (name, phone, email) and the driver (name, phone); no contact read → it suggests the
# last one used for that customer (Use fills it); Shop buttons by department (STATE.shopBtns, Settings › The shop, the manager) on
# the truck card (under the department), the Foreman and Parts headers, and v163ShopOk for the ⋯ on RO cards. b9/v163c.js + v163c.css.
# Runs inside build12.py after the 16.2 patches (needs v162c's SG_REG): uses js, rep, b9, EXTRA_CSS, KEEP_EXTRA, HOOK_NAMES, LOG.
def _soft163c(js, a, b, what):   # a line another 16.3 fork may also have touched: change it only when it is as it was
    if js.count(a) == 1: return js.replace(a, b)
    LOG.append("Parsec 16.3 (C): left as it is — " + what + " (found %d times)" % js.count(a)); return js

# ---- the code: after the Settings registry (it adds its row to SG_REG)
js = rep(js, "function sgReg(){ return SG_REG; }", "function sgReg(){ return SG_REG; }\n" + b9("v163c.js"))

# ---- New RO (IMPX): read the contact and the driver, show them in Case & customer, suggest the last contact
js = rep(js, "var f = readLoose(text, L, readFields(L));",
             "var f = readLoose(text, L, readFields(L));\n    try{ if(typeof v163ReadContact === \"function\") v163ReadContact(text, L, f); }catch(e){ console.error(e); }   /* Parsec 16.3: the contact and the driver */")
js = rep(js, 'if(f.caseNo || f.roNumber || f.customer || f.status || f.etr) found.push("case");',
             'if(f.caseNo || f.roNumber || f.customer || f.status || f.etr || f.cname || f.cphone || f.cemail || f.dname || f.dphone) found.push("case");')
js = rep(js, '["techSupportCase", "Tech support case", G_CASE, "ts"], ["shopSupplies", "Shop supplies & fees", G_CASE, "supplies", { num: 1, money: 1 }],',
             '["techSupportCase", "Tech support case", G_CASE, "ts"], ["shopSupplies", "Shop supplies & fees", G_CASE, "supplies", { num: 1, money: 1 }],\n'
             '    ["contactName", "Contact", G_CASE, "cname"], ["contactPhone", "Phone", G_CASE, "cphone"], ["contactEmail", "Email", G_CASE, "cemail"], ["driverName", "Driver", G_CASE, "dname"], ["driverPhone", "Driver’s phone", G_CASE, "dphone"],   /* Parsec 16.3 */')
js = rep(js, 'var groups = {}; Pl.rows.forEach(function(r){ (groups[r.s[2]] = groups[r.s[2]] || []).push(r); });',
             'var groups = {}; Pl.rows.forEach(function(r){ (groups[r.s[2]] = groups[r.s[2]] || []).push(r); });\n    D.v163f = {}; Pl.rows.forEach(function(r){ D.v163f[r.k] = r.fin; });   /* Parsec 16.3: for the last-contact suggestion */')
js = rep(js, 'function frow(r){\n    var s = r.s, sm = "";',
             'function frow(r){ var x = ""; if(r.s[0] === "contactPhone" && typeof v163SugHtml === "function") try{ x = v163SugHtml(D); }catch(e){ console.error(e); } return frow0(r) + x; }   /* Parsec 16.3 */\n  function frow0(r){\n    var s = r.s, sm = "";')
js = rep(js, 'else if(a === "use"){ var k = t.getAttribute("data-k")',
             'else if(a === "v163use"){ var lc = typeof v163LastFill === "function" ? v163LastFill(t.getAttribute("data-ro")) : null; if(lc){ Object.keys(lc).forEach(function(k){ D.edits[k] = lc[k]; }); D.err = ""; draw(); } }   /* Parsec 16.3: the last contact */\n      else if(a === "use"){ var k = t.getAttribute("data-k")')

# ---- the RO's details table (ROFLD): Email, Driver, Driver's phone; phones written (336) 555-0142
_ph = 'set: function(ro, v){ v = roFldTrim(v); var p = typeof v163Phone === "function" ? v163Phone(v) : ""; if(p || v) ro.%s = p || v; else delete ro.%s; }'
js = rep(js, '["contactPhone", "Phone", { empty: "Add a number", type: "tel" }]]],',
             '["contactPhone", "Phone", { empty: "Add a number", type: "tel", ' + (_ph % ("contactPhone", "contactPhone")) + ' }],\n'
             '    ["contactEmail", "Email", { empty: "Add an email", type: "email", set: function(ro, v){ v = roFldTrim(v); var e = typeof v163Email === "function" ? v163Email(v) : ""; if(e || v) ro.contactEmail = e || v; else delete ro.contactEmail; }, warn: function(v){ v = roFldTrim(v); return v && !/@/.test(v) ? "An email has an @" : ""; } }],\n'
             '    ["driverName", "Driver", { empty: "Add the driver" }],\n'
             '    ["driverPhone", "Driver’s phone", { empty: "Add a number", type: "tel", ' + (_ph % ("driverPhone", "driverPhone")) + ' }]]],   /* Parsec 16.3 */')

# ---- the RO page's Customer section: the contact, their phone and email, the driver
if "pxField2('contactName')" not in js:
    js = _soft163c(js, "    pxProp('Cust #', RO.custNo || 'Add', { id: !!RO.custNo, empty: !RO.custNo, edit: pxField2('custNo') }),\n",
        "    pxProp('Cust #', RO.custNo || 'Add', { id: !!RO.custNo, empty: !RO.custNo, edit: pxField2('custNo') }),\n"
        "    pxProp('Contact', RO.contactName || 'Add who to call', { empty: !RO.contactName, edit: pxField2('contactName') }),   /* Parsec 16.3 */\n"
        "    pxProp('Phone', RO.contactPhone || 'Add a number', { empty: !RO.contactPhone, copy: RO.contactPhone || null, edit: pxField2('contactPhone') }),\n"
        "    pxProp('Email', RO.contactEmail || 'Add an email', { empty: !RO.contactEmail, copy: RO.contactEmail || null, edit: pxField2('contactEmail') }),\n"
        "    pxProp('Driver', RO.driverName || 'Add the driver', { empty: !RO.driverName, edit: pxField2('driverName') }),\n"
        "    pxProp('Driver’s phone', RO.driverPhone || 'Add a number', { empty: !RO.driverPhone, copy: RO.driverPhone || null, edit: pxField2('driverPhone') }),\n",
        "the RO page Customer section's contact rows")
else:
    LOG.append("Parsec 16.3 (C): the RO page Customer section already has the contact — not added twice")

# ---- the truck card: its shop buttons under the department, the ones turned off gone
js = _soft163c(js, "  if (tb) tb.appendChild(acts);",
    "  try { if (typeof v163DeptActs === 'function') acts = v163DeptActs(acts, RO) || acts; } catch (er) { console.error(er); }   /* Parsec 16.3: by department */\n  if (tb) tb.appendChild(acts);",
    "the truck card's shop buttons")

_c163 = b9("v163c.css"); _main163, _jc163 = _c163.split("/*JC*/")
EXTRA_CSS.append(_main163)
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + _jc163)[1:-1] + js[_jc1:]
KEEP_EXTRA += ["v163ShopOk", "v163DeptActs", "v163Hide", "v163Watch", "v163SugHtml", "v163LastFill", "v163ReadContact"]
HOOK_NAMES += ["v163ShopOk", "v163Phone", "v163Email", "v163Name", "v163ReadContact", "v163LastRo", "v163LastFill", "v163SugHtml", "v163Depts", "v163Btns", "v163Clean", "v163DeptActs", "v163Hide", "V163_SG", "IMPX",
               "sgSet", "sgOp", "sgReset", "sgResetGroup", "sgUndo", "sgFind", "sgLog", "sgGo", "SG_BY", "roFldSet", "pdBuildTables", "pdxRebuild", "pdTopicMap", "undoLast", "trxBtnsOk", "roDetailsHtml"]
LOG.append("Parsec 16.3 (C): New RO reads the contact and the driver, suggests the last contact; Shop buttons by department")
