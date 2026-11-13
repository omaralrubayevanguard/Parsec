/* Parsec · ro-page · state.js
   The RO page's state: R (shadow root), HOST, RO, S (per-RO UI state: open card, tabs, selection), mounting into the app's page, and the small date conversions.
   Flow: ensureHost() creates the shadow host once; render() (ro-page/render.js) draws RO into it.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ensureBandHost jcRoots jcQueryAll jcQuery mountBandControls redockBand r3 isoToMDY mdyToIso openList openCard isOpenCard … (30 functions, 16 constants)
   state      punches
   uses       access/ automations/ clock/ data/ kit/ ro/ shell/ state/
*/
/* ============================ state (lives in the TEC app) ============================ */

/* S is a live view over the selected TEC repair order: nothing is copied, every
   read and write lands on the RO, its operations and STATE.punches. */
var R = null, HOST = null, RO = null, S = null, lastKey = null;
/* The RO band's live controls live in the page header now, in a shadow root of their
   own so chipGroup, the options menu and the customer field keep working untouched
   and JC_CSS still applies to them. R2 is that root; every menu/detail helper below
   has to reach into both. */
var BAND_HOST = null, R2 = null, pendingRailBtn = null, pendingAddOpBtn = null, pendingRoBlock = null,
    pendingCust = null, pendingOpts = null, pendingTotals = null, pendingInfo = null;
function ensureBandHost() {
  if (BAND_HOST) return;
  BAND_HOST = document.createElement('div');
  BAND_HOST.className = 'jc-host jc-band-host';
  BAND_HOST.setAttribute('data-device', deviceMode());
  R2 = BAND_HOST.attachShadow({ mode: 'open' });
  R2.innerHTML = '<style>' + JC_CSS + JC_ZF + '</style><div class="bandDock" id="bandDock"></div>';
  R2.addEventListener('keydown', enterCommits);
}
/* Both shadow roots, for anything that has to sweep the whole console. */
function jcRoots() { return R2 ? [R, R2] : [R]; }
function jcQueryAll(sel) {
  var out = [];
  jcRoots().forEach(function (root) {
    if (!root) return;
    Array.prototype.forEach.call(root.querySelectorAll(sel), function (n) { out.push(n); });
  });
  return out;
}
function jcQuery(sel) { return jcQueryAll(sel)[0] || null; }
/* Put the controls in the header dock and keep them there across TEC redraws. */
function mountBandControls(controls) {
  ensureBandHost();
  var slot = R2.getElementById('bandDock');
  slot.innerHTML = '';
  if (controls) slot.appendChild(controls);
  redockBand();
}
function redockBand() {
  if (!BAND_HOST) return;
  var dock = document.getElementById('ro-band-dock');
  if (!dock) { if (BAND_HOST.parentNode) BAND_HOST.parentNode.removeChild(BAND_HOST); return; }
  if (BAND_HOST.parentNode !== dock) { dock.innerHTML = ''; dock.appendChild(BAND_HOST); }
}
var openMenu = null;

function r3(v) { return Math.round(num(v) * 1000) / 1000; }
function isoToMDY(iso) {
  if (!iso) return '';
  var d = new Date(iso); if (isNaN(d)) return '';
  return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '-' + d.getFullYear();
}
function mdyToIso(v) { var d = parseDate(v); if (!d) return null; d.setHours(12, 0, 0, 0); return d.toISOString(); }

function openList(ro) {
  if (!UI.roOpen || typeof UI.roOpen !== 'object') UI.roOpen = {};
  if (!Array.isArray(UI.roOpen[ro.id])) {
    var c = UI.roOp[ro.id]; if (c === undefined) c = ro.operations[0] ? ro.operations[0].id : null;
    UI.roOpen[ro.id] = c ? [c] : [];
  }
  return UI.roOpen[ro.id];
}
/* One operation card open at a time: opening this one closes whatever was open.
   Every path that expands a card goes through here — the header click, the stepper,
   the shortcuts, scroll-to-job — so they all behave the same way. */
