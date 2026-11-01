var APP = 'Parsec', TOPIC = 'RO global settings', KEY = 'ip-parsec-170';
var TB = '__TB__', TBT = '__TBT__', TG = '__TG__', TX = '__TX__', TM = '__TM__';
var CUR = '<span class="v-cur"></span>';
function im(src, cls) { return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + src + '" alt="">'; }
function pgx(no, cust, line, src) { return '<div class="v-pg"><div class="v-pgh"><span>RO list</span><i>/</i><b>' + no + '</b></div>' + im(src, 'v-pgi') + '<div class="v-pgc">' + cust + '</div><div class="v-pgl">' + line + '</div></div>'; }
function msg(av, who, body) { return '<div class="v-msg"><span class="v-av">' + av + '</span><div><div class="v-mt">' + who + '</div><div class="v-mb">' + body + '</div></div></div>'; }
function fld(l, v, cls, ph) { return '<div class="v-fd' + (cls ? ' ' + cls : '') + '"><span class="l">' + l + '</span><span class="val">' + v + '</span><span class="ph">' + (ph || '—') + '</span></div>'; }
var I_PH = '<svg class="v-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M3.5 2.5h2.2l1.1 3-1.5 1a8 8 0 003.7 3.7l1-1.5 3 1.1v2.2a1.5 1.5 0 01-1.6 1.5A11 11 0 012 4.1a1.5 1.5 0 011.5-1.6z"/></svg>';
var I_PER = '<svg class="v-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="5.5" r="2.7"/><path d="M2.8 14a5.2 5.2 0 0110.4 0"/></svg>';
var I_CAM = '<svg class="v-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M2 5.5h2.5L6 3.5h4l1.5 2H14v7H2z"/><circle cx="8" cy="9" r="2.3"/></svg>';
var I_PG = '<svg class="v-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="11" height="11" rx="2"/><path d="M2.5 6h11"/></svg>';
var NOW = '<div class="v-now">' +
  '<div><b>RO numbers</b><span>Warranty shows 41 and Triage 9 — none open the RO. Foreman and Parts show the number as plain text plus an <i>Open RO</i> button.</span></div>' +
  '<div><b>Pictures</b><span>On the RO list, Technician, Foreman, Triage and the Shop view (a top view there). None on Parts, Warranty, the Time Log or messages.</span></div>' +
  '<div><b>Shop buttons</b><span>Road test and Truck checks show on the Parts page too — the same buttons for everyone.</span></div>' +
  '<div><b>Contact</b><span>Only in the truck card’s Customer section. New RO reads 28 fields — not the contact or phone.</span></div></div>';
