var APP = 'Parsec', TOPIC = 'RO page, clock and notes', KEY = 'ip-parsec-149';
var I_TR = '<svg class="v-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"/></svg>';
var I_PN = '<svg class="v-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 2.5l3 3L6 13H3v-3z"/></svg>';
var I_CH = '<svg class="v-chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>';
var CUR = '<span class="v-cur"></span>';
function fs(t, body) { return '<div class="v-fs"><div class="v-fh"><b>' + t + '</b>' + I_CH + '</div><div class="v-fb">' + body + '</div></div>'; }
function fbar() { return '<div class="v-fbar"><span class="v-lnk v-ex">Expand all</span><span>·</span><span class="v-lnk v-co">Collapse all</span></div>'; }
var LUNCH = '<div class="v-card"><b>Lunch time, Luis</b><small>12:00 · on RO 2684 for 1:12 — your clock is still running</small><div class="v-r"><span class="v-b pri">Stop · lunch 30 min</span><span class="v-b">1 hour</span><span class="v-b">Not now</span></div></div>';
var IDEAS = [
  { group: 'The RO page', items: [
    { k: 'below', t: 'Below Operations: only Messages and Customer', why: 'The other seven sections come off the RO page.',
      vis: '<div class="v-st h-l"><div class="v-ro"><div class="v-hd"><b>RO-32684</b><span>Prairie Line Trucking</span></div>' +
        '<div class="v-sec keep"><b>Operations</b><i>2</i><em>Check engine light · Replace outlet NOx sensor</em></div><div class="v-sec keep"><b>Messages about this RO</b></div>' +
        '<div class="v-sec go"><b>Fault codes</b></div><div class="v-sec go"><b>Photos &amp; codes</b></div><div class="v-sec go"><b>Parts on this RO</b></div><div class="v-sec go"><b>Truck history</b></div><div class="v-sec go"><b>Warranty claim</b></div>' +
        '<div class="v-sec keep"><b>Customer</b></div><div class="v-sec go"><b>Estimate &amp; approval</b></div><div class="v-sec go"><b>Ready to close</b></div></div>' +
        '<span class="v-note">7 gone · Messages and Customer stay</span></div>',
      steps: [['all', 1200], ['mark', 1300], ['gone', 900], ['hold', 1900]],
      opts: [['gone', 'Remove them', 'what they did stays on its own page — Parts, Warranty, Assets, the op’s Parts tab'], ['hdr', 'Remove, the header counts open them', 'parts 1/1, files, history open a side panel'], ['more', 'Remove, keep a “More” link', 'one line under Customer opens the rest']] },
    { k: 'fold', t: 'Expand all · Collapse all — no more hover', why: 'Pointing at a heading does nothing; two links do it all.',
      vis: '<div class="v-st">' + fbar() + fs('Messages about this RO', '<div class="v-msg"><span class="v-av">FD</span>Truck’s in bay 11 — start after 1 pm</div>') + fs('Customer', '<div class="v-kv"><span>Prairie Line Trucking</span><span>Dana · 336-555-0142</span></div>') +
        '<span class="v-note v-nohov">Pointing does nothing now</span>' + CUR + '</div>',
      steps: [['idle', 800], ['hov', 1400], ['p-co', 600], ['c-co', 400], ['shut', 1000], ['p-ex', 600], ['c-ex', 1300]],
      opts: [['links', 'Two links above the sections', 'Expand all · Collapse all'], ['one', 'One switch', 'Collapse all ⇄ Expand all'], ['menu', 'In a ⋯ beside the first heading', '']] },
    { k: 'right', t: 'The right pane’s groups too', why: 'Schedule, People, Vehicle and Money also stop opening on hover.',
      vis: '<div class="v-st h-l"><div class="v-pane">' + fbar() + fs('Schedule', 'Ready about Tue 8:16 AM') + fs('People', 'Luis Martinez · Technician') + fs('Vehicle', 'VNL 760 · Bay 11 · Key 77') + fs('Money', '$1,115.00 · approved') + '</div>' +
        '<div class="v-side">The truck card and the stage stay as they are.</div>' + CUR + '</div>',
      steps: [['idle', 900], ['p-co', 600], ['c-co', 400], ['shut', 1100], ['p-ex', 600], ['c-ex', 1300]],
      opts: [['same', 'Same there — its own Expand all · Collapse all', ''], ['nohov', 'Hover off there, no links', 'each group opens from its heading'], ['keep', 'Leave the right pane as it is', 'hover stays there']] }
  ]},
  { group: 'The clock — reminders only', items: [
    { k: 'lunch', t: 'Lunch: a reminder, nothing stops', why: 'Today at 12:00 the clock stops itself, clocks you out and starts again at 12:30.',
      vis: '<div class="v-st h-s"><div class="v-tl"><div class="v-trk"><i class="v-job"></i><span class="v-noon"><em>12:00 lunch</em></span></div><div class="v-ax"><span>07</span><span>09</span><span>11</span><span>13</span><span>15</span></div></div><span class="v-pill">On the clock · RO 2684</span>' +
        LUNCH + '<span class="v-note">Not now — the clock keeps running</span>' + CUR + '</div>',
      steps: [['run', 900], ['noon', 900], ['card', 1300], ['p-nn', 600], ['c-nn', 400], ['keep', 1700]],
      opts: [['shop', 'At the shop’s lunch time', '12:00, set on the Manager page'], ['four', 'After 4 hours on the clock', ''], ['both', 'Whichever comes first', '']] },
    { k: 'eod', t: 'End of day: stopping a job doesn’t clock you out', why: 'Stopping as End of day or Lunch keeps the day clock on and asks instead.',
      vis: '<div class="v-st"><div class="v-sp"><small>Stop RO 2684 · Op 1 as</small><span class="v-ch">Hold tech</span><span class="v-ch v-eod">End of day</span><span class="v-ch">Lunch</span><span class="v-ch">Switched job</span></div>' +
        '<div class="v-pls"><span class="v-pill v-p1">On the clock · RO 2684 · 1:48</span><span class="v-pill v-p2">On the clock · not on a job</span></div>' +
        '<div class="v-card"><b>Clock out for the day?</b><small>Op 1 stopped as End of day at 15:28</small><div class="v-r"><span class="v-b pri">Clock out now</span><span class="v-b">Not yet</span></div></div>' +
        '<span class="v-note v-was">Before: this clocked you out by itself</span>' + CUR + '</div>',
      steps: [['idle', 900], ['p-eod', 600], ['c-eod', 400], ['stopped', 1000], ['card', 2000]],
      opts: [['ask', 'Ask right when the job stops', 'Clock out now · Not yet'], ['late', 'Only the “Still on the clock?” card', '20 min after the shift ends'], ['both', 'Both', '']] },
    { k: 'snooze', t: 'When you say Not now', why: 'Lunch and end-of-day reminders come back on their own.',
      vis: '<div class="v-st h-s"><span class="v-clk"><span class="t1">12:00</span><span class="t2">12:15</span></span>' +
        '<div class="v-card"><b>Lunch time, Luis</b><small class="v-again"><span class="t1">12:00 · on RO 2684 for 1:12</span><span class="t2">Asked again at 12:15 · on RO 2684 for 1:27</span></small><div class="v-r"><span class="v-b pri">Stop · lunch 30 min</span><span class="v-b">1 hour</span><span class="v-b">Not now</span></div></div>' +
        '<span class="v-note">It asks again at 12:15</span>' + CUR + '</div>',
      steps: [['card', 1100], ['p-nn', 600], ['c-nn', 400], ['wait', 1500], ['again', 1800]],
      opts: [['15', 'Ask again in 15 min', ''], ['30', 'Ask again in 30 min', ''], ['once', 'Ask once a day', '']] }
  ]},
  { group: 'Time entries', items: [
    { k: 'del', t: 'Delete a time entry — it turns into air', why: 'The minutes stay on the clock, as air, and say what was there.',
      vis: '<div class="v-st"><div class="v-trk2"><span class="v-bk" style="left:3%;width:30%">7156</span><span class="v-bk b2 del" style="left:34%;width:28%"><span class="l1">2253</span><span class="l2">air · deleted</span></span><span class="v-bk" style="left:64%;width:32%">7156</span></div>' +
        '<div class="v-rows"><div class="v-row"><span class="t">07:10 – 09:30</span><span class="d">2:20</span><span class="w"><b>7156</b>Clutch slipping</span><span class="x"></span></div>' +
        '<div class="v-row v-r2"><span class="t">09:30 – 11:58</span><span class="d">2:28</span><span class="w v-w1"><b>2253</b>Water pump leak</span><span class="w v-w2">Air — deleted 2253 · Wrong job or RO</span><span class="x"><i class="v-trash">' + I_TR + '</i></span></div>' +
        '<div class="v-row"><span class="t">12:30 – 14:52</span><span class="d">2:22</span><span class="w"><b>7156</b>Road tested</span><span class="x"></span></div></div>' +
        '<div class="v-why"><small>Why delete it?</small><span class="v-ch v-c1">Wrong job or RO</span><span class="v-ch">Added by mistake</span><span class="v-ch">Other…</span></div>' + CUR + '</div>',
      steps: [['idle', 800], ['hov', 900], ['c-del', 400], ['why', 1000], ['c-why', 400], ['air', 1900]],
      opts: [['row', 'A trash button on every entry · asks why', 'the Time Log and the RO page Time tab'], ['undo', 'A trash button on every entry · Undo, no question', ''], ['edit', 'Delete inside Edit only', 'as now, but the gap becomes air']] },
    { k: 'airwhy', t: 'A reason for air, as a note', why: 'Where the time went when there was no work.',
      vis: '<div class="v-st"><div class="v-trk2"><span class="v-bk" style="left:3%;width:38%">7156</span><span class="v-bk air" style="left:42%;width:14%"></span><span class="v-bk b2" style="left:57%;width:38%">2253</span></div>' +
        '<span class="v-airtip">Air · 0:32 · Waiting on parts</span>' +
        '<div class="v-rows"><div class="v-row"><span class="t">07:10 – 10:40</span><span class="d">3:30</span><span class="w"><b>7156</b>Clutch slipping</span><span class="x"></span></div>' +
        '<div class="v-row v-air"><span class="t">10:40 – 11:12</span><span class="d">0:32</span><span class="w v-a1"><i class="v-sw"></i><b>Air</b> — on the clock, not on a job</span><span class="w v-a2"><i class="v-sw"></i><b>Air</b> · Waiting on parts<i class="v-nt">note</i></span><span class="x"><span class="v-b v-add">+ Reason</span></span></div></div>' +
        '<div class="v-chips"><small>Why was there no work?</small><span class="v-ch v-c-p">Waiting on parts</span><span class="v-ch">No work assigned</span><span class="v-ch">Waiting on the foreman</span><span class="v-ch">Cleaning up</span><span class="v-ch">Meeting</span><span class="v-ch">Other…</span></div>' + CUR + '</div>',
      steps: [['idle', 800], ['p-add', 600], ['c-add', 400], ['chips', 1000], ['c-pick', 400], ['done', 2000]],
      opts: [['chips', 'Quick reasons + your own words', 'shows on the day, the Shop view and the day report'], ['text', 'Just a note box', ''], ['must', 'Quick reasons, asked for air over 20 min', 'a line in Fix these until it has one']] }
  ]},
  { group: 'Operation notes', items: [
    { k: 'note', t: 'Edit or delete a note that isn’t on a punch', why: 'Cause, Correction and notes added off the clock, on the RO page Time tab.',
      vis: '<div class="v-st"><div class="v-tl2"><div class="v-pr"><small>3:10 am</small><i class="v-dt"></i>Started · Repairing · Luis</div>' +
        '<div class="v-tn"><small>3:29 am</small><span class="v-tx"><em>Cause</em><span class="v-t1">SPN 3226 FMI 2 active, outlet reading erratic.</span><span class="v-t2">SPN 3226 FMI 2 active — outlet reading erratic against the inlet sensor</span></span><span class="v-tag">edited</span><span class="v-ac"><i class="v-ed">' + I_PN + '</i><i class="v-dl">' + I_TR + '</i></span></div>' +
        '<div class="v-pr"><small>3:50 am</small><i class="v-dt" style="background:var(--ink3)"></i>Stopped · Switched job · 0:40</div></div>' +
        '<span class="v-toast">Note deleted <b>Undo</b></span>' + CUR + '</div>',
      steps: [['idle', 700], ['hov', 700], ['c-ed', 400], ['edit', 1400], ['saved', 900], ['p-dl', 500], ['c-dl', 400], ['gone', 1600]],
      opts: [['hover', 'Pencil and trash when you point at it', 'a ⋯ on a phone · Undo after a delete'], ['menu', 'A ⋯ menu on each note', ''], ['click', 'Click the text to edit, trash at the end', '']] },
    { k: 'who', t: 'Who can change a note', why: 'The note keeps who wrote it and who changed it.',
      vis: '<div class="v-st"><div class="v-who"><span class="v-wl"><b>Frank</b> · Foreman</span>' +
        '<div class="v-tn"><small>3:29 am</small><span class="v-tx"><em>Cause</em>SPN 3226 FMI 2 active · Luis</span><span class="v-ac"><i class="v-ed">' + I_PN + '</i><i class="v-dl">' + I_TR + '</i></span></div>' +
        '<span class="v-wl"><b>Mike</b> · Technician</span>' +
        '<div class="v-tn v-off"><small>3:29 am</small><span class="v-tx"><em>Cause</em>SPN 3226 FMI 2 active · Luis</span><span class="v-ac"><i class="v-ed">' + I_PN + '</i><i class="v-dl" style="opacity:.35">' + I_TR + '</i></span></div></div>' +
        '<span class="v-wtip v-wt1">Edit the note</span><span class="v-wtip v-wt2">Only Luis or a foreman can change Luis’s note</span>' + CUR + '</div>',
      steps: [['a', 1600], ['b', 2000]],
      opts: [['writer', 'The writer, the foreman and the manager', ''], ['anyone', 'Anyone who can edit the RO', ''], ['own', 'Only the writer', '']] }
  ]}
];
var NOW = '<div class="v-now"><div><b>10</b>sections below Operations today — 2 stay</div><div><b>12:00</b>the clock stops itself, clocks you out, and starts again at 12:30</div><div><b>2</b>stop reasons clock you out of the day — End of day and Lunch</div><div><b>0</b>marks where a deleted entry was — Delete is inside Edit</div><div><b>0</b>notes on air rows</div><div><b>0</b>ways to change a note that isn’t on a punch</div></div>';
