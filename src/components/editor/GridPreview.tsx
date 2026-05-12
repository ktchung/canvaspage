import { A4_W, A4_H, cellMetrics } from '@/store'

interface Props {
  rows: number
  cols: number
  marginH: number
  marginV: number
  gridGap: number
}

export default function GridPreview({ rows, cols, marginH, marginV, gridGap }: Props) {
  const m = cellMetrics({
    autoAlign: 'grid',
    gridRows: rows,
    gridCols: cols,
    marginH,
    marginV,
    gridGap
  })
  const degenerate = m.cellW <= 0 || m.cellH <= 0

  const cells: { r: number; c: number }[] = []
  if (!degenerate) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({ r, c })
      }
    }
  }

  return (
    <div className="aspect-[794/1123] max-h-[280px] rounded-md bg-neutral-900 p-3">
      <div className="relative h-full w-full">
        {degenerate ? (
          <div className="flex h-full w-full items-center justify-center text-center text-[11px] text-muted-foreground">
            Margins or gap too large for grid
          </div>
        ) : (
          cells.map(({ r, c }) => (
            <div
              key={`${r}-${c}`}
              className="absolute rounded-[2px] bg-primary/30 ring-1 ring-primary/50"
              style={{
                left: `${(m.originX(c) / A4_W) * 100}%`,
                top: `${(m.originY(r) / A4_H) * 100}%`,
                width: `${(m.cellW / A4_W) * 100}%`,
                height: `${(m.cellH / A4_H) * 100}%`
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}
