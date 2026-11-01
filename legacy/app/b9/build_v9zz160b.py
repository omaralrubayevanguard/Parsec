# Parsec 16 (B) — data that travels cleanly (one form per kind of value) and save less of the same thing (a slim Completed
# record, big photos shrunk). b9/v160b.js holds the helpers, the clean-up passes and the photo rule; this file wires them in:
#   · normalizeState: the one-time conversion (STATE.dataV < 16 → 16) and the Completed snapshot for an RO a newer copy deleted
#   · scheduleSave: anything still written the old way goes into the new form (before the undo point, so no extra undo step)
#   · readers: take both forms — writers: the new form (moments → ISO, date-only → YYYY-MM-DD, money → a number of dollars)
#   · STATE.tcDone: slim lines, read from the live RO; the full snapshot just before an RO is deleted
#   · shrinkImage: the 1600 px / 2 MB rule
# Runs inside build12.py after build_v9zz150*.py: uses js, rep, b9, KEEP_EXTRA, HOOK_NAMES, LOG. Fork A's writeFolderState,
# readFolderState, adoptFolderState, ids, updatedAt, tombstones and merge are not touched; Fork C's backups / export are not touched.
import re as _re160

js = rep(js, "\nvar PG = (function(){\n", "\n" + b9("v160b.js") + "\nvar PG = (function(){\n")

# ---------------------------------------------------------------- the hooks
js = rep(js, "  var keepState = STATE; STATE = pick;\n  try{ pick.ros.forEach(migrateRO); } finally { STATE = keepState; }\n  return pick;\n}",
             "  var keepState = STATE; STATE = pick;\n  try{ pick.ros.forEach(migrateRO); } finally { STATE = keepState; }\n"
             "  try{ v160CleanOnce(pick, typeof STATE !== \"undefined\" ? STATE : null); }catch(e160){ console.warn(\"Parsec 16 clean-up\", e160); }   /* Parsec 16: one form per kind of value, once */\n"
             "  return pick;\n}")
_i = js.index("function scheduleSave(immediate){"); _j = js.index("if(TAB_LOCKED) return;", _i); assert _j - _i < 200, "scheduleSave"
_j = js.index("\n", _j) + 1
js = js[:_j] + "  try{ v160CleanSave(); }catch(e160){}   /* Parsec 16: anything written the old way → the new form (before the undo point) */\n" + js[_j:]

# ---------------------------------------------------------------- moments → ISO 8601 UTC
# history (every line goes through autoHist); typing in one box still becomes one line
js = rep(js, "function autoHist(ro, e, coalesce){\n  if(!ro) return;\n", "function autoHist(ro, e, coalesce){\n  if(!ro) return;\n  if(e && typeof e.at !== \"string\") e.at = cdIso(e.at);   /* Parsec 16 */\n")
js = rep(js, "e.at - last.at < 180000", "cdMs(e.at) - cdMs(last.at) < 180000")
# the operation's log reads the history next to the punches (ms)
js = rep(js, "var hist = (RO.history || []).filter(function (h) { return h.op === job.id && h.k !== 'punch'; });",
             "var hist = (RO.history || []).filter(function (h) { return h.op === job.id && h.k !== 'punch'; }).map(function (h) { return Object.assign({}, h, { at: cdMs(h.at) }); });   /* Parsec 16: ISO or ms */")
# suggestions, reminders
js = rep(js, 'var sg = { id: uid("sg"), key: key, at: Date.now(),', 'var sg = { id: uid("sg"), key: key, at: nowIso(),')
js = rep(js, '"ro.auto|" + t.status + "|" + Date.now(), at: Date.now(),', '"ro.auto|" + t.status + "|" + Date.now(), at: nowIso(),')
js = rep(js, 'ro.autoReminders.push({ id: uid("rm"), text: a.v, at: Date.now() });', 'ro.autoReminders.push({ id: uid("rm"), text: a.v, at: nowIso() });')
# bulletins: made, ticked
js = rep(js, "files: [], at: Date.now(), tickedAt: null }; r.bulletins.push(e); } e.done = on; e.tickedAt = on ? Date.now() : null;",
             "files: [], at: nowIso(), tickedAt: null }; r.bulletins.push(e); } e.done = on; e.tickedAt = on ? nowIso() : null;")
js = rep(js, 'files: [], at: base + i*60000, tickedAt: base + i*60000 };', 'files: [], at: new Date(base + i*60000).toISOString(), tickedAt: new Date(base + i*60000).toISOString() };')
js = rep(js, 'files: [], at: now, tickedAt: null }; ro.bulletins.push(e); } e.done = true; e.tickedAt = now; };',
             'files: [], at: new Date(now).toISOString(), tickedAt: null }; ro.bulletins.push(e); } e.done = true; e.tickedAt = new Date(now).toISOString(); };')
