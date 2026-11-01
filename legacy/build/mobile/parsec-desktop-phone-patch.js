/* ============================== Parsec Mobile 2 — phone clock time and part statuses ==============================
   HOW TO ADD IT: open Parsec.html in a text editor (Notepad is fine), search for the line
       var PSY = null;
   (it appears once), paste this whole block on the line just ABOVE it, save, and reopen Parsec.
   What it adds to Phone sync → Get from phone:
     · clock time started and stopped on the phone lands as time entries (punches) on the right operation,
       and the operation's burnt time goes up with it;
     · part statuses changed on the phone (Ordered, Received, Installed …) update the part here.
   Everything else Parsec Mobile sends (operations, notes, parts, edits, stage steps) already worked.
   Time that overlaps time already on this computer is left out and stays on the phone marked "Not taken". */
(function () {
  if (typeof mobApply !== 'function' || typeof STATE === 'undefined') return;
  var base = mobApply;
  var PST = ['Not Ordered', 'Ordered', 'Backordered', 'Received', 'Installed'];
  mobApply = function (b) {
    var r = base(b);                                   /* operations, notes, parts, edits, stage steps */
    if (!r || !r.ok || !b || !Array.isArray(b.ch)) return r;
    if (!Array.isArray(STATE.mobTickIds)) STATE.mobTickIds = [];
    var dn = {}; STATE.mobTickIds.forEach(function (id) { dn[id] = 1; });
    var have = {}; STATE.punches.forEach(function (p) { have[p.id] = 1; });
    var todo = b.ch.filter(function (x) { return x && typeof x.id === 'string' && !dn[x.id] && (x.k === 'time' || x.k === 'pstat'); })
      .sort(function (a, c) { return String(a.at || '').localeCompare(String(c.at || '')); });
    if (!todo.length) return r;
    if (typeof syncAllBurnt === 'function') syncAllBurnt();   /* settle typed burnt first so new time adds on top */
    var extra = 0, clash = 0, undone = true;
    todo.forEach(function (x) {
      var ro = getRO(x.roId); if (!ro || ro.id === SHOP_RO_ID || roIsDone(ro)) return;
      var op = (ro.operations || []).filter(function (o) { return o.id === x.opId; })[0]; if (!op) return;
      if (x.k === 'time') {
        var s = new Date(x.s), e = new Date(x.e);
        if (isNaN(s) || isNaN(e) || e <= s || e - s > 16 * 3600000) return;
        if (!have[x.id]) {
          if (typeof punchClash === 'function' && punchClash(null, s.getTime(), e.getTime())) { clash++; return; }
          if (undone) { pushUndo('changes from the phone'); undone = false; }
          STATE.punches.push({ id: x.id, roId: ro.id, opId: op.id, start: s.toISOString(), stop: e.toISOString(),
            startReason: (typeof START_REASONS !== 'undefined' && START_REASONS.indexOf(x.r) > -1) ? x.r : 'Repairing',
            stopReason: x.sr || null, notes: '', manual: true, fromPhone: true, burntCredited: true,
            by: x.by || (typeof punchByName === 'function' ? punchByName() : '') });
          have[x.id] = 1;
        }
      } else {
        if (PST.indexOf(x.st) < 0) return;
        var list = typeof opRealParts === 'function' ? opRealParts(op) : (op.parts || []);
        var d = String(x.d || '').trim().slice(0, 60), pn = String(x.pn || '').trim();
        var p = list.filter(function (q) { return String(q.partNumber || '').trim() === pn && String(q.description || '').trim().slice(0, 60) === d; })[0] || null;
        if (!p && !x.pid && typeof x.i === 'number' && x.i > -1) p = list[x.i] || null;
        if (!p) return;
        if (undone) { pushUndo('changes from the phone'); undone = false; }
        p.status = x.st; p.statusChangedAt = typeof x.at === 'string' ? x.at : nowIso();
      }
      STATE.mobTickIds.push(x.id); dn[x.id] = 1; extra++;
    });
    if (extra) {
      if (typeof syncAllBurnt === 'function') syncAllBurnt();
      if (STATE.mobTickIds.length > 600) STATE.mobTickIds = STATE.mobTickIds.slice(-400);
      r.chg = (r.chg || 0) + extra;
      scheduleSave(true); try { render(); } catch (e) {}
      if (typeof JC !== 'undefined' && JC && JC.rerender) { try { JC.rerender(); } catch (e) {} }
    }
    if (clash && typeof pushToast === 'function') pushToast(clash + ' clock entr' + (clash === 1 ? 'y' : 'ies') + ' from the phone overlap time already here — fix ' + (clash === 1 ? 'it' : 'them') + ' on the phone and sync again.');
    return r;
  };
})();
