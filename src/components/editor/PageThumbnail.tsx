import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { X } from 'lucide-react'
import { useAppStore, A4_W, A4_H } from '@/store'
import type { DocumentPage } from '@/store'
import { cn } from '@/lib/utils'

interface Props {
  page: DocumentPage
  index: number
  active: boolean
  onSelect: () => void
  onDelete: () => void
}

export default function PageThumbnail({ page, index, active, onSelect, onDelete }: Props) {
  const images = useAppStore((s) => s.images)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.id })

  const sorted = [...page.canvasImages].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group relative w-[88px] cursor-pointer',
        isDragging && 'opacity-50'
      )}
      {...attributes}
      {...listeners}
      onClick={onSelect}
    >
      <div
        className={cn(
          'relative aspect-[794/1123] overflow-hidden rounded-sm bg-white ring-1 ring-border',
          active && 'ring-2 ring-primary'
        )}
      >
        {sorted.map((ci) => {
          const img = images.find((i) => i.id === ci.imageId)
          if (!img) return null
          const crop = ci.crop
          let cropStyle: React.CSSProperties = {}
          if (crop) {
            const top = (crop.y / ci.natH) * 100
            const left = (crop.x / ci.natW) * 100
            const bottom = ((ci.natH - crop.y - crop.height) / ci.natH) * 100
            const right = ((ci.natW - crop.x - crop.width) / ci.natW) * 100
            cropStyle = { objectViewBox: `inset(${top}% ${right}% ${bottom}% ${left}%)` }
          }
          return (
            <img
              key={ci.id}
              src={img.url}
              draggable={false}
              style={{
                position: 'absolute',
                left: `${(ci.x / A4_W) * 100}%`,
                top: `${(ci.y / A4_H) * 100}%`,
                width: `${(ci.width / A4_W) * 100}%`,
                height: `${(ci.height / A4_H) * 100}%`,
                objectFit: 'fill',
                pointerEvents: 'none',
                ...cropStyle
              }}
              alt=""
            />
          )
        })}
        <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {String(index + 1).padStart(2, '0')}
        </span>
        <button
          className="absolute top-1 right-1 hidden h-5 w-5 items-center justify-center rounded bg-black/70 text-white hover:bg-destructive group-hover:flex"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          title="Delete page"
        >
          <X size={10} />
        </button>
      </div>
    </div>
  )
}