js = rep(js, "task: taskId, done: false, fields: {}, place: '', files: [], at: Date.now(), tickedAt: null };", "task: taskId, done: false, fields: {}, place: '', files: [], at: nowIso(), tickedAt: null };")
js = rep(js, "files: Array.isArray(st.files) ? st.files : [], at: Date.now(), tickedAt: null });", "files: Array.isArray(st.files) ? st.files : [], at: nowIso(), tickedAt: null });")
js = rep(js, "e.tickedAt = e.done ? Date.now() : null;", "e.tickedAt = e.done ? nowIso() : null;")
# an attached file's time: ISO kept, shown as before ("MM-DD HH:MM:SS")
js = rep(js, "type: out.blob.type || file.type, ts: ts };", "type: out.blob.type || file.type, ts: nowIso() };")
js = rep(js, "type: out.blob.type || file.type, ts: ts, op: opId || undefined });", "type: out.blob.type || file.type, ts: nowIso(), op: opId || undefined });")
js = rep(js, "(f.ts ? ' · ' + f.ts : '')", "(f.ts ? ' · ' + cdTs(f.ts) : '')", 2)
js = rep(js, "f.ts ? el('span', { class: 'fMeta mono', text: f.ts }) : null", "f.ts ? el('span', { class: 'fMeta mono', text: cdTs(f.ts) }) : null")
js = rep(js, "String(x.f.ts || '').slice(0, 5)", "cdTs(x.f.ts).slice(0, 5)", 2)

# ---------------------------------------------------------------- a date only → YYYY-MM-DD (shown as before where it was shown as typed)
js = rep(js, 'var d = roFldPD(v); ro[k] = d ? roFldP2(d.getMonth() + 1) + "-" + roFldP2(d.getDate()) + "-" + d.getFullYear() : v; },',
             'var d = roFldPD(v); ro[k] = d ? d.getFullYear() + "-" + roFldP2(d.getMonth() + 1) + "-" + roFldP2(d.getDate()) : v; },   /* Parsec 16: YYYY-MM-DD */')
js = rep(js, '/* buildDate/warrantyStart are kept as typed (MM-DD-YYYY), unlike dateOpened which is\n   normalized to ISO — so extraction has to produce that same MM-DD-YYYY shape. */\nfunction toMdyDate(s){\n  var m = /(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})/.exec(s||""); if(!m) return "";\n  return String(m[1]).padStart(2,"0")+"-"+String(m[2]).padStart(2,"0")+"-"+m[3];',
             '/* buildDate/warrantyStart are a date only: YYYY-MM-DD (Parsec 16; MM-DD-YYYY before) — extraction writes that shape. */\nfunction toMdyDate(s){\n  var m = /(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})/.exec(s||""); if(!m) return "";\n  return m[3]+"-"+String(m[1]).padStart(2,"0")+"-"+String(m[2]).padStart(2,"0");')
# the ASIST import: compares and shows them as before, writes the new form
js = rep(js, '    var v = ro[k]; return v == null ? "" : String(v);\n  }\n  function srcF(',
             '    var v = ro[k]; if(k === "buildDate" || k === "warrantyStart") v = cdDayShow(v);   /* Parsec 16: compared and shown as MM-DD-YYYY */\n    return v == null ? "" : String(v);\n  }\n  function srcF(')
js = rep(js, '    if((s[4] || {}).num){ ro[k] = String(v).replace(/[^\\d.]/g, ""); return; }\n    if(k === "vin"){',
             '    if(k === "buildDate" || k === "warrantyStart"){ ro[k] = cdDay(String(v)); return; }   /* Parsec 16 */\n'
             '    if((s[4] || {}).money){ ro[k] = cdMoney(String(v).replace(/[^\\d.]/g, "")); return; }   /* Parsec 16: dollars, a number */\n'
             '    if((s[4] || {}).num){ ro[k] = String(v).replace(/[^\\d.]/g, ""); return; }\n    if(k === "vin"){')
# the warranty pages
js = rep(js, 'function waWs(v){ var d = waD(v); if(!d) return v; var p = function(n){ return String(n).padStart(2, "0"); }; return p(d.getMonth() + 1) + "-" + p(d.getDate()) + "-" + d.getFullYear(); }',
             'function waWs(v){ var d = waD(v); if(!d) return v; var p = function(n){ return String(n).padStart(2, "0"); }; return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); }   /* Parsec 16: YYYY-MM-DD */')
