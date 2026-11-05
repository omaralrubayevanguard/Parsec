/* Parsec · ro-page · layout.js
   The RO page in your layout (Parsec 12): the one-panel page — operations in the middle, the truck card and the sections on the right (ROPS), who is on it, the right column's fit.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ri ropH1 ropN ropFirst ropMe ropIsMe ropPerson ropWriter ropAgo ropClk ropLive ropRun … (19 functions, 3 constants)
   state      punches
   uses       access/ kit/ pages/ pages/inbox/ pages/triage/ ro/ state/
*/
/* ============================== Parsec 12: the RO page in your layout (b9/rop1.js — inside the RO page, JC) ==============================
   From the RO page mock-up. The middle: Operations, Parts on this RO, Fault codes, Photos & codes, Messages about this RO, Truck history,
   Warranty claim, Customer, Estimate & approval, Ready to close. The right: Truck & status, the stage bar, Who has it, People, Schedule,
   Vehicle, Money. Next step and Paperwork are off — Paperwork's fields went to Customer (case, PO, auth, tech support), Schedule (the dates)
   and Vehicle (department). Activity stays the header button (11.3). An open operation: Time (each punch with its notes between start and
   stop), Parts, Files. And picking (the selecting mock-up): a box on each operation and part, Ctrl / Shift click, a bar along the bottom. */
