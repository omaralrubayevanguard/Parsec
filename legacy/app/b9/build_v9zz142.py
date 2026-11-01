# Parsec 14.2 — the truck card's words and quoted hours change in place (b9/v142.js + v142.css), the Technician page's Parts tab
# gets the RO page's three ways to add a part, Assets and Inventory move below Fixes, and the Time Log opens on your own times.
# Runs after build_v9z141.py. Runs inside build12.py: uses js, rep, b9, json, EXTRA_CSS, HOOK_NAMES, LOG.
js = rep(js, "\nvar PG = (function(){\n", "\n" + b9("v142.js") + "\nvar PG = (function(){\n")
EXTRA_CSS.append(b9("v142.css"))
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("v142.css"))[1:-1] + js[_jc1:]

# the RO page's title block: the customer and the truck line change in place
js = rep(js, "el('h1', { class: 'px-ro__title', text: RO.customerName || 'Customer' }),",
             "el('h1', { class: 'px-ro__title', html: rifHtml(RO, 'customerName', RO.customerName || '', 'Customer') }),   /* Parsec 14.2 */")
js = rep(js, "el('div', { class: 'px-ro__sub', text: veh }),",
             "el('div', { class: 'px-ro__sub', html: (function () { try { var tl = (typeof truckLine === 'function' && truckLine(RO)) || trkLabel(RO); return rifVeh(RO, tl === 'this truck' ? '' : tl) + (RO.location ? ' · ' + rifHtml(RO, 'location', RO.location) : ''); } catch (e) { return esc(veh); } })() }),")

# Foreman: an operation's quote in the pops, the RO's in the header bar (when one operation carries it)
js = rep(js, "(+o.quoted || 0).toFixed(1) + ' h</span></div>'", "qtHtml(ro, o, +o.quoted || 0, 1) + ' h</span></div>'", 2)
js = rep(js, "' + I.b.toFixed(1) + ' / ' + I.q.toFixed(1) + ' h</span>'; }", "' + I.b.toFixed(1) + ' / ' + qtRoHtml(ro, I.q, 1) + ' h</span>'; }")

# the Technician page's clock card: Quoted changes in place, as on the RO page
if js.count("ockHtml(o.roId, o.id, { pg: 'tc', hr: 'tc', can: mine && !S.view, off:"):   # Parsec 14.3: gone with the Technician page's own clock card
  js = rep(js, "ockHtml(o.roId, o.id, { pg: 'tc', hr: 'tc', can: mine && !S.view, off:", "ockHtml(o.roId, o.id, { pg: 'tc', hr: 'tc', editQ: v142Ok(o.ro), can: mine && !S.view, off:")

# the sidebar and the phone's More sheet: Assets and Inventory below Fixes
js = rep(js, 'var PM_GROUPS = [["", ["career", "timelog", "rolist", "assets", "ros", "tech", "triage", "foreman", "parts", "inventory", "warranty", "manager", "fixes", "report", "admin"]]];',
             'var PM_GROUPS = [["", ["career", "timelog", "rolist", "ros", "tech", "triage", "foreman", "parts", "warranty", "manager", "fixes", "assets", "inventory", "report", "admin"]]];')
js = rep(js, 'var PX_GROUPS = [["", ["career", "timelog", "rolist", "assets", "ros", "tech", "triage", "foreman", "parts", "inventory", "warranty", "manager", "fixes", "admin"]]];',
             'var PX_GROUPS = [["", ["career", "timelog", "rolist", "ros", "tech", "triage", "foreman", "parts", "warranty", "manager", "fixes", "assets", "inventory", "admin"]]];')

# the Time Log opens on the signed-in person's own times, every time it's picked
js = rep(js, 'case "nav": UI.view=t.dataset.view;', 'case "nav": if(t.dataset.view === "timelog") UI.tlMe = 1; UI.view=t.dataset.view;')
js = rep(js, "  function go(view){", "  function go(view){ if(view === 'timelog') UI.tlMe = 1;")

HOOK_NAMES += ["rifHtml", "rifVeh", "qtHtml", "qtSet"]
LOG.append("Parsec 14.2: words and quoted hours in place, the Technician page's Parts tab, the sidebar order, the Time Log on your own times")