js = rep(js, 'ws: ["Warranty start date", "MM-DD-YYYY", ro.warrantyStart, "RO"]', 'ws: ["Warranty start date", "MM-DD-YYYY", cdDayShow(ro.warrantyStart), "RO"]')
js = rep(js, 'ro.warrantyStart = p2(w.getMonth() + 1) + "-" + p2(w.getDate()) + "-" + w.getFullYear(); }', 'ro.warrantyStart = w.getFullYear() + "-" + p2(w.getMonth() + 1) + "-" + p2(w.getDate()); }')
js = rep(js, "fact('Warranty starts', ro.warrantyStart)", "fact('Warranty starts', cdDayShow(ro.warrantyStart))")
js = rep(js, "(ro.warrantyStart ? ' since ' + esc(ro.warrantyStart) : '')", "(ro.warrantyStart ? ' since ' + esc(cdDayShow(ro.warrantyStart)) : '')")
js = rep(js, 'dd("Warranty start", ro.warrantyStart, 1)', 'dd("Warranty start", cdDayShow(ro.warrantyStart), 1)')
# the RO page's DATE BUILT / WARRANTY STARTS boxes: typed and shown MM-DD-YYYY, kept YYYY-MM-DD
js = rep(js, "plain('built', 'buildDate'); plain('warrStart', 'warrantyStart');",
             "map('built', function () { return cdDayShow(ro.buildDate || ''); }, function (v) { ro.buildDate = cdDay(v); });   /* Parsec 16 */\n"
             "  map('warrStart', function () { return cdDayShow(ro.warrantyStart || ''); }, function (v) { ro.warrantyStart = cdDay(v); });")

# ---------------------------------------------------------------- money → a number of dollars
_n = len(_re160.findall(r"String\(priceOf\(([\w.]+)\)\)", js)); assert _n == 11, ("String(priceOf", _n)
js = _re160.sub(r"String\(priceOf\(([\w.]+)\)\)", r"priceOf(\1)", js)
_n = len(_re160.findall(r"String\(invPriceOf\(([\w.]+), ([\w.]+)\)\)", js)); assert _n == 2, ("String(invPriceOf", _n)
js = _re160.sub(r"String\(invPriceOf\(([\w.]+), ([\w.]+)\)\)", r"invPriceOf(\1, \2)", js)
js = rep(js, "if(ip) p.price = String(ip);", "if(ip) p.price = ip;")
js = rep(js, "p.price = num(v) ? String(num(v)) : ''; save();", "p.price = num(v) ? num(v) : ''; save();")
js = rep(js, "job.otherCost = num(v) ? String(num(v)) : '';", "job.otherCost = num(v) ? num(v) : '';")
js = rep(js, 'else if(k === "otherCost"){ if(+v >= 0) op.otherCost = String(+v); }', 'else if(k === "otherCost"){ if(+v >= 0) op.otherCost = +v; }')
js = rep(js, "if(ot > 0) op.otherCost = String(ot);", "if(ot > 0) op.otherCost = ot;")
js = rep(js, "if(p.price != null) part.price = String(+p.price); if(+p.core > 0) part.core = String(+p.core); if(p.list != null) part.list = String(+p.list);",
             "if(p.price != null) part.price = +p.price; if(+p.core > 0) part.core = +p.core; if(p.list != null) part.list = +p.list;")
js = rep(js, "price: String(Math.round(x.price * 105) / 100)", "price: Math.round(x.price * 105) / 100")
js = rep(js, "price: x.price ? String(x.price) : ''", "price: x.price ? cdMoney(x.price) : ''", 2)
js = rep(js, "price: c.price ? String(c.price) : ''", "price: c.price ? cdMoney(c.price) : ''")
js = rep(js, "it.price = String(priceOf(p.price) || '');", "it.price = priceOf(p.price) || '';")
js = rep(js, "c.price = x.p[3] ? String(x.p[3]) : '';", "c.price = x.p[3] ? cdMoney(x.p[3]) : '';")
js = rep(js, "p.price = pr.value.trim();", "p.price = cdMoney(pr.value.trim());")
# warranty claims: amount / paid
js = rep(js, "c.amount = waAmt(op).toFixed(2);", "c.amount = +waAmt(op).toFixed(2);")
js = rep(js, "c.paid = (amt - cut).toFixed(2);", "c.paid = +(amt - cut).toFixed(2);")
js = rep(js, 'amount: amt, paid: "", notes: "", returnReason: "", history: [] };', 'amount: +amt, paid: "", notes: "", returnReason: "", history: [] };')
js = rep(js, 'if(os.wc === "paid") c.paid = amt;', 'if(os.wc === "paid") c.paid = +amt;')
js = rep(js, "wcClaim(o1)[t.dataset.waF] = t.value; scheduleSave(); return; }",
             "wcClaim(o1)[t.dataset.waF] = /^(amount|paid)$/.test(t.dataset.waF) ? cdMoney(t.value) : t.value; scheduleSave(); return; }")
