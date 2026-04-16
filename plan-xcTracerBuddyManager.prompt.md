# Plan: XCTracer Buddy Manager PWA

> **Status: Implemented.** This file is the original planning document.
> For the current authoritative handoff context (architecture, gotchas, state of the app), see **[`AGENTS.md`](./AGENTS.md)**.

A fully client-side PWA that manages the `BuddyList.txt` file for XCTracer Maxx variometers (v1/v2/v3). Users can maintain a permanent address book of contacts and compose a device-ready buddy list of up to 50 slots. All state persists in `localStorage`. No backend, no auth.

---

## File Format Spec

```
# Buddy List
<blank line>
BuddyNName=VALUE
BuddyNRadioID=VALUE
<blank line>
... × 50 slots
```

- Header: `# Buddy List` followed by a blank line
- Slots are 1-indexed (`Buddy1` … `Buddy50`)
- Each slot: two consecutive lines (`BuddyNName=` then `BuddyNRadioID=`), followed by a blank line
- Empty slots have empty values (`BuddyNName=\nBuddyNRadioID=\n`)
- RadioID: 6-char uppercase hex string (FANET+ address, e.g. `20273C`)
- ⚠️ The sample file has a known typo on slot 1 (`Buddy2RadioID` instead of `Buddy1RadioID`). The parser must handle this gracefully: parse by line order within the slot block, not by the prefix number.

---

## Data Models

```ts
interface BuddySlot {
  slot: number       // 1–50, fixed position
  name: string       // max ~16 chars (device limit — TBC)
  radioId: string    // 6-char uppercase hex, may be empty
}

interface Contact {
  id: string         // uuid, internal only
  name: string
  radioId: string
}
```

**localStorage keys:**
- `xctracer-buddies` — `BuddySlot[]` (always 50 elements)
- `xctracer-contacts` — `Contact[]`

---

## Tech Stack

- **Nuxt 3** in SPA mode (`ssr: false`) — zero server, static deploy (Netlify/Vercel/GitHub Pages)
- **@nuxt/ui v3** — component library (tables, modals, inputs, buttons, toasts)
- **@vite-pwa/nuxt** — PWA manifest + service worker (installable, offline-capable)
- **@vueuse/core** — `useLocalStorage`, drag-and-drop helpers
- **@vueuse/integrations** + `sortablejs` — drag-to-reorder in buddy list

---

## Implementation Plan

### Phase 1 — Project Scaffold

1. Init Nuxt 3 project: `npx nuxi init xctracer-buddy`
2. Install dependencies: `@nuxt/ui`, `@vite-pwa/nuxt`, `@vueuse/core`, `sortablejs`
3. Configure `nuxt.config.ts`:
   - `ssr: false`
   - Add `@nuxt/ui` and `@vite-pwa/nuxt` modules
   - PWA manifest: name, short_name, icons, theme_color, display: standalone
4. Set up basic layout: full-width, responsive side-by-side panels (CSS Grid / `UContainer`)

### Phase 2 — Core Composables (no UI yet)

5. `composables/useBuddyList.ts`
   - `buddies` ref backed by `useLocalStorage('xctracer-buddies', defaultSlots())`
   - `defaultSlots()`: returns array of 50 empty `BuddySlot` objects
   - Methods: `updateSlot(slot, patch)`, `clearSlot(slot)`, `swapSlots(a, b)`, `moveSlot(from, to)`
   - `exportTxt(): string` — serializes to exact `BuddyList.txt` format

6. `composables/useContacts.ts`
   - `contacts` ref backed by `useLocalStorage('xctracer-contacts', [])`
   - Methods: `addContact(name, radioId)`, `updateContact(id, patch)`, `removeContact(id)`
   - `exportTxt(): string` — exports contacts as a BuddyList (slots filled in order, empty slots padded to 50)

7. `composables/useBuddyListParser.ts`
   - `parseBuddyListTxt(text: string): ParsedBuddy[]`
   - Parses by regex group (slot block), NOT by prefix number (handles the typo)
   - Returns array of `{ slot, name, radioId }` (empty slots included)

8. `composables/useFileIO.ts`
   - `downloadTxt(filename, content)` — triggers browser download
   - `readUploadedFile(file: File): Promise<string>` — FileReader wrapper

### Phase 3 — Buddy List Panel (`components/BuddyListPanel.vue`)

9. Render all 50 slots as a scrollable list
   - Each row: slot number badge | Name input | RadioID input | drag handle | clear button
   - Empty slots shown greyed out but still editable
   - Inline editing (no modal needed for name/ID edits)
