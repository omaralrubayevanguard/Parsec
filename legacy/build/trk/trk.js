/* The truck in the RO — mock-up. A picture of the truck wherever the RO number and customer show. */
const IMG = __IMG__, IC = __ICO__, LOGO = __LOGO__;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const ic = n => IC[n] ? `<svg class="rt-ic" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>` : '';
function si(k) { const ring = '<circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" stroke-width="1.5"/>', dash = '<circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.3 1.82"/><circle cx="7" cy="7" r="1.75" fill="currentColor"/>';
  const B = { hold: ring, working: ring + '<path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor"/>', parts: dash, customer: dash, qc: dash };
  return `<svg class="rt-si" data-s="${k}" viewBox="0 0 14 14" aria-hidden="true">${B[k] || ring}</svg>`; }
/* no picture for this model yet: a plain outline of a truck (sleeper or day cab), never a brand */
const SIL = `<svg viewBox="0 0 200 92" aria-hidden="true"><g fill="currentColor"><path d="M14 66V52q0-6 6-7l30-3 8-16q2-4 7-4h24v44z" opacity=".55"/><path d="M89 22h42q4 0 4 4v40H89z" opacity=".4"/><rect x="135" y="60" width="56" height="6" rx="2" opacity=".5"/><rect x="146" y="54" width="22" height="6" rx="2" opacity=".45"/><rect x="92" y="58" width="30" height="10" rx="5" opacity=".35"/></g><g fill="none" stroke="currentColor" stroke-width="5" opacity=".6"><circle cx="38" cy="74" r="10"/><circle cx="152" cy="74" r="10"/><circle cx="177" cy="74" r="10"/></g></svg>`;
const T = [
  { no: '37742', cust: 'Summit Freightways', ymm: '2019 Volvo VNL 760', unit: 'T-762', vin: '…KN159798', mi: '573,000 mi', img: 'white', st: ['working', 'Working', 'Repairing'], pill: 'In progress', tech: 'MR', techN: 'Mike Rodriguez', bay: 'B3', prom: 'Today 3:00 PM', adv: 'Jenna Cho', comp: 'Air leak at the dryer – diagnose', days: '2d', shot: 'Oct 23, 7:42' },
  { no: '37761', cust: 'Summit Freightways', ymm: '2021 Volvo VNL 860', unit: '4502', vin: '…MN224517', mi: '312,400 mi', img: 'gray', st: ['parts', 'Waiting', 'Parts'], pill: 'Waiting · Parts', tech: 'DK', techN: 'Dana Kowalski', bay: 'B5', prom: 'Tomorrow 10:00 AM', adv: 'Jenna Cho', comp: 'EGR cooler leaking – replace', days: '3d', shot: 'Oct 22, 8:05' },
  { no: '37768', cust: 'Coastal Beverage', ymm: '2022 Volvo VNR 300', unit: '31', vin: '…NN301122', mi: '128,900 mi', img: 'blue', st: ['working', 'Working', 'Repairing'], pill: 'In progress', tech: 'LM', techN: 'Luis Martinez', bay: 'B1', prom: 'Today 1:00 PM', adv: 'Derek Washington', comp: 'Front brake shoes & drums', days: '1d', shot: 'Oct 24, 6:58' },
  { no: '37750', cust: 'Hartley Produce', ymm: '2018 Volvo VNR 300', unit: '12', vin: '…JN884410', mi: '402,100 mi', img: 'red', st: ['customer', 'Waiting', 'Approval'], pill: 'Waiting · Approval', tech: 'PS', techN: 'Priya Shah', bay: 'B7', prom: 'Today 4:30 PM', adv: 'Jenna Cho', comp: 'A/C not cooling – compressor clutch', days: '4d', shot: 'Oct 21, 9:12' },
  { no: '37802', cust: 'Granite State Express', ymm: '2015 Mack Pinnacle', unit: '208', vin: '…FM557301', mi: '688,000 mi', img: null, st: ['hold', 'Hold Tech', ''], pill: 'To assign', tech: '—', techN: '', bay: '—', prom: 'Tue 12:00 PM', adv: 'Derek Washington', comp: 'Coolant leak at water pump', days: '1d', shot: '' },
  { no: '37811', cust: 'Riverbend Freight', ymm: '2020 Volvo VNL 760', unit: '77', vin: '…LN771203', mi: '455,700 mi', img: 'white', st: ['qc', 'Road test', ''], pill: 'Quality check', tech: 'DK', techN: 'Dana Kowalski', bay: 'B2', prom: 'Today 11:30 AM', adv: 'Derek Washington', comp: 'Wheel seal leaking – drive axle', days: '2d', shot: 'Oct 23, 10:20' }
];
let S = { lay: 'A', pic: 'model' };
try { Object.assign(S, JSON.parse(localStorage.getItem('rt-mock') || '{}')); } catch (e) {}
function pic(t, opt = {}) {
  if (!t.img) return `<span class="rt-pic none">${SIL}<span class="cap">No picture for this model yet</span></span>`;
  const src = IMG['side_' + t.img];
  if (S.pic === 'photo' && !opt.model) return `<span class="rt-pic photo"><span class="cap">Check-in photo · ${t.shot}</span><img src="${src}" alt="${t.ymm}"></span>`;
  return `<span class="rt-pic model"><img src="${src}" alt="${t.ymm}"></span>`;
}
const status = t => `<span class="rt-st">${si(t.st[0])}${t.st[1]}${t.st[2] ? `<small>· ${t.st[2]}</small>` : ''}${ic('chevD')}</span>`;
const rail = on => `<div class="rt-rail"><div class="lg">${LOGO}Parsec</div><div class="it">${ic('search')}Search</div><div class="it">${ic('inbox')}Inbox<em>20</em></div><div class="it">${ic('console')}Console</div><div class="it">${ic('triage')}Triage</div><div class="it${on === 'ros' ? ' on' : ''}">${ic('ros')}RO List<em>20</em></div>
  <div class="gh">Shop</div><div class="it${on === 'fm' ? ' on' : ''}">${ic('foreman')}Foreman</div><div class="it">${ic('warranty')}Warranty</div><div class="it">${ic('manager')}Manager</div><div class="it">${ic('parts')}Parts</div><div class="gh">You</div><div class="it">${ic('timelog')}Time Log</div><div class="it">${ic('fixes')}Fixes</div></div>`;
