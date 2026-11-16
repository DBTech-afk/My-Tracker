NUTRITRACK — INSTALLABLE FOOD & WEIGHT TRACKER

WHAT'S INCLUDED
- Mobile-first responsive web app, designed for phone and desktop.
- Installable PWA shell (manifest + service worker).
- Food diary with breakfast, lunch, dinner and snacks.
- Starter food list and online Open Food Facts product search.
- Manual food entry with calories, sugar, sodium, protein, carbs and fat.
- Weight history, target weight, daily nutrition goals.
- Trend charts for weight, calories, sugar and sodium.
- CSV export and JSON backup/restore.
- Local browser storage; the app works offline after first load (online food search requires internet).

IMPORTANT DATA NOTE
Your entries are stored locally in the browser on the device where you use the app. They are not automatically synced between your phone and computer. Use Download backup / Import backup to move data between devices. Keep regular backups.

HOW TO RUN / INSTALL
This is a Progressive Web App (PWA). PWAs need to be served from HTTPS (or localhost); opening index.html directly as a file will not enable installation/offline caching.

Easiest option:
1. Upload the contents of this folder to a static HTTPS host such as GitHub Pages, Netlify, or Cloudflare Pages.
2. Open the hosted address in Chrome on Android.
3. Open Chrome's menu (⋮) and choose "Install app" or "Add to Home screen".
4. On a computer, open the same HTTPS address in Chrome or Edge and use the install icon in the address bar/menu.

LOCAL TESTING
If you have Python installed, open a terminal in this folder and run:
  python -m http.server 8000
Then visit http://localhost:8000

FOOD DATABASE
Online search uses the Open Food Facts public search endpoint. Product nutrition values may be incomplete or user-submitted. The displayed values are per the product's reported 100 g / 100 ml basis where provided, so check the serving description and adjust carefully. Manual entry is available for exact package labels and restaurant meals.

HEALTH DISCLAIMER
This is a personal logging tool, not a medical device or medical advice. Goals are starter defaults only; choose appropriate targets with a qualified healthcare professional.
