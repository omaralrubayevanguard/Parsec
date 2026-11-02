/* Parsec · pages/technician · actions.js
   What happens on the Technician page: Console's handlers aimed at the page, start / stop, notes, the camera, scans, its keys.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   tcInput tcField tcKeydown addNote note startOp stopAs camStop camStart scanIt dictate input … (16 functions, 12 constants)
   state      cxChk fmNote punches
   uses       access/ automations/ clock/ data/ kit/ pages/ pages/assets/ pages/foreman/ pages/inbox/ pages/triage/ pages/warranty/ phone/ ro/ ro-page/ shell/ state/ trucks/
   at load    on document focusout · on document paste
*/
  /* ---------- doing things on the Technician page: Console's handlers, aimed at the operation you clicked ---------- */
  const tcSelOp = id => { if(id && opBy(id)){ U.sel = id; const o = opBy(id); U.selRo = o.roId; } };
  const HT = {
    tcdsel: t => { const id = t.dataset.id; if(TU.ro !== id) tcSelClear(); TU.ro = id; TU.kb = false; U.pop = null; U.selRo = null; PG.keepScroll(render); const p = document.querySelector('[data-pg="tech"] .mq-pane'); if(p) p.scrollTop = 0; },   /* Parsec 14.7 */
    tcdall: () => { TCD.all = !TCD.all; PG.keepScroll(render); },
    tas: t => { const n = t.dataset.n; if(!n) return; TU.as = n; try{ localStorage.setItem(TAS_KEY, n); }catch(e){} U.pop = null; tcSelClear(); render(); },
    tsel: t => { if(TU.ro !== t.dataset.id) tcSelClear(); TU.ro = t.dataset.id; TU.kb = false; U.pop = null; U.selRo = null; PG.keepScroll(render); const p = document.querySelector('[data-pg="tech"] .mq-pane'); if(p) p.scrollTop = 0; },
    topen: (t, ev) => { if(ev && (ev.ctrlKey || ev.metaKey || ev.shiftKey)){ tcToggle('o', t.dataset.id, ev); return; } const id = t.dataset.id, r = tcRos().find(x => x.id === TU.ro), cur = TU.open[id] !== undefined ? TU.open[id] : !!(r && r.focus.id === id); TU.open[id] = !cur; PG.keepScroll(render); },
    tall: t => { const r = tcRos().find(x => x.id === TU.ro); if(!r) return; const v = t.dataset.v === '1'; (r.ro.operations || []).forEach(op => { if(op && op.id) TU.open[op.id] = v; }); PG.keepScroll(render); },
    tdo: (t, ev) => { tcSelOp(t.dataset.id); const f = H[t.dataset.v]; if(f) f(t, ev); },
    /* Parsec 12.5: List / Yard; a truck of yours on the yard opens its RO, someone else's says what it is */
    tvw: t => { tcViewSet(t.dataset.v); TU.ydSel = null; U.pop = null; render(); },
    tyd: t => { const id = t.dataset.ro; if(!id) return; const r = tcRos().find(x => x.id === id);
      if(!r){ TU.ydSel = TU.ydSel === id ? null : id; PG.keepScroll(render); return; }
      tcViewSet('list'); TU.ydSel = null; if(TU.ro !== id) tcSelClear(); TU.ro = id; TU.kb = false; U.pop = null; U.selRo = null;
      try{ if(typeof pmOn === 'function' && pmOn() && typeof PM !== 'undefined'){ PM.y = 0; PM.pend = true; } }catch(e){}
      render(); const p = document.querySelector('[data-pg="tech"] .mq-pane'); if(p) p.scrollTop = 0; },
    tydx: () => { TU.ydSel = null; PG.keepScroll(render); },
    tpick: t => { const o = opBy(t.dataset.id), p = o && o.parts.find(x => x.id === t.dataset.pt); if(!p) return; PG.act('picked up', `Picked up — ${p.description || p.partNumber}.`, () => { p.status = 'Picked up'; p.statusChangedAt = nowIso(); p.pickedBy = S.me; }); note(PG.person('Parts'), 'fyi', o, `${PG.first(S.me)} picked up the parts for ${o.no}`, `${p.description || p.partNumber}${p.partNumber ? ' · ' + p.partNumber : ''}`); },
    ttruck: t => { const ro = getRO(t.dataset.id); if(ro && typeof trkDlgOpen === 'function') trkDlgOpen(ro, t); },
    tck: (t, ev) => tcToggle(t.dataset.k, t.dataset.id, ev, t.dataset.op),
    tprow: (t, ev) => { if(ev && (ev.ctrlKey || ev.metaKey || ev.shiftKey)) tcToggle('p', t.dataset.pt, ev, t.dataset.id); },
    tckall: t => { const r = tcCur(); if(!r) return;
      if(t.dataset.k === 'o'){ const ids = tcLive(r).map(o => o.id), all = ids.every(i => TU.selO[i]); tcSelClear(); if(!all) ids.forEach(i => TU.selO[i] = 1); }
      else { const op = getOp(r.id, t.dataset.id), ids = op ? opRealParts(op).map(p => p.id) : [], all = TU.selPOp === t.dataset.id && ids.every(i => TU.selP[i]); tcSelClear(); if(!all && ids.length){ TU.selPOp = t.dataset.id; ids.forEach(i => TU.selP[i] = 1); } }
      U.pop = null; PG.keepScroll(render); },
    tsclear: () => { tcSelClear(); U.pop = null; PG.keepScroll(render); },
    tsact: t => tcSelAct(t),
    tsdo: t => tcSelDo(t),
    tgrp: t => { const k = t.dataset.k; TU.shut[k] = !TU.shut[k]; PG.keepScroll(render); },
    ttab: t => { TU.tab[t.dataset.id] = t.dataset.v; TU.open[t.dataset.id] = true; PG.keepScroll(render); },
    tactall: () => { TU.actAll = !TU.actAll; PG.keepScroll(render); },
    tmsgall: () => { TU.msgAll = !TU.msgAll; PG.keepScroll(render); },
    tmsgto: t => { TU.msgTo = t.dataset.n; PG.keepScroll(render); const i = document.querySelector('[data-pg="tech"] [data-in="tmsg"]'); if(i) i.focus(); },
    tnudge: t => { const o = opBy(t.dataset.id), n = t.dataset.n; if(!o || !n) return; note(n, 'men', o, `${PG.first(S.me)} asked about ${o.no}`, `${o.cust} · Op ${o.opn} — ${o.cmp}`, 'Any news on this one?'); pushToast(`Nudged ${PG.first(n)} — it’s under Messages on ${o.no}.`); PG.keepScroll(render); },
    tappr: t => { const o = opBy(t.dataset.id), n = t.dataset.n; if(!o || !n) return; note(n, 'men', o, `${PG.first(S.me)} asked about the approval on ${o.no}`, `${o.cust} — the estimate isn’t approved yet`, 'Any word from the customer?'); pushToast(`Asked ${PG.first(n)} about the approval.`); PG.keepScroll(render); },
    tfcx: t => { const o = opBy(t.dataset.id); if(!o) return; const f = (o.op.faults || []).find(x => x.id === t.dataset.f); if(!f) return; PG.act('fault code', `${tcFc(f)} removed from Op ${o.opn}.`, () => { o.op.faults = o.op.faults.filter(x => x.id !== f.id); }); },
    tfile: t => { const o = opBy(t.dataset.id), f = document.querySelector('[data-pg="tech"] .cq-file'); if(!o || !f) return; f.dataset.task = 'opfile'; f.dataset.ro = o.roId; f.dataset.op = o.id; f.value = '';
      if(t.dataset.cam){ f.accept = 'image/*'; f.setAttribute('capture', 'environment'); } else { f.accept = 'image/*,video/*,.pdf,application/pdf'; f.removeAttribute('capture'); }
      f.click(); setTimeout(() => f.removeAttribute('capture'), 0); },
    tfopen: t => { const ro = getRO(t.dataset.ro), id = t.dataset.f; let f = null; (ro && ro.bulletins || []).forEach(e => (e.files || []).forEach(x => { if(x.id === id) f = x; }));
      if(!f || typeof JC === 'undefined' || !JC.blobOf){ pushToast('That file isn’t on this computer.'); return; }
      Promise.resolve(JC.blobOf(f, ro.id)).then(b => { if(!b){ pushToast('That file isn’t on this computer or in the shop folder.'); return; } if(TU.lb) URL.revokeObjectURL(TU.lb.url); TU.lb = { url: URL.createObjectURL(b), name: f.name || 'File', type: b.type || f.type || '' }; PG.keepScroll(render); }, () => pushToast('Couldn’t open that file.')); },
    tlbx: () => { if(TU.lb) URL.revokeObjectURL(TU.lb.url); TU.lb = null; PG.keepScroll(render); },
    tnotes: t => { const ro = getRO(t.dataset.id); if(ro && typeof trkInspOpen === 'function') trkInspOpen(ro); },
    /* Parsec 12.3 */
    trstp: t => { const id = t.dataset.ro; if(U.pop && U.pop.type === 'trst' && U.pop.ro === id){ U.pop = null; PG.keepScroll(render); return; } U.pop = { type: 'trst', ro: id }; PG.anchor(U, t); PG.keepScroll(render); },
    trsts: t => { const ro = getRO(t.dataset.ro), v = t.dataset.v; U.pop = null; if(!ro || roStatus(ro).status === v){ PG.keepScroll(render); return; }
      if(setRoStatus(ro.id, v, null) !== false){ scheduleSave(true); pushToast(`${tgNum(ro)} set to ${roStShown(ro)}.`, true); } PG.keepScroll(render); },
    /* Parsec 14: the road test toggle; what was sent to you */
    trtt: t => { const ro = getRO(t.dataset.ro); if(!ro) return; const on = !rtNeeded(ro); if(rtToggle(ro, on)) pushToast(on ? `${tgNum(ro)} needs a road test again — Road test and Truck checks are back.` : `No road test for ${tgNum(ro)} — no truck checks either. When the work is done it’s ready to release.`, true); PG.keepScroll(render); },
    tsent: t => { const k = t.dataset.k, id = t.dataset.ro; sentSeen(k); if(id && tcRos().some(x => x.id === id)){ if(TU.ro !== id) tcSelClear(); TU.ro = id; TU.kb = false; U.pop = null; tcViewSet('list'); PG.keepScroll(render); const p = document.querySelector('[data-pg="tech"] .mq-pane'); if(p) p.scrollTop = 0; } else if(id && getRO(id)) PG.openRo(id); else PG.keepScroll(render); },
    tasset: t => { const ro = getRO(t.dataset.ro); if(ro && typeof asOpenFor === 'function') asOpenFor(ro); },
    tsentx: t => { if(sentDone(t.dataset.k)) pushToast('Done — off your Sent to you list.', true); PG.keepScroll(render); },
    tjtp: t => { const id = t.dataset.id; if(U.pop && U.pop.type === 'tjt' && U.pop.id === id){ U.pop = null; PG.keepScroll(render); return; } U.pop = { type: 'tjt', id }; PG.anchor(U, t); PG.keepScroll(render); },
    tjts: t => { const r = tcCur(), op = tcRawOp(t.dataset.id), v = t.dataset.v; U.pop = null; if(!op || opJobType(op) === v){ PG.keepScroll(render); return; }
      PG.act('job type', `Op ${tcOpN(r, op)} is ${tcJl(v)} now.`, () => { op.jobType = v; }); },
    tomp: t => { const id = t.dataset.id; if(U.pop && U.pop.type === 'tom' && U.pop.id === id){ U.pop = null; PG.keepScroll(render); return; } U.pop = { type: 'tom', id }; PG.anchor(U, t); PG.keepScroll(render); },
    tomx: t => { const r = tcCur(), op = tcRawOp(t.dataset.id), v = t.dataset.v, prev = U.pop || {}; if(!r || !op) return;
      const at = { ax: prev.ax, ay: prev.ay, aw: prev.aw, at: prev.at }; U.pop = null;
      if(v === 'print'){ PG.keepScroll(render); tcPrint(r.no + ' job jacket', tcJacket(r, [op])); return; }
      if(v === 'story'){ let txt = ''; try{ const live0 = raLive(r.ro), B = raStory(r.ro).split('\n\n'); txt = B[live0.indexOf(op)] || ''; }catch(e){} PG.keepScroll(render); tcCopy((r.ro.roNumber || r.no) + ' · ' + r.cust + '\n\n' + txt, `Copied the story for Op ${tcOpN(r, op)} — paste it in ASIST or anywhere.`); return; }
      if(v === 'ask'){ tcSelOp(op.id); U.pop = Object.assign({ type: 'part' }, at); PG.keepScroll(render); return; }
      if(v === 'del'){ U.pop = Object.assign({ type: 'tsd', only: op.id }, at); PG.keepScroll(render); return; } },
    ttm: t => { const p = tcP(t.dataset.p); if(!p || !tcCanEdP(p)) return; TU.edT = { p: p.id, f: t.dataset.f, v0: t.dataset.f === 'e' && !p.stop ? tcHM(Date.now()) : '' }; TU.why = null; U.pop = null; PG.keepScroll(render);
      setTimeout(() => { const i = document.querySelector('[data-pg="tech"] [data-in="ttime"]'); if(i) i.focus(); }, 0); },
    trsp: t => { const p = tcP(t.dataset.p); if(!p || !tcCanEdP(p)) return; if(U.pop && U.pop.type === 'trs' && U.pop.p === p.id && U.pop.f === t.dataset.f){ U.pop = null; PG.keepScroll(render); return; }
      U.pop = { type: 'trs', p: p.id, f: t.dataset.f }; PG.anchor(U, t); PG.keepScroll(render); },
    trss: t => { const p = tcP(t.dataset.p), f = t.dataset.f, v = t.dataset.v; U.pop = null; if(!p){ PG.keepScroll(render); return; }
      const ok = updatePunchReasons(p.id, f === 's' ? v : p.startReason, f === 'e' ? v : p.stopReason);
      if(ok) pushToast(`${f === 's' ? 'Started for' : 'Stopped because'} — ${v}.`, true); else PG.keepScroll(render); },
    /* Parsec 12.7: move the running clock; stop it at the time it really stopped, once you say why */
    tmvp: t => { const p = tcP(t.dataset.p); if(!p || p.stop || !tcCanEdP(p)) return; if(U.pop && U.pop.type === 'tmv' && U.pop.p === p.id){ U.pop = null; PG.keepScroll(render); return; }
      U.pop = { type: 'tmv', p: p.id }; PG.anchor(U, t); PG.keepScroll(render); },
    tmvs: t => { const p = tcP(t.dataset.p); U.pop = null; if(!p){ PG.keepScroll(render); return; } const r = rcMove(p, t.dataset.ro, t.dataset.op);
      if(!r.ok){ pushToast(r.msg); return; } pushToast(`The running clock moved to ${r.label} — it still started ${clk(p.start)}.`, true); },
    tstopw: t => { const p = tcP(t.dataset.p), w = TU.why; TU.why = null; if(!p || !w || w.p !== p.id){ PG.keepScroll(render); return; } const r = rcStopAt(p, w.ts, t.dataset.v);
      if(!r.ok){ pushToast(r.msg); return; } pushToast(`Stopped at ${clk(w.ts)} · ${r.gaps ? r.reason + ' — not complete yet: ' + r.gapText : r.reason} — ${dur((w.ts - new Date(p.start).getTime()) / 60000)} on that punch.`, true); },
    tstopx: () => { TU.why = null; PG.keepScroll(render); },
    tdel: t => { const p = tcP(t.dataset.p); if(!p || !p.stop || !tcCanEdP(p)) return; const d = dur((new Date(p.stop) - new Date(p.start)) / 60000); U.pop = null; TU.edT = null;
      if(deletePunch(p.id) === false) return; pushToast(`Punch deleted — ${d} of time.`, true); },
    tpn: t => { const p = tcP(t.dataset.p); if(!p || !tcCanEdP(p)) return; TU.pnote = p.id; PG.keepScroll(render); setTimeout(() => { const i = document.querySelector('[data-pg="tech"] [data-in="tpnote"]'); if(i) i.focus(); }, 0); },
    tnewp: t => { const o = tcRawOp(t.dataset.id), r = tcCur(); if(!o || !r) return; const a = t.dataset.a1 ? new Date(t.dataset.a1) : null, b = t.dataset.b1 ? new Date(t.dataset.b1) : null;
      let s0, e0;
      if(a && b && b > a && tcYMD(a) === tcYMD(b)){ s0 = a; e0 = b; } else if(a){ s0 = a; e0 = new Date(Math.min(a.getTime() + 3600000, new Date(a).setHours(23, 59, 0, 0))); }
      else { e0 = new Date(Math.round(Date.now() / 300000) * 300000); s0 = new Date(e0.getTime() - 3600000); }
      TU.newP = { op: o.id, ro: r.id, at: t.dataset.i, d: tcYMD(s0), s: tcHM(s0), e: tcHM(e0), sr: 'Repairing', er: 'Switched job' }; TU.open[o.id] = true; TU.tab[o.id] = 'time'; U.pop = null; PG.keepScroll(render);
      setTimeout(() => { const i = document.querySelector('[data-pg="tech"] [data-in="tnp"][data-k="s"]'); if(i) i.focus(); }, 0); },
    tnpx: () => { TU.newP = null; PG.keepScroll(render); },
    tnpok: () => { const N = TU.newP, r = tcCur(); if(!N || !r) return; const base = N.d + 'T12:00:00', s0 = tcAtHM(base, N.s), e0 = tcAtHM(base, N.e);
      if(!s0 || !e0){ pushToast('Pick a start and a stop time.'); return; }
      if(new Date(e0) <= new Date(s0)){ pushToast('Stop must be after start.'); return; }
      const res = addManualPunch({ roId: N.ro, opId: N.op, start: s0, stop: e0, startReason: N.sr, stopReason: N.er });
      if(!res || !res.ok){ pushToast((res && res.msg) || 'Couldn’t add that time.'); return; }
      const np = STATE.punches[STATE.punches.length - 1]; if(np && np.opId === N.op && S.me) np.by = S.me;
      const op = tcRawOp(N.op); TU.newP = null; scheduleSave(true);
      pushToast(`Time entry added — ${dur((new Date(e0) - new Date(s0)) / 60000)}${op ? ' on Op ' + tcOpN(r, op) : ''}.`, true); },
    tpaste: t => { const o = opBy(t.dataset.id); if(!o) return;
      const wait = () => { TU.pasteOp = o.id; pushToast(`Press Ctrl V to paste the screenshot onto Op ${o.opn}.`); };
      if(!navigator.clipboard || !navigator.clipboard.read){ wait(); return; }
      navigator.clipboard.read().then(items => Promise.all(items.map(it => { const tp = (it.types || []).find(x => /^image\//.test(x)); return tp ? it.getType(tp).then(bl => new File([bl], 'screenshot-' + Date.now() + '.' + (tp.split('/')[1] || 'png'), { type: tp })) : null; })))
        .then(L => { L = L.filter(Boolean); if(L.length) tcAddShots(o, L); else wait(); }, wait); }
  };
  /* a time being changed saves when you leave it; a note left empty closes */
  document.addEventListener('focusout', ev => { const t = ev.target; if(!t || !t.dataset) return;
    if(t.dataset.in === 'ttime' && TU.edT && TU.edT.p === t.dataset.p && TU.edT.f === t.dataset.f){ const v = t.value, pid = t.dataset.p, f = t.dataset.f; setTimeout(() => { if(TU.edT && TU.edT.p === pid && TU.edT.f === f) tcSaveTime(pid, f, v); }, 0); }
    if(t.dataset.in === 'tpnote' && TU.pnote === t.dataset.p && !String(t.value || '').trim()){ setTimeout(() => { if(TU.pnote){ TU.pnote = null; PG.keepScroll(render); } }, 150); }
  });
  /* Ctrl V pastes a screenshot onto the operation that asked for one (Paste a screenshot), or the one whose Files tab is open */
  document.addEventListener('paste', ev => { if(UI.view !== 'tech' || !S) return; const tg = ev.target; if(tg && /^(input|textarea)$/i.test(tg.tagName || '')) return;
    const fs = Array.prototype.slice.call((ev.clipboardData && ev.clipboardData.files) || []).filter(f => /^image\//.test(f.type || '')); if(!fs.length) return;
    let o = TU.pasteOp ? opBy(TU.pasteOp) : null;
    if(!o){ const r = tcCur(); if(r) o = r.ops.find(x => TU.tab[x.id] === 'files' && (TU.open[x.id] !== undefined ? TU.open[x.id] : x.id === r.focus.id)) || null; }
    if(!o) return; ev.preventDefault(); TU.pasteOp = null; tcAddShots(o, fs); });
  function tcInput(t){ if(t.dataset.in === 'tq'){ TU.q = t.value; PG.keepScroll(render); return true; } if(t.dataset.in === 'tnote'){ TU.dr[t.dataset.id] = t.value; return true; }
    if(t.dataset.in === 'tact' || t.dataset.in === 'tmsg' || t.dataset.in === 'tdtc'){ TU.dr[t.dataset.in.slice(1)] = t.value; return true; }
    if(t.dataset.in === 'tsq' || t.dataset.in === 'tsn' || t.dataset.in === 'tsc'){ TU.dr[t.dataset.in] = t.value; return true; }
    if(t.dataset.in === 'tnp'){ if(TU.newP) TU.newP[t.dataset.k] = t.value; return true; }
    if(t.dataset.in === 'ttime' || t.dataset.in === 'tpnote') return true;
    return false; }
  const tcRefocus = sel => { const i = document.querySelector('[data-pg="tech"] ' + sel); if(i){ i.value = ''; i.focus(); } };
  function tcField(t, ev){
    if(t.dataset.in === 'ttime'){ if(ev.key === 'Enter'){ ev.preventDefault(); tcSaveTime(t.dataset.p, t.dataset.f, t.value); return true; } if(ev.key === 'Escape'){ ev.preventDefault(); TU.edT = null; PG.keepScroll(render); return true; } return false; }
    if(t.dataset.in === 'tpnote'){ if(ev.key === 'Escape'){ ev.preventDefault(); TU.pnote = null; PG.keepScroll(render); return true; }
      if(ev.key === 'Enter' && t.value.trim()){ ev.preventDefault(); const p = tcP(t.dataset.p); TU.pnote = null; if(!p){ PG.keepScroll(render); return true; } const txt = autoPunct(t.value.trim());
        PG.act('punch note', 'Note added to the punch.', () => { p.notes = (String(p.notes || '').replace(/\s+$/, '') ? String(p.notes).replace(/\s+$/, '') + '\n' : '') + txt; ockNoteTime(p, txt); }); return true; } return false; }
    if(t.dataset.in === 'tnp'){ if(ev.key === 'Enter'){ ev.preventDefault(); if(TU.newP) TU.newP[t.dataset.k] = t.value; HT.tnpok(); return true; } if(ev.key === 'Escape'){ ev.preventDefault(); TU.newP = null; PG.keepScroll(render); return true; } return false; }
    if(t.dataset.in === 'tnote' && ev.key === 'Enter' && t.value.trim()){ ev.preventDefault(); const id = t.dataset.id, o = opBy(id); if(!o) return true; pushUndo('note'); addNote(o, t.value); TU.dr[id] = ''; scheduleSave(true); PG.keepScroll(render); const i = document.querySelector('[data-pg="tech"] [data-in="tnote"][data-id="' + id + '"]'); if(i){ i.value = ''; i.focus(); } return true; }
    if(t.dataset.in === 'tact' && ev.key === 'Enter' && t.value.trim()){ ev.preventDefault(); const o = opBy(U.sel); if(!o) return true; const txt = autoPunct(t.value.trim());
      PG.act('note', `Note saved on operation ${o.opn}.`, () => { o.op.offNotes = (Array.isArray(o.op.offNotes) ? o.op.offNotes : []).concat([{ id: 'on' + Date.now().toString(36), at: nowIso(), text: txt, by: punchByName() || S.me }]); }); TU.dr.act = ''; PG.keepScroll(render); tcRefocus('[data-in="tact"]'); return true; }
    if(t.dataset.in === 'tmsg' && ev.key === 'Enter' && t.value.trim()){ ev.preventDefault(); const o = opBy(U.sel), to = TU.msgTo; if(!o || !to) return true;
      note(to, 'men', o, `${PG.first(S.me)} wrote about ${o.no}`, `${o.cust} · Op ${o.opn} — ${o.cmp}`, t.value.trim()); TU.dr.msg = ''; pushToast(`Sent to ${PG.first(to)} — it’s under Messages on ${o.no}.`); PG.keepScroll(render); tcRefocus('[data-in="tmsg"]'); return true; }
    if(t.dataset.in === 'tdtc' && ev.key === 'Enter' && t.value.trim()){ ev.preventDefault(); const o = opBy(U.sel), f = tcParseFc(t.value); if(!o) return true;
      if(!f){ pushToast('Type it as SPN/FMI — 3226/2 — or a P-code like P0401.'); return true; }
      if((o.op.faults || []).some(x => tcFc(x) === tcFc(f))){ pushToast(`${tcFc(f)} is already on Op ${o.opn}.`); return true; }
      PG.act('fault code', `${tcFc(f)} added to Op ${o.opn}.`, () => { o.op.faults = (o.op.faults || []).concat([Object.assign({ id: 'fc_' + uid() }, f)]); }); TU.dr.dtc = ''; PG.keepScroll(render); tcRefocus('[data-in="tdtc"]'); return true; }
    if((t.dataset.in === 'tsn' || t.dataset.in === 'tsc') && ev.key === 'Enter' && t.value.trim()){ ev.preventDefault(); TU.dr[t.dataset.in] = t.value; tcSelDo({ dataset: { v: t.dataset.in === 'tsn' ? 'note' : 'code' } }); return true; }
    if(t.dataset.in === 'tsq' && ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)){ ev.preventDefault(); tcSelDo({ dataset: { v: 'ask' } }); return true; }
    if(t.dataset.in === 'tq' && (ev.key === 'Escape' || ev.key === 'Enter')){ ev.preventDefault(); if(ev.key === 'Escape'){ TU.q = ''; t.value = ''; PG.keepScroll(render); } t.blur(); return true; }
    return false;
  }
  function tcKeydown(ev){
    const k = ev.key; if(!S) return;
    const stop = () => { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); };
    if((ev.ctrlKey || ev.metaKey) && k === 'Enter' && !PG.typing(ev) && S.rp && !S.shop && !S.view){ H.done(); return stop(); }
    if(ev.ctrlKey || ev.metaKey || ev.altKey || PG.typing(ev)) return;
    if(TU.lb && k === 'Escape'){ HT.tlbx(); return stop(); }
    if(U.pop){ if(k === 'Escape'){ U.pop = null; camStop(); PG.keepScroll(render); return stop(); } return; }
    if(k === 'Escape' && TU.why){ TU.why = null; PG.keepScroll(render); return stop(); }
    if(k === 'Escape' && U.eod){ U.eod = false; PG.keepScroll(render); return stop(); }
    if(U.eod || S.morning || S.lead) return;
    if(k === 'y' || k === 'Y'){ tcViewSet(TU.view === 'yard' ? 'list' : 'yard'); TU.ydSel = null; render(); return stop(); }
    if(k === 'Escape' && TU.ydSel){ TU.ydSel = null; PG.keepScroll(render); return stop(); }
    if(k === '/'){ if(TU.view !== 'yard') psmOpen('tech'); return stop(); }
    if(TU.view === 'yard' && (k === 'j' || k === 'k' || k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter')) return;
    if(k === 'j' || k === 'k' || k === 'ArrowDown' || k === 'ArrowUp'){ const L = tcFlat(), i = L.findIndex(x => x.id === TU.ro); const n = L[Math.max(0, Math.min(L.length - 1, i + (k === 'j' || k === 'ArrowDown' ? 1 : -1)))]; if(n){ if(TU.ro !== n.id) tcSelClear(); TU.ro = n.id; TU.kb = true; U.selRo = null; PG.keepScroll(render); PG.kbScroll(); } return stop(); }
    const o = opBy(U.sel);
    if(S.view && (k === 'Enter' || k === 's' || k === 'h' || k === ' ')) return;
    if(k === 'Enter'){ if(o && !isRun(o) && o.st !== 'done' && !S.out){ startOp(o); return stop(); } }
    if(k === 's' && S.rp){ H.stop(); return stop(); }
    if(k === 'h' && S.rp && !S.shop){ U.sel = S.rp.opId; U.pop = { type: 'hold' }; PG.keepScroll(render); return stop(); }
    if(k === ' '){ if(S.rp){ H.stop(); return stop(); } if(o && o.st !== 'done' && !S.out){ startOp(o); return stop(); } }
  }

  /* ---------- doing things ---------- */
  const rd = () => PG.keepScroll(render);
  /* Console's pieces also run the Technician page (Parsec 11): look on whichever of the two is showing */
  const cxq = sel => document.querySelector('[data-pg="console"] ' + sel) || document.querySelector('[data-pg="tech"] ' + sel);
  const noOf = o => o ? o.no : '';
  function addNote(o, text){
    text = autoPunct(String(text || '').trim()); if(!text || !o) return false;
    const ps = opPunches(o.id), p = ps.filter(x => !x.stop)[0] || ps[ps.length - 1];
    if(p){ const line = text; p.notes = String(p.notes || '').trim() ? String(p.notes).replace(/\s+$/, '') + '\n' + line : line; ockNoteTime(p, line); }
    else { o.op.log = o.op.log || []; o.op.log.push({ id: uid('lg'), at: nowIso(), kind: 'cause', text: text }); }
    return true;
  }
  function note(to, k, o, t, b, q, extra){ if(typeof IB === 'undefined' || !to) return; IB.send(Object.assign({ to, k, src: 'console', ro: o ? o.roId : null, op: o ? o.id : null, t, b: b || '', q: q || '' }, extra || {})); }
  function startOp(o){
    if(!o) return; if(S.out && !openShift()) shiftClockIn(true);
    const was = S.rp && !isShopPunch(S.rp) ? opBy(S.rp.opId) : null, wasShop = S.shop;
    const ro = getRO(o.roId); if(ro && ro.cxBring && bayLike(ro.location)) delete ro.cxBring;
    U.sel = o.id; U.justDone = null;
    doStartPunch(o.roId, o.id, o.t === 'DIAG' ? 'Diagnosing' : o.t === 'PM' ? 'Inspecting' : 'Repairing');
    const rp = runningPunch();
    if(rp && rp.opId === o.id) pushToast(was ? `Switched to ${o.no} — ${was.no} stopped at ${clk(Date.now())}.` : wasShop ? `Started ${o.no} — shop time stopped.` : `Started ${o.no} at ${clk(Date.now())}.`, true);
  }
  function stopAs(reason, msg){ if(!runningPunch()) return; doStopPunch(reason); if(msg) pushToast(msg, true); }
  let CAM = null;
  function camStop(){ if(CAM){ try{ CAM.stream.getTracks().forEach(t => t.stop()); }catch(e){} clearInterval(CAM.iv); CAM = null; } }
  function camStart(){
    camStop(); U.camErr = '';
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ U.camErr = 'No camera here — type the RO number.'; rd(); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(stream => {
      CAM = { stream, iv: null }; const v = cxq('.cq-cam'); if(!v){ camStop(); return; } v.srcObject = stream;
      const c = document.createElement('canvas'), g = c.getContext('2d');
      CAM.iv = setInterval(() => { const vv = cxq('.cq-cam'); if(!vv || !U.pop || U.pop.type !== 'scan'){ camStop(); return; } if(!vv.videoWidth) return;
        c.width = vv.videoWidth; c.height = vv.videoHeight; g.drawImage(vv, 0, 0); let code = null; try{ const img = g.getImageData(0, 0, c.width, c.height); code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' }); }catch(e){}
        if(code && code.data){ camStop(); scanIt(code.data); } }, 300);
    }, () => { U.camErr = 'The camera is blocked — type the RO number.'; const t = cxq('.cq-camtx'); if(t) t.textContent = U.camErr; });
  }
  function scanIt(raw){
    const v = String(raw || '').replace(/^TEC:\s*/i, '').trim(), n = v.replace(/^RO[\s-]*/i, '');
    if(!n){ return; }
    const z = x => String(x || '').replace(/^R[AO][\s-]*/i, '').replace(/^0+/, '').toUpperCase(), nz = z(n);   /* the full number (the jacket's code), or the last 4 typed */
    const o = S.ops.find(x => x.st !== 'done' && (z(x.ro.roNumber) === nz || z(x.no) === nz));
    U.pop = null;
    if(!o){ pushToast(`${n} isn’t on your list — ask ${PG.person('Foreman') ? PG.first(PG.person('Foreman')) : 'the foreman'} to assign it.`); return; }
    startOp(o);
  }
  let REC = null;
  function dictate(){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){ pushToast('Dictation needs Chrome or Edge with a microphone.'); return; }
    if(REC){ try{ REC.stop(); }catch(e){} REC = null; U.dict = false; rd(); return; }
    REC = new SR(); REC.lang = 'en-US'; REC.interimResults = true; REC.continuous = false;
    const base = U.draft ? U.draft.replace(/\s+$/, '') + ' ' : '';
    REC.onresult = ev => { let t = ''; for(let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript; U.draft = base + t; const i = cxq('[data-in="note"]'); if(i) i.value = U.draft; };
    REC.onend = () => { REC = null; U.dict = false; rd(); const i = cxq('[data-in="note"]'); if(i){ i.focus(); i.setSelectionRange(i.value.length, i.value.length); } };
    REC.onerror = ev => { pushToast(ev.error === 'not-allowed' ? 'The microphone is blocked for this page.' : ev.error === 'network' ? 'Dictation needs the internet — type it instead.' : 'Didn’t catch that — try again.'); };
    U.dict = true; rd(); try{ REC.start(); }catch(e){ REC = null; U.dict = false; rd(); }
  }
  const H = {
    view: t => { U.view = t.dataset.v; U.pop = null; rd(); },
    go: t => { PG.go(t.dataset.v); },
    pop: t => { const p = t.dataset.p; if(U.pop && U.pop.type === p){ U.pop = null; camStop(); rd(); return; } U.pop = { type: p }; PG.anchor(U, t); rd(); if(p === 'scan'){ setTimeout(camStart, 50); setTimeout(() => { const i = cxq('[data-in="scan"]'); if(i) i.focus(); }, 60); } if(p === 'ask' || p === 'part') setTimeout(() => { const i = cxq('.cq-ta'); if(i) i.focus(); }, 30); },
    popx: () => { U.pop = null; camStop(); rd(); },
    sel: t => { U.sel = t.dataset.id; U.kb = false; U.pop = null; rd(); const p = cxq('.mq-pane'); if(p) p.scrollTop = 0; },
    start: () => startOp(opBy(U.sel)),
    startid: t => { U.pop = null; startOp(opBy(t.dataset.id)); },
    stop: () => { const was = S.shop ? 'shop time' : noOf(S.rp && opBy(S.rp.opId)); stopAs(S.shop ? 'Done' : 'Hold Tech', `Stopped ${was} at ${clk(Date.now())} — you’re on air time until the next one.`); },
    done: () => { const o = S.rp && opBy(S.rp.opId); if(!o) return; const b = burnt(o); U.justDone = o.id; U.sel = o.id; doStopPunch('Complete'); const op = getOp(o.roId, o.id); if(op && opDoneNow(op)) pushToast(`${o.no} done — ${h1(b)} h burnt on ${h1(o.q)} quoted.`, true); },
    hold: t => { const o = opBy(U.sel || (S.rp && S.rp.opId)), k = t.dataset.v; U.pop = null; if(!o) return; if(!isRun(o) && typeof permReopenOk === 'function' && !permReopenOk(getRO(o.roId))){ rd(); return; }   /* Parsec 13 */   /* Parsec 12.8: the operation the menu was opened on */
      const who = { 'Waiting – Parts': PG.person('Parts'), 'Waiting – Sublet': PG.person('Service writer') || PG.person('Triage'), 'Waiting – Approval': PG.person('Service writer') || PG.person('Triage'), 'Waiting – Foreman': PG.person('Foreman') }[k];
      if(isRun(o)) doStopPunch(k); else { pushUndo('hold'); opReopenMark(o.op, o.roId, k); o.op.jobStatus = { status: k, sub: null, setAt: nowIso(), hand: true }; scheduleSave(true); }
      if(who) note(who, k === 'Waiting – Foreman' ? 'ask' : 'fyi', o, `${o.no} is waiting on you — ${k.replace('Waiting – ', '').toLowerCase()}`, `${S.me} put Op ${o.opn} (${o.cmp}) on hold.`);
      pushToast(`${o.no} on hold — ${k.toLowerCase()}.${who ? ' ' + PG.first(who) + ' has a note about it.' : ''}`, true); },
    reopen: () => { const o = opBy(U.sel); if(!o) return; U.pop = null; if(typeof permReopenOk === 'function' && !permReopenOk(getRO(o.roId))){ rd(); return; }   /* Parsec 13 */ PG.act('reopen', `${o.no}${o.opn ? ' Op ' + o.opn : ''} reopened — it’s back in Next.`, () => { opReopenMark(o.op, o.roId, 'Hold tech'); o.op.jobStatus = { status: 'Hold Tech', sub: null, setAt: nowIso(), hand: true }; }); },
    viewfix: () => { const o = opBy(U.sel); if(!o || !o.fix) return; UI.fixKey = o.fix.key; UI.fixQuery = ''; PG.go('fixes'); },
    usefix: () => { const o = opBy(U.sel); if(!o || !o.fix) return; PG.act('use fix', `The usual fix is in your notes on ${o.no}.`, () => { o.fix.steps.forEach(s => addNote(o, 'From the usual fix — ' + s)); o.op.cxFix = { key: o.fix.key, at: nowIso(), by: S.me }; }); },
    pickup: t => { const o = opBy(U.sel), p = o && o.parts.find(x => x.id === t.dataset.pt); if(!p) return; PG.act('picked up', `Picked up — ${p.description || p.partNumber}.`, () => { p.status = 'Picked up'; p.statusChangedAt = nowIso(); p.pickedBy = S.me; }); note(PG.person('Parts'), 'fyi', o, `${PG.first(S.me)} picked up the parts for ${o.no}`, `${p.description || p.partNumber}${p.partNumber ? ' · ' + p.partNumber : ''}`); },
    shopt: t => { const id = t.dataset.id; if(S.rp && S.rp.opId === id){ H.stop(); return; } const was = S.rp && !isShopPunch(S.rp) ? opBy(S.rp.opId) : null; doStartPunch(SHOP_RO_ID, id, null); const op = getOp(SHOP_RO_ID, id); pushToast(`Shop time — ${op ? op.complaint : ''}.${was ? ' ' + was.no + ' stopped.' : ''}`, true); },
    out: t => { const v = t.dataset.v; U.pop = null; if(v === 'End of day'){ U.eod = true; U.left = ''; rd(); return; } shiftClockOut(v === 'Lunch60' ? 'Lunch' : v, v === 'Lunch' ? 30 : v === 'Lunch60' ? 60 : 0, '', null); },   /* Parsec 14.7: Lunch · 1 hour */
    cin: () => { shiftClockIn(); },
    bring: () => { const o = opBy(U.sel); if(!o) return; const tri = PG.person('Triage') || PG.person('Service writer');
      PG.act('bring it in', `Asked ${tri ? PG.first(tri) : 'Triage'} to bring ${o.no} to a bay.`, () => { o.ro.cxBring = { at: nowIso(), by: S.me }; });
      note(tri, 'ask', o, `Bring ${o.no} to a bay for ${PG.first(S.me)}`, `${o.cust} · ${o.truck} · now at ${o.spot || 'no spot'}. ${PG.first(S.me)} is ready to start Op ${o.opn} — ${o.cmp}.`, '', { acts: ['move'] }); },
    morning: () => { U.skipMorning = ''; shiftClockIn(); const order = typeof fmUpNext === 'function' ? fmUpNext(S.me) : []; const ro = order[0]; if(ro){ const op = raLive(ro).filter(x => !opDoneNow(x))[0]; if(op) U.sel = op.id; } U.view = 'today'; rd(); },
    skipm: () => { U.skipMorning = todayStr(); rd(); },
    notex: () => { U.noteX = STATE.fmNote ? STATE.fmNote.at || todayStr() : todayStr(); rd(); },
    dict: () => dictate(),
    ph: t => { const o = opBy(U.sel); if(!o) return; const f = cxq('.cq-file'); if(!f) return; f.dataset.task = t.dataset.k; f.dataset.ro = o.roId; f.accept = t.dataset.k === 'dtc' ? '' : 'image/*'; f.value = ''; f.click(); },
    asks: t => { U.askk = t.dataset.v; const ta = cxq('.cq-ta'); U.askTxt = ta ? ta.value : ''; rd(); const t2 = cxq('.cq-ta'); if(t2) t2.value = U.askTxt || ''; },
    partk: t => { U.partk = t.dataset.v; const ta = cxq('.cq-ta'); U.askTxt = ta ? ta.value : ''; rd(); const t2 = cxq('.cq-ta'); if(t2) t2.value = U.askTxt || ''; },
    asksend: () => { const o = opBy((S.rp && S.rp.opId) || U.sel), keep = (cxq('[data-in="askrun"]') || {}).checked !== false, txt = PG.inp('[data-in="ask"]').trim(), fm = PG.person('Foreman'); U.pop = null;
      if(!o){ rd(); return; }
      note(fm, 'men', o, `${PG.first(S.me)} asked you — ${U.askk.toLowerCase()}`, `On ${o.no} · Op ${o.opn} — ${o.cmp}`, txt, { kind: U.askk });
      if(!keep && isRun(o)) doStopPunch('Waiting – Foreman');
      pushToast(`Sent to ${fm ? PG.first(fm) : 'the foreman'} — ${U.askk.toLowerCase()} on ${o.no}.${keep ? ' Your clock keeps running.' : ' It waits on a second opinion.'}`, !keep); if(keep) rd(); },
    partsend: () => { const o = opBy(U.sel), txt = PG.inp('[data-in="part"]').trim(), pt = PG.person('Parts'); U.pop = null; if(!o){ rd(); return; }
      note(pt, 'men', o, `${PG.first(S.me)} needs a part — ${o.no}`, `${U.partk} · Op ${o.opn} — ${o.cmp}`, txt, { kind: U.partk });
      pushToast(`Sent to ${pt ? PG.first(pt) : 'Parts'} — it’s under Messages on ${o.no}.`); rd(); },
    askholder: () => { const o = opBy(U.sel); if(!o || !o.hold || !o.hold.who) return; note(o.hold.who, 'men', o, `${PG.first(S.me)} asked about ${o.no}`, `Waiting – ${o.hold.k} · Op ${o.opn} — ${o.cmp}`, 'Any news on this one?'); pushToast(`Asked ${PG.first(o.hold.who)} — it’s under Messages on ${o.no}.`); rd(); },
    askwho: t => { const n = t.dataset.n; note(n, 'men', null, `${PG.first(S.M.name)} asked what you’re on`, 'You’re showing as not on a job.', 'What’s next for you?'); pushToast(`Asked ${PG.first(n)} what’s next.`); rd(); },
    openro: t => { const id = t.dataset.ro; if(id){ PG.openRo(id); return; } const o = opBy(U.sel); if(o) PG.openRo(o.roId, o.id); },
    eodc: t => { const k = t.dataset.k, worked = S.ops.filter(o => o.st === 'done' || isRun(o) || S.day.ps.some(p => p.opId === o.id)), ros = []; worked.forEach(o => { if(ros.indexOf(o.ro) < 0) ros.push(o.ro); });
      const on = !ros.every(r => (r.bulletins || []).some(e => e.task === k && e.done));
      pushUndo('end-of-day bulletin'); ros.forEach(r => { if(!Array.isArray(r.bulletins)) r.bulletins = []; let e = r.bulletins.filter(x => x.task === k).slice(-1)[0]; if(!e){ e = { oid: uid('bl'), task: k, done: false, fields: {}, place: '', files: [], at: nowIso(), tickedAt: null }; r.bulletins.push(e); } e.done = on; e.tickedAt = on ? nowIso() : null; if(on && k === 'location' && r.location) e.place = r.location; if(on && k === 'keys' && r.keyTag && !e.place) e.place = 'Key box · tag ' + r.keyTag; });
      scheduleSave(true); rd(); },
    eodx: () => { U.eod = false; rd(); },
    eodgo: () => { const l = (PG.inp('[data-in="left"]') || U.left || '').trim(), run = S.rp && opBy(S.rp.opId); U.eod = false;
      if(run && l){ addNote(run, 'Left for tomorrow: ' + l); scheduleSave(true); }
      shiftClockOut('End of day', 0, '', null); },
    tv: () => { U.tv = true; rd(); try{ document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }catch(e){} },
    tvx: () => { U.tv = false; try{ if(document.fullscreenElement) document.exitFullscreen(); }catch(e){} rd(); },
    fixchk: t => { UI.tlDay = t.dataset.d; U.pop = null; PG.go('timelog'); },
    okchk: t => { STATE.cxChk = STATE.cxChk || {}; STATE.cxChk[t.dataset.c] = nowIso(); scheduleSave(true); rd(); },
    mine: t => { U.mine = t.dataset.v === '1'; rd(); }
  };
  function input(t){ if(t.dataset.in === 'note') U.draft = t.value; if(t.dataset.in === 'left') U.left = t.value; }
  function change(t){
    if(t.dataset.in === 'file'){ const ro = getRO(t.dataset.ro), task = t.dataset.task, n = t.files ? t.files.length : 0; if(!ro || !n) return;
      if(typeof JC === 'undefined' || !JC.addFilesTo){ pushToast('Files can’t be added here.'); return; }
      /* Parsec 11.1: a file on one operation (the Technician page's Files tab) — pictures under Take pictures, the rest under Upload Report, both marked with the operation */
      if(task === 'opfile'){ const arr = Array.prototype.slice.call(t.files), sh = arr.filter(f => /^(image|video)\//.test(f.type || '')), dc = arr.filter(f => !/^(image|video)\//.test(f.type || '')), op = t.dataset.op; let left = (sh.length ? 1 : 0) + (dc.length ? 1 : 0), got = 0;
        const fin = k => { got += k || 0; if(--left > 0) return; pushToast(got ? `${got} file${got === 1 ? '' : 's'} added to the operation on ${tgNum(ro)}.` : 'Couldn’t add that file.'); render(); };
        pushUndo('attach files'); if(sh.length) JC.addFilesTo(ro, 'pics', sh, fin, op); if(dc.length) JC.addFilesTo(ro, 'report', dc, fin, op); return; }
      JC.addFilesTo(ro, task, t.files, k => { pushToast(k ? `${k} file${k === 1 ? '' : 's'} added to ${tgNum(ro)} — ${task === 'dashpic' ? 'dash picture' : task === 'dtc' ? 'DTCs' : 'pictures'} on the RO.` : 'Couldn’t add that file.'); render(); }); }
  }
  function fieldKey(t, ev){
    if(t.dataset.in === 'scan' && ev.key === 'Enter'){ ev.preventDefault(); scanIt(t.value); return true; }
    if(t.dataset.in === 'note' && ev.key === 'Enter' && t.value.trim()){ ev.preventDefault(); const o = opBy(U.sel); if(!o) return true; pushUndo('note'); addNote(o, t.value); U.draft = ''; scheduleSave(true); rd(); const i = cxq('[data-in="note"]'); if(i) i.focus(); return true; }
    if((t.dataset.in === 'ask' || t.dataset.in === 'part') && ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)){ ev.preventDefault(); (t.dataset.in === 'ask' ? H.asksend : H.partsend)(); return true; }
    if(t.dataset.in === 'left' && ev.key === 'Enter'){ ev.preventDefault(); H.eodgo(); return true; }
    if(ev.key === 'Escape'){ t.blur(); if(U.pop){ U.pop = null; camStop(); rd(); } ev.preventDefault(); return true; }
    return false;
  }
  function keydown(ev){
    const k = ev.key; if(!S) return;
    const stop = () => { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); };
    if((ev.ctrlKey || ev.metaKey) && k === 'Enter' && !PG.typing(ev) && U.view === 'today' && S.rp && !S.shop){ H.done(); return stop(); }
    if(ev.ctrlKey || ev.metaKey || ev.altKey || PG.typing(ev)) return;
    if(U.pop){ if(k === 'Escape'){ U.pop = null; camStop(); rd(); return stop(); } return; }
    if(k === 'Escape' && (U.tv || U.eod)){ if(U.tv) H.tvx(); else { U.eod = false; rd(); } return stop(); }
    if(U.tv || U.eod || S.morning || S.lead) return;
    if((k === 'j' || k === 'k') && U.view === 'today'){ const L = flat(), i = L.findIndex(x => x.id === U.sel); const n = L[Math.max(0, Math.min(L.length - 1, i + (k === 'j' ? 1 : -1)))]; if(n){ U.sel = n.id; U.kb = true; rd(); PG.kbScroll(); } return stop(); }
    if(k === 'Enter' && U.view === 'today'){ const o = opBy(U.sel); if(o && !isRun(o) && o.st !== 'done' && !S.out){ H.start(); return stop(); } }
    if(k === 's' && U.view === 'today' && S.rp){ H.stop(); return stop(); }
    if(k === 'h' && U.view === 'today' && S.rp && !S.shop){ U.sel = S.rp.opId; U.pop = { type: 'hold' }; rd(); return stop(); }
    if(k === '1' || k === '2'){ U.view = k === '1' ? 'today' : 'shop'; rd(); return stop(); }
    if(k === ' ' && U.view === 'today'){ const o = opBy(U.sel); if(S.rp){ H.stop(); return stop(); } if(o && o.st !== 'done' && !S.out){ H.start(); return stop(); } }
  }
  function after(){ PG.placePop(U); if(U.pop && U.pop.type === 'scan' && !CAM) setTimeout(camStart, 30); if(!U.pop || U.pop.type !== 'scan') camStop(); }
  const mod = { H, TK, U: () => U, input, change, fieldKey, keydown, after };
  PG.reg('console', mod);
  /* Parsec 11: the Technician page — Console's handlers, plus its own for the RO list and the operations */
  /* 11.3: the admin looking at a technician's page — the clock is theirs: starting, stopping, switching and clocking out don't run from here */
  const VIEW_NO = { start: 1, startid: 1, stop: 1, done: 1, shopt: 1, out: 1, cin: 1, morning: 1, skipm: 1, eodgo: 1 };
  const HTX = Object.assign({}, H, HT);
  Object.keys(HTX).forEach(k => { const f = HTX[k]; HTX[k] = (t, ev) => {
    if(S && S.view && (VIEW_NO[k] || (k === 'tdo' && VIEW_NO[t.dataset.v]) || (k === 'hold' && S.rp) || ((k === 'pop' || (k === 'tdo' && t.dataset.v === 'pop')) && /^(out|scan|sw)$/.test(t.dataset.p || '')))){ pushToast(k === 'hold' ? `${PG.first(S.me)}’s clock is running — a hold would stop it. It’s theirs to stop.` : `The clock is ${PG.first(S.me)}’s — it starts and stops on their sign-in.`); return; }
    return f(t, ev); }; });
  PG.reg('tech', { H: HTX, TK, U: () => U, input: (t, ev) => { if(!tcInput(t, ev)) input(t, ev); }, change, fieldKey: (t, ev) => tcField(t, ev) || fieldKey(t, ev), keydown: tcKeydown, after });
  return { view, viewTech, after, U: () => U, S: () => S, TU: () => TU, H, flat, dayStats, build, teamOf, boardOf, tcRos };
