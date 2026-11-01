/* Parsec · ro · task-bulletins.js
   The hours on an RO: quoted, burnt, remaining, efficiency (roQuotedHours…), the engine's daily calc with shifts and holes, and the bulletin kinds an RO's log can hold (WF_TASKS).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   roQuotedHours roBurntHours roRemainingHours roEfficiency engineRaw engineNorm holesBetween dailyCalc withShifts dailyCore airLabelFor WF_TASKS … (11 functions, 4 constants)
   state      holes
   uses       clock/ kit/ state/
*/
/* ============================== TASK BULLETINS ==============================
   The kinds of entry an RO's bulletin log can hold. Attachments are filed under these. */
var WF_TASKS = [
  { id:'case',      name:'Update case',      fields:['Issues'],            group:'PROCESS' },
  { id:'folder',    name:'Create folder',                                  group:'PROCESS' },
  { id:'dashpic',   name:'Dash pic',         files:true,                   group:'PROCESS' },
  { id:'drivein',   name:'Drive in',                                       group:'PROCESS' },
  { id:'connect',   name:'Connect',                                        group:'PROCESS' },
  { id:'pics',      name:'Take pictures',    files:true,                   group:'PROCESS' },
  { id:'dtc',       name:'Upload DTCs',      files:true,                   group:'PROCESS' },
  { id:'report',    name:'Upload Report',    files:true,                   group:'PROCESS' },
  { id:'story',     name:'Update story',     fields:['Notes'],             group:'PROCESS' },
  { id:'techstory', name:'Update tech story',fields:['Notes'],             group:'PROCESS' },
  { id:'approved',  name:'Approval received', fields:['Approved by'],    group:'PROCESS' },
  { id:'claim',     name:'Warranty claim',   fields:['Claim #'],           group:'PROCESS' },
  { id:'location',  name:'Update location',  place:true,                   group:'PROCESS' },
  { id:'workflow',  name:'Workflow',         fields:['Notes'],             group:'PROCESS' },
  { id:'eod',       name:'EOD',              fields:['End Of Day Notes'],  group:'PROCESS' },
  { id:'keys',      name:'Keys stored',      place:true,                   group:'PROCESS' },

  { id:'diag',      name:'Diagnosing',       fields:['Notes'], files:true, group:'WORK' },
  { id:'repair',    name:'Repairing',        fields:['Notes'], files:true, group:'WORK' },
  { id:'partstag',  name:'Parts tagged',     files:true,                   group:'WORK' },
  { id:'inspect',   name:'Inspecting',       fields:['Notes'], files:true, group:'WORK' },
  { id:'testing',   name:'Testing',          fields:['Notes'], files:true, group:'WORK' },
  { id:'techsup',   name:'Tech Support',     fields:['Notes'],             group:'WORK' },
  { id:'phone',     name:'Phone Call',       fields:['Notes'],             group:'WORK' },
  { id:'enginr',    name:'Engineering',      fields:['Notes'],             group:'WORK' },
  { id:'waiting',   name:'Waiting',          fields:['Notes'],             group:'WORK' },
  { id:'complete',  name:'Completion',       fields:['Notes'],             group:'WORK' }
];

function roQuotedHours(ro){
  var t=0; ro.operations.forEach(function(op){ t += (op.quoted||0); }); return Math.round(t*100)/100;
}
function roBurntHours(ro){
  var t=0; ro.operations.forEach(function(op){ t += opCalc(op).burntMs / 3600000; }); return Math.round(t*1000)/1000;   /* add first, round once */
}
function roRemainingHours(ro){
  return Math.round((roQuotedHours(ro) - roBurntHours(ro)) * 100) / 100;
}
function roEfficiency(ro){
  var num=0, den=0;
  ro.operations.forEach(function(op){ var c=opCalc(op), h=c.burntMs/3600000; if(h>0){ num+=c.totalQuoted; den+=h; } });
  return den>0 ? num/den : null;
}
   /* version 2: the one live completion number */

/* A day runs from its first punch to its last. Between punches:
   - Job Switch: a gap under 11 s, you moving from one operation to the next. Neither burnt nor air.
   - Lunch: the gap after a punch that stopped for "Lunch". Shown red, never air.
   - Air time: from an operation's punch-out to the next punch-in (or to lunch starting),
     whatever the stop reason was. It never touches efficiency.
   - Empty: the slot a deleted punch left behind; unknown, so neither burnt nor air. */
