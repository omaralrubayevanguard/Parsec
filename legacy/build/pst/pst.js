/* Parsec · parts stages on the Parts page and the Foreman page — mock-up. The RO's stage is its furthest-behind part. */
var D = document, $ = function(s, r){ return (r || D).querySelector(s); }, $$ = function(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
function ic(k, s){ return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"' + (s ? ' style="width:' + s + 'px;height:' + s + 'px"' : '') + '>' + (IC[k] || '') + '</svg>'; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
var CHK = '<svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9"/></svg>';
var TRUCK = '<svg viewBox="0 0 92 52" aria-hidden="true"><path fill="currentColor" opacity=".9" d="M4 30h44V12a3 3 0 0 1 3-3h10l2-5h9l9 10 5 2a3 3 0 0 1 2 3v15h2v6H4z"/><path fill="var(--panel)" opacity=".85" d="M66 9h6l7 8H66z"/><g fill="currentColor"><circle cx="17" cy="40" r="7"/><circle cx="33" cy="40" r="7"/><circle cx="76" cy="40" r="7"/></g><g fill="var(--panel)"><circle cx="17" cy="40" r="2.5"/><circle cx="33" cy="40" r="2.5"/><circle cx="76" cy="40" r="2.5"/></g></svg>';
/* ---------- part statuses, furthest behind first ---------- */
var STS = ['Not Ordered', 'Backordered', 'Ordered', 'Received', 'Staged', 'Picked up', 'Installed'];
var SV = { 'Not Ordered': '--s-hold', 'Backordered': '--bad', 'Ordered': '--s-sup', 'Received': '--s-good', 'Staged': '--s-acc', 'Picked up': '--s-cus', 'Installed': '--s-good' };
var SN = { 'Not Ordered': 'Not ordered' };
function scv(st){ return 'var(' + (SV[st] || '--ink3') + ')'; }
function sname(st){ return SN[st] || st; }
var ACT = { 'Not Ordered': 'Order…', 'Backordered': 'Chase…', 'Ordered': 'Track', 'Received': 'Stage it', 'Staged': 'Tell the tech' };
/* ---------- operations (the Foreman option) ---------- */
var OPS = ['Hold Tech', 'Waiting', 'Working', 'Complete'], OPL = { 'Hold Tech': 'Not started', 'Waiting': 'Waiting', 'Working': 'Working', 'Complete': 'Complete' };
var OPV = { 'Hold Tech': '--s-hold', 'Waiting': '--warn', 'Working': '--s-good', 'Complete': '--s-good' };
function opKey(os){ return /^Waiting/.test(os) ? 'Waiting' : os; }
/* ---------- the sample ROs (today is Tue 10/27) ---------- */
var ROS = {
  r1: { no: '4625', ron: 'RO-34625', cust: 'Prairie Line Trucking', tag: 'WARR', truck: '2022 Volvo VNL 740 · D13 TC 455HP · Unit T-215', tech: 'Luis Martinez', writer: 'Jenna Cho', vin: '…NN984490',
    ops: [{ n: 2, t: 'WARR', c: 'Replace outlet NOx sensor', os: 'Hold Tech' }],
    parts: [{ op: 2, d: 'NOx sensor, outlet', pn: '22827993', q: 1, st: 'Not Ordered', age: 0, price: 548, w: 'To order', w2: 'none on hand' }],
    next: ['1 part to get.', 'Order…'],
    fm: { g: 'you', sub: 'Waiting on you · 13 d', btn: 'Decide', spot: 'D11', stt: ['Waiting – Foreman', '--warn'], ini: 'LM', hrs: '0.0 / 1.4 h', eyb: 'Waiting on you', nx: 'Decide on the NOx sensor claim before Parts orders it.' } },
  r2: { no: '4565', ron: 'RO-34565', cust: 'Harbor Point Drayage', truck: '2019 Volvo VNR 640 · D11 405HP · Unit 88', tech: 'Dana Kowalski', writer: 'Jenna Cho', vin: '…KN220841',
    ops: [{ n: 1, c: 'Air leak at the dryer — replace cartridge', os: 'Waiting – Parts' }],
    parts: [{ op: 1, d: 'Air dryer cartridge', pn: '21620181', q: 1, st: 'Backordered', age: 6, eta: ['Mon 11/2', 6], price: 96.4, w: 'Supplier short', w2: 'new date Mon 11/2' },
      { op: 1, d: 'Purge valve', pn: '20382456', q: 1, st: 'Received', age: 1, price: 61.25, w: 'Checked in', w2: 'no bin yet' }],
    next: ['Air dryer cartridge is backordered — 6 d, new date Mon 11/2.', 'Chase…'],
    fm: { g: 'watch', sub: 'Waiting – Parts · 6 d', btn: 'Review', spot: 'Lot C4', stt: ['Waiting – Parts', '--warn'], ini: 'DK', hrs: '0.6 / 1.2 h', eyb: 'Waiting – Parts', nx: 'The dryer cartridge is backordered to Mon 11/2 — move the truck to the lot?' } },
  r3: { no: '2355', ron: 'RO-32355', cust: 'Summit Freightways', truck: '2021 Volvo VNL 860 · D13 TC 500HP · Unit 412', tech: 'Mike Rodriguez', writer: 'Jenna Cho', vin: '…MN551209',
    ops: [{ n: 1, c: 'Clutch slipping – replace clutch', os: 'Working' }, { n: 2, c: 'Clutch fork bushing worn', os: 'Hold Tech' }],
    parts: [{ op: 1, d: 'Clutch kit 15.5in', pn: '85020447', q: 1, st: 'Received', age: 1, price: 1284, w: 'Checked in', w2: 'no bin yet' },
      { op: 1, d: 'Pilot bearing', pn: '20787659', q: 1, st: 'Staged', age: 1, price: 38.9, w: 'Bin B-14', w2: 'for Mike' },
      { op: 2, d: 'Release bearing', pn: '85013179', q: 1, st: 'Ordered', age: 2, eta: ['Thu 10/29', 2], price: 212.5, w: 'ETA Thu 10/29', w2: 'ordered Sun' }],
    next: ['Release bearing due Thu — the clutch kit is checked in, no bin yet.', 'Stage it'],
    fm: { g: 'clocks', sub: 'Mike’s clock still running · 47 min', btn: 'Stop it', spot: 'D5', stt: ['Working · Repairing', '--s-good'], ini: 'MR', hrs: '3.2 / 8.0 h', eyb: 'In repair', nx: 'Mike’s clock still running from Mon 23:47 · 47 min' } },
  r4: { no: '4496', ron: 'RO-34496', cust: 'Copperline Transport', truck: '2020 Volvo VNL 760 · D13 455HP · Unit 2290', tech: 'Luis Martinez', writer: 'Ray Ortiz', vin: '…LN733015',
    ops: [{ n: 1, c: 'Turbo actuator fault', os: 'Waiting – Parts' }, { n: 2, c: 'EGR cooler gasket leak', os: 'Hold Tech' }],
    parts: [{ op: 1, d: 'Turbo actuator', pn: '22972152', q: 1, st: 'Ordered', age: 1, eta: ['Wed 10/28', 1], price: 1890, w: 'ETA tomorrow', w2: 'Wed 10/28' },
      { op: 2, d: 'EGR cooler gasket kit', pn: '21479380', q: 1, st: 'Ordered', age: 1, eta: ['Fri 10/30', 3], price: 74.2, w: 'ETA Fri 10/30', w2: 'ordered Mon' }],
    next: ['2 parts on the way — the first lands tomorrow.', 'Track'],
    fm: { g: 'bring', sub: 'Approved · parts on order', btn: 'Bring in', spot: 'Lot E2', stt: ['Waiting – Parts', '--warn'], ini: 'LM', hrs: '1.1 / 4.6 h', eyb: 'Approved', nx: 'Parts land tomorrow and Fri — plan Op 1 for Wednesday.' } },
  r5: { no: '3429', ron: 'RO-33429', cust: 'Granite State Express', truck: '2018 Volvo VNL 670 · D13 425HP · Unit 61', tech: 'Dana Kowalski', writer: 'Ray Ortiz', vin: '…JN114876',
    ops: [{ n: 1, c: 'Oil leak at the filter housing', os: 'Working' }],
    parts: [{ op: 1, d: 'Oil filter', pn: '21707132', q: 2, st: 'Picked up', age: 0, price: 32.6, w: 'With Dana', w2: 'picked up 9:40' },
      { op: 1, d: 'Filter housing gasket', pn: '21707133', q: 1, st: 'Picked up', age: 0, price: 18.4, w: 'With Dana', w2: 'picked up 9:40' }],
    next: ['Dana has both parts.', ''],
    fm: { g: 'bring', sub: 'Approved · parts in hand', btn: 'Bring in', spot: 'D8', stt: ['Working · Repairing', '--s-good'], ini: 'DK', hrs: '0.4 / 1.0 h', eyb: 'In repair', nx: 'Dana is on it — parts with her.' } },
  r6: { no: '3512', ron: 'RO-33512', cust: 'Midway Auto Transport', truck: '2023 Volvo VNL 760 · D13 TC 455HP · Unit 1180', tech: 'Mike Rodriguez', writer: 'Jenna Cho', vin: '…PN390112',
    ops: [{ n: 1, c: 'PM service — A', os: 'Complete' }],
    parts: [{ op: 1, d: 'Oil filter', pn: '21707132', q: 2, st: 'Installed', age: 0, price: 32.6, w: 'On the truck', w2: '' }, { op: 1, d: 'Fuel filter', pn: '23658092', q: 1, st: 'Installed', age: 0, price: 41.8, w: 'On the truck', w2: '' },
      { op: 1, d: 'Air filter', pn: '21702911', q: 1, st: 'Installed', age: 0, price: 88, w: 'On the truck', w2: '' }],
    next: ['Every part installed.', ''],
    fm: { g: 'watch', sub: '3.0 h on 2.2 h quoted', btn: 'Review', spot: 'F1', stt: ['Complete', '--s-good'], ini: 'MR', hrs: '3.0 / 2.2 h', eyb: 'Complete', nx: '3.0 h on 2.2 h quoted — review before it goes to Triage.' } },
  r7: { no: '8172', ron: 'RO-38172', cust: 'Red Mesa Hauling', truck: '2017 Volvo VNM 430 · D11 405HP · Unit 9', tech: 'Luis Martinez', writer: 'Ray Ortiz', vin: '…HN662310',
    ops: [{ n: 1, c: 'Check engine light — diagnose', os: 'Waiting – Foreman' }],
    parts: [], next: ['No parts on this RO.', ''],
    fm: { g: 'you', sub: 'Waiting on you · 2 d', btn: 'Decide', spot: 'D12', stt: ['Waiting – Foreman', '--warn'], ini: 'LM', hrs: '1.2 / 1.5 h', eyb: 'Waiting on you', nx: 'Luis wants a second look at the codes.' } }
};
var LISTS = {
  parts: [['To order', [['r1', '1 part', 'Order…']]], ['Late', [['r2', 'Air dryer cartridge · backordered · 6 d', 'Chase…', 'r']]], ['Arrived', [['r3', 'Clutch kit checked in 10/26 · no bin', 'Stage it', 'w']]],
    ['On the way', [['r4', '2 parts · next tomorrow', '']]], ['With the tech', [['r5', 'every part picked up', '']]], ['Installed today', [['r6', '3 parts on the truck', '']]], ['No parts', [['r7', 'nothing to get', '']]]],
  fm: [['Clocks', ['r3']], ['Waiting on you', ['r1', 'r7']], ['Bring in', ['r4', 'r5']], ['Watch', ['r2', 'r6']]]
};
/* ---------- the choices ---------- */
var CH = [
  ['THE TRACK', 'style', 'Track style', '', [['steps', 'Steps, like the Warranty page', 'dots and labels; the current one in its color', 1], ['pill', 'One compact pill', 'the stage, mini steps and the count on one line'], ['lanes', 'Part lanes', 'one thin bar per part, filled to where it is']]],
  ['', 'list', 'The stages', 'the RO sits where its furthest-behind part is', [['six', 'To order · Ordered · Received · Staged · Picked up · Installed', 'every step the Parts desk works', 1], ['five', 'To order · Ordered · In the shop · With the tech · Installed', 'Received and Staged as one'], ['four', 'To order · On the way · In hand · Installed', 'the shortest']]],
  ['', 'bo', 'Backordered', '', [['red', 'Part of Ordered — the step turns red', 'a backorder still decides before an order', 1], ['own', 'Its own step, right after To order', 'the furthest from in hand']]],
  ['', 'under', 'Under each stage', 'pick any', [['count', 'How many parts are there', '', 1], ['eta', 'ETA', '', 1], ['age', 'How long the oldest has been there', '']], 1],
  ['', 'call', 'The part that holds the stage', 'pick any', [['name', 'Named under the track', '“Held by Release bearing · ETA Thu”', 1], ['row', 'Highlighted in the parts list', '', 1], ['filter', 'Click a stage to show only its parts', 'click it again for all', 1]], 1],
  ['', 'where', 'Where it sits', '', [['below', 'Below the details', 'as asked', 1], ['top', 'Under the name, like the Warranty page', ''], ['next', 'Inside the Next card', '']]],
  ['', 'color', 'Colors', '', [['warr', 'Like the Warranty page', 'done in ink, the current stage in its part status color', 1], ['status', 'Every stage in its part status color', ''], ['calm', 'Ink only — red just for a backorder', '']]],
  ['', 'none', 'An RO with no parts', '', [['line', 'One quiet line — “no parts on this RO”', '', 1], ['hide', 'Nothing', '']]],
  ['FOREMAN', 'fm', 'The Foreman page shows', '', [['parts', 'The same parts stages', '', 1], ['ops', 'Operation stages instead', 'Not started · Waiting · Working · Complete — the furthest-behind operation decides'], ['both', 'Both — parts above operations', '']]],
  ['', 'rows', 'A stage pill on the list rows', 'pick any', [['fm', 'Foreman — the Needs action rows', '', 1], ['parts', 'Parts — the Needs action rows', '']], 1],
  ['MORE', 'xt', 'More on the track', 'pick any', [['promise', '“All in by Fri” at the end', 'the latest ETA of what isn’t in hand yet', 1, 1], ['act', 'The current stage carries its action', 'Order… · Chase… · Stage it · Tell the tech', 1, 1], ['aging', 'Days at a stage: amber at 2 d, red at 5 d', '', 1, 1],
    ['hover', 'Point at a stage for its parts', 'a small pop-over', 1, 1], ['opmini', 'Each operation gets its own mini stage', 'in its header — the least of its parts', 0, 1]], 1]
];
var V = { th: 'ivory', page: 'parts', dev: 'desk', sel: { parts: 'r3', fm: 'r3' }, filter: null, picks: false, note: '' };
CH.forEach(function(c){ var k = c[1]; if(c[5]){ V[k] = {}; c[4].forEach(function(o){ if(o[3]) V[k][o[0]] = 1; }); } else V[k] = (c[4].filter(function(o){ return o[3]; })[0] || c[4][0])[0]; });
/* ---------- the stage ---------- */
function steps(){
  var L;
  if(V.list === 'six') L = [['to', 'To order', ['Not Ordered']], ['ord', 'Ordered', ['Ordered']], ['rcv', 'Received', ['Received']], ['stg', 'Staged', ['Staged']], ['pk', 'Picked up', ['Picked up']], ['ins', 'Installed', ['Installed']]];
  else if(V.list === 'five') L = [['to', 'To order', ['Not Ordered']], ['ord', 'Ordered', ['Ordered']], ['in', 'In the shop', ['Received', 'Staged']], ['pk', 'With the tech', ['Picked up']], ['ins', 'Installed', ['Installed']]];
  else L = [['to', 'To order', ['Not Ordered']], ['ord', 'On the way', ['Ordered']], ['in', 'In hand', ['Received', 'Staged', 'Picked up']], ['ins', 'Installed', ['Installed']]];
  if(V.bo === 'own') L.splice(1, 0, ['bo', 'Backordered', ['Backordered']]); else L[1][2] = L[1][2].concat(['Backordered']);
  return L;
}
function stepOf(st, L){ for(var i = 0; i < L.length; i++) if(L[i][2].indexOf(st) >= 0) return i; return -1; }
/* one shape for both tracks: items, their stage list, how far each is, and how each looks */
function mkS(items, L, rank, stOf, colOf, unit){
  if(!items.length) return null;
  var min = Math.min.apply(null, items.map(rank)), least = items.filter(function(x){ return rank(x) === min; }), lst = stOf(least[0]);
  var at = L.map(function(s, i){ return items.filter(function(x){ return stepOf(stOf(x), L) === i; }); });
  var last = L.length - 1, done = items.every(function(x){ return stepOf(stOf(x), L) === last; });
  return { items: items, L: L, at: at, least: least, lst: lst, ci: stepOf(lst, L), done: done, col: colOf(lst), colOf: colOf, stOf: stOf, unit: unit, prob: lst === 'Backordered' };
}
function partsS(ro){ var L = steps(); return mkS(ro.parts.filter(function(p){ return p.st !== 'Returned'; }), L, function(p){ return STS.indexOf(p.st); }, function(p){ return p.st; }, scv, 'part'); }
function opsS(ro){
  var L = OPS.map(function(k){ return [k, OPL[k], [k]]; });
  return mkS(ro.ops.map(function(o){ return { o: o, st: opKey(o.os) }; }), L, function(x){ return OPS.indexOf(x.st); }, function(x){ return x.st; }, function(st){ return 'var(' + OPV[st] + ')'; }, 'op');
}
function curCol(S){ return V.color === 'calm' ? (S.prob ? 'var(--bad)' : 'var(--ink)') : S.col; }
function inHand(ro){ return ro.parts.filter(function(p){ return STS.indexOf(p.st) >= 3; }).length; }
function etaRange(L){ var e = L.filter(function(p){ return p.eta; }).map(function(p){ return p.eta; }).sort(function(a, b){ return a[1] - b[1]; }); if(!e.length) return L.some(function(p){ return p.st === 'Backordered'; }) ? 'no date' : ''; var a = e[0][0].split(' ')[0], z = e[e.length - 1][0].split(' ')[0]; return 'ETA ' + (a === z ? a : a + '–' + z); }
function underHtml(S, i){
  var at = S.at[i]; if(!at.length) return '';
  var b = [];
  if(V.under.count) b.push(at.length + ' ' + S.unit + (at.length === 1 ? '' : 's'));
  if(V.under.eta && S.unit === 'part'){ var e = etaRange(at); if(e) b.push(e); }
  if(V.under.age && S.unit === 'part' && !(S.done)){ var a = Math.max.apply(null, at.map(function(p){ return p.age || 0; })); if(a) b.push('<span class="' + (V.xt.aging ? (a >= 5 ? 'a2' : a >= 2 ? 'a1' : '') : '') + '">' + a + ' d</span>'); }
  else if(V.xt.aging && S.unit === 'part' && !S.done && i === S.ci){ var a2 = Math.max.apply(null, at.map(function(p){ return p.age || 0; })); if(a2 >= 2) b.push('<span class="' + (a2 >= 5 ? 'a2' : 'a1') + '">' + a2 + ' d here</span>'); }
  return b.length ? '<small>' + b.join(' · ') + '</small>' : '';
}
function nameOf(x){ return x.o ? 'Op ' + x.o.n + ' · ' + x.o.c : x.d; }
function popHtml(S, i){ if(!V.xt.hover || !S.at[i].length) return ''; return '<span class="pop"><b>' + esc(S.L[i][1]) + '</b>' + S.at[i].map(function(x){ return '<span>' + esc(nameOf(x)) + (x.eta ? ' · ' + esc(x.eta[0]) : '') + '</span>'; }).join('') + '</span>'; }
function stepsHtml(S, key){
  return '<ol class="pst-t">' + S.L.map(function(s, i){
    var cls = S.done || i < S.ci ? 'd' : i === S.ci ? 'c' : 'f', fo = V.filter && V.filter.k === key && V.filter.i === i;
    var dc = V.color === 'status' ? S.colOf(s[2][0]) : 'var(--ink)';
    var act = V.xt.act && cls === 'c' && S.unit === 'part' ? ACT[S.lst] : '';
    return '<li class="' + cls + (cls === 'c' && S.prob ? ' prob' : '') + (fo ? ' fo' : '') + '" style="--sc:' + curCol(S) + ';--dc:' + dc + '"><button class="stp" data-step="' + i + '" data-tk="' + key + '" aria-label="' + esc(s[1]) + '"><span class="dot">' + (cls === 'd' ? CHK : '') + '</span><span class="lb">' + esc(s[1]) + '</span>' + underHtml(S, i) + '</button>'
      + (act ? '<button class="go" data-go="' + esc(act) + '">' + esc(act) + '</button>' : '') + popHtml(S, i) + '</li>'; }).join('') + '</ol>';
}
function promiseHtml(ro, S){
  if(!V.xt.promise || S.unit !== 'part') return '';
  if(S.done) return '<span class="pst-pr">' + ic('check', 13) + '<b>All installed</b></span>';
  var notIn = ro.parts.filter(function(p){ return STS.indexOf(p.st) < 3; });
  if(!notIn.length) return '<span class="pst-pr">' + ic('check', 13) + '<b>All in hand</b></span>';
  if(notIn.some(function(p){ return p.st === 'Not Ordered'; })) return '<span class="pst-pr r">' + ic('clock', 13) + '<b>No date yet</b> — not ordered</span>';
  var e = notIn.filter(function(p){ return p.eta; }).sort(function(a, b){ return b.eta[1] - a.eta[1]; });
  if(notIn.some(function(p){ return !p.eta; })) return '<span class="pst-pr r">' + ic('clock', 13) + '<b>No date yet</b></span>';
  return '<span class="pst-pr' + (notIn.some(function(p){ return p.st === 'Backordered'; }) ? ' r' : '') + '">' + ic('clock', 13) + 'All in by <b>' + esc(e[0].eta[0]) + '</b></span>';
}
function headHtml(ro, S, title){
  var lbl = S.done ? (S.unit === 'part' ? 'Installed' : 'Complete') : S.L[S.ci][1] + (S.prob && V.bo !== 'own' && S.unit === 'part' ? ' · backordered' : '');
  var cnt = S.unit === 'part' ? inHand(ro) + ' of ' + S.items.length + ' in hand' : S.items.filter(function(x){ return x.st === 'Complete'; }).length + ' of ' + S.items.length + ' complete';
  return '<div class="pst-h" style="--sc:' + (S.done ? 'var(--s-good)' : curCol(S)) + '"><b>' + title + '</b><span class="lbl">' + esc(lbl) + '</span><span>· ' + cnt + '</span><span class="sp"></span>' + promiseHtml(ro, S) + '</div>';
}
function heldHtml(S){
  if(!V.call.name || S.done) return '';
  var L = S.least, one = L.length === 1, x = L[0];
  var what = one ? '<b>' + esc(nameOf(x)) + '</b>' : '<b>' + L.length + ' ' + S.unit + 's</b> — ' + esc(L.map(nameOf).join(', '));
  var tail = S.unit === 'part' ? ' · ' + esc(sname(S.lst)) + (one && x.eta ? ' · ETA ' + esc(x.eta[0]) : one && x.st === 'Backordered' ? ' · no date' : '') + (one && x.age >= 2 ? ' · ' + x.age + ' d' : '') : ' · ' + esc(OPL[S.lst]);
  return '<div class="pst-held" style="--sc:' + curCol(S) + '"><i></i><span>Held by ' + what + tail + '</span></div>';
}
function pillHtml(ro, S, key, title){
  var lbl = S.done ? (S.unit === 'part' ? 'Installed' : 'Complete') : S.L[S.ci][1];
  var mini = S.L.map(function(s, i){ var cls = S.done || i < S.ci ? 'd' : i === S.ci ? 'c' : ''; var fo = V.filter && V.filter.k === key && V.filter.i === i; return '<button class="' + cls + (fo ? ' fo' : '') + '" data-step="' + i + '" data-tk="' + key + '" title="' + esc(s[1]) + (S.at[i].length ? ' · ' + S.at[i].length : '') + '"></button>'; }).join('');
  var cnt = S.unit === 'part' ? inHand(ro) + ' of ' + S.items.length + ' in hand' + (V.under.eta && !S.done ? (function(){ var e = etaRange(S.at[S.ci] || []); return e ? ' · ' + e : ''; })() : '') : S.items.filter(function(x){ return x.st === 'Complete'; }).length + ' of ' + S.items.length + ' complete';
  var act = V.xt.act && !S.done && S.unit === 'part' && ACT[S.lst] ? '<button class="btn sm" data-go="' + esc(ACT[S.lst]) + '">' + esc(ACT[S.lst]) + '</button>' : '';
  return '<div class="pst pill" style="--sc:' + (S.done ? 'var(--s-good)' : curCol(S)) + '"><span class="pp"><i></i>' + title + ' · ' + esc(lbl) + '</span><span class="mini">' + mini + '</span><span class="ps">' + cnt + '</span><span class="sp"></span>' + promiseHtml(ro, S) + act + '</div>' + heldHtml(S);
}
function lanesHtml(ro, S, title){
  var n = S.L.length, ticks = ''; for(var i = 1; i < n; i++) ticks += '<u style="left:' + (i / n * 100).toFixed(2) + '%"></u>';
  var leastSet = S.least;
  return '<div class="pst">' + headHtml(ro, S, title) + '<div class="lanes">' + S.items.map(function(x){ var st = S.stOf(x), k = stepOf(st, S.L) + 1, hl = !S.done && leastSet.indexOf(x) >= 0;
      return '<div class="ln' + (hl ? ' hl' : '') + '" style="--sc:' + S.colOf(st) + '"><span>' + esc(nameOf(x)) + '</span><span class="lt"><i style="width:' + (k / n * 100).toFixed(2) + '%"></i>' + ticks + '</span><em>' + esc(S.unit === 'part' ? sname(st) : OPL[st]) + (x.eta && V.under.eta ? ' · ' + esc(x.eta[0].split(' ')[0]) : '') + '</em></div>'; }).join('')
    + '</div><div class="lax"><span></span><div>' + S.L.map(function(s){ return '<span>' + esc(s[1]) + '</span>'; }).join('') + '</div><span></span></div>' + heldHtml(S) + '</div>';
}
function trackHtml(ro, S, key, title){
  if(!S) return V.none === 'line' ? '<div class="pst-q">' + title + ' · <b>none on this RO</b></div>' : '';
  if(V.style === 'pill') return pillHtml(ro, S, key, title);
  if(V.style === 'lanes') return lanesHtml(ro, S, title);
  return '<div class="pst' + (V.xt.hover ? ' hov' : '') + '">' + headHtml(ro, S, title) + stepsHtml(S, key) + heldHtml(S) + '</div>';
}
function rowPill(ro){ var S = partsS(ro); if(!S) return '<span class="rp" style="--sc:var(--ink4)"><i></i>No parts</span>'; var l = S.done ? 'Installed' : S.L[S.ci][1]; return '<span class="rp" style="--sc:' + (S.done ? 'var(--s-good)' : curCol(S)) + '"><i></i>' + esc(l) + '</span>'; }
/* ---------- the RO sections ---------- */
function partsRo(ro){
  var S = partsS(ro), tr = trackHtml(ro, S, 'p', 'Parts'), where = V.where;
  var h = '<div class="eb"><span class="no">' + ro.ron + '</span>' + (ro.tag ? '<span class="tag">' + ro.tag + '</span>' : '') + '<span>· ' + esc(ro.truck) + '</span><span class="sp"></span><button class="btn sm">' + ic('swap') + 'Send to…</button><button class="btn sm">Open RO</button></div>';
  h += '<h2>' + esc(ro.cust) + '</h2><div class="acts"><button class="btn sm">' + ic('unit') + 'Road test</button><button class="btn sm">' + ic('check') + 'Truck checks</button></div>';
  if(where === 'top') h += tr;
  h += '<div class="dets"><div><small>Truck</small><b>' + (ro.fm.spot ? esc(ro.fm.spot) : 'No spot yet') + '</b></div><div><small>Technician</small><b>' + esc(ro.tech) + '</b></div><div><small>Writer</small><b>' + esc(ro.writer) + '</b></div><div><small>VIN</small><b class="mono">' + esc(ro.vin) + '</b></div><div><small>Parts on this RO</small><b class="mono">$' + ro.parts.reduce(function(a, p){ return a + p.price * p.q; }, 0).toFixed(2) + '</b></div></div>';
  if(where === 'below') h += tr;
  h += nextHtml(ro.next, where === 'next' ? tr : '');
  var flt = V.filter && V.filter.k === 'p' && S ? V.filter.i : null;
  if(flt != null) h += '<div class="opc"><div class="fbar">Showing <b>' + esc(S.L[flt][1]) + '</b> · ' + S.at[flt].length + ' part' + (S.at[flt].length === 1 ? '' : 's') + '<span style="flex:1"></span><button data-clr>Show all</button></div></div>';
  ro.ops.forEach(function(o){
    var P = ro.parts.filter(function(p){ return p.op === o.n; }), ih = P.filter(function(p){ return STS.indexOf(p.st) >= 3; }).length;
    var mini = ''; if(V.xt.opmini && P.length){ var S2 = mkS(P, steps(), function(p){ return STS.indexOf(p.st); }, function(p){ return p.st; }, scv, 'part'); mini = '<span class="opmini" style="--sc:' + (S2.done ? 'var(--s-good)' : curCol(S2)) + '"><i></i>' + esc(S2.done ? 'Installed' : S2.L[S2.ci][1]) + '</span>'; }
    h += '<div class="opc"><div class="oph"><span class="n">' + o.n + '</span>' + (o.t ? '<span class="tag">' + o.t + '</span>' : '') + '<b>' + esc(o.c) + '</b>' + mini + (P.length ? '<span class="ih">' + ih + ' of ' + P.length + ' in hand</span><span class="mb"><i style="width:' + (ih / P.length * 100) + '%"></i></span>' : '') + '</div>';
    if(!P.length){ h += '<div class="none">No parts on this operation.</div></div>'; return; }
    h += '<table class="tb"><thead><tr><th>Status</th><th>Part</th><th>Part #</th><th class="r">Qty</th><th>Where</th><th class="r">Each</th></tr></thead><tbody>' + P.map(function(p){
      var hl = V.call.row && S && !S.done && S.least.indexOf(p) >= 0, gone = flt != null && stepOf(p.st, S.L) !== flt;
      return '<tr class="' + (hl ? 'hl' : '') + (gone ? ' gone' : '') + '" style="--sc:' + scv(p.st) + '"><td><span class="chip"><i></i>' + esc(sname(p.st)) + '</span>' + (hl ? '<span class="hold">holds the stage</span>' : '') + '</td><td>' + esc(p.d) + '</td><td class="mono">' + p.pn + '</td><td class="r">' + p.q + '</td><td>' + esc(p.w) + (p.w2 ? '<small>' + esc(p.w2) + '</small>' : '') + '</td><td class="r mono">$' + p.price.toFixed(2) + '</td></tr>'; }).join('') + '</tbody></table></div>';
  });
  return '<div class="ro" data-ro="' + ro.no + '">' + h + '</div>';
}
function nextHtml(nx, tr){ if(!nx[0]) return ''; return '<div class="next' + (tr ? ' inn' : '') + '"><em>Next</em><span>' + esc(nx[0]) + '</span>' + (nx[1] ? '<button class="btn sm pri" data-go="' + esc(nx[1]) + '">' + esc(nx[1]) + '</button>' : '') + tr + '</div>'; }
function fmRo(ro){
  var f = ro.fm, Sp = partsS(ro), So = opsS(ro), where = V.where;
  var tr = (V.fm !== 'ops' ? trackHtml(ro, Sp, 'p', 'Parts') : '') + (V.fm !== 'parts' ? trackHtml(ro, So, 'o', 'Operations') : '');
  var h = '<div class="eb"><span class="no">' + ro.ron + '</span><span class="stt"><i style="background:var(' + f.stt[1] + ')"></i>' + esc(f.eyb) + '</span><span>· ' + esc(ro.ops[0].c) + '</span><span class="sp"></span><button class="btn sm">' + ic('swap') + 'Transfer…</button><button class="btn sm">Move truck</button><button class="btn sm">Open RO</button></div>';
  h += '<div class="rtop"><div><h2>' + esc(ro.cust) + '</h2><div class="acts"><button class="btn sm">' + ic('unit') + 'Road test</button><button class="btn sm">' + ic('check') + 'Truck checks</button></div></div><div class="pic">' + TRUCK + '</div></div>';
  if(where === 'top') h += tr;
  h += '<div class="frow"><span class="sp2">' + esc(f.spot) + '</span><span class="stt"><i style="background:var(' + f.stt[1] + ')"></i>' + esc(f.stt[0]) + '</span><span><span class="av">' + f.ini + '</span> ' + esc(ro.tech) + '</span><span class="hrs">' + f.hrs + '</span></div>';
  if(where === 'below') h += tr;
  h += nextHtml([f.nx, f.btn], where === 'next' ? tr : '');
  var flt = V.filter && V.filter.k === 'p' && Sp ? V.filter.i : null;
  if(flt != null) h += '<div class="opc"><div class="fbar">Parts at <b>' + esc(Sp.L[flt][1]) + '</b><span style="flex:1"></span><button data-clr>Close</button></div><table class="tb"><tbody>' + Sp.at[flt].map(function(p){ return '<tr style="--sc:' + scv(p.st) + '"><td><span class="chip"><i></i>' + esc(sname(p.st)) + '</span></td><td>' + esc(p.d) + '</td><td>' + esc(p.w) + '</td></tr>'; }).join('') + (Sp.at[flt].length ? '' : '<tr><td class="none">Nothing here.</td></tr>') + '</tbody></table></div>';
  h += '<div class="kpis"><div><small>Lined up for today</small><b>12.1 h</b></div><div><small>Clocked today</small><b>0.0 h</b></div><div><small>Flagged today</small><b>0.0 h</b></div><div><small>Bays</small><b>0 / 19</b></div></div>';
  return '<div class="ro">' + h + '</div>';
}
/* ---------- the page ---------- */
function listHtml(){
  var pg = V.page, sel = V.sel[pg], h = '<div class="nah">Needs action<em>' + (pg === 'parts' ? 7 : 7) + '</em></div>';
  if(pg === 'parts') LISTS.parts.forEach(function(g){ h += '<h4>' + g[0] + '<em>' + g[1].length + '</em></h4>' + g[1].map(function(x){ var ro = ROS[x[0]];
      return '<button class="it' + (sel === x[0] ? ' on' : '') + '" data-sel="' + x[0] + '"><span class="tk">' + ic('parts', 18) + '</span><span class="t"><b><span class="no">' + ro.no + '</span><span class="nm">' + esc(ro.cust) + '</span>' + (V.rows.parts ? rowPill(ro) : '') + '</b><small class="' + (x[3] || '') + '">' + esc(x[1]) + '</small></span>' + (x[2] ? '<span class="btn">' + esc(x[2]) + '</span>' : '<span></span>') + '</button>'; }).join(''); });
  else LISTS.fm.forEach(function(g){ h += '<h4>' + g[0] + '<em>' + g[1].length + '</em></h4>' + g[1].map(function(id){ var ro = ROS[id], f = ro.fm;
      return '<button class="it' + (sel === id ? ' on' : '') + '" data-sel="' + id + '"><span class="tk">' + TRUCK + '</span><span class="t"><b><span class="no">' + ro.no + '</span><span class="nm">' + esc(ro.cust) + '</span>' + (V.rows.fm ? rowPill(ro) : '') + '</b><small class="' + (f.g === 'clocks' ? 'w' : '') + '">' + esc(f.sub) + '</small></span><span class="btn' + (f.btn === 'Decide' || f.btn === 'Bring in' ? ' pri' : '') + '">' + esc(f.btn) + '</span></button>'; }).join(''); });
  return h;
}
function howHtml(){
  var L = steps();
  return '<div class="how"><b>How the stage is picked</b>' + STS.map(function(s, i){ return (i ? '<span class="ar">›</span>' : '') + '<span class="chip" style="--sc:' + scv(s) + '"><i></i>' + esc(sname(s)) + '</span>'; }).join('') + '<span>— the RO sits where its furthest-behind part is (Returned parts don’t count).</span></div>';
}
function draw(){
  var y = window.scrollY, pg = V.page, ro = ROS[V.sel[pg]];
  var sec = pg === 'parts' ? partsRo(ro) : fmRo(ro), prev;
  if(V.dev === 'phone') prev = '<div class="phw"><div class="phone"><div class="scr"><div class="pbar"><b>' + (pg === 'parts' ? 'Parts' : 'Foreman') + '</b><span>· tap an RO</span></div><div class="rsel">' + Object.keys(ROS).map(function(id){ return '<button data-sel="' + id + '" aria-pressed="' + (V.sel[pg] === id) + '">' + ROS[id].no + '</button>'; }).join('') + '</div>' + sec + '</div></div>'
    + '<div class="phnote">At phone width the steps keep their dots and labels; only the current stage keeps its line under it.</div></div>';
  else prev = '<div class="pv"><div class="pvh"><h3>' + (pg === 'parts' ? 'Parts' : 'Foreman') + '</h3><span class="sum">' + (pg === 'parts' ? '<b>1</b> to order · <span class="w">1 late</span>' : '<b>0/19</b> bays · 1 waiting on you · <span class="w">1 late</span>') + '</span><div class="seg tabs">'
    + (pg === 'parts' ? ['Desk', 'On order', 'Shelf', 'Returns', 'Catalog'] : ['Floor', 'Techs', 'Yard', 'Tomorrow']).map(function(t, i){ return '<button aria-pressed="' + (i === 0) + '">' + t + '</button>'; }).join('') + '</div></div><div class="na">' + listHtml() + '</div>' + sec + '</div>';
  $('#pg').innerHTML = '<div class="wrap"><div class="two"><div>' + prev + howHtml() + '</div>' + chsHtml() + '</div></div>';
  window.scrollTo(0, y); sync(); pkDraw();
}
function sync(){
  $$('.mk button[data-th]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-th') === V.th)); });
  $$('.mk button[data-page]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-page') === V.page)); });
  $$('.mk button[data-dev]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-dev') === V.dev)); });
  D.documentElement.setAttribute('data-th', V.th);
}
function chsHtml(){
  return '<div class="chs">' + CH.map(function(c){ var k = c[1], multi = c[5];
    return (c[0] ? '<div class="hd">' + c[0] + '</div>' : '') + '<div class="ch"><b>' + c[2] + '</b>' + (c[3] ? '<small>' + c[3] + '</small>' : '') + '<div class="ol">' + c[4].map(function(o){ var on = multi ? !!V[k][o[0]] : V[k] === o[0];
      return '<button class="opt' + (multi ? ' sq' : '') + '" data-ch="' + k + '" data-v="' + o[0] + '" aria-pressed="' + on + '"><i></i><span><b>' + o[1] + (o[4] ? '<em>SUGGESTED</em>' : '') + '</b>' + (o[2] || '') + '</span></button>'; }).join('') + '</div></div>'; }).join('') + '</div>';
}
function pkText(){
  var L = ['Parsec · Parts stages on the Parts and Foreman pages — my picks'];
  CH.forEach(function(c){ var k = c[1], lab = c[2], vals;
    if(c[5]) vals = c[4].filter(function(o){ return V[k][o[0]]; }).map(function(o){ return o[1]; }).join(', ') || 'none';
    else vals = c[4].filter(function(o){ return o[0] === V[k]; })[0][1];
    L.push('· ' + (c[0] === 'FOREMAN' || k === 'rows' ? lab : lab) + ': ' + vals); });
  if(V.note.trim()) L.push('· Notes: ' + V.note.trim());
  return L.join('\n');
}
function pkDraw(){ var w = $('#picks'); w.hidden = !V.picks; if(!V.picks) return;
  var ta = $('#pk-note'), keep = ta && D.activeElement === ta;
  if(keep){ var pre = $('#picks pre'); if(pre) pre.textContent = pkText(); return; }
  w.innerHTML = '<div class="pk-h"><b>Your picks</b><button class="x" data-pk="x" aria-label="Close">' + ic('x', 15) + '</button></div><pre>' + esc(pkText()) + '</pre><div class="pk-r"><span>Anything else</span><textarea id="pk-note" placeholder="e.g. hide Staged on the Foreman page">' + esc(V.note) + '</textarea></div><button class="btn pri" data-pk="copy">' + ic('copy') + 'Copy for the chat</button>'; }
