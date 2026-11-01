# Parsec 14.9 (E) — what the tooltips say: status pills (status · since · why · who), initials (name · role), and why a main action
# can't be pressed. The words go on the controls as data-tip (the one tooltip — Fork A — reads them). Helpers: b9/v149e.js (global).
# Who set a status is stamped at save (scheduleSave) and seeded on the first render. Runs inside build12.py: uses js, rep, b9, LOG.
js = rep(js, "function pgStEl(kind, s, o){", b9("v149e.js") + "\nfunction pgStEl(kind, s, o){")
# ---- every status pill gets its tip (ro / part / claim kinds; 'any' pills are other words, left alone)
js = rep(js, '  var tt = o.title || (o.iconOnly ? S.label : "");',
             '  var tt = o.title || (o.iconOnly ? S.label : "");\n  var dtp = (kind === "ro" || kind === "part" || kind === "claim") && !o.noTip && typeof pgStTip === "function" ? pgStTip(kind, S, o) : "";   /* Parsec 14.9 */')
js = rep(js, "+ (tt ? ' title=\"' + pgStE(tt) + '\"' : \"\") + (o.iconOnly ?",
             "+ (tt ? ' title=\"' + pgStE(tt) + '\"' : \"\") + (dtp ? ' data-tip=\"' + pgStE(dtp) + '\" data-tip-keep' : \"\") + (o.iconOnly ?")
# the pills that know their RO / operation / part
js = rep(js, 'return pgSt("ro", roStFor(ro), Object.assign({ sub: sub, label: roStShown(ro) }, o)); }',
             'return pgSt("ro", roStFor(ro), Object.assign({ sub: sub, label: roStShown(ro), of: ro, ofKind: "ro" }, o)); }')
js = rep(js, "st(r.st, {", "st(r.st, { of: r.ro, ofKind: 'ro', ", 6)
js = rep(js, "var sb = pgStEl('ro', roStFor(RO), { menu: mayS, ", "var sb = pgStEl('ro', roStFor(RO), { of: RO, ofKind: 'ro', menu: mayS, ")
js = rep(js, "var st = p.status || 'Not Ordered';\n      var b = pgStEl('part', st, { menu: 1, cls: 'sm px-pstat', title: 'Part status and options' });",
             "var st = p.status || 'Not Ordered';\n      var b = pgStEl('part', st, { of: p, ofKind: 'part', menu: 1, cls: 'sm px-pstat', title: 'Part status and options' });")
js = rep(js, "var st = x.p.status || 'Not Ordered';\n    var b = pgStEl('part', st, { menu: 1, cls: 'sm px-pstat', title: 'Part status and options' });",
             "var st = x.p.status || 'Not Ordered';\n    var b = pgStEl('part', st, { of: x.p, ofKind: 'part', menu: 1, cls: 'sm px-pstat', title: 'Part status and options' });")
js = rep(js, "pgSt('part', p.status || 'Not Ordered', { cls: 'sm px-pstat-ro' })", "pgSt('part', p.status || 'Not Ordered', { of: p, ofKind: 'part', cls: 'sm px-pstat-ro' })")
js = rep(js, "var b = pgStEl('ro', jobStatusLabel(nm), { menu: 1, cls: 'sm rop-st', ", "var b = pgStEl('ro', jobStatusLabel(nm), { of: j, ofKind: 'op', menu: 1, cls: 'sm rop-st', ")
js = rep(js, "return pgSt('part', p.st, o); };", "if(p.raw){ o.of = p.raw; o.ofKind = 'part'; } return pgSt('part', p.st, o); };")
js = rep(js, "pgSt('part', z.st, { ", "pgSt('part', z.st, { of: z.p, ofKind: 'part', ", 2)
js = rep(js, "pgSt('ro', s0.status, { cls: 'sm', sub:", "pgSt('ro', s0.status, { of: r, ofKind: 'ro', cls: 'sm', sub:")
js = rep(js, "return n ? pgSt('ro', n, { cls: 'sm', size: 12 }) : '';", "return n ? pgSt('ro', n, { of: op, ofKind: 'op', cls: 'sm', size: 12 }) : '';")
# the Technician list: the running and the waiting lane's words
js = rep(js, "'<b class=\"run\" data-tk=\"runm\">' + dur(b", "'<b class=\"run\" data-tk=\"runm\"' + v149eAttr(v149eTcTip(o)) + '>' + dur(b")
js = rep(js, '`<b class="run" data-tk="runm">${dur(burn', '`<b class="run" data-tk="runm"${v149eAttr(v149eTcTip(o))}>${dur(burn')
js = rep(js, '<b class="wt">${esc(o.hold.k)}</b>', '<b class="wt"${v149eAttr(v149eTcTip(o))}>${esc(o.hold.k)}</b>')
# ---- who set it: stamped when the change is saved; the first render just looks
js = rep(js, "  try{ v147Scan(true); }catch(e){}   /* Parsec 14.7: Completed, kept per person */",
             "  try{ v147Scan(true); }catch(e){}   /* Parsec 14.7: Completed, kept per person */\n  try{ v149eStamp(); }catch(e){}   /* Parsec 14.9: who set each status */")
