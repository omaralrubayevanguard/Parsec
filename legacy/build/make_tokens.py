import json, os, sys
OUT = sys.argv[1]
# name, light, dark, usage
C = [
 ("canvas","#F2F0EA","#0E0E0D","App background behind the sidebar and around the main panel. Sidebar text sits on it: `ink`, `ink-2`, `ink-3`."),
 ("panel","#FBFAF7","#151514","The main panel every page lives in, and the properties rail. The default reading ground."),
 ("raised","#FFFFFF","#1D1D1B","Menus, popovers, the command menu, inputs and secondary buttons — anything that floats above `panel`."),
 ("fill","#F0EDE6","#222220","Quiet fill: row hover, segmented-control track, op-type tags, the timer chip at rest."),
 ("selected","#E8E4DA","#2A2A27","The selected row or nav item, and pressed states. All text tokens stay legible on it."),
 ("hairline","#E6E2D8","#262624","1px dividers inside lists and between the rail and the main column. Never around sections — space separates sections."),
 ("border","#D6D0C3","#363532","Outline of inputs and secondary buttons at rest (decorative: the label, not the line, identifies the control)."),
 ("border-strong","#8F897C","#6E6A62","Checkbox and toggle outlines and any edge that must be seen — 3:1 on `panel` and `raised` in both themes."),
 ("ink","#1D1C1A","#EDEBE6","Primary text and icons on every ground: `canvas`, `panel`, `raised`, `fill`, `selected`."),
 ("ink-2","#57534B","#B0ACA3","Secondary text — descriptions, meta lines, inactive tabs — on every ground."),
 ("ink-3","#67625A","#9A968D","Tertiary text — property labels, placeholders, timestamps, counts. Smallest legible tone: 4.5:1 on every ground incl. `selected`."),
 ("ink-4","#A8A398","#5E5B55","Disabled text and decorative glyphs only. Never for information."),
 ("accent","#86643A","#D1B184","Bronze / champagne. The one accent: the accent button fill, the focus ring, the current stage, the running clock. One accent control per view."),
 ("accent-text","#7A5A32","#D6B88D","Accent as text (links such as “Transfer…”, the current stage name) on every ground and on `accent-tint`."),
 ("accent-tint","#F4EDE1","#2A241B","Background of the Next-step strip and the selected command-menu row. Text on it: `ink`, `ink-2`, `accent-text`."),
 ("accent-line","#D9C5A3","#6B5A40","Hairline in accent — the Next-step strip edge, stage-track current segment track."),
 ("on-accent","#FFFFFF","#1A1610","Text and icons on an `accent` fill (the accent button label)."),
 ("primary","#1D1C1A","#EDEBE6","Primary button fill — ink, inverted in dark. Calmer than colour; use for the main action of a view (Start clock)."),
 ("on-primary","#FBFAF7","#151514","Text and icons on a `primary` fill."),
 ("status-hold","#857F75","#8D897F","Hold tech and Declined icons (empty ring / crossed disc). Icon colour only — the status word stays `ink`."),
 ("status-working","#3A8C60","#5BBE8B","Working and Complete icons (half disc / checked disc). Icon colour only."),
 ("status-waiting","#AD7210","#E2A84C","Waiting – Parts and Waiting – Foreman icons (dashed ring). Icon colour only."),
 ("status-customer","#2F8795","#58B3C0","Waiting – Customer icon (dashed ring). Icon colour only."),
 ("status-support","#6C69C8","#9E9DF0","Waiting – Tech support icon (dashed ring), and DIAG op tags. Icon colour only."),
 ("status-problem","#C0503F","#EC7F6C","Escalated, overdue and over-quote marks; the overrun part of the time bar. Icon colour only."),
 ("good","#2C7350","#63C291","Good numbers as text (efficiency at or above 100%) on `panel`, `raised`, `fill`, `good-tint`."),
 ("good-tint","#E7F1EA","#16261E","Background behind a good notice. Rare."),
 ("warn","#8C5B0B","#E0A64A","Caution numbers as text (under 0.5 h left) on `panel`, `raised`, `fill`, `warn-tint`."),
 ("warn-tint","#F8EEDC","#2A2114","Background behind a caution notice. Rare."),
 ("bad","#A8402E","#EE8270","Bad numbers and danger text (over quote, Delete RO) on `panel`, `raised`, `fill`, `bad-tint`."),
 ("bad-tint","#F8E9E5","#2D1916","Hover fill of a danger item; background of an error notice."),
 ("scrim","rgba(29,28,26,.28)","rgba(0,0,0,.6)","Behind the command menu and dialogs."),
]
themes=[{"id":"light","name":"Ivory (light)"},{"id":"dark","name":"Graphite (dark)"}]
color={"themes":themes,"tokens":[{"name":n,"value":{"light":l,"dark":d},"usage":u} for n,l,d,u in C]}
fam={"sans":"\"Geist\", \"Inter\", \"Segoe UI\", system-ui, sans-serif",
     "serif":"\"Newsreader\", \"Iowan Old Style\", Charter, Georgia, serif",
     "mono":"\"Geist Mono\", \"Cascadia Mono\", Consolas, ui-monospace, monospace"}
