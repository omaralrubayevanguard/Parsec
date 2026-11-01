/* ===== Parsec Mobile 2 — technician app. One file, works offline, syncs with Parsec on the computer by QR codes. ===== */
'use strict';
const APPV = '2.0';
const ICONS = __ICONS__;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (n, cls = 'px-ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const uid = p => (p || 'ph') + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const nowIso = () => new Date().toISOString();
const pad = n => String(n).padStart(2, '0');
const dayKey = d => { d = new Date(d); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
const isToday = d => d && dayKey(d) === dayKey(new Date());
const hm = d => { d = new Date(d); return d.getHours() + ':' + pad(d.getMinutes()); };
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fdate = d => { d = new Date(d); return DOW[d.getDay()] + ', ' + MON[d.getMonth()] + ' ' + d.getDate(); };
const fshort = d => { d = new Date(d); return isToday(d) ? 'Today ' + hm(d) : MON[d.getMonth()] + ' ' + d.getDate() + ' · ' + hm(d); };
const fclock = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 3600) + ':' + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60); };
const fdur = ms => { const m = Math.max(0, Math.round(ms / 60000)); return Math.floor(m / 60) + ':' + pad(m % 60); };
const f2 = h => (Math.round((h || 0) * 100) / 100).toFixed(2);
const stampTxt = () => { const d = new Date(); return '(' + MON[d.getMonth()] + ' ' + d.getDate() + ' · ' + hm(d) + ')'; };
const capSentences = t => String(t).replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, a, b) => a + b.toUpperCase());
const buzz = () => { try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} };

/* ---------- shop vocabulary (matches Parsec on the computer) ---------- */
const MST = ['Hold Tech', 'Waiting – Parts', 'Waiting – Foreman', 'Waiting – Tech Support', 'Waiting – Customer', 'Waiting – Approval', 'Complete'];
const JOB_TYPES = ['DIAG', 'OP', 'PM', 'WARR', 'COMEBACK', 'SUBLET', 'RECALL'];
const START_REASONS = ['Diagnosing', 'Repairing', 'Inspecting', 'Inspecting – 74-point', 'Inspecting – DOT', 'Testing', 'Bench Testing'];
const STOP_EXPLICIT = ['Waiting – Parts', 'Waiting – Foreman', 'Waiting – Tech Support', 'Waiting – Approval', 'Waiting – New Job', 'Complete'];
const STOP_BREAK = ['Lunch', 'End of day'];
const PSTAT = ['Not Ordered', 'Ordered', 'Backordered', 'Received', 'Installed'];
const STAGE_STEPS = {
  checkin: [[0, 'Unit connected / DTC read'], [1, 'Dash photo'], [2, 'Location set']],
  approval: [[0, 'Estimate reviewed'], [1, 'Estimate sent'], [2, 'Customer approved']],
  parts: [[0, 'Parts looked up'], [1, 'Parts in hand'], [2, 'Parts delivered / installed']],
  closeout: [[0, 'Cause and fix on all operations'], [1, 'Pictures uploaded'], [2, 'DTC uploaded'], [3, 'RO released'], [4, 'Parts installed']]
};
const STAGES = [['checkin', 'Check-in'], ['diag', 'Diag'], ['approval', 'Approval'], ['parts', 'Parts'], ['repair', 'Repair'], ['roadtest', 'Road test'], ['closeout', 'Close-out']];
const PHOTO_KIND = { pic: 'Picture', dash: 'Dash photo', dtc: 'DTC' };
const PHOTO_TICK = { dash: 'checkin:1', pic: 'closeout:1', dtc: 'closeout:2' };
const nice = s => String(s || '').replace('Hold Tech', 'Hold tech').replace('Tech Support', 'Tech support').replace('New Job', 'New job').replace('Bench Testing', 'Bench testing');

/* ---------- status icons: shape = family, colour = who it waits on ---------- */
function si(s, color) {
  const ring = '<circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" stroke-width="1.5"/>';
  const dash = '<circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.3 1.82"/><circle cx="7" cy="7" r="1.75" fill="currentColor"/>';
  const B = {
    hold: ring, working: ring + '<path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor"/>', parts: dash, foreman: dash, customer: dash, support: dash,
    roadtest: ring + '<path d="M7 3.5a3.5 3.5 0 1 1-3.5 3.5H7z" fill="currentColor"/>',
    released: '<circle cx="7" cy="7" r="6" fill="currentColor"/><path d="M4.4 7.2l1.8 1.8 3.5-3.7" fill="none" stroke="var(--panel)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    declined: '<circle cx="7" cy="7" r="6" fill="currentColor"/><path d="M5 5l4 4M9 5l-4 4" fill="none" stroke="var(--panel)" stroke-width="1.6" stroke-linecap="round"/>'
  };
  return `<svg class="px-si" data-s="${color || s}" viewBox="0 0 14 14" aria-hidden="true">${B[s] || ring}</svg>`;
}
function shapeOf(name) {
  name = String(name || '');
  if (/^Working/.test(name)) return 'working';
  if (/^Declined/.test(name)) return 'declined';
  if (/Road test/i.test(name)) return 'roadtest';
  if (/^Complete/.test(name)) return 'released';
  if (/^Waiting/.test(name)) { if (/Parts/.test(name)) return 'parts'; if (/Foreman/.test(name)) return 'foreman'; if (/Support/.test(name)) return 'support'; if (/Customer|Approval/.test(name)) return 'customer'; return 'parts'; }
  return 'hold';
}
const PSH = { 'Not Ordered': ['hold'], Ordered: ['parts'], Backordered: ['parts', 'problem'], Received: ['working'], Installed: ['released'] };
const psi = st => { const x = PSH[st] || PSH['Not Ordered']; return si(x[0], x[1]); };
const inHand = st => st === 'Received' || st === 'Installed';
const PCOL = { 'Not Ordered': 'var(--status-hold)', Ordered: 'var(--status-waiting)', Backordered: 'var(--status-problem)', Received: 'var(--status-working)', Installed: 'var(--status-working)' };

/* ---------- storage ---------- */
const KEY = 'parsec-mobile-v2';
function blank() {
  return { v: 2, me: { name: '' }, prefs: { theme: 'system', bay: false }, pc: null, sample: false,
    L: { ops: [], entries: [], run: null, notes: [], parts: [], pstat: [], edits: [], ticks: [] },
    photos: [], shift: {}, sync: { in: null, out: null }, ui: {} };
}
let S;
try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || 'null') || {}); } catch (e) { S = blank(); }
S.L = Object.assign(blank().L, S.L || {}); S.prefs = Object.assign(blank().prefs, S.prefs || {}); S.ui = S.ui || {};
let saveWarned = false;
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { if (!saveWarned) { saveWarned = true; toast('This phone would not save — storage is full or blocked.'); } } }

/* photos live in IndexedDB as downscaled JPEG blobs */
const DB = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      if (!window.indexedDB) return rej(new Error('No photo storage on this browser'));
      const r = indexedDB.open('parsec-mobile', 1);
      r.onupgradeneeded = () => { const s = r.result.createObjectStore('photos', { keyPath: 'id' }); s.createIndex('roId', 'roId'); };
      r.onsuccess = () => { this.db = r.result; res(this.db); };
      r.onerror = () => rej(r.error);
    });
  },
  tx(mode, fn) { return this.open().then(db => new Promise((res, rej) => { const t = db.transaction('photos', mode), st = t.objectStore('photos'); const out = fn(st); t.oncomplete = () => res(out && out.result !== undefined ? out.result : out); t.onerror = () => rej(t.error); })); },
  put(rec) { return this.tx('readwrite', st => st.put(rec)); },
  get(id) { return this.open().then(db => new Promise((res, rej) => { const q = db.transaction('photos').objectStore('photos').get(id); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); })); },
  del(id) { return this.tx('readwrite', st => st.delete(id)); },
  clear() { return this.tx('readwrite', st => st.clear()); }
};
const URLS = {};
function photoUrl(id) {
  if (URLS[id]) return Promise.resolve(URLS[id]);
  return DB.get(id).then(r => { if (!r) return ''; URLS[id] = URL.createObjectURL(r.blob); return URLS[id]; }).catch(() => '');
}

/* ---------- TQ: the same QR loop the computer uses (TQ1 frames, deflate-raw, 360-char chunks) ---------- */
const TQ = (function () {
  const CH = 360;
  const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const unb64 = s => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  const pipe = (u8, Stream) => { const cs = new Stream('deflate-raw'), w = cs.writable.getWriter(); w.write(u8); w.close(); return new Response(cs.readable).arrayBuffer().then(b => new Uint8Array(b)); };
  function pack(obj) {
    const raw = new TextEncoder().encode(JSON.stringify(obj));
    const go = (mode, body) => { const s = b64(body), sid = Math.random().toString(36).slice(2, 7), n = Math.max(1, Math.ceil(s.length / CH)), out = []; for (let i = 0; i < n; i++) out.push('TQ1:' + sid + ':' + mode + ':' + (i + 1) + '/' + n + ':' + s.slice(i * CH, (i + 1) * CH)); return { frames: out, bytes: body.length }; };
    if (typeof CompressionStream === 'undefined') return Promise.resolve(go('r', raw));
    return pipe(raw, CompressionStream).then(z => go('z', z), () => go('r', raw));
  }
  function unpack(mode, s) {
    const u = unb64(s), done = x => JSON.parse(new TextDecoder().decode(x));
    if (mode !== 'z') return Promise.resolve(done(u));
    if (typeof DecompressionStream === 'undefined') return Promise.reject(new Error('This browser cannot unpack the codes. Update it and try again.'));
    return pipe(u, DecompressionStream).then(done);
  }
  function draw(canvas, text) {
    const qr = qrcode(0, 'L'); qr.addData(text); qr.make();
    const n = qr.getModuleCount(), q = 4, size = n + q * 2, ctx = canvas.getContext('2d');
    canvas.width = size; canvas.height = size; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size); ctx.fillStyle = '#000';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect(c + q, r + q, 1, 1);
  }
  function player(canvas, frames, onTick, ms) {
    let i = 0; const step = () => { const k = i % frames.length; draw(canvas, frames[k]); onTick && onTick(k + 1, frames.length, Math.floor(i / frames.length)); i++; };
    step(); const t = setInterval(step, ms || 340); return () => clearInterval(t);
  }
  function scanner(video, onProgress, onDone, onError) {
    let stopped = false, stream = null, parts = {}, sid = null, total = 0, mode = 'r';
    const cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
    function stop() { stopped = true; if (stream) stream.getTracks().forEach(t => t.stop()); try { video.srcObject = null; } catch (e) {} }
    function take(d) {
      const m = /^TQ1:([a-z0-9]+):([rz]):(\d+)\/(\d+):(.*)$/.exec(d); if (!m) return;
      if (sid !== m[1]) { sid = m[1]; parts = {}; total = +m[4]; mode = m[2]; }
      if (parts[m[3]] !== undefined) return;
      parts[m[3]] = m[5]; const got = Object.keys(parts).length; onProgress && onProgress(got, total);
      if (got === total) { let s = ''; for (let i = 1; i <= total; i++) s += parts[i]; stop(); unpack(mode, s).then(onDone, e => onError && onError(e)); }
    }
    function tick() {
      if (stopped) return;
      if (video.readyState >= 2 && video.videoWidth) {
        const w = video.videoWidth, h = video.videoHeight, sc = Math.min(1, 900 / Math.max(w, h));
        cv.width = Math.round(w * sc); cv.height = Math.round(h * sc); cx.drawImage(video, 0, 0, cv.width, cv.height);
        const img = cx.getImageData(0, 0, cv.width, cv.height); let code = null;
        try { code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' }); } catch (e) {}
        if (code && code.data) take(code.data);
      }
      if (!stopped) setTimeout(tick, 40);
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { setTimeout(() => onError && onError(new Error('No camera access here. The camera needs Parsec Mobile opened from its https address.')), 0); return stop; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }).then(s => {
      if (stopped) { s.getTracks().forEach(t => t.stop()); return; }
      stream = s; video.setAttribute('playsinline', ''); video.muted = true; video.srcObject = s; const p = video.play(); if (p && p.catch) p.catch(() => {}); tick();
    }, e => onError && onError(e));
    return stop;
  }
  return { pack, unpack, draw, player, scanner };
})();

/* ---------- sample ROs, in the computer's format, for trying the app ---------- */
function sampleBundle() {
  const now = Date.now(), ago = m => new Date(now - m * 60000).toISOString();
  const day = (n, h, m) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(h, m, 0, 0); return d.toISOString(); };
  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 4, 0, 0); return d.toISOString(); })();
  const op = (o) => Object.assign({ live: false, d: false, m: 0, rs: '', ca: '', fx: '', tl: [], nt: [], pt: [], ml: 0, mp: 0, mo: 0, ec: 0 }, o);
  return { t: 'pc', v: 1, at: nowIso(), rate: 210, ack: [], ros: [
    { id: 'sx_ro1', no: '37538', cust: 'Blue Ridge Haulage', tag: '112', vin: '4V4NC9EH9LN891160', ymm: '2020 Volvo VNL', unit: '4417', st: 'Hold Tech', pct: 62, eta: tomorrow,
      sg: [['skip', 0], ['cur', 66], ['cur', 45]], cl: { checkin: 'aaa', approval: 'mm0', parts: 'mm0', closeout: '0aa00' },
      ops: [
        op({ id: 'sx_op1', n: 1, t: 'OP', c: 'Clutch slipping – replace clutch', s: 'Hold Tech', k: 'hold', b: 6.27, q: 8, ca: 'Clutch disc worn to the rivets, flywheel scored.',
          tl: [[ago(165), ago(93), 'Repairing', 'Waiting – New Job', 'MR'], [day(2, 12, 10), day(2, 13, 41), 'Repairing', 'Lunch', 'MR'], [day(2, 7, 32), day(2, 11, 5), 'Repairing', 'Lunch', 'MR']],
          nt: [{ a: day(1, 8, 40), x: 'Removed transmission. Clutch disc worn to the rivets, flywheel scored — resurfaced. Installing new clutch kit. (Oct 20 · 8:40)' }],
          pt: [['Clutch kit, 15.5 in', '85136213', '1', 'Received', 0], ['Clutch release bearing', '21515427', '1', 'Installed', 0]] }),
        op({ id: 'sx_op2', n: 2, t: 'OP', c: 'Wheel seal leaking', s: 'Waiting · Customer', k: 'warn', b: 0, q: 2.4, pt: [['Inner wheel seal, right rear', '21422645', '1', 'Not Ordered', 0]] }),
        op({ id: 'sx_op3', n: 3, t: 'PM', c: 'PM service – A', s: 'Hold Tech', k: 'hold', b: 0, q: 1.5, pt: [['Oil filter', '21707134', '2', 'Received', 0], ['Fuel filter kit', '23658092', '1', 'Ordered', 0]] })
      ],
      att: [{ n: 'dash-photo.jpg', z: 412000, at: day(15, 9, 2), op: 0 }, { n: 'dtc-report.pdf', z: 88000, at: day(15, 9, 20), op: 0 }, { n: 'estimate-v1.pdf', z: 64000, at: day(15, 11, 0), op: 0 },
        { n: 'flywheel-scoring.jpg', z: 530000, at: day(2, 10, 2), op: 1 }, { n: 'clutch-disc.jpg', z: 498000, at: day(2, 10, 3), op: 1 }, { n: 'rr-seal-leak.jpg', z: 451000, at: day(1, 9, 8), op: 2 }] },
    { id: 'sx_ro2', no: '34601', cust: 'Carolina Line Freight', tag: '87', vin: '4V4NC9EJ5KN250799', ymm: '2019 Volvo VNR', unit: '2210', st: 'Waiting – Parts · Backordered', pct: 48, eta: '',
      sg: [['done', 100], ['done', 100], ['park', 20]], cl: { checkin: 'aaa', approval: 'mmm', parts: 'm00', closeout: '00000' },
      ops: [
        op({ id: 'sx_op4', n: 1, t: 'DIAG', c: 'Check engine light – DPF differential pressure high', s: 'Complete', k: 'good', b: 1.1, q: 1, ca: 'DPF face plugged, cracked outlet.', fx: 'Diagnosed, DPF replacement quoted.' }),
        op({ id: 'sx_op5', n: 2, t: 'OP', c: 'Replace DPF', s: 'Waiting · Parts', k: 'warn', b: 0.75, q: 3.2, tl: [[ago(85), ago(40), 'Repairing', 'Waiting – Parts', 'MR']], pt: [['DPF assembly', '23419842', '1', 'Backordered', 0], ['DPF clamp kit', '21983441', '2', 'Received', 0]] })
      ], att: [{ n: 'dash-photo.jpg', z: 380000, at: day(4, 8, 2), op: 0 }] },
    { id: 'sx_ro3', no: '35112', cust: 'Piedmont Aggregates', tag: '204', vin: '4V5KC9EH7MN318204', ymm: '2021 Volvo VHD', unit: '318', st: 'Hold Tech', pct: 15, eta: '',
      sg: [['cur', 35], ['todo', 0], ['todo', 0]], cl: { checkin: 'am0', approval: '000', parts: '000', closeout: '00000' },
      ops: [op({ id: 'sx_op6', n: 1, t: 'DIAG', c: 'Air leak at the front axle', s: 'Hold Tech', k: 'hold', b: 0.42, q: 1.2 })], att: [] }
  ] };
}