js = rep(js, "LAST_RENDER = Date.now(); try{ v146Soon(); }catch(e){} try{ v147Soon(); }catch(e){}",
             "LAST_RENDER = Date.now(); try{ v146Soon(); }catch(e){} try{ v147Soon(); }catch(e){} try{ v149eStamp(); }catch(e){}")
# ---- initials: the name and the role
js = rep(js, "function av(n, cls){ return '<span class=\"tg-av' + (cls ? \" \" + cls : \"\") + '\" title=\"' + e(n) + '\">' + e(ini(n)) + '</span>'; }",
             "function av(n, cls){ return '<span class=\"tg-av' + (cls ? \" \" + cls : \"\") + '\" title=\"' + e(n) + '\"' + (typeof v149eAvAttr === 'function' ? v149eAvAttr(n) : '') + '>' + e(ini(n)) + '</span>'; }")
js = rep(js, "`<span class=\"tk-av${cls ? ' ' + cls : ''}\" title=\"${esc(t)}\">", "`<span class=\"tk-av${cls ? ' ' + cls : ''}\" title=\"${esc(t)}\"${v149eAvAttr(t)}>")
js = rep(js, "const av = n => n ? `<span class=\"tg-av\" title=\"${esc(n)}\">", "const av = n => n ? `<span class=\"tg-av\" title=\"${esc(n)}\"${v149eAvAttr(n)}>")
js = rep(js, "const av = t => `<span class=\"dy-av\">", "const av = t => `<span class=\"dy-av\"${v149eAvAttr(t)}>")
js = rep(js, "function ropAv(n) { return '<span class=\"px-av\" title=\"' + esc(n || '') + '\">'", "function ropAv(n) { return '<span class=\"px-av\" title=\"' + esc(n || '') + '\"' + v149eAvAttr(n) + '>'")
js = rep(js, "'with <span class=\"px-av\">' + esc(ivInit(hn)) + '</span> '", "'with <span class=\"px-av\"' + v149eAvAttr(hn) + '>' + esc(ivInit(hn)) + '</span> '")
js = rep(js, "el('span', { class: 'px-av', text: ivInit(n.by || RO.assignedTech) })", "el('span', { class: 'px-av', 'data-tip': v149eAvTip(n.by || RO.assignedTech) || null, text: ivInit(n.by || RO.assignedTech) })")
js = rep(js, "el('span', { class: 'px-av', text: x.ext && !x.note.by ? 'AS' : ivInit(x.note.by || RO.assignedTech) })",
             "el('span', { class: 'px-av', 'data-tip': x.ext && !x.note.by ? 'ASIST · from the case' : v149eAvTip(x.note.by || RO.assignedTech) || null, text: x.ext && !x.note.by ? 'AS' : ivInit(x.note.by || RO.assignedTech) })")
js = rep(js, "html: '<span class=\"px-av\">' + esc(ivInit(n)) + '</span>' + esc(n) }); };", "html: '<span class=\"px-av\"' + v149eAvAttr(n) + '>' + esc(ivInit(n)) + '</span>' + esc(n) }); };")
js = rep(js, "'<span class=\"px-av\" title=\"' + esc(who) + '\">' + esc(ivInit(who)) + '</span>'", "'<span class=\"px-av\" title=\"' + esc(who) + '\"' + v149eAvAttr(who) + '>' + esc(ivInit(who)) + '</span>'")
js = rep(js, "  return '<span class=\"' + cls + ' avx' + (inner ? '' : ' ini') + '\">' + (inner || esc(profileInitials(sf && sf.name))) + '</span>';",
             "  return '<span class=\"' + cls + ' avx' + (inner ? '' : ' ini') + '\"' + (sf && sf.name ? ' data-tip=\"' + esc(sf.name + (sf.role ? ' · ' + sf.role : '')) + '\"' : '') + '>' + (inner || esc(profileInitials(sf && sf.name))) + '</span>';")
