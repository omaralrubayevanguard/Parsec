/* Parsec · New RO import — the plan as a mock-up: one RO imported twice from ASIST */
var D = document, $ = function(s){ return D.querySelector(s); };
function ic(k, s){ return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"' + (s ? ' style="width:' + s + 'px;height:' + s + 'px"' : '') + '>' + (IC[k] || '') + '</svg>'; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
var V = { run: 1, only: false, where: 'ropage', apply: 'review', clash: 'mine', reader: 'once', people: 'ask', price: 'list', status: 'yes',
  nf: { po: 1, auth: 1, dept: 1, fu: 1, chassis: 1, engser: 1, opcode: 1, vmrs: 1, skill: 1, pcode: 1, core: 1, sales: 1 }, ask: {}, ppl: null, picks: false, note: '', applied: false, th: 'ivory' };
var NF = [['po', 'PO #'], ['auth', 'Auth #'], ['dept', 'Department'], ['fu', 'Follow-up'], ['chassis', 'Chassis / serial'], ['engser', 'Engine serial'], ['opcode', 'Op code'], ['vmrs', 'VMRS'], ['skill', 'Skill'], ['pcode', 'Price code'], ['core', 'Core charge'], ['sales', 'Salesman']];
/* the RO's fields: [label (ASIST → Parsec), first import, next import, { nf: new field, hand: changed by hand in Parsec between the two, sm: a note } ] */
var G = [
  ['Case & customer', [
    ['Case #', '4988201', '4988201'],
    ['RO #', 'RA0001238877', 'RA0001238877', { sm: 'shows as 8877 everywhere but the open RO' }],
    ['Customer', 'Summit Freightways', 'Summit Freightways', { sm: 'Cust# 20417' }],
    ['Status', 'Hold Tech', 'Waiting – Parts', { sm2: ['ASIST: Checked In', 'ASIST: Waiting on Parts'] }],
    ['ETR → Promised', 'Thu, Oct 29 · 3:00 pm', 'Fri, Oct 30 · 11:00 am'],
    ['Follow-up', 'Tue, Oct 27 · 9:00 am', 'Wed, Oct 28 · 9:00 am', { nf: 'fu' }],
    ['Created by → Advisor', 'Jenna Cho', 'Jenna Cho', { sm: 'on the Team' }],
    ['Checked in → Opened', 'Mon, Oct 26 · 7:42 am', 'Mon, Oct 26 · 7:42 am'],
    ['PO #', 'PO-55120', 'PO-55120', { nf: 'po' }],
    ['Auth #', '', 'A-77310', { nf: 'auth' }],
    ['Tech support case', '', 'TS-1180944']]],
  ['Truck', [
    ['Year · Make · Model', '2020 Volvo VNL64T760', '2020 Volvo VNL64T760', { sm: 'picture: the 2020 VNL 760 body' }],
    ['VIN', '4V4NC9EH7LN758560', '4V4NC9EH7LN758560', { sm: 'check digit ✓' }],
    ['Unit', 'T-807', 'T-807'],
    ['Chassis / serial', '758560', '758560', { nf: 'chassis' }],
    ['Engine', 'Volvo D13 · 455 HP', 'Volvo D13 · 455 HP'],
    ['Engine serial', '23116577', '23116577', { nf: 'engser' }],
    ['Odometer → Miles', '412,880', '413,104'],
    ['Engine hours', '15,206', '15,219'],
    ['Tag → Key tag', '68', '68'],
    ['Location', 'Lot D1', 'UpTime 2', { hand: 'B4' }],
    ['Department', 'Service', 'Service', { nf: 'dept' }]]],
  ['Complaint · cause · correction', [
    ['Complaint', 'Clutch slipping under load, burning smell.', 'Clutch slipping under load, burning smell.'],
    ['Cause', '', 'Clutch disc worn past spec; pressure plate heat-checked.'],
    ['Correction', '', 'Replaced clutch assembly and pilot bearing; adjusted linkage.']]]
];
/* operations: [no, name, hours, labor $, approval 1, approval 2, op code, VMRS, skill, price code, parts 1, parts 2, story 2, only in the next import] */
var P1 = ['VOL-85013702', 'Clutch kit 15.5"', 1, 1240, 150, 'Ryan Burke'], P2 = ['VOL-20518417', 'Pilot bearing', 1, 38.5, 0, 'Ryan Burke'], P3 = ['VOL-21899123', 'Release bearing', 1, 96, 0, 'Ryan Burke'], P4 = ['VOL-22827993', 'NOx sensor, outlet', 1, 412, 0, 'Ryan Burke'];
var OPS = [
  [1, 'Clutch slipping – replace clutch', 8.0, 1680, 'Approved', 'Approved', 'CL-210', '023-001-001', 'B', 'L1', [P1, P2], [P1, P2, P3], 'Mike Rodriguez: Removed the transmission, clutch disc worn to rivets, flywheel within spec. Installed the clutch kit and pilot bearing.'],
  [2, 'Check engine light – NOx sensor fault SPN 3226', 1.5, 315, 'Pending', 'Approved', 'DG-100', '043-006-005', 'A', 'D1', [], [P4], ''],
  [3, 'PM service – level A', 2.0, 420, '', 'Pending', 'PM-A', '', 'C', 'L1', [], [], '', 1]
];
var N1 = [['u', 'Jenna Cho', 'Mon 7:45 am', 'Driver is in the lounge — needs the truck by Thursday.'], ['s', 'ASIST', 'Mon 7:42 am', 'Asset checked in · Lot D1']];
var N2 = N1.concat([['u', 'Frank Delaney', 'Tue 2:10 pm', 'Release bearing is on backorder until Friday.'], ['s', 'ASIST', 'Tue 2:12 pm', 'Status changed to Waiting on Parts'], ['u', 'Dana Price', 'Tue 3:30 pm', 'NOx sensor approved under warranty — claim to follow.', 1]]);
var money = function(n){ return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
/* one field after an import: what Parsec ends up with, and what the row says */
function rowOf(f, k){
  var lab = f[0], a = f[1], b = f[2], o = f[3] || {}, nf = o.nf && !V.nf[o.nf];
  if(V.run === 1){ if(!a) return null; return { lab: lab, v: a, bd: nf ? 'nf' : 'new', sm: o.sm2 ? o.sm2[0] : o.sm, nf: nf }; }
  var cur = o.hand || a;
  if(b === cur) return { lab: lab, v: cur, bd: 'same', sm: o.sm2 ? o.sm2[1] : o.sm, nf: nf };
  if(!a && !o.hand) return { lab: lab, v: b, bd: nf ? 'nf' : 'new', sm: o.sm, nf: nf };
  if(o.hand && b !== a){   /* ASIST changed it and so did someone in Parsec */
    var pick = V.clash === 'ask' ? V.ask[k] : V.clash;
    if(pick === 'mine') return { lab: lab, v: cur, bd: 'kept', sm: 'ASIST now says ' + b, nf: nf };
    if(pick === 'asist') return { lab: lab, v: b, was: cur, bd: 'upd', sm: 'you had ' + cur, nf: nf };
    return { lab: lab, v: cur, bd: 'ask', sm: 'ASIST now says ' + b, ask: k, nf: nf };
  }
  if(o.hand) return { lab: lab, v: cur, bd: 'same', sm: 'yours — ASIST didn’t change it', nf: nf };
  return { lab: lab, v: b, was: a, bd: 'upd', sm: o.sm2 ? o.sm2[1] : o.sm, nf: nf };
}
var BD = { new: ['new', 'check', 'New'], upd: ['upd', 'swap', 'Updated'], kept: ['kept', 'lock', 'Kept yours'], same: ['same', '', 'Same'], ask: ['ask', 'chat', 'Pick one'], nf: ['nf', 'note', 'Into notes'] };
function bd(k){ var b = BD[k]; return '<span class="bd ' + b[0] + '">' + (b[1] ? ic(b[1]) : '') + b[2] + '</span>'; }
function frow(r){
  if(!r) return '';
  var acts = r.ask ? '<span class="acts"><button data-ask="' + r.ask + '" data-v="mine">Keep mine</button><button data-ask="' + r.ask + '" data-v="asist">Take ASIST’s</button></span>' : bd(r.bd);
  return '<div class="fr ' + r.bd + (V.only && r.bd === 'same' ? ' hide' : '') + '"><span>' + esc(r.lab) + '</span><span class="v">' + (r.was ? '<s>' + esc(r.was) + '</s>' : '') + esc(r.v) + (r.nf ? '<small>→ the RO’s notes (no field)</small>' : r.sm ? '<small>' + esc(r.sm) + '</small>' : '') + '</span>' + acts + '</div>';
}
function counts(){
  var c = { new: 0, upd: 0, kept: 0, same: 0, ask: 0, nf: 0 };
  G.forEach(function(g, gi){ g[1].forEach(function(f, fi){ var r = rowOf(f, gi + '.' + fi); if(r) c[r.bd]++; }); });
  OPS.forEach(function(o){ if(V.run === 1){ if(!o[13]) c.new += 1 + o[10].length; return; }
    if(o[13]) c.new += 1; else { if(o[4] !== o[5] && V.status === 'yes') c.upd++; else c.same++; c.new += o[11].length - o[10].length; c.same += o[10].length; if(o[12]) c.new++; } });
  c.new += V.run === 1 ? N1.length : N2.length - N1.length; if(V.run === 2) c.same += N1.length;
  return c;
}
function opsHtml(){
  return '<div class="ops">' + OPS.map(function(o){
    if(V.run === 1 && o[13]) return '';
    var ap = V.run === 1 ? o[4] : o[5], chg = V.run === 2 && !!o[4] && o[4] !== o[5], isNew = V.run === 1 || o[13];
    var meta = [V.nf.opcode ? 'Op code ' + o[6] : '', V.nf.vmrs && o[7] ? 'VMRS ' + o[7] : '', V.nf.skill ? 'Skill ' + o[8] : '', V.nf.pcode ? 'Price code ' + o[9] : ''].filter(Boolean).join(' · ');
    var st = ap === 'Approved' ? 'ready to work' : ap === 'Pending' ? 'Waiting – Approval' : '';
    var L = V.run === 1 ? o[10] : o[11], prev = o[10].length;
    var parts = L.length ? '<div class="ptw"><table class="pt"><thead><tr><th>Part #</th><th>Part</th><th class="r">Qty</th><th class="r">Unit</th>' + (V.nf.core ? '<th class="r">Core</th>' : '') + '<th class="r">Ext</th>' + (V.nf.sales ? '<th>Salesman</th>' : '') + '</tr></thead><tbody>' + L.map(function(p, i){ var nw = V.run === 2 && i >= prev;
      return '<tr' + (nw ? ' class="nwr"' : '') + '><td class="m">' + p[0] + '</td><td>' + esc(p[1]) + (nw ? ' ' + bd('new') : '') + '</td><td class="r m">' + p[2] + '</td><td class="r m">' + money(p[3]) + '</td>' + (V.nf.core ? '<td class="r m">' + (p[4] ? money(p[4]) : '—') + '</td>' : '') + '<td class="r m">' + money(p[2] * p[3] + p[4]) + '</td>' + (V.nf.sales ? '<td>' + esc(p[5]) + '</td>' : '') + '</tr>'; }).join('') + '</tbody></table>' + (V.price === 'list' ? '<div class="mu" style="padding:4px 8px 6px">' + ic('parts', 12) + ' Prices also go to the Parts list' + '</div>' : '') + '</div>' : '';
    var story = V.run === 2 && o[12] ? '<div class="st2"><b>Technician story</b> ' + bd('new') + '<br>' + esc(o[12]) + '</div>' : '';
    return '<div class="op"><div class="oh"><span class="no">' + o[0] + '</span><span><b>' + esc(o[1]) + '</b><small>' + esc(meta || ' ') + (V.status === 'yes' && st ? ' · status: ' + st : '') + '</small></span><span class="h">' + o[2].toFixed(1) + ' h · ' + money(o[3]) + '</span>' + (ap ? '<span class="ap ' + (ap === 'Approved' ? 'a' : 'p') + '">' + (chg ? o[4] + ' → ' : '') + ap + '</span>' : '<span></span>') + (isNew ? bd('new') : chg || L.length > prev || o[12] ? bd('upd') : bd('same')) + '</div>' + parts + story + '</div>';
  }).join('') + '</div>';
}
function notesHtml(){
  var L = V.run === 1 ? N1 : N2;
  return L.map(function(n, i){ var nw = V.run === 1 || i >= N1.length, out = n[4];
    var who = n[0] === 's' ? '<span class="av sys">' + ic('history', 12) + '</span>' : '<span class="av">' + n[1].split(' ').map(function(w){ return w[0]; }).join('') + '</span>';
    var p = out ? (V.people === 'keep' ? '<small class="mu"> · name kept on the RO</small>' : V.people === 'team' ? '<small class="mu"> · added to the Team (no sign-in)</small>' : '<span class="acts" style="display:inline-flex;margin-left:6px"><button data-ppl="keep"' + (V.ppl === 'keep' ? ' class="on"' : '') + '>Keep the name</button><button data-ppl="team"' + (V.ppl === 'team' ? ' class="on"' : '') + '>Add to Team</button></span>') : '';
    return '<div class="note">' + who + '<span><b>' + esc(n[1]) + '</b>' + (out ? ' <span class="bd nf">not on the Team</span>' : '') + p + '<q>' + esc(n[3]) + '</q></span><time>' + esc(n[2]) + (nw ? ' ' + bd('new') : '') + '</time></div>'; }).join('');
}
function totHtml(){
  var r2 = V.run === 2, lab = r2 ? 2415 : 1995, pts = r2 ? 1786.5 : 1278.5, core = 150, sup = 45, t = lab + pts + core + sup;
  var c = function(k, v){ return '<div>' + k + '<b>' + money(v) + '</b><small class="ok">' + ic('check', 11) + ' matches ASIST</small></div>'; };
  return '<div class="tot">' + c('Labor', lab) + c('Parts', pts) + c('Core + shop supplies', core + sup) + c('Total', t) + '</div>';
}
function dlgHtml(){
  var c = counts(), r2 = V.run === 2, n = c.new + c.upd + (V.clash === 'asist' ? 0 : 0);
  var pieces = r2 ? [['image', 'Screenshot · Case header', 'Case, status, ETR, follow-up', 1], ['image', 'Screenshot · Operations', '3 operations, 1 new', 1], ['image', 'Screenshot · Parts', '4 parts, 2 new', 1], ['image', 'Screenshot · Notes', '3 new notes', 1]]
    : [['doc', 'Case page · pasted text', 'Case, customer, asset, complaint'], ['image', 'Screenshot · Operations', '2 operations'], ['image', 'Screenshot · Parts', '2 parts'], ['image', 'Screenshot · Notes', '2 notes']];
  var reader = V.reader === 'text' ? 'Screenshots are off — paste text or add the PDF.' : V.reader === 'built' ? 'Screenshots are read on this computer — the reader is inside the Parsec file.' : 'Screenshots are read on this computer — the reader came down once and lives in the shop folder.';
  var h = '<div class="dlg"><div class="dh"><div><h3>' + (r2 ? 'Update RO 8877 · Summit Freightways' : 'New repair order') + '</h3><small>' + (r2 ? 'Found by its RO # and VIN — imported once already, Mon 7:50 am' : 'Paste or drop everything about the case — it fills in as it reads') + '</small></div>' + (r2 ? '<span class="tag bd upd">' + ic('swap') + 'Existing RO</span>' : '<span class="tag bd new">' + ic('plus') + 'New RO</span>') + '</div>'
    + (V.applied ? '<div class="banner">' + ic('check') + 'Applied — ' + (c.new + c.upd) + ' changes on RO 8877. Activity has the list.<button data-x="undo">Undo</button></div>' : '')
    + '<div class="db"><div class="imp"><div class="drop">' + ic('clip', 22) + '<b>Paste (Ctrl V) or drop here</b><small>Case page text, screenshots, the PDF — as many as you like, any order</small><div class="row"><span class="btn sm">' + ic('image') + 'Screenshots</span><span class="btn sm">' + ic('doc') + 'PDF</span></div></div>'
    + '<div class="pcs"><span>READ SO FAR</span>' + pieces.map(function(p){ return '<div class="pc' + (p[3] ? ' nw' : '') + '"><span class="th">' + ic(p[0]) + '</span><span><b>' + p[1] + '</b><small>' + p[2] + '</small></span><span class="ok">' + ic('check') + '</span></div>'; }).join('') + '</div>'
    + '<div class="prv">' + ic('lock') + '<span>' + reader + ' Nothing is sent anywhere.</span></div>'
    + '<div class="sum">' + (c.new ? '<span><b>' + c.new + '</b>new</span>' : '') + (c.upd ? '<span><b>' + c.upd + '</b>updated</span>' : '') + (c.kept ? '<span><b>' + c.kept + '</b>kept yours</span>' : '') + (c.ask ? '<span><b>' + c.ask + '</b>to pick</span>' : '') + (c.same ? '<span><b>' + c.same + '</b>same</span>' : '') + (c.nf ? '<span><b>' + c.nf + '</b>into notes</span>' : '') + '</div></div>'
    + '<div class="frm"><div class="fbar"><div class="seg" role="group" aria-label="Show"><button data-only="false" aria-pressed="' + !V.only + '">Everything</button><button data-only="true" aria-pressed="' + V.only + '">Changes only</button></div><span class="mu">' + (r2 ? 'ASIST changed since the last import · you changed Location by hand' : 'All of it is new — nothing on this RO yet') + '</span></div><div class="fs">'
    + G.map(function(g, gi){ return '<div class="grp"><h4>' + g[0] + '</h4>' + g[1].map(function(f, fi){ return frow(rowOf(f, gi + '.' + fi)); }).join('') + '</div>'; }).join('')
    + '<div class="grp"><h4>Operations <em>labor hours, price, approval' + (V.nf.opcode || V.nf.vmrs ? ', op code, VMRS' : '') + ' — parts under each</em></h4>' + opsHtml() + '</div>'
    + '<div class="grp"><h4>Notes <em>user notes and system notes, with who and when — into Activity</em></h4>' + notesHtml() + '</div>'
    + '<div class="grp"><h4>Totals <em>checked against what Parsec adds up</em></h4>' + totHtml() + '</div>'
    + '</div><div class="df"><span class="mu">' + (V.apply === 'now' ? 'Applied as it reads — Undo in the toast' : (c.ask ? c.ask + ' to pick before Apply' : 'Nothing changes until you press ' + (r2 ? 'Apply' : 'Create RO'))) + '</span><span class="btn">Cancel</span>' + (V.apply === 'now' ? '<span class="btn pri" data-x="done">Done</span>' : '<button class="btn pri" data-x="apply"' + (c.ask ? ' disabled style="opacity:.5"' : '') + '>' + (r2 ? 'Apply ' + (c.new + c.upd) + ' changes' : 'Create RO 8877') + '</button>') + '</div></div></div></div>';
  return h;
}
/* the choices */
var CH = [
  ['where', 'Where you import', '', [['newro', 'New RO button only', 'Paste a case to open a new RO'], ['ropage', 'New RO, and Import on the RO page', 'Same box on an open RO — updates it', 1], ['all', 'Also the Parts page', 'parts lists, quotes and invoices into an operation']]],
  ['apply', 'When it changes the RO', '', [['review', 'Show the changes, then Apply', 'New · Updated · Kept · Same, like on the left', 1], ['now', 'Apply right away', 'Undo in the toast; Activity keeps the list']]],
  ['clash', 'ASIST and Parsec both changed a field', 'Location: ASIST says UpTime 2, someone set B4 in Parsec', [['mine', 'Keep mine', 'Parsec’s value stays; ASIST’s shows beside it', 1], ['asist', 'Take ASIST’s', 'the newest import wins'], ['ask', 'Ask me each time', 'Apply waits until you pick']]],
  ['reader', 'Reading screenshots', 'Text and PDFs are read straight away either way', [['once', 'On this computer — reader downloaded once', 'kept in the shop folder after that (how it works today)', 1], ['built', 'Built into the Parsec file', 'no download at all; the file gets several MB bigger'], ['text', 'No screenshots', 'pasted text and PDFs only']]],
  ['people', 'People who aren’t on the Team', 'Dana Price wrote a note in ASIST', [['keep', 'Keep the name on the RO', 'notes, salesman and creator read as written'], ['team', 'Add them to the Team', 'no pages and no sign-in — they show in People'], ['ask', 'Ask me', 'one tap on each new name', 1]]],
  ['price', 'Part prices', '', [['ro', 'On the RO only', ''], ['list', 'Also update the Parts list', 'the next quote uses ASIST’s latest price', 1]]],
  ['status', 'ASIST’s approval', '', [['yes', 'Sets the operation', 'Approved → ready to work · Pending → Waiting – Approval · Declined → declined', 1], ['no', 'Shown only', 'the operation keeps the status Parsec has']]]
];
function chsHtml(){
  return '<div class="chs">' + CH.map(function(c){ return '<div class="ch"><b>' + c[1] + '</b>' + (c[2] ? '<small>' + c[2] + '</small>' : '') + '<div class="opts">' + c[3].map(function(o){ return '<button class="opt" data-ch="' + c[0] + '" data-v="' + o[0] + '" aria-pressed="' + (V[c[0]] === o[0]) + '"><i></i><span><b>' + o[1] + (o[3] ? '<em>SUGGESTED</em>' : '') + '</b>' + (o[2] ? o[2] : '') + '</span></button>'; }).join('') + '</div></div>'; }).join('')
    + '<div class="ch"><b>New fields on the RO</b><small>ASIST has these; Parsec doesn’t yet. Off → kept in the RO’s notes</small><div class="chips">' + NF.map(function(f){ return '<button data-nf="' + f[0] + '" aria-pressed="' + !!V.nf[f[0]] + '">' + f[1] + '</button>'; }).join('') + '</div></div></div>';
}
/* the field map: ASIST → Parsec */
var MAP = [
  ['Case', [['Case #', 'Case #', 'h'], ['Customer · Cust#', 'Customer', 'h'], ['RO #', 'RO # (last 4 shown)', 'h'], ['Status', 'RO status', 'h', 'ASIST’s words matched to Parsec’s statuses'], ['ETR', 'Promised', 'h'], ['Follow-up', 'Follow-up', 'n', 'fu'], ['Created by', 'Advisor (People)', 'h'], ['Checked in', 'Date opened + check-in time', 'h'], ['PO #', 'PO #', 'n', 'po'], ['Auth #', 'Auth #', 'n', 'auth'], ['Tech support case', 'Tech support case', 'h']]],
  ['Asset', [['Make · Model · Year', 'Make · Model · Model year — picks the truck picture', 'h'], ['VIN', 'VIN (check digit tested)', 'h'], ['Unit #', 'Unit', 'h'], ['Chassis / serial', 'Chassis', 'n', 'chassis'], ['Engine', 'Engine type', 'h'], ['Engine serial', 'Engine serial', 'n', 'engser'], ['Odometer', 'Miles', 'h'], ['Engine hours', 'Engine hours', 'h'], ['Tag #', 'Key tag', 'h'], ['On-site location', 'Location', 'h'], ['Department', 'Department', 'n', 'dept']]],
  ['Complaint / cause / correction', [['Case complaint', 'First operation’s complaint', 'h'], ['Cause', 'Cause in the work log', 'h'], ['Correction', 'Correction in the work log', 'h']]],
  ['Operations', [['Operation # and name', 'Operation (matched by number and name)', 'h'], ['Labor hours', 'Quoted hours', 'h'], ['Labor price', 'Estimate $', 'h'], ['Approval status', 'Approval → operation status', 'h'], ['Label status', 'Operation label', 'h'], ['Op code', 'Op code', 'n', 'opcode'], ['VMRS', 'VMRS', 'n', 'vmrs'], ['Skill', 'Skill', 'n', 'skill'], ['Price code', 'Price code', 'n', 'pcode'], ['Technician story', 'Work performed', 'h']]],
  ['Parts', [['Part # · description', 'Part on its operation (matched by part #)', 'h'], ['Qty', 'Qty', 'h'], ['Unit price', 'Price (and the Parts list)', 'h'], ['Core', 'Core charge', 'n', 'core'], ['Ext', 'checked: qty × unit + core', 'h'], ['Salesman', 'Salesman', 'n', 'sales']]],
  ['Notes and people', [['User notes', 'Activity notes — who and when kept', 'h'], ['System notes', 'Activity changes', 'h'], ['Employees', 'Matched to the Team by name', 'h']]],
  ['Totals', [['Labor · Parts · Core · Total', 'checked against Parsec’s money — a mismatch is flagged', 'h']]]
];
function mapHtml(){
  return '<div class="map"><table class="mt"><thead><tr><th>In ASIST</th><th class="ar"></th><th>In Parsec</th><th></th></tr></thead><tbody>' + MAP.map(function(g){ return '<tr class="gh"><td colspan="4">' + g[0] + '</td></tr>' + g[1].map(function(r){ var nf = r[2] === 'n', on = !nf || V.nf[r[3]];
    return '<tr><td>' + esc(r[0]) + '</td><td class="ar">→</td><td class="to">' + esc(on ? r[1] : 'The RO’s notes') + (!nf && r[3] ? '<small>' + esc(r[3]) + '</small>' : '') + '</td><td>' + (nf ? (on ? '<span class="bd new">' + ic('plus') + 'New field</span>' : '<span class="bd nf">Notes</span>') : '<span class="bd same">' + ic('check') + 'Has a place</span>') + '</td></tr>'; }).join(''); }).join('') + '</tbody></table></div>';
}
var HOW = [
  ['One reader for every piece', 'It finds the parts of the case by their headings — case header, asset, operations, parts, notes, totals — and reads each with its own rules. Screenshots can come one at a time, in any order.'],
  ['It remembers what it wrote', 'Every field, operation, part and note keeps what the last import put there. Next time: empty → filled; unchanged in Parsec → updated to ASIST’s; changed in Parsec → your pick on the right.'],
  ['Nothing comes in twice', 'Operations match by number and name (op code when there is one), parts by part number on their operation, notes by who, when and what. A new one is added; a known one is updated.'],
  ['It checks itself', 'VIN check digit, hours × labor rate against the labor price, qty × unit + core against Ext, and ASIST’s totals against Parsec’s.'],
  ['People by name', 'Created by, technician stories, notes and salesman are matched to the Team. A new name follows your pick.'],
  ['Every import is in Activity', '“Imported from ASIST — 9 new, 6 updated, 1 kept” with the list, so you can see what came from where. Undo takes the whole import back.']
];
function draw(){
  $('#pg').innerHTML = '<div class="wrap"><div class="hd"><h2>New RO · import from ASIST</h2><p>Paste the case page or drop screenshots into New RO — every time something new comes in, Parsec reads it and fills what’s missing or changed. Switch between the first import and the next one at the top.</p></div>'
    + '<div><div class="sec-t"><b>How it works</b></div><div class="flow">' + [['Paste or drop', 'Case text, screenshots, the PDF — one or many, any order.'], ['Read on this computer', 'Text right away; screenshots by the reader in the browser.'], ['Find the RO', 'By RO #, case #, VIN, then unit. None → a new RO.'], ['Merge', 'Empty → filled. Changed in ASIST → updated. Changed by you → your pick.'], ['Review, Apply', 'One list of what changes. Undo takes it back.']].map(function(s, i){ return '<div class="st"><span class="n"><i>' + (i + 1) + '</i></span><b>' + s[0] + '</b><p>' + s[1] + '</p></div>'; }).join('') + '</div></div>'
    + '<div class="two">' + dlgHtml() + chsHtml() + '</div>'
    + '<div><div class="sec-t"><b>How I’ll build it</b></div><div class="how">' + HOW.map(function(x){ return '<div><b>' + x[0] + '</b>' + x[1] + '</div>'; }).join('') + '</div></div>'
    + '<div><div class="sec-t"><b>ASIST → Parsec</b><small>every field in the screenshots, and where it goes</small></div>' + mapHtml() + '</div></div>';
  sync();
}
function sync(){
  D.querySelectorAll('[data-run]').forEach(function(b){ b.setAttribute('aria-pressed', String(+b.getAttribute('data-run') === V.run)); });
  D.querySelectorAll('button[data-th]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-th') === V.th)); });
  D.documentElement.setAttribute('data-th', V.th);
}
var LBL = {}; CH.forEach(function(c){ LBL[c[0]] = { t: c[1] }; c[3].forEach(function(o){ LBL[c[0]][o[0]] = o[1]; }); });
function pkText(){
  return 'Parsec · New RO import — my picks\n' + CH.map(function(c){ return '· ' + c[1] + ': ' + LBL[c[0]][V[c[0]]]; }).join('\n') + '\n· New fields: ' + (NF.filter(function(f){ return V.nf[f[0]]; }).map(function(f){ return f[1]; }).join(', ') || 'none — into notes') + (V.note.trim() ? '\n· Notes: ' + V.note.trim() : '');
}
function pkDraw(){ var w = $('#picks'); w.hidden = !V.picks; if(!V.picks) return;
  w.innerHTML = '<div class="pk-h"><b>Your picks</b><button class="x" data-pk="x" aria-label="Close">' + ic('x', 15) + '</button></div><div class="pk-r"><span>Anything else</span><textarea id="pk-note" placeholder="e.g. the PDF from ASIST’s Print button, or a field I missed">' + esc(V.note) + '</textarea></div><pre>' + esc(pkText()) + '</pre><button class="btn pri" data-pk="copy">' + ic('copy') + 'Copy for the chat</button>';
}
function toast(m){ var t = D.createElement('div'); t.className = 'toast'; t.textContent = m; D.body.appendChild(t); setTimeout(function(){ t.remove(); }, 2600); }
D.addEventListener('click', function(e){
  var t = e.target, b;
  if((b = t.closest('[data-run]'))){ V.run = +b.getAttribute('data-run'); V.applied = false; V.ask = {}; draw(); return; }
  if((b = t.closest('button[data-th]'))){ V.th = b.getAttribute('data-th'); sync(); return; }
  if((b = t.closest('[data-only]'))){ V.only = b.getAttribute('data-only') === 'true'; draw(); return; }
  if((b = t.closest('[data-ch]'))){ var k = b.getAttribute('data-ch'); V[k] = b.getAttribute('data-v'); if(k === 'clash') V.ask = {}; V.applied = false; var y = window.scrollY; draw(); window.scrollTo(0, y); if(V.picks) pkDraw(); return; }
  if((b = t.closest('[data-nf]'))){ var f = b.getAttribute('data-nf'); V.nf[f] = V.nf[f] ? 0 : 1; var y2 = window.scrollY; draw(); window.scrollTo(0, y2); if(V.picks) pkDraw(); return; }
  if((b = t.closest('[data-ask]'))){ V.ask[b.getAttribute('data-ask')] = b.getAttribute('data-v'); var y3 = window.scrollY; draw(); window.scrollTo(0, y3); return; }
  if((b = t.closest('[data-ppl]'))){ V.ppl = b.getAttribute('data-ppl'); var y4 = window.scrollY; draw(); window.scrollTo(0, y4); return; }
  if((b = t.closest('[data-x]'))){ var x = b.getAttribute('data-x'); if(x === 'apply'){ if(V.run === 1){ V.run = 2; V.ask = {}; draw(); toast('Created RO 8877 — import the case again later and it updates.'); } else { V.applied = true; draw(); } } else if(x === 'undo'){ V.applied = false; draw(); toast('Import undone — RO 8877 is back as it was.'); } return; }
  if((b = t.closest('#pk-open'))){ V.picks = !V.picks; pkDraw(); return; }
  if((b = t.closest('[data-pk]'))){ var k2 = b.getAttribute('data-pk'); if(k2 === 'x'){ V.picks = false; pkDraw(); return; } if(k2 === 'copy'){ var tx = pkText(); try{ navigator.clipboard.writeText(tx).then(function(){ toast('Copied — paste it in the chat.'); }, function(){ toast('Select the text and copy it.'); }); }catch(er){ toast('Select the text and copy it.'); } } return; }
});
D.addEventListener('input', function(e){ if(e.target.id === 'pk-note'){ V.note = e.target.value; var p = $('#picks pre'); if(p) p.textContent = pkText(); } });
D.addEventListener('keydown', function(e){ if(e.key === 'Escape' && V.picks){ V.picks = false; pkDraw(); } });
draw();
