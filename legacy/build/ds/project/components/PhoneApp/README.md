# PhoneApp

Parsec Mobile — the technician's phone app, built from the same tokens and components as the desktop. One HTML file that works with no signal; ROs come from Parsec on the computer and changes go back to it by QR codes.

**Screens.** A four-tab bar — Today · ROs · Sync · Me — with a count on Sync for changes waiting to go. **Today** lists your operations across every RO (Ready to work, then Waiting) under a shift card with the DayStrip. **RO** is the desktop RO page in one column: eyebrow, serif customer, status, the Time · Parts · Files tiles (each opens a sheet), the stage line (seven ticks), the NextStep card, operations, details. **Operation** is where the work happens: the TimeCard at phone size, Parts · Time · Notes · Files tabs, and an action bar — Photo, Note (hold to dictate), Start / Stop clock.

**Moves.** The ClockBar follows you. Swipe a job or operation left to start its clock, a part left to mark it Received; long-press a row for its full menu. Menus and dialogs become bottom sheets: 52px rows, a grab handle, swipe down or tap outside to close. Stopping the clock asks why, in one tap. Photos go straight into the operation's Files (or the RO's Dash photo / DTC / Picture), shrunk to 1600px on capture, and tick the matching close-out step. Dictated notes get the date and time stamp, like Enter on the desktop. Every change shows a Toast with Undo.

**Rules.** Text 15px (17.5px in **Bay mode**, which also makes targets 54px+ and labels `ink-2` — for gloves and bright bays); inputs 16px so the phone never zooms; targets at least 44px; safe areas respected; tabular figures for every number. Theme follows the phone's dark mode unless set in Me. One accent per screen: the running clock, the current stage, or the one action the Next card asks for.

**Sync.** Same QR loop as the desktop (TQ1 frames). Send to computer shows the codes with a progress ring and keeps the screen awake; Get from computer reads the computer's codes, and the computer's reply confirms what it took. Changes stay on the phone, marked Sent / Not taken, until confirmed. Photos travel separately (share to the RO folder).

Provide: the ROs from the computer (Phone sync → Send to phone).
