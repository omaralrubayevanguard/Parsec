/* Parsec · phone view of the whole site — mock-up. One file, one set of data; Appearance › Screen switches it. */
const IC = __ICO__, LOGO = __LOGO__;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ic = (n, s) => IC[n] ? `<svg class="ph-ic" viewBox="0 0 24 24"${s ? ` style="width:${s}px;height:${s}px"` : ''} aria-hidden="true">${IC[n]}</svg>` : '';
function si(k) { const ring = '<circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" stroke-width="1.5"/>';
  const dash = '<circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.3 1.82"/><circle cx="7" cy="7" r="1.75" fill="currentColor"/>';
  const B = { hold: ring, working: ring + '<path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor"/>', parts: dash, foreman: dash, support: dash, customer: dash, problem: dash,
    done: '<circle cx="7" cy="7" r="6" fill="currentColor"/><path d="M4.4 7.2l1.8 1.8 3.5-3.7" fill="none" stroke="var(--panel)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' };
  return `<svg class="ph-si" data-s="${k}" viewBox="0 0 14 14" aria-hidden="true">${B[k] || ring}</svg>`; }
const av = n => `<span class="mv-av">${n}</span>`;
const pill = (t, c, s) => `<span class="ph-pill${c ? ' ' + c : ''}">${s ? si(s) : ''}${t}</span>`;
const type = (t, c) => `<span class="ph-type ${c || ''}"><i></i>${t}</span>`;
let NAV = 'A';

/* the pages a role keeps at the bottom (option A); everything else is under More */
const TABS = {
  Technician: [['console', 'console', 'Today'], ['ros', 'ros', 'ROs'], ['inbox', 'inbox', 'Inbox', 3], ['fixes', 'fixes', 'Fixes']],
  Manager: [['manager', 'manager', 'Manager'], ['rolist', 'ros', 'ROs'], ['inbox', 'inbox', 'Inbox', 5], ['timelog', 'timelog', 'Time']],
  Foreman: [['foreman', 'foreman', 'Floor'], ['rolist', 'ros', 'ROs'], ['inbox', 'inbox', 'Inbox', 4], ['timelog', 'timelog', 'Time']],
  'Service writer': [['triage', 'triage', 'Triage'], ['rolist', 'ros', 'ROs'], ['inbox', 'inbox', 'Inbox', 2], ['warranty', 'warranty', 'Warranty']],
  Triage: [['triage', 'triage', 'Triage'], ['rolist', 'ros', 'ROs'], ['inbox', 'inbox', 'Inbox', 2], ['foreman', 'foreman', 'Floor']],
  Parts: [['parts', 'parts', 'Parts'], ['rolist', 'ros', 'ROs'], ['inbox', 'inbox', 'Inbox', 6], ['fixes', 'fixes', 'Fixes']],
  'Warranty admin': [['warranty', 'warranty', 'Warranty'], ['rolist', 'ros', 'ROs'], ['inbox', 'inbox', 'Inbox', 1], ['parts', 'parts', 'Parts']]
};
const ALL = [['', [['console', 'Console'], ['triage', 'Triage'], ['rolist', 'RO list'], ['ros', 'Repair Orders']]], ['Shop', [['foreman', 'Foreman'], ['warranty', 'Warranty'], ['manager', 'Manager'], ['parts', 'Parts']]],
  ['You', [['timelog', 'Time Log'], ['fixes', 'Fixes'], ['career', 'Career'], ['inbox', 'Inbox']]]];
const ME = { Technician: ['MR', 'Mike Rodriguez'], Manager: ['TB', 'Tom Brandt'], Foreman: ['FD', 'Frank Delaney'], 'Service writer': ['JC', 'Jenna Cho'], Triage: ['SA', 'Sofia Alvarez'], Parts: ['BO', 'Ben Okafor'], 'Warranty admin': ['CR', 'Carla Reyes'] };

