/* Parsec · shell · day-ribbon.js
   The slim live strip across the top of every page: today's punches, air and the clock state.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   dayRibbonOn dayRibbonHtml (2 functions)
   uses       clock/ data/ kit/ ro/
*/
/* ============================== DAY RIBBON ==============================
   A slim live strip across the very top of every page: today's punches, air, lunch and
   shop time on one clock, a marker for now and one for 8 hours after you started.
   Point at it for the day's numbers; click it for the full day report. Each complete
   theme draws it its own way. Turn it off in Settings. */
function dayRibbonOn(){ try{ return localStorage.getItem("tec_ribbon") !== "off"; }catch(e){ return true; } }
function dayRibbonHtml(){
  if(!dayRibbonOn()) return "";
  var today = todayStr(), dc = dailyCalc(today), now = Date.now();
  var has = !!(dc.blocks && dc.blocks.length && dc.firstStart);
  var d7 = new Date(); d7.setHours(7,0,0,0);
  var ws = has ? new Date(dc.firstStart).getTime() : Math.min(d7.getTime(), now - 3600000);
  var we = Math.max(ws + 9*3600000, now + 15*60000, has && dc.lastStop ? new Date(dc.lastStop).getTime() : 0);
  var tot = we - ws, cur = ws, segs = "";
  if(has) dc.blocks.forEach(function(b){
    var l = (cur - ws) / tot * 100, w = b.ms / tot * 100; cur += b.ms;
    if(w <= 0) return;
    var k = b.kind === "punch" ? ("punch" + (b.punch.stop ? "" : " dr-live")) : (b.kind || "air");
    segs += '<i class="dr-s dr-'+k+'" style="left:'+l.toFixed(3)+'%;width:'+w.toFixed(3)+'%"></i>';
  });
  var nowP = Math.max(0, Math.min(100, (now - ws) / tot * 100));
  var goalAt = ws + 8*3600000, goalP = (goalAt - ws) / tot * 100;
  var burnt = dc.burntMs || 0, pct = Math.min(100, Math.round(burnt / (8*3600000) * 100));
  var tip = has
    ? '<b>Today</b><span class="mono">'+fmtClockHM(new Date(ws))+' – '+(dc.lastStop ? fmtClockHM(new Date(Math.max(new Date(dc.lastStop).getTime(), 0))) : 'now')+'</span>'
      + '<span class="dr-row"><i class="dr-k dr-punch"></i>Burnt <b class="mono">'+fmtHM(burnt)+'</b></span>'
      + '<span class="dr-row"><i class="dr-k dr-air"></i>Air <b class="mono">'+fmtHM(dc.airMs || 0)+'</b></span>'
      + (dc.lunchMs ? '<span class="dr-row"><i class="dr-k dr-lunch"></i>Lunch <b class="mono">'+fmtHM(dc.lunchMs)+'</b></span>' : '')
      + (dc.shopMs ? '<span class="dr-row"><i class="dr-k dr-shop"></i>Shop <b class="mono">'+fmtHM(dc.shopMs)+'</b></span>' : '')
      + '<span class="dr-prog"><i style="width:'+pct+'%"></i></span>'
      + '<span class="dr-foot">'+(burnt >= 8*3600000 ? '8 hours burnt — nice.' : pct+'% of an 8-hour day burnt · 8 h mark at '+fmtClockHM(new Date(goalAt)))+'</span>'
    : '<b>Today</b><span class="dr-foot">Nothing punched yet today.</span>';
  return '<button class="day-ribbon" data-key="day-ribbon" data-action="open-day-report" data-day="'+today+'" aria-label="Today’s ribbon — open the day report">'
    + '<span class="dr-track">'+segs
    +   (goalP > 0 && goalP < 100 ? '<i class="dr-goal" style="left:'+goalP.toFixed(3)+'%"></i>' : '')
    +   '<i class="dr-now" style="left:'+nowP.toFixed(3)+'%"></i></span>'
    + '<span class="dr-tip" role="tooltip">'+tip+'<span class="dr-hint">Click for the day report</span></span>'
    + '</button>';
}
