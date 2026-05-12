# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

CanvasPage — a web app for composing multi-page A4 documents from images. Three pages: Editor (free canvas), Gallery (album browser), Import (drag-and-drop file upload). Single active document; all state is in-memory and wiped on refresh.

Full feature spec: `PRD.md`

## Commands

```bash
bun run dev       # Development with HMR (Vite)
bun run build     # Production build
bun run preview   # Preview production build
```

## Tech Stack

| Concern | Tool |
|---|---|
| Language | TypeScript |
| UI | React 19 + Shadcn/ui + Tailwind v4 |
| Routing | TanStack Router |
| State | Zustand |
| Editor canvas | react-konva |
| PDF export | pdf-lib |
| Build | Vite |
| Package manager | Bun |

## Architecture

Single-page client-side web app. No backend.

- **Source:** `src/` — React app, all UI. See `src/CLAUDE.md`.
- **Build entry:** `index.html` (project root, standard Vite convention)
- **State:** Zustand in-memory store. No localStorage, no IndexedDB.
- **Images:** Stored as in-memory blob URLs via `URL.createObjectURL()`. Revoked on delete.

## Key architectural decisions

**No persistence.** All state lives in Zustand and is lost on page refresh. Images exist only as blob URLs in memory.

**No backend.** File import uses the browser File API. PDF export generates client-side via pdf-lib and triggers a browser download. No server, no API calls.

**Album model.** An album is created per import action (one import = one album). Images belong to exactly one album. Deleting an image removes it from any canvas pages it appears on.
