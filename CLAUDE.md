# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

CanvasPage — a web app for composing multi-page A4 documents from images. Three pages: Editor (free canvas), Gallery (album browser), Import (drag-and-drop file upload). Single active document.

- Feature overview and tech stack: `README.md`
- Full feature spec: `PRD.md`
- Source conventions: `src/CLAUDE.md`

## Commands

```bash
bun run dev       # Development with HMR (Vite)
bun run build     # Type-check (tsc --noEmit) + production build
bun run preview   # Preview production build
```

There is no test suite. Verify changes with `bun run build` and by exercising the app in the browser.

`bunfig.toml` sets `minimumReleaseAge` to 7 days: `bun add` refuses package versions published less than a week ago.

## Key architectural decisions

**No persistence.** All state lives in a single in-memory Zustand store (`src/store/index.ts`) and is lost on page refresh. No localStorage, no IndexedDB. Images exist only as blob URLs created with `URL.createObjectURL()`.

**No backend.** File import uses the browser File API. PDF export is generated client-side with pdf-lib and triggers a browser download.

**Album model.** At import time the user picks an existing album or creates a new one. Each image belongs to exactly one album. Deleting an image (or its album) revokes its blob URL and removes it from every canvas page it appears on.
