NUTRITRACK — INSTALLABLE FOOD & WEIGHT TRACKER

WHAT'S INCLUDED
- Mobile-first responsive web app, designed for phone and desktop.
- Installable PWA shell (manifest + service worker + 192px/512px PNG icons, including maskable icon).
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

VERSION 2.0 ADDITIONS
- Barcode lookup through Open Food Facts using Android camera when BarcodeDetector is supported.
- Manual barcode entry fallback for devices without native barcode detection.
- Serving multiplier when adding foods from search, barcode lookup, and favorites.
- Save logged foods using ☆ Save; reuse them from Favorites.
- Favorites can be removed and re-added with a chosen serving multiplier.
Camera permission is requested only when Scan barcode is tapped. Barcode numbers are sent to Open Food Facts for product lookup. If camera scanning is unsupported, use Enter barcode.

NUTRITRACK 2.2 BARCODE SCANNER UPDATE
- Replaces reliance on the browser-native BarcodeDetector API with html5-qrcode.
- Scanner library is loaded only when Scan barcode is tapped.
- Uses the rear camera where the browser exposes camera labels, and falls back to the last available camera.
- Supports common EAN/UPC product barcode formats through the scanner library.
- Requires HTTPS, camera permission, and internet access to load the scanner library and look up product nutrition.
- Manual barcode entry remains available as a fallback.