/* ---------- the view: the computer's ROs with this phone's changes layered on top ---------- */
let CUR = null;
const entryH = x => Math.max(0, (new Date(x.e) - new Date(x.s)) / 3600000);
function V() {
  const out = { ros: [], ro: {}, op: {} };
  if (!S.pc || !Array.isArray(S.pc.ros)) return out;
  const L = S.L;
  out.ros = S.pc.ros.map(r0 => {
    const r = JSON.parse(JSON.stringify(r0));
    r.cl = r.cl || {}; r.att = r.att || []; r.ops = r.ops || [];
    r.ops.forEach(o => { o.ro = r.id; o.lt = []; o.ln = []; o.local = false; o.tl = o.tl || []; o.nt = o.nt || [];
      o.pt = (o.pt || []).map((p, i) => ({ d: p[0] || '', pn: p[1] || '', q: p[2] || '1', st: p[3] || 'Not Ordered', pr: p[4] || 0, i, src: 'pc' })); });
    out.ro[r.id] = r; return r;
  });
  L.ops.forEach(x => { const r = out.ro[x.roId]; if (!r || r.ops.some(o => o.id === x.id)) return;
    r.ops.push({ id: x.id, n: r.ops.length + 1, t: x.t, c: x.c, s: 'Hold Tech', k: 'hold', b: 0, q: 0, d: false, live: false, tl: [], nt: [], pt: [], ca: '', fx: '', rs: '', local: true, item: x, ro: r.id, lt: [], ln: [], att: [] }); });
  out.ros.forEach(r => r.ops.forEach(o => { out.op[o.id] = o; }));
  const opOf = x => { const o = out.op[x.opId]; return o && o.ro === x.roId ? o : null; };
  L.edits.slice().sort((a, b) => String(a.at).localeCompare(String(b.at))).forEach(x => { const o = opOf(x); if (!o) return; const f = x.f || {};
    if (f.c) o.c = f.c; if (JOB_TYPES.includes(f.t)) o.t = f.t; if (MST.includes(f.s)) { o.s = f.s; o.rs = f.s; } if (typeof f.ca === 'string') o.ca = f.ca; if (typeof f.fx === 'string') o.fx = f.fx; });
  L.notes.forEach(x => { const o = opOf(x); if (o) o.ln.push(x); });
  L.parts.forEach(x => { const o = opOf(x); if (o) o.pt.push({ d: x.d, pn: x.pn, q: x.q, st: 'Not Ordered', pr: x.pr || 0, src: 'ph', id: x.id, item: x }); });
  L.pstat.slice().sort((a, b) => String(a.at).localeCompare(String(b.at))).forEach(x => { const o = opOf(x); if (!o) return;
    let p = o.pt.find(p => p.src === 'ph' && p.id === x.pid) || o.pt.find(p => p.src === 'pc' && p.pn === x.pn && p.d === x.d) || (x.pid ? null : o.pt.find(p => p.src === 'pc' && p.i === x.i));
    if (p) p.st = x.st; });
  L.entries.forEach(x => { const o = opOf(x); if (!o) return; o.lt.push(x); o.b = (+o.b || 0) + entryH(x); });
  out.ros.forEach(r => r.ops.forEach(o => {
    const last = o.lt.slice().sort((a, b) => new Date(b.e) - new Date(a.e))[0];
    if (last && last.sr) { if (STOP_EXPLICIT.includes(last.sr) && last.sr !== 'Waiting – New Job') o.s = last.sr; else o.s = 'Hold Tech'; }
  }));
  L.ticks.slice().sort((a, b) => String(a.at).localeCompare(String(b.at))).forEach(x => { const r = out.ro[x.roId]; if (!r) return;
    const [g, k] = x.key.split(':'); const steps = STAGE_STEPS[g]; if (!steps) return;
    let s = (r.cl[g] || '').padEnd(steps.length, '0').split(''); const i = steps.findIndex(sp => sp[0] === +k); if (i < 0) return;
    if (x.v) { if (s[i] === '0') s[i] = 'm'; } else s[i] = '0'; r.cl[g] = s.join(''); });
  return out;
}
const RUN = () => S.L.run;
const runSecs = () => RUN() ? (Date.now() - new Date(RUN().s)) / 1000 : 0;
const burnt = o => (+o.b || 0) + (RUN() && RUN().opId === o.id ? runSecs() / 3600 : 0);
function opStatus(o) {
  let s = String(o.s || 'Hold Tech').replace(/^Waiting · /, 'Waiting – ').replace(/^Complete · /, 'Complete – ');
  if (o.d) s = 'Declined';
  if (RUN() && RUN().opId === o.id) return { name: 'Working', sub: RUN().r, shape: 'working' };
  const [name, sub] = s.split(' · ');
  return { name, sub: sub || '', shape: shapeOf(name) };
}
function roStatus(r) {
  if (RUN() && RUN().roId === r.id) return { name: 'Working', sub: RUN().r, shape: 'working' };
  const [name, sub] = String(r.st || 'Hold Tech').split(' · ');
  return { name, sub: sub || '', shape: shapeOf(name) };
}
const isWaiting = o => /^Waiting/.test(opStatus(o).name);
const isDone = o => o.d || /^Complete|^Declined/.test(opStatus(o).name);
function roTotals(r) {
  const ops = r.ops.filter(o => !o.d), parts = ops.flatMap(o => o.pt);
  return { q: ops.reduce((a, o) => a + (+o.q || 0), 0), b: ops.reduce((a, o) => a + burnt(o), 0), np: parts.length, inh: parts.filter(p => inHand(p.st)).length,
    nf: r.att.length + S.photos.filter(p => p.roId === r.id).length };
}
function stagesOf(r) {
  const cl = k => { const s = r.cl[k]; if (!s) return 'todo'; const on = s.split('').filter(c => c !== '0').length; return on === s.length ? 'done' : on ? 'cur' : 'todo'; };
  const sg = r.sg || [];
  const mapSg = x => !x ? 'todo' : x[0] === 'skip' ? 'skip' : x[0] === 'done' ? 'done' : x[0] === 'park' ? 'wait' : x[0] === 'cur' ? 'cur' : 'todo';
  const st = roStatus(r).name;
  const road = /Released/.test(st) ? 'done' : /Road test/.test(st) ? 'cur' : (mapSg(sg[2]) === 'done' ? 'cur' : 'todo');
  const appr = (() => { const a = mapSg(sg[1]); return a === 'cur' && r.ops.some(o => /Customer|Approval/.test(opStatus(o).name)) ? 'wait' : a; })();
  const list = [['checkin', cl('checkin')], ['diag', mapSg(sg[0])], ['approval', appr], ['parts', cl('parts')], ['repair', mapSg(sg[2])], ['roadtest', road], ['closeout', cl('closeout')]];
  let now = list.findIndex(x => x[1] !== 'done' && x[1] !== 'skip' && x[1] !== 'wait'); if (now < 0) now = list.length - 1;
  return { list, now };
}

/* ---------- routing ---------- */
function route() {
  const p = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  if (p[0] === 'ro' && p[1]) return { name: 'ro', ro: p[1], key: 'ro/' + p[1] };
  if (p[0] === 'op' && p[1] && p[2]) return { name: 'op', ro: p[1], op: p[2], key: 'op/' + p[1] + '/' + p[2] };
  if (['ros', 'sync', 'me'].includes(p[0])) return { name: p[0], key: p[0] };
  return { name: 'today', key: 'today' };
}
const go = h => { location.hash = h; };
const roHref = id => '#/ro/' + encodeURIComponent(id), opHref = (r, o) => '#/op/' + encodeURIComponent(r) + '/' + encodeURIComponent(o);

/* ---------- screens ---------- */
const UI = { ptab: {}, sync: 'send', q: '', scroll: {}, last: null, from: {} };
function tag(t) { return `<span class="px-tag" data-t="${esc(t)}">${esc(t)}</span>`; }
function mini(b, q) { const pct = q ? Math.min(100, b / q * 100) : 0; return `<span class="px-mini"><i${q && b > q ? ' class="over"' : ''} style="width:${pct.toFixed(1)}%"></i></span>`; }
function jobRow(r, o) {
  const st = opStatus(o), live = RUN() && RUN().opId === o.id, wait = isWaiting(o);
  const row = `<div class="pm-job${wait ? ' is-wait' : ''}" data-act="go" data-href="${opHref(r.id, o.id)}" data-lp="opmenu" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">
    <div class="pm-job__main"><div class="pm-job__meta">${si(st.shape)}<span class="px-id">RO-${esc(r.no)}</span><span>${esc(r.cust)}</span></div>
    <div class="pm-job__t">${esc(o.c)}</div>
    <div class="pm-job__time">${wait ? `<span>${esc(nice(st.name))}${st.sub ? ' · ' + esc(st.sub) : ''}</span>` : `${mini(burnt(o), o.q)}<span><span data-tick="burnt" data-op="${esc(o.id)}">${f2(burnt(o))}</span> <em>/ ${f2(o.q)} h</em></span>${tag(o.t)}`}</div></div>
    ${wait ? '' : `<button class="pm-play${live ? ' is-live' : ''}" data-act="${live ? 'stop' : 'start'}" data-ro="${esc(r.id)}" data-op="${esc(o.id)}" aria-label="${live ? 'Stop clock' : 'Start clock'} on ${esc(o.c)}">${ic(live ? 'stop' : 'play')}</button>`}</div>`;
  if (wait || live) return row;
  return `<div class="pm-swipe" data-swipe><button class="pm-swipe__act" data-act="start" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">${ic('play')}<span>Start clock</span></button><div class="pm-swipe__row">${row}</div></div>`;
}
function todaySegs(v) {
  const segs = [];
  v.ros.forEach(r => r.ops.forEach(o => {
    o.tl.forEach(t => { if (!t[0]) return; const s = new Date(t[0]), e = t[1] ? new Date(t[1]) : new Date(); if (isToday(s)) segs.push({ s, e, live: false, what: `RO-${r.no} · Operation ${o.n}` }); });
    o.lt.forEach(x => { const s = new Date(x.s); if (isToday(s)) segs.push({ s, e: new Date(x.e), live: false, phone: true, what: `RO-${r.no} · Operation ${o.n}` }); });
  }));
  if (RUN()) { const s = new Date(RUN().s); segs.push({ s: isToday(s) ? s : new Date(new Date().setHours(0, 0, 0, 0)), e: new Date(), live: true, what: 'Running now' }); }
  return segs.sort((a, b) => a.s - b.s);
}
function dayWindow(segs, shift) {
  const now = new Date(); let a = new Date(now); a.setHours(7, 0, 0, 0); let b = new Date(now); b.setHours(15, 30, 0, 0);
  const firsts = segs.map(s => s.s).concat(shift && shift.in ? [new Date(shift.in)] : []);
  firsts.forEach(d => { if (d < a) { a = new Date(d); a.setMinutes(0, 0, 0); } });
  if (now > b) { b = new Date(now); b.setMinutes(b.getMinutes() + 30); }
  segs.forEach(s => { if (s.e > b) b = new Date(s.e); });
  return { a, b, span: b - a };
}
function screenToday(v) {
  const d = new Date(), shift = S.shift[dayKey(d)] || null, inNow = shift && shift.in && !shift.out;
  if (!S.pc) return `<div class="wrap"><header><div class="pm-eyebrow">${fdate(d)}</div><div class="pm-hero__row"><h1 class="pm-title">Today</h1>${meBtn()}</div></header>
    <section class="pm-card pm-welcome"><h2>Bring your ROs over</h2><p>Parsec Mobile starts empty. Open Parsec on the computer, choose <b>Phone sync → Send to phone</b>, then get the codes here. Nothing goes over a network.</p>
    <div class="pm-btns"><button class="px-btn px-btn--primary pm-big" data-act="go" data-href="#/sync" data-sync="get">${ic('sync')}Get ROs from the computer</button><button class="px-btn pm-big" data-act="sample">Try it with sample ROs</button></div></section></div>`;
  const segs = todaySegs(v), win = dayWindow(segs, shift), pos = t => ((t - win.a) / win.span * 100);
  const segHtml = segs.map(s => `<i class="${s.live ? 'is-live' : ''}" ${s.live ? 'data-tick="liveseg"' : ''} title="${esc(s.what)} · ${hm(s.s)}–${hm(s.e)}" style="left:${pos(s.s).toFixed(2)}%;width:${Math.max(.6, pos(s.e) - pos(s.s)).toFixed(2)}%" data-l="${pos(s.s)}"></i>`).join('');
  const inBand = shift && shift.in ? `<span class="pm-day__in" style="left:${pos(new Date(shift.in)).toFixed(2)}%;right:${(100 - pos(shift.out ? new Date(shift.out) : new Date())).toFixed(2)}%"></span>` : '';
  const ticks = []; const t0 = new Date(win.a); t0.setMinutes(0, 0, 0); for (let t = new Date(t0); t <= win.b; t.setHours(t.getHours() + 2)) { if (t >= win.a) { const h = t.getHours(); ticks.push(`<span style="left:${pos(t).toFixed(2)}%">${h === 0 ? '12a' : h < 12 ? h + 'a' : h === 12 ? '12p' : (h - 12) + 'p'}</span>`); } }
  const onJobs = segs.reduce((a, s) => a + (s.e - s.s), 0) / 3600000;
  const onClock = shift && shift.in ? ((shift.out ? new Date(shift.out) : new Date()) - new Date(shift.in)) / 3600000 : 0;
  const touched = {}; v.ros.forEach(r => r.ops.forEach(o => { if (o.tl.some(t => isToday(t[0])) || o.lt.some(x => isToday(x.s)) || (RUN() && RUN().opId === o.id)) touched[o.id] = o; }));
  const tq = Object.values(touched).reduce((a, o) => a + (+o.q || 0), 0), tb = Object.values(touched).reduce((a, o) => a + burnt(o), 0);
  const eff = tb > 0 ? Math.round(tq / tb * 100) : null;
  const all = []; v.ros.forEach(r => r.ops.forEach(o => { if (!isDone(o)) all.push([r, o]); }));
  const ready = all.filter(([r, o]) => !isWaiting(o)).sort((a, b) => ((RUN() && RUN().opId === b[1].id) - (RUN() && RUN().opId === a[1].id)));
  const waiting = all.filter(([r, o]) => isWaiting(o));
  return `<div class="wrap">
  <header><div class="pm-eyebrow">${fdate(d)}${S.sample ? ' · <span class="pm-badge">Sample ROs</span>' : ''}</div><div class="pm-hero__row"><h1 class="pm-title">Today</h1>${meBtn()}</div></header>
  <section class="pm-card">
    <div class="pm-shift__top"><span class="pm-dot${inNow ? '' : ' is-off'}"></span><div>${inNow ? 'On the clock' : shift && shift.out ? 'Clocked out' : 'Not clocked in'}<small>${shift && shift.in ? 'since ' + hm(shift.in) + (shift.out ? ' – ' + hm(shift.out) : '') + ' · <span data-tick="onclock">' + f2(onClock) + '</span> h' : 'Starting a job clocks you in'}</small></div>
    ${inNow ? '<button class="px-btn px-btn--sm" data-act="clockout">Clock out</button>' : '<button class="px-btn px-btn--sm" data-act="clockin">Clock in</button>'}</div>
    <div class="pm-day" aria-label="Today's clocked time">${inBand}${segHtml}<b data-tick="nowline" style="left:${pos(new Date()).toFixed(2)}%"></b></div>
    <div class="pm-day__axis">${ticks.join('')}</div>
    <div class="px-tsum pm-tsum3"><div><span>On jobs</span><b><span data-tick="onjobs">${f2(onJobs)}</span><small>h</small></b></div><div><span>Off jobs</span><b>${shift && shift.in ? f2(Math.max(0, onClock - onJobs)) : '—'}<small>${shift && shift.in ? 'h' : ''}</small></b></div><div><span>Efficiency</span><b class="${eff == null ? '' : eff >= 100 ? 'px-good' : 'px-warn'}">${eff == null ? '—' : eff}<small>${eff == null ? '' : '%'}</small></b></div></div>
  </section>
  <div class="pm-h"><h2>Ready to work</h2><span>${ready.length}</span></div>
  <div class="pm-list">${ready.map(([r, o]) => jobRow(r, o)).join('') || '<div class="pm-empty">Nothing ready. Waiting jobs are below.</div>'}</div>
  ${waiting.length ? `<div class="pm-h"><h2>Waiting</h2><span>${waiting.length}</span></div><div class="pm-list">${waiting.map(([r, o]) => jobRow(r, o)).join('')}</div>` : ''}
  <p class="pm-hint" style="margin-top:20px">${ic('sync')}${S.sync.in ? 'ROs from the computer ' + fshort(S.sync.in) + '.' : 'Sample ROs — get yours from the computer in Sync.'} Swipe a job left to start its clock.</p>
</div>`;
}
const meBtn = () => `<button class="pm-meBtn" data-act="go" data-href="#/me" aria-label="Me and settings"><span class="px-av px-av--md px-av--me">${esc(initials(S.me.name) || 'ME')}</span></button>`;
const initials = n => String(n || '').trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase();

