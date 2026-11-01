/* ============================== Parsec 16.2 (C) — one Settings page ==============================
   Every setting from the nine places it used to live (Profile & settings, the person pop-over, the app menu,
   Automations, Manager → Shop settings, the Foreman and Warranty pop-overs, Parts setup, Admin, Edit templates)
   is one row in a small registry, SG_REG: id, group, label, help, who can change it, where it shows, the default,
   and get / set — the same setters the old places used, so what a change does is the same as before.
   The page groups them by who they're for (Me · The shop · People & access · Data · Automations, and Shortcuts as a
   reference), with a menu down the side, search over labels, help and values that jumps to the row and lights it
   for 2 s, a who + where line on each row, a dot on what's changed from the default with Reset (one row or the whole
   group), and Recently changed — who changed what, when — with Undo on each (STATE.setLog, the settings topic file).
   Someone without the permission sees the row read-only: "Only the manager can change this". */
var SG_GROUPS = [
  ["me", "user", "Me", "look, size, tooltips, sign-out"],
  ["shop", "settings", "The shop", "money, the shop day, hand-offs, warranty, parts"],
  ["people", "lock", "People & access", "roles, pages, PINs, sign-in"],
  ["data", "save", "Data", "folder, backups, export"],
  ["auto", "bolt", "Automations", "what Parsec does by itself"],
  ["keys", "keyTag", "Shortcuts", "every key — for reference"]
];
var SG_OLD = { you: "me", sign: "me", look: "me", tools: "auto", admin: "people" };   /* the old section names still open the right group */
function sgSec(s){ s = SG_OLD[s] || s; return s === "recent" || SG_GROUPS.some(function(g){ return g[0] === s; }) ? s : "me"; }
function sgJ(v){ try{ return JSON.stringify(v === undefined ? null : v); }catch(e){ return ""; } }
function sgCopy(v){ return v === undefined ? null : JSON.parse(sgJ(v)); }
var SG_META = { updatedAt: 1, updatedBy: 1 };   /* the data store's marks on a record — not part of the setting */
function sgK(v){ try{ return JSON.stringify(v === undefined ? null : v, function(k, x){ return SG_META[k] ? undefined : x; }); }catch(e){ return ""; } }
function sgSame(a, b){ return sgK(a) === sgK(b); }
function sgAnd(L){ return L.length < 2 ? (L[0] || "") : L.slice(0, -1).join(", ") + " and " + L[L.length - 1]; }
function sgMe(){ return viewAsStaff(); }
function sgByName(){ var me = sgMe(); return me ? me.name : (String(STATE.techName || "").trim() || "Admin"); }
function sgHrs(){ var L = []; for(var q = 5; q <= 20; q += 0.5) L.push([q, fmHM(q)]); return L; }
function sgShopDay(){ var sc = typeof SHOP_CAL !== "undefined" && SHOP_CAL ? SHOP_CAL : null, b = sc && sc.breaks && sc.breaks[0];
  return { start: sc ? sc.dayStart / 60 : 7, end: sc ? sc.dayEnd / 60 : 16, lunch: b ? [b[0] / 60, b[1] / 60] : [11.5, 12.5] }; }
function sgPt(){ return STATE.ptSet && typeof STATE.ptSet === "object" ? STATE.ptSet : (STATE.ptSet = {}); }
function sgPtRow(k, sub, label, ph){ return { id: "shop.pt." + k, g: "shop", sub: "Parts", label: label, help: sub, who: "p.order", where: "Parts › " + (/^(sup|del)/.test(k) ? "Order and Desk" : /^bin/.test(k) ? "Shelf view and the Returns tags" : "Returns"),
  kind: "text", ph: ph, def: "", get: function(){ return String(sgPt()[k] || ""); }, set: function(v){ v = String(v || "").trim(); if(v) sgPt()[k] = v; else delete sgPt()[k]; },
  text: function(v){ return v || "default — " + ph; } }; }
function sgWaNum(k, label, unit, help, sub){ return { id: "shop.wa." + k, g: "shop", sub: "Warranty", label: label, help: help || "", who: "w.claim", where: sub || "Warranty › the claim list — late turns orange",
  kind: "num", unit: unit, def: ({ file: 30, resub: 10, ask: 4, ts: 24, pre: 4, claim: 14, paid: 10, keep: 30, pa: 1500, wo: 500 })[k],
  get: function(){ return +waCfg()[k]; }, set: function(v){ if(+v > 0) waCfg()[k] = +v; }, ok: function(v){ return +v > 0; } }; }
function sgOnOff(v){ return v === undefined || v === null ? "as the role" : v ? "on" : "off"; }
function sgCh(b, a, name, val){   /* the first change or two between b and a, said plainly: [from, to] */
  var P = sgDiff(b, a, [], []); if(!P.length) return null;
  var N = P.slice(0, 2).map(function(p){ return name(p); }), more = P.length > 2 ? " and " + (P.length - 2) + " more" : "";
  if(P.length === 1) return [N[0] + ": " + val(sgAt(b, P[0]), P[0]), val(sgAt(a, P[0]), P[0])];
  return [N.join("; ") + more, "changed"];
}
function sgRoleOf(id){ return staffList().filter(function(sf){ return sf.id === id; })[0] || null; }

