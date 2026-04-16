# XCTracer Buddy Manager — AI Agent Context

This file provides complete context for an AI agent picking up work on this project.

---

## What This Is

A fully client-side **installable PWA** (Nuxt 3, SPA mode) for managing the `BuddyList.txt` file used by the **XCTracer Maxx variometer** (paragliding instrument, v1/v2/v3). The device uses FANET+ and ADS-L for electronic conspicuity; buddies are other pilots whose positions appear on the device's display.

No backend. No auth. All state in `localStorage`. Static deploy (Netlify or GitHub Pages).

---

## Running the Project

```bash
nvm use 22          # Node 22 required — .nvmrc is present
npm install
npm run dev         # → http://localhost:3000
npm run generate    # static build → .output/public/
```

---

## BuddyList.txt File Format

```
# Buddy List

Buddy1Name=AleG
Buddy1RadioID=20273C

Buddy2Name=Gandi
Buddy2RadioID=20218C

...

Buddy50Name=
Buddy50RadioID=

```

**Rules:**
- Header `# Buddy List`, followed by a blank line
- 50 slots, always exactly 50, 1-indexed
- Each slot: `BuddyNName=VALUE\nBuddyNRadioID=VALUE\n` then blank line
- Empty slots have empty values (not omitted)
- RadioID: **4–6 uppercase hex characters** (FANET+ address). 6 chars for modern devices, 4–5 for older ones.
- ⚠️ **Known quirk**: the sample `BuddyList.txt` in the repo has a typo on slot 1 (`Buddy2RadioID` instead of `Buddy1RadioID`). The parser handles this by reading **by position within each block**, not by the numeric prefix in the key name.

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `nuxt` | ^4.4.2 | Framework, SPA mode (`ssr: false`) |
| `@nuxt/ui` | ^4.3.0 | Component library (v4 — uses `@import "tailwindcss"` CSS pattern) |
| `@vite-pwa/nuxt` | ^1.1.1 | PWA manifest + Workbox service worker |
| `@vueuse/core` | ^14.2.1 | `useLocalStorage` |
| `sortablejs` | ^1.15.7 | Drag-and-drop reorder in buddy list |
| `@types/sortablejs` | ^1.15.9 | Types for above |

**`@nuxt/ui` v4 CSS requirement** — `assets/css/main.css` must contain:
```css
@import "tailwindcss";
@import "@nuxt/ui";
```
And `nuxt.config.ts` must have `css: ['~/assets/css/main.css']`. Without this, all styles are missing.

**Color tokens** — use Nuxt UI semantic CSS variables, never hardcoded Tailwind colors:
- `--ui-bg`, `--ui-bg-elevated`, `--ui-border`, `--ui-text-muted`
- These adapt automatically to light/dark/system color mode

---

## File Structure

```
xctracer-buddy/
├── app.vue                        # Root layout: header, 2-col grid, help modal, color mode toggle
├── app.config.ts                  # Nuxt UI theme: primary: 'sky', neutral: 'slate'
├── nuxt.config.ts                 # SPA + PWA config
├── assets/css/main.css            # Tailwind + Nuxt UI CSS imports + slot-flash animation
├── types/index.ts                 # BuddySlot, Contact interfaces
├── utils/validation.ts            # radioIdError(), isValidRadioId() — 4–6 hex chars
├── composables/
│   ├── useBuddyList.ts            # Buddy slot state (module-level singleton)
│   ├── useContacts.ts             # Contact address book state (module-level singleton)
│   ├── useBuddyListParser.ts      # Parses BuddyList.txt by position (typo-safe)
│   └── useFileIO.ts               # downloadTxt(), readUploadedFile()
├── components/
│   ├── BuddyListPanel.vue         # Left panel: 50 slots, DnD, download button at top
│   ├── BuddyRow.vue               # Single buddy slot row
│   ├── ContactsPanel.vue          # Right panel: address book, import/export, conflict modal
│   └── ContactRow.vue             # Single contact row
├── public/icons/                  # PWA icons (icon-192.png, icon-512.png)
├── netlify.toml                   # Netlify deploy config
├── .github/workflows/deploy.yml   # GitHub Pages deploy workflow
├── .nvmrc                         # Node 22
└── BuddyList.txt                  # Sample file from the device (keep in repo)
```

---

## Data Models

```ts
// types/index.ts
interface BuddySlot {
  slot: number       // 1–50, position in the device file
  name: string
  radioId: string    // 4–6 char uppercase hex, may be empty
}

interface Contact {
  id: string         // crypto.randomUUID() — internal only, never exported
  name: string
  radioId: string
}
```

