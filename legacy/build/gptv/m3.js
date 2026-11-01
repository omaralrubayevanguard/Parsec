/* ===== demos: ChatGPT's proposals (the next eight) ===== */

/* 13 · RO quick peek */
function dPeek(el){
  var pin = null, hov = null;
  el.innerHTML = frame("Foreman", "Floor / Quick peek", '<div class="pk2"><div class="bays two" id="bs">' + Object.keys(BAYS0).map(function(b){ return bayHTML(b, RO[BAYS0[b]]); }).join("") + '</div><div id="pv" class="pvw"></div></div>', "Hover or Tab to a bay. Click to pin its preview; Esc closes it.");
  var pv = $("#pv", el);
  function draw(){
    var no = pin || hov, r = RO[no];
    $$("#bs .bay", el).forEach(function(b){ b.classList.toggle("sel", !!pin && b.dataset.ro === pin); });
    if(!r){ pv.innerHTML = '<div class="peek empty"><span class="k">Hover a bay to preview its repair order.</span></div>'; return; }
    pv.innerHTML = '<div class="peek"><div class="row"><span class="eyebrow mono">RO ' + r.no + '</span><span style="flex:1"></span><span class="pill ' + (pin ? "acc" : "") + '">' + (pin ? ic("pin") + " Pinned" : "Quick peek") + '</span></div><div class="pi">' + pic(r.p, "s") + '</div><b class="pkn">' + r.cust + '</b><div class="k">' + r.year + " Volvo " + r.model + '</div><div class="grid2" style="margin:12px 0;gap:8px"><div><span class="k">Technician</span><div>' + (r.tech || "—") + '</div></div><div><span class="k">Stage</span><div>' + r.stage + '</div></div></div><b style="font-size:13px">' + r.cx + '</b><div class="nxb">' + r.next + '</div><button type="button" class="btn pri" style="width:100%;margin-top:10px">Open repair order ' + ic("arrow") + "</button></div>";
    if(MOTION) $(".peek", pv).animate([{ opacity: .4, transform: "translateY(3px)" }, { opacity: 1, transform: "none" }], { duration: 140, easing: "cubic-bezier(.2,.75,.25,1)" });
  }
  var bs = $("#bs", el);
  bs.addEventListener("mouseover", function(e){ var b = e.target.closest(".bay"); var no = b && b.dataset.ro || null; if(no !== hov){ hov = no; if(!pin) draw(); } });
  bs.addEventListener("mouseleave", function(){ hov = null; if(!pin) draw(); });
  bs.addEventListener("focusin", function(e){ var b = e.target.closest(".bay"); if(b && b.dataset.ro){ hov = b.dataset.ro; if(!pin) draw(); } });
  bs.addEventListener("click", function(e){ var b = e.target.closest(".bay"); if(!b || !b.dataset.ro) return; pin = pin === b.dataset.ro ? null : b.dataset.ro; draw(); });
  bs.addEventListener("keydown", function(e){ var b = e.target.closest(".bay"); if(b && b.dataset.ro && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); pin = pin === b.dataset.ro ? null : b.dataset.ro; draw(); } });
  on(window, "keydown", function(e){ if(e.key === "Escape" && pin){ pin = null; draw(); } });
  draw();
}

