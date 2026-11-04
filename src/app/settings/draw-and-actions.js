/* Parsec · settings · draw-and-actions.js
   Drawing the Settings page (groups, rows, Recently changed, search results), its actions, and the person pop-over's Size / Tooltips / Theme rows (pxProfileView).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   sgCtl sgRowHtml sgGroupHtml sgRecentHtml sgSearchHtml pxProfileView sgQSet sgAct sgInput sgAfter sgThemeRow sgSizeRow … (16 functions)
   uses       access/ automations/ clock/ data/ kit/ pages/triage/ ro/ shell/ state/
   at load    on document change · on document keydown · on document input · wraps render
*/
/* ---------- drawing ---------- */
function sgCtl(e, ro){
  var v = sgVal(e), d = ro ? ' disabled' : '', idq = esc(e.id);
  if(e.render) return e.render(ro);
  if(e.id === "me.theme") return '<span class="sg-themes">' + THEME_ORDER.concat(THEME_MORE.length ? ["-"] : [], THEME_MORE).map(function(m){ if(m === "-") return '<span class="sg-thh">More themes</span>'; var t = THEMES[m], on = v === m;
    return '<button class="px-tp' + (on ? ' on' : '') + '" data-action="px-sg-set" data-id="me.theme" data-v="' + m + '" aria-pressed="' + on + '"' + d + '><span class="pv" style="background-color:' + t.bg + (t.grid ? ';background-image:' + t.grid + ';background-size:' + (t.gridSize || '24px 24px') : '') + '"><i style="background:' + t.card + '"></i><i class="l" style="background:' + (t.dark ? '#EDEBE6' : '#1D1C1A') + '"></i><i class="a" style="background:' + t.acc + '"></i></span>'
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
function sgThemeRow(){ return '<div class="pxp-set sg-qt"><span>Theme</span><span class="px-seg" role="group">' + THEME_ORDER.concat(THEME_MORE.indexOf(THEME) >= 0 ? [THEME] : []).map(function(m){ var t = THEMES[m], on = THEME === m;
  return '<button class="' + (on ? 'on' : '') + '" data-action="px-sg-quick" data-id="me.theme" data-v="' + m + '" aria-pressed="' + on + '" aria-label="' + esc(themeLabel(m)) + '" data-tip="' + esc(themeLabel(m)) + '"><i class="sg-sw8" style="background:' + t.acc + ';box-shadow:inset 0 0 0 4px ' + t.bg + ',0 0 0 1px rgba(0,0,0,.2)"></i></button>'; }).join('') + '</span></div>'; }
function sgSizeRow(){ return '<div class="pxp-set"><span>Size</span><span class="px-seg" role="group">' + [["normal", "Normal"], ["large", "Large"], ["floor", "Shop floor"]].map(function(o){ var on = sizeMode() === o[0];
  return '<button class="' + (on ? 'on' : '') + '" data-action="px-sg-quick" data-id="me.size" data-v="' + o[0] + '" data-size="' + o[0] + '" aria-pressed="' + on + '">' + o[1] + '</button>'; }).join('') + '</span></div>'; }

function pxCard(h, cls){ return '<div class="px-card' + (cls ? ' ' + cls : '') + '">' + h + '</div>'; }
function pxCh(t, sub, right){ return '<div class="px-ch"><b>' + esc(t) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + (right ? '<span class="sp"></span>' + right : '') + '</div>'; }
function pxKv(k, v){ return '<div class="px-kv"><span>' + k + '</span><b>' + v + '</b></div>'; }

/* ---------- actions ---------- */
function pxAct(a, t, e){
  if(a.indexOf("px-sg-") === 0) return sgAct(a, t, e);
  if(a.indexOf("px-arr-") === 0) return pxaAct(a, t);   /* 17.1: arranging the side bar */
  switch(a){
    case "px-side": pxSideToggle(); return true;
    case "px-shin": case "px-shin-x": case "px-shin-go": return rcPxAct(a);
    case "px-pop": { var p = t.dataset.p; UI.pxPop = UI.pxPop === p ? null : p; UI.pxShin = false; UI.notifOpen = false; render(); return true; }
    case "px-profile": case "px-sec": {
      if(UI.view !== "profile"){ UI.pxPrev = UI.view; UI.view = "profile"; window.scrollTo(0, 0); }
      UI.pxSec = sgSec(t.dataset.s || "me"); UI.sgQ = ""; UI.sgArm = null; if(t.dataset.person) UI.sgPerson = t.dataset.person; UI.pxPop = null; UI.pxPeek = false; UI.appMenu = false; UI.profileOpen = null; if(UI.pxSec === "data") UI.pxBk = null;
      render(); return true;
    }
    case "px-switch": { var rp = runningPunch(), os0 = openShift(); UI.pxPop = null; lockOff(); pxLS("tec_locked_at", null); try{ var swh = viewAsStaff(); audit("signout", (swh ? swh.name : "Admin") + " — switch user"); }catch(e){} pxLS("tec_out", "1"); pxLS("tec_viewas", null); pxLS("tec_signin_at", null); UI.modal = null; UI.selectedRo = null; if(rp || os0) pushToast(rp ? "Your clock keeps running on " + roTag(getRO(rp.roId)) + " \u2014 switching never stops it." : "Your day clock keeps running \u2014 switching never stops it."); render(); return true; }
    case "px-logout": pxLogout(false); return true;
    case "pdx-export": pdExportForServer(); return true;
    case "pdx-rt": pdRoundTrip(t.dataset.name || null); return true;
    case "pdx-tombs": pdxTombs(); return true;
    case "px-bk-now": pxBkNow(); return true;
    case "px-restore-file": { var inp = document.createElement("input"); inp.type = "file"; inp.accept = "application/json,.json,.gz,application/gzip";
      inp.onchange = function(){ var f = inp.files && inp.files[0]; if(!f) return; pdGunzip(f).then(function(txt){ var data = JSON.parse(txt); if(!data || !data.ros) throw new Error("bad");
        if(!confirm("Restore “" + f.name + "”?\n\nThat file holds " + summarizeState(data) + ".\n\nYour current data is replaced — Undo brings it back.")) return;
        pushUndo("restore from " + f.name); STATE = normalizeState(data); scheduleSave(true); render(); pushToast("Restored from " + f.name, true); }).catch(function(){ pushToast("That file isn’t a Parsec backup."); }); };
      inp.click(); return true; }
    case "px-tog": { var k = t.dataset.k, def = t.dataset.def === "1", on = !pxBkOn(k, def); pxLS(k, on ? "1" : "0"); render(); return true; }
  }
  return false;
}
