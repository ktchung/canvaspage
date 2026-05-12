import type { ImageItem } from '@/store'

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
        <div
          className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
            selected
              ? 'bg-primary border-primary'
              : 'bg-white/80 border-white'
          }`}
        >
          {selected && (
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}
