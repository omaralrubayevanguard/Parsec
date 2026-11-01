/* Parsec · kit · legacy-helpers.js
   Small helpers left from the Parsec 8 console that pages still call: effBar (the efficiency bar), the attachments folder name, copyText, addLogEntry, recalcLive.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   effBar attachDir xcard focusLogInput autoGrow copyText addLogEntry recalcLive (8 functions)
   uses       data/ ro/ state/
*/
/* The selected RO: header, one horizontal strip of sections and operations, then the pane. */


/* ---------- the one row that runs the RO: section chips, the RO chip, the stepper ---------- */




/* ---------- chip panels, on the dark band ---------- */




/* The task bulletins now live here: one rail, in the order you work them. */








/* The old RO header, entire, now living behind its own chip. */


/* ---------- the footer band: the RO totalled, and the day by job ---------- */


/* ---------- one operation, as a job card ---------- */








/* Efficiency bar. 100% sits two-thirds across, so beating the quote reads as
   overshooting the mark rather than "full" — nothing is clamped at 100. */
/* Progress = burnt ÷ quoted × 100 — how much of the quote has been spent.
   The bar runs to 150%; the tick at two-thirds is the 100% line you don't want to cross. */
function effBar(burnt, quoted){
  var box = "display:block;position:relative;height:4px;width:100%;border-radius:var(--pill, 999px);overflow:hidden;background:var(--surface-2);";
  if(!quoted || burnt == null) return '<span class="eff-bar" style="'+box+'opacity:.55" title="Nothing burnt against this quote yet"></span>';
  /* the bar is the quote: burnt fills it; time over the quote fills back in from the right end.
     colour of the over part: the same rule as the RO console (≤115% amber · above red) */
  var ratio = burnt / quoted;
  var g = Math.min(1, ratio) * 100, ov = Math.max(0, Math.min(1, ratio - 1)) * 100;
  var col = ratio <= 1.15 ? "var(--status-waiting)" : "var(--status-declined)";
  return '<span class="eff-bar" style="'+box+'" title="'+fmtDec(burnt)+'h burnt of '+fmtDec(quoted)+'h quoted — '+Math.round(ratio*100)+'% of the quote used.'+(ov>0.05?' The coloured end is time over the quote.':'')+'">'
    + '<i style="position:absolute;left:0;top:0;bottom:0;background:var(--status-complete);width:'+g.toFixed(1)+'%"></i>'
    + (ov > 0.05 ? '<i style="position:absolute;right:0;top:0;bottom:0;background:'+col+';box-shadow:-2px 0 0 var(--surface);width:'+ov.toFixed(1)+'%"></i>' : '')
    + '</span>';
}

/* ---------- attachments, written into the tech's own data folder ---------- */
function attachDir(roId, create){
  if(FS.status!=="connected" || !FS.dir) return Promise.reject(new Error("no folder"));
  return FS.dir.getDirectoryHandle("attachments", {create:!!create})
    .then(function(d){ return d.getDirectoryHandle(roId, {create:!!create}); });
}





/* ---------- shared: the punch toggle that lives in every operation header ---------- */


/* ---------- expandable card ---------- */
/* Header is a row, not a button, so it can carry its own actions alongside the toggle. */
function xcard(key, title, bodyHtml, defaultOpen, badge, actionsHtml){
  var open = (UI.xcard[key] === undefined) ? !!defaultOpen : !!UI.xcard[key];
  UI.xcard[key] = open;   // record it, so toggling has a definite state to invert
  return '<div class="xcard'+(open?' open':'')+'">'
    + '<div class="xcard-head">'
    +   '<button class="xc-toggle" data-action="toggle-xcard" data-key="'+esc(key)+'">'
    +     '<span class="xc-title">'+title+'</span>'
    +     (badge ? '<span class="xc-badge">'+badge+'</span>' : '')
    +   '</button>'
    +   (actionsHtml ? '<div class="xc-actions">'+actionsHtml+'</div>' : '')
    + '</div>'
    + (open ? '<div class="xcard-body">'+bodyHtml+'</div>' : '')
    + '</div>';
}


