import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import TopBar from '@/components/shared/TopBar'
import GalleryToolbar from '@/components/gallery/GalleryToolbar'
import MasonryGrid from '@/components/gallery/MasonryGrid'
import ListView from '@/components/gallery/ListView'
import ImagePreviewDialog from '@/components/shared/ImagePreviewDialog'
import DeleteConfirmDialog from '@/components/gallery/DeleteConfirmDialog'
import { useAppStore } from '@/store'

interface GallerySearch {
  album?: string
}

export const Route = createFileRoute('/gallery')({
  component: GalleryPage,
  validateSearch: (search: Record<string, unknown>): GallerySearch => ({
    album: typeof search.album === 'string' ? search.album : undefined
  })
})

function GalleryPage() {
  const { album: albumParam } = Route.useSearch()
  const navigate = useNavigate()
  const images = useAppStore((s) => s.images)
  const albums = useAppStore((s) => s.albums)
  const deleteImage = useAppStore((s) => s.deleteImage)
  const deleteAlbum = useAppStore((s) => s.deleteAlbum)

  const [albumFilter, setAlbumFilter] = useState<string>(albumParam ?? 'all')

  useEffect(() => {
    if (albumParam) {
      setAlbumFilter(albumParam)
      navigate({ to: '/gallery', search: {}, replace: true })
    }
  }, [albumParam, navigate])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[] } | null>(null)

  const filteredImages =
    albumFilter === 'all' ? images : images.filter((i) => i.albumId === albumFilter)

  const previewImage = previewId ? images.find((i) => i.id === previewId) ?? null : null
  const previewAlbum = previewImage ? albums.find((a) => a.id === previewImage.albumId) : undefined

  function handleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleBulkDelete() {
    if (selectedIds.size === 0) return
    setDeleteTarget({ ids: [...selectedIds] })
  }

  function handlePreviewDelete() {
    if (!previewId) return
    setPreviewId(null)
    setDeleteTarget({ ids: [previewId] })
  }

  function handleDeleteAlbum(albumId: string) {
    deleteAlbum(albumId)
    if (albumFilter === albumId) setAlbumFilter('all')
    setSelectedIds(new Set())
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return
    deleteTarget.ids.forEach((id) => deleteImage(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      deleteTarget.ids.forEach((id) => next.delete(id))
      return next
    })
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Gallery" />
      <GalleryToolbar
        albums={albums}
        albumFilter={albumFilter}
        onAlbumChange={setAlbumFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selectedIds.size}
        onBulkDelete={handleBulkDelete}
        onDeleteAlbum={handleDeleteAlbum}
      />
      <div className="flex-1 overflow-y-auto">
        {filteredImages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground text-sm">No images found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <MasonryGrid
            images={filteredImages}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onPreview={setPreviewId}
          />
        ) : (
          <ListView
            images={filteredImages}
            albums={albums}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onPreview={setPreviewId}
          />
        )}
      </div>

      <ImagePreviewDialog
        image={previewImage}
        album={previewAlbum}
        onClose={() => setPreviewId(null)}
        onDelete={handlePreviewDelete}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        count={deleteTarget?.ids.length ?? 0}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