function sb() { return `<div class="ph-sb"><span>9:41</span><span><svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg><svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="16" height="8" rx="1.6"/><rect x="22.6" y="4" width="1.6" height="4" rx=".8" opacity=".4"/></svg></span></div><div class="ph-isl"></div>`; }
function head(S) { const me = ME[S.role];
  if (NAV === 'B') return `<div class="mv-bar">${S.back ? `<span class="ph-back" style="height:36px;font-size:15px">${ic('chevL')}${S.back}</span>` : `<span class="mv-ib">${ic('list', 22)}</span>`}<b>${S.back ? '' : S.title}</b>${S.search === false ? '' : `<span class="mv-ib">${ic('search')}</span>`}<span class="ph-av" style="width:30px;height:30px;font-size:11px">${me[0]}</span></div>`;
  return '';
}
function titleA(S) { if (NAV === 'B' || S.noTitle) return S.subB || ''; const me = ME[S.role];
  return `<div class="mv-hd">${S.back ? `<span class="ph-back" style="height:36px">${ic('chevL')}${S.back}</span><span class="sp"></span>` : `<h1>${S.title}</h1><span class="sp"></span>`}${S.search === false ? '' : `<span class="mv-ib">${ic('search')}</span>`}<span class="ph-av">${me[0]}</span></div>${S.sub ? `<p class="mv-sub">${S.sub}</p>` : ''}`; }
function tabs(S) { if (NAV === 'B') return ''; const T = TABS[S.role];
  return `<div class="ph-foot tabs"><div class="ph-tabs mv-tabs">${T.map(t => `<button class="${S.tab === t[0] ? 'on' : ''}"><span class="w">${ic(t[1])}${t[3] ? `<em>${t[3]}</em>` : ''}</span>${t[2]}</button>`).join('')}<button class="${S.tab === 'more' ? 'on' : ''}"><span class="w">${ic('grid')}</span>More</button></div></div>`; }
function phone(S) {
  let h = sb() + head(S) + `<div class="ph-main">${titleA(S)}${S.body()}</div>`;
  h += S.foot ? `<div class="ph-foot">${S.foot()}</div>` : tabs(S);
  if (S.menu) h += NAV === 'A' ? moreSheet(S) : drawer(S);
  return h + '<div class="ph-home"></div>';
}
function moreSheet(S) { const ok = { console: 0, triage: 1, rolist: 1, ros: 1, foreman: 1, warranty: 1, manager: 1, parts: 1, timelog: 1, fixes: 1, career: 0, inbox: 1 };
  return `<div class="ph-scrim"></div><div class="ph-sheet"><div class="ph-grab"></div><h3>Every page you can open</h3><p class="sub">The bottom bar keeps your four; the rest are here. Same pages as the computer.</p>
    <div class="mv-more">${ALL.flatMap(g => g[1]).map(p => `<span class="${ok[p[0]] ? '' : 'lock'}">${ic(p[0] === 'rolist' ? 'list' : p[0])}${p[1]}</span>`).join('')}</div>
    <div class="ph-opt" style="margin-top:12px">${ic('gear')}<b>Your data, Appearance, Shortcuts</b><small>From your initials, top right</small></div></div>`; }
function drawer(S) { const me = ME[S.role], on = 'manager';
  return `<div class="ph-scrim"></div><div class="mv-drawer"><div class="me"><span class="ph-av">${me[0]}</span><span><b>${me[1]}</b><small>${S.role} · on the clock 0:55</small></span></div>
    ${ALL.map(g => (g[0] ? `<div class="g">${g[0]}</div>` : '') + g[1].map(p => `<div class="it${p[0] === on ? ' on' : ''}">${ic(p[0] === 'rolist' ? 'list' : p[0])}${p[1]}${p[0] === 'inbox' ? '<em>5</em>' : p[0] === 'rolist' ? '<em>20</em>' : ''}</div>`).join('')).join('')}
    <div class="g">Account</div><div class="it">${ic('gear')}Settings</div><div class="it">${ic('exit')}Sign out</div></div>`; }

