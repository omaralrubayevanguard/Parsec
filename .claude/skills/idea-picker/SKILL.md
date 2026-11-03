---
name: "idea-picker"
description: "Build an Idea picker (v4): an interactive ideas mock-up for picking visual references — animated drawn options and real screenshots, Love / OK / No, mix-and-match parts, blind compare, pinned notes, a mood board and a DESIGN.md spec to copy back. Use when asked for ideas, options, references or a mock-up before a UI, workflow or feature change."
---

# Idea picker (v4)

An **Idea picker** is a single interactive HTML page that shows ideas for a change, drawn as they would look. Each idea's action plays as a short animation when an option is picked. The person picks one option per idea, or Skip, and copies the picks back into the chat. You build from those picks.

Two files: this SKILL.md (how to run it) and **`template.html`** next to it (the whole shell, a four-idea sample covering every option kind, and four motion recipes). Read `template.html` only when you are about to build; copy it whole and change only the content block, the top strip and the `v-` CSS.

## When to use it

- The person asks for ideas, options, recommendations or "a mock-up" before a UI, workflow or feature change.
- A change has several reasonable ways to go, and the person should choose before you build.
- Mock-ups come before UI changes, unless the person tells you to implement directly.

## Three kinds of option

Each idea uses one; mix them freely on one page.

| | **Pick one** (default) | **Love / OK / No** | **Mix and match** |
|---|---|---|---|
| Use for | choosing how something will work or look | steering a look with real references — several can be right | "colour from A, layout from C" |
| Set by | nothing | any option with a `ref`, or `rate: true` | `parts: ['Colour', 'Layout']` |
| Person does | picks one option or Skip | rates each option ♥ / OK / No (clicking a picture loves it) | for each part, picks the option it comes from |
| Visual | drawn `vis` + `steps` | the reference pictures (a `vis` above them is optional) | drawn `vis` styled by `[data-mix0]`, `[data-mix1]`…, or the reference pictures |

A reference with `rate: false` stays **pick one**, chosen straight from the pictures.

## Two shapes of mock-up

Decide this first; it sets the idea count and whether the live preview is on.

| | Single component | Cross-screen workflow |
|---|---|---|
| What's being changed | one control, panel or card (a tooltip, a header, a login form) | several screens or a flow (intake → assign → close) |
| Ideas | **4–8**, in 1–2 groups | **10–16**, in 3–5 groups |
| `COMPONENT` | set: the pane shows the component with every pick applied | `null`: the pane hides |
| Visuals | the component itself, drawn once per idea | one screen or step per visual |

More than 8 ideas about one component crowd the preview pane and repeat the same drawing; fewer than 10 across a workflow leave screens with no idea.

## How to run it

1. **Survey first, briefly.** Look at the current state of what's being changed, in the code or the screenshots. Count what matters, e.g. "560 tooltips, 7 styles, 4 ways to write a key". This fills the top strip. Note the product's real control names, labels and numbers; the visuals use them.
2. **Write the ideas** (count per the table above).
   - Each group is named by its job ("Find what's wrong", "Fix it fast", "Who fixes, and the record").
   - Each idea gets a short title, one line of why, a drawn visual, and 2–4 options. Skip is added automatically.
   - Each option has a short label and an optional one-line note. The first option is the recommended one, unless the options are equal; give it a `rec` line saying why.
   - Tag each idea with `pri` (H / M / L impact) and `effort` (S / M / L). The sort chips and the build-size line use them.
   - If an idea only makes sense once another is picked, add `needs: '<that idea's k>'`. The card dims until its parent is picked, and the shell keeps the two consistent (see *needs*).
