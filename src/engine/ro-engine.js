
// ro-math.js
// RO completion math for the diesel repair workflow.
// Pure functions: no screen code, no database, no network. Every number the
// board shows (percent, ready time, forecast, pace, quote accuracy, customer
// wait) comes from here, so it can be tested on its own (see ro-math.test.js).
//
// One file, two uses:
//   Node:     const M = require('./ro-math.js')      (the tests)
//   Browser:  a script tag for ro-engine.js         -> window.RoMath  (TEC)
// TEC's ro-engine.js is a straight copy of this file.
//
// Times are shop-local wall-clock strings 'YYYY-MM-DDTHH:MM' (no time zone)
// or epoch minutes. Durations are shop minutes: only time inside shop hours
// on work days counts, and lunch does not count.

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RoMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ======================================================================
   * 1. SHOP CALENDAR
   * ==================================================================== */

  // Generic 07:00-17:00, no lunch. The hand-worked tests use this one.
  const DEFAULT_CALENDAR = Object.freeze({
    dayStart: 7 * 60,          // 07:00
    dayEnd: 17 * 60,           // 17:00
    workDays: [1, 2, 3, 4, 5], // Mon..Fri (0 = Sun)
    holidays: [],              // ['2026-11-26', ...]
    breaks: [],                // [[start, end], ...] minutes after midnight
  });

  // The shop: in 07:00, lunch 11:30-12:30, out 16:00. 8 work hours a day. TEC uses this.
  const SHOP_CALENDAR = Object.freeze({
    dayStart: 7 * 60,
    dayEnd: 16 * 60,
    workDays: [1, 2, 3, 4, 5],
    holidays: [],
    breaks: [[11 * 60 + 30, 12 * 60 + 30]],
  });

  function toMin(t) {
    if (typeof t === 'number') return t;
    const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(String(t));
    if (!m) throw new Error('Bad time: ' + t);
    return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) / 60000;
  }

  function fmt(min) {
    return new Date(min * 60000).toISOString().slice(0, 16);
  }

  const dow = (day) => (((day + 4) % 7) + 7) % 7; // epoch day 0 was a Thursday

  const CTX = new WeakMap();
  function ctx(cal) {
    if (cal && CTX.has(cal)) return CTX.get(cal);
    const c = { ...DEFAULT_CALENDAR, ...(cal || {}) };
    if (c.dayEnd <= c.dayStart) throw new Error('dayEnd must be after dayStart');
    // The work windows inside one day: the day minus its breaks.
    const br = (c.breaks || [])
      .map(([s, e]) => [Math.max(s, c.dayStart), Math.min(e, c.dayEnd)])
      .filter(([s, e]) => e > s)
      .sort((a, b) => a[0] - b[0]);
    const segs = [];
    let cur = c.dayStart;
    for (const [s, e] of br) { if (s > cur) segs.push([cur, s]); cur = Math.max(cur, e); }
    if (c.dayEnd > cur) segs.push([cur, c.dayEnd]);
    const x = {
      c,
      segs,
      len: segs.reduce((t, [s, e]) => t + e - s, 0),
      wd: new Set(c.workDays),
      hol: new Set((c.holidays || []).map((d) => Math.floor(toMin(d + 'T00:00') / 1440))),
    };
    if (cal && typeof cal === 'object') CTX.set(cal, x);
    return x;
  }

  const isWork = (day, x) => x.wd.has(dow(day)) && !x.hol.has(day);

  function workdaysBefore(day, x) {
    const weeks = Math.floor(day / 7);
    let n = weeks * x.wd.size;
    for (let d = weeks * 7; d < day; d++) if (x.wd.has(dow(d))) n++;
    for (const h of x.hol) if (h < day && x.wd.has(dow(h))) n--;
    return n;
  }

  /** Work minutes from the start of the day to minute-of-day mm (breaks left out). */
  function clockToWork(mm, x) {
    let w = 0;
    for (const [s, e] of x.segs) if (mm > s) w += Math.min(mm, e) - s;
    return w;
  }

  /** Minute-of-day for w work minutes into the day. preferEnd lands on the end of a window, not the start of the next. */
  function workToClock(w, x, preferEnd) {
    for (const [s, e] of x.segs) {
      const L = e - s;
      if (w < L || (preferEnd && w === L)) return s + w;
      w -= L;
    }
    return x.segs[x.segs.length - 1][1];
  }

  /** Shop minutes from a fixed origin to t. Off-hours and lunch collapse to the nearest work edge. */
  function shopIndex(t, cal) {
    const x = ctx(cal);
    const m = toMin(t);
    const day = Math.floor(m / 1440);
    const inDay = isWork(day, x) ? clockToWork(m - day * 1440, x) : 0;
    return workdaysBefore(day, x) * x.len + inDay;
  }

  /** Wall-clock minute for a shop index. preferEnd puts a boundary at 16:00 (or 11:30), not the next start. */
  function fromShopIndex(i, cal, preferEnd = false) {
    const x = ctx(cal);
    let n = Math.floor(i / x.len);
    let rem = i - n * x.len;
    if (preferEnd && rem === 0 && n > 0) { n -= 1; rem = x.len; }
    let hi = 1;
    while (workdaysBefore(hi, x) <= n) hi *= 2;
    let lo = 0;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (workdaysBefore(mid + 1, x) >= n + 1) hi = mid; else lo = mid + 1;
    }
    return lo * 1440 + workToClock(rem, x, preferEnd);
  }

  const shopMinutesBetween = (a, b, cal) => Math.max(0, shopIndex(b, cal) - shopIndex(a, cal));
  const addShopMinutes = (t, mins, cal) => fromShopIndex(shopIndex(t, cal) + mins, cal, true);
  const shiftLength = (cal) => ctx(cal).len;

  /* ======================================================================
   * 2. STANDARDS AND CHECKLISTS
   * Standards are versioned. An RO keeps the version it was opened with, so a
   * new version never changes the percent on trucks already in the shop.
   * ==================================================================== */

  const STANDARDS_V1 = Object.freeze({
    version: 'v1-defaults',
    booking: 20, checkin: 20, dispatch: 10, review: 10, approval: 15,
    parts: 20, closeout: 20, pickup: 0,
    roadtest: Object.freeze({ light: 30, medium: 45, heavy: 60 }),
  });

  // Step weights per item kind. Progress inside an item = weight of finished steps.
  // Steps can finish in any order ('check' events) or front to back ('step' events).
  const STEPS = Object.freeze({
    booking: [1, 1, 1, 1, 1],          // customer, unit/VIN, complaints, PO/limit, recall/warranty check
    checkin: [1, 1, 1, 1],             // readout, photos, location, RO opened
    dispatch: [1, 1],                  // review RO, assign bay/tech
    review: [1, 1],                    // review tech notes, route RO
    diag: [5, 15, 25, 25, 10, 20],     // clock on, verify, codes, pinpoint, tech story, cause
    extra: [80, 20],                   // extra diagnosis, findings written
    approval: [1, 1, 1],               // review, estimate sent, customer answered
    parts: [1, 1, 1],                  // looked up/added, in hand, tagged/delivered
    repair: [5, 20, 30, 15, 10, 15, 5],// parts at bay, teardown, repair, reassemble, verify, story, clock off
    fix: [60, 25, 15],                 // fix, verify, tech story
    roadtest: [1, 1, 1],               // drive, no codes, no leaks/noise
    closeout: [4, 4, 4, 3, 5],         // 3C, docs/photos, codes, customer, cores/old parts
    pickup: [1],                       // paid, keys released
  });

  const STAGE_OF = Object.freeze({
    booking: 'booking', checkin: 'checkin', dispatch: 'dispatch', review: 'dispatch',
    diag: 'diag', extra: 'diag', approval: 'approval', parts: 'parts',
    repair: 'repair', fix: 'repair', roadtest: 'roadtest', closeout: 'closeout', pickup: 'pickup',
  });

  // Who does the work. Tech items share one tech's day; office items run beside them.
  const TECH_KINDS = new Set(['diag', 'extra', 'repair', 'fix', 'roadtest']);
  // Quoted work: the tech's pace speeds it up or slows it down. Standards stay as they are.
  const PACED_KINDS = new Set(['diag', 'extra', 'repair', 'fix']);
  // Clocked time moves these items forward even when nobody ticks a step,
  // up to LABOR_CAP; the last part needs the job marked done.
  const LABOR_KINDS = new Set(['diag', 'extra', 'repair', 'fix', 'roadtest']);
  const LABOR_CAP = 0.9;

  const PAY_TYPES = ['customer', 'warranty', 'recall', 'internal'];

  /* ======================================================================
   * 3. BUILDING AND CHANGING AN RO
   * ==================================================================== */

  const hrsToMin = (h) => Math.round((Number(h) || 0) * 60);
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  const needsApproval = (j) => j.payType === 'customer' && j.status === 'active';

  function roadMin(std, severity) {
    const m = std.roadtest[severity || 'light'];
    if (m == null) throw new Error('Unknown road test severity: ' + severity);
    return m;
  }

  function addItem(ro, kind, o = {}) {
    const it = {
      id: kind + '-' + (++ro.seq),
      kind, stage: STAGE_OF[kind], job: o.job || null,
      min: o.min, weights: STEPS[kind], done: 0, checks: [], labor: 0, crew: 1,
      extra: !!o.extra, voided: false, voidReason: null,
    };
    ro.items.push(it);
    return it;
  }

  function normJob(j) {
    if (!PAY_TYPES.includes(j.payType || 'customer')) throw new Error('Unknown pay type: ' + j.payType);
    const diag = j.payType === 'recall' ? 0 : hrsToMin(j.diagHrs);
    const repair = hrsToMin(j.repairHrs);
    return {
      id: j.id, name: j.name || j.id, payType: j.payType || 'customer', needsParts: !!j.needsParts, status: 'active',
      quote: { diag: { original: diag, current: diag }, repair: { original: repair, current: repair } },
    };
  }

  /**
   * Open an RO. spec = { id, walkIn, roadTest: 'light'|'medium'|'heavy',
   *   jobs: [{ id, name, payType, diagHrs, repairHrs, needsParts }] }
   * Split billing: one job per pay type (e.g. warranty part of a repair is its own job).
   */
  function openRO(spec, std = STANDARDS_V1) {
    const ro = { id: spec.id, std, stdVersion: std.version, status: 'open', jobs: [], items: [], holds: [], seq: 0, log: [] };
    if (!spec.walkIn) addItem(ro, 'booking', { min: std.booking });
    addItem(ro, 'checkin', { min: std.checkin });
    addItem(ro, 'dispatch', { min: std.dispatch });
    for (const j of spec.jobs) ro.jobs.push(normJob(j));
    for (const j of ro.jobs) if (j.quote.diag.current > 0) addItem(ro, 'diag', { job: j.id, min: j.quote.diag.current });
    if (ro.jobs.some(needsApproval)) addItem(ro, 'approval', { min: std.approval });
    for (const j of ro.jobs) if (j.needsParts) addItem(ro, 'parts', { job: j.id, min: std.parts });
    for (const j of ro.jobs) addItem(ro, 'repair', { job: j.id, min: j.quote.repair.current });
    addItem(ro, 'roadtest', { min: roadMin(std, spec.roadTest) });
    addItem(ro, 'closeout', { min: std.closeout });
    addItem(ro, 'pickup', { min: std.pickup });
    return ro;
  }

  const findItem = (ro, id) => {
    const it = ro.items.find((i) => i.id === id);
    if (!it) throw new Error('No item ' + id + ' on ' + ro.id);
    return it;
  };
  const findJob = (ro, id) => {
    const j = ro.jobs.find((x) => x.id === id);
    if (!j) throw new Error('No job ' + id + ' on ' + ro.id);
    return j;
  };
  const liveItem = (ro, id) => {
    const it = findItem(ro, id);
    if (it.voided) throw new Error('Item ' + it.id + ' is voided');
    return it;
  };

  /** Close a started item at the work already done; void an unstarted one. */
  function closeOut(it, reason) {
    if (isDone(it)) return;
    const f = frac(it);
    if (f === 0) { it.voided = true; it.voidReason = reason; return; }
    it.min = it.min * f;
    it.done = it.weights.length;
    it.voidReason = reason + ' (closed at work done)';
  }

  /**
   * Apply one event. Events are the stored history; the RO is rebuilt by
   * replaying them in order (see replay()). Returns the RO.
   */
  function apply(ro, ev) {
    const std = ro.std;
    switch (ev.type) {
      case 'step': { // the next n steps, front to back
        const it = liveItem(ro, ev.item);
        it.done = Math.min(it.weights.length, it.done + (ev.n || 1));
        break;
      }
      case 'check': { // one step, in any order. on: false un-ticks it.
        const it = liveItem(ro, ev.item);
        const k = Math.floor(ev.step);
        if (!(k >= 0 && k < it.weights.length)) throw new Error('No step ' + ev.step + ' on ' + it.id);
        const has = it.checks.includes(k);
        if (ev.on === false) { if (has) it.checks = it.checks.filter((s) => s !== k); }
        else if (!has) it.checks.push(k);
        break;
      }
      case 'labor': { // clocked minutes on an item (from cleaned punches)
        const it = liveItem(ro, ev.item);
        it.labor = Math.max(0, it.labor + (Number(ev.min) || 0));
        break;
      }
      case 'hold': { // something outside the tech is holding a job (or the whole RO)
        // { id?, kind: 'parts'|'customer'|'foreman'|'techsupport'|'sublet', job?, since?, eta?, ordered? }
        const h = { id: ev.id || ('hold-' + (ro.holds.length + 1)), kind: ev.kind, job: ev.job || null,
          since: ev.since ?? ev.at ?? null, eta: ev.eta ?? null, ordered: ev.ordered !== false };
        ro.holds = ro.holds.filter((x) => x.id !== h.id).concat([h]);
        break;
      }
      case 'hold_end':
        ro.holds = ro.holds.filter((x) => x.id !== ev.id);
        break;
      case 'more_diag': { // tech needs more diag time
        const j = findJob(ro, ev.job);
        addItem(ro, 'extra', { job: j.id, min: hrsToMin(ev.hrs), extra: true });
        if (needsApproval(j)) addItem(ro, 'approval', { min: std.approval, extra: true });
        break;
      }
      case 'new_issue': { // new problem found mid-repair, separate operation
        const j = normJob(ev.job);
        ro.jobs.push(j);
        if (j.quote.diag.current > 0) addItem(ro, 'extra', { job: j.id, min: j.quote.diag.current, extra: true });
        if (needsApproval(j)) addItem(ro, 'approval', { min: std.approval, extra: true });
        if (j.needsParts) addItem(ro, 'parts', { job: j.id, min: std.parts, extra: true });
        addItem(ro, 'fix', { job: j.id, min: j.quote.repair.current, extra: true });
        break;
      }
      case 'roadtest_fail': {
        const last = ro.items.filter((i) => i.kind === 'roadtest' && !i.voided).pop();
        addItem(ro, 'fix', { job: ev.job || null, min: hrsToMin(ev.fixHrs ?? 0.5), extra: true });
        addItem(ro, 'roadtest', { min: last ? last.min : roadMin(std, 'light'), extra: true });
        break;
      }
      case 'foreman_review':
        addItem(ro, 'review', { min: std.review, extra: true });
        break;
      case 'parts_redo': // wrong or damaged part, parts runs again
        addItem(ro, 'parts', { job: ev.job || null, min: std.parts, extra: true });
        break;
      case 'quote_change': { // quoted hours changed after the first quote
        const j = findJob(ro, ev.job);
        const phase = ev.phase === 'diag' ? 'diag' : 'repair';
        const kinds = phase === 'diag' ? ['diag', 'extra'] : ['repair', 'fix'];
        // The open item for that phase; a finished one only if nothing is open.
        const cands = ro.items.filter((i) => i.job === j.id && kinds.includes(i.kind) && !i.voided);
        const it = cands.find((i) => !isDone(i)) || cands[cands.length - 1];
        if (!it) throw new Error('No ' + phase + ' item for job ' + j.id);
        const newMin = hrsToMin(ev.hrs);
        const increase = newMin > it.min;
        it.min = newMin;
        j.quote[phase].current = newMin;
        if (increase && needsApproval(j) && !ev.preApproved) addItem(ro, 'approval', { min: std.approval, extra: true });
        break;
      }
      case 'road_severity': {
        const it = ro.items.filter((i) => i.kind === 'roadtest' && !i.voided).pop();
        if (it) it.min = roadMin(std, ev.severity);
        break;
      }
      case 'crew': // several techs on one item at once: elapsed time shrinks, labor does not
        findItem(ro, ev.item).crew = Math.max(1, Math.floor(ev.techs || 1));
        break;
      case 'decline': { // customer declines a job at approval
        const j = findJob(ro, ev.job);
        j.status = 'declined';
        for (const it of ro.items) if (it.job === j.id) closeOut(it, 'declined');
        ro.holds = ro.holds.filter((h) => h.job !== j.id);
        const repairLeft = ro.items.some((i) => (i.kind === 'repair' || i.kind === 'fix') && !i.voided);
        if (!repairLeft) for (const it of ro.items) if (it.kind === 'roadtest') closeOut(it, 'no repair performed');
        break;
      }
      case 'cancel': // whole RO cancelled; close-out and pickup still happen
        ro.status = 'cancelled';
        ro.holds = [];
        for (const it of ro.items) if (it.kind !== 'closeout' && it.kind !== 'pickup') closeOut(it, 'cancelled');
        break;
      default:
        throw new Error('Unknown event type: ' + ev.type);
    }
    ro.log.push(ev);
    return ro;
  }

  function replay(spec, events, std = STANDARDS_V1) {
    const ro = openRO(spec, std);
    for (const ev of events) apply(ro, ev);
    return ro;
  }

  /* ======================================================================
   * 4. PROGRESS
   * ==================================================================== */

  /** Share of an item's steps that are ticked, by weight. */
  function stepFrac(it) {
    const tot = sum(it.weights);
    if (!tot) return 0;
    let d = 0;
    for (let i = 0; i < it.weights.length; i++) if (i < it.done || (it.checks && it.checks.includes(i))) d += it.weights[i];
    return d / tot;
  }
  const isDone = (it) => stepFrac(it) >= 1;

  /** Progress inside an item: ticked steps, or clocked time against the budget (capped) if that is further. */
  function frac(it) {
    const s = stepFrac(it);
    if (s >= 1 || !LABOR_KINDS.has(it.kind) || !(it.min > 0) || !it.labor) return s;
    return Math.max(s, Math.min(LABOR_CAP, it.labor / it.min));
  }
  const live = (ro) => ro.items.filter((i) => !i.voided);
  const budget = (ro) => sum(live(ro).map((i) => i.min));
  const earned = (ro) => sum(live(ro).map((i) => i.min * frac(i)));
  const remaining = (ro) => budget(ro) - earned(ro);
  const percent = (ro) => { const b = budget(ro); return b ? (earned(ro) / b) * 100 : 0; };

  /** Elapsed shop minutes an item still needs. Pace applies to quoted work only; crew splits it. */
  function itemLeft(it, p = 1) {
    const base = it.min * (1 - frac(it));
    return (PACED_KINDS.has(it.kind) ? base * p : base) / Math.max(1, it.crew);
  }
  const remainingElapsed = (ro, p = 1) => sum(live(ro).map((i) => itemLeft(i, p)));

  /**
   * Work-time estimate (epoch minutes): every item back to back from now.
   * No waiting and no second lane; forecast() is the realistic one.
   * holdUntil = backorder ETA; the clock does not start before it.
   */
  function readyAt(ro, now, { pace: p = 1, cal, holdUntil = null } = {}) {
    let start = shopIndex(now, cal);
    if (holdUntil != null) start = Math.max(start, shopIndex(holdUntil, cal));
    return fromShopIndex(start + Math.round(remainingElapsed(ro, p)), cal, true);
  }

  /* ======================================================================
   * 5. FORECAST: when the truck will really be ready
   * Tech work goes on one tech's day, one item at a time. Office work (check-in,
   * approval, parts runs, close-out) runs beside it. Waits sit between them:
   * the customer answering, a part arriving, the foreman, tech support.
   * A part only holds the job that needs it; the other jobs keep moving.
   * Two runs: likely (typical waits, the tech's pace) and latest (long waits,
   * slower pace, late parts).
   * ==================================================================== */

  // Shop minutes [likely, latest] for each kind of wait.
  const DEFAULT_WAITS = Object.freeze({
    approval:    [120, 480],   // customer answers the estimate
    parts:       [480, 1440],  // ordered, no ETA yet
    order:       [540, 1680],  // not ordered yet: ordering plus lead time
    etaSlip:     [0, 480],     // a part with an ETA can still come a day late
    lateEta:     [240, 960],   // the ETA has passed and the part is still not here
    foreman:     [30, 120],
    techsupport: [240, 960],
    customer:    [120, 480],
    sublet:      [960, 2400],
    dispatch:    [60, 240],    // nobody assigned yet: waiting for a tech or bay
  });

  function activeHolds(ro) { return ro.holds || []; }

  function plan(ro, nowI, o, sc) {
    const cal = o.cal;
    const waits = o.waits;
    const W = (k) => (waits[k] ? waits[k][sc] : 0);
    const p = (o.pace || 1) * (sc ? (o.latestPace || 1.15) : 1);
    const holds = o.holds;
    const all = live(ro);
    const order = new Map(all.map((it, k) => [it, k]));
    const job = (id) => ro.jobs.find((j) => j.id === id);
    const before = (it, kinds) => all.filter((x) => order.get(x) < order.get(it) && kinds.includes(x.kind));
    const ofJob = (id, kinds) => all.filter((x) => x.job === id && kinds.includes(x.kind));
    const sinceOr = (h, fallback) => (h.since != null ? shopIndex(h.since, cal) : fallback);
    const waitsOut = [];
    const end = new Map();
    const at = (x) => (end.has(x) ? end.get(x) : null);

    // A hold on a job (or on everything) that is not a part: when does it let go?
    function holdGate(j) {
      let g = nowI;
      for (const h of holds) {
        if (h.kind === 'parts' || h.kind === 'customer') continue;
        if (h.job && h.job !== j) continue;
        const until = h.eta != null ? shopIndex(h.eta, cal) : sinceOr(h, nowI) + W(h.kind);
        const u = Math.max(nowI, until);
        if (u > nowI) waitsOut.push({ kind: h.kind, job: h.job, from: nowI, to: u });
        g = Math.max(g, u);
      }
      return g;
    }
    // When the customer has said yes to everything asked so far.
    function approvalGate() {
      const aps = all.filter((x) => x.kind === 'approval');
      let g = nowI;
      for (const a of aps) {
        const e = at(a);
        if (e == null) return null;
        if (isDone(a)) { g = Math.max(g, e); continue; }
        // The customer's clock starts when the estimate went out (the hold's since), else when this touch ends.
        const h = holds.find((x) => x.kind === 'customer');
        const sent = h && h.since != null ? sinceOr(h, e) : e;
        const u = Math.max(e, nowI, sent + W('approval'));
        if (u > e) waitsOut.push({ kind: 'approval', job: null, from: e, to: u });
        g = Math.max(g, u);
      }
      return g;
    }
    // When a job's parts are in hand.
    function partsReady(j, touchEnd) {
      const its = ofJob(j, ['parts']);
      if (!its.length || its.every(isDone)) return touchEnd;
      let u = touchEnd;
      const hs = holds.filter((h) => h.kind === 'parts' && h.job === j);
      if (!hs.length) {
        // nothing on order says otherwise: if the parts run is not past "in hand", allow a lead time
        if (its.some((it) => !isDone(it) && !(it.done >= 2 || it.checks.includes(1)))) u = Math.max(u, touchEnd + W('parts'));
      }
      for (const h of hs) {
        let a;
        if (h.eta != null) {
          const e = shopIndex(h.eta, cal);
          a = e >= nowI ? e + W('etaSlip') : nowI + W('lateEta'); // a passed ETA is not "arriving now"
        }
        else if (!h.ordered) a = Math.max(touchEnd, nowI) + W('order');
        else a = sinceOr(h, nowI) + W('parts');
        u = Math.max(u, a);
      }
      u = Math.max(u, nowI);
      if (u > touchEnd) waitsOut.push({ kind: 'parts', job: j, from: Math.max(nowI, touchEnd - 0), to: u });
      return u;
    }
    // Everything an item must wait for. null = not known yet (a predecessor is not planned).
    function ready(it) {
      const need = [];
      const k = it.kind;
      const disp = all.filter((x) => x.kind === 'dispatch');
      if (k === 'checkin') need.push(...all.filter((x) => x.kind === 'booking'));
      if (k === 'dispatch') need.push(...all.filter((x) => x.kind === 'checkin'));
      if (k === 'review') need.push(...disp);
      if (k === 'diag' || k === 'extra') {
        need.push(...disp);
        if (k === 'extra') need.push(...ofJob(it.job, ['diag']));
      }
      if (k === 'approval') need.push(...before(it, ['diag', 'extra']));
      let gate = nowI;
      if (k === 'parts') {
        need.push(...(it.job ? ofJob(it.job, ['diag', 'extra']) : []));
        const jj = it.job && job(it.job);
        if (jj && needsApproval(jj)) { const g = approvalGate(); if (g == null) return null; gate = Math.max(gate, g); }
      }
      if (k === 'repair' || k === 'fix') {
        if (it.job) {
          need.push(...ofJob(it.job, ['diag', 'extra']));
          if (k === 'fix') need.push(...ofJob(it.job, ['repair']).filter((x) => order.get(x) < order.get(it)));
          const jj = job(it.job);
          if (jj && needsApproval(jj)) { const g = approvalGate(); if (g == null) return null; gate = Math.max(gate, g); }
          const pts = ofJob(it.job, ['parts']);
          if (pts.some((x) => at(x) == null)) return null;
          if (pts.length) gate = Math.max(gate, ...pts.map((x) => at(x)));
        } else {
          need.push(...before(it, ['roadtest']));
        }
        need.push(...disp);
      }
      if (k === 'roadtest') need.push(...before(it, ['repair', 'fix', 'roadtest']));
      if (k === 'closeout') need.push(...all.filter((x) => ['repair', 'fix', 'roadtest', 'diag', 'extra'].includes(x.kind)));
      if (k === 'pickup') need.push(...all.filter((x) => x.kind === 'closeout'));
      for (const x of need) { const e = at(x); if (e == null) return null; gate = Math.max(gate, e); }
      if (TECH_KINDS.has(k)) gate = Math.max(gate, holdGate(it.job));
      return gate;
    }

    const todo = new Set(all);
    let techFree = Math.max(nowI, o.techFreeAt != null ? shopIndex(o.techFreeAt, cal) : nowI);
    const rows = [];
    // Nobody assigned yet: the tech day starts after a dispatch wait.
    const dispItem = all.find((x) => x.kind === 'dispatch');
    if (dispItem && !isDone(dispItem) && o.techFreeAt == null) techFree = Math.max(techFree, nowI + W('dispatch'));
    let guard = 0;
    while (todo.size && guard++ < 10000) {
      let best = null;
      for (const it of todo) {
        let r = ready(it);
        if (r == null) continue;
        const dur = itemLeft(it, p);
        const tech = TECH_KINDS.has(it.kind) && dur > 0;
        const start = tech ? Math.max(r, techFree) : r;
        const fresh = frac(it) > 0 ? 0 : 1; // at the same time, finish what is started before opening something new
        if (!best || start < best.start || (start === best.start && (fresh < best.fresh || (fresh === best.fresh && order.get(it) < order.get(best.it))))) best = { it, start, dur, tech, fresh };
      }
      if (!best) throw new Error('Forecast could not order the items on ' + ro.id);
      const { it, start, dur, tech } = best;
      let fin = start + dur;
      if (it.kind === 'parts' && it.job) fin = Math.max(fin, partsReady(it.job, fin));
      if (tech) techFree = start + dur;
      end.set(it, fin);
      todo.delete(it);
      if (dur > 0 || fin > start) rows.push({ id: it.id, kind: it.kind, stage: it.stage, job: it.job, lane: tech ? 'tech' : 'office', start, work: dur, end: fin });
    }
    const finish = Math.max(nowI, ...[...end.values()]);
    // one row per distinct wait
    const seen = new Set();
    const waitRows = waitsOut.filter((w) => { const key = w.kind + '|' + w.job + '|' + w.to; if (seen.has(key)) return false; seen.add(key); return true; });
    return { finish, rows, waits: waitRows };
  }

  /**
   * Realistic ready time. now = wall clock. Options:
   *   cal          shop calendar (SHOP_CALENDAR in TEC)
   *   pace         tech's pace on quoted work (1 = on quote)
   *   latestPace   extra slowdown for the latest run (default 1.15)
   *   techFreeAt   when the tech can start on this RO (other work ahead)
   *   holds        [{ kind, job, since, eta, ordered }] (default: ro.holds)
   *   waits        override DEFAULT_WAITS entries, [likely, latest] shop minutes
   *   promisedAt   promise time, to report how late or early
   * Returns epoch minutes for likely/latest plus the planned rows.
   */
  function forecast(ro, now, o = {}) {
    const cal = o.cal;
    const nowI = shopIndex(now, cal);
    const opts = { ...o, waits: { ...DEFAULT_WAITS, ...(o.waits || {}) }, holds: o.holds || activeHolds(ro) };
    const a = plan(ro, nowI, opts, 0);
    const b = plan(ro, nowI, opts, 1);
    const wall = (i) => fromShopIndex(Math.round(i), cal, true);
    const rows = (r) => r.map((x) => ({ ...x, start: fromShopIndex(Math.round(x.start), cal), end: wall(x.end) }));
    const out = {
      percent: percent(ro), budgetMin: budget(ro), earnedMin: earned(ro), remainingMin: remaining(ro),
      workLeftMin: remainingElapsed(ro, o.pace || 1),
      likely: wall(a.finish), latest: wall(Math.max(a.finish, b.finish)),
      plan: rows(a.rows), waits: a.waits.map((w) => ({ ...w, from: fromShopIndex(Math.round(w.from), cal), to: wall(w.to) })),
      latestPlan: rows(b.rows),
      lateByMin: null,
    };
    if (o.promisedAt != null) out.lateByMin = Math.round(a.finish - shopIndex(o.promisedAt, cal));
    return out;
  }

  /* ======================================================================
   * 6. CLOCK ENTRIES (bad punches, overnight, overlaps, corrections)
   * entry = { id, tech, ro, item, on, off|null, corrects?: id }
   * ==================================================================== */

  function cleanClock(entries, { cal, now = null } = {}) {
    const len = shiftLength(cal);
    const replaced = new Set(entries.filter((e) => e.corrects != null).map((e) => e.corrects));
    const out = [];
    for (const e of entries) {
      if (replaced.has(e.id)) continue; // a correction replaces the original; history keeps both
      const r = { ...e, flags: [], minutes: 0, countsForPace: true };
      const onI = shopIndex(e.on, cal);
      const shiftEnd = Math.floor(onI / len) * len + len;
      let offI;
      if (e.off == null) {
        const nowI = now != null ? shopIndex(now, cal) : null;
        if (nowI != null && nowI <= shiftEnd) { offI = nowI; r.flags.push('open'); }
        else { offI = shiftEnd; r.flags.push('auto_closed'); }
      } else {
        offI = shopIndex(e.off, cal);
        if (toMin(e.off) <= toMin(e.on)) { r.flags.push('invalid'); offI = onI; }
        else if (offI > shiftEnd) { offI = shiftEnd; r.flags.push('capped_at_shift_end'); }
      }
      r._on = onI; r._off = offI;
      out.push(r);
    }
    // Same tech clocked on two things at once: split the shared minutes evenly.
    const byTech = new Map();
    for (const r of out) {
      if (r._off <= r._on) continue;
      if (!byTech.has(r.tech)) byTech.set(r.tech, []);
      byTech.get(r.tech).push(r);
    }
    for (const list of byTech.values()) {
      const pts = [...new Set(list.flatMap((r) => [r._on, r._off]))].sort((a, b) => a - b);
      for (let k = 0; k < pts.length - 1; k++) {
        const a = pts[k], b = pts[k + 1];
        const active = list.filter((r) => r._on <= a && r._off >= b);
        if (!active.length) continue;
        for (const r of active) {
          r.minutes += (b - a) / active.length;
          if (active.length > 1 && !r.flags.includes('overlap')) r.flags.push('overlap');
        }
      }
    }
    for (const r of out) {
      if (r.flags.some((f) => ['open', 'auto_closed', 'invalid', 'capped_at_shift_end'].includes(f))) r.countsForPace = false;
      r.minutes = Math.round(r.minutes * 100) / 100;
      delete r._on; delete r._off;
    }
    return out;
  }

  /* ======================================================================
   * 7. PACE, QUOTE ACCURACY, CUSTOMER WAIT, STALE
   * ==================================================================== */

  /** rows = [{ stdMin, workedMin }]. Below minSample standard minutes, pace stays 1.0. */
  function pace(rows, { min = 0.85, max = 1.6, minSample = 600 } = {}) {
    const s = sum(rows.map((r) => r.stdMin));
    const w = sum(rows.map((r) => r.workedMin));
    if (s < minSample) return 1;
    return Math.min(max, Math.max(min, w / s));
  }

  /** rows = [{ key, quotedMin, originalQuotedMin, clockedMin }] for finished diag/repair items. */
  function quoteAccuracy(rows) {
    const g = {};
    for (const r of rows) {
      const o = g[r.key] || (g[r.key] = { n: 0, quoted: 0, original: 0, actual: 0 });
      o.n++; o.quoted += r.quotedMin; o.original += r.originalQuotedMin ?? r.quotedMin; o.actual += r.clockedMin;
    }
    for (const k of Object.keys(g)) {
      const o = g[k];
      o.ratio = o.quoted ? o.actual / o.quoted : null;
      o.ratioToOriginal = o.original ? o.actual / o.original : null;
    }
    return g;
  }

  /** Shop minutes in Approval beyond the advisor's own work. intervals = [{ in, out|null }]. */
  function customerWait(intervals, advisorWorkMin, { cal, now } = {}) {
    const t = sum(intervals.map((iv) => shopMinutesBetween(iv.in, iv.out ?? now, cal)));
    return Math.max(0, t - advisorWorkMin);
  }

  const isStale = (lastTouch, now, { cal, limit = 240 } = {}) => shopMinutesBetween(lastTouch, now, cal) > limit;

  return {
    DEFAULT_CALENDAR, SHOP_CALENDAR, STANDARDS_V1, STEPS, STAGE_OF, PAY_TYPES, DEFAULT_WAITS,
    TECH_KINDS, PACED_KINDS, LABOR_KINDS, LABOR_CAP,
    toMin, fmt, shopIndex, fromShopIndex, shopMinutesBetween, addShopMinutes, shiftLength,
    openRO, apply, replay, findItem, needsApproval,
    stepFrac, frac, isDone, budget, earned, remaining, percent, itemLeft, remainingElapsed, readyAt,
    forecast,
    cleanClock, pace, quoteAccuracy, customerWait, isStale,
  };
});
