/* Parsec · state · migrate-to-parsec-data.js
   One-time move of the old “ROs Data” + shop-data.json layout into Parsec Data/ (Parsec 9 era folders).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   migrateToParsecData (1 function)
   state      ros
   uses       data/
*/
/* ---------- one-time move from "ROs Data" + shop-data.json to "Parsec Data" ----------
   Copies each RO's files into its new Attachments folder, points the records at it, then writes
   the new pages. The old folder and file are left where they are, untouched, until you delete them. */
function migrateToParsecData(){
  if(FS.status!=="connected" || !FS.dir || PD_LAYOUT === "new" || PD_MIGRATING) return Promise.resolve(false);
  return oldRoDataRoot(false).then(function(oldRoot){
    PD_MIGRATING = true;
    return roDataRoot(true).then(function(newRoot){
      ROFOLDER = {}; ROWRITTEN = {}; SHOPWRITTEN = null;
      return STATE.ros.reduce(function(pr, ro){
        return pr.then(function(){
          var want = roFolderFor(ro), olds = {};
          if(ROFOLDER_OLD[ro.id]) olds[ROFOLDER_OLD[ro.id]] = 1;
          (ro.bulletins || []).forEach(function(b0){ (b0.files || []).forEach(function(f){ if(f.folder) olds[f.folder] = 1; }); });
          if(!Object.keys(olds).length) olds[oldFolderFor(ro)] = 1;
          return newRoot.getDirectoryHandle(want, {create:true})
            .then(function(d){ return d.getDirectoryHandle(PD_ATT, {create:true}); })
            .then(function(att){
              return Object.keys(olds).reduce(function(p2, on){
                return p2.then(function(){ return oldRoot.getDirectoryHandle(on).then(function(od){ return copyTree(od, att, false, function(nm){ return nm === RO_FILE; }); }, function(){}); });
              }, Promise.resolve());
            })
            .then(function(){
              (ro.bulletins || []).forEach(function(b0){ (b0.files || []).forEach(function(f){ if(f.folder && olds[f.folder]){ f.folder = want; f.inFolder = true; } }); });
              ROFOLDER[ro.id] = want;
            });
        });
      }, Promise.resolve());
    }).then(function(){ return writeSplitState(); })
      .then(function(){ PD_LAYOUT = "new"; PD_MIGRATING = false; scheduleSave(true); return true; });
  }, function(){ PD_LAYOUT = "new"; return writeSplitState().then(function(){ return false; }); })   /* nothing old to move: start the new layout */
    .catch(function(){ PD_MIGRATING = false; return false; });
}
