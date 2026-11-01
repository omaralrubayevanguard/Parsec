# Parsec 13.1 (S) — every page's search becomes the icon that opens the search window (b9/v131s.js).
# Rewrites each page module from its .130 backup, so it can run again.
import os
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), "b9")


def ed(f, pairs):
    p = os.path.join(H, f)
    s = open(p + ".130", encoding="utf-8").read()
    for a, b in pairs:
        c = s.count(a)
        assert c == 1, (f, a[:100], c)
        s = s.replace(a, b)
    open(p, "w", encoding="utf-8").write(s)
    print("ok", f)


# ---------------- Technician (tc1.js): filters the list of my ROs ----------------
ed("tc1.js", [
    ("""const find = S.morning || TU.view === 'yard' ? '' : `<label class="tch-find tch-box">${ic('search', 14)}<input data-in="tq" value="${esc(TU.q)}" placeholder="RO, customer, truck, year…" autocomplete="off" aria-label="Search my repair orders"></label>`;""",
     """const find = S.morning || TU.view === 'yard' ? '' : psmBtn('tech', 'Search my repair orders');   /* Parsec 13.1 — the icon opens the search window */"""),
    ("""if(k === '/'){ const f = document.querySelector('[data-pg="tech"] [data-in="tq"]'); if(f){ f.focus(); f.select(); } return stop(); }""",
     """if(k === '/'){ if(TU.view !== 'yard') psmOpen('tech'); return stop(); }"""),
    ("""  const tcFlat = () => tcGroups(tcRos()).flatMap(g => g[1]);\n""",
     """  const tcFlat = () => tcGroups(tcRos()).flatMap(g => g[1]);
  /* Parsec 13.1 — the search is an icon: the window filters this list as you type */
  const TC_LANE = { run: 'Working', next: 'Assigned', wait: 'Waiting', done: 'Done today' };
  function tcHit(r, q){ const s = TU.q; TU.q = q || ''; try{ return tcMatch(r); } finally { TU.q = s; } }
  psmReg('tech', () => ({ title: 'Search my repair orders', page: 'Technician', placeholder: 'RO, customer, truck, year, unit, complaint…',
    get: () => TU.q, set: q => { TU.q = q; PG.keepScroll(render); },
    count: q => { const all = tcRos(); return { n: all.filter(r => tcHit(r, q)).length, of: all.length }; },
    items: q => q ? tcFlat().filter(r => tcHit(r, q)).slice(0, 8).map(r => ({ id: r.id, title: r.no + (r.cust ? ' · ' + r.cust : ''), sub: [r.truck, r.unit ? 'Unit ' + r.unit : '', TC_LANE[r.lane] || ''].filter(Boolean).join(' · ') })) : [],
    pick: it => { if(TU.ro !== it.id) tcSelClear(); TU.ro = it.id; TU.kb = false; U.pop = null; U.selRo = null; } }));
"""),
])