3. **Draw each visual in the product's own look.** Real names, numbers and wording, not lorem ipsum. Plain HTML/CSS: buttons, pills, rows, bars, cards. Every class in a visual starts with `v-`, and every visual sits in its own wrapper `<div class="v-<k>">` so its step rules can be scoped to it.
4. **Start from a recipe when the motion matches.** `template.html` carries four tested motions — **menu** (a button opens a menu, an item is chosen), **drag** (a row is lifted, moved, dropped), **type** (a field takes focus, text grows, Save lands), **flow** (three stages light up and a panel changes). Their CSS is live in the template and their `vis` + `steps` are in the `RECIPES` comment under `IDEAS`. Copy one, rename the wrapper to your `v-<k>`, change the words, add the `[data-opt]` rules. Invent a motion from scratch only when none of the four fits.
5. **Bring real references when the ask is about a look.** Search 21st.dev (`mcp__21dev__search`, `type: 'component'` or `'theme'`) for the thing being designed — "status badge", "kanban board", "stepper". Each result's `previewUrl` is the picture, `url` the link back. Put them on options as `ref: { img, url, src: '21st.dev', title }`. Mobbin (`mcp__Mobbin__search_screens`) gives whole app screens, but needs a paid Mobbin plan; if it says so, say it in one line and use 21st.dev. Pictures load from the source in the person's browser and can't be downloaded into the workspace; a placeholder with the link shows if one is blocked. 2–4 references per idea; never more than one idea per page that is only references with nothing drawn, unless the whole page is a reference board.
6. **Animate only on pick.** Nothing moves until an option is picked; then that option's version plays once and holds. See *Animation steps* and *Accuracy rules*.
7. **Set the live preview** for a single component: `COMPONENT` = that component's HTML. Every pick lands on it as `data-p-<idea>="<option>"`, so one CSS block shows all the picks combined. `COMPONENT = null` for a workflow.
8. **Add the top strip.** "Already there — staying as it is" (what exists and won't change), or "How it looks now" (the survey numbers, or 2–4 crops). One row.
9. **Build from `template.html`.** Fill `APP`, `TOPIC`, `KEY` (unique per mock-up), `IDEAS`, `COMPONENT`, the top strip, and the `v-` CSS. Leave the shell (`ip-`) alone. Delete the recipe CSS you didn't use.
10. **Check, and show the evidence.** Open the page with `?check=1`. The header badge must read **check ✓** (green). Then paste the one-line report from the console (`ipReport()`) and attach one screenshot per theme (Ivory, Graphite, Carbon, Linear) plus one at 390 px. A check that produced no badge count and no screenshots did not happen. Full list under *Checks*.
11. **Deliver it** as an artifact when the chat offers one, otherwise as a file. Name it "<App> <topic> ideas mock-up.html". Reply with 1–2 lines, the report line, and the screenshots.

## The idea fields

```js
{ k: 'look',                      // unique key, used in CSS as [data-opt] and data-p-look, and as the wrapper class v-look
  t: 'One tooltip, the same everywhere',
  why: 'Today: the browser’s grey box on most things.',
  pri: 'H', effort: 'S',          // impact H/M/L · effort S/M/L (optional, used by sort and build size)
  rec: 'Why the first option is recommended, one line.',   // optional, shown as a tooltip on the badge
  needs: 'other-k',               // optional: this idea depends on that one
  vis: '<div class="v-look"><span class="v-btn v-target">Copy RO number</span><span class="v-tip">…</span><span class="v-cur"></span></div>',
  steps: [['idle', 900], ['point', 700], ['show', 1100], ['click', 500], ['done', 1400]],
  opts: [['ink', 'A · Ink', 'dark on light'], ['card', 'B · Card', 'like the Time Log’s tip'], ['quiet', 'C · Quiet', 'a tinted box']] }
```

An option can also be an object, which carries a reference and a spec line:

```js
{ v: 'hints', label: 'Shortcut hints', note: 'key caps inside the tip',
  ref: { img: 'https://cdn.21st.dev/…/preview.png', url: 'https://21st.dev/@wensity/components/tooltip', src: '21st.dev', title: 'Tooltip with shortcut hints' },
  spec: '--tip-bg: var(--primary); --tip-radius: 6px' }   // goes into the exported DESIGN.md when this option is chosen
```

More idea fields: `rate: true | false` (force Love / OK / No on or off), `parts: ['Colour', 'Shape']` (mix and match; part *n* lands on the visual as `data-mix<n>="<option>"` and on the preview as `data-p-<k>-<n>`). `vis` is optional when every option has a `ref`.

### needs

`needs` is enforced by the shell, so the readout never carries a half-decided pair:

- Picking a dependent idea while its parent is unpicked **also picks the parent's recommended option**; the toast says so ("… · also <Parent> → A · Ink") and Undo reverts both.
- Skipping a parent **skips its dependents** too, with the same toast and Undo.
- A dependent card is dimmed with a "needs: …" badge until the parent is picked; the badge turns green after.
- This holds for every way of deciding: a pick, a ♥, a mix part, a blind win, Accept all.
- The only way to get `(needs … — not picked)` in the text is an imported `.json`; treat it as "ask in one line".

## The picks text (keep this format exactly)

```
<App> · <Topic> — my picks
<Group>:
· <Idea title>: <Option label>
· <Idea title>: <Option label> (leaning)
· <Idea title>: ♥ <Label>, <Label> · ok <Label> · no <Label>
· <Idea title>: Colour ← <Label>, Layout ← <Label>
  note: <per-idea note if any>
  pin 1 on <Label>: <the note pinned to a spot>
· <Idea title>: skip
<Group>:
· …
(not picked yet: N)
Notes: <the Anything else box>
Build size: 2 S · 1 M · 0 L → a small build
<blank line>
Build checklist:
1. <Idea title> → <Option label>
2. …
<blank line>
References:
· <Idea title> → <Label>: <url>
```

- `(leaning)` means the person is not sure; confirm it in one line before building, or build the recommended option if they don't answer.
- Per-idea notes appear only when non-empty, indented with two spaces.
- Build size counts the effort tags of the picked ideas: any L or 3+ M → "a bigger build"; any M → "a medium build"; else "a small build". Untagged picks are counted separately.
- The build checklist lists the non-skip picks in author order: the loved options (or the OK ones if none is loved) for a rated idea, the parts for a mixed one. It is omitted when empty.
- References lists the link of every chosen option that has one. Omitted when none.

## Reading the picks back

- Build each picked option as described on its card.
- `skip` means leave it as it is.
- `(not picked yet: N)` means use the recommended option, or ask about it in one line.
- Per-idea `note:` and the global `Notes:` override the cards. A `pin` is a note about one spot of that option's visual or picture.
- `♥` options are what to build towards; `ok` is acceptable; `no` is what to avoid. A rated idea with only `no` reads as `skip`.
- For a mixed idea, take each part from the named option.
- If the person also sends a DESIGN.md from **Copy spec**, its tokens are the theme they were looking at and its picks section repeats the picks with each option's `spec` line — build from it.
- The build checklist is a hand-off aid; the picks themselves win if they conflict.
- Build without restating the picks; when done, report in a few lines.

## Look and behaviour (already in the template)

**New in v4**
- **References** sit in a grid of pictures in the card; ⤢ zooms one full screen, the source link opens the original, a placeholder with the link shows if a picture is blocked. A badge on each picture shows ♥ Love / OK / Picked / the parts taken from it.
- **Love / OK / No** buttons on each option row; clicking a picture loves it; 1–4 love an option from the keyboard.
- **Mix and match** rows: one row per part, a chip per option; clicking a picture fills the next empty part; 1–4 do the same from the keyboard.
- **Blind** (on a card, or in the header to run through every unpicked idea): two options at a time, names hidden, ← / → to choose; the winner stays on until one is left, then it's picked (or loved, or used for every part).
- **Pin** (on a card): click a spot on the visual or picture, type a note, Enter. Numbered pins stay on the visual, show their note on hover, go into the picks text and the spec, and undo.
- **Board** (header or panel): everything picked or loved on one page — pictures, or the drawn visual at its end state — with Print / PDF.
- **Copy spec / DESIGN.md ↓** (panel): the current theme's tokens as CSS variables plus every pick with its `spec` line, notes, pins and reference links, as Markdown.
- **+ Theme** (header): paste or choose a DESIGN.md (the awesome-design-md format); its canvas, surface, ink, hairline and primary colours, font and corner radius become a theme on the switch, kept in the browser. Remove it from the same popover.
- **Before / after:** drop, paste or choose a screenshot of today's screen in the top strip (or set `BEFORE` to an image URL). The live preview gets After / Before / Both; without a `COMPONENT` it shows Before alone. The screenshot is shrunk to 1400 px and kept in the browser when it fits.


- **Sticky header, two rows.** Row 1: app name, topic in small caps, jump links to the groups, the theme switch, Accept all recommended (fills only the unpicked ideas with each card's first option), and **Your picks** with an n/total count. Row 2: the progress bar and "n of N decided", the filter tabs All / Unpicked / Picked / Skipped with counts, and the sort chips Author order / By impact / By effort.
- **Four themes**, each a whole look, not just colours:
  - **Ivory** / **Graphite** — the default pair: warm neutrals, bronze accent, Iowan serif headings, 14 px cards, roomy.
  - **Carbon** (light, from IBM Carbon) — grey `#f4f4f4` canvas, blue `#0f62fe`, IBM Plex Sans, square corners, 16 px spacing, hairline borders instead of shadows.
  - **Linear** (dark, from Linear) — near-black canvas, indigo `#5e6ad2`, Inter at 600, 8 px cards / 6 px controls, compact 12 px padding.
  - Each theme sets colour tokens plus `--head`/`--hw` (heading font and weight), `--rc`/`--rp`/`--rv`/`--rb`/`--rs` (card, panel, visual, control, tag corners) and `--cp`/`--gg` (card padding, grid gap). The frame uses only these, so switching theme restyles everything. Keep the names. Old saved `mist` / `obsidian` picks open as Carbon / Linear.
  - The visuals follow the colour tokens for free. Keep their own radii fixed: they draw the product, not the picker.
- **Cards** sit in a grid, `minmax(440px, 1fr)`, one column under 980 px. A picked card gets an accent ring; a skipped one doesn't. The current card (for the keyboard) gets a stronger ring.
- **Options** show their key cap (1–4, S). The first option carries a **Recommended** badge; hover or focus it to read the `rec` line.
- **Visuals** stay still until a pick, with a "Pick an option to see it play" hint. After a pick: ↻ replays, and the **step dots** under the visual show the sequence; click a dot to jump to that step, hover for its name.
- **Peek:** hover an option for half a second and the visual shows that option's end state as a ghost with a "peek · B" label; move away and the real state returns. Only on hover-capable pointers, never while a sequence is playing.
- **Keyboard:** J / K (or ↓ / ↑) move between cards, 1–4 pick an option, S skips, Z undoes, Esc closes the panel. Clicking anywhere on a card makes it the current one. Keys are ignored while typing in a note.
- **Auto-scroll:** after a pick, the next unpicked card scrolls into view (nearest edge, so the card just picked usually stays visible) and becomes current. A checkbox in the panel turns it off; `AUTOSCROLL` sets the default.
- **Undo:** every pick, skip, accept-all, reset and import shows a toast with **Undo**; Z also undoes. **Reset all** in the panel clears picks and sure/leaning marks (notes stay) and can be undone.
- **Compare:** each card has a Compare button that shows two options side by side at their end state; two selects choose which two. Picking an option closes it.
- **Sure / Leaning:** a toggle appears on a picked card; Leaning is written into the picks text.
- **Live preview pane:** shown when `COMPONENT` (or a `PREVIEW` function) is set, and pinned with the header as you scroll: on the right, 12 px under the header, on wide screens; above the cards and flush under the header below 1100 px. **Hide / Show** in its title collapses it to one line (remembered). The header's real height is measured into `--hdr`, so the pane, the Your picks panel and the jump targets all clear it, however many rows the header wraps to. Don't add `overflow:hidden` to `html`, `body` or any wrapper of the cards: it stops sticky from working (the template uses `overflow-x:clip`). Picks land on `.ip-prev-root` as `data-p-<k>="<opt>"`. `PREVIEW(ctx)` runs after every change with `{ v, conf, notes, note, th, root, mount, ideas, app, topic }` for anything CSS can't express.
- **Your picks panel:** the live text, an "Anything else" box, the auto-scroll checkbox, **Copy for the chat** (clipboard with a textarea fallback), Download .json, Import .json, PDF / Print, Reset all. Esc closes it.
- Picks, marks, notes, theme, filter and sort are kept in `localStorage` under `KEY`, and the picks also in the URL hash `#p=` so the link can be shared. Every storage access is in try/catch.
- Self-contained: no external scripts, no fonts fetched.

## Animation steps

Each idea has `steps: [[name, ms], …]`. When an option is picked, the shell plays the steps once, in turn, and stops on the last one. On the visual (`.ip-vis`) it sets:

- `data-step="name"`: the step playing now.
- `.ip-s-name`: a class for every step reached so far, so a change can stay once it has happened.
- `data-opt="value"`: the option picked.

Style each step with CSS, scoped to the idea's wrapper:

```css
.ip-s-point .v-look .v-cur{left:52px;top:22px}                       /* the pointer moves to the button, and stays there */
.ip-s-show .v-look .v-tip{opacity:1;transform:none}                   /* the tooltip appears and stays */
[data-step="click"] .v-cur::after{animation:v-ripple .45s ease-out}  /* the click ripples (in the template already) */
[data-step="done"] .v-look .v-target{background:var(--primary)}       /* the result, only while "done" is the current step */
.ip-s-done .v-look .v-target{…}                                       /* the result, kept after "done" */
[data-opt="card"] .v-tip{background:var(--raised);color:var(--ink)}   /* each option shows its own outcome */
[data-opt="menu"].ip-s-click .v-menu{opacity:1}                       /* only the "menu" option opens a menu */
```

Typical sequences (3–6 seconds in all):

- Hover → tip: idle 900, point 700, show 1100.
- Click → change: idle 900, point 700, click 500, done 1400.
- Wait → show (delays, debounce): idle, point, wait, show.
- Menu, drag, type, flow: use the recipes in `template.html`.

## Accuracy rules for the visuals

These are what make the animations read as the real thing rather than a sketch.

- **Every option has a rule.** Each `opts` value appears at least once in the CSS as `[data-opt="value"]`, so each option visibly shows its own outcome. If two options would look the same, merge them or make the difference visible (a label, a size, a timing).
- **Every step after the first has a rule**, as `.ip-s-name` or `[data-step="name"]`. A step with no rule is a pause the person can't see; name the pause (`wait`) and draw it (a filling bar, a dimmed control).
- **Scope to the wrapper.** Pointer coordinates and step rules are written as `.ip-s-<step> .v-<k> …`, never bare `.ip-s-<step> .v-cur`, so two cards that share a step name can't move each other's pointer.
- **The pointer lands on its target.** Put the control at a known spot (left-aligned, fixed `top`), then set the pointer's `left`/`top` so its tip sits inside the control, roughly a third in and halfway down: for a 26 px button at `left:12px` (the visual's padding) that is about `left:52px;top:22px`. Keep the resting spot (`.v-cur` default) away from the hint at the bottom-left and the ↻ and dots at the bottom.
- **Give tall visuals a height.** A menu or a list is taller than the 96 px minimum; set the wrapper's `height` (the recipes do) so nothing is clipped.
- **Things that stay, stay.** Use `.ip-s-<step>` (reached) for changes that persist, `[data-step]` (current) only for one-moment effects like the ripple.
- **Timing follows the real interaction.** A tooltip delay is drawn as a wait of that length; a save shows its spinner for as long as a save takes. Give each option its own timing when the option is about timing (`[data-opt="d300"].ip-s-wait .v-delay i{transition-duration:.3s}`).
- **Nothing moves before a pick**, and a replay starts from the first frame. Don't use CSS animations that loop on their own.
- **Left-align the drawn content** so pixel positions hold at any card width, and keep each visual under ~400 px wide so it fits one column on a phone without scaling.
- **Labels don't overlap.** Watch pointer vs hint, tip vs button, badge vs title. Check both the first frame and the last.
- **Use the tokens** (`var(--ink)`, `var(--acc)`, …), never hard-coded colours, so all four themes look right.
- **Reduced motion** shows the end state, still; the template already turns the `v-` transitions off under `prefers-reduced-motion`.

## Checks

The page runs `ipCheck()` on load. It lists every drawn option without a `[data-opt]` rule (a mixed one without a `[data-mixN]` rule), every step without a `.ip-s-`/`[data-step]` rule, sequences outside 2.5–7 s, a `needs` that points nowhere, a `ref` with no `img` or `url`, an idea with neither a `vis` nor references, and classes in a visual not prefixed `v-`. Options that are references need no CSS. With `?check=1` the header shows a badge: **N to fix** (amber) or **check ✓** (green). `ipReport()` in the console returns one line, e.g.

```
Idea picker check · Parsec · Tooltips · 4 ideas, 12 options, 11 steps, 3 references · 0 to fix · preview on · 4 themes
```

The hand-off must include that line and five screenshots (four themes, one phone). Then by eye:

- No console errors; no sideways scroll at 390 px.
- Nothing plays before a pick; each option plays its own version once and holds it; ↻ replays; the dots jump.
- Peek shows and clears; Compare shows the two chosen options.
- No labels overlap. No class names collide: the frame uses `ip-`, visuals use `v-`, never generic names like `.mk`, `.pk` or `.empty`.
- Every option toggles, the copied text reads right, and the live preview reflects the picks.
- References: the pictures load in a normal browser (they can't from the workspace — that's expected there), ⤢ zooms, the link opens; ♥ / OK / No and mix parts show on the picture badges.
- Blind, Pin, Board and Copy spec each run once without an error.

Three test pages ship with the skill under `samples/`: **1 Single component** (every option kind on a tooltip, with the live preview), **2 Workflow** (the four recipes, no preview, blind run), **3 Visual references** (a reference board of real 21st.dev components). Open one to see a feature working before using it.