function screenRos(v) {
  const q = UI.q.trim().toLowerCase();
  const list = v.ros.filter(r => !q || [r.no, r.cust, r.vin, r.unit, r.tag, r.ymm].join(' ').toLowerCase().includes(q));
  const row = r => { const st = roStatus(r), t = roTotals(r), pct = Math.max(0, Math.min(100, +r.pct || 0)), C = 2 * Math.PI * 14;
    return `<div class="pm-rorow" data-act="go" data-href="${roHref(r.id)}"><svg class="pm-ring" viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="14"/><circle class="p" cx="17" cy="17" r="14" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pct / 100)).toFixed(1)}"/></svg>
    <div class="pm-rorow__main"><div class="pm-job__meta">${si(st.shape)}<span class="px-id">RO-${esc(r.no)}</span><span>${esc(nice(st.name))}${st.sub ? ' · ' + esc(st.sub) : ''}</span></div><div class="pm-rorow__t">${esc(r.cust)}</div><div class="pm-job__time"><span>${esc([r.ymm, r.unit ? 'Unit ' + r.unit : '', r.tag ? 'Tag ' + r.tag : ''].filter(Boolean).join(' · '))}</span></div></div>
    <span class="pm-badge">${f2(t.b)} / ${f2(t.q)} h</span></div>`; };
  return `<div class="wrap"><header><div class="pm-eyebrow">${v.ros.length} open</div><div class="pm-hero__row"><h1 class="pm-title">ROs</h1>${meBtn()}</div></header>
  ${S.pc ? `<div class="pm-search">${ic('search')}<input class="pm-in" type="search" inputmode="search" placeholder="RO, customer, VIN, unit or tag" value="${esc(UI.q)}" data-input="q" aria-label="Search ROs"></div>` : ''}
  <div class="pm-list" style="margin-top:8px">${list.map(row).join('') || `<div class="pm-empty">${S.pc ? 'No RO matches.' : 'No ROs yet — get them from the computer in Sync.'}</div>`}</div></div>`;
}
function nextFor(r) {
  const ops = r.ops.filter(o => !o.d);
  const run = RUN() && RUN().roId === r.id ? ops.find(o => o.id === RUN().opId) : null;
  const wp = ops.find(o => /Parts/.test(opStatus(o).name) && /^Waiting/.test(opStatus(o).name));
  if (wp) { const out = wp.pt.filter(p => !inHand(p.st)).length; return { for: `Operation ${wp.n}`, t: `Operation ${wp.n} is waiting on parts — ${out || 'no'} part${out === 1 ? '' : 's'} not in hand.`, a: [['Open parts', 'next', `parts|${wp.id}`, '']] }; }
  const wc = ops.find(o => /Customer|Approval/.test(opStatus(o).name));
  if (wc) { const other = ops.find(o => o !== wc && !isDone(o) && !isWaiting(o)); return { for: `Operation ${wc.n}`, t: `Operation ${wc.n} is waiting on approval${other ? ` — keep going on operation ${other.n}.` : '.'}`, a: other && !run ? [['Start operation ' + other.n, 'start', other.id, 'accent']] : [] }; }
  const nofix = ops.find(o => /^Complete/.test(opStatus(o).name) && (!String(o.ca).trim() || !String(o.fx).trim()));
  if (nofix) return { for: `Operation ${nofix.n}`, t: `Operation ${nofix.n} is complete — add the cause and fix before close-out.`, a: [['Write cause and fix', 'next', `edit|${nofix.id}`, 'accent']] };
  if (run) return { for: `Operation ${run.n}`, t: `Clock running on operation ${run.n} · ${run.c}.`, a: [['Take a photo', 'next', `photo|${run.id}`, '']] };
  const todo = ops.find(o => !isDone(o) && !isWaiting(o));
  if (todo) return { for: `Operation ${todo.n}`, t: `Operation ${todo.n} is ready — ${f2(Math.max(0, todo.q - burnt(todo)))} h left on the quote.`, a: [['Start clock', 'start', todo.id, 'accent']] };
  return { for: 'All operations', t: 'Nothing waiting on you here.', a: [], clear: true };
}
function opRow(r, o) {
  const st = opStatus(o), live = RUN() && RUN().opId === o.id, outP = o.pt.filter(p => !inHand(p.st)).length;
  const meta = st.name !== 'Hold Tech' && st.name !== 'Working' ? nice(st.name) + (st.sub ? ' · ' + st.sub : '') : outP ? `${outP} part${outP > 1 ? 's' : ''} not in hand` : '';
  const row = `<div class="pm-op${o.d ? ' is-declined' : ''}" data-act="go" data-href="${opHref(r.id, o.id)}" data-lp="opmenu" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">${si(st.shape)}<div class="pm-op__main"><div class="pm-op__t"><span class="pm-op__n">${o.n}</span>${esc(o.c)}${o.local ? ' <span class="pm-badge">New</span>' : ''}${live ? ' <span class="pm-badge pm-badge--accent">Running</span>' : ''}${o.live ? ' <span class="pm-badge">On the computer</span>' : ''}</div>
    <div class="pm-op__sub">${tag(o.t)}${mini(burnt(o), o.q)}<span><span data-tick="burnt" data-op="${esc(o.id)}">${f2(burnt(o))}</span> <em>/ ${f2(o.q)} h</em></span>${meta ? `<span class="pm-op__m">${esc(meta)}</span>` : ''}</div></div>${ic('chevR', 'px-ico pm-op__go')}</div>`;
  if (live || isDone(o) || isWaiting(o)) return row;
  return `<div class="pm-swipe" data-swipe><button class="pm-swipe__act" data-act="start" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">${ic('play')}<span>Start clock</span></button><div class="pm-swipe__row">${row}</div></div>`;
}
function screenRo(v, rt) {
  const r = v.ro[rt.ro]; if (!r) return gone();
  const st = roStatus(r), t = roTotals(r), sg = stagesOf(r), nx = nextFor(r);
  const ticks = sg.list.map(([k, s], i) => `<i class="${i === sg.now && s !== 'wait' ? 'is-now' : s === 'done' ? 'is-done' : s === 'skip' ? 'is-skip' : s === 'wait' ? 'is-wait' : ''}" title="${STAGES[i][1]}"></i>`).join('');
  const eta = r.eta === 'ready' ? 'Ready to close' : r.eta ? 'Ready about ' + fdate(r.eta).split(',')[0] + ' ' + hm(r.eta) : '';
  const from = UI.from[r.id] || '#/today';
  return `<div class="wrap">
  <nav class="pm-nav"><button class="pm-back" data-act="go" data-href="${from}">${ic('chevL')}${from === '#/ros' ? 'ROs' : 'Today'}</button><span class="pm-nav__acts"><button class="px-btn px-btn--ghost px-btn--icon" data-act="romenu" data-ro="${esc(r.id)}" aria-label="RO options">${ic('more')}</button></span></nav>
  <div class="pm-eyebrow"><span class="px-id">RO-${esc(r.no)}</span>${r.unit ? '<span>·</span><span>Unit ' + esc(r.unit) + '</span>' : ''}${r.tag ? '<span>·</span><span>Tag ' + esc(r.tag) + '</span>' : ''}</div>
  <h1 class="pm-title">${esc(r.cust || 'Customer')}</h1>
  <div class="pm-sub">${esc([r.ymm, r.vin ? 'VIN …' + r.vin.slice(-6) : ''].filter(Boolean).join(' · '))}</div>
  <div class="pm-ro__status"><button class="px-status--button" data-act="stage" data-ro="${esc(r.id)}">${si(st.shape)}<span>${esc(nice(st.name))}</span>${st.sub ? `<span class="px-status__sub">· ${esc(st.sub)}</span>` : ''}${ic('chevD', 'px-ico px-chev')}</button>${r.ops.some(o => o.live) ? '<span class="pm-badge">Clock running on the computer</span>' : ''}</div>
  <div class="pm-totals">
    <button class="pm-tot" data-act="tot" data-k="time" data-ro="${esc(r.id)}"><span>${ic('clock')}Time</span><b><span data-tick="rob" data-ro="${esc(r.id)}">${f2(t.b)}</span><em>/ ${f2(t.q)} h</em></b></button>
    <button class="pm-tot" data-act="tot" data-k="parts" data-ro="${esc(r.id)}"><span>${ic('parts')}Parts</span><b>${t.inh}<em>/ ${t.np}</em></b></button>
    <button class="pm-tot" data-act="tot" data-k="files" data-ro="${esc(r.id)}"><span>${ic('clip')}Files</span><b>${t.nf}</b></button>
  </div>
  <button class="pm-stage" data-act="stage" data-ro="${esc(r.id)}"><div class="pm-stage__top"><b>${STAGES[sg.now][1]}</b><span>· stage ${sg.now + 1} of 7</span><span class="r">${esc(eta)}</span></div><div class="pm-ticks">${ticks}</div></button>
  <div class="px-next pm-next${nx.clear ? ' is-clear' : ''}"><div class="px-next__head"><span class="px-next__k">Next</span><span class="px-next__for">${esc(nx.for)}</span></div><div class="px-next__body"><p class="px-next__t">${esc(nx.t)}</p>${nx.a.length ? `<div class="px-next__acts">${nx.a.map(a => `<button class="px-btn px-btn--sm${a[3] ? ' px-btn--accent' : ''}" data-act="${a[1]}" data-ro="${esc(r.id)}" data-op="${esc(a[2].split('|').pop())}" data-x="${esc(a[2])}">${esc(a[0])}</button>`).join('')}</div>` : ''}</div></div>
  <div class="pm-h"><h2>Operations</h2><span>${r.ops.length}</span><button class="pm-link" data-act="addop" data-ro="${esc(r.id)}">Add</button></div>
  <div class="pm-list">${r.ops.map(o => opRow(r, o)).join('') || '<div class="pm-empty">No operations yet.</div>'}</div>
  <div class="pm-h"><h2>Details</h2></div>
  <div class="pm-props">
    <button class="pm-prop" data-act="copy" data-v="${esc(r.vin)}"><span>VIN</span><b class="px-id">${esc(r.vin || '—')}</b>${ic('copy')}</button>
    <button class="pm-prop" data-act="tot" data-k="files" data-ro="${esc(r.id)}"><span>Photos</span><b>${S.photos.filter(p => p.roId === r.id).length} on this phone · ${r.att.length} on the computer</b>${ic('chevR')}</button>
    <div class="pm-prop"><span>Key tag</span><b class="px-id">${esc(r.tag || '—')}</b></div>
    <div class="pm-prop"><span>Progress</span><b>${Math.round(+r.pct || 0)}% · ${esc(eta || 'no forecast')}</b></div>
  </div>
</div>`;
}
function screenOp(v, rt) {
  const r = v.ro[rt.ro], o = r && v.op[rt.op]; if (!r || !o || o.ro !== r.id) return gone();
  const st = opStatus(o), live = RUN() && RUN().opId === o.id, b = burnt(o), tab = UI.ptab[o.id] || 'parts';
  const inh = o.pt.filter(p => inHand(p.st)).length, nTime = o.tl.length + o.lt.length, nNotes = o.nt.length + o.ln.length, photos = S.photos.filter(p => p.opId === o.id), pcf = r.att.filter(a => a.op === o.n);
  const eff = b > 0 ? Math.round(o.q / b * 100) : null;
  const parts = o.pt.map((p, ix) => {
    const key = p.src === 'ph' ? 'ph:' + p.id : 'pc:' + p.i;
    const row = `<div class="pm-part" data-lp="part" data-ro="${esc(r.id)}" data-op="${esc(o.id)}" data-p="${esc(key)}"><div><b>${esc(p.d || 'Part')}</b><small>${p.pn ? `<span class="px-id">${esc(p.pn)}</span> · ` : ''}Qty ${esc(p.q)}${p.src === 'ph' ? ' · added here' : ''}</small></div><button class="pm-pill" data-act="part" data-ro="${esc(r.id)}" data-op="${esc(o.id)}" data-p="${esc(key)}">${psi(p.st)}<span>${esc(p.st === 'Not Ordered' ? 'Not ordered' : p.st)}</span>${ic('chevD', 'px-ico px-chev')}</button></div>`;
    return p.st === 'Received' || p.st === 'Installed' ? row : `<div class="pm-swipe" data-swipe><button class="pm-swipe__act" data-act="setpart" data-ro="${esc(r.id)}" data-op="${esc(o.id)}" data-p="${esc(key)}" data-st="Received">${ic('check')}<span>Received</span></button><div class="pm-swipe__row">${row}</div></div>`;
  }).join('');
  const times = o.tl.map(t => ({ s: t[0], e: t[1], r: t[2], sr: t[3], by: t[4], src: 'pc' })).concat(o.lt.map(x => Object.assign({ src: 'ph' }, x))).sort((a, c) => new Date(c.s) - new Date(a.s));
  const timeHtml = times.map(t => `<div class="pm-trow"${t.src === 'ph' && !t.sentAt ? ` data-act="edittime" data-ro="${esc(r.id)}" data-op="${esc(o.id)}" data-id="${esc(t.id)}"` : ''}><div><b>${fdate(t.s)}</b><small>${hm(t.s)} – ${t.e ? hm(t.e) : 'now'} · ${esc(t.r || '—')}${t.sr ? ' → ' + esc(nice(t.sr)) : ''}</small></div><span>${t.e ? fdur(new Date(t.e) - new Date(t.s)) : 'running'}${t.src === 'ph' ? `<span class="pm-badge">${t.rejected ? 'Not taken' : t.sentAt ? 'Sent' : 'Phone'}</span>` : ''}</span></div>`).join('');
  const notes = o.nt.map(n => ({ a: n.a, x: n.x, src: 'pc' })).concat(o.ln.map(n => ({ a: n.at, x: n.x, src: 'ph', sent: !!n.sentAt }))).sort((a, c) => new Date(c.a) - new Date(a.a));
  const noteHtml = notes.map(n => `<div class="pm-note"><p>${esc(n.x)}</p><small>${fshort(n.a)}${n.src === 'ph' ? (n.sent ? ' · sent from this phone' : ' · on this phone, not synced yet') : ' · from the computer'}</small></div>`).join('');
  const tabs = [['parts', 'Parts', o.pt.length ? inh + '/' + o.pt.length : ''], ['time', 'Time', nTime || ''], ['notes', 'Notes', nNotes || ''], ['files', 'Files', photos.length + pcf.length || '']];
  return `<div class="wrap">
  <nav class="pm-nav"><button class="pm-back" data-act="go" data-href="${roHref(r.id)}">${ic('chevL')}RO-${esc(r.no)}</button><span class="pm-nav__t">Operation ${o.n} of ${r.ops.length}</span><span class="pm-nav__acts"><button class="px-btn px-btn--ghost px-btn--icon" data-act="opmenu" data-ro="${esc(r.id)}" data-op="${esc(o.id)}" aria-label="Operation options">${ic('more')}</button></span></nav>
  <div class="pm-optitle"><div class="pm-tags">${tag(o.t)}<button class="px-status--button" style="height:30px;font-size:13px" data-act="opstatus" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">${si(st.shape)}<span>${esc(nice(st.name))}</span>${st.sub ? `<span class="px-status__sub">· ${esc(st.sub)}</span>` : ''}${ic('chevD', 'px-ico px-chev')}</button></div><h1 data-act="editop" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">${esc(o.c)}</h1></div>
  ${o.live ? `<div class="pm-warn">${ic('clock')}<span>The clock is running on this operation on the computer. Stop it there before you clock it here, or the time doubles up.</span></div>` : ''}
  <div class="pm-clock${live ? ' is-live' : ''}">
    <div class="pm-clock__v" data-tick="clock" data-op="${esc(o.id)}">${fclock(b * 3600)}</div>
    <button class="pm-clock__cap" ${live ? 'data-act="reason"' : 'data-act="noop"'}><span class="pm-cbar__dot"></span>${live ? `Clock running · ${esc(RUN().r)} ${ic('chevD')}` : `On this operation · ${nTime} entr${nTime === 1 ? 'y' : 'ies'}`}</button>
    <div class="px-bar"><div class="px-bar__fill" data-tick="bar" data-op="${esc(o.id)}" style="width:${o.q ? Math.min(100, b / o.q * 100).toFixed(1) : 0}%"></div><div class="px-bar__q" style="left:calc(100% - 2px)"></div></div>
    <div class="px-time__stats"><div><span>Quoted</span><b>${f2(o.q)}<small>h</small></b></div><div><span>Burnt</span><b><span data-tick="burnt" data-op="${esc(o.id)}">${f2(b)}</span><small>h</small></b></div><div><span>Left</span><b><span data-tick="left" data-op="${esc(o.id)}">${f2(Math.max(0, o.q - b))}</span><small>h</small></b></div><div><span>Efficiency</span><b class="${eff == null ? '' : eff >= 100 ? 'px-good' : 'px-warn'}"><span data-tick="eff" data-op="${esc(o.id)}">${eff == null ? '—' : eff}</span><small>${eff == null ? '' : '%'}</small></b></div></div>
  </div>
  <div class="px-seg px-seg--fill pm-seg" role="tablist">${tabs.map(([k, l, n]) => `<button class="${k === tab ? 'is-on' : ''}" role="tab" aria-selected="${k === tab}" data-act="ptab" data-op="${esc(o.id)}" data-k="${k}">${l}${n !== '' ? ` <span class="n">${n}</span>` : ''}</button>`).join('')}</div>
  <div ${tab === 'parts' ? '' : 'hidden'}>${parts || '<div class="pm-empty">No parts on this operation.</div>'}<button class="pm-addrow" data-act="addpart" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">${ic('plus')}Add part</button></div>
  <div ${tab === 'time' ? '' : 'hidden'}>${timeHtml || '<div class="pm-empty">No time yet — start the clock below.</div>'}<button class="pm-addrow" data-act="addtime" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">${ic('plus')}Add time entry</button></div>
  <div ${tab === 'notes' ? '' : 'hidden'}>
    <div class="pm-compose"><textarea class="pm-in" id="noteIn" rows="3" placeholder="Work performed — Return adds the date and time" enterkeyhint="done" autocapitalize="sentences" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">${esc(S.ui['draft:' + o.id] || '')}</textarea>
    <div class="pm-compose__acts"><button class="px-btn px-btn--primary" data-act="savenote" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">Add note</button><button class="px-btn" data-act="editop" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">Cause and fix</button></div>
    <p class="pm-hint">${ic('mic')}${SR ? 'Hold Note below to dictate — the date and time stamp is added when you let go.' : 'Tap the mic on your keyboard to dictate.'}</p></div>
    ${o.ca || o.fx ? `<div class="pm-note"><small>Cause</small><p>${esc(o.ca || '—')}</p></div><div class="pm-note"><small>Fix</small><p>${esc(o.fx || '—')}</p></div>` : ''}
    ${noteHtml}
  </div>
  <div ${tab === 'files' ? '' : 'hidden'}>
    <div class="pm-files">${photos.map(p => `<button class="pm-file" data-act="viewphoto" data-id="${esc(p.id)}" data-thumb="${esc(p.id)}"><span>${esc(PHOTO_KIND[p.kind] || 'Picture')} · ${hm(p.at)}</span></button>`).join('')}<button class="pm-file pm-file--add" data-act="photo" data-ro="${esc(r.id)}" data-op="${esc(o.id)}" data-kind="pic">${ic('camera')}<span>Add photo</span></button></div>
    ${pcf.length ? `<div class="pm-sgrp"><b>On the computer</b></div>${pcf.map(a => `<div class="pm-pcfile">${ic('clip')}<span>${esc(a.n)}</span><small>${a.at ? fshort(a.at) : ''}</small></div>`).join('')}` : ''}
    <p class="pm-hint">${ic('camera')}Photos stay on this phone until you share them to the RO's Attachments folder — QR codes can't carry pictures.</p>
  </div>
</div>`;
}
function screenSync(v) {
  const box = outbox(), n = box.count;
  const rows = [['New operations', box.ops.length], ['Clock time', box.ch.filter(x => x.k === 'time').length], ['Part changes', box.ch.filter(x => x.k === 'part' || x.k === 'pstat').length], ['Notes', box.ch.filter(x => x.k === 'note').length], ['Operation edits', box.ch.filter(x => x.k === 'edit').length], ['Stage steps', box.tk.length]];
  const send = UI.sync === 'send';
  return `<div class="wrap"><header><div class="pm-eyebrow">No network needed</div><div class="pm-hero__row"><h1 class="pm-title">Sync</h1>${meBtn()}</div></header>
  <div class="px-seg px-seg--fill pm-seg" style="margin-top:16px"><button class="${send ? 'is-on' : ''}" data-act="syncmode" data-k="send">Send to computer</button><button class="${send ? '' : 'is-on'}" data-act="syncmode" data-k="get">Get from computer</button></div>
  ${send ? `<div data-syncsend>
    ${n || UI.forceSend ? `<div class="pm-qr"><svg class="pm-qr__ring" viewBox="0 0 264 264"><circle cx="132" cy="132" r="126"/><circle class="p" cx="132" cy="132" r="126" data-ring style="stroke-dasharray:791.7;stroke-dashoffset:791.7"/></svg><div class="pm-qr__box"><canvas data-qr aria-label="QR codes for the computer"></canvas></div></div>
    <div class="pm-qr__cap"><b data-qrn>Getting codes ready…</b><span>On the computer: Phone sync → Get from phone. Hold this screen up to the webcam, 20 cm away. The codes loop and the screen stays awake.</span></div>
    <button class="px-btn pm-big" style="margin-top:16px" data-act="syncdone">Done — the computer said Done</button>`
    : `<div class="pm-card" style="text-align:center"><p style="margin:4px 0 12px;font-size:15px">Nothing new to send.</p><button class="px-btn" data-act="forcesend">Show codes anyway</button></div>`}
    <div class="pm-card"><div class="pm-sync__h">Going to the computer</div>${rows.map(([l, c]) => `<div class="pm-sync__r"><span>${l}</span><b>${c}</b></div>`).join('')}
    <div class="pm-sync__f">${S.sync.out ? 'Last sent ' + fshort(S.sync.out) + '. ' : ''}Changes stay here until the computer confirms them on the next Get from computer.</div></div></div>`
  : `<div data-syncget><div class="pm-cam"><video playsinline muted data-video></video><div class="pm-cam__f"><i></i><i></i><i></i><i></i></div><div class="pm-cam__msg" data-cammsg>Point the camera at the codes on the computer screen</div></div>
    <div class="pm-bar2"><i data-scanbar style="width:0%"></i></div>
    <div class="pm-qr__cap"><b data-scann>Waiting for codes…</b><span>On the computer: Phone sync → Send to phone.</span></div><div data-scanres></div></div>
    <div class="pm-card"><div class="pm-sync__h">On this phone</div><div class="pm-sync__r"><span>Open ROs</span><b>${v.ros.length}</b></div><div class="pm-sync__r"><span>Waiting to send</span><b>${n}</b></div><div class="pm-sync__f">${S.sync.in ? 'Last got from the computer ' + fshort(S.sync.in) + '.' : S.sample ? 'Showing sample ROs. Your first sync replaces them.' : 'Never synced.'}</div></div>`}
</div>`;
}
function screenMe() {
  const th = S.prefs.theme;
  return `<div class="wrap"><header><div class="pm-eyebrow">Parsec Mobile ${APPV}</div><div class="pm-hero__row"><h1 class="pm-title">Me</h1></div></header>
  <div class="pm-card"><div class="pm-field" style="margin:0"><label for="meName">Your name</label><input id="meName" class="pm-in" data-input="name" value="${esc(S.me.name)}" placeholder="First and last name" autocomplete="name"></div></div>
  <div class="pm-h"><h2>Look</h2></div>
  <div class="pm-set"><span>Theme<small>System follows the phone's dark mode</small></span><div class="px-seg">${[['system', 'System'], ['light', 'Ivory'], ['dark', 'Graphite']].map(([k, l]) => `<button class="${th === k ? 'is-on' : ''}" data-act="theme" data-k="${k}">${l}</button>`).join('')}</div></div>
  <div class="pm-set"><span>Bay mode<small>Bigger type and buttons for gloves and bright bays</small></span><button class="px-toggle${S.prefs.bay ? ' is-on' : ''}" data-act="bay" role="switch" aria-checked="${!!S.prefs.bay}" aria-label="Bay mode"></button></div>
  <div class="pm-h"><h2>Data on this phone</h2></div>
  <div class="pm-props">
    ${S.sample ? '<button class="pm-prop" data-act="unsample"><span>Sample ROs</span><b>Remove them</b>' + ic('chevR') + '</button>' : (!S.pc ? '<button class="pm-prop" data-act="sample"><span>Sample ROs</span><b>Try the app with sample ROs</b>' + ic('chevR') + '</button>' : '')}
    <button class="pm-prop" data-act="export"><span>Backup</span><b>Save a backup file (no photos)</b>${ic('chevR')}</button>
    <label class="pm-prop" style="cursor:pointer"><span>Restore</span><b>Open a backup file</b>${ic('chevR')}<input type="file" accept="application/json,.json" data-input="import" class="sr"></label>
    <button class="pm-prop" data-act="erase"><span>Erase</span><b style="color:var(--bad)">Erase everything on this phone</b>${ic('chevR')}</button>
  </div>
  <div class="pm-about">Add Parsec Mobile to your home screen from the browser's Share or menu button. It keeps working with no signal; everything stays on this phone until you sync it to the computer by QR codes.<br>Photos ${S.photos.length} · Waiting to send ${outbox().count}</div>
</div>`;
}
const gone = () => `<div class="wrap"><nav class="pm-nav"><button class="pm-back" data-act="go" data-href="#/today">${ic('chevL')}Today</button></nav><div class="pm-empty">That RO is no longer on this phone — it may have closed on the computer.</div></div>`;

