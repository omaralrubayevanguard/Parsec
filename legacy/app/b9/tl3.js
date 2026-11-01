  /* ---------- popovers ---------- */
  function findP(id){ const raw = STATE.punches.find(p => p.id === id); if(!raw) return null; const k = localDay(raw.start); return { t: punchWho(raw), k, p: punchOf(raw, k), raw }; }
  function pop(){
    const p = U.pop; if(!p) return '';
    const hd = (t, sub) => `<div class="tg-ph"><b>${t}</b>${sub ? `<span class="cu">${sub}</span>` : ''}<button class="btn btn-sm ib" data-a="popx">${ic('x', 14)}</button></div>`;
    if(p.type === 'who') return `<div class="tg-pop menu tk-pop-m"><div class="tk-mih">Whose time</div>${techs().map(t => `<button class="tg-mi${techSame(U.who, t) ? ' on' : ''}" data-a="who" data-t="${esc(t)}">${av(t)}${esc(t)}</button>`).join('')}<button class="tg-mi${U.who === 'ALL' ? ' on' : ''}" data-a="who" data-t="ALL">${av('ALL')}Whole shop<span class="meta">Shop view</span></button><div class="tk-mnote">A technician sees only their own time. The foreman and the manager can open anyone’s.</div></div>`;
    if(p.type === 'add') return `<div class="tg-pop menu tk-pop-m"><button class="tg-mi" data-action="open-manual-punch">${ic('clock', 14)}Add a punch…<span class="meta">${kbd('A')}</span></button><button class="tg-mi" data-action="open-add-shift" data-day="${U.day || TODAY}">${ic('plus', 14)}Add a clock in / out…</button><div class="tk-mnote">Import CSV and Backup are on the Settings page — they’re not day-to-day.</div></div>`;
    if(p.type === 'exp') return `<div class="tg-pop menu tk-pop-m"><button class="tg-mi" data-action="open-report" data-date="${U.day || TODAY}">${ic('print', 14)}Day report<span class="meta">every tech, this day</span></button><button class="tg-mi" data-a="view" data-v="sheet">${ic('sheet', 14)}Timesheet<span class="meta">pay period</span></button><button class="tg-mi" data-action="export-csv">${ic('download', 14)}Export punches · CSV</button></div>`;
    if(p.type === 'edit'){ const f = findP(p.pid); if(!f) return ''; const x = f.p, run = x.e == null, s = p.s != null ? p.s : hm(x.s), e = p.e != null ? p.e : (run ? '' : hm(x.e)), m = (pm(e) || 0) - (pm(s) || 0);
      const erChips = cur => `<div class="tg-r">${ER().concat(ER().indexOf(cur) < 0 && cur ? [cur] : []).map(r => `<button class="tg-chip${(p.er || cur) === r ? ' on' : ''}" data-a="pset" data-f="er" data-v="${esc(r)}">${esc(r)}</button>`).join('')}</div>`;
      return `<div class="tg-pop xf tk-pop-w">${hd(run ? 'Edit the running punch' : 'Edit punch', `${x.ro === 'SHOP' ? 'Shop time' : esc(x.ro)} · ${short(f.k)}`)}<div class="tk-ctx">${x.ro === 'SHOP' ? esc(x.shop) : `<b>${esc(x.ro)}</b> · ${esc(x.cust)}<br>${esc(x.cm)}`}${run ? `<br><small class="tk-runh">Running since ${hm(x.s)} · type a stop to stop it then</small>` : ''}</div>
        <div class="tk-tg"><label class="tk-f"><span>Start</span><input class="tk-tin" data-in="s" value="${esc(s)}" data-cur="${x.s}"></label><label class="tk-f"><span>Stop</span><input class="tk-tin" data-in="e" value="${esc(e)}" data-cur="${run ? '' : x.e}"${run ? ' placeholder="running"' : ''}></label><span class="tk-f"><span>Length</span><span class="ro">${m > 0 ? dur(m) : run && pm(s) != null ? dur(NOW - pm(s)) : '—'}</span></span></div>${tinHint()}
        ${run ? '' : toolsRow(f)}
        ${run ? mvPick(p, f) : ''}
        ${x.ro === 'SHOP' ? '' : `<span class="tg-lbl top">Started as</span><div class="tg-r">${SR().concat(SR().indexOf(x.sr) < 0 && x.sr ? [x.sr] : []).map(r => `<button class="tg-chip${(p.sr || x.sr) === r ? ' on' : ''}" data-a="pset" data-f="sr" data-v="${esc(r)}">${esc(r)}</button>`).join('')}</div>`}
        ${run ? `<div class="tk-stopas"${String(e || '').trim() ? '' : ' hidden'}><span class="tg-lbl top">Stopped as <em>— why it stopped</em></span>${erChips('')}</div>` : x.ro === 'SHOP' ? '' : `<span class="tg-lbl top">Stopped as</span>${erChips(x.er)}`}
        ${x.ro === 'SHOP' ? '' : `<label class="tk-f" style="margin-top:6px"><span>Work note</span><textarea data-in="n" rows="3" placeholder="What was done">${esc(p.n != null ? p.n : f.raw.notes || '')}</textarea></label>`}
        ${x.ed ? `<div class="tk-was" style="margin-top:8px">${ic('history', 11)} Edited — was ${esc(x.ed)}</div>` : ''}
        ${whyRow(p, f.t)}<div class="tg-acts">${mustAsk(f.t) ? '' : `<button class="btn btn-sm tg-gh" data-a="pdel" style="color:var(--tg-bad)">${ic('trash', 13)}Delete</button>`}<span class="hint">${mustAsk(f.t) ? esc(PG.first(lead())) + ' approves time changes · a note saves now' : otherT() ? esc(TF(f.t)) + ' sees the reason on the day' : 'The reason and the time before show on the day'}</span><button class="btn btn-sm btn-primary" data-a="psave"${otherT() && needWhy(p) ? ' disabled' : ''}>${mustAsk(f.t) ? 'Send to ' + esc(PG.first(lead())) : 'Save'}${kbd('↵')}</button></div></div>`; }
    /* Parsec 12.7: the running day clock's clock-in */
    if(p.type === 'shin'){ const sh = shiftList().find(q => q.id === p.sid); if(!sh || sh.out) return ''; const k = localDay(sh.in), cur = mOf(sh.in, k), v = p.v != null ? p.v : hm(cur), mm = pm(v), L = rcShiftLimits(sh), fp = L.first ? findP(L.first.id) : null;
      return `<div class="tg-pop xf tk-pop-w">${hd('Clocked in', short(k))}<div class="tk-ctx">${otherT() ? `<b>${esc(TF(U.who))}</b> is` : 'You’re'} on the clock since <b>${hm(cur)}</b> — ${dur(NOW - cur)} so far.${fp ? ` The first punch, ${esc(fp.p.ro === 'SHOP' ? 'shop time' : fp.p.ro)}, started at <b>${hm(fp.p.s)}</b> — the clock-in can’t be later than that.` : ''}</div>
        <div class="tk-tg"><label class="tk-f"><span>Clocked in</span><input class="tk-tin" data-in="shin" value="${esc(v)}" data-cur="${cur}"></label><span class="tk-f"><span>On the clock</span><span class="ro tk-shd">${mm != null && mm <= NOW ? dur(NOW - mm) : '—'}</span></span></div>
        ${sh.originalIn ? `<div class="tk-was" style="margin-top:8px">${ic('history', 11)} Edited — was ${hm(mOf(sh.originalIn, k))}</div>` : ''}
        ${tinHint()}${whyRow(p, U.who)}<div class="tg-acts"><span class="hint">Not in the future · not after the first punch</span><button class="btn btn-sm btn-primary" data-a="shgo"${needWhy(p) ? ' disabled' : ''}>Save${kbd('↵')}</button></div></div>`; }
    if(p.type === 'fix'){ const c = calc(U.who, U.day), f = c && c.fixes.find(x => x.k === p.f && (p.f !== 'over' || !p.fa || x.a === p.fa)); if(!f) return '';
      if(f.k === 'noout'){ const E = evid(U.who, U.day, c), O = E.map(x => [hm(x.m), x.l + (x.d ? ' — ' + x.d : '')]).concat([['', 'Type the time they left']]), cu = E.length;   /* Parsec 14.6: the times Parsec can prove */
        return `<div class="tg-pop xf tk-pop-w">${hd('No clock out', short(U.day))}<div class="tk-ctx">Clocked in at <b>${hm(c.D.sh[0][0])}</b> and never clocked out, so the day counts <b>${dur(c.clocked)}</b>. Pick when ${otherT() ? esc(TF(U.who)) : 'you'} really left:</div>
        ${O.map((o, i) => `<button class="tk-opt${p.o === i ? ' on' : ''}" data-a="fset" data-o="${i}">${kbd(i + 1)}<b>${o[0] ? 'Clock out at ' + o[0] : 'Another time'}</b><small>${esc(o[1])}</small></button>`).join('')}
        ${p.o === cu ? `<label class="tk-f" style="margin-top:6px"><span>Clock out at</span><input class="tk-tin" data-in="fo" value="${esc(p.t || '')}" placeholder="15:45"></label>${tinHint()}` : ''}
        ${whyRow(p, U.who)}<div class="tg-acts"><span class="hint">The day becomes ${p.o != null && p.o < cu ? dur(E[p.o].m - c.D.sh[0][0]) : '—'} clocked</span><button class="btn btn-sm btn-primary" data-a="fgo"${p.o == null || needWhy(p) ? ' disabled' : ''}>${mustAsk(U.who) ? 'Send to ' + esc(PG.first(lead())) : 'Clock out'}${kbd('↵')}</button></div></div>`; }
      const A = c.ps.find(x => x.id === f.a), Bp = c.ps.find(x => x.id === f.b); if(!A || !Bp) return '';
      const n0 = Math.round(f.to - f.from), mid = Math.round((f.from + f.to) / 2), O = [[`End ${A.ro === 'SHOP' ? 'shop time' : A.ro} at ${hm(Bp.s)}`, `${A.ro === 'SHOP' ? 'Shop time' : A.ro} loses ${n0} min`], [`Start ${Bp.ro === 'SHOP' ? 'shop time' : Bp.ro} at ${hm(A.e2)}`, `${Bp.ro === 'SHOP' ? 'Shop time' : Bp.ro} loses ${n0} min`], [`Split the ${n0} min`, `each keeps half — the change at ${hm(mid)}`]];   /* Parsec 14.6: a third way */
      return `<div class="tg-pop xf tk-pop-w">${hd('Punches overlap', short(U.day))}<div class="tk-ctx"><b>${esc(A.ro)}</b> ran to ${hm(A.e2)} and <b>${esc(Bp.ro)}</b> started at ${hm(Bp.s)} — the same ${Math.round(f.to - f.from)} minutes counted twice.</div>
        ${O.map((o, i) => `<button class="tk-opt${p.o === i ? ' on' : ''}" data-a="fset" data-o="${i}"${i > 0 && Bp.e != null && A.e2 >= Bp.e ? ' disabled' : ''}>${kbd(i + 1)}<b>${o[0]}</b><small>${o[1]}</small></button>`).join('')}
        ${whyRow(p, U.who)}<div class="tg-acts"><span class="hint">Marked as edited</span><button class="btn btn-sm btn-primary" data-a="fgo"${p.o == null || needWhy(p) ? ' disabled' : ''}>${mustAsk(U.who) ? 'Send to ' + esc(PG.first(lead())) : 'Fix it'}${kbd('↵')}</button></div></div>`; }
    if(p.type === 'why'){ const f = findP(p.pid); if(!f) return ''; const x = f.p;
      return `<div class="tg-pop xf tk-pop-w">${hd('Why the change?', `${x.ro === 'SHOP' ? 'Shop time' : esc(x.ro)} · ${p.edge === 'e' ? 'stop' : 'start'} ${hm(p.o)} → ${hm(p.n)}`)}<div class="tk-ctx">${otherT() ? `This is <b>${esc(f.t)}</b>’s time. The reason shows on ${esc(TF(f.t))}’s day and on the day report.` : 'The reason and the time before show on the day and on the day report.'}</div>
        ${whyRow(p, f.t).replace(/^<span class="tg-lbl top">[^<]*<\/span>/, '')}
        <div class="tg-acts"><button class="btn btn-sm tg-gh" data-a="wcancel">Put it back</button><span class="hint"></span><button class="btn btn-sm btn-primary" data-a="wgo"${needWhy(p) ? ' disabled' : ''}>Save change${kbd('↵')}</button></div></div>`; }
    if(p.type === 'notes'){ const ids = p.ids || (p.ids = missNotes(sgT(), perDays(U.per)).map(x => x.p.id)), left = ids.filter(id => { const f = findP(id); return f && !String(f.raw.notes || '').trim(); }).length;
      return `<div class="tg-pop xf tk-pop-n">${hd('Punches without a work note', PER(U.per)[1])}<div class="tk-ctx">The timesheet can’t be signed until every punch has a note. Each one saves to its punch.</div>
        <div class="tk-nl">${ids.map(id => { const f = findP(id); if(!f) return ''; const x = f.p; return `<label class="tk-nr"><span class="m"><span class="d">${short(f.k)}</span><span class="no">${esc(x.ro)}</span><span class="cm">${esc(x.cm)}</span><small>${hm(x.s)}–${hm(x.e)}</small></span><input data-in="note" data-nid="${id}" value="${esc(f.raw.notes || '')}" placeholder="What was done"></label>`; }).join('')}</div>
        <div class="tg-acts"><span class="hint tk-nleft">${left ? left + ' left' : 'All done'}</span><button class="btn btn-sm btn-primary" data-a="notesgo">Done${kbd('↵')}</button></div></div>`; }
    /* Parsec 15: a reason for air — quick reasons + your own words; a note, no time changes */
    if(p.type === 'airwhy'){ const L = AIRWHY, oth = p.whyO || (p.why && L.indexOf(p.why) < 0), cur = airFor(U.who, U.day, p.from, p.to);
      return `<div class="tg-pop xf tk-pop-w">${hd('Why was there no work?', `Air · ${hm(p.from)}–${hm(p.to)} · ${dur(p.to - p.from)}`)}<div class="tk-ctx">A note on this air — it doesn’t change any time. It shows on the day, the Shop view and the day report.</div>
        <div class="tg-r tk-why">${L.map(w => `<button class="tg-chip${p.why === w ? ' on' : ''}" data-a="pset" data-f="why" data-v="${esc(w)}">${esc(w)}</button>`).join('')}<button class="tg-chip${oth ? ' on' : ''}" data-a="whyo">Other…</button></div>${oth ? `<input class="tk-whyo" data-in="why" value="${esc(p.why && L.indexOf(p.why) < 0 ? p.why : '')}" placeholder="In your own words">` : ''}
        <div class="tg-acts">${cur ? `<button class="btn btn-sm tg-gh" data-a="awclr">Clear</button>` : ''}<span class="hint">${cur && cur.by ? 'Last by ' + esc(isMine(cur.by) ? 'you' : PG.first(cur.by)) : ''}</span><button class="btn btn-sm btn-primary" data-a="awgo"${needWhy(p) ? ' disabled' : ''}>Save${kbd('↵')}</button></div></div>`; }
    if(p.type === 'air'){ const c = calc(U.who, U.day); if(!c) return ''; const seen = {}, recent = c.ps.filter(x => x.ro !== 'SHOP' && !seen[x.opId] && (seen[x.opId] = 1)).slice(-4);
      return `<div class="tg-pop xf tk-pop-w">${hd('Fill the air', `${hm(p.from)}–${hm(p.to)} · ${dur(p.to - p.from)}`)}${recent.length ? `<span class="tg-lbl top">On a job</span>${recent.map(r => `<button class="tk-ro${p.op === r.opId ? ' on' : ''}" data-a="aset" data-ro="${r.roId}" data-op="${r.opId}"><span class="no">${esc(r.ro)}</span><span class="cm">${esc(r.cm)}</span></button>`).join('')}` : ''}
        <span class="tg-lbl top" style="margin-top:8px">Or shop time</span><div class="tg-r">${SHOP_OPS.map(w => `<button class="tg-chip${p.op === w[0] ? ' on' : ''}" data-a="aset" data-ro="${SHOP_RO_ID}" data-op="${w[0]}">${esc(w[1])}</button>`).join('')}</div>
        <div class="tg-acts"><span class="hint">Adds a punch for the whole gap</span><button class="btn btn-sm btn-primary" data-a="ago"${p.op ? '' : ' disabled'}>Add punch${kbd('↵')}</button></div></div>`; }
    /* Parsec 14.6: split a punch — at a time, the part after it can go to another job */
    if(p.type === 'split'){ const f = findP(p.pid); if(!f || f.p.e == null) return ''; const x = f.p, c = calc(f.t, f.k), mid = Math.round((x.s + x.e) / 2), at = p.v != null ? p.v : hm(mid), mm = pm(at, mid);
      const seen = {}, recent = c ? c.ps.filter(q => q.ro !== 'SHOP' && q.opId !== x.opId && !seen[q.opId] && (seen[q.opId] = 1)).slice(-4) : [], cur = p.op || x.opId;
      return `<div class="tg-pop xf tk-pop-w">${hd('Split the punch', `${x.ro === 'SHOP' ? 'Shop time' : esc(x.ro)} · ${hm(x.s)}–${hm(x.e)}`)}<div class="tk-ctx">Two punches from one — the part after the time can go to another job.</div>
        <div class="tk-tg"><label class="tk-f"><span>Split at</span><input class="tk-tin" data-in="spl" value="${esc(at)}" data-cur="${mid}"></label><span class="tk-f"><span>Before · after</span><span class="ro tk-spd">${mm != null && mm > x.s && mm < x.e ? dur(mm - x.s) + ' · ' + dur(x.e - mm) : '—'}</span></span></div>${tinHint()}
        <span class="tg-lbl top">The part after goes to</span><button class="tk-ro${cur === x.opId ? ' on' : ''}" data-a="aset" data-ro="${esc(x.roId)}" data-op="${esc(x.opId)}"><span class="no">${esc(x.ro === 'SHOP' ? 'Shop' : x.ro)}</span><span class="cm">The same job — two punches</span></button>${recent.map(r => `<button class="tk-ro${cur === r.opId ? ' on' : ''}" data-a="aset" data-ro="${esc(r.roId)}" data-op="${esc(r.opId)}"><span class="no">${esc(r.ro)}</span><span class="cm">${esc(r.cm)}</span></button>`).join('')}
        <div class="tg-r" style="margin-top:6px">${SHOP_OPS.map(w => `<button class="tg-chip${cur === w[0] ? ' on' : ''}" data-a="aset" data-ro="${SHOP_RO_ID}" data-op="${w[0]}">${esc(w[1])}</button>`).join('')}</div>
        ${whyRow(p, f.t)}<div class="tg-acts"><span class="hint">Both parts show as edited</span><button class="btn btn-sm btn-primary" data-a="splitgo"${needWhy(p) ? ' disabled' : ''}>${mustAsk(f.t) ? 'Send to ' + esc(PG.first(lead())) : 'Split'}${kbd('↵')}</button></div></div>`; }
    /* Parsec 14.6: sign with a note — the approver reads it */
    if(p.type === 'signnote'){ const L = perDays(U.per), t = sgT(), fd = L.filter(k => { const c = calc(t, k); return c && c.fixes.length; }).length, mn = missNotes(t, L).length;
      const open = [fd ? fd + ' day' + (fd > 1 ? 's' : '') + ' still to fix' : '', mn ? mn + ' punch' + (mn > 1 ? 'es' : '') + ' without a work note' : ''].filter(Boolean).join(' · ');
      return `<div class="tg-pop xf tk-pop-w">${hd('Sign with a note', PER(U.per)[1])}<div class="tk-ctx">${open ? esc(open) + '. ' : ''}${esc(PG.first(lead()))} reads your note before approving.</div>
        <label class="tk-f"><span>Note to ${esc(PG.first(lead()))}</span><textarea data-in="sn" rows="3" placeholder="e.g. Thursday I left at 15:10 — I forgot to clock out">${esc(p.n || '')}</textarea></label>
        <div class="tg-acts"><span class="hint"></span><button class="btn btn-sm btn-primary" data-a="tsignn"${String(p.n || '').trim() ? '' : ' disabled'}>${ic('pencil', 14)}Sign with this note</button></div></div>`; }
    /* Parsec 14.6: the whole crew at once — clock out, lunch or shop time for everyone picked in the Shop view */
    if(p.type === 'crew'){ const N = crewList(), m0 = p.mode; if(!N.length) return '';
      const T = m0 === 'out' ? ['Clock out', 'Everyone picked who’s still on the clock — a running job stops then too'] : m0 === 'lunch' ? ['Lunch', 'Splits each day clock — off the clock for this time'] : ['Shop time', 'A shop-time punch for each person picked'];
      return `<div class="tg-pop xf tk-pop-w">${hd(T[0], N.length + ' picked · ' + short(U.day))}<div class="tk-ctx">${esc(T[1])}.<br><small>${N.map(t => esc(PG.first(t))).join(', ')}</small></div>
        ${m0 === 'shop' ? `<div class="tg-r">${SHOP_OPS.map(w => `<button class="tg-chip${p.op === w[0] ? ' on' : ''}" data-a="pset" data-f="op" data-v="${w[0]}">${esc(w[1])}</button>`).join('')}</div>` : ''}
        <div class="tk-tg"><label class="tk-f"><span>${m0 === 'out' ? 'At' : 'From'}</span><input class="tk-tin" data-in="cra" value="${esc(p.a)}" data-cur="${pm(p.a) == null ? '' : pm(p.a)}"></label>${m0 === 'out' ? '' : `<label class="tk-f"><span>To</span><input class="tk-tin" data-in="crb" value="${esc(p.b)}" data-cur="${pm(p.b) == null ? '' : pm(p.b)}"></label>`}</div>${tinHint()}
        ${whyRow(p, N[0])}<div class="tg-acts"><span class="hint">Each person sees the reason on their day</span><button class="btn btn-sm btn-primary" data-a="crewgo"${needWhy(p) || (m0 === 'shop' && !p.op) ? ' disabled' : ''}>Do it for ${N.length}${kbd('↵')}</button></div></div>`; }
    return '';
  }
  const tinHint = () => `<div class="tk-tinh">Type 715 · 3:45p · +10 or -5 · ${kbd('↑')}${kbd('↓')} a minute, with ${kbd('⇧')} five</div>`;
  /* Parsec 14.6: split and merge */
  function nextSame(f){ const c = calc(f.t, f.k); if(!c || f.p.e == null) return null; const L = c.ps.filter(q => q.e != null), i = L.findIndex(q => q.id === f.p.id), n = i > -1 ? L[i + 1] : null;
    return n && n.opId === f.p.opId && n.roId === f.p.roId && n.s >= f.p.e - 0.5 && n.s - f.p.e <= 30 ? n : null; }
  function toolsRow(f){ const n = nextSame(f), lk = isLocked(f.t, f.k); if(lk) return '';
    return `<span class="tk-tools">${f.p.e - f.p.s >= 10 ? `<button class="btn btn-sm" data-a="pop" data-p="split" data-pid="${f.p.id}" title="Two punches from one">${ic('split', 13)}Split…</button>` : ''}${n ? `<button class="btn btn-sm" data-a="merge" data-pid="${f.p.id}" title="${esc((n.ro === 'SHOP' ? 'Shop time' : n.ro) + ' again at ' + hm(n.s) + (n.s > f.p.e ? ' — the ' + Math.round(n.s - f.p.e) + ' min between joins it' : ''))}">${ic('merge', 13)}Merge with the next</button>` : ''}</span>`; }
  const crewList = () => techs().filter(t => U.crew && U.crew[t]);
  /* Parsec 15: the stored reason that overlaps an air span most */
  function airFor(t, k, from, to){ let best = null, bo = 0; airWhys(t, k).forEach(w => { const o = Math.min(to, w.to) - Math.max(from, w.from); if(o > bo){ bo = o; best = w; } }); return best; }
  /* Parsec 12.7: the running punch's operation — this RO's, the person's other ROs', or shop time; the start stays */
  function mvPick(p, f){ const raw = f.raw, ro = getRO(raw.roId), n = ro ? (ro.operations || []).findIndex(o => o.id === raw.opId) + 1 : 0, x = f.p;
    const to = p.mop ? (findT(raw, p.mro, p.mop) || null) : null;
    const opNo = (no, k) => String(no || '').replace(/^RO\s*/, '') + (k ? ' · Op ' + k : '');
    const curL = to ? [to.k === 'shop' ? 'Shop' : opNo(to.no, to.n), to.cm] : [x.ro === 'SHOP' ? 'Shop' : opNo(x.ro, n), x.ro === 'SHOP' ? x.shop : x.cm];
    let h = `<span class="tg-lbl top">Operation</span><button class="tk-ro tk-opb${to ? ' on' : ''}" data-a="pmvo" aria-expanded="${p.mvOpen ? 'true' : 'false'}"><span class="no">${esc(curL[0])}</span><span class="cm">${esc(curL[1] || '')}</span>${ic(p.mvOpen ? 'chevU' : 'chevD', 12)}</button>`;
    if(to) h += `<div class="tk-was tk-mvn">${ic('swap', 11)} Moves from ${esc(x.ro === 'SHOP' ? 'shop time' : x.ro + (n ? ' · Op ' + n : ''))} — keeps the start, ${hm(x.s)}</div>`;
    if(p.mvOpen){ const G = rcTargets(raw); h += `<div class="tk-mvl">${G.length ? G.map(g => `<div class="tk-mih">${esc(g.t)}</div>` + g.L.map(t => `<button class="tk-ro${p.mop === t.opId ? ' on' : ''}" data-a="pmvs" data-ro="${esc(t.roId)}" data-op="${esc(t.opId)}"><span class="no">${esc(g.k === 'shop' ? 'Shop' : g.k === 'ro' ? 'Op ' + t.n : opNo(t.no, t.n))}</span><span class="cm">${esc(t.cm)}</span></button>`).join('')).join('') : '<div class="tk-mih">No other operation to move it to</div>'}${to ? `<button class="tk-ro" data-a="pmvs" data-ro="${esc(raw.roId)}" data-op="${esc(raw.opId)}"><span class="no">${ic('x', 11)}</span><span class="cm">Leave it where it is</span></button>` : ''}</div>`; }
    return h; }
  function findT(raw, roId, opId){ let hit = null; rcTargets(raw).forEach(g => g.L.forEach(t => { if(t.roId === roId && t.opId === opId) hit = Object.assign({ k: g.k }, t); })); return hit; }
  /* ---------- changing the punches and the day clocks ---------- */
  const rd = () => { flush(); PG.keepScroll(render); };
  const isoAt = (k, m) => { const d = dOf(k); d.setMinutes(Math.round(m)); return d.toISOString(); };
  function mark(raw, why){ if(!raw.edited){ raw.edited = true; raw.originalStart = raw.start; raw.originalStop = raw.stop; } raw.editedAt = nowIso(); if(ME().name) raw.editBy = ME().name; raw.editWhy = why || raw.editWhy || ''; }   /* Parsec 14.6: who and why on every change */
  function setTimes(raw, k, s, e, why){ const was = !raw.stop; mark(raw, why); if(s != null) raw.start = isoAt(k, s); if(e != null) raw.stop = isoAt(k, e); if(was && raw.stop) creditBurnt(raw); }
  function shiftsOf(t, k){ return shiftsForDate(k).filter(s => shOwn(s, t)); }
  function permT(){ if(typeof can !== 'function' || !viewAsStaff()) return true; return permOk(U.who && U.who !== 'ALL' && !isMine(U.who) ? 't.editall' : 't.editown'); }   /* Parsec 13 */
  function locked(ask){ if(!mayFix(U.who) && !(ask && mustAsk(U.who))){ permT(); return true; } if(isLocked(U.who, U.day)){ pushToast(`Locked — ${PER(perStart(U.day) === PER('prev')[0] ? 'prev' : 'cur')[1]} was approved. ${role() === 'foreman' ? 'Reopen it on the timesheet to change it.' : 'Ask ' + PG.first(lead()) + ' to reopen it.'}`); return true; } return false; }
  /* ---------- Parsec 14.6: the fixes, in one place — Fix these, the pop-overs, the crew bar and approved asks all run these ---------- */
  const cap = x => x.charAt(0).toUpperCase() + x.slice(1), nmP = q => q.ro === 'SHOP' ? 'shop time' : q.ro;
  const ACT = {
    out: (t, k, a, why) => { const c = calc(t, k), sh = shiftsOf(t, k).filter(s => !s.out).pop(); if(!c || !sh) return { err: 'That day clock is already closed.' }; if(a.m == null) return { err: 'Type a time like 15:45.' };
      if(a.m <= mOf(sh.in, k)) return { err: 'That’s before the clock in.' }; if(k === TODAY && a.m > NOW) return { err: 'That’s later than now.' };
      sh.out = isoAt(k, a.m); sh.outReason = 'End of day'; sh.fixed = { by: ME().name, at: nowIso(), why: why || '' }; return `Clocked out at ${hm(a.m)} on ${short(k)} — the day is ${dur(a.m - c.D.sh[0][0] - c.lunchM)}`; },
    over: (t, k, a, why) => { const c = calc(t, k), f = c && c.fixes.find(x => x.k === 'over' && x.a === a.fa); if(!f) return { err: 'Those punches don’t overlap any more.' }; const A = findP(f.a), B = findP(f.b); if(!A || !B) return { err: 'Those punches changed — try again.' };
      if(a.o === 0) setTimes(A.raw, k, null, B.p.s, why); else if(a.o === 1) setTimes(B.raw, k, A.p.e == null ? NOW : A.p.e, null, why); else { const mid = Math.round((f.from + f.to) / 2); setTimes(A.raw, k, null, mid, why); setTimes(B.raw, k, mid, null, why); }
      return a.o === 2 ? `Overlap split at ${hm(Math.round((f.from + f.to) / 2))}` : 'Overlap fixed'; },
    inmv: (t, k, a, why) => { const sh = shiftsOf(t, k)[0]; if(!sh) return { err: 'No clock in that day.' }; if(a.m == null || a.m >= mOf(sh.in, k)) return { err: 'That’s not before the clock in.' };
      if(!sh.edited){ sh.edited = true; sh.originalIn = sh.in; } const was = mOf(sh.in, k); sh.in = isoAt(k, a.m); sh.editedAt = nowIso(); sh.editBy = ME().name; sh.editWhy = why || ''; return `Clocked in at ${hm(a.m)} — was ${hm(was)}`; },
    trimin: (t, k, a, why) => { const P = findP(a.fa), c = calc(t, k); if(!P || !c || !c.segs.length) return { err: 'That punch changed — try again.' }; const s0 = c.segs[0][0];
      if(P.p.e != null && P.p.e - s0 < 5) return { err: 'That leaves under 5 min — move the clock-in instead.' }; setTimes(P.raw, k, s0, null, why); return `${cap(nmP(P.p))} starts at the clock-in, ${hm(s0)}`; },
    outmv: (t, k, a, why) => { const sh = shiftsOf(t, k).filter(s => s.out).pop(); if(!sh || a.m == null) return { err: 'No clock out that day.' }; if(!sh.originalOut) sh.originalOut = sh.out;
      sh.out = isoAt(k, a.m); sh.fixed = { by: ME().name, at: nowIso(), why: why || '' }; return `Clocked out at ${hm(a.m)}`; },
    trimout: (t, k, a, why) => { const P = findP(a.fa), c = calc(t, k); if(!P || !c) return { err: 'That punch changed — try again.' }; const e0 = c.segs[c.segs.length - 1][1];
      if(e0 - P.p.s < 5) return { err: 'That leaves under 5 min — move the clock-out instead.' }; setTimes(P.raw, k, null, e0, why); return `${cap(nmP(P.p))} stops at the clock-out, ${hm(e0)}`; },
    lunch: (t, k, a, why) => { const at = a.m, en = a.b != null ? a.b : at + 30; if(at == null || en <= at) return { err: 'Type times like 12:00.' };
      const sh = shiftsOf(t, k).find(s => { const x = mOf(s.in, k), y = s.out ? mOf(s.out, k) : (k === TODAY ? NOW : 1440); return x <= at && en <= y; }); if(!sh) return { err: `Not on the clock ${hm(at)}–${hm(en)}` };
      shiftList().push({ id: uid('sh'), in: isoAt(k, en), out: sh.out, outReason: sh.outReason || null, by: sh.by || t, fixed: { by: ME().name, at: nowIso(), why: why || '' } }); sh.out = isoAt(k, at); sh.outReason = 'Lunch';
      return `Lunch ${hm(at)}–${hm(en)} — off the clock`; },
    lunchok: (t, k) => { ok()['lunch|' + t + '|' + k] = nowIso(); return 'Okay — no lunch that day'; },
    times: (t, k, a, why) => { const P = findP(a.pid); if(!P) return { err: 'That punch is gone.' }; setTimes(P.raw, k, a.s, a.e, why); if(a.er && P.raw.stop && !P.raw.stopReason) P.raw.stopReason = a.er; return `${cap(nmP(P.p))} · ${hm(a.s)}–${a.e == null ? 'now' : hm(a.e)}`; },
    shin: (t, k, a, why) => { const sh = shiftList().find(q => q.id === a.sid); const r = rcShiftIn(sh, new Date(isoAt(k, a.m)).getTime(), { by: ME().name, why, noUndo: true }); return r.ok ? `Clocked in at ${hm(a.m)}` : { err: r.msg }; },
    fill: (t, k, a, why) => { const shp = a.ro === SHOP_RO_ID; STATE.punches.push({ id: uid('pn'), roId: a.ro, opId: a.op, start: isoAt(k, a.from), stop: isoAt(k, a.to), startReason: shp ? 'Shop time' : 'Repairing', stopReason: 'Switched job', notes: '', manual: true, addedByHand: true, by: t, editBy: ME().name, editWhy: why || '' });
      if(!shp){ const ro = getRO(a.ro), op = ro && ro.operations.find(o => o.id === a.op); if(op && typeof op.burnt === 'number') op.burnt = Math.round((op.burnt + (a.to - a.from) / 60) * 100) / 100; } return `${dur(a.to - a.from)} added to ${shp ? 'shop time' : roTag(getRO(a.ro))}`; },
    del: (t, k, a) => { const P = findP(a.pid); if(!P) return { err: 'That entry is gone already.' }; const lbl = `${cap(nmP(P.p))} ${hm(P.p.s)}–${hm(P.p.e2 != null ? P.p.e2 : P.p.e)}`;
      if(typeof v150PunchGone !== 'function' || !v150PunchGone(P.raw)) return { err: 'Couldn’t delete it.' }; return `Deleted ${lbl} — it counts as air now`; },   /* Parsec 15 */
    split: (t, k, a, why) => { const P = findP(a.pid); if(!P || P.p.e == null) return { err: 'Pick a stopped punch.' }; const m = a.m; if(m == null || m < P.p.s + 5 || m > P.p.e - 5) return { err: `Split between ${hm(P.p.s + 5)} and ${hm(P.p.e - 5)}.` };
      const raw = P.raw, ro = a.ro || raw.roId, op = a.op || raw.opId, same = ro === raw.roId && op === raw.opId, e0 = raw.stop, er0 = raw.stopReason, os = raw.originalStart || raw.start, oe = raw.originalStop || raw.stop;
      setTimes(raw, k, null, m, why); if(!same) raw.stopReason = 'Switched job';
      STATE.punches.push({ id: uid('pn'), roId: ro, opId: op, start: isoAt(k, m), stop: e0, startReason: ro === SHOP_RO_ID ? 'Shop time' : same ? raw.startReason : 'Switched job', stopReason: er0 || 'Switched job', notes: '', by: punchWho(raw), edited: true, originalStart: os, originalStop: oe, editedAt: nowIso(), editBy: ME().name, editWhy: why || '', splitFrom: raw.id, burntCredited: raw.burntCredited });
      try{ syncAllBurnt(); }catch(e){} const to = same ? 'two punches' : ro === SHOP_RO_ID ? 'the rest to shop time' : 'the rest to ' + roTag(getRO(ro)); return `Split at ${hm(m)} — ${to}`; },
    merge: (t, k, a, why) => { const A = findP(a.pid), B = findP(a.nid); if(!A || !B) return { err: 'Those punches changed — try again.' }; const ra = A.raw, rb = B.raw;
      mark(ra, why); ra.stop = rb.stop; ra.stopReason = rb.stopReason || ra.stopReason; const nt = [ra.notes, rb.notes].map(x => String(x || '').trim()).filter(Boolean); ra.notes = nt.filter((x, i) => nt.indexOf(x) === i).join('\n');
      const i = STATE.punches.indexOf(rb); if(i > -1) STATE.punches.splice(i, 1); try{ syncAllBurnt(); }catch(e){} U.sel = ra.id; return `Merged — ${nmP(A.p)} ${hm(A.p.s)}–${hm(B.p.e)} is one punch`; }
  };
  function runFix(t, k, x, a, why, label){ if(!t || t === 'ALL' || !ACT[x]) return false; if(isLocked(t, k)){ pushToast('Locked — that period was approved. ' + (role() === 'foreman' ? 'Reopen it on the timesheet to change it.' : 'Ask ' + PG.first(lead()) + ' to reopen it.')); return false; }
    if(mustAsk(t)) return ask(t, k, x, a, why, label);
    if(!mayFix(t)){ permT(); return false; }
    pushUndo('fix the time'); const r = ACT[x](t, k, a || {}, why || ''); flush(); if(r && r.err){ pushToast(r.err); rd(); return false; }
    U.pop = null; scheduleSave(true); pushToast((r || 'Fixed') + (why ? ' · why: ' + why : '') + '.', true); rd(); return true; }
  function ask(t, k, x, a, why, label){ const dup = reqOpen(t, k).find(r => r.x === x && JSON.stringify(r.a) === JSON.stringify(a)); if(dup){ pushToast('Already asked — waiting for ' + PG.first(lead()) + '.'); return false; }
    pushUndo('ask for a time fix'); reqs().push({ id: uid('tq'), who: t, k, x, a, fk: (a && a.fk) || '', why: why || '', label: label || 'Time fix', by: ME().name, at: nowIso(), st: 'open' }); U.pop = null; scheduleSave(true);
    note(PG.person('Foreman') || PG.person('Manager'), 'ask', `${PG.first(t)} asks for a time fix — ${short(k)}`, (label || 'Time fix') + (why ? ' · ' + why : ''), { who: t, view: 'day', day: k });
    pushToast(`Sent to ${PG.first(lead())} — it changes when it’s approved.`, true); rd(); return true; }
  const FXWHY = { out: 'Forgot to clock out', outmv: 'Forgot to clock out', over: 'Forgot to stop the clock', inmv: 'Forgot to clock in', trimin: 'Forgot to clock in', trimout: 'Forgot to stop the clock', lunch: 'Forgot to clock out for lunch', lunchok: 'Worked through lunch' };
  /* the crew: one change for each person picked */
  const CREW = {
    out: (t, k, a, b, why) => { const c = calc(t, k); if(!c || !c.open) return { err: 'not on the clock' };
      const run = STATE.punches.filter(q => !q.stop && techSame(punchWho(q), t) && localDay(q.start) === k); if(run.some(q => mOf(q.start, k) >= a)) return { err: 'a job started after ' + hm(a) };
      run.forEach(q => { q.stop = isoAt(k, a); q.stopReason = 'End of day'; creditBurnt(q); }); return ACT.out(t, k, { m: a }, why); },
    lunch: (t, k, a, b, why) => { const c = calc(t, k); if(!c) return { err: 'not in' }; if(c.ps.some(q => q.s < b && q.e2 > a)) return { err: 'on a job then' }; return ACT.lunch(t, k, { m: a, b }, why); },
    shop: (t, k, a, b, why, p) => { const c = calc(t, k); if(!c) return { err: 'not in' }; return ACT.fill(t, k, { ro: SHOP_RO_ID, op: p.op, from: a, to: b }, why); }
  };
  function limits(k, pid, edge){
    const c = calc(U.who, k), p = c.ps.find(x => x.id === pid), ps = c.ps, i = ps.findIndex(x => x.id === pid), today = k === TODAY, pe = p.e == null ? NOW : p.e;
    const prev = ps.slice(0, i).filter(x => x.e2 <= p.s + 1).pop() || null, next = ps.slice(i + 1).find(x => x.s >= pe - 1) || null;
    const seg = c.segs.find(x => p.s >= x[0] - 1 && p.s <= (x[1] == null ? 1440 : x[1]) + 1) || c.segs[0] || [0, 1440, '', null];
    if(edge === 's'){ const lo1 = c.D.virt ? 0 : seg[0], lo2 = prev ? prev.e2 : -1e9, lo = Math.max(lo1, lo2); return { lo, hi: pe - 5, loWhy: prev && lo2 >= lo1 ? { k: 'meet', p: prev } : { k: 'in', t: lo1 }, hiWhy: { k: 'min' } }; }
    const segEnd = c.D.virt ? (today ? NOW : 1440) : seg[3] == null ? (today ? NOW : (seg[1] == null ? 1440 : seg[1])) : seg[3], hi2 = next ? next.s : 1e9, hi = Math.min(segEnd, hi2);
    return { lo: p.s + 5, hi, loWhy: { k: 'min' }, hiWhy: next && hi2 <= segEnd ? { k: 'meet', p: next } : { k: seg[3] == null && today ? 'now' : 'out', t: segEnd, why: seg[2] } };
  }
  function dragTo(m){ const d = U.drag; d.v = null; flush(); const L = limits(U.day, d.pid, d.edge);
    let v = Math.round(m / U.snap) * U.snap, hit = null;
    if(Math.abs(m - L.hi) <= 3) v = L.hi; if(Math.abs(m - L.lo) <= 3) v = L.lo;
    if(v >= L.hi){ v = L.hi; hit = L.hiWhy; } else if(v <= L.lo){ v = L.lo; hit = L.loWhy; }
    d.v = v; d.hit = hit; flush(); }
  function finishDrag(){ const d = U.drag; if(!d) return; const f = findP(d.pid); if(!f || d.v == null){ U.drag = null; rd(); return; }
    const o = d.edge === 'e' ? d.orig.e : d.orig.s, n = d.v;
    if(o === n){ U.drag = null; rd(); return; }
    d.pending = true; U.pop = { type: 'why', pid: d.pid, edge: d.edge, o, n }; const el = document.querySelector(`[data-pg="timelog"] .tk-tl .tk-b[data-p="${d.pid}"]`); PG.anchor(U, el); rd(); }   /* Parsec 14.6: a reason on every change */
  function commitDrag(why){ const d = U.drag, f = findP(d.pid); U.drag = null; if(!f) return rd();
    pushUndo('edit punch'); setTimes(f.raw, f.k, d.edge === 's' ? d.v : null, d.edge === 'e' ? d.v : null, why); scheduleSave(true); flush();
    const x = findP(d.pid).p; pushToast(`${x.ro === 'SHOP' ? 'Shop time' : x.ro} · ${d.edge === 'e' ? 'stop' : 'start'} ${hm(d.edge === 'e' ? d.orig.e : d.orig.s)} → ${hm(d.v)} · ${dur((x.e == null ? NOW : x.e) - x.s)} long${why ? (otherT() ? ' · ' + PG.first(f.t) + ' sees why' : ' · why: ' + why) : ''}`, true); rd(); }
  let NT = 0;
  /* Parsec 14.6: Alt ← → moves the edge like a drag; Enter asks why and saves, Esc puts it back */
  function nudge(edge, dv){ if(mustAsk(U.who)){ pushToast('Press E and send the change to ' + PG.first(lead()) + '.'); return; } if(locked()) return;
    const f = U.sel && findP(U.sel); if(!f || (edge === 'e' && f.p.e == null)) return;
    let d = U.drag; if(!d || d.pid !== f.p.id || d.edge !== edge || d.pending){ if(d && d.v != null && !d.pending) return finishDrag(); d = U.drag = { pid: f.p.id, edge, orig: { s: f.p.s, e: f.p.e }, v: null, nud: 1 }; }
    const L = limits(U.day, f.p.id, edge), cur = d.v != null ? d.v : (edge === 'e' ? d.orig.e : d.orig.s), v = Math.max(L.lo, Math.min(L.hi, cur + dv));
    if(v === cur){ pushToast(`The ${edge === 'e' ? 'stop' : 'start'} can’t move further that way.`); return; }
    NT = Date.now(); d.v = v; d.hit = v >= L.hi ? L.hiWhy : v <= L.lo ? L.loWhy : null; U.kh = false; flush(); rd(); }
  function note(to, k, t, b, x){ if(typeof IB === 'undefined' || !to) return; IB.send({ to, k, src: 'timelog', t, b: b || '', acts: [['Open the timesheet', 'tl']], x: x || null }); }
  const H = {
    day: t => { U.day = t.dataset.k; U.sel = null; U.kb = false; U.pop = null; if(U.view !== 'day' && U.view !== 'week') U.view = 'day'; rd(); },
    wday: t => { U.day = t.dataset.k; U.view = 'day'; U.sel = null; rd(); },
    view: t => { U.view = t.dataset.v; U.pop = null; if(U.who === 'ALL' && U.view !== 'shop') U.who = techs()[0] || null; rd(); },
    pop: t => { const p = U.pop, ty = t.dataset.p; if(p && p.type === ty && !t.dataset.pid && (p.mode || '') === (t.dataset.m || '')){ U.pop = null; rd(); return; }
      if(['edit', 'fix', 'air', 'shin', 'split'].includes(ty) && locked(true)) return;
      const ex = { type: ty }; if(t.dataset.pid) ex.pid = t.dataset.pid; if(t.dataset.sid) ex.sid = t.dataset.sid; if(t.dataset.f) ex.f = t.dataset.f; if(t.dataset.fa) ex.fa = t.dataset.fa; if(t.dataset.o != null) ex.o = +t.dataset.o; if(t.dataset.from){ ex.from = +t.dataset.from; ex.to = +t.dataset.to; }
      if(!otherT()){ if(ty === 'shin') ex.why = 'Forgot to clock in'; if(ty === 'fix') ex.why = ex.f === 'noout' ? 'Forgot to clock out' : 'Forgot to stop the clock'; }   /* Parsec 14.6: your own time — the obvious reason picked; someone else's — you pick it */
      if(ty === 'airwhy'){ if(isLocked(U.who, U.day) || !airOk(U.who)) return; const cur = airFor(U.who, U.day, ex.from, ex.to); if(cur){ ex.why = cur.why; ex.whyO = AIRWHY.indexOf(cur.why) < 0 ? 1 : 0; } }   /* Parsec 15 */
      if(ty === 'crew'){ if(!crewList().length) return; ex.mode = t.dataset.m; const se = shiftEndOf(crewList()[0]); ex.a = ex.mode === 'out' ? hm(U.day === TODAY ? Math.min(NOW, se) : se) : ex.mode === 'lunch' ? '12:00' : '07:00'; ex.b = ex.mode === 'lunch' ? '12:30' : '07:30'; ex.why = ex.mode === 'out' ? 'Forgot to clock out' : ex.mode === 'lunch' ? 'Forgot to clock out for lunch' : ''; }
      U.pop = ex; PG.anchor(U, t); rd(); },
    popx: () => { if(U.drag && U.drag.pending) U.drag = null; U.pop = null; rd(); },
    open: t => { U.open[t.dataset.k] = !U.open[t.dataset.k]; rd(); },
    tofix: () => { const G = groups(); if(G.fix.length){ U.day = G.fix[0]; U.view = 'day'; U.sel = null; rd(); } },
    who: t => { const w = t.dataset.t; U.pop = null; if(w === 'ALL'){ U.who = 'ALL'; U.view = 'shop'; } else { U.who = w; if(U.view === 'shop') U.view = 'day'; if(!dayOf(w, U.day)){ const L = allDays(w); U.day = L.indexOf(TODAY) > -1 || !L.length ? TODAY : L[0]; } } U.sel = null; rd(); },
    psel: t => { U.sel = t.dataset.p; rd(); },
    dnav: t => { const dv = +t.dataset.d; if(U.view === 'day'){ const L = days().slice().reverse(); let i = L.indexOf(U.day); if(i < 0){ U.day = addD(U.day, dv); } else { i += dv; if(i >= 0 && i < L.length) U.day = L[i]; else if(dv > 0 && U.day < TODAY) U.day = TODAY; } }
      else { const k = addD(U.day, dv); if(k <= TODAY) U.day = k; } U.sel = null; rd(); },
    wnav: t => { const k = addD(U.day, +t.dataset.d); if(k <= TODAY){ U.day = k > TODAY ? TODAY : k; rd(); } },
    pset: t => { U.pop[t.dataset.f] = t.dataset.v; if(t.dataset.f === 'why') U.pop.whyO = 0; rd(); },
    whyo: () => { const p = U.pop; if(!p) return; p.whyO = 1; if(WHYS().concat(AIRWHY).indexOf(p.why) > -1) p.why = ''; rd(); setTimeout(() => { const i = document.querySelector('[data-pg="timelog"] .tg-pop .tk-whyo'); if(i) i.focus(); }, 20); },
    /* Parsec 14.6: Fix these, the asks, split / merge, the crew, signing with a note */
    fxdo: t => { const d = t.dataset, a = {}; if(d.m != null) a.m = +d.m; if(d.fa) a.fa = d.fa; if(d.o != null) a.o = +d.o; if(d.fk) a.fk = d.fk; runFix(U.who, d.k, d.x, a, FXWHY[d.x] || '', d.l || t.textContent.trim() + ' · ' + short(d.k)); },
    fxfold: () => { U.fxShut = !U.fxShut; rd(); },
    fxall: () => { U.fxAll = !U.fxAll; rd(); },
    rqok: t => { const r = reqs().find(q => q.id === t.dataset.id); if(!r || r.st !== 'open') return; if(!mayFix(r.who) || isMine(r.who)){ permT(); return; } if(isLocked(r.who, r.k)){ pushToast('Locked — reopen the period first.'); return; }
      pushUndo('approve a time fix'); const m = ACT[r.x](r.who, r.k, r.a || {}, r.why); flush(); if(m && m.err){ pushToast(m.err); rd(); return; }
      r.st = 'ok'; r.doneBy = ME().name; r.doneAt = nowIso(); scheduleSave(true); note(r.who, 'fyi', `Your time fix is approved — ${short(r.k)}`, r.label, { who: r.who, view: 'day', day: r.k }); pushToast(`Approved — ${r.label}.`, true); rd(); },
    rqno: t => { const r = reqs().find(q => q.id === t.dataset.id); if(!r || r.st !== 'open') return; pushUndo('decline a time fix'); r.st = 'no'; r.doneBy = ME().name; r.doneAt = nowIso(); scheduleSave(true);
      note(r.who, 'fyi', `Your time fix was declined — ${short(r.k)}`, r.label + ' · talk to ' + PG.first(ME().name), { who: r.who, view: 'day', day: r.k }); pushToast('Declined — ' + PG.first(r.who) + ' is told.', true); rd(); },
    rqback: t => { const r = reqs().find(q => q.id === t.dataset.id); if(!r || r.st !== 'open') return; pushUndo('take back an ask'); r.st = 'back'; scheduleSave(true); pushToast('Taken back.', true); rd(); },
    merge: t => { const f = findP(t.dataset.pid); if(!f) return; const n = nextSame(f); if(!n) return; runFix(f.t, f.k, 'merge', { pid: f.p.id, nid: n.id }, 'Same job — merged', `${cap(nmP(f.p))} ${hm(f.p.s)}–${hm(n.e)} as one punch`); },
    splitgo: () => { const p = U.pop, f = p && findP(p.pid); if(!f || needWhy(p)) return; const mid = Math.round((f.p.s + f.p.e) / 2), m = pm(p.v != null ? p.v : hm(mid), mid);
      runFix(f.t, f.k, 'split', { pid: f.p.id, m, ro: p.ro || f.raw.roId, op: p.op || f.raw.opId }, String(p.why).trim(), `Split ${nmP(f.p)} at ${m == null ? '?' : hm(m)}`); },
    crew: t => { U.crew = U.crew || {}; const n = t.dataset.t; U.crew[n] = !U.crew[n]; if(U.pop && U.pop.type === 'crew' && !crewList().length) U.pop = null; rd(); },
    crewall: () => { U.crew = U.crew || {}; const T = techs(), all = T.every(t => U.crew[t]); T.forEach(t => { U.crew[t] = !all; }); if(all) U.pop = null; rd(); },
    crewgo: () => { const p = U.pop, N = crewList(), k = U.day; if(!p || !N.length || needWhy(p)) return; const a = pm(p.a), b = pm(p.b, a);
      if(a == null || (p.mode !== 'out' && (b == null || b <= a))){ pushToast('Type times like 12:00.'); return; } if(p.mode === 'shop' && !p.op) return; if(N.some(t => !mayFix(t))){ permT(); return; }
      pushUndo('fix the crew'); let n = 0; const skip = [], why = String(p.why).trim();
      N.forEach(t => { if(isLocked(t, k)){ skip.push(PG.first(t) + ' (locked)'); return; } const r = CREW[p.mode](t, k, a, b, why, p); flush(); if(r && r.err) skip.push(PG.first(t) + ' (' + r.err + ')'); else n++; });
      U.pop = null; if(n) U.crew = {}; scheduleSave(true); pushToast(`${n ? 'Done for ' + n : 'Nothing changed'}${skip.length ? ' · skipped ' + skip.join(', ') : ''}.`, true); rd(); },
    tsignn: () => { const p = U.pop, txt = String((p && p.n) || '').trim(); if(!txt) return; const P = PER(U.per); pushUndo('sign timesheet'); sign()[sgK()] = { tech: stamp(), techAt: nowIso(), note: txt }; U.pop = null; scheduleSave(true);
      note(PG.person('Foreman') || PG.person('Manager'), 'ask', `${PG.first(sgT())} signed the timesheet with a note — ${P[1]}`, txt, { who: sgT(), view: 'sheet', per: U.per });
      pushToast(`Signed with your note — ${P[1]} goes to ${PG.first(lead())} to approve.`, true); rd(); },
    psave: () => { const p = U.pop, f = findP(p.pid); if(!f) return;
      const run = f.p.e == null, s = pm(p.s != null ? p.s : hm(f.p.s), f.p.s); let en = run && !(p.e || '').trim() ? null : pm(p.e != null ? p.e : hm(f.p.e), f.p.e);
      if(run && en != null && s != null && en <= s && f.k < TODAY) en += 1440;   /* Parsec 12.7: a clock left running past midnight */
      if(s == null || (f.p.e != null && en == null) || (en != null && en <= s)){ pushToast('Stop has to come after start — type times like 13:45.'); return; }
      if(en == null && s > NOW && f.k === TODAY){ pushToast('A running punch can’t start in the future.'); return; }
      if(run && en != null && new Date(isoAt(f.k, en)).getTime() > Date.now() + 30000){ pushToast('A stop time can’t be in the future.'); return; }
      if(run && en != null && !p.er){ pushToast('Pick why it stopped — under Stopped as.'); const r0 = document.querySelector('[data-pg="timelog"] .tg-pop .tk-stopas'); if(r0){ r0.hidden = false; r0.classList.add('ask'); } return; }
      const mvTo = run && p.mop && (p.mop !== f.raw.opId || p.mro !== f.raw.roId) ? { ro: p.mro, op: p.mop } : null, by = { by: ME().name, why: p.why };
      const tch = s !== f.p.s || (en != null && en !== f.p.e);   /* Parsec 14.6: a reason when a time or the job changes */
      if(run && en != null && s === f.p.s && needWhy(p)) p.why = 'Forgot to stop the clock';   /* stopping it at the time it really stopped says why by itself */
      if(mvTo && !tch && needWhy(p)) p.why = 'Wrong job or RO';   /* and so does moving the running clock to the right job */
      if((tch || mvTo) && needWhy(p)){ pushToast('Pick why — under Why the change?'); const w0 = document.querySelector('[data-pg="timelog"] .tg-pop .tk-why'); if(w0) w0.classList.add('ask'); return; }
      if(mustAsk(f.t)){ const nt = p.n != null && p.n !== (f.raw.notes || ''); if(nt){ pushUndo('work note'); f.raw.notes = p.n; scheduleSave(true); }
        if(mvTo){ pushToast('Moving the clock to another job needs ' + PG.first(lead()) + ' — ask in person, or stop it and start the right one.'); return; }
        if(tch){ ask(f.t, f.k, 'times', { pid: f.p.id, s, e: en, er: run && en != null ? p.er || 'Switched job' : undefined, fk: 'times|' + f.p.id }, String(p.why).trim(), `${cap(nmP(f.p))} ${hm(s)}–${en == null ? 'now' : hm(en)} instead of ${hm(f.p.s)}–${run ? 'now' : hm(f.p.e)}`); return; }
        U.pop = null; if(nt) pushToast('Note saved.', true); rd(); return; }
      if(mvTo){ const ck = rcMove(f.raw, mvTo.ro, mvTo.op, { check: true }); if(!ck.ok){ pushToast(ck.msg); return; } }
      pushUndo('edit punch'); const raw = f.raw; let mv = null, gap = '';
      if(mvTo) mv = rcMove(raw, mvTo.ro, mvTo.op, Object.assign({ noUndo: true }, by));
      if(tch) setTimes(raw, f.k, s, en, String(p.why || '').trim());
      if(p.sr && !(mv && mv.ok && (mvTo.ro === SHOP_RO_ID))) raw.startReason = p.sr;
      if(run && en != null){ let er = p.er; const op = getOp(raw.roId, raw.opId); if(/^Complete/.test(er) && op && typeof opCompleteGaps === 'function'){ const g = opCompleteGaps(op); if(g.length){ er = 'Hold Tech'; gap = ' Not complete yet — ' + g.map(x => x.t).join(' · ') + ', so it stopped as Hold Tech.'; } } raw.stopReason = er; }
      else if(p.er && raw.stop) raw.stopReason = p.er;
      if(p.n != null) raw.notes = p.n;
      if((tch || mvTo) && p.why){ raw.editBy = ME().name; raw.editWhy = String(p.why).trim(); if(!raw.edited){ raw.edited = true; raw.originalStart = raw.start; raw.originalStop = raw.stop; } }
      U.pop = null; scheduleSave(true); const lbl = mv && mv.ok ? mv.label : (f.p.ro === 'SHOP' ? 'Shop time' : f.p.ro);
      pushToast(`${lbl} · ${hm(s)}–${en == null ? 'now' : hm(en)}${run && en != null ? ' · stopped as ' + raw.stopReason : ''}${mv && mv.ok ? ' · moved from ' + (f.p.ro === 'SHOP' ? 'shop time' : f.p.ro) : ''} saved.${gap}`, true); rd(); },
    pmvo: () => { if(!U.pop) return; U.pop.mvOpen = !U.pop.mvOpen; rd(); },
    pmvs: t => { const p = U.pop, f = p && findP(p.pid); if(!f) return; if(t.dataset.op === f.raw.opId && t.dataset.ro === f.raw.roId){ delete p.mro; delete p.mop; } else { p.mro = t.dataset.ro; p.mop = t.dataset.op; } p.mvOpen = false; rd(); },
    shgo: () => { const p = U.pop, sh = p && shiftList().find(q => q.id === p.sid); if(!sh || needWhy(p)) return; const k = localDay(sh.in), m = pm(p.v != null ? p.v : hm(mOf(sh.in, k)), mOf(sh.in, k));
      if(m == null){ pushToast('Type a time like 07:00.'); return; }
      if(mustAsk(U.who)){ if(m !== mOf(sh.in, k)) ask(U.who, k, 'shin', { sid: sh.id, m, fk: 'shin|' + sh.id }, String(p.why).trim(), `Clock-in ${hm(m)} instead of ${hm(mOf(sh.in, k))}`); return; }
      const r = rcShiftIn(sh, new Date(isoAt(k, m)).getTime(), { by: ME().name, why: String(p.why).trim() });
      if(!r.ok){ pushToast(r.msg); return; } U.pop = null;
      if(r.same){ rd(); return; } pushToast(`Clocked in at ${hm(m)}${r.was ? ' — was ' + hm(mOf(r.was, k)) : ''}${otherT() ? ' · ' + PG.first(U.who) + ' sees why' : ''}.`, true); rd(); },
    pdel: () => { const p = U.pop, f = findP(p.pid); if(!f) return; if(deletePunch(f.raw.id) === false) return; U.pop = null; U.sel = null; scheduleSave(true); pushToast(`Deleted ${f.p.ro === 'SHOP' ? 'shop time' : f.p.ro} ${hm(f.p.s)}–${hm(f.p.e)} — it counts as air now.`, true); rd(); },
    /* Parsec 15: the trash on each entry — one click, Undo in the toast; who must ask sends it as an ask */
    pdelq: t => { const f = findP(t.dataset.pid); if(!f || f.p.e == null) return; if(isLocked(f.t, f.k)){ pushToast('Locked — that period was approved. ' + (role() === 'foreman' ? 'Reopen it on the timesheet to change it.' : 'Ask ' + PG.first(lead()) + ' to reopen it.')); return; }
      const lbl = `${cap(nmP(f.p))} ${hm(f.p.s)}–${hm(f.p.e)}`;
      if(mustAsk(f.t)){ ask(f.t, f.k, 'del', { pid: f.p.id, fk: 'del|' + f.p.id }, '', 'Delete ' + lbl); return; }
      if(deletePunch(f.raw.id) === false) return; if(U.sel === f.p.id) U.sel = null; U.pop = null; scheduleSave(true); flush(); pushToast(`Deleted ${lbl} — it counts as air now.`, true); rd(); },
    awgo: () => { const p = U.pop; if(!p || p.type !== 'airwhy' || needWhy(p)) return; const t = U.who, k = U.day; if(isLocked(t, k) || !airOk(t)) return; const why = String(p.why).trim();
      pushUndo('air reason'); const A = airAll(), key = t + '|' + k, L = Array.isArray(A[key]) ? A[key] : (A[key] = []), cur = airFor(t, k, p.from, p.to);
      if(cur) Object.assign(cur, { from: p.from, to: p.to, why, by: ME().name || '', at: nowIso() }); else L.push({ id: uid('aw'), from: p.from, to: p.to, why, by: ME().name || '', at: nowIso() });
      U.pop = null; scheduleSave(true); flush(); pushToast(`Air ${hm(p.from)}–${hm(p.to)} · ${why}.`, true); rd(); },
    awclr: () => { const p = U.pop; if(!p) return; const t = U.who, k = U.day, A = airAll(), L = A[t + '|' + k], cur = airFor(t, k, p.from, p.to); if(!cur || !Array.isArray(L)) return; if(isLocked(t, k) || !airOk(t)) return;
      pushUndo('clear air reason'); L.splice(L.indexOf(cur), 1); U.pop = null; scheduleSave(true); flush(); pushToast('Reason cleared.', true); rd(); },
    fset: t => { U.pop.o = +t.dataset.o; rd(); if(U.pop.o === 2) setTimeout(() => { const i = document.querySelector('[data-pg="timelog"] [data-in="fo"]'); if(i) i.focus(); }, 20); },
    fgo: () => { const p = U.pop, c = calc(U.who, U.day), f = c && c.fixes.find(x => x.k === p.f && (p.f !== 'over' || !p.fa || x.a === p.fa)); if(!f || p.o == null || needWhy(p)) return;
      if(f.k === 'noout'){ const E = evid(U.who, U.day, c), v = p.o < E.length ? E[p.o].m : pm(p.t || ''); if(v == null){ pushToast('Type a time like 15:45.'); return; }
        runFix(U.who, U.day, 'out', { m: v, fk: 'noout|' }, String(p.why).trim(), `Clock out ${hm(v)} · ${short(U.day)}`); return; }
      const A = findP(f.a), Bp = findP(f.b); if(!A || !Bp) return;
      runFix(U.who, U.day, 'over', { fa: f.a, o: p.o, fk: 'over|' + f.a }, String(p.why).trim(), p.o === 0 ? `${cap(nmP(A.p))} ends ${hm(Bp.p.s)}` : p.o === 1 ? `${cap(nmP(Bp.p))} starts ${hm(A.p.e == null ? NOW : A.p.e)}` : `Split the overlap · ${short(U.day)}`); },
    aset: t => { U.pop.ro = t.dataset.ro; U.pop.op = t.dataset.op; rd(); },
    ago: () => { const p = U.pop; if(!p.op) return; runFix(U.who, U.day, 'fill', { ro: p.ro, op: p.op, from: p.from, to: p.to, fk: 'air|' + p.from }, 'Filled the air', `Fill ${hm(p.from)}–${hm(p.to)} with ${p.ro === SHOP_RO_ID ? 'shop time' : roTag(getRO(p.ro))}`); },
    airok: t => { if(locked()) return; pushUndo('keep air'); ok()['air|' + U.who + '|' + U.day + '|' + t.dataset.from] = nowIso(); scheduleSave(true); pushToast('Kept as air.', true); rd(); },
    lunchok: () => { runFix(U.who, U.day, 'lunchok', { fk: 'lunch|' }, 'Worked through lunch', 'Worked through lunch · ' + short(U.day)); },
    lunchadd: t => { const at = +t.dataset.at; runFix(U.who, U.day, 'lunch', { m: at, fk: 'lunch|' }, FXWHY.lunch, `Lunch ${hm(at)}–${hm(at + 30)} · ${short(U.day)}`); },
    snap: t => { U.snap = +t.dataset.v; rd(); },
    per: t => { U.per = t.dataset.v; U.pop = null; if(U.view !== 'sheet') U.view = 'sheet'; rd(); },
    tsign: () => { const P = PER(U.per); pushUndo('sign timesheet'); sign()[sgK()] = { tech: stamp(), techAt: nowIso() }; scheduleSave(true);
      note(PG.person('Foreman') || PG.person('Manager'), 'ask', `${PG.first(sgT())} signed the timesheet — ${P[1]}`, 'Approve it to lock the period.', { who: sgT(), view: 'sheet', per: U.per });
      pushToast(`Signed — ${P[1]} goes to ${PG.first(lead())} to approve.`, true); rd(); },
    tunsign: () => { pushUndo('unsign'); delete sign()[sgK()]; scheduleSave(true); pushToast('Signature taken back — you can change your time again.', true); rd(); },
    tapprove: () => { const s = sign()[sgK()]; if(!s || !permOk('t.approve')) return; pushUndo('approve timesheet'); s.fm = stamp(); s.fmAt = nowIso(); s.fmBy = ME().name; scheduleSave(true);
      note(sgT(), 'fyi', `Your timesheet is approved — ${PER(U.per)[1]}`, `${PG.first(ME().name)} approved it; the period is locked.`, { who: sgT(), view: 'sheet', per: U.per });
      pushToast(`Approved — ${PER(U.per)[1]} is locked for ${PG.first(sgT())}.`, true); rd(); },
    treopen: () => { if(!permOk('t.approve')) return; pushUndo('reopen timesheet'); delete sign()[sgK()]; scheduleSave(true); note(sgT(), 'ask', `Your timesheet was reopened — ${PER(U.per)[1]}`, `${PG.first(ME().name)} reopened it. Check it and sign again.`, { who: sgT(), view: 'sheet', per: U.per });
      pushToast(`Reopened — ${PG.first(sgT())} can change it, then signs again.`, true); rd(); },
    notesgo: () => { const n = missNotes(sgT(), perDays(U.per)).length; U.pop = null; scheduleSave(true); pushToast(n ? `${n} punch${n > 1 ? 'es' : ''} still without a note.` : 'Notes added — the timesheet is ready to sign.'); rd(); },
    clkout: () => { shiftClockOut('End of day'); flush(); },
    clkat: () => { const c = calc(ME().tech, TODAY); if(!c) return; const rp = runningPunch(), at = c.shEnd; shiftClockOut('End of day');
      const sh = shiftsOf(ME().tech, TODAY).filter(s => s.out).pop(); if(sh && mOf(sh.in, TODAY) < at){ sh.out = isoAt(TODAY, at); }
      if(rp && rp.stop && mOf(rp.start, TODAY) + 5 <= at){ if(!rp.edited){ rp.edited = true; rp.originalStart = rp.start; rp.originalStop = rp.stop; } rp.stop = isoAt(TODAY, at); rp.editedAt = nowIso(); }
      scheduleSave(true); flush(); pushToast(`Clocked out at ${hm(at)} — the minutes after don’t count. Marked edited.`, true); rd(); },
    remsnz: () => { U.snz = NOW + 30; pushToast(`OK — it asks again at ${hm(NOW + 30)}.`); rd(); },
    ot: () => { U.otAsk = true; note(PG.person('Foreman') || PG.person('Manager'), 'ask', `${PG.first(ME().name)} is staying on — overtime`, `Past the ${hm(shiftEndOf(ME().tech))} shift end. OK it, or tell them to clock out.`, { who: ME().tech, view: 'day' }); pushToast(`Marked overtime — ${PG.first(lead())} is asked to OK it.`); rd(); },
    trtbl: t => { U.trTbl = t.dataset.v === '1'; rd(); },
    wgo: () => { const p = U.pop; if(needWhy(p) || !U.drag) return; U.pop = null; commitDrag(String(p.why).trim()); },
    wcancel: () => { U.drag = null; U.pop = null; pushToast('Put back — nothing changed.'); rd(); },
    gofix: t => { U.view = 'day'; U.day = t.dataset.k; U.pop = null; flush(); const c = calc(U.who, U.day), f0 = c && (t.dataset.f ? c.fixes.find(x => x.k === t.dataset.f) : c.fixes[0]);
      if(f0 && (f0.k === 'noout' || f0.k === 'over')) U.pop = { type: 'fix', f: f0.k, fa: f0.a, why: otherT() ? '' : f0.k === 'noout' ? 'Forgot to clock out' : 'Forgot to stop the clock' }; rd(); },
    tsprint: () => { const n = perDays(U.per).filter(k => { const c = calc(sgT(), k); return c && c.fixes.length; }).length; if(n) pushToast(`${n} day${n > 1 ? 's' : ''} still need fixing — they print marked.`);
      PG.printPaper(document.querySelector('[data-pg="timelog"] .tk-paper'), 'Timesheet ' + PG.first(sgT()) + ' ' + PER(U.per)[0]); }
  };
  /* ---------- typing, dragging, keys ---------- */
  function input(t){ const p = U.pop, d = t.dataset.in; if(!p) return;
    if(d === 's') p.s = t.value; if(d === 'e') p.e = t.value; if(d === 'n') p.n = t.value; if(d === 'fo') p.t = t.value;
    if(d === 'e'){ const r0 = document.querySelector('[data-pg="timelog"] .tg-pop .tk-stopas'); if(r0) r0.hidden = !String(t.value || '').trim(); }   /* Parsec 12.7 */
    if(d === 'why'){ p.why = t.value; const b = document.querySelector('[data-pg="timelog"] .tg-pop .tg-acts .btn-primary'); if(b && (b.dataset.a !== 'psave' || otherT())){ const ok2 = b.dataset.a === 'fgo' ? p.o != null : b.dataset.a === 'crewgo' ? (p.mode !== 'shop' || !!p.op) : true; b.disabled = !(String(t.value).trim() && ok2); } return; }
    if(d === 'spl'){ p.v = t.value; const f = findP(p.pid), el = document.querySelector('[data-pg="timelog"] .tg-pop .tk-spd'); if(f && el){ const m = pm(t.value, +t.dataset.cur); el.textContent = m != null && m > f.p.s && m < f.p.e ? dur(m - f.p.s) + ' · ' + dur(f.p.e - m) : '—'; } return; }
    if(d === 'cra'){ p.a = t.value; return; } if(d === 'crb'){ p.b = t.value; return; }
    if(d === 'sn'){ p.n = t.value; const b = document.querySelector('[data-pg="timelog"] .tg-pop [data-a="tsignn"]'); if(b) b.disabled = !t.value.trim(); return; }
    if(d === 'shin'){ p.v = t.value; const m = pm(t.value, +t.dataset.cur), r1 = document.querySelector('[data-pg="timelog"] .tg-pop .tk-shd'); if(r1) r1.textContent = m != null && m <= NOW ? dur(NOW - m) : '—'; }
    if(d === 's' || d === 'e'){ const f = findP(p.pid); if(!f) return; const e0 = p.e != null ? p.e : f.p.e != null ? hm(f.p.e) : '', s0 = pm(p.s != null ? p.s : hm(f.p.s), f.p.s); const m = f.p.e == null && !String(e0).trim() ? (s0 != null ? NOW - s0 : 0) : (pm(e0, f.p.e) || 0) - (s0 || 0), r = document.querySelector('[data-pg="timelog"] .tk-tg .ro'); if(r) r.textContent = m > 0 ? dur(m) : '—'; }
    if(d === 'note'){ const f = findP(t.dataset.nid); if(!f) return; if(!p._sn){ pushUndo('work notes'); p._sn = 1; } f.raw.notes = t.value; const n = [...document.querySelectorAll('[data-pg="timelog"] .tg-pop [data-nid]')].filter(x => !x.value.trim()).length, h = document.querySelector('[data-pg="timelog"] .tg-pop .tk-nleft'); if(h) h.textContent = n ? n + ' left' : 'All done'; } }
  function change(t){ if(t.dataset.in === 'note') scheduleSave(true);
    if(t.classList && t.classList.contains('tk-tin')){ const c0 = t.dataset.cur !== '' && t.dataset.cur != null ? +t.dataset.cur : null, v = pm(t.value, c0); if(v != null && t.value.trim() !== hm(v)){ t.value = hm(v); input(t); } } }   /* Parsec 14.6: 715 becomes 07:15 */
  function fieldKey(t, ev){ const k = ev.key, d = t.dataset.in;
    if(k === 'Escape'){ t.blur(); if(U.pop){ if(U.drag && U.drag.pending) U.drag = null; U.pop = null; rd(); } ev.preventDefault(); return true; }
    if((k === 'ArrowUp' || k === 'ArrowDown') && t.classList && t.classList.contains('tk-tin')){ ev.preventDefault(); const c0 = t.dataset.cur !== '' && t.dataset.cur != null ? +t.dataset.cur : null; let v = pm(t.value, c0);
      if(v == null) v = c0 != null ? c0 : NOW; v = Math.max(0, Math.min(1439, v + (k === 'ArrowUp' ? 1 : -1) * (ev.shiftKey ? 5 : 1))); t.value = hm(v); input(t); return true; }   /* Parsec 14.6: arrows nudge a typed time */
    if(k === 'Enter' && t.classList && t.classList.contains('tk-tin')) change(t);
    if(d === 'note' && k === 'Enter'){ ev.preventDefault(); const L = [...document.querySelectorAll('[data-pg="timelog"] .tg-pop [data-nid]')], i = L.indexOf(t); if(i < L.length - 1) L[i + 1].focus(); else H.notesgo(); return true; }
    if(k === 'Enter' && t.tagName !== 'TEXTAREA'){ ev.preventDefault(); const b = document.querySelector('[data-pg="timelog"] .tg-pop .btn-primary:not([disabled])'); if(b) b.click(); return true; }
    return false; }
  document.addEventListener('pointerdown', ev => { if(UI.view !== 'timelog') return; const h = ev.target.closest && ev.target.closest('[data-pg="timelog"] .h[data-h]'); if(!h) return;
    ev.preventDefault(); ev.stopPropagation(); if(mustAsk(U.who)){ pushToast('Press E and send the change to ' + PG.first(lead()) + '.'); return; } if(locked()) return; const f = findP(h.dataset.p); if(!f) return;
    U.drag = { pid: f.p.id, edge: h.dataset.h, orig: { s: f.p.s, e: f.p.e }, v: null }; U.sel = f.p.id; U.kh = false; U.pop = null; rd(); }, true);
  document.addEventListener('pointermove', ev => { if(UI.view !== 'timelog' || !U.drag || U.drag.pending) return; const tr = document.querySelector('[data-pg="timelog"] .tk-tl .tk-trk'); if(!tr || !U.ab) return; const r = tr.getBoundingClientRect();
    dragTo(U.ab[0] + (ev.clientX - r.left) / r.width * (U.ab[1] - U.ab[0])); PG.keepScroll(render); });
  document.addEventListener('pointerup', () => { if(UI.view === 'timelog' && U.drag && !U.drag.pending) finishDrag(); });
  document.addEventListener('dblclick', ev => { if(UI.view !== 'timelog') return; const t = ev.target.closest && ev.target.closest('[data-pg="timelog"] [data-a="psel"]'); if(!t) return; const f = findP(t.dataset.p); if(f && !locked()){ U.pop = { type: 'edit', pid: t.dataset.p }; PG.anchor(U, t); rd(); } });
  function move(d){ const L = flat(); if(!L.length) return; U.kb = true; const i = L.indexOf(U.day); U.day = i < 0 ? L[0] : L[Math.max(0, Math.min(L.length - 1, i + d))]; U.sel = null; U.pop = null; rd(); PG.kbScroll(); }
  function keydown(ev){
    const k = ev.key, stop = () => { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); };
    if(U.drag && !U.drag.pending && k === 'Escape'){ U.drag = null; rd(); return stop(); }
    if(U.drag && !U.drag.pending && U.drag.v != null && k === 'Enter' && !PG.typing(ev)){ finishDrag(); return stop(); }
    if(ev.altKey && (k === 'ArrowLeft' || k === 'ArrowRight') && U.sel && U.view === 'day' && !PG.typing(ev)){ nudge(ev.shiftKey ? 's' : 'e', k === 'ArrowLeft' ? -U.snap : U.snap); return stop(); }
    if(ev.ctrlKey || ev.metaKey || ev.altKey || PG.typing(ev)) return;
    const p = U.pop;
    if(p){ if(k === 'Escape'){ if(U.drag && U.drag.pending) U.drag = null; U.pop = null; rd(); return stop(); } if(k === 'Enter'){ const b = document.querySelector('[data-pg="timelog"] .tg-pop .btn-primary:not([disabled])'); if(b){ b.click(); return stop(); } }
      const n = +k; if(n >= 1 && n <= 7){ const b = document.querySelector(`[data-pg="timelog"] .tg-pop [data-a="fset"][data-o="${n - 1}"]`); if(b){ b.click(); return stop(); } } return; }
    if(k === 'j'){ move(1); return stop(); } if(k === 'k'){ move(-1); return stop(); }
    if(k === 'ArrowLeft' || k === 'ArrowRight'){ const b = document.querySelector(`[data-pg="timelog"] [data-a="dnav"][data-d="${k === 'ArrowLeft' ? -1 : 1}"]:not([disabled])`); if(b){ H.dnav(b); return stop(); } }
    if(k === 'e' && U.view === 'day'){ const c = calc(U.who, U.day), x = c && (c.ps.find(q => q.id === U.sel) || c.ps.filter(q => q.e != null).slice(-1)[0]); if(x && !locked()){ U.sel = x.id; U.pop = { type: 'edit', pid: x.id }; rd(); const el = document.querySelector(`[data-pg="timelog"] .tk-r[data-p="${x.id}"]`); if(el){ PG.anchor(U, el); rd(); } } return stop(); }
    if(k === 'a'){ const b = document.querySelector('[data-pg="timelog"] [data-a="pop"][data-p="add"]'); if(b){ H.pop(b); return stop(); } }
    if(k >= '1' && k <= '4'){ if(k === '4' && role() === 'tech') return stop(); U.view = ['day', 'week', 'sheet', 'shop'][+k - 1]; if(U.view !== 'shop' && U.who === 'ALL') U.who = techs()[0] || null; rd(); return stop(); }
  }
  function after(){ PG.placePop(U); if(U.kb) PG.kbScroll(); const f = document.querySelector('[data-pg="timelog"] .tg-pop [data-in="s"], [data-pg="timelog"] .tg-pop [data-in="shin"]'); if(f && U.pop && !U.pop._f){ U.pop._f = 1; f.focus(); f.select(); }
    if(U.pop && U.pop.type === 'notes' && !U.pop._nf){ U.pop._nf = 1; const el = document.querySelector('[data-pg="timelog"] .tg-pop [data-nid]'); if(el) el.focus(); } }
  const TK = { clk: () => { const c = U.who && U.who !== 'ALL' ? (flush(), calc(U.who, TODAY)) : null; return c ? dur(c.clocked) : null; } };
  /* the Inbox: timesheets to sign or approve */
  if(typeof IB !== 'undefined') IB.DERIVE.push((me, r) => { const L = [], pv = PER('prev'), lead0 = r === 'Foreman' || r === 'Manager' || r === 'Admin';
    if(lead0) rtTechs().forEach(t => { const s = sign()[t + '|' + pv[0]]; if(s && s.tech && !s.fm) L.push({ key: 'tsa:' + t + ':' + pv[0], from: t, k: 'ask', src: 'timelog', at: s.techAt || nowIso(), t: `Approve ${PG.first(t)}’s timesheet — ${pv[1]}`, b: 'Signed ' + s.tech + '. Approving locks the period.', acts: [['Open the timesheet', 'tl']], x: { who: t, view: 'sheet', per: 'prev' } }); });
    else if(staffForTech(me) && staffForTech(me).role === 'Technician'){ const s = sign()[me + '|' + pv[0]]; if(!s && allDays(me).some(k => k >= pv[0] && k <= pv[2])) L.push({ key: 'tss:' + pv[0], from: 'Parsec', k: 'rem', src: 'timelog', at: isoAt(addD(pv[2], 1), 7 * 60), t: `Sign your timesheet — ${pv[1]}`, b: `Due ${short(addD(pv[2], 5))}.`, acts: [['Open the timesheet', 'tl']], x: { who: me, view: 'sheet', per: 'prev' } }); }
    return L; });
  PG.reg('timelog', { H, TK, U: () => U, input, change, fieldKey, keydown, after });
  /* Parsec 15: the RO page asks through here when someone must ask to delete their own entry */
  function askDel(pid){ const f = findP(pid); if(!f || f.p.e == null) return false; if(isLocked(f.t, f.k)){ pushToast('Locked — that period was approved.'); return true; } return ask(f.t, f.k, 'del', { pid, fk: 'del|' + pid }, '', `Delete ${cap(nmP(f.p))} ${hm(f.p.s)}–${hm(f.p.e)}`); }
  const mustAskFor = t => mustAsk(t);
  return { view, U: () => U, calc, flush, dayOf, PER, groups, isLocked, askDel, mustAskFor };   /* isLocked: Parsec 12.5's Move time reads it */
})();
function viewTimeLog(){ return TL.view(); }