/* "D13", "volvo d-13", "ISX15", "MP-8" → the name the app uses; "" when it isn't an engine we know */
var ENGINE_CODES = [[/\bD-?13\s*TC\b/i,"Volvo D13 TC"],[/\bD-?16\b/i,"Volvo D16"],[/\bD-?13\b/i,"Volvo D13"],[/\bD-?11\b/i,"Volvo D11"],
  [/\bMP-?\s?8\b/i,"Mack MP8"],[/\bMP-?\s?7\b/i,"Mack MP7"],[/\b(?:ISX-?\s?15|X-?\s?15)\b/i,"Cummins X15"],[/\bX-?\s?12\b/i,"Cummins X12"],
  [/\b(?:ISL-?\s?9|L-?9)\b/i,"Cummins L9"],[/\b(?:ISB-?\s?6\.7|B-?6\.7)\b/i,"Cummins B6.7"],[/\bDD-?\s?15\b/i,"Detroit DD15"],[/\bDD-?\s?13\b/i,"Detroit DD13"],[/\bMX-?\s?13\b/i,"PACCAR MX-13"]];
/* the engine as written, from its code on: "Volvo D-13 455HP, EPA17" -> "D-13 455HP" */
function engineRaw(v){
  v = String(v || "");
  for(var i = 0; i < ENGINE_CODES.length; i++){
    var m = ENGINE_CODES[i][0].exec(v);
    if(m){ return v.slice(m.index).split(/[,;|()\[\]]/)[0].trim().split(/\s+/).slice(0, 4).join(" ").replace(/[.:\-]+$/, ""); }
  }
  return "";
}
function engineNorm(v){ v = String(v || ""); for(var i = 0; i < ENGINE_CODES.length; i++){ if(ENGINE_CODES[i][0].test(v)) return ENGINE_CODES[i][1]; } return ""; }
var ENGINE_TYPES = ["Volvo D11","Volvo D13","Volvo D13 TC","Volvo D16","Mack MP7","Mack MP8","Cummins X12","Cummins X15","Cummins L9","Cummins B6.7","Detroit DD13","Detroit DD15","PACCAR MX-13"];

var AIR_MIN_MS = 11000;

/* Deleting a punch leaves its slot behind rather than quietly handing the time to
   the block beside it — an empty block you can fill in later. */
function holesBetween(from, to){
  return (STATE.holes||[])
    .map(function(hh){
      return { from: new Date(Math.max(new Date(hh.start), from)), to: new Date(Math.min(new Date(hh.stop), to)) };
    })
    .filter(function(hh){ return hh.to - hh.from > 0; })
    .sort(function(a,b){ return a.from - b.from; });
}

function dailyCalc(date, who){
  if(who == null) who = pcMe();
  var ps = punchesForDate(date);
  var sh = shiftsForDate(date);
  if(who){ ps = ps.filter(function(p){ return sameOwner(punchOwner(p), who); }); sh = sh.filter(function(s){ return sameOwner(shiftOwner(s), who); }); }   /* Parsec 12.7 */
  if(sh.length) return withShifts(dailyCore(date, ps, sh), sh);
  return dailyCore(date, ps, sh);
}
/* Shifts: the clocked window frames the day. Before the first job and after the last one is air
   (on the clock, off a job); between two shifts is off the clock and counts for nothing. */