/* ---------- render ---------- */
const app = $('#app'), view = $('#view'), bottom = $('#bottom'), layer = $('#layer');
function render(opts) {
  const rt = route(); CUR = V();
  if (UI.last && UI.last !== rt.key) UI.scroll[UI.last] = view.scrollTop;
  const entering = UI.last !== rt.key;
  if (rt.name === 'ro' && entering) { if (UI.last === 'ros') UI.from[rt.ro] = '#/ros'; else if (!UI.last || UI.last === 'today' || !UI.from[rt.ro]) UI.from[rt.ro] = '#/today'; }
  if (UI.last === 'sync' && rt.key !== 'sync') syncStop();
  const html = rt.name === 'ros' ? screenRos(CUR) : rt.name === 'sync' ? screenSync(CUR) : rt.name === 'me' ? screenMe() : rt.name === 'ro' ? screenRo(CUR, rt) : rt.name === 'op' ? screenOp(CUR, rt) : screenToday(CUR);
  const keep = !entering ? view.scrollTop : (UI.scroll[rt.key] || 0);
  view.innerHTML = html; view.className = 'view' + (entering ? ' is-enter' : '');
  view.scrollTop = keep;
  UI.last = rt.key;
  renderBottom(rt);
  thumbs();
  if (rt.name === 'sync' && (entering || (opts && opts.sync))) syncStart();
  if (entering) closeSheet(true);
}
function renderBottom(rt) {
  const run = RUN(), o = run && CUR.op[run.opId], r = run && CUR.ro[run.roId];
  const cbar = run && rt.name !== 'op' ? `<div class="pm-cbar" data-act="go" data-href="${opHref(run.roId, run.opId)}" role="button" aria-label="Running clock — open the job"><span class="pm-cbar__dot"></span><div class="pm-cbar__t"><small>${r ? 'RO-' + esc(r.no) + ' · Operation ' + (o ? o.n : '') : 'Clock running'} · ${esc(run.r)}</small><b>${esc(o ? o.c : 'Operation')}</b></div><span class="pm-cbar__v" data-tick="mini">${fclock(o ? burnt(o) * 3600 : runSecs())}</span><button class="pm-cbar__stop" data-act="stop" aria-label="Stop clock">${ic('stop')}</button></div>` : '';
  if (rt.name === 'op') {
    const o2 = CUR.op[rt.op], live = run && run.opId === rt.op;
    bottom.innerHTML = o2 ? `<div class="pm-actbar"><div class="pm-actbar__in"><button class="pm-act" data-act="photo" data-ro="${esc(rt.ro)}" data-op="${esc(rt.op)}" data-kind="pic">${ic('camera')}<span>Photo</span></button><button class="pm-act" data-dict data-ro="${esc(rt.ro)}" data-op="${esc(rt.op)}">${ic('mic')}<span>Note</span></button><button class="pm-go${live ? ' is-live' : ''}" data-act="${live ? 'stop' : 'start'}" data-ro="${esc(rt.ro)}" data-op="${esc(rt.op)}">${ic(live ? 'stop' : 'play')}<span>${live ? 'Stop clock' : 'Start clock'}</span></button></div></div>` : '';
    $('#toast').classList.add('is-low');
    return;
  }
  $('#toast').classList.toggle('is-low', !cbar);
  const n = outbox().count;
  const T = [['today', 'Today', 'today', '#/today'], ['ros', 'ROs', 'ros', '#/ros'], ['sync', 'Sync', 'sync', '#/sync'], ['me', 'Me', 'user', '#/me']];
  const on = rt.name === 'ro' ? (UI.from[rt.ro] === '#/ros' ? 'ros' : 'today') : rt.name;
  bottom.innerHTML = cbar + `<nav class="pm-tabs">${T.map(([k, l, i, h]) => `<button class="pm-tab${k === on ? ' is-on' : ''}" data-act="go" data-href="${h}" aria-current="${k === on ? 'page' : 'false'}">${ic(i)}<span>${l}</span>${k === 'sync' && n ? `<span class="pm-tab__n">${n > 99 ? '99+' : n}</span>` : ''}</button>`).join('')}</nav>`;
}
function thumbs() { $$('[data-thumb]', view).forEach(el => photoUrl(el.dataset.thumb).then(u => { if (u) el.style.backgroundImage = `url("${u}")`; })); }
function commit(opts) { save(); render(opts); }