def st(n,fs,lh,fw,usage,sample,ls=None,**k):
    d={"name":n,"fontSize":fs,"lineHeight":lh,"fontWeight":fw,"usage":usage,"sample":sample}
    if ls: d["letterSpacing"]=ls
    d.update(k); return d
groups=[
 {"name":"Display","family":"serif","styles":[
   st("display-lg","32px","38px",500,"The RO page title — the customer's name. One per page.","Blue Ridge Haulage","-0.015em",opticalSize=36),
   st("display","24px","30px",500,"Page titles on list pages (RO list, Triage, Warranty) and dialog titles.","Repair orders","-0.01em",opticalSize=24)]},
 {"name":"Text","family":"sans","styles":[
   st("title","17px","24px",600,"Section headings inside a page: Operations, Activity.","Operations","-0.01em"),
   st("heading","15px","22px",600,"Card and operation titles, menu group names in dialogs.","Clutch slipping – replace clutch","-0.005em"),
   st("body","14px","21px",400,"Default text: notes, work performed, descriptions.","Clutch slips under load, no free play left."),
   st("body-medium","14px","21px",500,"Row titles, buttons, tabs, property values that need weight.","Start clock"),
   st("small","13px","19px",400,"Meta lines and property values in the rail.","Opened Oct 6 · Lot D5 · Dana Kowalski"),
   st("label","12px","16px",500,"Property labels, tab counts, captions. Sentence case — never all caps.","Mileage"),
   st("micro","11px","14px",600,"Keyboard hints and badge counts only.","⌘K","0.02em"),
   st("timer","30px","36px",500,"The running clock on an operation. Tabular figures (font-variant-numeric: tabular-nums).","6:15:57","-0.02em"),
   st("stat","18px","24px",500,"Numbers in the time stats row and money totals. Tabular figures.","8.00 h","-0.01em")]},
 {"name":"Data","family":"mono","styles":[
   st("id","13px","18px",500,"Identifiers: RO number, VIN, part numbers, case numbers, key tags.","RO-37538 · 4V4NC9EH9LN891160"),
   st("id-sm","11.5px","16px",500,"Op-type tags (DIAG, OP, PM, WARR, COMEBACK, SUBLET) and identifiers in dense lists.","OP","0.04em")]},
]
typ={"fonts":[],"families":fam,"groups":groups}
S=[("space-1","4px","Icon-to-label gap inside chips and tags."),("space-2","8px","Gap between buttons; icon-to-label in buttons and rows."),
   ("space-3","12px","Row padding (vertical 10–12), menu padding, gap inside a group."),("space-4","16px","Inside a group: between fields, rows of a card, rail rows."),
   ("space-5","20px","Panel header side padding; Next-step strip padding."),("space-6","24px","Between related blocks (title → stage track)."),
   ("space-8","32px","Between groups (stage track → operations)."),("space-10","40px","Main column top padding."),
   ("space-12","48px","Between sections (operations → activity); main column side padding."),("space-16","64px","Page bottom breathing room.")]
