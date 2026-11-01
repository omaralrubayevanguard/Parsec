Parsec Mobile 3 — the phone app for technicians

Putting it on Netlify (about two minutes, no installs):
1. Go to app.netlify.com/drop and drag THIS WHOLE FOLDER onto the page.
2. Netlify gives you an address like https://something.netlify.app — open it on the phone.
   (You can rename it under Site settings, e.g. parsec-yourshop.netlify.app.)
3. iPhone: Share > Add to Home Screen.  Android: the menu > Install app.
4. Open it from the home screen. It works with no signal after the first open.

What stays where: nothing in this folder talks to a server. Jobs, time and photos live on the phone
and move to the computer only by QR codes (Settings > Parsec Mobile on the computer).
The camera only starts on an https address, which is why it needs Netlify (or another https host).

To update later: drag the new folder onto the same site (Deploys > drag and drop).
The phone picks it up the next time it opens with signal.
