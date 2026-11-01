/* Parsec · shell · rail-popovers.js
   The two pop-overs off the rail (the clock, the person) and the tooltip mode row (PTIP_MODES / ptipSetMode).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pxPopHtml pxClockPop ptipWho ptipMode ptipSetMode ptipMenuRow PTIP_MODES (6 functions, 1 constant)
   uses       access/ clock/ kit/ pages/triage/ ro/ state/
*/
/* ---------- the two popovers off the rail ---------- */
function pxPopHtml(){
  if(!UI.pxPop || !ivDesk()) return '';
  if(UI.pxPop === "clk") return pxClockPop();
  if(UI.pxPop === "me") return pxMePop();
  return '';
}
function pxClockPop(){
  var st = pxClockState(), rp = runningPunch(), sh = openShift(), aw = pxAway(), h = '';
  var head = st === "out" ? (aw ? esc(aw.outReason) + (aw.backBy ? ' · back by ' + fmtTime(aw.backBy) : ' · out at ' + fmtTime(aw.out)) : 'Off the clock') : 'On the clock since ' + fmtTime(sh ? sh.in : rp && rp.start);
  h += '<div class="pxp-h"><span class="pxr-dot ' + st + '"></span><b>' + head + '</b>' + (st !== "out" && sh ? rcPxPen(sh) : '') + '<span class="sp"></span>' + (st === "out" ? '' : '<b class="mono" data-shift-hm>' + fmtHM(todayShiftMs()) + '</b>') + '</div>' + (st !== "out" && sh ? rcPxShin(sh) : '');
  if(rp){
    var ro = getRO(rp.roId), op = getOp(rp.roId, rp.opId), shop = !ro || ro.shop || ro.id === SHOP_RO_ID, me = punchByName();
    h += '<div class="pxp-job"><div class="r1"><span class="no mono">' + (shop ? 'Shop' : esc(tgNum(ro))) + '</span><b>' + esc(op ? (op.complaint || 'Operation') : 'On the clock') + '</b></div>'
      + '<div class="r2"><small>' + (shop ? 'Shop time' : esc(ro.customerName || '')) + ' · <span class="mono" data-live-hm="' + rp.start + '">' + fmtHM(Date.now() - new Date(rp.start)) + '</span>' + (op && +op.quoted > 0 ? ' of ' + esc(String(op.quoted)) + ' h' : '')
      + (rp.by && me && !techSame(rp.by, me) ? ' · started by ' + esc(rp.by) : '') + '</small>'
      + '<button class="px-btn sm" data-action="open-start-punch" title="Switch to another operation">' + pxI("swap", 13) + 'Switch</button>'
      + '<button class="px-btn sm" data-action="open-stop-punch">' + pxI("stop", 13) + 'Stop</button></div></div>';
  }
  h += '<div class="pxp-acts">';
  if(st === "out") h += '<button class="px-btn sm pri" data-action="shift-in">' + pxI("play", 13) + (aw && aw.outReason === "Lunch" ? 'Back from lunch' : 'Clock in') + '</button>';
  else h += '<button class="px-btn sm" data-action="clock-off" data-reason="Lunch" data-min="30" title="Clock off for a 30-minute lunch' + (rp ? ' — the job stops for lunch' : '') + '">Lunch · 30 min</button>' + '<button class="px-btn sm" data-action="clock-off" data-reason="Lunch" data-min="60" title="Clock off for an hour \u2014 no clock-in by itself, Parsec reminds you when it\u2019s up">Lunch · 1 h</button>'
    + '<button class="px-btn sm" data-action="shift-out" title="Lunch, home, end of day, an appointment…">Clock out…</button>';
  h += '<span class="sp"></span><button class="px-btn sm ghost" data-action="nav" data-view="timelog">' + pxI("timelog", 13) + 'Time Log</button></div>';
  return '<div class="px-pop pxr-pop clk" role="dialog" aria-label="Clock">' + h + '</div>';
}
/* ===== Parsec 14.9 (A) — one tooltip for the whole app (the pages and the RO page's shadow root) =====
   The user's picks: Ink (dark on light, light on dark) with an arrow · after 400 ms, then at once between neighbours ·
   cut-off text shows in full · Tab focus shows them too · touch: press and hold, and an ⓘ on the few that matter ·
   Tooltips: All · Fewer · Off on the person menu.
   · It takes over the browser's grey title box: while a control is hovered (or focused) its title is stashed in data-ptt so
     the browser draws nothing, and put back on leave. While stashed, getAttribute / hasAttribute / setAttribute /
     removeAttribute('title') and el.title read and write the stash, so code (and tests) that use title see no difference.
   · data-tip="Title|detail|detail" is preferred over title; "~note" and "label::value" lines are the old rich rows (Manager KPIs,
     the Time Log). data-tip-k="Ctrl P" gives keys; data-tip-keep shows it in Fewer too.
   · Words: tipNorm(raw, ctx) (Parsec 14.9 B) when it's there — ctx { icon, disabled, label }; key chips only on icon buttons.
   · The old tips (#pg-tip, the Warranty chart's .wa-tip) stand down; the CSS-only ones (.dr-tip, .dbs-tip) take the Ink look. */
var PTIP_MODES = [["all", "All"], ["fewer", "Fewer"], ["off", "Off"]];
function ptipWho(){ try{ var sf = typeof viewAsStaff === "function" ? viewAsStaff() : null; return sf && sf.id ? String(sf.id) : "admin"; }catch(e){ return "admin"; } }
function ptipMode(){ var v = null; try{ v = localStorage.getItem("ptip_mode:" + ptipWho()); }catch(e){} return v === "fewer" || v === "off" ? v : "all"; }
function ptipSetMode(v){
  v = v === "fewer" || v === "off" ? v : "all";
  try{ localStorage.setItem("ptip_mode:" + ptipWho(), v); }catch(e){}
  PTIP.sync(); PTIP.hide();
  return v;
}
function ptipMenuRow(){ return '<div class="pxp-set ptip-set"><span>Tooltips</span>' + pxSeg(PTIP_MODES, ptipMode(), "ptip-mode", "data-ptm") + '</div>'; }
