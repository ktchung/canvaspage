import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, LayoutGrid, Columns3 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import ToastCard from '@/components/shared/ToastCard'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import type { AutoAlignMode } from '@/store'
import GridPreview from './GridPreview'
import MasonryPreview from './MasonryPreview'

interface Props {
  pageId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FieldResult {
  value: number
  error: string | null
}

function validate(raw: string, min: number, max: number): FieldResult {
  const trimmed = raw.trim()
  if (trimmed === '') return { value: min, error: `Must be ${min}-${max}` }
  const n = Number(trimmed)
  if (!Number.isFinite(n)) return { value: min, error: 'Must be a number' }
  if (!Number.isInteger(n)) return { value: min, error: 'Must be a whole number' }
  if (n < min || n > max) return { value: min, error: `Must be ${min}-${max}` }
  return { value: n, error: null }
}

const MODES: Array<{ value: AutoAlignMode; label: string }> = [
  { value: 'off', label: 'Off' },
  { value: 'grid', label: 'Grid' },
  { value: 'masonry', label: 'Masonry' }
]

export default function PageSettingsDialog({ pageId, open, onOpenChange }: Props) {
  const page = useAppStore((s) => s.pages.find((p) => p.id === pageId) ?? null)
  const updatePageSettings = useAppStore((s) => s.updatePageSettings)

  const [autoAlign, setAutoAlign] = useState<AutoAlignMode>('off')
  const [rows, setRows] = useState('2')
  const [cols, setCols] = useState('2')
  const [marginH, setMarginH] = useState('24')
  const [marginV, setMarginV] = useState('24')
  const [gridGap, setGridGap] = useState('12')

  useEffect(() => {
    if (open && page) {
      setAutoAlign(page.settings.autoAlign)
      setRows(String(page.settings.gridRows))
      setCols(String(page.settings.gridCols))
      setMarginH(String(page.settings.marginH ?? 24))
      setMarginV(String(page.settings.marginV ?? 24))
      setGridGap(String(page.settings.gridGap ?? 12))
    }
  }, [open, page?.id])

  const rowsR = useMemo(() => validate(rows, 1, 12), [rows])
  const colsR = useMemo(() => validate(cols, 1, 12), [cols])
  const marginHR = useMemo(() => validate(marginH, 0, 200), [marginH])
  const marginVR = useMemo(() => validate(marginV, 0, 200), [marginV])
  const gridGapR = useMemo(() => validate(gridGap, 0, 200), [gridGap])

  const hasError =
    !!colsR.error || !!marginHR.error || !!marginVR.error || !!gridGapR.error
  const hasGridError = hasError || !!rowsR.error

  const canApply =
    autoAlign === 'off'
      ? true
      : autoAlign === 'grid'
        ? !hasGridError
        : !hasError

  const apply = () => {
    if (!pageId || !canApply) return
    const res = updatePageSettings(pageId, {
      autoAlign,
      gridRows: rowsR.value,
      gridCols: colsR.value,
      marginH: marginHR.value,
      marginV: marginVR.value,
      gridGap: gridGapR.value
    })
    if (res.dropped > 0) {
      const count = res.dropped
      toast.custom((id) => (
        <ToastCard
          icon={
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10">
              <AlertCircle size={14} className="text-destructive" />
            </div>
          }
          title={`${count} image${count > 1 ? 's' : ''} removed`}
          description="Exceeded layout capacity."
          onDismiss={() => toast.dismiss(id)}
        />
      ))
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-auto">
        <DialogHeader>
          <DialogTitle>Page Settings</DialogTitle>
        </DialogHeader>

        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="flex-1">
            <div className="text-sm font-medium">Auto-align Images</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Snap assets to a grid or pack them into masonry columns
            </div>
          </div>
          <div className="inline-flex rounded-md border border-input bg-background p-0.5">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setAutoAlign(m.value)}
                className={cn(
                  'rounded px-3 py-1 text-xs font-medium transition-colors',
                  autoAlign === m.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {autoAlign === 'grid' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-widest text-accent-foreground">
              <LayoutGrid size={14} />
              GRID LAYOUT CONFIGURATION
            </div>
            <div className="grid grid-cols-[180px_1fr] gap-6">
              <div className="flex flex-col gap-3">
                <NumericField
                  label="ROWS COUNT"
                  value={rows}
                  onChange={setRows}
                  min={1}
                  max={12}
                  error={rowsR.error}
                />
                <NumericField
                  label="COLUMNS COUNT"
                  value={cols}
                  onChange={setCols}
                  min={1}
                  max={12}
                  error={colsR.error}
                />
                <div className="flex flex-row gap-3">
                  <NumericField
                    label="MARGIN ⇆ (pt)"
                    value={marginH}
                    onChange={setMarginH}
                    min={0}
                    max={200}
                    error={marginHR.error}
                  />
                  <NumericField
                    label="MARGIN ⇅ (pt)"
                    value={marginV}
                    onChange={setMarginV}
                    min={0}
                    max={200}
                    error={marginVR.error}
                  />
                </div>
                <NumericField
                  label="CELL GAP (pt)"
                  value={gridGap}
                  onChange={setGridGap}
                  min={0}
                  max={200}
                  error={gridGapR.error}
                />
              </div>
              <div className="flex justify-center">
                <GridPreview
                  rows={rowsR.value}
                  cols={colsR.value}
                  marginH={marginHR.value}
                  marginV={marginVR.value}
                  gridGap={gridGapR.value}
                />
              </div>
            </div>
          </div>
        )}

        {autoAlign === 'masonry' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-widest text-accent-foreground">
              <Columns3 size={14} />
              MASONRY CONFIGURATION
            </div>
            <div className="grid grid-cols-[180px_1fr] gap-6">
              <div className="flex flex-col gap-3">
                <NumericField
                  label="COLUMNS COUNT"
                  value={cols}
                  onChange={setCols}
                  min={1}
                  max={12}
                  error={colsR.error}
                />
                <div className="flex flex-row gap-3">
                  <NumericField
                    label="MARGIN ⇆ (pt)"
                    value={marginH}
                    onChange={setMarginH}
                    min={0}
                    max={200}
                    error={marginHR.error}
                  />
                  <NumericField
                    label="MARGIN ⇅ (pt)"
                    value={marginV}
                    onChange={setMarginV}
                    min={0}
                    max={200}
                    error={marginVR.error}
                  />
                </div>
                <NumericField
                  label="CELL GAP (pt)"
                  value={gridGap}
                  onChange={setGridGap}
                  min={0}
                  max={200}
                  error={gridGapR.error}
                />
              </div>
              <div className="flex justify-center">
                <MasonryPreview
                  cols={colsR.value}
                  marginH={marginHR.value}
                  marginV={marginVR.value}
                  gridGap={gridGapR.value}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={apply} disabled={!canApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface NumericFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  min: number
  max: number
  error: string | null
}

function NumericField({ label, value, onChange, min, max, error }: NumericFieldProps) {
  return (
    <div className="flex-1">
      <label className="mb-1 block text-[10px] font-semibold tracking-widest text-muted-foreground">
        {label}
      </label>
      <Input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="mt-1 h-2 text-[11px] leading-2 text-destructive">{error ?? ''}</div>
    </div>
  )
}
