/* Parsec · ro-page · constants.js
   The RO page's constants: job types, status looks, task kinds.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   stLook stIcon taskDef JOB_TYPES JC_STATUS_LOOK JC_BAD_LOOK STATUSES TASKS C (3 functions, 6 constants)
   uses       ro/
*/
/* ============================ constants ============================ */

var JOB_TYPES = [
  { key:'DIAG',     hint:'Diagnostic time, codes, road test',   bg:'var(--jt-diag-bg)', fg:'var(--jt-diag)' },
  { key:'OP', label:'REPAIR', hint:'Standard repair operation',           bg:'var(--jt-op-bg)', fg:'var(--jt-op)' },
  { key:'PM',       hint:'Inspection, 74-point, wash, updates', bg:'var(--jt-pm-bg)', fg:'var(--jt-pm)' },
  { key:'WARR',     hint:'Warranty-covered operation',          bg:'var(--jt-warr-bg)', fg:'var(--jt-warr)' },
  { key:'COMEBACK', hint:'Reopened work, same unit / VIN',      bg:'var(--jt-comeback-bg)', fg:'var(--jt-comeback)' },
  { key:'SUBLET',   hint:'Sent out — tow, alignment, glass', bg:'var(--jt-sublet-bg)', fg:'var(--jt-sublet)' },
  { key:'RECALL',   hint:'Manufacturer recall / campaign',      bg:'var(--jt-recall-bg)', fg:'var(--jt-recall)' }
];

/* RO status: the TEC app's nine, dressed in this console's chip colours. */
function stLook(t, hint) { return { hint: hint, t: t, bg: 'var(--st-' + t + '-soft)', fg: 'var(--st-' + t + '-ink)', ink: 'var(--st-' + t + '-ink)', dot: 'var(--st-' + t + ')' }; }
var JC_STATUS_LOOK = {
  "Hold Tech":              stLook('hold', 'On the board, nothing being worked'),
  "Working":                stLook('ok',   'Being worked right now'),
  "Waiting – Parts":        stLook('wait', 'Held on a part that is out'),
  "Waiting – Sublet":       stLook('wait', 'Sent out to a sublet vendor'),
  "Waiting – Foreman":      stLook('wait', 'Held on the foreman'),
  "Waiting – Tech Support": stLook('tech', 'Case open with tech support'),
  "Waiting – Customer":     stLook('teal', 'Held on customer approval'),
  "Waiting – Approval":     stLook('teal', 'Operation waiting on approval'),
  "Waiting – New Job":      stLook('wait', 'Operation done for now, waiting for the next operation'),
  "Complete":               stLook('ok',   'Work done'),
  "Complete – Road test":   stLook('ok',   'Work done, road testing'),
  "Complete – Released":    stLook('ok',   'Finished and turned in'),
  "Declined":               stLook('hold', 'Customer declined the work')
};
var JC_BAD_LOOK = stLook('bad', 'Part backordered or late');
/* the small status icon: play = working, clock = waiting, triangle = late or a problem, pause = on hold */
function stIcon(look, cls, name) {
  var t = (name && /^Complete/.test(name)) ? 'done' : (look && look.t) || 'hold';
  var tone = t === 'done' ? 'ok' : t;
  return el('i', { class: 'stIc t-' + t + (cls ? ' ' + cls : ''), style: 'color:var(--st-' + tone + ')', 'aria-hidden': 'true' });
}
var STATUSES = RO_STATUS_OPTIONS.map(function (o) {
  var s = JC_STATUS_LOOK[o.status] || JC_STATUS_LOOK["Hold Tech"];
  return { key: o.status.toUpperCase(), name: o.status, hint: s.hint, bg: s.bg, fg: s.fg, dot: s.dot, ink: s.ink, t: s.t };
});

/* Every bar entry is ONE go at a task, so the same task can be logged again later. */
var TASKS = WF_TASKS;
function taskDef(id) { return TASKS.filter(function (t) { return t.id === id; })[0] || TASKS[0]; }

var C = { green:'#0E8A5F', bronze:'#8A5A12', amber:'#D97706', amberInk:'#A45308', red:'#D0271D', muted:'#606D7D' };
