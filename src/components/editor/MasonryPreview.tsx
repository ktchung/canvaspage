import { A4_W, A4_H, masonryMetrics } from '@/store'

interface Props {
  cols: number
  marginH: number
  marginV: number
  gridGap: number
}

export default function MasonryPreview({ cols, marginH, marginV, gridGap }: Props) {
  const m = masonryMetrics({
    autoAlign: 'masonry',
    gridRows: 1,
    gridCols: cols,
    marginH,
    marginV,
    gridGap
  })
  const degenerate = m.colW <= 0 || m.usableH <= 0

  const bands: number[] = []
  if (!degenerate) {
    for (let c = 0; c < cols; c++) bands.push(c)
  }

  return (
    <div className="aspect-[794/1123] max-h-[280px] rounded-md bg-neutral-900 p-3">
      <div className="relative h-full w-full">
        {degenerate ? (
          <div className="flex h-full w-full items-center justify-center text-center text-[11px] text-muted-foreground">
            Margins or gap too large for layout
          </div>
        ) : (
          bands.map((c) => (
            <div
              key={c}
              className="absolute rounded-[2px] bg-primary/30 ring-1 ring-primary/50"
              style={{
                left: `${(m.originX(c) / A4_W) * 100}%`,
                top: `${(m.marginV / A4_H) * 100}%`,
                width: `${(m.colW / A4_W) * 100}%`,
                height: `${(m.usableH / A4_H) * 100}%`
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}
