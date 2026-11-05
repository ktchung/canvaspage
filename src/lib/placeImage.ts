import { showToast } from '@/components/shared/ToastCard'
import { A4_H, A4_W, makeId, useAppStore } from '@/store'
import type { CanvasImage, ImageItem } from '@/store'

/** Width of a newly placed image on a free-layout page; grid/masonry pages resize it. */
const DEFAULT_WIDTH = 240

export const DROP_OFF_GRID = [
  'Drop on a grid cell',
  'Release the image over a cell inside the page.'
] as const
export const DROP_CELL_OCCUPIED = [
  'Cell is occupied',
  'Pick an empty cell or swap images after placing.'
] as const

interface PlaceOptions {
  /** Centre point in canvas units. Defaults to the page centre. */
  center?: { x: number; y: number }
  /** Grid pages only: the cell to place into. Defaults to the first empty cell. */
  targetCell?: { row: number; col: number }
}

/**
 * Load an image's natural size and add it to a page, honouring the page's
 * auto-align mode. Rejections (full grid, occupied cell, ...) show a toast.
 */
export function placeImageOnPage(pageId: string, img: ImageItem, options: PlaceOptions = {}) {
  const { center = { x: A4_W / 2, y: A4_H / 2 }, targetCell } = options
  const el = document.createElement('img')
  el.onload = () => {
    const { pages, addCanvasImage } = useAppStore.getState()
    const page = pages.find((p) => p.id === pageId)
    if (!page) return
    const natW = el.naturalWidth
    const natH = el.naturalHeight
    const width = DEFAULT_WIDTH
    const height = DEFAULT_WIDTH * (natH / natW)
    const ci: CanvasImage = {
      id: makeId('ci'),
      imageId: img.id,
      x: center.x - width / 2,
      y: center.y - height / 2,
      width,
      height,
      zIndex: page.canvasImages.length,
      natW,
      natH
    }
    const res = addCanvasImage(page.id, ci, targetCell ? { targetCell } : undefined)
    if (!res.rejected) return
    if (res.reason === 'cell-occupied') {
      showToast('error', ...DROP_CELL_OCCUPIED)
    } else if (res.reason === 'cell-out-of-range') {
      showToast('error', ...DROP_OFF_GRID)
    } else if (page.settings.autoAlign === 'masonry') {
      showToast('error', 'Page is full', 'Increase columns in page settings or disable auto-align.')
    } else {
      showToast('error', 'Grid is full', 'Increase rows/columns in page settings or disable auto-align.')
    }
  }
  el.src = img.url
}
