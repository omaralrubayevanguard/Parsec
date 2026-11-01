/* Parsec · kit · formatters.js
   Formatting helpers used everywhere: hours as h:mm:ss / h:mm / decimals, percentages, dates, and esc() for HTML.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   fmtHMS fmtHM decHours fmtDec fmtPct fmtDate fmtDateLong fmtTime esc (9 functions)
*/
/* ============================== FORMATTERS ============================== */
function fmtHMS(ms){
  if(ms<0) ms=0;
  var s = Math.round(ms/1000);
  var h = Math.floor(s/3600); s -= h*3600;
  var m = Math.floor(s/60); s -= m*60;
  return h+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
}
function fmtHM(ms){
  var neg = ms<0; if(neg) ms=-ms;
  var mins = Math.round(ms/60000);
  var h = Math.floor(mins/60), m = mins%60;
  return (neg?"-":"")+h+":"+String(m).padStart(2,"0");
}
function decHours(ms){ return Math.round((ms/3600000)*100)/100; }
function fmtDec(n){ return (Math.round(n*100)/100).toFixed(2); }
function fmtPct(n){ return Math.round(n*100)+"%"; }
function fmtDate(iso){ if(!iso) return "—"; var d=new Date(iso); return (d.getMonth()+1)+"/"+d.getDate()+"/"+String(d.getFullYear()).slice(2); }
function fmtDateLong(iso){ if(!iso) return "—"; var d=new Date(iso); return d.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"}); }
/* 24-hour everywhere — one formatter, so tables, tooltips and the bar agree. */
function fmtTime(iso){ if(!iso) return "\u2014"; var d=new Date(iso); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
