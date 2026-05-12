import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Rect, Line, Transformer } from 'react-konva'
import type Konva from 'konva'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAppStore,
  A4_W,
  A4_H,
  cellMetrics,
  fitToCell,
  pointToCell,
  masonryMetrics
} from '@/store'
import type { CanvasImage, CropRect } from '@/store'
import CanvasImageNode from './CanvasImageNode'
import CropOverlay from './CropOverlay'
import SelectionToolbar from './SelectionToolbar'
import ZoomControls from './ZoomControls'
import ToastCard from '@/components/shared/ToastCard'

function showDropError(title: string, description: string) {
  toast.custom((id) => (
    <ToastCard
      icon={
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10">
          <AlertCircle size={14} className="text-destructive" />
        </div>
      }
      title={title}
      description={description}
      onDismiss={() => toast.dismiss(id)}
    />
  ))
}

const MAX_ZOOM = 4
const MIN_ZOOM = 1
const ZOOM_STEP = 0.25
const WHEEL_STEP = 0.1

function clampZoom(z: number) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z))
}

function makeId() {
  return `ci-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function CanvasStage() {
  const activePageId = useAppStore((s) => s.activePageId)
  const page = useAppStore((s) => s.pages.find((p) => p.id === s.activePageId))
  const images = useAppStore((s) => s.images)
  const updateCanvasImage = useAppStore((s) => s.updateCanvasImage)
  const addCanvasImage = useAppStore((s) => s.addCanvasImage)
  const removeCanvasImage = useAppStore((s) => s.removeCanvasImage)
  const bringForward = useAppStore((s) => s.bringForward)
  const sendBackward = useAppStore((s) => s.sendBackward)
  const dragSnapToCell = useAppStore((s) => s.dragSnapToCell)
  const reorderMasonryImage = useAppStore((s) => s.reorderMasonryImage)
  const reflowAutoAlign = useAppStore((s) => s.reflowAutoAlign)

  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage | null>(null)
  const transformerRef = useRef<Konva.Transformer | null>(null)
  const nodeMap = useRef(new Map<string, Konva.Image>())

  const [fitScale, setFitScale] = useState<number | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragState, setDragState] = useState<{
    id: string
    origRow: number
    origCol: number
    hoverRow: number | null
    hoverCol: number | null
  } | null>(null)
  const [trayDrag, setTrayDrag] = useState<{
    row: number | null
    col: number | null
    occupied: boolean
  } | null>(null)
  const [masonryDrag, setMasonryDrag] = useState<{
    id: string
    insertIndex: number | null
  } | null>(null)
  const [cropMode, setCropMode] = useState<{
    id: string
    pendingCrop: CropRect | null
  } | null>(null)

  const handleCropUpdate = useCallback((crop: CropRect) => {
    setCropMode((prev) => prev ? { ...prev, pendingCrop: crop } : prev)
  }, [])

  useEffect(() => {
    setSelectedId(null)
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setDragState(null)
    setTrayDrag(null)
    setMasonryDrag(null)
    setCropMode(null)
  }, [activePageId])

  useEffect(() => {
    setDragState(null)
    setTrayDrag(null)
    setMasonryDrag(null)
    setCropMode(null)
  }, [page?.settings])

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      const { width, height } = el.getBoundingClientRect()
      if (width === 0 || height === 0) return
      const padding = 48
      const s = Math.min(
        (width - padding) / A4_W,
        (height - padding) / A4_H
      )
      setFitScale(Math.max(0.1, s))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const tr = transformerRef.current
    if (!tr) return
    if (selectedId) {
      const node = nodeMap.current.get(selectedId)
      if (node) {
        tr.nodes([node])
        tr.getLayer()?.batchDraw()
        return
      }
    }
    tr.nodes([])
    tr.getLayer()?.batchDraw()
  }, [selectedId, page?.canvasImages])

  const imagesById = useMemo(() => {
    const m = new Map<string, string>()
    for (const i of images) m.set(i.id, i.url)
    return m
  }, [images])

  const sorted = useMemo(
    () => (page ? [...page.canvasImages].sort((a, b) => a.zIndex - b.zIndex) : []),
    [page?.canvasImages]
  )

  const selected = sorted.find((ci) => ci.id === selectedId) || null

  const masonryInsertIndex = useCallback(
    (canvasX: number, canvasY: number, draggedId: string) => {
      if (!page || page.settings.autoAlign !== 'masonry') return null
      const m = masonryMetrics(page.settings)
      if (m.colW <= 0) return null
      const others = sorted.filter((ci) => ci.id !== draggedId)
      let bestIdx = others.length
      let bestDist = Infinity
      for (let i = 0; i < others.length; i++) {
        const ci = others[i]
        const midY = ci.y + ci.height / 2
        const midX = ci.x + ci.width / 2
        const d = Math.abs(canvasY - midY) + Math.abs(canvasX - midX) * 0.3
        if (canvasY < midY && d < bestDist) {
          bestDist = d
          bestIdx = i
        }
      }
      if (bestIdx === others.length) {
        let closest = Infinity
        for (let i = 0; i < others.length; i++) {
          const ci = others[i]
          const bot = ci.y + ci.height
          const midX = ci.x + ci.width / 2
          const d = Math.abs(canvasY - bot) + Math.abs(canvasX - midX) * 0.3
          if (d < closest) {
            closest = d
            bestIdx = i + 1
          }
        }
      }
      return bestIdx
    },
    [page, sorted]
  )

  const effectiveScale = fitScale !== null ? fitScale * zoom : 0
  const stageWidth = fitScale !== null ? A4_W * effectiveScale : 0
  const stageHeight = fitScale !== null ? A4_H * effectiveScale : 0

  const zoomAt = useCallback(
    (containerX: number, containerY: number, newZoom: number) => {
      if (fitScale === null) return
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const clamped = clampZoom(newZoom)
      const currEff = fitScale * zoom
      const newEff = fitScale * clamped
      const currW = A4_W * currEff
      const currH = A4_H * currEff
      const stageX = rect.width / 2 - currW / 2 + pan.x
      const stageY = rect.height / 2 - currH / 2 + pan.y
      const wx = (containerX - stageX) / currEff
      const wy = (containerY - stageY) / currEff
      const newW = A4_W * newEff
      const newH = A4_H * newEff
      const newStageX = containerX - wx * newEff
      const newStageY = containerY - wy * newEff
      setZoom(clamped)
      setPan({
        x: newStageX - rect.width / 2 + newW / 2,
        y: newStageY - rect.height / 2 + newH / 2
      })
    },
    [fitScale, zoom, pan]
  )

  const zoomAtCenter = useCallback(
    (newZoom: number) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      zoomAt(rect.width / 2, rect.height / 2, newZoom)
    },
    [zoomAt]
  )

  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      const direction = e.deltaY > 0 ? -1 : 1
      zoomAt(cx, cy, zoom + direction * WHEEL_STEP)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoom, zoomAt])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key === '=' || e.key === '+') {
        e.preventDefault()
        zoomAtCenter(zoom + ZOOM_STEP)
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        zoomAtCenter(zoom - ZOOM_STEP)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom, zoomAtCenter])

  const panDragRef = useRef<{
    startClientX: number
    startClientY: number
    startPan: { x: number; y: number }
  } | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onDown = (e: MouseEvent) => {
      if (e.button !== 2) return
      e.preventDefault()
      e.stopPropagation()
      panDragRef.current = {
        startClientX: e.clientX,
        startClientY: e.clientY,
        startPan: pan
      }
    }
    const onUp = (e: MouseEvent) => {
      if (e.button !== 2) return
      e.stopPropagation()
      panDragRef.current = null
    }
    const onCtx = (e: MouseEvent) => e.preventDefault()
    el.addEventListener('mousedown', onDown, { capture: true })
    el.addEventListener('mouseup', onUp, { capture: true })
    el.addEventListener('contextmenu', onCtx)
    return () => {
      el.removeEventListener('mousedown', onDown, { capture: true })
      el.removeEventListener('mouseup', onUp, { capture: true })
      el.removeEventListener('contextmenu', onCtx)
    }
  }, [pan])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = panDragRef.current
      if (!drag) return
      setPan({
        x: drag.startPan.x + (e.clientX - drag.startClientX),
        y: drag.startPan.y + (e.clientY - drag.startClientY)
      })
    }
    const onUp = (e: MouseEvent) => {
      if (e.button !== 2) return
      panDragRef.current = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const pointerToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const stage = stageRef.current
      if (!stage || fitScale === null) return null
      const rect = stage.container().getBoundingClientRect()
      return {
        x: (clientX - rect.left) / effectiveScale,
        y: (clientY - rect.top) / effectiveScale
      }
    },
    [fitScale, effectiveScale]
  )

  const isCellOccupied = useCallback(
    (row: number, col: number) => {
      if (!page) return false
      return page.canvasImages.some((ci) => {
        const cell = pointToCell(ci.x + ci.width / 2, ci.y + ci.height / 2, page.settings)
        return cell?.row === row && cell?.col === col
      })
    },
    [page]
  )

  const onDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('application/x-canvaspage-image')) return
    e.preventDefault()
    if (!page || page.settings.autoAlign !== 'grid') {
      if (trayDrag) setTrayDrag(null)
      return
    }
    const pt = pointerToCanvas(e.clientX, e.clientY)
    if (!pt) return
    const cell = pointToCell(pt.x, pt.y, page.settings)
    const nextRow = cell?.row ?? null
    const nextCol = cell?.col ?? null
    const nextOccupied = cell ? isCellOccupied(cell.row, cell.col) : false
    setTrayDrag((prev) => {
      if (
        prev &&
        prev.row === nextRow &&
        prev.col === nextCol &&
        prev.occupied === nextOccupied
      ) {
        return prev
      }
      return { row: nextRow, col: nextCol, occupied: nextOccupied }
    })
  }

  const onDragLeave = (e: React.DragEvent) => {
    if (!e.relatedTarget) setTrayDrag(null)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setTrayDrag(null)
    if (!page) return
    const imageId = e.dataTransfer.getData('application/x-canvaspage-image')
    if (!imageId) return
    const img = images.find((i) => i.id === imageId)
    if (!img) return
    const pt = pointerToCanvas(e.clientX, e.clientY)
    if (!pt) return

    const autoAlign = page.settings.autoAlign
    let targetCell: { row: number; col: number } | null = null
    if (autoAlign === 'grid') {
      const cell = pointToCell(pt.x, pt.y, page.settings)
      if (!cell) {
        showDropError('Drop on a grid cell', 'Release the image over a cell inside the page.')
        return
      }
      if (isCellOccupied(cell.row, cell.col)) {
        showDropError('Cell is occupied', 'Pick an empty cell or swap images after placing.')
        return
      }
      targetCell = cell
    }

    const el = document.createElement('img')
    el.onload = () => {
      const natW = el.naturalWidth
      const natH = el.naturalHeight
      const defaultW = 240
      const aspect = natH / natW
      const width = defaultW
      const height = defaultW * aspect
      const nextZ = page.canvasImages.length
      const ci: CanvasImage = {
        id: makeId(),
        imageId,
        x: pt.x - width / 2,
        y: pt.y - height / 2,
        width,
        height,
        zIndex: nextZ,
        natW,
        natH
      }
      const res = addCanvasImage(
        page.id,
        ci,
        targetCell ? { targetCell } : undefined
      )
      if (res.rejected) {
        if (res.reason === 'cell-occupied') {
          showDropError('Cell is occupied', 'Pick an empty cell or swap images after placing.')
        } else if (res.reason === 'cell-out-of-range') {
          showDropError('Drop on a grid cell', 'Release the image over a cell inside the page.')
        } else if (autoAlign === 'masonry') {
          showDropError(
            'Page is full',
            'Increase columns in page settings or disable auto-align.'
          )
        } else {
          showDropError(
            'Grid is full',
            'Increase rows/columns in page settings or disable auto-align.'
          )
        }
      }
    }
    el.src = img.url
  }

  let toolbarPos: { x: number; y: number } | null = null
  if (selected && fitScale !== null) {
    toolbarPos = {
      x: (selected.x + selected.width / 2) * effectiveScale,
      y: selected.y * effectiveScale - 8
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden min-w-0 min-h-0"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {!page ? (
        <div className="text-muted-foreground">No page</div>
      ) : fitScale === null ? null : (
      <div
        className="relative"
        style={{ width: stageWidth, height: stageHeight, transform: `translate(${pan.x}px, ${pan.y}px)` }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-sm bg-white shadow-2xl"
          aria-hidden
        />
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          scaleX={effectiveScale}
          scaleY={effectiveScale}
          onMouseDown={(e) => {
            if (cropMode) return
            if (e.target === e.target.getStage()) setSelectedId(null)
          }}
        >
          <Layer clipFunc={(ctx) => ctx.rect(0, 0, A4_W, A4_H)}>
            <Rect
              x={0}
              y={0}
              width={A4_W}
              height={A4_H}
              fill="#ffffff"
              onClick={() => { if (!cropMode) setSelectedId(null) }}
            />
            {page.settings.autoAlign === 'grid' && (() => {
              const m = cellMetrics(page.settings)
              if (m.cellW <= 0 || m.cellH <= 0) return null
              const rects: React.ReactNode[] = []
              for (let r = 0; r < m.gridRows; r++) {
                for (let c = 0; c < m.gridCols; c++) {
                  rects.push(
                    <Rect
                      key={`cell-${r}-${c}`}
                      x={m.originX(c)}
                      y={m.originY(r)}
                      width={m.cellW}
                      height={m.cellH}
                      stroke="#d4d4d4"
                      strokeWidth={1 / effectiveScale}
                      dash={[6 / effectiveScale, 4 / effectiveScale]}
                      listening={false}
                    />
                  )
                }
              }
              return rects
            })()}
            {page.settings.autoAlign === 'masonry' && (() => {
              const m = masonryMetrics(page.settings)
              if (m.colW <= 0 || m.usableH <= 0) return null
              const rects: React.ReactNode[] = []
              for (let c = 0; c < m.gridCols; c++) {
                rects.push(
                  <Rect
                    key={`col-${c}`}
                    x={m.originX(c)}
                    y={m.marginV}
                    width={m.colW}
                    height={m.usableH}
                    stroke="#d4d4d4"
                    strokeWidth={1 / effectiveScale}
                    dash={[6 / effectiveScale, 4 / effectiveScale]}
                    listening={false}
                  />
                )
              }
              return rects
            })()}
            {sorted.map((ci) => {
              const src = imagesById.get(ci.imageId)
              if (!src) return null
              return (
                <CanvasImageNode
                  key={ci.id}
                  ci={ci}
                  src={src}
                  isSelected={ci.id === selectedId}
                  draggable={!cropMode}
                  lifted={dragState?.id === ci.id || masonryDrag?.id === ci.id}
                  onSelect={() => {
                    if (cropMode) return
                    setSelectedId(ci.id)
                  }}
                  onDragStart={() => {
                    if (page.settings.autoAlign === 'grid') {
                      const cell = pointToCell(
                        ci.x + ci.width / 2,
                        ci.y + ci.height / 2,
                        page.settings
                      )
                      if (!cell) return
                      setDragState({
                        id: ci.id,
                        origRow: cell.row,
                        origCol: cell.col,
                        hoverRow: cell.row,
                        hoverCol: cell.col
                      })
                    } else if (page.settings.autoAlign === 'masonry') {
                      setMasonryDrag({ id: ci.id, insertIndex: null })
                    }
                  }}
                  onDragMove={(e) => {
                    if (page.settings.autoAlign === 'grid') {
                      const node = e.target
                      const cx = node.x() + ci.width / 2
                      const cy = node.y() + ci.height / 2
                      const cell = pointToCell(cx, cy, page.settings)
                      setDragState((prev) => {
                        if (!prev) return prev
                        const nextRow = cell?.row ?? null
                        const nextCol = cell?.col ?? null
                        if (prev.hoverRow === nextRow && prev.hoverCol === nextCol) {
                          return prev
                        }
                        return { ...prev, hoverRow: nextRow, hoverCol: nextCol }
                      })
                    } else if (page.settings.autoAlign === 'masonry') {
                      const node = e.target
                      const cx = node.x() + ci.width / 2
                      const cy = node.y() + ci.height / 2
                      const idx = masonryInsertIndex(cx, cy, ci.id)
                      setMasonryDrag((prev) => {
                        if (!prev) return prev
                        if (prev.insertIndex === idx) return prev
                        return { ...prev, insertIndex: idx }
                      })
                    }
                  }}
                  onChange={(eventPatch) => {
                    if (page.settings.autoAlign === 'grid') {
                      const drag = dragState
                      setDragState(null)
                      const node = nodeMap.current.get(ci.id)
                      let targetRow: number
                      let targetCol: number
                      let useSnap = false
                      if (!drag || drag.id !== ci.id) {
                        targetRow = drag?.origRow ?? 0
                        targetCol = drag?.origCol ?? 0
                      } else if (drag.hoverRow === null || drag.hoverCol === null) {
                        targetRow = drag.origRow
                        targetCol = drag.origCol
                      } else {
                        targetRow = drag.hoverRow
                        targetCol = drag.hoverCol
                        useSnap = true
                      }
                      const fit = fitToCell(
                        ci.natW,
                        ci.natH,
                        targetRow,
                        targetCol,
                        page.settings
                      )
                      if (node) node.position({ x: fit.x, y: fit.y })
                      if (useSnap) {
                        dragSnapToCell(page.id, ci.id, targetRow, targetCol)
                      } else {
                        updateCanvasImage(page.id, ci.id, fit)
                      }
                      return
                    }
                    if (page.settings.autoAlign === 'masonry') {
                      const drag = masonryDrag
                      setMasonryDrag(null)
                      const node = nodeMap.current.get(ci.id)
                      if (node) node.position({ x: ci.x, y: ci.y })
                      if (drag && drag.insertIndex !== null) {
                        const result = reorderMasonryImage(page.id, ci.id, drag.insertIndex)
                        if (result.dropped > 0) {
                          showDropError(
                            'Images removed',
                            `${result.dropped} image${result.dropped > 1 ? 's' : ''} removed — not enough space.`
                          )
                        }
                      } else {
                        const result = reorderMasonryImage(
                          page.id,
                          ci.id,
                          sorted.findIndex((s) => s.id === ci.id)
                        )
                        if (result.dropped > 0) {
                          showDropError(
                            'Images removed',
                            `${result.dropped} image${result.dropped > 1 ? 's' : ''} removed — not enough space.`
                          )
                        }
                      }
                      return
                    }
                    updateCanvasImage(page.id, ci.id, eventPatch)
                  }}
                  onNodeRef={(node) => {
                    if (node) nodeMap.current.set(ci.id, node)
                    else nodeMap.current.delete(ci.id)
                  }}
                />
              )
            })}
            {page.settings.autoAlign === 'grid' && dragState && (() => {
              const m = cellMetrics(page.settings)
              if (m.cellW <= 0 || m.cellH <= 0) return null
              const overlays: React.ReactNode[] = []
              const showGhost =
                dragState.hoverRow !== dragState.origRow ||
                dragState.hoverCol !== dragState.origCol
              if (showGhost) {
                overlays.push(
                  <Rect
                    key="drag-ghost"
                    x={m.originX(dragState.origCol)}
                    y={m.originY(dragState.origRow)}
                    width={m.cellW}
                    height={m.cellH}
                    fill="rgba(0,0,0,0.06)"
                    stroke="#a3a3a3"
                    strokeWidth={1.5 / effectiveScale}
                    dash={[6 / effectiveScale, 4 / effectiveScale]}
                    listening={false}
                  />
                )
              }
              if (dragState.hoverRow !== null && dragState.hoverCol !== null) {
                overlays.push(
                  <Rect
                    key="drag-hover"
                    x={m.originX(dragState.hoverCol)}
                    y={m.originY(dragState.hoverRow)}
                    width={m.cellW}
                    height={m.cellH}
                    fill="rgba(99,102,241,0.25)"
                    listening={false}
                  />
                )
              }
              return overlays
            })()}
            {page.settings.autoAlign === 'grid' && trayDrag && trayDrag.row !== null && trayDrag.col !== null && (() => {
              const m = cellMetrics(page.settings)
              if (m.cellW <= 0 || m.cellH <= 0) return null
              const fill = trayDrag.occupied
                ? 'rgba(239,68,68,0.22)'
                : 'rgba(99,102,241,0.25)'
              return (
                <Rect
                  key="tray-drag-hover"
                  x={m.originX(trayDrag.col)}
                  y={m.originY(trayDrag.row)}
                  width={m.cellW}
                  height={m.cellH}
                  fill={fill}
                  listening={false}
                />
              )
            })()}
            {page.settings.autoAlign === 'masonry' && masonryDrag && masonryDrag.insertIndex !== null && (() => {
              const m = masonryMetrics(page.settings)
              if (m.colW <= 0) return null
              const others = sorted.filter((ci) => ci.id !== masonryDrag.id)
              const idx = masonryDrag.insertIndex
              let lineY: number
              let lineCol: number
              if (idx === 0 && others.length === 0) {
                lineY = m.marginV
                lineCol = 0
              } else if (idx > 0 && idx <= others.length) {
                const prev = others[idx - 1]
                lineCol = Math.round((prev.x - m.marginH) / (m.colW + m.gridGap))
                lineY = prev.y + prev.height + m.gridGap / 2
              } else {
                const first = others[0]
                if (first) {
                  lineCol = Math.round((first.x - m.marginH) / (m.colW + m.gridGap))
                  lineY = first.y - m.gridGap / 2
                } else {
                  lineY = m.marginV
                  lineCol = 0
                }
              }
              const lx = m.originX(Math.max(0, Math.min(lineCol, m.gridCols - 1)))
              return (
                <Line
                  key="masonry-insert-line"
                  points={[lx, lineY, lx + m.colW, lineY]}
                  stroke="#6366f1"
                  strokeWidth={2.5 / effectiveScale}
                  listening={false}
                />
              )
            })()}
            {cropMode && (() => {
              const cropCi = sorted.find((ci) => ci.id === cropMode.id)
              if (!cropCi) return null
              return (
                <CropOverlay
                  ci={cropCi}
                  scale={effectiveScale}
                  onUpdate={handleCropUpdate}
                />
              )
            })()}
            <Transformer
              ref={transformerRef}
              rotateEnabled={false}
              keepRatio={false}
              resizeEnabled={page.settings.autoAlign === 'off' && !cropMode}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) return oldBox
                return newBox
              }}
            />
          </Layer>
        </Stage>
        {selected && toolbarPos && !dragState && !masonryDrag && (
          <SelectionToolbar
            x={toolbarPos.x}
            y={toolbarPos.y}
            showStackingControls={page.settings.autoAlign === 'off' && !cropMode}
            isCropping={cropMode?.id === selected.id}
            hasCrop={!!selected.crop}
            onBringForward={() => bringForward(page.id, selected.id)}
            onSendBackward={() => sendBackward(page.id, selected.id)}
            onDelete={() => {
              removeCanvasImage(page.id, selected.id)
              setSelectedId(null)
              setCropMode(null)
            }}
            onCropStart={() => setCropMode({ id: selected.id, pendingCrop: null })}
            onCropCancel={() => setCropMode(null)}
            onCropReset={() => {
              const scaleX = selected.width / (selected.crop?.width ?? selected.natW)
              updateCanvasImage(page.id, selected.id, {
                crop: undefined,
                width: selected.natW * scaleX,
                height: selected.natH * scaleX
              })
              if (page.settings.autoAlign !== 'off') {
                reflowAutoAlign(page.id)
              }
              setCropMode(null)
            }}
            onCropConfirm={() => {
              if (cropMode?.pendingCrop) {
                const prevCropW = selected.crop?.width ?? selected.natW
                const prevCropH = selected.crop?.height ?? selected.natH
                const scaleX = selected.width / prevCropW
                const scaleY = selected.height / prevCropH
                updateCanvasImage(page.id, selected.id, {
                  crop: cropMode.pendingCrop,
                  width: cropMode.pendingCrop.width * scaleX,
                  height: cropMode.pendingCrop.height * scaleY
                })
                if (page.settings.autoAlign !== 'off') {
                  reflowAutoAlign(page.id)
                }
              }
              setCropMode(null)
            }}
          />
        )}
      </div>
      )}
      {fitScale !== null && (
        <ZoomControls
          zoom={zoom}
          canZoomIn={zoom < MAX_ZOOM}
          canZoomOut={zoom > MIN_ZOOM}
          showFit={zoom > MIN_ZOOM || pan.x !== 0 || pan.y !== 0}
          onZoomIn={() => zoomAtCenter(zoom + ZOOM_STEP)}
          onZoomOut={() => zoomAtCenter(zoom - ZOOM_STEP)}
          onFit={resetView}
        />
      )}
    </div>
  )
}