**`localStorage` keys:**
- `xctracer-buddies` → `BuddySlot[]` (always 50 elements)
- `xctracer-contacts` → `Contact[]` (unlimited)

---

## Composable Architecture — Important Details

Both `useBuddyList` and `useContacts` use **module-level singleton state** (declared outside the exported function). This means state is shared across all component instances without a Pinia store. This is intentional.

### Flash Animation System

Both composables use a **tick counter map** (not a boolean) to trigger row flash animations:

```ts
// In composable:
const flashMap = ref<Record<number|string, number>>({})
function flashSlot(slot: number) {
  flashMap.value = { ...flashMap.value, [slot]: (flashMap.value[slot] ?? 0) + 1 }
}

// In row component:
const animKey = ref(0)
watch(() => props.flashTick, (val) => {
  if (!val) return
  animKey.value++  // ← triggers :key change on the div → forces DOM recreation → restarts CSS animation
})
// Template:
<div :key="animKey" :class="[..., animKey > 0 && 'slot-flash']">
```

The `:key` trick forces Vue to tear down and recreate the DOM node — this is the only reliable way to restart a CSS animation when the same element needs to flash repeatedly (including rapid repeated clicks). Using `boolean → false → true` with `nextTick` is not reliable due to Vue batching.

### Drag-and-Drop (SortableJS + Vue)

The standard Vue + SortableJS conflict: SortableJS moves DOM nodes, then Vue's re-render conflicts with the mutated DOM.

**Fix** in `BuddyListPanel.vue`:
1. `onStart`: capture `evt.item.nextElementSibling` before the drag
2. `onEnd`: call `evt.from.insertBefore(evt.item, _nextSibling)` to **revert** SortableJS's DOM mutation before calling `moveSlot()`
3. Vue then re-renders onto a clean DOM it recognizes

Do **not** use `nextTick(() => initSortable())` — it was tried and caused further issues. The revert approach is correct.

SortableJS config: `ghostClass: 'invisible'` hides the placeholder slot while dragging (space is reserved, content hidden).

---

## Component Behaviour Details

### BuddyListPanel
- "Download BuddyList.txt" button is at the **top** (above the list), not the bottom
- 50 rows always rendered (empty ones at 50% opacity)
- Drag handle (`.drag-handle`) triggers SortableJS; ↑↓ buttons call `moveSlot`

### ContactsPanel toolbar (top, left to right)
```
[+ Add Contact]  [↑ Import]  [↓ Export]     [A→Z]  [N contacts]
```
- **Add Contact**: prepends an empty contact at the top (`atTop = true`). If an empty contact already exists, flashes it instead of creating a duplicate.
- **Import**: file picker, parses `BuddyList.txt`, merges into contacts. On RadioID conflict → conflict modal. Also loads into buddy list slots.
- **Export**: downloads `BuddyList-export.txt` (first 50 contacts padded to 50 slots)
- **A→Z**: sorts contacts alphabetically in-place

### Conflict Resolution Modal
Triggered on import when an incoming slot's RadioID matches an existing contact.

- Shows "Existing" vs "Incoming" side-by-side
- `+N more` badge shows queue depth
- **Single resolution**: "Keep Existing" / "Use Incoming" — resolves current item only
- **Bulk checkbox**: "Apply my choice to all N remaining conflicts" — when checked, the same button drains the entire queue. Checkbox resets to unchecked on every new conflict shown (intentional — prevents accidental bulk operations).
- Deduplication key: **RadioID only** (case-insensitive). Duplicate names are allowed.

### ContactRow
- "Add to Buddies" (←) button is **leftmost** in the row, pointing left toward the buddy panel
- If contact's RadioID already exists in buddy list: shows warning toast + flashes the existing buddy slot
- If buddy list is full (50/50): shows error toast

---

## Known Non-Issues (do not "fix")

- `WARN Duplicated imports "useAppConfig"` in dev console — benign Nuxt internal warning, not a bug
- Port 3001 instead of 3000 in dev — another process occupies 3000, Nuxt falls back automatically

---

## What Has NOT Been Built Yet (potential next steps)

- ~~Undo/redo~~ (out of scope by decision)
- ~~Cloud sync / multi-device~~ (out of scope)
- Scrolling the buddy list to the newly added/flashed slot (nice-to-have)
- Keyboard shortcut to quickly add focused contact to buddies
- Bulk-clear buddy list button
- Visual indicator on contacts that are already in the buddy list (e.g. a small badge)
- Mobile layout polish (the two panels stack vertically on small screens — functional but not optimised)
- Real PWA icons (current ones are programmatically generated placeholders)
