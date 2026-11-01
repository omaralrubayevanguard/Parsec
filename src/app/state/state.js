/* Parsec · state · state.js
   The two roots: STATE (everything the shop keeps — ROs, punches, staff, settings; saved to the folder) and UI (what this screen is showing — view, selection, open pop-overs; saved per browser). Plus the save timer and sync status.
   Flow: pages read STATE, change it through an action, call render(); scheduleSave() writes it. Server seam: STATE is the whole document a server would hold.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   STATE UI artifactCap downloadsCap syncStatus saveTimer (6 constants)
*/
/* ============================== STATE ============================== */
var STATE = null;
var UI = { pgShut:true, pgLanesShut:true, hdShut:true, view:"console", expandedOp:{}, roFilter:"", careerRange:"all", careerFrom:null, careerTo:null, modal:null, timeLogMonth:null, roRailShut:false, segPick:null, roDrop:{}, roOp:{}, sort:{}, logKind:{}, logDraft:{}, logOpen:{}, roPane:{}, xcard:{}, selectedRo:null, roChip:{}, jobOpen:{}, notifOpen:false, palette:null, navOpen:false };
var artifactCap = null, downloadsCap = null, syncStatus = "local"; // local | pending | saved | error
var saveTimer = null;