# ---------------- Inventory (inv1.js): filters the stock list (or the activity) ----------------
ed("inv1.js", [
    ("""<button class="btn ib tg-srch-b ivn-srb" data-a="srch" title="Find a part (/)">${ic('search', 16)}</button>""",
     """${psmBtn('inventory', U.view === 'act' ? 'Find a part in the activity' : 'Find a part')}"""),
    ("""<div class="ivn-bar"><label class="ivn-q">${ic('search', 14)}<input data-in="q" placeholder="Part #, description, bin, engine…" value="${esc(U.q)}" autocomplete="off" aria-label="Search the inventory"></label>\n""",
     """<div class="ivn-bar">\n"""),
    ("""<span class="sp"></span><label class="ivn-q sm">${ic('search', 14)}<input data-in="aq" placeholder="Part # or description" value="${esc(U.aq)}" aria-label="Find a part in the activity"></label></div>""",
     """<span class="sp"></span></div>"""),
    ("""    srch: () => { U.view = 'stock'; U.pop = null; rd(); setTimeout(() => { const f = document.querySelector('[data-pg="inventory"] [data-in="q"]'); if(f){ f.focus(); f.select(); } }, 20); },""",
     """    srch: () => { U.pop = null; psmOpen('inventory'); },"""),
    ("""    if(k === '/'){ H.srch(); return stop(); }""",
     """    if(k === '/'){ H.srch(); return stop(); }   /* Parsec 13.1 — the search window */"""),
    ("""  PG.reg('inventory', { H, U: () => U, input, change, fieldKey, keydown, after });""",
     """  /* Parsec 13.1 — the search is an icon: the window filters the stock list (on Activity, the movements) as you type */
  const ivQ = (q, f) => { const s = U.q; U.q = q; try{ return f(); } finally { U.q = s; } };
  const ivRow = x => ({ id: x.id, title: x.desc || x.pn || 'Part', sub: [x.kit ? 'Kit' : '', x.pn, x.bin ? 'Bin ' + x.bin : (x.kit ? '' : 'No bin'), x.oh + ' on hand'].filter(Boolean).join(' · ') });
  psmReg('inventory', () => U.view === 'act'
    ? { title: 'Find a part in the activity', page: 'Activity', placeholder: 'Part # or description',
        get: () => U.aq, set: q => { U.aq = q; rd(); },
        count: q => { const A = acts(), w = String(q || '').trim().toLowerCase(); return { n: w ? A.filter(a => hay(a.x).indexOf(w) > -1).length : A.length, of: A.length }; } }
    : { title: 'Find a part', page: 'Inventory', placeholder: 'Part #, description, bin, engine…',
        get: () => U.q, set: q => { U.q = q; if(q && U.view !== 'stock'){ U.view = 'stock'; U.pop = null; } rd(); },
        count: q => ({ n: ivQ(q, () => shown().length), of: ivQ('', () => shown().length) }),
        items: q => q ? ivQ(q, () => shown()).slice(0, 8).map(ivRow) : [],
        pick: it => { U.view = 'stock'; U.sel = it.id; U.kb = false; U.pop = null; } });
  PG.reg('inventory', { H, U: () => U, input, change, fieldKey, keydown, after });"""),
])

# ---------------- Admin (adm1.js): filters the people list ----------------
ed("adm1.js", [
    ("""<span class="tg-hsep"></span>\n      <button class="btn btn-sm btn-primary adm-addb" """,
     """<span class="tg-hsep"></span>\n      ${psmBtn('admin', 'Find a person')}<button class="btn btn-sm btn-primary adm-addb" """),
    ("""<nav class="adm-list" aria-label="People"><label class="adm-q">${ics('search', 14)}<input data-in="q" placeholder="Find a person" value="${esc(U.q)}" autocomplete="off" aria-label="Find a person"></label>${P.map(row).join('') || '<div class="adm-none">No one by that name.</div>'}""",
     """<nav class="adm-list" aria-label="People">${P.map(row).join('') || '<div class="adm-none">No one by that name.</div>'}"""),
    ("""    if(k === '/' && U.view === 'people'){ const i = document.querySelector('[data-pg="admin"] [data-in="q"]'); if(i){ i.focus(); return stop(); } }""",
     """    if(k === '/'){ psmOpen('admin'); return stop(); }   /* Parsec 13.1 — the search window */"""),
    ("""  PG.reg('admin', { H, U: () => U, input, change, fieldKey, keydown, after });""",
     """  /* Parsec 13.1 — the search is an icon: the window filters the people list as you type */
  const admHit = q => { q = String(q || '').trim().toLowerCase(); return people().filter(sf => !q || String(sf.name).toLowerCase().indexOf(q) >= 0 || String(sf.role).toLowerCase().indexOf(q) >= 0); };
  psmReg('admin', () => ({ title: 'Find a person', page: 'People', placeholder: 'Name or role',
    get: () => U.q, set: q => { U.q = q; if(q && U.view !== 'people'){ U.view = 'people'; U.pop = null; } rd(); },
    count: q => ({ n: admHit(q).length, of: people().length }),
    items: q => q ? admHit(q).slice(0, 8).map(sf => ({ id: sf.id, title: sf.name, sub: [sf.role, sf.off ? 'sign-in off' : '', isSelf(sf) ? 'you' : ''].filter(Boolean).join(' · ') })) : [],
    pick: it => { U.view = 'people'; U.sel = it.id; U.pop = null; U.ap1 = U.ap2 = ''; } }));
  PG.reg('admin', { H, U: () => U, input, change, fieldKey, keydown, after });"""),
])

