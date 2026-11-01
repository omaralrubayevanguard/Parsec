var APP = 'Parsec', TOPIC = 'Data storage', KEY = 'ip-parsec-150';
var I_FD = '<svg viewBox="0 0 16 16" fill="currentColor" opacity=".9"><path d="M1.5 4.2c0-.8.6-1.4 1.4-1.4h3.3l1.4 1.5h5.5c.8 0 1.4.6 1.4 1.4v6.6c0 .8-.6 1.4-1.4 1.4H2.9c-.8 0-1.4-.6-1.4-1.4z"/></svg>';
var I_FL = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M4 1.8h5.2L12.5 5v9.2H4z"/><path d="M9 1.8V5h3.5"/></svg>';
var I_BIGFD = '<svg viewBox="0 0 64 52" fill="currentColor"><path d="M4 10c0-3 2-5 5-5h14l5 5h27c3 0 5 2 5 5v28c0 3-2 5-5 5H9c-3 0-5-2-5-5z" opacity=".9"/></svg>';
var I_BIGFL = '<svg viewBox="0 0 34 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 2h18l8 8v28H4z"/><path d="M21 2v9h9"/><path d="M9 20h16M9 26h16M9 32h10"/></svg>';
var I_PKG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/></svg>';
var I_SRV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01"/></svg>';
var CUR = '<span class="v-cur"></span>';
function tn(cls, ic, t, s) { return '<div class="v-tn ' + cls + '">' + ic + '<span>' + t + '</span>' + (s ? '<small>' + s + '</small>' : '') + '</div>'; }
function chip(t, miss) { return '<span class="v-chip' + (miss ? ' miss' : '') + '"><i></i>' + t + '</span>'; }
var IDEAS = [
  { group: 'Fix first', items: [
    { k: 'save9', t: 'Save every kind of data to the folder', why: 'Nine kinds live only in this browser today — another computer or a cleared browser loses them.',
      vis: '<div class="v-st"><div class="v-cols"><div><div class="v-chips">' + chip('ROs') + chip('Punches') + chip('Day clocks') + chip('People') + chip('Inventory') + chip('Activity') +
        chip('Permissions', 1) + chip('Time-fix asks', 1) + chip('Air reasons', 1) + chip('Completed ROs', 1) + chip('RO list layouts', 1) + chip('RO list views', 1) + chip('RO list columns', 1) + chip('Handover', 1) + chip('Page setup', 1) +
        '</div><div class="v-log">data check · 61 kinds · 61 saved · 0 left out</div></div><div class="v-fold">' + I_BIGFD + 'Parsec Data</div></div>' +
        '<span class="v-note bad v-n1">9 kinds never reach the folder</span></div>',
      steps: [['now', 1400], ['flow', 1600], ['fix', 1300], ['lint', 1800]],
      opts: [['fixlint', 'Fix it, and the build checks every new kind', 'like the tooltip check — a kind that wouldn’t be saved fails the build'], ['fix', 'Fix the nine only', '']] },
    { k: 'merge', t: 'Two computers, both changes kept', why: 'Today the second computer gets “keep mine or load theirs” — one whole copy wins, the other’s changes are lost.',
      vis: '<div class="v-st"><div class="v-net"><div class="v-box"><b>Front desk</b><span class="v-chg">RO-24211 · Op 1 → Complete</span></div><div class="v-mid">' + I_BIGFD + '<br>the folder</div><div class="v-box"><b>Shop floor</b><span class="v-chg v-lost">Mike clocked out 15:30</span></div></div>' +
        '<div class="v-dlg"><b>The folder changed on another computer</b><div class="v-r"><span class="v-b pri">Keep mine</span><span class="v-b">Load theirs</span></div></div>' +
        '<div class="v-res"><span class="v-ok">✓</span> RO-24211 · Op 1 → Complete <span style="color:var(--ink3)">· front desk 15:29</span><br><span class="v-ok">✓</span> Mike clocked out 15:30 <span style="color:var(--ink3)">· shop floor 15:30</span></div>' +
        '<span class="v-note bad v-n2b">Today: one of the two is lost</span><span class="v-note good v-n2g">Each record keeps its newest change</span></div>',
      steps: [['two', 1200], ['now', 1900], ['merge', 2000]],
      opts: [['merge', 'Merge record by record', 'each RO, punch and clock-in keeps its newest change; a real clash asks'], ['show', 'Keep the choice, show what differs', ''], ['as', 'As now', '']] },
    { k: 'backup', t: 'Backups that hold the whole day', why: 'Today: one copy at the first save of the day — the day’s work isn’t in a backup until tomorrow. Kept forever, no photos.',
      vis: '<div class="v-st"><div class="v-tl"><div class="v-trk"><i class="v-work"></i><i class="v-gap"></i></div>' +
        '<span class="v-mk old" style="left:7%"><em>07:02 today’s backup</em></span><span class="v-mk new" style="left:27%"><em>09:00</em></span><span class="v-mk new" style="left:47%"><em>11:00</em></span><span class="v-mk new" style="left:67%"><em>13:00</em></span><span class="v-mk new" style="left:85%"><em>15:00</em></span><span class="v-mk new" style="left:96%"><em>17:30</em></span>' +
        '<div class="v-ax"><span>07</span><span>09</span><span>11</span><span>13</span><span>15</span><span>17</span></div></div>' +
        '<div class="v-files"><div class="v-file">' + I_FL + 'Backups/2026-10/data-2026-10-30 17-30.json.gz<small>86 KB</small></div><div class="v-file">' + I_FL + 'Backups/2026-10/data-2026-10-30 15-00.json.gz<small>85 KB</small></div><div class="v-file">' + I_FL + 'Backups/2026-10/attachments-2026-10-30.zip<small>new photos only</small></div></div>' +
        '<span class="v-note bad v-n3">Not in any backup until tomorrow</span></div>',
      steps: [['today', 1100], ['gap', 1600], ['new', 1400], ['list', 2000]],
      opts: [['two', 'Every 2 hours + end of day, compressed', 'keep 30 days, then one a month forever · new photos zipped daily'], ['eod', 'End of day only, compressed', 'keep 30 days'], ['as', 'As now', 'first save of the day, kept forever']] },
    { k: 'clean', t: 'Data that travels cleanly', why: 'Five ways of writing a date, money kept as text, and some records with no ID.',
      vis: '<div class="v-st"><div class="v-tbl">' +
        '<div class="v-tr"><span class="k">Warranty start</span><span class="a">03-14-2020</span><span class="ar">→</span><span class="z">2020-03-14</span></div>' +
        '<div class="v-tr"><span class="k">Ticked at</span><span class="a">1730300000000</span><span class="ar">→</span><span class="z">2026-10-30T14:53:20Z</span></div>' +
        '<div class="v-tr"><span class="k">Part price</span><span class="a">"84.50"</span><span class="ar">→</span><span class="z">8450 (cents)</span></div>' +
        '<div class="v-tr"><span class="k">Activity line</span><span class="a">no ID</span><span class="ar">→</span><span class="z">act_9f3k2</span></div>' +
        '<div class="v-tr"><span class="k">Attachment</span><span class="a">no ID · by name</span><span class="ar">→</span><span class="z">att_7mq1 · name kept</span></div>' +
        '</div><span class="v-note good v-n4">One way for each — the server reads it as is</span></div>',
      steps: [['raw', 900], ['r1', 600], ['r2', 600], ['r3', 600], ['r4', 600], ['r5', 1900]],
      opts: [['all', 'Clean it all — old data converted once', 'a backup is taken first; nothing is dropped'], ['new', 'Only new data from now on', ''], ['as', 'As now', '']] }
  ]},
  { group: 'A better layout', items: [
    { k: 'folders', t: 'Open and Closed, by year', why: 'Today every RO ever sits in one ROs folder.',
      vis: '<div class="v-st h-l"><div class="v-tree">' + tn('', I_FD, 'Parsec Data') + tn('v-l1', I_FD, 'ROs') + tn('v-l2', I_FD, 'Open', '24') +
        '<div class="v-tn v-l3 mv1">' + I_FD + '<span>RO-24211</span><small><span class="v-pillst"><span class="t1">Working</span><span class="t2">Released</span></span></small></div>' + tn('v-l3', I_FD, 'RO-24233') + tn('v-l3', I_FD, 'RO-24240') +
        tn('v-l2', I_FD, 'Closed') + tn('v-l3', I_FD, '2026', '124') + '<div class="v-tn v-l4 moved">' + I_FD + '<span>RO-24211</span><small>moved when released</small></div>' + tn('v-l4', I_FD, 'RO-24190') + tn('v-l3', I_FD, '2025', '1,402') + '</div></div>',
      steps: [['idle', 1100], ['close', 1100], ['moved', 1300], ['hold', 1500]],
      opts: [['year', 'Open, and Closed by year', 'an RO moves when it’s released or declined'], ['month', 'Closed by year, then month', 'Closed/2026/10'], ['flat', 'One folder, as now', '']] },
    { k: 'names', t: 'Folder names that never change', why: 'Today the customer is in the name — changing the customer renames the folder and copies its photos.',
      vis: '<div class="v-st h-s"><div class="v-name"><div class="v-nm"><small>Customer</small><span><span class="v-cust"><span class="t1">Prairie Line Trucking</span><span class="t2">Prairie Line Trucking LLC</span></span></span></div>' +
        '<div class="v-nm nowr"><small>Today</small><div class="v-tn">' + I_FD + '<span class="t1">RO-24211 - Prairie Line Trucking</span><span class="t2">RO-24211 - Prairie Line Trucking LLC</span></div></div>' +
        '<div class="v-nm newr"><small>New</small><div class="v-tn">' + I_FD + '<span>RO-24211</span></div></div></div>' +
        '<span class="v-note bad v-n6b">Renamed · 14 photos copied</span><span class="v-note good v-n6g">Stays RO-24211 — the customer lives inside</span></div>',
      steps: [['a', 1100], ['edit', 900], ['today', 1500], ['stay', 1700]],
      opts: [['num', 'The RO number only', 'RO-24211 — the customer and unit live inside'], ['unit', 'RO number + unit', 'RO-24211 · T-796 — units rarely change'], ['as', 'As now', 'number + customer']] },
    { k: 'inside', t: 'Inside an RO folder: the data and the page', why: 'Today the data is hidden inside the readable page.',
      vis: '<div class="v-st h-s"><div class="v-in"><div><h6>Today</h6><div class="v-tree">' + tn('', I_FD, 'RO-24211') + tn('v-l1 f', I_FL, 'RO-24211 Repair Order.html') + '<div class="v-hid">the data is hidden inside the page</div>' + tn('v-l1', I_FD, 'Attachments') + '</div></div>' +
        '<div class="v-new"><h6>New</h6><div class="v-tree">' + tn('', I_FD, 'RO-24211') + tn('v-l1 f', I_FL, 'ro.json', 'the data') + tn('v-l1 f', I_FL, 'RO-24211.html', 'to read and print') + tn('v-l1', I_FD, 'Attachments') + '</div></div></div></div>',
      steps: [['today', 1500], ['split', 2200]],
      opts: [['both', 'ro.json and a readable page, side by side', 'Excel, IT and the server read ro.json'], ['json', 'ro.json only — the page is made when you open it', ''], ['as', 'As now', '']] },
    { k: 'shop', t: 'Shop.html split by topic', why: 'Today one file holds 50 kinds of things, is rewritten on almost every click, and grows forever.',
      vis: '<div class="v-st h-l"><div class="v-shop"><div class="v-big">' + I_BIGFL + '<b>Shop.html</b><small>278 KB · 50 kinds</small></div><div class="v-parts">' +
        tn('', I_FD, 'Shop') + tn('v-l1 f', I_FL, 'people.json', 'staff, roles, permissions') + tn('v-l1 f', I_FL, 'settings.json', 'shop, pay period, lunch, rules') + tn('v-l1 f', I_FL, 'inventory.json') + tn('v-l1', I_FD, 'clock', 'one file a month') + tn('v-l1', I_FD, 'activity', 'one file a month') + tn('v-l1 f', I_FL, 'inbox.json') + tn('v-l1', I_FD, 'timesheets', 'one file a pay period') + tn('v-l1 f', I_FL, 'library.json', 'fixes, templates, truck pictures') +
        '</div></div></div>',
      steps: [['one', 1300], ['crack', 600], ['split', 1600], ['hold', 1400]],
      opts: [['topic', 'By topic — the busy ones by month', 'a clock-in rewrites one small file, not everything'], ['topiconly', 'By topic only', ''], ['as', 'One Shop file, as now', '']] }
  ]},
  { group: 'Ready for the server', items: [
    { k: 'shape', t: 'The shape the server gets', why: 'An RO today is one nested document. A database wants tables linked by IDs.',
      vis: '<div class="v-st"><div class="v-doc"><b>RO-24211</b> {<br>&nbsp;customer, truck,<br>&nbsp;operations: [<br>&nbsp;&nbsp;{ Op 1, parts: […] },<br>&nbsp;&nbsp;{ Op 2, parts: […] } ],<br>&nbsp;punches: [ … ] }</div>' +
        '<div class="v-tabs"><div class="v-tab"><h6>ros</h6><div><em>ro_8k2</em> · RO-24211 · Prairie Line</div></div><div class="v-tab"><h6>operations</h6><div><em>op_1a</em> · ro_8k2 · Check engine light</div><div><em>op_2b</em> · ro_8k2 · Replace NOx sensor</div></div><div class="v-tab"><h6>parts</h6><div><em>pt_77</em> · op_2b · NOx sensor × 1</div></div><div class="v-tab"><h6>punches</h6><div><em>pn_3c</em> · op_1a · 07:10–09:30</div></div></div></div>',
      steps: [['doc', 1500], ['tables', 1800], ['hold', 1200]],
      opts: [['both', 'Both: RO folders on disk, tables in the export', 'nothing changes for you; the server gets tables'], ['tables', 'Tables everywhere', 'one file per kind per month'], ['docs', 'Documents only (cleaned)', 'for a document database']] },
    { k: 'manifest', t: 'Proof that nothing was lost', why: 'Every export carries a list of what’s in it; the server checks it on arrival.',
      vis: '<div class="v-st h-xl"><div class="v-ship"><div class="v-pkg">' + I_PKG + 'Parsec export<br>2026-10-30</div><div class="v-lane"><i class="v-dot"></i></div><div class="v-srv">' + I_SRV + 'the server</div></div>' +
        '<div class="v-chk"><div><i>✓</i>Data version<span>v15</span></div><div><i>✓</i>Repair orders<span>148</span></div><div><i>✓</i>Operations · parts<span>321 · 408</span></div><div><i>✓</i>Punches · day clocks<span>369 · 249</span></div><div><i>✓</i>Attachments<span>every file</span></div><div><i>✓</i>Checksums match<span>sha-256</span></div></div>' +
        '<span class="v-note good v-n10">Arrived complete — or it refuses and says what’s missing</span></div>',
      steps: [['pack', 900], ['send', 1100], ['t1', 700], ['t2', 700], ['done', 2000]],
      opts: [['full', 'A list, counts and checksums — refuse on a mismatch', ''], ['counts', 'Counts only', ''], ['none', 'Skip the list', '']] },
    { k: 'changes', t: 'Send changes, not copies', why: 'Every record says when it last changed, and a delete is marked instead of erased — so a sync sends only what changed, deletes included.',
      vis: '<div class="v-st h-s"><div class="v-recs"><div class="v-rec e1"><span class="id">pn_7xk</span><span class="w">Punch · 2253 · 09:30–11:40</span><span class="m"><span class="t1">changed 08:02</span><span class="t2">changed 14:52</span></span></div>' +
        '<div class="v-rec e2"><span class="id">pn_2ab</span><span class="w">Punch · 7156 · 12:30–13:10</span><span class="m"><span class="t1">changed 12:30</span><span class="t2">deleted 15:01 · kept</span></span></div>' +
        '<div class="v-rec"><span class="id">pn_9qd</span><span class="w">Punch · 7156 · 13:10–14:52</span><span class="m">changed 14:52</span></div></div>' +
        '<div class="v-syn"><span>2 changes</span><span class="v-lane"><i class="v-dot"></i></span><span>the server</span></div></div>',
      steps: [['idle', 900], ['edit', 1100], ['del', 1100], ['sync', 1900]],
      opts: [['marks', 'Changed-at and deleted marks on every record', 'deleted marks are cleared after the server has them'], ['full', 'Send a full copy each time', '']] },
    { k: 'export', t: 'One button: Export for the server', why: 'A single package with the data, the photos and the list — and a check that reads it back.',
      vis: '<div class="v-st h-s"><div class="v-exp"><div class="v-brow"><span class="v-b pri v-b1">' + I_PKG.replace('<svg', '<svg class="v-ic"') + 'Export for the server</span><span class="v-b v-b2">Round-trip check</span></div><div class="v-prog"><i></i></div>' +
        '<div class="v-file v-made">' + I_FL + 'Parsec export 2026-10-30.zip<small>data 77 KB + the photos</small></div>' +
        '<div class="v-rt"><span class="v-ok">✓</span> Exported and read back into an empty copy — identical, 0 differences</div></div>' + CUR + '</div>',
      steps: [['idle', 700], ['p-exp', 600], ['c-exp', 1000], ['made', 900], ['p-rt', 600], ['c-rt', 500], ['ok', 1800]],
      opts: [['both', 'Export + a round-trip check', 'on the Settings page, for the manager and admin'], ['exp', 'Export only', '']] }
  ]},
  { group: 'Smaller files', items: [
    { k: 'gzip', t: 'Compress what isn’t opened every day', why: 'Built into the browser — no installs. Numbers from the 148-RO sample.',
      vis: '<div class="v-st h-s"><div class="v-bars"><div class="v-bar"><span>Everything saved</span><span class="tr"><i></i></span><span class="n"><span class="t1">703 KB</span><span class="t2">77 KB</span></span></div>' +
        '<div class="v-bar"><span>A daily backup</span><span class="tr"><i></i></span><span class="n"><span class="t1">1.06 MB</span><span class="t2">86 KB</span></span></div>' +
        '<div class="v-bar"><span>A closed RO</span><span class="tr"><i></i></span><span class="n"><span class="t1">3.3 KB</span><span class="t2">1.2 KB</span></span></div></div>' +
        '<span class="v-note good v-n13">About 9–12× smaller</span></div>',
      steps: [['raw', 1300], ['zip', 2200]],
      opts: [['cold', 'Backups and Closed years compressed', 'open ROs stay plain, so anyone can open them'], ['all', 'Everything compressed', ''], ['none', 'No compression', '']] },
    { k: 'slim', t: 'Save less of the same thing', why: 'The Completed ROs record copies whole ROs — 114 KB of the 278 KB shop data. A phone photo is often 3–5 MB.',
      vis: '<div class="v-st h-s"><div class="v-bars"><div class="v-bar"><span>Completed ROs</span><span class="tr"><i></i></span><span class="n"><span class="t1">114 KB</span><span class="t2">31 KB</span></span></div>' +
        '<div class="v-bar"><span>One phone photo</span><span class="tr"><i></i></span><span class="n"><span class="t1">4.8 MB</span><span class="t2">420 KB</span></span></div></div>' +
        '<span class="v-note good v-n14">IDs and hours only · photos to 1600 px wide</span></div>',
      steps: [['raw', 1300], ['slim', 2200]],
      opts: [['both', 'Slim the Completed record + shrink big photos', 'the full copy of a deleted RO is still kept'], ['rec', 'Slim the Completed record only', ''], ['as', 'As now', '']] }
  ]}
];
var NOW = '<div class="v-now"><div class="bad"><b>9</b>kinds of data never reach the folder — permissions, time-fix asks, air reasons, Completed ROs…</div><div><b>50</b>kinds of things in one Shop.html (278 KB in the sample), rewritten on almost every click</div><div class="bad"><b>1</b>backup a day, at the first save — the day’s work isn’t in it</div><div><b>5</b>ways of writing a date · money kept as text</div><div><b>148</b>ROs → 148 folders in one place, open and closed together</div><div><b>9×</b>smaller if compressed — 703 KB → 77 KB</div></div>';
