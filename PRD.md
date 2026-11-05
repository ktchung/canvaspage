# Product Requirements Document — CanvasPage

## 1. Overview

CanvasPage is a web application for composing multi-page A4 documents from images. It features a free-canvas editor, an image gallery organized by albums, and a drag-and-drop import flow. Only one document is active at a time. All state is in-memory.

---

## 2. Navigation

Persistent left sidebar across all pages:
- App logo ("CanvasPage")
- **Editor**
- **Gallery**
- **Import**

Top-right corner: Help button (question mark icon, Editor page only) followed by the global Export/Download button. The Help button is hidden outside the Editor; the Export/Download button is available on all pages.

---

## 3. Pages

### 3.1 Editor

**Purpose:** Compose pages by freely placing and resizing images on A4 canvas(es).

**Layout:**
- **Center stage:** Dark background, A4 canvas with visible boundary
- **Right panel:** "Pages" panel — vertical thumbnail list with numbered badges, `+` buttons to insert pages, drag to reorder, delete page
- **Bottom tray:** Scrollable horizontal image strip filtered by album dropdown. A `+` placeholder navigates to the Import page.
- **Top right:** Per-page settings gear, Export button

**Canvas interactions:**
- Free drag to position images anywhere on the canvas
- Resize via corner/edge handles
- Images can overlap; z-order controlled via bring-forward/send-back actions
- Selected image shows handles + context toolbar: delete, bring forward, send back
- Content outside the A4 boundary is clipped in PDF output

**Canvas zoom & pan:**
- Default view fits the canvas to the available viewport; that fit scale is the minimum zoom.
- Zoom in up to 400% via Ctrl/Cmd + mouse wheel (zoom centred on cursor), Ctrl/Cmd + `+` / Ctrl/Cmd + `-`, or on-screen `+` / `-` buttons.
- Right-click drag pans the canvas while zoomed.
- A "reset zoom" button appears next to the `+` / `-` controls whenever the zoom is above the fit scale and resets zoom + pan.
- Zoom/pan state is transient: switching pages or leaving the Editor route resets the view to fit.

**Per-page settings ("Page Settings" modal):**
- **Auto-align** mode — Off, Grid, or Masonry. In **Grid** mode:
  - Clicking an image in the bottom tray places it in the next empty grid cell; the placement is rejected with a toast when the grid is full
  - Dragging an image from the bottom tray onto the canvas places it in the cell under the cursor; a hover overlay previews the target cell while dragging, tinted differently when the cell is occupied. Dropping on an occupied cell or outside the page is rejected with a toast
  - Resize handles are disabled — cells dictate each image's size
  - Dragging an image already on the canvas over another cell swaps the two images; dragging onto an empty cell moves the image there
  - A semi-transparent overlay highlights the target cell during an in-canvas drag; the source cell shows a dimmed ghost. Releasing outside the page reverts the move
- **Grid Layout Configuration** — configurable rows, columns, horizontal margin, vertical margin, and inter-cell gap (all in canvas units; the page is 794×1123), with a live grid preview
- **Masonry** mode — configurable columns, margins, and gap with a live preview. Images fill columns top-to-bottom at full column width in z-order; dragging an image on the canvas reorders it. Images that no longer fit are dropped with a toast
- Settings are stored per page independently

**Page management:**
- Add blank page (unlimited pages supported)
- Delete page — confirmation dialog if the page has content
- Reorder pages via drag in the right panel

**Help popup:**
- The Help (`?`) button appears in the top-right only on the Editor page; it is hidden on Gallery and Import
- Opened via the button; closed by clicking outside, pressing Escape, or the close control
- Lists every canvas keybinding in a single scannable panel, grouped by category:
  - **Zoom:** Ctrl/Cmd + mouse wheel (zoom centred on cursor); Ctrl/Cmd + `+` / `-` (zoom in/out); on-screen `+` / `-` / reset buttons
  - **Pan:** Right-click drag while zoomed
- The popup surfaces keybindings only — it is not a tutorial

---

### 3.2 Gallery

**Purpose:** Browse and manage all imported images, organized by albums.

**Toolbar:**
- Album filter dropdown ("All Images" or a specific album)
- Bulk delete button
- Grid / List view toggle

**Main area:** Masonry image grid (or list view)

**Image preview popup** (click an image):
- Full-size image preview
- Album label (uppercase, accent color)
- Image name
- Metadata: file size
- Delete button

**Deletion behavior:**
- Deleting an image (individually or in bulk) shows a warning popup before confirming
- On confirmation, the image is removed from the Gallery and from any canvas pages it is placed on — those placements are removed without replacement

**Bulk actions:** Multi-select -> bulk delete (same warning popup applies)

---

### 3.3 Import

**Purpose:** Ingest new images into the Gallery.

**Drag-and-drop zone:**
- Large drop target area with visual feedback on drag-over
- "Browse Files" button to trigger file picker
- Accepts PNG, JPG, and WEBP files

**Album assignment dialog** (shown after files are selected):
- **Existing Album** — radio; scrollable list of existing albums
- **New Album** — radio; text input for album name
- Cancel / OK

---

## 4. Albums

- Created during import; user names them (or provides a default name to accept)
- Appear in: Gallery filter dropdown, Editor bottom tray dropdown
- Users can rename albums after creation
- Deleting an album triggers a warning popup; on confirmation, all images in the album are deleted and removed from any canvas pages they appear on

---

## 5. PDF Export

- Each editor page -> one PDF page (A4 size)
- Content outside the canvas boundary is clipped
- Browser download triggered on export
- Export button is always accessible from the top-right corner

---

## 6. Out of Scope

- Text/typography elements on canvas (images only)
- Undo/redo for canvas operations
- Layers panel (basic bring-forward/send-back only)
- Cloud sync or sharing
- Multi-document / project management (single active document)
- Server-side processing or backend API
- Persistent storage across page refreshes
