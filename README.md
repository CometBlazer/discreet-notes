# Discreet Notes 📝

A minimalist PWA notepad where you type without seeing the content — perfect for taking notes discreetly in any situation. Only the word count tells you it's working.

**Live app: [discreetnotes.vercel.app](https://discreetnotes.vercel.app/)**

## Features

- **🔒 Discreet mode (default)** — type with invisible text; only the caret and word count give feedback
- **👁️ Reading mode** — toggle visibility to view and edit, with an adjustable text-opacity slider
- **💾 Auto-save** — notes save automatically 2 seconds after you stop typing, or instantly with Ctrl/Cmd+S
- **🔍 Search** — live full-text search across all notes from the floating dock
- **📋 Quick copy** — one-click copy of any note's content
- **📱 Installable PWA** — add to your home screen on iOS and Android; works fully offline
- **🔐 100% private** — everything lives in your browser's IndexedDB; no server, no accounts, no tracking

## How it works

Notes are edited in a [Tiptap](https://tiptap.dev/) rich-text editor whose text color is rendered fully transparent in discreet mode, so keystrokes land normally but nothing is readable on screen. Content persists to IndexedDB on-device, and a service worker precaches the app shell so the whole thing runs offline after the first load. Nothing ever leaves your device.

## Getting started

Requires Node.js 18+ and npm.

```bash
git clone https://github.com/CometBlazer/discreet-notes.git
cd discreet-notes
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Tap **+** to create a note and just start typing — you won't see the text, but the word count will climb.
2. Use the eye icon in the bottom toolbar to reveal the text (and the slider to control its opacity).
3. Notes auto-save as you type; Ctrl/Cmd+S saves immediately.
4. Back on the dashboard, search, copy, or delete notes; everything is stored locally.

### Installing as an app

- **iOS (Safari):** Share → **Add to Home Screen**
- **Android (Chrome):** ⋮ menu → **Install app**

## Tech stack

- [Next.js](https://nextjs.org/) 16 (App Router) + [TypeScript](https://www.typescriptlang.org/)
- [Tiptap](https://tiptap.dev/) rich-text editor
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via [`idb`](https://github.com/jakearchibald/idb)
- [Tailwind CSS](https://tailwindcss.com/) 4
- Custom service worker for offline support

## Project structure

```
discreet-notes/
├── app/
│   ├── layout.tsx            # Root layout, PWA metadata
│   ├── page.tsx              # Dashboard: note list, search, floating dock
│   └── note/[id]/page.tsx    # Editor page with autosave + toolbar
├── components/
│   ├── DiscreetEditor.tsx    # Tiptap wrapper with invisible-text rendering
│   ├── NoteList.tsx          # Note cards with copy/delete
│   ├── SearchBar.tsx         # Floating search input
│   └── PWARegister.tsx       # Service worker registration
├── lib/
│   ├── db.ts                 # IndexedDB persistence
│   └── utils.ts              # Formatting helpers
└── public/
    ├── manifest.json         # PWA manifest
    └── service-worker.js     # Offline caching
```

## Privacy

All notes are stored in your browser's IndexedDB and never transmitted anywhere. There is no backend, no analytics, and no tracking. Clearing your browser's site data deletes your notes — export anything important first.

## Deployment

Deploys as a standard Next.js app. On [Vercel](https://vercel.com/), just import the repository; no environment variables are needed.

## License

[MIT](LICENSE)
