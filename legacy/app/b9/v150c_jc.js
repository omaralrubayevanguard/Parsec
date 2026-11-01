/* ---------- Parsec 15 (C): the Time tab — notes that aren't on a punch change in place or go; a deleted entry shows where it was ---------- */
function ropSoloNote(job, it) {
  var ref = it.ref, P = v150NoteOk(job, ref, RO), row = el('div', { class: 'rop-tn is-solo' + (ref ? ' is-ed' : '') });
  row.appendChild(el('small', { text: ropClk(it.at) }));
  if (ref && ROPT.nedit === ref) {
    var inp = el('input', { class: 'rop-nin rop-nined', value: String(ref.text || ''), 'aria-label': 'Change the note' }), done = false;
    var fin = function (keep) {
      if (done) return; done = true; ROPT.nedit = null; var v = String(inp.value || '').trim();
      if (keep && v && v !== String(ref.text || '').trim()) {
        pushUndo('change a note'); ref.text = v; ref.editedAt = nowIso(); ref.editedBy = ropMe() || '';
        try { audit('op-note-edit', roLabel(RO) + ': changed a note on Op ' + ropN(job) + ' — ' + v.slice(0, 80), RO); } catch (e) {}
        save(true); render(); try { tecRender(); } catch (e) {} ropUndo('Note changed.');
      } else render();
    };
    inp.addEventListener('click', function (e) { e.stopPropagation(); });
    inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); fin(false); } else if (e.key === 'Enter') { e.preventDefault(); fin(true); } });
    inp.addEventListener('blur', function () { setTimeout(function () { fin(true); }, 0); });
    row.appendChild(el('span', { class: 'rop-tnb' }, [el('em', { text: it.n.lb }), inp]));
    requestAnimationFrame(function () { try { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) {} });
    return row;
  }
  var ed = ref && ref.editedAt ? ' <i class="rop-tned" data-tip="' + esc('Changed' + (ref.editedBy ? ' by ' + ropFirst(ref.editedBy) : '') + ' · ' + ropClk(+new Date(ref.editedAt))) + '">edited</i>' : '';
  row.appendChild(el('span', { html: '<em>' + esc(it.n.lb) + '</em>' + esc(it.n.text) + ed }));
  if (ref) {
    var tools = el('span', { class: 'rop-ntools' });
    var pen = ropIb('pencil', 'Change the note', function () { if (!P.ok) { toast(P.why); return; } ROPT.nedit = ref; ROPT.nmenu = null; render(); });
    var del = ropIb('trash', 'Delete the note', function () { if (!P.ok) { toast(P.why); return; } ropNoteDel(job, it); }, 'is-dng');
    var more = ropIb('more', 'Change or delete the note', function () { ROPT.nmenu = ROPT.nmenu === ref ? null : ref; render(); }, 'rop-nmore');
    if (!P.ok) [pen, del].forEach(function (b) { b.classList.add('is-off'); b.setAttribute('aria-disabled', 'true'); b.setAttribute('data-tip', P.why); b.removeAttribute('title'); });
    if (ROPT.nmenu === ref) row.classList.add('is-tools');
    tools.appendChild(more); tools.appendChild(pen); tools.appendChild(del); row.appendChild(tools);
  }
  return row;
}
function ropNoteDel(job, it) {
  var arr = it.src === 'log' ? job.log : job.offNotes; if (!Array.isArray(arr)) return; var i = arr.indexOf(it.ref); if (i < 0) return;
  pushUndo('delete a note'); arr.splice(i, 1); ROPT.nmenu = null;
  try { audit('op-note-del', roLabel(RO) + ': deleted a note on Op ' + ropN(job) + ' — ' + String(it.ref.text || '').slice(0, 80), RO); } catch (e) {}
  save(true); render(); try { tecRender(); } catch (e) {} ropUndo('Note deleted.');
}
/* where a deleted entry was: its minutes are air now */
function ropHoleRow(job, h) {
  var s = +new Date(h.start), e = +new Date(h.stop);
  return el('div', { class: 'rop-tn is-solo is-hole', html: '<small>' + esc(ropClk(s)) + '</small><span><em>Deleted</em>' + esc(ropClk(s) + '–' + ropClk(e) + ' · ' + hmText(e - s) + ' · it counts as air now' + (h.delBy ? ' · by ' + ropFirst(h.delBy) : '')) + '</span>' });
}
