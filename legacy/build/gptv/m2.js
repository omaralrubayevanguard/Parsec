/* ===== demos: what is in ChatGPT's Parsec file ===== */

/* 01 · the 52-truck catalog */
function dCatalog(el){
  var fam = "All", view = "s", q = "", sel = "vnl-25-860";
  var fams = ["All", "VNL", "VNR", "VNX", "VHD", "VAH", "VNM", "VT", "VN"];
  el.innerHTML =
    '<div class="card cmpw"><div class="row" style="margin-bottom:10px"><b class="lbl">Same truck, same size</b><span class="k">2025 VNL 860</span><span style="flex:1"></span><button type="button" class="tg" id="zm" aria-pressed="false"><i></i>Zoom ×2</button></div>' +
    '<div class="cmp"><figure><div class="zw"><img src="' + OLD + '" alt=""></div><figcaption>Parsec 9.9 · cut from your screenshot</figcaption></figure><figure><div class="zw"><img src="' + BIG + '" alt=""></div><figcaption>ChatGPT file · the original picture</figcaption></figure></div></div>' +
    '<div style="height:16px"></div>' +
    frame("Truck catalog", "Your data / Trucks",
      '<div class="catd" id="cd"></div><div class="cat-tools"><input class="in" id="cq" placeholder="Year, model or cab · try 2016 or 860" autocomplete="off" style="max-width:300px">' +
      segH("cf", fams.map(function(f){ return [f, f]; }), "All", "Family") + segH("cv", [["s", "Side"], ["t", "Top"]], "s", "View") + '<span class="k" id="cn"></span></div><div class="cat" id="cg"></div>',
      "A truck for its time: 52 bodies from 1997 to 2026, each with a side view and a top view.");
  var zm = $("#zm", el); zm.onclick = function(){ var v = zm.getAttribute("aria-pressed") !== "true"; zm.setAttribute("aria-pressed", v); $(".cmp", el).classList.toggle("zoom", v); };
  function hit(p){
    if(fam !== "All" && p.family.split(" ")[0] !== fam) return false;
    if(!q) return true;
    var n = Number(q); if(/^\d{4}$/.test(q)) return n >= p.from && n <= p.to;
    var t = (p.label + " " + p.family + " " + p.cab + " " + p.body).toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function(w){ return t.indexOf(w) >= 0; });
  }
  function detail(){
    var p = P[sel], tr = vtTrims(p);
    $("#cd", el).innerHTML = '<div class="cdi s">' + pic(p.id, "s") + '</div><div class="cdi t">' + pic(p.id, "t") + '</div><div class="cdt"><span class="k">' + p.family + " · " + yrs(p) + "</span><b>" + p.label + "</b><p>" + esc(p.body) + '</p><div class="row" style="flex-wrap:wrap;gap:6px">' +
      (p.review ? '<span class="pill warn">Check against truck</span>' : '<span class="pill good">Matches by year</span>') +
      (tr.length ? tr.map(function(t){ return '<span class="pill">' + t + "</span>"; }).join("") : '<span class="pill">One finish shown</span>') + "</div></div>";
    fade($("#cd", el));
  }
  function draw(){
    var list = PROF.filter(hit);
    $("#cn", el).textContent = list.length + " of 52";
    $("#cg", el).innerHTML = list.map(function(p){ return '<button type="button" class="cc' + (p.id === sel ? " on" : "") + '" data-id="' + p.id + '"><span class="im' + (view === "t" ? " tv" : "") + '">' + pic(p.id, view) + "</span><strong>" + p.label + "</strong><small>" + yrs(p) + "</small>" + (p.review ? "<em>Check against truck</em>" : "") + "</button>"; }).join("") || '<p class="hint">No truck for that. Try a year between 1997 and 2026.</p>';
  }
  $("#cq", el).oninput = function(){ q = this.value.trim(); draw(); };
  segOn(el, "cf", function(v){ fam = v; draw(); });
  segOn(el, "cv", function(v){ view = v; draw(); });
  $("#cg", el).onclick = function(e){ var b = e.target.closest(".cc"); if(!b) return; sel = b.dataset.id; $$(".cc", el).forEach(function(c){ c.classList.toggle("on", c === b); }); detail(); };
  detail(); draw();
}

