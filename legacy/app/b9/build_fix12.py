# Parsec 12 — small fixes across the app
# One Undo takes back a change together with what an automation did right after it (it used to take two)
js = rep(js, '''function undoLast(){
  if(!UNDO.length){ pushToast("Nothing to undo."); return; }
  var u = UNDO.pop();
''', '''function undoLast(){
  if(!UNDO.length){ pushToast("Nothing to undo."); return; }
  var u = UNDO.pop();
  /* Parsec 12: an automation's step that came right after a change goes back with it — one Undo, not two */
  while(u && u.label === "automation" && UNDO.length && u.at - (UNDO[UNDO.length - 1].at || 0) < 4000) u = UNDO.pop();   /* Parsec 12.7: every one of them */
''')
