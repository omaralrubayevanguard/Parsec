/* Parsec · access/admin-page · admin-page.js
   The Admin page: people (role, pages, actions per person), roles, sign-in rules, the sign-in log, the add-a-person pop; H() handles its clicks.
   Flow: view() draws from staffList() and the permission tables; changes go through permSet / permRoleSet and audit.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   people tag guard act view head vPeople whoBar sw adminPane vRoles vRules … (19 functions, 15 constants)
   uses       access/ data/ kit/ pages/ pages/foreman/ pages/rolist/ pages/triage/ ro/ settings/ shell/ state/
*/
  const ic = n => (PG.ic(n, 15) || (typeof TG_IC !== 'undefined' && TG_IC[n] ? '<svg class="tg-ic" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">' + TG_IC[n] + '</svg>' : ''));
  const ics = (n, s) => PG.ic(n, s) || ic(n);
  const esc = PG.e;
  const U = { view: 'people', q: '', sel: null, ptab: 'pages', pop: null, lf: 'all', an: '', ar: 'Technician', ap1: '', ap2: '', _me: null };
  const rd = () => { try{ PG.keepScroll(render); }catch(e){ render(); } };
  const phone = () => document.documentElement.getAttribute('data-device') === 'phone';
  const meId = () => viewAsId();
  const isSelf = sf => !!(sf && meId() && sf.id === meId());
  const deptOrder = () => (typeof DEPT_OF !== 'undefined' && DEPT_OF ? Object.keys(DEPT_OF) : []);   /* DEPT_OF is set later in the file */
  
  function people(){
    const L = staffList().filter(sf => sf && sf.name);
    const DO = deptOrder(), ord = sf => { const i = DO.indexOf(sf.role); return (sf.off ? 100 : 0) + (i < 0 ? 50 : i); };
    return L.slice().sort((a, b) => ord(a) - ord(b) || String(a.name).localeCompare(String(b.name)));
  }
  const byId = id => staffList().find(sf => sf.id === id) || null;
  function tag(sf){ if(sf.off) return ['Sign-in off', 'off']; if(!pinIs(sf)) return ['No PIN yet', 'w']; if(sf.pinTemp) return ['Temporary PIN', 'w']; return null; }
  const when = t => { try{ return PG.whenL(t); }catch(e){ return ''; } };
  const day = t => { try{ return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }catch(e){ return ''; } };
  function guard(){ return permOk('a.people'); }
  function act(label, fn, msg){ if(!guard()) return false; pushUndo(label); const r = fn(); scheduleSave(true); if(msg) pushToast(msg, true); rd(); return r; }
  /* ---------- the page ---------- */
  function view(){
    const me0 = viewAsId() || 'admin'; if(U._me !== me0){ U._me = me0; U.pop = null; if(U.view === 'people' && U.sel && U.sel !== '__admin' && !byId(U.sel)) U.sel = null; }
    if(U.sel && U.sel !== '__admin' && !byId(U.sel)) U.sel = null;
    if(!U.sel && !phone() && U.view === 'people'){ const P = people(); U.sel = P.length ? P[0].id : '__admin'; }
    const v = U.view, body = v === 'roles' ? vRoles() : v === 'rules' ? vRules() : v === 'log' ? vLog() : vPeople();
    return `<div class="tg adm${U.sel && v === 'people' ? ' has-sel' : ''}" data-pg="admin">${head()}<div class="tg-body adm-b v-${v}"><div class="tg-main">${body}</div>${pop()}</div></div>`;
  }
  function head(){
    const P = people(), ch = P.filter(sf => permChangedN(sf)).length, tmp = P.filter(sf => !sf.off && (sf.pinTemp || !pinIs(sf))).length, off = P.filter(sf => sf.off).length;
    const f = (n, t, w) => n ? `<span class="tg-hf${w ? ' w' : ''}" style="cursor:default"><b>${n}</b>${t}</span><i>·</i>` : '';
    const vs = [['people', 'users', 'People'], ['roles', 'grid', 'Roles'], ['rules', 'lock', 'Sign-in rules'], ['log', 'history', 'Sign-in log']];
    return `<header class="tg-head"><h1 class="tg-h1">Admin</h1><span class="tg-facts">${f(P.filter(sf => !sf.off).length, 'people')}${f(ch, 'with changes')}${f(tmp, 'still to pick a PIN', true)}${f(off, 'sign-in off')}</span>
      <div class="tg-views">${vs.map((x, i) => `<button class="${U.view === x[0] ? 'on' : ''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i + 1})">${ic(x[1])}<span class="adm-vl">${x[2]}</span></button>`).join('')}</div><span class="tg-hsep"></span>
      ${psmBtn('admin', 'Find a person')}<button class="btn btn-sm btn-primary adm-addb" data-a="pop" data-p="add" title="Add a person — they get a temporary PIN">${ics('plus', 13)}<span>Add a person</span></button></header>`;
  }
  /* ---------- people ---------- */
  function vPeople(){
    const q = U.q.trim().toLowerCase(), P = people().filter(sf => !q || String(sf.name).toLowerCase().indexOf(q) >= 0 || String(sf.role).toLowerCase().indexOf(q) >= 0);
    const row = sf => { const t = tag(sf), n = permChangedN(sf);
      return `<button class="adm-pr${U.sel === sf.id ? ' on' : ''}${sf.off ? ' off' : ''}" data-a="sel" data-id="${sf.id}" aria-pressed="${U.sel === sf.id}">${staffAvHtml(sf, 'adm-av', 'adm')}<span class="adm-pn"><b>${esc(sf.name)}</b><small>${esc(sf.role)}${n ? ' · ' + n + ' changed' : ''}${isSelf(sf) ? ' · you' : ''}</small></span>${t ? `<span class="adm-tg ${t[1]}">${t[0]}</span>` : ''}</button>`; };
    const adm = `<button class="adm-pr${U.sel === '__admin' ? ' on' : ''}" data-a="sel" data-id="__admin" aria-pressed="${U.sel === '__admin'}"><span class="adm-av adm-shield">${ics('shield', 16)}</span><span class="adm-pn"><b>Admin</b><small>Every page — always</small></span>${adminPinIs() ? '' : '<span class="adm-tg w">No PIN yet</span>'}</button>`;
    const list = `<nav class="adm-list" aria-label="People">${P.map(row).join('') || '<div class="adm-none">No one by that name.</div>'}<div class="adm-sep"></div>${adm}</nav>`;
    const sf = U.sel && U.sel !== '__admin' ? byId(U.sel) : null;
    const pane = `<section class="adm-pane">${phone() && U.sel ? `<button class="btn btn-sm tg-gh adm-back" data-a="back0">${ics('chevL', 13)}People</button>` : ''}${whoBar()}${U.sel === '__admin' ? adminPane() : sf ? personPane(sf) : '<div class="adm-none">Pick a person.</div>'}</section>`;
    return `<div class="adm-wrap">${list}${pane}</div>`;
  }
  function whoBar(){ const L = permAdmins().map(sf => sf.name); return `<div class="adm-bar">${ic('shield')}<span>Anyone given “Manage people and PINs” opens this page — today: the Admin${L.length ? ', ' + esc(L.join(', ')) : ''}</span></div>`; }
  function sw(on, label, attrs, chg, dis, sub){ return `<button class="adm-sw" ${attrs} aria-pressed="${!!on}"${dis ? ' disabled' : ''}><i></i><span>${label}${sub ? `<small>${sub}</small>` : ''}</span>${chg ? '<em>changed</em>' : ''}</button>`; }
  /* personPane(sf) — one person’s page — is in person-page.js (17.3) */
  function adminPane(){
    const amAdmin = !viewAsId();
    let h = `<div class="adm-ph"><span class="adm-av xl adm-shield">${ics('shield', 26)}</span><span class="adm-pt"><b>Admin</b><small>Every page and every action — always</small></span></div>`;
    h += `<div class="adm-card"><h5>${ic('lock')}Admin PIN</h5>${sgLinkHtml('people', 'people.adminPin', 'The Admin PIN')}</div>`;   /* Parsec 16.2 */
    h += `<div class="adm-card"><h5>${ic('shield')}What the Admin can do</h5><p class="adm-mu" style="margin:0">Everything, on every page — it can’t be changed. Give someone “Manage people and PINs” to share this page with them.</p></div>`;
    return h;
  }
  /* ---------- roles ---------- */
  function vRoles(){
    return `<div class="adm-full">${sgLinkHtml('people', 'people.roles', 'What each role can do')}</div>`;   /* Parsec 16.2 */
    const R = permRoles(), cnt = r => staffList().filter(sf => sf.role === r && !sf.off).length;
    const rows = [['Pages', PERM_PAGES.map(p => ['pages', p[0], p[1]])]].concat(PERM_ACTS.map(g => [g[0], g[1].map(a => ['acts', a[0], a[1]])]));
    return `<div class="adm-full"><div class="adm-card adm-mxw"><table class="adm-mx"><thead><tr><th></th>${R.map(r => `<th>${esc(r)}<small>${cnt(r)}</small></th>`).join('')}<th>Admin<small>always</small></th></tr></thead><tbody>`
      + rows.map(g => `<tr class="gr"><td colspan="${R.length + 2}">${esc(g[0])}</td></tr>` + g[1].map(x => `<tr><td>${esc(x[2])}</td>${R.map(r => { const on = !!(permRole(r)[x[0]] || {})[x[1]];
        return `<td><button class="adm-ck" data-a="rx" data-r="${esc(r)}" data-kind="${x[0]}" data-k="${x[1]}" aria-pressed="${on}" aria-label="${esc(r)}: ${esc(x[2])}"></button></td>`; }).join('')}<td><span class="adm-ck dis" aria-pressed="true"></span></td></tr>`).join('')).join('')
      + `</tbody></table></div><p class="adm-mu adm-mxn">Changing a role changes everyone in it, except what was changed for one person.</p></div>`;
  }
  /* ---------- sign-in rules ---------- */
  function vRules(){
    return `<div class="adm-full">${sgLinkHtml('people', 'people.idle', 'The sign-in rules — locking when nobody’s touched it, signing everyone out at the end of the day')}</div>`;   /* Parsec 16.2 */
    const R = permRules(), idle = +R.idle || 0, end = (() => { try{ const h = fmCfg().end; const hh = Math.floor(h), mm = Math.round((h - hh) * 60); return (hh % 12 || 12) + ':' + String(mm).padStart(2, '0') + (hh < 12 ? ' am' : ' pm'); }catch(e){ return 'the end of the day'; } })();
    const card = (icn, t, body) => `<div class="adm-card"><h5>${ic(icn)}${t}</h5>${body}</div>`;
    return `<div class="adm-full"><div class="adm-rules">`
      + card('lock', 'Showing it’s you', `<p class="adm-big">A 4-digit PIN for everyone</p><p class="adm-mu">Kept scrambled in the file, never as typed. The Admin has one too.</p>`)
      + card('x', 'A wrong PIN', `<p class="adm-big">5 tries, then a minute’s wait</p><p class="adm-mu">Each wrong try goes in the sign-in log.</p>`)
      + card('moon', 'When nobody’s touched it', `<select class="adm-sel" data-ch="idle" aria-label="When nobody’s touched it">${[[0, 'Never'], [15, 'Lock after 15 minutes'], [30, 'Lock after 30 minutes'], [60, 'Lock after an hour']].map(o => `<option value="${o[0]}"${idle === o[0] ? ' selected' : ''}>${o[1]}</option>`).join('')}</select><p class="adm-mu">Locked, the page stays where it was — the person’s PIN brings them back.</p>`)
      + card('clock', 'End of the shop day', sw(R.eod !== false, `Sign everyone out at ${esc(end)}`, 'data-a="eod"', false, false, 'Running clocks keep running'))
      + card('userPlus', 'A new person', `<p class="adm-big">A temporary PIN they change at their first sign-in</p><p class="adm-mu">The same after a reset.</p>`)
      + card('users', 'Who can open Admin', `<p class="adm-big">Anyone given “Manage people and PINs”</p><p class="adm-mu">Today: the Admin${permAdmins().length ? ', ' + esc(permAdmins().map(sf => sf.name).join(', ')) : ''}.</p>`)
      + `</div></div>`;
  }
  /* ---------- sign-in log ---------- */
  const LOGT = { signin: 'in', switch: 'in', unlock: 'in', signout: 'out', lock: 'out', pinfail: 'bad', perm: 'ch', staff: 'ch', pin: 'ch' };
  function vLog(){
    const F = [['all', 'All'], ['in', 'Sign-ins'], ['bad', 'Wrong PINs'], ['ch', 'Changes']];
    const L = auditLog().filter(a => LOGT[a.type] && (U.lf === 'all' || LOGT[a.type] === U.lf || (U.lf === 'in' && LOGT[a.type] === 'out'))).slice(-300).reverse();
    const days = []; L.forEach(a => { const d = new Date(a.at).toDateString(); if(days.indexOf(d) < 0) days.push(d); });
    const sfOf = n => staffList().find(sf => sf.name === n) || null;
    const tagOf = a => { const k = LOGT[a.type]; return k === 'bad' ? ['Wrong PIN', 'bad'] : k === 'in' ? ['Sign-in', 'ok'] : k === 'out' ? ['Sign-out', ''] : ['Change', 'ch']; };
    const row = a => { const sf = sfOf(a.by), t = tagOf(a), d = new Date(a.at); return `<div class="adm-lr"><time>${(d.getHours() % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0') + (d.getHours() < 12 ? ' am' : ' pm')}</time>${sf ? staffAvHtml(sf, 'adm-av sm', 'adm') : `<span class="adm-av sm adm-shield">${ics('shield', 12)}</span>`}<span class="adm-lx"><b>${esc(a.by || 'Admin')}</b> · ${esc(a.text || '')}</span><span class="adm-tg ${t[1]}">${t[0]}</span></div>`; };
    const dl = d => { const t = new Date(), y = new Date(); y.setDate(t.getDate() - 1); return d === t.toDateString() ? 'Today' : d === y.toDateString() ? 'Yesterday' : new Date(d).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }); };
    return `<div class="adm-full"><div class="adm-lf">${F.map(x => `<button class="tg-chip${U.lf === x[0] ? ' on' : ''}" data-a="lf" data-v="${x[0]}">${x[1]}</button>`).join('')}</div><div class="adm-card adm-log">${days.map(d => `<div class="adm-ld">${dl(d)}</div>` + L.filter(a => new Date(a.at).toDateString() === d).map(row).join('')).join('') || '<div class="adm-none">Nothing yet — sign-ins, wrong PINs and changes to people show up here.</div>'}</div></div>`;
  }
  /* ---------- the add-a-person pop ---------- */
  function pop(){ const p = U.pop; if(!p) return '';
    if(p.type === 'add') return `<div class="tg-pop xf adm-pop"><div class="tg-ph"><b>Add a person</b><span class="cu">they get a temporary PIN</span><button class="btn btn-sm ib" data-a="popx">${ics('x', 14)}</button></div>
      <div class="adm-form"><label>Name<input data-in="an" placeholder="First and last name" autocomplete="off" value="${esc(U.an)}"></label><label>Role<select class="adm-sel" data-ch="ar">${permRoles().map(r => `<option${r === U.ar ? ' selected' : ''}>${esc(r)}</option>`).join('')}</select></label>
      <small class="adm-mu">The role fills in their pages and what they can do — change any of it after.</small></div>
      <div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm btn-primary" data-a="addgo">${ics('plus', 13)}Add</button></div></div>`;
    return ''; }
  /* ---------- handlers ---------- */
  const H = {
    view: t => { U.view = t.dataset.v; U.pop = null; rd(); },
    sel: t => { U.sel = t.dataset.id; U.pop = null; U.ap1 = U.ap2 = ''; rd(); const p = document.querySelector('[data-pg="admin"] .adm-pane'); if(p) p.scrollTop = 0; },
    ptab: t => { U.ptab = t.dataset.v; rd(); },
    a3: t => { const sf = byId(t.dataset.id); if(!sf || isSelf(sf) || !guard()) return; ppAct3(sf, t.dataset.k, t.dataset.v); },
    back0: () => { U.sel = null; rd(); },
    lf: t => { U.lf = t.dataset.v; rd(); },
    popx: () => { U.pop = null; rd(); },
    pop: t => { if(!guard()) return; U.pop = { type: t.dataset.p }; U.an = ''; PG.anchor(U, t); rd(); setTimeout(() => { const i = document.querySelector('[data-pg="admin"] .tg-pop [data-in="an"]'); if(i) i.focus(); }, 20); },
    addgo: () => { const nm = String(U.an || '').trim().replace(/\s+/g, ' '), role = U.ar || 'Technician';
      if(!nm){ pushToast('Type their name.'); return; }
      if(staffList().some(x => techSame(x.name, nm))){ pushToast(nm + ' is already on the team.'); return; }
      const r = act('add a person', () => admAddPerson(nm, role), null); if(!r) return;
      U.pop = null; U.sel = r.sf.id; U.view = 'people'; rd(); admPinShow(r.sf, r.pin, true); },
    reset: t => { const sf = byId(t.dataset.id); if(!sf) return; let pin = null; act('reset PIN', () => { pin = admResetPin(sf); }, null); if(pin) admPinShow(sf, pin, false); },
    off: t => { const sf = byId(t.dataset.id); if(!sf) return; if(isSelf(sf)){ pushToast('You can’t turn off your own sign-in.'); return; }
      const off = !sf.off; act(off ? 'turn off sign-in' : 'turn sign-in on', () => admSetOff(sf, off), off ? admFirst(sf.name) + ' can’t sign in now — their punches, notes and ROs keep their name.' : admFirst(sf.name) + ' can sign in again.'); },
    pg: t => { const sf = byId(t.dataset.id), k = t.dataset.k; if(!sf || isSelf(sf)) return; const v = !permHas(sf, 'pages', k);
      act('page for one person', () => permSet(sf, 'pages', k, v), admFirst(sf.name) + (v ? ' can open ' : ' can’t open ') + permPageLabel(k) + ' now.'); },
    act: t => { const sf = byId(t.dataset.id), k = t.dataset.k; if(!sf || isSelf(sf)) return; const v = !permHas(sf, 'acts', k);
      act('action for one person', () => permSet(sf, 'acts', k, v), admFirst(sf.name) + (v ? ' can now ' : ' can’t ') + (PERM_VERB[k] || permActLabel(k).toLowerCase()) + (v ? '.' : ' any more.')); },
    back: t => { const sf = byId(t.dataset.id); if(!sf || isSelf(sf)) return; act('back to the role', () => permBack(sf), admFirst(sf.name) + ' is back to the ' + sf.role + ' role.'); },
    rx: t => { const r = t.dataset.r, kind = t.dataset.kind, k = t.dataset.k, v = !(permRole(r)[kind] || {})[k];
      act('role', () => permRoleSet(r, kind, k, v), r + ': ' + (kind === 'pages' ? permPageLabel(k) + ' page' : permActLabel(k)) + (v ? ' — on for everyone in the role.' : ' — off for everyone in the role.')); },
    eod: () => { const R = permRules(); act('sign-in rule', () => { R.eod = R.eod === false; }, R.eod === false ? 'Everyone is signed out at the end of the shop day.' : 'No one is signed out at the end of the day.'); },
    apin: () => { if(viewAsId()){ pushToast('Only the Admin changes the Admin PIN.'); return; }
      const a = String(U.ap1 || ''), b = String(U.ap2 || ''); if(!pinValid(a)){ pushToast('The Admin PIN is 4 digits.'); return; } if(a !== b){ pushToast('The two PINs don’t match.'); return; }
      U.ap1 = U.ap2 = ''; act('admin PIN', () => { adminPinSet(a); try{ audit('pin', 'Changed the Admin PIN'); }catch(e){} }, 'Admin PIN set — Parsec keeps it scrambled.'); }
  };
  function input(t){ const d = t.dataset.in;
    if(d === 'q'){ U.q = t.value; const pos = t.selectionStart; rd(); const i = document.querySelector('[data-pg="admin"] [data-in="q"]'); if(i){ i.focus(); try{ i.setSelectionRange(pos, pos); }catch(e){} } return; }
    if(d === 'an'){ U.an = t.value; return; }
    if(d === 'ap1' || d === 'ap2'){ U[d] = t.value.replace(/\D/g, '').slice(0, 4); if(t.value !== U[d]) t.value = U[d]; return; } }
  function change(t){ const c = t.dataset.ch;
    if(c === 'ar'){ U.ar = t.value; return; }
    if(c === 'role'){ const sf = byId(t.dataset.id), r = t.value; if(!sf || isSelf(sf) || r === sf.role || !guard()) return; ppRoleAsk(sf, r); return; }   /* 17.3: says first what the new role adds and takes away */
    if(c === 'idle'){ const v = +t.value || 0, R = permRules(); act('sign-in rule', () => { R.idle = v; }, v ? 'Parsec locks after ' + (v === 60 ? 'an hour' : v + ' minutes') + ' with no one on it.' : 'Parsec doesn’t lock by itself.'); return; } }
  function fieldKey(t, ev){ const k = ev.key, d = t.dataset.in;
    if(k === 'Escape'){ if(U.pop){ U.pop = null; rd(); ev.preventDefault(); return true; } if(d === 'q' && U.q){ U.q = ''; rd(); ev.preventDefault(); return true; } return false; }
    if(k === 'Enter' && d === 'an'){ ev.preventDefault(); H.addgo(); return true; }
    if(k === 'Enter' && (d === 'ap1' || d === 'ap2')){ ev.preventDefault(); H.apin(); return true; }
    if(k === 'Enter' && d === 'q'){ ev.preventDefault(); const P = people().filter(sf => String(sf.name).toLowerCase().indexOf(U.q.trim().toLowerCase()) >= 0); if(P.length){ U.sel = P[0].id; rd(); } return true; }
    return false; }
  function keydown(ev){ const k = ev.key; if(ev.ctrlKey || ev.metaKey || ev.altKey || PG.typing(ev)) return;
    const stop = () => { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); };
    if(U.pop){ if(k === 'Escape'){ U.pop = null; rd(); return stop(); } return; }
    if(k >= '1' && k <= '4'){ U.view = ['people', 'roles', 'rules', 'log'][+k - 1]; rd(); return stop(); }
    if((k === 'j' || k === 'k' || k === 'ArrowDown' || k === 'ArrowUp') && U.view === 'people'){ const L = people().map(sf => sf.id).concat(['__admin']), i = L.indexOf(U.sel); U.sel = L[Math.max(0, Math.min(L.length - 1, (i < 0 ? 0 : i) + (k === 'j' || k === 'ArrowDown' ? 1 : -1)))]; rd(); return stop(); }
    if(k === '/'){ psmOpen('admin'); return stop(); }   /* Parsec 13.1 — the search window */
    if(k === 'n'){ const b = document.querySelector('[data-pg="admin"] [data-a="pop"][data-p="add"]'); if(b){ H.pop(b); return stop(); } } }
  function after(){ try{ PG.placePop(U); }catch(e){} }
  /* Parsec 13.1 — the search is an icon: the window filters the people list as you type */
  const admHit = q => { q = String(q || '').trim().toLowerCase(); return people().filter(sf => !q || String(sf.name).toLowerCase().indexOf(q) >= 0 || String(sf.role).toLowerCase().indexOf(q) >= 0); };
  psmReg('admin', () => ({ title: 'Find a person', page: 'People', placeholder: 'Name or role',
    get: () => U.q, set: q => { U.q = q; if(q && U.view !== 'people'){ U.view = 'people'; U.pop = null; } rd(); },
    count: q => ({ n: admHit(q).length, of: people().length }),
    items: q => q ? admHit(q).slice(0, 8).map(sf => ({ id: sf.id, title: sf.name, sub: [sf.role, sf.off ? 'sign-in off' : '', isSelf(sf) ? 'you' : ''].filter(Boolean).join(' · ') })) : [],
    pick: it => { U.view = 'people'; U.sel = it.id; U.pop = null; U.ap1 = U.ap2 = ''; } }));
  PG.reg('admin', { H, U: () => U, input, change, fieldKey, keydown, after });
  return { view, U: () => U };