/* 02 · Truck & photos dialog */
function dDialog(el){
  var presets = [
    { k: "10482", lbl: "10482 · 2025 VNL 860", year: 2025, model: "Volvo VNL 860", prof: "vnl-25-860", ro: "10482" },
    { k: "10483", lbl: "10483 · 2016 VNL 670", year: 2016, model: "Volvo VNL 670", prof: "", ro: "10483" },
    { k: "10484", lbl: "10484 · 2021 VNR 300", year: 2021, model: "Volvo VNR 300", prof: "", ro: "10484" },
    { k: "vn", lbl: "1999 VN", year: 1999, model: "Volvo VN", prof: "", ro: "10486" },
    { k: "ny", lbl: "VNR 660, no year", year: "", model: "Volvo VNR 660", prof: "", ro: "10487" },
    { k: "old", lbl: "2012 VNL 860", year: 2012, model: "Volvo VNL 860", prof: "", ro: "10486" },
    { k: "mack", lbl: "2024 Mack Anthem", year: 2024, model: "Mack Anthem", prof: "", ro: "10486" }
  ];
  var f, saved, fail = false, busy = false;
  function load(pr){ f = { year: pr.year, model: pr.model, prof: pr.prof, cab: "", trim: "", ps: null, pt: null, ro: RO[pr.ro], k: pr.k }; saved = JSON.stringify(f); }
  load(presets[0]);
  el.innerHTML = '<div class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:12px"><span class="k">Open with</span><div class="chipb" id="pre">' + presets.map(function(p, i){ return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === 0) + '">' + p.lbl + "</button>"; }).join("") + '</div></div>' +
    '<div class="card" style="margin-bottom:16px;padding:14px 16px 2px"><div class="k" style="margin-bottom:6px">RO header · updates when you save</div><div id="hd"></div></div>' +
    '<div class="dlg" role="dialog" aria-labelledby="dlt"><div class="dh"><div><div class="eyebrow mono" id="dle"></div><h3 id="dlt">Truck &amp; photos</h3><p id="dls"></p></div><button type="button" class="btn gh sm" aria-label="Close">' + ic("x") + '</button></div>' +
    '<div class="db"><div class="dgr"><label class="l">Model year<input class="in" id="fy" inputmode="numeric" maxlength="4"></label><label class="l">Volvo model &amp; cab<input class="in" id="fm" list="fml" autocomplete="off"></label></div><datalist id="fml">' + PROF.map(function(p){ return '<option value="Volvo ' + p.family + (/^\d/.test(p.cab) ? " " + p.cab : "") + '">'; }).filter(function(v, i, a){ return a.indexOf(v) === i; }).join("") + '</datalist>' +
    '<div class="match" id="mb"></div><button type="button" class="lnk" id="cat52">Explore the 52-body truck catalog</button>' +
    '<div class="dph"><div><div class="phl"><b>Vehicle photo</b></div><div class="ph" id="ps" tabindex="0"></div><div class="phc"><span class="k" id="psl"></span><span class="tagx" id="pst"></span></div><div class="row" style="gap:8px"><button type="button" class="btn sm" data-pick="ps">' + ic("camera") + 'Choose photo</button><button type="button" class="btn sm gh" data-clr="ps">Remove</button></div><p class="hint">Shown in the repair-order header and locations. Drag a photo here or choose a file.</p></div>' +
    '<div><div class="phl"><b>Location photo</b> <span class="k">optional</span></div><div class="ph top" id="pt" tabindex="0"></div><div class="phc"><span class="k" id="ptl"></span><span class="tagx" id="ptt"></span></div><div class="row" style="gap:8px"><button type="button" class="btn sm" data-pick="pt">' + ic("camera") + 'Choose photo</button><button type="button" class="btn sm gh" data-clr="pt">Remove</button></div><p class="hint">An overhead photo for the bay map, or keep the vehicle photo.</p></div></div>' +
    '<input type="file" accept="image/*" id="fi" hidden></div>' +
    '<div class="df"><span class="msg" id="msg">Changes stay in preview until you save.</span><label class="ckx"><input type="checkbox" id="fail"> Make the next save fail</label><button type="button" class="btn" id="cnl">Cancel</button><button type="button" class="btn pri" id="sv" disabled>Save truck</button></div></div>';
  var fy = $("#fy", el), fm = $("#fm", el), sv = $("#sv", el), msg = $("#msg", el), fi = $("#fi", el), target = "ps";
  function cur(){ return { year: f.year, model: f.model, prof: f.prof, cab: f.cab }; }
  function head(){ var m = vtMatch(cur()), im = f.ps || (m.profile ? src(m.profile.id, "s") : ""); var r = Object.assign({}, f.ro, { year: f.year || "—", model: f.model.replace(/^Volvo /, "") }); $("#hd", el).innerHTML = rohHTML(r, { img: im, cam: false }); }
  function dirty(){ return JSON.stringify(f) !== saved; }
  function paint(){
    var m = vtMatch(cur()), x = vtIdentity(cur()), sp = ST_PILL[m.status], prof = m.profile, cand = m.candidate;
    $("#dle", el).textContent = "RO " + f.ro.no + " · " + (f.model || "Model not set");
    $("#dls", el).textContent = f.ro.cust + " · Match the body generation, or use your own photos.";
    var opts = PROF.filter(function(p){ return !x.family || p.family === x.family; });
    var chosen = prof || cand, tr = vtTrims(prof);
    $("#mb", el).innerHTML = '<p class="st"><span class="pill ' + sp[0] + '">' + sp[1] + "</span> " + m.message + '</p>' + (m.status === "review" ? '<button type="button" class="btn sm cfb" id="cfb">' + ic("check") + 'Yes, this is the body</button>' : '') + '<div class="dgr g2"><label class="l">Body generation<select class="sl" id="fg"><option value="">' + (x.family ? "Choose a body…" : "Pick a Volvo model first") + "</option>" + opts.map(function(p){ return '<option value="' + p.id + '"' + (chosen && chosen.id === p.id ? " selected" : "") + ">" + p.label + " · " + yrs(p) + "</option>"; }).join("") + '</select></label><label class="l">Trim package<select class="sl" id="ft"' + (tr.length ? "" : " disabled") + ">" + (tr.length ? '<option value="">Unspecified</option>' + tr.map(function(t){ return "<option" + (f.trim === t ? " selected" : "") + ">" + t + "</option>"; }).join("") : "<option>Not offered for this body</option>") + '</select></label></div><p class="note">AI-generated body reference. Paint, trim finish, axle setup and accessories are representative. Your own photo takes priority.' + (m.status === "review" ? " Pick the body above to confirm it." : "") + "</p>";
    $("#fg", el).onchange = function(){ var p = P[this.value]; f.prof = this.value; if(p && (p.family === "VN" || p.family === "VNR Electric")) f.cab = p.cab; paint(); };
    var cfb = $("#cfb", el); if(cfb) cfb.onclick = function(){ f.prof = cand.id; paint(); };
    var ft = $("#ft", el); if(tr.length) ft.onchange = function(){ f.trim = this.value; paint(); };
    var show = prof || cand;
    box("ps", f.ps, show ? src(show.id, "s") : "", show ? show.label + (f.year ? " · " + f.year : "") : "No body matched yet", !!cand && !prof);
    box("pt", f.pt, show ? src(show.id, "t") : (f.ps || ""), show ? show.label : (f.ps ? "Uses the vehicle photo" : "Nothing to show yet"), !!cand && !prof);
    if(!busy){ sv.disabled = !dirty(); sv.className = "btn pri"; sv.textContent = "Save truck"; }
  }
  function box(id, own, ill, label, dim){
    var b = $("#" + id, el);
    b.innerHTML = own ? '<img src="' + own + '" alt="">' : ill ? '<img src="' + ill + '" alt=""' + (dim ? ' class="dim"' : "") + ">" : '<span class="k">Drop a photo here</span>';
    $("#" + id + "l", el).textContent = own ? "Your photo" : label;
    var t = $("#" + id + "t", el); t.textContent = own ? "YOUR PHOTO" : ill ? (dim ? "TO CONFIRM" : "ILLUSTRATION") : ""; t.style.display = (own || ill) ? "" : "none";
  }
  function readFile(file, k){ if(!file || !/^image\//.test(file.type)) return; var r = new FileReader(); r.onload = function(){ f[k] = r.result; paint(); }; r.readAsDataURL(file); }
  fy.value = f.year; fm.value = f.model;
  fy.oninput = function(){ f.year = this.value.replace(/\D/g, "").slice(0, 4); paint(); };
  fm.oninput = function(){ f.model = this.value; f.prof = ""; f.trim = ""; paint(); };
  $("#pre", el).onclick = function(e){ var b = e.target.closest("button"); if(!b) return; $$("button", this).forEach(function(x){ x.setAttribute("aria-pressed", x === b); }); load(presets[+b.dataset.i]); fy.value = f.year; fm.value = f.model; msg.className = "msg"; msg.textContent = "Changes stay in preview until you save."; paint(); head(); };
  el.addEventListener("click", function(e){
    var p = e.target.closest("[data-pick]"), c = e.target.closest("[data-clr]");
    if(p){ target = p.dataset.pick === "ps" ? "ps" : "pt"; fi.click(); }
    if(c){ f[c.dataset.clr] = null; paint(); }
  });
  fi.onchange = function(){ readFile(fi.files[0], target); fi.value = ""; };
  ["ps", "pt"].forEach(function(k){
    var b = $("#" + k, el);
    b.addEventListener("dragover", function(e){ e.preventDefault(); b.classList.add("drag"); });
    b.addEventListener("dragleave", function(){ b.classList.remove("drag"); });
    b.addEventListener("drop", function(e){ e.preventDefault(); b.classList.remove("drag"); readFile(e.dataTransfer.files[0], k); });
  });
  $("#fail", el).onchange = function(){ fail = this.checked; };
  $("#cnl", el).onclick = function(){ var s = JSON.parse(saved); f = s; f.ro = RO[s.ro.no]; fy.value = f.year; fm.value = f.model; paint(); };
  $("#cat52", el).onclick = function(){ go(idx("catalog")); };
  sv.onclick = function(){
    if(busy) return; busy = true; sv.disabled = true; sv.innerHTML = '<span class="spin"></span>Saving…'; msg.className = "msg"; msg.textContent = "Saving to RO " + f.ro.no + "…";
    later(function(){
      busy = false;
      if(fail){ fail = false; $("#fail", el).checked = false; sv.disabled = false; sv.className = "btn pri"; sv.innerHTML = ic("refresh") + "Retry save"; msg.className = "msg err"; msg.textContent = "Couldn't save. Your changes are still here."; return; }
      saved = JSON.stringify(f); sv.className = "btn ok"; sv.innerHTML = ic("check") + "Saved"; msg.className = "msg ok"; msg.textContent = "Saved to RO " + f.ro.no + "."; head(); fade($("#hd .pic", el));
      later(function(){ if(!busy) paint(); }, 1400);
    }, 700);
  };
  paint(); head();
}

/* 03 · where the truck shows */
function dPlaces(el){
  var tab = "ro", sel = "10482";
  el.innerHTML = '<div class="row" style="margin-bottom:12px;flex-wrap:wrap">' + segH("pl", [["ro", "RO page"], ["fm", "Foreman"], ["yd", "Yard"], ["sr", "Search"]], "ro", "Place") + '<span class="k" id="plk"></span></div><div id="pv"></div>';
  var pv = $("#pv", el);
  function draw(){
    var ro = RO[sel];
    if(tab === "ro"){
      $("#plk", el).textContent = "Picture in the title block, camera badge opens Truck & photos.";
      pv.innerHTML = frame("Repair order", "ROs / " + sel, '<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:14px">' + ROS.map(function(r){ return '<button type="button" class="btn sm' + (r.no === sel ? " acc" : "") + '" data-ro="' + r.no + '">' + r.no + "</button>"; }).join("") + "</div>" + rohHTML(ro, { vin: 1 }) + '<div class="ln"><span class="k">Complaint</span><b>' + ro.cx + "</b></div>");
      fade($(".roh", pv));
    } else if(tab === "fm"){
      $("#plk", el).textContent = "Header picture plus a top view in each bay, cab up.";
      pv.innerHTML = frame("Foreman", "Floor / Bays", '<div class="fmh">' + '<span class="fmp">' + pic(ro.p, "s") + '</span><div><b>RO ' + ro.no + " · " + ro.cust + '</b><span class="k">' + ro.year + " Volvo " + ro.model + " · " + ro.stage + "</span></div></div>" + '<div class="bays fx-lift">' + Object.keys(BAYS0).map(function(b){ var r = RO[BAYS0[b]]; return bayHTML(b, r, r && r.no === sel ? " sel" : ""); }).join("") + "</div>");
    } else if(tab === "yd"){
      $("#plk", el).textContent = "Yard spots get a small top view.";
      var Y = [["Y1", "10486"], ["Y2", null], ["Y3", "10487"], ["Y4", "x1"], ["Y5", null], ["Y6", "x2"], ["Y7", null], ["Y8", "x3"]];
      var X = { x1: ["vnm-200", "Waiting", "2014 VNM 200"], x2: ["vah-21-300", "Ready", "2023 VAH 300"], x3: ["vnx-18-400", "Parked", "2020 VNX 400"] };
      pv.innerHTML = frame("Foreman", "Floor / Yard", '<div class="yard">' + Y.map(function(y){ var r = RO[y[1]], x = X[y[1]]; if(!r && !x) return '<div class="spot free">' + y[0] + "</div>"; var id = r ? r.p : x[0]; return '<div class="spot">' + y[0] + "<b>" + (r ? r.no : x[1]) + "</b><small>" + (r ? r.year + " " + r.model : x[2]) + '</small><span class="tv">' + pic(id, "t") + "</span></div>"; }).join("") + "</div>", "Yard spots are new in ChatGPT's file. Parsec 9.9 has no picture there.");
    } else {
      $("#plk", el).textContent = "Search finds a truck by model or year and shows it.";
      pv.innerHTML = frame("Search", "Search", '<div class="pin2">' + ic("search") + '<input id="sq" placeholder="Search number, customer, truck, year, VIN" autocomplete="off"></div><div class="list" id="sl"></div>');
      var sl = $("#sl", pv), sq = $("#sq", pv);
      var list = function(){ var q = sq.value.trim().toLowerCase(); sl.innerHTML = ROS.filter(function(r){ return !q || (r.no + " " + r.cust + " " + r.model + " " + r.year + " " + r.vin).toLowerCase().indexOf(q) >= 0; }).map(function(r){ return '<div class="it">' + thumb(r) + "<b>" + r.no + " · " + r.cust + "</b><small>" + r.year + " Volvo " + r.model + " · " + r.stage + '</small><span class="r pill">' + (r.ini || "—") + "</span></div>"; }).join("") || '<p class="hint">Nothing matches.</p>'; };
      sq.oninput = list; list();
    }
  }
  segOn(el, "pl", function(v){ tab = v; draw(); });
  pv.addEventListener("click", function(e){ var b = e.target.closest("[data-ro]"); if(b){ sel = b.dataset.ro; draw(); } });
  draw();
}

/* 04 · White / Near black */
function dTheme(el){
  var T = [["white", "White", "ChatGPT", ["#f5f6f8", "#ffffff", "#171c24", "#245cdb"]], ["black", "Near black", "ChatGPT", ["#0b0d10", "#191d23", "#edf1f7", "#8aafff"]], ["ivory", "Ivory", "Parsec now", ["#F2F0EA", "#FBFAF7", "#1D1C1A", "#86643A"]], ["graphite", "Graphite", "Parsec now", ["#0E0E0D", "#1D1D1B", "#EDEBE6", "#D1B184"]]];
  el.innerHTML = '<div class="th4">' + T.map(function(t){
    return '<div class="thp" data-th="' + t[0] + '"><div class="tt"><span>' + t[1] + '</span><span class="k">' + t[2] + '</span></div><div class="tb"><div class="sw">' + t[3].map(function(c){ return '<i style="background:' + c + '"></i>'; }).join("") + '</div>' +
      '<div class="navi">' + ic("console") + 'Console</div><div class="navi on">' + ic("foreman") + 'Foreman</div><div class="navi">' + ic("ros") + "RO list</div>" +
      bayHTML("B1", RO["10482"]) + '<div class="row" style="gap:6px"><button type="button" class="btn pri sm">Save</button><span class="pill acc">In repair</span></div>' +
      '<button type="button" class="btn sm" data-use="' + t[0] + '" style="width:100%">Use on this page</button></div></div>';
  }).join("") + "</div>";
  el.onclick = function(e){ var b = e.target.closest("[data-use]"); if(b) setTheme(b.dataset.use); };
}

/* 05 · icons */
function dIcons(el){
  var both = ["console", "triage", "ros", "foreman", "warranty", "manager", "parts", "fixes", "career", "inbox", "search", "user", "gear", "plus", "x", "check", "note", "bell", "clock", "save", "trash", "copy", "swap", "link", "play", "stop", "sun", "moon", "sidebar", "more", "chevD", "chevR"];
  var add = ["camera", "truck", "calendar", "filter", "pin", "upload", "download", "lock", "flag", "route", "tools", "bolt", "target", "refresh", "document", "users"];
  el.innerHTML = '<div class="row" style="margin-bottom:12px;flex-wrap:wrap">' + segH("iv", [["both", "Side by side"], ["old", "Parsec now"], ["new", "ChatGPT"]], "both", "Icons") + segH("isz", [["16", "16 px"], ["20", "20 px"], ["24", "24 px"]], "20", "Size") + '</div><div class="ico-grid" id="ig"></div><h4 class="sh">New icons in ChatGPT\'s set</h4><div class="ico-grid" id="ig2"></div>';
  var mode = "both", sz = 20;
  function draw(){
    $("#ig", el).innerHTML = both.map(function(k){ return '<div class="ico-cell" style="--isz:' + sz + 'px"><span class="pair">' + (mode !== "new" ? icOld(k) : "") + (mode === "both" ? '<i class="vs"></i>' : "") + (mode !== "old" ? ic(k, "nw") : "") + "</span>" + k + "</div>"; }).join("");
    $("#ig2", el).innerHTML = add.map(function(k){ return '<div class="ico-cell" style="--isz:' + sz + 'px"><span class="pair">' + ic(k, "nw") + "</span>" + k + "</div>"; }).join("");
  }
  segOn(el, "iv", function(v){ mode = v; draw(); });
  segOn(el, "isz", function(v){ sz = +v; draw(); });
  draw();
}

/* 06 · bay focus (160 ms) */
function dBayFocus(el){
  var sel = "10482", mode = "new";
  el.innerHTML = '<div class="row" style="margin-bottom:12px">' + segH("cm", [["new", "ChatGPT"], ["old", "Parsec now"]], "new", "Compare") + '<span class="k">Hover, press and click a bay. Tab and Enter work too.</span></div>' +
    frame("Foreman", "Floor / Bays", '<div id="hd" class="hdw"></div><div class="row" style="margin:14px 0 8px"><b class="lbl">Bays</b><span class="k">4 of 6 in use</span></div><div class="bays fx-lift" id="bs"></div>', "The card lifts 2 px on hover, settles on press and keeps a blue edge when selected.");
  function head(){ var r = RO[sel]; $("#hd", el).innerHTML = '<div class="hdr"><div><div class="eb mono">RO ' + r.no + ' · <span class="st ' + r.st + '">' + r.stage + "</span></div><b>" + r.cust + '</b><span class="k">' + r.year + " Volvo " + r.model + " · Unit " + r.unit + '</span><p class="nx"><span class="k">Next</span> ' + r.next + '</p></div><span class="hp">' + pic(r.p, "s") + "</span></div>"; if(mode === "new") fade($("#hd .hdr", el)); }
  function draw(){ $("#bs", el).innerHTML = Object.keys(BAYS0).map(function(b){ var r = RO[BAYS0[b]]; return bayHTML(b, r, r && r.no === sel ? " sel" : ""); }).join(""); $$(".bay.sel", el).forEach(function(b){ b.setAttribute("aria-pressed", "true"); }); }
  function pick(b){ if(!b || !b.dataset.ro || b.dataset.ro === sel) return; sel = b.dataset.ro; $$("#bs .bay", el).forEach(function(x){ var s = x === b; x.classList.toggle("sel", s); x.setAttribute("aria-pressed", s); }); head(); }
  $("#bs", el).onclick = function(e){ pick(e.target.closest(".bay")); };
  $("#bs", el).onkeydown = function(e){ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); pick(e.target.closest(".bay")); } };
  segOn(el, "cm", function(v){ mode = v; $("#bs", el).classList.toggle("fx-lift", v === "new"); $("#bs", el).classList.toggle("plain", v === "old"); });
  head(); draw();
}

