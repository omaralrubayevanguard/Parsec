/* Parsec · ro-page · declined.js
   Declined on the operation's status menu (14.8 A) and the complaint edited in place while the clock runs or not.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ropDecline ropUndecline ropMenuKeys ropDecMeta ropDecTip ropMine ropBand ropWho ropDT ropFProp ropCfg ropProps … (13 functions, 1 constant)
   state      punches
   uses       access/ clock/ data/ kit/ pages/ pages/triage/ pages/warranty/ ro/ settings/ shell/ state/ trucks/
*/
/* ---------- Parsec 14.8 (A): Declined on the operation's status menu · the complaint changes in place ---------- */
/* Declined, the way the app declines an operation (op.declined): the totals, the roll-up, the lists and the money leave it out.
   Its clock (anyone's) stops first, as Hold Tech. One Undo; an Activity line. */
function ropDecline(j) {
  if (!j || j.declined) return;
  if (typeof permRoDone === 'function' && permRoDone(RO) && typeof permReopenOk === 'function' && !permReopenOk(RO)) return;
  pushUndo('decline operation');
  var n = 0, mine = typeof myRunOf === 'function' ? myRunOf(j) : null;
  if (mine) { stopClock(); mine.stopReason = 'Hold Tech'; n++; }
  STATE.punches.forEach(function (p) { if (p.opId === j.id && !p.stop) { p.stop = nowIso(); p.stopReason = 'Hold Tech'; try { creditBurnt(p); } catch (e) {} n++; } });
  j.declined = true; j.declinedBy = ropMe(); j.declinedAt = nowIso();
  try { audit('op-decline', roLabel(RO) + ': declined Op ' + ropN(j) + ' — ' + (j.complaint || 'Operation'), RO); } catch (e) {}
  save(true); render(); try { tecRender(); } catch (e) {}
  ropUndo('Op ' + ropN(j) + ' declined' + (n ? ' — its clock was stopped (Hold tech)' : '') + '.');
}
/* any other status picked on a declined operation brings it back */
function ropUndecline(j) {
  if (!j || !j.declined) return false;
  j.declined = false; delete j.declinedBy; delete j.declinedAt;
  try { audit('op-undecline', roLabel(RO) + ': Op ' + ropN(j) + ' is back — ' + (j.complaint || 'Operation'), RO); } catch (e) {}
  return true;
}
/* the number keys pick in the operation's status menu (1–9), like the RO's status picker */
function ropMenuKeys(pop) {
  var h = function (e) {
    if (!pop.isConnected) { document.removeEventListener('keydown', h, true); return; }
    if (e.ctrlKey || e.metaKey || e.altKey || !/^[1-9]$/.test(e.key)) return;
    var it = pop.querySelectorAll('.px-menu__item')[+e.key - 1]; if (!it) return;
    e.preventDefault(); e.stopPropagation(); document.removeEventListener('keydown', h, true); it.click();
  };
  document.addEventListener('keydown', h, true);
}
/* the meta line of a declined operation: who declined it (the pill already says Declined) */
function ropDecMeta(j) {
  if (!j.declined) return '';
  if (j.appr && j.appr.s === 'no') return 'Customer declined';
  return j.declinedBy ? 'by ' + ropFirst(j.declinedBy) : '';
}
/* a declined operation doesn't start: every Start on the RO page reads this, and toggleJobClock refuses with it */
function ropDecTip(j) { return 'Op ' + ropN(j) + ' is declined — pick another status to work on it'; }

