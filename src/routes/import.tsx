import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import TopBar from '@/components/shared/TopBar'
import FileImportDialog from '@/components/import/FileImportDialog'
import ToastCard from '@/components/shared/ToastCard'
import { Button } from '@/components/ui/button'
import { makeId, useAppStore } from '@/store'
import type { ImageItem } from '@/store'

export const Route = createFileRoute('/import')({
  component: ImportPage
})

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

function filterImageFiles(files: FileList | null): File[] {
  if (!files) return []
  return Array.from(files).filter((f) => ACCEPTED_TYPES.includes(f.type))
}

function ImportPage() {
  const navigate = useNavigate()
  const albums = useAppStore((s) => s.albums)
  const addAlbum = useAppStore((s) => s.addAlbum)
  const addImages = useAppStore((s) => s.addImages)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileDialogOpen, setFileDialogOpen] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [errorToast, setErrorToast] = useState<{ title: string; description: string } | null>(null)

  function acceptFiles(files: File[]) {
    if (files.length === 0) {
      setErrorToast({
        title: 'No valid images',
        description: 'Only PNG, JPG, and WEBP files are supported.'
      })
      return
    }
    setPendingFiles(files)
    setFileDialogOpen(true)
  }

  function handleFileImportConfirm(albumId: string | null, newAlbumName: string | null) {
    const resolvedAlbumId = albumId ?? addAlbum(newAlbumName!)

    const newImages: ImageItem[] = pendingFiles.map((file) => ({
      id: makeId('img'),
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      albumId: resolvedAlbumId
    }))

    addImages(newImages)
    setPendingFiles([])
    navigate({ to: '/gallery', search: { album: resolvedAlbumId } })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    acceptFiles(filterImageFiles(e.dataTransfer.files))
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setDragOver(false)
  }

  function handleBrowse() {
    fileInputRef.current?.click()
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    acceptFiles(filterImageFiles(e.target.files))
    e.target.value = ''
  }

  return (
    <div className="relative flex h-full flex-col">
      <FileImportDialog
        open={fileDialogOpen}
        onOpenChange={setFileDialogOpen}
        albums={albums}
        onConfirm={handleFileImportConfirm}
      />

      <TopBar title="Import" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-8">
          <h1 className="mb-1 text-2xl">Import Images</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Drag and drop images or browse to select files.
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex max-w-xl flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed px-6 py-16 transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground/40'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Drop images here</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleBrowse}>
            Browse Files
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>

      <div className="absolute bottom-4 right-4 w-72 space-y-2">
        {errorToast && (
          <ToastCard
            variant="warning"
            title={errorToast.title}
            description={errorToast.description}
            onDismiss={() => setErrorToast(null)}
          />
        )}
      </div>
    </div>
  )
}
