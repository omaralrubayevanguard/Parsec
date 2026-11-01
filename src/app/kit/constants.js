/* Parsec · kit · constants.js
   Shared constants: the clock-in / clock-out reasons and their colours, job type labels, the font link; small helpers that read them (reasonVar, opJobType).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   reasonVar isCompleteName jobTypeLabel opJobType FONT_HREF START_REASONS REASON_RC STOP_REASONS_EXPLICIT STOP_REASONS_BREAK SHOP_REASONS AIR_NO_LABEL STANDARD_OPS … (4 functions, 11 constants)
   at load    builds LOCATIONS (a closure)
*/
/* ============================== CONSTANTS ============================== */
var FONT_HREF = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Newsreader:opsz,wght@6..72,400;500;600&display=swap";

var START_REASONS = ["Diagnosing","Repairing","Inspecting","Inspecting – 74-point","Inspecting – DOT","Testing","Bench Testing"];
/* every start and stop reason has its own colour, drawn from the status palette (green working, amber waiting, violet tech support, teal approval).
   The punch chips, the rail beside each punch and the day bar all read it from here. */
var REASON_RC = { "Diagnosing":"diag", "Repairing":"rep", "Inspecting":"insp", "Inspecting – 74-point":"i74", "Inspecting – DOT":"dot", "Testing":"test", "Bench Testing":"bench",
  "Waiting – Parts":"wparts", "Waiting – Sublet":"wparts", "Waiting – Foreman":"wforeman", "Waiting – Tech Support":"wtech", "Waiting – Approval":"wappr", "Waiting – Customer":"wappr", "Waiting – New Job":"wnew",
  "Complete":"done", "Lunch":"lunch", "End of day":"eod", "Switched job":"switch", "Pulled to another truck":"pulled", "Declined":"declined" };
function reasonVar(r){
  r = String(r || ""); if(r.indexOf("Complete") === 0) r = "Complete";
  var k = REASON_RC[r]; if(!k && /^Waiting/.test(r)) k = "wparts"; if(!k && /^Inspect/.test(r)) k = "insp";
  return k ? "var(--rc-" + k + ")" : "var(--st-hold)";
}
var STOP_REASONS_EXPLICIT = ["Waiting – Parts","Waiting – Sublet","Waiting – Foreman","Waiting – Tech Support","Waiting – Approval","Waiting – New Job","Complete"];
/* an operation is complete or it is not — road test versus released is the RO's call. Old saves carry the two long names; this reads both. */
function isCompleteName(s){ return s === "Complete" || s === "Complete \u2013 Road test" || s === "Complete \u2013 Released"; }
/* stepping away (lunch, home, …) belongs to the day clock now, not to a job's stop reasons —
   clocking off the day asks why, and stops whatever job is running with that reason. */
var STOP_REASONS_BREAK = ["Lunch","End of day"];   /* Lunch is back as an operation stop reason, listed first */
/* shop time: stopped for the shop, not waiting on a job — its own segment on the day bar, never air */
var SHOP_REASONS = ["Shop maintenance","Training","Cleaning"];
/* air time is idle between jobs: a "Complete" stop reason says where the job stands, not why you were idle */
var AIR_NO_LABEL = ["Complete","Complete – Road test","Complete – Released","Done"];
var STANDARD_OPS = ["74-point inspection","DOT inspection","Mud flaps R&R","Steam wash","PM-A","PM-B","Complete PM","Software pack","Campaign","Oil leak source","Coolant pressure test","Air leak test","Fifth wheel R&R"];
/* A job card wears a type the way the paper RO does. Derived once, then editable. */
var JOB_TYPES = ["DIAG","OP","PM","WARR","COMEBACK","SUBLET","RECALL"];
function jobTypeLabel(k){ return k === "OP" ? "REPAIR" : k; }
function opJobType(op){
  if(op.jobType && JOB_TYPES.indexOf(op.jobType) >= 0) return op.jobType;
  var t = (op.complaint||"").toLowerCase();
  if(op.isStandard) return /inspection|pm\b|service|wash/.test(t) ? "PM" : "OP";
  if(/diagnos|code|scan|fault|check engine|derate|no start/.test(t)) return "DIAG";
  if(/warrant/.test(t)) return "WARR";
  return "OP";
}
var CHECKLIST_ITEMS = [["updateForeman","Update foreman","Foreman"],["connectUnit","Connect to unit","Connect"],["initialDashPic","Take initial dash picture","Dash pic"],["updateLocation","Update location","Location"],["uploadDtc","Upload DTC report","DTC report"],["techStories","Update tech stories","Tech stories"],["uploadPics","Upload pictures and report","Upload"],["eodNote","Update EOD note","EOD note"]];
var LOCATIONS = (function(){var a=["Offsite"];for(var i=1;i<=20;i++)a.push("Bay "+i);["A","B","C","D","E","F"].forEach(function(l){a.push("Lot "+l);});for(var j=1;j<=11;j++)a.push("Lot "+j);return a;})();