/* 07 · RO switching (180 ms) */
function dSwitch(el){
  var sel = "10482", mode = "new";
  el.innerHTML = '<div class="row" style="margin-bottom:12px">' + segH("cm", [["new", "ChatGPT"], ["old", "Parsec now"]], "new", "Compare") + '<span class="k">Click an RO, or use ↑ ↓ in the list.</span></div>' +
    frame("Repair orders", "ROs", '<div class="sw2"><div class="list" id="ls" tabindex="0" role="listbox" aria-label="Repair orders"></div><div class="card" id="hd"></div></div>', "The header fades in from 4 px below. Your place in the list stays put.");
  function list(){ $("#ls", el).innerHTML = ROS.map(function(r){ return '<div class="it' + (r.no === sel ? " on" : "") + '" role="option" aria-selected="' + (r.no === sel) + '" data-ro="' + r.no + '">' + thumb(r) + "<b>" + r.no + " · " + first(r.cust) + "</b><small>" + r.year + " " + r.model + "</small></div>"; }).join(""); }
  function head(){ $("#hd", el).innerHTML = rohHTML(RO[sel], { cam: false }) + '<div class="ln"><span class="k">Complaint</span><b>' + RO[sel].cx + '</b></div><div class="ln"><span class="k">Next</span><span>' + RO[sel].next + "</span></div>"; if(mode === "new") fade($("#hd", el)); }
  function pick(no){ if(no === sel) return; sel = no; $$("#ls .it", el).forEach(function(x){ var s = x.dataset.ro === no; x.classList.toggle("on", s); x.setAttribute("aria-selected", s); }); head(); }
  $("#ls", el).onclick = function(e){ var it = e.target.closest(".it"); if(it) pick(it.dataset.ro); };
  $("#ls", el).onkeydown = function(e){ var i = ROS.findIndex(function(r){ return r.no === sel; }); if(e.key === "ArrowDown"){ e.preventDefault(); pick(ROS[Math.min(ROS.length - 1, i + 1)].no); } if(e.key === "ArrowUp"){ e.preventDefault(); pick(ROS[Math.max(0, i - 1)].no); } };
  segOn(el, "cm", function(v){ mode = v; });
  list(); head();
}

