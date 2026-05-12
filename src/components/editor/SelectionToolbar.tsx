import { ChevronUp, ChevronDown, Trash2, Crop, X, Check, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  x: number
  y: number
  showStackingControls: boolean
  isCropping: boolean
  hasCrop: boolean
  onBringForward: () => void
  onSendBackward: () => void
  onDelete: () => void
  onCropStart: () => void
  onCropCancel: () => void
  onCropReset: () => void
  onCropConfirm: () => void
}

export default function SelectionToolbar({
  x,
  y,
  showStackingControls,
  isCropping,
  hasCrop,
  onBringForward,
  onSendBackward,
  onDelete,
  onCropStart,
  onCropCancel,
  onCropReset,
  onCropConfirm
}: Props) {
  return (
    <div
      className="pointer-events-auto absolute z-10 flex items-center gap-1 rounded-md border border-border bg-card px-1 py-1 shadow-lg"
      style={{ left: x, top: y, transform: 'translate(-50%, -100%)' }}
    >
      {isCropping ? (
        <>
          <Button variant="ghost" size="icon-2xs" onClick={onCropCancel} title="Cancel crop">
            <X size={14} />
          </Button>
          <Button variant="ghost" size="icon-2xs" onClick={onCropReset} title="Reset crop" disabled={!hasCrop}>
            <RotateCcw size={14} />
          </Button>
          <Button variant="ghost" size="icon-2xs" className="text-primary hover:bg-primary/10 hover:text-primary" onClick={onCropConfirm} title="Apply crop">
            <Check size={14} />
          </Button>
        </>
      ) : (
        <>
          {showStackingControls && (
            <>
              <Button variant="ghost" size="icon-2xs" onClick={onBringForward} title="Bring forward">
                <ChevronUp size={14} />
              </Button>
              <Button variant="ghost" size="icon-2xs" onClick={onSendBackward} title="Send backward">
                <ChevronDown size={14} />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon-2xs" onClick={onCropStart} title="Crop">
            <Crop size={14} />
          </Button>
          <Button variant="ghost" size="icon-2xs" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={onDelete} title="Delete">
            <Trash2 size={14} />
          </Button>
        </>
      )}
    </div>
  )
}