function ropMine(j) { return typeof myRunOf === 'function' ? !!myRunOf(j) : !!ropRun(j); }
function ropBand() {
  var band = pxTitle(), tb = band.querySelector ? (band.classList.contains('px-titleblock') ? band : band.querySelector('.px-titleblock')) : null;
  var live = ropLive(), job = S.jobs.filter(function (j) { return j.id === S.ui.card && live.indexOf(j) > -1; })[0] || live.filter(function (j) { return ropMine(j); })[0] || live.filter(function (j) { return !opDoneNow(j); })[0];
  var acts = el('div', { class: 'rop-acts' });
  if (job && !opDoneNow(job)) { var on = ropMine(job);
    acts.appendChild(el('button', { class: 'px-btn px-btn--sm ' + (on ? '' : 'px-btn--primary'), type: 'button', title: on ? 'Stop the clock on Op ' + ropN(job) : 'Start the clock on Op ' + ropN(job), html: (on ? pxI('stop', 14) + 'Stop' : pxI('play', 14) + 'Start') + ' Op ' + ropN(job), onClick: function (e) { e.stopPropagation(); toggleJobClock(job); tecRender(); } })); }
  acts.appendChild(el('button', { class: 'px-btn px-btn--sm', type: 'button', title: 'Transfer (T)', html: pxI('swap', 14) + 'Transfer…', onClick: function (e) { e.stopPropagation(); pxTransfer(); } }));
  /* Parsec 12.2: the road test and the truck checks, on every RO */
  try { if (trxBtnsOk(RO)) { var rtOn = rtNeeded(RO), qcHot = (!rtOn || trxPassed(RO)) && !trxQcDone(RO) && trxAllDone(RO);   /* 17.3: each by its own switch */
    if (rtOn) acts.appendChild(el('button', { class: 'px-btn px-btn--sm rop-rtb', type: 'button', title: 'Road test — send someone or log the result', html: pxI('road', 14) + 'Road test', onClick: function (e) { e.stopPropagation(); trxOpen('road', RO.id); } }));
    if (qcNeeded(RO)) acts.appendChild(el('button', { class: 'px-btn px-btn--sm rop-qcb' + (qcHot ? ' px-btn--primary' : ''), type: 'button', title: 'Truck checks before release', html: pxI('check', 14) + 'Truck checks', onClick: function (e) { e.stopPropagation(); trxOpen('checks', RO.id); } })); } } catch (er) { console.error(er); }
  try { if (ropBypassOk()) acts.appendChild(ropBypassBtn()); } catch (er) { console.error(er); }   /* Parsec 14.7 */
  /* Parsec 14.3: on the Technician page, Ask <the foreman> sits with the others — it opens Messages about this RO, to them */
  try { if (typeof tcxOn === 'function' && tcxOn(RO.id)) { var fm = ropPerson('Foreman'); if (fm && !ropIsMe(fm)) acts.appendChild(el('button', { class: 'px-btn px-btn--sm rop-askf', type: 'button', title: 'Ask ' + ropFirst(fm) + ' about this RO — a message on it', html: pxI('chat', 14) + 'Ask ' + esc(ropFirst(fm)), onClick: function (e) { e.stopPropagation(); ROPU.msgTo = fm; ROPC.tab = 'msg'; render(); requestAnimationFrame(function () { var i = R.querySelector('.rop-in__i'); if (i) { try { i.scrollIntoView({ block: 'center' }); } catch (er) {} i.focus(); } }); } })); } } catch (er) { console.error(er); }
  try { if (typeof v163DeptActs === 'function') acts = v163DeptActs(acts, RO) || acts; } catch (er) { console.error(er); }   /* Parsec 16.3: by department */
  /* 17.1 — the one RO panel: the buttons sit at the bottom of the right column, always in reach (ropRail) */
  var foot = el('div', { class: 'rop-foot' }, [acts]); ROP_FOOT = foot;
  try { var byl = ropBypassLine(RO); if (byl) foot.appendChild(byl); } catch (er) { console.error(er); }   /* Parsec 14.7 */
  /* Parsec 14: does this truck need a road test? 17.3: and truck checks — a switch each */
  [false, true].forEach(function (qc) { try { var tgl = rtToggleHtml(RO, '', qc); if (!tgl) return; var tw = el('div', { class: 'rop-rtt' + (qc ? ' rop-qct' : ''), html: tgl }), sw = tw.querySelector('.rtt-sw');
    if (sw) sw.addEventListener('click', function (e) { e.stopPropagation(); var on = qc ? !qcNeeded(RO) : !rtNeeded(RO); if (qc ? qcToggle(RO, on) : rtToggle(RO, on)) { render(); tecRender();
      ropUndo(qc ? (on ? 'Truck checks needed again.' : 'No truck checks for this RO.') : (on ? 'Road test needed again.' : 'No road test for this RO.')); } });
    foot.appendChild(tw); } catch (er) { console.error(er); } });
  /* 17.3: Warranty RO, under Road test before release (it was in the Customer tab) */
  try { if (!RO.shop && RO.id !== SHOP_RO_ID) { var wOn = !!RO.warranty, ww = el('div', { class: 'rop-rtt rop-wrt', html: '<div class="rtt' + (wOn ? ' on' : '') + '"><span class="rtt-l">Warranty RO</span><button type="button" class="rtt-sw" role="switch" aria-checked="' + wOn + '" aria-label="Warranty RO" title="' + (wOn ? 'Not a warranty RO' : 'Make it a warranty RO') + '"><i></i></button></div>' });
    ww.querySelector('.rtt-sw').addEventListener('click', function (e) { e.stopPropagation(); pushUndo('warranty RO'); RO.warranty = !RO.warranty; save(true); render(); tecRender(); });
    foot.appendChild(ww); } } catch (er) { console.error(er); }
  return el('div', { class: 'rop-band' }, [band]);
}
function ropWho() {
  var h = null; try { h = tgHold(RO); } catch (e) {} if (!h) return null;
  var who = h.who || '', me = ropIsMe(who), D = { tech: 'Technician', foreman: 'Foreman', parts: 'Parts', writer: 'Service writer', triage: 'Triage', warranty: 'Warranty' }[h.to] || '';
  var q = /^Anyone in /.test(who);   /* Parsec 12.1: sent to the department's queue */
  if (who && (who === D || q)) who = '';   /* nobody named yet — the department, not a person to nudge */
  var x = h.goal ? h.held / h.goal : 0, age = h.held >= 60000 ? '<span class="rop-age' + (x >= 1 ? ' b' : x >= .75 ? ' w' : '') + '" title="Follow up after ' + esc(tgShortDur(h.goal)) + (x >= 1 ? ' — overdue' : '') + '">' + esc(tgShortDur(h.held)) + '</span>' : '';
  var box = el('div', { class: 'rop-who' }, [el('div', { class: 'rop-wh', html: (who ? ropAv(who) : '<span class="px-av">' + pxI('clock', 12) + '</span>') + '<span><b>' + (me ? 'With you' : who ? 'With ' + esc(who) : esc(q ? h.who + ' — the queue' : D ? 'No ' + D.toLowerCase() + ' on it yet' : 'Nobody on it yet')) + '</b><small>' + esc(D) + (h.goal ? ' · follow up after ' + esc(tgShortDur(h.goal)) : '') + '</small></span>' + age })]);
  if (who && !me) box.appendChild(el('button', { class: 'px-btn px-btn--sm', type: 'button', html: pxI('chat', 14) + 'Nudge ' + esc(ropFirst(who)), onClick: function (e) { e.stopPropagation(); var job = S.jobs.filter(function (j) { return j.id === S.ui.card; })[0] || ropLive()[0]; if (ropNote(who, 'men', job, ropFirst(ropMe()) + ' asked about ' + ropNo(), (RO.customerName || '') + (job ? ' · Op ' + ropN(job) + ' — ' + (job.complaint || '') : ''), 'Any news on this one?')) toast('Nudged ' + ropFirst(who) + ' — it’s under Messages on ' + ropNo() + '.'); } }));
  return el('section', { class: 'rop-rblk' }, [el('div', { class: 'rop-rh', text: 'Who has it' }), box]);
}
function ropDT(k) { return { type: 'datetime-local', get: function () { if (!RO[k]) return ''; var d = new Date(RO[k]); if (isNaN(d)) return ''; d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); }, set: function (v) { RO[k] = v ? new Date(v).toISOString() : null; } }; }
/* Parsec 14.7: a Vehicle row straight from the RO details table (ROFLD) — its label, what it shows, its editor, and a lock (Closed on an open RO) */
function ropFProp(k) { var f = null; try { f = roFld(k); } catch (e) {} if (!f) return null; var v = roFldShow(RO, f), lk = f.o.lock && f.o.lock(RO);
  return pxProp(f.l, v || f.o.empty || 'Add', { empty: !v, num: !!f.o.num, edit: lk ? null : pxField2(k) }); }