/* 08 · truck transfer (220 ms) */
function dTransfer(el){
  var bays = Object.assign({}, BAYS0), sel = "B1", drag = null;
  el.innerHTML = '<div class="row" style="margin-bottom:12px;flex-wrap:wrap"><span class="k">Drag a truck to a free bay, or select a bay and press Move truck. Esc cancels a drag.</span></div>' +
    frame("Foreman", "Floor / Bays", '<div class="row" style="margin-bottom:10px"><b class="lbl" id="sl"></b><span style="flex:1"></span><button type="button" class="btn sm" id="mv">' + ic("swap") + 'Move truck</button></div><div class="mvd" id="mvd" hidden></div><div class="bays fx-lift" id="bs"></div>', "Free bays light up while you drag; busy bays dim. The truck flies to its new bay, and Undo flies it back.");
  var bs = $("#bs", el);
  function draw(){ bs.innerHTML = Object.keys(bays).map(function(b){ return bayHTML(b, RO[bays[b]], b === sel && bays[b] ? " sel" : ""); }).join(""); var r = RO[bays[sel]]; $("#sl", el).textContent = r ? "Selected · " + sel + " · RO " + r.no : "Select a truck"; $("#mv", el).disabled = !r; }
  function move(from, to, rectA, again){
    var no = bays[from]; if(!no || bays[to]) return;
    var dest = $('.bay[data-bay="' + to + '"]', bs), b = topRect(dest);
    var srcBay = $('.bay[data-bay="' + from + '"]', bs); if(srcBay){ srcBay.classList.add("src"); var t = $(".top", srcBay); if(t) t.style.visibility = "hidden"; }
    fly(rectA || topRect(srcBay), b, src(RO[no].p, "t"), 220, function(){
      bays[to] = no; bays[from] = null; sel = to; draw();
      var d = $('.bay[data-bay="' + to + '"]', bs); if(d && MOTION) d.animate([{ boxShadow: "0 0 0 2px var(--acc)" }, { boxShadow: "0 0 0 0 transparent" }], { duration: 600 });
      if(!again) toast("RO " + no + " moved to " + to + ".", function(){ move(to, from, null, true); });
    });
  }
  function free(){ return Object.keys(bays).filter(function(b){ return !bays[b]; }); }
  $("#mv", el).onclick = function(){
    var d = $("#mvd", el); if(!d.hidden){ d.hidden = true; return; }
    d.innerHTML = '<span class="k">Move RO ' + bays[sel] + " to</span>" + free().map(function(b){ return '<button type="button" class="btn sm" data-to="' + b + '">' + b + "</button>"; }).join("") + '<button type="button" class="btn sm gh" data-x>Cancel</button>';
    d.hidden = false; var fb = $("[data-to]", d); if(fb) fb.focus();
  };
  $("#mvd", el).onclick = function(e){ var b = e.target.closest("button"); if(!b) return; this.hidden = true; if(b.dataset.to) move(sel, b.dataset.to); };
  bs.addEventListener("click", function(e){ var b = e.target.closest(".bay"); if(b && b.dataset.ro && !drag){ sel = b.dataset.bay; draw(); $("#mvd", el).hidden = true; } });
  bs.addEventListener("keydown", function(e){ var b = e.target.closest(".bay"); if(b && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); sel = b.dataset.bay; draw(); var n = $('.bay[data-bay="' + sel + '"]', bs); if(n) n.focus(); } });
  bs.addEventListener("pointerdown", function(e){
    var b = e.target.closest(".bay"); if(!b || !b.dataset.ro || e.button !== 0) return;
    drag = { from: b.dataset.bay, x: e.clientX, y: e.clientY, on: false, g: null, over: null };
  });
  function end(drop){
    if(!drag) return; var d = drag; drag = null;
    bs.classList.remove("dragging"); $$(".bay", bs).forEach(function(x){ x.classList.remove("over", "src"); });
    if(!d.on){ return; }
    var gr = d.g.getBoundingClientRect(); d.g.remove();
    if(drop && d.over){ move(d.from, d.over, gr); }
    else { var sb = $('.bay[data-bay="' + d.from + '"]', bs), t = sb && $(".top", sb); if(t) t.style.visibility = "hidden"; fly(gr, topRect(sb), src(RO[bays[d.from]].p, "t"), 180, function(){ if(t) t.style.visibility = ""; }); }
  }
  on(window, "pointermove", function(e){
    if(!drag) return;
    if(!drag.on){ if(Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) < 6) return; drag.on = true; bs.classList.add("dragging"); var sb = $('.bay[data-bay="' + drag.from + '"]', bs); sb.classList.add("src"); var g = D.createElement("div"); g.className = "ghost"; g.innerHTML = '<img src="' + src(RO[bays[drag.from]].p, "t") + '" alt="">'; g.style.cssText = "width:30px;height:60px"; D.body.appendChild(g); drag.g = g; }
    drag.g.style.left = (e.clientX - 15) + "px"; drag.g.style.top = (e.clientY - 30) + "px";
    var u = D.elementFromPoint(e.clientX, e.clientY), b = u && u.closest && u.closest(".bay");
    var ok = b && bs.contains(b) && !bays[b.dataset.bay] ? b.dataset.bay : null;
    if(ok !== drag.over){ $$(".bay", bs).forEach(function(x){ x.classList.toggle("over", x.dataset.bay === ok); }); drag.over = ok; }
  });
  on(window, "pointerup", function(){ if(drag){ var was = drag.on; end(true); if(was){ var stop = function(ev){ ev.stopPropagation(); bs.removeEventListener("click", stop, true); }; bs.addEventListener("click", stop, true); setTimeout(function(){ bs.removeEventListener("click", stop, true); }, 50); } } });
  on(window, "keydown", function(e){ if(e.key === "Escape" && drag){ end(false); } });
  draw();
}