/* ---------- detail pane ---------- */




/* Every part on the RO, grouped under its operation or flat by date. */










/* One stamped stream: cause and fix in the order they actually happened. */


function focusLogInput(opId){
  setTimeout(function(){
    var el = document.getElementById("log-input-"+opId);
    if(el){ el.focus(); el.selectionStart = el.selectionEnd = el.value.length; autoGrow(el); }
  });
}
function autoGrow(el){ el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 160) + "px"; }
function copyText(text){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){ pushToast("Copied."); },
      function(){ pushToast("Could not copy — check browser permissions."); });
    return;
  }
  var ta = document.createElement("textarea");
  ta.value = text; ta.style.position="fixed"; ta.style.opacity="0";
  document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); pushToast("Copied."); } catch(err){ pushToast("Could not copy."); }
  document.body.removeChild(ta);
}




function addLogEntry(roId, opId, kind, text){
  var op = getOp(roId, opId); if(!op) return;
  text = String(text||"").trim(); if(!text) return;
  pushUndo("log entry");
  op.log = op.log || [];
  op.log.push({ id:uid("lg"), at:nowIso(), kind:(kind==="fix"?"fix":"cause"), text:text });
  scheduleSave(true);
}







/* Efficiency anchors the row: size, fill and the burn bar. Everything else is a plain figure. */



/* Remaining, shown in both formats: hh:mm:ss to sit alongside Burnt, decimal to sit alongside Quoted. */


/* Repaint the figures that depend on Quoted, without re-rendering the field being typed in. */
function recalcLive(roId, opId){
  var ro = getRO(roId), op = ro && getOp(roId, opId);
  if(!ro || !op) return;
  var c = opCalc(op);
  var pane = document.querySelector('.ro-pane');
  if(pane){
    var bt = pane.querySelector('[data-live="burnt"]');
    if(bt) bt.textContent = fmtHMS(c.burntMs);
    var rem = pane.querySelector('[data-live="remaining"]');
    if(rem){
      var neg = c.remaining < 0;
      rem.classList.toggle('over', neg);
      rem.querySelector('.fv').innerHTML = (neg?"-":"")+fmtHMS(Math.abs(c.remaining)*3600000)
        + ' <small>'+fmtDec(c.remaining)+'h</small>';
    }
    var eff = pane.querySelector('[data-live="eff"]');
    if(eff){
      var e = c.efficiency;
      var tone = e == null ? "idle" : (e >= 1 ? "ok" : (e >= 0.85 ? "warn" : "bad"));
      eff.className = "eff-anchor " + tone;
      eff.querySelector('.ea-val').textContent = (e==null ? '—' : fmtPct(e));
      var ratio = (op.quoted > 0 && c.burntHrs > 0) ? c.burntHrs / op.quoted : null;
      eff.querySelector('.ea-bar i').style.width = (ratio==null?0:Math.min(ratio/1.5,1)*100).toFixed(1)+'%';
      eff.querySelector('.ea-foot').textContent = ratio==null ? "No time logged yet"
        : fmtDec(c.burntHrs)+"h burnt of "+fmtDec(op.quoted)+"h · "+Math.round(ratio*100)+"% of quote used";
    }
  }
  var row = document.querySelector('.master-row.op[data-pane="'+op.id+'"] .mr-num');
  if(row) row.textContent = fmtDec(c.totalQuoted)+'h';

  var card = document.getElementById('ro-'+ro.id);
  if(card){
    var roRem = roRemainingHours(ro), roEff = roEfficiency(ro);
    var cells = card.querySelectorAll('.ro-meta .m');
    if(cells[0]) cells[0].querySelector('.v').textContent = fmtDec(roQuotedHours(ro))+'h';
    if(cells[1]){
      var v = cells[1].querySelector('.v');
      v.textContent = fmtDec(roRem)+'h';
      v.classList.toggle('over', roRem < 0);
    }
    if(cells[2]){
      var ve = cells[2].querySelector('.v');
      ve.textContent = (roEff==null ? '—' : fmtPct(roEff));
      ve.classList.toggle('good', roEff!=null && roEff>=1);
    }
  }
}