# ---------------- Parts (pt2/pt4/pt5): finds a part, RO, return or catalog part to open; on Catalog it filters the catalog ----------------
ed("pt2.js", [
    ("""<button class="btn ib tg-srch-b" data-a="pop" data-p="srch" title="Find a part, RO or customer (/)">${ic('search', 16)}</button>""",
     """${psmBtn('parts', U.view === 'cat' ? 'Search the catalog' : 'Find a part, RO or customer')}"""),
])
# ptFind: what the search finds — the same as the old Find pop, which now calls it
s4 = open(os.path.join(H, "pt4.js.130"), encoding="utf-8").read().split("\n")
assert s4[79].startswith("    if(p.type === 'srch'){ const q = (p.q || '').trim().toLowerCase(); const res = [];") and s4[83].startswith("      const R = res.slice(0, 7);"), "pt4 lines moved"
blk = s4[80:83]
s4[79:83] = ["    if(p.type === 'srch'){ const q = (p.q || '').trim().toLowerCase(); const res = ptFind(q);"]
k = s4.index("  function pop(){")
s4[k:k] = ["  /* Parsec 13.1 — what the search finds: returns, RO lines, catalog parts (the search window and the old Find pop) */",
           "  function ptFind(q){ q = String(q || '').trim().toLowerCase(); const res = [];",
           "      if(q){" + blk[0][len("      if(q){"):]] + blk[1:] + ["    return res; }"]
open(os.path.join(H, "pt4.js"), "w", encoding="utf-8").write("\n".join(s4))
print("ok pt4.js")
ed("pt5.js", [
    ("""    if(k === '/'){ const b = document.querySelector('[data-pg="parts"] [data-a="pop"][data-p="srch"]'); if(b){ H.pop(b); return stop(); } }""",
     """    if(k === '/'){ psmOpen('parts'); return stop(); }   /* Parsec 13.1 — the search window */"""),
    ("""  PG.reg('parts', { H, U: () => U, input, change, fieldKey, keydown, after });""",
     """  /* Parsec 13.1 — the search is an icon. It finds a return, an RO's part or a catalog part to open;
     on Catalog it filters the catalog as you type. */
  const ptTxt = h => String(h == null ? '' : h).replace(/<[^>]*>/g, '');
  function ptCatN(q){ q = String(q || '').trim().toLowerCase(); const C = catAll(), hay = c => [c.pn, c.desc, c.fit, c.bin].join(' ').toLowerCase();
    let L = C.filter(c => !q || hay(c).includes(q)); if(U.cflt === 'low') L = L.filter(c => c.min && c.oh < c.min);
    const KL = U.cflt === 'low' ? [] : kits().filter(k => !q || [k.pn, k.desc, k.fit].join(' ').toLowerCase().includes(q) || k.kids.some(x => [x[0], x[2].desc].join(' ').toLowerCase().includes(q)));
    return { L, KL }; }
  psmReg('parts', () => U.view === 'cat'
    ? { title: 'Search the catalog', page: 'Catalog', placeholder: 'Part #, description, engine, bin…',
        get: () => U.cq, set: q => { U.cq = q; rd(); },
        count: q => { const a = ptCatN(q), b = ptCatN(''); return { n: a.L.length + a.KL.length, of: b.L.length + b.KL.length }; },
        items: q => { if(!q) return []; const a = ptCatN(q);
          return a.KL.map(k => ({ id: k.id, title: k.desc || k.pn || 'Kit', sub: ['Kit', k.pn, k.kids.length + ' parts'].filter(Boolean).join(' · ') }))
            .concat(a.L.map(c => ({ id: c.id, title: c.desc || c.pn || 'Part', sub: [c.pn, c.oh + ' on hand', c.bin ? 'bin ' + c.bin : '', ptTxt(usd(c.price))].filter(Boolean).join(' · ') }))).slice(0, 8); } }
    : { title: 'Find a part, RO or customer', page: 'Parts', placeholder: 'Part #, part, RO or customer', filters: false,
        empty: 'Where is it, who’s it for, is it in? Type a part #, a part or an RO.',
        get: () => U.psq || '', set: q => { U.psq = q; },
        items: q => ptFind(q).slice(0, 8).map((x, i) => x.k === 'ret'
          ? { id: 'ret' + i, x, icon: ic('undo', 14), title: x.t.id + ' · ' + x.t.desc, sub: ['Return', KIND[x.t.kind], ptTxt(rstTxt(x.t)), 'shelf ' + x.t.shelf, x.t.pn].filter(Boolean).join(' · ') }
          : x.k === 'ro'
          ? { id: 'ro' + i, x, icon: ic('ros', 14), title: (x.x ? x.x.desc + ' · ' : '') + x.r.no + ' ' + (x.r.cust || ''), sub: x.x ? [x.x.pn, stTxt[x.x.st] || '', x.x.bin && x.x.st === 'Staged' ? 'bin ' + x.x.bin : '', x.x.eta && !inHand(x.x) ? 'due ' + short(x.x.eta) : ''].filter(Boolean).join(' · ') : 'No parts yet' }
          : { id: 'cat' + i, x, icon: ic('book', 14), title: x.c.desc || x.c.pn, sub: ['Catalog', x.c.pn, x.c.oh + ' on hand', x.c.bin ? 'bin ' + x.c.bin : '', ptTxt(usd(x.c.price))].filter(Boolean).join(' · ') }),
        pick: it => { const x = it.x; U.psq = '';
          if(x.k === 'ret') H.rsel({ dataset: { tid: x.t.id } });
          else if(x.k === 'ro') H.open({ dataset: { k: 'ro', ro: x.r.id } });
          else H.open({ dataset: { k: 'cat', pn: x.c.pn } }); } });
  PG.reg('parts', { H, U: () => U, input, change, fieldKey, keydown, after });"""),
])