/* 09 · save feedback (160 ms) */
function dSave(el){
  var fail = false, busy = false, val = "Replaced the charge-air cooler clamp; boost back to spec on the road test.", saved = val;
  el.innerHTML = '<div class="states"><span class="k">The four states</span><button type="button" class="btn pri sm" tabindex="-1">Save</button><button type="button" class="btn pri sm" tabindex="-1"><span class="spin"></span>Saving…</button><button type="button" class="btn ok sm" tabindex="-1">' + ic("check") + 'Saved</button><button type="button" class="btn pri sm" tabindex="-1">' + ic("refresh") + "Retry save</button></div>" +
    frame("Repair order", "ROs / 10482 / Job 1", '<label class="l">Correction<textarea class="in ta" id="tx">' + esc(val) + '</textarea></label><div class="row" style="margin-top:12px;flex-wrap:wrap"><span class="msg" id="msg">Saved.</span><span style="flex:1"></span><label class="ckx"><input type="checkbox" id="fl"> Make the next save fail</label><button type="button" class="btn pri" id="sv" disabled>Save</button></div>', "The button itself says what happened. A failed save keeps your text and offers Retry.");
  var sv = $("#sv", el), msg = $("#msg", el), tx = $("#tx", el);
  tx.oninput = function(){ if(busy) return; sv.disabled = tx.value === saved; sv.className = "btn pri"; sv.textContent = "Save"; msg.className = "msg"; msg.textContent = tx.value === saved ? "Saved." : "Not saved yet."; };
  $("#fl", el).onchange = function(){ fail = this.checked; };
  sv.onclick = function(){
    busy = true; sv.disabled = true; sv.innerHTML = '<span class="spin"></span>Saving…'; msg.className = "msg"; msg.textContent = "Saving…";
    later(function(){
      busy = false;
      if(fail){ fail = false; $("#fl", el).checked = false; sv.disabled = false; sv.innerHTML = ic("refresh") + "Retry save"; msg.className = "msg err"; msg.textContent = "Couldn't save. Check the connection and retry."; return; }
      saved = tx.value; sv.className = "btn ok"; sv.innerHTML = ic("check") + "Saved"; msg.className = "msg ok"; msg.textContent = "Saved just now.";
      later(function(){ if(!busy && tx.value === saved){ sv.className = "btn pri"; sv.textContent = "Save"; sv.disabled = true; msg.className = "msg"; msg.textContent = "Saved."; } }, 1400);
    }, 650);
  };
  tx.value = val + " "; tx.oninput();
}