function withShifts(dc, sh){
  var now = new Date();
  var offs = [];
  for(var i = 1; i < sh.length; i++){ if(sh[i-1].out && new Date(sh[i].in) > new Date(sh[i-1].out)) offs.push({ from: new Date(sh[i-1].out), to: new Date(sh[i].in), reason: sh[i-1].outReason || null, shiftId: sh[i-1].id }); }
  /* the gap between two clock-ins: lunch is lunch, an appointment or emergency is labelled, anything else is off */
  var gapBlock = function(o, from, to){
    if(o.reason === "Lunch"){ dc.lunchMs += to - from; return { kind:"lunch", ms: to - from, at: from.toISOString(), label:"Lunch", shiftGap: true, shiftId: o.shiftId }; }
    return { kind:"off", ms: to - from, at: from.toISOString(), label: (o.reason && o.reason !== "Home" && o.reason !== "End of day") ? o.reason : null, shiftId: o.shiftId };
  };
  var cIn = new Date(sh[0].in), last = sh[sh.length-1], cOut = last.out ? new Date(last.out) : now;
  var clockedMs = sh.reduce(function(n, x){ return n + shiftMs(x); }, 0);
  var pieces = function(from, to, edge, shiftOf){          /* [from,to] cut by the off-clock gaps */
    var out = [], mark = from;
    offs.forEach(function(o){
      if(o.to <= mark || o.from >= to) return;
      if(o.from > mark) out.push({ kind:"air", ms: o.from - mark, at: mark.toISOString(), label: null, edge: edge, shiftId: shiftOf(mark) });
      var oe = o.to < to ? o.to : to, os = o.from > mark ? o.from : mark;
      out.push(gapBlock(o, os, oe));
      mark = oe;
    });
    if(to > mark) out.push({ kind:"air", ms: to - mark, at: mark.toISOString(), label: null, edge: edge, shiftId: shiftOf(mark) });
    return out;
  };
  var shiftAt = function(t){ var hit = sh.filter(function(x){ return new Date(x.in) <= t && (!x.out || new Date(x.out) > t); })[0]; return (hit || sh[0]).id; };
  var blocks = [], pre = [], post = [];
  if(!dc.punches.length){
    pre = pieces(cIn, cOut, "in", shiftAt);
  } else {
    var fs = new Date(dc.firstStart), ls = new Date(dc.lastStop);
    if(cIn < fs) pre = pieces(cIn, fs, "in", shiftAt);
    if(!dc.running && cOut > ls) post = pieces(ls, cOut, "out", function(){ return last.id; });
    /* an off-clock gap inside the punched day turns that part of the air/lunch into "off" */
    dc.blocks.forEach(function(b){
      if(b.kind === "punch" || b.kind === "seam" || !b.at){ blocks.push(b); return; }
      var bs = new Date(b.at), be = new Date(bs.getTime() + b.ms), cut = false;
      offs.forEach(function(o){ if(o.from < be && o.to > bs) cut = true; });
      /* lunch needs the day clock off — on the clock it is air */
      if(!cut && b.kind === "lunch"){ dc.lunchMs -= b.ms; dc.airMs += b.ms; blocks.push(Object.assign({}, b, { kind: "air", label: "Lunch \u2014 still clocked in" })); return; }
      if(!cut){ blocks.push(b); return; }
      var mark = bs;
      offs.forEach(function(o){
        if(o.to <= mark || o.from >= be) return;
        if(o.from > mark){ var c = Object.assign({}, b, { ms: o.from - mark, at: mark.toISOString() }); blocks.push(c); }
        var oe = o.to < be ? o.to : be, os = o.from > mark ? o.from : mark;
        if(b.kind === "air") dc.airMs -= (oe - os); else if(b.kind === "lunch") dc.lunchMs -= (oe - os); else if(b.kind === "shop") dc.shopMs -= (oe - os); else if(b.kind === "empty") dc.emptyMs -= (oe - os);
        blocks.push(gapBlock(o, os, oe));
        mark = oe;
      });
      /* back on the clock but not on a job yet: that is air, whatever the punch before said */
      if(be > mark){
        if(b.kind === "lunch"){ dc.lunchMs -= (be - mark); dc.airMs += (be - mark); }
        else if(b.kind === "shop"){ dc.shopMs -= (be - mark); dc.airMs += (be - mark); }
        blocks.push(Object.assign({}, b, { kind: b.kind === "empty" ? "empty" : "air", ms: be - mark, at: mark.toISOString(), label: null, prevId: null }));
      }
    });
  }
  var offMs = 0;
  pre.concat(post).forEach(function(b){ if(b.kind === "air") dc.airMs += b.ms; });
  blocks = pre.concat(dc.punches.length ? blocks : []).concat(post);
  blocks.forEach(function(b){ if(b.kind === "off") offMs += b.ms; });
  /* a clock-out reason the day ended on (home, end of day) is kept for the day's summary */
  var first = dc.firstStart ? new Date(Math.min(new Date(dc.firstStart), cIn)) : cIn;
  var lastT = dc.lastStop ? new Date(Math.max(new Date(dc.lastStop), cOut)) : cOut;
  dc.blocks = blocks;
  dc.firstStart = first.toISOString(); dc.lastStop = lastT.toISOString();
  dc.spanMs = Math.max(lastT - first, 0);
  dc.shifts = sh; dc.clockedMs = clockedMs; dc.offMs = offMs;
  dc.clockIn = sh[0].in; dc.clockOut = last.out || null; dc.onClock = !last.out;
  return dc;
}
function dailyCore(date, ps, sh){
  if(!ps.length){
    return { date:date, punches:[], blocks:[], burntMs:0, airMs:0, lunchMs:0, shopMs:0, seamMs:0, emptyMs:0, spanMs:0, firstStart:null, lastStop:null, running:false };
  }
  var burntMs = 0, running = false, shopPunchMs = 0;
  ps.forEach(function(p){
    var ms = (p.stop ? new Date(p.stop) : Date.now()) - new Date(p.start);
    if(!p.stop) running = true;
    if(isShopPunch(p)) shopPunchMs += ms; else burntMs += ms;
  });
  var firstStart = new Date(ps[0].start);
  var lastStop = null;
  ps.forEach(function(p){
    var e = p.stop ? new Date(p.stop) : new Date();
    if(!lastStop || e > lastStop) lastStop = e;
  });
  var spanMs = Math.max(lastStop - firstStart, 0);

  // Lay the day out as punch blocks separated by seams (switches) or air (idle).
  var blocks = [], cursor = firstStart, seamMs = 0, airMs = 0, lunchMs = 0, shopMs = shopPunchMs, emptyMs = 0;
  ps.forEach(function(p){
    var s = new Date(p.start), e = p.stop ? new Date(p.stop) : new Date();
    if(s > cursor){
      var gap = s - cursor;
      if(gap < AIR_MIN_MS){ seamMs += gap; blocks.push({ kind:"seam", ms: gap }); }
      else {
        // Slots left by deleted punches break the gap up; only the piece that sits
        // right after the previous punch inherits its stop reason (and so can be lunch).
        var lab = airLabelFor(ps, p);
        var slots = holesBetween(cursor, s);
        var mark = cursor, first = true;
        var prevP = ps[ps.indexOf(p) - 1] || null;
        var put = function(ms, at){
          var ids = { prevId: (first && prevP) ? prevP.id : null, nextId: p.id };
          if(first && lab === "Lunch"){ lunchMs += ms; blocks.push({ kind:"lunch", ms: ms, label:"Lunch", at: at, prevId: ids.prevId, nextId: ids.nextId }); }
          else if(first && SHOP_REASONS.indexOf(lab) !== -1){ shopMs += ms; blocks.push({ kind:"shop", ms: ms, label: lab, at: at, prevId: ids.prevId, nextId: ids.nextId }); }
          else { airMs += ms; blocks.push({ kind:"air", ms: ms, label: (first && lab && AIR_NO_LABEL.indexOf(lab) === -1) ? lab : null, at: at, prevId: ids.prevId, nextId: ids.nextId }); }
          first = false;
        };
        slots.forEach(function(hSlot){
          if(hSlot.from > mark) put(hSlot.from - mark, mark.toISOString());
          emptyMs += hSlot.to - hSlot.from;
          blocks.push({ kind:"empty", ms: hSlot.to - hSlot.from, label:null, at: hSlot.from.toISOString() });
          mark = hSlot.to; first = false;
        });
        if(s > mark) put(s - mark, mark.toISOString());
      }
    }
    if(e > s) blocks.push({ kind:"punch", ms: e - s, punch:p });
    if(e > cursor) cursor = e;
  });

  return { date:date, punches:ps, blocks:blocks, burntMs:burntMs,
           airMs:airMs, lunchMs:lunchMs, shopMs:shopMs, seamMs:seamMs, emptyMs:emptyMs, spanMs:spanMs,
           firstStart: firstStart.toISOString(), lastStop: lastStop.toISOString(), running:running };
}
/* Air is labelled by the stop reason of the punch that preceded it. */
/* A gap is only explained by the punch immediately before it. Anything else —
   including the time freed by deleting a punch — is an unlabelled empty block. */
function airLabelFor(ps, punch){
  var i = ps.indexOf(punch);
  var prev = i > 0 ? ps[i-1] : null;
  return (prev && prev.stopReason) ? prev.stopReason : null;
}
