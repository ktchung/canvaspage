import ImageCard from './ImageCard'
import type { ImageItem } from '@/store'

interface MasonryGridProps {
  images: ImageItem[]
  selectedIds: Set<string>
  onSelect: (id: string) => void
  onPreview: (id: string) => void
}

export default function MasonryGrid({ images, selectedIds, onSelect, onPreview }: MasonryGridProps) {
  return (
    <div className="columns-2 gap-2 p-4 [column-fill:_balance] md:columns-3">
      {images.map((img) => (
        <div key={img.id} className="break-inside-avoid mb-2">
          <ImageCard
            image={img}
            selected={selectedIds.has(img.id)}
            onSelect={() => onSelect(img.id)}
            onPreview={() => onPreview(img.id)}
          />
        </div>
      ))}
    </div>
  )
}