/* 10 · repair progress (220 ms) */
function dProgress(el){
  var S = ["Diagnose", "Approval", "Repair", "Road test"], done = 2;
  el.innerHTML = frame("Repair order", "ROs / 10482", rohHTML(RO["10482"], { cam: false }) + '<div class="steps" id="st"></div><div class="sgb" id="sg"></div><div class="row" style="margin-top:16px;gap:8px;flex-wrap:wrap"><button type="button" class="btn pri" id="ck"></button><button type="button" class="btn" id="ro"></button></div>', "The segment fills in 220 ms, the step pops, and a toast offers Undo.");
  function draw(pop){
    $("#st", el).innerHTML = '<div class="line"><i style="width:' + (Math.min(done, 3) / 3 * 100) + '%"></i></div>' + S.map(function(s, i){ var c = i < done ? "done" : i === done ? "now" : ""; return '<div class="s ' + c + '"><i class="' + (pop === i ? "pop" : "") + '">' + (i < done ? "✓" : i + 1) + "</i>" + s + "</div>"; }).join("");
    $("#sg", el).innerHTML = S.map(function(s, i){ return '<span><i style="transform:scaleX(' + (i < done ? 1 : 0) + ')"></i></span>'; }).join("");
    var ck = $("#ck", el), ro = $("#ro", el);
    ck.disabled = done >= S.length; ck.innerHTML = done >= S.length ? ic("check") + "All steps done" : ic("check") + "Check off " + S[done];
    ro.disabled = done === 0; ro.textContent = done ? "Reopen " + S[done - 1] : "Reopen";
  }
  $("#ck", el).onclick = function(){ var s = S[done]; var before = done; done++; animate(before, true); toast(s + " checked off.", function(){ done = before; animate(before, false); }); };
  $("#ro", el).onclick = function(){ var before = done; done--; var s = S[done]; animate(done, false); toast(s + " reopened.", function(){ done = before; animate(before - 1, true); }); };
  function animate(i, fill){
    draw(fill ? i : -1);
    var seg = $$("#sg i", el)[i]; if(seg && MOTION) seg.animate([{ transform: "scaleX(" + (fill ? 0 : 1) + ")" }, { transform: "scaleX(" + (fill ? 1 : 0) + ")" }], { duration: 220, easing: "cubic-bezier(.2,.75,.25,1)" });
  }
  draw();
}

