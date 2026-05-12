import type { Album, ImageItem } from '@/store'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface ListViewProps {
  images: ImageItem[]
  albums: Album[]
  selectedIds: Set<string>
  onSelect: (id: string) => void
  onPreview: (id: string) => void
}

export default function ListView({ images, albums, selectedIds, onSelect, onPreview }: ListViewProps) {
  if (images.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">No images found</p>
      </div>
    )
  }

  const albumMap = new Map(albums.map((a) => [a.id, a.name]))

  return (
    <div className="p-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="w-8 pb-2" />
            <th className="w-12 pb-2" />
            <th className="pb-2 text-left font-medium">Name</th>
            <th className="pb-2 text-left font-medium">Album</th>
            <th className="pb-2 text-left font-medium">Size</th>
          </tr>
        </thead>
        <tbody>
          {images.map((img) => {
            const selected = selectedIds.has(img.id)
            return (
              <tr
                key={img.id}
                className={`border-b border-border/50 cursor-pointer hover:bg-accent/30 transition-colors ${selected ? 'bg-primary/10' : ''}`}
                onClick={() => onPreview(img.id)}
              >
                <td className="py-2 pr-2" onClick={(e) => { e.stopPropagation(); onSelect(img.id) }}>
                  <div
                    className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors ${
                      selected ? 'bg-primary border-primary' : 'border-border'
                    }`}
                  >
                    {selected && (
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </td>
                <td className="py-2 pr-2">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                </td>
                <td className="py-2 pr-4 font-medium truncate max-w-[200px]">{img.name}</td>
                <td className="py-2 pr-4 text-muted-foreground">{albumMap.get(img.albumId) ?? '—'}</td>
                <td className="py-2 pr-4 text-muted-foreground">{formatSize(img.size)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
