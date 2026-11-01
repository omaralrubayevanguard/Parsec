# Parsec 16.1 (A) — Settings → Work tools loses two things:
#   1) the Assistant: its code, panel, floating button, menu item, actions, Work tools card, tooltip and test hook.
#      Its old browser keys (the API key, the model, the chat history) are deleted on load.
#   2) "Stamp the time in your notes": the Work log stamps built-in rule, and the time stamps that Enter / Save
#      put on punch notes and on Work performed lines. Notes are saved as typed from now on. Notes that already
#      carry a stamp are left as they are: noteEntries still reads them, and they show and copy as before
#      (Copy notes now leaves the old stamps out, like Copy work performed does).
# Runs inside build12.py: uses js, rep, HOOK_NAMES, LOG. The assistant's styles go with the class clean-out
# (nothing writes .assist-* any more), so no CSS is edited here.
import re as _re

# ---------------------------------------------------------------- 1) the Assistant
_A0 = "/* ============================== ASSISTANT =============================="
_A1 = "/* Dev readout: live page width (px) and cursor coordinates, parked to the left of the\n   chat button."
assert js.count(_A0) == 1 and js.count(_A1) == 1, (js.count(_A0), js.count(_A1))
_a0 = js.index(_A0); _a1 = js.index(_A1); assert _a0 < _a1
_blk, _rest = js[_a0:_a1], js[:_a0] + js[_a1:]
# everything in the block is the assistant's own: any top-level name in it that the rest of the app uses must be one we unhook below
_names = set(_re.findall(r'^(?:function\s+([A-Za-z_$][\w$]*)|var\s+([A-Za-z_$][\w$]*))', _blk, _re.M))
_names = {a or b for a, b in _names}
for _m in _re.finditer(r'^var\s+(.*?);\s*$', _blk, _re.M):
    _names.update(_re.findall(r'(?:^|,\s*)([A-Za-z_$][\w$]*)\s*=', _m.group(1)))
_outside = sorted(n for n in _names if _re.search(r'(?<![\w$.])' + _re.escape(n) + r'(?![\w$])', _rest))
assert set(_outside) <= {"asstClear", "asstGetKey", "asstSend", "asstSetKey", "asstSetModel", "asstToggle", "asstToggleSettings", "initAssistant", "ASST_PART_STATUSES"}, _outside
assert all(n.startswith(("asst", "ASST_")) or n == "initAssistant" for n in _names), sorted(_names)
js = _rest
js = rep(js, _A1, "/* Dev readout: live page width (px) and cursor coordinates, parked in the bottom-right\n   corner.")
LOG.append("Parsec 16.1: the assistant's code is gone (%d bytes, %d names)" % (len(_blk), len(_names)))

# its start-up call → a one-time clean-up of what it left in this browser
js = rep(js, "\n  initAssistant();\n", "\n  v161Clean();\n")
js = rep(js, "/* Dev readout: live page width", """/* Parsec 16.1: the chat panel and the work-log stamps are gone. What they left behind goes on load:
   the chat panel's three browser keys, and any work-log stamp still waiting on a card for Accept.
   Notes and Work performed are never touched. */
function v161Clean(){
  try{ ["tec_asst_key", "tec_asst_model", "tec_asst_hist_v1"].forEach(function(k){ localStorage.removeItem(k); }); }catch(e){}
  var n = 0;
  try{ (STATE.ros || []).forEach(function(ro){ if(!Array.isArray(ro.suggest)) return; var k = ro.suggest.length;
    ro.suggest = ro.suggest.filter(function(s){ return !(s && /^b\\.stamp\\|/.test(String(s.key || ""))); }); n += k - ro.suggest.length; }); }catch(e){}
  if(n){ scheduleSave(true); render(); }
}
/* Dev readout: live page width""")

# its actions, menu item, Work tools card, tooltip and comments
js = rep(js, """    case "assist-toggle": asstToggle(); break;
    case "assist-settings-toggle": asstToggleSettings(); break;
    case "assist-save-settings": {
      var ak = document.getElementById("assist-key-input"), am = document.getElementById("assist-model-input");
      asstSetKey(ak ? ak.value.trim() : "");
      asstSetModel(am ? am.value.trim() : "");
      var fab = document.querySelector(".assist-fab"); if(fab) fab.classList.toggle("has-key", !!asstGetKey());
      asstToggleSettings(false);
      var ti = document.getElementById("assist-input"); if(ti) ti.focus();
      break;
    }
    case "assist-send": asstSend(); break;
    case "assist-clear": asstClear(); break;
""", "")
js = rep(js, """    +   '<button class="app-menu-item" role="menuitem" data-action="assist-toggle">'
    +     '<span class="ami-ico">' + I3H('chat', 17, 17) + '</span>'
    +     'Assistant chat</button>'
""", "")
js = rep(js, """var n = ["status","stamps","parts"].filter(function(k){ return c.builtin[k]; })""",
             """var n = ["status","parts"].filter(function(k){ return c.builtin[k]; })""")