ed("pt3.js", [
    ("""<div class="pt-cbar"><input data-in="cq" placeholder="Search part #, description, engine, bin…" value="${esc(U.cq)}">""",
     """<div class="pt-cbar">"""),   # Parsec 13.1 — the catalog's search is the header icon now
])

# ---------------- Fixes (fx2/fx3): finds a complaint to open ----------------
ed("fx2.js", [
    ("""<button class="btn ib tg-srch-b" data-a="pop" data-p="srch" title="Search complaint, cause, code, part # or VIN (/)">${ic('search', 16)}</button>""",
     """${psmBtn('fixes', 'Search complaint, cause, code, part # or VIN')}"""),
])
ed("fx3.js", [
    ("""    if(p.type === 'srch'){ const q = (p.q || '').trim().toLowerCase(), R = [];
      if(q){ const W = q.split(/\\s+/); build().G.forEach(g => { const E = build().E[g.k] || []; const hit = [];
        const look = (lbl, s) => { if(s && W.every(w => String(s).toLowerCase().includes(w))) hit.push([lbl, String(s)]); };
        look('Complaint', g.t); E.forEach(e => { look('Cause', e.cause); look('Correction', e.fix); e.codes.forEach(c => look('Code', c)); e.parts.forEach(pp => look('Part', pp[0] + ' ' + pp[1])); look('VIN', e.vinF); look('RO', e.ro); });
        if(hit.length) R.push({ g, h: hit[0], n: hit.length }); }); }
""",
     """    if(p.type === 'srch'){ const q = (p.q || '').trim().toLowerCase(), R = fxFind(q);
"""),
    ("""  /* ---------- doing things ---------- */\n""",
     """  /* Parsec 13.1 — what the search finds: the complaints whose fixes match */
  function fxFind(q){ q = String(q || '').trim().toLowerCase(); const R = []; if(!q) return R;
    const W = q.split(/\\s+/); build().G.forEach(g => { const E = build().E[g.k] || []; const hit = [];
      const look = (lbl, s) => { if(s && W.every(w => String(s).toLowerCase().includes(w))) hit.push([lbl, String(s)]); };
      look('Complaint', g.t); E.forEach(e => { look('Cause', e.cause); look('Correction', e.fix); e.codes.forEach(c => look('Code', c)); e.parts.forEach(pp => look('Part', pp[0] + ' ' + pp[1])); look('VIN', e.vinF); look('RO', e.ro); });
      if(hit.length) R.push({ g, h: hit[0], n: hit.length }); });
    return R; }
  /* ---------- doing things ---------- */
"""),
    ("""    if(k === '/'){ const b = document.querySelector('[data-pg="fixes"] [data-a="pop"][data-p="srch"]'); if(b){ H.pop(b); return stop(); } }""",
     """    if(k === '/'){ psmOpen('fixes'); return stop(); }   /* Parsec 13.1 — the search window */"""),
    ("""  PG.reg('fixes', { H, U: () => U, input, change, fieldKey, keydown, after });""",
     """  /* Parsec 13.1 — the search is an icon: the window finds the complaint to open */
  psmReg('fixes', () => ({ title: 'Search complaint, cause, code, part # or VIN', page: 'Fixes', placeholder: 'Complaint, cause, SPN code, part # or VIN', filters: false,
    empty: 'Try an SPN code, a part number, a word like “connector”, or a VIN.',
    get: () => U.psq || '', set: q => { U.psq = q; },
    items: q => fxFind(q).slice(0, 8).map(x => ({ id: x.g.k, icon: ic(SYS[x.g.sys][1], 14), title: x.g.t, sub: x.h[0] + ': ' + x.h[1] + ' · ' + (build().E[x.g.k] || []).length + '×' })),
    pick: it => { U.psq = ''; H.sel({ dataset: { k: it.id, go: '1' } }); } }));
  PG.reg('fixes', { H, U: () => U, input, change, fieldKey, keydown, after });"""),
])

