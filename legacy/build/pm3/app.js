/* ===== Parsec Mobile 3 — for technicians. Work · Inbox · Fixes. One file, works offline, syncs with Parsec on the computer by QR codes. ===== */
'use strict';
const APPV = '3.0';
const IC = __ICO__, LOGO = __LOGO__;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (n, s) => IC[n] ? `<svg class="ph-ic" viewBox="0 0 24 24"${s ? ` style="width:${s}px;height:${s}px"` : ''} aria-hidden="true">${IC[n]}</svg>` : '';
const uid = p => (p || 'ph') + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const nowIso = () => new Date().toISOString();
const p2 = n => String(n).padStart(2, '0');
const dayKey = d => { d = new Date(d); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); };
const isToday = d => !!d && dayKey(d) === dayKey(new Date());
const hm = d => { d = new Date(d); return p2(d.getHours()) + ':' + p2(d.getMinutes()); };
const mOf = d => { d = new Date(d); return d.getHours() * 60 + d.getMinutes(); };
const hmm = m => Math.floor(Math.max(0, m) / 60) + ':' + p2(Math.floor(Math.max(0, m) % 60));
const hms = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 3600) + ':' + p2(Math.floor(s / 60) % 60) + ':' + p2(s % 60); };
const h2 = n => (Math.round((n || 0) * 100) / 100).toFixed(2);
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fdate = d => { d = new Date(d); return DOW[d.getDay()] + ', ' + MON[d.getMonth()] + ' ' + d.getDate(); };
const fwhen = d => { if (!d) return ''; const x = new Date(d); if (isNaN(x)) return String(d); if (isToday(x)) return hm(x); const y = new Date(); y.setDate(y.getDate() - 1); if (dayKey(x) === dayKey(y)) return 'Yesterday'; return MON[x.getMonth()] + ' ' + x.getDate(); };
const when2 = d => isToday(d) ? 'today ' + hm(d) : fwhen(d) + ' ' + hm(d);
const first = n => String(n || '').trim().split(/\s+/)[0] || '';
const ini = n => String(n || '?').trim().split(/\s+/).map(x => x[0] || '').join('').slice(0, 2).toUpperCase() || '?';
const same = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
const capS = t => String(t).replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, a, b) => a + b.toUpperCase());
const buzz = () => { try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} };

/* ---------- the shop's words, the same as Parsec on the computer ---------- */
const START = ['Diagnosing', 'Repairing', 'Inspecting', 'Testing'];
const STOPS = [['Waiting – New Job', 'hold', 'Switched job', 'Pause it — it stays on top of Next'], ['Waiting – Parts', 'parts', 'Waiting – Parts', 'Parts gets a note with what you need'],
  ['Waiting – Approval', 'customer', 'Waiting – Approval', 'The quote goes to the service writer'], ['Waiting – Foreman', 'foreman', 'Waiting – Foreman', 'The foreman gets a note'],
  ['Waiting – Tech Support', 'support', 'Waiting – Tech Support', 'Add the case number in a note'], ['Complete', 'done', 'Complete', 'Needs the correction']];
const GROUPS = [['dash', 'Dash pic'], ['pics', 'Pictures'], ['dtc', 'DTCs'], ['other', 'Other']];
const GNAME = { dash: 'Dash pic', pics: 'Pictures', dtc: 'DTCs', other: 'Other' };
const PSH = { 'Not Ordered': 'hold', Ordered: 'parts', Backordered: 'problem', Received: 'working', Staged: 'working', 'Picked up': 'working', Installed: 'done', Returned: 'hold' };
function shapeOf(n) { n = String(n || ''); if (/^Working/.test(n)) return 'working'; if (/^Complete/.test(n)) return 'done'; if (/^Declined/.test(n)) return 'hold';
  if (/^Waiting/.test(n)) { if (/Parts/.test(n)) return 'parts'; if (/Foreman/.test(n)) return 'foreman'; if (/Support/.test(n)) return 'support'; return 'customer'; } return 'hold'; }
function si(k) { const ring = '<circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" stroke-width="1.5"/>';
  const dash = '<circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.3 1.82"/><circle cx="7" cy="7" r="1.75" fill="currentColor"/>';
  const B = { hold: ring, working: ring + '<path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor"/>', parts: dash, foreman: dash, support: dash, customer: dash, problem: dash,
    done: '<circle cx="7" cy="7" r="6" fill="currentColor"/><path d="M4.4 7.2l1.8 1.8 3.5-3.7" fill="none" stroke="var(--panel)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' };
  return `<svg class="ph-si" data-s="${k}" viewBox="0 0 14 14" aria-hidden="true">${B[k] || ring}</svg>`; }
const typeCls = t => ({ DIAG: 'diag', COMEBACK: 'diag', PM: 'pm', WARR: 'war', RECALL: 'war' })[t] || '';

