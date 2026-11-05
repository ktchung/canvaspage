import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import type { Album } from '@/store'

interface RenameAlbumDialogProps {
  album: Album | null
  onConfirm: (name: string) => void
  onCancel: () => void
}

export default function RenameAlbumDialog({ album, onConfirm, onCancel }: RenameAlbumDialogProps) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (album) setName(album.name)
  }, [album])

  const trimmed = name.trim()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (trimmed) onConfirm(trimmed)
  }

  return (
    <Dialog open={album !== null} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent className="max-w-sm" aria-describedby={undefined}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Rename Album</DialogTitle>
          </DialogHeader>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Album name"
            aria-label="Album name"
            autoFocus
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!trimmed}>
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
