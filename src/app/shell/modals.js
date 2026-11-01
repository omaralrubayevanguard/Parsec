/* Parsec · shell · modals.js
   modalHtml: the app's pop-up dialogs drawn from UI.modal (new RO, edit punch, PIN, reasons, backups, …) and the small date helpers they share.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   modalHtml loadBackupList editStopReasonOptions localToIsoKeep isoToLocal localToIso (6 functions)
   state      punches ros
   uses       access/ automations/ clock/ data/ import/ kit/ pages/ pages/inventory/ pages/triage/ pages/warranty/ ro/ ro-page/ state/
*/
function modalHtml(){
  var m = UI.modal;
  if(!m) return "";
  var body = "", title = "", foot = '<button class="btn" data-action="close-modal">Cancel</button>';
  if(m.type==="start-punch"){
    title = "Start a Punch";
    var ros = STATE.ros.filter(function(r){return r.operations.some(function(o){return !o.declined;});});
    var selRo = m.roId || (ros[0]&&ros[0].id);
    var ro = getRO(selRo);
    body = '<div class="form-row"><label>Repair Order</label><select data-bind="sp-ro">'+ros.map(function(r){return '<option value="'+r.id+'" '+(r.id===selRo?"selected":"")+'>RO '+esc(tgNum(r))+' — '+esc(r.customerName)+'</option>';}).join("")+'</select></div>';
    body += '<div class="form-row"><label>Operation</label><select data-bind="sp-op">'+(ro?ro.operations.filter(function(o){return !o.declined;}).map(function(o){return '<option value="'+o.id+'" '+(o.id===m.opId?"selected":"")+'>'+esc(o.complaint)+'</option>';}).join(""):'')+'</select></div>';
    body += '<div class="form-row"><label>Start Reason</label><div class="reason-grid">'+START_REASONS.map(function(r){return '<button data-action="submit-start-punch" data-reason="'+esc(r)+'">'+r+'</button>';}).join("")+'</div></div>';
    body += '<div class="form-error" id="form-error"></div>';
    if(!ros.length) body = '<p class="hint">No repair orders with open operations. Add an RO first.</p>';
    body = shopStartRowHtml() + body;
  } else if(m.type==="stop-punch"){
    title = "Stop Punch";
    var rpS = runningPunch(), shopS = isShopPunch(rpS);
    body = shopS
      ? '<div class="form-row"><label>Shop time</label><div class="reason-grid"><button data-action="submit-stop-punch" data-reason="Done">Done</button><button data-action="submit-stop-punch" data-reason="Switched job">Switched job</button></div></div>'
      : '<div class="form-row"><label>Where the operation stands</label><div class="reason-grid">'+STOP_REASONS_BREAK.concat(STOP_REASONS_EXPLICIT).map(function(r){return '<button data-action="submit-stop-punch" data-reason="'+esc(r)+'">'+r+'</button>';}).join("")+'</div></div>'
        + '<div class="form-row"><label>Switching work</label><div class="reason-grid">'+["Switched job","Pulled to another truck"].map(function(r){return '<button class="pr-opt subtle" data-action="submit-stop-punch" data-reason="'+esc(r)+'">'+r+'</button>';}).join("")+'</div></div>';
    body += '<p class="hint co-hint">Going home? Clock off with the day clock in the side bar \u2014 it stops this operation too.</p>';
    body += '<div class="form-row"><label>Work Notes (optional)</label><textarea id="stop-notes" placeholder="What did you do?"></textarea></div>';
    body += '<div class="form-error" id="form-error"></div>';
  } else if(m.type==="add-ro"){
    title = "New Repair Order";
    function nf(id, label, attrs, full){
      var rq = NEWRO_REQUIRED.indexOf(id) > -1;
      return '<div class="form-row'+(full?' nf-full':'')+'"><label for="'+id+'">'+label+(rq ? ' <span class="req" aria-hidden="true">*</span>' : ' <span class="opt">(optional)</span>')+'</label>'
        + '<input id="'+id+'" data-newro="1"'+(rq ? ' required aria-required="true"' : '')+' autocomplete="off" '+(attrs||'')+'></div>';
    }
    body = '<div class="imp-box" id="imp-box">'
      + '<div class="imp-title"><b>Import from the case</b><span>Paste the case page (Ctrl+A, Ctrl+C, then Ctrl+V below), paste or drop screenshots, or add the case PDF.</span></div>'
      + '<textarea id="imp-text" rows="3" placeholder="Paste the case page here (Ctrl+V)…" aria-label="Case page text"></textarea>'
      + '<div class="imp-row"><label class="btn btn-sm imp-pdf-btn" for="imp-pdf" title="Import from the case PDF">'+IC.report+'<span>PDF</span></label>'
      +   '<input type="file" id="imp-pdf" accept=".pdf,application/pdf" hidden>'
      +   '<label class="btn btn-sm imp-img-btn" for="imp-img" title="Read screenshots of the case (you can pick several)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 6A2.5 2.5 0 0 1 6 3.5h12A2.5 2.5 0 0 1 20.5 6v12a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18z" fill="currentColor" opacity=".16" stroke="none"/><path d="M3.5 6A2.5 2.5 0 0 1 6 3.5h12A2.5 2.5 0 0 1 20.5 6v12a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18zM3.8 16.5l4.7-4.2a1.2 1.2 0 0 1 1.6 0l4.2 3.9M13 14.5l1.9-1.7a1.2 1.2 0 0 1 1.6 0l3.8 3.4"/><circle cx="15.5" cy="8.5" r="1.7"/></svg><span>Screenshot</span></label>'
      +   '<input type="file" id="imp-img" accept="image/*" multiple hidden>'
      +   '<span class="imp-file" id="imp-file"></span><span class="spacer"></span>'
      +   '<button class="imp-clear" type="button" data-action="newro-clear" title="Empty this dialog and start over">Clear</button>'
      +   '<button class="btn btn-sm btn-primary" id="imp-go" data-action="newro-populate" disabled>Populate</button></div>'
      + '<div class="imp-status" id="imp-status" role="status" aria-live="polite"></div>'
      + '<div id="imp-jobs"></div>'
      + '</div>'
      + '<div class="newro-grid">'
      + nf("f-ro", "RO #", 'placeholder="RA-000000"')
      + '<div class="form-row"><label for="f-status">Status <span class="req" aria-hidden="true">*</span></label><select id="f-status" data-newro="1">'
      +   RO_STATUS_OPTIONS.map(function(o){ return '<option'+(o.status==="Hold Tech"?' selected':'')+'>'+esc(o.status)+'</option>'; }).join("")
      + '</select></div>'
      + nf("f-cust", "Customer", 'placeholder="Customer name"', true)
      + nf("f-vin", "VIN", 'placeholder="17 characters" maxlength="17" class="mono" style="text-transform:uppercase"', true)
      + nf("f-miles", "Miles", 'inputmode="numeric" placeholder="0" class="mono"')
      + nf("f-unit", "Unit", 'placeholder="Unit #" class="mono"')
      + nf("f-loc", "Location", 'list="newro-locs" placeholder="Bay / lot / lane"')
      + nf("f-tag", "Key tag", 'placeholder="Tag #" class="mono"')
      + nf("f-case", "Case #", 'placeholder="Case #" class="mono"')
      + nf("f-opened", "Date opened", 'type="date" value="'+todayStr()+'"')
      + '<div class="form-row"><label for="f-engtype">Engine type <span class="opt">(optional)</span></label><input id="f-engtype" list="newro-engs" autocomplete="off" placeholder="e.g. D13"><datalist id="newro-engs">'+ENGINE_TYPES.map(function(x){ return '<option value="'+x+'"></option>'; }).join('')+'</datalist></div>'
      + '<div class="form-row"><label for="f-year">Model year <span class="opt">(optional)</span></label><input id="f-year" inputmode="numeric" maxlength="4" class="mono" autocomplete="off" placeholder="e.g. 2021"></div>'
      + '<div class="form-row"><label for="f-model">Truck model <span class="opt">(optional)</span></label><input id="f-model" list="newro-models" autocomplete="off" placeholder="e.g. VNL 760"><datalist id="newro-models">'+TRUCK_MODELS.map(function(x){ return '<option value="'+x+'"></option>'; }).join('')+'</datalist></div>'
      + '<div class="form-row"><label for="f-tech">Technician <span class="opt">(optional)</span></label><input id="f-tech" list="newro-techs" autocomplete="off" placeholder="Who is on it"><datalist id="newro-techs">'+(function(){ var n = []; try{ n = staffList().map(function(x){ return x.name; }).filter(Boolean); }catch(e){} return n.map(function(x){ return '<option value="'+esc(x)+'"></option>'; }).join(''); })()+'</datalist></div>'
      + '<div class="form-row"><label for="f-enghours">Engine hours <span class="opt">(optional)</span></label><input id="f-enghours" inputmode="numeric" class="mono" autocomplete="off" placeholder="0"></div>'
      + '</div>'
      + '<datalist id="newro-locs">'+LOCATIONS.map(function(l){ return '<option value="'+esc(l)+'">'; }).join("")+'</datalist>'
      + '<div class="hint newro-hint" id="newro-hint">Fill in every field to create the RO.</div>'
      + '<div class="form-error" id="form-error"></div>';
    foot = '<button class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary" id="newro-create" data-action="submit-add-ro" disabled aria-disabled="true">Create RO</button>';
  } else if(m.type==="add-op"){
    title = "New Operation";
    body = '<div class="form-row"><label>Complaint</label><input id="f-complaint" placeholder="What the customer reported"></div>'
      + '<div class="form-row"><label>Quoted (hrs)</label><input type="number" step="0.1" min="0" id="f-quoted" value="0"></div>'
      + '<div class="hint">Cause and correction get filled in on the operation once you know them.</div>'
      + '<div class="form-error" id="form-error"></div>';
    foot = '<button class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="submit-add-op" data-ro="'+m.roId+'">Add Operation</button>';
  } else if(m.type==="add-std-op"){
    title = "Add Standard Operation";
    body = '<div class="reason-grid">'+STANDARD_OPS.map(function(s){return '<button data-action="submit-add-std-op" data-ro="'+m.roId+'" data-name="'+esc(s)+'">'+s+'</button>';}).join("")+'</div>'
      + '<div class="form-row" style="margin-top:8px;"><label>Quoted (hrs)</label><input type="number" step="0.1" id="f-std-quoted" value="1"></div>'
      + '<div class="form-error" id="form-error"></div>';
    foot = '<button class="btn" data-action="close-modal">Cancel</button>';
  } else if(m.type==="add-part"){
    title = "Add Part";
    body = '<div class="form-row"><label>Description</label><input id="f-desc"></div>'
      + '<div class="form-2col"><div class="form-row"><label>Part #</label><input id="f-partnum"></div><div class="form-row"><label>Qty</label><input type="number" id="f-qty" value="1"></div></div>'
      + '<div class="form-error" id="form-error"></div>';
    foot = '<button class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="submit-add-part" data-ro="'+m.roId+'" data-op="'+m.opId+'">Add Part</button>';
  } else if(m.type==="edit-punch"){
    var p = STATE.punches.find(function(x){return x.id===m.punchId;});
    title = "Edit Punch";
    var epRo = getRO(p.roId), epOp = epRo ? getOp(epRo.id, p.opId) : null;
    body = '<div class="form-row seg-lock"><label>Repair Order / Operation</label><div class="seg-lock-line"><b class="mono">'+esc(epRo?tgNum(epRo):"?")+'</b> \u2014 '+esc(epOp?epOp.complaint:"?")+'</div></div>'
      + '<div class="form-2col"><div class="form-row"><label>Start</label><input type="datetime-local" id="f-start" value="'+isoToLocal(p.start)+'"></div><div class="form-row"><label>Stop</label><input type="datetime-local" id="f-stop" value="'+(p.stop?isoToLocal(p.stop):"")+'"></div></div>'
      + '<div class="form-2col"><div class="form-row"><label>Start Reason</label><select id="f-startreason">'+(START_REASONS.indexOf(p.startReason)<0 && p.startReason ? [p.startReason] : []).concat(START_REASONS).map(function(r){return '<option '+(r===p.startReason?"selected":"")+'>'+esc(r)+'</option>';}).join("")+'</select></div>'
      + '<div class="form-row"><label>Stop Reason</label><select id="f-stopreason">'+editStopReasonOptions(p)+'</select></div></div>'
      + '<div class="form-row"><label>Notes</label><textarea id="f-notes">'+esc(p.notes||"")+'</textarea></div>'
      + (p.edited?'<div class="hint">Originally '+fmtTime(p.originalStart)+'–'+(p.originalStop?fmtTime(p.originalStop):"?")+', edited '+fmtDate(p.editedAt)+'.</div>':'')
      + '<div class="form-error" id="form-error"></div>';
    foot = '<button class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="submit-edit-punch" data-punch="'+p.id+'">Save</button>';
  } else if(m.type==="inv-extract"){
    title = "Extract parts to the inventory";
    body = invXHtml(m);
    foot = '<button class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary" id="inv-x-go" data-action="inv-x-add" disabled>Add parts</button>';
  } else if(m.type==="extract-ops"){
    title = "Extract operations";
    body = opsXHtml(m);
    foot = '<button class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary" id="ops-x-go" data-action="ops-x-add" disabled>Add operations</button>';
  } else if(m.type==="manual-punch"){
    title = "Add Manual Punch";
    var ros2 = STATE.ros;
    var mpRo = (m.roId && getRO(m.roId)) ? getRO(m.roId) : ros2[0];
    var mpOpId = m.opId || (mpRo && mpRo.operations[0] ? mpRo.operations[0].id : "");
    body = '';
    var mpLock = !!(m.roId && m.opId && mpRo && getOp(mpRo.id, m.opId));
    if(mpLock){
      var mpOp = getOp(mpRo.id, m.opId);
      body += '<div class="form-row seg-lock"><label>Repair Order / Operation</label><div class="seg-lock-line"><b class="mono">'+esc(tgNum(mpRo))+'</b> \u2014 '+esc(mpOp.complaint)+'</div>'
        + '<input type="hidden" id="f-mp-ro" value="'+mpRo.id+'"><input type="hidden" id="f-mp-op" value="'+mpOp.id+'"></div>';
    } else {
      body += '<div class="form-row"><label>Repair Order</label><select id="f-mp-ro">'+ros2.map(function(r){return '<option value="'+r.id+'"'+(mpRo&&r.id===mpRo.id?" selected":"")+'>RO '+esc(tgNum(r))+'</option>';}).join("")+'</select></div>';
      body += '<div class="form-row"><label>Operation</label><select id="f-mp-op">'+((mpRo?mpRo.operations:[]).map(function(o){return '<option value="'+o.id+'"'+(o.id===mpOpId?" selected":"")+'>'+esc(o.complaint)+'</option>';}).join(""))+'</select></div>';
    }
    body += '<div class="form-2col"><div class="form-row"><label>Start</label><input type="datetime-local" id="f-mp-start" value="'+(m.start?isoToLocal(m.start):"")+'"></div><div class="form-row"><label>Stop</label><input type="datetime-local" id="f-mp-stop" value="'+(m.stop?isoToLocal(m.stop):"")+'"></div></div>';
    body += '<div class="form-2col"><div class="form-row"><label>Start Reason</label><select id="f-mp-startreason">'+START_REASONS.map(function(r){return '<option>'+r+'</option>';}).join("")+'</select></div><div class="form-row"><label>Stop Reason</label><select id="f-mp-stopreason">'+STOP_REASONS_BREAK.concat(STOP_REASONS_EXPLICIT).map(function(r){return '<option>'+r+'</option>';}).join("")+'</select></div></div>';
    body += '<div class="form-row"><label>Notes</label><textarea id="f-mp-notes"></textarea></div>';
    body += '<div class="form-error" id="form-error"></div>';
    foot = '<button class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="submit-manual-punch">Add Punch</button>';
  } else if(m.type==="add-shift"){
    title = "Add Clock Segment";
    var asDay = m.day || todayStr(), asSg = shiftSuggest(asDay);
    body = '<p class="hint" style="margin:0 0 10px;">A stretch of time you were on the clock. It shows on the day bar and in the Clock row, and you can edit or delete it like any other segment.</p>';
    body += '<div class="form-row"><label>Day</label><input type="date" id="f-as-day" value="'+asDay+'" max="'+todayStr()+'"></div>';
    body += '<div class="form-2col"><div class="form-row"><label>Clock in</label><input type="time" id="f-as-in" value="'+(m.in||asSg.in)+'"></div>'
      + '<div class="form-row"><label>Clock out</label><input type="time" id="f-as-out" value="'+(m.in ? (m.out||"") : asSg.out)+'"></div></div>';
    body += '<p class="hint" style="margin:0;">Leave Clock out empty for a segment that is still running (today only).</p>';
    body += '<div class="form-error" id="form-error"></div>';
    foot = '<button class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="submit-add-shift">Add segment</button>';
  } else if(m.type==="import-csv"){
    title = "Import CSV";
    body = '<p class="hint">Choose a CSV exported from this console (or matching its columns). Rows that fail validation are skipped and listed — the rest still import.</p>'
      + '<input type="file" accept=".csv,text/csv" id="f-csv-file">'
      + '<div id="import-result" class="hint"></div>'
      + '<div class="form-error" id="form-error"></div>';
    foot = '<button class="btn" data-action="close-modal">Done</button>';
  } else if(m.type==="shortcuts"){
    title = "Keyboard shortcuts";
    body = pxKeySheet(UI.view);
    foot = '<button class="btn btn-primary" data-action="close-modal">Got it</button>';
  } else if(m.type==="ro-status"){
    var sro = getRO(m.roId);
    title = "Status \u2014 RO " + (sro ? esc(tgNum(sro)) : "?");
    if(!sro){ body = '<p class="hint">That repair order is gone.</p>'; }
    else {
      var curSt = roStatus(sro);
      var pickStatus = m.pick || curSt.status;
      var pickOpt = roStatusOption(pickStatus) || RO_STATUS_OPTIONS[0];
      var pickSub = (m.pick && m.pick !== curSt.status) ? (m.sub || null) : (m.sub !== undefined ? m.sub : curSt.sub);

      body = '<div class="st-grid">'
        + RO_STATUS_OPTIONS.map(function(opt){
            return '<button class="st-opt pgst-opt'+(opt.status===pickStatus?" on":"")+'"'
              + ' data-action="ro-status-pick" data-ro="'+sro.id+'" data-status="'+esc(opt.status)+'">'
              + pgSt('ro', opt.status)
              + (opt.subs.length ? '<span class="st-more">'+opt.subs.length+'</span>' : '')
              + '</button>';
          }).join("")
        + '</div>';

      if(pickOpt.subs.length){
        body += '<div class="st-subs"><span class="st-lab">Detail <span class="hint">optional</span></span>'
          + '<button class="st-sub'+(!pickSub?" on":"")+'" data-action="ro-status-sub" data-ro="'+sro.id+'" data-sub="">None</button>'
          + pickOpt.subs.map(function(sb){
              return '<button class="st-sub'+(pickSub===sb?" on":"")+'" data-action="ro-status-sub" data-ro="'+sro.id+'" data-sub="'+esc(sb)+'">'+esc(sb)+'</button>';
            }).join("")
          + '</div>';
      }

      body += '<div class="st-preview">Will read '+pgSt('ro', pickStatus, { sub: pickSub ? '· ' + pickSub : '' })+'</div>';
      if(sro.status && sro.status.setAt){
        body += '<p class="hint" style="margin:8px 0 0">Last set '+fmtDate(sro.status.setAt)+' '+fmtTime(sro.status.setAt)+'.</p>';
      }
      body += '<p class="hint" style="margin:6px 0 0">Operations keep their own status \u2014 this one is yours to set.</p>';
      foot = '<button class="btn" data-action="close-modal">Cancel</button>'
        + '<button class="btn btn-primary" data-action="ro-status-save" data-ro="'+sro.id+'" data-status="'+esc(pickStatus)+'" data-sub="'+esc(pickSub||"")+'">Set Status</button>';
    }
  } else if(m.type==="op-picker"){
    var pro = getRO(m.roId);
    title = "Operations on RO " + (pro ? esc(tgNum(pro)) : "?");
    if(!pro || !pro.operations.length){
      body = '<p class="hint">No operations on this RO.</p>';
    } else {
      var q = (m.q||"").toLowerCase();
      var list = pro.operations.filter(function(op){ return !q || op.complaint.toLowerCase().indexOf(q)!==-1; });
      var curPane = UI.roPane[pro.id];
      body = '<div class="form-row"><input id="op-picker-q" placeholder="Filter operations…" value="'+esc(m.q||"")+'" data-action="op-picker-q" autocomplete="off"></div>';
      if(!list.length){
        body += '<p class="hint">Nothing matches that.</p>';
      } else {
        body += '<div class="op-picker-list">' + list.map(function(op){
          var oc = opCalc(op);
          var ost = opStatus(op);
          var frac = partsFraction(op);
          var effCls = oc.efficiency==null ? "" : (oc.efficiency>=1 ? "good" : (oc.efficiency>=0.85 ? "warn" : "low"));
          var running = STATE.punches.some(function(p){ return p.opId===op.id && !p.stop; });
          return '<button class="op-pick'+(curPane===op.id?" sel":"")+(op.declined?" dim":"")+'" data-action="pick-op" data-ro="'+pro.id+'" data-op="'+op.id+'">'
            + '<div class="opk-top"><span class="opk-name">'+esc(op.complaint)+'</span>'
            +   (running?'<span class="mr-live" title="Punch running">●</span>':'')
            +   pillHtml(ost) + '</div>'
            + '<div class="opk-nums mono">'
            +   '<span>'+fmtDec(oc.totalQuoted)+'h quoted</span>'
            +   '<span>'+fmtHMS(oc.burntMs)+' burnt</span>'
            +   '<span class="'+(oc.remaining<0?"low":"")+'">'+fmtDec(oc.remaining)+'h left</span>'
            +   '<span class="'+effCls+'">'+(oc.efficiency==null?"—":fmtPct(oc.efficiency))+'</span>'
            +   (frac===null?'':'<span>parts '+Math.round(frac*100)+'%</span>')
            + '</div>'
            + effBar(oc.burntHrs, oc.totalQuoted)
            + '</button>';
        }).join("") + '</div>';
      }
    }
    foot = '<button class="btn" data-action="close-modal">Close</button>';
  } else if(m.type==="punch-reasons"){
    var p = STATE.punches.find(function(x){ return x.id===m.punchId; });
    if(!p){ body = '<p class="hint">That punch no longer exists.</p>'; }
    else {
      var ro = getRO(p.roId), op = ro?getOp(ro.id,p.opId):null;
      title = "Change Punch Reasons";
      body = '<div class="pr-ctx"><b>RO '+(ro?esc(tgNum(ro)):"?")+'</b> — '+(op?esc(op.complaint):"?")
        + '<div class="hint mono">'+fmtDate(p.start)+' · '+fmtTime(p.start)+' – '+(p.stop?fmtTime(p.stop):'running')+'</div></div>';

      body += '<div class="form-row"><label>Start Reason</label><div class="reason-grid">'
        + START_REASONS.map(function(r){
            return '<button class="pr-opt'+(m.start===r?' sel':'')+'" data-action="pr-start" data-reason="'+esc(r)+'">'+esc(r)+'</button>';
          }).join("") + '</div></div>';

      if(p.stop){
        body += '<div class="form-row"><label>Stop Reason — chosen</label><div class="reason-grid">'
          + STOP_REASONS_BREAK.concat(STOP_REASONS_EXPLICIT).map(function(r){
              return '<button class="pr-opt'+(m.stop===r?' sel':'')+'" data-action="pr-stop" data-reason="'+esc(r)+'">'+esc(r)+'</button>';
            }).join("") + '</div></div>';
        body += '<div class="form-row"><label>Stop Reason — supplied</label><div class="reason-grid">'
          + ["Switched job","Pulled to another truck"].concat(["Declined"]).map(function(r){
              return '<button class="pr-opt subtle'+(m.stop===r?' sel':'')+'" data-action="pr-stop" data-reason="'+esc(r)+'">'+esc(r)+'</button>';
            }).join("") + '</div>'
          + '<div class="hint">Breaks and truck switches. Set one by hand to correct the record.</div></div>';
      } else {
        body += '<div class="hint">This punch is still running, so it has no stop reason yet.</div>';
      }
      body += '<div class="form-error" id="form-error"></div>';
      foot = '<button class="btn" data-action="close-modal">Cancel</button>'
        + '<button class="btn btn-primary" data-action="submit-punch-reasons" data-punch="'+p.id+'">Save Reasons</button>';
    }
  } else if(m.type==="restore"){
    title = "Restore from Backup";
    if(FS.status!=="connected"){
      body = '<p class="hint">Connect your data folder first — backups live in its <span class="mono">backups</span> subfolder.</p>';
    } else if(m.files === null){
      body = '<p class="hint">Reading <span class="mono">backups</span>…</p>';
    } else if(!m.files.length){
      body = '<p class="hint">No backup files yet. One dated snapshot is written automatically the first time you save each day.</p>';
    } else {
      body = '<p class="hint">Each file is a full snapshot from the first save of that day. Restoring replaces your current data — and is undoable.</p>'
        + '<div class="backup-list">' + m.files.map(function(f){
            var d = (f.match(/\d{4}-\d{2}-\d{2}/)||[])[0];
            return '<button class="backup-row" data-action="restore-backup" data-file="'+esc(f)+'">'
              + '<span><b>'+(d?fmtDateLong(d+"T12:00:00"):esc(f))+'</b><span class="hint mono" style="display:block;">'+esc(f)+'</span></span>'
              + '<span class="btn btn-sm">Restore</span></button>';
          }).join("") + '</div>';
    }
    body += '<div class="form-error" id="form-error"></div>';
    foot = '<button class="btn" data-action="close-modal">Close</button>';
  } else if(m.type==="release-check"){
    var rcro = getRO(m.roId);
    title = rcro ? "Release " + esc(roLabel(rcro)) : "Release";
    if(!rcro){ body = '<p class="hint">That repair order is gone.</p>'; foot = '<button class="btn btn-primary" data-action="close-modal">OK</button>'; }
    else {
      var rcs = releaseState(rcro);
      body = '<p class="gate-lead">'+esc(rcro.customerName || '')+(rcro.unitNumber ? ' · unit '+esc(rcro.unitNumber) : '')+' — tick each one off before the truck goes.</p>'
        + '<div class="rel-list">' + RELEASE_CHECK.map(function(x){ var on = !!rcs[x[0]];
            return '<button class="rel-it'+(on ? ' on' : '')+'" data-action="rel-tick" data-ro="'+rcro.id+'" data-k="'+x[0]+'" role="checkbox" aria-checked="'+on+'"><span class="rel-box">'+(on ? '\u2713' : '')+'</span>'+esc(x[1])+'</button>'; }).join('') + '</div>'
        + (warrIs(rcro) ? (function(){ var ww = warrReady(rcro); return '<p class="rel-warr"><button class="yc wr '+ww.tier+'" data-action="open-warr" data-ro="'+rcro.id+'">W '+ww.pct+'%</button> Warranty paperwork'+(ww.miss.length ? ' \u2014 '+ww.miss.length+' item'+(ww.miss.length === 1 ? '' : 's')+' missing' : ' complete')+'</p>'; })() : '');
      var rok = releaseReady(rcro);
      foot = '<button class="btn" data-action="close-modal">Not yet</button>'
        + (rok ? '' : '<button class="btn" data-action="rel-all" data-ro="'+rcro.id+'">Tick all</button>')
        + '<button class="btn btn-primary" data-action="triage-release" data-ro="'+rcro.id+'"'+(rok ? '' : ' disabled title="Tick every line first" data-tip="Not yet — tick every line first"')+'>Release</button>';
    }
  } else if(m.type==="keytag"){
    var kro = getRO(m.roId);
    title = m.all ? "Key tags · open ROs" : "Key tag";
    if(m.all){
      var kall = sortedROs().filter(function(r){ return !roIsDone(r); });
      body = '<div class="kt-grid">' + (kall.length ? kall.map(function(r){ return keyTagHtml(r, false); }).join('') : '<p class="hint">No open ROs.</p>') + '</div>';
    } else if(!kro){ body = '<p class="hint">That repair order is gone.</p>'; }
    else body = '<div class="kt-one">' + keyTagHtml(kro, true) + '</div><p class="hint kt-hint">Print it and put it on the key. Scan it into the search box (Ctrl+K) with a USB scanner to jump straight to the RO.</p>';
    foot = '<button class="btn" data-action="close-modal">Close</button>'
      + (m.all ? '<button class="btn" data-action="open-keytag" data-ro="'+(m.roId || '')+'">Just one</button>' : '<button class="btn" data-action="open-keytag-all" data-ro="'+(m.roId || '')+'">All open ROs</button>')
      + '<button class="btn btn-primary" data-action="eod-print">'+IC.print+' Print</button>';
  } else if(m.type==="warr"){
    var wro = getRO(m.roId);
    title = "Warranty readiness" + (wro ? " · " + esc(roLabel(wro)) : "");
    if(!wro){ body = '<p class="hint">That repair order is gone.</p>'; }
    else {
      var wr = warrReady(wro), wgs = [], wby = {};
      wr.items.forEach(function(x){ if(!wby[x.grp]){ wby[x.grp] = []; wgs.push(x.grp); } wby[x.grp].push(x); });
      body = '<div class="wr-top"><b class="wr-pct '+wr.tier+'">'+wr.pct+'%</b><span>'+wr.ok+' of '+wr.n+' items in place'+(wr.miss.length ? ' · <b>'+wr.miss.length+' missing</b>' : ' · ready to submit')+'</span></div>'
        + '<div class="wr-bar"><i class="'+wr.tier+'" style="width:'+wr.pct+'%"></i></div>'
        + wgs.map(function(g){ return '<div class="wr-g"><div class="wr-gh">'+esc(g)+'</div>' + wby[g].map(function(x){
            return '<div class="wr-i'+(x.ok ? ' ok' : '')+'"><span class="wr-m">'+(x.ok ? '✓' : '✕')+'</span>'+esc(x.label)+'</div>'; }).join('') + '</div>'; }).join('');
    }
    foot = '<button class="btn btn-primary" data-action="close-modal">Close</button>';
  } else if(m.type==="pin"){
    var pinsf = m.id === "__admin" ? { id: "__admin", name: "Admin", role: "Every page" } : staffList().filter(function(x){ return x.id === m.id; })[0];
    title = "Sign in" + (pinsf ? " as " + esc(pinsf.name) : "");
    body = (pinsf ? '<div class="pin-who">'+(pinsf.id === "__admin" ? '<span class="pin-adm">' + pxI("user", 20) + '</span>' : staffAvHtml(pinsf, "pin-av", "n"))+'<div><b>'+esc(pinsf.name)+'</b><small>'+esc(pinsf.role)+'</small></div></div>' : '')
      + '<div class="form-row"><label for="pin-in">PIN</label><input id="pin-in" type="password" inputmode="numeric" maxlength="8" autocomplete="off" placeholder="••••" onkeydown="if(event.key===\'Enter\'){event.preventDefault();var b=document.querySelector(\'[data-action=pin-ok]\');if(b)b.click();}"></div><div class="form-error" id="form-error"></div>';
    foot = '<button class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="pin-ok">Sign in</button>';
  } else if(m.type==="long-clock"){
    var lp = STATE.punches.filter(function(x){ return x.id === m.punchId; })[0];
    var lro = lp ? getRO(lp.roId) : null, lop = lp ? getOp(lp.roId, lp.opId) : null;
    title = "Clock still running";
    if(!lp || lp.stop){ body = '<p class="hint">That clock has already been stopped.</p>'; foot = '<button class="btn btn-primary" data-action="close-modal">OK</button>'; }
    else {
      var ls = new Date(lp.start), lsug = new Date(Math.min(Date.now(), ls.getTime() + 8 * 3600000));
      function locVal(d){ return todayStr(d) + "T" + String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0"); }
      body = '<p class="gate-lead">The clock on <b>'+esc((lro ? tgNum(lro) + ' — ' : '') + (lop ? lop.complaint : 'an operation'))+'</b> has been running since '
        + '<b>'+esc(fmtDate(lp.start))+' '+esc(fmtTime(lp.start))+'</b> — '+esc(fmtHM(Date.now() - ls))+' so far. Was it left on?</p>'
        + '<div class="form-row"><label for="lc-stop">It actually stopped at</label><input id="lc-stop" type="datetime-local" value="'+locVal(lsug)+'" min="'+locVal(ls)+'" max="'+locVal(new Date())+'"></div>'
        + '<div class="form-error" id="form-error"></div>';
      foot = '<button class="btn" data-action="close-modal">Keep it running</button>'
        + '<button class="btn" data-action="long-clock-now">Stop now</button>'
        + '<button class="btn btn-primary" data-action="long-clock-at">Stop at that time</button>';
    }
  } else if(m.type==="clockout"){
    title = "Clock off";
    var rpC = runningPunch(), roC = rpC ? getRO(rpC.roId) : null, opC = rpC ? getOp(rpC.roId, rpC.opId) : null;
    body = (rpC ? '<p class="gate-lead">'+esc(roTag(roC))+' \u00b7 <b>'+esc(opC ? opC.complaint : 'the operation')+'</b> stops with the clock.</p>' : '<p class="gate-lead">Why are you clocking off?</p>')
      /* say where the running operation stands, so it keeps that status while you're away */
      + (rpC ? '<div class="form-row co-stand"><label>Where the operation stands <span class="co-opt">optional</span></label><div class="reason-grid">'
          + STOP_REASONS_EXPLICIT.map(function(r){ return '<button class="pr-opt'+(m.stand===r?' sel':'')+'" data-action="co-stand" data-reason="'+esc(r)+'" aria-pressed="'+(m.stand===r)+'">'+esc(r)+'</button>'; }).join('')
          + '</div><div class="hint">Leave it unpicked and the operation stops with the reason you clock off for.</div></div>'
          + '<div class="form-row co-note"><label>Note on the operation <span class="co-opt">optional</span></label><textarea id="co-notes" rows="1" placeholder="Where you left it"></textarea></div>'
          + '<div class="co-why">Why are you clocking off?</div>' : '')
      + '<div class="co-grid">'
      +   '<div class="co-lunch"><span class="co-ic">'+sfIcon(SF.clock, 20)+'</span><b>Lunch</b><span class="co-mins">'
      +     '<button class="btn btn-primary" data-action="clock-off" data-reason="Lunch" data-min="30">30 min</button>'
      +     '<button class="btn btn-primary" data-action="clock-off" data-reason="Lunch" data-min="60">1 hour</button></span></div>'
      +   [["Home", "exit"], ["End of day", "moon"], ["Appointment", "calendar"], ["Emergency", "warn"]].map(function(r){
            return '<button class="co-btn" data-action="clock-off" data-reason="'+r[0]+'"><span class="co-ic">'+sfIcon(SF[r[1]], 20)+'</span><b>'+r[0]+'</b></button>'; }).join('')
      + '</div>'
      ;
    foot = '<button class="btn" data-action="close-modal">Stay clocked in</button>';
  } else if(m.type==="automations"){
    title = "Automations";
    body = automationsModalBody(m);
    foot = '<button class="btn btn-primary" data-action="close-modal">Done</button>';
  } else if(m.type==="route"){
    title = "Send to…";
    body = rtModalBody(m);
    foot = rtModalFoot(m);
  } else if(m.type==="tg-tpl"){
    title = "Text templates";
    body = tgTplBodyModal(m);
    foot = '<button class="btn btn-primary" data-action="close-modal">Done</button>';
  } else if(m.type==="tx-move"){                           /* Parsec 12.5: move time to someone else */
    var TXM = txModal(m); title = TXM.title; body = TXM.body; foot = TXM.foot;
  } else if(m.type==="warnings"){
    title = "Warnings";
    var ws = computeWarnings();
    body = ws.length ? ws.map(function(w){
        return '<div class="warn-item"><b>'+w.code+'</b> <span class="warn-tx">'+esc(w.text)+'</span>'+noteX(w)+'</div>';
      }).join("") : '<p class="hint">No warnings right now.</p>';
    foot = '<button class="btn" data-action="close-modal">Close</button>';
  }
  return '<div class="overlay" data-action="overlay-close"><div class="modal'+(m.type==="add-ro"||m.type==="inv-extract"||m.type==="extract-ops"||m.type==="automations"||m.type==="tg-tpl"||m.type==="tx-move"?" modal-wide":"")+'" data-stop="1"><div class="modal-head"><h3>'+title+'</h3><button class="modal-close" data-action="close-modal" aria-label="Close">×</button></div><div class="modal-body">'+body+'</div><div class="modal-foot">'+foot+'</div></div></div>';
}
function loadBackupList(){
  listBackups().then(function(files){
    if(UI.modal && UI.modal.type==="restore"){ UI.modal.files = files; render(); }
  }).catch(function(){
    if(UI.modal && UI.modal.type==="restore"){ UI.modal.files = []; render(); }
  });
}
/* Every stop reason a punch can carry, so saving the edit form never swaps a
   Lunch or End-of-day stop for whatever happens to be first in the list. */
function editStopReasonOptions(p){
  if(!p.stop) return '<option value="" selected>\u2014 still running \u2014</option>';
  var all = STOP_REASONS_BREAK.concat(STOP_REASONS_EXPLICIT).concat(["Switched job","Pulled to another truck"]).concat(["Declined"]);
  if(p.stopReason && all.indexOf(p.stopReason) < 0) all.unshift(p.stopReason);
  if(!p.stopReason) all.unshift("");
  return all.map(function(r){ return '<option value="'+esc(r)+'"'+(r===(p.stopReason||"")?" selected":"")+'>'+(r?esc(r):"\u2014")+'</option>'; }).join("");
}
/* The form works in whole minutes; an untouched field keeps its exact original time. */
function localToIsoKeep(v, iso){ return (iso && v === isoToLocal(iso)) ? iso : localToIso(v); }
function isoToLocal(iso){ if(!iso) return ""; var d=new Date(iso); var p=function(n){return String(n).padStart(2,"0");}; return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"T"+p(d.getHours())+":"+p(d.getMinutes()); }
function localToIso(v){ if(!v) return null; return new Date(v).toISOString(); }
