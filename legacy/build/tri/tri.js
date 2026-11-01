/* Parsec · Triage — transfer (department → employee → why → back by), the road test and the truck checks, on the Triage page */
var D = document, $ = function(s){ return D.querySelector(s); };
function ic(k, s){ return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"' + (s ? ' style="width:' + s + 'px;height:' + s + 'px"' : '') + '>' + (IC[k] || '') + '</svg>'; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function ini(n){ return String(n).split(/\s+/).map(function(w){ return w[0]; }).join('').slice(0, 2).toUpperCase(); }
var NOW = '1:40 pm';
/* the team, by department */
var DEPT = [
  ['tech', 'Technicians', 'TE', 'the repair', 2, ['Repair — approved', 'Parts arrived', 'Recheck', 'Road test']],
  ['foreman', 'Foreman', 'FM', 'bays, second opinions, QC', 1, ['Tech + bay', 'Second opinion', 'Comeback', 'QC before release']],
  ['parts', 'Parts', 'PT', 'order, check in, returns', 4, ['Parts needed', 'Wrong part', 'Core return', 'Price check']],
  ['writer', 'Service writers', 'SW', 'approvals, the customer', 2, ['Approval needed', 'Estimate ready', 'Customer question', 'End-of-shift hand-off']],
  ['warranty', 'Warranty', 'WA', 'claims, tech support', 8, ['Warranty claim', 'Tech support case', 'Policy question']],
  ['manager', 'Manager', 'MG', 'sign-off, pricing', 4, ['Sign-off', 'Customer complaint', 'Pricing call']]
];
var DBY = {}; DEPT.forEach(function(d){ DBY[d[0]] = d; });
var PPL = {
  tech: [['Mike Rodriguez', 'job', 'On the clock · 8877', '7 ROs'], ['Dana Kowalski', 'free', 'Free since 1:12', '3 ROs'], ['Luis Martinez', 'free', 'Free since 1:35', '5 ROs'], ['Priya Shah', 'out', 'Lunch · back 2:00', '5 ROs']],
  foreman: [['Frank Delaney', 'free', 'On the floor', '12 trucks']],
  parts: [['Ben Ortiz', 'free', 'At the counter', '4 asks'], ['Sam Lee', 'job', 'Checking in a delivery', '2 asks']],
  writer: [['Jenna Cho', 'free', 'At the desk — that’s you', '9 ROs'], ['Marcus Hill', 'out', 'Off today', '—']],
  warranty: [['Rita Gomez', 'free', 'At the desk', '6 claims']],
  manager: [['Tom Becker', 'job', 'In a meeting until 3:00', '—']]
};
var BACK = [['1h', 'In 1 hour', '2:40 pm'], ['2h', 'In 2 hours', '3:40 pm'], ['4h', 'In 4 hours', '5:40 pm'], ['eod', 'End of day', '5:00 pm'], ['tom', 'Tomorrow', '8:00 am'], ['pick', 'Pick a time', ''], ['none', 'Not coming back', '']];
var IMG = window.IMG || {};
/* the ROs on the yard */
var RO = {
  a: { no: '4410', full: 'RO-34410', cust: 'Summit Freightways', img: 'a', truck: '2020 Volvo VNL 760 · Unit T-807', spot: 'D4', st: ['w', 'Waiting – Customer'], sub: 'Approved by phone 1:22 pm', with: ['Jenna Cho', 'Service writers', 'since 11:05'], age: '2d', cmp: 'Clutch slipping – replace clutch' },
  b: { no: '9702', full: 'RO-39702', cust: 'Rick’s Freight LLC', img: 'b', truck: '2019 Volvo VNR 640 · Unit T-573', spot: 'Bay 6', st: ['g', 'Complete – Road test'], sub: 'All operations done 1:05 pm', with: ['Mike Rodriguez', 'Technicians', 'since 8:10'], age: '4d', cmp: 'Replace rear brake chamber' },
  c: { no: '7190', full: 'RO-37190', cust: 'Tri-County Waste', img: 'c', truck: '2021 Volvo VHD 300 · Unit 412', spot: 'E8', st: ['g', 'Complete – Road test'], sub: 'Road test passed 12:17 · 11 mi', with: ['Luis Martinez', 'Technicians', 'since 9:30'], age: '3d', cmp: 'Check engine light – NOx sensor', rt: 1 },
  d: { no: '2931', full: 'RO-32931', cust: 'Prairie Line Trucking', img: 'a', truck: '2018 Volvo VNL 760 · Unit 88', spot: 'D6', st: ['w', 'Waiting – Customer'], sub: 'Approval pending', with: ['Jenna Cho', 'Service writers', '6 h'], age: '14d', cmp: 'NOx sensor fault SPN 3226' },
  e: { no: '4712', full: 'RO-34712', cust: 'Silverline LTL', img: 'b', truck: '2019 Volvo VNR 640 · Unit 1180', spot: 'F2', st: ['g', 'Complete – Road test'], sub: 'Checks done 12:50', with: ['Jenna Cho', 'Service writers', ''], age: '13d', cmp: 'PM service – level A', rt: 1, qc: 1 },
  f: { no: '3133', full: 'RO-33133', cust: 'Granite State Express', img: 'c', truck: '2021 Volvo VHD 300 · Unit 23', spot: 'Lot B', st: ['b', 'Waiting – Parts'], sub: 'Release bearing backordered', with: ['Ben Ortiz', 'Parts', '26 h'], age: '6d', cmp: 'Clutch release bearing' },
  g: { no: '7685', full: 'RO-37685', cust: 'Evergreen Moving', img: 'a', truck: '2020 Volvo VNL 760 · Unit 640', spot: 'Bay 3', st: ['g', 'Complete – Road test'], sub: 'Mike drives at 2:30', with: ['Mike Rodriguez', 'Technicians', ''], age: '2d', cmp: 'Air leak at the dash valve' }
};
var WALK0 = ['Tools out of the truck', 'Covers and caps on', 'No leaks under the truck', 'Cab clean — no grease on the seat or wheel', 'Keys in the key box', 'Paperwork in the cab'];
var RTCHK = ['Brakes', 'Steering', 'Shifts clean', 'Power and boost', 'No codes after', 'No leaks', 'No noise', 'Cruise and A/C'];
var FAILW = ['Same complaint', 'New fault code', 'Noise', 'Leak', 'Warning light'];
/* the picks */
var CH = [
  ['TRANSFER', 'xPres', 'How transfer looks', '', [['steps', 'One pop-over, one step at a time', 'Department, then employee, then why, then back by — Back goes up a step', 1], ['sheet', 'A side sheet with all four', 'everything visible at once; Transfer at the bottom'], ['row', 'Four dropdowns in a row', 'under the RO’s header — quickest for regulars']]],
  ['', 'xShow', 'Employees show', '', [['status', 'Who’s free, on the clock or out, and their load', 'free first', 1], ['names', 'Just the names', '']]],
  ['', 'xQueue', 'Send to a department’s queue', 'Nobody in particular — whoever there takes it first', [['yes', 'Yes — “Anyone in Parts”', '', 1], ['no', 'No — always a person', '']]],
  ['', 'xBack', 'Back by starts on', '', [['goal', 'The department’s goal', 'Technicians 2 h, Parts 4 h, Foreman 1 h…', 1], ['none', 'Nothing picked', 'you pick each time'], ['1h', 'In 1 hour', '']]],
  ['', 'xAccept', 'They accept it first', '', [['no', 'No — it’s theirs when you send it', '', 1], ['yes', 'Yes — it waits for their OK in their Inbox', '']]],
  ['', 'xLate', 'Past back by', '', [['held', 'Goes to Held too long, red countdown', '', 1], ['ping', 'Also pings you and them in the Inbox', '']]],
  ['ROAD TEST', 'rWhere', 'Where you reach it', 'pick any', [['btn', 'Road test button on the RO', '', 1], ['grp', 'A Road test group in Needs action', 'trucks with every op done', 1], ['ready', 'On the Ready to close card', '']], 1],
  ['', 'rLog', 'Who logs the result', '', [['any', 'Anyone — the driver, Triage, the foreman', '', 1], ['driver', 'Only the driver', ''], ['desk', 'Triage and the foreman', '']]],
  ['', 'rChecks', 'What was checked', '', [['list', 'Tap the checks, plus a note', 'brakes, steering, shifts, codes…', 1], ['text', 'A note only', '']]],
  ['', 'rFail', 'A failed road test goes to', '', [['tech', 'The tech who did the work', 'with the reason, back by in 2 h', 1], ['foreman', 'The foreman to decide', '']]],
  ['TRUCK CHECKS', 'qWho', 'Who does the truck checks', '', [['triage', 'Triage', 'from this page', 1], ['foreman', 'The foreman', 'Triage sees them'], ['either', 'Either one', '']]],
  ['', 'qWhich', 'Which ROs need them', '', [['all', 'Every RO', '', 1], ['some', 'Comebacks and warranty', ''], ['off', 'Off', 'Release right after the road test']]],
  ['', 'qBlock', 'Release before every check is done', '', [['block', 'Blocked until all are ticked', '', 1], ['note', 'Allowed with a reason', 'the reason goes on the RO']]],
  ['', 'qWhere', 'Where you reach them', 'pick any', [['btn', 'Truck checks button on the RO', '', 1], ['grp', 'A Truck checks group in Needs action', '', 1]], 1]
];
var V = { flow: 'xfer', sel: 'a', th: 'ivory', picks: false, note: '',
  P: { xPres: 'steps', xShow: 'status', xQueue: 'yes', xBack: 'goal', xAccept: 'no', xLate: 'held', rWhere: { btn: 1, grp: 1 }, rLog: 'any', rChecks: 'list', rFail: 'tech', qWho: 'triage', qWhich: 'all', qBlock: 'block', qWhere: { btn: 1, grp: 1 } },
  X: null, sent: null, R: { open: true, m: 'send', who: 'Mike Rodriguez', when: 'now', res: 'Pass', mi: '', start: '1:45 pm', ck: {}, fw: '', note: '', done: null }, Q: { ticks: {}, edit: false, walk: WALK0.slice(), add: '', released: false, why: '' } };
function xNew(){ var b = V.P.xBack; V.X = { open: true, step: 0, dept: null, who: null, why: null, note: '', back: b === 'none' ? null : b === '1h' ? '1h' : 'goal', time: '', menu: null }; }
xNew();
/* ---------- the Needs action list ---------- */
function item(id, why, go, pri, cd){ var r = RO[id]; return '<button class="it' + (V.sel === id ? ' on' : '') + '" data-sel="' + id + '"><img src="' + (IMG[r.img] || '') + '" alt=""><span class="t"><b><em>' + r.no + '</em>' + esc(r.cust) + '</b><small>' + esc(why) + '</small></span>' + (cd ? cd : go ? '<span class="go' + (pri ? ' pri' : '') + '">' + go + '</span>' : '') + '</button>'; }
function grp(t, n, nw){ return '<div class="ngh' + (nw ? ' new' : '') + '">' + t + ' <span class="n">' + n + '</span></div>'; }
function listHtml(){
  var P = V.P, h = '<div class="na-h">Needs action <small>' + (6 + (V.sent ? 1 : 0)) + '</small></div>';
  h += grp('Sent to you', 1) + item('d', 'Approval pending · 6 h', 'Follow up');
  if(!(V.sent && V.sent.id === 'a')) h += grp('Waiting on customers', 1) + item('a', 'Approved 1:22 — send it to a tech', 'Transfer');
  if(V.sent) h += grp('Sent out · coming back', 1, 1) + item(V.sent.id, 'With ' + V.sent.whoF + ' · ' + V.sent.why, '', 0, V.sent.back ? '<span class="cd">' + V.sent.left + '</span>' : '<span class="cd">no time</span>');
  if(P.rWhere.grp) h += grp('Road test', 2, 1) + item('b', 'Every op done 1:05 · nobody set', 'Road test', 1) + item('g', 'Mike drives at 2:30', '', 0, '<span class="cd">in 50m</span>');
  if(P.qWhere.grp && P.qWhich !== 'off') h += grp('Truck checks', 1, 1) + item('c', 'Road test passed 12:17 · 6 checks', 'Check', 1);
  h += grp('Ready to go', 1) + item('e', 'Checks done 12:50', 'Release', 1);
  h += grp('Held too long', 1) + item('f', 'With Parts 26 h · goal 4 h', '', 0, '<span class="cd b">+22h</span>');
  return '<aside class="na">' + h + '</aside>';
}
/* ---------- the selected RO ---------- */
function headHtml(id){
  var r = RO[id], P = V.P, sent = V.sent && V.sent.id === id;
  var acts = '<button class="btn sm' + (V.flow === 'xfer' && V.X.open ? ' hl' : '') + '" data-x="xopen">' + ic('swap') + 'Transfer…</button>'
    + (P.rWhere.btn ? '<button class="btn sm new' + (V.flow === 'road' ? ' hl' : '') + '" data-x="ropen">' + ic('road') + 'Road test</button>' : '')
    + (P.qWhere.btn && P.qWhich !== 'off' ? '<button class="btn sm new' + (V.flow === 'qc' ? ' hl' : '') + '" data-x="qopen">' + ic('check') + 'Truck checks</button>' : '')
    + (r.qc || (id === 'c' && V.Q.released) ? '<button class="btn sm pri">' + ic('keyTag') + 'Release</button>' : '') + '<span class="sp"></span><button class="btn sm gh">Open RO</button>';
  return '<div class="ph2"><div><div class="r1"><span class="no">' + r.full + '</span><span class="chip ' + r.st[0] + '"><i></i>' + esc(sent ? (V.P.xAccept === 'yes' ? 'Sent — waiting for ' + V.sent.whoF : V.sent.st) : r.st[1]) + '</span><span>·</span><span>' + r.age + '</span></div><h2>' + esc(r.cust) + '</h2><div class="r2"><span class="chip">' + ic('pin') + esc(r.spot) + '</span><span>' + esc(r.truck) + '</span></div></div><img class="trk" src="' + (IMG[r.img] || '') + '" alt=""><div class="acts">' + acts + '</div></div>';
}
function whoCard(id){
  var r = RO[id], s = V.sent && V.sent.id === id ? V.sent : null;
  if(s){ var w = s.back ? s.left : '';
    return '<div class="card new"><div class="h">' + ic('swap') + 'Who has it<span class="sp"></span><span class="mu">sent ' + NOW + '</span></div><div class="who"><span class="av">' + (s.who ? ini(s.who) : DBY[s.dept][2]) + '</span><div><b>' + esc(s.who ? s.who : 'Anyone in ' + DBY[s.dept][1]) + '</b><small>' + esc(DBY[s.dept][1]) + ' · ' + esc(s.why) + (s.note ? ' — “' + esc(s.note) + '”' : '') + '</small></div>' + (s.back ? '<span class="chip a">' + ic('clock') + 'back by ' + esc(s.backT) + '</span>' : '<span class="chip">not coming back</span>') + '</div>'
      + (s.back ? '<div class="bar"><i style="width:8%"></i></div><div class="goal">' + ic('clock') + esc(w) + ' — ' + (V.P.xLate === 'ping' ? 'past it, you and ' + (s.who ? s.who.split(' ')[0] : DBY[s.dept][1]) + ' get a ping and it goes red' : 'past it, it moves to Held too long and goes red') + '</div>' : '')
      + (V.P.xAccept === 'yes' ? '<div class="goal">' + ic('inbox') + 'In ' + esc(s.who ? s.who.split(' ')[0] + '’s' : DBY[s.dept][1] + '’s') + ' Inbox — theirs once they accept</div>' : '') + '<div class="pf"><button class="btn sm gh" data-x="undo">' + ic('undo') + 'Undo</button><span class="sp"></span><button class="btn sm" data-x="xopen">Transfer again</button></div></div>';
  }
  return '<div class="card"><div class="h">' + ic('swap') + 'Who has it</div><div class="who"><span class="av">' + ini(r.with[0]) + '</span><div><b>' + esc(r.with[0]) + '</b><small>' + esc(r.with[1]) + (r.with[2] ? ' · ' + esc(r.with[2]) : '') + '</small></div><span class="mu">' + esc(r.sub) + '</span></div></div>';
}
/* transfer: the four steps */
function deptList(){ var X = V.X;
  return '<div class="opts">' + DEPT.map(function(d){ var L = PPL[d[0]], fr = L.filter(function(p){ return p[1] === 'free'; }).length;
    return '<button class="o' + (X.dept === d[0] ? ' on' : '') + '" data-xd="' + d[0] + '"><span class="ab">' + d[2] + '</span><span><b>' + d[1] + '</b><small>' + d[3] + '</small></span><span class="r">' + (V.P.xShow === 'status' ? '<span class="dot dot-' + (fr ? 'g' : 'o') + '"></span>' + fr + ' free of ' + L.length : L.length + '') + '</span></button>'; }).join('') + '</div>'; }
function whoList(){ var X = V.X; if(!X.dept) return '<div class="mu">Pick the department first.</div>';
  var L = PPL[X.dept].slice().sort(function(a, b){ var o = { free: 0, job: 1, out: 2 }; return V.P.xShow === 'status' ? o[a[1]] - o[b[1]] : 0; });
  return '<div class="opts">' + (V.P.xQueue === 'yes' ? '<button class="o' + (X.who === '*' ? ' on' : '') + '" data-xw="*"><span class="ab">' + ic('users') + '</span><span><b>Anyone in ' + DBY[X.dept][1] + '</b><small>the first one free takes it</small></span><span class="r">queue</span></button>' : '')
    + L.map(function(p){ return '<button class="o' + (X.who === p[0] ? ' on' : '') + '" data-xw="' + esc(p[0]) + '"><span class="av">' + ini(p[0]) + '</span><span><b>' + esc(p[0]) + '</b>' + (V.P.xShow === 'status' ? '<small>' + esc(p[2]) + '</small>' : '') + '</span><span class="r">' + (V.P.xShow === 'status' ? '<span class="dot dot-' + (p[1] === 'free' ? 'g' : p[1] === 'job' ? 'w' : 'o') + '"></span>' + esc(p[3]) : '') + '</span></button>'; }).join('') + '</div>'; }
function whyList(){ var X = V.X; if(!X.dept) return '<div class="mu">Pick the department first.</div>';
  return '<div class="cs">' + DBY[X.dept][5].map(function(w){ return '<button class="c' + (X.why === w ? ' on' : '') + '" data-xy="' + esc(w) + '">' + esc(w) + '</button>'; }).join('') + '</div><input class="inp w" data-xn placeholder="A note for them (optional)" value="' + esc(X.note) + '">'; }
function backList(){ var X = V.X, g = X.dept ? DBY[X.dept][4] : 2, gk = g === 1 ? '1h' : g === 2 ? '2h' : g === 4 ? '4h' : 'eod';
  return '<div class="cs">' + BACK.map(function(b){ var on = X.back === b[0] || (X.back === 'goal' && b[0] === gk); return '<button class="c' + (on ? ' on' : '') + '" data-xb="' + b[0] + '">' + b[1] + (b[2] ? ' <small>' + b[2] + '</small>' : '') + (b[0] === gk ? ' <small>· goal</small>' : '') + '</button>'; }).join('') + '</div>'
    + (X.back === 'pick' ? '<input class="inp" type="time" data-xt value="' + esc(X.time || '15:30') + '" style="width:140px">' : '') + '<div class="goal">' + ic('clock') + (X.dept ? DBY[X.dept][1] + ': the goal is ' + (g === 8 ? '1 day' : g + ' h') + ' · held too long after twice that' : 'Each department has its own goal') + '</div>'; }
function xReady(){ var X = V.X; return X.dept && X.who && X.why && X.back; }
function xTo(){ var X = V.X; return !X.dept ? '' : X.who === '*' ? 'Anyone in ' + DBY[X.dept][1] : X.who ? X.who.split(' ')[0] : DBY[X.dept][1]; }
var STEP = [['Department', function(){ return V.X.dept ? DBY[V.X.dept][1] : ''; }, deptList], ['Employee', function(){ return V.X.who === '*' ? 'Anyone' : V.X.who ? V.X.who.split(' ')[0] : ''; }, whoList], ['Why', function(){ return V.X.why || ''; }, whyList], ['Back by', function(){ var b = BACK.filter(function(x){ return x[0] === V.X.back; })[0]; if(V.X.back === 'goal'){ var g = V.X.dept ? DBY[V.X.dept][4] : 2; return 'Goal · ' + (g === 8 ? '1 day' : g + ' h'); } return b ? b[1] : ''; }, backList]];
function xferHtml(){
  var X = V.X, P = V.P; if(V.flow !== 'xfer' || !X.open) return '';
  var go = '<button class="btn sm pri" data-x="xgo"' + (xReady() ? '' : ' disabled') + '>' + ic('swap') + 'Transfer' + (xTo() ? ' to ' + esc(xTo()) : '') + '</button>';
  if(P.xPres === 'steps'){
    var s = X.step, steps = STEP.map(function(st, i){ var v = st[1](), en = i === 0 || STEP[i - 1][1](); return (i ? '<i>›</i>' : '') + '<button class="' + (i === s ? 'on' : v ? 'dn' : '') + '" data-xs="' + i + '"' + (en ? '' : ' disabled') + '>' + (v && i !== s ? '<em>✓</em>' : (i + 1) + '') + ' ' + (v && i !== s ? esc(v) : st[0]) + '</button>'; }).join('');
    return '<div class="pop" style="top:206px;right:22px"><div class="ph"><b>Transfer</b><small>RO ' + RO[V.sel].no + ' · ' + esc(RO[V.sel].cust) + '</small><span class="sp" style="flex:1"></span><button class="x" data-x="xclose" aria-label="Close">' + ic('x', 15) + '</button></div><div class="steps">' + steps + '</div><div class="lbl">' + STEP[s][0].toUpperCase() + '</div>' + STEP[s][2]() + '<div class="pf">' + (s ? '<button class="btn sm gh" data-xs="' + (s - 1) + '">' + ic('chevL') + 'Back</button>' : '<span class="mu">With ' + esc(RO[V.sel].with[0]) + ' · ' + esc(RO[V.sel].with[2]) + '</span>') + '<span class="sp"></span>' + (s < 3 ? '<button class="btn sm" data-xs="' + (s + 1) + '"' + (STEP[s][1]() ? '' : ' disabled') + '>Next' + ic('chevR') + '</button>' : go) + '</div></div>';
  }
  if(P.xPres === 'sheet') return '<div class="sheet"><div class="sh"><b>Transfer</b><span class="mu">RO ' + RO[V.sel].no + '</span><span class="sp" style="flex:1"></span><button class="x" data-x="xclose" aria-label="Close">' + ic('x', 15) + '</button></div><div class="sb">' + STEP.map(function(st, i){ return '<div class="lg"><div class="lbl"><span class="n">' + (i + 1) + '</span>' + st[0].toUpperCase() + '</div>' + st[2]() + '</div>'; }).join('') + '</div><div class="sf"><button class="btn sm gh" data-x="xclose">Cancel</button><span class="sp" style="flex:1"></span>' + go + '</div></div>';
  /* the row of four */
  var m = X.menu, dd = function(i, lbl, val, body, dis){ return '<div class="dd"><span class="lbl">' + lbl + '</span><button class="' + (val ? '' : 'ph0') + '" data-xm="' + i + '"' + (dis ? ' disabled' : '') + '><span>' + esc(val || 'Pick…') + '</span>' + ic('chevD') + '</button>' + (m === i ? '<div class="menu">' + body() + '</div>' : '') + '</div>'; };
  return '<div class="drow">' + dd(0, 'DEPARTMENT', STEP[0][1](), deptList) + dd(1, 'EMPLOYEE', STEP[1][1](), whoList, !X.dept) + dd(2, 'WHY', STEP[2][1](), whyList, !X.dept) + dd(3, 'BACK BY', STEP[3][1](), backList, !X.dept) + go + '</div>';
}
/* the road test */
function roadCard(id){
  var r = RO[id], R = V.R, P = V.P; if(!(id === 'b' || id === 'g')) return '';
  var set = id === 'g' ? 'Mike Rodriguez drives at 2:30 pm' : R.done && R.done.m === 'send' ? R.done.who + ' drives ' + R.done.when : '';
  if(R.done && R.done.m === 'log' && id === 'b') return '<div class="card new"><div class="h">' + ic('road') + 'Road test<span class="sp"></span><span class="mu">logged ' + NOW + '</span></div>' + (R.done.res === 'Pass' ? '<div class="done-b">' + ic('check') + 'Passed · ' + esc(R.done.mi || '—') + ' mi · ' + esc(R.done.ck || 'no checks ticked') + '<button data-x="rundo">Undo</button></div><div class="goal">' + ic('check') + (P.qWhich === 'off' ? 'Ready to go — Release is on' : 'Next: the truck checks — it moved to Truck checks') + '</div>' : '<div class="done-b b">' + ic('flag') + 'Failed · ' + esc(R.done.fw || 'no reason') + '<button data-x="rundo">Undo</button></div><div class="goal">' + ic('swap') + (P.rFail === 'tech' ? 'Back to Mike — “' + esc(R.done.fw || 'Road test failed') + '” · back by 3:40 pm' : 'Sent to Frank to decide') + '</div>') + '</div>';
  var hd = '<div class="card new"><div class="h">' + ic('road') + 'Road test<span class="sp"></span><span class="mu">' + (set ? esc(set) : 'every operation done · nobody set yet') + '</span></div>';
  if(!R.open) return hd + '<div class="pf"><button class="btn sm" data-rm="send">Send someone</button><button class="btn sm pri" data-rm="log">Log the result</button></div></div>';
  var seg = '<div class="seg" role="group"><button data-rm="send" aria-pressed="' + (R.m === 'send') + '">Send someone</button><button data-rm="log" aria-pressed="' + (R.m === 'log') + '">Log the result</button></div>';
  if(R.m === 'send'){ var T = ['Mike Rodriguez', 'Dana Kowalski', 'Luis Martinez', 'Frank Delaney', 'Me (Jenna)'];
    return hd + seg + '<div class="lbl">WHO DRIVES</div><div class="cs">' + T.map(function(n){ return '<button class="c' + (R.who === n ? ' on' : '') + '" data-rw="' + esc(n) + '">' + esc(n.replace(/ \w+$/, function(x){ return n.indexOf('(') > -1 ? x : ' ' + x.trim()[0] + '.'; })) + (n === 'Mike Rodriguez' ? ' <small>did the work</small>' : '') + '</button>'; }).join('') + '</div><div class="lbl">WHEN</div><div class="cs">' + [['now', 'Now', '1:40 pm'], ['1h', 'In 1 hour', '2:40 pm'], ['eod', 'Before close', '4:30 pm']].map(function(w){ return '<button class="c' + (R.when === w[0] ? ' on' : '') + '" data-rt="' + w[0] + '">' + w[1] + ' <small>' + w[2] + '</small></button>'; }).join('') + '</div><div class="goal">' + ic('inbox') + 'It goes in ' + esc(R.who.split(' ')[0]) + '’s Inbox and on the Foreman floor · ' + (P.rLog === 'driver' ? 'only the driver logs the result' : P.rLog === 'desk' ? 'Triage or the foreman logs the result' : 'anyone can log the result') + '</div><div class="pf"><span class="sp"></span><button class="btn sm pri" data-x="rgo">' + ic('road') + 'Send ' + esc(R.who.split(' ')[0]) + '</button></div></div>';
  }
  var chk = P.rChecks === 'list' ? '<div class="lbl">WHAT WAS CHECKED</div><div class="cs">' + RTCHK.map(function(c){ return '<button class="c' + (R.ck[c] ? ' on' : '') + '" data-rc="' + esc(c) + '">' + (R.ck[c] ? ic('check', 12) : '') + esc(c) + '</button>'; }).join('') + '</div>' : '';
  return hd + seg + '<div class="grid2"><div class="lg"><span class="lbl">MILES</span><input class="inp" data-ri="mi" inputmode="numeric" placeholder="12" value="' + esc(R.mi) + '"></div><div class="lg"><span class="lbl">STARTED</span><input class="inp" data-ri="start" value="' + esc(R.start) + '"></div></div><div class="lbl">RESULT</div><div class="cs"><button class="c good' + (R.res === 'Pass' ? ' on' : '') + '" data-rr="Pass">' + ic('check', 12) + 'Pass</button><button class="c bad' + (R.res === 'Fail' ? ' on' : '') + '" data-rr="Fail">' + ic('flag', 12) + 'Fail</button></div>' + chk
    + (R.res === 'Fail' ? '<div class="lbl">WHY IT FAILED</div><div class="cs">' + FAILW.map(function(w){ return '<button class="c bad' + (R.fw === w ? ' on' : '') + '" data-rf="' + esc(w) + '">' + esc(w) + '</button>'; }).join('') + '</div>' : '')
    + '<input class="inp w" data-ri="note" placeholder="' + (R.res === 'Fail' ? 'What happened — it goes to ' + (P.rFail === 'tech' ? 'Mike' : 'Frank') : 'Anything to add — no leaks, no codes…') + '" value="' + esc(R.note) + '"><div class="goal">' + ic('user') + (P.rLog === 'driver' ? 'Logged by the driver — Mike' : P.rLog === 'desk' ? 'Logged by Triage or the foreman' : 'Logged by you — anyone can') + '</div><div class="pf"><span class="sp"></span><button class="btn sm pri" data-x="rlog"' + (R.res === 'Fail' && !R.fw ? ' disabled' : '') + '>' + (R.res === 'Pass' ? 'Log pass' : 'Log fail — back to ' + (P.rFail === 'tech' ? 'Mike' : 'Frank')) + '</button></div></div>';
}
function readyCard(id){ if(!V.P.rWhere.ready || !(id === 'b' || id === 'g')) return '';
  var L = [['All operations complete', 1, '1 of 1'], ['Parts installed', 1, 'all installed'], ['Notes written', 1, 'every punch has a note'], ['Road test done', !!(V.R.done && V.R.done.m === 'log' && V.R.done.res === 'Pass'), V.R.done && V.R.done.m === 'log' ? V.R.done.res.toLowerCase() : 'not logged yet']];
  return '<div class="card"><div class="h">' + ic('check') + 'Ready to close<span class="sp"></span><span class="mu">' + L.filter(function(x){ return x[1]; }).length + ' of 4</span></div>' + L.map(function(x){ return '<div class="ck ' + (x[1] ? 'ok' : 'no') + '">' + ic(x[1] ? 'check' : 'flag') + '<span>' + x[0] + '</span><small>' + x[2] + (!x[1] && x[0] === 'Road test done' ? ' · <a href="#" data-x="rfocus" style="color:var(--acctx)">Road test</a>' : '') + '</small></div>'; }).join('') + '</div>'; }
/* the truck checks */
function qcCard(id){
  var P = V.P, Q = V.Q; if(P.qWhich === 'off' || !(id === 'c' || id === 'e')) return '';
  if(id === 'e') return '<div class="card"><div class="h">' + ic('check') + 'Truck checks<span class="sp"></span><span class="mu">done 12:50 · Jenna</span></div><div class="done-b">' + ic('check') + 'All 10 checks done — ready to release</div></div>';
  var auto = [['All operations closed', 1, '1 of 1'], ['Story on every operation', 1, 'complaint, cause, correction'], ['Parts installed', 1, '2 of 2 · nothing to return'], ['Road test passed', 1, '11 mi · 12:17'], ['Hours', 1, '1.4 of 1.5 quoted']];
  var n = Q.walk.filter(function(w){ return Q.ticks[w]; }).length, all = n === Q.walk.length;
  if(Q.released) return '<div class="card new"><div class="h">' + ic('check') + 'Truck checks</div><div class="done-b' + (all ? '' : ' w') + '">' + ic('keyTag') + 'Released ' + NOW + (all ? ' — every check done' : ' with ' + (Q.walk.length - n) + ' not ticked · “' + esc(Q.why || 'no reason') + '” on the RO') + '<button data-x="qundo">Undo</button></div></div>';
  var who = P.qWho === 'foreman' ? 'The foreman ticks these — you see where they stand' : P.qWho === 'either' ? 'You or the foreman' : 'You tick these';
  var walk = Q.walk.map(function(w, i){ var on = !!Q.ticks[w]; return '<button class="tick' + (on ? ' on' : '') + '" data-qt="' + esc(w) + '"' + (P.qWho === 'foreman' ? ' disabled' : '') + '><i>' + (on ? ic('check') : '') + '</i><span>' + esc(w) + '</span>' + (Q.edit ? '<span class="x" data-qx="' + i + '" title="Take it off the list">' + ic('x', 12) + '</span>' : '') + '</button>'; }).join('');
  var rel = P.qBlock === 'block' ? '<button class="btn sm pri" data-x="qrel"' + (all ? '' : ' disabled') + '>' + ic('keyTag') + (all ? 'Release' : (Q.walk.length - n) + ' to tick before Release') + '</button>'
    : '<input class="inp" data-qw placeholder="Reason, if not every check is ticked" value="' + esc(Q.why) + '" style="flex:1"><button class="btn sm pri" data-x="qrel"' + (all || Q.why.trim() ? '' : ' disabled') + '>' + ic('keyTag') + 'Release</button>';
  return '<div class="card new"><div class="h">' + ic('check') + 'Truck checks — before release<span class="sp"></span><span class="mu">' + (5 + n) + ' of ' + (5 + Q.walk.length) + '</span></div><div class="sec-l">PARSEC CHECKED</div>' + auto.map(function(x){ return '<div class="ck ok">' + ic('check') + '<span>' + x[0] + '</span><small>' + x[2] + '</small></div>'; }).join('')
    + '<div class="sec-l" style="display:flex;align-items:center">WALK-AROUND · ' + esc(who.toUpperCase()) + '<span style="flex:1"></span><button class="btn sm gh" data-x="qedit" style="height:24px">' + ic('pencil') + (Q.edit ? 'Done' : 'Edit the list') + '</button></div>' + walk
    + (Q.edit ? '<div class="addl"><input data-qa placeholder="Add a check — e.g. Mud flaps on" value="' + esc(Q.add) + '"><button class="btn sm" data-x="qadd">' + ic('plus') + 'Add</button></div><div class="goal">' + ic('info') + 'The list is the shop’s — every RO gets it</div>' : '')
    + '<div class="pf">' + rel + '</div></div>';
}
function bodyHtml(id){
  var r = RO[id], h = '';
  h += whoCard(id);
  if(V.flow === 'road' || id === 'b' || id === 'g'){ h += roadCard(id); h += readyCard(id); }
  h += qcCard(id);
  h += '<div class="card"><div class="h">' + ic('ros') + 'On the RO</div><div class="ck ok">' + ic('check') + '<span>' + esc(r.cmp) + '</span><small>' + (r.rt || id === 'b' || id === 'g' ? 'complete' : 'approved') + '</small></div></div>';
  return '<div class="pb">' + h + '</div>';
}
function paneHtml(){ var id = V.sel; return '<section class="pn">' + headHtml(id) + (V.flow === 'xfer' ? xferHtml() : '') + bodyHtml(id) + '</section>'; }
function frameHtml(){
  return '<div class="tf"><div class="th"><h1>Triage</h1><span class="fx"><b>24</b> on the yard <i>·</i> <b>1</b> awaiting approval <i>·</i> <b>' + (V.P.rWhere.grp ? 2 : 0) + '</b> road tests <i>·</i> <b>1</b> ready to release</span><span class="tabs"><span class="on">' + ic('inbox') + 'Inbox</span><span>' + ic('grid') + 'Desk</span><span>' + ic('pin') + 'Yard</span></span><button class="btn sm gh" aria-label="Search">' + ic('search') + '</button><button class="btn sm pri">' + ic('plus') + 'New RO</button></div><div class="tb">' + listHtml() + paneHtml() + '</div></div>';
}
/* ---------- the choices ---------- */
function chsHtml(){
  return '<div class="chs">' + CH.map(function(c){ var k = c[1], multi = c[5];
    return (c[0] ? '<div class="ch" style="padding:0;background:none;box-shadow:none"><div class="hd">' + c[0] + '</div></div>' : '') + '<div class="ch"><b>' + c[2] + '</b>' + (c[3] ? '<small>' + c[3] + '</small>' : '') + '<div class="fl">' + c[4].map(function(o){ var on = multi ? !!V.P[k][o[0]] : V.P[k] === o[0]; return '<button class="opt' + (multi ? ' sq' : '') + '" data-ch="' + k + '" data-v="' + o[0] + '" aria-pressed="' + on + '"><i></i><span><b>' + o[1] + (o[3] ? '<em>SUGGESTED</em>' : '') + '</b>' + (o[2] || '') + '</span></button>'; }).join('') + '</div></div>'; }).join('') + '</div>';
}
function draw(){
  var y = window.scrollY, cy = $('.chs') ? $('.chs').scrollTop : 0;
  $('#pg').innerHTML = '<div class="wrap"><div class="two">' + frameHtml() + chsHtml() + '</div></div>';
  window.scrollTo(0, y); if($('.chs')) $('.chs').scrollTop = cy; sync();
}
function sync(){
  D.querySelectorAll('[data-flow]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-flow') === V.flow)); });
  D.querySelectorAll('button[data-th]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-th') === V.th)); });
  D.documentElement.setAttribute('data-th', V.th);
}
function setFlow(f){ V.flow = f; V.sel = f === 'xfer' ? 'a' : f === 'road' ? 'b' : 'c'; if(f === 'xfer' && !V.sent){ xNew(); } if(f === 'road') V.R.open = true; draw(); chsTo(f); }
function chsTo(f){ var c = $('.chs'), L = c ? c.querySelectorAll('.hd') : [], i = f === 'xfer' ? 0 : f === 'road' ? 1 : 2; if(!c || !L[i]) return; if(getComputedStyle(c).overflowY === 'auto') c.scrollTo({ top: L[i].parentNode.offsetTop - c.offsetTop - 2, behavior: 'smooth' }); }
/* ---------- your picks ---------- */
function lbl(k){ var c = CH.filter(function(x){ return x[1] === k; })[0], v = V.P[k];
  if(c[5]) return c[4].filter(function(o){ return v[o[0]]; }).map(function(o){ return o[1]; }).join(', ') || 'none';
  return (c[4].filter(function(o){ return o[0] === v; })[0] || [0, '—'])[1]; }