/* ---------- the screens ---------- */
const P = [];
P.push({ cap: ['Turn it on', 'Your initials › Appearance › Screen'], role: 'Manager', title: 'Appearance', back: 'You', search: false, tab: 'more', body: () => `
  <h1 class="ph-h1" style="margin-top:4px">Appearance</h1>
  <div class="mv-set"><h4>Screen</h4><p>Pick how this device shows Parsec. Same file, same data — only the layout changes.</p>
    <div class="mv-seg3"><span>${ic('spark')}Automatic</span><span>${ic('tv')}Computer</span><span class="on">${ic('phone')}Phone</span></div>
    <p style="margin-top:10px">Automatic: phone-size screens get the phone view, everything else the computer view. Saved on this device only.</p></div>
  <div class="mv-set"><h4>Look</h4><div class="ph-chipr"><span class="ph-chip on">Ivory</span><span class="ph-chip">Graphite</span><span class="ph-chip">Like the device</span></div>
    <div class="mv-tog"><span>Bigger tap targets</span><i class="on"></i></div><div class="mv-tog"><span>Keep the screen on while a clock runs</span><i></i></div></div>
  <div class="mv-note2">${ic('info', 14)} The computer view stays one tap away: <b>Screen › Computer</b>, or turn the phone sideways on a tablet.</div>` });
P.push({ cap: ['Every page', 'A: More at the bottom · B: the menu button'], role: 'Manager', title: 'Manager', tab: 'more', menu: true, body: () => mgrBody() });
P.push({ cap: ['Console', 'Technician — the day, your order, the shop'], role: 'Technician', title: 'Today', tab: 'console', sub: 'Sunday, October 25', body: () => `
  <div class="ph-card ph-clk" style="margin-top:10px"><div class="r1"><span class="ph-dot live"></span><span class="t"><b>On the clock · 6:12</b><small>On 37742 · in at 6:58</small></span><span class="ph-btn sm">Clock out</span></div>
    <div class="ph-strip"><i class="j" style="left:8%;width:30%"></i><i class="a" style="left:38%;width:6%"></i><i class="j" style="left:44%;width:16%"></i><i class="n" style="left:60%"></i></div><div class="ph-ax"><span>6a</span><span>9a</span><span>12p</span><span>3p</span><span>6p</span></div>
    <div class="ph-stats"><div><small>On jobs</small><b>5:31<em>89%</em></b></div><div><small>Air</small><b>0:41</b></div><div><small>Efficiency</small><b class="g">112%</b></div></div></div>
  <div class="ph-note"><span class="ph-av">FD</span><div><b>Frank · 6:40</b><p>37761 after the dryer. Volvo wants the old cooler tagged.</p></div></div>
  <div class="mv-sec">On it now</div>
  <div class="ph-now"><div class="ph-job"><span class="l1"><span class="ph-no">37742</span><span class="cu">Summit Freightways</span></span><span class="l2">Air leak at the dryer – diagnose</span><span class="l3"><span class="ph-bar"><i style="width:62%"></i></span>0.93 / 1.50 h${type('DIAG', 'diag')}</span><span class="go on">${ic('stop')}</span></div></div>
  <div class="mv-sec">Next<small>3</small></div>
  <div class="ph-job"><span class="l1"><span class="ph-no">37761</span><span class="cu">Summit Freightways</span></span><span class="l2">EGR cooler leaking – replace</span><span class="l3">0.00 / 3.60 h${type('WARR', 'war')}${pill('Parts staged', 'g')}</span><span class="go">${ic('play')}</span></div>
  <div class="ph-job"><span class="l1"><span class="ph-no">37768</span><span class="cu">Coastal Beverage</span></span><span class="l2">Front brake shoes &amp; drums</span><span class="l3">0.42 / 2.80 h${type('OP')}${pill('Paused', 'a')}</span><span class="go">${ic('play')}</span></div>` });
