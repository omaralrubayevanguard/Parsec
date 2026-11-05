/* Parsec · access/admin-page · person-page.js
   One person’s page on Admin › People (17.3): the name, role and what’s changed from it, the Sign-in card, and tabs for Pages (tiles), What they can do (Role · On · Off, ↺ per row) and Activity; a role change says first what it adds and takes away.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ppTabs ppOnOff ppRoleSays ppPages ppActs ppLog personPane ppRoleDiff ppRoleAsk ppAct3 (10 functions)
   uses       access/ kit/ pages/rolist/ ro/ settings/ shell/
*/
/* ============================== one person's page (Parsec 17.3) ==============================
   Admin › People, a person picked: everything about them in one place.
     · the top: name, role (change it here — a window says first which pages and actions it adds or takes away),
       and "N changed from the <role> role · Back to the role";
     · the Sign-in card: the PIN, Give a temporary PIN, Can sign in;
     · three tabs: Pages (a tile per page, with its icon) · What <name> can do (Role · On · Off on each row; a row
       changed from the role has a dot, what the role says, and ↺ to put back just that one) · Activity (the changes
       made to them and their sign-ins, from the audit log).
   Nothing new is saved: a change is sf.ov, through permSet / permSetRole as before. U.ptab is the tab. */
function ppTabs(sf){
  const f = esc(admFirst(sf.name)), nP = PERM_PAGES.filter(p => permHas(sf, 'pages', p[0])).length, nA = permActKeys().filter(k => permHas(sf, 'acts', k)).length;
  const T = [['pages', 'Pages', nP + ' of ' + PERM_PAGES.length], ['acts', 'What ' + f + ' can do', nA + ' of ' + permActKeys().length], ['log', 'Activity', '']];
  const t = U.ptab || 'pages';
  return `<div class="adm-tabs" role="tablist">${T.map(x => `<button role="tab" class="adm-tab${t === x[0] ? ' on' : ''}" data-a="ptab" data-v="${x[0]}" aria-selected="${t === x[0]}">${x[1]}${x[2] ? `<small>${x[2]}</small>` : ''}</button>`).join('')}</div>`;
}
function ppOnOff(v){ return v ? 'on' : 'off'; }
function ppRoleSays(sf, kind, k){ const t = permRole(sf.role); return !!(t[kind] && t[kind][k]); }
function ppPages(sf, lock){
  return `<div class="adm-tiles">${PERM_PAGES.map(p => { const on = permHas(sf, 'pages', p[0]), c = permChanged(sf, 'pages', p[0]), icn = (typeof IV_NAV_IC !== 'undefined' && IV_NAV_IC[p[0]]) || p[0];
    return `<button class="adm-tile${on ? ' on' : ''}${c ? ' ov' : ''}" data-a="pg" data-id="${sf.id}" data-k="${p[0]}" aria-pressed="${on}"${lock ? ' disabled' : ''} title="${esc(p[1])} — ${on ? 'opens it' : 'doesn’t open it'}${c ? ' (the ' + esc(sf.role) + ' role says ' + ppOnOff(ppRoleSays(sf, 'pages', p[0])) + ')' : ''}">`
      + `<span class="adm-tic">${typeof ivIco === 'function' ? ivIco(icn, 20) : ''}</span><span class="adm-tl">${esc(p[1])}</span>${c ? `<small>${esc(sf.role)}: ${ppOnOff(ppRoleSays(sf, 'pages', p[0]))}</small>` : ''}<i class="adm-tck"></i></button>`; }).join('')}</div>`;
}
function ppActs(sf, lock){
  const d = lock ? ' disabled' : '';
  return PERM_ACTS.map(g => `<div class="adm-ag"><h6>${esc(g[0])}</h6>${g[1].map(a => { const k = a[0], on = permHas(sf, 'acts', k), c = permChanged(sf, 'acts', k), rs = ppRoleSays(sf, 'acts', k);
    const seg = (v, l, tip) => { const pressed = v === 'role' ? !c : c && (v === 'on') === on;
      return `<button class="adm-s3${pressed ? ' on' : ''}${v !== 'role' && !c && (v === 'on') === on ? ' eff' : ''}" data-a="a3" data-id="${sf.id}" data-k="${k}" data-v="${v}" aria-pressed="${pressed}" title="${tip}"${d}>${l}</button>`; };
    return `<div class="adm-ar${c ? ' ov' : ''}"><span class="adm-al">${c ? '<i class="adm-dot"></i>' : ''}${esc(a[1])}</span>`
      + (c ? `<span class="adm-rs">${esc(sf.role)}: ${ppOnOff(rs)}</span><button class="adm-rb" data-a="a3" data-id="${sf.id}" data-k="${k}" data-v="role" title="Back to the role — ${ppOnOff(rs)}" aria-label="Back to the role"${d}>↺</button>` : '')
      + `<span class="adm-seg3" role="group" aria-label="${esc(a[1])}">${seg('role', 'Role', 'As the ' + esc(sf.role) + ' role — ' + ppOnOff(rs))}${seg('on', 'On', 'On for ' + esc(admFirst(sf.name)) + ' alone')}${seg('off', 'Off', 'Off for ' + esc(admFirst(sf.name)) + ' alone')}</span></div>`; }).join('')}</div>`).join('');
}
function ppLog(sf){
  const nm = sf.name, SI = { signin: 'Signed in', switch: 'Signed in', unlock: 'Signed in', signout: 'Signed out', lock: 'Locked', pinfail: 'Wrong PIN' };
  const L = auditLog().filter(a => (SI[a.type] && a.by === nm) || ((a.type === 'perm' || a.type === 'staff' || a.type === 'pin') && String(a.text || '').indexOf(nm) === 0)).slice(-60).reverse();
  if(!L.length) return `<div class="adm-none">Nothing yet — changes to ${esc(admFirst(nm))} and their sign-ins show here.</div>`;
  return `<div class="adm-plog">${L.map(a => { const d = new Date(a.at), t = SI[a.type] ? SI[a.type] : String(a.text || '').replace(nm + ': ', '').replace(nm + ' ', '');
    return `<div class="adm-plr"><time>${esc(day(a.at))} ${(d.getHours() % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0') + (d.getHours() < 12 ? ' am' : ' pm')}</time><span>${esc(t)}</span><em>${SI[a.type] ? '' : esc(a.by || '')}</em></div>`; }).join('')}</div>`;
}
function personPane(sf){
  const self = isSelf(sf), lock = self, n = permChangedN(sf), last = admLastIn(sf), f = esc(admFirst(sf.name));
  let h = `<div class="adm-ph">${staffAvHtml(sf, 'adm-av xl', 'adm')}<span class="adm-pt"><b>${esc(sf.name)}</b><small>${esc(sf.role)} · ${sf.off ? 'sign-in turned off ' + esc(day(sf.offAt)) + ' — their history stays' : last ? 'last signed in ' + esc(when(last).toLowerCase()) : 'hasn’t signed in yet'}</small>`
    + (n ? `<span class="adm-pchg"><i class="adm-dot"></i>${n} changed from the ${esc(sf.role)} role${lock ? '' : ` · <button class="adm-lnk" data-a="back" data-id="${sf.id}">Back to the role</button>`}</span>` : '')
    + `</span><label class="adm-role"><span>Role</span><select class="adm-sel" data-ch="role" data-id="${sf.id}" aria-label="Role"${lock ? ' disabled' : ''}>${permRoles().map(r => `<option${r === sf.role ? ' selected' : ''}>${esc(r)}</option>`).join('')}</select></label></div>`;
  if(self) h += `<div class="adm-note">${ic('info')}<span>This is you — someone else with “Manage people and PINs”, or the Admin, changes your own pages and actions.</span></div>`;
  const pinTxt = !pinIs(sf) ? `<span class="adm-w">No PIN yet — ${f} picks one at their next sign-in</span>` : sf.pinTemp ? `<span class="adm-w">Temporary — ${f} picks their own at their next sign-in</span>` : `<span class="adm-pinbx">••••</span><span class="adm-mu">set ${esc(day(sf.pinAt) || '')}</span>`;
  h += `<div class="adm-card adm-sign"><h5>${ic('lock')}Sign-in</h5><div class="adm-kv">
      <span>PIN</span><span class="adm-pinr">${pinTxt}<button class="btn btn-sm" data-a="reset" data-id="${sf.id}"${sf.off ? ' disabled' : ''} title="A new temporary PIN — ${f} picks their own at the next sign-in">${ic('key')}${pinIs(sf) ? 'Reset' : 'Give a temporary PIN'}</button></span>
      <span>Can sign in</span><span class="adm-pinr">${sw(!sf.off, sf.off ? 'Off — their punches, notes and ROs keep their name' : 'On', `data-a="off" data-id="${sf.id}"`, false, self)}${self ? '' : sf.off ? '' : `<button class="btn btn-sm adm-danger adm-offb" data-a="off" data-id="${sf.id}">Turn off sign-in</button>`}</span></div></div>`;
  const t = U.ptab || 'pages';
  h += `<div class="adm-card adm-pcard">${ppTabs(sf)}<div class="adm-tb" role="tabpanel">${t === 'acts' ? ppActs(sf, lock) : t === 'log' ? ppLog(sf) : ppPages(sf, lock)}</div></div>`;
  return h;
}
/* what a new role adds and takes away for this person (their own changes stay) */
function ppRoleDiff(sf, role){
  const t = permRole(role), has = (kind, k) => { const o = sf.ov && sf.ov[kind] && Object.prototype.hasOwnProperty.call(sf.ov[kind], k) ? sf.ov[kind][k] : null; return o !== null && o !== undefined ? !!o : !!(t[kind] && t[kind][k]); };
  const R = { pg: [[], []], ac: [[], []] };
  PERM_PAGES.forEach(p => { const a = permHas(sf, 'pages', p[0]), b = has('pages', p[0]); if(a !== b) R.pg[b ? 0 : 1].push(p[1]); });
  permActKeys().forEach(k => { const a = permHas(sf, 'acts', k), b = has('acts', k); if(a !== b) R.ac[b ? 0 : 1].push(PERM_VERB[k] || permActLabel(k).toLowerCase()); });
  return R;
}
function ppRoleAsk(sf, role){
  const t = permRole(role), stays = kind => Object.keys((sf.ov && sf.ov[kind]) || {}).filter(k => !!sf.ov[kind][k] !== !!(t[kind] && t[kind][k]));
  const f = admFirst(sf.name), D = ppRoleDiff(sf, role), n = stays('pages').length + stays('acts').length, an = /^[aeiou]/i.test(role) ? 'an ' : 'a ';
  const list = [];
  if(D.pg[0].length) list.push(['+ Pages', D.pg[0].join(', ')]);
  if(D.pg[1].length) list.push(['− Pages', D.pg[1].join(', ')]);
  if(D.ac[0].length) list.push(['+ Can', sgAnd(D.ac[0])]);
  if(D.ac[1].length) list.push(['− Can’t', sgAnd(D.ac[1])]);
  if(!list.length) list.push(['Same', 'the same pages and actions as now']);
  pgAsk({ head: 'Make ' + f + ' ' + an + role + '?', sub: n ? f + '’s ' + n + ' own change' + (n === 1 ? '' : 's') + ' stay' + (n === 1 ? 's' : '') + '.' : 'Everything follows the ' + role + ' role.', list: list,
    buttons: [{ k: 'no', l: 'Cancel' }, { k: 'go', l: 'Make ' + role, pri: true }] }, k => {
    if(k !== 'go'){ rd(); return; }
    /* a change of Dana's own that the new role already gives isn't a change any more */
    act('role', () => { permSetRole(sf, role); ['pages', 'acts'].forEach(kind => Object.keys((sf.ov && sf.ov[kind]) || {}).forEach(k => { if(!!sf.ov[kind][k] === ppRoleSays(sf, kind, k)) delete sf.ov[kind][k]; })); permSyncPages(sf); },
      f + ' is ' + an + role.toLowerCase() + ' now.');
  });
}
/* Role · On · Off on one action, and ↺ */
function ppAct3(sf, k, v){
  const f = admFirst(sf.name), rs = ppRoleSays(sf, 'acts', k), want = v === 'role' ? rs : v === 'on', verb = PERM_VERB[k] || permActLabel(k).toLowerCase();
  if(v !== 'role' && want === rs && !permChanged(sf, 'acts', k)){ pushToast('The ' + sf.role + ' role already has it ' + ppOnOff(rs) + ' — ' + f + ' follows the role.'); return; }
  act('action for one person', () => { if(v === 'role'){ if(sf.ov && sf.ov.acts) delete sf.ov.acts[k]; permSet(sf, 'acts', k, rs); } else permSet(sf, 'acts', k, want); },
    v === 'role' ? f + ' follows the ' + sf.role + ' role again — ' + (rs ? 'can ' : 'can’t ') + verb + '.' : f + (want ? ' can now ' : ' can’t ') + verb + (want ? '.' : ' any more.'));
}