function openCard(roId, id) {
  var ro = getRO(roId); if (!ro) return;
  var a = openList(ro);
  if (a.length === 1 && a[0] === id) return;
  a.length = 0; a.push(id);
}
function isOpenCard(job) { return !!RO && openList(RO).indexOf(job.id) > -1; }
function makeFacade(ro) {
  var r = {};
  function map(k, get, set) { Object.defineProperty(r, k, { get: get, set: set, enumerable: true }); }
  function plain(k, field) { map(k, function () { return ro[field] || ''; }, function (v) { ro[field] = v; }); }
  plain('ra', 'roNumber'); plain('customer', 'customerName'); plain('vin', 'vin'); plain('miles', 'mileage');
  plain('unit', 'unitNumber'); plain('tech', 'assignedTech'); plain('keyTag', 'keyTag'); plain('caseNo', 'caseNumber'); plain('location', 'location'); plain('engHours', 'engineHours'); plain('engType', 'engineType'); plain('complaint', 'caseComplaint');
  map('built', function () { return cdDayShow(ro.buildDate || ''); }, function (v) { ro.buildDate = cdDay(v); });   /* Parsec 16 */
  map('warrStart', function () { return cdDayShow(ro.warrantyStart || ''); }, function (v) { ro.warrantyStart = cdDay(v); }); plain('model', 'model');
  map('opened', function () { return isoToMDY(ro.dateOpened); },
      function (v) { var iso = mdyToIso(v); if (iso) ro.dateOpened = iso; });
  map('closed', function () { return isoToMDY(ro.dateClosed); },
      function (v) { ro.dateClosedAuto = false; if (!String(v).trim()) { ro.dateClosed = null; return; } var iso = mdyToIso(v); if (iso) ro.dateClosed = iso; });
  map('status', function () {
      var s = roStatus(ro).status, i = STATUSES.findIndex(function (x) { return x.name === s; });
      return i < 0 ? 0 : i;
    }, function (i) { if (STATUSES[i] && setRoStatus(ro.id, STATUSES[i].name, null) === false) setTimeout(tecRender, 0); });
  map('warranty', function () { return !!ro.warranty; }, function (v) { ro.warranty = !!v; });

  var s = { ro: r, ui: {} };
  if (!Array.isArray(ro.bulletins)) ro.bulletins = [];
  Object.defineProperty(s, 'jobs', { get: function () { return ro.operations; }, set: function (v) { ro.operations = v; } });
  Object.defineProperty(s, 'log', { get: function () { return ro.bulletins; }, set: function (v) { ro.bulletins = v; } });
  /* 'card' is the job you're on (stepper, quick add, shortcuts); 'open' is every card you've expanded. */
  Object.defineProperty(s.ui, 'card', {
    get: function () { var c = UI.roOp[ro.id]; return c === undefined ? (ro.operations[0] ? ro.operations[0].id : null) : c; },
    set: function (v) { UI.roOp[ro.id] = v; if (v) openCard(ro.id, v); }
  });
  Object.defineProperty(s.ui, 'open', { get: function () { return openList(ro); } });
  return s;
}

function jtIdx(job) {
  var k = opJobType(job);
  var i = JOB_TYPES.findIndex(function (t) { return t.key === k; });
  return i < 0 ? 1 : i;
}
function blankJob(type) {
  var t = JOB_TYPES[type === undefined ? 1 : type] || JOB_TYPES[1];
  return { id: 'op_' + uid(), jobType: t.key, complaint: '', quoted: 0, burnt: 0, work: '', parts: [],
           declined: false, isStandard: false, punchesCollapsed: false };
}
function blankPart() {
  var p = { id: 'pt_' + uid(), description: '', partNumber: '', eta: '', qty: '1', status: 'Not Ordered', statusChangedAt: nowIso() };
  var me = typeof partsMe === 'function' ? partsMe() : ''; if (me) p.salesman = me;   /* 17.5: a part added by someone in Parts is theirs */
  return p;
}
function partInHand(p) { return p.status === 'Received' || p.status === 'Installed'; }