/* live numbers, every second, without re-rendering */
function tick() {
  if (!CUR || !RUN()) return;
  const run = RUN(), o = CUR.op[run.opId]; if (!o) return;
  const b = burnt(o);
  $$(`[data-op="${CSS.escape(o.id)}"]`).forEach(el => {
    const k = el.dataset.tick; if (!k) return;
    if (k === 'clock') el.textContent = fclock(b * 3600);
    else if (k === 'burnt') el.textContent = f2(b);
    else if (k === 'left') el.textContent = f2(Math.max(0, o.q - b));
    else if (k === 'eff') el.textContent = b > 0 ? Math.round(o.q / b * 100) : '—';
    else if (k === 'bar') el.style.width = (o.q ? Math.min(100, b / o.q * 100) : 0) + '%';
  });
  $$('[data-tick="mini"]').forEach(el => el.textContent = fclock(b * 3600));
  $$(`[data-tick="rob"][data-ro="${CSS.escape(run.roId)}"]`).forEach(el => { const r = CUR.ro[run.roId]; if (r) el.textContent = f2(roTotals(r).b); });
  if (new Date().getSeconds() === 0 && route().name === 'today') render();
}

/* ---------- sheets + toast ---------- */
let SHEET = null;
function openSheet(html, onOpen) {
  closeSheet(true); const tw = $('#toast'); if (tw) tw.innerHTML = '';
  const s = document.createElement('div'); s.className = 'pm-sheet';
  s.innerHTML = `<div class="pm-sheet__p" role="dialog" aria-modal="true"><div class="pm-sheet__grabzone" data-grab><div class="pm-sheet__grab"></div></div>${html}</div>`;
  layer.appendChild(s); SHEET = s;
  s.addEventListener('click', e => { if (e.target === s) closeSheet(); });
  const g = $('[data-grab]', s), p = $('.pm-sheet__p', s); let y0 = null, dy = 0;
  g.addEventListener('pointerdown', e => { y0 = e.clientY; dy = 0; g.setPointerCapture(e.pointerId); p.style.transition = 'none'; });
  g.addEventListener('pointermove', e => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); p.style.transform = `translateY(${dy}px)`; });
  const end = () => { if (y0 == null) return; y0 = null; p.style.transition = 'transform .2s ease-out'; if (dy > 90) closeSheet(); else p.style.transform = ''; };
  g.addEventListener('pointerup', end); g.addEventListener('pointercancel', end);
  onOpen && onOpen(s);
  const f = $('[data-autofocus]', s); if (f) setTimeout(() => { try { f.focus(); } catch (e) {} }, 300);
  return s;
}
function closeSheet(now) { const s = SHEET; if (!s) return; SHEET = null; if (now) { s.remove(); return; } s.classList.add('is-closing'); setTimeout(() => s.remove(), 140); }
let toastT;
function toast(msg, undo) {
  const w = $('#toast'); w.innerHTML = `<div class="px-toast" role="status">${msg}${undo ? '<button class="px-toast__act">Undo</button>' : ''}</div>`;
  if (undo) $('button', w).onclick = () => { w.innerHTML = ''; undo(); };
  clearTimeout(toastT); toastT = setTimeout(() => { w.innerHTML = ''; }, undo ? 6000 : 3200);
}

/* ---------- the clock ---------- */
function defaultReason(o) { return o && (o.t === 'DIAG' || o.t === 'COMEBACK') ? 'Diagnosing' : o && o.t === 'PM' ? 'Inspecting' : 'Repairing'; }
function ensureClockIn(at) { const k = dayKey(at); const sh = S.shift[k]; if (!sh || !sh.in) { S.shift[k] = { in: at, out: null }; return true; } if (sh.out) { sh.out = null; } return false; }
function startClock(roId, opId) {
  const o = CUR.op[opId], r = CUR.ro[roId]; if (!o || !r) return;
  if (RUN() && RUN().opId === opId) return;
  let msg = '';
  if (RUN()) { const prev = CUR.op[RUN().opId]; endRun('Waiting – New Job', true); msg = prev ? ` · stopped operation ${prev.n}` : ''; }
  const at = nowIso(), auto = ensureClockIn(at);
  S.L.run = { id: uid('pn'), roId, opId, s: at, r: defaultReason(o) };
  buzz(); commit();
  toast(si('working') + `Clock started · Operation ${o.n}${msg}${auto ? ' · clocked in' : ''}`, () => { S.L.run = null; commit(); });
}
function endRun(reason, quiet) {
  const run = RUN(); if (!run) return null;
  const e = new Date(), s = new Date(run.s); S.L.run = null;
  if (e - s < 60000) { if (!quiet) toast('Clock stopped · under a minute, nothing logged'); return null; }
  const x = { id: run.id, roId: run.roId, opId: run.opId, s: run.s, e: e.toISOString(), r: run.r, sr: reason || null, at: e.toISOString() };
  S.L.entries.push(x); return x;
}
function stopClock(reason) {
  const run = RUN(); if (!run) return; const o = CUR.op[run.opId];
  const x = endRun(reason); buzz();
  if (reason === 'End of day') { const sh = S.shift[dayKey(new Date())]; if (sh) sh.out = nowIso(); }
  commit();
  if (x) toast(si('hold') + `Clock stopped · Operation ${o ? o.n : ''} · ${fdur(new Date(x.e) - new Date(x.s))}`, () => { S.L.entries = S.L.entries.filter(e => e.id !== x.id); S.L.run = { id: x.id, roId: x.roId, opId: x.opId, s: x.s, r: x.r }; commit(); });
}
function stopSheet() {
  const run = RUN(); if (!run) return; const o = CUR.op[run.opId];
  openSheet(`<div class="pm-sheet__h"><h3>Stop the clock</h3><p>Operation ${o ? o.n + ' · ' + esc(o.c) : ''} · <span data-tick="mini">${fclock(o ? burnt(o) * 3600 : 0)}</span></p></div>
    ${STOP_EXPLICIT.map(s => `<button class="pm-srow" data-act="stopwith" data-k="${esc(s)}">${si(s === 'Complete' ? 'released' : s === 'Waiting – New Job' ? 'hold' : shapeOf(s))}<span>${esc(nice(s))}</span></button>`).join('')}
    <div class="pm-ssep"></div>${STOP_BREAK.map(s => `<button class="pm-srow" data-act="stopwith" data-k="${esc(s)}">${ic(s === 'Lunch' ? 'clock' : 'exit')}<span>${s}</span>${s === 'End of day' ? '<small>also clocks you out</small>' : ''}</button>`).join('')}`);
}

/* ---------- outbox: what goes to the computer (format the computer reads) ---------- */
function outbox() {
  const L = S.L, cut = x => { const o = Object.assign({}, x); delete o.sentAt; return o; };
  const ops = L.ops.map(x => ({ id: x.id, roId: x.roId, c: x.c, t: x.t, at: x.at }));
  const tk = L.ticks.map(x => ({ id: x.id, roId: x.roId, key: x.key, v: !!x.v, at: x.at }));
  const ch = [].concat(
    L.notes.map(x => ({ id: x.id, roId: x.roId, opId: x.opId, at: x.at, k: 'note', x: x.x })),
    L.parts.map(x => ({ id: x.id, roId: x.roId, opId: x.opId, at: x.at, k: 'part', d: x.d, pn: x.pn, q: x.q, pr: x.pr || 0 })),
    L.edits.map(x => ({ id: x.id, roId: x.roId, opId: x.opId, at: x.at, k: 'edit', f: x.f })),
    L.entries.map(x => ({ id: x.id, roId: x.roId, opId: x.opId, at: x.at || x.e, k: 'time', s: x.s, e: x.e, r: x.r, sr: x.sr || null, by: S.me.name || '' })),
    L.pstat.map(x => ({ id: x.id, roId: x.roId, opId: x.opId, at: x.at, k: 'pstat', i: x.i, pn: x.pn, d: x.d, pid: x.pid || null, st: x.st }))
  ).map(cut);
  return { ops, tk, ch, count: ops.length + tk.length + ch.length };
}
function phBundle() { const b = outbox(); return { t: 'ph', v: 2, app: 'Parsec Mobile ' + APPV, at: nowIso(), by: S.me.name || '', ops: b.ops, tk: b.tk, ch: b.ch }; }
function applyPc(b) {
  if (!b || b.t !== 'pc' || !Array.isArray(b.ros)) return { ok: false, msg: 'Those codes did not come from Parsec on the computer.' };
  const ack = {}; (b.ack || []).forEach(id => { ack[id] = 1; });
  const wasSample = S.sample, roIds = {}; b.ros.forEach(r => { roIds[r.id] = 1; });
  const L = S.L; let confirmed = 0, dropped = 0;
  ['ops', 'entries', 'notes', 'parts', 'pstat', 'edits', 'ticks'].forEach(k => {
    L[k] = L[k].filter(x => { if (ack[x.id]) { confirmed++; return false; } if (!roIds[x.roId]) { dropped++; return false; } return true; });
  });
  let notTaken = 0; const pcAt = new Date(b.at || 0);
  ['ops', 'entries', 'notes', 'parts', 'pstat', 'edits', 'ticks'].forEach(k => L[k].forEach(x => { if (x.sentAt && new Date(x.sentAt) < pcAt) { delete x.sentAt; x.rejected = true; notTaken++; } }));
  if (L.run && !roIds[L.run.roId]) L.run = null;
  S.photos.forEach(p => { if (!roIds[p.roId]) p.orphan = true; });
  S.pc = { at: b.at, rate: b.rate, ros: b.ros }; S.sample = false; S.sync.in = nowIso();
  save();
  return { ok: true, ros: b.ros.length, confirmed, notTaken, dropped: wasSample ? 0 : dropped, wasSample };
}