var IDEAS = [
  { group: 'RO number → its page', items: [
    { k: 'where', t: 'Every RO number opens its RO', why: 'One click from the Time Log, a message, a claim or a part straight to the RO page.',
      vis: '<div class="v-st v-where">' +
        '<div class="v-row"><span class="v-src">Time Log</span><span class="v-no n1">RO-31677</span><span class="m">07:10 – 09:30 · Op 1</span></div>' +
        '<div class="v-row"><span class="v-src">Message</span><span class="v-no n2">RO-32431</span><span class="m">Ben → Mike · part is in</span></div>' +
        '<div class="v-row"><span class="v-src">Warranty</span><span class="v-no n3">RO-36760</span><span class="m">Claim 88412 · filed</span></div>' +
        '<div class="v-row"><span class="v-src">Note</span><span class="v-tx">Same leak as <span class="v-no n4">RO 29880</span> in May</span></div>' +
        pgx('RO-32431', 'Northline Transport', '2021 Volvo VNL 300 · Unit T-455', TM) + CUR + '</div>',
      steps: [['idle', 700], ['l1', 450], ['l2', 450], ['l3', 450], ['l4', 600], ['p-go', 650], ['c-go', 450], ['open', 1800]],
      opts: [['all', 'Everywhere an RO number shows', 'every page, messages, the Time Log, claims, parts'], ['text', 'Everywhere, and in typed notes too', '“RO 29880” in a note or message links too']] },
    { k: 'look', t: 'How the link looks', why: 'Easy to spot, without turning every list blue.',
      vis: '<div class="v-st h-s v-look">' + msg('BO', '<b>Ben Okafor</b> → Mike · 9:42', 'Your part is in for <span class="v-no v-lk">RO-32431<i class="v-ar">↗</i>' + CUR + '</span> — NOx sensor, bin B4.') +
        pgx('RO-32431', 'Northline Transport', '2021 Volvo VNL 300 · Unit T-455', TM) + '</div>',
      steps: [['idle', 700], ['point', 900], ['c-go', 450], ['open', 1600]],
      opts: [['hover', 'Plain — underlined when you point at it', ''], ['acc', 'In the accent color, always', ''], ['arrow', 'Plain — a small ↗ when you point at it', '']] },
    { k: 'peek', t: 'Point at it for a quick look', why: 'See the truck, customer, status and contact without leaving the page.',
      vis: '<div class="v-st v-peekw">' + msg('JC', '<b>Jenna Cho</b> → Mike · 10:15', 'Customer approved <span class="v-no v-lk">RO-31677' + CUR + '</span> — go ahead with Op 1.') +
        '<div class="v-peek">' + im(TB) + '<div><div><span class="v-no">RO-31677</span><span class="m"> · Opened Oct 19</span></div><div class="v-pgc sm">Rick’s Freight LLC</div><div class="v-pgl">2019 VNL 400 · Unit T-198 · Key 32</div>' +
        '<div class="v-pkr"><span class="v-pill good">Complete – Road test</span><span class="v-pgl">Mike Rodriguez</span></div><div class="v-pgl">' + I_PH + ' Dave Miller · (336) 555-0142</div></div></div>' +
        '<span class="v-key">⇧ Shift</span>' + pgx('RO-31677', 'Rick’s Freight LLC', '2019 Volvo VNL 400 · Unit T-198', TB) + '</div>',
      steps: [['idle', 600], ['point', 600], ['peek', 1700], ['c-go', 450], ['open', 1500]],
      opts: [['peek', 'Peek after half a second, click opens', ''], ['shift', 'Peek only while you hold Shift', ''], ['click', 'No peek — click opens it', '']] },
    { k: 'self', t: 'On the RO page itself', why: 'There the number isn’t a link — you’re already on that RO.',
      vis: '<div class="v-st h-s v-self"><div class="v-hd"><span class="v-crumb">RO list</span><i class="v-sl">/</i><span class="v-no v-lk">RO-31677' + CUR +
        '<span class="v-menu"><span>Copy RO number</span><span>Copy a link to this RO</span><span>Print</span></span></span><span class="v-cnt">17 of 24</span><span class="sp"></span><span class="m">1.58 / 1.50 h</span></div>' +
        '<div class="v-mini">' + im(TB) + '<div><span class="v-no">RO-31677</span><span class="m"> · Opened Oct 19</span><div class="v-pgc sm">Rick’s Freight LLC</div></div></div>' +
        '<div class="v-toast">✓ Copied RO-31677</div><div class="v-nop">Nothing happens — you’re on it</div></div>',
      steps: [['idle', 700], ['point', 700], ['c-it', 450], ['done', 1700]],
      opts: [['copy', 'Click copies it', 'with a “Copied” tick'], ['menu', 'Click opens Copy · Copy link · Print', ''], ['plain', 'Plain text — nothing happens', '']] }
  ]},
  { group: 'One picture per RO', items: [
    { k: 'pic', t: 'The same picture on every page', why: 'Change it on the truck card once — every page follows.',
      vis: '<div class="v-st h-l v-picw"><div class="v-tc"><div class="v-big">' + im(TB, 'a') + im(TG, 'b') + '<span class="v-cam">' + I_CAM + '</span></div>' +
        '<div class="v-tcn"><span class="v-no">RO-31677</span></div><div class="v-pgc sm">Rick’s Freight LLC</div><div class="v-pgl">2019 VNL 400</div>' +
        '<div class="v-alt"><small>Pick a body</small><span class="v-ao">' + im(TB) + '</span><span class="v-ao g">' + im(TG) + '</span></div></div>' +
        '<div class="v-pl">' + [['RO list', '1677 · Rick’s Freight', 'r1', ''], ['Technician', '1677 · Op 1 brake chamber', 'r2', ''], ['Foreman', '1677 · Road test', 'r3', ''], ['Message', 'RO-31677 · approved', 'r4', ' nw'], ['Time Log', 'RO-31677 · 07:10', 'r5', ' nw']].map(function (r) {
          return '<div class="v-pr ' + r[2] + r[3] + '"><span class="v-th">' + im(TB, 'a') + im(TG, 'b') + '</span><span class="v-src">' + r[0] + '</span><span class="v-prt">' + r[1] + '</span>' + (r[3] ? '<span class="v-new">new</span>' : '') + '</div>'; }).join('') + '</div>' + CUR + '</div>',
      steps: [['idle', 600], ['add', 800], ['p-cam', 550], ['c-cam', 400], ['p-pick', 550], ['c-pick', 400], ['big', 500], ['s1', 260], ['s2', 260], ['s3', 260], ['s4', 260], ['s5', 1300]],
      opts: [['all', 'Every page that shows an RO', 'adds it to messages, the Time Log, Parts and Warranty'], ['now', 'Only where pictures are now', 'RO list, Technician, Foreman, Triage, Shop view — kept in step']] },
    { k: 'top', t: 'Shop view: the same truck from above', why: 'A bay draws a top view, and it can look like a different truck.',
      vis: '<div class="v-st v-topw"><div class="v-side"><small>Truck card</small>' + im(TB) + '</div><div class="v-eq"><span class="ne">≠</span><span class="eq">=</span></div>' +
        '<div class="v-bay"><small>Shop view · bay D1</small><div class="v-bt"><span class="v-bl">D1</span>' + im(TX, 'x') + im(TBT, 't') + im(TB, 's') + '</div><div class="v-pgl">RO-31677 · Rick’s Freight</div></div></div>',
      steps: [['idle', 900], ['look', 800], ['swap', 1700]],
      opts: [['match', 'A top view of the same truck', 'same body and color as the side picture'], ['side', 'The side picture in the bay too', ''], ['as', 'Keep it as now', '']] },
    { k: 'win', t: 'Which picture an RO uses', why: 'Today: one picked on the truck card, then the model match, then the check-in photo.',
      vis: '<div class="v-st v-winw"><div class="v-srcs">' +
        '<div class="v-sc s1"><div class="v-scb none">none picked</div><small>Picked on the truck card</small></div>' +
        '<div class="v-sc s2"><div class="v-scb">' + im(TB) + '</div><small>Model match · 2019 VNL 400</small></div>' +
        '<div class="v-sc s3"><div class="v-scb ph">' + im(TB) + '<i>IMG_2041</i></div><small>Check-in photo</small></div></div>' +
        '<div class="v-ask">Show the model picture or this photo? <span class="v-b">Model</span><span class="v-b pri">This photo</span></div>' +
        '<div class="v-tgt"><span class="v-th">' + im(TB, 'm') + '<span class="p">' + im(TB) + '</span></span><span><span class="v-no">RO-31677</span> — on every page</span></div></div>',
      steps: [['idle', 600], ['s1', 450], ['s2', 450], ['s3', 600], ['pick', 1700]],
      opts: [['as', 'As now — picked, then model, then photo', ''], ['photo', 'The check-in photo first, when there is one', 'the real truck'], ['ask', 'Ask once at check-in', 'model picture or this photo']] }
  ]},
  { group: 'Shop buttons by department', items: [
    { k: 'dept', t: 'Who sees which shop buttons', why: 'Today Road test and Truck checks show on the Parts page too.',
      vis: '<div class="v-st v-dp"><div class="v-tabs">' +
        '<span class="v-tb ta"><i class="lp">' + I_PG + 'Technician</i><i class="lr"><b>MR</b>Mike</i><i class="ld">Service</i></span>' +
        '<span class="v-tb tb"><i class="lp">' + I_PG + 'Foreman</i><i class="lr"><b>FD</b>Frank</i><i class="ld">Express</i></span>' +
        '<span class="v-tb tc"><i class="lp">' + I_PG + 'Parts</i><i class="lr"><b>BO</b>Ben</i><i class="ld">Body shop</i></span></div>' +
        '<div class="v-hd2"><span class="v-no">RO-31677</span><span class="v-pgc sm">Rick’s Freight LLC</span></div><div class="v-bts">' +
        '<span class="v-b pri A RA RB RC">▶ Start op 1</span><span class="v-b now B RA RC">Transfer…</span><span class="v-b now A B RA">Road test</span><span class="v-b now A B RA RB">Truck checks</span>' +
        '<span class="v-b B RB">Release…</span><span class="v-b C">Order…</span><span class="v-b C">Send to…</span><span class="v-b RC">' + I_CAM + 'Photos</span></div>' +
        '<div class="v-nowl">Now: the same buttons for everyone</div>' + CUR + '</div>',
      steps: [['idle', 900], ['p-a', 500], ['c-a', 350], ['a', 1100], ['p-b', 500], ['c-b', 350], ['b', 1100], ['p-c', 500], ['c-c', 350], ['c', 1500]],
      opts: [['page', 'By the page you’re on', 'Technician: Start op · Foreman: Transfer, Road test, Checks · Parts: Order, Send to'], ['role', 'By who’s looking', 'the tech, the foreman, parts — on any page'], ['ro', 'By the RO’s department', 'Service, Express, Body shop… each gets its set']] },
    { k: 'place', t: 'Where they sit on the RO page', why: 'Today they’re in the truck card on the right, under the status.',
      vis: '<div class="v-st h-l v-w2"><div class="v-mhd"><span class="v-crumb">RO list /</span><span class="v-no">RO-31677</span><span class="sp"></span>' +
        '<span class="v-hbs"><span class="v-b pri one">Road test</span><span class="v-b all">Transfer…</span><span class="v-b all">Road test</span><span class="v-b pri all">Truck checks</span></span></div>' +
        '<div class="v-mops"><div class="v-mop"><b>1</b> Replace rear brake chamber <span class="v-pill good">Complete</span></div><div class="v-mop g"></div><div class="v-mop g s"></div></div>' +
        '<div class="v-mtc">' + im(TB) + '<div class="v-pgc sm">Rick’s Freight LLC</div><span class="v-pill good">Complete – Road test</span><div class="v-dlab">Service · shop</div>' +
        '<div class="v-cbs"><span class="v-b">Transfer…</span><span class="v-b">Road test</span><span class="v-b pri">Truck checks</span></div></div></div>',
      steps: [['idle', 900], ['move', 900], ['done', 1700]],
      opts: [['both', 'The next one in the header, all in the card', 'e.g. Road test up top once the ops are done'], ['hdr', 'All of them in the header bar', ''], ['card', 'In the truck card, under the department', 'as now, grouped']] },
    { k: 'cards', t: 'Shop buttons on the RO cards', why: 'Technician, Foreman and Parts lists — one click without opening the RO.',
      vis: '<div class="v-st v-cdw">' +
        '<div class="v-tcd c1"><span class="v-th">' + im(TB) + '</span><div class="v-cdt"><div><span class="v-no">1677</span> <b>Rick’s Freight LLC</b></div><div class="v-cds"><span class="v-pill hold">Hold tech</span><span class="v-pill work">Working · Repairing</span><span class="m">Op 1 · brake chamber</span></div></div>' +
        '<span class="v-cda"><span class="v-b pri nx">▶ Start op 1</span><span class="v-dots">⋯</span><span class="v-clk"><i></i>0:00:04</span></span>' +
        '<span class="v-cmenu"><span class="hi">▶ Start op 1</span><span>Transfer…</span><span>Road test</span><span>Truck checks</span></span></div>' +
        '<div class="v-tcd c2"><span class="v-th">' + im(TM) + '</span><div class="v-cdt"><div><span class="v-no">6760</span> <b>Blue Ridge Haulers</b></div><div class="v-cds"><span class="v-pill good">Complete – Road test</span></div></div>' +
        '<span class="v-cda"><span class="v-b nx">Road test</span><span class="v-dots">⋯</span></span></div>' +
        pgx('RO-31677', 'Rick’s Freight LLC', '2019 Volvo VNL 400 · Unit T-198', TB) + CUR + '</div>',
      steps: [['idle', 600], ['point', 700], ['c-1', 400], ['menu', 700], ['p-2', 500], ['c-2', 400], ['done', 1700]],
      opts: [['next', 'The next one on each card', 'Start op · Road test · Release — whatever’s next'], ['menu', 'A ⋯ with all of them', ''], ['none', 'None — open the RO for these', 'as now']] },
    { k: 'setup', t: 'Who sets each department’s buttons', why: 'One table in Settings → The shop.',
      vis: '<div class="v-st v-whw"><div class="v-sth">Settings · The shop · <b>Shop buttons</b><span class="v-lock lm">Only the manager can change it</span><span class="v-lock lf">Manager and foreman can change it</span><span class="v-lock lx">Set by Parsec</span></div>' +
        '<table class="v-mx"><thead><tr><th></th><th>Start op</th><th>Road test</th><th>Checks</th><th>Transfer</th><th>Release</th></tr></thead><tbody>' +
        [['Service', '11110', ''], ['Express', '10101', ''], ['Body shop', '1T010', ' bd'], ['Make-ready', '10101', '']].map(function (r) {
          return '<tr class="' + r[2] + '"><th><i class="v-chg"></i>' + r[0] + '</th>' + r[1].split('').map(function (c) { return c === 'T' ? '<td class="tg"><i class="v-on"></i>' + CUR + '</td>' : '<td><i class="' + (c === '1' ? 'v-on' : 'v-off') + '"></i></td>'; }).join('') + '</tr>'; }).join('') +
        '</tbody></table><div class="v-rcl"><b>Recently changed</b><span>Tom Brandt · Body shop: Road test off · just now</span><span class="v-un">Undo</span></div></div>',
      steps: [['idle', 700], ['point', 700], ['c-it', 400], ['done', 1700]],
      opts: [['mgr', 'The manager, in Settings', 'a table like this, with Reset'], ['fm', 'The manager and the foreman', ''], ['fixed', 'Fixed by Parsec', 'no table']] }
  ]},
  { group: 'Customer contact', items: [
    { k: 'hdr', t: 'The contact in the RO header', why: 'Name and phone at the top of the RO page, next to the customer.',
      vis: '<div class="v-st h-s v-hdw"><div class="v-hd"><span class="v-crumb">RO list</span><i class="v-sl">/</i><span class="v-no">RO-31677</span><span class="v-hcu">Rick’s Freight LLC</span>' +
        '<span class="v-ct">' + I_PER + '<span>Dave Miller</span><span class="v-ph v-lk">' + I_PH + '(336) 555-0142' + CUR + '<span class="v-menu"><span>Copy the number</span><span>Edit the contact</span><span>Copy a text · Ready for pickup</span></span></span></span>' +
        '<span class="v-ci v-lk">' + I_PH + CUR + '<span class="v-tip">Dave Miller · (336) 555-0142</span></span></div>' +
        '<div class="v-mini">' + im(TB) + '<div><span class="v-no">RO-31677</span><span class="m"> · Opened Oct 19</span><div class="v-pgc sm">Rick’s Freight LLC</div></div></div><div class="v-toast">✓ Copied (336) 555-0142</div></div>',
      steps: [['idle', 600], ['show', 700], ['point', 600], ['c-it', 400], ['done', 1600]],
      opts: [['copy', 'Name and phone — click copies the number', ''], ['menu', 'Name and phone — click for Copy · Edit · a text', 'the text comes from your Triage templates'], ['icon', 'Just a phone icon — point at it for the contact', '']] },
    { k: 'card', t: 'The contact on the RO cards', why: 'The advisor and the foreman can call without opening the RO.',
      vis: '<div class="v-st h-l v-ccw"><div class="v-mtc2">' + im(TB) + '<div><span class="v-no">RO-31677</span><span class="m"> · Oct 19</span></div><div class="v-pgc sm">Rick’s Freight LLC</div><div class="v-cl k1">' + I_PH + 'Dave Miller<br>(336) 555-0142</div></div>' +
        '<div class="v-rcol"><small>RO list</small><div class="v-lr2 h"><span>RO</span><span>Customer</span><span class="cc">Contact</span></div>' +
        '<div class="v-lr2"><span class="v-no">1677</span><span class="cu v-lk"><b>Rick’s Freight LLC</b>' + CUR + '<span class="v-tip">' + I_PH + ' Dave Miller · (336) 555-0142</span><i class="v-cl k2">Dave Miller · (336) 555-0142</i></span><span class="cc"><i class="v-cl k2c">Dave Miller<br>(336) 555-0142</i></span></div>' +
        '<small>Technician</small><div class="v-tcd3"><span class="v-th">' + im(TB) + '</span><div><div><span class="v-no">1677</span> <b>Rick’s Freight LLC</b></div><i class="v-cl k3">' + I_PH + 'Dave Miller · (336) 555-0142</i></div></div></div></div>',
      steps: [['idle', 600], ['s1', 500], ['s2', 500], ['s3', 1600]],
      opts: [['line', 'Under the customer — truck card, RO list, Technician, Foreman', ''], ['col', 'A Contact column in the RO list', 'show or hide it in Display · plus the truck card'], ['hover', 'Point at the customer to see it', '']] },
    { k: 'imp', t: 'New RO reads the contact', why: 'From pasted ASIST text or a screenshot, with the rest of the case.',
      vis: '<div class="v-st h-l v-impw"><div class="v-paste"><small>Pasted from ASIST</small>' +
        '<div class="ln">RO #: 31677 &nbsp;Case #: 88412</div><div class="ln">Customer: RICK’S FREIGHT LLC</div><div class="ln h1">Contact: DAVE MILLER<br>Phone: 336-555-0142</div>' +
        '<div class="ln h2e">Email: dispatch@ricksfreight.com</div><div class="ln h2d">Driver: TONY RUIZ<br>Cell: 336-555-0199</div><div class="ln">Unit: T-198 &nbsp;Tag: 32</div></div>' +
        '<div class="v-flds"><small>Case &amp; customer</small>' + fld('RO #', '31677', 'ok') + fld('Customer', 'Rick’s Freight LLC', 'ok') + fld('Contact', 'Dave Miller', 'f1') + fld('Phone', '(336) 555-0142', 'f1') +
        fld('Email', 'dispatch@ricksfreight.com', 'f2e') + fld('Driver', 'Tony Ruiz', 'f2d') + fld('Driver’s cell', '(336) 555-0199', 'f2d') + '</div></div>',
      steps: [['idle', 700], ['h1', 700], ['f1', 800], ['h2', 700], ['f2', 1600]],
      opts: [['np', 'The contact’s name and phone', 'reads Contact, Phone, Cell, Mobile'], ['npe', 'Name, phone and email', 'adds an Email field to the RO'], ['drv', 'Name and phone, plus the driver', 'when the driver isn’t the contact']] },
    { k: 'mem', t: 'No contact found? Use the last one', why: 'Same customer and unit — the last RO’s contact is a good guess.',
      vis: '<div class="v-st v-memw"><div class="v-dlg"><div class="v-dt">New repair order</div>' + fld('Customer', 'Rick’s Freight LLC', 'ok') + fld('Unit', 'T-198', 'ok') +
        fld('Contact', 'Dave Miller<span class="v-from">from RO-29880</span>', 'm1', 'Add who to call') + fld('Phone', '(336) 555-0142', 'm1', 'Add a number') +
        '<div class="v-sug"><span>Last used on <span class="v-no">RO-29880</span> · May 12 — <b>Dave Miller · (336) 555-0142</b></span><span class="v-b pri v-lk">Use' + CUR + '</span></div></div></div>',
      steps: [['idle', 700], ['sug', 900], ['point', 600], ['c-use', 400], ['done', 1600]],
      opts: [['sug', 'Suggest it — you click Use', ''], ['auto', 'Fill it in, marked “from RO-29880”', ''], ['no', 'Leave it empty', '']] }
  ]}
];
