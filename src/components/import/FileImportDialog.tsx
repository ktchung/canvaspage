import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import AlbumSelector from './AlbumSelector'
import type { AlbumMode } from './AlbumSelector'
import type { Album } from '@/store'

interface FileImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  albums: Album[]
  onConfirm: (albumId: string | null, newAlbumName: string | null) => void
}

export default function FileImportDialog({
  open,
  onOpenChange,
  albums,
  onConfirm
}: FileImportDialogProps) {
  const [mode, setMode] = useState<AlbumMode>(() => albums.length === 0 ? 'new' : 'existing')
  const [selectedAlbumId, setSelectedAlbumId] = useState(albums[0]?.id ?? '')
  const [newAlbumName, setNewAlbumName] = useState('')

  useEffect(() => {
    if (open) {
      setNewAlbumName('')
      setMode(albums.length === 0 ? 'new' : 'existing')
    }
  }, [open])

  const isConfirmDisabled =
    (mode === 'existing' && !selectedAlbumId) ||
    (mode === 'new' && !newAlbumName.trim())

  function handleConfirm() {
    if (isConfirmDisabled) return
    if (mode === 'existing') {
      onConfirm(selectedAlbumId, null)
    } else {
      onConfirm(null, newAlbumName.trim())
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Import to Album</DialogTitle>
        </DialogHeader>

        <AlbumSelector
          albums={albums}
          selectedAlbumId={selectedAlbumId}
          onAlbumIdChange={setSelectedAlbumId}
          newAlbumName={newAlbumName}
          onNewAlbumNameChange={setNewAlbumName}
          mode={mode}
          onModeChange={setMode}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirmDisabled}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
