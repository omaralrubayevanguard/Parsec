/* ===== Parsec 16.3 (B) — inside the RO page (JC): its RO number copies on click (the header and the truck card), and the
   contact in the header — name and phone; a click gives Copy the number · Edit the contact · Copy a text (the Triage templates) ===== */
function v163bIc(k, sz) {
  var P = { phone: '<path d="M5.5 3.5h3l1.5 4-2 1.3a10.5 10.5 0 005.2 5.2l1.3-2 4 1.5v3a2 2 0 01-2.1 2A16 16 0 013.5 5.6a2 2 0 012-2.1z"/>' };
  return P[k] ? '<svg class="px-ico" width="' + (sz || 14) + '" height="' + (sz || 14) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[k] + '</svg>' : pxI(k, sz || 14);
}
function v163bPh(p) { var s = String(p || '').trim(), d = s.replace(/\D/g, ''); if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1); return d.length === 10 ? '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6) : s; }
/* the RO number: a click (or Enter) copies it, with a tick — it isn't a link here, you're on that RO */
function v163bCopyId(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  var n = RO && RO.roNumber; if (!n) return;
  pxCopy(n, 'Copied ' + n);
  var t = e && e.currentTarget; if (t && t.classList) { t.classList.add('is-copied'); setTimeout(function () { t.classList.remove('is-copied'); }, 1400); }
}
function v163bIdOn(n) {
  if (!n || !RO || !RO.roNumber || n.v163b) return n; n.v163b = 1;
  n.classList.add('v163b-id'); n.setAttribute('role', 'button'); n.setAttribute('tabindex', '0'); n.setAttribute('title', 'Copy the RO number');
  n.addEventListener('click', v163bCopyId);
  n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') v163bCopyId(e); });
  return n;
}
function v163bId() { return v163bIdOn(el('b', { class: 'px-id', text: RO.roNumber || 'RO' })); }
function v163bTitle(tb) { try { v163bIdOn(tb && tb.querySelector && tb.querySelector('.px-ro__eyebrow .px-id')); } catch (e) {} return tb; }
/* the contact */
function v163bCanEd() { try { if (typeof tcxOn === 'function' && tcxOn() && typeof canPage === 'function' && !canPage('ros')) return false; return typeof roFldCanEdit === 'function' ? roFldCanEdit(RO) : true; } catch (e) { return true; } }
function v163bContact() {
  if (!RO || RO.shop || RO.id === SHOP_RO_ID) return null;
  var nm = String(RO.contactName || '').trim(), ph = String(RO.contactPhone || '').trim(), ed = v163bCanEd();
  var w = el('div', { class: 'v163b-who' });
  if (RO.customerName) w.appendChild(el('span', { class: 'v163b-cu', text: RO.customerName }));
  if (!nm && !ph) {
    if (!ed) return RO.customerName ? w : null;
    var a = el('button', { class: 'v163b-ct is-add', type: 'button', title: 'Add who to call and their number', html: pxI('user', 14) + '<span>Add contact</span>' });
    a.addEventListener('click', function (e) { e.stopPropagation(); v163bEdit(a); });
    w.appendChild(a); return w;
  }
  var b = el('button', { class: 'v163b-ct', type: 'button', 'aria-haspopup': 'menu', title: 'Copy the number, edit the contact or copy a text',
    html: (nm ? pxI('user', 14) + '<span class="v163b-nm">' + esc(nm) + '</span>' : '') + (ph ? '<span class="v163b-ph">' + v163bIc('phone', 13) + '<span>' + esc(v163bPh(ph)) + '</span></span>' : '<span class="v163b-ph is-none">No number</span>') });
  b.addEventListener('click', function (e) { e.stopPropagation(); v163bMenu(b); });
  w.appendChild(b); return w;
}
function v163bMenu(b) {
  var nm = String(RO.contactName || '').trim(), ph = String(RO.contactPhone || '').trim(), ed = v163bCanEd(), L = [];
  if (ph) L.push(pxMenuItem('copy', 'Copy the number', { run: function () { pxCopy(v163bPh(ph), 'Copied ' + v163bPh(ph)); } }));
  if (ed) L.push(pxMenuItem('pencil', ph ? 'Edit the contact' : 'Add a number', { run: function () { setTimeout(function () { v163bEdit(b); }, 0); } }));
  var T = []; try { T = tgTpls(); } catch (e) {}
  if (T.length) {
    var sug = ''; try { sug = tgSugTpl(RO); } catch (e) {}
    L.push(pxSep(), el('div', { class: 'v163b-mlab', text: 'Copy a text' + (nm ? ' to ' + tgFirst(nm) : '') }));
    T.forEach(function (t) {
      var it = pxMenuItem('chat', t.n, { run: function () { var tx = ''; try { tx = tgFill(t.b, RO, { n: nm }); } catch (e) { tx = t.b; } pxCopy(tx, 'Copied the “' + t.n + '” text — paste it in your message'); } });
      it.setAttribute('data-v163b-tpl', t.id || ''); it.title = (function () { try { return tgFill(t.b, RO, { n: nm }); } catch (e) { return ''; } })();
      if (t.id === sug) it.insertAdjacentHTML('beforeend', '<span class="v163b-sug">suggested</span>');
      L.push(it);
    });
  }
  pxPop(b, el('div', { class: 'px-pop v163b-pop', role: 'menu' }, L), { alignRight: false });
}
/* Edit: the two fields in a small pop-over, through the RO details table (ROFLD) — Undo, the Activity line, saved */
function v163bEdit(anchor) {
  if (!v163bCanEd()) return;
  var f1 = roFldEdit(RO, 'contactName'), f2 = roFldEdit(RO, 'contactPhone');
  var i1 = el('input', { class: 'px-input', type: 'text', value: RO.contactName || '', placeholder: 'Who to call', 'aria-label': 'Contact', autocomplete: 'off', 'data-no-draft': '' });
  var i2 = el('input', { class: 'px-input', type: 'tel', value: RO.contactPhone || '', placeholder: '(336) 555-0142', 'aria-label': 'Phone', autocomplete: 'off', 'data-no-draft': '' });
  function done(keep) {
    var a = i1.value.trim(), p = i2.value.trim();
    if (keep && (a !== String(RO.contactName || '') || p !== String(RO.contactPhone || ''))) {
      pushUndo('contact');
      if (a !== String(RO.contactName || '')) { if (f1) f1.set(a); else if (a) RO.contactName = a; else delete RO.contactName; }
      if (p !== String(RO.contactPhone || '')) { if (f2) f2.set(p); else if (p) RO.contactPhone = p; else delete RO.contactPhone; }
      save(true); toast('Contact saved');
    }
    pxClosePop(); render(); tecRender();
  }
  [i1, i2].forEach(function (i) { i.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); done(true); } else if (e.key === 'Escape') { e.preventDefault(); done(false); } }); });
  var pop = el('div', { class: 'px-pop v163b-ed', role: 'dialog', 'aria-label': 'Contact' }, [
    el('h4', { text: 'Contact' }),
    el('label', {}, [el('span', { text: 'Contact' }), i1]),
    el('label', {}, [el('span', { text: 'Phone' }), i2]),
    el('div', { class: 'v163b-eda' }, [el('button', { class: 'px-btn px-btn--sm', type: 'button', text: 'Cancel', onClick: function (e) { e.stopPropagation(); done(false); } }),
      el('button', { class: 'px-btn px-btn--sm px-btn--primary', type: 'button', text: 'Save', onClick: function (e) { e.stopPropagation(); done(true); } })])]);
  if (pxPop(anchor, pop, { force: true })) setTimeout(function () { try { (RO.contactName ? i2 : i1).focus(); } catch (e) {} }, 0);
}