/* ---------- storage: the phone keeps the last copy from the computer and its own changes ---------- */
const KEY = 'parsec-mobile-v3';
const blank = () => ({ v: 3, me: '', pc: null, sample: false, L: { entries: [], run: null, notes: [], parts: [], pstat: [], edits: [], shifts: [], ib: [] }, photos: [], sync: { in: null, out: null }, prefs: { theme: 'system' }, ui: { airOk: {}, done: {} } });
let S;
try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || 'null') || {}); } catch (e) { S = blank(); }
S.L = Object.assign(blank().L, S.L || {}); S.ui = Object.assign(blank().ui, S.ui || {}); S.prefs = Object.assign(blank().prefs, S.prefs || {}); S.sync = Object.assign(blank().sync, S.sync || {});
let warned = false;
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { if (!warned) { warned = true; toast('This phone would not save — storage is full or blocked.'); } } }
/* photos: the full one for the phone, a small one for the QR codes */
const DB = {
  db: null,
  open() { if (this.db) return Promise.resolve(this.db); return new Promise((res, rej) => { if (!window.indexedDB) return rej(new Error('No photo storage here'));
    const r = indexedDB.open('parsec-mobile-3', 1); r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id' }); r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => rej(r.error); }); },
  put(rec) { return this.open().then(db => new Promise((res, rej) => { const t = db.transaction('photos', 'readwrite'); t.objectStore('photos').put(rec); t.oncomplete = () => res(); t.onerror = () => rej(t.error); })); },
  get(id) { return this.open().then(db => new Promise((res, rej) => { const q = db.transaction('photos').objectStore('photos').get(id); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); })); },
  clear() { return this.open().then(db => new Promise(res => { const t = db.transaction('photos', 'readwrite'); t.objectStore('photos').clear(); t.oncomplete = () => res(); })); }
};
const URLS = {};
function thumbUrl(id) { if (URLS[id]) return Promise.resolve(URLS[id]); return DB.get(id).then(r => { if (!r) return ''; URLS[id] = URL.createObjectURL(r.small || r.full); return URLS[id]; }).catch(() => ''); }

/* ---------- TQ: the computer's QR loop (TQ1 frames, deflate-raw, 360-character chunks) ---------- */
const TQ = (function () {
  const CH = 360;
  const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const unb64 = s => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  const pipe = (u8, Stream) => { const cs = new Stream('deflate-raw'), w = cs.writable.getWriter(); w.write(u8); w.close(); return new Response(cs.readable).arrayBuffer().then(b => new Uint8Array(b)); };
  function pack(obj) {
    const raw = new TextEncoder().encode(JSON.stringify(obj));
    const go = (mode, body) => { const s = b64(body), sid = Math.random().toString(36).slice(2, 7), n = Math.max(1, Math.ceil(s.length / CH)), out = []; for (let i = 0; i < n; i++) out.push('TQ1:' + sid + ':' + mode + ':' + (i + 1) + '/' + n + ':' + s.slice(i * CH, (i + 1) * CH)); return { frames: TQP.add(out), data: n, bytes: body.length }; };
    if (typeof CompressionStream === 'undefined') return Promise.resolve(go('r', raw));
    return pipe(raw, CompressionStream).then(z => go('z', z), () => go('r', raw));
  }
  function unpack(mode, s) { const u = unb64(s), done = x => JSON.parse(new TextDecoder().decode(x)); if (mode !== 'z') return Promise.resolve(done(u));
    if (typeof DecompressionStream === 'undefined') return Promise.reject(new Error('This browser cannot unpack the codes. Update it and try again.')); return pipe(u, DecompressionStream).then(done); }
  function draw(canvas, text) { const qr = qrcode(0, 'L'); qr.addData(text); qr.make(); const n = qr.getModuleCount(), q = 4, size = n + q * 2, ctx = canvas.getContext('2d');
    canvas.width = size; canvas.height = size; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size); ctx.fillStyle = '#000'; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect(c + q, r + q, 1, 1); }
  function player(canvas, frames, onTick, ms) { let i = 0; const step = () => { const k = i % frames.length; draw(canvas, frames[k]); onTick && onTick(k + 1, frames.length, Math.floor(i / frames.length)); i++; }; step(); const t = setInterval(step, ms || 260); return () => clearInterval(t); }
  function scanner(video, onProgress, onDone, onError) {
    let stopped = false, stream = null;
    const cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
    function stop() { stopped = true; if (stream) stream.getTracks().forEach(t => t.stop()); try { video.srcObject = null; } catch (e) {} }
    /* spare codes fill in a missed one, so one miss doesn't cost a whole loop */
    const take = TQP.decoder((got, total) => onProgress && onProgress(got, total), (mode, s) => { stop(); unpack(mode, s).then(onDone, e => onError && onError(e)); });
    function tick() { if (stopped) return; if (video.readyState >= 2 && video.videoWidth) { const w = video.videoWidth, h = video.videoHeight, sc = Math.min(1, 1280 / Math.max(w, h)); cv.width = Math.round(w * sc); cv.height = Math.round(h * sc); cx.drawImage(video, 0, 0, cv.width, cv.height);
      const img = cx.getImageData(0, 0, cv.width, cv.height); let code = null; try { code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' }); } catch (e) {} if (code && code.data) take(code.data); } if (!stopped) setTimeout(tick, 40); }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { setTimeout(() => onError && onError(new Error('No camera here. Open Parsec Mobile from its https address (Netlify) so the camera can start.')), 0); return stop; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }).then(s => { if (stopped) { s.getTracks().forEach(t => t.stop()); return; }
      stream = s; video.setAttribute('playsinline', ''); video.muted = true; video.srcObject = s; const p = video.play(); if (p && p.catch) p.catch(() => {}); tick(); }, e => onError && onError(e));
    return stop;
  }
  return { pack, unpack, draw, player, scanner };
})();

/* ---------- the view: the computer's copy with this phone's changes on top ---------- */
const RUN = () => S.L.run;
const runSecs = () => RUN() ? (Date.now() - new Date(RUN().s)) / 1000 : 0;
const entryH = x => Math.max(0, (new Date(x.e) - new Date(x.s)) / 3600000);
/* the computer's Burnt already holds this phone's clock up to the end it last heard ("id@end" in its acks) */
let KN = {};
function known() { KN = {}; ((S.pc && S.pc.ack) || []).forEach(a => { const m = /^(.+)@(\d{4}-\d\d-\d\dT[^#]+)#?$/.exec(String(a)); if (m && (!KN[m[1]] || m[2] > KN[m[1]])) KN[m[1]] = m[2]; }); }
const fromH = (id, s) => KN[id] && new Date(KN[id]) > new Date(s) ? KN[id] : s;   /* where this phone's own count starts */
const runNewSecs = () => RUN() ? Math.max(0, (Date.now() - new Date(fromH(RUN().id, RUN().s))) / 1000) : 0;
let V = null;
function build() {
  const out = { ros: [], ro: {}, op: {}, ops: [] };
  const pc = S.pc; if (!pc || !Array.isArray(pc.ros)) { V = out; return out; }
  const L = S.L; known();
  out.ros = pc.ros.map(r0 => {
    const r = JSON.parse(JSON.stringify(r0)); r.att = r.att || []; r.ops = r.ops || [];
    r.ops.forEach(o => { o.ro = r.id; o.lt = []; o.ln = []; o.nt = o.nt || []; o.tl = o.tl || []; o.tg = o.tg || [];
      o.pt = (o.pt || []).map((p, i) => ({ d: p[0] || '', pn: p[1] || '', q: p[2] || '1', st: p[3] || 'Not Ordered', i, src: 'pc' }));
      o.st = String(o.s || 'Hold Tech').replace(/^Waiting · /, 'Waiting – ').replace(/^Complete · /, 'Complete – '); o.why0 = o.rs || ''; out.op[o.id] = o; out.ops.push(o); });
    out.ro[r.id] = r; return r;
  });
  const opOf = x => { const o = out.op[x.opId]; return o && o.ro === x.roId ? o : null; };
  L.edits.slice().sort((a, b) => String(a.at).localeCompare(String(b.at))).forEach(x => { const o = opOf(x); if (!o) return; const f = x.f || {};
    if (f.s) { o.st = f.s; o.stAt = x.at; } if (typeof f.ca === 'string') o.ca = f.ca; if (typeof f.fx === 'string') o.fx = f.fx; });
  L.notes.forEach(x => { const o = opOf(x); if (o) o.ln.push(x); });
  L.parts.forEach(x => { const o = opOf(x); if (o) o.pt.push({ d: x.d, pn: x.pn, q: x.q, st: 'Not Ordered', src: 'ph', id: x.id }); });
  L.pstat.slice().sort((a, b) => String(a.at).localeCompare(String(b.at))).forEach(x => { const o = opOf(x); if (!o) return;
    const p = o.pt.find(q => q.src === 'pc' && q.pn === x.pn && q.d === x.d) || o.pt.find(q => q.src === 'pc' && q.i === x.i); if (p) p.st = x.st; });
  L.entries.forEach(x => { const o = opOf(x); if (!o) return; o.lt.push(x); o.b = (+o.b || 0) + Math.max(0, (new Date(x.e) - new Date(fromH(x.id, x.s))) / 3600000); });
  out.ops.forEach(o => { const last = o.lt.slice().sort((a, b) => new Date(b.e) - new Date(a.e))[0];
    if (last && (!o.stAt || new Date(last.e) > new Date(o.stAt))) { if (last.sr && last.sr !== 'Waiting – New Job' && /^(Waiting|Complete)/.test(last.sr)) o.st = last.sr; else o.st = 'Hold Tech'; if (last.sr === 'Waiting – New Job') o.pz = last.e; if (/^Complete/.test(last.sr || '')) o.dn = last.e; } });
  V = out; return out;
}
const burnt = o => (+o.b || 0) + (RUN() && RUN().opId === o.id ? runNewSecs() / 3600 : 0);
const isRun = o => !!(RUN() && RUN().opId === o.id);
function stOf(o) { if (isRun(o)) return { name: 'Working', why: RUN().r, sh: 'working' }; const n = o.d ? 'Declined' : o.st; return { name: n, why: '', sh: shapeOf(n) }; }
function catOf(o) { if (o.d) return 'x'; if (isRun(o)) return 'run'; const n = stOf(o).name; if (/^Complete/.test(n)) return o.dn && isToday(o.dn) ? 'done' : 'x'; if (/^Waiting/.test(n)) return 'wait'; return 'next'; }
function lists() {
  const V0 = V || build(), L = { run: null, next: [], wait: [], done: [] };
  V0.ops.forEach(o => { const c = catOf(o); if (c === 'run') L.run = o; else if (L[c]) L[c].push(o); });
  const r = o => V0.ro[o.ro];
  L.next.sort((a, b) => ((b.pz ? 1 : 0) - (a.pz ? 1 : 0)) || ((r(a).fq || 99) - (r(b).fq || 99)) || String(r(a).no).localeCompare(String(r(b).no)) || a.n - b.n);
  return L;
}
/* today: the day clock and the punches — the computer's record plus this phone's */
function today() {
  const k = dayKey(new Date()), pc = S.pc || {}, d = pc.day || { sh: [], ps: [] };
  const sh = {}, ps = {};
  if (pc.at && isToday(pc.at)) { (d.sh || []).forEach(x => { sh[x[0]] = { id: x[0], in: x[1], out: x[2], why: x[3], pc: 1 }; }); (d.ps || []).forEach(x => { ps[x[0]] = { id: x[0], s: x[1], e: x[2], ro: x[3], shop: !!x[4], opId: x[5] }; }); }
  S.L.shifts.filter(x => dayKey(x.in) === k).forEach(x => { sh[x.id] = { id: x.id, in: x.in, out: x.out, why: x.why || '' }; });
  S.L.entries.filter(x => dayKey(x.s) === k).forEach(x => { const o = V && V.op[x.opId]; ps[x.id] = { id: x.id, s: x.s, e: x.e, ro: o ? V.ro[o.ro].no : '?', opId: x.opId }; });
  if (RUN() && dayKey(RUN().s) === k) { const o = V && V.op[RUN().opId]; ps[RUN().id] = { id: RUN().id, s: RUN().s, e: null, ro: o ? V.ro[o.ro].no : '?', opId: RUN().opId, run: 1 }; }
  const SH = Object.values(sh).sort((a, b) => new Date(a.in) - new Date(b.in)), PS = Object.values(ps).sort((a, b) => new Date(a.s) - new Date(b.s));
  const now = Date.now(), end = x => x ? new Date(x).getTime() : now;
  const open = SH.find(x => !x.out) || null;
  let cl = 0, job = 0, shop = 0; SH.forEach(x => { cl += (end(x.out) - new Date(x.in)) / 60000; }); PS.forEach(x => { const m = (end(x.e) - new Date(x.s)) / 60000; if (x.shop) shop += m; else job += m; });
  /* air: on the clock, on no job, 20 minutes or more */
  const air = []; SH.forEach(x => { let c = new Date(x.in).getTime(); const b = end(x.out); PS.filter(p => end(p.e) > c && new Date(p.s).getTime() < b).forEach(p => { const a = new Date(p.s).getTime(); if (a > c) air.push([c, Math.min(a, b)]); c = Math.max(c, end(p.e)); }); if (b > c) air.push([c, b]); });
  const gaps = air.filter(g => g[1] - g[0] >= 20 * 60000 && g[1] < now - 60000 && !S.ui.airOk[g[0]]);
  const done = (V ? V.ops : []).filter(o => o.dn && isToday(o.dn)), q = done.reduce((a, o) => a + (+o.q || 0), 0), bb = done.reduce((a, o) => a + burnt(o), 0);
  return { SH, PS, open, cl, job, shop, air: Math.max(0, cl - job - shop), gaps, eff: bb > 0.05 ? q / bb : null, done };
}
/* ---------- what goes to the computer ---------- */
const outCount = () => { const L = S.L; return L.entries.length + L.notes.length + L.parts.length + L.pstat.length + L.edits.length + L.ib.length + L.shifts.length + (RUN() ? 1 : 0) + S.photos.filter(p => !p.sent && p.small).length; };
function b64Blob(blob) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = () => rej(r.error); r.readAsDataURL(blob); }); }
function phBundle(noPhotos) {
  const L = S.L, by = S.me || '', now = nowIso();
  const ch = [].concat(
    L.notes.map(x => ({ id: x.id, roId: x.roId, opId: x.opId, at: x.at, k: 'note', x: x.x })),
    L.parts.map(x => ({ id: x.id, roId: x.roId, opId: x.opId, at: x.at, k: 'part', d: x.d, pn: x.pn, q: x.q })),
    L.edits.map(x => ({ id: x.id, roId: x.roId, opId: x.opId, at: x.at, k: 'edit', f: x.f })),
    L.pstat.map(x => ({ id: x.id, roId: x.roId, opId: x.opId, at: x.at, k: 'pstat', i: x.i, pn: x.pn, d: x.d, st: x.st })),
    L.entries.map(x => ({ id: x.id, roId: x.roId, opId: x.opId, at: x.e, k: 'time', s: x.s, e: x.e, r: x.r, sr: x.sr || null, by })),
    RUN() && runSecs() > 60 ? [{ id: RUN().id, roId: RUN().roId, opId: RUN().opId, at: now, k: 'time', s: RUN().s, e: now, r: RUN().r, sr: null, by, open: 1 }] : [],
    L.shifts.map(x => ({ id: x.id, at: x.out || now, k: 'shift', in: x.in, out: x.out || now, why: x.why || '', by, open: x.out ? 0 : 1 })),
    L.ib.map(x => ({ id: x.id, at: x.at, k: 'ib', key: x.key, act: x.act, by }))
  );
  const ph = noPhotos ? [] : S.photos.filter(p => !p.sent && p.small);
  return Promise.all(ph.map(p => DB.get(p.id).then(r => r && r.small ? b64Blob(r.small).then(d => ({ id: p.fid, roId: p.roId, opId: p.opId || null, at: p.at, k: 'file', g: p.g, n: p.name, ty: 'image/jpeg', d })) : null)))
    .then(fs => ({ t: 'ph', v: 3, app: 'Parsec Mobile ' + APPV, at: now, by, ops: [], tk: [], ch: ch.concat(fs.filter(Boolean)) }));
}
function applyPc(b) {
  if (!b || b.t !== 'pc' || !Array.isArray(b.ros)) return { ok: false, msg: 'Those codes did not come from Parsec on the computer.' };
  if (b.me && S.me && !same(b.me, S.me) && outCount() && !S.sample) return { ok: false, msg: `These are ${first(b.me)}’s jobs, and this phone still has ${first(S.me)}’s changes. Send to the computer first.` };
  const ack = {}; (b.ack || []).forEach(id => { ack[id] = 1; });
  const v2 = b.v >= 2, ros = {}; b.ros.forEach(r => { ros[r.id] = 1; });
  const L = S.L; let ok = 0;
  const keep = (x, id) => { if (ack[id]) { ok++; return false; } return true; };
  const fresh = x => ros[x.roId] || Date.now() - new Date(x.at || x.e || 0) < 3 * 86400000;
  L.entries = L.entries.filter(x => keep(x, v2 ? x.id + '@' + x.e : x.id) && fresh(x));
  L.shifts = L.shifts.filter(x => !x.out || keep(x, x.id + '@' + x.out));
  ['notes', 'parts', 'pstat', 'edits'].forEach(k => { L[k] = L[k].filter(x => keep(x, x.id) && fresh(x)); });
  L.ib = L.ib.filter(x => keep(x, x.id));
  S.photos.forEach(p => { if (!p.sent && ack[p.fid]) { p.sent = true; ok++; } });
  if (L.run && !ros[L.run.roId]) endRun(null);   /* the RO left the list (closed): the clock stops and the time still goes */
  const wasSample = S.sample;
  S.pc = b; S.me = b.me || S.me || ''; S.sample = false; S.sync.in = nowIso(); S.ui.done = {};
  save(); build();
  return { ok: true, n: lists(), ros: b.ros.length, ok2: ok, wasSample };
}
/* ---------- the screen ---------- */
const UI = { route: 'work', job: null, tab: 'notes', sheet: null, pick: null, ibTab: 'in', fix: null, sync: 'get', fileG: 'pics', clockPick: null, partI: 0, air: null, eod: false, draft: '' };
const root = $('#app');
let toastT = null;
function toast(t, undo) { const w = $('#toast'); w.innerHTML = `<div class="ph-toast" role="status"><span>${t}</span>${undo ? '<button data-a="undo">Undo</button>' : ''}</div>`; UI.undo = undo || null; clearTimeout(toastT); toastT = setTimeout(() => { w.innerHTML = ''; UI.undo = null; }, undo ? 6000 : 3000); }
function topBar(title) {
  const n = outCount(), lastIn = S.sync.in ? fwhen(S.sync.in) : 'never';
  return `<div class="ph-top"><span class="ph-date">${fdate(new Date())}</span><span class="sp"></span><button class="ph-syncchip${n ? ' has' : ''}" data-a="go" data-v="sync">${ic('sync', 15)}${n ? n + ' to send' : 'Synced ' + lastIn}</button><button class="ph-av" data-a="sheet" data-v="me" title="You">${esc(ini(S.me || 'Me'))}</button></div>${title ? `<h1 class="ph-h1">${title}</h1>` : ''}`;
}
function jobRow(o, opt = {}) {
  const r = V.ro[o.ro], run = isRun(o), b = burnt(o), pct = o.q ? Math.min(100, b / o.q * 100) : 0, st = stOf(o);
  const pill = !run && /^(Waiting|Complete)/.test(st.name) ? `<span class="ph-pill${st.sh === 'parts' ? ' w' : st.sh === 'done' ? ' g' : ''}">${si(st.sh)}${esc(st.name.replace(/^Waiting – /, 'Waiting · '))}</span>` : o.pz ? '<span class="ph-pill a">Paused</span>' : o.bk ? '<span class="ph-pill g">Parts in</span>' : (o.tg[0] ? `<span class="ph-pill${o.tg[0][0] === 'ok' ? ' g' : ' a'}">${esc(o.tg[0][1])}</span>` : '');
  return `<div class="ph-job" data-a="job" data-v="${esc(o.id)}"><span class="l1"><span class="ph-no">${esc(r.no)}</span><span class="cu">${esc(r.cust)}</span></span><span class="l2">${esc(o.c || 'Operation')}</span>
    <span class="l3"><span class="ph-bar${o.q && b > o.q ? ' over' : ''}"><i style="width:${pct}%"></i></span><span${run ? ' data-tk="h"' : ''}>${h2(b)}</span> / ${h2(o.q)} h<span class="ph-type ${typeCls(o.t)}"><i></i>${esc(o.t || 'OP')}</span>${pill}</span>
    ${opt.nogo ? '' : `<button class="go${run ? ' on' : ''}" data-a="${run ? 'stopask' : 'start'}" data-v="${esc(o.id)}" title="${run ? 'Stop' : 'Start the clock'}">${ic(run ? 'stop' : 'play')}</button>`}</div>`;
}
function strip(D) {
  const a = 6 * 60, b = 18 * 60, X = d => ((Math.max(a, Math.min(b, mOf(d))) - a) / (b - a) * 100).toFixed(2), W = (s, e) => Math.max(0.4, (Math.max(a, Math.min(b, mOf(e))) - Math.max(a, Math.min(b, mOf(s)))) / (b - a) * 100).toFixed(2);
  let h = ''; D.PS.forEach(p => { h += `<i class="${p.shop ? 's' : 'j'}" style="left:${X(p.s)}%;width:${W(p.s, p.e || new Date())}%"></i>`; });
  D.gaps.forEach(g => { h += `<i class="a" style="left:${X(g[0])}%;width:${W(g[0], g[1])}%"></i>`; });
  h += `<i class="n" style="left:${X(new Date())}%"></i>`;
  return `<div class="ph-strip">${h}</div><div class="ph-ax"><span>6a</span><span>9a</span><span>12p</span><span>3p</span><span>6p</span></div>`;
}
function clockCard(D) {
  const run = RUN() ? V.op[RUN().opId] : null;
  if (!D.open) { const last = D.SH[D.SH.length - 1], lunch = last && /Lunch|Appointment|Break/i.test(last.why || '');
    return `<div class="ph-card ph-clk"><div class="r1"><span class="ph-dot out"></span><span class="t"><b>${lunch ? (last.why || 'Out') + ' since ' + hm(last.out) : 'Off the clock'}</b><small>${D.SH.length ? hmm(D.cl) + ' on the clock today' : 'Shift ends ' + esc((S.pc && S.pc.shiftEnd) || '15:30')}</small></span></div><button class="ph-btn pri full" data-a="clockin">${ic('play', 18)}${lunch ? 'Clock back in' : 'Clock in'}</button></div>`; }
  return `<div class="ph-card ph-clk"><div class="r1"><span class="ph-dot live${run ? '' : ' air'}"></span><span class="t"><b>On the clock · <span data-tk="cl">${hmm(D.cl)}</span></b><small>${run ? `On ${esc(V.ro[run.ro].no)} · in at ${hm(D.open.in)}` : `No job running — that’s air · in at ${hm(D.open.in)}`}${D.open.pc ? ' · clocked in on the computer' : ''}</small></span><button class="ph-btn sm" data-a="sheet" data-v="clock">Clock out</button></div>
    ${strip(D)}<div class="ph-stats"><div><small>On jobs</small><b>${hmm(D.job)}<em>${D.cl ? Math.round(D.job / D.cl * 100) : 0}%</em></b></div><div><small>Air</small><b>${hmm(D.air)}</b></div><div><small>Efficiency</small><b class="${D.eff == null ? '' : D.eff >= 1 ? 'g' : ''}">${D.eff == null ? '—' : Math.round(D.eff * 100) + '%'}</b></div></div></div>`;
}
function scrWelcome() {
  return `<div class="ph-welcome"><span class="lg">${LOGO}</span><h1 class="ph-hello">Parsec Mobile</h1><p>Your jobs, the clock, notes, parts and photos — on the phone. It talks to Parsec on the computer with QR codes, no network.</p>
    <button class="ph-btn pri full" data-a="go" data-v="sync" data-sync="get">${ic('scan', 18)}Get my jobs from the computer</button><p class="ph-cu" style="margin-top:10px">On the computer: your initials (bottom left) › Your data › Parsec Mobile › <b>Send to phone</b>, then pick your name.</p>
    <button class="ph-btn gh full" style="margin-top:18px" data-a="sample">Try it with sample jobs</button></div>`;
}
function scrWork() {
  const pc = S.pc; if (!pc) return scrWelcome();
  const D = today(), Ls = lists();
  if (!D.open && !D.SH.length && !RUN()) return scrStart(D, Ls);
  if (!D.open && UI.eod) return scrDone(D);
  let h = topBar('Today') + `<div style="margin-top:12px">${clockCard(D)}</div>`;
  const g = D.gaps[0]; if (g) h += `<div class="ph-warn" style="margin-top:10px">${ic('flag')}<span><b>${hmm((g[1] - g[0]) / 60000)} of air</b> ${hm(g[0])} – ${hm(g[1])} — what were you on?</span><button class="ph-btn sm" data-a="air" data-v="${g[0]}">Fill it</button></div>`;
  if (pc.fm && !S.ui.fmOk) h += `<div class="ph-note"><span class="ph-av">${esc(ini(pc.fm.by))}</span><div><b>${esc(first(pc.fm.by) || 'Foreman')}${pc.fm.at ? ' · ' + fwhen(pc.fm.at) : ''}</b><p>${esc(pc.fm.text)}</p><small><button class="lk" data-a="fmok">Got it</button></small></div></div>`;
  if (Ls.run) h += `<div class="ph-sec">On it now</div><div class="ph-now">${jobRow(Ls.run)}</div>`;
  h += `<div class="ph-sec">Next<small>${Ls.next.length}</small></div><div>${Ls.next.map(o => jobRow(o)).join('') || '<p class="ph-cu">Nothing queued — the foreman sends the next one.</p>'}</div>`;
  if (Ls.wait.length) h += `<div class="ph-sec">Waiting<small>${Ls.wait.length}</small></div><div>${Ls.wait.map(o => jobRow(o)).join('')}</div>`;
  if (Ls.done.length) h += `<div class="ph-sec">Done today<small>${Ls.done.length}</small></div><div>${Ls.done.map(o => jobRow(o, { nogo: 1 })).join('')}</div>`;
  h += `<p class="ph-cu" style="font-size:12px;margin-top:18px">From the computer ${S.sync.in ? fwhen(S.sync.in) : ''} · ${pc.ros.length} RO${pc.ros.length === 1 ? '' : 's'}${S.sample ? ' · sample jobs' : ''}</p>`;
  return h;
}
function scrStart(D, Ls) {
  const pc = S.pc, order = Ls.next.slice(0, 3);
  let h = topBar('') + `<h1 class="ph-hello">Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${esc(first(S.me) || 'there')}</h1><div style="margin-top:14px">${clockCard(D)}</div>`;
  if (pc.fm) h += `<div class="ph-note"><span class="ph-av">${esc(ini(pc.fm.by))}</span><div><b>${esc(first(pc.fm.by) || 'Foreman')}</b><p>${esc(pc.fm.text)}</p></div></div>`;
  if (order.length) h += `<div class="ph-sec">Your order<small>for today</small></div><div class="ph-order">${order.map((o, i) => { const r = V.ro[o.ro]; return `<div class="ph-job" data-a="job" data-v="${esc(o.id)}"><span class="n">${i + 1}</span><span class="l1"><span class="ph-no">${esc(r.no)}</span><span class="cu">${esc(r.cust)}</span></span><span class="l2">${esc(o.c)}</span><span class="l3">${esc(r.loc || '—')} · ${h2(o.q)} h quoted${o.bk ? ' · parts in' : ''}</span></div>`; }).join('')}</div>`;
  const news = (pc.ib || []).filter(x => !S.ui.done[x.key]).slice(0, 2);
  if (news.length) h += `<div class="ph-sec">Since yesterday</div>${news.map(x => `<div class="ph-warn g">${ic('inbox')}<span><b>${esc(first(x.from) || 'Parsec')}</b> · ${esc(x.t)}</span></div>`).join('')}`;
  return h;
}
function scrDone(D) {
  return topBar('') + `<h1 class="ph-hello">Done for today, ${esc(first(S.me))}</h1><div class="ph-card ph-clk" style="margin-top:14px"><div class="r1"><span class="ph-dot out"></span><span class="t"><b>Clocked out ${D.SH.length ? hm(D.SH[D.SH.length - 1].out) : ''}</b><small>${hmm(D.cl)} on the clock${D.eff != null ? ' · ' + Math.round(D.eff * 100) + '% efficiency' : ''}</small></span></div><div class="ph-stats"><div><small>On jobs</small><b>${hmm(D.job)}</b></div><div><small>Air</small><b>${hmm(D.air)}</b></div><div><small>Jobs done</small><b>${D.done.length}</b></div></div></div>
    ${outCount() ? `<div class="ph-warn" style="margin-top:12px">${ic('sync')}<span><b>${outCount()} change${outCount() === 1 ? '' : 's'}</b> to send — hold the phone up to the computer before you go.</span><button class="ph-btn sm" data-a="go" data-v="sync" data-sync="send">Send</button></div>` : `<div class="ph-warn g" style="margin-top:12px">${ic('check')}<span>Everything’s on the computer.</span></div>`}
    <button class="ph-btn full" style="margin-top:14px" data-a="clockin">${ic('play', 18)}Clock back in</button>`;
}
function filesOf(r, o) {
  const pcF = r.att.filter(f => !o || !f.op || f.op === o.n), loc = S.photos.filter(p => p.roId === r.id && (!o || !p.opId || p.opId === o.id));
  return GROUPS.map(([g, nm]) => ({ g, nm, pc: pcF.filter(f => (f.g || 'other') === g), loc: loc.filter(p => p.g === g) }));
}
function scrJob() {
  const o = V.op[UI.job]; if (!o) { UI.route = 'work'; return scrWork(); }
  const r = V.ro[o.ro], run = isRun(o), b = burnt(o), left = Math.max(0, (o.q || 0) - b), st = stOf(o), done = /^Complete/.test(st.name);
  const F = filesOf(r, o), nF = F.reduce((a, x) => a + x.pc.length + x.loc.length, 0), notes = o.nt.map(n => [n.a, n.x]).concat(o.ln.map(n => [n.at, n.x]));
  let h = `<div class="ph-top"><button class="ph-back" data-a="back">${ic('chevL')}${UI.from === 'inbox' ? 'Inbox' : UI.from === 'fixes' ? 'Fixes' : 'Work'}</button><span class="sp"></span><span class="ph-no">${esc(r.no)} · Op ${o.n} of ${r.ops.length}</span><span class="sp"></span><span style="width:38px"></span></div>`;
  h += `<div class="ph-cu">${esc(r.cust)} · ${esc([r.model || r.ymm, r.unit ? '#' + r.unit : ''].filter(Boolean).join(' · '))}${r.loc ? ' · ' + esc(r.loc) : ''}</div>`;
  h += `<div class="ph-chips"><button class="ph-st" data-a="sheet" data-v="status">${si(st.sh)}${esc(st.name)}${st.why ? `<span>· ${esc(st.why)}</span>` : ''}${ic('chevD')}</button><span class="ph-type ${typeCls(o.t)}"><i></i>${esc(o.t || 'OP')}</span>${o.bk ? '<span class="ph-pill g">Parts in</span>' : ''}</div>`;
  h += `<h2 class="ph-title">${esc(o.c || 'Operation')}</h2>`;
  if (o.why) h += `<div class="ph-note" style="margin-top:10px"><span class="ph-av">${esc(ini(o.why))}</span><div><p>${esc(o.why)}</p></div></div>`;
  h += `<div class="ph-card ph-timer"><div class="big"><span${run ? ' data-tk="t"' : ''}>${hms(b * 3600)}</span></div><div class="run">${run ? `<span class="ph-dot live"></span>Clock running · ${esc(RUN().r)}` : `<span class="ph-dot out"></span>Not running · ${esc(st.name)}`}</div>
    <div class="ph-prog"><i style="width:${o.q ? Math.min(100, b / o.q * 100) : 0}%"></i><b style="left:calc(100% - 2px)"></b></div>
    <div class="ph-q"><div><small>Quoted</small><b>${h2(o.q)}<em>h</em></b></div><div><small>Burnt</small><b><span${run ? ' data-tk="h"' : ''}>${h2(b)}</span><em>h</em></b></div><div><small>Left</small><b>${h2(left)}<em>h</em></b></div>${done && b > 0.05 ? `<div><small>Efficiency</small><b class="${o.q / b >= 1 ? 'g' : 'r'}">${Math.round(o.q / b * 100)}<em>%</em></b></div>` : `<div><small>Pace</small><b class="${!o.q || b <= o.q ? 'g' : 'r'}" style="font-family:var(--font-sans);font-size:15px">${!o.q ? '—' : b <= o.q ? 'On time' : 'Over'}</b></div>`}</div></div>`;
  const T = [['notes', 'Notes', notes.length], ['parts', 'Parts', o.pt.length], ['files', 'Files', nF], ['info', 'Job', '']];
  h += `<div class="ph-seg">${T.map(t => `<button class="${UI.tab === t[0] ? 'on' : ''}" data-a="tab" data-v="${t[0]}">${t[1]}${t[2] !== '' ? `<small>${t[2]}</small>` : ''}</button>`).join('')}</div>`;
  if (UI.tab === 'notes') h += `<div class="ph-nl">${notes.sort((a, c) => String(a[0]).localeCompare(String(c[0]))).map(n => `<div class="ph-n"><time>${esc(fwhen(n[0]))}</time><span>${esc(n[1])}</span></div>`).join('') || '<p class="ph-cu">No work notes yet.</p>'}</div>
    <div class="ph-comp"><textarea id="noteIn" rows="2" placeholder="What did you find or do?">${esc(UI.draft)}</textarea><button class="ph-ib" data-dict="1" title="Hold to talk">${ic('mic', 18)}</button><button class="ph-ib go2" data-a="addnote" title="Add the note">${ic('send', 17)}</button></div><p class="ph-cu" style="font-size:12px;margin-top:6px">Enter adds it with the time. Hold the mic and talk.</p>`;
  if (UI.tab === 'parts') h += `<div style="margin-top:6px">${o.pt.map((p, i) => `<div class="ph-pt"><b>${esc(p.d || 'Part')}</b><small>${esc(p.pn || '—')} · Qty ${esc(p.q)}${p.src === 'ph' ? ' · asked from the phone' : ''}</small>${p.src === 'pc' ? `<button class="ph-pst" data-a="part" data-v="${i}">${si(PSH[p.st] || 'hold')}${esc(p.st === 'Not Ordered' ? 'Not ordered' : p.st)}${ic('chevD')}</button>` : `<span class="ph-pst">${si('hold')}Asked</span>`}</div>`).join('') || '<p class="ph-cu" style="margin-top:10px">No parts on this job.</p>'}</div><button class="ph-add" data-a="sheet" data-v="needpart">${ic('plus')}Need a part</button>`;
  if (UI.tab === 'files') { h += F.map(x => `<div class="ph-fg"><h4>${si(x.pc.length + x.loc.length ? 'done' : 'hold')}${x.nm}<small>${x.pc.length + x.loc.length}</small></h4><div class="ph-th">${x.loc.map(p => `<span class="ph-ph" data-thumb="${esc(p.id)}"><em>${p.sent ? '' : 'to send · '}${hm(p.at)}</em></span>`).join('')}${x.pc.map(f => `<span class="doc"><b>${esc((String(f.n).split('.').pop() || 'file').toUpperCase().slice(0, 4))}</b>${esc(String(f.n).slice(0, 26))}</span>`).join('')}<span class="add" data-a="attach" data-v="${x.g}">${ic('plus')}</span></div></div>`).join('');
    h += `<p class="ph-cu" style="font-size:12px;margin-top:10px">Photos go to the computer with the next sync, made small. The full ones stay here — share them from your initials, top right.</p>`; }
  if (UI.tab === 'info') h += `<div style="margin-top:6px"><div class="ph-kv"><small>Complaint</small><b>${esc(o.c)}</b></div><button class="ph-kv" data-a="sheet" data-v="cause"><small>Cause</small><b class="${o.ca ? '' : 'mu'}">${esc(o.ca) || 'Add the cause'}</b></button><button class="ph-kv" data-a="sheet" data-v="corr"><small>Correction</small><b class="${o.fx ? '' : 'mu'}">${esc(o.fx) || 'Add the correction — Complete needs it'}</b></button>
    <div class="ph-kv"><small>Unit</small><b>${esc(r.ymm || r.model || '—')}${r.vin ? ' · VIN …' + esc(String(r.vin).slice(-8)) : ''}</b></div><div class="ph-kv"><small>Key tag · location</small><b>${esc(r.tag || '—')} · ${esc(r.loc || '—')}</b></div>${r.ops.length > 1 ? `<div class="ph-kv"><small>Other ops on this RO</small>${r.ops.filter(x => x.id !== o.id).map(x => `<button class="ph-olink" data-a="job" data-v="${esc(x.id)}">${si(stOf(V.op[x.id]).sh)}Op ${x.n} · ${esc(x.c)}</button>`).join('')}</div>` : ''}</div>`;
  return h;
}
function scrInbox() {
  const items = (S.pc && S.pc.ib || []).map(x => Object.assign({}, x, { done: !!S.ui.done[x.key] }));
  const L = items.filter(x => UI.ibTab === 'in' ? !x.done : x.done);
  let h = topBar('Inbox') + `<div class="ph-tabs2"><button class="${UI.ibTab === 'in' ? 'on' : ''}" data-a="ibtab" data-v="in">For you ${items.filter(x => !x.done).length}</button><button class="${UI.ibTab === 'done' ? 'on' : ''}" data-a="ibtab" data-v="done">Done</button></div>`;
  h += L.map(m => { const op = m.op && V.op[m.op];
    return `<div class="ph-msg${m.done ? ' done' : ''}"><span class="ph-av${/parsec/i.test(m.from) || !m.from ? ' sys' : ''}">${/parsec/i.test(m.from) || !m.from ? ic('inbox', 16) : esc(ini(m.from))}</span><span class="h"><b>${esc(m.from || 'Parsec')}</b><span>· ${esc(fwhen(m.at))}</span><span class="sp"></span>${m.done ? '' : '<i></i>'}</span><p>${esc(m.t)}</p>${m.b ? `<p class="b">${esc(m.b)}</p>` : ''}
      ${m.done ? '' : `<span class="a">${op ? `<button class="ph-btn sm pri" data-a="ibopen" data-v="${esc(m.key)}">Open the job</button>` : ''}<button class="ph-btn sm${op ? '' : ' pri'}" data-a="ibdone" data-v="${esc(m.key)}">${esc((m.acts[0] && !op ? m.acts[0][0] : '') || 'Done')}</button></span>`}</div>`; }).join('') || `<p class="ph-cu" style="margin-top:22px">${UI.ibTab === 'in' ? 'You’re all caught up.' : 'Nothing done yet.'}</p>`;
  h += `<p class="ph-cu" style="font-size:12px;margin-top:16px">What you mark done goes to the computer with the next sync.</p>`;
  return h;
}
function scrFixes() {
  const fx = (S.pc && S.pc.fx) || { mine: [], G: [] }, G = {}; fx.G.forEach(g => { G[g.k] = g; });
  if (UI.fix) { const g = G[UI.fix]; if (!g) { UI.fix = null; return scrFixes(); }
    const m = fx.mine.filter(x => x.k === g.k && V.op[x.opId] && catOf(V.op[x.opId]) !== 'x'), e0 = g.E[0];
    return `<div class="ph-top"><button class="ph-back" data-a="fixback">${ic('chevL')}Fixes</button></div><div class="ph-fxd"><div class="ph-cu">${esc(e0.by || '—')} · ${esc(e0.d)} · RO ${esc(e0.ro)}</div><h2>${esc(g.t)}</h2>
      <div class="ph-fxs"><div><small>Used</small><b>${g.n}×</b></div><div><small>Held</small><b class="g">${g.ok} of ${g.n}</b></div><div><small>Avg time</small><b>${g.avg || '—'} h</b>${g.q ? `<small>quoted ${g.q}</small>` : ''}</div></div>
      <div class="ph-kv" style="margin-top:8px"><small>Cause</small><b>${esc(e0.ca) || '—'}</b></div><div class="ph-kv"><small>Correction</small><b>${esc(e0.fx) || '—'}</b></div><div class="ph-kv"><small>Parts</small><b>${e0.pt.length ? e0.pt.map(p => esc(p[1] + (p[0] ? ' · ' + p[0] : '') + (p[2] > 1 ? ' × ' + p[2] : ''))).join('<br>') : '—'}</b></div>
      ${g.E.length > 1 ? `<div class="ph-kv"><small>Other times</small><b>${g.E.slice(1).map(e => esc(`${e.by || '—'} · ${e.d} · ${e.fx.slice(0, 80)}`)).join('<br>')}</b></div>` : ''}
      ${m.map(x => { const o = V.op[x.opId], r = V.ro[o.ro]; return `<div class="ph-warn" style="background:var(--fill)">${ic('fixes')}<span><b>On ${esc(r.no)} · Op ${o.n} this adds</b> the cause and the correction, and any parts not on the job yet. Nothing changes until you tap it.</span></div><button class="ph-btn pri full" style="margin-top:12px" data-a="usefix" data-v="${esc(o.id)}">Use on ${esc(r.no)} · Op ${o.n}</button>`; }).join('')}</div>`; }
  const mineK = {}; fx.mine.forEach(x => { if (V.op[x.opId] && catOf(V.op[x.opId]) !== 'x') mineK[x.k] = x; });
  const q = (UI.q || '').toLowerCase(), pass = g => !q || (g.t + ' ' + g.E.map(e => e.fx + ' ' + e.ca + ' ' + e.pt.map(p => p.join(' ')).join(' ')).join(' ')).toLowerCase().includes(q);
  const card = (g, x) => { const e = g.E[0]; return `<button class="ph-fx${x ? ' for' : ''}" data-a="fix" data-v="${esc(g.k)}"><span class="h">${x ? `<span class="ph-pill a">For ${esc(V.ro[V.op[x.opId].ro].no)}</span>` : ''}<span>${esc(e.by || '—')} · ${esc(e.d)}</span><span class="sp"></span>${ic('chevR', 16)}</span><b>${esc(g.t)}</b><p>${esc(e.fx)}</p><span class="m"><span><b>${g.n}×</b> used</span><span><b>${g.ok} of ${g.n}</b> held</span>${g.avg ? `<span><b>${g.avg} h</b> avg</span>` : ''}</span></button>`; };
  const mine = fx.G.filter(g => mineK[g.k] && pass(g)), rest = fx.G.filter(g => !mineK[g.k] && pass(g));
  return topBar('Fixes') + `<label class="ph-search">${ic('search')}<input id="fxq" type="search" placeholder="Complaint, code or part" value="${esc(UI.q || '')}"></label>
    ${mine.length ? `<div class="ph-sec">For your jobs<small>${mine.length}</small></div>${mine.map(g => card(g, mineK[g.k])).join('')}` : ''}<div class="ph-sec">In the shop</div>${rest.map(g => card(g, null)).join('') || '<p class="ph-cu">Nothing matches.</p>'}<p class="ph-cu" style="font-size:12px;margin-top:16px">Fixes come from the computer with each sync.</p>`;
}
function scrSync() {
  const n = outCount(), nph = S.photos.filter(p => !p.sent && p.small).length;
  let h = `<div class="ph-top"><button class="ph-back" data-a="back">${ic('chevL')}Back</button></div><h1 class="ph-h1">Sync</h1><div class="ph-seg"><button class="${UI.sync === 'get' ? 'on' : ''}" data-a="synct" data-v="get">Get from computer</button><button class="${UI.sync === 'send' ? 'on' : ''}" data-a="synct" data-v="send">Send to computer${n ? `<small>${n}</small>` : ''}</button></div>`;
  if (UI.sync === 'send') h += `<div class="ph-qr"><canvas data-qr></canvas></div><div class="ph-qrn"><b data-qrn>Making the codes…</b><span data-qrt>${n - (UI.phLater ? nph : 0)} change${n - (UI.phLater ? nph : 0) === 1 ? '' : 's'}${nph && !UI.phLater ? ' · ' + nph + ' photo' + (nph === 1 ? '' : 's') : ''}</span></div>
    ${nph ? `<div class="ph-chipr" style="justify-content:center;margin-top:10px"><button class="ph-chip${UI.phLater ? '' : ' on'}" data-a="phl" data-v="0">With ${nph} photo${nph === 1 ? '' : 's'}</button><button class="ph-chip${UI.phLater ? ' on' : ''}" data-a="phl" data-v="1">Photos later</button></div>` : ''}
    <ol class="ph-steps"><li>On the computer: your initials › Your data › Parsec Mobile › <b>Get from phone</b>.</li><li>Hold this screen up to the webcam, about 20 cm away. The screen stays on.</li><li>When the computer says Done, tap <b>Get from computer</b> here so this phone clears what it sent.</li></ol>`;
  else h += `<div class="ph-cam"><video data-video playsinline muted></video><i></i></div><div class="ph-qrn"><b data-scann>Point the camera at the codes</b><span data-cammsg>On the computer: Your data › Parsec Mobile › Send to phone, with your name picked.</span></div><div class="ph-scanbar"><i data-scanbar></i></div><div data-scanres></div>`;
  h += `<p class="ph-cu" style="font-size:12px;margin-top:14px">Last from the computer: ${S.sync.in ? when2(S.sync.in) : 'never'} · last sent: ${S.sync.out ? when2(S.sync.out) : 'never'}</p>`;
  return h;
}
/* ---------- sheets ---------- */
function sheet() {
  const k = UI.sheet; if (!k) return '';
  const o = UI.job && V.op[UI.job], r = o && V.ro[o.ro];
  let h = '';
  if (k === 'status' && o) { const run = isRun(o);
    h = `<h3>${run ? 'Stop the clock' : 'Change the status'}</h3><p class="sub">${esc(r.no)} · ${esc(o.c)}</p><div class="ph-sb2">`;
    if (run) h += `<span class="ph-lbl">Still working — what you’re doing</span><div class="ph-chipr">${START.map(x => `<button class="ph-chip${RUN().r === x ? ' on' : ''}" data-a="why" data-v="${x}">${x}</button>`).join('')}</div><span class="ph-lbl">Stop, and the job is now…</span>`;
    else h += `<span class="ph-lbl">The job is now…</span>`;
    h += STOPS.map(s => `<button class="ph-opt${UI.pick === s[0] ? ' on' : ''}" data-a="pick" data-v="${s[0]}">${si(s[1])}<b>${s[2]}</b><small>${s[3]}</small>${s[0] === 'Complete' && !o.fx ? '<span class="r">add it</span>' : ''}</button>`).join('');
    if (UI.pick === 'Complete' && !o.fx) h += `<div class="ph-warn">${ic('note')}<span><b>Correction</b> — what fixed it.</span></div><textarea class="ph-in" id="corrIn" rows="3" placeholder="Replaced …"></textarea>`;
    else if (UI.pick) h += `<textarea class="ph-in" id="stNote" rows="2" placeholder="${UI.pick === 'Waiting – Parts' ? 'What part you need (optional)' : 'Note for the job (optional)'}"></textarea>`;
    h += `</div><div class="ph-sfoot"><button class="ph-btn" data-a="close">Cancel</button><button class="ph-btn pri" data-a="setst"${UI.pick ? '' : ' disabled'}>${run ? 'Stop & set' : 'Set status'}</button></div>`; }
  if (k === 'attach' && o) h = `<h3>Add to ${esc(r.no)}</h3><p class="sub">Photos are made small for the QR codes (DTCs a bit sharper, so they take longer); the full ones stay on this phone.</p><div class="ph-sb2"><span class="ph-lbl">File it under</span><div class="ph-chipr">${GROUPS.map(g => `<button class="ph-chip${UI.fileG === g[0] ? ' on' : ''}" data-a="fileg" data-v="${g[0]}">${g[1]}</button>`).join('')}</div>
    <span class="ph-lbl">From</span><button class="ph-opt" data-a="pickfile" data-v="camera">${ic('camera')}<b>Take a photo</b><small>Opens the camera</small></button><button class="ph-opt" data-a="pickfile" data-v="photos">${ic('image')}<b>Choose photos</b><small>From the phone’s pictures — pick several</small></button><button class="ph-opt" data-a="pickfile" data-v="file">${ic('clip')}<b>Add a file</b><small>A screenshot of the DTCs, a scan — pictures travel best</small></button></div><div class="ph-sfoot"><button class="ph-btn" data-a="close">Cancel</button></div>`;
  if (k === 'part' && o) { const p = o.pt[UI.partI]; if (p) h = `<h3>${esc(p.d || 'Part')}</h3><p class="sub">${esc(p.pn || '—')} · Qty ${esc(p.q)} · now ${esc(p.st)}</p><div class="ph-sb2">${[['Picked up', 'working', 'You have it at the truck'], ['Installed', 'done', 'It’s on the unit']].map(x => `<button class="ph-opt${p.st === x[0] ? ' on' : ''}" data-a="pset" data-v="${x[0]}">${si(x[1])}<b>${x[0]}</b><small>${x[2]}</small></button>`).join('')}<p class="ph-cu" style="font-size:12px;margin:8px 4px 0">Ordered, received and staged are set by parts. Something wrong with it? Add a note on the job.</p></div><div class="ph-sfoot"><button class="ph-btn" data-a="close">Cancel</button></div>`; }
  if (k === 'needpart' && o) h = `<h3>Need a part</h3><p class="sub">${esc(r.no)} · Op ${o.n} — parts sees it after the next sync.</p><div class="ph-sb2"><span class="ph-lbl">What it is</span><input class="ph-in" id="npD" placeholder="Air dryer cartridge"><span class="ph-lbl">Part number (if you know it)</span><input class="ph-in" id="npP" placeholder="85125386" inputmode="text"><span class="ph-lbl">How many</span><input class="ph-in" id="npQ" value="1" inputmode="numeric"></div><div class="ph-sfoot"><button class="ph-btn" data-a="close">Cancel</button><button class="ph-btn pri" data-a="addpart">Ask for it</button></div>`;
  if ((k === 'cause' || k === 'corr') && o) h = `<h3>${k === 'cause' ? 'Cause' : 'Correction'}</h3><p class="sub">${esc(r.no)} · Op ${o.n} · ${esc(o.c)}</p><div class="ph-sb2"><textarea class="ph-in" id="ccIn" rows="5" placeholder="${k === 'cause' ? 'What was wrong' : 'What fixed it'}">${esc(k === 'cause' ? o.ca : o.fx)}</textarea></div><div class="ph-sfoot"><button class="ph-btn" data-a="close">Cancel</button><button class="ph-btn pri" data-a="savecc" data-v="${k}">Save</button></div>`;
  if (k === 'clock') { const D = today(), run = RUN() ? V.op[RUN().opId] : null, p = UI.clockPick;
    h = `<h3>Clock out</h3><p class="sub">In at ${D.open ? hm(D.open.in) : '—'} · ${hmm(D.cl)} on the clock today</p><div class="ph-sb2">
      <button class="ph-opt${p === 'Lunch' ? ' on' : ''}" data-a="cpick" data-v="Lunch">${ic('coffee')}<b>Lunch</b><small>Off the clock — clock back in after</small></button>
      <button class="ph-opt${p === 'Appointment' ? ' on' : ''}" data-a="cpick" data-v="Appointment">${ic('clock')}<b>Appointment or break</b><small>Off the clock until you’re back</small></button>
      <button class="ph-opt${p === 'End of day' ? ' on' : ''}" data-a="cpick" data-v="End of day">${ic('exit')}<b>End of day</b><small>Close out today</small></button>`;
    if (p === 'End of day') { h += `<span class="ph-lbl">Before you go</span>`;
      if (run) h += `<div class="ph-warn">${ic('clock')}<span><b>${esc(V.ro[run.ro].no)} is still running.</b> It stops at End of day — or set its status first.</span><button class="ph-btn sm" data-a="stopask" data-v="${esc(run.id)}">Change</button></div>`;
      D.gaps.forEach(g => { h += `<div class="ph-warn b">${ic('flag')}<span><b>${hmm((g[1] - g[0]) / 60000)} of air</b> ${hm(g[0])} – ${hm(g[1])} has no job.</span><button class="ph-btn sm" data-a="air" data-v="${g[0]}">Fill it</button></div>`; });
      const worked = {}; D.PS.forEach(x => { if (x.opId && V.op[x.opId]) worked[x.opId] = 1; });
      Object.keys(worked).filter(id => { const o2 = V.op[id]; return !o2.ln.some(n => isToday(n.at)) && !o2.nt.some(n => isToday(n.a)); }).slice(0, 3).forEach(id => { const o2 = V.op[id];
        h += `<div class="ph-warn">${ic('note')}<span><b>${esc(V.ro[o2.ro].no)}</b> · ${esc(o2.c)} — no note today.</span><button class="ph-btn sm" data-a="job" data-v="${esc(id)}">Add</button></div>`; });
      if (outCount()) h += `<div class="ph-warn g">${ic('sync')}<span>Then send to the computer — <b>${outCount()}</b> change${outCount() === 1 ? '' : 's'} waiting.</span></div>`; }
    h += `</div><div class="ph-sfoot"><button class="ph-btn" data-a="close">Cancel</button><button class="ph-btn pri" data-a="clockout"${p ? '' : ' disabled'}>${p === 'End of day' ? 'Clock out for the day' : p === 'Lunch' ? 'Start lunch' : 'Clock out'}</button></div>`; }
  if (k === 'air') { const g = UI.air, Ls = lists(), cand = [Ls.run].concat(Ls.next, Ls.wait, Ls.done).filter(Boolean);
    h = `<h3>${hmm((g[1] - g[0]) / 60000)} of air · ${hm(g[0])} – ${hm(g[1])}</h3><p class="sub">Which job were you on? It goes on that job as clock time.</p><div class="ph-sb2">${cand.map(x => `<button class="ph-opt" data-a="airjob" data-v="${esc(x.id)}">${si(stOf(x).sh)}<b>${esc(V.ro[x.ro].no)} · ${esc(x.c)}</b><small>${esc(V.ro[x.ro].cust)}</small></button>`).join('')}</div><div class="ph-sfoot"><button class="ph-btn" data-a="close">Cancel</button><button class="ph-btn" data-a="airok">It’s right — no job</button></div>`; }
  if (k === 'me') { const nAll = S.photos.length;
    h = `<div style="display:flex;align-items:center;gap:12px"><span class="ph-av" style="width:46px;height:46px;font-size:15px">${esc(ini(S.me || 'Me'))}</span><div><h3>${esc(S.me || 'Not set up yet')}</h3><p class="sub" style="margin:0">Technician · Parsec Mobile ${APPV}</p></div></div><div class="ph-sb2">
      <span class="ph-lbl">Look</span><div class="ph-chipr">${[['system', 'Like the phone'], ['light', 'Ivory'], ['dark', 'Graphite']].map(t => `<button class="ph-chip${S.prefs.theme === t[0] ? ' on' : ''}" data-a="theme" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>
      <span class="ph-lbl">Photos</span><button class="ph-opt" data-a="share">${ic('image')}<b>Share the full-size photos</b><small>${nAll} on this phone — email, text, AirDrop</small></button>
      <span class="ph-lbl">This phone</span><button class="ph-opt" data-a="go" data-v="sync">${ic('sync')}<b>Sync with the computer</b><small>${outCount()} to send · last from the computer ${S.sync.in ? fwhen(S.sync.in) : 'never'}</small></button>
      <button class="ph-opt" data-a="wipe">${ic('trash')}<b>Clear this phone</b><small>For handing it to someone else — send first</small></button></div>`; }
  return `<div class="ph-scrim" data-a="close"></div><div class="ph-sheet" role="dialog" aria-modal="true"><div class="ph-grab"></div>${h}</div>`;
}
function foot() {
  if (UI.route === 'sync' || !S.pc) return '';
  if (UI.route === 'job') { const o = V.op[UI.job]; if (!o) return ''; const run = isRun(o);
    return `<div class="ph-foot"><div class="ph-acts"><button class="ph-btn" data-a="attach">${ic('camera')}Photo</button><button class="ph-btn" data-a="notefocus">${ic('mic')}Note</button>${run ? `<button class="ph-btn main" data-a="sheet" data-v="status">${ic('stop')}Stop</button>` : `<button class="ph-btn main start" data-a="start" data-v="${esc(o.id)}">${ic('play')}${RUN() ? 'Switch to this job' : 'Start the clock'}</button>`}</div></div>`; }
  const run = RUN() ? V.op[RUN().opId] : null, unread = (S.pc.ib || []).filter(x => !S.ui.done[x.key]).length;
  const cbar = run && UI.route !== 'work' ? `<div class="ph-cbar"><span class="ph-dot live"></span><span class="t" data-a="job" data-v="${esc(run.id)}"><b><span data-tk="t">${hms(burnt(run) * 3600)}</span> · ${esc(V.ro[run.ro].no)}</b><small>${esc(run.c)}</small></span><button class="ph-btn sm" data-a="stopask" data-v="${esc(run.id)}">${ic('stop', 16)}Stop</button></div>` : '';
  return `<div class="ph-foot tabs">${cbar}<div class="ph-tabs">${[['work', 'today', 'Work', 0], ['inbox', 'inbox', 'Inbox', unread], ['fixes', 'fixes', 'Fixes', 0]].map(t => `<button class="${UI.route === t[0] ? 'on' : ''}" data-a="go" data-v="${t[0]}"><span class="w">${ic(t[1])}${t[3] ? `<em>${t[3]}</em>` : ''}</span>${t[2]}</button>`).join('')}</div></div>`;
}
let SCROLL = {};
function render(keep) {
  build();
  const sc = $('.ph-main'), key = UI.route + (UI.route === 'job' ? UI.job : '');
  if (sc && keep !== false) SCROLL[UI.lastKey] = sc.scrollTop;
  const main = UI.route === 'job' ? scrJob() : UI.route === 'inbox' ? scrInbox() : UI.route === 'fixes' ? scrFixes() : UI.route === 'sync' ? scrSync() : scrWork();
  root.innerHTML = `<div class="ph-main">${main}</div>${foot()}${sheet()}`;
  if (UI.sheet && !UI.undo) { clearTimeout(toastT); $('#toast').innerHTML = ''; }
  const s2 = $('.ph-main'); if (s2) s2.scrollTop = keep === false ? 0 : (SCROLL[key] || 0);
  UI.lastKey = key;
  $$('[data-thumb]').forEach(el => thumbUrl(el.dataset.thumb).then(u => { if (u) el.style.backgroundImage = `url("${u}")`; }));
  const ni = $('#noteIn'); if (ni) { ni.addEventListener('input', () => { UI.draft = ni.value; }); ni.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote(ni.value); } }); }
  const fq = $('#fxq'); if (fq) fq.addEventListener('input', () => { UI.q = fq.value; const pos = fq.selectionStart; render(); const f2 = $('#fxq'); if (f2) { f2.focus(); try { f2.setSelectionRange(pos, pos); } catch (e) {} } });
  if (UI.route === 'sync') syncStart(); else syncStop();
}
function commit(keep) { save(); render(keep); }
setInterval(() => {
  if (!RUN()) { if (new Date().getSeconds() === 0 && UI.route === 'work' && !UI.sheet) render(); return; }
  const o = V && V.op[RUN().opId]; if (!o) return; const b = burnt(o);
  $$('[data-tk="t"]').forEach(x => x.textContent = hms(b * 3600)); $$('[data-tk="h"]').forEach(x => x.textContent = h2(b));
  const D = today(); $$('[data-tk="cl"]').forEach(x => x.textContent = hmm(D.cl));
}, 1000);
/* ---------- the clock ---------- */
function defReason(o) { return o && (o.t === 'DIAG' || o.t === 'COMEBACK') ? 'Diagnosing' : o && o.t === 'PM' ? 'Inspecting' : 'Repairing'; }
function clockIn(at) { at = at || nowIso(); if (S.L.shifts.some(x => !x.out)) return false; const D = today(); if (D.open) return false; S.L.shifts.push({ id: uid('sh'), in: at, out: null }); return true; }
function endRun(sr) { const run = RUN(); if (!run) return null; const e = new Date(), s = new Date(run.s); S.L.run = null; if (e - s < 60000) return null;
  const x = { id: run.id, roId: run.roId, opId: run.opId, s: run.s, e: e.toISOString(), r: run.r, sr: sr || null }; S.L.entries.push(x); return x; }
function start(opId) {
  const o = V.op[opId]; if (!o) return; if (isRun(o)) return;
  const prev = RUN() ? V.op[RUN().opId] : null; if (prev) endRun('Waiting – New Job');
  const auto = clockIn();
  S.L.run = { id: uid('pn'), roId: o.ro, opId: o.id, s: nowIso(), r: defReason(o) }; UI.eod = false;
  buzz(); commit();
  toast(`${prev ? 'Switched from ' + esc(V.ro[prev.ro].no) + ' · ' : ''}Clock started · ${esc(V.ro[o.ro].no)}${auto ? ' · clocked in' : ''}`);
}
/* ---------- notes, photos ---------- */
function addNote(text) {
  const o = V.op[UI.job]; text = capS(String(text || '').trim()); if (!o || !text) return;
  S.L.notes.push({ id: uid('nt'), roId: o.ro, opId: o.id, at: nowIso(), x: text.slice(0, 600) }); UI.draft = ''; commit(); toast('Note added');
}
function shrink(file, max, q) {
  return new Promise((res, rej) => { const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => { const sc = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.max(1, Math.round(img.naturalWidth * sc)), h = Math.max(1, Math.round(img.naturalHeight * sc));
      const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url); c.toBlob(b => b ? res(b) : rej(new Error('Could not shrink the photo')), 'image/jpeg', q); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('That file isn’t a picture this phone can read — share it from the phone instead.')); }; img.src = url; });
}
const fileIn = $('#filein');
function pickFile(mode) { fileIn.value = ''; fileIn.accept = mode === 'file' ? '*/*' : 'image/*'; fileIn.multiple = mode !== 'camera'; if (mode === 'camera') fileIn.setAttribute('capture', 'environment'); else fileIn.removeAttribute('capture'); UI.sheet = null; render(); fileIn.click(); }
fileIn.addEventListener('change', () => {
  const files = [...(fileIn.files || [])], o = V.op[UI.job]; if (!files.length || !o) return; const r = V.ro[o.ro], g = UI.fileG || 'pics'; let n = 0;
  Promise.all(files.map(f => Promise.all([shrink(f, 1600, 0.82), g === 'dtc' ? shrink(f, 900, 0.6) : shrink(f, 512, 0.5)]).then(([full, small]) => { const at = nowIso(), id = uid('img');
    const name = `RO-${r.no} - Op ${o.n} - ${GNAME[g]} - ${at.slice(0, 10)} ${hm(at).replace(':', '')}${files.length > 1 ? '-' + (++n) : ''}.jpg`;
    return DB.put({ id, full, small }).then(() => { S.photos.push({ id, fid: uid('fl'), roId: r.id, opId: o.id, g, name, at, size: full.size, small: small.size, sent: false }); }); })))
    .then(() => { UI.tab = 'files'; commit(); toast(`${files.length > 1 ? files.length + ' photos' : 'Photo'} added to ${GNAME[g]} · goes with the next sync`); })
    .catch(e => toast(esc(e.message)));
});
function sharePhotos() {
  return Promise.all(S.photos.map(p => DB.get(p.id).then(r => r ? new File([r.full], p.name, { type: 'image/jpeg' }) : null))).then(fs => { fs = fs.filter(Boolean); if (!fs.length) { toast('No photos on this phone'); return; }
    if (navigator.canShare && navigator.canShare({ files: fs })) return navigator.share({ files: fs, title: 'Parsec photos' }).catch(() => {});
    fs.forEach((f, i) => setTimeout(() => { const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }, i * 350)); });
}
/* voice: hold the mic */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
let DICT = null;
document.addEventListener('pointerdown', e => { const b = e.target.closest('[data-dict]'); if (!b) return; e.preventDefault();
  if (!SR) { const t = $('#noteIn'); if (t) t.focus(); toast('Tap the mic on the keyboard to talk'); return; }
  try { const rec = new SR(); rec.lang = navigator.language || 'en-US'; rec.interimResults = true; rec.continuous = true; let fin = '', inter = ''; b.classList.add('on'); buzz();
    rec.onresult = ev => { inter = ''; for (let i = ev.resultIndex; i < ev.results.length; i++) { const t = ev.results[i][0].transcript; if (ev.results[i].isFinal) fin += t + ' '; else inter += t; } const t = $('#noteIn'); if (t) t.value = (UI.draft ? UI.draft + ' ' : '') + (fin + inter).trim(); };
    rec.onerror = ev => { if (ev.error === 'not-allowed') toast('Microphone blocked — allow it in the browser settings'); };
    rec.onend = () => { b.classList.remove('on'); DICT = null; const t = $('#noteIn'); if (t) UI.draft = t.value; };
    rec.start(); DICT = rec; } catch (err) { toast('Talking didn’t start — use the mic on the keyboard'); } });
document.addEventListener('pointerup', () => { if (DICT) try { DICT.stop(); } catch (e) {} });
/* ---------- sync ---------- */
let SY = { stop: null, lock: null };
function syncStop() { if (SY.stop) { try { SY.stop(); } catch (e) {} SY.stop = null; } if (SY.lock) { try { SY.lock.release(); } catch (e) {} SY.lock = null; } }
function wake() { try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(l => { SY.lock = l; }, () => {}); } catch (e) {} }
function syncStart() {
  syncStop();
  if (UI.sync === 'send') { const cv = $('[data-qr]'); if (!cv) return;
    phBundle(UI.phLater).then(b => TQ.pack(b)).then(pk => { if (UI.route !== 'sync' || UI.sync !== 'send' || !document.body.contains(cv)) return;
      const n = $('[data-qrn]'), t = $('[data-qrt]'); if (t) t.textContent += ` · ${pk.frames.length} code${pk.frames.length === 1 ? '' : 's'}, about ${Math.max(1, Math.round(pk.frames.length * 0.26))} s a loop`;
      SY.stop = TQ.player(cv, pk.frames, (i, tot, loop) => { if (n) n.textContent = tot === 1 ? 'Showing the code' : `Code ${i} of ${tot}${loop ? ' · loop ' + (loop + 1) : ''}`; }, 260); S.sync.out = nowIso(); save(); wake(); })
      .catch(e => { const n = $('[data-qrn]'); if (n) n.textContent = 'Could not make the codes: ' + e.message; });
  } else { const vid = $('[data-video]'); if (!vid) return; const bar = $('[data-scanbar]'), n = $('[data-scann]'), res = $('[data-scanres]'), msg = $('[data-cammsg]');
    SY.stop = TQ.scanner(vid, (got, tot) => { n.textContent = `Read ${got} of ${tot} codes`; bar.style.width = (got / tot * 100) + '%'; if (msg) msg.textContent = 'Keep it steady…'; }, data => {
      const r = applyPc(data); syncStop(); bar.style.width = '100%';
      if (!r.ok) { n.textContent = 'Not taken'; res.innerHTML = `<div class="ph-warn b">${ic('flag')}<span>${esc(r.msg)}</span></div>`; return; }
      n.textContent = 'Done'; buzz();
      res.innerHTML = `<div class="ph-warn g">${ic('check')}<span><b>${r.ros} RO${r.ros === 1 ? '' : 's'}</b> for ${esc(first(S.me))} from the computer.${r.ok2 ? ` The computer has <b>${r.ok2}</b> change${r.ok2 === 1 ? '' : 's'} from this phone — cleared here.` : ''}${r.wasSample ? ' The sample jobs are gone.' : ''}</span></div><button class="ph-btn pri full" style="margin-top:12px" data-a="go" data-v="work">See your work</button>`;
    }, e => { if (msg) msg.textContent = !e ? 'The camera did not start.' : e.name === 'NotAllowedError' ? 'Camera blocked — allow it in the browser settings and try again.' : e.name === 'NotFoundError' || e.name === 'OverconstrainedError' ? 'No camera found on this device.' : e.name === 'NotReadableError' ? 'Another app is using the camera — close it and try again.' : e.message || 'The camera did not start.'; n.textContent = 'Camera not available'; });
    wake(); }
}
/* ---------- taps ---------- */
const A = {
  go(t) { UI.route = t.dataset.v; UI.sheet = null; if (t.dataset.sync) UI.sync = t.dataset.sync; if (UI.route !== 'fixes') UI.fix = null; render(false); },
  back() { UI.route = UI.from || 'work'; UI.from = null; UI.sheet = null; render(); },
  job(t) { if (t.closest('.go')) return; UI.from = UI.route === 'job' ? UI.from : UI.route; UI.job = t.dataset.v; UI.tab = 'notes'; UI.route = 'job'; UI.sheet = null; UI.draft = ''; render(false); },
  tab(t) { UI.tab = t.dataset.v; render(); },
  ibtab(t) { UI.ibTab = t.dataset.v; render(); },
  synct(t) { UI.sync = t.dataset.v; render(); },
  phl(t) { UI.phLater = t.dataset.v === '1'; render(); },
  sheet(t) { UI.sheet = t.dataset.v; UI.pick = null; if (t.dataset.v === 'clock') UI.clockPick = null; render(); if (t.dataset.v === 'needpart') setTimeout(() => { const i = $('#npD'); if (i) i.focus(); }, 250); },
  close() { UI.sheet = null; render(); },
  start(t) { start(t.dataset.v); },
  stopask(t) { UI.job = t.dataset.v; UI.sheet = 'status'; UI.pick = null; render(); },
  why(t) { const run = RUN(); if (!run) return; const k = t.dataset.v; if (runSecs() > 60) { const x = endRun(null); S.L.run = { id: uid('pn'), roId: run.roId, opId: run.opId, s: x ? x.e : run.s, r: k }; } else run.r = k; UI.sheet = null; commit(); toast('Now ' + k.toLowerCase()); },
  pick(t) { UI.pick = t.dataset.v; render(); const sb = $('.ph-sb2'), ta = $('#corrIn') || $('#stNote'); if (sb && ta) { sb.scrollTop = sb.scrollHeight; if ($('#corrIn')) setTimeout(() => ta.focus({ preventScroll: true }), 50); } },
  setst() {
    const o = V.op[UI.job]; if (!o || !UI.pick) return; const k = UI.pick, note = ($('#stNote') || {}).value || '', corr = ($('#corrIn') || {}).value || '';
    if (k === 'Complete' && !o.fx && !corr.trim()) { toast('Add the correction first'); return; }
    const at = nowIso();
    if (corr.trim()) S.L.edits.push({ id: uid('ed'), roId: o.ro, opId: o.id, at, f: { fx: capS(corr.trim()) } });
    if (note.trim()) S.L.notes.push({ id: uid('nt'), roId: o.ro, opId: o.id, at, x: capS(note.trim()) });
    if (isRun(o)) endRun(k); else S.L.edits.push({ id: uid('ed'), roId: o.ro, opId: o.id, at: nowIso(), f: { s: k === 'Waiting – New Job' ? 'Hold Tech' : k } });
    UI.sheet = null; commit(); toast(`${esc(V.ro[o.ro].no)} → ${k === 'Waiting – New Job' ? 'paused, top of Next' : esc(k)}`);
  },
  attach(t) { if (t.dataset.v) UI.fileG = t.dataset.v; UI.sheet = 'attach'; render(); },
  fileg(t) { UI.fileG = t.dataset.v; render(); },
  pickfile(t) { pickFile(t.dataset.v); },
  part(t) { UI.partI = +t.dataset.v; UI.sheet = 'part'; render(); },
  pset(t) { const o = V.op[UI.job], p = o && o.pt[UI.partI]; if (!p) return; S.L.pstat.push({ id: uid('ps'), roId: o.ro, opId: o.id, at: nowIso(), i: p.i, pn: p.pn, d: p.d, st: t.dataset.v }); UI.sheet = null; commit(); toast(`${esc(p.d || 'Part')} · ${t.dataset.v.toLowerCase()}`); },
  addpart() { const o = V.op[UI.job], d = ($('#npD') || {}).value || '', pn = ($('#npP') || {}).value || '', q = ($('#npQ') || {}).value || '1'; if (!o || !(d.trim() || pn.trim())) { toast('Say what the part is'); return; }
    S.L.parts.push({ id: uid('pt'), roId: o.ro, opId: o.id, at: nowIso(), d: d.trim().slice(0, 120), pn: pn.trim().slice(0, 40), q: String(parseFloat(q) > 0 ? parseFloat(q) : 1) }); UI.sheet = null; UI.tab = 'parts'; commit(); toast('Asked for it · parts sees it after the next sync'); },
  savecc(t) { const o = V.op[UI.job], v = ($('#ccIn') || {}).value || ''; if (!o) return; const f = {}; f[t.dataset.v === 'cause' ? 'ca' : 'fx'] = capS(v.trim()); S.L.edits.push({ id: uid('ed'), roId: o.ro, opId: o.id, at: nowIso(), f }); UI.sheet = null; commit(); toast('Saved'); },
  addnote() { const t = $('#noteIn'); addNote(t ? t.value : ''); },
  notefocus() { UI.tab = 'notes'; render(); setTimeout(() => { const t = $('#noteIn'); if (t) { t.focus(); t.scrollIntoView({ block: 'center' }); } }, 60); },
  cpick(t) { UI.clockPick = t.dataset.v; render(); },
  clockout() { const p = UI.clockPick; if (!p) return; const at = nowIso(); if (RUN()) endRun(p === 'End of day' ? 'End of day' : p === 'Lunch' ? 'Lunch' : null);
    const D0 = today(); if (D0.open && D0.open.pc && !S.L.shifts.some(x => x.id === D0.open.id)) S.L.shifts.push({ id: D0.open.id, in: D0.open.in, out: null, pc: 1 });   /* clocked in on the computer: the phone closes that one */
    S.L.shifts.filter(x => !x.out).forEach(x => { x.out = at; x.why = p; }); UI.sheet = null; UI.eod = p === 'End of day'; UI.route = 'work'; commit(false); toast(p === 'End of day' ? `Clocked out ${hm(at)}` : `${p} · clocked out ${hm(at)}`); },
  clockin() { const was = clockIn(); UI.eod = false; commit(); toast(was ? `Clocked in ${hm(new Date())}` : 'Already on the clock'); },
  air(t) { const D = today(), g = D.gaps.find(x => String(x[0]) === t.dataset.v) || D.gaps[0]; if (!g) return; UI.air = g; UI.sheet = 'air'; render(); },
  airjob(t) { const o = V.op[t.dataset.v], g = UI.air; if (!o || !g) return; S.L.entries.push({ id: uid('pn'), roId: o.ro, opId: o.id, s: new Date(g[0]).toISOString(), e: new Date(g[1]).toISOString(), r: defReason(o), sr: null }); UI.sheet = null; commit(); toast(`${hmm((g[1] - g[0]) / 60000)} added to ${esc(V.ro[o.ro].no)}`); },
  airok() { if (UI.air) S.ui.airOk[UI.air[0]] = 1; UI.sheet = null; commit(); },
  fmok() { S.ui.fmOk = 1; commit(); },
  ibdone(t) { const m = (S.pc.ib || []).find(x => x.key === t.dataset.v); if (!m) return; S.ui.done[m.key] = 1; S.L.ib.push({ id: uid('ib'), at: nowIso(), key: m.key, act: t.textContent.trim() || 'Done' }); commit(); toast('Done · the computer hears with the next sync'); },
  ibopen(t) { const m = (S.pc.ib || []).find(x => x.key === t.dataset.v); if (!m || !V.op[m.op]) return; S.ui.done[m.key] = 1; S.L.ib.push({ id: uid('ib'), at: nowIso(), key: m.key, act: 'Opened' }); save(); UI.from = 'inbox'; UI.job = m.op; UI.tab = 'notes'; UI.route = 'job'; render(false); },
  fix(t) { UI.fix = t.dataset.v; render(false); },
  fixback() { UI.fix = null; render(); },
  usefix(t) { const fx = S.pc.fx, g = fx.G.find(x => x.k === UI.fix), o = V.op[t.dataset.v]; if (!g || !o) return; const e = g.E[0], at = nowIso();
    S.L.edits.push({ id: uid('ed'), roId: o.ro, opId: o.id, at, f: { ca: e.ca, fx: e.fx } });
    let np = 0; e.pt.forEach(p => { if (!o.pt.some(q => (p[0] && q.pn === p[0]) || same(q.d, p[1]))) { S.L.parts.push({ id: uid('pt'), roId: o.ro, opId: o.id, at, d: p[1], pn: p[0], q: String(p[2] || 1) }); np++; } });
    commit(); toast(`Cause and correction added to ${esc(V.ro[o.ro].no)} · Op ${o.n}${np ? ' · ' + np + ' part' + (np === 1 ? '' : 's') + ' asked for' : ''}`); },
  theme(t) { S.prefs.theme = t.dataset.v; applyTheme(); commit(); },
  share() { sharePhotos(); },
  wipe() { if (outCount() && !confirm('This phone still has changes the computer hasn’t got. Clear anyway?')) return; if (!outCount() && !confirm('Clear everything on this phone?')) return;
    S = blank(); DB.clear().catch(() => {}); save(); UI.route = 'work'; UI.sheet = null; render(false); toast('This phone is cleared'); },
  sample() { applyPc(sampleBundle()); S.sample = true; save(); UI.route = 'work'; render(false); toast('Sample jobs — try the clock, notes, parts and photos'); },
  undo() { if (UI.undo) UI.undo(); }
};
root.addEventListener('click', e => { const t = e.target.closest('[data-a]'); if (!t || t.disabled) return; const f = A[t.dataset.a]; if (f) { e.preventDefault(); f(t, e); } });
document.addEventListener('click', e => { const t = e.target.closest('#toast [data-a="undo"]'); if (t) A.undo(); });
function applyTheme() { const t = S.prefs.theme === 'system' ? (matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : S.prefs.theme; document.documentElement.dataset.theme = t; const m = $('meta[name="theme-color"]'); if (m) m.content = t === 'dark' ? '#151514' : '#FBFAF7'; }
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (S.prefs.theme === 'system') applyTheme(); }); } catch (e) {}
document.addEventListener('visibilitychange', () => { if (document.hidden) syncStop(); else if (UI.route === 'sync') syncStart(); });
/* ---------- sample jobs, in the computer's format ---------- */
function sampleBundle() {
  const d = (h, m, n) => { const x = new Date(); x.setDate(x.getDate() - (n || 0)); x.setHours(h, m, 0, 0); return x.toISOString(); };
  const op = o => Object.assign({ live: false, d: false, m: 0, rs: '', ca: '', fx: '', tl: [], nt: [], pt: [], ml: 0, mp: 0, mo: 0, ec: 0, pz: '', bk: 0, tg: [], why: '', dn: '' }, o);
  return { t: 'pc', v: 2, at: nowIso(), rate: 210, me: 'Mike Rodriguez', shiftEnd: '15:30', ack: [],
    fm: { by: 'Frank Delaney', text: '37761 after the dryer. Volvo wants the old cooler tagged.', at: d(6, 40) },
    day: { sh: [], ps: [] },
    ros: [
      { id: 's1', no: '37742', cust: 'Summit Freightways', tag: 'K-18', vin: '4V4NC9EH5KN159798', ymm: '2019 Volvo VNL 760', unit: 'T-762', st: 'Hold Tech', tech: 'Mike Rodriguez', loc: 'Bay 3', fq: 1, model: 'VNL 760', att: [{ n: 'dash.jpg', z: 400000, at: '', op: 0, g: 'dash' }, { n: 'dtc-report.pdf', z: 88000, at: '', op: 1, g: 'dtc' }],
        ops: [op({ id: 's1o1', n: 1, t: 'DIAG', c: 'Air leak at the dryer – diagnose', s: 'Hold Tech', b: 0.3, q: 1.5, ca: 'Purge valve stuck open, cartridge saturated', nt: [{ a: d(7, 14), x: 'Leak at the dryer purge valve — soapy water confirms.' }], pt: [['Purge valve', '21880286', '1', 'Received', 0], ['Air dryer cartridge', '85125386', '1', 'Ordered', 0]] }),
          op({ id: 's1o2', n: 2, t: 'PM', c: 'PM-A service', s: 'Hold Tech', b: 0, q: 1.2 })] },
      { id: 's2', no: '37761', cust: 'Summit Freightways', tag: 'K-22', vin: '4V4NC9EH0MN224517', ymm: '2021 Volvo VNL 860', unit: '4502', st: 'Hold Tech', tech: 'Mike Rodriguez', loc: 'Lot D2', fq: 2, model: 'VNL 860', att: [],
        ops: [op({ id: 's2o1', n: 1, t: 'WARR', c: 'EGR cooler leaking – replace', s: 'Hold Tech', b: 0, q: 3.6, tg: [['pt', 'Parts staged']], pt: [['EGR cooler', '23258450', '1', 'Staged', 0], ['Gasket kit', '21719589', '1', 'Staged', 0]] })] },
      { id: 's3', no: '37768', cust: 'Coastal Beverage', tag: 'K-07', vin: '', ymm: '2022 Volvo VNL 300', unit: '31', st: 'Hold Tech', tech: 'Mike Rodriguez', loc: 'Bay 3', fq: 3, model: 'VNL 300', att: [],
        ops: [op({ id: 's3o1', n: 1, t: 'OP', c: 'Front brake shoes & drums', s: 'Hold Tech', b: 0.42, q: 2.8, pz: d(14, 20, 1), bk: 1, pt: [['Brake drum', '20514926', '2', 'Staged', 0], ['Shoe kit', '85136213', '1', 'Staged', 0]] })] },
      { id: 's4', no: '37750', cust: 'Hartley Produce', tag: 'K-31', vin: '', ymm: '2018 Volvo VNL 670', unit: '12', st: 'Waiting – Customer', tech: 'Mike Rodriguez', loc: 'Lot B4', fq: 0, model: 'VNL 670', att: [],
        ops: [op({ id: 's4o1', n: 1, t: 'OP', c: 'A/C not cooling – compressor clutch', s: 'Waiting · Approval', b: 2.5, q: 3.0, ca: 'Compressor clutch coil open', pt: [['Clutch kit', '22327069', '1', 'Not Ordered', 0]] })] }
    ],
    ib: [{ key: 'x1', from: 'Frank Delaney', at: d(6, 40), k: 'ask', t: 'Take 37761 next — EGR cooler, warranty.', b: 'Tag the old cooler for Volvo.', ro: 's2', op: 's2o1', acts: [['Accept', 'acc']] },
      { key: 'x2', from: 'Ben Okafor', at: d(6, 52), k: 'fyi', t: 'Shoes and drums for 37768 are staged — bay 3, shelf B.', b: '', ro: 's3', op: 's3o1', acts: [] },
      { key: 'x3', from: 'Parsec', at: d(7, 0), k: 'rem', t: 'Sign your timesheet — Oct 12 – 25.', b: 'Due Friday.', ro: null, op: null, acts: [['Sign on the computer', 'tl']] }],
    fx: { mine: [{ k: 'airdryer', roId: 's1', opId: 's1o1' }, { k: 'egr', roId: 's2', opId: 's2o1' }], G: [
      { k: 'airdryer', t: 'Air leak at the dryer', n: 6, ok: 6, avg: 1.3, q: 1.5, E: [{ by: 'Dana Kowalski', d: '2026-09-30', ro: '36102', ca: 'Purge valve stuck open, cartridge saturated', fx: 'Replaced purge valve and desiccant cartridge. Leak tested at cut-out, no drop over 10 min.', pt: [['21880286', 'Purge valve', 1], ['85125386', 'Air dryer cartridge', 1]], h: 1.2 }] },
      { k: 'egr', t: 'EGR cooler leaking', n: 4, ok: 4, avg: 3.4, q: 3.6, E: [{ by: 'Luis Martinez', d: '2026-08-12', ro: '35077', ca: 'Cooler core cracked', fx: 'Replaced EGR cooler and gaskets, pressure tested at 20 psi, no loss.', pt: [['23258450', 'EGR cooler', 1], ['21719589', 'Gasket kit', 1]], h: 3.5 }] },
      { k: 'wheelseal', t: 'Wheel seal leaking – drive axle', n: 9, ok: 8, avg: 2.0, q: 2.2, E: [{ by: 'Priya Shah', d: '2026-10-02', ro: '36540', ca: 'Seal lip torn', fx: 'Replaced wheel seal, cleaned brakes, refilled hub oil to the line.', pt: [['21047435', 'Wheel seal', 1]], h: 2.1 }] }] } };
}
applyTheme(); build(); render(false);
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
window.__pm = { S: () => S, applyPc, phBundle, TQ, render, A, UI: () => UI, build: () => build(), V: () => V, today, lists };