function pkText(){
  var L = ['Parsec · Triage transfer, road test and truck checks — my picks'];
  CH.forEach(function(c){ L.push('· ' + (c[0] ? c[0].charAt(0) + c[0].slice(1).toLowerCase() + ' — ' : '') + c[2] + ': ' + lbl(c[1])); });
  if(V.Q.walk.join('|') !== WALK0.join('|')) L.push('· Walk-around list: ' + V.Q.walk.join(', '));
  if(V.note.trim()) L.push('· Notes: ' + V.note.trim());
  return L.join('\n');
}
function pkDraw(){ var w = $('#picks'); w.hidden = !V.picks; if(!V.picks) return;
  w.innerHTML = '<div class="pk-h"><b>Your picks</b><button class="x" data-pk="x" aria-label="Close">' + ic('x', 15) + '</button></div><pre>' + esc(pkText()) + '</pre><div class="pk-r"><span>Anything else</span><textarea id="pk-note" placeholder="e.g. another department, a reason, a check">' + esc(V.note) + '</textarea></div><button class="btn pri" data-pk="copy">' + ic('copy') + 'Copy for the chat</button>'; }
function toast(m){ var t = D.createElement('div'); t.className = 'toast'; t.textContent = m; D.body.appendChild(t); setTimeout(function(){ t.remove(); }, 2600); }
/* ---------- clicks ---------- */
D.addEventListener('click', function(e){
  var t = e.target, b, X = V.X, R = V.R, Q = V.Q;
  if(t.closest('a[data-x]')) e.preventDefault();
  if((b = t.closest('[data-flow]'))){ setFlow(b.getAttribute('data-flow')); return; }
  if((b = t.closest('button[data-th]'))){ V.th = b.getAttribute('data-th'); sync(); return; }
  if((b = t.closest('#pk-open'))){ V.picks = !V.picks; pkDraw(); return; }
  if((b = t.closest('[data-pk]'))){ var k2 = b.getAttribute('data-pk'); if(k2 === 'x'){ V.picks = false; pkDraw(); return; } var tx = pkText(); try{ navigator.clipboard.writeText(tx).then(function(){ toast('Copied — paste it in the chat.'); }, function(){ toast('Select the text and copy it.'); }); }catch(er){ toast('Select the text and copy it.'); } return; }
  if((b = t.closest('[data-ch]'))){ var k = b.getAttribute('data-ch'), v = b.getAttribute('data-v'), c = CH.filter(function(x){ return x[1] === k; })[0];
    if(c[5]){ V.P[k][v] = V.P[k][v] ? 0 : 1; } else V.P[k] = v;
    if(k === 'xPres' || k === 'xBack'){ if(!V.sent){ var keep = V.X; xNew(); if(k === 'xPres'){ V.X.dept = keep.dept; V.X.who = keep.who; V.X.why = keep.why; V.X.back = keep.back; V.X.note = keep.note; V.X.step = keep.step; } } V.flow = 'xfer'; V.sel = V.sent ? V.sel : 'a'; }
    if(/^r/.test(k)){ V.flow = 'road'; V.sel = 'b'; } if(/^q/.test(k) && V.P.qWhich !== 'off'){ V.flow = 'qc'; V.sel = 'c'; }
    draw(); if(V.picks) pkDraw(); return; }
  if((b = t.closest('[data-sel]'))){ V.sel = b.getAttribute('data-sel'); V.flow = V.sel === 'b' || V.sel === 'g' ? 'road' : V.sel === 'c' ? 'qc' : 'xfer'; if(V.flow === 'xfer' && !(V.sent && V.sent.id === V.sel)) xNew(); else if(V.flow === 'xfer') V.X.open = false; draw(); return; }
  /* transfer */
  if((b = t.closest('[data-xd]'))){ X.dept = b.getAttribute('data-xd'); X.who = null; X.why = null; if(V.P.xBack === 'goal') X.back = 'goal'; X.menu = null; if(V.P.xPres === 'steps') X.step = 1; draw(); return; }
  if((b = t.closest('[data-xw]'))){ X.who = b.getAttribute('data-xw'); X.menu = null; if(V.P.xPres === 'steps') X.step = 2; draw(); return; }
  if((b = t.closest('[data-xy]'))){ X.why = b.getAttribute('data-xy'); X.menu = null; if(V.P.xPres === 'steps') X.step = 3; draw(); return; }
  if((b = t.closest('[data-xb]'))){ X.back = b.getAttribute('data-xb'); if(X.back !== 'pick') X.menu = null; draw(); return; }
  if((b = t.closest('[data-xs]'))){ X.step = +b.getAttribute('data-xs'); draw(); return; }
  if((b = t.closest('[data-xm]'))){ var mi = +b.getAttribute('data-xm'); X.menu = X.menu === mi ? null : mi; draw(); return; }
  if((b = t.closest('[data-x]'))){ var x = b.getAttribute('data-x');
    if(x === 'xopen'){ V.flow = 'xfer'; if(!X.open || V.sent){ var s0 = V.sent; xNew(); if(s0 && s0.id === V.sel) V.sent = null; } X = V.X; X.open = true; draw(); return; }
    if(x === 'xclose'){ X.open = false; draw(); return; }
    if(x === 'xgo'){ if(!xReady()) return; var bk = BACK.filter(function(z){ return z[0] === X.back; })[0], g = DBY[X.dept][4], gk = g === 1 ? '1h' : g === 2 ? '2h' : g === 4 ? '4h' : 'eod', bb = X.back === 'goal' ? BACK.filter(function(z){ return z[0] === gk; })[0] : bk;
      var backT = X.back === 'none' ? '' : X.back === 'pick' ? (X.time || '15:30') : bb[1] + ' · ' + bb[2], left = X.back === 'none' ? '' : (X.back === '1h' || gk === '1h' && X.back === 'goal') ? '1:00 left' : X.back === 'eod' ? '3:20 left' : X.back === 'tom' ? 'tomorrow 8:00' : X.back === 'pick' ? '1:50 left' : X.back === '4h' || (X.back === 'goal' && gk === '4h') ? '4:00 left' : '2:00 left';
      V.sent = { id: V.sel, dept: X.dept, who: X.who === '*' ? '' : X.who, whoF: X.who === '*' ? 'anyone in ' + DBY[X.dept][1] : X.who.split(' ')[0], why: X.why, note: X.note, back: X.back !== 'none', backT: backT.replace(/^In \d hours? · |^In 1 hour · /, ''), left: left, st: 'With ' + (X.who === '*' ? DBY[X.dept][1] : X.who.split(' ')[0]) };
      X.open = false; draw(); toast('RO ' + RO[V.sel].no + ' sent to ' + V.sent.whoF + (V.sent.back ? ' — back by ' + V.sent.backT : '') + '.'); return; }
    if(x === 'undo'){ V.sent = null; xNew(); draw(); toast('Transfer undone — it’s back with you.'); return; }
    /* road test */
    if(x === 'ropen' || x === 'rfocus'){ V.flow = 'road'; if(V.sel !== 'b' && V.sel !== 'g') V.sel = 'b'; R.open = true; draw(); return; }
    if(x === 'rgo'){ R.done = { m: 'send', who: R.who.split(' ')[0], when: R.when === 'now' ? 'now' : R.when === '1h' ? 'at 2:40 pm' : 'before 4:30 pm' }; R.open = false; draw(); toast(R.who.split(' ')[0] + ' is set to drive ' + R.done.when + ' — it’s in their Inbox.'); return; }
    if(x === 'rlog'){ R.done = { m: 'log', res: R.res, mi: R.mi, ck: Object.keys(R.ck).filter(function(k3){ return R.ck[k3]; }).join(', '), fw: R.fw }; draw(); toast(R.res === 'Pass' ? 'Road test logged — passed.' : 'Road test failed — back to ' + (V.P.rFail === 'tech' ? 'Mike' : 'Frank') + '.'); return; }
    if(x === 'rundo'){ R.done = null; R.open = true; draw(); return; }
    /* truck checks */
    if(x === 'qopen'){ V.flow = 'qc'; V.sel = V.sel === 'e' ? 'e' : 'c'; draw(); return; }
    if(x === 'qedit'){ Q.edit = !Q.edit; draw(); return; }
    if(x === 'qadd'){ var nv = Q.add.trim(); if(nv){ Q.walk.push(nv); Q.add = ''; } draw(); if(V.picks) pkDraw(); return; }
    if(x === 'qrel'){ Q.released = true; draw(); toast('RO ' + RO[V.sel].no + ' released.'); return; }
    if(x === 'qundo'){ Q.released = false; draw(); return; }
    return; }
  if((b = t.closest('[data-rm]'))){ R.m = b.getAttribute('data-rm'); R.open = true; draw(); return; }
  if((b = t.closest('[data-rw]'))){ R.who = b.getAttribute('data-rw'); draw(); return; }
  if((b = t.closest('[data-rt]'))){ R.when = b.getAttribute('data-rt'); draw(); return; }
  if((b = t.closest('[data-rr]'))){ R.res = b.getAttribute('data-rr'); draw(); return; }
  if((b = t.closest('[data-rc]'))){ var cc = b.getAttribute('data-rc'); R.ck[cc] = !R.ck[cc]; draw(); return; }
  if((b = t.closest('[data-rf]'))){ R.fw = b.getAttribute('data-rf'); draw(); return; }
  if((b = t.closest('[data-qx]'))){ e.stopPropagation(); var qi = +b.getAttribute('data-qx'), gone = Q.walk.splice(qi, 1)[0]; delete Q.ticks[gone]; draw(); if(V.picks) pkDraw(); return; }
  if((b = t.closest('[data-qt]'))){ if(Q.edit) return; var w = b.getAttribute('data-qt'); Q.ticks[w] = !Q.ticks[w]; draw(); return; }
});
D.addEventListener('input', function(e){ var t = e.target;
  if(t.id === 'pk-note'){ V.note = t.value; var p = $('#picks pre'); if(p) p.textContent = pkText(); return; }
  if(t.hasAttribute('data-xn')) V.X.note = t.value;
  if(t.hasAttribute('data-xt')) V.X.time = t.value;
  if(t.hasAttribute('data-ri')) V.R[t.getAttribute('data-ri')] = t.value;
  if(t.hasAttribute('data-qa')) V.Q.add = t.value;
  if(t.hasAttribute('data-qw')){ V.Q.why = t.value; var rb = D.querySelector('[data-x="qrel"]'); if(rb) rb.disabled = !t.value.trim() && V.Q.walk.some(function(x){ return !V.Q.ticks[x]; }); }
});
D.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ if(V.picks){ V.picks = false; pkDraw(); } else if(V.X.menu != null){ V.X.menu = null; draw(); } else if(V.X.open && V.flow === 'xfer'){ V.X.open = false; draw(); } }
  if(e.key === 'Enter' && e.target.hasAttribute && e.target.hasAttribute('data-qa')){ e.preventDefault(); var nv = V.Q.add.trim(); if(nv){ V.Q.walk.push(nv); V.Q.add = ''; draw(); var i = D.querySelector('[data-qa]'); if(i) i.focus(); } } });
draw();
