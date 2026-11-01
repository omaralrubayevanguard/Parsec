# Parsec 14 (fork X) — the import reads every cost and the engine serial (b9/imp1.js), and Extract operations and the Parts list import
# read them too (b9/v132x.js, b9/v132x.css). An operation's own labor rate, its core charges and the RO's shop supplies count in the money.
_x_anchor = "/* ============================== Parsec 9 — page modules ============================== */\n"
assert js.count(_x_anchor) == 1
js = js.replace(_x_anchor, b9("v132x.js") + "\n" + _x_anchor, 1)
EXTRA_CSS.append(b9("v132x.css"))
# ---- the money: the labor rate the case gave this operation, core charges, the RO's shop supplies & fees ----
js = rep(js, "function opMoney(op){ var lab = (+op.quoted || 0) * laborRate(), pts = (op.parts || []).reduce(function(a, p){ return a + partLine$(p); }, 0), oth = priceOf(op.otherCost); return { labor: lab, parts: pts, other: oth, total: lab + pts + oth }; }",
         "function opMoney(op){ var lab = (+op.quoted || 0) * (+op.laborRate > 0 ? +op.laborRate : laborRate()), pts = (op.parts || []).reduce(function(a, p){ return a + partLine$(p); }, 0), core = (op.parts || []).reduce(function(a, p){ var q = parseFloat(p && p.qty); if(!isFinite(q)) q = 1; return a + q * priceOf(p && p.core); }, 0), oth = priceOf(op.otherCost); return { labor: lab, parts: pts, core: core, other: oth, total: lab + pts + core + oth }; }   /* Parsec 14: an operation's own labor rate (from the case), and core charges, count */")
js = rep(js, "function roMoney(ro){ var t = { labor: 0, parts: 0, other: 0, total: 0 }; (ro && ro.operations || []).forEach(function(op){ if(op.declined) return; var m = opMoney(op); t.labor += m.labor; t.parts += m.parts; t.other += m.other; t.total += m.total; }); return t; }",
         "function roMoney(ro){ var t = { labor: 0, parts: 0, core: 0, other: 0, supplies: 0, total: 0 }; (ro && ro.operations || []).forEach(function(op){ if(op.declined) return; var m = opMoney(op); t.labor += m.labor; t.parts += m.parts; t.core += m.core || 0; t.other += m.other; t.total += m.total; }); var sup = priceOf(ro && ro.shopSupplies); if(sup){ t.supplies = sup; t.other += sup; t.total += sup; } return t; }   /* Parsec 14: the RO's shop supplies & fees from the case */")
# ---- Extract operations: the import's reader, the rest of the money under each row, the operation keeps it ----
js = rep(js, "  var rows = [];\n  try{ rows = (parseCaseText(raw).jobs || []).map(function(j){",
         "  var rows = [];\n  try{ rows = x132OpsRows(raw); }catch(e){ rows = []; }   /* Parsec 14: hours, rate, labor, parts, shop supplies, sublet, total — and the parts */\n  if(!rows.length) try{ rows = (parseCaseText(raw).jobs || []).map(function(j){")
js = rep(js, "placeholder=\"0.00\" inputmode=\"decimal\" aria-label=\"Estimate amount\"></div>';",
         "placeholder=\"0.00\" inputmode=\"decimal\" aria-label=\"Labor on the case\" title=\"Labor on the case\">'+x132OpsMore(r)+'</div>';")
js = rep(js, "    if(+r.cost > 0) op.estCost = +r.cost;                                          /* the amount on the estimate */",
         "    if(+r.cost > 0) op.estCost = +r.cost;                                          /* the amount on the estimate */\n    try{ x132OpsCommit(op, r, ro); }catch(e){ console.error(e); }   /* Parsec 14 */")
js = rep(js, "    return r.listy && !names.some(function(n){ return k.indexOf(n) > -1 || n.indexOf(k) > -1; });",
         "    return r.listy && !x132NotAnOp(r.name) && !names.some(function(n){ return k.indexOf(n) > -1 || n.indexOf(k) > -1; });   /* Parsec 14 */")
# ---- the Parts list import: list / net / core / ext ----
js = rep(js, "function parsePartsText(raw) {\n  var dp = parseDealerParts(raw); if (dp.length) return dp;", "function parsePartsText0(raw) {\n  var dp = parseDealerParts(raw); if (dp.length) return dp;")
js = rep(js, "+(p.price ? '<span class=\"mono inv-x-q\">'+esc(money(+p.price))+'</span>' : '')+'</label>';",
         "+(p.price ? '<span class=\"mono inv-x-q\">'+esc(money(+p.price))+'</span>' : '<span></span>')+x132InvMore(p)+'</label>';")
js = rep(js, "k.children = rows.map(function(p){ var c = invChild(); c.desc = p.desc; c.pn = p.pn; c.qty = p.qty; if(p.price) c.price = p.price; return c; });",
         "k.children = rows.map(function(p){ var c = invChild(); c.desc = p.desc; c.pn = p.pn; c.qty = p.qty; if(p.price) c.price = p.price; if(p.cost) c.cost = p.cost; if(p.core) c.core = p.core; return c; });")
js = rep(js, "var it = invBlank(false); it.desc = p.desc; it.pn = p.pn; it.qty = p.qty; if(p.price) it.price = p.price;",
         "var it = invBlank(false); it.desc = p.desc; it.pn = p.pn; it.qty = p.qty; if(p.price) it.price = p.price; if(p.cost) it.cost = p.cost; if(p.core) it.core = p.core; if(p.list) it.list = p.list;")
# a name the 13.x import glued "Parts" onto is put back when the file loads (every RO goes through migrateRO)
_mc = js.count("function migrateRO(ro){")
assert _mc >= 1, _mc
js = js.replace("function migrateRO(ro){", "function migrateRO(ro){ x132Unglue(ro);   /* Parsec 14 */")
HOOK_NAMES += ["x132Unglue", "x132OpsRows", "x132PartsRows", "parsePartsText", "opMoney", "roMoney"]
LOG.append("Parsec 14 (fork X): every cost and the engine serial read — import, Extract operations, Parts list import; op labor rate, core, shop supplies in the money")
