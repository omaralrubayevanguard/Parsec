# Parsec 14 (fork C) — the base bits behind the RO list, Manager, the Ctrl K search and the status window:
# · raNext (the Next card on the RO list's pane and anywhere else it shows): approval before ordering, an approved operation
#   with no tech says "Assign a tech", and an RO that needs no road test goes straight to Release
# · daysOpen: days open counted the way the RO page and the Technician page count them (whole days since it opened)
# · the Ctrl K results and the RO status window draw statuses with pgSt (b9/st14.js) — icon + word, same as every page
# Runs inside build12.py: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.


def _soft(js, a, b, what):
    """replace once when the text is there exactly once — another patch file may have changed the same base code first"""
    c = js.count(a)
    if c != 1:
        LOG.append("v14c: skipped %s (found %d)" % (what, c))
        return js
    return js.replace(a, b)


# ---- raNext ----
_i0 = js.index("function raNext(ro){\n")
_i1 = js.index("\nfunction raTabBody(ro, k){", _i0)
js = js[:_i0] + r"""function raNext(ro){
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
  if(st === "Complete – Road test") return R('good', 'Road test done — release the truck.', relBtn);
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
}""" + js[_i1:]

# ---- days open: whole days since it opened, like the RO page and the Technician page ----
js = rep(js, """function daysOpen(ro){
  if(!ro.dateOpened) return null;
  var a = new Date(ro.dateOpened); a.setHours(0,0,0,0);
  var b = new Date(); b.setHours(0,0,0,0);
  return Math.max(Math.round((b - a) / 86400000), 0);
}""", """function daysOpen(ro){
  if(!ro.dateOpened) return null;
  var a = new Date(ro.dateOpened).getTime(); if(!isFinite(a)) return null;
  return Math.max(0, Math.floor((Date.now() - a) / 86400000));   /* Parsec 14: whole days since it opened — the RO page and the Technician page count the same */
}""")

# ---- Ctrl K: the status as on every page ----
js = _soft(js, "        + '<span class=\"pal-st\">'+pillHtml(st)+'</span>'",
           "        + '<span class=\"pal-st\">'+pgSt('ro', st.status, { cls: 'sm', sub: st.sub ? '· ' + st.sub : '' })+'</span>'", "Ctrl K status")

# ---- the RO status window (Set status on the RO list): the options and the preview, the same look ----
js = _soft(js, """            return '<button class="st-opt '+statusPillClass(opt.status)+(opt.status===pickStatus?" on":"")+'"'
              + ' data-action="ro-status-pick" data-ro="'+sro.id+'" data-status="'+esc(opt.status)+'">'
              + '<span class="dot"></span>'+esc(opt.status)""",
           """            return '<button class="st-opt pgst-opt'+(opt.status===pickStatus?" on":"")+'"'
              + ' data-action="ro-status-pick" data-ro="'+sro.id+'" data-status="'+esc(opt.status)+'">'
              + pgSt('ro', opt.status)""", "status window options")
js = _soft(js, """      body += '<div class="st-preview">Will read '+pillHtml({status:pickStatus, sub:pickSub})+'</div>';""",
           """      body += '<div class="st-preview">Will read '+pgSt('ro', pickStatus, { sub: pickSub ? '· ' + pickSub : '' })+'</div>';""", "status window preview")

EXTRA_CSS.append(b9("v14c.css"))
LOG.append("Parsec 14 (C): next step order, days open, statuses on the RO list, Manager, Ctrl K and the status window")