/* The job's clock is the TEC app's running punch for it. */
function runningPunchOf(job) { return STATE.punches.filter(function (p) { return p.opId === job.id && !p.stop; })[0] || null; }
function runStartOf(job) { var p = runningPunchOf(job); return p ? new Date(p.start).getTime() : null; }
function punchesOf(job) {
  return STATE.punches.filter(function (p) { return p.opId === job.id; })
    .sort(function (a, b) { return new Date(a.start) - new Date(b.start); });
}
function defaultStartReason(job) {
  if (job.shop) return job.complaint;
  var t = opJobType(job);
  return t === 'DIAG' ? 'Diagnosing' : (t === 'PM' ? 'Inspecting – 74-point' : 'Repairing');
}
/* Stop whatever is running (anywhere in the shop) and credit its time to that job's Burnt. */
function stopClock(noCredit) {
  var p = runningPunch();   /* Parsec 12.7: your own clock */
  if (!p) return null;
  commitNoteDrafts();
  p.stop = nowIso();
  if (noCredit) p.burntCredited = true; else creditBurnt(p);
  return p;
}
function startClock(job) {
  commitNoteDrafts();
  ensureOnClock();
  STATE.punches.push({ id: 'pn_' + uid(), roId: RO.id, opId: job.id, start: nowIso(), stop: null,
                       startReason: defaultStartReason(job), stopReason: null, notes: '', by: punchByName() });
  markStatusFlip(RO);
}

function logEntry(taskId) {
  return { oid: uid(), task: taskId, done: false, fields: {}, place: '', files: [], at: nowIso(), tickedAt: null };
}

/* Tidies a sheet written by the standalone console (older sheets stored steps as a nine-key object). */
function normalizeSheet(o) {
  if (!Array.isArray(o.log)) {
    o.log = [];
    if (o.steps) {
      TASKS.forEach(function (t) {
        var st = o.steps[t.id];
        if (!st) return;
        var used = st.done || (st.place || '').trim() ||
          (Array.isArray(st.files) && st.files.length) ||
          (st.fields && Object.keys(st.fields).some(function (k) { return (st.fields[k] || '').trim(); }));
        if (!used) return;
        o.log.push({ oid: uid(), task: t.id, done: !!st.done, fields: st.fields || {},
          place: st.place || '', files: Array.isArray(st.files) ? st.files : [], at: nowIso(), tickedAt: null });
      });
    }
    delete o.steps;
  }
  o.log.forEach(function (e) {
    if (!e.oid) e.oid = uid();
    if (!e.fields) e.fields = {};
    if (!Array.isArray(e.files)) e.files = [];
    if (typeof e.place !== 'string') e.place = '';
  });
  (o.jobs || []).forEach(function (j) {
    if (!Array.isArray(j.parts)) j.parts = [];
    j.parts.forEach(function (p) {
      if (typeof p.eta !== 'string') p.eta = '';
      if (p.eta && !/^\d{4}-\d{2}-\d{2}$/.test(p.eta)) p.eta = '';
      if (!p.status) p.status = p.received ? 'Received' : 'Not Ordered';
    });
    if (!Array.isArray(j.punches)) j.punches = [];
  });
  if (!o.ro) o.ro = {};
}

var saveTimer = null;
function markSeen() { lastKey = keyFor(RO); }
function save(now) {
  clearTimeout(saveTimer);
  if (now) { scheduleSave(true); markSeen(); }
  else saveTimer = setTimeout(function () { scheduleSave(false); markSeen(); }, 350);
}

/* ============================ derived ============================ */

function liveBurnt(j) {
  var b = num(j.burnt), rs = runStartOf(j);
  if (rs) b += Math.max(0, Date.now() - rs) / 3600000;
  return b;
}

function jobCalc(j) {
  var q = num(j.quoted), b = liveBurnt(j);
  var lost = b - q;
  var eff = b > 0 ? (q / b) * 100 : null;
  return { q: q, b: b, lost: lost, eff: eff, sev: sevQB(q, b) };
}
function totals() {
  var q = 0, b = 0, qs = 0, lines = 0, recv = 0;
  S.jobs.forEach(function (j) {
    var jb = liveBurnt(j);
    q += num(j.quoted); b += jb; if (jb > 0) qs += num(j.quoted);
    (j.parts || []).forEach(function (p) { lines++; if (partInHand(p)) recv++; });
  });
  /* efficiency matches the RO list: quoted ÷ burnt on the jobs that have time on them */
  return { q: q, b: b, qs: qs, lines: lines, recv: recv, eff: b > 0 ? (qs / b) * 100 : null };
}
