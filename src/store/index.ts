import { create } from 'zustand'

export interface ImageItem {
  id: string
  url: string
  name: string
  size: number
  albumId: string
}

export interface Album {
  id: string
  name: string
}

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

export interface CanvasImage {
  id: string
  imageId: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  natW: number
  natH: number
  crop?: CropRect
}

export type AutoAlignMode = 'off' | 'grid' | 'masonry'

export interface PageSettings {
  autoAlign: AutoAlignMode
  gridRows: number
  gridCols: number
  marginH: number
  marginV: number
  gridGap: number
}

export interface DocumentPage {
  id: string
  canvasImages: CanvasImage[]
  settings: PageSettings
}

export const A4_W = 794
export const A4_H = 1123

interface AddCanvasImageResult {
  ok: boolean
  rejected?: boolean
  reason?: 'grid-full' | 'cell-occupied' | 'cell-out-of-range'
}

export interface AddCanvasImageOptions {
  targetCell?: { row: number; col: number }
}

interface ReflowResult {
  dropped: number
}

interface UpdatePageSettingsResult {
  dropped: number
}

interface AppState {
  albums: Album[]
  images: ImageItem[]
  pages: DocumentPage[]
  activePageId: string | null

  addAlbum: (name: string) => string
  renameAlbum: (id: string, name: string) => void
  deleteAlbum: (id: string) => void

  addImages: (imgs: ImageItem[]) => void
  deleteImage: (id: string) => void

  addPage: (afterId?: string) => void
  deletePage: (id: string) => void
  reorderPages: (ids: string[]) => void
  setActivePage: (id: string) => void

  addCanvasImage: (
    pageId: string,
    ci: CanvasImage,
    options?: AddCanvasImageOptions
  ) => AddCanvasImageResult
  updateCanvasImage: (pageId: string, id: string, patch: Partial<CanvasImage>) => void
  removeCanvasImage: (pageId: string, id: string) => void
  bringForward: (pageId: string, id: string) => void
  sendBackward: (pageId: string, id: string) => void
  dragSnapToCell: (pageId: string, id: string, row: number, col: number) => void

  updatePageSettings: (
    pageId: string,
    patch: Partial<PageSettings>
  ) => UpdatePageSettingsResult
  reorderMasonryImage: (pageId: string, id: string, newIndex: number) => ReflowResult
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const defaultPage = (): DocumentPage => ({
  id: makeId('page'),
  canvasImages: [],
  settings: {
    autoAlign: 'off',
    gridRows: 2,
    gridCols: 2,
    marginH: 24,
    marginV: 24,
    gridGap: 12
  }
})

export interface CellMetrics {
  marginH: number
  marginV: number
  gridGap: number
  gridRows: number
  gridCols: number
  cellW: number
  cellH: number
  originX: (col: number) => number
  originY: (row: number) => number
}

export function cellMetrics(settings: PageSettings): CellMetrics {
  const { marginH, marginV, gridGap, gridRows, gridCols } = settings
  const usableW = A4_W - 2 * marginH
  const usableH = A4_H - 2 * marginV
  const cellW = (usableW - gridGap * (gridCols - 1)) / gridCols
  const cellH = (usableH - gridGap * (gridRows - 1)) / gridRows
  return {
    marginH,
    marginV,
    gridGap,
    gridRows,
    gridCols,
    cellW,
    cellH,
    originX: (col: number) => marginH + col * (cellW + gridGap),
    originY: (row: number) => marginV + row * (cellH + gridGap)
  }
}

export function gridCapacity(settings: PageSettings): number {
  const { cellW, cellH, gridRows, gridCols } = cellMetrics(settings)
  if (cellW <= 0 || cellH <= 0) return 0
  return gridRows * gridCols
}

export function fitToCell(
  natW: number,
  natH: number,
  row: number,
  col: number,
  settings: PageSettings
): { x: number; y: number; width: number; height: number } {
  const { cellW, cellH, originX, originY } = cellMetrics(settings)
  if (cellW <= 0 || cellH <= 0) {
    return { x: originX(col), y: originY(row), width: 0, height: 0 }
  }
  const scale = Math.min(cellW / natW, cellH / natH)
  const w = natW * scale
  const h = natH * scale
  return {
    x: originX(col) + (cellW - w) / 2,
    y: originY(row) + (cellH - h) / 2,
    width: w,
    height: h
  }
}

export function pointToCell(
  x: number,
  y: number,
  settings: PageSettings
): { row: number; col: number } | null {
  const { cellW, cellH, gridRows, gridCols, originX, originY } = cellMetrics(settings)
  if (cellW <= 0 || cellH <= 0) return null
  if (x < 0 || x > A4_W || y < 0 || y > A4_H) return null
  let bestR = 0
  let bestC = 0
  let bestDist = Infinity
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const ox = originX(c) + cellW / 2
      const oy = originY(r) + cellH / 2
      const d = (ox - x) ** 2 + (oy - y) ** 2
      if (d < bestDist) {
        bestDist = d
        bestR = r
        bestC = c
      }
    }
  }
  return { row: bestR, col: bestC }
}

