/* Parsec · pages/library · library-page.js
   The Library page: tabs (Fault codes, CBRs, TSBs, FSBs, Recalls, Models, Procedures), the search, the function-group filter, documents in Impact’s columns by function group, procedures with sortable columns, codes by module with their FTBs, adding by button or drop.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   usedOn roCtx docsOf codeRows view head tabs tools list procList docsList empty … (20 functions, 11 constants)
   state      ros
   uses       data/ kit/ library/ pages/ ro/ shell/ state/
   at load    on document keydown · on document dragleave · on document drop
*/
/* ============================== the Library page (Parsec 17.1) ==============================
   Tabs: Fault codes · CBRs · TSBs · FSBs · Recalls · Procedures (soon). A search box first, Volvo's function groups as
   a filter, and the list in Impact's columns, grouped by function group the way Impact shows them.
   Add documents (or drop them on the page) → library/intake.js asks before anything is filed.
   Opened from an RO (libOpenFor), the list starts narrowed to that truck and operation. */
  const esc = PG.e;
  const U = { tab: 'shop', q: '', fg: '', ro: null, op: null, open: null, sk: 'fgrp', sd: 1, tm: '', ty: '', tro: '', chk: false, olds: {} };   /* sk / sd: the Procedures column sorted, and which way · 17.3: tm / ty / tro the truck filter, chk To check, olds the older releases unfolded */
  const rd = () => { try{ PG.keepScroll(render); }catch(e){ render(); } };
  const ICP = { add: '<path d="M12 5v14M5 12h14"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    edit: '<path d="M4.5 19.5l1-4L15 6l3 3-9.5 9.5z"/>', del: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>', chev: '<path d="M9 6l6 6-6 6"/>' };
  const ic = (n, s) => `<svg class="tg-ic" viewBox="0 0 24 24" width="${s || 14}" height="${s || 14}" aria-hidden="true">${ICP[n] || ''}</svg>`;
  const kinds = () => LIB_KINDS;
  const pl = (n, w, ws) => n + ' ' + (n === 1 ? w : (ws || w + 's'));
  const words = q => String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
  const hit = (hay, W) => W.every(w => hay.indexOf(w) >= 0);

  /* ---------- what the page lists ---------- */
  /* how many ROs use each document */
  function usedOn(){
    const n = {};
    (STATE.ros || []).forEach(r => { const seen = {}; (r.operations || []).forEach(o => (o.docs || []).forEach(x => { if(!seen[x.id]){ seen[x.id] = 1; n[x.id] = (n[x.id] || 0) + 1; } })); });
    return n;
  }
  /* the RO the page was opened from: its codes, function groups and models */
  function roCtx(){
    const ro = U.ro && getRO(U.ro); if(!ro) return null;
    const ops = (ro.operations || []).filter(o => !U.op || o.id === U.op);
    const codes = {}, fg = {};
    ops.forEach(o => { (o.faults || []).forEach(f => { codes[libCodeKey(f)] = 1; }); const g = libOpFgrp(o); if(g) fg[g.slice(0, 2)] = 1; });
    const model = String(ro.model || ro.vehicle || '').toUpperCase().match(/\bV(NL|NR|NX|HD|AH|N)\b/);
    return { ro, op: U.op ? ops[0] : null, codes, fg, model: model ? model[0] : '' };
  }
  function docsOf(kind){
    const W = words(U.q), C = roCtx();
    return libDocs().filter(d => d && d.kind === kind).filter(d => {
      if(U.fg && String(d.fgrp || '').charAt(0) !== U.fg && !(U.fg === '-' && !d.fgrp)) return false;
      if(C){ const byCode = (d.codes || []).some(k => C.codes[k]), byFg = d.fgrp && C.fg[String(d.fgrp).slice(0, 2)], byModel = C.model && String(d.model || '').toUpperCase().indexOf(C.model.slice(0, 2)) >= 0;
        if(!(byCode || byFg || (d.kind === 'recall' && (byModel || !d.model)))) return false; }
      if(!passFilters(d)) return false;
      return !W.length || hit([d.num, d.rel, d.title, d.model, d.years, d.fgrp, libFgName(d.fgrp), (d.codes || []).join(' '), (d.symp || []).join(' ')].join(' ').toLowerCase(), W);
    }).sort((a, b) => String(a.fgrp || '~').localeCompare(String(b.fgrp || '~')) || String(a.num).localeCompare(String(b.num)) || String(b.rel || '').localeCompare(String(a.rel || '')));
  }
  /* the codes: read from bulletins, then the built-in J1939 list */
  function codeRows(){
    const W = words(U.q), C = roCtx(), rows = libCodesAll().slice();
    Object.keys(LIB_SPN).forEach(n => { const k = 'SPN ' + n; if(!rows.some(r => r.key === k)) rows.push({ id: 'b' + n, key: k, title: LIB_SPN[n], mod: 'J1939', fgrp: '', builtIn: true, ftb: {} }); });
    return rows.filter(r => {
      if(U.fg && String(r.fgrp || '').charAt(0) !== U.fg && !(U.fg === '-' && !r.fgrp)) return false;
      if(C && !C.codes[r.key]) return false;
      if(!W.length) return true;
      const ft = Object.keys(r.ftb || {}).map(n => n + ' ' + (r.ftb[n].d || '') + ' ' + (r.ftb[n].s || '')).join(' ');
      return hit([r.key, r.title, (r.alt || []).join(' '), r.mod, ft].join(' ').toLowerCase(), W);
    });
  }

  /* ---------- the page ---------- */
  function view(){
    if(U.tab !== 'codes' && U.tab !== 'shop' && !libKind(U.tab)) U.tab = 'shop';
    return `<div class="tg lib" data-pg="library">${head()}${tabs()}<div class="lib-body">${tools()}<div class="lib-list" id="lib-list">${list()}</div></div>
      <input type="file" id="lib-file" accept=".pdf,application/pdf,image/*" multiple hidden data-ch="file"></div>`;
  }
  function head(){
    return `<header class="tg-head lib-head"><h1 class="tg-h1">Library</h1>${headBar()}
      <span class="lib-hsp"></span><button class="lib-add" data-a="add" title="Add Volvo documents — Parsec reads them and asks before filing">${ic('add', 14)}Add documents</button></header>`;
  }
  function tabs(){
    const n = { codes: codeRows().length };
    kinds().forEach(k => { if(!k.page) n[k.k] = libDocs().filter(d => d && d.kind === k.k).length; });
    n.models = libModelsN();
    const shopN = forShop().length;
    return `<nav class="lib-tabs" role="tablist" aria-label="Library"><button class="lib-tab k-shop${U.tab === 'shop' ? ' on' : ''}" role="tab" aria-selected="${U.tab === 'shop'}" data-a="tab" data-k="shop" title="The documents that fit the trucks on the open ROs"><i></i>For the shop<small>${shopN}</small></button>${kinds().map(k => `<button class="lib-tab k-${k.k}${U.tab === k.k ? ' on' : ''}" role="tab" aria-selected="${U.tab === k.k}" data-a="tab" data-k="${k.k}"><i></i>${esc(k.tab)}<small>${n[k.k] || 0}</small></button>`).join('')}</nav>`;
  }
  function tools(){
    const C = roCtx();
    const docTab = U.tab === 'shop' || !!SHOP_KINDS[U.tab];
    const src = U.tab === 'codes' ? codeRows().concat([]) : libDocs().filter(d => d && d.kind === U.tab);
    const G = {}; src.forEach(x => { const g = String(x.fgrp || '').charAt(0) || '-'; G[g] = (G[g] || 0) + 1; });
    const fgs = Object.keys(G).sort((a, b) => (a === '-') - (b === '-') || a.localeCompare(b));
    const chip = (v, t, n) => `<button class="tg-chip${U.fg === v ? ' on' : ''}" data-a="fg" data-v="${v}">${esc(t)}${n != null ? `<small>${n}</small>` : ''}</button>`;
    return `<div class="lib-tools"><label class="lib-q">${ic('search', 15)}<input id="lib-q" data-in="q" value="${esc(U.q)}" placeholder="${U.tab === 'models' ? 'Find a model — VNL 760, VHD, 2019' : 'Search everything — CBR-2408, C10129B, P1050, slow gear changes'}" autocomplete="off" spellcheck="false" aria-label="Search the Library"></label>
      ${docTab ? truckChips() : fgs.length > 1 || U.fg ? `<div class="lib-fgs" role="group" aria-label="Function group">${chip('', 'All')}${fgs.map(g => chip(g, g === '-' ? 'No group' : g + ' ' + LIB_FG[g], G[g])).join('')}</div>` : ''}
      ${C ? `<div class="lib-ctx">For <b>RO ${esc(C.ro.roNumber || '')}</b>${C.op ? ` · OP ${(C.ro.operations || []).indexOf(C.op) + 1} ${esc(String(C.op.complaint || '').slice(0, 40))}` : ''}${C.model ? ' · ' + esc(C.model) : ''} — its codes, function groups${U.tab === 'recall' ? ' and recalls' : ''}<button class="lib-ctx-x" data-a="all" title="Show the whole Library">Show all ${ic('x', 12)}</button></div>` : ''}</div>`;
  }
  function list(){ if(String(U.q || '').trim() && U.tab !== 'models') return searchAll(); if(U.tab === 'shop') return shopList(); return U.tab === 'codes' ? codesList() : U.tab === 'models' ? libModelsHtml(U.q) : U.tab === 'proc' || U.tab === 'diag' ? procList(U.tab) : docsList(); }

  /* procedures: Impact's table with Model and Year, under function group headings; a column header sorts, again reverses */
  const PCOLS = [['fgrp', 'Fgrp'], ['title', 'Title'], ['info', 'Info type'], ['num', 'ID / Operation'], ['model', 'Model'], ['years', 'Year']];
  function procList(kind){
    const L = docsOf(kind), sk = U.sk, sd = U.sd;
    if(!L.length) return empty(libKind(kind));
    const val = d => sk === 'num' ? (d.opNo || d.num || '') : sk === 'years' ? String(d.years || '').replace(/\D.*$/, '') : String(d[sk] || '').toLowerCase();
    L.sort((a, b) => String(a.fgrp || '~').slice(0, 2).localeCompare(String(b.fgrp || '~').slice(0, 2)) || (val(a) < val(b) ? -sd : val(a) > val(b) ? sd : 0));
    let last = null, h = '';
    L.forEach(d => {
      const g = String(d.fgrp || ''), key = g ? g.slice(0, 2) : '-';
      if(key !== last){ last = key; h += `<div class="lib-gh">${g ? `<b class="mono">${esc(g.charAt(0))}</b>${esc(LIB_FG[g.charAt(0)] || '')}${LIB_FG[g.slice(0, 2)] ? `<i>›</i><b class="mono">${esc(g.slice(0, 2))}</b>${esc(LIB_FG[g.slice(0, 2)])}` : ''}` : 'No function group'}</div>`; }
      const P = d.proc, n = P ? P.steps.length : 0;
      h += `<div class="lib-row lib-prow" data-a="open" data-id="${esc(d.id)}" role="button" tabindex="0" title="Open the steps">
        <span class="lib-c-fg mono">${esc(g || '—')}</span><span class="lib-c-t"><b>${esc(d.title || '(no title)')}</b>${n ? `<small>${n} steps${P.tools.length ? ' · ' + P.tools.length + ' special tool' + (P.tools.length === 1 ? '' : 's') : ''}</small>` : ''}</span>
        <span class="lib-c-k">${d.info ? `<span class="lib-it">${esc(d.info)}</span>` : ''}</span><span class="lib-c-n mono">${esc(d.opNo || d.num)}</span>
        <span class="lib-c-d">${esc(d.model || '')}</span><span class="lib-c-d mono">${esc(d.years || '')}</span>
        <span class="lib-c-a"><button class="lib-ib" data-a="edit" data-id="${esc(d.id)}" title="Change its details">${ic('edit', 13)}</button><button class="lib-ib" data-a="del" data-id="${esc(d.id)}" title="Take it out of the Library">${ic('del', 13)}</button></span></div>`;
    });
    return `<div class="lib-cols lib-pcols">${PCOLS.map(c => `<button class="lib-sort${sk === c[0] ? ' on' : ''}" data-a="sort" data-k="${c[0]}" aria-sort="${sk === c[0] ? (sd > 0 ? 'ascending' : 'descending') : 'none'}" title="Sort by ${esc(c[1].toLowerCase())}">${esc(c[1])}<i>${sk === c[0] ? (sd > 0 ? '↑' : '↓') : '↕'}</i></button>`).join('')}<span></span></div>${h}`;
  }

  /* documents: cards under the function group headings (17.3) */
  function docsList(){
    const L = docsOf(U.tab), k = libKind(U.tab);
    if(!L.length) return empty(k);
    const G = {}, order = [];
    L.forEach(d => { const g = String(d.fgrp || ''), key = g ? g.slice(0, 2) : '-'; if(!G[key]){ G[key] = { g, L: [] }; order.push(key); } G[key].L.push(d); });
    return order.map(key => { const g = G[key].g;
      return `<div class="lib-gh">${g ? `<b class="mono">${esc(g.charAt(0))}</b>${esc(LIB_FG[g.charAt(0)] || '')}${LIB_FG[g.slice(0, 2)] && g.length > 1 ? `<i>›</i><b class="mono">${esc(g.slice(0, 2))}</b>${esc(LIB_FG[g.slice(0, 2)])}` : ''}` : 'No function group'}</div>` + cards(G[key].L); }).join('');
  }
  function empty(k){
    const C = roCtx();
    if(U.q || U.fg || C || truckOn()) return `<div class="lib-none">Nothing matches${C ? ' this RO' : truckOn() ? ' the truck filter' : ''}. <button class="link-btn" data-a="all">Show the whole ${esc(k ? k.tab : 'list')}</button></div>`;
    return `<div class="lib-none lib-drop"><b>No ${esc(k ? k.tab : 'documents')} yet.</b><span>Add the PDFs from Impact or the dealer portal. Parsec reads the number, title and codes, and asks before filing.</span><button class="lib-add" data-a="add">${ic('add', 14)}Add documents</button></div>`;
  }

  /* codes: grouped by module, the FTBs on each */
  function codesList(){
    const L = codeRows();
    if(!L.length) return empty({ tab: 'codes' });
    const by = {}; L.forEach(r => { const m = r.mod || 'Other'; (by[m] = by[m] || []).push(r); });
    const mods = Object.keys(by).sort((a, b) => (a === 'J1939') - (b === 'J1939') || a.localeCompare(b));
    const keys = (o) => Object.keys(o || {}).sort((a, b) => (+a) - (+b));
    let h = '';
    mods.forEach(m => {
      const R = by[m].sort((a, b) => { const na = /^(SPN|MID) /.test(a.key), nb = /^(SPN|MID) /.test(b.key); return na && nb ? a.key.localeCompare(b.key, 'en', { numeric: true }) : (a.key < b.key ? -1 : a.key > b.key ? 1 : 0); })   /* P1050 before P105A, SPN 84 before SPN 100 */, src = R[0].doc && libDocById(R[0].doc), fg = R[0].fgrp;
      h += `<div class="lib-gh"><b class="mono">${esc(m)}</b>${m === 'J1939' ? 'Standard SPNs · built in · FMI 0–31 apply to each' : (fg ? esc(libFgName(fg)) : '')}${src ? `<i>·</i>from <button class="link-btn" data-a="open" data-id="${esc(src.id)}">${esc(libDocChipText(src))}</button>` : ''}<span class="lib-gh-n">${pl(R.length, 'code')}</span></div>`;
      R.forEach(r => {
        const on = U.open === r.key, F = keys(r.ftb), D = r.builtIn ? [] : libDocsForCode(r.key);
        h += `<div class="lib-row lib-code${on ? ' on' : ''}" data-a="code" data-k="${esc(r.key)}" role="button" tabindex="0" aria-expanded="${on}">
          <span class="lib-c-code"><span class="lib-fc"><i></i><span class="mono">${esc(r.key)}</span></span></span>
          <span class="lib-c-t"><b>${esc(r.title || 'See the document')}</b>${(r.alt || []).length ? `<small>also: ${esc(r.alt.join(' · '))}</small>` : ''}</span>
          <span class="lib-c-ftb">${F.length ? F.map(n => `<span class="lib-ftb mono" title="FTB ${esc(n)} — ${esc(r.ftb[n].d || '')}">${esc(n)}</span>`).join('') : (r.builtIn ? '<small>FMI</small>' : '')}</span>
          <span class="lib-c-u">${D.length ? pl(D.length, 'document') : ''}</span>${ic('chev', 13)}</div>`;
        if(on) h += `<div class="lib-ftbs">${F.map(n => `<div class="lib-ftb-r"><b class="mono">FTB ${esc(n)}</b><span>${esc(r.ftb[n].d || '—')}${r.ftb[n].s ? `<small>${esc(r.ftb[n].s)}</small>` : ''}</span></div>`).join('')
          || (r.builtIn ? `<div class="lib-ftb-r"><b class="mono">FMI</b><span>Typed with the code — SPN ${esc(r.key.slice(4))} FMI 2 reads as “${esc(r.title)} — erratic or intermittent”.</span></div>` : '<div class="lib-ftb-r"><span>No FTBs listed for it.</span></div>')}
          ${D.length ? `<div class="lib-ftb-d">${D.map(d => `<button class="lib-chip k-${esc(d.kind)}" data-a="open" data-id="${esc(d.id)}"${r.page && r.doc === d.id ? ` data-page="${r.page}"` : ''} title="Open ${esc(libDocChipText(d))}${r.page && r.doc === d.id ? ' at page ' + r.page : ''}"><i></i>${esc(libDocChipText(d))}${r.page && r.doc === d.id ? ` · p. ${r.page}` : ''}</button>`).join('')}</div>` : ''}</div>`;
      });
    });
    return h;
  }

  /* ---------- doing things ---------- */
  function relist(){ const el = document.getElementById('lib-list'); if(el) el.innerHTML = list(); else rd(); }
  function pick(){ const f = document.getElementById('lib-file'); if(f){ f.value = ''; f.click(); } }
  function intake(files){ if(files && files.length) libIntake(files, null, r => { if(r.filed.length){ const k = r.filed[r.filed.length - 1].kind; if(k && k !== U.tab){ U.tab = r.filed.some(d => d.kind === U.tab) ? U.tab : k; } } rd(); }); }
  const H = {
    tab: tt => { U.tab = tt.dataset.k; U.fg = ''; U.open = null; rd(); },
    fg: tt => { U.fg = U.fg === tt.dataset.v ? '' : tt.dataset.v; rd(); },
    all: () => { U.ro = null; U.op = null; U.q = ''; U.fg = ''; U.tm = ''; U.ty = ''; U.tro = ''; U.chk = false; rd(); },
    add: () => pick(),
    open: tt => libOpen(tt.dataset.id, tt.dataset.page, viewCtx()),
    older: tt => { const k = tt.dataset.k; U.olds[k] = !U.olds[k]; relist(); },
    chk: () => { U.chk = !U.chk; if(U.chk && (U.tab === 'shop' || U.tab === 'codes' || U.tab === 'models')){ const d = libDocs().filter(x => missing(x).length)[0]; if(d) U.tab = d.kind; } rd(); },
    tm: tt => { U.tm = U.tm === tt.dataset.v ? '' : tt.dataset.v; rd(); },
    tclear: () => { U.tm = ''; U.ty = ''; U.tro = ''; U.chk = false; rd(); },
    sort: tt => { const k = tt.dataset.k; if(U.sk === k) U.sd = -U.sd; else { U.sk = k; U.sd = k === 'years' ? -1 : 1; } relist(); },
    code: tt => { U.open = U.open === tt.dataset.k ? null : tt.dataset.k; relist(); },
    edit: tt => { const d = libDocById(tt.dataset.id); if(d) libEdit(d, () => rd()); },
    del: tt => { const d = libDocById(tt.dataset.id); if(!d) return;
      pgAsk({ head: 'Take ' + libDocChipText(d) + ' out of the Library?', sub: 'ROs that used it keep their copy in Attachments. The file stays in Parsec Data/Library.', buttons: [{ k: 'no', l: 'Keep it' }, { k: 'yes', l: 'Take it out', pri: true }] },
        k => { if(k !== 'yes') return; pushUndo('library'); libRemove(d); try{ libClose(); }catch(e){} rd(); pushToast(libDocChipText(d) + ' is out of the Library.'); }); }
  };
  function input(tt){ if(tt.dataset.in === 'q'){ U.q = tt.value; relist(); } }
  function change(tt){ if(tt.dataset.ch === 'file') intake(tt.files); else if(tt.dataset.ch === 'ty' || tt.dataset.ch === 'tro'){ U[tt.dataset.ch] = tt.value; rd(); } }
  function keydown(ev){
    if(ev.ctrlKey || ev.metaKey || ev.altKey || PG.typing(ev)) return;
    if(ev.key === '/'){ const q = document.getElementById('lib-q'); if(q){ ev.preventDefault(); q.focus(); } }
  }
  /* Enter or Space on a focused row does what a click does */
  document.addEventListener('keydown', ev => {
    if(ev.key !== 'Enter' && ev.key !== ' ') return;
    const r = ev.target && ev.target.closest && ev.target.closest('[data-pg="library"] .lib-row'); if(!r || ev.target !== r) return;
    ev.preventDefault(); const f = H[r.dataset.a]; if(f) f(r);
  });
  /* drop documents anywhere on the page */
  ['dragenter', 'dragover'].forEach(n => document.addEventListener(n, e => { const p = e.target.closest && e.target.closest('[data-pg="library"]'); if(!p || !e.dataTransfer || Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') < 0) return; e.preventDefault(); p.classList.add('drag'); }));
  document.addEventListener('dragleave', e => { const p = e.target.closest && e.target.closest('[data-pg="library"]'); if(p && !p.contains(e.relatedTarget)) p.classList.remove('drag'); });
  document.addEventListener('drop', e => { const p = e.target.closest && e.target.closest('[data-pg="library"]'); if(!p) return; e.preventDefault(); p.classList.remove('drag'); intake(e.dataTransfer && e.dataTransfer.files); });
  PG.reg('library', { H, U: () => U, input, change, keydown });

  /* from an RO: the Library narrowed to this truck and operation; tab = where to start */
  function openFor(ro, op, tab){
    U.ro = ro ? ro.id : null; U.op = op ? op.id : null; U.q = ''; U.fg = ''; U.open = null;
    if(tab) U.tab = tab; else if(op && (op.faults || []).length) U.tab = 'codes';
    UI.view = 'library'; UI.modal = null; try{ persistUI(); }catch(e){}
    render(); try{ window.scrollTo(0, 0); }catch(e){}
  }
  return { view, U: () => U, openFor };
