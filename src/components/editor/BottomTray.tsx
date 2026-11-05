import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useAppStore } from '@/store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import AssetThumb from './AssetThumb'
import ImagePreviewDialog from '@/components/shared/ImagePreviewDialog'
import DeleteConfirmDialog, { imageDeleteCopy } from '@/components/shared/DeleteConfirmDialog'
import { placeImageOnPage } from '@/lib/placeImage'

export default function BottomTray() {
  const albums = useAppStore((s) => s.albums)
  const images = useAppStore((s) => s.images)
  const pages = useAppStore((s) => s.pages)
  const deleteImage = useAppStore((s) => s.deleteImage)
  const activePageId = useAppStore((s) => s.activePageId)
  const navigate = useNavigate()

  const [albumId, setAlbumId] = useState<string>('all')
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(
    () => (albumId === 'all' ? images : images.filter((i) => i.albumId === albumId)),
    [images, albumId]
  )

  const pageMap = useMemo(() => {
    const map = new Map<string, number[]>()
    pages.forEach((page, i) => {
      for (const ci of page.canvasImages) {
        const arr = map.get(ci.imageId)
        if (arr) {
          if (!arr.includes(i + 1)) arr.push(i + 1)
        } else {
          map.set(ci.imageId, [i + 1])
        }
      }
    })
    return map
  }, [pages])

  const previewImage = previewId ? images.find((i) => i.id === previewId) ?? null : null
  const previewAlbum = previewImage
    ? albums.find((a) => a.id === previewImage.albumId)
    : undefined

  function handlePreviewDelete() {
    setPreviewId(null)
    setDeleteId(previewId)
  }

  function handleConfirmDelete() {
    if (deleteId) deleteImage(deleteId)
    setDeleteId(null)
  }

  function handleAddToPage() {
    if (!previewImage || !activePageId) return
    setPreviewId(null)
    placeImageOnPage(activePageId, previewImage)
  }

  return (
    <div className="flex flex-col gap-2 border-t border-border bg-card px-4 py-3">
      <div className="flex items-center">
        <Select value={albumId} onValueChange={setAlbumId}>
          <SelectTrigger className="h-8 rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Images</SelectItem>
            {albums.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto">
        {filtered.map((img, i) => (
          <AssetThumb
            key={img.id}
            image={img}
            index={i + 1}
            pageNums={pageMap.get(img.id)}
            onClick={() => setPreviewId(img.id)}
          />
        ))}
        <button
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
          onClick={() => navigate({ to: '/import' })}
          title="Import more"
        >
          <Plus size={20} />
        </button>
      </div>

      <ImagePreviewDialog
        image={previewImage}
        album={previewAlbum}
        onClose={() => setPreviewId(null)}
        onDelete={handlePreviewDelete}
        onAddToPage={activePageId ? handleAddToPage : undefined}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        {...imageDeleteCopy(1)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
