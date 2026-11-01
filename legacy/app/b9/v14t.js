/* ============================== Parsec 14 (T) — the road test toggle, closing at release, one stage label ==============================
   · Road test: on every RO, default on. Off (ro.noRoadTest) → no Road test or Truck checks anywhere — no buttons, no Needs action
     groups, no release checks for them, the stage track skips Road test — and the work done goes straight to Ready to release.
   · An RO is closed (dateClosed, the Done lists, Manager's counts) only when it's released (or declined) — roIsDone; the work being
     done is roWorkDone.
   · One stage label everywhere: roStageInfo — the RO page's "Repair · stage 4 of 6". */
function rtNeeded(ro){ return !(ro && ro.noRoadTest); }
/* the work is done: every operation complete, the RO at Complete – Road test or later (what roIsDone used to say) */
function roWorkDone(ro){ var s = roStatus(ro); s = typeof s === "string" ? s : s.status; return s === "Complete – Road test" || s === "Complete – Released" || s === "Declined"; }
/* turn the road test on or off for one RO */
function rtToggle(ro, on){
  if(!ro || ro.shop || ro.id === SHOP_RO_ID) return false;
  if(typeof permOk === "function" && !permOk("ro.status")) return false;
  on = on == null ? !rtNeeded(ro) : !!on; if(on === rtNeeded(ro)) return true;
  pushUndo(on ? "road test on" : "no road test");
  if(on) delete ro.noRoadTest; else { ro.noRoadTest = true; if(ro.fmRt) delete ro.fmRt; }
  try{ audit("road", roLabel(ro) + (on ? ": road test needed again" : ": no road test needed — no truck checks either"), ro); }catch(e){}
  try{ if(UI.tgPop && /^(road|checks)$/.test(UI.tgPop.type) && UI.tgPop.ro === ro.id) UI.tgPop = null; }catch(e){}
  scheduleSave(true);
  return true;
}
/* the RO status as it reads: with no road test, "Complete – Road test" (the work done) reads Complete */
function roStFor(ro){ var n = roStatus(ro).status; return n === "Complete – Road test" && !rtNeeded(ro) ? "Complete" : n; }   /* with Complete's icon too */
function roStShown(ro){ var n = roStFor(ro); return typeof pgStLabel === "function" ? pgStLabel("ro", n) : n; }
/* the RO status in the shared look (b9/st14.js): pgStRo(ro) to read, pgStRo(ro, { menu: 1, attrs }) to change; opts.noSub drops "· Ordered" */
function pgStRo(ro, o){ o = o || {}; var s = roStatus(ro), sub = !o.noSub && s.sub ? "· " + s.sub.charAt(0) + s.sub.slice(1).toLowerCase() : "";
  return pgSt("ro", roStFor(ro), Object.assign({ sub: sub, label: roStShown(ro) }, o)); }
/* the stage the RO is at, as the RO page counts it: the stages that apply, the first one not done */
function roStageInfo(ro){
  var M = null; try{ M = roStages(ro); }catch(e){} if(!M) return null;
  var live = M.list.filter(function(x){ return x.state !== "x"; }), ci = -1;
  live.forEach(function(x, n){ if(ci < 0 && (x.state === "c" || x.state === "n" || x.state === "w")) ci = n; });
  var cur = live[ci] || null;
  return { cur: cur, name: cur ? cur.name : (roIsDone(ro) ? "Released" : "All stages done"), i: ci + 1, of: live.length, sub: cur && cur.sub || "", M: M,
    txt: cur ? cur.name + " · stage " + (ci + 1) + " of " + live.length : (roIsDone(ro) ? "Released" : "All stages done") };
}
function roStageTxt(ro){ var I = roStageInfo(ro); return I ? I.txt : ""; }
/* nobody holds it yet: the tech desk with no tech named */
function rtNoTech(ro){ try{ var h = rtHolder(ro); return !h.q && h.to === "tech" && !(h.who || ro.assignedTech); }catch(e){ return false; } }
/* the toggle: a switch where you can change it, the words where you can't */
function rtToggleHtml(ro, attrs){
  if(!ro || ro.shop || ro.id === SHOP_RO_ID || ro.dateClosed) return "";
  var on = rtNeeded(ro), may = typeof can !== "function" || can("ro.status");
  var txt = on ? "Road test before release" : "No road test — no truck checks";
  if(!may) return '<div class="rtt ro' + (on ? " on" : "") + '"><span class="rtt-l">' + txt + "</span></div>";
  return '<div class="rtt' + (on ? " on" : "") + '"><span class="rtt-l">' + txt + '</span><button type="button" class="rtt-sw" role="switch" aria-checked="' + (on ? "true" : "false") + '" aria-label="Needs a road test" title="' + (on ? "Turn the road test off — no road test, no truck checks" : "Turn the road test on") + '" ' + (attrs || "") + "><i></i></button></div>";
}
/* the sent-to-you notes for one person (the Inbox page is gone — 12.2 — so they show on that person's own page) */
function sentToMe(name){
  if(!name || typeof IB === "undefined" || !IB.itemsFor) return [];
  var L = []; try{ L = IB.itemsFor(name); }catch(e){ return []; }
  return L.filter(function(n){ return (n.st === "new" || n.st === "read") && n.k !== "rem" && !n.escFor; })
    .sort(function(a, b){ return new Date(b.at || 0) - new Date(a.at || 0); });
}
function sentDone(key){ try{ var s = IB.store(); var st = s.st[key] || (s.st[key] = {}); st.done = nowIso(); st.how = "done on the Technician page"; delete st.snz; if(IB.flush) IB.flush(); scheduleSave(true); return true; }catch(e){ return false; } }
function sentSeen(key){ try{ var s = IB.store(); var st = s.st[key] || (s.st[key] = {}); if(!st.read){ st.read = nowIso(); if(IB.flush) IB.flush(); scheduleSave(true); } }catch(e){} }
/* just the icon, in its color — for places that put the words next to it themselves */
function pgStIcon(kind, st, size){ var S = pgStOf(kind, st); return '<span class="pgst pgst-io t-' + S.tone + '" aria-hidden="true">' + pgStIc(S.ic, size || 14) + "</span>"; }
