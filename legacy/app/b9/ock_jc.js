/* Parsec 12.4 — the RO page's operation clock card is the shared one (b9/v124.js); the page hands it its own start,
   stop, stop reason and quoted-hours edit, with its undo and its toasts */
function ockJob(roId, opId) { if (!RO || RO.id !== roId || !S) return null; return S.jobs.filter(function (j) { return j.id === opId; })[0] || null; }
function ockJc(job) {
  var run = runningPunchOf(job), lock = run ? null : opPartLock(job);
  ockRoot(R);
  var w = el('div');
  w.innerHTML = ockHtml(RO.id, job.id, { pg: 'jc', hr: 'jc', can: true, lock: lock ? lockLine(lock) : '', editQ: true });
  return w.firstElementChild || w;
}
OCK_CB.jc = {
  pre: function () { try { closeStopPop(); } catch (e) {} try { pxClosePop(); } catch (e) {} },
  start: function (roId, opId) { var job = ockJob(roId, opId); if (job && !myRunOf(job)) toggleJobClock(job); },   /* Parsec 12.7: your own clock */
  stop: function (roId, opId) {
    var job = ockJob(roId, opId); if (!job || !myRunOf(job)) return;
    var undoIt = { label: 'UNDO', run: function () { closeStopPop(); restoreSnapshot(); } };
    pushUndo('stop punch');
    stopClock();
    save(true); render();
    toast('Clock stopped — burnt is now ' + fx(job.burnt) + ' h', undoIt);
  },
  reason: function (roId, opId, pid, r) {
    var job = ockJob(roId, opId); pushUndo('stop reason');
    var res = ockSetReason(pid, r);
    save(true); tecRender(); render();
    if (res && res !== true && job) setTimeout(function () { opCompleteGate(job); }, 60);
    else if (res) toast('Stop reason: ' + r);
  },
  editQ: function (cell, roId, opId) {
    var job = ockJob(roId, opId), b = cell && cell.querySelector('b'); if (!job || !b || b.querySelector('input')) return;
    var q = num(job.quoted), inp = el('input', { class: 'px-input ock-qin', value: q > 0 ? q.toFixed(2) : '', inputmode: 'decimal', 'aria-label': 'Quoted hours' });
    b.innerHTML = ''; b.appendChild(inp); inp.focus(); inp.select();
    var done = false;
    function commit(keep) { if (done) return; done = true; var v = num(inp.value); if (keep && v !== q) { pushUndo('quoted hours'); job.quoted = v ? String(v) : ''; save(true); } render(); }
    inp.addEventListener('keydown', function (ev) { ev.stopPropagation(); if (ev.key === 'Enter') { ev.preventDefault(); commit(true); } else if (ev.key === 'Escape') { ev.preventDefault(); commit(false); } });
    inp.addEventListener('blur', function () { commit(true); });
  }
};