# (Inbox: the page is gone since Parsec 12.2 — its module is left as it is)

# ---------------- Manager (mg1.js): filters the KPI list ----------------
ed("mg1.js", [
    ("""<button class="btn ib tg-srch-b" data-a="pop" data-p="find" title="Find a KPI (/)">${ic('search',16)}</button>""",
     """${psmBtn('manager','Find a KPI')}"""),
    ("""<div class="mg-srin">${ic('search',14)}<input id="mg-lq" data-in="lq" placeholder="Find a KPI — hours, comeback, parts…" value="${esc(U.q)}" autocomplete="off"></div>""",
     ""),
    ("""  if(k==='/'){ const b=$('[data-a="pop"][data-p="find"]'); if(b) openPop('find',{},b); return stop(); }""",
     """  if(k==='/'){ psmOpen('manager'); return stop(); }   /* Parsec 13.1 — the search window */"""),
    ("""  PG.reg('manager', { H, U: () => U, input, change, fieldKey, keydown, after });""",
     """  /* Parsec 13.1 — the search is an icon: the window filters the KPI list as you type */
  const mgQ=(q,f)=>{ const s=U.q; U.q=q; try{ return f(); } finally { U.q=s; } };
  psmReg('manager',()=>({ title:'Find a KPI', page:'KPI', placeholder:'Find a KPI — hours, comeback, parts…',
    get:()=>U.q, set:q=>{ U.q=q; if(q&&U.view!=='kpi'){ U.view='kpi'; U.pop=null; } const L=kRows(); if(L.length&&!L.some(k=>k.id===U.sel)){ U.sel=L[0].id; U.bf=null; U.bk=null; } rd(); },
    count:q=>({ n:mgQ(q,()=>kRows().length), of:mgQ('',()=>kRows().length) }),
    items:q=>q?mgQ(q,()=>kRows()).slice(0,8).map(k=>{ const o=kv(k); return { id:k.id, title:k.n, sub:[CAT[k.c][0], locked(k)?'needs data':fmt(k.u,o.v), o.t!=null?(o.ok?'on target':'target '+fmt(k.u,o.t)):''].filter(Boolean).join(' · ') }; }):[],
    pick:it=>{ goKpi(it.id); } }));
  PG.reg('manager', { H, U: () => U, input, change, fieldKey, keydown, after });"""),
])
