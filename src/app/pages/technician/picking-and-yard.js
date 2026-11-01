/* Parsec · pages/technician · picking-and-yard.js
   On the Technician page: picking several operations, copy / print, the Time tab's punches, and the Yard (the shop floor and the lot) with its own view.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   tcSelClear tcToggle tcCopy tcPrint tcPaperHead tcJacket tcPickList tcSelPop tcSelAct tcSelDo tcViewSet tcYdTitle … (22 functions, 9 constants)
   state      punches ros
   uses       access/ automations/ clock/ data/ kit/ pages/ pages/rolist/ pages/triage/ phone/ ro/ ro-page/ shell/ state/ trucks/
*/
  /* the Time tab: every punch from its start to its stop, with the notes written during it in between; notes written off the clock fall where their time is */
  /* ---------- the new blocks ---------- */
  /* ---------- picking several operations, or several parts on one, and acting on them together (Parsec 11.2) ----------
     A box shows when you point at a row (always on a phone); Ctrl click picks a row, Shift click picks a run of rows.
     The actions sit in a bar along the bottom. Parts are picked on one operation at a time. */
  const tcCur = () => { try{ return tcRos().find(x => x.id === TU.ro) || null; }catch(e){ return null; } };
  const tcSelOps = r => (r.ro.operations || []).filter(op => op && op.id && TU.selO[op.id]);
  const tcSelParts = r => { const op = TU.selPOp && getOp(r.id, TU.selPOp); return op ? opRealParts(op).filter(p => TU.selP[p.id]) : []; };
  const tcOpN = (r, op) => (r.ro.operations || []).indexOf(op) + 1;
  function tcSelClear(){ TU.selO = {}; TU.selP = {}; TU.selPOp = null; TU.lastSel = null; }
  function tcToggle(k, id, ev, opId){
    const r = tcCur(); if(!r) return;
    let ids, M;
    if(k === 'o'){ TU.selP = {}; TU.selPOp = null; M = TU.selO; ids = (r.ro.operations || []).filter(op => op && op.id).map(op => op.id); }
    else { if(TU.selPOp !== opId){ TU.selP = {}; TU.selPOp = opId; } TU.selO = {}; M = TU.selP; const op = getOp(r.id, opId); ids = op ? opRealParts(op).map(p => p.id) : []; }
    if(ev && ev.shiftKey && TU.lastSel && TU.lastSel.k === k && ids.indexOf(TU.lastSel.id) > -1){ const a = ids.indexOf(TU.lastSel.id), b = ids.indexOf(id); ids.slice(Math.min(a, b), Math.max(a, b) + 1).forEach(i => M[i] = 1); }
    else if(M[id]) delete M[id]; else M[id] = 1;
    if(k === 'p' && !Object.keys(TU.selP).length) TU.selPOp = null;
    TU.lastSel = { k, id }; U.pop = null; PG.keepScroll(render);
  }
  
  function tcCopy(text, msg){
    const fall = () => { const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); let ok = false; try{ ok = document.execCommand('copy'); }catch(e){} ta.remove(); pushToast(ok ? msg : 'Couldn’t copy — the browser blocked it.'); };
    try{ navigator.clipboard.writeText(text).then(() => pushToast(msg), fall); }catch(e){ fall(); }
  }
  /* print one sheet: built in the page for a moment, so the page's own styles go with it */
  function tcPrint(title, inner){ const host = document.querySelector('[data-pg="tech"]'); if(!host) return; const el = document.createElement('div'); el.className = 'tch-paper'; el.innerHTML = inner; host.appendChild(el); try{ PG.printPaper(el, title); }catch(e){ console.error(e); } el.remove(); }
  function tcPaperHead(r, what){ let tl = r.truck; try{ const t = trkLabel(r.ro); if(t && t !== 'this truck') tl = t; }catch(e){}
    let qr = ''; try{ const q = qrcode(0, 'L'); q.addData(keyTagCode(r.ro)); q.make(); qr = q.createSvgTag(3, 2); }catch(e){}
    return `<div class="tp-h"><div><small>${esc(what)}</small><h1>${esc(r.ro.roNumber || r.no)} · ${esc(r.cust)}</h1><p>${esc(tl)}${r.ro.unitNumber ? ' · Unit ' + esc(r.ro.unitNumber) : ''}${r.ro.vin ? ' · VIN ' + esc(r.ro.vin) : ''}</p><p>${esc(S.me || PG.me().name)} · printed ${esc(PG.whenL(Date.now()))}${r.ro.location ? ' · ' + esc(r.ro.location) : ''}</p></div>${qr ? `<div class="tp-qr">${qr}<small>Scan to switch</small></div>` : ''}</div>`; }
  function tcJacket(r, L){
    return tcPaperHead(r, 'Job jacket') + L.map(op => { const n = tcOpN(r, op), P = opRealParts(op), F = op.faults || [];
      return `<section class="tp-op"><h2>Op ${n} · ${esc(opJobType(op))} · ${esc(op.complaint || '')}<span>${h1(+op.quoted || 0)} h quoted</span></h2>${F.length ? `<p class="tp-c">Codes: ${esc(F.map(tcFc).join(', '))}</p>` : ''}${P.length ? `<table><tr><th></th><th>Part</th><th>Number</th><th>Qty</th><th>Status</th></tr>${P.map(p => `<tr><td>☐</td><td>${esc(p.description || '')}</td><td>${esc(p.partNumber || '')}</td><td>${esc(p.qty || 1)}</td><td>${esc(p.status || 'Not Ordered')}</td></tr>`).join('')}</table>` : ''}<div class="tp-l"><b>Cause</b><i></i><i></i><b>Correction</b><i></i><i></i></div></section>`; }).join(''); }
  function tcPickList(r, op, P){
    return tcPaperHead(r, 'Pick list · Op ' + tcOpN(r, op) + ' — ' + (op.complaint || '')) + `<table class="tp-pl"><tr><th></th><th>Part number</th><th>Description</th><th>Qty</th><th>Status</th></tr>${P.map(p => `<tr><td>☐</td><td>${esc(p.partNumber || '—')}</td><td>${esc(p.description || '')}</td><td>${esc(p.qty || 1)}</td><td>${esc(p.status || 'Not Ordered')}</td></tr>`).join('')}</table>`; }
  /* the bar along the bottom */
  
  /* the bar's pop-overs */
  function tcSelPop(){
    const p = U.pop, r = tcCur(); if(!p || !r || !/^ts/.test(p.type)) return '';
    const L = p.only ? (r.ro.operations || []).filter(op => op && op.id === p.only) : tcSelOps(r), P = tcSelParts(r), x = `<button class="btn btn-sm ib" data-a="popx">${ic('x', 14)}</button>`;
    const opsTxt = L.map(op => 'Op ' + tcOpN(r, op)).join(', ');
    if(p.type === 'tsh'){ const pt = PG.person('Parts'), wr = (function(){ try{ return rtPerson('writer'); }catch(e){ return ''; } })(), fm = PG.person('Foreman');
      return `<div class="tg-pop menu mq-pop-m"><div class="tg-ph"><b>Put ${esc(opsTxt)} on hold</b><span class="cu">they go to Waiting</span></div>${[['Waiting – Parts', (pt ? PG.first(pt) : 'Parts') + ' gets one note for all of them'], ['Waiting – Sublet', (wr ? PG.first(wr) : 'The writer') + ' gets them to send out'], ['Waiting – Approval', (wr ? PG.first(wr) : 'The writer') + ' gets them to send the estimate'], ['Waiting – Tech Support', 'Waiting on a Volvo case'], ['Waiting – Foreman', (fm ? PG.first(fm) : 'The foreman') + ' gets them']].map(z => `<button class="tg-mi cq-mi" data-a="tsdo" data-v="hold" data-st="${z[0]}"><b>${z[0]}</b><span class="meta">${esc(z[1])}</span></button>`).join('')}</div>`; }
    if(p.type === 'tsm'){ const T = (r.ro.operations || []).filter(op => op && op.id && op.id !== TU.selPOp && !op.declined);
      return `<div class="tg-pop menu mq-pop-w"><div class="tg-ph"><b>Move ${P.length} part${P.length === 1 ? '' : 's'} to</b></div>${T.map(op => `<button class="tg-mi cq-mi" data-a="tsdo" data-v="move" data-to="${op.id}"><span class="tg-no">Op ${tcOpN(r, op)}</span><b>${esc(op.complaint || '')}</b></button>`).join('') || '<div class="mq-none" style="padding:8px 10px">No other operation on this RO.</div>'}</div>`; }
    if(p.type === 'tsa'){ const to = p.who === 'parts' ? PG.person('Parts') : PG.person('Foreman'), toF = to ? PG.first(to) : p.who === 'parts' ? 'Parts' : 'the foreman';
      const what = P.length ? P.map(z => (z.description || z.partNumber) + (z.partNumber ? ' (' + z.partNumber + ')' : '')).join(', ') : opsTxt;
      return `<div class="tg-pop xf mq-pop-w"><div class="tg-ph"><b>Ask ${esc(toF)}</b><span class="cu">about ${esc(what)}</span>${x}</div><textarea class="cq-ta" data-in="tsq" placeholder="${P.length ? 'Need more, wrong part, is it here yet…' : 'What do you need?'} One note, about all of them.">${esc(TU.dr.tsq || '')}</textarea><div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm btn-primary" data-a="tsdo" data-v="ask">${ic('send', 13)}Send to ${esc(toF)}</button></div></div>`; }
    if(p.type === 'tsd'){ let nPt = 0, nPu = 0, run = false; L.forEach(op => { nPt += (op.parts || []).length; STATE.punches.forEach(q => { if(q.opId === op.id){ nPu++; if(!q.stop) run = true; } }); });
      return `<div class="tg-pop xf mq-pop-w"><div class="tg-ph"><b>Delete ${esc(opsTxt)}?</b><span class="cu">${esc(r.no)}</span>${x}</div><p class="rq-delp" style="margin:6px 12px 8px">${esc(L.map(op => 'Op ' + tcOpN(r, op) + ' — ' + (op.complaint || 'Operation')).join('\n'))}</p><div class="tg-pft" style="margin:0 12px">${ic('info', 12)}${nPt || nPu ? (L.length === 1 ? 'Its ' : 'Their ') + nPt + ' part line' + (nPt === 1 ? '' : 's') + (nPu ? ' and ' + nPu + ' time punch' + (nPu === 1 ? '' : 'es') : '') + (nPt + nPu === 1 ? ' goes' : ' go') + ' too' : 'Nothing else goes with ' + (L.length === 1 ? 'it' : 'them')}${run ? ' — the clock running on one stops' : ''}. Undo brings them back.</div><div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm tch-danger" data-a="tsdo" data-v="del">${ic('trash', 13)}Delete ${L.length}</button></div></div>`; }
    if(p.type === 'tsn') return `<div class="tg-pop xf mq-pop-w"><div class="tg-ph"><b>A note on ${esc(opsTxt)}</b><span class="cu">each one gets it, with the time</span>${x}</div><label class="tch-box tch-in" style="margin:6px 12px 0">${ic('pencil', 13)}<input data-in="tsn" value="${esc(TU.dr.tsn || '')}" placeholder="What you found, what you did… Enter saves it"></label><div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm btn-primary" data-a="tsdo" data-v="note">Save on ${L.length}</button></div></div>`;
    if(p.type === 'tsc') return `<div class="tg-pop xf mq-pop-m"><div class="tg-ph"><b>Add a code to ${esc(opsTxt)}</b>${x}</div><label class="tch-box tch-in" style="margin:6px 12px 0">${ic('plus', 13)}<input data-in="tsc" value="${esc(TU.dr.tsc || '')}" placeholder="3226/2 or P0401 — Enter adds it"></label><div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm btn-primary" data-a="tsdo" data-v="code">Add to ${L.length}</button></div></div>`;
    return '';
  }
  const tcFocusIn = sel => setTimeout(() => { const i = document.querySelector('[data-pg="tech"] ' + sel); if(i){ i.focus(); try{ i.setSelectionRange(i.value.length, i.value.length); }catch(e){} } }, 30);
  function tcSelAct(t){
    const r = tcCur(), v = t.dataset.v; if(!r) return;
    const L = tcSelOps(r), M = L.map(op => opBy(op.id)).filter(Boolean), live = M.filter(o => stOf(o) !== 'done'), P = tcSelParts(r), pop = (type, extra) => { U.pop = Object.assign({ type }, extra || {}); PG.anchor(U, t); PG.keepScroll(render); };
    if(v === 'start'){ if(M.length === 1){ tcSelClear(); startOp(M[0]); } return; }
    if(v === 'hold') return pop('tsh');
    if(v === 'askp' || v === 'pask'){ pop('tsa', { who: 'parts' }); return tcFocusIn('[data-in="tsq"]'); }
    if(v === 'askf'){ pop('tsa', { who: 'foreman' }); return tcFocusIn('[data-in="tsq"]'); }
    if(v === 'note'){ pop('tsn'); return tcFocusIn('[data-in="tsn"]'); }
    if(v === 'code'){ pop('tsc'); return tcFocusIn('[data-in="tsc"]'); }
    if(v === 'pmove') return pop('tsm');
    if(v === 'del') return pop('tsd');
    if(v === 'done'){ const ok = [], no = [];
      live.forEach(o => { const g = opCompleteGaps(o.op); if(g.length) no.push('Op ' + o.opn + ': ' + g.map(z => z.t).join(', ')); else ok.push(o); });
      if(ok.length){ pushUndo('mark done'); commitNoteDrafts(); ok.forEach(o => { if(isRun(o)){ const rp = runningPunch(); if(rp){ rp.stop = nowIso(); rp.stopReason = 'Complete'; creditBurnt(rp); } } else o.op.jobStatus = { status: 'Complete', sub: null, setAt: nowIso(), hand: true }; }); scheduleSave(true); }
      tcSelClear(); render(); pushToast((ok.length ? ok.length + ' done' : 'None done') + (no.length ? ' · not yet — ' + no.join(' · ') : '') + '.', ok.length > 0); return; }
    if(v === 'print'){ tcPrint(r.no + ' job jacket', tcJacket(r, L)); return; }
    if(v === 'story'){ const live0 = raLive(r.ro), B = raStory(r.ro).split('\n\n'), txt = L.map(op => B[live0.indexOf(op)]).filter(Boolean).join('\n\n'); tcCopy((r.ro.roNumber || r.no) + ' · ' + r.cust + '\n\n' + txt, `Copied the story for ${L.length} operation${L.length === 1 ? '' : 's'} — paste it in ASIST or anywhere.`); return; }
    const op = getOp(r.id, TU.selPOp), o = opBy(TU.selPOp); if(!op) return;
    const setSt = (from, to, verb, why) => { const D = P.filter(p => from.indexOf(p.status || 'Not Ordered') > -1); if(!D.length) return;
      pushUndo('parts ' + verb); D.forEach(p => { p.status = to; p.statusChangedAt = nowIso(); if(to === 'Picked up') p.pickedBy = S.me; }); scheduleSave(true);
      if(o && (to === 'Picked up' || to === 'Returned')) note(PG.person('Parts'), 'fyi', o, `${PG.first(S.me)} ${to === 'Returned' ? 'is returning' : 'picked up'} ${D.length} part${D.length === 1 ? '' : 's'} for ${o.no}`, D.map(p => (p.description || p.partNumber) + (p.partNumber ? ' · ' + p.partNumber : '')).join('\n'));
      tcSelClear(); render(); pushToast(`${D.length} part${D.length === 1 ? '' : 's'} ${verb}${P.length > D.length ? ' · ' + (P.length - D.length) + ' skipped (' + why + ')' : ''}.`, true); };
    if(v === 'ppick') return setSt(['Staged'], 'Picked up', 'picked up', 'not staged');
    if(v === 'pinst') return setSt(['Picked up', 'Received', 'Staged'], 'Installed', 'installed', 'not in hand');
    if(v === 'pret') return setSt(['Not Ordered', 'Ordered', 'Backordered', 'Received', 'Staged', 'Picked up'], 'Returned', 'going back to Parts', 'installed or already returned');
    if(v === 'ppns'){ tcCopy(P.map(p => (p.partNumber || '—') + '\t' + (p.description || '') + '\t' + (p.qty || 1)).join('\n'), `Copied ${P.length} part number${P.length === 1 ? '' : 's'}.`); return; }
    if(v === 'plist'){ tcPrint(r.no + ' pick list', tcPickList(r, op, P)); return; }
  }
  function tcSelDo(t){
    const r = tcCur(), v = t.dataset.v; if(!r) return;
    const L = U.pop && U.pop.only ? (r.ro.operations || []).filter(op => op && op.id === U.pop.only) : tcSelOps(r), M = L.map(op => opBy(op.id)).filter(Boolean), live = M.filter(o => stOf(o) !== 'done'), P = tcSelParts(r), first = M[0] || opBy(TU.selPOp) || r.focus;
    const opsTxt = L.map(op => 'Op ' + tcOpN(r, op)).join(', ');
    if(v === 'del'){   /* Parsec 12.2: delete the picked operations, with their parts and time — Undo brings them back */
      const ids = L.map(op => op.id); if(!ids.length){ U.pop = null; render(); return; }
      pushUndo('delete ' + ids.length + ' operation' + (ids.length === 1 ? '' : 's')); try{ commitNoteDrafts(); }catch(e){}
      try{ audit('op-del', 'Deleted ' + opsTxt + ' on ' + roLabel(r.ro), r.ro); }catch(e){}
      STATE.punches = STATE.punches.filter(q => !(q.roId === r.id && ids.indexOf(q.opId) > -1));
      const arr = r.ro.operations || []; for(let i = arr.length - 1; i >= 0; i--) if(arr[i] && ids.indexOf(arr[i].id) > -1) arr.splice(i, 1);
      scheduleSave(true); U.pop = null; tcSelClear(); render(); pushToast(`${ids.length} operation${ids.length === 1 ? '' : 's'} deleted from ${r.no}.`, true); return; }
    if(v === 'hold'){ const st = t.dataset.st; if(!live.length) return;
      pushUndo('hold'); commitNoteDrafts(); live.forEach(o => { if(isRun(o)){ const rp = runningPunch(); if(rp){ rp.stop = nowIso(); rp.stopReason = st; creditBurnt(rp); } } else o.op.jobStatus = { status: st, sub: null, setAt: nowIso(), hand: true }; }); scheduleSave(true);
      const who = { 'Waiting – Parts': PG.person('Parts'), 'Waiting – Sublet': (function(){ try{ return rtPerson('writer'); }catch(e){ return ''; } })() || PG.person('Triage'), 'Waiting – Approval': (function(){ try{ return rtPerson('writer'); }catch(e){ return ''; } })() || PG.person('Triage'), 'Waiting – Foreman': PG.person('Foreman') }[st];
      if(who) note(who, st === 'Waiting – Foreman' ? 'ask' : 'fyi', live[0], `${live[0].no} — ${live.length} operation${live.length === 1 ? '' : 's'} waiting on you`, live.map(o => 'Op ' + o.opn + ' — ' + o.cmp).join('\n'));
      U.pop = null; tcSelClear(); render(); pushToast(`${live.length} on hold — ${st.toLowerCase()}.${who ? ' ' + PG.first(who) + ' has one note about them.' : ''}`, true); return; }
    if(v === 'ask'){ const to = U.pop && U.pop.who === 'parts' ? PG.person('Parts') : PG.person('Foreman'), txt = PG.inp('[data-in="tsq"]').trim(); if(!to){ pushToast('There’s no one in that role on the team yet.'); return; }
      const what = P.length ? P.map(z => (z.description || z.partNumber) + (z.partNumber ? ' · ' + z.partNumber : '') + ' · qty ' + (z.qty || 1)).join('\n') : L.map(op => 'Op ' + tcOpN(r, op) + ' — ' + (op.complaint || '')).join('\n');
      note(to, 'men', first, `${PG.first(S.me)} asked about ${P.length ? P.length + ' part' + (P.length === 1 ? '' : 's') : opsTxt} — ${r.no}`, what, txt);
      TU.dr.tsq = ''; U.pop = null; tcSelClear(); PG.keepScroll(render); pushToast(`Sent to ${PG.first(to)} — one note, under Messages on the RO.`); return; }
    if(v === 'note'){ const txt = String(TU.dr.tsn || PG.inp('[data-in="tsn"]') || '').trim(); if(!txt || !live.length) return;
      pushUndo('note on ' + live.length); live.forEach(o => addNote(o, txt)); scheduleSave(true); TU.dr.tsn = ''; U.pop = null; tcSelClear(); render(); pushToast(`Note saved on ${live.length} operation${live.length === 1 ? '' : 's'}.`, true); return; }
    if(v === 'code'){ const f = tcParseFc(TU.dr.tsc || PG.inp('[data-in="tsc"]')); if(!f){ pushToast('Type it as SPN/FMI — 3226/2 — or a P-code like P0401.'); return; } if(!live.length) return;
      const add = live.filter(o => !(o.op.faults || []).some(x => tcFc(x) === tcFc(f))); if(!add.length){ pushToast(`${tcFc(f)} is already on all of them.`); return; }
      pushUndo('fault code'); add.forEach(o => { o.op.faults = (o.op.faults || []).concat([Object.assign({ id: 'fc_' + uid() }, f)]); }); scheduleSave(true); TU.dr.tsc = ''; U.pop = null; tcSelClear(); render(); pushToast(`${tcFc(f)} added to ${add.length} operation${add.length === 1 ? '' : 's'}.`, true); return; }
    if(v === 'move'){ const from = getOp(r.id, TU.selPOp), to = getOp(r.id, t.dataset.to); if(!from || !to || !P.length) return;
      pushUndo('move parts'); const ids = P.map(p => p.id); to.parts = (to.parts || []).concat((from.parts || []).filter(p => ids.indexOf(p.id) > -1)); from.parts = (from.parts || []).filter(p => ids.indexOf(p.id) < 0); scheduleSave(true);
      U.pop = null; tcSelClear(); TU.open[to.id] = true; TU.tab[to.id] = 'parts'; render(); pushToast(`${P.length} part${P.length === 1 ? '' : 's'} moved to Op ${tcOpN(r, to)}.`, true); return; }
  }
  /* ---------- Parsec 12.5: the Yard — the shop floor and the parking lot, with your trucks lit up ----------
     The Triage yard map (the same one the Foreman's Yard view shows: bays with the trucks' top views, the check-in lanes,
     the lot rows), read-only here: your ROs in their list colors — working, assigned, waiting, done today — everyone
     else's dimmed. Point at a truck for its RO, customer, truck and status; click one of yours to open it. */
  const TYD_LANE = { run: 'Working', next: 'Assigned', wait: 'Waiting', done: 'Done today' };
  const TYD_CLS = { run: 'tyd-run', next: 'tyd-next', wait: 'tyd-wait', done: 'tyd-done' };
  function tcViewSet(v){ TU.view = v === 'yard' ? 'yard' : v === 'ros' && typeof rlEmbed === 'function' ? 'ros' : 'list'; try{ localStorage.setItem('parsec.tcView', TU.view); }catch(e){} }
  function tcYdTitle(ro, r){
    let tl = ''; try{ tl = truckLine(ro) || trkLabel(ro); }catch(e){ try{ tl = trkLabel(ro); }catch(er){} }
    const sp = tgSpotOf(ro), st = (() => { try{ return tgStTxt(ro); }catch(e){ return ''; } })();
    return ['RO ' + tgNum(ro), ro.customerName || '', tl && tl !== 'this truck' ? tl : '', st, (sp ? tgZone(sp) + ' ' + tgSpotLbl(sp) : ro.location || ''),
      r ? (S.view ? PG.first(S.me) + '’s · ' : 'Yours · ') + TYD_LANE[r.lane] : (ro.assignedTech ? PG.first(ro.assignedTech) + '’s' : 'No tech yet')].filter(Boolean).join(' · ');
  }
  function tcYard(all){
    const mine = {}; all.forEach(r => { mine[r.id] = r; });
    const runO = S.rp && !S.shop ? opBy(S.rp.opId) : null, here = runO ? runO.roId : null;
    const keep = { f: UI.tgFilter, c: UI.tgClash, p: UI.yardPick };
    let h = '';
    UI.tgFilter = null; UI.tgClash = null; UI.yardPick = null;
    try{ h = tgVYard(null); }catch(e){ console.error(e); h = ''; } finally { UI.tgFilter = keep.f; UI.tgClash = keep.c; UI.yardPick = keep.p; }
    if(!h) return '<div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">' + ic('pin', 22) + '</span><h3>No yard set up</h3><p>The yard map comes from the Triage page’s yard.</p></div></div>';
    /* only the shop floor, check-in and the lot: the warranty / released row goes, and the legend is this page's */
    const w0 = h.indexOf('<div class="tg-row2"><section class="tg-z" style="flex:1"><div class="tg-zh">Warranty');
    const lg = h.lastIndexOf('<div class="tg-leg">');
    if(w0 > -1){ let w1 = h.indexOf('<section class="tg-z"><div class="tg-zh">Elsewhere', w0); if(w1 < 0) w1 = lg; if(w1 > w0) h = h.slice(0, w0) + h.slice(w1); }
    /* the tiles: no dragging, no Triage actions; yours in your colors, the rest dimmed */
    h = h.replace(/ draggable="true" data-tg-drag="[^"]*"/g, '').replace(/ data-tg-drop="[^"]*"/g, '');
    h = h.replace(/<(div|button) class="tg-s ([^"]*)"([^>]*)>/g, (m, tag, cls, at) => {
      const id = (/ data-ro="([^"]+)"/.exec(at) || [])[1];
      cls = cls.replace(/\b(dim|tg-on)\b/g, '').replace(/\s+/g, ' ').trim();
      if(!id){ if(/\bclash\b/.test(cls)){ const t = (/ title="([^"]*)"/.exec(at) || [])[1] || ''; return '<' + tag + ' class="tg-s ' + cls + ' tyd-ot"' + (tag === 'button' ? ' type="button" tabindex="-1"' : '') + ' title="' + t + '">'; } return m; }
      const ro = getRO(id); if(!ro) return m;
      const r = mine[id], c2 = r ? 'tyd-me ' + TYD_CLS[r.lane] : 'tyd-ot';
      return '<' + tag + ' class="tg-s ' + cls + ' ' + c2 + (id === here ? ' tyd-here' : '') + (TU.ydSel === id ? ' tyd-sel' : '') + '" role="button" tabindex="0" data-a="tyd" data-ro="' + esc(id) + '" title="' + esc(tcYdTitle(ro, r)) + '"' + (r ? ' aria-label="Open ' + esc('RO ' + tgNum(ro)) + '"' : '') + '>' + (id === here ? '<span class="tyd-you">' + (S.view ? esc(PG.first(S.me)) : 'You') + '</span>' : '');
    });
    h = h.replace(/<span class="tg-elsi" data-action="tg-sel" data-ro="([^"]+)"/g, (m, id) => '<span class="tg-elsi' + (mine[id] ? ' tyd-me ' + TYD_CLS[mine[id].lane] : ' tyd-ot') + '" role="button" tabindex="0" data-a="tyd" data-ro="' + id + '"');
    h = h.replace(/ data-action="tg-sel"/g, '').replace(/ data-action="tg-clash"/g, '');
    h = h.replace('class="tg-yd', 'class="tg-yd tch-yd').replace('data-scroll="tg-yard"', 'data-scroll="tch-yard"');
    const leg = '<div class="tg-leg"><span><i class="tyd-lg tyd-run"></i>Working</span><span><i class="tyd-lg tyd-next"></i>Assigned</span><span><i class="tyd-lg tyd-wait"></i>Waiting</span><span><i class="tyd-lg tyd-done"></i>Done today</span><span><i class="tyd-lg tyd-ot"></i>Someone else’s</span><span><i class="tg-live"></i>On the clock</span><span class="hint">Click one of ' + (S.view ? 'theirs' : 'yours') + ' to open it · ' + kbd('Y') + ' back to the list</span></div>';
    const l2 = h.lastIndexOf('<div class="tg-leg">'); if(l2 > -1) h = h.slice(0, l2) + leg + '</div>';
    /* above the map: your trucks, where they are; Bring it in for one of yours on the lot */
    const L = all.filter(r => r.lane !== 'done');
    const chip = r => { const sp = tgSpotOf(r.ro), where = sp ? tgSpotLbl(sp) : (r.ro.location || 'No spot'), bring = r.lane === 'next' && !S.view && !!sp && !bayLike(sp) && !r.ro.cxBring;   /* on the yard (lot, check-in) and not in a bay */
      return '<span class="tyd-mc ' + TYD_CLS[r.lane] + '"><button type="button" data-a="tyd" data-ro="' + esc(r.id) + '" title="' + esc(tcYdTitle(r.ro, r)) + '"><i></i><b class="tg-no">' + esc(r.no) + '</b><span class="cu">' + esc(String(r.cust || '').split(' ')[0]) + '</span><small>' + ic('pin', 11) + esc(where) + '</small></button>'
        + (bring ? '<button type="button" class="btn btn-sm tyd-bring" data-a="tdo" data-v="bring" data-id="' + esc(r.focus.id) + '" title="Ask Triage to bring it to a bay">' + ic('triage', 13) + 'Bring it in</button>' : r.ro.cxBring && sp && !bayLike(sp) ? '<span class="tyd-asked">' + ic('check', 11) + 'asked to bring in</span>' : '') + '</span>'; };
    const now = runO ? '<span class="tyd-now"><i class="tg-live"></i>' + (S.view ? esc(PG.first(S.me)) + ' is' : 'You’re') + ' in <b>' + esc(tgSpotOf(runO.ro) ? tgSpotLbl(tgSpotOf(runO.ro)) : (runO.spot || 'no spot')) + '</b> on <span class="tg-no">' + esc(runO.no) + '</span></span>' : '';
    const mine0 = '<div class="tyd-mine"><span class="k">' + (S.view ? esc(PG.first(S.me)) + '’s trucks' : 'Your trucks') + '</span>' + now + (L.length ? L.map(chip).join('') : '<span class="tg-none">Nothing assigned to ' + (S.view ? esc(PG.first(S.me)) : 'you') + ' on the yard.</span>') + '</div>';
    /* tap someone else's truck: what it is, here (a phone has no hover) */
    const so = TU.ydSel && !mine[TU.ydSel] ? getRO(TU.ydSel) : null;
    const bar = so ? '<div class="tg-ybar tyd-bar">' + tgSq(tyCat(so)) + '<b class="tg-no">' + esc(roLabel(so)) + '</b><h3>' + esc(so.customerName || '') + '</h3><span class="at">' + ic('pin', 14) + esc(tgZone(tgSpotOf(so))) + ' <b class="tg-no">' + esc(tgSpotLbl(tgSpotOf(so)) || so.location || '—') + '</b></span><span class="stt">' + esc(tgStTxt(so)) + '</span><span class="tyd-bt">' + esc((() => { try{ const t = truckLine(so) || trkLabel(so); return t === 'this truck' ? '' : t; }catch(e){ return ''; } })()) + '</span><span class="sp"></span><span class="tyd-who">' + (so.assignedTech ? PG.av(so.assignedTech) + esc(PG.first(so.assignedTech)) + '’s' : 'No tech yet') + '</span><button class="btn btn-sm ib" data-a="tydx" aria-label="Close">' + ic('x', 14) + '</button></div>' : '';
    const i0 = h.indexOf('>', h.indexOf('class="tg-yd')) + 1;
    return h.slice(0, i0) + mine0 + bar + h.slice(i0);
  }
  function tcPane(r){
    if(r && r.del) return tcDonePane(r);   /* Parsec 14.7: a deleted RO you completed — its record */
    if(!r) return `<div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('tech', 22)}</span><h3>No repair orders yet</h3><p>${esc(PG.person('Foreman') ? PG.first(PG.person('Foreman')) + '’s' : 'The foreman’s')} order for today shows here.</p></div></div>`;
    const o = r.focus, s = stOf(o), fm = PG.person('Foreman'), fmF = fm ? PG.first(fm) : 'the foreman';
    const lastStop = !S.rp && !S.view ? STATE.punches.filter(p => p.stop && techSame(p.by, S.me) && r.ops.some(x => x.id === p.opId)).reduce((m, p) => Math.max(m, +new Date(p.stop)), 0) : 0;   /* Parsec 14.3: after a stop on the mounted RO page too */
    const nextUp = (U.justDone && r.ops.some(x => x.id === U.justDone)) || (lastStop && Date.now() - lastStop < 15 * 60000) ? (() => { const n = nextOps()[0]; return n ? `<div class="cq-nextup">${ic('spark', 14)}<span>Next${n.paused ? ' — paused' : ' in ' + (fm ? fmF + '’s' : 'the foreman’s') + ' order'}: <span class="tg-no">${esc(n.no)}</span> <b>${esc(n.cmp)}</b> · ${h1(n.q)} h</span><button class="btn btn-sm btn-primary" data-a="startid" data-id="${n.id}">${ic('play', 13)}Start it</button></div>` : ''; })() : '';
    const why = o.why && s === 'next' ? `<div class="cq-why">${ic('info', 13)}<span>${esc(o.why)}</span></div>` : '';
    const top = `${S.view ? '' : nudge()}${nextUp}${why}`;   /* Parsec 14.3: the Technician-only cards, above the RO page */
    return `<div class="mq-pane tch-pane tch-jcp" data-ro="${r.id}">${top ? `<div class="tch-top">${top}</div>` : ''}<div class="ro-detail-pane jc-pane tch-jc" data-jc="${r.id}"></div></div>`;
  }
  /* Parsec 11.3: the admin opens the Technician page too — for any technician: everyone on the Team as a technician, and anyone an open RO is assigned to */
  const TAS_KEY = 'tec_tech_as';
  const tcOpenRo = ro => !ro.shop && ro.id !== SHOP_RO_ID && !roIsDone(ro);
  function tcTechs(){
    const seen = {}, L = [], add = n => { n = String(n || '').trim(); const k = n.toLowerCase(); if(!n || seen[k]) return; seen[k] = 1; L.push(n); };
    staffList().filter(x => x.role === 'Technician').forEach(x => add(x.name));
    STATE.ros.forEach(ro => { if(tcOpenRo(ro)) add(ro.assignedTech); });
    return L.map(n => ({ n, ros: STATE.ros.filter(ro => tcOpenRo(ro) && techSame(ro.assignedTech, n)).length, run: STATE.punches.some(p => !p.stop && techSame(punchWho(p), n)) }));
  }
  function tcAs(){
    const T = tcTechs(); if(!T.length) return null;
    let n = TU.as; if(!n){ try{ n = localStorage.getItem(TAS_KEY) || ''; }catch(e){} }
    const hit = T.find(t => techSame(t.n, n)) || T.find(t => t.run) || T.slice().sort((a, b) => b.ros - a.ros)[0];
    TU.as = hit.n; return hit.n;
  }
  function tcAsPop(){
    const T = tcTechs();
    return `<div class="tg-pop menu mq-pop-w tch-asp"><div class="tg-ph"><b>Whose page</b><span class="cu">${T.length} technician${T.length === 1 ? '' : 's'}</span></div>${T.map(t => `<button class="tg-mi cq-mi${techSame(t.n, S.me) ? ' on' : ''}" data-a="tas" data-n="${esc(t.n)}">${PG.av(t.n)}<span class="tch-asn"><b>${esc(t.n)}</b><small>${t.run ? '<i class="cq-dot"></i>on the clock · ' : ''}${t.ros} open RO${t.ros === 1 ? '' : 's'}</small></span></button>`).join('')}</div>`;
  }
  function tcPop(){
    const p = U.pop; if(p && p.type === 'tas' && S.view) return tcAsPop();
    if(!p || p.type !== 'tfix') return ''; const o = opBy(U.sel); if(!o || !o.fix) return '';
    return `<div class="tg-pop xf mq-pop-w tch-fixp"><div class="tg-ph"><b>A past fix matches</b><span class="cu">${esc(o.fix.t)}</span><button class="btn btn-sm ib" data-a="popx">${ic('x', 14)}</button></div><ul>${o.fix.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ul><small>Fixed ${o.fix.n}× before${o.fix.by && o.fix.by !== '—' ? ' · last by ' + esc(o.fix.by) : ''}${o.fix.at ? ' · ' + esc(o.fix.at) : ''}${o.fix.avg ? ' · about ' + h1(o.fix.avg) + ' h' : ''}</small><div class="tg-acts"><button class="btn btn-sm" data-a="tdo" data-v="viewfix" data-id="${o.id}">View on Fixes</button><button class="btn btn-sm btn-primary" data-a="tdo" data-v="usefix" data-id="${o.id}">${ic('check', 13)}Use fix — put it in my notes</button></div></div>`;
  }
  function tcLb(){ const L = TU.lb; if(!L) return '';
    return `<div class="tch-lb" role="dialog" aria-label="${esc(L.name)}"><div class="tch-lbh"><b>${esc(L.name)}</b><span class="sp"></span><a class="btn btn-sm" href="${L.url}" download="${esc(L.name)}">${ic('download', 13)}Save a copy</a><button class="btn btn-sm ib" data-a="tlbx" aria-label="Close">${ic('x', 15)}</button></div><div class="tch-lbb">${/^image\//.test(L.type) ? `<img src="${L.url}" alt="">` : /pdf/.test(L.type) ? `<iframe src="${L.url}" title="${esc(L.name)}"></iframe>` : `<p>${esc(L.name)} — save a copy to open it.</p>`}</div></div>`; }
  function tcViews(){ return `<div class="tg-views tch-views" role="tablist">${[['list', 'list', S.view ? 'Their ROs' : 'My ROs'], ['yard', 'pin', 'Yard']].concat(typeof rlEmbed === 'function' ? [['ros', 'ros', 'ROs']] : []).map(x => `<button role="tab" aria-selected="${TU.view === x[0]}" class="${TU.view === x[0] ? 'on' : ''}" data-a="tvw" data-v="${x[0]}" title="${x[2]} (Y switches)">${ic(x[1], 14)}${x[2]}</button>`).join('')}</div>`; }
  function tcHead(){
    const D = dayStats(), n = nChk(), M = S.M, w = M.name;
    const f = `<span class="tg-hf" style="cursor:default">${PG.av(w)}${esc(w)}</span><i>·</i>${S.morning ? `<span class="tg-hf" style="cursor:default"><span class="cq-dot off"></span>Not clocked in yet</span>` : S.out ? `<span class="tg-hf" style="cursor:default"><span class="cq-dot off"></span>Clocked out${S.out.at ? ' · ' + esc(String(S.out.why).toLowerCase()) + ' since ' + clk(S.out.at) : ''}</span>` : `<span class="tg-hf" style="cursor:default"><span class="cq-dot"></span><b data-tk="cl">${dur(D.cl)}</b>on the clock</span>`}${S.morning ? '' : `<i>·</i><span class="tg-hf" style="cursor:default"><b>${D.eff == null ? '—' : Math.round(D.eff) + '%'}</b>efficiency today</span>`}${n ? `<i>·</i><button class="tg-hf w${U.pop && U.pop.type === 'chk' ? ' on' : ''}" data-a="pop" data-p="chk"><b>${n}</b>to fix in the Time Log</button>` : ''}`;
    const find = S.morning || TU.view === 'yard' ? '' : psmBtn('tech', 'Search my repair orders');   /* Parsec 13.1 — the icon opens the search window */
    const scan = S.morning || S.out ? '' : `<button class="btn btn-sm${U.pop && U.pop.type === 'scan' ? ' on' : ''}" data-a="pop" data-p="scan" style="height:30px" title="Scan a job jacket to switch">${ic('qr', 14)}Scan</button>`;
    const ck = S.morning ? `<button class="btn btn-sm btn-primary" data-a="morning" style="height:30px">${ic('play', 14)}Start my day</button>` : S.out ? `<button class="btn btn-sm btn-primary" data-a="cin" style="height:30px">${ic('play', 14)}Clock in</button>` : `<button class="btn btn-sm${U.pop && U.pop.type === 'out' ? ' on' : ''}" data-a="pop" data-p="out" style="height:30px">${ic('clock', 14)}Clock out${ic('chevD', 13)}</button>`;
    if(S.view){
      const fv = `<button class="tg-hf tch-as${U.pop && U.pop.type === 'tas' ? ' on' : ''}" data-a="pop" data-p="tas" title="Pick whose page to see" aria-haspopup="menu">${PG.av(w)}<b>${esc(w)}</b>${ic('chevD', 12)}</button><i>·</i><span class="tg-hf" style="cursor:default"><span class="cq-dot${S.rp ? '' : ' off'}"></span>${S.rp ? (S.shop ? 'On shop time' : 'On the clock') : 'Not on a job'}</span><i>·</i><span class="tg-hf" style="cursor:default"><b>${D.eff == null ? '—' : Math.round(D.eff) + '%'}</b>efficiency today</span>`;
      return `<header class="tg-head"><h1 class="tg-h1">Technician</h1><span class="tg-facts">${fv}</span>${tcViews()}${find}<span class="tch-vw" title="You’re signed in as the admin. Notes, messages, holds and parts work here; starting and stopping the clock stays with ${esc(w)}.">${ic('eye', 13)}Admin view</span></header>`;
    }
    return `<header class="tg-head"><h1 class="tg-h1">Technician</h1><span class="tg-facts">${f}</span>${S.morning ? '' : tcViews()}${find}${scan}${ck}</header>`;
  }
  function viewTech(){
    const M0 = PG.me(), adm = M0.admin && !M0.tech, as = adm ? tcAs() : null;
    const me0 = adm ? 'as:' + (as || '') : M0.name; if(U._me !== me0){ U._me = me0; U.view = 'today'; U.sel = null; U.pop = null; U.eod = false; U.tv = false; TU.ro = null; TU.open = {}; TU.q = ''; }
    build(as);
    if(S.lead) return `<div class="tg mq cr cq tch" data-pg="tech"><header class="tg-head"><h1 class="tg-h1">Technician</h1></header><div class="tg-body"><div class="tg-main"><div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('tech', 22)}</span>${adm ? '<h3>No technicians yet</h3><p>Add technicians on the Team page, or assign one on an RO — their page shows here.</p>' : '<h3>For technicians</h3><p>This page shows a technician’s own repair orders. Sign in as a technician to see theirs.</p>'}</div></div></div></div></div>`;
    const all = tcRos(), G = tcGroups(all), L = G.flatMap(g => g[1]);
    if(!TU.ro || (!all.some(r => r.id === TU.ro) && !tcDoneR(TU.ro))){ const run = all.find(r => r.lane === 'run'); TU.ro = (run || L[0] || all[0] || {}).id || null; }
    const r = all.find(x => x.id === TU.ro) || tcDoneR(TU.ro) || null;   /* Parsec 14.7 */
    if(r && r.focus && r.focus.id){ const fk = r.id + '|' + (S.rp ? S.rp.opId : ''); if(TU._fk !== fk){ TU._fk = fk; try{ (UI.roOp || (UI.roOp = {}))[r.id] = r.focus.id; }catch(e){} } }   /* the RO page opens on the operation that's up */
    TCX = r && !r.del ? { ro: r.id, crumb: S.view ? PG.first(S.me) + '’s ROs' : 'My ROs', list: L.map(x => x.id).filter((id, i, a) => a.indexOf(id) === i), own: S.ops.reduce((m, o) => { m[o.id] = 1; return m; }, {}), view: !!S.view, me: S.me, first: PG.first(S.me), fm: PG.person('Foreman'),
      go: id => { TU.ro = id; U.justDone = null; PG.keepScroll(render); }, back: () => { try{ if(typeof pmClose === 'function' && typeof pmOn === 'function' && pmOn()) pmClose(); else { const it = document.querySelector('[data-pg="tech"] .tch-list .tg-it.on'); if(it) it.scrollIntoView({ block: 'nearest' }); } }catch(e){} } } : null;   /* Parsec 14.3: the RO page reads it */
    /* Console's handlers work on U.sel — it follows the RO's operation that's up now, unless you picked another one in it */
    if(r && (U.selRo !== r.id || !U.pop || !r.ops.some(o => o.id === U.sel))){ U.selRo = r.id; U.sel = r.focus.id; }
    const body = S.morning ? `<div class="tg-main">${morningCard()}</div>` : TU.view === 'yard' ? `<div class="tg-main tch-ydm">${tcYard(all)}</div>` : TU.view === 'ros' && typeof rlEmbed === 'function' ? `<div class="tg-main tch-rosm">${rlEmbed('tech')}</div>` : tcList(G, all) + `<div class="tg-main">${tcPane(r)}</div>`;
    return `<div class="tg mq cr cq tch${S.view ? ' tch-view' : ''}" data-pg="tech">${tcHead()}<div class="tg-body">${body}${pop()}${tcPop()}${tcSelPop()}${tcOpPop()}${U.eod ? eodSheet() : ''}</div>${filePick()}${tcLb()}</div>`;
  }