function toast(m){ var t = $('.toast'); if(t) t.remove(); t = D.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = m; D.body.appendChild(t); clearTimeout(toast.h); toast.h = setTimeout(function(){ t.remove(); }, 2600); }
D.addEventListener('click', function(e){
  var t = e.target, b;
  if((b = t.closest('.mk button[data-th]'))){ V.th = b.getAttribute('data-th'); sync(); return; }
  if((b = t.closest('.mk button[data-page]'))){ V.page = b.getAttribute('data-page'); V.filter = null; draw(); return; }
  if((b = t.closest('.mk button[data-dev]'))){ V.dev = b.getAttribute('data-dev'); draw(); return; }
  if((b = t.closest('[data-sel]'))){ V.sel[V.page] = b.getAttribute('data-sel'); V.filter = null; draw(); return; }
  if((b = t.closest('[data-step]'))){ if(!V.call.filter){ toast('Turn on “Click a stage to show only its parts” to filter.'); return; } var k = b.getAttribute('data-tk'), i = +b.getAttribute('data-step');
    if(k !== 'p'){ toast('Operations: the Foreman page opens that operation.'); return; }
    V.filter = V.filter && V.filter.k === k && V.filter.i === i ? null : { k: k, i: i }; draw(); return; }
  if(t.closest('[data-clr]')){ V.filter = null; draw(); return; }
  if((b = t.closest('[data-go]'))){ toast(b.getAttribute('data-go') + ' — in the app this opens the same pop-over as today.'); return; }
  if((b = t.closest('[data-ch]'))){ var k2 = b.getAttribute('data-ch'), v = b.getAttribute('data-v'), c = CH.filter(function(x){ return x[1] === k2; })[0];
    if(c[5]) V[k2][v] = V[k2][v] ? 0 : 1; else V[k2] = v;
    if(k2 === 'list' || k2 === 'bo') V.filter = null; draw(); return; }
  if((b = t.closest('[data-pk]'))){ var a = b.getAttribute('data-pk'); if(a === 'x'){ V.picks = false; pkDraw(); }
    if(a === 'copy'){ var tx = pkText(); (navigator.clipboard ? navigator.clipboard.writeText(tx) : Promise.reject()).then(function(){ toast('Copied — paste it in the chat.'); }, function(){ var ta = D.createElement('textarea'); ta.value = tx; D.body.appendChild(ta); ta.select(); try{ D.execCommand('copy'); toast('Copied — paste it in the chat.'); }catch(er){} ta.remove(); }); }
    return; }
  if(t.closest('#pk-open')){ V.picks = !V.picks; pkDraw(); return; }
});
D.addEventListener('input', function(e){ if(e.target.id === 'pk-note'){ V.note = e.target.value; var pre = $('#picks pre'); if(pre) pre.textContent = pkText(); } });
D.addEventListener('keydown', function(e){ if(e.key !== 'Escape') return; if(V.picks){ V.picks = false; pkDraw(); } else if(V.filter){ V.filter = null; draw(); } });
draw();