js = rep(js, """function pxSecTools(){
  var c = autoCfg(), n = ["status", "stamps", "parts"].filter(function(k){ return c.builtin[k]; }).length + c.rules.filter(function(r){ return r.on; }).length;
  return pxCard(pxCh("Automations", n + " on", '<button class="px-btn sm" data-action="open-automations">Open</button>')
      + pxKv(pxI("check", 12), 'Status follows the clock<small>starting a job sets it to Working</small>') + pxKv(pxI("check", 12), 'Stamp the time in your notes<small>Enter adds the time</small>') + pxKv(pxI("check", 12), 'Part statuses move the job<small>all parts in sets it back to Hold Tech</small>'))
    + pxCard(pxCh("Assistant", "ask about an RO, a part or a past fix", '<button class="px-btn sm" data-action="assist-toggle">' + pxI("chat", 13) + 'Open</button>'));
}""", """function pxSecTools(){
  var c = autoCfg(), n = ["status", "parts"].filter(function(k){ return c.builtin[k]; }).length + c.rules.filter(function(r){ return r.on; }).length;
  return pxCard(pxCh("Automations", n + " on", '<button class="px-btn sm" data-action="open-automations">Open</button>')
      + pxKv(pxI("check", 12), 'Status follows the clock<small>starting a job sets it to Working</small>') + pxKv(pxI("check", 12), 'Part statuses move the job<small>all parts in sets it back to Hold Tech</small>'));
}""")
js = rep(js, '["tools", "bolt", "Work tools", "automations, assistant"]', '["tools", "bolt", "Work tools", "automations"]')
js = rep(js, "  'Assistant': 'Ask the assistant',\n", "")
js = rep(js, "\n   · The hidden assistant can't call out: nothing it has is sent off this computer. */", " */")
js = rep(js, "(RO page, Console, Time Log, the\n   assistant, an import)", "(RO page, Console, Time Log, an\n   import)")
js = rep(js, "A date you type, or the assistant sets, is yours", "A date you type is yours")
HOOK_NAMES[:] = [n for n in HOOK_NAMES if not n.startswith("asst")]
# the base styles' banner for its rules (the rules themselves go with the class clean-out)
_cm = "/* ===== the assistant: a floating chat button and its slide-in panel ===== */\n"
assert src[:k0].count(_cm) == 1 and _cm not in src[k0:], (src[:k0].count(_cm), src[k0:].count(_cm))
src = src.replace(_cm, "", 1); k0 -= len(_cm); k1 -= len(_cm)

# ---------------------------------------------------------------- 2) the time stamps in notes
# the Work log stamps built-in rule: its row, its default, its rule, and the saved switch
js = rep(js, """  ["stamps","Work log stamps","Each stopped punch offers a timestamped line (times, reasons, note) for that operation’s Work performed."],\n""", "")
js = rep(js, """  if(!a.builtin || typeof a.builtin !== "object") a.builtin = { status:true, stamps:true, parts:true };\n""",
             """  if(!a.builtin || typeof a.builtin !== "object") a.builtin = { status:true, parts:true };\n  if(Object.prototype.hasOwnProperty.call(a.builtin, "stamps")) delete a.builtin.stamps;   /* Parsec 16.1: the work-log stamps rule is gone */\n""")
js = rep(js, """    /* --- work-log stamps --- */
    if(b.stamps && ev.type === "punch.stop" && p && op && p.stop){
      var line = stampLine(ev);
      propose(ev, "b.stamp", "Work log stamp", m, "Stamp “" + line + "” into Work performed?", [{ a:"stamp", v: line, op: op.id }], op.id, p.id);
    }
""", "")
js = rep(js, "(status sync, work-log stamps, parts → status)", "(status sync, parts → status)")