js = rep(js, "function wcSet(opId, k, v){ if(!WC_FIELDS[k]) return; var f = wcFind(opId); if(!f) return; wcClaim(f.op)[k] = v; scheduleSave(); }",
             "function wcSet(opId, k, v){ if(!WC_FIELDS[k]) return; var f = wcFind(opId); if(!f) return; wcClaim(f.op)[k] = k === \"amount\" || k === \"paid\" ? cdMoney(v) : v; scheduleSave(); }")
js = rep(js, "value=\"' + esc(v != null ? v : (c[k] || \"\"))", "value=\"' + esc(v != null ? v : (k === \"amount\" || k === \"paid\" ? cdMoneyShow(c[k]) : (c[k] || \"\")))")

# ---------------------------------------------------------------- the Completed record: slim, read from the live RO
js = rep(js, "function v147Rec(ro, P){", "function v147Rec(ro, P, full){")
js = rep(js, 'var snap = { k: k, tech: who, roId: ro.id, opId: op.id, no: no, cust: ro.customerName || "", truck: v147Truck(ro), unit: ro.unitNumber || "", opn: i + 1, cmp: op.complaint || "Operation", hrs: Math.round(ms / 36e3) / 100, q: +op.quoted || 0, at: at };',
             'var snap = { k: k, tech: who, roId: ro.id, opId: op.id, opn: i + 1, hrs: Math.round(ms / 36e3) / 100, q: +op.quoted || 0, at: at };   /* Parsec 16: the rest is read from the RO */\n'
             '    V160B.cmp[op.id] = op.complaint || "Operation"; if(full) v160DoneFat(snap, ro, op);   /* the RO is about to go: keep the snapshot */')
js = rep(js, "    else { for(var f in snap) e[f] = snap[f]; }   /* keep it current while the RO is here */\n  });\n  return n;\n}",
             "    else { for(var f in snap) e[f] = snap[f]; if(!full) V160_FAT.forEach(function(f){ delete e[f]; }); }   /* keep it current while the RO is here */\n  });\n"
             "  if(full) L.forEach(function(e){ if(e && e.roId === ro.id && e.cust == null && e.no == null) v160DoneFat(e, ro, (ro.operations || []).filter(function(o){ return o && o.id === e.opId; })[0]); });\n"
             "  return n;\n}")
js = rep(js, "  var n = 0; STATE.ros.forEach(function(ro){ try{ n += v147Rec(ro, P); }catch(e){} });\n  return n;\n}",
             "  var n = 0; STATE.ros.forEach(function(ro){ try{ n += v147Rec(ro, P); }catch(e){} });\n  try{ v160DoneKeep(); }catch(e){}\n  return n;\n}")
js = rep(js, "if(type === 'ro-del' && ro){ try{ v147Rec(ro); }catch(e){} }", "if(type === 'ro-del' && ro){ try{ v147Rec(ro, null, true); }catch(e){} }")
js = rep(js, "if(op && !opDoneNow(op)) return;   /* reopened: it's back in the lists above */\n      const day = localDay(e.at)",
             "if(op && !opDoneNow(op)) return;   /* reopened: it's back in the lists above */\n      e = v160DoneView(e, ro, op);   /* Parsec 16: number, customer, truck, unit, complaint from the live RO */\n      const day = localDay(e.at)")

# ---------------------------------------------------------------- photos: the 1600 px / 2 MB rule
js = rep(js, "function shrinkImage(file) {\n  return new Promise(function (res) {\n    var plain = { blob: file, name: file.name, saved: 0 };",
             "function shrinkImage(file) { return v160Shrink(file); }   /* Parsec 16: wider than 1600 px or over 2 MB → 1600 px JPEG (b9/v160b.js) */\n"
             "function shrinkImage0(file) {\n  return new Promise(function (res) {\n    var plain = { blob: file, name: file.name, saved: 0 };")

_v160 = ["cdP2", "cdIso", "cdMs", "cdDay", "cdDayShow", "cdTs", "cdTsIso", "cdMoney", "cdMoneyShow", "v160CleanAll", "v160DoneFat", "v160DoneSlim", "v160DoneFreeze",
         "v160DoneKeep", "v160DoneView", "v160CleanOnce", "v160CleanSave", "v160Shrink", "V160B", "V160_FAT", "V160_IMG"]
KEEP_EXTRA += _v160
HOOK_NAMES += [n for n in _v160 if n not in ("cdP2", "V160_FAT", "V160_IMG")] + ["normalizeState", "audit"]
LOG.append("Parsec 16 (B): one form per kind of value (ISO moments, YYYY-MM-DD days, money in dollars), converted once (dataV 16); slim Completed record; photos 1600 px / 2 MB")