P.push({ cap: ['Inbox', 'What needs you — answer it right there'], role: 'Manager', title: 'Inbox', tab: 'inbox', body: () => `
  <div class="ph-tabs2"><button class="on">For you 5</button><button>Waiting on others</button><button>Done</button></div>
  ${[['FD', 'Frank Delaney', '7:52', 'Approve overtime for Luis — 37802 comeback.', 'Due before 3 pm.', ['Approve', 'Not today']], ['', 'Parsec', '7:30', 'Productivity under 85% 6 workdays in a row.', 'Air time is the gap — 41 min a tech a day.', ['See it', 'Mute a week']],
     ['JC', 'Jenna Cho', '7:04', 'Prairie Line wants a call on 33281 — approval pending 3 days.', '', ['Call', 'Done']], ['CR', 'Carla Reyes', 'Fri', 'Volvo paid short on 36102 — $214 under.', 'Write off or appeal?', ['Open', 'Later']]]
    .map(m => `<div class="ph-msg"><span class="ph-av${m[0] ? '' : ' sys'}">${m[0] || ic('inbox', 16)}</span><span class="h"><b>${m[1]}</b><span>· ${m[2]}</span><span class="sp"></span><i></i></span><p>${m[3]}</p>${m[4] ? `<p style="font-size:13.5px;color:var(--ink-3)">${m[4]}</p>` : ''}<span class="a"><button class="ph-btn sm pri">${m[5][0]}</button><button class="ph-btn sm">${m[5][1]}</button></span></div>`).join('')}` });
P.push({ cap: ['RO list', 'Open ROs as rows; tap one to open it'], role: 'Service writer', title: 'ROs', tab: 'rolist', body: () => `
  <label class="ph-search" style="margin-top:6px">${ic('search')}<span>RO, customer, unit, VIN</span></label>
  <div class="mv-chips"><span class="on">Open <small>20</small></span><span>Mine <small>6</small></span><span>Working <small>5</small></span><span>Waiting <small>7</small></span><span>Hold <small>4</small></span><span>Done today <small>3</small></span></div>
  ${[['37742', 'Summit Freightways', 'Air leak at the dryer', 'working', 'Working', 'MR', 'Bay 3', '2 d'], ['33281', 'Prairie Line Trucking', 'A/C not cooling', 'customer', 'Waiting · Approval', 'PS', 'Lot B4', '3 d'],
     ['34690', 'Summit Freightways', 'Clutch slipping', 'parts', 'Waiting · Parts', 'LM', 'Bay 6', '5 d'], ['31927', 'Rick’s Freight LLC', 'Road test after PM', 'done', 'Road test', 'DK', 'D1', '1 d'], ['35738', 'Harbor Point Drayage', 'Air dryer cartridge', 'hold', 'Hold Tech', '—', 'Lot D2', '6 d'], ['38450', 'Evergreen Moving', 'Wheel seal – drive axle', 'working', 'Working', 'DK', 'Bay 1', '1 d']]
    .map(r => `<div class="mv-row"><span class="l1"><span class="ph-no">${r[0]}</span>${r[1]}</span><span class="l2">${r[2]}</span><span class="l3">${pill(r[4], r[3] === 'parts' ? 'w' : r[3] === 'done' ? 'g' : '', r[3])}<span>${r[6]}</span></span><span class="r"><span style="font-size:12px;color:var(--ink-3)">${r[7]}</span>${r[5] === '—' ? '<span class="mv-av" style="opacity:.4">—</span>' : av(r[5])}</span></div>`).join('')}` });