/* ---------- sync screen: QR player / camera scanner ---------- */
let SY = { stop: null, lock: null };
function syncStop() { if (SY.stop) { try { SY.stop(); } catch (e) {} SY.stop = null; } if (SY.lock) { try { SY.lock.release(); } catch (e) {} SY.lock = null; } }
function wake() { try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(l => { SY.lock = l; }, () => {}); } catch (e) {} }
function syncStart() {
  syncStop();
  if (UI.sync === 'send') {
    const cv = $('[data-qr]'); if (!cv) return;
    const b = phBundle();
    TQ.pack(b).then(pk => {
      if (route().name !== 'sync' || UI.sync !== 'send' || !document.body.contains(cv)) return;
      const n = $('[data-qrn]'), ring = $('[data-ring]');
      SY.sentIds = b.ops.map(x => x.id).concat(b.tk.map(x => x.id), b.ch.map(x => x.id));
      SY.stop = TQ.player(cv, pk.frames, (i, t, loop) => { if (n) n.textContent = `Code ${i} of ${t}${loop ? ' · loop ' + (loop + 1) : ''}`; if (ring) ring.style.strokeDashoffset = (791.7 * (1 - i / t)).toFixed(1); }, 340);
      wake();
    }).catch(e => { const n = $('[data-qrn]'); if (n) n.textContent = 'Could not make the codes: ' + e.message; });
  } else {
    const vid = $('[data-video]'); if (!vid) return;
    const bar = $('[data-scanbar]'), n = $('[data-scann]'), res = $('[data-scanres]'), msg = $('[data-cammsg]');
    SY.stop = TQ.scanner(vid, (got, tot) => { n.textContent = `Read ${got} of ${tot} codes`; bar.style.width = (got / tot * 100) + '%'; if (msg) msg.textContent = 'Keep it steady…'; buzz(); }, data => {
      const r = applyPc(data); syncStop(); bar.style.width = '100%';
      if (!r.ok) { n.textContent = 'Not Parsec codes'; res.innerHTML = `<div class="pm-result is-bad">${esc(r.msg)}</div>`; return; }
      n.textContent = 'Done'; buzz();
      res.innerHTML = `<div class="pm-result"><b>${r.ros} open RO${r.ros === 1 ? '' : 's'}</b> from the computer.${r.confirmed ? ` The computer confirmed <b>${r.confirmed}</b> change${r.confirmed === 1 ? '' : 's'} from this phone.` : ''}${r.wasSample ? ' Sample ROs removed.' : ''}${r.notTaken ? ` <b>${r.notTaken}</b> change${r.notTaken === 1 ? '' : 's'} sent earlier ${r.notTaken === 1 ? 'was' : 'were'} not taken — clock time that overlaps time on the computer, or a computer without the phone update. ${r.notTaken === 1 ? 'It stays' : 'They stay'} here, marked Not taken.` : ''}${r.dropped ? ` ${r.dropped} change${r.dropped === 1 ? '' : 's'} belonged to ROs that are no longer open and were cleared.` : ''}</div><button class="px-btn px-btn--primary pm-big" style="margin-top:12px" data-act="go" data-href="#/today">See today</button>`;
      CUR = V(); renderBottom(route());
    }, e => { if (msg) msg.textContent = (e && e.name === 'NotAllowedError') ? 'Camera blocked — allow it in the browser settings and try again.' : (e && e.message) || 'The camera did not start.'; n.textContent = 'Camera not available'; });
    wake();
  }
}

/* ---------- photos ---------- */
let PENDING = null;
const cam = $('#cam');
function takePhoto(roId, opId, kind) { PENDING = { roId, opId: opId || null, kind: kind || 'pic' }; cam.value = ''; cam.click(); }
function shrink(file, max = 1600, q = 0.82) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => { const sc = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.round(img.naturalWidth * sc), h = Math.round(img.naturalHeight * sc);
      const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
      c.toBlob(b => b ? res({ blob: b, w, h }) : rej(new Error('Could not shrink the photo')), 'image/jpeg', q); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('That file is not a photo this phone can read')); };
    img.src = url;
  });
}
cam.addEventListener('change', () => {
  const files = [...(cam.files || [])], tgt = PENDING; PENDING = null; if (!files.length || !tgt) return;
  const r = CUR.ro[tgt.roId], o = tgt.opId ? CUR.op[tgt.opId] : null; let n = 0;
  Promise.all(files.map(f => shrink(f).then(({ blob, w, h }) => {
    const at = nowIso(), id = uid('img');
    const name = `RO-${r ? r.no : ''} - ${o ? 'Op ' + o.n : 'RO'} - ${PHOTO_KIND[tgt.kind]} - ${at.slice(0, 10)} ${hm(at).replace(':', '')}${files.length > 1 ? '-' + (++n) : ''}.jpg`;
    return DB.put({ id, roId: tgt.roId, opId: tgt.opId, kind: tgt.kind, name, at, w, h, blob }).then(() => { S.photos.push({ id, roId: tgt.roId, opId: tgt.opId, kind: tgt.kind, name, at, size: blob.size }); });
  }))).then(() => {
    const key = PHOTO_TICK[tgt.kind], rr = CUR.ro[tgt.roId]; let ticked = false;
    if (key && rr) { const [g, k] = key.split(':'); const s = rr.cl[g] || ''; const i = STAGE_STEPS[g].findIndex(x => x[0] === +k); if (s[i] !== 'a' && s[i] !== 'm') { S.L.ticks.push({ id: uid('tk'), roId: tgt.roId, key, v: true, at: nowIso() }); ticked = true; } }
    if (tgt.opId) UI.ptab[tgt.opId] = 'files';
    commit(); toast(ic('check') + `${files.length > 1 ? files.length + ' photos' : PHOTO_KIND[tgt.kind]} saved${o ? ' to operation ' + o.n : ''}${ticked ? ' · ' + STAGE_STEPS[key.split(':')[0]].find(x => x[0] === +key.split(':')[1])[1] + ' ticked' : ''}`);
  }).catch(e => toast(esc(e.message)));
});
function sharePhotos(list, title) {
  return Promise.all(list.map(p => DB.get(p.id))).then(recs => {
    const files = recs.filter(Boolean).map(rec => new File([rec.blob], rec.name, { type: 'image/jpeg' }));
    if (!files.length) { toast('No photos to share'); return; }
    if (navigator.canShare && navigator.canShare({ files })) return navigator.share({ files, title }).catch(() => {});
    files.forEach((f, i) => setTimeout(() => { const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }, i * 350));
    toast(`Saving ${files.length} photo${files.length === 1 ? '' : 's'} to Downloads`);
  });
}

/* ---------- voice notes: hold Note to dictate ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
let DICT = null;
function addNote(roId, opId, text) {
  text = capSentences(String(text || '').trim()); if (!text) return false;
  if (!/\(\w{3} \d{1,2} · \d{1,2}:\d{2}\)$/.test(text)) text += ' ' + stampTxt();
  S.L.notes.push({ id: uid('nt'), roId, opId, at: nowIso(), x: text.slice(0, 600) }); delete S.ui['draft:' + opId];
  UI.ptab[opId] = 'notes'; commit(); toast(ic('check') + 'Note added', () => { S.L.notes.pop(); commit(); }); return true;
}
function dictStart(btn) {
  const roId = btn.dataset.ro, opId = btn.dataset.op;
  if (!SR) { UI.ptab[opId] = 'notes'; render(); setTimeout(() => { const t = $('#noteIn'); if (t) { t.focus(); } }, 60); toast('Tap the mic on your keyboard to dictate'); return; }
  try {
    const rec = new SR(); rec.lang = navigator.language || 'en-US'; rec.interimResults = true; rec.continuous = true;
    let fin = '', interim = '';
    const box = document.createElement('div'); box.className = 'pm-listen'; box.innerHTML = `<small>${ic('mic')}Listening — let go to add the note</small><div data-heard>…</div>`; app.appendChild(box);
    btn.classList.add('is-listening'); buzz();
    rec.onresult = ev => { interim = ''; for (let i = ev.resultIndex; i < ev.results.length; i++) { const t = ev.results[i][0].transcript; if (ev.results[i].isFinal) fin += t + ' '; else interim += t; } $('[data-heard]', box).textContent = (fin + interim).trim() || '…'; };
    rec.onerror = ev => { if (ev.error === 'not-allowed') toast('Microphone blocked — allow it in the browser settings'); };
    rec.onend = () => { box.remove(); btn.classList.remove('is-listening'); const text = (fin + interim).trim(); DICT = null; if (text) addNote(roId, opId, text); };
    rec.start(); DICT = rec;
  } catch (e) { toast('Dictation did not start — use the mic on your keyboard'); }
}
function dictEnd() { if (DICT) { try { DICT.stop(); } catch (e) {} } }
document.addEventListener('pointerdown', e => { const b = e.target.closest('[data-dict]'); if (!b) return; e.preventDefault(); dictStart(b); });
document.addEventListener('pointerup', dictEnd); document.addEventListener('pointercancel', dictEnd);

/* ---------- swipe rows + long press ---------- */
let SW = null, LP = null, lpFired = false;
document.addEventListener('pointerdown', e => {
  lpFired = false;
  const lp = e.target.closest('[data-lp]');
  if (lp && !e.target.closest('button.pm-play, .pm-pill, .pm-swipe__act')) { const x0 = e.clientX, y0 = e.clientY; LP = { el: lp, x0, y0, t: setTimeout(() => { lpFired = true; buzz(); ACT[lp.dataset.lp === 'part' ? 'part' : 'opmenu'](lp); LP = null; }, 520) }; }
  const row = e.target.closest('.pm-swipe__row'); if (!row || e.target.closest('button.pm-play, .pm-pill')) return;
  $$('.pm-swipe.is-open').forEach(s => { if (!s.contains(row)) { s.classList.remove('is-open'); $('.pm-swipe__row', s).style.transform = ''; } });
  const sw = row.parentElement; SW = { sw, row, x0: e.clientX, y0: e.clientY, dx: 0, base: sw.classList.contains('is-open') ? -104 : 0, active: false };
}, { passive: true });
document.addEventListener('pointermove', e => {
  if (LP && (Math.abs(e.clientX - LP.x0) > 8 || Math.abs(e.clientY - LP.y0) > 8)) { clearTimeout(LP.t); LP = null; }
  if (!SW) return; const dx = e.clientX - SW.x0, dy = e.clientY - SW.y0;
  if (!SW.active) { if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.3) { SW.active = true; SW.sw.classList.add('is-drag'); } else if (Math.abs(dy) > 10) { SW = null; return; } else return; }
  SW.dx = Math.min(0, Math.max(-220, SW.base + dx)); SW.row.style.transform = `translateX(${SW.dx}px)`;
}, { passive: true });
document.addEventListener('pointerup', () => {
  if (LP) { clearTimeout(LP.t); LP = null; }
  if (!SW) return; const s = SW; SW = null; if (!s.active) return;
  s.sw.classList.remove('is-drag'); s.sw.dataset.dragged = '1'; setTimeout(() => { delete s.sw.dataset.dragged; }, 50);
  if (s.dx < -170) { s.row.style.transform = ''; s.sw.classList.remove('is-open'); const a = $('.pm-swipe__act', s.sw); if (a) ACT[a.dataset.act](a); return; }
  if (s.dx < -50) { s.sw.classList.add('is-open'); s.row.style.transform = 'translateX(-104px)'; } else { s.sw.classList.remove('is-open'); s.row.style.transform = ''; }
});

