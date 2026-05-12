import { useCallback, useEffect, useRef, useState } from 'react'
import { Rect, Group } from 'react-konva'
import type Konva from 'konva'
import type { CropRect, CanvasImage } from '@/store'

const HANDLE_SIZE = 8
const MIN_CROP_NAT = 20

type Edge = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se'

interface Props {
  ci: CanvasImage
  scale: number
  onUpdate: (crop: CropRect) => void
}

export default function CropOverlay({ ci, scale, onUpdate }: Props) {
  const visibleX = ci.crop?.x ?? 0
  const visibleY = ci.crop?.y ?? 0
  const visibleW = ci.crop?.width ?? ci.natW
  const visibleH = ci.crop?.height ?? ci.natH

  const sx = ci.width / visibleW
  const sy = ci.height / visibleH

  const [local, setLocal] = useState<CropRect>({
    x: visibleX,
    y: visibleY,
    width: visibleW,
    height: visibleH
  })

  const dragRef = useRef<{
    edge: Edge
    startMouseX: number
    startMouseY: number
    startCrop: CropRect
  } | null>(null)

  const clampCrop = useCallback(
    (c: CropRect): CropRect => {
      let { x, y, width, height } = c
      const maxX = visibleX + visibleW
      const maxY = visibleY + visibleH
      if (x < visibleX) { width -= (visibleX - x); x = visibleX }
      if (y < visibleY) { height -= (visibleY - y); y = visibleY }
      width = Math.max(MIN_CROP_NAT, Math.min(width, maxX - x))
      height = Math.max(MIN_CROP_NAT, Math.min(height, maxY - y))
      return { x, y, width, height }
    },
    [visibleX, visibleY, visibleW, visibleH]
  )

  const applyDelta = useCallback(
    (edge: Edge, dxNat: number, dyNat: number, start: CropRect): CropRect => {
      let { x, y, width, height } = start

      const moveTop = edge === 'nw' || edge === 'n' || edge === 'ne'
      const moveBottom = edge === 'sw' || edge === 's' || edge === 'se'
      const moveLeft = edge === 'nw' || edge === 'w' || edge === 'sw'
      const moveRight = edge === 'ne' || edge === 'e' || edge === 'se'

      if (moveTop) { y += dyNat; height -= dyNat }
      if (moveBottom) { height += dyNat }
      if (moveLeft) { x += dxNat; width -= dxNat }
      if (moveRight) { width += dxNat }

      return clampCrop({ x, y, width, height })
    },
    [clampCrop]
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current
      if (!d) return
      const dxCanvas = e.clientX - d.startMouseX
      const dyCanvas = e.clientY - d.startMouseY
      const dxNat = dxCanvas / (scale * sx)
      const dyNat = dyCanvas / (scale * sy)
      const next = applyDelta(d.edge, dxNat, dyNat, d.startCrop)
      setLocal(next)
      onUpdate(next)
    }
    const onUp = () => {
      dragRef.current = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [scale, sx, sy, applyDelta, onUpdate])

  const toDisplay = (crop: CropRect) => ({
    x: ci.x + (crop.x - visibleX) * sx,
    y: ci.y + (crop.y - visibleY) * sy,
    w: crop.width * sx,
    h: crop.height * sy
  })

  const d = toDisplay(local)
  const hs = HANDLE_SIZE / scale

  const handlePos: [Edge, number, number][] = [
    ['nw', d.x, d.y],
    ['n', d.x + d.w / 2, d.y],
    ['ne', d.x + d.w, d.y],
    ['w', d.x, d.y + d.h / 2],
    ['e', d.x + d.w, d.y + d.h / 2],
    ['sw', d.x, d.y + d.h],
    ['s', d.x + d.w / 2, d.y + d.h],
    ['se', d.x + d.w, d.y + d.h]
  ]

  const startDrag = (edge: Edge, e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    const me = e.evt
    dragRef.current = {
      edge,
      startMouseX: me.clientX,
      startMouseY: me.clientY,
      startCrop: { ...local }
    }
  }

  const maskOpacity = 0.5

  return (
    <Group>
      {/* Top mask */}
      <Rect
        x={ci.x} y={ci.y}
        width={ci.width} height={Math.max(0, d.y - ci.y)}
        fill="black" opacity={maskOpacity} listening={false}
      />
      {/* Bottom mask */}
      <Rect
        x={ci.x} y={d.y + d.h}
        width={ci.width} height={Math.max(0, ci.y + ci.height - d.y - d.h)}
        fill="black" opacity={maskOpacity} listening={false}
      />
      {/* Left mask */}
      <Rect
        x={ci.x} y={d.y}
        width={Math.max(0, d.x - ci.x)} height={d.h}
        fill="black" opacity={maskOpacity} listening={false}
      />
      {/* Right mask */}
      <Rect
        x={d.x + d.w} y={d.y}
        width={Math.max(0, ci.x + ci.width - d.x - d.w)} height={d.h}
        fill="black" opacity={maskOpacity} listening={false}
      />

      {/* Crop border */}
      <Rect
        x={d.x} y={d.y} width={d.w} height={d.h}
        stroke="#ffffff" strokeWidth={1.5 / scale}
        listening={false}
      />

      {/* Handles */}
      {handlePos.map(([edge, hx, hy]) => (
        <Rect
          key={edge}
          x={hx - hs / 2} y={hy - hs / 2}
          width={hs} height={hs}
          fill="#ffffff" stroke="#6366f1" strokeWidth={1 / scale}
          onMouseDown={(e) => startDrag(edge, e)}
        />
      ))}
    </Group>
  )
}
