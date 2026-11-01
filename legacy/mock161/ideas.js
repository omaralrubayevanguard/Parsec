var APP = 'Parsec', TOPIC = 'Settings and automations', KEY = 'ip-parsec-161';
var I_LOCK = '<svg class="v-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2"/></svg>';
var I_SRCH = '<svg class="v-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>';
var I_PLAY = '<svg class="v-ic" viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 3v10l8-5z"/></svg>';
var CUR = '<span class="v-cur"></span>';
function ping(b, s, to) { return '<div class="v-ping"><span class="v-to">' + to + '</span><b>' + b + '</b><small>' + s + '</small></div>'; }
function lr(t, x, cls) { return '<div class="v-lr' + (cls ? ' ' + cls : '') + '"><span class="t">' + t + '</span><span class="x">' + x + '</span><span class="u"><span class="v-t1">Undo</span><span class="v-t2">undone</span></span></div>'; }
function kv(a, b) { return '<div class="v-kv"><span>' + a + '</span><b>' + b + '</b></div>'; }
function tile(t, l, tp) { return '<span class="v-tile" style="left:' + l + '%;top:' + tp + '%">' + t + '</span>'; }
function gr(a, b) { return '<div class="v-gr"><b>' + a + '</b><span>' + b + '</span></div>'; }
var IDEAS = [
  { group: 'Better automations', items: [
    { k: 'parts', t: 'Parts in → tell the tech', why: 'Today “Parts → status” moves the operation back to Hold Tech when its parts are in — but nobody is told.',
      vis: '<div class="v-st h-s"><div class="v-row"><b>RO-24211</b><span class="m">Op 2 · Replace NOx sensor</span><span class="sp"></span></div>' +
        '<div class="v-row"><span>Part</span><span class="m">NOx sensor · bin B4</span><span class="sp"></span><span class="v-pill wait v-pst"><span class="v-t1">Ordered</span><span class="v-t2">Received</span></span></div>' +
        '<div class="v-row"><span>Operation</span><span class="sp"></span><span class="v-pill wait v-ost"><span class="v-t1">Waiting – Parts</span><span class="v-t2">Hold Tech</span></span></div>' +
        ping('Your part is in — RO-24211', 'Op 2 · NOx sensor · bin B4 · back in your queue', 'to Luis') + '</div>',
      steps: [['idle', 1000], ['in', 1100], ['move', 1100], ['ping', 2000]],
      opts: [['tech', 'Tell the tech and move the op back', 'the built-in, plus a message to the tech'], ['fm', 'Tell the tech and the foreman', ''], ['as', 'Move it back only (as now)', '']] },
    { k: 'cust', t: 'Waiting on the customer too long', why: 'An RO can sit in Waiting – Customer all day without anyone noticing.',
      vis: '<div class="v-st h-s"><div class="v-row"><b>RO-24198</b><span class="m">Mr. Patel · estimate sent 10:15</span><span class="sp"></span></div>' +
        '<div class="v-row"><span class="v-pill cust">Waiting – Customer</span><span class="sp"></span><span class="v-w"><i class="v-clock"></i><span class="q1">40 min</span><span class="q2">1 h 30 min</span><span class="q3">2 h 05 min</span></span></div>' +
        ping('RO-24198 · waiting on the customer 2 h', 'Estimate sent 10:15 · call Mr. Patel?', 'to Dana') + '</div>',
      steps: [['w1', 1000], ['w2', 1000], ['w3', 1100], ['ping', 2000]],
      opts: [['2h', 'Remind the advisor after 2 h', ''], ['4h', 'After 4 h', ''], ['am', 'The next morning', 'one list of every RO still waiting']] },
    { k: 'ready', t: 'Ready to release → tell the advisor', why: 'Status sync moves the RO to Complete – Road test on its own; the advisor finds out by looking.',
      vis: '<div class="v-st"><div class="v-board"><div class="v-col"><h6>Working</h6><div class="v-card src"><b>RO-24211</b>Ford F-150<div class="v-ck"><span class="k1"><i>✓</i>Parts in</span><span class="k2"><i>✓</i>Notes</span><span class="k3"><i>✓</i>Road test</span></div></div></div>' +
        '<div class="v-col"><h6>Complete – Road test</h6><div class="v-card dst"><b>RO-24211</b>Ford F-150<div class="v-ck"><span><i>✓</i>All checks done</span></div></div></div></div>' +
        ping('RO-24211 is ready to release', 'Ford F-150 · every check done 15:40', 'to Dana') + '</div>',
      steps: [['idle', 900], ['c1', 700], ['c2', 700], ['rt', 800], ['move', 1100], ['ping', 2000]],
      opts: [['adv', 'Tell the advisor', ''], ['advfm', 'Tell the advisor and the foreman', '']] },
    { k: 'noparts', t: 'Starting an op whose part isn’t in', why: 'A tech can start the clock on an operation that’s still Waiting – Parts.',
      vis: '<div class="v-st"><div class="v-row"><b>Op 2</b><span class="m">Replace NOx sensor</span><span class="sp"></span><span class="v-b pri v-start">' + I_PLAY + 'Start</span></div>' +
        '<div class="v-row"><span class="m">Part</span><span class="sp"></span><span class="v-pill wait">Waiting – Parts · Ordered</span></div>' +
        '<div class="v-ask"><b>Op 2’s part isn’t in yet</b><small>NOx sensor · Ordered · ETA Fri</small><div class="v-r"><span class="v-b">Start anyway</span><span class="v-b pri">Pick another op</span></div></div>' + CUR + '</div>',
      steps: [['idle', 900], ['p-st', 700], ['c-st', 500], ['ask', 2200]],
      opts: [['ask', 'Ask before it starts', '“Start anyway” is noted on the punch'], ['note', 'Just show a note', 'the clock starts as now']] },
    { k: 'over', t: 'Past the quoted time, while the clock runs', why: 'The “over quoted” check only happens when a punch stops — after the time is spent.',
      vis: '<div class="v-st h-s"><div class="v-row"><b>RO-24211 · Op 1</b><span class="m">Luis · on the clock</span><span class="sp"></span><span class="v-num"><span class="n0">0.3 h</span><span class="n1">0.8 h</span><span class="n2">1.2 h</span><span class="n3">1.6 h</span></span></div>' +
        '<div class="v-bar"><i></i><span class="v-q"><em>Quote 1.5 h</em></span></div>' +
        ping('RO-24211 · Op 1 is past its 1.5 h quote', '1.6 h on the clock · Luis', 'to Frank') + '</div>',
      steps: [['idle', 800], ['g1', 1000], ['g2', 1000], ['g3', 1000], ['ping', 2000]],
      opts: [['100', 'Tell the foreman at 100% of the quote', ''], ['120', 'At 120%', ''], ['both', 'At 100% and again at 150%', '']] },
    { k: 'warr', t: 'Chase warranty claims on time', why: 'Warranty settings hold the chase-after times, but nothing reminds anyone when they pass.',
      vis: '<div class="v-st h-s"><div class="v-row"><b>Claim RO-24177</b><span class="m">sent Oct 21</span><span class="sp"></span><span class="v-pill wait">No answer</span></div>' +
        '<div class="v-days"><span class="ln"></span><span class="pr"></span><span class="v-dm d0" style="left:2%"><em>Submitted</em></span><span class="v-dm d3" style="left:42%"><em>Day 3 · chase</em></span><span class="v-dm d7" style="left:88%"><em>Day 7</em></span></div>' +
        ping('Claim RO-24177 · day 7, no answer', 'Chase-after time from Warranty settings', 'to Sam') + '</div>',
      steps: [['sub', 900], ['d3', 1100], ['d7', 1100], ['ping', 2000]],
      opts: [['days', 'Remind at each chase-after day', 'to the warranty admin'], ['two', 'Remind the warranty admin and the advisor', ''], ['week', 'One weekly list instead', '']] },
    { k: 'builder', t: 'Build a rule as a sentence, then test it', why: 'Today a rule is a list of drop-downs (10 triggers · 9 conditions · 4 actions), and you find out it works when it runs.',
      vis: '<div class="v-st h-l"><div class="v-sent"><span class="w w1">When</span><span class="c c1">a part’s status changes</span><span class="w w2">and</span><span class="c c2">it becomes Received</span><span class="w w3">then</span><span class="c c3">set the operation to Hold Tech</span><span class="w w4">and</span><span class="c c4">add a reminder for the tech</span></div>' +
        '<div class="v-test"><span class="v-b pri">' + I_PLAY + 'Test on the last 7 days</span></div>' +
        '<div class="v-res"><b>Would have run 6 times</b> · RO-24211, RO-24198, RO-24177 and 3 more<br><span style="color:var(--ink3)">A test changes nothing.</span></div>' + CUR + '</div>',
      steps: [['idle', 700], ['s1', 700], ['s2', 700], ['s3', 700], ['s4', 900], ['p-test', 700], ['c-test', 500], ['res', 2200]],
      opts: [['both', 'Sentence builder + a test run', ''], ['sent', 'Sentence builder only', ''], ['as', 'Keep the current rule list', '']] },
    { k: 'log', t: 'See what ran, and undo it', why: 'Today an automation shows a toast and is gone — no record of what it changed.',
      vis: '<div class="v-st"><div class="v-log"><h6>What ran today</h6>' + lr('09:12', 'Status sync · RO-24211 → Working') +
        lr('10:40', 'Parts → status · RO-24198 → Waiting – Parts', 'un') + lr('11:05', 'Parts → status · RO-24177 → Hold Tech') + lr('13:30', 'My rule · reminder on RO-24211') + '</div>' + CUR + '</div>',
      steps: [['idle', 700], ['rows', 1300], ['p-un', 700], ['c-un', 500], ['done', 2000]],
      opts: [['log', 'A log on the Automations page, with Undo on each', 'kept 30 days'], ['as', 'Toasts only (as now)', '']] }
  ]},
  { group: 'Settings redesign', items: [
    { k: 'one', t: 'One Settings page for everything', why: 'Settings live in 9 places today; some appear in two or three.',
      vis: '<div class="v-st h-l">' + tile('Profile & settings', 3, 6) + tile('Person pop-over', 52, 4) + tile('App menu', 30, 24) + tile('Automations', 66, 26) + tile('Shop settings', 4, 44) +
        tile('Foreman settings', 44, 48) + tile('Warranty settings', 10, 68) + tile('Admin page', 62, 70) + tile('Edit templates', 36, 86) +
        '<div class="v-pg"><h5>Settings</h5>' + gr('Me', 'Photo, name, PIN, size, theme, tooltips, keys') + gr('The shop', 'Labor rate, pay period, shop day, bays, QC, warranty times') +
        gr('People & access', 'People, PINs, permissions, view as') + gr('Data', 'Folder, backups, phone, test data') + gr('Automations', 'Status sync, Parts → status, your rules') + '</div></div>',
      steps: [['scat', 1800], ['conv', 900], ['page', 2400]],
      opts: [['one', 'One page, every setting', 'the pop-overs on Manager, Foreman and Warranty go'], ['links', 'One page — the pop-overs stay as shortcuts', 'they open the same setting on the page']] },
    { k: 'groups', t: 'Group settings by who they’re for', why: 'Today’s sections (you, sign, look, data, tools, keys, admin) mix personal and shop-wide settings.',
      vis: '<div class="v-st"><div class="v-acc"><div class="v-ah a1"><b>Me</b><span>Photo, name, PIN, size, theme, tooltips, keys</span></div><div class="v-ah a2"><b>The shop</b><span>Labor rate, pay period, shop day, bays, QC</span></div>' +
        '<div class="v-ah a3"><b>People & access</b><span>People, PINs, permissions, view as</span></div><div class="v-ah a4"><b>Data</b><span>Folder, backups, phone, test data</span></div><div class="v-ah a5"><b>Automations</b><span>Status sync, Parts → status, your rules</span></div></div></div>',
      steps: [['g1', 700], ['g2', 700], ['g3', 700], ['g4', 700], ['g5', 700], ['all', 1800]],
      opts: [['who', 'By who it’s for', 'Me · The shop · People & access · Data · Automations'], ['page', 'By page', 'Time Log, RO, Manager, Foreman, Warranty…'], ['az', 'One A–Z list', '']] },
    { k: 'nav', t: 'A menu down the side', why: 'Today’s page is one long scroll with a row of jump links.',
      vis: '<div class="v-st"><div class="v-lay"><div class="v-menu"><span class="v-mi on">Me</span><span class="v-mi m2">The shop</span><span class="v-mi">People & access</span><span class="v-mi">Data</span><span class="v-mi">Automations</span><span class="v-mi">Keys</span></div>' +
        '<div class="v-pane"><div class="p1"><h6>Me</h6>' + kv('Name', 'Luis Martinez') + kv('Size', 'Medium') + kv('Theme', 'Ivory') + kv('Tooltips', 'On') + '</div>' +
        '<div class="p2"><h6>The shop</h6>' + kv('Labor rate', '$165 / h') + kv('Pay period', 'Every 2 weeks') + kv('Shop day', '07:00–17:30') + kv('Bays', '8') + '</div></div></div>' + CUR + '</div>',
      steps: [['idle', 900], ['p-sh', 700], ['c-sh', 500], ['shop', 2000]],
      opts: [['side', 'Menu down the side', 'a list first on a phone'], ['tabs', 'Tabs across the top', ''], ['long', 'One long page with a jump list (as now)', '']] },
    { k: 'search', t: 'Search settings', why: 'With settings in 9 places, finding one means knowing where it lives.',
      vis: '<div class="v-st h-s"><div class="v-sb">' + I_SRCH + '<span class="q"><span class="q0">Search settings</span><span class="q1">da</span><span class="q2">day</span></span></div>' +
        '<div class="v-drop"><div><span>Shop day</span><small>The shop</small></div><div><span>Day ribbon</span><small>Me</small></div><div><span>Backups · end of each day</span><small>Data</small></div></div>' +
        '<div class="v-row v-other"><b>Name</b><span class="m">Me</span><span class="sp"></span><span>Luis Martinez</span></div><div class="v-row v-other"><b>Size</b><span class="m">Me</span><span class="sp"></span><span>Medium</span></div>' +
        '<div class="v-row v-target"><b>Shop day</b><span class="m">The shop</span><span class="sp"></span><span>07:00–17:30</span></div>' + CUR + '</div>',
      steps: [['idle', 800], ['t1', 500], ['t2', 600], ['res', 900], ['p-r', 600], ['c-r', 500], ['jump', 2000]],
      opts: [['jump', 'Search, then jump to it with a highlight', ''], ['filter', 'Search filters the page', 'only matching settings stay']] },
    { k: 'who', t: 'Say who can change each setting, and where it shows', why: 'No setting says who can change it, so a tech can’t tell why one is greyed out.',
      vis: '<div class="v-st h-s"><div class="v-who2"><div class="lbl"><span class="v-t1">Seen as Frank · Manager</span><span class="v-t2">Seen as Luis · Technician</span></div>' +
        '<div class="v-set"><div class="hd"><b>Pay period</b><span class="val">Every 2 weeks</span><span class="v-lock">' + I_LOCK + '</span></div><div class="v-tags"><span>' + I_LOCK + 'Manager changes it</span><span>Applies to everyone</span><span>Shows on Time Log, Timesheet</span></div></div></div>' +
        '<div class="v-wtip">Only a manager can change this · ask Frank</div>' + CUR + '</div>',
      steps: [['mgr', 1800], ['tech', 2400]],
      opts: [['all', 'Who + where on every setting', ''], ['lock', 'Only explain the ones you can’t change', '']] },
    { k: 'dots', t: 'Mark what’s been changed, with Reset', why: 'There’s no way to see which settings differ from the start, or to put one back.',
      vis: '<div class="v-st h-s"><div class="v-row v-ch1"><b>Size</b><span class="sp"></span><span class="v-val"><span class="v-t1">Large</span><span class="v-t2">Medium</span></span><span class="v-dot"></span></div>' +
        '<div class="v-row"><b>Theme</b><span class="sp"></span><span>Graphite</span><span class="v-dot"></span></div><div class="v-row"><b>Tooltips</b><span class="sp"></span><span>On</span></div>' +
        '<div class="v-dtip"><span class="sp">Size · changed from Medium · Oct 12</span><span class="v-b">Reset</span></div>' + CUR + '</div>',
      steps: [['idle', 900], ['p-dot', 700], ['tip', 900], ['c-reset', 500], ['done', 1800]],
      opts: [['grp', 'Dots, Reset on each, and Reset a whole group', ''], ['dot', 'Dots only', '']] },
    { k: 'quick', t: 'The person pop-over: quick settings + a way in', why: 'Size is in 3 places today — the pop-over, the app menu and Appearance.',
      vis: '<div class="v-st h-l"><div class="v-pop"><div class="who"><span class="v-av">LM</span><span><b>Luis Martinez</b><small>Technician</small></span></div>' +
        '<div class="v-qr"><span>Size</span><span class="v-seg"><span>S</span><span class="on">M</span><span>L</span></span></div><div class="v-qr"><span>Tooltips</span><span class="v-seg"><span class="on">On</span><span>Off</span></span></div>' +
        '<div class="v-qr"><span>Theme</span><span class="v-seg"><span class="on">Ivory</span><span>Graphite</span></span></div><span class="lk">All settings…</span></div>' +
        '<div class="v-me"><h6>Me</h6>' + kv('Photo', 'LM') + kv('Name', 'Luis Martinez') + kv('PIN', '••••') + kv('Size', 'Medium') + kv('Theme', 'Ivory') + kv('Day ribbon', 'On') + '</div>' + CUR + '</div>',
      steps: [['pop', 1200], ['p-all', 700], ['c-all', 500], ['me', 2200]],
      opts: [['pop', 'Pop-over keeps Size, Tooltips, Theme + “All settings…”', 'Size leaves the app menu'], ['me', 'Move them into Me only', 'the pop-over just opens Settings']] },
    { k: 'history', t: 'Recently changed, with Undo', why: 'A shop-wide change (pay period, labor rate) is only in the Activity log, with no way back.',
      vis: '<div class="v-st h-s"><div class="v-log"><h6>Recently changed · 30 days</h6>' + lr('Oct 28', 'Frank · Pay period → Every 2 weeks', 'un') + lr('Oct 27', 'Sam · Warranty chase-after → 5 days') + lr('Oct 24', 'Luis · Size → Large') + '</div>' + CUR + '</div>',
      steps: [['rows', 1300], ['p-un', 700], ['c-un', 500], ['done', 2000]],
      opts: [['list', 'Recently changed list with Undo', 'at the top of Settings, last 30 days'], ['as', 'Activity log only (as now)', '']] }
  ]}
];
var NOW = '<div class="v-now"><div class="bad"><b>9</b>places with settings — Profile &amp; settings, the person pop-over, the app menu, Automations, Shop, Foreman and Warranty pop-overs, Admin, Edit templates</div>' +
  '<div class="bad"><b>3</b>places to change Size — Appearance, the app menu, the person pop-over</div>' +
  '<div><b>4</b>more things in 2 places each — Day ribbon, View as, folder &amp; backups, Automations</div>' +
  '<div class="bad"><b>0</b>search · 0 settings say who can change them</div>' +
  '<div><b>1</b>card left in Work tools — Automations (the Assistant is gone)</div>' +
  '<div><b>2</b>built-in automations left — Status sync, Parts → status · plus rules: 10 triggers · 9 conditions · 4 actions</div></div>';
