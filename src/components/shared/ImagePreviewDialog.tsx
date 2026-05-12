import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle
} from '@/components/ui/dialog'
import type { Album, ImageItem } from '@/store'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface ImagePreviewDialogProps {
  image: ImageItem | null
  album: Album | undefined
  onClose: () => void
  onDelete: () => void
}

export default function ImagePreviewDialog({
  image,
  album,
  onClose,
  onDelete
}: ImagePreviewDialogProps) {
  const open = image !== null

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl bg-card p-0 overflow-hidden"
        aria-describedby={undefined}
      >
        {image && (
          <>
            <DialogTitle className="sr-only">{image?.name ?? 'Image preview'}</DialogTitle>
            {/* Close button */}
            <DialogClose className="absolute top-3 right-3 z-10 rounded-sm opacity-70 hover:opacity-100 transition-opacity">
              <span className="sr-only">Close</span>
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </DialogClose>

            {/* Image */}
            <div className="flex items-center justify-center bg-black/20 p-4">
              <img
                src={image.url}
                alt={image.name}
                className="max-h-[60vh] w-full object-contain"
              />
            </div>

            {/* Bottom bar */}
            <div className="flex items-end justify-between px-4 py-3">
              {/* Left: badge, name, metadata */}
              <div className="flex flex-col gap-1">
                {album && (
                  <Badge variant="outline" className="text-primary uppercase text-xs w-fit">
                    {album.name}
                  </Badge>
                )}
                <p className="text-base font-semibold leading-tight">{image.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(image.size)} • {album?.name ?? '—'}
                </p>
              </div>

              {/* Right: action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="icon-sm"
                  onClick={onDelete}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
