/* ===== the list of changes, navigation, picks ===== */
var SMALL = [["year", "Model year on New RO"], ["vin", "The year from the VIN"], ["undo", "Undo only for the latest action"], ["ph", "Search finds trucks and years"], ["a11y", "Keyboard and screen readers"], ["rm", "Reduced motion"], ["leave", "Leave the preview parts out"]];
var ITEMS = [
  { id: "catalog", grp: "file", ov: 1, r: dCatalog, t: "52-truck catalog", s: "Sharper pictures, side and top", h: "A truck for its time.", sub: "52 Volvo bodies from 1997 to 2026, each drawn from the side and from above. Search by year.",
    what: [["52 bodies, 1997 to 2026", "VN, VNL, VNR, VNX, VHD, VAH, VNM and VT, by generation and cab."], ["Side and top view", "Every body has a top view for the bay map."], ["Marks the unsure ones", "Older bodies and changeover years say Check against truck."]],
    over: "53 pictures cut from your screenshots. Soft when shown big, and most have no top view.", rec: "Bring the 52 pictures in to replace the screenshot cut-outs. Your own photos still come first." },
  { id: "dialog", grp: "file", ov: 1, r: dDialog, t: "Truck & photos dialog", s: "Year, body, trim, photos", h: "Match the body, or use your own photos.", sub: "The camera badge on the RO picture opens it. Try the presets at the top.",
    what: [["Year and model pick the body", "It says Matched, Confirmed, Check against truck, or what's missing."], ["Body and trim", "Pick the generation to confirm it. Trims only on 2025+ VNL and 2026+ VNR."], ["Your photos", "A vehicle photo replaces the drawing. A top photo for the bay map is optional."], ["Clear save", "Save truck, then Saving…, then Saved. Retry if it fails."]],
    over: "The picture menu on the RO, and Your data › Truck pictures for the whole shop. No year or trim per RO.", rec: "Bring it in as the RO's picture menu. Keep the shop-wide library for your own photos." },
  { id: "places", grp: "file", ov: 1, r: dPlaces, t: "Where the truck shows", s: "RO, Foreman, Yard, Search", h: "The same truck everywhere it's parked.", sub: "Switch between the places ChatGPT put the picture.",
    what: [["RO title block", "Picture top right, with a camera badge."], ["Foreman", "Header picture, and a top view in each bay, cab up."], ["Yard and Search", "Small top view on yard spots. Search matches truck and year."]],
    over: "Pictures are already in the RO header, RO list, Search, Foreman and Triage rows, and bay icons. Yard spots are new.", rec: "Use the sharper pictures where 9.9 already shows one, and add yard spots." },
  { id: "theme", grp: "file", r: dTheme, t: "White / Near black theme", s: "Blue accent, cooler grays", h: "Two new themes.", sub: "ChatGPT replaced Ivory and Graphite. Compare all four, then try one on this page.",
    what: [["White", "Cool gray page, blue accent."], ["Near black", "Almost black page, light blue accent."], ["Switch in the sidebar", "White · Near black at the bottom of the sidebar."]],
    over: "Ivory and Graphite: warm, with a bronze accent.", rec: "Add them as two more choices instead of replacing Ivory and Graphite." },
  { id: "icons", grp: "file", r: dIcons, t: "Sharper icons", s: "Square, technical line set", h: "A crisper icon set.", sub: "Same icons, redrawn on a 24 px grid with square ends.",
    what: [["Redrawn", "Square line ends, thinner 1.5 px lines."], ["Everywhere", "Sidebar, buttons, Foreman, Triage and the palette."], ["New icons", "Camera, truck, calendar, filter, pin and more."]],
    over: "The current rounded set.", rec: "A matter of taste. It suits White and Near black better than Ivory." },
  { id: "bayfocus", grp: "file", ms: 160, r: dBayFocus, t: "Bay focus", s: "Hover · press · select", h: "A bay that feels selected.", sub: "A little depth on hover. A clear place to land.",
    what: [["Hover", "The border sharpens and the card lifts 2 px."], ["Press", "A small settle makes the click feel deliberate."], ["Select", "A blue edge stays. The header above follows."]],
    over: "Bays highlight on hover but don't lift or settle.", rec: "Bring it in. Small, and nothing changes size." },
  { id: "switch", grp: "file", ms: 180, r: dSwitch, t: "RO switching", s: "The header eases in", h: "Keep your place while you switch.", sub: "The header eases in when you pick another RO. Compare with Parsec now.",
    what: [["Fade", "The header comes in from 4 px below."], ["Keyboard", "↑ ↓ moves through the list."], ["Context stays", "The list doesn't jump or reload."]],
    over: "The header swaps instantly.", rec: "Bring it in." },
  { id: "transfer", grp: "file", ms: 220, r: dTransfer, t: "Truck transfer", s: "Drag · move · undo", h: "Move a truck with a drag.", sub: "Drag between bays, or use Move truck. Undo puts it back.",
    what: [["Drag", "The truck follows the pointer. Free bays light up, busy ones dim."], ["Move truck button", "Lists the open bays, for keyboard and touch."], ["Flight and Undo", "The truck flies to its bay. Undo flies it back."]],
    over: "A truck moves by changing the RO's bay. No dragging on the floor plan.", rec: "Bring it in. It's the most useful of the six." },
  { id: "save", grp: "file", ms: 160, r: dSave, t: "Save feedback", s: "Saving · saved · retry", h: "The button tells you it saved.", sub: "Edit the text, then save. Try a failed save too.",
    what: [["Saving…", "A spinner in the button while it saves."], ["Saved", "A green check for a moment, then back to normal."], ["Retry", "A failed save keeps your text and says Retry save."]],
    over: "Most saves are silent.", rec: "Bring it in on the RO and Truck & photos save buttons." },
  { id: "progress", grp: "file", ms: 220, r: dProgress, t: "Repair progress", s: "Check off · undo", h: "Finishing a step feels finished.", sub: "Check off the current step. Undo is in the toast.",
    what: [["The segment fills", "Left to right, in 220 ms."], ["The step pops", "The check mark lands with a small pop."], ["Undo", "The toast says what changed and offers Undo."]],
    over: "Stages change with no animation and no Undo.", rec: "Bring it in." },
  { id: "search", grp: "file", ms: 140, ov: 1, r: dSearch, t: "Quick search", s: "Ctrl K · arrows · Enter", h: "Find any RO from anywhere.", sub: "Press Ctrl K or the Search button. Try a year, a model or a name.",
    what: [["Opens fast", "Eases in over 140 ms with a soft blur behind."], ["Keyboard", "↑ ↓ to move, Enter to open, Esc to close. Focus goes back where you were."], ["Finds trucks", "Matches number, customer, truck, year and VIN."]],
    over: "The Ctrl K palette already searches ROs and shows truck pictures.", rec: "Take the open animation and the year and truck matching. Keep 9.9's palette." },
  { id: "small", grp: "file", ov: 1, r: dSmall, small: SMALL, t: "Small changes", s: "7 smaller fixes", h: "The small stuff.", sub: "Mark each one Yes or No right on its card.",
    what: [["Model year on New RO", "So the body matches as soon as the RO is made."], ["Year not read from the VIN", "The VIN letter repeats every 30 years."], ["Tidy-ups", "Undo only for the latest action, screen reader labels, reduced motion."]],
    over: "9.9 reads the year from the VIN and picks the newest generation when unsure.", rec: "Add the year field, and keep reading the VIN, using the model's years to settle it." },
  { id: "peek", grp: "prop", r: dPeek, t: "RO quick peek", s: "Hover · pin · open", h: "The right detail, right here.", sub: "Preview a truck's work without leaving the bay map.",
    what: [["Preview", "Hover or Tab to a bay: complaint, technician, next step."], ["Pin", "Click to hold it. Esc closes it."], ["Open", "Open the RO from the preview."]],
    over: "Foreman's side panel shows the RO you click.", rec: "Worth it for the floor plan. Low effort." },
  { id: "aging", grp: "prop", r: dAging, t: "Blocker aging", s: "Time · urgency · resolve", h: "See what has been waiting.", sub: "Move the demo clock, then resolve a blocker.",
    what: [["Age chips", "Hours waiting. Amber near the follow-up time, red past it."], ["Owner and next step", "Each blocker says who has it and what's next."], ["Resolve", "One click, with Undo."]],
    over: "Triage lists what's waiting. There's no follow-up time per blocker.", rec: "Good fit for Triage." },
  { id: "views", grp: "prop", r: dViews, t: "Saved views", s: "Filter · name · recall", h: "A workspace that remembers the task.", sub: "Filter the list, name the view, switch away and come back.",
    what: [["Filter", "Pick the stage and technician."], ["Save", "Give the filter a short name."], ["Return", "One click brings the same list back."]],
    over: "The RO list has fixed filters. You can't save your own.", rec: "Useful once the RO list grows." },
  { id: "suit", grp: "prop", r: dSuit, t: "Bay suitability", s: "Needs · fit · move", h: "Give every truck the right bay.", sub: "Pick the job and see which bays have the equipment.",
    what: [["Choose the work", "Each job lists the equipment it needs."], ["Compare bays", "Fit, what's missing, or occupied."], ["Move", "Move to a suitable bay, with Undo."]],
    over: "Bay types label each bay, but nothing checks a job against them.", rec: "Builds on Bay types. Needs the equipment list per bay first." },
  { id: "tech", grp: "prop", r: dTech, t: "Technician preview", s: "Skills · hours · assign", h: "Know the impact before assigning.", sub: "Compare technicians' hours and skills, then assign.",
    what: [["Adjust", "Set the estimated hours for the job."], ["Compare", "Hours before and after, and the skill match."], ["Assign", "With Undo."]],
    over: "Foreman assigns technicians without showing their load or skills.", rec: "Good once technician skills are recorded." },
  { id: "hand", grp: "prop", r: dHand, t: "Shift handover", s: "Select · note · copy", h: "A clear handoff to the next shift.", sub: "Pick the ROs, add a note, build and copy the handover.",
    what: [["Collect", "Tick the ROs to hand over."], ["Review", "A draft with each RO's stage and next step."], ["Keep", "Edit it and copy it. Nothing is sent."]],
    over: "Nothing like it yet.", rec: "Quick to build. Useful for the evening shift." },
  { id: "notes", grp: "prop", ov: 1, r: dNotes, t: "Photo annotations", s: "Place · describe · save", h: "Put the note where the issue is.", sub: "Add a marker on the truck picture and describe it.",
    what: [["Place", "Press Add note, then click the picture."], ["Describe", "Pick a type and write the observation."], ["Revisit", "Open, save or remove a marker."]],
    over: "9.9 already has Notes on the truck: numbered marks in their own window, shown on the RO banner.", rec: "Keep 9.9's version. Borrow the types: Inspection, Damage, Leak, Wear." },
  { id: "ready", grp: "prop", ov: 1, r: dReady, t: "Completion readiness", s: "Check · progress · ready", h: "Finish with nothing left unclear.", sub: "Tick the final checks. Mark ready unlocks at the end.",
    what: [["Review", "See exactly what's still missing."], ["Complete", "Tick checks as the work is done."], ["Ready", "Mark ready for pickup, with Undo."]],
    over: "Triage close checks already stop closing an RO with missing items.", rec: "Add the count and progress bar to the close checks instead of a new screen." },
  { id: "picks", grp: "sum", r: dPicks, t: "Your picks", s: "Copy and send", h: "Your picks.", sub: "Copy this and paste it in the chat. I'll build the next Parsec from it." }
];
function idx(id){ for(var i = 0; i < ITEMS.length; i++) if(ITEMS[i].id === id) return i; return 0; }
function pad(n){ return String(n).padStart(2, "0"); }
var cur = 0, navEl, mainEl, sideEl;