/* 14 · blocker aging */
function dAging(el){
  var B = [{ no: "10483", who: "Parts team", what: "Leveling valve ETA", lim: 8, age: 6, next: "Confirm the leveling valve ETA with Parts." }, { no: "10485", who: "Service advisor", what: "Customer approval", lim: 6, age: 2.5, next: "Call Ironwood for approval on the axle work." }, { no: "10486", who: "Foreman", what: "Needs a technician", lim: 4, age: 1, next: "Assign a technician for the first diagnosis." }], add = 0, sel = "10483";
  el.innerHTML = frame("Waiting work", "Queue / Blockers", '<div class="row" style="margin-bottom:14px;gap:12px"><span class="k">Demo clock</span><input type="range" id="clk" min="0" max="12" step=".5" value="0" style="flex:1;accent-color:var(--acc)"><span class="mono" id="clv">+0 h</span></div><div class="sw2"><div id="bl"></div><div id="bd"></div></div>', "Age chips turn amber near the follow-up time and red past it. Nothing pops up.");
  function cls(b){ var a = b.age + add; return a >= b.lim ? "b" : a >= b.lim * .75 ? "w" : ""; }
  function draw(){
    $("#clv", el).textContent = "+" + add + " h";
    $("#bl", el).innerHTML = B.length ? B.map(function(b){ var a = b.age + add, c = cls(b); return '<div class="blk' + (b.no === sel ? " on" : "") + '" data-no="' + b.no + '" tabindex="0" role="button"><div class="row"><b>' + b.no + " · " + first(RO[b.no].cust) + '</b><span style="flex:1"></span><span class="age ' + c + '">' + (a % 1 ? a.toFixed(1) : a) + ' h</span></div><div class="k">' + b.what + " · " + b.who + '</div><div class="bar2"><i style="width:' + Math.min(100, a / b.lim * 100) + "%;background:" + (c === "b" ? "var(--bad)" : c === "w" ? "var(--warn)" : "var(--ink3)") + '"></i></div></div>'; }).join("") : '<p class="hint">No blockers. Undo brings the last one back.</p>';
    var b = B.find(function(x){ return x.no === sel; });
    $("#bd", el).innerHTML = b ? '<div class="card"><span class="eyebrow mono">RO ' + b.no + '</span><h4 class="h4s">' + (b.age + add) + ' hours waiting</h4><span class="pill ' + (cls(b) === "b" ? "bad" : cls(b) === "w" ? "warn" : "") + '">' + (cls(b) === "b" ? "Follow-up overdue" : cls(b) === "w" ? "Follow-up due soon" : "Within follow-up time") + '</span><div class="grid2" style="margin:12px 0;gap:8px"><div><span class="k">Owner</span><div>' + b.who + '</div></div><div><span class="k">Follow up after</span><div>' + b.lim + ' hours</div></div></div><div class="nxb"><span class="k">Next action</span><br>' + b.next + '</div><button type="button" class="btn pri" id="rs" style="width:100%;margin-top:10px">Resolve blocker</button></div>' : "";
    var rs = $("#rs", el); if(rs) rs.onclick = function(){ var i = B.indexOf(b); B.splice(i, 1); var keep = sel; sel = B[0] && B[0].no; draw(); toast("Blocker on RO " + b.no + " resolved.", function(){ B.splice(i, 0, b); sel = keep; draw(); }); };
  }
  $("#clk", el).oninput = function(){ add = +this.value; draw(); };
  $("#bl", el).onclick = function(e){ var b = e.target.closest(".blk"); if(b){ sel = b.dataset.no; draw(); } };
  draw();
}

