Parsec Mobile — files for putting it on your phone's home screen

Easiest: open "Parsec Mobile.html" on the phone. Everything works, except the camera for QR sync,
which phones only allow on a web address that starts with https.

For the full app (QR sync camera, home-screen icon, opens with no signal):
1. Put this whole folder on any https web host you're allowed to use (a personal GitHub Pages site,
   Netlify Drop, or your company's intranet if IT allows it). Nothing in it talks to a server.
2. On the phone, open the folder's address (…/index.html).
3. iPhone: Share → Add to Home Screen.  Android: ⋮ → Install app (or Add to Home screen).
4. Your ROs, time and photos stay on the phone. They move to the computer only by QR codes.

To update: replace index.html (and bump the version at the top of sw.js so phones fetch the new copy).
