import type { ImageItem } from '@/store'

interface Props {
  image: ImageItem
  index?: number
  pageNums?: number[]
  onClick: () => void
}

export default function AssetThumb({ image, index, pageNums, onClick }: Props) {
  const hasPages = pageNums && pageNums.length > 0

  return (
    <button
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-canvaspage-image', image.id)
        e.dataTransfer.effectAllowed = 'copy'
      }}
      onClick={onClick}
      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md ring-1 m-[1px] ${hasPages ? 'ring-primary' : 'ring-border hover:ring-primary'}`}
      title={image.name}
    >
      <img
        src={image.url}
        alt={image.name}
        draggable={false}
        className="h-full w-full object-contain"
      />
      {hasPages && (
        <span className="absolute top-1 right-1 flex items-center gap-0.5 rounded bg-black/70 px-1 py-0.5 text-[9px] font-medium text-white leading-none">
          {pageNums.slice(0, 2).map((n) => `p.${n}`).join(' ')}
          {pageNums.length > 2 && ' ...'}
        </span>
      )}
      {index !== undefined && (
        <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {index}
        </span>
      )}
    </button>
  )
}