P.push({ cap: ['An RO', 'The whole RO, top to bottom; actions stay at the thumb'], role: 'Technician', title: 'RO 37742', back: 'ROs', tab: 'ros', subB: '', body: () => `
  <div class="mv-roh"><div class="mv-sub">Summit Freightways · 2019 Volvo VNL 760 · #T-762</div><div class="ph-chips">${pill('Working', '', 'working')}${type('DIAG', 'diag')}${pill('Promised Tue 3 pm')}</div><h2 class="t">Air leak at the dryer</h2></div>
  <div class="mv-kv2"><div><small>Key tag · location</small><b>K-18 · Bay 3</b></div><div><small>Mileage</small><b>573,000 mi</b></div><div><small>Advisor</small><b>Jenna Cho</b></div><div><small>Ready about</small><b>Mon 1:20 pm</b></div></div>
  <div class="ph-seg"><button class="on">Ops<small>2</small></button><button>Parts<small>2</small></button><button>Time<small>4</small></button><button>Notes<small>3</small></button><button>Files<small>2</small></button></div>
  <div class="mv-op"><span class="l1">Op 1 · ${type('DIAG', 'diag')}</span><span class="l2">Air leak at the dryer – diagnose</span><span class="l3"><span class="ph-bar"><i style="width:62%"></i></span>0.93 / 1.50 h · Mike</span><span class="go on">${ic('stop')}</span></div>
  <div class="mv-op"><span class="l1">Op 2 · ${type('PM', 'pm')}</span><span class="l2">PM-A service</span><span class="l3"><span class="ph-bar"><i style="width:0"></i></span>0.00 / 1.20 h · not started</span><span class="go">${ic('play')}</span></div>
  <div class="mv-sec">Checklist<small>3 of 5</small></div><div class="ph-bul"><i class="d"></i><i class="d"></i><i class="d"></i><i></i><i></i></div><div class="ph-bull"><span>Dash pic · Pictures · DTCs</span><span>Report · Road test</span></div>`,
  foot: () => `<div class="mv-act"><span class="ph-btn ic">${ic('camera')}</span><span class="ph-btn ic">${ic('note')}</span><span class="ph-btn">${ic('swap', 18)}Status</span><span class="ph-btn acc">${ic('stop', 18)}Stop</span></div>` });
P.push({ cap: ['Triage', 'Needs action, one tap each'], role: 'Service writer', title: 'Triage', tab: 'triage', body: () => `
  <div class="mv-chips"><span class="on">Needs action <small>9</small></span><span>Desk <small>14</small></span><span>Yard <small>22</small></span><span>Check in <small>2</small></span></div>
  <div class="mv-sec">Waiting on customers<small>2</small></div>
  ${[['33281', 'Prairie Line Trucking', 'Approval pending 3 d · $1,840', 'Follow up'], ['36158', 'Granite State Express', 'Call back about the quote', 'Call']].map(r => `<div class="mv-row"><span class="l1"><span class="ph-no">${r[0]}</span>${r[1]}</span><span class="l3" style="font-size:13px">${r[2]}</span><span class="r"><span class="ph-btn sm">${r[3]}</span></span></div>`).join('')}
  <div class="mv-sec">Ready to go<small>4</small></div>
  ${[['31927', 'Rick’s Freight LLC', 'Road test done · D1'], ['38450', 'Evergreen Moving', 'Road test done · E6'], ['38601', 'Tri-County Waste', 'Road test done · E8']].map(r => `<div class="mv-row"><span class="l1"><span class="ph-no">${r[0]}</span>${r[1]}</span><span class="l3" style="font-size:13px">${r[2]}</span><span class="r"><span class="ph-btn sm pri">Release</span></span></div>`).join('')}
  <div class="mv-sec">Check in<small>2</small></div><div class="mv-row"><span class="l1"><span class="ph-no">New</span>Coastal Beverage · unit 31</span><span class="l3" style="font-size:13px">Booked 8:30 · brakes grabbing</span><span class="r"><span class="ph-btn sm">Check in</span></span></div>` });
P.push({ cap: ['Foreman', 'Who’s on what, and what needs you'], role: 'Foreman', title: 'Floor', tab: 'foreman', body: () => `
  <div class="mv-chips"><span class="on">Needs action <small>10</small></span><span>Techs <small>4</small></span><span>Floor</span><span>QC <small>4</small></span></div>
  <div class="mv-sec">Techs<span class="sp"></span><span class="lk">Assign</span></div>
  ${[['MR', 'Mike Rodriguez', 'On 37742 · air leak at the dryer', '0:56', 'live'], ['DK', 'Dana Kowalski', 'On 38450 · wheel seal', '2:10', 'live'], ['LM', 'Luis Martinez', 'Free 14 min — next: 34690', '0:14', 'air'], ['PS', 'Priya Shah', 'Lunch since 11:30', '—', 'out']]
    .map(t => `<div class="mv-tech">${av(t[0])}<b>${t[1]}</b><small>${t[2]}</small><span class="t">${t[3]}<small>${t[4] === 'live' ? 'on it' : t[4] === 'air' ? 'air' : 'off'}</small></span></div>`).join('')}
  <div class="mv-sec">Waiting on you<small>3</small></div>
  ${[['32484', 'Red Mesa Hauling', 'Tech asked: replace or reseal the cooler?', 'Decide'], ['31927', 'Rick’s Freight LLC', 'QC before release — road test passed', 'QC']].map(r => `<div class="mv-row"><span class="l1"><span class="ph-no">${r[0]}</span>${r[1]}</span><span class="l3" style="font-size:13px">${r[2]}</span><span class="r"><span class="ph-btn sm pri">${r[3]}</span></span></div>`).join('')}` });
