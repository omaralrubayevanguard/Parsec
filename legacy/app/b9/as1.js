/* ============================== Assets (Parsec 14) ==============================
   Every truck anyone in the shop has worked on — one row per truck (its VIN; the unit # and customer when there's no VIN),
   for checking a truck's history: every visit (the RO, its complaints, operations, parts, techs, cost, miles and engine hours
   that day), repeat repairs (the same system or part back within 90 days, or an operation marked as a comeback), lifetime
   totals and the miles and engine hours over time. Like Manager → Fleets, for single trucks. Reads STATE.ros — open and closed. */
/* the sample history: some of each customer's earlier visits are the trucks the shop already knows, so a truck has a history
   to show — miles and hours wound back by the days between (only the sample, never a shop's own data) */
function asHash(s){ var h = 2166136261; s = String(s || ""); for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function asSampleFleet(H){
  if(!Array.isArray(H) || !H.length) return 0;
  var DAY = 864e5, ms = function(t){ var n = t ? new Date(t).getTime() : NaN; return isFinite(n) ? n : null; };
  var F = ["vin", "unitNumber", "year", "make", "model", "engineType", "axles", "cab", "sleeper", "engineSerial"];
  var pool = {}, busy = {};
  (STATE.ros || []).forEach(function(r){ if(!r || r.shop || r.id === SHOP_RO_ID || !r.sample || r.hist || !r.vin) return;
    (pool[r.customerName] = pool[r.customerName] || []).push({ src: r, from: ms(r.dateOpened), mi: +String(r.mileage || "").replace(/\D/g, "") || 0, hr: +String(r.engineHours || "").replace(/\D/g, "") || 0, at: ms(r.dateOpened), cur: 1 });
    (busy[r.vin] = busy[r.vin] || []).push([ms(r.dateOpened), r.dateClosed ? ms(r.dateClosed) : Infinity]); });
  var n = 0;
  H.slice().sort(function(a, b){ return (ms(b.dateOpened) || 0) - (ms(a.dateOpened) || 0); }).forEach(function(r){   /* newest first: miles wind back from the truck we know */
    var P = pool[r.customerName], h = asHash(r.roNumber + "|fleet"), a = ms(r.dateOpened), b = ms(r.dateClosed) || a;
    if(P && P.length && h % 100 < 62){
      var t = P[(h >>> 8) % P.length];
      var free = !(busy[t.src.vin] || []).some(function(w){ return a <= w[1] + DAY / 2 && b >= w[0] - DAY / 2; });
      if(free && b < t.at){
        var days = (t.at - a) / DAY, mpd = 230 + asHash(t.src.vin) % 260;
        F.forEach(function(k){ if(t.src[k] != null && t.src[k] !== "") r[k] = t.src[k]; });
        r.mileage = String(Math.max(1200, Math.round((t.mi - days * mpd) / 10) * 10));
        r.engineHours = String(Math.max(150, Math.round(t.hr - days * mpd / 34)));
        (busy[t.src.vin] = busy[t.src.vin] || []).push([a, b]);
        P.push({ src: t.src, mi: +r.mileage, hr: +r.engineHours, at: a });   /* the next one back starts from here */
        n++; return;
      }
    }
    /* a truck seen only in the history — later visits can be this one too */
    (pool[r.customerName] = pool[r.customerName] || []).push({ src: r, mi: +String(r.mileage || "").replace(/\D/g, "") || 0, hr: +String(r.engineHours || "").replace(/\D/g, "") || 0, at: a });
    (busy[r.vin] = busy[r.vin] || []).push([a, b]);
  });
  return n;
}
var ASPG = (function(){
  const ICN = /*__AS_IC__*/{};
  const ic = (n, s) => { s = s || 15; const p = ICN[n]; return p ? `<svg class="tg-ic" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${p}</svg>` : (PG.ic(n, s) || ''); };
  const esc = PG.e, kbd = PG.kbd;
  const DAY = 864e5;
  const U = { q: '', sel: null, sort: 'last', cust: '', flt: 'all', kb: false, all: false, _me: null };
  const rd = () => { try{ PG.keepScroll(render); }catch(e){ render(); } };
  const phone = () => document.documentElement.getAttribute('data-device') === 'phone';
  const seeCost = () => typeof permCost !== 'function' || permCost();
  const money = n => seeCost() ? tgMoney(n) : '—';
  const nOf = v => { const n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.]/g, '')); return isFinite(n) && n > 0 ? n : null; };
  const ms = t => { const n = t ? new Date(t).getTime() : NaN; return isFinite(n) ? n : null; };
  const comma = n => Math.round(n).toLocaleString('en-US');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const md = t => { const d = new Date(t); return isNaN(d) ? '—' : MON[d.getMonth()] + ' ' + d.getDate(); };
  const mdy = t => { const d = new Date(t); return isNaN(d) ? '—' : MON[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); };
  const ago = t => { const d = Math.floor((Date.now() - t) / DAY); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago'; };
  const dtxt = d => d < 1 ? 'same day' : (d < 10 ? Math.round(d * 10) / 10 : Math.round(d)) + ' d';
  const pl = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  const vinKey = v => { const s = String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); return s.length >= 11 ? s : ''; };
  const unitKey = r => { const u = String(r.unitNumber || '').trim().toUpperCase(); return u ? u + '|' + String(r.customerName || '').trim().toLowerCase() : ''; };
  /* the systems — the same grouping as the Fixes page */
  const SYS = [['Aftertreatment', /nox|dpf|def\b|doser|regen|aftertreat|scr\b|soot|urea|adblue/], ['Cooling', /coolant|radiator|water pump|thermostat|fan clutch|overheat|hose/],
    ['Air and brakes', /air dryer|air leak|brake|chamber|slack|wheel seal|abs|air slow|compressor|governor/], ['Cab and A/C', /a\/c|\bac\b|heater|hvac|door|mirror|seat|window|wiper|blower|dash/],
    ['Drivetrain', /clutch|transmission|i-shift|axle|driveshaft|u-joint|differential|pto/], ['Electrical', /alternator|battery|starter|wiring|harness|light|lamp|charging|fuse|connector/],
    ['Engine', /turbo|injector|misfire|engine|oil leak|egr|fuel|cylinder|boost|vgt|valve|head gasket|derate/]];
  const sysOf = t => { const s = String(t || '').toLowerCase(); for(const x of SYS) if(x[1].test(s)) return x[0]; return ''; };
  const CONS = /\b(oil|filter|coolant|clamp|gasket|fluid|grease|def|bolt|nut|washer|o-?ring|belt|wash)\b/i;
  const routine = op => { const t = opJobType(op); return t === 'PM' || t === 'RECALL' || /\bpm\b|pm service|inspection|recall/i.test(op.complaint || ''); };
  const jtOf = op => { try{ return opJobType(op); }catch(e){ return op.jobType || 'OP'; } };
  const fixTxt = op => { const L = Array.isArray(op.log) ? op.log : []; const f = L.filter(l => l.kind === 'fix').slice(-1)[0], c = L.filter(l => l.kind === 'cause').slice(-1)[0];
    return f ? ['Fix', f.text] : c ? ['Cause', c.text] : op.correction ? ['Fix', op.correction] : op.cause ? ['Cause', op.cause] : null; };
  /* ---------- the trucks ---------- */
  function trucks(){
    const R = (STATE.ros || []).filter(r => r && !r.shop && r.id !== SHOP_RO_ID);
    const T = {}, keyOf = r => { const v = vinKey(r.vin); if(v) return 'v:' + v; const u = unitKey(r); return u ? 'u:' + u : 'r:' + r.id; };
    R.forEach(r => { const k = keyOf(r); (T[k] = T[k] || { k, ros: [] }).ros.push(r); });
    /* an RO with no VIN joins the truck with its unit # and customer, when there's just the one */
    const uv = {}; Object.keys(T).forEach(k => { if(k[0] !== 'v') return; T[k].ros.forEach(r => { const u = unitKey(r); if(u) (uv[u] = uv[u] || {})[k] = 1; }); });
    Object.keys(T).forEach(k => { if(k[0] !== 'u') return; const s = uv[k.slice(2)], L = s ? Object.keys(s) : []; if(L.length === 1){ T[L[0]].ros.push(...T[k].ros); delete T[k]; } });
    const who = {}; (STATE.punches || []).forEach(p => { if(p && p.roId && p.by) (who[p.roId] = who[p.roId] || {})[p.by] = 1; });
    return Object.keys(T).map(k => truck(T[k], who));
  }
  function visit(r, who){
    const a = ms(r.dateOpened) || ms(r.createdAt) || 0, done = (() => { try{ return roIsDone(r); }catch(e){ return !!r.dateClosed; } })(), b = ms(r.dateClosed) || (done && r.status && ms(r.status.setAt)) || null;
    let ops = []; try{ ops = raLive(r); }catch(e){ ops = (r.operations || []).filter(o => !o.declined); }
    let m = { labor: 0, parts: 0, other: 0, total: 0 }; try{ m = roMoney(r); }catch(e){}
    const techs = Object.keys(Object.assign({}, who[r.id] || {}, r.assignedTech ? { [r.assignedTech]: 1 } : {}));
    const q = ops.reduce((s, o) => s + (+o.quoted || 0), 0);
    return { r, a, b, open: !done, days: Math.max(0, ((b || Date.now()) - a) / DAY), mi: nOf(r.mileage), hr: nOf(r.engineHours), ops, m, techs, q };
  }
  function truck(t, who){
    const V = t.ros.map(r => visit(r, who)).sort((x, y) => x.a - y.a);
    const last = V[V.length - 1], pick = f => { for(let i = V.length - 1; i >= 0; i--){ const v = V[i].r[f]; if(v != null && String(v).trim() !== '') return v; } return ''; };
    const o = { k: t.k, V, n: V.length, last, r: last.r, vin: vinKey(pick('vin')), unit: String(pick('unitNumber') || ''), cust: String(pick('customerName') || ''), year: pick('year'), make: String(pick('make') || ''), model: String(pick('model') || ''),
      eng: String(pick('engineType') || ''), esn: String(pick('engineSerial') || ''), first: V[0].a, lastAt: last.a, open: V.filter(v => v.open) };
    o.title = [o.year, o.make || 'Volvo', o.model].filter(Boolean).join(' ') || 'Truck';
    o.name = o.unit ? 'Unit ' + o.unit : o.vin ? '…' + o.vin.slice(-8) : 'No VIN or unit';
    o.days = V.reduce((s, v) => s + v.days, 0);
    o.m = V.reduce((s, v) => ({ labor: s.labor + v.m.labor, parts: s.parts + v.m.parts, other: s.other + (v.m.other || 0), total: s.total + v.m.total }), { labor: 0, parts: 0, other: 0, total: 0 });
    o.q = V.reduce((s, v) => s + v.q, 0);
    o.mi = V.filter(v => v.mi).map(v => [v.a, v.mi, v]); o.hr = V.filter(v => v.hr).map(v => [v.a, v.hr, v]);
    o.lastMi = o.mi.length ? o.mi[o.mi.length - 1][1] : null; o.lastHr = o.hr.length ? o.hr[o.hr.length - 1][1] : null;
    repeats(o);
    o.hay = [o.vin, o.unit, o.cust, o.title, o.eng, o.esn].concat(V.map(v => String(v.r.roNumber || ''))).join(' ').toLowerCase();
    return o;
  }
  /* the same system, the same complaint or the same part back within 90 days — or an operation marked as a comeback */
  function repeats(o){
    const seen = {}, R = [], flag = {};
    o.V.forEach(v => {
      v.ops.forEach(op => {
        const c = String(op.complaint || ''), K = [], s = sysOf(c + ' ' + ((fixTxt(op) || [])[1] || ''));
        if(!routine(op)){
          if(s) K.push(['s:' + s, s]);
          try{ const f = fixKeyOf(c); if(f) K.push(['f:' + f, s || c]); }catch(e){}
          (op.parts || []).forEach(p => { const pn = String(p && p.partNumber || '').trim().toUpperCase(); if(pn.length >= 4 && !CONS.test(p.description || '')) K.push(['p:' + pn, p.description || pn]); });
          let hit = null;
          for(const [k, lb] of K){ const L = seen[k] || []; for(let i = L.length - 1; i >= 0; i--){ const e = L[i]; if(e.v === v) continue; const gap = (v.a - (e.v.b || e.v.a)) / DAY; if(gap >= -0.5 && gap <= 90){ hit = { lb, from: e, gap: Math.max(0, gap) }; break; } } if(hit) break; }
          /* one line per visit and system — a second operation on the same thing is marked, not listed again */
          const add = x => { flag[op.id] = x; if(!R.some(y => y.to === v && y.label === x.label)) R.push(x); };
          if(hit) add({ label: hit.lb, from: hit.from.v, fromOp: hit.from.op, to: v, op, days: Math.round(hit.gap) });
          else if(jtOf(op) === 'COMEBACK') add({ label: s || 'Comeback', from: null, fromOp: null, to: v, op, days: null });
        }
        K.forEach(([k]) => { (seen[k] = seen[k] || []).push({ v, op }); });
      });
    });
    o.reps = R; o.flag = flag;
  }
  function shown(all){
    const q = U.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let L = (all || trucks()).filter(t => (!U.cust || t.cust === U.cust) && (U.flt === 'all' || (U.flt === 'shop' ? t.open.length : t.reps.length)) && q.every(w => t.hay.indexOf(w) >= 0));
    const S = { last: (a, b) => b.lastAt - a.lastAt, visits: (a, b) => b.n - a.n || b.lastAt - a.lastAt, down: (a, b) => b.days - a.days || b.lastAt - a.lastAt,
      az: (a, b) => a.cust.localeCompare(b.cust) || String(a.unit).localeCompare(String(b.unit), undefined, { numeric: true }) || a.title.localeCompare(b.title) };
    return L.sort(S[U.sort] || S.last);
  }
  /* ---------- the page ---------- */
  function view(){
    const me0 = PG.me().name; if(U._me !== me0){ U._me = me0; U.sel = null; U.all = false; }
    const all = trucks(), L = shown(all);
    if(U.sel && !all.some(t => t.k === U.sel)) U.sel = null;
    if(!U.sel && !phone() && L.length) U.sel = L[0].k;
    const t = U.sel ? all.find(x => x.k === U.sel) : null;
    return `<div class="tg ast${t ? ' has-sel' : ''}" data-pg="assets">${head(all)}<div class="tg-body ast-b">${list(L, all)}<div class="tg-main">${t ? pane(t) : `<div class="ast-none">${all.length ? 'Pick a truck.' : 'No trucks yet — every truck on an RO shows up here.'}</div>`}</div></div></div>`;
  }
  function head(all){
    const inShop = all.filter(t => t.open.length).length, rep = all.filter(t => t.reps.length).length;
    const f = (k, n, w, warn) => n ? `<button class="tg-hf${warn ? ' w' : ''}${U.flt === k ? ' on' : ''}" data-a="hf" data-k="${k}" title="${U.flt === k ? 'Show every truck' : 'Show the trucks ' + esc(w)}"><b>${n}</b>${esc(w)}</button>` : '';
    const F = [`<span class="tg-hf" style="cursor:default"><b>${all.length}</b>${all.length === 1 ? 'truck' : 'trucks'}</span>`, f('shop', inShop, 'in the shop'), f('rep', rep, rep === 1 ? 'with a repeat repair' : 'with repeat repairs', true)].filter(Boolean);
    return `<header class="tg-head"><h1 class="tg-h1">Assets</h1><span class="tg-facts">${F.join('<i>·</i>')}</span>
      <span class="ast-hsp"></span>${psmBtn('assets', 'Find a truck')}</header>`;
  }
  function list(L, all){
    const C = {}; all.forEach(t => { if(t.cust) C[t.cust] = (C[t.cust] || 0) + 1; });
    const F = [['all', 'All', all.length], ['shop', 'In the shop', all.filter(t => t.open.length).length], ['rep', 'Repeat repairs', all.filter(t => t.reps.length).length]];
    const row = t => { const on = t.k === U.sel;
      return `<div class="tg-it ast-it${on ? ' on' : ''}${on && U.kb ? ' kb' : ''}" data-a="sel" data-k="${esc(t.k)}" role="button" tabindex="0" aria-pressed="${on}">${trkGi(t.r, ic('truck', 15))}
        <span class="tg-t"><b>${esc(t.name)}</b><span class="ast-mdl">${esc(t.title)}</span></span>
        <span class="tg-w">${esc(t.cust || '—')} · ${pl(t.n, 'visit')} · ${t.open.length ? 'in the shop' : 'last in ' + esc(md(t.lastAt))}</span>
        <span class="ast-r">${t.reps.length ? `<span class="ast-rf" title="${pl(t.reps.length, 'repeat repair')}">${ic('flag', 13)}${t.reps.length}</span>` : ''}${t.open.length ? (() => { let n = ''; try{ n = roStatus(t.open[0].r).status; }catch(e){} return pgSt('ro', n || 'Hold Tech', { iconOnly: 1, size: 13, cls: 'ast-in2', title: 'In the shop now · ' + pgStLabel('ro', n || 'Hold Tech') }); })() : ''}</span></div>`; };
    return `<section class="tg-list ast-list"><div class="tg-lh">Trucks<span class="n">${L.length}${L.length !== all.length ? ' of ' + all.length : ''}</span></div>
      <div class="ast-lh2"><div class="ast-chips">${F.map(x => `<button class="tg-chip${U.flt === x[0] ? ' on' : ''}" data-a="flt" data-v="${x[0]}">${x[1]}<small>${x[2]}</small></button>`).join('')}</div>
        <div class="ast-sels"><select class="ast-sel" data-ch="sort" aria-label="Sort the trucks">${[['last', 'Last in first'], ['visits', 'Most visits'], ['down', 'Most days down'], ['az', 'Customer A–Z']].map(o => `<option value="${o[0]}"${U.sort === o[0] ? ' selected' : ''}>${o[1]}</option>`).join('')}</select>
        <select class="ast-sel" data-ch="cust" aria-label="Customer"><option value="">Every customer</option>${Object.keys(C).sort((a, b) => a.localeCompare(b)).map(c => `<option value="${esc(c)}"${U.cust === c ? ' selected' : ''}>${esc(c)} · ${C[c]}</option>`).join('')}</select></div></div>
      <div class="tg-scroll ast-scroll">${L.map(row).join('') || `<div class="ast-none">${U.q || U.cust || U.flt !== 'all' ? 'No truck matches — <button class="link-btn" data-a="clr">show every truck</button>.' : 'No trucks yet.'}</div>`}</div>
      <div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span><span>${kbd('↵')}open the RO</span><span>${kbd('/')}find</span></div></section>`;
  }
  /* ---------- one truck ---------- */
  function spark(P, unit){
    if(P.length < 2) return `<div class="ast-sp0">${P.length ? 'One reading so far — the line starts at the next visit.' : 'No readings on its ROs.'}</div>`;
    const W = 300, H = 64, x0 = P[0][0], x1 = P[P.length - 1][0], ys = P.map(p => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys), sx = x1 > x0 ? (W - 12) / (x1 - x0) : 0, sy = y1 > y0 ? (H - 16) / (y1 - y0) : 0;
    const pt = p => [(6 + (p[0] - x0) * sx).toFixed(1), (H - 8 - (p[1] - y0) * sy).toFixed(1)];
    const d = P.map((p, i) => (i ? 'L' : 'M') + pt(p).join(' ')).join(' ');
    return `<svg class="ast-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(unit)} at each visit"><path class="ln" d="${d}" vector-effect="non-scaling-stroke"/>${P.map(p => { const [cx, cy] = pt(p); return `<circle class="dt" cx="${cx}" cy="${cy}" r="3"><title>${esc(md(p[0]))} · ${comma(p[1])} ${esc(unit)} · ${esc(roLabel(p[2].r))}</title></circle>`; }).join('')}</svg>`;
  }
  function rate(P, per){ if(P.length < 2) return ''; const d = (P[P.length - 1][0] - P[0][0]) / DAY, v = P[P.length - 1][1] - P[0][1]; if(d < 14 || v <= 0) return ''; return '≈ ' + comma(v / d * 30.4) + ' ' + per + ' a month'; }
  function pane(t){
    const r = t.r, O = t.open, fact = (l, v, cls) => `<div><small>${l}</small><span${cls ? ` class="${cls}"` : ''}>${v}</span></div>`;
    const lastTxt = O.length ? '<b class="ast-now">In the shop now</b>' : esc(md(t.lastAt)) + ' · ' + esc(ago(t.lastAt));
    let h = `<div class="ast-pane">${phone() ? `<button class="btn btn-sm tg-gh ast-back" data-a="back">${ic('chevL', 13)}Trucks</button>` : ''}
      <div class="tg-top">${trkHead(r)}<div class="r1"><span class="ast-cat">${ic('truck', 13)}Truck</span><span>${pl(t.n, 'visit')} · first in ${esc(MON[new Date(t.first).getMonth()])} ${new Date(t.first).getFullYear()}</span><span class="sp"></span>${O.map(v => `<button class="btn btn-sm ast-openb" data-a="ro" data-id="${esc(v.r.id)}" title="Open ${esc(roLabel(v.r))}">${esc(roLabel(v.r))}${ic('chevR', 12)}</button>`).join('')}</div>
        <h2>${esc(t.title)}</h2><div class="ast-sub">${esc(t.name)}${t.cust ? ' · ' + esc(t.cust) : ''}</div>
        <div class="ast-facts">${fact('VIN', t.vin ? esc(t.vin) : '<span class="mu">not on file</span>', 'mono')}${fact('Unit', esc(t.unit || '—'))}${fact('Customer', esc(t.cust || '—'))}${fact('Engine', esc(t.eng || '—'))}
          ${fact('Engine serial', t.esn ? esc(t.esn) : '<span class="mu">not on file</span>', t.esn ? 'mono' : '')}${fact('Miles', t.lastMi ? comma(t.lastMi) : '—')}${fact('Engine hours', t.lastHr ? comma(t.lastHr) : '—')}${fact('Last seen', lastTxt)}</div></div>
      <div class="ast-pad">`;
    /* lifetime totals */
    const tile = (l, v, s, tip) => `<div class="ast-tile"${tip ? ` title="${esc(tip)}"` : ''}><span class="l">${l}</span><span class="v">${v}</span><small>${s}</small></div>`;
    const span = Math.max(1, Math.round((Date.now() - t.first) / (DAY * 30.4)));
    h += `<div class="ast-sec">Lifetime<span>every visit in Parsec</span></div><div class="ast-tiles">
      ${tile('Visits', t.n, t.n === 1 ? 'the first one' : 'over ' + pl(span, 'month'))}
      ${tile('Days down', t.days < 10 ? Math.round(t.days * 10) / 10 : Math.round(t.days), t.n ? '≈ ' + dtxt(t.days / t.n).replace('same day', 'under a day') + ' a visit' : '', 'From the day each RO opened to the day it closed — open ROs count to now')}
      ${tile('Labor', money(t.m.labor), Math.round(t.q * 10) / 10 + ' h sold')}
      ${tile('Parts', money(t.m.parts), seeCost() ? money(t.m.total) + ' all in' : '')}</div>`;
    /* repeat repairs */
    if(t.reps.length) h += `<div class="ast-card"><div class="ast-ch">${ic('flag', 14)}<b>Repeat repairs</b><small>the same system or part back within 90 days</small></div><div class="ast-cb">${t.reps.slice().reverse().map(x => `<button class="ast-rp" data-a="ro" data-id="${esc(x.to.r.id)}" title="Open ${esc(roLabel(x.to.r))}"><span class="ast-rpi">${ic('flag', 13)}</span><span class="t"><b>${esc(x.label)} — ${x.from ? (x.days === 0 ? 'back the same day' : 'back in ' + pl(x.days, 'day')) : 'marked as a comeback'}</b>
        <small>${x.from ? `${esc(roLabel(x.from.r))} · ${esc(md(x.from.a))} · ${esc(x.fromOp.complaint || 'Operation')} → ` : ''}${esc(roLabel(x.to.r))} · ${esc(md(x.to.a))} · ${esc(x.op.complaint || 'Operation')}</small></span></button>`).join('')}</div></div>`;
    /* miles and engine hours */
    h += `<div class="ast-two"><div class="ast-card"><div class="ast-ch">${ic('gauge', 14)}<b>Miles</b><span class="sp"></span><small>${[t.lastMi ? comma(t.lastMi) + ' last visit' : '', rate(t.mi, 'mi')].filter(Boolean).join(' · ')}</small></div><div class="ast-cb">${spark(t.mi, 'mi')}</div></div>
      <div class="ast-card"><div class="ast-ch">${ic('engine', 14)}<b>Engine hours</b><span class="sp"></span><small>${[t.lastHr ? comma(t.lastHr) + ' last visit' : '', rate(t.hr, 'h')].filter(Boolean).join(' · ')}</small></div><div class="ast-cb">${spark(t.hr, 'h')}</div></div></div>`;
    /* every visit, newest first */
    const V = t.V.slice().reverse(), max = U.all ? V.length : 12;
    h += `<div class="ast-card"><div class="ast-ch">${ic('history', 14)}<b>Every visit</b><small>${pl(t.n, 'RO')} · newest first · click one to open it</small></div><div class="ast-vs">${V.slice(0, max).map(v => vrow(t, v)).join('')}</div>
      ${V.length > max ? `<button class="ast-more" data-a="all">Show all ${V.length} visits</button>` : U.all && V.length > 12 ? `<button class="ast-more" data-a="all">Show the last 12</button>` : ''}</div>`;
    return h + '</div></div>';
  }
  function vrow(t, v){
    const r = v.r, st = (() => { try{ const s0 = roStatus(r); return pgSt('ro', s0.status, { cls: 'sm', sub: s0.sub ? '· ' + s0.sub : '' }); }catch(e){ return ''; } })();   /* Parsec 14: the status as on every page */
    const opSt = op => { if(!v.open) return ''; try{ const s0 = opStatus(op), n = typeof s0 === 'string' ? s0 : s0 && s0.status; return n ? pgSt('ro', n, { cls: 'sm', size: 12 }) : ''; }catch(e){ return ''; } };
    const meta = [v.mi ? comma(v.mi) + ' mi' : '', v.hr ? comma(v.hr) + ' h' : ''].filter(Boolean).join(' · ');
    const ops = v.ops.map(op => { const jt = jtOf(op), x = t.flag[op.id], fx = fixTxt(op), P = (op.parts || []).filter(Boolean);
      return `<div class="ast-op"><span class="ast-jt jt-${esc(jt)}">${esc(typeof jobTypeLabel === 'function' ? jobTypeLabel(jt) : jt)}</span><span class="t"><b>${esc(op.complaint || 'Operation')}</b>${opSt(op)}${x ? `<span class="ast-rpc" title="${esc(x.from ? 'Back ' + (x.days === 0 ? 'the same day' : 'in ' + pl(x.days, 'day')) + ' after ' + roLabel(x.from.r) : 'Marked as a comeback')}">${ic('flag', 11)}Repeat${x.from ? ' · ' + x.days + ' d' : ''}</span>` : ''}
        ${fx ? `<small class="fx">${esc(fx[0])}: ${esc(fx[1])}</small>` : ''}${P.length ? `<small class="pts">${P.map(p => `${esc(p.description || 'Part')}${(+p.qty || 1) !== 1 ? ' ×' + esc(String(p.qty)) : ''}${p.partNumber ? ` <span class="mono">${esc(p.partNumber)}</span>` : ''}`).join(' · ')}</small>` : ''}</span></div>`; }).join('');
    return `<div class="ast-v${v.open ? ' open' : ''}" data-a="ro" data-id="${esc(r.id)}" role="button" tabindex="0" title="Open ${esc(roLabel(r))}">
      <div class="ast-vd"><b>${esc(md(v.a))}</b><small>${new Date(v.a).getFullYear()}</small><small class="dn">${v.open ? 'in the shop' : dtxt(v.days) + (v.days >= 1 ? ' down' : '')}</small></div>
      <div class="ast-vb"><div class="ast-vh"><span class="tg-no">${esc(roLabel(r))}</span><span class="ast-st">${st}</span>${meta ? `<span class="ast-mu">${meta}</span>` : ''}<span class="sp"></span>${v.techs.length ? `<span class="ast-mu" title="${esc(v.techs.join(', '))}">${esc(v.techs.map(n => PG.first(n)).join(', '))}</span>` : ''}${seeCost() && v.m.total ? `<span class="ast-amt" title="Labor ${esc(money(v.m.labor))} · parts ${esc(money(v.m.parts))}">${esc(money(v.m.total))}</span>` : ''}</div>
        <div class="ast-ops">${ops || '<span class="ast-mu">No operations on it.</span>'}</div></div></div>`;
  }
  /* ---------- clicks, keys, search ---------- */
  const go = () => { const p = document.querySelector('[data-pg="assets"] .ast-pane'); if(p) p.scrollTop = 0; };
  const openOf = t => (t.open[0] || t.last).r;
  const H = {
    sel: tt => { U.sel = tt.dataset.k; U.kb = false; U.all = false; rd(); go(); },
    back: () => { U.sel = null; rd(); },
    flt: tt => { U.flt = tt.dataset.v; rd(); },
    hf: tt => { U.flt = U.flt === tt.dataset.k ? 'all' : tt.dataset.k; rd(); },
    clr: () => { U.q = ''; U.cust = ''; U.flt = 'all'; rd(); },
    all: () => { U.all = !U.all; rd(); },
    ro: tt => { const id = tt.dataset.id; if(id) PG.openRo(id); }
  };
  function change(tt){ const c = tt.dataset.ch; if(c === 'sort'){ U.sort = tt.value; rd(); } else if(c === 'cust'){ U.cust = tt.value; rd(); } }
  function keydown(ev){ const k = ev.key; if(ev.ctrlKey || ev.metaKey || ev.altKey || PG.typing(ev)) return;
    const stop = () => { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); };
    if(k === 'j' || k === 'k' || k === 'ArrowDown' || k === 'ArrowUp'){ const L = shown(); if(!L.length) return; const i = L.findIndex(t => t.k === U.sel); U.sel = L[Math.max(0, Math.min(L.length - 1, (i < 0 ? -1 : i) + (k === 'j' || k === 'ArrowDown' ? 1 : -1)))].k; U.kb = true; U.all = false; rd(); go();
      requestAnimationFrame(() => { const e = document.querySelector('[data-pg="assets"] .ast-it.on'); if(e && e.scrollIntoView) e.scrollIntoView({ block: 'nearest' }); }); return stop(); }
    if(k === 'Enter'){ const t = U.sel && trucks().find(x => x.k === U.sel); if(t){ PG.openRo(openOf(t).id); return stop(); } }
    if(k === '/'){ psmOpen('assets'); return stop(); }
    if(k === 'Escape' && phone() && U.sel){ U.sel = null; rd(); return stop(); } }
  const hits = q => { const w = String(q || '').trim().toLowerCase().split(/\s+/).filter(Boolean); return trucks().filter(t => w.every(x => t.hay.indexOf(x) >= 0)).sort((a, b) => b.lastAt - a.lastAt); };
  psmReg('assets', () => ({ title: 'Find a truck', page: 'truck', placeholder: 'VIN, unit, customer, model, engine serial, RO…',
    get: () => U.q, set: q => { U.q = q; rd(); },
    count: q => ({ n: hits(q).length, of: trucks().length }),
    items: q => q ? hits(q).slice(0, 8).map(t => ({ id: t.k, title: t.name + ' · ' + t.title, sub: [t.cust, t.vin ? 'VIN …' + t.vin.slice(-8) : 'no VIN', pl(t.n, 'visit'), t.open.length ? 'in the shop' : ''].filter(Boolean).join(' · ') })) : [],
    pick: it => { U.sel = it.id; U.all = false; } }));
  PG.reg('assets', { H, U: () => U, change, keydown });
  /* from an RO: this truck's history on the Assets page */
  function openFor(ro){ const t = ro && trucks().find(x => x.V.some(v => v.r.id === ro.id)); if(t){ U.sel = t.k; U.q = ''; U.cust = ''; U.flt = 'all'; U.all = false; } UI.view = 'assets'; UI.modal = null; try{ persistUI(); }catch(e){}
    if(typeof tecRender === 'function') tecRender(); else render(); try{ window.scrollTo(0, 0); }catch(e){} }
  return { view, U: () => U, trucks, openFor };
})();
function asTrucks(){ return ASPG.trucks(); }
function asOpenFor(ro){ ASPG.openFor(ro); }
function viewAssets(){ if(!navAllowed('assets')) return '<div class="tg ast" data-pg="assets"><div class="ast-none" style="padding:40px">The Assets page isn’t on for you — the Admin can turn it on.</div></div>'; return ASPG.view(); }
