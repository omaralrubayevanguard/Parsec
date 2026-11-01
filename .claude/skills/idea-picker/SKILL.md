---
name: "idea-picker"
description: "Build an Idea picker (v3): an interactive ideas mock-up with animated visuals, options plus Skip, a live preview, keyboard picks, compare, undo, and a Your picks panel to copy back. Use when asked for ideas, options or a mock-up before a UI, workflow or feature change."
---

# Idea picker (v3)

An **Idea picker** is a single interactive HTML page that shows ideas for a change, drawn as they would look. Each idea's action plays as a short animation when an option is picked. The person picks one option per idea, or Skip, and copies the picks back into the chat. You build from those picks.

v3 is one file: this SKILL.md, with the whole shell in the template at the end. There are no separate shell files.

## When to use it

- The person asks for ideas, options, recommendations or "a mock-up" before a UI, workflow or feature change.
- A change has several reasonable ways to go, and the person should choose before you build.
- Mock-ups come before UI changes, unless the person tells you to implement directly.

## How to run it

1. **Survey first, briefly.** Look at the current state of what's being changed, in the code or the screenshots. Count what matters, e.g. "560 tooltips, 7 styles, 4 ways to write a key". This fills the top strip. Note the product's real control names, labels and numbers; the visuals use them.
2. **Write the ideas.**
   - Aim for 10–16 ideas in 3–5 groups, each group named by its job ("Find what's wrong", "Fix it fast", "Who fixes, and the record").
   - Each idea gets a short title, one line of why, a drawn visual, and 2–4 options. Skip is added automatically.
   - Each option has a short label and an optional one-line note. The first option is the recommended one, unless the options are equal; give it a `rec` line saying why.
   - Tag each idea with `pri` (H / M / L impact) and `effort` (S / M / L). The sort chips and the build-size line use them.
   - If an idea only makes sense once another is picked, add `needs: '<that idea's k>'`. The card dims until its parent is picked.