/* ---------- the registry ---------- */
var SG_REG = [
  /* ---- Me ---- */
  { id: "me.photo", g: "me", sub: "You", label: "Your photo", help: "on your punches, the Foreman board and the sign-in page", who: "me", where: "Everywhere your name shows", kind: "custom",
    show: function(){ return !!sgMe(); }, render: function(){ var me = sgMe();
      return '<div class="sg-you">' + pxAv("px-av xl") + '<span class="r"><label class="px-btn sm">' + pxI("camera", 13) + 'Upload a photo<input type="file" accept="image/*" data-photo="' + me.id + '" hidden></label>'
        + (me.photo ? '<button class="px-btn sm" data-action="staff-photo-clear" data-id="' + me.id + '">Use the portrait</button>' : '') + '</span></div>'; } },
  { id: "me.name", g: "me", sub: "You", label: "Your name", help: "on your punches and notes when no one is signed in", who: "me", where: "Punches and notes made as the Admin", kind: "text", ph: "Your name",
    show: function(){ return !sgMe(); }, def: "", get: function(){ return String(STATE.techName || ""); }, set: function(v){ STATE.techName = String(v || "").trim(); } },
  { id: "me.theme", g: "me", sub: "Look", label: "Theme", help: "Ivory and Graphite, or White and Near black", who: "me", per: "computer", where: "Every page", kind: "seg",
    opts: function(){ return THEME_ORDER.map(function(m){ return [m, themeLabel(m)]; }); }, def: "ivl", get: function(){ return THEME; }, set: function(v){ applyTheme(v); } },
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
  { id: "people.each", g: "people", sub: "Person by person", label: "Role, pages and what they can do", help: "from their role — change any for one person alone", who: "a.people", where: "That person’s pages and buttons", kind: "custom",
    show: function(){ return staffList().some(function(sf){ return sf && sf.name; }); },
    def: function(){ var o = {}; staffList().forEach(function(sf){ if(sf && sf.id) o[sf.id] = { role: sf.role, ov: { pages: {}, acts: {} } }; }); return o; },
    get: function(){ var o = {}; staffList().forEach(function(sf){ if(sf && sf.id) o[sf.id] = { role: sf.role, ov: sgCopy(sf.ov || { pages: {}, acts: {} }) }; }); return o; },
    set: function(v){ var me = sgMe(); Object.keys(v || {}).forEach(function(id){ var sf = sgRoleOf(id); if(!sf || !v[id] || (me && me.id === id)) return; if(v[id].role && v[id].role !== sf.role) permSetRole(sf, v[id].role); sf.ov = sgCopy(v[id].ov || { pages: {}, acts: {} }); sf.ov.pages = sf.ov.pages || {}; sf.ov.acts = sf.ov.acts || {}; permSyncPages(sf); }); },
    text: function(v){ var L = []; Object.keys(v || {}).forEach(function(id){ var sf = sgRoleOf(id), x = v[id], n = x && x.ov ? Object.keys(x.ov.pages || {}).length + Object.keys(x.ov.acts || {}).length : 0; if(sf && n) L.push(admFirst(sf.name) + " " + n + " changed"); }); return L.join(", ") || "everyone as their role"; },
    words: function(){ return staffList().map(function(sf){ return sf.name + " " + sf.role; }).join(" "); },
    render: function(ro){ var P = staffList().filter(function(sf){ return sf && sf.name; }), id = UI.sgPerson && sgRoleOf(UI.sgPerson) ? UI.sgPerson : (P[0] || {}).id, sf = sgRoleOf(id); if(!sf) return '';
      var self = !!(sgMe() && sgMe().id === sf.id), lk = ro || self, d = lk ? ' disabled' : '', f = esc(admFirst(sf.name)), n = permChangedN(sf);
      var h = '<div class="sg-pp"><span class="sg-ctl"><select data-sg-person="1" aria-label="Person">' + P.map(function(x){ return '<option value="' + x.id + '"' + (x.id === sf.id ? ' selected' : '') + '>' + esc(x.name) + ' — ' + esc(x.role) + (permChangedN(x) ? ' · ' + permChangedN(x) + ' changed' : '') + '</option>'; }).join('') + '</select>'
        + '<small>Role</small><select data-sg-in="people.each" data-op="' + sf.id + '|role" aria-label="Role"' + d + '>' + permRoles().map(function(r){ return '<option' + (r === sf.role ? ' selected' : '') + '>' + esc(r) + '</option>'; }).join('') + '</select>'
        + (n && !lk ? '<button class="px-btn sm ghost" data-action="px-sg-op" data-id="people.each" data-op="' + sf.id + '|back">Back to the ' + esc(sf.role) + ' role</button>' : '') + '</span>'
        + (self ? '<p class="sg-p">This is you — someone else with “Manage people and PINs”, or the Admin, changes your own pages and actions.</p>' : '')
        + '<div class="sg-sh">Pages</div><div class="sg-chips">' + PERM_PAGES.map(function(p){ var on = permHas(sf, "pages", p[0]), c = permChanged(sf, "pages", p[0]);
          return '<button class="sg-chip' + (on ? ' on' : '') + (c ? ' ov' : '') + '" data-action="px-sg-op" data-id="people.each" data-op="' + sf.id + '|pages|' + p[0] + '" aria-pressed="' + on + '"' + d + '>' + (on ? pxI("check", 12) : '') + esc(p[1]) + '</button>'; }).join('') + '</div>'
        + '<div class="sg-sh">What ' + f + ' can do</div><div class="sg-acts">' + PERM_ACTS.map(function(g){ return '<div><b>' + esc(g[0]) + '</b>' + g[1].map(function(a){ var on = permHas(sf, "acts", a[0]), c = permChanged(sf, "acts", a[0]);
          return '<button class="sg-sw' + (c ? ' ov' : '') + '" role="switch" aria-checked="' + on + '" data-action="px-sg-op" data-id="people.each" data-op="' + sf.id + '|acts|' + a[0] + '"' + d + '><span>' + esc(a[1]) + '</span>' + pxSw(on) + '</button>'; }).join('') + '</div>'; }).join('') + '</div></div>';
      return h; },
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
  { id: "data.trucks", g: "data", sub: "Truck pictures", label: "Truck pictures", help: "the pictures the RO page and the yard draw", who: "me", where: "The RO page truck card · the yard", kind: "mount",
    words: "truck pictures photos", render: function(){ try{ return trkSettingsHtml(); }catch(e){ return ''; } } },
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

/* Fork A's Automations page, when the build has it: a string (autoPageHtml), a mount (autoPageMount), or null */
function sgAutoPage(){
  try{ if(typeof autoPageHtml === "function") return autoPageHtml(); }catch(e){ console.error(e); }
  try{ if(typeof autoPageMount === "function") return "mount"; }catch(e){}
  return null;
}
function sgShown(e){ if(e.fallback && sgAutoPage() !== null) return false; try{ return !e.show || !!e.show(); }catch(x){ return false; } }

/* ---------- values, defaults, who ---------- */
function sgDef(e){ return typeof e.def === "function" ? e.def() : sgCopy(e.def); }
function sgHasVal(e){ return typeof e.get === "function"; }
function sgVal(e){ try{ return e.get(); }catch(x){ return null; } }
function sgChanged(e){ if(!sgHasVal(e) || e.def === undefined || e.kind === "action" || e.kind === "ref" || e.kind === "mount") return false; if(e.dot) return !!e.dot(); return !sgSame(sgVal(e), sgDef(e)); }
function sgOpts(e){ return typeof e.opts === "function" ? e.opts() : (e.opts || []); }
function sgText(e, v){
  if(v === undefined) v = sgVal(e);
  if(e.text) try{ return String(e.text(v)); }catch(x){ return ""; }
  if(e.kind === "seg" || e.kind === "sel"){ var o = sgOpts(e).filter(function(x){ return String(x[0]) === String(v); })[0]; return o ? o[1] : String(v); }
  if(e.kind === "sw") return v ? "On" : "Off";
  if(e.kind === "num") return v + (e.unit ? " " + e.unit : "");
  if(e.kind === "text") return v ? String(v) : "—";
  return "";
}
function sgRolesWith(act){ return permRoles().filter(function(r){ var t = permRole(r); return !!(t.acts && t.acts[act]); }); }
function sgPeopleWith(act){ return staffList().filter(function(sf){ return sf && !sf.off && permChanged(sf, "acts", act) && permHas(sf, "acts", act); }).map(function(sf){ return admFirst(sf.name); }); }
function sgCan(e){
  var w = e.who; if(w === "me") return true;
  var me = sgMe(); if(!me) return true;                                    /* the Admin: everything */
  if(me.off) return false;
  if(w === "admin") return false;
  if(w === "va") return me.role === "Manager";
  return can(w);
}
function sgWho(e){   /* the who line — from the permissions as they are now */
  if(e.who === "me") return e.per === "computer" ? "You — saved on this computer" : "You — saved for you";
  if(e.who === "admin") return "Only the Admin";
  if(e.who === "va") return "The manager and the Admin";
  var R = sgRolesWith(e.who).map(function(r){ return r.toLowerCase(); }), P = sgPeopleWith(e.who);
  return R.length || P.length ? "The " + sgAnd(R.concat(P).concat(["Admin"])) : "Only the Admin";
}
function sgOnly(e){
  if(e.who === "admin") return "Only the Admin can change this";
  if(e.who === "va") return "Only the manager can change this";
  var R = sgRolesWith(e.who).map(function(r){ return r.toLowerCase(); }), P = sgPeopleWith(e.who);
  return R.length || P.length ? "Only the " + sgAnd(R.concat(P)) + " can change this" : "Only the Admin can change this";
}

/* ---------- changing: every change goes through here — before and after, the log, the save ---------- */
function sgLog(){ if(!Array.isArray(STATE.setLog)) STATE.setLog = []; return STATE.setLog; }
var SG_BUSY = 0;
function sgChange(id, fn, how){
  var e = SG_BY[id]; if(!e) return false;
  if(!sgCan(e)){ pushToast(sgOnly(e) + "."); return false; }
  var before = sgHasVal(e) ? sgCopy(sgVal(e)) : null, r;
  SG_BUSY++; try{ r = fn(e); }catch(x){ console.error(x); r = false; } finally{ SG_BUSY--; }
  if(typeof r === "string"){ pushToast(r); render(); return false; }
  var after = sgHasVal(e) ? sgCopy(sgVal(e)) : null;
  if(sgSame(before, after)){ render(); return false; }
  if(e.after) try{ e.after(before, after); }catch(x){ console.error(x); }
  var x = sgRecord(e, before, after, how);
  scheduleSave(true); render();
  if(!e.quiet) pushToast(e.label + ": " + (e.change ? x.fromT + " → " + x.toT : x.toT) + (how === "reset" ? " — back to the default" : how === "undo" ? " — put back" : "") + ".");
  return true;
}
function sgRecord(e, before, after, how){
  var me = sgMe(), L = sgLog();
  var ch = null; if(e.change) try{ ch = e.change(before, after); }catch(z){ ch = null; }
  var x = { id: uid("sg"), k: e.id, at: nowIso(), by: sgByName(), byId: me ? me.id : "", how: how || "set", fromT: ch ? ch[0] : sgText(e, before), toT: ch ? ch[1] : sgText(e, after) };
  if(!e.secret){ x.from = before; x.to = after; }
  L.push(x); if(L.length > 120) STATE.setLog = L.slice(-120);
  return x;
}
function sgSet(id, v, how){ return sgChange(id, function(e){ if(e.ok && !e.ok(v)) return "Type " + (e.unit === "$ an hour" ? "the labor rate in dollars" : "a number") + "."; e.set(v); }, how); }
function sgOp(id, op, val){ return sgChange(id, function(e){ var cur = sgCopy(sgVal(e)), r = e.op(op, val, cur); if(typeof r === "string") return r; e.set(r); }); }
function sgReset(id){ var e = SG_BY[id]; if(!e || e.noReset || !sgChanged(e)) return false; return sgChange(id, function(e){ e.set(sgDef(e)); }, "reset"); }
function sgResetGroup(g){
  var L = SG_REG.filter(function(e){ return e.g === g && sgShown(e) && !e.noReset && sgChanged(e) && sgCan(e); }), n = 0, Q = [];
  SG_BUSY++; try{ L.forEach(function(e){ var b = sgCopy(sgVal(e)); try{ e.set(sgDef(e)); }catch(x){ console.error(x); return; } var a = sgCopy(sgVal(e)); if(!sgSame(a, b)){ if(e.after) try{ e.after(b, a); }catch(x){} Q.push([e, b, a]); n++; } }); }finally{ SG_BUSY--; }
  Q.forEach(function(q){ sgRecord(q[0], q[1], q[2], "reset"); });
  UI.sgArm = null; if(n) scheduleSave(true); render();
  pushToast(n ? n + (n === 1 ? " setting" : " settings") + " back to the default — Undo each in Recently changed." : "Nothing to reset.");
  return n;
}
/* the paths that differ between two values: undo puts back only what that one change changed */
function sgDiff(a, b, p, out){
  if(sgSame(a, b)) return out;
  var oa = a && typeof a === "object" && !Array.isArray(a), ob = b && typeof b === "object" && !Array.isArray(b);
  if(oa && ob){ var ks = {}; Object.keys(a).forEach(function(k){ ks[k] = 1; }); Object.keys(b).forEach(function(k){ ks[k] = 1; }); Object.keys(ks).forEach(function(k){ sgDiff(a[k], b[k], p.concat([k]), out); }); return out; }
  if(p.length && SG_META[p[p.length - 1]]) return out;
  out.push(p); return out;
}
function sgAt(o, p){ for(var i = 0; i < p.length; i++){ if(o == null) return undefined; o = o[p[i]]; } return o; }
function sgPut(o, p, v){ if(!p.length) return v; if(!o || typeof o !== "object") o = {}; var c = o; for(var i = 0; i < p.length - 1; i++){ if(!c[p[i]] || typeof c[p[i]] !== "object") c[p[i]] = {}; c = c[p[i]]; } if(v === undefined) delete c[p[p.length - 1]]; else c[p[p.length - 1]] = v; return o; }
function sgCanUndo(x){ var e = SG_BY[x.k]; if(!e || x.undoneAt || !("from" in x) || !sgHasVal(e)) return false; if(e.who === "me"){ var me = sgMe(); if((me ? me.id : "") !== (x.byId || "")) return false; } return sgCan(e); }
function sgUndo(logId){
  var x = sgLog().filter(function(y){ return y.id === logId; })[0]; if(!x) return false;
  var e = SG_BY[x.k]; if(!e) return false;
  if(!sgCanUndo(x)){ pushToast(x.undoneAt ? "That one is already put back." : !("from" in x) ? "A PIN can’t be put back — set it again." : sgCan(e) ? "Only " + x.by + " can put that back." : sgOnly(e) + "."); return false; }
  var ok = sgChange(x.k, function(e){ var cur = sgCopy(sgVal(e)); sgDiff(x.from, x.to, [], []).forEach(function(p){ cur = sgPut(cur, p, sgCopy(sgAt(x.from, p))); }); e.set(cur); }, "undo");
  x.undoneAt = nowIso(); x.undoneBy = sgByName(); scheduleSave(true); render();
  return ok;
}
/* a change made from the person pop-over's Tooltips row goes in the list too */
(function(o){ ptipSetMode = function(v){ var b = ptipMode(), r = o.apply(this, arguments);
  if(!SG_BUSY && b !== r && SG_BY["me.tips"]){ try{ sgRecord(SG_BY["me.tips"], b, r, "set"); scheduleSave(true); }catch(e){} } return r; }; })(ptipSetMode);

/* ---------- going to a setting ---------- */
function sgOpen(sec, id){
  if(UI.view !== "profile"){ UI.pxPrev = UI.view; UI.view = "profile"; try{ window.scrollTo(0, 0); }catch(e){} }
  UI.pxSec = sgSec(sec); UI.sgQ = ""; UI.pxPop = null; UI.appMenu = false; UI.modal = null;
  if(id){ UI.sgHl = id; UI.sgHlUntil = Date.now() + 2000; }
  render();
  var qi = document.querySelector("[data-sg-q]"); if(qi && qi.value){ qi.value = ""; try{ qi.blur(); }catch(e){} }
  if(id) setTimeout(function(){ var r = document.getElementById("sg-r-" + id.replace(/\./g, "-")); if(r) try{ r.scrollIntoView({ block: "center" }); }catch(e){} }, 30);
  if(id) setTimeout(function(){ if(UI.sgHl === id && Date.now() >= UI.sgHlUntil - 20){ UI.sgHl = null; var r = document.querySelector(".sg-row.sg-hl"); if(r) r.classList.remove("sg-hl"); } }, 2010);
}
function sgGo(id){ var e = SG_BY[id]; if(!e) return; sgOpen(e.g, id); }
/* the short link that stands where a setting used to be */
function sgWhere(g){ return "Settings › " + ((SG_GROUPS.filter(function(x){ return x[0] === g; })[0] || [])[2] || "Settings"); }
function sgLinkHtml(g, id, what, person){
  return '<div class="sg-link">' + pxI("settings", 15) + '<span>' + esc(what || "These settings") + ' are in <b>' + esc(sgWhere(g)) + '</b></span><button class="px-btn sm" data-action="px-sg-go" data-g="' + g + '"' + (id ? ' data-id="' + esc(id) + '"' : '') + (person ? ' data-person="' + esc(person) + '"' : '') + '>Open</button></div>';
}

/* ---------- search: labels, help and values ---------- */
function sgWords(e){ var w = typeof e.words === "function" ? (function(){ try{ return e.words(); }catch(x){ return ""; } })() : (e.words || "");
  return [e.label, e.help, e.sub || "", e.where, sgHasVal(e) ? sgText(e) : "", (e.kind === "seg" || e.kind === "sel") ? sgOpts(e).map(function(o){ return o[1]; }).join(" ") : "", e.ph || "", w].join(" ").toLowerCase(); }
function sgFind(q){ q = String(q || "").trim().toLowerCase(); if(!q) return []; var T = q.split(/\s+/);
  return SG_REG.filter(function(e){ if(!sgShown(e)) return false; var w = sgWords(e); return T.every(function(t){ return w.indexOf(t) > -1; }); })
    .sort(function(a, b){ var la = a.label.toLowerCase().indexOf(q) > -1 ? 0 : 1, lb = b.label.toLowerCase().indexOf(q) > -1 ? 0 : 1; return la - lb; }); }

/* ---------- drawing ---------- */
function sgCtl(e, ro){
  var v = sgVal(e), d = ro ? ' disabled' : '', idq = esc(e.id);
  if(e.render) return e.render(ro);
  if(e.id === "me.theme") return '<span class="sg-themes">' + THEME_ORDER.map(function(m){ var t = THEMES[m], on = v === m;
    return '<button class="px-tp' + (on ? ' on' : '') + '" data-action="px-sg-set" data-id="me.theme" data-v="' + m + '" aria-pressed="' + on + '"' + d + '><span class="pv" style="background:' + t.bg + '"><i style="background:' + t.card + '"></i><i class="l" style="background:' + (t.dark ? '#EDEBE6' : '#1D1C1A') + '"></i><i class="a" style="background:' + t.acc + '"></i></span>'
      + '<span class="nm">' + pxI(t.dark ? "moon" : "sun", 13) + esc(themeLabel(m)) + (on ? '<span class="ck">' + pxI("check", 13) + '</span>' : '') + '</span></button>'; }).join('') + '</span>';
  if(e.kind === "seg") return '<span class="px-seg sg-seg" role="group" aria-label="' + esc(e.label) + '">' + sgOpts(e).map(function(o){ var on = String(o[0]) === String(v);
    return '<button class="' + (on ? 'on' : '') + '" data-action="px-sg-set" data-id="' + idq + '" data-v="' + esc(String(o[0])) + '" aria-pressed="' + on + '"' + d + '>' + esc(o[1]) + '</button>'; }).join('') + '</span>';
  if(e.kind === "sw") return '<button class="sg-swb" role="switch" aria-checked="' + !!v + '" aria-label="' + esc(e.label) + '" data-action="px-sg-set" data-id="' + idq + '" data-v="' + (v ? "0" : "1") + '"' + d + '>' + pxSw(!!v) + '</button>';
  if(e.kind === "sel") return '<select data-sg-in="' + idq + '" aria-label="' + esc(e.label) + '"' + d + '>' + sgOpts(e).map(function(o){ return '<option value="' + esc(String(o[0])) + '"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>';
  if(e.kind === "num") return '<span class="sg-ctl"><input class="sg-num mono" data-sg-in="' + idq + '" value="' + esc(v > 0 || e.ph == null ? String(v) : '') + '"' + (e.ph ? ' placeholder="' + esc(e.ph) + '"' : '') + ' inputmode="decimal" aria-label="' + esc(e.label) + '"' + d + '>' + (e.unit ? '<small>' + esc(e.unit) + '</small>' : '') + '</span>';
  if(e.kind === "text") return '<input class="sg-txt" data-sg-in="' + idq + '" value="' + esc(String(v || "")) + '"' + (e.ph ? ' placeholder="' + esc(e.ph) + '"' : '') + ' aria-label="' + esc(e.label) + '" autocomplete="off"' + d + '>';
  return '';
}
function sgRowHtml(e){
  var ro = !sgCan(e), ch = sgChanged(e), hl = UI.sgHl === e.id && Date.now() < (UI.sgHlUntil || 0), wide = e.kind === "custom" || e.kind === "mount" || e.kind === "action" || e.kind === "ref" || e.id === "me.theme";
  var dv = ch ? sgText(e, sgDef(e)) : "";
  var head = '<div class="sg-l"><b>' + (ch ? '<i class="sg-dot" title="Changed — the default is ' + esc(dv) + '" aria-label="changed from the default"></i>' : '') + esc(e.label) + '</b>' + (e.help ? '<small>' + esc(e.help) + '</small>' : '')
    + (e.kind === "ref" ? '' : '<span class="sg-ww"><span>' + pxI(e.who === "me" ? "user" : "lock", 11) + esc(sgWho(e)) + (e.who === "me" ? '' : e.kind === "action" || e.kind === "mount" ? ' can use it' : ' can change it') + '</span><i>·</i><span>' + pxI("eye", 11) + esc(e.where) + '</span></span>')
    + (ro && e.kind !== "ref" ? '<span class="sg-ro">' + pxI("lock", 11) + esc(e.kind === "action" || e.kind === "mount" ? sgOnly(e).replace(/change this$/, "use this") : sgOnly(e)) + '</span>' : '') + '</div>';
  var reset = ch && !ro && !e.noReset ? '<button class="px-btn sm ghost sg-reset" data-action="px-sg-reset" data-id="' + esc(e.id) + '" title="Back to the default — ' + esc(dv) + '">' + pxI("history", 12) + 'Reset</button>' : '';
  var ctl = ''; try{ ctl = sgCtl(e, ro); }catch(x){ console.error(x); }
  return '<div class="sg-row' + (wide ? ' wide' : '') + (ch ? ' chg' : '') + (ro ? ' ro' : '') + (hl ? ' sg-hl' : '') + '" id="sg-r-' + e.id.replace(/\./g, "-") + '" data-sg-id="' + esc(e.id) + '">' + head
    + '<div class="sg-c">' + ctl + reset + '</div></div>';
}
function sgGroupHtml(g){
  var L = SG_REG.filter(function(e){ return e.g === g && sgShown(e); }), subs = [], by = {};
  L.forEach(function(e){ var s = e.sub || ""; if(!(s in by)){ by[s] = []; subs.push(s); } by[s].push(e); });
  var n = L.filter(function(e){ return !e.noReset && sgChanged(e) && sgCan(e); }).length, arm = UI.sgArm === g;
  var bar = n ? '<div class="sg-gbar"><span><i class="sg-dot"></i>' + n + (n === 1 ? ' setting is' : ' settings are') + ' changed from the default</span><span class="sp"></span><button class="px-btn sm' + (arm ? ' pri' : '') + '" data-action="px-sg-rgroup" data-g="' + g + '">' + pxI("history", 12) + (arm ? 'Click again to reset ' + n : 'Reset this group') + '</button></div>' : '';
  if(g === "people" && !staffList().length) bar += '<div class="sg-link">' + pxI("user", 15) + '<span>No one to sign in as yet — add people on the Admin page.</span><button class="px-btn sm" data-action="demo-team">Create a demo team</button></div>';
  return bar + subs.map(function(s){ return '<section class="px-card sg-card">' + (s ? '<div class="px-ch"><b>' + esc(s) + '</b></div>' : '') + by[s].map(sgRowHtml).join('') + '</section>'; }).join('')
    + (g === "people" ? '<p class="sg-foot">Adding people, PIN resets and turning a sign-in off stay on the <button class="sg-lk" data-action="nav" data-view="admin">Admin page</button>.</p>' : '')
    + (g === "data" ? '<div class="px-build mono">' + esc(BUILD) + '</div>' : '');
}
function sgRecentHtml(){
  var L = sgLog().slice().reverse().slice(0, 60);
  if(!L.length) return '<section class="px-card sg-card"><p class="sg-p">Nothing changed yet. Changes made here — and Size, Theme and Tooltips from your menu — show up with who made them, and Undo.</p></section>';
  var days = []; L.forEach(function(x){ var d = localDay(x.at); if(days.indexOf(d) < 0) days.push(d); });
  return days.map(function(d){ return '<section class="px-card sg-card"><div class="px-ch"><b>' + esc(d === todayStr() ? "Today" : new Date(d + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })) + '</b></div>'
    + L.filter(function(x){ return localDay(x.at) === d; }).map(function(x){ var e = SG_BY[x.k], g = e ? e.g : "me", u = sgCanUndo(x);
      return '<div class="sg-lr' + (x.undoneAt ? ' done' : '') + '" data-sg-log="' + esc(x.id) + '"><time>' + esc(fmtTime(x.at)) + '</time><span class="x"><b>' + esc(e ? e.label : x.k) + '</b><small>' + esc(x.fromT || "—") + ' → ' + esc(x.toT || "—") + '</small></span>'
        + '<span class="who">' + esc(x.by || "Admin") + (x.how === "reset" ? ' · reset' : x.how === "undo" ? ' · put back' : '') + '<small>' + esc(sgWhere(g)) + '</small></span>'
        + (x.undoneAt ? '<span class="sg-und">Put back by ' + esc(x.undoneBy || "") + '</span>' : u ? '<button class="px-btn sm" data-action="px-sg-undo" data-log="' + esc(x.id) + '">' + pxI("history", 12) + 'Undo</button>' : '<span class="sg-und">' + esc(!("from" in x) ? "can’t be undone" : SG_BY[x.k] && SG_BY[x.k].who === "me" ? "theirs" : "read-only") + '</span>')
        + '<button class="sg-lk" data-action="px-sg-go" data-id="' + esc(x.k) + '">Show</button></div>'; }).join('') + '</section>'; }).join('');
}
function sgSearchHtml(q){
  var R = sgFind(q);
  if(!R.length) return '<section class="px-card sg-card"><p class="sg-p">No setting matches “' + esc(q) + '”.</p></section>';
  return '<section class="px-card sg-card sg-res">' + R.map(function(e, i){ var gn = (SG_GROUPS.filter(function(g){ return g[0] === e.g; })[0] || [])[2];
    return '<button class="sg-hit' + (i === 0 ? ' k' : '') + '" data-action="px-sg-go" data-id="' + esc(e.id) + '"><span class="p">' + esc(gn) + (e.sub ? ' › ' + esc(e.sub) : '') + '</span><b>' + (sgChanged(e) ? '<i class="sg-dot"></i>' : '') + esc(e.label) + '</b><small>' + esc(e.help) + '</small>'
      + (sgHasVal(e) ? '<span class="v">' + esc(sgText(e)) + '</span>' : '') + '</button>'; }).join('') + '</section>';
}
function pxProfileView(){
  var me = sgMe(), sec = sgSec(UI.pxSec || "me"), warn = pxBkWarn(), sin = pxLS("tec_signin_at"), q = String(UI.sgQ || "");
  if(sec === "data" && !UI.pxBk) setTimeout(pxBkLoad, 0);
  var back = UI.pxPrev && UI.pxPrev !== "profile" && navAllowed(UI.pxPrev) ? UI.pxPrev : navPages()[0][0], bn = (NAV_PAGES.filter(function(p){ return p[0] === back; })[0] || ["", "the last page"])[1];
  var head = '<header class="px-head"><h1 class="px-h1">Settings</h1><span class="px-facts"><span class="px-hf">' + pxAv("px-av") + esc(pxMeName()) + '<span class="px-role">' + esc(pxMeRole()) + '</span></span>'
    + (me && sin ? '<i>·</i><span class="px-hf">signed in <b>' + esc(pxAgo(sin)) + '</b></span>' : '')
    + (warn ? '<i>·</i><button class="px-hf w" data-action="px-sec" data-s="data"><b>' + esc(warn) + '</b></button>' : '') + '</span>'
    + '<span class="sp"></span><button class="px-btn sm" data-action="nav" data-view="' + back + '">' + pxI(IV_NAV_IC[back] || "console", 14) + 'Back to ' + esc(bn) + '</button></header>';
  var cnt = function(g){ return SG_REG.filter(function(e){ return e.g === g && sgShown(e) && sgChanged(e); }).length; }, today = sgLog().filter(function(x){ return localDay(x.at) === todayStr(); }).length;
  var list = '<section class="px-list sg-menu"><div class="sg-srch">' + pxI("search", 14) + '<input data-sg-q="1" placeholder="Search settings" value="' + esc(q) + '" autocomplete="off" aria-label="Search settings">' + (q ? '<button class="sg-qx" data-action="px-sg-q0" aria-label="Clear the search">' + pxI("x", 12) + '</button>' : '') + '</div><div class="px-scroll sg-nav">'
    + SG_GROUPS.map(function(g){ var n = cnt(g[0]);
      return '<div class="px-it' + (!q && sec === g[0] ? ' on' : '') + '" data-action="px-sec" data-s="' + g[0] + '" role="button" tabindex="0"><span class="px-gi">' + pxI(g[1], 15) + '</span><span class="px-t"><b>' + esc(g[2]) + '</b></span><span class="px-w">' + esc(g[3]) + '</span>'
        + (n ? '<span class="sg-n" title="' + n + ' changed from the default"><i class="sg-dot"></i>' + n + '</span>' : g[0] === "data" && warn ? '<i class="pxr-warn in"></i>' : '') + '</div>'; }).join('')
    + '<div class="sg-sep"></div><div class="px-it' + (!q && sec === "recent" ? ' on' : '') + '" data-action="px-sec" data-s="recent" role="button" tabindex="0"><span class="px-gi">' + pxI("history", 15) + '</span><span class="px-t"><b>Recently changed</b></span><span class="px-w">who changed what, when — with Undo</span>' + (today ? '<span class="sg-n">' + today + '</span>' : '') + '</div>'
    + '</div><div class="px-keys"><span>' + pxKbd("[") + 'sidebar</span><span>' + pxKbd("?") + 'shortcuts</span><span>' + pxKbd("Esc") + 'back</span></div></section>';
  var title, body;
  if(q){ title = 'Settings matching “' + q + '”'; body = sgSearchHtml(q); }
  else if(sec === "recent"){ title = "Recently changed"; body = sgRecentHtml(); }
  else { var G = SG_GROUPS.filter(function(g){ return g[0] === sec; })[0]; title = G[2]; body = sgGroupHtml(sec); }
  return '<div class="px pxp sg-page" data-key="px-profile" data-sg-sec="' + (q ? "search" : sec) + '">' + head + '<div class="px-body">' + list + '<div class="px-main" data-scroll="px-prof"><div class="px-doc sg-doc"><h2>' + esc(title) + '</h2>' + body + '</div></div></div></div>';
}

/* ---------- actions ---------- */
function sgQSet(q){ UI.sgQ = q; render(); var i = document.querySelector("[data-sg-q]"); if(i){ if(i.value !== q) i.value = q; i.focus(); } }
function sgAct(a, t, e){
  var id = t.dataset.id;
  if(a === "px-sg-set"){ var en = SG_BY[id]; if(!en) return true; var v = t.dataset.v; if(en.kind === "sw") v = v === "1"; else if(typeof sgVal(en) === "number") v = +v; sgSet(id, v); return true; }
  if(a === "px-sg-quick"){ var eq = SG_BY[id]; if(eq) sgSet(id, t.dataset.v); return true; }   /* the person pop-over: it stays open */
  if(a === "px-sg-op"){ sgOp(id, t.dataset.op, t.dataset.v); return true; }
  if(a === "px-sg-reset"){ sgReset(id); return true; }
  if(a === "px-sg-rgroup"){ var g = t.dataset.g; if(UI.sgArm !== g){ UI.sgArm = g; render(); setTimeout(function(){ if(UI.sgArm === g){ UI.sgArm = null; render(); } }, 4000); return true; } sgResetGroup(g); return true; }
  if(a === "px-sg-undo"){ sgUndo(t.dataset.log); return true; }
  if(a === "px-sg-go"){ if(t.dataset.person) UI.sgPerson = t.dataset.person; if(id) sgGo(id); else sgOpen(t.dataset.g || "me"); return true; }
  if(a === "px-sg-q0"){ sgQSet(""); return true; }
  if(a === "px-sg-tpl"){ if(!sgCan(SG_BY["shop.tpl"])){ pushToast(sgOnly(SG_BY["shop.tpl"]) + "."); return true; } UI.modal = { type: "tg-tpl", sel: tgTpls()[0].id }; render(); return true; }
  if(a === "px-sg-am"){ if(!sgCan(SG_BY["auto.rules"])){ pushToast(sgOnly(SG_BY["auto.rules"]) + "."); return true; } UI.modal = { type: "automations", edit: null }; render(); return true; }
  if(a === "px-sg-apin"){ var p1 = document.querySelector('[data-sg-pin="1"]'), p2 = document.querySelector('[data-sg-pin="2"]'), A = p1 ? p1.value : "", B = p2 ? p2.value : "";
    if(viewAsId()){ pushToast("Only the Admin changes the Admin PIN."); return true; }
    if(!pinValid(A)){ pushToast("The Admin PIN is 4 digits."); return true; } if(A !== B){ pushToast("The two PINs don’t match."); return true; }
    var was = adminPinIs(); adminPinSet(A); try{ audit("pin", "Changed the Admin PIN"); }catch(x){}
    sgRecord(SG_BY["people.adminPin"], was, true, "set"); scheduleSave(true); render(); pushToast("Admin PIN set — Parsec keeps it scrambled."); return true; }
  return false;
}
function sgInput(t){
  var id = t.getAttribute("data-sg-in"), en = SG_BY[id]; if(!en) return;
  var op = t.getAttribute("data-op"), v = t.value;
  if(op != null && en.op){ sgOp(id, op, v); return; }
  if(en.kind === "num"){ var s = String(v).replace(/[$,\s]/g, ""); var n = s === "" ? 0 : parseFloat(s); if(isNaN(n)){ pushToast("Type a number."); render(); return; } sgSet(id, n); return; }
  if(en.kind === "sel" && typeof sgVal(en) === "number"){ sgSet(id, +v); return; }
  sgSet(id, v);
}
document.addEventListener("change", function(ev){ var t = ev.target; if(!t || !t.getAttribute) return;
  if(t.getAttribute("data-sg-in")){ sgInput(t); return; }
  if(t.getAttribute("data-sg-person")){ UI.sgPerson = t.value; render(); } });
document.addEventListener("keydown", function(ev){ var t = ev.target; if(!t || !t.getAttribute) return;
  if(ev.key === "Enter" && t.getAttribute("data-sg-in") && t.tagName === "INPUT"){ ev.preventDefault(); t.blur(); return; }
  if(t.getAttribute("data-sg-q")){
    if(ev.key === "Escape" && UI.sgQ){ ev.preventDefault(); ev.stopPropagation(); sgQSet(""); return; }
    if(ev.key === "Enter"){ ev.preventDefault(); var R = sgFind(UI.sgQ); if(R.length) sgGo(R[0].id); } }
  if(ev.key === "Enter" && t.getAttribute("data-sg-pin")){ ev.preventDefault(); var b = document.querySelector('[data-action="px-sg-apin"]'); if(b) b.click(); }
}, true);
document.addEventListener("input", function(ev){ var t = ev.target; if(!t || !t.getAttribute || !t.getAttribute("data-sg-q")) return;
  UI.sgQ = t.value; var pos = t.selectionStart; render(); var i = document.querySelector("[data-sg-q]"); if(i){ i.focus(); try{ i.setSelectionRange(pos, pos); }catch(e){} } });
/* after each draw: Fork A's Automations page, when it comes as a mount */
function sgAfter(){
  if(UI.view !== "profile") return;
  var m = document.querySelector('[data-sg-mount="auto"]'); if(m && !m.childNodes.length && typeof autoPageMount === "function") try{ autoPageMount(m); }catch(e){ console.error(e); }
}
(function(r0){ render = function(){ var x = r0.apply(this, arguments); try{ sgAfter(); }catch(e){} return x; }; })(render);

/* ---------- the person pop-over: Size, Tooltips, Theme + All settings… ---------- */
function sgThemeRow(){ return '<div class="pxp-set sg-qt"><span>Theme</span><span class="px-seg" role="group">' + THEME_ORDER.map(function(m){ var t = THEMES[m], on = THEME === m;
  return '<button class="' + (on ? 'on' : '') + '" data-action="px-sg-quick" data-id="me.theme" data-v="' + m + '" aria-pressed="' + on + '" aria-label="' + esc(themeLabel(m)) + '" data-tip="' + esc(themeLabel(m)) + '"><i class="sg-sw8" style="background:' + t.acc + ';box-shadow:inset 0 0 0 4px ' + t.bg + ',0 0 0 1px rgba(0,0,0,.2)"></i></button>'; }).join('') + '</span></div>'; }
function sgSizeRow(){ return '<div class="pxp-set"><span>Size</span><span class="px-seg" role="group">' + [["normal", "Normal"], ["large", "Large"], ["floor", "Shop floor"]].map(function(o){ var on = sizeMode() === o[0];
  return '<button class="' + (on ? 'on' : '') + '" data-action="px-sg-quick" data-id="me.size" data-v="' + o[0] + '" data-size="' + o[0] + '" aria-pressed="' + on + '">' + o[1] + '</button>'; }).join('') + '</span></div>'; }
