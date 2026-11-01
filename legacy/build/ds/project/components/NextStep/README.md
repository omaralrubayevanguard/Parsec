# NextStep

One sentence that says what the RO needs next, and the one or two buttons that do it — the first thing in the RO details pane, above Schedule.

`accent-tint` card with an `accent-line` edge, `radius-lg`; a small header (“Next” in `accent-text`, the operation it is about in `ink-2`), the sentence in 13.5px 500, then full-width buttons — at most one accent. Write the reason first, then the instruction: “Operation 2 isn't approved yet — send the estimate.”

Pressing an action moves the card on to the next step (Estimate sent → waiting on approval → order the part → nothing waiting); the new text slides in 4px and fades up in 280ms, and the change shows a Toast with Undo. When nothing is waiting the card turns quiet (`hairline` outline, no tint) and says so. Provide: the current step's sentence, its actions, the operation it is about.