/* ---------- forms in sheets ---------- */
const field = (label, inner) => `<div class="pm-field"><label>${label}</label>${inner}</div>`;
const dtLocal = d => { d = new Date(d); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
function findPart(o, key) { if (!o) return null; const [src, v] = key.split(':'); return src === 'ph' ? o.pt.find(p => p.src === 'ph' && p.id === v) : o.pt.find(p => p.src === 'pc' && p.i === +v); }

/* ---------- actions ---------- */
const ACT = {
  noop() {},
  go(el) { if (el.closest('.pm-swipe') && el.closest('.pm-swipe').dataset.dragged) return; const sw = el.closest('.pm-swipe.is-open'); if (sw) { sw.classList.remove('is-open'); $('.pm-swipe__row', sw).style.transform = ''; return; } if (el.dataset.sync) UI.sync = el.dataset.sync; if (location.hash === el.dataset.href) render(); else go(el.dataset.href); },
  start(el) { const sw = el.closest('.pm-swipe'); if (sw) { sw.classList.remove('is-open'); } startClock(el.dataset.ro, el.dataset.op); },
  stop() { stopSheet(); },
  stopwith(el) { closeSheet(); stopClock(el.dataset.k); },
  reason() { const run = RUN(); if (!run) return; openSheet(`<div class="pm-sheet__h"><h3>What are you doing?</h3><p>Shown on the computer with this clock time</p></div>${START_REASONS.map(s => `<button class="pm-srow${s === run.r ? ' is-on' : ''}" data-act="setreason" data-k="${esc(s)}">${si('working')}<span>${esc(nice(s))}</span>${ic('check', 'px-ico pm-srow__tick')}</button>`).join('')}`); },
  setreason(el) { const run = RUN(); if (!run) return; const k = el.dataset.k; closeSheet();
    if (runSecs() > 60) { const x = endRun(null, true); S.L.run = { id: uid('pn'), roId: run.roId, opId: run.opId, s: x ? x.e : run.s, r: k }; } else run.r = k; commit(); toast(si('working') + 'Now ' + esc(nice(k))); },
  clockin() { const k = dayKey(new Date()); S.shift[k] = { in: nowIso(), out: null }; commit(); toast(ic('check') + 'Clocked in · ' + hm(new Date())); },
  clockout() { if (RUN()) { stopClock('End of day'); return; } const sh = S.shift[dayKey(new Date())]; if (sh) sh.out = nowIso(); commit(); toast('Clocked out · ' + hm(new Date()), () => { if (sh) sh.out = null; commit(); }); },
  tot(el) { const r = CUR.ro[el.dataset.ro]; if (!r) return; ({ time: sheetTime, parts: sheetParts, files: sheetFiles })[el.dataset.k](r); },
  stage(el) { const r = CUR.ro[el.dataset.ro]; if (r) sheetStage(r); },
  tick(el) { const r = CUR.ro[el.dataset.ro]; if (!r) return; const [g, k] = el.dataset.key.split(':'); const i = STAGE_STEPS[g].findIndex(x => x[0] === +k); const cur = (r.cl[g] || '')[i];
    if (cur === 'a') { toast('Parsec ticks that one by itself'); return; }
    S.L.ticks.push({ id: uid('tk'), roId: r.id, key: el.dataset.key, v: !(cur === 'm'), at: nowIso() }); save(); CUR = V(); el.classList.toggle('is-on', !(cur === 'm')); render(); },
  opstatus(el) { const o = CUR.op[el.dataset.op]; if (!o) return; const cur = opStatus(o).name;
    openSheet(`<div class="pm-sheet__h"><h3>Operation ${o.n} status</h3><p>${esc(o.c)}</p></div>${MST.map(s => `<button class="pm-srow${nice(cur) === nice(s) ? ' is-on' : ''}" data-act="setstatus" data-ro="${esc(o.ro)}" data-op="${esc(o.id)}" data-k="${esc(s)}">${si(s === 'Complete' ? 'released' : shapeOf(s))}<span>${esc(nice(s))}</span>${ic('check', 'px-ico pm-srow__tick')}</button>`).join('')}<p class="pm-hint" style="padding:0 12px">${ic('clock')}Starting the clock sets Working by itself.</p>`); },
  setstatus(el) { closeSheet(); const x = { id: uid('ed'), roId: el.dataset.ro, opId: el.dataset.op, at: nowIso(), f: { s: el.dataset.k } }; S.L.edits.push(x); commit();
    toast(si(el.dataset.k === 'Complete' ? 'released' : shapeOf(el.dataset.k)) + 'Status set to ' + esc(nice(el.dataset.k)), () => { S.L.edits = S.L.edits.filter(e => e !== x); commit(); }); },
  part(el) { const o = CUR.op[el.dataset.op]; const p = findPart(o, el.dataset.p); if (!p) return;
    openSheet(`<div class="pm-sheet__h"><h3>${esc(p.d || 'Part')}</h3><p>${p.pn ? `<span class="px-id">${esc(p.pn)}</span> · ` : ''}Qty ${esc(p.q)} · Operation ${o.n}</p></div>
      ${PSTAT.map(s => `<button class="pm-srow${s === p.st ? ' is-on' : ''}" data-act="setpart" data-ro="${esc(o.ro)}" data-op="${esc(o.id)}" data-p="${esc(el.dataset.p)}" data-st="${esc(s)}">${psi(s)}<span>${s === 'Not Ordered' ? 'Not ordered' : s}</span>${ic('check', 'px-ico pm-srow__tick')}</button>`).join('')}
      <div class="pm-ssep"></div>${p.pn ? `<button class="pm-srow" data-act="copy" data-v="${esc(p.pn)}">${ic('copy')}<span>Copy part number</span></button>` : ''}
      ${p.src === 'ph' && !p.item.sentAt ? `<button class="pm-srow pm-srow--danger" data-act="rmpart" data-id="${esc(p.id)}">${ic('trash')}<span>Remove part</span></button>` : `<p class="pm-hint" style="padding:0 12px">${ic('parts')}Parts from the computer are removed there.</p>`}`); },
  setpart(el) { const o = CUR.op[el.dataset.op]; const p = findPart(o, el.dataset.p); if (!p) return; closeSheet(); const prev = p.st; if (prev === el.dataset.st) return;
    const x = { id: uid('ps'), roId: o.ro, opId: o.id, at: nowIso(), i: p.src === 'pc' ? p.i : -1, pn: p.pn, d: p.d, pid: p.src === 'ph' ? p.id : null, st: el.dataset.st };
    S.L.pstat.push(x); commit(); const sw = el.closest('.pm-swipe'); if (sw) sw.classList.remove('is-open');
    toast(psi(x.st) + `${esc(p.d || 'Part')} · ${x.st === 'Not Ordered' ? 'Not ordered' : x.st}`, () => { S.L.pstat = S.L.pstat.filter(y => y !== x); commit(); }); },
  rmpart(el) { closeSheet(); const x = S.L.parts.find(p => p.id === el.dataset.id); if (!x) return; S.L.parts = S.L.parts.filter(p => p !== x); S.L.pstat = S.L.pstat.filter(p => p.pid !== x.id); commit(); toast(ic('trash') + 'Part removed', () => { S.L.parts.push(x); commit(); }); },
  copy(el) { const v = el.dataset.v; if (!v) return; closeSheet(); try { navigator.clipboard.writeText(v).then(() => toast(ic('check') + 'Copied ' + esc(v)), () => toast('Copy did not work here')); } catch (e) { toast('Copy did not work here'); } },
  addpart(el) { const o = CUR.op[el.dataset.op]; if (!o) return;
    openSheet(`<div class="pm-sheet__h"><h3>Add part</h3><p>Operation ${o.n} · ${esc(o.c)}</p></div><div class="pm-sheet__b">${field('Description', '<input class="pm-in" data-f="d" data-autofocus placeholder="e.g. Inner wheel seal" enterkeyhint="next">')}<div class="pm-row2">${field('Part number', '<input class="pm-in" data-f="pn" placeholder="e.g. 21422645" inputmode="text" autocapitalize="characters" enterkeyhint="next">')}${field('Qty', '<input class="pm-in" data-f="q" value="1" inputmode="decimal" style="max-width:90px">')}</div>
      <button class="px-btn px-btn--primary pm-big" data-act="savepart" data-ro="${esc(o.ro)}" data-op="${esc(o.id)}">Add part</button><p class="pm-hint">${ic('parts')}It lands on the computer as Not ordered, priced from your Fixes where the number matches.</p></div>`); },
  savepart(el) { const s = SHEET; const d = $('[data-f=d]', s).value.trim(), pn = $('[data-f=pn]', s).value.trim().toUpperCase(), q = String(parseFloat($('[data-f=q]', s).value) > 0 ? parseFloat($('[data-f=q]', s).value) : 1);
    if (!d && !pn) { toast('Add a description or a part number'); return; } closeSheet(); S.L.parts.push({ id: uid('pt'), roId: el.dataset.ro, opId: el.dataset.op, at: nowIso(), d, pn, q, pr: 0 }); UI.ptab[el.dataset.op] = 'parts'; commit(); toast(ic('check') + 'Part added'); },
  addtime(el, id) { const o = CUR.op[el.dataset.op]; if (!o) return; const x = id ? S.L.entries.find(e => e.id === id) : null; const e = x ? new Date(x.e) : new Date(), s = x ? new Date(x.s) : new Date(e - 3600000);
    openSheet(`<div class="pm-sheet__h"><h3>${x ? 'Edit' : 'Add'} time entry</h3><p>Operation ${o.n} · ${esc(o.c)}</p></div><div class="pm-sheet__b">${field('Start', `<input class="pm-in" type="datetime-local" data-f="s" value="${dtLocal(s)}">`)}${field('Stop', `<input class="pm-in" type="datetime-local" data-f="e" value="${dtLocal(e)}">`)}
      ${field('Doing', `<div class="pm-chips">${START_REASONS.slice(0, 4).concat(['Testing']).map(r => `<button class="pm-chip is-word${(x ? x.r : defaultReason(o)) === r ? ' is-on' : ''}" data-act="chip" data-v="${esc(r)}">${esc(nice(r))}</button>`).join('')}</div>`)}
      <div class="pm-row2"><button class="px-btn px-btn--primary pm-big" data-act="savetime" data-ro="${esc(o.ro)}" data-op="${esc(o.id)}" data-id="${x ? esc(x.id) : ''}">${x ? 'Save' : 'Add time'}</button>${x ? `<button class="px-btn px-btn--danger pm-big" data-act="deltime" data-id="${esc(x.id)}">Delete</button>` : ''}</div>
      <p class="pm-hint">${ic('clock')}Use this to fix a clock that was left running — the stamps in your notes show when you really stopped.</p></div>`); },
  edittime(el) { ACT.addtime(el, el.dataset.id); },
  chip(el) { $$('.pm-chip', el.parentElement).forEach(c => c.classList.toggle('is-on', c === el)); },
  savetime(el) { const s = SHEET, a = new Date($('[data-f=s]', s).value), b = new Date($('[data-f=e]', s).value), r = ($('.pm-chip.is-on', s) || {}).dataset ? $('.pm-chip.is-on', s).dataset.v : 'Repairing';
    if (isNaN(a) || isNaN(b) || b <= a) { toast('Stop must be after start'); return; }
    if (b - a > 16 * 3600000) { toast('That is more than 16 hours — check the dates'); return; }
    const id = el.dataset.id; closeSheet();
    if (id) { const x = S.L.entries.find(e => e.id === id); if (x) { x.s = a.toISOString(); x.e = b.toISOString(); x.r = r; x.at = nowIso(); } }
    else S.L.entries.push({ id: uid('pn'), roId: el.dataset.ro, opId: el.dataset.op, s: a.toISOString(), e: b.toISOString(), r, sr: null, at: nowIso(), manual: true });
    UI.ptab[el.dataset.op] = 'time'; commit(); toast(ic('check') + (id ? 'Time entry saved' : 'Time entry added · ' + fdur(b - a))); },
  deltime(el) { closeSheet(); const x = S.L.entries.find(e => e.id === el.dataset.id); if (!x) return; S.L.entries = S.L.entries.filter(e => e !== x); commit(); toast(ic('trash') + 'Time entry deleted', () => { S.L.entries.push(x); commit(); }); },
  savenote(el) { const t = $('#noteIn'); if (!t || !t.value.trim()) { toast('Write or dictate the work performed first'); return; } addNote(el.dataset.ro, el.dataset.op, t.value); },
  editop(el) { const o = CUR.op[el.dataset.op]; if (!o) return;
    openSheet(`<div class="pm-sheet__h"><h3>Operation ${o.n}</h3><p>Changes go to the computer on the next sync</p></div><div class="pm-sheet__b">${field('Complaint', `<input class="pm-in" data-f="c" value="${esc(o.c)}" autocapitalize="sentences">`)}
      ${field('Type', `<div class="pm-chips">${JOB_TYPES.map(t => `<button class="pm-chip${t === o.t ? ' is-on' : ''}" data-act="chip" data-v="${t}">${t}</button>`).join('')}</div>`)}
      ${field('Cause', `<textarea class="pm-in" data-f="ca" rows="2" autocapitalize="sentences" placeholder="What was wrong">${esc(o.ca)}</textarea>`)}${field('Fix', `<textarea class="pm-in" data-f="fx" rows="2" autocapitalize="sentences" placeholder="What you did">${esc(o.fx)}</textarea>`)}
      <button class="px-btn px-btn--primary pm-big" data-act="saveop" data-ro="${esc(o.ro)}" data-op="${esc(o.id)}">Save</button></div>`); },
  saveop(el) { const s = SHEET, o = CUR.op[el.dataset.op]; if (!o) return; const f = {};
    const c = $('[data-f=c]', s).value.trim(), t = $('.pm-chip.is-on', s) ? $('.pm-chip.is-on', s).dataset.v : o.t, ca = capSentences($('[data-f=ca]', s).value.trim()), fx = capSentences($('[data-f=fx]', s).value.trim());
    if (c && c !== o.c) f.c = c; if (t !== o.t) f.t = t; if (ca !== (o.ca || '')) f.ca = ca; if (fx !== (o.fx || '')) f.fx = fx; closeSheet();
    if (!Object.keys(f).length) return;
    if (o.local && !o.item.sentAt && (f.c || f.t)) { if (f.c) o.item.c = f.c; if (f.t) o.item.t = f.t; delete f.c; delete f.t; }
    if (Object.keys(f).length) S.L.edits.push({ id: uid('ed'), roId: o.ro, opId: o.id, at: nowIso(), f }); commit(); toast(ic('check') + 'Operation saved'); },
  addop(el) { const r = CUR.ro[el.dataset.ro]; if (!r) return;
    openSheet(`<div class="pm-sheet__h"><h3>Add operation</h3><p>RO-${esc(r.no)} · becomes operation ${r.ops.length + 1}</p></div><div class="pm-sheet__b">${field('Complaint', '<input class="pm-in" data-f="c" data-autofocus placeholder="e.g. Air leak at the front axle" autocapitalize="sentences">')}
      ${field('Type', `<div class="pm-chips">${JOB_TYPES.map(t => `<button class="pm-chip${t === 'OP' ? ' is-on' : ''}" data-act="chip" data-v="${t}">${t}</button>`).join('')}</div>`)}
      <button class="px-btn px-btn--primary pm-big" data-act="newop" data-ro="${esc(r.id)}">Add operation</button><p class="pm-hint">${ic('addJob')}Quoted time and parts fill in on the computer from your Fixes where they match.</p></div>`); },
  newop(el) { const s = SHEET, c = capSentences($('[data-f=c]', s).value.trim()), t = $('.pm-chip.is-on', s).dataset.v; if (!c) { toast('Write the complaint'); return; } closeSheet();
    const x = { id: uid('op'), roId: el.dataset.ro, c, t, at: nowIso() }; S.L.ops.push(x); commit(); toast(ic('check') + 'Operation added', () => { S.L.ops = S.L.ops.filter(y => y !== x); commit(); }); },
  opmenu(el) { const o = CUR.op[el.dataset.op]; if (!o) return; const r = CUR.ro[o.ro]; const live = RUN() && RUN().opId === o.id;
    openSheet(`<div class="pm-sheet__h"><h3>Operation ${o.n}</h3><p>${esc(o.c)}</p></div>
      <button class="pm-srow" data-act="${live ? 'stop' : 'start'}" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">${ic(live ? 'stop' : 'play')}<span>${live ? 'Stop clock' : 'Start clock'}</span></button>
      <button class="pm-srow" data-act="opstatus" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">${si(opStatus(o).shape)}<span>Set status…</span></button>
      <button class="pm-srow" data-act="editop" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">${ic('pencil')}<span>Edit, cause and fix…</span></button>
      <button class="pm-srow" data-act="addpart" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">${ic('addPart')}<span>Add part…</span></button>
      <button class="pm-srow" data-act="addtime" data-ro="${esc(r.id)}" data-op="${esc(o.id)}">${ic('history')}<span>Add time entry…</span></button>
      <button class="pm-srow" data-act="photo" data-ro="${esc(r.id)}" data-op="${esc(o.id)}" data-kind="pic">${ic('camera')}<span>Take photo</span></button>
      ${o.local && !o.item.sentAt ? `<div class="pm-ssep"></div><button class="pm-srow pm-srow--danger" data-act="rmop" data-id="${esc(o.id)}">${ic('trash')}<span>Remove operation</span></button>` : ''}`); },
  rmop(el) { closeSheet(); const x = S.L.ops.find(o => o.id === el.dataset.id); if (!x) return; const rid = x.roId; S.L.ops = S.L.ops.filter(o => o !== x); commit(); if (route().name === 'op') go(roHref(rid)); toast(ic('trash') + 'Operation removed', () => { S.L.ops.push(x); commit(); }); },
  romenu(el) { const r = CUR.ro[el.dataset.ro]; if (!r) return;
    openSheet(`<div class="pm-sheet__h"><h3>RO-${esc(r.no)}</h3><p>${esc(r.cust)}</p></div>
      <button class="pm-srow" data-act="addop" data-ro="${esc(r.id)}">${ic('addJob')}<span>Add operation…</span></button>
      ${['dash', 'dtc', 'pic'].map(k => `<button class="pm-srow" data-act="photo" data-ro="${esc(r.id)}" data-kind="${k}">${ic('camera')}<span>Take ${k === 'pic' ? 'a picture' : k === 'dash' ? 'the dash photo' : 'a DTC photo'}</span></button>`).join('')}
      <button class="pm-srow" data-act="sharero" data-ro="${esc(r.id)}">${ic('save')}<span>Share this RO's photos…</span><small>${S.photos.filter(p => p.roId === r.id).length}</small></button>
      <button class="pm-srow" data-act="copy" data-v="${esc(r.vin)}">${ic('copy')}<span>Copy VIN</span></button>`); },
  photo(el) { closeSheet(true); takePhoto(el.dataset.ro, el.dataset.op || null, el.dataset.kind); },
  viewphoto(el) { const p = S.photos.find(x => x.id === el.dataset.id); if (!p) return;
    photoUrl(p.id).then(u => openSheet(`<div class="pm-sheet__h"><h3>${esc(PHOTO_KIND[p.kind] || 'Picture')}</h3><p>${esc(p.name)}</p></div><div class="pm-sheet__b pm-viewer">${u ? `<img src="${u}" alt="${esc(p.name)}">` : '<div class="pm-empty">This photo is missing from the phone.</div>'}</div>
      <div class="pm-sheet__foot"><button class="px-btn" data-act="sharephoto" data-id="${esc(p.id)}">${ic('save')}Share or save</button><button class="px-btn px-btn--danger" data-act="delphoto" data-id="${esc(p.id)}">${ic('trash')}Delete</button></div>`)); },
  sharephoto(el) { const p = S.photos.find(x => x.id === el.dataset.id); if (p) sharePhotos([p], p.name); },
  sharero(el) { closeSheet(); const r = CUR.ro[el.dataset.ro]; const list = S.photos.filter(p => p.roId === el.dataset.ro); if (!list.length) { toast('No photos on this phone for this RO'); return; } sharePhotos(list, `RO-${r ? r.no : ''} photos`); },
  delphoto(el) { closeSheet(); const p = S.photos.find(x => x.id === el.dataset.id); if (!p) return; S.photos = S.photos.filter(x => x !== p); commit(); let undone = false;
    toast(ic('trash') + 'Photo deleted', () => { undone = true; S.photos.push(p); commit(); }); setTimeout(() => { if (!undone) { DB.del(p.id).catch(() => {}); if (URLS[p.id]) { URL.revokeObjectURL(URLS[p.id]); delete URLS[p.id]; } } }, 6500); },
  ptab(el) { UI.ptab[el.dataset.op] = el.dataset.k; render(); },
  next(el) { const [k, id] = el.dataset.x.split('|'); const ro = el.dataset.ro;
    if (k === 'parts') { UI.ptab[id] = 'parts'; go(opHref(ro, id)); } else if (k === 'edit') ACT.editop({ dataset: { op: id } }); else if (k === 'photo') takePhoto(ro, id, 'pic'); },
  syncmode(el) { UI.sync = el.dataset.k; UI.forceSend = false; syncStop(); render({ sync: true }); },
  forcesend() { UI.forceSend = true; render({ sync: true }); },
  syncdone() { const ids = {}; (SY.sentIds || []).forEach(id => { ids[id] = 1; }); const at = nowIso();
    ['ops', 'entries', 'notes', 'parts', 'pstat', 'edits', 'ticks'].forEach(k => S.L[k].forEach(x => { if (ids[x.id] && !x.sentAt) x.sentAt = at; }));
    S.sync.out = at; syncStop(); UI.sync = 'get'; UI.forceSend = false; commit({ sync: true }); toast(ic('check') + 'Sent. Now get the codes back so the computer can confirm.'); },
  theme(el) { S.prefs.theme = el.dataset.k; applyTheme(); commit(); },
  bay() { S.prefs.bay = !S.prefs.bay; applyTheme(); commit(); },
  sample() { if (S.pc && !S.sample) return; S.pc = sampleBundle(); S.sample = true; S.L = blank().L; commit(); go('#/today'); toast('Sample ROs loaded — try the clock, parts and photos'); },
  unsample() { S.pc = null; S.sample = false; S.L = blank().L; commit(); toast('Sample ROs removed'); },
  export() { const data = JSON.stringify(Object.assign({}, S, { exportedAt: nowIso(), app: 'Parsec Mobile ' + APPV }), null, 1); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' })); a.download = `Parsec Mobile backup ${dayKey(new Date())}.json`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); toast(ic('check') + 'Backup saved'); },
  erase() { const n = outbox().count; openSheet(`<div class="pm-sheet__h"><h3>Erase this phone?</h3><p>ROs, clock time, notes and ${S.photos.length} photo${S.photos.length === 1 ? '' : 's'} are removed from Parsec Mobile.</p></div><div class="pm-sheet__b">${n ? `<div class="pm-warn">${ic('sync')}<span><b>${n} change${n === 1 ? '' : 's'}</b> never reached the computer and will be lost. Sync first if you need them.</span></div>` : ''}</div><div class="pm-sheet__foot"><button class="px-btn" data-act="closesheet">Keep everything</button><button class="px-btn px-btn--danger px-btn--solid" data-act="erasego">Erase</button></div>`); },
  erasego() { closeSheet(); DB.clear().catch(() => {}); Object.keys(URLS).forEach(k => URL.revokeObjectURL(URLS[k])); const keep = S.prefs, me = S.me; S = blank(); S.prefs = keep; S.me = me; commit(); go('#/today'); toast('Parsec Mobile erased'); },
  closesheet() { closeSheet(); }
};
function sheetTime(r) {
  const t = roTotals(r), eff = t.b > 0 ? Math.round(r.ops.filter(o => !o.d && burnt(o) > 0).reduce((a, o) => a + (+o.q || 0), 0) / t.b * 100) : null;
  openSheet(`<div class="pm-sheet__h"><h3>Time on RO-${esc(r.no)}</h3><p>${r.ops.length} operation${r.ops.length === 1 ? '' : 's'}</p></div>
    <div class="px-tsum"><div><span>Quoted</span><b>${f2(t.q)}<small>h</small></b></div><div><span>Burnt</span><b>${f2(t.b)}<small>h</small></b></div><div><span>Left</span><b>${f2(Math.max(0, t.q - t.b))}<small>h</small></b></div><div><span>Eff.</span><b class="${eff == null ? '' : eff >= 100 ? 'px-good' : 'px-warn'}">${eff == null ? '—' : eff}<small>${eff == null ? '' : '%'}</small></b></div></div>
    <div class="pm-sheet__b">${r.ops.map(o => `<div class="pm-part" data-act="go" data-href="${opHref(r.id, o.id)}" style="cursor:pointer"><div><b><span class="pm-op__n">${o.n}</span>${esc(o.c)}</b><small>${mini(burnt(o), o.q)}</small></div><span class="pm-pst" style="font-variant-numeric:tabular-nums">${f2(burnt(o))} <span style="color:var(--ink-3);font-weight:400">/ ${f2(o.q)} h</span></span></div>`).join('')}</div>
    <div class="pm-sheet__foot"><button class="px-btn" data-act="closesheet">Done</button></div>`);
}
function sheetParts(r) {
  const all = r.ops.filter(o => !o.d).flatMap(o => o.pt), inh = all.filter(p => inHand(p.st)).length;
  const bar = PSTAT.map(s => { const c = all.filter(p => p.st === s).length; return c ? `<i style="flex:${c};background:${PCOL[s]};opacity:${s === 'Received' ? .55 : 1}"></i>` : ''; }).join('');
  const leg = PSTAT.map(s => { const c = all.filter(p => p.st === s).length; return c ? `<span>${psi(s)}${s === 'Not Ordered' ? 'Not ordered' : s} ${c}</span>` : ''; }).join('');
  openSheet(`<div class="pm-sheet__h"><h3>Parts on RO-${esc(r.no)}</h3><p>${inh} of ${all.length} in hand</p></div>${all.length ? `<div class="pm-pbar">${bar}</div><div class="pm-pleg">${leg}</div>` : ''}
    <div class="pm-sheet__b">${r.ops.filter(o => o.pt.length).map(o => `<div class="pm-sgrp"><b>Operation ${o.n}</b> · ${esc(o.c)}</div>` + o.pt.map(p => `<div class="pm-part"><div><b>${esc(p.d || 'Part')}</b><small>${p.pn ? `<span class="px-id">${esc(p.pn)}</span> · ` : ''}Qty ${esc(p.q)}</small></div><button class="pm-pill" data-act="part" data-ro="${esc(r.id)}" data-op="${esc(o.id)}" data-p="${esc(p.src === 'ph' ? 'ph:' + p.id : 'pc:' + p.i)}">${psi(p.st)}<span>${p.st === 'Not Ordered' ? 'Not ordered' : p.st}</span>${ic('chevD', 'px-ico px-chev')}</button></div>`).join('')).join('') || '<div class="pm-empty">No parts on this RO.</div>'}</div>
    <div class="pm-sheet__foot"><button class="px-btn" data-act="closesheet">Done</button></div>`);
}
function sheetFiles(r) {
  const mine = S.photos.filter(p => p.roId === r.id);
  const grp = (title, opn) => { const ph = mine.filter(p => (opn ? (CUR.op[p.opId] || {}).n === opn : !p.opId)), pc = r.att.filter(a => (a.op || 0) === (opn || 0)); if (!ph.length && !pc.length) return '';
    return `<div class="pm-sgrp"><b>${title}</b></div>${ph.length ? `<div class="pm-files" style="margin-top:6px">${ph.map(p => `<button class="pm-file" data-act="viewphoto" data-id="${esc(p.id)}" data-thumb="${esc(p.id)}"><span>${esc(PHOTO_KIND[p.kind] || 'Picture')} · ${hm(p.at)}</span></button>`).join('')}</div>` : ''}${pc.map(a => `<div class="pm-pcfile">${ic('clip')}<span>${esc(a.n)}</span><small>on the computer</small></div>`).join('')}`; };
  openSheet(`<div class="pm-sheet__h"><h3>Files on RO-${esc(r.no)}</h3><p>${mine.length} on this phone · ${r.att.length} on the computer</p></div>
    <div class="pm-sheet__b">${grp('Whole RO', 0)}${r.ops.map(o => grp(`Operation ${o.n} · ${esc(o.c)}`, o.n)).join('')}${!mine.length && !r.att.length ? '<div class="pm-empty">No files yet.</div>' : ''}</div>
    <div class="pm-sheet__foot"><button class="px-btn" data-act="photo" data-ro="${esc(r.id)}" data-kind="dash">${ic('camera')}Dash</button><button class="px-btn" data-act="photo" data-ro="${esc(r.id)}" data-kind="dtc">${ic('camera')}DTC</button><button class="px-btn" data-act="photo" data-ro="${esc(r.id)}" data-kind="pic">${ic('camera')}Picture</button></div>
    ${mine.length ? `<div class="pm-sheet__foot" style="margin-top:8px"><button class="px-btn" data-act="sharero" data-ro="${esc(r.id)}">${ic('save')}Share ${mine.length} photo${mine.length === 1 ? '' : 's'} to the RO folder…</button></div>` : ''}`, s => thumbs2(s));
}
function thumbs2(root) { $$('[data-thumb]', root).forEach(el => photoUrl(el.dataset.thumb).then(u => { if (u) el.style.backgroundImage = `url("${u}")`; })); }
function sheetStage(r) {
  const sg = stagesOf(r), st = roStatus(r);
  const word = { done: 'Done', cur: 'In progress', todo: 'Not started', skip: 'Not needed', wait: 'Waiting' };
  openSheet(`<div class="pm-sheet__h"><h3>${esc(nice(st.name))}${st.sub ? ' · ' + esc(st.sub) : ''}</h3><p>RO-${esc(r.no)} · ${Math.round(+r.pct || 0)}% · stage ${sg.now + 1} of 7</p></div><div class="pm-sheet__b pm-stagelist">
    ${sg.list.map(([k, s], i) => `<div class="pm-stg"><div class="pm-stg__h"><span class="pm-stg__dot${i === sg.now && s !== 'wait' ? ' is-now' : s === 'done' ? ' is-done' : s === 'wait' ? ' is-wait' : ''}"></span>${STAGES[i][1]}<small>${i === sg.now && s !== 'wait' ? 'Now' : word[s] || ''}</small></div>
      ${STAGE_STEPS[k] ? `<div class="pm-stg__steps">${STAGE_STEPS[k].map(([n, lbl], j) => { const c = (r.cl[k] || '')[j] || '0'; return `<label class="px-check${c !== '0' ? ' is-on' : ''}" data-act="tick" data-ro="${esc(r.id)}" data-key="${k}:${n}"><i></i><span>${esc(lbl)}${c === 'a' ? '<small>auto</small>' : ''}</span></label>`; }).join('')}</div>` : ''}</div>`).join('')}
    </div><div class="pm-sheet__foot"><button class="px-btn" data-act="closesheet">Done</button></div>`);
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  if (lpFired) { lpFired = false; e.preventDefault(); return; }
  const a = e.target.closest('[data-act]'); if (!a) { const sw = $('.pm-swipe.is-open'); if (sw && !sw.contains(e.target)) { sw.classList.remove('is-open'); $('.pm-swipe__row', sw).style.transform = ''; } return; }
  if (a.closest('.pm-swipe__row') && a.closest('.pm-swipe').dataset.dragged) return;
  const fn = ACT[a.dataset.act]; if (!fn) return;
  if (a.tagName === 'LABEL') e.preventDefault();
  e.stopPropagation(); fn(a, e);
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.input === 'q') { UI.q = t.value; const pos = t.selectionStart; render(); const n = $('[data-input="q"]'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (er) {} } }
  if (t.id === 'noteIn') { S.ui['draft:' + t.dataset.op] = t.value; clearTimeout(t._sv); t._sv = setTimeout(save, 400); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.input === 'name') { S.me.name = t.value.trim(); commit(); }
  if (t.dataset.input === 'import' && t.files && t.files[0]) {
    t.files[0].text().then(txt => { const d = JSON.parse(txt); if (!d || d.v !== 2 || !d.L) throw new Error('Not a Parsec Mobile backup'); const keepPhotos = S.photos; S = Object.assign(blank(), d); S.photos = (d.photos || []).filter(p => keepPhotos.some(k => k.id === p.id)); commit(); go('#/today'); toast(ic('check') + 'Backup restored'); }).catch(er => toast(esc(er.message || 'That file could not be read')));
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && SHEET) { closeSheet(); return; }
  if (e.key === 'Enter' && e.target.id === 'noteIn' && !e.shiftKey) { e.preventDefault(); const t = e.target; if (t.value.trim()) addNote(t.dataset.ro, t.dataset.op, t.value); }
  if (e.key === 'Enter' && e.target.dataset && e.target.dataset.f === 'd') { e.preventDefault(); const n = $('[data-f=pn]', SHEET); n && n.focus(); }
  if (e.key === 'Enter' && e.target.dataset && e.target.dataset.f === 'pn') { e.preventDefault(); const n = $('[data-f=q]', SHEET); n && n.focus(); }
});
window.addEventListener('hashchange', () => render());
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { render(); if (route().name === 'sync') syncStart(); } else syncStop(); });

/* ---------- theme: follows the phone unless set ---------- */
const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
function applyTheme() {
  const t = S.prefs.theme === 'system' ? (mq && mq.matches ? 'dark' : 'light') : S.prefs.theme;
  document.documentElement.dataset.theme = t; app.classList.toggle('is-bay', !!S.prefs.bay);
  const m = $('meta[name="theme-color"]'); if (m) m.content = t === 'dark' ? '#151514' : '#FBFAF7';
}
if (mq) (mq.addEventListener ? mq.addEventListener('change', applyTheme) : mq.addListener(applyTheme));

/* ---------- start ---------- */
applyTheme(); render(); setInterval(tick, 1000);
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) { navigator.serviceWorker.register('sw.js').catch(() => {}); }
window.PM = { S: () => S, V, outbox, phBundle, applyPc, TQ, sampleBundle, render };
