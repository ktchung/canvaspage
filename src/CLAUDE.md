# Source

React app (React 19 + Shadcn/ui + Tailwind v4). All UI lives here.

## Rules

- All runtime state lives in Zustand. No localStorage, no IndexedDB, no other persistence.
- Images are stored as blob URLs (`URL.createObjectURL()`). Always revoke URLs when deleting images to prevent memory leaks.

## Routing

TanStack Router. Three top-level pages: Editor, Gallery, Import.

## Canvas editor

Built with react-konva. Images are Konva `Image` objects on a `Stage`.

- PDF export: `stage.toDataURL()` -> pdf-lib. Do not use a DOM-based approach; html2canvas is avoided by design.
- Each document page has independent auto-align and grid configuration (rows x columns), stored in Zustand alongside canvas state.

## Component library

Shadcn/ui components with Tailwind v4 utilities. Prefer existing Shadcn primitives over custom markup.

## Icons

Custom SVG icons live in `src/assets/icons/`. Import them with Vite's `?raw` suffix (returns the file as a string at build time) and render via the generic `SvgIcon` component:

```tsx
import editorSvg from '@/assets/icons/editor.svg?raw'
import SvgIcon from '@/components/shared/SvgIcon'

<SvgIcon src={editorSvg} className="h-4 w-4" />
```

Size via Tailwind on the wrapper (`h-*`/`w-*`). All SVGs use `fill="currentColor"` so they inherit CSS color. Use lucide-react for generic/utility icons not covered by the custom set.

## Toasts

Use `ToastCard` from `src/components/shared/ToastCard.tsx` for all toast messages.