/* 15 · saved views */
function dViews(el){
  var V = [{ n: "All open", f: function(){ return true; } }, { n: "Waiting", f: function(r){ return /Waiting/.test(r.stage); } }, { n: "Unassigned", f: function(r){ return !r.tech; } }, { n: "New trucks", f: function(r){ return r.year >= 2025; } }], cur = 0, F = { stage: "", tech: "" };
  el.innerHTML = frame("Repair orders", "Queue / Saved views", '<div class="chipb" id="vw"></div><div class="row" style="gap:8px;margin:12px 0;flex-wrap:wrap"><select class="sl" id="fs" style="width:auto"><option value="">Any stage</option><option>In repair</option><option>Waiting</option><option>Checked in</option></select><select class="sl" id="ft" style="width:auto"><option value="">Anyone</option>' + ROS.filter(function(r){ return r.tech; }).map(function(r){ return "<option>" + r.tech + "</option>"; }).join("") + '<option value="none">Unassigned</option></select><span style="flex:1"></span><span id="sva"></span></div><div class="list" id="ls"></div>', "A saved view keeps the filter and its name together, one click away.");
  function custom(){ return F.stage || F.tech; }
  function draw(){
    $("#vw", el).innerHTML = V.map(function(v, i){ return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === cur && !custom()) + '">' + v.n + ' <span class="k">' + ROS.filter(v.f).length + "</span></button>"; }).join("");
    var fn = custom() ? function(r){ return (!F.stage || r.stage.indexOf(F.stage) >= 0) && (!F.tech || (F.tech === "none" ? !r.tech : r.tech === F.tech)); } : V[cur].f;
    var l = ROS.filter(fn);
    $("#ls", el).innerHTML = l.map(function(r){ return '<div class="it">' + thumb(r) + "<b>" + r.no + " · " + r.cust + "</b><small>" + r.year + " Volvo " + r.model + " · " + (r.tech || "Unassigned") + '</small><span class="r pill ' + (r.st === "wait" ? "warn" : "") + '">' + r.stage + "</span></div>"; }).join("") || '<p class="hint">No repair orders in this view.</p>';
    $("#sva", el).innerHTML = custom() ? '<span class="sv1"><input class="in" id="vn" placeholder="Name this view" style="width:150px;height:30px"><button type="button" class="btn sm pri" id="vs">' + ic("plus") + "Save view</button></span>" : "";
    var vs = $("#vs", el); if(vs){ var go2 = function(){ var n = $("#vn", el).value.trim() || "My view"; var f = Object.assign({}, F); V.push({ n: n, f: function(r){ return (!f.stage || r.stage.indexOf(f.stage) >= 0) && (!f.tech || (f.tech === "none" ? !r.tech : r.tech === f.tech)); } }); cur = V.length - 1; F = { stage: "", tech: "" }; $("#fs", el).value = ""; $("#ft", el).value = ""; draw(); var nb = $('#vw [data-i="' + cur + '"]', el); if(nb && MOTION) nb.animate([{ transform: "scale(.9)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 180 }); toast("View “" + esc(n) + "” saved."); }; vs.onclick = go2; $("#vn", el).onkeydown = function(e){ if(e.key === "Enter") go2(); }; }
  }
  $("#vw", el).onclick = function(e){ var b = e.target.closest("button"); if(!b) return; cur = +b.dataset.i; F = { stage: "", tech: "" }; $("#fs", el).value = ""; $("#ft", el).value = ""; draw(); };
  $("#fs", el).onchange = function(){ F.stage = this.value; draw(); };
  $("#ft", el).onchange = function(){ F.tech = this.value; draw(); };
  draw();
}

/* 16 · bay suitability */
function dSuit(el){
  var J = { cac: ["Charge-air diagnosis", ["Inspection pit", "Exhaust extraction"]], align: ["Wheel alignment", ["Alignment rack"]], elec: ["Electrical diagnosis", []], dpf: ["DPF cleaning", ["Exhaust extraction", "Overhead crane"]] };
  var BY = [{ b: "B2", eq: ["General service"] }, { b: "B6", eq: ["Inspection pit", "Exhaust extraction"] }, { b: "B7", eq: ["Inspection pit", "Exhaust extraction", "Overhead crane"] }, { b: "B9", eq: ["Alignment rack", "Inspection pit"] }, { b: "B12", eq: ["Overhead crane", "Exhaust extraction"], busy: "10484" }];
  var job = "cac", sel = "B6", at = "B1";
  el.innerHTML = frame("Bay planning", "Floor / Equipment fit", rohHTML(RO["10482"], { cam: false }) + '<div class="row" style="margin:14px 0 6px;gap:10px;flex-wrap:wrap"><label class="l" style="flex:1;min-width:200px">Work to perform<select class="sl" id="jb">' + Object.keys(J).map(function(k){ return '<option value="' + k + '">' + J[k][0] + "</option>"; }).join("") + '</select></label><span class="pill" id="at"></span></div><div class="row" id="nd" style="gap:6px;flex-wrap:wrap;margin-bottom:12px"></div><div class="sw2"><div id="bl"></div><div id="bd"></div></div>', "Each bay says why it fits or what it's missing before you move the truck.");
  function fit(y){ var need = J[job][1]; var miss = need.filter(function(n){ return y.eq.indexOf(n) < 0; }); return { miss: miss, ok: !miss.length && !y.busy }; }
  function draw(){
    var need = J[job][1];
    $("#at", el).textContent = "Now in " + at;
    $("#nd", el).innerHTML = '<span class="k">Needs</span>' + (need.length ? need.map(function(n){ return '<span class="eq need">' + n + "</span>"; }).join("") : '<span class="eq">No special equipment</span>');
    $("#bl", el).innerHTML = BY.map(function(y){ var f = fit(y); return '<div class="blk' + (y.b === sel ? " on" : "") + (y.busy ? " busy" : "") + '" data-b="' + y.b + '" tabindex="0" role="button"><div class="row"><span class="age mono">' + y.b + "</span><b>" + (y.busy ? "Occupied" : f.ok ? "Suitable bay" : "Equipment missing") + '</b><span style="flex:1"></span>' + (y.busy ? '<span class="k">RO ' + y.busy + "</span>" : f.ok ? '<span class="ok2">' + ic("check") + "</span>" : '<span class="wr2">' + ic("alert") + "</span>") + '</div><div class="row" style="gap:4px;flex-wrap:wrap;margin-top:6px">' + y.eq.map(function(e){ return '<span class="eq' + (need.indexOf(e) >= 0 ? " need" : "") + '">' + e + "</span>"; }).join("") + f.miss.map(function(m){ return '<span class="eq miss">' + m + "</span>"; }).join("") + "</div></div>"; }).join("");
    var y = BY.find(function(x){ return x.b === sel; }), f = fit(y);
    $("#bd", el).innerHTML = '<div class="card"><span class="eyebrow">Destination · ' + y.b + '</span><div class="pi2">' + pic("vnl-25-860", "s") + '</div><span class="pill ' + (f.ok ? "good" : y.busy ? "" : "warn") + '">' + (y.busy ? "Occupied by RO " + y.busy : f.ok ? "All requirements met" : f.miss.length + " missing") + '</span><p class="hint">' + (y.busy ? "Pick a free bay." : f.ok ? "Why this bay works: " + (need.length ? need.join(" and ") + " available for this job." : "any bay fits this job.") : "Missing " + f.miss.join(" and ") + ".") + '</p><button type="button" class="btn pri" id="mt" style="width:100%"' + (f.ok && at !== y.b ? "" : " disabled") + ">" + (at === y.b ? "Already here" : "Move truck to " + y.b) + "</button></div>";
    var mt = $("#mt", el); mt.onclick = function(){ var was = at; at = y.b; draw(); toast("RO 10482 moved to " + at + ".", function(){ at = was; draw(); }); };
  }
  $("#jb", el).onchange = function(){ job = this.value; draw(); };
  $("#bl", el).onclick = function(e){ var b = e.target.closest(".blk"); if(b){ sel = b.dataset.b; draw(); } };
  draw();
}

/* 17 · technician preview */
function dTech(el){
  var T = [{ n: "Mike Rodriguez", i: "MR", h: 6, sk: ["D13 engine", "Electrical"] }, { n: "Dana Kowalski", i: "DK", h: 3, sk: ["D13 engine", "Brakes"] }, { n: "Luis Martinez", i: "LM", h: 4.5, sk: ["Electrical", "ABS"] }, { n: "Priya Shah", i: "PS", h: 4, sk: ["Axles", "Suspension"] }];
  var est = 2.5, sel = 1, need = "D13 engine", who = "";
  el.innerHTML = frame("Team planning", "People / Assignment", rohHTML(RO["10486"], { cam: false }) + '<div class="row" style="margin:14px 0 10px;gap:10px;flex-wrap:wrap"><b class="lbl">D13 engine diagnosis</b><span style="flex:1"></span><label class="l" style="flex-direction:row;align-items:center;gap:8px">Estimated work<select class="sl" id="es" style="width:auto"><option>1.5</option><option selected>2.5</option><option>4</option></select></label></div><div class="sw2"><div id="tl"></div><div id="td"></div></div>', "See hours before and after, and whether the skill fits, before you assign.");
  function draw(){
    $("#tl", el).innerHTML = T.map(function(t, i){ var m = t.sk.indexOf(need) >= 0; return '<div class="blk' + (i === sel ? " on" : "") + '" data-i="' + i + '" tabindex="0" role="button"><div class="row"><span class="av">' + t.i + "</span><b>" + t.n + '</b><span style="flex:1"></span>' + (m ? '<span class="eq need">' + need + "</span>" : "") + '</div><div class="k" style="margin-top:4px">' + t.h + " / 8 h planned</div></div>"; }).join("");
    var t = T[sel], aft = t.h + est, over = aft > 8, m = t.sk.indexOf(need) >= 0;
    $("#td", el).innerHTML = '<div class="card"><div class="row"><span class="av">' + t.i + '</span><div><b>' + t.n + '</b><div class="k">Today\'s planned work</div></div></div><div class="row" style="gap:4px;margin:10px 0;flex-wrap:wrap">' + t.sk.map(function(s){ return '<span class="eq' + (s === need ? " need" : "") + '">' + s + "</span>"; }).join("") + '</div><div class="row"><span class="k">After assignment</span><span style="flex:1"></span><b class="mono big">' + aft + '</b><span class="k">/ 8 h</span></div><div class="cap" style="margin:6px 0"><i style="width:' + Math.min(t.h, 8) / Math.max(8, aft) * 100 + '%"></i><i class="' + (over ? "o" : "n") + '" style="width:' + est / Math.max(8, aft) * 100 + '%"></i></div><div class="k">' + t.h + " h planned + " + est + ' h new work</div><div style="margin:8px 0"><span class="pill ' + (over ? "bad" : "good") + '">' + (over ? (aft - 8) + " h over the shift" : (8 - aft) + " h still free") + '</span></div><div class="nxb">' + (m ? "<b>Relevant skill recorded</b><br>" + need + " skill and room in this shift." : "<b>No " + need + " skill recorded</b><br>Assign anyway, or pick someone with it.") + '</div><button type="button" class="btn pri" id="as" style="width:100%;margin-top:10px">' + (who === t.n ? ic("check") + "Assigned" : "Assign to " + first(t.n)) + "</button></div>";
    $("#as", el).onclick = function(){ if(who === t.n) return; var was = who; who = t.n; draw(); toast("RO 10486 assigned to " + t.n + ".", function(){ who = was; draw(); }); };
  }
  $("#es", el).onchange = function(){ est = +this.value; draw(); };
  $("#tl", el).onclick = function(e){ var b = e.target.closest(".blk"); if(b){ sel = +b.dataset.i; draw(); } };
  draw();
}

/* 18 · shift handover */
function dHand(el){
  var on2 = { "10482": true, "10483": true, "10485": true };
  el.innerHTML = frame("Shift handover", "Team / Next shift", '<div class="sw2"><div><div class="row" style="margin-bottom:6px"><b class="lbl">Include in the handover</b><span style="flex:1"></span><span class="pill acc" id="cnt"></span></div><div id="cl"></div></div><div class="card"><span class="eyebrow">Next shift</span><h4 class="h4s">Keep the next action attached.</h4><label class="l">Shift note<textarea class="in ta" id="nt" placeholder="Anything the next foreman should know?"></textarea></label><button type="button" class="btn pri" id="bh" style="width:100%;margin-top:10px">Build handover ' + ic("arrow") + '</button><div id="out"></div></div></div>', "A draft you can edit and copy. Nothing is sent.");
  function cl(){ $("#cl", el).innerHTML = ROS.map(function(r){ return '<label class="ck"><input type="checkbox" data-no="' + r.no + '"' + (on2[r.no] ? " checked" : "") + "><span><b>" + r.no + " · " + r.cust + "</b><small>" + r.stage + (r.tech ? " · " + first(r.tech) : "") + "</small><br><small>" + r.next + "</small></span></label>"; }).join(""); $("#cnt", el).textContent = Object.keys(on2).filter(function(k){ return on2[k]; }).length + " selected"; }
  $("#cl", el).onchange = function(e){ var c = e.target; if(c.dataset.no){ on2[c.dataset.no] = c.checked; cl(); } };
  $("#bh", el).onclick = function(){
    var l = ROS.filter(function(r){ return on2[r.no]; }), n = $("#nt", el).value.trim();
    var t = "Handover · " + l.length + " repair orders\n\n" + l.map(function(r){ return "RO " + r.no + " · " + r.cust + " (" + r.year + " " + r.model + ")\n  " + r.stage + (r.tech ? " · " + r.tech : "") + "\n  Next: " + r.next; }).join("\n\n") + (n ? "\n\nNote: " + n : "");
    $("#out", el).innerHTML = '<textarea class="in ta big" id="ho">' + esc(t) + '</textarea><button type="button" class="btn sm" id="cp">' + ic("copy") + "Copy</button>";
    fade($("#out", el)); $("#cp", el).onclick = function(){ copyText($("#ho", el).value); toast("Handover copied."); };
  };
  cl();
}

/* 19 · photo annotations */
function dNotes(el){
  var M = [{ x: 22, y: 64, t: "Inspection", n: "Check the front bumper and lower grille for damage." }, { x: 60, y: 46, t: "Leak", n: "Coolant residue under the sleeper step." }], sel = 0, placing = false;
  el.innerHTML = frame("Vehicle inspection", "RO 10482 / Annotations", '<div class="sw2 wide"><div><div class="row" style="margin-bottom:8px"><span class="k" id="mc"></span><span style="flex:1"></span><button type="button" class="btn sm" id="ad">' + ic("plus") + 'Add note</button></div><div class="ins" id="im"><img src="' + BIG + '" alt="2025 Volvo VNL 860"></div><p class="hint">Markers point to an observation on this reference picture. They don\'t replace a diagnosis.</p></div><div id="fm"></div></div>', "Place a marker, describe it, save it. Parsec 9.9 has the same idea in Notes on the truck.");
  var im = $("#im", el);
  function draw(){
    $$(".mk", im).forEach(function(m){ m.remove(); });
    M.forEach(function(m, i){ var b = D.createElement("button"); b.type = "button"; b.className = "mk" + (i === sel ? " on" : ""); b.style.left = m.x + "%"; b.style.top = m.y + "%"; b.textContent = i + 1; b.dataset.i = i; b.setAttribute("aria-label", "Marker " + (i + 1) + ": " + m.t); im.appendChild(b); });
    $("#mc", el).textContent = placing ? "Click the picture to place the marker" : M.length + " saved markers · click one to open it";
    im.classList.toggle("place", placing);
    var m = M[sel];
    $("#fm", el).innerHTML = m ? '<div class="card"><span class="eyebrow">Marker ' + (sel + 1) + '</span><h4 class="h4s">Inspection note</h4><label class="l">Observation type<select class="sl" id="mt">' + ["Inspection", "Damage", "Leak", "Wear"].map(function(t){ return "<option" + (t === m.t ? " selected" : "") + ">" + t + "</option>"; }).join("") + '</select></label><label class="l" style="margin-top:10px">Observation<textarea class="in ta" id="mn">' + esc(m.n) + '</textarea></label><button type="button" class="btn pri" id="ms" style="width:100%;margin-top:10px">Save note</button><button type="button" class="btn gh sm" id="mr" style="margin-top:6px;color:var(--bad)">Remove marker</button></div>' : '<div class="card"><span class="k">No markers. Press Add note, then click the picture.</span></div>';
    if(m){
      $("#ms", el).onclick = function(){ m.t = $("#mt", el).value; m.n = $("#mn", el).value; toast("Marker " + (sel + 1) + " saved."); };
      $("#mr", el).onclick = function(){ var i = sel, r = M.splice(i, 1)[0]; sel = Math.max(0, i - 1); draw(); toast("Marker removed.", function(){ M.splice(i, 0, r); sel = i; draw(); }); };
    }
  }
  $("#ad", el).onclick = function(){ placing = !placing; draw(); };
  im.addEventListener("click", function(e){
    var mk = e.target.closest(".mk"); if(mk){ sel = +mk.dataset.i; placing = false; draw(); return; }
    if(!placing) return; var r = im.getBoundingClientRect();
    M.push({ x: Math.round((e.clientX - r.left) / r.width * 100), y: Math.round((e.clientY - r.top) / r.height * 100), t: "Inspection", n: "" }); sel = M.length - 1; placing = false; draw();
    var nb = $$(".mk", im)[sel]; if(nb && MOTION) nb.animate([{ transform: "scale(.4)" }, { transform: "scale(1.15)" }, { transform: "none" }], { duration: 220 }); var t = $("#mn", el); if(t) t.focus();
  });
  draw();
}

/* 20 · completion readiness */
function dReady(el){
  var C = [["Repair verified", "Correction and final technician story recorded.", true], ["Road test recorded", "Result documented after the repair.", false], ["Completion photos", "Final condition photos attached to the RO.", false], ["Paperwork reviewed", "Parts and labor lines checked by the advisor.", true], ["Pickup arranged", "Customer contact and pickup time confirmed.", false]], ready = false;
  el.innerHTML = frame("Completion review", "RO 10482 / Readiness", '<div class="sw2"><div><div class="row"><b class="mono big" id="n"></b><span class="k" id="of"></span><span style="flex:1"></span><span class="pill warn" id="rem"></span></div><div class="bar2 thick" style="margin:8px 0 6px"><i id="pb"></i></div><div id="cl"></div></div><div class="card" id="rc"></div></div>', "Mark ready unlocks only when every check is done. The count updates as you go.");
  function draw(){
    var d = C.filter(function(c){ return c[2]; }).length, all = d === C.length;
    $("#n", el).textContent = d; $("#of", el).textContent = "/ " + C.length + " checks"; var rm = $("#rem", el); rm.textContent = all ? "All done" : (C.length - d) + " remaining"; rm.className = "pill " + (all ? "good" : "warn");
    var pb = $("#pb", el); pb.style.width = d / C.length * 100 + "%"; pb.style.background = all ? "var(--good)" : "var(--acc)";
    $("#cl", el).innerHTML = C.map(function(c, i){ return '<label class="ck"><input type="checkbox" data-i="' + i + '"' + (c[2] ? " checked" : "") + "><span><b>" + c[0] + "</b><small>" + c[1] + "</small></span></label>"; }).join("");
    var miss = C.filter(function(c){ return !c[2]; }).map(function(c){ return c[0]; });
    $("#rc", el).innerHTML = '<span class="eyebrow">Release check</span><div class="pi2">' + pic("vnl-25-860", "s") + '</div><h4 class="h4s">' + (ready ? "Ready for pickup." : all ? "Everything is in place." : "A few details remain.") + '</h4><p class="hint">' + (ready ? "Northline Logistics can be told the truck is ready." : all ? "Mark it ready when you're set." : "Still missing: " + miss.join(" · ")) + '</p><button type="button" class="btn ' + (ready ? "ok" : "pri") + '" id="mr" style="width:100%"' + (all && !ready ? "" : " disabled") + ">" + (ready ? ic("check") + "Marked ready" : "Mark ready for pickup") + "</button>";
    $("#mr", el).onclick = function(){ ready = true; draw(); toast("RO 10482 marked ready for pickup.", function(){ ready = false; draw(); }); };
  }
  $("#cl", el).onchange = function(e){ var i = e.target.dataset.i; if(i != null){ C[+i][2] = e.target.checked; if(!e.target.checked) ready = false; draw(); } };
  draw();
}

/* 21 · your picks */
var PK = {};
function picksText(){
  var L = { yes: [], chg: [], no: [], none: [] };
  ITEMS.forEach(function(it, i){ if(it.id === "picks") return; var p = PK[it.id] || {}; var line = (i + 1) + ". " + it.t + (p.note ? " — " + p.note : ""); (L[p.v] || L.none).push(line); });
  var sm = ITEMS[idx("small")].small.map(function(c){ var v = (PK["s:" + c[0]] || {}).v; return "   · " + c[1] + ": " + (v === "yes" ? (c[0] === "leave" ? "agree" : "yes") : v === "no" ? (c[0] === "leave" ? "keep them" : "no") : "—"); });
  return "Parsec · ChatGPT changes — my picks\n\nBring in / build:\n" + (L.yes.join("\n") || "   (none)") + "\n\nChange it:\n" + (L.chg.join("\n") || "   (none)") + "\n\nNot now:\n" + (L.no.join("\n") || "   (none)") + "\n\nNot decided:\n" + (L.none.join("\n") || "   (none)") + "\n\nSmall changes:\n" + sm.join("\n");
}
function copyText(t){ try{ navigator.clipboard.writeText(t); }catch(e){ var a = D.createElement("textarea"); a.value = t; D.body.appendChild(a); a.select(); try{ D.execCommand("copy"); }catch(_){} a.remove(); } }
function dPicks(el){
  function row(it){ var p = PK[it.id] || {}, prop = it.grp === "prop"; return '<div class="pkr"><span class="n mono">' + pad(idx(it.id) + 1) + '</span><button type="button" class="pkt" data-go="' + it.id + '"><b>' + it.t + "</b>" + (p.note ? "<small>" + esc(p.note) + "</small>" : "<small>" + it.s + "</small>") + '</button><div class="seg mini3" data-id="' + it.id + '">' + [["yes", prop ? "Build it" : "Bring in"], ["no", "Not now"], ["chg", "Change"]].map(function(o){ return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (p.v === o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div></div>"; }
  el.innerHTML = '<h4 class="sh" style="margin-top:0">In the Parsec file</h4><div class="pkl">' + ITEMS.filter(function(it){ return it.grp === "file"; }).map(row).join("") + '</div><h4 class="sh">Proposals</h4><div class="pkl">' + ITEMS.filter(function(it){ return it.grp === "prop"; }).map(row).join("") + '</div><div class="summary" style="margin-top:22px"><div class="row" style="margin-bottom:8px"><b class="lbl">Send me this</b><span style="flex:1"></span><button type="button" class="btn pri sm" id="cp">' + ic("copy") + 'Copy</button></div><textarea id="st" readonly></textarea></div>';
  $("#st", el).value = picksText();
  $("#cp", el).onclick = function(){ copyText($("#st", el).value); toast("Copied. Paste it in the chat."); };
  el.onclick = function(e){
    var g = e.target.closest("[data-go]"); if(g){ go(idx(g.dataset.go)); return; }
    var b = e.target.closest(".mini3 button"); if(!b) return;
    var s = b.parentNode, id = s.dataset.id, p = PK[id] || {}; p.v = p.v === b.dataset.v ? null : b.dataset.v; PK[id] = p;
    $$("button", s).forEach(function(x){ x.setAttribute("aria-pressed", x.dataset.v === p.v); });
    $("#st", el).value = picksText(); navDots(); side();
  };
}
