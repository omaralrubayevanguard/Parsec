/* ============================== Parsec 14.9 (D) ==============================
   · The key tag beside the spot: the RO page's truck card line, the RO list pane and its Spot column, the Technician page's
     list rows. On the truck card it changes in place like the spot (rifHtml → rifEdit → roFldSet: Undo, the Activity line).
   (Air never counts toward efficiency and no clock stops at the end of the shift: wording and ockAuto, patched in
    b9/build_v9zz149d.py.) */
function v149KeyTxt(ro){ var k = ro ? String(ro.keyTag == null ? "" : ro.keyTag).trim() : ""; return k ? "Key " + k : ""; }
/* " · Key 42" — on the truck card it's a click-to-change word (and "Add key" when there's none and you may change it) */
function v149KeySeg(ro){
  if(!ro) return "";
  var k = v149KeyTxt(ro), ed = false;
  try{ ed = typeof v142Ok === "function" && v142Ok(ro); }catch(e){}
  if(ed && typeof rifHtml === "function") return " · " + rifHtml(ro, "keyTag", k, "Add key");
  return k ? " · " + String(k).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }) : "";
}