function idLine(t) { return `<div class="rt-id">RO-${t.no} <span>· Opened Oct ${23 - parseInt(t.days)} · ${t.days.replace('d', '')} days open</span></div>`; }
function titleBlock(t) { return `${idLine(t)}<h1 class="rt-name">${t.cust}</h1><div class="rt-ymm">${t.ymm} · Unit ${t.unit} · VIN ${t.vin} · ${t.mi}</div><div class="rt-chips">${status(t)}<span>with</span><span class="rt-av">${t.tech}</span><span style="color:var(--ink-2)">${t.techN}</span></div>`; }
const facts = t => `<div class="rt-facts"><div><small>Advisor</small><b>${t.adv}</b></div><div><small>Promised</small><b>${t.prom}</b></div><div><small>Bay</small><b>${t.bay}</b></div><div><small>Technician</small><b><span class="rt-av">${t.tech}</span>${t.techN.split(' ')[0]}</b></div></div>`;
const stage = () => `<div class="rt-stage"><div class="h"><b>Repair</b>stage 5 of 7 · on it now · 47m<span class="sp"></span>Ready about today 3:00 PM</div><div class="bars"><i class="d"></i><i class="d"></i><i class="d"></i><i class="d"></i><i class="n"></i><i></i><i></i></div><div class="lb"><span>Check-in</span><span>Diag</span><span>Approval</span><span>Parts</span><span class="n">Repair</span><span>Road test</span><span>Close-out</span></div></div>`;
const ops = t => `<div class="rt-ops"><h3>Operations <small style="font-weight:400;color:var(--ink-3)">2</small></h3><div class="rt-op">${si(t.st[0])}<b>1</b>${t.comp}<span class="sp"></span><span class="m">0.93 / 1.50 h</span><span class="rt-av">${t.tech}</span></div><div class="rt-op">${si('hold')}<b>2</b>PM-A service<span class="sp"></span><span class="m">0.00 / 1.20 h</span><span class="rt-av">${t.tech}</span></div></div>`;
function side(t, withPic) {
  return `<div class="rt-side">${withPic ? `<div class="rt-sidepic">${pic(t)}<small>${t.ymm}${t.img ? ' · ' + ({ white: 'white', gray: 'gray', blue: 'blue', red: 'red' })[t.img] : ''}</small></div>` : ''}
    <div class="rt-next"><b>Next</b><p>Keep going: Op 1 — ${t.comp}.</p></div>
    <div class="rt-kvh">Schedule</div><div class="rt-kv"><span>Ready about</span><b>${t.prom}</b><span>Days open</span><b>${t.days.replace('d', '')}</b></div>
    <div class="rt-kvh">People</div><div class="rt-kv"><span>Technician</span><b>${t.techN || '—'}</b><span>Advisor</span><b>${t.adv}</b></div>
    <div class="rt-kvh">Vehicle</div><div class="rt-kv"><span>VIN</span><b>${t.vin}</b><span>Unit</span><b>${t.unit}</b><span>Mileage</span><b>${t.mi}</b></div></div>`;
}
function roWin(t) {
  let main = '';
  if (S.lay === 'A') main = `<div class="rt-hA">${pic(t)}<div>${titleBlock(t)}</div></div>${facts(t)}${stage()}${ops(t)}`;
  else if (S.lay === 'B') main = `<div class="rt-band"><div class="tx">${titleBlock(t)}</div><div class="pic" style="width:330px">${pic(t)}</div></div>${facts(t)}${stage()}${ops(t)}`;
  else main = `${titleBlock(t)}${stage()}${ops(t)}`;
  return `<div class="rt-win">${rail('ros')}<div class="rt-panel"><div class="rt-crumb">RO list <span>/</span> <b>RO-${t.no}</b><span class="sp"></span><span class="tot"><span>${ic('clock')} <b>0.93</b> / 2.70 h</span><span>${ic('parts')} <b>2</b> / 2</span><span>${ic('clip')} <b>3</b></span></span></div>
    <div class="rt-page"><div class="rt-main">${main}</div>${side(t, S.lay === 'C')}</div></div></div>`;
}
function roList() {
  return `<div class="rt-list"><div class="rt-lh"><span>RO</span><span></span><span>Customer · truck</span><span>Complaint</span><span>Tech</span><span>Bay</span><span>Status</span><span>Promised</span></div>
    ${T.map(t => `<div class="rt-lr"><span class="no">${t.no}</span>${pic(t)}<span class="cu"><b>${t.cust}</b><small>${t.ymm} · Unit ${t.unit}</small></span><span class="cmp">${t.comp}</span><span>${t.tech === '—' ? '—' : `<span class="rt-av">${t.tech}</span>`}</span><span>${t.bay}</span><span><span class="rt-pill ${t.st[0]}">${t.pill}</span></span><span style="color:var(--ink-2)">${t.prom}</span></div>`).join('')}</div>`;
}
function foreman() {
  const bay = (tag, t, col) => t && t.img ? `<div class="rt-bay"><span class="tg">${tag}</span><span class="who"><i style="background:${col}"></i>${t.tech}</span><img src="${IMG['top_' + t.img]}" alt=""><span class="ro">${t.no}</span></div>`
    : t ? `<div class="rt-bay"><span class="tg">${tag}</span><span class="who">${t.tech}</span><span class="shape"></span><span class="ro">${t.no}</span></div>` : `<div class="rt-bay free"><span class="tg">${tag}</span><span class="fill">+ Fill this bay</span></div>`;
  const by = n => T.find(t => t.bay === n);
  const na = [[T[3], 'Waiting on you · 13 d', 'Decide', 1], [T[5], 'Road test passed · Dana', 'QC'], [T[4], 'Approved · parts in hand', 'Bring in'], [T[1], 'Parts due 10/27', 'Chase']];
  return `<div class="rt-fm"><div class="rt-na"><h4>Needs action <small style="font-weight:400;color:var(--ink-3)">10</small></h4>${na.map(x => `<div class="rt-ni${x[3] ? ' on' : ''}">${pic(x[0])}<b>${x[0].no} · ${x[0].cust}</b><span class="bt">${x[2]}</span><small>${x[1]}</small></div>`).join('')}</div>
    <div class="rt-floor"><h4>Bays <small>6 of 8 in use · the truck in each one, from above</small></h4><div class="rt-bays">${['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'].map((b, i) => bay(b, by(b), ['#3A8C60', '#6C69C8', '#3A8C60', '', '#AD7210', '', '#2F8795', ''][i])).join('')}</div></div></div>`;
}
function phones() {
  const t = T[0];
  const tabs = on => `<div class="tabs">${[['console', 'Console'], ['ros', 'ROs'], ['inbox', 'Inbox'], ['fixes', 'Fixes'], ['more', 'More']].map(x => `<span class="${x[0] === on ? 'on' : ''}">${ic(x[0])}${x[1]}</span>`).join('')}</div>`;
  const ro = `<div class="rt-dev"><div class="rt-ph"><div class="sb"></div><div class="isl"></div><div class="bd"><div class="crumb">${ic('chevL')}RO list / <b>RO-${t.no}</b></div><div class="hero">${pic(t)}</div><div style="margin-top:10px">${idLine(t)}<h1 class="rt-name">${t.cust}</h1><div class="rt-ymm">${t.ymm} · Unit ${t.unit}</div><div class="rt-chips">${status(t)}</div></div>${facts(t)}${stage()}</div>${tabs('ros')}</div></div>`;
  const list = `<div class="rt-dev"><div class="rt-ph"><div class="sb"></div><div class="isl"></div><div class="bd"><h1>Repair orders</h1><div style="font-size:13px;color:var(--ink-3);margin-bottom:6px">20 open · 8 waiting</div>${T.map(x => `<div class="pr">${pic(x)}<span class="l1">${x.no}</span><span class="d">${x.days}</span><span class="l2">${x.cust}</span><span class="l3">${x.ymm} · ${x.comp}</span></div>`).join('')}</div>${tabs('ros')}</div></div>`;
  return `<div class="rt-phones">${ro}${list}</div>`;
}
function draw() {
  $('#s1').innerHTML = roWin(T[0]);
  $('#s1b').innerHTML = roWin(T[4]);
  $('#s2').innerHTML = roList();
  $('#s3').innerHTML = foreman();
  $('#s4').innerHTML = phones();
  $$('[data-lay]').forEach(b => b.classList.toggle('is-on', b.dataset.lay === S.lay));
  $$('[data-pic]').forEach(b => b.classList.toggle('is-on', b.dataset.pic === S.pic));
  try { localStorage.setItem('rt-mock', JSON.stringify(S)); } catch (e) {}
}
$$('[data-lay]').forEach(b => b.addEventListener('click', () => { S.lay = b.dataset.lay; draw(); }));
$$('[data-pic]').forEach(b => b.addEventListener('click', () => { S.pic = b.dataset.pic; draw(); }));
$$('[data-theme-set]').forEach(b => b.addEventListener('click', () => { document.documentElement.dataset.theme = b.dataset.themeSet; $$('[data-theme-set]').forEach(x => x.classList.toggle('is-on', x === b)); }));
draw();
