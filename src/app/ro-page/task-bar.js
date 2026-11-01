/* Parsec · ro-page · task-bar.js
   Clock-string parsing for the time fields and the punch story builder.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   parseClockStr applyClockToTimestamp timesLogged goNumber pgEntryFor composePunchStory pickOpen soloJob ICON_STORY OFF_DRAFTS (6 functions, 4 constants)
   uses       kit/
*/
/* ============================ render: task bar ============================ */

var pickOpen = -1;          /* which empty box has its picker open (transient, not saved) */
var soloJob = null;         /* "View This Op Only" target job id (transient, not saved) */

/* clock-time text like "7:50:12am" mapped onto an existing timestamp, keeping its date. Seconds are optional on input. */
function parseClockStr(s) {
  if (!s) return null;
  var m = /^(\d{1,2}):?(\d{2})(?::(\d{2}))?\s*([ap])?m?$/i.exec(s.trim());
  if (!m) return null;
  var h = parseInt(m[1], 10), mnt = parseInt(m[2], 10), sec = m[3] ? parseInt(m[3], 10) : 0;
  if (mnt > 59 || sec > 59) return null;
  if (m[4]) { if (h < 1 || h > 12) return null; h = h % 12; if (/p/i.test(m[4])) h += 12; }   /* 7:50pm */
  else if (h > 23) return null;                                                             /* 19:50, 07:27 */
  return { h: h, m: mnt, s: sec };
}
function applyClockToTimestamp(baseMs, str) {
  var parsed = parseClockStr(str);
  if (!parsed) return null;
  var d = new Date(baseMs || Date.now());
  d.setHours(parsed.h, parsed.m, parsed.s, 0);
  return d.getTime();
}
function timesLogged(taskId) { return S.log.filter(function (e) { return e.task === taskId; }).length; }
function goNumber(entry) {
  var n = 0;
  for (var i = 0; i < S.log.length; i++) {
    if (S.log[i].task === entry.task) { n++; if (S.log[i].oid === entry.oid) return n; }
  }
  return 1;
}


/* the latest bulletin entry for a task (attachments are filed under 'pics' and 'report') */
function pgEntryFor(task, create) {
  var es = S.log.filter(function (e) { return e.task === task; });
  if (es.length) return es[es.length - 1];
  if (!create) return null;
  var e = logEntry(task); S.log.push(e); return e;
}

var ICON_STORY = '' + I3H('story', 16, 16) + '';
/* The punch notes, oldest punch first, joined as they were typed \u2014 nothing added. */
function composePunchStory(job) {
  var items = punchesOf(job).map(function (p) { return { t: new Date(p.start).getTime(), s: String(p.notes || '').trim() }; });
  (Array.isArray(job.offNotes) ? job.offNotes : []).forEach(function (n) { items.push({ t: new Date(n.at).getTime(), s: String(n.text || '').trim() }); });
  return items.sort(function (a, b) { return a.t - b.t; }).map(function (x) { return x.s; }).filter(Boolean).join(' ');
}
/* typed-but-unsaved off-clock notes survive a re-render */
var OFF_DRAFTS = {};
