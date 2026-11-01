/* Parsec · kit · tooltip-words.js
   The words of every tooltip: tipNorm(raw, ctx) rewrites a raw title into the house style (what it does, then the key; sentence case; no “Click to”), with TIPMAP for exact phrases and TIPPAT for patterns.
   Flow: kit/tooltip-engine.js calls window.tipNorm for every title / data-tip it shows; build/checks/tooltips.py runs every static tooltip through the same function.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   TIPMAP TIPPAT (2 constants)
*/
/* ============================== Parsec 14.9 (W) — the words of every tooltip ==============================
   tipNorm(raw, ctx) → null (no tip) or { t, d: [...], k: [...] }. The tooltip component (14.9 A) calls it for every
   title / data-tip it shows. ctx = { icon, disabled, label }.
   The rules (the user's picks): what it does, then the key · keys as chips (the component shows them on icon buttons
   only) · a title and a detail line where it helps · sentence case, no “Click to”, up to 60 characters in the title,
   no full stop on a one-liner, keys never in brackets, don't repeat the control's own label.
   TIPMAP rewrites the app's own tooltips one by one; TIPPAT does the families built with names and numbers;
   the generic rules clean up whatever's left. The build (build_v9zz149w.py) runs the same rules over every
   tooltip in the page and flags any that still break one (app/_tiplint.txt). */