function navHTML(){
  function b(it, i){ return '<button type="button" data-i="' + i + '"><span class="n">' + pad(i + 1) + '</span><span class="t">' + it.t + '</span><span class="d"></span><span class="s">' + it.s + "</span></button>"; }
  var h = '<h2>ChatGPT\'s changes</h2><p class="lede">Try each one, then mark what to bring into Parsec.</p><h3>In the Parsec file <em>12</em></h3>';
  ITEMS.forEach(function(it, i){ if(it.grp === "file") h += b(it, i); });
  h += "<h3>Proposals <em>8 · not built</em></h3>";
  ITEMS.forEach(function(it, i){ if(it.grp === "prop") h += b(it, i); });
  h += "<h3>Finish</h3>" + b(ITEMS[ITEMS.length - 1], ITEMS.length - 1);
  return h;
}
function navDots(){
  ITEMS.forEach(function(it, i){
    var d = $('#nav [data-i="' + i + '"] .d'); if(!d) return;
    var v = (PK[it.id] || {}).v;
    if(it.id === "small" && !v){ var n = SMALL.filter(function(c){ return (PK["s:" + c[0]] || {}).v; }).length; v = n === SMALL.length ? "yes" : n ? "chg" : ""; }
    if(it.id === "picks") v = "";
    d.className = "d " + (v || "");
  });
}
function go(i){
  cleanup(); cur = i; var it = ITEMS[i];
  $$("#nav button").forEach(function(b){ b.setAttribute("aria-current", +b.dataset.i === i); });
  var chips = it.grp === "file" ? '<span class="chip file">In ChatGPT\'s Parsec file</span>' : it.grp === "prop" ? '<span class="chip prop">Proposal only · not built</span>' : "";
  if(it.ms) chips += '<span class="chip">' + ic("clock") + it.ms + " ms</span>";
  if(it.ov) chips += '<span class="chip has">Overlaps Parsec 9.9</span>';
  var mob = '<label class="mnav"><span class="k">Change</span><select class="sl" id="navsel">' + ITEMS.map(function(x, j){ return '<option value="' + j + '"' + (j === i ? " selected" : "") + ">" + pad(j + 1) + " · " + x.t + "</option>"; }).join("") + "</select></label>";
  mainEl.innerHTML = mob + '<div class="eyebrow">' + pad(i + 1) + " · " + (it.grp === "file" ? "In the file" : it.grp === "prop" ? "Proposal" : "Summary") + "</div><h2>" + it.h + '</h2><p class="sub">' + it.sub + "</p>" + (chips ? '<div class="chips">' + chips + "</div>" : "") + '<div id="demo"></div>';
  it.r($("#demo"));
  $("#navsel").onchange = function(){ go(+this.value); };
  side();
  window.scrollTo(0, 0);
  try{ history.replaceState(null, "", "#" + it.id); }catch(e){}
}
function side(){
  var it = ITEMS[cur];
  if(it.id === "picks"){
    var n = { yes: 0, chg: 0, no: 0 }; ITEMS.forEach(function(x){ var v = (PK[x.id] || {}).v; if(v) n[v]++; });
    sideEl.innerHTML = '<h4>So far</h4><h5>' + (n.yes + n.chg + n.no) + " of 20 decided</h5><ol><li><span><b>" + n.yes + " to bring in</b>Including proposals to build.</span></li><li><span><b>" + n.chg + " to change</b>Your notes say how.</span></li><li><span><b>" + n.no + ' not now</b>Left out of the next version.</span></li></ol><div class="box">Copy the summary and paste it in the chat. Anything you leave undecided stays out.</div>';
    return;
  }
  var pk = PK[it.id] || {}, prop = it.grp === "prop";
  var opts = [["yes", prop ? "Build it" : "Bring it in"], ["no", "Not now"], ["chg", "Change it"]];
  sideEl.innerHTML = "<h4>" + (prop ? "What it does" : "What changed") + "</h4><h5>" + it.t + "</h5><ol>" + it.what.map(function(w){ return "<li><span><b>" + w[0] + "</b>" + w[1] + "</span></li>"; }).join("") + "</ol>" +
    (it.over ? '<div class="box"><b>Parsec 9.9 now</b><br>' + it.over + "</div>" : "") + (it.rec ? '<div class="box over"><b>My take</b><br>' + it.rec + "</div>" : "") +
    "<h4>" + (prop ? "Build it?" : "Bring it in?") + '</h4><div class="pick"><div class="seg" id="pk" role="group" aria-label="Your pick">' + opts.map(function(o){ return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (pk.v === o[0]) + '">' + o[1] + "</button>"; }).join("") + '</div><textarea id="pkn" placeholder="Note (optional)">' + esc(pk.note || "") + "</textarea></div>" +
    '<div class="nextp"><button type="button" class="btn sm gh" id="pv"' + (cur === 0 ? " disabled" : "") + ">" + ic("chevL") + 'Back</button><button type="button" class="btn sm" id="nx">Next' + ic("chevR") + "</button></div>";
  $("#pk", sideEl).onclick = function(e){ var b = e.target.closest("button"); if(!b) return; var v = pk.v === b.dataset.v ? null : b.dataset.v; pk.v = v; PK[it.id] = pk; $$("button", this).forEach(function(x){ x.setAttribute("aria-pressed", x.dataset.v === v); }); navDots(); };
  $("#pkn", sideEl).oninput = function(){ pk.note = this.value; PK[it.id] = pk; };
  $("#pv", sideEl).onclick = function(){ if(cur > 0) go(cur - 1); };
  $("#nx", sideEl).onclick = function(){ go(Math.min(ITEMS.length - 1, cur + 1)); };
}
function setTheme(v){ D.documentElement.dataset.th = v; $$("#th button").forEach(function(b){ b.setAttribute("aria-pressed", b.dataset.v === v); }); }
function setMotion(v){ MOTION = v; D.body.classList.toggle("nomo", !v); $("#mo").setAttribute("aria-pressed", v); }

navEl = $("#nav"); mainEl = $("#main"); sideEl = $("#side");
navEl.innerHTML = navHTML();
navEl.onclick = function(e){ var b = e.target.closest("button[data-i]"); if(b) go(+b.dataset.i); };
$("#th").onclick = function(e){ var b = e.target.closest("button[data-v]"); if(b) setTheme(b.dataset.v); };
$("#mo").onclick = function(){ setMotion(this.getAttribute("aria-pressed") !== "true"); };
$("#sl").onclick = function(){ SLOW = this.getAttribute("aria-pressed") !== "true"; this.setAttribute("aria-pressed", SLOW); if(SLOW) slowLoop(); else D.getAnimations().forEach(function(a){ a.playbackRate = 1; }); };
try{ if(matchMedia("(prefers-reduced-motion: reduce)").matches) setMotion(false); }catch(e){}
setTheme("white");
go(Math.max(0, idx((location.hash || "").slice(1))));
