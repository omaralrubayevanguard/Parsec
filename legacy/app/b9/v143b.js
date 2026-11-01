/* ============================== Parsec 14.3 (B) — one RO view ==============================
   The Technician page's middle and right are the RO page itself (the JC component, mounted in the page's pane through
   data-jc like the RO page's own pane). TCX is the Technician page's context for it: the bar's crumb and ⌃ ⌄ walk the
   technician's own list, Ask <foreman> sits on the truck card, and the tech's rules hold — a technician starts only their
   own operations, and the admin looking at someone's page doesn't start or stop their clock. */
var TCX = null;
function tcxOn(roId){ return UI.view === "tech" && !!TCX && (!roId || TCX.ro === roId); }
function tcxBlocked(roId, opId){
  if(!tcxOn(roId)) return "";
  if(TCX.view) return "The clock is " + (TCX.first || "theirs") + "’s — it starts and stops on their sign-in.";
  var me = null; try{ me = PG.me(); }catch(e){}
  if(me && me.role === "Technician" && !me.admin && TCX.own && !TCX.own[opId]){
    var ro = getRO(roId), op = ro && (ro.operations || []).filter(function(o){ return o.id === opId; })[0], n = ro ? (ro.operations || []).indexOf(op) + 1 : 0, w = "";
    try{ w = (op && (op.tech || op.assignedTo)) || (ro && ro.assignedTech) || ""; }catch(e){}
    return "Op " + n + " isn’t yours" + (w && !techSame(w, TCX.me) ? " — it’s " + PG.first(w) + "’s" : "") + ". Ask " + (TCX.fm ? PG.first(TCX.fm) : "the foreman") + " to give it to you.";
  }
  return "";
}
var V143B_SG = v141StartGate;
v141StartGate = function(roId, opId, reason){ var why = tcxBlocked(roId, opId); if(why){ pushToast(why, false); return true; } return V143B_SG(roId, opId, reason); };
function tcxGet(){ return TCX; }
