/* Parsec · ro · assist.js
   The RO assist strip: the next step, burnt vs quoted, the story so far (raNext / raStory) — shown on the Triage and Technician panes.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   raOps raLive raN raCcc raNext raTabBody raBurnt raStory RA_TABS RA_PST (8 functions, 2 constants)
   state      punches
   uses       access/ automations/ import/ kit/ pages/ pages/fixes/ pages/warranty/ state/
*/
/* ============================== RO ASSIST ==============================
   Sits above the job console on the Repair Orders page: a next-step banner, six tool tabs
   (Checks, Parts, Approval, Contacts, Story, Fixes) and a sticky money bar at the foot. */
var RA_TABS = [["checks","Checks"],["parts","Parts"],["appr","Approval"],["contacts","Contacts"],["story","Story"],["fixes","Fixes"]];
var RA_PST = pxPartKeys();
function raOps(ro){ return (ro.operations || []).filter(function(o){ return o && o.id; }); }
function raLive(ro){ return raOps(ro).filter(function(o){ return !o.declined; }); }
function raN(ro, op){ return raOps(ro).indexOf(op) + 1; }
function raCcc(op){
  return { c: !!String(op.complaint || "").trim(), ca: !!opStory(op, "cause"), co: !!opStory(op, "fix") };
}
function raNext(ro){
  var st = roStatus(ro).status, live = raLive(ro), f = null; try{ f = roForecast(ro); }catch(e){}
  var parts = []; live.forEach(function(op){ opRealParts(op).forEach(function(p){ parts.push({ op: op, p: p }); }); });
  var ready = f && f.likely && !f.ready ? 'Ready about ' + fmtDateLong(f.likely.toISOString()) + ' ' + fmtTime(f.likely.toISOString()) : '';
  var R = function(tone, txt, btn){ return { tone: tone, txt: txt, btn: btn || '', ready: ready }; };
  /* Parsec 14: an operation the customer hasn't approved isn't Parts' to order yet (the Parts page's own rule) */
  var needAppr = function(op){ return !op.appr && +op.quoted > 0 && ["WARR","RECALL"].indexOf(opJobType(op)) < 0; };
  var rtOn = typeof rtNeeded !== "function" || rtNeeded(ro);
  var relBtn = '<button class="btn btn-primary btn-sm" data-action="triage-release" data-ro="'+ro.id+'">Release</button>';
  if(!raOps(ro).length) return R('hold', 'Add the first operation.');
  if(st === "Complete – Released") return R('good', 'Released ' + fmtDate(ro.status && ro.status.setAt) + '. Nothing left to do.');
  if(st === "Declined") return R('hold', 'Declined by the customer. Nothing to do unless they change their mind.');
  if(st === "Complete – Road test") return R('good', rtNeeded(ro) ? 'Road test done — release the truck.' : 'Work done — release the truck.', relBtn);
  if(st === "Waiting – Customer"){
    var ag = ageSince(ro.status && ro.status.setAt);
    return R(ag > 24 * 3600000 ? 'bad' : 'teal', 'Waiting on the customer — estimate sent ' + ageText(ag) + ' ago.', '<button class="btn btn-sm" data-action="ra-tab" data-k="contacts">Log a call</button><button class="btn btn-sm" data-action="ra-tab" data-k="appr">Approval</button>');
  }
  var open = live.filter(function(op){ return !opDoneNow(op); });
  var unap = open.filter(needAppr);
  if(unap.length && st !== "Working") return R('teal', unap.length + ' operation' + (unap.length === 1 ? '' : 's') + ' not approved yet — send the estimate' + (unap.length < open.length ? ' (the approved ones can go ahead)' : '') + '.', '<button class="btn btn-sm btn-primary" data-action="triage-est-sent" data-ro="'+ro.id+'">Estimate sent</button><button class="btn btn-sm" data-action="ra-tab" data-k="appr">Approval</button>');
  var bo = parts.filter(function(x){ return x.p.status === "Backordered"; });
  if(bo.length) return R('bad', 'Backordered: ' + bo.map(function(x){ return (x.p.description || x.p.partNumber) + (x.p.eta ? ' (ETA ' + x.p.eta + ')' : ''); }).join(', ') + '.', '<button class="btn btn-sm" data-action="ra-tab" data-k="parts">Parts</button>');
  var no = parts.filter(function(x){ return (!x.p.status || x.p.status === "Not Ordered") && !needAppr(x.op) && !opDoneNow(x.op); });
  if(no.length) return R('warn', 'Order ' + no.length + ' part' + (no.length === 1 ? '' : 's') + ' — ' + no.slice(0, 3).map(function(x){ return x.p.description || x.p.partNumber; }).join(', ') + (no.length > 3 ? '…' : '') + '.', '<button class="btn btn-sm" data-action="ra-tab" data-k="parts">Parts</button>');
  if(open.some(function(op){ return !needAppr(op); }) && !ro.assignedTech){ var fm = ""; try{ fm = rtPerson("foreman") || ""; }catch(e){}
    return R('warn', 'Approved and nobody on it — assign a tech' + (fm ? ' (' + String(fm).split(" ")[0] + ')' : '') + '.'); }
  var out = parts.filter(function(x){ return x.p.status === "Ordered"; });
  if(out.length && live.every(function(op){ return opDoneNow(op) || opRealParts(op).some(function(p){ return p.status === "Ordered"; }); }))
    return R('warn', 'Waiting on ' + out.length + ' part' + (out.length === 1 ? '' : 's') + (out.filter(function(x){ return x.p.eta; }).length ? ' — next ETA ' + out.map(function(x){ return x.p.eta; }).filter(Boolean).sort()[0] : '') + '.');
  var gap = live.filter(function(op){ var c = raCcc(op); return opDoneNow(op) && (!c.ca || !c.co); })[0];
  if(gap) return R('warn', 'Write the story for Op ' + raN(ro, gap) + ' — ' + (raCcc(gap).ca ? 'correction' : 'cause') + ' missing.', '<button class="btn btn-sm" data-action="ra-tab" data-k="checks">Checks</button>');
  if(live.length && live.every(opDoneNow)) return rtOn ? R('good', 'All operations done — road test, then release.') : R('good', 'All operations done — no road test on this one: release the truck.', relBtn);
  var nx = open[0];
  return R('info', 'Keep going: Op ' + raN(ro, nx) + ' — ' + (nx.complaint || 'operation') + '.');
}
function raTabBody(ro, k){
  var ops = raOps(ro), live = raLive(ro);
  var opHd = function(op){ return '<span class="ra-op"><b class="mono">Op '+raN(ro, op)+'</b><span>'+esc(op.complaint || 'Operation')+'</span></span>'; };
  if(k === "checks"){
    return '<div class="ra-rows">' + live.map(function(op){ var c = raCcc(op), g = opCompleteGaps(op).concat(opNoteGaps(op));
      var ck = function(ok, t){ return '<span class="ra-ck '+(ok ? 'ok' : 'no')+'">'+(ok ? '✓' : '✕')+' '+t+'</span>'; };
      return '<div class="ra-row">' + opHd(op) + '<span class="ra-cks">' + ck(c.c, 'Complaint') + ck(c.ca, 'Cause') + ck(c.co, 'Correction') + ck(!g.length, g.length ? g.map(function(x){ return x.t; }).join(' · ') : 'Ready to close') + '</span>'
        + '<button class="btn btn-sm" data-action="ra-goop" data-ro="'+ro.id+'" data-op="'+op.id+'">Open</button></div>'; }).join('') + '</div>' + (live.length ? '' : '<p class="hint">No live operations.</p>');
  }
  if(k === "parts"){
    var cols = RA_PST.map(function(s){ return { s: s, l: [] }; });
    live.forEach(function(op){ opRealParts(op).forEach(function(p){ var i = Math.max(0, RA_PST.indexOf(p.status || "Not Ordered")); cols[i].l.push({ op: op, p: p }); }); });
    if(!cols.some(function(c){ return c.l.length; })) return '<p class="hint">No parts on this RO.</p>';
    return '<div class="ra-kan">' + cols.map(function(c, ci){ return '<div class="ra-col'+(c.s === "Backordered" && c.l.length ? ' bad' : '')+'"><div class="ra-ch"><b>'+c.s+'</b><span class="mono">'+c.l.length+'</span></div>'
      + c.l.map(function(x){ var p = x.p; return '<div class="ra-pt"><span class="ra-pd">'+esc(p.description || p.partNumber)+'</span><span class="ra-pm mono">Op '+raN(ro, x.op)+(p.partNumber ? ' · '+esc(p.partNumber) : '')+(p.eta ? ' · ETA '+esc(p.eta) : '')+(p.qty && p.qty !== "1" ? ' · ×'+esc(p.qty) : '')+'</span>'
        + '<span class="ra-pa">' + (ci > 0 ? '<button class="ra-mv" data-action="ra-part" data-d="-1" data-ro="'+ro.id+'" data-op="'+x.op.id+'" data-pt="'+p.id+'" title="Back to '+RA_PST[ci - 1]+'">←</button>' : '')
        + (ci < RA_PST.length - 1 ? '<button class="ra-mv" data-action="ra-part" data-d="1" data-ro="'+ro.id+'" data-op="'+x.op.id+'" data-pt="'+p.id+'" title="Move to '+RA_PST[ci + 1]+'">'+RA_PST[ci + 1]+' →</button>' : '') + '</span></div>'; }).join('') + '</div>'; }).join('') + '</div>';
  }
  if(k === "appr"){
    var tot = { ok: 0, no: 0, open: 0 };
    var rows = ops.map(function(op){ var m = opMoney(op).total, a = op.appr && op.appr.s, w = ["WARR","RECALL"].indexOf(opJobType(op)) > -1;
      if(op.declined) tot.no += m; else if(a || w) tot.ok += m; else tot.open += m;
      var b = function(s, t){ return '<button class="ra-ap'+(a === s ? ' on '+s : '')+'" data-action="ra-appr" data-s="'+s+'" data-ro="'+ro.id+'" data-op="'+op.id+'">'+t+'</button>'; };
      return '<div class="ra-row'+(op.declined ? ' declined' : '')+'">' + opHd(op) + '<span class="mono ra-m">'+money(m)+'</span>'
        + (w ? '<span class="ra-ck ok">Warranty — no approval needed</span>' : '<span class="ra-aps">' + b('ok', 'Approve') + b('part', 'Partly') + b('no', 'Decline') + '</span>')
        + '<span class="hint ra-who">'+(op.appr ? esc((op.appr.by || '') + ' · ' + fmtDate(op.appr.at) + ' ' + fmtTime(op.appr.at)) : '')+'</span></div>'; }).join('');
    return '<div class="ra-sum"><span>Approved <b class="mono">'+money(tot.ok)+'</b></span><span>Open <b class="mono">'+money(tot.open)+'</b></span><span>Declined <b class="mono">'+money(tot.no)+'</b></span><button class="btn btn-sm" data-action="ra-appr-all" data-ro="'+ro.id+'">Approve all open</button></div><div class="ra-rows">' + rows + '</div>';
  }
  if(k === "contacts"){
    var L = ro.contacts || [];
    return '<div class="ra-cf"><select id="ra-ck"><option>Call</option><option>Text</option><option>Email</option><option>In person</option></select>'
      + '<select id="ra-co"><option>Approved</option><option>Declined</option><option>Left voicemail</option><option>No answer</option><option>Update given</option><option>Will call back</option></select>'
      + '<input id="ra-cn" placeholder="Note, e.g. approved $2,184 for ops 1–2" autocomplete="off"><button class="btn btn-primary btn-sm" data-action="ra-contact" data-ro="'+ro.id+'">Log</button></div>'
      + (L.length ? '<div class="ra-rows">' + L.slice().reverse().map(function(c){ return '<div class="ra-row ra-cl"><span class="mono hint">'+fmtDate(c.at)+' '+fmtTime(c.at)+'</span><b>'+esc(c.kind)+'</b><span class="ra-ck '+(/Approved|Update/.test(c.out) ? 'ok' : /Declined/.test(c.out) ? 'no' : 'mid')+'">'+esc(c.out)+'</span><span>'+esc(c.note || '')+'</span><span class="hint">'+esc(c.by || '')+'</span><button class="ra-x" data-action="ra-contact-del" data-ro="'+ro.id+'" data-id="'+c.id+'" title="Remove">✕</button></div>'; }).join('') + '</div>' : '<p class="hint">No contact logged yet.</p>');
  }
  if(k === "story"){
    return '<div class="ra-story"><textarea id="ra-st" readonly rows="10">'+esc(raStory(ro))+'</textarea><div class="ra-sa"><button class="btn btn-primary btn-sm" data-action="ra-copy">Copy story</button><span class="hint">Complaint, cause and correction for every live operation, from its fields, log and punch notes.</span></div></div>';
  }
  if(k === "fixes"){
    var any = false;
    var h = live.map(function(op){ var src = fixSourceFor(ro, op).slice(0, 2); if(!src.length) return ''; any = true;
      return '<div class="ra-fx">' + opHd(op) + src.map(function(x){ var pm = opMoney(x.op), pc = opRealParts(x.op).length;
        return '<div class="ra-fc"><span class="ra-fh"><b class="mono">'+esc(roLabel(x.ro))+'</b><span class="hint">'+fmtDate(fixDateOf(x.ro, x.op))+(x.same ? ' · same engine' : '')+'</span></span>'
          + '<span class="ra-ft">'+esc(opStory(x.op, 'fix') || opStory(x.op, 'cause') || '—')+'</span>'
          + '<span class="ra-fn mono">'+fmtDec(+x.op.quoted || 0)+' h quoted · '+fmtDec(raBurnt(x.op))+' h burnt · '+pc+' part'+(pc === 1 ? '' : 's')+' · '+money(pm.total)+'</span>'
          + '<button class="btn btn-sm" data-action="ra-fix-use" data-ro="'+ro.id+'" data-op="'+op.id+'" data-sro="'+x.ro.id+'" data-sop="'+x.op.id+'">Use this</button></div>'; }).join('') + '</div>'; }).join('');
    return any ? h : '<p class="hint">No past fixes match these complaints yet.</p>';
  }
  return '';
}
/* burnt hours include a clock that is running now (op.burnt only updates when a clock stops) */
function raBurnt(op){ try{ return opCalc(op).burntHrs || 0; }catch(e){ return +op.burnt || 0; } }
function raStory(ro){
  return raLive(ro).map(function(op){
    var notes = STATE.punches.filter(function(p){ return p.opId === op.id && String(p.notes || '').trim(); }).map(function(p){ return noteEntries(p.notes).map(function(n){ return n.text.trim(); }).filter(Boolean).join(' '); }).filter(Boolean);   /* no time stamps in the story */
    var cause = opStory(op, 'cause'), fix = opStory(op, 'fix');
    var parts = opRealParts(op).map(function(p){ return (p.qty && p.qty !== "1" ? p.qty + ' x ' : '') + (p.description || '') + (p.partNumber ? ' (' + p.partNumber + ')' : ''); });
    var codes = (typeof opFaultCodes === 'function' ? opFaultCodes(op) : []);
    return 'OP ' + raN(ro, op) + ' — ' + opJobType(op) + '\n'
      + 'COMPLAINT: ' + sentenceCase(String(op.complaint || '').trim() || '—') + '\n'
      + 'CAUSE: ' + (cause || (codes.length ? 'Fault codes ' + codes.join(', ') + '. ' : '') + (notes[0] || '—')) + '\n'
      + 'CORRECTION: ' + (fix || (notes.length > 1 ? notes.slice(1).join(' ') : '—')) + '\n'
      + (parts.length ? 'PARTS: ' + parts.join('; ') + '\n' : '')
      + 'TIME: ' + fmtDec(raBurnt(op)) + ' h actual / ' + fmtDec(+op.quoted || 0) + ' h quoted';
  }).join('\n\n');
}
