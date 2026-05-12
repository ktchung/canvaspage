import { Minus, Plus, Minimize } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  zoom: number
  canZoomIn: boolean
  canZoomOut: boolean
  showFit: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onFit: () => void
}

export default function ZoomControls({
  zoom,
  canZoomIn,
  canZoomOut,
  showFit,
  onZoomIn,
  onZoomOut,
  onFit
}: Props) {
  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 flex items-center gap-1 rounded-full border border-border bg-card/90 px-1.5 py-1 shadow-lg backdrop-blur">
      {showFit && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onFit}
          className="rounded-full"
          title="Reset zoom"
        >
          <Minimize className="size-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={!canZoomOut}
        onClick={onZoomOut}
        className="rounded-full"
        title="Zoom out"
      >
        <Minus className="size-4" />
      </Button>
      <span className="min-w-[44px] text-center text-xs tabular-nums text-muted-foreground">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={!canZoomIn}
        onClick={onZoomIn}
        className="rounded-full"
        title="Zoom in"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  )
}
