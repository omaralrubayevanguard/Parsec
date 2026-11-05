/* Parsec · settings · registry.js
   The registry: SG_REG, every setting as one row — id, group, label, help, who may change it, where it applies, get / set, default. sgReg() is what other areas call to add one.
   Flow: the page draws from SG_REG; a change goes through sgChange (values-and-changes.js).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   sgReg SG_REG SG_BY (1 function, 2 constants)
   state      laborRate shop staff techName tgTemplates
   uses       access/ automations/ boot/ clock/ data/ kit/ pages/ pages/foreman/ pages/rolist/ pages/triage/ pages/warranty/ ro/ ro-page/ shell/ state/
*/
/* ---------- the registry ---------- */
var SG_REG = [
  /* ---- Me ---- */
  { id: "me.photo", g: "me", sub: "You", label: "Your photo", help: "on your punches, the Foreman board and the sign-in page", who: "me", where: "Everywhere your name shows", kind: "custom",
    show: function(){ return !!sgMe(); }, render: function(){ var me = sgMe();
      return '<div class="sg-you">' + pxAv("px-av xl") + '<span class="r"><label class="px-btn sm">' + pxI("camera", 13) + 'Upload a photo<input type="file" accept="image/*" data-photo="' + me.id + '" hidden></label>'
        + (me.photo ? '<button class="px-btn sm" data-action="staff-photo-clear" data-id="' + me.id + '">Use the portrait</button>' : '') + '</span></div>'; } },
  { id: "me.name", g: "me", sub: "You", label: "Your name", help: "on your punches and notes when no one is signed in", who: "me", where: "Punches and notes made as the Admin", kind: "text", ph: "Your name",
    show: function(){ return !sgMe(); }, def: "", get: function(){ return String(STATE.techName || ""); }, set: function(v){ STATE.techName = String(v || "").trim(); } },
  { id: "me.theme", g: "me", sub: "Look", label: "Theme", help: "Ivory and Graphite, White and Near black, and more themes", who: "me", per: "computer", where: "Every page", kind: "seg",
    opts: function(){ return THEME_ORDER.concat(THEME_MORE).map(function(m){ return [m, themeLabel(m)]; }); }, def: "ivl", get: function(){ return THEME; }, set: function(v){ applyTheme(v); } },
  { id: "me.size", g: "me", sub: "Look", label: "Size", help: "bigger buttons and text for gloves or a tablet", who: "me", per: "computer", where: "Every page", kind: "seg",
    opts: [["normal", "Normal"], ["large", "Large"], ["floor", "Shop floor"]], def: "normal", get: function(){ return sizeMode(); },
    set: function(v){ UI.size = SIZES.indexOf(v) > -1 ? v : "normal"; persistUI(); applyBigTouch(); } },
  { id: "me.screen", g: "me", sub: "Look", label: "Screen", help: "Automatic: the phone view on a phone, the computer view everywhere else", who: "me", per: "computer", where: "Every page", kind: "seg", quiet: true,
    opts: [["auto", "Automatic"], ["desktop", "Computer"], ["phone", "Phone"]], def: "auto", get: function(){ return DEVICE_SETTING === "tablet" ? "desktop" : DEVICE_SETTING; }, set: function(v){ setDevice(v); } },
  { id: "me.tips", g: "me", sub: "Look", label: "Tooltips", help: "Fewer: keys on icon buttons, why a button is off, cut-off text", who: "me", where: "Every page — the tips when you hover or hold", kind: "seg",
    opts: function(){ return PTIP_MODES; }, def: "all", get: function(){ return ptipMode(); }, set: function(v){ ptipSetMode(v); } },
  { id: "me.ribbon", g: "me", sub: "Look", label: "Day ribbon", help: "a thin bar of your day across the top of every page", who: "me", per: "computer", where: "The top of every page", kind: "sw",
    def: true, get: function(){ return dayRibbonOn(); }, set: function(v){ try{ localStorage.setItem("tec_ribbon", v ? "on" : "off"); }catch(e){} } },
  { id: "me.account", g: "me", sub: "Sign in & out", label: "Signed in", help: "on this computer — switching or logging out never stops a clock", who: "me", per: "computer", where: "This computer", kind: "action",
    show: function(){ return staffList().length > 0; }, render: function(){ var me = sgMe(), sin = pxLS("tec_signin_at"), rp = runningPunch();
      return '<div class="px-sig">' + pxAv("px-av lg") + '<span class="n"><b>' + esc(pxMeName()) + '</b><small>' + esc(pxMeRole()) + (me && sin ? ' · since ' + esc(pxAgo(sin)) : '') + '</small></span>'
        + '<button class="px-btn sm" data-action="px-switch">' + pxI("swap", 13) + 'Switch user</button><button class="px-btn sm pri" data-action="px-logout">' + pxI("exit", 13) + 'Log out</button></div>'
        + (rp || openShift() ? '<p class="sg-p">Logging out doesn’t stop the clock — ' + (rp ? esc(roTag(getRO(rp.roId))) + ' keeps running.' : 'the day clock keeps running.') + '</p>' : ''); } },
  { id: "me.logoutEod", g: "me", sub: "Sign in & out", label: "Log out when I clock out for the day", help: "Home or End of day — the next person starts clean", who: "me", per: "computer", where: "This computer, at clock-out", kind: "sw",
    def: true, get: function(){ return pxBkOn("tec_logout_eod", true); }, set: function(v){ pxLS("tec_logout_eod", v ? "1" : "0"); } },

  /* ---- The shop ---- */
  { id: "shop.rate", g: "shop", sub: "Money", label: "Labor rate", help: "the labor cost on every operation", who: "a.settings", where: "Every operation’s labor · estimates · Manager KPIs", kind: "num", unit: "$ an hour",
    def: 210, get: function(){ return laborRate(); }, ok: function(v){ return +v > 0; }, set: function(v){ STATE.laborRate = +v; try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(e){} }, text: function(v){ return "$" + v + " an hour"; } },
  { id: "shop.pay", g: "shop", sub: "Money", label: "Pay period", help: "how timesheets and pay are cut", who: "a.settings", where: "Time Log timesheets · Manager pay KPIs · Career", kind: "custom",
    def: { kind: "biweekly", anchor: "2026-01-05" }, get: function(){ var P = PG.shop().payPer; return { kind: P.kind, anchor: P.anchor }; },
    set: function(v){ var P = PG.shop().payPer; if(v && v.kind) P.kind = v.kind; if(v && /^\d{4}-\d\d-\d\d$/.test(v.anchor || "")) P.anchor = v.anchor; },
    text: function(v){ return v ? ({ weekly: "Weekly", biweekly: "Every two weeks", monthly: "Monthly" })[v.kind] + " from " + v.anchor : ""; }, words: "weekly every two weeks biweekly monthly",
    render: function(ro){ var v = this.get(), d = ro ? ' disabled' : '';
      return '<span class="sg-ctl"><select data-sg-in="shop.pay" data-op="kind"' + d + '>' + [["weekly", "Weekly"], ["biweekly", "Every two weeks"], ["monthly", "Monthly"]].map(function(o){ return '<option value="' + o[0] + '"' + (v.kind === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'
        + '<small>' + (v.kind === "monthly" ? "starts on the" : "a period started on") + '</small><input type="date" data-sg-in="shop.pay" data-op="anchor" value="' + esc(v.anchor) + '"' + d + '><small>this period · ' + esc(PG.perLabel(PG.perStart(todayStr()))) + '</small></span>'; },
    op: function(op, val, cur){ if(op === "anchor"){ if(!/^\d{4}-\d\d-\d\d$/.test(val)) return "Pick a date."; cur.anchor = val; return cur; }
      var was = cur.kind, td = todayStr(); cur.kind = val;
      if(val === "monthly" && was !== "monthly") cur.anchor = td.slice(0, 8) + "01";
      else if(val !== "monthly" && PG.dOf(cur.anchor).getDay() !== 1){ var d = PG.dOf(td); cur.anchor = PG.addD(td, -((d.getDay() + 6) % 7)); }
      return cur; } },
  { id: "shop.ovh", g: "shop", sub: "Money", label: "Monthly overhead", help: "rent, salaries, utilities — for service absorption", who: "a.settings", where: "Manager › service absorption", kind: "num", unit: "$ a month", ph: "none",
    def: 0, get: function(){ return +(PG.shop().overhead || 0); }, set: function(v){ PG.shop().overhead = +v > 0 ? +v : 0; }, ok: function(v){ return +v >= 0; }, text: function(v){ return v > 0 ? "$" + v + " a month" : "none"; } },
  { id: "shop.dayStart", g: "shop", sub: "The shop day", label: "The day starts", help: "each tech can have their own shift — pencil on their lane in Foreman › Techs", who: "a.settings", where: "Foreman board · the end-of-day backup · sign-out time", kind: "sel",
    opts: sgHrs, def: function(){ return sgShopDay().start; }, get: function(){ return fmCfg().start; }, set: function(v){ fmCfg().start = +v; } },
  { id: "shop.dayEnd", g: "shop", sub: "The shop day", label: "The day ends", help: "everyone is signed out then, if that’s on", who: "a.settings", where: "Foreman board · the end-of-day backup · sign-out time", kind: "sel",
    opts: sgHrs, def: function(){ return sgShopDay().end; }, get: function(){ return fmCfg().end; }, set: function(v){ fmCfg().end = +v; } },
  { id: "shop.lunch", g: "shop", sub: "The shop day", label: "Lunch", help: "planned work skips it", who: "a.settings", where: "Foreman board · planned finish times", kind: "custom",
    def: function(){ return sgShopDay().lunch; }, get: function(){ return fmCfg().lunch.slice(); }, set: function(v){ if(Array.isArray(v) && v.length === 2) fmCfg().lunch = [+v[0], +v[1]]; },
    text: function(v){ return v ? fmHM(v[0]) + " – " + fmHM(v[1]) : ""; },
    render: function(ro){ var v = this.get(), d = ro ? ' disabled' : '', s = function(i){ return '<select data-sg-in="shop.lunch" data-op="' + i + '"' + d + '>' + sgHrs().map(function(o){ return '<option value="' + o[0] + '"' + (Math.abs(o[0] - v[i]) < 0.01 ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; };
      return '<span class="sg-ctl">' + s(0) + '<small>to</small>' + s(1) + '</span>'; },
    op: function(op, val, cur){ val = +val; return op === "0" ? [val, Math.max(val + 0.25, cur[1])] : [Math.min(cur[0], val - 0.25), val]; } },
  { id: "shop.qc", g: "shop", sub: "Foreman", label: "QC before release", help: "the foreman checks the job before the truck goes", who: "a.settings", where: "Foreman › QC before release · the RO page", kind: "seg",
    opts: [["all", "Every RO"], ["some", "Comebacks and warranty"], ["none", "Off"]], def: "all", get: function(){ return fmCfg().qc; }, set: function(v){ fmCfg().qc = v; } },
  { id: "shop.badge", g: "shop", sub: "Foreman", label: "Count in the Foreman badge", help: "the badge sits on Foreman in the menu, red when one of these is late", who: "a.settings", where: "The Foreman badge in the menu, on every page", kind: "custom",
    def: function(){ return FM_BADGE0.slice(); }, get: function(){ return fmCfg().badge.slice(); }, set: function(v){ if(Array.isArray(v)) fmCfg().badge = v.slice(); },
    text: function(v){ return (v || []).map(function(k){ return (FM_GROUPS.filter(function(g){ return g[0] === k; })[0] || [k, k])[1]; }).join(", "); }, words: function(){ return FM_GROUPS.map(function(g){ return g[1]; }).join(" "); },
    render: function(ro){ var v = this.get(); return '<span class="sg-chips">' + FM_GROUPS.map(function(g){ var on = v.indexOf(g[0]) > -1;
      return '<button class="sg-chip' + (on ? ' on' : '') + '" data-action="px-sg-op" data-id="shop.badge" data-op="' + g[0] + '" aria-pressed="' + on + '"' + (ro ? ' disabled' : '') + '>' + (on ? pxI("check", 12) : '') + esc(g[1]) + '</button>'; }).join('') + '</span>'; },
    op: function(op, val, cur){ var i = cur.indexOf(op); if(i < 0) cur.push(op); else cur.splice(i, 1); return cur; } },
  { id: "shop.bays", g: "shop", sub: "Foreman", label: "Bay types", help: "what each bay has — jobs that need a lift, a pit or the rack get the bays that fit first", who: "a.settings", where: "Foreman › Bring in and Give · the floor plan", kind: "custom",
    def: {}, get: function(){ return sgCopy(fmCfg().bays); }, set: function(v){ fmCfg().bays = sgCopy(v || {}); },
    text: function(v){ var n = Object.keys(v || {}).filter(function(k){ return v[k] && v[k].length; }).length; return n ? n + " bays set" : "none set"; }, words: function(){ return FM_BAYF.join(" "); },
    render: function(ro){ var fl = fmFloor(); if(!fl.length) return '<p class="sg-p">No bays on the floor plan yet.</p>';
      return '<div class="sg-bays"><div class="sg-bh"><span></span>' + FM_BAYF.map(function(f){ return '<span>' + esc(f) + '</span>'; }).join('') + '</div>' + fl.map(function(s){ var T = fmBayT(s.id);
        return '<div class="sg-br"><b class="tg-no">' + esc(tgSpotLbl(s.id)) + '</b>' + FM_BAYF.map(function(f){ var on = T.indexOf(f) > -1;
          return '<button class="sg-bc' + (on ? ' on' : '') + '" data-action="px-sg-op" data-id="shop.bays" data-op="' + esc(s.id) + '|' + f + '" aria-pressed="' + on + '" aria-label="' + esc(tgSpotLbl(s.id) + ' ' + f) + '"' + (ro ? ' disabled' : '') + '>' + (on ? pxI("check", 12) : '') + '</button>'; }).join('') + '</div>'; }).join('') + '</div>'; },
    change: function(b, a){ b = b || {}; a = a || {}; var K = Object.keys(Object.assign({}, b, a)).filter(function(k){ return sgJ(b[k]) !== sgJ(a[k]); }); if(!K.length) return null;
      return [tgSpotLbl(K[0]) + ": " + ((b[K[0]] || []).join(" · ") || "nothing"), (a[K[0]] || []).join(" · ") || "nothing"]; },
    op: function(op, val, cur){ var p = op.split("|"), b = p[0], f = p[1], L = cur[b] || (cur[b] = []), i = L.indexOf(f); if(i < 0) L.push(f); else L.splice(i, 1); if(!L.length) delete cur[b]; return cur; } },
  { id: "shop.rules", g: "shop", sub: "Hand-offs", label: "Stage rules", help: "when a stage is done, where the RO goes — ask first, move by itself, or stay put", who: "a.settings", where: "Every RO’s hand-offs · Triage · Foreman · Parts · Warranty", kind: "custom",
    def: function(){ var o = {}; RT_RULES0.forEach(function(r){ o[r.k] = r.mode; }); return o; }, get: function(){ var o = {}; rtCfg().rules.forEach(function(r){ o[r.k] = r.mode; }); return o; },
    set: function(v){ rtCfg().rules.forEach(function(r){ if(v && v[r.k]) r.mode = v[r.k]; }); },
    text: function(v){ var M = { ask: "asks first", auto: "automatic", off: "off" }; return rtCfg().rules.map(function(r){ return r.when + " → " + RT_DEPT[r.to] + ": " + M[(v || {})[r.k]]; }).join(" · "); },
    words: function(){ return rtCfg().rules.map(function(r){ return r.when + " " + RT_DEPT[r.to]; }).join(" ") + " ask first automatic off"; },
    render: function(ro){ var v = this.get(); return '<div class="sg-rules">' + rtCfg().rules.map(function(r){
      return '<div class="sg-rr"><span><b>' + esc(r.when) + '</b><small>→ ' + esc(r.k === "approval" ? "Parts, or Foreman" : RT_DEPT[r.to]) + '</small></span><span class="px-seg">' + [["ask", "Ask first"], ["auto", "Automatic"], ["off", "Off"]].map(function(m){ var on = v[r.k] === m[0];
        return '<button class="' + (on ? 'on' : '') + '" data-action="px-sg-op" data-id="shop.rules" data-op="' + r.k + '" data-v="' + m[0] + '" aria-pressed="' + on + '"' + (ro ? ' disabled' : '') + '>' + m[1] + '</button>'; }).join('') + '</span></div>'; }).join('') + '</div>'; },
    change: function(b, a){ var M = { ask: "asks first", auto: "automatic", off: "off" }; return sgCh(b, a, function(p){ var r = rtCfg().rules.filter(function(x){ return x.k === p[0]; })[0]; return r ? r.when : p[0]; }, function(v){ return M[v] || v; }); },
    op: function(op, val, cur){ cur[op] = val; return cur; } },
  { id: "shop.goals", g: "shop", sub: "Hand-offs", label: "Hold goals", help: "how long each desk should hold an RO — past it, it turns orange", who: "a.settings", where: "Manager › Transfers · Triage · Inbox reminders", kind: "custom",
    def: function(){ return sgCopy(RT_GOAL0); }, get: function(){ return sgCopy(rtCfg().goals); }, set: function(v){ var G = rtCfg().goals; Object.keys(v || {}).forEach(function(k){ if(+v[k] > 0) G[k] = +v[k]; }); },
    text: function(v){ return Object.keys(v || {}).map(function(k){ return RT_DEPT[k] + " " + (Math.round(v[k] / 6) / 10) + " h"; }).join(" · "); }, words: function(){ return Object.keys(RT_DEPT).map(function(k){ return RT_DEPT[k]; }).join(" "); },
    render: function(ro){ var v = this.get(); return '<div class="sg-goals">' + Object.keys(RT_GOAL0).map(function(k){
      return '<label><span>' + esc(RT_DEPT[k]) + '</span><input data-sg-in="shop.goals" data-op="' + k + '" value="' + (Math.round(v[k] / 6) / 10) + '" inputmode="decimal"' + (ro ? ' disabled' : '') + '><em>h</em></label>'; }).join('') + '</div>'; },
    change: function(b, a){ return sgCh(b, a, function(p){ return RT_DEPT[p[0]] || p[0]; }, function(v){ return (Math.round(v / 6) / 10) + " h"; }); },
    op: function(op, val, cur){ var n = parseFloat(String(val).replace(",", ".")); if(!(n > 0)) return "Type the hours."; cur[op] = Math.round(n * 60); return cur; } },
  { id: "shop.accept", g: "shop", sub: "Hand-offs", label: "Hand-offs must be accepted", help: "before the RO moves · within 15 min", who: "a.settings", where: "Every hand-off · the Inbox", kind: "sw",
    def: false, get: function(){ return rtCfg().needAccept !== false; }, set: function(v){ rtCfg().needAccept = !!v; } },
  sgWaNum("file", "File a claim within", "days", "of the repair"), sgWaNum("resub", "Resubmit a returned claim within", "days"), sgWaNum("keep", "Keep failed parts", "days", "unless Volvo asks for them", "Warranty › failed parts · Parts › Returns"),
  sgWaNum("pa", "Pre-approval needed over", "$", "the packet asks for the # above this", "Warranty › the claim packet"), sgWaNum("wo", "Manager signs off write-offs over", "$", "", "Warranty › write-offs"),
  { id: "shop.waCov", g: "shop", sub: "Warranty", label: "Coverage terms", help: "months and miles from the warranty start date; 0 means no limit", who: "w.claim", where: "Warranty › coverage on every claim · the RO page truck card", kind: "custom",
    def: function(){ return sgCopy(WA_COV0); }, get: function(){ return sgCopy(waCfg().cov); }, set: function(v){ if(Array.isArray(v) && v.length) waCfg().cov = sgCopy(v); },
    text: function(v){ return (v || []).map(function(c){ return c[1] + " " + c[2] + " mo / " + c[3] + " mi"; }).join(" · "); }, words: function(){ return waCfg().cov.map(function(c){ return c[1]; }).join(" "); },
    render: function(ro){ var d = ro ? ' disabled' : ''; return '<div class="sg-cov"><div class="h"><span>Coverage</span><span>Months</span><span>Miles</span></div>' + waCfg().cov.map(function(c, k){
      return '<div><input data-sg-in="shop.waCov" data-op="' + k + '|1" value="' + esc(c[1]) + '"' + d + '><input data-sg-in="shop.waCov" data-op="' + k + '|2" value="' + (+c[2] || 0) + '" inputmode="numeric"' + d + '><input data-sg-in="shop.waCov" data-op="' + k + '|3" value="' + (+c[3] || 0) + '" inputmode="numeric"' + d + '></div>'; }).join('') + '</div>'; },
    change: function(b, a){ for(var i = 0; i < Math.max((b || []).length, (a || []).length); i++){ if(sgJ((b || [])[i]) !== sgJ((a || [])[i])){ var x = (b || [])[i] || [], y = (a || [])[i] || []; return [(y[1] || x[1]) + ": " + x[2] + " mo / " + x[3] + " mi", y[2] + " mo / " + y[3] + " mi"]; } } return null; },
    op: function(op, val, cur){ var p = op.split("|"), row = cur[+p[0]], f = +p[1]; if(!row) return cur; row[f] = f === 1 ? String(val) : (waNum(val) || 0); return cur; } },
  { id: "shop.wa.shelves", g: "shop", sub: "Warranty", label: "Failed-part shelves", help: "comma separated", who: "w.claim", where: "Warranty › part tags · Parts › Shelf view", kind: "text",
    def: "W1, W2, W3, W4, W5, W6", get: function(){ return waCfg().shelves.join(", "); }, set: function(v){ var L = String(v || "").split(",").map(function(s){ return s.trim(); }).filter(Boolean); if(L.length) waCfg().shelves = L; } },
  { id: "shop.wa.dealer", g: "shop", sub: "Warranty", label: "Name on printouts", help: "the packet and the part tags", who: "w.claim", where: "Warranty › the claim packet · part tags", kind: "text",
    def: "Vanguard Truck Center · Greensboro", get: function(){ return waCfg().dealer; }, set: function(v){ waCfg().dealer = String(v || ""); } },
  sgWaNum("ask", "Chase the tech after", "hours", "they haven’t answered"), sgWaNum("ts", "Chase a tech support case after", "hours", "it’s still open"), sgWaNum("pre", "Chase a pre-approval after", "hours", "it’s waiting"),
  sgWaNum("claim", "Chase a claim after", "days", "it has no answer"), sgWaNum("paid", "Chase an approved claim after", "days", "it isn’t paid"),
  sgPtRow("sup_pdc", "Suppliers", "Volvo PDC · stock order", "Order by 15:00 · next business day 07:00"), sgPtRow("sup_vor", "Suppliers", "Volvo PDC · rush (VOR)", "Order by 17:00 · next morning 07:00"), sgPtRow("sup_fp", "Suppliers", "FleetPride", "Order by 12:00 · same day 16:00"),
  sgPtRow("del_pdc", "Deliveries", "Volvo PDC trucks", "07:00 and 15:00"), sgPtRow("del_rcv", "Deliveries", "Receiving hours", "06:30 – 17:00"),
  sgPtRow("bin_a", "Bins and shelves", "Staging bins", "A1 – A8"), sgPtRow("bin_w", "Bins and shelves", "Warranty return shelves", "W1 – W6"), sgPtRow("bin_k", "Bins and shelves", "Core shelves", "K1 – K4"), sgPtRow("bin_r", "Bins and shelves", "Supplier return shelves", "R1 – R4"),
  sgPtRow("ret_hold", "Returns", "Hold a failed part for Volvo", "30 days"), sgPtRow("ret_core", "Returns", "Send a core back within", "30 days"), sgPtRow("ret_fee", "Returns", "Supplier restocking fee", "15%"), sgPtRow("ret_cr", "Returns", "Credit should land within", "14 days"),
  { id: "shop.tpl", g: "shop", sub: "Texts to customers", label: "Text templates", help: "estimate, approval reminder, parts delayed, ready for pickup — and your own", who: "ro.new", where: "Triage › Log a call or text · the RO page messages", kind: "custom",
    def: function(){ return sgCopy(TG_TPL0); }, get: function(){ return sgCopy(tgTpls()); }, set: function(v){ if(Array.isArray(v) && v.length) STATE.tgTemplates = sgCopy(v); },
    text: function(v){ return (v || []).map(function(t){ return t.n; }).join(", "); }, words: function(){ return tgTpls().map(function(t){ return t.n + " " + t.b; }).join(" "); },
    render: function(ro){ return '<span class="sg-ctl"><span class="sg-vt">' + esc(this.text(this.get())) + '</span>' + (ro ? '' : '<button class="px-btn sm" data-action="px-sg-tpl">' + pxI("pencil", 13) + 'Edit templates…</button>') + '</span>'; } },
  { id: "shop.tgName", g: "shop", sub: "Texts to customers", label: "Shop name", help: "fills {shop} in the templates", who: "ro.new", where: "Triage › texts · the RO page messages", kind: "text", ph: "Shop name",
    def: "", get: function(){ return String(tgShop().name || ""); }, set: function(v){ tgShop().name = String(v || "").trim(); } },
  { id: "shop.tgPhone", g: "shop", sub: "Texts to customers", label: "Shop phone", help: "fills {phone} in the templates", who: "ro.new", where: "Triage › texts · the RO page messages", kind: "text", ph: "Shop phone",
    def: "", get: function(){ return String(tgShop().phone || ""); }, set: function(v){ tgShop().phone = String(v || "").trim(); } },

  /* ---- People & access ---- */
  { id: "people.adminPin", g: "people", sub: "Sign-in", label: "Admin PIN", help: "asked for when someone picks Admin on the sign-in page — kept scrambled", who: "admin", where: "The sign-in page · Admin", kind: "custom", secret: true, noReset: true,
    def: false, get: function(){ return adminPinIs(); }, set: function(){}, text: function(v){ return v ? "set" : "none yet"; },
    render: function(ro){ var on = adminPinIs(), at = STATE.shop && STATE.shop.adminPinAt;
      return '<span class="sg-ctl"><span class="sg-vt">' + (on ? '•••• <small>set' + (at ? ' ' + esc(new Date(at).toLocaleDateString(undefined, { month: "short", day: "numeric" })) : '') + '</small>' : 'None yet — anyone can pick Admin') + '</span>'
        + (ro ? '' : '<input type="password" data-sg-pin="1" inputmode="numeric" maxlength="4" autocomplete="new-password" placeholder="New PIN"><input type="password" data-sg-pin="2" inputmode="numeric" maxlength="4" autocomplete="new-password" placeholder="Again"><button class="px-btn sm pri" data-action="px-sg-apin">' + (on ? 'Change it' : 'Set it') + '</button>') + '</span>'; } },
  { id: "people.idle", g: "people", sub: "Sign-in", label: "When nobody’s touched it", help: "locked, the page stays where it was — the person’s PIN brings them back", who: "a.people", where: "Every computer Parsec is open on", kind: "sel",
    opts: [[0, "Never lock"], [15, "Lock after 15 minutes"], [30, "Lock after 30 minutes"], [60, "Lock after an hour"]], def: 0, get: function(){ return +permRules().idle || 0; }, set: function(v){ permRules().idle = +v || 0; } },
  { id: "people.eod", g: "people", sub: "Sign-in", label: "Sign everyone out at the end of the shop day", help: "running clocks keep running", who: "a.people", where: "Every computer, at the shop day’s end", kind: "sw",
    def: true, get: function(){ return permRules().eod !== false; }, set: function(v){ permRules().eod = !!v; } },
  { id: "people.roles", g: "people", sub: "Roles", label: "What each role can do", help: "changing a role changes everyone in it, except what was changed for one person", who: "a.people", where: "Every page and button, for everyone in the role", kind: "custom",
    def: function(){ var o = {}; permRoles().forEach(function(r){ o[r] = permRoleDefault(r); }); return o; }, get: function(){ var P = permState(), o = {}; permRoles().forEach(function(r){ o[r] = sgCopy(P.roles[r]); }); return o; },
    set: function(v){ var P = permState(); Object.keys(v || {}).forEach(function(r){ P.roles[r] = sgCopy(v[r]); }); (STATE.staff || []).forEach(permSyncPages); },
    text: function(v){ var d = this.def(), n = 0; Object.keys(v || {}).forEach(function(r){ ["pages", "acts"].forEach(function(k){ Object.keys((v[r] || {})[k] || {}).forEach(function(x){ if(!!v[r][k][x] !== !!((d[r] || {})[k] || {})[x]) n++; }); }); }); return n ? n + " changed from the usual" : "the usual"; },
    words: function(){ return permRoles().join(" ") + " " + PERM_PAGES.map(function(p){ return p[1]; }).join(" ") + " " + PERM_ACTS.map(function(g){ return g[1].map(function(a){ return a[1]; }).join(" "); }).join(" "); },
    render: function(ro){ var R = permRoles(), cnt = function(r){ return staffList().filter(function(sf){ return sf.role === r && !sf.off; }).length; }, d = this.def();
      var rows = [["Pages", PERM_PAGES.map(function(p){ return ["pages", p[0], p[1]]; })]].concat(PERM_ACTS.map(function(g){ return [g[0], g[1].map(function(a){ return ["acts", a[0], a[1]]; })]; }));
      return '<div class="sg-mxw"><table class="sg-mx"><thead><tr><th></th>' + R.map(function(r){ return '<th>' + esc(r) + '<small>' + cnt(r) + '</small></th>'; }).join('') + '<th>Admin<small>always</small></th></tr></thead><tbody>'
        + rows.map(function(g){ return '<tr class="gr"><td colspan="' + (R.length + 2) + '">' + esc(g[0]) + '</td></tr>' + g[1].map(function(x){ return '<tr><td>' + esc(x[2]) + '</td>' + R.map(function(r){ var on = !!(permRole(r)[x[0]] || {})[x[1]], ch = on !== !!((d[r] || {})[x[0]] || {})[x[1]];
          return '<td><button class="sg-ck' + (ch ? ' ch' : '') + '" data-action="px-sg-op" data-id="people.roles" data-op="' + esc(r) + '|' + x[0] + '|' + x[1] + '" aria-pressed="' + on + '" aria-label="' + esc(r) + ': ' + esc(x[2]) + '"' + (ro ? ' disabled' : '') + '></button></td>'; }).join('') + '<td><span class="sg-ck dis" aria-pressed="true"></span></td></tr>'; }).join(''); }).join('')
        + '</tbody></table></div>'; },
    change: function(b, a){ return sgCh(b, a, function(p){ return p[0] + " · " + (p[1] === "pages" ? permPageLabel(p[2]) + " page" : permActLabel(p[2])); }, function(v){ return v ? "on" : "off"; }); },
    op: function(op, val, cur){ var p = op.split("|"), r = p[0], k = p[1], x = p[2]; cur[r] = cur[r] || { pages: {}, acts: {} }; cur[r][k] = cur[r][k] || {}; cur[r][k][x] = !cur[r][k][x]; return cur; },
    after: function(before, now){   /* like permRoleSet: a person whose change now matches the role has no change any more */
      Object.keys(now).forEach(function(r){ ["pages", "acts"].forEach(function(k){ Object.keys(now[r][k] || {}).forEach(function(x){ if(!!now[r][k][x] === !!(((before[r] || {})[k] || {})[x])) return;
        (STATE.staff || []).forEach(function(sf){ if(sf.role === r && sf.ov && sf.ov[k] && sf.ov[k][x] === !!now[r][k][x]) delete sf.ov[k][x]; permSyncPages(sf); }); }); }); }); } },
  { id: "people.each", g: "people", sub: "Person by person", label: "Role, pages and what they can do", help: "on each person’s page in Admin › People — change any for one person alone", who: "a.people", where: "That person’s pages and buttons", kind: "custom",
    show: function(){ return staffList().some(function(sf){ return sf && sf.name; }); },
    def: function(){ var o = {}; staffList().forEach(function(sf){ if(sf && sf.id) o[sf.id] = { role: sf.role, ov: { pages: {}, acts: {} } }; }); return o; },
    get: function(){ var o = {}; staffList().forEach(function(sf){ if(sf && sf.id) o[sf.id] = { role: sf.role, ov: sgCopy(sf.ov || { pages: {}, acts: {} }) }; }); return o; },
    set: function(v){ var me = sgMe(); Object.keys(v || {}).forEach(function(id){ var sf = sgRoleOf(id); if(!sf || !v[id] || (me && me.id === id)) return; if(v[id].role && v[id].role !== sf.role) permSetRole(sf, v[id].role); sf.ov = sgCopy(v[id].ov || { pages: {}, acts: {} }); sf.ov.pages = sf.ov.pages || {}; sf.ov.acts = sf.ov.acts || {}; permSyncPages(sf); }); },
    text: function(v){ var L = []; Object.keys(v || {}).forEach(function(id){ var sf = sgRoleOf(id), x = v[id], n = x && x.ov ? Object.keys(x.ov.pages || {}).length + Object.keys(x.ov.acts || {}).length : 0; if(sf && n) L.push(admFirst(sf.name) + " " + n + " changed"); }); return L.join(", ") || "everyone as their role"; },
    words: function(){ return staffList().map(function(sf){ return sf.name + " " + sf.role; }).join(" "); },
    /* 17.3: each person's role, pages and actions are on their page in Admin › People — here, a way there */
    render: function(ro){ var P = staffList().filter(function(sf){ return sf && sf.name; }), go = typeof canPage !== "function" || canPage("admin");
      return '<div class="sg-pl">' + P.map(function(sf){ var n = permChangedN(sf);
        return '<button class="sg-plr" data-action="px-sg-person" data-person="' + sf.id + '"' + (go ? '' : ' disabled') + ' title="' + (go ? 'Open ' + esc(sf.name) + '’s page in Admin › People' : 'Admin › People opens for anyone given “Manage people and PINs”') + '">'
          + '<b>' + esc(sf.name) + '</b><span>' + esc(sf.role) + (n ? ' · ' + n + ' changed' : '') + '</span>' + (go ? pxI("chevR", 13) : '') + '</button>'; }).join('') + '</div>'; },
    change: function(b, a){ return sgCh(b, a, function(p){ var sf = sgRoleOf(p[0]), n = sf ? admFirst(sf.name) : p[0]; return p[1] === "role" ? n + "’s role" : n + " · " + (p[2] === "pages" ? permPageLabel(p[3]) + " page" : permActLabel(p[3] || "")); },
      function(v, p){ return p[1] === "role" ? String(v || "") : sgOnOff(v); }); },
    op: function(op, val, cur){ var p = op.split("|"), sf = sgRoleOf(p[0]); if(!sf) return cur; if(sgMe() && sgMe().id === sf.id) return "Someone else changes your own pages — the Admin, or another person with “Manage people and PINs”.";
      var x = cur[p[0]] = cur[p[0]] || { role: sf.role, ov: { pages: {}, acts: {} } };
      if(p[1] === "role"){ x.role = val; return cur; }
      if(p[1] === "back"){ x.ov = { pages: {}, acts: {} }; return cur; }
      var kind = p[1], k = p[2], t = permRole(x.role), v = !permHas(sf, kind, k); x.ov[kind] = x.ov[kind] || {};
      if(v === !!(t[kind] && t[kind][k])) delete x.ov[kind][k]; else x.ov[kind][k] = v; return cur; } },
  { id: "people.viewAs", g: "people", sub: "Testing", label: "See the app as someone else", help: "pages and lists, the way they see them — asks for their PIN", who: "va", where: "This computer, until you switch back", kind: "custom",
    render: function(ro){ return ro ? '<span class="sg-vt">' + esc(pxMeName()) + '</span>' : '<span class="sg-ctl">' + viewAsSelectHtml("sg-va") + '</span>'; } },

  /* ---- Data ---- */
  { id: "data.folder", g: "data", sub: "Where Parsec saves", label: "The data folder", help: "Parsec keeps everything there — offline, no cloud", who: "me", per: "computer", where: "This computer", kind: "custom",
    words: "folder save now connect reconnect change", render: function(){ var L = storageLabel();
      if(FS.status === "connected") return '<div class="px-sig"><span class="px-gi ok">' + pxI("check", 15) + '</span><span class="n"><b>' + esc(FS.dirName || "Your folder") + ' › Parsec Data</b><small>' + esc(L.head) + ' · open ROs in ROs/Open, closed ones in ROs/Closed by year, shop data in Shop by topic</small></span>'
        + '<button class="px-btn sm" data-action="save-now">' + pxI("save", 13) + 'Save now</button><button class="px-btn sm" data-action="storage">Change folder</button></div>';
      if(FS.status === "needs-permission") return '<div class="px-sig"><span class="px-gi wt">' + pxI("flag", 15) + '</span><span class="n"><b>The folder needs reconnecting</b><small>Chrome asks once each time Parsec opens. Your work is safe in this browser meanwhile.</small></span><button class="px-btn sm pri" data-action="storage">Reconnect</button></div>';
      if(FS.status === "unsupported") return '<div class="px-sig"><span class="px-gi wt">' + pxI("flag", 15) + '</span><span class="n"><b>Saving in this browser only</b><small>Saving to a folder needs Chrome or Edge on a computer.</small></span></div>';
      return '<div class="px-sig"><span class="px-gi wt">' + pxI("flag", 15) + '</span><span class="n"><b>No folder connected</b><small>Your data lives only in this browser. Pick a folder and Parsec keeps everything there.</small></span><button class="px-btn sm pri" data-action="storage">Connect a folder</button></div>'; } },
  { id: "data.backups", g: "data", sub: "Backups", label: "Backups", help: "a compressed copy at the end of each working day, in Parsec Data/Backups — kept 30 days", who: "me", per: "computer", where: "Parsec Data/Backups", kind: "custom",
    words: "backup back up now restore", render: function(){ var b = pxBkInfo(), warn = pxBkWarn(), canR = can("a.data");
      if(b.where !== "folder") return '<div class="px-sig"><span class="px-gi ' + (warn ? 'wt' : 'ok') + '">' + pxI(warn ? "flag" : "check", 15) + '</span><span class="n"><b>' + (b.at ? 'Last backup file ' + esc(pxAgo(b.at)) : 'No backup file saved yet') + '</b><small>your data is only in this browser — keep a copy somewhere else</small></span></div>';
      var F = UI.pxBk && UI.pxBk.files || [];
      return '<div class="px-sig"><span class="px-gi ' + (warn ? 'wt' : 'ok') + '">' + pxI(warn ? "flag" : "check", 15) + '</span><span class="n"><b>' + (b.at ? 'Last backup ' + esc(pxAgo(b.at)) : b.day ? 'Last backup ' + esc(b.day) : 'No backup yet') + '</b><small>' + esc(warn || 'up to date') + '</small></span>'
        + '<button class="px-btn sm' + (warn ? ' pri' : '') + '" data-action="px-bk-now">' + pxI("save", 13) + 'Back up now</button></div>'
        + (F.length ? '<div class="px-bl">' + F.slice(0, 7).map(function(f){ var m = /data-(\d{4}-\d{2}-\d{2})/.exec(f.name), dt = m ? new Date(m[1] + "T12:00:00") : null;
            return '<div class="px-br"><span><b>' + esc(dt ? dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : f.name) + '</b>' + (f.mod ? ' · ' + fmtTime(new Date(f.mod).toISOString()) : '') + '</span><span class="m">' + pxSize(f.size) + '</span>' + (canR ? '<button class="px-btn sm" data-action="restore-backup" data-file="' + esc(f.name) + '">Restore…</button>' : '') + '</div>'; }).join('')
          + (F.length > 7 && canR ? '<div class="px-br more"><span>' + (F.length - 7) + ' older</span><button class="px-btn sm ghost" data-action="open-restore">All backups…</button></div>' : '') + '</div>'
          : '<p class="sg-p">' + (UI.pxBk && UI.pxBk.loading ? 'Reading the Backups folder…' : 'No backup files in the folder yet.') + '</p>'); } },
  { id: "data.bkEod", g: "data", sub: "Backups", label: "Back up when the last person clocks out for the day", help: "and at the shop’s end time — whichever comes first; later work the same day is saved again", who: "me", per: "computer", where: "Parsec Data/Backups, or Downloads without a folder", kind: "sw",
    def: true, get: function(){ return pxBkOn("tec_bk_eod", true); }, set: function(v){ pxLS("tec_bk_eod", v ? "1" : "0"); } },
  { id: "data.copies", g: "data", sub: "Backups", label: "A backup file", help: "save everything to one file, or put a file back — Undo brings your data back", who: "a.data", where: "Your Downloads folder", kind: "action",
    words: "export save restore file json", render: function(ro){ return ro ? '' : '<span class="sg-ctl"><button class="px-btn sm" data-action="export-json">' + pxI("save", 13) + 'Save a backup file</button><button class="px-btn sm" data-action="px-restore-file">Restore from a file…</button></span>'; } },
  { id: "data.server", g: "data", sub: "For the server", label: "Export for the server", help: "tables, attachments, schema and a manifest — with a round-trip check", who: "a.data", where: "Parsec Data/Exports", kind: "mount",
    words: "export server round-trip tables schema manifest", render: function(){ return pdxCard(); } },
  /* Parsec 17.1: Truck pictures moved to Library › Models */
  { id: "data.phone", g: "data", sub: "Parsec Mobile", label: "The phone", help: "QR codes between this computer and the phone — no network", who: "a.data", where: "Parsec Mobile", kind: "action",
    words: "phone mobile qr send get", render: function(ro){ return ro ? '' : '<span class="sg-ctl"><button class="px-btn sm pri" data-action="phone-sync" data-mode="send">Send to phone</button><button class="px-btn sm" data-action="phone-sync" data-mode="get">Get from phone</button></span>'; } },
  { id: "data.sample", g: "data", sub: "Test data", label: "Sample data", help: "25 made-up ROs to try things on — or clear everything", who: "a.data", where: "Every page", kind: "action", show: function(){ return pxIsAdmin(); },
    words: "sample test clear generate", render: function(ro){ return ro ? '' : '<span class="sg-ctl"><button class="px-btn sm" data-action="sample-25">Generate 25 sample ROs</button><button class="px-btn sm danger" data-action="clear-sample">Clear all data…</button></span>'; } },
  { id: "data.dev", g: "data", sub: "Test data", label: "Developer readouts", help: "timings and storage under each page", who: "va", per: "computer", where: "Under each page, on this computer", kind: "sw",
    def: false, get: function(){ return devToolsOn(); }, set: function(v){ setDevTools(!!v); } },

  /* ---- Automations: Fork A's page when it's there; until then, the built-ins and the rules of the current panel ---- */
  { id: "auto.page", g: "auto", label: "Automations", help: "", who: "a.settings", where: "Every RO", kind: "mount", show: function(){ return sgAutoPage() !== null; },
    render: function(){ var p = sgAutoPage(); return p === "mount" ? '<div class="sg-mount" data-sg-mount="auto"></div>' : p; } },
  { id: "auto.mode", g: "auto", sub: "Built-in", label: "Built-in rules apply as", help: "Suggest: a card on the RO asks first · Auto: they just happen", who: "a.settings", where: "Every RO", kind: "seg", fallback: true,
    opts: [["suggest", "Suggest"], ["auto", "Auto"]], def: "suggest", get: function(){ return autoCfg().mode; }, set: function(v){ autoCfg().mode = v === "auto" ? "auto" : "suggest"; } },
  { id: "auto.status", g: "auto", sub: "Built-in", label: "Status follows the clock", help: "starting a job sets it to Working; the most urgent wait sets the wait", who: "a.settings", where: "Every RO’s status", kind: "sw", fallback: true,
    def: true, get: function(){ return !!autoCfg().builtin.status; }, set: function(v){ autoCfg().builtin.status = !!v; } },
  { id: "auto.parts", g: "auto", sub: "Built-in", label: "Part statuses move the job", help: "ordered or backordered → Waiting – Parts · all parts in → back to Hold Tech", who: "a.settings", where: "Every RO’s operations and status", kind: "sw", fallback: true,
    def: true, get: function(){ return !!autoCfg().builtin.parts; }, set: function(v){ autoCfg().builtin.parts = !!v; } },
  { id: "auto.rules", g: "auto", sub: "Your rules", label: "Your rules", help: "when something happens, Parsec does what you set", who: "a.settings", where: "Every RO", kind: "custom", fallback: true,
    def: [], get: function(){ return autoCfg().rules.map(function(r){ return { id: r.id, on: !!r.on }; }); }, set: function(v){ var M = {}; (v || []).forEach(function(x){ M[x.id] = x.on; }); autoCfg().rules.forEach(function(r){ if(r.id in M) r.on = !!M[r.id]; }); },
    dot: function(){ return false; }, text: function(v){ var n = (v || []).filter(function(x){ return x.on; }).length; return (v || []).length ? n + " of " + v.length + " on" : "none yet"; },
    words: function(){ return autoCfg().rules.map(function(r){ return r.name || ""; }).join(" "); },
    render: function(ro){ var L = autoCfg().rules;
      return (L.length ? '<div class="sg-rules">' + L.map(function(r){ return '<button class="sg-sw" role="switch" aria-checked="' + !!r.on + '" data-action="px-sg-op" data-id="auto.rules" data-op="' + esc(r.id) + '"' + (ro ? ' disabled' : '') + '><span>' + esc(r.name || "A rule") + '</span>' + pxSw(!!r.on) + '</button>'; }).join('') + '</div>' : '<p class="sg-p">No rules of your own yet.</p>')
        + (ro ? '' : '<span class="sg-ctl"><button class="px-btn sm" data-action="px-sg-am">' + pxI("pencil", 13) + (L.length ? 'Edit rules…' : 'Make a rule…') + '</button></span>'); },
    op: function(op, val, cur){ cur.forEach(function(x){ if(x.id === op) x.on = !x.on; }); return cur; } },

  /* ---- Shortcuts: a reference ---- */
  { id: "keys.ref", g: "keys", label: "Keyboard shortcuts", help: "off while you’re typing in a field", who: "me", where: "The page you came from", kind: "ref",
    words: function(){ return pxKeyGroups(UI.pxPrev || "console").map(function(g){ return g[0] + " " + g[1].map(function(r){ return r[1]; }).join(" "); }).join(" "); },
    render: function(){ return pxKeyGroups(UI.pxPrev || "console").map(function(g){
      return '<div class="sg-kg"><div class="sg-sh">' + esc(g[0]) + '</div>' + g[1].map(function(r){ return pxKv(String(r[0]).split(/\s{2,}|\s+or\s+/).map(function(x){ return pxKeys(x); }).join(' <small class="or">or</small> '), esc(r[1])); }).join('') + '</div>'; }).join(''); } }
];
var SG_BY = {}; SG_REG.forEach(function(e){ SG_BY[e.id] = e; });
function sgReg(){ return SG_REG; }
