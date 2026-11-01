/* Parsec · RO page — the Time tab in colors with edits in place, icons for the word links, the operation header, each tab's actions,
   the theme switch above you, and sample trucks with year, make, model, configuration and size */
var D = document, $ = function(s){ return D.querySelector(s); };
function ic(k, s){ return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"' + (s ? ' style="width:' + s + 'px;height:' + s + 'px"' : '') + '>' + (IC[k] || '') + '</svg>'; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
/* ---------- the reasons and their colors ---------- */
var RC = { 'Diagnosing': 'diag', 'Repairing': 'rep', 'Inspecting': 'insp', 'Inspecting – DOT': 'insp', 'Testing': 'test', 'Switched job': 'switch', 'End of day': 'eod', 'Lunch': 'lunch',
  'Waiting – Parts': 'wparts', 'Waiting – Approval': 'wappr', 'Waiting – Tech Support': 'wtech', 'Waiting – Foreman': 'wfm', 'Complete': 'done' };
var RC3 = { diag: 'rep', rep: 'rep', insp: 'rep', test: 'rep', switch: 'switch', eod: 'switch', lunch: 'switch', wparts: 'wparts', wappr: 'wparts', wtech: 'wparts', wfm: 'wparts', done: 'done' };
var SR = ['Diagnosing', 'Repairing', 'Inspecting', 'Inspecting – DOT', 'Testing'];
var ER = ['Switched job', 'Lunch', 'End of day', 'Waiting – Parts', 'Waiting – Approval', 'Waiting – Tech Support', 'Waiting – Foreman', 'Complete'];
function rc(r){ var k = RC[r] || 'switch'; if(V.P.tPal === 'three') k = RC3[k] || k; return 'var(--r-' + k + ')'; }
/* ---------- job types and statuses ---------- */
var JT = [['OP', 'REPAIR', 'op'], ['DIAG', 'DIAG', 'diag'], ['PM', 'PM', 'pm'], ['WARR', 'WARR', 'warr'], ['COMEBACK', 'COMEBACK', 'cb'], ['SUBLET', 'SUBLET', 'sub'], ['RECALL', 'RECALL', 'rec']];
var ST = [['Hold Tech', 'var(--ink3)', 0], ['Working', 'var(--good)', 1], ['Waiting – Parts', 'var(--r-wparts)', 0], ['Waiting – Approval', 'var(--r-wappr)', 0], ['Waiting – Tech Support', 'var(--r-wtech)', 0], ['Waiting – Foreman', 'var(--r-wfm)', 0], ['Complete', 'var(--r-done)', 1]];
/* ---------- the choices ---------- */
var CH = [
  ['TIME TAB', 'tCol', 'The colors follow', '', [['split', 'Line and start dot: why it started · stop dot: why it stopped', '', 1], ['start', 'All of it: why it started', ''], ['stop', 'All of it: why it stopped', '']]],
  ['', 'tPal', 'Colors', '', [['same', 'One color per reason, everywhere', 'the Time Log, the reason chips and the day bar use the same', 1], ['three', 'Just three', 'working green · waiting amber · done']]],
  ['', 'tBar', 'Day bar', 'The separate Time punches section goes', [['yes', 'A slim day bar at the top, in the same colors', '', 1], ['no', 'No day bar', '']]],
  ['', 'tLeg', 'Legend', '', [['no', 'No legend — each line says its reason', '', 1], ['yes', 'A small legend above the punches', '']]],
  ['', 'tEd', 'Editing, inside the Time tab', '', [['click', 'Click a time or a reason to change it — no edit mode', 'try it on the punches', 1], ['pen', 'A pencil on each punch opens it', ''], ['mode', 'An edit icon opens every punch at once', '']]],
  ['', 'tDel', 'Deleting a punch', '', [['undo', 'Trash on hover — gone at once, Undo in the toast', '', 1], ['ask', 'Trash asks first', '']]],
  ['', 'tAdd', 'Adding a time entry', 'pick any', [['between', 'A + between punches', 'it opens right where it goes', 1], ['head', 'An icon in the tab header', '', 1]], 1],
  ['ICONS', 'iSty', 'The word links become', '', [['tip', 'Icons — the name shows when you point at it', '', 1], ['word', 'An icon and a short word', ''], ['wide', 'Icons; the words come back on a wide screen', 'make the window wider to see it']]],
  ['', 'iWhat', 'Which ones', '', [['links', 'The word links', 'Add operation, Add part, From inventory…, Extract from a quote…, Add time entry, Edit, + code', 1], ['all', 'The links and the outlined buttons too', 'Transfer, Road test, Truck checks']]],
  ['', 'iKeep', 'Keep their words', '', [['main', 'Start / Stop and Save', 'the buttons you press all day', 1], ['none', 'Nothing — icons everywhere', '']]],
  ['OPERATION HEADER', 'oCode', 'Fault codes', 'The complaint line and + code leave the body', [['menu', 'Add a code goes in ⋯ · the codes show as chips in the header', '', 1], ['block', 'Only in the Fault codes block', '']]],
  ['', 'oJt', 'Job type', 'a dropdown, like part status', [['color', 'Each type its own color', '', 1], ['plain', 'One plain chip', '']]],
  ['TAB ACTIONS', 'aFiles', 'The Files tab gets', 'Each tab’s actions sit at the right of the tabs, only while that tab is open · pick any', [['up', 'Upload', '', 1], ['cam', 'Take a photo', '', 1], ['paste', 'Paste a screenshot', 'Ctrl V on the RO', 1]], 1],
  ['THEME', 'thI', 'The theme mini icons', 'above you, in one inset strip', [['sw', 'Color swatches', '', 1], ['icon', 'Sun and moon icons', '']]],
  ['', 'thSz', 'In the same strip', '', [['no', 'Theme only', '', 1], ['yes', 'Text size too — Normal, Large, Shop floor', 'a second row']]],
  ['', 'thMini', 'When the sidebar is folded', 'fold it with the sidebar icon', [['cycle', 'One swatch — click cycles the themes', '', 1], ['stack', 'The four stack up', '']]],
  ['EVERY RO PAGE', 'ePg', 'Make the same changes on', 'pick any', [['ro', 'The RO page (from the RO list)', '', 1], ['tech', 'The Technician page’s RO', 'it shares the same pieces', 1]], 1],
  ['SAMPLE TRUCKS', 'sFrom', 'Generated from', '', [['cat', 'The truck catalog', 'year, model, size and picture always match', 1], ['rnd', 'Any mix', 'some years and models never existed together']]],
  ['', 'sCfg', 'Configuration', '', [['ax', 'Axles and cab — 6x4 · High-roof sleeper', '', 1], ['cab', 'Cab only — High-roof sleeper', '']]],
  ['', 'sSize', 'Size', 'pick any', [['sl', 'Sleeper length — 70-inch', 'day cabs say Day cab', 1], ['wb', 'Wheelbase — 228 in', ''], ['gv', 'GVWR — 52,000 lb', '']], 1],
  ['', 'sMore', 'Also generate', 'pick any', [['eng', 'Engine and horsepower', '', 1], ['tr', 'Transmission', ''], ['pt', 'Paint color', '']], 1],
  ['', 'sShow', 'Where they show', '', [['both', 'The truck line under the name, and Vehicle', '', 1], ['veh', 'Vehicle only', '']]]
];
var V = { view: 'ro', th: 'ivory', tab: 'time', picks: false, note: '', mini: false, sz: 'normal', menu: null, editT: null, editP: null, allEdit: false, askDel: null, noteP: null, undo: null,
  P: { tCol: 'split', tPal: 'same', tBar: 'yes', tLeg: 'no', tEd: 'click', tDel: 'undo', tAdd: { between: 1, head: 1 }, iSty: 'tip', iWhat: 'links', iKeep: 'main', oCode: 'menu', oJt: 'color',
    aFiles: { up: 1, cam: 1, paste: 1 }, thI: 'sw', thSz: 'no', thMini: 'cycle', ePg: { ro: 1, tech: 1 }, sFrom: 'cat', sCfg: 'ax', sSize: { sl: 1 }, sMore: { eng: 1 }, sShow: 'both' },
  open: { o1: true, o2: false }, jt: { o1: 'OP', o2: 'DIAG' }, st: { o1: 'Hold Tech', o2: 'Waiting – Parts' } };
var T = [
  { id: 'p1', d: 'Tue, Oct 6', s: '10:13', e: '11:49', sr: 'Diagnosing', er: 'Switched job', who: 'Mike', notes: [['10:13 am', 'Clutch slips under load, no free play left.']] },
  { id: 'p2', d: 'Tue, Oct 6', s: '12:05', e: '13:41', sr: 'Repairing', er: 'Switched job', who: 'Mike', notes: [['12:05 pm', 'Pulled the transmission, clutch disc worn to the rivets.']] },
  { id: 'n1', d: 'Sat, Oct 17', off: 1, t: '7:39 pm', k: 'Cause', x: 'Clutch slips under load, no free play left.' },
  { id: 'p3', d: 'Sun, Oct 18', s: '18:44', e: '21:48', sr: 'Repairing', er: 'End of day', who: 'Mike', notes: [] },
  { id: 'p4', d: 'Mon, Oct 19', s: '07:05', e: '08:20', sr: 'Repairing', er: 'Waiting – Parts', who: 'Mike', notes: [['7:52 am', 'Release bearing isn’t in the kit — asked Parts.']] }
];
var SEQ = 10;
/* ---------- time helpers ---------- */
function mins(t){ var m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : 0; }
function hm(t){ var m = mins(t), h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'pm' : 'am', h12 = h % 12 || 12; return h12 + ':' + String(mm).padStart(2, '0') + ' ' + ap; }
function dur(p){ var d = mins(p.e) - mins(p.s); if(d < 0) d += 1440; return Math.floor(d / 60) + ':' + String(d % 60).padStart(2, '0'); }
function durM(p){ var d = mins(p.e) - mins(p.s); return d < 0 ? d + 1440 : d; }
/* ---------- an icon button that follows the icon picks ---------- */
function ib(icn, label, attrs, cls, fixed){   /* fixed: an icon already (the top bar, ⋯) — it stays an icon */
  var s = V.P.iSty, w = !fixed && (s === 'word' || (s === 'wide' && window.innerWidth >= 1680));
  if(cls && /\bol\b/.test(cls) && !w) cls += ' sq';
  return '<button class="ib' + (cls ? ' ' + cls : '') + '" ' + (attrs || '') + (w ? '' : ' data-tip="' + esc(label) + '"') + ' aria-label="' + esc(label) + '">' + ic(icn) + (w ? '<span>' + esc(label.replace(/…$/, '')) + '</span>' : '') + '</button>';
}
function obtn(icn, label, attrs, pri){   /* an outlined button: a word button, or an icon when the links and buttons both go */
  if(V.P.iWhat === 'all' && !pri) return ib(icn, label, attrs, 'ol');
  return '<button class="btn sm' + (pri ? ' pri' : '') + '" ' + (attrs || '') + '>' + ic(icn) + label + '</button>';
}
/* ---------- the sidebar ---------- */
var NAV = [['career', 'Career'], ['timelog', 'Time Log'], ['ros', 'RO List', '21'], ['user', 'Technician'], ['triage', 'Triage', '1'], ['foreman', 'Foreman', '1'], ['parts', 'Parts'], ['warranty', 'Warranty', '44'], ['manager', 'Manager'], ['fixes', 'Fixes']];
var THM = [['ivory', 'Ivory', 'iv', 'sun'], ['graphite', 'Graphite', 'gr', 'moon'], ['white', 'White', 'wh', 'sunO'], ['black', 'Near black', 'bk', 'moonF']];
function thBtn(t){ var on = V.th === t[0], icn = V.P.thI === 'sw' ? '<span class="sw ' + t[2] + '"></span>' : ic(t[3]);
  return '<button data-thm="' + t[0] + '" aria-pressed="' + on + '" title="' + t[1] + '" aria-label="' + t[1] + ' theme">' + icn + '</button>'; }
function sideHtml(){
  if(V.mini){
    var cur = THM.filter(function(t){ return t[0] === V.th; })[0];
    var th = V.P.thMini === 'cycle' ? '<div class="thm col"><button data-thm="cycle" aria-pressed="true" title="' + cur[1] + ' — click for the next">' + (V.P.thI === 'sw' ? '<span class="sw ' + cur[2] + '"></span>' : ic(cur[3])) + '</button></div>' : '<div class="thm col">' + THM.map(thBtn).join('') + '</div>';
    return '<nav class="sb mini" aria-label="Pages"><div class="rl-b" style="padding:4px 6px 12px">' + LOGO + '</div><button class="ib" data-x="mini" data-tip="Open the sidebar">' + ic('sidebar') + '</button>' + NAV.map(function(n){ return '<div class="ri' + (n[0] === 'ros' ? ' on' : '') + '" title="' + n[1] + '" style="justify-content:center;padding:0">' + ic(n[0]) + '</div>'; }).join('') + '<div class="grow"></div>' + th + '<div class="me" style="justify-content:center;padding:6px 0"><span class="av">A</span></div></nav>';
  }
  return '<nav class="sb" aria-label="Pages"><div class="rl-b">' + LOGO + 'Parsec<span class="sp"></span><button class="ib" data-x="mini" data-tip="Fold the sidebar">' + ic('sidebar') + '</button></div>'
    + '<div class="ri">' + ic('search') + 'Search<em>Ctrl K</em></div><div class="clk"><i></i><div><b>On the clock · 0:55</b><small>RO 1236 · Op 1 · 0:47</small></div></div>'
    + NAV.map(function(n){ return '<div class="ri' + (n[0] === 'ros' ? ' on' : '') + '">' + ic(n[0]) + n[1] + (n[2] ? '<em>' + n[2] + '</em>' : '') + '</div>'; }).join('')
    + '<div class="grow"></div><div class="thm" role="group" aria-label="Theme">' + THM.map(thBtn).join('') + '</div>'
    + (V.P.thSz === 'yes' ? '<div class="thm size" role="group" aria-label="Text size">' + [['normal', 'Aa', 'Normal'], ['large', 'Aa+', 'Large'], ['floor', 'Floor', 'Shop floor']].map(function(z){ return '<button data-sz="' + z[0] + '" aria-pressed="' + (V.sz === z[0]) + '" title="' + z[2] + '">' + z[1] + '</button>'; }).join('') + '</div>' : '')
    + '<div class="me"><span class="av">A</span><div><b>Admin</b><small>Every page</small></div></div></nav>';
}
/* ---------- the operation header ---------- */
function jtOf(o){ return JT.filter(function(j){ return j[0] === V.jt[o]; })[0]; }
function stOf(o){ return ST.filter(function(s){ return s[0] === V.st[o]; })[0]; }
function opHead(o, no, title, hrs, pct, tav, codes){
  var j = jtOf(o), s = stOf(o), m = V.menu, plain = V.P.oJt === 'plain';
  var jtB = '<span class="dd"><button class="jt' + (plain ? ' neu' : '') + '" data-x="m" data-m="jt:' + o + '" style="--jc:var(--j-' + j[2] + ')" title="Job type — click to change"><i></i>' + j[1] + ic('chevD') + '</button>'
    + (m === 'jt:' + o ? '<div class="menu l"><div class="mh">Job type</div>' + JT.map(function(x){ return '<button data-jt="' + o + ':' + x[0] + '" aria-pressed="' + (x[0] === V.jt[o]) + '"><i style="background:' + (plain ? 'var(--ink3)' : 'var(--j-' + x[2] + ')') + '"></i>' + x[1] + '</button>'; }).join('') + '</div>' : '') + '</span>';
  var stB = '<span class="dd"><button class="stp" data-x="m" data-m="st:' + o + '" style="--sc:' + s[1] + '"><i class="' + (s[2] ? 'f' : '') + '"></i>' + s[0] + ic('chevD') + '</button>'
    + (m === 'st:' + o ? '<div class="menu"><div class="mh">Operation status</div>' + ST.map(function(x){ return '<button data-st="' + o + ':' + x[0] + '" aria-pressed="' + (x[0] === V.st[o]) + '"><i style="' + (x[2] ? 'background:' + x[1] : 'box-shadow:inset 0 0 0 1.6px ' + x[1]) + '"></i>' + x[0] + '</button>'; }).join('') + '</div>' : '') + '</span>';
  var mn = '<span class="dd">' + ib('more', 'More', 'data-x="m" data-m="op:' + o + '"', '', 1) + (m === 'op:' + o ? '<div class="menu">' + (V.P.oCode === 'menu' ? '<button data-x="toast" data-t="Add a fault code — the box opens under the header">' + ic('plus') + 'Add a fault code</button>' : '') + '<button data-x="toast" data-t="Move to another RO">' + ic('swap') + 'Move to another RO</button><button data-x="toast" data-t="Print job jacket">' + ic('print') + 'Print job jacket</button><button data-x="toast" data-t="Copied the story">' + ic('copy') + 'Copy the story</button><div class="sep"></div><button class="dng" data-x="toast" data-t="Delete operation — asks first">' + ic('trash') + 'Delete operation</button></div>' : '') + '</span>';
  var cd = V.P.oCode === 'menu' && codes ? codes.map(function(c){ return '<span class="code" title="Fault code">' + c + '</span>'; }).join('') : '';
  return '<div class="oh" data-x="tog" data-o="' + o + '"><span class="cb"></span><span class="sd' + (/^Waiting/.test(V.st[o]) ? ' w' : V.st[o] === 'Complete' ? ' g' : '') + '"></span><span class="no">' + no + '</span><span class="tl" title="' + esc(title) + '">' + esc(title) + '</span>' + cd + jtB
    + '<span class="hrs">' + hrs + '</span><span class="tav" title="Mike Rodriguez">' + tav + '</span>' + stB + mn + '</div>';
}
/* ---------- each tab's actions, on the right of the tabs ---------- */
function tabActs(){
  var P = V.P, a = [];
  if(V.tab === 'time'){
    if(P.tAdd.head) a.push(ib('clockPlus', 'Add time entry', 'data-x="addp" data-i="end"'));
    if(P.tEd === 'mode') a.push(V.allEdit ? ib('check', 'Done editing', 'data-x="alled"', 'on') : ib('pencil', 'Edit the punches', 'data-x="alled"'));
    a.push(ib('print', 'Print the time', 'data-x="toast" data-t="Printing the time on Op 1"'));
  } else if(V.tab === 'parts'){
    a.push(ib('plus', 'Add part', 'data-x="toast" data-t="A new part row opens at the top"'), ib('box', 'From inventory…', 'data-x="toast" data-t="Pick from the Parts list"'), ib('scan', 'Extract from a quote…', 'data-x="toast" data-t="Paste or drop a quote — the parts come out of it"'));
  } else {
    if(P.aFiles.up) a.push(ib('upload', 'Upload', 'data-x="toast" data-t="Pick files to attach"'));
    if(P.aFiles.cam) a.push(ib('camera', 'Take a photo', 'data-x="toast" data-t="The camera opens"'));
    if(P.aFiles.paste) a.push(ib('paste', 'Paste a screenshot', 'data-x="toast" data-t="Ctrl V anywhere on the RO pastes it here"'));
  }
  return '<span class="act">' + a.join('') + '</span>';
}
/* ---------- the Time tab ---------- */
function dayBar(){
  var P = T.filter(function(p){ return !p.off; }), tot = P.reduce(function(s, p){ return s + durM(p); }, 0) || 1, lastD = null, h = '', days = [];
  P.forEach(function(p){ if(lastD && lastD !== p.d) h += '<span class="gap"></span>'; if(lastD !== p.d) days.push(p.d.split(', ')[1]); lastD = p.d;
    var c = V.P.tCol === 'stop' ? rc(p.er) : rc(p.sr); h += '<span class="sg" title="' + esc(p.sr + ' → ' + p.er) + '" style="--c:' + c + ';flex:' + durM(p) + '">' + dur(p) + '</span>'; });
  return '<div><div class="dbar">' + h + '</div><div class="dbl">' + days.map(function(d){ return '<span>' + d + '</span>'; }).join('') + '</div></div>';
}
function legend(){ var seen = {}, L = [];
  T.forEach(function(p){ if(p.off) return; [[p.sr, 0], [p.er, 1]].forEach(function(x){ var k = x[0]; if(seen[k]) return; seen[k] = 1; L.push('<span><i class="' + (x[1] && V.P.tCol === 'split' ? 'r' : '') + '" style="--c:' + rc(k) + '"></i>' + esc(k) + '</span>'); }); });
  return '<div class="legend">' + L.join('') + '</div>'; }
function rsChip(p, f){ var r = f === 's' ? p.sr : p.er, ed = V.P.tEd === 'click', m = V.menu === 'rs:' + p.id + ':' + f;
  var c = f === 's' ? (V.P.tCol === 'stop' ? rc(p.er) : rc(p.sr)) : (V.P.tCol === 'start' ? rc(p.sr) : rc(p.er));
  var b = '<button class="rs" ' + (ed ? 'data-x="m" data-m="rs:' + p.id + ':' + f + '" title="Change the reason"' : 'tabindex="-1"') + ' style="--c:' + c + '"><i></i>' + esc(r) + ic('chevD') + '</button>';
  if(!m) return '<span class="dd">' + b + '</span>';
  return '<span class="dd">' + b + '<div class="menu l"><div class="mh">' + (f === 's' ? 'Started for' : 'Stopped for') + '</div>' + (f === 's' ? SR : ER).map(function(x){ return '<button data-rs="' + p.id + ':' + f + ':' + esc(x) + '" aria-pressed="' + (x === r) + '"><i style="background:' + rc(x) + '"></i>' + esc(x) + '</button>'; }).join('') + '</div></span>';
}
function tmCell(p, f){ var v = f === 's' ? p.s : p.e;
  if(V.editT && V.editT.id === p.id && V.editT.f === f) return '<input class="tin" type="time" value="' + v + '" data-tin="' + p.id + ':' + f + '" aria-label="' + (f === 's' ? 'Start' : 'Stop') + ' time">';
  return '<button class="tm" ' + (V.P.tEd === 'click' ? 'data-x="tm" data-tm="' + p.id + ':' + f + '" title="Change the time"' : 'tabindex="-1"') + '>' + hm(v) + '</button>'; }
function punchForm(p){
  return '<div class="pf" data-pf="' + p.id + '"><label>Started<input type="time" data-pfi="s" value="' + p.s + '"></label><label>For<select data-pfi="sr">' + SR.map(function(x){ return '<option' + (x === p.sr ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '</select></label>'
    + '<label>Stopped<input type="time" data-pfi="e" value="' + p.e + '"></label><label>Because<select data-pfi="er">' + ER.map(function(x){ return '<option' + (x === p.er ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '</select></label>'
    + '<div class="ft"><span class="mu">' + (p.isNew ? 'A new time entry · ' : '') + esc(p.d) + ' · ' + esc(p.who) + '</span>' + (V.allEdit && !p.isNew ? ib('trash', 'Delete punch', 'data-x="del" data-p="' + p.id + '"', 'dng') : '<button class="btn sm gh" data-x="pfx" data-p="' + p.id + '">Cancel</button>') + (V.allEdit && !p.isNew ? '' : (V.P.iKeep === 'main' ? '<button class="btn sm pri" data-x="pfok" data-p="' + p.id + '">' + ic('check') + 'Save</button>' : ib('check', 'Save', 'data-x="pfok" data-p="' + p.id + '"', 'on'))) + '</div></div>';
}
function punchHtml(p, i){
  var P = V.P, lc = P.tCol === 'stop' ? rc(p.er) : rc(p.sr), sdc = P.tCol === 'stop' ? rc(p.er) : rc(p.sr), edc = P.tCol === 'start' ? rc(p.sr) : rc(p.er);
  if(V.allEdit || V.editP === p.id || p.isNew) return '<div class="pu edit" style="--lc:' + lc + '">' + punchForm(p) + '</div>';
  var tools = (P.tEd === 'pen' ? ib('pencil', 'Edit this punch', 'data-x="pen" data-p="' + p.id + '"') : '') + ib('notePlus', 'Add a note here', 'data-x="np" data-p="' + p.id + '"') + ib('trash', 'Delete punch', 'data-x="del" data-p="' + p.id + '"', 'dng');
  var notes = p.notes.length ? p.notes.map(function(n, k){ return '<div class="nt"><span class="nm">' + esc(n[0]) + '</span><span>' + esc(n[1]) + '</span>' + ib('x', 'Remove the note', 'data-x="ndel" data-p="' + p.id + '" data-k="' + k + '"', 'x dng') + '</div>'; }).join('') : '<div class="nn">No notes on this punch</div>';
  var nIn = V.noteP === p.id ? '<div class="nt"><span class="nm">' + hm(p.e) + '</span><input data-nin="' + p.id + '" placeholder="A note on this punch — Enter saves" style="all:unset;font-size:13px;width:100%"><span></span></div>' : '';
  var ask = V.askDel === p.id ? '<div class="ask">' + ic('trash') + '<span>Delete this punch — ' + dur(p) + ' of time?</span><span class="sp"></span><button class="btn sm gh" data-x="askno">Keep</button><button class="btn sm" data-x="askyes" data-p="' + p.id + '" style="color:var(--bad)">Delete</button></div>' : '';
  return '<div class="pu" style="--lc:' + lc + '">'
    + '<div class="pr"><span class="dot" style="--dc:' + sdc + '"></span>' + tmCell(p, 's') + '<span class="wh">Started · ' + rsChip(p, 's') + ' · ' + esc(p.who) + '</span><span class="tools">' + tools + '</span><span></span></div>'
    + notes + nIn
    + '<div class="pr"><span class="dot r' + (p.er === 'Complete' ? ' done' : '') + '" style="--dc:' + edc + '"></span>' + tmCell(p, 'e') + '<span class="wh">Stopped · ' + rsChip(p, 'e') + '</span><span></span><span class="du">' + dur(p) + '</span></div>' + ask + '</div>';
}
function timeTab(){
  var P = V.P, h = '', lastD = null;
  T.forEach(function(x, i){
    if(x.d !== lastD){ h += '<div class="dh">' + esc(x.d) + '</div>'; lastD = x.d; }
    else if(P.tAdd.between && !V.allEdit) h += '<div class="addb" data-x="addp" data-i="' + i + '"><span>' + ic('plus') + 'time entry</span></div>';
    if(x.off) h += '<div class="off"><span class="nm">' + esc(x.t) + '</span><span><b>' + esc(x.k) + '</b>  ' + esc(x.x) + '</span></div>';
    else h += punchHtml(x, i);
  });
  return (P.tBar === 'yes' ? dayBar() : '') + (P.tLeg === 'yes' ? legend() : '') + '<div class="tl' + (P.tEd === 'click' ? ' ed' : '') + '">' + h + '</div>'
    + '<div class="comp"><textarea id="cn" placeholder="What you found, what you did — no clock needed (Enter saves)"></textarea>' + (P.iKeep === 'main' ? '<button class="btn sm" data-x="cnote">Save</button>' : ib('check', 'Save note', 'data-x="cnote"')) + '</div>';
}
function partsTab(){
  var st = function(t, c, half){ return '<span class="pst" style="--c:' + c + '"><i class="' + (half ? 'h' : '') + '"></i>' + t + ic('chevD') + '</span>'; };
  return '<table class="ptab"><tr><th>Part</th><th>Number</th><th>Qty</th><th>Core</th><th>Status</th></tr>'
    + '<tr><td>Clutch kit 15.5"</td><td class="m">VOL-85013702</td><td>1</td><td>$150.00</td><td>' + st('Received', 'var(--good)', 1) + '</td></tr>'
    + '<tr><td>Release bearing</td><td class="m">20569143</td><td>1</td><td></td><td>' + st('Received', 'var(--good)', 1) + '</td></tr></table>';
}
function filesTab(){ return '<div class="fls"><div>dash-photo.jpg</div><div>clutch-disc.jpg</div><div>quote.pdf</div><div>bearing.jpg</div></div>'; }
/* ---------- the page ---------- */
function opBody(){
  return '<div class="ob"><div class="clock"><div><div class="big">6:15:57</div><small>On this operation · ' + T.filter(function(p){ return !p.off; }).length + ' entries</small></div><span class="play">' + ic('play') + '</span><span class="pb"><i></i></span><div class="kv"><div><small>Quoted</small><b>8.00<em>h</em></b></div><div><small>Burnt</small><b>6.27<em>h</em></b></div><div><small>Left</small><b>1.73<em>h</em></b></div><div><small>Efficiency</small><b class="g">128<em>%</em></b></div></div></div>'
    + '<div><div class="tabs">' + [['time', 'Time', T.filter(function(p){ return !p.off; }).length], ['parts', 'Parts', '2/2'], ['files', 'Files', '4']].map(function(t){ return '<button class="tb' + (V.tab === t[0] ? ' on' : '') + '" data-tab="' + t[0] + '">' + t[1] + ' <em>' + t[2] + '</em></button>'; }).join('') + tabActs() + '</div>'
    + '<div style="padding-top:12px">' + (V.tab === 'time' ? timeTab() : V.tab === 'parts' ? partsTab() : filesTab()) + '</div></div></div>';
}
function cfgTxt(){ return V.P.sCfg === 'ax' ? '6x4 · High-roof sleeper' : 'High-roof sleeper'; }
function sizeTxt(){ var S = V.P.sSize, L = []; if(S.sl) L.push('70-inch'); if(S.wb) L.push('228 in WB'); if(S.gv) L.push('52,000 lb'); return L.join(' · '); }
function railHtml(){
  var P = V.P, line = ['2020 Volvo VNL 760'].concat(P.sShow === 'both' ? ['<span class="nw">' + cfgTxt() + '</span>'].concat(sizeTxt() ? ['<span class="nw">' + sizeTxt() + '</span>'] : []) : []).concat(['Unit T-484']).join(' · ');
  var rows = [['Year', '2020'], ['Make', 'Volvo'], ['Model', 'VNL 760'], ['Configuration', cfgTxt(), 1]];
  if(P.sSize.sl) rows.push(['Sleeper', '70-inch', 1]); if(P.sSize.wb) rows.push(['Wheelbase', '228 in', 1]); if(P.sSize.gv) rows.push(['GVWR', '52,000 lb', 1]);
  if(P.sMore.eng) rows.push(['Engine', 'D13 TC · 455 HP']); if(P.sMore.tr) rows.push(['Transmission', 'I-Shift 12-speed', 1]); if(P.sMore.pt) rows.push(['Paint', 'Deep blue', 1]);
  rows.push(['VIN', '4V4NC9EH2LN546536'], ['Unit', 'T-484']);
  var st = stOf('o1');
  return '<aside class="rr"><div class="band"><img src="' + IMG.band + '" alt=""><span class="eb">RO-31236 · 13 days open</span><h2>Summit Freightways</h2><div class="ln">' + line + '</div>'
    + '<div><span class="stp" style="--sc:' + st[1] + ';cursor:default"><i class="' + (st[2] ? 'f' : '') + '"></i>' + st[0] + ic('chevD') + '</span></div>'
    + '<div class="bt">' + (V.P.iKeep === 'main' ? '<button class="btn sm pri">' + ic('play') + 'Start Op 1</button>' : ib('play', 'Start Op 1', '', 'on')) + obtn('swap', 'Transfer…', 'data-x="toast" data-t="Transfer"') + obtn('road', 'Road test', 'data-x="toast" data-t="Road test"') + obtn('check', 'Truck checks', 'data-x="toast" data-t="Truck checks"') + '</div></div>'
    + '<div class="vg"><div class="h">' + ic('chevD') + 'Vehicle<span class="sp"></span>' + ib('pencil', 'Edit the vehicle', 'data-x="toast" data-t="Vehicle opens for editing"') + '</div>' + rows.map(function(r){ return '<div class="r' + (r[2] ? ' nw' : '') + '"><span>' + r[0] + '</span><b title="' + esc(r[1]) + '">' + esc(r[1]) + '</b></div>'; }).join('') + '</div></aside>';
}
function roHtml(){
  return '<div class="fr">' + sideHtml() + '<div class="pg2"><div class="top"><span>RO list</span><span>/</span><b>RO-31236</b>' + ib('chevU', 'Previous RO', '', '', 1) + ib('chevD', 'Next RO', '', '', 1) + '<span>15 of 21</span><span class="sp"></span><span class="tt">' + ic('clock') + '<b>6.27</b> / 9.50 h</span><span class="tt">' + ic('parts') + '<b>2</b> / 2</span>' + ib('history', 'Activity', '', '', 1) + ib('clip', 'Files', '', '', 1) + ib('print', 'Print', '', '', 1) + ib('more', 'Options', '', '', 1) + '</div>'
    + '<div class="cols"><div class="mid"><div class="hh"><h3>Operations</h3><span class="n">2</span><span class="sp"></span>' + ib('plus', 'Add operation', 'data-x="toast" data-t="A new operation opens at the bottom"') + '</div>'
    + '<div class="op' + (V.open.o1 ? '' : ' shut') + '">' + opHead('o1', 1, 'Clutch slipping – replace clutch', '6.27 / 8.00 h', 78, 'MR', null) + (V.open.o1 ? opBody() : '') + '</div>'
    + '<div class="op' + (V.open.o2 ? '' : ' shut') + '">' + opHead('o2', 2, 'Check engine light – NOx sensor fault', '0.00 / 1.50 h', 0, 'LM', ['3226/2']) + (V.open.o2 ? '<div class="ob"><div class="mu">Open Op 1 to try the Time tab.</div></div>' : '') + '</div>'
    + '</div>' + railHtml() + '</div></div></div>';
}
/* ---------- sample trucks ---------- */
var SMP = [['vnl760', 2020, 'VNL 760', '6x4', 'High-roof sleeper', 70, 228, 'D13 TC · 455 HP', 'I-Shift 12-speed', 'Deep blue'], ['vnr640', 2019, 'VNR 640', '6x4', 'Mid-roof sleeper', 61, 213, 'D13 · 405 HP', 'I-Shift 12-speed', 'Graphite'],
  ['vhd300', 2022, 'VHD 300', '6x4', 'Day cab', 0, 197, 'D13 · 425 HP', 'I-Shift with crawler gears', 'White'], ['vnl670', 2016, 'VNL 670', '6x4', 'High-roof sleeper', 61, 232, 'D13 · 500 HP', 'I-Shift 12-speed', 'White'],
  ['vnl300', 2021, 'VNL 300', '4x2', 'Day cab', 0, 167, 'D13 · 405 HP', 'I-Shift 12-speed', 'Pearl white'], ['vnl860', 2023, 'VNL 860', '6x4', 'High-roof sleeper', 77, 244, 'D13 TC · 455 HP', 'I-Shift 12-speed', 'Silver'],
  ['vnl640n', 2025, 'VNL 640', '6x4', 'Mid-roof sleeper', 62, 226, 'D13 · 455 HP', 'I-Shift 12-speed', 'Blue'], ['vnr300', 2018, 'VNR 300', '6x2', 'Day cab', 0, 175, 'D11 · 405 HP', 'I-Shift 12-speed', 'Blue'],
  ['vnl780', 2014, 'VNL 780', '6x4', 'High-roof sleeper', 77, 244, 'D13 · 500 HP', 'I-Shift 12-speed', 'Deep blue'], ['vah400', 2021, 'VAH 400', '6x4', 'Flat-roof sleeper', 42, 260, 'D13 · 425 HP', 'I-Shift 12-speed', 'Silver']];
var RND = { 1: 2011, 3: 2021, 5: 2009, 8: 2022 };   /* "any mix": years the model was never built */
function smpHtml(){
  var P = V.P, rnd = P.sFrom === 'rnd', head = ['', 'Year', 'Make', 'Model', 'Configuration'], S = P.sSize;
  if(S.sl) head.push('Sleeper'); if(S.wb) head.push('Wheelbase'); if(S.gv) head.push('GVWR'); if(P.sMore.eng) head.push('Engine'); if(P.sMore.tr) head.push('Transmission'); if(P.sMore.pt) head.push('Paint');
  var NW = { Configuration: 1, Sleeper: 1, Wheelbase: 1, GVWR: 1, Transmission: 1, Paint: 1 };
  var rows = SMP.map(function(r, i){ var y = rnd && RND[i] ? RND[i] : r[1], bad = rnd && RND[i];
    var c = ['<img src="' + IMG[r[0]] + '" alt="" style="' + (bad ? 'opacity:.45' : '') + '">', '<span class="m"' + (bad ? ' style="color:var(--bad)" title="No ' + r[2] + ' was built in ' + y + ' — the picture is the nearest body"' : '') + '>' + y + (bad ? ' ⚠' : '') + '</span>', 'Volvo', r[2], P.sCfg === 'ax' ? r[3] + ' · ' + r[4] : r[4]];
    if(S.sl) c.push(r[5] ? r[5] + '-inch' : 'Day cab'); if(S.wb) c.push(r[6] + ' in'); if(S.gv) c.push(r[3] === '4x2' ? '40,000 lb' : '52,000 lb'); if(P.sMore.eng) c.push(r[7]); if(P.sMore.tr) c.push(r[8]); if(P.sMore.pt) c.push(r[9]);
    return '<tr>' + c.map(function(x, k){ return '<td' + (NW[head[k]] ? ' class="nwc"' : '') + '>' + x + '</td>'; }).join('') + '</tr>'; }).join('');
  return '<div class="smp"><div class="sh"><h3>Sample trucks</h3><small>Generate 25 sample ROs — the first 10 trucks it would make</small><span class="sp"></span><button class="btn sm" data-x="reroll">' + ic('swap') + 'Make another set</button></div><div style="overflow:auto"><table><tr>' + head.map(function(h){ return '<th' + (NW[h] ? ' class="nwc"' : '') + '>' + h + '</th>'; }).join('') + '</tr>' + rows + '</table></div></div>';
}
/* ---------- the choices, draw, picks ---------- */
var IMAP = [['plus', 'Add operation'], ['plus', 'Add part'], ['box', 'From inventory…'], ['scan', 'Extract from a quote…'], ['clockPlus', 'Add time entry'], ['pencil', 'Edit entries'], ['check', 'Done editing'], ['notePlus', 'Add note (on a punch)'], ['more', '+ code → in ⋯'], ['upload', 'Upload'], ['camera', 'Take a photo'], ['paste', 'Paste a screenshot']];
function imapHtml(){ return '<div class="ch"><b>The icon for each link</b><small>point at one in the mock-up to see its name</small><div class="imap">' + IMAP.map(function(m){ return '<span>' + ic(m[0]) + esc(m[1]) + '</span>'; }).join('') + '</div></div>'; }
function chsHtml(){
  return '<div class="chs">' + CH.map(function(c){ var k = c[1], multi = c[5];
    return (k === 'oCode' ? imapHtml() : '') + (c[0] ? '<div class="ch" style="padding:0;background:none;box-shadow:none"><div class="hd">' + c[0] + '</div></div>' : '') + '<div class="ch"><b>' + c[2] + '</b>' + (c[3] ? '<small>' + c[3] + '</small>' : '') + '<div class="fl">' + c[4].map(function(o){ var on = multi ? !!V.P[k][o[0]] : V.P[k] === o[0]; return '<button class="opt' + (multi ? ' sq' : '') + '" data-ch="' + k + '" data-v="' + o[0] + '" aria-pressed="' + on + '"><i></i><span><b>' + o[1] + (o[3] ? '<em>SUGGESTED</em>' : '') + '</b>' + (o[2] || '') + '</span></button>'; }).join('') + '</div></div>'; }).join('') + '</div>';
}
function draw(){
  var y = window.scrollY, cy = $('.chs') ? $('.chs').scrollTop : 0;
  $('#pg').innerHTML = '<div class="wrap"><div class="two">' + (V.view === 'ro' ? roHtml() : smpHtml()) + chsHtml() + '</div></div>';
  window.scrollTo(0, y); if($('.chs')) $('.chs').scrollTop = cy; sync();
  var ti = $('.tin'); if(ti){ ti.focus(); }
  var ni = $('[data-nin]'); if(ni) ni.focus();
}
function sync(){
  D.querySelectorAll('[data-view]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === V.view)); });
  D.querySelectorAll('.mk button[data-th]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-th') === V.th)); });
  D.documentElement.setAttribute('data-th', V.th);
}
function lbl(k){ var c = CH.filter(function(x){ return x[1] === k; })[0], v = V.P[k];
  if(c[5]) return c[4].filter(function(o){ return v[o[0]]; }).map(function(o){ return o[1]; }).join(', ') || 'none';
  return (c[4].filter(function(o){ return o[0] === v; })[0] || [0, '—'])[1]; }
function pkText(){
  var L = ['Parsec · RO page: Time tab, icons, operation header, tab actions, theme, sample trucks — my picks'], sec = '';
  var SEC = { 'TIME TAB': 'Time tab', 'ICONS': 'Icons', 'OPERATION HEADER': 'Operation header', 'TAB ACTIONS': 'Tab actions', 'THEME': 'Theme', 'EVERY RO PAGE': 'Every RO page', 'SAMPLE TRUCKS': 'Sample trucks' };
  CH.forEach(function(c){ if(c[0]) sec = SEC[c[0]] || c[0]; L.push('· ' + sec + ' — ' + c[2] + ': ' + lbl(c[1])); });
  if(V.note.trim()) L.push('· Notes: ' + V.note.trim());
  return L.join('\n');
}
function pkDraw(){ var w = $('#picks'); w.hidden = !V.picks; if(!V.picks) return;
  w.innerHTML = '<div class="pk-h"><b>Your picks</b><button class="x" data-pk="x" aria-label="Close">' + ic('x', 15) + '</button></div><pre>' + esc(pkText()) + '</pre><div class="pk-r"><span>Anything else</span><textarea id="pk-note" placeholder="e.g. a color for a reason, an icon you’d rather have">' + esc(V.note) + '</textarea></div><button class="btn pri" data-pk="copy">' + ic('copy') + 'Copy for the chat</button>'; }
function toast(m, undo){ var t = $('.toast'); if(t) t.remove(); t = D.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.innerHTML = '<span>' + esc(m) + '</span>' + (undo ? '<button data-x="undo">' + ic('undo') + 'Undo</button>' : ''); D.body.appendChild(t); clearTimeout(toast.h); toast.h = setTimeout(function(){ t.remove(); }, 3400); }
function snap(){ V.undo = JSON.stringify(T); }
function byId(id){ return T.filter(function(p){ return p.id === id; })[0]; }
function setTime(id, f, v){ var p = byId(id); if(!p || !v) return; snap(); p[f] = v; V.editT = null; draw(); toast((f === 's' ? 'Start' : 'Stop') + ' time changed to ' + hm(v) + ' — ' + dur(p) + ' on that punch.', 1); }
function delP(id){ snap(); T = T.filter(function(p){ return p.id !== id; }); V.askDel = null; V.editP = null; draw(); toast('Punch deleted.', 1); }
function addP(at){ var ref = at === 'end' ? null : T[+at], d = ref ? ref.d : 'Today', prev = null, i0 = at === 'end' ? T.length : +at;
  for(var k = i0 - 1; k >= 0; k--){ if(!T[k].off){ prev = T[k]; break; } }
  var s0 = ref && prev && prev.d === d ? prev.e : '13:00', e0 = ref && !ref.off ? ref.s : '14:00';
  var p = { id: 'p' + (SEQ++), d: d, s: s0, e: e0, sr: 'Repairing', er: 'Switched job', who: 'Admin', notes: [], isNew: true };
  snap(); if(at === 'end') T.push(p); else T.splice(+at, 0, p); V.editP = p.id; draw(); }
/* ---------- clicks ---------- */
D.addEventListener('click', function(e){
  var t = e.target, b;
  if((b = t.closest('[data-view]'))){ V.view = b.getAttribute('data-view'); V.menu = null; draw(); return; }
  if((b = t.closest('.mk button[data-th]'))){ V.th = b.getAttribute('data-th'); draw(); return; }
  if((b = t.closest('[data-thm]'))){ var v = b.getAttribute('data-thm'); if(v === 'cycle'){ var i = THM.map(function(x){ return x[0]; }).indexOf(V.th); V.th = THM[(i + 1) % 4][0]; } else V.th = v; draw(); return; }
  if((b = t.closest('[data-sz]'))){ V.sz = b.getAttribute('data-sz'); draw(); toast('Text size: ' + b.title); return; }
  if((b = t.closest('[data-ch]'))){ var k = b.getAttribute('data-ch'), v2 = b.getAttribute('data-v'), c = CH.filter(function(x){ return x[1] === k; })[0];
    if(c[5]){ V.P[k][v2] = V.P[k][v2] ? 0 : 1; } else V.P[k] = v2;
    if(k.charAt(0) === 's' && V.view !== 'smp' && k !== 'sShow') { }
    V.editT = null; V.editP = null; V.allEdit = false; V.askDel = null; V.menu = null; draw(); pkDraw(); return; }
  if((b = t.closest('[data-pk]'))){ var a = b.getAttribute('data-pk'); if(a === 'x'){ V.picks = false; pkDraw(); }
    if(a === 'copy'){ var tx = pkText(); (navigator.clipboard ? navigator.clipboard.writeText(tx) : Promise.reject()).then(function(){ toast('Copied — paste it in the chat.'); }, function(){ var ta = D.createElement('textarea'); ta.value = tx; D.body.appendChild(ta); ta.select(); try{ D.execCommand('copy'); toast('Copied — paste it in the chat.'); }catch(er){} ta.remove(); }); }
    return; }
  if(t.closest('#pk-open')){ V.picks = !V.picks; pkDraw(); return; }
  if((b = t.closest('[data-tab]'))){ V.tab = b.getAttribute('data-tab'); V.menu = null; draw(); return; }
  if((b = t.closest('[data-jt]'))){ var q = b.getAttribute('data-jt').split(':'); V.jt[q[0]] = q[1]; V.menu = null; draw(); toast('Op ' + (q[0] === 'o1' ? 1 : 2) + ' is ' + (q[1] === 'OP' ? 'REPAIR' : q[1]) + ' now.', 0); return; }
  if((b = t.closest('[data-st]'))){ var q2 = b.getAttribute('data-st').split(':'); V.st[q2[0]] = q2.slice(1).join(':'); V.menu = null; draw(); return; }
  if((b = t.closest('[data-rs]'))){ var q3 = b.getAttribute('data-rs').split(':'), p0 = byId(q3[0]); if(p0){ snap(); p0[q3[1] === 's' ? 'sr' : 'er'] = q3.slice(2).join(':'); } V.menu = null; draw(); toast('Reason changed.', 1); return; }
  if((b = t.closest('[data-x]'))){ var x = b.getAttribute('data-x');
    if(x === 'm'){ e.stopPropagation(); var m = b.getAttribute('data-m'); V.menu = V.menu === m ? null : m; draw(); return; }
    if(x === 'tog'){ if(t.closest('.dd,.cb')) return; var o = b.getAttribute('data-o'); V.open[o] = !V.open[o]; V.menu = null; draw(); return; }
    if(x === 'toast'){ V.menu = null; draw(); toast(b.getAttribute('data-t')); return; }
    if(x === 'mini'){ V.mini = !V.mini; draw(); return; }
    if(x === 'tm'){ var q4 = b.getAttribute('data-tm').split(':'); V.editT = { id: q4[0], f: q4[1] }; V.menu = null; draw(); return; }
    if(x === 'pen'){ V.editP = b.getAttribute('data-p'); draw(); return; }
    if(x === 'alled'){ V.allEdit = !V.allEdit; draw(); if(!V.allEdit) toast('Punches saved.'); return; }
    if(x === 'pfx'){ var p1 = byId(b.getAttribute('data-p')); if(p1 && p1.isNew) T = T.filter(function(z){ return z !== p1; }); V.editP = null; draw(); return; }
    if(x === 'pfok'){ var f = b.closest('[data-pf]'), p2 = byId(f.getAttribute('data-pf')); if(!p2) return; snap(); ['s', 'e', 'sr', 'er'].forEach(function(k2){ var el = f.querySelector('[data-pfi="' + k2 + '"]'); if(el) p2[k2] = el.value; }); var nw = p2.isNew; delete p2.isNew; V.editP = null; draw(); toast(nw ? 'Time entry added — ' + dur(p2) + '.' : 'Punch saved.', 1); return; }
    if(x === 'del'){ var id = b.getAttribute('data-p'); if(V.P.tDel === 'ask' && !V.allEdit){ V.askDel = id; draw(); } else delP(id); return; }
    if(x === 'askyes'){ delP(b.getAttribute('data-p')); return; }
    if(x === 'askno'){ V.askDel = null; draw(); return; }
    if(x === 'addp'){ addP(b.getAttribute('data-i')); return; }
    if(x === 'np'){ V.noteP = b.getAttribute('data-p'); draw(); return; }
    if(x === 'ndel'){ var p3 = byId(b.getAttribute('data-p')); if(p3){ snap(); p3.notes.splice(+b.getAttribute('data-k'), 1); draw(); toast('Note removed.', 1); } return; }
    if(x === 'cnote'){ var ta2 = $('#cn'), tx2 = ta2 ? ta2.value.trim() : ''; if(!tx2){ toast('Type the note first.'); return; } snap(); T.push({ id: 'n' + (SEQ++), d: 'Today', off: 1, t: '1:40 pm', k: 'Note', x: tx2 }); draw(); toast('Note saved on Op 1.', 1); return; }
    if(x === 'undo'){ if(V.undo){ T = JSON.parse(V.undo); V.undo = null; V.editT = null; V.editP = null; draw(); toast('Undone.'); } return; }
    if(x === 'reroll'){ SMP.push(SMP.shift()); draw(); toast('Another set — same rules.'); return; }
  }
  if(V.menu && !t.closest('.menu')){ V.menu = null; draw(); }
});
D.addEventListener('change', function(e){ var t = e.target; if(t.matches && t.matches('[data-tin]')){ var q = t.getAttribute('data-tin').split(':'); setTime(q[0], q[1], t.value); } });
D.addEventListener('focusout', function(e){ var t = e.target; if(t.matches && t.matches('[data-tin]')){ setTimeout(function(){ if(V.editT){ V.editT = null; draw(); } }, 120); } if(t.matches && t.matches('[data-nin]')){ setTimeout(function(){ if(V.noteP){ V.noteP = null; draw(); } }, 150); } });
D.addEventListener('input', function(e){ if(e.target.id === 'pk-note'){ V.note = e.target.value; var pre = $('#picks pre'); if(pre) pre.textContent = pkText(); } });
D.addEventListener('keydown', function(e){
  var t = e.target;
  if(e.key === 'Enter' && t.matches && t.matches('[data-tin]')){ e.preventDefault(); var q = t.getAttribute('data-tin').split(':'); setTime(q[0], q[1], t.value); return; }
  if(e.key === 'Enter' && t.matches && t.matches('[data-nin]')){ e.preventDefault(); var p = byId(t.getAttribute('data-nin')); if(p && t.value.trim()){ snap(); p.notes.push([hm(p.e), t.value.trim()]); } V.noteP = null; draw(); toast('Note added to the punch.', 1); return; }
  if(e.key === 'Enter' && !e.shiftKey && t.id === 'cn'){ e.preventDefault(); var b = D.querySelector('[data-x="cnote"]'); if(b) b.click(); return; }
  if(e.key === 'Escape'){ if(V.picks){ V.picks = false; pkDraw(); return; } if(V.menu || V.editT || V.editP || V.askDel || V.noteP){ V.menu = null; V.editT = null; V.askDel = null; V.noteP = null; if(V.editP){ var p2 = byId(V.editP); if(p2 && p2.isNew) T = T.filter(function(z){ return z !== p2; }); V.editP = null; } draw(); } }
});
window.addEventListener('resize', function(){ if(V.P.iSty === 'wide'){ clearTimeout(window.__rz); window.__rz = setTimeout(draw, 150); } });
draw();