3. **Draw each visual in the product's own look.** Real names, numbers and wording, not lorem ipsum. Plain HTML/CSS: buttons, pills, rows, bars, cards. Every class in a visual starts with `v-`.
4. **Animate the action in every visual — but only when an option is picked.** Show how the idea would actually happen, as a short sequence of steps: a pointer moves to the control, a tooltip appears, a click ripples, the state changes, the result shows. See *Animation steps* and *Accuracy rules* below.
5. **Add the live preview when the ideas are about one component.** Set `COMPONENT` to that component's HTML. The sticky pane shows it, and every pick lands on it as `data-p-<idea>="<option>"`, so one CSS block shows all the picks combined. Set `COMPONENT = null` when the ideas span several screens; the pane hides itself.
6. **Add the top strip.** Use "Already there — staying as it is" (what exists and won't change), or "How it looks now" (the survey numbers, or 2–4 crops). Keep it to one row.
7. **Keep the prose to a minimum.** The lead line is generated. No essays; the person asks when they want more.
8. **Build the page from the template below.** Copy it whole. Fill `APP`, `TOPIC`, `KEY` (unique per mock-up), `IDEAS`, `COMPONENT`, the top strip, and the `v-` CSS. Leave the shell (`ip-`) alone.
9. **Check before sending** (see *Checks*). Open the page with `?check=1`: the shell lists every option and step that has no CSS rule.
10. **Deliver it** as an artifact when the chat offers one, otherwise as a file. Name it "<App> <topic> ideas mock-up.html" and reply with 1–2 lines.

## The idea fields

```js
{ k: 'look',                      // unique key, used in CSS as [data-opt] and data-p-look
  t: 'One tooltip, the same everywhere',
  why: 'Today: the browser’s grey box on most things.',
  pri: 'H', effort: 'S',          // impact H/M/L · effort S/M/L (optional, used by sort and build size)
  rec: 'Why the first option is recommended, one line.',   // optional, shown as a tooltip on the badge
  needs: 'other-k',               // optional: dims this card until that idea is picked
  vis: '<span class="v-btn v-target">Copy RO number</span><span class="v-tip">…</span><span class="v-cur"></span>',
  steps: [['idle', 900], ['point', 700], ['show', 1100], ['click', 500], ['done', 1400]],
  opts: [['ink', 'A · Ink', 'dark on light'], ['card', 'B · Card', 'like the Time Log’s tip'], ['quiet', 'C · Quiet', 'a tinted box']] }
```

## The picks text (keep this format exactly)

```
<App> · <Topic> — my picks
<Group>:
· <Idea title>: <Option label>
· <Idea title>: <Option label> (leaning)
· <Idea title>: <Option label> (needs <Parent title> — not picked)
  note: <per-idea note if any>
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
```

- `(leaning)` means the person is not sure; confirm it in one line before building, or build the recommended option if they don't answer.
- Per-idea notes appear only when non-empty, indented with two spaces.
- Build size counts the effort tags of the picked ideas: any L or 3+ M → "a bigger build"; any M → "a medium build"; else "a small build". Untagged picks are counted separately.
- The build checklist lists the non-skip picks in author order. It is omitted when empty.

## Reading the picks back

- Build each picked option as described on its card.
- `skip` means leave it as it is.
- `(not picked yet: N)` means use the recommended option, or ask about it in one line.
- Per-idea `note:` and the global `Notes:` override the cards.
- A pick marked `needs … — not picked` depends on an idea that wasn't picked: ask in one line, or build both.
- The build checklist is a hand-off aid; the picks themselves win if they conflict.
- Build without restating the picks; when done, report in a few lines.

## Look and behaviour (already in the template)

- **Sticky header, two rows.** Row 1: app name, topic in small caps, jump links to the groups, the theme switch, Accept all recommended (fills only the unpicked ideas with each card's first option), and **Your picks** with an n/total count. Row 2: the progress bar and "n of N decided", the filter tabs All / Unpicked / Picked / Skipped with counts, and the sort chips Author order / By impact / By effort.
- **Four themes**, two warm and two cool: Ivory and Graphite (warm neutrals, bronze accent), Mist and Obsidian (cool neutrals, steel-blue accent). Keep the names. Every colour in the page comes from the tokens, so the visuals follow the theme for free. `--goodt` is the tint behind green tags.
- **Cards** sit in a grid, `minmax(440px, 1fr)`, one column under 980 px. A picked card gets an accent ring; a skipped one doesn't. The current card (for the keyboard) gets a stronger ring. A card whose `needs` parent isn't picked is dimmed with a "needs: …" badge that turns green once the parent is picked.
- **Options** show their key cap (1–4, S). The first option carries a **Recommended** badge; hover or focus it to read the `rec` line.
- **Visuals** stay still until a pick, with a "Pick an option to see it play" hint. After a pick: ↻ replays, and the **step dots** under the visual show the sequence; click a dot to jump to that step, hover for its name.
- **Peek:** hover an option for half a second and the visual shows that option's end state as a ghost with a "peek · B" label; move away and the real state returns. Only on hover-capable pointers, never while a sequence is playing.
- **Keyboard:** J / K (or ↓ / ↑) move between cards, 1–4 pick an option, S skips, Z undoes, Esc closes the panel. Clicking anywhere on a card makes it the current one. Keys are ignored while typing in a note.
- **Auto-scroll:** after a pick, the next unpicked card scrolls into view (nearest edge, so the card just picked usually stays visible) and becomes current. A checkbox in the panel turns it off; `AUTOSCROLL` sets the default.
- **Undo:** every pick, skip, accept-all, reset and import shows a toast with **Undo**; Z also undoes. **Reset all** in the panel clears picks and sure/leaning marks (notes stay) and can be undone.
- **Compare:** each card has a Compare button that shows two options side by side at their end state; two selects choose which two. Picking an option closes it.
- **Sure / Leaning:** a toggle appears on a picked card; Leaning is written into the picks text.
- **Live preview pane:** sticky on the right when `COMPONENT` (or a `PREVIEW` function) is set. Picks land on `.ip-prev-root` as `data-p-<k>="<opt>"`. `PREVIEW(ctx)` runs after every change with `{ v, conf, notes, note, th, root, mount, ideas, app, topic }` for anything CSS can't express.
- **Your picks panel:** the live text, an "Anything else" box, the auto-scroll checkbox, **Copy for the chat** (clipboard with a textarea fallback), Download .json, Import .json, PDF / Print, Reset all. Esc closes it.
- Picks, marks, notes, theme, filter and sort are kept in `localStorage` under `KEY`, and the picks also in the URL hash `#p=` so the link can be shared. Every storage access is in try/catch.
- Self-contained: no external scripts, no fonts fetched.

## Animation steps

Each idea has `steps: [[name, ms], …]`. When an option is picked, the shell plays the steps once, in turn, and stops on the last one. On the visual (`.ip-vis`) it sets:

- `data-step="name"`: the step playing now.
- `.ip-s-name`: a class for every step reached so far, so a change can stay once it has happened.
- `data-opt="value"`: the option picked.

Style each step with CSS:

```css
.ip-s-point .v-cur{left:52px;top:22px}                               /* the pointer moves to the button, and stays there */
.ip-s-show .v-tip{opacity:1;transform:none}                           /* the tooltip appears and stays */
[data-step="click"] .v-cur::after{animation:v-ripple .45s ease-out}  /* the click ripples (in the template already) */
[data-step="done"] .v-btn.v-target{background:var(--primary)}         /* the result, only while "done" is the current step */
.ip-s-done .v-target{…}                                               /* the result, kept after "done" */
[data-opt="card"] .v-tip{background:var(--raised);color:var(--ink)}   /* each option shows its own outcome */
[data-opt="menu"].ip-s-click .v-menu{opacity:1}                       /* only the "menu" option opens a menu */
```

Typical sequences (3–6 seconds in all):

- Hover → tip: idle 900, point 700, show 1100.
- Click → change: idle 900, point 700, click 500, done 1400.
- Wait → show (delays, debounce): idle, point, wait, show.
- Drag: grab, move ×3, drop, done.
- Type: focus, then a few type steps that grow the text, then save.
- Flows: step 1 → 2 → 3 with the panel changing.

## Accuracy rules for the visuals

These are what make the animations read as the real thing rather than a sketch.

- **Every option has a rule.** Each `opts` value appears at least once in the CSS as `[data-opt="value"]`, so each option visibly shows its own outcome. If two options would look the same, merge them or make the difference visible (a label, a size, a timing).
- **Every step after the first has a rule**, as `.ip-s-name` or `[data-step="name"]`. A step with no rule is a pause the person can't see; name the pause (`wait`) and draw it (a filling bar, a dimmed control).
- **The pointer lands on its target.** Put the control at a known spot (left-aligned, fixed `top`), then set the pointer's `left`/`top` so its tip sits inside the control, roughly a third in and halfway down: for a 26 px button at `left:12px` (the visual's padding) that is about `left:52px;top:22px`. A pointer that only goes to one target can instead sit inside it (`position:relative` on the target, `.v-cur` as its child). Keep the resting spot (`.v-cur` default) away from the hint at the bottom-left and the ↻ and dots at the bottom.
- **Things that stay, stay.** Use `.ip-s-<step>` (reached) for changes that persist, `[data-step]` (current) only for one-moment effects like the ripple.
- **Timing follows the real interaction.** A tooltip delay is drawn as a wait of that length; a save shows its spinner for as long as a save takes. Give each option its own timing when the option is about timing (`[data-opt="d300"].ip-s-wait .v-delay i{transition-duration:.3s}`).
- **Nothing moves before a pick**, and a replay starts from the first frame. Don't use CSS animations that loop on their own.
- **Left-align the drawn content** so pixel positions hold at any card width, and keep each visual under ~400 px wide so it fits one column on a phone without scaling.
- **Labels don't overlap.** Watch pointer vs hint, tip vs button, badge vs title. Check both the first frame and the last.
- **Use the tokens** (`var(--ink)`, `var(--acc)`, …), never hard-coded colours, so all four themes look right.
- **Reduced motion** shows the end state, still; the template already turns the `v-` transitions off under `prefers-reduced-motion`.

## Checks

The page runs `ipCheck()` on load and prints to the console every option without a `[data-opt]` rule, every step without a `.ip-s-`/`[data-step]` rule, sequences outside 2.5–7 s, a `needs` that points nowhere, and classes in a visual not prefixed `v-`. Open it with `?check=1` and a badge in the header counts them. Then:

- Render all four themes, and a 390 px wide phone with no sideways scroll.
- No console errors.
- Nothing plays before a pick; each option plays its own version once and holds it; ↻ replays; the dots jump.
- Peek shows and clears; Compare shows the two chosen options.
- No labels overlap. No class names collide: the frame uses `ip-`, visuals use `v-`, never generic names like `.mk`, `.pk` or `.empty`.
- Every option toggles, the copied text reads right, and the live preview reflects the picks.

## Template

Copy it whole, then fill in the content block, the top strip and the `v-` visual CSS. The sample is two tooltip ideas (look, and delay which needs look) with a live preview of the one component.

```html
<!doctype html>
<html lang="en" data-th="ivory">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec · Tooltips</title>
<style>
/* ---------- tokens: four themes · Ivory / Graphite (warm) · Mist / Obsidian (cool). Keep the names. ---------- */
:root,[data-th="ivory"]{--canvas:#F2F0EA;--panel:#FBFAF7;--raised:#fff;--fill:#F0EDE6;--hair:#E6E2D8;--border:#D6D0C3;--ink:#1D1C1A;--ink2:#57534B;--ink3:#67625A;--acc:#86643A;--acct:#F4EDE1;--accl:#D9C5A3;--primary:#1D1C1A;--onprimary:#FBFAF7;--good:#3A8C60;--goodt:#E8F5EE;--warn:#AD7210;--bad:#C0503F;--shadow:0 0 0 1px rgba(29,28,26,.06),0 1px 3px rgba(29,28,26,.04);--raise:0 0 0 1px rgba(29,28,26,.08),0 18px 44px -14px rgba(29,28,26,.28);color-scheme:light}
[data-th="graphite"]{--canvas:#0E0E0D;--panel:#151514;--raised:#1D1D1B;--fill:#222220;--hair:#262624;--border:#363532;--ink:#EDEBE6;--ink2:#B0ACA3;--ink3:#9A968D;--acc:#D1B184;--acct:#2A241B;--accl:#6B5A40;--primary:#EDEBE6;--onprimary:#151514;--good:#5BBE8B;--goodt:#1A2E24;--warn:#E2A84C;--bad:#EC7F6C;--shadow:0 0 0 1px rgba(255,255,255,.06);--raise:0 0 0 1px rgba(255,255,255,.08),0 20px 50px -14px rgba(0,0,0,.7);color-scheme:dark}
[data-th="mist"]{--canvas:#EEF1F4;--panel:#F7F9FB;--raised:#fff;--fill:#E8EDF2;--hair:#DEE3E9;--border:#C9D1DA;--ink:#171A1F;--ink2:#4E5661;--ink3:#626B77;--acc:#3F6A8A;--acct:#E4EDF4;--accl:#A9C4D8;--primary:#1F2A36;--onprimary:#F7F9FB;--good:#2F8A5E;--goodt:#E2F1E9;--warn:#A86F0E;--bad:#BF4F3F;--shadow:0 0 0 1px rgba(23,26,31,.06),0 1px 3px rgba(23,26,31,.05);--raise:0 0 0 1px rgba(23,26,31,.08),0 18px 44px -14px rgba(23,26,31,.3);color-scheme:light}
[data-th="obsidian"]{--canvas:#0C0E11;--panel:#13161A;--raised:#1A1E24;--fill:#1F242B;--hair:#242930;--border:#343B45;--ink:#E8ECF1;--ink2:#A9B2BD;--ink3:#8E98A4;--acc:#8FB6D4;--acct:#1B2733;--accl:#3E5B73;--primary:#E8ECF1;--onprimary:#13161A;--good:#5BBE8B;--goodt:#182B22;--warn:#E2A84C;--bad:#EC7F6C;--shadow:0 0 0 1px rgba(255,255,255,.06);--raise:0 0 0 1px rgba(255,255,255,.08),0 20px 50px -14px rgba(0,0,0,.75);color-scheme:dark}
:root{--sans:"Inter","Segoe UI",system-ui,sans-serif;--serif:"Iowan Old Style",Georgia,serif;--mono:"Cascadia Mono",Consolas,monospace}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
html,body{margin:0;background:var(--canvas);color:var(--ink);font:400 14px/1.45 var(--sans);-webkit-font-smoothing:antialiased;overflow-x:hidden}
button,input,textarea,select{font:inherit;color:inherit}
/* ---------- the frame (prefix ip- so the drawn visuals' classes can't collide) ---------- */
.ip-bar{position:sticky;top:0;z-index:60;background:var(--canvas);box-shadow:inset 0 -1px 0 var(--hair)}
.ip-r1,.ip-r2{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 16px}
.ip-r2{padding-top:0;padding-bottom:8px}
.ip-bar h1{margin:0 auto 0 0;display:flex;align-items:baseline;gap:10px;font:500 19px/24px var(--serif)}
.ip-bar h1 small{font:500 11px/1 var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}
.ip-jump{display:flex;gap:2px;flex-wrap:wrap}.ip-jump a{padding:4px 9px;border-radius:7px;font-size:12.5px;color:var(--ink2);text-decoration:none}.ip-jump a:hover{background:var(--fill)}
.ip-seg{display:inline-flex;gap:2px;padding:2px;border-radius:9px;background:var(--fill)}
.ip-seg button{all:unset;cursor:pointer;height:26px;padding:0 10px;border-radius:7px;font-size:12.5px;font-weight:500;color:var(--ink2);white-space:nowrap}.ip-seg button[aria-pressed="true"]{background:var(--raised);color:var(--ink);box-shadow:var(--shadow)}
.ip-btn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border-radius:8px;background:var(--raised);box-shadow:inset 0 0 0 1px var(--border);font:500 12.5px/1 var(--sans);white-space:nowrap}
.ip-btn.pri{background:var(--primary);color:var(--onprimary);box-shadow:none}.ip-btn em{font-style:normal;opacity:.7;font-size:11px}
.ip-btn:focus-visible,.ip-opt:focus-visible,.ip-seg button:focus-visible,.ip-chip:focus-visible,.ip-dots i:focus-visible,.ip-sel:focus-visible{outline:2px solid var(--acc);outline-offset:1px}
.ip-prog{display:flex;align-items:center;gap:10px;flex:1 1 220px;min-width:160px}
.ip-prog-bar{flex:1;height:6px;border-radius:999px;background:var(--fill);overflow:hidden}
.ip-prog-bar i{display:block;height:100%;width:0;background:var(--acc);border-radius:999px;transition:width .35s}
.ip-prog span{font-size:12px;color:var(--ink3);white-space:nowrap}
.ip-tabs{display:inline-flex;gap:2px;padding:2px;border-radius:9px;background:var(--fill);flex-wrap:wrap}
.ip-chip{all:unset;cursor:pointer;height:26px;padding:0 10px;border-radius:7px;font-size:12px;font-weight:500;color:var(--ink2);white-space:nowrap}
.ip-chip[aria-pressed="true"]{background:var(--raised);color:var(--ink);box-shadow:var(--shadow)}
.ip-warn{display:none;align-items:center;height:26px;padding:0 10px;border-radius:7px;background:var(--warn);color:#fff;font-size:12px;font-weight:600;cursor:pointer}
.ip-wrap{max-width:1500px;margin:0 auto;padding:18px 16px 120px}
.ip-layout{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}
.ip-layout.has-prev{grid-template-columns:minmax(0,1fr) min(360px,34vw)}
@media (max-width:1100px){.ip-layout.has-prev{grid-template-columns:1fr}}
#ip-preview{position:sticky;top:96px;align-self:start;max-height:calc(100vh - 110px);overflow:auto;padding:12px;border-radius:14px;background:var(--panel);box-shadow:var(--shadow)}
#ip-preview[hidden]{display:none}
#ip-preview h2{margin:0 0 8px;font:500 14px/1 var(--serif)}
#ip-preview h2 small{font:400 11px var(--sans);color:var(--ink3);margin-left:6px}
.ip-prev-root{position:relative;min-height:80px;padding:12px;border-radius:10px;background:var(--canvas);box-shadow:inset 0 0 0 1px var(--hair);font-size:12.5px;overflow:hidden}
.ip-now{margin:0 0 16px;padding:14px 16px;border-radius:14px;background:var(--panel);box-shadow:var(--shadow)}.ip-now h2{margin:0 0 8px;font:500 15px/1 var(--serif)}
.ip-now-row{display:flex;gap:10px;flex-wrap:wrap}.ip-now-row>div{flex:1 1 220px;padding:8px 10px;border-radius:9px;background:var(--canvas);box-shadow:inset 0 0 0 1px var(--hair);font-size:12.5px;color:var(--ink2)}.ip-now-row b{color:var(--ink)}
.ip-lead{margin:0 2px 14px;color:var(--ink2)}
.ip-keys{margin:0 2px 14px;font-size:11.5px;color:var(--ink3)} .ip-keys kbd{display:inline-block;min-width:18px;padding:0 5px;border-radius:4px;background:var(--raised);box-shadow:inset 0 -1.5px 0 var(--border),inset 0 0 0 1px var(--border);font:600 10.5px/17px var(--mono);text-align:center;color:var(--ink2)}
.ip-sec{margin:0 0 26px;scroll-margin-top:100px}.ip-sec h2{display:flex;align-items:baseline;gap:10px;margin:0 2px 10px;font:500 22px/28px var(--serif)}.ip-sec h2 small{font:400 12.5px var(--sans);color:var(--ink3)}
.ip-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(440px,1fr));gap:14px}@media (max-width:980px){.ip-grid{grid-template-columns:1fr}}
.ip-idea{min-width:0;display:flex;flex-direction:column;gap:10px;padding:14px 14px 10px;border-radius:14px;background:var(--panel);box-shadow:var(--shadow);scroll-margin-top:104px;transition:box-shadow .2s}
.ip-idea.picked{box-shadow:0 0 0 1.5px var(--accl),var(--shadow)}
.ip-idea.ip-cur{box-shadow:0 0 0 2px var(--acc),var(--shadow)}
.ip-idea[hidden]{display:none}
.ip-idea.ip-locked .ip-vis,.ip-idea.ip-locked .ip-ol,.ip-idea.ip-locked .ip-card-tools{opacity:.5}
.ip-idea h3{margin:0;font:600 15px/20px var(--sans);display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ip-idea header p{margin:3px 0 0;font-size:12.5px;line-height:17px;color:var(--ink3)}
.ip-tags{display:inline-flex;gap:4px}
.ip-tag{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:5px;font:600 10px/1 var(--sans);background:var(--fill);color:var(--ink2)}
.ip-tag.hi{background:var(--goodt);color:var(--good)}
.ip-tag.lo{background:var(--acct);color:var(--acc)}
.ip-need{display:inline-flex;align-items:center;gap:4px;height:18px;padding:0 7px;border-radius:5px;font:600 10px/1 var(--sans);background:var(--acct);color:var(--acc);letter-spacing:.02em}
.ip-idea:not(.ip-locked) .ip-need{background:var(--goodt);color:var(--good)}
.ip-rec{position:relative;display:inline-flex;align-items:center;height:16px;padding:0 6px;border-radius:4px;font:600 9px/1 var(--sans);letter-spacing:.04em;text-transform:uppercase;background:var(--acct);color:var(--acc);cursor:help}
.ip-rec[data-tip]::after{content:attr(data-tip);position:absolute;left:0;top:calc(100% + 6px);z-index:7;min-width:180px;max-width:260px;padding:6px 9px;border-radius:7px;background:var(--primary);color:var(--onprimary);font:400 11.5px/1.4 var(--sans);text-transform:none;letter-spacing:0;white-space:normal;opacity:0;transform:translateY(-3px);pointer-events:none;transition:opacity .15s,transform .15s}
.ip-rec[data-tip]:hover::after,.ip-rec[data-tip]:focus::after,.ip-opt:focus-visible .ip-rec[data-tip]::after{opacity:1;transform:none}
.ip-vis{position:relative;min-height:96px;padding:12px;border-radius:11px;background:var(--canvas);box-shadow:inset 0 0 0 1px var(--hair);font-size:12.5px;overflow:hidden}
.ip-hint{position:absolute;left:8px;bottom:8px;z-index:5;padding:3px 8px;border-radius:7px;background:var(--raised);box-shadow:var(--shadow);font-size:11px;color:var(--ink3);pointer-events:none}
.ip-vis.ip-has .ip-hint,.ip-vis.ip-skip .ip-hint,.ip-vis.ip-peeking .ip-hint,.ip-vis:not(.ip-has) .ip-replay,.ip-vis:not(.ip-has) .ip-dots{display:none}
.ip-vis.ip-skip>*:not(.ip-replay):not(.ip-cmp){opacity:.45}
.ip-replay{all:unset;cursor:pointer;position:absolute;right:8px;bottom:8px;z-index:5;width:24px;height:24px;border-radius:7px;display:grid;place-items:center;background:var(--raised);box-shadow:var(--shadow);color:var(--ink3);font-size:11px}
.ip-dots{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);z-index:5;display:flex;gap:6px;padding:4px 7px;border-radius:999px;background:var(--raised);box-shadow:var(--shadow)}
.ip-dots i{all:unset;cursor:pointer;width:9px;height:9px;border-radius:50%;background:var(--fill);box-shadow:inset 0 0 0 1.5px var(--border);transition:background .2s,box-shadow .2s}
.ip-dots i.f{background:var(--acc);box-shadow:none}
.ip-vis.ip-peeking{box-shadow:inset 0 0 0 1.5px var(--acc)}
.ip-peek-lbl{display:none;position:absolute;left:8px;bottom:8px;z-index:5;padding:3px 8px;border-radius:7px;background:var(--acc);color:var(--onprimary);font-size:11px;font-weight:600;pointer-events:none}
.ip-vis.ip-peeking .ip-peek-lbl{display:block}
.ip-vis.ip-peeking .ip-dots,.ip-vis.ip-peeking .ip-replay{display:none}
.ip-cmp{display:none;position:absolute;inset:0;z-index:3;background:var(--canvas)}
.ip-vis.ip-comparing .ip-cmp{display:block}
.ip-vis.ip-comparing{min-height:150px}
.ip-cmp-a .v-cur,.ip-cmp-b .v-cur{display:none}
.ip-vis.ip-comparing>.ip-body,.ip-vis.ip-comparing>.ip-hint,.ip-vis.ip-comparing>.ip-dots,.ip-vis.ip-comparing>.ip-replay{visibility:hidden}
.ip-cmp-a,.ip-cmp-b{position:absolute;top:34px;bottom:0;width:50%;padding:12px;overflow:hidden}
.ip-cmp-a{left:0;box-shadow:inset -1px 0 0 var(--hair)}.ip-cmp-b{left:50%}
.ip-cmp-top{position:absolute;left:0;right:0;top:0;height:34px;display:flex;align-items:center;gap:6px;padding:0 8px;font-size:11px;color:var(--ink3);background:var(--panel);box-shadow:inset 0 -1px 0 var(--hair);z-index:5}
.ip-cmp-top b{flex:1;text-align:center;font-weight:500;color:var(--ink2)}
.ip-sel{all:unset;box-sizing:border-box;cursor:pointer;height:22px;padding:0 20px 0 7px;border-radius:6px;background:var(--raised) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%23888'/%3E%3C/svg%3E") no-repeat right 7px center;box-shadow:inset 0 0 0 1px var(--border);font:500 11px/22px var(--sans);color:var(--ink);max-width:150px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;-webkit-appearance:none;appearance:none}
.ip-ol{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:2px}
.ip-opt{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:14px minmax(0,1fr);gap:8px;padding:6px 8px;border-radius:9px;font-size:12.5px;line-height:16px;color:var(--ink2)}
.ip-opt:hover{background:var(--fill)}.ip-opt i{width:14px;height:14px;margin-top:1px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--border)}
.ip-opt b{display:block;font-weight:500;color:var(--ink)}.ip-opt small{display:block;font-size:11.5px;color:var(--ink3)}
.ip-opt[aria-pressed="true"]{background:var(--acct)}.ip-opt[aria-pressed="true"] i{box-shadow:inset 0 0 0 4.5px var(--acc)}
.ip-opt .ip-rec{margin-left:4px;vertical-align:middle}
.ip-opt kbd{float:right;margin-left:6px;min-width:16px;padding:0 4px;border-radius:4px;background:var(--raised);box-shadow:inset 0 -1.5px 0 var(--border),inset 0 0 0 1px var(--border);font:600 9.5px/15px var(--mono);text-align:center;color:var(--ink3)}
.ip-idea-note{width:100%;min-height:34px;padding:7px 10px;border:0;border-radius:9px;background:var(--fill);font-size:12.5px;resize:vertical;outline:none}
.ip-idea-note:focus{box-shadow:inset 0 0 0 1.5px var(--accl)}
.ip-card-tools{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.ip-card-tools .ip-seg{display:none}.ip-idea.picked .ip-card-tools .ip-seg{display:inline-flex}
.ip-card-tools .ip-seg button{height:22px;font-size:11.5px}
#ip-picks{position:fixed;z-index:85;right:16px;top:96px;width:470px;max-width:calc(100vw - 32px);max-height:calc(100vh - 112px);overflow:auto;padding:12px 14px 14px;border-radius:16px;background:var(--raised);box-shadow:var(--raise);display:flex;flex-direction:column;gap:10px}
#ip-picks[hidden]{display:none}
#ip-picks pre{margin:0;padding:10px 12px;border-radius:10px;background:var(--fill);font:400 12px/1.55 var(--mono);white-space:pre-wrap}
#ip-picks textarea{min-height:60px;padding:8px 10px;border:0;border-radius:9px;background:var(--fill);font-size:13px;resize:vertical;outline:none}
#ip-picks label.ip-ck{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--ink2)}
.ip-ph{display:flex;align-items:center;font:500 18px/1 var(--serif)}.ip-ph b{flex:1;font-weight:500}.ip-ph button{all:unset;cursor:pointer;width:28px;height:28px;border-radius:8px;display:grid;place-items:center;color:var(--ink3)}
.ip-actions{display:flex;flex-wrap:wrap;gap:6px}
.ip-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:99;display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;background:var(--primary);color:var(--onprimary);font-size:13px;box-shadow:var(--raise);max-width:calc(100vw - 32px)}
.ip-toast button{all:unset;cursor:pointer;font-weight:600;color:var(--accl);padding:2px 4px;border-radius:4px}
.ip-file{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
@media (max-width:640px){ .ip-grid{grid-template-columns:1fr} #ip-picks{left:16px;right:16px;width:auto} .ip-bar h1 small{display:none} .ip-layout.has-prev{grid-template-columns:1fr} .ip-r2 [data-sort]{display:none} .ip-keys{display:none} #ip-preview{position:static;max-height:none} }
@media print{
  body{background:#fff;color:#000}
  .ip-bar .ip-seg,.ip-bar #ip-open,.ip-bar #ip-accept,.ip-r2,.ip-ol,.ip-replay,.ip-hint,.ip-dots,.ip-card-tools,.ip-idea-note,#ip-preview,.ip-cmp,.ip-keys,.ip-actions,.ip-ck{display:none!important}
  #ip-picks{position:static!important;display:flex!important;width:100%!important;max-width:none;max-height:none;box-shadow:none;border:1px solid #ccc;page-break-before:avoid}
  .ip-vis{break-inside:avoid}
  .ip-idea[hidden]{display:flex!important}
}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.ip-prog-bar i{transition:none}}

/* ---------- the drawn visuals: prefix v- · animate with [data-step], .ip-s-<step> and [data-opt] on .ip-vis ---------- */
.v-btn{display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:7px;background:var(--raised);box-shadow:inset 0 0 0 1px var(--border);font:500 12px/1 var(--sans);white-space:nowrap;transition:background .2s,color .2s}
.v-tip{position:absolute;left:12px;top:48px;padding:6px 9px;border-radius:7px;background:var(--primary);color:var(--onprimary);font-size:12px;font-weight:500;white-space:nowrap;opacity:0;transform:translateY(-4px);transition:opacity .18s,transform .18s}
.v-cur{position:absolute;left:250px;top:40px;width:14px;height:14px;z-index:6;pointer-events:none;transition:left .6s cubic-bezier(.2,.75,.25,1),top .6s cubic-bezier(.2,.75,.25,1)}
.v-cur::before{content:"";position:absolute;inset:0;clip-path:polygon(0 0,0 100%,30% 72%,52% 100%,64% 94%,44% 66%,80% 66%);background:var(--ink)}
.v-cur::after{content:"";position:absolute;left:-8px;top:-8px;width:30px;height:30px;border-radius:50%;background:var(--acc);opacity:0;transform:scale(.3)}
@keyframes v-ripple{0%{opacity:.35;transform:scale(.3)}100%{opacity:0;transform:scale(1.4)}}
[data-step="click"] .v-cur::after{animation:v-ripple .45s ease-out}
@media (prefers-reduced-motion:reduce){.v-cur,.v-tip,.v-btn,.v-delay i{transition:none!important}.v-cur::after{animation:none!important}}

/* idea "look": hover → tip → click → done; each option its own tip */
.ip-s-point .v-cur{left:52px;top:22px}                                                   /* the pointer lands on the button (12px padding + ~40px in, 10px down) */
.ip-s-show .v-tip{opacity:1;transform:none}                                              /* the tip appears and stays */
[data-step="done"] .v-btn.v-target{background:var(--primary);color:var(--onprimary)}      /* the click lands */
[data-opt="ink"] .v-tip{background:var(--primary);color:var(--onprimary)}
[data-opt="card"] .v-tip{background:var(--raised);color:var(--ink);box-shadow:var(--raise)}
[data-opt="quiet"] .v-tip{background:var(--acct);color:var(--ink);box-shadow:inset 0 0 0 1px var(--accl)}

/* idea "delay": the pointer rests, a timer fills, then the tip shows */
.v-delay{position:absolute;left:165px;top:22px;width:120px;height:6px;border-radius:3px;background:var(--fill);overflow:hidden}
.v-delay i{display:block;width:0;height:100%;background:var(--acc);transition:width .9s linear}
.v-dl{position:absolute;left:292px;top:17px;font-size:11px;color:var(--ink3)}
.v-dl::after{content:"0 ms"}
[data-opt="d300"] .v-dl::after{content:"300 ms"}[data-opt="d600"] .v-dl::after{content:"600 ms"}
.ip-s-wait .v-delay i{width:100%}
[data-opt="d0"].ip-s-wait .v-delay i{transition-duration:.05s}
[data-opt="d300"].ip-s-wait .v-delay i{transition-duration:.3s}
[data-opt="d600"].ip-s-wait .v-delay i{transition-duration:.6s}

/* the live preview: one component, styled by the picks as data-p-<idea>="<option>" on .ip-prev-root */
.ip-prev-root .v-tip{opacity:1;transform:none;position:static;display:inline-block;margin-top:8px}
.ip-prev-root[data-p-look="card"] .v-tip{background:var(--raised);color:var(--ink);box-shadow:var(--raise)}
.ip-prev-root[data-p-look="quiet"] .v-tip{background:var(--acct);color:var(--ink);box-shadow:inset 0 0 0 1px var(--accl)}
.ip-prev-root .v-pd::after{content:"shows at once"}
.ip-prev-root[data-p-delay="d300"] .v-pd::after{content:"shows after 300 ms"}
.ip-prev-root[data-p-delay="d600"] .v-pd::after{content:"shows after 600 ms"}
</style>
</head>
<body>
<header class="ip-bar">
<div class="ip-r1"><h1>Parsec <small>Tooltips · text and styling</small></h1><nav class="ip-jump" id="ip-jump"></nav>
<div class="ip-seg" role="group" aria-label="Theme"><button type="button" data-th="ivory" aria-pressed="true">Ivory</button><button type="button" data-th="graphite" aria-pressed="false">Graphite</button><button type="button" data-th="mist" aria-pressed="false">Mist</button><button type="button" data-th="obsidian" aria-pressed="false">Obsidian</button></div>
<span class="ip-warn" id="ip-warn" title="Open the console for the list"></span>
<button type="button" class="ip-btn" id="ip-accept">Accept all recommended</button>
<button type="button" class="ip-btn pri" id="ip-open">Your picks <em id="ip-n"></em></button></div>
<div class="ip-r2">
<div class="ip-prog" id="ip-prog"><div class="ip-prog-bar"><i></i></div><span id="ip-prog-lab">0 of 0 decided</span></div>
<div class="ip-tabs" role="group" aria-label="Filter"><button type="button" class="ip-chip" data-f="all" data-label="All" aria-pressed="true">All</button><button type="button" class="ip-chip" data-f="unpicked" data-label="Unpicked" aria-pressed="false">Unpicked</button><button type="button" class="ip-chip" data-f="picked" data-label="Picked" aria-pressed="false">Picked</button><button type="button" class="ip-chip" data-f="skipped" data-label="Skipped" aria-pressed="false">Skipped</button></div>
<div class="ip-tabs" role="group" aria-label="Sort"><button type="button" class="ip-chip" data-sort="author" aria-pressed="true">Author order</button><button type="button" class="ip-chip" data-sort="impact" aria-pressed="false">By impact</button><button type="button" class="ip-chip" data-sort="effort" aria-pressed="false">By effort</button></div>
</div>
</header>
<main class="ip-wrap">
<section class="ip-now"><h2>How it looks now</h2><div class="ip-now-row"><div><b>560 tooltips</b> across 41 screens, 7 styles</div><div><b>4 ways</b> to write a shortcut key: C, [C], ⌘C, Ctrl+C</div><div><b>Time Log</b> is the only screen with a styled tip</div></div></section>
<p class="ip-lead" id="ip-lead"></p>
<p class="ip-keys"><kbd>J</kbd> <kbd>K</kbd> next / previous card · <kbd>1</kbd>–<kbd>4</kbd> pick an option · <kbd>S</kbd> skip · <kbd>Z</kbd> undo · hover an option to peek at its result</p>
<div class="ip-layout" id="ip-layout">
  <div id="ip-secs"></div>
  <aside id="ip-preview" hidden></aside>
</div>
</main>
<div id="ip-picks" hidden></div>
<script>
/* ---------- the content: groups → ideas → options (Skip is added to each) ---------- */
var APP = 'Parsec', TOPIC = 'Tooltips', KEY = 'ip-parsec-tooltips';   /* KEY: unique per mock-up */
var AUTOSCROLL = true;                                                 /* after a pick, bring the next unpicked card into view */
var IDEAS = [
  { group: 'One look', items: [
    { k: 'look', t: 'One tooltip, the same everywhere', why: 'Today: the browser’s grey box on most things; the Time Log has its own.',
      pri: 'H', effort: 'S', rec: 'Ink matches the Time Log’s tip, which people already know, and needs the least CSS.',
      vis: '<span class="v-btn v-target">Copy RO number</span><span class="v-tip">Copy RO number · C</span><span class="v-cur"></span>',
      steps: [['idle', 900], ['point', 700], ['show', 1100], ['click', 500], ['done', 1400]],
      opts: [['ink', 'A · Ink', 'dark on light, light on dark'], ['card', 'B · Card', 'like the Time Log’s tip now'], ['quiet', 'C · Quiet', 'a tinted box, no shadow']] },
    { k: 'delay', t: 'How long before it shows', why: 'Right now it is instant, so tips flash while the pointer crosses the toolbar.',
      pri: 'M', effort: 'S', needs: 'look', rec: '300 ms is long enough to stop the flashing and short enough to feel immediate.',
      vis: '<span class="v-btn v-target">Copy RO number</span><span class="v-delay"><i></i></span><span class="v-dl"></span><span class="v-tip">Copy RO number · C</span><span class="v-cur"></span>',
      steps: [['idle', 900], ['point', 700], ['wait', 900], ['show', 1400]],
      opts: [['d300', 'A · 300 ms'], ['d0', 'B · At once', 'as it is today'], ['d600', 'C · 600 ms']] }
  ]}
];
/* Optional live preview of one component. The picks arrive as data-p-<idea>="<option>" on .ip-prev-root; style them in CSS. Set to null to hide the pane. */
var COMPONENT = '<span class="v-btn">Copy RO number</span><br><span class="v-tip">Copy RO number · C</span><div class="v-pd" style="margin-top:8px;font-size:11px;color:var(--ink3)"></div>';
var PREVIEW = null;                                                    /* optional: function (ctx) { ... } runs after every change; ctx = { v, conf, notes, note, th, root, mount, ideas, app, topic } */
/* ---------- the page (v3 shell) ---------- */
var D = document, $ = function (s, r) { return (r || D).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || D).querySelectorAll(s)); };
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
function flat() { var a = []; IDEAS.forEach(function (g) { g.items.forEach(function (it) { a.push(it); }); }); return a; }
function find(k) { var r = null; flat().forEach(function (it) { if (it.k === k) r = it; }); return r; }
var THEMES = ['ivory', 'graphite', 'mist', 'obsidian'], THMAP = { light: 'ivory', dark: 'graphite' };
var V = { th: 'ivory', open: false, v: {}, conf: {}, notes: {}, note: '', filter: 'all', sort: 'author', cmp: null, auto: AUTOSCROLL };
function load(d) { if (!d || typeof d !== 'object') return; if (d.v) V.v = d.v; if (d.conf) V.conf = d.conf; if (d.notes) V.notes = d.notes; if (typeof d.note === 'string') V.note = d.note; if (d.th) V.th = THMAP[d.th] || d.th; if (d.filter) V.filter = d.filter; if (d.sort) V.sort = d.sort; if (typeof d.auto === 'boolean') V.auto = d.auto; }
try { load(JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
try { var hm = (location.hash || '').match(/[#&]p=([^&]+)/); if (hm) load(JSON.parse(decodeURIComponent(hm[1]))); } catch (e) {}
if (THEMES.indexOf(V.th) < 0) V.th = 'ivory';
function save() {
  try { localStorage.setItem(KEY, JSON.stringify({ v: V.v, conf: V.conf, notes: V.notes, note: V.note, th: V.th, filter: V.filter, sort: V.sort, auto: V.auto })); } catch (e) {}
  try { var next = '#p=' + encodeURIComponent(JSON.stringify({ v: V.v, conf: V.conf, notes: V.notes, note: V.note, th: V.th })); if (location.hash !== next) history.replaceState(null, '', location.pathname + location.search + next); } catch (e) {}
}
var total = flat().length;
$('#ip-lead').textContent = total + ' idea' + (total === 1 ? '' : 's') + ' for the ' + TOPIC.replace(/^The\s+/i, '').toLowerCase() + ' — pick an option to see it play, or Skip, then copy Your picks into the chat.';
$('#ip-jump').innerHTML = IDEAS.map(function (g, i) { return '<a href="#ip-s' + i + '">' + esc(g.group) + '</a>'; }).join('');
/* ---------- cards ---------- */
function priRank(p) { return { H: 0, M: 1, L: 2 }[p] != null ? { H: 0, M: 1, L: 2 }[p] : 9; }
function effRank(e) { return { S: 0, M: 1, L: 2 }[e] != null ? { S: 0, M: 1, L: 2 }[e] : 9; }
function isPicked(k) { var v = V.v[k]; return !!v && v !== 'skip'; }
function locked(it) { return !!it.needs && !isPicked(it.needs); }
function tagHtml(it) {
  var b = [];
  if (it.pri) b.push('<span class="ip-tag' + (it.pri === 'H' ? ' hi' : it.pri === 'L' ? ' lo' : '') + '" title="Impact: ' + ({ H: 'high', M: 'medium', L: 'low' })[it.pri] + '">' + esc(it.pri) + '</span>');
  if (it.effort) b.push('<span class="ip-tag" title="Effort: ' + ({ S: 'small', M: 'medium', L: 'large' })[it.effort] + '">' + esc(it.effort) + '</span>');
  if (it.needs) { var p = find(it.needs); b.push('<span class="ip-need" data-need="' + esc(it.needs) + '">needs: ' + esc(p ? p.t : it.needs) + '</span>'); }
  return b.length ? '<span class="ip-tags">' + b.join('') + '</span>' : '';
}
function buildSecs() {
  var order = flat().slice();
  if (V.sort === 'impact') order.sort(function (a, b) { return priRank(a.pri) - priRank(b.pri) || effRank(a.effort) - effRank(b.effort); });
  else if (V.sort === 'effort') order.sort(function (a, b) { return effRank(a.effort) - effRank(b.effort) || priRank(a.pri) - priRank(b.pri); });
  $('#ip-secs').innerHTML = IDEAS.map(function (g, i) {
    var list = order.filter(function (it) { return g.items.indexOf(it) >= 0; });
    return '<section class="ip-sec" id="ip-s' + i + '"><h2>' + esc(g.group) + ' <small>' + list.length + ' idea' + (list.length !== 1 ? 's' : '') + '</small></h2><div class="ip-grid">' + list.map(function (it) {
      var o = it.opts.concat([['skip', 'Skip', '']]);
      return '<article class="ip-idea" data-k="' + it.k + '" tabindex="-1"><header><h3>' + esc(it.t) + ' ' + tagHtml(it) + '</h3><p>' + esc(it.why) + '</p></header>' +
        '<div class="ip-vis" data-step="' + (it.steps ? it.steps[0][0] : '') + '"><div class="ip-body">' + it.vis + '</div>' +
        (it.steps ? '<span class="ip-hint">Pick an option to see it play</span><span class="ip-peek-lbl"></span><span class="ip-dots" role="group" aria-label="Steps">' + it.steps.map(function (s, j) { return '<i tabindex="0" role="button" data-n="' + j + '" title="' + esc(s[0]) + '" aria-label="Jump to step ' + esc(s[0]) + '"></i>'; }).join('') + '</span><button type="button" class="ip-replay" aria-label="Play it again" title="Play it again">↻</button>' : '') +
        '<div class="ip-cmp" aria-hidden="true"><div class="ip-cmp-top"><select class="ip-sel" data-side="a" aria-label="Left side"></select><b>vs</b><select class="ip-sel" data-side="b" aria-label="Right side"></select></div><div class="ip-cmp-a"></div><div class="ip-cmp-b"></div></div></div>' +
        '<div class="ip-ol">' + o.map(function (x, xi) {
          var rec = (xi === 0 && x[0] !== 'skip') ? ' <span class="ip-rec" tabindex="0"' + (it.rec ? ' data-tip="' + esc(it.rec) + '" title="' + esc(it.rec) + '"' : '') + '>Recommended</span>' : '';
          var key = x[0] === 'skip' ? 'S' : (xi < 4 ? String(xi + 1) : '');
          return '<button type="button" class="ip-opt" data-k="' + it.k + '" data-v="' + x[0] + '" aria-pressed="false"><i></i><span><b>' + (key ? '<kbd>' + key + '</kbd>' : '') + esc(x[1]) + rec + '</b>' + (x[2] ? '<small>' + esc(x[2]) + '</small>' : '') + '</span></button>';
        }).join('') + '</div>' +
        '<div class="ip-card-tools"><button type="button" class="ip-btn" data-cmp="' + it.k + '">Compare</button><div class="ip-seg" role="group" aria-label="How sure"><button type="button" data-conf="sure" data-k="' + it.k + '" aria-pressed="true">Sure</button><button type="button" data-conf="leaning" data-k="' + it.k + '" aria-pressed="false">Leaning</button></div></div>' +
        '<textarea class="ip-idea-note" data-nk="' + it.k + '" placeholder="Note for this idea (optional)">' + esc(V.notes[it.k] || '') + '</textarea></article>';
    }).join('') + '</div></section>';
  }).join('');
}
/* ---------- the animations: still until you pick — then that option plays once and holds (↻ replays, dots jump to a step) ---------- */
var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function mark(vis, it, n) { if (!it.steps) return; vis._n = n; it.steps.forEach(function (s, j) { vis.classList.toggle('ip-s-' + s[0], j <= n); }); vis.dataset.step = it.steps[n][0]; $$('.ip-dots i', vis).forEach(function (d, j) { d.classList.toggle('f', j <= n); }); }
function rest(vis, it, end) { clearTimeout(vis._t); vis._playing = false; if (it.steps) mark(vis, it, end ? it.steps.length - 1 : 0); }
function play(vis, it) {
  clearTimeout(vis._t); if (!it.steps) return;
  if (RM) { rest(vis, it, 1); return; }
  vis._playing = true; var i = 0;
  (function next() { var s = it.steps[i]; mark(vis, it, i); i++; if (i < it.steps.length) vis._t = setTimeout(next, s[1]); else vis._playing = false; })();
}
function setOpt(vis, v) { if (v && v !== 'skip') vis.dataset.opt = v; else delete vis.dataset.opt; vis.classList.toggle('ip-has', !!v && v !== 'skip'); vis.classList.toggle('ip-skip', v === 'skip'); }
function visOf(k) { return $('.ip-idea[data-k="' + k + '"] .ip-vis'); }
function restoreVis(k) { var vis = visOf(k), it = find(k), v = V.v[k]; if (!vis) return; vis.classList.remove('ip-peeking'); setOpt(vis, v); rest(vis, it, isPicked(k)); }
function restoreAll() { flat().forEach(function (it) { restoreVis(it.k); }); }
/* peek: hover an option for a moment and its end state shows as a ghost; leave and the real state returns */
var HOVER = window.matchMedia && matchMedia('(hover: hover)').matches, peekT = null;
function peek(k, v) {
  var vis = visOf(k), it = find(k); if (!vis || !it.steps || vis._playing || vis.classList.contains('ip-comparing') || V.v[k] === v) return;
  vis.classList.add('ip-peeking'); setOpt(vis, v); mark(vis, it, it.steps.length - 1);
  var o = it.opts.filter(function (x) { return x[0] === v; })[0]; $('.ip-peek-lbl', vis).textContent = 'peek · ' + (o ? o[1] : v);
}
/* ---------- the picks text ---------- */
function optLabel(it, v) { if (v === 'skip') return 'skip'; var o = it.opts.filter(function (x) { return x[0] === v; })[0]; return o ? o[1] : v; }
function sizeLine() {
  var c = { S: 0, M: 0, L: 0 }, un = 0;
  flat().forEach(function (it) { if (!isPicked(it.k)) return; if (c[it.effort] != null) c[it.effort]++; else un++; });
  if (!c.S && !c.M && !c.L) return '';
  var verdict = (c.L >= 1 || c.M >= 3) ? 'a bigger build' : (c.M >= 1 ? 'a medium build' : 'a small build');
  return 'Build size: ' + c.S + ' S · ' + c.M + ' M · ' + c.L + ' L → ' + verdict + (un ? ' (' + un + ' untagged)' : '');
}
function checklist() { var L = []; flat().forEach(function (it) { if (isPicked(it.k)) L.push((L.length + 1) + '. ' + it.t + ' → ' + optLabel(it, V.v[it.k])); }); return L; }
function pkText() {
  var L = [APP + ' · ' + TOPIC + ' — my picks'];
  IDEAS.forEach(function (g) {
    var rows = [];
    g.items.forEach(function (it) {
      var v = V.v[it.k]; if (!v) return;
      var extra = [];
      if (v !== 'skip' && V.conf[it.k] === 'leaning') extra.push('leaning');
      if (v !== 'skip' && locked(it)) { var p = find(it.needs); extra.push('needs ' + (p ? p.t : it.needs) + ' — not picked'); }
      rows.push('· ' + it.t + ': ' + optLabel(it, v) + (extra.length ? ' (' + extra.join('; ') + ')' : ''));
      var n = (V.notes[it.k] || '').trim(); if (n) rows.push('  note: ' + n);
    });
    if (rows.length) { L.push(g.group + ':'); L = L.concat(rows); }
  });
  var left = total - Object.keys(V.v).length; if (left) L.push('(not picked yet: ' + left + ')');
  if (V.note.trim()) L.push('Notes: ' + V.note.trim());
  var sz = sizeLine(); if (sz) L.push(sz);
  var cl = checklist(); if (cl.length) { L.push(''); L.push('Build checklist:'); L = L.concat(cl); }
  return L.join('\n');
}
/* ---------- state → screen ---------- */
function counts() { var u = 0, p = 0, s = 0; flat().forEach(function (it) { var v = V.v[it.k]; if (!v) u++; else if (v === 'skip') s++; else p++; }); return { u: u, p: p, s: s, n: p + s }; }
function visible(it) { var v = V.v[it.k]; return V.filter === 'all' || (V.filter === 'unpicked' && !v) || (V.filter === 'picked' && isPicked(it.k)) || (V.filter === 'skipped' && v === 'skip'); }
function renderPreview() {
  var m = $('#ip-preview'), has = (typeof COMPONENT === 'string' && COMPONENT) || typeof PREVIEW === 'function';
  m.hidden = !has; $('.ip-layout').classList.toggle('has-prev', has); if (!has) return;
  var root = $('.ip-prev-root', m);
  if (!root) { m.innerHTML = '<h2>Live preview<small>updates with every pick</small></h2><div class="ip-prev-root">' + (typeof COMPONENT === 'string' ? COMPONENT : '') + '</div>'; root = $('.ip-prev-root', m); }
  flat().forEach(function (it) { var v = V.v[it.k]; if (isPicked(it.k)) root.setAttribute('data-p-' + it.k, v); else root.removeAttribute('data-p-' + it.k); });
  if (typeof PREVIEW === 'function') { try { PREVIEW({ v: V.v, conf: V.conf, notes: V.notes, note: V.note, th: V.th, root: root, mount: m, ideas: IDEAS, app: APP, topic: TOPIC }); } catch (e) { root.innerHTML = '<p style="margin:0;color:var(--ink3);font-size:12px">Preview unavailable: ' + esc(e.message) + '</p>'; } }
}
function sync() {
  D.documentElement.setAttribute('data-th', V.th);
  $$('.ip-bar .ip-seg button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.th === V.th)); });
  $$('.ip-opt').forEach(function (b) { b.setAttribute('aria-pressed', String(V.v[b.dataset.k] === b.dataset.v)); });
  $$('[data-conf]').forEach(function (b) { b.setAttribute('aria-pressed', String((V.conf[b.dataset.k] || 'sure') === b.dataset.conf)); });
  $$('.ip-idea').forEach(function (a) { var it = find(a.dataset.k); a.classList.toggle('picked', isPicked(a.dataset.k)); a.classList.toggle('ip-locked', locked(it)); a.hidden = !visible(it); });
  var c = counts(); $('#ip-n').textContent = c.n ? c.n + '/' + total : '';
  $('.ip-prog-bar i').style.width = Math.round((c.n / total) * 100) + '%'; $('#ip-prog-lab').textContent = c.n + ' of ' + total + ' decided';
  $$('[data-f]').forEach(function (b) { var f = b.dataset.f; b.textContent = b.dataset.label + ' ' + (f === 'all' ? total : f === 'unpicked' ? c.u : f === 'picked' ? c.p : c.s); b.setAttribute('aria-pressed', String(V.filter === f)); });
  $$('[data-sort]').forEach(function (b) { b.setAttribute('aria-pressed', String(V.sort === b.dataset.sort)); });
  renderPreview();
}
/* ---------- the current card (keyboard) and auto-scroll ---------- */
var curK = null;
function setCur(k, scroll) { curK = k; $$('.ip-idea').forEach(function (a) { a.classList.toggle('ip-cur', a.dataset.k === k); }); if (scroll && k) { var a = $('.ip-idea[data-k="' + k + '"]'); if (a) a.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' }); } }
function shown() { return $$('.ip-idea').filter(function (a) { return !a.hidden; }).map(function (a) { return a.dataset.k; }); }
function move(d) { var ks = shown(); if (!ks.length) return; var i = ks.indexOf(curK); i = i < 0 ? (d > 0 ? 0 : ks.length - 1) : Math.max(0, Math.min(ks.length - 1, i + d)); setCur(ks[i], true); }
function nextUnpicked(fromK) { var ks = shown(), i = ks.indexOf(fromK); for (var j = i + 1; j < ks.length; j++) if (!V.v[ks[j]]) return ks[j]; return null; }
/* ---------- undo ---------- */
var HIST = [];
function snap() { HIST.push(JSON.stringify({ v: V.v, conf: V.conf })); if (HIST.length > 60) HIST.shift(); }
function undo() { if (!HIST.length) { toast('Nothing to undo'); return; } var s = JSON.parse(HIST.pop()); V.v = s.v; V.conf = s.conf; save(); restoreAll(); sync(); draw(); toast('Undone'); }
/* ---------- compare: any two options, side by side at their end state ---------- */
function openCmp(k, a, b) {
  var it = find(k), vis = visOf(k); if (!it || it.opts.length < 2 || !vis) return;
  $$('.ip-vis.ip-comparing').forEach(function (x) { if (x !== vis) x.classList.remove('ip-comparing'); });
  a = a || it.opts[0][0]; b = b || it.opts[1][0];
  $$('.ip-sel', vis).forEach(function (s) { s.innerHTML = it.opts.map(function (x) { return '<option value="' + x[0] + '">' + esc(x[1]) + '</option>'; }).join(''); s.value = s.dataset.side === 'a' ? a : b; });
  var A = $('.ip-cmp-a', vis), B = $('.ip-cmp-b', vis), body = $('.ip-body', vis).innerHTML;
  [[A, a], [B, b]].forEach(function (p) { p[0].innerHTML = body; p[0].dataset.opt = p[1]; p[0].className = p[0].className.replace(/\bip-s-\S+/g, '').trim(); if (it.steps) { it.steps.forEach(function (s) { p[0].classList.add('ip-s-' + s[0]); }); p[0].dataset.step = it.steps[it.steps.length - 1][0]; } });
  V.cmp = { k: k, a: a, b: b }; vis.classList.add('ip-comparing');
}
/* ---------- Your picks panel ---------- */
function draw() {
  var w = $('#ip-picks'); w.hidden = !V.open; if (!V.open) return;
  var ta = $('#ip-note'); if (ta && D.activeElement === ta) { $('#ip-picks pre').textContent = pkText(); return; }
  w.innerHTML = '<div class="ip-ph"><b>Your picks</b><button type="button" data-pk="x" aria-label="Close">✕</button></div><pre>' + esc(pkText()) + '</pre>' +
    '<label style="display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:600;color:var(--ink2)">Anything else<textarea id="ip-note" placeholder="Anything to add or change">' + esc(V.note) + '</textarea></label>' +
    '<label class="ip-ck"><input type="checkbox" id="ip-auto"' + (V.auto ? ' checked' : '') + '> Scroll to the next unpicked card after each pick</label>' +
    '<div class="ip-actions"><button type="button" class="ip-btn pri" data-pk="copy" style="justify-content:center;height:34px;flex:1 1 100%">Copy for the chat</button>' +
    '<button type="button" class="ip-btn" data-pk="dl">Download .json</button><button type="button" class="ip-btn" data-pk="up">Import .json</button><button type="button" class="ip-btn" data-pk="pdf">PDF / Print</button><button type="button" class="ip-btn" data-pk="reset" style="margin-left:auto;color:var(--bad)">Reset all</button></div>' +
    '<input type="file" class="ip-file" id="ip-file" accept="application/json,.json">';
}
function toast(m, act) { var t = $('.ip-toast'); if (t) t.remove(); t = D.createElement('div'); t.className = 'ip-toast'; t.innerHTML = '<span>' + esc(m) + '</span>' + (act ? '<button type="button">' + esc(act.label) + '</button>' : ''); if (act) $('button', t).onclick = function () { t.remove(); act.fn(); }; D.body.appendChild(t); clearTimeout(toast.h); toast.h = setTimeout(function () { t.remove(); }, act ? 5000 : 2600); }
function copy(tx) {
  var fb = function () { var ta = D.createElement('textarea'); ta.value = tx; D.body.appendChild(ta); ta.select(); try { D.execCommand('copy'); toast('Copied — paste it in the chat.'); } catch (e) { toast('Select the text and copy it.'); } ta.remove(); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(tx).then(function () { toast('Copied — paste it in the chat.'); }, fb); else fb();
}
function downloadJson() { var blob = new Blob([JSON.stringify({ app: APP, topic: TOPIC, key: KEY, v: V.v, conf: V.conf, notes: V.notes, note: V.note, th: V.th }, null, 2)], { type: 'application/json' }); var a = D.createElement('a'); a.href = URL.createObjectURL(blob); a.download = KEY + '.json'; D.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 500); toast('Downloaded ' + KEY + '.json'); }
function importJson(file) { var r = new FileReader(); r.onload = function () { try { snap(); load(JSON.parse(String(r.result || '{}'))); save(); restoreAll(); sync(); draw(); toast('Imported picks', { label: 'Undo', fn: undo }); } catch (e) { toast('Could not read that .json'); } }; r.readAsText(file); }
/* ---------- changes ---------- */
function setPick(k, v) {
  var it = find(k), vis = visOf(k), was = V.v[k]; snap();
  if (was === v) { delete V.v[k]; delete V.conf[k]; } else V.v[k] = v;
  save(); sync(); draw(); setCur(k, false);
  vis.classList.remove('ip-comparing'); vis.classList.remove('ip-peeking'); setOpt(vis, V.v[k]);
  if (isPicked(k)) play(vis, it); else rest(vis, it, 0);
  flat().forEach(function (x) { if (x.needs === k) restoreVis(x.k); });
  if (V.v[k]) { var lbl = optLabel(it, V.v[k]); toast((V.v[k] === 'skip' ? 'Skipped ' : 'Picked ') + it.t.replace(/^(.{34}).+/, '$1…') + (V.v[k] === 'skip' ? '' : ' → ' + lbl), { label: 'Undo', fn: undo }); }
  if (V.v[k] && V.auto) { var n = nextUnpicked(k); if (n) setTimeout(function () { setCur(n, true); }, 350); }
}
function acceptAll() { snap(); var n = 0; flat().forEach(function (it) { if (!V.v[it.k] && it.opts.length) { V.v[it.k] = it.opts[0][0]; n++; } }); save(); restoreAll(); sync(); draw(); toast(n ? 'Accepted ' + n + ' recommended' : 'Nothing left to fill', n ? { label: 'Undo', fn: undo } : null); }
function resetAll() { var n = Object.keys(V.v).length; if (!n) { toast('Nothing to reset'); return; } snap(); V.v = {}; V.conf = {}; save(); restoreAll(); sync(); draw(); toast('Cleared ' + n + ' pick' + (n === 1 ? '' : 's'), { label: 'Undo', fn: undo }); }
D.addEventListener('click', function (ev) {
  var t = ev.target, b;
  if ((b = t.closest('.ip-bar .ip-seg button'))) { V.th = b.dataset.th; save(); sync(); return; }
  if (t.closest('#ip-open')) { V.open = !V.open; draw(); return; }
  if (t.closest('#ip-accept')) { acceptAll(); return; }
  if (t.closest('#ip-warn')) { toast(t.closest('#ip-warn').dataset.msg || ''); return; }
  if ((b = t.closest('[data-f]'))) { V.filter = b.dataset.f; save(); sync(); return; }
  if ((b = t.closest('[data-sort]'))) { V.sort = b.dataset.sort; save(); var c = V.cmp; buildSecs(); restoreAll(); sync(); if (c) openCmp(c.k, c.a, c.b); setCur(curK, false); return; }
  if ((b = t.closest('[data-cmp]'))) { var vis = visOf(b.dataset.cmp); if (vis.classList.contains('ip-comparing')) { vis.classList.remove('ip-comparing'); V.cmp = null; } else openCmp(b.dataset.cmp); return; }
  if ((b = t.closest('[data-conf]'))) { snap(); V.conf[b.dataset.k] = b.dataset.conf; save(); sync(); draw(); return; }
  if ((b = t.closest('[data-pk]'))) { var a = b.dataset.pk; if (a === 'x') { V.open = false; draw(); } else if (a === 'copy') copy(pkText()); else if (a === 'dl') downloadJson(); else if (a === 'up') $('#ip-file').click(); else if (a === 'pdf') setTimeout(function () { window.print(); }, 50); else if (a === 'reset') resetAll(); return; }
  if ((b = t.closest('.ip-replay'))) { var vs = b.closest('.ip-vis'); play(vs, find(vs.closest('.ip-idea').dataset.k)); return; }
  if ((b = t.closest('.ip-dots i'))) { var vz = b.closest('.ip-vis'); clearTimeout(vz._t); vz._playing = false; mark(vz, find(vz.closest('.ip-idea').dataset.k), +b.dataset.n); return; }
  if ((b = t.closest('.ip-opt'))) { setPick(b.dataset.k, b.dataset.v); return; }
  if ((b = t.closest('.ip-idea'))) setCur(b.dataset.k, false);
});
D.addEventListener('change', function (ev) {
  var t = ev.target;
  if (t.id === 'ip-file' && t.files && t.files[0]) { importJson(t.files[0]); t.value = ''; }
  if (t.id === 'ip-auto') { V.auto = t.checked; save(); }
  if (t.classList.contains('ip-sel')) { var vis = t.closest('.ip-vis'), k = vis.closest('.ip-idea').dataset.k, a = $('.ip-sel[data-side="a"]', vis).value, b = $('.ip-sel[data-side="b"]', vis).value; openCmp(k, a, b); }
});
D.addEventListener('input', function (ev) {
  var t = ev.target;
  if (t.id === 'ip-note') { V.note = t.value; save(); $('#ip-picks pre').textContent = pkText(); renderPreview(); }
  if (t.classList.contains('ip-idea-note')) { V.notes[t.dataset.nk] = t.value; save(); renderPreview(); if (V.open) $('#ip-picks pre').textContent = pkText(); }
});
if (HOVER) {
  D.addEventListener('mouseover', function (ev) { var b = ev.target.closest('.ip-opt'); if (!b || b.dataset.v === 'skip') return; clearTimeout(peekT); peekT = setTimeout(function () { peek(b.dataset.k, b.dataset.v); }, 450); });
  D.addEventListener('mouseout', function (ev) { var b = ev.target.closest('.ip-opt'); if (!b || (ev.relatedTarget && ev.relatedTarget.closest && ev.relatedTarget.closest('.ip-opt') === b)) return; clearTimeout(peekT); var vis = visOf(b.dataset.k); if (vis && vis.classList.contains('ip-peeking')) restoreVis(b.dataset.k); });
}
D.addEventListener('keydown', function (ev) {
  if (ev.key === 'Escape') { if (V.open) { V.open = false; draw(); } return; }
  var tag = (ev.target.tagName || '').toLowerCase(); if (tag === 'input' || tag === 'textarea' || tag === 'select' || ev.metaKey || ev.ctrlKey || ev.altKey) return;
  var key = ev.key.toLowerCase();
  if (key === 'j' || key === 'arrowdown') { move(1); ev.preventDefault(); return; }
  if (key === 'k' || key === 'arrowup') { move(-1); ev.preventDefault(); return; }
  if (key === 'z') { undo(); return; }
  if (!curK) { if (/^[1-4s]$/.test(key)) { move(1); } else return; }
  var it = find(curK); if (!it) return;
  if (key === 's') { setPick(curK, 'skip'); ev.preventDefault(); return; }
  if (/^[1-4]$/.test(key)) { var o = it.opts[+key - 1]; if (o) setPick(curK, o[0]); ev.preventDefault(); }
});
/* ---------- the accuracy check: every option and step named in IDEAS should have a CSS rule ---------- */
function ipCheck() {
  var css = ''; try { $$('style').forEach(function (s) { css += s.textContent; }); } catch (e) {}
  var out = [];
  flat().forEach(function (it) {
    it.opts.forEach(function (o) { if (css.indexOf('[data-opt="' + o[0] + '"]') < 0) out.push(it.k + ': option "' + o[0] + '" has no [data-opt="' + o[0] + '"] rule (it will look like the others)'); });
    (it.steps || []).forEach(function (s, j) { if (j && css.indexOf('.ip-s-' + s[0]) < 0 && css.indexOf('[data-step="' + s[0] + '"]') < 0) out.push(it.k + ': step "' + s[0] + '" has no .ip-s-' + s[0] + ' or [data-step="' + s[0] + '"] rule (nothing will change)'); });
    if (it.steps) { var ms = it.steps.reduce(function (a, s) { return a + s[1]; }, 0); if (ms < 2500 || ms > 7000) out.push(it.k + ': sequence runs ' + ms + ' ms (aim for 3–6 s)'); }
    if (it.needs && !find(it.needs)) out.push(it.k + ': needs "' + it.needs + '" which is not an idea');
    (it.vis.match(/class="[^"]*"/g) || []).forEach(function (c) { c.slice(7, -1).split(/\s+/).forEach(function (n) { if (n && !/^(v-|ip-)/.test(n)) out.push(it.k + ': class "' + n + '" in the visual is not prefixed v-'); }); });
  });
  var w = $('#ip-warn'); if (out.length && /check/.test(location.search)) { w.style.display = 'inline-flex'; w.textContent = out.length + ' to fix'; w.dataset.msg = out[0]; }
  if (out.length) console.warn('Idea picker check:\n' + out.join('\n')); else console.info('Idea picker check: every option and step has a rule.');
  return out;
}
/* ---------- go ---------- */
buildSecs(); restoreAll(); sync(); ipCheck();
</script>
</body>
</html>
```