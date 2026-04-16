# XCTracer Buddy Manager

A fully client-side installable PWA for managing [XCTracer Maxx](https://www.xctracer.com/) variometer buddy lists.

Works offline, installs as a home screen app (PWA), stores all data locally in your browser.

## Features

- Import/export `BuddyList.txt` in the format used by XCTracer Maxx
- Manage an address book of contacts (name + RadioID / FANET+ address)
- Compose up to 50 buddy slots for a flight
- Drag-to-reorder or use ↑↓ buttons
- Conflict resolution when importing contacts that already exist
- Works fully offline after first load

## Local Development

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Build & Deploy

### Netlify

Just connect the repo — `netlify.toml` is already configured.

### GitHub Pages

Push to `main` — the `.github/workflows/deploy.yml` workflow will build and deploy automatically. Enable GitHub Pages in repo Settings → Pages → Source: GitHub Actions.

### Manual

```bash
npm run generate
# Serve .output/public/ with any static file server
```

## Device Instructions

1. Use the app to build your buddy list
2. Click **Download BuddyList.txt**
3. Copy `BuddyList.txt` to your XCTracer Maxx SD card in the `/XCTRACER/` folder
4. Safely eject the SD card and insert it into the device
5. Restart the XCTracer Maxx — it will load the new buddy list on boot