js = rep(js, "return '<span class=\"jp-who\" title=\"Punched by ' + esc(sf ? sf.name : nm) + '\">'", "return '<span class=\"jp-who\" title=\"Punched by ' + esc(sf ? sf.name : nm) + '\"' + v149eAvAttr(sf ? sf.name : nm) + '>'")
js = rep(js, "'<span class=\"tg-av ib-sys\">P</span>'", "'<span class=\"tg-av ib-sys\" data-tip=\"Parsec · automations\">P</span>'")
# ---- the main actions say why they can't be pressed
js = rep(js, "data-a=\"start\"${S.out ? ' disabled' : ''}", "data-a=\"start\"${S.out ? ' disabled data-tip=\"Clock in first — you’re off the clock\"' : ''}", 2)
js = rep(js, "data-a=\"startid\" data-id=\"${o.id}\"${S.out ? ' disabled' : ''}", "data-a=\"startid\" data-id=\"${o.id}\"${S.out ? ' disabled data-tip=\"Clock in first — you’re off the clock\"' : ''}")
js = rep(js, "data-action=\"tg-xf-go\"' + (ok ? '' : ' disabled') + '>'",
             "data-action=\"tg-xf-go\"' + (ok ? '' : ' disabled data-tip=\"' + (!A.to ? 'Pick where it goes first' : !A.who ? 'Pick who gets it first' : !A.why ? 'Pick why first' : 'Pick when it’s back first') + '\"') + '>'", 2)
js = rep(js, "data-action=\"tg-rt-go\" data-v=\"send\"' + (R.who && (R.when !== \"pick\" || R.pick) ? '' : ' disabled') + '>'",
             "data-action=\"tg-rt-go\" data-v=\"send\"' + (R.who && (R.when !== \"pick\" || R.pick) ? '' : ' disabled data-tip=\"' + (R.who ? 'Pick the time first' : 'Pick who drives first') + '\"') + '>'")
js = rep(js, "data-v=\"any\"' + (A.reason ? '' : ' disabled') + '>Release anyway", "data-v=\"any\"' + (A.reason ? '' : ' disabled data-tip=\"Pick a reason first\"') + '>Release anyway")
js = rep(js, "<button class=\"btn btn-sm btn-primary\" disabled>' + tgI(\"release\", 13) + 'Release</button>",
             "<button class=\"btn btn-sm btn-primary\" disabled data-tip=\"Not yet — ' + nb + ' check' + (nb > 1 ? 's' : '') + ' open|Fix them, or release anyway\">' + tgI(\"release\", 13) + 'Release</button>")
js = rep(js, "+(rok ? '' : ' disabled title=\"Tick every line first\"')+", "+(rok ? '' : ' disabled title=\"Tick every line first\" data-tip=\"Not yet — tick every line first\"')+")
js = rep(js, "data-action=\"rt-send\"' + (!m.to || (m.to === \"tech\" && !m.who) ? ' disabled' : '') + '>'",
             "data-action=\"rt-send\"' + (!m.to || (m.to === \"tech\" && !m.who) ? ' disabled data-tip=\"' + (!m.to ? 'Pick who does the road test first' : 'Pick the tech first') + '\"' : '') + '>'")
js = rep(js, "b('hold', 'clock', 'Hold', !live.length)", "b('hold', 'clock', 'Hold', !live.length, live.length ? '' : 'Nothing to hold — every one is done or declined')", 2)
js = rep(js, "b('done', 'check', 'Mark done', !live.length, '', true)", "b('done', 'check', 'Mark done', !live.length, live.length ? '' : 'Nothing to mark — every one is done or declined', true)", 2)
js = rep(js, "data-k=\"${d[0]}\"${d[0] === 'tech' && !r.tech ? ' disabled' : ''}>", "data-k=\"${d[0]}\"${d[0] === 'tech' && !r.tech ? ' disabled data-tip=\"No tech on this RO yet\"' : ''}>")
js = rep(js, "data-i=\"${i}\"${dis ? ' disabled' : ''}>", "data-i=\"${i}\"${dis ? ' disabled data-tip=\"Pick someone first\"' : ''}>")
js = rep(js, "S.view ? 'The clock is ' + PG.first(S.me) + '’s to start' : one ? '' : 'Start works on one operation that isn’t running'", "S.view ? 'The clock is ' + PG.first(S.me) + '’s to start' : S.out && one ? 'Clock in first — you’re off the clock' : one ? '' : 'Start works on one operation that isn’t running'")
js = rep(js, "if (PXM && PXM.submit) { var ok = m.to !== 'tech' || !!m.who; PXM.submit.disabled = !ok; PXM.submit.classList.toggle('is-disabled', !ok); }",
             "if (PXM && PXM.submit) { var ok = m.to !== 'tech' || !!m.who; PXM.submit.disabled = !ok; PXM.submit.classList.toggle('is-disabled', !ok); if (!ok) PXM.submit.setAttribute('data-tip', 'Pick a technician first'); else PXM.submit.removeAttribute('data-tip'); }")