export function imageCell(
  ci: CanvasImage,
  settings: PageSettings
): { row: number; col: number } | null {
  return pointToCell(ci.x + ci.width / 2, ci.y + ci.height / 2, settings)
}

export interface MasonryMetrics {
  marginH: number
  marginV: number
  gridGap: number
  gridCols: number
  colW: number
  usableH: number
  originX: (col: number) => number
}

export function masonryMetrics(settings: PageSettings): MasonryMetrics {
  // Masonry columns use the same horizontal geometry as grid cells.
  const { marginH, marginV, gridGap, gridCols, cellW, originX } = cellMetrics(settings)
  return { marginH, marginV, gridGap, gridCols, colW: cellW, usableH: A4_H - 2 * marginV, originX }
}

export interface MasonryPlacement {
  x: number
  y: number
  width: number
  height: number
}

export function computeMasonryLayout(
  items: Array<{ natW: number; natH: number }>,
  settings: PageSettings
): { placements: Array<MasonryPlacement | null>; droppedCount: number } {
  const m = masonryMetrics(settings)
  const placements: Array<MasonryPlacement | null> = []
  if (m.colW <= 0 || m.usableH <= 0) {
    return { placements: items.map(() => null), droppedCount: items.length }
  }
  const bottom = A4_H - m.marginV
  let curCol = 0
  let curY = m.marginV
  let dropped = 0
  for (const item of items) {
    const h = m.colW * (item.natH / item.natW)
    if (curY + h > bottom) {
      curCol++
      curY = m.marginV
    }
    if (curCol >= m.gridCols || curY + h > bottom) {
      placements.push(null)
      dropped++
      continue
    }
    placements.push({ x: m.originX(curCol), y: curY, width: m.colW, height: h })
    curY += h + m.gridGap
  }
  return { placements, droppedCount: dropped }
}

/** Source dimensions of the visible region (the crop, if any). */
export function effectiveDims(ci: CanvasImage) {
  return { natW: ci.crop?.width ?? ci.natW, natH: ci.crop?.height ?? ci.natH }
}

/** Copy of `images` ordered bottom-to-top. */
export function sortByZ<T extends { zIndex: number }>(images: T[]): T[] {
  return [...images].sort((a, b) => a.zIndex - b.zIndex)
}

function reflowGridPage(page: DocumentPage): { page: DocumentPage; dropped: number } {
  const { gridCols } = page.settings
  const capacity = gridCapacity(page.settings)
  const sorted = sortByZ(page.canvasImages)
  const kept = sorted.slice(0, capacity)
  const dropped = sorted.length - kept.length
  const canvasImages = kept.map((ci, i) => {
    const row = Math.floor(i / gridCols)
    const col = i % gridCols
    const ed = effectiveDims(ci)
    const fit = fitToCell(ed.natW, ed.natH, row, col, page.settings)
    return { ...ci, ...fit, zIndex: i }
  })
  return { page: { ...page, canvasImages }, dropped }
}

function reflowMasonryPage(page: DocumentPage): { page: DocumentPage; dropped: number } {
  const sorted = sortByZ(page.canvasImages)
  const { placements, droppedCount } = computeMasonryLayout(
    sorted.map(effectiveDims),
    page.settings
  )
  const kept: CanvasImage[] = []
  for (let i = 0; i < sorted.length; i++) {
    const p = placements[i]
    if (!p) continue
    kept.push({ ...sorted[i], ...p, zIndex: kept.length })
  }
  return { page: { ...page, canvasImages: kept }, dropped: droppedCount }
}

function reflowPage(page: DocumentPage): { page: DocumentPage; dropped: number } {
  if (page.settings.autoAlign === 'grid') return reflowGridPage(page)
  if (page.settings.autoAlign === 'masonry') return reflowMasonryPage(page)
  return { page, dropped: 0 }
}

function findEmptyCell(page: DocumentPage): { row: number; col: number } | null {
  const { cellW, cellH, gridRows, gridCols } = cellMetrics(page.settings)
  if (cellW <= 0 || cellH <= 0) return null
  const occupied = new Set<string>()
  for (const ci of page.canvasImages) {
    const cell = imageCell(ci, page.settings)
    if (cell) occupied.add(`${cell.row}:${cell.col}`)
  }
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      if (!occupied.has(`${r}:${c}`)) return { row: r, col: c }
    }
  }
  return null
}

