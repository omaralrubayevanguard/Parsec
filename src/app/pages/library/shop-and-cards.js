/* Parsec · pages/library · shop-and-cards.js
   The Library page (17.3): For the shop (the documents that fit the open ROs), the bar by kind and what needs you, one search across every kind, the truck filter, To check, the document cards with older releases folded, and the panel opened by pointing at a row.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   forShop missing passTruck headBar truckChips card cards shopList searchAll viewCtx SHOP_KINDS checkN … (10 functions, 4 constants)
   state      ros
   uses       kit/ library/ ro/ state/
*/
/* ============================== the Library page, 17.3 ==============================
   For the shop: every document (its newest release) that matches an open RO by its codes or its symptoms and doesn't
   contradict the truck, and every recall that fits one. The bar at the top counts by kind and says what needs you.
   A search looks in every kind at once. The truck filter (model · year · Fits RO …) and To check narrow any list.
   Documents are cards: the kind's colour, the title, the trucks and years in words, the number and release, the ROs
   it's on; older releases fold under the newest. Pointing at a card opens it in the panel; a click keeps it there. */
  const SHOP_KINDS = { cbr: 1, tsb: 1, fsb: 1, recall: 1 };
  function forShop(){
    const out = {};
    libOpenRos().forEach(ro => {
      const keys = {}; let cmp = '';
      (ro.operations || []).forEach(o => { if(o.declined) return; (o.faults || []).forEach(f => { keys[libCodeKey(f)] = 1; }); cmp += ' ' + [o.complaint, o.cause].join(' '); });
      libDocs().forEach(d0 => {
        if(!d0 || !SHOP_KINDS[d0.kind]) return; const d = libLatest(d0);
        const fit = libFits(d, ro); if(fit && !fit.ok) return;
        const byCode = (d.codes || []).some(k => keys[k]), sym = byCode ? '' : libSympHit(d, cmp);
        const why = byCode ? 'its code' : sym ? '“' + sym + '”' : d.kind === 'recall' && fit && fit.ok ? 'the truck' : '';
        if(!why) return;
        const e = out[d.id] || (out[d.id] = { d, ros: [] });
        if(!e.ros.some(x => x.ro === ro)) e.ros.push({ ro, why });
      });
    });
    return Object.keys(out).map(k => out[k]).filter(e => passFilters(e.d)).sort((a, b) => b.ros.length - a.ros.length || String(b.d.date || '').localeCompare(String(a.d.date || '')));
  }
  /* what a document is missing, for To check */
  function missing(d){
    if(!d || d.kind === 'codes') return [];
    const m = [];
    if(!d.title) m.push('title');
    if(SHOP_KINDS[d.kind]){ if(!d.date) m.push('date'); if(!d.model) m.push('trucks'); }
    return m;
  }
  const checkN = () => libDocs().filter(d => missing(d).length).length;
  /* the truck filter: model, year, Fits RO … — a document that doesn't say passes model and year */
  function passTruck(d){
    if(U.tm){ const L = String(d.model || '').toUpperCase().split(/[,\s]+/).filter(Boolean);
      if(L.length && !L.some(x => x === U.tm || (x === 'VN' && /^VN/.test(U.tm)) || (U.tm === 'VN' && /^VN/.test(x)))) return false; }
    if(U.ty){ const y = +U.ty, m = /^((?:19|20)\d\d)(?:–((?:19|20)\d\d)|(\+))?$/.exec(String(d.years || ''));
      if(m){ const lo = +m[1], hi = m[2] ? +m[2] : m[3] ? 9999 : lo; if(y < lo || y > hi) return false; } }
    if(U.tro){ const ro = getRO(U.tro), f = ro && libFits(d, ro); if(!f || !f.ok) return false; }
    return true;
  }
  const passFilters = d => passTruck(d) && (!U.chk || missing(d).length > 0);
  const truckOn = () => !!(U.tm || U.ty || U.tro || U.chk);
  /* the bar by kind, and what needs you */
  function headBar(){
    const D = libDocs(), by = {}; D.forEach(d => { if(d) by[d.kind] = (by[d.kind] || 0) + 1; });
    const K = kinds().filter(k => by[k.k]), N = D.length || 1;
    const m0 = new Date(); m0.setDate(1); m0.setHours(0, 0, 0, 0);
    const usedM = {}; (STATE.ros || []).forEach(r => (r.operations || []).forEach(o => (o.docs || []).forEach(x => { if(+new Date(x.at) >= +m0) usedM[x.id] = 1; })));
    const nU = Object.keys(usedM).length, nC = checkN();
    return `<span class="lib-hb">${K.length ? `<span class="lib-hbar" aria-hidden="true">${K.map(k => `<i class="k-${k.k}" style="width:${(by[k.k] / N * 100).toFixed(1)}%"></i>`).join('')}</span>` : ''}
      <span class="lib-hleg">${K.length ? K.map(k => `<span class="k-${k.k}"><i></i>${esc(k.tab)} <b>${by[k.k]}</b></span>`).join('') : '<span>No documents yet</span>'}</span>
      <span class="lib-hneed">${nC ? `<button class="lib-hn" data-a="chk" title="Show the documents missing their date, trucks or title"><b>${nC}</b> to check</button>` : ''}<span><b>${nU}</b> used this month</span></span></span>`;
  }
  /* the truck filter and To check, for the document lists */
  function truckChips(){
    const models = {}; libDocs().forEach(d => String(d && d.model || '').toUpperCase().split(/[,\s]+/).forEach(x => { if(/^(VNL|VNR|VNX|VHD|VAH|VN)$/.test(x)) models[x] = 1; }));
    const yr = new Date().getFullYear(), years = []; for(let y = yr + 1; y >= 2010; y--) years.push(y);
    const ros = libOpenRos();
    const nC = checkN();
    return `<div class="lib-truck" role="group" aria-label="Filter by truck">${Object.keys(models).sort().map(m => `<button class="tg-chip${U.tm === m ? ' on' : ''}" data-a="tm" data-v="${m}">${m}</button>`).join('')}
      <select class="lib-sel${U.ty ? ' on' : ''}" data-ch="ty" aria-label="Model year"><option value="">Any year</option>${years.map(y => `<option${String(U.ty) === String(y) ? ' selected' : ''}>${y}</option>`).join('')}</select>
      <select class="lib-sel${U.tro ? ' on' : ''}" data-ch="tro" aria-label="Fits an RO"><option value="">Fits RO …</option>${ros.map(r => `<option value="${esc(r.id)}"${U.tro === r.id ? ' selected' : ''}>${esc(libRoName(r))} · ${esc([r.model, r.year].filter(Boolean).join(' '))}</option>`).join('')}</select>
      ${nC ? `<button class="tg-chip lib-chk-c${U.chk ? ' on' : ''}" data-a="chk" title="The documents missing their date, trucks or title">To check<small>${nC}</small></button>` : ''}
      ${truckOn() ? `<button class="link-btn" data-a="tclear">Clear</button>` : ''}</div>`;
  }
  /* one card */
  function card(d, o){
    o = o || {};
    const used = o.used || {}, n = used[d.id] || 0, miss = missing(d), valid = [d.model, d.years].filter(Boolean).join(' · ');
    return `<div class="lib-row lib-card k-${esc(d.kind)}${o.old ? ' old' : ''}" data-a="open" data-id="${esc(d.id)}" role="button" tabindex="0" title="Open ${esc(libDocChipText(d))}">
      <i class="lib-cd-e"></i>
      <span class="lib-cd-m"><b>${esc(d.title || '(no title)')}</b><span class="lib-cd-tags">${valid ? `<span class="lib-tag">${esc(valid)}</span>` : ''}${d.fgrp ? `<span class="lib-tag"><span class="mono">${esc(d.fgrp)}</span> ${esc(String(libFgName(d.fgrp) || '').replace(/^\d+ /, ''))}</span>` : ''}${(d.codes || []).length ? `<span class="lib-tag">${pl(d.codes.length, 'code')}</span>` : ''}${miss.length ? `<span class="lib-tag miss">missing ${esc(miss.join(', '))}</span>` : ''}${o.old ? `<span class="lib-tag">replaced by rel ${esc(o.old)}</span>` : ''}</span>
        ${o.why ? `<span class="lib-cd-why">${o.why}</span>` : ''}</span>
      <span class="lib-cd-n"><span class="lib-chip k-${esc(d.kind)}"><i></i><span class="mono">${esc(d.num)}</span></span><small class="mono">${[d.rel ? 'rel ' + esc(d.rel) : '', esc(d.date || '')].filter(Boolean).join(' · ')}</small>${n ? `<small>on ${pl(n, 'RO')}</small>` : ''}${o.older ? `<button class="lib-older" data-a="older" data-k="${esc(d.kind + '|' + d.num)}" aria-expanded="${!!o.open}">${o.older} older ${o.open ? '‹' : '›'}</button>` : ''}${d.file && d.file.inBrowser ? '<em title="Kept in this browser until the shop folder is connected">this browser</em>' : ''}</span>
      <span class="lib-c-a"><button class="lib-ib" data-a="edit" data-id="${esc(d.id)}" title="Change its details">${ic('edit', 13)}</button><button class="lib-ib" data-a="del" data-id="${esc(d.id)}" title="Take it out of the Library">${ic('del', 13)}</button></span></div>`;
  }
  /* cards for a list of documents: the newest release of each, its older ones folded under it */
  function cards(L){
    const used = usedOn(), by = {}, order = [];
    L.forEach(d => { const k = d.kind + '|' + d.num; if(!by[k]){ by[k] = []; order.push(k); } by[k].push(d); });
    return order.map(k => {
      const R = by[k].sort((a, b) => (+b.rel || 0) - (+a.rel || 0)), top = R[0], open = !!U.olds[k];
      return card(top, { used, older: R.length - 1, open }) + (open ? R.slice(1).map(d => card(d, { used, old: top.rel || '—' })).join('') : '');
    }).join('');
  }
  /* For the shop */
  function shopList(){
    const L = forShop();
    if(!L.length) return `<div class="lib-none"><b>Nothing in the Library matches the trucks in the shop right now.</b><span>Documents show here when an open RO has their code or names their symptom, and recalls when they fit a truck.</span></div>`;
    const used = usedOn();
    return `<div class="lib-shop-h">${pl(L.length, 'document')} for ${pl(libOpenRos().length, 'open RO')}</div>` + L.map(e => card(e.d, { used, why: 'Fits ' + e.ros.slice(0, 4).map(x => `<b>${esc(libRoName(x.ro))}</b> <small>${esc(x.why)}</small>`).join(', ') + (e.ros.length > 4 ? ' +' + (e.ros.length - 4) : '') })).join('');
  }
  /* one search, every kind */
  function searchAll(){
    let h = '', n = 0;
    kinds().forEach(k => {
      if(k.k === 'codes'){ const C = codeRows().filter(r => !r.builtIn || U.q.length >= 2); if(C.length){ n += C.length; h += `<div class="lib-gh"><b>${esc(k.tab)}</b><span class="lib-gh-n">${C.length}</span></div>` + C.slice(0, 12).map(r => `<div class="lib-row lib-code" data-a="code" data-k="${esc(r.key)}" role="button" tabindex="0"><span class="lib-c-code"><span class="lib-fc"><i></i><span class="mono">${esc(r.key)}</span></span></span><span class="lib-c-t"><b>${esc(r.title || 'See the document')}</b></span><span class="lib-c-ftb"></span><span class="lib-c-u">${esc(r.mod || '')}</span>${ic('chev', 13)}</div>`).join(''); } return; }
      if(k.page && !k.file) return;
      const L = docsOf(k.k); if(!L.length) return; n += L.length;
      h += `<div class="lib-gh"><b>${esc(k.tab)}</b><span class="lib-gh-n">${L.length}</span></div>` + cards(L);
    });
    return n ? `<div class="lib-shop-h">Every kind · “${esc(U.q)}”</div>` + h : `<div class="lib-none">Nothing in the Library matches “${esc(U.q)}”.</div>`;
  }
  /* 17.3: the panel opens on a click only (pointing at a card did, for a while) */
  /* the RO the page was opened for, so the steps can be ticked */
  function viewCtx(){ const C = roCtx(); return C && C.op ? { ro: C.ro, op: C.op } : {}; }