# punch notes: Enter / Save keeps the note as typed (no "[0:26]" in front)
_pat = _re.compile(r"""noteStampFor\((\w+)\) \+ (["']) \2 \+ """)
_n = len(_pat.findall(js)); assert _n == 9, _n
js = _pat.sub("", js)
js = rep(js, """  var stamp = ""; try{ stamp = noteStampFor(p) + " "; }catch(e){}\n""", "")
js = rep(js, """String(p.notes).replace(/\\s+$/, "") + "\\n" : "") + stamp + t;""", """String(p.notes).replace(/\\s+$/, "") + "\\n" : "") + t;""")
assert "noteStampFor(" not in js.replace("function noteStampFor(", ""), "a note still gets a stamp"
js = rep(js, """/* ---- stamped punch notes ----
   Each Save adds one line to the punch's notes: "[10:05 · 0:26] text" — the clock time and how
   long that punch had run when you saved. Plain text, so the Time Log, the CSV and the edit
   dialog all keep reading it as they always have. Lines without a stamp are older notes. */""",
"""/* ---- punch notes ----
   Each Save adds one line to the punch's notes, as typed. Notes saved before Parsec 16.1 may start
   with a stamp, "[10:05 · 0:26] text" (the clock time and how long the punch had run): it is read
   here, kept as it was, and left out wherever only the note's words are shown or copied. */""")
js = rep(js, """title: 'Note on this punch \\u2014 Enter or Save adds it with a time stamp; it also saves itself when you change page or the clock changes',""",
             """title: 'Note on this punch \\u2014 Enter or Save adds it; it also saves itself when you change page or the clock changes',""")
js = rep(js, """  'Note on this punch — Enter or Save adds it with a time stamp; it also saves itself when you change page or the clock changes': 'A note on this punch|Enter or Save adds it with a time stamp · it saves itself when you leave',""",
             """  'Note on this punch — Enter or Save adds it; it also saves itself when you change page or the clock changes': 'A note on this punch|Enter or Save adds it · it saves itself when you leave',""")
js = rep(js, "title: 'Save this note stamped with how long this punch has run', text: 'Save',", "title: 'Save this note', text: 'Save',")
js = rep(js, "/* notes: saved entries (stamp on the left), then the field and its Save button */", "/* notes: saved entries (an old stamp, if it has one, on the left), then the field and its Save button */")
js = rep(js, "title: en.ran ? 'Saved ' + en.ran + ' into this punch' : 'Older note \\u2014 written before notes were stamped',",
             "title: en.ran ? 'Saved ' + en.ran + ' into this punch' : '',")
js = rep(js, ".jpn.legacy .jpn-st { color: var(--muted, #66758a); background: transparent; }",
             ".jpn.legacy { grid-template-columns: minmax(0, 1fr) auto; }\\n  .jpn.legacy .jpn-st { display: none; }")

# Work performed: Enter starts a new line, no date and time added (old stamped lines stay)
js = rep(js, "'data-placeholder': 'What you did. Press Enter to stamp date & time.'", "'data-placeholder': 'What you did.'")
js = rep(js, """    var node = range.startContainer, offset = range.startOffset;
    var lineText = node.nodeType === 3 ? node.textContent.slice(0, offset) : '';
    var alreadyStamped = /\\u2014\\s*\\d{1,2}-\\d{1,2}-\\d{4}\\s+\\d{1,2}:\\d{2}(:\\d{2})?\\s*$/.test(lineText);
    range.deleteContents();
    var frag = document.createDocumentFragment();
    if (!alreadyStamped) frag.appendChild(document.createTextNode(stampNow()));
""", """    range.deleteContents();
    var frag = document.createDocumentFragment();
""")
js = rep(js, "+ esc2(txt) + esc2(stampNow()) + '<br>';", "+ esc2(txt) + '<br>';")
js = rep(js, "(Work performed stamps, part rows moving on)", "(Work performed lines, part rows moving on)")

# Copy notes (14.6): the words only — an old note's stamp stays in the note but not in the copy
js = rep(js, """    var t = String(p.notes || '').replace(/\\s+/g, ' ').trim(); if (!t || seen[t]) return; seen[t] = 1;""",
             """    var t = noteEntries(p.notes).map(function (n) { return n.text; }).join(' ').replace(/\\s+/g, ' ').trim(); if (!t || seen[t]) return; seen[t] = 1;""")
LOG.append("Parsec 16.1: the work-log stamps rule and the time stamps on notes are gone; notes save as typed")