/** Drop matching images; masonry pages reflow to close the gaps. */
function removeCanvasImagesWhere(
  page: DocumentPage,
  pred: (ci: CanvasImage) => boolean
): DocumentPage {
  const filtered = { ...page, canvasImages: page.canvasImages.filter((ci) => !pred(ci)) }
  return page.settings.autoAlign === 'masonry' ? reflowMasonryPage(filtered).page : filtered
}

/** Swap z-order of `id` with its neighbour above (+1) or below (-1). */
function swapZ(page: DocumentPage, id: string, dir: 1 | -1): DocumentPage {
  const sorted = sortByZ(page.canvasImages)
  const idx = sorted.findIndex((ci) => ci.id === id)
  const a = sorted[idx]
  const b = sorted[idx + dir]
  if (idx < 0 || !b) return page
  return {
    ...page,
    canvasImages: page.canvasImages.map((ci) => {
      if (ci.id === a.id) return { ...ci, zIndex: b.zIndex }
      if (ci.id === b.id) return { ...ci, zIndex: a.zIndex }
      return ci
    })
  }
}

export const useAppStore = create<AppState>((set, get) => {
  const updatePage = (pageId: string, fn: (p: DocumentPage) => DocumentPage) =>
    set((s) => ({ pages: s.pages.map((p) => (p.id === pageId ? fn(p) : p)) }))

  const firstPage = defaultPage()
  return {
    albums: [],
    images: [],
    pages: [firstPage],
    activePageId: firstPage.id,

    addAlbum: (name) => {
      const id = makeId('album')
      set((s) => ({ albums: [...s.albums, { id, name }] }))
      return id
    },
    renameAlbum: (id, name) =>
      set((s) => ({ albums: s.albums.map((a) => (a.id === id ? { ...a, name } : a)) })),
    deleteAlbum: (id) =>
      set((s) => {
        const albumImages = s.images.filter((i) => i.albumId === id)
        for (const img of albumImages) URL.revokeObjectURL(img.url)
        const imageIds = new Set(albumImages.map((i) => i.id))
        return {
          albums: s.albums.filter((a) => a.id !== id),
          images: s.images.filter((i) => i.albumId !== id),
          pages: s.pages.map((p) =>
            removeCanvasImagesWhere(p, (ci) => imageIds.has(ci.imageId))
          )
        }
      }),

    addImages: (imgs) => set((s) => ({ images: [...s.images, ...imgs] })),
    deleteImage: (id) =>
      set((s) => {
        const img = s.images.find((i) => i.id === id)
        if (img) URL.revokeObjectURL(img.url)
        return {
          images: s.images.filter((i) => i.id !== id),
          pages: s.pages.map((p) => removeCanvasImagesWhere(p, (ci) => ci.imageId === id))
        }
      }),

    addPage: (afterId) =>
      set((s) => {
        const page = defaultPage()
        if (!afterId) return { pages: [...s.pages, page], activePageId: page.id }
        const idx = s.pages.findIndex((p) => p.id === afterId)
        const pages = [...s.pages]
        pages.splice(idx + 1, 0, page)
        return { pages, activePageId: page.id }
      }),
    deletePage: (id) =>
      set((s) => {
        const pages = s.pages.filter((p) => p.id !== id)
        const activePageId =
          s.activePageId === id ? (pages[0]?.id ?? null) : s.activePageId
        return { pages, activePageId }
      }),
    reorderPages: (ids) =>
      set((s) => ({
        pages: ids.map((id) => s.pages.find((p) => p.id === id)!).filter(Boolean)
      })),
    setActivePage: (id) => set({ activePageId: id }),

    addCanvasImage: (pageId, ci, options) => {
      const page = get().pages.find((p) => p.id === pageId)
      if (!page) return { ok: false }
      let placed = ci
      if (page.settings.autoAlign === 'grid') {
        if (page.canvasImages.length >= gridCapacity(page.settings)) {
          return { ok: false, rejected: true, reason: 'grid-full' }
        }
        let target: { row: number; col: number } | null = null
        if (options?.targetCell) {
          const { row, col } = options.targetCell
          const { gridRows, gridCols } = page.settings
          if (row < 0 || row >= gridRows || col < 0 || col >= gridCols) {
            return { ok: false, rejected: true, reason: 'cell-out-of-range' }
          }
          const occupied = page.canvasImages.some((other) => {
            const cell = imageCell(other, page.settings)
            return cell?.row === row && cell?.col === col
          })
          if (occupied) {
            return { ok: false, rejected: true, reason: 'cell-occupied' }
          }
          target = { row, col }
        } else {
          target = findEmptyCell(page)
          if (!target) return { ok: false, rejected: true, reason: 'grid-full' }
        }
        placed = { ...ci, ...fitToCell(ci.natW, ci.natH, target.row, target.col, page.settings) }
      } else if (page.settings.autoAlign === 'masonry') {
        const sorted = sortByZ(page.canvasImages)
        const { placements } = computeMasonryLayout(
          [...sorted.map(effectiveDims), effectiveDims(ci)],
          page.settings
        )
        const placementForNew = placements[placements.length - 1]
        if (!placementForNew) {
          return { ok: false, rejected: true, reason: 'grid-full' }
        }
        placed = { ...ci, ...placementForNew, zIndex: sorted.length }
      }
      updatePage(pageId, (p) => ({ ...p, canvasImages: [...p.canvasImages, placed] }))
      return { ok: true }
    },
    updateCanvasImage: (pageId, id, patch) =>
      updatePage(pageId, (p) => ({
        ...p,
        canvasImages: p.canvasImages.map((ci) => (ci.id === id ? { ...ci, ...patch } : ci))
      })),
    removeCanvasImage: (pageId, id) =>
      updatePage(pageId, (p) => removeCanvasImagesWhere(p, (ci) => ci.id === id)),
    bringForward: (pageId, id) => updatePage(pageId, (p) => swapZ(p, id, 1)),
    sendBackward: (pageId, id) => updatePage(pageId, (p) => swapZ(p, id, -1)),
    dragSnapToCell: (pageId, id, row, col) =>
      updatePage(pageId, (p) => {
        if (p.settings.autoAlign !== 'grid') return p
        const { gridRows, gridCols } = p.settings
        if (row < 0 || row >= gridRows || col < 0 || col >= gridCols) return p
        const dragged = p.canvasImages.find((ci) => ci.id === id)
        if (!dragged) return p
        const partner = p.canvasImages.find((ci) => {
          if (ci.id === id) return false
          const cell = imageCell(ci, p.settings)
          return cell?.row === row && cell?.col === col
        })
        if (partner) {
          const source = imageCell(dragged, p.settings)
          if (!source) return p
          const draggedFit = fitToCell(dragged.natW, dragged.natH, row, col, p.settings)
          const partnerFit = fitToCell(
            partner.natW,
            partner.natH,
            source.row,
            source.col,
            p.settings
          )
          return {
            ...p,
            canvasImages: p.canvasImages.map((ci) => {
              if (ci.id === dragged.id) return { ...ci, ...draggedFit }
              if (ci.id === partner.id) return { ...ci, ...partnerFit }
              return ci
            })
          }
        }
        const fit = fitToCell(dragged.natW, dragged.natH, row, col, p.settings)
        return {
          ...p,
          canvasImages: p.canvasImages.map((ci) =>
            ci.id === dragged.id ? { ...ci, ...fit } : ci
          )
        }
      }),

    updatePageSettings: (pageId, patch) => {
      let dropped = 0
      updatePage(pageId, (p) => {
        const nextSettings = { ...p.settings, ...patch }
        const next: DocumentPage = { ...p, settings: nextSettings }
        const layoutChanged =
          patch.gridRows !== undefined ||
          patch.gridCols !== undefined ||
          patch.marginH !== undefined ||
          patch.marginV !== undefined ||
          patch.gridGap !== undefined
        const modeChanged =
          patch.autoAlign !== undefined && patch.autoAlign !== p.settings.autoAlign
        if (!modeChanged && !layoutChanged) return next
        const { page: reflowed, dropped: d } = reflowPage(next)
        dropped = d
        return reflowed
      })
      return { dropped }
    },
    reorderMasonryImage: (pageId, id, newIndex) => {
      let dropped = 0
      updatePage(pageId, (p) => {
        if (p.settings.autoAlign !== 'masonry') return p
        const sorted = sortByZ(p.canvasImages)
        const oldIdx = sorted.findIndex((ci) => ci.id === id)
        if (oldIdx < 0) return p
        const [item] = sorted.splice(oldIdx, 1)
        const clamped = Math.max(0, Math.min(sorted.length, newIndex))
        sorted.splice(clamped, 0, item)
        const reindexed: DocumentPage = {
          ...p,
          canvasImages: sorted.map((ci, i) => ({ ...ci, zIndex: i }))
        }
        const { page: reflowed, dropped: d } = reflowMasonryPage(reindexed)
        dropped = d
        return reflowed
      })
      return { dropped }
    }
  }
})