var TIPMAP = {
  /* ---- one word, or a name that says nothing ---- */
  'Burnt': 'Burnt · hours clocked on this RO',
  'Quoted': 'Quoted hours',
  'Quote': 'Quoted hours',
  'Received': 'Received · the part is in the shop',
  'ETA': 'When the part is due in',
  'Close': 'Close it',
  'Copy': 'Copy to the clipboard',
  'Remove': 'Remove it',
  'Paused': 'The clock is paused',
  'Planned': 'Planned · the tech and bay are set',
  'Lunch': 'Lunch · off the clock',
  'Skill': 'The skill this job needs',
  'Options': 'More options',
  'More': 'More options',
  'Settings': 'Open the settings',
  'Send': 'Send the message',
  'Toggle': 'Turn it on or off',
  'Undo': 'Undo the last change',
  'Dismiss': 'Dismiss it',
  'Unassigned': 'No technician yet',
  'On the clock': 'On the clock now',
  'Always on': 'Always on · can’t be switched off',
  'Alert on': 'You get an alert when it changes',
  'Pinned to Overview': 'Pinned to the Overview',
  'Shop standard': 'The shop’s standard for this',
  'Bin label': 'Print the bin label',
  'Edit rule': 'Edit the rule',
  'Delete rule': 'Delete the rule',
  'Remove condition': 'Remove this condition',
  'Remove action': 'Remove this action',
  'Clear it': 'Clear the text',
  'Clear chat': 'Clear the conversation',
  'Bold': 'Bold#Ctrl B',
  'Italic': 'Italic#Ctrl I',
  'Underline': 'Underline#Ctrl U',
  'Strikethrough': 'Strike through',
  'Undo the last change': 'Undo the last change',
  'Swap the two': 'Swap the two',
  'Leave it as it is': 'Leave it as it is',
  'Tell again': 'Send the reminder again',
  'Mark a split': 'Mark a split on the timeline',
  'Who sees this': 'Who can see this',
  'Whose Career': 'Whose Career page to show',
  'P': 'Print#P',
  'T': 'Transfer#T',
  'Labor on the case': 'Labor on the warranty case',
  'Suggested for this RO': 'Suggested for this RO · from similar jobs',
  'Punch running': 'A punch is running',
  'Show everything': 'Show everything',
  'All keys': 'All the keyboard keys',
  'All the keys': 'All the keyboard keys',
  'Time on this RO · click for the breakdown': 'Time on this RO|Opens the breakdown by operation',
  'Parts on this RO · click for the list': 'Parts on this RO|Opens the list',
  'Files on this RO · click for the list': 'Files on this RO|Opens the list',
  'Time clocked on this operation': 'Time clocked on this operation',
  /* ---- “click to …” ---- */
  'Click to change': 'Change it',
  'Click to edit': 'Edit it',
  'Click to edit this part': 'Edit this part',
  'Click to edit this note': 'Edit this note',
  'Click to change your data folder': 'Change your data folder',
  'Click for RO details': 'Open the RO details',
  'RO details — click to open': 'Open the RO details',
  'Quoted hours — click to change': 'Change the quoted hours',
  'Part status — click to change': 'Change the part status',
  'Job type — click to change': 'Change the job type',
  'How this rule works for every RO — click to change': 'Change how this rule works|For every RO',
  'Double-click to rename': 'Rename|Double-click the name',
  'On the clock — click to stop': 'Stop the clock',
  /* ---- keys written four ways ---- */
  'Search repair orders ( / )': 'Search ROs#/',
  'Search repair orders': 'Search ROs',
  'Search your inbox (/)': 'Search your inbox#/',
  'Close the sidebar  [': 'Close the sidebar#[',
  'Search — RO, VIN, unit, customer or part  Ctrl K': 'Search everything|An RO, VIN, unit, customer or part#Ctrl K',
  'Find an RO — number, VIN, unit, customer or part (Ctrl+K)': 'Find an RO|By number, VIN, unit, customer or part#Ctrl K',
  'Fold the list — the page gets the whole width ( ] )': 'Fold the list|The page gets the whole width#]',
  'Snooze (S)': 'Snooze until tomorrow 07:00#S',
  'Snooze  (S)': 'Snooze until tomorrow 07:00#S',
  'Done (Ctrl ↵)': 'Done · take it off the list#Ctrl ↵',
  'Done (E)': 'Done · take it off the list#E',
  'Start (Enter)': 'Start the clock#↵',
  'Stop (S)': 'Stop the clock#S',
  'Put it on hold (H)': 'Put it on hold#H',
  'Tick to plan together  (X)': 'Plan these together#X',
  'Copy for the claim  (C)': 'Copy for the claim#C',
  'Print the packet  (P)': 'Print the packet#P',
  'Print (P)': 'Print the RO#P',
  'Print or save as PDF (P)': 'Print or save as PDF#P',
  'Transfer (T)': 'Transfer to another tech#T',
  'Set status (S)': 'Set the status#S',
  'Add operation (O)': 'Add an operation#O',
  'Add operation': 'Add an operation',
  'Previous RO (K)': 'Previous RO#K',
  'Next RO (J)': 'Next RO#J',
  'Close (Esc)': 'Close#Esc',
  'Clear (Esc)': 'Clear#Esc',
  'Not yet (Esc)': 'Not yet#Esc',
  'Exit display (Esc)': 'Leave the TV display#Esc',
  'Shrink back (Esc)': 'Shrink back#Esc',
  'Back to the list (Esc)': 'Back to the list#Esc',
  'Day before (←)': 'Day before#←',
  'Day after (→)': 'Day after#→',
  'Edit (E)': 'Edit the punch#E',
  'Edit — the start, stop it earlier, the reason, the operation (E)': 'Edit the punch|The start, an earlier stop, the reason, the operation#E',
  'Add a punch or a clock segment (A)': 'Add a punch or a clock in / out#A',
  'Check in a delivery (C)': 'Check in a delivery#C',
  'Add a fix by hand (A)': 'Add a fix by hand#A',
  'New part (N)': 'New part#N',
  'Compare with the period before (C)': 'Compare with the period before#C',
  'The same days last year (C)': 'Compare with the same days last year#C',
  'Period (D · W · M · Q · Y · A)': 'Change the period|Day, week, month, quarter, year or all#D W M Q Y A',
  'Period (D · W · M · Q · Y)': 'Change the period|Day, week, month, quarter or year#D W M Q Y',
  'Show on the yard  ⇧↵': 'Show it on the yard#⇧ ↵',
  'Dictate — talk, then Enter to save': 'Dictate|Talk, then Enter saves it',
  /* ---- over 60 characters: a title and a detail line ---- */
  'Clock off for an hour — no clock-in by itself, Parsec reminds you when it’s up': 'Lunch · 1 hour|No clock-in by itself — Parsec reminds you when it’s up',
  'Note on this punch — Enter or Save adds it; it also saves itself when you change page or the clock changes': 'A note on this punch|Enter or Save adds it · it saves itself when you leave',
  'Saves a note on this operation without clocking on. It goes into the timeline at the time you save it.': 'Save a note without the clock|It goes into the timeline at the time you save it',
  'Write a complaint · cause · correction paragraph for warranty claims and triage, from this operation and similar past operations': 'Write the complaint · cause · correction|For warranty and triage, from this and similar past jobs',
  'Type part number, quantity (x2), description and price ($45.99) in any order, then press Enter': 'Add a part in one line|Part number, quantity (x2), description, price ($45.99) — any order, then Enter',
  'Copy the work performed as one paragraph, without the date and time stamps': 'Copy the work performed|One paragraph, without the date and time stamps',
  'Complete and release the truck without the truck checks — asks why': 'Complete and release|Skips the truck checks · asks why',
  'Import from ASIST — paste or drop the case, it shows what changes': 'Import from ASIST|Paste or drop the case · it shows what changes first',
  'Every visit, repeat repairs, miles and hours — on the Assets page': 'Open this truck on Assets|Every visit, repeat repairs, miles and hours',
  'Filled in from an earlier fix of the same operation — open that RO': 'Filled in from an earlier fix|Open that RO',
  'See the causes and fixes from earlier operations like this': 'Earlier causes and fixes|From operations like this one',
  'Every RO field: tech, engine, key tag, case #, dates, location': 'All the RO details|Tech, engine, key tag, case #, dates, location',
  'Burnt hours on this RO, by operation — the tick is the quote': 'Burnt hours by operation|The tick is the quote',
  'Set what each bay has — pit, lift, crane, exhaust hose, alignment rack': 'Set what each bay has|Pit, lift, crane, exhaust hose, alignment rack',
  'Suggest a tech and a bay for each, then assign them at once': 'Suggest a tech and a bay for each|Then assign them all at once',
  'Warranty settings — deadlines, chase-after times, coverage terms': 'Warranty settings|Deadlines, chase-after times, coverage terms',
  'Shop settings — labor rate, pay period, overhead, PIN, folder': 'Shop settings|Labor rate, pay period, overhead, PIN, folder',
  'Foreman settings — shop day, bay types, QC, the badge': 'Foreman settings|Shop day, bay types, QC, the badge',
  'Parts setup — suppliers, bins, returns, rules': 'Parts setup|Suppliers, bins, returns, rules',
  'New repair order — paste or scan a case, estimate or RO': 'New repair order|Paste or scan a case, an estimate or an RO',
  'Payment statement — mark several claims paid at once': 'Payment statement|Mark several claims paid at once',
  'Complaint · cause · correction — warranty & triage draft': 'Complaint · cause · correction|A draft for warranty and triage',
  'Extract operations — paste text, or read screenshots / a PDF': 'Extract operations|Paste text, or read a screenshot or PDF',
  'Extract operations from text or a screenshot': 'Extract operations|From text or a screenshot',
  'Search complaint, cause, code, part # or VIN': 'Search fixes|Complaint, cause, code, part # or VIN',
  'Search — RO, unit, customer, VIN or spot': 'Search the yard|RO, unit, customer, VIN or spot',
  'Search — RO, claim #, VIN, customer or code': 'Search claims|RO, claim #, VIN, customer or code',
  'Your own time — a technician sees only their own log': 'Your own time|A technician sees only their own log',
  'Opens the operation on the RO page — add the part there': 'Open the operation on the RO page|Add the part there',
  'Dismiss — you’ll be told again if it comes back': 'Dismiss|You’re told again if it comes back',
  'Read screenshots of the case (you can pick several)': 'Read screenshots of the case|You can pick several',
  'Read Parsec Mobile’s QR codes with the webcam': 'Read Parsec Mobile’s QR codes|With the webcam',
  'Op code, VMRS and price code go into the operation’s notes': 'Op code, VMRS and price code|They go into the operation’s notes',
  'ASIST’s approval — shown only, the status stays': 'ASIST’s approval|Shown only · the status stays',
  'ASIST’s approval — shown only, it doesn’t change the status': 'ASIST’s approval|Shown only · it doesn’t change the status',
  'ASIST’s approval — shown only': 'ASIST’s approval|Shown only',
  'Reopen it — back to Hold tech, the clock stays off': 'Reopen it|Back to Hold tech · the clock stays off',
  'Fix the start — forgot to clock on?': 'Fix the start|Forgot to clock on?',
  'Focus mode — the big view': 'Focus mode · the big view',
  'Done — take it off the list': 'Done · take it off the list',
  'Away — who covers your asks': 'Away · who covers your asks',
  'Inbox — what’s sent to you': 'Inbox · what’s sent to you',
  'Min — reorder below this': 'Minimum · reorder below this',
  'Max — order up to this': 'Maximum · order up to this',
  'Add a person — name, role and PIN': 'Add a person|Name, role and PIN',
  'Add a person — they get a temporary PIN': 'Add a person|They get a temporary PIN',
  'Shift handover — what the next shift needs': 'Shift handover|What the next shift needs',
  'Move the truck to an open bay — or drag it on the floor': 'Move the truck to an open bay|Or drag it on the floor',
  'Sublet, shop supplies or anything else charged on this operation': 'Other charges|Sublet, shop supplies or anything else on this operation',
  'Filed, approved or appealed — not paid yet': 'Filed, approved or appealed|Not paid yet',
  'Road test — send someone or log the result': 'Road test|Send someone or log the result',
  'New repair order': 'New repair order',
  'Efficiency — quoted ÷ clocked': 'Efficiency|Quoted ÷ clocked',
  'RO efficiency: quoted ÷ burnt': 'RO efficiency|Quoted ÷ burnt',
  'Quoted ÷ burnt, on the operations that have time on them': 'RO efficiency|Quoted ÷ burnt, on operations with time on them',
  'Same truck within a year, with a similar complaint': 'A repeat repair|Same truck within a year, a similar complaint',
  'Restored after a refresh — not saved yet': 'Restored after a refresh|Not saved yet',
  'Clock is running — stop it to edit': 'Stop the clock to edit it',
  'Stopped earlier? Set the time it stopped': 'Stopped earlier?|Set the time it stopped',
  'Clock off for a 30-minute lunch': 'Lunch · 30 minutes',
  'Clock off for a 30-minute lunch — the job stops for lunch': 'Lunch · 30 minutes|The job stops for lunch',
  'Lunch, home, end of day, an appointment…': 'Clock out|Lunch, home, end of day, an appointment',
  'Someone else — the login page': 'Someone else|Opens the login page',
  'Labor on this operation is worked out at this rate, not the shop’s': 'Labor rate for this operation|Not the shop’s rate',
  'Title|line under it': 'Title|line under it',
  /* ---- small fixes ---- */
  'Delete this operation?': 'Delete this operation',
  'Why did it stop?': 'Why it stopped',
  'What are you starting?': 'What you’re starting',
  'Pick “Save as PDF” in the print window': 'Save as PDF|Pick “Save as PDF” in the print window',
  'Price of one part, in dollars': 'Price of one part · dollars',
  'Duration (hours:minutes)': 'Duration · hours:minutes',
  'Key tag with QR code': 'Print the key tag|With its QR code',
  'Pick from list': 'Pick from the list',
  'Change status': 'Change the status',
  'Change names on the Settings page': 'Names change on the Settings page',
  'Only the Admin changes the Admin PIN': 'Only the Admin can change the Admin PIN',
  'Take it off': 'Take it off',
  'Which build of the page this is': 'Which build of Parsec this is',
  'Generate 25 sample repair orders': 'Make 25 sample repair orders',
  'Not stored in this browser': 'Not stored in this browser',
  'Only in this browser so far': 'Only in this browser so far',
  'In the shop now · ': 'In the shop now',
  'Parts on this operation: ': 'Parts on this operation',
  'Parts: ': 'Parts',
  'Operation status: ': 'Operation status',
  'Warranty claim readiness ': 'Warranty claim readiness',
  'Turned late while you were away': 'Turned late while you were away',
  'View, rename and delete files in a large window': 'Manage the files|View, rename and delete them in a large window',
  'The first picture in this RO\'s Pictures': 'The RO’s first picture',
  'For the TV on the shop floor': 'TV display|For the TV on the shop floor',
  'Truck & photos': 'Truck & photos',
  'Edit part': 'Edit the part',
  'Remove part': 'Remove the part',
  'Copy number': 'Copy the number',
  'Import, download': 'Import or download',
  'Start time': 'When it started',
  'Stop time': 'When it stopped',
  'Move time to someone else': 'Move time to someone else',
  'See the app the way an employee does': 'View as an employee',
  'See the app the way this person does': 'View as this person'
};
/* families built with names and numbers: [regex, template] — $1… are the regex groups */
var TIPPAT = [
  [/^(.+?) — click to start the clock anyway$/, 'Start the clock anyway|$1'],
  [/^(.+?) — click to change it$/, 'Change the complaint|$1'],
  [/^(.+?) — double-click to change it$/, 'Change the complaint|Double-click · $1'],
  [/^(.+?) · click to stop the punch$/, 'Stop the punch|$1'],
  [/^click to stop the punch$/i, 'Stop the punch'],
  [/^On the clock since (.+?) · click to clock out$/, 'Clock out|On the clock since $1'],
  [/^Clock on: (.+)$/, 'Start the clock|$1'],
  [/^(.+?) — click for (.+)$/, '$1|Switch to $2'],
  [/^(.+?)\s+\(\s*\/\s*\)$/, '$1#/'],
  [/^Open the sidebar\s+\[$/, 'Open the sidebar#['],
  [/^(.+?) \((\d)\)$/, '$1#$2'],
  [/^Start the clock on Op (\d+)$/, 'Start the clock · Op $1'],
  [/^Stop the clock on Op (\d+)$/, 'Stop the clock · Op $1'],
  [/^Open RO (.+)$/, 'Open RO $1'],
  [/^Switch to (.+)$/, 'Switch to $1'],
  [/^Labor on this operation is worked out at this rate, not the shop’s (.+)$/, 'Labor rate for this operation|Not the shop’s $1'],
  [/^(.+?) — profile, theme, settings(, log out)?$/, '$1|Profile, theme, settings$2']
];
(function(){
  var KEYW = { enter: '↵', return: '↵', '↵': '↵', esc: 'Esc', escape: 'Esc', ctrl: 'Ctrl', control: 'Ctrl', alt: 'Alt', option: 'Alt', shift: '⇧', '⇧': '⇧', cmd: '⌘', command: '⌘', '⌘': '⌘', tab: 'Tab', space: 'Space', del: 'Del', delete: 'Del', backspace: '⌫',
    '←': '←', '→': '→', '↑': '↑', '↓': '↓', left: '←', right: '→', up: '↑', down: '↓', '/': '/', '[': '[', ']': ']', '?': '?', f2: 'F2', home: 'Home', end: 'End' };
  /* one written key → its chip; null when it isn't a key */
  function key1(s){ s = String(s).trim(); if(!s) return null; var lo = s.toLowerCase(); if(KEYW[lo]) return KEYW[lo];
    if(/^[a-z0-9]$/i.test(s)) return s.toUpperCase(); if(/^f\d{1,2}$/i.test(s)) return s.toUpperCase(); return null; }
  /* “Ctrl+K”, “Ctrl ↵”, “⇧↵”, “D · W · M”, “/” → chips; null when any part isn't a key */
  function keys(s){ s = String(s).trim().replace(/\s*\+\s*/g, ' ').replace(/\s*·\s*/g, ' ').replace(/⇧(?=\S)/g, '⇧ ').replace(/(\S)↵/g, '$1 ↵');
    if(!s) return null; var out = []; var parts = s.split(/\s+/); for(var i = 0; i < parts.length; i++){ var k = key1(parts[i]); if(!k) return null; out.push(k); } return out.length && out.length <= 7 ? out : null; }
  /* pull a key hint off the end of a line, in any of the ways the app writes them */
  function pullKeys(t){ var m, k;
    if((m = /^(.*?)\s*\(\s*([^()]{1,24}?)\s*\)\s*$/.exec(t)) && (k = keys(m[2]))) return [m[1], k];
    if((m = /^(.*?)\s*\[\s*([^\[\]]{1,12}?)\s*\]\s*$/.exec(t)) && (k = keys(m[2]))) return [m[1], k];
    if((m = /^(.*?)\s{2,}(\S.{0,14})$/.exec(t)) && (k = keys(m[2]))) return [m[1], k];
    if((m = /^(.*?)\s+[—–-]\s+((?:Ctrl|Alt|Shift|⌘|Cmd)\s*\+\s*\S+)$/i.exec(t)) && (k = keys(m[2]))) return [m[1], k];
    return [t, []]; }
  var KEEP = /^(RO|ROs|VIN|VINs|ASIST|DTC|DTCs|Decisiv|Parsec|Op|PIN|PDF|CSV|QR|KPI|KPIs|TV|ETA|QC|VMRS|SPN|FMI|ID|OK|AM|PM|USB|Volvo|Mack|Triage|Foreman|Manager|Admin|Parts|Fixes|Assets|Inventory|Career|Warranty|Overview|Mobile|I|Esc|Ctrl|Alt|Tab|Enter)$/;
  
  /* Title Case → sentence case, keeping names, codes and acronyms */
  function sentence(t){ var w = t.split(/\s+/), caps = 0, n = 0; w.forEach(function(x, i){ if(!/^[A-Za-z]/.test(x)) return; n++; if(/^[A-Z][a-z]/.test(x) && (i > 0 || true)) caps++; });
    if(n < 3 || caps < n * 0.75) return t;
    return w.map(function(x, i){ if(i === 0 || !/^[A-Z][a-z]+[’']?[a-z]*[.,:;!?]?$/.test(x)) return x; var core = x.replace(/[.,:;!?]$/, ''); if(KEEP.test(core)) return x; return x.toLowerCase(); }).join(' '); }
  var OPEN = /^(?:click|tap|press|double-click|double-tap)\s+(?:here\s+)?(?:to|for)\s+/i, TAIL = /\s*[—–·,-]\s*(?:click|tap)\s+(?:here\s+)?(?:to|for)\s+[^|]*$/i;
  function cap(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function clean(line, isDetail){ var t = String(line).replace(/\s+/g, ' ').trim(); if(!t) return t;
    if(isDetail && t.charAt(0) === '~'){ var r = clean(t.slice(1), true); if(r === 'Clear') r = 'Clear the filter'; return r ? '~' + r : ''; }
    if(isDetail && t.indexOf('::') > -1) return t;                                 /* a “label::value” row stays as it is */
    t = t.replace(OPEN, function(){ return ''; }); t = cap(t);
    if(!isDetail) t = t.replace(TAIL, '');
    if(!/\.\.\.$|…$/.test(t) && (!isDetail || !/\.\s+\S/.test(t))) t = t.replace(/\s*\.$/, '');
    if(!isDetail) t = sentence(t);
    return t.trim(); }
  function same(a, b){ var f = function(x){ return String(x || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }; return !!f(a) && f(a) === f(b); }
  /* the title gets ≤ 60 characters; the rest moves to a detail line */
  function split60(t){ var dj = t.indexOf(' — ');   /* a dash in a one-liner: what it does, then the why on the line under it */
    if(dj > 1 && t.length > 24 && t.slice(dj + 3).trim().split(/\s+/).length >= 2) return [t.slice(0, dj).trim(), cap(t.slice(dj + 3).trim())];
    if(t.length <= 60) return [t, null];
    var seps = [' — ', ' – ', '. ', ': ', ' · ', '; ', ', '];
    for(var i = 0; i < seps.length; i++){ var j = t.indexOf(seps[i]); if(j > 8 && j <= 60) return [t.slice(0, j).trim(), cap(t.slice(j + seps[i].length).trim())]; }
    return [t, null]; }
  window.tipNorm = function(raw, ctx){
    ctx = ctx || {}; var s = String(raw == null ? '' : raw).replace(/ /g, ' ').trim(); if(!s) return null;
    var hit = Object.prototype.hasOwnProperty.call(TIPMAP, s) ? TIPMAP[s] : null, mk = null;
    if(hit == null){ var s1 = s.replace(/\s+/g, ' '); if(Object.prototype.hasOwnProperty.call(TIPMAP, s1)) hit = TIPMAP[s1]; }
    if(hit == null){ var head = s.split('|')[0], rest = s.slice(head.length); for(var i = 0; i < TIPPAT.length; i++){ var m = TIPPAT[i][0].exec(head); if(m){ hit = head.replace(TIPPAT[i][0], TIPPAT[i][1]) + rest; break; } } }
    var src = hit != null ? hit : s;
    var hash = src.lastIndexOf('#'); if(hit != null && hash > -1){ mk = keys(src.slice(hash + 1)); if(mk) src = src.slice(0, hash); }
    var L = src.split('|'), t = L[0], d = L.slice(1), k = mk || [];
    if(!mk){ var pk = pullKeys(t.trim()); t = pk[0]; k = pk[1]; }
    t = clean(t, false);
    if(!t && d.length){ t = clean(d.shift(), false); }
    var sp = split60(t); t = sp[0]; if(sp[1]) d.unshift(sp[1]);
    d = d.map(function(x){ return clean(x, true); }).filter(function(x){ return x && x !== '~'; });
    if(!t) return null;
    if(ctx.label && same(t, ctx.label) && !d.length && (!k.length || !ctx.icon)) return null;
    return { t: t, d: d, k: k };
  };
  window.TIPMAP = TIPMAP; window.TIPPAT = TIPPAT;
  window.tipNormRaw = function(raw){ var r = window.tipNorm(raw, {}); return r ? r.t + (r.d.length ? '|' + r.d.join('|') : '') + (r.k.length ? '#' + r.k.join(' ') : '') : ''; };
})();