/* 11 · quick search (140 ms) */
function dSearch(el){
  var open = false, q = "", i = 0, res = ROS, opened = "10482";
  el.innerHTML = '<div class="frame" id="sf" style="position:relative;min-height:440px"><div class="fh">' + ic("grid") + '<b>Parsec</b><span class="live">PREVIEW</span><span class="sp"></span><button type="button" class="btn sm" id="so" aria-haspopup="dialog">' + ic("search") + 'Search <kbd>Ctrl</kbd><kbd>K</kbd></button></div><div class="fb" id="sb"></div></div>';
  var sf = $("#sf", el), opener = $("#so", el);
  function body(){ $("#sb", el).innerHTML = '<div class="k" style="margin-bottom:8px">Opened from search</div>' + rohHTML(RO[opened], { cam: false }); fade($("#sb .roh", el)); }
  function rows(){
    var t = q.toLowerCase(); res = ROS.filter(function(r){ return !t || (r.no + " " + r.cust + " " + r.model + " " + r.year + " " + r.vin + " " + r.tech).toLowerCase().indexOf(t) >= 0; });
    if(i >= res.length) i = Math.max(0, res.length - 1);
    $("#pl", sf).innerHTML = res.map(function(r, n){ return '<div class="pr' + (n === i ? " sel" : "") + '" role="option" id="opt' + n + '" aria-selected="' + (n === i) + '" data-n="' + n + '">' + thumb(r) + "<b>" + r.no + " · " + r.cust + "</b><small>" + r.year + " Volvo " + r.model + " · " + r.stage + '</small><span class="kb">' + (n === i ? "↵" : "") + "</span></div>"; }).join("") || '<p class="hint" style="padding:10px">No repair order matches.</p>';
    var inp = $("#pi", sf); inp.setAttribute("aria-activedescendant", res.length ? "opt" + i : "");
  }
  function show(){
    if(open) return; open = true; q = ""; i = 0;
    var o = D.createElement("div"); o.className = "so"; o.innerHTML = '<div class="pal" role="dialog" aria-label="Find a repair order"><div class="pin">' + ic("search") + '<input id="pi" role="combobox" aria-expanded="true" aria-controls="pl" aria-autocomplete="list" placeholder="Search number, customer, truck, year, VIN" autocomplete="off"><kbd>Esc</kbd></div><div class="pl" id="pl" role="listbox"></div><div class="pf"><span><kbd>↑</kbd> <kbd>↓</kbd> to move</span><span><kbd>Enter</kbd> to open</span><span><kbd>Esc</kbd> to close</span></div></div>';
    sf.appendChild(o); if(MOTION) $(".pal", o).animate([{ opacity: 0, transform: "translateY(-6px) scale(.985)" }, { opacity: 1, transform: "none" }], { duration: 140, easing: "cubic-bezier(.2,.75,.25,1)" });
    var inp = $("#pi", o); inp.focus(); rows();
    inp.oninput = function(){ q = inp.value; i = 0; rows(); };
    inp.onkeydown = function(e){
      if(e.key === "ArrowDown"){ e.preventDefault(); i = Math.min(res.length - 1, i + 1); rows(); }
      else if(e.key === "ArrowUp"){ e.preventDefault(); i = Math.max(0, i - 1); rows(); }
      else if(e.key === "Enter"){ e.preventDefault(); if(res[i]){ opened = res[i].no; hide(); body(); } }
      else if(e.key === "Escape"){ e.preventDefault(); hide(); }
    };
    o.onclick = function(e){ var r = e.target.closest(".pr"); if(r){ opened = res[+r.dataset.n].no; hide(); body(); } else if(e.target === o) hide(); };
    o.onmousemove = function(e){ var r = e.target.closest(".pr"); if(r && +r.dataset.n !== i){ i = +r.dataset.n; rows(); } };
  }
  function hide(){ var o = $(".so", sf); if(o) o.remove(); open = false; opener.focus(); }
  opener.onclick = show;
  on(window, "keydown", function(e){ if((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")){ e.preventDefault(); open ? hide() : show(); } });
  body();
}

/* 12 · small changes */
function dSmall(el){
  var codes = "ABCDEFGHJKLMNPRSTVWXY123456789";
  function vinYears(ch){ var n = codes.indexOf(String(ch || "").toUpperCase()); if(n < 0) return []; return [1980 + n, 2010 + n].filter(function(y){ return y <= 2027; }); }
  function famRange(fam){ var l = PROF.filter(function(p){ return p.family === fam; }); if(fam === "VNL") l = l.concat(PROF.filter(function(p){ return p.family === "VN"; })); return l.length ? [Math.min.apply(0, l.map(function(p){ return p.from; })), Math.max.apply(0, l.map(function(p){ return p.to; }))] : null; }
  var C = [
    ["year", "Model year on New RO", '<div class="dgr"><label class="l">Model<input class="in" id="nm" value="Volvo VNL 860"></label><label class="l"><span>Model year <em class="nw">New</em></span><input class="in" id="ny" value="2025" maxlength="4" inputmode="numeric"></label></div><div class="nrm" id="nr"></div>'],
    ["vin", "The year from the VIN", '<label class="l">VIN<input class="in mono" id="vn" value="4V4NC9EH0GN104483" maxlength="17" spellcheck="false"></label><div id="vr" class="vr"></div>'],
    ["undo", "Undo only for the latest action", '<p class="hint" style="margin:0 0 10px">Two quick actions: the first Undo goes away once the second one happens, so Undo never reverses the wrong thing.</p><button type="button" class="btn sm" id="u2">' + ic("play") + "Do two actions</button>"],
    ["ph", "Search finds trucks and years", '<div class="pin2 dim">' + ic("search") + '<input disabled placeholder="Search number, customer, VIN"></div><div class="k" style="margin:6px 0 4px">ChatGPT</div><div class="pin2">' + ic("search") + '<input disabled placeholder="Search number, customer, truck, year, VIN"></div>'],
    ["a11y", "Keyboard and screen readers", '<ul class="ul"><li>Bays open with Enter or Space.</li><li>Tabs and the search list are announced as tabs and a list.</li><li>Closing a dialog or search puts focus back where you were.</li></ul>'],
    ["rm", "Reduced motion", '<p class="hint" style="margin:0 0 10px">When Windows has animations turned off, every motion here becomes an instant change.</p><button type="button" class="tg" id="rmt" aria-pressed="false"><i></i>Simulate animations off</button>'],
    ["leave", "Leave these preview parts out", '<ul class="ul"><li>Sample trucks loaded into your data.</li><li>Foreman as the start page.</li><li>Its own saved-data names (pv95_), which would start from empty instead of your saved ROs.</li></ul>']
  ];
  el.innerHTML = '<div class="grid2 small">' + C.map(function(c){ var v = (PK["s:" + c[0]] || {}).v; return '<div class="card sc"><div class="row" style="margin-bottom:10px"><b class="lbl">' + c[1] + '</b><span style="flex:1"></span><div class="seg mini" data-sp="' + c[0] + '"><button type="button" data-v="yes" aria-pressed="' + (v === "yes") + '">' + (c[0] === "leave" ? "Agree" : "Yes") + '</button><button type="button" data-v="no" aria-pressed="' + (v === "no") + '">' + (c[0] === "leave" ? "Keep" : "No") + "</button></div></div>" + c[2] + "</div>"; }).join("") + "</div>";
  el.addEventListener("click", function(e){ var b = e.target.closest(".seg.mini button"); if(!b) return; var s = b.parentNode, k = "s:" + s.dataset.sp, v = b.getAttribute("aria-pressed") === "true" ? null : b.dataset.v; $$("button", s).forEach(function(x){ x.setAttribute("aria-pressed", x.dataset.v === v); }); PK[k] = { v: v }; navDots(); });
  function nr(){ var m = vtMatch({ year: $("#ny", el).value, model: $("#nm", el).value }), sp = ST_PILL[m.status], p = m.profile || m.candidate; $("#nr", el).innerHTML = '<span class="nt">' + (p ? pic(p.id, "s") : "") + '</span><div><span class="pill ' + sp[0] + '">' + sp[1] + '</span><div class="k" style="margin-top:4px">' + (p ? p.label + " · " + yrs(p) : m.message) + "</div></div>"; }
  $("#ny", el).oninput = nr; $("#nm", el).oninput = nr; nr();
  function vr(){
    var v = $("#vn", el).value.toUpperCase(), ch = v[9], ys = vinYears(ch), r = famRange("VNL");
    $("#vr", el).innerHTML = '<div class="row" style="gap:6px;flex-wrap:wrap;margin:8px 0"><span class="k">10th character</span><span class="age mono">' + (ch || "?") + '</span><span class="k">could be</span>' + (ys.length ? ys.map(function(y){ var fit = r && y >= r[0] && y <= r[1]; return '<span class="pill ' + (fit ? "good" : "") + '"' + (fit ? "" : ' style="text-decoration:line-through"') + ">" + y + "</span>"; }).join("") : '<span class="k">—</span>') + '</div><p class="hint" style="margin:0">The letter repeats every 30 years, so ChatGPT stopped reading it and asks for the year. A VNL can only be ' + (r ? r[0] + "–" + r[1] : "") + ", so the model already settles most VINs.</p>";
  }
  $("#vn", el).oninput = vr; vr();
  $("#u2", el).onclick = function(){ toast("Diagnose checked off.", function(){ toast("Diagnose reopened."); }); later(function(){ toast("RO 10484 moved to B2.", function(){ toast("RO 10484 back in B3."); }); }, 1300); };
  $("#rmt", el).onclick = function(){ var v = this.getAttribute("aria-pressed") !== "true"; this.setAttribute("aria-pressed", v); setMotion(!v); };
}
