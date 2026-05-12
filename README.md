# CanvasPage

A web application for composing multi-page A4 documents from images. Arrange images freely on a canvas, manage your library by albums, and export to PDF.

## Technology Stack

- **Language:** TypeScript
- **UI Framework:** React 19
- **Component Library:** Shadcn/ui + Tailwind CSS v4
- **Routing:** TanStack Router
- **State Management:** Zustand
- **Editor Canvas:** react-konva
- **PDF Generation:** pdf-lib
- **Build:** Vite
- **Package Manager:** Bun

## Features

### Editor
- Free-form canvas: drag and drop images anywhere on the A4 page, resize via handles
- Z-order control: bring forward / send back for overlapping images
- Multi-page document: add, remove, and reorder pages freely
- Per-page settings: optional auto-align with configurable grid (rows x columns)
- Bottom image tray: browse images by album and drag onto the canvas
- Export to PDF: each canvas page maps to one A4 PDF page

### Gallery
- Browse all imported images in a masonry grid or list view
- Filter by album
- Click any image to preview with full metadata (file size, source)
- Delete images individually or in bulk — removes placements from canvas pages

### Import
- Drag-and-drop zone or file picker for PNG, JPG, and WEBP images
- Assign imports to an existing album or create a new one at import time

### Albums
- Created on each import action
- Available as filters in Gallery and Editor tray
- Renameable after creation

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/)

### Installation

```bash
bun install
```

### Running

```bash
# Development (with HMR)
bun run dev

# Production build
bun run build

# Preview production build
bun run preview
```

## Development Notes

- All state is in-memory. Images are stored as blob URLs and lost on page refresh.
- No backend — everything runs client-side in the browser.