function mgrBody() { return `
  <div class="mv-chips" style="margin-top:6px"><span class="on">Overview</span><span>KPIs</span><span>Fleets</span><span>Flow</span><span>Team</span><span>Activity</span></div>
  <div class="ph-warn" style="margin-top:12px">${ic('flag')}<span><b>Productivity under 85%</b> 6 workdays — air is the gap.</span><span class="ph-btn sm">See it</span></div>
  <div class="mv-sec">October pace<small>where the month lands</small></div>
  <div class="mv-tiles"><div class="mv-tile"><small>Total sales</small><b>$170k</b><div class="mv-pace"><i style="width:78%"></i><b style="left:72%"></b></div><em class="g">$40.4k over goal</em></div>
    <div class="mv-tile"><small>Hours sold</small><b>413 h</b><div class="mv-pace"><i style="width:66%"></i><b style="left:70%"></b></div><em class="r">13 h under</em></div>
    <div class="mv-tile"><small>Efficiency</small><b>114%</b><em class="g">goal 100%</em></div><div class="mv-tile"><small>ROs closed</small><b>79</b><em>on pace · goal 80</em></div></div>
  <div class="mv-sec">Hours, last 14 workdays</div><div class="mv-bars">${[62, 70, 55, 80, 74, 68, 77, 59, 72, 81, 66, 70, 75, 48].map((v, i) => `<i${i === 13 ? ' class="t"' : ''} style="height:${v}%"></i>`).join('')}</div><div class="mv-ax"><span>10/6</span><span>10/13</span><span>10/20</span><span>today</span></div>`; }
P.push({ cap: ['Manager', 'The tabs scroll sideways; tiles two across'], role: 'Manager', title: 'Manager', tab: 'manager', body: () => mgrBody() });
P.push({ cap: ['Time Log', 'The shop’s day, one line per tech'], role: 'Manager', title: 'Time Log', tab: 'timelog', body: () => `
  <div class="ph-seg" style="margin-top:8px"><button class="on">Day</button><button>Week</button><button>Timesheet</button></div>
  <div class="mv-sec">Sunday, Oct 25<span class="sp"></span><span class="lk">${ic('chevL', 14)} ${ic('chevR', 14)}</span></div>
  <div class="mv-tl">${[['MR', 'Mike Rodriguez', '6:12', [[8, 30, 'j'], [38, 6, 'a'], [44, 16, 'j']]], ['DK', 'Dana Kowalski', '7:40', [[6, 20, 'j'], [26, 8, 'l'], [34, 30, 'j']]], ['LM', 'Luis Martinez', '5:05', [[12, 14, 'j'], [26, 12, 'a'], [38, 20, 'j']]], ['PS', 'Priya Shah', '4:30', [[10, 26, 'j'], [36, 8, 'l']]]]
    .map(t => `<div class="r">${av(t[0])}<b>${t[1]}</b><span class="h">${t[2]}</span><span class="st">${t[3].map(x => `<i class="${x[2]}" style="left:${x[0]}%;width:${x[1]}%"></i>`).join('')}<i class="n" style="left:60%"></i></span></div>`).join('')}</div>
  <div class="mv-leg"><span><i style="background:#96621f"></i>On a job</span><span><i style="background:#2a9d8f"></i>Air</span><span><i style="background:var(--ink-4)"></i>Lunch</span></div>
  <div class="ph-warn" style="margin-top:14px">${ic('flag')}<span><b>Luis · 48 min of air</b> 9:40 – 10:28 with no job.</span><span class="ph-btn sm">Fix</span></div>
  <div class="mv-note2">Tap a line to fix a punch: drag an edge, or type the times.</div>` });
