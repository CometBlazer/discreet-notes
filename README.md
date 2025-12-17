# Discrete Notes 📝

A minimalist PWA notepad where you can type without seeing the content - perfect for taking notes discreetly in any situation.

## ✨ Features

- **🔒 Discrete Mode (Default)**: Type with invisible text - only the word count updates
- **👁️ Reading Mode**: Toggle to view and edit your notes with visible text
- **💾 Auto-Save**: Automatic saving every 2 seconds + manual save (Ctrl/Cmd+S)
- **🔍 Smart Search**: Search notes by content or date
- **📋 Quick Copy**: One-click copy of note content
- **📱 PWA Support**: Install as an app on iOS and Android
- **🌑 Dark Mode**: Sleek black interface by default
- **🔐 100% Private**: All data stored locally on your device - never uploaded anywhere

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/CometBlazer/discrete-notes.git
cd discrete-notes
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Installing as PWA

### iPhone (Safari)
1. Open the app in Safari
2. Tap the **Share** button (square with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"**
5. The app icon will appear on your home screen

### Android (Chrome)
1. Open the app in Chrome
2. Tap the three-dot menu (⋮)
3. Tap **"Install app"** or **"Add to Home Screen"**
4. Confirm installation
5. The app icon will appear on your home screen

## 🎯 How to Use

### Creating a Note
1. Click **"+ New Note"** on the dashboard
2. Start typing - you won't see the text!
3. Watch the word count update as you type
4. Your note auto-saves every 2 seconds

### Viewing Your Notes
1. Click any note on the dashboard to open it
2. It opens in discrete mode (invisible text)
3. Click **"👁️ Show Text"** to reveal the content
4. Click **"👁️ Hide Text"** to return to discrete mode

### Other Features
- **Search**: Use the search bar to find notes by content or date
- **Copy**: Hover over a note and click the copy icon
- **Delete**: Hover over a note and click the trash icon
- **Save**: Press **Ctrl+S** (or **Cmd+S** on Mac) to save manually

## 🛠️ Tech Stack

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tiptap](https://tiptap.dev/)** - Rich text editor
- **[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)** (via `idb`) - Local database
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **PWA** - Progressive Web App capabilities

## 📁 Project Structure

```
discrete-notes/
├── app/
│   ├── layout.tsx              # Root layout with PWA setup
│   ├── page.tsx                # Dashboard (home page)
│   ├── globals.css             # Global styles
│   └── note/[id]/
│       └── page.tsx            # Note editor page
├── components/
│   ├── DiscreteEditor.tsx      # Tiptap editor wrapper
│   ├── NoteList.tsx            # List of notes
│   ├── SearchBar.tsx           # Search component
│   └── PWARegister.tsx         # Service worker registration
├── lib/
│   ├── db.ts                   # IndexedDB functions
│   └── utils.ts                # Utility functions
└── public/
    ├── manifest.json           # PWA manifest
    ├── service-worker.js       # Service worker
    ├── icon-192.png            # App icon (192x192)
    └── icon-512.png            # App icon (512x512)
```

## ⚙️ Configuration

### Change Auto-Save Delay

Edit `/app/note/[id]/page.tsx` and modify the timeout value:

```typescript
saveTimeoutRef.current = setTimeout(() => {
  persistNote(updatedNote);
}, 2000); // Change 2000 to your preferred milliseconds
```

### Customize Colors

Edit `/app/globals.css` or modify Tailwind classes in components.

### Custom Icons

Replace `/public/icon-192.png` and `/public/icon-512.png` with your own 192x192 and 512x512 PNG images.

## 🔒 Privacy & Data

- **Local Storage Only**: All notes are stored in your browser's IndexedDB
- **No Server**: Nothing is ever sent to any server
- **No Tracking**: No analytics or tracking of any kind
- **Offline First**: Works completely offline after initial load
- **Your Device Only**: Data stays on your device unless you manually export

## 🐛 Troubleshooting

### PWA Won't Install
- Ensure you're using HTTPS (localhost is OK for testing)
- Check browser console for errors
- Verify `manifest.json` is accessible at `/manifest.json`
- Make sure icon files exist in `/public` folder

### Notes Not Saving
- Check browser console for IndexedDB errors
- Ensure you're not in private/incognito mode
- Try clearing browser cache and reload

### Service Worker Issues
1. Open DevTools → Application → Service Workers
2. Click "Unregister"
3. Refresh the page

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
1. Connect your Git repository
2. Build command: `npm run build`
3. Publish directory: `.next`

### Other Platforms
Build the project and deploy the `.next` folder:
```bash
npm run build
npm start
```

## 📄 License

MIT License - feel free to use this project however you'd like!

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 💡 Use Cases

- Taking notes in meetings without drawing attention
- Journaling in public spaces
- Quick thought capture without distractions
- Private note-taking on shared devices
- Reducing screen time anxiety

## ⌨️ Keyboard Shortcuts

- **Ctrl/Cmd + S**: Save note immediately
- **Esc**: (Future) Quick exit to dashboard

---

Made with ❤️ for discrete note-taking