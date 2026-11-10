/* Parsec · pages/library · kits.js
   The Library’s Accessory kits tab (17.5): software kit numbers for standard changes — the list and the kit beside it, search and group chips, Copy, Add to an RO…, New kit, Paste a list; changing the list is the l.kits permission.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   kitList kitTools kitForm kitRead kitPaste kitRoPick kitDetail kitsHtml kitInput kitChange kitAll kitCan … (10 functions, 7 constants)
   state      accKits ros
   uses       access/ data/ kit/ pages/ pages/triage/ ro/ state/
*/
  /* ---------- Parsec 17.5: the Accessory kits tab — software kit numbers for standard configuration changes ----------
     STATE.accKits: { id, no, name, group, fits, changes, how, labor, notes, at, by }. The list on the left, the kit on the
     right: its number (Copy), what it changes, how to load it, labor and notes, and Add to an RO… (a part line on an
     operation). Search and group chips find one. + New kit or Paste a list add them; changing the list is the
     "l.kits" permission (leads and admins), everyone reads. */
  const kitAll = () => (Array.isArray(STATE.accKits) ? STATE.accKits : (STATE.accKits = []));
  const kitCan = () => { try{ return can('l.kits'); }catch(e){ return false; } };
  const kitById = id => kitAll().filter(k => k.id === id)[0] || null;
  const kitNoKey = s => String(s || '').replace(/[\s-]/g, '').toUpperCase();
  const KIT_F = [['no', 'Kit number', '85150027'], ['name', 'What it changes', 'Idle shutdown · 5 min'], ['group', 'Group', 'Idle, Speed, PTO…'], ['fits', 'Trucks it fits', 'VNL, VNR · D13 · 2018–2024'],
    ['changes', 'Changes', 'Idle shutdown timer: off → 5 min'], ['how', 'How to load it', 'Tech Tool → Program → Accessory kit'], ['labor', 'Labor hours', '0.3'], ['notes', 'Notes', 'Customer signs the change form']];
  function kitList(){
    const W = String(U.q || '').toLowerCase().split(/\s+/).filter(Boolean);
    return kitAll().filter(k => (!U.kg || (k.group || '') === U.kg) && W.every(w => [k.no, k.name, k.group, k.fits, k.changes, k.notes].join(' ').toLowerCase().indexOf(w) >= 0))
      .sort((a, b) => String(a.group || '~').localeCompare(String(b.group || '~')) || String(a.no).localeCompare(String(b.no)));
  }
  function kitTools(){
    const G = {}; kitAll().forEach(k => { const g = k.group || ''; G[g] = (G[g] || 0) + 1; });
    const gs = Object.keys(G).filter(Boolean).sort(), chip = (v, t, n) => `<button class="tg-chip${(U.kg || '') === v ? ' on' : ''}" data-a="kg" data-v="${esc(v)}">${esc(t)}${n != null ? `<small>${n}</small>` : ''}</button>`;
    return `<div class="lib-tools lak-tools"><div class="lak-row"><label class="lib-q">${ic('search', 15)}<input id="lib-q" data-in="q" value="${esc(U.q)}" placeholder="Find a kit — 85150027, idle shutdown, PTO" autocomplete="off" spellcheck="false" aria-label="Search the accessory kits"></label>
      ${kitCan() ? `<span class="lak-sp"></span><button class="btn btn-sm" data-a="kpaste" title="Paste a list of kit numbers — Parsec reads the rows">${ic('paste', 13)}Paste a list</button><button class="btn btn-sm btn-primary" data-a="knew">${ic('add', 13)}New kit</button>` : ''}</div>
      ${gs.length ? `<div class="lib-fgs" role="group" aria-label="Group">${chip('', 'All', kitAll().length)}${gs.map(g => chip(g, g, G[g])).join('')}</div>` : ''}</div>`;
  }
  function kitForm(k){
    const F = U.kf || {};
    return `<div class="lak-form"><h3>${k ? 'Change kit ' + esc(k.no) : 'New kit'}</h3>${KIT_F.map(f => `<label class="lak-f${f[0] === 'notes' || f[0] === 'changes' || f[0] === 'how' ? ' w' : ''}"><span>${f[1]}</span><input data-in="kit-${f[0]}" value="${esc(F[f[0]] || '')}" placeholder="${esc(f[2])}" autocomplete="off"${f[0] === 'group' ? ' list="lak-gl"' : ''}></label>`).join('')}
      <datalist id="lak-gl">${Object.keys(kitAll().reduce((a, x) => { if(x.group) a[x.group] = 1; return a; }, {})).sort().map(g => `<option value="${esc(g)}">`).join('')}</datalist>
      <div class="lak-acts"><button class="btn btn-sm" data-a="kcancel">Cancel</button><button class="btn btn-sm btn-primary" data-a="ksave">${k ? 'Save' : 'Add the kit'}</button></div></div>`;
  }
  /* a pasted list: a kit number first on each line, then what it changes; tabs may carry group, trucks and labor */
  function kitRead(text){
    const out = [], seen = {}; kitAll().forEach(k => { seen[kitNoKey(k.no)] = 1; });
    String(text || '').split(/\r?\n/).forEach(l => { const t = l.trim(); if(!t) return;
      const cells = t.indexOf('\t') > -1 ? t.split('\t').map(c => c.trim()) : null, m = /^([A-Za-z0-9-]{5,})\s*[-–:,]?\s*(.*)$/.exec(cells ? cells[0] + ' ' + (cells[1] || '') : t);
      if(!m || !/\d/.test(m[1])) return; const key = kitNoKey(m[1]); if(seen[key]){ out.dup = (out.dup || 0) + 1; return; } seen[key] = 1;
      out.push({ no: m[1], name: (cells ? cells[1] : m[2]) || '', group: cells && cells[2] || '', fits: cells && cells[3] || '', labor: cells && cells[4] || '' }); });
    return out;
  }
  function kitPaste(){
    const R = kitRead(U.kp);
    return `<div class="lak-form"><h3>Paste a list</h3><p class="lak-hint">One kit on each line: the kit number, then what it changes. Copied from a sheet, the next columns are Group, Trucks it fits and Labor hours.</p>
      <textarea class="lak-ta" data-in="kit-paste" placeholder="85150079  Engine brake with cruise&#10;85150085  Fan on with A/C" spellcheck="false">${esc(U.kp || '')}</textarea>
      <div class="lak-acts"><span class="lak-read" id="lak-read">${R.length ? R.length + ' kit' + (R.length === 1 ? '' : 's') + ' read' + (R.dup ? ' · ' + R.dup + ' already here' : '') : R.dup ? 'All ' + R.dup + ' are here already' : ''}</span><button class="btn btn-sm" data-a="kcancel">Cancel</button><button class="btn btn-sm btn-primary" data-a="kpgo" id="lak-pgo"${R.length ? '' : ' disabled'}>Add ${R.length || ''} kit${R.length === 1 ? '' : 's'}</button></div></div>`;
  }
  function kitRoPick(k){
    const C = roCtx(), ros = STATE.ros.filter(r => r && !r.shop && !r.dateClosed).sort((a, b) => (C && b.id === C.ro.id) - (C && a.id === C.ro.id) || String(b.dateOpened || '').localeCompare(String(a.dateOpened || '')));
    if(!ros.length) return `<div class="lak-ro"><span class="lak-hint">No open ROs to add it to.</span><button class="btn btn-sm" data-a="krox">Close</button></div>`;
    const ro = ros.filter(r => r.id === U.kro)[0] || ros[0], ops = (ro.operations || []).filter(o => !o.declined), op = ops.filter(o => o.id === U.kop)[0] || (C && C.op && C.ro.id === ro.id ? C.op : ops[0]);
    return `<div class="lak-ro"><b>Add ${esc(k.no)} to</b><select data-ch="kit-ro" aria-label="The RO">${ros.slice(0, 60).map(r => `<option value="${esc(r.id)}"${r.id === ro.id ? ' selected' : ''}>RO ${esc(tgNum(r))} · ${esc(String(r.customerName || '').slice(0, 28))}</option>`).join('')}</select>
      <select data-ch="kit-op" aria-label="The operation">${ops.map(o => `<option value="${esc(o.id)}"${op && o.id === op.id ? ' selected' : ''}>Op ${(ro.operations || []).indexOf(o) + 1} · ${esc(String(o.complaint || 'Operation').slice(0, 44))}</option>`).join('')}</select>
      <button class="btn btn-sm" data-a="krox">Cancel</button><button class="btn btn-sm btn-primary" data-a="krogo" data-ro="${esc(ro.id)}" data-op="${esc(op ? op.id : '')}"${op ? '' : ' disabled'}>Add it</button></div>`;
  }
  function kitDetail(k){
    if(!k) return `<div class="lak-empty">${kitAll().length ? 'Pick a kit to see what it changes and how to load it.' : ''}</div>`;
    const row = (l, v) => v ? `<div class="lak-v"><span>${l}</span><div>${esc(v)}</div></div>` : '';
    return `<div class="lak-card"><div class="lak-no"><b class="mono">${esc(k.no)}</b><button class="btn btn-sm" data-a="kcopy" data-id="${esc(k.id)}" title="Copy the kit number — for Tech Tool">${ic('copy', 13)}Copy</button><button class="btn btn-sm btn-primary" data-a="kro" data-id="${esc(k.id)}" title="Put it on an RO’s operation as a part line">${ic('add', 13)}Add to an RO…</button>
        <span class="lak-sp"></span>${kitCan() ? `<button class="lib-ib" data-a="kedit" data-id="${esc(k.id)}" title="Change this kit">${ic('edit', 13)}</button><button class="lib-ib" data-a="kdel" data-id="${esc(k.id)}" title="Take this kit off the list">${ic('del', 13)}</button>` : ''}</div>
      <h3>${esc(k.name || 'Accessory kit')}</h3><div class="lak-sub">${[k.group, k.fits ? 'fits ' + k.fits : ''].filter(Boolean).map(esc).join(' · ')}</div>
      ${U.km === 'ro' ? kitRoPick(k) : ''}${row('Changes', k.changes)}${row('How to load it', k.how)}${row('Labor', k.labor ? k.labor + ' h' : '')}${row('Notes', k.notes)}
      ${k.by || k.at ? `<div class="lak-by">${k.by ? 'Added by ' + esc(PG.first(k.by)) : 'Added'}${k.at ? ' · ' + esc(fmtDate(k.at)) : ''}</div>` : ''}</div>`;
  }
  function kitsHtml(){
    const L = kitList(), all = kitAll().length, cur = kitById(U.kit) && L.indexOf(kitById(U.kit)) > -1 ? kitById(U.kit) : (U.km === 'new' || U.km === 'paste' ? null : L[0] || null);
    if(cur) U.kit = cur.id;
    const left = !all ? `<div class="lib-none lak-none"><b>No accessory kits yet.</b><span>${kitCan() ? 'Add the software kit numbers the shop uses for standard changes — speed limit, idle shutdown, PTO. Paste a list, or add one.' : 'A lead adds the software kit numbers the shop uses.'}</span></div>`
      : L.length ? L.map(k => `<div class="lib-row lak-rowi${cur && k.id === cur.id && U.km !== 'new' && U.km !== 'paste' ? ' on' : ''}" data-a="kit" data-id="${esc(k.id)}" role="button" tabindex="0"><b class="mono">${esc(k.no)}</b><span>${esc(k.name || '')}</span>${k.group ? `<small>${esc(k.group)}</small>` : ''}</div>`).join('')
      : `<div class="lib-none">No kit matches. <button class="link-btn" data-a="kall">Show them all</button></div>`;
    const right = U.km === 'new' ? kitForm(null) : U.km === 'edit' && cur ? kitForm(cur) : U.km === 'paste' ? kitPaste() : kitDetail(cur);
    return `<div class="lak-its"><div class="lak-l" role="list" aria-label="Accessory kits">${left}</div><div class="lak-d">${right}</div></div>`;
  }
  const kitDeny = () => { pushToast('Leads keep this list — ask one to change it.'); };
  const KITH = {
    kit: tt => { U.kit = tt.dataset.id; U.km = null; relist(); },
    kg: tt => { U.kg = (U.kg || '') === tt.dataset.v ? '' : tt.dataset.v; rd(); },
    kall: () => { U.q = ''; U.kg = ''; rd(); },
    knew: () => { if(!kitCan()) return kitDeny(); U.km = 'new'; U.kf = { group: U.kg || '' }; relist(); const i = document.querySelector('[data-pg="library"] [data-in="kit-no"]'); if(i) i.focus(); },
    kedit: tt => { if(!kitCan()) return kitDeny(); const k = kitById(tt.dataset.id); if(!k) return; U.km = 'edit'; U.kf = Object.assign({}, k); relist(); },
    kpaste: () => { if(!kitCan()) return kitDeny(); U.km = 'paste'; U.kp = ''; relist(); const i = document.querySelector('[data-pg="library"] .lak-ta'); if(i) i.focus(); },
    kcancel: () => { U.km = null; U.kf = null; U.kp = ''; relist(); },
    ksave: () => { if(!kitCan()) return kitDeny(); const F = U.kf || {}, no = String(F.no || '').trim(), cur = U.km === 'edit' ? kitById(U.kit) : null;
      if(!no){ pushToast('Type the kit number first.'); return; }
      if(kitAll().some(k => k !== cur && kitNoKey(k.no) === kitNoKey(no))){ pushToast('Kit ' + no + ' is on the list already.'); return; }
      pushUndo('accessory kits'); const k = cur || { id: uid('ak'), at: nowIso(), by: PG.me().name }; KIT_F.forEach(f => { k[f[0]] = String(F[f[0]] || '').trim(); });
      if(!cur) kitAll().push(k); U.kit = k.id; U.km = null; U.kf = null; scheduleSave(true); rd(); pushToast(cur ? 'Kit ' + k.no + ' saved.' : 'Kit ' + k.no + ' added.', true); },
    kpgo: () => { if(!kitCan()) return kitDeny(); const R = kitRead(U.kp); if(!R.length) return; pushUndo('accessory kits');
      R.forEach(r => kitAll().push({ id: uid('ak'), no: r.no, name: r.name, group: r.group, fits: r.fits, changes: '', how: '', labor: r.labor, notes: '', at: nowIso(), by: PG.me().name }));
      U.km = null; U.kp = ''; U.kit = kitAll()[kitAll().length - R.length].id; scheduleSave(true); rd(); pushToast(R.length + ' kit' + (R.length === 1 ? '' : 's') + ' added.', true); },
    kdel: tt => { if(!kitCan()) return kitDeny(); const k = kitById(tt.dataset.id); if(!k) return;
      pgAsk({ head: 'Take kit ' + k.no + ' off the list?', sub: 'ROs it was added to keep their line.', buttons: [{ k: 'no', l: 'Keep it' }, { k: 'yes', l: 'Take it off', pri: true }] },
        a => { if(a !== 'yes') return; pushUndo('accessory kits'); STATE.accKits = kitAll().filter(x => x !== k); U.kit = null; scheduleSave(true); rd(); pushToast('Kit ' + k.no + ' is off the list.', true); }); },
    kcopy: tt => { const k = kitById(tt.dataset.id); if(!k) return; try{ copyText(k.no); }catch(e){} pushToast('Copied ' + k.no + ' — paste it in Tech Tool.'); },
    kro: tt => { U.kit = tt.dataset.id; U.km = 'ro'; U.kro = null; U.kop = null; relist(); },
    krox: () => { U.km = null; relist(); },
    krogo: tt => { const k = kitById(U.kit), ro = getRO(tt.dataset.ro), op = ro && (ro.operations || []).filter(o => o.id === tt.dataset.op)[0]; if(!k || !op) return;
      pushUndo('add a kit to an RO'); if(!Array.isArray(op.parts)) op.parts = [];
      op.parts.push({ id: uid('pt'), description: k.name || 'Accessory kit', partNumber: k.no, qty: '1', status: 'Not Ordered', eta: '', statusChangedAt: nowIso() });
      try{ audit('parts', roLabel(ro) + ' · accessory kit ' + k.no + ' added to Op ' + ((ro.operations || []).indexOf(op) + 1), ro); }catch(e){}
      U.km = null; scheduleSave(true); rd(); pushToast('Kit ' + k.no + ' is on RO ' + tgNum(ro) + ' · Op ' + ((ro.operations || []).indexOf(op) + 1) + ' as a part line.', true); }
  };
  function kitInput(tt){ const f = tt.dataset.in.slice(4);
    if(f === 'paste'){ U.kp = tt.value; const R = kitRead(U.kp), s = document.getElementById('lak-read'), b = document.getElementById('lak-pgo');
      if(s) s.textContent = R.length ? R.length + ' kit' + (R.length === 1 ? '' : 's') + ' read' + (R.dup ? ' · ' + R.dup + ' already here' : '') : R.dup ? 'All ' + R.dup + ' are here already' : '';
      if(b){ b.disabled = !R.length; b.textContent = 'Add ' + (R.length || '') + ' kit' + (R.length === 1 ? '' : 's'); } return; }
    (U.kf = U.kf || {})[f] = tt.value; }
  function kitChange(tt){ if(tt.dataset.ch === 'kit-ro'){ U.kro = tt.value; U.kop = null; } else U.kop = tt.value; relist(); }
