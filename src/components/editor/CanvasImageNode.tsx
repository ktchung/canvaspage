import { useEffect, useRef } from 'react'
import { Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { CanvasImage } from '@/store'

interface Props {
  ci: CanvasImage
  src: string
  isSelected: boolean
  draggable: boolean
  lifted?: boolean
  onSelect: () => void
  onChange: (patch: Partial<CanvasImage>) => void
  onNodeRef: (node: Konva.Image | null) => void
  onDragStart?: (e: KonvaEventObject<DragEvent>) => void
  onDragMove?: (e: KonvaEventObject<DragEvent>) => void
}

export default function CanvasImageNode({
  ci,
  src,
  isSelected,
  draggable,
  lifted,
  onSelect,
  onChange,
  onNodeRef,
  onDragStart,
  onDragMove
}: Props) {
  const [img] = useImage(src)
  const nodeRef = useRef<Konva.Image | null>(null)

  useEffect(() => {
    onNodeRef(isSelected ? nodeRef.current : null)
  }, [isSelected, img])

  return (
    <KonvaImage
      ref={(n) => {
        nodeRef.current = n
        if (isSelected) onNodeRef(n)
      }}
      image={img}
      listening={!!img}
      x={ci.x}
      y={ci.y}
      width={ci.width}
      height={ci.height}
      crop={ci.crop}
      draggable={draggable}
      shadowColor="#000"
      shadowBlur={lifted ? 12 : 0}
      shadowOpacity={lifted ? 0.35 : 0}
      onMouseDown={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={(e) => {
        onChange({ x: e.target.x(), y: e.target.y() })
      }}
      onTransformEnd={() => {
        const node = nodeRef.current
        if (!node) return
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        node.scaleX(1)
        node.scaleY(1)
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(10, node.width() * scaleX),
          height: Math.max(10, node.height() * scaleY)
        })
      }}
    />
  )
}