R=[("radius-xs","4px","Keyboard hints, the time-bar ends."),("radius-sm","6px","Op-type tags, small chips, checkboxes."),
   ("radius-md","8px","Buttons, inputs, list rows, nav items, menu items."),("radius-lg","12px","Menus, popovers, the Next-step strip, the time card."),
   ("radius-xl","16px","The main panel and the command menu."),("radius-full","999px","Avatars, status icons, the play/stop button, the toast.")]
SZ=[("control-sm","28px","Small buttons and inputs (in rows and the rail)."),("control-md","32px","Default buttons, inputs, nav items."),
    ("control-lg","40px","The play/stop button and dialog inputs."),("row","40px","Operation rows and list rows."),
    ("header","48px","Main panel header (breadcrumb bar)."),("sidebar","236px","Sidebar width (collapses to 56px, icons only)."),
    ("rail","300px","Properties rail width on the RO page."),("measure","760px","Max width of the main reading column.")]
SH=[("shadow-panel",{"light":"0 0 0 1px rgba(29,28,26,.06), 0 1px 3px rgba(29,28,26,.04)","dark":"0 0 0 1px rgba(255,255,255,.06)"},"The main panel's edge on `canvas`. The only resting shadow."),
    ("shadow-raised",{"light":"0 0 0 1px rgba(29,28,26,.07), 0 2px 4px rgba(29,28,26,.04), 0 12px 32px -8px rgba(29,28,26,.18)","dark":"0 0 0 1px rgba(255,255,255,.07), 0 16px 40px -8px rgba(0,0,0,.7)"},"Menus, popovers, the command menu, the toast."),
    ("shadow-focus",{"light":"0 0 0 2px #FBFAF7, 0 0 0 4px #86643A","dark":"0 0 0 2px #151514, 0 0 0 4px #D1B184"},"Keyboard focus: a 2px gap in `panel`, then a solid 2px `accent` ring (≥4.6:1 on every ground).")]
tokens={"name":"Parsec","version":1,"color":color,"type":typ,
 "spacing":{"note":"4-pt scale. Rhythm: 16 inside a group, 32 between groups, 48 between sections.","tokens":[{"name":n,"value":v,"usage":u} for n,v,u in S]},
 "radius":{"note":"Soft, never round — except status icons, avatars, the play button and the toast.","tokens":[{"name":n,"value":v,"usage":u} for n,v,u in R]},
 "size":{"note":"Control heights and layout widths.","tokens":[{"name":n,"value":v,"usage":u} for n,v,u in SZ]},
 "shadow":{"note":"Nothing casts a shadow at rest except the main panel's edge.","tokens":[{"name":n,"value":v,"usage":u} for n,v,u in SH]},
}
os.makedirs(OUT,exist_ok=True)
json.dump(tokens,open(os.path.join(OUT,'tokens.json'),'w'),indent=1,ensure_ascii=False)
# local compiled css (for render checks & the standalone mock-up; not published)
def css():
    a=[":root, [data-theme=\"light\"] {"]
    for n,l,d,u in C: a.append(f"  --{n}: {l};")
    for n,v,u in SH: a.append(f"  --{n}: {v['light']};")
    a.append("}\n[data-theme=\"dark\"] {")
    for n,l,d,u in C: a.append(f"  --{n}: {d};")
    for n,v,u in SH: a.append(f"  --{n}: {v['dark']};")
    a.append("}\n:root {")
    for fam_list in (S,R,SZ):
        for n,v,u in fam_list: a.append(f"  --{n}: {v};")
    for k,v in fam.items(): a.append(f"  --font-{k}: {v};")
    a.append("}")
    for g in groups:
        for s in g["styles"]:
            a.append(f".{s['name']} {{ font-family: var(--font-{g['family']}); font-size: {s['fontSize']}; line-height: {s['lineHeight']}; font-weight: {s['fontWeight']};"+(f" letter-spacing: {s['letterSpacing']};" if 'letterSpacing' in s else "")+" }")
    return "\n".join(a)+"\n"
open(os.path.join(os.path.dirname(OUT.rstrip('/')),'tokens.local.css'),'w').write(css())
print('ok', len(C),'colors')