var ROP_IC = {
  camera: '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.2-1.8A1 1 0 0 1 9.5 5h5a1 1 0 0 1 .8.4L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.2"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/><path d="M11.5 13.5L20 4"/>',
  undo: '<path d="M9 7L4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.2 5.2l-5 5a1.8 1.8 0 0 0 2.5 2.5l5-5a4 4 0 0 0 5.2-5.2l-2.4 2.4-2.3-.3-.3-2.3z"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="M4 17l4.5-4 3.5 3 3-2.5 5 4"/>',
  file: '<path d="M7 3.5h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z"/><path d="M14 3.5v4h4"/>',
  clockPlus: '<path d="M20 12a8 8 0 1 1-6.2-7.8"/><path d="M12 8v4l2.5 1.5"/><path d="M18.5 3v5M16 5.5h5"/>',
  notePlus: '<path d="M13.5 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h12a1.5 1.5 0 0 0 1.5-1.5v-7.5"/><path d="M8 10h5M8 13.5h7"/><path d="M18 3v5M15.5 5.5h5"/>',
  box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
  scan: '<path d="M7 3.5H5.5a2 2 0 0 0-2 2V7M17 3.5h1.5a2 2 0 0 1 2 2V7M7 20.5H5.5a2 2 0 0 1-2-2V17M17 20.5h1.5a2 2 0 0 0 2-2V17"/><path d="M8 9h8M8 12h8M8 15h5"/>',
  upload: '<path d="M12 15.5V4.5M7.5 9 12 4.5 16.5 9"/><path d="M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/>',
  paste: '<rect x="6" y="5" width="12" height="15.5" rx="2"/><path d="M9.5 5V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1"/><path d="M9 11h6M9 14.5h4"/>',
  partAsk: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/><circle cx="18.5" cy="18.5" r="3.5" fill="currentColor" stroke="none" opacity=".18"/>',
  copyNotes: '<rect x="8.5" y="8.5" width="11.5" height="12" rx="2"/><path d="M15.5 8.5V5.5a1.5 1.5 0 0 0-1.5-1.5H5.5A1.5 1.5 0 0 0 4 5.5V14a1.5 1.5 0 0 0 1.5 1.5h3"/><path d="M11.5 12.5h5M11.5 16h3.5"/>',
  chevDn: '<path d="M7 10l5 5 5-5"/>', chevUp: '<path d="M7 14l5-5 5 5"/>'
};
function ri(k, sz) { if (!ROP_IC[k]) return pxI(k, sz); sz = sz || 16; return '<svg class="px-ico" width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ROP_IC[k] + '</svg>'; }
var ROPS = { ro: null, o: {}, p: {}, pOp: null, last: null };
var ROPU = { msgTo: '', msgAll: false, histAll: false, fcOp: null };
function ropH1(v) { return (Math.round((+v || 0) * 10) / 10).toFixed(1); }
function ropN(job) { return S.jobs.indexOf(job) + 1; }
function ropFirst(n) { return String(n || '').trim().split(/\s+/)[0] || ''; }
function ropMe() { try { return PG.me().name; } catch (e) { return punchByName() || 'Admin'; } }
function ropIsMe(n) { try { return PG.isMe(n); } catch (e) { return false; } }
function ropPerson(role) { try { return PG.person(role) || ''; } catch (e) { return ''; } }
function ropWriter() { var w = ''; try { w = rtPerson('writer') || ''; } catch (e) {} return w; }
function ropAgo(t) { try { return PG.ago(t); } catch (e) { return pxWhen(t); } }
function ropClk(t) { var d = new Date(t); if (isNaN(d)) return ''; return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(/\s/g, ' '); }
function ropLive() { var L = []; try { L = raLive(RO); } catch (e) { L = (S.jobs || []).filter(function (j) { return j && !j.declined; }); } return L; }
function ropRun(job) { return STATE.punches.filter(function (p) { return p.opId === job.id && !p.stop; })[0] || null; }
function ropNone(t) { return el('div', { class: 'rop-none', text: t }); }
function ropNote(to, k, job, t, b, q) { if (typeof IB === 'undefined' || !to) return false; try { IB.send({ to: to, k: k, src: 'ros', ro: RO.id, op: job ? job.id : null, t: t, b: b || '', q: q || '' }); return true; } catch (e) { console.error(e); return false; } }
/* Undo takes the whole change back — with whatever an automation did because of it (it adds its own undo step after ours) */
function ropUndo(msg) { var t0 = Date.now() - 3000;
  toast(msg, { label: 'UNDO', run: function () {
    try { var g = 8; while (g-- && UNDO.length > 1) { var u = UNDO[UNDO.length - 1]; if ((u.label === 'automation' || u.auto) && u.at >= t0) UNDO.pop(); else break; } } catch (e) {}
    restoreSnapshot(); } }); }
function ropNo() { return (RO && RO.roNumber) || tgNum(RO); }   /* the full RO number, as on the band */
function ropAv(n) { return '<span class="px-av" title="' + esc(n || '') + '"' + v149eAvAttr(n) + '>' + esc(ivInit(n || '?')) + '</span>'; }
/* a block in the middle: its heading, then its rows */
function ropSec(key, title, sub, body, act) {
  var head = el('div', { class: 'px-sec rop-sech' }, [el('h3', { text: title })].concat(sub ? [el('span', { class: 'n', text: sub })] : []).concat(act ? [act] : []));
  return el('section', { class: 'rop-blk rop-k-' + key }, [head].concat(body));
}

/* Messages about this RO now live in the box above the operations (messages-chat.js, 17.2) */
/* ---------- the right ---------- */
/* Parsec 12.7: the band's Start / Stop is about your own clock */
/* ===== Parsec 14.7 (B) — inside the RO page (JC): second-level menus that stay on screen, and Release without checks ===== */
/* a submenu (the status picker's Waiting – Customer ›, a part's Move to operation ›) sits beside its menu — on the right when it
   fits, on the left when it doesn't, never past the window; taller than the window, it scrolls */
function pxSubFit(sub, box, row) {
  var vw = window.innerWidth, vh = window.innerHeight, br = box.getBoundingClientRect(), rr = row ? row.getBoundingClientRect() : null;
  sub.style.position = 'absolute'; sub.style.margin = '0'; sub.style.zIndex = '2'; sub.style.maxHeight = ''; sub.style.overflowY = '';
  var w = sub.offsetWidth, h = sub.offsetHeight;
  if (h > vh - 16) { sub.style.maxHeight = (vh - 16) + 'px'; sub.style.overflowY = 'auto'; h = vh - 16; }
  var left = br.width + 6;
  if (br.right + 6 + w > vw - 8) left = br.left - 6 - w >= 8 ? -(w + 6) : Math.max(8 - br.left, vw - 8 - w - br.left);
  var top = rr ? rr.top - 6 - br.top : 0;
  if (br.top + top + h > vh - 8) top = vh - 8 - h - br.top;
  if (br.top + top < 8) top = 8 - br.top;
  sub.style.left = left + 'px'; sub.style.top = top + 'px';
  sub.classList.toggle('is-left', left < 0);
}