function ropCfg() { try { return truckCfg(RO); } catch (e) { return [RO.axles, RO.cab].filter(Boolean).join(' · '); } }
function ropProps() {
  var f = null; try { f = roForecast(RO); } catch (e) {}
  var ready = f ? (f.ready ? 'Ready now' : fcWhen(f.likely)) : '—';
  var opened = RO.dateOpened ? new Date(RO.dateOpened) : null, days = opened ? Math.max(0, Math.floor((Date.now() - opened) / 864e5)) : 0;
  var pr = RO.promisedAt ? new Date(RO.promisedAt) : null, fu = RO.followUpAt ? new Date(RO.followUpAt) : null, dfmt = function (d) { return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + ropClk(d); };
  var props = el('div', { class: 'px-props' });
  props.appendChild(pxGroup('schedule', 'Schedule', ready, [pxProp('Ready about', ready),
    pxProp('Opened', opened ? dfmt(opened) : '—', { empty: !opened }),
    pxProp('Promised', pr ? fcWhen(pr) : 'Add date', { empty: !pr, edit: ropDT('promisedAt') }),
    pxProp('Follow-up', fu ? fcWhen(fu) : 'Add date', { empty: !fu, edit: ropDT('followUpAt') }),
    pxProp('Days open', String(days), { num: true }),
    RO.dateClosed ? pxProp('Closed', dfmt(new Date(RO.dateClosed))) : null].filter(Boolean)));
  var tech = RO.assignedTech || '', adv = RO.advisor || ropWriter() || RO.createdBy || '', fm = RO.foreman || ropPerson('Foreman');   /* Parsec 14.1 */
  var h0 = rtHolder(RO), hn = rtHolderName(h0, RO), r = RO.route;
  var tr = ropIb('swap', 'Transfer… (T)', function () { pxTransfer(); }, 'px-pg__act');
  var pv = function (n) { return el('span', { style: 'display:flex;align-items:center;gap:8px', html: '<span class="px-av"' + v149eAvAttr(n) + '>' + esc(ivInit(n)) + '</span>' + esc(n) }); };
  var ppl = [pxProp('Technician', tech ? pv(tech) : 'Not assigned', { empty: !tech }), pxProp('Advisor', adv ? pv(adv) : 'Not set', { empty: !adv })];
  if (RO.createdBy && !techSame(RO.createdBy, adv)) ppl.push(pxProp('Created by', pv(RO.createdBy)));
  if (fm) ppl.push(pxProp('Foreman', pv(fm)));
  if (hn && !techSame(hn, tech) && !techSame(hn, adv) && !techSame(hn, fm)) ppl.push(pxProp('With', pv(hn)));
  if (r && r.state === 'pending') ppl.push(pxProp('Sent to', (r.to === 'tech' ? (r.who || 'a technician') : RT_LBL[r.to]) + ' · waiting'));
  props.appendChild(pxGroup('people', 'People', [ivInit(tech), adv ? ivInit(adv) : ''].filter(Boolean).join(' · '), ppl, tr));
  var mi = RO.mileage ? Number(String(RO.mileage).replace(/[^\d.]/g, '')).toLocaleString('en-US') + ' mi' : '';
  var eh = RO.engineHours ? Number(String(RO.engineHours).replace(/[^\d.]/g, '')).toLocaleString('en-US') + ' h' : '';
  var yr = RO.year ? String(RO.year) : (function () { try { var t = truckYM(RO); return t.year ? t.year + ' · VIN' : ''; } catch (e) { return ''; } })();
  props.appendChild(pxGroup('vehicle', 'Vehicle', [RO.unitNumber ? 'Unit ' + RO.unitNumber : '', mi].filter(Boolean).join(' · '), [
    pxProp('VIN', RO.vin || 'Add VIN', { id: !!RO.vin, empty: !RO.vin, copy: RO.vin || null, edit: pxField2('vin') }),
    pxProp('Unit', RO.unitNumber || 'Add unit', { empty: !RO.unitNumber, edit: pxField2('unitNumber') }),
    pxProp('Make', RO.make || 'Add make', { empty: !RO.make, edit: pxField2('make') }),
    pxProp('Model', RO.model || 'Add model', { empty: !RO.model, edit: pxField2('model') }),
    pxProp('Model year', yr || 'Add year', { num: true, empty: !RO.year, edit: pxField2('year') }),
    ropFProp('buildDate'), ropFProp('warrantyStart'),   /* Parsec 14.7 */

    (RO.axles || RO.cab) ? pxProp('Configuration', ropCfg() || 'Add', { edit: { get: ropCfg, set: function (v) { var a = String(v || '').split(/\s*·\s*|\s*,\s*/), ax = /^\d+x\d+$/i.test(a[0] || '') ? a.shift() : ''; if (ax) RO.axles = ax.toLowerCase(); else delete RO.axles; var cb = a.join(' · ').trim(); if (cb) RO.cab = cb; else delete RO.cab; } } }) : null,
    RO.sleeper ? pxProp('Sleeper', RO.sleeper, { edit: pxField2('sleeper') }) : null,
    pxProp('Chassis', RO.chassis || 'Add chassis', { id: !!RO.chassis, empty: !RO.chassis, edit: pxField2('chassis') }),
    pxProp('Engine', RO.engineType || 'Add engine', { empty: !RO.engineType, edit: pxField2('engineType') }),
    pxProp('Engine serial', RO.engineSerial || 'Add serial', { id: !!RO.engineSerial, empty: !RO.engineSerial, edit: pxField2('engineSerial') }),
    pxProp('Mileage', mi || 'Add mileage', { num: true, empty: !mi, edit: pxField2('mileage') }),
    pxProp('Engine hours', eh || 'Add hours', { num: true, empty: !eh, edit: pxField2('engineHours') }),
    pxProp('Key tag', RO.keyTag || 'Add tag', { id: !!RO.keyTag, empty: !RO.keyTag, edit: pxField2('keyTag') }),
    pxProp('Location', RO.location || 'Add location', { empty: !RO.location, edit: pxField2('location') }),
    pxProp('Department', RO.department || 'Add department', { empty: !RO.department, edit: pxField2('department') }),
    ropFProp('dateOpened'), ropFProp('dateClosed')].filter(Boolean)));
  var M = roMoney(RO), T = totals();
  props.appendChild(pxGroup('money', 'Money', pxMoney(M.total), [
    pxProp('Labor', pxNum(T.q) + ' h · ' + pxMoney(M.labor), { num: true }),
    pxProp('Parts', pxMoney(M.parts), { num: true }),
    M.core ? pxProp('Core', pxMoney(M.core), { num: true }) : null,
    M.other - (M.supplies || 0) > .004 ? pxProp('Other', pxMoney(M.other - (M.supplies || 0)), { num: true }) : null,
    M.supplies ? pxProp('Shop supplies', pxMoney(M.supplies), { num: true }) : null,
    pxProp('Estimate', pxMoney(M.total), { num: true }),
    RO.asistTotals && RO.asistTotals.total != null ? pxProp('ASIST total', pxMoney(RO.asistTotals.total) + (RO.asistTotals.tax ? ' · tax ' + pxMoney(RO.asistTotals.tax) : ''), { num: true }) : null].filter(Boolean)));   /* Parsec 14 (fork X): core, shop supplies, ASIST's own total */
  return props;
}
var ROP_FOOT = null;
function ropRail() {
  ROP_FOOT = null;
  ropBand();   /* builds the buttons (ROP_FOOT) */
  /* 17.1 — the one RO panel: the right column shows the RO list's side panel (ro/ro-panel.js rpPanelHtml), slotted in as
     light DOM; the band is still built for its buttons (ROP_FOOT), which stay at the bottom, always in reach */
  /* 17.3 — the panel's top (name, status, stages) in slot rp; then the contact and the buttons; then the rest of the panel in slot rp2 */
  var ct = null; try { ct = ropContactCard(); } catch (e) { console.error(e); }
  return el('aside', { class: 'px-ro__rail rop-rail rop-rail-rp' }, [rfFoldBtn(), rfStrip(), el('slot', { name: 'rp' }), ct].concat(ROP_FOOT ? [ROP_FOOT] : []).concat([el('slot', { name: 'rp2' })]).filter(Boolean));   /* 17.3: the fold button and the strip (rail-fold.js) */
}
