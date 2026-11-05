import type { ImageItem } from '@/store'
import SelectCheckbox from './SelectCheckbox'

interface ImageCardProps {
  image: ImageItem
  selected: boolean
  onSelect: () => void
  onPreview: () => void
}

export default function ImageCard({ image, selected, onSelect, onPreview }: ImageCardProps) {
  return (
    <div
      className={`relative group cursor-pointer rounded-md overflow-hidden ${selected ? 'ring-2 ring-primary' : ''}`}
      onClick={onPreview}
    >
      <img
        src={image.url}
        alt={image.name}
        className="w-full object-cover rounded-md"
        draggable={false}
      />
      <div
        className={`absolute top-2 left-2 flex items-center justify-center ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        <SelectCheckbox
          checked={selected}
          uncheckedClassName="bg-white/80 border-white"
          className="h-5 w-5"
          iconClassName="h-3 w-3"
        />
      </div>
    </div>
  )
}