# the Time Log's send / save buttons wait for a reason
js = rep(js, "data-a=\"psave\"${otherT() && needWhy(p) ? ' disabled' : ''}>", "data-a=\"psave\"${otherT() && needWhy(p) ? ' disabled data-tip=\"Pick why first\"' : ''}>")
js = rep(js, "data-a=\"fgo\"${p.o == null || needWhy(p) ? ' disabled' : ''}>", "data-a=\"fgo\"${p.o == null ? ' disabled data-tip=\"Pick one first\"' : needWhy(p) ? ' disabled data-tip=\"Pick why first\"' : ''}>", 2)
js = rep(js, "data-a=\"splitgo\"${needWhy(p) ? ' disabled' : ''}>", "data-a=\"splitgo\"${needWhy(p) ? ' disabled data-tip=\"Pick why first\"' : ''}>")
js = rep(js, "data-a=\"tsignn\"${String(p.n || '').trim() ? '' : ' disabled'}>", "data-a=\"tsignn\"${String(p.n || '').trim() ? '' : ' disabled data-tip=\"Write the note first\"'}>")
js = rep(js, "data-a=\"shgo\"${needWhy(p) ? ' disabled' : ''}>", "data-a=\"shgo\"${needWhy(p) ? ' disabled data-tip=\"Pick why first\"' : ''}>")
js = rep(js, "data-a=\"wgo\"${needWhy(p) ? ' disabled' : ''}>", "data-a=\"wgo\"${needWhy(p) ? ' disabled data-tip=\"Pick why first\"' : ''}>")
js = rep(js, "data-a=\"crewgo\"${needWhy(p) || (m0 === 'shop' && !p.op) ? ' disabled' : ''}>",
             "data-a=\"crewgo\"${needWhy(p) ? ' disabled data-tip=\"Pick why first\"' : m0 === 'shop' && !p.op ? ' disabled data-tip=\"Pick the shop job first\"' : ''}>")
# …and when typing turns one on or off, the reason follows
js = rep(js, "if(b && (b.dataset.a !== 'psave' || otherT())){ const ok2 = b.dataset.a === 'fgo' ? p.o != null : b.dataset.a === 'crewgo' ? (p.mode !== 'shop' || !!p.op) : true; b.disabled = !(String(t.value).trim() && ok2); }",
             "if(b && (b.dataset.a !== 'psave' || otherT())){ const ok2 = b.dataset.a === 'fgo' ? p.o != null : b.dataset.a === 'crewgo' ? (p.mode !== 'shop' || !!p.op) : true; b.disabled = !(String(t.value).trim() && ok2); if(b.disabled) b.setAttribute('data-tip', String(t.value).trim() ? 'Pick one first' : 'Pick why first'); else b.removeAttribute('data-tip'); }")
js = rep(js, "if(b) b.disabled = !t.value.trim(); return; }", "if(b){ b.disabled = !t.value.trim(); if(b.disabled) b.setAttribute('data-tip', 'Write the note first'); else b.removeAttribute('data-tip'); } return; }")
HOOK_NAMES += ["pgStTip", "v149eStamp", "v149eAvTip", "v149eWhen", "v149eAgo"]
KEEP_EXTRA += ["pgStTip", "v149eStamp", "v149eAvTip", "v149eAvAttr", "v149eAttr", "v149eTcTip", "v149eOpSrc", "v149ePartsWhy", "v149ePartWhy", "v149eWhen", "v149eAgo", "v149eDay", "v149eWho", "v149eWhoName"]
LOG.append("Parsec 14.9 (E): the tooltips say why — status pills, initials, the main actions")
