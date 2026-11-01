/* Parsec · ro-page · attachments-view.js
   The attachments large view: list, keys, rename, delete, open.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   attList attFind openAttachments closeAttachments attKeys attStep attDelete attRename attNameField attIconBtn attRender attGrid … (17 functions, 5 constants)
   uses       data/ kit/ ro/ shell/ state/
*/
/* ============================ attachments: large view ============================
   Every file on the RO in one big modal: a grid you can filter, select, rename and
   delete in bulk, and a viewer (pictures, video, PDF, text) you can page through with
   the arrow keys. Renaming renames the file in the RO's folder too; deleting removes it
   from the folder and this browser, so it asks first. */
var ATT = { open: false, cur: null, sel: {}, filter: 'all', renaming: null };
var ATT_TEXT = /^(text\/|application\/(json|xml))/;
function attList() {
  return allFiles().filter(function (x) {
    var k = fileKind(x.f);
    if (ATT.filter === 'pics') return k === 'img' || k === 'vid';
    if (ATT.filter === 'docs') return k !== 'img' && k !== 'vid';
    return true;
  });
}
function attFind(id) { return allFiles().filter(function (x) { return x.f.id === id; })[0] || null; }
function openAttachments(fileId) {
  ATT.open = true; ATT.cur = fileId || null; ATT.renaming = null;
  if (fileId) ATT.filter = 'all';
  attRender();
}
function closeAttachments() {
  ATT.open = false; ATT.cur = null; ATT.sel = {}; ATT.renaming = null;
  var w = R && R.getElementById('attWrap'); if (w) w.remove();
  document.documentElement.classList.remove('att-open');
  if (attPdfUrl) { URL.revokeObjectURL(attPdfUrl); attPdfUrl = null; }
  document.removeEventListener('keydown', attKeys, true);
}
var attPdfUrl = null;
function attKeys(e) {
  if (!ATT.open) return;
  var t = (e.composedPath && e.composedPath()[0]) || e.target;
  var typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (typing) { ATT.renaming = null; attRender(); } else if (ATT.cur) { ATT.cur = null; attRender(); } else closeAttachments(); return; }
  if (typing || !ATT.cur) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); attStep(e.key === 'ArrowRight' ? 1 : -1); }
  if (e.key === 'Delete') { e.preventDefault(); var x = attFind(ATT.cur); if (x) attDelete([x]); }
}
function attStep(d) {
  var l = attList(), i = l.findIndex(function (x) { return x.f.id === ATT.cur; });
  if (!l.length) return;
  ATT.cur = l[(i + d + l.length) % l.length].f.id; ATT.renaming = null; attRender();
}
/* delete for good: record, browser copy and folder copy */
function attDelete(list) {
  if (!list.length) return;
  var msg = list.length === 1 ? 'Delete “' + list[0].f.name + '”?' : 'Delete ' + list.length + ' files?';
  if (!window.confirm(msg + '\n\nThis removes ' + (list.length === 1 ? 'it' : 'them') + ' from this RO, this browser and the RO folder. It can’t be undone.')) return;
  pushUndo('delete attachments');
  list.forEach(function (x) {
    idbDel(x.f.id);
    removeFromFolder(RO.id, x.f);
    x.e.files = (x.e.files || []).filter(function (f) { return f.id !== x.f.id; });
    delete ATT.sel[x.f.id];
    if (THUMB_URL[x.f.id]) { URL.revokeObjectURL(THUMB_URL[x.f.id]); delete THUMB_URL[x.f.id]; }
  });
  if (ATT.cur && !attFind(ATT.cur)) { var l = attList(); ATT.cur = l.length ? l[0].f.id : null; }
  save(true); render(); attRender();
  toast(list.length === 1 ? 'File deleted' : list.length + ' files deleted');
}
/* rename: the record, and the file in the RO's folder (copy to the new name, then drop the old) */
function attRename(x, want) {
  var f = x.f, nm = safeName(want);
  if (!nm) return Promise.resolve(false);
  var ext = /\.[a-z0-9]{1,5}$/i.exec(f.name || ''), hasExt = /\.[a-z0-9]{1,5}$/i.test(nm);
  if (ext && !hasExt) nm += ext[0];
  if (nm === f.name) return Promise.resolve(false);
  pushUndo('rename attachment');
  var oldName = f.name;
  f.name = nm;
  if (!(folderOn() && f.inFolder && f.folder && f.fname)) { save(true); return Promise.resolve(true); }
  var dirH, oldF = f.fname, key = null;
  return roDirByName(f.folder, false)
    .then(function (d) { dirH = d; return getBlob(f); })
    .then(function (b) {
      if (!b) throw new Error('missing');
      return uniqueName(dirH, nm).then(function (newF) {
        key = f.folder + '/' + newF; WRITING[key] = 1;
        return dirH.getFileHandle(newF, { create: true })
          .then(function (fh) { return fh.createWritable(); })
          .then(function (w) { return w.write(b).then(function () { return w.close(); }); })
          .then(function () { f.fname = newF; f.name = newF; return dirH.removeEntry(oldF).catch(function () {}); });
      });
    })
    .then(function () { if (key) delete WRITING[key]; save(true); return true; })
    .catch(function () { if (key) delete WRITING[key]; f.name = nm; save(true); toast('Renamed here — the folder copy kept its old name ' + oldName); return true; });
}
function attNameField(x, after) {
  var inp = el('input', { class: 'attRen', type: 'text', value: x.f.name, 'aria-label': 'New file name', 'data-no-draft': '1' });
  var done = false;
  function commit() {
    if (done) return; done = true;
    var v = inp.value.trim(); ATT.renaming = null;
    if (!v || v === x.f.name) { attRender(); return; }
    attRename(x, v).then(function () { render(); attRender(); toast('Renamed to ' + x.f.name); });
  }
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commit(); } });
  inp.addEventListener('blur', commit);
  inp.addEventListener('click', function (e) { e.stopPropagation(); });
  setTimeout(function () { inp.focus(); var dot = inp.value.lastIndexOf('.'); inp.setSelectionRange(0, dot > 0 ? dot : inp.value.length); }, 0);
  return inp;
}
function attIconBtn(title, path, run, cls) {
  var b = el('button', { class: 'attIb' + (cls ? ' ' + cls : ''), type: 'button', title: title, 'aria-label': title,
    onClick: function (e) { e.stopPropagation(); run(); } });
  b.appendChild(svg(path, 13, 1.5));
  return b;
}
var ATT_I = { ren: 'M2 10 7.7 4.3l1.9 1.9L3.9 11.9H2zM8.6 3.4l1-1 1.9 1.9-1 1', del: 'M2.5 3.5h7M4.7 3.5V2.3h2.6v1.2M3.5 3.5l.5 6.5h4l.5-6.5', dl: 'M6 1.5v6M3.6 5.6 6 8l2.4-2.4M2 10.5h8' };
function attRender() {
  if (!R || !ATT.open || !RO) return;
  var wrap = R.getElementById('attWrap');
  if (!wrap) {
    wrap = el('div', { class: 'attWrap', id: 'attWrap', onClick: function (e) { if (e.target === wrap) closeAttachments(); } });
    R.appendChild(wrap);
    document.addEventListener('keydown', attKeys, true);
  }
  wrap.innerHTML = '';
  document.documentElement.classList.add('att-open');      /* lifts the RO pane over the header and chat button */
  var list = attList(), all = allFiles();
  var selN = Object.keys(ATT.sel).filter(function (id) { return attFind(id); }).length;
  var box = el('div', { class: 'attBox', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Attachments on RO ' + (RO.roNumber || '') });
  /* header: title, filters, bulk actions */
  var head = el('div', { class: 'attHead' }, [
    el('b', { class: 'attTitle', text: 'Attachments · RO ' + (RO.roNumber || '') }),
    el('span', { class: 'attCount', text: all.length + (all.length === 1 ? ' file' : ' files') }),
    el('div', { class: 'attFilters' }, [['all', 'All'], ['pics', 'Pictures & video'], ['docs', 'Documents']].map(function (f) {
      return el('button', { class: 'attChip' + (ATT.filter === f[0] ? ' on' : ''), type: 'button', text: f[1],
        onClick: function (e) { e.stopPropagation(); ATT.filter = f[0]; ATT.cur = null; attRender(); } });
    })),
    el('span', { class: 'grow' }),
    ATT.cur ? null : el('label', { class: 'attSelAll' }, [
      (function () { var c = el('input', { type: 'checkbox' }); c.checked = list.length > 0 && list.every(function (x) { return ATT.sel[x.f.id]; });
        c.addEventListener('change', function () { list.forEach(function (x) { if (c.checked) ATT.sel[x.f.id] = 1; else delete ATT.sel[x.f.id]; }); attRender(); }); return c; })(),
      el('span', { text: 'Select all' })
    ]),
    selN && !ATT.cur ? el('button', { class: 'attBtn', type: 'button', text: 'Download ' + selN,
      onClick: function (e) { e.stopPropagation(); Object.keys(ATT.sel).map(attFind).filter(Boolean).forEach(function (x, i) { setTimeout(function () { downloadAttachment(x.f); }, i * 350); }); } }) : null,
    selN && !ATT.cur ? el('button', { class: 'attBtn danger', type: 'button', text: 'Delete ' + selN,
      onClick: function (e) { e.stopPropagation(); attDelete(Object.keys(ATT.sel).map(attFind).filter(Boolean)); } }) : null,
    el('button', { class: 'attX', type: 'button', title: 'Close (Esc)', 'aria-label': 'Close', text: '✕', onClick: function (e) { e.stopPropagation(); closeAttachments(); } })
  ]);
  box.appendChild(head);
  if (ATT.cur && attFind(ATT.cur)) box.appendChild(attViewer(attFind(ATT.cur), list));
  else box.appendChild(attGrid(list));
  wrap.appendChild(box);
}
function attGrid(list) {
  var g = el('div', { class: 'attGrid' });
  if (!list.length) { g.appendChild(el('div', { class: 'attEmpty', text: allFiles().length ? 'Nothing of that kind on this RO.' : 'No files on this RO yet. Press + on the Files tab, or drop files into the RO’s folder.' })); return g; }
  list.forEach(function (x) {
    var f = x.f, def = taskDef(x.e.task), on = !!ATT.sel[f.id];
    var thumb = fileCard(f, x.e).querySelector('.fThumb');      /* same thumbnail logic as the Files panel */
    var chk = el('input', { type: 'checkbox', class: 'attChk', 'aria-label': 'Select ' + f.name });
    chk.checked = on;
    chk.addEventListener('click', function (e) { e.stopPropagation(); });
    chk.addEventListener('change', function () { if (chk.checked) ATT.sel[f.id] = 1; else delete ATT.sel[f.id]; attRender(); });
    var name = ATT.renaming === f.id ? attNameField(x) : el('span', { class: 'attName', text: f.name, title: f.name + ' — double-click to rename',
      onDblclick: function (e) { e.stopPropagation(); ATT.renaming = f.id; attRender(); } });
    g.appendChild(el('div', { class: 'attTile' + (on ? ' sel' : ''), role: 'button', tabindex: '0', title: 'Open ' + f.name,
      onClick: function () { ATT.cur = f.id; ATT.renaming = null; attRender(); },
      onKeydown: function (e) { if (e.key === 'Enter' && e.target === e.currentTarget) { ATT.cur = f.id; attRender(); } } }, [
      el('div', { class: 'attThumbBox' }, [thumb, chk]),
      name,
      el('span', { class: 'attMeta' }, [el('span', { text: def.name }), el('span', { class: 'mono', text: bytes(f.size || 0) + (f.ts ? ' · ' + cdTs(f.ts) : '') })]),
      el('div', { class: 'attActs' }, [
        attIconBtn('Rename', ATT_I.ren, function () { ATT.renaming = f.id; attRender(); }),
        attIconBtn('Download', ATT_I.dl, function () { downloadAttachment(f); }),
        attIconBtn('Delete', ATT_I.del, function () { attDelete([x]); }, 'danger')
      ])
    ]));
  });
  return g;
}
function attViewer(x, list) {
  var f = x.f, k = fileKind(f), i = list.findIndex(function (y) { return y.f.id === f.id; });
  var stage = el('div', { class: 'attStage' }, [el('div', { class: 'attLoading', text: 'Opening…' })]);
  if (attPdfUrl) { URL.revokeObjectURL(attPdfUrl); attPdfUrl = null; }
  getBlob(f).then(function (b) {
    stage.innerHTML = '';
    if (!b) { stage.appendChild(el('div', { class: 'attMiss', text: 'This file isn’t in this browser or the RO folder.' })); return; }
    if (k === 'img' || k === 'vid') {
      if (!THUMB_URL[f.id]) THUMB_URL[f.id] = URL.createObjectURL(b);
      stage.appendChild(k === 'img' ? el('img', { class: 'attMedia', src: THUMB_URL[f.id], alt: f.name })
                                    : el('video', { class: 'attMedia', src: THUMB_URL[f.id], controls: '', playsinline: '' }));
    } else if (k === 'pdf') {
      attPdfUrl = URL.createObjectURL(b.type === 'application/pdf' ? b : new Blob([b], { type: 'application/pdf' }));
      stage.appendChild(el('iframe', { class: 'attPdf', src: attPdfUrl, title: f.name }));
    } else if (ATT_TEXT.test(f.type || '') || /\.(txt|csv|json|log|xml|md)$/i.test(f.name || '')) {
      b.text().then(function (t) { stage.appendChild(el('pre', { class: 'attText', text: t.slice(0, 200000) })); });
    } else {
      stage.appendChild(el('div', { class: 'attMiss' }, [el('b', { text: fileExt(f.name) + ' file' }),
        el('span', { text: 'No preview for this kind of file.' }),
        el('button', { class: 'attBtn', type: 'button', text: 'Download', onClick: function (e) { e.stopPropagation(); downloadAttachment(f); } })]));
    }
  });
  var bar = el('div', { class: 'attVBar' }, [
    el('button', { class: 'attBtn', type: 'button', text: '← All files', onClick: function (e) { e.stopPropagation(); ATT.cur = null; ATT.renaming = null; attRender(); } }),
    ATT.renaming === f.id ? attNameField(x) : el('span', { class: 'attVName', text: f.name, title: 'Double-click to rename',
      onDblclick: function (e) { e.stopPropagation(); ATT.renaming = f.id; attRender(); } }),
    el('span', { class: 'attVMeta mono', text: taskDef(x.e.task).name + ' · ' + bytes(f.size || 0) + (f.ts ? ' · ' + cdTs(f.ts) : '') }),
    el('span', { class: 'grow' }),
    el('span', { class: 'attPos mono', text: (i + 1) + ' / ' + list.length }),
    attIconBtn('Previous (←)', 'M7.6 2.4 4 6l3.6 3.6', function () { attStep(-1); }),
    attIconBtn('Next (→)', 'M4.4 2.4 8 6l-3.6 3.6', function () { attStep(1); }),
    attIconBtn('Rename', ATT_I.ren, function () { ATT.renaming = f.id; attRender(); }),
    attIconBtn('Download', ATT_I.dl, function () { downloadAttachment(f); }),
    attIconBtn('Delete (Del)', ATT_I.del, function () { attDelete([x]); }, 'danger')
  ]);
  return el('div', { class: 'attViewer' }, [bar, stage]);
}

/* ---- Files tab: thumbnails ---- */
var THUMB_URL = {};           /* file id -> object URL, made once per session */
function fileExt(name) { var m = /\.([a-z0-9]{1,5})$/i.exec(name || ''); return m ? m[1].toUpperCase() : 'FILE'; }
function fileKind(f) {
  var t = f.type || '', x = fileExt(f.name);
  if (/^image\//.test(t)) return 'img';
  if (/pdf/.test(t) || x === 'PDF') return 'pdf';
  if (/^video\//.test(t)) return 'vid';
  if (/sheet|excel|csv/.test(t) || /^(XLSX?|CSV)$/.test(x)) return 'xls';
  if (/word|document/.test(t) || /^DOCX?$/.test(x)) return 'doc';
  return 'gen';
}
function fileCard(f, entry) {
  var def = taskDef(entry.task), kind = fileKind(f);
  var thumb = el('span', { class: 'fThumb k-' + kind });
  function badge() {
    thumb.innerHTML = '<svg width="30" height="36" viewBox="0 0 30 36" fill="none" aria-hidden="true"><path d="M3 2.5h16l8 8v23H3z" fill="#fff" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M19 2.5v8h8" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>' +
      '<b class="fExt">' + esc(fileExt(f.name)) + '</b>';
  }
  function showImg(url) {
    var img = el('img', { alt: '', loading: 'lazy', decoding: 'async' });
    img.onerror = badge;
    img.src = url;
    thumb.innerHTML = ''; thumb.appendChild(img);
  }
  function showVid(url) {
    var v = el('video', { muted: '', preload: 'metadata', playsinline: '' });
    v.muted = true; v.src = url + '#t=0.5';
    v.onerror = badge;
    thumb.innerHTML = ''; thumb.appendChild(v);
  }
  if ((kind === 'img' || kind === 'vid') && THUMB_URL[f.id]) (kind === 'img' ? showImg : showVid)(THUMB_URL[f.id]);
  else {
    badge();
    if (kind === 'img' || kind === 'vid') {
      thumb.classList.add('loading');
      getBlob(f).then(function (b) {
        thumb.classList.remove('loading');
        if (!b) { thumb.classList.add('missing'); thumb.title = 'Not stored in this browser'; return; }
        THUMB_URL[f.id] = URL.createObjectURL(b);
        (kind === 'img' ? showImg : showVid)(THUMB_URL[f.id]);
      }).catch(function () { thumb.classList.remove('loading'); });
    }
  }
  var dl = el('button', { class: 'fDl', type: 'button', title: 'Download ' + f.name, 'aria-label': 'Download ' + f.name,
    onClick: function (ev) { ev.stopPropagation(); downloadAttachment(f); } });
  dl.innerHTML = IC.download;
  var card = el('div', { class: 'fCard', role: 'button', tabindex: '0', title: 'Open ' + f.name,
    onClick: function (ev) { ev.stopPropagation(); openAttachments(f.id); },
    onKeydown: function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openAttachments(f.id); } } }, [
    thumb,
    f.inFolder ? null : el('span', { class: 'fBrowser', title: 'Only in this browser so far', text: 'BROWSER ONLY' }),
    el('span', { class: 'fName', text: f.name }),
    el('span', { class: 'fMeta' }, [
      el('span', { class: 'fTask', text: def.name + (timesLogged(entry.task) > 1 ? ' ·' + goNumber(entry) : '') }),
      el('span', { class: 'mono', text: bytes(f.size || 0) })
    ]),
    f.ts ? el('span', { class: 'fMeta mono', text: cdTs(f.ts) }) : null,
    dl
  ]);
  return card;
}

function renderRoPanel(key) {
  var body = el('div', { class: 'rtPanelBody rt-' + key });
  var head = el('div', { class: 'rtPanelHead' });
  var closeB = el('button', { class: 'xBtn', type: 'button', title: 'Close', onClick: function (e) { e.stopPropagation(); roTab = null; render(); } }, [svg(ICON.x, 11, 1.8)]);

  function emptyRow(txt) { return el('div', { class: 'rtEmpty', text: txt }); }

  if (key === 'checklist') {
    head.appendChild(el('span', { class: 'rtPanelTitle', text: 'Checklist · task bulletins' }));
    if (!S.log.length) body.appendChild(emptyRow('Nothing logged yet. Use “pick” on the Task Bulletins bar to log a task.'));
    S.log.forEach(function (e) {
      var def = taskDef(e.task), reps = S.log.filter(function (x) { return x.task === e.task; }).length;
      body.appendChild(el('div', { class: 'rtRow' }, [
        tick(e.done, function (ev) { ev.stopPropagation(); e.done = !e.done; e.tickedAt = e.done ? nowIso() : null; save(true); render(); }, 'sm'),
        el('span', { class: 'rtMain', text: def.name + (reps > 1 ? ' ·' + goNumber(e) : '') }),
        el('span', { class: 'rtDim', text: (def.group || '').toLowerCase() }),
        el('span', { class: 'rtDim mono', text: 'logged ' + shortWhen(e.at) }),
        el('span', { class: 'rtDim mono', text: e.done && e.tickedAt ? 'ticked ' + shortWhen(e.tickedAt) : 'open' })
      ]));
    });
  }

  if (key === 'parts') {
    head.appendChild(el('span', { class: 'rtPanelTitle', text: 'Parts on this RO' }));
    var pending = [], lateList = [];
    S.jobs.forEach(function (j) { (j.parts || []).forEach(function (p) {
      if (p.status === 'Ordered' || p.status === 'Backordered') pending.push(p);
      var a = partAging(p); if (a && (a.state === 'late' || a.state === 'noeta')) lateList.push({ j: j, p: p, a: a });
    }); });
    if (pending.length) {
      var mar = el('button', { class: 'xBtn fAll', type: 'button', title: 'Mark all ' + pending.length + ' ordered / backordered parts received',
        'aria-label': 'Mark all ordered parts received', onClick: function (ev) {
          ev.stopPropagation();
          modal({ title: 'Mark ' + pending.length + ' part' + (pending.length === 1 ? '' : 's') + ' received?',
            body: ['Every part that is Ordered or Backordered on this RO becomes Received. Parts not ordered yet stay as they are.'],
            actions: [{ label: 'Cancel' }, { label: 'Mark received', kind: 'primary', run: function () {
              pushUndo('mark parts received');
              pending.forEach(function (p) { p.status = 'Received'; p.statusChangedAt = nowIso(); });
              save(true); render(); tecRender();
              toast(pending.length + ' part' + (pending.length === 1 ? '' : 's') + ' marked received', { label: 'UNDO', run: function () { restoreSnapshot(); } });
            } }] });
        } });
      mar.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1.8 8.6 4.6 11.4 10 5.4M7.4 11.2l.4.2L14.2 4.6"/></svg>';
      head.appendChild(mar);
    }
    if (lateList.length) {
      body.appendChild(el('div', { class: 'rtGroup rtLateHead', text: 'Late or no ETA \u2014 ' + lateList.length }));
      lateList.forEach(function (x) {
        body.appendChild(el('div', { class: 'rtRow late' }, [
          el('span', { class: 'pill', style: 'background:#FDE8E6;color:#B3261E', text: x.p.status }),
          el('span', { class: 'rtMain', text: (x.p.description || 'Unnamed part') }),
          el('span', { class: 'rtDim mono', text: x.p.partNumber || '' }),
          el('span', { class: 'rtDim', text: (x.j.complaint || '').slice(0, 18) }),
          el('span', { class: 'rtDim mono', html: (x.p.eta ? 'ETA ' + esc(x.p.eta) + ' ' : '') + agingBadge(x.p) })
        ]));
      });
    }
    var any = false;
    S.jobs.forEach(function (j, i) {
      if (!(j.parts || []).length) return;
      any = true;
      body.appendChild(el('button', { class: 'rtGroup', type: 'button', onClick: function (ev) { ev.stopPropagation(); gotoJob(j.id); } }, [
        el('span', { class: 'opDotSm', style: 'background:' + jobDotColor(j) }), document.createTextNode(j.complaint || 'Operation ' + (i + 1))]));
      j.parts.forEach(function (p) {
        var ps = PART_STATUS.filter(function (s) { return s.key === p.status; })[0] || PART_STATUS[0];
        var a = partAging(p);
        body.appendChild(el('div', { class: 'rtRow' + (a && (a.state === 'late' || a.state === 'noeta') ? ' late' : '') }, [
          el('span', { class: 'pill', style: 'background:' + (ps.bg || '#EEF2F7') + ';color:' + (ps.fg || '#44566C'), text: p.status }),
          el('span', { class: 'rtMain', text: p.description || 'Unnamed part' }),
          el('span', { class: 'rtDim mono', text: p.partNumber || '' }),
          el('span', { class: 'rtDim mono', text: 'qty ' + (p.qty || '1') }),
          el('span', { class: 'rtDim mono', html: (p.eta ? 'ETA ' + esc(p.eta) : '') + (a && a.state !== 'ok' ? ' ' + agingBadge(p) : '') })
        ]));
      });
    });
    if (!any) body.appendChild(emptyRow('No parts on this RO yet. Press + on the Parts tab to add one to the current operation.'));
  }

  if (key === 'punches') {
    head.appendChild(el('span', { class: 'rtPanelTitle', text: 'Time punches on this RO' }));
    var list = roPunches();
    if (!list.length) body.appendChild(emptyRow('No punches yet. Start an operation’s clock, or press + to add one by hand.'));
    list.forEach(function (p) {
      var j = S.jobs.filter(function (x) { return x.id === p.opId; })[0];
      var ms = (p.stop ? new Date(p.stop) : new Date()) - new Date(p.start);
      body.appendChild(el('button', { class: 'rtRow rtBtnRow' + (p.stop ? '' : ' running'), type: 'button',
        onClick: function (ev) { ev.stopPropagation(); if (j) gotoJob(j.id); } }, [
        el('span', { class: 'opDotSm' + (p.stop ? '' : ' live'), style: 'background:' + (p.stop ? (j ? jobDotColor(j) : 'var(--st-hold)') : 'var(--st-ok)') }),
        el('span', { class: 'rtMain', text: j ? (j.complaint || 'Operation') : 'Operation' }),
        el('span', { class: 'rtDim mono', text: shortWhen(p.start).slice(0, 5) + '  ' + clockOf(p.start) + ' – ' + (p.stop ? clockOf(p.stop) : 'running') }),
        el('span', { class: 'rtDim mono', text: (ms / 3600000).toFixed(2) + 'h' }),
        el('span', { class: 'rtDim rtNote', text: p.notes || (p.startReason || '') })
      ]));
    });
  }

  if (key === 'history') renderHistory(head, body);
  if (key === 'files') {
    head.appendChild(el('span', { class: 'rtPanelTitle', text: 'Files on this RO' }));
    var fl = allFiles();
    if (!fl.length) body.appendChild(emptyRow('No files yet. Press + on the Files tab to attach one, or drop files on a task in the Task Bulletins bar.'));
    else {
      head.appendChild(el('span', { class: 'rtDim', style: 'margin-left:8px', text: fl.length + (fl.length === 1 ? ' file' : ' files') }));
      head.appendChild(el('button', { class: 'attOpenBtn', type: 'button', text: 'Large view', title: 'View, rename and delete files in a large window',
        onClick: function (e) { e.stopPropagation(); openAttachments(null); } }));
      var inF = fl.filter(function (x) { return x.f.inFolder; }).length;
      body.appendChild(folderOn()
        ? el('div', { class: 'fNote ' + (inF === fl.length ? 'ok' : 'warn'), text: inF === fl.length
            ? 'Saved in your data folder under ' + RO_ROOT + '/' + roFolderName(RO) + '/'
            : (fl.length - inF) + ' still copying to your data folder\u2026' })
        : el('div', { class: 'fNote warn', text: 'Stored in this browser only. Connect your data folder (Console \u2192 Your Data) to keep files with the RO.' }));
      if (folderOn() && inF < fl.length) syncFiles();
      var grid = el('div', { class: 'fGrid' });
      fl.forEach(function (x) { grid.appendChild(fileCard(x.f, x.e)); });
      body.appendChild(grid);
      {
        var all = el('button', { class: 'xBtn fAll', type: 'button',
          title: fl.length === 1 ? 'Download this file' : 'Download all ' + fl.length + ' files',
          'aria-label': fl.length === 1 ? 'Download this file' : 'Download all files',
          onClick: function (ev) {
            ev.stopPropagation();
            fl.forEach(function (x, i) { setTimeout(function () { downloadAttachment(x.f); }, i * 350); });
          } });
        all.innerHTML = IC.download;
        head.appendChild(all);
      }
    }
  }
  head.appendChild(el('span', { class: 'grow' }));
  head.appendChild(closeB);
  return el('div', { class: 'rtPanel', onClick: function (e) { e.stopPropagation(); } }, [head, body]);
}