10. Drag-to-reorder via SortableJS (swaps slot contents, not slot numbers)
11. "Add from Contacts" button per row (or drag from contacts panel) — fills slot from selected contact
12. Footer: **Download BuddyList.txt** button — calls `exportTxt()` then `downloadTxt()`

### Phase 4 — Contacts Panel (`components/ContactsPanel.vue`)

13. Render contacts list (no fixed limit)
    - Each row: Name input | RadioID input | "→ Add to Buddies" button | delete button
    - Inline editing
14. "Add Contact" button (blank row / modal) at top or bottom
15. Upload zone: **Upload BuddyList.txt** button (or drop zone)
    - Parse the file
    - For each non-empty parsed slot: check contacts for matching RadioID (case-insensitive)
      - No match → add as new contact
      - Match found → show a conflict modal: display existing vs. incoming entry side-by-side, "Keep existing" / "Use new" buttons, resolve one at a time
    - Also populate buddy slots from the file (fills `xctracer-buddies`)
16. Footer: **Download as BuddyList.txt** button — exports contacts as buddy file

### Phase 5 — Cross-Panel "Add to Buddies" Flow

17. When user clicks "→ Add to Buddies" on a contact:
    - If free slots available: auto-fill the first free slot and scroll/highlight it
    - If all slots full: show a toast warning
18. When user clears a buddy slot: slot becomes empty again (contact remains in address book)

### Phase 6 — Polish & PWA

19. App header with title, brief description, and a "How to use" popover
20. Validation: RadioID field accepts only 6-char hex (live validation, red border); name soft-warns at 16 chars
21. Toast notifications for: file uploaded, file downloaded, contact added, slot full warning
22. PWA icons (512×512, 192×192 maskable) + splash screen
23. Offline support via service worker (Workbox via `@vite-pwa/nuxt`)

### Phase 7 — Deployment

24. Add `nuxt generate` script; output to `dist/`
25. **Netlify** (recommended): connect GitHub repo → set build command `npx nuxt generate`, publish dir `dist/`, deploy on push to `main`
26. **GitHub Pages** alternative: add `.github/workflows/deploy.yml` using `actions/deploy-pages`; set `app.baseURL` env var to repo name
27. Add `README.md` with device instructions (how to copy `BuddyList.txt` to XCTracer Maxx SD card)

---

## Relevant Files

- `nuxt.config.ts` — SPA mode, module registration, PWA manifest
- `composables/useBuddyList.ts` — buddy slot state + localStorage
- `composables/useContacts.ts` — contacts state + localStorage
- `composables/useBuddyListParser.ts` — file parser (handles typo-resilient slot parsing)
- `composables/useFileIO.ts` — download/upload helpers
- `app.vue` — root layout, side-by-side grid
- `components/BuddyListPanel.vue` — left panel (50 slots, drag-reorder)
- `components/ContactsPanel.vue` — right panel (address book, upload)
- `components/BuddyRow.vue` — single buddy slot row
- `components/ContactRow.vue` — single contact row
- `public/` — PWA icons

---

## Verification

1. Parse round-trip: upload the provided `BuddyList.txt` → immediately export → diff output against original (byte-for-byte match, modulo the slot-1 typo)
2. Slot 1 typo: verify parser correctly reads `AleG` as slot 1 name even with malformed key
3. localStorage persistence: fill some slots, reload page → data survives
4. PWA install: open in Chrome → "Install" prompt appears; app works offline after install
5. Slot limit: with all 50 slots full, clicking "Add to Buddies" shows a toast, does not overflow
6. RadioID validation: entering `ZZZZZZ` or `12345` (5 chars) shows red border and blocks download
7. Export format: downloaded file opens on XCTracer Maxx device without error (manual device test)

---

## Decisions & Scope

- **No backend** — all state in localStorage; no sync between devices
- **No auth** — single-user, local device only
- **Reorder method** — drag-and-drop (SortableJS) + up/down arrow buttons (both)
- **Contact deduplication** — by RadioID only (case-insensitive). On duplicate found during import: show a modal prompt displaying both entries (existing vs. incoming) and ask the user which to keep, one conflict at a time.
- **Name length limit** — soft warning at 16 chars (no hard block)
- **"Add to Buddies"** — auto-fill first free slot; toast if full
- **Slot 1 typo in sample file** — parser handles by position, not key prefix
- **Hosting** — static deploy to **Netlify** (recommended: auto-deploy from GitHub, free tier, custom domain support) or **GitHub Pages** (via `nuxt generate` + gh-pages branch). Nuxt config: `nitro.preset: 'static'`, `app.baseURL` set via env for GH Pages subdirectory.
- **Excluded**: cloud sync, multi-device, sharing links, history/undo
