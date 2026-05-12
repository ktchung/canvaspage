import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'

interface DeleteConfirmDialogProps {
  open: boolean
  count: number
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmDialog({
  open,
  count,
  onConfirm,
  onCancel
}: DeleteConfirmDialogProps) {
  const plural = count > 1 ? 's' : ''

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Image{plural}</DialogTitle>
          <DialogDescription>
            This will permanently remove {count} image{plural} from the gallery and all canvas pages.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