P.push({ cap: ['Parts', 'To order, arrived, staged — one tap each'], role: 'Parts', title: 'Parts', tab: 'parts', body: () => `
  <div class="mv-chips"><span class="on">To do <small>8</small></span><span>On order <small>12</small></span><span>Check in</span><span>Bins</span><span>Returns <small>3</small></span></div>
  <div class="mv-sec">To order<small>1</small></div><div class="mv-row"><span class="l1"><span class="ph-no">33281</span>Prairie Line Trucking</span><span class="l2">Clutch kit 15.5in</span><span class="l3">21521736 · qty 1</span><span class="r"><span class="ph-btn sm pri">Order</span></span></div>
  <div class="mv-sec">Late<small>1</small></div><div class="mv-row"><span class="l1"><span class="ph-no">35738</span>Harbor Point Drayage</span><span class="l2">Air dryer cartridge</span><span class="l3">${pill('Backordered', 'w', 'problem')} due 10/27</span><span class="r"><span class="ph-btn sm">Chase</span></span></div>
  <div class="mv-sec">Arrived<small>6</small></div>
  ${[['34690', 'Summit Freightways', 'Clutch kit 15.5in', 'checked in 10/20'], ['35872', 'Granite State Express', 'Oil filter', 'checked in 10/23'], ['39413', 'Copperline Transport', 'Turbo actuator', 'checked in 10/21']].map(r => `<div class="mv-row"><span class="l1"><span class="ph-no">${r[0]}</span>${r[1]}</span><span class="l2">${r[2]}</span><span class="l3">${r[3]}</span><span class="r"><span class="ph-btn sm">Stage it</span></span></div>`).join('')}` });
P.push({ cap: ['Warranty', 'Claims by what they need next'], role: 'Warranty admin', title: 'Warranty', tab: 'warranty', body: () => `
  <div class="mv-chips"><span class="on">Needs action <small>7</small></span><span>Claims</span><span>Board</span><span>Money</span><span>Parts</span></div>
  <div class="mv-tiles"><div class="mv-tile"><small>Claimed, not paid</small><b>$18.4k</b><em>11 claims</em></div><div class="mv-tile"><small>Paid this month</small><b>$22.1k</b><em class="r">$214 short</em></div></div>
  <div class="mv-sec">Ready to file<small>2</small></div>
  ${[['37761', 'Summit Freightways', 'EGR cooler · SRT 3.6 h · packet complete', 'File'], ['36540', 'Evergreen Moving', 'Wheel seal · needs the failed part photo', 'Ask tech']].map(r => `<div class="mv-row"><span class="l1"><span class="ph-no">${r[0]}</span>${r[1]}</span><span class="l3" style="font-size:13px">${r[2]}</span><span class="r"><span class="ph-btn sm${r[3] === 'File' ? ' pri' : ''}">${r[3]}</span></span></div>`).join('')}
  <div class="mv-sec">Paid short<small>1</small></div><div class="mv-row"><span class="l1"><span class="ph-no">36102</span>Hartley Produce</span><span class="l3" style="font-size:13px">$214 under the claim · Volvo note: labor over SRT</span><span class="r"><span class="ph-btn sm">Decide</span></span></div>` });

/* ---------- the board ---------- */
const board = $('.ph-board');
function draw() { board.innerHTML = P.map((S, i) => `<figure class="ph-fig"><figcaption><i>${i + 1}</i>${S.cap[0]}<small>${S.cap[1]}</small></figcaption><div class="ph-dev"><div class="ph">${phone(S)}</div></div></figure>`).join(''); }
draw();
function setTheme(v) { document.documentElement.dataset.theme = v; $$('[data-theme-set]').forEach(x => x.classList.toggle('is-on', x.dataset.themeSet === v)); }
$$('[data-theme-set]').forEach(b => b.addEventListener('click', () => setTheme(b.dataset.themeSet)));
$$('[data-nav]').forEach(b => b.addEventListener('click', () => { NAV = b.dataset.nav; $$('[data-nav]').forEach(x => x.classList.toggle('is-on', x === b)); draw(); }));
